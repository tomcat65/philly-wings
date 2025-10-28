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

      console.log('Wing distribution selected:', selection, distribution);
    });
  });

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
