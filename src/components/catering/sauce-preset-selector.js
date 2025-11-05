/**
 * Sauce Preset Selector Component
 * 4 preset options for sauce distribution with dynamic previews
 *
 * Features:
 * - All Same, Even Mix, One Per Wing Type (default), Custom
 * - Dynamic preview text based on wing distribution
 * - Radio button selection (only one active)
 * - Skip to Custom option for advanced users
 * - State integration with apply button
 *
 * Created: 2025-11-03
 * Epic: SP-SAUCE-ASSIGNMENT-001
 * Story: SP-SAUCE-STORY-2
 */

import { getState, updateState } from '../../services/shared-platter-state-service.js';
import { applyPreset } from '../../services/shared-platter-state-service.js';

/**
 * Get preset preview text dynamically based on selections
 * @param {string} presetType - 'all-same' | 'even-mix' | 'one-per-type' | 'custom'
 * @param {Array} selectedSauces - Array of sauce objects
 * @param {Object} wingDistribution - Wing distribution object
 * @returns {string} Preview text
 */
function getPresetPreview(presetType, selectedSauces, wingDistribution) {
  if (selectedSauces.length === 0) {
    return 'Select sauces first';
  }

  // Get active wing types (count > 0)
  const activeWingTypes = Object.entries(wingDistribution)
    .filter(([type, count]) => count > 0 && type !== 'boneInStyle' && type !== 'distributionSource')
    .map(([type, count]) => ({
      type,
      count,
      displayName: type === 'boneIn' ? 'Bone-In' : type === 'cauliflower' ? 'Cauliflower' : 'Boneless'
    }));

  if (activeWingTypes.length === 0) {
    return 'No wings to assign';
  }

  const sauceNames = selectedSauces.map(s => s.name);

  switch (presetType) {
    case 'all-same':
      return `All ${activeWingTypes.map(wt => wt.displayName).join(', ')} wings get ${sauceNames[0]}`;

    case 'even-mix':
      if (selectedSauces.length === 1) {
        return `All wings get ${sauceNames[0]} (only one sauce selected)`;
      }
      return `Each wing type split evenly across ${selectedSauces.length} sauces`;

    case 'one-per-type':
      const previews = activeWingTypes.map((wt, index) => {
        const sauce = selectedSauces[index % selectedSauces.length];
        return `${wt.displayName} → ${sauce.name}`;
      });
      return previews.join(', ');

    case 'custom':
      return 'You assign each sauce manually';

    default:
      return '';
  }
}

/**
 * Render a single preset card
 * @param {string} presetType - Preset identifier
 * @param {string} title - Preset display title
 * @param {string} description - Preset description
 * @param {string} preview - Dynamic preview text
 * @param {boolean} isSelected - Whether this preset is selected
 * @param {string} icon - Emoji icon
 * @returns {string} HTML markup
 */
function renderPresetCard(presetType, title, description, preview, isSelected, icon) {
  return `
    <div class="preset-card ${isSelected ? 'preset-card-selected' : ''}" data-preset="${presetType}">
      <div class="preset-card-header">
        <span class="preset-icon">${icon}</span>
        <div class="preset-radio">
          <input
            type="radio"
            name="sauce-preset"
            value="${presetType}"
            id="preset-${presetType}"
            ${isSelected ? 'checked' : ''}
            aria-label="${title}"
          />
          <label for="preset-${presetType}" class="preset-radio-label"></label>
        </div>
      </div>
      <h3 class="preset-title">${title}</h3>
      <p class="preset-description">${description}</p>
      <div class="preset-preview">
        <span class="preview-icon">👀</span>
        <span class="preview-text">${preview}</span>
      </div>
    </div>
  `;
}

/**
 * Render sauce preset selector with 4 options
 * @param {Array} selectedSauces - Selected sauce objects
 * @param {Object} wingDistribution - Wing distribution from state
 * @returns {string} HTML markup
 */
export function renderSaucePresetSelector(selectedSauces, wingDistribution) {
  const state = getState();
  const currentPreset = state.currentConfig.sauceAssignments?.appliedPreset || 'one-per-type';

  // Generate previews for each preset
  const previewAllSame = getPresetPreview('all-same', selectedSauces, wingDistribution);
  const previewEvenMix = getPresetPreview('even-mix', selectedSauces, wingDistribution);
  const previewOnePerType = getPresetPreview('one-per-type', selectedSauces, wingDistribution);
  const previewCustom = getPresetPreview('custom', selectedSauces, wingDistribution);

  return `
    <div class="sauce-preset-selector">
      <!-- Header -->
      <div class="preset-selector-header">
        <h2 class="preset-selector-title">🎯 Choose Distribution Style</h2>
        <p class="preset-selector-subtitle">
          How should we distribute your ${selectedSauces.length} sauce${selectedSauces.length !== 1 ? 's' : ''}
          across ${Object.values(wingDistribution).reduce((sum, val) => typeof val === 'number' ? sum + val : sum, 0)} wings?
        </p>
      </div>

      <!-- Preset Cards Grid (2x2) -->
      <div class="preset-cards-grid">
        ${renderPresetCard(
          'all-same',
          'All Same Sauce',
          'Everyone gets the same flavor on all wing types',
          previewAllSame,
          currentPreset === 'all-same',
          '🎯'
        )}

        ${renderPresetCard(
          'even-mix',
          'Even Mix',
          'Split each wing type evenly across all sauces',
          previewEvenMix,
          currentPreset === 'even-mix',
          '🌈'
        )}

        ${renderPresetCard(
          'one-per-type',
          'One Sauce Per Wing Type',
          'Different sauce for each wing type (recommended)',
          previewOnePerType,
          currentPreset === 'one-per-type',
          '⭐'
        )}

        ${renderPresetCard(
          'custom',
          'Custom Distribution',
          'Full control - assign sauces yourself',
          previewCustom,
          currentPreset === 'custom',
          '🎨'
        )}
      </div>

      <!-- Skip Option -->
      <div class="preset-skip-section">
        <button
          type="button"
          id="skip-to-custom-btn"
          class="skip-to-custom-btn"
          aria-label="Skip preset selection and go straight to custom distribution">
          Skip to Custom Distribution →
        </button>
      </div>

      <!-- Action Buttons -->
      <div class="preset-actions">
        <button
          type="button"
          id="apply-preset-btn"
          class="btn-primary btn-apply-preset"
          aria-label="Apply selected preset and continue">
          Apply & Continue
        </button>
      </div>
    </div>
  `;
}

/**
 * Initialize preset selector with event handlers
 * @param {Array} selectedSauces - Selected sauce objects
 * @param {Object} wingDistribution - Wing distribution from state
 * @param {Function} onPresetApplied - Callback when preset is applied
 */
export function initSaucePresetSelector(selectedSauces, wingDistribution, onPresetApplied) {
  console.log('🎯 Initializing sauce preset selector');

  let selectedPreset = 'one-per-type'; // Default

  // Handle preset card clicks (select radio)
  const presetCards = document.querySelectorAll('.preset-card');
  presetCards.forEach(card => {
    card.addEventListener('click', (e) => {
      // Don't trigger if clicking the radio directly (it handles itself)
      if (e.target.type === 'radio') return;

      const preset = card.dataset.preset;
      const radio = card.querySelector('input[type="radio"]');

      if (radio) {
        radio.checked = true;
        selectedPreset = preset;

        // Update visual selection
        presetCards.forEach(c => c.classList.remove('preset-card-selected'));
        card.classList.add('preset-card-selected');

        console.log(`🎯 Selected preset: ${preset}`);
      }
    });
  });

  // Handle radio button changes
  const radios = document.querySelectorAll('input[name="sauce-preset"]');
  radios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      selectedPreset = e.target.value;

      // Update visual selection
      presetCards.forEach(c => c.classList.remove('preset-card-selected'));
      const selectedCard = document.querySelector(`.preset-card[data-preset="${selectedPreset}"]`);
      if (selectedCard) {
        selectedCard.classList.add('preset-card-selected');
      }

      console.log(`🎯 Preset changed via radio: ${selectedPreset}`);
    });
  });

  // Handle Apply & Continue button
  const applyBtn = document.getElementById('apply-preset-btn');
  if (applyBtn) {
    applyBtn.addEventListener('click', () => {
      console.log(`🎯 Applying preset: ${selectedPreset}`);

      // Apply preset algorithm
      const assignments = applyPreset(selectedPreset, selectedSauces, wingDistribution);

      // Update state with new assignments
      const sauceAssignments = {
        selectedSauces,
        appliedPreset: selectedPreset,
        assignments,
        summary: calculateSummaryPlaceholder(assignments)
      };

      updateState('currentConfig.sauceAssignments', sauceAssignments);

      // Trigger callback (transition to summary screen)
      if (onPresetApplied) {
        onPresetApplied(selectedPreset, assignments);
      }

      console.log('✅ Preset applied successfully');
    });
  }

  // Handle Skip to Custom button
  const skipBtn = document.getElementById('skip-to-custom-btn');
  if (skipBtn) {
    skipBtn.addEventListener('click', () => {
      console.log('🎨 Skipping to custom distribution');

      // Apply custom preset (empty assignments)
      const assignments = applyPreset('custom', selectedSauces, wingDistribution);

      // Update state
      const sauceAssignments = {
        selectedSauces,
        appliedPreset: 'custom',
        assignments,
        summary: calculateSummaryPlaceholder(assignments)
      };

      updateState('currentConfig.sauceAssignments', sauceAssignments);

      // Trigger callback (go directly to summary screen with empty assignments)
      if (onPresetApplied) {
        onPresetApplied('custom', assignments);
      }

      console.log('✅ Skipped to custom distribution');
    });
  }
}

/**
 * Calculate summary placeholder (full calculation in state service)
 * @param {Object} assignments - Assignments object
 * @returns {Object} Summary placeholder
 */
function calculateSummaryPlaceholder(assignments) {
  let totalWingsAssigned = 0;

  Object.values(assignments).forEach(wingTypeAssignments => {
    wingTypeAssignments.forEach(a => {
      totalWingsAssigned += a.wingCount || 0;
    });
  });

  return {
    totalWingsAssigned,
    byApplicationMethod: {
      tossed: totalWingsAssigned,
      onTheSide: 0
    },
    containersNeeded: 0,
    validations: {
      boneless: { valid: true, errors: [] },
      boneIn: { valid: true, errors: [] },
      cauliflower: { valid: true, errors: [] },
      overall: { valid: true, errors: [] }
    }
  };
}
