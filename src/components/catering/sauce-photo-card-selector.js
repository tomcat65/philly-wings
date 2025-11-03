/**
 * Sauce Photo Card Selector - SP-008 Enhanced
 * Netflix-style interactive multi-select sauce selector for catering customization
 *
 * Features:
 * - Photo-based browsing with visual sauce cup images
 * - Multi-select with max selections enforcement
 * - Heat level filtering (All, Mild, Medium, Hot, Insane)
 * - Social proof badges (Popular, Hot Pick)
 * - Smart defaults pre-selected
 * - Selection cart at top showing chosen sauces
 * - Live pricing integration
 *
 * Created: 2025-10-27 (SP-008)
 */

import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../firebase-config.js';
import { getState, updateState } from '../../services/shared-platter-state-service.js';
import { renderSauceDistributionReview, initSauceDistributionReview } from './sauce-distribution-review.js';

/**
 * Render enhanced sauce photo card selector
 * @param {Object} options - Configuration options
 * @param {number} options.maxSelections - Maximum sauces allowed
 * @param {Array} options.preSelectedIds - Smart defaults (sauce IDs)
 * @param {Function} options.onSelectionChange - Callback when selection changes
 * @returns {Promise<string>} HTML markup
 */
export async function renderSaucePhotoCardSelector(options = {}) {
  const {
    maxSelections = 3,
    preSelectedIds = [],
    onSelectionChange = null
  } = options;

  const sauces = await fetchSauces();

  return `
    <div class="sauce-photo-selector">
      <!-- Selection Cart at Top -->
      <div class="sauce-selection-cart">
        <div class="cart-header">
          <h4 class="cart-title">🌶️ Your Sauce Selection</h4>
          <div class="cart-counter">
            <span class="counter-current" id="sauce-counter-current">${preSelectedIds.length}</span>
            <span class="counter-separator">/</span>
            <span class="counter-max">${maxSelections}</span>
          </div>
        </div>

        <div class="cart-items" id="sauce-cart-items">
          ${preSelectedIds.length > 0
            ? renderCartItems(sauces.filter(s => preSelectedIds.includes(s.id)))
            : '<p class="cart-empty">Select up to ${maxSelections} sauces from below</p>'
          }
        </div>

        <div class="cart-tips">
          <p class="tip-text">
            <span class="tip-icon">💡</span>
            <span>Pro Tip: Mix heat levels (mild, medium, hot) to satisfy everyone</span>
          </p>
        </div>
      </div>

      <!-- Heat Level Filter -->
      <div class="sauce-heat-filter">
        <button
          type="button"
          class="heat-filter-btn active"
          data-heat-filter="all"
          aria-pressed="true">
          All Sauces
        </button>
        <button
          type="button"
          class="heat-filter-btn"
          data-heat-filter="mild"
          aria-pressed="false">
          No Heat / Mild
        </button>
        <button
          type="button"
          class="heat-filter-btn"
          data-heat-filter="medium"
          aria-pressed="false">
          🌶️🌶️ Medium
        </button>
        <button
          type="button"
          class="heat-filter-btn"
          data-heat-filter="hot"
          aria-pressed="false">
          🌶️🌶️🌶️🌶️ Hot
        </button>
        <button
          type="button"
          class="heat-filter-btn"
          data-heat-filter="insane"
          aria-pressed="false">
          🌶️🌶️🌶️🌶️🌶️ Insane
        </button>
      </div>

      <!-- Sauce Cards Grid -->
      <div class="sauce-cards-grid" id="sauce-cards-grid">
        ${sauces.map(sauce => renderSaucePhotoCard(sauce, preSelectedIds.includes(sauce.id))).join('')}
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
 * Render individual sauce photo card
 */
function renderSaucePhotoCard(sauce, isSelected) {
  const heatLevel = getHeatLevel(sauce.heatLevel);
  const socialProof = getSocialProofBadge(sauce);

  return `
    <div
      class="sauce-photo-card ${isSelected ? 'card-selected' : ''}"
      data-sauce-id="${sauce.id}"
      data-heat-level="${sauce.heatLevel}"
      data-heat-category="${heatLevel.category}"
      role="checkbox"
      aria-checked="${isSelected}"
      tabindex="0">

      <div class="sauce-card-image">
        <img
          src="${sauce.imageUrl || getPlaceholderImage(sauce)}"
          alt="${sauce.name}"
          loading="lazy"
          class="sauce-img">

        <div class="sauce-selected-overlay">
          <span class="selected-check">✓</span>
        </div>

        ${socialProof ? `
          <span class="sauce-social-badge">${socialProof}</span>
        ` : ''}

        <span class="sauce-heat-badge">
          ${heatLevel.display}
        </span>
      </div>

      <div class="sauce-card-content">
        <h5 class="sauce-card-name">${sauce.name}</h5>
        <p class="sauce-card-description">${sauce.description || ''}</p>

        ${sauce.story ? `
          <p class="sauce-card-story">${truncateStory(sauce.story)}</p>
        ` : ''}
      </div>
    </div>
  `;
}

/**
 * Render cart items (selected sauces)
 */
function renderCartItems(selectedSauces) {
  return `
    <div class="cart-items-list">
      ${selectedSauces.map(sauce => {
        const heatLevel = getHeatLevel(sauce.heatLevel);
        const heatDisplay = heatLevel.chilis || '✓'; // Use checkmark for no-heat sauces
        return `
          <div class="cart-item" data-sauce-id="${sauce.id}">
            <span class="cart-item-icon">${heatDisplay}</span>
            <span class="cart-item-name">${sauce.name}</span>
            <button
              type="button"
              class="cart-item-remove"
              data-sauce-id="${sauce.id}"
              aria-label="Remove ${sauce.name}">
              ×
            </button>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

/**
 * Initialize sauce photo card selector interactions
 */
export function initSaucePhotoCardSelector(maxSelections, onSelectionChange) {
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

  // Heat filter handlers
  document.querySelectorAll('.heat-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      handleHeatFilter(btn);
    });
  });

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

  // Fetch full sauce objects for state (pricing needs name, type, etc.)
  const sauces = await fetchSauces();
  const selectedSauceObjects = sauces.filter(s => selectedSauceIds.includes(s.id));

  // Update state with full sauce objects (not just IDs)
  updateState('currentConfig', {
    ...getState().currentConfig,
    sauces: selectedSauceObjects,
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

/**
 * Handle heat level filter
 */
function handleHeatFilter(clickedBtn) {
  const filterValue = clickedBtn.dataset.heatFilter;

  // Update button states
  document.querySelectorAll('.heat-filter-btn').forEach(btn => {
    const isActive = btn === clickedBtn;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', isActive);
  });

  // Filter cards
  const cards = document.querySelectorAll('.sauce-photo-card');

  cards.forEach(card => {
    const heatCategory = card.dataset.heatCategory;

    if (filterValue === 'all') {
      card.style.display = 'block';
    } else {
      card.style.display = heatCategory === filterValue ? 'block' : 'none';
    }
  });
}

/**
 * Get heat level metadata using chili pepper system (consistent with boxed meals)
 */
function getHeatLevel(level) {
  const chilis = '🌶️'.repeat(Math.min(level, 5));

  const levels = {
    0: {
      label: 'No Heat',
      display: 'No Heat',
      chilis: '',
      category: 'mild'
    },
    1: {
      label: 'Mild',
      display: '🌶️ Mild',
      chilis: '🌶️',
      category: 'mild'
    },
    2: {
      label: 'Medium',
      display: '🌶️🌶️ Medium',
      chilis: '🌶️🌶️',
      category: 'medium'
    },
    3: {
      label: 'Medium Hot',
      display: '🌶️🌶️🌶️ Medium Hot',
      chilis: '🌶️🌶️🌶️',
      category: 'medium'
    },
    4: {
      label: 'Hot',
      display: '🌶️🌶️🌶️🌶️ Hot',
      chilis: '🌶️🌶️🌶️🌶️',
      category: 'hot'
    },
    5: {
      label: 'Insane',
      display: '🌶️🌶️🌶️🌶️🌶️ Insane',
      chilis: '🌶️🌶️🌶️🌶️🌶️',
      category: 'insane'
    }
  };

  return levels[level] || levels[0];
}

/**
 * Get social proof badge if applicable
 */
function getSocialProofBadge(sauce) {
  // These would come from analytics/popularity data
  const popularSauces = ['honey-bbq', 'philly-medium', 'lemon-pepper'];
  const hotPicks = ['south-street-hot', 'asian-zing'];

  if (popularSauces.includes(sauce.id)) {
    return '⭐ Popular';
  }
  if (hotPicks.includes(sauce.id)) {
    return '🔥 Hot Pick';
  }
  if (sauce.category === 'philly-signature') {
    return '🦅 Philly';
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
 * Get placeholder image for sauce
 */
function getPlaceholderImage(sauce) {
  // Use heat level category for placeholder color
  const heatLevel = getHeatLevel(sauce.heatLevel);

  const colorMap = {
    'mild': 'green',
    'medium': 'orange',
    'hot': 'red',
    'insane': 'purple'
  };

  const color = colorMap[heatLevel.category] || 'gray';

  return `https://placehold.co/300x200/${color}/white?text=${encodeURIComponent(sauce.name)}`;
}

/**
 * Fetch active sauces from Firebase
 */
async function fetchSauces() {
  try {
    const q = query(
      collection(db, 'sauces'),
      where('active', '==', true),
      orderBy('sortOrder', 'asc')
    );
    const snapshot = await getDocs(q);
    const allSauces = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Filter out dipping sauces - they belong in the dips section
    return allSauces.filter(sauce => sauce.category !== 'dipping-sauce');
  } catch (error) {
    console.error('Error fetching sauces from Firebase:', error);
    return [];
  }
}
