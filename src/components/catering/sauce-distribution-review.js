/**
 * Sauce Distribution Review Component
 * Shows smart preset sauce distribution with optional customization
 * Part of mobile-first customization flow
 *
 * Story: SP-009
 * Created: 2025-10-29
 */

import {
  getState,
  calculateSauceDistribution,
  setSauces,
  updateSauceDistribution,
  validateSauceDistribution
} from '../../services/shared-platter-state-service.js';

/**
 * Render sauce distribution review UI
 * Shows even split by default with optional customization
 * @param {Array} selectedSauces - Array of sauce objects
 * @returns {string} HTML markup
 */
export function renderSauceDistributionReview(selectedSauces) {
  if (!selectedSauces || selectedSauces.length === 0) {
    return '<div class="sauce-distribution-empty">Select sauces to see distribution</div>';
  }

  const state = getState();
  const wingDistribution = state.currentConfig.wingDistribution;

  // Calculate smart distribution
  const distribution = calculateSauceDistribution(selectedSauces, wingDistribution);

  const totalWings = wingDistribution.boneless + wingDistribution.boneIn + wingDistribution.cauliflower;
  const wingsPerSauce = Math.floor(totalWings / selectedSauces.length);

  return `
    <div class="sauce-distribution-review">
      <div class="distribution-header">
        <h3 class="distribution-title">Sauce Distribution</h3>
        <p class="distribution-subtitle">
          ${totalWings} wings across ${selectedSauces.length} sauce${selectedSauces.length > 1 ? 's' : ''}
          (≈${wingsPerSauce} wings each)
        </p>
      </div>

      <!-- Smart Preset Display -->
      <div class="distribution-preset">
        <div class="preset-label">
          <span class="preset-icon">✨</span>
          <span>Smart Distribution (Even Split)</span>
        </div>

        <div class="distribution-list">
          ${distribution.map(sauce => renderSauceDistributionCard(sauce)).join('')}
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="distribution-actions">
        <button
          class="btn-accept-preset"
          id="accept-sauce-distribution"
          aria-label="Accept smart sauce distribution"
        >
          <span class="btn-icon">✓</span>
          <span class="btn-text">Accept Smart Distribution</span>
        </button>

        <button
          class="btn-customize"
          id="customize-sauce-distribution"
          aria-label="Customize sauce distribution"
        >
          <span class="btn-text">Customize Instead</span>
          <span class="btn-icon">→</span>
        </button>
      </div>

      <!-- Custom Distribution Panel (hidden by default) -->
      <div class="distribution-custom-panel" id="distribution-custom-panel" style="display: none;">
        <div class="custom-panel-header">
          <h4>Adjust Distribution</h4>
          <p>Use +/- to adjust wings per sauce</p>
        </div>

        <div class="distribution-adjusters">
          ${distribution.map(sauce => renderSauceAdjuster(sauce)).join('')}
        </div>

        <div class="distribution-validation" id="distribution-validation">
          <!-- Validation message will appear here -->
        </div>

        <div class="custom-panel-actions">
          <button class="btn-cancel" id="cancel-custom-distribution">Cancel</button>
          <button class="btn-save" id="save-custom-distribution">Save Custom Distribution</button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render individual sauce distribution card
 */
function renderSauceDistributionCard(sauce) {
  const { boneless, boneIn, cauliflower } = sauce.distribution;
  const total = boneless + boneIn + cauliflower;

  // Calculate percentages for visual bars
  const bonelessPct = total > 0 ? (boneless / total) * 100 : 0;
  const boneInPct = total > 0 ? (boneIn / total) * 100 : 0;
  const cauliflowerPct = total > 0 ? (cauliflower / total) * 100 : 0;

  return `
    <div class="sauce-distribution-card">
      <div class="sauce-info">
        <span class="sauce-name">${sauce.name}</span>
        <span class="sauce-count">${total} wings</span>
      </div>

      <div class="wing-breakdown">
        ${boneless > 0 ? `<span class="wing-type boneless">${boneless} Boneless</span>` : ''}
        ${boneIn > 0 ? `<span class="wing-type bone-in">${boneIn} Bone-In</span>` : ''}
        ${cauliflower > 0 ? `<span class="wing-type plant-based">🌱 ${cauliflower} Plant-Based</span>` : ''}
      </div>

      <!-- Visual progress bar -->
      <div class="distribution-bar">
        ${boneless > 0 ? `<div class="bar-segment boneless" style="width: ${bonelessPct}%" title="Boneless: ${boneless}"></div>` : ''}
        ${boneIn > 0 ? `<div class="bar-segment bone-in" style="width: ${boneInPct}%" title="Bone-In: ${boneIn}"></div>` : ''}
        ${cauliflower > 0 ? `<div class="bar-segment plant-based" style="width: ${cauliflowerPct}%" title="Plant-Based: ${cauliflower}"></div>` : ''}
      </div>
    </div>
  `;
}

/**
 * Render sauce quantity adjuster (mobile-first with +/- buttons)
 */
function renderSauceAdjuster(sauce) {
  return `
    <div class="sauce-adjuster" data-sauce-id="${sauce.id}">
      <div class="adjuster-info">
        <span class="adjuster-name">${sauce.name}</span>
        <span class="adjuster-current" id="adjuster-${sauce.id}-count">${sauce.wingCount}</span>
      </div>

      <div class="adjuster-controls">
        <button
          class="btn-adjust minus"
          data-sauce-id="${sauce.id}"
          data-action="decrease"
          aria-label="Decrease ${sauce.name} wings"
        >
          −
        </button>

        <input
          type="number"
          class="adjuster-input"
          id="adjuster-${sauce.id}-input"
          value="${sauce.wingCount}"
          min="0"
          aria-label="${sauce.name} wing count"
        />

        <button
          class="btn-adjust plus"
          data-sauce-id="${sauce.id}"
          data-action="increase"
          aria-label="Increase ${sauce.name} wings"
        >
          +
        </button>
      </div>
    </div>
  `;
}

/**
 * Initialize sauce distribution review interactions
 */
export function initSauceDistributionReview(selectedSauces) {
  // Accept preset button
  const acceptBtn = document.getElementById('accept-sauce-distribution');
  if (acceptBtn) {
    acceptBtn.addEventListener('click', () => {
      setSauces(selectedSauces);
      console.log('✅ Accepted smart sauce distribution');
      // Trigger section complete animation
      showDistributionAccepted();
    });
  }

  // Customize button - toggle custom panel
  const customizeBtn = document.getElementById('customize-sauce-distribution');
  const customPanel = document.getElementById('distribution-custom-panel');

  if (customizeBtn && customPanel) {
    customizeBtn.addEventListener('click', () => {
      const isVisible = customPanel.style.display !== 'none';
      customPanel.style.display = isVisible ? 'none' : 'block';
      customizeBtn.textContent = isVisible ? 'Customize Instead →' : 'Hide Customization';
    });
  }

  // +/- button adjusters
  const adjustButtons = document.querySelectorAll('.btn-adjust');
  adjustButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const sauceId = btn.dataset.sauceId;
      const action = btn.dataset.action;
      adjustSauceCount(sauceId, action);
    });
  });

  // Input field direct edit
  const inputs = document.querySelectorAll('.adjuster-input');
  inputs.forEach(input => {
    input.addEventListener('change', () => {
      const sauceId = input.id.replace('adjuster-', '').replace('-input', '');
      const newCount = parseInt(input.value, 10);
      updateSauceCountDirect(sauceId, newCount);
    });
  });

  // Cancel custom distribution
  const cancelBtn = document.getElementById('cancel-custom-distribution');
  if (cancelBtn && customPanel) {
    cancelBtn.addEventListener('click', () => {
      customPanel.style.display = 'none';
      // Reset to smart distribution
      const state = getState();
      const distribution = calculateSauceDistribution(
        selectedSauces,
        state.currentConfig.wingDistribution
      );
      refreshAdjusters(distribution);
    });
  }

  // Save custom distribution
  const saveBtn = document.getElementById('save-custom-distribution');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      saveCustomDistribution(selectedSauces);
    });
  }

  console.log('🌶️ Sauce distribution review initialized');
}

/**
 * Adjust sauce count via +/- buttons
 */
function adjustSauceCount(sauceId, action) {
  const input = document.getElementById(`adjuster-${sauceId}-input`);
  if (!input) return;

  let currentValue = parseInt(input.value, 10);
  const increment = action === 'increase' ? 5 : -5; // Step by 5 wings
  const newValue = Math.max(0, currentValue + increment);

  input.value = newValue;
  document.getElementById(`adjuster-${sauceId}-count`).textContent = newValue;

  validateAdjustedDistribution();
}

/**
 * Update sauce count directly from input
 */
function updateSauceCountDirect(sauceId, newCount) {
  const countDisplay = document.getElementById(`adjuster-${sauceId}-count`);
  if (countDisplay) {
    countDisplay.textContent = newCount;
  }

  validateAdjustedDistribution();
}

/**
 * Validate adjusted distribution totals
 */
function validateAdjustedDistribution() {
  const state = getState();
  const wingDistribution = state.currentConfig.wingDistribution;
  const expectedTotal = wingDistribution.boneless + wingDistribution.boneIn + wingDistribution.cauliflower;

  const adjusters = document.querySelectorAll('.adjuster-input');
  let actualTotal = 0;

  adjusters.forEach(input => {
    actualTotal += parseInt(input.value, 10) || 0;
  });

  const validationEl = document.getElementById('distribution-validation');
  if (!validationEl) return;

  if (actualTotal === expectedTotal) {
    validationEl.innerHTML = '<div class="validation-success">✓ Distribution adds up to ' + expectedTotal + ' wings</div>';
    validationEl.className = 'distribution-validation valid';
  } else {
    const diff = expectedTotal - actualTotal;
    validationEl.innerHTML = `<div class="validation-error">⚠️ ${diff > 0 ? 'Missing' : 'Extra'} ${Math.abs(diff)} wings</div>`;
    validationEl.className = 'distribution-validation invalid';
  }
}

/**
 * Save custom distribution to state
 */
function saveCustomDistribution(selectedSauces) {
  const state = getState();
  const wingDistribution = state.currentConfig.wingDistribution;

  // Build custom distribution from adjuster inputs
  const customSauces = selectedSauces.map(sauce => {
    const input = document.getElementById(`adjuster-${sauce.id}-input`);
    const wingCount = parseInt(input.value, 10) || 0;

    // Proportionally distribute across wing types
    const traditionalTotal = wingDistribution.boneless + wingDistribution.boneIn;
    const totalWings = traditionalTotal + wingDistribution.cauliflower;

    const traditionalRatio = totalWings > 0 ? traditionalTotal / totalWings : 0;
    const bonelessRatio = traditionalTotal > 0 ? wingDistribution.boneless / traditionalTotal : 0;

    const traditionalWings = Math.round(wingCount * traditionalRatio);
    const bonelessWings = Math.round(traditionalWings * bonelessRatio);
    const boneInWings = traditionalWings - bonelessWings;
    const cauliflowerWings = wingCount - traditionalWings;

    return {
      id: sauce.id,
      name: sauce.name,
      heatLevel: sauce.heatLevel,
      imageUrl: sauce.imageUrl,
      wingCount,
      distribution: {
        boneless: bonelessWings,
        boneIn: boneInWings,
        cauliflower: cauliflowerWings
      }
    };
  });

  // Validate before saving
  const customTotal = customSauces.reduce((sum, s) => sum + s.wingCount, 0);
  const expectedTotal = wingDistribution.boneless + wingDistribution.boneIn + wingDistribution.cauliflower;

  if (customTotal !== expectedTotal) {
    alert(`Distribution must total ${expectedTotal} wings. Current total: ${customTotal}`);
    return;
  }

  setSauces(customSauces);
  showDistributionAccepted();
  console.log('✅ Saved custom sauce distribution');
}

/**
 * Refresh adjuster displays with new distribution
 */
function refreshAdjusters(distribution) {
  distribution.forEach(sauce => {
    const input = document.getElementById(`adjuster-${sauce.id}-input`);
    const count = document.getElementById(`adjuster-${sauce.id}-count`);

    if (input) input.value = sauce.wingCount;
    if (count) count.textContent = sauce.wingCount;
  });

  validateAdjustedDistribution();
}

/**
 * Show acceptance confirmation animation
 */
function showDistributionAccepted() {
  const reviewContainer = document.querySelector('.sauce-distribution-review');
  if (reviewContainer) {
    reviewContainer.classList.add('accepted');

    // Update tab status
    const sauceTab = document.querySelector('[data-status="sauces"]');
    if (sauceTab) {
      sauceTab.textContent = '✓';
      sauceTab.classList.add('complete');
    }

    // Show success message
    setTimeout(() => {
      reviewContainer.innerHTML = `
        <div class="distribution-accepted-message">
          <div class="success-icon">✓</div>
          <h3>Sauce Distribution Saved!</h3>
          <p>Continue to the next section</p>
        </div>
      `;
    }, 300);
  }
}
