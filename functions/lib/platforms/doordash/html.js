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
        ${generateBeveragesSection(menuData, branding)}
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

    <!-- Sides Ordering Modal (Shared) -->
    <div id="sidesModal" class="sides-modal" style="display: none;">
        <div class="modal-backdrop" onclick="closeSidesModal()"></div>
        <div class="modal-content">
            <div class="modal-header">
                <button class="modal-close" onclick="closeSidesModal()">&times;</button>
                <h2 id="sideModalTitle" class="modal-title">Choose Your Side</h2>
                <div class="modal-progress" id="sideModalProgress"></div>
            </div>
            <div class="modal-body">
                <div id="sideModalVariants" class="modal-step active">
                    <h3 id="sideVariantsTitle" class="modal-step-title">Choose Your Side</h3>
                    <div id="sideOptions" class="side-options-grid"></div>
                </div>
                <div id="sideModalCustomization" class="modal-step">
                    <h3 id="sideCustomizationTitle" class="modal-step-title">Customize</h3>
                    <div id="sideCustomizationContent"></div>
                </div>
                <div id="sideModalDips" class="modal-step">
                    <h3 id="sideDipsTitle" class="modal-step-title">Extra Dipping Sauces</h3>
                    <div id="sideExtraDips" class="extra-dips-grid"></div>
                </div>
                <div id="sideModalSummary" class="modal-step">
                    <h3 id="sideSummaryTitle" class="modal-step-title">Order Summary</h3>
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
                    <div class="progress-step active" data-step="1" style="font-size: 12px; position: relative; z-index: 1;">Size</div>
                    <div class="progress-step" data-step="2" style="font-size: 12px; position: relative; z-index: 1;">Flavor</div>
                    <div class="progress-step" data-step="3" style="font-size: 12px; position: relative; z-index: 1;">Cart</div>
                </div>
            </div>
            <div class="modal-body">
                <div id="beverageModalStep1" class="modal-step active">
                    <h3 id="beverageStep1Title">Choose Your Size</h3>
                    <div id="beverageSizeOptions" class="wing-variants-grid"></div>
                </div>
                <div id="beverageModalStep2" class="modal-step">
                    <h3 id="beverageStep2Title">Choose Your Flavor</h3>
                    <div id="beverageFlavorOptions" class="wing-variants-grid"></div>
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

  const cardsHtml = combos.map(raw => {
    // Safe fallbacks for incomplete production combo documents
    const id = raw.id || '';
    const nameFromDescMatch = typeof raw.description === 'string' && raw.description.match(/(\d+)\s*wings?/i);
    const derivedName = nameFromDescMatch ? `${nameFromDescMatch[1]}-Wing Combo` : (id ? `Combo ${id}` : 'Combo Deal');
    const name = raw.name || derivedName;

    const description = raw.description || `${name} - A perfect meal combination`;
    const imageUrl = raw.imageUrl || (raw.images && (raw.images.hero || raw.images.original)) || 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Fcombo-platter_800x800.webp?alt=media';

    let price = raw.platformPrice;
    if (price === undefined || price === null) {
      const base = typeof raw.basePrice === 'number' ? raw.basePrice : parseFloat(raw.basePrice) || 0;
      const fallback = base * 1.35; // default DD markup as a safe fallback
      price = fallback > 0 ? fallback : null;
    }
    const priceHtml = price !== null ? (typeof price === 'number' ? price.toFixed(2) : price) : 'N/A';

    const badge = raw.badge || 'COMBO DEAL';
    const savings = (typeof raw.savings === 'string' && raw.savings.includes('%')) ? raw.savings : (raw.savings || '$8');

    return `
      <div class="combo-card featured">
        <div class="combo-image-wrapper">
          <img src="${imageUrl}"
               alt="${name}"
               class="combo-image"
               loading="lazy">
          <div class="combo-badge">${badge}</div>
          <div class="savings-badge">Save ${savings}</div>
        </div>
        <div class="combo-details">
          <h3 class="combo-name">${name}</h3>
          <p class="combo-description">${description}</p>
          <div class="combo-includes">
            ${generateComboIncludes(raw).map(include => `<span class="include-item">${include.emoji} ${include.name}</span>`).join('')}
          </div>
          <div class="combo-pricing">
            <div class="price-main">$${priceHtml}</div>
            <div class="price-label">Order on ${branding.platformName}</div>
          </div>
          <button class="order-now-btn">ORDER NOW →</button>
        </div>
      </div>`;
  }).join('');

  return `
    <section id="combos" class="menu-section">
      <div class="section-header">
        <h2 class="section-title">🔥 COMBO DEALS</h2>
        <p class="section-description">Save up to 17% • Complete meals ready in 20-30 mins</p>
      </div>
      <div class="combo-cards-grid">
        ${cardsHtml}
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
            <button class="order-wing-category-btn interactive" onclick="openBonelessWingModal()">
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
            <button class="order-wing-category-btn interactive" onclick="openBoneInWingModal()">
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
                    <button class="order-side-category-btn" onclick="openFriesModal()">VIEW OPTIONS →</button>
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
                    <button class="order-side-category-btn" onclick="openLoadedFriesModal()">VIEW OPTIONS →</button>
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
                    <button class="order-side-category-btn" onclick="openMozzarellaModal()">VIEW OPTIONS →</button>
                </div>
            </div>
        </div>
    </section>
  `;
}

/**
 * Generate beverages section HTML
 */
function generateBeveragesSection(menuData, branding) {
  // Extract all beverage data from the menu
  const drinksDoc = menuData.drinks;
  const baggedTeaDoc = menuData.bagged_tea;
  const boxedIcedTeaDoc = menuData.boxed_iced_tea;

  // Get variants from drinks document
  const variants = drinksDoc?.variants || [];

  // Create beverage groups from all beverage sources
  const beverageGroups = createAllBeverageGroups(variants, baggedTeaDoc, boxedIcedTeaDoc);

  return `
    <section id="beverages" class="menu-section">
        <div class="section-header">
            <h2 class="section-title">🥤 Beverages</h2>
            <p class="section-description">Cool down the heat with handcrafted refreshments</p>
        </div>

        <div class="beverages-cards-grid">
            ${beverageGroups.map((group, groupIndex) => {
              const displayPrice = (() => {
                const firstVariant = group.sizes[0];
                const platformPrice = firstVariant?.platformPricing?.doordash ?? firstVariant?.platformPrice;
                const base = typeof platformPrice === 'number' ? platformPrice : parseFloat(platformPrice);
                const fallback = typeof firstVariant?.basePrice === 'number' ? firstVariant.basePrice : parseFloat(firstVariant?.basePrice);
                const value = !Number.isNaN(base) && base > 0 ? base : (!Number.isNaN(fallback) && fallback > 0 ? fallback : 0);
                return value.toFixed(2);
              })();

              const cardClasses = ['beverage-card'];
              if (group.featured) cardClasses.push('featured');

              const flavorCount = group.flavors?.length || 0;
              const hasMultipleSizes = group.sizes?.length > 1;
              const badgeText = group.badge || (flavorCount > 0 ? `${flavorCount} FLAVORS` : (hasMultipleSizes ? 'CHOOSE SIZE' : ''));

              return `
                <div class="${cardClasses.join(' ')}" onclick="openBeverageModal(window.beverageGroups[${groupIndex}])">
                    <div class="beverage-image-wrapper">
                        <img src="${group.imageUrl}"
                             alt="${group.name}"
                             class="beverage-image"
                             loading="lazy">
                        ${badgeText ? `<div class="beverage-badge">${badgeText}</div>` : ''}
                    </div>
                    <div class="beverage-details">
                        <h3 class="beverage-name">${group.name}</h3>
                        <p class="beverage-description">${group.description}</p>
                        <div class="beverage-pricing">
                            <div class="price-main">$${displayPrice}</div>
                            <div class="price-label">${hasMultipleSizes ? 'Starting at' : (flavorCount > 0 ? 'Choose flavor' : 'Add to order')}</div>
                        </div>
                        <button class="beverage-btn">
                            ${hasMultipleSizes || flavorCount > 0 ? 'VIEW OPTIONS →' : 'ADD TO ORDER'}
                        </button>
                    </div>
                </div>
              `;
            }).join('')}
        </div>
    </section>
  `;
}

// Helper function to create all beverage groups from multiple sources
function createAllBeverageGroups(drinksVariants, baggedTeaDoc, boxedIcedTeaDoc) {
  const groups = [];

  // 1. Fountain Drinks from drinks variants
  const fountainVariants = drinksVariants.filter(v => v.id.includes('fountain'));
  if (fountainVariants.length > 0) {
    groups.push({
      id: 'fountain-drinks',
      name: 'Fountain Drinks',
      description: '8 Flavors: Coca-Cola, Diet Coke, Coke Zero, Sprite, Fanta Orange, Dr Pepper, Barq\'s Root Beer, Hi-C Fruit Punch',
      imageUrl: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Ffountain-drinks_200x200.webp?alt=media',
      badge: 'CHOOSE SIZE',
      featured: true,
      sizes: fountainVariants.map(v => ({
        id: v.id,
        name: v.size || v.name,
        label: v.size || v.name,
        description: `Fountain drink ${v.size}`,
        platformPrice: v.platformPrice || v.basePrice,
        basePrice: v.basePrice
      })),
      flavors: [
        { id: 'coca_cola', name: 'Coca-Cola' },
        { id: 'diet_coke', name: 'Diet Coke' },
        { id: 'coke_zero', name: 'Coke Zero' },
        { id: 'sprite', name: 'Sprite' },
        { id: 'fanta_orange', name: 'Fanta Orange' },
        { id: 'dr_pepper', name: 'Dr Pepper' },
        { id: 'barqs_root_beer', name: 'Barq\'s Root Beer' },
        { id: 'hic_fruit_punch', name: 'Hi-C Fruit Punch' }
      ],
      type: 'fountain'
    });
  }

  // 2. Fresh Brewed Tea (individual sizes) from drinks variants
  const teaVariants = drinksVariants.filter(v => v.id.includes('tea'));
  if (teaVariants.length > 0) {
    // Extract unique sizes from tea variants (20oz, 32oz)
    const uniqueSizes = [];
    const sizesSeen = new Set();

    teaVariants.forEach(v => {
      const sizeLabel = v.size || (v.name.includes('20oz') ? '20oz' : v.name.includes('32oz') ? '32oz' : 'Standard');
      if (!sizesSeen.has(sizeLabel)) {
        sizesSeen.add(sizeLabel);
        // Use the first variant of this size for pricing (sweet tea)
        const sampleVariant = teaVariants.find(tv => (tv.size || tv.name).includes(sizeLabel));
        uniqueSizes.push({
          id: sampleVariant.id,
          name: sampleVariant.name,
          label: sizeLabel,
          description: `Fresh brewed tea ${sizeLabel}`,
          platformPrice: sampleVariant.platformPrice || sampleVariant.basePrice,
          basePrice: sampleVariant.basePrice
        });
      }
    });

    groups.push({
      id: 'iced-tea',
      name: 'Fresh Brewed Tea',
      description: 'Freshly brewed daily • Sweet or unsweetened • Individual sizes',
      imageUrl: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Ficed-tea_200x200.webp?alt=media',
      badge: 'FRESH DAILY',
      sizes: uniqueSizes,
      flavors: [
        { id: 'sweet', name: 'Sweet Tea' },
        { id: 'unsweetened', name: 'Unsweetened Tea' }
      ],
      type: 'tea'
    });
  }

  // 3. Bagged Tea from separate document
  if (baggedTeaDoc && baggedTeaDoc.variants && baggedTeaDoc.variants.length > 0) {
    groups.push({
      id: 'bagged-tea',
      name: baggedTeaDoc.name || 'Bagged Tea',
      description: baggedTeaDoc.description || 'Bulk tea in convenient bags • Perfect for groups',
      imageUrl: baggedTeaDoc.images?.hero || 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fbagged-tea.png?alt=media',
      badge: 'BULK SIZE',
      sizes: baggedTeaDoc.variants.map(v => ({
        id: v.id,
        name: v.name,
        label: v.name,
        description: v.description,
        platformPrice: v.platformPrice || v.basePrice,
        basePrice: v.basePrice
      })),
      flavors: [
        { id: 'sweet', name: 'Sweet Tea' },
        { id: 'unsweetened', name: 'Unsweetened Tea' }
      ],
      type: 'bagged_tea'
    });
  }

  // 4. Boxed Iced Tea from separate document
  if (boxedIcedTeaDoc && boxedIcedTeaDoc.variants && boxedIcedTeaDoc.variants.length > 0) {
    groups.push({
      id: 'boxed-iced-tea',
      name: boxedIcedTeaDoc.name || 'Boxed Iced Tea',
      description: boxedIcedTeaDoc.description || 'Large volume iced tea in boxes • Includes ice',
      imageUrl: boxedIcedTeaDoc.images?.hero || 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fboxed-iced-tea.png?alt=media',
      badge: 'LARGE VOLUME',
      sizes: boxedIcedTeaDoc.variants.map(v => ({
        id: v.id,
        name: v.name,
        label: v.name,
        description: v.description,
        platformPrice: v.platformPrice || v.basePrice,
        basePrice: v.basePrice
      })),
      flavors: [
        { id: 'sweet', name: 'Sweet Tea' },
        { id: 'unsweetened', name: 'Unsweetened Tea' }
      ],
      type: 'boxed_tea'
    });
  }

  // 5. Bottled Water from drinks variants
  const waterVariants = drinksVariants.filter(v => v.id.includes('water'));
  if (waterVariants.length > 0) {
    waterVariants.forEach(variant => {
      groups.push({
        id: variant.id,
        name: variant.name,
        description: 'Pure refreshment • 16.9 fl oz bottle',
        imageUrl: variant.image || 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Fwater-bottle_200x200.webp?alt=media',
        badge: 'PURE',
        sizes: [{
          id: variant.id,
          name: variant.name,
          label: 'Standard',
          description: variant.description || 'Pure refreshment • 16.9 fl oz bottle',
          platformPrice: variant.platformPrice || variant.basePrice,
          basePrice: variant.basePrice
        }],
        flavors: [],
        type: 'bottle'
      });
    });
  }

  return groups;
}

// Legacy function kept for compatibility (not used anymore)
function groupVariantsIntoBeverageTypes(variants) {
  return createAllBeverageGroups(variants, null, null);
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
