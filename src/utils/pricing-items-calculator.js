/**
 * Items Pricing Calculator (Dips, Sides, Desserts, Beverages)
 *
 * Calculates pricing for add-on items including:
 * - Dips (included dips vs extra dips)
 * - Sides (chips, cold sides, salads)
 * - Desserts (cookies, brownies, etc.)
 * - Beverages (cold and hot drinks)
 *
 * @module pricing-items-calculator
 * @created 2025-10-31
 * @epic SP-PRICING-001
 * @story S4-Items
 */

import {
  createPricingStructure,
  addItem,
  addModifier
} from './pricing-data-structure.js';
import pricingLogger from './pricing-logger.js';
import { timeFunction, PERFORMANCE_BUDGETS } from './pricing-timing.js';

/**
 * Item pricing rules and upcharges
 */
const ITEMS_PRICING = {
  // Dips pricing
  DIPS: {
    included: 0,              // Included dips are free
    extra: 0.75,              // $0.75 per extra dip (1.5oz)
    sizeUpgrade: 1.50         // +$1.50 for 3oz dip
  },

  // Sides pricing
  SIDES: {
    chips: 3.00,              // $3.00 per 5-pack Miss Vickie's
    fries: {
      small: 4.00,
      large: 6.00
    },
    loadedFries: {
      small: 6.00,
      large: 8.00
    },
    mozzarellaSticks: 8.00,   // $8.00 per 12-pack
    coldSides: 5.00,          // $5.00 per cold side
    salads: 6.00              // $6.00 per salad
  },

  // Desserts pricing
  DESSERTS: {
    cookies: 2.00,            // $2.00 per cookie
    brownies: 3.00,           // $3.00 per brownie
    cakeslice: 4.00           // $4.00 per cake slice
  },

  // Beverages pricing
  BEVERAGES: {
    cold: {
      can: 2.00,              // $2.00 per can
      bottle: 3.00,           // $3.00 per bottle
      pitcher: 8.00           // $8.00 per pitcher
    },
    hot: {
      coffee: 2.50,           // $2.50 per coffee
      box: 15.00              // $15.00 per coffee box (serves 10)
    }
  }
};

/**
 * Calculate dips pricing
 *
 * @param {Array<Object>} dips - Selected dips from state
 * @param {Object} packageConfig - Package dips configuration
 * @param {number} packageConfig.count - Number of included dips
 * @param {Array<string>} packageConfig.types - Allowed dip types
 * @returns {Object} Pricing structure with dip calculations
 */
export function calculateDipsPricing(dips, packageConfig) {
  pricingLogger.startTimer('Dips Pricing Calculation');

  const structure = createPricingStructure();

  try {
    const { count = 15, types = ['ranch', 'blue-cheese', 'honey-mustard', 'cheese-sauce'] } = packageConfig;
    const selectedDips = dips || [];
    const totalDips = selectedDips.reduce((sum, dip) => sum + (dip.quantity || 1), 0);

    pricingLogger.debug('Calculating dips pricing', {
      totalDips,
      includedCount: count,
      selectedDipsCount: selectedDips.length
    });

    // Calculate included vs extra
    let remainingIncluded = count;

    selectedDips.forEach((dip, index) => {
      const quantity = dip.quantity || 1;
      const includedQty = Math.min(quantity, remainingIncluded);
      const extraQty = Math.max(0, quantity - remainingIncluded);

      // Add item
      const itemId = `dip-${dip.id || index}`;
      addItem(structure, itemId, 'dip', {
        name: dip.name,
        quantity,
        size: dip.size || '1.5oz',
        includedQty,
        extraQty
      });

      // Apply upcharge for extra dips
      if (extraQty > 0) {
        const upcharge = extraQty * ITEMS_PRICING.DIPS.extra;
        addModifier(
          structure,
          itemId,
          'upcharge',
          upcharge,
          `Extra ${dip.name} dips (${extraQty}) (+$${ITEMS_PRICING.DIPS.extra} each)`
        );

        pricingLogger.info('Applied extra dip upcharge', {
          name: dip.name,
          extraQty,
          upcharge: `$${upcharge.toFixed(2)}`
        });
      }

      // Apply upcharge for size upgrade
      if (dip.size === '3oz') {
        const sizeUpcharge = quantity * ITEMS_PRICING.DIPS.sizeUpgrade;
        addModifier(
          structure,
          itemId,
          'upcharge',
          sizeUpcharge,
          `${dip.name} 3oz upgrade (${quantity}) (+$${ITEMS_PRICING.DIPS.sizeUpgrade} each)`
        );

        pricingLogger.info('Applied dip size upgrade', {
          name: dip.name,
          quantity,
          upcharge: `$${sizeUpcharge.toFixed(2)}`
        });
      }

      remainingIncluded = Math.max(0, remainingIncluded - quantity);
    });

    // Mark completion
    structure.meta.completionStatus.dips = totalDips >= count;
    structure.meta.lastCalculated = new Date().toISOString();

    const duration = pricingLogger.endTimer('Dips Pricing Calculation');

    if (duration > PERFORMANCE_BUDGETS.CALCULATION) {
      pricingLogger.warn('Dips pricing exceeded performance budget', {
        duration: `${duration.toFixed(2)}ms`,
        budget: `${PERFORMANCE_BUDGETS.CALCULATION}ms`
      });
    }

    return structure;

  } catch (error) {
    pricingLogger.error('Dips pricing calculation failed', {
      error: error.message,
      stack: error.stack
    });
    pricingLogger.endTimer('Dips Pricing Calculation');
    throw error;
  }
}

/**
 * Calculate sides pricing
 *
 * @param {Object} sides - Sides configuration from state
 * @param {Object} sides.chips - Chips quantity
 * @param {Array<Object>} sides.coldSides - Cold sides
 * @param {Array<Object>} sides.salads - Salads
 * @returns {Object} Pricing structure with sides calculations
 */
export function calculateSidesPricing(sides = {}) {
  pricingLogger.startTimer('Sides Pricing Calculation');

  const structure = createPricingStructure();

  try {
    const normalizedSides = normalizeSidesInput(sides);
    const {
      chips = { quantity: 0 },
      coldSides = [],
      salads = []
    } = normalizedSides;

    // Chips
    if (chips.quantity > 0) {
      addItem(structure, 'chips', 'side', {
        name: 'Miss Vickie\'s Chips',
        quantity: chips.quantity,
        unit: '5-pack'
      });

      const upcharge = chips.quantity * ITEMS_PRICING.SIDES.chips;
      addModifier(
        structure,
        'chips',
        'upcharge',
        upcharge,
        `Chips 5-packs (${chips.quantity}) (+$${ITEMS_PRICING.SIDES.chips} each)`
      );

      pricingLogger.info('Applied chips upcharge', {
        quantity: chips.quantity,
        upcharge: `$${upcharge.toFixed(2)}`
      });
    }

    // Cold sides
    coldSides.forEach((side, index) => {
      const quantity = side.quantity || 1;
      const itemId = `cold-side-${side.id || index}`;

      addItem(structure, itemId, 'side', {
        name: side.name,
        quantity,
        serves: side.serves
      });

      const upcharge = quantity * ITEMS_PRICING.SIDES.coldSides;
      addModifier(
        structure,
        itemId,
        'upcharge',
        upcharge,
        `${side.name} (${quantity}) (+$${ITEMS_PRICING.SIDES.coldSides} each)`
      );

      pricingLogger.info('Applied cold side upcharge', {
        name: side.name,
        quantity,
        upcharge: `$${upcharge.toFixed(2)}`
      });
    });

    // Salads
    salads.forEach((salad, index) => {
      const quantity = salad.quantity || 1;
      const itemId = `salad-${salad.id || index}`;

      addItem(structure, itemId, 'side', {
        name: salad.name,
        quantity,
        serves: salad.serves
      });

      const upcharge = quantity * ITEMS_PRICING.SIDES.salads;
      addModifier(
        structure,
        itemId,
        'upcharge',
        upcharge,
        `${salad.name} (${quantity}) (+$${ITEMS_PRICING.SIDES.salads} each)`
      );

      pricingLogger.info('Applied salad upcharge', {
        name: salad.name,
        quantity,
        upcharge: `$${upcharge.toFixed(2)}`
      });
    });

    // Mark completion
    const hasSides = chips.quantity > 0 || coldSides.length > 0 || salads.length > 0;
    structure.meta.completionStatus.sides = hasSides;
    structure.meta.lastCalculated = new Date().toISOString();

    const duration = pricingLogger.endTimer('Sides Pricing Calculation');

    if (duration > PERFORMANCE_BUDGETS.CALCULATION) {
      pricingLogger.warn('Sides pricing exceeded performance budget', {
        duration: `${duration.toFixed(2)}ms`,
        budget: `${PERFORMANCE_BUDGETS.CALCULATION}ms`
      });
    }

    return structure;

  } catch (error) {
    pricingLogger.error('Sides pricing calculation failed', {
      error: error.message,
      stack: error.stack
    });
    pricingLogger.endTimer('Sides Pricing Calculation');
    throw error;
  }
}

/**
 * Calculate desserts pricing
 *
 * @param {Array<Object>} desserts - Selected desserts from state
 * @returns {Object} Pricing structure with dessert calculations
 */
export function calculateDessertsPricing(desserts) {
  pricingLogger.startTimer('Desserts Pricing Calculation');

  const structure = createPricingStructure();

  try {
    const selectedDesserts = desserts || [];

    selectedDesserts.forEach((dessert, index) => {
      const quantity = dessert.quantity || 1;
      const itemId = `dessert-${dessert.id || index}`;

      // Determine pricing based on dessert type
      let pricePerItem = ITEMS_PRICING.DESSERTS.cookies; // default
      if (dessert.type === 'brownie') {
        pricePerItem = ITEMS_PRICING.DESSERTS.brownies;
      } else if (dessert.type === 'cake') {
        pricePerItem = ITEMS_PRICING.DESSERTS.cakeslice;
      }

      addItem(structure, itemId, 'dessert', {
        name: dessert.name,
        quantity,
        type: dessert.type,
        servings: dessert.servings
      });

      const upcharge = quantity * pricePerItem;
      addModifier(
        structure,
        itemId,
        'upcharge',
        upcharge,
        `${dessert.name} (${quantity}) (+$${pricePerItem} each)`
      );

      pricingLogger.info('Applied dessert upcharge', {
        name: dessert.name,
        quantity,
        upcharge: `$${upcharge.toFixed(2)}`
      });
    });

    // Mark completion
    structure.meta.completionStatus.desserts = selectedDesserts.length > 0;
    structure.meta.lastCalculated = new Date().toISOString();

    const duration = pricingLogger.endTimer('Desserts Pricing Calculation');

    if (duration > PERFORMANCE_BUDGETS.CALCULATION) {
      pricingLogger.warn('Desserts pricing exceeded performance budget', {
        duration: `${duration.toFixed(2)}ms`,
        budget: `${PERFORMANCE_BUDGETS.CALCULATION}ms`
      });
    }

    return structure;

  } catch (error) {
    pricingLogger.error('Desserts pricing calculation failed', {
      error: error.message,
      stack: error.stack
    });
    pricingLogger.endTimer('Desserts Pricing Calculation');
    throw error;
  }
}

/**
 * Calculate beverages pricing
 *
 * @param {Object} beverages - Beverages configuration from state
 * @param {Array<Object>} beverages.cold - Cold beverages
 * @param {Array<Object>} beverages.hot - Hot beverages
 * @returns {Object} Pricing structure with beverage calculations
 */
export function calculateBeveragesPricing(beverages = {}) {
  pricingLogger.startTimer('Beverages Pricing Calculation');

  const structure = createPricingStructure();

  try {
    const normalizedBeverages = normalizeBeveragesInput(beverages);
    const {
      cold = [],
      hot = []
    } = normalizedBeverages;

    // Cold beverages
    cold.forEach((beverage, index) => {
      const quantity = beverage.quantity || 1;
      const itemId = `cold-beverage-${beverage.id || index}`;

      // Determine pricing based on size
      let pricePerItem = ITEMS_PRICING.BEVERAGES.cold.can; // default
      if (beverage.size === 'bottle') {
        pricePerItem = ITEMS_PRICING.BEVERAGES.cold.bottle;
      } else if (beverage.size === 'pitcher') {
        pricePerItem = ITEMS_PRICING.BEVERAGES.cold.pitcher;
      }

      addItem(structure, itemId, 'beverage', {
        name: beverage.name,
        quantity,
        size: beverage.size,
        serves: beverage.serves,
        temperature: 'cold'
      });

      const upcharge = quantity * pricePerItem;
      addModifier(
        structure,
        itemId,
        'upcharge',
        upcharge,
        `${beverage.name} ${beverage.size} (${quantity}) (+$${pricePerItem} each)`
      );

      pricingLogger.info('Applied cold beverage upcharge', {
        name: beverage.name,
        size: beverage.size,
        quantity,
        upcharge: `$${upcharge.toFixed(2)}`
      });
    });

    // Hot beverages
    hot.forEach((beverage, index) => {
      const quantity = beverage.quantity || 1;
      const itemId = `hot-beverage-${beverage.id || index}`;

      // Determine pricing based on size
      let pricePerItem = ITEMS_PRICING.BEVERAGES.hot.coffee;
      if (beverage.size === 'box') {
        pricePerItem = ITEMS_PRICING.BEVERAGES.hot.box;
      }

      addItem(structure, itemId, 'beverage', {
        name: beverage.name,
        quantity,
        size: beverage.size,
        serves: beverage.serves,
        temperature: 'hot'
      });

      const upcharge = quantity * pricePerItem;
      addModifier(
        structure,
        itemId,
        'upcharge',
        upcharge,
        `${beverage.name} ${beverage.size} (${quantity}) (+$${pricePerItem} each)`
      );

      pricingLogger.info('Applied hot beverage upcharge', {
        name: beverage.name,
        size: beverage.size,
        quantity,
        upcharge: `$${upcharge.toFixed(2)}`
      });
    });

    // Mark completion
    const hasBeverages = cold.length > 0 || hot.length > 0;
    structure.meta.completionStatus.beverages = hasBeverages;
    structure.meta.lastCalculated = new Date().toISOString();

    const duration = pricingLogger.endTimer('Beverages Pricing Calculation');

    if (duration > PERFORMANCE_BUDGETS.CALCULATION) {
      pricingLogger.warn('Beverages pricing exceeded performance budget', {
        duration: `${duration.toFixed(2)}ms`,
        budget: `${PERFORMANCE_BUDGETS.CALCULATION}ms`
      });
    }

    return structure;

  } catch (error) {
    pricingLogger.error('Beverages pricing calculation failed', {
      error: error.message,
      stack: error.stack
    });
    pricingLogger.endTimer('Beverages Pricing Calculation');
    throw error;
  }
}

// Export pricing constants for testing
export { ITEMS_PRICING };

/**
 * Normalize sides input to the expected object shape
 * Accepts historical array formats and undefined values.
 */
function normalizeSidesInput(rawSides) {
  if (Array.isArray(rawSides)) {
    return {
      chips: { quantity: 0 },
      coldSides: rawSides,
      salads: []
    };
  }

  if (!rawSides || typeof rawSides !== 'object') {
    return {};
  }

  return rawSides;
}

/**
 * Normalize beverages input to the expected object shape
 * Supports legacy array payloads and undefined values.
 */
function normalizeBeveragesInput(rawBeverages) {
  if (Array.isArray(rawBeverages)) {
    return {
      cold: rawBeverages,
      hot: []
    };
  }

  if (!rawBeverages || typeof rawBeverages !== 'object') {
    return {};
  }

  return rawBeverages;
}
