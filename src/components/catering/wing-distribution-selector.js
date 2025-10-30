/**
 * SP-007: Wing Distribution Selector
 * Premium visual selector for boneless/bone-in wing distribution
 *
 * Features:
 * - Quick preset photo cards (All Boneless, Balanced, Traditional, Plant-Based)
 * - Interactive slider for custom distribution
 * - Bone-in style selector (Mixed/Drums/Flats) with vivid images
 * - Real-time wing count display
 * - Mobile-first responsive design
 *
 * Story: SP-007 (5 points)
 * Created: 2025-10-27
 */

import { getState, updateState } from '../../services/shared-platter-state-service.js';

/**
 * Render wing distribution selector
 * @param {Object} packageData - Selected package with wing totals
 * @returns {string} HTML markup
 */
export function renderWingDistributionSelector(packageData) {
  if (!packageData) {
    return renderNoPackageState();
  }

  const state = getState();
  const config = state.currentConfig || {};
  const totalWings = packageData.wingOptions?.totalWings || packageData.totalWings || 250; // Check nested field first

  console.log('🐛 [DEBUG] renderWingDistributionSelector called');
  console.log('  config.wingDistribution:', config.wingDistribution);
  console.log('  state.eventDetails?.wingDistributionPercentages:', state.eventDetails?.wingDistributionPercentages);

  // Check if draft's wingDistribution is stale (doesn't match wizard percentages)
  const wizardPercentages = state.eventDetails?.wingDistributionPercentages;
  let distribution;

  if (config.wingDistribution && wizardPercentages && wizardPercentages.plantBased > 0) {
    // Wizard says there should be plant-based wings - verify draft matches
    const expectedCauliflower = Math.round((totalWings * wizardPercentages.plantBased) / 100);
    const actualCauliflower = config.wingDistribution.cauliflower || 0;

    console.log('  🔍 Stale draft check:');
    console.log('    expectedCauliflower:', expectedCauliflower);
    console.log('    actualCauliflower:', actualCauliflower);

    if (actualCauliflower !== expectedCauliflower) {
      // Draft is STALE - recalculate from wizard percentages
      console.log('  ⚠️ STALE DRAFT DETECTED - recalculating from wizard percentages');
      distribution = calculateSmartWingDefaults(totalWings, state.eventDetails);
    } else {
      // Draft matches wizard - use it
      console.log('  ✅ Draft matches wizard - using draft');
      distribution = config.wingDistribution;
    }
  } else if (config.wingDistribution) {
    // No wizard percentages or no plant-based - use draft as-is
    console.log('  📋 Using draft (no wizard percentages conflict)');
    distribution = config.wingDistribution;
  } else {
    // No draft - calculate from wizard
    console.log('  🆕 No draft - calculating from wizard');
    distribution = calculateSmartWingDefaults(totalWings, state.eventDetails);
  }

  console.log('  FINAL distribution:', {
    boneless: distribution.boneless,
    boneIn: distribution.boneIn,
    cauliflower: distribution.cauliflower,
    boneInStyle: distribution.boneInStyle,
    distributionSource: distribution.distributionSource
  });

  const boneInStyle = config.boneInStyle || 'mixed';

  // Check if plant-based wings were set from event planner
  const hasPlantBased = distribution.cauliflower > 0 || distribution.plantBased > 0;
  const plantBasedCount = distribution.cauliflower || distribution.plantBased || 0;
  const traditionalCount = distribution.boneless + distribution.boneIn;

  console.log('  hasPlantBased:', hasPlantBased);
  console.log('  plantBasedCount:', plantBasedCount);
  console.log('  traditionalCount:', traditionalCount);

  // TWO-SECTION LAYOUT: Separate traditional and plant-based
  if (hasPlantBased) {
    console.log('✅ Rendering TWO-SECTION layout');
    return `
      <div class="wing-distribution-selector wing-distribution-two-section">
        <!-- Overall Header -->
        <div class="section-header">
          <h3 class="section-title">🍗 Customize Your Wings</h3>
          <p class="section-subtitle">
            Your ${totalWings} wings are split based on your dietary needs
          </p>
        </div>

        <!-- Live Wing Counter (shows all three types) -->
        ${renderWingCounter(distribution, totalWings)}

        <!-- SECTION 1: Traditional Wings (adjustable) -->
        <div class="wing-section wing-section-traditional">
          <div class="section-divider">
            <h4 class="section-subtitle-secondary">Traditional Wings (${traditionalCount} wings)</h4>
            <p class="section-description">Customize your boneless and bone-in split</p>
          </div>

          ${renderTraditionalOnlySlider(distribution, traditionalCount)}

          ${distribution.boneIn > 0 ? renderBoneInStyleSelector(boneInStyle) : ''}
        </div>

        <!-- SECTION 2: Plant-Based Wings (locked) -->
        <div class="wing-section wing-section-plant-based">
          <div class="section-divider">
            <h4 class="section-subtitle-secondary">Plant-Based Wings (${plantBasedCount} wings)</h4>
            <p class="section-description">From your dietary needs selection</p>
          </div>

          <div class="plant-based-locked">
            <div class="locked-display">
              <span class="locked-icon">🌱</span>
              <span class="locked-count">${plantBasedCount} Plant-Based Wings</span>
              <span class="locked-badge">Locked</span>
            </div>
            <p class="locked-note">
              This count was set based on your event planner selections.
              To change it, go back to the event details step.
            </p>
          </div>
        </div>
      </div>
    `;
  }

  // SINGLE-SECTION LAYOUT: Original behavior (no plant-based)
  console.log('⚠️ Rendering SINGLE-SECTION layout');
  return `
    <div class="wing-distribution-selector">
      <!-- Section Header -->
      <div class="section-header">
        <h3 class="section-title">🍗 Choose Your Wing Mix</h3>
        <p class="section-subtitle">
          Select how you want your ${totalWings} wings distributed
        </p>
      </div>

      <!-- Live Wing Counter -->
      ${renderWingCounter(distribution, totalWings)}

      <!-- Quick Presets -->
      ${renderPresetCards(totalWings, distribution)}

      <!-- Custom Slider -->
      ${renderDistributionSlider(distribution, totalWings)}

      <!-- Bone-In Style Selector (only shows if bone-in selected) -->
      ${distribution.boneIn > 0 ? renderBoneInStyleSelector(boneInStyle) : ''}
    </div>
  `;
}

/**
 * Render live wing counter display
 */
function renderWingCounter(distribution, totalWings) {
  const { boneless, boneIn } = distribution;
  const plantBased = distribution.cauliflower || distribution.plantBased || 0;
  const allSet = (boneless + boneIn + plantBased) === totalWings;

  return `
    <div class="wing-counter ${allSet ? 'counter-complete' : ''}">
      <div class="counter-breakdown">
        ${boneless > 0 ? `
          <div class="counter-item counter-boneless">
            <span class="counter-icon">🍗</span>
            <span class="counter-value">${boneless}</span>
            <span class="counter-label">Boneless</span>
          </div>
        ` : ''}

        ${boneIn > 0 ? `
          <div class="counter-item counter-bonein">
            <span class="counter-icon">🦴</span>
            <span class="counter-value">${boneIn}</span>
            <span class="counter-label">Bone-In</span>
          </div>
        ` : ''}

        ${plantBased > 0 ? `
          <div class="counter-item counter-plant">
            <span class="counter-icon">🌱</span>
            <span class="counter-value">${plantBased}</span>
            <span class="counter-label">Plant-Based</span>
          </div>
        ` : ''}
      </div>

      <div class="counter-total">
        <span class="total-label">Total:</span>
        <span class="total-value">${boneless + boneIn + plantBased} / ${totalWings}</span>
        ${allSet ? '<span class="total-check">✓</span>' : ''}
      </div>
    </div>
  `;
}

/**
 * Render preset photo cards
 */
function renderPresetCards(totalWings, currentDistribution) {
  const presets = [
    {
      id: 'all-boneless',
      name: 'All Boneless',
      description: 'Easy to eat, crowd favorite',
      icon: '🍗',
      badge: 'Popular',
      distribution: {
        boneless: totalWings,
        boneIn: 0,
        plantBased: 0
      }
    },
    {
      id: 'balanced-mix',
      name: 'Balanced Mix',
      description: '75% boneless, 25% bone-in',
      icon: '🔄',
      distribution: {
        boneless: Math.floor(totalWings * 0.75),
        boneIn: Math.ceil(totalWings * 0.25),
        plantBased: 0
      }
    },
    {
      id: 'traditional',
      name: 'Traditional 50/50',
      description: 'Classic split',
      icon: '⚖️',
      distribution: {
        boneless: Math.floor(totalWings * 0.5),
        boneIn: Math.ceil(totalWings * 0.5),
        plantBased: 0
      }
    },
    {
      id: 'plant-based',
      name: 'Plant-Based',
      description: '100% plant-based wings',
      icon: '🌱',
      badge: 'Vegan',
      distribution: {
        boneless: 0,
        boneIn: 0,
        plantBased: totalWings
      }
    }
  ];

  return `
    <div class="preset-cards-section">
      <h4 class="preset-header">Quick Presets</h4>
      <div class="preset-cards-grid">
        ${presets.map(preset => renderPresetCard(preset, currentDistribution)).join('')}
      </div>
    </div>
  `;
}

/**
 * Render individual preset card
 */
function renderPresetCard(preset, currentDistribution) {
  const isSelected = isPresetSelected(preset.distribution, currentDistribution);

  return `
    <div class="preset-card ${isSelected ? 'preset-selected' : ''}"
         data-preset-id="${preset.id}"
         role="button"
         tabindex="0"
         aria-label="Select ${preset.name} preset">

      ${preset.badge ? `
        <span class="preset-badge">${preset.badge}</span>
      ` : ''}

      <div class="preset-icon">${preset.icon}</div>

      <div class="preset-content">
        <h5 class="preset-name">${preset.name}</h5>
        <p class="preset-description">${preset.description}</p>
      </div>

      <div class="preset-distribution">
        ${preset.distribution.boneless > 0 ? `
          <span class="dist-item">
            ${Math.round((preset.distribution.boneless / (preset.distribution.boneless + preset.distribution.boneIn + preset.distribution.plantBased)) * 100)}% Boneless
          </span>
        ` : ''}
        ${preset.distribution.boneIn > 0 ? `
          <span class="dist-item">
            ${Math.round((preset.distribution.boneIn / (preset.distribution.boneless + preset.distribution.boneIn + preset.distribution.plantBased)) * 100)}% Bone-In
          </span>
        ` : ''}
        ${preset.distribution.plantBased > 0 ? `
          <span class="dist-item">100% Plant-Based</span>
        ` : ''}
      </div>

      ${isSelected ? `
        <div class="preset-check">✓</div>
      ` : ''}
    </div>
  `;
}

/**
 * Check if preset matches current distribution
 */
function isPresetSelected(presetDist, currentDist) {
  return presetDist.boneless === currentDist.boneless &&
         presetDist.boneIn === currentDist.boneIn &&
         presetDist.plantBased === currentDist.plantBased;
}

/**
 * Render distribution slider for custom mix
 */
function renderDistributionSlider(distribution, totalWings) {
  const bonelessPercent = Math.round((distribution.boneless / totalWings) * 100);

  return `
    <div class="distribution-slider-section">
      <h4 class="slider-header">
        Custom Distribution
        <button class="slider-toggle" data-action="toggle-slider">
          Customize
        </button>
      </h4>

      <div class="slider-container" style="display: none;">
        <div class="slider-labels">
          <span class="slider-label-start">All Boneless</span>
          <span class="slider-label-end">All Bone-In</span>
        </div>

        <div class="slider-track">
          <input
            type="range"
            id="boneless-slider"
            class="wing-slider"
            min="0"
            max="${totalWings}"
            step="10"
            value="${distribution.boneless}"
            aria-label="Adjust boneless wing count"
            aria-valuenow="${distribution.boneless}"
            aria-valuemin="0"
            aria-valuemax="${totalWings}">

          <div class="slider-fill" style="width: ${bonelessPercent}%"></div>
        </div>

        <div class="slider-values">
          <div class="slider-value-item">
            <span class="value-label">Boneless:</span>
            <span class="value-number" id="boneless-count">${distribution.boneless}</span>
          </div>
          <div class="slider-value-item">
            <span class="value-label">Bone-In:</span>
            <span class="value-number" id="bonein-count">${distribution.boneIn}</span>
          </div>
        </div>

        <div class="slider-note">
          <span class="note-icon">💡</span>
          <span class="note-text">Drag to customize your perfect wing mix</span>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render traditional-only slider (for two-section layout with plant-based locked)
 * This slider only adjusts boneless/bone-in within the traditional wing count
 */
function renderTraditionalOnlySlider(distribution, traditionalCount) {
  const bonelessPercent = traditionalCount > 0
    ? Math.round((distribution.boneless / traditionalCount) * 100)
    : 0;

  return `
    <div class="distribution-slider-section traditional-slider">
      <div class="slider-container">
        <div class="slider-labels">
          <span class="slider-label-start">All Boneless</span>
          <span class="slider-label-end">All Bone-In</span>
        </div>

        <div class="slider-track">
          <input
            type="range"
            id="traditional-boneless-slider"
            class="wing-slider"
            min="0"
            max="${traditionalCount}"
            step="10"
            value="${distribution.boneless}"
            aria-label="Adjust traditional wing boneless/bone-in split"
            aria-valuenow="${distribution.boneless}"
            aria-valuemin="0"
            aria-valuemax="${traditionalCount}">

          <div class="slider-fill" style="width: ${bonelessPercent}%"></div>
        </div>

        <div class="slider-values">
          <div class="slider-value-item">
            <span class="value-label">Boneless:</span>
            <span class="value-number" id="traditional-boneless-count">${distribution.boneless}</span>
          </div>
          <div class="slider-value-item">
            <span class="value-label">Bone-In:</span>
            <span class="value-number" id="traditional-bonein-count">${distribution.boneIn}</span>
          </div>
        </div>

        <div class="slider-note">
          <span class="note-icon">💡</span>
          <span class="note-text">Adjust your traditional wing mix (plant-based wings are set separately)</span>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render bone-in style selector (Mixed/Drums/Flats)
 */
function renderBoneInStyleSelector(selectedStyle) {
  const styles = [
    {
      id: 'mixed',
      name: 'Mixed',
      description: 'Drums & Flats',
      icon: '🍗',
      badge: 'Recommended'
    },
    {
      id: 'drums',
      name: 'Drums Only',
      description: 'More meat per piece',
      icon: '🦴'
    },
    {
      id: 'flats',
      name: 'Flats Only',
      description: 'Easier to eat',
      icon: '🍖'
    }
  ];

  return `
    <div class="bonein-style-section">
      <h4 class="style-header">
        <span class="header-icon">🦴</span>
        Bone-In Wing Style
      </h4>
      <p class="style-subtitle">Choose your preferred bone-in wing cut</p>

      <div class="style-cards-grid">
        ${styles.map(style => renderStyleCard(style, selectedStyle)).join('')}
      </div>
    </div>
  `;
}

/**
 * Render individual style card
 */
function renderStyleCard(style, selectedStyle) {
  const isSelected = style.id === selectedStyle;

  return `
    <div class="style-card ${isSelected ? 'style-selected' : ''}"
         data-style-id="${style.id}"
         role="radio"
         aria-checked="${isSelected}"
         tabindex="0">

      ${style.badge ? `
        <span class="style-badge">${style.badge}</span>
      ` : ''}

      <div class="style-icon">${style.icon}</div>

      <div class="style-content">
        <h5 class="style-name">${style.name}</h5>
        <p class="style-description">${style.description}</p>
      </div>

      ${isSelected ? `
        <div class="style-check">✓</div>
      ` : ''}
    </div>
  `;
}

/**
 * Render no package selected state
 */
function renderNoPackageState() {
  return `
    <div class="wing-distribution-empty">
      <div class="empty-icon">🍗</div>
      <h3>No Package Selected</h3>
      <p>Please select a package to customize your wing distribution.</p>
    </div>
  `;
}

/**
 * Initialize wing distribution selector
 */
export function initWingDistributionSelector() {
  console.log('🍗 Initializing wing distribution selector...');

  // Initialize preset cards
  initPresetCards();

  // Initialize custom slider
  initCustomSlider();

  // Initialize bone-in style selector
  initBoneInStyleSelector();

  console.log('✅ Wing distribution selector initialized');
}

/**
 * Initialize preset card interactions
 */
function initPresetCards() {
  const presetCards = document.querySelectorAll('.preset-card');

  presetCards.forEach(card => {
    card.addEventListener('click', () => {
      const presetId = card.dataset.presetId;
      selectPreset(presetId);
    });

    // Keyboard support
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });
  });
}

/**
 * Select a preset distribution
 */
function selectPreset(presetId) {
  const state = getState();
  const totalWings = state.selectedPackage?.wingOptions?.totalWings || state.selectedPackage?.totalWings || 250;

  const presets = {
    'all-boneless': {
      boneless: totalWings,
      boneIn: 0,
      plantBased: 0
    },
    'balanced-mix': {
      boneless: Math.floor(totalWings * 0.75),
      boneIn: Math.ceil(totalWings * 0.25),
      plantBased: 0
    },
    'traditional': {
      boneless: Math.floor(totalWings * 0.5),
      boneIn: Math.ceil(totalWings * 0.5),
      plantBased: 0
    },
    'plant-based': {
      boneless: 0,
      boneIn: 0,
      plantBased: totalWings
    }
  };

  const distribution = presets[presetId];
  if (distribution) {
    updateState('currentConfig.wingDistribution', distribution);

    // Re-render to show updated selection
    renderSection();

    console.log(`✓ Selected preset: ${presetId}`, distribution);
  }
}

/**
 * Initialize custom slider
 */
function initCustomSlider() {
  const toggleButton = document.querySelector('[data-action="toggle-slider"]');
  const sliderContainer = document.querySelector('.slider-container');
  const slider = document.getElementById('boneless-slider');

  if (toggleButton && sliderContainer) {
    toggleButton.addEventListener('click', () => {
      const isHidden = sliderContainer.style.display === 'none';
      sliderContainer.style.display = isHidden ? 'block' : 'none';
      toggleButton.textContent = isHidden ? 'Hide' : 'Customize';
    });
  }

  if (slider) {
    slider.addEventListener('input', (e) => {
      updateDistributionFromSlider(parseInt(e.target.value));
    });
  }

  // Handle traditional-only slider (two-section layout)
  const traditionalSlider = document.getElementById('traditional-boneless-slider');
  if (traditionalSlider) {
    traditionalSlider.addEventListener('input', (e) => {
      updateTraditionalDistributionFromSlider(parseInt(e.target.value));
    });
  }
}

/**
 * Update distribution based on slider value
 */
function updateDistributionFromSlider(bonelessCount) {
  const state = getState();
  const totalWings = state.selectedPackage?.wingOptions?.totalWings || state.selectedPackage?.totalWings || 250;
  const boneInCount = totalWings - bonelessCount;

  const distribution = {
    boneless: bonelessCount,
    boneIn: boneInCount,
    plantBased: 0
  };

  updateState('currentConfig.wingDistribution', distribution);

  // Update UI
  const bonelessDisplay = document.getElementById('boneless-count');
  const boneInDisplay = document.getElementById('bonein-count');
  const sliderFill = document.querySelector('.slider-fill');

  if (bonelessDisplay) bonelessDisplay.textContent = bonelessCount;
  if (boneInDisplay) boneInDisplay.textContent = boneInCount;
  if (sliderFill) {
    const percent = Math.round((bonelessCount / totalWings) * 100);
    sliderFill.style.width = `${percent}%`;
  }

  // Update counter
  renderSection();
}

/**
 * Update traditional distribution (preserves plant-based count)
 * Used in two-section layout where plant-based is locked
 */
function updateTraditionalDistributionFromSlider(bonelessCount) {
  const state = getState();
  const currentDistribution = state.currentConfig?.wingDistribution || {};
  const plantBasedCount = currentDistribution.cauliflower || currentDistribution.plantBased || 0;

  const totalWings = state.selectedPackage?.wingOptions?.totalWings || state.selectedPackage?.totalWings || 250;
  const traditionalCount = totalWings - plantBasedCount;
  const boneInCount = traditionalCount - bonelessCount;

  const distribution = {
    boneless: bonelessCount,
    boneIn: boneInCount,
    cauliflower: plantBasedCount,
    boneInStyle: currentDistribution.boneInStyle || 'mixed',
    distributionSource: currentDistribution.distributionSource || 'event-planner'
  };

  updateState('currentConfig.wingDistribution', distribution);

  // Update UI
  const bonelessDisplay = document.getElementById('traditional-boneless-count');
  const boneInDisplay = document.getElementById('traditional-bonein-count');
  const sliderFill = document.querySelector('.traditional-slider .slider-fill');

  if (bonelessDisplay) bonelessDisplay.textContent = bonelessCount;
  if (boneInDisplay) boneInDisplay.textContent = boneInCount;
  if (sliderFill) {
    const percent = traditionalCount > 0 ? Math.round((bonelessCount / traditionalCount) * 100) : 0;
    sliderFill.style.width = `${percent}%`;
  }

  // Update counter
  renderSection();
}

/**
 * Initialize bone-in style selector
 */
function initBoneInStyleSelector() {
  const styleCards = document.querySelectorAll('.style-card');

  styleCards.forEach(card => {
    card.addEventListener('click', () => {
      const styleId = card.dataset.styleId;
      selectBoneInStyle(styleId);
    });

    // Keyboard support
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });
  });
}

/**
 * Select bone-in style
 */
function selectBoneInStyle(styleId) {
  updateState('currentConfig.boneInStyle', styleId);

  // Re-render to show updated selection
  renderSection();

  console.log(`✓ Selected bone-in style: ${styleId}`);
}

/**
 * Calculate smart wing defaults from wizard selection
 * @param {number} totalWings - Total wings in package
 * @param {Object} eventDetails - Event details from wizard
 * @returns {Object} Distribution with boneless, boneIn, plantBased
 */
function calculateSmartWingDefaults(totalWings, eventDetails = {}) {
  // Get wizard distribution percentages
  const wizardDistribution = eventDetails.wingDistributionPercentages || {
    traditional: 100,
    plantBased: 0
  };

  // Calculate wing counts from percentages
  const traditionalWings = Math.round(totalWings * wizardDistribution.traditional / 100);
  const plantBasedWings = Math.round(totalWings * wizardDistribution.plantBased / 100);

  // Smart split for traditional: 60% boneless, 40% bone-in
  const boneless = Math.round(traditionalWings * 0.6);
  const boneIn = traditionalWings - boneless;

  return {
    boneless,
    boneIn,
    plantBased: plantBasedWings
  };
}

/**
 * Re-render the entire section
 */
function renderSection() {
  const state = getState();
  const container = document.getElementById('customization-content');

  if (container && state.selectedPackage) {
    container.innerHTML = renderWingDistributionSelector(state.selectedPackage);
    initWingDistributionSelector();
  }
}
