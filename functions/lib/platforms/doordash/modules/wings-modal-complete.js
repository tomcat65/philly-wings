/**
 * Wings Modal Module - Complete Implementation
 * Handles all wings ordering functionality including:
 * - Wing variant selection
 * - Sauce selection with wing allocation
 * - Wing style selection (flats/drums)
 * - Included and extra dips
 * - Order summary generation
 */

/**
 * Generate complete wings modal JavaScript functionality
 * @param {Object} menuData Complete menu data from Firestore
 * @param {Array} saucesData Sauce data from Firestore
 * @returns {string} Wings modal JavaScript code
 */
function generateWingsModalJS(menuData = {}, saucesData = []) {
  return `
    // ==============================================
    // WINGS MODAL FUNCTIONS - COMPLETE IMPLEMENTATION
    // ==============================================

    // Wings Modal State Variables
    let currentWingType = '';
    let selectedWingVariant = null;
    let selectedSauces = [];
    let selectedWingStyle = 'regular';
    let selectedIncludedDips = {};
    let selectedExtraDips = {};
    let saucePreferences = {};
    let noSauceSelected = false;
    let modalWingsData = [];
    let currentModalStep = 1;
    let wingAllocation = {}; // { sauceId: wingCount }

    // Main Wings Modal Functions
    window.openWingModal = function(wingType, wingsData) {
      currentWingType = wingType;
      console.log('openWingModal called with type:', wingType);

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
      noSauceSelected = false;
      wingAllocation = {};

      // Show modal
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';

      // Reset to step 1
      currentModalStep = 1;
      // Ensure layout matches current wing type BEFORE first display (hides step 6 for boneless)
      try { updateModalStepLayout(); } catch (e) { /* no-op */ }
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

      // Do not skip extra dips based on "No Dip"; "No Dip" applies only to included dips

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

      // CRITICAL: Clear order summary from non-final steps to prevent early appearance
      const isFinalStep = (currentWingType === 'boneless' && currentModalStep === 5) ||
                         (currentWingType === 'bone-in' && currentModalStep === 6);

      if (!isFinalStep) {
        // Clear any order summary content that might exist in other steps
        document.querySelectorAll('#orderSummary').forEach(container => {
          if (container && !container.closest('.modal-step.active')) {
            container.innerHTML = '';
          }
        });
      }

      updateModalButtons();
    }

    function loadStepContent() {
      // Update step layout based on wing type
      updateModalStepLayout();

      // Only populate content for the current step
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

    // Step Content Population Functions
    function populateWingVariants() {
      const container = document.getElementById('wingVariants');
      if (!container) return;

      container.innerHTML = modalWingsData.map(variant =>
        '<div class="wing-variant-card ' + (selectedWingVariant && selectedWingVariant.id === variant.id ? 'selected' : '') + '" onclick="selectWingVariant(\\'' + variant.id + '\\');">' +
          '<div class="wing-variant-info">' +
            '<h4>' + variant.count + ' Wings</h4>' +
            '<p>' + variant.description + '</p>' +
            '<div class="wing-variant-price">$' + variant.platformPrice + '</div>' +
          '</div>' +
        '</div>'
      ).join('');

      updateModalButtons();
    }

    window.selectWingVariant = function(variantId) {
      selectedWingVariant = modalWingsData.find(variant => variant.id === variantId);

      // Re-render to show selection
      populateWingVariants();
      updateModalButtons();
    };

    function populateOrderSummary() {
      console.log('🔍 populateOrderSummary called - currentModalStep:', currentModalStep, 'currentWingType:', currentWingType);
      if (!selectedWingVariant) return;

      // CRITICAL: Only populate order summary if we're on the correct final step
      const isFinalStep = (currentWingType === 'boneless' && currentModalStep === 5) ||
                         (currentWingType === 'bone-in' && currentModalStep === 6);

      if (!isFinalStep) {
        console.log('⚠️ populateOrderSummary called on wrong step - ignoring');
        return;
      }

      const wingStyleUpcharge = (currentWingType === 'bone-in' && selectedWingStyle !== 'regular') ? 1.50 : 0;
      const extraDipsTotal = Object.values(selectedExtraDips).reduce((sum, qty) => sum + (qty * 0.75), 0);
      const totalPrice = selectedWingVariant.platformPrice + wingStyleUpcharge + extraDipsTotal;

      // Build summary helpers for dips and labels
      const allSauces = strategicMenu.sauces || firestoreSauces || [];
      const dipCatalog = allSauces.filter(s => s.category === 'dipping-sauce');
      function dipNameById(id) {
        const d = dipCatalog.find(x => x.id === id);
        if (d && d.name) return d.name;
        return (id || '').replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      }
      const maxIncludedDips = Math.max(1, Math.floor(selectedWingVariant.count / 6));
      const noDipChosen = selectedIncludedDips['no-dip'] > 0;
      const includedDipEntries = Object.entries(selectedIncludedDips).filter(([id, qty]) => id !== 'no-dip' && qty > 0);
      const includedDipsHtml = noDipChosen ? '<div style="padding-left: 16px; font-size: 14px; color: #666;">• No dips selected</div>' : (includedDipEntries.length ? includedDipEntries.map(([id, qty]) => '<div style="padding-left: 16px; font-size: 14px; color: #666;">• ' + qty + 'x ' + dipNameById(id) + '</div>').join('') : '');
      const extraDipEntries = Object.entries(selectedExtraDips || {});
      const extraDipsHtml = extraDipEntries.length ? extraDipEntries.map(([id, qty]) => '<div style="padding-left: 16px; font-size: 14px; color: #666;">• ' + qty + 'x ' + dipNameById(id) + ' ($0.75 each)</div>').join('') : '';
      let wingStyleLabel = 'Regular Mix';
      if (currentWingType === 'bone-in') { if (selectedWingStyle === 'all-drums') wingStyleLabel = 'All Drums'; else if (selectedWingStyle === 'all-flats') wingStyleLabel = 'All Flats'; }

      // Find or create a summary container in the active step, and hide any stray extra-dips container
      const activeStep = document.querySelector('.modal-step.active');
      let container = null;
      if (activeStep) {
        const strayExtra = activeStep.querySelector('#extraDipOptions');
        if (strayExtra) { strayExtra.innerHTML = ''; strayExtra.style.display = 'none'; }
        container = activeStep.querySelector('#orderSummary');
        if (!container) {
          container = document.createElement('div');
          container.id = 'orderSummary';
          container.className = 'order-summary';
          activeStep.appendChild(container);
        }
      }
      if (!container) return;

      container.innerHTML =
        '<div style="text-align: left; font-size: 16px; line-height: 1.6;">' +
          '<h4 style="margin-bottom: 16px; color: #1a1a1a; font-size: 20px;">' + selectedWingVariant.count + ' ' + (currentWingType === 'boneless' ? 'Boneless' : 'Bone-In') + ' Wings</h4>' +
          '<div style="background: #f8f9fa; padding: 16px; border-radius: 8px; margin-bottom: 16px;">' +
            '<p style="margin-bottom: 8px; color: #666; display: flex; justify-content: space-between;"><span>Base Price:</span><span>$' + selectedWingVariant.platformPrice.toFixed(2) + '</span></p>' +
            // Generate detailed sauce list with wing allocation
            (selectedSauces.length > 0 ?
              '<div style="margin-bottom: 8px; color: #666;">' +
                '<div style="font-weight: bold; margin-bottom: 4px;">Sauces (' + selectedSauces.length + ' included):</div>' +
                selectedSauces.map(sauceId => {
                  const sauce = (strategicMenu.sauces || firestoreSauces || []).find(s => s.id === sauceId);
                  const isOnSide = saucePreferences[sauceId] && saucePreferences[sauceId].onSide;
                  const sauceName = sauce ? sauce.name : sauceId;

                  let allocation;
                  if (selectedSauces.length === 1) {
                    allocation = selectedWingVariant.count;
                  } else {
                    allocation = wingAllocation[sauceId] || Math.floor(selectedWingVariant.count / selectedSauces.length);
                  }

                  return '<div style="padding-left: 16px; font-size: 14px; color: #666;">' +
                    '• ' + allocation + ' wings with ' + sauceName +
                    (isOnSide ? ' (on the side)' : '') +
                  '</div>';
                }).join('') +
              '</div>'
            : '') +
            // Wing style label (informational)
            (currentWingType === 'bone-in' ?
              '<p style="margin-bottom: 8px; color: #666; display: flex; justify-content: space-between;"><span>Wing Style: ' + wingStyleLabel + '</span>' + (wingStyleUpcharge > 0 ? '<span>+$' + wingStyleUpcharge.toFixed(2) + '</span>' : '<span>Included</span>') + '</p>'
            : '') +
            // Included dips confirmation
            '<div style="margin-bottom: 8px; color: #666;">' +
              '<div style="font-weight: bold; margin-bottom: 4px;">Included Dips (' + (noDipChosen ? 0 : includedDipEntries.reduce((s, [,q]) => s+q, 0)) + ' of ' + maxIncludedDips + '):</div>' +
              (includedDipsHtml || '<div style="padding-left: 16px; font-size: 14px; color: #666;">• None selected</div>') +
            '</div>' +
            // Extra dips pretty names confirmation
            (extraDipEntries.length > 0 ?
              '<div style="margin-bottom: 8px; color: #666;">' +
                '<div style="font-weight: bold; margin-bottom: 4px;">Extra Dips:</div>' +
                extraDipsHtml +
              '</div>' : '') +
          '</div>' +
          '<div style="font-size: 18px; font-weight: bold; color: #ff6b35; text-align: center; padding: 16px; background: white; border: 2px solid #ff6b35; border-radius: 8px;">Total: $' + totalPrice.toFixed(2) + '</div>' +
        '</div>';
    }

    function updateModalButtons() {
      const backBtn = document.getElementById('modalBackBtn');
      const nextBtn = document.getElementById('modalNextBtn');
      const addBtn = document.getElementById('modalAddToCartBtn');

      // Back button visibility
      if (backBtn) backBtn.style.display = currentModalStep > 1 ? 'block' : 'none';

      // Next/Add button logic
      const maxSteps = currentWingType === 'boneless' ? 5 : 6;
      const isLastStep = currentModalStep === maxSteps;

      if (nextBtn) {
        nextBtn.style.display = isLastStep ? 'none' : 'block';

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

      if (addBtn) addBtn.style.display = isLastStep ? 'block' : 'none';
    }

    // Step 4: Enhanced validation for wing allocation
    function validateSauceAllocation() {
      if (noSauceSelected) return true;
      // Must have at least one sauce selected
      if (selectedSauces.length === 0) return false;

      // For single sauce or orders < 12 wings, no allocation needed
      if (selectedSauces.length === 1 || !selectedWingVariant || selectedWingVariant.count < 12) {
        return true;
      }

      // For multiple sauces with 12+ wings, validate allocation in 6-wing units
      const total = selectedWingVariant.count;
      const step = 6;
      // All allocations must be multiples of 6 and >= 6
      for (const sid of selectedSauces) {
        const val = wingAllocation[sid] || 0;
        if (val % step !== 0) return false;
        if (val < step) return false;
      }
      const allocated = selectedSauces.reduce((s, sid) => s + (wingAllocation[sid] || 0), 0);
      return allocated === total;
    }

    // Complete sauce selection implementation
    function populateSauceSelection() {
      // Use real Firestore sauce data (loaded in global variables)
      const sauces = strategicMenu.sauces || firestoreSauces || [];

      const maxSauces = selectedWingVariant ? selectedWingVariant.includedSauces : 1;
      const container = document.getElementById('sauceOptions');
      if (!container) return;

      // Separate sauces by category (exclude dipping sauces)
      const wetSauces = sauces.filter(s => s.category === 'signature-sauce')
        .sort((a, b) => (a.heatLevel || 1) - (b.heatLevel || 1));
      const dryRubs = sauces.filter(s => s.category === 'dry-rub')
        .sort((a, b) => (a.heatLevel || 1) - (b.heatLevel || 1));

      // Build allocation helper header (for 12+ wings, multiple sauces)
      const needsAllocation = !noSauceSelected && selectedWingVariant && selectedWingVariant.count >= 12 && selectedSauces.length > 1;
      const total = selectedWingVariant ? selectedWingVariant.count : 0;
      const allocated = selectedSauces.reduce((s, sid) => s + (wingAllocation[sid] || 0), 0);
      const remaining = Math.max(0, total - allocated);

      // No Sauce quick toggle UI
      const noSauceBtn = '<button onclick="toggleNoSauce()" style="margin:0 0 8px 0; padding:8px 12px; border:1px solid ' + (noSauceSelected ? '#ff6b35' : '#ddd') + '; background:' + (noSauceSelected ? '#ff6b35' : 'white') + '; color:' + (noSauceSelected ? 'white' : '#444') + '; border-radius:6px; font-size:12px;">' + (noSauceSelected ? '✓ No Sauce Selected' : 'No Sauce') + '</button>';

      container.innerHTML =
        '<div style="margin-bottom: 12px; text-align: center; color: #666; font-size: 14px;">Select up to ' + maxSauces + ' sauce' + (maxSauces > 1 ? 's' : '') + ' (included in price)</div>' +
        '<div style="display:flex; justify-content:center;">' + noSauceBtn + '</div>' +
        (needsAllocation ? (
          '<div data-allocation-helper style="display:flex; align-items:center; justify-content:space-between; gap:12px; background:#fff7f3; border:1px solid #ffd5c6; color:#8a4500; padding:8px 12px; border-radius:8px; margin-bottom:12px;">' +
            '<div style="font-size:13px;">Remaining to allocate: <strong>' + remaining + '</strong> of ' + total + ' wings</div>' +
            '<div style="display:flex; gap:8px;">' +
              '<button onclick="equalSplitWings()" style="padding:6px 10px; border:1px solid #ff6b35; background:#ff6b35; color:white; border-radius:6px; font-size:12px; cursor:pointer;">Equal Split</button>' +
              '<button onclick="clearWingAllocations()" style="padding:6px 10px; border:1px solid #ddd; background:white; color:#444; border-radius:6px; font-size:12px; cursor:pointer;">Clear</button>' +
            '</div>' +
          '</div>'
        ) : '') +

        // Two-column layout for sauces
        '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px;">' +

          // Left Column: Dry Rubs
          '<div>' +
            '<h4 style="margin: 0 0 12px 0; color: #1a1a1a; font-size: 16px; font-weight: bold; border-bottom: 2px solid #ff6b35; padding-bottom: 6px;">🧄 Dry Rubs</h4>' +
            dryRubs.map(sauce => {
              const isSelected = selectedSauces.includes(sauce.id);
              const isOnSide = saucePreferences[sauce.id] && saucePreferences[sauce.id].onSide;
              const isDryRub = sauce.isDryRub || sauce.category === 'dry-rub';
              const heatLevel = sauce.heatLevel || 1;
              const heatDisplay = heatLevel <= 1 ? 'Mild' : heatLevel <= 2 ? 'Medium' : heatLevel <= 3 ? 'Hot' : 'Extra Hot';
              const heatColor = heatLevel <= 1 ? '#00b887' : heatLevel <= 2 ? '#ff9500' : heatLevel <= 3 ? '#ff6b35' : '#ff3333';
              const heatEmoji = heatLevel <= 1 ? '🚫🌶️' : '🌶️'.repeat(heatLevel);

              return '<div class="sauce-option" onclick="toggleSauceSelection(\\'' + sauce.id + '\\')" style="display: flex; flex-direction: column; padding: 12px; border: 2px solid ' + (isSelected ? '#ff6b35' : '#e0e0e0') + '; border-radius: 10px; margin-bottom: 10px; cursor: pointer; background: ' + (isSelected ? '#fff5f2' : 'white') + '; transition: all 0.3s ease;">' +
                '<div style="display: flex; align-items: center; justify-content: space-between;">' +
                  '<div style="flex: 1;">' +
                    '<h5 style="margin: 0 0 3px 0; color: #1a1a1a; font-size: 14px; font-weight: bold;">' + sauce.name + '</h5>' +
                    '<p style="margin: 0 0 3px 0; color: #666; font-size: 12px; line-height: 1.2;">' + sauce.description + '</p>' +
                    '<div style="display: flex; align-items: center; gap: 6px;">' +
                      '<span style="font-size: 10px; color: ' + heatColor + '; font-weight: bold;">' + heatEmoji + ' ' + heatDisplay + '</span>' +
                    '</div>' +
                  '</div>' +
                  '<div style="width: 20px; height: 20px; border: 2px solid ' + (isSelected ? '#ff6b35' : '#ddd') + '; border-radius: 50%; background: ' + (isSelected ? '#ff6b35' : 'white') + '; display: flex; align-items: center; justify-content: center;">' +
                    (isSelected ? '<span style="color: white; font-size: 12px; font-weight: bold;">✓</span>' : '') +
                  '</div>' +
                '</div>' +
                // Wing allocation controls for 12+ wing orders with multiple sauces
                (isSelected && selectedWingVariant && selectedWingVariant.count >= 12 && selectedSauces.length > 1 ?
                  '<div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid #eee;">' +
                    '<div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; color: #888;">' +
                      '<span>Wing count:</span>' +
                      '<div style="display: flex; align-items: center; gap: 8px;">' +
                        '<button onclick="event.stopPropagation(); adjustWingAllocation(\\'' + sauce.id + '\\', -1);" style="width: 20px; height: 20px; border: 1px solid #ddd; background: white; border-radius: 3px; font-size: 12px; color: #666; cursor: pointer;">-</button>' +
                        '<span style="min-width: 20px; text-align: center; font-weight: bold;">' + ((wingAllocation[sauce.id] != null ? wingAllocation[sauce.id] : (Math.floor((selectedWingVariant.count/6) / selectedSauces.length) * 6))) + '</span>' +
                        '<button onclick="event.stopPropagation(); adjustWingAllocation(\\'' + sauce.id + '\\', 1);" style="width: 20px; height: 20px; border: 1px solid #ddd; background: white; border-radius: 3px; font-size: 12px; color: #666; cursor: pointer;">+</button>' +
                      '</div>' +
                    '</div>' +
                  '</div>'
                  : '') +
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

              return '<div class="sauce-option" onclick="toggleSauceSelection(\\'' + sauce.id + '\\')" style="display: flex; flex-direction: column; padding: 12px; border: 2px solid ' + (isSelected ? '#ff6b35' : '#e0e0e0') + '; border-radius: 10px; margin-bottom: 10px; cursor: pointer; background: ' + (isSelected ? '#fff5f2' : 'white') + '; transition: all 0.3s ease;">' +
                '<div style="display: flex; align-items: center; justify-content: space-between;">' +
                  '<div style="flex: 1;">' +
                    '<h5 style="margin: 0 0 3px 0; color: #1a1a1a; font-size: 14px; font-weight: bold;">' + sauce.name + '</h5>' +
                    '<p style="margin: 0 0 3px 0; color: #666; font-size: 12px; line-height: 1.2;">' + sauce.description + '</p>' +
                    '<div style="display: flex; align-items: center; gap: 6px;">' +
                      '<span style="font-size: 10px; color: ' + heatColor + '; font-weight: bold;">' + heatEmoji + ' ' + heatDisplay + '</span>' +
                    '</div>' +
                  '</div>' +
                  '<div style="width: 20px; height: 20px; border: 2px solid ' + (isSelected ? '#ff6b35' : '#ddd') + '; border-radius: 50%; background: ' + (isSelected ? '#ff6b35' : 'white') + '; display: flex; align-items: center; justify-content: center;">' +
                    (isSelected ? '<span style="color: white; font-size: 12px; font-weight: bold;">✓</span>' : '') +
                  '</div>' +
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
                // Wing allocation controls for 12+ wing orders with multiple sauces
                (isSelected && selectedWingVariant && selectedWingVariant.count >= 12 && selectedSauces.length > 1 ?
                  '<div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid #eee;">' +
                    '<div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; color: #888;">' +
                      '<span>Wing count:</span>' +
                      '<div style="display: flex; align-items: center; gap: 8px;">' +
                        '<button onclick="event.stopPropagation(); adjustWingAllocation(\\'' + sauce.id + '\\', -1);" style="width: 20px; height: 20px; border: 1px solid #ddd; background: white; border-radius: 3px; font-size: 12px; color: #666; cursor: pointer;">-</button>' +
                        '<span style="min-width: 20px; text-align: center; font-weight: bold;">' + ((wingAllocation[sauce.id] != null ? wingAllocation[sauce.id] : (Math.floor((selectedWingVariant.count/6) / selectedSauces.length) * 6))) + '</span>' +
                        '<button onclick="event.stopPropagation(); adjustWingAllocation(\\'' + sauce.id + '\\', 1);" style="width: 20px; height: 20px; border: 1px solid #ddd; background: white; border-radius: 3px; font-size: 12px; color: #666; cursor: pointer;">+</button>' +
                      '</div>' +
                    '</div>' +
                  '</div>'
                  : '') +
              '</div>';
            }).join('') +
          '</div>' +
        '</div>';
    }

    // Sauce selection handler
    window.toggleSauceSelection = function(sauceId) {
      const maxSauces = selectedWingVariant ? selectedWingVariant.includedSauces : 1;

      if (selectedSauces.includes(sauceId)) {
        // Remove sauce
        selectedSauces = selectedSauces.filter(id => id !== sauceId);
        delete saucePreferences[sauceId];
        delete wingAllocation[sauceId];
      } else if (selectedSauces.length < maxSauces) {
        // Add sauce
        selectedSauces.push(sauceId);
        noSauceSelected = false;

        // Initialize sauce preferences
        if (!saucePreferences[sauceId]) {
          saucePreferences[sauceId] = { selected: true, onSide: false };
        } else {
          saucePreferences[sauceId].selected = true;
        }

        // For 12+ wings with multiple sauces, initialize allocation
        if (selectedWingVariant && selectedWingVariant.count >= 12 && selectedSauces.length > 1) {
          // Redistribute wings evenly in 6-wing units
          equalSplitWings();
        }
      } else {
        alert('Maximum ' + maxSauces + ' sauce' + (maxSauces > 1 ? 's' : '') + ' allowed');
        return;
      }

      // Re-render sauce selection with delay to ensure state updates
      setTimeout(() => {
        populateSauceSelection();
        updateWingAllocationFeedback();
        updateModalButtons();
      }, 100);
    };

    // Handle "on the side" toggle for sauces (Step 2 enhancement)
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
    };

    // No Sauce toggle: clear sauces and jump to Dips
    window.toggleNoSauce = function() {
      noSauceSelected = !noSauceSelected;
      if (noSauceSelected) {
        selectedSauces = [];
        saucePreferences = {};
        wingAllocation = {};

        // Jump to Dips (Step 3)
        currentModalStep = 3;
        updateModalDisplay();
        loadStepContent();
        updateModalButtons();
      } else {
        // Return to sauces selection state
        currentModalStep = 2;
        updateModalDisplay();
        loadStepContent();
        updateModalButtons();
      }
    };

    // Handle wing allocation adjustments for 12+ wing orders
    window.adjustWingAllocation = function(sauceId, change) {
      if (!selectedWingVariant || selectedWingVariant.count < 12 || selectedSauces.length <= 1) return;

      const step = 6;
      const totalWings = selectedWingVariant.count;
      const currentAllocation = wingAllocation[sauceId] || step;
      const newAllocation = Math.max(step, currentAllocation + (change > 0 ? step : -step));

      // Calculate total allocated wings excluding this sauce
      const otherAllocations = selectedSauces
        .filter(sid => sid !== sauceId)
        .reduce((sum, sid) => sum + (wingAllocation[sid] || 0), 0);

      // Don't allow allocation that exceeds total wings
      if (otherAllocations + newAllocation > totalWings) {
        alert('Cannot allocate more than ' + totalWings + ' total wings');
        return;
      }

      wingAllocation[sauceId] = newAllocation;

      // Re-render sauce selection to show updated allocation
      populateSauceSelection();
      updateWingAllocationFeedback();
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
        '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">' +
          includedDips.map(dip => {
            const isSelected = selectedIncludedDips[dip.id] > 0;
            const quantity = selectedIncludedDips[dip.id] || 0;
            const isNoDip = dip.id === 'no-dip';

            return '<div class="dip-option ' + (isSelected ? 'selected' : '') + '" style="border: 2px solid ' + (isSelected ? '#ff6b35' : '#e0e0e0') + '; border-radius: 12px; padding: 16px; text-align: center; cursor: pointer; background: ' + (isSelected ? '#fff5f2' : 'white') + '; transition: all 0.3s ease; opacity: ' + (isNoDip || !noDipSelected ? '1' : '0.5') + ';">' +
              '<h4 style="margin: 0 0 8px 0; color: #1a1a1a; font-size: 16px;">' + dip.name + '</h4>' +
              '<p style="margin: 0 0 12px 0; color: #666; font-size: 13px; line-height: 1.3;">' + dip.description + '</p>' +
              (isNoDip ?
                '<button onclick="toggleNoDip()" style="width: 100%; padding: 8px; border: 1px solid ' + (isSelected ? '#ff6b35' : '#ddd') + '; background: ' + (isSelected ? '#ff6b35' : 'white') + '; color: ' + (isSelected ? 'white' : '#666') + '; border-radius: 6px; font-size: 14px; cursor: pointer;">' +
                  (isSelected ? '✓ Selected' : 'Select') +
                '</button>'
                :
                '<div style="display: flex; align-items: center; justify-content: center; gap: 12px; ' + (noDipSelected ? 'opacity: 0.3; pointer-events: none;' : '') + '">' +
                  '<button onclick="adjustIncludedDipQuantity(\\'' + dip.id + '\\', -1)" style="width: 30px; height: 30px; border: 1px solid #ddd; background: white; border-radius: 6px; font-size: 16px; color: #666; cursor: pointer;">-</button>' +
                  '<span style="min-width: 30px; text-align: center; font-weight: bold; font-size: 16px;">' + quantity + '</span>' +
                  '<button onclick="adjustIncludedDipQuantity(\\'' + dip.id + '\\', 1)" style="width: 30px; height: 30px; border: 1px solid #ddd; background: white; border-radius: 6px; font-size: 16px; color: #666; cursor: pointer;">+</button>' +
                '</div>'
              ) +
            '</div>';
          }).join('') +
        '</div>';
    }

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
              '<p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">All flat wing pieces</p>' +
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
      // Prefer container within the active step to avoid writing into hidden steps
      const activeStep = document.querySelector('.modal-step.active');
      let container = null;
      if (activeStep) {
        container = activeStep.querySelector('#extraDipOptions') || activeStep.querySelector('#wingStyleOptions');
      }
      // Fallback for safety (should rarely be needed)
      if (!container) {
        container = document.getElementById('extraDipOptions') || document.getElementById('wingStyleOptions');
      }
      if (!container) return;
      container.style.display = 'block';

      // Build extra dips from Firestore dipping sauces if available; otherwise fallback list
      const allSauces = (typeof strategicMenu !== 'undefined' && strategicMenu.sauces) ? strategicMenu.sauces : (typeof firestoreSauces !== 'undefined' ? firestoreSauces : []);
      const dipsFromFirestore = (allSauces || []).filter(function(s){ return s.category === 'dipping-sauce'; }).map(function(s){
        return { id: s.id, name: s.name || s.id, price: 0.75 };
      });
      const extraDips = dipsFromFirestore.length ? dipsFromFirestore : [
        { id: 'extra_ranch', name: 'Extra Ranch', price: 0.75 },
        { id: 'extra_blue_cheese', name: 'Extra Blue Cheese', price: 0.75 },
        { id: 'extra_honey_mustard', name: 'Extra Honey Mustard', price: 0.75 },
        { id: 'extra_cheese_sauce', name: 'Extra Cheese Sauce', price: 0.75 }
      ];

      const noExtraBtn = '<button onclick="skipExtraDips()" style="margin:0 0 12px 0; padding:8px 12px; border:1px solid #ddd; background:white; color:#444; border-radius:6px; font-size:12px;">No Extra Dips</button>';

      container.innerHTML =
        '<div style="margin-bottom: 12px; text-align: center; color: #666; font-size: 14px;">Add extra dips ($0.75 each)</div>' +
        '<div style="display:flex; justify-content:center;">' + noExtraBtn + '</div>' +
        '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">' +
          extraDips.map(function(dip){
            const quantity = selectedExtraDips[dip.id] || 0;
            const isSelected = quantity > 0;
            return (
              '<div class="extra-dip-option ' + (isSelected ? 'selected' : '') + '" style="border: 2px solid ' + (isSelected ? '#ff6b35' : '#e0e0e0') + '; border-radius: 12px; padding: 16px; text-align: center; cursor: pointer; background: ' + (isSelected ? '#fff5f2' : 'white') + '; transition: all 0.3s ease;">' +
                '<h4 style="margin: 0 0 8px 0; color: #1a1a1a; font-size: 16px;">' + dip.name + '</h4>' +
                '<p style="margin: 0 0 12px 0; color: #666; font-size: 13px;">$' + dip.price.toFixed(2) + ' each</p>' +
                '<div style="display: flex; align-items: center; justify-content: center; gap: 12px;">' +
                  '<button onclick="adjustExtraDipQuantity(\\'' + dip.id + '\\', -1)" style="width: 30px; height: 30px; border: 1px solid #ddd; background: white; border-radius: 6px; font-size: 16px; color: #666; cursor: pointer;">-</button>' +
                  '<span style="min-width: 30px; text-align: center; font-weight: bold; font-size: 16px;">' + quantity + '</span>' +
                  '<button onclick="adjustExtraDipQuantity(\\'' + dip.id + '\\', 1)" style="width: 30px; height: 30px; border: 1px solid #ddd; background: white; border-radius: 6px; font-size: 16px; color: #666; cursor: pointer;">+</button>' +
                '</div>' +
              '</div>'
            );
          }).join('') +
        '</div>';
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

    // Skip extra dips: clear and advance to next appropriate step
    window.skipExtraDips = function() {
      selectedExtraDips = {};
      const finalStep = (currentWingType === 'bone-in') ? 6 : 5;
      currentModalStep = finalStep;
      updateModalDisplay();
      loadStepContent();
      updateModalButtons();
    };

    function updateWingAllocationFeedback() {
      const container = document.getElementById('sauceOptions');
      if (!container || !selectedWingVariant) return;
      if (!(selectedWingVariant.count >= 12 && selectedSauces.length > 1)) return;

      const total = selectedWingVariant.count;
      const allocated = selectedSauces.reduce((s, sid) => s + (wingAllocation[sid] || 0), 0);
      const remaining = Math.max(0, total - allocated);

      // Find the helper bar we injected just before the sauce grids
      const helper = container.querySelector('[data-allocation-helper]');
      // No-op if not present (rendered above inline already)
    }

    // Equal split helper – divides wings into 6-wing units across selected sauces
    window.equalSplitWings = function() {
      if (!selectedWingVariant || selectedWingVariant.count < 12 || selectedSauces.length <= 1) return;
      const step = 6;
      const total = selectedWingVariant.count;
      const units = Math.floor(total / step);
      const baseUnits = Math.floor(units / selectedSauces.length);
      let remainder = units - (baseUnits * selectedSauces.length);
      selectedSauces.forEach(sid => {
        const allocUnits = baseUnits + (remainder > 0 ? 1 : 0);
        if (remainder > 0) remainder--;
        wingAllocation[sid] = Math.max(step, allocUnits * step);
      });
      populateSauceSelection();
      updateWingAllocationFeedback();
      updateModalButtons();
    };

    // Clear allocations helper
    window.clearWingAllocations = function() {
      wingAllocation = {};
      populateSauceSelection();
      updateWingAllocationFeedback();
      updateModalButtons();
    };

    // buildWingOrderPayload and addWingOrderToCart are provided by shared orchestrators

    // Handle included dip quantity adjustments
    window.adjustIncludedDipQuantity = function(dipId, change) {
      const maxDips = selectedWingVariant ? Math.floor(selectedWingVariant.count / 6) : 1;
      const totalDipsSelected = Object.values(selectedIncludedDips).reduce((sum, q) => sum + q, 0);

      // Skip if "No Dip" is selected
      if (selectedIncludedDips['no-dip'] > 0) return;

      if (change > 0) {
        // Adding a dip
        if (totalDipsSelected >= maxDips) {
          alert('Maximum ' + maxDips + ' dip' + (maxDips > 1 ? 's' : '') + ' allowed');
          return;
        }
        selectedIncludedDips[dipId] = (selectedIncludedDips[dipId] || 0) + 1;
      } else {
        // Removing a dip
        const currentQuantity = selectedIncludedDips[dipId] || 0;
        const newQuantity = Math.max(0, currentQuantity + change);

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

    // Utility function to generate wing variants from menu data
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
            includedSauces: Math.max(1, Math.floor(variant.count / 6)), // 1 sauce per 6 wings
            description: variant.description || (variant.count + ' fresh ' + (wingType === 'boneless' ? 'boneless' : 'bone-in') + ' wings')
          }))
          .sort((a, b) => a.count - b.count); // Sort by wing count
      }

      // Fallback to correct default variants with proper DoorDash pricing
      console.warn('No Firestore wings data available, using corrected fallback variants for', wingType);
      if (wingType === 'boneless') {
        return [
          { id: 'wings_6_boneless', name: '6 Wings (Boneless)', count: 6, platformPrice: 9.44, includedSauces: 1, description: '6 fresh boneless wings' },
          { id: 'wings_12_boneless', name: '12 Wings (Boneless)', count: 12, platformPrice: 16.19, includedSauces: 2, description: '12 fresh boneless wings' },
          { id: 'wings_24_boneless', name: '24 Wings (Boneless)', count: 24, platformPrice: 28.34, includedSauces: 4, description: '24 fresh boneless wings' },
          { id: 'wings_30_boneless', name: '30 Wings (Boneless)', count: 30, platformPrice: 35.09, includedSauces: 5, description: '30 fresh boneless wings' },
          { id: 'wings_50_boneless', name: '50 Wings (Boneless)', count: 50, platformPrice: 53.99, includedSauces: 8, description: '50 fresh boneless wings' }
        ];
      } else {
        return [
          { id: 'wings_6_bonein', name: '6 Wings (Bone-In)', count: 6, platformPrice: 12.14, includedSauces: 1, description: '6 fresh bone-in wings' },
          { id: 'wings_12_bonein', name: '12 Wings (Bone-In)', count: 12, platformPrice: 20.24, includedSauces: 2, description: '12 fresh bone-in wings' },
          { id: 'wings_24_bonein', name: '24 Wings (Bone-In)', count: 24, platformPrice: 35.09, includedSauces: 4, description: '24 fresh bone-in wings' },
          { id: 'wings_30_bonein', name: '30 Wings (Bone-In)', count: 30, platformPrice: 44.54, includedSauces: 5, description: '30 fresh bone-in wings' },
          { id: 'wings_50_bonein', name: '50 Wings (Bone-In)', count: 50, platformPrice: 67.49, includedSauces: 8, description: '50 fresh bone-in wings' }
        ];
      }
      if (addBtn) {
        addBtn.style.display = isLastStep ? 'block' : 'none';
        addBtn.disabled = !isLastStep;
      }
    }

    console.log('🚀 Wings Modal module loaded successfully');
  `;
}

module.exports = {
  generateWingsModalJS
};
