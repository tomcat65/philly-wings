/**
 * Boxed Meals Flow V2 - Template Builder + Live Preview
 * Corporate lunch path with template selection and visual configuration
 */

import { collection, query, where, getDocs, getDoc, doc, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase-config.js';
import { cateringStateService } from '../../services/catering-state-service.js';
import { openEditModal, renderBoxConfigInModal, renderContactInModal } from './edit-modal.js';
import { renderTemplateSelector, initTemplateSelector } from './template-selector.js';
import { renderLivePreviewPanel, updatePreviewPanel } from './live-preview-panel.js';
import { renderCondensedDashboard, updateCondensedDashboard, initCondensedDashboard } from './condensed-dashboard.js';
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
import { TAX_RATE, EXTRA_CATEGORY_KEYS, flattenExtras, calculateExtrasSubtotal } from '../../utils/catering-pricing.js';

// Enhanced state management (will be migrated to cateringStateService)
let boxedMealState = {
  currentStep: 'template-selection',  // template-selection | configuration | quick-adds | review-contact | success
  selectedTemplate: null,
  templateIncludedDessert: null,  // Track template's default dessert for pricing baseline
  boxCount: 10,
  currentConfig: {
    wingCount: 6,           // NEW: 6, 10, or 12
    wingType: null,
    wingStyle: null,        // NEW: 'mixed', 'all-drums', 'all-flats' (for bone-in only)
    plantBasedPrep: null,   // NEW: 'fried', 'baked' (for plant-based only)
    sauce: null,            // Single sauce for wingCount === 6
    sauces: [],             // Multiple sauces for wingCount >= 10, format: [{id, count}]
    splitSauces: false,     // Toggle for multi-sauce mode
    sauceOnSide: false,     // NEW: Wet sauce on the side (only for wet sauces)
    noDips: false,          // NEW: Skip dips option
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
    sides: [],           // Premium sides
    desserts: [],        // Desserts (individual/5pack)
    saucesToGo: [],      // Wet sauces to-go (individual/5pack)
    dipsToGo: []         // Dips to-go (individual/5pack)
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
    taxRate: TAX_RATE,
    note: `Final price includes setup fees, staff, delivery distance, tips, and ${Math.round(TAX_RATE * 100)}% tax. We'll provide exact pricing in your quote.`
  },
  // Edit mode flags
  isEditMode: false,           // Are we editing from review?
  editingSection: null,        // 'configuration' | 'extras' | null
  previousStep: null           // Store where we came from for return navigation
};

let hasLoadedBoxedMealsState = false;
let hasSubscribedToBoxedMealsUpdates = false;

function getBoxedMealsWrapper() {
  const wrapper = document.getElementById('boxed-meals-flow');
  if (wrapper) return wrapper;

  const section = document.querySelector('.boxed-meals-section');
  if (section?.parentElement) return section.parentElement;

  const flowSection = document.querySelector('.boxed-meals-flow');
  return flowSection?.parentElement || flowSection || null;
}

function initTemplateStepInteractions() {
  const selectorContainer = document.querySelector('.template-selector');
  if (!selectorContainer) {
    return;
  }

  if (selectorContainer.dataset.initialized === 'true') {
    return;
  }

  initTemplateSelector(handleTemplateSelection);
  selectorContainer.dataset.initialized = 'true';
}

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
    case 'quick-adds':
      // Return placeholder - actual render happens in rerenderBoxedMealsView
      return '<section class="boxed-meals-flow boxed-meals-step-quick-adds"><div class="quick-adds-step"></div></section>';
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

        <!-- Right: Condensed Dashboard (40%) -->
        <div class="configuration-sidebar">
          ${renderCondensedDashboard(boxedMealState, false)}
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

        <!-- Plant-Based Preparation Method (Plant-Based only) -->
        ${boxedMealState.currentConfig.wingType === 'plant-based' ? `
          <div class="config-section" id="config-section-plant-prep">
            ${renderPlantBasedPrepSelector(boxedMealState.currentConfig.plantBasedPrep)}
          </div>
        ` : ''}

        <!-- Sauce Selection -->
        <div class="config-section" id="config-section-sauces">
          ${renderSauceSelector()}
        </div>

        <!-- Dips Selection (Counter-Based with No Dips Option) -->
        <div class="config-section" id="config-section-dips">
          ${renderDipsSelection()}
        </div>

        <!-- Side Selection -->
        <div class="config-section" id="config-section-sides">
          ${renderSideSelector()}
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
 * Plant-Based Preparation Selector (for Plant-Based wings only)
 */
function renderPlantBasedPrepSelector(selectedPrep = 'fried') {
  const prepMethods = [
    {
      id: 'fried',
      label: 'Fried',
      description: 'Crispy & golden',
      icon: '🔥',
      price: 0
    },
    {
      id: 'baked',
      label: 'Baked',
      description: 'Lighter option',
      icon: '✨',
      price: 0  // Same price as fried
    }
  ];

  return `
    <div class="plant-based-prep-selector config-section">
      <div class="section-header">
        <h4 class="section-title">🌱 Preparation Method</h4>
        <p class="section-subtitle">How would you like your plant-based wings prepared?</p>
      </div>

      <div class="prep-method-options">
        ${prepMethods.map(prep => `
          <button
            class="prep-method-btn ${selectedPrep === prep.id ? 'prep-active' : ''}"
            data-plant-prep="${prep.id}"
            type="button">
            <span class="prep-icon">${prep.icon}</span>
            <div class="prep-info">
              <span class="prep-label">${prep.label}</span>
              <span class="prep-description">${prep.description}</span>
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

  // Add "No Sauce" option as first item
  const noSauceOption = {
    id: 'no-sauce',
    name: 'No Sauce',
    description: 'Crispy fried wings - no sauce',
    heatLevel: 0,
    tags: ['Crispy'],
    imageUrl: null,  // Will use placeholder styling
    isDryRub: false,
    category: 'no-sauce',
    isSpecial: true  // Flag for special styling
  };

  const availableSauces = sauceItems.length > 0
    ? [noSauceOption, ...sauceItems]
    : [noSauceOption, ...getSampleSauces()];

  // Check if selected sauce is a wet sauce (not dry rub, not no-sauce)
  const selectedSauceData = availableSauces.find(s => s.id === sauce);
  const isWetSauce = selectedSauceData && !selectedSauceData.isDryRub && sauce !== 'no-sauce';

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
 * Dips selection with "No Dips" toggle option
 */
function renderDipsSelection() {
  const { noDips, dips } = boxedMealState.currentConfig;

  return `
    <div class="dips-selection-wrapper">
      <!-- No Dips Toggle -->
      <div class="no-dips-toggle">
        <label class="toggle-switch">
          <input
            type="checkbox"
            id="no-dips-checkbox"
            ${noDips ? 'checked' : ''}>
          <span class="toggle-slider"></span>
          <span class="toggle-label">Skip dips (wings only)</span>
        </label>
      </div>

      <!-- Dips Counter (hidden when no-dips is checked) -->
      <div class="dips-counter-container" style="${noDips ? 'display: none;' : ''}">
        ${renderDipCounterSelector({
          items: PHOTO_SELECTOR_CONFIGS.dips.items,
          selectedCounts: convertDipsArrayToCounts(dips),
          maxTotal: 2,
          onCountChange: () => {}
        })}
      </div>
    </div>
  `;
}

/**
 * Side selector with actual Firestore data
 * Maps coldSides collection to display format
 */
function renderSideSelector() {
  const sides = boxedMealState.menuData.sides;

  // Firestore ID to display ID mapping
  const firestoreToDisplayId = {
    'miss_vickies_chips': 'chips',
    'sally_sherman_coleslaw': 'coleslaw',
    'sally_sherman_potato_salad': 'potato-salad',
    'veggie_sticks': 'veggie-sticks'
  };

  // Map sides from Firestore with pricing
  const sideItems = sides.map(side => {
    const displayId = firestoreToDisplayId[side.id] || side.id;
    return {
      id: displayId,
      name: side.name,
      description: side.description || '',
      tags: side.dietaryTags || [],
      imageUrl: side.imageUrl || side.images?.hero || null,
      price: side.variants?.[0]?.basePrice || null
    };
  });

  // Fallback to hardcoded config if no Firestore data
  const fallbackItems = PHOTO_SELECTOR_CONFIGS.sides.items;

  return renderPhotoCardSelector({
    category: 'sides',
    items: sideItems.length > 0 ? sideItems : fallbackItems,
    selectedId: boxedMealState.currentConfig.side,
    multiSelect: false,
    onSelect: () => {}
  });
}

/**
 * Dessert selector with actual Firestore data
 */
function renderDessertSelector() {
  const desserts = boxedMealState.menuData.desserts;

  // Use Firestore IDs directly (state already has normalized Firestore IDs)
  const dessertItems = desserts.map(dessert => ({
    id: dessert.id,
    name: dessert.name,
    description: dessert.description || '',
    tags: dessert.tags || [],
    imageUrl: dessert.imageUrl || null,
    price: dessert.variants?.[0]?.basePrice || null
  }));

  // Add "No Dessert" option at the beginning
  const itemsWithSkipOption = [
    {
      id: 'no-dessert',
      name: 'Skip Dessert',
      description: 'Keep it light - no dessert with this box',
      tags: [],
      imageUrl: null,
      price: null
    },
    ...(dessertItems.length > 0 ? dessertItems : getSampleDesserts())
  ];

  return renderPhotoCardSelector({
    category: 'desserts',
    items: itemsWithSkipOption,
    selectedId: boxedMealState.currentConfig.dessert || 'no-dessert',
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
  const isEditing = boxedMealState.isEditMode && boxedMealState.editingSection === 'configuration';

  if (isEditing) {
    // Edit mode: Show "Return to Review" button
    return `
      <div class="config-cta">
        <button
          class="btn-primary btn-large"
          id="return-to-review-btn"
          ${!isComplete ? 'disabled' : ''}>
          ✓ Save & Return to Review
        </button>

        <p class="cta-note">
          ${isComplete
            ? 'Changes will be saved and you\'ll return to the review dashboard.'
            : 'Complete all sections above to save changes'}
        </p>
      </div>
    `;
  }

  // Normal mode: Show "Get Your Free Quote" button
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
export async function initBoxedMealsFlow(options = {}) {
  const { skipStateSync = false } = options;

  // Load state once unless explicitly skipped
  if (!skipStateSync && !hasLoadedBoxedMealsState) {
    await loadStateFromService();
    hasLoadedBoxedMealsState = true;
  } else if (!skipStateSync && hasLoadedBoxedMealsState) {
    await loadStateFromService();
  }

  // Subscribe once for real-time sync
  if (!hasSubscribedToBoxedMealsUpdates) {
    cateringStateService.subscribe('boxed-meals', (newState) => {
      console.log('🔄 Boxed meals state updated from service');
      syncFromService(newState);
    });
    hasSubscribedToBoxedMealsUpdates = true;
  }

  const observedStep = detectCurrentStepFromDOM() || boxedMealState.currentStep;
  console.log('🎬 initBoxedMealsFlow - Step to init:', observedStep);
  console.log('🔍 About to start try block');

  try {
    console.log('🔍 Inside try block, observedStep:', observedStep);
    if (observedStep === 'template-selection') {
      initTemplateStepInteractions();
    } else if (observedStep === 'configuration') {
      console.log('🎯 About to call initConfigurationStep()');
      initConfigurationStep();
      console.log('✅ initConfigurationStep() completed');
    } else if (observedStep === 'quick-adds') {
    // Quick-adds step initializes its own handlers during render
    console.log('ℹ️ Quick-adds step detected - handlers already attached during render');
  } else if (observedStep === 'review-contact') {
    initReviewContactInteractions();
  } else {
    console.warn('⚠️ Unknown step detected:', observedStep, '- attempting template selector init as fallback');
    initTemplateStepInteractions();
  }
  } catch (error) {
    console.error('❌❌❌ ERROR in initBoxedMealsFlow:', error);
    console.error('Stack:', error.stack);
  }

  // Safety net: if template markup exists but wasn't initialized above, attach handlers now.
  initTemplateStepInteractions();
}

/**
 * Load state from catering state service
 * Syncs Firestore/localStorage → module-level state
 */
async function loadStateFromService() {
  try {
    const savedState = await cateringStateService.loadState('boxed-meals');
    if (savedState) {
      syncFromService(savedState);
      console.log('✅ Loaded boxed meals state from service');
    }
  } catch (error) {
    console.warn('Failed to load state from service:', error);
  }
}

/**
 * Sync state from service to module-level state
 * @param {Object} serviceState - State from cateringStateService
 */
function syncFromService(serviceState) {
  Object.assign(boxedMealState, serviceState);
}

function detectCurrentStepFromDOM() {
  if (document.querySelector('.boxed-meals-step-templates')) {
    return 'template-selection';
  }
  if (document.querySelector('.boxed-meals-step-configuration')) {
    return 'configuration';
  }
  if (document.querySelector('.quick-adds-step')) {
    return 'quick-adds';
  }
  if (document.querySelector('.review-dashboard')) {
    return 'review-contact';
  }
  return null;
}

async function rerenderBoxedMealsView(options = {}) {
  const { skipStateSync = true } = options;
  const wrapper = getBoxedMealsWrapper();
  if (!wrapper) return;

  // quick-adds step handles its own DOM manipulation
  if (boxedMealState.currentStep === 'quick-adds') {
    await renderQuickAddsStep();
  } else {
    wrapper.innerHTML = await renderBoxedMealsFlow();
  }
  await initBoxedMealsFlow({ skipStateSync });
}

/**
 * Save current state to service
 * Module-level state → Firestore/localStorage
 */
async function saveStateToService() {
  try {
    await cateringStateService.saveState('boxed-meals', boxedMealState);
  } catch (error) {
    console.warn('Failed to save state to service:', error);
  }
}

/**
 * Debounced auto-save for configuration changes
 * Prevents excessive Firestore writes during rapid user interactions
 */
let autoSaveTimeout = null;
function debouncedAutoSave(delay = 1000) {
  clearTimeout(autoSaveTimeout);
  autoSaveTimeout = setTimeout(async () => {
    await saveStateToService();
    console.log('💾 Auto-saved configuration changes');
  }, delay);
}

/**
 * Initialize configuration step interactions
 */
function initConfigurationStep() {
  console.log('🚀 initConfigurationStep CALLED!');

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

  // Plant-based prep selector (if plant-based wings selected)
  document.querySelectorAll('[data-plant-prep]').forEach(btn => {
    btn.addEventListener('click', () => {
      const prep = btn.dataset.plantPrep;
      handlePlantBasedPrepChange(prep);
    });
  });

  // Sauce on side toggle
  const sauceOnSideToggle = document.getElementById('sauce-on-side-toggle');
  if (sauceOnSideToggle) {
    sauceOnSideToggle.addEventListener('change', (e) => {
      handleSauceOnSideToggle(e.target.checked);
    });
  }

  // No Dips toggle
  const noDipsCheckbox = document.getElementById('no-dips-checkbox');
  const dipsCounterContainer = document.querySelector('.dips-counter-container');
  if (noDipsCheckbox) {
    noDipsCheckbox.addEventListener('change', (e) => {
      const isNoDips = e.target.checked;
      boxedMealState.currentConfig.noDips = isNoDips;

      if (isNoDips) {
        boxedMealState.currentConfig.dips = [];  // Clear dips
        if (dipsCounterContainer) {
          dipsCounterContainer.style.display = 'none';
        }
      } else {
        if (dipsCounterContainer) {
          dipsCounterContainer.style.display = 'block';
        }
      }

      saveStateToService();
      updateCondensedDashboard(boxedMealState);
    });
  }

  // Special instructions
  const instructionsTextarea = document.getElementById('special-instructions-input');

  instructionsTextarea?.addEventListener('input', handleSpecialInstructionsInput);

  // Box count controls - Segmented Control
  const segmentBtns = document.querySelectorAll('.segment-btn');
  const customInput = document.getElementById('custom-count-input');
  const customSegment = document.querySelector('.segment-custom');

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

  console.log('✨ Reached quote button section!');

  // Quote request
  const quoteBtn = document.getElementById('request-quote-btn');
  console.log('🔧 Quote button found:', quoteBtn);
  if (quoteBtn) {
    console.log('✅ Attaching click handler to quote button');
    quoteBtn.addEventListener('click', (e) => {
      console.log('🖱️ QUOTE BUTTON CLICKED!', e);
      handleQuoteRequest();
    });
  } else {
    console.error('❌ Quote button not found in DOM!');
  }

  // Return to review (edit mode)
  document.getElementById('return-to-review-btn')?.addEventListener('click', returnToReview);

  // Initialize condensed dashboard
  initCondensedDashboard();
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
      ...template.defaultConfig,         // Override with template-specific values
      // Normalize dessert ID (templates use hyphens, Firestore uses underscores)
      dessert: template.defaultConfig.dessert
        ? normalizeDessertId(template.defaultConfig.dessert)
        : null
    };

    // 🔑 PRICING FIX: Track which dessert came with template for baseline pricing
    // This allows differential pricing when swapping desserts
    boxedMealState.templateIncludedDessert = boxedMealState.currentConfig.dessert;
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

  // Save state to service
  await saveStateToService();

  await rerenderBoxedMealsView();
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
    // Create temporary container to parse HTML properly
    const temp = document.createElement('div');
    temp.innerHTML = renderConfigurationZone();
    // Extract inner content from the wrapper div
    const newContent = temp.firstElementChild;
    if (newContent) {
      configZone.innerHTML = newContent.innerHTML;
    }
    initConfigurationStep();
  }

  updateCondensedDashboard(boxedMealState);
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

  updateCondensedDashboard(boxedMealState);
  validateAndUpdateCTA();
}

function handleSauceSplitChange({ sauces }) {
  boxedMealState.currentConfig.sauces = sauces;
  updateCondensedDashboard(boxedMealState);
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

  // Set default plant-based prep when plant-based selected, reset when not
  if (wingType === 'plant-based') {
    boxedMealState.currentConfig.plantBasedPrep = boxedMealState.currentConfig.plantBasedPrep || 'fried';
  } else {
    boxedMealState.currentConfig.plantBasedPrep = null;
  }

  // Re-render configuration zone to show/hide wing style/prep selectors
  const configZone = document.querySelector('.configuration-zone');
  if (configZone) {
    // Create temporary container to parse HTML properly
    const temp = document.createElement('div');
    temp.innerHTML = renderConfigurationZone();
    // Extract inner content from the wrapper div
    const newContent = temp.firstElementChild;
    if (newContent) {
      configZone.innerHTML = newContent.innerHTML;
    }
    initConfigurationStep();
  }

  updateCondensedDashboard(boxedMealState);
  validateAndUpdateCTA();
}

function handleWingStyleChange(style) {
  boxedMealState.currentConfig.wingStyle = style;

  // Update UI
  document.querySelectorAll('[data-wing-style]').forEach(btn => {
    btn.classList.toggle('style-active', btn.dataset.wingStyle === style);
  });

  updateCondensedDashboard(boxedMealState);
  console.log('Wing style selected:', style);
}

function handlePlantBasedPrepChange(prep) {
  boxedMealState.currentConfig.plantBasedPrep = prep;

  // Update UI
  document.querySelectorAll('[data-plant-prep]').forEach(btn => {
    btn.classList.toggle('prep-active', btn.dataset.plantPrep === prep);
  });

  updateCondensedDashboard(boxedMealState);
  console.log('Plant-based prep selected:', prep);
}

function handleSauceSelection(sauceId) {
  boxedMealState.currentConfig.sauce = sauceId;

  // Re-render sauce section to show/hide sauce on side toggle
  const sauceSection = document.getElementById('config-section-sauces');
  if (sauceSection) {
    sauceSection.innerHTML = renderSauceSelector();
    initConfigurationStep();
  }

  updateCondensedDashboard(boxedMealState);
  validateAndUpdateCTA();

  // Auto-save with debounce
  debouncedAutoSave();
}

function handleSauceOnSideToggle(checked) {
  boxedMealState.currentConfig.sauceOnSide = checked;
  console.log('Sauce on side:', checked ? 'Yes' : 'No');
  updateCondensedDashboard(boxedMealState);
}

function handleDipsSelection(dipsArray) {
  boxedMealState.currentConfig.dips = dipsArray;
  displayDipValidationFeedback(dipsArray?.length || 0);
  updateCondensedDashboard(boxedMealState);
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
  updateCondensedDashboard(boxedMealState);
  validateAndUpdateCTA();
}

function handleSideSelection(sideId) {
  boxedMealState.currentConfig.side = sideId;
  updateCondensedDashboard(boxedMealState);
  validateAndUpdateCTA();
  debouncedAutoSave();
}

function handleDessertSelection(dessertId) {
  // Normalize ID format (UI may use hyphens, but we store underscores)
  boxedMealState.currentConfig.dessert = normalizeDessertId(dessertId);
  updateCondensedDashboard(boxedMealState);
  validateAndUpdateCTA();
  debouncedAutoSave();
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

  updateCondensedDashboard(boxedMealState);
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
  updateCondensedDashboard(boxedMealState);
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
    const boxConfig = boxedMealState.individualOverrides[i]
      ? cloneBoxConfig(boxedMealState.individualOverrides[i])
      : cloneBoxConfig(boxedMealState.currentConfig);
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

function cloneBoxConfig(config) {
  const source = config
    ? { ...config }
    : { ...(boxedMealState.currentConfig || {}) };
  return {
    ...source,
    dips: Array.isArray(source.dips) ? [...source.dips] : [],
    sauces: Array.isArray(source.sauces) ? source.sauces.map(sauce => ({ ...sauce })) : [],
    boxSpecialInstructions: source.boxSpecialInstructions || ''
  };
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
  const existingOverride = boxedMealState.individualOverrides[boxNumber];
  const baseConfig = cloneBoxConfig(existingOverride || boxedMealState.currentConfig);
  const workingConfig = cloneBoxConfig(baseConfig);

  // Replace accordion content with editable form
  const content = document.querySelector(`.box-accordion-content[data-box-number="${boxNumber}"]`);
  if (content) {
    content.innerHTML = renderIndividualBoxEditor(boxNumber, workingConfig);
    initIndividualBoxEditor(
      boxNumber,
      workingConfig,
      existingOverride ? cloneBoxConfig(existingOverride) : null
    );
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
            { id: 'boneless', label: 'Boneless', icon: '🍗', image: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Fphilly-classic-hot_1920x1080.webp?alt=media&token=1d0f025d-9893-45e7-8df1-7899562b92ee' },
            { id: 'bone-in', label: 'Bone-In', icon: '🍖', image: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Fbroad-pattison-burn_1920x1080.webp?alt=media&token=0efd0118-108e-4207-85da-4d3fe32b8e58' },
            { id: 'plant-based', label: 'Plant-Based', icon: '🌱', image: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Fcauliflower-fried_1920x1080.webp?alt=media&token=ebb8a967-0d76-4b47-b599-11b252ef449f' }
          ].map(type => `
            <button
              class="wing-type-btn ${config.wingType === type.id ? 'active' : ''}"
              data-wing-type="${type.id}"
              data-box="${boxNumber}"
              type="button">
              <img src="${type.image}" alt="${type.label}" class="wing-type-image">
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
function initIndividualBoxEditor(boxNumber, config, originalConfig = null) {
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

      // Persist override state
      boxedMealState.individualOverrides[boxNumber] = cloneBoxConfig(config);

      // Export state to window for pricing panel access
      window.boxedMealState = boxedMealState;

      // Update pricing panel to show itemized pricing
      updateCondensedDashboard(boxedMealState);

      boxedMealState.lastSavedBoxNumber = boxNumber;

      // Persist to service (debounced)
      debouncedAutoSave();

      // Refresh the accordion to show updated summary
      generateIndividualBoxes();
    });
  }

  // Cancel button
  const cancelBtn = editorRoot.querySelector(`.btn-cancel-edit[data-box="${boxNumber}"]`);
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      if (originalConfig) {
        boxedMealState.individualOverrides[boxNumber] = cloneBoxConfig(originalConfig);
      } else {
        delete boxedMealState.individualOverrides[boxNumber];
      }

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

  // Persist reset
  debouncedAutoSave();

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
  await rerenderBoxedMealsView();
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
async function handleQuoteRequest() {
  if (!isConfigurationComplete()) return;

  console.log('🚀 handleQuoteRequest: Starting transition to quick-adds');
  console.log('📍 Current scroll position:', window.scrollY);

  // Transition to quick-adds step
  boxedMealState.currentStep = 'quick-adds';
  await renderQuickAddsStep();

  console.log('✅ renderQuickAddsStep: Completed');

  // Scroll to the boxed-meals-flow container to show the top of quick-adds content
  requestAnimationFrame(() => {
    const boxedMealsContainer = document.getElementById('boxed-meals-flow');
    console.log('🔍 Looking for boxed-meals-flow container:', boxedMealsContainer);

    if (boxedMealsContainer) {
      const rect = boxedMealsContainer.getBoundingClientRect();
      console.log('📐 Container position:', { top: rect.top, bottom: rect.bottom });
      console.log('📍 Before scroll:', window.scrollY);

      // Scroll container to top of viewport
      boxedMealsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });

      setTimeout(() => {
        console.log('📍 After scroll:', window.scrollY);
      }, 500);
    } else {
      console.error('❌ Boxed meals container not found!');
    }
  });
}

/**
 * Return to review dashboard after editing
 * Clears edit mode flags and navigates back
 */
async function returnToReview() {
  // Clear edit mode flags
  boxedMealState.isEditMode = false;
  boxedMealState.editingSection = null;
  boxedMealState.previousStep = null;

  // Save state to service
  await saveStateToService();

  // Navigate to review-contact step
  boxedMealState.currentStep = 'review-contact';
  await renderReviewContactStep();

  // Show success feedback
  console.log('✓ Changes saved, returned to review dashboard');
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

  // Dessert is optional (Veggie Delight template has no dessert)
  return wingCount && wingType && sauceComplete && dips?.length === 2 && side;
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
    // 1. Fetch prepared sides from coldSides collection
    const coldSidesQuery = query(collection(db, 'coldSides'), where('active', '==', true));
    const coldSidesSnapshot = await getDocs(coldSidesQuery);
    const preparedSides = coldSidesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // 2. Fetch chips from menuItems collection (query by id field, not document ID)
    const chipsQuery = query(
      collection(db, 'menuItems'),
      where('id', '==', 'miss_vickies_chips'),
      where('active', '==', true)
    );
    const chipsSnapshot = await getDocs(chipsQuery);

    // 3. Transform chips for boxed meals context (override price to $0)
    let chipsForBoxedMeals = null;
    if (!chipsSnapshot.empty) {
      const chipsDoc = chipsSnapshot.docs[0];
      const chipsData = chipsDoc.data();
      chipsForBoxedMeals = {
        id: chipsDoc.id,
        ...chipsData,
        variants: chipsData.variants ? [{
          ...chipsData.variants[0],
          basePrice: 0  // Override: chips included in $12.50 base box price
        }] : [{ basePrice: 0 }]
      };
    }

    // 4. Merge chips + prepared sides (chips first as it's the base option)
    return chipsForBoxedMeals
      ? [chipsForBoxedMeals, ...preparedSides]
      : preparedSides;

  } catch (error) {
    console.error('Error fetching sides:', error);
    return [];
  }
}

async function fetchDesserts() {
  try {
    const q = query(
      collection(db, 'desserts'),
      where('active', '==', true),
      orderBy('sortOrder', 'asc')
    );
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

function formatPackSize(packSize) {
  const formats = {
    'individual': 'Individual',
    '5pack': '5-Pack',
    'family': 'Family Pack'
  };
  return formats[packSize] || packSize;
}

// ========================================
// Quick-Adds Step Functions
// ========================================

/**
 * Render quick-adds/extras step
 */
async function renderQuickAddsStep() {
  const wrapper = getBoxedMealsWrapper();
  if (!wrapper) {
    console.error('Container not found');
    return;
  }

  // Fetch ALL add-ons (boxed meals = premium tier)
  const addOns = await fetchAllAddOns();

  wrapper.innerHTML = `
    <section class="boxed-meals-flow boxed-meals-step-quick-adds">
      <div class="quick-adds-container">
        <!-- Left: Extras Selection (60%) -->
        <div class="quick-adds-main">
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
            ${renderMasonryCategory('Sauces To-Go', '🌶️', addOns.saucesToGo, false)}
            ${renderMasonryCategory('Dips To-Go', '🥫', addOns.dipsToGo, false)}
          </div>

          <!-- Continue/Return Button (moved to bottom of left panel) -->
          <div class="quick-adds-cta">
            ${boxedMealState.isEditMode && boxedMealState.editingSection === 'extras' ? `
              <button class="btn-primary btn-large" id="return-to-review-from-extras-btn">
                ✓ Save & Return to Review
              </button>
            ` : `
              <button class="btn-primary btn-large" id="continue-with-extras-btn">
                Continue to Review
              </button>
            `}
          </div>
        </div>

        <!-- Right: Condensed Dashboard (40%) -->
        <div class="quick-adds-sidebar">
          ${renderCondensedDashboard(boxedMealState, false)}
        </div>
      </div>
    </section>
  `;

  initQuickAddsInteractions(addOns);

  // Scroll already handled in handleQuoteRequest before content change
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
  // Check if item has pack variants (multiple pack sizes)
  if (item.hasVariants && item.variants) {
    return renderPackVariantCard(item, featured);
  }

  // Regular single-variant card
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
 * Render pack variant card with multiple pack size options (Option B: Compact Rows)
 * @param {Object} item - Item with hasVariants:true and variants object
 * @param {boolean} featured - Whether card should be featured size
 */
function renderPackVariantCard(item, featured = false) {
  const cardClass = featured ? 'masonry-card pack-variant-card featured' : 'masonry-card pack-variant-card';
  const heatIndicator = item.heatLevel ? `<span class="heat-level">${'🌶️'.repeat(item.heatLevel)}</span>` : '';

  // Get variant pack sizes (individual, 5pack, etc.)
  const variants = Object.entries(item.variants || {});
  if (variants.length === 0) return ''; // Safety check

  return `
    <div class="${cardClass}" data-source-id="${item.sourceId}" data-category="${item.category}">
      <div class="masonry-card-image">
        ${item.imageUrl ? `<img src="${item.imageUrl}" alt="${item.displayName}" loading="lazy">` : getIconForCategory(item.category)}
      </div>
      <div class="masonry-card-content">
        <div class="masonry-card-name">${item.displayName || item.name} ${heatIndicator}</div>
        <div class="masonry-card-desc">${item.description || ''}</div>

        <!-- Pack Variant Selectors (Option B: Compact Rows) -->
        <div class="pack-variant-selectors">
          ${variants.map(([packSize, variant]) => `
            <div class="variant-row" data-variant="${packSize}" data-variant-id="${variant.id}">
              <div class="variant-label">
                <span class="variant-name">${formatPackSize(packSize)}</span>
                <span class="variant-price">$${(variant.price || 0).toFixed(2)}</span>
              </div>
              <div class="variant-qty">
                <button class="qty-btn qty-minus" data-variant-id="${variant.id}" data-variant-price="${variant.price || 0}">−</button>
                <span class="qty-display" data-variant-id="${variant.id}">0</span>
                <button class="qty-btn qty-plus" data-variant-id="${variant.id}" data-variant-price="${variant.price || 0}">+</button>
              </div>
            </div>
          `).join('')}
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

  // Hydrate selectedItems from existing state (critical for edit mode)
  if (boxedMealState.extras) {
    const categoryMap = {
      'quickAdds': 'quick-adds',
      'hotBeverages': 'hot-beverages',
      'beverages': 'beverages',
      'salads': 'salads',
      'sides': 'sides',
      'desserts': 'desserts',
      'saucesToGo': 'sauces-to-go',
      'dipsToGo': 'dips-to-go'
    };

    // Iterate through all extras categories
    Object.entries(boxedMealState.extras).forEach(([stateCategory, items]) => {
      if (Array.isArray(items)) {
        items.forEach(item => {
          if (item.id && item.quantity > 0) {
            selectedItems.set(item.id, {
              name: item.name,
              price: item.price,
              category: stateCategory,
              quantity: item.quantity
            });

            // Update UI to reflect existing selection
            const card = document.querySelector(`.masonry-card[data-addon-id="${item.id}"]`);
            if (card) {
              const addBtn = card.querySelector('.quick-add-btn');
              const qtyControls = card.querySelector('.quantity-controls');
              const qtyDisplay = card.querySelector('.qty-display');

              if (addBtn) addBtn.style.display = 'none';
              if (qtyControls) qtyControls.style.display = 'flex';
              if (qtyDisplay) qtyDisplay.textContent = item.quantity;
            }
          }
        });
      }
    });

    // Update sticky cart with hydrated items
    updateStickyCart(selectedItems);
  }

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
        'desserts': 'desserts',
        'sauces-to-go': 'saucesToGo',
        'dips-to-go': 'dipsToGo'
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

  // Pack Variant Quantity Handlers (for Option B compact rows)
  // These handle the +/- buttons inside pack-variant-card elements
  document.querySelectorAll('.pack-variant-card .qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const variantId = btn.dataset.variantId;
      const price = parseFloat(btn.dataset.variantPrice);
      const variantRow = btn.closest('.variant-row');
      const packSize = variantRow.dataset.variant;
      const card = btn.closest('.pack-variant-card');
      const displayName = card.querySelector('.masonry-card-name').textContent.trim().replace(/🌶️/g, '').trim();
      const category = card.dataset.category;
      const qtyDisplay = variantRow.querySelector(`.qty-display[data-variant-id="${variantId}"]`);

      // Map category to state key
      const categoryMap = {
        'quick-adds': 'quickAdds',
        'hot-beverages': 'hotBeverages',
        'beverages': 'beverages',
        'salads': 'salads',
        'sides': 'sides',
        'desserts': 'desserts',
        'sauces-to-go': 'saucesToGo',
        'dips-to-go': 'dipsToGo'
      };
      const stateCategory = categoryMap[category] || 'quickAdds';

      // Construct item name with pack size
      const itemName = `${displayName} (${formatPackSize(packSize)})`;

      // Handle increment
      if (btn.classList.contains('qty-plus')) {
        if (!selectedItems.has(variantId)) {
          selectedItems.set(variantId, { name: itemName, price, category: stateCategory, quantity: 1 });
          qtyDisplay.textContent = '1';
        } else {
          const item = selectedItems.get(variantId);
          item.quantity = Math.min(99, item.quantity + 1);
          qtyDisplay.textContent = item.quantity;
        }
      }

      // Handle decrement
      if (btn.classList.contains('qty-minus')) {
        if (selectedItems.has(variantId)) {
          const item = selectedItems.get(variantId);
          item.quantity = Math.max(0, item.quantity - 1);

          if (item.quantity === 0) {
            selectedItems.delete(variantId);
            qtyDisplay.textContent = '0';
          } else {
            qtyDisplay.textContent = item.quantity;
          }
        }
      }

      updateStickyCart(selectedItems);
    });
  });

  // Hydrate pack variant cards from state (for edit mode)
  if (boxedMealState.extras) {
    Object.entries(boxedMealState.extras).forEach(([stateCategory, items]) => {
      if (Array.isArray(items)) {
        items.forEach(item => {
          if (item.id && item.quantity > 0) {
            // Find the variant display in pack variant cards
            const qtyDisplay = document.querySelector(`.pack-variant-card .qty-display[data-variant-id="${item.id}"]`);
            if (qtyDisplay) {
              qtyDisplay.textContent = item.quantity;

              // Also update the selectedItems Map
              selectedItems.set(item.id, {
                name: item.name,
                price: item.price,
                category: stateCategory,
                quantity: item.quantity
              });
            }
          }
        });
      }
    });

    // Update sticky cart with hydrated pack variants
    updateStickyCart(selectedItems);
  }

  // Back button
  document.getElementById('back-to-config-btn')?.addEventListener('click', async () => {
    boxedMealState.currentStep = 'configuration';
    await rerenderBoxedMealsView();
  });

  // Skip button
  document.getElementById('skip-extras-btn')?.addEventListener('click', async () => {
    // Clear all extras (match structure from collectExtrasSelections)
    boxedMealState.extras = {
      quickAdds: [],
      beverages: [],
      hotBeverages: [],
      salads: [],
      sides: [],
      desserts: [],
      saucesToGo: [],
      dipsToGo: []
    };
    boxedMealState.currentStep = 'review-contact';
    await renderReviewContactStep();
  });

  // Continue button
  document.getElementById('continue-with-extras-btn')?.addEventListener('click', async () => {
    collectExtrasSelections(selectedItems);
    boxedMealState.currentStep = 'review-contact';
    await renderReviewContactStep();
  });

  // Return to review button (edit mode)
  document.getElementById('return-to-review-from-extras-btn')?.addEventListener('click', async () => {
    collectExtrasSelections(selectedItems);
    await returnToReview();
  });

  // Initialize condensed dashboard
  initCondensedDashboard();
}

/**
 * Update sticky cart summary and condensed dashboard
 */
function updateStickyCart(selectedItems) {
  // Update extras in state for dashboard
  collectExtrasSelections(selectedItems);

  // Update condensed dashboard with new state
  updateCondensedDashboard(boxedMealState);
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
    desserts: [],
    saucesToGo: [],
    dipsToGo: []
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
      sides: [],
      desserts: [],
      saucesToGo: [],
      dipsToGo: []
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
  const wrapper = getBoxedMealsWrapper();
  if (!wrapper) {
    console.error('Container not found');
    return;
  }

  // Calculate pricing
  const pricing = calculatePricing();
  boxedMealState.pricing = pricing;

  wrapper.innerHTML = `
    <section class="boxed-meals-flow boxed-meals-step-review-contact">
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
              <li>${boxedMealState.currentConfig.wingCount}pc ${formatWingType(boxedMealState.currentConfig.wingType)} Wings${
                boxedMealState.currentConfig.wingType === 'plant-based' && boxedMealState.currentConfig.plantBasedPrep
                  ? ` (${boxedMealState.currentConfig.plantBasedPrep === 'fried' ? 'Fried' : 'Baked'})`
                  : boxedMealState.currentConfig.wingType === 'bone-in' && boxedMealState.currentConfig.wingStyle
                    ? ` (${boxedMealState.currentConfig.wingStyle === 'mixed' ? 'Mixed' : boxedMealState.currentConfig.wingStyle === 'all-drums' ? 'All Drums' : 'All Flats'})`
                    : ''
              }</li>
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

        <!-- CONTACT FORM SECTION -->
        <div class="detail-section">
          <div class="section-header">
            <div class="section-title">Delivery & Contact Details</div>
          </div>
          ${renderContactForm(boxedMealState.contact)}
        </div>

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
    </section>
  `;

  initReviewContactInteractions();

  // Scroll to top of boxed-meals-flow container to show review content from the beginning
  requestAnimationFrame(() => {
    const boxedMealsContainer = document.getElementById('boxed-meals-flow');
    console.log('🔍 [Review] Looking for boxed-meals-flow container:', boxedMealsContainer);

    if (boxedMealsContainer) {
      const rect = boxedMealsContainer.getBoundingClientRect();
      console.log('📐 [Review] Container position:', { top: rect.top, bottom: rect.bottom });
      console.log('📍 [Review] Before scroll:', window.scrollY);

      // Scroll container to top of viewport
      boxedMealsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });

      setTimeout(() => {
        console.log('📍 [Review] After scroll:', window.scrollY);
      }, 500);
    } else {
      console.error('❌ [Review] Boxed meals container not found!');
    }
  });
}

/**
 * Render sidebar breakdown
 */
function renderSidebarBreakdown(pricing) {
  const { extras } = boxedMealState;
  const taxLabel = `Tax (${Math.round(TAX_RATE * 100)}%)`;
  const sumCategory = (items = []) => (Array.isArray(items) ? items.reduce((sum, item) => {
    const unit = Number(item?.price) || 0;
    const qty = Number(item?.quantity) || 0;
    return sum + unit * (qty || 1);
  }, 0) : 0);

  // Calculate category totals
  const beveragesTotal = sumCategory([...(extras.beverages || []), ...(extras.hotBeverages || [])]);
  const dessertsTotal = sumCategory(extras.desserts);
  const othersTotal = sumCategory([
    ...(extras.quickAdds || []),
    ...(extras.salads || []),
    ...(extras.sides || []),
    ...(extras.saucesToGo || []),
    ...(extras.dipsToGo || [])
  ]);

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
        <div class="label"><span>💵</span> ${taxLabel}</div>
        <div class="amount">$${(pricing.subtotal * TAX_RATE).toFixed(2)}</div>
      </div>
    </div>
  `;
}

/**
 * Render extras details for panel
 */
function renderExtrasDetails() {
  const { extras } = boxedMealState;
  const flattenedExtras = flattenExtras(extras);

  if (flattenedExtras.length === 0) {
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

  const categoryLabels = {
    quickAdds: 'Quick-Adds',
    beverages: 'Cold Beverages',
    hotBeverages: 'Hot Beverages',
    salads: 'Salads',
    sides: 'Premium Sides',
    desserts: 'Desserts',
    saucesToGo: 'Sauces To-Go',
    dipsToGo: 'Dips To-Go'
  };

  const categories = EXTRA_CATEGORY_KEYS
    .map(key => ({
      label: categoryLabels[key] || key,
      items: Array.isArray(extras[key]) ? extras[key] : []
    }))
    .filter(category => category.items.length > 0);

  const extrasTotal = calculateExtrasSubtotal(extras);

  return `
    <div class="detail-section">
      <div class="section-header">
        <div class="section-title">Extras & Add-Ons</div>
        <button class="edit-btn" id="edit-extras-btn">✏️ Edit</button>
      </div>

      <div class="extras-grid">
        ${categories.map(({ label, items }) => `
          <div class="category-group">
            <div class="category-title">${label}</div>
            ${items.map(item => {
              const quantity = item.quantity || 1;
              const unitPrice = Number(item.price) || 0;
              const displayName = item.name || item.id || 'Extra Item';
              return `
                <div class="extra-item">
                  <div class="item-info">
                    <div class="item-name">✓ ${displayName}</div>
                    <div class="item-calc">${quantity} × $${unitPrice.toFixed(2)}</div>
                  </div>
                  <div class="item-price">$${(unitPrice * quantity).toFixed(2)}</div>
                </div>
              `;
            }).join('')}
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
 * Helper: Get side price from menuData
 */
function getSidePrice(sideId) {
  if (!sideId || !boxedMealState.menuData.sides) return null;

  // Map display ID back to Firestore ID
  const displayToFirestoreId = {
    'chips': 'miss_vickies_chips',
    'coleslaw': 'sally_sherman_coleslaw',
    'potato-salad': 'sally_sherman_potato_salad'
  };

  const firestoreId = displayToFirestoreId[sideId] || sideId;
  const side = boxedMealState.menuData.sides.find(s => s.id === firestoreId);

  return side?.variants?.[0]?.basePrice || null;
}

/**
 * Helper: Normalize dessert ID (map template IDs to Firestore IDs)
 * Templates use hyphens and may have different names than Firestore
 */
function normalizeDessertId(dessertId) {
  if (!dessertId) return null;

  // Map template IDs to exact Firestore document IDs
  const templateToFirestoreId = {
    'gourmet-brownie': 'gourmet_brownies',
    'ny-cheesecake': 'ny_cheesecake',
    'creme-brulee-cheesecake': 'creme_brulee_cheesecake',
    'marble-pound-cake': 'marble_pound_cake',
    'red-velvet-cake': 'red_velvet_cake',
    'no-dessert': 'no-dessert'  // Keep this as-is
  };

  return templateToFirestoreId[dessertId] || dessertId.replace(/-/g, '_');
}

/**
 * Helper: Get dessert price from menuData
 */
function getDessertPrice(dessertId) {
  if (!dessertId || !boxedMealState.menuData.desserts) return null;

  // Normalize ID format (templates use hyphens, Firestore uses underscores)
  const normalizedId = normalizeDessertId(dessertId);
  const dessert = boxedMealState.menuData.desserts.find(d => d.id === normalizedId);
  return dessert?.variants?.[0]?.basePrice || null;
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

  // Side price adjustment (database-driven)
  if (config.side) {
    const sidePrice = getSidePrice(config.side);
    if (sidePrice) {
      // Base side is chips at $0 (included), so only charge differential
      const baseSidePrice = 0; // Chips included in base price
      price += (sidePrice - baseSidePrice);
    }
  }

  // Dessert price adjustment (database-driven)
  if (config.dessert && config.dessert !== 'no-dessert') {
    const dessertPrice = getDessertPrice(config.dessert);
    if (dessertPrice !== null) {
      // 🔑 PRICING FIX: Use template's included dessert as baseline for differential pricing
      // This ensures the base price ($12.50) includes the template's default dessert
      // and only charges differential when swapping to a different dessert
      const templateDessert = boxedMealState.templateIncludedDessert;
      const baseDessertPrice = (templateDessert && templateDessert !== 'no-dessert')
        ? (getDessertPrice(templateDessert) || 0)
        : 0;

      price += (dessertPrice - baseDessertPrice);
    }
  }

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
  const extrasSubtotal = calculateExtrasSubtotal(extras);
  const subtotal = boxesSubtotal + extrasSubtotal;

  return {
    boxesSubtotal,
    extrasSubtotal,
    customizedBoxCount,
    subtotal,
    estimatedTotal: subtotal * (1 + TAX_RATE), // Tax estimate
    taxRate: TAX_RATE,
    note: `Final price includes setup fees, staff, delivery distance, tips, and ${Math.round(TAX_RATE * 100)}% tax. We'll provide exact pricing in your quote.`
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
    captureContactDraft();
    handleEditTransition('quick-adds', 'Returning to extras selection...');
  });

  // Edit config button - navigate back to configuration step
  document.getElementById('edit-config-btn')?.addEventListener('click', () => {
    captureContactDraft();
    boxedMealState.isEditMode = true;
    boxedMealState.editingSection = 'configuration';
    boxedMealState.previousStep = 'review-contact';
    handleEditTransition('configuration', 'Editing box configuration...');
  });

  // Edit extras button - navigate back to extras step
  const editExtrasBtn = document.getElementById('edit-extras-btn');
  if (editExtrasBtn) {
    editExtrasBtn.addEventListener('click', () => {
      captureContactDraft();
      boxedMealState.isEditMode = true;
      boxedMealState.editingSection = 'extras';
      boxedMealState.previousStep = 'review-contact';
      handleEditTransition('quick-adds', 'Editing order extras...');
    });
  }

  // Add extras button - go to extras selection
  const addExtrasBtn = document.getElementById('add-extras-btn');
  if (addExtrasBtn) {
    addExtrasBtn.addEventListener('click', () => {
      captureContactDraft();
      handleEditTransition('quick-adds', 'Adding extras to your order...');
    });
  }

  // Submit button
  document.getElementById('submit-order-btn')?.addEventListener('click', handleOrderSubmit);
}

function captureContactDraft() {
  try {
    boxedMealState.contact = collectContactData();
    debouncedAutoSave();
  } catch (error) {
    console.warn('Could not collect contact data:', error);
  }
}

/**
 * Handle smooth transition when editing from review screen
 */
function handleEditTransition(targetStep, message) {
  const hostSection = document.querySelector('.boxed-meals-flow');
  const container = hostSection || getBoxedMealsWrapper();
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
  setTimeout(async () => {
    boxedMealState.currentStep = targetStep;

    await rerenderBoxedMealsView();

    // Remove message and restore opacity
    messageEl.remove();
    container.style.opacity = '1';

    // Scroll to wrapper (not page top) to show content from beginning
    if (container) {
      container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
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

  // Save state with contact info
  await saveStateToService();

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
  const wrapper = getBoxedMealsWrapper();
  if (!wrapper) return;

  const { contact, boxCount, selectedTemplate } = boxedMealState;

  wrapper.innerHTML = `
    <section class="boxed-meals-flow boxed-meals-step-success">
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
    </section>
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
