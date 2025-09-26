/**
 * Platform pricing engine - handles markup calculations for each delivery platform
 */

/**
 * Get platform-specific markup multiplier
 * @param {string} platform Platform name (doordash, ubereats, grubhub)
 * @returns {number} Markup multiplier (e.g., 1.35 for 35% markup)
 */
function getPlatformMarkup(platform) {
  const markups = {
    'doordash': 1.35,  // 35% markup
    'ubereats': 1.35,  // 35% markup
    'grubhub': 1.215   // 21.5% markup
  };
  return markups[platform] || 1.35;
}

/**
 * Apply platform-specific pricing to wing variants
 * @param {Array} wingsData Array of wing variants
 * @param {number} markup Markup multiplier
 * @returns {Array} Processed wing variants with platform pricing
 */
function processWingVariants(wingsData, markup) {
  return wingsData.map(wing => ({
    ...wing,
    platformPrice: parseFloat((wing.basePrice * markup).toFixed(2))
  }));
}

/**
 * Apply platform-specific pricing to combos
 * @param {Array} combosData Array of combo items
 * @param {number} markup Markup multiplier
 * @returns {Array} Processed combos with platform pricing
 */
function processCombos(combosData, markup) {
  return combosData.map(combo => ({
    ...combo,
    platformPrice: parseFloat((combo.basePrice * markup).toFixed(2))
  }));
}

/**
 * Apply platform-specific pricing to sides
 * @param {Array} friesData Fries items array
 * @param {Array} mozzarellaData Mozzarella sticks items array
 * @param {number} markup Markup multiplier
 * @returns {Object} Processed sides with platform pricing
 */
function processSides(friesData, mozzarellaData, markup) {
  return {
    fries: friesData.map(item => ({
      ...item,
      platformPrice: parseFloat((item.basePrice * markup).toFixed(2))
    })),
    mozzarella: mozzarellaData.map(item => ({
      ...item,
      platformPrice: parseFloat((item.basePrice * markup).toFixed(2))
    }))
  };
}

/**
 * Apply platform-specific pricing to beverages
 * @param {Array} drinksData Array of beverage items
 * @param {number} markup Markup multiplier
 * @returns {Array} Processed beverages with platform pricing
 */
function processBeverages(drinksData, markup) {
  return drinksData.map(drink => ({
    ...drink,
    platformPrice: parseFloat((drink.basePrice * markup).toFixed(2))
  }));
}

/**
 * Process complete platform menu with pricing
 * @param {Object} menuData Raw menu data from Firestore
 * @param {string} platform Platform name
 * @returns {Object} Complete processed menu with platform pricing
 */
function processPlatformMenu(menuData, platform) {
  const markup = getPlatformMarkup(platform);

  const processedWings = processWingVariants(menuData.wings, markup);
  const processedCombos = processCombos(menuData.combos, markup);
  const processedSides = processSides(menuData.sides.fries, menuData.sides.mozzarella, markup);
  const processedBeverages = processBeverages(menuData.beverages, markup);

  // Sauces don't typically have pricing, so pass through as-is
  const sauces = menuData.sauces;

  return {
    wings: processedWings,
    combos: processedCombos,
    sides: processedSides,
    beverages: processedBeverages,
    sauces: sauces,
    settings: menuData.settings,
    platform: platform,
    markup: markup
  };
}

module.exports = {
  getPlatformMarkup,
  processWingVariants,
  processCombos,
  processSides,
  processBeverages,
  processPlatformMenu
};