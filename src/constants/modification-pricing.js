/**
 * Modification Pricing System for Shared Platter Catering Packages
 *
 * Delivered by Richard (Pricing Strategist) on October 25, 2025
 *
 * STRATEGY: Asymmetric pricing that incentivizes keeping base package items
 * - Removal credits: 50-100% refund based on margin tier
 * - Add-on costs: ezCater platform pricing (higher than removal credits)
 * - Net incentive: $12.60 average to keep items vs customizing
 *
 * MARGIN TIERS:
 * - High (70%+): 50% removal credit → Chips, Dips, Coleslaw, Potato Salad, Daisy's desserts, Water
 * - Medium (50-69%): 75% removal credit → Veggie tray, Salads, Chef's Quality desserts, Beverages
 * - Low (<50%): 100% removal credit → NY Cheesecake, Large format beverages
 *
 * SAFETY CONSTRAINTS:
 * - Maximum removal credit: 20% of base package price
 * - Minimum order values: Tier 1 $125, Tier 2 $180, Tier 3 $280
 * - Core items non-removable: Wings, packaging, utensils
 */

export const MODIFICATION_PRICING = {
  chips: {
    "Miss Vickie's Chips 5-Pack": {
      basePrice: 8.50,
      ezCaterPrice: 10.20,
      removalCredit: 4.25,      // 50% (high-margin)
      addOnCost: 10.20,
      netIncentive: 5.95,        // $10.20 - $4.25
      marginTier: 'high',
      margin: 0.88               // 88% margin
    }
  },

  dips: {
    "Dip 5-Pack": {
      basePrice: 3.50,
      ezCaterPrice: 4.20,
      removalCredit: 1.75,       // 50% (high-margin)
      addOnCost: 4.20,
      netIncentive: 2.45,        // $4.20 - $1.75
      marginTier: 'high',
      margin: 0.814              // 81.4% margin
    }
  },

  coldSides: {
    "Family Coleslaw": {
      basePrice: 12.00,
      ezCaterPrice: 14.40,
      removalCredit: 6.00,       // 50% (high-margin)
      addOnCost: 14.40,
      netIncentive: 8.40,        // $14.40 - $6.00
      marginTier: 'high',
      margin: 0.61               // 61% margin
    },
    "Family Potato Salad": {
      basePrice: 14.00,
      ezCaterPrice: 16.80,
      removalCredit: 7.00,       // 50% (high-margin)
      addOnCost: 16.80,
      netIncentive: 9.80,        // $16.80 - $7.00
      marginTier: 'high',
      margin: 0.60               // 60% margin
    },
    "Large Veggie Sticks Tray": {
      basePrice: 8.00,
      ezCaterPrice: 9.60,
      removalCredit: 6.00,       // 75% (medium-margin)
      addOnCost: 9.60,
      netIncentive: 3.60,        // $9.60 - $6.00
      marginTier: 'medium',
      margin: 0.48               // 48% margin
    }
  },

  salads: {
    "Caesar Salad (Family Size)": {
      basePrice: 27.99,
      ezCaterPrice: 33.59,
      removalCredit: 20.99,      // 75% (medium-margin)
      addOnCost: 33.59,
      netIncentive: 12.60,       // $33.59 - $20.99 [EXAMPLE FROM RICHARD]
      marginTier: 'medium',
      margin: 0.42               // 42% margin
    },
    "Spring Mix Salad (Family Size)": {
      basePrice: 24.99,
      ezCaterPrice: 29.99,
      removalCredit: 18.74,      // 75% (medium-margin)
      addOnCost: 29.99,
      netIncentive: 11.25,       // $29.99 - $18.74
      marginTier: 'medium',
      margin: 0.45               // 45% margin
    }
  },

  desserts: {
    // HIGH-MARGIN: Daisy's Bakery (88-92% margins - SUPERSTAR performers)
    "Marble Pound Cake 5-Pack": {
      basePrice: 17.50,          // $3.50 x 5
      ezCaterPrice: 21.00,
      removalCredit: 8.75,       // 50% (high-margin)
      addOnCost: 21.00,
      netIncentive: 12.25,       // $21.00 - $8.75
      marginTier: 'high',
      margin: 0.90               // 90% margin
    },
    "Gourmet Brownies 5-Pack": {
      basePrice: 20.00,          // $4.00 x 5
      ezCaterPrice: 24.00,
      removalCredit: 10.00,      // 50% (high-margin)
      addOnCost: 24.00,
      netIncentive: 14.00,       // $24.00 - $10.00
      marginTier: 'high',
      margin: 0.91               // 91% margin
    },

    // MEDIUM-MARGIN: Chef's Quality (51-54% margins)
    "Red Velvet Cake 5-Pack": {
      basePrice: 21.25,          // $4.25 x 5
      ezCaterPrice: 25.50,
      removalCredit: 15.94,      // 75% (medium-margin)
      addOnCost: 25.50,
      netIncentive: 9.56,        // $25.50 - $15.94
      marginTier: 'medium',
      margin: 0.52               // 52% margin
    },
    "Crème Brûlée Cheesecake 5-Pack": {
      basePrice: 22.50,          // $4.50 x 5
      ezCaterPrice: 27.00,
      removalCredit: 16.88,      // 75% (medium-margin)
      addOnCost: 27.00,
      netIncentive: 10.12,       // $27.00 - $16.88
      marginTier: 'medium',
      margin: 0.50               // 50% margin
    },

    // LOW-MARGIN: Premium Bindi (40-43% margins - acceptable for premium brand)
    "NY Cheesecake 5-Pack": {
      basePrice: 23.75,          // $4.75 x 5
      ezCaterPrice: 28.50,
      removalCredit: 23.75,      // 100% (low-margin)
      addOnCost: 28.50,
      netIncentive: 4.75,        // $28.50 - $23.75
      marginTier: 'low',
      margin: 0.41               // 41% margin
    }
  },

  hotBeverages: {
    "Lavazza Coffee 96oz": {
      basePrice: 48.00,
      ezCaterPrice: 57.60,
      removalCredit: 36.00,      // 75% (medium-margin)
      addOnCost: 57.60,
      netIncentive: 21.60,       // $57.60 - $36.00
      marginTier: 'medium',
      margin: 0.42               // 42% margin
    },
    "Lavazza Coffee 128oz": {
      basePrice: 62.00,
      ezCaterPrice: 74.40,
      removalCredit: 46.50,      // 75% (medium-margin)
      addOnCost: 74.40,
      netIncentive: 27.90,       // $74.40 - $46.50
      marginTier: 'medium',
      margin: 0.44               // 44% margin
    },
    "Ghirardelli Hot Chocolate 96oz": {
      basePrice: 58.00,
      ezCaterPrice: 69.60,
      removalCredit: 43.50,      // 75% (medium-margin)
      addOnCost: 69.60,
      netIncentive: 26.10,       // $69.60 - $43.50
      marginTier: 'medium',
      margin: 0.42               // 42% margin
    },
    "Ghirardelli Hot Chocolate 128oz": {
      basePrice: 72.00,
      ezCaterPrice: 86.40,
      removalCredit: 54.00,      // 75% (medium-margin)
      addOnCost: 86.40,
      netIncentive: 32.40,       // $86.40 - $54.00
      marginTier: 'medium',
      margin: 0.44               // 44% margin
    }
  },

  coldBeverages: {
    "Boxed Iced Tea 96oz": {
      basePrice: 12.99,
      ezCaterPrice: 15.59,
      removalCredit: 9.74,       // 75% (medium-margin)
      addOnCost: 15.59,
      netIncentive: 5.85,        // $15.59 - $9.74
      marginTier: 'medium',
      margin: 0.55               // 55% margin
    },
    "Boxed Iced Tea 3 Gallon": {
      basePrice: 54.26,
      ezCaterPrice: 65.11,
      removalCredit: 54.26,      // 100% (low-margin, large format)
      addOnCost: 65.11,
      netIncentive: 10.85,       // $65.11 - $54.26
      marginTier: 'low',
      margin: 0.35               // 35% margin
    },
    "Bottled Water 24-pack": {
      basePrice: 19.99,
      ezCaterPrice: 23.99,
      removalCredit: 9.995,      // 50% (high-margin)
      addOnCost: 23.99,
      netIncentive: 13.995,      // $23.99 - $9.995
      marginTier: 'high',
      margin: 0.75               // 75% margin
    },
    "Canned Sodas 24-pack": {
      basePrice: 29.99,
      ezCaterPrice: 35.99,
      removalCredit: 22.49,      // 75% (medium-margin)
      addOnCost: 35.99,
      netIncentive: 13.50,       // $35.99 - $22.49
      marginTier: 'medium',
      margin: 0.58               // 58% margin
    }
  }
};

/**
 * Minimum order values by package tier
 * Prevents orders from dropping below profitable thresholds
 */
export const MINIMUM_ORDER_VALUES = {
  1: 125.00,  // Tier 1 (10-15 people)
  2: 180.00,  // Tier 2 (20-35 people)
  3: 280.00   // Tier 3 (50-100 people)
};

/**
 * Maximum removal credit as percentage of base package price
 * Protects package margin integrity
 */
export const MAX_REMOVAL_CREDIT_PERCENTAGE = 0.20; // 20%

/**
 * Get removal credit for an item
 * @param {string} itemName - Full item name (e.g., "Caesar Salad (Family Size)")
 * @param {string} category - Category key (chips, dips, coldSides, salads, desserts, hotBeverages, coldBeverages)
 * @returns {number} Removal credit amount in dollars
 */
export function getRemovalCredit(itemName, category) {
  const categoryPricing = MODIFICATION_PRICING[category];
  if (!categoryPricing) {
    console.warn(`⚠️ Unknown pricing category: ${category}`);
    return 0;
  }

  const itemPricing = categoryPricing[itemName];
  if (!itemPricing) {
    console.warn(`⚠️ Unknown item in ${category}: ${itemName}`);
    return 0;
  }

  return itemPricing.removalCredit || 0;
}

/**
 * Get add-on cost for an item
 * @param {string} itemName - Full item name
 * @param {string} category - Category key
 * @returns {number} Add-on cost in dollars (ezCater pricing)
 */
export function getAddOnCost(itemName, category) {
  const categoryPricing = MODIFICATION_PRICING[category];
  if (!categoryPricing) {
    console.warn(`⚠️ Unknown pricing category: ${category}`);
    return 0;
  }

  const itemPricing = categoryPricing[itemName];
  if (!itemPricing) {
    console.warn(`⚠️ Unknown item in ${category}: ${itemName}`);
    return 0;
  }

  return itemPricing.addOnCost || itemPricing.ezCaterPrice || 0;
}

/**
 * Validate total removal credits don't exceed 20% cap
 * @param {number} basePrice - Base package price
 * @param {Array} removedItems - Array of {name, category, quantity} objects
 * @returns {Object} {valid: boolean, totalCredit: number, maxCredit: number, exceeded: number}
 */
export function validateRemovalCredits(basePrice, removedItems) {
  const totalCredit = removedItems.reduce((sum, item) => {
    const creditPerUnit = getRemovalCredit(item.name, item.category);
    return sum + (creditPerUnit * (item.quantity || 1));
  }, 0);

  const maxCredit = basePrice * MAX_REMOVAL_CREDIT_PERCENTAGE;
  const exceeded = Math.max(0, totalCredit - maxCredit);

  return {
    valid: totalCredit <= maxCredit,
    totalCredit: totalCredit,
    maxCredit: maxCredit,
    exceeded: exceeded
  };
}

/**
 * Calculate modification impact on order
 * @param {number} basePrice - Base package price
 * @param {Array} removedItems - Items removed from package
 * @param {Array} addedItems - Items added to package
 * @returns {Object} Pricing breakdown with finalPrice
 */
export function calculateModificationPricing(basePrice, removedItems = [], addedItems = []) {
  // Calculate removal credits (capped at 20%)
  const removalValidation = validateRemovalCredits(basePrice, removedItems);
  const totalRemovalCredit = Math.min(removalValidation.totalCredit, removalValidation.maxCredit);

  // Calculate add-on costs
  const totalAddOnCost = addedItems.reduce((sum, item) => {
    const costPerUnit = getAddOnCost(item.name, item.category);
    return sum + (costPerUnit * (item.quantity || 1));
  }, 0);

  // Final calculation
  const finalPrice = basePrice - totalRemovalCredit + totalAddOnCost;

  return {
    basePrice: basePrice,
    removalCredits: totalRemovalCredit,
    addOnCharges: totalAddOnCost,
    finalPrice: finalPrice,
    netModification: totalAddOnCost - totalRemovalCredit,
    capExceeded: !removalValidation.valid,
    exceededAmount: removalValidation.exceeded
  };
}

/**
 * Format price for display
 * @param {number} price - Price in dollars
 * @returns {string} Formatted price (e.g., "$27.99")
 */
export function formatPrice(price) {
  return `$${price.toFixed(2)}`;
}

/**
 * Get price delta display (positive or negative)
 * @param {number} delta - Price change amount
 * @returns {string} Formatted delta with + or - prefix
 */
export function formatPriceDelta(delta) {
  if (delta === 0) return '$0.00';
  const prefix = delta > 0 ? '+' : '';
  return `${prefix}$${delta.toFixed(2)}`;
}
