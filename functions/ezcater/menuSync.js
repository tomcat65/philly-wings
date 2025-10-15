/**
 * ezCater Menu API Sync
 * Pushes catering packages from Firestore to ezCater platform
 */

const admin = require('firebase-admin');
const axios = require('axios');

/**
 * Sync catering menu to ezCater
 * @param {Object} config - Firebase Functions config with ezCater credentials
 * @returns {Promise<Object>} Sync result
 */
async function syncMenuToEzCater(config) {
  const db = admin.firestore();

  console.log('🔄 Starting ezCater menu sync...');

  try {
    // Get API credentials from Firebase config
    const apiToken = config.ezcater?.api_token;
    const apiUrl = config.ezcater?.api_url || 'https://api.ezcater.com/api/v3';

    if (!apiToken) {
      throw new Error('ezCater API token not configured. Run: firebase functions:config:set ezcater.api_token="YOUR_TOKEN"');
    }

    // Fetch all active catering packages from Firestore
    const packagesSnapshot = await db.collection('cateringPackages')
      .where('active', '==', true)
      .orderBy('tier')
      .orderBy('basePrice')
      .get();

    if (packagesSnapshot.empty) {
      throw new Error('No active catering packages found in Firestore');
    }

    const packages = packagesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log(`📦 Found ${packages.length} active packages`);

    // Transform to ezCater menu format
    const ezCaterMenu = buildEzCaterMenu(packages);

    // Push to ezCater API
    const response = await axios.post(
      `${apiUrl}/menus`,
      ezCaterMenu,
      {
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 second timeout
      }
    );

    console.log('✅ Menu synced successfully to ezCater');
    console.log(`   Menu ID: ${response.data.id || 'N/A'}`);

    // Log sync success to Firestore
    await db.collection('ezCaterSyncLog').add({
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      status: 'success',
      packagesCount: packages.length,
      menuId: response.data.id,
      response: response.data,
      triggeredBy: 'manual'
    });

    return {
      success: true,
      menuId: response.data.id,
      packagesCount: packages.length
    };

  } catch (error) {
    console.error('❌ Error syncing to ezCater:', error.message);

    // Log error to Firestore
    await db.collection('ezCaterSyncLog').add({
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      status: 'error',
      error: error.message,
      errorDetails: error.response?.data || null,
      triggeredBy: 'manual'
    });

    throw error;
  }
}

/**
 * Build ezCater menu structure from Firestore packages
 * @param {Array} packages - Array of catering package objects
 * @returns {Object} ezCater menu format
 */
function buildEzCaterMenu(packages) {
  // Group packages by tier
  const tier1 = packages.filter(p => p.tier === 1);
  const tier2 = packages.filter(p => p.tier === 2);
  const tier3 = packages.filter(p => p.tier === 3);

  return {
    menu: {
      name: "Philly Wings Express Catering",
      description: "Philadelphia's Wing Specialists - 14 Signature Sauces for Your Next Event. From Oxford Circle to Your Office. Fresh, Never Frozen. Double-Fried for Ultimate Crispiness.",
      categories: [
        {
          name: "Office Lunch Packages (10-15 people)",
          description: "Perfect for team lunches and small meetings",
          items: tier1.map(transformPackageToEzCaterItem)
        },
        {
          name: "Party Packages (20-35 people)",
          description: "Ideal for office parties and game day events",
          items: tier2.map(transformPackageToEzCaterItem)
        },
        {
          name: "Large Event Packages (50-100 people)",
          description: "Perfect for company-wide events and major celebrations",
          items: tier3.map(transformPackageToEzCaterItem)
        }
      ]
    }
  };
}

/**
 * Transform Firestore package to ezCater item format
 * @param {Object} pkg - Catering package from Firestore
 * @returns {Object} ezCater item format
 */
function transformPackageToEzCaterItem(pkg) {
  // Build includes list as formatted string
  const includesText = pkg.includes.map(item => `• ${item}`).join('\n');

  return {
    name: pkg.name,
    description: `${pkg.description}\n\n**What's Included:**\n${includesText}`,
    price: pkg.basePrice,
    serves_min: pkg.servesMin,
    serves_max: pkg.servesMax,
    category_tags: [
      `Tier ${pkg.tier}`,
      pkg.marketingHook,
      pkg.popular ? 'Popular' : 'Standard'
    ],
    preparation_time_minutes: 120, // 2 hours prep time
    lead_time_hours: 24, // 24hr minimum notice (adjustable per package if needed)
    modifiers: [
      {
        name: "Sauce Selections",
        description: `Choose ${pkg.sauceSelections} sauces from our 14 signature options. More variety than any competitor!`,
        min_selections: pkg.sauceSelections,
        max_selections: pkg.sauceSelections,
        required: true,
        options: [
          { name: "Philly Classic Hot", description: "City pride - classic buffalo heat" },
          { name: "Northeast Hot Lemon", description: "Spicy lemon pepper - Oxford Circle style" },
          { name: "Broad & Pattison Burn", description: "Named for the sports complex" },
          { name: "Frankford Cajun", description: "Northeast Philly cajun seasoning" },
          { name: "Gritty's Revenge", description: "Flyers mascot - scorpion pepper heat!" },
          { name: "Honey BBQ", description: "Sweet and smoky crowd-pleaser" },
          { name: "Teriyaki", description: "Asian-inspired sweet glaze" },
          { name: "Lemon Pepper", description: "Zesty citrus seasoning" },
          { name: "Buffalo", description: "Classic tangy buffalo sauce" },
          { name: "Nashville Hot", description: "Southern-style cayenne heat" },
          { name: "BBQ", description: "Traditional smoky barbecue" },
          { name: "Mild", description: "Gentle heat for sensitive palates" },
          { name: "Garlic Parmesan", description: "Savory garlic butter coating" },
          { name: "Sweet Chili", description: "Asian sweet heat" }
        ]
      }
    ],
    dietary_info: {
      contains_gluten: pkg.composition.addons.some(a => a.ref.includes('mozzarella')),
      contains_dairy: true,
      contains_nuts: false,
      vegetarian: false,
      vegan: false
    },
    image_url: pkg.imageUrl ? `https://firebasestorage.googleapis.com/v0/b/philly-wings.appspot.com/o/${encodeURIComponent(pkg.imageUrl)}?alt=media` : null
  };
}

/**
 * On Firestore write trigger - auto-sync when packages update
 * @param {Object} change - Firestore document change
 * @param {Object} context - Function context
 */
async function onCateringPackageWrite(change, context, config) {
  console.log(`🔄 Package ${context.params.packageId} changed, triggering auto-sync...`);

  try {
    await syncMenuToEzCater(config);
    return { success: true };
  } catch (error) {
    console.error('Auto-sync failed:', error);
    // Don't throw - log error but don't fail the trigger
    return { success: false, error: error.message };
  }
}

module.exports = {
  syncMenuToEzCater,
  onCateringPackageWrite,
  transformPackageToEzCaterItem // Export for testing
};
