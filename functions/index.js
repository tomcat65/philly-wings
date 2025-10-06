// Cloud Functions for platform menu publishing
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({origin: true});

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
      bagged_tea: menuItems.bagged_tea || { variants: [] },
      boxed_iced_tea: menuItems.boxed_iced_tea || { variants: [] },
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
    const missingBaggedTea = !assembled.bagged_tea?.variants?.length;
    const missingBoxedTea = !assembled.boxed_iced_tea?.variants?.length;
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
      bagged_tea: assembled.bagged_tea?.variants?.length || 0,
      boxed_iced_tea: assembled.boxed_iced_tea?.variants?.length || 0,
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
    processedMenu.drinks.variants = processedMenu.drinks.variants.map(variant => {
      const numericBase = typeof variant.basePrice === 'number'
        ? variant.basePrice
        : parseFloat(variant.basePrice || variant.price || 0);
      const safeBase = !Number.isNaN(numericBase) && numericBase > 0 ? numericBase : 0;
      const existingPricing = variant.platformPricing || {};
      const existingPlatformPrice = existingPricing[platform];
      const computedPrice = typeof existingPlatformPrice === 'number'
        ? existingPlatformPrice
        : parseFloat(existingPlatformPrice);
      const platformPrice = !Number.isNaN(computedPrice) && computedPrice > 0
        ? parseFloat(computedPrice.toFixed(2))
        : parseFloat((safeBase * multiplier).toFixed(2));

      return {
        ...variant,
        basePrice: safeBase,
        platformPrice,
        platformPricing: {
          ...existingPricing,
          [platform]: platformPrice
        }
      };
    });

    processedMenu.beverages = processedMenu.drinks.variants.map(variant => ({
      ...variant
    }));
  }

  // Apply pricing to bagged tea variants
  if (processedMenu.bagged_tea && processedMenu.bagged_tea.variants) {
    processedMenu.bagged_tea.variants = processedMenu.bagged_tea.variants.map(variant => {
      const numericBase = typeof variant.basePrice === 'number'
        ? variant.basePrice
        : parseFloat(variant.basePrice || variant.price || 0);
      const safeBase = !Number.isNaN(numericBase) && numericBase > 0 ? numericBase : 0;
      const existingPricing = variant.platformPricing || {};
      const existingPlatformPrice = existingPricing[platform];
      const computedPrice = typeof existingPlatformPrice === 'number'
        ? existingPlatformPrice
        : parseFloat(existingPlatformPrice);
      const platformPrice = !Number.isNaN(computedPrice) && computedPrice > 0
        ? parseFloat(computedPrice.toFixed(2))
        : parseFloat((safeBase * multiplier).toFixed(2));

      return {
        ...variant,
        basePrice: safeBase,
        platformPrice,
        platformPricing: {
          ...existingPricing,
          [platform]: platformPrice
        }
      };
    });
  }

  // Apply pricing to boxed iced tea variants
  if (processedMenu.boxed_iced_tea && processedMenu.boxed_iced_tea.variants) {
    processedMenu.boxed_iced_tea.variants = processedMenu.boxed_iced_tea.variants.map(variant => {
      const numericBase = typeof variant.basePrice === 'number'
        ? variant.basePrice
        : parseFloat(variant.basePrice || variant.price || 0);
      const safeBase = !Number.isNaN(numericBase) && numericBase > 0 ? numericBase : 0;
      const existingPricing = variant.platformPricing || {};
      const existingPlatformPrice = existingPricing[platform];
      const computedPrice = typeof existingPlatformPrice === 'number'
        ? existingPlatformPrice
        : parseFloat(existingPlatformPrice);
      const platformPrice = !Number.isNaN(computedPrice) && computedPrice > 0
        ? parseFloat(computedPrice.toFixed(2))
        : parseFloat((safeBase * multiplier).toFixed(2));

      return {
        ...variant,
        basePrice: safeBase,
        platformPrice,
        platformPricing: {
          ...existingPricing,
          [platform]: platformPrice
        }
      };
    });
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

// Philadelphia Teams Configuration
const PHILLY_TEAMS = {
  nfl: {
    name: 'Eagles',
    abbr: 'PHI',
    colors: { primary: '#004c54', secondary: '#a5acaf', accent: '#acc0c6' },
    logo: '🦅',
    venue: 'Lincoln Financial Field',
    promos: {
      gameDay: 'Eagles Game Day Special - Free delivery on $35+',
      victory: 'Eagles Win! Celebrate with 20% off wings',
      nextGame: 'Get ready for Eagles football with our Tailgate Combo'
    }
  },
  nba: {
    name: '76ers',
    abbr: 'PHI',
    colors: { primary: '#006bb6', secondary: '#ed174c', accent: '#002b5c' },
    logo: '🏀',
    venue: 'Wells Fargo Center',
    promos: {
      gameDay: 'Sixers Game Night - Order wings for tip-off',
      victory: 'Trust the Process! Victory wings 15% off',
      nextGame: 'Gear up for Sixers basketball with our Philly Special'
    }
  },
  mlb: {
    name: 'Phillies',
    abbr: 'PHI',
    colors: { primary: '#e81828', secondary: '#002d72', accent: '#ffffff' },
    logo: '⚾',
    venue: 'Citizens Bank Park',
    promos: {
      gameDay: 'Phillies Game Day - Perfect wings for the ballpark',
      victory: 'Phillies Win! Home run deals on combos',
      nextGame: 'Baseball season calls for classic Buffalo wings'
    }
  },
  nhl: {
    name: 'Flyers',
    abbr: 'PHI',
    colors: { primary: '#f74902', secondary: '#000000', accent: '#ffffff' },
    logo: '🏒',
    venue: 'Wells Fargo Center',
    promos: {
      gameDay: 'Flyers Hockey Night - Hot wings for cold rink action',
      victory: 'Flyers Victory! Score big with wing deals',
      nextGame: 'Hockey season heats up - order spicy wings'
    }
  }
};

// Helper functions
function getCountdown(gameDate) {
  const now = new Date();
  const diff = gameDate - now;

  if (diff <= 0) return null;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function getUrgencyLevel(gameDate, isLive, isUpcoming) {
  if (isLive) return 10;
  if (!isUpcoming) return 1;

  const now = new Date();
  const hoursUntil = (gameDate - now) / (1000 * 60 * 60);

  if (hoursUntil <= 2) return 9;
  if (hoursUntil <= 6) return 8;
  if (hoursUntil <= 24) return 7;
  if (hoursUntil <= 72) return 5;
  return 3;
}

/**
 * HTTP Function: getSportsData
 * Fetches sports data from ESPN API for a specific sport/league
 */
exports.getSportsData = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const { sport, league } = req.query;
      const today = new Date();
      const endDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

      const formatDate = (d) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}${m}${day}`;
      };

      const dateRange = `${formatDate(today)}-${formatDate(endDate)}`;
      const url = `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/scoreboard?dates=${dateRange}&limit=300`;

      const response = await fetch(url);
      if (!response.ok) throw new Error(`ESPN API returned ${response.status}`);

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: error.message });
    }
  });
});

/**
 * HTTP Function: phillyGames
 * Aggregated Philadelphia sports games with enhanced data
 */
exports.phillyGames = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const sports = [
        { sport: 'football', league: 'nfl', teamKey: 'nfl' },
        { sport: 'basketball', league: 'nba', teamKey: 'nba' },
        { sport: 'baseball', league: 'mlb', teamKey: 'mlb' },
        { sport: 'hockey', league: 'nhl', teamKey: 'nhl' }
      ];

      const allGames = [];
      const now = new Date();

      for (const { sport, league, teamKey } of sports) {
        try {
          const today = new Date();
          const endDate = new Date(today.getTime() + 45 * 24 * 60 * 60 * 1000); // 45 days

          const formatDate = (d) => {
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${y}${m}${day}`;
          };

          const dateRange = `${formatDate(today)}-${formatDate(endDate)}`;
          const url = `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/scoreboard?dates=${dateRange}&limit=500`;

          const response = await fetch(url);
          if (!response.ok) continue;

          const data = await response.json();
          const teamData = PHILLY_TEAMS[teamKey];

          // Filter and enhance Philadelphia team games
          const phillyGames = data.events?.filter(event => {
            const competitors = event.competitions?.[0]?.competitors || [];
            return competitors.some(comp =>
              comp.team?.abbreviation === 'PHI' ||
              comp.team?.displayName?.includes('Philadelphia')
            );
          }).map(game => {
            const competition = game.competitions[0];
            const competitors = competition.competitors;
            const homeTeam = competitors.find(c => c.homeAway === 'home');
            const awayTeam = competitors.find(c => c.homeAway === 'away');
            const isHome = homeTeam?.team?.abbreviation === 'PHI';
            const gameDate = new Date(game.date);
            const isLive = competition.status.type.name === 'STATUS_IN_PROGRESS';
            const isComplete = competition.status.type.name === 'STATUS_FINAL';
            const isUpcoming = gameDate > now && !isLive && !isComplete;

            // Determine promotional message
            let promoMessage = teamData.promos.nextGame;
            if (isLive || (isUpcoming && gameDate - now < 24 * 60 * 60 * 1000)) {
              promoMessage = teamData.promos.gameDay;
            } else if (isComplete) {
              // Check if Philly won (simplified logic)
              const phillyCompetitor = competitors.find(c => c.team?.abbreviation === 'PHI');
              const opponentCompetitor = competitors.find(c => c.team?.abbreviation !== 'PHI');
              if (phillyCompetitor?.score > opponentCompetitor?.score) {
                promoMessage = teamData.promos.victory;
              }
            }

            return {
              id: game.id,
              sport: teamData.name,
              league: league.toUpperCase(),
              teamKey: teamKey,
              icon: teamData.logo,
              colors: teamData.colors,
              date: game.date,
              status: competition.status.type.name,
              statusText: competition.status.type.description,
              period: competition.status.period || 0,
              clock: competition.status.displayClock,
              homeTeam: {
                name: homeTeam?.team?.displayName || homeTeam?.team?.name,
                abbr: homeTeam?.team?.abbreviation,
                score: homeTeam?.score || 0,
                logo: homeTeam?.team?.logo
              },
              awayTeam: {
                name: awayTeam?.team?.displayName || awayTeam?.team?.name,
                abbr: awayTeam?.team?.abbreviation,
                score: awayTeam?.score || 0,
                logo: awayTeam?.team?.logo
              },
              venue: competition.venue?.fullName || teamData.venue,
              isHome: isHome,
              isLive: isLive,
              isComplete: isComplete,
              isUpcoming: isUpcoming,
              gameTime: gameDate.toLocaleString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                timeZone: 'America/New_York'
              }),
              countdown: isUpcoming ? getCountdown(gameDate) : null,
              promoMessage: promoMessage,
              urgency: getUrgencyLevel(gameDate, isLive, isUpcoming)
            };
          }) || [];

          allGames.push(...phillyGames);

        } catch (error) {
          console.error(`Error fetching ${teamKey} games:`, error);
        }
      }

      // Sort by urgency, then by date
      allGames.sort((a, b) => {
        if (a.urgency !== b.urgency) return b.urgency - a.urgency;
        return new Date(a.date) - new Date(b.date);
      });

      // Limit to next 10 games for performance
      const limitedGames = allGames.slice(0, 10);

      res.set('Cache-Control', 'public, max-age=300, s-maxage=600'); // 5min cache, 10min CDN
      res.json({
        games: limitedGames,
        lastUpdated: new Date().toISOString(),
        count: limitedGames.length,
        hasLiveGames: limitedGames.some(g => g.isLive),
        nextGame: limitedGames.find(g => g.isUpcoming) || null
      });

    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({
        error: error.message,
        games: [],
        fallback: true
      });
    }
  });
});

/**
 * Callable: createSubscriber
 * Enhanced subscriber creation with segmentation and game day reminders
 */
exports.createSubscriber = functions.https.onCall(async (data, context) => {
  try {
    const {
      email,
      name,
      phone,
      preferences = {},
      source = 'website',
      interests = [],
      sportTeams = [],
      dietaryPrefs = [],
      orderFrequency = 'occasional'
    } = data;

    if (!email) {
      throw new functions.https.HttpsError('invalid-argument', 'Email is required');
    }

    // Check if subscriber exists
    const existingSubscriber = await db.collection('emailSubscribers')
      .where('email', '==', email)
      .limit(1)
      .get();

    if (!existingSubscriber.empty) {
      const existing = existingSubscriber.docs[0];
      const existingData = existing.data();

      // Update preferences if subscriber exists
      await existing.ref.update({
        preferences: { ...existingData.preferences, ...preferences },
        interests: [...new Set([...(existingData.interests || []), ...interests])],
        sportTeams: [...new Set([...(existingData.sportTeams || []), ...sportTeams])],
        dietaryPrefs: [...new Set([...(existingData.dietaryPrefs || []), ...dietaryPrefs])],
        lastUpdated: new Date(),
        source: source
      });

      return {
        success: true,
        subscriberId: existing.id,
        message: 'Subscriber preferences updated',
        isNewSubscriber: false
      };
    }

    // Calculate Customer Lifetime Value prediction
    const clvScore = calculateCLVScore({
      interests,
      sportTeams,
      dietaryPrefs,
      orderFrequency,
      source
    });

    // Create new subscriber
    const subscriberData = {
      email,
      name: name || null,
      phone: phone || null,
      preferences,
      interests,
      sportTeams,
      dietaryPrefs,
      orderFrequency,
      source,
      subscribedAt: new Date(),
      isActive: true,
      tags: generateTags({ interests, sportTeams, dietaryPrefs, source }),
      clvScore,
      segment: getCustomerSegment(clvScore, interests.length, sportTeams.length),
      lastEngagement: new Date(),
      gameReminders: sportTeams.length > 0,
      emailCount: 0,
      clickCount: 0,
      conversionCount: 0
    };

    const docRef = await db.collection('emailSubscribers').add(subscriberData);

    // Schedule game day reminders if interested in sports
    if (sportTeams.length > 0) {
      await scheduleGameDayReminders(docRef.id, email, sportTeams);
    }

    // Trigger welcome email sequence
    await triggerWelcomeSequence(docRef.id, email, name, interests);

    return {
      success: true,
      subscriberId: docRef.id,
      message: 'Subscriber created successfully',
      isNewSubscriber: true,
      clvScore,
      segment: subscriberData.segment
    };

  } catch (error) {
    console.error('Error creating subscriber:', error);
    throw new functions.https.HttpsError('internal', 'Failed to create subscriber');
  }
});

/**
 * Helper Functions for Subscriber Pipeline
 */
function calculateCLVScore({ interests, sportTeams, dietaryPrefs, orderFrequency, source }) {
  let score = 50; // Base score

  // Interest multipliers
  score += interests.length * 5;
  score += sportTeams.length * 8; // Sports fans order more on game days
  score += dietaryPrefs.length * 3;

  // Order frequency impact
  const frequencyScores = {
    'daily': 40,
    'weekly': 25,
    'biweekly': 15,
    'monthly': 8,
    'occasional': 3
  };
  score += frequencyScores[orderFrequency] || 3;

  // Source quality
  const sourceScores = {
    'website': 10,
    'referral': 15,
    'social': 8,
    'ads': 5
  };
  score += sourceScores[source] || 5;

  return Math.min(100, Math.max(0, score));
}

function generateTags({ interests, sportTeams, dietaryPrefs, source }) {
  const tags = ['newsletter', 'perks'];

  if (interests.includes('wings')) tags.push('wing-lover');
  if (interests.includes('spicy')) tags.push('heat-seeker');
  if (interests.includes('combos')) tags.push('combo-buyer');
  if (sportTeams.length > 0) tags.push('sports-fan');
  if (dietaryPrefs.includes('vegetarian')) tags.push('vegetarian-options');

  tags.push(`source-${source}`);

  return tags;
}

function getCustomerSegment(clvScore, interestCount, sportsCount) {
  if (clvScore >= 80) return 'VIP';
  if (clvScore >= 60) return 'High-Value';
  if (sportsCount >= 2) return 'Sports-Fan';
  if (interestCount >= 3) return 'Engaged';
  return 'Standard';
}

async function scheduleGameDayReminders(subscriberId, email, sportTeams) {
  try {
    // Get upcoming games for subscriber's teams
    const gamesResponse = await fetch('https://us-central1-philly-wings.cloudfunctions.net/phillyGames');
    const gamesData = await gamesResponse.json();

    const relevantGames = gamesData.games.filter(game =>
      game.isUpcoming && sportTeams.includes(game.teamKey)
    );

    // Schedule reminders for next 3 games
    for (const game of relevantGames.slice(0, 3)) {
      const gameDate = new Date(game.date);
      const reminderTime = new Date(gameDate.getTime() - (2 * 60 * 60 * 1000)); // 2 hours before

      await db.collection('scheduledReminders').add({
        subscriberId,
        email,
        type: 'game-day',
        gameId: game.id,
        sport: game.teamKey,
        teamName: game.sport,
        gameDate: gameDate,
        scheduledFor: reminderTime,
        sent: false,
        createdAt: new Date()
      });
    }
  } catch (error) {
    console.error('Error scheduling game day reminders:', error);
  }
}

async function triggerWelcomeSequence(subscriberId, email, name, interests) {
  try {
    const welcomeData = {
      subscriberId,
      email,
      name: name || 'Wing Lover',
      personalizedMessage: generateWelcomeMessage(name, interests),
      discountCode: generateDiscountCode(),
      sequence: 'welcome',
      step: 1,
      scheduledFor: new Date(),
      sent: false,
      createdAt: new Date()
    };

    await db.collection('emailQueue').add(welcomeData);
  } catch (error) {
    console.error('Error triggering welcome sequence:', error);
  }
}

function generateWelcomeMessage(name, interests) {
  const messages = {
    wings: "Yo! Ready to taste some fire wings that'll knock your socks off?",
    spicy: "Yooo, another heat seeker! We got levels that'll test your limits.",
    combos: "Smart choice on combos - more bang for your buck, Philly style!",
    sports: "Game day wings hit different when you're cheering for the home team!"
  };

  const greeting = name ? `Yo ${name}!` : "What's good, Wing Lover!";
  const personalizedPart = interests.length > 0
    ? messages[interests[0]] || messages.wings
    : messages.wings;

  return `${greeting} ${personalizedPart} Here's 15% off to get you started - Arleth`;
}

function generateDiscountCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'WINGS';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Scheduled Function: processGameDayReminders
 * Runs every hour to send game day reminders
 */
exports.processGameDayReminders = functions.pubsub.schedule('0 * * * *').onRun(async (context) => {
  try {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - (60 * 60 * 1000));

    // Find reminders due in the next hour
    const dueReminders = await db.collection('scheduledReminders')
      .where('sent', '==', false)
      .where('scheduledFor', '<=', now)
      .where('scheduledFor', '>', oneHourAgo)
      .limit(50)
      .get();

    for (const doc of dueReminders.docs) {
      const reminder = doc.data();

      try {
        // Generate Arleth's personalized message
        const personalizedMessage = generateArlethGameMessage(reminder);

        // Add to email queue
        await db.collection('emailQueue').add({
          subscriberId: reminder.subscriberId,
          email: reminder.email,
          type: 'game-day-reminder',
          subject: `🏈 Game Day Special from Arleth!`,
          message: personalizedMessage,
          gameInfo: {
            sport: reminder.sport,
            teamName: reminder.teamName,
            gameDate: reminder.gameDate
          },
          scheduledFor: now,
          sent: false,
          createdAt: new Date()
        });

        // Mark reminder as sent
        await doc.ref.update({ sent: true, sentAt: new Date() });

      } catch (error) {
        console.error(`Error processing reminder ${doc.id}:`, error);
      }
    }

    console.log(`Processed ${dueReminders.docs.length} game day reminders`);
    return null;

  } catch (error) {
    console.error('Error in processGameDayReminders:', error);
    return null;
  }
});

function generateArlethGameMessage(reminder) {
  const teamMessages = {
    nfl: [
      "Yo! Eagles bout to fly high today! You know what goes perfect with football? My atomic wings that'll have you sweating more than the players. Get 'em delivered before kickoff! 🦅🔥",
      "Game day special just dropped! As someone who's been feeding Philly since day one, trust me - these wings are gonna hit different during the game. Order now before the rush! 💚",
      "Listen up, bird gang! Arleth here with your pre-game reminder. These players need fuel, and so do you. Wings that actually taste like they're made with love (and a whole lotta heat)!"
    ],
    nba: [
      "Sixers tip-off soon and I got the perfect fuel for your watch party! These wings been perfected over years of feeding basketball fanatics. Trust the process... and trust these flavors! 🏀",
      "What's good, Philly! Game time approaching and you know what that means - time for wings that actually pack a punch. None of that weak sauce here, just pure fire! 💙❤️",
      "Yo Sixers fam! Arleth coming at you with game day realness. Been making wings since before Embiid was dunking, and these recipes still undefeated!"
    ],
    mlb: [
      "Phillies about to take the field! You know what's better than peanuts and cracker jacks? Wings that'll make you forget you're not at the ballpark. Let's go Phils! ⚾",
      "Game day vibes hitting different! Your girl Arleth got the wings that'll make this Phillies game even sweeter. Red October energy all year round! 🔴",
      "Baseball and wings - name a more iconic Philly duo! These flavors been perfected through countless innings of perfection. Order up before first pitch!"
    ],
    nhl: [
      "Flyers game tonight means one thing - time for wings that'll warm you up more than that rink action! Been serving hockey fans since the Broad Street Bullies era! 🏒",
      "Ice cold rink, fire hot wings! That's the Philly way. Arleth here making sure you got the perfect game day fuel. Let's go Flyers! 🧡🖤",
      "Hockey night in Philly! These wings gonna melt faster than ice on a Flyers power play. Order now and thank me during intermission!"
    ]
  };

  const messages = teamMessages[reminder.sport] || teamMessages.nfl;
  const randomMessage = messages[Math.floor(Math.random() * messages.length)];

  return `${randomMessage}\n\n- Arleth, Owner & Chief Wing Architect\nPhilly Wings Express 🔥`;
}
