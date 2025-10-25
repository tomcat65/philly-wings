/**
 * Wizard Interaction Logic
 * Handles step navigation, form validation, and user selections
 */

import { wizardState } from './guided-planner.js';
import { getRecommendations } from '../../utils/recommendations.js';

// ==================== RECOMMENDATION ENGINE ====================

// Map internal event type codes to display labels
const EVENT_TYPE_MAP = {
  'office-lunch': 'Office Lunch',
  'game-day': 'Game Day Party',
  'celebration': 'Team Celebration',
  'client-meeting': 'Client Meeting',
  'school-event': 'School Event',
  'other': 'Other Event'
};

// Theme weights for each event type (using internal codes)
const EVENT_TYPE_WEIGHTS = {
  'game-day': { sports: 20, crowd: 10 },
  'celebration': { celebration: 15, crowd: 5 },
  'office-lunch': { corporate: 15, classic: 10 },
  'client-meeting': { premium: 20, corporate: 10 },
  'school-event': { crowd: 15, budget: 10 },
  'other': { classic: 5 }
};

// Context-aware messaging per event type (using internal codes)
const RECOMMENDATION_COPY = {
  'game-day': {
    intro: '🏈 Game day ready!',
    reason: 'perfect for sports viewing parties'
  },
  'office-lunch': {
    intro: '💼 Professional catering',
    reason: 'ideal for workplace events'
  },
  'client-meeting': {
    intro: '✨ Impress your clients',
    reason: 'premium presentation for important meetings'
  },
  'celebration': {
    intro: '🎉 Celebration worthy!',
    reason: 'great for team milestones'
  },
  'school-event': {
    intro: '📚 Perfect for schools',
    reason: 'crowd-friendly and budget-conscious'
  },
  'other': {
    intro: '👍 Great choice!',
    reason: 'versatile option for any occasion'
  }
};

const DEBUG_RECOMMENDATIONS = true; // Toggle for development

/**
 * Normalize various event type inputs to internal codes
 */
function normalizeEventType(rawType) {
  if (!rawType) return 'other';

  // Already a known internal code
  if (EVENT_TYPE_WEIGHTS[rawType] || EVENT_TYPE_MAP[rawType]) {
    return rawType;
  }

  const trimmed = rawType.trim();

  // Attempt to match display labels (case-insensitive)
  const displayMatch = Object.entries(EVENT_TYPE_MAP)
    .find(([, label]) => label.toLowerCase() === trimmed.toLowerCase());
  if (displayMatch) {
    return displayMatch[0];
  }

  // General fallback: lower-case and replace non letters/numbers with hyphen
  const slug = trimmed
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (EVENT_TYPE_WEIGHTS[slug] || EVENT_TYPE_MAP[slug]) {
    return slug;
  }

  return 'other';
}

/**
 * Main recommendation engine - scores and ranks packages
 */
function recommendPackages(packages, guestCount, eventType) {
  if (!packages || packages.length === 0) {
    console.warn('❌ No packages available for recommendation');
    return [];
  }

  if (!guestCount || guestCount < 1) {
    console.warn('⚠️ Invalid guest count:', guestCount);
    return packages.map(pkg => ({ pkg, score: 0 }));
  }

  const normalizedEventType = normalizeEventType(eventType);

  const results = packages
    .map(pkg => {
      const sizeScore = scoreSizeFit(pkg, guestCount);
      const themeScore = scoreEventType(pkg, normalizedEventType);
      const popularityBonus = pkg.popular ? 5 : 0;
      const total = sizeScore + themeScore + popularityBonus;

      if (DEBUG_RECOMMENDATIONS) {
        console.log(`📊 ${pkg.name}:`, {
          size: sizeScore,
          theme: themeScore,
          popular: popularityBonus,
          total,
          themes: pkg.themes,
          servesRange: `${pkg.servesMin}-${pkg.servesMax}`,
          guestCount
        });
        if (!pkg.themes || pkg.themes.length === 0) {
          console.warn(`⚠️ Package ${pkg.name} has no themes array!`);
        }
      }

      return { pkg, score: total };
    })
    .sort((a, b) => b.score - a.score);

  if (DEBUG_RECOMMENDATIONS) {
    console.log('🏆 Winner:', results[0]?.pkg.name, `(${results[0]?.score} pts)`);
  }

  return results;
}

/**
 * Score how well package capacity matches guest count
 * Returns 0-50 points
 */
function scoreSizeFit(pkg, guestCount) {
  const { servesMin, servesMax } = pkg;

  if (!servesMin || !servesMax) {
    console.warn(`⚠️ Package ${pkg.name} missing servesMin/servesMax`);
    return 0;
  }

  // Perfect fit: within capacity range
  if (guestCount >= servesMin && guestCount <= servesMax) {
    const range = servesMax - servesMin;

    // Wide range (50+) = scalable packages (boxed lunches) = perfect score
    // Customer can order exactly the number they need
    if (range >= 50) {
      return 50;
    }

    // Narrow range = fixed platters, score by proximity to midpoint
    const midpoint = (servesMin + servesMax) / 2;
    return 50 - Math.abs(midpoint - guestCount);
  }

  // Under capacity: penalize gap
  if (guestCount < servesMin) {
    const gap = servesMin - guestCount;
    return Math.max(20 - gap, 0);
  }

  // Over capacity: small penalty
  const over = guestCount - servesMax;
  return Math.max(10 - over, 0);
}

/**
 * Score how well package themes match event type
 * Returns 0-40 points (can be higher with multiple matching themes)
 */
function scoreEventType(pkg, eventType) {
  const normalizedEventType = normalizeEventType(eventType);
  const weightRules = EVENT_TYPE_WEIGHTS[normalizedEventType] || {};
  const pkgThemes = pkg.themes || [];

  if (DEBUG_RECOMMENDATIONS) {
    console.log(
      `🔍 Scoring ${pkg.name}: eventType="${eventType}" (normalized="${normalizedEventType}"), weightRules=`,
      weightRules,
      'themes=',
      pkgThemes
    );
  }

  if (pkgThemes.length === 0) {
    if (DEBUG_RECOMMENDATIONS) {
      console.warn(`⚠️ Package ${pkg.name} has no themes`);
    }
    return 0;
  }

  const score = pkgThemes.reduce((sum, theme) => {
    const points = weightRules[theme] || 0;
    if (DEBUG_RECOMMENDATIONS && points > 0) {
      console.log(`  ✓ ${theme}: +${points} pts`);
    }
    return sum + points;
  }, 0);

  if (DEBUG_RECOMMENDATIONS) {
    console.log(`  📊 Total theme score: ${score}`);
  }

  return score;
}

/**
 * Determine confidence level based on score
 */
function getConfidenceLevel(score) {
  if (score >= 70) return 'high';
  if (score >= 50) return 'medium';
  if (score >= 30) return 'low';
  return 'none';
}

// ==================== END RECOMMENDATION ENGINE ====================

// ==================== RECOMMENDATION UI ====================

/**
 * Render smart recommendation text based on scored packages
 */
function renderRecommendation(ranked, guestCount, eventType) {
  const recElement = document.getElementById('package-recommendation');
  if (!recElement) {
    console.warn('⚠️ Recommendation element not found');
    return;
  }

  if (!ranked || ranked.length === 0) {
    recElement.innerHTML = `<p>📋 Here are all our packages for ${guestCount} guests.</p>`;
    return;
  }

  const top = ranked[0];
  const alt = ranked[1];
  const confidence = getConfidenceLevel(top.score);
  const normalizedEventType = normalizeEventType(eventType);
  const copy = RECOMMENDATION_COPY[normalizedEventType] || RECOMMENDATION_COPY.other;

  // Confidence-based messaging
  const messages = {
    high: `${copy.intro} <strong>For ${guestCount} guests:</strong>`,
    medium: `👍 <strong>Great fit!</strong> For ${guestCount} guests:`,
    low: `💡 <strong>Closest options</strong> for ${guestCount} guests:`,
    none: `📋 Here are all our packages for ${guestCount} guests:`
  };

  if (confidence === 'high' || confidence === 'medium') {
    recElement.innerHTML = `
      <p>${messages[confidence]}</p>
      <p><strong>${top.pkg.name}</strong> - ${copy.reason}</p>
      ${alt && alt.score >= 30 ? `<p class="alternative">or <strong>${alt.pkg.name}</strong> as a great alternative</p>` : ''}
    `;
  } else {
    recElement.innerHTML = messages[confidence];
  }

  recElement.style.display = 'block';

  // Accessibility announcement
  announceRecommendation(top.pkg.name, guestCount);
}

/**
 * Reorder package cards by score and add visual badges
 */
function reorderPackageCards(rankedResults) {
  if (!rankedResults || rankedResults.length === 0) return;

  rankedResults.forEach((result, index) => {
    const card = document.querySelector(`[data-package-id="${result.pkg.id}"]`);

    if (card) {
      // Set visual order
      card.style.order = index;

      // Remove any existing badges
      const existingBadge = card.querySelector('.confidence-badge');
      if (existingBadge) existingBadge.remove();

      // Add confidence badges to top matches
      const confidence = getConfidenceLevel(result.score);

      if (index === 0 && confidence === 'high') {
        card.classList.add('best-match');
        const badge = document.createElement('span');
        badge.className = 'confidence-badge best';
        badge.textContent = 'Best Match';
        card.insertBefore(badge, card.firstChild);
      } else if (index < 2 && result.score >= 50) {
        card.classList.add('recommended');
        const badge = document.createElement('span');
        badge.className = 'confidence-badge good';
        badge.textContent = 'Great Option';
        card.insertBefore(badge, card.firstChild);
      }
    }
  });
}

/**
 * Accessibility announcement for screen readers
 */
function announceRecommendation(packageName, guestCount) {
  // Remove any existing announcement
  const existing = document.querySelector('.recommendation-announcement');
  if (existing) existing.remove();

  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', 'polite');
  announcement.className = 'recommendation-announcement sr-only';
  announcement.textContent = `Based on ${guestCount} guests, we recommend ${packageName}`;
  document.body.appendChild(announcement);

  // Clean up after announcement is made
  setTimeout(() => announcement.remove(), 3000);
}

// ==================== NEW RECOMMENDATION UI (SHARD-1-v2) ====================

/**
 * Render smart recommendation with match badges (V2)
 */
function renderRecommendationV2(recommended, guestCount, dietaryNeeds) {
  const recElement = document.getElementById('package-recommendation');
  if (!recElement) {
    console.warn('⚠️ Recommendation element not found');
    return;
  }

  if (!recommended || recommended.length === 0) {
    recElement.innerHTML = `<p>📋 No packages found for ${guestCount} guests with your dietary preferences.</p>`;
    return;
  }

  const top = recommended[0];
  const topScore = top.matchScore || 0;

  // Match badge based on score
  let matchBadge = '';
  if (topScore >= 85) {
    matchBadge = '⭐ <strong>PERFECT MATCH</strong>';
  } else if (topScore >= 70) {
    matchBadge = '✨ <strong>HIGHLY RECOMMENDED</strong>';
  } else if (topScore >= 50) {
    matchBadge = '👍 <strong>GOOD OPTION</strong>';
  }

  // Build recommendation text
  let html = `<p>${matchBadge} for ${guestCount} people</p>`;

  if (top.matchReasons && top.matchReasons.length > 0) {
    html += `<p><strong>${top.name}</strong>:</p>`;
    html += '<ul class="match-reasons">';
    top.matchReasons.forEach(reason => {
      html += `<li>✓ ${reason}</li>`;
    });
    html += '</ul>';
  }

  recElement.innerHTML = html;
  recElement.style.display = 'block';

  // Accessibility announcement
  announceRecommendation(top.name, guestCount);
}

/**
 * Reorder package cards by match score and add badges (V2)
 */
function reorderPackageCardsV2(recommended) {
  if (!recommended || recommended.length === 0) return;

  recommended.forEach((pkg, index) => {
    const card = document.querySelector(`[data-package-id="${pkg.id}"]`);

    if (card) {
      // Set visual order
      card.style.order = index;

      // Remove any existing badges and reasons
      const existingBadge = card.querySelector('.match-badge');
      const existingReasons = card.querySelector('.match-reasons-card');
      if (existingBadge) existingBadge.remove();
      if (existingReasons) existingReasons.remove();

      // Add match badges based on score
      const score = pkg.matchScore || 0;
      let badgeHTML = '';

      if (score >= 85) {
        card.classList.add('perfect-match');
        badgeHTML = '<div class="match-badge perfect">⭐ Perfect Match</div>';
      } else if (score >= 70) {
        card.classList.add('highly-recommended');
        badgeHTML = '<div class="match-badge highly">✨ Highly Recommended</div>';
      } else if (score >= 50) {
        card.classList.add('good-option');
        badgeHTML = '<div class="match-badge good">👍 Good Option</div>';
      }

      // Add match reasons if available
      if (pkg.matchReasons && pkg.matchReasons.length > 0) {
        badgeHTML += '<div class="match-reasons-card">';
        pkg.matchReasons.forEach(reason => {
          badgeHTML += `<div class="match-reason">✓ ${reason}</div>`;
        });
        badgeHTML += '</div>';
      }

      // Insert badges and reasons at the top of the card
      if (badgeHTML) {
        const packageHeader = card.querySelector('.package-header');
        if (packageHeader) {
          packageHeader.insertAdjacentHTML('beforebegin', badgeHTML);
        }
      }
    }
  });
}

// ==================== END RECOMMENDATION UI ====================

export function initWizardInteractions(packages, sauces, addOns) {
  console.log('🎮 Initializing wizard interactions');
  console.log('📦 Packages received:', packages ? packages.length : 0);
  console.log('🌶️ Sauces received:', sauces ? sauces.length : 0);
  console.log('➕ AddOns received:', addOns ? addOns.length : 0);

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
 * Step 1: Event Details Interactions (SHARD-0-v2)
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

      // Track analytics
      if (window.gtag) {
        gtag('event', 'guest_count_selected', {
          count_range: btn.querySelector('.count-range')?.textContent || 'unknown',
          count_value: parseInt(btn.dataset.count)
        });
      }
    });
  });

  // Dietary needs selection
  const dietaryButtons = document.querySelectorAll('.dietary-option');
  dietaryButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      dietaryButtons.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      wizardState.eventDetails.dietaryNeeds = btn.dataset.dietary;

      // Track analytics
      if (window.gtag) {
        gtag('event', 'dietary_filter_selected', {
          filter: btn.dataset.dietary
        });
      }
    });
  });

  // Event date selection
  const eventDateInput = document.getElementById('event-date');
  if (eventDateInput) {
    eventDateInput.addEventListener('change', (e) => {
      wizardState.eventDetails.eventDate = e.target.value;
    });
  }

  // Event time selection
  const eventTimeInput = document.getElementById('event-time');
  if (eventTimeInput) {
    eventTimeInput.addEventListener('change', (e) => {
      wizardState.eventDetails.eventTime = e.target.value;
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
    case 1: // Event Details (SHARD-0-v2)
      if (!wizardState.eventDetails.guestCount) {
        alert('Please select the number of guests');
        return false;
      }
      // dietaryNeeds is optional, defaults to 'none'
      if (!wizardState.eventDetails.eventDate) {
        alert('Please select your event date');
        return false;
      }
      if (!wizardState.eventDetails.eventTime) {
        alert('Please select your event time');
        return false;
      }

      // Track step completion analytics
      if (window.gtag) {
        gtag('event', 'wizard_step1_completed', {
          guest_count: wizardState.eventDetails.guestCount,
          dietary_needs: wizardState.eventDetails.dietaryNeeds,
          time_spent: performance.now() / 1000 // rough estimate
        });
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
    case 2: // Package Selection (SHARD-1-v2)
      const { guestCount, dietaryNeeds } = wizardState.eventDetails;

      console.log('📍 Step 2: Package Selection activated');
      console.log('📍 Packages available:', packages ? packages.length : 0);
      console.log('📍 Guest count:', guestCount, 'Dietary needs:', dietaryNeeds);

      if (!packages || packages.length === 0) {
        console.error('❌ No packages available for step 2');
        return;
      }

      // Check if package cards exist in DOM
      const packageCardsContainer = document.getElementById('package-cards');
      console.log('📍 Package cards container found:', !!packageCardsContainer);
      if (packageCardsContainer) {
        console.log('📍 Cards in container:', packageCardsContainer.children.length);
      }

      console.log('🎯 Running NEW recommendation engine:', { guestCount, dietaryNeeds });

      // Create filters object for new recommendation algorithm
      const filters = {
        peopleCount: guestCount,
        dietaryNeeds: dietaryNeeds || 'none'
      };

      // Use new recommendation algorithm
      const recommended = getRecommendations(packages, filters);

      console.log('📊 Recommendations:', recommended.map(p => ({
        name: p.name,
        score: p.matchScore,
        reasons: p.matchReasons
      })));

      // Render smart recommendation with match scores
      renderRecommendationV2(recommended, guestCount, dietaryNeeds);

      // Reorder cards by match score and add badges
      reorderPackageCardsV2(recommended);

      // Keep existing opacity logic for visual hints
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
    const { guestCount, eventType, eventDate, eventTime } = wizardState.eventDetails;
    const dateTimeStr = eventTime
      ? `${formatDate(eventDate)} at ${formatTime(eventTime)}`
      : formatDate(eventDate);
    eventSummary.innerHTML = `
      <p><strong>Guests:</strong> ${guestCount} people</p>
      <p><strong>Event:</strong> ${formatEventType(eventType)}</p>
      <p><strong>Date & Time:</strong> ${dateTimeStr}</p>
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
  const normalized = normalizeEventType(type);
  return EVENT_TYPE_MAP[normalized] || type;
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

function formatTime(timeString) {
  // Convert 24-hour time (HH:mm) to 12-hour format
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}
