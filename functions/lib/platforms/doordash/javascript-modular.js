/**
 * DoorDash JavaScript Generation - Modular Version
 * Coordinates all JavaScript modules for DoorDash platform
 */

const { generateWingsModalJS } = require('./modules/wings-modal-complete');
const { generateWingsSharedJS } = require('./modules/wings-shared');
const { generateWingsBonelessJS } = require('./modules/wings-boneless');
const { generateWingsBoneInJS } = require('./modules/wings-bonein');
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
    // WINGS MODAL MODULE (Existing)
    // ==============================================
    ${generateWingsModalJS(menuData, saucesData)}

    // ==============================================
    // WINGS FLOW ORCHESTRATORS (Boneless / Bone-In)
    // ==============================================
    ${generateWingsBonelessJS(menuData)}

    ${generateWingsBoneInJS(menuData)}

    ${generateWingsSharedJS()}

    // ==============================================
    // ENTRY POINT WRAPPERS (Override legacy to orchestrators)
    // ==============================================
    window.openBonelessWingModal = function() {
      if (typeof window.launchBonelessOrchestrator === 'function') {
        return window.launchBonelessOrchestrator();
      }
      if (typeof window.openWingModal === 'function') {
        return window.openWingModal('boneless');
      }
      console.warn('No boneless wing modal implementation available');
    };

    window.openBoneInWingModal = function() {
      if (typeof window.launchBoneInOrchestrator === 'function') {
        return window.launchBoneInOrchestrator();
      }
      if (typeof window.openWingModal === 'function') {
        return window.openWingModal('bone-in');
      }
      console.warn('No bone-in wing modal implementation available');
    };

    

    // ==============================================
    // INITIALIZATION
    // ==============================================
    document.addEventListener('DOMContentLoaded', function() {
      console.log('DoorDash modular menu system initialized');
      console.log('Menu data loaded:', Object.keys(strategicMenu));
      console.log('Firestore sauces:', firestoreSauces.length);

      // Defensive: Bind click handlers for wing category buttons
      // Event wiring is now handled by explicit onclicks in HTML (openBonelessWingModal / openBoneInWingModal)
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
