/**
 * Product Configurator - Pricing Strategies
 * Different pricing calculation strategies for different product types
 */

/**
 * Pricing strategy registry
 * Each strategy provides a calculate() function
 */
const PRICING_STRATEGIES = {
  /**
   * Configurable Entree Strategy
   * Used for: Wings (boneless, bone-in, plant-based), Salads
   * Base price from variant + addons
   */
  'configurable-entree': {
    calculate(selections, productData, productConfig) {
      let base = 0;
      const addons = [];

      // Base price from variant
      if (selections.variant) {
        base = selections.variant.platformPrice || selections.variant.basePrice || 0;
      }

      // Extra dips addon
      if (selections.extraDips) {
        const dipIds = Object.keys(selections.extraDips);
        const dipCount = dipIds.length;
        if (dipCount > 0) {
          const dipPrice = 0.99;
          addons.push({
            name: `${dipCount}x Extra Dip${dipCount > 1 ? 's' : ''}`,
            price: parseFloat((dipPrice * dipCount).toFixed(2))
          });
        }
      }

      // Protein addon (for salads)
      if (selections.protein) {
        const proteinPrice = 4.99;
        addons.push({
          name: 'Added Protein',
          price: proteinPrice
        });
      }

      // Calculate total
      const addonTotal = addons.reduce((sum, addon) => sum + addon.price, 0);
      const total = parseFloat((base + addonTotal).toFixed(2));

      return {
        base: parseFloat(base.toFixed(2)),
        addons,
        total
      };
    }
  },

  /**
   * Simple Product Strategy
   * Used for: Beverages, simple items with no customization
   * Just variant price, no addons
   */
  'simple-product': {
    calculate(selections, productData, productConfig) {
      const total = selections.variant?.platformPrice || selections.variant?.basePrice || 0;
      return {
        base: parseFloat(total.toFixed(2)),
        addons: [],
        total: parseFloat(total.toFixed(2))
      };
    }
  },

  /**
   * Combo Builder Strategy (Future)
   * Used for: Build-your-own combos with bundle discounts
   */
  'combo-builder': {
    calculate(selections, productData, productConfig) {
      // TODO: Implement combo pricing with discounts
      // Base combo price + selected items - bundle discount
      return {
        base: 0,
        addons: [],
        discount: 0,
        total: 0
      };
    }
  }
};

module.exports = {
  PRICING_STRATEGIES
};
