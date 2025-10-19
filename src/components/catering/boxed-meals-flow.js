/**
 * Boxed Meals Flow Component
 * Corporate lunch path with bulk customization
 * Minimum 10 boxes, optimized for 80+ orders
 */

import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../firebase-config.js';

// State management for boxed meal configuration
let boxedMealState = {
  boxCount: 10,
  boxes: [],
  sauces: [],
  sides: [],
  desserts: []
};

export async function renderBoxedMealsFlow() {
  // Load menu data
  const [sauces, sides, desserts] = await Promise.all([
    fetchSauces(),
    fetchBoxedSides(),
    fetchDesserts()
  ]);

  // Store in state
  boxedMealState.sauces = sauces;
  boxedMealState.sides = sides;
  boxedMealState.desserts = desserts;

  return `
    <section class="boxed-meals-section">
      ${renderBoxedMealsHeader()}
      ${renderSKUMatrix()}
      ${renderBoxCountSelector()}
      ${renderBulkConfiguration()}
      ${renderOrderSummary()}
      ${renderBoxedMealsCTA()}
    </section>
  `;
}

/**
 * Header with overview
 */
function renderBoxedMealsHeader() {
  return `
    <div class="boxed-meals-header">
      <h2>Individually Boxed Meals</h2>
      <p class="boxed-subtitle">Perfect for corporate lunches and on-the-go teams</p>

      <div class="boxed-benefits">
        <div class="benefit-item">
          <span class="benefit-icon">✓</span>
          <span class="benefit-text">No shared surfaces - everyone gets their own</span>
        </div>
        <div class="benefit-item">
          <span class="benefit-icon">✓</span>
          <span class="benefit-text">Easy distribution at meetings & events</span>
        </div>
        <div class="benefit-item">
          <span class="benefit-icon">✓</span>
          <span class="benefit-text">Customizable to dietary preferences</span>
        </div>
      </div>
    </div>
  `;
}

/**
 * SKU Matrix showing what's in each box
 */
function renderSKUMatrix() {
  return `
    <div class="sku-matrix">
      <h3 class="matrix-title">What's in Each Box</h3>
      <div class="matrix-grid">
        <div class="matrix-item">
          <div class="matrix-icon">🍗</div>
          <div class="matrix-label">6 Wings</div>
          <div class="matrix-detail">Classic, Boneless, or Plant-Based</div>
        </div>
        <div class="matrix-item">
          <div class="matrix-icon">🌶️</div>
          <div class="matrix-label">1 Sauce</div>
          <div class="matrix-detail">Your choice from 14 signature sauces</div>
        </div>
        <div class="matrix-item">
          <div class="matrix-icon">🥣</div>
          <div class="matrix-label">2 Dips</div>
          <div class="matrix-detail">Ranch, Blue Cheese, or Honey Mustard</div>
        </div>
        <div class="matrix-item">
          <div class="matrix-icon">🥗</div>
          <div class="matrix-label">1 Side</div>
          <div class="matrix-detail">Miss Vickie's Chips or Cold Side</div>
        </div>
        <div class="matrix-item">
          <div class="matrix-icon">🍰</div>
          <div class="matrix-label">1 Dessert</div>
          <div class="matrix-detail">Cheesecake, Brownie, or Pound Cake</div>
        </div>
        <div class="matrix-item">
          <div class="matrix-icon">💧</div>
          <div class="matrix-label">Water</div>
          <div class="matrix-detail">Bottled water included</div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Box count selector with validation
 */
function renderBoxCountSelector() {
  return `
    <div class="box-count-selector">
      <h3 class="selector-title">How many boxes do you need?</h3>
      <p class="selector-note">Minimum 10 boxes per order</p>

      <div class="count-input-group">
        <button class="count-btn count-minus" id="decrease-boxes" aria-label="Decrease box count">
          −
        </button>
        <input
          type="number"
          id="box-count-input"
          class="count-input"
          value="10"
          min="10"
          max="500"
          aria-label="Number of boxes">
        <button class="count-btn count-plus" id="increase-boxes" aria-label="Increase box count">
          +
        </button>
      </div>

      <div class="count-presets">
        <button class="preset-btn" data-count="10">10 boxes</button>
        <button class="preset-btn" data-count="20">20 boxes</button>
        <button class="preset-btn" data-count="50">50 boxes</button>
        <button class="preset-btn" data-count="100">100 boxes</button>
      </div>

      <div id="box-count-validation" class="validation-message" role="alert"></div>
    </div>
  `;
}

/**
 * Bulk configuration with smart defaults
 */
function renderBulkConfiguration() {
  return `
    <div class="bulk-configuration">
      <h3 class="config-title">Customize Your Order</h3>
      <p class="config-subtitle">Configure all boxes at once, then adjust individual boxes if needed</p>

      <div class="bulk-actions-bar">
        <button class="btn-secondary btn-sm" id="apply-to-all">
          Apply Settings to All Boxes
        </button>
        <button class="btn-secondary btn-sm" id="reset-config">
          Reset Configuration
        </button>
      </div>

      <div class="bulk-config-form">
        ${renderWingTypeSelector()}
        ${renderSauceSelector()}
        ${renderDipsSelector()}
        ${renderSideSelector()}
        ${renderDessertSelector()}
      </div>

      <div class="individual-customization-toggle">
        <button class="btn-text" id="show-individual-config">
          Need to customize individual boxes? Click here →
        </button>
      </div>

      <div id="individual-boxes-config" class="individual-boxes-config" style="display: none;">
        <h4>Individual Box Customization</h4>
        <p class="config-note">Currently showing boxes 1-10. Scroll to see more.</p>
        <div id="boxes-accordion" class="boxes-accordion">
          <!-- Generated dynamically based on box count -->
        </div>
      </div>
    </div>
  `;
}

function renderWingTypeSelector() {
  return `
    <div class="bulk-field">
      <label class="field-label" for="bulk-wing-type">
        <span class="label-icon">🍗</span>
        Wing Type
      </label>
      <select id="bulk-wing-type" class="field-select">
        <option value="boneless">Boneless Wings</option>
        <option value="bone-in">Bone-In Wings (Traditional)</option>
        <option value="plant-based">Plant-Based Wings (Cauliflower)</option>
      </select>
    </div>
  `;
}

function renderSauceSelector() {
  const sauces = boxedMealState.sauces;

  return `
    <div class="bulk-field">
      <label class="field-label" for="bulk-sauce">
        <span class="label-icon">🌶️</span>
        Sauce Selection
      </label>
      <select id="bulk-sauce" class="field-select">
        <option value="">Choose a sauce...</option>
        ${sauces.map(sauce => `
          <option value="${sauce.id}">
            ${sauce.name} ${'🌶️'.repeat(sauce.heatLevel || 1)}
          </option>
        `).join('')}
      </select>
      <p class="field-hint">Each box gets one sauce flavor</p>
    </div>
  `;
}

function renderDipsSelector() {
  return `
    <div class="bulk-field">
      <label class="field-label">
        <span class="label-icon">🥣</span>
        Dips (Select 2)
      </label>
      <div class="dips-checkboxes">
        <label class="checkbox-label">
          <input type="checkbox" name="bulk-dips" value="ranch" class="dip-checkbox">
          <span>Ranch</span>
        </label>
        <label class="checkbox-label">
          <input type="checkbox" name="bulk-dips" value="blue-cheese" class="dip-checkbox">
          <span>Blue Cheese</span>
        </label>
        <label class="checkbox-label">
          <input type="checkbox" name="bulk-dips" value="honey-mustard" class="dip-checkbox">
          <span>Honey Mustard</span>
        </label>
      </div>
      <p class="field-hint">Exactly 2 dips per box</p>
    </div>
  `;
}

function renderSideSelector() {
  return `
    <div class="bulk-field">
      <label class="field-label" for="bulk-side">
        <span class="label-icon">🥗</span>
        Side Option
      </label>
      <select id="bulk-side" class="field-select">
        <option value="chips">Miss Vickie's Chips (Variety)</option>
        <option value="coleslaw">Coleslaw</option>
        <option value="potato-salad">Potato Salad</option>
      </select>
      <p class="field-hint">No fries - they don't travel well!</p>
    </div>
  `;
}

function renderDessertSelector() {
  const desserts = boxedMealState.desserts;

  return `
    <div class="bulk-field">
      <label class="field-label" for="bulk-dessert">
        <span class="label-icon">🍰</span>
        Dessert
      </label>
      <select id="bulk-dessert" class="field-select">
        <option value="">Choose a dessert...</option>
        ${desserts.map(dessert => `
          <option value="${dessert.id}">${dessert.name}</option>
        `).join('')}
      </select>
    </div>
  `;
}

/**
 * Order summary
 */
function renderOrderSummary() {
  return `
    <div class="boxed-order-summary">
      <h3 class="summary-title">Order Summary</h3>
      <div id="summary-content" class="summary-content">
        <p class="summary-placeholder">Configure your boxes above to see the summary</p>
      </div>
    </div>
  `;
}

/**
 * CTA section
 */
function renderBoxedMealsCTA() {
  return `
    <div class="boxed-meals-cta">
      <button id="request-boxed-quote" class="btn-primary btn-large" disabled>
        Get Your Free Quote
      </button>
      <p class="cta-note">Complete the configuration above to request a quote</p>
      <p class="cta-phone">
        Questions? Call us at <a href="tel:+12673763113">(267) 376-3113</a>
      </p>
    </div>
  `;
}

/**
 * Initialize boxed meals interactions
 */
export function initBoxedMealsFlow() {
  const decreaseBtn = document.getElementById('decrease-boxes');
  const increaseBtn = document.getElementById('increase-boxes');
  const countInput = document.getElementById('box-count-input');
  const presetBtns = document.querySelectorAll('.preset-btn');
  const applyToAllBtn = document.getElementById('apply-to-all');
  const showIndividualBtn = document.getElementById('show-individual-config');
  const quoteBtn = document.getElementById('request-boxed-quote');

  // Box count handlers
  decreaseBtn?.addEventListener('click', () => adjustBoxCount(-1));
  increaseBtn?.addEventListener('click', () => adjustBoxCount(1));
  countInput?.addEventListener('change', validateBoxCount);

  presetBtns?.forEach(btn => {
    btn.addEventListener('click', () => {
      const count = parseInt(btn.dataset.count);
      setBoxCount(count);
    });
  });

  // Bulk configuration
  applyToAllBtn?.addEventListener('click', applyBulkSettings);
  showIndividualBtn?.addEventListener('click', toggleIndividualConfig);

  // Dips validation (exactly 2)
  document.querySelectorAll('.dip-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', validateDipsSelection);
  });

  // Form validation
  document.querySelectorAll('.bulk-field select, .bulk-field input').forEach(field => {
    field.addEventListener('change', validateConfiguration);
  });

  function adjustBoxCount(delta) {
    const current = parseInt(countInput.value) || 10;
    const newValue = Math.max(10, Math.min(500, current + delta));
    setBoxCount(newValue);
  }

  function setBoxCount(count) {
    countInput.value = count;
    boxedMealState.boxCount = count;
    validateBoxCount();
  }

  function validateBoxCount() {
    const count = parseInt(countInput.value) || 0;
    const validationEl = document.getElementById('box-count-validation');

    if (count < 10) {
      validationEl.textContent = 'Minimum 10 boxes required';
      validationEl.style.color = '#e74c3c';
      return false;
    }

    validationEl.textContent = '';
    return true;
  }

  function validateDipsSelection() {
    const selected = document.querySelectorAll('.dip-checkbox:checked');
    const checkboxes = document.querySelectorAll('.dip-checkbox');

    if (selected.length >= 2) {
      checkboxes.forEach(cb => {
        if (!cb.checked) cb.disabled = true;
      });
    } else {
      checkboxes.forEach(cb => {
        cb.disabled = false;
      });
    }

    validateConfiguration();
  }

  function applyBulkSettings() {
    // Get bulk selections
    const wingType = document.getElementById('bulk-wing-type')?.value;
    const sauce = document.getElementById('bulk-sauce')?.value;
    const dips = Array.from(document.querySelectorAll('.dip-checkbox:checked')).map(cb => cb.value);
    const side = document.getElementById('bulk-side')?.value;
    const dessert = document.getElementById('bulk-dessert')?.value;

    // Apply to all boxes in state
    boxedMealState.boxes = Array(boxedMealState.boxCount).fill({
      wingType,
      sauce,
      dips,
      side,
      dessert
    });

    updateSummary();
    validateConfiguration();

    // Show confirmation
    alert(`Settings applied to all ${boxedMealState.boxCount} boxes!`);
  }

  function toggleIndividualConfig() {
    const container = document.getElementById('individual-boxes-config');
    const isVisible = container.style.display !== 'none';

    if (!isVisible) {
      container.style.display = 'block';
      showIndividualBtn.textContent = '← Hide individual customization';
      generateIndividualBoxes();
    } else {
      container.style.display = 'none';
      showIndividualBtn.textContent = 'Need to customize individual boxes? Click here →';
    }
  }

  function generateIndividualBoxes() {
    // Implementation for individual box accordion
    // This would generate accordion items for each box
    console.log('Generating individual boxes interface...');
  }

  function validateConfiguration() {
    const wingType = document.getElementById('bulk-wing-type')?.value;
    const sauce = document.getElementById('bulk-sauce')?.value;
    const dips = document.querySelectorAll('.dip-checkbox:checked').length;
    const side = document.getElementById('bulk-side')?.value;
    const dessert = document.getElementById('bulk-dessert')?.value;
    const validCount = validateBoxCount();

    const isValid = wingType && sauce && dips === 2 && side && dessert && validCount;

    if (quoteBtn) {
      quoteBtn.disabled = !isValid;
    }

    return isValid;
  }

  function updateSummary() {
    const summaryContent = document.getElementById('summary-content');
    if (!summaryContent) return;

    const count = boxedMealState.boxCount;
    const hasConfig = boxedMealState.boxes.length > 0;

    if (!hasConfig) {
      summaryContent.innerHTML = '<p class="summary-placeholder">Configure your boxes above to see the summary</p>';
      return;
    }

    const box = boxedMealState.boxes[0];
    summaryContent.innerHTML = `
      <div class="summary-row">
        <span class="summary-label">Total Boxes:</span>
        <span class="summary-value">${count}</span>
      </div>
      <div class="summary-row">
        <span class="summary-label">Wing Type:</span>
        <span class="summary-value">${formatWingType(box.wingType)}</span>
      </div>
      <div class="summary-row">
        <span class="summary-label">Sauce:</span>
        <span class="summary-value">${getSauceName(box.sauce)}</span>
      </div>
    `;
  }

  function formatWingType(type) {
    const types = {
      'boneless': 'Boneless',
      'bone-in': 'Bone-In (Traditional)',
      'plant-based': 'Plant-Based (Cauliflower)'
    };
    return types[type] || type;
  }

  function getSauceName(sauceId) {
    const sauce = boxedMealState.sauces.find(s => s.id === sauceId);
    return sauce ? sauce.name : sauceId;
  }

  // Initial validation
  validateConfiguration();
}

/**
 * Fetch menu data
 */
async function fetchSauces() {
  try {
    const q = query(
      collection(db, 'sauces'),
      where('active', '==', true),
      orderBy('sortOrder', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching sauces:', error);
    return getSampleSauces();
  }
}

async function fetchBoxedSides() {
  // Fetch cold sides (no fries)
  try {
    const q = query(
      collection(db, 'coldSides'),
      where('active', '==', true)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching sides:', error);
    return [];
  }
}

async function fetchDesserts() {
  try {
    const q = query(
      collection(db, 'desserts'),
      where('active', '==', true)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching desserts:', error);
    return [];
  }
}

function getSampleSauces() {
  return [
    { id: 'buffalo', name: 'Classic Buffalo', heatLevel: 2 },
    { id: 'bbq', name: 'Sweet BBQ', heatLevel: 0 },
    { id: 'honey-hot', name: 'Honey Hot', heatLevel: 3 }
  ];
}

export { boxedMealState };
