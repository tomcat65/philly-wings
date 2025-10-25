/**
 * Pricing Calculation Engine
 * Calculates total pricing for catering orders
 */

/**
 * Calculate complete pricing for an order
 * @param {object} state - Complete customization state
 * @returns {object} Pricing breakdown
 */
export function calculatePricing(state) {
  const basePrice = state.package?.basePrice || 0;

  // Calculate add-ons (salads, desserts, beverages beyond included)
  const addOns = calculateAddOns(state);

  // Calculate quick-adds
  const quickAdds = calculateQuickAdds(state);

  // Subtotal
  const subtotal = basePrice + addOns + quickAdds;

  // Tax (assuming 8% - this should come from delivery location)
  const taxRate = 0.08;
  const tax = subtotal * taxRate;

  // Delivery fee (placeholder - should be calculated based on distance/order size)
  const deliveryFee = calculateDeliveryFee(subtotal);

  // Total
  const total = subtotal + tax + deliveryFee;

  return {
    basePrice,
    customizationAdjustments: 0, // No adjustments for now - wings are included in base
    addOns,
    quickAdds,
    subtotal,
    tax: parseFloat(tax.toFixed(2)),
    deliveryFee,
    total: parseFloat(total.toFixed(2))
  };
}

/**
 * Calculate add-ons pricing
 * @param {object} state - Customization state
 * @returns {number} Add-ons total
 */
function calculateAddOns(state) {
  let total = 0;

  // Salads (beyond included)
  if (state.sides?.salads) {
    state.sides.salads.forEach(salad => {
      if (salad.isAddon) {
        total += salad.price * salad.quantity;
      }
    });
  }

  // Desserts
  if (state.desserts) {
    state.desserts.forEach(dessert => {
      total += dessert.price * dessert.fivePacks;
    });
  }

  // Beverages (beyond included)
  if (state.beverages) {
    state.beverages.forEach(beverage => {
      if (beverage.isAddon) {
        total += beverage.price * beverage.quantity;
      }
    });
  }

  return parseFloat(total.toFixed(2));
}

/**
 * Calculate quick-adds pricing
 * @param {object} state - Customization state
 * @returns {number} Quick-adds total
 */
function calculateQuickAdds(state) {
  if (!state.quickAdds || state.quickAdds.length === 0) {
    return 0;
  }

  const total = state.quickAdds.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);

  return parseFloat(total.toFixed(2));
}

/**
 * Calculate delivery fee based on order size
 * @param {number} subtotal - Order subtotal
 * @returns {number} Delivery fee
 */
function calculateDeliveryFee(subtotal) {
  // Free delivery over $300
  if (subtotal >= 300) {
    return 0;
  }

  // $25 delivery fee for orders under $300
  return 25.00;
}

/**
 * Format price for display
 * @param {number} price - Price value
 * @returns {string} Formatted price
 */
export function formatPrice(price) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(price);
}

/**
 * Calculate price per person
 * @param {number} total - Total price
 * @param {number} peopleCount - Number of people
 * @returns {number} Price per person
 */
export function calculatePricePerPerson(total, peopleCount) {
  if (!peopleCount || peopleCount === 0) return 0;
  return parseFloat((total / peopleCount).toFixed(2));
}
