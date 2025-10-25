/**
 * Smart Questionnaire Component
 * Pre-filtering questionnaire to recommend the right catering package
 */

import {
  getPeopleRanges,
  getBudgetRanges,
  getDietaryOptions,
  getOccasionOptions
} from '../../utils/recommendations.js';

let currentFilters = {
  peopleCount: null,
  budgetRange: null,
  dietaryRestrictions: [],
  occasion: null
};

/**
 * Render the smart questionnaire modal
 * @returns {string} HTML string
 */
export function renderSmartQuestionnaire() {
  const peopleRanges = getPeopleRanges();
  const budgetRanges = getBudgetRanges();
  const dietaryOptions = getDietaryOptions();
  const occasionOptions = getOccasionOptions();

  return `
    <div id="smart-questionnaire-modal" class="questionnaire-modal" style="display: none;">
      <div class="questionnaire-overlay" onclick="closeQuestionnaire()"></div>

      <div class="questionnaire-content">
        <button class="questionnaire-close" onclick="closeQuestionnaire()" aria-label="Close">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M18 6L6 18M6 6l12 12" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>

        <div class="questionnaire-header">
          <h2>Find Your Perfect Wings Package</h2>
          <p>Answer 4 quick questions to get personalized recommendations</p>
          <div class="questionnaire-progress">
            <div class="progress-bar">
              <div class="progress-fill" id="questionnaire-progress-bar" style="width: 25%"></div>
            </div>
            <span class="progress-text" id="questionnaire-progress-text">Question 1 of 4</span>
          </div>
        </div>

        <!-- Step 1: People Count -->
        <div class="questionnaire-step" id="step-people" style="display: block;">
          <h3 class="step-title">How many people are you feeding?</h3>
          <div class="option-grid people-grid">
            ${peopleRanges.map((range, index) => `
              <button class="option-button" data-value="${range.value}" onclick="selectPeopleCount(${range.value}, this)">
                <span class="option-icon">👥</span>
                <span class="option-label">${range.label}</span>
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Step 2: Dietary Restrictions -->
        <div class="questionnaire-step" id="step-dietary" style="display: none;">
          <h3 class="step-title">Any dietary restrictions?</h3>
          <p class="step-subtitle">Select all that apply</p>
          <div class="option-grid dietary-grid">
            ${dietaryOptions.map(option => `
              <button class="option-button ${option.value === 'none' ? 'option-none' : ''}"
                      data-value="${option.value}"
                      onclick="selectDietary('${option.value}', this)">
                <span class="option-icon">
                  ${option.value === 'none' ? '🍗' : option.value === 'vegetarian' ? '🥗' : '🌱'}
                </span>
                <span class="option-label">${option.label}</span>
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Step 3: Occasion -->
        <div class="questionnaire-step" id="step-occasion" style="display: none;">
          <h3 class="step-title">What's the occasion?</h3>
          <div class="option-grid occasion-grid">
            ${occasionOptions.map(option => `
              <button class="option-button" data-value="${option.value}" onclick="selectOccasion('${option.value}', this)">
                <span class="option-icon">${option.icon}</span>
                <span class="option-label">${option.label}</span>
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Step 4: Budget -->
        <div class="questionnaire-step" id="step-budget" style="display: none;">
          <h3 class="step-title">What's your budget range?</h3>
          <div class="option-grid budget-grid">
            ${budgetRanges.map(range => `
              <button class="option-button budget-option" data-value="${range.symbol}" onclick="selectBudget('${range.symbol}', this)">
                <span class="option-icon">${range.symbol}</span>
                <span class="option-label">${range.label}</span>
                <span class="option-range">$${range.min} - $${range.max}${range.max >= 10000 ? '+' : ''}</span>
              </button>
            `).join('')}
          </div>
        </div>

        <div class="questionnaire-nav">
          <button class="btn-secondary" id="btn-previous" onclick="previousStep()" style="display: none;">
            ← Previous
          </button>
          <button class="btn-secondary" onclick="skipQuestionnaire()">
            Skip & Browse All
          </button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Open the questionnaire modal
 */
export function openQuestionnaire() {
  const modal = document.getElementById('smart-questionnaire-modal');
  if (modal) {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // Track analytics
    if (window.gtag) {
      gtag('event', 'questionnaire_started', {
        entry_point: 'hero_cta'
      });
    }
  }
}

/**
 * Close the questionnaire modal
 */
window.closeQuestionnaire = function() {
  const modal = document.getElementById('smart-questionnaire-modal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = '';

    // Reset to step 1
    resetQuestionnaire();
  }
};

/**
 * Reset questionnaire to initial state
 */
function resetQuestionnaire() {
  currentFilters = {
    peopleCount: null,
    budgetRange: null,
    dietaryRestrictions: [],
    occasion: null
  };

  // Hide all steps
  document.querySelectorAll('.questionnaire-step').forEach(step => {
    step.style.display = 'none';
  });

  // Show step 1
  const step1 = document.getElementById('step-people');
  if (step1) step1.style.display = 'block';

  // Reset progress
  updateProgress(1);

  // Hide previous button
  const btnPrev = document.getElementById('btn-previous');
  if (btnPrev) btnPrev.style.display = 'none';

  // Clear selections
  document.querySelectorAll('.option-button.selected').forEach(btn => {
    btn.classList.remove('selected');
  });
}

/**
 * Update progress bar
 * @param {number} step - Current step (1-4)
 */
function updateProgress(step) {
  const progressBar = document.getElementById('questionnaire-progress-bar');
  const progressText = document.getElementById('questionnaire-progress-text');

  if (progressBar) {
    const percentage = (step / 4) * 100;
    progressBar.style.width = `${percentage}%`;
  }

  if (progressText) {
    progressText.textContent = `Question ${step} of 4`;
  }
}

/**
 * Navigate to next step
 * @param {number} currentStep - Current step number
 */
function goToNextStep(currentStep) {
  // Hide current step
  const steps = ['step-people', 'step-dietary', 'step-occasion', 'step-budget'];
  const currentStepEl = document.getElementById(steps[currentStep - 1]);
  if (currentStepEl) currentStepEl.style.display = 'none';

  if (currentStep < 4) {
    // Show next step
    const nextStepEl = document.getElementById(steps[currentStep]);
    if (nextStepEl) nextStepEl.style.display = 'block';

    // Update progress
    updateProgress(currentStep + 1);

    // Show previous button
    const btnPrev = document.getElementById('btn-previous');
    if (btnPrev) btnPrev.style.display = 'inline-block';
  } else {
    // Completed all steps - show recommendations
    showRecommendations();
  }
}

/**
 * Navigate to previous step
 */
window.previousStep = function() {
  const steps = ['step-people', 'step-dietary', 'step-occasion', 'step-budget'];

  // Find current visible step
  let currentIndex = -1;
  steps.forEach((stepId, index) => {
    const step = document.getElementById(stepId);
    if (step && step.style.display !== 'none') {
      currentIndex = index;
    }
  });

  if (currentIndex > 0) {
    // Hide current
    const currentStep = document.getElementById(steps[currentIndex]);
    if (currentStep) currentStep.style.display = 'none';

    // Show previous
    const prevStep = document.getElementById(steps[currentIndex - 1]);
    if (prevStep) prevStep.style.display = 'block';

    // Update progress
    updateProgress(currentIndex);

    // Hide previous button on step 1
    if (currentIndex === 1) {
      const btnPrev = document.getElementById('btn-previous');
      if (btnPrev) btnPrev.style.display = 'none';
    }
  }
};

/**
 * Select people count
 */
window.selectPeopleCount = function(count, button) {
  currentFilters.peopleCount = count;

  // Visual feedback
  document.querySelectorAll('#step-people .option-button').forEach(btn => {
    btn.classList.remove('selected');
  });
  button.classList.add('selected');

  // Auto-advance after short delay
  setTimeout(() => goToNextStep(1), 300);
};

/**
 * Select dietary restriction
 */
window.selectDietary = function(value, button) {
  if (value === 'none') {
    // Clear all other selections
    currentFilters.dietaryRestrictions = [];
    document.querySelectorAll('#step-dietary .option-button').forEach(btn => {
      btn.classList.remove('selected');
    });
    button.classList.add('selected');
  } else {
    // Toggle selection
    const isSelected = button.classList.contains('selected');

    if (isSelected) {
      button.classList.remove('selected');
      currentFilters.dietaryRestrictions = currentFilters.dietaryRestrictions.filter(v => v !== value);
    } else {
      // Remove 'none' if selecting specific restriction
      const noneBtn = document.querySelector('#step-dietary .option-none');
      if (noneBtn) noneBtn.classList.remove('selected');

      button.classList.add('selected');
      if (!currentFilters.dietaryRestrictions.includes(value)) {
        currentFilters.dietaryRestrictions.push(value);
      }
    }
  }

  // Auto-advance after short delay
  setTimeout(() => goToNextStep(2), 300);
};

/**
 * Select occasion
 */
window.selectOccasion = function(value, button) {
  currentFilters.occasion = value;

  // Visual feedback
  document.querySelectorAll('#step-occasion .option-button').forEach(btn => {
    btn.classList.remove('selected');
  });
  button.classList.add('selected');

  // Auto-advance after short delay
  setTimeout(() => goToNextStep(3), 300);
};

/**
 * Select budget range
 */
window.selectBudget = function(symbol, button) {
  const budgetRanges = getBudgetRanges();
  const selectedRange = budgetRanges.find(r => r.symbol === symbol);

  if (selectedRange) {
    currentFilters.budgetRange = selectedRange;

    // Visual feedback
    document.querySelectorAll('#step-budget .option-button').forEach(btn => {
      btn.classList.remove('selected');
    });
    button.classList.add('selected');

    // Complete questionnaire
    setTimeout(() => goToNextStep(4), 300);
  }
};

/**
 * Skip questionnaire and show all packages
 */
window.skipQuestionnaire = function() {
  // Track analytics
  if (window.gtag) {
    gtag('event', 'questionnaire_skipped', {
      reason: 'browse_all_clicked'
    });
  }

  // Close modal
  window.closeQuestionnaire();

  // Scroll to packages
  const packagesSection = document.getElementById('catering-packages');
  if (packagesSection) {
    packagesSection.scrollIntoView({ behavior: 'smooth' });
  }
};

/**
 * Show filtered recommendations
 */
async function showRecommendations() {
  // Save filters to localStorage
  try {
    localStorage.setItem('catering_filters', JSON.stringify(currentFilters));
  } catch (e) {
    console.warn('Could not save filters to localStorage', e);
  }

  // Track analytics
  if (window.gtag) {
    gtag('event', 'questionnaire_completed', {
      people_count: currentFilters.peopleCount,
      dietary_restrictions: currentFilters.dietaryRestrictions.join(','),
      occasion: currentFilters.occasion,
      budget_range: currentFilters.budgetRange?.symbol
    });
  }

  // Close modal
  window.closeQuestionnaire();

  // Trigger package filtering
  if (window.filterPackagesByRecommendations) {
    window.filterPackagesByRecommendations(currentFilters);
  }

  // Scroll to packages
  setTimeout(() => {
    const packagesSection = document.getElementById('catering-packages');
    if (packagesSection) {
      packagesSection.scrollIntoView({ behavior: 'smooth' });
    }
  }, 100);
}

/**
 * Get current filters
 * @returns {object} Current filter state
 */
export function getCurrentFilters() {
  return { ...currentFilters };
}

/**
 * Load saved filters from localStorage
 * @returns {object|null} Saved filters or null
 */
export function loadSavedFilters() {
  try {
    const saved = localStorage.getItem('catering_filters');
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    console.warn('Could not load filters from localStorage', e);
    return null;
  }
}

/**
 * Clear saved filters
 */
export function clearSavedFilters() {
  try {
    localStorage.removeItem('catering_filters');
    resetQuestionnaire();
  } catch (e) {
    console.warn('Could not clear filters from localStorage', e);
  }
}

// Make openQuestionnaire available globally
window.openQuestionnaire = openQuestionnaire;
