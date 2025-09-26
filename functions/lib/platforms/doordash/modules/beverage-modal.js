/**
 * Beverage Modal Module
 * Handles beverage ordering functionality including:
 * - Size selection
 * - Flavor selection
 * - Quantity management
 */

function generateBeverageModalJS(menuData = {}) {
  return `
    // Beverage Modal State Variables
    let currentBeverageData = null;
    let selectedBeverageSize = null;
    let selectedBeverageFlavor = null;
    let beverageModalStep = 1;

    window.openBeverageModal = function(beverageData) {
      console.log('Opening beverage modal with data:', beverageData);

      currentBeverageData = beverageData;
      selectedBeverageSize = null;
      selectedBeverageFlavor = null;
      beverageModalStep = 1;

      const modal = document.getElementById('beverageModal');
      if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        // Set title
        document.getElementById('beverageModalTitle').textContent = beverageData.name;

        // Show first step (size selection)
        populateBeverageSizes();
        updateBeverageModalDisplay();
      }
    };

    window.closeBeverageModal = function() {
      const modal = document.getElementById('beverageModal');
      if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
      }
    };

    function populateBeverageSizes() {
      const container = document.getElementById('beverageSizes');
      if (!container || !currentBeverageData) return;

      const sizes = currentBeverageData.sizes || [];
      container.innerHTML = sizes.map(size =>
        '<div class="beverage-size-card' + (selectedBeverageSize && selectedBeverageSize.id === size.id ? ' selected' : '') + '" onclick="selectBeverageSize(\\'' + size.id + '\\');">' +
          '<div class="beverage-size-info">' +
            '<h4>' + size.name + '</h4>' +
            '<p>' + size.description + '</p>' +
            '<div class="beverage-size-price">$' + size.platformPrice + '</div>' +
          '</div>' +
        '</div>'
      ).join('');
    }

    window.selectBeverageSize = function(sizeId) {
      selectedBeverageSize = currentBeverageData.sizes.find(size => size.id === sizeId);
      populateBeverageSizes(); // Re-render to show selection

      // Auto-advance if this beverage type has flavors
      if (currentBeverageData.flavors && currentBeverageData.flavors.length > 0) {
        beverageModalStep = 2;
        setTimeout(() => {
          populateBeverageFlavors();
          updateBeverageModalDisplay();
        }, 200);
      } else {
        // No flavors, go straight to summary
        beverageModalStep = 3;
        setTimeout(() => {
          populateBeverageOrderSummary();
          updateBeverageModalDisplay();
        }, 200);
      }
    };

    function populateBeverageFlavors() {
      const container = document.getElementById('beverageFlavors');
      if (!container || !currentBeverageData) return;

      const flavors = currentBeverageData.flavors || [];
      container.innerHTML = flavors.map(flavor =>
        '<div class="beverage-flavor-card' + (selectedBeverageFlavor && selectedBeverageFlavor.id === flavor.id ? ' selected' : '') + '" onclick="selectBeverageFlavor(\\'' + flavor.id + '\\');">' +
          '<div class="beverage-flavor-info">' +
            '<h4>' + flavor.name + '</h4>' +
            (flavor.description ? '<p>' + flavor.description + '</p>' : '') +
          '</div>' +
        '</div>'
      ).join('');
    }

    window.selectBeverageFlavor = function(flavorId) {
      selectedBeverageFlavor = currentBeverageData.flavors.find(flavor => flavor.id === flavorId);
      populateBeverageFlavors(); // Re-render to show selection

      // Auto-advance to summary
      beverageModalStep = 3;
      setTimeout(() => {
        populateBeverageOrderSummary();
        updateBeverageModalDisplay();
      }, 200);
    };

    function populateBeverageOrderSummary() {
      const container = document.getElementById('beverageOrderSummary');
      if (!container) return;

      const price = selectedBeverageSize ? selectedBeverageSize.platformPrice : 0;

      container.innerHTML =
        '<div style="text-align: center;">' +
          '<h3>' + currentBeverageData.name + '</h3>' +
          (selectedBeverageSize ? '<p>Size: ' + selectedBeverageSize.name + '</p>' : '') +
          (selectedBeverageFlavor ? '<p>Flavor: ' + selectedBeverageFlavor.name + '</p>' : '') +
          '<div style="font-size: 24px; font-weight: bold; color: #ff6b35; margin-top: 16px;">$' + price.toFixed(2) + '</div>' +
        '</div>';
    }

    function updateBeverageModalDisplay() {
      // Show correct step content
      for (let i = 1; i <= 3; i++) {
        const step = document.getElementById('beverageModalStep' + i);
        if (step) {
          step.classList.remove('active');
          if (i === beverageModalStep) {
            step.classList.add('active');
          }
        }
      }

      // Update navigation buttons
      const prevBtn = document.getElementById('beveragePrevBtn');
      const nextBtn = document.getElementById('beverageNextBtn');
      const addBtn = document.getElementById('addBeverageToCartBtn');

      if (prevBtn) prevBtn.style.display = beverageModalStep > 1 ? 'block' : 'none';
      if (nextBtn) nextBtn.style.display = beverageModalStep < 3 ? 'block' : 'none';
      if (addBtn) addBtn.style.display = beverageModalStep === 3 ? 'block' : 'none';
    }

    window.addBeverageToCart = function() {
      console.log('Adding beverage to cart:', {
        beverage: currentBeverageData.name,
        size: selectedBeverageSize,
        flavor: selectedBeverageFlavor
      });

      // Close modal
      closeBeverageModal();

      // TODO: Implement actual cart functionality
      alert('Added to cart: ' + currentBeverageData.name +
            (selectedBeverageSize ? ' (' + selectedBeverageSize.name + ')' : '') +
            (selectedBeverageFlavor ? ' - ' + selectedBeverageFlavor.name : ''));
    };
  `;
}

module.exports = {
  generateBeverageModalJS
};