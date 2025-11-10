/**
 * Beverages Selector Component - SP-012
 *
 * Table/card hybrid layout for selecting beverages:
 * - Cold beverages: Iced tea, bottled water
 * - Hot beverages: Premium coffee, hot chocolate
 * - Variant-based pricing from Firestore
 * - Independent skip toggles for cold/hot sections
 *
 * @module beverages-selector
 * @created 2025-11-07
 * @epic SP-012
 */

import { getState, updateState } from '../../services/shared-platter-state-service.js';
import { getFirestore, collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { recalculatePricing } from '../../utils/pricing-aggregator.js';

/**
 * Cached beverage data from Firestore
 */
let cachedBeverages = {
  cold: [],
  hot: [],
  lastFetched: null
};

/**
 * Fetch beverages from Firestore (with caching)
 *
 * For catering, we use:
 * - Cold: Boxed Iced Tea, Dasani Bottled Water (from drinks document)
 * - Hot: Lavazza Coffee, Ghirardelli Hot Chocolate
 *
 * Filters OUT bagged_tea (only for platform menus, not catering)
 *
 * @returns {Promise<Object>} Beverages organized by temperature
 */
async function fetchBeverages() {
  // Return cached data if fresh (within 5 minutes)
  const now = Date.now();
  if (cachedBeverages.lastFetched && (now - cachedBeverages.lastFetched < 5 * 60 * 1000)) {
    return {
      cold: cachedBeverages.cold,
      hot: cachedBeverages.hot
    };
  }

  const db = getFirestore();

  try {
    const cold = [];
    const hot = [];

    // 1. Get Boxed Iced Tea by querying where id field = 'boxed_iced_tea'
    const boxedTeaQuery = query(
      collection(db, 'menuItems'),
      where('id', '==', 'boxed_iced_tea'),
      where('active', '==', true)
    );
    const boxedTeaSnapshot = await getDocs(boxedTeaQuery);
    boxedTeaSnapshot.forEach(doc => {
      cold.push({ id: doc.id, ...doc.data() });
    });

    // 2. Get Dasani Water from drinks document and transform to catering format
    const drinksQuery = query(
      collection(db, 'menuItems'),
      where('id', '==', 'drinks'),
      where('active', '==', true)
    );
    const drinksSnapshot = await getDocs(drinksQuery);

    drinksSnapshot.forEach(doc => {
      const drinksData = doc.data();
      const waterVariant = drinksData.variants?.find(v => v.id === 'bottled_water');

      if (waterVariant) {
        // Transform individual bottle to catering bottle quantities
        const bottlePrice = waterVariant.basePrice || 2.29;
        cold.push({
          id: 'dasani_water',
          name: 'Dasani Bottled Water',
          category: 'beverages',
          description: '16.9oz premium bottled water - perfect for events',
          active: true,
          sortOrder: 2,
          images: {
            hero: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Fdasani-water_1920x1080.webp?alt=media'
          },
          variants: [
            {
              id: 'water_5bottles',
              name: '5 Bottles',
              quantity: 5,
              basePrice: bottlePrice * 5,
              servings: 5,
              unit: 'bottles',
              description: '5 bottles (16.9oz each)',
              sortOrder: 1
            },
            {
              id: 'water_10bottles',
              name: '10 Bottles',
              quantity: 10,
              basePrice: bottlePrice * 10,
              servings: 10,
              unit: 'bottles',
              description: '10 bottles (16.9oz each)',
              sortOrder: 2
            },
            {
              id: 'water_20bottles',
              name: '20 Bottles',
              quantity: 20,
              basePrice: bottlePrice * 20,
              servings: 20,
              unit: 'bottles',
              description: '20 bottles (16.9oz each)',
              sortOrder: 3
            }
          ]
        });
      }
    });

    // 3. Get Hot Beverages (coffee and hot chocolate)
    const hotBeveragesQuery = query(
      collection(db, 'menuItems'),
      where('category', '==', 'hot-beverages'),
      where('active', '==', true)
    );

    const hotSnapshot = await getDocs(hotBeveragesQuery);
    hotSnapshot.forEach(doc => {
      hot.push({ id: doc.id, ...doc.data() });
    });

    // Sort by sortOrder
    cold.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    hot.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

    // Update cache
    cachedBeverages = {
      cold,
      hot,
      lastFetched: now
    };

    console.log('✅ Fetched catering beverages:', {
      cold: cold.map(b => b.name),
      hot: hot.map(b => b.name)
    });

    return { cold, hot };

  } catch (error) {
    console.error('Error fetching beverages:', error);
    return { cold: [], hot: [] };
  }
}

/**
 * Render beverages selector
 *
 * @returns {Promise<string>} HTML markup
 */
export async function renderBeveragesSelector() {
  const state = getState();
  const currentConfig = state.currentConfig || {};
  const beverages = currentConfig.beverages || { cold: [], hot: [], skipCold: false, skipHot: false };

  // Fetch beverage data
  const beverageData = await fetchBeverages();

  return `
    <div class="beverages-selector" role="region" aria-label="Beverages Selection">
      <div class="selector-header">
        <h3 class="selector-title">🥤 Beverages</h3>
        <p class="selector-description">Add refreshing cold drinks or warm beverages to your catering order</p>
      </div>

      <!-- Cold Beverages Section -->
      <div class="beverages-subsection cold-beverages-section">
        <div class="subsection-header">
          <h4 class="subsection-title">❄️ Cold Beverages</h4>
          <label class="skip-toggle">
            <input
              type="checkbox"
              id="skip-cold-beverages"
              ${beverages.skipCold ? 'checked' : ''}
              onchange="window.handleSkipColdBeverages(this.checked)"
            />
            <span>Skip cold beverages</span>
          </label>
        </div>

        ${beverages.skipCold ? `
          <div class="skip-message">
            <p>Cold beverages skipped. Uncheck to add cold drinks.</p>
          </div>
        ` : `
          ${renderBeveragesTable(beverageData.cold, beverages.cold, 'cold')}
        `}
      </div>

      <!-- Hot Beverages Section -->
      <div class="beverages-subsection hot-beverages-section">
        <div class="subsection-header">
          <h4 class="subsection-title">☕ Hot Beverages</h4>
          <label class="skip-toggle">
            <input
              type="checkbox"
              id="skip-hot-beverages"
              ${beverages.skipHot ? 'checked' : ''}
              onchange="window.handleSkipHotBeverages(this.checked)"
            />
            <span>Skip hot beverages</span>
          </label>
        </div>

        ${beverages.skipHot ? `
          <div class="skip-message">
            <p>Hot beverages skipped. Uncheck to add hot drinks.</p>
          </div>
        ` : `
          ${renderBeveragesTable(beverageData.hot, beverages.hot, 'hot')}
        `}
      </div>
    </div>
  `;
}

/**
 * Render beverages table for a subsection
 *
 * @param {Array<Object>} beverageItems - Available beverage items
 * @param {Array<Object>} selectedBeverages - Currently selected beverages
 * @param {string} temperature - 'cold' or 'hot'
 * @returns {string} HTML markup
 */
function renderBeveragesTable(beverageItems, selectedBeverages, temperature) {
  if (beverageItems.length === 0) {
    return `
      <div class="empty-state">
        <p>No ${temperature} beverages available at this time.</p>
      </div>
    `;
  }

  return `
    <div class="beverages-table-container">
      <table class="beverages-table" role="table">
        <thead>
          <tr>
            <th scope="col">ITEM</th>
            <th scope="col">SIZE</th>
            <th scope="col">QUANTITY</th>
            <th scope="col">SUBTOTAL</th>
          </tr>
        </thead>
        <tbody>
          ${beverageItems.map(item => renderBeverageRow(item, selectedBeverages, temperature)).join('')}
        </tbody>
      </table>
    </div>
  `;
}

/**
 * Render a single beverage row
 *
 * @param {Object} item - Beverage item data
 * @param {Array<Object>} selectedBeverages - Currently selected beverages
 * @param {string} temperature - 'cold' or 'hot'
 * @returns {string} HTML markup
 */
function renderBeverageRow(item, selectedBeverages, temperature) {
  // Find if this item is currently selected
  const selected = selectedBeverages.find(b => b.id === item.id);
  const currentVariantId = selected?.variantId || (item.variants?.[0]?.id || '');
  const currentQuantity = selected?.quantity || 0;

  // Calculate price range for size dropdown
  const variants = item.variants || [];
  const minPrice = Math.min(...variants.map(v => v.basePrice || 0));
  const maxPrice = Math.max(...variants.map(v => v.basePrice || 0));
  const priceRange = minPrice === maxPrice
    ? `$${minPrice.toFixed(2)}`
    : `$${minPrice.toFixed(2)} - $${maxPrice.toFixed(2)}`;

  // Get current variant for subtotal calculation
  const currentVariant = variants.find(v => v.id === currentVariantId) || variants[0];
  const subtotal = currentVariant ? (currentVariant.basePrice || 0) * currentQuantity : 0;

  // Image URL (use placeholder if not available)
  const imageUrl = item.images?.hero || item.images?.thumbnail ||
    'https://via.placeholder.com/80x80?text=No+Image';

  return `
    <tr class="beverage-row" data-beverage-id="${item.id}" data-temperature="${temperature}">
      <!-- Item Cell -->
      <td class="item-cell">
        <div class="item-info">
          <img
            src="${imageUrl}"
            alt="${item.name}"
            class="item-image"
            loading="lazy"
          />
          <div class="item-details">
            <div class="item-name">${item.name}</div>
            <div class="item-description">${item.description || ''}</div>
          </div>
        </div>
      </td>

      <!-- Size Cell -->
      <td class="size-cell">
        <select
          class="size-selector"
          data-beverage-id="${item.id}"
          data-temperature="${temperature}"
          onchange="window.handleBeverageSizeChange('${item.id}', '${temperature}', this.value)"
        >
          ${variants.map(variant => `
            <option
              value="${variant.id}"
              ${variant.id === currentVariantId ? 'selected' : ''}
            >
              ${variant.name} - $${(variant.basePrice || 0).toFixed(2)}
            </option>
          `).join('')}
        </select>
        <div class="price-range">${priceRange}</div>
      </td>

      <!-- Quantity Cell -->
      <td class="quantity-cell">
        <div class="quantity-controls">
          <button
            type="button"
            class="quantity-btn minus"
            data-beverage-id="${item.id}"
            data-temperature="${temperature}"
            data-action="decrease"
            ${currentQuantity === 0 ? 'disabled' : ''}
            aria-label="Decrease quantity"
          >−</button>
          <span class="quantity-display">${currentQuantity}</span>
          <button
            type="button"
            class="quantity-btn plus"
            data-beverage-id="${item.id}"
            data-temperature="${temperature}"
            data-action="increase"
            aria-label="Increase quantity"
          >+</button>
        </div>
      </td>

      <!-- Subtotal Cell -->
      <td class="subtotal-cell">
        <div class="subtotal-amount">$${subtotal.toFixed(2)}</div>
      </td>
    </tr>
  `;
}

/**
 * Update beverage UI after state change (no full re-render needed)
 * Updates quantity, buttons, and subtotal for a specific beverage
 *
 * @param {string} beverageId - Beverage ID
 * @param {string} temperature - 'cold' or 'hot'
 */
function updateBeverageUI(beverageId, temperature) {
  const state = getState();
  const currentBeverages = state.currentConfig?.beverages || { cold: [], hot: [] };
  const beverageList = temperature === 'cold' ? currentBeverages.cold : currentBeverages.hot;
  const selected = beverageList.find(b => b.id === beverageId);

  // Find the row
  const row = document.querySelector(
    `tr.beverage-row[data-beverage-id="${beverageId}"][data-temperature="${temperature}"]`
  );
  if (!row) return;

  const quantity = selected?.quantity || 0;
  const beverageData = temperature === 'cold'
    ? cachedBeverages.cold?.find(b => b.id === beverageId)
    : cachedBeverages.hot?.find(b => b.id === beverageId);

  const variant = beverageData?.variants?.find(v => v.id === selected?.variantId);
  const subtotal = variant ? (variant.basePrice || 0) * quantity : 0;

  // Update quantity display
  const quantityDisplay = row.querySelector('.quantity-display');
  if (quantityDisplay) {
    quantityDisplay.textContent = quantity;
  }

  // Update quantity buttons
  const minusBtn = row.querySelector('.quantity-btn.minus');
  if (minusBtn) {
    minusBtn.disabled = quantity === 0;
  }

  // Update subtotal
  const subtotalDisplay = row.querySelector('.subtotal-amount');
  if (subtotalDisplay) {
    subtotalDisplay.textContent = `$${subtotal.toFixed(2)}`;
  }
}

/**
 * Refresh all beverage UI elements from current state
 * Idempotent - safe to call multiple times
 */
function refreshBeveragesUI() {
  const state = getState();
  const currentBeverages = state.currentConfig?.beverages || { cold: [], hot: [] };

  // Update all cold beverages
  if (cachedBeverages.cold) {
    cachedBeverages.cold.forEach(item => {
      updateBeverageUI(item.id, 'cold');
    });
  }

  // Update all hot beverages
  if (cachedBeverages.hot) {
    cachedBeverages.hot.forEach(item => {
      updateBeverageUI(item.id, 'hot');
    });
  }
}

/**
 * Handle skip cold beverages toggle
 *
 * @param {boolean} skip - Whether to skip cold beverages
 */
export function handleSkipColdBeverages(skip) {
  const state = getState();
  const currentBeverages = state.currentConfig?.beverages || { cold: [], hot: [], skipCold: false, skipHot: false };

  updateState('currentConfig', {
    ...state.currentConfig,
    beverages: {
      ...currentBeverages,
      skipCold: skip,
      cold: skip ? [] : currentBeverages.cold // Clear selections if skipping
    }
  });

  // Refresh UI to reflect cleared selections
  refreshBeveragesUI();

  // Trigger pricing recalculation
  const updatedState = getState();
  recalculatePricing(updatedState);
}

/**
 * Handle skip hot beverages toggle
 *
 * @param {boolean} skip - Whether to skip hot beverages
 */
export function handleSkipHotBeverages(skip) {
  const state = getState();
  const currentBeverages = state.currentConfig?.beverages || { cold: [], hot: [], skipCold: false, skipHot: false };

  updateState('currentConfig', {
    ...state.currentConfig,
    beverages: {
      ...currentBeverages,
      skipHot: skip,
      hot: skip ? [] : currentBeverages.hot // Clear selections if skipping
    }
  });

  // Refresh UI to reflect cleared selections
  refreshBeveragesUI();

  // Trigger pricing recalculation
  const updatedState = getState();
  recalculatePricing(updatedState);
}

/**
 * Handle beverage size change
 *
 * @param {string} beverageId - Beverage ID
 * @param {string} temperature - 'cold' or 'hot'
 * @param {string} variantId - Selected variant ID
 */
export function handleBeverageSizeChange(beverageId, temperature, variantId) {
  const state = getState();
  const currentBeverages = state.currentConfig?.beverages || { cold: [], hot: [], skipCold: false, skipHot: false };
  const beverageList = temperature === 'cold' ? currentBeverages.cold : currentBeverages.hot;

  // Find the beverage in cached data
  const beverageData = temperature === 'cold'
    ? cachedBeverages.cold.find(b => b.id === beverageId)
    : cachedBeverages.hot.find(b => b.id === beverageId);

  if (!beverageData) return;

  const variant = beverageData.variants?.find(v => v.id === variantId);
  if (!variant) return;

  // Update the variant in the selected beverage
  const updatedList = beverageList.map(b =>
    b.id === beverageId
      ? {
          ...b,
          variantId: variant.id,
          variantName: variant.name,
          basePrice: variant.basePrice,
          servings: variant.servings
        }
      : b
  );

  updateState('currentConfig', {
    ...state.currentConfig,
    beverages: {
      ...currentBeverages,
      [temperature]: updatedList
    }
  });

  // Update UI to reflect new variant (subtotal changes)
  updateBeverageUI(beverageId, temperature);

  // Trigger pricing recalculation
  const updatedState = getState();
  recalculatePricing(updatedState);
}

/**
 * Handle beverage quantity change
 *
 * @param {string} beverageId - Beverage ID
 * @param {string} temperature - 'cold' or 'hot'
 * @param {number} newQuantity - New quantity
 */
export function handleBeverageQuantityChange(beverageId, temperature, newQuantity) {
  // Clamp quantity to valid range
  const quantity = Math.max(0, Math.min(99, newQuantity));

  const state = getState();
  const currentBeverages = state.currentConfig?.beverages || { cold: [], hot: [], skipCold: false, skipHot: false };
  const beverageList = temperature === 'cold' ? currentBeverages.cold : currentBeverages.hot;

  // Find the beverage in cached data
  const beverageData = temperature === 'cold'
    ? cachedBeverages.cold.find(b => b.id === beverageId)
    : cachedBeverages.hot.find(b => b.id === beverageId);

  if (!beverageData) return;

  let updatedList;

  if (quantity === 0) {
    // Remove from list
    updatedList = beverageList.filter(b => b.id !== beverageId);
  } else {
    const existing = beverageList.find(b => b.id === beverageId);

    if (existing) {
      // Update quantity
      updatedList = beverageList.map(b =>
        b.id === beverageId ? { ...b, quantity } : b
      );
    } else {
      // Add new beverage with first variant as default
      const defaultVariant = beverageData.variants?.[0];
      if (!defaultVariant) return;

      updatedList = [
        ...beverageList,
        {
          id: beverageId,
          name: beverageData.name,
          variantId: defaultVariant.id,
          variantName: defaultVariant.name,
          basePrice: defaultVariant.basePrice,
          servings: defaultVariant.servings,
          quantity
        }
      ];
    }
  }

  updateState('currentConfig', {
    ...state.currentConfig,
    beverages: {
      ...currentBeverages,
      [temperature]: updatedList
    }
  });

  // Update UI to reflect new quantity (fast DOM update, no re-render)
  updateBeverageUI(beverageId, temperature);

  // Trigger pricing recalculation
  const updatedState = getState();
  recalculatePricing(updatedState);
}

/**
 * Initialize beverages selector
 * Attaches global handlers for beverage interactions
 *
 * BUG FIX (2025-11-09): Added event delegation for quantity buttons.
 * Previously used inline onclick with hardcoded currentQuantity values,
 * which didn't update after state changes, preventing quantity increases beyond 1.
 */
export function initBeveragesSelector() {
  // Attach global handlers (for inline onchange on size dropdown and skip toggles)
  window.handleSkipColdBeverages = handleSkipColdBeverages;
  window.handleSkipHotBeverages = handleSkipHotBeverages;
  window.handleBeverageSizeChange = handleBeverageSizeChange;

  // Event delegation for quantity buttons
  const selector = document.querySelector('.beverages-selector');
  if (selector) {
    selector.addEventListener('click', (e) => {
      const btn = e.target.closest('.quantity-btn');
      if (!btn) return;

      const beverageId = btn.dataset.beverageId;
      const temperature = btn.dataset.temperature;
      const action = btn.dataset.action;

      if (!beverageId || !temperature || !action) return;

      // Get current quantity from state
      const state = getState();
      const currentBeverages = state.currentConfig?.beverages || { cold: [], hot: [] };
      const beverageList = temperature === 'cold' ? currentBeverages.cold : currentBeverages.hot;
      const selected = beverageList.find(b => b.id === beverageId);
      const currentQuantity = selected?.quantity || 0;

      // Calculate new quantity based on action
      const newQuantity = action === 'increase' ? currentQuantity + 1 : currentQuantity - 1;

      // Call handler with current quantity
      handleBeverageQuantityChange(beverageId, temperature, newQuantity);
    });
  }

  console.log('✅ Beverages selector initialized with event delegation');
}
