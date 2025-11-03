/**
 * Item Removal Credit Calculator
 *
 * Calculates credits when users remove included items from packages.
 * Integrates with unified pricing system (SP-OS-S4).
 *
 * STRATEGY (from modification-pricing.js):
 * - High-margin items (70%+): 50% credit
 * - Medium-margin items (50-69%): 75% credit
 * - Low-margin items (<50%): 100% credit
 * - Maximum total credits: 20% of base package price
 *
 * @module pricing-removal-calculator
 * @created 2025-11-02
 * @epic SP-ORDER-SUMMARY-001
 * @story SP-OS-S4
 */

import { createPricingStructure, addModifier } from './pricing-data-structure.js';
import pricingLogger from './pricing-logger.js';
import { MODIFICATION_PRICING, MAX_REMOVAL_CREDIT_PERCENTAGE } from '../constants/modification-pricing.js';

/**
 * Map package item types to modification-pricing.js categories
 */
const CATEGORY_MAP = {
  chips: 'chips',
  dips: 'dips',
  coldSides: 'coldSides',
  salads: 'salads',
  desserts: 'desserts',
  hotBeverages: 'hotBeverages',
  coldBeverages: 'coldBeverages',
  beverages: 'coldBeverages' // Fallback for generic beverages
};

/**
 * Calculate removal credits for items removed from package
 *
 * @param {Array} removedItems - Items removed from package
 * @param {Object} packageConfig - Package configuration
 * @returns {Object} Unified pricing structure
 */
export function calculateRemovalCredits(removedItems = [], packageConfig = {}) {
  pricingLogger.startTimer('Removal Credits Calculation');

  const structure = createPricingStructure();
  const basePrice = packageConfig.basePrice || 0;

  if (!removedItems || removedItems.length === 0) {
    pricingLogger.debug('No items removed, skipping removal credits');
    structure.meta.completionStatus.removals = true;
    pricingLogger.endTimer('Removal Credits Calculation');
    return structure;
  }

  // Calculate credit for each removed item
  let totalCredits = 0;
  const creditBreakdown = [];

  removedItems.forEach(item => {
    const {
      name,
      category,
      quantity = 1
    } = item;

    // Map category to modification-pricing key
    const pricingCategory = CATEGORY_MAP[category] || category;

    // Get removal credit from pricing constants
    const creditPerUnit = getRemovalCreditForItem(name, pricingCategory);

    if (creditPerUnit > 0) {
      const itemTotalCredit = creditPerUnit * quantity;
      totalCredits += itemTotalCredit;

      creditBreakdown.push({
        name,
        category: pricingCategory,
        quantity,
        creditPerUnit,
        totalCredit: itemTotalCredit
      });

      pricingLogger.debug('Removal credit calculated', {
        item: name,
        category: pricingCategory,
        quantity,
        creditPerUnit: `$${creditPerUnit.toFixed(2)}`,
        totalCredit: `$${itemTotalCredit.toFixed(2)}`
      });
    } else {
      pricingLogger.warn('No removal credit found', { item: name, category: pricingCategory });
    }
  });

  // Apply 20% cap
  const maxCredit = basePrice * MAX_REMOVAL_CREDIT_PERCENTAGE;
  const cappedCredits = Math.min(totalCredits, maxCredit);
  const capExceeded = totalCredits > maxCredit;

  if (capExceeded) {
    const exceededAmount = totalCredits - maxCredit;
    pricingLogger.warn('Removal credit cap exceeded', {
      totalCredits: `$${totalCredits.toFixed(2)}`,
      maxCredit: `$${maxCredit.toFixed(2)}`,
      exceededAmount: `$${exceededAmount.toFixed(2)}`,
      capPercentage: `${(MAX_REMOVAL_CREDIT_PERCENTAGE * 100).toFixed(0)}%`
    });

    // Add warning modifier
    addModifier(
      structure,
      'removal-credit-cap',
      'warning',
      0,
      `Removal credits capped at ${(MAX_REMOVAL_CREDIT_PERCENTAGE * 100).toFixed(0)}% of base price ($${maxCredit.toFixed(2)})`
    );
  }

  // Add discount modifier for removal credits
  if (cappedCredits > 0) {
    addModifier(
      structure,
      'item-removal-credits',
      'discount',
      cappedCredits,
      `Item removal credits (${creditBreakdown.length} item${creditBreakdown.length > 1 ? 's' : ''})`
    );
  }

  // Mark completion status
  structure.meta.completionStatus.removals = true;
  structure.meta.removalBreakdown = creditBreakdown;
  structure.meta.capExceeded = capExceeded;

  const duration = pricingLogger.endTimer('Removal Credits Calculation');
  pricingLogger.info('Removal credits calculated', {
    duration: `${duration.toFixed(2)}ms`,
    itemsRemoved: removedItems.length,
    totalCredits: `$${totalCredits.toFixed(2)}`,
    cappedCredits: `$${cappedCredits.toFixed(2)}`,
    capExceeded
  });

  return structure;
}

/**
 * Get removal credit for a specific item
 *
 * @param {string} itemName - Item name
 * @param {string} category - Category key
 * @returns {number} Credit amount in dollars
 */
function getRemovalCreditForItem(itemName, category) {
  const categoryPricing = MODIFICATION_PRICING[category];

  if (!categoryPricing) {
    pricingLogger.warn(`Unknown pricing category: ${category}`);
    return 0;
  }

  const itemPricing = categoryPricing[itemName];

  if (!itemPricing) {
    pricingLogger.warn(`Unknown item in ${category}: ${itemName}`);
    return 0;
  }

  return itemPricing.removalCredit || 0;
}

/**
 * Validate removal credits against 20% cap
 *
 * @param {Array} removedItems - Items removed from package
 * @param {number} basePrice - Package base price
 * @returns {Object} Validation result
 */
export function validateRemovalCap(removedItems = [], basePrice = 0) {
  let totalCredits = 0;

  removedItems.forEach(item => {
    const { name, category, quantity = 1 } = item;
    const pricingCategory = CATEGORY_MAP[category] || category;
    const creditPerUnit = getRemovalCreditForItem(name, pricingCategory);
    totalCredits += creditPerUnit * quantity;
  });

  const maxCredit = basePrice * MAX_REMOVAL_CREDIT_PERCENTAGE;
  const cappedCredits = Math.min(totalCredits, maxCredit);
  const capExceeded = totalCredits > maxCredit;
  const exceededAmount = capExceeded ? totalCredits - maxCredit : 0;

  return {
    valid: !capExceeded,
    totalCredits,
    maxCredit,
    cappedCredits,
    capExceeded,
    exceededAmount,
    capPercentage: MAX_REMOVAL_CREDIT_PERCENTAGE
  };
}

/**
 * Get margin tier for an item (for UI display)
 *
 * @param {string} itemName - Item name
 * @param {string} category - Category key
 * @returns {string} Margin tier ('high', 'medium', 'low', or 'unknown')
 */
export function getItemMarginTier(itemName, category) {
  const pricingCategory = CATEGORY_MAP[category] || category;
  const categoryPricing = MODIFICATION_PRICING[pricingCategory];

  if (!categoryPricing) {
    return 'unknown';
  }

  const itemPricing = categoryPricing[itemName];

  if (!itemPricing) {
    return 'unknown';
  }

  return itemPricing.marginTier || 'unknown';
}
