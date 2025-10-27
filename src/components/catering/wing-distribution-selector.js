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
  const totalWings = packageData.totalWings || 250; // Default if not specified

  // Current distribution or defaults
  const distribution = config.wingDistribution || {
    boneless: totalWings,
    boneIn: 0,
    plantBased: 0
  };

  const boneInStyle = config.boneInStyle || 'mixed';

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
  const { boneless, boneIn, plantBased } = distribution;
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
  const totalWings = state.selectedPackage?.totalWings || 250;

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
}

/**
 * Update distribution based on slider value
 */
function updateDistributionFromSlider(bonelessCount) {
  const state = getState();
  const totalWings = state.selectedPackage?.totalWings || 250;
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
