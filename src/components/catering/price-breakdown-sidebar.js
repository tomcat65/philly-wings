/**
 * Price Breakdown Sidebar Component - SP-010 Phase 4 + SP-011
 *
 * Displays real-time pricing breakdown for customization:
 * - Base package price
 * - Wing distribution breakdown
 * - Modifications summary card
 * - Included items (no charge)
 * - Additional items (upcharges)
 * - Removed items (credits)
 * - Running total
 * - Per-person cost indicator
 *
 * @module price-breakdown-sidebar
 * @created 2025-11-06
 * @updated 2025-11-07 (SP-011 - Wing distribution + modifications)
 * @epic SP-010, SP-011
 * @story Phase 4 - Price Breakdown Sidebar UI, SP-011 - Modifications Feedback
 */

import { onPricingChange, getCurrentPricing } from '../../utils/pricing-aggregator.js';
import { onStateChange, getState } from '../../services/shared-platter-state-service.js';
import { renderModificationsSummaryCard } from './modifications-summary-card.js';
import { detectModifications } from '../../utils/kitchen-breakdown-calculator.js';

/**
 * Render price breakdown sidebar
 *
 * @param {Object} pricing - Unified pricing structure from pricing-aggregator.js
 * @returns {string} HTML string
 */
export function renderPriceBreakdownSidebar(pricing) {
  if (!pricing || !pricing.totals) {
    return renderEmptyState();
  }

  // Get current state for wing distribution and modifications
  const state = getState();
  const { selectedPackage = {}, currentConfig = {} } = state;
  const wingDistribution = currentConfig.wingDistribution || {};
  const guestCount = state.eventDetails?.guestCount || selectedPackage.servesMin || 10;

  // Detect modifications
  const modifications = detectModifications(selectedPackage, currentConfig);

  // Extract modifiers by type (only for sides category)
  const sidesModifiers = (pricing.modifiers || []).filter(m => {
    const item = pricing.items?.[m.itemId];
    return item && item.type === 'side';
  });

  const includedModifiers = sidesModifiers.filter(m => m.type === 'included');
  const upchargeModifiers = sidesModifiers.filter(m => m.type === 'upcharge');
  const removalModifiers = sidesModifiers.filter(m => m.type === 'removal-credit');

  // Calculate running total (subtotal, pre-tax)
  const basePrice = pricing.totals.basePrice || 0;
  const modificationsTotal = upchargeModifiers.reduce((sum, m) => sum + m.amount, 0) +
                             removalModifiers.reduce((sum, m) => sum + m.amount, 0);
  const runningTotal = basePrice + modificationsTotal;

  // Calculate per-person cost
  const perPersonCost = guestCount > 0 ? (pricing.totals.total || 0) / guestCount : 0;

  return `
    <div class="price-breakdown-sidebar" role="region" aria-label="Price Breakdown">
      <h3 class="breakdown-title">Price Breakdown</h3>

      <!-- Base Price Section -->
      <div class="price-breakdown-section section-base">
        <div class="breakdown-item">
          <span class="breakdown-label">Base Package</span>
          <span class="breakdown-value">$${basePrice.toFixed(2)}</span>
        </div>
      </div>

      <!-- Wing Distribution Section -->
      ${renderWingDistribution(wingDistribution)}

      <!-- Modifications Summary Card -->
      ${renderModificationsSummaryCard(selectedPackage, currentConfig, pricing, modifications)}

      <!-- Included Items Section -->
      ${includedModifiers.length > 0 ? `
        <div class="price-breakdown-section section-included" aria-label="Included Items Section">
          <h4 class="section-header">
            <span class="section-icon" aria-hidden="true">📦</span>
            Included Items
          </h4>
          <div class="breakdown-items">
            ${includedModifiers.map(mod => `
              <div class="breakdown-item included-item">
                <span class="breakdown-label">${escapeHtml(mod.label || 'Included item')}</span>
                <span class="breakdown-value">$0.00</span>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Additional Items Section -->
      ${upchargeModifiers.length > 0 ? `
        <div class="price-breakdown-section section-additional" aria-label="Additional Items Section">
          <h4 class="section-header">
            <span class="section-icon" aria-hidden="true">➕</span>
            Additional Items
          </h4>
          <div class="breakdown-items">
            ${upchargeModifiers.map(mod => `
              <div class="breakdown-item additional-item">
                <span class="breakdown-label">${escapeHtml(mod.label || 'Additional item')}</span>
                <span class="breakdown-value positive">+$${Math.abs(mod.amount).toFixed(2)}</span>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Removed Items Section -->
      ${removalModifiers.length > 0 ? `
        <div class="price-breakdown-section section-removed" aria-label="Removed Items Section">
          <h4 class="section-header">
            <span class="section-icon" aria-hidden="true">➖</span>
            Removed Items (Credit)
          </h4>
          <div class="breakdown-items">
            ${removalModifiers.map(mod => `
              <div class="breakdown-item removed-item">
                <span class="breakdown-label">${escapeHtml(mod.label || 'Removed item')}</span>
                <span class="breakdown-value negative">-$${Math.abs(mod.amount).toFixed(2)}</span>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Running Total Section -->
      <div class="price-breakdown-section section-total" aria-label="Total Section">
        <div class="breakdown-item total-item">
          <span class="breakdown-label">Subtotal</span>
          <span class="breakdown-value total-value">$${runningTotal.toFixed(2)}</span>
        </div>
        <div class="breakdown-item tax-item">
          <span class="breakdown-label">Tax (8%)</span>
          <span class="breakdown-value">$${(pricing.totals.tax || 0).toFixed(2)}</span>
        </div>
        <div class="breakdown-item grand-total-item">
          <span class="breakdown-label">Total</span>
          <span class="breakdown-value grand-total">$${(pricing.totals.total || 0).toFixed(2)}</span>
        </div>
      </div>

      <!-- Per-Person Cost Indicator -->
      <div class="price-breakdown-section section-per-person">
        <div class="per-person-indicator">
          <span class="per-person-icon" aria-hidden="true">👥</span>
          <div class="per-person-content">
            <span class="per-person-label">Cost Per Person</span>
            <span class="per-person-value">$${perPersonCost.toFixed(2)}</span>
          </div>
          <div class="per-person-note">Based on ${guestCount} guest${guestCount !== 1 ? 's' : ''}</div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render wing distribution breakdown
 *
 * @param {Object} wingDistribution - Wing distribution from currentConfig
 * @returns {string} HTML string
 */
function renderWingDistribution(wingDistribution) {
  const { boneless = 0, boneIn = 0, cauliflower = 0, boneInStyle = 'mixed' } = wingDistribution;
  const totalWings = boneless + boneIn + cauliflower;

  if (totalWings === 0) {
    return '';
  }

  const traditionalWings = boneless + boneIn;
  const hasTraditional = traditionalWings > 0;
  const hasPlantBased = cauliflower > 0;

  return `
    <div class="price-breakdown-section section-wings" aria-label="Wing Distribution">
      <h4 class="section-header">
        <span class="section-icon" aria-hidden="true">🍗</span>
        Your Wings
      </h4>
      <div class="breakdown-items">
        ${hasTraditional ? `
          <div class="breakdown-item wing-item">
            <span class="breakdown-label">
              ${traditionalWings} Traditional Wings
              <span class="wing-details">${boneless} Boneless${boneIn > 0 ? `, ${boneIn} Bone-In ${boneInStyle === 'mixed' ? 'Mixed' : boneInStyle === 'drums' ? 'Drums' : 'Flats'}` : ''}</span>
            </span>
            <span class="breakdown-value">Included</span>
          </div>
        ` : ''}
        ${hasPlantBased ? `
          <div class="breakdown-item wing-item">
            <span class="breakdown-label">
              ${cauliflower} Plant-Based Wings
              <span class="wing-details">Cauliflower</span>
            </span>
            <span class="breakdown-value">Included</span>
          </div>
        ` : ''}
        <div class="breakdown-item wing-total">
          <span class="breakdown-label">Total Wings:</span>
          <span class="breakdown-value">${totalWings}</span>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render empty state when no pricing data available
 *
 * @returns {string} HTML string
 */
function renderEmptyState() {
  return `
    <div class="price-breakdown-sidebar empty" role="region" aria-label="Price Breakdown">
      <p class="empty-message">No pricing information available</p>
    </div>
  `;
}

/**
 * Initialize price breakdown sidebar with subscriptions
 *
 * Sets up real-time updates for pricing changes and config changes.
 * Returns unsubscribe function for cleanup.
 *
 * @returns {Function} Unsubscribe function
 */
export function initPriceBreakdownSidebar() {
  const container = document.getElementById('pricing-summary-container');
  if (!container) {
    console.error('Price breakdown sidebar container not found: #pricing-summary-container');
    return () => {}; // Return no-op unsubscribe
  }

  // Get initial pricing
  const initialPricing = getCurrentPricing();
  container.innerHTML = renderPriceBreakdownSidebar(initialPricing);

  // Subscribe to pricing updates (primary - most efficient)
  const pricingUnsubscribe = onPricingChange('pricing:updated', (pricing) => {
    const freshContainer = document.getElementById('pricing-summary-container');
    if (freshContainer) {
      freshContainer.innerHTML = renderPriceBreakdownSidebar(pricing);
    }
  });

  // Subscribe to config changes (secondary - for non-price updates)
  // Use cached pricing to avoid duplicate calculations
  const configUnsubscribe = onStateChange('currentConfig.*', () => {
    const currentPricing = getCurrentPricing(); // Use cached pricing
    const freshContainer = document.getElementById('pricing-summary-container');
    if (freshContainer) {
      freshContainer.innerHTML = renderPriceBreakdownSidebar(currentPricing);
    }
  });

  // Return unsubscribe function for cleanup
  return () => {
    pricingUnsubscribe();
    configUnsubscribe();
  };
}

/**
 * Escape HTML to prevent XSS
 *
 * @param {string} text - Text to escape
 * @returns {string} Escaped HTML
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

