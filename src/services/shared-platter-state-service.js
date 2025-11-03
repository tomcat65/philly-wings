/**
 * Shared Platters V2 - Centralized State Management Service
 *
 * Manages the complete state for the shared platters catering flow with:
 * - Two-path entry system (Quick Browse vs Guided Planner)
 * - Complex nested configuration (wings, sauces, dips, sides, desserts, beverages)
 * - Draft persistence with localStorage (24hr expiry)
 * - Event system for reactive updates (pub/sub pattern)
 * - Step validation before transitions
 *
 * Created: 2025-10-26
 * Epic: SP-V2-001
 * Story: SP-005 (State Management Setup)
 */

import { getPackageById } from './catering-service.js';
import { recalculatePricing as aggregatorRecalculatePricing } from '../utils/pricing-aggregator.js';

// ===== INITIAL STATE TEMPLATE =====
const INITIAL_STATE = {
  // Flow metadata
  flowType: null,                     // 'quick-browse' | 'guided-planner'
  currentStep: 'entry-choice',        // Current step in the flow
  lastUpdated: null,                  // Timestamp of last state change

  // Selected package from cateringPackages collection
  selectedPackage: null,              // Full package object from Firestore

  // Event details (captured in Guided Planner path)
  eventDetails: {
    guestCount: 10,                   // Default minimum
    eventType: '',                    // 'corporate' | 'sports' | 'party' | 'other'
    dietaryNeeds: []                  // ['vegetarian', 'vegan', 'gluten-free', 'nut-allergies', 'other']
  },

  // Current customization configuration
  currentConfig: {
    // Wings distribution
    wingDistribution: {
      boneless: 0,
      boneIn: 0,
      cauliflower: 0,                  // NEW: Plant-based wings
      boneInStyle: 'mixed',            // 'mixed' | 'flats' | 'drums'
      distributionSource: null         // NEW: 'conversational-wizard' | 'manual' | null
    },

    // Sauces (multiple selections based on package)
    sauces: [],                       // [{id, name, heatLevel, imageUrl, quantity}]

    // Dips
    dips: [],                         // [{id, name, quantity}]
    noDips: false,                    // Skip dips option

    // Sides
    sides: {
      chips: { quantity: 0 },         // Miss Vickie's 5-packs
      coldSides: [],                  // [{id, name, quantity, serves}]
      salads: []                      // [{id, name, quantity, serves}]
    },

    // Desserts
    desserts: [],                     // [{id, name, quantity, servings}]

    // Beverages (UNIQUE TO SHARED PLATTERS)
    beverages: {
      cold: [],                       // [{id, name, size, quantity, serves}]
      hot: []                         // [{id, name, size, quantity, serves}]
    },

    // Special instructions
    specialInstructions: ''
  },

  // Add-ons from "Nobody Left Behind" screen
  extras: {
    quickAdds: [],                    // Popular add-ons
    additionalWings: [],              // Extra wings
    premiumSides: [],                 // Premium sides
    desserts: [],                     // Extra desserts
    beverages: []                     // Extra beverages
  },

  // Contact & delivery information
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
    deliveryDate: '',                 // YYYY-MM-DD
    deliveryTime: '',                 // HH:MM
    notes: ''
  },

  // Pricing breakdown
  pricing: {
    basePrice: 0,
    modificationsTotal: 0,            // From Richard's pricing system
    extrasTotal: 0,
    subtotal: 0,
    tax: 0,
    total: 0
  },

  // Progress tracking
  progress: {
    wingsComplete: false,
    saucesComplete: false,
    dipsComplete: false,
    sidesComplete: false,
    dessertsComplete: false,
    beveragesComplete: false,
    extrasComplete: false,
    contactComplete: false
  }
};

/**
 * Deep clone helper for state management
 * Uses structuredClone if available, falls back to JSON serialization
 * @returns {Object} Deep copy of INITIAL_STATE
 */
function cloneInitialState() {
  if (typeof structuredClone !== 'undefined') {
    return structuredClone(INITIAL_STATE);
  }
  return JSON.parse(JSON.stringify(INITIAL_STATE));
}

// ===== STATE MANAGEMENT =====
let currentState = cloneInitialState();
const stateListeners = {};  // Event subscribers
const DRAFT_KEY = 'philly-wings-shared-platter-draft';
const DRAFT_VERSION = 1;  // Schema version for draft migration
const DRAFT_EXPIRY_HOURS = 24;
let saveDraftTimeout = null;  // For debouncing

/**
 * Get current state (immutable copy)
 * @returns {Object} Deep copy of current state
 */
export function getState() {
  return JSON.parse(JSON.stringify(currentState));
}

/**
 * Get initial state template (for testing)
 * @returns {Object} Deep copy of INITIAL_STATE
 */
export function getInitialState() {
  return cloneInitialState();
}

/**
 * Update state at a specific path
 * @param {string} path - Dot-notation path (e.g., 'currentConfig.sauces')
 * @param {*} value - New value to set
 * @param {boolean} silent - If true, don't publish change event
 */
export function updateState(path, value, silent = false) {
  const pathParts = path.split('.');
  let target = currentState;

  // Navigate to parent object
  for (let i = 0; i < pathParts.length - 1; i++) {
    if (!target[pathParts[i]]) {
      target[pathParts[i]] = {};
    }
    target = target[pathParts[i]];
  }

  // Set value
  const key = pathParts[pathParts.length - 1];
  target[key] = value;

  // Update lastUpdated timestamp
  currentState.lastUpdated = new Date().toISOString();

  // Publish change event
  if (!silent) {
    publishStateChange(path, value);
  }

  // Auto-save draft
  saveDraft();
}

/**
 * Batch update multiple state paths
 * @param {Object} updates - Object with path:value pairs
 */
export function batchUpdate(updates) {
  Object.entries(updates).forEach(([path, value]) => {
    updateState(path, value, true);  // Silent updates
  });

  // Publish changes for each path individually
  Object.entries(updates).forEach(([path, value]) => {
    publishStateChange(path, value);
  });

  // Also publish wildcard event
  publishStateChange('*', currentState);
  saveDraft();
}

/**
 * Reset state to initial
 * @param {boolean} clearDraft - If true, also clear localStorage draft
 */
export function resetState(clearDraft = true) {
  currentState = cloneInitialState();
  currentState.lastUpdated = new Date().toISOString();

  if (clearDraft) {
    localStorage.removeItem(DRAFT_KEY);
  }

  publishStateChange('*', currentState);
}

/**
 * Validate state for a specific step
 * @param {string} step - Step to validate
 * @returns {Object} {valid: boolean, errors: string[]}
 */
export function validateState(step) {
  const errors = [];

  switch (step) {
    case 'entry-choice':
      // Always valid
      break;

    case 'package-selection':
    case 'package-gallery':
      if (!currentState.selectedPackage) {
        errors.push('Please select a package');
      }
      break;

    case 'event-details':
      if (currentState.flowType === 'guided-planner') {
        if (!currentState.eventDetails.guestCount || currentState.eventDetails.guestCount < 10) {
          errors.push('Guest count must be at least 10');
        }
        if (!currentState.eventDetails.eventType) {
          errors.push('Please select an event type');
        }
      }
      break;

    case 'package-recommendations':
      if (!currentState.selectedPackage) {
        errors.push('Please select a package from recommendations');
      }
      break;

    case 'customization':
      if (!currentState.selectedPackage) {
        errors.push('No package selected');
      }
      // Wing distribution validation
      const totalWings = currentState.currentConfig.wingDistribution.boneless +
                         currentState.currentConfig.wingDistribution.boneIn;
      const expectedTotalWings = currentState.selectedPackage?.wingOptions?.totalWings;
      if (currentState.selectedPackage && expectedTotalWings && totalWings !== expectedTotalWings) {
        errors.push(`Wing distribution must total ${expectedTotalWings} wings`);
      }
      // Sauce validation
      if (currentState.currentConfig.sauces.length === 0) {
        errors.push('Please select at least one sauce');
      }
      break;

    case 'contact':
      const { contact } = currentState;
      if (!contact.company) errors.push('Company name required');
      if (!contact.name) errors.push('Contact name required');
      if (!contact.email) errors.push('Email required');
      if (!contact.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errors.push('Valid email required');
      if (!contact.phone) errors.push('Phone number required');
      if (!contact.deliveryAddress.street) errors.push('Delivery address required');
      if (!contact.deliveryAddress.city) errors.push('City required');
      if (!contact.deliveryAddress.state) errors.push('State required');
      if (!contact.deliveryAddress.zip) errors.push('ZIP code required');
      if (!contact.deliveryDate) errors.push('Delivery date required');
      if (!contact.deliveryTime) errors.push('Delivery time required');
      break;
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// ===== EVENT SYSTEM (PUB/SUB) =====

/**
 * Subscribe to state changes
 * @param {string} path - Path to watch ('*' for all changes, 'foo.*' for wildcard)
 * @param {Function} callback - Function to call on change (receives value)
 * @returns {Function} Unsubscribe function
 */
export function onStateChange(path, callback) {
  if (!stateListeners[path]) {
    stateListeners[path] = [];
  }

  stateListeners[path].push(callback);

  // Return unsubscribe function
  return () => {
    const index = stateListeners[path].indexOf(callback);
    if (index > -1) {
      stateListeners[path].splice(index, 1);
    }
  };
}

/**
 * Subscribe to all state changes (convenience wrapper)
 * @param {Function} callback - Function to call on any change
 * @returns {Function} Unsubscribe function
 */
export function subscribeAll(callback) {
  return onStateChange('*', callback);
}

/**
 * Publish state change event
 * @param {string} path - Path that changed
 * @param {*} value - New value
 */
function publishStateChange(path, value) {
  // Notify exact path listeners
  if (stateListeners[path]) {
    stateListeners[path].forEach(callback => callback(value, path));
  }

  // Notify wildcard/glob listeners (e.g., 'currentConfig.*' matches 'currentConfig.sauces')
  Object.keys(stateListeners).forEach(listenerPath => {
    if (listenerPath !== path && listenerPath !== '*' && listenerPath.endsWith('.*')) {
      const prefix = listenerPath.slice(0, -2); // Remove '.*'
      if (path.startsWith(prefix + '.')) {
        stateListeners[listenerPath].forEach(callback => callback(value, path));
      }
    }
  });

  // Notify global wildcard listeners
  if (stateListeners['*'] && path !== '*') {
    stateListeners['*'].forEach(callback => callback(value, path));
  }
}

// ===== LOCALSTORAGE DRAFT PERSISTENCE =====

/**
 * Save current state to localStorage as draft (debounced 1 second)
 */
export function saveDraft() {
  // Clear existing timeout
  if (saveDraftTimeout) {
    clearTimeout(saveDraftTimeout);
  }

  // Set new debounced save
  saveDraftTimeout = setTimeout(() => {
    try {
      const draft = {
        version: DRAFT_VERSION,
        state: currentState,
        savedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + DRAFT_EXPIRY_HOURS * 60 * 60 * 1000).toISOString()
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch (error) {
      console.error('Failed to save draft:', error);
    }
  }, 1000); // 1 second debounce
}

/**
 * Migrate draft from older versions
 * @param {Object} draft - Draft object to migrate
 * @returns {Object} Migrated draft
 */
function migrateDraft(draft) {
  const version = draft.version || 0;

  // Version 0 -> 1 (example migration)
  if (version < 1) {
    console.log('Migrating draft from version', version, 'to 1');
    // No actual schema changes yet, just add version
    draft.version = 1;
  }

  // Future migrations go here
  // if (version < 2) { ... }

  return draft;
}

/**
 * Deep merge helper - merges source onto target recursively
 * @param {Object} target - Base object
 * @param {Object} source - Object to merge in
 * @returns {Object} Merged object
 */
function deepMerge(target, source) {
  const result = { ...target };

  const cloneValue = value => {
    if (Array.isArray(value)) {
      return value.map(item => cloneValue(item));
    }
    if (value && typeof value === 'object') {
      return deepMerge({}, value);
    }
    return value;
  };

  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const value = source[key];

      if (Array.isArray(value)) {
        result[key] = cloneValue(value);
      } else if (value && typeof value === 'object') {
        result[key] = deepMerge(target[key] || {}, value);
      } else {
        result[key] = value;
      }
    }
  }

  return result;
}

/**
 * Load draft from localStorage
 * @returns {boolean} True if draft loaded successfully
 */
export function loadDraft() {
  try {
    const draftJson = localStorage.getItem(DRAFT_KEY);
    if (!draftJson) {
      return false;
    }

    let draft = JSON.parse(draftJson);

    // Check expiry
    if (new Date(draft.expiresAt) < new Date()) {
      console.log('Draft expired, clearing...');
      localStorage.removeItem(DRAFT_KEY);
      return false;
    }

    // Migrate if needed
    if (!draft.version || draft.version < DRAFT_VERSION) {
      draft = migrateDraft(draft);
    }

    // Deep clone initial state and merge draft onto it
    // This ensures any new schema keys are present
    const baseState = cloneInitialState();
    currentState = deepMerge(baseState, draft.state);

    // CRITICAL FIX (SP-OS-S1): Refresh package data from Firestore
    // Draft may have stale package schema missing pricing fields (defaultDistribution, perWingCosts)
    // This async refresh ensures latest package schema is loaded
    if (currentState.selectedPackage?.id) {
      refreshPackageFromFirestore(currentState.selectedPackage.id);
    }

    publishStateChange('*', currentState);

    console.log('Draft loaded successfully (saved', draft.savedAt, ')');
    return true;
  } catch (error) {
    console.error('Failed to load draft:', error);
    return false;
  }
}

/**
 * Check if a draft exists and is valid
 * @returns {Object|null} Draft info or null
 */
export function getDraftInfo() {
  try {
    const draftJson = localStorage.getItem(DRAFT_KEY);
    if (!draftJson) return null;

    const draft = JSON.parse(draftJson);

    // Check expiry
    if (new Date(draft.expiresAt) < new Date()) {
      return null;
    }

    return {
      savedAt: draft.savedAt,
      expiresAt: draft.expiresAt,
      packageName: draft.state.selectedPackage?.name || 'Unknown'
    };
  } catch (error) {
    return null;
  }
}

/**
 * Clear draft from localStorage
 */
export function clearDraft() {
  localStorage.removeItem(DRAFT_KEY);
}

// ===== HELPER FUNCTIONS =====

/**
 * Get value at specific path
 * @param {string} path - Dot-notation path
 * @returns {*} Value at path or undefined
 */
export function getValue(path) {
  const pathParts = path.split('.');
  let value = currentState;

  for (const part of pathParts) {
    if (value === undefined || value === null) {
      return undefined;
    }
    value = value[part];
  }

  return value;
}

/**
 * Refresh package data from Firestore (SP-OS-S1 fix)
 * Used after loading draft to ensure latest package schema with pricing fields
 * @param {string} packageId - Package ID to refresh
 */
async function refreshPackageFromFirestore(packageId) {
  try {
    console.log('🔄 Refreshing package from Firestore:', packageId);

    const freshPackage = await getPackageById(packageId);

    if (!freshPackage) {
      console.warn('⚠️ Package not found in Firestore:', packageId);
      return;
    }

    console.log('✅ Fresh package loaded with schema:', {
      hasDefaultDistribution: !!freshPackage.wingOptions?.defaultDistribution,
      hasPerWingCosts: !!freshPackage.wingOptions?.perWingCosts,
      wingOptions: freshPackage.wingOptions
    });

    // Update state with fresh package data
    currentState.selectedPackage = freshPackage;

    // Publish package change
    publishStateChange('selectedPackage', freshPackage);

    // Trigger pricing recalculation with fresh package data
    aggregatorRecalculatePricing(currentState, { trigger: 'package-refresh' });

    console.log('✅ Package refreshed and pricing recalculated');

  } catch (error) {
    console.error('❌ Failed to refresh package from Firestore:', error);
    // Don't crash - just log error and continue with draft package
  }
}

/**
 * Set selected package and initialize defaults
 * @param {Object} packageObj - Package object from Firestore
 */
export function setPackage(packageObj) {
  currentState.selectedPackage = packageObj;

  const totalWings = packageObj.wingOptions?.totalWings || 0;

  // Check if user made plant-based choice in event planner wizard
  const wizardPercentages = currentState.eventDetails?.wingDistributionPercentages;

  if (wizardPercentages && wizardPercentages.plantBased > 0) {
    // PRESERVE user's wizard choice
    const plantBasedCount = Math.round((totalWings * wizardPercentages.plantBased) / 100);
    const traditionalCount = totalWings - plantBasedCount;

    // Split traditional between boneless/bone-in (default 60/40)
    const bonelessCount = Math.round(traditionalCount * 0.6);
    const boneInCount = traditionalCount - bonelessCount;

    currentState.currentConfig.wingDistribution = {
      boneless: bonelessCount,
      boneIn: boneInCount,
      cauliflower: plantBasedCount,
      boneInStyle: 'mixed',
      distributionSource: 'event-planner'
    };
  } else {
    // No wizard choice - use default (all boneless)
    currentState.currentConfig.wingDistribution = {
      boneless: totalWings,
      boneIn: 0,
      cauliflower: 0,
      boneInStyle: 'mixed',
      distributionSource: null
    };
  }

  // Initialize base price
  currentState.pricing.basePrice = packageObj.basePrice || 0;
  recalculatePricing();

  console.log('🐛 [DEBUG] setPackage() completed');
  console.log('  totalWings:', totalWings);
  console.log('  wizardPercentages:', wizardPercentages);
  if (wizardPercentages && wizardPercentages.plantBased > 0) {
    console.log('  plantBasedCount calculated:', Math.round((totalWings * wizardPercentages.plantBased) / 100));
    console.log('  traditionalCount calculated:', totalWings - Math.round((totalWings * wizardPercentages.plantBased) / 100));
  }
  console.log('  wingDistribution SET TO:', {
    boneless: currentState.currentConfig.wingDistribution.boneless,
    boneIn: currentState.currentConfig.wingDistribution.boneIn,
    cauliflower: currentState.currentConfig.wingDistribution.cauliflower,
    boneInStyle: currentState.currentConfig.wingDistribution.boneInStyle,
    distributionSource: currentState.currentConfig.wingDistribution.distributionSource
  });

  publishStateChange('selectedPackage', packageObj);
  saveDraft();
}

/**
 * Recalculate pricing based on current state
 * Uses Richard's modification pricing system
 */
export function recalculatePricing() {
  // TODO: Integrate with Richard's pricing system
  // For now, just calculate simple totals

  const basePrice = currentState.pricing.basePrice || 0;
  const modificationsTotal = currentState.pricing.modificationsTotal || 0;
  const extrasTotal = currentState.pricing.extrasTotal || 0;

  const subtotal = basePrice + modificationsTotal + extrasTotal;
  const tax = subtotal * 0.08; // 8% tax (Philadelphia)
  const total = subtotal + tax;

  batchUpdate({
    'pricing.subtotal': subtotal,
    'pricing.tax': tax,
    'pricing.total': total
  });
}

/**
 * Calculate sauce distribution across mixed wing types
 * Uses Approach 3: Hybrid with smart preset + optional override
 *
 * @param {Array} selectedSauces - Array of sauce objects with {id, name, heatLevel, etc.}
 * @param {Object} wingDistribution - Current wing distribution {boneless, boneIn, cauliflower}
 * @returns {Array} Sauce distribution with even split across wing types
 *
 * Algorithm:
 * 1. Calculate total wings
 * 2. Divide wings evenly among sauces (with remainder distribution)
 * 3. For each sauce, split proportionally across wing types (traditional vs plant-based)
 * 4. Within traditional, split by boneless/bone-in ratio
 *
 * Example: 250 wings (150 boneless, 50 bone-in, 50 cauliflower), 5 sauces
 * - Each sauce gets 50 wings
 * - Traditional ratio: 200/250 = 80%, Plant-based: 50/250 = 20%
 * - Per sauce: 40 traditional (30 boneless, 10 bone-in) + 10 cauliflower
 */
export function calculateSauceDistribution(selectedSauces, wingDistribution) {
  // Calculate totals
  const totalWings = wingDistribution.boneless +
                     wingDistribution.boneIn +
                     wingDistribution.cauliflower;

  const sauceCount = selectedSauces.length;

  if (sauceCount === 0 || totalWings === 0) {
    return [];
  }

  // Base wings per sauce and remainder
  const wingsPerSauce = Math.floor(totalWings / sauceCount);
  const remainder = totalWings % sauceCount;

  // Calculate ratios for proportional distribution
  const traditionalTotal = wingDistribution.boneless + wingDistribution.boneIn;
  const traditionalRatio = traditionalTotal > 0 ? traditionalTotal / totalWings : 0;
  const plantBasedRatio = wingDistribution.cauliflower / totalWings;

  const bonelessRatio = traditionalTotal > 0
    ? wingDistribution.boneless / traditionalTotal
    : 0;
  const boneInRatio = traditionalTotal > 0
    ? wingDistribution.boneIn / traditionalTotal
    : 0;

  // Distribute wings to each sauce
  return selectedSauces.map((sauce, index) => {
    // First sauces get extra wings from remainder
    const assignedWings = wingsPerSauce + (index < remainder ? 1 : 0);

    // Split by traditional vs plant-based
    const traditionalWings = Math.round(assignedWings * traditionalRatio);
    const plantBasedWings = assignedWings - traditionalWings;

    // Split traditional by boneless vs bone-in
    const bonelessWings = Math.round(traditionalWings * bonelessRatio);
    const boneInWings = traditionalWings - bonelessWings;

    return {
      id: sauce.id,
      name: sauce.name,
      heatLevel: sauce.heatLevel,
      imageUrl: sauce.imageUrl,
      wingCount: assignedWings,
      distribution: {
        boneless: bonelessWings,
        boneIn: boneInWings,
        cauliflower: plantBasedWings
      }
    };
  });
}

/**
 * Set sauce selection and calculate smart distribution
 * @param {Array} selectedSauces - Array of sauce objects
 */
export function setSauces(selectedSauces) {
  const distribution = calculateSauceDistribution(
    selectedSauces,
    currentState.currentConfig.wingDistribution
  );

  updateState('currentConfig.sauces', distribution);
  markSectionComplete('sauces');
}

/**
 * Update custom sauce distribution (user override)
 * @param {string} sauceId - Sauce ID to update
 * @param {Object} newDistribution - New distribution {boneless, boneIn, cauliflower}
 */
export function updateSauceDistribution(sauceId, newDistribution) {
  const sauces = [...currentState.currentConfig.sauces];
  const sauceIndex = sauces.findIndex(s => s.id === sauceId);

  if (sauceIndex === -1) {
    console.error('Sauce not found:', sauceId);
    return;
  }

  // Update distribution
  sauces[sauceIndex].distribution = newDistribution;
  sauces[sauceIndex].wingCount = newDistribution.boneless +
                                  newDistribution.boneIn +
                                  newDistribution.cauliflower;

  updateState('currentConfig.sauces', sauces);
}

/**
 * Validate sauce distribution totals
 * Ensures all sauces combined equal total wing count
 * @returns {Object} {valid: boolean, totalAssigned: number, expected: number}
 */
export function validateSauceDistribution() {
  const sauces = currentState.currentConfig.sauces;
  const wingDistribution = currentState.currentConfig.wingDistribution;

  const totalAssigned = sauces.reduce((sum, sauce) => sum + sauce.wingCount, 0);
  const expected = wingDistribution.boneless +
                   wingDistribution.boneIn +
                   wingDistribution.cauliflower;

  return {
    valid: totalAssigned === expected,
    totalAssigned,
    expected,
    difference: expected - totalAssigned
  };
}

/**
 * Mark a progress section as complete
 * @param {string} section - Section name (e.g., 'wings', 'sauces')
 */
export function markSectionComplete(section) {
  const key = `${section}Complete`;
  if (currentState.progress[key] !== undefined) {
    updateState(`progress.${key}`, true);
  }
}

/**
 * Check if all required sections are complete
 * @returns {boolean}
 */
export function isCustomizationComplete() {
  const { progress } = currentState;
  return progress.wingsComplete &&
         progress.saucesComplete &&
         progress.dipsComplete &&
         progress.sidesComplete &&
         progress.dessertsComplete &&
         progress.beveragesComplete;
}

// ===== INITIALIZATION =====

/**
 * Initialize state service
 * Attempts to load draft on startup
 */
export function initializeStateService() {
  // Try to load existing draft
  const draftLoaded = loadDraft();

  if (!draftLoaded) {
    console.log('No valid draft found, starting fresh');
    currentState = cloneInitialState();
    currentState.lastUpdated = new Date().toISOString();
  }

  return draftLoaded;
}

// Auto-initialize on module load
initializeStateService();
