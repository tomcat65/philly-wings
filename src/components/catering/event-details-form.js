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
  setupFormValidation();
  setupNavigation();

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
      <!-- Progress Indicator -->
      <div class="form-progress">
        <span class="progress-text">Step 1 of 7</span>
        <div class="progress-bar">
          <div class="progress-fill" style="width: 14.3%"></div>
        </div>
      </div>

      <!-- Form Header -->
      <div class="form-header">
        <h2 class="form-title">Plan Your Perfect Spread</h2>
        <p class="form-subtitle">Tell us about your event and we'll recommend the best packages</p>
      </div>

      <!-- Guest Count Section -->
      <div class="form-section">
        <label class="section-label" for="guest-count-slider">
          How many people are you feeding? <span class="required-asterisk">*</span>
        </label>
        <div class="guest-count-control">
          <div class="count-display-wrapper">
            <button type="button" class="btn-count-adjust" id="btn-decrease-guests" aria-label="Decrease guest count by 5">
              <span aria-hidden="true">−</span>
            </button>
            <div class="count-display">
              <span class="count-value" id="guest-count-value">${eventDetails.guestCount || 25}</span>
              <span class="count-label">guests</span>
            </div>
            <button type="button" class="btn-count-adjust" id="btn-increase-guests" aria-label="Increase guest count by 5">
              <span aria-hidden="true">+</span>
            </button>
          </div>

          <div class="slider-wrapper">
            <input
              type="range"
              id="guest-count-slider"
              class="guest-count-slider"
              min="10"
              max="100"
              step="1"
              value="${eventDetails.guestCount || 25}"
              aria-valuemin="10"
              aria-valuemax="100"
              aria-valuenow="${eventDetails.guestCount || 25}">
            <div class="slider-labels">
              <span class="slider-label-min">10</span>
              <span class="slider-label-max">100+</span>
            </div>
          </div>
        </div>
        <div class="field-error" id="guest-count-error" role="alert"></div>
      </div>

      <!-- Event Type Section -->
      <div class="form-section">
        <label class="section-label">
          What type of event is this? <span class="required-asterisk">*</span>
        </label>
        ${renderEventTypeCards()}
        <div class="field-error" id="event-type-error" role="alert"></div>
      </div>

      <!-- Dietary Considerations Section -->
      <div class="form-section">
        <label class="section-label">
          Any dietary restrictions? <span class="optional-label">(Optional)</span>
        </label>
        <p class="section-hint">Select all that apply to your group</p>

        <div class="dietary-checkboxes">
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
    <div class="event-type-cards">
      ${eventTypes.map(type => `
        <div class="event-type-card ${selectedType === type.id ? 'card-selected' : ''}"
             data-event-type="${type.id}"
             role="radio"
             aria-checked="${selectedType === type.id}"
             tabindex="0">
          <div class="event-card-emoji" aria-hidden="true">${type.emoji}</div>
          <div class="event-card-content">
            <h4 class="event-card-title">${type.name}</h4>
            <p class="event-card-description">${type.description}</p>
          </div>
          <div class="event-card-check">
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
    <label class="dietary-checkbox-label">
      <input
        type="checkbox"
        class="dietary-checkbox"
        data-dietary-id="${id}"
        ${isChecked ? 'checked' : ''}>
      <span class="checkbox-text">${label}</span>
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

  // Slider change handler
  slider.addEventListener('input', (e) => {
    const value = parseInt(e.target.value);
    updateGuestCount(value);
  });

  // Decrease button (-5 guests)
  decreaseBtn.addEventListener('click', () => {
    const currentValue = parseInt(slider.value);
    const newValue = Math.max(10, currentValue - 5);
    updateGuestCount(newValue);
  });

  // Increase button (+5 guests)
  increaseBtn.addEventListener('click', () => {
    const currentValue = parseInt(slider.value);
    const newValue = Math.min(100, currentValue + 5);
    updateGuestCount(newValue);
  });

  // Keyboard navigation on slider
  slider.addEventListener('keydown', (e) => {
    // Arrow keys already work by default (±1)
    // Add Page Up/Down for ±10
    if (e.key === 'PageUp') {
      e.preventDefault();
      const newValue = Math.min(100, parseInt(slider.value) + 10);
      updateGuestCount(newValue);
    } else if (e.key === 'PageDown') {
      e.preventDefault();
      const newValue = Math.max(10, parseInt(slider.value) - 10);
      updateGuestCount(newValue);
    }
  });
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
    c.classList.remove('card-selected');
    c.setAttribute('aria-checked', 'false');
  });

  // Select clicked card
  card.classList.add('card-selected');
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

  // Dispatch navigation event
  window.dispatchEvent(new CustomEvent('navigate-to-recommendations', {
    detail: {
      eventDetails: getState().eventDetails
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
// Load Existing State
// ========================================

function loadExistingState() {
  const state = getState();
  const eventDetails = state.eventDetails || {};

  // Guest count already loaded in render
  // Event type already loaded in render
  // Dietary needs already loaded in render

  // Validate form on load to enable/disable submit button
  validateForm();
}

// ========================================
// Public API
// ========================================

export default {
  init: initEventDetailsForm,
  validate: validateForm
};
