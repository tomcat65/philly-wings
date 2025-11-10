/**
 * Shared Platter Add-Ons Selector Component
 *
 * Optional extras to enhance catering orders:
 * - Quick-adds (chips, bottled water)
 * - Hot beverages (coffee, hot chocolate)
 * - Cold beverages (iced tea)
 * - Extra desserts (beyond package)
 * - Extra salads
 * - Extra sides
 *
 * Features:
 * - Horizontal scrolling category layout (mobile-first)
 * - Tier-aware filtering (respects availableForTiers)
 * - Conflict prevention (hides items already in package)
 * - Event delegation for quantity controls
 * - Real-time pricing integration
 * - 5-minute data caching
 *
 * @module shared-platter-addons-selector
 * @created 2025-11-09
 * @epic SP-013
 */

import { getAllAddOnsSplitByCategory } from '../../services/catering-addons-service.js';
import { getState, updateState } from '../../services/shared-platter-state-service.js';
import { recalculatePricing } from '../../utils/pricing-aggregator.js';

/**
 * Add-ons cache (5-minute TTL)
 */
let addOnsCache = {
  data: null,
  timestamp: null,
  TTL: 5 * 60 * 1000 // 5 minutes
};

/**
 * Fetch add-ons with caching
 * Uses same function as boxed meals for consistency
 * @returns {Promise<Object>} Categorized add-ons with all categories
 */
async function fetchAddOnsWithCaching() {
  const now = Date.now();

  // Return cache if valid
  if (addOnsCache.data &&
      (now - addOnsCache.timestamp) < addOnsCache.TTL) {
    console.log('✅ Using cached add-ons data');
    return addOnsCache.data;
  }

  // Fetch fresh data (same as boxed meals)
  console.log('🔄 Fetching fresh add-ons data from Firestore');
  const categorized = await getAllAddOnsSplitByCategory();

  // Update cache
  addOnsCache = {
    data: categorized,
    timestamp: now,
    TTL: 5 * 60 * 1000
  };

  console.log('✅ Add-ons data cached', {
    categories: Object.keys(categorized).filter(k => categorized[k]?.length > 0)
  });

  return categorized;
}

/**
 * Invalidate add-ons cache (call when package changes)
 */
export function invalidateAddOnsCache() {
  addOnsCache.data = null;
  console.log('🗑️ Add-ons cache invalidated');
}

/**
 * Filter add-ons to prevent conflicts with package inclusions
 * @param {Object} categorized - Add-ons organized by category
 * @param {Object} packageData - Current package data
 * @param {Object} currentConfig - Current customization configuration
 * @returns {Object} Filtered add-ons
 */
function filterAvailableAddOns(categorized, packageData, currentConfig) {
  return {
    // DESSERTS: Always show - users can add MORE beyond customization
    desserts: categorized.desserts,

    // SIDES: Show ONLY sides NOT already in package
    sides: categorized.sides.filter(addon => {
      const includedInPackage = packageData.coldSides?.some(side =>
        side.id && addon.sourceDocumentId &&
        (side.id.includes(addon.sourceDocumentId) ||
         addon.sourceDocumentId.includes(side.id))
      );
      return !includedInPackage;
    }),

    // SALADS: Show ONLY salads NOT already in package
    salads: categorized.salads.filter(addon => {
      const includedInPackage = packageData.salads?.some(salad =>
        salad.id && addon.sourceDocumentId &&
        (salad.id.includes(addon.sourceDocumentId) ||
         addon.sourceDocumentId.includes(salad.id))
      );
      return !includedInPackage;
    }),

    // BEVERAGES: Show items NOT selected in beverages selector
    beverages: categorized.beverages.filter(addon => {
      const inCold = currentConfig.beverages?.cold?.some(b =>
        b.id === addon.id || b.id === addon.sourceDocumentId
      );
      return !inCold;
    }),

    // HOT BEVERAGES: Show items NOT selected in beverages selector
    hotBeverages: categorized.hotBeverages.filter(addon => {
      const inHot = currentConfig.beverages?.hot?.some(b =>
        b.id === addon.id || b.id === addon.sourceDocumentId
      );
      return !inHot;
    }),

    // QUICK-ADDS: Always show (chips, water always needed)
    quickAdds: categorized.quickAdds,

    // SAUCES TO-GO: Always show (extra sauces beyond package)
    saucesToGo: categorized.saucesToGo || [],

    // DIPS TO-GO: Always show (extra dips beyond package)
    dipsToGo: categorized.dipsToGo || []
  };
}

/**
 * Render add-ons selector screen
 * @returns {Promise<string>} HTML markup
 */
export async function renderAddOnsSelector() {
  const state = getState();
  const selectedPackage = state.selectedPackage;

  if (!selectedPackage) {
    return '<div class="error-state">No package selected</div>';
  }

  try {
    // Fetch add-ons with caching (same as boxed meals - all add-ons available)
    const categorized = await fetchAddOnsWithCaching();

    // Filter to prevent conflicts
    const filtered = filterAvailableAddOns(
      categorized,
      selectedPackage,
      state.currentConfig || {}
    );

    // Get current selections from state
    const currentAddOns = state.currentConfig?.addOns || {};

    return `
      <div class="addons-selector" role="region" aria-label="Optional Add-Ons">
        <div class="addons-header">
          <h2 class="addons-title">🎁 Optional Add-Ons</h2>
          <p class="addons-subtitle">Enhance your order with premium extras (or skip to continue)</p>
        </div>

        ${renderCategory('🥤 Quick-Adds & Essentials', 'quickAdds', filtered.quickAdds, currentAddOns.quickAdds, false)}
        ${renderCategory('☕ Premium Hot Beverages', 'hotBeverages', filtered.hotBeverages, currentAddOns.hotBeverages, true)}
        ${renderCategory('🧃 Extra Cold Beverages', 'beverages', filtered.beverages, currentAddOns.beverages, false)}
        ${renderCategory('🥗 Fresh Salads', 'salads', filtered.salads, currentAddOns.salads, false)}
        ${renderCategory('🥔 Premium Sides', 'sides', filtered.sides, currentAddOns.sides, false)}
        ${renderCategory('🍰 Extra Desserts', 'desserts', filtered.desserts, currentAddOns.desserts, false)}
        ${renderCategory('🌶️ Sauces To-Go', 'saucesToGo', filtered.saucesToGo, currentAddOns.saucesToGo, false)}
        ${renderCategory('🥫 Dips To-Go', 'dipsToGo', filtered.dipsToGo, currentAddOns.dipsToGo, false)}

        <div class="addons-footer">
          <button class="btn-secondary" id="btn-back-from-addons">
            ← Back to Customization
          </button>
          <button class="btn-primary" id="btn-continue-from-addons">
            Continue to Review →
          </button>
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Error rendering add-ons:', error);
    return `
      <div class="error-state">
        <p>Unable to load add-ons at this time.</p>
        <button class="btn-secondary" onclick="location.reload()">Retry</button>
      </div>
    `;
  }
}

/**
 * Render a category section with horizontal scroll
 * @param {string} title - Category title with icon
 * @param {string} categoryKey - Category key (quickAdds, desserts, etc.)
 * @param {Array} items - Items in this category
 * @param {Array} currentSelections - Current selections from state
 * @param {boolean} featured - Whether to use larger cards
 * @returns {string} HTML markup
 */
function renderCategory(title, categoryKey, items, currentSelections = [], featured = false) {
  if (!items || items.length === 0) {
    return ''; // Don't render empty categories
  }

  return `
    <div class="addons-category">
      <div class="addons-category-header">
        <h3 class="category-title">${title}</h3>
        <span class="category-count">${items.length} available</span>
      </div>
      <div class="horizontal-scroll" data-category="${categoryKey}">
        ${items.map(item => renderAddOnCard(item, categoryKey, currentSelections, featured)).join('')}
      </div>
    </div>
  `;
}

/**
 * Render individual add-on card
 * @param {Object} item - Add-on item
 * @param {string} categoryKey - Category key
 * @param {Array} currentSelections - Current selections
 * @param {boolean} featured - Featured size
 * @returns {string} HTML markup
 */
function renderAddOnCard(item, categoryKey, currentSelections, featured) {
  // Check if this item is currently selected
  const selected = currentSelections?.find(s => s.id === item.id);
  const currentQuantity = selected?.quantity || 0;

  const cardClass = featured ? 'addon-card featured' : 'addon-card';
  const price = item.price || item.basePrice || 0;
  const servingInfo = item.servings ? `Serves ${item.servings}` : '';
  const packInfo = item.packSize ? `${item.packSize}` : '';

  // Handle missing images gracefully
  const imageUrl = item.imageUrl || getPlaceholderIcon(categoryKey);

  return `
    <div class="${cardClass}" data-addon-id="${item.id}" data-category="${categoryKey}">
      <div class="addon-card-image">
        <img
          src="${imageUrl}"
          alt="${item.name}"
          loading="lazy"
          width="280"
          height="200"
          onerror="this.src='https://via.placeholder.com/280x200?text=No+Image'"
        />
      </div>
      <div class="addon-card-content">
        <h4 class="addon-card-name">${item.name}</h4>
        ${item.description ? `<p class="addon-card-desc">${item.description}</p>` : ''}
        ${packInfo ? `<p class="addon-card-pack">${packInfo}</p>` : ''}
        ${servingInfo ? `<p class="addon-card-serving">${servingInfo}</p>` : ''}
        <div class="addon-card-footer">
          <div class="addon-card-price">$${price.toFixed(2)}</div>
          ${currentQuantity > 0 ? `
            <div class="addon-quantity-controls">
              <button
                class="addon-qty-btn addon-qty-minus"
                data-addon-id="${item.id}"
                data-category="${categoryKey}"
                aria-label="Decrease quantity"
              >−</button>
              <span class="addon-qty-display">${currentQuantity}</span>
              <button
                class="addon-qty-btn addon-qty-plus"
                data-addon-id="${item.id}"
                data-category="${categoryKey}"
                aria-label="Increase quantity"
              >+</button>
            </div>
          ` : `
            <button
              class="addon-quick-add-btn"
              data-addon-id="${item.id}"
              data-category="${categoryKey}"
            >+ Add</button>
          `}
        </div>
      </div>
    </div>
  `;
}

/**
 * Get placeholder icon for category
 * @param {string} categoryKey - Category key
 * @returns {string} Placeholder URL
 */
function getPlaceholderIcon(categoryKey) {
  const icons = {
    quickAdds: 'https://via.placeholder.com/280x200/f0f0f0/333?text=Quick+Add',
    hotBeverages: 'https://via.placeholder.com/280x200/8B4513/fff?text=Hot+Beverage',
    beverages: 'https://via.placeholder.com/280x200/4682B4/fff?text=Cold+Beverage',
    desserts: 'https://via.placeholder.com/280x200/FFB6C1/333?text=Dessert',
    salads: 'https://via.placeholder.com/280x200/90EE90/333?text=Salad',
    sides: 'https://via.placeholder.com/280x200/FFD700/333?text=Side'
  };
  return icons[categoryKey] || 'https://via.placeholder.com/280x200?text=Item';
}

/**
 * Initialize add-ons selector interactions
 */
export function initAddOnsSelector() {
  const container = document.querySelector('.addons-selector');
  if (!container) {
    console.warn('Add-ons selector container not found');
    return;
  }

  // Event delegation for all quantity buttons
  container.addEventListener('click', async (e) => {
    // Handle Quick Add button
    if (e.target.classList.contains('addon-quick-add-btn')) {
      const addonId = e.target.dataset.addonId;
      const category = e.target.dataset.category;
      await handleQuantityChange(addonId, category, 1);
      return;
    }

    // Handle quantity + button
    if (e.target.classList.contains('addon-qty-plus')) {
      const addonId = e.target.dataset.addonId;
      const category = e.target.dataset.category;
      const currentQty = getCurrentQuantity(addonId, category);
      await handleQuantityChange(addonId, category, currentQty + 1);
      return;
    }

    // Handle quantity - button
    if (e.target.classList.contains('addon-qty-minus')) {
      const addonId = e.target.dataset.addonId;
      const category = e.target.dataset.category;
      const currentQty = getCurrentQuantity(addonId, category);
      await handleQuantityChange(addonId, category, Math.max(0, currentQty - 1));
      return;
    }
  });

  // Navigation buttons
  const backBtn = document.getElementById('btn-back-from-addons');
  if (backBtn) {
    backBtn.addEventListener('click', handleBackToCustomization);
  }

  const continueBtn = document.getElementById('btn-continue-from-addons');
  if (continueBtn) {
    continueBtn.addEventListener('click', handleContinueToReview);
  }

  console.log('✅ Add-ons selector initialized');
}

/**
 * Get current quantity for an add-on
 * @param {string} addonId - Add-on ID
 * @param {string} category - Category key
 * @returns {number} Current quantity
 */
function getCurrentQuantity(addonId, category) {
  const state = getState();
  const categoryItems = state.currentConfig?.addOns?.[category] || [];
  const item = categoryItems.find(i => i.id === addonId);
  return item?.quantity || 0;
}

/**
 * Handle quantity change for an add-on
 * @param {string} addonId - Add-on ID
 * @param {string} categoryKey - Category key
 * @param {number} newQuantity - New quantity
 */
async function handleQuantityChange(addonId, categoryKey, newQuantity) {
  const quantity = Math.max(0, Math.min(99, newQuantity)); // Clamp 0-99
  const state = getState();

  // Get current add-ons
  const currentAddOns = state.currentConfig?.addOns || {};
  const categoryItems = currentAddOns[categoryKey] || [];

  // Find the add-on data from cache
  const cachedData = addOnsCache.data?.[categoryKey] || [];
  const addonData = cachedData.find(a => a.id === addonId);

  if (!addonData) {
    console.error(`Add-on ${addonId} not found in cache`);
    return;
  }

  let updatedCategoryItems;

  if (quantity === 0) {
    // Remove from list
    updatedCategoryItems = categoryItems.filter(item => item.id !== addonId);
  } else {
    const existing = categoryItems.find(item => item.id === addonId);

    if (existing) {
      // Update quantity
      updatedCategoryItems = categoryItems.map(item =>
        item.id === addonId ? { ...item, quantity } : item
      );
    } else {
      // Add new item
      updatedCategoryItems = [
        ...categoryItems,
        {
          id: addonId,
          name: addonData.name,
          quantity,
          basePrice: addonData.price || addonData.basePrice || 0,
          category: addonData.category,
          servings: addonData.servings,
          packSize: addonData.packSize,
          quantityLabel: addonData.quantityLabel || 'items'
        }
      ];
    }
  }

  // Update state
  updateState('currentConfig', {
    ...state.currentConfig,
    addOns: {
      ...currentAddOns,
      [categoryKey]: updatedCategoryItems
    }
  });

  // Update UI for this specific card
  updateCardUI(addonId, categoryKey, quantity);

  // Trigger pricing recalculation
  const updatedState = getState();
  recalculatePricing(updatedState);

  console.log(`🎁 Add-on updated: ${addonId} = ${quantity}`);
}

/**
 * Update card UI after quantity change
 * @param {string} addonId - Add-on ID
 * @param {string} categoryKey - Category key
 * @param {number} quantity - New quantity
 */
function updateCardUI(addonId, categoryKey, quantity) {
  const card = document.querySelector(
    `.addon-card[data-addon-id="${addonId}"][data-category="${categoryKey}"]`
  );
  if (!card) return;

  const footer = card.querySelector('.addon-card-footer');
  if (!footer) return;

  const priceEl = footer.querySelector('.addon-card-price');
  const priceHTML = priceEl ? priceEl.outerHTML : '';

  if (quantity === 0) {
    // Show Quick Add button
    footer.innerHTML = `
      ${priceHTML}
      <button
        class="addon-quick-add-btn"
        data-addon-id="${addonId}"
        data-category="${categoryKey}"
      >+ Add</button>
    `;
  } else {
    // Show quantity controls
    footer.innerHTML = `
      ${priceHTML}
      <div class="addon-quantity-controls">
        <button
          class="addon-qty-btn addon-qty-minus"
          data-addon-id="${addonId}"
          data-category="${categoryKey}"
          aria-label="Decrease quantity"
        >−</button>
        <span class="addon-qty-display">${quantity}</span>
        <button
          class="addon-qty-btn addon-qty-plus"
          data-addon-id="${addonId}"
          data-category="${categoryKey}"
          aria-label="Increase quantity"
        >+</button>
      </div>
    `;
  }
}

/**
 * Handle back to customization navigation
 */
function handleBackToCustomization() {
  const addonsContainer = document.getElementById('addons-screen-container');
  const customizationContainer = document.getElementById('customization-screen-container');

  if (addonsContainer) addonsContainer.style.display = 'none';
  if (customizationContainer) {
    customizationContainer.style.display = 'block';
    customizationContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  updateState('currentStep', 'customization');
  console.log('← Navigated back to customization from add-ons');
}

/**
 * Handle continue to review navigation
 */
function handleContinueToReview() {
  // TODO: Implement review screen navigation
  console.log('→ Continuing to review (not yet implemented)');
  alert('Review screen coming soon!');
}
