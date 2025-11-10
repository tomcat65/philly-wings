/**
 * Kitchen-Ready Breakdown Calculator
 *
 * Provides detailed, kitchen-ready specifications for catering orders including:
 * - Sauce-type aware container calculations
 * - Dip bundling logic (5-packs only)
 * - Modification detection comparing against package defaults
 * - Progressive rendering with fallback support
 *
 * @module kitchen-breakdown-calculator
 * @created 2025-11-04
 * @epic SP-SUMMARY-WINDOW
 */

/**
 * Sauce coverage ratios (wings per 1.5oz container)
 * Based on viscosity and application method efficiency
 */
const SAUCE_COVERAGE_RATIOS = {
  // Dry rubs need less sauce for dipping
  'dry-rub': 18,

  // Wet thin sauces (Buffalo, Hot) coat evenly
  'wet-thin': 15,

  // Wet thick sauces (BBQ, Teriyaki) need more volume
  'wet-thick': 12,

  // Wet creamy sauces (Garlic Parm, Ranch) are most viscous
  'wet-creamy': 10,

  // Default fallback
  'default': 13
};

/**
 * Calculate sauce containers needed for "on the side" application
 *
 * @param {number} wingCount - Number of wings getting this sauce
 * @param {Object} sauceInfo - Sauce metadata {isDryRub, viscosity, category}
 * @returns {Object} Container calculation details
 */
export function calculateSideContainers(wingCount, sauceInfo = {}) {
  if (wingCount <= 0) {
    return {
      count: 0,
      size: '1.5oz',
      wingsPerContainer: 0,
      totalWings: 0,
      sauceType: 'none'
    };
  }

  // Determine sauce type for ratio lookup
  let sauceType = 'default';

  if (sauceInfo.isDryRub) {
    sauceType = 'dry-rub';
  } else if (sauceInfo.viscosity === 'thin') {
    sauceType = 'wet-thin';
  } else if (sauceInfo.viscosity === 'thick') {
    sauceType = 'wet-thick';
  } else if (sauceInfo.viscosity === 'creamy' || sauceInfo.category === 'creamy') {
    sauceType = 'wet-creamy';
  }

  const wingsPerContainer = SAUCE_COVERAGE_RATIOS[sauceType] || SAUCE_COVERAGE_RATIOS.default;
  const containersNeeded = Math.ceil(wingCount / wingsPerContainer);

  return {
    count: containersNeeded,
    size: '1.5oz',
    wingsPerContainer,
    totalWings: wingCount,
    sauceType
  };
}

/**
 * Calculate dip containers with 5-pack bundling
 *
 * @param {Array} dips - Array of {id, name, quantity} objects
 * @returns {Object} Dip bundling calculation
 */
export function calculateDipContainers(dips = []) {
  const totalRequested = dips.reduce((sum, dip) => sum + (dip.quantity || 0), 0);

  if (totalRequested === 0) {
    return {
      totalRequested: 0,
      packsNeeded: 0,
      totalProvided: 0,
      extras: 0,
      breakdown: []
    };
  }

  const packsNeeded = Math.ceil(totalRequested / 5);
  const totalProvided = packsNeeded * 5;
  const extras = totalProvided - totalRequested;

  return {
    totalRequested,
    packsNeeded,
    totalProvided,
    extras,
    breakdown: dips.map(dip => ({
      id: dip.id,
      name: dip.name,
      quantity: dip.quantity,
      size: '1.5oz'
    }))
  };
}

/**
 * Detect modifications comparing current config to package defaults
 *
 * @param {Object} packageInfo - Package with default configurations
 * @param {Object} currentConfig - Current user customizations
 * @returns {Object} Modification flags and details for all categories
 */
export function detectModifications(packageInfo = {}, currentConfig = {}) {
  const modifications = {
    wings: { isModified: false, changes: [], details: '' },
    sauces: { isModified: false, changes: [], details: '' },
    dips: { isModified: false, changes: [], details: '' },
    sides: { isModified: false, changes: [], details: '' },
    desserts: { isModified: false, changes: [], details: '' },
    beverages: { isModified: false, changes: [], details: '' }
  };

  // Wings modifications
  const defaultWings = packageInfo.wingOptions?.defaultDistribution || {};
  const currentWings = currentConfig.wingDistribution || {};

  if (defaultWings.boneless !== currentWings.boneless ||
      defaultWings.boneIn !== currentWings.boneIn ||
      currentWings.cauliflower > 0) {
    modifications.wings.isModified = true;

    if (defaultWings.boneless !== currentWings.boneless) {
      modifications.wings.changes.push({
        type: 'boneless',
        from: defaultWings.boneless || 0,
        to: currentWings.boneless || 0,
        delta: (currentWings.boneless || 0) - (defaultWings.boneless || 0)
      });
    }

    if (defaultWings.boneIn !== currentWings.boneIn) {
      modifications.wings.changes.push({
        type: 'boneIn',
        from: defaultWings.boneIn || 0,
        to: currentWings.boneIn || 0,
        delta: (currentWings.boneIn || 0) - (defaultWings.boneIn || 0)
      });
    }

    if (currentWings.cauliflower > 0) {
      modifications.wings.changes.push({
        type: 'cauliflower',
        from: 0,
        to: currentWings.cauliflower,
        delta: currentWings.cauliflower,
        isNew: true
      });
    }
  }

  // Sauces modifications (check if distributed)
  const sauceAssignments = currentConfig.sauceAssignments || {};
  const hasAssignments = Object.values(sauceAssignments.assignments || {})
    .some(arr => arr && arr.length > 0);

  if (hasAssignments) {
    modifications.sauces.isModified = true;
    modifications.sauces.details = 'Sauces distributed to wing types';
  }

  // Dips modifications
  const currentDips = currentConfig.dips || [];
  const defaultDipsTotal = packageInfo.dipsIncluded?.total || 0;
  const currentDipsTotal = currentDips.reduce((sum, dip) => sum + (dip.quantity || 0), 0);

  if (currentDipsTotal !== defaultDipsTotal || currentConfig.noDips) {
    modifications.dips.isModified = true;
    if (currentConfig.noDips) {
      modifications.dips.details = 'Dips skipped by customer request';
    } else {
      modifications.dips.changes.push({
        type: 'quantity',
        from: defaultDipsTotal,
        to: currentDipsTotal,
        delta: currentDipsTotal - defaultDipsTotal
      });
    }
  }

  // Sides modifications (simplified check for now)
  const currentSides = currentConfig.sides || {};
  if (currentSides.coldSides?.length > 0 || currentSides.salads?.length > 0) {
    modifications.sides.isModified = true;
  }

  // Desserts modifications
  const currentDesserts = currentConfig.desserts || [];
  if (currentDesserts.length > 0) {
    modifications.desserts.isModified = true;
  }

  // Beverages modifications
  const currentBeverages = currentConfig.beverages || {};
  if (currentBeverages.cold?.length > 0 || currentBeverages.hot?.length > 0) {
    modifications.beverages.isModified = true;
  }

  return modifications;
}

/**
 * Get wing style display label
 *
 * @param {string} style - 'mixed' | 'flats' | 'drums'
 * @returns {string} Display label
 */
export function getWingStyleLabel(style) {
  const labels = {
    mixed: 'Mixed - Drums & Flats',
    flats: 'All Flats',
    drums: 'All Drums'
  };
  return labels[style] || 'Mixed - Drums & Flats';
}
