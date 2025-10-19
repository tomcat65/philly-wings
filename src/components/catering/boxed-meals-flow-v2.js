/**
 * Boxed Meals Flow V2 - Template Builder + Live Preview
 * Corporate lunch path with template selection and visual configuration
 */

import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
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

// Enhanced state management
let boxedMealState = {
  currentStep: 'template-selection',  // template-selection | configuration | review
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

  customInput?.addEventListener('input', (e) => {
    const count = parseInt(e.target.value) || 10;
    updateBoxCount(count);
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
 * Handle quote request
 */
function handleQuoteRequest() {
  if (!isConfigurationComplete()) return;

  // TODO: Submit to Firestore
  console.log('Quote request:', {
    template: boxedMealState.selectedTemplate?.name,
    boxCount: boxedMealState.boxCount,
    config: boxedMealState.currentConfig
  });

  alert(`Quote request submitted!\n\n${boxedMealState.boxCount} boxes of ${boxedMealState.selectedTemplate?.name || 'Custom Box'}\n\nWe'll contact you within 1 business day.`);
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
