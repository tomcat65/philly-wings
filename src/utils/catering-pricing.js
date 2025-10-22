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
 */
export function calculateExtrasSubtotal(extras = {}) {
  return flattenExtras(extras).reduce((sum, item) => {
    const unitPrice = Number(item?.price) || 0;
    const quantity = Number(item?.quantity) || 0;
    return sum + unitPrice * (quantity || 1);
  }, 0);
}
