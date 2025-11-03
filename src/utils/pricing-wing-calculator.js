/**
 * Wing Pricing Calculator
 *
 * Calculates pricing for wing customizations including:
 * - Wing type distribution (boneless, bone-in, cauliflower)
 * - Bone-in style selection (mixed, flats, drums)
 * - Sauce allocation across wing types
 * - Upcharges for premium options (cauliflower, flats/drums)
 *
 * @module pricing-wing-calculator
 * @created 2025-10-31
 * @epic SP-PRICING-001
 * @story S2-Wings
 */

import {
  createPricingStructure,
  addItem,
  addModifier
} from './pricing-data-structure.js';
import pricingLogger from './pricing-logger.js';
import { timeFunction, PERFORMANCE_BUDGETS } from './pricing-timing.js';

/**
 * Wing pricing rules and upcharges
 */
const WING_PRICING = {
  // Base prices (included in package)
  BASE: {
    boneless: 0,
    boneIn: 0
  },

  // Upcharges for premium options
  UPCHARGES: {
    cauliflower: 0.50,        // $0.50 per cauliflower wing
    flatsOnly: 0.25,          // $0.25 per wing for flats only
    drumsOnly: 0.25,          // $0.25 per wing for drums only
    mixed: 0                  // No upcharge for mixed
  },

  // Minimum wing requirements
  MINIMUMS: {
    perType: 10,              // Minimum 10 wings per type if mixed
    total: 20                 // Minimum 20 wings total
  }
};

/**
 * Calculate wing distribution cost differential (SP-OS-S1)
 *
 * Compares current distribution to package defaults and calculates price delta.
 * Uses per-wing costs from package schema to determine if user's customization
 * increases or decreases the base price.
 *
 * @param {Object} currentDistribution - Current wing selection
 * @param {number} currentDistribution.boneless - Current boneless count
 * @param {number} currentDistribution.boneIn - Current bone-in count
 * @param {number} currentDistribution.cauliflower - Current cauliflower count
 * @param {Object} packageConfig - Package configuration with defaults and costs
 * @param {Object} packageConfig.defaultDistribution - Package default distribution
 * @param {Object} packageConfig.perWingCosts - Per-wing cost structure
 * @returns {Object} { differential: number, breakdown: Object }
 *
 * @example
 * // Tailgate Pack defaults: 150 boneless, 50 bone-in
 * // User changes to: 100 boneless, 100 bone-in
 * const result = calculateDistributionDifferential(
 *   { boneless: 100, boneIn: 100, cauliflower: 0 },
 *   {
 *     defaultDistribution: { boneless: 150, boneIn: 50, cauliflower: 0 },
 *     perWingCosts: { boneless: 0.80, boneIn: 1.00, cauliflower: 1.30 }
 *   }
 * );
 * // Returns: { differential: 10.00, breakdown: {...} }
 * // More bone-in (expensive) = higher price
 */
export function calculateDistributionDifferential(currentDistribution, packageConfig) {
  // If no schema data available, return zero differential (backward compatibility)
  if (!packageConfig.defaultDistribution || !packageConfig.perWingCosts) {
    pricingLogger.warn('No defaultDistribution or perWingCosts in package schema, skipping differential');
    return { differential: 0, breakdown: null };
  }

  const { boneless = 0, boneIn = 0, cauliflower = 0 } = currentDistribution;
  const { defaultDistribution, perWingCosts } = packageConfig;

  // Calculate cost of current distribution
  const currentCost =
    (boneless * perWingCosts.boneless) +
    (boneIn * perWingCosts.boneIn) +
    (cauliflower * perWingCosts.cauliflower);

  // Calculate cost of default distribution
  const defaultCost =
    (defaultDistribution.boneless * perWingCosts.boneless) +
    (defaultDistribution.boneIn * perWingCosts.boneIn) +
    (defaultDistribution.cauliflower * perWingCosts.cauliflower);

  // Differential = current - default (positive = more expensive, negative = cheaper)
  const differential = currentCost - defaultCost;

  const breakdown = {
    current: {
      boneless: { count: boneless, cost: boneless * perWingCosts.boneless },
      boneIn: { count: boneIn, cost: boneIn * perWingCosts.boneIn },
      cauliflower: { count: cauliflower, cost: cauliflower * perWingCosts.cauliflower },
      total: currentCost
    },
    default: {
      boneless: { count: defaultDistribution.boneless, cost: defaultDistribution.boneless * perWingCosts.boneless },
      boneIn: { count: defaultDistribution.boneIn, cost: defaultDistribution.boneIn * perWingCosts.boneIn },
      cauliflower: { count: defaultDistribution.cauliflower, cost: defaultDistribution.cauliflower * perWingCosts.cauliflower },
      total: defaultCost
    },
    differential: Number(differential.toFixed(2))
  };

  pricingLogger.debug('Wing distribution differential calculated', {
    currentCost: `$${currentCost.toFixed(2)}`,
    defaultCost: `$${defaultCost.toFixed(2)}`,
    differential: `$${differential.toFixed(2)}`
  });

  return { differential: Number(differential.toFixed(2)), breakdown };
}

/**
 * Calculate wing pricing from wing distribution config
 *
 * @param {Object} wingDistribution - Wing distribution from state
 * @param {number} wingDistribution.boneless - Boneless wing count
 * @param {number} wingDistribution.boneIn - Bone-in wing count
 * @param {number} wingDistribution.cauliflower - Cauliflower wing count
 * @param {string} wingDistribution.boneInStyle - 'mixed' | 'flats' | 'drums'
 * @param {Object} packageConfig - Package configuration
 * @param {number} packageConfig.totalWings - Total wings included in package
 * @returns {Object} Pricing structure with wing calculations
 *
 * @example
 * const pricing = calculateWingPricing({
 *   boneless: 30,
 *   boneIn: 30,
 *   cauliflower: 0,
 *   boneInStyle: 'mixed'
 * }, { totalWings: 60 });
 */
export function calculateWingPricing(wingDistribution, packageConfig) {
  pricingLogger.startTimer('Wing Pricing Calculation');

  const structure = createPricingStructure();

  try {
    // Handle null/undefined wingDistribution gracefully
    if (!wingDistribution) {
      pricingLogger.warn('No wing distribution provided, returning empty pricing');
      return structure;
    }

    // Extract wing counts
    const { boneless = 0, boneIn = 0, cauliflower = 0, boneInStyle = 'mixed' } = wingDistribution;
    const { totalWings = 60 } = packageConfig;

    const totalSelected = boneless + boneIn + cauliflower;

    pricingLogger.debug('Calculating wing pricing', {
      boneless,
      boneIn,
      cauliflower,
      boneInStyle,
      totalWings,
      totalSelected
    });

    // Validate wing distribution
    const validation = validateWingDistribution(wingDistribution, packageConfig);
    if (!validation.valid) {
      validation.errors.forEach(error => {
        addModifier(structure, 'wings', 'warning', 0, error);
        pricingLogger.warn('Wing validation error', { error });
      });
    }

    // Calculate distribution differential (SP-OS-S1)
    const { differential, breakdown } = calculateDistributionDifferential(
      { boneless, boneIn, cauliflower },
      packageConfig
    );

    // Add differential as modifier if non-zero
    if (differential !== 0) {
      const modifierType = differential > 0 ? 'upcharge' : 'discount';
      const label = differential > 0
        ? `Wing distribution adjustment (+$${Math.abs(differential).toFixed(2)})`
        : `Wing distribution savings (-$${Math.abs(differential).toFixed(2)})`;

      addModifier(
        structure,
        'wings-distribution',
        modifierType,
        Math.abs(differential),
        label
      );

      pricingLogger.info('Wing distribution differential applied', {
        differential: `$${differential.toFixed(2)}`,
        type: modifierType,
        breakdown
      });
    }

    // Add boneless wings (no upcharge)
    if (boneless > 0) {
      addItem(structure, 'wings-boneless', 'wing', {
        quantity: boneless,
        wingType: 'boneless',
        basePrice: 0
      });

      pricingLogger.debug('Added boneless wings', { quantity: boneless });
    }

    // Add bone-in wings with style upcharge
    if (boneIn > 0) {
      addItem(structure, 'wings-bone-in', 'wing', {
        quantity: boneIn,
        wingType: 'bone-in',
        style: boneInStyle,
        basePrice: 0
      });

      // Apply upcharge for flats or drums only
      if (boneInStyle === 'flats' || boneInStyle === 'drums') {
        const upcharge = boneIn * WING_PRICING.UPCHARGES[`${boneInStyle}Only`];
        addModifier(
          structure,
          'wings-bone-in',
          'upcharge',
          upcharge,
          `${boneInStyle.charAt(0).toUpperCase() + boneInStyle.slice(1)} only (+$${WING_PRICING.UPCHARGES[`${boneInStyle}Only`]}/wing)`
        );

        pricingLogger.info('Applied bone-in style upcharge', {
          style: boneInStyle,
          quantity: boneIn,
          upcharge: `$${upcharge.toFixed(2)}`
        });
      }
    }

    // Add cauliflower wings with upcharge
    if (cauliflower > 0) {
      addItem(structure, 'wings-cauliflower', 'wing', {
        quantity: cauliflower,
        wingType: 'cauliflower',
        basePrice: 0,
        dietary: ['vegan', 'vegetarian']
      });

      const upcharge = cauliflower * WING_PRICING.UPCHARGES.cauliflower;
      addModifier(
        structure,
        'wings-cauliflower',
        'upcharge',
        upcharge,
        `Cauliflower wings (+$${WING_PRICING.UPCHARGES.cauliflower}/wing)`
      );

      pricingLogger.info('Applied cauliflower upcharge', {
        quantity: cauliflower,
        upcharge: `$${upcharge.toFixed(2)}`
      });
    }

    // Check for extra wings beyond package
    if (totalSelected > totalWings) {
      const extraWings = totalSelected - totalWings;
      addModifier(
        structure,
        'wings',
        'warning',
        0,
        `${extraWings} extra wings will be added as add-ons`
      );

      pricingLogger.warn('Extra wings detected', {
        totalSelected,
        totalWings,
        extra: extraWings
      });
    }

    // Mark completion
    structure.meta.completionStatus.wings = totalSelected === totalWings;
    structure.meta.lastCalculated = new Date().toISOString();

    const duration = pricingLogger.endTimer('Wing Pricing Calculation');

    // Check performance budget
    if (duration > PERFORMANCE_BUDGETS.CALCULATION) {
      pricingLogger.warn('Wing pricing exceeded performance budget', {
        duration: `${duration.toFixed(2)}ms`,
        budget: `${PERFORMANCE_BUDGETS.CALCULATION}ms`
      });
    }

    return structure;

  } catch (error) {
    pricingLogger.error('Wing pricing calculation failed', {
      error: error.message,
      stack: error.stack
    });
    pricingLogger.endTimer('Wing Pricing Calculation');
    throw error;
  }
}

/**
 * Validate wing distribution
 *
 * @param {Object} wingDistribution - Wing distribution config
 * @param {Object} packageConfig - Package configuration
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export function validateWingDistribution(wingDistribution, packageConfig) {
  const errors = [];
  const { boneless = 0, boneIn = 0, cauliflower = 0 } = wingDistribution;
  const { totalWings = 60 } = packageConfig;

  const totalSelected = boneless + boneIn + cauliflower;
  const typesSelected = [boneless, boneIn, cauliflower].filter(n => n > 0).length;

  // Check total matches package
  if (totalSelected !== totalWings) {
    errors.push(`Total wings (${totalSelected}) must equal package amount (${totalWings})`);
  }

  // Check minimum per type when mixing
  if (typesSelected > 1) {
    if (boneless > 0 && boneless < WING_PRICING.MINIMUMS.perType) {
      errors.push(`Minimum ${WING_PRICING.MINIMUMS.perType} boneless wings when mixing types`);
    }
    if (boneIn > 0 && boneIn < WING_PRICING.MINIMUMS.perType) {
      errors.push(`Minimum ${WING_PRICING.MINIMUMS.perType} bone-in wings when mixing types`);
    }
    if (cauliflower > 0 && cauliflower < WING_PRICING.MINIMUMS.perType) {
      errors.push(`Minimum ${WING_PRICING.MINIMUMS.perType} cauliflower wings when mixing types`);
    }
  }

  // Check minimum total
  if (totalSelected > 0 && totalSelected < WING_PRICING.MINIMUMS.total) {
    errors.push(`Minimum ${WING_PRICING.MINIMUMS.total} total wings required`);
  }

  // Check negative numbers
  if (boneless < 0 || boneIn < 0 || cauliflower < 0) {
    errors.push('Wing quantities cannot be negative');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Calculate sauce allocation across wing types
 *
 * @param {Array<Object>} sauces - Selected sauces from state
 * @param {Object} wingDistribution - Wing distribution config
 * @param {Object} packageConfig - Package configuration
 * @returns {Object} Sauce allocation by wing type
 *
 * @example
 * const allocation = calculateSauceAllocation(
 *   [{id: 'buffalo', name: 'Buffalo'}, {id: 'bbq', name: 'BBQ'}],
 *   { boneless: 30, boneIn: 30, cauliflower: 0 },
 *   { totalWings: 60 }
 * );
 * // Returns: { boneless: {...}, boneIn: {...}, cauliflower: {...} }
 */
export function calculateSauceAllocation(sauces, wingDistribution, packageConfig) {
  const { boneless = 0, boneIn = 0, cauliflower = 0 } = wingDistribution;
  const totalWings = boneless + boneIn + cauliflower;

  if (totalWings === 0 || !sauces || sauces.length === 0) {
    return {
      boneless: {},
      boneIn: {},
      cauliflower: {}
    };
  }

  // Default: distribute sauces evenly across wing types
  const allocation = {
    boneless: {},
    boneIn: {},
    cauliflower: {}
  };

  sauces.forEach(sauce => {
    if (boneless > 0) {
      allocation.boneless[sauce.id] = {
        name: sauce.name,
        proportion: boneless / totalWings,
        estimatedWings: Math.round((boneless / totalWings) * totalWings / sauces.length)
      };
    }

    if (boneIn > 0) {
      allocation.boneIn[sauce.id] = {
        name: sauce.name,
        proportion: boneIn / totalWings,
        estimatedWings: Math.round((boneIn / totalWings) * totalWings / sauces.length)
      };
    }

    if (cauliflower > 0) {
      allocation.cauliflower[sauce.id] = {
        name: sauce.name,
        proportion: cauliflower / totalWings,
        estimatedWings: Math.round((cauliflower / totalWings) * totalWings / sauces.length)
      };
    }
  });

  return allocation;
}

/**
 * Get wing type summary for display
 *
 * @param {Object} wingDistribution - Wing distribution config
 * @returns {Array<Object>} Array of wing type summaries
 *
 * @example
 * const summary = getWingTypeSummary({ boneless: 30, boneIn: 30, cauliflower: 0, boneInStyle: 'mixed' });
 * // Returns: [
 * //   { type: 'boneless', label: 'Boneless', quantity: 30, style: null },
 * //   { type: 'boneIn', label: 'Bone-In (Mixed)', quantity: 30, style: 'mixed' }
 * // ]
 */
export function getWingTypeSummary(wingDistribution) {
  const { boneless = 0, boneIn = 0, cauliflower = 0, boneInStyle = 'mixed' } = wingDistribution;
  const summary = [];

  if (boneless > 0) {
    summary.push({
      type: 'boneless',
      label: 'Boneless',
      quantity: boneless,
      style: null,
      upcharge: 0
    });
  }

  if (boneIn > 0) {
    const styleLabel = boneInStyle === 'mixed'
      ? 'Mixed'
      : boneInStyle === 'flats'
        ? 'Flats Only'
        : 'Drums Only';

    const upcharge = boneInStyle === 'mixed'
      ? 0
      : boneIn * WING_PRICING.UPCHARGES[`${boneInStyle}Only`];

    summary.push({
      type: 'boneIn',
      label: `Bone-In (${styleLabel})`,
      quantity: boneIn,
      style: boneInStyle,
      upcharge
    });
  }

  if (cauliflower > 0) {
    summary.push({
      type: 'cauliflower',
      label: 'Cauliflower Wings',
      quantity: cauliflower,
      style: null,
      upcharge: cauliflower * WING_PRICING.UPCHARGES.cauliflower,
      dietary: ['vegan', 'vegetarian']
    });
  }

  return summary;
}

// Export pricing constants for testing
export { WING_PRICING };
