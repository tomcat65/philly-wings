/**
 * Dip Photo Card Selector - SP-009
 * Interactive multi-select dip selector for catering customization
 *
 * Features:
 * - Photo-based browsing with visual dip container images
 * - Multi-select with max selections enforcement
 * - Smart defaults pre-selected
 * - Selection cart at top showing chosen dips
 * - Live pricing integration
 *
 * Created: 2025-10-30 (Dips separation from sauces)
 */

import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../firebase-config.js';
import { getState, updateState } from '../../services/shared-platter-state-service.js';

/**
 * Render enhanced dip photo card selector
 * @param {Object} options - Configuration options
 * @param {number} options.maxSelections - Maximum dips allowed
 * @param {Array} options.preSelectedIds - Smart defaults (dip IDs)
 * @param {Function} options.onSelectionChange - Callback when selection changes
 * @returns {Promise<string>} HTML markup
 */
export async function renderDipPhotoCardSelector(options = {}) {
  const {
    maxSelections = 3,
    preSelectedIds = [],
    onSelectionChange = null
  } = options;

  const dips = await fetchDips();

  return `
    <div class="sauce-photo-selector">
      <!-- Selection Cart at Top -->
      <div class="sauce-selection-cart">
        <div class="cart-header">
          <h4 class="cart-title">🥣 Your Dip Selection</h4>
          <div class="cart-counter">
            <span class="counter-current" id="sauce-counter-current">${preSelectedIds.length}</span>
            <span class="counter-separator">/</span>
            <span class="counter-max">${maxSelections}</span>
          </div>
        </div>

        <div class="cart-items" id="sauce-cart-items">
          ${preSelectedIds.length > 0
            ? renderCartItems(dips.filter(d => preSelectedIds.includes(d.id)))
            : '<p class="cart-empty">Select up to ${maxSelections} dips from below</p>'
          }
        </div>

        <div class="cart-tips">
          <p class="tip-text">
            <span class="tip-icon">💡</span>
            <span>Pro Tip: Ranch and Blue Cheese are crowd favorites!</span>
          </p>
        </div>
      </div>

      <!-- Dip Cards Grid (no heat filter needed for dips) -->
      <div class="sauce-cards-grid" id="sauce-cards-grid">
        ${dips.map(dip => renderDipPhotoCard(dip, preSelectedIds.includes(dip.id))).join('')}
      </div>

      <!-- Continue Button (appears when selections made) -->
      <div class="sauce-selector-actions" id="sauce-selector-actions" style="${preSelectedIds.length > 0 ? '' : 'display: none;'}">
        <button
          type="button"
          class="btn-continue-sauces"
          id="btn-continue-sauces"
          aria-label="Continue to sauce distribution">
          Continue to Distribution →
        </button>
      </div>

      <!-- Distribution Review Container (hidden initially) -->
      <div class="sauce-distribution-container" id="sauce-distribution-container" style="display: none;">
        <!-- Will be populated with renderSauceDistributionReview -->
      </div>
    </div>
  `;
}

/**
 * Render individual dip photo card
 */
function renderDipPhotoCard(dip, isSelected) {
  const socialProof = getSocialProofBadge(dip);

  return `
    <div
      class="sauce-photo-card ${isSelected ? 'card-selected' : ''}"
      data-sauce-id="${dip.id}"
      role="checkbox"
      aria-checked="${isSelected}"
      tabindex="0">

      <div class="sauce-card-image">
        <img
          src="${dip.imageUrl || getPlaceholderImage(dip)}"
          alt="${dip.name}"
          loading="lazy"
          class="sauce-img">

        <div class="sauce-selected-overlay">
          <span class="selected-check">✓</span>
        </div>

        ${socialProof ? `
          <span class="sauce-social-badge">${socialProof}</span>
        ` : ''}
      </div>

      <div class="sauce-card-content">
        <h5 class="sauce-card-name">${dip.name}</h5>
        <p class="sauce-card-description">${dip.description || ''}</p>
        <p class="sauce-card-description"><strong>1.5oz serving</strong></p>

        ${dip.story ? `
          <p class="sauce-card-story">${truncateStory(dip.story)}</p>
        ` : ''}
      </div>
    </div>
  `;
}

/**
 * Render cart items (selected dips)
 */
function renderCartItems(selectedDips) {
  return `
    <div class="cart-items-list">
      ${selectedDips.map(dip => {
        return `
          <div class="cart-item" data-sauce-id="${dip.id}">
            <span class="cart-item-icon">🥣</span>
            <span class="cart-item-name">${dip.name}</span>
            <button
              type="button"
              class="cart-item-remove"
              data-sauce-id="${dip.id}"
              aria-label="Remove ${dip.name}">
              ×
            </button>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

/**
 * Initialize dip photo card selector interactions
 */
export function initDipPhotoCardSelector(maxSelections, onSelectionChange) {
  const grid = document.getElementById('sauce-cards-grid');
  if (!grid) return;

  let selectedSauceIds = [];

  // Initialize from pre-selected cards
  document.querySelectorAll('.sauce-photo-card.card-selected').forEach(card => {
    selectedSauceIds.push(card.dataset.sauceId);
  });

  // Card click handlers
  document.querySelectorAll('.sauce-photo-card').forEach(card => {
    // Click event
    card.addEventListener('click', () => {
      handleSauceCardClick(card, maxSelections, selectedSauceIds, onSelectionChange);
    });

    // Keyboard event
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleSauceCardClick(card, maxSelections, selectedSauceIds, onSelectionChange);
      }
    });
  });

  // No heat filter for dips - removed

  // Cart remove button handlers (delegated)
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('cart-item-remove')) {
      const sauceId = e.target.dataset.sauceId;
      const card = document.querySelector(`.sauce-photo-card[data-sauce-id="${sauceId}"]`);
      if (card) {
        handleSauceCardClick(card, maxSelections, selectedSauceIds, onSelectionChange);
      }
    }
  });

  // Continue to distribution button
  const continueBtn = document.getElementById('btn-continue-sauces');
  if (continueBtn) {
    continueBtn.addEventListener('click', async () => {
      await showSauceDistribution(selectedSauceIds);
    });
  }
}

/**
 * Show sauce distribution review screen
 */
async function showSauceDistribution(selectedSauceIds) {
  // Hide sauce selector
  const selectorGrid = document.getElementById('sauce-cards-grid');
  const selectorActions = document.getElementById('sauce-selector-actions');
  const selectorCart = document.querySelector('.sauce-selection-cart');
  const selectorFilter = document.querySelector('.sauce-heat-filter');

  if (selectorGrid) selectorGrid.style.display = 'none';
  if (selectorActions) selectorActions.style.display = 'none';
  if (selectorCart) selectorCart.style.display = 'none';
  if (selectorFilter) selectorFilter.style.display = 'none';

  // Get selected sauce objects
  const sauces = await fetchSauces();
  const selectedSauces = sauces.filter(s => selectedSauceIds.includes(s.id));

  // Render distribution review
  const distributionContainer = document.getElementById('sauce-distribution-container');
  if (distributionContainer) {
    distributionContainer.innerHTML = renderSauceDistributionReview(selectedSauces);
    distributionContainer.style.display = 'block';

    // Initialize distribution review interactions
    initSauceDistributionReview(selectedSauces);
  }

  console.log('🌶️ Showing sauce distribution review for', selectedSauces.length, 'sauces');
}

/**
 * Handle sauce card click/selection
 */
async function handleSauceCardClick(card, maxSelections, selectedSauceIds, onSelectionChange) {
  const sauceId = card.dataset.sauceId;
  const isSelected = card.classList.contains('card-selected');

  if (isSelected) {
    // Deselect
    card.classList.remove('card-selected');
    card.setAttribute('aria-checked', 'false');

    const index = selectedSauceIds.indexOf(sauceId);
    if (index > -1) {
      selectedSauceIds.splice(index, 1);
    }
  } else {
    // Check max selections
    if (selectedSauceIds.length >= maxSelections) {
      showMaxSelectionMessage(maxSelections);
      return;
    }

    // Select
    card.classList.add('card-selected');
    card.setAttribute('aria-checked', 'true');
    selectedSauceIds.push(sauceId);
  }

  // Pulse animation
  card.classList.add('card-clicked');
  setTimeout(() => card.classList.remove('card-clicked'), 300);

  // Update cart display
  await updateCartDisplay(selectedSauceIds);

  // Update counter
  updateSelectionCounter(selectedSauceIds.length, maxSelections);

  // Show/hide continue button
  const selectorActions = document.getElementById('sauce-selector-actions');
  if (selectorActions) {
    selectorActions.style.display = selectedSauceIds.length > 0 ? 'block' : 'none';
  }

  // Callback
  if (onSelectionChange) {
    onSelectionChange(selectedSauceIds);
  }

  // Update state
  updateState('currentConfig', {
    ...getState().currentConfig,
    sauces: selectedSauceIds,
    saucesSource: 'manual'
  });
}

/**
 * Update cart display with selected sauces
 */
async function updateCartDisplay(selectedSauceIds) {
  const cartContainer = document.getElementById('sauce-cart-items');
  if (!cartContainer) return;

  if (selectedSauceIds.length === 0) {
    cartContainer.innerHTML = '<p class="cart-empty">Select sauces from below</p>';
    return;
  }

  // Fetch sauce data
  const sauces = await fetchSauces();
  const selectedSauces = sauces.filter(s => selectedSauceIds.includes(s.id));

  cartContainer.innerHTML = renderCartItems(selectedSauces);
}

/**
 * Update selection counter
 */
function updateSelectionCounter(current, max) {
  const counterEl = document.getElementById('sauce-counter-current');
  if (!counterEl) return;

  counterEl.textContent = current;

  const cartEl = document.querySelector('.sauce-selection-cart');
  if (cartEl) {
    cartEl.classList.toggle('cart-complete', current === max);
    cartEl.classList.toggle('cart-over-limit', current > max);
  }
}

/**
 * Show max selection validation message
 */
function showMaxSelectionMessage(maxSelections) {
  const cart = document.querySelector('.sauce-selection-cart');
  if (!cart) return;

  // Remove existing message
  const existing = cart.querySelector('.cart-validation');
  if (existing) existing.remove();

  // Add validation message
  const validationEl = document.createElement('div');
  validationEl.className = 'cart-validation';
  validationEl.setAttribute('role', 'alert');
  validationEl.innerHTML = `
    <span class="validation-icon">⚠️</span>
    <span>Maximum ${maxSelections} sauces selected. Remove one to add another.</span>
  `;

  cart.appendChild(validationEl);

  // Shake animation
  cart.classList.add('cart-shake');
  setTimeout(() => cart.classList.remove('cart-shake'), 500);

  // Auto-remove after 3 seconds
  setTimeout(() => validationEl.remove(), 3000);
}

// Heat level functions removed - not applicable to dips

/**
 * Get social proof badge if applicable
 */
function getSocialProofBadge(dip) {
  // These would come from analytics/popularity data
  const popularDips = ['ranch', 'blue-cheese', 'honey-mustard'];

  if (popularDips.includes(dip.id)) {
    return '⭐ Popular';
  }

  return null;
}

/**
 * Truncate story for card display
 */
function truncateStory(story, maxLength = 60) {
  if (!story || story.length <= maxLength) return story;
  return story.substring(0, maxLength) + '...';
}

/**
 * Get placeholder image for dip
 */
function getPlaceholderImage(dip) {
  // Use neutral color for dip placeholder
  return `https://placehold.co/300x200/e3f2fd/1976d2?text=${encodeURIComponent(dip.name)}`;
}

/**
 * Fetch active sauces from Firebase
 */
async function fetchDips() {
  try {
    const q = query(
      collection(db, 'sauces'),
      where('active', '==', true),
      where('category', '==', 'dipping-sauce'),
      orderBy('sortOrder', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching dips from Firebase:', error);
    return [];
  }
}
