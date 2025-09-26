/**
 * DoorDash HTML Generation
 * Handles all HTML structure generation for DoorDash platform
 */

const { generateOptimizedImageUrl } = require('../../core/storage');
const { generateTodaysHours, formatCurrency } = require('../../core/utils');

/**
 * Generate DoorDash HTML body content
 * @param {Object} menuData Processed menu data
 * @param {Object} branding Platform branding config
 * @param {Object} settings Restaurant settings
 * @returns {string} HTML body content
 */
function generateDoorDashHTMLBody(menuData, branding, settings) {
  const todaysHours = generateTodaysHours(settings);

  return `
    <!-- Header Section -->
    <header class="restaurant-header">
        <div class="header-content">
            <div class="restaurant-info">
                <h1 class="restaurant-name">Philly Wings Express</h1>
                <p class="restaurant-description">Authentic Philadelphia Wings & More</p>
                <div class="restaurant-meta">
                    <span class="hours">${todaysHours}</span>
                    <span class="delivery-info">• Delivery Available</span>
                </div>
            </div>
        </div>
    </header>

    <!-- Navigation Menu -->
    <nav class="menu-navigation">
        <div class="nav-container">
            <button class="mobile-menu-toggle" onclick="toggleMobileMenu()" aria-label="Toggle Menu">
                <span class="hamburger-line"></span>
                <span class="hamburger-line"></span>
                <span class="hamburger-line"></span>
            </button>
            <div class="nav-items" id="navItems">
                <a href="#combos" class="nav-item" onclick="closeMobileMenu()">Combos</a>
                <a href="#wings" class="nav-item" onclick="closeMobileMenu()">Wings</a>
                <a href="#sides" class="nav-item" onclick="closeMobileMenu()">Sides</a>
                <a href="#dips" class="nav-item" onclick="closeMobileMenu()">Dips</a>
                <a href="#beverages" class="nav-item" onclick="closeMobileMenu()">Beverages</a>
                <a href="#sauces" class="nav-item" onclick="closeMobileMenu()">Sauces</a>
            </div>
        </div>
    </nav>

    <!-- Menu Sections -->
    <main class="menu-content">
        ${generateCombosSection(menuData.combos, branding)}
        ${generateWingsSection(menuData.wings, branding)}
        ${generateSidesSection(menuData.sides, branding)}
        ${generateDipsSection(menuData.sauces.filter(s => s.category === 'dipping-sauce'), branding)}
        ${generateBeveragesSection(menuData.beverages, branding)}
        ${generateSaucesSection(menuData.sauces, branding)}
    </main>

    <!-- Wing Modal -->
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
                    <div class="progress-step" data-step="6">6</div>
                </div>
            </div>
            <div class="modal-body">
                <div id="modalStep1" class="modal-step active">
                    <h3>Choose Your Wing Size</h3>
                    <div id="wingVariants" class="wing-variants-grid"></div>
                </div>
                <div id="modalStep2" class="modal-step">
                    <h3>Choose Your Sauces</h3>
                    <div id="sauceOptions" class="sauce-options-grid"></div>
                </div>
                <div id="modalStep3" class="modal-step">
                    <h3 id="step3Title">Choose Included Dips</h3>
                    <div id="includedDipOptions" class="included-dip-options"></div>
                </div>
                <div id="modalStep4" class="modal-step">
                    <h3 id="step4Title">Wing Style</h3>
                    <div id="wingStyleOptions" class="wing-style-options"></div>
                </div>
                <div id="modalStep5" class="modal-step">
                    <h3 id="step5Title">Extra Dips</h3>
                    <div id="extraDipOptions" class="extra-dip-options"></div>
                </div>
                <div id="modalStep6" class="modal-step">
                    <h3 id="step6Title">Order Summary</h3>
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

    <!-- Sides Ordering Modal -->
    <div id="sidesModal" class="sides-modal" style="display: none;">
        <div class="modal-backdrop" onclick="closeSidesModal()"></div>
        <div class="modal-content">
            <div class="modal-header">
                <button class="modal-close" onclick="closeSidesModal()">&times;</button>
                <h2 id="sideModalTitle" class="modal-title">Choose Your Side</h2>
                <div class="modal-progress">
                    <div class="progress-step active" data-step="1">Options</div>
                    <div class="progress-step" data-step="2">Dips</div>
                    <div class="progress-step" data-step="3">Summary</div>
                </div>
            </div>
            <div class="modal-body">
                <div id="sideModalStep1" class="modal-step active">
                    <div id="sideOptions" class="side-options-grid"></div>
                </div>
                <div id="sideModalStep2" class="modal-step">
                    <h3>Extra Dipping Sauces</h3>
                    <div id="sideExtraDips" class="extra-dips-grid"></div>
                </div>
                <div id="sideModalStep3" class="modal-step">
                    <h3>Order Summary</h3>
                    <div id="sideOrderSummary" class="order-summary"></div>
                </div>
            </div>
            <div class="modal-footer">
                <button id="sideModalBackBtn" onclick="navigateSideModalStep(-1)" style="display: none;">← Back</button>
                <button id="sideModalNextBtn" onclick="navigateSideModalStep(1)">Next →</button>
                <button id="sideModalAddToCartBtn" onclick="addSideOrderToCart()" style="display: none;">Add to Cart</button>
            </div>
        </div>
    </div>

    <!-- Beverage Ordering Modal -->
    <div id="beverageModal" class="wing-modal" style="display: none;">
        <div class="modal-backdrop" onclick="closeBeverageModal()"></div>
        <div class="modal-content">
            <div class="modal-header">
                <button class="modal-close" onclick="closeBeverageModal()">&times;</button>
                <h2 id="beverageModalTitle" class="modal-title">Choose Your Beverage</h2>
                <div class="modal-progress">
                    <div class="progress-step active" data-step="1">Size</div>
                    <div class="progress-step" data-step="2">Flavor</div>
                    <div class="progress-step" data-step="3">Summary</div>
                </div>
            </div>
            <div class="modal-body">
                <div id="beverageModalStep1" class="modal-step active">
                    <h3 id="beverageStep1Title">Choose Your Size</h3>
                    <div id="beverageSizeOptions" class="beverage-size-options"></div>
                </div>
                <div id="beverageModalStep2" class="modal-step">
                    <h3 id="beverageStep2Title">Choose Your Flavor</h3>
                    <div id="beverageFlavorOptions" class="beverage-flavor-options"></div>
                </div>
                <div id="beverageModalStep3" class="modal-step">
                    <h3>Order Summary</h3>
                    <div id="beverageOrderSummary" class="order-summary"></div>
                </div>
            </div>
            <div class="modal-footer">
                <button id="beverageModalBackBtn" onclick="navigateBeverageModalStep(-1)" style="display: none;">← Back</button>
                <button id="beverageModalNextBtn" onclick="navigateBeverageModalStep(1)">Next →</button>
                <button id="beverageModalAddToCartBtn" onclick="addBeverageOrderToCart()" style="display: none;">Add to Cart</button>
            </div>
        </div>
    </div>
  `;
}

/**
 * Generate combos section HTML with rich professional design
 */
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
                        <div class="combo-badge">${combo.badge || 'COMBO DEAL'}</div>
                        <div class="savings-badge">Save ${typeof combo.savings === 'string' && combo.savings.includes('%') ? combo.savings : (combo.savings || '$8')}</div>
                    </div>
                    <div class="combo-details">
                        <h3 class="combo-name">${combo.name}</h3>
                        <p class="combo-description">${combo.description}</p>
                        <div class="combo-includes">
                            ${generateComboIncludes(combo).map(include =>
                                `<span class="include-item">${include.emoji} ${include.name}</span>`
                            ).join('')}
                        </div>
                        <div class="combo-pricing">
                            <div class="price-main">$${combo.platformPrice ? (typeof combo.platformPrice === 'number' ? combo.platformPrice.toFixed(2) : combo.platformPrice) : 'N/A'}</div>
                            <div class="price-label">Order on ${branding.platformName}</div>
                        </div>
                        <button class="order-now-btn">ORDER NOW →</button>
                    </div>
                </div>
            `).join('')}
        </div>
    </section>
  `;
}

/**
 * Generate wings section HTML
 */
function generateWingsSection(wings, branding) {
  if (!wings || !wings.variants || wings.variants.length === 0) return '';

  const bonelessWings = wings.variants.filter(w => w.type === 'boneless');
  const boneInWings = wings.variants.filter(w => w.type === 'bone-in');

  // Calculate min prices for each category
  const minBonelessPrice = bonelessWings.length > 0 ? Math.min(...bonelessWings.map(w => w.platformPrice)) : 0;
  const minBoneInPrice = boneInWings.length > 0 ? Math.min(...boneInWings.map(w => w.platformPrice)) : 0;

  return `
    <section id="wings" class="menu-section">
        <div class="section-header">
            <h2 class="section-title">🔥 WINGS</h2>
            <p class="section-description">Every wing brined overnight, hand-tossed in signature sauces</p>
        </div>

        <div class="wings-categories-grid">
            ${bonelessWings.length > 0 ? generateBonelessWingCard(minBonelessPrice, minBoneInPrice) : ''}
            ${boneInWings.length > 0 ? generateBoneInWingCard(minBoneInPrice) : ''}
        </div>
    </section>
  `;
}

/**
 * Generate combo includes array based on combo data
 * @param {Object} combo Combo data object
 * @returns {Array} Array of include objects with emoji and name
 */
function generateComboIncludes(combo) {
  // Default includes for all combos
  const defaultIncludes = [
    { emoji: '🍗', name: 'Wings' },
    { emoji: '🍟', name: 'Fries' },
    { emoji: '🧀', name: 'Mozz Sticks' },
    { emoji: '🌶️', name: 'Sauces' }
  ];

  // Return combo-specific includes if available, otherwise return defaults
  if (combo.includes && Array.isArray(combo.includes)) {
    return combo.includes.map(include => {
      // Handle different include formats
      if (typeof include === 'string') {
        // Map common items to emojis
        const emojiMap = {
          'wings': '🍗',
          'fries': '🍟',
          'mozzarella sticks': '🧀',
          'mozz sticks': '🧀',
          'sauces': '🌶️',
          'drink': '🥤',
          'beverage': '🥤'
        };
        const emoji = emojiMap[include.toLowerCase()] || '✨';
        return { emoji, name: include };
      } else if (include.name) {
        return include;
      }
      return { emoji: '✨', name: include.toString() };
    });
  }

  return defaultIncludes;
}

/**
 * Generate boneless wing category card
 */
function generateBonelessWingCard(minBonelessPrice, minBoneInPrice) {
  const savings = minBoneInPrice > 0 ? Math.round(((minBoneInPrice - minBonelessPrice) / minBoneInPrice) * 100) : 22;

  return `
    <div class="wing-category-card enhanced" data-wing-type="boneless">
        <div class="wing-category-image-wrapper">
            <img src="https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fmenu%2Fphilly-classic-hot.jpg?alt=media"
                 alt="Boneless Wings"
                 class="wing-category-image"
                 loading="lazy">
            <div class="wing-category-badge">ALL WHITE MEAT</div>
            <div class="value-badge">💰 ${savings}% CHEAPER</div>
        </div>
        <div class="wing-category-details">
            <h3 class="wing-category-name">Boneless Wings</h3>
            <p class="wing-category-description">All White Chicken, Juicy and Lightly Breaded</p>
            <div class="wing-category-pricing">
                <div class="price-main">Starting at ${formatCurrency(minBonelessPrice)}</div>
                <div class="price-comparison">${savings}% cheaper than bone-in</div>
            </div>
            <button class="order-wing-category-btn interactive" onclick="openWingModal('boneless')">
                VIEW OPTIONS →
            </button>
        </div>
    </div>
  `;
}

/**
 * Generate bone-in wing category card
 */
function generateBoneInWingCard(minBoneInPrice) {
  return `
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
                <div class="price-main">Starting at ${formatCurrency(minBoneInPrice)}</div>
            </div>
            <button class="order-wing-category-btn interactive" onclick="openWingModal('bone-in')">
                VIEW OPTIONS →
            </button>
        </div>
    </div>
  `;
}

/**
 * Generate sides section HTML with rich professional design
 */
function generateSidesSection(sides, branding) {
  // Calculate minimum prices from the sides data for display
  const friesSides = sides?.filter(s => s.category === 'fries') || [];
  const mozzSides = sides?.filter(s => s.category === 'mozzarella-sticks') || [];

  const minFriesPrice = friesSides.length > 0 ? Math.min(...friesSides.map(s => s.platformPrice)) : 4.99;
  const minMozzPrice = mozzSides.length > 0 ? Math.min(...mozzSides.map(s => s.platformPrice)) : 6.99;
  const loadedFriesPrice = friesSides.find(s => s.name?.toLowerCase().includes('large'))?.platformPrice || 8.99;

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
                        <div class="price-main">Starting at ${formatCurrency(minFriesPrice)}</div>
                        <div class="price-label">Choose Size</div>
                    </div>
                    <button class="order-side-category-btn" onclick="openSideModal('fries')">VIEW OPTIONS →</button>
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
                        <div class="price-main">Starting at ${formatCurrency(loadedFriesPrice)}</div>
                        <div class="price-label">Large Size</div>
                    </div>
                    <button class="order-side-category-btn" onclick="openSideModal('loaded-fries')">VIEW OPTIONS →</button>
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
                    <p class="side-category-description">Golden fried mozzarella sticks with marinara sauce • Choose your quantity</p>
                    <div class="side-sizes-info">
                        <span class="sizes-label">4, 8, 12, or 16 pieces</span>
                    </div>
                    <div class="side-category-pricing">
                        <div class="price-main">Starting at ${formatCurrency(minMozzPrice)}</div>
                        <div class="price-label">Choose Quantity</div>
                    </div>
                    <button class="order-side-category-btn" onclick="openSideModal('mozzarella-sticks')">VIEW OPTIONS →</button>
                </div>
            </div>
        </div>
    </section>
  `;
}

/**
 * Generate beverages section HTML
 */
function generateBeveragesSection(beverages, branding) {
  if (!beverages || beverages.length === 0) return '';

  // Separate fountain drinks, tea, and other beverages (matching original logic)
  const fountainDrinks = beverages.filter(b => b.name.toLowerCase().includes('fountain'));
  const teaDrinks = beverages.filter(b => b.name.toLowerCase().includes('tea'));
  const otherBeverages = beverages.filter(b => !b.name.toLowerCase().includes('fountain') && !b.name.toLowerCase().includes('tea'));

  // Combine all beverages into rich card format
  const allBeverages = [];

  // Add fountain drinks as a single card
  if (fountainDrinks.length > 0) {
    allBeverages.push({
      id: 'fountain-drinks',
      name: 'Fountain Drinks',
      description: '8 Flavors: Coca-Cola, Diet Coke, Coke Zero, Sprite, Fanta Orange, Dr Pepper, Barq\'s Root Beer, Hi-C Fruit Punch',
      imageUrl: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Ffountain-drinks_200x200.webp?alt=media',
      platformPrice: fountainDrinks[0]?.platformPrice || fountainDrinks[0]?.basePrice || 3.36,
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
      badge: 'FRESH DAILY',
      details: teaDrinks.map(t => ({ name: t.name, price: t.platformPrice || t.basePrice })),
      type: 'tea'
    });
  }

  // Add other beverages (like bottled water)
  otherBeverages.forEach(beverage => {
    allBeverages.push({
      id: beverage.id || 'bottled-water',
      name: beverage.name || 'Bottled Water',
      description: beverage.description || 'Pure refreshment • 16.9 fl oz bottle',
      imageUrl: beverage.imageUrl || 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Fwater-bottle_200x200.webp?alt=media',
      platformPrice: beverage.platformPrice || beverage.basePrice || 3.09,
      badge: 'PURE',
      type: 'bottle'
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
                            <div class="price-main">$${beverage.platformPrice ? (typeof beverage.platformPrice === 'number' ? beverage.platformPrice.toFixed(2) : parseFloat(beverage.platformPrice).toFixed(2)) : 'N/A'}</div>
                            <div class="price-label">${beverage.details ? 'Starting at' : 'Add to Order'}</div>
                        </div>
                        <button class="beverage-btn">
                            ${beverage.details ? 'VIEW OPTIONS →' : 'ADD TO ORDER'}
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    </section>
  `;
}

/**
 * Generate sauces section HTML
 */
function generateSaucesSection(sauces, branding) {
  if (!sauces || sauces.length === 0) return '';

  // Separate dry rubs from sauces
  const dryRubs = sauces.filter(sauce => sauce.isDryRub === true || sauce.category === 'dry-rub').sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  const classicSauces = sauces.filter(sauce => sauce.isDryRub !== true && sauce.category !== 'dry-rub' && sauce.category !== 'dipping-sauce').sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

  // Helper function for heat level styling
  function getHeatLevelDisplay(heatLevel) {
    const level = heatLevel || 1;
    const indicators = '🌶️'.repeat(Math.min(level, 5));
    const levelText = level <= 1 ? 'MILD' : level <= 2 ? 'MEDIUM' : level <= 3 ? 'HOT' : level <= 4 ? 'EXTRA HOT' : 'BLAZING';
    const levelColor = level <= 1 ? '#00b887' : level <= 2 ? '#ff9500' : level <= 3 ? '#ff6600' : '#ff3333';

    return `
      <div class="sauce-heat-level" style="color: ${levelColor};">
        <span class="heat-indicators">${indicators}</span>
        <span class="heat-text">${levelText}</span>
      </div>
    `;
  }

  return `
    <section id="sauces" class="menu-section">
        <div class="section-header">
            <h2 class="section-title">🌶️ Signature Wing Sauces</h2>
            <p class="section-description">From mild to blazing - all house-made with premium ingredients</p>
        </div>

        ${dryRubs.length > 0 ? `
        <div class="sauce-category-section">
            <h3 class="sauce-category-title">🥄 Dry Rubs</h3>
            <p class="sauce-category-description">Crispy wings tossed in our signature spice blends</p>
            <div class="sauces-cards-grid">
                ${dryRubs.map(sauce => `
                    <div class="sauce-card" onclick="openSauceModal('${sauce.id}', ${JSON.stringify(sauce).replace(/"/g, '&quot;')})">
                        <div class="sauce-image-wrapper">
                            <img src="${sauce.imageUrl || generateOptimizedImageUrl(sauce)}"
                                 alt="${sauce.name}"
                                 class="sauce-image"
                                 loading="lazy">
                            <div class="sauce-badge">DRY RUB</div>
                        </div>
                        <div class="sauce-content">
                            <h3 class="sauce-name">${sauce.name}</h3>
                            <p class="sauce-description">${sauce.description || 'Premium spice blend'}</p>
                            ${getHeatLevelDisplay(sauce.heatLevel)}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        ` : ''}

        ${classicSauces.length > 0 ? `
        <div class="sauce-category-section">
            <h3 class="sauce-category-title">🍯 Wing Sauces</h3>
            <p class="sauce-category-description">Rich, flavorful sauces that coat every wing perfectly</p>
            <div class="sauces-cards-grid">
                ${classicSauces.map(sauce => `
                    <div class="sauce-card" onclick="openSauceModal('${sauce.id}', ${JSON.stringify(sauce).replace(/"/g, '&quot;')})">
                        <div class="sauce-image-wrapper">
                            <img src="${sauce.imageUrl || generateOptimizedImageUrl(sauce)}"
                                 alt="${sauce.name}"
                                 class="sauce-image"
                                 loading="lazy">
                            ${sauce.isSignature ? '<div class="sauce-badge">SIGNATURE</div>' : ''}
                        </div>
                        <div class="sauce-content">
                            <h3 class="sauce-name">${sauce.name}</h3>
                            <p class="sauce-description">${sauce.description || 'House-made wing sauce'}</p>
                            ${getHeatLevelDisplay(sauce.heatLevel)}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        ` : ''}
    </section>
  `;
}

/**
 * Generate dips section HTML
 */
function generateDipsSection(dips, branding) {
  // Define the 4 rich dip cards (matching original monolithic version)
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
      price: '$0.75'
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
    </section>
  `;
}

module.exports = {
  generateDoorDashHTMLBody: generateDoorDashHTMLBody,
  generateCombosSection,
  generateWingsSection,
  generateSidesSection,
  generateBeveragesSection,
  generateSaucesSection,
  generateDipsSection,
  generateComboIncludes
};