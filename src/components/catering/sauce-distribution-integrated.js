/**
 * Integrated Sauce Distribution Component
 * Combines sauce selection with quantity distribution per wing type
 * Based on validated mockup: sauce-distribution-mockup.html
 */

import { db } from '../../firebase-config.js';
import { collection, query, where, getDocs } from 'firebase/firestore';
import '../../styles/sauce-photo-card-selector.css';

let componentSauces = [];
let wingTypes = [];

/**
 * Render integrated sauce distribution for a wing type
 * @param {Object} options - Configuration options
 * @param {string} options.wingType - Wing type ID (boneless, boneIn, cauliflower)
 * @param {number} options.wingCount - Total wings for this type
 * @param {Array} options.preSelectedData - Pre-selected sauce distribution data
 * @param {Function} options.onDistributionChange - Callback when distribution changes
 * @returns {Promise<string>} HTML string
 */
export async function renderIntegratedSauceDistribution(options) {
  const {
    wingType,
    wingCount,
    preSelectedData = [],
    onDistributionChange
  } = options;

  // Fetch sauces if not already loaded
  if (componentSauces.length === 0) {
    await fetchSauces();
  }

  const wingTypeDisplayName = getWingTypeDisplayName(wingType);
  const maxSelections = 3;

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
        <strong>Step 1:</strong> Select up to ${maxSelections} sauces for your ${wingTypeDisplayName.toLowerCase()} (click to add/remove)
      </div>

      <div class="sauce-grid" id="sauce-grid-${wingType}">
        ${componentSauces.map((sauce, index) => {
          const isSelected = selectedSauceIds.includes(sauce.id);
          const selectionIndex = selectedSauceIds.indexOf(sauce.id);
          return `
            <div class="sauce-card ${isSelected ? 'selected' : ''}"
                 data-sauce-id="${sauce.id}"
                 data-wing-type="${wingType}">
              ${isSelected ? `<div class="sauce-badge">${selectionIndex + 1}</div>` : ''}
              <div class="sauce-card-image" style="background-image: url('${sauce.imageUrl}')"></div>
              <div class="sauce-card-content">
                <div class="sauce-name">${sauce.name}</div>
                <div class="sauce-heat">${getHeatDisplay(sauce.heatLevel)}</div>
                ${sauce.isDryRub ? '<div class="sauce-type-tag dry-rub-tag">DRY RUB</div>' : ''}
              </div>
            </div>
          `;
        }).join('')}
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
              const dist = distribution[sauceId] || { quantity: 0, application: 'tossed' };
              return renderDistributionRow(sauce, dist, index, wingType);
            }).join('')}
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
  return `
    <tr class="distribution-row">
      <td style="width: 30%;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="distribution-badge">${index + 1}</span>
          ${sauce.name}
        </div>
      </td>
      <td style="width: 35%;">
        <select class="application-select"
                data-sauce-id="${sauce.id}"
                data-wing-type="${wingType}">
          <option value="tossed" ${dist.application === 'tossed' ? 'selected' : ''}>
            ${sauce.isDryRub ? '🧂 Dry Rub' : '🌊 Tossed in Sauce'}
          </option>
          ${!sauce.isDryRub ? `<option value="side" ${dist.application === 'side' ? 'selected' : ''}>📦 On the Side</option>` : ''}
        </select>
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

  // Sauce card click handlers
  document.querySelectorAll(`.sauce-card[data-wing-type="${wingType}"]`).forEach(card => {
    card.addEventListener('click', () => {
      const sauceId = card.dataset.sauceId;
      toggleSauceSelection(wingType, sauceId, wingCount, selectedSauceIds, distribution, onDistributionChange);
    });
  });

  // Application method change handlers
  document.querySelectorAll(`.application-select[data-wing-type="${wingType}"]`).forEach(select => {
    select.addEventListener('change', (e) => {
      const sauceId = e.target.dataset.sauceId;
      if (distribution[sauceId]) {
        distribution[sauceId].application = e.target.value;
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
 * Toggle sauce selection
 */
function toggleSauceSelection(wingType, sauceId, wingCount, selectedSauceIds, distribution, onDistributionChange) {
  const index = selectedSauceIds.indexOf(sauceId);
  const maxSelections = 3;

  if (index > -1) {
    // Remove selection
    selectedSauceIds.splice(index, 1);
    delete distribution[sauceId];
  } else {
    // Add selection
    if (selectedSauceIds.length < maxSelections) {
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
    const sauce = componentSauces.find(s => s.id === sauceId);
    const dist = distribution[sauceId];
    return renderDistributionRow(sauce, dist, index, wingType);
  }).join('');

  // Reattach event listeners
  initDistributionRowHandlers(wingType, wingCount, selectedSauceIds, distribution);
}

/**
 * Initialize handlers for distribution rows
 */
function initDistributionRowHandlers(wingType, wingCount, selectedSauceIds, distribution) {
  // Application select handlers
  document.querySelectorAll(`.application-select[data-wing-type="${wingType}"]`).forEach(select => {
    select.addEventListener('change', (e) => {
      const sauceId = e.target.dataset.sauceId;
      if (distribution[sauceId]) {
        distribution[sauceId].application = e.target.value;
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
    const sauce = componentSauces.find(s => s.id === sauceId);
    const dist = distribution[sauceId];

    if (dist.quantity === 0) return '';

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
