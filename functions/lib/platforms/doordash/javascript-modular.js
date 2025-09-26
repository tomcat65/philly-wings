/**
 * DoorDash JavaScript Generation - Modular Version
 * Coordinates all JavaScript modules for DoorDash platform
 */

const { generateWingsModalJS } = require('./modules/wings-modal-complete');
const { generateSidesModalJS } = require('./modules/sides-modal');
const { generateBeverageModalJS } = require('./modules/beverage-modal');
const { generateSharedUtilsJS } = require('./modules/shared-utils');

/**
 * Generate complete DoorDash JavaScript - Modular Version
 * @param {Object} menuData Complete menu data from Firestore including sauces
 * @returns {string} Complete JavaScript code
 */
function generateDoorDashJS(menuData = {}) {
  const saucesData = menuData.sauces || [];

  return `
    // ==============================================
    // PHILLY WINGS EXPRESS - DOORDASH JAVASCRIPT
    // Modular Architecture - Generated at ${new Date().toISOString()}
    // ==============================================

    ${generateGlobalVariables(menuData)}

    // ==============================================
    // SHARED UTILITIES MODULE
    // ==============================================
    ${generateSharedUtilsJS(menuData)}

    // ==============================================
    // SIDES MODAL MODULE
    // ==============================================
    ${generateSidesModalJS(menuData)}

    // ==============================================
    // BEVERAGE MODAL MODULE
    // ==============================================
    ${generateBeverageModalJS(menuData)}

    // ==============================================
    // WINGS MODAL MODULE (Partial - Needs Full Migration)
    // ==============================================
    ${generateWingsModalJS(menuData, saucesData)}

    // ==============================================
    // INITIALIZATION
    // ==============================================
    document.addEventListener('DOMContentLoaded', function() {
      console.log('DoorDash modular menu system initialized');
      console.log('Menu data loaded:', Object.keys(strategicMenu));
      console.log('Firestore sauces:', firestoreSauces.length);
    });

    console.log('🚀 DoorDash modular JavaScript loaded successfully');
  `;
}

/**
 * Generate global variables and strategic menu data
 */
function generateGlobalVariables(menuData = {}) {
  const saucesData = menuData.sauces || [];

  return `
    // ==============================================
    // GLOBAL VARIABLES AND STRATEGIC MENU DATA
    // ==============================================

    // Real Firestore sauce data (integrated from server-side)
    let firestoreSauces = ${JSON.stringify(saucesData)};

    // Strategic menu data (populated with real Firestore data)
    let strategicMenu = {
      wings: ${JSON.stringify(menuData.wings || {})},
      fries: ${JSON.stringify(menuData.fries || {})},
      mozzarella: ${JSON.stringify(menuData.mozzarella || {})},
      drinks: ${JSON.stringify(menuData.drinks || {})},
      sauces: firestoreSauces,
      dips: [],
      sides: [],
      beverages: []
    };

    console.log('Global variables initialized with Firestore data');
  `;
}

module.exports = {
  generateDoorDashJS
};