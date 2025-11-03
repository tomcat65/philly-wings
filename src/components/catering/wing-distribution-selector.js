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
import { initSliderButtons, updateSliderTooltip, updateSliderUIOnly } from './wing-distribution-selector-helpers.js';

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

    // Also check if boneless/bone-in split looks valid (not all zeros)
    const hasBonelessBoneInSplit = (config.wingDistribution.boneless > 0 || config.wingDistribution.boneIn > 0);
    const hasInvalidSplit = (config.wingDistribution.boneless === 0 && config.wingDistribution.boneIn > 0);

    console.log('  🔍 Stale draft check:');
    console.log('    expectedCauliflower:', expectedCauliflower);
    console.log('    actualCauliflower:', actualCauliflower);
    console.log('    boneless:', config.wingDistribution.boneless);
    console.log('    boneIn:', config.wingDistribution.boneIn);
    console.log('    hasInvalidSplit:', hasInvalidSplit);

    if (actualCauliflower !== expectedCauliflower || hasInvalidSplit) {
      // Draft is STALE or has invalid split - recalculate from wizard percentages
      console.log('  ⚠️ STALE/INVALID DRAFT DETECTED - recalculating from wizard percentages');
      distribution = calculateSmartWingDefaults(totalWings, state.eventDetails);

      // PRESERVE boneInStyle from old draft if it exists (Bug #2 fix)
      if (config.wingDistribution?.boneInStyle) {
        distribution.boneInStyle = config.wingDistribution.boneInStyle;
        console.log('  ✅ Preserved boneInStyle:', distribution.boneInStyle);
      }

      // Save the recalculated distribution to state
      updateState('currentConfig.wingDistribution', distribution);
      console.log('  💾 Saved recalculated distribution to state:', distribution);
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
    // Save the calculated distribution to state
    updateState('currentConfig.wingDistribution', distribution);
    console.log('  💾 Saved initial distribution to state');
  }

  console.log('  FINAL distribution:', {
    boneless: distribution.boneless,
    boneIn: distribution.boneIn,
    cauliflower: distribution.cauliflower,
    boneInStyle: distribution.boneInStyle,
    distributionSource: distribution.distributionSource
  });

  const boneInStyle = config.boneInStyle || 'mixed';
  const plantBasedPrep = config.plantBasedPrep || 'baked';

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
          <h3 class="section-title">🍗 Your Wing Selection</h3>
          <p class="section-subtitle">
            Your ${totalWings} wings based on your event details
          </p>
        </div>

        <!-- Simplified Summary View (Initial) -->
        <div class="wing-summary-view" data-view="summary">
          ${renderWingSummary(distribution, totalWings, traditionalCount, plantBasedCount)}

          <div class="summary-actions">
            <button class="btn-accept-distribution" data-action="accept">
              <span class="btn-icon">✓</span>
              <span class="btn-text">Accept This Distribution</span>
            </button>
            <button class="btn-customize-distribution" data-action="customize">
              <span class="btn-icon">🔧</span>
              <span class="btn-text">Customize Wing Types Instead</span>
            </button>
          </div>
        </div>

        <!-- Detailed Controls View (Hidden initially) -->
        <div class="wing-detailed-view" data-view="detailed" style="display: none;">
          <!-- Live Wing Counter (shows all three types) -->
          ${renderWingCounter(distribution, totalWings)}

          <!-- Scrollable Container for Wing Sections -->
          <div class="wing-sections-scrollable">
            <!-- SECTION 1: Traditional Wings (adjustable) -->
            <div class="wing-section wing-section-traditional">
              <div class="section-divider">
                <h4 class="section-subtitle-secondary">Traditional Wings (${traditionalCount} wings)</h4>
                <p class="section-description">Customize your boneless and bone-in split</p>
              </div>

              ${renderTraditionalOnlySlider(distribution, traditionalCount)}

              ${distribution.boneIn > 0 ? renderBoneInStyleSelector(boneInStyle) : ''}
            </div>

            <!-- SECTION 2: Plant-Based Wings (preparation customizable) -->
            <div class="wing-section wing-section-plant-based">
              <div class="section-divider">
                <h4 class="section-subtitle-secondary">Plant-Based Wings (${plantBasedCount} wings)</h4>
                <p class="section-description">Choose your preparation method</p>
              </div>

              ${renderPlantBasedPreparationSelector(plantBasedCount, plantBasedPrep)}
            </div>
          </div><!-- End wing-sections-scrollable -->
        </div><!-- End detailed-view -->
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
 * Render simplified wing summary (Option B format)
 * Uses image placeholders and compact desktop layout
 */
function renderWingSummary(distribution, totalWings, traditionalCount, plantBasedCount) {
  const { boneless, boneIn } = distribution;
  const boneInStyle = distribution.boneInStyle || 'mixed';

  // Format bone-in style label
  const boneInStyleLabel = boneInStyle === 'mixed' ? 'Mixed' :
                          boneInStyle === 'drums' ? 'Drums Only' :
                          'Flats Only';

  return `
    <div class="wing-summary">
      <div class="summary-cards">
        <div class="summary-card summary-card-traditional">
          <div class="summary-image-placeholder" data-wing-type="traditional">
            <span class="placeholder-icon">🍗</span>
          </div>
          <div class="summary-content">
            <h4 class="summary-title">${traditionalCount} Traditional Wings</h4>
            <p class="summary-details">
              ${boneless} Boneless${boneIn > 0 ? `, ${boneIn} Bone-In ${boneInStyleLabel}` : ''}
            </p>
          </div>
        </div>

        ${plantBasedCount > 0 ? `
          <div class="summary-card summary-card-plant">
            <div class="summary-image-placeholder" data-wing-type="plant-based">
              <span class="placeholder-icon">🥦</span>
            </div>
            <div class="summary-content">
              <h4 class="summary-title">${plantBasedCount} Plant-Based Wings</h4>
              <p class="summary-details">Cauliflower</p>
            </div>
          </div>
        ` : ''}
      </div>

      <div class="summary-total">
        <span class="summary-total-label">Total Wings:</span>
        <span class="summary-total-value">${totalWings}</span>
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

        <div class="slider-track-traditional">
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
 * Render quick ratio buttons for common splits
 */
function renderQuickRatios(traditionalCount) {
  const ratios = [
    { label: 'All Boneless', percent: 100 },
    { label: '75/25 Mix', percent: 75 },
    { label: '50/50 Split', percent: 50 },
    { label: 'Mostly Bone-In', percent: 25 }
  ];

  return `
    <div class="quick-ratios">
      <span class="ratio-label">Quick picks:</span>
      ${ratios.map(ratio => `
        <button type="button" class="ratio-btn" data-ratio="${ratio.percent}" data-traditional-count="${traditionalCount}">
          ${ratio.label}
        </button>
      `).join('')}
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
        ${renderQuickRatios(traditionalCount)}

        <div class="slider-labels">
          <span class="slider-label-start">All Boneless</span>
          <span class="slider-label-end">All Bone-In</span>
        </div>

        <!-- TIER 2: Mobile slider controls with +/- buttons -->
        <div class="slider-controls-mobile">
          <button
            class="slider-btn-decrease"
            data-adjust="-10"
            aria-label="Less boneless wings (subtract 10)"
            type="button">
            <span class="slider-btn-icon">◀</span>
            <span class="slider-btn-label">Bone-In</span>
          </button>

          <div class="slider-track-wrapper">
            <div class="slider-track-traditional">
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
                aria-valuemax="${traditionalCount}"
                aria-describedby="slider-live-region">
            </div>
          </div>

          <button
            class="slider-btn-increase"
            data-adjust="+10"
            aria-label="More boneless wings (add 10)"
            type="button">
            <span class="slider-btn-label">Boneless</span>
            <span class="slider-btn-icon">▶</span>
          </button>
        </div>

        <!-- TIER 3: Screen reader live region -->
        <div
          id="slider-live-region"
          class="sr-only"
          role="status"
          aria-live="polite"
          aria-atomic="true">
          ${distribution.boneless} boneless, ${distribution.boneIn} bone-in
        </div>

        <div class="slider-values-enhanced">
          <div class="value-card value-boneless">
            <span class="value-icon">🍗</span>
            <div class="value-content">
              <input
                type="number"
                class="value-number-input"
                id="traditional-boneless-count"
                value="${distribution.boneless}"
                min="0"
                max="${traditionalCount}"
                step="10"
                data-wing-type="boneless"
                aria-label="Number of boneless wings">
              <span class="value-label-small">Boneless</span>
            </div>
            <span class="value-percent" id="boneless-percent">${Math.round((distribution.boneless / traditionalCount) * 100)}%</span>
          </div>

          <div class="value-divider">⟷</div>

          <div class="value-card value-bonein">
            <span class="value-icon">🦴</span>
            <div class="value-content">
              <input
                type="number"
                class="value-number-input"
                id="traditional-bonein-count"
                value="${distribution.boneIn}"
                min="0"
                max="${traditionalCount}"
                step="10"
                data-wing-type="bonein"
                aria-label="Number of bone-in wings">
              <span class="value-label-small">Bone-In</span>
            </div>
            <span class="value-percent" id="bonein-percent">${Math.round((distribution.boneIn / traditionalCount) * 100)}%</span>
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
 * Render plant-based preparation selector
 */
function renderPlantBasedPreparationSelector(plantBasedCount, selectedPrep) {
  return `
    <div class="plant-based-preparation">
      <div class="preparation-header">
        <span class="prep-icon">🥦</span>
        <span class="prep-count">${plantBasedCount} Cauliflower Wings</span>
        <span class="prep-badge">Count Locked</span>
      </div>

      <div class="preparation-selector">
        <button
          type="button"
          class="prep-option prep-baked ${selectedPrep === 'baked' ? 'active' : ''}"
          data-prep="baked"
          role="radio"
          aria-checked="${selectedPrep === 'baked'}">
          <div class="prep-icon-badge">🔥</div>
          <div class="prep-content">
            <strong class="prep-title">Baked</strong>
            <span class="prep-desc">Lighter & healthier</span>
          </div>
          ${selectedPrep === 'baked' ? '<span class="prep-recommend">✓ RECOMMENDED</span>' : ''}
        </button>

        <button
          type="button"
          class="prep-option prep-fried ${selectedPrep === 'fried' ? 'active' : ''}"
          data-prep="fried"
          role="radio"
          aria-checked="${selectedPrep === 'fried'}">
          <div class="prep-icon-badge">🍳</div>
          <div class="prep-content">
            <strong class="prep-title">Fried</strong>
            <span class="prep-desc">Crispy texture</span>
          </div>
        </button>
      </div>

      <p class="prep-note">
        💡 Wing count set from dietary needs. To change, edit event details.
      </p>
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
 * Initialize Accept/Customize button interactions
 */
function initAcceptCustomizeButtons() {
  const acceptBtn = document.querySelector('.btn-accept-distribution');
  const customizeBtn = document.querySelector('.btn-customize-distribution');
  const summaryView = document.querySelector('[data-view="summary"]');
  const detailedView = document.querySelector('[data-view="detailed"]');

  if (!acceptBtn || !customizeBtn || !summaryView || !detailedView) {
    console.log('⚠️ Accept/Customize buttons not found (single-section layout or not rendered yet)');
    return;
  }

  console.log('✅ Initializing Accept/Customize buttons');

  // Accept Distribution Button
  acceptBtn.addEventListener('click', () => {
    console.log('✅ User accepted wing distribution');

    // Mark wings as accepted and complete - DON'T overwrite entire currentConfig
    updateState('currentConfig.wingsAccepted', true);
    updateState('currentConfig.wingsCustomized', false);

    // Dispatch event to notify customization screen
    window.dispatchEvent(new CustomEvent('wing-distribution-accepted', {
      detail: {
        distribution: state.currentConfig.wingDistribution,
        timestamp: new Date().toISOString()
      }
    }));

    // Scroll to sauces section
    const saucesSection = document.querySelector('[data-section="sauces"]');
    if (saucesSection) {
      saucesSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });

  // Customize Distribution Button
  customizeBtn.addEventListener('click', () => {
    console.log('🔧 User wants to customize wing distribution');

    // DEBUG: Check wingDistribution BEFORE state updates
    const stateBefore = getState();
    console.log('🐛 [DEBUG] wingDistribution BEFORE state updates:', stateBefore.currentConfig?.wingDistribution);

    // Hide summary, show detailed controls
    summaryView.style.display = 'none';
    detailedView.style.display = 'block';

    // Mark as customized - DON'T overwrite entire currentConfig
    // Update only the specific flags to avoid losing wingDistribution
    updateState('currentConfig.wingsAccepted', false);
    updateState('currentConfig.wingsCustomized', true);

    // DEBUG: Check wingDistribution AFTER state updates
    const stateAfter = getState();
    console.log('🐛 [DEBUG] wingDistribution AFTER state updates:', stateAfter.currentConfig?.wingDistribution);

    // Smooth scroll to detailed view
    detailedView.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  });
}

/**
 * Initialize wing distribution selector
 */
export function initWingDistributionSelector() {
  console.log('🍗 Initializing wing distribution selector...');

  // Initialize Accept/Customize workflow
  initAcceptCustomizeButtons();

  // Initialize preset cards
  initPresetCards();

  // Initialize custom slider
  initCustomSlider();

  // Initialize bone-in style selector
  initBoneInStyleSelector();

  // Initialize plant-based preparation selector
  initPlantBasedPreparationSelector();

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
 * LEGACY: Used only for single-section layout (no plant-based from wizard)
 */
function selectPreset(presetId) {
  const state = getState();
  const totalWings = state.selectedPackage?.wingOptions?.totalWings || state.selectedPackage?.totalWings || 250;
  const currentDist = state.currentConfig?.wingDistribution || {};

  const presets = {
    'all-boneless': {
      boneless: totalWings,
      boneIn: 0,
      cauliflower: 0
    },
    'balanced-mix': {
      boneless: Math.floor(totalWings * 0.75),
      boneIn: Math.ceil(totalWings * 0.25),
      cauliflower: 0
    },
    'traditional': {
      boneless: Math.floor(totalWings * 0.5),
      boneIn: Math.ceil(totalWings * 0.5),
      cauliflower: 0
    },
    'plant-based': {
      boneless: 0,
      boneIn: 0,
      cauliflower: totalWings
    }
  };

  const distribution = {
    ...presets[presetId],
    boneInStyle: currentDist.boneInStyle || 'mixed',
    distributionSource: 'preset'
  };

  if (distribution) {
    updateState('currentConfig.wingDistribution', distribution);

    // Update UI (DOM only - no re-render)
    updateWingCounterDOM(distribution);
    toggleBoneInStyleSelector(distribution.boneIn);

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
    // ✅ FIX: Remove any existing event listeners first to prevent duplicates
    // Clone the slider and replace it to remove all event listeners
    const newSlider = traditionalSlider.cloneNode(true);
    traditionalSlider.parentNode.replaceChild(newSlider, traditionalSlider);
    
    // ✅ Capture counts ONCE at initialization (outside event handler)
    // This creates a closure that preserves these values throughout slider interaction
    const state = getState();
    const totalWings = state.selectedPackage?.wingOptions?.totalWings || state.selectedPackage?.totalWings || 250;
    const currentDist = state.currentConfig?.wingDistribution || {};
    
    // ✅ CRITICAL FIX: Read plant-based count directly from state AND verify it's not 0
    // Also check the DOM counter to double-check against state
    let plantBasedCount = currentDist.cauliflower || currentDist.plantBased || 0;
    const domPlantBasedCounter = document.querySelector('.counter-plant .counter-value');
    if (domPlantBasedCounter) {
      const domPlantBasedValue = parseInt(domPlantBasedCounter.textContent, 10);
      if (domPlantBasedValue > 0 && plantBasedCount === 0) {
        console.warn('⚠️ State says plant-based is 0 but DOM shows', domPlantBasedValue, '- using DOM value');
        plantBasedCount = domPlantBasedValue;
      }
    }
    
    const traditionalCount = totalWings - plantBasedCount;

    // ✅ VALIDATION: Ensure plant-based count is preserved from wizard
    const wizardPercentages = state.eventDetails?.wingDistributionPercentages;
    if (wizardPercentages && wizardPercentages.plantBased > 0 && plantBasedCount === 0) {
      // Recalculate from wizard if state is stale
      const expectedPlantBased = Math.round((totalWings * wizardPercentages.plantBased) / 100);
      console.warn('⚠️ Plant-based count lost! Recovering from wizard:', expectedPlantBased);
      plantBasedCount = expectedPlantBased;
    }

    console.log('🔒 Traditional slider initialized with locked values:', {
      plantBasedCount,
      traditionalCount,
      totalWings,
      stateCauliflower: currentDist.cauliflower,
      wizardPercentages: wizardPercentages?.plantBased
    });

    // ✅ Event handler uses closure variables (never re-reads state)
    // The closure preserves plantBasedCount and traditionalCount

    // TIER 3: Debounced state updates for smooth dragging
    let updateTimeout;
    newSlider.addEventListener('input', (e) => {
      const value = parseInt(e.target.value);

      console.log('📊 Slider input:', {
        sliderValue: value,
        lockedPlantBased: plantBasedCount,
        lockedTraditional: traditionalCount
      });

      // Update tooltip immediately
      updateSliderTooltip(value);

      // Update UI immediately for responsive feel (without state update)
      updateSliderUIOnly(value, traditionalCount);

      // TIER 2: Haptic feedback on 10-wing increments
      if ('vibrate' in navigator && value % 10 === 0) {
        navigator.vibrate(10);
      }

      // Debounce full state update to reduce re-renders
      clearTimeout(updateTimeout);
      updateTimeout = setTimeout(() => {
        updateTraditionalDistributionFromSlider(value, traditionalCount, plantBasedCount);
      }, 50);
    });

    // TIER 2: Keyboard shortcuts for power users
    newSlider.addEventListener('keydown', (e) => {
      let handled = false;
      let newValue;

      // Home = All Boneless
      if (e.key === 'Home') {
        newValue = traditionalCount;
        handled = true;
      }
      // End = All Bone-In
      else if (e.key === 'End') {
        newValue = 0;
        handled = true;
      }
      // PageUp = +25%
      else if (e.key === 'PageUp') {
        newValue = Math.min(traditionalCount, parseInt(newSlider.value) + Math.round(traditionalCount * 0.25));
        handled = true;
      }
      // PageDown = -25%
      else if (e.key === 'PageDown') {
        newValue = Math.max(0, parseInt(newSlider.value) - Math.round(traditionalCount * 0.25));
        handled = true;
      }

      if (handled) {
        e.preventDefault();
        newSlider.value = newValue;
        newSlider.dispatchEvent(new Event('input'));
      }
    });

    // TIER 2: Initialize mobile +/- buttons (must be inside closure to access correct values)
    initSliderButtons(traditionalCount, plantBasedCount);

    // Initialize numeric input fields
    const bonelessInput = document.getElementById('traditional-boneless-count');
    const boneInInput = document.getElementById('traditional-bonein-count');

    if (bonelessInput && boneInInput) {
      // Handle boneless input changes
      bonelessInput.addEventListener('input', (e) => {
        let value = parseInt(e.target.value) || 0;
        // Clamp value between 0 and traditionalCount
        value = Math.max(0, Math.min(traditionalCount, value));

        // Update the slider
        if (newSlider) {
          newSlider.value = value;
        }

        // Update distribution
        updateTraditionalDistributionFromSlider(value, traditionalCount, plantBasedCount);
      });

      // Handle bone-in input changes
      boneInInput.addEventListener('input', (e) => {
        let value = parseInt(e.target.value) || 0;
        // Clamp value between 0 and traditionalCount
        value = Math.max(0, Math.min(traditionalCount, value));

        // Calculate boneless from bone-in
        const bonelessValue = traditionalCount - value;

        // Update the slider
        if (newSlider) {
          newSlider.value = bonelessValue;
        }

        // Update distribution
        updateTraditionalDistributionFromSlider(bonelessValue, traditionalCount, plantBasedCount);
      });
    }
  }

  // Initialize quick ratio buttons
  initQuickRatioButtons();
}

/**
 * Initialize quick ratio button interactions
 */
function initQuickRatioButtons() {
  const ratioButtons = document.querySelectorAll('.ratio-btn');

  ratioButtons.forEach(button => {
    button.addEventListener('click', () => {
      const ratio = parseInt(button.dataset.ratio);
      const traditionalCount = parseInt(button.dataset.traditionalCount);
      const bonelessCount = Math.round((traditionalCount * ratio) / 100);

      // ✅ Get plant-based count from state with validation
      const state = getState();
      const currentDist = state.currentConfig?.wingDistribution || {};
      let plantBasedCount = currentDist.cauliflower || currentDist.plantBased || 0;
      
      // ✅ VALIDATION: If state says 0, check wizard percentages
      const wizardPercentages = state.eventDetails?.wingDistributionPercentages;
      if (wizardPercentages && wizardPercentages.plantBased > 0 && plantBasedCount === 0) {
        const totalWings = state.selectedPackage?.wingOptions?.totalWings || state.selectedPackage?.totalWings || 250;
        plantBasedCount = Math.round((totalWings * wizardPercentages.plantBased) / 100);
        console.warn('⚠️ Ratio button: Recovering plant-based from wizard:', plantBasedCount);
      }

      // Update slider value and trigger update
      const slider = document.getElementById('traditional-boneless-slider');
      if (slider) {
        slider.value = bonelessCount;
        updateTraditionalDistributionFromSlider(bonelessCount, traditionalCount, plantBasedCount);
      }

      // Visual feedback - highlight selected button briefly
      ratioButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      setTimeout(() => button.classList.remove('active'), 1000);
    });
  });
}

/**
 * Update distribution based on slider value
 * LEGACY: Used only for single-section layout (no plant-based)
 */
function updateDistributionFromSlider(bonelessCount) {
  const state = getState();
  const totalWings = state.selectedPackage?.wingOptions?.totalWings || state.selectedPackage?.totalWings || 250;
  const boneInCount = totalWings - bonelessCount;
  const currentDist = state.currentConfig?.wingDistribution || {};

  const distribution = {
    boneless: bonelessCount,
    boneIn: boneInCount,
    cauliflower: currentDist.cauliflower || 0,  // Preserve plant-based
    boneInStyle: currentDist.boneInStyle || 'mixed',
    distributionSource: currentDist.distributionSource || 'event-planner'
  };

  updateState('currentConfig.wingDistribution', distribution);

  // Update UI elements (DOM only - no re-render)
  const bonelessDisplay = document.getElementById('boneless-count');
  const boneInDisplay = document.getElementById('bonein-count');
  const sliderFill = document.querySelector('.slider-fill');

  if (bonelessDisplay) bonelessDisplay.textContent = bonelessCount;
  if (boneInDisplay) boneInDisplay.textContent = boneInCount;
  if (sliderFill) {
    const percent = Math.round((bonelessCount / totalWings) * 100);
    sliderFill.style.width = `${percent}%`;
  }

  // Update wing counter display (DOM only)
  updateWingCounterDOM(distribution);
  toggleBoneInStyleSelector(boneInCount);
}

/**
 * Update traditional distribution (preserves plant-based count)
 * Used in two-section layout where plant-based is locked
 * @param {number} bonelessCount - New boneless count from slider
 * @param {number} traditionalCount - Total traditional wings (pre-calculated)
 * @param {number} plantBasedCount - Plant-based wings count (preserved from wizard)
 */
function updateTraditionalDistributionFromSlider(bonelessCount, traditionalCount, plantBasedCount) {
  const boneInCount = traditionalCount - bonelessCount;
  const state = getState();
  
  // ✅ VALIDATION: Ensure plant-based count is never 0 if it was originally set
  let validatedPlantBasedCount = plantBasedCount;
  if (plantBasedCount <= 0) {
    console.error('🚨 CRITICAL: plantBasedCount is 0 or negative!', {
      bonelessCount,
      traditionalCount,
      plantBasedCount
    });
    
    // Try to recover from state
    const currentDist = state.currentConfig?.wingDistribution || {};
    const wizardPercentages = state.eventDetails?.wingDistributionPercentages;
    
    if (wizardPercentages && wizardPercentages.plantBased > 0) {
      const totalWings = state.selectedPackage?.wingOptions?.totalWings || state.selectedPackage?.totalWings || 250;
      const recoveredPlantBased = Math.round((totalWings * wizardPercentages.plantBased) / 100);
      console.warn('⚠️ Recovering plant-based count from wizard:', recoveredPlantBased);
      validatedPlantBasedCount = recoveredPlantBased;
    } else if (currentDist.cauliflower > 0) {
      console.warn('⚠️ Recovering plant-based count from state:', currentDist.cauliflower);
      validatedPlantBasedCount = currentDist.cauliflower;
    }
  }
  
  const currentDistribution = state.currentConfig?.wingDistribution || {};
  const distribution = {
    boneless: bonelessCount,
    boneIn: boneInCount,
    cauliflower: validatedPlantBasedCount,  // ✅ CRITICAL: Use validated closure value, NOT state
    boneInStyle: currentDistribution.boneInStyle || 'mixed',
    distributionSource: currentDistribution.distributionSource || 'event-planner'
  };

  console.log('✅ Updating distribution with locked plant-based:', {
    boneless: bonelessCount,
    boneIn: boneInCount,
    cauliflower: validatedPlantBasedCount,  // Should never be 0
    traditionalTotal: traditionalCount,
    total: bonelessCount + boneInCount + validatedPlantBasedCount
  });

  updateState('currentConfig.wingDistribution', distribution);

  // Update UI (both input value and textContent for compatibility)
  const bonelessDisplay = document.getElementById('traditional-boneless-count');
  const boneInDisplay = document.getElementById('traditional-bonein-count');
  const bonelessPercent = document.getElementById('boneless-percent');
  const boneInPercent = document.getElementById('bonein-percent');

  if (bonelessDisplay) {
    bonelessDisplay.value = bonelessCount;
    bonelessDisplay.textContent = bonelessCount;
  }
  if (boneInDisplay) {
    boneInDisplay.value = boneInCount;
    boneInDisplay.textContent = boneInCount;
  }

  if (bonelessPercent && traditionalCount > 0) {
    bonelessPercent.textContent = `${Math.round((bonelessCount / traditionalCount) * 100)}%`;
  }
  if (boneInPercent && traditionalCount > 0) {
    boneInPercent.textContent = `${Math.round((boneInCount / traditionalCount) * 100)}%`;
  }

  // Update wing counter display
  updateWingCounterDOM(distribution);

  // Show/hide bone-in style selector based on bone-in count
  toggleBoneInStyleSelector(boneInCount);
}

/**
 * Helper: Update wing counter display without re-rendering
 */
function updateWingCounterDOM(distribution) {
  const bonelessCounter = document.querySelector('.counter-boneless .counter-value');
  const boneInCounter = document.querySelector('.counter-bonein .counter-value');
  const plantBasedCounter = document.querySelector('.counter-plant .counter-value');
  const totalValue = document.querySelector('.total-value');

  if (bonelessCounter) bonelessCounter.textContent = distribution.boneless;
  if (boneInCounter) boneInCounter.textContent = distribution.boneIn;
  if (plantBasedCounter) plantBasedCounter.textContent = distribution.cauliflower || 0;

  const total = distribution.boneless + distribution.boneIn + (distribution.cauliflower || 0);
  const state = getState();
  const totalWings = state.selectedPackage?.wingOptions?.totalWings || state.selectedPackage?.totalWings || 250;
  if (totalValue) totalValue.textContent = `${total} / ${totalWings}`;
}

/**
 * Helper: Show/hide bone-in style selector based on bone-in count
 */
function toggleBoneInStyleSelector(boneInCount) {
  const boneInStyleSection = document.querySelector('.bonein-style-section');
  if (boneInStyleSection) {
    boneInStyleSection.style.display = boneInCount > 0 ? 'block' : 'none';
  }
}

/**
 * Helper: Update bone-in style selection UI
 */
function updateBoneInStyleSelection(selectedStyle) {
  const cards = document.querySelectorAll('.style-card');
  cards.forEach(card => {
    const styleId = card.dataset.styleId;
    if (styleId === selectedStyle) {
      card.classList.add('style-selected');
      card.setAttribute('aria-checked', 'true');
    } else {
      card.classList.remove('style-selected');
      card.setAttribute('aria-checked', 'false');
    }
  });
}

/**
 * Helper: Update plant-based preparation selection UI
 */
function updatePlantBasedPrepSelection(selectedPrep) {
  const buttons = document.querySelectorAll('.prep-option');
  buttons.forEach(button => {
    const prepType = button.dataset.prep;
    if (prepType === selectedPrep) {
      button.classList.add('active');
      button.setAttribute('aria-checked', 'true');
    } else {
      button.classList.remove('active');
      button.setAttribute('aria-checked', 'false');
    }
  });
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

  // ALSO update wingDistribution object (Bug #2 fix - pricing calculator reads from here)
  const state = getState();
  if (state.currentConfig?.wingDistribution) {
    updateState('currentConfig.wingDistribution', {
      ...state.currentConfig.wingDistribution,
      boneInStyle: styleId
    });
  }

  // Update UI without re-rendering
  updateBoneInStyleSelection(styleId);

  console.log(`✓ Selected bone-in style: ${styleId}`);
}

/**
 * Initialize plant-based preparation selector
 */
function initPlantBasedPreparationSelector() {
  const prepOptions = document.querySelectorAll('.prep-option');

  prepOptions.forEach(option => {
    option.addEventListener('click', () => {
      const prepMethod = option.dataset.prep;
      selectPlantBasedPreparation(prepMethod);
    });

    // Keyboard support
    option.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        option.click();
      }
    });
  });
}

/**
 * Select plant-based preparation method
 */
function selectPlantBasedPreparation(prepMethod) {
  updateState('currentConfig.plantBasedPrep', prepMethod);

  // Update UI without re-rendering
  updatePlantBasedPrepSelection(prepMethod);

  console.log(`✓ Selected plant-based preparation: ${prepMethod}`);
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

  console.log('🧮 calculateSmartWingDefaults called:');
  console.log('  totalWings:', totalWings);
  console.log('  wizardDistribution:', wizardDistribution);

  // Calculate wing counts from percentages
  const traditionalWings = Math.round(totalWings * wizardDistribution.traditional / 100);
  const plantBasedWings = Math.round(totalWings * wizardDistribution.plantBased / 100);

  console.log('  traditionalWings:', traditionalWings);
  console.log('  plantBasedWings:', plantBasedWings);

  // Smart split for traditional: 60% boneless, 40% bone-in
  const boneless = Math.round(traditionalWings * 0.6);
  const boneIn = traditionalWings - boneless;

  console.log('  boneless (60%):', boneless);
  console.log('  boneIn (40%):', boneIn);

  const result = {
    boneless,
    boneIn,
    cauliflower: plantBasedWings
  };

  console.log('  RETURNING:', result);
  return result;
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
