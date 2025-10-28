/**
 * Wing Distribution Confirmation Screen
 * Shows preview of wing distribution before proceeding to package recommendations
 */

import { getState } from '../../services/shared-platter-state-service.js';
import { translateWingDistribution, applyWingDistribution } from './conversational-wing-distribution.js';

/**
 * Renders the distribution confirmation modal
 */
export function renderDistributionConfirmation() {
  return `
    <div id="distribution-confirmation-modal" class="distribution-confirmation-modal" style="display: none;">
      <div class="confirmation-overlay"></div>
      <div class="confirmation-card">
        <div class="confirmation-header">
          <h2>✅ Your Wing Distribution</h2>
        </div>

        <div id="confirmation-content" class="confirmation-content">
          <!-- Content will be dynamically populated -->
        </div>

        <div class="confirmation-actions">
          <button type="button" class="btn-secondary" id="adjust-distribution-btn">
            Adjust Split
          </button>
          <button type="button" class="btn-primary" id="confirm-distribution-btn">
            Looks Great!
          </button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Shows the confirmation modal with current distribution
 */
export function showDistributionConfirmation() {
  const modal = document.getElementById('distribution-confirmation-modal');
  if (!modal) {
    console.error('Distribution confirmation modal not found');
    return;
  }

  const state = getState();
  const selection = state.eventDetails?.wingDistributionPreference || 'all-traditional';
  const guestCount = state.eventDetails?.guestCount || 25;

  // Get distribution details
  const distribution = translateWingDistribution(selection, guestCount);
  if (!distribution) {
    console.error('Could not translate distribution');
    return;
  }

  // Populate content
  const content = document.getElementById('confirmation-content');
  content.innerHTML = `
    <div class="confirmation-selection">
      <p class="selection-label">Based on your selection:</p>
      <p class="selection-value">"${getSelectionLabel(selection)}"</p>
    </div>

    <div class="confirmation-preview">
      <p class="preview-label">📊 For ${guestCount} guests:</p>
      <ul class="guest-breakdown">
        ${distribution.tradGuests > 0 ? `
          <li>• ~${distribution.tradGuests} guests with traditional wings</li>
        ` : ''}
        ${distribution.vegGuests > 0 ? `
          <li>• ~${distribution.vegGuests} guests with plant-based wings</li>
        ` : ''}
      </ul>
    </div>

    <div class="confirmation-split">
      <p class="split-label">Recommended split:</p>
      <div class="split-visualization">
        ${distribution.traditional > 0 ? `
          <div class="split-bar traditional" style="width: ${distribution.traditional}%">
            <span class="split-percentage">${distribution.traditional}%</span>
            <span class="split-type">🍗 Traditional</span>
          </div>
        ` : ''}
        ${distribution.plantBased > 0 ? `
          <div class="split-bar plant-based" style="width: ${distribution.plantBased}%">
            <span class="split-percentage">${distribution.plantBased}%</span>
            <span class="split-type">🌱 Plant-Based</span>
          </div>
        ` : ''}
      </div>
      <div class="split-details">
        ${distribution.traditional > 0 ? `
          <p>🍗 ${distribution.traditional}% Traditional (bone-in or boneless)</p>
        ` : ''}
        ${distribution.plantBased > 0 ? `
          <p>🌱 ${distribution.plantBased}% Plant-Based (cauliflower wings)</p>
        ` : ''}
      </div>
    </div>

    <div class="confirmation-note">
      <p>💡 You'll be able to fine-tune your wing types when customizing your package</p>
    </div>
  `;

  // Show modal
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

/**
 * Hides the confirmation modal
 */
export function hideDistributionConfirmation() {
  const modal = document.getElementById('distribution-confirmation-modal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }
}

/**
 * Gets the human-readable label for a selection
 */
function getSelectionLabel(selection) {
  const labels = {
    'all-traditional': 'Everyone eats traditional wings',
    'few-vegetarian': 'A few people need vegetarian options',
    'half-vegetarian': 'About half the group is vegetarian',
    'mostly-vegetarian': 'Mostly vegetarian, some meat-eaters',
    'all-vegetarian': 'Everyone is vegetarian/vegan'
  };
  return labels[selection] || selection;
}

/**
 * Initialize distribution confirmation
 */
export function initDistributionConfirmation() {
  // Handle "Looks Great!" button
  const confirmBtn = document.getElementById('confirm-distribution-btn');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', () => {
      hideDistributionConfirmation();

      // Navigate to recommendations
      window.dispatchEvent(new CustomEvent('navigate-to-recommendations', {
        detail: {
          eventDetails: getState().eventDetails
        }
      }));
    });
  }

  // Handle "Adjust Split" button
  const adjustBtn = document.getElementById('adjust-distribution-btn');
  if (adjustBtn) {
    adjustBtn.addEventListener('click', () => {
      hideDistributionConfirmation();
      showAdjustmentInterface();
    });
  }

  // Handle overlay click to close
  const overlay = document.querySelector('.confirmation-overlay');
  if (overlay) {
    overlay.addEventListener('click', () => {
      hideDistributionConfirmation();
    });
  }
}

/**
 * Shows the adjustment interface (placeholder for future implementation)
 */
function showAdjustmentInterface() {
  // TODO: Implement adjustment interface in Phase 2
  console.log('Adjustment interface - to be implemented');
  alert('Adjustment interface coming soon! For now, please go back and select a different option.');
}
