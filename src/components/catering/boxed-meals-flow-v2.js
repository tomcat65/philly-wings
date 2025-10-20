/**
 * Boxed Meals Flow V2 - Template Builder + Live Preview
 * Corporate lunch path with template selection and visual configuration
 */

import { collection, query, where, getDocs, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase-config.js';
import { renderTemplateSelector, initTemplateSelector } from './template-selector.js';
import { renderLivePreviewPanel, updatePreviewPanel } from './live-preview-panel.js';
import {
  renderPhotoCardSelector,
  initPhotoCardSelector,
  renderDipCounterSelector,
  initDipCounterSelector,
  PHOTO_SELECTOR_CONFIGS
} from './photo-card-selector.js';
import {
  renderWingCountSelector,
  renderSauceSplitSelector,
  initWingCountSelector,
  initSauceSplitSelector,
  getWingCountPrice
} from './wing-count-selector.js';
import {
  renderContactForm,
  initContactFormInteractions,
  validateContactForm,
  collectContactData
} from './contact-form.js';
import { getAllAddOnsSplitByCategory } from '../../services/catering-addons-service.js';

// Enhanced state management
let boxedMealState = {
  currentStep: 'template-selection',  // template-selection | configuration | quick-adds | review-contact | success
  selectedTemplate: null,
  boxCount: 10,
  currentConfig: {
    wingCount: 6,           // NEW: 6, 10, or 12
    wingType: null,
    wingStyle: null,        // NEW: 'mixed', 'all-drums', 'all-flats' (for bone-in only)
    sauce: null,            // Single sauce for wingCount === 6
    sauces: [],             // Multiple sauces for wingCount >= 10, format: [{id, count}]
    splitSauces: false,     // Toggle for multi-sauce mode
    sauceOnSide: false,     // NEW: Wet sauce on the side (only for wet sauces)
    dips: [],
    side: null,
    dessert: null,
    specialInstructions: '' // NEW: Per-box special instructions
  },
  individualOverrides: {},
  lastSavedBoxNumber: null,
  menuData: {
    sauces: [],
    sides: [],
    desserts: []
  },
  // NEW: Extras selection
  extras: {
    quickAdds: [],       // { id, quantity, name, price }
    beverages: [],
    hotBeverages: [],
    salads: [],
    premiumSides: []
  },
  // NEW: Contact & delivery information
  contact: {
    company: '',
    name: '',
    email: '',
    phone: '',
    deliveryAddress: {
      street: '',
      street2: '',
      city: '',
      state: '',
      zip: ''
    },
    billingAddress: {
      sameAsDelivery: true,
      street: '',
      street2: '',
      city: '',
      state: '',
      zip: ''
    },
    deliveryDate: '',      // YYYY-MM-DD
    deliveryTime: '',      // HH:MM
    deliveryPeriod: 'PM',  // 'AM' | 'PM'
    notes: ''
  },
  // NEW: Pricing information
  pricing: {
    subtotal: 0,
    estimatedTotal: 0,
    taxRate: 0.08,
    note: 'Final price includes setup fees, staff, delivery distance, tips, and 8% tax. We\'ll provide exact pricing in your quote.'
  }
};

// ========================================
// Helper Functions - Dip Counter Conversion
// ========================================

/**
 * Convert dip array to counter object
 * @param {string[]} dipsArray - e.g., ['ranch', 'ranch'] or ['ranch', 'blue-cheese']
 * @returns {Object} - e.g., {ranch: 2} or {ranch: 1, 'blue-cheese': 1}
 */
function convertDipsArrayToCounts(dipsArray) {
  if (!Array.isArray(dipsArray)) return {};

  const counts = {};
  dipsArray.forEach(dipId => {
    counts[dipId] = (counts[dipId] || 0) + 1;
  });
  return counts;
}

/**
 * Convert dip counter object to array
 * @param {Object} dipCounts - e.g., {ranch: 2} or {ranch: 1, 'blue-cheese': 1}
 * @returns {string[]} - e.g., ['ranch', 'ranch'] or ['ranch', 'blue-cheese']
 */
function convertDipsCountsToArray(dipCounts) {
  if (!dipCounts || typeof dipCounts !== 'object') return [];

  const dipsArray = [];
  Object.entries(dipCounts).forEach(([dipId, count]) => {
    for (let i = 0; i < count; i++) {
      dipsArray.push(dipId);
    }
  });
  return dipsArray;
}

/**
 * Main entry point - renders current step
 */
export async function renderBoxedMealsFlow() {
  // Load menu data once
  await loadMenuData();

  // Render based on current step
  switch (boxedMealState.currentStep) {
    case 'template-selection':
      return await renderTemplateSelectionStep();
    case 'configuration':
      return renderConfigurationStep();
    case 'review':
      return renderReviewStep();
    default:
      return await renderTemplateSelectionStep();
  }
}

/**
 * Step 1: Template Selection
 */
async function renderTemplateSelectionStep() {
  const templateSelectorHTML = await renderTemplateSelector();

  return `
    <section class="boxed-meals-flow boxed-meals-step-templates">
      ${templateSelectorHTML}
    </section>
  `;
}

/**
 * Step 2: Configuration with Live Preview
 */
function renderConfigurationStep() {
  return `
    <section class="boxed-meals-flow boxed-meals-step-configuration">
      <div class="configuration-container">
        <!-- Left: Configuration Zone (60%) -->
        <div class="configuration-main">
          ${renderConfigurationHeader()}
          ${renderBoxCountSelector()}
          ${renderConfigurationZone()}
          ${renderBulkActions()}
          ${renderConfigurationCTA()}
        </div>

        <!-- Right: Live Preview Panel (40%) -->
        <div class="configuration-sidebar">
          ${renderLivePreviewPanel(boxedMealState.currentConfig, boxedMealState.boxCount)}
        </div>
      </div>
    </section>
  `;
}

/**
 * Configuration header with template breadcrumb
 */
function renderConfigurationHeader() {
  const template = boxedMealState.selectedTemplate;

  return `
    <div class="config-header">
      <button class="btn-back" id="back-to-templates">
        ← Back to Templates
      </button>

      <div class="config-title-group">
        <h2 class="config-title">
          ${template?.name === 'Custom Box' ? 'Build Your Custom Box' : `Customize ${template?.name}`}
        </h2>
        ${template?.tagline ? `
          <p class="config-tagline">${template.tagline}</p>
        ` : ''}
      </div>

      ${template?.id !== 'custom' ? `
        <div class="template-reset">
          <button class="btn-text" id="reset-to-template">
            Reset to ${template.name} defaults
          </button>
        </div>
      ` : ''}
    </div>
  `;
}

/**
 * Box count selector - iOS Segmented Control
 */
function renderBoxCountSelector() {
  // FIXED: Ensure boxCount is always valid before rendering
  const safeBoxCount = Number.isNaN(boxedMealState.boxCount) || !boxedMealState.boxCount
    ? 10
    : boxedMealState.boxCount;

  // Update state if it was invalid
  if (safeBoxCount !== boxedMealState.boxCount) {
    boxedMealState.boxCount = safeBoxCount;
  }

  // Determine which segment is active
  const isPreset = [10, 20, 50, 100].includes(safeBoxCount);
  const isCustom = !isPreset;

  return `
    <div class="box-count-selector-v2">
      <div class="count-header">
        <h3 class="count-title">How many boxes?</h3>
        <p class="count-min-note">Minimum 10 boxes required</p>
      </div>

      <div class="count-controls">
        <div class="segmented-control">
          <button class="segment-btn ${safeBoxCount === 10 ? 'active' : ''}" data-count="10">
            10
          </button>
          <button class="segment-btn ${safeBoxCount === 20 ? 'active' : ''}" data-count="20">
            20
          </button>
          <button class="segment-btn ${safeBoxCount === 50 ? 'active' : ''}" data-count="50">
            50
          </button>
          <button class="segment-btn ${safeBoxCount === 100 ? 'active' : ''}" data-count="100">
            100
          </button>
          <div class="segment-custom ${isCustom ? 'active' : ''}">
            <span>Custom:</span>
            <input
              type="number"
              id="custom-count-input"
              value="${isCustom ? safeBoxCount : ''}"
              min="10"
              max="500"
              placeholder="10+"
              aria-label="Custom box count">
          </div>
        </div>
      </div>

      <div id="count-validation" class="validation-message" role="alert"></div>
    </div>
  `;
}

/**
 * Configuration zone with photo-based cards
 */
function renderConfigurationZone() {
  // FIXED: Ensure boxCount is always valid
  const safeBoxCount = Number.isNaN(boxedMealState.boxCount) || !boxedMealState.boxCount
    ? 10
    : boxedMealState.boxCount;

  return `
    <div class="configuration-zone">
      <h3 class="zone-title">Configure All ${safeBoxCount} Boxes</h3>
      <p class="zone-subtitle">Selections apply to all boxes (customize individually later if needed)</p>

      <div class="config-sections">
        <!-- Wing Count Selection -->
        <div id="config-section-wing-count">
          ${renderWingCountSelector(boxedMealState.currentConfig.wingCount)}
        </div>

        <!-- Wings Type Selection -->
        <div class="config-section" id="config-section-wings">
          ${renderPhotoCardSelector({
            category: 'wings',
            items: PHOTO_SELECTOR_CONFIGS.wings.items,
            selectedId: boxedMealState.currentConfig.wingType,
            multiSelect: false,
            onSelect: () => {} // Handler attached in init
          })}
        </div>

        <!-- Wing Style Selection (Bone-In only) -->
        ${boxedMealState.currentConfig.wingType === 'bone-in' ? `
          <div class="config-section" id="config-section-wing-style">
            ${renderWingStyleSelector(boxedMealState.currentConfig.wingStyle)}
          </div>
        ` : ''}

        <!-- Sauce Selection -->
        <div class="config-section" id="config-section-sauces">
          ${renderSauceSelector()}
        </div>

        <!-- Dips Selection (Counter-Based) -->
        <div class="config-section" id="config-section-dips">
          ${renderDipCounterSelector({
            items: PHOTO_SELECTOR_CONFIGS.dips.items,
            selectedCounts: convertDipsArrayToCounts(boxedMealState.currentConfig.dips),
            maxTotal: 2,
            onCountChange: () => {}
          })}
        </div>

        <!-- Side Selection -->
        <div class="config-section" id="config-section-sides">
          ${renderPhotoCardSelector({
            category: 'sides',
            items: PHOTO_SELECTOR_CONFIGS.sides.items,
            selectedId: boxedMealState.currentConfig.side,
            multiSelect: false,
            onSelect: () => {}
          })}
        </div>

        <!-- Dessert Selection -->
        <div class="config-section" id="config-section-desserts">
          ${renderDessertSelector()}
        </div>

        <!-- Special Instructions -->
        <div class="config-section" id="config-section-special-instructions">
          ${renderSpecialInstructionsField(boxedMealState.currentConfig.specialInstructions)}
        </div>
      </div>
    </div>
  `;
}

/**
 * Wing Style Selector (for Bone-In wings only)
 */
function renderWingStyleSelector(selectedStyle = 'mixed') {
  const styles = [
    {
      id: 'mixed',
      label: 'Mixed',
      description: 'Drums & Flats',
      icon: '🍗',
      price: 0
    },
    {
      id: 'all-drums',
      label: 'All Drums',
      description: 'Drumsticks only',
      icon: '🍗',
      price: 1.50  // From Firebase modifierGroups/wing_style
    },
    {
      id: 'all-flats',
      label: 'All Flats',
      description: 'Wingettes only',
      icon: '🦴',
      price: 1.50  // From Firebase modifierGroups/wing_style
    }
  ];

  return `
    <div class="wing-style-selector config-section">
      <div class="section-header">
        <h4 class="section-title">🍗 Wing Style</h4>
        <p class="section-subtitle">Choose how you'd like your bone-in wings</p>
      </div>

      <div class="wing-style-options">
        ${styles.map(style => `
          <button
            class="wing-style-btn ${selectedStyle === style.id ? 'style-active' : ''}"
            data-wing-style="${style.id}"
            type="button">
            <span class="style-icon">${style.icon}</span>
            <div class="style-info">
              <span class="style-label">${style.label}</span>
              <span class="style-description">${style.description}</span>
              ${style.price > 0 ? `<span class="style-price">+$${style.price.toFixed(2)}</span>` : ''}
            </div>
          </button>
        `).join('')}
      </div>
    </div>
  `;
}

/**
 * Sauce on side toggle (for wet sauces only)
 */
function renderSauceOnSideToggle(sauceOnSide = false, isWetSauce = false) {
  if (!isWetSauce) return '';

  return `
    <div class="sauce-on-side-toggle">
      <label class="toggle-label">
        <input
          type="checkbox"
          id="sauce-on-side-toggle"
          class="toggle-input"
          ${sauceOnSide ? 'checked' : ''}>
        <span class="toggle-text">
          Serve sauce on the side
          <span class="toggle-hint">Great for dipping or keeping wings crispy</span>
        </span>
      </label>
    </div>
  `;
}

/**
 * Sauce selector with actual Firestore data
 */
function renderSauceSelector() {
  const { wingCount, splitSauces, sauce, sauces } = boxedMealState.currentConfig;
  const sauceData = boxedMealState.menuData.sauces;

  // Filter to only wing sauces (exclude dipping sauces)
  const wingSauces = sauceData.filter(s => s.category !== 'dipping-sauce');

  const sauceItems = wingSauces.map(s => ({
    id: s.id,
    name: s.name,
    description: s.description || '',
    heatLevel: s.heatLevel || 1,
    tags: s.tags || [],
    imageUrl: s.imageUrl || null,
    isDryRub: s.isDryRub || false,
    category: s.category || ''
  }));

  const availableSauces = sauceItems.length > 0 ? sauceItems : getSampleSauces();

  // Check if selected sauce is a wet sauce (not dry rub)
  const selectedSauceData = availableSauces.find(s => s.id === sauce);
  const isWetSauce = selectedSauceData && !selectedSauceData.isDryRub;

  // If split sauces mode is enabled, show sauce split selector
  if (splitSauces && wingCount >= 10) {
    return renderSauceSplitSelector(wingCount, sauces, availableSauces);
  }

  // Otherwise show regular single sauce selector with optional sauce on side toggle
  return `
    ${renderPhotoCardSelector({
      category: 'sauces',
      items: availableSauces,
      selectedId: sauce,
      multiSelect: false,
      onSelect: () => {}
    })}
    ${renderSauceOnSideToggle(boxedMealState.currentConfig.sauceOnSide, isWetSauce)}
  `;
}

/**
 * Dessert selector with actual Firestore data
 */
function renderDessertSelector() {
  const desserts = boxedMealState.menuData.desserts;

  const dessertItems = desserts.map(dessert => ({
    id: dessert.id,
    name: dessert.name,
    description: dessert.description || '',
    tags: dessert.tags || [],
    imageUrl: dessert.imageUrl || null,
    price: dessert.variants?.[0]?.basePrice || null
  }));

  return renderPhotoCardSelector({
    category: 'desserts',
    items: dessertItems.length > 0 ? dessertItems : getSampleDesserts(),
    selectedId: boxedMealState.currentConfig.dessert,
    multiSelect: false,
    onSelect: () => {}
  });
}

/**
 * Special Instructions field
 */
function renderSpecialInstructionsField(currentInstructions = '') {
  const maxLength = 200;
  const remaining = maxLength - currentInstructions.length;

  return `
    <div class="section-header">
      <h4 class="section-title">📝 Special Instructions</h4>
      <p class="section-subtitle">Add notes for all boxes (dietary restrictions, preparation preferences, etc.)</p>
    </div>

    <div class="special-instructions-container">
      <textarea
        id="special-instructions-input"
        class="special-instructions-textarea"
        placeholder="Example: 'No celery in any boxes', 'Extra napkins please', 'Light sauce on all wings'"
        maxlength="${maxLength}"
        rows="3">${currentInstructions}</textarea>

      <div class="instructions-meta">
        <span class="char-count ${remaining < 20 ? 'char-count-warning' : ''}">
          ${remaining} characters remaining
        </span>
      </div>

      <div class="instructions-hint">
        <span class="hint-icon">💡</span>
        <span>These instructions apply to your entire order. For delivery details, add them at checkout.</span>
      </div>
    </div>
  `;
}

/**
 * Bulk actions bar
 */
function renderBulkActions() {
  return `
    <div class="bulk-actions">
      <button class="btn-text" id="toggle-individual-config">
        Need different options for some boxes? Customize individually →
      </button>
    </div>

    <!-- Hidden individual config drawer -->
    <div id="individual-config-drawer" class="individual-config-drawer" style="display: none;">
      <div class="drawer-header">
        <h4>Individual Box Customization</h4>
        <button class="btn-close-drawer" id="close-individual-drawer">✕</button>
      </div>
      <div class="drawer-content">
        <p class="drawer-intro">Customize specific boxes while keeping the bulk configuration as your baseline.</p>
        <div id="individual-boxes-list">
          <!-- Generated dynamically -->
        </div>
      </div>
    </div>
  `;
}

/**
 * Configuration CTA
 */
function renderConfigurationCTA() {
  const isComplete = isConfigurationComplete();

  return `
    <div class="config-cta">
      <button
        class="btn-request-quote btn-primary btn-large"
        id="request-quote-btn"
        ${!isComplete ? 'disabled' : ''}>
        Get Your Free Quote
      </button>

      <p class="cta-note">
        ${isComplete
          ? 'Ready to submit! We\'ll follow up within 1 business day.'
          : 'Complete all sections above to request a quote'}
      </p>

      <p class="cta-phone">
        Questions? Call <a href="tel:+12673763113">(267) 376-3113</a>
      </p>
    </div>
  `;
}

/**
 * Step 3: Review step (future implementation)
 */
function renderReviewStep() {
  return `
    <section class="boxed-meals-step-review">
      <h2>Review Your Order</h2>
      <p>Review step coming soon...</p>
    </section>
  `;
}

// ========================================
// Initialization & Event Handlers
// ========================================

/**
 * Initialize boxed meals flow interactions
 */
export async function initBoxedMealsFlow() {
  if (boxedMealState.currentStep === 'template-selection') {
    initTemplateSelector(handleTemplateSelection);
  } else if (boxedMealState.currentStep === 'configuration') {
    initConfigurationStep();
  }
}

/**
 * Initialize configuration step interactions
 */
function initConfigurationStep() {
  // Export state to window for pricing panel access
  window.boxedMealState = boxedMealState;

  // Wing count selector
  initWingCountSelector(handleWingCountChange, handleSplitSaucesToggle);

  // Sauce split selector (if enabled)
  if (boxedMealState.currentConfig.splitSauces) {
    initSauceSplitSelector(boxedMealState.currentConfig.wingCount, handleSauceSplitChange);
  }

  // Photo card selectors
  initPhotoCardSelector('wings', false, null, handleWingSelection);
  initPhotoCardSelector('sauces', false, null, handleSauceSelection);
  initPhotoCardSelector('sides', false, null, handleSideSelection);
  initPhotoCardSelector('desserts', false, null, handleDessertSelection);

  // Dip counter selector (allows 2x same dip)
  initDipCounterSelector(2, handleDipCountChange);

  // Wing style selector (if bone-in wings selected)
  document.querySelectorAll('[data-wing-style]').forEach(btn => {
    btn.addEventListener('click', () => {
      const style = btn.dataset.wingStyle;
      handleWingStyleChange(style);
    });
  });

  // Sauce on side toggle
  const sauceOnSideToggle = document.getElementById('sauce-on-side-toggle');
  if (sauceOnSideToggle) {
    sauceOnSideToggle.addEventListener('change', (e) => {
      handleSauceOnSideToggle(e.target.checked);
    });
  }

  // Special instructions
  const instructionsTextarea = document.getElementById('special-instructions-input');

  instructionsTextarea?.addEventListener('input', handleSpecialInstructionsInput);

  // Box count controls - Segmented Control
  const segmentBtns = document.querySelectorAll('.segment-btn');
  const customInput = document.getElementById('custom-count-input');

  segmentBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const count = parseInt(btn.dataset.count);
      updateBoxCount(count);
    });
  });

  // Input event - visual feedback only, NO updateBoxCount!
  customInput?.addEventListener('input', (e) => {
    const value = e.target.value;
    const num = parseInt(value);

    // Activate custom segment
    segmentBtns.forEach(btn => btn.classList.remove('active'));
    customSegment?.classList.add('active');

    // Visual feedback (optional - shows validation state)
    if (num && (num < 10 || num > 500)) {
      e.target.style.borderBottomColor = '#ff4444'; // Red for invalid
    } else if (num >= 10) {
      e.target.style.borderBottomColor = '#4CAF50'; // Green for valid
    } else {
      e.target.style.borderBottomColor = ''; // Reset if empty
    }
  });

  // Enter key - validate and update
  customInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      let value = parseInt(e.target.value);
      if (!value || isNaN(value)) value = 10;
      value = Math.max(10, Math.min(500, value));
      e.target.value = value;
      updateBoxCount(value);
      e.target.blur(); // Close keyboard on mobile
    }
  });

  // Blur validation - enforce range and update count
  customInput?.addEventListener('blur', (e) => {
    let value = parseInt(e.target.value);

    // Handle empty or invalid
    if (!value || isNaN(value)) {
      value = 10;
    }

    // Clamp to valid range (10-500)
    const clampedValue = Math.max(10, Math.min(500, value));

    // Show alert only if user tried to set < 10
    if (value > 0 && value < 10) {
      alert('Minimum 10 boxes required');
    }

    // Update input and state
    e.target.value = clampedValue;
    e.target.style.borderBottomColor = ''; // Reset border color
    updateBoxCount(clampedValue);
  });

  // Custom segment click handler - activate and focus input
  const customSegment = document.querySelector('.segment-custom');
  customSegment?.addEventListener('click', (e) => {
    // Always allow clicks on the input to pass through
    if (e.target === customInput) {
      e.stopPropagation();
      return;
    }

    // Focus the input field with a small delay to ensure it's clickable
    setTimeout(() => {
      customInput?.focus();
      customInput?.click();
    }, 0);

    // If input is empty, set a default value
    if (!customInput?.value) {
      customInput.value = '10';
      updateBoxCount(10);
    }

    // Activate custom segment visually
    segmentBtns.forEach(btn => btn.classList.remove('active'));
    customSegment.classList.add('active');
  });

  // Also handle direct focus on input
  customInput?.addEventListener('focus', () => {
    segmentBtns.forEach(btn => btn.classList.remove('active'));
    customSegment?.classList.add('active');
  });

  // Bulk actions
  document.getElementById('toggle-individual-config')?.addEventListener('click', toggleIndividualDrawer);
  document.getElementById('close-individual-drawer')?.addEventListener('click', () => {
    document.getElementById('individual-config-drawer').style.display = 'none';
  });

  // Navigation
  document.getElementById('back-to-templates')?.addEventListener('click', goBackToTemplates);
  document.getElementById('reset-to-template')?.addEventListener('click', resetToTemplate);

  // Quote request
  document.getElementById('request-quote-btn')?.addEventListener('click', handleQuoteRequest);
}

/**
 * Handle template selection
 */
async function handleTemplateSelection(template) {
  boxedMealState.selectedTemplate = template;

  // Apply template defaults if not custom
  if (template.defaultConfig) {
    // FIXED: Merge template config with current defaults instead of replacing
    // This preserves wingCount and other properties not specified in template
    boxedMealState.currentConfig = {
      ...boxedMealState.currentConfig,  // Start with current defaults (includes wingCount: 6)
      ...template.defaultConfig          // Override with template-specific values
    };
  }

  // Initialize box count (always set to ensure no NaN)
  if (template.boxCount !== undefined) {
    boxedMealState.boxCount = template.boxCount;
  } else if (template.defaultConfig?.boxCount !== undefined) {
    boxedMealState.boxCount = template.defaultConfig.boxCount;
  } else {
    // Explicitly set to default minimum of 10 boxes
    boxedMealState.boxCount = 10;
  }

  // Move to configuration step
  boxedMealState.currentStep = 'configuration';

  // Re-render
  const container = document.querySelector('.boxed-meals-section') || document.querySelector('.boxed-meals-flow');
  if (container) {
    container.innerHTML = await renderBoxedMealsFlow();
    await initBoxedMealsFlow();
  }
}

/**
 * Selection handlers
 */
function handleWingCountChange(newCount) {
  // DEFENSIVE FIX: Ensure boxCount is valid BEFORE any operations
  // This prevents NaN from propagating through re-renders and event handlers
  if (Number.isNaN(boxedMealState.boxCount) || !boxedMealState.boxCount) {
    boxedMealState.boxCount = 10;
  }

  boxedMealState.currentConfig.wingCount = newCount;

  // If switching to 6 wings, disable split sauces
  if (newCount === 6 && boxedMealState.currentConfig.splitSauces) {
    boxedMealState.currentConfig.splitSauces = false;
    boxedMealState.currentConfig.sauces = [];
  }

  // Re-render configuration zone to show/hide split sauce option
  const configZone = document.querySelector('.configuration-zone');
  if (configZone) {
    configZone.innerHTML = renderConfigurationZone().replace('<div class="configuration-zone">', '').replace('</div>\n  `', '');
    initConfigurationStep();
  }

  updatePreviewPanel(boxedMealState.currentConfig, boxedMealState.boxCount);
  validateAndUpdateCTA();
}

function handleSplitSaucesToggle(enabled) {
  boxedMealState.currentConfig.splitSauces = enabled;

  if (enabled) {
    // Initialize split sauces with default split
    const count = boxedMealState.currentConfig.wingCount;
    boxedMealState.currentConfig.sauces = [
      { id: boxedMealState.currentConfig.sauce || null, count: Math.ceil(count / 2) },
      { id: null, count: Math.floor(count / 2) }
    ];
    boxedMealState.currentConfig.sauce = null; // Clear single sauce
  } else {
    // Revert to single sauce mode
    boxedMealState.currentConfig.sauce = boxedMealState.currentConfig.sauces[0]?.id || null;
    boxedMealState.currentConfig.sauces = [];
  }

  // Re-render sauce section
  const sauceSection = document.getElementById('config-section-sauces');
  if (sauceSection) {
    sauceSection.innerHTML = renderSauceSelector();
    if (enabled) {
      initSauceSplitSelector(boxedMealState.currentConfig.wingCount, handleSauceSplitChange);
    } else {
      initPhotoCardSelector('sauces', false, null, handleSauceSelection);
    }
  }

  updatePreviewPanel(boxedMealState.currentConfig, boxedMealState.boxCount);
  validateAndUpdateCTA();
}

function handleSauceSplitChange({ sauces }) {
  boxedMealState.currentConfig.sauces = sauces;
  updatePreviewPanel(boxedMealState.currentConfig, boxedMealState.boxCount);
  validateAndUpdateCTA();
}

function handleWingSelection(wingType) {
  boxedMealState.currentConfig.wingType = wingType;

  // Set default wing style when bone-in selected, reset when not
  if (wingType === 'bone-in') {
    boxedMealState.currentConfig.wingStyle = boxedMealState.currentConfig.wingStyle || 'mixed';
  } else {
    boxedMealState.currentConfig.wingStyle = null;
  }

  // Re-render configuration zone to show/hide wing style selector
  const configZone = document.querySelector('.configuration-zone');
  if (configZone) {
    configZone.innerHTML = renderConfigurationZone().replace('<div class="configuration-zone">', '').replace('</div>\n  `', '');
    initConfigurationStep();
  }

  updatePreviewPanel(boxedMealState.currentConfig, boxedMealState.boxCount);
  validateAndUpdateCTA();
}

function handleWingStyleChange(style) {
  boxedMealState.currentConfig.wingStyle = style;

  // Update UI
  document.querySelectorAll('[data-wing-style]').forEach(btn => {
    btn.classList.toggle('style-active', btn.dataset.wingStyle === style);
  });

  updatePreviewPanel(boxedMealState.currentConfig, boxedMealState.boxCount);
  console.log('Wing style selected:', style);
}

function handleSauceSelection(sauceId) {
  boxedMealState.currentConfig.sauce = sauceId;

  // Re-render sauce section to show/hide sauce on side toggle
  const sauceSection = document.getElementById('config-section-sauces');
  if (sauceSection) {
    sauceSection.innerHTML = renderSauceSelector();
    initConfigurationStep();
  }

  updatePreviewPanel(boxedMealState.currentConfig, boxedMealState.boxCount);
  validateAndUpdateCTA();
}

function handleSauceOnSideToggle(checked) {
  boxedMealState.currentConfig.sauceOnSide = checked;
  console.log('Sauce on side:', checked ? 'Yes' : 'No');
  updatePreviewPanel(boxedMealState.currentConfig, boxedMealState.boxCount);
}

function handleDipsSelection(dipsArray) {
  boxedMealState.currentConfig.dips = dipsArray;
  displayDipValidationFeedback(dipsArray?.length || 0);
  updatePreviewPanel(boxedMealState.currentConfig, boxedMealState.boxCount);
  validateAndUpdateCTA();
}

/**
 * Handle dip count changes from counter selector
 * @param {string[]} dipsArray - Array format: ['ranch', 'ranch'] or ['ranch', 'blue-cheese']
 * @param {Object} dipCounts - Counter format: {ranch: 2} or {ranch: 1, 'blue-cheese': 1}
 */
function handleDipCountChange(dipsArray, dipCounts) {
  // Store in array format for compatibility
  boxedMealState.currentConfig.dips = dipsArray;

  // Update preview panel
  updatePreviewPanel(boxedMealState.currentConfig, boxedMealState.boxCount);
  validateAndUpdateCTA();
}

function handleSideSelection(sideId) {
  boxedMealState.currentConfig.side = sideId;
  updatePreviewPanel(boxedMealState.currentConfig, boxedMealState.boxCount);
  validateAndUpdateCTA();
}

function handleDessertSelection(dessertId) {
  boxedMealState.currentConfig.dessert = dessertId;
  updatePreviewPanel(boxedMealState.currentConfig, boxedMealState.boxCount);
  validateAndUpdateCTA();
}

function displayDipValidationFeedback(selectedCount) {
  const selector = document.querySelector('.photo-card-selector[data-category="dips"]');
  if (!selector) return;

  const header = selector.querySelector('.card-selector-header');
  if (!header) return;

  selector.classList.toggle('selector-invalid', selectedCount !== 2);

  let validationEl = header.querySelector('.selector-validation');
  if (selectedCount !== 2) {
    const message = `Select exactly 2 dips${selectedCount ? ` (${selectedCount} chosen)` : ''}`;
    if (!validationEl) {
      validationEl = document.createElement('div');
      validationEl.className = 'selector-validation';
      validationEl.setAttribute('role', 'alert');
      header.appendChild(validationEl);
    }
    validationEl.textContent = message;
  } else if (validationEl) {
    validationEl.remove();
  }
}

/**
 * Update box count
 */
function updateBoxCount(count) {
  const numericCount = Number.isFinite(count) ? count : Number.parseInt(count, 10);
  const sanitizedCount = Number.isFinite(numericCount) ? numericCount : 10;
  const clampedCount = Math.max(10, Math.min(500, sanitizedCount));

  boxedMealState.boxCount = clampedCount;

  // Update configuration zone title
  const zoneTitle = document.querySelector('.zone-title');
  if (zoneTitle) {
    zoneTitle.textContent = `Configure All ${clampedCount} Boxes`;
  }

  // Update UI - Segmented Control
  const isPreset = [10, 20, 50, 100].includes(clampedCount);
  const customCountInput = document.getElementById('custom-count-input');
  const customSegment = document.querySelector('.segment-custom');

  if (customCountInput) {
    customCountInput.value = isPreset ? '' : clampedCount;
  }

  if (customSegment) {
    customSegment.classList.toggle('active', !isPreset);
  }

  document.querySelectorAll('.segment-btn').forEach(btn => {
    const presetValue = Number.parseInt(btn.dataset.count, 10);
    btn.classList.toggle('active', presetValue === clampedCount);
  });

  updatePreviewPanel(boxedMealState.currentConfig, clampedCount);
  validateAndUpdateCTA();
}

/**
 * Handle special instructions input
 */
function handleSpecialInstructionsInput(e) {
  const value = e.target.value;
  const maxLength = 200;
  const remaining = maxLength - value.length;

  // Update character count
  const charCountEl = document.querySelector('.char-count');
  if (charCountEl) {
    charCountEl.textContent = `${remaining} characters remaining`;
    charCountEl.classList.toggle('char-count-warning', remaining < 20);
  }

  // Update state (auto-save as user types - applies to all boxes)
  boxedMealState.currentConfig.specialInstructions = value;

  // Update preview
  updatePreviewPanel(boxedMealState.currentConfig, boxedMealState.boxCount);
}

/**
 * Toggle individual customization drawer
 */
function toggleIndividualDrawer() {
  const drawer = document.getElementById('individual-config-drawer');
  const isOpening = drawer.style.display === 'none';

  if (isOpening) {
    // Generate individual boxes from current bulk config
    generateIndividualBoxes();
    drawer.style.display = 'block';
  } else {
    drawer.style.display = 'none';
  }
}

/**
 * Generate individual boxes list in drawer
 */
function generateIndividualBoxes() {
  const boxesList = document.getElementById('individual-boxes-list');
  if (!boxesList) return;

  const rawCount = typeof boxedMealState.boxCount === 'string'
    ? Number.parseInt(boxedMealState.boxCount, 10)
    : boxedMealState.boxCount;
  const normalizedCount = Number.isFinite(rawCount) ? rawCount : 10;
  const safeCount = Math.max(10, Math.min(500, Math.floor(normalizedCount)));

  if (safeCount !== boxedMealState.boxCount) {
    boxedMealState.boxCount = safeCount;
  }

  const highlightBoxNumber = boxedMealState.lastSavedBoxNumber;
  const boxes = [];

  for (let i = 1; i <= safeCount; i++) {
    const boxConfig = boxedMealState.individualOverrides[i] || { ...boxedMealState.currentConfig };
    boxes.push(renderIndividualBox(i, boxConfig, highlightBoxNumber === i));
  }

  boxesList.innerHTML = boxes.join('');

  // Initialize accordion interactions
  initIndividualBoxAccordions();

  if (highlightBoxNumber) {
    requestAnimationFrame(() => {
      const trigger = document.querySelector(`.box-accordion-trigger[data-box-number="${highlightBoxNumber}"]`);
      const content = document.querySelector(`.box-accordion-content[data-box-number="${highlightBoxNumber}"]`);

      if (trigger && content) {
        content.style.display = 'block';
        trigger.querySelector('.accordion-icon').textContent = '▲';
      }

      setTimeout(() => {
        boxedMealState.lastSavedBoxNumber = null;
        const boxItem = document.querySelector(`.individual-box-item[data-box-number="${highlightBoxNumber}"]`);
        if (boxItem) {
          boxItem.classList.remove('box-recently-saved');
          const confirmationBadge = boxItem.querySelector('.save-confirmation-badge');
          if (confirmationBadge) {
            confirmationBadge.remove();
          }
        }
      }, 1800);
    });
  }
}

/**
 * Render individual box accordion item
 */
function renderIndividualBox(boxNumber, config, isRecentlySaved = false) {
  const hasOverride = !!boxedMealState.individualOverrides[boxNumber];
  const isModified = hasOverride;

  return `
    <div class="individual-box-item ${isModified ? 'box-modified' : ''} ${isRecentlySaved ? 'box-recently-saved' : ''}" data-box-number="${boxNumber}">
      <button class="box-accordion-trigger" data-box-number="${boxNumber}">
        <div class="box-trigger-content">
          <span class="box-number-badge">Box ${boxNumber}</span>
          ${isModified ? '<span class="modified-badge">✓ Customized</span>' : '<span class="default-badge">Using bulk config</span>'}
          ${isRecentlySaved ? '<span class="save-confirmation-badge" role="status">✓ Saved</span>' : ''}
        </div>
        <span class="accordion-icon">▼</span>
      </button>

      <div class="box-accordion-content" data-box-number="${boxNumber}" style="display: none;">
        <div class="box-config-summary">
          <div class="summary-row">
            <span class="summary-label">Wings:</span>
            <span class="summary-value">${config.wingCount} ${formatWingType(config.wingType)}</span>
          </div>

          <div class="summary-row">
            <span class="summary-label">Sauce:</span>
            <span class="summary-value">
              ${config.splitSauces && config.sauces?.length === 2
                ? `${formatSauceName(config.sauces[0]?.id)} (${config.sauces[0]?.count}) + ${formatSauceName(config.sauces[1]?.id)} (${config.sauces[1]?.count})`
                : formatSauceName(config.sauce)}
            </span>
          </div>

          <div class="summary-row">
            <span class="summary-label">Dips:</span>
            <span class="summary-value">${config.dips?.map(formatDipName).join(', ') || 'None'}</span>
          </div>

          <div class="summary-row">
            <span class="summary-label">Side:</span>
            <span class="summary-value">${formatSideName(config.side)}</span>
          </div>

          <div class="summary-row">
            <span class="summary-label">Dessert:</span>
            <span class="summary-value">${formatDessertName(config.dessert)}</span>
          </div>

          ${config.boxSpecialInstructions ? `
            <div class="summary-row">
              <span class="summary-label">📝 Box Instructions:</span>
              <span class="summary-value special-instructions">${config.boxSpecialInstructions}</span>
            </div>
          ` : ''}
        </div>

        <div class="box-actions">
          ${isModified ? `
            <button class="btn-reset-box btn-secondary btn-sm" data-box-number="${boxNumber}">
              Reset to Bulk Config
            </button>
          ` : `
            <button class="btn-customize-box btn-primary btn-sm" data-box-number="${boxNumber}">
              Customize This Box
            </button>
          `}
        </div>
      </div>
    </div>
  `;
}

/**
 * Initialize individual box accordion interactions
 */
function initIndividualBoxAccordions() {
  // Accordion triggers
  document.querySelectorAll('.box-accordion-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const boxNumber = trigger.dataset.boxNumber;
      const content = document.querySelector(`.box-accordion-content[data-box-number="${boxNumber}"]`);
      const icon = trigger.querySelector('.accordion-icon');

      if (content.style.display === 'none') {
        content.style.display = 'block';
        icon.textContent = '▲';
      } else {
        content.style.display = 'none';
        icon.textContent = '▼';
      }
    });
  });

  // Customize buttons
  document.querySelectorAll('.btn-customize-box').forEach(btn => {
    btn.addEventListener('click', () => {
      const boxNumber = parseInt(btn.dataset.boxNumber);
      customizeIndividualBox(boxNumber);
    });
  });

  // Reset buttons
  document.querySelectorAll('.btn-reset-box').forEach(btn => {
    btn.addEventListener('click', () => {
      const boxNumber = parseInt(btn.dataset.boxNumber);
      resetIndividualBox(boxNumber);
    });
  });
}

/**
 * Customize individual box - open inline editor
 */
function customizeIndividualBox(boxNumber) {
  // Get current config for this box (either override or bulk)
  const baseConfig = boxedMealState.individualOverrides[boxNumber]
    || { ...boxedMealState.currentConfig };

  const currentBoxConfig = {
    ...baseConfig,
    dips: Array.isArray(baseConfig.dips) ? [...baseConfig.dips] : [],
    sauces: Array.isArray(baseConfig.sauces)
      ? baseConfig.sauces.map(sauce => ({ ...sauce }))
      : [],
    boxSpecialInstructions: baseConfig.boxSpecialInstructions || ''
  };

  // Mark as customized
  boxedMealState.individualOverrides[boxNumber] = currentBoxConfig;

  // Replace accordion content with editable form
  const content = document.querySelector(`.box-accordion-content[data-box-number="${boxNumber}"]`);
  if (content) {
    content.innerHTML = renderIndividualBoxEditor(boxNumber, currentBoxConfig);
    initIndividualBoxEditor(boxNumber);
  }
}

/**
 * Render individual box editor form
 */
function renderIndividualBoxEditor(boxNumber, config) {
  const sauceData = boxedMealState.menuData.sauces;
  const desserts = boxedMealState.menuData.desserts;
  const wingSauces = sauceData.filter(s => s.category !== 'dipping-sauce');
  const availableSauces = wingSauces.length > 0 ? wingSauces : getSampleSauces();
  const availableDesserts = desserts.length > 0 ? desserts : getSampleDesserts();

  return `
    <div class="individual-box-editor" data-box-editor="${boxNumber}">
      <div class="editor-header">
        <h5>Customize Box ${boxNumber}</h5>
        <p class="editor-subtitle">Configure this box independently</p>
      </div>

      <!-- Wing Count -->
      <div class="editor-section">
        <label class="editor-label">Wing Count:</label>
        <div class="wing-count-options">
          ${[6, 10, 12].map(count => `
            <button
              class="wing-count-btn ${config.wingCount === count ? 'active' : ''}"
              data-wing-count="${count}"
              data-box="${boxNumber}"
              type="button">
              ${count} Wings
              ${count === 10 ? '<span class="badge">Popular</span>' : ''}
              ${count === 12 ? '<span class="badge">Best Value</span>' : ''}
            </button>
          `).join('')}
        </div>
      </div>

      <!-- Wing Type -->
      <div class="editor-section">
        <label class="editor-label">Wing Type:</label>
        <div class="wing-type-options">
          ${[
            { id: 'boneless', label: 'Boneless', icon: '🍗' },
            { id: 'bone-in', label: 'Bone-In', icon: '🍖' },
            { id: 'plant-based', label: 'Plant-Based', icon: '🌱' }
          ].map(type => `
            <button
              class="wing-type-btn ${config.wingType === type.id ? 'active' : ''}"
              data-wing-type="${type.id}"
              data-box="${boxNumber}"
              type="button">
              <span class="type-icon">${type.icon}</span>
              <span class="type-label">${type.label}</span>
            </button>
          `).join('')}
        </div>
      </div>

      <!-- Sauce -->
      <div class="editor-section">
        <label class="editor-label">Sauce:</label>
        <select class="sauce-select" data-box="${boxNumber}">
          ${availableSauces.map(sauce => `
            <option value="${sauce.id}" ${config.sauce === sauce.id ? 'selected' : ''}>
              ${sauce.name} ${'🌶️'.repeat(sauce.heatLevel || 1)}
            </option>
          `).join('')}
        </select>
      </div>

      <!-- Dips (Counter-Based) -->
      <div class="editor-section">
        <label class="editor-label">Dips (Select 2 total):</label>
        <div class="dips-counter-options" data-box="${boxNumber}">
          ${[
            { id: 'ranch', label: 'Ranch' },
            { id: 'blue-cheese', label: 'Blue Cheese' },
            { id: 'honey-mustard', label: 'Honey Mustard' }
          ].map(dip => {
            const dipCounts = convertDipsArrayToCounts(config.dips || []);
            const count = dipCounts[dip.id] || 0;
            const totalSelected = Object.values(dipCounts).reduce((sum, c) => sum + c, 0);
            const canIncrement = totalSelected < 2;
            const canDecrement = count > 0;

            return `
              <div class="dip-counter-row" data-dip-id="${dip.id}">
                <span class="dip-label">${dip.label}</span>
                <div class="dip-counter-controls-inline">
                  <button
                    class="btn-dip-decrement-editor ${!canDecrement ? 'disabled' : ''}"
                    data-dip-id="${dip.id}"
                    data-box="${boxNumber}"
                    type="button"
                    ${!canDecrement ? 'disabled' : ''}>−</button>
                  <span class="dip-count-display-editor">${count}</span>
                  <button
                    class="btn-dip-increment-editor ${!canIncrement ? 'disabled' : ''}"
                    data-dip-id="${dip.id}"
                    data-box="${boxNumber}"
                    type="button"
                    ${!canIncrement ? 'disabled' : ''}>+</button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
        <p class="editor-helper dips-helper" aria-live="polite">
          Select exactly two dips total (can choose same dip twice).
        </p>
      </div>

      <!-- Side -->
      <div class="editor-section">
        <label class="editor-label">Side:</label>
        <select class="side-select" data-box="${boxNumber}">
          ${[
            { id: 'chips', label: "Miss Vickie's Chips" },
            { id: 'coleslaw', label: 'Coleslaw' },
            { id: 'potato-salad', label: 'Potato Salad' }
          ].map(side => `
            <option value="${side.id}" ${config.side === side.id ? 'selected' : ''}>
              ${side.label}
            </option>
          `).join('')}
        </select>
      </div>

      <!-- Dessert -->
      <div class="editor-section">
        <label class="editor-label">Dessert:</label>
        <select class="dessert-select" data-box="${boxNumber}">
          ${availableDesserts.map(dessert => `
            <option value="${dessert.id}" ${config.dessert === dessert.id ? 'selected' : ''}>
              ${dessert.name}
            </option>
          `).join('')}
        </select>
      </div>

      <!-- Special Instructions for this box -->
      <div class="editor-section">
        <label class="editor-label">Special Instructions for Box ${boxNumber}:</label>
        <textarea
          class="box-instructions"
          data-box="${boxNumber}"
          placeholder="e.g., 'This box is for Evelyn Cradle' or 'Add Gritty's Revenge on the side'"
          maxlength="200"
          rows="3">${config.boxSpecialInstructions || ''}</textarea>
        <div class="char-count">
          <span class="char-count-current">${(config.boxSpecialInstructions || '').length}</span>/200
        </div>
      </div>

      <!-- Actions -->
      <div class="editor-actions">
        <button class="btn-save-box btn-primary" data-box="${boxNumber}">
          Save Changes
        </button>
        <button class="btn-cancel-edit btn-secondary" data-box="${boxNumber}">
          Cancel
        </button>
        <button class="btn-reset-to-bulk btn-secondary" data-box="${boxNumber}">
          Reset to Bulk Config
        </button>
      </div>
    </div>
  `;
}

/**
 * Initialize individual box editor interactions
 */
function initIndividualBoxEditor(boxNumber) {
  const config = boxedMealState.individualOverrides[boxNumber];
  const editorRoot = document.querySelector(`.individual-box-editor[data-box-editor="${boxNumber}"]`);
  if (!editorRoot) return;

  const saveBtn = editorRoot.querySelector(`.btn-save-box[data-box="${boxNumber}"]`);
  const dipsOptions = editorRoot.querySelector('.dips-options');
  const dipsHelper = editorRoot.querySelector('.dips-helper');

  const updateDipValidation = () => {
    const count = Array.isArray(config.dips) ? config.dips.length : 0;
    const isValid = count === 2;

    if (saveBtn) {
      saveBtn.disabled = !isValid;
      saveBtn.classList.toggle('btn-disabled', !isValid);
    }

    if (dipsOptions) {
      dipsOptions.classList.toggle('dips-error', !isValid);
    }

    if (dipsHelper) {
      dipsHelper.classList.toggle('error', !isValid);
      dipsHelper.textContent = isValid
        ? 'Saved selection: two dips selected.'
        : `Select 2 dips (currently ${count}).`;
    }
  };

  // Wing count buttons
  editorRoot.querySelectorAll(`.wing-count-btn[data-box="${boxNumber}"]`).forEach(btn => {
    btn.addEventListener('click', () => {
      config.wingCount = parseInt(btn.dataset.wingCount);
      // Update active state
      editorRoot.querySelectorAll(`.wing-count-btn[data-box="${boxNumber}"]`).forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Wing type buttons
  editorRoot.querySelectorAll(`.wing-type-btn[data-box="${boxNumber}"]`).forEach(btn => {
    btn.addEventListener('click', () => {
      config.wingType = btn.dataset.wingType;
      // Update active state
      editorRoot.querySelectorAll(`.wing-type-btn[data-box="${boxNumber}"]`).forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Sauce select
  const sauceSelect = editorRoot.querySelector(`.sauce-select[data-box="${boxNumber}"]`);
  if (sauceSelect) {
    sauceSelect.addEventListener('change', (e) => {
      config.sauce = e.target.value;
    });
  }

  // Dip counter buttons (max 2 total, allows 2x same dip)
  const updateEditorDipCounters = () => {
    const dipCounts = convertDipsArrayToCounts(config.dips || []);
    const totalSelected = Object.values(dipCounts).reduce((sum, c) => sum + c, 0);

    // Update all counter displays and button states
    editorRoot.querySelectorAll('.dip-counter-row').forEach(row => {
      const dipId = row.dataset.dipId;
      const count = dipCounts[dipId] || 0;
      const countDisplay = row.querySelector('.dip-count-display-editor');
      const incrementBtn = row.querySelector('.btn-dip-increment-editor');
      const decrementBtn = row.querySelector('.btn-dip-decrement-editor');

      if (countDisplay) countDisplay.textContent = count;

      if (incrementBtn) {
        const canIncrement = totalSelected < 2;
        incrementBtn.disabled = !canIncrement;
        incrementBtn.classList.toggle('disabled', !canIncrement);
      }

      if (decrementBtn) {
        const canDecrement = count > 0;
        decrementBtn.disabled = !canDecrement;
        decrementBtn.classList.toggle('disabled', !canDecrement);
      }
    });

    updateDipValidation();
  };

  // Increment dip counter
  editorRoot.querySelectorAll(`.btn-dip-increment-editor[data-box="${boxNumber}"]`).forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.disabled) return;
      const dipId = btn.dataset.dipId;
      const dipCounts = convertDipsArrayToCounts(config.dips || []);
      const totalSelected = Object.values(dipCounts).reduce((sum, c) => sum + c, 0);

      if (totalSelected < 2) {
        dipCounts[dipId] = (dipCounts[dipId] || 0) + 1;
        config.dips = convertDipsCountsToArray(dipCounts);
        updateEditorDipCounters();
      }
    });
  });

  // Decrement dip counter
  editorRoot.querySelectorAll(`.btn-dip-decrement-editor[data-box="${boxNumber}"]`).forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.disabled) return;
      const dipId = btn.dataset.dipId;
      const dipCounts = convertDipsArrayToCounts(config.dips || []);

      if (dipCounts[dipId] > 0) {
        dipCounts[dipId]--;
        if (dipCounts[dipId] === 0) delete dipCounts[dipId];
        config.dips = convertDipsCountsToArray(dipCounts);
        updateEditorDipCounters();
      }
    });
  });

  // Side select
  const sideSelect = editorRoot.querySelector(`.side-select[data-box="${boxNumber}"]`);
  if (sideSelect) {
    sideSelect.addEventListener('change', (e) => {
      config.side = e.target.value;
    });
  }

  // Dessert select
  const dessertSelect = editorRoot.querySelector(`.dessert-select[data-box="${boxNumber}"]`);
  if (dessertSelect) {
    dessertSelect.addEventListener('change', (e) => {
      config.dessert = e.target.value;
    });
  }

  // Special instructions
  const instructionsTextarea = editorRoot.querySelector(`.box-instructions[data-box="${boxNumber}"]`);
  if (instructionsTextarea) {
    instructionsTextarea.addEventListener('input', (e) => {
      config.boxSpecialInstructions = e.target.value;
      // Update character count
      const charCount = editorRoot.querySelector('.char-count-current');
      if (charCount) {
        charCount.textContent = e.target.value.length;
      }
    });
  }

  // Save button
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      if (!Array.isArray(config.dips) || config.dips.length !== 2) {
        updateDipValidation();
        return;
      }

      // Export state to window for pricing panel access
      window.boxedMealState = boxedMealState;

      // Update pricing panel to show itemized pricing
      updatePreviewPanel(boxedMealState.currentConfig, boxedMealState.boxCount);

      boxedMealState.lastSavedBoxNumber = boxNumber;

      // Refresh the accordion to show updated summary
      generateIndividualBoxes();
    });
  }

  // Cancel button
  const cancelBtn = editorRoot.querySelector(`.btn-cancel-edit[data-box="${boxNumber}"]`);
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      // Refresh without saving (revert to previous state)
      generateIndividualBoxes();
    });
  }

  // Reset to bulk button
  const resetBtn = editorRoot.querySelector(`.btn-reset-to-bulk[data-box="${boxNumber}"]`);
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      resetIndividualBox(boxNumber);
    });
  }

  updateDipValidation();
}

/**
 * Reset individual box to bulk config
 */
function resetIndividualBox(boxNumber) {
  delete boxedMealState.individualOverrides[boxNumber];

  // Refresh drawer
  generateIndividualBoxes();

  // Show feedback
  const boxItem = document.querySelector(`.individual-box-item[data-box-number="${boxNumber}"]`);
  if (boxItem) {
    boxItem.classList.add('box-reset-flash');
    setTimeout(() => boxItem.classList.remove('box-reset-flash'), 600);
  }
}

/**
 * Navigation
 */
async function goBackToTemplates() {
  boxedMealState.currentStep = 'template-selection';
  const container = document.querySelector('.boxed-meals-flow');
  if (container) {
    container.innerHTML = await renderBoxedMealsFlow();
    await initBoxedMealsFlow();
  }
}

function resetToTemplate() {
  if (boxedMealState.selectedTemplate?.defaultConfig) {
    boxedMealState.currentConfig = { ...boxedMealState.selectedTemplate.defaultConfig };
    // Re-render configuration
    goBackToTemplates().then(() => {
      handleTemplateSelection(boxedMealState.selectedTemplate);
    });
  }
}

/**
 * Handle quote request - transition to quick-adds step
 */
function handleQuoteRequest() {
  if (!isConfigurationComplete()) return;

  // Transition to quick-adds step
  boxedMealState.currentStep = 'quick-adds';
  renderQuickAddsStep();
}

// ========================================
// Helper Functions
// ========================================

function isConfigurationComplete() {
  const { wingCount, wingType, sauce, sauces, splitSauces, dips, side, dessert } = boxedMealState.currentConfig;

  // Check sauce configuration based on mode
  let sauceComplete = false;
  if (splitSauces && wingCount >= 10) {
    // Split sauce mode: both sauces must be selected
    sauceComplete = sauces?.length === 2 &&
                   sauces[0]?.id &&
                   sauces[1]?.id &&
                   sauces[0].count + sauces[1].count === wingCount;
  } else {
    // Single sauce mode
    sauceComplete = !!sauce;
  }

  return wingCount && wingType && sauceComplete && dips?.length === 2 && side && dessert;
}

function validateAndUpdateCTA() {
  const quoteBtn = document.getElementById('request-quote-btn');
  const applyBtn = document.getElementById('apply-to-all-boxes');
  const isComplete = isConfigurationComplete();

  if (quoteBtn) quoteBtn.disabled = !isComplete;
  if (applyBtn) applyBtn.disabled = !isComplete;
}

/**
 * Load menu data from Firestore
 */
async function loadMenuData() {
  const [sauces, sides, desserts] = await Promise.all([
    fetchSauces(),
    fetchBoxedSides(),
    fetchDesserts()
  ]);

  boxedMealState.menuData = { sauces, sides, desserts };
}

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
  try {
    const q = query(collection(db, 'coldSides'), where('active', '==', true));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching sides:', error);
    return [];
  }
}

async function fetchDesserts() {
  try {
    const q = query(collection(db, 'desserts'), where('active', '==', true));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching desserts:', error);
    return getSampleDesserts();
  }
}

// ========================================
// Helper Functions
// ========================================

function formatWingType(type) {
  const types = {
    'boneless': 'Boneless',
    'bone-in': 'Bone-In',
    'plant-based': 'Plant-Based Cauliflower'
  };
  return types[type] || type;
}

function formatSauceName(sauce) {
  if (!sauce) return '';
  // Title case conversion
  return sauce.split('-').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

function formatDipName(dip) {
  if (!dip) return '';
  const dips = {
    'ranch': 'Ranch',
    'blue-cheese': 'Blue Cheese',
    'honey-mustard': 'Honey Mustard'
  };
  return dips[dip] || dip;
}

function formatSideName(side) {
  if (!side) return '';
  const sides = {
    'chips': "Miss Vickie's Chips",
    'coleslaw': 'Coleslaw',
    'potato-salad': 'Potato Salad'
  };
  return sides[side] || side;
}

function formatDessertName(dessert) {
  if (!dessert) return '';
  return dessert.split('-').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

// ========================================
// Quick-Adds Step Functions
// ========================================

/**
 * Render quick-adds/extras step
 */
async function renderQuickAddsStep() {
  const container = document.querySelector('.boxed-meals-section') || document.querySelector('.boxed-meals-flow');

  if (!container) {
    console.error('Container not found');
    return;
  }

  // Fetch ALL add-ons (boxed meals = premium tier)
  const addOns = await fetchAllAddOns();

  container.innerHTML = `
    <div class="quick-adds-step masonry-layout">
      <!-- Masonry Header -->
      <div class="masonry-header">
        <div class="masonry-header-content">
          <button class="btn-back-subtle" id="back-to-config-btn">← Back</button>
          <div class="masonry-title">
            <h2>Nobody Left Behind 🎉</h2>
            <p>Add drinks, sides & treats to complete your meal</p>
          </div>
        </div>
        <button class="skip-extras-btn" id="skip-extras-btn">Skip Extras →</button>
      </div>

      <!-- Horizontal Scroll Categories -->
      <div class="masonry-categories">
        ${renderMasonryCategory('Quick-Adds & Essentials', '🥤', addOns.quickAdds, false)}
        ${renderMasonryCategory('Premium Hot Beverages', '☕', addOns.hotBeverages, true)}
        ${renderMasonryCategory('Cold Beverages', '🧃', addOns.beverages, false)}
        ${renderMasonryCategory('Fresh Salads & Veggies', '🥗', addOns.salads, false)}
        ${renderMasonryCategory('Premium Sides', '🥔', addOns.sides, false)}
        ${renderMasonryCategory('Sweet Endings', '🍰', addOns.desserts, false)}
      </div>

      <!-- Sticky Cart Summary -->
      <div class="sticky-cart-summary" id="sticky-cart">
        <div class="cart-info">
          <span class="cart-icon">🛒</span>
          <span class="cart-text">Your Extras: <strong id="cart-count">0</strong> items</span>
          <span class="cart-divider">•</span>
          <span class="cart-total" id="cart-total">$0.00</span>
        </div>
        <button class="btn-primary btn-large" id="continue-with-extras-btn">
          Continue to Review
        </button>
      </div>
    </div>
  `;

  initQuickAddsInteractions(addOns);
}

/**
 * Render masonry category with horizontal scroll
 * @param {string} title - Category title
 * @param {string} icon - Emoji icon
 * @param {Array} items - Array of add-on items
 * @param {boolean} featured - Whether items should be featured (larger cards)
 */
function renderMasonryCategory(title, icon, items, featured = false) {
  if (!items || items.length === 0) return '';

  return `
    <div class="masonry-category">
      <div class="masonry-category-header">
        <span class="category-icon">${icon}</span>
        <span class="category-name">${title}</span>
      </div>
      <div class="horizontal-scroll">
        ${items.map(item => renderMasonryCard(item, featured)).join('')}
      </div>
    </div>
  `;
}

/**
 * Render individual masonry card
 * @param {Object} item - Add-on item
 * @param {boolean} featured - Whether card should be featured size
 */
function renderMasonryCard(item, featured = false) {
  const cardClass = featured ? 'masonry-card featured' : 'masonry-card';
  const price = item.price ? `$${item.price.toFixed(2)}` : 'Price varies';
  const servingInfo = item.serves ? ` • Serves ${item.serves}` : '';
  const packInfo = item.packSize ? ` (${item.packSize})` : '';

  return `
    <div class="${cardClass}" data-addon-id="${item.id}" data-name="${item.name}" data-price="${item.price || 0}" data-category="${item.category}">
      <div class="masonry-card-image">
        ${item.imageUrl ? `<img src="${item.imageUrl}" alt="${item.name}" loading="lazy">` : getIconForCategory(item.category)}
      </div>
      <div class="masonry-card-content">
        <div class="masonry-card-name">${item.name}</div>
        <div class="masonry-card-desc">${item.description || ''}${packInfo}${servingInfo}</div>
        <div class="masonry-card-footer">
          <div class="masonry-card-price">${price}</div>
          <div class="quantity-controls" style="display: none;">
            <button class="qty-btn qty-minus" data-addon-id="${item.id}">−</button>
            <span class="qty-display" data-addon-id="${item.id}">0</span>
            <button class="qty-btn qty-plus" data-addon-id="${item.id}">+</button>
          </div>
          <button class="quick-add-btn" data-addon-id="${item.id}">+ Add</button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Get emoji icon for category
 */
function getIconForCategory(category) {
  const icons = {
    'quick-adds': '🥤',
    'beverages': '🧃',
    'hot-beverages': '☕',
    'salads': '🥗',
    'sides': '🥔',
    'desserts': '🍰'
  };
  return `<div class="emoji-placeholder">${icons[category] || '🍴'}</div>`;
}

/**
 * Render a category of extras with accordion (OLD - kept for backward compatibility)
 */
function renderExtrasCategory(title, items, icon, description) {
  if (!items || items.length === 0) return '';

  const categoryId = title.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and');

  return `
    <div class="extras-category">
      <button class="category-header" data-category="${categoryId}">
        <div class="category-title">
          <span class="category-icon">${icon}</span>
          <div>
            <h3>${title}</h3>
            <p class="category-desc">${description}</p>
          </div>
        </div>
        <span class="toggle-icon">▼</span>
      </button>
      <div class="category-items" data-category="${categoryId}" style="display: none;">
        <div class="add-ons-grid">
          ${items.map(item => renderAddOnCard(item, categoryId)).join('')}
        </div>
      </div>
    </div>
  `;
}

/**
 * Render individual add-on card with quantity selector
 */
function renderAddOnCard(item, category) {
  const price = item.price || 0;
  const name = item.name || item.displayName || 'Unknown Item';

  return `
    <div class="add-on-card" data-item-id="${item.id}" data-category="${category}" data-name="${name}" data-price="${price}">
      <div class="add-on-content">
        <h4 class="add-on-name">${name}</h4>
        ${item.description ? `<p class="add-on-description">${item.description}</p>` : ''}
        <div class="add-on-price">$${price.toFixed(2)}</div>
      </div>
      <div class="add-on-quantity-control">
        <button class="qty-btn qty-minus" data-item-id="${item.id}">-</button>
        <input
          type="number"
          class="add-on-quantity-input"
          data-item-id="${item.id}"
          value="0"
          min="0"
          max="99">
        <button class="qty-btn qty-plus" data-item-id="${item.id}">+</button>
      </div>
    </div>
  `;
}

/**
 * Initialize quick-adds interactions
 */
function initQuickAddsInteractions(addOns) {
  // Track selected items in memory with quantities
  const selectedItems = new Map(); // { itemId: { name, price, category, quantity } }

  // Quick-add button handlers - shows quantity controls
  document.querySelectorAll('.quick-add-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const itemId = btn.dataset.addonId;
      const card = btn.closest('.masonry-card');
      const itemName = card.dataset.name;
      const itemPrice = parseFloat(card.dataset.price || 0);
      const category = card.dataset.category;

      // Map category to state key
      const categoryMap = {
        'quick-adds': 'quickAdds',
        'hot-beverages': 'hotBeverages',
        'beverages': 'beverages',
        'salads': 'salads',
        'sides': 'sides',
        'desserts': 'desserts'
      };
      const stateCategory = categoryMap[category] || 'quickAdds';

      // Add item with quantity 1
      selectedItems.set(itemId, { name: itemName, price: itemPrice, category: stateCategory, quantity: 1 });

      // Hide "+ Add" button, show quantity controls
      btn.style.display = 'none';
      const qtyControls = card.querySelector('.quantity-controls');
      qtyControls.style.display = 'flex';

      // Update quantity display
      const qtyDisplay = card.querySelector('.qty-display');
      qtyDisplay.textContent = '1';

      updateStickyCart(selectedItems);
    });
  });

  // Quantity + button handlers
  document.querySelectorAll('.qty-plus').forEach(btn => {
    btn.addEventListener('click', () => {
      const itemId = btn.dataset.addonId;
      const card = btn.closest('.masonry-card');
      const qtyDisplay = card.querySelector('.qty-display');

      if (selectedItems.has(itemId)) {
        const item = selectedItems.get(itemId);
        item.quantity = Math.min(99, item.quantity + 1);
        qtyDisplay.textContent = item.quantity;
        updateStickyCart(selectedItems);
      }
    });
  });

  // Quantity - button handlers
  document.querySelectorAll('.qty-minus').forEach(btn => {
    btn.addEventListener('click', () => {
      const itemId = btn.dataset.addonId;
      const card = btn.closest('.masonry-card');
      const qtyDisplay = card.querySelector('.qty-display');
      const qtyControls = card.querySelector('.quantity-controls');
      const addBtn = card.querySelector('.quick-add-btn');

      if (selectedItems.has(itemId)) {
        const item = selectedItems.get(itemId);
        item.quantity = Math.max(0, item.quantity - 1);

        if (item.quantity === 0) {
          // Remove item and reset UI
          selectedItems.delete(itemId);
          qtyControls.style.display = 'none';
          addBtn.style.display = 'block';
          qtyDisplay.textContent = '0';
        } else {
          qtyDisplay.textContent = item.quantity;
        }

        updateStickyCart(selectedItems);
      }
    });
  });

  // Back button
  document.getElementById('back-to-config-btn')?.addEventListener('click', () => {
    boxedMealState.currentStep = 'configuration';
    renderConfigurationStep();
  });

  // Skip button
  document.getElementById('skip-extras-btn')?.addEventListener('click', () => {
    // Clear extras
    boxedMealState.extras = {
      quickAdds: [],
      beverages: [],
      hotBeverages: [],
      salads: [],
      sides: []
    };
    boxedMealState.currentStep = 'review-contact';
    renderReviewContactStep();
  });

  // Continue button
  document.getElementById('continue-with-extras-btn')?.addEventListener('click', () => {
    collectExtrasSelections(selectedItems);
    boxedMealState.currentStep = 'review-contact';
    renderReviewContactStep();
  });
}

/**
 * Update sticky cart summary
 */
function updateStickyCart(selectedItems) {
  const stickyCart = document.getElementById('sticky-cart');
  const cartCount = document.getElementById('cart-count');
  const cartTotal = document.getElementById('cart-total');

  if (!stickyCart || !cartCount || !cartTotal) return;

  const totalQuantity = Array.from(selectedItems.values()).reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = Array.from(selectedItems.values()).reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Update display
  cartCount.textContent = totalQuantity;
  cartTotal.textContent = `$${totalPrice.toFixed(2)}`;

  // Show/hide cart based on selections
  if (totalQuantity > 0) {
    stickyCart.classList.add('visible');
  } else {
    stickyCart.classList.remove('visible');
  }
}

/**
 * Collect extras selections into state
 */
function collectExtrasSelections(selectedItems) {
  const selections = {
    quickAdds: [],
    beverages: [],
    hotBeverages: [],
    salads: [],
    sides: [],
    desserts: []
  };

  // Convert Map to categorized arrays
  selectedItems.forEach((item, itemId) => {
    const category = item.category || 'quickAdds';
    if (selections[category]) {
      selections[category].push({
        id: itemId,
        quantity: item.quantity || 1,
        name: item.name,
        price: item.price
      });
    }
  });

  boxedMealState.extras = selections;
}

/**
 * Fetch all add-ons
 */
async function fetchAllAddOns() {
  try {
    const addOns = await getAllAddOnsSplitByCategory();
    return addOns;
  } catch (error) {
    console.error('Error fetching add-ons:', error);
    // Return empty structure on error
    return {
      quickAdds: [],
      beverages: [],
      hotBeverages: [],
      salads: [],
      sides: []
    };
  }
}

// ========================================
// Review & Contact Step Functions
// ========================================

/**
 * Render review and contact step
 */
async function renderReviewContactStep() {
  const container = document.querySelector('.boxed-meals-section') || document.querySelector('.boxed-meals-flow');

  if (!container) {
    console.error('Container not found');
    return;
  }

  // Calculate pricing
  const pricing = calculatePricing();
  boxedMealState.pricing = pricing;

  container.innerHTML = `
    <div class="review-dashboard">
      <!-- LEFT SIDEBAR -->
      <div class="review-sidebar">
        <h2 class="sidebar-title">Order Summary</h2>

        <div class="total-display">
          <div class="total-amount">$${pricing.subtotal.toFixed(2)}</div>
          <div class="total-label">Estimated Total</div>
        </div>

        ${renderSidebarBreakdown(pricing)}

        <div class="event-info">
          <p><span class="icon">📅</span> ${boxedMealState.eventDate || 'Date TBD'}</p>
          <p><span class="icon">🕐</span> ${boxedMealState.eventTime || 'Time TBD'}</p>
          <p><span class="icon">👥</span> ${boxedMealState.boxCount} Guests</p>
          ${boxedMealState.contact?.address ? `<p><span class="icon">📍</span> ${boxedMealState.contact.address}</p>` : ''}
        </div>
      </div>

      <!-- RIGHT PANEL -->
      <div class="review-panel">
        <div class="panel-header">
          <h1>📦 Order Details</h1>
          <p>Review your complete order before submitting</p>
        </div>

        <!-- BOXED MEALS SECTION -->
        <div class="detail-section">
          <div class="section-header">
            <div class="section-title">Boxed Meals</div>
            <button class="edit-btn" id="edit-config-btn">✏️ Edit</button>
          </div>

          <div class="config-box">
            <h4>${getBoxedMealsTitle(boxedMealState, pricing)}</h4>
            <p class="config-subtitle">Each box contains:</p>
            <ul class="config-list">
              <li>${boxedMealState.currentConfig.wingCount}pc ${formatWingType(boxedMealState.currentConfig.wingType)} Wings</li>
              <li>${formatSideName(boxedMealState.currentConfig.side)}</li>
              <li>${formatSauceName(boxedMealState.currentConfig.sauce)}</li>
              <li>${formatDessertName(boxedMealState.currentConfig.dessert)}</li>
              <li>2 Dips + Bottled Water</li>
            </ul>
            ${pricing.customizedBoxCount > 0 ? `
              <p style="color: #d94b1e; margin-top: 12px; font-size: 14px;">
                <strong>Note:</strong> ${pricing.customizedBoxCount} box${pricing.customizedBoxCount > 1 ? 'es have' : ' has'} custom modifications
              </p>
            ` : ''}
          </div>

          <div class="price-summary">
            <div class="price-line">
              <span>Average per box: $${(pricing.boxesSubtotal / boxedMealState.boxCount).toFixed(2)}</span>
              <span>Total: $${pricing.boxesSubtotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <!-- EXTRAS SECTION -->
        ${renderExtrasDetails()}

        <!-- Contact Form -->
        ${renderContactForm(boxedMealState.contact)}

        <!-- ACTIONS -->
        <div class="panel-actions">
          <button class="btn-secondary btn-large" id="back-to-extras-btn">
            ← Back to Extras
          </button>
          <button class="btn-primary btn-large" id="submit-order-btn">
            Submit Quote Request →
          </button>
        </div>
      </div>
    </div>
  `;

  initReviewContactInteractions();
}

/**
 * Render sidebar breakdown
 */
function renderSidebarBreakdown(pricing) {
  const { extras } = boxedMealState;

  // Calculate category totals
  const beveragesTotal = [...extras.beverages, ...extras.hotBeverages]
    .reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const dessertsTotal = extras.desserts
    .reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const othersTotal = [...extras.quickAdds, ...extras.salads, ...extras.sides]
    .reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return `
    <div class="summary-breakdown">
      <div class="summary-item">
        <div class="label"><span>📦</span> Meals</div>
        <div class="amount">$${pricing.boxesSubtotal.toFixed(2)}</div>
      </div>
      ${beveragesTotal > 0 ? `
      <div class="summary-item">
        <div class="label"><span>🥤</span> Beverages</div>
        <div class="amount">$${beveragesTotal.toFixed(2)}</div>
      </div>` : ''}
      ${dessertsTotal > 0 ? `
      <div class="summary-item">
        <div class="label"><span>🍰</span> Desserts</div>
        <div class="amount">$${dessertsTotal.toFixed(2)}</div>
      </div>` : ''}
      ${othersTotal > 0 ? `
      <div class="summary-item">
        <div class="label"><span>➕</span> Other Add-ons</div>
        <div class="amount">$${othersTotal.toFixed(2)}</div>
      </div>` : ''}
      <div class="summary-item">
        <div class="label"><span>💵</span> Tax (8%)</div>
        <div class="amount">$${(pricing.subtotal * 0.08).toFixed(2)}</div>
      </div>
    </div>
  `;
}

/**
 * Render extras details for panel
 */
function renderExtrasDetails() {
  const { extras } = boxedMealState;
  const allExtras = [
    ...extras.quickAdds,
    ...extras.beverages,
    ...extras.hotBeverages,
    ...extras.salads,
    ...extras.sides,
    ...extras.desserts
  ];

  if (allExtras.length === 0) {
    return `
      <div class="detail-section">
        <div class="section-header">
          <div class="section-title">Extras & Add-Ons</div>
          <button class="edit-btn" id="add-extras-btn">➕ Add Extras</button>
        </div>
        <p style="color: #999; text-align: center; padding: 40px 0;">No extras selected</p>
      </div>
    `;
  }

  // Group extras by category
  const groupedExtras = {
    'Cold Beverages': extras.beverages,
    'Hot Beverages': extras.hotBeverages,
    'Salads': extras.salads,
    'Sides': extras.sides,
    'Desserts': extras.desserts,
    'Quick-Adds': extras.quickAdds
  };

  const categories = Object.entries(groupedExtras).filter(([_, items]) => items.length > 0);

  const extrasTotal = allExtras.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return `
    <div class="detail-section">
      <div class="section-header">
        <div class="section-title">Extras & Add-Ons</div>
        <button class="edit-btn" id="edit-extras-btn">✏️ Edit</button>
      </div>

      <div class="extras-grid">
        ${categories.map(([categoryName, items]) => `
          <div class="category-group">
            <div class="category-title">${categoryName}</div>
            ${items.map(item => `
              <div class="extra-item">
                <div class="item-info">
                  <div class="item-name">✓ ${item.name}</div>
                  <div class="item-calc">${item.quantity} × $${item.price.toFixed(2)}</div>
                </div>
                <div class="item-price">$${(item.price * item.quantity).toFixed(2)}</div>
              </div>
            `).join('')}
          </div>
        `).join('')}
      </div>

      <div class="extras-subtotal">
        Extras Total: $${extrasTotal.toFixed(2)}
      </div>
    </div>
  `;
}

/**
 * Calculate accurate price per box using full pricing logic
 * (Same logic as live-preview-panel.js)
 */
function calculatePricePerBox(config) {
  // Base price per box (for 6 wings)
  let price = 12.50;

  // Wing count adjustment
  const wingCount = config.wingCount || 6;
  if (wingCount === 10) price += 3.00;
  else if (wingCount === 12) price += 4.50;

  // Wing type adjustments
  if (config.wingType === 'bone-in') price += 1.50;
  if (config.wingType === 'plant-based') price += 2.00;

  // Wing style adjustments (all drums or all flats upcharge)
  if (config.wingStyle === 'all-drums' || config.wingStyle === 'all-flats') {
    price += 1.50;
  }

  // Sauce adjustments
  const premiumSauces = ['mango-habanero', 'hot-honey', 'ghost-pepper'];

  if (config.splitSauces && config.sauces?.length === 2) {
    // Check both sauces for premium pricing
    if (premiumSauces.includes(config.sauces[0]?.id)) price += 0.25;
    if (premiumSauces.includes(config.sauces[1]?.id)) price += 0.25;
  } else if (premiumSauces.includes(config.sauce)) {
    price += 0.50;
  }

  // Premium dessert adjustment
  const premiumDesserts = ['creme-brulee-cheesecake', 'red-velvet-cake'];
  if (premiumDesserts.includes(config.dessert)) price += 1.00;

  return price;
}

/**
 * Calculate pricing breakdown with accurate box pricing
 */
function calculatePricing() {
  const { boxCount, currentConfig, individualOverrides, extras } = boxedMealState;

  // Calculate each box individually (handling customizations)
  let boxesSubtotal = 0;
  let customizedBoxCount = 0;

  for (let boxNum = 1; boxNum <= boxCount; boxNum++) {
    const boxConfig = individualOverrides[boxNum] || currentConfig;
    const boxPrice = calculatePricePerBox(boxConfig);
    boxesSubtotal += boxPrice;

    if (individualOverrides[boxNum]) {
      customizedBoxCount++;
    }
  }

  // Extras subtotal
  const allExtras = [
    ...extras.quickAdds,
    ...extras.beverages,
    ...extras.hotBeverages,
    ...extras.salads,
    ...extras.sides,
    ...extras.desserts
  ];
  const extrasSubtotal = allExtras.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const subtotal = boxesSubtotal + extrasSubtotal;

  return {
    boxesSubtotal,
    extrasSubtotal,
    customizedBoxCount,
    subtotal,
    estimatedTotal: subtotal * 1.08, // Tax estimate
    taxRate: 0.08,
    note: 'Final price includes setup fees, staff, delivery distance, tips, and 8% tax. We\'ll provide exact pricing in your quote.'
  };
}

/**
 * Generate title for boxed meals section
 */
function getBoxedMealsTitle(state, pricing) {
  const { boxCount, selectedTemplate, customizedBoxCount } = state;

  // If all boxes are customized or no template selected
  if (customizedBoxCount === boxCount || !selectedTemplate || selectedTemplate.id === 'custom') {
    return `${boxCount} Customized Individual Boxes`;
  }

  // If some boxes are customized
  if (customizedBoxCount > 0) {
    const templateBoxes = boxCount - customizedBoxCount;
    return `${templateBoxes} × ${selectedTemplate.name} + ${customizedBoxCount} Customized`;
  }

  // All boxes use the template
  return `${boxCount} × ${selectedTemplate.name}`;
}

/**
 * Initialize review & contact interactions
 */
function initReviewContactInteractions() {
  initContactFormInteractions();

  // Back button - return to extras selection
  document.getElementById('back-to-extras-btn')?.addEventListener('click', () => {
    handleEditTransition('quick-adds', 'Returning to extras selection...');
  });

  // Edit config button - return to box configuration
  document.getElementById('edit-config-btn')?.addEventListener('click', () => {
    handleEditTransition('configuration', 'Returning to box configuration...');
  });

  // Edit extras button - return to extras with current selections
  const editExtrasBtn = document.getElementById('edit-extras-btn');
  if (editExtrasBtn) {
    editExtrasBtn.addEventListener('click', () => {
      handleEditTransition('quick-adds', 'Returning to extras selection...');
    });
  }

  // Add extras button - go to extras selection
  const addExtrasBtn = document.getElementById('add-extras-btn');
  if (addExtrasBtn) {
    addExtrasBtn.addEventListener('click', () => {
      handleEditTransition('quick-adds', 'Adding extras to your order...');
    });
  }

  // Submit button
  document.getElementById('submit-order-btn')?.addEventListener('click', handleOrderSubmit);
}

/**
 * Handle smooth transition when editing from review screen
 */
function handleEditTransition(targetStep, message) {
  const container = document.querySelector('.boxed-meals-section') || document.querySelector('.boxed-meals-flow');
  if (!container) return;

  // Show transition message
  const messageEl = document.createElement('div');
  messageEl.className = 'edit-transition-message';
  messageEl.innerHTML = `
    <div class="transition-content">
      <div class="spinner"></div>
      <p>${message}</p>
    </div>
  `;
  container.appendChild(messageEl);

  // Fade out current view
  container.style.opacity = '0.5';

  // Navigate after brief delay
  setTimeout(() => {
    boxedMealState.currentStep = targetStep;

    // Render appropriate step
    if (targetStep === 'configuration') {
      renderConfigurationStep();
    } else if (targetStep === 'quick-adds') {
      renderQuickAddsStep();
    }

    // Remove message and restore opacity
    messageEl.remove();
    container.style.opacity = '1';

    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, 400);
}

/**
 * Handle order submission
 */
async function handleOrderSubmit() {
  // Validate contact form
  const validation = validateContactForm();
  if (!validation.isValid) {
    alert('Please fill in all required fields:\n\n' + validation.errors.join('\n'));
    return;
  }

  // Collect contact data
  boxedMealState.contact = collectContactData();

  // Disable button during submission
  const submitBtn = document.getElementById('submit-order-btn');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
  }

  // Submit to Firestore
  try {
    await submitBoxedMealOrder(boxedMealState);

    // Show success
    boxedMealState.currentStep = 'success';
    showSuccessMessage();
  } catch (error) {
    console.error('Error submitting order:', error);
    alert('Error submitting order. Please try again or call us at (267) 376-3113');

    // Re-enable button
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Quote Request';
    }
  }
}

/**
 * Submit order to Firestore
 */
async function submitBoxedMealOrder(state) {
  const orderData = {
    type: 'boxed-meals',
    status: 'quote-requested',

    // Box configuration
    template: state.selectedTemplate?.id || 'custom',
    templateName: state.selectedTemplate?.name || 'Custom Box',
    boxCount: state.boxCount,
    configuration: state.currentConfig,
    individualOverrides: state.individualOverrides,

    // Extras
    extras: state.extras,

    // Contact & delivery
    contact: state.contact,

    // Pricing
    pricing: state.pricing,

    // Metadata
    createdAt: serverTimestamp(),
    source: 'web-catering-flow'
  };

  const docRef = await addDoc(collection(db, 'cateringOrders'), orderData);

  console.log('✅ Order submitted with ID:', docRef.id);

  return docRef.id;
}

/**
 * Show success message
 */
function showSuccessMessage() {
  const container = document.querySelector('.boxed-meals-section') || document.querySelector('.boxed-meals-flow');

  if (!container) return;

  const { contact, boxCount, selectedTemplate } = boxedMealState;

  container.innerHTML = `
    <div class="success-message">
      <div class="success-icon">✓</div>
      <h2>Quote Request Received!</h2>
      <p class="success-text">
        Thank you for your interest in our boxed meals catering.
        We'll review your order and contact you within 2 hours with a detailed quote.
      </p>

      <div class="success-details">
        <h3>Order Summary:</h3>
        <ul>
          <li><strong>${boxCount}</strong> boxes of <strong>${selectedTemplate?.name || 'Custom Box'}</strong></li>
          <li>Delivery to: <strong>${contact.deliveryAddress.city}, ${contact.deliveryAddress.state}</strong></li>
          <li>Requested for: <strong>${contact.deliveryDate}</strong> at <strong>${contact.deliveryTime} ${contact.deliveryPeriod}</strong></li>
          <li>Contact: <strong>${contact.name}</strong> (${contact.email})</li>
        </ul>

        <h3>What's Next:</h3>
        <ul>
          <li>We'll review your selections and prepare a detailed quote</li>
          <li>You'll receive pricing and availability via email</li>
          <li>We'll call to finalize details and answer any questions</li>
        </ul>
      </div>

      <div class="success-actions">
        <a href="/" class="btn-primary btn-large">Return Home</a>
        <a href="tel:+12673763113" class="btn-secondary btn-large">Call Us: (267) 376-3113</a>
      </div>
    </div>
  `;
}

// ========================================
// Sample Data (Fallbacks)
// ========================================

function getSampleSauces() {
  // Fallback with all 10 wing sauces (4 dry rubs + 6 wet sauces)
  return [
    // Dry Rubs
    { id: 'classic-lemon-pepper', name: 'Classic Lemon Pepper', category: 'dry-rub', heatLevel: 1, isDryRub: true },
    { id: 'northeast-hot-lemon', name: 'Northeast Hot Lemon', category: 'dry-rub', heatLevel: 2, isDryRub: true },
    { id: 'frankford-cajun', name: 'Frankford Cajun', category: 'dry-rub', heatLevel: 2, isDryRub: true },
    { id: 'garlic-parmesan', name: 'Garlic Parmesan', category: 'dry-rub', heatLevel: 0, isDryRub: true },
    // Wet Sauces
    { id: 'sweet-teriyaki', name: 'Sweet Teriyaki', category: 'signature-sauce', heatLevel: 0, isDryRub: false },
    { id: 'tailgate-bbq', name: 'Tailgate BBQ', category: 'signature-sauce', heatLevel: 0, isDryRub: false },
    { id: 'mild-buffalo', name: 'Mild Buffalo', category: 'signature-sauce', heatLevel: 1, isDryRub: false },
    { id: 'philly-classic-hot', name: 'Philly Classic Hot', category: 'signature-sauce', heatLevel: 3, isDryRub: false },
    { id: 'broad-pattison-burn', name: 'Broad & Pattison Burn', category: 'signature-sauce', heatLevel: 4, isDryRub: false },
    { id: 'grittys-revenge', name: "Gritty's Revenge", category: 'signature-sauce', heatLevel: 5, isDryRub: false }
  ];
}

function getSampleDesserts() {
  // Fallback with all 5 desserts
  return [
    { id: 'marble_pound_cake', name: "Daisy's Marble Pound Cake" },
    { id: 'gourmet_brownies', name: "Daisy's Gourmet Brownies" },
    { id: 'creme_brulee_cheesecake', name: 'Creme Brûlée Cheesecake' },
    { id: 'red_velvet_cake', name: 'Creamy Red Velvet' },
    { id: 'ny_cheesecake', name: 'Classic New York Cheesecake' }
  ];
}

export { boxedMealState };
