/**
 * Pricing Aggregator Service
 *
 * Master orchestrator that:
 * - Subscribes to state changes
 * - Calls all specialized pricing calculators
 * - Combines results into unified pricing structure
 * - Publishes pricing updates for UI components
 * - Maintains performance budgets
 *
 * @module pricing-aggregator
 * @created 2025-10-31
 * @epic SP-PRICING-001
 * @story S5-Aggregator
 */

import { calculateWingPricing } from './pricing-wing-calculator.js';
import { calculateSaucePricing } from './pricing-sauce-calculator.js';
import {
  calculateDipsPricing,
  calculateSidesPricing,
  calculateDessertsPricing,
  calculateBeveragesPricing
} from './pricing-items-calculator.js';
import { calculateRemovalCredits } from './pricing-removal-calculator.js';
import { createPricingStructure, addModifier } from './pricing-data-structure.js';
import pricingLogger from './pricing-logger.js';
import { PERFORMANCE_BUDGETS } from './pricing-timing.js';

/**
 * Tax rate for catering orders (SP-OS-S2)
 * Philadelphia combined sales tax rate
 */
const TAX_RATE = 0.08; // 8%

/**
 * Map pricing sources to the completion status keys they control.
 * Prevents unrelated calculators from resetting completion flags.
 */
const COMPLETION_KEYS_BY_SOURCE = {
  wings: ['wings'],
  sauces: ['sauces'],
  dips: ['dips'],
  sides: ['sides'],
  desserts: ['desserts'],
  beverages: ['beverages'],
  removals: ['removals']
};

/**
 * Pricing event listeners (pub/sub pattern)
 */
const pricingListeners = {
  'pricing:updated': [],
  'pricing:wings': [],
  'pricing:sauces': [],
  'pricing:items': [],
  'pricing:totals': []
};

/**
 * Current aggregated pricing (cached)
 */
let currentPricing = null;

/**
 * Calculate complete pricing from state
 *
 * @param {Object} state - Current shared platter state
 * @param {Object} state.selectedPackage - Selected package configuration
 * @param {Object} state.currentConfig - Current customization configuration
 * @param {Object} state.eventDetails - Event details (guest count, etc.)
 * @returns {Object} Unified pricing structure
 */
export function calculatePricing(state) {
  const startTime = performance.now();
  pricingLogger.startTimer('Complete Pricing Calculation');

  try {
    const { selectedPackage, currentConfig = {} } = state;

    if (!selectedPackage) {
      pricingLogger.warn('No package selected, returning empty pricing');
      return createEmptyPricing();
    }

    // Initialize unified structure
    const unified = createPricingStructure();

    // Add package base price
    unified.items['package-base'] = {
      id: 'package-base',
      category: 'package',
      name: selectedPackage.name,
      description: selectedPackage.description,
      quantity: 1,
      basePrice: selectedPackage.basePrice || 0,
      metadata: {
        tier: selectedPackage.tier,
        wingCount: selectedPackage.wingOptions?.totalWings,
        serves: selectedPackage.serves
      }
    };

    pricingLogger.debug('Starting pricing calculations', {
      package: selectedPackage.name,
      basePrice: selectedPackage.basePrice
    });

    // Calculate wings pricing
    const wingsPricing = calculateWingPricing(
      currentConfig.wingDistribution || null,
      selectedPackage.wingOptions || {}
    );

    // Calculate sauces pricing
    const saucesPricing = calculateSaucePricing(
      currentConfig.sauces || null,
      selectedPackage.sauceSelections || {}
    );

    // Calculate dips pricing
    const dipsPricing = calculateDipsPricing(
      currentConfig.dips || null,
      selectedPackage.dipsIncluded || {}
    );

    // Calculate sides pricing
    const sidesPricing = calculateSidesPricing(currentConfig.sides || null);

    // Calculate desserts pricing
    const dessertsPricing = calculateDessertsPricing(currentConfig.desserts || null);

    // Calculate beverages pricing
    const beveragesPricing = calculateBeveragesPricing(currentConfig.beverages || null);

    // Calculate item removal credits (SP-OS-S4)
    const removalsPricing = calculateRemovalCredits(
      currentConfig.removedItems || [],
      selectedPackage
    );

    // Merge all pricing structures
    mergePricingStructure(unified, wingsPricing, 'wings');
    mergePricingStructure(unified, saucesPricing, 'sauces');
    mergePricingStructure(unified, dipsPricing, 'dips');
    mergePricingStructure(unified, sidesPricing, 'sides');
    mergePricingStructure(unified, dessertsPricing, 'desserts');
    mergePricingStructure(unified, beveragesPricing, 'beverages');
    mergePricingStructure(unified, removalsPricing, 'removals');

    // Calculate totals (including per-person cost - SP-OS-S3)
    const guestCount = state.eventDetails?.guestCount || 10;
    calculateTotals(unified, selectedPackage, guestCount);

    // Mark metadata
    unified.meta.lastCalculated = new Date().toISOString();
    unified.meta.packageId = selectedPackage.id;
    unified.meta.packageName = selectedPackage.name;

    // Check performance
    const duration = pricingLogger.endTimer('Complete Pricing Calculation');
    if (duration > PERFORMANCE_BUDGETS.TOTAL_UPDATE) {
      pricingLogger.warn('Total pricing exceeded performance budget', {
        duration: `${duration.toFixed(2)}ms`,
        budget: `${PERFORMANCE_BUDGETS.TOTAL_UPDATE}ms`
      });
    }

    pricingLogger.info('Pricing calculation complete', {
      duration: `${duration.toFixed(2)}ms`,
      itemCount: Object.keys(unified.items).length,
      modifierCount: unified.modifiers.length,
      subtotal: `$${unified.totals.subtotal.toFixed(2)}`
    });

    // Cache result
    currentPricing = unified;

    return unified;

  } catch (error) {
    pricingLogger.error('Pricing aggregation failed', {
      error: error.message,
      stack: error.stack
    });
    pricingLogger.endTimer('Complete Pricing Calculation');
    throw error;
  }
}

/**
 * Merge a specialized pricing structure into unified structure
 *
 * @param {Object} unified - Unified pricing structure
 * @param {Object} specialized - Specialized pricing (wings, sauces, etc.)
 * @param {string} source - Source identifier for tracking
 */
function mergePricingStructure(unified, specialized, source) {
  // Merge items
  Object.entries(specialized.items).forEach(([id, item]) => {
    unified.items[id] = {
      ...item,
      source  // Track which calculator produced this
    };
  });

  // Merge modifiers (with source tracking)
  specialized.modifiers.forEach(modifier => {
    unified.modifiers.push({
      ...modifier,
      source
    });
  });

  // Merge completion status
  if (specialized.meta?.completionStatus) {
    const completionKeys = COMPLETION_KEYS_BY_SOURCE[source] ||
      Object.keys(specialized.meta.completionStatus);

    completionKeys.forEach(key => {
      if (Object.prototype.hasOwnProperty.call(specialized.meta.completionStatus, key)) {
        unified.meta.completionStatus[key] = specialized.meta.completionStatus[key];
      }
    });
  }
}

/**
 * Calculate totals from items and modifiers
 *
 * @param {Object} unified - Unified pricing structure
 * @param {Object} packageInfo - Selected package
 * @param {number} guestCount - Number of guests (for per-person cost)
 */
function calculateTotals(unified, packageInfo, guestCount = 10) {
  // Extract base package price for sidebar display
  const basePrice = unified.items['package-base']?.basePrice || 0;

  // Calculate item subtotal
  const itemsSubtotal = Object.values(unified.items).reduce((sum, item) => {
    return sum + (item.basePrice || 0) * (item.quantity || 1);
  }, 0);

  // Calculate upcharges
  const upcharges = unified.modifiers
    .filter(m => m.type === 'upcharge')
    .reduce((sum, m) => sum + m.amount, 0);

  // Calculate discounts
  const discounts = unified.modifiers
    .filter(m => m.type === 'discount')
    .reduce((sum, m) => sum + Math.abs(m.amount), 0);

  // Subtotal = items + upcharges - discounts
  const subtotal = itemsSubtotal + upcharges - discounts;

  // Tax calculation (SP-OS-S2)
  // Apply Philadelphia combined sales tax rate (8%)
  const tax = subtotal * TAX_RATE;

  // Total
  const total = subtotal + tax;

  // Per-person cost (SP-OS-S3)
  const perPersonCost = guestCount > 0 ? total / guestCount : 0;

  unified.totals = {
    basePrice: Number(basePrice.toFixed(2)),  // Added for sidebar display (Bug #3 fix)
    itemsSubtotal: Number(itemsSubtotal.toFixed(2)),
    upcharges: Number(upcharges.toFixed(2)),
    discounts: Number(discounts.toFixed(2)),
    subtotal: Number(subtotal.toFixed(2)),
    tax: Number(tax.toFixed(2)),
    taxRate: TAX_RATE,
    total: Number(total.toFixed(2)),
    perPersonCost: Number(perPersonCost.toFixed(2)),
    guestCount: guestCount
  };

  pricingLogger.debug('Totals calculated', unified.totals);
}

/**
 * Create empty pricing structure (when no package selected)
 */
function createEmptyPricing() {
  const empty = createPricingStructure();
  empty.totals = {
    basePrice: 0,
    itemsSubtotal: 0,
    upcharges: 0,
    discounts: 0,
    subtotal: 0,
    tax: 0,
    taxRate: TAX_RATE,
    total: 0,
    perPersonCost: 0,
    guestCount: 10
  };
  return empty;
}

/**
 * Subscribe to pricing updates
 *
 * @param {string} topic - Pricing topic ('pricing:updated', 'pricing:wings', etc.)
 * @param {Function} callback - Function to call with pricing data
 * @returns {Function} Unsubscribe function
 */
export function onPricingChange(topic, callback) {
  if (!pricingListeners[topic]) {
    pricingListeners[topic] = [];
  }

  pricingListeners[topic].push(callback);

  pricingLogger.debug('Pricing listener registered', { topic });

  // Return unsubscribe function
  return () => {
    const index = pricingListeners[topic].indexOf(callback);
    if (index > -1) {
      pricingListeners[topic].splice(index, 1);
      pricingLogger.debug('Pricing listener unregistered', { topic });
    }
  };
}

/**
 * Publish pricing change event
 *
 * @param {string} topic - Pricing topic
 * @param {Object} data - Pricing data
 */
function publishPricingChange(topic, data) {
  const listenerCount = (pricingListeners[topic] || []).length;

  pricingLogger.info(`🔔 Publishing ${topic}`, {
    listenerCount,
    totalListeners: pricingListeners['pricing:updated']?.length || 0
  });

  if (pricingListeners[topic]) {
    pricingListeners[topic].forEach(callback => {
      try {
        callback(data);
        pricingLogger.info(`✅ Listener callback executed for ${topic}`);
      } catch (error) {
        pricingLogger.error('Pricing listener error', {
          topic,
          error: error.message
        });
      }
    });
  }

  // Also publish to 'pricing:updated' for global listeners
  if (topic !== 'pricing:updated' && pricingListeners['pricing:updated']) {
    pricingListeners['pricing:updated'].forEach(callback => {
      try {
        callback(data);
        pricingLogger.info('✅ Global pricing:updated listener callback executed');
      } catch (error) {
        pricingLogger.error('Pricing listener error', {
          topic: 'pricing:updated',
          error: error.message
        });
      }
    });
  }
}

/**
 * Recalculate pricing and notify listeners
 *
 * @param {Object} state - Current state
 * @param {Object} options - Calculation options
 * @param {string} options.trigger - What triggered the recalculation
 */
export function recalculatePricing(state, options = {}) {
  const { trigger = 'manual' } = options;

  pricingLogger.info('Recalculating pricing', { trigger });

  const pricing = calculatePricing(state);

  // Publish to pricing:updated (which automatically notifies all listeners)
  publishPricingChange('pricing:updated', pricing);

  return pricing;
}

/**
 * Get current cached pricing (without recalculation)
 *
 * @returns {Object|null} Current pricing or null
 */
export function getCurrentPricing() {
  return currentPricing;
}

/**
 * Clear cached pricing
 */
export function clearPricingCache() {
  currentPricing = null;
  pricingLogger.debug('Pricing cache cleared');
}

/**
 * Get pricing summary for display
 *
 * @param {Object} pricing - Unified pricing structure
 * @returns {Object} Summary with key metrics
 */
export function getPricingSummary(pricing) {
  if (!pricing) {
    return {
      itemCount: 0,
      upchargeCount: 0,
      discountCount: 0,
      warningCount: 0,
      complete: false,
      totals: { subtotal: 0, total: 0 }
    };
  }

  const itemCount = Object.keys(pricing.items).length;
  const upchargeCount = pricing.modifiers.filter(m => m.type === 'upcharge').length;
  const discountCount = pricing.modifiers.filter(m => m.type === 'discount').length;
  const warningCount = pricing.modifiers.filter(m => m.type === 'warning').length;

  const complete = Object.values(pricing.meta.completionStatus).every(status => status === true);

  return {
    itemCount,
    upchargeCount,
    discountCount,
    warningCount,
    complete,
    totals: pricing.totals
  };
}
