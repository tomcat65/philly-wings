/**
 * Validation Engine
 * Validates customization state and provides user feedback
 */

/**
 * Validate complete state
 * @param {object} state - Customization state
 * @returns {object} Validation result with errors and warnings
 */
export function validateState(state) {
  const errors = {};
  const warnings = {};

  // Validate package selection
  if (!state.package?.id) {
    errors.package = 'Please select a catering package';
    return { isValid: false, errors, warnings };
  }

  // Validate wings
  const wingValidation = validateWings(state.wings, state.package);
  if (wingValidation.errors) {
    Object.assign(errors, wingValidation.errors);
  }
  if (wingValidation.warnings) {
    Object.assign(warnings, wingValidation.warnings);
  }

  // Validate sauces
  const sauceValidation = validateSauces(state.sauces);
  if (sauceValidation.errors) {
    Object.assign(errors, sauceValidation.errors);
  }

  // Validate dips
  const dipValidation = validateDips(state.dips, state.package);
  if (dipValidation.errors) {
    Object.assign(errors, dipValidation.errors);
  }

  // Validate delivery
  const deliveryValidation = validateDelivery(state.delivery);
  if (deliveryValidation.errors) {
    Object.assign(errors, deliveryValidation.errors);
  }
  if (deliveryValidation.warnings) {
    Object.assign(warnings, deliveryValidation.warnings);
  }

  const isValid = Object.keys(errors).length === 0;

  return { isValid, errors, warnings };
}

/**
 * Validate wing customization
 * @param {object} wings - Wing state
 * @param {object} pkg - Package data
 * @returns {object} Validation result
 */
export function validateWings(wings, pkg) {
  const errors = {};
  const warnings = {};

  if (!pkg?.wingOptions) {
    return { errors, warnings };
  }

  const targetTotal = pkg.wingOptions.totalWings;
  const currentTotal =
    (wings.plantBased?.quantity || 0) +
    (wings.boneless?.quantity || 0) +
    (wings.boneIn?.quantity || 0);

  // Total must match package
  if (currentTotal !== targetTotal) {
    errors.wingTotal = `Total must be ${targetTotal} wings (currently ${currentTotal})`;
  }

  // Plant-based must have prep method if quantity > 0
  if (wings.plantBased?.quantity > 0 && !wings.plantBased.prep) {
    errors.plantBasedPrep = 'Please select preparation method for plant-based wings';
  }

  // Warnings for unusual distributions
  if (wings.plantBased?.quantity > 0 &&
      wings.boneless?.quantity === 0 &&
      wings.boneIn?.quantity === 0) {
    warnings.allPlantBased = 'All plant-based order - confirm this is intentional';
  }

  if (wings.plantBased?.quantity > 0 && wings.plantBased.quantity < 10) {
    warnings.smallPlantBased = 'Consider ordering at least 10 plant-based wings for better variety';
  }

  return { errors, warnings };
}

/**
 * Validate sauce selections
 * @param {object} sauces - Sauce state
 * @returns {object} Validation result
 */
export function validateSauces(sauces) {
  const errors = {};

  if (!sauces) {
    return { errors };
  }

  const selectedCount = sauces.selected?.length || 0;
  const min = sauces.min || 0;
  const max = sauces.max || 0;

  if (selectedCount < min) {
    errors.sauces = `Please select at least ${min} sauce${min > 1 ? 's' : ''}`;
  }

  if (selectedCount > max) {
    errors.sauces = `Maximum ${max} sauce${max > 1 ? 's' : ''} allowed`;
  }

  return { errors };
}

/**
 * Validate dip selections
 * @param {array} dips - Dip selections
 * @param {object} pkg - Package data
 * @returns {object} Validation result
 */
export function validateDips(dips, pkg) {
  const errors = {};

  if (!pkg?.dips || !dips) {
    return { errors };
  }

  const totalFivePacks = dips.reduce((sum, dip) => sum + (dip.fivePacks || 0), 0);
  const includedFivePacks = pkg.dips.fivePacksIncluded || 0;

  // Must select at least the included amount
  if (totalFivePacks < includedFivePacks) {
    errors.dips = `Please select ${includedFivePacks} dip 5-pack${includedFivePacks > 1 ? 's' : ''}`;
  }

  return { errors };
}

/**
 * Validate delivery information
 * @param {object} delivery - Delivery state
 * @returns {object} Validation result
 */
export function validateDelivery(delivery) {
  const errors = {};
  const warnings = {};

  if (!delivery) {
    return { errors, warnings };
  }

  // Date required
  if (!delivery.date) {
    errors.deliveryDate = 'Please select a delivery date';
  } else {
    // Check 24-hour minimum notice
    const deliveryDate = new Date(delivery.date);
    const now = new Date();
    const hoursUntilDelivery = (deliveryDate - now) / (1000 * 60 * 60);

    if (hoursUntilDelivery < 24) {
      errors.deliveryDate = 'Orders require 24-hour advance notice';
    } else if (hoursUntilDelivery < 48) {
      warnings.deliveryDate = 'Orders placed with 24-48 hours notice may incur rush fees';
    }
  }

  // Time window required
  if (!delivery.timeWindow) {
    errors.deliveryTime = 'Please select a delivery time window';
  }

  // Address required
  if (!delivery.address || !delivery.address.street) {
    errors.deliveryAddress = 'Please enter a delivery address';
  }

  return { errors, warnings };
}

/**
 * Validate delivery address is in service area
 * @param {object} address - Delivery address
 * @returns {Promise<object>} Validation result
 */
export async function validateServiceArea(address) {
  // Placeholder for actual geolocation validation
  // Would integrate with Google Maps API or similar

  // For now, just check if address is filled
  if (!address || !address.street || !address.city || !address.zip) {
    return {
      isValid: false,
      error: 'Complete address required for delivery validation'
    };
  }

  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 100));

  // Mock validation - would check 10-mile radius in production
  return {
    isValid: true,
    deliveryFee: 25.00,
    estimatedTime: '60-90 minutes'
  };
}
