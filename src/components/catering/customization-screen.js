/**
 * SP-006: Customization Split-Screen Layout
 *
 * Convergence point for both Quick Browse and Guided Planner flows.
 * Provides visual split-screen interface for customizing shared platters.
 *
 * Story: SP-006
 * Points: 8
 * Created: 2025-10-27
 */

import { getState, updateState, onStateChange } from '../../services/shared-platter-state-service.js';
import { renderWingDistributionSelector, initWingDistributionSelector } from './wing-distribution-selector.js';
import { renderIntegratedSauceDistribution, initIntegratedSauceDistribution, getSauceById, determineSauceViscosity } from './sauce-distribution-integrated.js';
import { renderDipPhotoCardSelector, initDipPhotoCardSelector } from './dip-photo-card-selector.js';
import { renderDipsCounterSelector, initDipsCounterSelector } from './dips-counter-selector.js';
import { initPricingSummary, renderPricingSummary as renderFullPricingSummary } from './pricing-summary-master.js';
import { recalculatePricing, getCurrentPricing } from '../../utils/pricing-aggregator.js';
import '../../styles/sauce-distribution-integrated.css';

/**
 * Initialize customization screen
 * Sets up event listeners and section navigation
 */
export function initCustomizationScreen() {
  const container = document.getElementById('customization-screen-container');
  if (!container) {
    console.log('📦 Customization screen container not found');
    return;
  }

  // Skip if container is hidden (not ready for initialization)
  if (container.style.display === 'none' || getComputedStyle(container).display === 'none') {
    console.log('📦 Customization screen hidden - skipping initialization');
    return;
  }

  // Skip if already initialized (check for loaded content, not visibility)
  const contentContainer = document.getElementById('customization-content');
  if (contentContainer && contentContainer.dataset.initialized === 'true') {
    console.log('📦 Customization screen already initialized - skipping');
    return;
  }

  console.log('🎨 Initializing customization screen...');

  // Set up section navigation
  initSectionNavigation();

  // Set up action buttons
  initActionButtons();

  // Subscribe to state changes for live updates (SP-OS-S5)
  // Use wildcard to catch ALL currentConfig changes:
  // - currentConfig.wingDistribution
  // - currentConfig.sauces
  // - currentConfig.removedItems
  // - etc.
  onStateChange('currentConfig.*', updatePricingSummary);

  // Initial render
  updatePricingSummary();
  updateProgressIndicator();

  // Load default section (wings)
  activateSection('wings');

  // Mark as initialized
  if (contentContainer) {
    contentContainer.dataset.initialized = 'true';
  }

  console.log('✅ Customization screen initialized');
}

/**
 * Render the customization screen HTML
 * @returns {string} HTML markup
 */
export function renderCustomizationScreen() {
  const state = getState();
  const selectedPackage = state.selectedPackage;

  if (!selectedPackage) {
    return renderNoPackageSelected();
  }

  return `
    <div id="customization-screen-container" class="customization-screen-container" style="display: none;">
      <div class="customization-wrapper">
        <!-- Left Panel: Customization Sections -->
        <div class="customization-panel">
          ${renderPanelHeader(selectedPackage)}
          ${renderSectionNavigation()}
          <div id="customization-content" class="section-content">
            <div class="section-loading">Loading...</div>
          </div>
          ${renderPanelFooter()}
        </div>

        <!-- Right Panel: Live Pricing Summary (Desktop/Tablet) -->
        <div class="pricing-summary-panel sticky">
          ${renderPricingSummary(selectedPackage, state.currentConfig)}
        </div>
      </div>

      <!-- Mobile: Floating Pricing Button -->
      ${renderMobilePricingButton()}
    </div>
  `;
}

/**
 * Render panel header with package name and progress
 */
function renderPanelHeader(pkg) {
  return `
    <div class="panel-header">
      <div class="header-content">
        <h2 class="panel-title">Customize Your ${pkg.name}</h2>
        <!-- Hidden: Internal package info -->
        <p class="panel-subtitle" style="display: none;">Tier ${pkg.tier} Package • Serves ${pkg.servesMin}-${pkg.servesMax}</p>
      </div>
      <!-- Hidden: Progress indicator - space reserved for section tabs -->
      <div class="progress-indicator" id="progress-indicator" style="display: none;">
        <span class="progress-text">0 of 6 sections complete</span>
        <div class="progress-bar">
          <div class="progress-fill" style="width: 0%"></div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render section navigation tabs
 */
function renderSectionNavigation() {
  const sections = [
    { id: 'wings', label: 'Wings', icon: '🍗' },
    { id: 'sauces', label: 'Sauces & Distribution', icon: '🌶️' },
    { id: 'dips', label: 'Dips', icon: '🥣' },
    { id: 'sides', label: 'Sides', icon: '🍟' },
    { id: 'desserts', label: 'Desserts', icon: '🍰' },
    { id: 'beverages', label: 'Beverages', icon: '🥤' }
  ];

  return `
    <nav class="section-nav" role="tablist">
      ${sections.map((section, index) => `
        <button
          class="section-tab ${index === 0 ? 'active' : ''}"
          role="tab"
          aria-selected="${index === 0 ? 'true' : 'false'}"
          aria-controls="section-${section.id}"
          data-section="${section.id}"
          id="tab-${section.id}"
        >
          <span class="tab-icon">${section.icon}</span>
          <span class="tab-label">${section.label}</span>
          <span class="tab-status" data-status="${section.id}">○</span>
        </button>
      `).join('')}
    </nav>
  `;
}

/**
 * Render panel footer with action buttons
 */
function renderPanelFooter() {
  return `
    <div class="panel-footer">
      <button class="btn-secondary" id="btn-back-to-packages">
        ← Back to Packages
      </button>
      <button class="btn-secondary" id="btn-save-draft">
        💾 Save Draft
      </button>
      <button class="btn-primary" id="btn-continue-to-addons">
        Continue to Add-Ons →
      </button>
    </div>
  `;
}

/**
 * Render pricing summary panel
 */
function renderPricingSummary(pkg, config = {}) {
  // Create container that will be filled by initPricingSummary
  return `<div id="pricing-summary-container" class="summary-content"></div>`;
}

/**
 * Render mobile floating pricing button
 */
function renderMobilePricingButton() {
  const state = getState();
  const pkg = state.selectedPackage;
  if (!pkg) return '';

  const basePrice = pkg.basePrice || 0;

  return `
    <button class="mobile-pricing-button" id="mobile-pricing-button" aria-label="View pricing summary">
      <span class="mobile-price-label">Total:</span>
      <span class="mobile-price-value">$${basePrice.toFixed(2)}</span>
      <span class="mobile-price-icon">↑</span>
    </button>

    <!-- Mobile Pricing Drawer -->
    <div class="mobile-pricing-drawer" id="mobile-pricing-drawer">
      <div class="drawer-header">
        <h3>Order Summary</h3>
        <button class="drawer-close" id="drawer-close-button" aria-label="Close summary">×</button>
      </div>
      <div class="drawer-content" id="mobile-drawer-content">
        ${renderPricingSummary(pkg, state.currentConfig)}
      </div>
    </div>
  `;
}

/**
 * Render "no package selected" state
 */
function renderNoPackageSelected() {
  return `
    <div id="customization-screen-container" class="customization-screen-container" style="display: none;">
      <div class="customization-screen-empty">
        <div class="empty-icon">📦</div>
        <h2>No Package Selected</h2>
        <p>Please select a package to continue customizing your order.</p>
        <button class="btn-primary" onclick="window.location.reload()">
          ← Back to Packages
        </button>
      </div>
    </div>
  `;
}

/**
 * Initialize section navigation
 */
function initSectionNavigation() {
  const tabs = document.querySelectorAll('.section-tab');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const sectionId = tab.dataset.section;
      activateSection(sectionId);
    });

    // Keyboard support
    tab.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        tab.click();
      }
    });
  });
}

/**
 * Activate a specific section
 */
async function activateSection(sectionId) {
  // Update tabs
  document.querySelectorAll('.section-tab').forEach(tab => {
    const isActive = tab.dataset.section === sectionId;
    tab.classList.toggle('active', isActive);
    tab.setAttribute('aria-selected', isActive);
  });

  // Update active section in state
  updateState('activeSection', sectionId);

  // Load section content
  const contentContainer = document.getElementById('customization-content');
  if (contentContainer) {
    // Show loading state
    contentContainer.innerHTML = '<div class="section-loading">Loading...</div>';

    // Render content (may be async for sauces section)
    const content = await renderSectionContent(sectionId);
    contentContainer.innerHTML = content;

    // Initialize section-specific interactions
    initializeSectionInteractions(sectionId);
  }

  // Update progress
  updateProgressIndicator();

  console.log(`📍 Activated section: ${sectionId}`);
}

/**
 * Render section content based on section ID
 */
async function renderSectionContent(sectionId) {
  const state = getState();
  const packageData = state.selectedPackage;
  const currentConfig = state.currentConfig || {};

  switch (sectionId) {
    case 'wings':
      return renderWingDistributionSelector(packageData);

    case 'sauces':
      // Get wing distribution from state
      const wingDistribution = currentConfig.wingDistribution || {};
      const sauceDistributions = currentConfig.sauceDistributions || {};

      // Render integrated sauce distribution for each wing type
      const wingTypes = Object.keys(wingDistribution).filter(type => wingDistribution[type] > 0);

      if (wingTypes.length === 0) {
        return `
          <div class="section-message">
            <div class="message-icon">🍗</div>
            <h3>Select Wings First</h3>
            <p>Please configure your wing distribution in the Wings section before selecting sauces.</p>
          </div>
        `;
      }

      const sauceHtml = [];
      const maxSauceSelections = packageData.sauceSelections?.max || packageData.sauceSelections || 3;

      for (const wingType of wingTypes) {
        const wingCount = wingDistribution[wingType];
        const preSelectedData = sauceDistributions[wingType] || [];

        const html = await renderIntegratedSauceDistribution({
          wingType,
          wingCount,
          maxSelections: maxSauceSelections,
          preSelectedData,
          onDistributionChange: (distributionData) => handleSauceDistributionChange(wingType, distributionData)
        });

        sauceHtml.push(html);
      }

      return sauceHtml.join('');

    case 'dips':
      // SP-009: Use counter selector for shared platters
      const packageDipsIncluded = packageData.dipsIncluded || { quantity: 3, unit: 'five-pack' };
      const preSelectedDips = currentConfig.dips || [];
      const skipDips = currentConfig.noDips || false;

      return await renderDipsCounterSelector({
        packageIncluded: packageDipsIncluded,
        preSelected: preSelectedDips,
        skipDips: skipDips,
        onCounterChange: handleDipCounterChange
      });

    case 'sides':
    case 'desserts':
    case 'beverages':
      return renderSectionPlaceholder(sectionId);

    default:
      return renderSectionPlaceholder('wings');
  }
}

/**
 * Initialize section-specific interactions
 */
function initializeSectionInteractions(sectionId) {
  const state = getState();
  const packageData = state.selectedPackage;

  switch (sectionId) {
    case 'wings':
      initWingDistributionSelector();
      break;

    case 'sauces':
      // Initialize integrated sauce distribution for each wing type
      const currentConfig = state.currentConfig || {};
      const wingDistribution = currentConfig.wingDistribution || {};
      const wingTypes = Object.keys(wingDistribution).filter(type => wingDistribution[type] > 0);

      wingTypes.forEach(wingType => {
        const wingCount = wingDistribution[wingType];
        initIntegratedSauceDistribution(
          wingType,
          wingCount,
          (distributionData) => handleSauceDistributionChange(wingType, distributionData)
        );
      });

      console.log('🌶️ Integrated sauce distribution initialized for', wingTypes.length, 'wing types');
      break;

    case 'dips':
      // SP-009: Initialize counter selector for shared platters
      const packageDipsIncluded = packageData.dipsIncluded || { quantity: 3, unit: 'five-pack' };
      initDipsCounterSelector(packageDipsIncluded, handleDipCounterChange);
      console.log('🥣 Dips counter selector initialized');
      break;

    // Other sections will be initialized here as they're built
    case 'sides':
    case 'desserts':
    case 'beverages':
      console.log(`📍 ${sectionId} section - component pending (SP-009 through SP-012)`);
      break;
  }
}

/**
 * Render section placeholder (until individual components are built)
 */
function renderSectionPlaceholder(sectionId) {
  const placeholders = {
    wings: { icon: '🍗', title: 'Wing Distribution', desc: 'Adjust boneless/bone-in split' },
    sauces: { icon: '🌶️', title: 'Sauce Selection', desc: 'Choose your sauce flavors' },
    dips: { icon: '🥣', title: 'Dips & Extras', desc: 'Add ranch, blue cheese, etc.' },
    sides: { icon: '🍟', title: 'Sides Selection', desc: 'Chips, coleslaw, salads' },
    desserts: { icon: '🍰', title: 'Desserts', desc: 'Sweet treats for your event' },
    beverages: { icon: '🥤', title: 'Beverages', desc: 'Hot and cold drink options' }
  };

  const placeholder = placeholders[sectionId] || placeholders.wings;

  return `
    <div class="section-placeholder">
      <div class="placeholder-icon">${placeholder.icon}</div>
      <h3>${placeholder.title}</h3>
      <p>${placeholder.desc}</p>
      <p class="placeholder-note">(Component implementation pending - SP-008 through SP-012)</p>
    </div>
  `;
}

/**
 * Initialize action buttons
 */
function initActionButtons() {
  // Back button
  const backButton = document.getElementById('btn-back-to-packages');
  if (backButton) {
    backButton.addEventListener('click', handleBackToPackages);
  }

  // Save draft button
  const saveDraftButton = document.getElementById('btn-save-draft');
  if (saveDraftButton) {
    saveDraftButton.addEventListener('click', handleSaveDraft);
  }

  // Continue button
  const continueButton = document.getElementById('btn-continue-to-addons');
  if (continueButton) {
    continueButton.addEventListener('click', handleContinue);
  }

  // Mobile pricing button
  const mobilePricingButton = document.getElementById('mobile-pricing-button');
  if (mobilePricingButton) {
    mobilePricingButton.addEventListener('click', toggleMobilePricingDrawer);
  }

  // Drawer close button
  const drawerCloseButton = document.getElementById('drawer-close-button');
  if (drawerCloseButton) {
    drawerCloseButton.addEventListener('click', toggleMobilePricingDrawer);
  }
}

/**
 * Handle back to packages navigation
 */
function handleBackToPackages() {
  const state = getState();
  const flowType = state.flowType;

  // Hide customization screen
  const container = document.getElementById('customization-screen-container');
  if (container) {
    container.style.display = 'none';
  }

  // Show appropriate previous screen
  if (flowType === 'guided-planner') {
    // Show recommendations
    const recommendationsContainer = document.getElementById('package-recommendations-container');
    if (recommendationsContainer) {
      recommendationsContainer.style.display = 'block';
      recommendationsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  } else {
    // Show package gallery (Quick Browse path)
    const galleryView = document.getElementById('package-gallery-view');
    if (galleryView) {
      galleryView.style.display = 'block';
      galleryView.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  updateState('currentStep', 'package-selection');
  console.log('← Navigated back to packages');
}

/**
 * Handle save draft
 */
function handleSaveDraft() {
  const state = getState();

  try {
    // State service already persists to localStorage automatically
    // Just show confirmation message
    showNotification('✅ Draft saved successfully!', 'success');
    console.log('💾 Draft saved to localStorage');
  } catch (error) {
    console.error('Error saving draft:', error);
    showNotification('❌ Failed to save draft', 'error');
  }
}

/**
 * Handle continue to add-ons
 */
function handleContinue() {
  const progress = calculateProgress();

  if (progress.percentage < 50) {
    showNotification('Please complete at least 3 sections before continuing', 'warning');
    return;
  }

  updateState('currentStep', 'add-ons');
  console.log('→ Continuing to add-ons (not yet implemented)');

  // Placeholder for now
  showNotification('Add-ons screen coming soon! (Sprint 2)', 'info');
}

/**
 * Toggle mobile pricing drawer
 */
function toggleMobilePricingDrawer() {
  const drawer = document.getElementById('mobile-pricing-drawer');
  if (drawer) {
    drawer.classList.toggle('open');
  }
}

/**
 * Calculate progress
 */
function calculateProgress() {
  const state = getState();
  const config = state.currentConfig || {};
  const sections = ['wings', 'sauces', 'dips', 'sides', 'desserts', 'beverages'];
  let completed = 0;

  sections.forEach(section => {
    if (isSectionComplete(section, config)) {
      completed++;
    }
  });

  return {
    completed,
    total: sections.length,
    percentage: Math.round((completed / sections.length) * 100)
  };
}

/**
 * Check if section is complete
 */
function isSectionComplete(section, config) {
  // Placeholder logic - will be updated when individual components are built
  switch (section) {
    case 'wings':
      return config.wingDistribution &&
             (config.wingDistribution.boneless > 0 || config.wingDistribution.boneIn > 0);
    case 'sauces':
      return config.sauces && config.sauces.length > 0;
    case 'sauce-assignments':
      // Check if preset is applied and all assignments are valid
      const sauceAssignments = config.sauceAssignments;
      if (!sauceAssignments || !sauceAssignments.appliedPreset) {
        return false;
      }
      // Check overall validation
      return sauceAssignments.summary?.validations?.overall?.valid || false;
    case 'dips':
      return config.noDips || (config.dips && config.dips.length > 0);
    case 'sides':
      return config.sides && config.sides.length > 0;
    case 'desserts':
      return config.noDesserts || (config.desserts && config.desserts.length > 0);
    case 'beverages':
      return config.noBeverages || (config.beverages && config.beverages.length > 0);
    default:
      return false;
  }
}

/**
 * Update progress indicator
 */
function updateProgressIndicator() {
  const progress = calculateProgress();
  const indicator = document.getElementById('progress-indicator');

  if (indicator) {
    const textElement = indicator.querySelector('.progress-text');
    const fillElement = indicator.querySelector('.progress-fill');

    if (textElement) {
      textElement.textContent = `${progress.completed} of ${progress.total} sections complete`;
    }

    if (fillElement) {
      fillElement.style.width = `${progress.percentage}%`;
    }
  }

  // Update section status badges
  const sections = ['wings', 'sauces', 'dips', 'sides', 'desserts', 'beverages'];
  const state = getState();
  const config = state.currentConfig || {};

  sections.forEach(section => {
    const statusElement = document.querySelector(`[data-status="${section}"]`);
    if (statusElement) {
      statusElement.textContent = isSectionComplete(section, config) ? '✓' : '○';
      statusElement.classList.toggle('complete', isSectionComplete(section, config));
    }
  });
}

/**
 * Calculate price modifications
 */
function calculateModifications(config) {
  const items = [];
  let total = 0;

  // Placeholder - will be calculated based on actual config
  // Example: Extra wings, sauce swaps, additional sides, etc.

  return { items, total };
}

/**
 * Debounce helper for performance optimization
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Update pricing summary (called on state changes)
 */
let pricingSummaryInitialized = false;
let pricingSummaryUnsubscribe = null;

// Debounced pricing recalculation (SP-OS-S5)
// Waits 150ms after last state change before recalculating
// Prevents excessive calculations during rapid slider movements
const debouncedRecalculatePricing = debounce((state) => {
  recalculatePricing(state, { trigger: 'state-change-debounced' });
}, 150);

function updatePricingSummary() {
  const state = getState();
  const pkg = state.selectedPackage;

  if (!pkg) return;

  // Initialize comprehensive pricing summary only once
  if (!pricingSummaryInitialized) {
    // Get initial pricing and state for initial render
    const initialPricing = getCurrentPricing();

    // Update desktop summary
    const summaryPanel = document.querySelector('.pricing-summary-panel');
    if (summaryPanel) {
      // CRITICAL FIX: Create empty container div, then let initPricingSummary fill it
      // This prevents double-wrapping and ID conflicts
      summaryPanel.innerHTML = '<div id="pricing-summary-container" class="summary-content"></div>';

      // Initialize the comprehensive pricing summary (SP-OS-S5)
      // Pass getState FUNCTION (not snapshot) so it gets fresh state on each update
      // This fixes the bug where totals wouldn't update when sliders moved
      pricingSummaryUnsubscribe = initPricingSummary('pricing-summary-container', getState, {
        showPackageHeader: true,
        showWings: true,
        showItems: true,
        showTotals: true,
        collapsible: true
      });
    }

    // Update mobile drawer
    const drawerContent = document.getElementById('mobile-drawer-content');
    if (drawerContent) {
      // Phase 1 fix: Pass proper pricing and state (not pkg and empty object)
      drawerContent.innerHTML = renderFullPricingSummary(initialPricing, state, {});
    }

    pricingSummaryInitialized = true;

    // Initial calculation (immediate, no debounce)
    recalculatePricing(state, { trigger: 'initial' });
  } else {
    // Subsequent updates use debounced calculation (SP-OS-S5)
    debouncedRecalculatePricing(state);
  }

  // Update mobile button
  const mobileButton = document.getElementById('mobile-pricing-button');
  if (mobileButton) {
    const basePrice = pkg.basePrice || 0;
    const priceValue = mobileButton.querySelector('.mobile-price-value');
    if (priceValue) {
      priceValue.textContent = `$${basePrice.toFixed(2)}`;
    }
  }

  // Update progress
  updateProgressIndicator();
}

/**
 * Handle sauce selection change
 */
async function handleSauceSelectionChange(selectedSauceIds) {
  const state = getState();

  // Fetch full sauce objects from Firestore
  const { getSaucesByIds } = await import('./sauce-photo-card-selector.js');
  const selectedSauceObjects = await getSaucesByIds(selectedSauceIds);

  // Update state with selected sauces (legacy format)
  updateState('currentConfig', {
    ...state.currentConfig,
    sauces: selectedSauceIds,
    saucesSource: 'manual'
  });

  // Initialize sauce assignments with selected sauces
  updateState('currentConfig.sauceAssignments', {
    selectedSauces: selectedSauceObjects,
    appliedPreset: null,
    assignments: {
      boneless: [],
      boneIn: [],
      cauliflower: []
    },
    summary: {
      totalWingsAssigned: 0,
      byApplicationMethod: { tossed: 0, onTheSide: 0 },
      containersNeeded: 0,
      validations: {
        boneless: { valid: true, errors: [] },
        boneIn: { valid: true, errors: [] },
        cauliflower: { valid: true, errors: [] },
        overall: { valid: true, errors: [] }
      }
    }
  });

  console.log(`🌶️ Sauce selection updated: ${selectedSauceIds.length} sauces selected`);

  // Pricing will update automatically via onStateChange listener
}

/**
 * Handle sauce distribution change for a wing type
 * PHASE 1: Dual-write to both sauceDistributions (temp) and sauceAssignments (target)
 */
function handleSauceDistributionChange(wingType, distributionData) {
  const state = getState();
  const currentConfig = state.currentConfig || {};

  // Enrich distribution data with sauce metadata
  const enrichedData = distributionData.map(item => {
    const sauce = getSauceById(item.sauceId);
    return {
      sauceId: item.sauceId,
      sauceName: sauce?.name || 'Unknown Sauce',
      sauceCategory: sauce?.category || 'signature-sauce',
      wingCount: item.quantity || 0,
      applicationMethod: item.application === 'side' ? 'on-the-side' : 'tossed',
      sauceInfo: {
        isDryRub: sauce?.isDryRub || false,
        viscosity: determineSauceViscosity(sauce),
        category: sauce?.category
      }
    };
  });

  // DUAL-WRITE Strategy (Phase 1):
  // 1. Save to sauceDistributions (temporary - for backward compatibility)
  const sauceDistributions = currentConfig.sauceDistributions || {};
  sauceDistributions[wingType] = distributionData;

  // 2. Save to sauceAssignments (target structure - for kitchen breakdown)
  const sauceAssignments = currentConfig.sauceAssignments || {
    selectedSauces: [],
    appliedPreset: null,
    assignments: { boneless: [], boneIn: [], cauliflower: [] },
    summary: { totalWingsAssigned: 0, byApplicationMethod: {}, containersNeeded: 0 }
  };

  sauceAssignments.assignments[wingType] = enrichedData;

  // Update state with both structures
  console.log(`🔧 [DEBUG] About to updateState for ${wingType}`, {
    hasSauceDistributions: !!sauceDistributions,
    hasSauceAssignments: !!sauceAssignments,
    assignmentsCount: Object.keys(sauceAssignments.assignments).length
  });

  updateState('currentConfig', {
    ...currentConfig,
    sauceDistributions,  // Temporary backward compatibility
    sauceAssignments      // Target structure for rendering
  });

  console.log(`🌶️ Sauce distribution updated for ${wingType}:`, {
    raw: distributionData,
    enriched: enrichedData
  });
  console.log(`🔧 [DEBUG] updateState completed for ${wingType}`);

  // Order summary will update automatically via onStateChange('currentConfig.*') listener
}

/**
 * Handle dip selection change (legacy - boxed meals)
 * @deprecated Use handleDipCounterChange for shared platters
 */
function handleDipSelectionChange(selectedDipIds) {
  const state = getState();

  // Update state with selected dips
  updateState('currentConfig', {
    ...state.currentConfig,
    dips: selectedDipIds,
    dipsSource: 'manual'
  });

  console.log(`🥣 Dip selection updated: ${selectedDipIds.length} dips selected`);

  // Pricing will update automatically via onStateChange listener
}

/**
 * Handle dip counter change (SP-009 - Shared Platters)
 * @param {Array} dipQuantities - Array of {id, name, quantity} objects
 * @param {Boolean} skipDips - Whether dips are skipped
 */
function handleDipCounterChange(dipQuantities, skipDips) {
  const state = getState();

  // Update state with dip quantities and skip flag
  updateState('currentConfig', {
    ...state.currentConfig,
    dips: dipQuantities,
    noDips: skipDips
  });

  console.log(`🥣 Dips counter updated: ${dipQuantities.length} types, skip=${skipDips}`);

  // Pricing will update automatically via onStateChange listener
  // No need to call recalculatePricing() here as component already does it
}

/**
 * Show notification message
 */
function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  notification.setAttribute('role', 'alert');

  // Add to document
  document.body.appendChild(notification);

  // Animate in
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);

  // Remove after 3 seconds
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

/**
 * Handle preset applied from sauce preset selector
 * Transitions from preset selector to assignment summary
 */
function handlePresetApplied(presetType, assignments) {
  console.log(`🎯 Preset applied: ${presetType}`);

  // Re-render the sauce-assignments section to show summary
  activateSection('sauce-assignments');

  console.log('✅ Transitioned to assignment summary');
}

/**
 * Handle edit wing type from assignment summary
 * Opens the wing type editor modal
 */
function handleEditWingType(wingType) {
  console.log(`✏️ Opening editor for: ${wingType}`);

  // Open editor modal
  openWingTypeEditor(wingType, (editedWingType, updatedAssignments) => {
    console.log(`✅ Wing type edited: ${editedWingType}`);

    // Re-render the sauce-assignments section to show updated summary
    activateSection('sauce-assignments');
  });
}

/**
 * Handle continue from assignment summary
 * Validates all assignments and proceeds to next section
 */
function handleContinueToAddons() {
  console.log('📋 Continue from sauce assignments');

  // Activate next section (dips)
  activateSection('dips');
}
