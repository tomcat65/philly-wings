/**
 * DoorDash JavaScript Generation
 * Handles all interactive functionality for DoorDash platform
 */

/**
 * Generate complete DoorDash JavaScript
 * @param {Object} menuData Complete menu data from Firestore including sauces
 * @returns {string} Complete JavaScript code
 */
function generateDoorDashJS(menuData = {}) {
  return `
    ${generateGlobalVariables(menuData)}
    ${generateMobileMenuFunctions()}
    ${generateSidesModalFunctions()}
    ${generateModalFunctions(menuData)}
    ${generateNavigationFunctions()}
    ${generateUtilityFunctions()}
    ${generateInitialization()}
  `;
}

/**
 * Generate global variables and state
 * @param {Object} menuData Complete menu data from Firestore
 */
function generateGlobalVariables(menuData = {}) {
  // Convert Firestore sauce data to JavaScript-safe format
  const saucesData = (menuData.sauces || []).map(sauce => ({
    id: sauce.id,
    name: sauce.name || 'Unknown Sauce',
    category: sauce.category || 'signature-sauce',
    heatLevel: sauce.heatLevel || 1,
    description: sauce.description || 'Delicious sauce',
    isDryRub: sauce.isDryRub || false,
    image: sauce.image || sauce.imageUrl || ''
  }));

  return `
    // Global Variables and State
    let currentWingType = '';
    let selectedWingVariant = null;
    let selectedSauces = [];
    let selectedWingStyle = 'regular';
    let selectedIncludedDips = {};
    let selectedExtraDips = {};
    let saucePreferences = {};
    let modalWingsData = [];
    let currentModalStep = 1;

    // Real Firestore sauce data (integrated from server-side)
    let firestoreSauces = ${JSON.stringify(saucesData)};

    // Strategic menu data (populated with real Firestore data)
    let strategicMenu = {
      wings: ${JSON.stringify(menuData.wings || {})},
      sauces: firestoreSauces,
      dips: [],
      sides: [],
      beverages: []
    };

    // Wing allocation tracking for 12+ wing orders
    let wingAllocation = {}; // { sauceId: wingCount }

    console.log('DoorDash menu system initialized with', firestoreSauces.length, 'Firestore sauces');
  `;
}

/**
 * Generate mobile menu functions
 */
function generateMobileMenuFunctions() {
  return `
    // Mobile Menu Functions
    function toggleMobileMenu() {
      const navItems = document.getElementById('navItems');
      const toggle = document.querySelector('.mobile-menu-toggle');

      navItems.classList.toggle('active');
      toggle.classList.toggle('active');
    }

    function closeMobileMenu() {
      const navItems = document.getElementById('navItems');
      const toggle = document.querySelector('.mobile-menu-toggle');

      navItems.classList.remove('active');
      toggle.classList.remove('active');
    }

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
      const navItems = document.getElementById('navItems');
      const toggle = document.querySelector('.mobile-menu-toggle');
      const navigation = document.querySelector('.menu-navigation');

      if (!navigation.contains(event.target) && navItems.classList.contains('active')) {
        closeMobileMenu();
      }
    });
  `;
}

/**
 * Generate sides modal functions
 */
function generateSidesModalFunctions() {
  return `
    // Sides Modal Functions - State variables
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

      // Create side data based on type
      if (sideType === 'fries') {
        sideModalData = [
          { id: 'fries_regular', name: 'Regular Fries', size: 'Regular', platformPrice: 4.99 },
          { id: 'fries_large', name: 'Large Fries', size: 'Large', platformPrice: 6.99 }
        ];
        document.getElementById('sideModalTitle').textContent = 'Choose Fries Size';
      } else if (sideType === 'loaded-fries') {
        sideModalData = [
          { id: 'loaded_fries_large', name: 'Loaded Fries', size: 'Large', platformPrice: 8.99, description: 'Topped with cheese sauce and bacon' }
        ];
        document.getElementById('sideModalTitle').textContent = 'Loaded Fries';
      } else if (sideType === 'mozzarella-sticks') {
        sideModalData = [
          { id: 'mozz_4', name: '4 Mozzarella Sticks', count: 4, platformPrice: 6.99, description: 'Includes 1 marinara sauce' },
          { id: 'mozz_8', name: '8 Mozzarella Sticks', count: 8, platformPrice: 12.99, description: 'Includes 1 marinara sauce' },
          { id: 'mozz_12', name: '12 Mozzarella Sticks', count: 12, platformPrice: 18.99, description: 'Includes 2 marinara sauces' },
          { id: 'mozz_16', name: '16 Mozzarella Sticks', count: 16, platformPrice: 24.99, description: 'Includes 2 marinara sauces' }
        ];
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

    window.navigateSideModalStep = function(direction) {
      if (direction === 1) {
        if (currentSideModalStep === 1) {
          const totalQuantity = Object.values(selectedSideQuantities).reduce((sum, qty) => sum + qty, 0);
          if (totalQuantity === 0) {
            alert('Please select at least one item');
            return;
          }
        }
      }

      currentSideModalStep += direction;
      if (currentSideModalStep < 1) currentSideModalStep = 1;
      if (currentSideModalStep > 3) currentSideModalStep = 3;

      updateSideModalDisplay();

      // Initialize step content
      if (currentSideModalStep === 2) {
        populateSideExtraDips();
      } else if (currentSideModalStep === 3) {
        populateSideOrderSummary();
      }
    };

    function updateSideModalDisplay() {
      // Update progress indicators
      document.querySelectorAll('#sidesModal .progress-step').forEach((step, index) => {
        step.classList.remove('active', 'completed');
        if (index < currentSideModalStep - 1) {
          step.classList.add('completed');
        } else if (index === currentSideModalStep - 1) {
          step.classList.add('active');
        }
      });

      // Show current step
      document.querySelectorAll('#sidesModal .modal-step').forEach((step, index) => {
        step.classList.remove('active');
        if (index === currentSideModalStep - 1) {
          step.classList.add('active');
        }
      });

      updateSideModalButtons();
    }

    function updateSideModalButtons() {
      const backBtn = document.getElementById('sideModalBackBtn');
      const nextBtn = document.getElementById('sideModalNextBtn');
      const addBtn = document.getElementById('sideModalAddToCartBtn');

      if (backBtn) backBtn.style.display = currentSideModalStep > 1 ? 'block' : 'none';

      if (currentSideModalStep === 3) {
        if (nextBtn) nextBtn.style.display = 'none';
        if (addBtn) addBtn.style.display = 'block';
      } else {
        if (nextBtn) nextBtn.style.display = 'block';
        if (addBtn) addBtn.style.display = 'none';
      }

      // Update validation logic for new quantity-based system
      if (currentSideModalStep === 1) {
        const totalQuantity = Object.values(selectedSideQuantities).reduce((sum, qty) => sum + qty, 0);
        if (nextBtn) nextBtn.disabled = totalQuantity === 0;
      } else {
        if (nextBtn) nextBtn.disabled = false;
      }
    }

    function populateSideOptions() {
      const container = document.getElementById('sideOptions');
      if (!container) return;

      container.innerHTML = sideModalData.map(side =>
        '<div class="side-option-card">' +
          '<div class="side-option-name">' + side.name + '</div>' +
          (side.description ? '<div class="side-option-description">' + side.description + '</div>' : '') +
          '<div class="side-option-price">$' + side.platformPrice + '</div>' +
          '<div class="quantity-controls">' +
            '<button class="quantity-btn" onclick="updateSideQuantity(\\'' + side.id + '\\', -1)">-</button>' +
            '<span class="quantity-display" id="qty_' + side.id + '">0</span>' +
            '<button class="quantity-btn" onclick="updateSideQuantity(\\'' + side.id + '\\', 1)">+</button>' +
          '</div>' +
        '</div>'
      ).join('');

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

      const qtyDisplay = document.getElementById('qty_' + sideId);
      if (qtyDisplay) {
        qtyDisplay.textContent = newQuantity;
      }

      updateSideModalButtons();
    };

    function populateSideExtraDips() {
      console.log('Loading side extra dips...');
      // TODO: Implement extra dips selection
    }

    function populateSideOrderSummary() {
      console.log('Loading side order summary...');
      // TODO: Implement order summary display
    }

    window.addSideOrderToCart = function() {
      console.log('Adding side order to cart:', {
        sideType: currentSideType,
        quantities: selectedSideQuantities,
        dips: selectedSideDips
      });

      closeSidesModal();
      alert('Side added to cart! (This is a demo)');
    };

    // Beverage Modal System
    let currentBeverageModalStep = 1;
    let selectedBeverageData = null;
    let selectedBeverageSize = null;
    let selectedBeverageFlavor = null;

    window.openBeverageModal = function(beverageData) {
      console.log('Opening beverage modal for:', beverageData);

      selectedBeverageData = beverageData;

      // For beverages without size/flavor options, add directly to cart
      if (!beverageData.details || beverageData.details.length === 0) {
        alert('Adding ' + beverageData.name + ' to cart! (This is a demo - $' + beverageData.platformPrice.toFixed(2) + ')');
        return;
      }

      // Reset modal state
      currentBeverageModalStep = 1;
      selectedBeverageSize = null;
      selectedBeverageFlavor = null;

      // Set modal title
      document.getElementById('beverageModalTitle').textContent = beverageData.name;

      // Show modal
      const modal = document.getElementById('beverageModal');
      if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        updateBeverageModalDisplay();
        loadBeverageStepContent();
      }
    };

    window.closeBeverageModal = function() {
      const modal = document.getElementById('beverageModal');
      if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
      }

      // Reset selections
      selectedBeverageData = null;
      selectedBeverageSize = null;
      selectedBeverageFlavor = null;
      currentBeverageModalStep = 1;
    };

    window.navigateBeverageModalStep = function(direction) {
      // Validation for moving forward
      if (direction === 1) {
        if (currentBeverageModalStep === 1 && !selectedBeverageSize) {
          alert('Please select a size first');
          return;
        }
        if (currentBeverageModalStep === 2 && !selectedBeverageFlavor) {
          alert('Please select a flavor first');
          return;
        }
      }

      // Update step
      currentBeverageModalStep += direction;

      // Bounds checking
      if (currentBeverageModalStep < 1) currentBeverageModalStep = 1;
      if (currentBeverageModalStep > 3) currentBeverageModalStep = 3;

      updateBeverageModalDisplay();
      loadBeverageStepContent();
    };

    function updateBeverageModalDisplay() {
      // Update progress indicators
      document.querySelectorAll('#beverageModal .progress-step').forEach((step, index) => {
        step.classList.remove('active', 'completed');
        if (index < currentBeverageModalStep - 1) {
          step.classList.add('completed');
        } else if (index === currentBeverageModalStep - 1) {
          step.classList.add('active');
        }
      });

      // Show current step
      document.querySelectorAll('#beverageModal .modal-step').forEach((step, index) => {
        step.classList.remove('active');
        if (index === currentBeverageModalStep - 1) {
          step.classList.add('active');
        }
      });

      // Update buttons
      const backBtn = document.getElementById('beverageModalBackBtn');
      const nextBtn = document.getElementById('beverageModalNextBtn');
      const addToCartBtn = document.getElementById('beverageModalAddToCartBtn');

      if (backBtn && nextBtn && addToCartBtn) {
        backBtn.style.display = currentBeverageModalStep > 1 ? 'inline-block' : 'none';
        nextBtn.style.display = currentBeverageModalStep < 3 ? 'inline-block' : 'none';
        addToCartBtn.style.display = currentBeverageModalStep === 3 ? 'inline-block' : 'none';

        // Enable/disable next button based on selections
        if (currentBeverageModalStep === 1) {
          nextBtn.disabled = !selectedBeverageSize;
        } else if (currentBeverageModalStep === 2) {
          nextBtn.disabled = !selectedBeverageFlavor;
        }
      }
    }

    function loadBeverageStepContent() {
      if (currentBeverageModalStep === 1) {
        populateBeverageSizeOptions();
      } else if (currentBeverageModalStep === 2) {
        populateBeverageFlavorOptions();
      } else if (currentBeverageModalStep === 3) {
        populateBeverageOrderSummary();
      }
    }

    function populateBeverageSizeOptions() {
      if (!selectedBeverageData) return;

      const container = document.getElementById('beverageSizeOptions');
      if (!container) return;

      // Get size options from beverage data
      const sizeOptions = [];
      if (selectedBeverageData.type === 'fountain') {
        sizeOptions.push(
          { id: '20oz', name: '20oz', description: 'Regular fountain drink', price: selectedBeverageData.platformPrice },
          { id: '32oz', name: '32oz', description: 'Large fountain drink', price: selectedBeverageData.platformPrice + 1.00 }
        );
      } else {
        // For other beverages, use the details or create standard size
        sizeOptions.push({
          id: 'standard',
          name: 'Standard Size',
          description: selectedBeverageData.description || '',
          price: selectedBeverageData.platformPrice
        });
      }

      container.innerHTML = sizeOptions.map(size => {
        const isSelected = selectedBeverageSize && selectedBeverageSize.id === size.id;
        return '<div class="beverage-size-option ' + (isSelected ? 'selected' : '') + '"' +
               ' onclick="selectBeverageSize(' + JSON.stringify(size).replace(/"/g, '&quot;') + ')">' +
                 '<div class="size-content">' +
                   '<div class="size-name">' + size.name + '</div>' +
                   '<div class="size-description">' + size.description + '</div>' +
                   '<div class="size-price">$' + size.price.toFixed(2) + '</div>' +
                 '</div>' +
                 '<div class="size-selector">' +
                   (isSelected ? '✓' : '') +
                 '</div>' +
               '</div>';
      }).join('');
    }

    window.selectBeverageSize = function(sizeData) {
      selectedBeverageSize = sizeData;
      populateBeverageSizeOptions(); // Refresh to show selection
      updateBeverageModalDisplay();
    };

    function populateBeverageFlavorOptions() {
      if (!selectedBeverageData) return;

      const container = document.getElementById('beverageFlavorOptions');
      if (!container) return;

      let flavorOptions = [];
      if (selectedBeverageData.type === 'fountain') {
        flavorOptions = [
          { id: 'coke', name: 'Coca-Cola', description: 'Classic Coca-Cola' },
          { id: 'sprite', name: 'Sprite', description: 'Lemon-lime soda' },
          { id: 'orange', name: 'Orange Fanta', description: 'Orange flavored soda' },
          { id: 'rootbeer', name: 'Root Beer', description: 'Classic root beer' },
          { id: 'dietcoke', name: 'Diet Coke', description: 'Diet Coca-Cola' },
          { id: 'lemonade', name: 'Lemonade', description: 'Fresh lemonade' }
        ];
      } else if (selectedBeverageData.details && selectedBeverageData.details.length > 0) {
        flavorOptions = selectedBeverageData.details.map(detail => ({
          id: detail.name.toLowerCase().replace(/\s+/g, '-'),
          name: detail.name,
          description: detail.name,
          price: detail.price
        }));
      } else {
        // Single flavor option
        flavorOptions = [{
          id: 'standard',
          name: selectedBeverageData.name,
          description: selectedBeverageData.description || selectedBeverageData.name
        }];
      }

      container.innerHTML = flavorOptions.map(flavor => {
        const isSelected = selectedBeverageFlavor && selectedBeverageFlavor.id === flavor.id;
        return '<div class="beverage-flavor-option ' + (isSelected ? 'selected' : '') + '"' +
               ' onclick="selectBeverageFlavor(' + JSON.stringify(flavor).replace(/"/g, '&quot;') + ')">' +
                 '<div class="flavor-content">' +
                   '<div class="flavor-name">' + flavor.name + '</div>' +
                   '<div class="flavor-description">' + flavor.description + '</div>' +
                 '</div>' +
                 '<div class="flavor-selector">' +
                   (isSelected ? '✓' : '') +
                 '</div>' +
               '</div>';
      }).join('');
    }

    window.selectBeverageFlavor = function(flavorData) {
      selectedBeverageFlavor = flavorData;
      populateBeverageFlavorOptions(); // Refresh to show selection
      updateBeverageModalDisplay();
    };

    function populateBeverageOrderSummary() {
      const container = document.getElementById('beverageOrderSummary');
      if (!container || !selectedBeverageData || !selectedBeverageSize || !selectedBeverageFlavor) return;

      const finalPrice = selectedBeverageFlavor.price || selectedBeverageSize.price;

      container.innerHTML =
        '<div class="beverage-order-summary">' +
          '<div class="summary-header">' +
            '<h4>Your Beverage Order</h4>' +
          '</div>' +
          '<div class="summary-details">' +
            '<div class="summary-item">' +
              '<span class="item-label">Beverage:</span>' +
              '<span class="item-value">' + selectedBeverageFlavor.name + '</span>' +
            '</div>' +
            '<div class="summary-item">' +
              '<span class="item-label">Size:</span>' +
              '<span class="item-value">' + selectedBeverageSize.name + '</span>' +
            '</div>' +
            '<div class="summary-divider"></div>' +
            '<div class="summary-item total">' +
              '<span class="item-label">Total:</span>' +
              '<span class="item-value">$' + finalPrice.toFixed(2) + '</span>' +
            '</div>' +
          '</div>' +
        '</div>';
    }

    window.addBeverageOrderToCart = function() {
      if (!selectedBeverageData || !selectedBeverageSize || !selectedBeverageFlavor) {
        alert('Please complete your beverage selection');
        return;
      }

      const finalPrice = selectedBeverageFlavor.price || selectedBeverageSize.price;
      const orderSummary = selectedBeverageFlavor.name + ' (' + selectedBeverageSize.name + ') - $' + finalPrice.toFixed(2);

      alert('Adding to cart: ' + orderSummary + '\\n\\nThis is a demo. In production, this would be added to the actual cart.');
      closeBeverageModal();
    };

    // Sauce Modal Functions
    window.openSauceModal = function(sauceId, sauceData) {
      console.log('Opening sauce modal for:', sauceId, sauceData);

      // Show sauce information and add to cart
      const heatLevel = sauceData.heatLevel || 1;
      const heatText = heatLevel <= 1 ? 'MILD' : heatLevel <= 2 ? 'MEDIUM' : heatLevel <= 3 ? 'HOT' : heatLevel <= 4 ? 'EXTRA HOT' : 'BLAZING';
      const heatEmoji = '🌶️'.repeat(Math.min(heatLevel, 5));

      alert('🌶️ ' + sauceData.name + ' (' + heatText + ' ' + heatEmoji + ')\\n\\n' +
            (sauceData.description || 'Premium sauce') + '\\n\\n' +
            'Added to favorites! (This is a demo)');
    };

    window.closeSauceModal = function() {
      console.log('Closing sauce modal');
    };
  `;
}

/**
 * Generate modal-related functions
 * @param {Object} menuData Complete menu data from Firestore
 */
function generateModalFunctions(menuData = {}) {
  return `
    // Modal Functions
    window.openWingModal = function(wingType, wingsData) {
      currentWingType = wingType;

      // Generate wing data if not provided
      if (!wingsData) {
        modalWingsData = generateWingVariants(wingType);
      } else {
        modalWingsData = wingsData;
      }

      // Get or create modal
      let modal = document.getElementById('wingModal');
      if (!modal) {
        console.error('Wing modal not found in DOM');
        return;
      }

      // Reset selections
      selectedWingVariant = null;
      selectedSauces = [];
      selectedWingStyle = 'regular';
      selectedIncludedDips = {};
      selectedExtraDips = {};
      saucePreferences = {};

      // Show modal
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';

      // Reset to step 1
      currentModalStep = 1;
      updateModalDisplay();
      populateWingVariants();
    };

    window.closeWingModal = function() {
      const modal = document.getElementById('wingModal');
      if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
      }
    };

    window.navigateModalStep = function(direction) {
      // Validation logic for moving forward
      if (direction === 1) {
        if (currentModalStep === 1 && !selectedWingVariant) {
          alert('Please select a wing size first');
          return;
        }
        if (currentModalStep === 2 && selectedSauces.length === 0) {
          alert('Please select at least one sauce');
          return;
        }
      }

      // Update step with smart navigation for "No Dip" selection
      currentModalStep += direction;

      // Skip extra dips step if "No Dip" is selected
      const noDipSelected = selectedIncludedDips['no-dip'] > 0;

      if (direction === 1 && noDipSelected) {
        if (currentWingType === 'boneless' && currentModalStep === 4) {
          // Boneless: step 3 (included dips) → skip step 4 (extra dips) → step 5 (summary)
          currentModalStep = 5;
        } else if (currentWingType === 'bone-in' && currentModalStep === 5) {
          // Bone-in: step 4 (wing style) → skip step 5 (extra dips) → step 6 (summary)
          currentModalStep = 6;
        }
      } else if (direction === -1 && noDipSelected) {
        if (currentWingType === 'boneless' && currentModalStep === 5) {
          // Boneless: step 5 (summary) → skip step 4 (extra dips) → step 3 (included dips)
          currentModalStep = 3;
        } else if (currentWingType === 'bone-in' && currentModalStep === 6) {
          // Bone-in: step 6 (summary) → skip step 5 (extra dips) → step 4 (wing style)
          currentModalStep = 4;
        }
      }

      // Bounds checking
      if (currentModalStep < 1) currentModalStep = 1;
      const maxSteps = currentWingType === 'bone-in' ? 6 : 5;
      if (currentModalStep > maxSteps) currentModalStep = maxSteps;

      updateModalDisplay();
      loadStepContent();
    };

    function updateModalDisplay() {
      // Update progress indicators
      document.querySelectorAll('.progress-step').forEach((step, index) => {
        step.classList.remove('active', 'completed');
        if (index < currentModalStep - 1) {
          step.classList.add('completed');
        } else if (index === currentModalStep - 1) {
          step.classList.add('active');
        }
      });

      // Show current step
      document.querySelectorAll('.modal-step').forEach((step, index) => {
        step.classList.remove('active');
        if (index === currentModalStep - 1) {
          step.classList.add('active');
        }
      });

      updateModalButtons();
    }

    function updateModalButtons() {
      const backBtn = document.getElementById('modalBackBtn');
      const nextBtn = document.getElementById('modalNextBtn');
      const addToCartBtn = document.getElementById('modalAddToCartBtn');

      if (backBtn) backBtn.style.display = currentModalStep > 1 ? 'block' : 'none';

      const maxSteps = currentWingType === 'bone-in' ? 6 : 5;
      if (nextBtn) {
        nextBtn.style.display = currentModalStep < maxSteps ? 'block' : 'none';

        // Enhanced validation logic for each step
        if (currentModalStep === 1) {
          nextBtn.disabled = !selectedWingVariant;
        } else if (currentModalStep === 2) {
          // Step 2: Sauce selection with wing allocation validation
          const isValid = validateSauceAllocation();
          nextBtn.disabled = !isValid;

          // Update visual feedback for wing allocation
          updateWingAllocationFeedback();
        } else {
          nextBtn.disabled = false;
        }
      }

      if (addToCartBtn) addToCartBtn.style.display = currentModalStep === maxSteps ? 'block' : 'none';
    }

    // Step 4: Enhanced validation for wing allocation
    function validateSauceAllocation() {
      // Must have at least one sauce selected
      if (selectedSauces.length === 0) return false;

      // For single sauce or orders < 12 wings, no allocation needed
      if (selectedSauces.length === 1 || !selectedWingVariant || selectedWingVariant.count < 12) {
        return true;
      }

      // For multiple sauces with 12+ wings, validate allocation
      const totalWings = selectedWingVariant.count;
      const allocatedWings = selectedSauces.reduce((sum, sauceId) => {
        return sum + (wingAllocation[sauceId] || Math.floor(totalWings / selectedSauces.length));
      }, 0);

      // Allow allocation as long as we don't exceed total wings
      // (remaining wings can be auto-distributed)
      return allocatedWings <= totalWings;
    }

    // Step 4: Visual feedback for wing allocation status
    function updateWingAllocationFeedback() {
      const feedbackContainer = document.getElementById('modalContent');
      if (!feedbackContainer || !selectedWingVariant || selectedWingVariant.count < 12 || selectedSauces.length <= 1) {
        return;
      }

      // Remove existing feedback
      const existingFeedback = feedbackContainer.querySelector('.wing-allocation-feedback');
      if (existingFeedback) existingFeedback.remove();

      const totalWings = selectedWingVariant.count;
      const allocatedWings = selectedSauces.reduce((sum, sauceId) => {
        return sum + (wingAllocation[sauceId] || Math.floor(totalWings / selectedSauces.length));
      }, 0);
      const remainingWings = totalWings - allocatedWings;

      const feedbackColor = remainingWings === 0 ? '#00b887' : remainingWings > 0 ? '#ff9500' : '#ff3333';
      const feedbackText = remainingWings === 0 ?
        '✓ All wings allocated' :
        remainingWings > 0 ?
          remainingWings + ' wings remaining' :
          Math.abs(remainingWings) + ' wings over limit!';

      const feedback = document.createElement('div');
      feedback.className = 'wing-allocation-feedback';
      feedback.style.cssText =
        'margin: 16px 0;' +
        'padding: 12px;' +
        'background: ' + feedbackColor + '15;' +
        'border: 2px solid ' + feedbackColor + ';' +
        'border-radius: 8px;' +
        'text-align: center;' +
        'font-weight: bold;' +
        'color: ' + feedbackColor + ';' +
        'font-size: 14px;';
      feedback.innerHTML =
        '<div style="display: flex; align-items: center; justify-content: center; gap: 8px;">' +
          '<span>' + feedbackText + '</span>' +
          '<span style="font-size: 12px; color: #666;">(' + allocatedWings + '/' + totalWings + ' wings)</span>' +
        '</div>';

      // Insert after the sauce grid
      const sauceGrid = feedbackContainer.querySelector('[style*="grid-template-columns: 1fr 1fr"]');
      if (sauceGrid && sauceGrid.nextSibling) {
        feedbackContainer.insertBefore(feedback, sauceGrid.nextSibling);
      } else if (sauceGrid) {
        sauceGrid.parentNode.insertBefore(feedback, sauceGrid.nextSibling);
      }
    }

    function loadStepContent() {
      // Update step layout based on wing type
      updateModalStepLayout();

      switch(currentModalStep) {
        case 1:
          populateWingVariants();
          break;
        case 2:
          populateSauceSelection();
          break;
        case 3:
          populateIncludedDipSelection();
          break;
        case 4:
          if (currentWingType === 'bone-in') {
            populateWingStyleSelection();
          } else {
            populateExtraDipSelection();
          }
          break;
        case 5:
          if (currentWingType === 'bone-in') {
            populateExtraDipSelection();
          } else {
            populateOrderSummary();
          }
          break;
        case 6:
          populateOrderSummary();
          break;
      }
    }

    function updateModalStepLayout() {
      // Update step titles and visibility based on wing type and current step
      if (currentWingType === 'boneless') {
        // Boneless wings: 5 steps total (no wing style)
        document.getElementById('step3Title').textContent = 'Choose Included Dips';
        document.getElementById('step4Title').textContent = 'Extra Dips (Optional)';
        document.getElementById('step5Title').textContent = 'Order Summary';

        // Hide step 6 and its progress indicator for boneless
        const step6Progress = document.querySelector('[data-step="6"]');
        const step6Modal = document.getElementById('modalStep6');
        if (step6Progress) step6Progress.style.display = 'none';
        if (step6Modal) step6Modal.style.display = 'none';
      } else {
        // Bone-in wings: 6 steps total (includes wing style)
        document.getElementById('step3Title').textContent = 'Choose Included Dips';
        document.getElementById('step4Title').textContent = 'Wing Style Preference';
        document.getElementById('step5Title').textContent = 'Extra Dips (Optional)';
        document.getElementById('step6Title').textContent = 'Order Summary';

        // Show step 6 and its progress indicator for bone-in
        const step6Progress = document.querySelector('[data-step="6"]');
        const step6Modal = document.getElementById('modalStep6');
        if (step6Progress) step6Progress.style.display = 'flex';
        if (step6Modal) step6Modal.style.display = 'block';
      }
    }

    function populateWingVariants() {
      const container = document.getElementById('wingVariants');
      if (!container) return;

      container.innerHTML = modalWingsData.map(variant =>
        '<div class="wing-variant-card" onclick="selectWingVariant(\\'' + variant.id + '\\');">' +
          '<div class="variant-count">' + variant.count + ' Wings</div>' +
          '<div class="variant-type">' + (currentWingType === 'boneless' ? 'Boneless' : 'Bone-In') + '</div>' +
          '<div class="variant-sauces">' + variant.includedSauces + ' sauce' + (variant.includedSauces > 1 ? 's' : '') + ' included</div>' +
          '<div class="variant-price">$' + variant.platformPrice + '</div>' +
        '</div>'
      ).join('');
    }

    window.selectWingVariant = function(variantId) {
      selectedWingVariant = modalWingsData.find(v => v.id === variantId);

      // Update UI
      document.querySelectorAll('.wing-variant-card').forEach(card => {
        card.classList.remove('selected');
      });

      event.target.closest('.wing-variant-card').classList.add('selected');

      // Update modal buttons to enable next button
      updateModalButtons();
    };

    function populateSauceSelection() {
      // Use real Firestore sauce data (loaded in global variables)
      const sauces = strategicMenu.sauces || firestoreSauces || [];

      const maxSauces = selectedWingVariant ? selectedWingVariant.includedSauces : 1;
      const container = document.getElementById('sauceOptions');
      if (!container) return;

      // Calculate wing allocation summary for 12+ wings
      const showWingAllocation = selectedWingVariant && selectedWingVariant.count >= 12 && selectedSauces.length > 1;
      let allocationSummary = '';

      if (showWingAllocation) {
        const totalAllocated = selectedSauces.reduce((sum, sauceId) => {
          return sum + (wingAllocation[sauceId] || Math.floor(selectedWingVariant.count / selectedSauces.length));
        }, 0);
        const remaining = selectedWingVariant.count - totalAllocated;

        allocationSummary = '<div style="margin-bottom: 15px; text-align: center; padding: 12px; background: ' + (remaining === 0 ? '#e8f5e8' : '#fff3cd') + '; border-radius: 8px; color: ' + (remaining === 0 ? '#155724' : '#856404') + '; font-size: 14px; font-weight: bold;">' +
          'Wing Allocation: ' + totalAllocated + '/' + selectedWingVariant.count + ' wings assigned' +
          (remaining > 0 ? ' • ' + remaining + ' wings unassigned' : ' • Perfect!') +
        '</div>';
      }

      // Separate sauces by category (exclude dipping sauces - those are handled separately)
      // Sort by heat level (least hot to most hot)
      const wetSauces = sauces.filter(s => s.category === 'signature-sauce')
        .sort((a, b) => (a.heatLevel || 1) - (b.heatLevel || 1));
      const dryRubs = sauces.filter(s => s.category === 'dry-rub')
        .sort((a, b) => (a.heatLevel || 1) - (b.heatLevel || 1));

      container.innerHTML =
        '<div style="margin-bottom: 20px; text-align: center; color: #666; font-size: 14px;">Select up to ' + maxSauces + ' sauce' + (maxSauces > 1 ? 's' : '') + ' (included in price)</div>' +
        allocationSummary +

        // Two-column layout for sauces
        '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px;">' +

          // Left Column: Dry Rubs
          '<div>' +
            '<h4 style="margin: 0 0 12px 0; color: #1a1a1a; font-size: 16px; font-weight: bold; border-bottom: 2px solid #ff6b35; padding-bottom: 6px;">🧄 Dry Rubs</h4>' +
            dryRubs.map(sauce => {
              const isSelected = selectedSauces.includes(sauce.id);
              const isDryRub = true;
              const heatLevel = sauce.heatLevel || 1;
              const heatDisplay = heatLevel <= 1 ? 'Mild' : heatLevel <= 2 ? 'Medium' : heatLevel <= 3 ? 'Hot' : 'Extra Hot';
              const heatColor = heatLevel <= 1 ? '#00b887' : heatLevel <= 2 ? '#ff9500' : heatLevel <= 3 ? '#ff6b35' : '#ff3333';
              const heatEmoji = heatLevel <= 1 ? '🚫🌶️' : '🌶️'.repeat(heatLevel);

              return '<div class="sauce-option" onclick="toggleSauceSelection(\\'' + sauce.id + '\\')" style="display: flex; align-items: center; justify-content: space-between; padding: 12px; border: 2px solid ' + (isSelected ? '#ff6b35' : '#e0e0e0') + '; border-radius: 10px; margin-bottom: 10px; cursor: pointer; background: ' + (isSelected ? '#fff5f2' : 'white') + '; transition: all 0.3s ease;">' +
                '<div style="flex: 1;">' +
                  '<h5 style="margin: 0 0 3px 0; color: #1a1a1a; font-size: 14px; font-weight: bold;">' + sauce.name + '</h5>' +
                  '<p style="margin: 0 0 3px 0; color: #666; font-size: 12px; line-height: 1.2;">' + sauce.description + '</p>' +
                  '<div style="display: flex; align-items: center; gap: 6px;">' +
                    '<span style="font-size: 10px; color: ' + heatColor + '; font-weight: bold;">' + heatEmoji + ' ' + heatDisplay + '</span>' +
                  '</div>' +
                  // Add wing allocation controls for 12+ wing orders with multiple sauces
                  (isSelected && selectedWingVariant && selectedWingVariant.count >= 12 && selectedSauces.length > 1 ?
                    '<div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid #eee;">' +
                      '<div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; color: #666;" onclick="event.stopPropagation();">' +
                        '<span>Wings:</span>' +
                        '<div style="display: flex; align-items: center; gap: 6px;">' +
                          '<button onclick="adjustWingAllocation(\\'' + sauce.id + '\\', -1)" style="width: 20px; height: 20px; border: 1px solid #ccc; background: white; color: #666; border-radius: 3px; cursor: pointer; font-size: 12px;">−</button>' +
                          '<span style="min-width: 20px; text-align: center; font-weight: bold; color: #333; font-size: 11px;">' + (wingAllocation[sauce.id] || Math.floor(selectedWingVariant.count / selectedSauces.length)) + '</span>' +
                          '<button onclick="adjustWingAllocation(\\'' + sauce.id + '\\', 1)" style="width: 20px; height: 20px; border: 1px solid #ccc; background: white; color: #666; border-radius: 3px; cursor: pointer; font-size: 12px;">+</button>' +
                        '</div>' +
                      '</div>' +
                    '</div>'
                    : '') +
                '</div>' +
                '<div style="width: 20px; height: 20px; border: 2px solid ' + (isSelected ? '#ff6b35' : '#ddd') + '; border-radius: 50%; background: ' + (isSelected ? '#ff6b35' : 'white') + '; display: flex; align-items: center; justify-content: center;">' +
                  (isSelected ? '<span style="color: white; font-size: 12px; font-weight: bold;">✓</span>' : '') +
                '</div>' +
              '</div>';
            }).join('') +
          '</div>' +

          // Right Column: Signature Sauces
          '<div>' +
            '<h4 style="margin: 0 0 12px 0; color: #1a1a1a; font-size: 16px; font-weight: bold; border-bottom: 2px solid #ff6b35; padding-bottom: 6px;">🌶️ Signature Sauces</h4>' +
            wetSauces.map(sauce => {
              const isSelected = selectedSauces.includes(sauce.id);
              const isOnSide = saucePreferences[sauce.id] && saucePreferences[sauce.id].onSide;
              const isDryRub = sauce.isDryRub || sauce.category === 'dry-rub';
              const heatLevel = sauce.heatLevel || 1;
              const heatDisplay = heatLevel <= 1 ? 'Mild' : heatLevel <= 2 ? 'Medium' : heatLevel <= 3 ? 'Hot' : 'Extra Hot';
              const heatColor = heatLevel <= 1 ? '#00b887' : heatLevel <= 2 ? '#ff9500' : heatLevel <= 3 ? '#ff6b35' : '#ff3333';
              const heatEmoji = heatLevel <= 1 ? '🚫🌶️' : '🌶️'.repeat(heatLevel);

              return '<div class="sauce-option" onclick="toggleSauceSelection(\\'' + sauce.id + '\\')" style="display: flex; align-items: center; justify-content: space-between; padding: 12px; border: 2px solid ' + (isSelected ? '#ff6b35' : '#e0e0e0') + '; border-radius: 10px; margin-bottom: 10px; cursor: pointer; background: ' + (isSelected ? '#fff5f2' : 'white') + '; transition: all 0.3s ease;">' +
                '<div style="flex: 1;">' +
                  '<h5 style="margin: 0 0 3px 0; color: #1a1a1a; font-size: 14px; font-weight: bold;">' + sauce.name + '</h5>' +
                  '<p style="margin: 0 0 3px 0; color: #666; font-size: 12px; line-height: 1.2;">' + sauce.description + '</p>' +
                  '<div style="display: flex; align-items: center; gap: 6px;">' +
                    '<span style="font-size: 10px; color: ' + heatColor + '; font-weight: bold;">' + heatEmoji + ' ' + heatDisplay + '</span>' +
                  '</div>' +
                  // Add "on the side" toggle for signature sauces only (not dry rubs) - ALWAYS VISIBLE
                  (!isDryRub ?
                    '<div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #eee; opacity: ' + (isSelected ? '1' : '0.6') + ';">' +
                      '<label class="on-side-toggle-container" style="display: flex; align-items: center; justify-content: space-between; font-size: 12px; color: #666; cursor: ' + (isSelected ? 'pointer' : 'not-allowed') + ';" onclick="' + (isSelected ? 'event.stopPropagation();' : 'event.stopPropagation(); alert(\\'Please select this sauce first to enable \\\"On the Side\\\" option\\');') + '">' +
                        '<span class="toggle-label" style="font-size: 11px; color: ' + (isSelected ? '#888' : '#bbb') + '; font-weight: ' + (isSelected ? 'normal' : 'bold') + ';">🥄 On the Side (1.5oz)</span>' +
                        '<div style="display: flex; align-items: center; gap: 8px;">' +
                          '<input type="checkbox" class="on-side-toggle" ' + (isOnSide && isSelected ? 'checked' : '') + ' ' + (isSelected ? '' : 'disabled') + ' onchange="' + (isSelected ? 'toggleOnSide(\\'' + sauce.id + '\\', this.checked)' : '') + '" style="display: none;">' +
                          '<span class="toggle-slider" style="position: relative; display: inline-block; width: 30px; height: 16px; background-color: ' + (isOnSide && isSelected ? '#ff6b35' : isSelected ? '#ccc' : '#eee') + '; border-radius: 16px; transition: 0.3s; cursor: ' + (isSelected ? 'pointer' : 'not-allowed') + '; border: ' + (isSelected ? 'none' : '1px solid #ddd') + ';" onclick="' + (isSelected ? 'this.previousElementSibling.click();' : 'alert(\\'Please select this sauce first to enable \\\"On the Side\\\" option\\');') + '">' +
                            '<span style="position: absolute; content: \\'\\'; height: 12px; width: 12px; left: ' + (isOnSide && isSelected ? '16px' : '2px') + '; bottom: 2px; background-color: ' + (isSelected ? 'white' : '#f5f5f5') + '; transition: 0.3s; border-radius: 50%; border: ' + (isSelected ? 'none' : '1px solid #ddd') + ';"></span>' +
                          '</span>' +
                        '</div>' +
                      '</label>' +
                    '</div>'
                    : '') +
                  // Add wing allocation controls for 12+ wing orders with multiple sauces
                  (isSelected && selectedWingVariant && selectedWingVariant.count >= 12 && selectedSauces.length > 1 ?
                    '<div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid #eee;">' +
                      '<div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; color: #666;" onclick="event.stopPropagation();">' +
                        '<span>Wings:</span>' +
                        '<div style="display: flex; align-items: center; gap: 6px;">' +
                          '<button onclick="adjustWingAllocation(\\'' + sauce.id + '\\', -1)" style="width: 20px; height: 20px; border: 1px solid #ccc; background: white; color: #666; border-radius: 3px; cursor: pointer; font-size: 12px;">−</button>' +
                          '<span style="min-width: 20px; text-align: center; font-weight: bold; color: #333; font-size: 11px;">' + (wingAllocation[sauce.id] || Math.floor(selectedWingVariant.count / selectedSauces.length)) + '</span>' +
                          '<button onclick="adjustWingAllocation(\\'' + sauce.id + '\\', 1)" style="width: 20px; height: 20px; border: 1px solid #ccc; background: white; color: #666; border-radius: 3px; cursor: pointer; font-size: 12px;">+</button>' +
                        '</div>' +
                      '</div>' +
                    '</div>'
                    : '') +
                '</div>' +
                '<div style="width: 20px; height: 20px; border: 2px solid ' + (isSelected ? '#ff6b35' : '#ddd') + '; border-radius: 50%; background: ' + (isSelected ? '#ff6b35' : 'white') + '; display: flex; align-items: center; justify-content: center;">' +
                  (isSelected ? '<span style="color: white; font-size: 12px; font-weight: bold;">✓</span>' : '') +
                '</div>' +
              '</div>';
            }).join('') +
          '</div>' +
        '</div>';

      updateModalButtons();
    }

    window.toggleSauceSelection = function(sauceId) {
      const maxSauces = selectedWingVariant ? selectedWingVariant.includedSauces : 1;
      const currentIndex = selectedSauces.indexOf(sauceId);

      if (currentIndex > -1) {
        // Remove sauce
        selectedSauces.splice(currentIndex, 1);
        // Remove allocation for this sauce
        delete wingAllocation[sauceId];
        // Remove sauce preferences
        delete saucePreferences[sauceId];
      } else if (selectedSauces.length < maxSauces) {
        // Add sauce
        selectedSauces.push(sauceId);

        // Initialize sauce preferences
        if (!saucePreferences[sauceId]) {
          saucePreferences[sauceId] = { selected: true, onSide: false };
        } else {
          saucePreferences[sauceId].selected = true;
        }

        // For 12+ wings with multiple sauces, initialize allocation
        if (selectedWingVariant && selectedWingVariant.count >= 12 && selectedSauces.length > 1) {
          // Redistribute wings evenly among all selected sauces
          const wingsPerSauce = Math.floor(selectedWingVariant.count / selectedSauces.length);
          selectedSauces.forEach(sid => {
            wingAllocation[sid] = wingsPerSauce;
          });
        }
      } else {
        alert('You can only select up to ' + maxSauces + ' sauce' + (maxSauces > 1 ? 's' : ''));
        return;
      }

      // Refresh display
      populateSauceSelection();

      // Step 4: Trigger validation updates when sauce selection changes
      setTimeout(() => {
        updateWingAllocationFeedback();
        updateModalButtons();
      }, 100);
    };

    // Handle "on the side" toggle for sauces (Step 1 enhancement)
    window.toggleOnSide = function(sauceId, isOnSide) {
      // Ensure sauce preferences object exists
      if (!saucePreferences[sauceId]) {
        saucePreferences[sauceId] = { selected: false, onSide: false };
      }

      // Update the preference
      saucePreferences[sauceId].onSide = isOnSide;

      // Log for debugging
      console.log('Toggled sauce preference:', {
        sauceId: sauceId,
        onSide: isOnSide,
        allPreferences: saucePreferences
      });

      // Re-render the sauce selection to update the toggle slider display
      populateSauceSelection();

      // Update order summary if we're on the final step
      if (typeof populateOrderSummary === 'function') {
        populateOrderSummary();
      }
    };

    // Handle wing allocation adjustments for 12+ wing orders
    window.adjustWingAllocation = function(sauceId, change) {
      if (!selectedWingVariant || selectedWingVariant.count < 12 || selectedSauces.length <= 1) return;

      // Initialize allocation if not set
      if (!wingAllocation[sauceId]) {
        wingAllocation[sauceId] = Math.floor(selectedWingVariant.count / selectedSauces.length);
      }

      const currentAllocation = wingAllocation[sauceId];
      const newAllocation = Math.max(1, currentAllocation + change); // Minimum 1 wing per sauce
      const totalWings = selectedWingVariant.count;

      // Calculate current total allocation across all sauces
      const currentTotal = selectedSauces.reduce((sum, sid) => {
        return sum + (wingAllocation[sid] || Math.floor(totalWings / selectedSauces.length));
      }, 0);

      // Calculate what the new total would be
      const newTotal = currentTotal - currentAllocation + newAllocation;

      // Only allow the change if it doesn't exceed total wings
      if (newTotal <= totalWings && newAllocation >= 1) {
        wingAllocation[sauceId] = newAllocation;

        // Re-render to show updated allocation and validation feedback
        populateSauceSelection();

        // Step 4: Update validation feedback immediately after allocation change
        setTimeout(() => {
          updateWingAllocationFeedback();
          updateModalButtons();
        }, 100);
      } else {
        // Step 4: Provide user feedback when allocation is invalid
        if (newAllocation < 1) {
          // Flash the allocation display to show minimum constraint
          const allocationSpan = document.querySelector('[onclick*="' + sauceId + '"][onclick*="-1"]').nextElementSibling;
          if (allocationSpan) {
            allocationSpan.style.color = '#ff3333';
            allocationSpan.style.fontWeight = 'bold';
            setTimeout(() => {
              allocationSpan.style.color = '#333';
              allocationSpan.style.fontWeight = 'bold';
            }, 1000);
          }
        } else if (newTotal > totalWings) {
          // Show brief feedback about exceeding limit
          const feedbackContainer = document.getElementById('modalContent');
          const existingAlert = feedbackContainer.querySelector('.allocation-alert');
          if (existingAlert) existingAlert.remove();

          const alert = document.createElement('div');
          alert.className = 'allocation-alert';
          alert.style.cssText =
            'position: fixed;' +
            'top: 50%;' +
            'left: 50%;' +
            'transform: translate(-50%, -50%);' +
            'background: #ff3333;' +
            'color: white;' +
            'padding: 12px 20px;' +
            'border-radius: 8px;' +
            'font-weight: bold;' +
            'z-index: 10000;' +
            'box-shadow: 0 4px 12px rgba(0,0,0,0.3);';
          alert.textContent = 'Cannot exceed ' + totalWings + ' wings total!';
          feedbackContainer.appendChild(alert);

          setTimeout(() => alert.remove(), 2000);
        }
      }
    };

    function populateIncludedDipSelection() {
      // Use real Firestore dipping sauce data
      const allSauces = strategicMenu.sauces || firestoreSauces || [];
      const includedDips = [
        // Add "No Dip" option first
        { id: 'no-dip', name: 'No Dip', description: 'Skip dips entirely' },
        // Add real Firestore dipping sauces
        ...allSauces.filter(s => s.category === 'dipping-sauce')
      ];

      const maxDips = selectedWingVariant ? Math.floor(selectedWingVariant.count / 6) : 1;
      const container = document.getElementById('includedDipOptions');
      if (!container) return;

      // Check if "No Dip" is selected to adjust UI
      const noDipSelected = selectedIncludedDips['no-dip'] > 0;
      const totalDipsSelected = Object.values(selectedIncludedDips).reduce((sum, q) => sum + q, 0);

      container.innerHTML =
        '<div style="margin-bottom: 20px; text-align: center; color: #666; font-size: 14px;">' +
          (noDipSelected ? 'No dips selected' : 'Select up to ' + maxDips + ' dip' + (maxDips > 1 ? 's' : '') + ' (included in price)') +
        '</div>' +
        includedDips.map(dip => {
          const quantity = selectedIncludedDips[dip.id] || 0;
          const isSelected = quantity > 0;
          const isNoDip = dip.id === 'no-dip';

          if (isNoDip) {
            // Special handling for "No Dip" - show as toggle
            return '<div class="dip-option no-dip-toggle" style="display: flex; align-items: center; justify-content: space-between; padding: 18px; border: 2px solid ' + (isSelected ? '#ff6b35' : '#e0e0e0') + '; border-radius: 12px; margin-bottom: 12px; background: ' + (isSelected ? '#fff5f2' : 'white') + '; cursor: pointer;" onclick="toggleNoDip()">' +
              '<div style="flex: 1;">' +
                '<h5 style="margin: 0 0 4px 0; color: #1a1a1a; font-size: 16px; display: flex; align-items: center; gap: 8px;">🚫 ' + dip.name + '</h5>' +
                '<p style="margin: 0; color: #666; font-size: 14px;">' + (isSelected ? 'Selected - Will skip extra dips and go to summary' : 'Skip all dips and go directly to order summary') + '</p>' +
              '</div>' +
              '<div style="display: flex; align-items: center;">' +
                '<div style="width: 24px; height: 24px; border: 2px solid ' + (isSelected ? '#ff6b35' : '#ddd') + '; border-radius: 50%; background: ' + (isSelected ? '#ff6b35' : 'white') + '; display: flex; align-items: center; justify-content: center;">' +
                  (isSelected ? '<span style="color: white; font-size: 14px; font-weight: bold;">✓</span>' : '') +
                '</div>' +
              '</div>' +
            '</div>';
          } else {
            // Regular dip with quantity controls
            const totalSelected = Object.values(selectedIncludedDips).reduce((sum, q) => sum + q, 0);
            const isAtMax = totalSelected >= maxDips;
            return '<div class="dip-option" style="display: flex; align-items: center; justify-content: space-between; padding: 15px; border: 2px solid ' + (quantity > 0 ? '#ff6b35' : '#e0e0e0') + '; border-radius: 12px; margin-bottom: 12px; background: ' + (quantity > 0 ? '#fff5f2' : 'white') + '; opacity: ' + (noDipSelected ? '0.5' : '1') + ';">' +
              '<div style="flex: 1;">' +
                '<h5 style="margin: 0 0 4px 0; color: #1a1a1a; font-size: 16px;">' + dip.name + '</h5>' +
                '<p style="margin: 0; color: #666; font-size: 14px;">' + (dip.description || 'Classic dipping sauce') + '</p>' +
              '</div>' +
              '<div style="display: flex; align-items: center; gap: 12px;">' +
                '<button onclick="' + (noDipSelected ? 'alert(\\"Please unselect \\'No Dip\\' first\\")' : 'adjustIncludedDipQuantity(\\'' + dip.id + '\\', -1)') + '" style="width: 36px; height: 36px; border: 2px solid ' + (quantity === 0 || noDipSelected ? '#ccc' : '#ff6b35') + '; background: white; color: ' + (quantity === 0 || noDipSelected ? '#ccc' : '#ff6b35') + '; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: bold; cursor: ' + (quantity === 0 || noDipSelected ? 'not-allowed' : 'pointer') + '; opacity: ' + (quantity === 0 || noDipSelected ? '0.3' : '1') + ';" ' + (quantity === 0 || noDipSelected ? 'disabled' : '') + '>−</button>' +
                '<span style="min-width: 24px; text-align: center; font-size: 18px; font-weight: bold; color: #1a1a1a;">' + quantity + '</span>' +
                '<button onclick="' + (noDipSelected ? 'alert(\\"Please unselect \\'No Dip\\' first\\")' : 'adjustIncludedDipQuantity(\\'' + dip.id + '\\', 1)') + '" style="width: 36px; height: 36px; border: 2px solid ' + (isAtMax || noDipSelected ? '#ccc' : '#ff6b35') + '; background: ' + (isAtMax || noDipSelected ? 'white' : '#ff6b35') + '; color: ' + (isAtMax || noDipSelected ? '#ccc' : 'white') + '; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: bold; cursor: ' + (isAtMax || noDipSelected ? 'not-allowed' : 'pointer') + '; opacity: ' + (isAtMax || noDipSelected ? '0.3' : '1') + ';" ' + (isAtMax || noDipSelected ? 'disabled' : '') + '>+</button>' +
              '</div>' +
            '</div>';
          }
        }).join('');
    }

    window.adjustIncludedDipQuantity = function(dipId, change) {
      const currentQuantity = selectedIncludedDips[dipId] || 0;
      const maxDips = selectedWingVariant ? Math.floor(selectedWingVariant.count / 6) : 1;
      const totalSelected = Object.values(selectedIncludedDips).reduce((sum, q) => sum + q, 0);

      // Handle "No Dip" logic
      if (dipId === 'no-dip') {
        if (change > 0 && currentQuantity === 0) {
          // Clear all other dips when selecting "No Dip"
          selectedIncludedDips = { 'no-dip': 1 };
        } else if (change < 0) {
          // Remove "No Dip" selection
          delete selectedIncludedDips[dipId];
        }
      } else {
        // Handle regular dip selection
        if (change > 0) {
          // If "No Dip" is selected, clear it first
          if (selectedIncludedDips['no-dip']) {
            delete selectedIncludedDips['no-dip'];
          }
        }

        const newQuantity = Math.max(0, currentQuantity + change);

        // Check if the new total would exceed maxDips (only for increases)
        if (change > 0) {
          const currentTotal = Object.values(selectedIncludedDips).reduce((sum, q) => sum + q, 0);
          const newTotal = currentTotal - currentQuantity + newQuantity;
          if (newTotal > maxDips) {
            return; // Would exceed max capacity
          }
        }

        if (newQuantity === 0) {
          delete selectedIncludedDips[dipId];
        } else {
          selectedIncludedDips[dipId] = newQuantity;
        }
      }

      populateIncludedDipSelection();
    };

    // New toggle function for "No Dip" option
    window.toggleNoDip = function() {
      const currentlySelected = selectedIncludedDips['no-dip'] > 0;

      if (currentlySelected) {
        // Unselect "No Dip"
        delete selectedIncludedDips['no-dip'];
      } else {
        // Select "No Dip" and clear all other dips
        selectedIncludedDips = { 'no-dip': 1 };
      }

      // Refresh the display
      populateIncludedDipSelection();
    };

    function populateWingStyleSelection() {
      if (currentWingType === 'boneless') return; // Skip for boneless wings

      const container = document.getElementById('wingStyleOptions');
      if (!container) return;

      container.innerHTML =
        '<div style="margin-bottom: 20px; text-align: center; color: #666; font-size: 14px;">Choose your wing style preference</div>' +
        '<div class="wing-style-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">' +
          '<div class="wing-variant-option ' + (selectedWingStyle === 'regular' ? 'selected' : '') + '" onclick="selectWingStyle(\\'regular\\')" style="border: 2px solid ' + (selectedWingStyle === 'regular' ? '#ff6b35' : '#e0e0e0') + '; border-radius: 12px; padding: 20px; text-align: center; cursor: pointer; background: ' + (selectedWingStyle === 'regular' ? '#fff5f2' : 'white') + '; transition: all 0.3s ease;">' +
            '<div class="wing-variant-info">' +
              '<h4 style="margin: 0 0 8px 0; color: #1a1a1a; font-size: 18px;">Regular Mix</h4>' +
              '<p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">Mixed flats and drumsticks</p>' +
              '<div class="wing-variant-price" style="color: #00b887; font-weight: bold;">Included</div>' +
            '</div>' +
          '</div>' +
          '<div class="wing-variant-option ' + (selectedWingStyle === 'all-drums' ? 'selected' : '') + '" onclick="selectWingStyle(\\'all-drums\\')" style="border: 2px solid ' + (selectedWingStyle === 'all-drums' ? '#ff6b35' : '#e0e0e0') + '; border-radius: 12px; padding: 20px; text-align: center; cursor: pointer; background: ' + (selectedWingStyle === 'all-drums' ? '#fff5f2' : 'white') + '; transition: all 0.3s ease;">' +
            '<div class="wing-variant-info">' +
              '<h4 style="margin: 0 0 8px 0; color: #1a1a1a; font-size: 18px;">All Drums</h4>' +
              '<p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">All drumstick pieces</p>' +
              '<div class="wing-variant-price" style="color: #ff6b35; font-weight: bold;">+$1.50</div>' +
            '</div>' +
          '</div>' +
          '<div class="wing-variant-option ' + (selectedWingStyle === 'all-flats' ? 'selected' : '') + '" onclick="selectWingStyle(\\'all-flats\\')" style="border: 2px solid ' + (selectedWingStyle === 'all-flats' ? '#ff6b35' : '#e0e0e0') + '; border-radius: 12px; padding: 20px; text-align: center; cursor: pointer; background: ' + (selectedWingStyle === 'all-flats' ? '#fff5f2' : 'white') + '; transition: all 0.3s ease;">' +
            '<div class="wing-variant-info">' +
              '<h4 style="margin: 0 0 8px 0; color: #1a1a1a; font-size: 18px;">All Flats</h4>' +
              '<p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">All wing flat pieces</p>' +
              '<div class="wing-variant-price" style="color: #ff6b35; font-weight: bold;">+$1.50</div>' +
            '</div>' +
          '</div>' +
        '</div>';
    }

    window.selectWingStyle = function(style) {
      selectedWingStyle = style;
      populateWingStyleSelection();
    };

    function populateExtraDipSelection() {
      const extraDips = [
        { id: 'extra_ranch', name: 'Extra Ranch', price: 0.75 },
        { id: 'extra_blue_cheese', name: 'Extra Blue Cheese', price: 0.75 },
        { id: 'extra_honey_mustard', name: 'Extra Honey Mustard', price: 0.75 },
        { id: 'extra_cheese_sauce', name: 'Extra Cheese Sauce', price: 0.75 }
      ];

      const containerId = currentWingType === 'boneless' ? 'extraDipOptions' : 'extraDipOptions';
      const container = document.getElementById(containerId);
      if (!container) return;

      container.innerHTML =
        '<div style="margin-bottom: 20px; font-size: 14px; color: #666; text-align: center;">Select as many dips as you would like - $0.75 each</div>' +
        extraDips.map(dip => {
          const quantity = selectedExtraDips[dip.id] || 0;
          return '<div class="extra-dip-option" style="display: flex; align-items: center; justify-content: space-between; padding: 15px; border: 2px solid ' + (quantity > 0 ? '#ff6b35' : '#e0e0e0') + '; border-radius: 12px; margin-bottom: 12px; background: ' + (quantity > 0 ? '#fff5f2' : 'white') + ';">' +
            '<div style="flex: 1;">' +
              '<h5 style="margin: 0 0 4px 0; color: #1a1a1a; font-size: 16px;">' + dip.name + '</h5>' +
              '<p style="margin: 0; color: #666; font-size: 14px;">+$' + dip.price.toFixed(2) + ' each</p>' +
            '</div>' +
            '<div style="display: flex; align-items: center; gap: 12px;">' +
              '<button onclick="adjustExtraDipQuantity(\\'' + dip.id + '\\', -1)" style="width: 36px; height: 36px; border: 2px solid ' + (quantity === 0 ? '#ccc' : '#ff6b35') + '; background: white; color: ' + (quantity === 0 ? '#ccc' : '#ff6b35') + '; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: bold; cursor: ' + (quantity === 0 ? 'not-allowed' : 'pointer') + '; opacity: ' + (quantity === 0 ? '0.3' : '1') + ';" ' + (quantity === 0 ? 'disabled' : '') + '>−</button>' +
              '<span style="min-width: 24px; text-align: center; font-size: 18px; font-weight: bold; color: #1a1a1a;">' + quantity + '</span>' +
              '<button onclick="adjustExtraDipQuantity(\\'' + dip.id + '\\', 1)" style="width: 36px; height: 36px; border: 2px solid #ff6b35; background: #ff6b35; color: white; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: bold; cursor: pointer;">+</button>' +
            '</div>' +
          '</div>';
        }).join('');
    }

    window.adjustExtraDipQuantity = function(dipId, change) {
      const currentQuantity = selectedExtraDips[dipId] || 0;
      const newQuantity = Math.max(0, currentQuantity + change);

      if (newQuantity === 0) {
        delete selectedExtraDips[dipId];
      } else {
        selectedExtraDips[dipId] = newQuantity;
      }

      populateExtraDipSelection();
    };

    function populateOrderSummary() {
      if (!selectedWingVariant) return;

      const wingStyleUpcharge = selectedWingStyle !== 'regular' ? 1.50 : 0;
      const extraDipsTotal = Object.values(selectedExtraDips).reduce((sum, qty) => sum + (qty * 0.75), 0);
      const totalPrice = selectedWingVariant.platformPrice + wingStyleUpcharge + extraDipsTotal;

      const container = document.getElementById('orderSummary');
      if (!container) return;

      container.innerHTML =
        '<div style="text-align: left; font-size: 16px; line-height: 1.6;">' +
          '<h4 style="margin-bottom: 16px; color: #1a1a1a; font-size: 20px;">' + selectedWingVariant.count + ' ' + (currentWingType === 'boneless' ? 'Boneless' : 'Bone-In') + ' Wings</h4>' +
          '<div style="background: #f8f9fa; padding: 16px; border-radius: 8px; margin-bottom: 16px;">' +
            '<p style="margin-bottom: 8px; color: #666; display: flex; justify-content: space-between;"><span>Base Price:</span><span>$' + selectedWingVariant.platformPrice.toFixed(2) + '</span></p>' +
            // Generate detailed sauce list with "on the side" notation
            (selectedSauces.length > 0 ?
              '<div style="margin-bottom: 8px; color: #666;">' +
                '<div style="font-weight: bold; margin-bottom: 4px;">Sauces (' + selectedSauces.length + ' included):</div>' +
                selectedSauces.map(sauceId => {
                  const sauce = (strategicMenu.sauces || firestoreSauces || []).find(s => s.id === sauceId);
                  const isOnSide = saucePreferences[sauceId] && saucePreferences[sauceId].onSide;
                  const sauceName = sauce ? sauce.name : sauceId;

                  // Calculate wing allocation for ALL orders (not just 12+)
                  let allocation;
                  if (selectedSauces.length === 1) {
                    // Single sauce gets all wings
                    allocation = selectedWingVariant.count;
                  } else {
                    // Multiple sauces: use manual allocation or default split
                    allocation = wingAllocation[sauceId] || Math.floor(selectedWingVariant.count / selectedSauces.length);
                  }

                  // Build complete sauce description with wing count and serving style
                  const wingCountText = allocation + ' wings';
                  const servingStyleText = isOnSide ? ' (on the side)' : '';

                  return '<div style="padding-left: 16px; font-size: 14px; line-height: 1.4; margin-bottom: 2px;">• ' + sauceName + ' - ' + wingCountText + servingStyleText + '</div>';
                }).join('') +
                // Add wing allocation verification for multiple sauces
                (selectedSauces.length > 1 ?
                  '<div style="margin-top: 8px; padding: 8px; background: #f0f8ff; border-radius: 6px; font-size: 12px; color: #555;">' +
                    '<div style="font-weight: bold; margin-bottom: 2px;">Wing Distribution Summary:</div>' +
                    '<div>Total Wings: ' + selectedWingVariant.count + ' | Allocated: ' +
                    selectedSauces.reduce((sum, sauceId) => {
                      const allocation = wingAllocation[sauceId] || Math.floor(selectedWingVariant.count / selectedSauces.length);
                      return sum + allocation;
                    }, 0) +
                    '</div>' +
                  '</div>'
                  : '') +
              '</div>'
              :
              '<p style="margin-bottom: 8px; color: #666; display: flex; justify-content: space-between;"><span>Sauces:</span><span>None selected</span></p>'
            ) +
            // Add included dips section (free dips that come with wings)
            (Object.keys(selectedIncludedDips).length > 0 && !selectedIncludedDips['no-dip'] ?
              '<div style="margin-bottom: 8px; color: #666;">' +
                '<div style="font-weight: bold; margin-bottom: 4px;">Included Dips (free):</div>' +
                Object.keys(selectedIncludedDips)
                  .filter(dipId => dipId !== 'no-dip' && selectedIncludedDips[dipId] > 0)
                  .map(dipId => {
                    const dip = (strategicMenu.sauces || firestoreSauces || []).find(s => s.id === dipId);
                    const dipName = dip ? dip.name : dipId;
                    const quantity = selectedIncludedDips[dipId];
                    return '<div style="padding-left: 16px; font-size: 14px; line-height: 1.4; margin-bottom: 2px;">• ' + dipName + ' × ' + quantity + '</div>';
                  }).join('') +
              '</div>'
              :
              selectedIncludedDips['no-dip'] ?
                '<p style="margin-bottom: 8px; color: #666; display: flex; justify-content: space-between;"><span>Dips:</span><span>No dips requested</span></p>'
                :
                '<p style="margin-bottom: 8px; color: #666; display: flex; justify-content: space-between;"><span>Included Dips:</span><span>None selected</span></p>'
            ) +
            (selectedWingStyle !== 'regular' ? '<p style="margin-bottom: 8px; color: #666; display: flex; justify-content: space-between;"><span>Wing Style:</span><span>+$' + wingStyleUpcharge.toFixed(2) + '</span></p>' : '') +
            (Object.keys(selectedExtraDips).length > 0 ? '<p style="margin-bottom: 8px; color: #666; display: flex; justify-content: space-between;"><span>Extra Dips (' + Object.values(selectedExtraDips).reduce((sum, qty) => sum + qty, 0) + '):</span><span>+$' + extraDipsTotal.toFixed(2) + '</span></p>' : '') +
          '</div>' +
          '<div style="border-top: 2px solid #ff6b35; padding-top: 16px;">' +
            '<p style="font-size: 24px; font-weight: bold; color: #ff6b35; text-align: center; margin: 0;">Total: $' + totalPrice.toFixed(2) + '</p>' +
          '</div>' +
        '</div>';
    }

    window.addWingOrderToCart = function() {
      // TODO: Implement add to cart functionality
      console.log('Adding wing order to cart:', {
        wingType: currentWingType,
        variant: selectedWingVariant,
        sauces: selectedSauces,
        includedDips: selectedIncludedDips,
        extraDips: selectedExtraDips
      });

      closeWingModal();
      alert('Wings added to cart! (This is a demo)');
    };
  `;
}

/**
 * Generate navigation and smooth scrolling functions
 */
function generateNavigationFunctions() {
  return `
    // Navigation Functions
    function initializeNavigation() {
      const navItems = document.querySelectorAll('.nav-item');
      const sections = document.querySelectorAll('.menu-section');

      // Smooth scrolling for navigation
      navItems.forEach(item => {
        item.addEventListener('click', function(e) {
          e.preventDefault();
          const targetId = this.getAttribute('href').substring(1);
          const targetSection = document.getElementById(targetId);

          if (targetSection) {
            targetSection.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }
        });
      });

      // Active navigation highlighting
      function updateActiveNav() {
        const scrollPos = window.scrollY + 150;

        sections.forEach((section, index) => {
          const sectionTop = section.offsetTop;
          const sectionBottom = sectionTop + section.offsetHeight;
          const sectionId = section.getAttribute('id');

          if (scrollPos >= sectionTop && scrollPos < sectionBottom) {
            navItems.forEach(nav => nav.classList.remove('active'));
            const activeNav = document.querySelector('[href="#' + sectionId + '"]');
            if (activeNav) activeNav.classList.add('active');
          }
        });
      }

      // Throttled scroll listener
      let ticking = false;
      window.addEventListener('scroll', function() {
        if (!ticking) {
          requestAnimationFrame(updateActiveNav);
          ticking = true;
          setTimeout(() => { ticking = false; }, 100);
        }
      });
    }
  `;
}

/**
 * Generate utility functions
 */
function generateUtilityFunctions() {
  return `
    // Utility Functions
    function generateWingVariants(wingType) {
      // Use real Firestore wings data with proper platform pricing
      if (strategicMenu && strategicMenu.wings && strategicMenu.wings.variants && strategicMenu.wings.variants.length > 0) {
        return strategicMenu.wings.variants
          .filter(variant => {
            const isBoneless = variant.type === 'boneless' || variant.id?.includes('boneless');
            return wingType === 'boneless' ? isBoneless : !isBoneless;
          })
          .map(variant => ({
            id: variant.id,
            name: variant.name || (variant.count + ' Wings (' + (wingType === 'boneless' ? 'Boneless' : 'Bone-In') + ')'),
            count: variant.count,
            platformPrice: variant.platformPrice || variant.basePrice,
            basePrice: variant.basePrice,
            includedSauces: Math.max(1, Math.floor(variant.count / 6)) // 1 sauce per 6 wings
          }))
          .sort((a, b) => a.count - b.count); // Sort by wing count
      }

      // Fallback to correct default variants with proper DoorDash pricing (updated to match Firestore data)
      console.warn('No Firestore wings data available, using corrected fallback variants for', wingType);
      if (wingType === 'boneless') {
        return [
          { id: 'wings_6_boneless', name: '6 Wings (Boneless)', count: 6, platformPrice: 9.44, includedSauces: 1 },
          { id: 'wings_12_boneless', name: '12 Wings (Boneless)', count: 12, platformPrice: 16.19, includedSauces: 2 },
          { id: 'wings_24_boneless', name: '24 Wings (Boneless)', count: 24, platformPrice: 28.34, includedSauces: 4 },
          { id: 'wings_30_boneless', name: '30 Wings (Boneless)', count: 30, platformPrice: 35.09, includedSauces: 5 },
          { id: 'wings_50_boneless', name: '50 Wings (Boneless)', count: 50, platformPrice: 53.99, includedSauces: 8 }
        ];
      } else {
        return [
          { id: 'wings_6_bonein', name: '6 Wings (Bone-In)', count: 6, platformPrice: 12.14, includedSauces: 1 },
          { id: 'wings_12_bonein', name: '12 Wings (Bone-In)', count: 12, platformPrice: 20.24, includedSauces: 2 },
          { id: 'wings_24_bonein', name: '24 Wings (Bone-In)', count: 24, platformPrice: 35.09, includedSauces: 4 },
          { id: 'wings_30_bonein', name: '30 Wings (Bone-In)', count: 30, platformPrice: 44.54, includedSauces: 5 },
          { id: 'wings_50_bonein', name: '50 Wings (Bone-In)', count: 50, platformPrice: 67.49, includedSauces: 8 }
        ];
      }
    }

    function debounce(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    }

    function formatCurrency(amount) {
      return '$' + parseFloat(amount).toFixed(2);
    }
  `;
}

/**
 * Generate initialization code
 */
function generateInitialization() {
  return `
    // Initialization
    document.addEventListener('DOMContentLoaded', function() {
      console.log('DoorDash menu loaded successfully');

      // Initialize navigation
      initializeNavigation();

      // Initialize any other interactive elements
      initializeInteractiveElements();

      // Close modals on escape key
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
          closeWingModal();
          closeSidesModal();
        }
      });
    });

    function initializeInteractiveElements() {
      // Add any additional interactive functionality here
      console.log('Interactive elements initialized');
    }

    // Global error handling
    window.addEventListener('error', function(e) {
      console.error('JavaScript error:', e.error);
    });

    // Global unhandled promise rejection handling
    window.addEventListener('unhandledrejection', function(e) {
      console.error('Unhandled promise rejection:', e.reason);
    });
  `;
}

module.exports = {
  generateDoorDashJS,
  generateGlobalVariables,
  generateMobileMenuFunctions,
  generateSidesModalFunctions,
  generateModalFunctions,
  generateNavigationFunctions,
  generateUtilityFunctions,
  generateInitialization
};