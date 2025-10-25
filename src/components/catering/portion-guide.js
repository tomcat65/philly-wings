/**
 * Portion Size Guide Component
 * Helps customers estimate food quantities based on group size
 */

/**
 * Portion size recommendations data
 */
const portionGuideData = {
  appetiteTypes: [
    {
      type: 'Light',
      icon: '🥗',
      description: 'Snack or light meal',
      wingsPerPerson: 6,
      examples: ['Afternoon snack', 'Light appetizer', 'Side dish']
    },
    {
      type: 'Moderate',
      icon: '🍴',
      description: 'Regular meal',
      wingsPerPerson: 10,
      examples: ['Lunch', 'Casual dinner', 'Office party']
    },
    {
      type: 'Hearty',
      icon: '🍗',
      description: 'Full meal with sides',
      wingsPerPerson: 15,
      examples: ['Game day', 'Full dinner', 'Sports event']
    }
  ],

  peopleRanges: [
    { min: 10, max: 15, wings: { light: 60, moderate: 100, hearty: 150 } },
    { min: 15, max: 25, wings: { light: 100, moderate: 175, hearty: 250 } },
    { min: 25, max: 50, wings: { light: 175, moderate: 350, hearty: 525 } },
    { min: 50, max: 75, wings: { light: 350, moderate: 625, hearty: 900 } },
    { min: 75, max: 100, wings: { light: 525, moderate: 875, hearty: 1300 } }
  ],

  tips: [
    {
      icon: '💡',
      title: 'Order extra for big eaters',
      text: 'Sports fans and game day events typically require 20-30% more food.'
    },
    {
      icon: '🥤',
      title: 'Don\'t forget drinks',
      text: 'Plan for 2-3 beverages per person for events lasting 2+ hours.'
    },
    {
      icon: '🥗',
      title: 'Sides fill people up',
      text: 'Adding salads, desserts, or other sides can reduce wing portions by 20%.'
    },
    {
      icon: '🌱',
      title: 'Dietary restrictions',
      text: 'Order 10-15% extra plant-based options if you have vegetarian/vegan guests.'
    }
  ]
};

/**
 * Render portion size guide modal
 * @returns {string} HTML string
 */
export function renderPortionGuide() {
  return `
    <div id="portion-guide-modal" class="portion-guide-modal" style="display: none;">
      <div class="portion-guide-overlay" onclick="closePortionGuide()"></div>

      <div class="portion-guide-content">
        <button class="portion-guide-close" onclick="closePortionGuide()" aria-label="Close">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M18 6L6 18M6 6l12 12" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>

        <div class="portion-guide-header">
          <h2>Portion Size Guide</h2>
          <p>Not sure how much to order? We've got you covered!</p>
        </div>

        <div class="portion-guide-body">
          <!-- Appetite Types -->
          <div class="appetite-types">
            <h3>Choose Your Appetite Level</h3>
            <div class="appetite-grid">
              ${portionGuideData.appetiteTypes.map(appetite => `
                <div class="appetite-card">
                  <div class="appetite-icon">${appetite.icon}</div>
                  <h4 class="appetite-type">${appetite.type}</h4>
                  <p class="appetite-desc">${appetite.description}</p>
                  <div class="appetite-wings">
                    <strong>${appetite.wingsPerPerson}</strong> wings/person
                  </div>
                  <div class="appetite-examples">
                    ${appetite.examples.map(ex => `<span>${ex}</span>`).join('')}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Portion Calculator -->
          <div class="portion-calculator">
            <h3>Quick Portion Calculator</h3>
            <div class="calculator-inputs">
              <div class="input-group">
                <label for="portion-people-count">Number of people</label>
                <input
                  type="number"
                  id="portion-people-count"
                  min="10"
                  max="200"
                  value="25"
                  oninput="updatePortionCalculation()"
                />
              </div>
              <div class="input-group">
                <label for="portion-appetite">Appetite level</label>
                <select id="portion-appetite" onchange="updatePortionCalculation()">
                  <option value="6">Light (6 wings/person)</option>
                  <option value="10" selected>Moderate (10 wings/person)</option>
                  <option value="15">Hearty (15 wings/person)</option>
                </select>
              </div>
            </div>
            <div class="calculator-result" id="portion-calculation-result">
              <div class="result-icon">🍗</div>
              <div class="result-text">
                <strong id="total-wings">250</strong> wings recommended
              </div>
              <p class="result-subtitle">That's about 21 pounds of delicious wings!</p>
            </div>
          </div>

          <!-- Portion Table -->
          <div class="portion-table-section">
            <h3>Wings Per Group Size</h3>
            <div class="portion-table-wrapper">
              <table class="portion-table">
                <thead>
                  <tr>
                    <th>People</th>
                    <th>Light (6/person)</th>
                    <th>Moderate (10/person)</th>
                    <th>Hearty (15/person)</th>
                  </tr>
                </thead>
                <tbody>
                  ${portionGuideData.peopleRanges.map(range => `
                    <tr>
                      <td><strong>${range.min}-${range.max}</strong></td>
                      <td>${range.wings.light} wings</td>
                      <td>${range.wings.moderate} wings</td>
                      <td>${range.wings.hearty} wings</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <!-- Pro Tips -->
          <div class="portion-tips">
            <h3>Pro Tips from Our Catering Team</h3>
            <div class="tips-grid">
              ${portionGuideData.tips.map(tip => `
                <div class="tip-card">
                  <div class="tip-icon">${tip.icon}</div>
                  <div class="tip-content">
                    <h4>${tip.title}</h4>
                    <p>${tip.text}</p>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- CTA -->
          <div class="portion-guide-cta">
            <button class="btn-primary" onclick="closePortionGuideAndStartOrder()">
              Got it! Let's Order
            </button>
            <button class="btn-secondary" onclick="closePortionGuide()">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render inline portion guide (compact version for package pages)
 * @returns {string} HTML string
 */
export function renderInlinePortionGuide() {
  return `
    <div class="portion-guide-inline">
      <div class="inline-header">
        <h4>Need help choosing?</h4>
        <button class="inline-trigger" onclick="openPortionGuide()">
          View Portion Guide
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
      <div class="inline-quick-tips">
        ${portionGuideData.appetiteTypes.map(appetite => `
          <div class="inline-tip">
            <span class="inline-tip-icon">${appetite.icon}</span>
            <span class="inline-tip-text">
              <strong>${appetite.type}:</strong> ${appetite.wingsPerPerson} wings/person
            </span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

/**
 * Open portion guide modal
 */
export function openPortionGuide() {
  const modal = document.getElementById('portion-guide-modal');
  if (modal) {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // Initialize calculation
    updatePortionCalculation();

    // Track analytics
    if (window.gtag) {
      gtag('event', 'portion_guide_opened', {
        source: 'catering_page'
      });
    }
  }
}

/**
 * Close portion guide modal
 */
window.closePortionGuide = function() {
  const modal = document.getElementById('portion-guide-modal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }
};

/**
 * Close and start order flow
 */
window.closePortionGuideAndStartOrder = function() {
  window.closePortionGuide();

  // Scroll to guided planner
  if (window.scrollToPlanner) {
    setTimeout(() => window.scrollToPlanner(), 300);
  }
};

/**
 * Update portion calculation based on inputs
 */
window.updatePortionCalculation = function() {
  const peopleInput = document.getElementById('portion-people-count');
  const appetiteSelect = document.getElementById('portion-appetite');
  const resultEl = document.getElementById('portion-calculation-result');
  const totalWingsEl = document.getElementById('total-wings');

  if (!peopleInput || !appetiteSelect || !totalWingsEl) return;

  const people = parseInt(peopleInput.value) || 0;
  const wingsPerPerson = parseInt(appetiteSelect.value) || 10;
  const totalWings = people * wingsPerPerson;
  const pounds = Math.round(totalWings / 12); // Approx 12 wings per pound

  totalWingsEl.textContent = totalWings;

  const subtitleEl = resultEl.querySelector('.result-subtitle');
  if (subtitleEl) {
    subtitleEl.textContent = `That's about ${pounds} pounds of delicious wings!`;
  }

  // Add animation
  resultEl.classList.remove('result-updated');
  void resultEl.offsetWidth; // Trigger reflow
  resultEl.classList.add('result-updated');
};

// Make openPortionGuide available globally
window.openPortionGuide = openPortionGuide;
