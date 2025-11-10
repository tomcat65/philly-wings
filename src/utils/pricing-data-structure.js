/**
 * Pricing Data Structure - Normalized, Flat Structure
 *
 * Creates a normalized pricing data structure for efficient calculations,
 * caching, and rendering. Items are stored flat with unique IDs, and
 * modifiers reference items by ID to avoid data duplication.
 *
 * @module pricing-data-structure
 * @created 2025-10-31
 * @epic SP-PRICING-001
 * @story S1-Foundation
 */

/**
 * Create an empty pricing structure
 * @returns {PricingStructure} Normalized pricing structure
 */
export function createPricingStructure() {
  return {
    // Flat storage of all items (wings, sauces, dips, etc.)
    items: {},

    // Modifiers that reference items by ID
    modifiers: [],

    // Calculated totals
    totals: {
      basePrice: 0,
      modificationsTotal: 0,
      subtotal: 0,
      tax: 0,
      total: 0
    },

    // Metadata for UI and debugging
    meta: {
      lastCalculated: null,
      calculationTime: 0,
      completionStatus: {
        wings: false,
        sauces: false,
        dips: false,
        sides: false,
        desserts: false,
        beverages: false
      }
    }
  };
}

/**
 * Create a pricing item
 * @param {string} id - Unique item identifier (e.g., 'wings-boneless')
 * @param {string} type - Item type (wing, sauce, dip, side, dessert, beverage)
 * @param {Object} data - Item-specific data
 * @returns {PricingItem}
 */
export function createPricingItem(id, type, data = {}) {
  return {
    id,
    type,
    basePrice: 0,
    ...data
  };
}

/**
 * Create a pricing modifier
 * @param {string} itemId - ID of the item this modifier applies to
 * @param {string} type - Modifier type (upcharge, discount, warning)
 * @param {number} amount - Dollar amount (positive for upcharge, negative for discount, 0 for warning)
 * @param {string} label - Human-readable label
 * @returns {PricingModifier}
 */
export function createPricingModifier(itemId, type, amount, label) {
  return {
    id: `mod-${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    itemId,
    type,
    amount,
    label,
    createdAt: new Date().toISOString()
  };
}

/**
 * Add an item to pricing structure
 * @param {PricingStructure} structure
 * @param {string} id
 * @param {string} type
 * @param {Object} data
 * @returns {PricingStructure} Updated structure
 */
export function addItem(structure, id, type, data = {}) {
  const item = createPricingItem(id, type, data);
  structure.items[id] = item;
  return structure;
}

/**
 * Add a modifier to pricing structure
 * @param {PricingStructure} structure
 * @param {string} itemId
 * @param {string} type
 * @param {number} amount
 * @param {string} label
 * @returns {PricingStructure} Updated structure
 */
export function addModifier(structure, itemId, type, amount, label) {
  const modifier = createPricingModifier(itemId, type, amount, label);
  structure.modifiers.push(modifier);
  return structure;
}

/**
 * Calculate totals for pricing structure
 * @param {PricingStructure} structure
 * @param {number} basePrice - Package base price
 * @returns {PricingStructure} Updated structure with totals
 */
export function calculateTotals(structure, basePrice) {
  // Sum all modifiers (exclude warnings which have amount: 0)
  const modificationsTotal = structure.modifiers
    .filter(mod => mod.type !== 'warning')
    .reduce((sum, mod) => sum + mod.amount, 0);

  const subtotal = Math.round((basePrice + modificationsTotal) * 100) / 100;
  const tax = Math.round(subtotal * 0.08 * 100) / 100; // 8% Philadelphia tax
  const total = Math.round((subtotal + tax) * 100) / 100;

  structure.totals = {
    basePrice,
    modificationsTotal,
    subtotal,
    tax,
    total
  };

  return structure;
}

/**
 * Get items by type
 * @param {PricingStructure} structure
 * @param {string} type - Item type to filter by
 * @returns {Object} Items of specified type
 */
export function getItemsByType(structure, type) {
  return Object.entries(structure.items)
    .filter(([_, item]) => item.type === type)
    .reduce((acc, [id, item]) => {
      acc[id] = item;
      return acc;
    }, {});
}

/**
 * Get modifiers for a specific item
 * @param {PricingStructure} structure
 * @param {string} itemId
 * @returns {Array<PricingModifier>}
 */
export function getModifiersForItem(structure, itemId) {
  return structure.modifiers.filter(mod => mod.itemId === itemId);
}

/**
 * Validate pricing structure
 * @param {PricingStructure} structure
 * @returns {Object} Validation result with errors array
 */
export function validateStructure(structure) {
  const errors = [];

  // Check required properties
  if (!structure.items || typeof structure.items !== 'object') {
    errors.push('Missing or invalid items object');
  }

  if (!Array.isArray(structure.modifiers)) {
    errors.push('Missing or invalid modifiers array');
  }

  if (!structure.totals || typeof structure.totals !== 'object') {
    errors.push('Missing or invalid totals object');
  }

  // Check modifier references
  if (structure.modifiers && Array.isArray(structure.modifiers)) {
    structure.modifiers.forEach((mod, index) => {
      if (mod.itemId && !structure.items[mod.itemId]) {
        errors.push(`Modifier ${index} references non-existent item: ${mod.itemId}`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Clone pricing structure (deep copy)
 * @param {PricingStructure} structure
 * @returns {PricingStructure} Deep copy
 */
export function cloneStructure(structure) {
  return JSON.parse(JSON.stringify(structure));
}

/**
 * @typedef {Object} PricingStructure
 * @property {Object.<string, PricingItem>} items - Flat storage of all items
 * @property {Array<PricingModifier>} modifiers - Price modifiers
 * @property {PricingTotals} totals - Calculated totals
 * @property {PricingMeta} meta - Metadata
 */

/**
 * @typedef {Object} PricingItem
 * @property {string} id - Unique identifier
 * @property {string} type - Item type (wing, sauce, dip, side, dessert, beverage)
 * @property {number} basePrice - Base price for this item
 */

/**
 * @typedef {Object} PricingModifier
 * @property {string} id - Unique modifier ID
 * @property {string} itemId - ID of item this applies to
 * @property {string} type - Modifier type (upcharge, discount, warning)
 * @property {number} amount - Dollar amount
 * @property {string} label - Human-readable label
 * @property {string} createdAt - ISO timestamp
 */

/**
 * @typedef {Object} PricingTotals
 * @property {number} basePrice - Package base price
 * @property {number} modificationsTotal - Sum of all modifiers
 * @property {number} subtotal - Base + modifications
 * @property {number} tax - Tax amount (8%)
 * @property {number} total - Final total
 */

/**
 * @typedef {Object} PricingMeta
 * @property {string} lastCalculated - ISO timestamp of last calculation
 * @property {number} calculationTime - Time taken in milliseconds
 * @property {Object} completionStatus - Section completion flags
 */
