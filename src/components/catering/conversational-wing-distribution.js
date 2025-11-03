/**
 * Conversational Wing Distribution Wizard
 * SP-003 Enhancement - Approach 3: Natural Language Wing Distribution
 *
 * Allows users to describe their dietary needs in plain language
 * and automatically calculates wing distribution percentages.
 */

import { getState, updateState } from '../../services/shared-platter-state-service.js';

// Distribution presets for conversational selections
const DISTRIBUTION_PRESETS = {
  'all-traditional': {
    traditional: 100,
    plantBased: 0,
    label: 'Everyone eats traditional wings',
    description: 'Perfect for groups who love classic bone-in or boneless wings',
    reasoning: 'All traditional wings (bone-in or boneless)'
  },
  'few-vegetarian': {
    traditional: 75,
    plantBased: 25,
    label: 'A few people need vegetarian options',
    description: 'Great when you have 1-2 vegetarians in a larger group',
    reasoning: 'Mostly traditional wings with vegetarian options for a few guests'
  },
  'half-vegetarian': {
    traditional: 50,
    plantBased: 50,
    label: 'About half the group is vegetarian',
    description: 'Balanced mix for diverse groups',
    reasoning: 'Equal split between traditional and plant-based wings'
  },
  'mostly-vegetarian': {
    traditional: 25,
    plantBased: 75,
    label: 'Mostly vegetarian, some meat-eaters',
    description: 'Ideal when most guests prefer plant-based',
    reasoning: 'Mostly plant-based wings with traditional options for some guests'
  },
  'all-vegetarian': {
    traditional: 0,
    plantBased: 100,
    label: 'Everyone is vegetarian/vegan',
    description: 'All cauliflower wings for fully plant-based events',
    reasoning: 'All plant-based cauliflower wings'
  }
};

const MIN_QUANTITY = 6; // ½ dozen minimum per wing type

/**
 * Renders the conversational wing distribution section
 */
export function renderConversationalWingDistribution() {
  const state = getState();
  const dietaryNeeds = state.eventDetails?.dietaryNeeds || [];
  const shouldAutoExpand = dietaryNeeds.includes('vegetarian') || dietaryNeeds.includes('vegan');

  return `
    <div class="conversational-wing-distribution ${shouldAutoExpand ? 'expanded' : 'collapsed'}">
      <div class="section-header">
        <h3>🍗 How would you like to distribute your wings?</h3>
        <p class="section-subtitle">
          All our packages can include traditional (bone-in/boneless) and plant-based (cauliflower) wings.
          Tell us what works best for your group.
        </p>
      </div>

      <div class="distribution-options">
        ${Object.entries(DISTRIBUTION_PRESETS).map(([key, preset]) => `
          <label class="distribution-option">
            <input
              type="radio"
              name="wing-distribution"
              value="${key}"
              ${key === 'all-traditional' ? 'checked' : ''}
            >
            <div class="option-content">
              <div class="option-label">${preset.label}</div>
              <div class="option-description">${preset.description}</div>
              ${preset.plantBased > 0 ? `
                <div class="option-split">
                  <span class="split-traditional">${preset.traditional}% traditional</span>
                  <span class="split-divider">/</span>
                  <span class="split-plant">${preset.plantBased}% plant-based</span>
                </div>
              ` : ''}
            </div>
          </label>
        `).join('')}
      </div>

      ${!shouldAutoExpand ? `
        <button type="button" class="expand-distribution-btn">
          Want to customize wing distribution?
        </button>
      ` : ''}

      <!-- Wing Distribution Adjustment Panel -->
      <div class="distribution-adjustment-panel" style="display: none;">
        <div class="adjustment-header">
          <h4>🎯 Adjust Your Split</h4>
          <p class="adjustment-subtitle">Fine-tune the percentage to match your group's preferences</p>
        </div>

        <!-- Package Context Cards -->
        <div class="package-context-cards"></div>

        <!-- Slider Container -->
        <div class="slider-container">
          <div class="slider-labels">
            <div class="slider-label-left">
              <span class="label-icon">🍗</span>
              <span class="label-text">Traditional</span>
              <span class="percentage-display traditional" id="traditional-percentage">75</span>%
            </div>
            <div class="slider-label-right">
              <span class="label-icon">🌱</span>
              <span class="label-text">Plant-Based</span>
              <span class="percentage-display plant-based" id="plant-based-percentage">25</span>%
            </div>
          </div>

          <div class="slider-track">
            <div class="slider-fill" id="slider-fill"></div>
            <input
              type="range"
              id="traditional-slider"
              class="distribution-slider"
              min="0"
              max="100"
              value="75"
              step="1"
              aria-label="Adjust traditional to plant-based wing distribution"
              aria-valuetext="75 percent traditional, 25 percent plant-based"
            >
            <div class="slider-markers">
              <span class="snap-point" data-value="0" style="left: 0%"></span>
              <span class="snap-point" data-value="25" style="left: 25%"></span>
              <span class="snap-point" data-value="50" style="left: 50%"></span>
              <span class="snap-point" data-value="75" style="left: 75%"></span>
              <span class="snap-point" data-value="100" style="left: 100%"></span>
            </div>
          </div>

          <!-- Guest Preview -->
          <div class="guest-preview" id="guest-preview">
            <span class="preview-traditional">~19 traditional guests</span>
            <span class="preview-divider">•</span>
            <span class="preview-plant-based">~6 plant-based guests</span>
          </div>

          <!-- Constraint Info -->
          <div class="constraint-info">
            ⚠️ Minimum 6 wings per type (½ dozen)
          </div>
        </div>

        <!-- Contextual Recommendation -->
        <div class="recommendation-box" id="recommendation-box"></div>

        <!-- Reset Button -->
        <div class="adjustment-cta">
          <button type="button" class="cta-button secondary" id="reset-to-preset">
            Reset to Preset
          </button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Translates conversational selection to wing distribution percentages
 */
export function translateWingDistribution(selection, guestCount) {
  const preset = DISTRIBUTION_PRESETS[selection];
  if (!preset) {
    console.error('Invalid wing distribution selection:', selection);
    return null;
  }

  // Calculate approximate guest coverage
  const tradGuests = Math.round((guestCount * preset.traditional) / 100);
  const vegGuests = Math.round((guestCount * preset.plantBased) / 100);

  return {
    selection,
    traditional: preset.traditional,
    plantBased: preset.plantBased,
    reasoning: preset.reasoning,
    tradGuests,
    vegGuests,
    displayText: formatDistributionText(preset, tradGuests, vegGuests)
  };
}

/**
 * Formats distribution for display
 */
function formatDistributionText(preset, tradGuests, vegGuests) {
  if (preset.traditional === 100) {
    return `${tradGuests} guests with traditional wings`;
  }
  if (preset.plantBased === 100) {
    return `${vegGuests} guests with plant-based wings`;
  }
  return `~${tradGuests} guests with traditional, ~${vegGuests} with plant-based`;
}

/**
 * Applies wing distribution to state
 */
export function applyWingDistribution(distribution, totalWings) {
  // Calculate wing quantities
  const traditionalWings = Math.round((totalWings * distribution.traditional) / 100);
  const plantBasedWings = Math.round((totalWings * distribution.plantBased) / 100);

  let finalDistribution = {
    traditional: traditionalWings,
    plantBased: plantBasedWings,
    boneless: 0,
    boneIn: 0,
    cauliflower: 0
  };

  // Apply minimum quantity rule
  if (finalDistribution.traditional > 0 && finalDistribution.traditional < MIN_QUANTITY) {
    finalDistribution.traditional = MIN_QUANTITY;
  }

  if (finalDistribution.plantBased > 0 && finalDistribution.plantBased < MIN_QUANTITY) {
    finalDistribution.plantBased = MIN_QUANTITY;
  }

  // Verify total after minimum adjustments
  const adjustedTotal = finalDistribution.traditional + finalDistribution.plantBased;
  if (adjustedTotal > totalWings) {
    // Need user confirmation - return validation error
    return {
      valid: false,
      error: 'minimum-violation',
      message: `With the minimum ½ dozen (6 wings) per type, we need ${adjustedTotal} wings but package has ${totalWings}. Please choose a larger package or adjust your distribution.`
    };
  }

  // Default: split traditional between boneless/boneIn (50/50)
  if (finalDistribution.traditional > 0) {
    finalDistribution.boneless = Math.round(finalDistribution.traditional / 2);
    finalDistribution.boneIn = finalDistribution.traditional - finalDistribution.boneless;
  }

  // Assign plant-based to cauliflower
  finalDistribution.cauliflower = finalDistribution.plantBased;

  // Handle any rounding differences
  const total = finalDistribution.boneless + finalDistribution.boneIn + finalDistribution.cauliflower;
  if (total !== totalWings) {
    const diff = totalWings - total;
    // Add difference to largest category
    if (finalDistribution.boneless >= finalDistribution.boneIn && finalDistribution.boneless >= finalDistribution.cauliflower) {
      finalDistribution.boneless += diff;
    } else if (finalDistribution.boneIn >= finalDistribution.cauliflower) {
      finalDistribution.boneIn += diff;
    } else {
      finalDistribution.cauliflower += diff;
    }
  }

  // Update state
  updateState('wingDistribution', {
    boneless: finalDistribution.boneless,
    boneIn: finalDistribution.boneIn,
    cauliflower: finalDistribution.cauliflower,
    boneInStyle: 'mixed',
    distributionSource: 'conversational-wizard'
  });

  return {
    valid: true,
    distribution: finalDistribution
  };
}

/**
 * Validates wing distribution meets requirements
 */
export function validateWingDistribution(distribution) {
  const errors = [];

  ['boneless', 'boneIn', 'cauliflower'].forEach(type => {
    const count = distribution[type] || 0;
    if (count > 0 && count < MIN_QUANTITY) {
      errors.push(`${type} wings must be at least ${MIN_QUANTITY} (½ dozen) or 0`);
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Gets contextual recommendation based on percentages and guest count
 */
function getContextualRecommendation(traditional, plantBased, guestCount, dietaryNeeds = []) {
  const traditionalGuests = Math.round(guestCount * traditional / 100);
  const plantBasedGuests = Math.round(guestCount * plantBased / 100);
  const wingsPerGuest = 120 / guestCount; // Assuming 120 wing package

  let icon = '🎯';
  let message = '';
  let level = 'success';

  // Check portions per guest
  if (wingsPerGuest >= 4 && wingsPerGuest <= 6) {
    icon = '🎯';
    message = 'This split is PERFECT for your group! About 4-6 wings per person is ideal.';
    level = 'success';
  } else if (wingsPerGuest < 4) {
    icon = '⚠️';
    message = 'Might not be enough wings. Consider a larger package or adjust your split.';
    level = 'warning';
  } else if (wingsPerGuest > 6) {
    icon = '✨';
    message = 'You\'ll have plenty! Great for big eaters or leftovers.';
    level = 'info';
  }

  // Removed confusing warning that compared checkbox count vs guest count
  // User's percentage selection is intentional and should be trusted

  return { icon, message, level };
}

/**
 * Debounce utility function with cancel support
 */
function debounce(func, wait) {
  let timeout;
  const executedFunction = function(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };

  executedFunction.cancel = function() {
    clearTimeout(timeout);
  };

  return executedFunction;
}

/**
 * Snap to nearest value in snap points
 */
function snapToNearest(value, snapPoints) {
  return snapPoints.reduce((prev, curr) =>
    Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
  );
}

/**
 * Apply magnetic snap effect when near snap points
 */
function applyMagneticSnap(rawValue, snapPoints, threshold = 3) {
  for (const snapPoint of snapPoints) {
    const distance = Math.abs(rawValue - snapPoint);
    if (distance <= threshold) {
      // Magnetic pull strength (stronger when closer)
      const pullStrength = 1 - (distance / threshold);
      return snapPoint * pullStrength + rawValue * (1 - pullStrength);
    }
  }
  return rawValue;
}

/**
 * Initialize conversational wing distribution
 */
export function initConversationalWingDistribution() {
  const container = document.querySelector('.conversational-wing-distribution');
  if (!container) return;

  // Handle expand button
  const expandBtn = container.querySelector('.expand-distribution-btn');
  if (expandBtn) {
    expandBtn.addEventListener('click', () => {
      container.classList.remove('collapsed');
      container.classList.add('expanded');
    });
  }

  // Handle radio button changes
  const radios = container.querySelectorAll('input[name="wing-distribution"]');
  radios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      const selection = e.target.value;
      const state = getState();
      const guestCount = state.eventDetails?.guestCount || 25;

      // Translate selection to distribution
      const distribution = translateWingDistribution(selection, guestCount);

      // Store in state for later use
      updateState('eventDetails', {
        ...state.eventDetails,
        wingDistributionPreference: selection,
        wingDistributionPercentages: {
          traditional: distribution.traditional,
          plantBased: distribution.plantBased
        }
      });

      // DON'T clear wingDistribution here! (Bug #4 fix)
      // The wing-distribution-selector will detect when percentages don't match
      // the draft and recalculate automatically. Clearing it here causes the
      // customization screen to lose the distribution when loading from draft.
      //
      // Previous buggy code (removed):
      // updateState('currentConfig', {
      //   ...state.currentConfig,
      //   wingDistribution: null
      // });

      // Show adjustment panel after selection
      const adjustmentPanel = container.querySelector('.distribution-adjustment-panel');
      if (adjustmentPanel) {
        adjustmentPanel.style.display = 'block';
        initAdjustmentPanel(distribution.traditional, distribution.plantBased, selection);
      }

      console.log('Wing distribution selected:', selection, distribution);
    });
  });

  // Check if there's already a selection and initialize adjustment panel
  let currentState = getState();
  const existingPreference = currentState.eventDetails?.wingDistributionPreference;
  const existingPercentages = currentState.eventDetails?.wingDistributionPercentages;

  if (existingPreference && existingPercentages) {
    const adjustmentPanel = container.querySelector('.distribution-adjustment-panel');
    if (adjustmentPanel && adjustmentPanel.style.display !== 'none') {
      // Re-initialize adjustment panel with existing values
      initAdjustmentPanel(
        existingPercentages.traditional,
        existingPercentages.plantBased,
        existingPreference
      );
    }
  }

  // Initialize adjustment panel functionality
  function initAdjustmentPanel(initialTraditional, initialPlantBased, presetKey) {
    const state = getState();
    const guestCount = state.eventDetails?.guestCount || 25;
    const dietaryNeeds = state.eventDetails?.dietaryNeeds || [];

    const slider = container.querySelector('#traditional-slider');
    const sliderFill = container.querySelector('#slider-fill');
    const traditionalPercentage = container.querySelector('#traditional-percentage');
    const plantBasedPercentage = container.querySelector('#plant-based-percentage');
    const guestPreview = container.querySelector('#guest-preview');
    const recommendationBox = container.querySelector('#recommendation-box');
    const resetButton = container.querySelector('#reset-to-preset');
    const ctaButton = container.querySelector('.wing-distribution-cta');
    const ctaSubtext = container.querySelector('.cta-subtext');

    // Snap points for magnetic effect
    const snapPoints = [0, 25, 50, 75, 100];
    let adjustmentCount = 0;
    const originalPercentages = { traditional: initialTraditional, plantBased: initialPlantBased };

    // Set initial slider value
    slider.value = initialTraditional;
    updateUI(initialTraditional, false);

    // Debounced state update (300ms)
    const debouncedStateUpdate = debounce((traditional, plantBased) => {
      const currentState = getState();
      updateState('eventDetails', {
        ...currentState.eventDetails,
        wingDistributionPercentages: {
          traditional,
          plantBased
        },
        isAdjusted: traditional !== originalPercentages.traditional
      });

      // Clear stale wingDistribution - will be recalculated by setPackage()
      updateState('currentConfig', {
        ...currentState.currentConfig,
        wingDistribution: null
      });
    }, 300);

    // Handle slider input (real-time UI updates)
    slider.addEventListener('input', (e) => {
      let value = parseInt(e.target.value);

      // Apply magnetic snap during drag
      value = Math.round(applyMagneticSnap(value, snapPoints));

      // Update slider value if magnetic snap changed it
      if (value !== parseInt(e.target.value)) {
        slider.value = value;
      }

      updateUI(value, true);
      debouncedStateUpdate(value, 100 - value);

      // Haptic feedback on snap points (mobile)
      if (navigator.vibrate && snapPoints.includes(value)) {
        navigator.vibrate(10);
      }
    });

    // Handle slider change (final value on release)
    slider.addEventListener('change', (e) => {
      let value = parseInt(e.target.value);

      // Snap to nearest snap point on release
      value = snapToNearest(value, snapPoints);
      slider.value = value;

      updateUI(value, false);
      adjustmentCount++;

      // Update state immediately on release
      debouncedStateUpdate.cancel();
      updateState('eventDetails', {
        ...state.eventDetails,
        wingDistributionPercentages: {
          traditional: value,
          plantBased: 100 - value
        },
        isAdjusted: value !== originalPercentages.traditional
      });

      // Track adjustment in analytics
      console.log('Slider adjusted:', {
        fromTraditional: initialTraditional,
        toTraditional: value,
        delta: value - initialTraditional,
        adjustmentCount
      });
    });

    // Update all UI elements
    function updateUI(traditional, isDragging) {
      const plantBased = 100 - traditional;

      // Update percentages
      traditionalPercentage.textContent = traditional;
      plantBasedPercentage.textContent = plantBased;

      // Update slider fill
      sliderFill.style.width = `${traditional}%`;

      // Update slider thumb position via CSS variable
      container.querySelector('.slider-track').style.setProperty('--slider-value', traditional);

      // Update aria-valuetext
      slider.setAttribute('aria-valuetext', `${traditional} percent traditional, ${plantBased} percent plant-based`);

      // Update guest preview
      const tradGuests = Math.round(guestCount * traditional / 100);
      const plantGuests = Math.round(guestCount * plantBased / 100);

      guestPreview.innerHTML = `
        <span class="preview-traditional">~${tradGuests} traditional guests</span>
        <span class="preview-divider">•</span>
        <span class="preview-plant-based">~${plantGuests} plant-based guests</span>
      `;

      // Update recommendation box
      const recommendation = getContextualRecommendation(traditional, plantBased, guestCount, dietaryNeeds);
      recommendationBox.innerHTML = `
        <div class="recommendation-content ${recommendation.level}">
          <span class="recommendation-icon">${recommendation.icon}</span>
          <p class="recommendation-message">${recommendation.message}</p>
        </div>
      `;
      recommendationBox.className = `recommendation-box ${recommendation.level}`;

      // Update CTA button text (if elements exist)
      if (ctaButton && ctaSubtext && resetButton) {
        const isModified = traditional !== originalPercentages.traditional;
        if (isModified) {
          const ctaTextEl = ctaButton.querySelector('.cta-text');
          if (ctaTextEl) ctaTextEl.textContent = `Continue with ${traditional}/${plantBased} split`;
          ctaSubtext.textContent = `Modified from ${DISTRIBUTION_PRESETS[presetKey].label}`;
          resetButton.style.display = 'block';
        } else {
          const ctaTextEl = ctaButton.querySelector('.cta-text');
          if (ctaTextEl) ctaTextEl.textContent = 'Continue to Packages';
          ctaSubtext.textContent = '';
          resetButton.style.display = 'none';
        }
      }
    }

    // Handle reset button (if it exists)
    if (resetButton) {
      resetButton.addEventListener('click', () => {
        slider.value = originalPercentages.traditional;
        updateUI(originalPercentages.traditional, false);

        updateState('eventDetails', {
          ...state.eventDetails,
          wingDistributionPercentages: {
            traditional: originalPercentages.traditional,
            plantBased: originalPercentages.plantBased
          },
          isAdjusted: false
        });

        console.log('Reset to preset:', presetKey);
      });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (!slider.matches(':focus')) return;

      let currentValue = parseInt(slider.value);
      let newValue = currentValue;

      if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        newValue = currentValue - (e.shiftKey ? 1 : 5);
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
        newValue = currentValue + (e.shiftKey ? 1 : 5);
      } else if (e.key === 'Home') {
        newValue = 0;
      } else if (e.key === 'End') {
        newValue = 100;
      } else {
        return;
      }

      e.preventDefault();
      newValue = Math.max(0, Math.min(100, newValue));
      slider.value = newValue;
      slider.dispatchEvent(new Event('input'));
      slider.dispatchEvent(new Event('change'));
    });
  }

  // Auto-select based on dietary needs
  const state = getState();
  const dietaryNeeds = state.eventDetails?.dietaryNeeds || [];
  const guestCount = state.eventDetails?.guestCount || 25;

  if (dietaryNeeds.includes('vegetarian') || dietaryNeeds.includes('vegan')) {
    let autoSelect = 'all-traditional';

    if (guestCount <= 20) {
      autoSelect = 'few-vegetarian';
    } else if (guestCount <= 50) {
      autoSelect = 'half-vegetarian';
    } else {
      autoSelect = 'mostly-vegetarian';
    }

    const autoRadio = container.querySelector(`input[value="${autoSelect}"]`);
    if (autoRadio) {
      autoRadio.checked = true;
      autoRadio.dispatchEvent(new Event('change'));
    }
  }
}
