// FDA 2020 Compliant Nutrition Modal with Firebase Integration
// Updated by Sally for dynamic nutrition data management

import { NutritionService } from '../services/nutrition-service.js';

export class NutritionModalFirebase {
  constructor() {
    this.modal = null;
    this.currentItem = null;
    this.showPerServing = false;
    this.activeTab = 'nutrition';
    this.loading = false;
    this.init();
  }

  init() {
    this.createModal();
    this.setupEventListeners();
  }

  createModal() {
    const modalHTML = `
      <div id="nutritionModal" class="nutrition-modal" style="display: none;" role="dialog" aria-labelledby="nutritionTitle" aria-describedby="nutritionContent">
        <div class="nutrition-modal-content">
          <div class="nutrition-modal-header">
            <h2 id="nutritionTitle">Nutrition Information</h2>
            <button class="close-modal" aria-label="Close nutrition information">&times;</button>
          </div>

          <!-- Loading State -->
          <div id="nutritionLoading" class="nutrition-loading" style="display: none;">
            <div class="loading-spinner"></div>
            <p>Loading nutrition data from Firebase...</p>
          </div>

          <!-- Error State -->
          <div id="nutritionError" class="nutrition-error" style="display: none;">
            <p>Unable to load nutrition information. Please try again later.</p>
          </div>

          <!-- Mobile Tab Navigation -->
          <div class="nutrition-tabs mobile-only">
            <button class="tab-button active" data-tab="nutrition" aria-selected="true">
              Nutrition Facts
            </button>
            <button class="tab-button" data-tab="allergens" aria-selected="false">
              Allergens
            </button>
            <button class="tab-button" data-tab="vitamins" aria-selected="false">
              Vitamins
            </button>
          </div>

          <div class="nutrition-modal-body" id="nutritionContent">
            <!-- Serving Toggle for Multi-Portion Items -->
            <div id="servingToggle" class="serving-toggle" style="display: none;">
              <label class="toggle-switch">
                <input type="checkbox" id="perServingToggle">
                <span class="toggle-slider"></span>
                <span class="toggle-label">Show per serving</span>
              </label>
              <p class="servings-info">
                <span id="servingsPerContainer"></span> servings per container
              </p>
            </div>

            <!-- Main Nutrition Facts Panel -->
            <div class="tab-content active" data-tab="nutrition">
              <div class="nutrition-facts">
                <div class="nutrition-facts-header">
                  <h3 class="nutrition-title">Nutrition Facts</h3>
                  <p class="serving-size">
                    <span id="servingsCount" class="servings-count"></span>
                    Serving size: <span id="servingSize"></span>
                  </p>
                </div>

                <div class="nutrition-separator thick"></div>

                <!-- CALORIES - FDA requires largest/boldest display -->
                <div class="nutrition-calories">
                  <div class="calories-row">
                    <span class="calories-label">Calories</span>
                    <span class="calories-value" id="calories">0</span>
                  </div>
                </div>

                <div class="nutrition-separator thick"></div>

                <div class="nutrition-row">
                  <span class="nutrition-label right bold">% Daily Value*</span>
                </div>

                <!-- Fats Section -->
                <div class="nutrition-row">
                  <span class="nutrition-label">
                    <b>Total Fat</b> <span id="totalFat">0</span>g
                  </span>
                  <span class="nutrition-value bold" id="totalFatDV">0%</span>
                </div>

                <div class="nutrition-row indent">
                  <span class="nutrition-label">
                    Saturated Fat <span id="saturatedFat">0</span>g
                  </span>
                  <span class="nutrition-value bold" id="saturatedFatDV">0%</span>
                </div>

                <div class="nutrition-row indent">
                  <span class="nutrition-label">
                    <i>Trans</i> Fat <span id="transFat">0</span>g
                  </span>
                </div>

                <!-- Cholesterol & Sodium -->
                <div class="nutrition-row">
                  <span class="nutrition-label">
                    <b>Cholesterol</b> <span id="cholesterol">0</span>mg
                  </span>
                  <span class="nutrition-value bold" id="cholesterolDV">0%</span>
                </div>

                <div class="nutrition-row">
                  <span class="nutrition-label">
                    <b>Sodium</b> <span id="sodium">0</span>mg
                  </span>
                  <span class="nutrition-value bold" id="sodiumDV">0%</span>
                </div>

                <!-- Carbohydrates Section -->
                <div class="nutrition-row">
                  <span class="nutrition-label">
                    <b>Total Carbohydrate</b> <span id="totalCarbs">0</span>g
                  </span>
                  <span class="nutrition-value bold" id="totalCarbsDV">0%</span>
                </div>

                <div class="nutrition-row indent">
                  <span class="nutrition-label">
                    Dietary Fiber <span id="dietaryFiber">0</span>g
                  </span>
                  <span class="nutrition-value bold" id="dietaryFiberDV">0%</span>
                </div>

                <div class="nutrition-row indent">
                  <span class="nutrition-label">
                    Total Sugars <span id="totalSugars">0</span>g
                  </span>
                </div>

                <!-- NEW FDA 2020: Added Sugars -->
                <div class="nutrition-row double-indent">
                  <span class="nutrition-label">
                    Includes <span id="addedSugars">0</span>g Added Sugars
                  </span>
                  <span class="nutrition-value bold" id="addedSugarsDV">0%</span>
                </div>

                <!-- Protein -->
                <div class="nutrition-row">
                  <span class="nutrition-label">
                    <b>Protein</b> <span id="protein">0</span>g
                  </span>
                  <span class="nutrition-value bold" id="proteinDV">0%</span>
                </div>

                <div class="nutrition-separator thick"></div>

                <!-- FDA 2020 Required Vitamins/Minerals -->
                <div class="nutrition-vitamins desktop-only">
                  <div class="nutrition-row">
                    <span class="nutrition-label">
                      Vitamin D <span id="vitaminD">0</span>mcg
                    </span>
                    <span class="nutrition-value" id="vitaminDDV">0%</span>
                  </div>
                  <div class="nutrition-row">
                    <span class="nutrition-label">
                      Calcium <span id="calcium">0</span>mg
                    </span>
                    <span class="nutrition-value" id="calciumDV">0%</span>
                  </div>
                  <div class="nutrition-row">
                    <span class="nutrition-label">
                      Iron <span id="iron">0</span>mg
                    </span>
                    <span class="nutrition-value" id="ironDV">0%</span>
                  </div>
                  <div class="nutrition-row">
                    <span class="nutrition-label">
                      Potassium <span id="potassium">0</span>mg
                    </span>
                    <span class="nutrition-value" id="potassiumDV">0%</span>
                  </div>
                </div>

                <div class="nutrition-separator desktop-only"></div>

                <div class="nutrition-disclaimer">
                  <p>* The % Daily Value tells you how much a nutrient in a serving of food contributes to a daily diet. 2,000 calories a day is used for general nutrition advice.</p>
                </div>

                <!-- Dietary Claims (if applicable) -->
                <div id="dietaryClaims" class="dietary-claims" style="display: none;">
                  <div class="claims-list"></div>
                </div>
              </div>
            </div>

            <!-- Allergens Tab -->
            <div class="tab-content" data-tab="allergens">
              <div class="allergen-info">
                <h4>
                  <span class="warning-icon" role="img" aria-label="Warning">⚠️</span>
                  Allergen Information
                </h4>

                <div id="allergenList" class="allergen-list" role="list" aria-label="Contains these allergens"></div>

                <div class="cross-contamination-warning">
                  <p id="allergenWarning" class="warning-text" role="alert"></p>
                </div>

                <div id="sesameNotice" class="sesame-notice" style="display: none;">
                  <p><strong>Note:</strong> Sesame is now recognized as the 9th major allergen (as of January 1, 2023)</p>
                </div>
              </div>
            </div>

            <!-- Vitamins Tab (Mobile Only) -->
            <div class="tab-content mobile-only" data-tab="vitamins">
              <div class="nutrition-vitamins">
                <h4>Vitamins & Minerals</h4>
                <div class="vitamin-grid">
                  <div class="vitamin-item">
                    <span class="vitamin-label">Vitamin D</span>
                    <span class="vitamin-value"><span id="vitaminDMobile">0</span>mcg</span>
                    <span class="vitamin-dv"><span id="vitaminDDVMobile">0</span>% DV</span>
                  </div>
                  <div class="vitamin-item">
                    <span class="vitamin-label">Calcium</span>
                    <span class="vitamin-value"><span id="calciumMobile">0</span>mg</span>
                    <span class="vitamin-dv"><span id="calciumDVMobile">0</span>% DV</span>
                  </div>
                  <div class="vitamin-item">
                    <span class="vitamin-label">Iron</span>
                    <span class="vitamin-value"><span id="ironMobile">0</span>mg</span>
                    <span class="vitamin-dv"><span id="ironDVMobile">0</span>% DV</span>
                  </div>
                  <div class="vitamin-item">
                    <span class="vitamin-label">Potassium</span>
                    <span class="vitamin-value"><span id="potassiumMobile">0</span>mg</span>
                    <span class="vitamin-dv"><span id="potassiumDVMobile">0</span>% DV</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    this.modal = document.getElementById('nutritionModal');
  }

  setupEventListeners() {
    // Close button
    const closeBtn = this.modal.querySelector('.close-modal');
    closeBtn.addEventListener('click', () => this.close());

    // Click outside to close
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.close();
      }
    });

    // ESC key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal.style.display !== 'none') {
        this.close();
      }
    });

    // Tab switching (mobile)
    const tabButtons = this.modal.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        this.switchTab(e.target.dataset.tab);
      });
    });

    // Per serving toggle
    const perServingToggle = document.getElementById('perServingToggle');
    if (perServingToggle) {
      perServingToggle.addEventListener('change', (e) => {
        this.showPerServing = e.target.checked;
        if (this.currentItem) {
          this.populateModal(this.currentItem);
        }
      });
    }
  }

  switchTab(tabName) {
    this.modal.querySelectorAll('.tab-button').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
      btn.setAttribute('aria-selected', btn.dataset.tab === tabName);
    });

    this.modal.querySelectorAll('.tab-content').forEach(content => {
      content.classList.toggle('active', content.dataset.tab === tabName);
    });

    this.activeTab = tabName;
  }

  async open(category, itemId, sauceId = null) {
    // Handle both old format (category, itemId) and new format (just itemId)
    if (arguments.length === 2 && typeof category === 'string' && typeof itemId === 'string') {
      // Old format: open('wings', '6-wings')
      // Ignore category, use itemId
    } else if (arguments.length === 1) {
      // New format: open('6-wings')
      itemId = category;
      category = null;
    }

    this.showLoading(true);
    this.modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    try {
      // Fetch nutrition data from Firebase
      let nutrition;

      if (sauceId) {
        // Get combined nutrition with sauce
        nutrition = await NutritionService.getNutritionWithSauce(itemId, sauceId);
      } else {
        // Get single item nutrition
        nutrition = await NutritionService.getById(itemId);
      }

      if (!nutrition) {
        this.showError();
        return;
      }

      this.currentItem = nutrition;
      this.populateModal(nutrition);
      this.showLoading(false);

      // Focus management for accessibility
      this.modal.querySelector('.close-modal').focus();

      // Announce to screen readers
      this.announceToScreenReaders(nutrition);

    } catch (error) {
      console.error('Error loading nutrition data:', error);
      this.showError();
    }
  }

  showLoading(show) {
    const loadingEl = document.getElementById('nutritionLoading');
    const contentEl = document.getElementById('nutritionContent');
    const errorEl = document.getElementById('nutritionError');

    if (show) {
      loadingEl.style.display = 'flex';
      contentEl.style.display = 'none';
      errorEl.style.display = 'none';
    } else {
      loadingEl.style.display = 'none';
      contentEl.style.display = 'block';
      errorEl.style.display = 'none';
    }
  }

  showError() {
    const loadingEl = document.getElementById('nutritionLoading');
    const contentEl = document.getElementById('nutritionContent');
    const errorEl = document.getElementById('nutritionError');

    loadingEl.style.display = 'none';
    contentEl.style.display = 'none';
    errorEl.style.display = 'block';
  }

  populateModal(nutrition) {
    // Determine if we should show per-serving data
    const hasMultipleServings = nutrition.servingsPerContainer && nutrition.servingsPerContainer > 1;
    const displayData = (this.showPerServing && nutrition.perServing) ? nutrition.perServing : nutrition;

    // Title
    document.getElementById('nutritionTitle').textContent = `Nutrition Information - ${nutrition.name}`;

    // Serving size and toggle
    const servingToggle = document.getElementById('servingToggle');
    if (hasMultipleServings) {
      servingToggle.style.display = 'block';
      document.getElementById('servingsPerContainer').textContent = nutrition.servingsPerContainer;
      document.getElementById('servingsCount').textContent =
        this.showPerServing ? '1 serving • ' : `${nutrition.servingsPerContainer} servings • `;
    } else {
      servingToggle.style.display = 'none';
      document.getElementById('servingsCount').textContent = '';
    }

    document.getElementById('servingSize').textContent = nutrition.servingSize;

    // Populate nutrition values
    document.getElementById('calories').textContent = displayData.calories || nutrition.calories || 0;
    document.getElementById('totalFat').textContent = displayData.totalFat || nutrition.totalFat || 0;
    document.getElementById('saturatedFat').textContent = displayData.saturatedFat || nutrition.saturatedFat || 0;
    document.getElementById('transFat').textContent = displayData.transFat || nutrition.transFat || 0;
    document.getElementById('cholesterol').textContent = displayData.cholesterol || nutrition.cholesterol || 0;
    document.getElementById('sodium').textContent = displayData.sodium || nutrition.sodium || 0;
    document.getElementById('totalCarbs').textContent = displayData.totalCarbs || nutrition.totalCarbs || 0;
    document.getElementById('dietaryFiber').textContent = displayData.dietaryFiber || nutrition.dietaryFiber || 0;
    document.getElementById('totalSugars').textContent = displayData.totalSugars || nutrition.totalSugars || nutrition.sugars || 0;
    document.getElementById('addedSugars').textContent = displayData.addedSugars || nutrition.addedSugars || 0;
    document.getElementById('protein').textContent = displayData.protein || nutrition.protein || 0;

    // FDA 2020 Required Nutrients
    const vitaminD = nutrition.vitaminD || 0;
    const calcium = nutrition.calcium || 0;
    const iron = nutrition.iron || 0;
    const potassium = nutrition.potassium || 0;

    document.getElementById('vitaminD').textContent = vitaminD;
    document.getElementById('calcium').textContent = calcium;
    document.getElementById('iron').textContent = iron;
    document.getElementById('potassium').textContent = potassium;

    // Mobile vitamins
    document.getElementById('vitaminDMobile').textContent = vitaminD;
    document.getElementById('calciumMobile').textContent = calcium;
    document.getElementById('ironMobile').textContent = iron;
    document.getElementById('potassiumMobile').textContent = potassium;

    // Calculate Daily Values
    const dailyValues = NutritionService.calculateDailyValues(displayData.calories ? displayData : nutrition);

    // Apply Daily Values
    this.setDailyValue('totalFatDV', dailyValues.totalFatDV);
    this.setDailyValue('saturatedFatDV', dailyValues.saturatedFatDV);
    this.setDailyValue('cholesterolDV', dailyValues.cholesterolDV);
    this.setDailyValue('sodiumDV', dailyValues.sodiumDV, true);
    this.setDailyValue('totalCarbsDV', dailyValues.totalCarbsDV);
    this.setDailyValue('dietaryFiberDV', dailyValues.dietaryFiberDV, false, true);
    this.setDailyValue('addedSugarsDV', dailyValues.addedSugarsDV || 0);
    this.setDailyValue('proteinDV', dailyValues.proteinDV, false, true);
    this.setDailyValue('vitaminDDV', dailyValues.vitaminDDV || 0);
    this.setDailyValue('calciumDV', dailyValues.calciumDV || 0);
    this.setDailyValue('ironDV', dailyValues.ironDV || 0);
    this.setDailyValue('potassiumDV', dailyValues.potassiumDV || 0, false, true);

    // Mobile vitamin DVs
    document.getElementById('vitaminDDVMobile').textContent = dailyValues.vitaminDDV || 0;
    document.getElementById('calciumDVMobile').textContent = dailyValues.calciumDV || 0;
    document.getElementById('ironDVMobile').textContent = dailyValues.ironDV || 0;
    document.getElementById('potassiumDVMobile').textContent = dailyValues.potassiumDV || 0;

    // Allergens
    this.displayAllergens(nutrition);

    // Dietary claims
    this.displayDietaryClaims(nutrition);
  }

  setDailyValue(elementId, value, warnIfHigh = false, goodIfHigh = false) {
    const element = document.getElementById(elementId);
    if (!element) return;

    element.textContent = value + '%';

    element.classList.remove('dv-high', 'dv-good', 'dv-warning');

    if (value >= 20) {
      if (goodIfHigh) {
        element.classList.add('dv-good');
      } else if (warnIfHigh) {
        element.classList.add('dv-warning');
      } else {
        element.classList.add('dv-high');
      }
    }
  }

  displayAllergens(nutrition) {
    const allergenList = document.getElementById('allergenList');
    allergenList.innerHTML = '';

    const allergenIcons = {
      'milk': { icon: '🥛', label: 'Dairy/Milk', severity: 'high' },
      'egg': { icon: '🥚', label: 'Egg', severity: 'high' },
      'soy': { icon: '🫘', label: 'Soy', severity: 'medium' },
      'wheat': { icon: '🌾', label: 'Wheat/Gluten', severity: 'high' },
      'peanut': { icon: '🥜', label: 'Peanut', severity: 'critical' },
      'peanuts': { icon: '🥜', label: 'Peanuts', severity: 'critical' },
      'tree-nut': { icon: '🌰', label: 'Tree Nuts', severity: 'critical' },
      'fish': { icon: '🐟', label: 'Fish', severity: 'medium' },
      'shellfish': { icon: '🦐', label: 'Shellfish', severity: 'high' },
      'sesame': { icon: '🌱', label: 'Sesame (NEW)', severity: 'medium' }
    };

    const formattedAllergens = NutritionService.formatAllergens(nutrition.allergens);

    if (formattedAllergens && formattedAllergens.length > 0) {
      if (formattedAllergens.includes('sesame')) {
        document.getElementById('sesameNotice').style.display = 'block';
      }

      formattedAllergens.forEach(allergen => {
        const allergenInfo = allergenIcons[allergen] || { icon: '⚠️', label: allergen, severity: 'unknown' };

        const allergenDiv = document.createElement('div');
        allergenDiv.className = `allergen-item allergen-${allergenInfo.severity}`;
        allergenDiv.setAttribute('role', 'listitem');

        allergenDiv.innerHTML = `
          <span class="allergen-icon" role="img" aria-label="${allergenInfo.label}">${allergenInfo.icon}</span>
          <span class="allergen-label">${allergenInfo.label}</span>
        `;

        allergenList.appendChild(allergenDiv);
      });
    } else {
      allergenList.innerHTML = '<p class="no-allergens">No major allergens in primary ingredients</p>';
    }

    const warningEl = document.getElementById('allergenWarning');
    warningEl.textContent = nutrition.warning || 'Prepared in a kitchen that handles all major allergens. Cross-contamination may occur.';
  }

  displayDietaryClaims(nutrition) {
    const claims = NutritionService.checkDietaryClaims(nutrition);
    const claimsContainer = document.getElementById('dietaryClaims');

    if (claims && claims.length > 0) {
      claimsContainer.style.display = 'block';
      const claimsList = claimsContainer.querySelector('.claims-list');
      claimsList.innerHTML = claims.map(claim =>
        `<span class="dietary-claim">${claim}</span>`
      ).join('');
    } else {
      claimsContainer.style.display = 'none';
    }
  }

  announceToScreenReaders(nutrition) {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'alert');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'sr-only';

    const formattedAllergens = NutritionService.formatAllergens(nutrition.allergens);
    let allergenText = '';
    if (formattedAllergens && formattedAllergens.length > 0) {
      allergenText = `Warning: Contains ${formattedAllergens.join(', ')}. `;
    }

    announcement.textContent = `Nutrition information for ${nutrition.name}. ${allergenText}${nutrition.calories} calories per serving.`;

    document.body.appendChild(announcement);
    setTimeout(() => announcement.remove(), 3000);
  }

  close() {
    this.modal.style.display = 'none';
    document.body.style.overflow = '';
    this.currentItem = null;
    this.showPerServing = false;

    this.switchTab('nutrition');

    const toggle = document.getElementById('perServingToggle');
    if (toggle) toggle.checked = false;
  }
}

// Initialize modal when DOM is ready
let nutritionModal;
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    nutritionModal = new NutritionModalFirebase();
    window.nutritionModal = nutritionModal;
  });
} else {
  nutritionModal = new NutritionModalFirebase();
  window.nutritionModal = nutritionModal;
}

export default NutritionModalFirebase;