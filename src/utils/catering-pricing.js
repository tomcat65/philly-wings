/**
 * Shared pricing utilities for catering flows.
 * Centralizes tax rate, extras category ordering, and subtotal helpers.
 */

// Single source of truth for catering tax calculations (currently 8%)
export const TAX_RATE = 0.08;

// Ordered list of extras categories used across UI surfaces
export const EXTRA_CATEGORY_KEYS = [
  'quickAdds',
  'beverages',
  'hotBeverages',
  'salads',
  'sides',
  'desserts',
  'saucesToGo',
  'dipsToGo'
];

/**
 * Flatten extras object into a single array for aggregation.
 * @param {Object<string, Array>} extras - Extras keyed by category.
 * @returns {Array<Object>} Flat list of extras items.
 */
export function flattenExtras(extras = {}) {
  return EXTRA_CATEGORY_KEYS.reduce((acc, key) => {
    const items = Array.isArray(extras[key]) ? extras[key] : [];
    if (items.length) {
      acc.push(...items);
    }
    return acc;
  }, []);
}

/**
 * Calculate subtotal for all extras selections.
 * @param {Object<string, Array>} extras - Extras keyed by category.
 * @returns {number} Total price of extras.
 *
 * BUG FIX (2025-11-09): Changed (quantity || 1) to properly handle quantity: 0.
 * Previously, zero-quantity items were charged as quantity: 1 because 0 is falsy.
 * Now uses nullish coalescing to only default undefined/null to 1.
 */
export function calculateExtrasSubtotal(extras = {}) {
  return flattenExtras(extras).reduce((sum, item) => {
    const unitPrice = Number(item?.price) || 0;
    const quantity = Number(item?.quantity);
    // Use ?? instead of || to properly handle 0 vs undefined/null
    const finalQuantity = (quantity !== undefined && !isNaN(quantity)) ? quantity : 1;
    return sum + unitPrice * finalQuantity;
  }, 0);
}
