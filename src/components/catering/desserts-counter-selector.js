/**
 * Desserts Counter Selector - SP-011
 * Counter-based dessert selector for shared platters customization
 *
 * Features:
 * - +/- counters for each dessert type (five-pack quantities)
 * - Package inclusion display (e.g., "2 five-packs included")
 * - Skip Desserts toggle with credit calculation
 * - Real-time totals (five-packs and individual items)
 * - Direct pricing integration (no distribution step)
 * - Supports both individual and 5-pack variants
 *
 * Created: 2025-11-07
 * Story: SP-011 (3 points)
 */

import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase-config.js';
import { getState, updateState } from '../../services/shared-platter-state-service.js';
import { recalculatePricing } from '../../utils/pricing-aggregator.js';

/**
 * Render desserts counter selector
 * @param {Object} options - Configuration options
 * @param {Object} options.packageIncluded - Package inclusion info {quantity: 2, unit: 'five-pack'}
 * @param {Array} options.preSelected - Pre-selected dessert quantities [{id, name, quantity, variantId, basePrice}]
 * @param {Boolean} options.skipDesserts - Whether desserts are skipped
 * @param {Function} options.onCounterChange - Callback when counters change
 * @returns {Promise<string>} HTML markup
 */
export async function renderDessertsCounterSelector(options = {}) {
  const {
    packageIncluded = { quantity: 0, unit: 'five-pack' },
    preSelected = [],
    skipDesserts = false,
    onCounterChange = null
  } = options;

  const desserts = await fetchDesserts();

  // Calculate credit for skipping desserts
  const skipCredit = calculateSkipCredit(packageIncluded, desserts);

  // Calculate current totals
  const totalFivePacks = preSelected.reduce((sum, dessert) => sum + (dessert.quantity || 0), 0);
  const totalItems = totalFivePacks * 5;

  return `
    <div class="desserts-counter-selector" data-skip-desserts="${skipDesserts}">
      <!-- Section Header -->
      <div class="desserts-section-header">
        <h3 class="section-title">🍰 Desserts</h3>
        ${packageIncluded.quantity > 0 ? `
          <p class="included-note">
            ${packageIncluded.quantity} five-pack${packageIncluded.quantity > 1 ? 's' : ''} included
            <span class="items-note">(${packageIncluded.quantity * 5} individual desserts)</span>
          </p>
        ` : `
          <p class="included-note">
            <span class="optional-badge">Optional Add-On</span>
          </p>
        `}
      </div>

      ${packageIncluded.quantity > 0 ? `
        <!-- Skip Desserts Option -->
        <div class="skip-desserts-option">
          <label class="skip-desserts-label">
            <input
              type="checkbox"
              id="skip-desserts-toggle"
              class="skip-desserts-checkbox"
              ${skipDesserts ? 'checked' : ''}
              aria-label="Skip all desserts">
            <span class="skip-desserts-text">
              Skip Desserts
              ${skipCredit > 0 ? `<span class="credit-amount">(credit -$${skipCredit.toFixed(2)})</span>` : ''}
            </span>
          </label>
          <p class="skip-desserts-description">Remove all desserts from your order and receive a credit</p>
        </div>
      ` : ''}

      <!-- Desserts Grid (hidden when skipped) - Compact 3-column layout -->
      <div class="desserts-compact-grid" id="desserts-grid" ${skipDesserts ? 'style="display: none;"' : ''}>
        ${desserts.map(dessert => renderDessertCard(dessert, preSelected.find(p => p.id === dessert.id)?.quantity || 0)).join('')}
      </div>

      <!-- Totals Display (hidden when skipped) -->
      <div class="desserts-totals" id="desserts-totals" ${skipDesserts ? 'style="display: none;"' : ''}>
        <div class="totals-content">
          <span class="totals-label">Total:</span>
          <span class="totals-value">
            <span id="desserts-total-fivepacks">${totalFivePacks}</span> five-pack${totalFivePacks !== 1 ? 's' : ''}
            <span class="totals-items">(<span id="desserts-total-items">${totalItems}</span> individual desserts)</span>
          </span>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render individual dessert card with counter (Compact Grid - Option 2)
 */
function renderDessertCard(dessert, currentQuantity = 0) {
  // Get 5-pack variant for pricing display
  const fivePackVariant = dessert.variants?.find(v =>
    v.size === '5-pack' || v.unit === '5-pack' || v.servings === 5
  );

  const basePrice = fivePackVariant?.basePrice || 0;
  const servings = fivePackVariant?.servings || 5;
  const allergens = dessert.allergens || [];

  return `
    <div class="dessert-card-compact" data-dessert-id="${dessert.id}">
      <!-- Dessert Image with 3:2 aspect ratio -->
      <div class="dessert-card-compact-image">
        <img
          src="${dessert.imageUrl || getPlaceholderImage(dessert)}"
          alt="${dessert.name}"
          loading="lazy"
          class="dessert-compact-img">

        <!-- Servings badge overlaid on image -->
        <span class="dessert-servings-badge">${servings} servings</span>

        ${allergens.length > 0 ? `
          <div class="allergen-badges-compact">
            ${allergens.slice(0, 2).map(allergen => `
              <span class="allergen-badge-compact" title="${allergen}">${getAllergenIcon(allergen)}</span>
            `).join('')}
          </div>
        ` : ''}
      </div>

      <!-- Dessert Info - Compact centered layout -->
      <div class="dessert-card-compact-body">
        <h5 class="dessert-compact-name" title="${dessert.name}">${dessert.name}</h5>
        <p class="dessert-compact-price">$${basePrice.toFixed(2)}</p>

        <!-- Counter Controls - Centered -->
        <div class="dessert-compact-counter">
          <button
            type="button"
            class="counter-btn counter-minus"
            data-dessert-id="${dessert.id}"
            aria-label="Decrease ${dessert.name} quantity"
            ${currentQuantity === 0 ? 'disabled' : ''}>
            −
          </button>
          <span class="counter-display" data-dessert-id="${dessert.id}">${currentQuantity}</span>
          <button
            type="button"
            class="counter-btn counter-plus"
            data-dessert-id="${dessert.id}"
            aria-label="Increase ${dessert.name} quantity">
            +
          </button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Initialize desserts counter selector interactions
 */
export function initDessertsCounterSelector(packageIncluded, onCounterChange) {
  const container = document.querySelector('.desserts-counter-selector');
  if (!container) {
    console.warn('Desserts counter selector container not found');
    return;
  }

  // Initialize state from existing quantities
  let dessertQuantities = {};
  document.querySelectorAll('.dessert-card-compact .counter-display').forEach(display => {
    const dessertId = display.dataset.dessertId;
    const quantity = parseInt(display.textContent) || 0;
    if (quantity > 0) {
      dessertQuantities[dessertId] = quantity;
    }
  });

  let skipDesserts = container.dataset.skipDesserts === 'true';

  // Skip Desserts toggle handler
  const skipToggle = document.getElementById('skip-desserts-toggle');
  if (skipToggle) {
    skipToggle.addEventListener('change', (e) => {
      skipDesserts = e.target.checked;
      container.dataset.skipDesserts = skipDesserts;

      // Show/hide desserts grid and totals
      const grid = document.getElementById('desserts-grid');
      const totals = document.getElementById('desserts-totals');

      if (grid) grid.style.display = skipDesserts ? 'none' : '';
      if (totals) totals.style.display = skipDesserts ? 'none' : '';

      // Trigger state update
      handleCounterChange(dessertQuantities, skipDesserts, onCounterChange);

      console.log(`🍰 Skip Desserts toggled: ${skipDesserts}`);
    });
  }

  // Counter button handlers (delegated)
  container.addEventListener('click', async (e) => {
    const btn = e.target.closest('.counter-btn');
    if (!btn) return;

    const dessertId = btn.dataset.dessertId;
    const isPlus = btn.classList.contains('counter-plus');
    const display = document.querySelector(`.counter-display[data-dessert-id="${dessertId}"]`);
    const minusBtn = document.querySelector(`.counter-minus[data-dessert-id="${dessertId}"]`);

    if (!display) return;

    let currentQty = parseInt(display.textContent) || 0;

    // Update quantity
    if (isPlus) {
      currentQty++;
    } else {
      currentQty = Math.max(0, currentQty - 1);
    }

    // Update display
    display.textContent = currentQty;

    // Update minus button state
    if (minusBtn) {
      minusBtn.disabled = currentQty === 0;
    }

    // Update quantities object
    if (currentQty > 0) {
      dessertQuantities[dessertId] = currentQty;
    } else {
      delete dessertQuantities[dessertId];
    }

    // Add button animation
    btn.classList.add('btn-clicked');
    setTimeout(() => btn.classList.remove('btn-clicked'), 200);

    // Update totals
    updateTotals(dessertQuantities);

    // Trigger state update
    await handleCounterChange(dessertQuantities, skipDesserts, onCounterChange);

    console.log(`🍰 Dessert counter updated: ${dessertId} = ${currentQty}`);
  });

  // Keyboard support for counters
  container.addEventListener('keydown', (e) => {
    if (e.target.classList.contains('counter-btn')) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        e.target.click();
      }
    }
  });

  console.log('✅ Desserts counter selector initialized');
}

/**
 * Update totals display
 */
function updateTotals(dessertQuantities) {
  const totalFivePacks = Object.values(dessertQuantities).reduce((sum, qty) => sum + qty, 0);
  const totalItems = totalFivePacks * 5;

  const fivePacksEl = document.getElementById('desserts-total-fivepacks');
  const itemsEl = document.getElementById('desserts-total-items');

  if (fivePacksEl) fivePacksEl.textContent = totalFivePacks;
  if (itemsEl) itemsEl.textContent = totalItems;
}

/**
 * Handle counter change - update state and trigger pricing
 */
async function handleCounterChange(dessertQuantities, skipDesserts, onCounterChange) {
  const state = getState();

  // Fetch dessert data to get names and pricing
  const desserts = await fetchDesserts();

  // Convert quantities object to array format expected by pricing
  const dessertArray = Object.entries(dessertQuantities).map(([dessertId, quantity]) => {
    const dessertData = desserts.find(d => d.id === dessertId);
    const fivePackVariant = dessertData?.variants?.find(v =>
      v.size === '5-pack' || v.unit === '5-pack' || v.servings === 5
    );

    return {
      id: dessertId,
      name: dessertData?.name || dessertId,
      quantity: quantity,
      variantId: fivePackVariant?.id || '5-pack',
      basePrice: fivePackVariant?.basePrice || 0,
      servings: fivePackVariant?.servings || 5
    };
  });

  // Update state
  updateState('currentConfig', {
    ...state.currentConfig,
    desserts: dessertArray,
    noDesserts: skipDesserts
  });

  // Trigger pricing recalculation with updated state
  const updatedState = getState();
  recalculatePricing(updatedState);

  // Callback
  if (onCounterChange) {
    onCounterChange(dessertArray, skipDesserts);
  }
}

/**
 * Calculate credit for skipping desserts
 */
function calculateSkipCredit(packageIncluded, desserts) {
  if (!packageIncluded || packageIncluded.quantity === 0) {
    return 0;
  }

  // Average price per five-pack based on available desserts
  // Use actual pricing from desserts data
  if (!desserts || desserts.length === 0) {
    return 0;
  }

  const totalPrice = desserts.reduce((sum, dessert) => {
    const fivePackVariant = dessert.variants?.find(v =>
      v.size === '5-pack' || v.unit === '5-pack' || v.servings === 5
    );
    return sum + (fivePackVariant?.basePrice || 0);
  }, 0);

  const averagePricePerFivePack = totalPrice / desserts.length;
  return packageIncluded.quantity * averagePricePerFivePack;
}

/**
 * Get allergen icon
 */
function getAllergenIcon(allergen) {
  const icons = {
    'gluten': '🌾',
    'dairy': '🥛',
    'eggs': '🥚',
    'nuts': '🥜',
    'soy': '🫘'
  };
  return icons[allergen.toLowerCase()] || '⚠️';
}

/**
 * Get placeholder image for dessert
 */
function getPlaceholderImage(dessert) {
  return `https://placehold.co/300x200/fff5f0/ff6b35?text=${encodeURIComponent(dessert.name)}`;
}

/**
 * Fetch active desserts from Firebase
 *
 * BUG FIX (2025-11-09): Fetch from 'desserts' collection (source of truth).
 * The variants array contains basePrice data that was not being accessed correctly.
 * Now uses same approach as package-data-transformer.js
 */
async function fetchDesserts() {
  try {
    const q = query(
      collection(db, 'desserts'),
      where('active', '==', true)
      // Note: orderBy removed to avoid potential composite index requirement
      // Sorting done in JavaScript instead
    );
    const snapshot = await getDocs(q);
    const desserts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Sort by sortOrder in JavaScript
    return desserts.sort((a, b) => (a.sortOrder || 999) - (b.sortOrder || 999));
  } catch (error) {
    console.error('Error fetching desserts from Firebase:', error);
    return [];
  }
}
