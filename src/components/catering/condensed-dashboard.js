/**
 * Condensed Dashboard Component
 * Live order summary with detailed pricing for budget-conscious customers
 * Shows boxes + extras with real-time updates and highlight animations
 */

/**
 * Render condensed dashboard with full order details
 * @param {Object} boxedMealState - Current state from boxed-meals-flow-v2.js
 * @param {boolean} isCollapsed - Whether sidebar is collapsed
 */
export function renderCondensedDashboard(boxedMealState = {}, isCollapsed = false) {
  const {
    currentConfig = {},
    boxCount = 10,
    individualOverrides = {},
    extras = {},
    contact = {}
  } = boxedMealState;

  // Calculate totals
  const boxesTotal = calculateBoxesTotal(currentConfig, boxCount, individualOverrides);
  const extrasTotal = calculateExtrasTotal(extras);
  const subtotal = boxesTotal + extrasTotal;
  const taxRate = 0.08; // 8% tax
  const tax = subtotal * taxRate;
  const grandTotal = subtotal + tax;
  const perBoxCost = boxesTotal / boxCount;
  const perPersonCost = grandTotal / boxCount; // Total cost per person (including extras and tax)

  if (isCollapsed) {
    return renderCollapsedDashboard(boxCount, grandTotal, perBoxCost);
  }

  return `
    <aside class="condensed-dashboard" aria-live="polite" data-collapsed="false">
      <!-- Collapse/Expand Toggle -->
      <button class="dashboard-collapse-btn" id="dashboard-collapse-btn" aria-label="Collapse dashboard">
        <span class="collapse-icon">‹</span>
      </button>

      <!-- Dashboard Header -->
      <div class="dashboard-header">
        <h3 class="dashboard-title">Order Summary</h3>
        <p class="dashboard-subtitle">Live Preview</p>
      </div>

      <!-- Boxes Section (Collapsible) -->
      <div class="dashboard-section" data-section="boxes">
        <button class="section-toggle" data-section-id="boxes">
          <span class="toggle-icon">▼</span>
          <span class="section-title">Boxed Meals</span>
          <span class="section-total" data-highlight-target="boxes-total">$${boxesTotal.toFixed(2)}</span>
        </button>

        <div class="section-content" data-section-content="boxes">
          ${renderBoxesBreakdown(currentConfig, boxCount, individualOverrides, perBoxCost)}
        </div>
      </div>

      <!-- Extras Section (Collapsible) -->
      <div class="dashboard-section" data-section="extras">
        <button class="section-toggle" data-section-id="extras">
          <span class="toggle-icon">▼</span>
          <span class="section-title">Extras & Add-Ons</span>
          <span class="section-total" data-highlight-target="extras-total">$${extrasTotal.toFixed(2)}</span>
        </button>

        <div class="section-content" data-section-content="extras">
          ${renderExtrasBreakdown(extras)}
        </div>
      </div>

      <!-- Total Section (Always Visible) -->
      <div class="dashboard-totals">
        <div class="total-row">
          <span class="total-label">Boxes Subtotal:</span>
          <span class="total-value" data-highlight-target="boxes-subtotal">$${boxesTotal.toFixed(2)}</span>
        </div>

        <div class="total-row">
          <span class="total-label">Extras Subtotal:</span>
          <span class="total-value" data-highlight-target="extras-subtotal">$${extrasTotal.toFixed(2)}</span>
        </div>

        <div class="total-row total-row-divider">
          <span class="total-label">Tax (8%):</span>
          <span class="total-value" data-highlight-target="tax">$${tax.toFixed(2)}</span>
        </div>

        <div class="total-row total-row-grand">
          <span class="total-label-grand">Grand Total:</span>
          <span class="total-value-grand" data-highlight-target="grand-total">$${grandTotal.toFixed(2)}</span>
        </div>

        <div class="total-row total-row-per-person">
          <span class="total-label-per-person">Per Person (Box) Cost:</span>
          <span class="total-value-per-person" data-highlight-target="per-person-cost">$${perPersonCost.toFixed(2)}</span>
        </div>
      </div>

      <!-- Budget Indicator -->
      <div class="budget-indicator">
        <div class="budget-per-box">
          <span class="budget-label">Per Box Cost:</span>
          <span class="budget-value" data-highlight-target="per-box">$${perBoxCost.toFixed(2)}</span>
        </div>
        <p class="budget-note">
          💡 Adjust to stay within budget
        </p>
      </div>
    </aside>
  `;
}

/**
 * Render collapsed dashboard (minimal view)
 */
function renderCollapsedDashboard(boxCount, grandTotal, perBoxCost) {
  return `
    <aside class="condensed-dashboard condensed-dashboard-collapsed" data-collapsed="true">
      <button class="dashboard-expand-btn" id="dashboard-expand-btn" aria-label="Expand dashboard">
        <span class="expand-icon">›</span>
        <div class="collapsed-summary">
          <div class="collapsed-row">
            <span class="collapsed-label">${boxCount} boxes</span>
            <span class="collapsed-value">$${perBoxCost.toFixed(2)}/box</span>
          </div>
          <div class="collapsed-row collapsed-row-total">
            <span class="collapsed-total">$${grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </button>
    </aside>
  `;
}

/**
 * Render boxes breakdown (detailed itemization)
 */
function renderBoxesBreakdown(config, boxCount, individualOverrides, perBoxCost) {
  const hasIndividualOverrides = Object.keys(individualOverrides).length > 0;

  if (hasIndividualOverrides) {
    // Group boxes by configuration and price
    return renderItemizedBoxes(config, boxCount, individualOverrides);
  }

  // All boxes same configuration
  const template = config.templateName || 'Custom Configuration';
  const wingDesc = config.wingCount && config.wingType
    ? `${config.wingCount} ${formatWingType(config.wingType)} Wings`
    : 'Not configured';

  return `
    <div class="boxes-breakdown">
      <div class="breakdown-row breakdown-row-main">
        <span class="breakdown-desc">
          <strong>${boxCount} × ${template}</strong>
        </span>
        <span class="breakdown-amount">$${(perBoxCost * boxCount).toFixed(2)}</span>
      </div>

      <div class="breakdown-details">
        <div class="detail-item">
          <span class="detail-icon">🍗</span>
          <span class="detail-text">${wingDesc}</span>
        </div>
        ${config.sauce ? `
          <div class="detail-item">
            <span class="detail-icon">🌶️</span>
            <span class="detail-text">${formatSauceName(config.sauce)}</span>
          </div>
        ` : ''}
        ${config.side ? `
          <div class="detail-item">
            <span class="detail-icon">🥗</span>
            <span class="detail-text">${formatSideName(config.side)}</span>
          </div>
        ` : ''}
        ${config.dessert ? `
          <div class="detail-item">
            <span class="detail-icon">🍰</span>
            <span class="detail-text">${formatDessertName(config.dessert)}</span>
          </div>
        ` : ''}
      </div>

      <div class="breakdown-row breakdown-row-perbox">
        <span class="breakdown-desc">Per Box:</span>
        <span class="breakdown-amount">$${perBoxCost.toFixed(2)}</span>
      </div>
    </div>
  `;
}

/**
 * Render itemized boxes (when individual customizations exist)
 */
function renderItemizedBoxes(bulkConfig, totalBoxCount, individualOverrides) {
  const priceGroups = {};

  // Calculate price for each box and group
  for (let boxNum = 1; boxNum <= totalBoxCount; boxNum++) {
    const boxConfig = individualOverrides[boxNum] || bulkConfig;
    const boxPrice = calculatePricePerBox(boxConfig);

    const priceKey = boxPrice.toFixed(2);
    if (!priceGroups[priceKey]) {
      priceGroups[priceKey] = {
        price: boxPrice,
        count: 0,
        config: boxConfig,
        boxes: []
      };
    }
    priceGroups[priceKey].count++;
    priceGroups[priceKey].boxes.push(boxNum);
  }

  const sortedGroups = Object.values(priceGroups).sort((a, b) => b.price - a.price);

  return `
    <div class="boxes-breakdown boxes-breakdown-itemized">
      ${sortedGroups.map(group => `
        <div class="breakdown-row">
          <span class="breakdown-desc">
            ${group.count} box${group.count > 1 ? 'es' : ''} @ $${group.price.toFixed(2)}
            ${group.boxes.length <= 3 ? `<span class="box-nums">#${group.boxes.join(', #')}</span>` : ''}
          </span>
          <span class="breakdown-amount">$${(group.price * group.count).toFixed(2)}</span>
        </div>
      `).join('')}

      <p class="breakdown-note">
        💡 ${Object.keys(individualOverrides).length} boxes have custom configurations
      </p>
    </div>
  `;
}

/**
 * Render extras breakdown (detailed itemization)
 */
function renderExtrasBreakdown(extras) {
  if (!extras || Object.keys(extras).length === 0) {
    return `
      <div class="extras-breakdown extras-empty">
        <p class="empty-message">No extras added yet</p>
      </div>
    `;
  }

  // Extras are organized by category with arrays
  const categories = {
    hotBeverages: { title: 'Hot Beverages', icon: '☕' },
    beverages: { title: 'Cold Beverages', icon: '🧃' },
    salads: { title: 'Salads', icon: '🥗' },
    sides: { title: 'Premium Sides', icon: '🥔' },
    desserts: { title: 'Desserts', icon: '🍰' },
    saucesToGo: { title: 'Sauces To-Go', icon: '🌶️' },
    dipsToGo: { title: 'Dips To-Go', icon: '🥫' },
    quickAdds: { title: 'Essentials', icon: '🥤' }
  };

  return `
    <div class="extras-breakdown">
      ${Object.entries(categories).map(([catKey, catData]) => {
        const items = extras[catKey] || [];
        if (items.length === 0) return '';

        return `
          <div class="extras-category">
            <div class="category-header">
              <span class="category-icon">${catData.icon}</span>
              <span class="category-title">${catData.title}</span>
            </div>
            ${items.map(item => `
              <div class="breakdown-row">
                <span class="breakdown-desc">
                  ${item.name || item.id}
                  ${item.packSize ? `<span class="pack-size">(${item.packSize})</span>` : ''}
                  × ${item.quantity || 1}
                </span>
                <span class="breakdown-amount">$${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</span>
              </div>
            `).join('')}
          </div>
        `;
      }).join('')}
    </div>
  `;
}

/**
 * Calculate total cost of all boxes
 */
function calculateBoxesTotal(config, boxCount, individualOverrides) {
  let total = 0;

  for (let boxNum = 1; boxNum <= boxCount; boxNum++) {
    const boxConfig = individualOverrides[boxNum] || config;
    total += calculatePricePerBox(boxConfig);
  }

  return total;
}

/**
 * Calculate total cost of extras
 */
function calculateExtrasTotal(extras) {
  if (!extras) return 0;

  // Extras are organized by category with arrays
  return Object.values(extras).reduce((sum, categoryItems) => {
    if (!Array.isArray(categoryItems)) return sum;

    return sum + categoryItems.reduce((catSum, item) => {
      return catSum + ((item.price || 0) * (item.quantity || 1));
    }, 0);
  }, 0);
}

/**
 * Calculate price per box (imported from live-preview-panel.js logic)
 */
function calculatePricePerBox(config) {
  let price = 12.50;

  const wingCount = config.wingCount || 6;
  if (wingCount === 10) price += 3.00;
  else if (wingCount === 12) price += 4.50;

  if (config.wingType === 'bone-in') price += 1.50;
  if (config.wingType === 'plant-based') price += 2.00;

  if (config.wingStyle === 'all-drums' || config.wingStyle === 'all-flats') {
    price += 1.50;
  }

  const premiumSauces = ['mango-habanero', 'hot-honey', 'ghost-pepper'];

  if (config.splitSauces && config.sauces?.length === 2) {
    if (premiumSauces.includes(config.sauces[0]?.id)) price += 0.25;
    if (premiumSauces.includes(config.sauces[1]?.id)) price += 0.25;
  } else if (premiumSauces.includes(config.sauce)) {
    price += 0.50;
  }

  const premiumDesserts = ['creme-brulee-cheesecake', 'red-velvet-cake'];
  if (premiumDesserts.includes(config.dessert)) price += 1.00;

  return price;
}

/**
 * Initialize dashboard interactions
 */
export function initCondensedDashboard() {
  // Collapse/expand sidebar
  const collapseBtn = document.getElementById('dashboard-collapse-btn');
  const expandBtn = document.getElementById('dashboard-expand-btn');

  collapseBtn?.addEventListener('click', () => {
    toggleDashboard(true);
  });

  expandBtn?.addEventListener('click', () => {
    toggleDashboard(false);
  });

  // Section toggle handlers
  document.querySelectorAll('.section-toggle').forEach(toggle => {
    toggle.addEventListener('click', () => {
      const sectionId = toggle.dataset.sectionId;
      const content = document.querySelector(`[data-section-content="${sectionId}"]`);
      const icon = toggle.querySelector('.toggle-icon');

      if (content) {
        const isCollapsed = content.style.display === 'none';
        content.style.display = isCollapsed ? 'block' : 'none';
        icon.textContent = isCollapsed ? '▼' : '▶';
      }
    });
  });
}

/**
 * Toggle dashboard collapsed/expanded state
 */
function toggleDashboard(collapse) {
  const dashboard = document.querySelector('.condensed-dashboard');
  if (!dashboard) return;

  dashboard.dataset.collapsed = collapse;

  if (collapse) {
    dashboard.classList.add('condensed-dashboard-collapsed');
  } else {
    dashboard.classList.remove('condensed-dashboard-collapsed');
  }
}

/**
 * Update dashboard with new state (with highlight animation)
 */
export function updateCondensedDashboard(boxedMealState) {
  const dashboard = document.querySelector('.condensed-dashboard');
  if (!dashboard) return;

  const isCollapsed = dashboard.dataset.collapsed === 'true';

  // Get all elements with highlight targets
  const highlightTargets = document.querySelectorAll('[data-highlight-target]');

  // Store old values for comparison
  const oldValues = new Map();
  highlightTargets.forEach(el => {
    oldValues.set(el.dataset.highlightTarget, el.textContent);
  });

  // Re-render dashboard content
  const newContent = renderCondensedDashboard(boxedMealState, isCollapsed);
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = newContent;

  // Replace content
  dashboard.innerHTML = tempDiv.firstElementChild.innerHTML;

  // Re-initialize interactions
  initCondensedDashboard();

  // Highlight changed values
  const newHighlightTargets = document.querySelectorAll('[data-highlight-target]');
  newHighlightTargets.forEach(el => {
    const targetId = el.dataset.highlightTarget;
    const oldValue = oldValues.get(targetId);
    const newValue = el.textContent;

    if (oldValue && oldValue !== newValue) {
      // Trigger highlight animation
      el.classList.add('value-updated');
      setTimeout(() => el.classList.remove('value-updated'), 600);
    }
  });
}

// ========================================
// Helper Functions
// ========================================

function formatWingType(type) {
  const types = {
    'boneless': 'Boneless',
    'bone-in': 'Bone-In',
    'plant-based': 'Plant-Based'
  };
  return types[type] || type;
}

function formatSauceName(sauce) {
  return sauce.split('-').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

function formatSideName(side) {
  const sides = {
    'chips': "Miss Vickie's Chips",
    'coleslaw': 'Coleslaw',
    'potato-salad': 'Potato Salad'
  };
  return sides[side] || side;
}

function formatDessertName(dessert) {
  return dessert.split('-').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}
