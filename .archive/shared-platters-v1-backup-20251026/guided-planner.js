/**
 * Guided Catering Planner - Wizard-style event planning experience
 * Collects structured data for future direct ordering flow
 */

import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../firebase-config.js';
import { initWizardInteractions } from './wizard-interactions.js';
import { WingCustomization } from './wing-customization.js';
import { getAllAddOnsSplitByCategory } from '../../services/catering-addons-service.js';
import {
  getRemovalCredit,
  getAddOnCost,
  calculateModificationPricing,
  formatPrice,
  formatPriceDelta
} from '../../constants/modification-pricing.js';
import {
  renderPhotoCardSelector,
  initPhotoCardSelector
} from './photo-card-selector.js';

// Wizard state management
let wizardState = {
  currentStep: 1,
  totalSteps: 7, // Updated from 6 to 7 to include new Step 5
  eventDetails: {
    guestCount: null,
    dietaryNeeds: 'none', // 'none' | 'vegetarian' | 'vegan'
    eventDate: null,
    eventTime: null
  },
  selectedPackage: null,
  wingDistribution: null, // SHARD-2: Wing customization data
  sauceAllocations: [],
  skipAllSauces: false,
  sauces: [],
  dipOptions: [],
  sauceSelections: [],
  customizedIncludes: null, // NEW: Customized package items (chips, dips, sides, salads, desserts, beverages)
  addOns: [],
  contactInfo: {}
};

// Wing customization component instance (SHARD-2)
let wingCustomizationComponent = null;

// Firestore data cache for photo cards
let firestoreDataCache = {
  coldSides: [],
  desserts: [],
  salads: [],
  beverages: []
};

/**
 * Fetch Firestore data WHEN Step 5 is rendered (direct fetch, no cache)
 * Returns complete Firestore objects ready for photo card selector
 */
async function fetchStep5FirestoreData() {
  try {
    console.log('🔄 Fetching fresh Firestore data for Step 5...');

    const [coldSides, salads, desserts, beverages] = await Promise.all([
      // Fetch cold sides
      getDocs(query(
        collection(db, 'coldSides'),
        where('active', '==', true),
        orderBy('sortOrder', 'asc')
      )),

      // Fetch salads
      getDocs(query(
        collection(db, 'freshSalads'),
        where('active', '==', true),
        orderBy('sortOrder', 'asc')
      )),

      // Fetch desserts
      getDocs(query(
        collection(db, 'desserts'),
        where('active', '==', true),
        orderBy('sortOrder', 'asc')
      )),

      // Fetch beverages from menuItems
      getDocs(query(
        collection(db, 'menuItems'),
        where('category', '==', 'drinks'),
        where('active', '==', true)
      ))
    ]);

    const data = {
      coldSides: coldSides.docs.map(doc => ({ id: doc.id, ...doc.data() })),
      salads: salads.docs.map(doc => ({ id: doc.id, ...doc.data() })),
      desserts: desserts.docs.map(doc => ({ id: doc.id, ...doc.data() })),
      beverages: beverages.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    };

    console.log('✅ Step 5 Firestore data loaded:', {
      coldSides: data.coldSides.length,
      salads: data.salads.length,
      desserts: data.desserts.length,
      beverages: data.beverages.length
    });

    return data;
  } catch (error) {
    console.error('❌ Error fetching Step 5 Firestore data:', error);
    return {
      coldSides: [],
      salads: [],
      desserts: [],
      beverages: []
    };
  }
}

/**
 * SHARD 1: Item Name Mapping Functions
 * Map package item names to pricing object keys
 */

/**
 * Map dessert names from package data to pricing object keys
 * @param {string} dessertName - Dessert name from package includes
 * @returns {string} Standardized dessert name for pricing lookup
 */
function mapDessertName(dessertName) {
  const dessertMap = {
    // Daisy's Bakery (high-margin)
    'Marble Pound Cake': 'Marble Pound Cake 5-Pack',
    'Gourmet Brownies': 'Gourmet Brownies 5-Pack',

    // Chef's Quality (medium-margin)
    'Red Velvet Cake': 'Red Velvet Cake 5-Pack',
    'Crème Brûlée Cheesecake': 'Crème Brûlée Cheesecake 5-Pack',

    // Bindi Premium (low-margin)
    'NY Cheesecake': 'NY Cheesecake 5-Pack'
  };

  // Try direct match first
  if (dessertMap[dessertName]) {
    return dessertMap[dessertName];
  }

  // Try partial match (case-insensitive)
  const lowerName = dessertName.toLowerCase();
  for (const [key, value] of Object.entries(dessertMap)) {
    if (lowerName.includes(key.toLowerCase())) {
      return value;
    }
  }

  console.warn(`⚠️ Unknown dessert name for pricing: ${dessertName}`);
  return dessertName;
}

/**
 * Map package item to pricing object key
 * @param {string} type - Category type (chips, dips, coldSides, salads, desserts, hotBeverages, coldBeverages)
 * @param {Object|string} item - Package item data (can be string or object with .item property)
 * @returns {Object|null} {category, itemName} for pricing lookup, or null if unmapped
 */
function mapItemToPricingKey(type, item) {
  // Extract item name from object or use string directly
  const itemName = typeof item === 'string' ? item : (item?.item || item?.name || '');

  const mappings = {
    chips: () => ({
      category: 'chips',
      itemName: "Miss Vickie's Chips 5-Pack"
    }),

    dips: () => ({
      category: 'dips',
      itemName: "Dip 5-Pack"
    }),

    coldSides: () => ({
      category: 'coldSides',
      itemName: itemName // Direct match: "Family Coleslaw", "Family Potato Salad", "Large Veggie Sticks Tray"
    }),

    salads: () => ({
      category: 'salads',
      itemName: itemName.includes('Caesar')
        ? "Caesar Salad (Family Size)"
        : "Spring Mix Salad (Family Size)"
    }),

    desserts: () => ({
      category: 'desserts',
      itemName: mapDessertName(itemName)
    }),

    hotBeverages: () => ({
      category: 'hotBeverages',
      itemName: itemName // Direct match: "Lavazza Coffee 96oz", "Ghirardelli Hot Chocolate 96oz", etc.
    }),

    coldBeverages: () => ({
      category: 'coldBeverages',
      itemName: itemName // Direct match: "Boxed Iced Tea 96oz", "Bottled Water 24-pack", etc.
    })
  };

  if (!mappings[type]) {
    console.warn(`⚠️ Unknown item type for pricing: ${type}`);
    return null;
  }

  return mappings[type]();
}

/**
 * PHOTO CARD ENRICHMENT: Match package items with Firestore data for images
 */

/**
 * Enrich cold side with Firestore data (image, description, tags)
 */
function enrichColdSideWithFirestoreData(packageItem) {
  const itemName = packageItem.item || packageItem;

  // Find matching Firestore item
  const match = firestoreDataCache.coldSides.find(fsItem =>
    fsItem.name.toLowerCase().includes(itemName.toLowerCase()) ||
    itemName.toLowerCase().includes(fsItem.name.toLowerCase())
  );

  const pricingKey = mapItemToPricingKey('coldSides', itemName);

  return {
    id: match?.id || itemName.toLowerCase().replace(/\s+/g, '-'),
    name: itemName,
    description: match?.description || "Delicious and fresh",
    imageUrl: match?.imageUrl || null,
    price: null, // Displayed in delta, not card
    badge: itemName.toLowerCase().includes('coleslaw') ? 'Popular' : null,
    tags: match?.dietaryTags || [],
    quantity: packageItem.quantity || 1,
    pricingCategory: pricingKey?.category,
    pricingItemName: pricingKey?.itemName
  };
}

/**
 * Enrich salad with Firestore data
 */
function enrichSaladWithFirestoreData(packageItem) {
  const itemName = packageItem.item || packageItem;

  const match = firestoreDataCache.salads.find(fsItem =>
    fsItem.name.toLowerCase().includes('caesar') && itemName.toLowerCase().includes('caesar') ||
    fsItem.name.toLowerCase().includes('spring') && itemName.toLowerCase().includes('spring')
  );

  const pricingKey = mapItemToPricingKey('salads', itemName);

  return {
    id: match?.id || itemName.toLowerCase().replace(/\s+/g, '-'),
    name: itemName,
    description: match?.description || "Fresh and crisp",
    imageUrl: match?.imageUrl || null,
    price: null,
    badge: itemName.toLowerCase().includes('caesar') ? 'Best Value' : null,
    tags: match?.dietaryTags || ['vegetarian'],
    quantity: packageItem.quantity || 1,
    pricingCategory: pricingKey?.category,
    pricingItemName: pricingKey?.itemName
  };
}

/**
 * Enrich dessert with Firestore data
 */
function enrichDessertWithFirestoreData(packageItem) {
  const itemName = packageItem.item || packageItem;

  const match = firestoreDataCache.desserts.find(fsItem => {
    const fsName = fsItem.name.toLowerCase();
    const pkgName = itemName.toLowerCase();
    return fsName.includes(pkgName) || pkgName.includes(fsName.split(' ')[0]);
  });

  const pricingKey = mapItemToPricingKey('desserts', itemName);

  return {
    id: match?.id || itemName.toLowerCase().replace(/\s+/g, '-'),
    name: itemName,
    description: match?.description || "Sweet and delightful",
    imageUrl: match?.imageUrl || null,
    price: null,
    badge: itemName.toLowerCase().includes('brownie') || itemName.toLowerCase().includes('pound') ? 'Popular' : null,
    tags: match?.dietaryTags || ['vegetarian'],
    quantity: packageItem.quantity || 1,
    pricingCategory: pricingKey?.category,
    pricingItemName: pricingKey?.itemName
  };
}

/**
 * Enrich beverage with Firestore data
 */
function enrichBeverageWithFirestoreData(packageItem) {
  const itemName = packageItem.item || packageItem;

  const match = firestoreDataCache.beverages.find(fsItem =>
    fsItem.name.toLowerCase().includes(itemName.toLowerCase().substring(0, 6)) ||
    itemName.toLowerCase().includes(fsItem.name.toLowerCase().substring(0, 6))
  );

  // Determine if hot or cold
  const hotKeywords = ['coffee', 'hot chocolate', 'tea'];
  const isHot = hotKeywords.some(keyword => itemName.toLowerCase().includes(keyword));
  const category = isHot ? 'hotBeverages' : 'coldBeverages';

  const pricingKey = mapItemToPricingKey(category, itemName);

  return {
    id: match?.id || itemName.toLowerCase().replace(/\s+/g, '-'),
    name: itemName,
    description: match?.description || (isHot ? "Hot and fresh" : "Cold and refreshing"),
    imageUrl: match?.imageUrl || null,
    price: null,
    badge: itemName.toLowerCase().includes('lavazza') ? 'Premium' : null,
    tags: [isHot ? 'hot' : 'cold'],
    quantity: packageItem.quantity || 1,
    pricingCategory: pricingKey?.category,
    pricingItemName: pricingKey?.itemName
  };
}

/**
 * Main render function for the guided planner
 */
export async function renderGuidedPlanner() {
  console.log('🎬 renderGuidedPlanner() called');

  // Load data from Firestore
  const packages = await fetchCateringPackages();
  const allSauces = await fetchSauces();
  const addOns = await fetchAddOns();

  // Load photo card data
  await fetchFirestoreDataForPhotoCards();

  // Filter wing sauces from dipping sauces
  const wingSauces = allSauces.filter(sauce => !isDipCategory(sauce.category));
  const dips = allSauces.filter(sauce => isDipCategory(sauce.category));

  // Persist latest sauce datasets to wizard state
  wizardState.sauces = wingSauces;
  wizardState.dipOptions = dips;

  // Pre-render Step 6 (async) before building main HTML
  const step6Html = await renderStep6AddOns(addOns);

  const html = `
    <section id="catering-planner" class="guided-planner-section">
      <div class="planner-header">
        <h2>Plan Your Shared Platter Event</h2>
        <p class="planner-subtitle">Let's find the perfect package for your celebration</p>
      </div>

      ${renderProgressIndicator()}

      <div class="planner-wizard">
        ${renderStep1EventDetails()}
        ${renderStep2PackageSelection(packages)}
        ${renderStep3WingCustomization()}
        ${renderStep4SauceSelection(wingSauces)}
        ${renderStep5CustomizePackage()}
        ${step6Html}
        ${renderStep7ReviewContact()}
      </div>

      <div class="wizard-navigation">
        <button id="wizard-prev" class="btn-secondary btn-wizard" style="display: none;">
          ← Previous
        </button>
        <button id="wizard-next" class="btn-primary btn-wizard">
          Continue →
        </button>
      </div>
    </section>
  `;

  // Return HTML and data - listeners will be attached AFTER insertion
  return { html, packages, sauces: wingSauces, addOns };
}

/**
 * Progress indicator showing current step
 */
function renderProgressIndicator() {
  const steps = [
    { num: 1, label: 'Event Details' },
    { num: 2, label: 'Choose Package' },
    { num: 3, label: 'Customize Wings' },
    { num: 4, label: 'Allocate Sauces' },
    { num: 5, label: 'Customize Package' },
    { num: 6, label: 'Add Extras' },
    { num: 7, label: 'Review & Contact' }
  ];

  return `
    <div class="wizard-progress">
      ${steps.map(step => `
        <div class="progress-step ${wizardState.currentStep === step.num ? 'active' : ''} ${wizardState.currentStep > step.num ? 'completed' : ''}">
          <div class="step-number">${step.num}</div>
          <div class="step-label">${step.label}</div>
        </div>
      `).join('<div class="progress-connector"></div>')}
    </div>
  `;
}

/**
 * Step 1: Smart Event Details (SHARD-0-v2)
 */
function renderStep1EventDetails() {
  return `
    <div class="wizard-step" id="step-1" style="display: block;">
      <div class="step-content">
        <h3 class="step-title">Tell Us About Your Event</h3>
        <p class="step-description">Help us recommend the perfect package</p>

        <div class="form-group">
          <label for="guest-count">How many people are you feeding? *</label>
          <div class="guest-count-selector">
            ${[
              { range: '10-15', label: '10-15 people', value: 12 },
              { range: '16-25', label: '16-25 people', value: 20 },
              { range: '26-40', label: '26-40 people', value: 33 },
              { range: '41-60', label: '41-60 people', value: 50 },
              { range: '60+', label: '60+ people', value: 70 }
            ].map(option => {
              const isSelected = wizardState.eventDetails.guestCount === option.value;
              return `
                <button class="guest-count-option ${isSelected ? 'selected' : ''}" data-count="${option.value}">
                  <span class="count-range">${option.range}</span>
                  <span class="count-label">${option.label}</span>
                </button>
              `;
            }).join('')}
          </div>
          <button class="btn-text portion-guide-trigger" onclick="openPortionGuide()" type="button">
            💡 Not sure? View Portion Guide
          </button>
        </div>

        <div class="form-group">
          <label for="dietary-needs">Any dietary restrictions?</label>
          <div class="dietary-needs-selector">
            ${[
              {
                value: 'none',
                label: 'None',
                icon: '🍗',
                description: 'No dietary restrictions'
              },
              {
                value: 'vegetarian',
                label: 'Vegetarian Options Needed',
                icon: '🥗',
                description: 'Some guests prefer meatless options'
              },
              {
                value: 'vegan',
                label: 'Vegan Only',
                icon: '🌱',
                description: 'Plant-based wings only'
              }
            ].map(option => {
              const isSelected = wizardState.eventDetails.dietaryNeeds === option.value;
              return `
                <button class="dietary-option ${isSelected ? 'selected' : ''}" data-dietary="${option.value}">
                  <span class="option-icon">${option.icon}</span>
                  <div class="option-content">
                    <span class="option-label">${option.label}</span>
                    <span class="option-description">${option.description}</span>
                  </div>
                </button>
              `;
            }).join('')}
          </div>
        </div>

        <div class="form-group">
          <label for="event-date">When do you need it? *</label>
          <div class="datetime-inputs">
            <input type="date"
                   id="event-date"
                   class="form-input"
                   min="${getMinDate()}"
                   placeholder="Select delivery date"
                   style="flex: 1;">
            <input type="time"
                   id="event-time"
                   class="form-input"
                   placeholder="Select time"
                   style="flex: 1;">
          </div>
          <p class="field-hint">📌 24-hour advance notice required</p>
        </div>
      </div>
    </div>
  `;
}

/**
 * Step 2: Package Selection (simplified based on guest count)
 */
function renderStep2PackageSelection(packages) {
  return `
    <div class="wizard-step" id="step-2" style="display: none;">
      <div class="step-content">
        <h3 class="step-title">Choose Your Package</h3>
        <p class="step-description" id="package-recommendation"></p>

        <div class="package-cards" id="package-cards">
          ${packages.map(pkg => renderPackageCard(pkg)).join('')}
        </div>

        <div class="package-help">
          <p>💡 <strong>Need help choosing?</strong> Call us at <a href="tel:+12673763113">(267) 376-3113</a></p>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render individual package card
 */
function renderPackageCard(pkg) {
  // Build comprehensive "What's Included" list
  let includedItems = [];

  // Wings
  if (pkg.wingOptions) {
    const totalWings = pkg.wingOptions.totalWings || 0;
    const boneless = pkg.wingOptions.boneless || 0;
    const boneIn = pkg.wingOptions.boneIn || 0;
    const plantBased = pkg.wingOptions.plantBased || 0;

    if (plantBased > 0) {
      includedItems.push(`🍗 ${plantBased} Plant-Based Wings`);
    } else {
      includedItems.push(`🍗 ${totalWings} Wings (${boneless} Boneless + ${boneIn} Bone-In)`);
    }
  }

  // Sauces
  if (pkg.sauceSelections?.max) {
    includedItems.push(`🌶️ ${pkg.sauceSelections.max} Sauce Selections`);
  }

  // Chips
  if (pkg.chips?.fivePacksIncluded) {
    const total = pkg.chips.totalBags || pkg.chips.fivePacksIncluded * 5;
    includedItems.push(`🥔 ${total} Chip Bags (${pkg.chips.brand || 'Miss Vickie\'s'})`);
  }

  // Dips
  if (pkg.dips?.fivePacksIncluded) {
    const total = pkg.dips.totalContainers || pkg.dips.fivePacksIncluded * 5;
    includedItems.push(`🥣 ${total} Dip Containers (Ranch, Honey Mustard, Blue Cheese, Cheese)`);
  }

  // Cold Sides
  if (pkg.coldSides && pkg.coldSides.length > 0) {
    pkg.coldSides.forEach(side => {
      includedItems.push(`🥗 ${side.quantity} ${side.item}`);
    });
  }

  // Salads
  if (pkg.salads && pkg.salads.length > 0) {
    const saladCount = pkg.salads.reduce((sum, s) => sum + s.quantity, 0);
    includedItems.push(`🥗 ${saladCount} Family Salad${saladCount > 1 ? 's' : ''}`);
  }

  // Desserts
  if (pkg.desserts && pkg.desserts.length > 0) {
    pkg.desserts.forEach(dessert => {
      includedItems.push(`🍰 ${dessert.quantity} ${dessert.item}`);
    });
  }

  // Beverages
  if (pkg.beverages && pkg.beverages.length > 0) {
    pkg.beverages.forEach(bev => {
      if (!bev.optional) {
        const options = bev.options ? ` (${bev.options.join(' or ')})` : '';
        includedItems.push(`🥤 ${bev.quantity} ${bev.item}${options}`);
      }
    });
  }

  return `
    <div class="package-card" data-package-id="${pkg.id}">
      <div class="package-header">
        <h4 class="package-name">${pkg.name}</h4>
        <div class="package-serves">Serves ${pkg.servesMin}-${pkg.servesMax} people</div>
        ${pkg.popular ? '<div class="package-badge">⭐ Most Popular</div>' : ''}
      </div>

      <div class="package-body">
        ${pkg.description ? `<p class="package-description">${pkg.description}</p>` : ''}

        <div class="package-includes">
          <h5 class="includes-title">What's Included:</h5>
          <ul class="includes-list">
            ${includedItems.map(item => `<li>${item}</li>`).join('')}
          </ul>
        </div>
      </div>

      <div class="package-footer">
        <button class="btn-select-package" data-package-id="${pkg.id}">
          Select This Package
        </button>
      </div>
    </div>
  `;
}

/**
 * Step 3: Wing Customization (SHARD-2)
 * Dynamic container for WingCustomization component
 */
function renderStep3WingCustomization() {
  return `
    <div class="wizard-step" id="step-3" style="display: none;">
      <div class="step-content">
        <div id="wing-customization-container"></div>
      </div>
    </div>
  `;
}

/**
 * Step 4: Sauce Allocation
 * Users can allocate specific wing counts to each sauce
 */
function renderStep4SauceSelection(sauces) {
  return `
    <div class="wizard-step" id="step-4" style="display: none;">
      <div class="step-content">
        <h3 class="step-title">Allocate Sauces to Wings</h3>
        <p class="step-description">
          Assign sauces to your <span id="total-wings-display">120</span> wings
        </p>

        <div class="allocation-summary">
          <div class="allocation-stat">
            <span class="stat-label">Total Wings:</span>
            <strong><span id="total-wings-count">120</span></strong>
          </div>
          <div class="allocation-stat">
            <span class="stat-label">Allocated:</span>
            <strong><span id="allocated-count">0</span></strong>
          </div>
          <div class="allocation-stat remaining">
            <span class="stat-label">Remaining:</span>
            <strong><span id="remaining-count">120</span></strong>
          </div>
        </div>

        <div class="skip-sauces-option">
          <label class="checkbox-label">
            <input type="checkbox" id="skip-all-sauces">
            <span>Skip all sauces (serve wings plain/unsauced)</span>
          </label>
        </div>

        <div id="sauce-allocation-container">
          <div id="sauce-allocation-rows">
            <!-- Dynamic sauce allocation rows will be added here -->
          </div>

          <button type="button" class="btn-add-sauce-row" id="add-sauce-row">
            <span class="btn-icon">+</span> Add Another Sauce
          </button>
        </div>

        <div class="allocation-hint">
          <span class="hint-icon">💡</span>
          <span>You can leave some wings unsauced, or sauce all wings. Mix heat levels for variety!</span>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render a single sauce allocation row
 * @param {number} index - Row index
 * @param {Array} sauces - Available sauces
 * @param {Object} allocation - Current allocation {sauceId, wingCount}
 * @returns {string} HTML for sauce allocation row
 */
function renderSauceAllocationRow(index, sauces, allocation = {}) {
  const { sauceId = '', wingCount = 0 } = allocation;

  // Add "No Sauce" option
  const noSauceOption = {
    id: 'no-sauce',
    name: 'No Sauce (Plain Wings)',
    heatLevel: 0,
    description: 'Crispy fried wings - no sauce'
  };

  // Ensure sauces is an array and handle null/undefined safely
  const sauceList = Array.isArray(sauces) ? sauces : (sauces ? [] : []);
  const allSauceOptions = [noSauceOption, ...(sauceList || [])];

  return `
    <div class="sauce-allocation-row" data-row-index="${index}">
      <div class="row-number">
        <span>${index + 1}</span>
      </div>

      <div class="row-controls">
        <div class="sauce-select-wrapper">
          <select class="sauce-select" data-row-index="${index}">
            <option value="">Choose sauce...</option>
            ${allSauceOptions.map(sauce => {
              const heatIndicator = sauce.heatLevel > 0 ? '🌶️'.repeat(Math.min(sauce.heatLevel, 3)) : '';
              return `
                <option value="${sauce.id}" ${sauce.id === sauceId ? 'selected' : ''}>
                  ${sauce.name} ${heatIndicator}
                </option>
              `;
            }).join('')}
          </select>
        </div>

        <div class="wing-count-wrapper">
          <input
            type="number"
            class="wing-count-input"
            data-row-index="${index}"
            value="${wingCount}"
            min="0"
            placeholder="0">
          <span class="input-label">wings</span>
        </div>

        <button type="button" class="btn-remove-row" data-row-index="${index}" title="Remove this sauce">
          <span class="btn-icon">×</span>
        </button>
      </div>
    </div>
  `;
}

/**
 * Initialize Step 4 sauce allocation
 * Called when step becomes active
 */
function initializeStep4SauceAllocation() {
  const container = document.getElementById('sauce-allocation-rows');
  if (!container) return;

  if (!wizardState.selectedPackage) {
    console.warn('⚠️ Cannot initialize sauce allocation without a selected package.');
    return;
  }

  const availableSauces = Array.isArray(wizardState.sauces) ? wizardState.sauces : [];
  wizardState.sauces = availableSauces;

  // Initialize state if needed
  if (!wizardState.sauceAllocations) {
    wizardState.sauceAllocations = [];
  }

  // Get total wings from package
  const totalWings = wizardState.selectedPackage.wingOptions?.totalWings ||
                     wizardState.selectedPackage.totalWings ||
                     0;

  document.getElementById('total-wings-display').textContent = totalWings;
  document.getElementById('total-wings-count').textContent = totalWings;

  container.innerHTML = '';

  // Reflect skip state in UI
  const skipCheckbox = document.getElementById('skip-all-sauces');
  if (skipCheckbox) {
    skipCheckbox.checked = Boolean(wizardState.skipAllSauces);
  }
  const allocationContainer = document.getElementById('sauce-allocation-container');
  if (allocationContainer) {
    allocationContainer.style.display = wizardState.skipAllSauces ? 'none' : 'block';
  }

  if (!wizardState.skipAllSauces) {
    if (wizardState.sauceAllocations.length === 0) {
      addSauceAllocationRow({ skipListeners: true });
    } else {
      // Re-render existing allocations
      wizardState.sauceAllocations.forEach((allocation, index) => {
        container.insertAdjacentHTML('beforeend', renderSauceAllocationRow(index, availableSauces, allocation));
      });
    }
  }

  updateAllocationTotals();
  attachSauceAllocationListeners();
}

/**
 * Add a new sauce allocation row
 */
function addSauceAllocationRow(options = {}) {
  const { skipListeners = false } = options;
  const container = document.getElementById('sauce-allocation-rows');
  if (!container) return;

  const index = wizardState.sauceAllocations.length;
  const newAllocation = { sauceId: '', sauceName: '', wingCount: 0 };

  wizardState.sauceAllocations.push(newAllocation);
  container.insertAdjacentHTML('beforeend', renderSauceAllocationRow(index, wizardState.sauces, newAllocation));

  if (!skipListeners) {
    attachSauceAllocationListeners();
    updateAllocationTotals();
  }
}

/**
 * Remove a sauce allocation row
 */
function removeSauceAllocationRow(index) {
  // Don't allow removing the last row
  if (wizardState.sauceAllocations.length <= 1) {
    return;
  }

  // Remove from state
  wizardState.sauceAllocations.splice(index, 1);

  // Re-render all rows to update indices
  const container = document.getElementById('sauce-allocation-rows');
  if (!container) return;

  container.innerHTML = '';
  wizardState.sauceAllocations.forEach((allocation, idx) => {
    container.insertAdjacentHTML('beforeend', renderSauceAllocationRow(idx, wizardState.sauces, allocation));
  });

  attachSauceAllocationListeners();
  updateAllocationTotals();
}

/**
 * Update allocation totals display
 */
function updateAllocationTotals() {
  const totalWings = wizardState.selectedPackage?.wingOptions?.totalWings ||
                     wizardState.selectedPackage?.totalWings || 0;
  const allocated = wizardState.sauceAllocations.reduce((sum, allocation) => {
    return sum + (parseInt(allocation.wingCount) || 0);
  }, 0);
  const remaining = totalWings - allocated;

  document.getElementById('allocated-count').textContent = allocated;
  document.getElementById('remaining-count').textContent = remaining;

  // Update styling based on remaining count
  const remainingStat = document.querySelector('.allocation-stat.remaining');
  if (remainingStat) {
    remainingStat.classList.remove('over-allocated', 'under-allocated', 'complete');
    if (remaining < 0) {
      remainingStat.classList.add('over-allocated');
    } else if (remaining > 0) {
      remainingStat.classList.add('under-allocated');
    } else {
      remainingStat.classList.add('complete');
    }
  }

  syncLegacySauceSelections();
}

/**
 * Handle skip all sauces toggle
 */
function handleSkipAllSauces(checked) {
  const container = document.getElementById('sauce-allocation-container');
  if (!container) return;

  wizardState.skipAllSauces = checked;

  if (checked) {
    container.style.display = 'none';
    // Clear allocations when skipping
    wizardState.sauceAllocations = [];
  } else {
    container.style.display = 'block';
    // Re-initialize with one row
    if (wizardState.sauceAllocations.length === 0) {
      const rowsContainer = document.getElementById('sauce-allocation-rows');
      if (rowsContainer) {
        rowsContainer.innerHTML = '';
        addSauceAllocationRow();
      }
    }
  }

  updateAllocationTotals();
}

/**
 * Keep legacy sauceSelections array in sync for downstream consumers.
 */
function syncLegacySauceSelections() {
  if (wizardState.skipAllSauces) {
    wizardState.sauceSelections = [{
      id: 'no-sauce',
      name: 'No Sauce (Plain Wings)'
    }];
    return;
  }

  if (!Array.isArray(wizardState.sauceAllocations)) {
    wizardState.sauceSelections = [];
    return;
  }

  wizardState.sauceSelections = wizardState.sauceAllocations
    .filter(allocation => allocation && allocation.sauceId && allocation.sauceId !== 'no-sauce')
    .map(allocation => ({
      id: allocation.sauceId,
      name: allocation.sauceName ||
        wizardState.sauces.find(s => s.id === allocation.sauceId)?.name ||
        'Sauce'
    }));
}

/**
 * Handle sauce selection change
 */
function handleSauceSelect(index, sauceId) {
  if (index >= wizardState.sauceAllocations.length) return;

  const sauce = wizardState.sauces.find(s => s.id === sauceId);

  wizardState.sauceAllocations[index].sauceId = sauceId;
  wizardState.sauceAllocations[index].sauceName = sauce ? sauce.name : (sauceId === 'no-sauce' ? 'No Sauce' : '');

  console.log('🎨 Sauce selected:', { index, sauceId, sauceName: wizardState.sauceAllocations[index].sauceName });
}

/**
 * Handle wing count change
 */
function handleWingCountChange(index, count) {
  if (index >= wizardState.sauceAllocations.length) return;

  const numericCount = parseInt(count) || 0;
  wizardState.sauceAllocations[index].wingCount = Math.max(0, numericCount);

  updateAllocationTotals();

  console.log('🔢 Wing count updated:', { index, count: wizardState.sauceAllocations[index].wingCount });
}

/**
 * Attach event listeners for sauce allocation
 */
function attachSauceAllocationListeners() {
  // Add sauce row button
  const addButton = document.getElementById('add-sauce-row');
  if (addButton) {
    addButton.replaceWith(addButton.cloneNode(true)); // Remove old listeners
    document.getElementById('add-sauce-row').addEventListener('click', addSauceAllocationRow);
  }

  // Skip all sauces checkbox
  const skipCheckbox = document.getElementById('skip-all-sauces');
  if (skipCheckbox) {
    skipCheckbox.replaceWith(skipCheckbox.cloneNode(true));
    document.getElementById('skip-all-sauces').addEventListener('change', (e) => {
      handleSkipAllSauces(e.target.checked);
    });
  }

  // Remove row buttons
  document.querySelectorAll('.btn-remove-row').forEach(button => {
    const index = parseInt(button.dataset.rowIndex, 10);
    const clone = button.cloneNode(true);
    button.replaceWith(clone);
    clone.addEventListener('click', () => removeSauceAllocationRow(index));
  });

  // Sauce selects
  document.querySelectorAll('.sauce-select').forEach(select => {
    const index = parseInt(select.dataset.rowIndex, 10);
    const clone = select.cloneNode(true);
    clone.value = select.value;
    select.replaceWith(clone);
    clone.addEventListener('change', (e) => handleSauceSelect(index, e.target.value));
  });

  // Wing count inputs
  document.querySelectorAll('.wing-count-input').forEach(input => {
    const index = parseInt(input.dataset.rowIndex, 10);
    const clone = input.cloneNode(true);
    clone.value = input.value;
    input.replaceWith(clone);
    clone.addEventListener('input', (e) => handleWingCountChange(index, e.target.value));
  });
}

/**
 * Step 5: Customize Package Items
 * Split-screen interface for customizing included items (chips, dips, sides, salads, desserts, beverages)
 */
function renderStep5CustomizePackage() {
  return `
    <div class="wizard-step" id="step-5" style="display: none;">
      <div class="step-content">
        <h3 class="step-title">Customize Your Package</h3>
        <p class="step-description">Adjust what's included in your package</p>

        <div class="customize-split-screen">
          <!-- Left Panel: Customization Controls (60%) -->
          <div class="customize-left-panel" id="customize-left-panel">
            <!-- Content will be dynamically injected when step is activated -->
          </div>

          <!-- Right Panel: Live Order Summary (40%) -->
          <div class="customize-right-panel" id="customize-right-panel">
            <!-- Content will be dynamically injected when step is activated -->
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * SHARD 2: Initialize wizardState.customizedIncludes structure
 * Creates deep copy of package includes with quantity tracking
 */
function initializeCustomizedIncludes(pkg) {
  if (!pkg) {
    console.warn('⚠️ Cannot initialize customizedIncludes: no package provided');
    return null;
  }

  const customized = {
    chips: null,
    dips: null,
    coldSides: [],
    salads: [],
    desserts: [],
    hotBeverages: [],
    coldBeverages: []
  };

  // Initialize chips (simple quantity)
  if (pkg.chips?.fivePacksIncluded) {
    customized.chips = {
      quantity: pkg.chips.fivePacksIncluded,
      originalQuantity: pkg.chips.fivePacksIncluded
    };
  }

  // Initialize dips (simple quantity)
  if (pkg.dips?.fivePacksIncluded) {
    customized.dips = {
      quantity: pkg.dips.fivePacksIncluded,
      originalQuantity: pkg.dips.fivePacksIncluded
    };
  }

  // Initialize cold sides (array)
  if (Array.isArray(pkg.coldSides)) {
    customized.coldSides = pkg.coldSides.map(side => ({
      item: side.item || side,
      quantity: side.quantity || 1,
      originalQuantity: side.quantity || 1
    }));
  }

  // Initialize salads (array)
  if (Array.isArray(pkg.salads)) {
    customized.salads = pkg.salads.map(salad => ({
      item: salad.item || salad,
      quantity: salad.quantity || 1,
      originalQuantity: salad.quantity || 1
    }));
  }

  // Initialize desserts (array)
  if (Array.isArray(pkg.desserts)) {
    customized.desserts = pkg.desserts.map(dessert => ({
      item: dessert.item || dessert,
      quantity: dessert.quantity || 1,
      originalQuantity: dessert.quantity || 1
    }));
  }

  // Initialize beverages (split into hot/cold)
  if (Array.isArray(pkg.beverages)) {
    const hotBevKeywords = ['coffee', 'hot chocolate', 'tea'];
    pkg.beverages.forEach(bev => {
      const bevName = (bev.item || bev).toLowerCase();
      const isHot = hotBevKeywords.some(keyword => bevName.includes(keyword));

      const bevData = {
        item: bev.item || bev,
        quantity: bev.quantity || 1,
        originalQuantity: bev.quantity || 1
      };

      if (isHot) {
        customized.hotBeverages.push(bevData);
      } else {
        customized.coldBeverages.push(bevData);
      }
    });
  }

  console.log('✅ Initialized customizedIncludes:', customized);
  return customized;
}

/**
 * Initialize Step 5: Customize Package (called when step is activated)
 * NOW ASYNC to fetch fresh Firestore data
 */
async function initializeStep5CustomizePackage() {
  console.log('🔧 initializeStep5CustomizePackage called');
  console.log('📦 wizardState.selectedPackage:', wizardState.selectedPackage);

  if (!wizardState.selectedPackage) {
    console.warn('⚠️ Cannot initialize package customization without a selected package.');
    return;
  }

  // SHARD 2: Initialize customized includes structure
  if (!wizardState.customizedIncludes) {
    wizardState.customizedIncludes = initializeCustomizedIncludes(wizardState.selectedPackage);
  }

  console.log('✅ Package found, fetching Firestore data and rendering customization UI');

  // Show loading state
  const leftPanel = document.getElementById('customize-left-panel');
  const rightPanel = document.getElementById('customize-right-panel');

  if (leftPanel) {
    leftPanel.innerHTML = '<div class="loading-step5"><p>Loading customization options...</p></div>';
  }

  // Fetch fresh Firestore data for photo cards
  const firestoreData = await fetchStep5FirestoreData();

  // Store in wizard state for render functions to access
  wizardState.step5Data = firestoreData;

  // Dynamically render the customization UI with current package data
  if (leftPanel) {
    leftPanel.innerHTML = renderCustomizationCategories();
    console.log('✅ Left panel content injected with Firestore data');
  }

  if (rightPanel) {
    rightPanel.innerHTML = renderPackageSummary();
    console.log('✅ Right panel content injected');
  }

  // SHARD 3: Attach quantity change event listeners
  attachQuantityChangeListeners();
}

/**
 * SHARD 3: Handle quantity changes for package items
 * @param {string} type - Category type (chips, dips, coldSides, etc.)
 * @param {string|number} itemIdentifier - Item identifier (index for arrays, 'base' for simple types)
 * @param {number} delta - Change amount (+1 or -1)
 */
function handleQuantityChange(type, itemIdentifier, delta) {
  if (!wizardState.customizedIncludes) {
    console.warn('⚠️ customizedIncludes not initialized');
    return;
  }

  const customized = wizardState.customizedIncludes;
  let currentQuantity = 0;

  // Get current quantity based on type
  if (type === 'chips' || type === 'dips') {
    currentQuantity = customized[type]?.quantity || 0;
  } else {
    // Array-based categories (coldSides, salads, desserts, hotBeverages, coldBeverages)
    const index = parseInt(itemIdentifier);
    if (customized[type] && customized[type][index]) {
      currentQuantity = customized[type][index].quantity || 0;
    }
  }

  // Calculate new quantity (minimum 0)
  const newQuantity = Math.max(0, currentQuantity + delta);

  // Update state
  if (type === 'chips' || type === 'dips') {
    if (customized[type]) {
      customized[type].quantity = newQuantity;
    }
  } else {
    const index = parseInt(itemIdentifier);
    if (customized[type] && customized[type][index]) {
      customized[type][index].quantity = newQuantity;
    }
  }

  // Update UI display
  const displayElement = document.querySelector(
    `.qty-display[data-type="${type}"][data-item="${itemIdentifier}"]`
  );
  if (displayElement) {
    displayElement.textContent = newQuantity;
  }

  // Calculate and display price delta
  updatePriceDelta(type, itemIdentifier);

  // Update right panel summary (SHARD 4)
  updatePackageSummaryPricing();

  console.log(`✅ Quantity changed: ${type}[${itemIdentifier}] → ${newQuantity}`);
}

/**
 * SHARD 3: Calculate and update price delta for an item
 * @param {string} type - Category type
 * @param {string|number} itemIdentifier - Item identifier
 */
function updatePriceDelta(type, itemIdentifier) {
  if (!wizardState.customizedIncludes) return;

  const customized = wizardState.customizedIncludes;
  let originalQty = 0;
  let currentQty = 0;
  let itemName = '';

  // Get quantities and item name
  if (type === 'chips' || type === 'dips') {
    originalQty = customized[type]?.originalQuantity || 0;
    currentQty = customized[type]?.quantity || 0;
    itemName = type === 'chips' ? "Miss Vickie's Chips 5-Pack" : "Dip 5-Pack";
  } else {
    const index = parseInt(itemIdentifier);
    if (customized[type] && customized[type][index]) {
      const item = customized[type][index];
      originalQty = item.originalQuantity || 0;
      currentQty = item.quantity || 0;
      itemName = item.item;
    }
  }

  const qtyDelta = currentQty - originalQty;

  // Map to pricing key
  const pricingKey = mapItemToPricingKey(type, itemName);
  if (!pricingKey) {
    console.warn(`⚠️ No pricing key for ${type}:${itemName}`);
    return;
  }

  let priceDelta = 0;

  if (qtyDelta < 0) {
    // Removal: apply removal credit
    const creditPerUnit = getRemovalCredit(pricingKey.itemName, pricingKey.category);
    priceDelta = qtyDelta * creditPerUnit; // Negative value (credit)
  } else if (qtyDelta > 0) {
    // Addition: apply add-on cost
    const costPerUnit = getAddOnCost(pricingKey.itemName, pricingKey.category);
    priceDelta = qtyDelta * costPerUnit; // Positive value (charge)
  }

  // Update delta display
  const deltaElement = document.querySelector(
    `.price-delta[data-type="${type}"][data-item="${itemIdentifier}"]`
  );
  if (deltaElement) {
    deltaElement.textContent = formatPriceDelta(priceDelta);
    deltaElement.className = `price-delta ${priceDelta > 0 ? 'price-increase' : priceDelta < 0 ? 'price-decrease' : ''}`;
  }
}

/**
 * SHARD 3: Attach event listeners to quantity buttons
 * Uses event delegation for efficiency
 */
function attachQuantityChangeListeners() {
  const leftPanel = document.getElementById('customize-left-panel');
  if (!leftPanel) {
    console.warn('⚠️ Cannot attach listeners: customize-left-panel not found');
    return;
  }

  // Remove old listeners by cloning (prevents duplicates)
  const newPanel = leftPanel.cloneNode(true);
  leftPanel.parentNode.replaceChild(newPanel, leftPanel);

  // Attach new listeners using event delegation
  newPanel.addEventListener('click', (e) => {
    const button = e.target.closest('.qty-btn');
    if (!button) return;

    const type = button.dataset.type;
    const item = button.dataset.item;
    const delta = button.classList.contains('qty-minus') ? -1 : 1;

    handleQuantityChange(type, item, delta);
  });

  console.log('✅ Quantity change listeners attached');
}

/**
 * SHARD 4: Update package summary pricing in real-time
 * Calculates removal credits, add-on costs, and updates right panel display
 */
function updatePackageSummaryPricing() {
  if (!wizardState.customizedIncludes || !wizardState.selectedPackage) {
    console.warn('⚠️ Cannot update pricing: missing customizedIncludes or selectedPackage');
    return;
  }

  const pkg = wizardState.selectedPackage;
  const customized = wizardState.customizedIncludes;
  const basePrice = pkg.basePrice || 209.99;

  // Build lists of removed and added items
  const removedItems = [];
  const addedItems = [];

  // Check chips
  if (customized.chips) {
    const delta = customized.chips.quantity - customized.chips.originalQuantity;
    const pricingKey = mapItemToPricingKey('chips', "Miss Vickie's Chips 5-Pack");
    if (delta < 0 && pricingKey) {
      removedItems.push({ name: pricingKey.itemName, category: pricingKey.category, quantity: Math.abs(delta) });
    } else if (delta > 0 && pricingKey) {
      addedItems.push({ name: pricingKey.itemName, category: pricingKey.category, quantity: delta });
    }
  }

  // Check dips
  if (customized.dips) {
    const delta = customized.dips.quantity - customized.dips.originalQuantity;
    const pricingKey = mapItemToPricingKey('dips', "Dip 5-Pack");
    if (delta < 0 && pricingKey) {
      removedItems.push({ name: pricingKey.itemName, category: pricingKey.category, quantity: Math.abs(delta) });
    } else if (delta > 0 && pricingKey) {
      addedItems.push({ name: pricingKey.itemName, category: pricingKey.category, quantity: delta });
    }
  }

  // Helper function to process array categories
  const processArrayCategory = (categoryName) => {
    if (!Array.isArray(customized[categoryName])) return;

    customized[categoryName].forEach(item => {
      const delta = item.quantity - item.originalQuantity;
      const pricingKey = mapItemToPricingKey(categoryName, item.item);
      if (delta < 0 && pricingKey) {
        removedItems.push({ name: pricingKey.itemName, category: pricingKey.category, quantity: Math.abs(delta) });
      } else if (delta > 0 && pricingKey) {
        addedItems.push({ name: pricingKey.itemName, category: pricingKey.category, quantity: delta });
      }
    });
  };

  // Process all array categories
  processArrayCategory('coldSides');
  processArrayCategory('salads');
  processArrayCategory('desserts');
  processArrayCategory('hotBeverages');
  processArrayCategory('coldBeverages');

  // Calculate pricing using Richard's system
  const pricing = calculateModificationPricing(basePrice, removedItems, addedItems);

  // Update UI elements
  const basePriceDisplay = document.getElementById('base-price-display');
  const addedItemsLine = document.getElementById('added-items-line');
  const addedItemsPrice = document.getElementById('added-items-price');
  const removedItemsLine = document.getElementById('removed-items-line');
  const removedItemsPrice = document.getElementById('removed-items-price');
  const currentTotalPrice = document.getElementById('current-total-price');

  if (basePriceDisplay) {
    basePriceDisplay.textContent = formatPrice(pricing.basePrice);
  }

  // Show/hide and update added items line
  if (addedItemsLine && addedItemsPrice) {
    if (pricing.addOnCharges > 0) {
      addedItemsLine.style.display = 'flex';
      addedItemsPrice.textContent = `+${formatPrice(pricing.addOnCharges)}`;
    } else {
      addedItemsLine.style.display = 'none';
    }
  }

  // Show/hide and update removed items line
  if (removedItemsLine && removedItemsPrice) {
    if (pricing.removalCredits > 0) {
      removedItemsLine.style.display = 'flex';
      removedItemsPrice.textContent = `-${formatPrice(pricing.removalCredits)}`;
    } else {
      removedItemsLine.style.display = 'none';
    }
  }

  // Update total price
  if (currentTotalPrice) {
    currentTotalPrice.textContent = formatPrice(pricing.finalPrice);
  }

  // SHARD 5: Handle 20% cap warning and button state
  const capWarning = document.getElementById('cap-warning');
  const maxCreditAmount = document.getElementById('max-credit-amount');
  const continueButton = document.querySelector('#step-5 .btn-primary');

  if (pricing.capExceeded) {
    console.warn(`⚠️ Removal credit cap exceeded by ${formatPrice(pricing.exceededAmount)}`);

    // Show warning
    if (capWarning) {
      capWarning.style.display = 'flex';
    }

    // Update max credit amount
    if (maxCreditAmount) {
      maxCreditAmount.textContent = formatPrice(basePrice * 0.20);
    }

    // Disable Continue button
    if (continueButton) {
      continueButton.disabled = true;
      continueButton.title = 'Cannot proceed: Removal credit limit exceeded';
    }
  } else {
    // Hide warning
    if (capWarning) {
      capWarning.style.display = 'none';
    }

    // Enable Continue button
    if (continueButton) {
      continueButton.disabled = false;
      continueButton.title = '';
    }
  }

  console.log('💰 Pricing updated:', pricing);
}

/**
 * Render customization categories
 */
function renderCustomizationCategories() {
  const pkg = wizardState.selectedPackage;
  if (!pkg) return '<p>No package selected</p>';

  let html = '<div class="customization-categories">';

  // Chips
  if (pkg.chips?.fivePacksIncluded) {
    html += renderCategorySection('Chips', 'chips', pkg.chips);
  }

  // Dips
  if (pkg.dips?.fivePacksIncluded) {
    html += renderCategorySection('Dips', 'dips', pkg.dips);
  }

  // Cold Sides - Defensive check for array type
  if (Array.isArray(pkg.coldSides) && pkg.coldSides.length > 0) {
    html += renderColdSidesSection(pkg.coldSides);
  }

  // Salads - Defensive check for array type
  if (Array.isArray(pkg.salads) && pkg.salads.length > 0) {
    html += renderSaladsSection(pkg.salads);
  }

  // Desserts - Defensive check for array type
  if (Array.isArray(pkg.desserts) && pkg.desserts.length > 0) {
    html += renderDessertsSection(pkg.desserts);
  }

  // Beverages - Split into hot and cold from customized state
  const customized = wizardState.customizedIncludes;
  const hotBevs = customized?.hotBeverages || [];
  const coldBevs = customized?.coldBeverages || [];

  if (hotBevs.length > 0 || coldBevs.length > 0) {
    html += renderBeveragesSection(hotBevs, coldBevs);
  }

  html += '</div>';
  return html;
}

/**
 * Render a simple category section (chips/dips)
 */
function renderCategorySection(title, type, data) {
  const baseQuantity = data.fivePacksIncluded || 0;
  const pricePerUnit = type === 'chips' ? 8.50 : 6.25;
  const icon = type === 'chips' ? '🥔' : '🥣';

  return `
    <div class="customize-category">
      <h4 class="category-title">
        <span class="category-icon">${icon}</span>
        ${title}
      </h4>
      <div class="category-items">
        <div class="customize-item">
          <div class="item-info">
            <span class="item-icon">${icon}</span>
            <span class="item-name">${title} 5-Pack</span>
          </div>
          <div class="item-controls">
            <div class="quantity-controls">
              <button class="qty-btn qty-minus" data-type="${type}" data-item="base">−</button>
              <span class="qty-display" data-type="${type}" data-item="base">${baseQuantity}</span>
              <button class="qty-btn qty-plus" data-type="${type}" data-item="base">+</button>
            </div>
            <span class="price-delta" data-type="${type}" data-item="base">$0.00</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render cold sides section - DIRECT FIRESTORE DATA (no enrichment)
 */
function renderColdSidesSection(coldSides) {
  // Get Firestore data for matching
  const firestoreData = wizardState.step5Data?.coldSides || [];

  // Match package items with Firestore data by name
  const items = coldSides.map((side, index) => {
    const itemName = side.item || side;
    const match = firestoreData.find(fsItem =>
      fsItem.name.toLowerCase().includes(itemName.toLowerCase()) ||
      itemName.toLowerCase().includes(fsItem.name.toLowerCase())
    );

    if (match) {
      // Use complete Firestore object with imageUrl
      return {
        ...match,
        quantity: side.quantity || 1,
        index: index  // Keep index for quantity controls
      };
    } else {
      // Fallback if no match
      console.warn(`⚠️ No Firestore match for cold side: ${itemName}`);
      return {
        id: itemName.toLowerCase().replace(/\s+/g, '-'),
        name: itemName,
        description: "Delicious and fresh",
        imageUrl: null,
        quantity: side.quantity || 1,
        index: index
      };
    }
  });

  let html = `
    <div class="customize-category">
      <h4 class="category-title">
        <span class="category-icon">🥗</span>
        Cold Sides
      </h4>
  `;

  // Use photo card selector
  html += renderPhotoCardSelector({
    category: 'coldSides',
    items: items,
    selectedId: null,  // Not selection mode
    multiSelect: false,
    onSelect: null
  });

  // Add quantity overlays to each card
  items.forEach(item => {
    const baseQuantity = item.quantity || 0;
    html += `
      <div class="qty-overlay" data-type="coldSides" data-item="${item.index}">
        <div class="qty-controls">
          <button class="qty-btn qty-minus" data-type="coldSides" data-item="${item.index}">−</button>
          <span class="qty-display" data-type="coldSides" data-item="${item.index}">${baseQuantity}</span>
          <button class="qty-btn qty-plus" data-type="coldSides" data-item="${item.index}">+</button>
        </div>
        <span class="price-delta" data-type="coldSides" data-item="${item.index}">$0.00</span>
      </div>
    `;
  });

  html += '</div>';
  return html;
}

/**
 * Render salads section - DIRECT FIRESTORE DATA (no enrichment)
 */
function renderSaladsSection(salads) {
  // Get Firestore data for matching
  const firestoreData = wizardState.step5Data?.salads || [];

  // Match package items with Firestore data by name
  const items = salads.map((salad, index) => {
    const itemName = salad.item || salad;
    const match = firestoreData.find(fsItem =>
      fsItem.name.toLowerCase().includes(itemName.toLowerCase()) ||
      itemName.toLowerCase().includes(fsItem.name.toLowerCase())
    );

    if (match) {
      // Use complete Firestore object with imageUrl
      return {
        ...match,
        quantity: salad.quantity || 1,
        index: index
      };
    } else {
      // Fallback if no match
      console.warn(`⚠️ No Firestore match for salad: ${itemName}`);
      return {
        id: itemName.toLowerCase().replace(/\s+/g, '-'),
        name: itemName,
        description: "Fresh and crisp",
        imageUrl: null,
        quantity: salad.quantity || 1,
        index: index
      };
    }
  });

  let html = `
    <div class="customize-category">
      <h4 class="category-title">
        <span class="category-icon">🥗</span>
        Salads
      </h4>
  `;

  // Use photo card selector
  html += renderPhotoCardSelector({
    category: 'salads',
    items: items,
    selectedId: null,
    multiSelect: false,
    onSelect: null
  });

  // Add quantity overlays to each card
  items.forEach(item => {
    const baseQuantity = item.quantity || 0;
    html += `
      <div class="qty-overlay" data-type="salads" data-item="${item.index}">
        <div class="qty-controls">
          <button class="qty-btn qty-minus" data-type="salads" data-item="${item.index}">−</button>
          <span class="qty-display" data-type="salads" data-item="${item.index}">${baseQuantity}</span>
          <button class="qty-btn qty-plus" data-type="salads" data-item="${item.index}">+</button>
        </div>
        <span class="price-delta" data-type="salads" data-item="${item.index}">$0.00</span>
      </div>
    `;
  });

  html += '</div>';
  return html;
}

/**
 * Render desserts section - DIRECT FIRESTORE DATA (no enrichment)
 */
function renderDessertsSection(desserts) {
  // Get Firestore data for matching
  const firestoreData = wizardState.step5Data?.desserts || [];

  // Match package items with Firestore data by name
  const items = desserts.map((dessert, index) => {
    const itemName = dessert.item || dessert;
    const match = firestoreData.find(fsItem =>
      fsItem.name.toLowerCase().includes(itemName.toLowerCase()) ||
      itemName.toLowerCase().includes(fsItem.name.toLowerCase())
    );

    if (match) {
      // Use complete Firestore object with imageUrl
      return {
        ...match,
        quantity: dessert.quantity || 1,
        index: index
      };
    } else {
      // Fallback if no match
      console.warn(`⚠️ No Firestore match for dessert: ${itemName}`);
      return {
        id: itemName.toLowerCase().replace(/\s+/g, '-'),
        name: itemName,
        description: "Sweet treat",
        imageUrl: null,
        quantity: dessert.quantity || 1,
        index: index
      };
    }
  });

  let html = `
    <div class="customize-category">
      <h4 class="category-title">
        <span class="category-icon">🍰</span>
        Desserts
      </h4>
  `;

  // Use photo card selector
  html += renderPhotoCardSelector({
    category: 'desserts',
    items: items,
    selectedId: null,
    multiSelect: false,
    onSelect: null
  });

  // Add quantity overlays to each card
  items.forEach(item => {
    const baseQuantity = item.quantity || 0;
    html += `
      <div class="qty-overlay" data-type="desserts" data-item="${item.index}">
        <div class="qty-controls">
          <button class="qty-btn qty-minus" data-type="desserts" data-item="${item.index}">−</button>
          <span class="qty-display" data-type="desserts" data-item="${item.index}">${baseQuantity}</span>
          <button class="qty-btn qty-plus" data-type="desserts" data-item="${item.index}">+</button>
        </div>
        <span class="price-delta" data-type="desserts" data-item="${item.index}">$0.00</span>
      </div>
    `;
  });

  html += '</div>';
  return html;
}

/**
 * Render beverages section - DIRECT FIRESTORE DATA (no enrichment)
 */
function renderBeveragesSection(hotBeverages, coldBeverages) {
  // Get Firestore data for matching
  const firestoreData = wizardState.step5Data?.beverages || [];
  let html = '';

  // Helper function to match and prepare beverage items
  const prepareItems = (beverages) => {
    return beverages.map((bev, index) => {
      const itemName = bev.item || bev;
      const match = firestoreData.find(fsItem =>
        fsItem.name.toLowerCase().includes(itemName.toLowerCase()) ||
        itemName.toLowerCase().includes(fsItem.name.toLowerCase())
      );

      if (match) {
        // Use complete Firestore object with imageUrl
        return {
          ...match,
          quantity: bev.quantity || 1,
          index: index
        };
      } else {
        // Fallback if no match
        console.warn(`⚠️ No Firestore match for beverage: ${itemName}`);
        return {
          id: itemName.toLowerCase().replace(/\s+/g, '-'),
          name: itemName,
          description: "Refreshing beverage",
          imageUrl: null,
          quantity: bev.quantity || 1,
          index: index
        };
      }
    });
  };

  // Render hot beverages if any
  if (hotBeverages && hotBeverages.length > 0) {
    const items = prepareItems(hotBeverages);

    html += `
      <div class="customize-category">
        <h4 class="category-title">
          <span class="category-icon">☕</span>
          Hot Beverages
        </h4>
    `;

    html += renderPhotoCardSelector({
      category: 'hotBeverages',
      items: items,
      selectedId: null,
      multiSelect: false,
      onSelect: null
    });

    // Add quantity overlays
    items.forEach(item => {
      const baseQuantity = item.quantity || 0;
      html += `
        <div class="qty-overlay" data-type="hotBeverages" data-item="${item.index}">
          <div class="qty-controls">
            <button class="qty-btn qty-minus" data-type="hotBeverages" data-item="${item.index}">−</button>
            <span class="qty-display" data-type="hotBeverages" data-item="${item.index}">${baseQuantity}</span>
            <button class="qty-btn qty-plus" data-type="hotBeverages" data-item="${item.index}">+</button>
          </div>
          <span class="price-delta" data-type="hotBeverages" data-item="${item.index}">$0.00</span>
        </div>
      `;
    });

    html += '</div>';
  }

  // Render cold beverages if any
  if (coldBeverages && coldBeverages.length > 0) {
    const items = prepareItems(coldBeverages);

    html += `
      <div class="customize-category">
        <h4 class="category-title">
          <span class="category-icon">🥤</span>
          Cold Beverages
        </h4>
    `;

    html += renderPhotoCardSelector({
      category: 'coldBeverages',
      items: items,
      selectedId: null,
      multiSelect: false,
      onSelect: null
    });

    // Add quantity overlays
    items.forEach(item => {
      const baseQuantity = item.quantity || 0;
      html += `
        <div class="qty-overlay" data-type="coldBeverages" data-item="${item.index}">
          <div class="qty-controls">
            <button class="qty-btn qty-minus" data-type="coldBeverages" data-item="${item.index}">−</button>
            <span class="qty-display" data-type="coldBeverages" data-item="${item.index}">${baseQuantity}</span>
            <button class="qty-btn qty-plus" data-type="coldBeverages" data-item="${item.index}">+</button>
          </div>
          <span class="price-delta" data-type="coldBeverages" data-item="${item.index}">$0.00</span>
        </div>
      `;
    });

    html += '</div>';
  }

  return html;
}

/**
 * Render package summary (right panel)
 */
function renderPackageSummary() {
  const pkg = wizardState.selectedPackage;
  if (!pkg) return '';

  return `
    <div class="price-summary">
      <div class="summary-header">
        <h4>${pkg.name}</h4>
        <p class="summary-serves">Serves ${pkg.servesMin}-${pkg.servesMax} people</p>
        <p class="summary-base-price">Base Price: <strong>$${pkg.basePrice || 209.99}</strong></p>
      </div>

      <div class="summary-divider"></div>

      <div class="summary-selections">
        <h5>What's Included:</h5>
        <div id="summary-items-list">
          <!-- Dynamic list populated by JS -->
        </div>
      </div>

      <div class="summary-divider"></div>

      <div class="summary-pricing">
        <div class="price-line">
          <span>Base Package:</span>
          <span id="base-price-display">$${pkg.basePrice || 209.99}</span>
        </div>
        <div class="price-line" id="added-items-line" style="display: none;">
          <span>Added Items:</span>
          <span id="added-items-price">+$0.00</span>
        </div>
        <div class="price-line" id="removed-items-line" style="display: none;">
          <span>Removed Items:</span>
          <span id="removed-items-price">-$0.00</span>
        </div>

        <!-- SHARD 5: 20% Cap Warning -->
        <div id="cap-warning" class="cap-warning" style="display: none;">
          <div class="cap-warning-icon">⚠️</div>
          <div class="cap-warning-content">
            <strong>Removal Credit Limit Reached</strong>
            <p>Maximum removal credit is 20% of base price (<span id="max-credit-amount">$0.00</span>).
            Please add items back or remove fewer items.</p>
          </div>
        </div>

        <div class="summary-divider"></div>
        <div class="price-line price-total">
          <span>Your Total:</span>
          <strong id="current-total-price">$${pkg.basePrice || 209.99}</strong>
        </div>
      </div>
    </div>
  `;
}

// Placeholder pricing functions removed - now using modification-pricing.js
// Real pricing integration completed October 26, 2025

/**
 * Step 6: Add-ons & Extras (Masonry Layout)
 */
async function renderStep6AddOns(addOns) {
  // Get add-ons split by category for masonry layout
  const categorizedAddOns = await getAllAddOnsSplitByCategory();

  return `
    <div class="wizard-step" id="step-6" style="display: none;">
      <div class="step-content">
        <h3 class="step-title">Add Extras (Optional)</h3>
        <p class="step-description">Make your event even better with these add-ons</p>

        <!-- Horizontal Scroll Categories -->
        <div class="masonry-categories">
          ${renderMasonryCategory('Quick-Adds & Essentials', '🥤', categorizedAddOns.quickAdds || [], false)}
          ${renderMasonryCategory('Premium Hot Beverages', '☕', categorizedAddOns.hotBeverages || [], true)}
          ${renderMasonryCategory('Cold Beverages', '🧃', categorizedAddOns.beverages || [], false)}
          ${renderMasonryCategory('Fresh Salads & Veggies', '🥗', categorizedAddOns.salads || [], false)}
          ${renderMasonryCategory('Premium Sides', '🥔', categorizedAddOns.sides || [], false)}
          ${renderMasonryCategory('Sweet Endings', '🍰', categorizedAddOns.desserts || [], false)}
          ${renderMasonryCategory('Sauces To-Go', '🌶️', categorizedAddOns.saucesToGo || [], false)}
          ${renderMasonryCategory('Dips To-Go', '🥫', categorizedAddOns.dipsToGo || [], false)}
        </div>

        <div class="skip-addons">
          <p>Don't need extras? <button class="btn-text" id="skip-addons">Skip this step →</button></p>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render masonry category with horizontal scroll
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
 * Get category icon fallback
 */
function getIconForCategory(category) {
  const iconMap = {
    'beverage': '🥤',
    'hot-beverage': '☕',
    'salad': '🥗',
    'side': '🥔',
    'dessert': '🍰',
    'sauce': '🌶️',
    'dip': '🥫',
    'quick-add': '⚡'
  };
  const icon = iconMap[category] || '🍽️';
  return `<div class="category-icon-fallback">${icon}</div>`;
}

/**
 * Step 7: Review & Contact
 */
function renderStep7ReviewContact() {
  return `
    <div class="wizard-step" id="step-7" style="display: none;">
      <div class="step-content">
        <h3 class="step-title">Review Your Order</h3>
        <p class="step-description">Almost there! Let's confirm your selections</p>

        <div class="order-summary">
          <div class="summary-section">
            <h4>Event Details</h4>
            <div id="summary-event"></div>
          </div>

          <div class="summary-section">
            <h4>Package</h4>
            <div id="summary-package"></div>
          </div>

          <div class="summary-section">
            <h4>Sauces</h4>
            <div id="summary-sauces"></div>
          </div>

          <div class="summary-section" id="summary-addons-section" style="display: none;">
            <h4>Add-ons</h4>
            <div id="summary-addons"></div>
          </div>
        </div>

        <div class="contact-form">
          <h4>Your Contact Information</h4>
          <p class="form-intro">We'll use this to follow up with your quote and finalize details</p>

          <div class="form-row">
            <div class="form-group">
              <label for="contact-name">Name *</label>
              <input type="text" id="contact-name" class="form-input" required>
            </div>
            <div class="form-group">
              <label for="contact-company">Company</label>
              <input type="text" id="contact-company" class="form-input">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="contact-email">Email *</label>
              <input type="email" id="contact-email" class="form-input" required>
            </div>
            <div class="form-group">
              <label for="contact-phone">Phone *</label>
              <input type="tel" id="contact-phone" class="form-input" required>
            </div>
          </div>

          <div class="form-group">
            <label for="contact-notes">Special Requests or Notes</label>
            <textarea id="contact-notes" class="form-textarea" rows="3" placeholder="Dietary restrictions, delivery instructions, etc."></textarea>
          </div>
        </div>

        <div class="submit-quote">
          <button id="submit-quote-request" class="btn-primary btn-large">
            Get Your Free Quote
          </button>
          <p class="submit-note">We'll respond within 2 hours during business hours</p>
        </div>
      </div>
    </div>
  `;
}

/**
 * Fetch data functions
 */
async function fetchCateringPackages() {
  try {
    const q = query(
      collection(db, 'cateringPackages'),
      where('active', '==', true),
      orderBy('tier', 'asc')
    );
    const snapshot = await getDocs(q);
    const rawPackages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log('📦 Fetched packages (raw):', rawPackages.length, 'packages');

    // Deduplicate packages, preferring ones WITH themes
    const packageMap = {};
    rawPackages.forEach(pkg => {
      const existing = packageMap[pkg.id];
      if (!existing) {
        // First time seeing this package
        packageMap[pkg.id] = pkg;
      } else {
        // Duplicate found - keep the one WITH themes
        if (pkg.themes && pkg.themes.length > 0 && (!existing.themes || existing.themes.length === 0)) {
          console.warn(`🔄 Replacing ${pkg.id} without themes with version that has themes`);
          packageMap[pkg.id] = pkg;
        }
      }
    });

    const packages = Object.values(packageMap);
    console.log('📦 Deduplicated packages:', packages.length, 'packages');
    console.log('📦 Package IDs:', packages.map(p => p.id));

    // Verify all packages have themes
    const missingThemes = packages.filter(pkg => !pkg.themes || pkg.themes.length === 0);
    if (missingThemes.length > 0) {
      console.error('❌ Packages still missing themes after dedup:', missingThemes.map(p => p.id));
    } else {
      console.log('✅ All packages have themes!');
    }

    return packages;
  } catch (error) {
    console.error('❌ Error fetching packages:', error);
    const fallback = getSamplePackages();
    console.log('⚠️ Using sample packages:', fallback.length);
    return fallback;
  }
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

async function fetchAddOns() {
  try {
    const q = query(
      collection(db, 'cateringAddOns'),
      where('active', '==', true),
      orderBy('category', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching add-ons:', error);
    return [];
  }
}

/**
 * Sample data fallbacks
 */
function getSamplePackages() {
  return [
    {
      id: 'sampler',
      name: 'Sampler Spread',
      servesMin: 10,
      servesMax: 12,
      totalWings: 100,
      sauceCount: 3,
      sidesIncluded: 'Fries for 10',
      dipsIncluded: '3 Ranch Cups',
      popular: true,
      description: 'Perfect for office lunches and small team meetings'
    },
    {
      id: 'lunch-box',
      name: 'Lunch Box Special',
      servesMin: 12,
      servesMax: 15,
      totalWings: 125,
      sauceCount: 4,
      sidesIncluded: 'Fries for 12',
      dipsIncluded: '4 Ranch Cups',
      description: 'Great for larger teams and celebrations'
    }
  ];
}

function getSampleSauces() {
  return [
    { id: 'buffalo', name: 'Classic Buffalo', heatLevel: 2, description: 'The original' },
    { id: 'bbq', name: 'Sweet BBQ', heatLevel: 0, description: 'Tangy & sweet' },
    { id: 'honey-hot', name: 'Honey Hot', heatLevel: 3, description: 'Sweet heat balance' },
    { id: 'garlic-parm', name: 'Garlic Parmesan', heatLevel: 0, description: 'Savory favorite' }
  ];
}

/**
 * Utility functions
 */
function isDipCategory(category = '') {
  const normalized = String(category).toLowerCase();
  if (!normalized) return false;
  return normalized === 'dip' ||
         normalized === 'dipping-sauce' ||
         normalized.includes('dip');
}

function getMinDate() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
}

/**
 * Initialize wing customization component for Step 3 (SHARD-2)
 */
export function initWingCustomization() {
  if (!wizardState.selectedPackage) {
    console.error('Cannot initialize wing customization: no package selected');
    return;
  }

  const container = document.getElementById('wing-customization-container');
  if (!container) {
    console.error('Wing customization container not found');
    return;
  }

  // Initialize default wing distribution (all boneless) if not already set
  if (!wizardState.wingDistribution) {
    wizardState.wingDistribution = {
      distribution: {
        plantBased: 0,
        boneless: wizardState.selectedPackage.wingOptions.totalWings,
        boneIn: 0
      },
      prepMethod: null,
      drumStyle: 'mixed'
    };
    console.log('🍗 Initialized default wing distribution:', wizardState.wingDistribution);
  }

  // Create or recreate the component
  wingCustomizationComponent = new WingCustomization({
    package: wizardState.selectedPackage,
    context: null, // TODO: Integrate with CateringCustomizationContext from SHARD-8A
    container: container,
    onCustomizationChange: (data) => {
      wizardState.wingDistribution = data;
      console.log('Wing distribution updated:', data);
    }
  });

  console.log('🍗 Wing customization component initialized');
}

export { wizardState, wingCustomizationComponent, initializeStep4SauceAllocation, initializeStep5CustomizePackage };
