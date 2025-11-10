/**
 * Add-Ons Pricing Calculator
 *
 * Calculates pricing for optional catering add-ons
 * (chips, beverages, sides, salads, desserts beyond package)
 *
 * @module pricing-addons-calculator
 * @created 2025-11-09
 * @epic SP-013 (Add-Ons Selector)
 */

import { createPricingStructure, addItem, addModifier } from './pricing-data-structure.js';
import pricingLogger from './pricing-logger.js';

/**
 * Calculate add-ons pricing from selected optional items
 *
 * @param {Object} addOns - Add-ons selections organized by category
 * @param {Array} addOns.quickAdds - Quick-add items (chips, water)
 * @param {Array} addOns.hotBeverages - Hot beverage add-ons (coffee, hot chocolate)
 * @param {Array} addOns.beverages - Cold beverage add-ons (iced tea)
 * @param {Array} addOns.desserts - Extra desserts
 * @param {Array} addOns.salads - Extra salads
 * @param {Array} addOns.sides - Extra sides
 * @returns {Object} Pricing structure with items and modifiers
 */
export function calculateAddOnsPricing(addOns = {}) {
  pricingLogger.startTimer('Add-Ons Pricing Calculation');

  const structure = createPricingStructure();

  try {
    // Process each category
    const categories = [
      { key: 'quickAdds', label: 'Quick-Adds' },
      { key: 'hotBeverages', label: 'Hot Beverages' },
      { key: 'beverages', label: 'Cold Beverages' },
      { key: 'desserts', label: 'Extra Desserts' },
      { key: 'salads', label: 'Extra Salads' },
      { key: 'sides', label: 'Extra Sides' }
    ];

    let totalAddOns = 0;

    categories.forEach(({ key, label }) => {
      const items = addOns[key] || [];

      items.forEach((item, index) => {
        const quantity = item.quantity || 0;

        if (quantity === 0) return; // Skip items with zero quantity

        const itemId = `addon-${key}-${item.id || index}`;
        const basePrice = item.basePrice || 0;
        const totalPrice = basePrice * quantity;

        // Add item to structure
        addItem(structure, itemId, 'addon', {
          name: item.name || 'Unknown Add-On',
          quantity,
          category: item.category || key,
          servings: item.servings || quantity,
          packSize: item.packSize
        });

        // Add upcharge modifier (all add-ons are upcharges)
        const quantityLabel = item.quantityLabel || 'items';
        const priceLabel = `${item.name} (${quantity} ${quantityLabel}) (+$${basePrice.toFixed(2)} each)`;

        addModifier(
          structure,
          itemId,
          'upcharge',
          totalPrice,
          priceLabel
        );

        pricingLogger.info('Applied add-on upcharge', {
          name: item.name,
          quantity,
          pricePerItem: `$${basePrice.toFixed(2)}`,
          upcharge: `$${totalPrice.toFixed(2)}`
        });

        totalAddOns++;
      });
    });

    // Mark completion status
    structure.meta.completionStatus.addons = totalAddOns > 0;

    const duration = pricingLogger.endTimer('Add-Ons Pricing Calculation');

    pricingLogger.info('Add-ons pricing complete', {
      duration: `${duration.toFixed(2)}ms`,
      totalAddOns,
      categories: categories.map(c => c.key).filter(k => (addOns[k] || []).length > 0)
    });

    return structure;

  } catch (error) {
    pricingLogger.error('Add-ons pricing calculation failed', {
      error: error.message,
      stack: error.stack
    });
    pricingLogger.endTimer('Add-Ons Pricing Calculation');
    throw error;
  }
}
