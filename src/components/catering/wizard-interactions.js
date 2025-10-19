/**
 * Wizard Interaction Logic
 * Handles step navigation, form validation, and user selections
 */

import { wizardState } from './guided-planner.js';

export function initWizardInteractions(packages, sauces, addOns) {
  // Navigation buttons
  const nextBtn = document.getElementById('wizard-next');
  const prevBtn = document.getElementById('wizard-prev');

  if (nextBtn) {
    nextBtn.addEventListener('click', () => handleNextStep(packages, sauces, addOns));
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', handlePrevStep);
  }

  // Step 1: Event Details
  initStep1Interactions();

  // Step 2: Package Selection
  initStep2Interactions(packages);

  // Step 3: Sauce Selection
  initStep3Interactions(sauces);

  // Step 4: Add-ons
  initStep4Interactions(addOns);

  // Step 5: Review & Submit
  initStep5Interactions();
}

/**
 * Step 1: Event Details Interactions
 */
function initStep1Interactions() {
  // Guest count selection
  const guestCountButtons = document.querySelectorAll('.guest-count-option');
  guestCountButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      guestCountButtons.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      wizardState.eventDetails.guestCount = parseInt(btn.dataset.count);
    });
  });

  // Event type selection
  const eventTypeCards = document.querySelectorAll('.event-type-card');
  eventTypeCards.forEach(card => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      eventTypeCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      wizardState.eventDetails.eventType = card.dataset.type;
    });
  });

  // Event date selection
  const eventDateInput = document.getElementById('event-date');
  if (eventDateInput) {
    eventDateInput.addEventListener('change', (e) => {
      wizardState.eventDetails.eventDate = e.target.value;
    });
  }
}

/**
 * Step 2: Package Selection Interactions
 */
function initStep2Interactions(packages) {
  const packageCards = document.querySelectorAll('.btn-select-package');
  packageCards.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const packageId = btn.dataset.packageId;
      const selectedPkg = packages.find(p => p.id === packageId);

      if (selectedPkg) {
        // Update selection state
        document.querySelectorAll('.package-card').forEach(card => {
          card.classList.remove('selected');
        });
        btn.closest('.package-card').classList.add('selected');

        // Save to wizard state
        wizardState.selectedPackage = selectedPkg;

        // Auto-advance after selection
        setTimeout(() => handleNextStep(packages), 300);
      }
    });
  });
}

/**
 * Step 3: Sauce Selection Interactions
 */
function initStep3Interactions(sauces) {
  const sauceButtons = document.querySelectorAll('.btn-select-sauce');
  sauceButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const sauceId = btn.dataset.sauceId;
      const sauce = sauces.find(s => s.id === sauceId);
      const maxSauces = wizardState.selectedPackage?.sauceCount || 3;

      if (!sauce) return;

      // Check if already selected
      const existingIndex = wizardState.sauceSelections.findIndex(s => s.id === sauceId);

      if (existingIndex >= 0) {
        // Remove selection
        wizardState.sauceSelections.splice(existingIndex, 1);
        btn.closest('.sauce-card').classList.remove('selected');
        btn.textContent = 'Select';
      } else {
        // Add selection if under limit
        if (wizardState.sauceSelections.length < maxSauces) {
          wizardState.sauceSelections.push(sauce);
          btn.closest('.sauce-card').classList.add('selected');
          btn.textContent = '✓ Selected';
        } else {
          alert(`You can only select ${maxSauces} sauces for this package`);
        }
      }

      updateSauceCounter(maxSauces);
    });
  });
}

/**
 * Update sauce selection counter
 */
function updateSauceCounter(maxSauces) {
  const countSpan = document.getElementById('sauce-count');
  const maxSpan = document.getElementById('sauce-max');
  const selectedList = document.getElementById('selected-sauces');

  if (countSpan) countSpan.textContent = wizardState.sauceSelections.length;
  if (maxSpan) maxSpan.textContent = maxSauces;

  if (selectedList) {
    selectedList.innerHTML = wizardState.sauceSelections.map(sauce => `
      <span class="sauce-tag">${sauce.name}</span>
    `).join('');
  }
}

/**
 * Step 4: Add-ons Interactions
 */
function initStep4Interactions(addOns) {
  const addonButtons = document.querySelectorAll('.btn-toggle-addon');
  addonButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const addonId = btn.dataset.addonId;
      const addon = addOns.find(a => a.id === addonId);

      if (!addon) return;

      const existingIndex = wizardState.addOns.findIndex(a => a.id === addonId);

      if (existingIndex >= 0) {
        // Remove addon
        wizardState.addOns.splice(existingIndex, 1);
        btn.closest('.addon-card').classList.remove('selected');
        btn.querySelector('.addon-add').style.display = '';
        btn.querySelector('.addon-remove').style.display = 'none';
      } else {
        // Add addon
        wizardState.addOns.push(addon);
        btn.closest('.addon-card').classList.add('selected');
        btn.querySelector('.addon-add').style.display = 'none';
        btn.querySelector('.addon-remove').style.display = '';
      }
    });
  });

  // Skip button
  const skipBtn = document.getElementById('skip-addons');
  if (skipBtn) {
    skipBtn.addEventListener('click', (e) => {
      e.preventDefault();
      handleNextStep();
    });
  }
}

/**
 * Step 5: Review & Submit Interactions
 */
function initStep5Interactions() {
  const submitBtn = document.getElementById('submit-quote-request');
  if (submitBtn) {
    submitBtn.addEventListener('click', handleSubmitQuote);
  }
}

/**
 * Handle next step navigation
 */
function handleNextStep(packages, sauces, addOns) {
  // Validate current step
  if (!validateCurrentStep()) {
    return;
  }

  // Move to next step
  const currentStep = wizardState.currentStep;
  const nextStep = currentStep + 1;

  if (nextStep <= wizardState.totalSteps) {
    // Hide current step
    const currentStepEl = document.getElementById(`step-${currentStep}`);
    if (currentStepEl) currentStepEl.style.display = 'none';

    // Show next step
    const nextStepEl = document.getElementById(`step-${nextStep}`);
    if (nextStepEl) nextStepEl.style.display = 'block';

    // Update state
    wizardState.currentStep = nextStep;

    // Update progress indicator
    updateProgressIndicator();

    // Update navigation buttons
    updateNavigationButtons();

    // Prepare step-specific content
    prepareStepContent(nextStep, packages, sauces, addOns);

    // Scroll to top of wizard
    document.getElementById('catering-planner')?.scrollIntoView({ behavior: 'smooth' });
  }
}

/**
 * Handle previous step navigation
 */
function handlePrevStep() {
  const currentStep = wizardState.currentStep;
  const prevStep = currentStep - 1;

  if (prevStep >= 1) {
    // Hide current step
    const currentStepEl = document.getElementById(`step-${currentStep}`);
    if (currentStepEl) currentStepEl.style.display = 'none';

    // Show previous step
    const prevStepEl = document.getElementById(`step-${prevStep}`);
    if (prevStepEl) prevStepEl.style.display = 'block';

    // Update state
    wizardState.currentStep = prevStep;

    // Update progress indicator
    updateProgressIndicator();

    // Update navigation buttons
    updateNavigationButtons();

    // Scroll to top
    document.getElementById('catering-planner')?.scrollIntoView({ behavior: 'smooth' });
  }
}

/**
 * Validate current step before proceeding
 */
function validateCurrentStep() {
  const step = wizardState.currentStep;

  switch (step) {
    case 1: // Event Details
      if (!wizardState.eventDetails.guestCount) {
        alert('Please select the number of guests');
        return false;
      }
      if (!wizardState.eventDetails.eventType) {
        alert('Please select your event type');
        return false;
      }
      if (!wizardState.eventDetails.eventDate) {
        alert('Please select your event date');
        return false;
      }
      return true;

    case 2: // Package Selection
      if (!wizardState.selectedPackage) {
        alert('Please select a package');
        return false;
      }
      return true;

    case 3: // Sauce Selection
      const maxSauces = wizardState.selectedPackage?.sauceCount || 3;
      if (wizardState.sauceSelections.length !== maxSauces) {
        alert(`Please select exactly ${maxSauces} sauces`);
        return false;
      }
      return true;

    case 4: // Add-ons (optional)
      return true;

    case 5: // Review & Contact (validated on submit)
      return true;

    default:
      return true;
  }
}

/**
 * Update progress indicator visual state
 */
function updateProgressIndicator() {
  const steps = document.querySelectorAll('.progress-step');
  steps.forEach((step, index) => {
    const stepNum = index + 1;
    step.classList.remove('active', 'completed');

    if (stepNum === wizardState.currentStep) {
      step.classList.add('active');
    } else if (stepNum < wizardState.currentStep) {
      step.classList.add('completed');
    }
  });
}

/**
 * Update navigation button states
 */
function updateNavigationButtons() {
  const nextBtn = document.getElementById('wizard-next');
  const prevBtn = document.getElementById('wizard-prev');

  // Show/hide previous button
  if (prevBtn) {
    prevBtn.style.display = wizardState.currentStep > 1 ? 'inline-block' : 'none';
  }

  // Update next button text
  if (nextBtn) {
    if (wizardState.currentStep === wizardState.totalSteps) {
      nextBtn.style.display = 'none'; // Hide on last step (has submit button instead)
    } else {
      nextBtn.style.display = 'inline-block';
      nextBtn.textContent = 'Continue →';
    }
  }
}

/**
 * Prepare step-specific content when entering a step
 */
function prepareStepContent(stepNum, packages, sauces, addOns) {
  switch (stepNum) {
    case 2: // Package Selection
      // Update recommendation text based on guest count
      const recommendationEl = document.getElementById('package-recommendation');
      if (recommendationEl) {
        const count = wizardState.eventDetails.guestCount;
        recommendationEl.textContent = `Based on ${count} guests, here are our recommended packages:`;
      }

      // Filter/highlight packages based on guest count
      filterPackagesByGuestCount(packages);
      break;

    case 3: // Sauce Selection
      // Update instruction text
      const instructionEl = document.getElementById('sauce-instruction');
      if (instructionEl) {
        const maxSauces = wizardState.selectedPackage?.sauceCount || 3;
        instructionEl.textContent = `Select ${maxSauces} sauce flavors for your ${wizardState.selectedPackage?.name}`;
        updateSauceCounter(maxSauces);
      }
      break;

    case 5: // Review & Contact
      populateOrderSummary();
      break;
  }
}

/**
 * Filter packages by guest count
 */
function filterPackagesByGuestCount(packages) {
  const guestCount = wizardState.eventDetails.guestCount;
  const packageCards = document.querySelectorAll('.package-card');

  packageCards.forEach(card => {
    const packageId = card.dataset.packageId;
    const pkg = packages.find(p => p.id === packageId);

    if (pkg) {
      // Check if package is suitable for guest count
      const isSuitable = guestCount >= pkg.servesMin && guestCount <= pkg.servesMax;

      if (isSuitable) {
        card.style.opacity = '1';
        card.style.order = '1'; // Move to front
      } else {
        card.style.opacity = '0.6';
        card.style.order = '2'; // Move to back
      }
    }
  });
}

/**
 * Populate order summary on step 5
 */
function populateOrderSummary() {
  // Event details
  const eventSummary = document.getElementById('summary-event');
  if (eventSummary) {
    const { guestCount, eventType, eventDate } = wizardState.eventDetails;
    eventSummary.innerHTML = `
      <p><strong>Guests:</strong> ${guestCount} people</p>
      <p><strong>Event:</strong> ${formatEventType(eventType)}</p>
      <p><strong>Date:</strong> ${formatDate(eventDate)}</p>
    `;
  }

  // Package
  const packageSummary = document.getElementById('summary-package');
  if (packageSummary && wizardState.selectedPackage) {
    const pkg = wizardState.selectedPackage;
    packageSummary.innerHTML = `
      <p><strong>${pkg.name}</strong></p>
      <p>${pkg.totalWings} wings serving ${pkg.servesMin}-${pkg.servesMax} people</p>
    `;
  }

  // Sauces
  const saucesSummary = document.getElementById('summary-sauces');
  if (saucesSummary) {
    saucesSummary.innerHTML = wizardState.sauceSelections.map(sauce => `
      <span class="summary-tag">${sauce.name}</span>
    `).join('');
  }

  // Add-ons
  if (wizardState.addOns.length > 0) {
    const addonsSection = document.getElementById('summary-addons-section');
    const addonsSummary = document.getElementById('summary-addons');

    if (addonsSection) addonsSection.style.display = 'block';
    if (addonsSummary) {
      addonsSummary.innerHTML = wizardState.addOns.map(addon => `
        <span class="summary-tag">${addon.name}</span>
      `).join('');
    }
  }
}

/**
 * Handle quote request submission
 */
async function handleSubmitQuote(e) {
  e.preventDefault();

  // Validate contact form
  const name = document.getElementById('contact-name')?.value.trim();
  const email = document.getElementById('contact-email')?.value.trim();
  const phone = document.getElementById('contact-phone')?.value.trim();

  if (!name || !email || !phone) {
    alert('Please fill in all required contact fields');
    return;
  }

  // Collect contact info
  wizardState.contactInfo = {
    name,
    email,
    phone,
    company: document.getElementById('contact-company')?.value.trim() || '',
    notes: document.getElementById('contact-notes')?.value.trim() || ''
  };

  // TODO: Submit to backend/Firestore
  console.log('Quote request submitted:', wizardState);

  // Show success message
  showSuccessMessage();
}

/**
 * Show success message after submission
 */
function showSuccessMessage() {
  const plannerSection = document.getElementById('catering-planner');
  if (plannerSection) {
    plannerSection.innerHTML = `
      <div class="success-message">
        <div class="success-icon">✓</div>
        <h2>Thank You!</h2>
        <p class="success-text">We've received your catering request and will contact you within 2 hours.</p>
        <div class="success-details">
          <p><strong>What's Next:</strong></p>
          <ul>
            <li>We'll review your selections and prepare a detailed quote</li>
            <li>You'll receive pricing and availability via email</li>
            <li>We'll call to finalize details and answer any questions</li>
          </ul>
        </div>
        <div class="success-actions">
          <a href="/" class="btn-primary">Return Home</a>
          <a href="tel:+12673763113" class="btn-secondary">Call Us Now</a>
        </div>
      </div>
    `;
  }
}

/**
 * Helper formatting functions
 */
function formatEventType(type) {
  const types = {
    'office-lunch': 'Office Lunch',
    'game-day': 'Game Day Party',
    'celebration': 'Team Celebration',
    'client-meeting': 'Client Meeting',
    'school-event': 'School Event',
    'other': 'Other Event'
  };
  return types[type] || type;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}
