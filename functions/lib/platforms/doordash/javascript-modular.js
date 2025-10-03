/**
 * DoorDash JavaScript Generation - Modular Version
 * Coordinates all JavaScript modules for DoorDash platform
 */

const { generateWingsModalJS } = require('./modules/wings-modal-complete.js');
const { generateWingsSharedJS } = require('./modules/wings-shared.js');
const { generateWingsBonelessJS } = require('./modules/wings-boneless.js');
const { generateWingsBoneInJS } = require('./modules/wings-bonein.js');
const { generateSidesModalSharedJS } = require('./modules/sides-modal-shared.js');
const { generateSidesFriesJS } = require('./modules/sides-fries.js');
const { generateSidesLoadedFriesJS } = require('./modules/sides-loaded-fries.js');
const { generateSidesMozzarellaJS } = require('./modules/sides-mozzarella.js');
const { generateBeverageModalJS } = require('./modules/beverage-modal.js');
const { generateSharedUtilsJS } = require('./modules/shared-utils.js');

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
    // SIDES MODAL MODULE (Modular Architecture)
    // ==============================================
    ${generateSidesModalSharedJS(menuData)}

    ${generateSidesFriesJS(menuData)}

    ${generateSidesLoadedFriesJS(menuData)}

    ${generateSidesMozzarellaJS(menuData)}

    // ==============================================
    // BEVERAGE MODAL MODULE (Moved earlier for onclick compatibility)
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

  // Group beverage variants for the modal
  const beverageGroups = generateBeverageGroups(menuData.drinks?.variants || [], menuData);

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

    // Beverage groups for modal interaction
    window.beverageGroups = ${JSON.stringify(beverageGroups)};

    console.log('Global variables initialized with Firestore data');
  `;
}

// Helper function to group individual variants into logical beverage types (same logic as HTML)
function generateBeverageGroups(drinksVariants, menuData = {}) {
  const baggedTeaDoc = menuData.bagged_tea;
  const boxedIcedTeaDoc = menuData.boxed_iced_tea;
  const groups = [];

  // 1. Fountain Drinks from drinks variants
  const fountainVariants = drinksVariants.filter(v => v.id.includes('fountain'));
  if (fountainVariants.length > 0) {
    groups.push({
      id: 'fountain-drinks',
      name: 'Fountain Drinks',
      description: '8 Flavors: Coca-Cola, Diet Coke, Coke Zero, Sprite, Fanta Orange, Dr Pepper, Barq\'s Root Beer, Hi-C Fruit Punch',
      imageUrl: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Ffountain-drinks_1920x1080.webp?alt=media',
      badge: 'CHOOSE SIZE',
      featured: true,
      sizes: fountainVariants.map(v => ({
        id: v.id,
        name: v.size || v.name,
        label: v.size || v.name,
        description: `Fountain drink ${v.size}`,
        platformPrice: v.platformPrice || v.basePrice,
        basePrice: v.basePrice
      })),
      flavors: [
        { id: 'coca_cola', name: 'Coca-Cola' },
        { id: 'diet_coke', name: 'Diet Coke' },
        { id: 'coke_zero', name: 'Coke Zero' },
        { id: 'sprite', name: 'Sprite' },
        { id: 'fanta_orange', name: 'Fanta Orange' },
        { id: 'dr_pepper', name: 'Dr Pepper' },
        { id: 'barqs_root_beer', name: 'Barq\'s Root Beer' },
        { id: 'hic_fruit_punch', name: 'Hi-C Fruit Punch' }
      ],
      type: 'fountain'
    });
  }

  // 2. Fresh Brewed Tea (individual sizes) from drinks variants
  const teaVariants = drinksVariants.filter(v => v.id.includes('tea'));
  if (teaVariants.length > 0) {
    // Extract unique sizes from tea variants (20oz, 32oz)
    const uniqueSizes = [];
    const sizesSeen = new Set();

    teaVariants.forEach(v => {
      const sizeLabel = v.size || (v.name.includes('20oz') ? '20oz' : v.name.includes('32oz') ? '32oz' : 'Standard');
      if (!sizesSeen.has(sizeLabel)) {
        sizesSeen.add(sizeLabel);
        // Use the first variant of this size for pricing (sweet tea)
        const sampleVariant = teaVariants.find(tv => (tv.size || tv.name).includes(sizeLabel));
        uniqueSizes.push({
          id: sampleVariant.id,
          name: sampleVariant.name,
          label: sizeLabel,
          description: `Fresh brewed tea ${sizeLabel}`,
          platformPrice: sampleVariant.platformPrice || sampleVariant.basePrice,
          basePrice: sampleVariant.basePrice
        });
      }
    });

    groups.push({
      id: 'iced-tea',
      name: 'Fresh Brewed Tea',
      description: 'Freshly brewed daily • Sweet or unsweetened • Individual sizes',
      imageUrl: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Ficed-tea_1920x1080.webp?alt=media',
      badge: 'FRESH DAILY',
      sizes: uniqueSizes,
      flavors: [
        { id: 'sweet', name: 'Sweet Tea' },
        { id: 'unsweetened', name: 'Unsweetened Tea' }
      ],
      type: 'tea'
    });
  }

  // 3. Bagged Tea from separate document
  if (baggedTeaDoc && baggedTeaDoc.variants && baggedTeaDoc.variants.length > 0) {
    // Group variants by size, extracting unique sizes
    const sizeGroups = {};
    console.log('🔍 Bagged Tea Variants Debug:', baggedTeaDoc.variants.map(v => ({name: v.name, id: v.id})));
    baggedTeaDoc.variants.forEach(variant => {
      // Extract size from variant name (e.g., "1/2 gallon" from "Sweet Tea 1/2 Gallon Bag")
      const sizeMatch = variant.name.match(/(1\/2\s*gallon|1\s*gallon|\d+\s*(oz|gallon))/i);
      const sizeKey = sizeMatch ? sizeMatch[1].toLowerCase().replace(/\s+/g, ' ') : 'unknown';
      console.log(`🔍 Variant: "${variant.name}" -> Size Match: ${sizeMatch ? sizeMatch[1] : 'NO MATCH'} -> Key: "${sizeKey}"`);

      if (!sizeGroups[sizeKey]) {
        sizeGroups[sizeKey] = {
          id: variant.id.replace(/(sweet|unsweetened)_/i, ''), // Remove tea type from ID
          name: variant.name.replace(/(Sweet|Unsweetened)\s*/i, ''), // Remove tea type from name
          label: variant.name.replace(/(Sweet|Unsweetened)\s*/i, ''),
          description: variant.description,
          platformPrice: variant.platformPricing?.doordash || variant.platformPrice || variant.basePrice,
          basePrice: variant.basePrice
        };
      }
    });

    groups.push({
      id: 'bagged-tea',
      name: baggedTeaDoc.name || 'Bagged Tea',
      description: baggedTeaDoc.description || 'Bulk tea in convenient bags • Perfect for groups',
      imageUrl: baggedTeaDoc.images?.hero || 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Fbagged-tea_1920x1080.webp?alt=media',
      badge: 'BULK SIZE',
      sizes: Object.values(sizeGroups),
      flavors: [
        { id: 'sweet', name: 'Sweet Tea' },
        { id: 'unsweetened', name: 'Unsweetened Tea' }
      ],
      type: 'bagged_tea'
    });
  }

  // 4. Boxed Iced Tea from separate document
  if (boxedIcedTeaDoc && boxedIcedTeaDoc.variants && boxedIcedTeaDoc.variants.length > 0) {
    // Group variants by size, extracting unique sizes
    const sizeGroups = {};
    boxedIcedTeaDoc.variants.forEach(variant => {
      // Extract size from variant name (e.g., "96oz" from "Sweet Tea 96oz Box")
      const sizeMatch = variant.name.match(/(\d+\s*(oz|gallon))/i);
      const sizeKey = sizeMatch ? sizeMatch[1].toLowerCase() : 'unknown';

      if (!sizeGroups[sizeKey]) {
        sizeGroups[sizeKey] = {
          id: variant.id.replace(/(sweet|unsweetened)_/i, ''), // Remove tea type from ID
          name: variant.name.replace(/(Sweet|Unsweetened)\s*/i, ''), // Remove tea type from name
          label: variant.name.replace(/(Sweet|Unsweetened)\s*/i, ''),
          description: variant.description,
          platformPrice: variant.platformPricing?.doordash || variant.platformPrice || variant.basePrice,
          basePrice: variant.basePrice
        };
      }
    });

    groups.push({
      id: 'boxed-iced-tea',
      name: boxedIcedTeaDoc.name || 'Boxed Iced Tea',
      description: boxedIcedTeaDoc.description || 'Large volume iced tea in boxes • Includes ice',
      imageUrl: boxedIcedTeaDoc.images?.hero || 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Fboxed-iced-tea_1920x1080.webp?alt=media',
      badge: 'LARGE VOLUME',
      sizes: Object.values(sizeGroups),
      flavors: [
        { id: 'sweet', name: 'Sweet Tea' },
        { id: 'unsweetened', name: 'Unsweetened Tea' }
      ],
      type: 'boxed_tea'
    });
  }

  // 5. Bottled Water from drinks variants
  const waterVariants = drinksVariants.filter(v => v.id.includes('water'));
  if (waterVariants.length > 0) {
    waterVariants.forEach(variant => {
      groups.push({
        id: variant.id,
        name: variant.name,
        description: 'Pure refreshment • 16.9 fl oz bottle',
        imageUrl: variant.image || 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Fwater-bottle_1920x1080.webp?alt=media',
        badge: 'PURE',
        sizes: [{
          id: variant.id,
          name: variant.name,
          label: 'Standard',
          description: variant.description || 'Pure refreshment • 16.9 fl oz bottle',
          platformPrice: variant.platformPrice || variant.basePrice,
          basePrice: variant.basePrice
        }],
        flavors: [],
        type: 'bottle'
      });
    });
  }

  return groups;
}

module.exports = {
  generateDoorDashJS
};
