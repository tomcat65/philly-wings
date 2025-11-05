/**
 * Sauce Wing Type Editor Modal Component
 * Modal for editing sauce assignments for a single wing type
 *
 * Features:
 * - Number inputs for each selected sauce
 * - Live validation with progress indicators
 * - Application method toggles (instant save per architecture decision)
 * - 100% no sauce confirmation dialog (per architecture decision)
 * - Auto-clamp inputs (max = wing count, min = 0)
 * - Reset/Cancel/Save buttons
 * - Dry rub restriction (tossed only)
 *
 * Created: 2025-11-03
 * Epic: SP-SAUCE-ASSIGNMENT-001
 * Story: SP-SAUCE-STORY-4
 */

import { getState, updateState } from '../../services/shared-platter-state-service.js';
import { validateWingTypeAssignment, calculateSauceAssignmentSummary } from '../../services/shared-platter-state-service.js';

/**
 * Render wing type editor modal
 * @param {string} wingType - 'boneless' | 'boneIn' | 'cauliflower'
 * @param {number} totalWings - Total wings for this type
 * @param {Array} selectedSauces - All selected sauces
 * @param {Array} currentAssignments - Current assignments for this wing type
 * @returns {string} HTML markup
 */
export function renderWingTypeEditorModal(wingType, totalWings, selectedSauces, currentAssignments) {
  const wingTypeNames = {
    boneless: 'Boneless Wings',
    boneIn: 'Bone-In Wings',
    cauliflower: 'Cauliflower Wings'
  };

  const displayName = wingTypeNames[wingType] || wingType;

  // Create a map of current assignments by sauce ID
  const assignmentMap = {};
  currentAssignments.forEach(a => {
    assignmentMap[a.sauceId] = {
      wingCount: a.wingCount || 0,
      applicationMethod: a.applicationMethod || 'tossed'
    };
  });

  // Calculate current totals
  const assignedWings = currentAssignments.reduce((sum, a) => sum + (a.wingCount || 0), 0);
  const unassignedWings = totalWings - assignedWings;

  // Initial validation
  const validation = validateWingTypeAssignment(wingType, currentAssignments, totalWings);

  return `
    <!-- Modal Overlay -->
    <div class="modal-overlay" id="wing-type-editor-modal">
      <div class="modal-container">
        <!-- Modal Header -->
        <div class="modal-header">
          <h2 class="modal-title">Edit ${displayName}</h2>
          <button
            type="button"
            class="modal-close-btn"
            id="modal-close-btn"
            aria-label="Close modal">
            ✕
          </button>
        </div>

        <!-- Progress Indicator -->
        <div class="editor-progress">
          <div class="progress-bar-container">
            <div
              class="progress-bar"
              id="progress-bar"
              style="width: ${validation.percentComplete}%"
              data-percent="${validation.percentComplete}">
            </div>
          </div>
          <div class="progress-text" id="progress-text">
            ${assignedWings}/${totalWings} wings assigned (${validation.percentComplete}%)
          </div>
        </div>

        <!-- Validation Status -->
        <div class="editor-validation" id="editor-validation">
          ${renderValidationMessage(validation, totalWings)}
        </div>

        <!-- Sauce Input List -->
        <div class="sauce-input-list">
          ${selectedSauces.map(sauce => renderSauceInputRow(sauce, assignmentMap[sauce.id], totalWings, wingType)).join('')}
        </div>

        <!-- No Sauce Section -->
        <div class="no-sauce-section">
          <div class="no-sauce-header">
            <span class="no-sauce-icon">🚫</span>
            <span class="no-sauce-label">No Sauce</span>
            <span class="no-sauce-count" id="no-sauce-count">${unassignedWings} wings</span>
          </div>
          <p class="no-sauce-description">
            Wings without sauce assignment will be served plain (no sauce applied)
          </p>
        </div>

        <!-- Modal Actions -->
        <div class="modal-actions">
          <button
            type="button"
            id="reset-btn"
            class="btn-secondary"
            aria-label="Reset to original values">
            🔄 Reset
          </button>
          <button
            type="button"
            id="cancel-btn"
            class="btn-secondary"
            aria-label="Cancel and close">
            Cancel
          </button>
          <button
            type="button"
            id="save-btn"
            class="btn-primary"
            ${!validation.valid ? 'disabled' : ''}
            aria-label="Save changes">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render validation message
 * @param {Object} validation - Validation result
 * @param {number} totalWings - Total wings
 * @returns {string} HTML markup
 */
function renderValidationMessage(validation, totalWings) {
  if (totalWings === 0) {
    return '<div class="validation-message validation-empty">No wings to assign</div>';
  }

  const { valid, assignedTotal, errors } = validation;

  if (valid && assignedTotal === totalWings) {
    return '<div class="validation-message validation-success">✓ All wings assigned!</div>';
  }

  if (assignedTotal > totalWings) {
    return `<div class="validation-message validation-error">❌ Too many wings assigned! Remove ${assignedTotal - totalWings}.</div>`;
  }

  if (assignedTotal < totalWings) {
    return `<div class="validation-message validation-warning">⚠️ Assign ${totalWings - assignedTotal} more wings to complete.</div>`;
  }

  if (errors.length > 0) {
    return `<div class="validation-message validation-error">❌ ${errors[0]}</div>`;
  }

  return '';
}

/**
 * Render a single sauce input row
 * @param {Object} sauce - Sauce object
 * @param {Object} assignment - Current assignment {wingCount, applicationMethod}
 * @param {number} totalWings - Total wings for this type
 * @param {string} wingType - Wing type identifier
 * @returns {string} HTML markup
 */
function renderSauceInputRow(sauce, assignment, totalWings, wingType) {
  const currentWingCount = assignment?.wingCount || 0;
  const currentMethod = assignment?.applicationMethod || 'tossed';
  const isDryRub = sauce.isDryRub || sauce.category === 'dry-rub';

  return `
    <div class="sauce-input-row" data-sauce-id="${sauce.id}">
      <!-- Sauce Info -->
      <div class="sauce-input-info">
        <span class="sauce-input-name">${sauce.name}</span>
        ${isDryRub ? '<span class="dry-rub-badge">Dry Rub</span>' : ''}
      </div>

      <!-- Wing Count Input -->
      <div class="sauce-input-controls">
        <div class="wing-count-input-group">
          <button
            type="button"
            class="wing-count-btn wing-count-decrement"
            data-sauce-id="${sauce.id}"
            aria-label="Decrease wing count">
            -
          </button>
          <input
            type="number"
            class="wing-count-input"
            id="wing-count-${sauce.id}"
            data-sauce-id="${sauce.id}"
            value="${currentWingCount}"
            min="0"
            max="${totalWings}"
            aria-label="Number of wings for ${sauce.name}">
          <button
            type="button"
            class="wing-count-btn wing-count-increment"
            data-sauce-id="${sauce.id}"
            aria-label="Increase wing count">
            +
          </button>
        </div>

        <!-- Application Method Toggle -->
        ${isDryRub ? `
          <div class="method-toggle method-toggle-disabled">
            <span class="method-disabled-label">Tossed Only</span>
          </div>
        ` : `
          <div class="method-toggle" data-sauce-id="${sauce.id}">
            <button
              type="button"
              class="method-toggle-btn ${currentMethod === 'tossed' ? 'method-toggle-active' : ''}"
              data-sauce-id="${sauce.id}"
              data-method="tossed"
              aria-label="Toss wings in sauce">
              🌪️
            </button>
            <button
              type="button"
              class="method-toggle-btn ${currentMethod === 'on-the-side' ? 'method-toggle-active' : ''}"
              data-sauce-id="${sauce.id}"
              data-method="on-the-side"
              aria-label="Serve sauce on the side">
              🥡
            </button>
          </div>
        `}
      </div>
    </div>
  `;
}

/**
 * Initialize wing type editor modal with event handlers
 * @param {string} wingType - Wing type identifier
 * @param {number} totalWings - Total wings for this type
 * @param {Array} selectedSauces - All selected sauces
 * @param {Array} originalAssignments - Original assignments (for reset)
 * @param {Function} onSave - Callback when save button clicked
 * @param {Function} onCancel - Callback when cancel/close
 */
export function initWingTypeEditorModal(wingType, totalWings, selectedSauces, originalAssignments, onSave, onCancel) {
  console.log(`✏️ Initializing wing type editor: ${wingType}`);

  // Track current state in memory
  let currentAssignments = JSON.parse(JSON.stringify(originalAssignments));

  // Helper: Update validation and progress
  function updateValidation() {
    const validation = validateWingTypeAssignment(wingType, currentAssignments, totalWings);
    const assignedWings = currentAssignments.reduce((sum, a) => sum + (a.wingCount || 0), 0);
    const unassignedWings = totalWings - assignedWings;

    // Update progress bar
    const progressBar = document.getElementById('progress-bar');
    if (progressBar) {
      progressBar.style.width = `${validation.percentComplete}%`;
      progressBar.dataset.percent = validation.percentComplete;

      // Color code progress bar
      if (validation.valid && assignedWings === totalWings) {
        progressBar.style.background = 'linear-gradient(135deg, #28a745 0%, #34ce57 100%)';
      } else if (assignedWings > totalWings) {
        progressBar.style.background = 'linear-gradient(135deg, #dc3545 0%, #e74c3c 100%)';
      } else {
        progressBar.style.background = 'linear-gradient(135deg, #ffc107 0%, #ffb300 100%)';
      }
    }

    // Update progress text
    const progressText = document.getElementById('progress-text');
    if (progressText) {
      progressText.textContent = `${assignedWings}/${totalWings} wings assigned (${validation.percentComplete}%)`;
    }

    // Update validation message
    const validationEl = document.getElementById('editor-validation');
    if (validationEl) {
      validationEl.innerHTML = renderValidationMessage(validation, totalWings);
    }

    // Update no sauce count
    const noSauceCount = document.getElementById('no-sauce-count');
    if (noSauceCount) {
      noSauceCount.textContent = `${unassignedWings} wings`;
    }

    // Update save button state
    const saveBtn = document.getElementById('save-btn');
    if (saveBtn) {
      saveBtn.disabled = !validation.valid;
    }
  }

  // Helper: Find or create assignment for sauce
  function getOrCreateAssignment(sauceId) {
    let assignment = currentAssignments.find(a => a.sauceId === sauceId);
    if (!assignment) {
      const sauce = selectedSauces.find(s => s.id === sauceId);
      assignment = {
        sauceId,
        sauceName: sauce.name,
        sauceCategory: sauce.category,
        wingCount: 0,
        applicationMethod: 'tossed'
      };
      currentAssignments.push(assignment);
    }
    return assignment;
  }

  // Helper: Check if 100% no sauce and confirm
  function checkNoSauceConfirmation() {
    const totalAssigned = currentAssignments.reduce((sum, a) => sum + (a.wingCount || 0), 0);
    
    if (totalAssigned === 0 && totalWings > 0) {
      // 100% no sauce - show confirmation dialog per architecture decision #2
      const confirmed = confirm(
        `⚠️ No Sauce Confirmation\n\n` +
        `You have assigned ZERO wings to any sauce. All ${totalWings} ${wingType} wings will be served plain (no sauce).\n\n` +
        `Are you sure you want to continue?`
      );
      return confirmed;
    }
    
    return true; // No confirmation needed
  }

  // Handle wing count input changes (with auto-clamp)
  const wingCountInputs = document.querySelectorAll('.wing-count-input');
  wingCountInputs.forEach(input => {
    input.addEventListener('input', (e) => {
      const sauceId = e.target.dataset.sauceId;
      let value = parseInt(e.target.value) || 0;

      // Auto-clamp: min = 0, max = totalWings
      if (value < 0) value = 0;
      if (value > totalWings) value = totalWings;

      // Update input if clamped
      if (parseInt(e.target.value) !== value) {
        e.target.value = value;
      }

      // Update assignment
      const assignment = getOrCreateAssignment(sauceId);
      assignment.wingCount = value;

      // Remove assignment if count is 0
      if (value === 0) {
        currentAssignments = currentAssignments.filter(a => a.sauceId !== sauceId);
      }

      updateValidation();
      console.log(`Updated ${sauceId}: ${value} wings`);
    });

    // Handle blur for final validation
    input.addEventListener('blur', (e) => {
      let value = parseInt(e.target.value) || 0;
      if (value < 0) value = 0;
      if (value > totalWings) value = totalWings;
      e.target.value = value;
    });
  });

  // Handle increment/decrement buttons
  const decrementBtns = document.querySelectorAll('.wing-count-decrement');
  decrementBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const sauceId = e.target.dataset.sauceId;
      const input = document.getElementById(`wing-count-${sauceId}`);
      let value = parseInt(input.value) || 0;
      
      if (value > 0) {
        value--;
        input.value = value;

        // Update assignment
        const assignment = getOrCreateAssignment(sauceId);
        assignment.wingCount = value;

        // Remove if 0
        if (value === 0) {
          currentAssignments = currentAssignments.filter(a => a.sauceId !== sauceId);
        }

        updateValidation();
        console.log(`Decremented ${sauceId}: ${value} wings`);
      }
    });
  });

  const incrementBtns = document.querySelectorAll('.wing-count-increment');
  incrementBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const sauceId = e.target.dataset.sauceId;
      const input = document.getElementById(`wing-count-${sauceId}`);
      let value = parseInt(input.value) || 0;
      
      if (value < totalWings) {
        value++;
        input.value = value;

        // Update assignment
        const assignment = getOrCreateAssignment(sauceId);
        assignment.wingCount = value;

        updateValidation();
        console.log(`Incremented ${sauceId}: ${value} wings`);
      }
    });
  });

  // Handle application method toggles (instant save)
  const methodToggles = document.querySelectorAll('.method-toggle-btn');
  methodToggles.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const sauceId = e.target.dataset.sauceId;
      const newMethod = e.target.dataset.method;

      console.log(`🌪️ Toggling method for ${sauceId}: ${newMethod}`);

      // Update assignment
      const assignment = getOrCreateAssignment(sauceId);
      assignment.applicationMethod = newMethod;

      // Update UI
      const toggleContainer = e.target.closest('.method-toggle');
      toggleContainer.querySelectorAll('.method-toggle-btn').forEach(b => {
        b.classList.remove('method-toggle-active');
      });
      e.target.classList.add('method-toggle-active');

      console.log('✅ Method updated');
    });
  });

  // Handle reset button
  const resetBtn = document.getElementById('reset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      console.log('🔄 Resetting to original values');

      // Reset assignments
      currentAssignments = JSON.parse(JSON.stringify(originalAssignments));

      // Reset all inputs to original values
      const assignmentMap = {};
      originalAssignments.forEach(a => {
        assignmentMap[a.sauceId] = a;
      });

      selectedSauces.forEach(sauce => {
        const input = document.getElementById(`wing-count-${sauce.id}`);
        const assignment = assignmentMap[sauce.id];
        
        if (input) {
          input.value = assignment?.wingCount || 0;
        }

        // Reset method toggles
        const toggleContainer = document.querySelector(`.method-toggle[data-sauce-id="${sauce.id}"]`);
        if (toggleContainer) {
          const method = assignment?.applicationMethod || 'tossed';
          toggleContainer.querySelectorAll('.method-toggle-btn').forEach(btn => {
            btn.classList.remove('method-toggle-active');
            if (btn.dataset.method === method) {
              btn.classList.add('method-toggle-active');
            }
          });
        }
      });

      updateValidation();
      console.log('✅ Reset complete');
    });
  }

  // Handle cancel button
  const cancelBtn = document.getElementById('cancel-btn');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      console.log('❌ Cancelled');
      
      if (onCancel) {
        onCancel();
      }
    });
  }

  // Handle close button (same as cancel)
  const closeBtn = document.getElementById('modal-close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      console.log('❌ Closed');
      
      if (onCancel) {
        onCancel();
      }
    });
  }

  // Handle save button
  const saveBtn = document.getElementById('save-btn');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      console.log('💾 Saving changes');

      // Check for 100% no sauce confirmation
      if (!checkNoSauceConfirmation()) {
        console.log('❌ No sauce confirmation declined');
        return;
      }

      const validation = validateWingTypeAssignment(wingType, currentAssignments, totalWings);
      
      if (!validation.valid) {
        console.warn('Cannot save - validation failed');
        return;
      }

      if (onSave) {
        onSave(currentAssignments);
      }

      console.log('✅ Changes saved');
    });
  }

  // Handle click outside modal to close
  const modalOverlay = document.getElementById('wing-type-editor-modal');
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      // Only close if clicking the overlay itself, not the modal content
      if (e.target === modalOverlay) {
        console.log('❌ Closed via overlay click');
        
        if (onCancel) {
          onCancel();
        }
      }
    });
  }
}

/**
 * Open wing type editor modal
 * @param {string} wingType - Wing type to edit
 * @param {Function} onSave - Callback when saved
 */
export function openWingTypeEditor(wingType, onSave) {
  console.log(`🔓 Opening editor for: ${wingType}`);

  const state = getState();
  const { selectedSauces, assignments } = state.currentConfig.sauceAssignments;
  const wingDistribution = state.currentConfig.wingDistribution;
  const totalWings = wingDistribution[wingType] || 0;
  const currentAssignments = assignments[wingType] || [];

  // Create modal container if it doesn't exist
  let modalRoot = document.getElementById('modal-root');
  if (!modalRoot) {
    modalRoot = document.createElement('div');
    modalRoot.id = 'modal-root';
    document.body.appendChild(modalRoot);
  }

  // Render modal
  modalRoot.innerHTML = renderWingTypeEditorModal(wingType, totalWings, selectedSauces, currentAssignments);

  // Initialize event handlers
  initWingTypeEditorModal(
    wingType,
    totalWings,
    selectedSauces,
    currentAssignments,
    (updatedAssignments) => {
      // Save callback
      updateState(`currentConfig.sauceAssignments.assignments.${wingType}`, updatedAssignments);

      // Recalculate summary
      const allAssignments = {
        ...state.currentConfig.sauceAssignments.assignments,
        [wingType]: updatedAssignments
      };
      const summary = calculateSauceAssignmentSummary(allAssignments, wingDistribution);
      updateState('currentConfig.sauceAssignments.summary', summary);

      console.log('✅ Assignments updated in state');

      // Close modal
      closeWingTypeEditor();

      // Trigger callback
      if (onSave) {
        onSave(wingType, updatedAssignments);
      }
    },
    () => {
      // Cancel callback
      closeWingTypeEditor();
    }
  );

  // Show modal with animation
  const modal = document.getElementById('wing-type-editor-modal');
  if (modal) {
    modal.style.display = 'flex';
    // Trigger reflow for animation
    void modal.offsetWidth;
    modal.classList.add('modal-show');
  }

  // Prevent body scroll
  document.body.style.overflow = 'hidden';
}

/**
 * Close wing type editor modal
 */
export function closeWingTypeEditor() {
  console.log('🔒 Closing editor modal');

  const modal = document.getElementById('wing-type-editor-modal');
  if (modal) {
    modal.classList.remove('modal-show');
    setTimeout(() => {
      modal.style.display = 'none';
      
      // Clean up modal root
      const modalRoot = document.getElementById('modal-root');
      if (modalRoot) {
        modalRoot.innerHTML = '';
      }
    }, 300); // Match CSS transition duration
  }

  // Restore body scroll
  document.body.style.overflow = '';
}
