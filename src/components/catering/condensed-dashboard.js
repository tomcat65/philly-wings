import { TAX_RATE, calculateExtrasSubtotal, EXTRA_CATEGORY_KEYS } from '../../utils/catering-pricing.js';

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
    contact = {},
    menuData = {},
    templateIncludedDessert = null  // 🔑 PRICING FIX: Track template's included dessert
  } = boxedMealState;

  // Calculate totals
  const boxesTotal = calculateBoxesTotal(currentConfig, boxCount, individualOverrides, menuData, templateIncludedDessert);
  const extrasTotal = calculateExtrasSubtotal(extras);
  const subtotal = boxesTotal + extrasTotal;
  const tax = subtotal * TAX_RATE;
  const grandTotal = subtotal + tax;
  const safeBoxCount = boxCount > 0 ? boxCount : 1;
  const perBoxCost = boxesTotal / safeBoxCount;
  const perPersonCost = grandTotal / safeBoxCount; // Total cost per person (including extras and tax)
  const taxLabel = `Tax (${Math.round(TAX_RATE * 100)}%)`;

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
          ${renderBoxesBreakdown(currentConfig, boxCount, individualOverrides, perBoxCost, menuData, templateIncludedDessert)}
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
          <span class="total-label">${taxLabel}:</span>
          <span class="total-value" data-highlight-target="tax">$${tax.toFixed(2)}</span>
        </div>

        <div class="total-row total-row-grand">
          <span class="total-label-grand">Grand Total:</span>
          <span class="total-value-grand" data-highlight-target="grand-total">$${grandTotal.toFixed(2)}</span>
        </div>
      </div>

      <!-- Per Person Cost Section -->
      <div class="per-person-section">
        <div class="per-person-cost-row">
          <span class="per-person-label">Per Person (Box) Cost:</span>
          <span class="per-person-value" data-highlight-target="per-person-cost">$${perPersonCost.toFixed(2)}</span>
        </div>
        <p class="per-person-note">
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
function renderBoxesBreakdown(config, boxCount, individualOverrides, perBoxCost, menuData = {}, templateIncludedDessert = null) {
  const hasIndividualOverrides = Object.keys(individualOverrides).length > 0;

  if (hasIndividualOverrides) {
    // Group boxes by configuration and price
    return renderItemizedBoxes(config, boxCount, individualOverrides, menuData, templateIncludedDessert);
  }

  // All boxes same configuration
  const template = config.templateName || 'Custom Configuration';

  // Build wing description with prep method for plant-based
  let wingDesc = 'Not configured';
  if (config.wingCount && config.wingType) {
    wingDesc = `${config.wingCount} ${formatWingType(config.wingType)} Wings`;

    // Add preparation method for plant-based wings
    if (config.wingType === 'plant-based' && config.plantBasedPrep) {
      const prepMethod = config.plantBasedPrep === 'fried' ? 'Fried' : 'Baked';
      wingDesc += ` (${prepMethod})`;
    }

    // Add wing style for bone-in wings
    if (config.wingType === 'bone-in' && config.wingStyle) {
      const styleMap = {
        'mixed': 'Mixed',
        'all-drums': 'All Drums',
        'all-flats': 'All Flats'
      };
      wingDesc += ` (${styleMap[config.wingStyle] || config.wingStyle})`;
    }
  }

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
        <div class="detail-item">
          <span class="detail-icon">💧</span>
          <span class="detail-text">Bottled Water</span>
        </div>
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
function renderItemizedBoxes(bulkConfig, totalBoxCount, individualOverrides, menuData = {}, templateIncludedDessert = null) {
  const priceGroups = {};

  // Calculate price for each box and group
  for (let boxNum = 1; boxNum <= totalBoxCount; boxNum++) {
    const boxConfig = individualOverrides[boxNum] || bulkConfig;
    const boxPrice = calculatePricePerBox(boxConfig, menuData, templateIncludedDessert);

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
      ${sortedGroups.map(group => {
        // Build wing description for this group
        let wingDesc = 'Not configured';
        if (group.config.wingCount && group.config.wingType) {
          wingDesc = `${group.config.wingCount} ${formatWingType(group.config.wingType)} Wings`;

          // Add preparation method for plant-based wings
          if (group.config.wingType === 'plant-based' && group.config.plantBasedPrep) {
            const prepMethod = group.config.plantBasedPrep === 'fried' ? 'Fried' : 'Baked';
            wingDesc += ` (${prepMethod})`;
          }

          // Add wing style for bone-in wings
          if (group.config.wingType === 'bone-in' && group.config.wingStyle) {
            const styleMap = {
              'mixed': 'Mixed',
              'all-drums': 'All Drums',
              'all-flats': 'All Flats'
            };
            wingDesc += ` (${styleMap[group.config.wingStyle] || group.config.wingStyle})`;
          }
        }

        return `
          <div class="breakdown-group">
            <div class="breakdown-row">
              <span class="breakdown-desc">
                ${group.count} box${group.count > 1 ? 'es' : ''} @ $${group.price.toFixed(2)}
                ${group.boxes.length <= 3 ? `<span class="box-nums">#${group.boxes.join(', #')}</span>` : ''}
              </span>
              <span class="breakdown-amount">$${(group.price * group.count).toFixed(2)}</span>
            </div>
            <div class="breakdown-details breakdown-details-compact">
              <div class="detail-item">
                <span class="detail-icon">🍗</span>
                <span class="detail-text">${wingDesc}</span>
              </div>
            </div>
          </div>
        `;
      }).join('')}

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
    quickAdds: { title: 'Essentials', icon: '🥤' },
    beverages: { title: 'Cold Beverages', icon: '🧃' },
    hotBeverages: { title: 'Hot Beverages', icon: '☕' },
    salads: { title: 'Salads', icon: '🥗' },
    sides: { title: 'Premium Sides', icon: '🥔' },
    desserts: { title: 'Desserts', icon: '🍰' },
    saucesToGo: { title: 'Sauces To-Go', icon: '🌶️' },
    dipsToGo: { title: 'Dips To-Go', icon: '🥫' }
  };

  return `
    <div class="extras-breakdown">
      ${EXTRA_CATEGORY_KEYS.map(catKey => {
        const catData = categories[catKey];
        const items = Array.isArray(extras[catKey]) ? extras[catKey] : [];
        if (!catData || items.length === 0) return '';

        return `
          <div class="extras-category">
            <div class="category-header">
              <span class="category-icon">${catData.icon}</span>
              <span class="category-title">${catData.title}</span>
            </div>
            ${items.map(item => {
              const quantity = item.quantity || 1;
              const unitPrice = Number(item.price) || 0;
              const displayName = item.name || item.id || 'Extra Item';
              const totalServings = item.servings && item.servings > 1 ? item.servings * quantity : 0;
              return `
                <div class="breakdown-row">
                  <span class="breakdown-desc">
                    ${displayName}
                    ${item.packSize ? `<span class="pack-size">(${item.packSize})</span>` : ''}
                    ${totalServings > 0 ? `<span class="item-servings">(${totalServings}${item.cupSize ? ` ${item.cupSize}` : ''} servings)</span>` : ''}
                    × ${quantity}
                  </span>
                  <span class="breakdown-amount">$${(unitPrice * quantity).toFixed(2)}</span>
                </div>
              `;
            }).join('')}
          </div>
        `;
      }).join('')}
    </div>
  `;
}

/**
 * Calculate total cost of all boxes
 */
function calculateBoxesTotal(config, boxCount, individualOverrides, menuData = {}, templateIncludedDessert = null) {
  let total = 0;

  for (let boxNum = 1; boxNum <= boxCount; boxNum++) {
    const boxConfig = individualOverrides[boxNum] || config;
    total += calculatePricePerBox(boxConfig, menuData, templateIncludedDessert);
  }

  return total;
}

/**
 * Calculate price per box (imported from live-preview-panel.js logic)
 */
function calculatePricePerBox(config, menuData = {}, templateIncludedDessert = null) {
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

  // Side price adjustment (database-driven)
  if (config.side && menuData.sides) {
    const sidePrice = getSidePrice(config.side, menuData.sides);
    if (sidePrice !== null) {
      // Base side is chips at $0 (included), so only charge differential
      const baseSidePrice = 0;
      price += (sidePrice - baseSidePrice);
    }
  }

  // 🔑 PRICING FIX: Dessert price adjustment with template-aware baseline
  if (config.dessert && config.dessert !== 'no-dessert' && menuData.desserts) {
    const dessertPrice = getDessertPrice(config.dessert, menuData.desserts);
    if (dessertPrice !== null) {
      // Use template's included dessert as baseline for differential pricing
      // This ensures the base price ($12.50) includes the template's default dessert
      const baseDessertPrice = (templateIncludedDessert && templateIncludedDessert !== 'no-dessert')
        ? (getDessertPrice(templateIncludedDessert, menuData.desserts) || 0)
        : 0;

      price += (dessertPrice - baseDessertPrice);
    }
  }

  return price;
}

/**
 * Helper: Get side price from menuData
 */
function getSidePrice(sideId, sides) {
  if (!sideId || !sides) return null;

  // Map display ID back to Firestore ID
  const displayToFirestoreId = {
    'chips': 'miss_vickies_chips',
    'coleslaw': 'sally_sherman_coleslaw',
    'potato-salad': 'sally_sherman_potato_salad'
  };

  const firestoreId = displayToFirestoreId[sideId] || sideId;
  const side = sides.find(s => s.id === firestoreId);

  return side?.variants?.[0]?.basePrice ?? null;
}

/**
 * Helper: Get dessert price from menuData
 */
function getDessertPrice(dessertId, desserts) {
  if (!dessertId || !desserts) return null;

  const dessert = desserts.find(d => d.id === dessertId);
  return dessert?.variants?.[0]?.basePrice ?? null;
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
