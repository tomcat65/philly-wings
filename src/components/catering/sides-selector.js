/**
 * Sides Selector - SP-010
 * Selector for chips, cold sides, and fresh salads in shared platters
 *
 * Features:
 * - Chips subsection with variety display and counter
 * - Cold sides with size variants (Regular/Large/Family)
 * - Fresh salads with size variants (Individual/Family)
 * - Responsive design (Alt 3 mobile, Alt 2 desktop)
 * - Photo cards with allergen badges
 * - Real-time pricing integration
 *
 * Created: 2025-11-05
 * Story: SP-010 (5 points)
 */

import { collection, query, where, orderBy, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase-config.js';
import { getState, updateState } from '../../services/shared-platter-state-service.js';
import { recalculatePricing } from '../../utils/pricing-aggregator.js';
import { packageTransformer } from '../../services/package-data-transformer.js';

/**
 * Render sides selector with all three subsections
 * @param {Object} options - Configuration options
 * @param {Object} options.preSelected - Pre-selected sides {chips, coldSides: [], salads: []}
 * @returns {Promise<string>} HTML markup
 */
export async function renderSidesSelector(options = {}) {
  const { preSelected = { chips: null, coldSides: [], salads: [] } } = options;

  return `
    <div class="sides-selector">
      <div class="sides-section-header">
        <h3 class="section-title">🥗 Sides</h3>
        <p class="section-description">Complete your platter with delicious sides</p>
      </div>

      ${await renderChipsSubsection(preSelected.chips)}
      ${await renderColdSidesSubsection(preSelected.coldSides)}
      ${await renderFreshSaladsSubsection(preSelected.salads)}
    </div>
  `;
}

/**
 * Render chips subsection
 */
async function renderChipsSubsection(preSelected) {
  const chips = await fetchChips();
  if (!chips) return '';

  const currentQuantity = preSelected?.quantity || 0;
  const includedQuantity = preSelected?.includedQuantity || 0;
  const varieties = chips.varieties || [];

  return `
    <div class="sides-subsection chips-subsection">
      <h4 class="subsection-title">🥔 Chips</h4>

      <div class="chips-card" data-chips-id="${chips.id}">
        <!-- Mobile: Compact List -->
        <div class="chips-compact">
          <div class="chips-thumb">
            <img src="${chips.imageUrl}" alt="${chips.name}" loading="lazy">
          </div>
          <div class="chips-info-compact">
            <h5 class="chips-name">${chips.name}</h5>
            ${varieties.length > 0 ? `
              <p class="chips-varieties">${varieties.join(', ')}</p>
            ` : ''}
          </div>
          <div class="chips-counter-compact">
            <button
              type="button"
              class="counter-btn counter-minus"
              data-chips-action="minus"
              aria-label="Decrease chips quantity"
              ${currentQuantity === 0 ? 'disabled' : ''}>
              −
            </button>
            <span class="counter-display" id="chips-counter">
              ${currentQuantity}
              ${includedQuantity > 0 ? `<span class="included-badge">${includedQuantity} included</span>` : ''}
            </span>
            <button
              type="button"
              class="counter-btn counter-plus"
              data-chips-action="plus"
              aria-label="Increase chips quantity">
              +
            </button>
          </div>
        </div>

        <!-- Desktop: Large Card -->
        <div class="chips-large-card">
          <div class="chips-photo">
            <img src="${chips.imageUrl}" alt="${chips.name}" loading="lazy">
          </div>
          <div class="chips-content">
            <h5 class="chips-name">${chips.name}</h5>
            <p class="chips-description">${chips.description || ''}</p>
            ${varieties.length > 0 ? `
              <div class="chips-varieties-pills">
                ${varieties.map(v => `<span class="variety-pill">${v}</span>`).join('')}
              </div>
            ` : ''}
            <div class="chips-counter">
              <button
                type="button"
                class="counter-btn counter-minus"
                data-chips-action="minus"
                aria-label="Decrease chips quantity"
                ${currentQuantity === 0 ? 'disabled' : ''}>
                −
              </button>
              <span class="counter-display" id="chips-counter-desktop">
                ${currentQuantity}
                ${includedQuantity > 0 ? `<span class="included-badge">${includedQuantity} included</span>` : ''}
              </span>
              <button
                type="button"
                class="counter-btn counter-plus"
                data-chips-action="plus"
                aria-label="Increase chips quantity">
                +
              </button>
              <span class="counter-unit">five-packs</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render cold sides subsection
 */
async function renderColdSidesSubsection(preSelected) {
  const coldSides = await fetchColdSides();
  if (coldSides.length === 0) return '';

  return `
    <div class="sides-subsection cold-sides-subsection">
      <h4 class="subsection-title">🥗 Cold Sides</h4>

      <!-- Mobile: Compact List -->
      <div class="sides-list-compact">
        ${coldSides.map(side => renderColdSideCompact(side, preSelected.find(s => s.id === side.id))).join('')}
      </div>

      <!-- Desktop: Photo Cards Grid -->
      <div class="sides-grid-large">
        ${coldSides.map(side => renderColdSideLarge(side, preSelected.find(s => s.id === side.id))).join('')}
      </div>
    </div>
  `;
}

/**
 * Render fresh salads subsection
 */
async function renderFreshSaladsSubsection(preSelected) {
  const salads = await fetchFreshSalads();
  if (salads.length === 0) return '';

  return `
    <div class="sides-subsection salads-subsection">
      <h4 class="subsection-title">🥗 Fresh Salads</h4>

      <!-- Mobile: Compact List -->
      <div class="sides-list-compact">
        ${salads.map(salad => renderSaladCompact(salad, preSelected.find(s => s.id === salad.id))).join('')}
      </div>

      <!-- Desktop: Photo Cards Grid -->
      <div class="sides-grid-large">
        ${salads.map(salad => renderSaladLarge(salad, preSelected.find(s => s.id === salad.id))).join('')}
      </div>
    </div>
  `;
}

/**
 * Render cold side - compact mobile layout
 */
function renderColdSideCompact(side, preSelected) {
  const currentSize = preSelected?.size || side.variants[0]?.id;
  const currentQuantity = preSelected?.quantity || 0;
  const includedQuantity = preSelected?.includedQuantity || 0;
  const allergens = side.allergens || [];

  return `
    <div class="side-item-compact" data-side-id="${side.id}">
      <div class="side-thumb">
        <img src="${side.imageUrl}" alt="${side.name}" loading="lazy">
      </div>
      <div class="side-info-compact">
        <h5 class="side-name">${side.name}</h5>
        ${allergens.length > 0 ? `
          <p class="allergens-compact">${allergens.join(', ')}</p>
        ` : ''}
        <select class="size-selector-compact" data-side-id="${side.id}">
          ${side.variants.map(v => `
            <option value="${v.id}" ${v.id === currentSize ? 'selected' : ''}>
              ${v.name} (${v.servings} servings) - $${v.basePrice}
            </option>
          `).join('')}
        </select>
      </div>
      <div class="side-counter-compact">
        <button
          type="button"
          class="counter-btn counter-minus"
          data-side-id="${side.id}"
          aria-label="Decrease ${side.name} quantity"
          ${currentQuantity === 0 ? 'disabled' : ''}>
          −
        </button>
        <span class="counter-display" data-side-id="${side.id}">
          ${currentQuantity}
          ${includedQuantity > 0 ? `<span class="included-badge">${includedQuantity} included</span>` : ''}
        </span>
        <button
          type="button"
          class="counter-btn counter-plus"
          data-side-id="${side.id}"
          aria-label="Increase ${side.name} quantity">
          +
        </button>
      </div>
    </div>
  `;
}

/**
 * Render cold side - large card desktop layout
 */
function renderColdSideLarge(side, preSelected) {
  const currentSize = preSelected?.size || side.variants[0]?.id;
  const currentQuantity = preSelected?.quantity || 0;
  const includedQuantity = preSelected?.includedQuantity || 0;
  const allergens = side.allergens || [];
  const currentVariant = side.variants.find(v => v.id === currentSize) || side.variants[0];

  return `
    <div class="side-card-large" data-side-id="${side.id}">
      <div class="side-photo">
        <img src="${side.imageUrl}" alt="${side.name}" loading="lazy">
        ${allergens.length > 0 ? `
          <div class="allergen-badges">
            ${allergens.map(a => `<span class="allergen-badge">${a}</span>`).join('')}
          </div>
        ` : ''}
      </div>
      <div class="side-content">
        <h5 class="side-name">${side.name}</h5>
        <p class="side-description">${side.description || ''}</p>

        <div class="size-variants">
          ${side.variants.map(v => `
            <label class="size-variant-option">
              <input
                type="radio"
                name="size-${side.id}"
                value="${v.id}"
                data-side-id="${side.id}"
                ${v.id === currentSize ? 'checked' : ''}>
              <span class="size-label">${v.name}</span>
              <span class="size-details">${v.servings} servings • $${v.basePrice}</span>
            </label>
          `).join('')}
        </div>

        <div class="side-counter">
          <button
            type="button"
            class="counter-btn counter-minus"
            data-side-id="${side.id}"
            aria-label="Decrease ${side.name} quantity"
            ${currentQuantity === 0 ? 'disabled' : ''}>
            −
          </button>
          <span class="counter-display" data-side-id="${side.id}">
            ${currentQuantity}
            ${includedQuantity > 0 ? `<span class="included-badge">${includedQuantity} included</span>` : ''}
          </span>
          <button
            type="button"
            class="counter-btn counter-plus"
            data-side-id="${side.id}"
            aria-label="Increase ${side.name} quantity">
            +
          </button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render salad - compact mobile layout
 */
function renderSaladCompact(salad, preSelected) {
  const currentSize = preSelected?.size || salad.variants[0]?.id;
  const currentQuantity = preSelected?.quantity || 0;
  const includedQuantity = preSelected?.includedQuantity || 0;
  const allergens = salad.allergens || [];

  return `
    <div class="side-item-compact" data-salad-id="${salad.id}">
      <div class="side-thumb">
        <img src="${salad.imageUrl}" alt="${salad.name}" loading="lazy">
      </div>
      <div class="side-info-compact">
        <h5 class="side-name">${salad.name}</h5>
        ${allergens.length > 0 ? `
          <p class="allergens-compact">${allergens.join(', ')}</p>
        ` : ''}
        <select class="size-selector-compact" data-salad-id="${salad.id}">
          ${salad.variants.map(v => `
            <option value="${v.id}" ${v.id === currentSize ? 'selected' : ''}>
              ${v.name} (${v.servings} ${v.servings === 1 ? 'serving' : 'servings'}) - $${v.basePrice}
            </option>
          `).join('')}
        </select>
      </div>
      <div class="side-counter-compact">
        <button
          type="button"
          class="counter-btn counter-minus"
          data-salad-id="${salad.id}"
          aria-label="Decrease ${salad.name} quantity"
          ${currentQuantity === 0 ? 'disabled' : ''}>
          −
        </button>
        <span class="counter-display" data-salad-id="${salad.id}">
          ${currentQuantity}
          ${includedQuantity > 0 ? `<span class="included-badge">${includedQuantity} included</span>` : ''}
        </span>
        <button
          type="button"
          class="counter-btn counter-plus"
          data-salad-id="${salad.id}"
          aria-label="Increase ${salad.name} quantity">
          +
        </button>
      </div>
    </div>
  `;
}

/**
 * Render salad - large card desktop layout
 */
function renderSaladLarge(salad, preSelected) {
  const currentSize = preSelected?.size || salad.variants[0]?.id;
  const currentQuantity = preSelected?.quantity || 0;
  const includedQuantity = preSelected?.includedQuantity || 0;
  const allergens = salad.allergens || [];
  const currentVariant = salad.variants.find(v => v.id === currentSize) || salad.variants[0];

  return `
    <div class="side-card-large" data-salad-id="${salad.id}">
      <div class="side-photo">
        <img src="${salad.imageUrl}" alt="${salad.name}" loading="lazy">
        ${allergens.length > 0 ? `
          <div class="allergen-badges">
            ${allergens.map(a => `<span class="allergen-badge">${a}</span>`).join('')}
          </div>
        ` : ''}
      </div>
      <div class="side-content">
        <h5 class="side-name">${salad.name}</h5>
        <p class="side-description">${salad.description || ''}</p>

        <div class="size-variants">
          ${salad.variants.map(v => `
            <label class="size-variant-option">
              <input
                type="radio"
                name="size-${salad.id}"
                value="${v.id}"
                data-salad-id="${salad.id}"
                ${v.id === currentSize ? 'checked' : ''}>
              <span class="size-label">${v.name}</span>
              <span class="size-details">${v.servings} ${v.servings === 1 ? 'serving' : 'servings'} • $${v.basePrice}</span>
            </label>
          `).join('')}
        </div>

        <div class="side-counter">
          <button
            type="button"
            class="counter-btn counter-minus"
            data-salad-id="${salad.id}"
            aria-label="Decrease ${salad.name} quantity"
            ${currentQuantity === 0 ? 'disabled' : ''}>
            −
          </button>
          <span class="counter-display" data-salad-id="${salad.id}">
            ${currentQuantity}
            ${includedQuantity > 0 ? `<span class="included-badge">${includedQuantity} included</span>` : ''}
          </span>
          <button
            type="button"
            class="counter-btn counter-plus"
            data-salad-id="${salad.id}"
            aria-label="Increase ${salad.name} quantity">
            +
          </button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Initialize sides selector interactions
 */
export function initSidesSelector() {
  const container = document.querySelector('.sides-selector');
  if (!container) {
    console.warn('Sides selector container not found');
    return;
  }

  // Chips counter handlers
  initChipsCounter();

  // Cold sides handlers
  initColdSidesHandlers();

  // Salads handlers
  initSaladsHandlers();

  console.log('✅ Sides selector initialized');
}

/**
 * Initialize chips counter
 */
function initChipsCounter() {
  const chipsCard = document.querySelector('.chips-card');
  if (!chipsCard) return;

  const chipsId = chipsCard.dataset.chipsId;
  let chipsQuantity = 0;

  // Get initial quantity from display
  const counterEl = document.getElementById('chips-counter');
  if (counterEl) {
    chipsQuantity = parseInt(counterEl.textContent) || 0;
  }

  // Counter button handlers (delegated)
  chipsCard.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-chips-action]');
    if (!btn) return;

    const action = btn.dataset.chipsAction;
    const displays = chipsCard.querySelectorAll('.counter-display');
    const minusButtons = chipsCard.querySelectorAll('[data-chips-action="minus"]');

    // Update quantity
    if (action === 'plus') {
      chipsQuantity++;
    } else if (action === 'minus') {
      chipsQuantity = Math.max(0, chipsQuantity - 1);
    }

    // Update all displays (mobile + desktop)
    displays.forEach(display => {
      display.textContent = chipsQuantity;
    });

    // Update minus button states
    minusButtons.forEach(minusBtn => {
      minusBtn.disabled = chipsQuantity === 0;
    });

    // Button animation
    btn.classList.add('btn-clicked');
    setTimeout(() => btn.classList.remove('btn-clicked'), 200);

    // Update state
    await handleChipsChange(chipsId, chipsQuantity);

    console.log(`🥔 Chips counter updated: ${chipsQuantity}`);
  });
}

/**
 * Initialize cold sides handlers
 */
function initColdSidesHandlers() {
  const subsection = document.querySelector('.cold-sides-subsection');
  if (!subsection) return;

  // Size selector handlers (compact)
  subsection.querySelectorAll('.size-selector-compact').forEach(select => {
    select.addEventListener('change', async (e) => {
      const sideId = e.target.dataset.sideId;
      const newSize = e.target.value;
      await handleSizeChange(sideId, newSize, 'coldSides');
      console.log(`🥗 Cold side size changed: ${sideId} = ${newSize}`);
    });
  });

  // Size variant radio handlers (large cards)
  subsection.querySelectorAll('.size-variant-option input[type="radio"]').forEach(radio => {
    radio.addEventListener('change', async (e) => {
      const sideId = e.target.dataset.sideId;
      const newSize = e.target.value;
      await handleSizeChange(sideId, newSize, 'coldSides');
      console.log(`🥗 Cold side size changed: ${sideId} = ${newSize}`);
    });
  });

  // Counter handlers
  subsection.addEventListener('click', async (e) => {
    const btn = e.target.closest('.counter-btn[data-side-id]');
    if (!btn) return;

    const sideId = btn.dataset.sideId;
    const isPlus = btn.classList.contains('counter-plus');
    await handleCounterChange(sideId, isPlus, 'coldSides');
  });
}

/**
 * Initialize salads handlers
 */
function initSaladsHandlers() {
  const subsection = document.querySelector('.salads-subsection');
  if (!subsection) return;

  // Size selector handlers (compact)
  subsection.querySelectorAll('.size-selector-compact').forEach(select => {
    select.addEventListener('change', async (e) => {
      const saladId = e.target.dataset.saladId;
      const newSize = e.target.value;
      await handleSizeChange(saladId, newSize, 'salads');
      console.log(`🥗 Salad size changed: ${saladId} = ${newSize}`);
    });
  });

  // Size variant radio handlers (large cards)
  subsection.querySelectorAll('.size-variant-option input[type="radio"]').forEach(radio => {
    radio.addEventListener('change', async (e) => {
      const saladId = e.target.dataset.saladId;
      const newSize = e.target.value;
      await handleSizeChange(saladId, newSize, 'salads');
      console.log(`🥗 Salad size changed: ${saladId} = ${newSize}`);
    });
  });

  // Counter handlers
  subsection.addEventListener('click', async (e) => {
    const btn = e.target.closest('.counter-btn[data-salad-id]');
    if (!btn) return;

    const saladId = btn.dataset.saladId;
    const isPlus = btn.classList.contains('counter-plus');
    await handleCounterChange(saladId, isPlus, 'salads');
  });
}

/**
 * Handle chips quantity change
 */
async function handleChipsChange(chipsId, quantity) {
  const state = getState();

  updateState('currentConfig', {
    ...state.currentConfig,
    sides: {
      ...state.currentConfig?.sides,
      chips: quantity > 0 ? {
        id: chipsId,
        quantity: quantity,
        totalBags: quantity * 5
      } : null
    }
  });

  const updatedState = getState();
  recalculatePricing(updatedState);
}

/**
 * Handle size change for cold sides or salads
 */
async function handleSizeChange(itemId, newSize, type) {
  const state = getState();
  const items = state.currentConfig?.sides?.[type] || [];

  const updatedItems = items.map(item =>
    item.id === itemId ? { ...item, size: newSize } : item
  );

  updateState('currentConfig', {
    ...state.currentConfig,
    sides: {
      ...state.currentConfig?.sides,
      [type]: updatedItems
    }
  });

  const updatedState = getState();
  recalculatePricing(updatedState);
}

/**
 * Handle counter change for cold sides or salads
 */
async function handleCounterChange(itemId, isPlus, type) {
  const displays = document.querySelectorAll(`.counter-display[data-${type === 'coldSides' ? 'side' : 'salad'}-id="${itemId}"]`);
  const minusButtons = document.querySelectorAll(`.counter-minus[data-${type === 'coldSides' ? 'side' : 'salad'}-id="${itemId}"]`);

  if (displays.length === 0) return;

  let currentQty = parseInt(displays[0].textContent) || 0;

  // Update quantity
  if (isPlus) {
    currentQty++;
  } else {
    currentQty = Math.max(0, currentQty - 1);
  }

  // Update displays
  displays.forEach(display => {
    display.textContent = currentQty;
  });

  // Update minus button states
  minusButtons.forEach(btn => {
    btn.disabled = currentQty === 0;
  });

  // Update state
  const state = getState();
  const items = state.currentConfig?.sides?.[type] || [];

  let updatedItems;
  if (currentQty === 0) {
    // Remove item
    updatedItems = items.filter(item => item.id !== itemId);
  } else {
    // Update or add item
    const existingIndex = items.findIndex(item => item.id === itemId);
    if (existingIndex >= 0) {
      updatedItems = [...items];
      updatedItems[existingIndex] = { ...updatedItems[existingIndex], quantity: currentQty };
    } else {
      // Get size from selector
      const sizeSelector = document.querySelector(`.size-selector-compact[data-${type === 'coldSides' ? 'side' : 'salad'}-id="${itemId}"]`);
      const radioChecked = document.querySelector(`input[type="radio"][data-${type === 'coldSides' ? 'side' : 'salad'}-id="${itemId}"]:checked`);
      const size = sizeSelector?.value || radioChecked?.value || null;

      // Get pricing and display info from transformer
      const itemType = type === 'coldSides' ? 'coldSide' : 'salad';
      const pricing = packageTransformer.getPriceForVariant(itemId, size, itemType);
      const unitPrice = pricing?.basePrice || 0;
      const displayName = pricing?.name || itemId;
      const servings = pricing?.servings || 0;

      updatedItems = [...items, {
        id: itemId,
        size: size,
        quantity: currentQty,
        includedQuantity: 0, // New items are not included
        unitPrice,
        displayName,
        servings
      }];
    }
  }

  updateState('currentConfig', {
    ...state.currentConfig,
    sides: {
      ...state.currentConfig?.sides,
      [type]: updatedItems
    }
  });

  const updatedState = getState();
  recalculatePricing(updatedState);

  console.log(`🥗 ${type} counter updated: ${itemId} = ${currentQty}`);
}

/**
 * Fetch chips from Firebase
 */
async function fetchChips() {
  try {
    const docRef = doc(db, 'menuItems', 'miss_vickies_chips');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error fetching chips from Firebase:', error);
    return null;
  }
}

/**
 * Fetch cold sides from Firebase
 */
async function fetchColdSides() {
  try {
    const q = query(
      collection(db, 'coldSides'),
      where('active', '==', true),
      orderBy('sortOrder', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching cold sides from Firebase:', error);
    return [];
  }
}

/**
 * Fetch fresh salads from Firebase
 */
async function fetchFreshSalads() {
  try {
    const q = query(
      collection(db, 'freshSalads'),
      where('active', '==', true),
      orderBy('sortOrder', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching fresh salads from Firebase:', error);
    return [];
  }
}
