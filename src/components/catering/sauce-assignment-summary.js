/**
 * Sauce Assignment Summary Component
 * Displays per-wing-type sauce assignments with edit and application method controls
 *
 * Features:
 * - Per-wing-type assignment display (boneless, bone-in, cauliflower)
 * - Application method toggles (tossed/on-the-side) with instant save
 * - Container count display (informational, FREE)
 * - Edit buttons to open wing type editor modal
 * - Reset All to Preset button
 * - Live validation feedback (75/80 ⚠️, 80/80 ✓, 85/80 ❌)
 * - No sauce explicit representation (per architecture decision)
 *
 * Created: 2025-11-03
 * Epic: SP-SAUCE-ASSIGNMENT-001
 * Story: SP-SAUCE-STORY-3
 */

import { getState, updateState } from '../../services/shared-platter-state-service.js';
import {
  applyPreset,
  validateWingTypeAssignment,
  calculateSauceAssignmentSummary
} from '../../services/shared-platter-state-service.js';

/**
 * Get wing type display configuration
 * @param {string} wingType - 'boneless' | 'boneIn' | 'cauliflower'
 * @returns {Object} Display configuration
 */
function getWingTypeConfig(wingType) {
  const configs = {
    boneless: {
      displayName: 'Boneless Wings',
      icon: '🍗',
      emoji: '🐔'
    },
    boneIn: {
      displayName: 'Bone-In Wings',
      icon: '🦴',
      emoji: '🍖'
    },
    cauliflower: {
      displayName: 'Cauliflower Wings',
      icon: '🥦',
      emoji: '🌱'
    }
  };
  return configs[wingType] || configs.boneless;
}

/**
 * Render validation status indicator
 * @param {Object} validation - Validation result object
 * @param {number} totalWings - Total wings for this type
 * @returns {string} HTML markup
 */
function renderValidationStatus(validation, totalWings) {
  if (totalWings === 0) {
    return '<div class="validation-status validation-empty">No wings to assign</div>';
  }

  const { valid, assignedTotal, percentComplete, errors } = validation;

  let statusClass = 'validation-warning';
  let statusIcon = '⚠️';
  let statusText = `${assignedTotal}/${totalWings} wings assigned (${percentComplete}%)`;

  if (valid && assignedTotal === totalWings) {
    statusClass = 'validation-success';
    statusIcon = '✓';
    statusText = `${assignedTotal}/${totalWings} wings - Complete!`;
  } else if (assignedTotal > totalWings) {
    statusClass = 'validation-error';
    statusIcon = '❌';
    statusText = `Too many! ${assignedTotal}/${totalWings} wings`;
  }

  const errorList = errors.length > 0
    ? `<ul class="validation-errors">${errors.map(e => `<li>${e}</li>`).join('')}</ul>`
    : '';

  return `
    <div class="validation-status ${statusClass}">
      <span class="validation-icon">${statusIcon}</span>
      <span class="validation-text">${statusText}</span>
      ${errorList}
    </div>
  `;
}

/**
 * Render application method toggle
 * @param {string} wingType - Wing type identifier
 * @param {string} sauceId - Sauce identifier
 * @param {string} currentMethod - 'tossed' | 'on-the-side'
 * @param {boolean} isDryRub - Whether sauce is a dry rub
 * @returns {string} HTML markup
 */
function renderApplicationMethodToggle(wingType, sauceId, currentMethod, isDryRub) {
  // Dry rubs can only be tossed
  if (isDryRub) {
    return `
      <div class="application-method-toggle disabled">
        <span class="method-label">Tossed Only (Dry Rub)</span>
      </div>
    `;
  }

  return `
    <div class="application-method-toggle">
      <button
        type="button"
        class="method-btn ${currentMethod === 'tossed' ? 'method-btn-active' : ''}"
        data-wing-type="${wingType}"
        data-sauce-id="${sauceId}"
        data-method="tossed"
        aria-label="Toss wings in sauce">
        🌪️ Tossed
      </button>
      <button
        type="button"
        class="method-btn ${currentMethod === 'on-the-side' ? 'method-btn-active' : ''}"
        data-wing-type="${wingType}"
        data-sauce-id="${sauceId}"
        data-method="on-the-side"
        aria-label="Serve sauce on the side">
        🥡 On the Side
      </button>
    </div>
  `;
}

/**
 * Calculate container count for on-the-side sauces
 * @param {number} wingCount - Number of wings
 * @returns {number} Container count
 */
function calculateContainers(wingCount) {
  return Math.ceil(wingCount * 0.5);
}

/**
 * Render a single sauce assignment row
 * @param {string} wingType - Wing type identifier
 * @param {Object} assignment - Assignment object
 * @param {Array} selectedSauces - Full sauce objects for metadata
 * @returns {string} HTML markup
 */
function renderSauceAssignmentRow(wingType, assignment, selectedSauces) {
  const sauce = selectedSauces.find(s => s.id === assignment.sauceId);
  const isDryRub = sauce?.isDryRub || assignment.sauceCategory === 'dry-rub';
  const containerCount = assignment.applicationMethod === 'on-the-side'
    ? calculateContainers(assignment.wingCount)
    : 0;

  return `
    <div class="sauce-assignment-row">
      <div class="assignment-sauce-info">
        <span class="sauce-name">${assignment.sauceName}</span>
        <span class="sauce-wing-count">${assignment.wingCount} wings</span>
      </div>
      
      ${renderApplicationMethodToggle(wingType, assignment.sauceId, assignment.applicationMethod, isDryRub)}
      
      ${containerCount > 0 ? `
        <div class="container-info">
          <span class="container-icon">🥡</span>
          <span class="container-count">${containerCount} container${containerCount !== 1 ? 's' : ''}</span>
          <span class="container-note">(FREE)</span>
        </div>
      ` : ''}
    </div>
  `;
}

/**
 * Render explicit "No Sauce" assignment row
 * @param {string} wingType - Wing type identifier
 * @param {number} wingCount - Number of unassigned wings
 * @returns {string} HTML markup
 */
function renderNoSauceRow(wingType, wingCount) {
  if (wingCount <= 0) return '';

  return `
    <div class="sauce-assignment-row no-sauce-row">
      <div class="assignment-sauce-info">
        <span class="sauce-name">🚫 No Sauce</span>
        <span class="sauce-wing-count">${wingCount} wings</span>
      </div>
      <div class="no-sauce-note">Wings will be served plain (no sauce applied)</div>
    </div>
  `;
}

/**
 * Render wing type section
 * @param {string} wingType - 'boneless' | 'boneIn' | 'cauliflower'
 * @param {Array} assignments - Assignments for this wing type
 * @param {number} totalWings - Total wings for this type
 * @param {Object} validation - Validation result
 * @param {Array} selectedSauces - Full sauce objects
 * @returns {string} HTML markup
 */
function renderWingTypeSection(wingType, assignments, totalWings, validation, selectedSauces) {
  if (totalWings === 0) return ''; // Skip wing types with zero count

  const config = getWingTypeConfig(wingType);
  
  // Calculate unassigned wings for explicit "No Sauce" representation
  const assignedWings = assignments.reduce((sum, a) => sum + (a.wingCount || 0), 0);
  const unassignedWings = totalWings - assignedWings;

  return `
    <div class="wing-type-section" data-wing-type="${wingType}">
      <!-- Header -->
      <div class="wing-type-header">
        <div class="wing-type-title">
          <span class="wing-type-icon">${config.icon}</span>
          <h3 class="wing-type-name">${config.displayName}</h3>
          <span class="wing-type-count">${totalWings} wings</span>
        </div>
        <button
          type="button"
          class="btn-edit-wing-type"
          data-wing-type="${wingType}"
          aria-label="Edit ${config.displayName} assignments">
          ✏️ Edit
        </button>
      </div>

      <!-- Validation Status -->
      ${renderValidationStatus(validation, totalWings)}

      <!-- Assignments -->
      <div class="sauce-assignments-list">
        ${assignments.map(a => renderSauceAssignmentRow(wingType, a, selectedSauces)).join('')}
        ${renderNoSauceRow(wingType, unassignedWings)}
      </div>
    </div>
  `;
}

/**
 * Render sauce assignment summary
 * @param {Object} wingDistribution - Wing distribution from state
 * @returns {string} HTML markup
 */
export function renderSauceAssignmentSummary(wingDistribution) {
  const state = getState();
  const sauceAssignments = state.currentConfig.sauceAssignments || {};
  const { selectedSauces = [], appliedPreset, assignments = {} } = sauceAssignments;

  if (!appliedPreset || selectedSauces.length === 0) {
    return `
      <div class="sauce-assignment-summary">
        <div class="summary-empty-state">
          <p>No sauce assignments yet. Please select sauces and choose a distribution preset.</p>
        </div>
      </div>
    `;
  }

  // Validate each wing type
  const validations = {
    boneless: validateWingTypeAssignment('boneless', assignments.boneless || [], wingDistribution.boneless || 0),
    boneIn: validateWingTypeAssignment('boneIn', assignments.boneIn || [], wingDistribution.boneIn || 0),
    cauliflower: validateWingTypeAssignment('cauliflower', assignments.cauliflower || [], wingDistribution.cauliflower || 0)
  };

  // Check overall validity
  const allValid = validations.boneless.valid && validations.boneIn.valid && validations.cauliflower.valid;
  const totalWings = (wingDistribution.boneless || 0) + (wingDistribution.boneIn || 0) + (wingDistribution.cauliflower || 0);

  return `
    <div class="sauce-assignment-summary">
      <!-- Summary Header -->
      <div class="summary-header">
        <div class="summary-title-section">
          <h2 class="summary-title">📋 Sauce Assignment Summary</h2>
          <p class="summary-subtitle">
            ${totalWings} wings • ${selectedSauces.length} sauce${selectedSauces.length !== 1 ? 's' : ''} • 
            ${appliedPreset === 'custom' ? 'Custom' : appliedPreset === 'all-same' ? 'All Same' : appliedPreset === 'even-mix' ? 'Even Mix' : 'One Per Type'} preset
          </p>
        </div>

        <button
          type="button"
          id="reset-to-preset-btn"
          class="btn-reset-preset"
          aria-label="Reset all assignments back to preset">
          🔄 Reset All to Preset
        </button>
      </div>

      <!-- Overall Status -->
      ${allValid ? `
        <div class="overall-status overall-status-success">
          <span class="status-icon">✅</span>
          <span class="status-text">All wings assigned! Ready to continue.</span>
        </div>
      ` : `
        <div class="overall-status overall-status-warning">
          <span class="status-icon">⚠️</span>
          <span class="status-text">Some wings need assignment. Edit wing types to complete.</span>
        </div>
      `}

      <!-- Wing Type Sections -->
      <div class="wing-type-sections">
        ${renderWingTypeSection('boneless', assignments.boneless || [], wingDistribution.boneless || 0, validations.boneless, selectedSauces)}
        ${renderWingTypeSection('boneIn', assignments.boneIn || [], wingDistribution.boneIn || 0, validations.boneIn, selectedSauces)}
        ${renderWingTypeSection('cauliflower', assignments.cauliflower || [], wingDistribution.cauliflower || 0, validations.cauliflower, selectedSauces)}
      </div>

      <!-- Action Buttons -->
      <div class="summary-actions">
        <button
          type="button"
          id="continue-to-order-btn"
          class="btn-primary btn-continue"
          ${!allValid ? 'disabled' : ''}
          aria-label="Continue to order summary">
          Continue to Order Summary →
        </button>
      </div>
    </div>
  `;
}

/**
 * Initialize sauce assignment summary with event handlers
 * @param {Object} wingDistribution - Wing distribution from state
 * @param {Function} onEditWingType - Callback when edit button clicked (wingType)
 * @param {Function} onContinue - Callback when continue button clicked
 */
export function initSauceAssignmentSummary(wingDistribution, onEditWingType, onContinue) {
  console.log('📋 Initializing sauce assignment summary');

  // Handle application method toggles (instant save)
  const methodButtons = document.querySelectorAll('.method-btn');
  methodButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const wingType = e.target.dataset.wingType;
      const sauceId = e.target.dataset.sauceId;
      const newMethod = e.target.dataset.method;

      console.log(`🌪️ Toggling application method: ${wingType} - ${sauceId} - ${newMethod}`);

      // Get current state
      const state = getState();
      const assignments = state.currentConfig.sauceAssignments.assignments[wingType] || [];

      // Find and update the specific assignment
      const updatedAssignments = assignments.map(a => {
        if (a.sauceId === sauceId) {
          return { ...a, applicationMethod: newMethod };
        }
        return a;
      });

      // Instant save to state
      updateState(`currentConfig.sauceAssignments.assignments.${wingType}`, updatedAssignments);

      // Recalculate summary
      const allAssignments = {
        ...state.currentConfig.sauceAssignments.assignments,
        [wingType]: updatedAssignments
      };
      const summary = calculateSauceAssignmentSummary(allAssignments, wingDistribution);
      updateState('currentConfig.sauceAssignments.summary', summary);

      // Update UI (toggle active state)
      const parentToggle = e.target.closest('.application-method-toggle');
      parentToggle.querySelectorAll('.method-btn').forEach(b => b.classList.remove('method-btn-active'));
      e.target.classList.add('method-btn-active');

      // Update container count display if needed
      const assignment = updatedAssignments.find(a => a.sauceId === sauceId);
      const row = e.target.closest('.sauce-assignment-row');
      const containerInfo = row.querySelector('.container-info');
      
      if (assignment.applicationMethod === 'on-the-side') {
        const containerCount = calculateContainers(assignment.wingCount);
        if (!containerInfo) {
          const containerHTML = `
            <div class="container-info">
              <span class="container-icon">🥡</span>
              <span class="container-count">${containerCount} container${containerCount !== 1 ? 's' : ''}</span>
              <span class="container-note">(FREE)</span>
            </div>
          `;
          row.insertAdjacentHTML('beforeend', containerHTML);
        } else {
          containerInfo.querySelector('.container-count').textContent = `${containerCount} container${containerCount !== 1 ? 's' : ''}`;
        }
      } else {
        if (containerInfo) {
          containerInfo.remove();
        }
      }

      console.log('✅ Application method updated');
    });
  });

  // Handle edit wing type buttons
  const editButtons = document.querySelectorAll('.btn-edit-wing-type');
  editButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const wingType = e.target.dataset.wingType;
      console.log(`✏️ Opening editor for: ${wingType}`);
      
      if (onEditWingType) {
        onEditWingType(wingType);
      }
    });
  });

  // Handle reset to preset button
  const resetBtn = document.getElementById('reset-to-preset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      console.log('🔄 Resetting to preset');

      const state = getState();
      const { appliedPreset, selectedSauces } = state.currentConfig.sauceAssignments;

      if (!appliedPreset || appliedPreset === 'custom') {
        console.warn('Cannot reset - no preset applied or custom preset');
        return;
      }

      // Reapply the preset
      const newAssignments = applyPreset(appliedPreset, selectedSauces, wingDistribution);

      // Update state
      updateState('currentConfig.sauceAssignments.assignments', newAssignments);

      // Recalculate summary
      const summary = calculateSauceAssignmentSummary(newAssignments, wingDistribution);
      updateState('currentConfig.sauceAssignments.summary', summary);

      // Re-render the component
      const container = document.querySelector('.sauce-assignment-summary');
      if (container) {
        container.innerHTML = renderSauceAssignmentSummary(wingDistribution);
        // Re-initialize after re-render
        initSauceAssignmentSummary(wingDistribution, onEditWingType, onContinue);
      }

      console.log('✅ Reset to preset complete');
    });
  }

  // Handle continue button
  const continueBtn = document.getElementById('continue-to-order-btn');
  if (continueBtn) {
    continueBtn.addEventListener('click', () => {
      console.log('📋 Continue to order summary');

      if (onContinue) {
        onContinue();
      }
    });
  }
}
