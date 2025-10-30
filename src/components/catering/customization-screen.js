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
import { renderSaucePhotoCardSelector, initSaucePhotoCardSelector } from './sauce-photo-card-selector.js';

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

  // Subscribe to state changes for live updates
  onStateChange('currentConfig', updatePricingSummary);

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
        <p class="panel-subtitle">Tier ${pkg.tier} Package • Serves ${pkg.servesMin}-${pkg.servesMax}</p>
      </div>
      <div class="progress-indicator" id="progress-indicator">
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
    { id: 'sauces', label: 'Sauces', icon: '🌶️' },
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
  const basePrice = pkg.basePrice || 0;
  const modifications = calculateModifications(config);
  const subtotal = basePrice + modifications.total;
  const tax = subtotal * 0.08; // 8% tax
  const grandTotal = subtotal + tax;

  return `
    <div class="summary-content">
      <div class="summary-header">
        <h3 class="summary-title">Order Summary</h3>
        <span class="summary-tier">Tier ${pkg.tier}</span>
      </div>

      <div class="summary-package">
        <div class="package-name">${pkg.name}</div>
        <div class="package-serves">Serves ${pkg.servesMin}-${pkg.servesMax}</div>
      </div>

      <div class="summary-base-price">
        <span class="price-label">Base Price:</span>
        <span class="price-value">$${basePrice.toFixed(2)}</span>
      </div>

      ${modifications.items.length > 0 ? `
        <div class="summary-modifications">
          <h4 class="modifications-title">Modifications:</h4>
          <div class="modifications-list">
            ${modifications.items.map(mod => `
              <div class="modification-item ${mod.type}">
                <span class="mod-label">${mod.label}</span>
                <span class="mod-amount">${mod.type === 'add' ? '+' : ''}$${mod.amount.toFixed(2)}</span>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <div class="summary-divider"></div>

      <div class="summary-subtotal">
        <span class="subtotal-label">Subtotal:</span>
        <span class="subtotal-value">$${subtotal.toFixed(2)}</span>
      </div>

      <div class="summary-tax">
        <span class="tax-label">Tax (8%):</span>
        <span class="tax-value">$${tax.toFixed(2)}</span>
      </div>

      <div class="summary-divider thick"></div>

      <div class="summary-grand-total">
        <span class="total-label">Total:</span>
        <span class="total-value">$${grandTotal.toFixed(2)}</span>
      </div>

      <div class="summary-footer">
        <p class="summary-note">✅ Includes plates, napkins & utensils</p>
        <p class="summary-note">🚚 Free delivery within 10 miles</p>
      </div>
    </div>
  `;
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
    <div class="customization-screen-empty">
      <div class="empty-icon">📦</div>
      <h2>No Package Selected</h2>
      <p>Please select a package to continue customizing your order.</p>
      <button class="btn-primary" onclick="window.location.reload()">
        ← Back to Packages
      </button>
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
      // Get smart defaults or current selection
      const preSelectedSauces = currentConfig.sauces || [];
      const maxSauceSelections = packageData.sauceSelections?.max || packageData.sauceSelections || 3;

      return await renderSaucePhotoCardSelector({
        maxSelections: maxSauceSelections,
        preSelectedIds: preSelectedSauces,
        onSelectionChange: handleSauceSelectionChange
      });

    case 'dips':
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
      const maxSauceSelections = packageData.sauceSelections?.max || packageData.sauceSelections || 3;
      initSaucePhotoCardSelector(maxSauceSelections, handleSauceSelectionChange);
      console.log('🌶️ Sauce selector initialized');
      break;

    // Other sections will be initialized here as they're built
    case 'dips':
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
 * Update pricing summary (called on state changes)
 */
function updatePricingSummary() {
  const state = getState();
  const pkg = state.selectedPackage;
  const config = state.currentConfig;

  if (!pkg) return;

  // Update desktop summary
  const summaryPanel = document.querySelector('.pricing-summary-panel');
  if (summaryPanel) {
    summaryPanel.innerHTML = renderPricingSummary(pkg, config);
  }

  // Update mobile drawer
  const drawerContent = document.getElementById('mobile-drawer-content');
  if (drawerContent) {
    drawerContent.innerHTML = renderPricingSummary(pkg, config);
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
function handleSauceSelectionChange(selectedSauceIds) {
  const state = getState();

  // Update state with selected sauces
  updateState('currentConfig', {
    ...state.currentConfig,
    sauces: selectedSauceIds,
    saucesSource: 'manual'
  });

  console.log(`🌶️ Sauce selection updated: ${selectedSauceIds.length} sauces selected`);

  // Pricing will update automatically via onStateChange listener
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
