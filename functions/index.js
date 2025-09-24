// Cloud Functions for platform menu publishing
const functions = require('firebase-functions');
const admin = require('firebase-admin');

try {
  admin.initializeApp();
} catch (e) {}

const db = admin.firestore();
const storage = admin.storage();

/**
 * Callable: publishPlatformMenu
 * payload: { platform: 'doordash'|'ubereats'|'grubhub', snapshot: object }
 * Writes JSON to Storage: platform-menus/{platform}/{ts}.json and latest.json
 * Writes metadata to Firestore: publishedMenus/{id}
 */
/**
 * HTTP Function: platformMenu
 * Serves professional platform-specific menu pages
 * URLs: doordash.phillywingsexpress.com, ubereats.phillywingsexpress.com, grubhub.phillywingsexpress.com
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

    // Generate complete HTML response
    const html = generateMenuHTML(platformMenu, platform, menuData.settings);

    res.set('Content-Type', 'text/html; charset=utf-8');
    res.send(html);

  } catch (error) {
    console.error('Platform menu error:', error);
    res.status(500).send(`
      <html><body style="font-family: Arial; text-align: center; padding: 50px;">
        <h1>Menu Temporarily Unavailable</h1>
        <p>We're experiencing technical difficulties. Please try again in a few minutes.</p>
        <p>For immediate assistance: hello@phillywingsexpress.com</p>
      </body></html>
    `);
  }
});

// Helper function to extract platform from request
function extractPlatform(req) {
  // From subdomain: doordash.phillywingsexpress.com
  const host = req.get('host') || '';
  const subdomain = host.split('.')[0];
  if (['doordash', 'ubereats', 'grubhub'].includes(subdomain)) {
    return subdomain;
  }

  // From query parameter: ?platform=doordash
  return req.query.platform;
}

// Generate today's hours from settings
function generateTodaysHours(settings) {
  if (!settings?.businessHours) return '10:30 AM - 7:15 PM';

  const today = new Date();
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const todayName = dayNames[today.getDay()];

  const todayHours = settings.businessHours[todayName];
  if (!todayHours) return '10:30 AM - 7:15 PM';

  return `${todayHours.open} - ${todayHours.close}`;
}

// Generate optimized image URL for menu items
function generateOptimizedImageUrl(item, size = '200x200') {
  if (item.imageUrl || item.image) {
    // Extract filename from existing URL or direct filename
    const imageUrl = item.imageUrl || item.image;
    let filename = '';

    if (imageUrl.includes('/')) {
      // Extract from Firebase URL
      const matches = imageUrl.match(/images%2F(.+?)\.(png|jpg|jpeg)/i);
      if (matches) {
        filename = matches[1];
      }
    } else {
      // Direct filename
      filename = imageUrl.replace(/\.(png|jpg|jpeg)$/i, '');
    }

    if (filename) {
      return `https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2F${filename}_${size}.webp?alt=media`;
    }
  }

  // Fallback to default image
  return `https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fphilly-wings-express-logo.png?alt=media`;
}

// Fetch complete menu data from Firestore
async function fetchCompleteMenu() {
  console.log('Fetching menu data from Firestore...');

  try {
    // Parallel fetch for optimal performance
    const [menuItemsSnapshot, combosSnapshot, saucesSnapshot, settingsDoc] = await Promise.all([
      db.collection('menuItems').get(),
      db.collection('combos').get(),
      db.collection('sauces').get(),
      db.collection('settings').doc('main').get()
    ]);

    // Parse menuItems by their id field
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
      combos: combosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
      sauces: saucesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
      settings: settingsDoc.exists ? settingsDoc.data() : {}
    };
  } catch (error) {
    console.error('Error fetching menu data:', error);
    throw new Error('Failed to fetch menu data from Firestore');
  }
}

// Apply platform-specific processing
function processPlatformMenu(menuData, platform) {
  const platformMarkups = {
    doordash: 1.35,   // +35% markup
    ubereats: 1.35,   // +35% markup
    grubhub: 1.215    // +21.5% markup
  };

  const markup = platformMarkups[platform];

  return {
    platform,
    markup,
    markupPercentage: ((markup - 1) * 100).toFixed(1),
    wings: processWingVariants(menuData.wings, markup),
    sides: processSides(menuData.fries, menuData.mozzarella, markup),
    beverages: processBeverages(menuData.drinks, markup),
    combos: processCombos(menuData.combos, markup),
    sauces: menuData.sauces,
    branding: getPlatformBranding(platform),
    lastUpdated: new Date().toISOString()
  };
}

function processWingVariants(wingsData, markup) {
  if (!wingsData?.variants) return [];

  return wingsData.variants.map(variant => ({
    ...variant,
    basePrice: variant.basePrice,
    platformPrice: (variant.basePrice * markup).toFixed(2),
    markupAmount: ((variant.basePrice * markup) - variant.basePrice).toFixed(2),
    description: variant.description || generateWingDescription(variant),
    image: variant.image || getDefaultWingImage(variant.type),
    includedSauces: Math.ceil((variant.count || 6) / 6) // 1 sauce per 6 wings
  }));
}

function processCombos(combosData, markup) {
  return combosData.map(combo => ({
    ...combo,
    basePrice: combo.basePrice,
    platformPrice: (combo.basePrice * markup).toFixed(2),
    markupAmount: ((combo.basePrice * markup) - combo.basePrice).toFixed(2),
    savings: combo.savings || '15%',
    description: combo.description || generateComboDescription(combo)
  }));
}

function processSides(friesData, mozzarellaData, markup) {
  const sides = [];

  // Process fries variants
  if (friesData?.variants) {
    friesData.variants.forEach(side => {
      sides.push({
        ...side,
        basePrice: side.basePrice,
        platformPrice: (side.basePrice * markup).toFixed(2),
        markupAmount: ((side.basePrice * markup) - side.basePrice).toFixed(2),
        image: friesData.images?.hero || 'fries',
        category: 'fries'
      });
    });
  }

  // Process mozzarella variants
  if (mozzarellaData?.variants) {
    mozzarellaData.variants.forEach(side => {
      sides.push({
        ...side,
        basePrice: side.basePrice,
        platformPrice: (side.basePrice * markup).toFixed(2),
        markupAmount: ((side.basePrice * markup) - side.basePrice).toFixed(2),
        image: mozzarellaData.images?.hero || 'mozzarella-sticks',
        category: 'mozzarella'
      });
    });
  }

  return sides;
}

function processBeverages(drinksData, markup) {
  if (!drinksData?.variants) return [];

  return drinksData.variants.map(drink => ({
    ...drink,
    basePrice: drink.basePrice,
    platformPrice: (drink.basePrice * markup).toFixed(2),
    markupAmount: ((drink.basePrice * markup) - drink.basePrice).toFixed(2)
  }));
}

function getPlatformBranding(platform) {
  const branding = {
    doordash: {
      name: 'DoorDash',
      color: '#EB1700',
      secondaryColor: '#FFF1F0',
      logo: 'https://storage.googleapis.com/philly-wings.appspot.com/platform-logos/doordash-logo.png',
      contactEmail: 'merchant-support@doordash.com'
    },
    ubereats: {
      name: 'Uber Eats',
      color: '#06C167',
      secondaryColor: '#F0FFF4',
      logo: 'https://storage.googleapis.com/philly-wings.appspot.com/platform-logos/ubereats-logo.png',
      contactEmail: 'restaurants@uber.com'
    },
    grubhub: {
      name: 'Grubhub',
      color: '#FF8000',
      secondaryColor: '#FFF8F0',
      logo: 'https://storage.googleapis.com/philly-wings.appspot.com/platform-logos/grubhub-logo.png',
      contactEmail: 'restaurants@grubhub.com'
    }
  };

  return branding[platform];
}

function generateWingDescription(variant) {
  const count = variant.count || 6;
  const sauces = Math.ceil(count / 6);
  return `${count} delicious wings with ${sauces} sauce${sauces > 1 ? 's' : ''} included`;
}

function generateComboDescription(combo) {
  return combo.name?.includes('Combo') ?
    `Complete meal deal with wings, sides, and dips` :
    `${combo.name} - everything you need for a great meal`;
}

function getDefaultWingImage(type) {
  return 'https://storage.googleapis.com/philly-wings.appspot.com/wings/default-wings.jpg';
}

function getHeatLevelClass(heatLevel) {
  const level = parseInt(heatLevel) || 0;
  if (level === 0) return 'mild';
  if (level === 1) return 'mild';
  if (level === 2) return 'medium';
  if (level === 3) return 'hot';
  if (level >= 4) return 'extra-hot';
  return 'mild';
}

function getHeatLevelText(heatLevel) {
  const level = parseInt(heatLevel) || 0;
  if (level === 0) return 'No Heat';
  if (level === 1) return 'Mild';
  if (level === 2) return 'Medium';
  if (level === 3) return 'Hot';
  if (level >= 4) return 'Extra Hot';
  return 'Mild';
}

function getHeatEmojis(heatLevel) {
  const level = parseInt(heatLevel) || 0;
  if (level === 0) return '○○○○○';
  if (level === 1) return '🔥○○○○';
  if (level === 2) return '🔥🔥○○○';
  if (level === 3) return '🔥🔥🔥○○';
  if (level === 4) return '🔥🔥🔥🔥○';
  if (level >= 5) return '🔥🔥🔥🔥🔥';
  return '🔥○○○○';
}

// Generate Featured Items Carousel - UberEats Style
function generateFeaturedItems(wings, combos) {
  const featuredItems = [];

  // Add top wings as featured
  if (wings?.length > 0) {
    featuredItems.push(...wings.slice(0, 2).map(item => ({...item, type: 'wing'})));
  }

  // Add top combos as featured
  if (combos?.length > 0) {
    featuredItems.push(...combos.slice(0, 2).map(item => ({...item, type: 'combo'})));
  }

  if (featuredItems.length === 0) {
    return '<div class="featured-section"><h2>Featured Items Coming Soon</h2></div>';
  }

  return `
    <div class="featured-section">
      <h2 class="featured-title">Featured</h2>
      <div class="featured-carousel">
        ${featuredItems.map((item, index) => `
          <div class="featured-item">
            <div class="featured-image">
              <img src="${item.imageUrl || item.image || 'https://storage.googleapis.com/philly-wings.appspot.com/wings/default-wings.jpg'}"
                   alt="${item.name}" loading="lazy">
              ${index === 0 ? '<div class="most-liked-badge">#1 Most liked</div>' : ''}
            </div>
            <div class="featured-info">
              <h3 class="featured-name">${item.name}</h3>
              <div class="featured-rating">👍 ${88 + index}% (${247 - index * 20})</div>
              <div class="featured-price">$${item.platformPrice}</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// Generate UberEats-style CSS
function generateUberEatsCSS(branding) {
  return `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'UberMove', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #f6f6f6;
      color: #000;
      line-height: 1.4;
    }

    /* UberEats Header */
    .uber-header {
      background: white;
      border-bottom: 1px solid #e6e6e6;
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .uber-nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .nav-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .menu-btn {
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
      padding: 8px;
    }

    .platform-logo {
      height: 24px;
      width: auto;
    }

    .nav-center {
      flex: 1;
      text-align: center;
    }

    .location-text {
      font-size: 14px;
      color: #333;
    }

    .nav-right {
      display: flex;
      gap: 8px;
    }

    .login-btn, .signup-btn {
      padding: 8px 16px;
      border: 1px solid #333;
      background: white;
      color: #333;
      border-radius: 24px;
      font-size: 14px;
      cursor: pointer;
    }

    .signup-btn {
      background: #000;
      color: white;
    }

    /* Hero Section */
    .hero-section {
      position: relative;
      height: 240px;
      overflow: hidden;
    }

    .hero-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .hero-actions {
      position: absolute;
      top: 16px;
      right: 16px;
      display: flex;
      gap: 8px;
    }

    .favorite-btn, .options-btn {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.9);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .restaurant-logo-overlay {
      position: absolute;
      bottom: -32px;
      left: 16px;
      width: 64px;
      height: 64px;
      background: white;
      border-radius: 8px;
      padding: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .restaurant-logo {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    /* Restaurant Info */
    .restaurant-info {
      background: white;
      padding: 48px 16px 16px 16px;
      margin-bottom: 16px;
    }

    .restaurant-name {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 8px;
    }

    .restaurant-meta {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 14px;
      color: #666;
      margin-bottom: 12px;
    }

    .delivery-info {
      display: flex;
      gap: 12px;
      font-size: 14px;
      color: #666;
    }

    /* Featured Section */
    .featured-section {
      background: white;
      padding: 16px;
      margin-bottom: 16px;
    }

    .featured-title {
      font-size: 20px;
      font-weight: bold;
      margin-bottom: 16px;
    }

    .featured-carousel {
      display: flex;
      gap: 12px;
      overflow-x: auto;
      padding-bottom: 8px;
    }

    .featured-item {
      min-width: 160px;
      cursor: pointer;
    }

    .featured-image {
      position: relative;
      width: 160px;
      height: 120px;
      border-radius: 8px;
      overflow: hidden;
      margin-bottom: 8px;
    }

    .featured-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .most-liked-badge {
      position: absolute;
      top: 8px;
      left: 8px;
      background: #06c167;
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
    }

    .featured-info {
      text-align: left;
    }

    .featured-name {
      font-size: 14px;
      font-weight: bold;
      margin-bottom: 4px;
    }

    .featured-rating {
      font-size: 12px;
      color: #06c167;
      margin-bottom: 4px;
    }

    .featured-price {
      font-size: 14px;
      font-weight: bold;
    }

    /* Category Tabs */
    .category-tabs {
      background: white;
      padding: 0 16px;
      margin-bottom: 16px;
      overflow-x: auto;
      border-bottom: 1px solid #e6e6e6;
    }

    .tabs-list {
      display: flex;
      gap: 24px;
      white-space: nowrap;
    }

    .tab-item {
      padding: 16px 0;
      font-size: 16px;
      color: #666;
      border-bottom: 2px solid transparent;
      cursor: pointer;
    }

    .tab-item.active {
      color: #000;
      border-bottom-color: #000;
      font-weight: 500;
    }

    /* Menu Sections */
    .menu-section {
      background: white;
      margin-bottom: 16px;
    }

    .section-header {
      padding: 24px 16px 16px 16px;
      border-bottom: 1px solid #f0f0f0;
    }

    .section-title {
      font-size: 20px;
      font-weight: bold;
      margin-bottom: 4px;
    }

    .section-subtitle {
      font-size: 14px;
      color: #666;
    }

    /* Menu Items */
    .menu-items {
      padding: 0;
    }

    .menu-item-card {
      display: flex;
      padding: 16px;
      border-bottom: 1px solid #f0f0f0;
      cursor: pointer;
    }

    .menu-item-card:hover {
      background-color: #f9f9f9;
    }

    .item-content {
      flex: 1;
      display: flex;
      gap: 16px;
    }

    .item-details {
      flex: 1;
    }

    .item-name {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 4px;
    }

    .item-rating {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }

    .rating-badge {
      background: #06c167;
      color: white;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: bold;
    }

    .rating-percent {
      font-size: 12px;
      color: #06c167;
    }

    .item-description {
      font-size: 14px;
      color: #666;
      line-height: 1.4;
    }

    .item-image {
      width: 144px;
      height: 144px;
      border-radius: 8px;
      overflow: hidden;
      flex-shrink: 0;
    }

    .item-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .item-price {
      font-size: 16px;
      font-weight: bold;
      margin-top: 8px;
    }

    /* Sauces Grid */
    .sauces-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 16px;
      padding: 16px;
    }

    .sauce-item {
      display: flex;
      gap: 12px;
      padding: 12px;
      border: 1px solid #f0f0f0;
      border-radius: 8px;
      cursor: pointer;
    }

    .sauce-item:hover {
      background-color: #f9f9f9;
    }

    .sauce-image {
      width: 60px;
      height: 60px;
      border-radius: 8px;
      overflow: hidden;
      flex-shrink: 0;
    }

    .sauce-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .sauce-info {
      flex: 1;
    }

    .sauce-name {
      font-size: 14px;
      font-weight: bold;
      margin-bottom: 4px;
      display: block;
    }

    .heat-level {
      font-size: 12px;
      padding: 2px 6px;
      border-radius: 4px;
      margin-bottom: 4px;
      display: inline-block;
    }

    .heat-level.mild {
      background: #e8f5e8;
      color: #2d5f2d;
    }

    .heat-level.medium {
      background: #fff3cd;
      color: #856404;
    }

    .heat-level.hot {
      background: #f8d7da;
      color: #721c24;
    }

    .heat-level.extra-hot {
      background: #721c24;
      color: white;
    }

    .sauce-description {
      font-size: 12px;
      color: #666;
      margin: 0;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .uber-nav {
        padding: 8px 12px;
      }

      .hero-section {
        height: 200px;
      }

      .restaurant-info {
        padding: 40px 12px 12px 12px;
      }

      .featured-section, .menu-section {
        margin-left: 0;
        margin-right: 0;
      }

      .menu-item-card {
        padding: 12px;
      }

      .item-image {
        width: 120px;
        height: 120px;
      }
    }

    /* Color Theme */
    .platform-doordash {
      --primary-color: #ff3008;
      --secondary-color: #ff6347;
    }

    .platform-ubereats {
      --primary-color: #06c167;
      --secondary-color: #4caf50;
    }

    .platform-grubhub {
      --primary-color: #ff8000;
      --secondary-color: #ffa500;
    }
  `;
}

// Generate UberEats-style Menu Sections
function generateUberEatsWingsSection(wings) {
  if (!wings?.length) return '<div class="menu-section"><h3>Wings Coming Soon</h3></div>';

  return `
    <div class="menu-section" id="wings-section">
      <div class="section-header">
        <h2 class="section-title">Traditional Wings</h2>
        <p class="section-subtitle">Fresh wings cooked to perfection</p>
      </div>
      <div class="menu-items">
        ${wings.map((wing, index) => `
          <div class="menu-item-card">
            <div class="item-content">
              <div class="item-details">
                <h4 class="item-name">${wing.name}</h4>
                <div class="item-rating">
                  ${index === 0 ? '<span class="rating-badge">#1 Most liked</span>' : ''}
                  <span class="rating-percent">👍 ${89 - index}% (${247 - index * 15})</span>
                </div>
                <p class="item-description">${wing.description}</p>
              </div>
              <div class="item-image">
                <img src="${wing.imageUrl || wing.image || 'https://storage.googleapis.com/philly-wings.appspot.com/wings/default-wings.jpg'}"
                     alt="${wing.name}" loading="lazy">
              </div>
            </div>
            <div class="item-price">$${wing.platformPrice}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function generateUberEatsCombosSection(combos) {
  if (!combos?.length) return '<div class="menu-section"><h3>Combos Coming Soon</h3></div>';

  return `
    <div class="menu-section" id="combos-section">
      <div class="section-header">
        <h2 class="section-title">Combo Meals</h2>
        <p class="section-subtitle">Complete meals with wings, sides, and drinks</p>
      </div>
      <div class="menu-items">
        ${combos.map((combo, index) => `
          <div class="menu-item-card">
            <div class="item-content">
              <div class="item-details">
                <h4 class="item-name">${combo.name}</h4>
                <div class="item-rating">
                  <span class="rating-percent">👍 ${85 - index}% (${156 - index * 10})</span>
                </div>
                <p class="item-description">${combo.description}</p>
              </div>
              <div class="item-image">
                <img src="${combo.imageUrl || combo.image || 'https://storage.googleapis.com/philly-wings.appspot.com/combos/default-combo.jpg'}"
                     alt="${combo.name}" loading="lazy">
              </div>
            </div>
            <div class="item-price">$${combo.platformPrice ? (typeof combo.platformPrice === 'number' ? combo.platformPrice.toFixed(2) : combo.platformPrice) : 'N/A'}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function generateUberEatsSidesSection(sides) {
  if (!sides?.length) return '<div class="menu-section"><h3>Sides Coming Soon</h3></div>';

  return `
    <div class="menu-section" id="sides-section">
      <div class="section-header">
        <h2 class="section-title">Sides</h2>
        <p class="section-subtitle">Perfect complements to your wings</p>
      </div>
      <div class="menu-items">
        ${sides.map((side, index) => `
          <div class="menu-item-card">
            <div class="item-content">
              <div class="item-details">
                <h4 class="item-name">${side.name}</h4>
                <div class="item-rating">
                  <span class="rating-percent">👍 ${78 - index}% (${89 - index * 5})</span>
                </div>
                <p class="item-description">${side.description || 'Fresh and delicious'}</p>
              </div>
              <div class="item-image">
                <img src="${side.imageUrl || side.image || 'https://storage.googleapis.com/philly-wings.appspot.com/sides/default-side.jpg'}"
                     alt="${side.name}" loading="lazy">
              </div>
            </div>
            <div class="item-price">$${side.platformPrice}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function generateUberEatsBeveragesSection(beverages) {
  if (!beverages?.length) return '<div class="menu-section"><h3>Beverages Coming Soon</h3></div>';

  return `
    <div class="menu-section" id="beverages-section">
      <div class="section-header">
        <h2 class="section-title">Beverages</h2>
        <p class="section-subtitle">Refresh your meal</p>
      </div>
      <div class="menu-items">
        ${beverages.map((beverage, index) => `
          <div class="menu-item-card">
            <div class="item-content">
              <div class="item-details">
                <h4 class="item-name">${beverage.name}</h4>
                <div class="item-rating">
                  <span class="rating-percent">👍 ${75 - index}% (${67 - index * 3})</span>
                </div>
                <p class="item-description">${beverage.description || 'Refreshing beverage'}</p>
              </div>
              <div class="item-image">
                <img src="${beverage.imageUrl || beverage.image || 'https://storage.googleapis.com/philly-wings.appspot.com/beverages/default-drink.jpg'}"
                     alt="${beverage.name}" loading="lazy">
              </div>
            </div>
            <div class="item-price">$${beverage.platformPrice}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function generateUberEatsSaucesSection(sauces) {
  if (!sauces?.length) return '<div class="menu-section"><h3>Sauces Coming Soon</h3></div>';

  return `
    <div class="menu-section" id="sauces-section">
      <div class="section-header">
        <h2 class="section-title">Signature Sauces</h2>
        <p class="section-subtitle">Extra sauces $0.75 each</p>
      </div>
      <div class="sauces-grid">
        ${sauces.map(sauce => `
          <div class="sauce-item">
            <div class="sauce-image">
              <img src="${sauce.imageUrl || sauce.image || 'https://storage.googleapis.com/philly-wings.appspot.com/sauces/default-sauce.jpg'}"
                   alt="${sauce.name}" loading="lazy">
            </div>
            <div class="sauce-info">
              <h4 class="sauce-name">${sauce.name}</h4>
              <span class="heat-level ${getHeatLevelClass(sauce.heatLevel)}">${getHeatLevelText(sauce.heatLevel)}</span>
              <p class="sauce-description">${sauce.description || ''}</p>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// Generate DoorDash-authentic CSS styling
function generateDoorDashCSS(branding) {
  return `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #ffffff;
      color: #191919;
      line-height: 1.4;
    }

    /* DoorDash Header */
    .doordash-header {
      background: white;
      border-bottom: 1px solid #e6e6e6;
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .header-nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 20px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .nav-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .menu-btn {
      background: none;
      border: none;
      font-size: 18px;
      cursor: pointer;
      padding: 8px;
    }

    .doordash-logo {
      height: 32px;
      width: auto;
    }

    .nav-center {
      flex: 1;
      text-align: center;
    }

    .location-text {
      font-size: 14px;
      color: #191919;
      font-weight: 500;
    }

    .nav-right {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .login-btn, .signup-btn {
      padding: 8px 16px;
      border: 1px solid #191919;
      background: white;
      color: #191919;
      border-radius: 6px;
      font-size: 14px;
      cursor: pointer;
      font-weight: 500;
    }

    .signup-btn {
      background: #ff3008;
      color: white;
      border-color: #ff3008;
    }

    .cart-icon {
      position: relative;
      font-size: 20px;
      cursor: pointer;
      padding: 8px;
    }

    .cart-count {
      position: absolute;
      top: -2px;
      right: -2px;
      background: #ff3008;
      color: white;
      border-radius: 50%;
      width: 18px;
      height: 18px;
      font-size: 12px;
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* Restaurant Hero */
    .restaurant-hero {
      position: relative;
      height: 240px;
      overflow: hidden;
    }

    .hero-bg {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .restaurant-logo {
      position: absolute;
      bottom: -32px;
      left: 20px;
      width: 64px;
      height: 64px;
      background: white;
      border-radius: 8px;
      padding: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .logo-img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    /* Restaurant Details */
    .restaurant-details {
      padding: 48px 20px 20px 20px;
      max-width: 1400px;
      margin: 0 auto;
      border-bottom: 1px solid #f0f0f0;
    }

    .restaurant-details h1 {
      font-size: 32px;
      font-weight: bold;
      margin-bottom: 8px;
    }

    .restaurant-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
      font-size: 14px;
      color: #666;
    }

    .rating {
      color: #191919;
      font-weight: 500;
    }

    .bullet {
      color: #ccc;
    }

    .delivery-info {
      margin-bottom: 12px;
    }

    .delivery-fee {
      color: #0077c5;
      font-size: 14px;
      font-weight: 500;
    }

    .delivery-time {
      color: #666;
      font-size: 14px;
    }

    .store-hours {
      margin-bottom: 12px;
      font-size: 14px;
      color: #666;
    }

    .hours-label {
      font-weight: 500;
      color: #191919;
    }

    .hours-today {
      margin-left: 8px;
    }

    .hours-toggle {
      margin-left: 8px;
      background: none;
      border: none;
      color: #0077c5;
      cursor: pointer;
      font-size: 14px;
      text-decoration: underline;
    }

    .store-address {
      margin-bottom: 16px;
    }

    .address-text {
      font-size: 14px;
      color: #666;
    }

    .action-buttons {
      display: flex;
      gap: 12px;
    }

    .delivery-btn, .pickup-btn, .group-order-btn {
      padding: 8px 16px;
      border: 1px solid #e6e6e6;
      background: white;
      border-radius: 6px;
      font-size: 14px;
      cursor: pointer;
      font-weight: 500;
    }

    .delivery-btn.active {
      background: #191919;
      color: white;
      border-color: #191919;
    }

    /* Main Layout */
    .main-layout {
      display: flex;
      max-width: 1400px;
      margin: 0 auto;
      gap: 20px;
      padding: 20px;
    }

    /* Category Sidebar */
    .category-sidebar {
      width: 240px;
      flex-shrink: 0;
    }

    .category-list {
      position: sticky;
      top: 100px;
    }

    .category-item {
      display: block;
      width: 100%;
      padding: 12px 16px;
      border: none;
      background: none;
      text-align: left;
      cursor: pointer;
      font-size: 14px;
      color: #666;
      border-radius: 6px;
      margin-bottom: 4px;
    }

    .category-item:hover {
      background: #f8f8f8;
    }

    .category-item.active {
      background: #f8f8f8;
      color: #191919;
      font-weight: 500;
    }

    /* Menu Content */
    .menu-content {
      flex: 1;
    }

    .search-section {
      margin-bottom: 24px;
    }

    .menu-search {
      width: 100%;
      padding: 12px 16px;
      border: 1px solid #e6e6e6;
      border-radius: 6px;
      font-size: 16px;
    }

    /* Menu Sections */
    .menu-category {
      margin-bottom: 32px;
    }

    .category-title {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 16px;
      color: #191919;
    }

    .category-items {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    /* Menu Items - DoorDash List Style */
    .menu-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      border: 1px solid #f0f0f0;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .menu-item:hover {
      border-color: #e6e6e6;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .item-image {
      width: 100px;
      height: 100px;
      border-radius: 8px;
      overflow: hidden;
      flex-shrink: 0;
    }

    .item-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .item-details {
      flex: 1;
      min-width: 0;
    }

    .item-name {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 4px;
      color: #191919;
    }

    .item-description {
      font-size: 14px;
      color: #666;
      margin-bottom: 8px;
      line-height: 1.4;
    }

    .item-rating {
      font-size: 12px;
      color: #0077c5;
      font-weight: 500;
    }

    .heat-level {
      font-size: 12px;
      padding: 2px 6px;
      border-radius: 4px;
      display: inline-block;
      font-weight: 500;
    }

    .item-actions {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 8px;
    }

    .item-price {
      font-size: 16px;
      font-weight: 600;
      color: #191919;
    }

    .add-item-btn {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 1px solid #ff3008;
      background: white;
      color: #ff3008;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      font-weight: bold;
    }

    .add-item-btn:hover {
      background: #ff3008;
      color: white;
    }

    /* Modal Styles */
    .modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal.hidden {
      display: none;
    }

    .modal-content {
      background: white;
      border-radius: 12px;
      width: 90%;
      max-width: 500px;
      max-height: 80vh;
      overflow-y: auto;
    }

    .modal-header {
      padding: 20px;
      border-bottom: 1px solid #f0f0f0;
      position: relative;
    }

    .close-modal {
      position: absolute;
      top: 12px;
      right: 16px;
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #666;
    }

    .modal-body {
      padding: 20px;
    }

    .modal-image {
      width: 100%;
      height: 200px;
      object-fit: cover;
      border-radius: 8px;
      margin-bottom: 16px;
    }

    .modal-footer {
      padding: 20px;
      border-top: 1px solid #f0f0f0;
    }

    .add-to-cart-btn {
      width: 100%;
      padding: 12px;
      background: #ff3008;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
    }

    /* Cart Summary */
    .cart-summary {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 320px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      z-index: 200;
    }

    .cart-summary.hidden {
      display: none;
    }

    .cart-header {
      padding: 16px 20px;
      border-bottom: 1px solid #f0f0f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .cart-items {
      max-height: 300px;
      overflow-y: auto;
      padding: 16px 20px;
    }

    .cart-total {
      padding: 16px 20px;
      border-top: 1px solid #f0f0f0;
    }

    .checkout-btn {
      width: 100%;
      padding: 12px;
      background: #ff3008;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      margin-top: 12px;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .main-layout {
        flex-direction: column;
        padding: 16px;
      }

      .category-sidebar {
        width: 100%;
        order: 2;
      }

      .category-list {
        position: static;
        display: flex;
        gap: 8px;
        overflow-x: auto;
        padding-bottom: 8px;
      }

      .category-item {
        white-space: nowrap;
        flex-shrink: 0;
      }

      .menu-content {
        order: 1;
      }

      .item-image {
        width: 80px;
        height: 80px;
      }

      .cart-summary {
        bottom: 10px;
        right: 10px;
        left: 10px;
        width: auto;
      }
    }
  `;
}

// Generate DoorDash-style Menu Sections
function generateDoorDashMenuSections(wings, combos, sides, beverages, sauces) {
  let html = '';

  // Wings Section
  if (wings?.length > 0) {
    html += generateDoorDashSection('wings', 'Traditional Wings', wings);
  }

  // Combos Section
  if (combos?.length > 0) {
    html += generateDoorDashSection('combos', 'Combo Meals', combos);
  }

  // Sides Section
  if (sides?.length > 0) {
    html += generateDoorDashSection('sides', 'Sides', sides);
  }

  // Beverages Section
  if (beverages?.length > 0) {
    html += generateDoorDashSection('beverages', 'Beverages', beverages);
  }

  // Sauces Section
  if (sauces?.length > 0) {
    html += generateDoorDashSection('sauces', 'Signature Sauces', sauces);
  }

  return html;
}

// Generate individual DoorDash section
function generateDoorDashSection(categoryId, categoryName, items) {
  return `
    <div class="menu-category" id="${categoryId}-section">
      <h2 class="category-title">${categoryName}</h2>
      <div class="category-items">
        ${items.map((item, index) => `
          <div class="menu-item" data-item='${JSON.stringify(item)}' data-category="${categoryId}">
            <div class="item-image">
              <img src="${generateOptimizedImageUrl(item, '200x200')}"
                   alt="${item.name}" loading="lazy">
            </div>
            <div class="item-details">
              <h3 class="item-name">${item.name}</h3>
              <p class="item-description">${item.description || ''}</p>
              ${generateItemExtras(item, categoryId)}
            </div>
            <div class="item-actions">
              <div class="item-price">$${item.platformPrice}</div>
              <button class="add-item-btn" data-item-name="${item.name}">
                <span class="add-icon">+</span>
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// Generate item extras (ratings, badges, etc.)
function generateItemExtras(item, categoryId) {
  let extras = '';

  // Add rating for popular items
  if (categoryId === 'wings' || categoryId === 'combos') {
    const ratings = [
      '#1 Most liked • 👍 89% (247)',
      '👍 85% (156)',
      '👍 82% (134)',
      '👍 78% (89)'
    ];
    const randomRating = ratings[Math.floor(Math.random() * ratings.length)];
    extras += `<div class="item-rating">${randomRating}</div>`;
  }

  // Add heat level for sauces
  if (categoryId === 'sauces' && item.heatLevel !== undefined) {
    extras += `<div class="heat-level ${getHeatLevelClass(item.heatLevel)}">${getHeatLevelText(item.heatLevel)}</div>`;
  }

  return extras;
}

// Generate UberEats-style JavaScript for interactivity
function generateUberEatsJS() {
  return `
    // Category tab navigation
    document.addEventListener('DOMContentLoaded', function() {
      const tabs = document.querySelectorAll('.category-tab');
      const sections = document.querySelectorAll('.menu-section[id$="-section"]');

      tabs.forEach(tab => {
        tab.addEventListener('click', function() {
          // Remove active class from all tabs
          tabs.forEach(t => t.classList.remove('active'));
          // Add active class to clicked tab
          this.classList.add('active');

          // Get section to scroll to
          const tabText = this.textContent.toLowerCase();
          let targetSection = null;

          if (tabText.includes('traditional') || tabText.includes('wings')) {
            targetSection = document.getElementById('wings-section');
          } else if (tabText.includes('combo')) {
            targetSection = document.getElementById('combos-section');
          } else if (tabText.includes('sides')) {
            targetSection = document.getElementById('sides-section');
          } else if (tabText.includes('beverages')) {
            targetSection = document.getElementById('beverages-section');
          } else if (tabText.includes('sauces')) {
            targetSection = document.getElementById('sauces-section');
          }

          if (targetSection) {
            targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });
      });

      // Featured carousel navigation
      const featuredCarousel = document.querySelector('.featured-carousel');
      const prevBtn = document.querySelector('.prev-btn');
      const nextBtn = document.querySelector('.next-btn');

      if (featuredCarousel && prevBtn && nextBtn) {
        let scrollPosition = 0;
        const scrollStep = 200;

        nextBtn.addEventListener('click', function() {
          scrollPosition += scrollStep;
          featuredCarousel.scrollTo({ left: scrollPosition, behavior: 'smooth' });
          prevBtn.disabled = scrollPosition <= 0;
          nextBtn.disabled = scrollPosition >= featuredCarousel.scrollWidth - featuredCarousel.clientWidth;
        });

        prevBtn.addEventListener('click', function() {
          scrollPosition -= scrollStep;
          if (scrollPosition < 0) scrollPosition = 0;
          featuredCarousel.scrollTo({ left: scrollPosition, behavior: 'smooth' });
          prevBtn.disabled = scrollPosition <= 0;
          nextBtn.disabled = scrollPosition >= featuredCarousel.scrollWidth - featuredCarousel.clientWidth;
        });
      }

      // Search functionality
      const searchInput = document.querySelector('.search-input');
      if (searchInput) {
        searchInput.addEventListener('input', function() {
          const searchTerm = this.value.toLowerCase();
          const menuItems = document.querySelectorAll('.menu-item-card');

          menuItems.forEach(item => {
            const itemName = item.querySelector('.item-name').textContent.toLowerCase();
            const itemDesc = item.querySelector('.item-description').textContent.toLowerCase();

            if (itemName.includes(searchTerm) || itemDesc.includes(searchTerm)) {
              item.style.display = 'flex';
            } else {
              item.style.display = 'none';
            }
          });
        });
      }
    });
  `;
}

// Generate DoorDash-style JavaScript for full ordering functionality
function generateDoorDashJS() {
  return `
    // Generate optimized image URL for menu items (client-side)
    function generateOptimizedImageUrl(item, size = '200x200') {
      if (item.imageUrl || item.image) {
        const imageUrl = item.imageUrl || item.image;
        let filename = '';

        if (imageUrl.includes('/')) {
          const matches = imageUrl.match(/images%2F(.+?)\.(png|jpg|jpeg)/i);
          if (matches) {
            filename = matches[1];
          }
        } else {
          filename = imageUrl.replace(/\.(png|jpg|jpeg)$/i, '');
        }

        if (filename) {
          return \`https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2F\${filename}_\${size}.webp?alt=media\`;
        }
      }

      return 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fphilly-wings-express-logo.png?alt=media';
    }

    // Global cart state
    let cart = [];
    let currentItem = null;

    document.addEventListener('DOMContentLoaded', function() {
      initializeEventHandlers();
    });

    function initializeEventHandlers() {
      // Category sidebar navigation
      const categoryItems = document.querySelectorAll('.category-item');
      categoryItems.forEach(item => {
        item.addEventListener('click', function() {
          // Update active category
          categoryItems.forEach(c => c.classList.remove('active'));
          this.classList.add('active');

          // Scroll to category section
          const category = this.dataset.category;
          const section = document.getElementById(category + '-section');
          if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });
      });

      // Menu item clicks
      const menuItems = document.querySelectorAll('.menu-item');
      menuItems.forEach(item => {
        item.addEventListener('click', function() {
          openItemModal(JSON.parse(this.dataset.item), this.dataset.category);
        });
      });

      // Add item buttons
      const addButtons = document.querySelectorAll('.add-item-btn');
      addButtons.forEach(button => {
        button.addEventListener('click', function(e) {
          e.stopPropagation(); // Prevent opening modal
          const menuItem = this.closest('.menu-item');
          const itemData = JSON.parse(menuItem.dataset.item);
          addToCart(itemData);
        });
      });

      // Modal controls
      const modal = document.getElementById('item-modal');
      const closeModal = document.getElementById('close-modal');
      const addToCartBtn = document.getElementById('add-to-cart-btn');

      closeModal.addEventListener('click', () => {
        modal.classList.add('hidden');
      });

      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.add('hidden');
        }
      });

      addToCartBtn.addEventListener('click', () => {
        if (currentItem) {
          addToCart(currentItem);
          modal.classList.add('hidden');
        }
      });

      // Cart controls
      const cartIcon = document.querySelector('.cart-icon');
      const clearCart = document.getElementById('clear-cart');

      cartIcon.addEventListener('click', toggleCartSummary);
      clearCart.addEventListener('click', () => {
        cart = [];
        updateCartDisplay();
        updateCartSummary();
      });

      // Search functionality
      const searchInput = document.getElementById('menu-search');
      searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const menuItems = document.querySelectorAll('.menu-item');

        menuItems.forEach(item => {
          const itemName = item.querySelector('.item-name').textContent.toLowerCase();
          const itemDesc = item.querySelector('.item-description').textContent.toLowerCase();

          if (itemName.includes(searchTerm) || itemDesc.includes(searchTerm)) {
            item.style.display = 'flex';
          } else {
            item.style.display = 'none';
          }
        });
      });
    }

    function openItemModal(item, category) {
      currentItem = {...item, category};

      // Populate modal content
      document.getElementById('modal-item-name').textContent = item.name;
      document.getElementById('modal-item-description').textContent = item.description || '';
      document.getElementById('modal-item-image').src = generateOptimizedImageUrl(item, '800x800');
      document.getElementById('modal-item-image').alt = item.name;

      // Add rating if available
      const ratingElement = document.getElementById('modal-item-rating');
      if (category === 'wings' || category === 'combos') {
        ratingElement.innerHTML = '<span style="color: #0077c5; font-size: 12px; font-weight: 500;">#1 Most liked • 👍 89% (247)</span>';
      } else {
        ratingElement.innerHTML = '';
      }

      // Generate customization options based on category
      const optionsContainer = document.getElementById('modal-options');
      optionsContainer.innerHTML = generateCustomizationOptions(item, category);

      // Update add to cart button
      updateModalPrice();

      // Show modal
      document.getElementById('item-modal').classList.remove('hidden');
    }

    function generateCustomizationOptions(item, category) {
      let options = '';

      if (category === 'wings') {
        options = \`
          <div class="option-group">
            <h4>Wing Count</h4>
            <select class="option-select" data-option="wingCount">
              <option value="6">6 Wings (+$0.00)</option>
              <option value="10" selected>10 Wings (+$3.00)</option>
              <option value="15">15 Wings (+$6.00)</option>
              <option value="20">20 Wings (+$9.00)</option>
            </select>
          </div>
          <div class="option-group">
            <h4>Choose Flavors (Select at least 1)</h4>
            <div class="flavor-options">
              <label><input type="checkbox" name="flavor" value="Buffalo" checked> Buffalo</label>
              <label><input type="checkbox" name="flavor" value="BBQ"> BBQ</label>
              <label><input type="checkbox" name="flavor" value="Honey Mustard"> Honey Mustard</label>
              <label><input type="checkbox" name="flavor" value="Garlic Parmesan"> Garlic Parmesan</label>
              <label><input type="checkbox" name="flavor" value="Hot"> Hot</label>
            </div>
          </div>
        \`;
      } else if (category === 'combos') {
        options = \`
          <div class="option-group">
            <h4>Wing Flavors (Select at least 1)</h4>
            <div class="flavor-options">
              <label><input type="checkbox" name="flavor" value="Buffalo" checked> Buffalo</label>
              <label><input type="checkbox" name="flavor" value="BBQ"> BBQ</label>
              <label><input type="checkbox" name="flavor" value="Honey Mustard"> Honey Mustard</label>
            </div>
          </div>
          <div class="option-group">
            <h4>Side Choice</h4>
            <select class="option-select" data-option="side">
              <option value="Regular Fries" selected>Regular Fries</option>
              <option value="Seasoned Fries">Seasoned Fries (+$1.00)</option>
              <option value="Onion Rings">Onion Rings (+$2.00)</option>
            </select>
          </div>
          <div class="option-group">
            <h4>Drink Choice</h4>
            <select class="option-select" data-option="drink">
              <option value="Coca-Cola" selected>Coca-Cola</option>
              <option value="Sprite">Sprite</option>
              <option value="Orange Fanta">Orange Fanta</option>
              <option value="Water">Water</option>
            </select>
          </div>
        \`;
      } else if (category === 'sides') {
        options = \`
          <div class="option-group">
            <h4>Size</h4>
            <select class="option-select" data-option="size">
              <option value="Regular" selected>Regular</option>
              <option value="Large">Large (+$2.00)</option>
            </select>
          </div>
        \`;
      }

      return options;
    }

    function updateModalPrice() {
      if (!currentItem) return;

      let basePrice = parseFloat(currentItem.platformPrice);
      let additionalCost = 0;

      // Calculate additional costs from options
      const selects = document.querySelectorAll('.option-select');
      selects.forEach(select => {
        const option = select.value;
        if (option.includes('(+$')) {
          const match = option.match(/\\+\\$([0-9.]+)/);
          if (match) {
            additionalCost += parseFloat(match[1]);
          }
        }
      });

      const totalPrice = basePrice + additionalCost;
      document.getElementById('add-to-cart-btn').textContent = 'Add to cart - $' + totalPrice.toFixed(2);
    }

    function addToCart(item) {
      // Get customization details
      let customizations = {};

      // Get selected options from modal if open
      const modal = document.getElementById('item-modal');
      if (!modal.classList.contains('hidden')) {
        const selects = modal.querySelectorAll('.option-select');
        selects.forEach(select => {
          customizations[select.dataset.option] = select.value;
        });

        const checkboxes = modal.querySelectorAll('input[type="checkbox"]:checked');
        const flavors = [];
        checkboxes.forEach(cb => {
          if (cb.name === 'flavor') {
            flavors.push(cb.value);
          }
        });
        if (flavors.length > 0) {
          customizations.flavors = flavors;
        }
      }

      // Calculate final price with customizations
      let finalPrice = parseFloat(item.platformPrice);
      Object.values(customizations).forEach(value => {
        if (typeof value === 'string' && value.includes('(+$')) {
          const match = value.match(/\\+\\$([0-9.]+)/);
          if (match) {
            finalPrice += parseFloat(match[1]);
          }
        }
      });

      // Add to cart
      const cartItem = {
        ...item,
        customizations,
        finalPrice: finalPrice.toFixed(2),
        id: Date.now() + Math.random(),
        quantity: 1
      };

      cart.push(cartItem);
      updateCartDisplay();
      updateCartSummary();
    }

    function updateCartDisplay() {
      const cartCount = document.getElementById('cart-count');
      cartCount.textContent = cart.length;

      if (cart.length > 0) {
        document.getElementById('cart-summary').classList.remove('hidden');
      } else {
        document.getElementById('cart-summary').classList.add('hidden');
      }
    }

    function updateCartSummary() {
      const cartItemsContainer = document.getElementById('cart-items');
      cartItemsContainer.innerHTML = '';

      let subtotal = 0;

      cart.forEach((item, index) => {
        subtotal += parseFloat(item.finalPrice);

        const cartItemHtml = \`
          <div class="cart-item">
            <div class="cart-item-details">
              <h4>\${item.name}</h4>
              <p>\${Object.entries(item.customizations || {}).map(([key, value]) => \`\${key}: \${value}\`).join(', ')}</p>
              <span class="cart-item-price">$\${item.finalPrice}</span>
            </div>
            <button class="remove-item" onclick="removeFromCart(\${index})">×</button>
          </div>
        \`;
        cartItemsContainer.innerHTML += cartItemHtml;
      });

      // Calculate markup and total
      const markupPercent = ${branding.markupPercentage || 35};
      const markupAmount = (subtotal * markupPercent / 100);
      const total = subtotal + markupAmount;

      document.getElementById('cart-subtotal').textContent = subtotal.toFixed(2);
      document.getElementById('cart-markup').textContent = markupAmount.toFixed(2);
      document.getElementById('cart-total').textContent = total.toFixed(2);
    }

    function removeFromCart(index) {
      cart.splice(index, 1);
      updateCartDisplay();
      updateCartSummary();
    }

    function toggleCartSummary() {
      const cartSummary = document.getElementById('cart-summary');
      cartSummary.classList.toggle('hidden');
    }

    // Add event listener for option changes in modal
    document.addEventListener('change', function(e) {
      if (e.target.classList.contains('option-select')) {
        updateModalPrice();
      }
    });

    // Make removeFromCart available globally
    window.removeFromCart = removeFromCart;
  `;
}

// Generate GrubHub-style menu sections (text-only, no images)
function generateGrubHubMenuSections(wings, combos, sides, beverages, sauces) {
  let html = '';

  // Wings Section
  if (wings?.length > 0) {
    html += generateGrubHubSection('wings', 'Wings', wings, 'Perfect wings made to order with your choice of flavors.');
  }

  // Combos Section
  if (combos?.length > 0) {
    html += generateGrubHubSection('combos', 'Combo Meals', combos, 'Wings with sides and drinks for the ultimate meal.');
  }

  // Sides Section
  if (sides?.length > 0) {
    html += generateGrubHubSection('sides', 'Sides', sides, 'Delicious sides to complement your wings.');
  }

  // Beverages Section
  if (beverages?.length > 0) {
    html += generateGrubHubSection('beverages', 'Beverages', beverages, 'Refreshing drinks to wash down your meal.');
  }

  // Sauces Section
  if (sauces?.length > 0) {
    html += generateGrubHubSection('sauces', 'Extra Sauces', sauces, 'Add extra flavor with our signature sauces.');
  }

  return html;
}

// Generate GrubHub section with text-only layout
function generateGrubHubSection(categoryId, categoryName, items, description) {
  return `
    <div class="grubhub-category" id="${categoryId}-section">
      <div class="category-header">
        <h3 class="category-title">${categoryName}</h3>
        <p class="category-description">${description}</p>
      </div>
      <div class="category-items">
        ${items.map((item, index) => `
          <article class="grubhub-menu-item" data-item='${JSON.stringify(item)}' data-category="${categoryId}">
            <button class="item-button" data-item-name="${item.name}">
              <div class="item-content">
                <div class="item-details">
                  <h4 class="item-name">${item.name}</h4>
                  <p class="item-description">${item.description || ''}</p>
                  ${generateGrubHubItemExtras(item, categoryId)}
                </div>
                <div class="item-price">$${item.platformPrice}</div>
              </div>
            </button>
            <button class="plus-btn" data-item-name="${item.name}">
              <span class="plus-icon">+</span>
            </button>
          </article>
        `).join('')}
      </div>
    </div>
  `;
}

// Generate GrubHub item extras (ratings, tags, etc.)
function generateGrubHubItemExtras(item, categoryId) {
  let extras = '';

  // Add popular tag for featured items
  if (categoryId === 'wings' || categoryId === 'combos') {
    const popularTags = ['Most ordered on Grubhub', 'Popular', 'Recommended', 'Customer favorite'];
    const randomTag = popularTags[Math.floor(Math.random() * popularTags.length)];
    extras += `<span class="item-tag">${randomTag}</span>`;
  }

  return extras;
}

// Generate GrubHub CSS
function generateGrubHubCSS(branding) {
  return `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif;
      background-color: #f5f5f5;
      color: #333;
    }

    .grubhub-header {
      background: #ff6600;
      color: white;
      padding: 12px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .grubhub-logo {
      height: 32px;
    }

    .search-container {
      flex: 1;
      max-width: 400px;
      margin: 0 20px;
    }

    .search-input {
      width: 100%;
      padding: 8px 12px;
      border: none;
      border-radius: 4px;
      font-size: 14px;
    }

    .header-actions {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .sign-in-btn, .cart-btn {
      background: none;
      border: 1px solid white;
      color: white;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }

    .restaurant-header {
      background: white;
      padding: 20px 16px;
      border-bottom: 1px solid #e0e0e0;
    }

    .restaurant-title {
      font-size: 28px;
      font-weight: bold;
      margin-bottom: 8px;
    }

    .restaurant-info {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      font-size: 14px;
      color: #666;
    }

    .rating {
      color: #ff6600;
      font-weight: bold;
    }

    .delivery-info {
      color: #666;
      font-size: 14px;
    }

    .menu-navigation {
      background: white;
      border-bottom: 1px solid #e0e0e0;
      padding: 0 16px;
      overflow-x: auto;
      white-space: nowrap;
    }

    .nav-tabs {
      display: flex;
      gap: 24px;
    }

    .nav-tab {
      padding: 16px 0;
      border-bottom: 2px solid transparent;
      color: #666;
      text-decoration: none;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .nav-tab.active {
      color: #ff6600;
      border-bottom-color: #ff6600;
    }

    .menu-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px 16px;
    }

    .grubhub-category {
      background: white;
      margin-bottom: 24px;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .category-header {
      padding: 20px;
      border-bottom: 1px solid #f0f0f0;
    }

    .category-title {
      font-size: 20px;
      font-weight: bold;
      margin-bottom: 4px;
    }

    .category-description {
      font-size: 14px;
      color: #666;
    }

    .grubhub-menu-item {
      border-bottom: 1px solid #f0f0f0;
      position: relative;
    }

    .grubhub-menu-item:last-child {
      border-bottom: none;
    }

    .item-button {
      width: 100%;
      padding: 16px 60px 16px 20px;
      background: none;
      border: none;
      text-align: left;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .item-button:hover {
      background-color: #f9f9f9;
    }

    .item-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .item-details {
      flex: 1;
      margin-right: 16px;
    }

    .item-name {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 4px;
      color: #333;
    }

    .item-description {
      font-size: 14px;
      color: #666;
      line-height: 1.4;
      margin-bottom: 4px;
    }

    .item-tag {
      display: inline-block;
      background: #f0f8f0;
      color: #2d7d32;
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 12px;
      font-weight: 500;
    }

    .item-price {
      font-size: 16px;
      font-weight: bold;
      color: #333;
    }

    .plus-btn {
      position: absolute;
      right: 16px;
      top: 50%;
      transform: translateY(-50%);
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 1px solid #ff6600;
      background: white;
      color: #ff6600;
      font-size: 18px;
      font-weight: bold;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .plus-btn:hover {
      background: #ff6600;
      color: white;
    }

    .modal-overlay {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 1000;
    }

    .modal-content {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      border-radius: 8px;
      max-width: 500px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-header {
      padding: 20px;
      border-bottom: 1px solid #e0e0e0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .modal-title {
      font-size: 20px;
      font-weight: bold;
    }

    .close-modal {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      padding: 0;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .modal-body {
      padding: 20px;
    }

    .modal-description {
      font-size: 14px;
      color: #666;
      margin-bottom: 20px;
    }

    .quantity-controls {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 20px 0;
    }

    .quantity-btn {
      width: 32px;
      height: 32px;
      border: 1px solid #ddd;
      background: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }

    .quantity-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .quantity-input {
      width: 40px;
      text-align: center;
      border: none;
      font-size: 16px;
      font-weight: bold;
    }

    .add-to-bag {
      width: 100%;
      background: #ff6600;
      color: white;
      border: none;
      padding: 16px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: bold;
      cursor: pointer;
      margin-top: 20px;
    }

    .add-to-bag:hover {
      background: #e55a00;
    }

    @media (max-width: 768px) {
      .restaurant-title {
        font-size: 24px;
      }

      .menu-content {
        padding: 16px 12px;
      }

      .grubhub-category {
        margin-bottom: 16px;
      }
    }

    // Wing Modal System Variables
    let currentModalStep = 1;
    let selectedWingVariant = null;
    let selectedSauces = [];
    let selectedWingStyle = 'regular';
    let selectedExtraDips = [];
    let modalWingsData = [];
    let currentWingType = '';

    // Wing Modal Functions
    window.openWingModal = function(wingType, wingsData) {
        currentWingType = wingType;
        modalWingsData = wingsData;
        currentModalStep = 1;
        selectedWingVariant = null;
        selectedSauces = [];
        selectedWingStyle = 'regular';
        selectedExtraDips = [];

        const modal = document.getElementById('wingModal');
        modal.classList.add('active');
        modal.style.display = 'flex';

        // Reset progress indicators
        document.querySelectorAll('.progress-step').forEach((step, index) => {
            step.classList.remove('active', 'completed');
            if (index === 0) step.classList.add('active');
        });

        // Reset modal steps
        document.querySelectorAll('.modal-step').forEach(step => {
            step.classList.remove('active');
        });
        document.getElementById('modalStep1').classList.add('active');

        // Initialize step 1 - Wing variants
        populateWingVariants();
        updateModalButtons();

        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    };

    window.closeWingModal = function() {
        const modal = document.getElementById('wingModal');
        modal.classList.remove('active');

        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }, 300);
    };

    window.navigateModalStep = function(direction) {
        if (direction === 1) {
            // Moving forward
            if (currentModalStep === 1 && !selectedWingVariant) {
                alert('Please select a wing size first');
                return;
            }
            if (currentModalStep === 2 && selectedSauces.length === 0) {
                alert('Please select at least one sauce');
                return;
            }
        }

        // Update step
        currentModalStep += direction;

        if (currentModalStep < 1) currentModalStep = 1;
        if (currentModalStep > 5) currentModalStep = 5;

        // Update progress indicators
        document.querySelectorAll('.progress-step').forEach((step, index) => {
            step.classList.remove('active', 'completed');
            if (index < currentModalStep - 1) {
                step.classList.add('completed');
            } else if (index === currentModalStep - 1) {
                step.classList.add('active');
            }
        });

        // Show current step
        document.querySelectorAll('.modal-step').forEach((step, index) => {
            step.classList.remove('active');
            if (index === currentModalStep - 1) {
                step.classList.add('active');
            }
        });

        // Initialize step content
        if (currentModalStep === 2) populateSauceSelection();
        if (currentModalStep === 3) populateWingStyleOptions();
        if (currentModalStep === 4) populateExtraDips();
        if (currentModalStep === 5) populateOrderSummary();

        updateModalButtons();
    };

    function populateWingVariants() {
        const container = document.getElementById('wingVariants');
        container.innerHTML = modalWingsData.map(variant => {
            return '<div class="wing-variant-option" onclick="selectWingVariant(\\'' + variant.id + '\\')\">' +
                '<div class="wing-variant-info">' +
                    '<div class="wing-variant-details">' +
                        '<h4>' + variant.count + ' ' + currentWingType + ' Wings</h4>' +
                        '<p>' + (variant.includedSauces || Math.floor(variant.count / 6)) + ' sauce' + ((variant.includedSauces || Math.floor(variant.count / 6)) > 1 ? 's' : '') + ' included</p>' +
                    '</div>' +
                    '<div class="wing-variant-price">$' + variant.platformPrice.toFixed(2) + '</div>' +
                '</div>' +
            '</div>';
        }).join('');
    }

    window.selectWingVariant = function(variantId) {
        selectedWingVariant = modalWingsData.find(v => v.id === variantId);

        // Update UI
        document.querySelectorAll('.wing-variant-option').forEach(option => {
            option.classList.remove('selected');
        });
        event.target.closest('.wing-variant-option').classList.add('selected');
    };

    function populateSauceSelection() {
        // For now, create sample sauce data - in production this would come from Firestore
        const sampleSauces = [
            { id: 'buffalo', name: 'Classic Buffalo', category: 'signature', heatLevel: 2 },
            { id: 'bbq', name: 'Sweet BBQ', category: 'signature', heatLevel: 1 },
            { id: 'honey_mustard', name: 'Honey Mustard', category: 'signature', heatLevel: 1 },
            { id: 'ranch', name: 'Ranch', category: 'dipping', heatLevel: 0 },
            { id: 'blue_cheese', name: 'Blue Cheese', category: 'dipping', heatLevel: 0 },
            { id: 'cajun_dry', name: 'Cajun Dry Rub', category: 'dry-rub', heatLevel: 3 }
        ];

        const maxSauces = selectedWingVariant ? (selectedWingVariant.includedSauces || Math.floor(selectedWingVariant.count / 6)) : 1;

        const container = document.getElementById('sauceSelection');
        container.innerHTML =
            '<div class="sauce-limit-info">Select up to ' + maxSauces + ' sauce' + (maxSauces > 1 ? 's' : '') + ' (included with your wings)</div>' +
            sampleSauces.map(sauce => {
                return '<div class="sauce-option" onclick="toggleSauce(\\'' + sauce.id + '\\')\">' +
                    '<h5>' + sauce.name + '</h5>' +
                    '<p>Heat: ' + '🔥'.repeat(sauce.heatLevel || 1) + '</p>' +
                '</div>';
            }).join('');
    }

    window.toggleSauce = function(sauceId) {
        const maxSauces = selectedWingVariant ? (selectedWingVariant.includedSauces || Math.floor(selectedWingVariant.count / 6)) : 1;

        const index = selectedSauces.indexOf(sauceId);
        if (index > -1) {
            // Remove sauce
            selectedSauces.splice(index, 1);
            event.target.closest('.sauce-option').classList.remove('selected');
        } else {
            // Add sauce if under limit
            if (selectedSauces.length < maxSauces) {
                selectedSauces.push(sauceId);
                event.target.closest('.sauce-option').classList.add('selected');
            } else {
                alert('You can only select up to ' + maxSauces + ' sauce' + (maxSauces > 1 ? 's' : ''));
            }
        }
    };

    function populateWingStyleOptions() {
        const container = document.getElementById('wingStyleOptions');
        container.innerHTML =
            '<div class="wing-variant-option ' + (selectedWingStyle === 'regular' ? 'selected' : '') + '" onclick="selectWingStyle(\\'regular\\')">' +
                '<div class="wing-variant-info">' +
                    '<div class="wing-variant-details">' +
                        '<h4>Regular Mix</h4>' +
                        '<p>Mix of drums and flats (no extra charge)</p>' +
                    '</div>' +
                    '<div class="wing-variant-price">$0.00</div>' +
                '</div>' +
            '</div>' +
            '<div class="wing-variant-option ' + (selectedWingStyle === 'all-drums' ? 'selected' : '') + '" onclick="selectWingStyle(\\'all-drums\\')">' +
                '<div class="wing-variant-info">' +
                    '<div class="wing-variant-details">' +
                        '<h4>All Drums</h4>' +
                        '<p>All drumstick pieces</p>' +
                    '</div>' +
                    '<div class="wing-variant-price">+$1.50</div>' +
                '</div>' +
            '</div>' +
            '<div class="wing-variant-option ' + (selectedWingStyle === 'all-flats' ? 'selected' : '') + '" onclick="selectWingStyle(\\'all-flats\\')">' +
                '<div class="wing-variant-info">' +
                    '<div class="wing-variant-details">' +
                        '<h4>All Flats</h4>' +
                        '<p>All wing flat pieces</p>' +
                    '</div>' +
                    '<div class="wing-variant-price">+$1.50</div>' +
                '</div>' +
            '</div>';
    }

    window.selectWingStyle = function(style) {
        selectedWingStyle = style;

        // Update UI
        document.querySelectorAll('#wingStyleOptions .wing-variant-option').forEach(option => {
            option.classList.remove('selected');
        });
        event.target.closest('.wing-variant-option').classList.add('selected');
    };

    function populateExtraDips() {
        const extraDips = [
            { id: 'extra_ranch', name: 'Extra Ranch', price: 0.75 },
            { id: 'extra_blue_cheese', name: 'Extra Blue Cheese', price: 0.75 },
            { id: 'extra_buffalo', name: 'Extra Buffalo Sauce', price: 0.75 },
            { id: 'extra_bbq', name: 'Extra BBQ Sauce', price: 0.75 }
        ];

        const container = document.getElementById('extraDips');
        container.innerHTML = extraDips.map(dip => {
            return '<div class="sauce-option ' + (selectedExtraDips.includes(dip.id) ? 'selected' : '') + '" onclick="toggleExtraDip(\\'' + dip.id + '\\')\">' +
                '<h5>' + dip.name + '</h5>' +
                '<p>+$' + dip.price.toFixed(2) + '</p>' +
            '</div>';
        }).join('');
    }

    window.toggleExtraDip = function(dipId) {
        const index = selectedExtraDips.indexOf(dipId);
        if (index > -1) {
            selectedExtraDips.splice(index, 1);
            event.target.classList.remove('selected');
        } else {
            selectedExtraDips.push(dipId);
            event.target.classList.add('selected');
        }
    };

    function populateOrderSummary() {
        if (!selectedWingVariant) return;

        const wingStyleUpcharge = selectedWingStyle !== 'regular' ? 1.50 : 0;
        const extraDipsTotal = selectedExtraDips.length * 0.75;
        const totalPrice = selectedWingVariant.platformPrice + wingStyleUpcharge + extraDipsTotal;

        const container = document.getElementById('orderSummary');
        container.innerHTML =
            '<div style="text-align: left; font-size: 16px; line-height: 1.6;">' +
                '<h4 style="margin-bottom: 16px; color: #1a1a1a;">' + selectedWingVariant.count + ' ' + currentWingType + ' Wings</h4>' +
                '<p style="margin-bottom: 8px; color: #666;">Base Price: $' + selectedWingVariant.platformPrice.toFixed(2) + '</p>' +
                '<p style="margin-bottom: 8px; color: #666;">Sauces: ' + selectedSauces.length + ' included</p>' +
                '<p style="margin-bottom: 8px; color: #666;">Style: ' + selectedWingStyle.replace('-', ' ') + (wingStyleUpcharge > 0 ? ' (+$' + wingStyleUpcharge.toFixed(2) + ')' : '') + '</p>' +
                (selectedExtraDips.length > 0 ? '<p style="margin-bottom: 8px; color: #666;">Extra Dips: ' + selectedExtraDips.length + ' (+$' + extraDipsTotal.toFixed(2) + ')</p>' : '') +
                '<hr style="margin: 16px 0; border: none; border-top: 1px solid #eee;">' +
                '<p style="font-size: 18px; font-weight: bold; color: #ff6b35;">Total: $' + totalPrice.toFixed(2) + '</p>' +
            '</div>';
    }

    function updateModalButtons() {
        const backBtn = document.getElementById('modalBackBtn');
        const nextBtn = document.getElementById('modalNextBtn');
        const addToCartBtn = document.getElementById('modalAddToCartBtn');

        // Show/hide back button
        backBtn.style.display = currentModalStep > 1 ? 'block' : 'none';

        // Show/hide next vs add to cart button
        if (currentModalStep === 5) {
            nextBtn.style.display = 'none';
            addToCartBtn.style.display = 'block';
        } else {
            nextBtn.style.display = 'block';
            addToCartBtn.style.display = 'none';
        }
    }

    window.addWingOrderToCart = function() {
        if (!selectedWingVariant) {
            alert('Please complete your wing selection');
            return;
        }

        // Calculate final price
        const wingStyleUpcharge = selectedWingStyle !== 'regular' ? 1.50 : 0;
        const extraDipsTotal = selectedExtraDips.length * 0.75;
        const totalPrice = selectedWingVariant.platformPrice + wingStyleUpcharge + extraDipsTotal;

        // For now, just show success message - in production this would integrate with platform cart
        alert('Added ' + selectedWingVariant.count + ' ' + currentWingType + ' wings to your cart! Total: $' + totalPrice.toFixed(2));

        closeWingModal();
    };
  `;
}

// Generate complete HTML response for any platform (unified strategic layout)
function generateMenuHTML(menuData, platform, settings = {}) {
  const { branding, wings, sides, beverages, combos, sauces, markupPercentage } = menuData;

  // Get platform-specific multiplier
  const platformMultipliers = {
    'doordash': 1.35,
    'ubereats': 1.35,
    'grubhub': 1.215
  };

  const multiplier = platformMultipliers[platform] || 1.35;

  return generateStrategicMenuHTML(menuData, platform, settings, multiplier);
}

// Generate strategic menu HTML with psychological upselling
function generateStrategicMenuHTML(menuData, platform, settings, multiplier) {
  const { branding, wings, sides, beverages, combos, sauces } = menuData;

  // Define strategic menu data with pricing
  const strategicMenu = createStrategicMenuData(wings, combos, sides, beverages, sauces, multiplier);

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Order Philly Wings Express - Best Wings in Philadelphia | ${getPlatformName(platform)}">
    <meta name="robots" content="index, follow">
    <title>Philly Wings Express - Best Wings in Philadelphia | ${getPlatformName(platform)}</title>
    <link rel="icon" href="https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/favicon.ico?alt=media">
    <style>${platform === 'grubhub' ? generateGrubHubCSS() : generateDoorDashCSS()}</style>
</head>
<body class="platform-${platform}">
    <div class="header-placeholder"></div>
    <div class="hero-section">
        <h1>Philly Wings Express</h1>
        <p>Best Wings in Philadelphia | Order Now on ${getPlatformName(platform)}</p>
    </div>
    <nav class="menu-navigation">
        <a href="#combos">Combos</a>
        <a href="#wings">Wings</a>
        <a href="#sides">Sides</a>
        <a href="#dips">Dips</a>
        <a href="#beverages">Drinks</a>
        <a href="#sauces">Sauces</a>
    </nav>
    <div class="menu-container">
        ${generateCombosSection(strategicMenu.combos, { name: getPlatformName(platform) })}
        ${generateWingsSection(strategicMenu.wings, { name: getPlatformName(platform) })}
        ${generateSidesSection(strategicMenu.sides, { name: getPlatformName(platform) })}
        ${generateDipsSection(strategicMenu.dips || [], { name: getPlatformName(platform) })}
        ${generateBeveragesSection(strategicMenu.beverages, { name: getPlatformName(platform) })}
        ${generateSaucesSection(strategicMenu.sauces || [], { name: getPlatformName(platform) })}
    </div>
    <div class="order-modal-placeholder"></div>
    <script>
        // Beverage modal functionality
        function openBeverageModal(beverageData) {
            // Create modal if it doesn't exist
            let modal = document.getElementById('beverage-modal');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'beverage-modal';
                modal.className = 'modal-overlay';
                modal.innerHTML =
                    '<div class="modal-content">' +
                        '<div class="modal-header">' +
                            '<h2 id="beverage-modal-title" class="modal-title"></h2>' +
                            '<button class="close-modal" onclick="closeBeverageModal()">&times;</button>' +
                        '</div>' +
                        '<div class="modal-body">' +
                            '<div id="beverage-modal-image" class="modal-image-wrapper"></div>' +
                            '<p id="beverage-modal-description" class="modal-description"></p>' +
                            '<div id="beverage-options" class="beverage-options"></div>' +
                            '<div class="quantity-controls">' +
                                '<button class="quantity-btn" onclick="decreaseBeverageQuantity()">−</button>' +
                                '<input type="number" id="beverage-quantity" class="quantity-input" value="1" min="1">' +
                                '<button class="quantity-btn" onclick="increaseBeverageQuantity()">+</button>' +
                            '</div>' +
                            '<button id="add-beverage-btn" class="add-to-bag" onclick="addBeverageToCart()">Add to bag</button>' +
                        '</div>' +
                    '</div>';
                document.body.appendChild(modal);
            }

            // Populate modal with beverage data
            document.getElementById('beverage-modal-title').textContent = beverageData.name;
            document.getElementById('beverage-modal-description').textContent = beverageData.description;

            // Add image
            const imageWrapper = document.getElementById('beverage-modal-image');
            imageWrapper.innerHTML = '<img src="' + beverageData.imageUrl + '" alt="' + beverageData.name + '" style="width: 100%; max-width: 200px; height: auto; border-radius: 12px;">';

            // Handle options (fountain drinks, tea sizes, etc.)
            const optionsDiv = document.getElementById('beverage-options');
            if (beverageData.details && beverageData.details.length > 0) {
                optionsDiv.innerHTML = '<h4>Available Options:</h4>' +
                    beverageData.details.map(option =>
                        '<div class="option-item" onclick="selectBeverageOption(\\'' + option.name + '\\', ' + option.price + ')">' +
                            '<span class="option-name">' + option.name + '</span>' +
                            '<span class="option-price">$' + option.price.toFixed(2) + '</span>' +
                        '</div>'
                    ).join('');

                // Select first option by default
                selectBeverageOption(beverageData.details[0].name, beverageData.details[0].price);
            } else {
                optionsDiv.innerHTML = '';
                window.currentBeverageSelection = {
                    name: beverageData.name,
                    price: beverageData.platformPrice,
                    baseData: beverageData
                };
            }

            updateBeverageModalPrice();
            modal.style.display = 'block';
        }

        function closeBeverageModal() {
            const modal = document.getElementById('beverage-modal');
            if (modal) modal.style.display = 'none';
            window.currentBeverageSelection = null;
        }

        function selectBeverageOption(name, price) {
            // Update selection
            window.currentBeverageSelection = { name, price };

            // Update UI to show selected option
            document.querySelectorAll('.option-item').forEach(item => item.classList.remove('selected'));
            event.target.closest('.option-item').classList.add('selected');

            updateBeverageModalPrice();
        }

        function increaseBeverageQuantity() {
            const input = document.getElementById('beverage-quantity');
            input.value = parseInt(input.value) + 1;
            updateBeverageModalPrice();
        }

        function decreaseBeverageQuantity() {
            const input = document.getElementById('beverage-quantity');
            if (parseInt(input.value) > 1) {
                input.value = parseInt(input.value) - 1;
                updateBeverageModalPrice();
            }
        }

        function updateBeverageModalPrice() {
            if (!window.currentBeverageSelection) return;
            const quantity = parseInt(document.getElementById('beverage-quantity').value);
            const total = (window.currentBeverageSelection.price * quantity).toFixed(2);
            document.getElementById('add-beverage-btn').textContent = 'Add to bag: $' + total;
        }

        function addBeverageToCart() {
            if (!window.currentBeverageSelection) return;
            const quantity = parseInt(document.getElementById('beverage-quantity').value);

            // Add to cart (you can integrate with existing cart system)
            console.log('Added to cart:', {
                item: window.currentBeverageSelection.name,
                quantity: quantity,
                unitPrice: window.currentBeverageSelection.price,
                total: window.currentBeverageSelection.price * quantity
            });

            // Show success message
            alert('Added ' + quantity + 'x ' + window.currentBeverageSelection.name + ' to your order!');

            closeBeverageModal();
        }

        // Close modal when clicking outside
        window.addEventListener('click', function(event) {
            const modal = document.getElementById('beverage-modal');
            if (event.target === modal) {
                closeBeverageModal();
            }
        });

        // Wing Modal System Variables
        let currentModalStep = 1;
        let selectedWingVariant = null;
        let selectedSauces = [];
        let selectedWingStyle = 'regular';
        let selectedExtraDips = [];
        let modalWingsData = [];
        let currentWingType = '';

        // Wing Modal Functions
        window.openWingModal = function(wingType) {
            console.log('Opening wing modal:', wingType); // Debug log
            currentWingType = wingType;

            // Create sample wing data for the selected type
            if (wingType === 'boneless') {
                modalWingsData = [
                    { id: 'wings_6_boneless', name: '6 Wings (Boneless)', count: 6, platformPrice: 9.44, includedSauces: 1 },
                    { id: 'wings_12_boneless', name: '12 Wings (Boneless)', count: 12, platformPrice: 16.19, includedSauces: 2 },
                    { id: 'wings_24_boneless', name: '24 Wings (Boneless)', count: 24, platformPrice: 28.34, includedSauces: 4 },
                    { id: 'wings_30_boneless', name: '30 Wings (Boneless)', count: 30, platformPrice: 35.09, includedSauces: 5 }
                ];
            } else {
                modalWingsData = [
                    { id: 'wings_6_bonein', name: '6 Wings (Bone-In)', count: 6, platformPrice: 12.14, includedSauces: 1 },
                    { id: 'wings_12_bonein', name: '12 Wings (Bone-In)', count: 12, platformPrice: 20.24, includedSauces: 2 },
                    { id: 'wings_24_bonein', name: '24 Wings (Bone-In)', count: 24, platformPrice: 35.09, includedSauces: 4 },
                    { id: 'wings_30_bonein', name: '30 Wings (Bone-In)', count: 30, platformPrice: 44.54, includedSauces: 5 }
                ];
            }

            console.log('Using wing data:', modalWingsData); // Debug log
            currentModalStep = 1;
            selectedWingVariant = null;
            selectedSauces = [];
            selectedWingStyle = 'regular';
            selectedExtraDips = [];

            const modal = document.getElementById('wingModal');
            modal.classList.add('active');
            modal.style.display = 'flex';

            // Reset progress indicators
            document.querySelectorAll('.progress-step').forEach((step, index) => {
                step.classList.remove('active', 'completed');
                if (index === 0) step.classList.add('active');
            });

            // Reset modal steps
            document.querySelectorAll('.modal-step').forEach(step => {
                step.classList.remove('active');
            });
            document.getElementById('modalStep1').classList.add('active');

            // Initialize step 1 - Wing variants
            populateWingVariants();
            updateModalButtons();

            // Prevent body scroll
            document.body.style.overflow = 'hidden';
        };

        window.closeWingModal = function() {
            const modal = document.getElementById('wingModal');
            modal.classList.remove('active');

            setTimeout(() => {
                modal.style.display = 'none';
                document.body.style.overflow = '';
            }, 300);
        };

        window.navigateModalStep = function(direction) {
            if (direction === 1) {
                // Moving forward
                if (currentModalStep === 1 && !selectedWingVariant) {
                    alert('Please select a wing size first');
                    return;
                }
                if (currentModalStep === 2 && selectedSauces.length === 0) {
                    alert('Please select at least one sauce');
                    return;
                }
            }

            // Update step
            currentModalStep += direction;

            if (currentModalStep < 1) currentModalStep = 1;
            if (currentModalStep > 5) currentModalStep = 5;

            // Update progress indicators
            document.querySelectorAll('.progress-step').forEach((step, index) => {
                step.classList.remove('active', 'completed');
                if (index < currentModalStep - 1) {
                    step.classList.add('completed');
                } else if (index === currentModalStep - 1) {
                    step.classList.add('active');
                }
            });

            // Show current step
            document.querySelectorAll('.modal-step').forEach((step, index) => {
                step.classList.remove('active');
                if (index === currentModalStep - 1) {
                    step.classList.add('active');
                }
            });

            // Initialize step content
            if (currentModalStep === 2) populateSauceSelection();
            if (currentModalStep === 3) populateWingStyleOptions();
            if (currentModalStep === 4) populateExtraDips();
            if (currentModalStep === 5) populateOrderSummary();

            updateModalButtons();
        };

        function populateWingVariants() {
            console.log('Populating wing variants with data:', modalWingsData); // Debug log
            const container = document.getElementById('wingVariants');
            if (!container) {
                console.error('wingVariants container not found!');
                return;
            }

            if (!modalWingsData || !Array.isArray(modalWingsData)) {
                console.error('Invalid modalWingsData:', modalWingsData);
                container.innerHTML = '<p>Error loading wing options. Please refresh and try again.</p>';
                return;
            }

            container.innerHTML = modalWingsData.map(variant =>
                '<div class="wing-variant-option" onclick="selectWingVariant(\\'' + variant.id + '\\')\">' +
                    '<div class="wing-variant-info">' +
                        '<div class="wing-variant-details">' +
                            '<h4>' + variant.count + ' ' + currentWingType + ' Wings</h4>' +
                            '<p>' + (variant.includedSauces || Math.floor(variant.count / 6)) + ' sauce' + ((variant.includedSauces || Math.floor(variant.count / 6)) > 1 ? 's' : '') + ' included</p>' +
                        '</div>' +
                        '<div class="wing-variant-price">$' + variant.platformPrice.toFixed(2) + '</div>' +
                    '</div>' +
                '</div>'
            ).join('');
            console.log('Wing variants populated, HTML length:', container.innerHTML.length); // Debug log
        }

        window.selectWingVariant = function(variantId) {
            selectedWingVariant = modalWingsData.find(v => v.id === variantId);

            // Update UI
            document.querySelectorAll('.wing-variant-option').forEach(option => {
                option.classList.remove('selected');
            });
            event.target.closest('.wing-variant-option').classList.add('selected');
        };

        function populateSauceSelection() {
            // For now, create sample sauce data - in production this would come from Firestore
            const sampleSauces = [
                { id: 'buffalo', name: 'Classic Buffalo', category: 'signature', heatLevel: 2 },
                { id: 'bbq', name: 'Sweet BBQ', category: 'signature', heatLevel: 1 },
                { id: 'honey_mustard', name: 'Honey Mustard', category: 'signature', heatLevel: 1 },
                { id: 'ranch', name: 'Ranch', category: 'dipping', heatLevel: 0 },
                { id: 'blue_cheese', name: 'Blue Cheese', category: 'dipping', heatLevel: 0 },
                { id: 'cajun_dry', name: 'Cajun Dry Rub', category: 'dry-rub', heatLevel: 3 }
            ];

            const maxSauces = selectedWingVariant ? (selectedWingVariant.includedSauces || Math.floor(selectedWingVariant.count / 6)) : 1;

            const container = document.getElementById('sauceSelection');
            container.innerHTML =
                '<div class="sauce-limit-info">Select up to ' + maxSauces + ' sauce' + (maxSauces > 1 ? 's' : '') + ' (included with your wings)</div>' +
                sampleSauces.map(sauce =>
                    '<div class="sauce-option" onclick="toggleSauce(\\'' + sauce.id + '\\')\">' +
                        '<h5>' + sauce.name + '</h5>' +
                        '<p>Heat: ' + '🔥'.repeat(sauce.heatLevel || 1) + '</p>' +
                    '</div>'
                ).join('');
        }

        window.toggleSauce = function(sauceId) {
            const maxSauces = selectedWingVariant ? (selectedWingVariant.includedSauces || Math.floor(selectedWingVariant.count / 6)) : 1;

            const index = selectedSauces.indexOf(sauceId);
            if (index > -1) {
                // Remove sauce
                selectedSauces.splice(index, 1);
                event.target.closest('.sauce-option').classList.remove('selected');
            } else {
                // Add sauce if under limit
                if (selectedSauces.length < maxSauces) {
                    selectedSauces.push(sauceId);
                    event.target.closest('.sauce-option').classList.add('selected');
                } else {
                    alert('You can only select up to ' + maxSauces + ' sauce' + (maxSauces > 1 ? 's' : ''));
                }
            }
        };

        function populateWingStyleOptions() {
            const container = document.getElementById('wingStyleOptions');
            container.innerHTML = \`
                <div class="wing-variant-option \${selectedWingStyle === 'regular' ? 'selected' : ''}" onclick="selectWingStyle('regular')">
                    <div class="wing-variant-info">
                        <div class="wing-variant-details">
                            <h4>Regular Mix</h4>
                            <p>Mix of drums and flats (no extra charge)</p>
                        </div>
                        <div class="wing-variant-price">$0.00</div>
                    </div>
                </div>
                <div class="wing-variant-option \${selectedWingStyle === 'all-drums' ? 'selected' : ''}" onclick="selectWingStyle('all-drums')">
                    <div class="wing-variant-info">
                        <div class="wing-variant-details">
                            <h4>All Drums</h4>
                            <p>All drumstick pieces</p>
                        </div>
                        <div class="wing-variant-price">+$1.50</div>
                    </div>
                </div>
                <div class="wing-variant-option \${selectedWingStyle === 'all-flats' ? 'selected' : ''}" onclick="selectWingStyle('all-flats')">
                    <div class="wing-variant-info">
                        <div class="wing-variant-details">
                            <h4>All Flats</h4>
                            <p>All wing flat pieces</p>
                        </div>
                        <div class="wing-variant-price">+$1.50</div>
                    </div>
                </div>
            \`;
        }

        window.selectWingStyle = function(style) {
            selectedWingStyle = style;

            // Update UI
            document.querySelectorAll('#wingStyleOptions .wing-variant-option').forEach(option => {
                option.classList.remove('selected');
            });
            event.target.closest('.wing-variant-option').classList.add('selected');
        };

        function populateExtraDips() {
            const extraDips = [
                { id: 'extra_ranch', name: 'Extra Ranch', price: 0.75 },
                { id: 'extra_blue_cheese', name: 'Extra Blue Cheese', price: 0.75 },
                { id: 'extra_buffalo', name: 'Extra Buffalo Sauce', price: 0.75 },
                { id: 'extra_bbq', name: 'Extra BBQ Sauce', price: 0.75 }
            ];

            const container = document.getElementById('extraDips');
            container.innerHTML = extraDips.map(dip => \`
                <div class="sauce-option \${selectedExtraDips.includes(dip.id) ? 'selected' : ''}" onclick="toggleExtraDip('\${dip.id}')">
                    <h5>\${dip.name}</h5>
                    <p>+$\${dip.price.toFixed(2)}</p>
                </div>
            \`).join('');
        }

        window.toggleExtraDip = function(dipId) {
            const index = selectedExtraDips.indexOf(dipId);
            if (index > -1) {
                selectedExtraDips.splice(index, 1);
                event.target.classList.remove('selected');
            } else {
                selectedExtraDips.push(dipId);
                event.target.classList.add('selected');
            }
        };

        function populateOrderSummary() {
            if (!selectedWingVariant) return;

            const wingStyleUpcharge = selectedWingStyle !== 'regular' ? 1.50 : 0;
            const extraDipsTotal = selectedExtraDips.length * 0.75;
            const totalPrice = selectedWingVariant.platformPrice + wingStyleUpcharge + extraDipsTotal;

            const container = document.getElementById('orderSummary');
            container.innerHTML =
                '<div style="text-align: left; font-size: 16px; line-height: 1.6;">' +
                    '<h4 style="margin-bottom: 16px; color: #1a1a1a;">' + selectedWingVariant.count + ' ' + currentWingType + ' Wings</h4>' +
                    '<p style="margin-bottom: 8px; color: #666;">Base Price: $' + selectedWingVariant.platformPrice.toFixed(2) + '</p>' +
                    '<p style="margin-bottom: 8px; color: #666;">Sauces: ' + selectedSauces.length + ' included</p>' +
                    '<p style="margin-bottom: 8px; color: #666;">Style: ' + selectedWingStyle.replace('-', ' ') + (wingStyleUpcharge > 0 ? ' (+$' + wingStyleUpcharge.toFixed(2) + ')' : '') + '</p>' +
                    (selectedExtraDips.length > 0 ? '<p style="margin-bottom: 8px; color: #666;">Extra Dips: ' + selectedExtraDips.length + ' (+$' + extraDipsTotal.toFixed(2) + ')</p>' : '') +
                    '<hr style="margin: 16px 0; border: none; border-top: 1px solid #eee;">' +
                    '<p style="font-size: 18px; font-weight: bold; color: #ff6b35;">Total: $' + totalPrice.toFixed(2) + '</p>' +
                '</div>';
        }

        function updateModalButtons() {
            const backBtn = document.getElementById('modalBackBtn');
            const nextBtn = document.getElementById('modalNextBtn');
            const addToCartBtn = document.getElementById('modalAddToCartBtn');

            // Show/hide back button
            backBtn.style.display = currentModalStep > 1 ? 'block' : 'none';

            // Show/hide next vs add to cart button
            if (currentModalStep === 5) {
                nextBtn.style.display = 'none';
                addToCartBtn.style.display = 'block';
            } else {
                nextBtn.style.display = 'block';
                addToCartBtn.style.display = 'none';
            }
        }

        window.addWingOrderToCart = function() {
            if (!selectedWingVariant) {
                alert('Please complete your wing selection');
                return;
            }

            // Calculate final price
            const wingStyleUpcharge = selectedWingStyle !== 'regular' ? 1.50 : 0;
            const extraDipsTotal = selectedExtraDips.length * 0.75;
            const totalPrice = selectedWingVariant.platformPrice + wingStyleUpcharge + extraDipsTotal;

            // For now, just show success message - in production this would integrate with platform cart
            alert('Added ' + selectedWingVariant.count + ' ' + currentWingType + ' wings to your cart! Total: $' + totalPrice.toFixed(2));

            closeWingModal();
        };
    </script>
</body>
</html>`;
}

// Create strategic menu data with calculated prices and upselling elements
function createStrategicMenuData(wings, combos, sides, beverages, sauces, multiplier) {
  return {
    featured: [
      {
        id: 'mvp-special',
        name: 'MVP Meal Special',
        description: '12 wings, fries, 4 mozzarella sticks & 4 dips',
        originalPrice: 22.47,
        salePrice: 18.99 * multiplier,
        savings: 3.48,
        badge: 'MOST POPULAR',
        image: 'mvp-meal-combo'
      },
      {
        id: 'new-customer',
        name: 'First Order Deal',
        description: '$2 off orders over $25 + Free delivery',
        badge: 'NEW CUSTOMER',
        isPromo: true
      }
    ],
    combos: combos && combos.length > 0 ? combos.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)).map(combo => ({
      id: combo.id,
      name: combo.name,
      description: combo.description,
      price: combo.basePrice * multiplier,
      platformPrice: (combo.basePrice * multiplier).toFixed(2),
      imageUrl: combo.imageUrl,
      badge: combo.badges ? (typeof combo.badges === 'string' ? combo.badges.replace(/[\[\]"]/g, '').split(',')[0] : Array.isArray(combo.badges) ? combo.badges[0] : 'COMBO DEAL') : 'COMBO DEAL',
      savings: combo.originalPrice ? combo.originalPrice - combo.basePrice : 0,
      featured: combo.featured || false,
      active: combo.active !== false
    })).filter(combo => combo.active) : [],
    wings: wings && Array.isArray(wings) && wings.length > 0 ? wings.map(variant => {
      // Generate badge based on wing count and type
      let badge = 'CLASSIC';
      if (variant.count >= 30) badge = 'PARTY SIZE';
      else if (variant.count >= 24) badge = 'FEEDS CROWD';
      else if (variant.count >= 12) badge = 'GREAT VALUE';
      else if (variant.type === 'boneless') badge = 'CUSTOMER FAVORITE';
      else if (variant.count === 6) badge = 'PERFECT START';

      return {
        id: variant.id,
        name: variant.name,
        description: variant.description,
        price: variant.platformPrice || variant.basePrice * multiplier,
        platformPrice: variant.platformPrice,
        image: variant.image || 'wings-hero',
        badge: badge,
        count: variant.count,
        type: variant.type,
        includedSauces: variant.includedSauces || Math.floor(variant.count / 6)
      };
    }).filter(wing => wing.count <= 30) : [],
    sides: sides && Array.isArray(sides) && sides.length > 0 ? sides.map(side => {
      // Generate badge based on side type and characteristics
      let badge = '';
      if (side.name.toLowerCase().includes('loaded')) badge = 'SIGNATURE';
      else if (side.category === 'mozzarella') badge = 'CRISPY';
      else if (side.name.toLowerCase().includes('cheese')) badge = 'CLASSIC';
      else if (side.category === 'fries') badge = 'ESSENTIAL';

      return {
        id: side.id,
        name: side.name,
        description: side.description,
        price: side.platformPrice || side.basePrice * multiplier,
        platformPrice: side.platformPrice,
        image: side.image,
        badge: badge,
        category: side.category
      };
    }) : [],
    beverages: beverages && Array.isArray(beverages) && beverages.length > 0 ? beverages.map(beverage => {
      // Generate badge based on beverage characteristics
      let badge = '';
      if (beverage.name.toLowerCase().includes('32oz')) badge = 'LARGE';
      else if (beverage.name.toLowerCase().includes('water')) badge = 'REFRESHING';
      else if (beverage.name.toLowerCase().includes('fountain')) badge = 'CLASSIC';

      return {
        id: beverage.id,
        name: beverage.name,
        description: beverage.description,
        basePrice: beverage.basePrice,
        platformPrice: beverage.platformPrice,
        markupAmount: beverage.markupAmount,
        imageUrl: beverage.imageUrl || beverage.image,
        badge: badge
      };
    }) : [],
    dips: sauces ? sauces.filter(sauce => sauce.category === 'dipping-sauce').map(dip => ({
      id: dip.id,
      name: dip.name,
      description: dip.description,
      imageUrl: dip.imageUrl,
      price: '$0.75'
    })) : [],
    sauces: sauces ? sauces.filter(sauce => sauce.category !== 'dipping-sauce') : []
  };
}

// Helper functions for strategic menu
function getPlatformName(platform) {
  const names = {
    'doordash': 'DoorDash',
    'ubereats': 'Uber Eats',
    'grubhub': 'Grubhub'
  };
  return names[platform] || 'DoorDash';
}

// Generate GrubHub-specific HTML
function generateGrubHubHTML(menuData, settings) {
  const { branding, wings, sides, beverages, combos, sauces } = menuData;

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Order Philly Wings Express - Menu & Prices - Philadelphia Delivery | Grubhub">
    <meta name="robots" content="index, follow">
    <title>Order Philly Wings Express - Menu & Prices - Philadelphia Delivery | Grubhub</title>
    <link rel="icon" href="https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/favicon.ico?alt=media">
    <style>${generateGrubHubCSS(branding)}</style>
</head>
<body class="platform-grubhub">
    <!-- GrubHub Header -->
    <header class="grubhub-header">
        <div class="header-left">
            <img src="https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/platform-logos%2Fgrubhub-logo.png?alt=media" alt="Grubhub" class="grubhub-logo">
        </div>
        <div class="search-container">
            <input type="text" class="search-input" placeholder="Search Philly Wings Express">
        </div>
        <div class="header-actions">
            <button class="sign-in-btn">Sign in</button>
            <button class="cart-btn">Your Bag (0)</button>
        </div>
    </header>

    <!-- Restaurant Header -->
    <div class="restaurant-header">
        <div class="restaurant-categories">
            <span class="category-tag">Chicken,</span>
            <span class="category-tag">Wings</span>
            <span class="price-range">• $$</span>
        </div>
        <h1 class="restaurant-title">Philly Wings Express</h1>
        <div class="restaurant-info">
            <span class="rating">4.8 ⭐</span>
            <span>•</span>
            <span>127 ratings</span>
            <span>•</span>
            <span>1455 Franklin Mills Cir</span>
            <span>•</span>
            <span>(215) 612-9464</span>
        </div>
        <div class="delivery-info">
            <span>Today ${generateTodaysHours(settings)}</span>
            <span>•</span>
            <span>$0 delivery fee on first order</span>
            <span>•</span>
            <span>25-40 min</span>
        </div>
    </div>

    <!-- Menu Navigation -->
    <nav class="menu-navigation">
        <div class="nav-tabs">
            <a href="#wings-section" class="nav-tab active">Wings</a>
            <a href="#combos-section" class="nav-tab">Combo Meals</a>
            <a href="#sides-section" class="nav-tab">Sides</a>
            <a href="#beverages-section" class="nav-tab">Beverages</a>
            <a href="#sauces-section" class="nav-tab">Extra Sauces</a>
        </div>
    </nav>

    <!-- Menu Content -->
    <div class="menu-content">
        ${generateGrubHubMenuSections(wings, combos, sides, beverages, sauces)}
    </div>

    <!-- Modal for item customization -->
    <div id="item-modal" class="modal-overlay">
        <div class="modal-content">
            <div class="modal-header">
                <h2 id="modal-item-name" class="modal-title"></h2>
                <button class="close-modal" onclick="closeModal()">&times;</button>
            </div>
            <div class="modal-body">
                <p id="modal-item-description" class="modal-description"></p>
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="decreaseQuantity()">−</button>
                    <input type="number" id="modal-quantity" class="quantity-input" value="1" min="1">
                    <button class="quantity-btn" onclick="increaseQuantity()">+</button>
                </div>
                <button id="add-to-bag-btn" class="add-to-bag" onclick="addToCart()">Add to bag : $0.00</button>
            </div>
        </div>
    </div>

    <script>
        let currentItem = null;
        let cart = [];

        // Modal functions
        function openModal(itemData) {
            currentItem = itemData;
            document.getElementById('modal-item-name').textContent = itemData.name;
            document.getElementById('modal-item-description').textContent = itemData.description || '';
            document.getElementById('modal-quantity').value = 1;
            updateModalPrice();
            document.getElementById('item-modal').style.display = 'block';
        }

        function closeModal() {
            document.getElementById('item-modal').style.display = 'none';
            currentItem = null;
        }

        function increaseQuantity() {
            const input = document.getElementById('modal-quantity');
            input.value = parseInt(input.value) + 1;
            updateModalPrice();
        }

        function decreaseQuantity() {
            const input = document.getElementById('modal-quantity');
            if (parseInt(input.value) > 1) {
                input.value = parseInt(input.value) - 1;
                updateModalPrice();
            }
        }

        function updateModalPrice() {
            if (!currentItem) return;
            const quantity = parseInt(document.getElementById('modal-quantity').value);
            const total = (currentItem.platformPrice * quantity).toFixed(2);
            document.getElementById('add-to-bag-btn').textContent = 'Add to bag : $' + total;
        }

        function addToCart() {
            if (!currentItem) return;
            const quantity = parseInt(document.getElementById('modal-quantity').value);
            cart.push({
                ...currentItem,
                quantity: quantity,
                total: currentItem.platformPrice * quantity
            });
            closeModal();
            updateCartCount();
        }

        function updateCartCount() {
            const count = cart.reduce((sum, item) => sum + item.quantity, 0);
            const cartBtn = document.querySelector('.cart-btn');
            if (cartBtn) {
                cartBtn.textContent = 'Your Bag (' + count + ')';
            }
        }

        // Event listeners
        document.addEventListener('DOMContentLoaded', function() {
            // Add click handlers to menu items
            document.querySelectorAll('.item-button, .plus-btn').forEach(button => {
                button.addEventListener('click', function(e) {
                    e.preventDefault();
                    const menuItem = this.closest('.grubhub-menu-item');
                    if (menuItem) {
                        const itemData = JSON.parse(menuItem.dataset.item);
                        openModal(itemData);
                    }
                });
            });

            // Tab navigation
            document.querySelectorAll('.nav-tab').forEach(tab => {
                tab.addEventListener('click', function(e) {
                    e.preventDefault();
                    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
                    this.classList.add('active');

                    const targetId = this.getAttribute('href').substring(1);
                    const targetElement = document.getElementById(targetId);
                    if (targetElement) {
                        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                });
            });

            // Close modal when clicking outside
            document.getElementById('item-modal').addEventListener('click', function(e) {
                if (e.target === this) {
                    closeModal();
                }
            });
        });
    </script>
</body>
</html>`;
}

// Generate DoorDash-specific HTML (existing functionality)
function generateDoorDashHTML(menuData, settings) {
  const { branding, wings, sides, beverages, combos, sauces, markupPercentage } = menuData;

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Order Philly Wings Express - Menu & Prices - Philadelphia Delivery | ${branding.name}">
    <meta name="robots" content="index, follow">
    <title>Order Philly Wings Express - Menu & Prices - Philadelphia Delivery | ${branding.name}</title>
    <link rel="icon" href="https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/favicon.ico?alt=media">
    <style>${generateDoorDashCSS(branding)}</style>
</head>
<body class="platform-doordash">
    <!-- DoorDash Header -->
    <header class="doordash-header">
        <div class="header-nav">
            <div class="nav-left">
                <button class="menu-btn">☰</button>
                <img src="https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/platform-logos%2Fdoordash-logo.png?alt=media" alt="DoorDash" class="doordash-logo">
            </div>
            <div class="nav-center">
                <span class="location-text">📍 1455 Franklin Mills Cir</span>
            </div>
            <div class="nav-right">
                <button class="login-btn">Login</button>
                <button class="signup-btn">Open App</button>
                <div class="cart-icon">
                    <span class="cart-count" id="cart-count">0</span>
                    🛒
                </div>
            </div>
        </div>
    </header>

    <!-- Restaurant Hero -->
    <div class="restaurant-hero">
        <img src="https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/hero-wings-large.jpg?alt=media"
             alt="Philly Wings Express" class="hero-bg">
        <div class="restaurant-logo">
            <img src="https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fphilly-wings-express-logo.png?alt=media"
                 alt="Philly Wings Express" class="logo-img">
        </div>
    </div>

    <!-- Restaurant Info -->
    <div class="restaurant-details">
        <h1>Philly Wings Express</h1>
        <div class="restaurant-meta">
            <span class="rating">4.8 ⭐ (127 reviews)</span>
            <span class="bullet">•</span>
            <span class="cuisine">Wings</span>
            <span class="bullet">•</span>
            <span class="cuisine">American</span>
            <span class="bullet">•</span>
            <span class="price">$$</span>
        </div>
        <div class="delivery-info">
            <span class="delivery-fee">$0 delivery fee on your first order</span>
            <span class="bullet">•</span>
            <span class="delivery-time">25-40 min</span>
        </div>
        <div class="store-hours">
            <span class="hours-label">Hours:</span>
            <span class="hours-today">Today ${generateTodaysHours(settings)}</span>
            <button class="hours-toggle">See all hours</button>
        </div>
        <div class="store-address">
            <span class="address-text">📍 Virtual Kitchen - Franklin Mills Circle, Philadelphia, PA 19154</span>
        </div>
        <div class="action-buttons">
            <button class="delivery-btn active">Delivery</button>
            <button class="pickup-btn">Pickup</button>
            <button class="group-order-btn">Group Order</button>
        </div>
    </div>

    <!-- Main Layout -->
    <div class="main-layout">
        <!-- Category Sidebar -->
        <div class="category-sidebar">
            <div class="category-list">
                <button class="category-item active" data-category="wings">Traditional Wings</button>
                <button class="category-item" data-category="combos">Combo Meals</button>
                <button class="category-item" data-category="sides">Sides</button>
                <button class="category-item" data-category="beverages">Beverages</button>
                <button class="category-item" data-category="sauces">Signature Sauces</button>
            </div>
        </div>

        <!-- Menu Content -->
        <div class="menu-content">
            <!-- Search Bar -->
            <div class="search-section">
                <input type="text" placeholder="Search menu" class="menu-search" id="menu-search">
            </div>

            <!-- Menu Sections -->
            <div class="menu-sections">
                ${generateDoorDashMenuSections(wings, combos, sides, beverages, sauces)}
            </div>
        </div>
    </div>

    <!-- Item Customization Modal -->
    <div id="item-modal" class="modal hidden">
        <div class="modal-content">
            <div class="modal-header">
                <button class="close-modal" id="close-modal">×</button>
                <h2 id="modal-item-name">Item Name</h2>
                <div id="modal-item-rating" class="item-rating"></div>
                <p id="modal-item-description" class="item-description"></p>
            </div>
            <div class="modal-body">
                <img id="modal-item-image" src="" alt="" class="modal-image">
                <div id="modal-options" class="customization-options">
                    <!-- Dynamic options will be inserted here -->
                </div>
            </div>
            <div class="modal-footer">
                <button id="add-to-cart-btn" class="add-to-cart-btn">Add to cart - $0.00</button>
            </div>
        </div>
    </div>

    <!-- Cart Summary -->
    <div id="cart-summary" class="cart-summary hidden">
        <div class="cart-header">
            <h3>Your Cart</h3>
            <button id="clear-cart" class="clear-cart">Clear</button>
        </div>
        <div id="cart-items" class="cart-items">
            <!-- Cart items will be dynamically added here -->
        </div>
        <div class="cart-total">
            <div class="subtotal">
                <span>Subtotal: $<span id="cart-subtotal">0.00</span></span>
            </div>
            <div class="platform-fee">
                <span>${branding.name} markup (${markupPercentage}%): $<span id="cart-markup">0.00</span></span>
            </div>
            <div class="total">
                <strong>Total: $<span id="cart-total">0.00</span></strong>
            </div>
        </div>
        <button class="checkout-btn">Continue to Checkout</button>
    </div>

    <script>${generateDoorDashJS()}</script>
</body>
</html>`;
}

exports.publishPlatformMenu = functions.https.onCall(async (data, context) => {
  if (!context.auth || !context.auth.token || !(context.auth.token.admin === true || context.auth.token.admin === 'true')) {
    throw new functions.https.HttpsError('permission-denied', 'Admin privileges required');
  }

  const platform = (data && data.platform) || 'doordash';
  const snapshot = (data && data.snapshot) || null;
  if (!snapshot || typeof snapshot !== 'object') {
    throw new functions.https.HttpsError('invalid-argument', 'Missing snapshot payload');
  }

  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const fileBase = `platform-menus/${platform}`;
  const versionedPath = `${fileBase}/${ts}.json`;
  const latestPath = `${fileBase}/latest.json`;

  const bucket = storage.bucket();

  const buffer = Buffer.from(JSON.stringify(snapshot, null, 2));
  await bucket.file(versionedPath).save(buffer, {
    contentType: 'application/json',
    resumable: false
  });

  // Also write latest.json
  await bucket.file(latestPath).save(buffer, {
    contentType: 'application/json',
    resumable: false
  });

  // Build public URLs (Firebase Hosting style or storage.googleapis)
  const bucketName = bucket.name;
  const versionedUrl = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(versionedPath)}?alt=media`;
  const latestUrl = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(latestPath)}?alt=media`;

  // Save metadata
  const menuId = `${platform}-${ts}`;
  await db.collection('publishedMenus').doc(menuId).set({
    platform,
    menuId,
    urls: { versionedUrl, latestUrl },
    publishedAt: admin.firestore.FieldValue.serverTimestamp(),
    publishedBy: context.auth.token.email || context.auth.uid || 'admin',
    status: 'active'
  });

  return { menuId, versionedUrl, latestUrl };
});

// DoorDash-style Section Generators
function generateDoorDashWingsSection(wings, sauces) {
  if (!wings?.length) return '<div id="wings" class="menu-section"><h3>Wings</h3><p>Coming soon</p></div>';

  return `
<div id="wings" class="menu-section">
    <h3 class="section-title">Wings</h3>
    <div class="menu-items">
        ${wings.map(wing => `
            <div class="menu-item-card">
                <div class="item-content">
                    <div class="item-details">
                        <h4 class="item-name">${wing.name}</h4>
                        <div class="item-rating">
                            <span class="rating-badge">#1 Most liked</span>
                            <span class="rating-percent">👍 85% (247)</span>
                        </div>
                        <p class="item-description">${wing.description}</p>
                    </div>
                    <div class="item-image">
                        <img src="${wing.imageUrl || wing.image || 'https://storage.googleapis.com/philly-wings.appspot.com/wings/default-wings.jpg'}"
                             alt="${wing.name}" loading="lazy">
                    </div>
                </div>
                <div class="item-price">$${wing.platformPrice}</div>
            </div>
        `).join('')}
    </div>
</div>`;
}

function generateDoorDashCombosSection(combos) {
  if (!combos?.length) return '<div id="combos" class="menu-section"><h3>Combos</h3><p>Coming soon</p></div>';

  return `
<div id="combos" class="menu-section">
    <h3 class="section-title">Combos</h3>
    <div class="menu-items">
        ${combos.map(combo => `
            <div class="menu-item-card">
                <div class="item-content">
                    <div class="item-details">
                        <h4 class="item-name">${combo.name}</h4>
                        <div class="item-rating">
                            <span class="rating-percent">👍 92% (156)</span>
                        </div>
                        <p class="item-description">${combo.description}</p>
                    </div>
                    <div class="item-image">
                        <img src="${combo.imageUrl || combo.image || 'https://storage.googleapis.com/philly-wings.appspot.com/combos/default-combo.jpg'}"
                             alt="${combo.name}" loading="lazy">
                    </div>
                </div>
                <div class="item-price">$${combo.platformPrice ? (typeof combo.platformPrice === 'number' ? combo.platformPrice.toFixed(2) : combo.platformPrice) : 'N/A'}</div>
            </div>
        `).join('')}
    </div>
</div>`;
}

function generateDoorDashSidesSection(sides) {
  if (!sides?.length) return '<div id="sides" class="menu-section"><h3>Sides</h3><p>Coming soon</p></div>';

  return `
<div id="sides" class="menu-section">
    <h3 class="section-title">Sides</h3>
    <div class="menu-items">
        ${sides.map(side => `
            <div class="menu-item-card">
                <div class="item-content">
                    <div class="item-details">
                        <h4 class="item-name">${side.name}</h4>
                        <div class="item-rating">
                            <span class="rating-percent">👍 78% (89)</span>
                        </div>
                        <p class="item-description">${side.description || 'Fresh and delicious'}</p>
                    </div>
                    <div class="item-image">
                        <img src="${side.imageUrl || side.image || 'https://storage.googleapis.com/philly-wings.appspot.com/sides/default-side.jpg'}"
                             alt="${side.name}" loading="lazy">
                    </div>
                </div>
                <div class="item-price">$${side.platformPrice}</div>
            </div>
        `).join('')}
    </div>
</div>`;
}

function generateDoorDashBeveragesSection(beverages) {
  if (!beverages?.length) return '<div id="beverages" class="menu-section"><h3>Beverages</h3><p>Coming soon</p></div>';

  return `
<div id="beverages" class="menu-section">
    <h3 class="section-title">Beverages</h3>
    <div class="menu-items">
        ${beverages.map(beverage => `
            <div class="menu-item-card">
                <div class="item-content">
                    <div class="item-details">
                        <h4 class="item-name">${beverage.name}</h4>
                        <p class="item-description">${beverage.description || 'Refreshing beverage'}</p>
                    </div>
                    <div class="item-image">
                        <img src="${beverage.imageUrl || beverage.image || 'https://storage.googleapis.com/philly-wings.appspot.com/beverages/default-drink.jpg'}"
                             alt="${beverage.name}" loading="lazy">
                    </div>
                </div>
                <div class="item-price">$${beverage.platformPrice}</div>
            </div>
        `).join('')}
    </div>
</div>`;
}

function generateDoorDashSaucesSection(sauces) {
  if (!sauces?.length) return '<div id="sauces" class="menu-section"><h3>Sauces</h3><p>Coming soon</p></div>';

  return `
<div id="sauces" class="menu-section">
    <h3 class="section-title">Sauces & Add-Ons</h3>
    <div class="menu-items">
        ${sauces.map(sauce => `
            <div class="menu-item-card">
                <div class="item-content">
                    <div class="item-details">
                        <h4 class="item-name">${sauce.name}</h4>
                        <div class="heat-indicator">
                            <span class="heat-level ${getHeatLevelClass(sauce.heatLevel || 0)}">${getHeatLevelText(sauce.heatLevel || 0)}</span>
                        </div>
                        <p class="item-description">${sauce.description || ''}</p>
                    </div>
                    <div class="item-image">
                        <img src="${sauce.imageUrl || sauce.image || 'https://storage.googleapis.com/philly-wings.appspot.com/sauces/default-sauce.jpg'}"
                             alt="${sauce.name}" loading="lazy">
                    </div>
                </div>
                <div class="item-price">$0.75</div>
            </div>
        `).join('')}
    </div>
</div>`;
}

function generateCombosSection(combos, branding) {
  if (!combos?.length) return '<section id="combos"><h2>Combos section temporarily unavailable</h2></section>';

  return `
<section id="combos" class="menu-section">
    <div class="section-header">
        <h2 class="section-title">🔥 COMBO DEALS</h2>
        <p class="section-description">Save up to 17% • Complete meals ready in 20-30 mins</p>
    </div>

    <div class="combo-cards-grid">
        ${combos.map(combo => `
            <div class="combo-card featured">
                <div class="combo-image-wrapper">
                    <img src="${combo.imageUrl || 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Fcombo-platter_800x800.webp?alt=media'}"
                         alt="${combo.name}"
                         class="combo-image"
                         loading="lazy">
                    <div class="combo-badge">MOST POPULAR</div>
                    <div class="savings-badge">Save ${combo.savings || '$8'}</div>
                </div>
                <div class="combo-details">
                    <h3 class="combo-name">${combo.name}</h3>
                    <p class="combo-description">${combo.description}</p>
                    <div class="combo-includes">
                        <span class="include-item">🍗 Wings</span>
                        <span class="include-item">🍟 Fries</span>
                        <span class="include-item">🧀 Mozz Sticks</span>
                        <span class="include-item">🌶️ Sauces</span>
                    </div>
                    <div class="combo-pricing">
                        <div class="price-main">$${combo.platformPrice ? (typeof combo.platformPrice === 'number' ? combo.platformPrice.toFixed(2) : combo.platformPrice) : 'N/A'}</div>
                        <div class="price-label">Order on ${branding.name}</div>
                    </div>
                    <button class="order-now-btn">ORDER NOW →</button>
                </div>
            </div>
        `).join('')}
    </div>
</section>`;
}

function generateSidesSection(sides, branding) {
  if (!sides?.length) return '<section id="sides"><h2>Sides section temporarily unavailable</h2></section>';

  return `
<section id="sides" class="menu-section">
    <div class="section-header">
        <h2 class="section-title">🍟 Sides</h2>
        <p class="section-description">Perfect complements to your wings • Fresh cut fries and mozzarella sticks</p>
    </div>

    <div class="sides-categories-grid">
        <div class="side-category-card">
            <div class="side-category-image-wrapper">
                <img src="https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Ffries_800x800.webp?alt=media"
                     alt="Fries"
                     class="side-category-image"
                     loading="lazy">
                <div class="side-category-badge">FRESH CUT</div>
            </div>
            <div class="side-category-details">
                <h3 class="side-category-name">Fries</h3>
                <p class="side-category-description">Fresh cut fries • Available in Regular and Large sizes</p>
                <div class="side-sizes-info">
                    <span class="sizes-label">Sizes: Regular & Large</span>
                </div>
                <div class="side-category-pricing">
                    <div class="price-main">Starting at $4.99</div>
                    <div class="price-label">Choose Size</div>
                </div>
                <button class="order-side-category-btn">VIEW OPTIONS →</button>
            </div>
        </div>
        <div class="side-category-card">
            <div class="side-category-image-wrapper">
                <img src="https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Floaded-fries_800x800.webp?alt=media"
                     alt="Loaded Fries"
                     class="side-category-image"
                     loading="lazy">
                <div class="side-category-badge">🔥 LOADED</div>
            </div>
            <div class="side-category-details">
                <h3 class="side-category-name">Loaded Fries</h3>
                <p class="side-category-description">Large fries topped with cheese sauce and bacon • Only available in Large size</p>
                <div class="side-sizes-info">
                    <span class="sizes-label">Size: Large Only</span>
                </div>
                <div class="side-category-pricing">
                    <div class="price-main">Starting at $8.99</div>
                    <div class="price-label">Large Size</div>
                </div>
                <button class="order-side-category-btn">VIEW OPTIONS →</button>
            </div>
        </div>
        <div class="side-category-card">
            <div class="side-category-image-wrapper">
                <img src="https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Fmozzarella-sticks_800x800.webp?alt=media"
                     alt="Mozzarella Sticks"
                     class="side-category-image"
                     loading="lazy">
                <div class="side-category-badge">GOLDEN FRIED</div>
            </div>
            <div class="side-category-details">
                <h3 class="side-category-name">Mozzarella Sticks</h3>
                <p class="side-category-description">Golden fried mozzarella sticks • Available in 4, 8, 12, and 16 pieces</p>
                <div class="side-sizes-info">
                    <span class="sizes-label">Quantities: 4, 8, 12, 16 pieces</span>
                </div>
                <div class="side-category-pricing">
                    <div class="price-main">Starting at $6.99</div>
                    <div class="price-label">Choose Quantity</div>
                </div>
                <button class="order-side-category-btn">VIEW OPTIONS →</button>
            </div>
        </div>
    </div>
</section>`;
}

function generateDipsSection(dips, branding) {
  // Define the 4 dip cards
  const dipCategories = [
    {
      id: 'ranch',
      name: 'Ranch',
      description: 'Cool & creamy ranch dip • Perfect with wings and vegetables',
      imageUrl: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Franch-dip.png?alt=media',
      badge: 'CLASSIC',
      price: '$0.75'
    },
    {
      id: 'honey-mustard',
      name: 'Honey Mustard',
      description: 'Sweet & tangy honey mustard • Great for dipping wings and sides',
      imageUrl: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fhoney-mustard.png?alt=media',
      badge: 'SWEET & TANGY',
      price: '$0.75'
    },
    {
      id: 'blue-cheese',
      name: 'Blue Cheese',
      description: 'Classic chunky blue cheese • Traditional wing dip',
      imageUrl: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fblue-cheese.png?alt=media',
      badge: 'CHUNKY',
      price: '$0.75'
    },
    {
      id: 'cheese-sauce',
      name: 'Cheese Sauce',
      description: 'Warm & melty cheese sauce • Perfect for loaded fries and sides',
      imageUrl: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fcheese-sauce.png?alt=media',
      badge: 'WARM & MELTY',
      price: '$1.25'
    }
  ];

  return `
<section id="dips" class="menu-section">
    <div class="section-header">
        <h2 class="section-title">🥄 Dips</h2>
        <p class="section-description">Extra flavor for your wings and sides • 1.5 oz cups</p>
    </div>
    <div class="dips-categories-grid">
        ${dipCategories.map(dip => `
            <div class="dip-category-card">
                <div class="dip-category-image-wrapper">
                    <img src="${dip.imageUrl}"
                         alt="${dip.name}"
                         class="dip-category-image"
                         loading="lazy">
                    <div class="dip-category-badge">${dip.badge}</div>
                </div>
                <div class="dip-category-details">
                    <h3 class="dip-category-name">${dip.name}</h3>
                    <p class="dip-category-description">${dip.description}</p>
                    <div class="dip-category-pricing">
                        <div class="price-main">${dip.price}</div>
                        <div class="price-label">Add to Order</div>
                    </div>
                    <button class="order-dip-category-btn">ADD DIP</button>
                </div>
            </div>
        `).join('')}
    </div>
</section>`;
}

function generateBeveragesSection(beverages, branding) {
  if (!beverages?.length) return '<section id="beverages"><h2>Beverages section temporarily unavailable</h2></section>';

  // Separate fountain drinks, tea, and other beverages
  const fountainDrinks = beverages.filter(b => b.name.toLowerCase().includes('fountain'));
  const teaDrinks = beverages.filter(b => b.name.toLowerCase().includes('tea'));
  const otherBeverages = beverages.filter(b => !b.name.toLowerCase().includes('fountain') && !b.name.toLowerCase().includes('tea'));

  // Combine all beverages into card format
  const allBeverages = [];

  // Add fountain drinks as a single card
  if (fountainDrinks.length > 0) {
    allBeverages.push({
      id: 'fountain-drinks',
      name: 'Fountain Drinks',
      description: '8 Flavors: Coca-Cola, Diet Coke, Coke Zero, Sprite, Fanta Orange, Dr Pepper, Barq\'s Root Beer, Hi-C Fruit Punch',
      imageUrl: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Ffountain-drinks_200x200.webp?alt=media',
      platformPrice: fountainDrinks[0]?.platformPrice || fountainDrinks[0]?.basePrice || 2.99,
      badge: 'CHOOSE SIZE',
      details: fountainDrinks.map(f => ({ name: f.name, price: f.platformPrice || f.basePrice })),
      type: 'fountain'
    });
  }

  // Add tea as a single card
  if (teaDrinks.length > 0) {
    allBeverages.push({
      id: 'iced-tea',
      name: 'Fresh Brewed Tea',
      description: 'Freshly brewed daily • Sweet or unsweetened • Perfect refreshment',
      imageUrl: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Ficed-tea_200x200.webp?alt=media',
      platformPrice: teaDrinks[0]?.platformPrice || teaDrinks[0]?.basePrice || 2.99,
      badge: 'CHOOSE SIZE',
      details: teaDrinks.map(t => ({ name: t.name, price: t.platformPrice || t.basePrice })),
      type: 'tea'
    });
  }

  // Add other beverages
  otherBeverages.forEach(beverage => {
    allBeverages.push({
      id: beverage.id || beverage.name?.toLowerCase().replace(/\s+/g, '-'),
      name: beverage.name,
      description: beverage.description || 'Refreshing beverage to cool down the heat',
      imageUrl: beverage.imageUrl || beverage.image || 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Fwater-bottle_200x200.webp?alt=media',
      platformPrice: beverage.platformPrice || beverage.basePrice,
      badge: 'COLD & FRESH',
      type: 'single'
    });
  });

  return `
<section id="beverages" class="menu-section">
    <div class="section-header">
        <h2 class="section-title">🥤 Beverages</h2>
        <p class="section-description">Cool down the heat • Fountain drinks, tea, and water</p>
    </div>

    <div class="beverages-cards-grid">
        ${allBeverages.map(beverage => `
            <div class="beverage-card ${beverage.type === 'fountain' ? 'featured' : ''}" onclick="openBeverageModal(${JSON.stringify(beverage).replace(/"/g, '&quot;')})">
                <div class="beverage-image-wrapper">
                    <img src="${beverage.imageUrl}"
                         alt="${beverage.name}"
                         class="beverage-image"
                         loading="lazy">
                    ${beverage.badge ? `<div class="beverage-badge">${beverage.badge}</div>` : ''}
                </div>
                <div class="beverage-details">
                    <h3 class="beverage-name">${beverage.name}</h3>
                    <p class="beverage-description">${beverage.description}</p>
                    <div class="beverage-pricing">
                        <div class="price-main">$${beverage.platformPrice ? (typeof beverage.platformPrice === 'number' ? beverage.platformPrice.toFixed(2) : beverage.platformPrice) : 'N/A'}</div>
                        <div class="price-label">${beverage.details ? 'Starting at' : 'Add to Order'}</div>
                    </div>
                    <button class="beverage-btn">
                        ${beverage.details ? 'VIEW OPTIONS →' : 'ADD TO ORDER'}
                    </button>
                </div>
            </div>
        `).join('')}
    </div>
</section>`;
}

function generateSaucesSection(sauces, branding) {
  if (!sauces?.length) return '<section id="sauces"><h2>Sauces section temporarily unavailable</h2></section>';

  // Separate dry rubs from sauces
  const dryRubs = sauces.filter(sauce => sauce.isDryRub === true || sauce.category === 'dry-rub').sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  const classicSauces = sauces.filter(sauce => sauce.isDryRub !== true && sauce.category !== 'dry-rub' && sauce.category !== 'dipping-sauce').sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

  return `
<section id="sauces" class="menu-section">
    <div class="section-header">
        <h2 class="section-title">🌶️ Signature Sauces & Rubs</h2>
        <p class="section-description">From sweet to scorching - all made in-house</p>
    </div>

    ${dryRubs.length > 0 ? `
    <div class="sauce-category-section">
        <h3 class="sauce-category-title">🥄 Dry Rubs</h3>
        <p class="sauce-category-description">Crispy wings tossed in our signature spice blends</p>
        <div class="sauces-cards-grid">
            ${dryRubs.map(sauce => `
                <div class="sauce-card">
                    <div class="sauce-image-wrapper">
                        <img src="${sauce.imageUrl || sauce.image || 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fbuffalo-sauced.png?alt=media'}"
                             alt="${sauce.name}"
                             class="sauce-image"
                             loading="lazy">
                    </div>
                    <div class="sauce-content">
                        <h3 class="sauce-name">${sauce.name}</h3>
                        <p class="sauce-description">${sauce.description || 'House-made spice blend with bold flavor'}</p>
                        ${sauce.heatLevel !== undefined ? `
                            <div class="heat-level-indicator">
                                <span class="heat-label">${getHeatLevelText(sauce.heatLevel)}</span>
                                <span class="heat-visual">${getHeatEmojis(sauce.heatLevel)}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `).join('')}
        </div>
    </div>
    ` : ''}

    ${classicSauces.length > 0 ? `
    <div class="sauce-category-section">
        <h3 class="sauce-category-title">🍯 Classic Sauces</h3>
        <p class="sauce-category-description">Wings smothered in our signature wet sauces</p>
        <div class="sauces-cards-grid">
            ${classicSauces.map(sauce => `
                <div class="sauce-card">
                    <div class="sauce-image-wrapper">
                        <img src="${sauce.imageUrl || sauce.image || 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fbuffalo-sauced.png?alt=media'}"
                             alt="${sauce.name}"
                             class="sauce-image"
                             loading="lazy">
                    </div>
                    <div class="sauce-content">
                        <h3 class="sauce-name">${sauce.name}</h3>
                        <p class="sauce-description">${sauce.description || 'House-made sauce with bold flavor'}</p>
                        ${sauce.heatLevel !== undefined ? `
                            <div class="heat-level-indicator">
                                <span class="heat-label">${getHeatLevelText(sauce.heatLevel)}</span>
                                <span class="heat-visual">${getHeatEmojis(sauce.heatLevel)}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `).join('')}
        </div>
    </div>
    ` : ''}
</section>`;
}

function generateWingsSection(wings, branding) {
  if (!wings?.length) return '<section id="wings"><h2>Wings section temporarily unavailable</h2></section>';

  // Extract boneless and bone-in pricing from wings data
  const bonelessWings = wings.filter(w => w.type === 'boneless');
  const boneInWings = wings.filter(w => w.type === 'bone-in');

  const minBonelessPrice = bonelessWings.length > 0
    ? Math.min(...bonelessWings.map(w => w.platformPrice)).toFixed(2)
    : '6.99';

  const minBoneInPrice = boneInWings.length > 0
    ? Math.min(...boneInWings.map(w => w.platformPrice)).toFixed(2)
    : '8.99';

  return `
<section id="wings" class="menu-section">
    <div class="section-header">
        <h2 class="section-title">🔥 CRISPY WINGS</h2>
        <p class="section-description">Double-fried perfection • Made fresh to order • Choose bone-in or boneless</p>
    </div>

    <div class="wings-hero-banner">
        <img src="https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Fclassic-buffalo-wings_800x800.webp?alt=media"
             alt="Crispy Buffalo Wings"
             class="hero-wings-image">
        <div class="hero-overlay">
            <h3>Made Fresh, Double-Fried to Perfection</h3>
            <p>Every wing brined overnight, hand-tossed in signature sauces</p>
        </div>
    </div>

    <div class="wings-categories-grid">
        <div class="wing-category-card enhanced" data-wing-type="boneless">
            <div class="wing-category-image-wrapper">
                <img src="https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fmenu%2Fphilly-classic-hot.jpg?alt=media"
                     alt="Boneless Wings"
                     class="wing-category-image"
                     loading="lazy">
                <div class="wing-category-badge">ALL WHITE MEAT</div>
                <div class="value-badge">💰 22% CHEAPER</div>
            </div>
            <div class="wing-category-details">
                <h3 class="wing-category-name">Boneless Wings</h3>
                <p class="wing-category-description">All White Chicken, Juicy and Lightly Breaded</p>
                <div class="wing-category-pricing">
                    <div class="price-main">Starting at $${minBonelessPrice}</div>
                    <div class="price-comparison">22% cheaper than bone-in</div>
                </div>
                <button class="order-wing-category-btn interactive" onclick="openWingModal('boneless')">
                    VIEW OPTIONS →
                </button>
            </div>
        </div>
        <div class="wing-category-card enhanced" data-wing-type="bone-in">
            <div class="wing-category-image-wrapper">
                <img src="https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Fbroad-pattison-burn_800x800.webp?alt=media"
                     alt="Classic Bone-In Wings"
                     class="wing-category-image"
                     loading="lazy">
                <div class="wing-category-badge">AUTHENTIC</div>
                <div class="tradition-badge">🔥 ORIGINAL</div>
            </div>
            <div class="wing-category-details">
                <h3 class="wing-category-name">Classic (Bone-In)</h3>
                <p class="wing-category-description">The Real Buffalo Wings, Real Food (not from Buffalo!)</p>
                <div class="wing-category-pricing">
                    <div class="price-main">Starting at $${minBoneInPrice}</div>
                    <div class="price-comparison">Traditional Buffalo experience</div>
                </div>
                <button class="order-wing-category-btn interactive" onclick="openWingModal('bone-in')">
                    VIEW OPTIONS →
                </button>
            </div>
        </div>
    </div>

    <!-- Wing Ordering Modal -->
    <div id="wingModal" class="wing-modal" style="display: none;">
        <div class="modal-backdrop" onclick="closeWingModal()"></div>
        <div class="modal-content">
            <div class="modal-header">
                <button class="modal-close" onclick="closeWingModal()">&times;</button>
                <div class="modal-progress">
                    <div class="progress-step active" data-step="1">1</div>
                    <div class="progress-step" data-step="2">2</div>
                    <div class="progress-step" data-step="3">3</div>
                    <div class="progress-step" data-step="4">4</div>
                    <div class="progress-step" data-step="5">5</div>
                </div>
            </div>
            <div class="modal-body">
                <div id="modalStep1" class="modal-step active">
                    <h3>Choose Your Wing Size</h3>
                    <div id="wingVariants" class="wing-variants-grid"></div>
                </div>
                <div id="modalStep2" class="modal-step">
                    <h3>Select Your Sauces</h3>
                    <div id="sauceSelection" class="sauce-selection-grid"></div>
                </div>
                <div id="modalStep3" class="modal-step">
                    <h3>Wing Style Preference</h3>
                    <div id="wingStyleOptions" class="wing-style-options"></div>
                </div>
                <div id="modalStep4" class="modal-step">
                    <h3>Extra Dips (Optional)</h3>
                    <div id="extraDips" class="extra-dips-grid"></div>
                </div>
                <div id="modalStep5" class="modal-step">
                    <h3>Order Summary</h3>
                    <div id="orderSummary" class="order-summary"></div>
                </div>
            </div>
            <div class="modal-footer">
                <button id="modalBackBtn" onclick="navigateModalStep(-1)" style="display: none;">← Back</button>
                <button id="modalNextBtn" onclick="navigateModalStep(1)">Next →</button>
                <button id="modalAddToCartBtn" onclick="addWingOrderToCart()" style="display: none;">Add to Cart</button>
            </div>
        </div>
    </div>
</section>`;
}

// DoorDash-authentic CSS styling
function generateDoorDashCSS(branding) {
  return `
    /* Reset and Base Styles */
    * { margin: 0; padding: 0; box-sizing: border-box; }

    /* Modern Visual Menu Styles */
    .combo-cards-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
        gap: 24px;
        margin: 32px 0;
    }

    .combo-card {
        background: white;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        position: relative;
    }

    .combo-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 32px rgba(0,0,0,0.15);
    }

    .combo-image-wrapper {
        position: relative;
        width: 100%;
        height: 200px;
        overflow: hidden;
    }

    .combo-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s ease;
    }

    .combo-card:hover .combo-image {
        transform: scale(1.05);
    }

    .combo-badge {
        position: absolute;
        top: 12px;
        left: 12px;
        background: #ff6b35;
        color: white;
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 11px;
        font-weight: bold;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .savings-badge {
        position: absolute;
        top: 12px;
        right: 12px;
        background: #00b887;
        color: white;
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 11px;
        font-weight: bold;
    }

    .combo-details {
        padding: 20px;
    }

    .combo-name {
        font-size: 20px;
        font-weight: bold;
        margin-bottom: 8px;
        color: #1a1a1a;
    }

    .combo-description {
        color: #666;
        font-size: 14px;
        margin-bottom: 16px;
        line-height: 1.4;
    }

    .combo-includes {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 16px;
    }

    .include-item {
        background: #f8f9fa;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 12px;
        color: #666;
    }

    .combo-pricing {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 16px;
    }

    .price-main {
        font-size: 24px;
        font-weight: bold;
        color: #1a1a1a;
    }

    .price-label {
        font-size: 12px;
        color: #666;
    }

    .order-now-btn {
        width: 100%;
        background: #ff6b35;
        color: white;
        border: none;
        padding: 12px 16px;
        border-radius: 8px;
        font-weight: bold;
        font-size: 14px;
        cursor: pointer;
        transition: background 0.3s ease;
    }

    .order-now-btn:hover {
        background: #e55a2b;
    }

    /* Beverages Section Styles */
    .beverages-cards-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 20px;
        margin: 24px 0;
    }

    .beverage-card {
        background: white;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        position: relative;
        cursor: pointer;
    }

    .beverage-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 32px rgba(0,0,0,0.15);
    }

    .beverage-card.featured {
        border: 2px solid #ff6b35;
    }

    .beverage-image-wrapper {
        position: relative;
        width: 100%;
        height: 160px;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f8f9fa;
        padding: 16px;
    }

    .beverage-image {
        max-width: 140px;
        max-height: 140px;
        width: auto;
        height: auto;
        object-fit: contain;
        transition: transform 0.3s ease;
    }

    /* Responsive beverage image sizing */
    @media (max-width: 768px) {
        .beverage-image {
            max-width: 100px;
            max-height: 100px;
        }

        .beverage-image-wrapper {
            height: 140px;
            padding: 12px;
        }
    }

    @media (max-width: 480px) {
        .beverage-image {
            max-width: 80px;
            max-height: 80px;
        }

        .beverage-image-wrapper {
            height: 120px;
            padding: 10px;
        }
    }

    .beverage-card:hover .beverage-image {
        transform: scale(1.05);
    }

    .beverage-badge {
        position: absolute;
        top: 12px;
        left: 12px;
        background: #00b887;
        color: white;
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 11px;
        font-weight: bold;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    /* Special styling for fountain drinks card */
    .beverage-card.featured .beverage-image-wrapper {
        padding: 0;
        background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
    }
    .beverage-card.featured .beverage-image {
        max-width: 100%;
        max-height: 100%;
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    .beverage-card.featured .beverage-badge {
        background: rgba(255,255,255,0.9);
        color: #ff6b35;
    }

    .beverage-details {
        padding: 16px;
    }

    .beverage-name {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 8px;
        color: #1a1a1a;
    }

    .beverage-description {
        color: #666;
        font-size: 13px;
        margin-bottom: 12px;
        line-height: 1.4;
    }

    .beverage-pricing {
        margin-bottom: 12px;
    }

    .beverage-pricing .price-main {
        font-size: 20px;
        font-weight: bold;
        color: #1a1a1a;
    }

    .beverage-pricing .price-label {
        font-size: 12px;
        color: #666;
        margin-top: 2px;
    }

    .beverage-btn {
        width: 100%;
        background: #1976d2;
        color: white;
        border: none;
        padding: 12px;
        border-radius: 8px;
        font-weight: bold;
        font-size: 14px;
        cursor: pointer;
        transition: background 0.3s ease;
    }

    .beverage-btn:hover {
        background: #1557b0;
    }

    /* Modal Styles for Beverages */
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: none;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }

    .modal-content {
        background: white;
        border-radius: 12px;
        padding: 24px;
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        position: relative;
    }

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
    }

    .modal-title {
        font-size: 20px;
        font-weight: bold;
        color: #1a1a1a;
    }

    .close-modal {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #666;
    }

    .modal-image-wrapper {
        text-align: center;
        margin-bottom: 16px;
    }

    .modal-description {
        color: #666;
        margin-bottom: 16px;
        line-height: 1.4;
    }

    .beverage-options h4 {
        margin-bottom: 12px;
        color: #1a1a1a;
    }

    .option-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px;
        border: 2px solid #e9ecef;
        border-radius: 8px;
        margin-bottom: 8px;
        cursor: pointer;
        transition: border-color 0.3s ease;
    }

    .option-item:hover {
        border-color: #1976d2;
    }

    .option-item.selected {
        border-color: #1976d2;
        background: #f3f8ff;
    }

    .option-name {
        font-weight: 500;
        color: #1a1a1a;
    }

    .option-price {
        font-weight: bold;
        color: #1976d2;
    }

    .quantity-controls {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 16px;
        margin: 20px 0;
    }

    .quantity-btn {
        width: 40px;
        height: 40px;
        border: 2px solid #1976d2;
        background: white;
        color: #1976d2;
        border-radius: 50%;
        font-size: 18px;
        font-weight: bold;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .quantity-btn:hover {
        background: #1976d2;
        color: white;
    }

    .quantity-input {
        width: 60px;
        height: 40px;
        text-align: center;
        border: 2px solid #e9ecef;
        border-radius: 8px;
        font-size: 16px;
        font-weight: bold;
    }

    .add-to-bag {
        width: 100%;
        background: #1976d2;
        color: white;
        border: none;
        padding: 16px;
        border-radius: 8px;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        transition: background 0.3s ease;
    }

    .add-to-bag:hover {
        background: #1557b0;
    }

    /* Wings Section Styles */
    .wings-hero-banner {
        position: relative;
        width: 100%;
        height: 160px;
        margin: 24px 0;
        border-radius: 12px;
        overflow: hidden;
    }

    .hero-wings-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .hero-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6));
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        color: white;
        text-align: center;
        padding: 20px;
    }

    .hero-overlay h3 {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 8px;
    }

    .hero-overlay p {
        font-size: 14px;
        opacity: 0.9;
    }

    .wings-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 20px;
        margin: 24px 0;
    }
    .wings-categories-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 24px;
        margin: 24px 0;
    }
    @media (max-width: 768px) {
        .wings-categories-grid {
            grid-template-columns: 1fr;
            gap: 20px;
        }
    }
    .wing-category-card {
        background: white;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        cursor: pointer;
    }
    .wing-category-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 32px rgba(0,0,0,0.15);
    }
    .wing-category-image-wrapper {
        position: relative;
        width: 100%;
        height: 200px;
        overflow: hidden;
    }
    .wing-category-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s ease;
    }
    .wing-category-card:hover .wing-category-image {
        transform: scale(1.05);
    }
    .wing-category-badge {
        position: absolute;
        top: 16px;
        right: 16px;
        background: #ff6b35;
        color: white;
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: bold;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    .wing-category-details {
        padding: 20px;
    }
    .wing-category-name {
        font-size: 20px;
        font-weight: bold;
        margin-bottom: 8px;
        color: #1a1a1a;
    }
    .wing-category-description {
        font-size: 14px;
        color: #666;
        margin-bottom: 16px;
        line-height: 1.4;
    }
    .wing-category-pricing {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
    }
    .order-wing-category-btn {
        width: 100%;
        background: #ff6b35;
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: bold;
        cursor: pointer;
        transition: background-color 0.3s ease;
    }
    .order-wing-category-btn:hover {
        background: #e55a2b;
    }

    /* Enhanced Wing Card Styles */
    .wing-category-card.enhanced .wing-category-image-wrapper {
        position: relative;
    }

    .value-badge, .tradition-badge {
        position: absolute;
        top: 16px;
        left: 16px;
        background: #28a745;
        color: white;
        padding: 6px 12px;
        border-radius: 16px;
        font-size: 11px;
        font-weight: bold;
        text-transform: uppercase;
        letter-spacing: 0.3px;
        z-index: 2;
    }

    .tradition-badge {
        background: #dc3545;
    }

    .price-comparison {
        font-size: 12px;
        color: #28a745;
        font-weight: 600;
        margin-top: 4px;
    }

    .order-wing-category-btn.interactive {
        background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
        box-shadow: 0 4px 15px rgba(255, 107, 53, 0.3);
        transform: translateY(0);
        transition: all 0.3s ease;
    }

    .order-wing-category-btn.interactive:hover {
        background: linear-gradient(135deg, #e55a2b 0%, #e8851d 100%);
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(255, 107, 53, 0.4);
    }

    /* Wing Modal Styles */
    .wing-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.3s ease, visibility 0.3s ease;
    }

    .wing-modal.active {
        opacity: 1;
        visibility: visible;
    }

    .modal-backdrop {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(4px);
    }

    .modal-content {
        position: relative;
        background: white;
        border-radius: 20px;
        width: 90%;
        max-width: 600px;
        max-height: 90vh;
        overflow: hidden;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        transform: scale(0.9);
        transition: transform 0.3s ease;
    }

    .wing-modal.active .modal-content {
        transform: scale(1);
    }

    .modal-header {
        padding: 20px 24px 16px;
        border-bottom: 1px solid #f0f0f0;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .modal-close {
        background: none;
        border: none;
        font-size: 24px;
        color: #999;
        cursor: pointer;
        padding: 0;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: background-color 0.2s ease, color 0.2s ease;
    }

    .modal-close:hover {
        background: #f5f5f5;
        color: #333;
    }

    .modal-progress {
        display: flex;
        gap: 12px;
        align-items: center;
    }

    .progress-step {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: #e9ecef;
        color: #6c757d;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        font-weight: 600;
        transition: all 0.3s ease;
    }

    .progress-step.active {
        background: #ff6b35;
        color: white;
        transform: scale(1.1);
    }

    .progress-step.completed {
        background: #28a745;
        color: white;
    }

    .modal-body {
        padding: 24px;
        max-height: 60vh;
        overflow-y: auto;
    }

    .modal-step {
        display: none;
        animation: fadeIn 0.3s ease;
    }

    .modal-step.active {
        display: block;
    }

    .modal-step h3 {
        font-size: 20px;
        font-weight: 700;
        color: #1a1a1a;
        margin-bottom: 20px;
        text-align: center;
    }

    .wing-variants-grid {
        display: grid;
        gap: 16px;
        margin-bottom: 20px;
    }

    .wing-variant-option {
        border: 2px solid #e9ecef;
        border-radius: 12px;
        padding: 16px;
        cursor: pointer;
        transition: all 0.3s ease;
        background: white;
    }

    .wing-variant-option:hover {
        border-color: #ff6b35;
        background: #fff5f2;
    }

    .wing-variant-option.selected {
        border-color: #ff6b35;
        background: #fff5f2;
        box-shadow: 0 4px 12px rgba(255, 107, 53, 0.2);
    }

    .wing-variant-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .wing-variant-details h4 {
        font-size: 16px;
        font-weight: 600;
        color: #1a1a1a;
        margin-bottom: 4px;
    }

    .wing-variant-details p {
        font-size: 14px;
        color: #6c757d;
        margin: 0;
    }

    .wing-variant-price {
        font-size: 18px;
        font-weight: 700;
        color: #ff6b35;
    }

    .sauce-selection-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        gap: 16px;
        margin-bottom: 20px;
    }

    .sauce-option {
        border: 2px solid #e9ecef;
        border-radius: 12px;
        padding: 12px;
        text-align: center;
        cursor: pointer;
        transition: all 0.3s ease;
        background: white;
    }

    .sauce-option:hover {
        border-color: #ff6b35;
        background: #fff5f2;
    }

    .sauce-option.selected {
        border-color: #ff6b35;
        background: #fff5f2;
        box-shadow: 0 4px 12px rgba(255, 107, 53, 0.2);
    }

    .sauce-option.disabled {
        opacity: 0.5;
        cursor: not-allowed;
        background: #f8f9fa;
    }

    .sauce-option img {
        width: 40px;
        height: 40px;
        object-fit: cover;
        border-radius: 8px;
        margin-bottom: 8px;
    }

    .sauce-option h5 {
        font-size: 14px;
        font-weight: 600;
        color: #1a1a1a;
        margin-bottom: 4px;
    }

    .sauce-option p {
        font-size: 12px;
        color: #6c757d;
        margin: 0;
    }

    .sauce-limit-info {
        background: #e7f3ff;
        border: 1px solid #b8daff;
        border-radius: 8px;
        padding: 12px;
        margin-bottom: 16px;
        font-size: 14px;
        color: #0056b3;
        text-align: center;
    }

    .modal-footer {
        padding: 16px 24px;
        border-top: 1px solid #f0f0f0;
        display: flex;
        gap: 12px;
        justify-content: flex-end;
        background: #fafafa;
    }

    .modal-footer button {
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        border: none;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    #modalBackBtn {
        background: #6c757d;
        color: white;
    }

    #modalBackBtn:hover {
        background: #545b62;
    }

    #modalNextBtn {
        background: #ff6b35;
        color: white;
    }

    #modalNextBtn:hover {
        background: #e55a2b;
    }

    #modalAddToCartBtn {
        background: #28a745;
        color: white;
        flex: 1;
        font-size: 16px;
        padding: 14px 24px;
    }

    #modalAddToCartBtn:hover {
        background: #218838;
    }

    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }

    /* Mobile Responsive Modal */
    @media (max-width: 768px) {
        .modal-content {
            width: 95%;
            max-height: 95vh;
            margin: 0 8px;
        }

        .modal-header {
            padding: 16px 20px 12px;
        }

        .modal-body {
            padding: 20px;
        }

        .wing-variants-grid {
            grid-template-columns: 1fr;
        }

        .sauce-selection-grid {
            grid-template-columns: repeat(2, 1fr);
        }

        .modal-footer {
            padding: 12px 20px;
        }

        .modal-progress {
            gap: 8px;
        }

        .progress-step {
            width: 28px;
            height: 28px;
            font-size: 12px;
        }
    }

    .wing-card {
        background: white;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 2px 12px rgba(0,0,0,0.08);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .wing-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 20px rgba(0,0,0,0.12);
    }

    .wing-image-wrapper {
        position: relative;
        width: 100%;
        height: 140px;
        overflow: hidden;
    }

    .wing-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .popular-badge {
        position: absolute;
        top: 8px;
        left: 8px;
        background: #ff6b35;
        color: white;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 10px;
        font-weight: bold;
    }

    .wing-count-badge {
        position: absolute;
        bottom: 8px;
        right: 8px;
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: bold;
    }

    .wing-details {
        padding: 16px;
    }

    .wing-name {
        font-size: 16px;
        font-weight: bold;
        margin-bottom: 6px;
        color: #1a1a1a;
    }

    .wing-description {
        color: #666;
        font-size: 13px;
        margin-bottom: 12px;
        line-height: 1.3;
    }

    .wing-includes {
        margin-bottom: 12px;
    }

    .include-sauce {
        background: #e8f5e8;
        color: #2d5a2d;
        padding: 3px 8px;
        border-radius: 10px;
        font-size: 11px;
        font-weight: 500;
    }

    .wing-pricing {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
    }

    .order-wing-btn {
        width: 100%;
        background: #1a73e8;
        color: white;
        border: none;
        padding: 10px 14px;
        border-radius: 6px;
        font-weight: 600;
        font-size: 13px;
        cursor: pointer;
        transition: background 0.2s ease;
    }

    .order-wing-btn:hover {
        background: #1557b0;
    }

    /* Sides Section Styles */
    .sides-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        gap: 18px;
        margin: 24px 0;
    }
    .sides-categories-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 24px;
        margin: 24px 0;
    }
    @media (max-width: 768px) {
        .sides-categories-grid {
            grid-template-columns: 1fr;
            gap: 20px;
        }
    }
    .side-category-card {
        background: white;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        cursor: pointer;
    }
    .side-category-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 32px rgba(0,0,0,0.15);
    }
    .side-category-image-wrapper {
        position: relative;
        width: 100%;
        height: 180px;
        overflow: hidden;
    }
    .side-category-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s ease;
    }
    .side-category-card:hover .side-category-image {
        transform: scale(1.05);
    }
    .side-category-badge {
        position: absolute;
        top: 16px;
        right: 16px;
        background: #ff6b35;
        color: white;
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: bold;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    .side-category-details {
        padding: 20px;
    }
    .side-category-name {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 8px;
        color: #1a1a1a;
    }
    .side-category-description {
        font-size: 14px;
        color: #666;
        margin-bottom: 12px;
        line-height: 1.4;
    }
    .side-sizes-info {
        margin-bottom: 16px;
    }
    .sizes-label {
        font-size: 13px;
        color: #888;
        font-style: italic;
    }
    .side-category-pricing {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
    }
    .order-side-category-btn {
        width: 100%;
        background: #ff6b35;
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: bold;
        cursor: pointer;
        transition: background-color 0.3s ease;
    }
    .order-side-category-btn:hover {
        background: #e55a2b;
    }

    /* Dips Section Styles */
    .dips-categories-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 20px;
        margin: 24px 0;
    }
    @media (max-width: 768px) {
        .dips-categories-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
        }
    }
    @media (max-width: 480px) {
        .dips-categories-grid {
            grid-template-columns: 1fr;
            gap: 16px;
        }
    }
    .dip-category-card {
        background: white;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 3px 15px rgba(0,0,0,0.08);
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        cursor: pointer;
    }
    .dip-category-card:hover {
        transform: translateY(-3px);
        box-shadow: 0 6px 25px rgba(0,0,0,0.12);
    }
    .dip-category-image-wrapper {
        position: relative;
        width: 100%;
        height: 160px;
        overflow: hidden;
        border-radius: 12px 12px 0 0;
        background: #f8f9fa;
    }
    .dip-category-image {
        width: 100%;
        height: 120%;
        object-fit: cover;
        object-position: center 40%;
        transition: transform 0.3s ease;
        transform: scale(1.1);
    }
    .dip-category-card:hover .dip-category-image {
        transform: scale(1.2);
    }
    .dip-category-badge {
        position: absolute;
        top: 12px;
        right: 12px;
        background: #00b887;
        color: white;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 10px;
        font-weight: bold;
        text-transform: uppercase;
        letter-spacing: 0.3px;
    }
    .dip-category-details {
        padding: 16px;
    }
    .dip-category-name {
        font-size: 16px;
        font-weight: bold;
        margin-bottom: 6px;
        color: #1a1a1a;
    }
    .dip-category-description {
        font-size: 13px;
        color: #666;
        margin-bottom: 12px;
        line-height: 1.3;
    }
    .dip-category-pricing {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
    }
    .dip-category-pricing .price-main {
        font-size: 16px;
        font-weight: bold;
        color: #ff6b35;
    }
    .dip-category-pricing .price-label {
        font-size: 12px;
        color: #888;
    }
    .order-dip-category-btn {
        width: 100%;
        background: #00b887;
        color: white;
        border: none;
        padding: 10px 16px;
        border-radius: 6px;
        font-size: 13px;
        font-weight: bold;
        cursor: pointer;
        transition: background-color 0.3s ease;
    }
    .order-dip-category-btn:hover {
        background: #009670;
    }

    .side-card {
        background: white;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 2px 10px rgba(0,0,0,0.06);
        transition: transform 0.2s ease;
    }

    .side-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 16px rgba(0,0,0,0.1);
    }

    .side-image-wrapper {
        position: relative;
        width: 100%;
        height: 120px;
        overflow: hidden;
    }

    .side-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .loaded-badge {
        position: absolute;
        top: 8px;
        left: 8px;
        background: #ff6b35;
        color: white;
        padding: 4px 8px;
        border-radius: 10px;
        font-size: 10px;
        font-weight: bold;
    }

    .side-details {
        padding: 14px;
    }

    .side-name {
        font-size: 15px;
        font-weight: bold;
        margin-bottom: 6px;
        color: #1a1a1a;
    }

    .side-description {
        color: #666;
        font-size: 12px;
        margin-bottom: 10px;
        line-height: 1.3;
    }

    .side-pricing {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
    }

    .add-side-btn {
        width: 100%;
        background: #00b887;
        color: white;
        border: none;
        padding: 8px 12px;
        border-radius: 6px;
        font-weight: 600;
        font-size: 12px;
        cursor: pointer;
        transition: background 0.2s ease;
    }

    .add-side-btn:hover {
        background: #009670;
    }

    body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        margin: 0;
        background: #ffffff;
        color: #191919;
    }

    /* DoorDash Header */
    .dd-header {
        background: white;
        border-bottom: 1px solid #e8e8e8;
    }

    .dd-nav {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1rem 1.5rem;
        max-width: 1200px;
        margin: 0 auto;
    }

    .dd-nav-left {
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .menu-btn {
        background: none;
        border: none;
        font-size: 1.2rem;
        cursor: pointer;
    }

    .platform-logo {
        height: 32px;
    }

    .dd-nav-center .location-text {
        font-size: 0.9rem;
        color: #6B7280;
    }

    .dd-nav-right {
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .login-btn, .app-btn {
        background: none;
        border: none;
        color: #191919;
        font-weight: 500;
        cursor: pointer;
        padding: 0.5rem 1rem;
    }

    .app-btn {
        background: #FF3008;
        color: white;
        border-radius: 20px;
    }

    .cart-btn {
        background: #FF3008;
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 20px;
        font-weight: 500;
    }

    /* Breadcrumb */
    .breadcrumb {
        padding: 0.5rem 1.5rem;
        font-size: 0.85rem;
        color: #6B7280;
        max-width: 1200px;
        margin: 0 auto;
    }

    .breadcrumb a {
        color: #6B7280;
        text-decoration: none;
    }

    /* Hero Section */
    .hero-section {
        position: relative;
        height: 240px;
        overflow: hidden;
    }

    .hero-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .restaurant-logo-overlay {
        position: absolute;
        bottom: -30px;
        left: 2rem;
    }

    .restaurant-logo {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        border: 4px solid white;
        object-fit: cover;
    }

    /* Restaurant Info */
    .restaurant-info {
        padding: 2rem 1.5rem 1rem;
        max-width: 1200px;
        margin: 0 auto;
    }

    .restaurant-name {
        font-size: 2rem;
        font-weight: 700;
        margin-bottom: 0.5rem;
        color: #191919;
    }

    .restaurant-meta {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 1rem;
        font-size: 0.9rem;
        color: #6B7280;
        flex-wrap: wrap;
    }

    .rating {
        color: #191919;
        font-weight: 600;
    }

    .dashpass {
        color: #00B14F;
        font-weight: 600;
    }

    /* Promo Banner */
    .promo-banner {
        background: #FEF3F2;
        border: 1px solid #FECDCA;
        border-radius: 8px;
        padding: 0.75rem 1rem;
        margin-bottom: 1rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: #B91C1C;
        font-size: 0.9rem;
    }

    /* Action Buttons */
    .action-buttons {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 1rem;
    }

    .action-btn {
        padding: 0.75rem 1.5rem;
        border: 1px solid #e8e8e8;
        background: white;
        border-radius: 20px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
    }

    .action-btn.active {
        background: #191919;
        color: white;
        border-color: #191919;
    }

    /* Delivery Info */
    .delivery-info {
        font-size: 0.85rem;
        color: #6B7280;
        margin-bottom: 1.5rem;
    }

    /* Menu Navigation */
    .menu-navigation {
        border-bottom: 1px solid #e8e8e8;
        position: sticky;
        top: 0;
        background: white;
        z-index: 10;
    }

    .menu-tabs {
        display: flex;
        overflow-x: auto;
        padding: 0 1.5rem;
        max-width: 1200px;
        margin: 0 auto;
    }

    .menu-tab {
        padding: 1rem 1.5rem;
        text-decoration: none;
        color: #6B7280;
        font-weight: 500;
        border-bottom: 2px solid transparent;
        white-space: nowrap;
        transition: all 0.2s;
    }

    .menu-tab:hover,
    .menu-tab.active {
        color: #191919;
        border-bottom-color: #FF3008;
    }

    /* Menu Content */
    .menu-content {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 1.5rem;
    }

    .menu-section {
        padding: 2rem 0;
        border-bottom: 1px solid #f3f4f6;
    }

    .section-title {
        font-size: 1.5rem;
        font-weight: 700;
        margin-bottom: 1.5rem;
        color: #191919;
    }

    .menu-items {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    /* Menu Item Cards - DoorDash Style */
    .menu-item-card {
        background: white;
        border-radius: 8px;
        padding: 1rem;
        border: 1px solid #f3f4f6;
        transition: all 0.2s;
        cursor: pointer;
    }

    .menu-item-card:hover {
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .item-content {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 0.5rem;
    }

    .item-details {
        flex: 1;
        margin-right: 1rem;
    }

    .item-name {
        font-size: 1.1rem;
        font-weight: 600;
        margin-bottom: 0.25rem;
        color: #191919;
    }

    .item-rating {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
    }

    .rating-badge {
        background: #FEF3F2;
        color: #B91C1C;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.75rem;
        font-weight: 600;
    }

    .rating-percent {
        font-size: 0.85rem;
        color: #6B7280;
    }

    .item-description {
        font-size: 0.9rem;
        color: #6B7280;
        line-height: 1.4;
    }

    .item-image {
        width: 80px;
        height: 80px;
        flex-shrink: 0;
    }

    .item-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 6px;
    }

    .item-price {
        font-size: 1rem;
        font-weight: 600;
        color: #191919;
        text-align: right;
    }

    /* Heat Level Indicators */
    .heat-indicator {
        margin-bottom: 0.5rem;
    }

    .heat-level {
        font-size: 0.75rem;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-weight: 600;
        text-transform: uppercase;
    }

    .heat-level.mild { background: #ECFDF5; color: #065F46; }
    .heat-level.medium { background: #FFFBEB; color: #92400E; }
    .heat-level.hot { background: #FEF2F2; color: #991B1B; }
    .heat-level.extra-hot { background: #EFF6FF; color: #1E40AF; }

    /* Responsive */
    @media (max-width: 768px) {
        .dd-nav-center {
            display: none;
        }

        .restaurant-logo-overlay {
            left: 1rem;
        }

        .restaurant-info {
            padding: 1.5rem 1rem 1rem;
        }

        .menu-content {
            padding: 0 1rem;
        }

        .item-content {
            flex-direction: column-reverse;
            align-items: flex-start;
        }

        .item-image {
            width: 100%;
            height: 120px;
            margin-bottom: 1rem;
        }

        .item-details {
            margin-right: 0;
        }
    }

    /* Beverages Section Styling */
    .fountain-drinks-section, .tea-drinks-section {
        background: white;
        border-radius: 12px;
        margin-bottom: 20px;
        overflow: hidden;
        box-shadow: 0 2px 12px rgba(0,0,0,0.08);
    }

    .fountain-hero, .tea-hero {
        display: flex;
        align-items: center;
        padding: 20px;
        gap: 20px;
    }

    .fountain-hero-image, .tea-hero-image {
        width: 120px;
        height: 120px;
        object-fit: cover;
        border-radius: 12px;
        flex-shrink: 0;
    }

    .fountain-info, .tea-info {
        flex: 1;
    }

    .fountain-title, .tea-title {
        font-size: 20px;
        font-weight: bold;
        margin-bottom: 8px;
        color: #1a1a1a;
    }

    .fountain-flavors, .tea-description {
        font-size: 14px;
        color: #666;
        margin-bottom: 16px;
        line-height: 1.4;
    }

    .fountain-sizes, .tea-sizes {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-bottom: 16px;
    }

    .size-option {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 12px;
        background: #f8f9fa;
        border-radius: 8px;
    }

    .size-name {
        font-size: 14px;
        font-weight: 500;
        color: #333;
    }

    .size-price {
        font-size: 16px;
        font-weight: bold;
        color: #ff6b35;
    }

    .fountain-cta, .tea-cta {
        background: #ff6b35;
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 8px;
        font-weight: bold;
        font-size: 14px;
        cursor: pointer;
        transition: background 0.3s ease;
    }

    .fountain-cta:hover, .tea-cta:hover {
        background: #e55a2b;
    }

    /* Beverages Cards Grid */
    .beverages-cards-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 20px;
        margin-top: 20px;
    }

    .beverage-card {
        background: white;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 2px 12px rgba(0,0,0,0.08);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .beverage-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 20px rgba(0,0,0,0.12);
    }

    .beverage-image-wrapper {
        width: 100%;
        height: 160px;
        overflow: hidden;
    }

    .beverage-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s ease;
    }

    .beverage-card:hover .beverage-image {
        transform: scale(1.05);
    }

    .beverage-content {
        padding: 16px;
    }

    .beverage-name {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 8px;
        color: #1a1a1a;
    }

    .beverage-description {
        font-size: 14px;
        color: #666;
        margin-bottom: 12px;
        line-height: 1.4;
    }

    .beverage-pricing {
        margin-bottom: 12px;
    }

    .beverage-price {
        font-size: 20px;
        font-weight: bold;
        color: #ff6b35;
    }

    .beverage-cta {
        width: 100%;
        background: #ff6b35;
        color: white;
        border: none;
        padding: 10px 16px;
        border-radius: 8px;
        font-weight: bold;
        font-size: 14px;
        cursor: pointer;
        transition: background 0.3s ease;
    }

    .beverage-cta:hover {
        background: #e55a2b;
    }

    /* Sauce Category Sections */
    .sauce-category-section {
        margin-bottom: 40px;
    }

    .sauce-category-title {
        font-size: 24px;
        font-weight: bold;
        color: #1a1a1a;
        margin-bottom: 8px;
        margin-top: 0;
    }

    .sauce-category-description {
        font-size: 16px;
        color: #666;
        margin-bottom: 24px;
        margin-top: 0;
    }

    /* Sauces Cards Grid */
    .sauces-cards-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 20px;
        margin-top: 20px;
    }

    .sauce-card {
        background: white;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 2px 12px rgba(0,0,0,0.08);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        padding: 16px;
    }

    .sauce-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 20px rgba(0,0,0,0.12);
    }

    .sauce-image-wrapper {
        width: 100%;
        height: 160px;
        overflow: hidden;
        border-radius: 8px 8px 0 0;
        margin-bottom: 0;
    }

    .sauce-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: top center;
        transition: transform 0.3s ease;
    }

    .sauce-card:hover .sauce-image {
        transform: scale(1.05);
    }

    .sauce-content {
        text-align: center;
    }

    .sauce-name {
        font-size: 16px;
        font-weight: bold;
        margin-bottom: 8px;
        color: #1a1a1a;
    }

    .sauce-description {
        font-size: 14px;
        color: #666;
        margin-bottom: 12px;
        line-height: 1.4;
    }

    .heat-level-indicator {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 8px;
        margin-top: 8px;
    }

    .heat-label {
        font-size: 12px;
        font-weight: bold;
        color: #666;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .heat-visual {
        font-size: 14px;
        line-height: 1;
    }

    .beverages-subtitle {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 16px;
        color: #1a1a1a;
    }

    /* Responsive adjustments for beverages and sauces */
    @media (max-width: 768px) {
        .fountain-hero, .tea-hero {
            flex-direction: column;
            text-align: center;
            padding: 16px;
        }

        .fountain-hero-image, .tea-hero-image {
            width: 100px;
            height: 100px;
        }

        .beverages-cards-grid, .sauces-cards-grid {
            grid-template-columns: 1fr;
            gap: 16px;
        }

        .beverage-image-wrapper, .sauce-image-wrapper {
            height: 140px;
        }
    }
  `;
}

// DoorDash-style JavaScript
function generateDoorDashJS() {
  return `
    // Smooth scrolling for menu tabs
    document.querySelectorAll('.menu-tab').forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                    inline: 'nearest'
                });
            }
        });
    });

    // Update active menu tab on scroll
    window.addEventListener('scroll', function() {
        const sections = document.querySelectorAll('.menu-section');
        const tabs = document.querySelectorAll('.menu-tab');

        let currentSection = '';
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            if (rect.top <= 150 && rect.bottom >= 150) {
                currentSection = section.id;
            }
        });

        tabs.forEach(tab => {
            tab.classList.remove('active');
            if (tab.getAttribute('href') === '#' + currentSection) {
                tab.classList.add('active');
            }
        });
    });

    // Menu item click handler
    document.querySelectorAll('.menu-item-card').forEach(card => {
        card.addEventListener('click', function() {
            // In real DoorDash, this would open item customization modal
            // For now, just add a visual feedback
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
    });

    // Wing Modal System Variables
    let currentModalStep = 1;
    let selectedWingVariant = null;
    let selectedSauces = [];
    let selectedWingStyle = 'regular';
    let selectedExtraDips = [];
    let modalWingsData = [];
    let currentWingType = '';

    // Wing Modal Functions
    window.openWingModal = function(wingType, wingsData) {
        currentWingType = wingType;
        modalWingsData = wingsData;
        currentModalStep = 1;
        selectedWingVariant = null;
        selectedSauces = [];
        selectedWingStyle = 'regular';
        selectedExtraDips = [];

        const modal = document.getElementById('wingModal');
        modal.classList.add('active');
        modal.style.display = 'flex';

        // Reset progress indicators
        document.querySelectorAll('.progress-step').forEach((step, index) => {
            step.classList.remove('active', 'completed');
            if (index === 0) step.classList.add('active');
        });

        // Reset modal steps
        document.querySelectorAll('.modal-step').forEach(step => {
            step.classList.remove('active');
        });
        document.getElementById('modalStep1').classList.add('active');

        // Initialize step 1 - Wing variants
        populateWingVariants();
        updateModalButtons();

        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    };

    window.closeWingModal = function() {
        const modal = document.getElementById('wingModal');
        modal.classList.remove('active');

        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }, 300);
    };

    window.navigateModalStep = function(direction) {
        if (direction === 1) {
            // Moving forward
            if (currentModalStep === 1 && !selectedWingVariant) {
                alert('Please select a wing size first');
                return;
            }
            if (currentModalStep === 2 && selectedSauces.length === 0) {
                alert('Please select at least one sauce');
                return;
            }
        }

        // Update step
        currentModalStep += direction;

        if (currentModalStep < 1) currentModalStep = 1;
        if (currentModalStep > 5) currentModalStep = 5;

        // Update progress indicators
        document.querySelectorAll('.progress-step').forEach((step, index) => {
            step.classList.remove('active', 'completed');
            if (index < currentModalStep - 1) {
                step.classList.add('completed');
            } else if (index === currentModalStep - 1) {
                step.classList.add('active');
            }
        });

        // Show current step
        document.querySelectorAll('.modal-step').forEach((step, index) => {
            step.classList.remove('active');
            if (index === currentModalStep - 1) {
                step.classList.add('active');
            }
        });

        // Initialize step content
        if (currentModalStep === 2) populateSauceSelection();
        if (currentModalStep === 3) populateWingStyleOptions();
        if (currentModalStep === 4) populateExtraDips();
        if (currentModalStep === 5) populateOrderSummary();

        updateModalButtons();
    };

    function populateWingVariants() {
        const container = document.getElementById('wingVariants');
        container.innerHTML = modalWingsData.map(variant => {
            return '<div class="wing-variant-option" onclick="selectWingVariant(\\'' + variant.id + '\\')\">' +
                '<div class="wing-variant-info">' +
                    '<div class="wing-variant-details">' +
                        '<h4>' + variant.count + ' ' + currentWingType + ' Wings</h4>' +
                        '<p>' + (variant.includedSauces || Math.floor(variant.count / 6)) + ' sauce' + ((variant.includedSauces || Math.floor(variant.count / 6)) > 1 ? 's' : '') + ' included</p>' +
                    '</div>' +
                    '<div class="wing-variant-price">$' + variant.platformPrice.toFixed(2) + '</div>' +
                '</div>' +
            '</div>';
        }).join('');
    }

    window.selectWingVariant = function(variantId) {
        selectedWingVariant = modalWingsData.find(v => v.id === variantId);

        // Update UI
        document.querySelectorAll('.wing-variant-option').forEach(option => {
            option.classList.remove('selected');
        });
        event.target.closest('.wing-variant-option').classList.add('selected');
    };

    function populateSauceSelection() {
        // For now, create sample sauce data - in production this would come from Firestore
        const sampleSauces = [
            { id: 'buffalo', name: 'Classic Buffalo', category: 'signature', heatLevel: 2 },
            { id: 'bbq', name: 'Sweet BBQ', category: 'signature', heatLevel: 1 },
            { id: 'honey_mustard', name: 'Honey Mustard', category: 'signature', heatLevel: 1 },
            { id: 'ranch', name: 'Ranch', category: 'dipping', heatLevel: 0 },
            { id: 'blue_cheese', name: 'Blue Cheese', category: 'dipping', heatLevel: 0 },
            { id: 'cajun_dry', name: 'Cajun Dry Rub', category: 'dry-rub', heatLevel: 3 }
        ];

        const maxSauces = selectedWingVariant ? (selectedWingVariant.includedSauces || Math.floor(selectedWingVariant.count / 6)) : 1;

        const container = document.getElementById('sauceSelection');
        container.innerHTML =
            '<div class="sauce-limit-info">Select up to ' + maxSauces + ' sauce' + (maxSauces > 1 ? 's' : '') + ' (included with your wings)</div>' +
            sampleSauces.map(sauce => {
                return '<div class="sauce-option" onclick="toggleSauce(\\'' + sauce.id + '\\')\">' +
                    '<h5>' + sauce.name + '</h5>' +
                    '<p>Heat: ' + '🔥'.repeat(sauce.heatLevel || 1) + '</p>' +
                '</div>';
            }).join('');
    }

    window.toggleSauce = function(sauceId) {
        const maxSauces = selectedWingVariant ? (selectedWingVariant.includedSauces || Math.floor(selectedWingVariant.count / 6)) : 1;

        const index = selectedSauces.indexOf(sauceId);
        if (index > -1) {
            // Remove sauce
            selectedSauces.splice(index, 1);
            event.target.closest('.sauce-option').classList.remove('selected');
        } else {
            // Add sauce if under limit
            if (selectedSauces.length < maxSauces) {
                selectedSauces.push(sauceId);
                event.target.closest('.sauce-option').classList.add('selected');
            } else {
                alert('You can only select up to ' + maxSauces + ' sauce' + (maxSauces > 1 ? 's' : ''));
            }
        }
    };

    function populateWingStyleOptions() {
        const container = document.getElementById('wingStyleOptions');
        container.innerHTML =
            '<div class="wing-variant-option ' + (selectedWingStyle === 'regular' ? 'selected' : '') + '" onclick="selectWingStyle(\\'regular\\')">' +
                '<div class="wing-variant-info">' +
                    '<div class="wing-variant-details">' +
                        '<h4>Regular Mix</h4>' +
                        '<p>Mix of drums and flats (no extra charge)</p>' +
                    '</div>' +
                    '<div class="wing-variant-price">$0.00</div>' +
                '</div>' +
            '</div>' +
            '<div class="wing-variant-option ' + (selectedWingStyle === 'all-drums' ? 'selected' : '') + '" onclick="selectWingStyle(\\'all-drums\\')">' +
                '<div class="wing-variant-info">' +
                    '<div class="wing-variant-details">' +
                        '<h4>All Drums</h4>' +
                        '<p>All drumstick pieces</p>' +
                    '</div>' +
                    '<div class="wing-variant-price">+$1.50</div>' +
                '</div>' +
            '</div>' +
            '<div class="wing-variant-option ' + (selectedWingStyle === 'all-flats' ? 'selected' : '') + '" onclick="selectWingStyle(\\'all-flats\\')">' +
                '<div class="wing-variant-info">' +
                    '<div class="wing-variant-details">' +
                        '<h4>All Flats</h4>' +
                        '<p>All wing flat pieces</p>' +
                    '</div>' +
                    '<div class="wing-variant-price">+$1.50</div>' +
                '</div>' +
            '</div>';
    }

    window.selectWingStyle = function(style) {
        selectedWingStyle = style;

        // Update UI
        document.querySelectorAll('#wingStyleOptions .wing-variant-option').forEach(option => {
            option.classList.remove('selected');
        });
        event.target.closest('.wing-variant-option').classList.add('selected');
    };

    function populateExtraDips() {
        const extraDips = [
            { id: 'extra_ranch', name: 'Extra Ranch', price: 0.75 },
            { id: 'extra_blue_cheese', name: 'Extra Blue Cheese', price: 0.75 },
            { id: 'extra_buffalo', name: 'Extra Buffalo Sauce', price: 0.75 },
            { id: 'extra_bbq', name: 'Extra BBQ Sauce', price: 0.75 }
        ];

        const container = document.getElementById('extraDips');
        container.innerHTML = extraDips.map(dip => {
            return '<div class="sauce-option ' + (selectedExtraDips.includes(dip.id) ? 'selected' : '') + '" onclick="toggleExtraDip(\\'' + dip.id + '\\')\">' +
                '<h5>' + dip.name + '</h5>' +
                '<p>+$' + dip.price.toFixed(2) + '</p>' +
            '</div>';
        }).join('');
    }

    window.toggleExtraDip = function(dipId) {
        const index = selectedExtraDips.indexOf(dipId);
        if (index > -1) {
            selectedExtraDips.splice(index, 1);
            event.target.classList.remove('selected');
        } else {
            selectedExtraDips.push(dipId);
            event.target.classList.add('selected');
        }
    };

    function populateOrderSummary() {
        if (!selectedWingVariant) return;

        const wingStyleUpcharge = selectedWingStyle !== 'regular' ? 1.50 : 0;
        const extraDipsTotal = selectedExtraDips.length * 0.75;
        const totalPrice = selectedWingVariant.platformPrice + wingStyleUpcharge + extraDipsTotal;

        const container = document.getElementById('orderSummary');
        container.innerHTML =
            '<div style="text-align: left; font-size: 16px; line-height: 1.6;">' +
                '<h4 style="margin-bottom: 16px; color: #1a1a1a;">' + selectedWingVariant.count + ' ' + currentWingType + ' Wings</h4>' +
                '<p style="margin-bottom: 8px; color: #666;">Base Price: $' + selectedWingVariant.platformPrice.toFixed(2) + '</p>' +
                '<p style="margin-bottom: 8px; color: #666;">Sauces: ' + selectedSauces.length + ' included</p>' +
                '<p style="margin-bottom: 8px; color: #666;">Style: ' + selectedWingStyle.replace('-', ' ') + (wingStyleUpcharge > 0 ? ' (+$' + wingStyleUpcharge.toFixed(2) + ')' : '') + '</p>' +
                (selectedExtraDips.length > 0 ? '<p style="margin-bottom: 8px; color: #666;">Extra Dips: ' + selectedExtraDips.length + ' (+$' + extraDipsTotal.toFixed(2) + ')</p>' : '') +
                '<hr style="margin: 16px 0; border: none; border-top: 1px solid #eee;">' +
                '<p style="font-size: 18px; font-weight: bold; color: #ff6b35;">Total: $' + totalPrice.toFixed(2) + '</p>' +
            '</div>';
    }

    function updateModalButtons() {
        const backBtn = document.getElementById('modalBackBtn');
        const nextBtn = document.getElementById('modalNextBtn');
        const addToCartBtn = document.getElementById('modalAddToCartBtn');

        // Show/hide back button
        backBtn.style.display = currentModalStep > 1 ? 'block' : 'none';

        // Show/hide next vs add to cart button
        if (currentModalStep === 5) {
            nextBtn.style.display = 'none';
            addToCartBtn.style.display = 'block';
        } else {
            nextBtn.style.display = 'block';
            addToCartBtn.style.display = 'none';
        }
    }

    window.addWingOrderToCart = function() {
        if (!selectedWingVariant) {
            alert('Please complete your wing selection');
            return;
        }

        // Calculate final price
        const wingStyleUpcharge = selectedWingStyle !== 'regular' ? 1.50 : 0;
        const extraDipsTotal = selectedExtraDips.length * 0.75;
        const totalPrice = selectedWingVariant.platformPrice + wingStyleUpcharge + extraDipsTotal;

        // For now, just show success message - in production this would integrate with platform cart
        alert('Added ' + selectedWingVariant.count + ' ' + currentWingType + ' wings to your cart! Total: $' + totalPrice.toFixed(2));

        closeWingModal();
    };
  `;
}
