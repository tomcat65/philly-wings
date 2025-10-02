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
function generateBeverageGroups(variants, menuData = {}) {
  const groups = [];

  // Group fountain drinks - extract flavors from Firebase data
  const fountainVariants = variants.filter(v => v.id.includes('fountain'));
  if (fountainVariants.length > 0) {
    // Extract unique sizes from fountain variants
    const uniqueFountainSizes = [];
    const fountainSizesSeen = new Set();

    fountainVariants.forEach(v => {
      const sizeLabel = v.size || (v.name.includes('20oz') ? '20oz' : v.name.includes('32oz') ? '32oz' : 'Standard');
      if (!fountainSizesSeen.has(sizeLabel)) {
        fountainSizesSeen.add(sizeLabel);
        uniqueFountainSizes.push({
          id: v.id,
          name: v.size || v.name,
          label: sizeLabel,
          description: `Fountain drink ${sizeLabel}`,
          platformPrice: v.platformPrice || v.basePrice,
          basePrice: v.basePrice
        });
      }
    });

    // Get fountain flavors from Firebase drinks collection if available
    let fountainFlavors = [];
    if (menuData.drinks?.flavors?.fountain) {
      // Use flavors from Firebase if available
      fountainFlavors = menuData.drinks.flavors.fountain.map(flavor => ({
        id: flavor.id || flavor.name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
        name: flavor.name
      }));
    } else {
      // Fallback: Extract flavors from variant names or use default set
      const defaultFountainFlavors = [
        { id: 'coca_cola', name: 'Coca-Cola' },
        { id: 'diet_coke', name: 'Diet Coke' },
        { id: 'coke_zero', name: 'Coke Zero' },
        { id: 'sprite', name: 'Sprite' },
        { id: 'fanta_orange', name: 'Fanta Orange' },
        { id: 'dr_pepper', name: 'Dr Pepper' },
        { id: 'barqs_root_beer', name: 'Barq\'s Root Beer' },
        { id: 'hic_fruit_punch', name: 'Hi-C Fruit Punch' }
      ];
      fountainFlavors = defaultFountainFlavors;
    }

    groups.push({
      id: 'fountain-drinks',
      name: 'Fountain Drinks',
      description: `${fountainFlavors.length} Flavors: ${fountainFlavors.map(f => f.name).join(', ')}`,
      imageUrl: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Ffountain-drinks_200x200.webp?alt=media',
      badge: 'CHOOSE SIZE',
      featured: true,
      sizes: uniqueFountainSizes,
      flavors: fountainFlavors,
      type: 'fountain'
    });
  }

  // Group tea drinks - extract flavors from Firebase data
  const teaVariants = variants.filter(v => v.id.includes('tea'));
  if (teaVariants.length > 0) {
    // Extract unique sizes from tea variants (20oz, 32oz)
    const uniqueTeaSizes = [];
    const teaSizesSeen = new Set();

    teaVariants.forEach(v => {
      const sizeLabel = v.size || (v.name.includes('20oz') ? '20oz' : v.name.includes('32oz') ? '32oz' : 'Standard');
      if (!teaSizesSeen.has(sizeLabel)) {
        teaSizesSeen.add(sizeLabel);
        // Use the first variant of this size for pricing (sweet tea)
        const sampleVariant = teaVariants.find(tv => (tv.size || tv.name).includes(sizeLabel));
        uniqueTeaSizes.push({
          id: sampleVariant.id,
          name: sampleVariant.name,
          label: sizeLabel,
          description: `Fresh brewed tea ${sizeLabel}`,
          platformPrice: sampleVariant.platformPrice || sampleVariant.basePrice,
          basePrice: sampleVariant.basePrice
        });
      }
    });

    // Extract tea flavors from Firebase data by analyzing variant names
    const teaFlavors = [];
    const teaFlavorsSeen = new Set();

    teaVariants.forEach(v => {
      let flavorName = '';
      let flavorId = '';

      if (v.id.includes('sweet_tea') || v.name.toLowerCase().includes('sweet tea')) {
        flavorName = 'Sweet Tea';
        flavorId = 'sweet';
      } else if (v.id.includes('unsweetened_tea') || v.name.toLowerCase().includes('unsweetened tea')) {
        flavorName = 'Unsweetened Tea';
        flavorId = 'unsweetened';
      }

      if (flavorName && !teaFlavorsSeen.has(flavorId)) {
        teaFlavorsSeen.add(flavorId);
        teaFlavors.push({ id: flavorId, name: flavorName });
      }
    });

    // Get tea flavors from Firebase drinks collection if available
    if (menuData.drinks?.flavors?.tea && menuData.drinks.flavors.tea.length > 0) {
      // Use flavors from Firebase if available
      const firebaseTeaFlavors = menuData.drinks.flavors.tea.map(flavor => ({
        id: flavor.id || flavor.name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
        name: flavor.name
      }));
      teaFlavors.length = 0; // Clear extracted flavors
      teaFlavors.push(...firebaseTeaFlavors);
    }

    groups.push({
      id: 'iced-tea',
      name: 'Fresh Brewed Tea',
      description: `Freshly brewed daily • ${teaFlavors.map(f => f.name.replace(' Tea', '')).join(' or ').toLowerCase()} • Perfect refreshment`,
      imageUrl: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Ficed-tea_200x200.webp?alt=media',
      badge: 'FRESH DAILY',
      sizes: uniqueTeaSizes,
      flavors: teaFlavors,
      type: 'tea'
    });
  }

  // Group bottled water
  const waterVariants = variants.filter(v => v.id.includes('water'));
  if (waterVariants.length > 0) {
    waterVariants.forEach(variant => {
      groups.push({
        id: variant.id,
        name: variant.name,
        description: 'Pure refreshment • 16.9 fl oz bottle',
        imageUrl: variant.image || 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Fwater-bottle_200x200.webp?alt=media',
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
