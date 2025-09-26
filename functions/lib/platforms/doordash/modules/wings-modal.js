/**
 * Wings Modal Module
 * Handles all wings ordering functionality including:
 * - Wing variant selection
 * - Sauce selection with wing allocation
 * - Wing style selection (flats/drums)
 * - Included and extra dips
 * - Order summary generation
 */

/**
 * Generate wings modal JavaScript functionality
 * @param {Object} menuData Complete menu data from Firestore
 * @param {Array} saucesData Sauce data from Firestore
 * @returns {string} Wings modal JavaScript code
 */
function generateWingsModalJS(menuData = {}, saucesData = []) {
  return `
    // Wings Modal State Variables
    let currentWingType = '';
    let selectedWingVariant = null;
    let selectedSauces = [];
    let selectedWingStyle = 'regular';
    let selectedIncludedDips = {};
    let selectedExtraDips = {};
    let saucePreferences = {};
    let modalWingsData = [];
    let currentModalStep = 1;
    let wingAllocation = {}; // { sauceId: wingCount }

    // Wings Modal Functions
    window.openWingModal = function(wingType, wingsData) {
      console.log('Opening wing modal for:', wingType, 'with data:', wingsData);

      // Store wing type
      currentWingType = wingType;

      // Generate wing data if not provided
      if (!wingsData) {
        modalWingsData = generateWingVariants(wingType);
      } else {
        modalWingsData = wingsData;
      }

      console.log('Generated wing variants:', modalWingsData);

      // Reset all state
      selectedWingVariant = null;
      selectedSauces = [];
      selectedWingStyle = 'regular';
      selectedIncludedDips = {};
      selectedExtraDips = {};
      saucePreferences = {};
      wingAllocation = {};
      currentModalStep = 1;

      // Show modal
      const modal = document.getElementById('wingsModal');
      if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        // Update modal layout based on wing type
        updateModalStepLayout();

        // Populate first step
        populateWingVariants();
        updateWingModalDisplay();
      }
    };

    window.closeWingModal = function() {
      const modal = document.getElementById('wingsModal');
      if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
      }
    };

    window.navigateWingModalStep = function(direction) {
      // Handle "No Dip" skip logic
      const noDipSelected = selectedIncludedDips['no-dip'];

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
      const maxSteps = currentWingType === 'boneless' ? 5 : 6;
      currentModalStep = Math.max(1, Math.min(maxSteps, currentModalStep + direction));

      updateWingModalDisplay();
    };

    function updateWingModalDisplay() {
      // Show correct step content
      for (let i = 1; i <= 6; i++) {
        const step = document.getElementById('modalStep' + i);
        if (step) {
          step.classList.remove('active');
          if (i === currentModalStep) {
            step.classList.add('active');
          }
        }
      }

      // Update progress indicators
      document.querySelectorAll('.progress-step').forEach((step, index) => {
        step.classList.remove('active', 'completed');
        if (index < currentModalStep - 1) {
          step.classList.add('completed');
        } else if (index === currentModalStep - 1) {
          step.classList.add('active');
        }
      });

      // Populate step content
      const maxSteps = currentWingType === 'boneless' ? 5 : 6;
      switch (currentModalStep) {
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
          if (currentWingType === 'boneless') {
            populateExtraDipSelection();
          } else {
            populateWingStyleSelection();
          }
          break;
        case 5:
          if (currentWingType === 'boneless') {
            populateOrderSummary();
          } else {
            populateExtraDipSelection();
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
          '<div class="wing-variant-info">' +
            '<h4>' + variant.count + ' Wings</h4>' +
            '<p>' + variant.description + '</p>' +
            '<div class="wing-variant-price">$' + variant.platformPrice + '</div>' +
          '</div>' +
        '</div>'
      ).join('');

      updateWingModalButtons();
    }

    window.selectWingVariant = function(variantId) {
      selectedWingVariant = modalWingsData.find(variant => variant.id === variantId);

      // Re-render to show selection
      populateWingVariants();

      // Update button states
      updateWingModalButtons();
    };

    // Wing allocation and sauce selection functions would continue here...
    // This is a partial extraction to demonstrate the modular approach
  `;
}

module.exports = {
  generateWingsModalJS
};