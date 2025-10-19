/**
 * Live Preview Panel Component
 * Real-time visualization of configured box with pricing
 */

/**
 * Render live preview panel
 */
export function renderLivePreviewPanel(config = {}, boxCount = 10) {
  // Check configuration completeness with split sauce support
  const sauceComplete = config.splitSauces
    ? (config.sauces?.length === 2 && config.sauces[0]?.id && config.sauces[1]?.id)
    : !!config.sauce;

  const hasConfig = config.wingCount && config.wingType && sauceComplete &&
                    config.dips?.length === 2 && config.side && config.dessert;

  return `
    <aside class="live-preview-panel" aria-live="polite">
      <div class="preview-header">
        <div>
          <h3 class="preview-title">Box Configuration Preview</h3>
          <p class="preview-subtitle">All ${boxCount} boxes</p>
        </div>
        ${hasConfig ? `<span class="preview-status-badge preview-complete">✓ Complete</span>` : `<span class="preview-status-badge preview-incomplete">In Progress</span>`}
      </div>

      <div class="preview-visual">
        ${renderBoxVisualization(config)}
      </div>

      <div class="preview-contents">
        <h4 class="contents-title">What's Inside:</h4>
        ${renderContentsList(config)}
      </div>

      <div class="preview-stats">
        ${renderBoxStats(config, boxCount)}
      </div>

      <div class="preview-pricing">
        ${renderPricing(config, boxCount)}
      </div>

      ${config.specialInstructions ? `
        <div class="preview-special-instructions">
          <div class="instructions-header">
            <span class="instructions-icon">📝</span>
            <strong>Special Instructions:</strong>
          </div>
          <p class="instructions-text">${config.specialInstructions}</p>
        </div>
      ` : ''}
    </aside>
  `;
}

/**
 * Render box visualization (composite image view)
 */
function renderBoxVisualization(config) {
  if (!config.wingType) {
    return `
      <div class="box-visual-empty">
        <div class="empty-icon">📦</div>
        <p class="empty-text">Configure your box to see preview</p>
      </div>
    `;
  }

  return `
    <div class="box-visual-container">
      <div class="box-outline">
        ${config.wingType ? `
          <div class="box-item box-item-wings">
            <img src="${getWingImage(config.wingType)}" alt="${formatWingType(config.wingType)}" class="item-img">
            <span class="item-label">${config.wingCount || 6} Wings</span>
          </div>
        ` : ''}

        ${renderSauceVisualization(config)}

        ${config.side ? `
          <div class="box-item box-item-side">
            <img src="${getSideImage(config.side)}" alt="${config.side}" class="item-img">
            <span class="item-label">${formatSideName(config.side)}</span>
          </div>
        ` : ''}

        ${config.dessert ? `
          <div class="box-item box-item-dessert">
            <img src="${getDessertImage(config.dessert)}" alt="${config.dessert}" class="item-img">
            <span class="item-label">${formatDessertName(config.dessert)}</span>
          </div>
        ` : ''}

        ${config.dips?.length ? `
          <div class="box-item box-item-dips">
            <div class="dips-icons">
              ${config.dips.map(dip => `<span class="dip-dot" title="${dip}">🥣</span>`).join('')}
            </div>
            <span class="item-label">2 Dips</span>
          </div>
        ` : ''}

        <div class="box-item box-item-water">
          <span class="water-icon">💧</span>
          <span class="item-label">Water</span>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render sauce visualization (handles split sauces)
 */
function renderSauceVisualization(config) {
  if (config.splitSauces && config.sauces?.length === 2) {
    // Split sauces mode
    return `
      <div class="box-item box-item-sauces-split">
        <div class="split-sauce-display">
          ${config.sauces[0]?.id ? `
            <div class="sauce-split-half">
              <img src="${getSauceImage(config.sauces[0].id)}" alt="${config.sauces[0].id}" class="item-img-small">
              <span class="sauce-count">${config.sauces[0].count}</span>
            </div>
          ` : '<div class="sauce-split-empty">?</div>'}
          <span class="sauce-divider">+</span>
          ${config.sauces[1]?.id ? `
            <div class="sauce-split-half">
              <img src="${getSauceImage(config.sauces[1].id)}" alt="${config.sauces[1].id}" class="item-img-small">
              <span class="sauce-count">${config.sauces[1].count}</span>
            </div>
          ` : '<div class="sauce-split-empty">?</div>'}
        </div>
        <span class="item-label">Split Sauces</span>
      </div>
    `;
  } else if (config.sauce) {
    // Single sauce mode
    return `
      <div class="box-item box-item-sauce">
        <img src="${getSauceImage(config.sauce)}" alt="${config.sauce}" class="item-img">
        <span class="item-label">${formatSauceName(config.sauce)}</span>
      </div>
    `;
  }
  return '';
}

/**
 * Render contents checklist
 */
function renderContentsList(config) {
  const sauceText = config.splitSauces && config.sauces?.length === 2
    ? `${formatSauceName(config.sauces[0]?.id)} (${config.sauces[0]?.count}) + ${formatSauceName(config.sauces[1]?.id)} (${config.sauces[1]?.count})`
    : config.sauce
      ? formatSauceName(config.sauce)
      : 'Sauce - Choose one';

  const sauceComplete = config.splitSauces
    ? (config.sauces?.length === 2 && config.sauces[0]?.id && config.sauces[1]?.id)
    : !!config.sauce;

  return `
    <ul class="contents-list">
      <li class="contents-item ${config.wingCount && config.wingType ? 'item-complete' : 'item-pending'}">
        <span class="item-check">${config.wingCount && config.wingType ? '✓' : '○'}</span>
        <span class="item-text">
          ${config.wingCount && config.wingType
            ? `${config.wingCount} ${formatWingType(config.wingType)} Wings`
            : 'Wing Count & Type - Choose'}
        </span>
      </li>

      <li class="contents-item ${sauceComplete ? 'item-complete' : 'item-pending'}">
        <span class="item-check">${sauceComplete ? '✓' : '○'}</span>
        <span class="item-text">${sauceText}</span>
      </li>

      <li class="contents-item ${config.dips?.length === 2 ? 'item-complete' : 'item-pending'}">
        <span class="item-check">${config.dips?.length === 2 ? '✓' : '○'}</span>
        <span class="item-text">
          ${config.dips?.length === 2
            ? config.dips.map(formatDipName).join(' + ')
            : 'Dips - Choose 2'}
        </span>
      </li>

      <li class="contents-item ${config.side ? 'item-complete' : 'item-pending'}">
        <span class="item-check">${config.side ? '✓' : '○'}</span>
        <span class="item-text">
          ${config.side ? formatSideName(config.side) : 'Side - Choose one'}
        </span>
      </li>

      <li class="contents-item ${config.dessert ? 'item-complete' : 'item-pending'}">
        <span class="item-check">${config.dessert ? '✓' : '○'}</span>
        <span class="item-text">
          ${config.dessert ? formatDessertName(config.dessert) : 'Dessert - Choose one'}
        </span>
      </li>

      <li class="contents-item item-complete">
        <span class="item-check">✓</span>
        <span class="item-text">Bottled Water (included)</span>
      </li>
    </ul>
  `;
}

/**
 * Render box statistics
 */
function renderBoxStats(config, boxCount) {
  if (!config.wingType) return '';

  const heatLevel = getSauceHeatLevel(config.sauce);
  const estimatedCalories = calculateCalories(config);
  const estimatedProtein = calculateProtein(config);

  return `
    <div class="stats-grid">
      <div class="stat-item">
        <span class="stat-label">Box Count</span>
        <span class="stat-value">${boxCount} boxes</span>
      </div>

      <div class="stat-item">
        <span class="stat-label">Heat Level</span>
        <span class="stat-value">${'🌶️'.repeat(heatLevel || 1)}</span>
      </div>

      <div class="stat-item">
        <span class="stat-label">~Calories</span>
        <span class="stat-value">${estimatedCalories}</span>
      </div>

      <div class="stat-item">
        <span class="stat-label">~Protein</span>
        <span class="stat-value">${estimatedProtein}g</span>
      </div>
    </div>
  `;
}

/**
 * Render pricing information
 */
function renderPricing(config, boxCount) {
  // Import boxedMealState if available (from boxed-meals-flow-v2.js)
  const hasIndividualOverrides = typeof window !== 'undefined' &&
    window.boxedMealState?.individualOverrides &&
    Object.keys(window.boxedMealState.individualOverrides).length > 0;

  if (hasIndividualOverrides) {
    return renderItemizedPricing(config, boxCount);
  }

  // Default pricing (all boxes use bulk config)
  const pricePerBox = calculatePricePerBox(config);
  const totalPrice = pricePerBox * boxCount;

  return `
    <div class="pricing-container">
      <div class="price-row price-per-box">
        <span class="price-label">Per Box:</span>
        <span class="price-value">$${pricePerBox.toFixed(2)}</span>
      </div>

      <div class="price-row price-total">
        <span class="price-label">Total (${boxCount} boxes):</span>
        <span class="price-value-large">$${totalPrice.toFixed(2)}</span>
      </div>

      <p class="pricing-note">
        Pricing is estimated. Final quote will include delivery and any applicable fees.
      </p>
    </div>
  `;
}

/**
 * Render itemized pricing when boxes have individual customizations
 */
function renderItemizedPricing(bulkConfig, totalBoxCount) {
  const individualOverrides = window.boxedMealState.individualOverrides || {};
  const priceGroups = {};
  let totalPrice = 0;

  // Calculate price for each box
  for (let boxNum = 1; boxNum <= totalBoxCount; boxNum++) {
    const boxConfig = individualOverrides[boxNum] || bulkConfig;
    const boxPrice = calculatePricePerBox(boxConfig);
    totalPrice += boxPrice;

    // Group boxes by price
    const priceKey = boxPrice.toFixed(2);
    if (!priceGroups[priceKey]) {
      priceGroups[priceKey] = { price: boxPrice, count: 0, boxes: [] };
    }
    priceGroups[priceKey].count++;
    priceGroups[priceKey].boxes.push(boxNum);
  }

  // Sort price groups by price (descending)
  const sortedGroups = Object.values(priceGroups).sort((a, b) => b.price - a.price);

  return `
    <div class="pricing-container itemized">
      <div class="price-breakdown">
        <div class="breakdown-header">Price Breakdown:</div>
        ${sortedGroups.map(group => `
          <div class="price-row price-item">
            <span class="price-label">
              ${group.count} box${group.count > 1 ? 'es' : ''} @ $${group.price.toFixed(2)}
              ${group.boxes.length <= 3 ? `<span class="box-numbers">(Box ${group.boxes.join(', ')})</span>` : ''}
            </span>
            <span class="price-value">$${(group.price * group.count).toFixed(2)}</span>
          </div>
        `).join('')}
      </div>

      <div class="price-row price-total">
        <span class="price-label">Total (${totalBoxCount} boxes):</span>
        <span class="price-value-large">$${totalPrice.toFixed(2)}</span>
      </div>

      <p class="pricing-note">
        <span class="pricing-note-icon">💡</span>
        Pricing reflects individual box customizations. Final quote will include delivery and fees.
      </p>
    </div>
  `;
}

/**
 * Update preview panel (for dynamic updates)
 */
export function updatePreviewPanel(config, boxCount) {
  const panel = document.querySelector('.live-preview-panel');
  if (!panel) return;

  // Re-render entire panel with new config
  panel.innerHTML = renderLivePreviewPanel(config, boxCount).replace(/<aside[^>]*>|<\/aside>/g, '');

  // Animate update
  panel.classList.add('preview-updating');
  setTimeout(() => panel.classList.remove('preview-updating'), 300);
}

// ========================================
// Helper Functions
// ========================================

function formatWingType(type) {
  const types = {
    'boneless': 'Boneless',
    'bone-in': 'Bone-In',
    'plant-based': 'Plant-Based Cauliflower'
  };
  return types[type] || type;
}

function formatSauceName(sauce) {
  // Title case conversion
  return sauce.split('-').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

function formatDipName(dip) {
  const dips = {
    'ranch': 'Ranch',
    'blue-cheese': 'Blue Cheese',
    'honey-mustard': 'Honey Mustard'
  };
  return dips[dip] || dip;
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

function getSauceHeatLevel(sauce) {
  const heatLevels = {
    'sweet-bbq': 0,
    'classic-buffalo': 2,
    'hot-honey': 3,
    'mango-habanero': 4,
    'ghost-pepper': 5
  };
  return heatLevels[sauce] || 1;
}

function calculateCalories(config) {
  // Rough estimates - to be replaced with actual nutrition data
  let calories = 0;

  if (config.wingType === 'boneless') calories += 480;
  else if (config.wingType === 'bone-in') calories += 540;
  else if (config.wingType === 'plant-based') calories += 360;

  calories += 60;  // Sauce
  calories += 120; // Dips

  if (config.side === 'chips') calories += 150;
  else calories += 100; // Cold sides

  if (config.dessert) calories += 350; // Average dessert

  return calories;
}

function calculateProtein(config) {
  // Rough estimates
  let protein = 0;

  if (config.wingType === 'boneless') protein += 36;
  else if (config.wingType === 'bone-in') protein += 42;
  else if (config.wingType === 'plant-based') protein += 12;

  protein += 4; // Dips/sides
  protein += 3; // Dessert

  return protein;
}

function calculatePricePerBox(config) {
  // Base price per box (for 6 wings)
  let price = 12.50;

  // Wing count adjustment
  const wingCount = config.wingCount || 6;
  if (wingCount === 10) price += 3.00;
  else if (wingCount === 12) price += 4.50;

  // Wing type adjustments
  if (config.wingType === 'bone-in') price += 1.50;
  if (config.wingType === 'plant-based') price += 2.00;

  // Wing style adjustments (all drums or all flats upcharge)
  if (config.wingStyle === 'all-drums' || config.wingStyle === 'all-flats') {
    price += 1.50;  // From Firebase modifierGroups/wing_style
  }

  // Sauce adjustments
  const premiumSauces = ['mango-habanero', 'hot-honey', 'ghost-pepper'];

  if (config.splitSauces && config.sauces?.length === 2) {
    // Check both sauces for premium pricing
    if (premiumSauces.includes(config.sauces[0]?.id)) price += 0.25;
    if (premiumSauces.includes(config.sauces[1]?.id)) price += 0.25;
  } else if (premiumSauces.includes(config.sauce)) {
    price += 0.50;
  }

  // Premium dessert adjustment
  const premiumDesserts = ['creme-brulee-cheesecake', 'red-velvet-cake'];
  if (premiumDesserts.includes(config.dessert)) price += 1.00;

  return price;
}

// Placeholder image functions (to be replaced with Firebase Storage URLs)
function getWingImage(type) {
  return `https://placehold.co/120x80/ff6b35/white?text=${type}`;
}

function getSauceImage(sauce) {
  return `https://placehold.co/80x80/f05545/white?text=${sauce}`;
}

function getSideImage(side) {
  return `https://placehold.co/100x80/4ecdc4/white?text=${side}`;
}

function getDessertImage(dessert) {
  return `https://placehold.co/100x80/95e1d3/white?text=${dessert}`;
}
