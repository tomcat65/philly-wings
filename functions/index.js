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
    const [wingsDoc, friesDoc, drinksDoc, combosSnapshot, saucesSnapshot, settingsDoc] = await Promise.all([
      db.collection('menuItems').doc('Wings').get(),
      db.collection('menuItems').doc('Fries').get(),
      db.collection('menuItems').doc('Drinks').get(),
      db.collection('combos').get(),
      db.collection('sauces').get(),
      db.collection('settings').doc('main').get()
    ]);

    return {
      wings: wingsDoc.exists ? wingsDoc.data() : { variants: [] },
      fries: friesDoc.exists ? friesDoc.data() : { variants: [] },
      drinks: drinksDoc.exists ? drinksDoc.data() : { variants: [] },
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
    sides: processSides(menuData.fries, markup),
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
    basePrice: combo.price,
    platformPrice: (combo.price * markup).toFixed(2),
    markupAmount: ((combo.price * markup) - combo.price).toFixed(2),
    savings: combo.savings || '15%',
    description: combo.description || generateComboDescription(combo)
  }));
}

function processSides(sidesData, markup) {
  if (!sidesData?.variants) return [];

  return sidesData.variants.map(side => ({
    ...side,
    basePrice: side.basePrice,
    platformPrice: (side.basePrice * markup).toFixed(2),
    markupAmount: ((side.basePrice * markup) - side.basePrice).toFixed(2)
  }));
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
            <div class="item-price">$${combo.platformPrice}</div>
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
      document.getElementById('add-to-cart-btn').textContent = \`Add to cart - $\${totalPrice.toFixed(2)}\`;
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
        <a href="#beverages">Drinks</a>
        <a href="#sauces">Sauces</a>
    </nav>
    <div class="menu-container">
        ${generateCombosSection(strategicMenu.combos, { name: getPlatformName(platform) })}
        ${generateWingsSection(strategicMenu.wings, { name: getPlatformName(platform) })}
        ${generateSidesSection(strategicMenu.sides, { name: getPlatformName(platform) })}
        ${generateBeveragesSection(strategicMenu.beverages, { name: getPlatformName(platform) })}
        ${generateSaucesSection(strategicMenu.sauces || [], { name: getPlatformName(platform) })}
    </div>
    <div class="order-modal-placeholder"></div>
    <script>// Strategic menu JS placeholder</script>
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
    combos: [
      {
        id: 'sampler',
        name: 'Sampler Platter',
        description: '6 wings, 4 mozzarella sticks, fries',
        individualPrice: 16.47,
        price: 13.99 * multiplier,
        savings: 2.48,
        badge: 'BEST VALUE',
        image: 'sampler-platter'
      },
      {
        id: 'mvp',
        name: 'MVP Meal',
        description: '12 wings, fries, 4 mozzarella sticks, 4 dips',
        individualPrice: 22.47,
        price: 18.99 * multiplier,
        savings: 3.48,
        badge: 'MOST POPULAR',
        image: 'mvp-meal-combo'
      },
      {
        id: 'tailgater',
        name: 'The Tailgater',
        description: '24 wings, 8 mozzarella sticks, large fries, 8 dips',
        individualPrice: 38.97,
        price: 32.99 * multiplier,
        savings: 5.98,
        badge: 'FAMILY SIZE',
        image: 'party-pack-50-wings'
      },
      {
        id: 'gameday',
        name: 'Game Day 30',
        description: '30 wings, 2 large fries, 8 mozzarella sticks, 10 dips',
        individualPrice: 51.96,
        price: 42.99 * multiplier,
        savings: 8.97,
        badge: 'PARTY SIZE',
        image: 'game-day-30-wings'
      },
      {
        id: 'party-pack',
        name: '50 Party Pack',
        description: '50 wings, 3 large fries, 16 mozzarella sticks, 18 dips',
        individualPrice: 81.94,
        price: 69.99 * multiplier,
        savings: 11.95,
        badge: 'ULTIMATE DEAL',
        image: 'party-pack-50-wings'
      }
    ],
    wings: [
      {
        id: 'boneless-6',
        name: '6 Boneless Wings',
        description: 'Tender boneless wings with 1 sauce',
        price: 6.99 * multiplier,
        image: 'boneless-wings',
        badge: 'CUSTOMER FAVORITE'
      },
      {
        id: 'boneless-12',
        name: '12 Boneless Wings',
        description: 'Perfect for sharing with 2 sauces',
        price: 11.99 * multiplier,
        image: 'boneless-wings',
        badge: 'GREAT VALUE'
      },
      {
        id: 'bone-in-6',
        name: '6 Bone-In Wings',
        description: 'Classic bone-in wings with 1 sauce',
        price: 8.99 * multiplier,
        image: 'original-flats'
      },
      {
        id: 'bone-in-12',
        name: '12 Bone-In Wings',
        description: 'Traditional wings with 2 sauces',
        price: 14.99 * multiplier,
        image: 'original-drums'
      }
    ],
    sides: [
      {
        id: 'loaded-fries',
        name: 'Loaded Fries',
        description: 'Fries topped with cheese, bacon & sour cream',
        price: 8.99 * multiplier,
        image: 'loaded-fries',
        badge: 'SIGNATURE'
      },
      {
        id: 'mozzarella-sticks',
        name: 'Mozzarella Sticks',
        description: '6 crispy mozzarella sticks with marinara',
        price: 6.99 * multiplier,
        image: 'mozzarella-sticks'
      },
      {
        id: 'cheese-fries',
        name: 'Cheese Fries',
        description: 'Golden fries smothered in melted cheese',
        price: 5.99 * multiplier,
        image: 'loaded-fries'
      },
      {
        id: 'fries',
        name: 'French Fries',
        description: 'Crispy golden french fries',
        price: 3.99 * multiplier,
        image: 'fries'
      }
    ],
    beverages: [
      {
        id: 'fountain-32',
        name: '32oz Fountain Drink',
        description: 'Large fountain drink - multiple flavors',
        price: 3.49 * multiplier,
        image: 'fountain-drinks'
      },
      {
        id: 'fountain-20',
        name: '20oz Fountain Drink',
        description: 'Regular fountain drink',
        price: 2.49 * multiplier,
        image: 'fountain-drinks'
      }
    ]
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
            document.getElementById('add-to-bag-btn').textContent = \`Add to bag : $\${total}\`;
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
                cartBtn.textContent = \`Your Bag (\${count})\`;
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
                <div class="item-price">$${combo.platformPrice}</div>
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
                    <img src="https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Fcombo-platter_800x800.webp?alt=media"
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
                        <div class="price-main">$${combo.platformPrice}</div>
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

    <div class="sides-grid">
        ${sides.map((side, index) => {
          const sideImages = [
            'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Floaded-fries_800x800.webp?alt=media',
            'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Fmozzarella-sticks_800x800.webp?alt=media',
            'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Ffries_800x800.webp?alt=media'
          ];
          return `
            <div class="side-card">
                <div class="side-image-wrapper">
                    <img src="${sideImages[index % sideImages.length]}"
                         alt="${side.name}"
                         class="side-image"
                         loading="lazy">
                    ${side.name.toLowerCase().includes('loaded') ? '<div class="loaded-badge">🔥 LOADED</div>' : ''}
                </div>
                <div class="side-details">
                    <h3 class="side-name">${side.name}</h3>
                    <p class="side-description">${side.description || 'Fresh and delicious side item'}</p>
                    <div class="side-pricing">
                        <div class="price-main">$${side.platformPrice}</div>
                        <div class="price-label">Add to Order</div>
                    </div>
                    <button class="add-side-btn">ADD SIDE</button>
                </div>
            </div>
          `;
        }).join('')}
    </div>
</section>`;
}

function generateBeveragesSection(beverages, branding) {
  if (!beverages?.length) return '<section id="beverages"><h2>Beverages section temporarily unavailable</h2></section>';

  return `
<section id="beverages" class="menu-section">
    <div class="section-header">
        <h2 class="section-title">🥤 Beverages</h2>
        <p class="section-description">Refresh your meal • Fountain drinks, water, and sports drinks</p>
    </div>

    <div class="items-grid">
        ${beverages.map(beverage => `
            <div class="menu-item">
                <div class="item-image">
                    <img src="${beverage.image || 'https://storage.googleapis.com/philly-wings.appspot.com/beverages/default-drink.jpg'}"
                         alt="${beverage.name}" loading="lazy">
                </div>
                <div class="item-info">
                    <h3 class="item-name">${beverage.name}</h3>
                    <p class="item-description">${beverage.description || 'Refreshing beverage'}</p>
                    <div class="price-display">
                        <div class="price-main">
                            <span class="platform-price">$${beverage.platformPrice}</span>
                            <span class="price-label">${branding.name} Price</span>
                        </div>
                        <div class="price-breakdown">
                            <span class="base-price">Base: $${beverage.basePrice}</span>
                            <span class="markup-amount">+$${beverage.markupAmount}</span>
                        </div>
                    </div>
                </div>
            </div>
        `).join('')}
    </div>
</section>`;
}

function generateSaucesSection(sauces, branding) {
  if (!sauces?.length) return '<section id="sauces"><h2>Sauces section temporarily unavailable</h2></section>';

  return `
<section id="sauces" class="menu-section">
    <div class="section-header">
        <h2 class="section-title">🌶️ Signature Sauces</h2>
        <p class="section-description">Included with wings • Extra sauces $0.75 each</p>
    </div>

    <div class="sauces-grid">
        ${sauces.map(sauce => `
            <div class="sauce-option">
                <img src="${sauce.imageUrl || sauce.image || 'https://storage.googleapis.com/philly-wings.appspot.com/sauces/default-sauce.jpg'}"
                     alt="${sauce.name}" class="sauce-image">
                <div class="sauce-info">
                    <span class="sauce-name">${sauce.name}</span>
                    <span class="heat-level ${getHeatLevelClass(sauce.heatLevel || 0)}">${getHeatLevelText(sauce.heatLevel || 0)}</span>
                    <p class="sauce-description">${sauce.description || ''}</p>
                </div>
            </div>
        `).join('')}
    </div>
</section>`;
}

function generateWingsSection(wings, branding) {
  if (!wings?.length) return '<section id="wings"><h2>Wings section temporarily unavailable</h2></section>';

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

    <div class="wings-grid">
        ${wings.map((wing, index) => {
          const wingImages = [
            'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Fclassic-buffalo-wings_800x800.webp?alt=media',
            'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Fboneless-wings_200x200.webp?alt=media',
            'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Foriginal-drums_200x200.webp?alt=media',
            'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Foriginal-flats_200x200.webp?alt=media'
          ];
          return `
            <div class="wing-card">
                <div class="wing-image-wrapper">
                    <img src="${wingImages[index % wingImages.length]}"
                         alt="${wing.name}"
                         class="wing-image"
                         loading="lazy">
                    ${wing.popular ? '<div class="popular-badge">🔥 POPULAR</div>' : ''}
                    <div class="wing-count-badge">${wing.count || '6'} Wings</div>
                </div>
                <div class="wing-details">
                    <h3 class="wing-name">${wing.name}</h3>
                    <p class="wing-description">${wing.description}</p>
                    <div class="wing-includes">
                        <span class="include-sauce">+${wing.sauces || 1} Free Sauce${(wing.sauces || 1) > 1 ? 's' : ''}</span>
                    </div>
                    <div class="wing-pricing">
                        <div class="price-main">$${wing.platformPrice}</div>
                        <div class="price-label">On ${branding.name}</div>
                    </div>
                    <button class="order-wing-btn">ADD TO ORDER</button>
                </div>
            </div>
          `;
        }).join('')}
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
  `;
}
