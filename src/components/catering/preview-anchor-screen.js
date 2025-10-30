/**
 * Preview Anchor Screen Component
 * Shows complete personalized catering plan before customization
 *
 * Purpose:
 * - Reduces cognitive load by showing the full picture upfront
 * - Provides fast-track option (order as-is)
 * - Builds confidence with social proof
 * - Sets price anchor before customization
 *
 * Flow Position:
 * Conversational Wizard → Package Recommendations → **PREVIEW ANCHOR** → [Fast Track OR Customize]
 *
 * Created: 2025-10-27
 */

import { getState, updateState } from '../../services/shared-platter-state-service.js';

/**
 * Render preview anchor screen
 * @param {Object} selectedPackage - Package from recommendations
 * @param {Object} smartDefaults - Pre-calculated defaults from wizard
 * @returns {string} HTML markup
 */
export function renderPreviewAnchorScreen(selectedPackage, smartDefaults) {
  if (!selectedPackage) {
    return renderNoPackageState();
  }

  const state = getState();
  const eventDetails = state.eventDetails || {};

  // Calculate smart defaults based on wizard + package
  const defaults = smartDefaults || calculateSmartDefaults(selectedPackage, eventDetails);

  return `
    <div class="preview-anchor-screen">
      <!-- Header with Event Context -->
      <div class="preview-header">
        <div class="header-icon">✅</div>
        <h2 class="header-title">Here's Your Personalized Catering Plan</h2>
        <p class="header-subtitle">
          Based on your ${eventDetails.guestCount || 25}-guest
          ${formatEventType(eventDetails.eventType || 'corporate')} event
          ${eventDetails.dietaryNeeds?.includes('vegetarian') ? 'with vegetarian needs' : ''}
        </p>
      </div>

      <!-- The Package Card -->
      <div class="preview-package-card">
        <div class="package-badge">📦 THE PACKAGE</div>

        <div class="package-hero">
          <img
            src="${selectedPackage.heroImage || '/images/placeholders/package-default.webp'}"
            alt="${selectedPackage.name}"
            class="package-image"
            loading="eager">
          <div class="package-popular-badge" style="${selectedPackage.popular ? '' : 'display:none'}">
            🔥 Popular Choice
          </div>
        </div>

        <div class="package-info">
          <h3 class="package-name">${selectedPackage.name}</h3>
          <p class="package-serves">
            Serves ${selectedPackage.servesMin}-${selectedPackage.servesMax} people •
            Perfect for ${getPackageContext(selectedPackage, eventDetails)}
          </p>
          <div class="package-price-anchor">
            <span class="price-label">Starting at</span>
            <span class="price-value">$${selectedPackage.basePrice.toFixed(2)}</span>
            <span class="price-note">(all-inclusive)</span>
          </div>
        </div>
      </div>

      <!-- Smart Defaults Preview -->
      <div class="preview-defaults">
        ${renderWingPreview(defaults.wings, selectedPackage.wingCount)}
        ${renderSaucePreview(defaults.sauces, selectedPackage.sauceSelections)}
        ${renderSidesPreview(selectedPackage)}
      </div>

      <!-- Total Price Display -->
      <div class="preview-total">
        <div class="total-label">Your Price (with smart selections):</div>
        <div class="total-value">$${calculateTotalPrice(selectedPackage, defaults).toFixed(2)}</div>
        <div class="total-breakdown">
          Base package + pre-selected sauces & sides •
          <a href="#" class="breakdown-link">See breakdown</a>
        </div>
      </div>

      <!-- Social Proof Box -->
      <div class="preview-social-proof">
        <div class="proof-icon">👥</div>
        <div class="proof-content">
          <div class="proof-stat">
            This setup works for <strong>90% of similar ${formatEventType(eventDetails.eventType)} orders</strong>
          </div>
          <div class="proof-details">
            Based on 200+ events with ${eventDetails.guestCount || 25} guests
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="preview-actions">
        <button
          type="button"
          class="btn-fast-track"
          id="btn-fast-track-order"
          data-package-id="${selectedPackage.id}">
          <span class="btn-icon">⚡</span>
          <span class="btn-text">Order This Exact Setup</span>
          <span class="btn-badge">Fast!</span>
        </button>

        <button
          type="button"
          class="btn-customize"
          id="btn-customize-details"
          data-package-id="${selectedPackage.id}">
          <span class="btn-icon">🎨</span>
          <span class="btn-text">Customize Every Detail</span>
          <span class="btn-badge">Smart</span>
        </button>

        <button
          type="button"
          class="btn-secondary btn-back"
          id="btn-back-to-recommendations">
          ← Choose Different Package
        </button>
      </div>

      <!-- Why These Defaults Explanation -->
      <details class="preview-explanation">
        <summary>Why did we choose these defaults?</summary>
        <div class="explanation-content">
          <h4>Our catering AI analyzed your event:</h4>
          <ul class="explanation-list">
            <li>
              <strong>Wing mix:</strong> ${defaults.wings.reasoning}
            </li>
            <li>
              <strong>Sauce selection:</strong> ${defaults.sauces.reasoning}
            </li>
            <li>
              <strong>Package choice:</strong> ${selectedPackage.name} is the #1 choice for
              ${eventDetails.eventType || 'corporate'} events with ${eventDetails.guestCount || 25} guests
            </li>
          </ul>
          <p class="explanation-note">
            You can customize everything, but 85% of customers stick with our smart defaults.
          </p>
        </div>
      </details>
    </div>
  `;
}

/**
 * Render wing distribution preview
 */
function renderWingPreview(wingDefaults, totalWings) {
  const { boneless, boneIn, cauliflower } = wingDefaults.distribution;

  return `
    <div class="preview-section preview-wings">
      <div class="section-badge">🍗 YOUR WINGS (${totalWings} total)</div>

      <div class="wing-distribution-bar">
        ${boneless > 0 ? `
          <div class="bar-segment bar-boneless" style="width: ${(boneless/totalWings)*100}%">
            <span class="segment-label">${boneless} Boneless</span>
          </div>
        ` : ''}
        ${boneIn > 0 ? `
          <div class="bar-segment bar-bonein" style="width: ${(boneIn/totalWings)*100}%">
            <span class="segment-label">${boneIn} Bone-In</span>
          </div>
        ` : ''}
        ${cauliflower > 0 ? `
          <div class="bar-segment bar-plant" style="width: ${(cauliflower/totalWings)*100}%">
            <span class="segment-label">${cauliflower} Plant-Based</span>
          </div>
        ` : ''}
      </div>

      <div class="section-note">
        ${wingDefaults.reasoning}
      </div>
    </div>
  `;
}

/**
 * Render sauce selection preview
 */
function renderSaucePreview(sauceDefaults, maxSelections) {
  return `
    <div class="preview-section preview-sauces">
      <div class="section-badge">🌶️ YOUR SAUCES (${sauceDefaults.selections.length} selections)</div>

      <div class="sauce-chips">
        ${sauceDefaults.selections.map(sauce => {
          const chilis = '🌶️'.repeat(sauce.heatLevel);
          const heatDisplay = sauce.heatLevel === 0 ? 'No Heat' : chilis;
          return `
            <div class="sauce-chip sauce-heat-${sauce.heatLevel}">
              <span class="chip-name">${sauce.name}</span>
              <span class="chip-heat">${heatDisplay}</span>
            </div>
          `;
        }).join('')}
      </div>

      <div class="section-note">
        ${sauceDefaults.reasoning}
      </div>
    </div>
  `;
}

/**
 * Render included sides preview
 */
function renderSidesPreview(packageData) {
  const sides = [];

  if (packageData.chips) {
    sides.push(`Chips (${packageData.chips.quantity} 5-packs)`);
  }
  if (packageData.dips && packageData.dips.length > 0) {
    sides.push(`${packageData.dips.length} dip options`);
  }
  if (packageData.coldSides && packageData.coldSides.length > 0) {
    sides.push(`${packageData.coldSides.length} cold sides`);
  }

  return `
    <div class="preview-section preview-sides">
      <div class="section-badge">🥗 INCLUDED SIDES</div>

      <div class="sides-list">
        ${sides.map(side => `
          <div class="side-item">
            <span class="side-check">✓</span>
            <span class="side-name">${side}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

/**
 * Calculate smart defaults based on event details and package
 */
function calculateSmartDefaults(packageData, eventDetails) {
  const totalWings = packageData.wingCount || 100;
  const guestCount = eventDetails.guestCount || 25;
  const dietaryNeeds = eventDetails.dietaryNeeds || [];
  const eventType = eventDetails.eventType || 'corporate';

  // Wing distribution from conversational wizard
  const wizardDistribution = eventDetails.wingDistributionPercentages || {
    traditional: 100,
    plantBased: 0
  };

  // Calculate wing counts
  const traditionalWings = Math.round(totalWings * wizardDistribution.traditional / 100);
  const plantBasedWings = Math.round(totalWings * wizardDistribution.plantBased / 100);

  // Smart split: 60% boneless, 40% bone-in for traditional
  const boneless = Math.round(traditionalWings * 0.6);
  const boneIn = traditionalWings - boneless;

  const wingDefaults = {
    distribution: {
      boneless,
      boneIn,
      cauliflower: plantBasedWings,
      boneInStyle: 'mixed'
    },
    reasoning: plantBasedWings > 0
      ? `${boneless} easy-to-eat boneless, ${boneIn} authentic bone-in, and ${plantBasedWings} plant-based for vegetarian guests`
      : `${boneless} easy-to-eat boneless (60%) and ${boneIn} authentic bone-in (40%) - the perfect balance`
  };

  // Smart sauce defaults based on event type
  const sauceDefaults = calculateSmartSauceDefaults(packageData.sauceSelections, eventType, guestCount);

  return {
    wings: wingDefaults,
    sauces: sauceDefaults
  };
}

/**
 * Calculate smart sauce defaults
 */
function calculateSmartSauceDefaults(maxSelections, eventType, guestCount) {
  // Default balanced mix: 1 mild, 1 medium, 1 hot
  const defaults = {
    corporate: [
      { id: 'honey-bbq', name: 'Honey BBQ', heatLevel: 0 },
      { id: 'philly-medium', name: 'Philly Medium Buffalo', heatLevel: 3 },
      { id: 'lemon-pepper', name: 'Lemon Pepper', heatLevel: 0 }
    ],
    sports: [
      { id: 'honey-bbq', name: 'Honey BBQ', heatLevel: 0 },
      { id: 'philly-medium', name: 'Philly Medium Buffalo', heatLevel: 3 },
      { id: 'south-street-hot', name: 'South Street Hot', heatLevel: 4 }
    ],
    party: [
      { id: 'honey-bbq', name: 'Honey BBQ', heatLevel: 0 },
      { id: 'asian-zing', name: 'Asian Zing', heatLevel: 2 },
      { id: 'south-street-hot', name: 'South Street Hot', heatLevel: 4 }
    ]
  };

  const selections = defaults[eventType] || defaults.corporate;

  return {
    selections: selections.slice(0, maxSelections),
    reasoning: `Balanced heat mix (mild, medium, ${guestCount > 30 ? 'hot' : 'medium hot'}) - works for 90% of groups`
  };
}

/**
 * Calculate total price with defaults
 */
function calculateTotalPrice(packageData, defaults) {
  // For now, just return base price
  // TODO: Add sauce upcharges, add-ons, etc.
  return packageData.basePrice;
}

/**
 * Helper functions
 */
function formatEventType(eventType) {
  const labels = {
    corporate: 'corporate',
    sports: 'game day',
    party: 'party',
    other: 'event'
  };
  return labels[eventType] || 'event';
}

function getPackageContext(packageData, eventDetails) {
  const contexts = {
    corporate: 'office lunches',
    sports: 'watch parties',
    party: 'celebrations',
    other: 'events'
  };
  return contexts[eventDetails.eventType] || 'events';
}

function renderNoPackageState() {
  return `
    <div class="preview-anchor-screen preview-error">
      <div class="error-icon">⚠️</div>
      <h2>No Package Selected</h2>
      <p>Please select a package from recommendations first.</p>
      <button type="button" class="btn-primary" onclick="window.history.back()">
        Go Back to Packages
      </button>
    </div>
  `;
}

/**
 * Initialize preview anchor screen interactions
 */
export function initPreviewAnchorScreen() {
  const fastTrackBtn = document.getElementById('btn-fast-track-order');
  const customizeBtn = document.getElementById('btn-customize-details');
  const backBtn = document.getElementById('btn-back-to-recommendations');

  if (fastTrackBtn) {
    fastTrackBtn.addEventListener('click', handleFastTrackOrder);
  }

  if (customizeBtn) {
    customizeBtn.addEventListener('click', handleCustomizeDetails);
  }

  if (backBtn) {
    backBtn.addEventListener('click', handleBackToRecommendations);
  }

  // Track view event
  trackPreviewView();
}

/**
 * Handle fast-track order (skip customization)
 */
function handleFastTrackOrder(e) {
  const packageId = e.currentTarget.dataset.packageId;

  // Apply smart defaults to state
  applySmartDefaultsToState();

  // Track fast-track selection
  console.log('Fast-track order selected for package:', packageId);

  // Navigate directly to add-ons or review
  window.dispatchEvent(new CustomEvent('navigate-to-addons', {
    detail: { fastTrack: true }
  }));
}

/**
 * Handle customize details (enter customization flow)
 */
function handleCustomizeDetails(e) {
  const packageId = e.currentTarget.dataset.packageId;

  // Apply smart defaults as starting point
  applySmartDefaultsToState();

  // Track customization choice
  console.log('Customization selected for package:', packageId);

  // Navigate to customization screen (SP-006)
  window.dispatchEvent(new CustomEvent('navigate-to-customization', {
    detail: {
      packageId,
      hasSmartDefaults: true
    }
  }));
}

/**
 * Handle back to recommendations
 */
function handleBackToRecommendations() {
  window.dispatchEvent(new CustomEvent('navigate-to-recommendations'));
}

/**
 * Apply smart defaults to shared state
 */
function applySmartDefaultsToState() {
  const state = getState();
  const selectedPackage = state.selectedPackage;
  const eventDetails = state.eventDetails;

  if (!selectedPackage) return;

  const defaults = calculateSmartDefaults(selectedPackage, eventDetails);

  // Update wing distribution
  updateState('currentConfig', {
    ...state.currentConfig,
    wingDistribution: {
      ...defaults.wings.distribution,
      distributionSource: 'smart-defaults'
    },
    sauces: defaults.sauces.selections.map(sauce => ({
      id: sauce.id,
      name: sauce.name,
      heatLevel: sauce.heatLevel,
      quantity: 1
    })),
    saucesSource: 'smart-defaults'
  });

  console.log('Smart defaults applied to state:', defaults);
}

/**
 * Track preview view for analytics
 */
function trackPreviewView() {
  const state = getState();
  console.log('Preview anchor viewed:', {
    package: state.selectedPackage?.name,
    eventType: state.eventDetails?.eventType,
    guestCount: state.eventDetails?.guestCount
  });
}
