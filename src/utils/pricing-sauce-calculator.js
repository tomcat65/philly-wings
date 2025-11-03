/**
 * Sauce Pricing Calculator
 *
 * Calculates pricing for sauce customizations including:
 * - Included sauces (based on package tier)
 * - Extra sauce upcharges
 * - Sauce type validation (dry-rub vs wet-sauce)
 * - Minimum/maximum sauce requirements
 *
 * @module pricing-sauce-calculator
 * @created 2025-10-31
 * @epic SP-PRICING-001
 * @story S3-Sauces
 */

import {
  createPricingStructure,
  addItem,
  addModifier
} from './pricing-data-structure.js';
import pricingLogger from './pricing-logger.js';
import { timeFunction, PERFORMANCE_BUDGETS } from './pricing-timing.js';

/**
 * Sauce pricing rules and upcharges
 */
const SAUCE_PRICING = {
  // Base price for included sauces
  INCLUDED: 0,

  // Extra sauce pricing
  EXTRA: {
    perSauce: 2.00,          // $2.00 per extra sauce
    bulk5: 8.00,             // $8.00 for 5-pack (save $2)
    bulk10: 15.00            // $15.00 for 10-pack (save $5)
  },

  // Sauce type categories
  TYPES: {
    'dry-rub': ['lemon-pepper', 'old-bay', 'cajun'],
    'wet-sauce': ['buffalo', 'bbq', 'garlic-parm', 'honey-hot', 'teriyaki',
                  'thai-chili', 'mango-habanero', 'hot-honey', 'ranch',
                  'blue-cheese', 'sweet-heat']
  }
};

/**
 * Calculate sauce pricing from sauce selections
 *
 * @param {Array<Object>} sauces - Selected sauces from state
 * @param {Object} packageConfig - Package sauce configuration
 * @param {number} packageConfig.min - Minimum sauces required
 * @param {number} packageConfig.max - Maximum sauces included
 * @param {Array<string>} packageConfig.allowedTypes - Allowed sauce types
 * @returns {Object} Pricing structure with sauce calculations
 *
 * @example
 * const pricing = calculateSaucePricing(
 *   [
 *     {id: 'buffalo', name: 'Buffalo', type: 'wet-sauce'},
 *     {id: 'bbq', name: 'BBQ', type: 'wet-sauce'},
 *     {id: 'garlic-parm', name: 'Garlic Parmesan', type: 'wet-sauce'}
 *   ],
 *   { min: 3, max: 3, allowedTypes: ['dry-rub', 'wet-sauce'] }
 * );
 */
export function calculateSaucePricing(sauces, packageConfig) {
  pricingLogger.startTimer('Sauce Pricing Calculation');

  const structure = createPricingStructure();

  try {
    const { min = 3, max = 3, allowedTypes = ['dry-rub', 'wet-sauce'] } = packageConfig;
    const selectedSauces = sauces || [];
    const sauceCount = selectedSauces.length;

    pricingLogger.debug('Calculating sauce pricing', {
      selectedCount: sauceCount,
      min,
      max,
      allowedTypes
    });

    // Validate sauce selections
    const validation = validateSauceSelections(selectedSauces, packageConfig);
    if (!validation.valid) {
      validation.errors.forEach(error => {
        addModifier(structure, 'sauces', 'warning', 0, error);
        pricingLogger.warn('Sauce validation error', { error });
      });
    }

    // Add included sauces (up to max)
    const includedCount = Math.min(sauceCount, max);
    const extraCount = Math.max(0, sauceCount - max);

    selectedSauces.slice(0, includedCount).forEach((sauce, index) => {
      addItem(structure, `sauce-${sauce.id || index}`, 'sauce', {
        name: sauce.name,
        sauceType: sauce.type || 'wet-sauce',
        heatLevel: sauce.heatLevel,
        included: true,
        basePrice: 0
      });

      pricingLogger.debug('Added included sauce', {
        name: sauce.name,
        type: sauce.type
      });
    });

    // Add extra sauces with upcharges
    if (extraCount > 0) {
      selectedSauces.slice(includedCount).forEach((sauce, index) => {
        const itemId = `sauce-extra-${sauce.id || index}`;

        addItem(structure, itemId, 'sauce', {
          name: sauce.name,
          sauceType: sauce.type || 'wet-sauce',
          heatLevel: sauce.heatLevel,
          included: false,
          basePrice: 0
        });

        // Add upcharge for extra sauce
        addModifier(
          structure,
          itemId,
          'upcharge',
          SAUCE_PRICING.EXTRA.perSauce,
          `Extra sauce: ${sauce.name} (+$${SAUCE_PRICING.EXTRA.perSauce})`
        );

        pricingLogger.info('Applied extra sauce upcharge', {
          name: sauce.name,
          upcharge: `$${SAUCE_PRICING.EXTRA.perSauce}`
        });
      });

      // Suggest bulk pricing if applicable
      if (extraCount >= 5) {
        const regularPrice = extraCount * SAUCE_PRICING.EXTRA.perSauce;
        const bulkPrice = extraCount >= 10
          ? SAUCE_PRICING.EXTRA.bulk10
          : SAUCE_PRICING.EXTRA.bulk5;
        const savings = regularPrice - bulkPrice;

        if (savings > 0) {
          addModifier(
            structure,
            'sauces',
            'warning',
            0,
            `💡 Tip: Save $${savings.toFixed(2)} with ${extraCount >= 10 ? '10' : '5'}-pack bulk pricing`
          );

          pricingLogger.info('Bulk sauce pricing available', {
            extraCount,
            regularPrice: `$${regularPrice.toFixed(2)}`,
            bulkPrice: `$${bulkPrice.toFixed(2)}`,
            savings: `$${savings.toFixed(2)}`
          });
        }
      }
    }

    // Mark completion
    structure.meta.completionStatus.sauces = sauceCount >= min && sauceCount <= max;
    structure.meta.lastCalculated = new Date().toISOString();

    const duration = pricingLogger.endTimer('Sauce Pricing Calculation');

    // Check performance budget
    if (duration > PERFORMANCE_BUDGETS.CALCULATION) {
      pricingLogger.warn('Sauce pricing exceeded performance budget', {
        duration: `${duration.toFixed(2)}ms`,
        budget: `${PERFORMANCE_BUDGETS.CALCULATION}ms`
      });
    }

    return structure;

  } catch (error) {
    pricingLogger.error('Sauce pricing calculation failed', {
      error: error.message,
      stack: error.stack
    });
    pricingLogger.endTimer('Sauce Pricing Calculation');
    throw error;
  }
}

/**
 * Validate sauce selections
 *
 * @param {Array<Object>} sauces - Selected sauces
 * @param {Object} packageConfig - Package sauce configuration
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export function validateSauceSelections(sauces, packageConfig) {
  const errors = [];
  const { min = 3, max = 3, allowedTypes = ['dry-rub', 'wet-sauce'] } = packageConfig;
  const sauceCount = (sauces || []).length;

  // Check minimum
  if (sauceCount < min) {
    errors.push(`Select at least ${min} sauces (currently ${sauceCount})`);
  }

  // Check maximum (warning, not error)
  if (sauceCount > max) {
    const extra = sauceCount - max;
    errors.push(`${extra} extra sauce${extra > 1 ? 's' : ''} will be added at $${SAUCE_PRICING.EXTRA.perSauce} each`);
  }

  // Check sauce types
  sauces.forEach((sauce, index) => {
    const sauceType = sauce.type || 'wet-sauce';

    if (!allowedTypes.includes(sauceType)) {
      errors.push(`Sauce "${sauce.name}" type "${sauceType}" not allowed in this package`);
    }
  });

  // Check for duplicates
  const sauceIds = sauces.map(s => s.id).filter(id => id);
  const duplicates = sauceIds.filter((id, index) => sauceIds.indexOf(id) !== index);

  if (duplicates.length > 0) {
    errors.push(`Duplicate sauces selected: ${[...new Set(duplicates)].join(', ')}`);
  }

  // Count critical errors (exclude extra sauce warning which is just informational)
  const criticalErrors = errors.filter(e =>
    !e.includes('extra sauce') ||
    e.includes('type') ||
    e.includes('Duplicate') ||
    sauceCount < min
  );

  return {
    valid: criticalErrors.length === 0,
    errors
  };
}

/**
 * Calculate bulk sauce pricing
 *
 * @param {number} extraSauceCount - Number of extra sauces
 * @returns {Object} { regularPrice, bulkPrice, savings, recommended }
 */
export function calculateBulkSaucePricing(extraSauceCount) {
  if (extraSauceCount < 5) {
    return {
      regularPrice: extraSauceCount * SAUCE_PRICING.EXTRA.perSauce,
      bulkPrice: null,
      savings: 0,
      recommended: false
    };
  }

  const regularPrice = extraSauceCount * SAUCE_PRICING.EXTRA.perSauce;
  let bulkPrice;
  let bulkType;

  if (extraSauceCount >= 10) {
    bulkPrice = SAUCE_PRICING.EXTRA.bulk10;
    bulkType = '10-pack';
  } else {
    bulkPrice = SAUCE_PRICING.EXTRA.bulk5;
    bulkType = '5-pack';
  }

  const savings = regularPrice - bulkPrice;

  return {
    regularPrice,
    bulkPrice,
    savings,
    bulkType,
    recommended: savings > 0
  };
}

/**
 * Get sauce summary for display
 *
 * @param {Array<Object>} sauces - Selected sauces
 * @param {Object} packageConfig - Package sauce configuration
 * @returns {Object} Sauce summary with counts and pricing
 *
 * @example
 * const summary = getSauceSummary(sauces, { min: 3, max: 3 });
 * // Returns: {
 * //   total: 5,
 * //   included: 3,
 * //   extra: 2,
 * //   byType: { 'wet-sauce': 4, 'dry-rub': 1 },
 * //   byHeatLevel: { 0: 1, 2: 2, 3: 1, 4: 1 }
 * // }
 */
export function getSauceSummary(sauces, packageConfig) {
  const { min = 3, max = 3 } = packageConfig;
  const selectedSauces = sauces || [];
  const total = selectedSauces.length;
  const included = Math.min(total, max);
  const extra = Math.max(0, total - max);

  // Group by type
  const byType = {};
  selectedSauces.forEach(sauce => {
    const type = sauce.type || 'wet-sauce';
    byType[type] = (byType[type] || 0) + 1;
  });

  // Group by heat level
  const byHeatLevel = {};
  selectedSauces.forEach(sauce => {
    const heat = sauce.heatLevel || 0;
    byHeatLevel[heat] = (byHeatLevel[heat] || 0) + 1;
  });

  // Calculate pricing
  const extraSauceCost = extra * SAUCE_PRICING.EXTRA.perSauce;
  const bulkPricing = calculateBulkSaucePricing(extra);

  return {
    total,
    included,
    extra,
    byType,
    byHeatLevel,
    complete: total >= min && total <= max,
    pricing: {
      extraSauceCost,
      bulkPricing
    }
  };
}

/**
 * Get sauce type label
 *
 * @param {string} type - Sauce type
 * @returns {string} Human-readable type label
 */
export function getSauceTypeLabel(type) {
  const labels = {
    'dry-rub': 'Dry Rub',
    'wet-sauce': 'Wet Sauce'
  };

  return labels[type] || type;
}

/**
 * Get heat level indicator
 *
 * @param {number} heatLevel - Heat level (0-5)
 * @returns {string} Heat level emoji indicator
 */
export function getHeatLevelIndicator(heatLevel) {
  const indicators = {
    0: '🟢',
    1: '🟢',
    2: '🟡',
    3: '🟠',
    4: '🔴',
    5: '💀'
  };

  return indicators[heatLevel] || '🟢';
}

// Export pricing constants for testing
export { SAUCE_PRICING };
