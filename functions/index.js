// Cloud Functions for platform menu publishing
const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Import refactored platform modules
const { generateDoorDashHTML } = require('./lib/platforms/doordash');
const { generateUberEatsHTML } = require('./lib/platforms/ubereats');
const { generateGrubHubHTML } = require('./lib/platforms/grubhub');

try {
  admin.initializeApp();
} catch (e) {}

const db = admin.firestore();
const storage = admin.storage();
// Optional robust Firestore fetch as fallback
let fetchCoreCompleteMenu;
try {
  ({ fetchCompleteMenu: fetchCoreCompleteMenu } = require('./lib/core/firestore'));
} catch (e) {
  // fallback not available
}

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
    } else if (platform === 'ubereats') {
      html = generateUberEatsHTML(platformMenu, menuData.settings);
    } else if (platform === 'grubhub') {
      html = generateGrubHubHTML(platformMenu, menuData.settings);
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
  // 1) Query parameter
  if (req.query.platform) {
    return String(req.query.platform).toLowerCase();
  }

  // 2) Path pattern: /platform/:platform
  const path = req.path || req.originalUrl || '';
  const pathMatch = path.match(/\/platform\/(doordash|ubereats|grubhub)(\b|\/|\?|#|$)/i);
  if (pathMatch) {
    return pathMatch[1].toLowerCase();
  }

  // 3) Subdomain extraction via host headers
  const host = (req.get('x-forwarded-host') || req.get('host') || '').toLowerCase();
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


    let assembled = {
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

    // If critical sections are empty, attempt robust fallback fetch
    const missingWings = !assembled.wings?.variants?.length;
    const missingFries = !assembled.fries?.variants?.length;
    const missingMozz = !assembled.mozzarella?.variants?.length;
    const missingDrinks = !assembled.drinks?.variants?.length;
    const missingCombos = !assembled.combos?.length;

    if ((missingWings && missingFries && missingMozz) || missingCombos) {
      if (typeof fetchCoreCompleteMenu === 'function') {
        console.warn('[menu] Falling back to core Firestore fetcher due to missing sections');
        const core = await fetchCoreCompleteMenu();
        // Normalize core shape to this module's expected structure
        assembled = {
          wings: { variants: core.wings || [] },
          fries: { variants: (core.sides && core.sides.fries) || [] },
          mozzarella: { variants: (core.sides && core.sides.mozzarella) || [] },
          drinks: { variants: core.beverages || [] },
          combos: core.combos || [],
          sauces: core.sauces || [],
          settings: core.settings || {}
        };
      } else {
        console.warn('[menu] Core fetcher not available; continuing with assembled data');
      }
    }

    console.log('[menu] Data counts (pre-fallback)', {
      wings: assembled.wings?.variants?.length || 0,
      fries: assembled.fries?.variants?.length || 0,
      mozzarella: assembled.mozzarella?.variants?.length || 0,
      drinks: assembled.drinks?.variants?.length || 0,
      combos: assembled.combos?.length || 0,
      sauces: assembled.sauces?.length || 0
    });

    // Final local fallbacks to ensure sections render in emulator/dev
    try {
      const fs = require('fs');
      const path = require('path');

      // Wings fallback from repo menu-items.json (project root)
      if (!assembled.wings?.variants?.length) {
        let wingsJsonPath = path.resolve(__dirname, '..', 'menu-items.json');
        if (fs.existsSync(wingsJsonPath)) {
          const raw = fs.readFileSync(wingsJsonPath, 'utf-8');
          const parsed = JSON.parse(raw);
          const variants = (parsed?.wings?.variants || []).map(v => ({
            ...v,
            type: /boneless/i.test(v.name) ? 'boneless' : 'bone-in'
          }));
          // If none tagged boneless, duplicate set as boneless for display balance
          const hasBoneless = variants.some(v => v.type === 'boneless');
          if (!hasBoneless && variants.length) {
            const dup = variants.map(v => ({
              ...v,
              id: (v.id || 'wings') + '_boneless',
              name: (v.name || 'Wings') + ' (Boneless)',
              type: 'boneless'
            }));
            assembled.wings = { variants: variants.concat(dup) };
          } else {
            assembled.wings = { variants };
          }
        }
      }

      // Minimal sauces fallback if empty
      if (!assembled.sauces?.length) {
        assembled.sauces = [
          { id: 'lemon-pepper', name: 'Lemon Pepper', category: 'dry-rub', heatLevel: 1 },
          { id: 'garlic-parm', name: 'Garlic Parmesan', category: 'signature-sauce', heatLevel: 1 },
          { id: 'hot', name: 'Classic Hot', category: 'signature-sauce', heatLevel: 3 },
          { id: 'bbq', name: 'Smoky BBQ', category: 'signature-sauce', heatLevel: 1 },
          { id: 'cajun', name: 'Cajun Rub', category: 'dry-rub', heatLevel: 2 }
        ];
      }

      // Minimal beverages fallback if empty
      if (!assembled.drinks?.variants?.length) {
        assembled.drinks = {
          variants: [
            { id: 'beverage_coke_can', name: 'Coke (12 oz)', description: 'Ice-cold can of Coca-Cola', basePrice: 1.49 },
            { id: 'beverage_sprite_can', name: 'Sprite (12 oz)', description: 'Crisp lemon-lime soda', basePrice: 1.49 },
            { id: 'beverage_diet_coke_can', name: 'Diet Coke (12 oz)', description: 'Zero sugar classic', basePrice: 1.49 },
            { id: 'beverage_water', name: 'Bottled Water', description: '16.9 oz spring water', basePrice: 1.25 }
          ]
        };
      }

      // Simple combos fallback if none present (derive from wings + fries if possible)
      if (!assembled.combos?.length && assembled.wings?.variants?.length) {
        const ddMultiplier = 1.35;
        const wings12 = assembled.wings.variants.find(v => /12\b/.test(v.name || '')) || assembled.wings.variants[0];
        const wings24 = assembled.wings.variants.find(v => /24\b/.test(v.name || '')) || assembled.wings.variants[0];
        function toBase(p) { const n = typeof p === 'number' ? p : parseFloat(p); return n && n > 0 ? parseFloat((n / ddMultiplier).toFixed(2)) : (wings12?.basePrice || 0); }
        const c = [];
        if (wings12) {
          c.push({ id: 'combo_mvp', name: 'MVP Combo (12 Wings + Fries)', description: '12 wings, fries, and sauces', basePrice: toBase(wings12.platformPrice || wings12.price || wings12.basePrice), items: ['12 - wings', 'fries'] });
        }
        if (wings24) {
          c.push({ id: 'combo_tailgater', name: 'Tailgater (24 Wings + Fries)', description: '24 wings, fries, and sauces', basePrice: toBase(wings24.platformPrice || wings24.price || wings24.basePrice), items: ['24 - wings', 'fries'] });
        }
        assembled.combos = c;
      }
    } catch (e) {
      console.warn('[menu] Local fallback failed:', e?.message || e);
    }

    console.log('[menu] Data counts (final)', {
      wings: assembled.wings?.variants?.length || 0,
      fries: assembled.fries?.variants?.length || 0,
      mozzarella: assembled.mozzarella?.variants?.length || 0,
      drinks: assembled.drinks?.variants?.length || 0,
      combos: assembled.combos?.length || 0,
      sauces: assembled.sauces?.length || 0
    });

    return assembled;
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
        platformPrice: platformPrice,
        // Ensure type exists for rendering (boneless/bone-in)
        type: wing.type || (/boneless/i.test(wing.name || '') ? 'boneless' : 'bone-in')
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

    // Build public download URLs (tokenless media endpoints)
    const bucketName = bucket.name;
    const objectPath = `platform-menus/${platform}/${filename}`;
    const latestPath = `platform-menus/${platform}/latest.json`;
    const versionedUrl = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(objectPath)}?alt=media`;
    const latestUrl = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(latestPath)}?alt=media`;

    // Write metadata to Firestore
    const docId = `${platform}_${Date.now()}`;
    await db.collection('publishedMenus').doc(docId).set({
      platform,
      timestamp,
      filename,
      storage: {
        bucket: bucketName,
        path: objectPath,
        latestPath,
        versionedUrl,
        latestUrl
      },
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
      versionedUrl,
      latestUrl,
      message: `Menu published successfully for ${platform}`
    };

  } catch (error) {
    console.error('Error publishing menu:', error);
    throw new functions.https.HttpsError('internal', 'Failed to publish menu');
  }
});
