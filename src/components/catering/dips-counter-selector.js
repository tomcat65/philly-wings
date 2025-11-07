/**
 * Dips Counter Selector - SP-009
 * Counter-based dip selector for shared platters customization
 *
 * Features:
 * - +/- counters for each dip type (five-pack quantities)
 * - Package inclusion display (e.g., "3 five-packs included")
 * - Skip Dips toggle with credit calculation
 * - Real-time totals (five-packs and individual containers)
 * - Direct pricing integration (no distribution step)
 *
 * Created: 2025-11-05
 * Story: SP-009 (3 points)
 */

import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../firebase-config.js';
import { getState, updateState } from '../../services/shared-platter-state-service.js';
import { recalculatePricing } from '../../utils/pricing-aggregator.js';

/**
 * Render dips counter selector
 * @param {Object} options - Configuration options
 * @param {Object} options.packageIncluded - Package inclusion info {quantity: 3, unit: 'five-pack'}
 * @param {Array} options.preSelected - Pre-selected dip quantities [{id, name, quantity}]
 * @param {Boolean} options.skipDips - Whether dips are skipped
 * @param {Function} options.onCounterChange - Callback when counters change
 * @returns {Promise<string>} HTML markup
 */
export async function renderDipsCounterSelector(options = {}) {
  const {
    packageIncluded = { quantity: 3, unit: 'five-pack' },
    preSelected = [],
    skipDips = false,
    onCounterChange = null
  } = options;

  const dips = await fetchDips();

  // Calculate credit for skipping dips
  const skipCredit = calculateSkipCredit(packageIncluded);

  // Calculate current totals
  const totalFivePacks = preSelected.reduce((sum, dip) => sum + (dip.quantity || 0), 0);
  const totalContainers = totalFivePacks * 5;

  return `
    <div class="dips-counter-selector" data-skip-dips="${skipDips}">
      <!-- Section Header -->
      <div class="dips-section-header">
        <h3 class="section-title">🥣 Dips</h3>
        <p class="included-note">
          ${packageIncluded.quantity} five-packs included
          <span class="containers-note">(${packageIncluded.quantity * 5} containers)</span>
        </p>
      </div>

      <!-- Skip Dips Option -->
      <div class="skip-dips-option">
        <label class="skip-dips-label">
          <input
            type="checkbox"
            id="skip-dips-toggle"
            class="skip-dips-checkbox"
            ${skipDips ? 'checked' : ''}
            aria-label="Skip all dips">
          <span class="skip-dips-text">
            Skip Dips
            ${skipCredit > 0 ? `<span class="credit-amount">(credit -$${skipCredit.toFixed(2)})</span>` : ''}
          </span>
        </label>
        <p class="skip-dips-description">Remove all dips from your order and receive a credit</p>
      </div>

      <!-- Dips Grid (hidden when skipped) -->
      <div class="dips-grid" id="dips-grid" ${skipDips ? 'style="display: none;"' : ''}>
        ${dips.map(dip => renderDipCard(dip, preSelected.find(p => p.id === dip.id)?.quantity || 0)).join('')}
      </div>

      <!-- Totals Display (hidden when skipped) -->
      <div class="dips-totals" id="dips-totals" ${skipDips ? 'style="display: none;"' : ''}>
        <div class="totals-content">
          <span class="totals-label">Total:</span>
          <span class="totals-value">
            <span id="dips-total-fivepacks">${totalFivePacks}</span> five-packs
            <span class="totals-containers">(<span id="dips-total-containers">${totalContainers}</span> containers)</span>
          </span>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render individual dip card with counter
 */
function renderDipCard(dip, currentQuantity = 0) {
  const socialProof = getSocialProofBadge(dip);

  return `
    <div class="dip-card" data-dip-id="${dip.id}">
      <!-- Dip Image -->
      <div class="dip-card-image">
        <img
          src="${dip.imageUrl || getPlaceholderImage(dip)}"
          alt="${dip.name}"
          loading="lazy"
          class="dip-img">

        ${socialProof ? `
          <span class="dip-social-badge">${socialProof}</span>
        ` : ''}
      </div>

      <!-- Dip Info -->
      <div class="dip-card-content">
        <h5 class="dip-card-name">${dip.name}</h5>
        <p class="dip-card-description">${dip.description || ''}</p>
        <p class="dip-card-size">1.5oz serving</p>
      </div>

      <!-- Counter Controls -->
      <div class="dip-counter-controls">
        <button
          type="button"
          class="counter-btn counter-minus"
          data-dip-id="${dip.id}"
          aria-label="Decrease ${dip.name} quantity"
          ${currentQuantity === 0 ? 'disabled' : ''}>
          −
        </button>
        <span class="counter-display" data-dip-id="${dip.id}">${currentQuantity}</span>
        <button
          type="button"
          class="counter-btn counter-plus"
          data-dip-id="${dip.id}"
          aria-label="Increase ${dip.name} quantity">
          +
        </button>
      </div>

      <!-- Five-pack Label -->
      <p class="dip-unit-label">five-packs</p>
    </div>
  `;
}

/**
 * Initialize dips counter selector interactions
 */
export function initDipsCounterSelector(packageIncluded, onCounterChange) {
  const container = document.querySelector('.dips-counter-selector');
  if (!container) {
    console.warn('Dips counter selector container not found');
    return;
  }

  // Initialize state from existing quantities
  let dipQuantities = {};
  document.querySelectorAll('.counter-display').forEach(display => {
    const dipId = display.dataset.dipId;
    const quantity = parseInt(display.textContent) || 0;
    if (quantity > 0) {
      dipQuantities[dipId] = quantity;
    }
  });

  let skipDips = container.dataset.skipDips === 'true';

  // Skip Dips toggle handler
  const skipToggle = document.getElementById('skip-dips-toggle');
  if (skipToggle) {
    skipToggle.addEventListener('change', (e) => {
      skipDips = e.target.checked;
      container.dataset.skipDips = skipDips;

      // Show/hide dips grid and totals
      const grid = document.getElementById('dips-grid');
      const totals = document.getElementById('dips-totals');

      if (grid) grid.style.display = skipDips ? 'none' : '';
      if (totals) totals.style.display = skipDips ? 'none' : '';

      // Trigger state update
      handleCounterChange(dipQuantities, skipDips, onCounterChange);

      console.log(`🥣 Skip Dips toggled: ${skipDips}`);
    });
  }

  // Counter button handlers (delegated)
  container.addEventListener('click', async (e) => {
    const btn = e.target.closest('.counter-btn');
    if (!btn) return;

    const dipId = btn.dataset.dipId;
    const isPlus = btn.classList.contains('counter-plus');
    const display = document.querySelector(`.counter-display[data-dip-id="${dipId}"]`);
    const minusBtn = document.querySelector(`.counter-minus[data-dip-id="${dipId}"]`);

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
      dipQuantities[dipId] = currentQty;
    } else {
      delete dipQuantities[dipId];
    }

    // Add button animation
    btn.classList.add('btn-clicked');
    setTimeout(() => btn.classList.remove('btn-clicked'), 200);

    // Update totals
    updateTotals(dipQuantities);

    // Trigger state update
    await handleCounterChange(dipQuantities, skipDips, onCounterChange);

    console.log(`🥣 Dip counter updated: ${dipId} = ${currentQty}`);
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

  console.log('✅ Dips counter selector initialized');
}

/**
 * Update totals display
 */
function updateTotals(dipQuantities) {
  const totalFivePacks = Object.values(dipQuantities).reduce((sum, qty) => sum + qty, 0);
  const totalContainers = totalFivePacks * 5;

  const fivePacksEl = document.getElementById('dips-total-fivepacks');
  const containersEl = document.getElementById('dips-total-containers');

  if (fivePacksEl) fivePacksEl.textContent = totalFivePacks;
  if (containersEl) containersEl.textContent = totalContainers;
}

/**
 * Handle counter change - update state and trigger pricing
 */
async function handleCounterChange(dipQuantities, skipDips, onCounterChange) {
  const state = getState();

  // Fetch dip data to get names
  const dips = await fetchDips();

  // Convert quantities object to array format expected by pricing
  const dipArray = Object.entries(dipQuantities).map(([dipId, quantity]) => {
    const dipData = dips.find(d => d.id === dipId);
    return {
      id: dipId,
      name: dipData?.name || dipId,
      quantity: quantity
    };
  });

  // Update state
  updateState('currentConfig', {
    ...state.currentConfig,
    dips: dipArray,
    noDips: skipDips
  });

  // Trigger pricing recalculation with updated state
  const updatedState = getState();
  recalculatePricing(updatedState);

  // Callback
  if (onCounterChange) {
    onCounterChange(dipArray, skipDips);
  }
}

/**
 * Calculate credit for skipping dips
 */
function calculateSkipCredit(packageIncluded) {
  // Each dip container is $0.75 according to pricing-items-calculator.js
  const pricePerContainer = 0.75;
  const includedContainers = packageIncluded.quantity * 5; // 5 containers per five-pack
  return includedContainers * pricePerContainer;
}

/**
 * Get social proof badge if applicable
 */
function getSocialProofBadge(dip) {
  // Popular dips based on customer preferences
  const popularDips = ['ranch', 'blue-cheese', 'honey-mustard'];

  if (popularDips.includes(dip.id)) {
    return '⭐ Popular';
  }

  return null;
}

/**
 * Get placeholder image for dip
 */
function getPlaceholderImage(dip) {
  return `https://placehold.co/300x200/e3f2fd/1976d2?text=${encodeURIComponent(dip.name)}`;
}

/**
 * Fetch active dips from Firebase
 */
async function fetchDips() {
  try {
    const q = query(
      collection(db, 'sauces'),
      where('active', '==', true),
      where('category', '==', 'dipping-sauce')
      // Note: orderBy removed to avoid composite index requirement
      // Sorting done in JavaScript instead
    );
    const snapshot = await getDocs(q);
    const dips = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Sort by sortOrder in JavaScript
    return dips.sort((a, b) => (a.sortOrder || 999) - (b.sortOrder || 999));
  } catch (error) {
    console.error('Error fetching dips from Firebase:', error);
    return [];
  }
}
