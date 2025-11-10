/**
 * Wings Pricing Renderer Component
 *
 * Renders detailed wing pricing breakdown including:
 * - Wing type distribution (boneless, bone-in, cauliflower)
 * - Bone-in style (mixed, flats, drums)
 * - Premium upcharges (cauliflower, flats/drums only)
 * - Total wing count and pricing
 *
 * Subscribes to pricing updates and re-renders on changes
 *
 * @module pricing-wings-renderer
 * @created 2025-10-31
 * @epic SP-PRICING-001
 * @story S6-WingsUI
 */

import { onPricingChange } from '../../utils/pricing-aggregator.js';

/**
 * Render wings pricing section
 *
 * @param {Object} pricing - Unified pricing structure from aggregator
 * @param {Object} options - Rendering options
 * @param {boolean} options.showDetails - Show detailed breakdown (default: true)
 * @param {boolean} options.showUpcharges - Show upcharge details (default: true)
 * @param {string} options.containerId - Container DOM element ID
 * @returns {string} HTML string
 */
export function renderWingsPricing(pricing, options = {}) {
  const {
    showDetails = true,
    showUpcharges = true,
    containerId = 'wings-pricing'
  } = options;

  if (!pricing || !pricing.items) {
    return renderEmptyState();
  }

  // Extract wing items
  const wingItems = Object.values(pricing.items).filter(item => item.type === 'wing');

  if (wingItems.length === 0) {
    return renderEmptyState();
  }

  // Extract wing-related modifiers
  const wingModifiers = pricing.modifiers.filter(m => m.source === 'wings');

  // Calculate wing totals
  const totalWings = wingItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const wingUpcharges = wingModifiers
    .filter(m => m.type === 'upcharge')
    .reduce((sum, m) => sum + m.amount, 0);

  return `
    <div class="pricing-section pricing-wings" id="${containerId}">
      <div class="pricing-section-header">
        <h3 class="pricing-section-title">
          <span class="pricing-icon">🍗</span>
          Wings Pricing
        </h3>
        <div class="pricing-section-summary">
          <span class="wing-count-badge">${totalWings} wings</span>
          ${wingUpcharges > 0 ? `
            <span class="upcharge-badge">+$${wingUpcharges.toFixed(2)}</span>
          ` : ''}
        </div>
      </div>

      ${showDetails ? `
        <div class="pricing-details">
          ${renderWingItems(wingItems)}
        </div>
      ` : ''}

      ${showUpcharges && wingModifiers.length > 0 ? `
        <div class="pricing-modifiers">
          ${renderWingModifiers(wingModifiers)}
        </div>
      ` : ''}

      <div class="pricing-section-footer">
        <span class="footer-label">Wings Subtotal:</span>
        <span class="footer-amount">
          ${wingUpcharges > 0 ? `
            <span class="base-amount">Base included</span>
            <span class="upcharge-amount">+$${wingUpcharges.toFixed(2)}</span>
          ` : `
            <span class="included-badge">✓ Included</span>
          `}
        </span>
      </div>
    </div>
  `;
}

/**
 * Render individual wing items
 *
 * @param {Array<Object>} wingItems - Wing items from pricing structure
 * @returns {string} HTML string
 */
function renderWingItems(wingItems) {
  return `
    <ul class="wing-items-list">
      ${wingItems.map(item => renderWingItem(item)).join('')}
    </ul>
  `;
}

/**
 * Render single wing item
 *
 * @param {Object} item - Wing item
 * @returns {string} HTML string
 */
function renderWingItem(item) {
  const wingTypeLabel = getWingTypeLabel(item.wingType);
  const wingTypeIcon = getWingTypeIcon(item.wingType);
  const styleLabel = item.style && item.style !== 'mixed' ? ` (${formatStyle(item.style)})` : '';

  return `
    <li class="wing-item" data-wing-type="${item.wingType}">
      <div class="wing-item-header">
        <span class="wing-type-icon">${wingTypeIcon}</span>
        <span class="wing-type-label">${wingTypeLabel}${styleLabel}</span>
      </div>
      <div class="wing-item-details">
        <span class="wing-quantity">${item.quantity} wings</span>
        ${item.plantBased ? `
          <span class="plant-based-badge" title="Plant-based option">🌱</span>
        ` : ''}
        ${item.dietary ? `
          <span class="dietary-badge" title="${item.dietary.join(', ')}">${item.dietary.join(', ')}</span>
        ` : ''}
      </div>
    </li>
  `;
}

/**
 * Render wing modifiers (upcharges, warnings)
 *
 * @param {Array<Object>} modifiers - Wing modifiers
 * @returns {string} HTML string
 */
function renderWingModifiers(modifiers) {
  const upcharges = modifiers.filter(m => m.type === 'upcharge');
  const warnings = modifiers.filter(m => m.type === 'warning');

  return `
    <div class="modifiers-container">
      ${upcharges.length > 0 ? `
        <div class="upcharges-section">
          <h4 class="modifiers-subtitle">Premium Options:</h4>
          <ul class="modifiers-list">
            ${upcharges.map(mod => `
              <li class="modifier-item modifier-upcharge">
                <span class="modifier-label">${mod.label}</span>
                <span class="modifier-amount">+$${mod.amount.toFixed(2)}</span>
              </li>
            `).join('')}
          </ul>
        </div>
      ` : ''}

      ${warnings.length > 0 ? `
        <div class="warnings-section">
          <ul class="modifiers-list">
            ${warnings.map(mod => `
              <li class="modifier-item modifier-warning">
                <span class="warning-icon">⚠️</span>
                <span class="modifier-label">${mod.label}</span>
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
 *
 * @returns {string} HTML string
 */
function renderEmptyState() {
  return `
    <div class="pricing-section pricing-wings pricing-empty">
      <div class="empty-state">
        <span class="empty-icon">🍗</span>
        <p class="empty-message">No wings configured yet</p>
        <p class="empty-hint">Configure your wing distribution to see pricing</p>
      </div>
    </div>
  `;
}

/**
 * Get wing type label
 *
 * @param {string} wingType - Wing type (boneless, bone-in, cauliflower)
 * @returns {string} Human-readable label
 */
function getWingTypeLabel(wingType) {
  const labels = {
    'boneless': 'Boneless Wings',
    'bone-in': 'Bone-In Wings',
    'cauliflower': 'Cauliflower Wings'
  };
  return labels[wingType] || wingType;
}

/**
 * Get wing type icon
 *
 * @param {string} wingType - Wing type
 * @returns {string} Emoji icon
 */
function getWingTypeIcon(wingType) {
  const icons = {
    'boneless': '🍗',
    'bone-in': '🦴',
    'cauliflower': '🥦'
  };
  return icons[wingType] || '🍗';
}

/**
 * Format bone-in style
 *
 * @param {string} style - Style (flats, drums, mixed)
 * @returns {string} Formatted style
 */
function formatStyle(style) {
  const styles = {
    'flats': 'Flats Only',
    'drums': 'Drums Only',
    'mixed': 'Mixed'
  };
  return styles[style] || style;
}

/**
 * Create wings pricing subscription
 *
 * Subscribes to pricing updates and automatically updates the DOM
 *
 * @param {string} containerId - Container element ID
 * @param {Object} options - Rendering options
 * @returns {Function} Unsubscribe function
 */
export function subscribeWingsPricing(containerId, options = {}) {
  const container = document.getElementById(containerId);

  if (!container) {
    console.warn(`Wings pricing container not found: ${containerId}`);
    return () => {};
  }

  // Subscribe to pricing updates
  const unsubscribe = onPricingChange('pricing:updated', (pricing) => {
    const html = renderWingsPricing(pricing, { ...options, containerId });
    container.innerHTML = html;
  });

  return unsubscribe;
}

/**
 * Initialize wings pricing display
 *
 * @param {string} containerId - Container element ID
 * @param {Object} initialPricing - Initial pricing data
 * @param {Object} options - Rendering options
 * @returns {Function} Unsubscribe function
 */
export function initWingsPricing(containerId, initialPricing = null, options = {}) {
  const container = document.getElementById(containerId);

  if (!container) {
    console.error(`Wings pricing container not found: ${containerId}`);
    return () => {};
  }

  // Render initial state
  const html = renderWingsPricing(initialPricing, { ...options, containerId });
  container.innerHTML = html;

  // Subscribe to updates
  return subscribeWingsPricing(containerId, options);
}
