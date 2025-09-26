/**
 * Sides Modal Module
 * Handles sides ordering functionality including:
 * - Fries selection (regular, large, loaded)
 * - Mozzarella sticks selection
 * - Quantity management
 * - Extra dips selection
 */

function generateSidesModalJS(menuData = {}) {
  return `
    // Sides Modal State Variables
    let currentSideModalStep = 1;
    let selectedSideVariant = null;
    let selectedSideDips = {};
    let selectedSideQuantities = {};
    let currentSideType = '';
    let sideModalData = [];

    window.openSideModal = function(sideType) {
      console.log('Opening side modal for:', sideType);

      // IMPORTANT: Reset ALL state when opening modal
      currentSideType = sideType;
      currentSideModalStep = 1;
      selectedSideVariant = null;
      selectedSideDips = {};
      selectedSideQuantities = {};
      sideModalData = [];

      // Create side data based on type using actual Firestore data with proper platform pricing
      const platformMultiplier = 1.35; // DoorDash 35% markup

      if (sideType === 'fries') {
        // Use actual fries data from Firestore
        const friesData = strategicMenu.fries?.variants || [];
        sideModalData = friesData.map(fries => ({
          id: fries.id,
          name: fries.name,
          size: fries.size || fries.name,
          basePrice: fries.basePrice || fries.price,
          platformPrice: parseFloat(((fries.basePrice || fries.price) * platformMultiplier).toFixed(2)),
          description: fries.description
        }));

        console.log('Fries data from Firebase:', sideModalData);
        document.getElementById('sideModalTitle').textContent = 'Choose Fries Size';
      } else if (sideType === 'loaded-fries') {
        // Use actual loaded fries data from Firestore
        const loadedFriesData = strategicMenu.fries?.variants?.filter(f => f.name.includes('Loaded')) || [];
        sideModalData = loadedFriesData.map(fries => ({
          id: fries.id,
          name: fries.name,
          size: fries.size || 'Large',
          basePrice: fries.basePrice || fries.price,
          platformPrice: parseFloat(((fries.basePrice || fries.price) * platformMultiplier).toFixed(2)),
          description: fries.description || 'Topped with cheese sauce and bacon'
        }));

        console.log('Loaded fries data from Firebase:', sideModalData);
        document.getElementById('sideModalTitle').textContent = 'Loaded Fries';
      } else if (sideType === 'mozzarella-sticks') {
        // Use actual mozzarella data from Firestore
        const mozzData = strategicMenu.mozzarella?.variants || [];
        sideModalData = mozzData.map(mozz => ({
          id: mozz.id,
          name: mozz.name,
          count: mozz.count,
          basePrice: mozz.basePrice || mozz.price,
          platformPrice: parseFloat(((mozz.basePrice || mozz.price) * platformMultiplier).toFixed(2)),
          description: mozz.description
        }));

        console.log('Mozzarella data from Firebase:', sideModalData);
        document.getElementById('sideModalTitle').textContent = 'Choose Your Mozzarella Sticks';
      }

      // Show modal
      const modal = document.getElementById('sidesModal');
      if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        // Reset modal to step 1
        updateSideModalDisplay();
        populateSideOptions();
      }
    };

    window.closeSidesModal = function() {
      const modal = document.getElementById('sidesModal');
      if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
      }
    };

    function populateSideOptions() {
      const container = document.getElementById('sideOptions');
      if (!container) return;

      container.innerHTML = sideModalData.map(side => {
        const quantity = selectedSideQuantities[side.id] || 0;
        return '<div class="side-option-card' + (quantity > 0 ? ' selected' : '') + '">' +
          '<div>' +
            '<div class="side-option-name">' + side.name + '</div>' +
            (side.description ? '<div class="side-option-description">' + side.description + '</div>' : '') +
          '</div>' +
          '<div class="side-option-price">$' + side.platformPrice.toFixed(2) + '</div>' +
          '<div class="quantity-controls">' +
            '<button class="quantity-btn" onclick="updateSideQuantity(\\'' + side.id + '\\', -1)" ' + (quantity === 0 ? 'disabled' : '') + '>−</button>' +
            '<span class="quantity-display" id="qty_' + side.id + '">' + quantity + '</span>' +
            '<button class="quantity-btn" onclick="updateSideQuantity(\\'' + side.id + '\\', 1)">+</button>' +
          '</div>' +
        '</div>';
      }).join('');

      updateSideModalButtons();
    }

    window.updateSideQuantity = function(sideId, change) {
      const currentQuantity = selectedSideQuantities[sideId] || 0;
      const newQuantity = Math.max(0, currentQuantity + change);

      if (newQuantity === 0) {
        delete selectedSideQuantities[sideId];
      } else {
        selectedSideQuantities[sideId] = newQuantity;
      }

      // Refresh the entire side options to update styling and disabled states
      populateSideOptions();
    };

    // Additional sides modal functions would go here...
  `;
}

module.exports = {
  generateSidesModalJS
};