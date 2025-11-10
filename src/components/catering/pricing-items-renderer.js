/**
 * Items Pricing Renderer Component
 *
 * Renders pricing for all non-wing items:
 * - Sauces (included vs extra, bulk pricing)
 * - Dips (included vs extra, size upgrades)
 * - Sides (chips, cold sides, salads)
 * - Desserts (cookies, brownies, cakes)
 * - Beverages (cold/hot with size variations)
 *
 * @module pricing-items-renderer
 * @created 2025-10-31
 * @epic SP-PRICING-001
 * @story S7-AllUI
 */

import { onPricingChange } from '../../utils/pricing-aggregator.js';

/**
 * Render complete items pricing (all categories)
 *
 * @param {Object} pricing - Unified pricing structure
 * @param {Object} options - Rendering options
 * @returns {string} HTML string
 */
export function renderItemsPricing(pricing, options = {}) {
  const { showDetails = true, containerId = 'items-pricing' } = options;

  if (!pricing || !pricing.items) {
    return renderEmptyState();
  }

  const saucesHtml = renderSaucesPricing(pricing, { showDetails });
  const dipsHtml = renderDipsPricing(pricing, { showDetails });
  const sidesHtml = renderSidesPricing(pricing, { showDetails });
  const dessertsHtml = renderDessertsPricing(pricing, { showDetails });
  const beveragesHtml = renderBeveragesPricing(pricing, { showDetails });

  const hasAnyItems = [saucesHtml, dipsHtml, sidesHtml, dessertsHtml, beveragesHtml]
    .some(html => !html.includes('pricing-empty'));

  if (!hasAnyItems) {
    return renderEmptyState();
  }

  return `
    <div class="pricing-items-container" id="${containerId}">
      ${saucesHtml}
      ${dipsHtml}
      ${sidesHtml}
      ${dessertsHtml}
      ${beveragesHtml}
    </div>
  `;
}

/**
 * Render sauces pricing section
 */
export function renderSaucesPricing(pricing, options = {}) {
  const { showDetails = true } = options;

  const sauceItems = Object.values(pricing.items || {})
    .filter(item => item.type === 'sauce' && item.name && item.name !== 'undefined');

  if (sauceItems.length === 0) {
    return '<div class="pricing-section pricing-sauces pricing-empty"></div>';
  }

  const sauceModifiers = pricing.modifiers.filter(m => m.source === 'sauces');
  const upcharges = sauceModifiers.filter(m => m.type === 'upcharge');
  const warnings = sauceModifiers.filter(m => m.type === 'warning');
  const totalUpcharge = upcharges.reduce((sum, m) => sum + m.amount, 0);

  const includedSauces = sauceItems.filter(s => s.included);
  const extraSauces = sauceItems.filter(s => !s.included);

  return `
    <div class="pricing-section pricing-sauces">
      <div class="pricing-section-header">
        <h3 class="pricing-section-title">
          <span class="pricing-icon">🌶️</span>
          Sauces
        </h3>
        <div class="pricing-section-summary">
          <span class="sauce-count-badge">${sauceItems.length} sauces</span>
          ${totalUpcharge > 0 ? `
            <span class="upcharge-badge">+$${totalUpcharge.toFixed(2)}</span>
          ` : ''}
        </div>
      </div>

      ${showDetails ? `
        <div class="pricing-details">
          ${includedSauces.length > 0 ? `
            <div class="included-items">
              <h4 class="items-subtitle">Included Sauces:</h4>
              <ul class="items-list">
                ${includedSauces.map(s => `
                  <li class="item-entry">
                    <span class="item-name">${s.name}</span>
                    ${s.heatLevel > 0 ? `<span class="heat-badge">${getHeatIndicator(s.heatLevel)}</span>` : ''}
                  </li>
                `).join('')}
              </ul>
            </div>
          ` : ''}

          ${extraSauces.length > 0 ? `
            <div class="extra-items">
              <h4 class="items-subtitle">Extra Sauces:</h4>
              <ul class="items-list">
                ${extraSauces.map(s => `
                  <li class="item-entry item-extra">
                    <span class="item-name">${s.name}</span>
                    ${s.heatLevel > 0 ? `<span class="heat-badge">${getHeatIndicator(s.heatLevel)}</span>` : ''}
                  </li>
                `).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
      ` : ''}

      ${warnings.length > 0 ? `
        <div class="pricing-warnings">
          ${warnings.map(w => `
            <div class="warning-message">⚠️ ${w.label}</div>
          `).join('')}
        </div>
      ` : ''}

      <div class="pricing-section-footer">
        <span class="footer-label">Sauces:</span>
        <span class="footer-amount">
          ${totalUpcharge > 0 ? `
            <span class="upcharge-amount">+$${totalUpcharge.toFixed(2)}</span>
          ` : `
            <span class="included-badge">✓ Included</span>
          `}
        </span>
      </div>
    </div>
  `;
}

/**
 * Render dips pricing section
 */
export function renderDipsPricing(pricing, options = {}) {
  const { showDetails = true } = options;

  const dipItems = Object.values(pricing.items || {})
    .filter(item => item.type === 'dip' && item.name && item.name !== 'undefined');

  if (dipItems.length === 0) {
    return '<div class="pricing-section pricing-dips pricing-empty"></div>';
  }

  const dipModifiers = pricing.modifiers.filter(m => m.source === 'dips');
  const upcharges = dipModifiers.filter(m => m.type === 'upcharge');
  const totalUpcharge = upcharges.reduce((sum, m) => sum + m.amount, 0);

  const totalDips = dipItems.reduce((sum, item) => sum + (item.quantity || 0), 0);

  return `
    <div class="pricing-section pricing-dips">
      <div class="pricing-section-header">
        <h3 class="pricing-section-title">
          <span class="pricing-icon">🥣</span>
          Dips
        </h3>
        <div class="pricing-section-summary">
          <span class="dip-count-badge">${totalDips} dips</span>
          ${totalUpcharge > 0 ? `
            <span class="upcharge-badge">+$${totalUpcharge.toFixed(2)}</span>
          ` : ''}
        </div>
      </div>

      ${showDetails ? `
        <div class="pricing-details">
          <ul class="items-list">
            ${dipItems.map(dip => {
              const isIncluded = dip.includedQty > 0;
              const hasExtra = dip.extraQty > 0;
              const badge = isIncluded && !hasExtra
                ? '<span class="item-badge-included">✓ INCLUDED</span>'
                : hasExtra
                  ? `<span class="item-badge-extra">+$${((dip.extraQty || 0) * 0.75).toFixed(2)}</span>`
                  : '';

              return `
                <li class="item-entry">
                  <span class="item-name">${dip.name} ×${dip.quantity}</span>
                  ${badge}
                </li>
              `;
            }).join('')}
          </ul>
        </div>
      ` : ''}

      ${upcharges.length > 0 ? `
        <div class="pricing-modifiers">
          <h4 class="modifiers-subtitle">Upcharges:</h4>
          <ul class="modifiers-list">
            ${upcharges.map(m => `
              <li class="modifier-item">
                <span class="modifier-label">${m.label}</span>
                <span class="modifier-amount">+$${m.amount.toFixed(2)}</span>
              </li>
            `).join('')}
          </ul>
        </div>
      ` : ''}

      <div class="pricing-section-footer">
        <span class="footer-label">Dips:</span>
        <span class="footer-amount">
          ${totalUpcharge > 0 ? `
            <span class="upcharge-amount">+$${totalUpcharge.toFixed(2)}</span>
          ` : `
            <span class="included-badge">✓ Included</span>
          `}
        </span>
      </div>
    </div>
  `;
}

/**
 * Render sides pricing section
 */
export function renderSidesPricing(pricing, options = {}) {
  const { showDetails = true } = options;

  const sideItems = Object.values(pricing.items || {})
    .filter(item => item.type === 'side' && item.name && item.name !== 'undefined');

  if (sideItems.length === 0) {
    return '<div class="pricing-section pricing-sides pricing-empty"></div>';
  }

  const sideModifiers = pricing.modifiers.filter(m => m.source === 'sides');
  const upcharges = sideModifiers.filter(m => m.type === 'upcharge');
  const totalUpcharge = upcharges.reduce((sum, m) => sum + m.amount, 0);

  return `
    <div class="pricing-section pricing-sides">
      <div class="pricing-section-header">
        <h3 class="pricing-section-title">
          <span class="pricing-icon">🍟</span>
          Sides
        </h3>
        <div class="pricing-section-summary">
          <span class="side-count-badge">${sideItems.length} items</span>
          ${totalUpcharge > 0 ? `
            <span class="upcharge-badge">+$${totalUpcharge.toFixed(2)}</span>
          ` : ''}
        </div>
      </div>

      ${showDetails ? `
        <div class="pricing-details">
          <ul class="items-list">
            ${sideItems.map(side => {
              const isIncluded = side.includedQty > 0;
              const hasExtra = side.extraQty > 0;
              const badge = isIncluded && !hasExtra
                ? '<span class="item-badge-included">✓ INCLUDED</span>'
                : hasExtra
                  ? `<span class="item-badge-extra">+$${(side.basePrice || 0).toFixed(2)}</span>`
                  : '';

              return `
                <li class="item-entry">
                  <span class="item-name">${side.name}${side.quantity > 1 ? ` ×${side.quantity}` : ''}</span>
                  ${badge}
                </li>
              `;
            }).join('')}
          </ul>
        </div>
      ` : ''}

      <div class="pricing-section-footer">
        <span class="footer-label">Sides Total:</span>
        <span class="footer-amount upcharge-amount">+$${totalUpcharge.toFixed(2)}</span>
      </div>
    </div>
  `;
}

/**
 * Render desserts pricing section
 */
export function renderDessertsPricing(pricing, options = {}) {
  const { showDetails = true } = options;

  const dessertItems = Object.values(pricing.items || {})
    .filter(item => item.type === 'dessert' && item.name && item.name !== 'undefined');

  if (dessertItems.length === 0) {
    return '<div class="pricing-section pricing-desserts pricing-empty"></div>';
  }

  const dessertModifiers = pricing.modifiers.filter(m => m.source === 'desserts');
  const upcharges = dessertModifiers.filter(m => m.type === 'upcharge');
  const totalUpcharge = upcharges.reduce((sum, m) => sum + m.amount, 0);

  const totalDesserts = dessertItems.reduce((sum, item) => sum + (item.quantity || 0), 0);

  return `
    <div class="pricing-section pricing-desserts">
      <div class="pricing-section-header">
        <h3 class="pricing-section-title">
          <span class="pricing-icon">🍪</span>
          Desserts
        </h3>
        <div class="pricing-section-summary">
          <span class="dessert-count-badge">${totalDesserts} items</span>
          ${totalUpcharge > 0 ? `
            <span class="upcharge-badge">+$${totalUpcharge.toFixed(2)}</span>
          ` : ''}
        </div>
      </div>

      ${showDetails ? `
        <div class="pricing-details">
          <ul class="items-list">
            ${dessertItems.map(dessert => {
              const isIncluded = dessert.includedQty > 0;
              const hasExtra = dessert.extraQty > 0;
              const badge = isIncluded && !hasExtra
                ? '<span class="item-badge-included">✓ INCLUDED</span>'
                : hasExtra
                  ? `<span class="item-badge-extra">+$${(dessert.basePrice || 0).toFixed(2)}</span>`
                  : '';

              return `
                <li class="item-entry">
                  <span class="item-name">${dessert.name}${dessert.quantity > 1 ? ` ×${dessert.quantity}` : ''}</span>
                  ${badge}
                </li>
              `;
            }).join('')}
          </ul>
        </div>
      ` : ''}

      <div class="pricing-section-footer">
        <span class="footer-label">Desserts Total:</span>
        <span class="footer-amount upcharge-amount">+$${totalUpcharge.toFixed(2)}</span>
      </div>
    </div>
  `;
}

/**
 * Render beverages pricing section
 */
export function renderBeveragesPricing(pricing, options = {}) {
  const { showDetails = true } = options;

  const beverageItems = Object.values(pricing.items || {})
    .filter(item => item.type === 'beverage' && item.name && item.name !== 'undefined');

  if (beverageItems.length === 0) {
    return '<div class="pricing-section pricing-beverages pricing-empty"></div>';
  }

  const beverageModifiers = pricing.modifiers.filter(m => m.source === 'beverages');
  const upcharges = beverageModifiers.filter(m => m.type === 'upcharge');
  const totalUpcharge = upcharges.reduce((sum, m) => sum + m.amount, 0);

  const coldBeverages = beverageItems.filter(b => b.temperature === 'cold');
  const hotBeverages = beverageItems.filter(b => b.temperature === 'hot');

  return `
    <div class="pricing-section pricing-beverages">
      <div class="pricing-section-header">
        <h3 class="pricing-section-title">
          <span class="pricing-icon">🥤</span>
          Beverages
        </h3>
        <div class="pricing-section-summary">
          <span class="beverage-count-badge">${beverageItems.length} items</span>
          ${totalUpcharge > 0 ? `
            <span class="upcharge-badge">+$${totalUpcharge.toFixed(2)}</span>
          ` : ''}
        </div>
      </div>

      ${showDetails ? `
        <div class="pricing-details">
          ${coldBeverages.length > 0 ? `
            <div class="beverage-group">
              <h4 class="items-subtitle">Cold Beverages:</h4>
              <ul class="items-list">
                ${coldBeverages.map(b => `
                  <li class="item-entry">
                    <span class="item-name">${b.name} ×${b.quantity}</span>
                    <span class="item-badge-extra">+$${(b.basePrice || 0).toFixed(2)}</span>
                  </li>
                `).join('')}
              </ul>
            </div>
          ` : ''}

          ${hotBeverages.length > 0 ? `
            <div class="beverage-group">
              <h4 class="items-subtitle">Hot Beverages:</h4>
              <ul class="items-list">
                ${hotBeverages.map(b => `
                  <li class="item-entry">
                    <span class="item-name">${b.name} ×${b.quantity}</span>
                    <span class="item-badge-extra">+$${(b.basePrice || 0).toFixed(2)}</span>
                  </li>
                `).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
      ` : ''}

      <div class="pricing-section-footer">
        <span class="footer-label">Beverages Total:</span>
        <span class="footer-amount upcharge-amount">+$${totalUpcharge.toFixed(2)}</span>
      </div>
    </div>
  `;
}

/**
 * Render empty state
 */
function renderEmptyState() {
  return `
    <div class="pricing-items-container pricing-empty">
      <div class="empty-state">
        <span class="empty-icon">📦</span>
        <p class="empty-message">No additional items configured</p>
      </div>
    </div>
  `;
}

/**
 * Get heat level indicator
 */
function getHeatIndicator(level) {
  const indicators = ['🟢', '🟢', '🟡', '🟠', '🔴', '💀'];
  return indicators[level] || '🟢';
}

/**
 * Initialize items pricing display
 */
export function initItemsPricing(containerId, initialPricing = null, options = {}) {
  const container = document.getElementById(containerId);

  if (!container) {
    console.error(`Items pricing container not found: ${containerId}`);
    return () => {};
  }

  // Render initial state
  const html = renderItemsPricing(initialPricing, { ...options, containerId });
  container.innerHTML = html;

  // Subscribe to updates
  const unsubscribe = onPricingChange('pricing:updated', (pricing) => {
    const html = renderItemsPricing(pricing, { ...options, containerId });
    container.innerHTML = html;
  });

  return unsubscribe;
}
