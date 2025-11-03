/**
 * Master Pricing Summary Component
 *
 * Orchestrates all pricing renderers into a unified summary display:
 * - Package selection header
 * - Wings pricing section
 * - Items pricing section (sauces, dips, sides, desserts, beverages)
 * - Totals summary with tax calculation
 * - Collapsible sections for better UX
 * - Print-ready formatting
 *
 * @module pricing-summary-master
 * @created 2025-10-31
 * @epic SP-PRICING-001
 * @story S8-MasterSummary
 */

import { renderWingsPricing } from './pricing-wings-renderer.js';
import { renderItemsPricing } from './pricing-items-renderer.js';
import { onPricingChange, getCurrentPricing } from '../../utils/pricing-aggregator.js';

/**
 * Render complete pricing summary
 *
 * @param {Object} pricing - Unified pricing structure
 * @param {Object} state - Current configurator state
 * @param {Object} options - Rendering options
 * @returns {string} HTML string
 */
export function renderPricingSummary(pricing, state = {}, options = {}) {
  const {
    showPackageHeader = true,
    showWings = true,
    showItems = true,
    showTotals = true,
    collapsible = true,
    printMode = false,
    containerId = 'pricing-summary'
  } = options;

  if (!pricing || !pricing.totals) {
    return renderEmptyState();
  }

  const { selectedPackage = {} } = state;

  return `
    <div class="pricing-summary-master ${printMode ? 'print-mode' : ''}" id="${containerId}">
      ${showPackageHeader ? renderPackageHeader(selectedPackage, pricing, collapsible) : ''}

      ${renderPackageIncludes(selectedPackage, collapsible)}

      <div class="pricing-sections">
        ${showWings ? renderWingsSection(pricing, collapsible) : ''}
        ${showItems ? renderItemsSection(pricing, collapsible) : ''}
      </div>

      ${showTotals ? renderTotalsSection(pricing, printMode) : ''}
    </div>
  `;
}

/**
 * Render package selection header
 */
function renderPackageHeader(packageInfo, pricing, collapsible) {
  const {
    name = 'Custom Package',
    basePrice = 0,
    description = ''
  } = packageInfo;

  // Get total wings from package config (not pricing items, since wings may not be customized yet)
  const totalWingsInPackage = packageInfo.wingOptions?.totalWings || 60;

  const totalWings = Object.values(pricing.items || {})
    .filter(item => item.type === 'wing')
    .reduce((sum, item) => sum + (item.quantity || 0), 0);

  const totalItems = Object.keys(pricing.items || {}).length;

  return `
    <div class="pricing-header ${collapsible ? 'collapsible' : ''}" data-section="header">
      <div class="header-content">
        <div class="package-info">
          <h2 class="package-name">${name}</h2>
          ${description ? `<p class="package-description">${description}</p>` : ''}
        </div>
        <div class="package-stats">
          <div class="stat-item">
            <span class="stat-label">Wing Count:</span>
            <span class="stat-value">${totalWings} / ${totalWingsInPackage}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Base Price:</span>
            <span class="stat-value">$${basePrice.toFixed(2)}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Total Items:</span>
            <span class="stat-value">${totalItems}</span>
          </div>
        </div>
      </div>
      ${collapsible ? `
        <button class="collapse-toggle" data-target="header" aria-label="Toggle package details">
          <span class="toggle-icon">▼</span>
        </button>
      ` : ''}
    </div>
  `;
}

/**
 * Render package includes section (base package contents)
 */
function renderPackageIncludes(packageInfo, collapsible) {
  if (!packageInfo || !packageInfo.includes || packageInfo.includes.length === 0) {
    return '';
  }

  const { includes = [] } = packageInfo;

  return `
    <div class="package-includes ${collapsible ? 'collapsible' : ''}" data-section="includes">
      <div class="includes-header">
        <h3 class="includes-title">What's Included</h3>
        ${collapsible ? `
          <button class="collapse-toggle" data-target="includes" aria-label="Toggle included items">
            <span class="toggle-icon">▼</span>
          </button>
        ` : ''}
      </div>
      <div class="includes-content">
        <ul class="includes-list">
          ${includes.map(item => `
            <li class="include-item">
              <span class="include-icon">✓</span>
              <span class="include-text">${item}</span>
            </li>
          `).join('')}
        </ul>
      </div>
    </div>
  `;
}

/**
 * Render wings pricing section
 */
function renderWingsSection(pricing, collapsible) {
  // Check if there are any wing items
  const hasWings = Object.values(pricing.items || {})
    .some(item => item.type === 'wing');

  // Skip if no wings
  if (!hasWings) {
    return '';
  }

  const wingsHtml = renderWingsPricing(pricing, {
    showDetails: true,
    showUpcharges: true,
    containerId: 'wings-section-content'
  });

  return `
    <div class="summary-section wings-section ${collapsible ? 'collapsible' : ''}" data-section="wings">
      ${collapsible ? `
        <div class="section-toggle">
          <button class="collapse-toggle" data-target="wings" aria-label="Toggle wings details">
            <span class="toggle-icon">▼</span>
          </button>
        </div>
      ` : ''}
      <div class="section-content" id="wings-section-wrapper">
        ${wingsHtml}
      </div>
    </div>
  `;
}

/**
 * Render items pricing section
 */
function renderItemsSection(pricing, collapsible) {
  // Check if there are any non-wing items
  const hasItems = Object.values(pricing.items || {})
    .some(item => item.type !== 'wing' && item.category !== 'package');

  // Skip if no items
  if (!hasItems) {
    return '';
  }

  const itemsHtml = renderItemsPricing(pricing, {
    showDetails: true,
    containerId: 'items-section-content'
  });

  return `
    <div class="summary-section items-section ${collapsible ? 'collapsible' : ''}" data-section="items">
      ${collapsible ? `
        <div class="section-toggle">
          <button class="collapse-toggle" data-target="items" aria-label="Toggle items details">
            <span class="toggle-icon">▼</span>
          </button>
        </div>
      ` : ''}
      <div class="section-content" id="items-section-wrapper">
        ${itemsHtml}
      </div>
    </div>
  `;
}

/**
 * Render totals summary section
 */
function renderTotalsSection(pricing, printMode) {
  const {
    itemsSubtotal = 0,
    upcharges = 0,
    discounts = 0,
    subtotal = 0,
    tax = 0,
    taxRate = 0,
    total = 0,
    perPersonCost = 0,
    guestCount = 10
  } = pricing.totals;

  const hasUpcharges = upcharges > 0;
  const hasDiscounts = discounts > 0;
  const hasTax = tax > 0;
  const hasPerPersonCost = perPersonCost > 0 && guestCount > 0;

  return `
    <div class="pricing-totals ${printMode ? 'print-mode' : ''}">
      <div class="totals-header">
        <h3 class="totals-title">Order Summary</h3>
      </div>

      <div class="totals-breakdown">
        <div class="total-line total-items">
          <span class="total-label">Items Subtotal:</span>
          <span class="total-amount">$${itemsSubtotal.toFixed(2)}</span>
        </div>

        ${hasUpcharges ? `
          <div class="total-line total-upcharges">
            <span class="total-label">Premium Options:</span>
            <span class="total-amount upcharge-amount">+$${upcharges.toFixed(2)}</span>
          </div>
        ` : ''}

        ${hasDiscounts ? `
          <div class="total-line total-discounts">
            <span class="total-label">Discounts:</span>
            <span class="total-amount discount-amount">-$${discounts.toFixed(2)}</span>
          </div>
        ` : ''}

        <div class="total-line total-subtotal">
          <span class="total-label">Subtotal:</span>
          <span class="total-amount">$${subtotal.toFixed(2)}</span>
        </div>

        ${hasTax ? `
          <div class="total-line total-tax">
            <span class="total-label">Tax (${(taxRate * 100).toFixed(1)}%):</span>
            <span class="total-amount">$${tax.toFixed(2)}</span>
          </div>
        ` : ''}

        <div class="total-line total-grand">
          <span class="total-label">Total:</span>
          <span class="total-amount grand-total">$${total.toFixed(2)}</span>
        </div>
      </div>

      ${hasPerPersonCost ? `
        <div class="per-person-cost-box">
          <div class="per-person-label">Per Person Cost:</div>
          <div class="per-person-amount">$${perPersonCost.toFixed(2)}</div>
          <div class="per-person-details">Based on ${guestCount} guests</div>
        </div>
      ` : ''}

      ${renderRemovalCredits(pricing)}

      ${renderModifiersSummary(pricing)}
    </div>
  `;
}

/**
 * Render removal credits section
 */
function renderRemovalCredits(pricing) {
  // Find the removal credits modifier
  const removalModifier = pricing.modifiers.find(m => m.itemId === 'item-removal-credits');
  const capWarning = pricing.modifiers.find(m => m.itemId === 'removal-credit-cap');

  if (!removalModifier || removalModifier.amount <= 0) {
    return '';
  }

  const breakdown = removalModifier.metadata?.breakdown || [];
  const totalCredits = removalModifier.amount;

  return `
    <div class="removal-credits-box">
      <div class="removal-credits-header">
        <h4 class="removal-credits-title">Item Removal Credits</h4>
        <div class="removal-credits-total">-$${totalCredits.toFixed(2)}</div>
      </div>

      ${breakdown.length > 0 ? `
        <div class="removal-credits-breakdown">
          <ul class="removal-items-list">
            ${breakdown.map(item => `
              <li class="removal-item">
                <span class="removal-item-name">${item.name}</span>
                <span class="removal-item-details">
                  ${item.quantity > 1 ? `${item.quantity} × ` : ''}
                  $${item.creditPerUnit.toFixed(2)}
                </span>
                <span class="removal-item-credit">-$${item.totalCredit.toFixed(2)}</span>
              </li>
            `).join('')}
          </ul>
        </div>
      ` : ''}

      ${capWarning ? `
        <div class="removal-credit-warning">
          <span class="warning-icon">⚠️</span>
          <span class="warning-text">${capWarning.label}</span>
        </div>
      ` : ''}

      <div class="removal-credits-note">
        Savings applied for removed items
      </div>
    </div>
  `;
}

/**
 * Render modifiers summary
 */
function renderModifiersSummary(pricing) {
  const warnings = pricing.modifiers.filter(m => m.type === 'warning');
  const discounts = pricing.modifiers.filter(m => m.type === 'discount');

  if (warnings.length === 0 && discounts.length === 0) {
    return '';
  }

  return `
    <div class="modifiers-summary">
      ${warnings.length > 0 ? `
        <div class="warnings-list">
          <h4 class="summary-subtitle">Notes:</h4>
          <ul class="modifier-items">
            ${warnings.map(w => `
              <li class="modifier-item warning">
                <span class="modifier-icon">⚠️</span>
                <span class="modifier-text">${w.label}</span>
              </li>
            `).join('')}
          </ul>
        </div>
      ` : ''}

      ${discounts.length > 0 ? `
        <div class="discounts-list">
          <h4 class="summary-subtitle">Discounts Applied:</h4>
          <ul class="modifier-items">
            ${discounts.map(d => `
              <li class="modifier-item discount">
                <span class="modifier-icon">💰</span>
                <span class="modifier-text">${d.label}</span>
                <span class="modifier-amount">-$${d.amount.toFixed(2)}</span>
              </li>
            `).join('')}
          </ul>
        </div>
      ` : ''}
    </div>
  `;
}

/**
 * Render empty state
 */
function renderEmptyState() {
  return `
    <div class="pricing-summary-master pricing-empty">
      <div class="empty-state">
        <span class="empty-icon">📋</span>
        <h3 class="empty-title">No Configuration Selected</h3>
        <p class="empty-message">Select a package and configure your order to see pricing details</p>
      </div>
    </div>
  `;
}

/**
 * Initialize collapsible sections
 */
function initCollapsible(containerId) {
  const container = document.getElementById(containerId);

  if (!container) {
    return;
  }

  // Add click handlers to collapse toggles
  const toggles = container.querySelectorAll('.collapse-toggle');

  toggles.forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      const target = toggle.dataset.target;
      const section = container.querySelector(`[data-section="${target}"]`);

      if (section) {
        section.classList.toggle('collapsed');
        const icon = toggle.querySelector('.toggle-icon');
        if (icon) {
          icon.textContent = section.classList.contains('collapsed') ? '▶' : '▼';
        }
      }
    });
  });
}

/**
 * Initialize pricing summary with subscriptions
 *
 * @param {string} containerId - Container element ID
 * @param {Function} getStateFunc - Function to get current state (must return fresh state each call)
 * @param {Object} options - Rendering options
 * @returns {Function} Unsubscribe function
 */
export function initPricingSummary(containerId, getStateFunc, options = {}) {
  const container = document.getElementById(containerId);

  if (!container) {
    console.error(`Pricing summary container not found: ${containerId}`);
    return () => {};
  }

  // Get initial pricing and state
  const initialPricing = getCurrentPricing();
  const initialState = typeof getStateFunc === 'function' ? getStateFunc() : getStateFunc || {};

  // Render initial state
  const html = renderPricingSummary(initialPricing, initialState, { ...options, containerId });
  container.innerHTML = html;

  // Initialize collapsible sections
  if (options.collapsible !== false) {
    initCollapsible(containerId);
  }

  // Subscribe to pricing updates (SP-OS-S5)
  // Get FRESH state each time pricing updates - fixes stale state bug
  const unsubscribe = onPricingChange('pricing:updated', (pricing) => {
    console.log('🔄 Pricing summary listener fired', {
      containerId,
      containerExists: !!container,
      pricingTotals: pricing?.totals
    });

    const currentState = typeof getStateFunc === 'function' ? getStateFunc() : initialState;
    const html = renderPricingSummary(pricing, currentState, { ...options, containerId });

    console.log('📝 Generated HTML length:', html.length, 'Total:', pricing?.totals?.total);

    container.innerHTML = html;

    console.log('✅ DOM updated for', containerId);

    // Re-initialize collapsible after update
    if (options.collapsible !== false) {
      initCollapsible(containerId);
    }
  });

  return unsubscribe;
}

/**
 * Export pricing summary as print-friendly HTML
 *
 * @param {Object} pricing - Unified pricing structure
 * @param {Object} state - Current configurator state
 * @returns {string} Print-ready HTML
 */
export function exportPrintableSummary(pricing, state = {}) {
  const html = renderPricingSummary(pricing, state, {
    printMode: true,
    collapsible: false,
    showPackageHeader: true,
    showWings: true,
    showItems: true,
    showTotals: true
  });

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Philly Wings Express - Order Summary</title>
      <style>
        @media print {
          body { margin: 0; padding: 20px; }
          .pricing-summary-master { page-break-inside: avoid; }
          button { display: none; }
        }
      </style>
    </head>
    <body>
      <h1>Philly Wings Express - Catering Order</h1>
      <p>Generated: ${new Date().toLocaleString()}</p>
      ${html}
    </body>
    </html>
  `;
}

/**
 * Trigger browser print dialog
 *
 * @param {Object} pricing - Unified pricing structure
 * @param {Object} state - Current configurator state
 */
export function printSummary(pricing, state = {}) {
  const printWindow = window.open('', '_blank');

  if (!printWindow) {
    console.error('Could not open print window. Please allow popups.');
    return;
  }

  const html = exportPrintableSummary(pricing, state);
  printWindow.document.write(html);
  printWindow.document.close();

  // Wait for content to load then print
  printWindow.onload = () => {
    printWindow.print();
  };
}

/**
 * Export summary as JSON data
 *
 * @param {Object} pricing - Unified pricing structure
 * @param {Object} state - Current configurator state
 * @returns {Object} JSON-serializable summary
 */
export function exportSummaryData(pricing, state = {}) {
  return {
    timestamp: new Date().toISOString(),
    package: state.selectedPackage || {},
    pricing: {
      items: pricing.items,
      modifiers: pricing.modifiers,
      totals: pricing.totals
    },
    meta: pricing.meta
  };
}
