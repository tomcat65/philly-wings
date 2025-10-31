/**
 * Event Details Form Component - SP-003
 * Guided Planner - FLOW B Step 1
 *
 * Captures event information to power smart package recommendations
 * - Guest count (10-100+)
 * - Event type (Corporate, Sports, Party, Other)
 * - Dietary considerations (optional)
 *
 * Story: SP-003
 * Created: 2025-10-26
 */

import { getState, updateState, validateState } from '../../services/shared-platter-state-service.js';
import { renderPhotoCardSelector, initPhotoCardSelector } from './photo-card-selector.js';
import { renderConversationalWingDistribution, initConversationalWingDistribution } from './conversational-wing-distribution.js';

// ========================================
// Component Initialization
// ========================================

export function initEventDetailsForm() {
  const container = document.getElementById('event-details-form-container');
  if (!container) return;

  // Render the form
  container.innerHTML = renderEventDetailsForm();

  // Initialize interactions
  setupGuestCountSlider();
  setupEventTypeCards();
  setupDietaryCheckboxes();
  initConversationalWingDistribution(); // NEW: Initialize conversational wizard
  setupFormValidation();
  setupNavigation();
  setupPortionGuide();

  // Load existing state if available
  loadExistingState();
}

// ========================================
// Render Form HTML
// ========================================

function renderEventDetailsForm() {
  const state = getState();
  const eventDetails = state.eventDetails || {};

  return `
    <div class="event-details-form">
      <!-- Form Header -->
      <div class="form-header">
        <h2 class="form-title">Plan Your Perfect Spread</h2>
        <p class="form-subtitle">Tell us about your event and we'll recommend the best packages</p>
      </div>

      <!-- Progress Indicator -->
      <div class="form-progress">
        <span class="progress-text">Step 1 of 7</span>
        <div class="progress-bar">
          <div class="progress-fill" style="width: 14.3%"></div>
        </div>
      </div>

      <!-- Guest Count Section -->
      <div class="form-section">
        <div class="section-header">
          <div class="section-icon-wrapper">
            <span class="section-icon">👥</span>
          </div>
          <div class="section-content">
            <div class="section-label">🍗 Step 1</div>
            <h3 class="section-title">
              How many people are you feeding?
              <span class="required-badge">Required</span>
            </h3>
            <p class="section-subtitle">Select your guest count to get the right portion recommendations</p>
          </div>
        </div>

        <div class="guest-count-display">
          <div class="count-controls">
            <button type="button" class="btn-count" id="btn-decrease-guests" aria-label="Decrease guest count by 5">−</button>
            <div class="count-value-wrapper">
              <span class="count-value" id="guest-count-value">${eventDetails.guestCount || 25}</span>
              <div class="count-label">Guests</div>
            </div>
            <button type="button" class="btn-count" id="btn-increase-guests" aria-label="Increase guest count by 5">+</button>
          </div>

          <input
            type="range"
            id="guest-count-slider"
            class="guest-slider"
            min="10"
            max="100"
            step="1"
            value="${eventDetails.guestCount || 25}"
            aria-valuemin="10"
            aria-valuemax="100"
            aria-valuenow="${eventDetails.guestCount || 25}">
          <div class="slider-labels">
            <span>10 people</span>
            <span>100+ people</span>
          </div>
        </div>

        <div class="portion-guide-trigger">
          <button type="button" class="btn-portion-guide" id="btn-open-portion-guide">
            <div class="guide-icon-wrapper">
              <svg class="guide-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
            <div class="guide-content">
              <div class="guide-label">🍗 Helpful Tool</div>
              <div class="guide-title">Not sure how many wings to order? Use our portion calculator</div>
            </div>
          </button>
        </div>
        <div class="field-error" id="guest-count-error" role="alert"></div>
      </div>

      <!-- Event Type Section -->
      <div class="form-section">
        <div class="section-header">
          <div class="section-icon-wrapper">
            <span class="section-icon">🎯</span>
          </div>
          <div class="section-content">
            <div class="section-label">🎉 Step 2</div>
            <h3 class="section-title">
              What type of event is this?
              <span class="required-badge">Required</span>
            </h3>
            <p class="section-subtitle">Help us recommend the perfect spread for your occasion</p>
          </div>
        </div>
        ${renderEventTypeCards()}
        <div class="field-error" id="event-type-error" role="alert"></div>
      </div>

      <!-- Dietary Considerations Section -->
      <div class="form-section">
        <div class="section-header">
          <div class="section-icon-wrapper">
            <span class="section-icon">🥗</span>
          </div>
          <div class="section-content">
            <div class="section-label">🌱 Step 3</div>
            <h3 class="section-title">Any dietary restrictions?</h3>
            <p class="section-subtitle">Optional - Select all that apply to your group</p>
          </div>
        </div>

        <div class="dietary-grid">
          ${renderDietaryCheckbox('vegetarian', 'Vegetarian options needed', eventDetails.dietaryNeeds)}
          ${renderDietaryCheckbox('vegan', 'Vegan options needed', eventDetails.dietaryNeeds)}
          ${renderDietaryCheckbox('gluten-free', 'Gluten-free options needed', eventDetails.dietaryNeeds)}
          ${renderDietaryCheckbox('nut-allergies', 'Nut allergies', eventDetails.dietaryNeeds)}
          ${renderDietaryCheckbox('other', 'Other dietary needs', eventDetails.dietaryNeeds)}
        </div>

        <!-- Other dietary needs text input (conditional) -->
        <div class="other-dietary-input ${eventDetails.dietaryNeeds?.includes('other') ? '' : 'hidden'}" id="other-dietary-wrapper">
          <label class="input-label" for="other-dietary-text">
            Please specify other dietary needs:
          </label>
          <input
            type="text"
            id="other-dietary-text"
            class="text-input"
            placeholder="e.g., Kosher, Halal, Dairy-free"
            value="${eventDetails.otherDietaryText || ''}"
            maxlength="100">
        </div>
      </div>

      <!-- Conversational Wing Distribution (NEW: SP-003 Enhancement) -->
      ${renderConversationalWingDistribution()}

      <!-- Form Actions -->
      <div class="form-actions">
        <button type="button" class="btn-secondary" id="btn-back-to-entry">
          ← Back
        </button>
        <button type="button" class="btn-primary" id="btn-get-recommendations" disabled>
          Get Recommendations →
        </button>
      </div>

      <!-- Validation Summary (hidden by default) -->
      <div class="validation-summary hidden" id="validation-summary" role="alert">
        <p class="validation-message">Please fill in all required fields to continue</p>
      </div>
    </div>
  `;
}

// ========================================
// Event Type Cards Renderer
// ========================================

function renderEventTypeCards() {
  const state = getState();
  const selectedType = state.eventDetails?.eventType;

  const eventTypes = [
    {
      id: 'corporate',
      name: 'Corporate Meeting',
      emoji: '🏢',
      description: 'Office lunch, business meetings, conferences'
    },
    {
      id: 'sports',
      name: 'Sports Watch Party',
      emoji: '🏈',
      description: 'Game day gatherings, tailgates, viewing parties'
    },
    {
      id: 'party',
      name: 'Social Party',
      emoji: '🎉',
      description: 'Birthday parties, celebrations, social events'
    },
    {
      id: 'other',
      name: 'Other Event',
      emoji: '📅',
      description: 'School events, community gatherings, fundraisers'
    }
  ];

  return `
    <div class="event-type-grid">
      ${eventTypes.map(type => `
        <div class="event-type-card ${selectedType === type.id ? 'selected' : ''}"
             data-event-type="${type.id}"
             role="radio"
             aria-checked="${selectedType === type.id}"
             tabindex="0">
          <div class="event-icon-wrapper">
            <span class="event-icon" aria-hidden="true">${type.emoji}</span>
          </div>
          <div class="event-content">
            <h4 class="event-title">${type.name}</h4>
            <p class="event-description">${type.description}</p>
          </div>
          <div class="event-check">
            <span class="check-icon">✓</span>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// ========================================
// Dietary Checkbox Renderer
// ========================================

function renderDietaryCheckbox(id, label, selectedNeeds = []) {
  const isChecked = selectedNeeds?.includes(id);

  return `
    <label class="dietary-option ${isChecked ? 'selected' : ''}">
      <input
        type="checkbox"
        class="dietary-checkbox"
        data-dietary-id="${id}"
        ${isChecked ? 'checked' : ''}>
      <span class="dietary-label">${label}</span>
      <div class="dietary-check">
        <span class="check-icon">✓</span>
      </div>
    </label>
  `;
}

// ========================================
// Guest Count Slider Setup
// ========================================

function setupGuestCountSlider() {
  const slider = document.getElementById('guest-count-slider');
  const valueDisplay = document.getElementById('guest-count-value');
  const decreaseBtn = document.getElementById('btn-decrease-guests');
  const increaseBtn = document.getElementById('btn-increase-guests');

  if (!slider || !valueDisplay) return;

  // Initialize slider gradient
  updateSliderGradient(slider);

  // Slider change handler
  slider.addEventListener('input', (e) => {
    const value = parseInt(e.target.value);
    updateGuestCount(value);
    updateSliderGradient(e.target);
  });

  // Decrease button (-5 guests)
  decreaseBtn.addEventListener('click', () => {
    const currentValue = parseInt(slider.value);
    const newValue = Math.max(10, currentValue - 5);
    updateGuestCount(newValue);
    updateSliderGradient(slider);
  });

  // Increase button (+5 guests)
  increaseBtn.addEventListener('click', () => {
    const currentValue = parseInt(slider.value);
    const newValue = Math.min(100, currentValue + 5);
    updateGuestCount(newValue);
    updateSliderGradient(slider);
  });

  // Keyboard navigation on slider
  slider.addEventListener('keydown', (e) => {
    // Arrow keys already work by default (±1)
    // Add Page Up/Down for ±10
    if (e.key === 'PageUp') {
      e.preventDefault();
      const newValue = Math.min(100, parseInt(slider.value) + 10);
      updateGuestCount(newValue);
      updateSliderGradient(slider);
    } else if (e.key === 'PageDown') {
      e.preventDefault();
      const newValue = Math.max(10, parseInt(slider.value) - 10);
      updateGuestCount(newValue);
      updateSliderGradient(slider);
    }
  });
}

function updateSliderGradient(slider) {
  const value = parseInt(slider.value);
  const min = parseInt(slider.min);
  const max = parseInt(slider.max);

  // Calculate percentage (0-100)
  const percentage = ((value - min) / (max - min)) * 100;

  // Update CSS custom property for gradient fill
  slider.style.setProperty('--slider-fill', `${percentage}%`);
}

function updateGuestCount(value) {
  const slider = document.getElementById('guest-count-slider');
  const valueDisplay = document.getElementById('guest-count-value');

  if (!slider || !valueDisplay) return;

  // Ensure value is within bounds
  const clampedValue = Math.max(10, Math.min(100, value));

  // Update UI
  slider.value = clampedValue;
  valueDisplay.textContent = clampedValue;
  slider.setAttribute('aria-valuenow', clampedValue);

  // Update state
  updateState('eventDetails.guestCount', clampedValue);

  // Clear error if exists
  clearFieldError('guest-count-error');

  // Re-validate form
  validateForm();
}

// ========================================
// Event Type Cards Setup
// ========================================

function setupEventTypeCards() {
  const cards = document.querySelectorAll('.event-type-card');

  cards.forEach(card => {
    // Click handler
    card.addEventListener('click', () => {
      selectEventType(card);
    });

    // Keyboard handler
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectEventType(card);
      }
    });
  });
}

function selectEventType(card) {
  const eventType = card.dataset.eventType;

  // Deselect all cards
  document.querySelectorAll('.event-type-card').forEach(c => {
    c.classList.remove('selected');
    c.setAttribute('aria-checked', 'false');
  });

  // Select clicked card
  card.classList.add('selected');
  card.setAttribute('aria-checked', 'true');

  // Update state
  updateState('eventDetails.eventType', eventType);

  // Clear error if exists
  clearFieldError('event-type-error');

  // Re-validate form
  validateForm();

  // Animation feedback
  card.classList.add('card-clicked');
  setTimeout(() => card.classList.remove('card-clicked'), 300);
}

// ========================================
// Dietary Checkboxes Setup
// ========================================

function setupDietaryCheckboxes() {
  const checkboxes = document.querySelectorAll('.dietary-checkbox');
  const otherTextInput = document.getElementById('other-dietary-text');

  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      handleDietaryCheckboxChange(e.target);
    });
  });

  // Other dietary text input
  if (otherTextInput) {
    otherTextInput.addEventListener('input', (e) => {
      updateState('eventDetails.otherDietaryText', e.target.value.trim());
    });
  }
}

function handleDietaryCheckboxChange(checkbox) {
  const dietaryId = checkbox.dataset.dietaryId;
  const isChecked = checkbox.checked;

  // Toggle 'selected' class on the parent label
  const label = checkbox.closest('.dietary-option');
  if (label) {
    if (isChecked) {
      label.classList.add('selected');
    } else {
      label.classList.remove('selected');
    }
  }

  // Get current dietary needs
  const state = getState();
  const currentNeeds = state.eventDetails?.dietaryNeeds || [];

  let updatedNeeds;
  if (isChecked) {
    // Add to array if not already present
    updatedNeeds = currentNeeds.includes(dietaryId)
      ? currentNeeds
      : [...currentNeeds, dietaryId];
  } else {
    // Remove from array
    updatedNeeds = currentNeeds.filter(need => need !== dietaryId);
  }

  // Update state
  updateState('eventDetails.dietaryNeeds', updatedNeeds);

  // Show/hide "Other" text input
  if (dietaryId === 'other') {
    const otherWrapper = document.getElementById('other-dietary-wrapper');
    if (otherWrapper) {
      if (isChecked) {
        otherWrapper.classList.remove('hidden');
        document.getElementById('other-dietary-text')?.focus();
      } else {
        otherWrapper.classList.add('hidden');
        updateState('eventDetails.otherDietaryText', '');
      }
    }
  }
}

// ========================================
// Form Validation
// ========================================

function setupFormValidation() {
  const submitBtn = document.getElementById('btn-get-recommendations');

  if (!submitBtn) return;

  submitBtn.addEventListener('click', () => {
    if (validateForm()) {
      navigateToRecommendations();
    }
  });
}

function validateForm() {
  const state = getState();
  const eventDetails = state.eventDetails || {};

  let isValid = true;
  const errors = [];

  // Validate guest count
  if (!eventDetails.guestCount || eventDetails.guestCount < 10) {
    showFieldError('guest-count-error', 'Please enter at least 10 guests');
    isValid = false;
  } else {
    clearFieldError('guest-count-error');
  }

  // Validate event type
  if (!eventDetails.eventType) {
    showFieldError('event-type-error', 'Please select an event type');
    isValid = false;
  } else {
    clearFieldError('event-type-error');
  }

  // Dietary needs are optional - no validation needed

  // Update submit button state
  const submitBtn = document.getElementById('btn-get-recommendations');
  if (submitBtn) {
    submitBtn.disabled = !isValid;
  }

  // Show/hide validation summary
  const validationSummary = document.getElementById('validation-summary');
  if (validationSummary) {
    if (isValid) {
      validationSummary.classList.add('hidden');
    }
  }

  return isValid;
}

function showFieldError(errorElementId, message) {
  const errorElement = document.getElementById(errorElementId);
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.classList.add('active');
  }
}

function clearFieldError(errorElementId) {
  const errorElement = document.getElementById(errorElementId);
  if (errorElement) {
    errorElement.textContent = '';
    errorElement.classList.remove('active');
  }
}

// ========================================
// Navigation Setup
// ========================================

function setupNavigation() {
  const backBtn = document.getElementById('btn-back-to-entry');

  if (backBtn) {
    backBtn.addEventListener('click', () => {
      navigateToEntryChoice();
    });
  }
}

function navigateToRecommendations() {
  // Update flow state
  updateState('flowType', 'guided-planner');
  updateState('currentStep', 'recommendations');

  // User already confirmed distribution via slider adjustment UI
  // Navigate directly to recommendations (no redundant modal needed)
  const state = getState();
  window.dispatchEvent(new CustomEvent('navigate-to-recommendations', {
    detail: {
      eventDetails: state.eventDetails
    }
  }));
}

function navigateToEntryChoice() {
  // Update state
  updateState('currentStep', 'entry-choice');

  // Dispatch navigation event
  window.dispatchEvent(new CustomEvent('navigate-to-entry-choice'));
}

// ========================================
// Portion Guide Setup
// ========================================

function setupPortionGuide() {
  const portionGuideBtn = document.getElementById('btn-open-portion-guide');

  if (portionGuideBtn) {
    portionGuideBtn.addEventListener('click', () => {
      // Show the portion guide modal
      const portionGuideModal = document.getElementById('portion-guide-modal');
      if (portionGuideModal) {
        portionGuideModal.style.display = 'block';
        // Focus on close button for accessibility
        const closeBtn = portionGuideModal.querySelector('.portion-guide-close');
        if (closeBtn) {
          setTimeout(() => closeBtn.focus(), 100);
        }
      } else {
        console.warn('Portion guide modal not found');
      }
    });
  }
}

// ========================================
// Load Existing State
// ========================================

function loadExistingState() {
  const state = getState();
  const eventDetails = state.eventDetails || {};

  // SYNC: Ensure state matches rendered UI defaults
  // If UI renders with default 25 guests but state has 10, update state to match UI
  const guestSlider = document.getElementById('guest-count-slider');
  const renderedGuestCount = parseInt(guestSlider?.value || 25);
  if (eventDetails.guestCount !== renderedGuestCount) {
    updateState('eventDetails.guestCount', renderedGuestCount, true); // Silent update
  }

  // Validate form immediately
  validateForm();

  // Delayed re-validation as safety net to catch timing issues
  setTimeout(() => {
    validateForm();
  }, 150);
}

// ========================================
// Public API
// ========================================

export default {
  init: initEventDetailsForm,
  validate: validateForm
};
