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
    calculate(selections, productData, productConfig, globalData = {}) {
      let base = 0;
      const addons = [];
      const DOORDASH_MARKUP = 1.35; // 35% markup

      // Base price from variant
      if (selections.variant) {
        base = selections.variant.platformPrice || selections.variant.basePrice || 0;
      }

      // Process all optional addon steps dynamically
      const optionalAddonSteps = productConfig.customizationFlow?.filter(step => step.type === 'optional-addons') || [];

      optionalAddonSteps.forEach(step => {
        const selectedAddons = selections[step.id];
        if (!selectedAddons || Object.keys(selectedAddons).length === 0) return;

        // Get the correct data source
        let addonsList = [];
        if (step.dataSource === 'dippingSauces' && globalData?.dippingSauces) {
          addonsList = globalData.dippingSauces;
        } else if (step.dataSource === 'sauces' && globalData?.sauces) {
          addonsList = globalData.sauces.filter(s =>
            s.category !== 'dipping-sauce' &&
            s.category !== 'dry-rub' &&
            s.active !== false
          );
        }

        // Calculate addon prices
        Object.entries(selectedAddons).forEach(([addonId, qty]) => {
          if (qty <= 0) return;

          const addon = addonsList.find(a => a.id === addonId);
          if (!addon) return;

          // Get price: either from Firebase basePrice with markup, or fallback to hardcoded
          let pricePerItem;
          if (step.priceSource === 'firebase' && addon.basePrice) {
            pricePerItem = parseFloat((addon.basePrice * DOORDASH_MARKUP).toFixed(2));
          } else {
            pricePerItem = step.pricePerItem || 0.99;
          }

          const lineTotal = parseFloat((pricePerItem * qty).toFixed(2));
          addons.push({
            name: `${qty}x ${addon.name}`,
            price: lineTotal
          });
        });
      });

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
