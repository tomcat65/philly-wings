/**
 * Modifications Summary Card Component
 *
 * Displays a summary card showing all package customizations vs base package
 * Provides quick overview of modifications impact on pricing
 *
 * @module modifications-summary-card
 * @created 2025-11-07
 * @epic SP-011
 */

/**
 * Render modifications summary card
 *
 * @param {Object} packageInfo - Selected package information
 * @param {Object} currentConfig - Current customization configuration
 * @param {Object} pricing - Complete pricing structure
 * @param {Object} modifications - Modification flags from detectModifications()
 * @returns {string} HTML markup
 */
export function renderModificationsSummaryCard(packageInfo, currentConfig, pricing, modifications) {
  if (!packageInfo || !pricing) {
    return '';
  }

  const basePrice = packageInfo.basePrice || 0;
  const packageName = packageInfo.name || 'Custom Package';

  // Calculate modification costs per category
  const modificationCosts = calculateModificationCosts(modifications, pricing);

  // Calculate total modifications cost
  const totalModifications = Object.values(modificationCosts).reduce((sum, cost) => sum + cost, 0);

  // Calculate final total
  const finalTotal = basePrice + totalModifications;

  // Only show card if there are modifications
  const hasModifications = Object.values(modifications).some(mod => mod.isModified);

  if (!hasModifications) {
    return '';
  }

  return `
    <div class="modifications-summary-card">
      <div class="modifications-summary-header">
        <span class="summary-icon">📊</span>
        <span class="summary-title">PACKAGE MODIFICATIONS SUMMARY</span>
      </div>

      <div class="base-package-info">
        <span class="base-package-name">Base: ${packageName}</span>
        <span class="base-package-price">$${basePrice.toFixed(2)}</span>
      </div>

      <div class="customizations-label">Your Customizations:</div>

      <ul class="modifications-list">
        ${renderModificationsList(modifications, modificationCosts)}
      </ul>

      <div class="modifications-total">
        <span class="total-label">Total Modifications:</span>
        <span class="total-amount">+$${totalModifications.toFixed(2)}</span>
      </div>

      <div class="final-total">
        <span class="final-label">YOUR TOTAL:</span>
        <span class="final-amount">$${finalTotal.toFixed(2)}</span>
      </div>
    </div>
  `;
}

/**
 * Calculate modification costs per category from pricing data
 */
function calculateModificationCosts(modifications, pricing) {
  const costs = {
    wings: 0,
    sauces: 0,
    dips: 0,
    sides: 0,
    desserts: 0,
    beverages: 0
  };

  // Extract costs from pricing.modifiers
  if (pricing.modifiers && Array.isArray(pricing.modifiers)) {
    pricing.modifiers.forEach(modifier => {
      if (modifier.type === 'upcharge' && modifier.source) {
        const source = modifier.source.toLowerCase();
        if (costs.hasOwnProperty(source)) {
          costs[source] += modifier.amount || 0;
        }
      }
    });
  }

  return costs;
}

/**
 * Render modifications list items
 */
function renderModificationsList(modifications, costs) {
  const categories = [
    { key: 'wings', icon: '🍗', label: 'Wings' },
    { key: 'sauces', icon: '🌶️', label: 'Sauces' },
    { key: 'dips', icon: '🥣', label: 'Dips' },
    { key: 'sides', icon: '🍟', label: 'Sides' },
    { key: 'desserts', icon: '🍰', label: 'Desserts' },
    { key: 'beverages', icon: '🥤', label: 'Beverages' }
  ];

  return categories
    .filter(cat => modifications[cat.key]?.isModified)
    .map(cat => {
      const mod = modifications[cat.key];
      const cost = costs[cat.key] || 0;
      const details = mod.details || getDefaultDetails(cat.key, mod);

      return `
        <li class="modification-item">
          <span class="modification-category">
            <span class="category-icon">${cat.icon}</span>
            ${cat.label}: ${details}
          </span>
          <span class="modification-price ${cost === 0 ? 'zero' : 'positive'}">
            ${cost > 0 ? '+' : ''}$${cost.toFixed(2)}
          </span>
        </li>
      `;
    })
    .join('');
}

/**
 * Get default details text if not provided
 */
function getDefaultDetails(category, modification) {
  if (modification.changes && modification.changes.length > 0) {
    const changeCount = modification.changes.length;
    return `${changeCount} change${changeCount > 1 ? 's' : ''}`;
  }
  return 'Modified';
}
