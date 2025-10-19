import {
  calculateTotalPrepTime,
  getRequiredEquipment as combineRequiredEquipment,
  getAllergens as combineAllergens,
  getAddOnRequiredEquipment,
  getAddOnAllergens
} from '../../types/catering.ts';

import {
  trackAddOnSelected,
  trackAddOnRemoved,
  trackPreparationMethodChanged,
  trackTotalCalculated,
  trackEzCaterRedirect
} from '../../analytics.js';

/**
 * Add-Ons Selector Component
 * Step 3: Vegetarian Options (Elena's Eggplant + Cauliflower Wings with prep variants)
 * Step 4: Desserts (Daisy's Cookies, Chef's Quality Cake, Chef Pierre Cheesecake)
 *
 * Gate 3 Implementation - Codex-Philly spec Oct 2025
 */

/**
 * Render Step 3: Vegetarian Add-Ons Section
 * @param {Array} vegetarianAddOns - Filtered vegetarian add-ons from Firestore
 * @param {number} packageTier - Package tier for analytics
 * @param {string} packageId - Package ID for state tracking
 * @returns {string} HTML for vegetarian section
 */
export function renderVegetarianAddOns(vegetarianAddOns, packageTier, packageId) {
  if (!vegetarianAddOns || vegetarianAddOns.length === 0) {
    return '';
  }

  return `
    <div class="add-ons-subsection vegetarian-section">
      <div class="subsection-header">
        <h5>🌱 Vegetarian Options</h5>
      </div>

      <p class="subsection-description">
        Perfect for team members who prefer meat-free options. Same great flavors, zero guilt!
      </p>

      <div class="add-ons-grid">
        ${vegetarianAddOns.map(addOn => renderVegetarianCard(addOn, packageTier, packageId)).join('')}
      </div>
    </div>
  `;
}

/**
 * Render individual vegetarian add-on card
 * Handles preparation variants (fried/baked) for cauliflower wings
 */
function renderVegetarianCard(addOn, packageTier, packageId) {
  const hasVariants = addOn.preparationOptions && addOn.preparationOptions.length > 0;
  const badgeText = addOn.badge || 'Vegetarian';
  const equipmentList = hasVariants
    ? Array.from(new Set(addOn.preparationOptions.flatMap(option => option.requiredEquipment || [])))
    : addOn.requiredEquipment;

  return `
    <div class="add-on-card" data-addon-id="${addOn.id}" data-category="vegetarian">
      <div class="add-on-image">
        <img src="${addOn.imageUrl}" alt="${addOn.name}" loading="lazy">
        ${addOn.featured ? '<span class="featured-badge">Popular</span>' : ''}
        <span class="dietary-badge">${badgeText}</span>
      </div>

      <div class="add-on-content">
        <h5 class="add-on-name">${addOn.name}</h5>
        <p class="add-on-description">${addOn.description}</p>

        <div class="add-on-details">
          <span class="serving-info">${addOn.servingSize} • Serves ${addOn.serves}</span>
          <span class="supplier-info">From ${addOn.supplier}</span>
        </div>

        <!-- Preparation Method Toggle (for cauliflower wings) -->
        ${hasVariants ? renderPreparationToggle(addOn, packageId) : ''}

        <!-- Sauce Selector (for cauliflower wings) -->
        ${addOn.id.includes('cauliflower') ? renderCauliflowerSauceSelector(addOn, packageId) : ''}

        <!-- Operational Info -->
        <div class="add-on-ops-info">
          <span class="prep-time" title="Prep time">⏱️ ${hasVariants ? 'Varies' : addOn.prepTimeMinutes} min</span>
          <span class="equipment" title="Required equipment">${getEquipmentIcon(equipmentList)}</span>
        </div>

        ${renderNutritionInfo(addOn)}
        ${renderAllergenInfo(addOn)}

        ${renderQuantityControls(addOn, packageTier, packageId, 'vegetarian')}
      </div>
    </div>
  `;
}

/**
 * Render preparation method toggle (fried vs baked)
 * Only for items with preparationOptions (cauliflower wings)
 */
function renderPreparationToggle(addOn, packageId) {
  const defaultMethod = addOn.preparationOptions[0]; // fried (default)
  const altMethod = addOn.preparationOptions[1]; // baked

  return `
    <div class="preparation-toggle" id="prep-toggle-${addOn.id}-${packageId}">
      <label class="toggle-label">Preparation Method:</label>
      <div class="toggle-buttons" role="radiogroup">
        <label class="toggle-option ${!altMethod ? 'disabled' : ''}">
          <input
            type="radio"
            name="prep-${addOn.id}-${packageId}"
            value="${defaultMethod.id}"
            checked
            onchange="handlePrepMethodChange('${addOn.id}', '${defaultMethod.id}', '${packageId}')"
          >
          <span class="toggle-text">
            <strong>${defaultMethod.label.split('–')[0].trim()}</strong>
            <small>${defaultMethod.prepTimeMinutes} min</small>
          </span>
        </label>

        ${altMethod ? `
        <label class="toggle-option">
          <input
            type="radio"
            name="prep-${addOn.id}-${packageId}"
            value="${altMethod.id}"
            onchange="handlePrepMethodChange('${addOn.id}', '${altMethod.id}', '${packageId}')"
          >
          <span class="toggle-text">
            <strong>${altMethod.label.split('–')[0].trim()}</strong>
            <small>${altMethod.prepTimeMinutes} min</small>
            ${altMethod.maxDailyUnits ? `<small class="capacity-note">Max ${altMethod.maxDailyUnits}/day</small>` : ''}
          </span>
        </label>
        ` : ''}
      </div>
    </div>
  `;
}

/**
 * Render sauce selector for cauliflower wings (max 2 sauces)
 * TODO: Pull sauce list from package context instead of hardcoded array
 * Will be wired when package data integration is complete
 */
function renderCauliflowerSauceSelector(addOn, packageId) {
  // TODO: Replace with actual sauce list from package context
  // This ensures totals stay in sync with existing sauce logic
  const popularSauces = [
    { id: 'philly-classic-hot', name: 'Philly Classic Hot' },
    { id: 'northeast-hot-lemon', name: 'Northeast Hot Lemon' },
    { id: 'frankford-cajun', name: 'Frankford Cajun' },
    { id: 'tailgate-bbq', name: 'Tailgate BBQ' },
    { id: 'garlic-parmesan', name: 'Garlic Parmesan' },
    { id: 'buffalo', name: 'Buffalo' }
  ];

  return `
    <div class="sauce-selector-compact" id="sauce-selector-${addOn.id}-${packageId}" style="display:none;">
      <label class="sauce-selector-label">
        Choose Sauces (Max 2):
        <span class="sauce-counter">
          <span id="sauce-count-${addOn.id}-${packageId}">0</span>/2
        </span>
      </label>
      <div class="sauce-chips">
        ${popularSauces.map(sauce => `
          <label class="sauce-chip">
            <input
              type="checkbox"
              name="sauce-${addOn.id}-${packageId}"
              value="${sauce.id}"
              onchange="updateCauliflowerSauceCount('${addOn.id}', '${packageId}')"
            >
            <span>${sauce.name}</span>
          </label>
        `).join('')}
      </div>
      <p class="sauce-note">💡 Choose single sauce for all 50, or split 25/25</p>
    </div>
  `;
}

/**
 * Render quantity controls for an add-on card
 */
function renderQuantityControls(addOn, packageTier, packageId, category) {
  return `
    <div class="add-on-footer">
      <span class="add-on-price">+$${addOn.basePrice.toFixed(2)}</span>
      <div class="add-on-quantity">
        <button
          type="button"
          class="qty-btn"
          onclick="adjustAddOnQuantity('${addOn.id}', '${packageTier}', '${packageId}', '${category}', -1)"
          aria-label="Decrease ${addOn.name} quantity"
        >−</button>
        <input
          type="number"
          min="0"
          value="0"
          data-addon-qty="${addOn.id}-${packageId}"
          onchange="setAddOnQuantity('${addOn.id}', '${packageTier}', '${packageId}', '${category}', this.value)"
          aria-label="${addOn.name} quantity"
        >
        <button
          type="button"
          class="qty-btn"
          onclick="adjustAddOnQuantity('${addOn.id}', '${packageTier}', '${packageId}', '${category}', 1)"
          aria-label="Increase ${addOn.name} quantity"
        >+</button>
      </div>
    </div>
  `;
}

function renderNutritionInfo(addOn) {
  const calories = addOn.nutritionPerServing?.calories;
  if (!calories) return '';

  return `
    <div class="nutrition-info">
      <span class="nutrition-label">Calories:</span>
      <span class="nutrition-value">${calories} per ${addOn.servingSize}</span>
    </div>
  `;
}

function renderAllergenInfo(addOn) {
  const allergens = (addOn.allergens || []).filter(allergen => allergen && allergen.toLowerCase() !== 'none');
  if (!allergens.length) return '';

  const formatted = allergens.map(capitalize).join(', ');
  return `
    <div class="allergen-info">
      <span class="allergen-label">Allergens:</span>
      <span class="allergen-value">${formatted}</span>
    </div>
  `;
}

/**
 * Render Step 4: Desserts Section
 * @param {Array} dessertAddOns - Filtered dessert add-ons from Firestore
 * @param {number} packageTier - Package tier for analytics
 * @param {string} packageId - Package ID for state tracking
 * @returns {string} HTML for desserts section
 */
export function renderDessertsAddOns(dessertAddOns, packageTier, packageId) {
  if (!dessertAddOns || dessertAddOns.length === 0) {
    return '';
  }

  return `
    <div class="add-ons-subsection desserts-section" style="margin-top: 2rem;">
      <div class="subsection-header">
        <h5>🍰 Desserts</h5>
      </div>

      <p class="subsection-description">
        End on a sweet note! Perfect for celebrations and team morale.
      </p>

      <div class="add-ons-grid">
        ${dessertAddOns.map(addOn => renderDessertCard(addOn, packageTier, packageId)).join('')}
      </div>
    </div>
  `;
}

/**
 * Render Hot Beverages Section
 * @param {Array} beverageAddOns - Filtered hot beverage add-ons from Firestore
 * @param {number} packageTier - Package tier for analytics
 * @param {string} packageId - Package ID for state tracking
 * @param {number} estimatedDeliveryMinutes - Estimated delivery time in minutes for warning
 * @returns {string} HTML for hot beverages section
 */
export function renderHotBeveragesAddOns(beverageAddOns, packageTier, packageId, estimatedDeliveryMinutes = 60) {
  if (!beverageAddOns || beverageAddOns.length === 0) {
    return '';
  }

  return `
    <div class="add-ons-subsection hot-beverages-section" style="margin-top: 2rem;">
      <div class="subsection-header">
        <h5>☕ Hot Beverages</h5>
      </div>

      <p class="subsection-description">
        Premium Lavazza Coffee and Ghirardelli Hot Chocolate. Delivered in insulated cambros — stays hot 2+ hours.
      </p>

      <div class="add-ons-grid">
        ${beverageAddOns.map(addOn => renderHotBeverageCard(addOn, packageTier, packageId)).join('')}
      </div>
    </div>
  `;
}

/**
 * Render individual dessert add-on card
 */
function renderDessertCard(addOn, packageTier, packageId) {
  const badgeText = addOn.badge || 'Dessert';

  return `
    <div class="add-on-card" data-addon-id="${addOn.id}" data-category="dessert">
      <div class="add-on-image">
        <img src="${addOn.imageUrl}" alt="${addOn.name}" loading="lazy">
        ${addOn.featured ? '<span class="featured-badge">Popular</span>' : ''}
        <span class="dietary-badge dessert-badge">${badgeText}</span>
      </div>

      <div class="add-on-content">
        <h5 class="add-on-name">${addOn.name}</h5>
        <p class="add-on-description">${addOn.description}</p>

        <div class="add-on-details">
          <span class="serving-info">${addOn.servingSize} • Serves ${addOn.serves}</span>
          <span class="supplier-info">From ${addOn.supplier}</span>
        </div>

        <!-- Operational Info -->
        <div class="add-on-ops-info">
          <span class="prep-time" title="Prep time">⏱️ ${addOn.prepTimeMinutes} min</span>
          <span class="storage" title="Storage">${getStorageIcon(addOn.storageType)}</span>
        </div>

        ${renderNutritionInfo(addOn)}
        ${renderAllergenInfo(addOn)}

        ${renderQuantityControls(addOn, packageTier, packageId, 'dessert')}
      </div>
    </div>
  `;
}

/**
 * Render individual hot beverage add-on card
 * Includes serving clarity (cup icon with count) and premium brand messaging
 */
function renderHotBeverageCard(addOn, packageTier, packageId) {
  const badgeText = 'Premium';
  const servingIcon = '☕'.repeat(Math.min(addOn.servings / 4, 4)); // Visual cup icons (max 4)

  return `
    <div class="add-on-card hot-beverage-card" data-addon-id="${addOn.id}" data-category="hot-beverages">
      <div class="add-on-image">
        <img src="${addOn.imageUrl}" alt="${addOn.name}" loading="lazy">
        ${addOn.featured ? '<span class="featured-badge">Popular</span>' : ''}
        <span class="dietary-badge premium-badge">${badgeText}</span>
        <span class="size-badge">${addOn.specifications?.volume || ''}</span>
      </div>

      <div class="add-on-content">
        <h5 class="add-on-name">${addOn.name}</h5>
        <p class="add-on-description">${addOn.description}</p>

        ${addOn.marketingHook ? `
          <p class="marketing-hook">💡 ${addOn.marketingHook}</p>
        ` : ''}

        <!-- Serving Clarity (Sally's UX req) -->
        <div class="serving-clarity">
          <span class="cup-visual">${servingIcon}</span>
          <span class="serving-text">
            Serves <strong>${addOn.servings} people</strong> (${addOn.servingSize}s)
          </span>
        </div>

        <!-- Temperature Guarantee -->
        ${addOn.temperatureGuidelines?.guarantee ? `
          <div class="temperature-guarantee">
            🌡️ ${addOn.temperatureGuidelines.guarantee}
          </div>
        ` : ''}

        <!-- Brand Heritage -->
        ${addOn.specifications?.established ? `
          <div class="brand-heritage">
            <span class="heritage-badge">Since ${addOn.specifications.established}</span>
          </div>
        ` : ''}

        <!-- What's Included -->
        ${addOn.specifications?.includes ? `
          <div class="includes-list">
            <span class="includes-label">Includes:</span>
            <span class="includes-items">${addOn.specifications.includes.slice(0, 3).join(', ')}</span>
          </div>
        ` : ''}

        ${renderNutritionInfo(addOn)}
        ${renderAllergenInfo(addOn)}

        ${renderQuantityControls(addOn, packageTier, packageId, 'hot-beverages')}
      </div>
    </div>
  `;
}

/**
 * Render Sticky Summary (desktop right rail / mobile bottom sheet)
 * Shows running total, prep time estimate, equipment requirements
 * Mobile: Collapsible bottom sheet with collapsed/expanded states
 */
export function renderStickySummary(packageData, packageId) {
  const basePrepTime = packageData.prepTimeMinutes || 40;
  const baseEquipment = (packageData.requiredEquipment || []).join(',');

  return `
    <div
      class="sticky-summary"
      id="sticky-summary-${packageId}"
      data-base-price="${packageData.basePrice || 0}"
      data-base-prep="${basePrepTime}"
      data-base-equipment="${baseEquipment}"
      data-package-tier="${packageData.tier}"
      data-expanded="false"
    >
      <!-- Mobile Collapsed State (Floating Bottom Bar) -->
      <div class="summary-collapsed-bar" onclick="toggleSummarySheet('${packageId}')">
        <div class="collapsed-content">
          <div class="collapsed-left">
            <span class="collapsed-icon">🍗</span>
            <span class="collapsed-info">
              <span id="collapsed-items-${packageId}">Base Package</span>
              <span class="collapsed-price" id="collapsed-price-${packageId}">View on ezCater</span>
            </span>
          </div>
          <button class="collapsed-toggle" aria-label="View Order Summary">
            <span class="toggle-text">View Order</span>
            <span class="toggle-icon">▲</span>
          </button>
        </div>
      </div>

      <!-- Desktop Header / Mobile Expanded Header -->
      <div class="summary-header">
        <h4>Order Summary</h4>
        <button class="summary-close-btn" onclick="toggleSummarySheet('${packageId}')" aria-label="Close Summary">
          ✕
        </button>
      </div>

      <div class="summary-body">
        <!-- Base Package -->
        <div class="summary-line">
          <span class="summary-label">${packageData.name}</span>
          <span class="summary-value">Base</span>
        </div>

        <!-- Add-Ons List (dynamically populated) -->
        <div id="summary-addons-${packageId}" class="summary-addons">
          <!-- JavaScript will populate selected add-ons here -->
        </div>

        <!-- Subtotals -->
        <div class="summary-divider"></div>
        <div class="summary-line summary-subtotal">
          <span class="summary-label">Add-Ons Subtotal</span>
          <span class="summary-value" id="addons-subtotal-${packageId}">$0.00</span>
        </div>

        <!-- Estimated Total -->
        <div class="summary-line summary-total">
          <span class="summary-label">Estimated Total</span>
          <span class="summary-value" id="estimated-total-${packageId}">View on ezCater</span>
        </div>

        <!-- Operational Estimates -->
        <div class="summary-divider"></div>
        <div class="summary-ops-info">
          <div class="ops-row">
            <span class="ops-icon">⏱️</span>
            <span class="ops-text">
              Prep Time: <strong id="total-prep-time-${packageId}">${basePrepTime} min</strong>
            </span>
          </div>
          <div class="ops-row">
            <span class="ops-icon">🔧</span>
            <span class="ops-text" id="required-equipment-${packageId}">
              ${baseEquipment ? getEquipmentIcon(baseEquipment.split(',')) : '🍴 Standard kitchen'}
            </span>
          </div>
        </div>
      </div>

      <div class="summary-footer">
        <button
          class="btn-primary btn-block"
          onclick="handleEzCaterRedirect('${packageId}')"
        >
          Order on ezCater →
        </button>
        <p class="summary-note">Final pricing at checkout</p>
      </div>
    </div>

    <!-- Backdrop Overlay (Mobile Only) -->
    <div class="summary-backdrop" id="summary-backdrop-${packageId}" onclick="toggleSummarySheet('${packageId}')"></div>
  `;
}

/**
 * Helper: Get equipment icon based on required equipment array
 */
function getEquipmentIcon(equipmentArray) {
  const items = Array.isArray(equipmentArray) ? equipmentArray : [equipmentArray];
  const filtered = items.filter(Boolean);

  if (filtered.length === 0) return '🍴';

  const iconMap = {
    'impingerOven': '🔥 Oven',
    'fryer': '🍟 Fryer',
    'refrigeration': '❄️ Fridge',
    'chafing': '🔥 Chafing',
    'boxingStation': '📦 Packaging'
  };

  return filtered.map(eq => iconMap[eq] || '🔧').join(' + ');
}

/**
 * Helper: Get storage icon based on storage type
 */
function getStorageIcon(storageType) {
  const iconMap = {
    'frozen': '❄️ Frozen',
    'refrigerated': '🧊 Refrigerated',
    'dry': '📦 Dry',
    'ambient': '🌡️ Room Temp'
  };

  return iconMap[storageType] || '📦';
}

/**
 * ============================================================================
 * STATE MANAGEMENT & INTERACTION HANDLERS
 * ============================================================================
 */

// Global state for selected add-ons (per package)
window.selectedAddOns = window.selectedAddOns || {};

// Global cache of all add-ons data (loaded from Firestore)
// Keyed by add-on ID for quick lookup in handlers
window.addOnsDataCache = window.addOnsDataCache || {};

window.adjustAddOnQuantity = function(addOnId, packageTier, packageId, category, delta) {
  const input = document.querySelector(`input[data-addon-qty="${addOnId}-${packageId}"]`);
  if (!input) return;
  const currentValue = Number(input.value) || 0;
  const nextValue = Math.max(0, currentValue + delta);
  input.value = nextValue;
  window.setAddOnQuantity(addOnId, packageTier, packageId, category, nextValue);
};

window.setAddOnQuantity = function(addOnId, packageTier, packageId, category, quantity) {
  const card = document.querySelector(`.add-on-card[data-addon-id="${addOnId}"]`);
  const input = document.querySelector(`input[data-addon-qty="${addOnId}-${packageId}"]`);
  const addOnData = window.addOnsDataCache[addOnId];

  if (!addOnData) {
    console.error('Add-on data not found in cache:', addOnId);
    return;
  }

  if (!window.selectedAddOns[packageId]) {
    window.selectedAddOns[packageId] = [];
  }

  const selectedList = window.selectedAddOns[packageId];
  const existing = selectedList.find(a => a.id === addOnId);
  const numericQty = Math.max(0, Number(quantity) || 0);

  if (numericQty === 0) {
    if (existing) {
      selectedList.splice(selectedList.indexOf(existing), 1);
      if (typeof window.trackAddOnRemoved === 'function') {
        window.trackAddOnRemoved(addOnId, category, Number(packageTier), existing.preparationMethod);
      }
    }

    if (card) card.classList.remove('selected');
    if (input) input.value = 0;

    if (addOnId.includes('cauliflower')) {
      const sauceSelector = document.getElementById(`sauce-selector-${addOnId}-${packageId}`);
      if (sauceSelector) sauceSelector.style.display = 'none';

      const sauceCounter = document.getElementById(`sauce-count-${addOnId}-${packageId}`);
      if (sauceCounter) sauceCounter.textContent = '0';

      const sauceInputs = document.querySelectorAll(`input[name="sauce-${addOnId}-${packageId}"]`);
      sauceInputs.forEach(inputEl => {
        inputEl.checked = false;
      });
    }
  } else {
    const prepMethod = getSelectedPrepMethod(addOnId, packageId);
    if (existing) {
      existing.quantity = numericQty;
      existing.preparationMethod = prepMethod;
    } else {
      selectedList.push({
        ...addOnData,
        preparationMethod: prepMethod,
        packageTier: Number(packageTier),
        selectedAt: Date.now(),
        category,
        sauceSelections: [],
        quantity: numericQty
      });

      if (typeof window.trackAddOnSelected === 'function') {
        window.trackAddOnSelected(addOnData, Number(packageTier), prepMethod, selectedList.length);
      }
    }

    if (card) card.classList.add('selected');
    if (input) input.value = numericQty;

    if (addOnId.includes('cauliflower')) {
      const sauceSelector = document.getElementById(`sauce-selector-${addOnId}-${packageId}`);
      if (sauceSelector) sauceSelector.style.display = 'block';
    }
  }

  updateStickySummary(packageId);
  if (typeof window.handleAddOnSelectionChange === 'function') {
    window.handleAddOnSelectionChange(packageId);
  }
};

/**
 * Handle preparation method change (fried ↔ baked)
 */
window.handlePrepMethodChange = function(addOnId, newMethod, packageId) {
  // Find add-on in selected state
  const addOn = window.selectedAddOns[packageId]?.find(a => a.id === addOnId);

  if (addOn) {
    const oldMethod = addOn.preparationMethod;
    addOn.preparationMethod = newMethod;

    if (typeof window.trackPreparationMethodChanged === 'function' && oldMethod !== newMethod) {
      const tier = addOn.packageTier || addOn.tier || null;
      window.trackPreparationMethodChanged(addOnId, oldMethod || 'default', newMethod, tier);
    }

    // Update summary (prep time changes)
    updateStickySummary(packageId);
    if (typeof window.handleAddOnSelectionChange === 'function') {
      window.handleAddOnSelectionChange(packageId);
    }
  }
};

/**
 * Update cauliflower wings sauce count (max 2)
 */
window.updateCauliflowerSauceCount = function(addOnId, packageId) {
  const checkboxes = document.querySelectorAll(`input[name="sauce-${addOnId}-${packageId}"]:checked`);
  const counter = document.getElementById(`sauce-count-${addOnId}-${packageId}`);

  // Enforce max 2 sauces
  if (checkboxes.length > 2) {
    checkboxes[checkboxes.length - 1].checked = false;
    return;
  }

  if (counter) {
    counter.textContent = checkboxes.length;
  }

  const addOn = window.selectedAddOns[packageId]?.find(a => a.id === addOnId);
  if (addOn) {
    addOn.sauceSelections = Array.from(checkboxes).map(cb => cb.value);
  }

  updateStickySummary(packageId);
};

/**
 * Toggle bottom sheet expansion on mobile
 * Slides summary up/down with backdrop overlay
 */
window.toggleSummarySheet = function(packageId) {
  const summary = document.getElementById(`sticky-summary-${packageId}`);
  const backdrop = document.getElementById(`summary-backdrop-${packageId}`);

  if (!summary || !backdrop) return;

  const isExpanded = summary.dataset.expanded === 'true';

  if (isExpanded) {
    // Collapse
    summary.dataset.expanded = 'false';
    summary.classList.remove('summary-expanded');
    backdrop.classList.remove('backdrop-visible');

    // Restore body scroll
    document.body.style.overflow = '';
  } else {
    // Expand
    summary.dataset.expanded = 'true';
    summary.classList.add('summary-expanded');
    backdrop.classList.add('backdrop-visible');

    // Prevent body scroll when sheet is open (mobile only)
    if (window.innerWidth < 768) {
      document.body.style.overflow = 'hidden';
    }
  }
};

/**
 * Update sticky summary with current selections
 * Uses real add-on data (name, basePrice) from selectedAddOns array
 * Also updates collapsed bar for mobile bottom sheet
 */
function updateStickySummary(packageId) {
  const selectedList = window.selectedAddOns[packageId] || [];
  const summaryContainer = document.getElementById(`sticky-summary-${packageId}`);

  // Update add-ons list in summary
  const summaryAddOns = document.getElementById(`summary-addons-${packageId}`);
  if (summaryAddOns) {
    if (selectedList.length === 0) {
      summaryAddOns.innerHTML = '<p class="summary-empty">No add-ons selected yet.</p>';
    } else {
      summaryAddOns.innerHTML = selectedList.map(addOn => {
        const methodLabel = addOn.preparationMethod ? ` (${capitalize(addOn.preparationMethod)})` : '';
        const qty = addOn.quantity || 0;
        const qtyLabel = qty > 1 ? ` × ${qty}` : '';
        return `
          <div class="summary-line summary-addon">
            <span class="summary-label">${addOn.name}${methodLabel}${qtyLabel}</span>
            <span class="summary-value">+$${((addOn.basePrice || 0) * qty).toFixed(2)}</span>
          </div>
        `;
      }).join('');
    }
  }

  const addOnsSubtotal = selectedList.reduce(
    (sum, addOn) => sum + (addOn.basePrice || 0) * Math.max(addOn.quantity || 0, 0),
    0
  );

  // Update subtotal
  const subtotal = document.getElementById(`addons-subtotal-${packageId}`);
  if (subtotal) {
    subtotal.textContent = `$${addOnsSubtotal.toFixed(2)}`;
  }

  // Update collapsed bar (mobile bottom sheet)
  const collapsedItems = document.getElementById(`collapsed-items-${packageId}`);
  const collapsedPrice = document.getElementById(`collapsed-price-${packageId}`);

  if (collapsedItems) {
    const itemCount = selectedList.reduce((count, addOn) => count + (addOn.quantity || 0), 0);
    const itemText = itemCount === 0
      ? 'Base Package'
      : itemCount === 1
      ? 'Base + 1 Add-On'
      : `Base + ${itemCount} Add-Ons`;

    collapsedItems.textContent = itemText;
  }

  if (collapsedPrice && summaryContainer) {
    const basePrice = Number(summaryContainer.dataset.basePrice || 0);
    const totalPrice = basePrice + addOnsSubtotal;
    collapsedPrice.textContent = totalPrice > 0 ? `$${totalPrice.toFixed(2)}` : 'View on ezCater';
  }

  if (summaryContainer) {
    const basePrice = Number(summaryContainer.dataset.basePrice || 0);
    const basePrep = Number(summaryContainer.dataset.basePrep || 40);
    const baseEquipment = summaryContainer.dataset.baseEquipment
      ? summaryContainer.dataset.baseEquipment.split(',').filter(Boolean)
      : [];

    // Estimated total display
    const estimatedTotal = document.getElementById(`estimated-total-${packageId}`);
    if (estimatedTotal) {
      const estimatedValue = basePrice + addOnsSubtotal;
      estimatedTotal.textContent = estimatedValue > 0 ? `$${estimatedValue.toFixed(2)}` : 'View on ezCater';
    }

    const preparationSelections = selectedList.reduce((acc, addOn) => {
      if (addOn.preparationMethod) {
        acc[addOn.id] = addOn.preparationMethod;
      }
      return acc;
    }, {});

    const totalPrepMinutes = Math.max(
      basePrep,
      calculateTotalPrepTime(basePrep, selectedList, preparationSelections)
    );

    const prepTimeEl = document.getElementById(`total-prep-time-${packageId}`);
    if (prepTimeEl) {
      prepTimeEl.textContent = `${totalPrepMinutes} min`;
    }

    const combinedEquipment = combineRequiredEquipment(baseEquipment, selectedList, preparationSelections);
    const equipmentEl = document.getElementById(`required-equipment-${packageId}`);
    if (equipmentEl) {
      const uniqueEquipment = Array.from(new Set(combinedEquipment));
      equipmentEl.textContent = uniqueEquipment.length
        ? getEquipmentIcon(uniqueEquipment)
        : '🍴 Standard kitchen';
    }

    const aggregatedAllergens = combineAllergens([], selectedList, preparationSelections);
    summaryContainer.dataset.allergens = aggregatedAllergens.join(',');
  }

  // Track total calculation
  if (summaryContainer) {
    const packageTier = Number(summaryContainer.dataset.packageTier);
    const basePrice = Number(summaryContainer.dataset.basePrice || 0);
    const finalPrice = basePrice + addOnsSubtotal;
    const vegetarianCount = selectedList
      .filter(a => a.category === 'vegetarian')
      .reduce((count, addOn) => count + (addOn.quantity || 0), 0);
    const dessertCount = selectedList
      .filter(a => a.category === 'dessert')
      .reduce((count, addOn) => count + (addOn.quantity || 0), 0);

    if (selectedList.length > 0 && typeof window.trackTotalCalculated === 'function') {
      window.trackTotalCalculated(
        packageId,
        packageTier,
        basePrice,
        addOnsSubtotal,
        finalPrice,
        selectedList.reduce((count, addOn) => count + (addOn.quantity || 0), 0),
        vegetarianCount,
        dessertCount
      );
    }
  }
}

function capitalize(value) {
  if (!value) return '';
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/**
 * Handle ezCater redirect (conversion event)
 */
window.handleEzCaterRedirect = function(packageId) {
  const selectedList = window.selectedAddOns[packageId] || [];
  const summaryContainer = document.getElementById(`sticky-summary-${packageId}`);

  // Track conversion
  if (summaryContainer) {
    const packageTier = Number(summaryContainer.dataset.packageTier);
    const basePrice = Number(summaryContainer.dataset.basePrice || 0);
    const addOnsSubtotal = selectedList.reduce(
      (sum, addOn) => sum + (addOn.basePrice || 0) * Math.max(addOn.quantity || 0, 0),
      0
    );
    const finalPrice = basePrice + addOnsSubtotal;

    if (typeof window.trackEzCaterRedirect === 'function') {
      window.trackEzCaterRedirect(packageId, packageTier, finalPrice, selectedList);
    }
  }

  // Redirect to ezCater
  window.open('https://www.ezcater.com/brand/pvt/philly-wings-express', '_blank');
};

/**
 * Helper: Get selected preparation method for an add-on
 */
function getSelectedPrepMethod(addOnId, packageId) {
  const radio = document.querySelector(`input[name="prep-${addOnId}-${packageId}"]:checked`);
  return radio ? radio.value : undefined;
}
