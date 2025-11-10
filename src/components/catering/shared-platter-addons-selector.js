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
import {
  getState,
  updateState,
  getAddonQuantity,
  updateAddonQuantity,
  getVariantQuantity,
  updateVariantQuantity
} from '../../services/shared-platter-state-service.js';
import { recalculatePricing } from '../../utils/pricing-aggregator.js';
import {
  renderMasonryCategory,
  renderMasonryCard,
  renderPackVariantCard,
  getIconForCategory,
  formatPackSize
} from './shared-addons-ui.js';

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

        <div class="masonry-categories">
          ${renderMasonryCategory('🥤 Quick-Adds & Essentials', '🥤', filtered.quickAdds, false)}
          ${renderMasonryCategory('☕ Premium Hot Beverages', '☕', filtered.hotBeverages, true)}
          ${renderMasonryCategory('🧃 Extra Cold Beverages', '🧃', filtered.beverages, false)}
          ${renderMasonryCategory('🥗 Fresh Salads', '🥗', filtered.salads, false)}
          ${renderMasonryCategory('🥔 Premium Sides', '🥔', filtered.sides, false)}
          ${renderMasonryCategory('🍰 Extra Desserts', '🍰', filtered.desserts, false)}
          ${renderMasonryCategory('🌶️ Sauces To-Go', '🌶️', filtered.saucesToGo, false)}
          ${renderMasonryCategory('🥫 Dips To-Go', '🥫', filtered.dipsToGo, false)}
        </div>

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

// Old rendering functions removed - now using shared masonry UI from shared-addons-ui.js
// - renderCategory() → renderMasonryCategory()
// - renderAddOnCard() → renderMasonryCard() / renderPackVariantCard()
// - getPlaceholderIcon() → getIconForCategory()

/**
 * Initialize add-ons selector interactions
 */
export function initAddOnsSelector() {
  const container = document.querySelector('.addons-selector');
  if (!container) {
    console.warn('Add-ons selector container not found');
    return;
  }

  // Event delegation for masonry card interactions
  container.addEventListener('click', async (e) => {
    // Handle quick-add button (regular single-variant cards)
    const quickAddBtn = e.target.closest('.quick-add-btn');
    if (quickAddBtn) {
      const addonId = quickAddBtn.dataset.addonId;
      await handleQuickAdd(addonId);
      return;
    }

    // Handle quantity buttons (pack variant cards)
    const qtyBtn = e.target.closest('.qty-btn');
    if (qtyBtn) {
      const variantId = qtyBtn.dataset.variantId;
      const addonId = qtyBtn.dataset.addonId;
      const action = qtyBtn.classList.contains('qty-plus') ? 'increment' : 'decrement';

      // Determine if this is a variant or regular addon
      if (variantId) {
        await handleVariantQuantityChange(variantId, action);
      } else if (addonId) {
        await handleRegularQuantityChange(addonId, action);
      }
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

  // Sync quantity displays with current state
  syncQuantityDisplays();

  console.log('✅ Add-ons selector initialized (masonry UI)');
}

/**
 * Handle quick-add button click (single-variant items)
 * @param {string} addonId - Add-on ID
 */
async function handleQuickAdd(addonId) {
  const currentQty = getAddonQuantity(addonId);
  updateAddonQuantity(addonId, currentQty + 1);

  // Update UI
  syncQuantityDisplays();

  // Trigger pricing recalculation
  recalculatePricing(getState(), { trigger: 'addon-quick-add' });
}

/**
 * Handle regular quantity change (shown quantity controls)
 * @param {string} addonId - Add-on ID
 * @param {string} action - 'increment' or 'decrement'
 */
async function handleRegularQuantityChange(addonId, action) {
  const currentQty = getAddonQuantity(addonId);
  const newQty = action === 'increment'
    ? currentQty + 1
    : Math.max(0, currentQty - 1);

  updateAddonQuantity(addonId, newQty);

  // Update UI
  syncQuantityDisplays();

  // Trigger pricing recalculation
  recalculatePricing(getState(), { trigger: 'addon-quantity-change' });
}

/**
 * Handle variant quantity change (pack variant cards)
 * @param {string} variantId - Variant ID
 * @param {string} action - 'increment' or 'decrement'
 */
async function handleVariantQuantityChange(variantId, action) {
  const currentQty = getVariantQuantity(variantId);
  const newQty = action === 'increment'
    ? currentQty + 1
    : Math.max(0, currentQty - 1);

  updateVariantQuantity(variantId, newQty);

  // Update UI
  syncQuantityDisplays();

  // Trigger pricing recalculation
  recalculatePricing(getState(), { trigger: 'variant-quantity-change' });
}

/**
 * Sync quantity displays with current state
 * Updates all qty-display elements to reflect current state
 */
function syncQuantityDisplays() {
  const state = getState();

  // Update regular addon quantities
  const addOns = state.currentConfig?.addOns || {};
  Object.entries(addOns).forEach(([addonId, qty]) => {
    const displays = document.querySelectorAll(`[data-addon-id="${addonId}"] .qty-display`);
    displays.forEach(display => {
      display.textContent = qty;

      // Toggle quick-add button vs quantity controls
      const card = display.closest('.masonry-card');
      if (card) {
        const quickAddBtn = card.querySelector('.quick-add-btn');
        const qtyControls = card.querySelector('.quantity-controls');

        if (qty > 0) {
          if (quickAddBtn) quickAddBtn.style.display = 'none';
          if (qtyControls) qtyControls.style.display = 'flex';
        } else {
          if (quickAddBtn) quickAddBtn.style.display = 'block';
          if (qtyControls) qtyControls.style.display = 'none';
        }
      }
    });
  });

  // Update variant quantities
  const variantAddOns = state.currentConfig?.variantAddOns || {};
  Object.entries(variantAddOns).forEach(([variantId, qty]) => {
    const displays = document.querySelectorAll(`.qty-display[data-variant-id="${variantId}"]`);
    displays.forEach(display => {
      display.textContent = qty;
    });
  });
}

/**
 * Handle quantity change for an add-on (DEPRECATED - kept for backwards compatibility)
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
