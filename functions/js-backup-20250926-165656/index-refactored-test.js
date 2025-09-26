/**
 * Refactored Firebase Functions - Clean, modular architecture
 * Main entry point with clear separation of concerns
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin
try {
  admin.initializeApp();
} catch (e) {
  // Already initialized
}

// Import core modules
const { fetchCompleteMenu, saveMenuMetadata } = require('./lib/core/firestore');
const { saveMenuToStorage } = require('./lib/core/storage');
const { extractPlatform } = require('./lib/core/utils');
const { processPlatformMenu } = require('./lib/data/pricingEngine');

// Import platform-specific generators (will be created in Phase 2)
const { generateDoorDashHTML } = require('./lib/platforms/doordash');
const { generateUberEatsHTML } = require('./lib/platforms/ubereats');
const { generateGrubHubHTML } = require('./lib/platforms/grubhub');

/**
 * HTTP Function: platformMenu
 * Serves professional platform-specific menu pages
 * Clean, focused implementation with proper error handling
 */
exports.platformMenu = functions.https.onRequest(async (req, res) => {
  try {
    // Extract and validate platform
    const platform = extractPlatform(req);
    if (!platform || !['doordash', 'ubereats', 'grubhub'].includes(platform)) {
      return res.status(400).send('Invalid platform. Use: doordash, ubereats, or grubhub');
    }

    console.log(`> Generating ${platform} menu...`);

    // Set response headers
    res.set({
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=300, s-maxage=600',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Content-Type': 'text/html; charset=utf-8'
    });

    // Fetch and process menu data
    const menuData = await fetchCompleteMenu();
    const platformMenu = processPlatformMenu(menuData, platform);

    // Generate platform-specific HTML
    let html;
    switch (platform) {
      case 'doordash':
        html = generateDoorDashHTML(platformMenu, menuData.settings);
        break;
      case 'ubereats':
        html = generateUberEatsHTML(platformMenu, menuData.settings);
        break;
      case 'grubhub':
        html = generateGrubHubHTML(platformMenu, menuData.settings);
        break;
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }

    res.send(html);
    console.log(`✓ ${platform} menu generated successfully`);

  } catch (error) {
    console.error('Error generating platform menu:', error);
    res.status(500).send(`
      <html>
        <head><title>Menu Unavailable</title></head>
        <body>
          <h1>Menu Temporarily Unavailable</h1>
          <p>We're working to restore service. Please try again in a few minutes.</p>
          <p>Error ID: ${Date.now()}</p>
        </body>
      </html>
    `);
  }
});

/**
 * Callable Function: publishPlatformMenu
 * Publishes menu data to Storage and saves metadata to Firestore
 */
exports.publishPlatformMenu = functions.https.onCall(async (data, context) => {
  try {
    // Validate input
    const { platform, snapshot } = data;
    if (!platform || !snapshot) {
      throw new functions.https.HttpsError('invalid-argument', 'Platform and snapshot are required');
    }

    if (!['doordash', 'ubereats', 'grubhub'].includes(platform)) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid platform specified');
    }

    console.log(`> Publishing ${platform} menu...`);

    // Save to Storage
    const storageUrl = await saveMenuToStorage(platform, snapshot);

    // Save metadata to Firestore
    const metadata = {
      platform,
      storageUrl,
      itemCount: Object.keys(snapshot).length,
      version: snapshot.version || '1.0.0'
    };

    const docId = await saveMenuMetadata(metadata);

    console.log(`✓ ${platform} menu published successfully`);

    return {
      success: true,
      docId,
      storageUrl,
      platform,
      publishedAt: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error publishing menu:', error);

    if (error instanceof functions.https.HttpsError) {
      throw error;
    }

    throw new functions.https.HttpsError('internal', 'Failed to publish menu');
  }
});