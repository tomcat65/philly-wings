// Cloud Functions for platform menu publishing
const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Import refactored platform modules
const { generateDoorDashHTML } = require('./lib/platforms/doordash');

try {
  admin.initializeApp();
} catch (e) {}

const db = admin.firestore();
const storage = admin.storage();

/**
 * HTTP Function: platformMenu
 * Serves professional platform-specific menu pages using refactored modular code
 */
exports.platformMenu = functions.https.onRequest(async (req, res) => {
  try {
    // Extract platform from subdomain or query parameter
    const platform = extractPlatform(req);

    if (!platform || !['doordash', 'ubereats', 'grubhub'].includes(platform)) {
      return res.status(400).send('Invalid platform. Use: doordash, ubereats, or grubhub');
    }

    // Set CORS headers for public access
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Cache-Control', 'public, max-age=300, s-maxage=600'); // 5 min cache, 10 min CDN
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('X-Frame-Options', 'DENY');

    // Fetch complete menu data from Firestore
    const menuData = await fetchCompleteMenu();

    // Apply platform-specific pricing and branding
    const platformMenu = processPlatformMenu(menuData, platform);

    // Generate complete HTML response using refactored modules
    let html;
    if (platform === 'doordash') {
      html = generateDoorDashHTML(platformMenu, menuData.settings);
    } else {
      // TODO: Add refactored modules for other platforms
      return res.status(501).send(`${platform} platform not yet refactored. Currently only DoorDash uses the new modular system.`);
    }

    res.set('Content-Type', 'text/html; charset=utf-8');
    res.send(html);

  } catch (error) {
    console.error('Error generating platform menu:', error);
    res.status(500).send('Internal server error');
  }
});

/**
 * Extract platform from request
 */
function extractPlatform(req) {
  // Try query parameter first
  if (req.query.platform) {
    return req.query.platform.toLowerCase();
  }

  // Try subdomain extraction
  const host = req.get('host') || '';
  if (host.includes('doordash')) return 'doordash';
  if (host.includes('ubereats')) return 'ubereats';
  if (host.includes('grubhub')) return 'grubhub';

  return null;
}

/**
 * Fetch complete menu data from Firestore
 */
async function fetchCompleteMenu() {
  console.log('Fetching menu data from Firestore...');

  try {
    // Parallel fetch for optimal performance - match original structure
    const [menuItemsSnapshot, combosSnapshot, saucesSnapshot, settingsDoc] = await Promise.all([
      db.collection('menuItems').get(),
      db.collection('combos').get(),
      db.collection('sauces').get(),
      db.collection('settings').doc('main').get()
    ]);

    // Parse menuItems by their id field - exactly like original
    const menuItems = {};
    menuItemsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.id) {
        menuItems[data.id] = data;
      }
    });


    return {
      wings: menuItems.wings || { variants: [] },
      fries: menuItems.fries || { variants: [] },
      mozzarella: menuItems.mozzarella_sticks || { variants: [] },
      drinks: menuItems.drinks || { variants: [] },
      combos: combosSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => {
          // Sort by wing count (ascending: least to most wings)
          // Extract wing count from description or use predefined mapping
          function getWingCount(combo) {
            if (combo.wingCount) return combo.wingCount;

            // Extract from description (e.g., "12 wings (2 sauces)")
            const match = combo.description?.match(/(\d+)\s+wings?/i);
            if (match) return parseInt(match[1]);

            // Fallback mapping by name
            const name = combo.name?.toLowerCase() || '';
            if (name.includes('sampler')) return 6;
            if (name.includes('mvp')) return 12;
            if (name.includes('tailgater')) return 24;
            if (name.includes('game day 30')) return 30;
            if (name.includes('party pack 50')) return 50;

            return 0;
          }

          const aWings = getWingCount(a);
          const bWings = getWingCount(b);
          return aWings - bWings;
        }),
      sauces: saucesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
      settings: settingsDoc.exists ? settingsDoc.data() : {}
    };
  } catch (error) {
    console.error('Error fetching menu data:', error);
    throw new Error('Failed to fetch menu data from Firestore');
  }
}

/**
 * Process platform-specific menu data
 */
function processPlatformMenu(menuData, platform) {
  const platformMultipliers = {
    'doordash': 1.35,
    'ubereats': 1.35,
    'grubhub': 1.215
  };

  const multiplier = platformMultipliers[platform] || 1.35;

  // Apply platform-specific pricing to all items
  const processedMenu = {
    ...menuData,
    markupPercentage: Math.round((multiplier - 1) * 100)
  };

  // Apply pricing to wings - use pre-calculated platform pricing from Firestore
  if (processedMenu.wings && processedMenu.wings.variants) {
    processedMenu.wings.variants = processedMenu.wings.variants.map(wing => {
      // Use pre-calculated platform pricing if available, otherwise calculate from base price
      let platformPrice;
      if (wing.platformPricing && wing.platformPricing[platform]) {
        platformPrice = parseFloat(wing.platformPricing[platform]);
      } else {
        // Fallback to calculation if no pre-stored platform pricing
        platformPrice = parseFloat(((wing.basePrice || wing.price) * multiplier).toFixed(2));
      }

      return {
        ...wing,
        basePrice: wing.basePrice || wing.price,
        platformPrice: platformPrice
      };
    });
  }

  // Apply pricing to combos with proper savings calculation
  if (processedMenu.combos) {
    processedMenu.combos = processedMenu.combos.map(combo => ({
      ...combo,
      basePrice: combo.basePrice || combo.price,
      platformPrice: (combo.basePrice * multiplier).toFixed(2),
      markupAmount: ((combo.basePrice * multiplier) - combo.basePrice).toFixed(2),
      savings: combo.savings || '15%', // Use Firestore savings or default
      description: combo.description || `${combo.name} - A perfect meal combination`
    }));
  }

  // Apply pricing to beverages - handle variants structure
  if (processedMenu.drinks && processedMenu.drinks.variants) {
    processedMenu.beverages = processedMenu.drinks.variants.map(beverage => ({
      ...beverage,
      basePrice: beverage.basePrice || beverage.price,
      platformPrice: parseFloat(((beverage.basePrice || beverage.price) * multiplier).toFixed(2))
    }));
  }

  // Apply pricing to sides - process fries and mozzarella variants
  const sides = [];

  // Process fries variants
  if (processedMenu.fries?.variants) {
    processedMenu.fries.variants.forEach(side => {
      sides.push({
        ...side,
        category: 'fries',
        basePrice: side.basePrice || side.price,
        platformPrice: parseFloat(((side.basePrice || side.price) * multiplier).toFixed(2)),
        markupAmount: parseFloat((((side.basePrice || side.price) * multiplier) - (side.basePrice || side.price)).toFixed(2))
      });
    });
  }

  // Process mozzarella variants
  if (processedMenu.mozzarella?.variants) {
    processedMenu.mozzarella.variants.forEach(side => {
      sides.push({
        ...side,
        category: 'mozzarella-sticks',
        basePrice: side.basePrice || side.price,
        platformPrice: parseFloat(((side.basePrice || side.price) * multiplier).toFixed(2)),
        markupAmount: parseFloat((((side.basePrice || side.price) * multiplier) - (side.basePrice || side.price)).toFixed(2))
      });
    });
  }

  processedMenu.sides = sides;

  return processedMenu;
}

/**
 * Callable: publishPlatformMenu
 * For publishing menu snapshots to storage
 */
exports.publishPlatformMenu = functions.https.onCall(async (data, context) => {
  try {
    const { platform, snapshot } = data;

    if (!platform || !snapshot) {
      throw new functions.https.HttpsError('invalid-argument', 'Platform and snapshot are required');
    }

    const timestamp = new Date().toISOString();
    const filename = `${timestamp}.json`;

    // Write to Storage
    const bucket = storage.bucket();
    const file = bucket.file(`platform-menus/${platform}/${filename}`);
    const latestFile = bucket.file(`platform-menus/${platform}/latest.json`);

    await Promise.all([
      file.save(JSON.stringify(snapshot, null, 2)),
      latestFile.save(JSON.stringify(snapshot, null, 2))
    ]);

    // Write metadata to Firestore
    const docId = `${platform}_${Date.now()}`;
    await db.collection('publishedMenus').doc(docId).set({
      platform,
      timestamp,
      filename,
      itemCount: {
        combos: snapshot.combos?.length || 0,
        wings: snapshot.wings?.length || 0,
        beverages: snapshot.beverages?.length || 0,
        sauces: snapshot.sauces?.length || 0
      }
    });

    return {
      success: true,
      platform,
      timestamp,
      filename,
      message: `Menu published successfully for ${platform}`
    };

  } catch (error) {
    console.error('Error publishing menu:', error);
    throw new functions.https.HttpsError('internal', 'Failed to publish menu');
  }
});