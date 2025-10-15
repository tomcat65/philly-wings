import { renderVegetarianAddOns, renderDessertsAddOns, renderStickySummary } from './add-ons-selector.js';
import { initAccordion } from './accordion-state.js';

/**
 * Interactive Package Configurator
 * Allows customers to customize wing types, sauces, desserts, and add-ons
 */

export function renderPackageConfigurator(packageData, tierAddOns = { vegetarian: [], desserts: [] }) {
  if (typeof window !== 'undefined') {
    window.addOnsDataCache = window.addOnsDataCache || {};
    [...(tierAddOns.vegetarian || []), ...(tierAddOns.desserts || [])].forEach(addOn => {
      window.addOnsDataCache[addOn.id] = addOn;
    });
  }

  const vegetarianHtml = renderVegetarianAddOns(tierAddOns.vegetarian || [], packageData.tier, packageData.id);
  const dessertsHtml = renderDessertsAddOns(tierAddOns.desserts || [], packageData.tier, packageData.id);

  return `
    <div class="package-configurator" id="configurator-${packageData.id}">
      <div class="configurator-header">
        <h3>${packageData.name}</h3>
        <p class="serves-count">Serves ${packageData.servesMin}-${packageData.servesMax} people • ${packageData.wingOptions.totalWings} wings</p>
      </div>

      ${renderProgressIndicator(packageData.id)}

      <div class="configurator-body two-column">
        <div class="configurator-main">
          ${renderWingTypeSelector(packageData)}
          ${renderSauceSelector(packageData)}
          ${renderAddOnsStep(vegetarianHtml, dessertsHtml, packageData.id)}
          ${renderDipsPreview(packageData)}
          ${renderPackageSummary(packageData)}
        </div>
        ${renderStickySummary(packageData, packageData.id)}
      </div>

      <div class="configurator-footer">
        <button class="btn-primary btn-large" onclick="window.open('https://www.ezcater.com/brand/pvt/philly-wings-express', '_blank')">
          Order This Package on ezCater →
        </button>
        <p class="configurator-note">24-hour advance notice required • Pricing shown at checkout</p>
      </div>
    </div>
    <script>
      window.selectedAddOns = window.selectedAddOns || {};
      window.selectedAddOns['${packageData.id}'] = window.selectedAddOns['${packageData.id}'] || [];
      if (window.updateStickySummary) {
        window.updateStickySummary('${packageData.id}');
      }

      // Quick Pick: Recommended sauces based on heat levels
      window.selectRecommendedSauces = function(packageId, maxSauces) {
        const recommendedIds = {
          3: ['garlic-parmesan', 'mild-buffalo', 'philly-classic-hot'],
          4: ['garlic-parmesan', 'mild-buffalo', 'philly-classic-hot', 'northeast-hot-lemon'],
          5: ['garlic-parmesan', 'tailgate-bbq', 'mild-buffalo', 'philly-classic-hot', 'northeast-hot-lemon']
        };

        const saucesToSelect = recommendedIds[maxSauces] || recommendedIds[3];
        const sauceCards = document.querySelectorAll(\`.sauce-card[data-package="\${packageId}"]\`);

        // First, deselect all
        sauceCards.forEach(card => {
          card.classList.remove('selected');
          const checkbox = card.querySelector('input[type="checkbox"]');
          if (checkbox) checkbox.checked = false;
        });

        // Then select recommended ones
        saucesToSelect.forEach(sauceId => {
          const card = document.querySelector(\`.sauce-card[data-sauce-id="\${sauceId}"][data-package="\${packageId}"]\`);
          if (card) {
            card.classList.add('selected');
            const checkbox = card.querySelector('input[type="checkbox"]');
            if (checkbox) {
              checkbox.checked = true;
              checkbox.dispatchEvent(new Event('change', { bubbles: true }));
            }
          }
        });

        updateEncouragementMessage(packageId, maxSauces);
      };

      // Update encouragement message based on selection progress
      window.updateEncouragementMessage = function(packageId, maxSauces) {
        const encouragement = document.getElementById(\`encouragement-\${packageId}\`);
        if (!encouragement) return;

        const selectedCount = document.querySelectorAll(\`.sauce-card[data-package="\${packageId}"].selected\`).length;

        if (selectedCount === 0) {
          encouragement.textContent = \`👆 Pick \${maxSauces} sauces that match your team's taste preferences\`;
          encouragement.className = 'encouragement-message';
        } else if (selectedCount < maxSauces - 1) {
          encouragement.textContent = \`✅ Great start! Pick \${maxSauces - selectedCount} more sauces\`;
          encouragement.className = 'encouragement-message encouragement-progress';
        } else if (selectedCount === maxSauces - 1) {
          encouragement.textContent = \`🎯 Almost there! Pick 1 more sauce to continue\`;
          encouragement.className = 'encouragement-message encouragement-almost';
        } else if (selectedCount === maxSauces) {
          encouragement.textContent = \`🎉 Perfect selection! Your team will love this variety\`;
          encouragement.className = 'encouragement-message encouragement-complete';
        } else {
          encouragement.textContent = \`⚠️ You've selected too many! Remove \${selectedCount - maxSauces} sauce(s)\`;
          encouragement.className = 'encouragement-message encouragement-error';
        }
      };
    </script>
  `;
}

/**
 * Progress Indicator - Visual stepper showing current step
 */
function renderProgressIndicator(packageId) {
  return `
    <div class="progress-indicator" id="progress-${packageId}">
      <div class="progress-step progress-step-active" data-step="1">
        <div class="progress-circle">
          <span class="step-number">1</span>
          <span class="step-checkmark">✓</span>
        </div>
        <span class="progress-label">Wing Type</span>
      </div>

      <div class="progress-connector"></div>

      <div class="progress-step" data-step="2">
        <div class="progress-circle">
          <span class="step-number">2</span>
          <span class="step-checkmark">✓</span>
        </div>
        <span class="progress-label">Sauces</span>
      </div>

      <div class="progress-connector"></div>

      <div class="progress-step" data-step="3">
        <div class="progress-circle">
          <span class="step-number">3</span>
          <span class="step-checkmark">✓</span>
        </div>
        <span class="progress-label">Add-Ons</span>
      </div>
    </div>
  `;
}

/**
 * Wing Type Selector - Choose bone-in, boneless, cauliflower, or mixed
 */
function renderWingTypeSelector(packageData) {
  const { totalWings, allowMixed, types, boneInOptions } = packageData.wingOptions;

  return `
    <div class="configurator-section wing-type-section step-expanded"
         data-step="1"
         data-package="${packageData.id}"
         data-total-wings="${totalWings}"
         aria-expanded="true">

      <!-- Collapsed Summary (hidden when expanded) -->
      <div class="step-summary">
        <div class="step-summary-main">
          <span class="step-checkmark">✓</span>
          <span class="step-summary-text">Wing type selected</span>
        </div>
        <button class="step-edit-btn" data-step="1" data-package="${packageData.id}" aria-label="Edit wing type selection">
          Edit
        </button>
      </div>

      <!-- Expanded Content -->
      <div class="step-content">
        <div class="section-label">
          <h4 class="step-heading">🍗 Step 1: Choose Your Wing Style</h4>
          <span class="required-badge">Required</span>
        </div>

        <p class="section-description step-description">
          Select your preferred wing style for all ${totalWings} wings
        </p>

        <div class="wing-type-options">
        <!-- Bone-In Option -->
        <label class="wing-type-card" data-wing-type="bone-in">
          <input type="radio" name="wing-type-${packageData.id}" value="bone-in" checked onchange="trackWingTypeSelection('${packageData.id}', 'bone-in')">
          <div class="card-content">
            <div class="card-icon">🍗</div>
            <h5>Classic Bone-In</h5>
            <p class="card-description">Traditional wings with the bone - authentic flavor</p>
            <div class="wing-sub-options" id="bone-in-options-${packageData.id}">
              <p class="sub-label">Choose your cut:</p>
              <label class="sub-option">
                <input type="radio" name="bone-in-cut-${packageData.id}" value="mixed" checked>
                <span>Mixed (Flats & Drums)</span>
              </label>
              <label class="sub-option">
                <input type="radio" name="bone-in-cut-${packageData.id}" value="flats">
                <span>Flats Only</span>
              </label>
              <label class="sub-option">
                <input type="radio" name="bone-in-cut-${packageData.id}" value="drums">
                <span>Drums Only</span>
              </label>
            </div>
          </div>
        </label>

        <!-- Boneless Option -->
        <label class="wing-type-card" data-wing-type="boneless">
          <input type="radio" name="wing-type-${packageData.id}" value="boneless" onchange="trackWingTypeSelection('${packageData.id}', 'boneless')">
          <div class="card-content">
            <div class="card-icon">🍖</div>
            <h5>Boneless</h5>
            <p class="card-description">Tender, juicy, no mess - perfect for meetings</p>
            <p class="card-note">All ${totalWings} wings boneless</p>
          </div>
        </label>

        <!-- Cauliflower Wings Option -->
        <label class="wing-type-card" data-wing-type="cauliflower">
          <input type="radio" name="wing-type-${packageData.id}" value="cauliflower" onchange="trackWingTypeSelection('${packageData.id}', 'cauliflower')">
          <div class="card-content">
            <span class="dietary-badge dietary-badge--vegan">🌱 VEGAN</span>
            <div class="card-icon">🥦</div>
            <h5>Cauliflower Wings</h5>
            <p class="card-description">Plant-based perfection - crispy, delicious, guilt-free</p>
            <p class="card-note vegan-note">All ${totalWings} pieces • 100% vegan</p>
          </div>
        </label>

        <!-- Mixed Option (if allowed) -->
        ${allowMixed ? `
        <label class="wing-type-card" data-wing-type="mixed">
          <input type="radio" name="wing-type-${packageData.id}" value="mixed" onchange="trackWingTypeSelection('${packageData.id}', 'mixed')">
          <div class="card-content">
            <div class="card-icon">🔥</div>
            <h5>Mix & Match</h5>
            <p class="card-description">Can't decide? Get the best of both worlds</p>
            <p class="card-note">${totalWings / 2} bone-in + ${totalWings / 2} boneless</p>
          </div>
        </label>
        ` : ''}
      </div>
      </div><!-- end step-content -->
    </div>
  `;
}

/**
 * Sauce Selector - Multi-select with images
 */
function renderSauceSelector(packageData) {
  const { min, max } = packageData.sauceSelections;

  // Fetch sauces from our data
  const dryRubs = [
    { id: 'classic-lemon-pepper', name: 'Classic Lemon Pepper', heat: 1, image: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Flemon-pepper-dry-rub.png?alt=media' },
    { id: 'northeast-hot-lemon', name: 'Northeast Hot Lemon', heat: 2, image: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fnortheast-hot-lemon.png?alt=media' },
    { id: 'frankford-cajun', name: 'Frankford Cajun', heat: 2, image: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fcajun-dry-rub.png?alt=media' },
    { id: 'garlic-parmesan', name: 'Garlic Parmesan', heat: 0, image: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fgarlic-parmesan-dry-rub.png?alt=media' }
  ];

  const wetSauces = [
    { id: 'sweet-teriyaki', name: 'Sweet Teriyaki', heat: 0, image: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fteriyaki-sauced.png?alt=media' },
    { id: 'tailgate-bbq', name: 'Tailgate BBQ', heat: 0, image: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fbbq-sauced.png?alt=media' },
    { id: 'mild-buffalo', name: 'Mild Buffalo', heat: 1, image: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fbuffalo-sauced.png?alt=media' },
    { id: 'philly-classic-hot', name: 'Philly Classic Hot', heat: 3, image: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fphilly-classic-hot-new.png?alt=media' },
    { id: 'broad-pattison-burn', name: 'Broad & Pattison Burn', heat: 4, image: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fbroad-pattison-burn.png?alt=media' },
    { id: 'grittys-revenge', name: "Gritty's Revenge", heat: 5, image: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fgrittys-revenge.png?alt=media' }
  ];

  return `
    <div class="configurator-section sauce-selector-section step-collapsed"
         data-step="2"
         data-package="${packageData.id}"
         aria-expanded="false">

      <!-- Collapsed Summary (shown when collapsed) -->
      <div class="step-summary">
        <div class="step-summary-main">
          <span class="step-checkmark">✓</span>
          <span class="step-summary-text">Sauces selected</span>
        </div>
        <button class="step-edit-btn" data-step="2" data-package="${packageData.id}" aria-label="Edit sauce selection">
          Edit
        </button>
      </div>

      <!-- Expanded Content -->
      <div class="step-content">
        <div class="section-label">
          <h4>🔥 Step 2: Select Your Sauces</h4>
          <span class="selection-counter">
            <span id="sauce-count-${packageData.id}">0</span>/${max} selected
          </span>
        </div>

        <div class="quick-pick-container">
          <button class="btn-quick-pick" onclick="selectRecommendedSauces('${packageData.id}', ${max})">
            ✨ Quick Pick: Recommended Mix
          </button>
          <p class="quick-pick-note">Perfect balance of mild, medium & hot</p>
        </div>

        <p class="encouragement-message" id="encouragement-${packageData.id}">
          👆 Pick ${max} sauces that match your team's taste preferences
        </p>

        <div class="sauce-categories">
        <!-- Dry Rubs -->
        <div class="sauce-category">
          <h5 class="category-title">Dry Rubs (No mess!)</h5>
          <div class="sauce-grid">
            ${dryRubs.map(sauce => renderSauceCard(sauce, packageData.id)).join('')}
          </div>
        </div>

        <!-- Wet Sauces -->
        <div class="sauce-category">
          <h5 class="category-title">Wet Sauces</h5>
          <div class="sauce-grid">
            ${wetSauces.map(sauce => renderSauceCard(sauce, packageData.id)).join('')}
          </div>
        </div>
        </div>

        <p class="sauce-note">💡 Mix heat levels to satisfy everyone on your team!</p>
      </div><!-- end step-content -->
    </div>
  `;
}

/**
 * Render Step 3: Add-Ons (Vegetarian + Desserts combined)
 */
function renderAddOnsStep(vegetarianHtml, dessertsHtml, packageId) {
  // If both sections are empty, don't render Step 3 at all
  if (!vegetarianHtml && !dessertsHtml) {
    return '';
  }

  return `
    <div class="configurator-section add-ons-step step-collapsed"
         data-step="3"
         data-package="${packageId}"
         aria-expanded="false">

      <!-- Collapsed Summary (shown when collapsed) -->
      <div class="step-summary">
        <div class="step-summary-main">
          <span class="step-checkmark">✓</span>
          <span class="step-summary-text">Add-ons selected</span>
        </div>
        <button class="step-edit-btn" data-step="3" data-package="${packageId}" aria-label="Edit add-on selection">
          Edit
        </button>
      </div>

      <!-- Expanded Content -->
      <div class="step-content">
        <div class="section-label">
          <h4 class="step-heading">🌱 Step 3: Add Optional Extras</h4>
          <span class="optional-badge">Optional</span>
        </div>

        <p class="section-description">
          Enhance your package with vegetarian options and desserts - perfect for dietary preferences and celebrations!
        </p>

        ${vegetarianHtml}
        ${dessertsHtml}
      </div><!-- end step-content -->
    </div>
  `;
}

/**
 * Individual Sauce Card with image
 */
function renderSauceCard(sauce, packageId) {
  const heatDots = '🌶️'.repeat(sauce.heat || 0);

  return `
    <label class="sauce-card" data-sauce-id="${sauce.id}" data-package="${packageId}">
      <input
        type="checkbox"
        name="sauce-${packageId}"
        value="${sauce.id}"
        onchange="updateSauceCount('${packageId}')"
        class="sauce-name"
      >
      <div class="sauce-card-content">
        <img src="${sauce.image}" alt="${sauce.name}" loading="lazy">
        <div class="sauce-info">
          <h6 class="sauce-name">${sauce.name}</h6>
          <span class="heat-level">${heatDots || '❄️'}</span>
        </div>
        <div class="checkmark">✓</div>
      </div>
    </label>
  `;
}

/**
 * Dips Preview - Shows available dips
 */
function renderDipsPreview(packageData) {
  const dips = [
    { id: 'ranch', name: 'Ranch', image: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Franch-dip_1920x1080.webp?alt=media' },
    { id: 'honey-mustard', name: 'Honey Mustard', image: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Fhoney-mustard_1920x1080.webp?alt=media' },
    { id: 'blue-cheese', name: 'Blue Cheese', image: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Fblue-cheese_1920x1080.webp?alt=media' },
    { id: 'cheese-sauce', name: 'Cheese Sauce', image: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Fcheese-sauce_1920x1080.webp?alt=media' }
  ];

  return `
    <div class="configurator-section dips-section">
      <div class="section-label">
        <h4>🥣 Included: ${packageData.dipsIncluded.count} Dipping Cups</h4>
      </div>

      <div class="dips-grid">
        ${dips.map(dip => `
          <div class="dip-preview">
            <img src="${dip.image}" alt="${dip.name}" loading="lazy">
            <span class="dip-name">${dip.name}</span>
          </div>
        `).join('')}
      </div>

      <p class="dips-note">Choose your favorites at checkout</p>
    </div>
  `;
}

/**
 * Package Summary - Shows what's included
 */
function renderPackageSummary(packageData) {
  return `
    <div class="configurator-section summary-section">
      <div class="section-label">
        <h4>📦 What's Included</h4>
      </div>

      <div class="summary-content">
        <div class="summary-grid">
          <!-- Wings -->
          <div class="summary-item">
            <span class="summary-icon">🍗</span>
            <span class="summary-text">${packageData.wingOptions.totalWings} Wings (Your style choice)</span>
          </div>

          <!-- Sides -->
          ${packageData.sides.map(side => `
            <div class="summary-item">
              <span class="summary-icon">🍟</span>
              <span class="summary-text">${side.quantity} ${side.item}</span>
            </div>
          `).join('')}

          <!-- Dips -->
          <div class="summary-item">
            <span class="summary-icon">🥣</span>
            <span class="summary-text">${packageData.dipsIncluded.count} Dipping Cups</span>
          </div>

          <!-- Extras -->
          ${packageData.includes.map(item => `
            <div class="summary-item">
              <span class="summary-icon">✓</span>
              <span class="summary-text">${item}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

/**
 * Helper function to update sauce count (called from onChange)
 */
window.updateSauceCount = function(packageId) {
  const checkboxes = document.querySelectorAll(`input[name="sauce-${packageId}"]:checked`);
  const counter = document.getElementById(`sauce-count-${packageId}`);
  if (counter) {
    counter.textContent = checkboxes.length;
  }
};

/**
 * Track wing type selection for analytics
 */
window.trackWingTypeSelection = function(packageId, wingType) {
  // Fire GA4 event
  if (typeof gtag !== 'undefined') {
    gtag('event', 'wing_type_selected', {
      package_id: packageId,
      wing_type: wingType, // enum: 'bone-in', 'boneless', 'cauliflower', 'mixed'
      event_category: 'catering_configurator',
      event_label: `${packageId}_${wingType}`
    });
  }

  // Console log for debugging
  console.log(`Wing type selected: ${wingType} for package ${packageId}`);
};
