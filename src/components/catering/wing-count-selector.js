/**
 * Wing Count Selector Component
 * Allows selection of 6, 10, or 12 wings with dynamic pricing
 */

/**
 * Render wing count selector with preset buttons
 */
export function renderWingCountSelector(selectedCount = 6) {
  const counts = [
    {
      count: 6,
      label: '6 Wings',
      description: 'Individual serving',
      basePrice: 0,  // Base price
      popular: false
    },
    {
      count: 10,
      label: '10 Wings',
      description: 'Hearty portion',
      basePrice: 3.00,  // +$3.00
      popular: true,
      badge: 'Popular'
    },
    {
      count: 12,
      label: '12 Wings',
      description: 'Max value',
      basePrice: 4.50,  // +$4.50
      popular: false,
      badge: 'Best Value'
    }
  ];

  return `
    <div class="wing-count-selector config-section">
      <div class="section-header">
        <h4 class="section-title">🍗 Wing Quantity</h4>
        <p class="section-subtitle">Choose how many wings per box</p>
      </div>

      <div class="count-presets">
        ${counts.map(option => renderCountButton(option, selectedCount)).join('')}
      </div>

      ${selectedCount >= 10 ? renderMultiSauceOption() : ''}
    </div>
  `;
}

/**
 * Render individual count button
 */
function renderCountButton(option, selectedCount) {
  const isSelected = option.count === selectedCount;

  return `
    <button
      class="preset-btn ${isSelected ? 'preset-active' : ''}"
      data-wing-count="${option.count}"
      type="button">

      ${option.badge ? `<span class="preset-badge">${option.badge}</span>` : ''}

      <div class="preset-main">
        <span class="preset-count">${option.count}</span>
        <span class="preset-label">Wings</span>
      </div>

      <div class="preset-details">
        <span class="preset-description">${option.description}</span>
        ${option.basePrice > 0 ? `
          <span class="preset-price">+$${option.basePrice.toFixed(2)}</span>
        ` : `
          <span class="preset-price">Base price</span>
        `}
      </div>
    </button>
  `;
}

/**
 * Render multi-sauce option for 10+ wings
 */
function renderMultiSauceOption() {
  return `
    <div class="multi-sauce-toggle">
      <label class="toggle-label">
        <input
          type="checkbox"
          id="split-sauces-toggle"
          class="toggle-input">
        <span class="toggle-text">
          Split into 2 sauces
          <span class="toggle-hint">Mix flavors in one box</span>
        </span>
      </label>
    </div>
  `;
}

/**
 * Render sauce split selector (when multi-sauce enabled)
 */
export function renderSauceSplitSelector(wingCount, sauces = [], availableSauces = []) {
  // Ensure we have 2 sauce slots
  const sauce1 = sauces[0] || { id: null, count: Math.ceil(wingCount / 2) };
  const sauce2 = sauces[1] || { id: null, count: Math.floor(wingCount / 2) };

  return `
    <div class="sauce-split-selector">
      <div class="split-header">
        <h5>Split Your Sauces</h5>
        <p class="split-subtitle">Total: ${wingCount} wings</p>
      </div>

      <div class="split-rows">
        <!-- Sauce 1 -->
        <div class="split-row">
          <div class="split-label">
            <span class="split-number">1</span>
            <span>First Sauce</span>
          </div>

          <div class="split-controls">
            <label class="split-count-label">
              <input
                type="number"
                class="split-count-input"
                data-sauce-index="0"
                value="${sauce1.count}"
                min="1"
                max="${wingCount - 1}">
              <span>wings</span>
            </label>

            <select
              class="split-sauce-select"
              data-sauce-index="0"
              aria-label="Select first sauce">
              <option value="">Choose sauce...</option>
              ${availableSauces.map(sauce => `
                <option
                  value="${sauce.id}"
                  ${sauce.id === sauce1.id ? 'selected' : ''}>
                  ${sauce.name} ${sauce.heatLevel ? '🌶️'.repeat(sauce.heatLevel) : ''}
                </option>
              `).join('')}
            </select>
          </div>
        </div>

        <!-- Sauce 2 -->
        <div class="split-row">
          <div class="split-label">
            <span class="split-number">2</span>
            <span>Second Sauce</span>
          </div>

          <div class="split-controls">
            <label class="split-count-label">
              <input
                type="number"
                class="split-count-input"
                data-sauce-index="1"
                value="${sauce2.count}"
                min="1"
                max="${wingCount - 1}"
                readonly>
              <span>wings</span>
            </label>

            <select
              class="split-sauce-select"
              data-sauce-index="1"
              aria-label="Select second sauce">
              <option value="">Choose sauce...</option>
              ${availableSauces.map(sauce => `
                <option
                  value="${sauce.id}"
                  ${sauce.id === sauce2.id ? 'selected' : ''}>
                  ${sauce.name} ${sauce.heatLevel ? '🌶️'.repeat(sauce.heatLevel) : ''}
                </option>
              `).join('')}
            </select>
          </div>
        </div>
      </div>

      <div class="split-hint">
        <span class="hint-icon">💡</span>
        <span>Adjust the first sauce count - the second will auto-balance</span>
      </div>
    </div>
  `;
}

/**
 * Initialize wing count selector interactions
 */
export function initWingCountSelector(onCountChange, onSplitToggle) {
  // Wing count button clicks
  document.querySelectorAll('[data-wing-count]').forEach(btn => {
    btn.addEventListener('click', () => {
      const count = parseInt(btn.dataset.wingCount);
      onCountChange(count);
    });
  });

  // Split sauces toggle
  const splitToggle = document.getElementById('split-sauces-toggle');
  if (splitToggle) {
    splitToggle.addEventListener('change', (e) => {
      onSplitToggle(e.target.checked);
    });
  }
}

/**
 * Initialize sauce split selector interactions
 */
export function initSauceSplitSelector(wingCount, onSplitChange) {
  // Sauce count input (first sauce)
  const countInput = document.querySelector('.split-count-input[data-sauce-index="0"]');
  if (countInput) {
    countInput.addEventListener('input', (e) => {
      const count1 = parseInt(e.target.value) || 0;
      const count2 = wingCount - count1;

      // Update second sauce count
      const count2Input = document.querySelector('.split-count-input[data-sauce-index="1"]');
      if (count2Input) {
        count2Input.value = count2;
      }

      // Get selected sauces
      const sauce1Select = document.querySelector('.split-sauce-select[data-sauce-index="0"]');
      const sauce2Select = document.querySelector('.split-sauce-select[data-sauce-index="1"]');

      onSplitChange({
        sauces: [
          { id: sauce1Select?.value, count: count1 },
          { id: sauce2Select?.value, count: count2 }
        ]
      });
    });
  }

  // Sauce selection dropdowns
  document.querySelectorAll('.split-sauce-select').forEach(select => {
    select.addEventListener('change', () => {
      const sauce1Select = document.querySelector('.split-sauce-select[data-sauce-index="0"]');
      const sauce2Select = document.querySelector('.split-sauce-select[data-sauce-index="1"]');
      const count1Input = document.querySelector('.split-count-input[data-sauce-index="0"]');
      const count2Input = document.querySelector('.split-count-input[data-sauce-index="1"]');

      onSplitChange({
        sauces: [
          { id: sauce1Select?.value, count: parseInt(count1Input?.value) || 0 },
          { id: sauce2Select?.value, count: parseInt(count2Input?.value) || 0 }
        ]
      });
    });
  });
}

/**
 * Get pricing for wing count
 */
export function getWingCountPrice(count) {
  const pricing = {
    6: 0,
    10: 3.00,
    12: 4.50
  };
  return pricing[count] || 0;
}
