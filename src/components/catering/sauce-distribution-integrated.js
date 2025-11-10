/**
 * Integrated Sauce Distribution Component
 * Combines sauce selection with quantity distribution per wing type
 * Based on validated mockup: sauce-distribution-mockup.html
 */

import { db } from '../../firebase-config.js';
import { collection, query, where, getDocs } from 'firebase/firestore';
import '../../styles/sauce-distribution-integrated.css';

let componentSauces = [];
let wingTypes = [];
let maxSelectionsPerWingType = {}; // Store maxSelections for each wing type

/**
 * Render integrated sauce distribution for a wing type
 * @param {Object} options - Configuration options
 * @param {string} options.wingType - Wing type ID (boneless, boneIn, cauliflower)
 * @param {number} options.wingCount - Total wings for this type
 * @param {number} options.maxSelections - Maximum number of sauces allowed (from packageData)
 * @param {Array} options.preSelectedData - Pre-selected sauce distribution data
 * @param {Function} options.onDistributionChange - Callback when distribution changes
 * @returns {Promise<string>} HTML string
 */
export async function renderIntegratedSauceDistribution(options) {
  const {
    wingType,
    wingCount,
    maxSelections = 3,
    preSelectedData = [],
    onDistributionChange
  } = options;

  // Fetch sauces if not already loaded
  if (componentSauces.length === 0) {
    await fetchSauces();
  }

  // Store maxSelections for this wing type
  maxSelectionsPerWingType[wingType] = maxSelections;

  const wingTypeDisplayName = getWingTypeDisplayName(wingType);

  // Initialize distribution state
  const selectedSauceIds = preSelectedData.map(d => d.sauceId) || [];
  const distribution = {};
  preSelectedData.forEach(d => {
    distribution[d.sauceId] = {
      quantity: d.quantity || 0,
      application: d.application || 'tossed'
    };
  });

  return `
    <div class="wing-sauce-section" data-wing-type="${wingType}">
      <div class="wing-header">
        <div class="wing-title">${wingTypeDisplayName}</div>
        <div class="wing-count">${wingCount} wings</div>
      </div>

      <div class="instruction">
        <strong>Step 1:</strong> Select up to ${maxSelections} sauces for your ${wingTypeDisplayName.toLowerCase()} - choose "No Sauce" for plain wings, or select sauces (click to add/remove)
      </div>

      <div class="filter-section">
        <div class="filter-label">Filter by heat level:</div>
        <div class="filter-buttons" data-wing-type="${wingType}">
          <button class="filter-btn active" data-filter="all" data-wing-type="${wingType}">All Sauces</button>
          <button class="filter-btn" data-filter="0" data-wing-type="${wingType}">No Heat</button>
          <button class="filter-btn" data-filter="1" data-wing-type="${wingType}">🌶️ Mild</button>
          <button class="filter-btn" data-filter="2" data-wing-type="${wingType}">🌶️🌶️ Medium</button>
          <button class="filter-btn" data-filter="3" data-wing-type="${wingType}">🌶️🌶️🌶️ Hot</button>
          <button class="filter-btn" data-filter="4" data-wing-type="${wingType}">🌶️🌶️🌶️🌶️ Very Hot</button>
          <button class="filter-btn" data-filter="5" data-wing-type="${wingType}">🌶️🌶️🌶️🌶️🌶️ Insane</button>
        </div>
      </div>

      <div class="sauce-grid" id="sauce-grid-${wingType}">
        ${(() => {
          // Render No Sauce option first
          const noSauceSelected = selectedSauceIds.includes('no-sauce');
          const noSauceIndex = selectedSauceIds.indexOf('no-sauce');
          const noSauceCard = `
            <div class="sauce-card ${noSauceSelected ? 'selected' : ''}"
                 data-sauce-id="no-sauce"
                 data-wing-type="${wingType}">
              ${noSauceSelected ? `<div class="sauce-badge">${noSauceIndex + 1}</div>` : ''}
              <div class="sauce-card-image">
                <div class="no-sauce-image">
                  <div class="no-sauce-icon">🍗</div>
                </div>
              </div>
              <div class="sauce-card-content">
                <div class="sauce-name">No Sauce</div>
                <div class="sauce-heat">Plain Wings</div>
                <div class="sauce-type-tag no-sauce-tag">PLAIN</div>
              </div>
            </div>
          `;

          // Render regular sauces
          const sauceCards = componentSauces.map((sauce, index) => {
            const isSelected = selectedSauceIds.includes(sauce.id);
            const selectionIndex = selectedSauceIds.indexOf(sauce.id);
            return `
              <div class="sauce-card ${isSelected ? 'selected' : ''}"
                   data-sauce-id="${sauce.id}"
                   data-wing-type="${wingType}">
                ${isSelected ? `<div class="sauce-badge">${selectionIndex + 1}</div>` : ''}
                <div class="sauce-card-image">
                  <img src="${sauce.imageUrl}"
                       alt="${sauce.name}"
                       loading="lazy"
                       onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%22%23f5f5f5%22 width=%22200%22 height=%22200%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-family=%22Arial%22 font-size=%2214%22 fill=%22%23999%22%3E${sauce.name}%3C/text%3E%3C/svg%3E'"
                       class="sauce-img">
                </div>
                <div class="sauce-card-content">
                  <div class="sauce-name">${sauce.name}</div>
                  <div class="sauce-heat">${getHeatDisplay(sauce.heatLevel)}</div>
                  ${sauce.isDryRub ? '<div class="sauce-type-tag dry-rub-tag">DRY RUB</div>' : ''}
                </div>
              </div>
            `;
          }).join('');

          return noSauceCard + sauceCards;
        })()}
      </div>

      <div class="distribution-section ${selectedSauceIds.length > 0 ? 'active' : ''}"
           id="distribution-section-${wingType}">
        <div class="distribution-header">
          <span>📊 Step 2:</span> Distribute your ${wingCount} wings across selected sauces
        </div>

        <table class="distribution-table">
          <tbody id="distribution-rows-${wingType}">
            ${selectedSauceIds.map((sauceId, index) => {
              const sauce = componentSauces.find(s => s.id === sauceId);
              if (!sauce) {
                console.warn(`⚠️ Sauce not found for ID: ${sauceId}`);
                return '';
              }
              const dist = distribution[sauceId] || { quantity: 0, application: 'tossed' };
              return renderDistributionRow(sauce, dist, index, wingType);
            }).filter(Boolean).join('')}
          </tbody>
        </table>

        <div class="remaining-counter" id="remaining-counter-${wingType}">
          <div class="remaining-label">Wings remaining to assign:</div>
          <div class="remaining-value" id="remaining-value-${wingType}">${wingCount}</div>
        </div>

        <div class="visual-preview">
          <div class="preview-title">
            <span>👁️</span> ${wingTypeDisplayName} Summary
          </div>
          <div class="preview-items" id="preview-items-${wingType}">
            <em>Assign wings to see summary...</em>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render a single distribution row
 */
function renderDistributionRow(sauce, dist, index, wingType) {
  // Handle "No Sauce" option
  if (sauce.id === 'no-sauce' || sauce === 'no-sauce') {
    return `
      <tr class="distribution-row">
        <td style="width: 30%;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="distribution-badge">${index + 1}</span>
            No Sauce (Plain)
          </div>
        </td>
        <td style="width: 35%;">
          <span style="font-weight: 600; color: #666;">Plain - No Sauce</span>
        </td>
        <td style="width: 35%;">
          <div class="quantity-input">
            <button class="quantity-btn decrease"
                    data-sauce-id="no-sauce"
                    data-wing-type="${wingType}"
                    data-action="decrease">−</button>
            <input type="number"
                   min="0"
                   value="${dist.quantity}"
                   data-sauce-id="no-sauce"
                   data-wing-type="${wingType}"
                   class="quantity-value"
                   readonly>
            <button class="quantity-btn increase"
                    data-sauce-id="no-sauce"
                    data-wing-type="${wingType}"
                    data-action="increase">+</button>
          </div>
        </td>
      </tr>
    `;
  }

  return `
    <tr class="distribution-row">
      <td style="width: 30%;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="distribution-badge">${index + 1}</span>
          ${sauce.name}
        </div>
      </td>
      <td style="width: 35%;">
        ${sauce.isDryRub
          ? `<div class="application-text">🧂 Dry Rub</div>`
          : `<div class="application-toggle">
              <button class="application-btn ${dist.application === 'tossed' ? 'active' : ''}"
                      data-sauce-id="${sauce.id}"
                      data-wing-type="${wingType}"
                      data-value="tossed">
                🌊 Tossed
              </button>
              <button class="application-btn ${dist.application === 'side' ? 'active' : ''}"
                      data-sauce-id="${sauce.id}"
                      data-wing-type="${wingType}"
                      data-value="side">
                📦 Side
              </button>
            </div>`
        }
      </td>
      <td style="width: 35%;">
        <div class="quantity-input">
          <button class="quantity-btn decrease"
                  data-sauce-id="${sauce.id}"
                  data-wing-type="${wingType}"
                  data-action="decrease">−</button>
          <input type="number"
                 min="0"
                 value="${dist.quantity}"
                 data-sauce-id="${sauce.id}"
                 data-wing-type="${wingType}"
                 class="quantity-value"
                 readonly>
          <button class="quantity-btn increase"
                  data-sauce-id="${sauce.id}"
                  data-wing-type="${wingType}"
                  data-action="increase">+</button>
        </div>
      </td>
    </tr>
  `;
}

/**
 * Initialize integrated sauce distribution interactions
 */
export function initIntegratedSauceDistribution(wingType, wingCount, onDistributionChange) {
  const distribution = {};
  const selectedSauceIds = [];
  let currentFilter = 'all';

  // Filter button handlers
  document.querySelectorAll(`.filter-btn[data-wing-type="${wingType}"]`).forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active state
      document.querySelectorAll(`.filter-btn[data-wing-type="${wingType}"]`).forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Update filter and re-render
      currentFilter = btn.dataset.filter;
      renderFilteredSauceGrid(wingType, selectedSauceIds, distribution, currentFilter);

      // Reattach sauce card listeners after re-render
      attachSauceCardListeners(wingType, wingCount, selectedSauceIds, distribution, onDistributionChange);
    });
  });

  // Sauce card click handlers
  attachSauceCardListeners(wingType, wingCount, selectedSauceIds, distribution, onDistributionChange);

  // Application method button toggle handlers
  document.querySelectorAll(`.application-btn[data-wing-type="${wingType}"]`).forEach(btn => {
    btn.addEventListener('click', (e) => {
      const sauceId = e.target.dataset.sauceId;
      const value = e.target.dataset.value;

      if (distribution[sauceId]) {
        // Update active state on buttons
        const container = e.target.parentElement;
        container.querySelectorAll('.application-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');

        // Update distribution data
        distribution[sauceId].application = value;
        updatePreview(wingType, selectedSauceIds, distribution);
        if (onDistributionChange) {
          onDistributionChange(getDistributionData(selectedSauceIds, distribution));
        }
      }
    });
  });

  // Quantity button handlers
  document.querySelectorAll(`.quantity-btn[data-wing-type="${wingType}"]`).forEach(btn => {
    btn.addEventListener('click', (e) => {
      const sauceId = e.target.dataset.sauceId;
      const action = e.target.dataset.action;

      if (!distribution[sauceId]) return;

      if (action === 'increase') {
        const remaining = getRemainingWings(wingType, wingCount, distribution);
        if (remaining >= 10) {
          distribution[sauceId].quantity += 10;
        }
      } else if (action === 'decrease') {
        if (distribution[sauceId].quantity >= 10) {
          distribution[sauceId].quantity -= 10;
        }
      }

      updateDistributionUI(wingType, wingCount, selectedSauceIds, distribution);
      if (onDistributionChange) {
        onDistributionChange(getDistributionData(selectedSauceIds, distribution));
      }
    });
  });
}

/**
 * Attach sauce card click listeners
 */
function attachSauceCardListeners(wingType, wingCount, selectedSauceIds, distribution, onDistributionChange) {
  document.querySelectorAll(`.sauce-card[data-wing-type="${wingType}"]`).forEach(card => {
    card.addEventListener('click', () => {
      const sauceId = card.dataset.sauceId;
      toggleSauceSelection(wingType, sauceId, wingCount, selectedSauceIds, distribution, onDistributionChange);
    });
  });
}

/**
 * Render filtered sauce grid
 */
function renderFilteredSauceGrid(wingType, selectedSauceIds, distribution, currentFilter) {
  const grid = document.getElementById(`sauce-grid-${wingType}`);
  if (!grid) return;

  // Filter sauces by heat level
  const filteredSauces = currentFilter === 'all'
    ? componentSauces
    : componentSauces.filter(sauce => sauce.heatLevel === parseInt(currentFilter));

  // Render No Sauce option first (always show)
  const noSauceSelected = selectedSauceIds.includes('no-sauce');
  const noSauceIndex = selectedSauceIds.indexOf('no-sauce');
  const noSauceCard = `
    <div class="sauce-card ${noSauceSelected ? 'selected' : ''}"
         data-sauce-id="no-sauce"
         data-wing-type="${wingType}">
      ${noSauceSelected ? `<div class="sauce-badge">${noSauceIndex + 1}</div>` : ''}
      <div class="sauce-card-image">
        <div class="no-sauce-image">
          <div class="no-sauce-icon">🍗</div>
        </div>
      </div>
      <div class="sauce-card-content">
        <div class="sauce-name">No Sauce</div>
        <div class="sauce-heat">Plain Wings</div>
        <div class="sauce-type-tag no-sauce-tag">PLAIN</div>
      </div>
    </div>
  `;

  // Render filtered sauces
  const sauceCards = filteredSauces.map(sauce => {
    const isSelected = selectedSauceIds.includes(sauce.id);
    const selectionIndex = selectedSauceIds.indexOf(sauce.id);
    return `
      <div class="sauce-card ${isSelected ? 'selected' : ''}"
           data-sauce-id="${sauce.id}"
           data-wing-type="${wingType}">
        ${isSelected ? `<div class="sauce-badge">${selectionIndex + 1}</div>` : ''}
        <div class="sauce-card-image">
          <img src="${sauce.imageUrl}"
               alt="${sauce.name}"
               loading="lazy"
               onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%22%23f5f5f5%22 width=%22200%22 height=%22200%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-family=%22Arial%22 font-size=%2214%22 fill=%22%23999%22%3E${sauce.name}%3C/text%3E%3C/svg%3E'"
               class="sauce-img">
        </div>
        <div class="sauce-card-content">
          <div class="sauce-name">${sauce.name}</div>
          <div class="sauce-heat">${getHeatDisplay(sauce.heatLevel)}</div>
          ${sauce.isDryRub ? '<div class="sauce-type-tag dry-rub-tag">DRY RUB</div>' : ''}
        </div>
      </div>
    `;
  }).join('');

  grid.innerHTML = noSauceCard + sauceCards;
}

/**
 * Toggle sauce selection
 */
function toggleSauceSelection(wingType, sauceId, wingCount, selectedSauceIds, distribution, onDistributionChange) {
  const index = selectedSauceIds.indexOf(sauceId);
  const maxSelections = maxSelectionsPerWingType[wingType] || 3;

  if (index > -1) {
    // Remove selection
    selectedSauceIds.splice(index, 1);
    delete distribution[sauceId];
  } else {
    // "No Sauce" doesn't count toward the sauce limit
    const actualSauceCount = selectedSauceIds.filter(id => id !== 'no-sauce').length;
    const isNoSauce = sauceId === 'no-sauce';

    if (isNoSauce || actualSauceCount < maxSelections) {
      selectedSauceIds.push(sauceId);
      distribution[sauceId] = {
        quantity: 0,
        application: 'tossed'
      };
    } else {
      return;
    }
  }

  updateSauceGrid(wingType, selectedSauceIds);
  updateDistributionTable(wingType, wingCount, selectedSauceIds, distribution);
  updateDistributionVisibility(wingType, selectedSauceIds);

  if (onDistributionChange) {
    onDistributionChange(getDistributionData(selectedSauceIds, distribution));
  }
}

/**
 * Update sauce grid UI
 */
function updateSauceGrid(wingType, selectedSauceIds) {
  document.querySelectorAll(`.sauce-card[data-wing-type="${wingType}"]`).forEach(card => {
    const sauceId = card.dataset.sauceId;
    const isSelected = selectedSauceIds.includes(sauceId);
    const index = selectedSauceIds.indexOf(sauceId);

    card.classList.toggle('selected', isSelected);

    // Update badge
    let badge = card.querySelector('.sauce-badge');
    if (isSelected) {
      if (!badge) {
        badge = document.createElement('div');
        badge.className = 'sauce-badge';
        card.insertBefore(badge, card.firstChild);
      }
      badge.textContent = index + 1;
    } else {
      if (badge) badge.remove();
    }
  });
}

/**
 * Update distribution table
 */
function updateDistributionTable(wingType, wingCount, selectedSauceIds, distribution) {
  const tbody = document.getElementById(`distribution-rows-${wingType}`);
  if (!tbody) return;

  tbody.innerHTML = selectedSauceIds.map((sauceId, index) => {
    // Handle "No Sauce" option
    if (sauceId === 'no-sauce') {
      const dist = distribution[sauceId];
      return renderDistributionRow('no-sauce', dist, index, wingType);
    }

    const sauce = componentSauces.find(s => s.id === sauceId);
    if (!sauce) {
      console.warn(`⚠️ Sauce not found for ID: ${sauceId}`);
      return '';
    }
    const dist = distribution[sauceId];
    return renderDistributionRow(sauce, dist, index, wingType);
  }).filter(Boolean).join('');

  // Reattach event listeners
  initDistributionRowHandlers(wingType, wingCount, selectedSauceIds, distribution);
}

/**
 * Initialize handlers for distribution rows
 */
function initDistributionRowHandlers(wingType, wingCount, selectedSauceIds, distribution) {
  // Application button toggle handlers
  document.querySelectorAll(`.application-btn[data-wing-type="${wingType}"]`).forEach(btn => {
    btn.addEventListener('click', (e) => {
      const sauceId = e.target.dataset.sauceId;
      const value = e.target.dataset.value;

      if (distribution[sauceId]) {
        // Update active state on buttons
        const container = e.target.parentElement;
        container.querySelectorAll('.application-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');

        // Update distribution data
        distribution[sauceId].application = value;
        updatePreview(wingType, selectedSauceIds, distribution);
      }
    });
  });

  // Quantity button handlers
  document.querySelectorAll(`.quantity-btn[data-wing-type="${wingType}"]`).forEach(btn => {
    btn.addEventListener('click', (e) => {
      const sauceId = e.target.dataset.sauceId;
      const action = e.target.dataset.action;

      if (!distribution[sauceId]) return;

      if (action === 'increase') {
        const remaining = getRemainingWings(wingType, wingCount, distribution);
        if (remaining >= 10) {
          distribution[sauceId].quantity += 10;
        }
      } else if (action === 'decrease') {
        if (distribution[sauceId].quantity >= 10) {
          distribution[sauceId].quantity -= 10;
        }
      }

      updateDistributionUI(wingType, wingCount, selectedSauceIds, distribution);
    });
  });
}

/**
 * Update distribution UI elements
 */
function updateDistributionUI(wingType, wingCount, selectedSauceIds, distribution) {
  // Update quantity inputs
  Object.keys(distribution).forEach(sauceId => {
    const input = document.querySelector(`.quantity-value[data-sauce-id="${sauceId}"][data-wing-type="${wingType}"]`);
    if (input) {
      input.value = distribution[sauceId].quantity;
    }
  });

  updateRemainingCounter(wingType, wingCount, distribution);
  updatePreview(wingType, selectedSauceIds, distribution);
}

/**
 * Update distribution section visibility
 */
function updateDistributionVisibility(wingType, selectedSauceIds) {
  const section = document.getElementById(`distribution-section-${wingType}`);
  if (section) {
    section.classList.toggle('active', selectedSauceIds.length > 0);
  }
}

/**
 * Get remaining wings count
 */
function getRemainingWings(wingType, wingCount, distribution) {
  const assigned = Object.values(distribution).reduce((sum, d) => sum + d.quantity, 0);
  return wingCount - assigned;
}

/**
 * Update remaining counter
 */
function updateRemainingCounter(wingType, wingCount, distribution) {
  const remaining = getRemainingWings(wingType, wingCount, distribution);
  const counter = document.getElementById(`remaining-counter-${wingType}`);
  const value = document.getElementById(`remaining-value-${wingType}`);

  if (value) value.textContent = remaining;

  if (counter) {
    counter.classList.remove('complete', 'over');
    if (remaining === 0) {
      counter.classList.add('complete');
    } else if (remaining < 0) {
      counter.classList.add('over');
    }
  }
}

/**
 * Update preview summary
 */
function updatePreview(wingType, selectedSauceIds, distribution) {
  const container = document.getElementById(`preview-items-${wingType}`);
  if (!container) return;

  const items = selectedSauceIds.map(sauceId => {
    const dist = distribution[sauceId];

    if (dist.quantity === 0) return '';

    // Handle "No Sauce" option
    if (sauceId === 'no-sauce') {
      return `
        <div class="preview-item">
          <strong>${dist.quantity}</strong> plain wings (no sauce)
        </div>
      `;
    }

    const sauce = componentSauces.find(s => s.id === sauceId);
    if (!sauce) return '';

    const applicationText = dist.application === 'side' ? 'on the side' :
                            sauce.isDryRub ? 'with dry rub' : 'tossed';

    return `
      <div class="preview-item">
        <strong>${dist.quantity}</strong> wings ${applicationText} in <strong>${sauce.name}</strong>
      </div>
    `;
  }).filter(Boolean).join('');

  container.innerHTML = items || '<em>Assign wings to see summary...</em>';
}

/**
 * Get distribution data for state management
 */
function getDistributionData(selectedSauceIds, distribution) {
  return selectedSauceIds.map(sauceId => ({
    sauceId,
    quantity: distribution[sauceId].quantity,
    application: distribution[sauceId].application
  }));
}

/**
 * Fetch sauces from Firestore
 */
async function fetchSauces() {
  try {
    const q = query(collection(db, 'sauces'), where('active', '==', true));
    const snapshot = await getDocs(q);
    componentSauces = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(sauce => sauce.category !== 'dipping-sauce')
      .sort((a, b) => a.sortOrder - b.sortOrder);

    console.log('✅ Loaded', componentSauces.length, 'sauces for integrated distribution');
  } catch (error) {
    console.error('❌ Error fetching sauces:', error);
    componentSauces = [];
  }
}

/**
 * Get heat display string
 */
function getHeatDisplay(level) {
  const peppers = '🌶️'.repeat(Math.min(level, 5));
  return peppers || 'No Heat';
}

/**
 * Get wing type display name
 */
function getWingTypeDisplayName(wingType) {
  const names = {
    boneless: 'Boneless Wings',
    boneIn: 'Bone-In Wings',
    cauliflower: 'Cauliflower Wings'
  };
  return names[wingType] || wingType;
}

/**
 * Get sauce data by ID (for enriching sauce assignments)
 * @param {string} sauceId - Sauce ID to lookup
 * @returns {Object|null} Sauce data or null if not found
 */
export function getSauceById(sauceId) {
  return componentSauces.find(s => s.id === sauceId) || null;
}

/**
 * Determine sauce viscosity based on sauce properties
 * @param {Object} sauce - Sauce data
 * @returns {string} 'thin'|'thick'|'creamy'|'dry'
 */
export function determineSauceViscosity(sauce) {
  if (!sauce) return 'thin';

  if (sauce.isDryRub) return 'dry';

  // Creamy sauces
  if (sauce.category === 'creamy' ||
      sauce.name?.toLowerCase().includes('ranch') ||
      sauce.name?.toLowerCase().includes('garlic parm') ||
      sauce.name?.toLowerCase().includes('garlic parmesan')) {
    return 'creamy';
  }

  // Thick sauces
  if (sauce.name?.toLowerCase().includes('bbq') ||
      sauce.name?.toLowerCase().includes('teriyaki') ||
      sauce.name?.toLowerCase().includes('honey')) {
    return 'thick';
  }

  // Default to thin (Buffalo, Hot, etc.)
  return 'thin';
}
