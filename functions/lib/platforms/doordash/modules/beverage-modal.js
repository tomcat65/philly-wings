/**
 * Beverage Modal Module
 * Handles beverage ordering functionality including:
 * - Size selection
 * - Flavor selection
 * - Quantity management
 */

function generateBeverageModalJS(menuData = {}) {
  return `
    const BEVERAGE_PLATFORM_KEY = 'doordash';
    let beverageModalStep = 1;
    let currentBeverageVariant = null;
    let availableBeverageSizes = [];
    let availableBeverageFlavors = [];
    let selectedBeverageSize = null;
    let selectedBeverageFlavor = null;

    function resolvePrice(entry) {
      if (!entry) return 0;
      const pricing = entry.platformPricing || {};
      const platformValue = pricing[BEVERAGE_PLATFORM_KEY];
      const numericPlatform = typeof platformValue === 'number' ? platformValue : parseFloat(platformValue);
      if (!Number.isNaN(numericPlatform) && numericPlatform > 0) {
        return parseFloat(numericPlatform.toFixed(2));
      }
      if (typeof entry.platformPrice === 'number') {
        return parseFloat(entry.platformPrice.toFixed(2));
      }
      const parsedPlatform = parseFloat(entry.platformPrice);
      if (!Number.isNaN(parsedPlatform) && parsedPlatform > 0) {
        return parseFloat(parsedPlatform.toFixed(2));
      }
      if (typeof entry.basePrice === 'number') {
        return parseFloat(entry.basePrice.toFixed(2));
      }
      const parsedBase = parseFloat(entry.basePrice);
      if (!Number.isNaN(parsedBase) && parsedBase > 0) {
        return parseFloat(parsedBase.toFixed(2));
      }
      return 0;
    }

    function formatBeveragePrice(value) {
      const numeric = typeof value === 'number' ? value : parseFloat(value);
      if (Number.isNaN(numeric) || !Number.isFinite(numeric)) {
        return '0.00';
      }
      return numeric.toFixed(2);
    }

    function deriveBeverageSizes(variant) {
      if (!variant) return [];
      if (Array.isArray(variant.sizes) && variant.sizes.length > 0) {
        return variant.sizes.map((size, index) => ({
          ...size,
          id: size.id || ((variant.id || 'beverage') + '_size_' + index),
          label: size.name || size.label || size.size || ('Size ' + (index + 1)),
          description: size.description || variant.description || '',
          platformPrice: resolvePrice(size),
          basePrice: typeof size.basePrice === 'number' ? size.basePrice : parseFloat(size.basePrice || variant.basePrice || 0)
        }));
      }

      const fallbackBase = typeof variant.basePrice === 'number' ? variant.basePrice : parseFloat(variant.basePrice || variant.price || 0) || 0;

      return [{
        id: variant.id || 'beverage_default_size',
        label: variant.size || variant.name || 'Standard',
        description: variant.description || '',
        platformPrice: resolvePrice(variant),
        basePrice: fallbackBase
      }];
    }

    function deriveBeverageFlavors(variant) {
      if (!variant || !Array.isArray(variant.flavors)) return [];
      return variant.flavors.map((flavor, index) => {
        if (typeof flavor === 'string') {
          return {
            id: (variant.id || 'beverage') + '_flavor_' + index,
            name: flavor,
            description: ''
          };
        }
        return {
          id: flavor.id || flavor.value || (variant.id || 'beverage') + '_flavor_' + index,
          name: flavor.name || flavor.label || ('Flavor ' + (index + 1)),
          description: flavor.description || flavor.subtext || ''
        };
      }).filter(flavor => flavor.name);
    }

    function hasFlavorStep() {
      return availableBeverageFlavors.length > 0;
    }

    // Fountain drinks cart for quantity selection
    let fountainDrinksCart = {};

    function setupQuantitySelectionModal(beverageVariant) {
      const modal = document.getElementById('beverageModal');
      const modalTitle = document.getElementById('beverageModalTitle');

      console.log('Setting up quantity selection modal for:', beverageVariant.name);
      console.log('Available sizes:', availableBeverageSizes);
      console.log('Available flavors:', availableBeverageFlavors);

      // Set up multi-variant beverage modal
      beverageModalStep = 1;

      if (modalTitle) {
        modalTitle.textContent = beverageVariant.name + ' Selection';
      }

      // Hide progress steps for fountain drinks (we'll use custom ones with sides modal approach)
      const progressContainer = modal.querySelector('.modal-progress');
      if (progressContainer) {
        progressContainer.innerHTML =
          '<div class="progress-step active" data-step="1" style="font-size: 12px; position: relative; z-index: 1;">Select</div>' +
          '<div class="progress-step" data-step="2" style="font-size: 12px; position: relative; z-index: 1;">Cart</div>';
      }

      // Update step 1 for beverage selection grid
      const step1 = document.getElementById('beverageModalStep1');
      if (step1) {
        step1.style.display = 'block';
        step1.innerHTML =
          '<h3>Select Your ' + beverageVariant.name + '</h3>' +
          '<div id="beverageQuantityGrid" class="beverage-quantity-grid"></div>';
      }

      // Update step 2 for cart summary (skip flavor step for multi-variant beverages)
      const step2 = document.getElementById('beverageModalStep2');
      if (step2) {
        step2.style.display = 'none';
        step2.innerHTML =
          '<h3>Order Summary</h3>' +
          '<div id="beverageCartSummary" class="beverage-cart-summary"></div>';
      }

      // Hide step 3 for fountain drinks (not needed)
      const step3 = document.getElementById('beverageModalStep3');
      if (step3) {
        step3.style.display = 'none';
      }

      populateBeverageQuantityGrid();
      updateBeverageQuantityModalDisplay();

      if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
      }
    }

    // Define function both ways for maximum compatibility
    function openBeverageModal(beverageVariant) {

      currentBeverageVariant = beverageVariant || null;
      availableBeverageSizes = deriveBeverageSizes(currentBeverageVariant);
      availableBeverageFlavors = deriveBeverageFlavors(currentBeverageVariant);
      selectedBeverageSize = null;
      selectedBeverageFlavor = null;
      beverageModalStep = 1;

      // Special handling for beverages with multiple sizes AND flavors - use cart-style selection
      const hasSizes = currentBeverageVariant?.sizes && currentBeverageVariant.sizes.length > 1;
      const hasFlavors = currentBeverageVariant?.flavors && currentBeverageVariant.flavors.length > 1;

      if (hasSizes && hasFlavors) {
        fountainDrinksCart = {};
        // For multi-variant beverages, use the sizes and flavors directly from the variant
        availableBeverageSizes = currentBeverageVariant.sizes || [];
        availableBeverageFlavors = currentBeverageVariant.flavors || [];
        setupQuantitySelectionModal(currentBeverageVariant);
        return;
      }

      // Auto-select size if there's only one option (for non-fountain drinks)
      if (availableBeverageSizes.length === 1) {
        selectedBeverageSize = availableBeverageSizes[0];
        // Skip to flavor step if flavors exist, otherwise go to summary
        if (hasFlavorStep()) {
          beverageModalStep = 2;
        } else {
          beverageModalStep = 3;
        }
      }

      const modal = document.getElementById('beverageModal');
      const modalTitle = document.getElementById('beverageModalTitle');
      const sizeStep = document.getElementById('beverageModalStep1');
      const flavorStep = document.getElementById('beverageModalStep2');

      // Hide size step if only one size
      if (sizeStep) {
        sizeStep.style.display = availableBeverageSizes.length > 1 ? 'block' : 'none';
      }

      if (flavorStep) {
        flavorStep.style.display = hasFlavorStep() ? 'block' : 'none';
      }

      if (modalTitle) {
        modalTitle.textContent = beverageVariant?.name || 'Choose Your Beverage';
      }

      populateBeverageSizes();
      populateBeverageFlavors();
      if (beverageModalStep === 3) {
        populateBeverageOrderSummary();
      }
      updateBeverageModalDisplay();

      if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
      }
    };

    window.closeBeverageModal = function() {
      const modal = document.getElementById('beverageModal');
      if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
      }

      currentBeverageVariant = null;
      availableBeverageSizes = [];
      availableBeverageFlavors = [];
      selectedBeverageSize = null;
      selectedBeverageFlavor = null;
      beverageModalStep = 1;

      const sizeContainer = document.getElementById('beverageSizeOptions');
      const flavorContainer = document.getElementById('beverageFlavorOptions');
      const summaryContainer = document.getElementById('beverageOrderSummary');
      if (sizeContainer) sizeContainer.innerHTML = '';
      if (flavorContainer) flavorContainer.innerHTML = '';
      if (summaryContainer) summaryContainer.innerHTML = '';
    };

    window.navigateBeverageModalStep = function(direction) {
      // Check if we're in multi-variant beverage mode (fountain drinks, tea, etc.)
      const hasSizes = currentBeverageVariant?.sizes && currentBeverageVariant.sizes.length > 1;
      const hasFlavors = currentBeverageVariant?.flavors && currentBeverageVariant.flavors.length > 1;

      if (hasSizes && hasFlavors) {
        window.navigateBeverageQuantityModal(direction);
        return;
      }

      // Regular beverage navigation
      if (direction === 1) {
        if (!selectedBeverageSize) {
          alert('Please select a size to continue.');
          return;
        }

        if (beverageModalStep === 1) {
          if (hasFlavorStep()) {
            beverageModalStep = 2;
            populateBeverageFlavors();
          } else {
            beverageModalStep = 3;
            populateBeverageOrderSummary();
          }
        } else if (beverageModalStep === 2) {
          if (!selectedBeverageFlavor) {
            alert('Please pick a flavor to continue.');
            return;
          }
          beverageModalStep = 3;
          populateBeverageOrderSummary();
        }
      } else if (direction === -1) {
        if (beverageModalStep === 3) {
          beverageModalStep = hasFlavorStep() ? 2 : 1;
          if (beverageModalStep === 2) {
            populateBeverageFlavors();
          }
        } else if (beverageModalStep === 2) {
          beverageModalStep = 1;
        }
      }

      if (beverageModalStep === 1) {
        populateBeverageSizes();
      }

      if (beverageModalStep === 3) {
        populateBeverageOrderSummary();
      }

      updateBeverageModalDisplay();
    };

    window.selectBeverageSize = function(index) {
      const option = availableBeverageSizes[index];
      if (!option) return;

      selectedBeverageSize = option;
      populateBeverageSizes();
      updateBeverageModalDisplay();
    };

    window.selectBeverageFlavor = function(index) {
      const flavor = availableBeverageFlavors[index];
      if (!flavor) return;

      selectedBeverageFlavor = flavor;
      populateBeverageFlavors();
      updateBeverageModalDisplay();
    };

    function populateBeverageSizes() {
      const container = document.getElementById('beverageSizeOptions');
      if (!container) return;

      if (!availableBeverageSizes.length) {
        container.innerHTML = '<p class="beverage-empty-state">No size options available right now.</p>';
        return;
      }

      container.innerHTML = availableBeverageSizes.map((option, index) => {
        const isSelected = selectedBeverageSize && selectedBeverageSize.id === option.id;
        const description = option.description || currentBeverageVariant?.description || '';
        return '<div class="wing-variant-card' + (isSelected ? ' selected' : '') + '" onclick="selectBeverageSize(' + index + ')">' +
                   '<h4>' + option.label + '</h4>' +
                   (description ? '<p style="margin: 0.5rem 0; color: #666; font-size: 0.9rem;">' + description + '</p>' : '') +
                   '<div style="font-size: 1.2rem; font-weight: bold; color: #FF3333; margin-top: 1rem;">$' + formatBeveragePrice(option.platformPrice ?? option.basePrice) + '</div>' +
               '</div>';
      }).join('');
    }

    function populateBeverageFlavors() {
      const container = document.getElementById('beverageFlavorOptions');
      if (!container) return;

      if (!hasFlavorStep()) {
        container.innerHTML = '';
        return;
      }

      container.innerHTML = availableBeverageFlavors.map((flavor, index) => {
        const isSelected = selectedBeverageFlavor && selectedBeverageFlavor.id === flavor.id;
        return '<div class="wing-variant-card' + (isSelected ? ' selected' : '') + '" onclick="selectBeverageFlavor(' + index + ')">' +
                   '<h4>' + flavor.name + '</h4>' +
                   (flavor.description ? '<p style="margin: 0.5rem 0; color: #666; font-size: 0.9rem;">' + flavor.description + '</p>' : '') +
               '</div>';
      }).join('');
    }

    function populateBeverageOrderSummary() {
      const container = document.getElementById('beverageOrderSummary');
      if (!container) return;

      if (!selectedBeverageSize) {
        container.innerHTML = '<p>Please pick a size to view the summary.</p>';
        return;
      }

      const price = resolvePrice(selectedBeverageSize) || resolvePrice(currentBeverageVariant);

      container.innerHTML = '<div class="beverage-summary">' +
        '<h3>' + (currentBeverageVariant?.name || 'Selected Beverage') + '</h3>' +
        '<p>Size: ' + (selectedBeverageSize.label || selectedBeverageSize.name || 'Standard') + '</p>' +
        (selectedBeverageFlavor ? '<p>Flavor: ' + selectedBeverageFlavor.name + '</p>' : '') +
        '<div class="beverage-summary-price">$' + formatBeveragePrice(price) + '</div>' +
      '</div>';
    }

    function updateBeverageModalDisplay() {
      const progressSteps = document.querySelectorAll('#beverageModal .progress-step');
      progressSteps.forEach((step, index) => {
        const stepNumber = index + 1;
        // Hide size step if only one size
        if (stepNumber === 1 && availableBeverageSizes.length === 1) {
          step.style.display = 'none';
          return;
        }
        // Hide flavor step if no flavors
        if (stepNumber === 2 && !hasFlavorStep()) {
          step.style.display = 'none';
          return;
        }

        step.style.display = 'flex';
        step.classList.remove('active', 'completed');
        if (stepNumber < beverageModalStep) {
          step.classList.add('completed');
        }
        if (stepNumber === beverageModalStep) {
          step.classList.add('active');
        }
      });

      for (let i = 1; i <= 3; i++) {
        const step = document.getElementById('beverageModalStep' + i);
        if (!step) continue;

        // Hide size step if only one size
        if (i === 1 && availableBeverageSizes.length === 1) {
          step.classList.remove('active');
          step.style.display = 'none';
        } else if (i === 2 && !hasFlavorStep()) {
          step.classList.remove('active');
          step.style.display = 'none';
        } else {
          step.style.display = 'block';
          step.classList.toggle('active', i === beverageModalStep);
        }
      }

      const backBtn = document.getElementById('beverageModalBackBtn');
      const nextBtn = document.getElementById('beverageModalNextBtn');
      const addBtn = document.getElementById('beverageModalAddToCartBtn');

      if (backBtn) {
        backBtn.style.display = beverageModalStep > 1 ? 'inline-block' : 'none';
      }

      if (nextBtn) {
        if (beverageModalStep < 3) {
          nextBtn.style.display = 'inline-block';
          if (beverageModalStep === 1) {
            nextBtn.disabled = !selectedBeverageSize;
          } else if (beverageModalStep === 2) {
            nextBtn.disabled = !selectedBeverageFlavor;
          } else {
            nextBtn.disabled = false;
          }
        } else {
          nextBtn.style.display = 'none';
          nextBtn.disabled = false;
        }
      }

      if (addBtn) {
        addBtn.style.display = beverageModalStep === 3 ? 'inline-block' : 'none';
        addBtn.disabled = !selectedBeverageSize;
      }
    }

    window.addBeverageOrderToCart = function() {
      // Check if we're in multi-variant beverage mode (fountain drinks, tea, etc.)
      const hasSizes = currentBeverageVariant?.sizes && currentBeverageVariant.sizes.length > 1;
      const hasFlavors = currentBeverageVariant?.flavors && currentBeverageVariant.flavors.length > 1;

      if (hasSizes && hasFlavors) {
        window.addBeverageQuantityToCart();
        return;
      }

      // Regular beverage add to cart
      if (!selectedBeverageSize) {
        alert('Please select a size before adding to cart.');
        return;
      }

      const payload = {
        beverageId: currentBeverageVariant?.id,
        beverageName: currentBeverageVariant?.name,
        sizeId: selectedBeverageSize.id,
        sizeName: selectedBeverageSize.label || selectedBeverageSize.name,
        flavorId: selectedBeverageFlavor?.id || null,
        flavorName: selectedBeverageFlavor?.name || null,
        price: formatBeveragePrice(resolvePrice(selectedBeverageSize) || resolvePrice(currentBeverageVariant))
      };

      console.log('Adding beverage to cart:', payload);

      alert('Added to cart: ' + payload.beverageName + (payload.sizeName ? ' (' + payload.sizeName + ')' : '') + (payload.flavorName ? ' - ' + payload.flavorName : '') + ' — $' + payload.price);

      window.closeBeverageModal();
    };

    // Multi-variant beverage specific functions
    function populateBeverageQuantityGrid() {
      const container = document.getElementById('beverageQuantityGrid');
      if (!container) return;

      const sizes = availableBeverageSizes || [];
      const flavors = availableBeverageFlavors || [];

      let gridHTML = '<div class="fountain-drinks-container">';
      gridHTML += '<div class="fountain-sizes-grid">';

      // Create 2 columns - one for each size
      sizes.forEach(size => {
        gridHTML += '<div class="fountain-size-column">';
        gridHTML += '<h4 class="fountain-size-header">' + size.label + ' - $' + formatBeveragePrice(size.platformPrice) + '</h4>';
        gridHTML += '<div class="fountain-flavors-list">';

        flavors.forEach(flavor => {
          const key = size.id + '_' + flavor.id;
          const quantity = fountainDrinksCart[key] || 0;

          gridHTML += '<div class="wing-variant-card fountain-flavor-card">';
          gridHTML += '<div class="fountain-flavor-info">';
          gridHTML += '<h5 class="fountain-flavor-name">' + flavor.name + '</h5>';
          gridHTML += '</div>';
          gridHTML += '<div class="fountain-quantity-controls">';
          gridHTML += '<button class="fountain-qty-btn minus" onclick="adjustFountainDrinkQuantity(\\'' + key + '\\', -1)">−</button>';
          gridHTML += '<span class="fountain-qty-display">' + quantity + '</span>';
          gridHTML += '<button class="fountain-qty-btn plus" onclick="adjustFountainDrinkQuantity(\\'' + key + '\\', 1)">+</button>';
          gridHTML += '</div>';
          gridHTML += '</div>';
        });

        gridHTML += '</div>';
        gridHTML += '</div>';
      });

      gridHTML += '</div>';
      gridHTML += '</div>';
      container.innerHTML = gridHTML;
    }

    window.adjustFountainDrinkQuantity = function(key, change) {
      const currentQty = fountainDrinksCart[key] || 0;
      const newQty = Math.max(0, currentQty + change);

      console.log('Adjusting quantity for key:', key, 'from', currentQty, 'to', newQty);

      if (newQty === 0) {
        delete fountainDrinksCart[key];
      } else {
        fountainDrinksCart[key] = newQty;
      }

      console.log('Updated cart:', fountainDrinksCart);

      populateBeverageQuantityGrid();
      updateBeverageQuantityModalDisplay();
    };

    function updateBeverageQuantityModalDisplay() {
      const hasItems = Object.keys(fountainDrinksCart).length > 0;

      // Update progress steps
      const progressSteps = document.querySelectorAll('#beverageModal .progress-step');
      progressSteps.forEach((step, index) => {
        step.classList.remove('active', 'completed');
        if (index + 1 === beverageModalStep) {
          step.classList.add('active');
        } else if (index + 1 < beverageModalStep) {
          step.classList.add('completed');
        }
      });

      // Update step visibility
      const step1 = document.getElementById('beverageModalStep1');
      const step2 = document.getElementById('beverageModalStep2');

      if (step1) step1.style.display = beverageModalStep === 1 ? 'block' : 'none';
      if (step2) step2.style.display = beverageModalStep === 2 ? 'block' : 'none';

      // Update buttons
      const backBtn = document.getElementById('beverageModalBackBtn');
      const nextBtn = document.getElementById('beverageModalNextBtn');
      const addBtn = document.getElementById('beverageModalAddToCartBtn');

      if (backBtn) {
        if (beverageModalStep > 1) {
          backBtn.style.display = 'inline-block';
          backBtn.textContent = 'Continue Shopping';
        } else {
          backBtn.style.display = 'none';
        }
      }

      if (nextBtn) {
        if (beverageModalStep === 1) {
          nextBtn.style.display = 'inline-block';
          nextBtn.disabled = !hasItems;
          nextBtn.textContent = hasItems ? 'Review Order →' : 'Select drinks to continue';
        } else {
          nextBtn.style.display = 'none';
        }
      }

      if (addBtn) {
        if (beverageModalStep === 2) {
          addBtn.style.display = 'inline-block';
          addBtn.disabled = !hasItems;
          addBtn.textContent = 'Place Order';
        } else {
          addBtn.style.display = 'none';
        }
      }

      // Update summary if on step 2
      if (beverageModalStep === 2) {
        populateBeverageCartSummary();
      }
    }

    function populateBeverageCartSummary() {
      const container = document.getElementById('beverageCartSummary');
      if (!container) return;

      console.log('Fountain drinks cart:', fountainDrinksCart);
      console.log('Available sizes:', availableBeverageSizes);
      console.log('Available flavors:', availableBeverageFlavors);
      console.log('Size IDs:', availableBeverageSizes.map(s => s.id));
      console.log('Flavor IDs:', availableBeverageFlavors.map(f => f.id));

      const cartItems = Object.keys(fountainDrinksCart);
      if (cartItems.length === 0) {
        container.innerHTML = '<p>No drinks selected. Cart: ' + JSON.stringify(fountainDrinksCart) + '</p>';
        return;
      }

      let totalPrice = 0;
      let summaryHTML = '<div class="cart-items">';

      cartItems.forEach(key => {
        const quantity = fountainDrinksCart[key];

        // Find the correct way to split the key
        // Keys are like "fountain_20oz_coca_cola" or "fountain_32oz_diet_coke"
        const keyParts = key.split('_');
        let sizeId, flavorId;

        // Size IDs are like "fountain_20oz" or "fountain_32oz"
        // So we need to find where the size part ends
        if (keyParts.length >= 3) {
          // Try to match against available size IDs
          for (let i = 1; i < keyParts.length; i++) {
            const potentialSizeId = keyParts.slice(0, i + 1).join('_');
            if (availableBeverageSizes.some(s => s.id === potentialSizeId)) {
              sizeId = potentialSizeId;
              flavorId = keyParts.slice(i + 1).join('_');
              break;
            }
          }
        }

        console.log('Processing cart item:', key, 'quantity:', quantity);
        console.log('Split into sizeId:', sizeId, 'flavorId:', flavorId);

        const size = availableBeverageSizes.find(s => s.id === sizeId);
        const flavor = availableBeverageFlavors.find(f => f.id === flavorId);

        console.log('Found size:', size);
        console.log('Found flavor:', flavor);

        if (size && flavor) {
          const itemPrice = size.platformPrice * quantity;
          totalPrice += itemPrice;

          console.log('Adding item:', quantity + 'x ' + size.label + ' ' + flavor.name, 'price:', itemPrice);

          summaryHTML += '<div class="cart-item">';
          summaryHTML += '<span class="item-desc">' + quantity + 'x ' + size.label + ' ' + flavor.name + '</span>';
          summaryHTML += '<span class="item-price">$' + formatBeveragePrice(itemPrice) + '</span>';
          summaryHTML += '</div>';
        } else {
          console.log('FAILED to find size or flavor for key:', key);
        }
      });

      summaryHTML += '</div>';
      summaryHTML += '<div class="cart-total">';
      summaryHTML += '<strong>Total: $' + formatBeveragePrice(totalPrice) + '</strong>';
      summaryHTML += '</div>';

      container.innerHTML = summaryHTML;
    }

    window.navigateBeverageQuantityModal = function(direction) {
      console.log('Navigating fountain drinks modal, direction:', direction, 'current step:', beverageModalStep);
      console.log('Current cart before navigation:', fountainDrinksCart);

      if (direction === 1 && beverageModalStep === 1) {
        beverageModalStep = 2;
        updateBeverageQuantityModalDisplay();
      } else if (direction === -1 && beverageModalStep === 2) {
        // "Continue Shopping" - close the modal
        window.closeBeverageModal();
      }
    };

    window.addBeverageQuantityToCart = function() {
      const cartItems = Object.keys(fountainDrinksCart);
      if (cartItems.length === 0) {
        alert('Please select at least one drink.');
        return;
      }

      let totalPrice = 0;
      let orderSummary = 'Fountain Drinks Order:\\n';

      cartItems.forEach(key => {
        const quantity = fountainDrinksCart[key];
        const [sizeId, flavorId] = key.split('_');

        const size = availableBeverageSizes.find(s => s.id === sizeId);
        const flavor = availableBeverageFlavors.find(f => f.id === flavorId);

        if (size && flavor) {
          const itemPrice = size.platformPrice * quantity;
          totalPrice += itemPrice;
          orderSummary += quantity + 'x ' + size.label + ' ' + flavor.name + ' - $' + formatBeveragePrice(itemPrice) + '\\n';
        }
      });

      orderSummary += 'Total: $' + formatBeveragePrice(totalPrice);

      console.log('Adding fountain drinks to cart:', fountainDrinksCart);
      alert(orderSummary);

      window.closeBeverageModal();
    };

    // Assign to window for onclick compatibility
    window.openBeverageModal = openBeverageModal;
  `;
}

module.exports = {
  generateBeverageModalJS
};
