// FDA 2020 Compliant Nutrition Modal with Firebase Integration
// Updated by Sally for dynamic nutrition data management

import { NutritionService } from '../services/nutrition-service.js';
import { FirebaseService } from '../services/firebase-service.js';

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

                <!-- What's Inside (computed combos) -->
                <div id="comboBreakdownSection" class="combo-breakdown" style="display:none; margin-top: 16px;">
                  <h4 style="margin: 8px 0;">What’s inside</h4>
                  <div id="comboBreakdownList"></div>
                  <p id="comboSauceNote" class="sauce-note" style="margin-top:8px; display:none;"></p>
                  <p id="comboDisclaimer" class="disclaimer-note" style="margin-top:8px; color:#555; display:none;"></p>
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
        console.log('Toggle changed - showPerServing:', this.showPerServing);
        if (this.currentItem) {
          console.log('Re-populating modal with current item:', this.currentItem.name);
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

      // Special handling for combos: prefer computedNutrition; support docId or field id lookup
      if (category === 'combos' && itemId) {
        let comboDoc = await FirebaseService.getById('combos', itemId);
        if (!comboDoc) {
          const matches = await FirebaseService.getAll('combos', { where: ['id', '==', itemId], limit: 1 });
          comboDoc = matches && matches.length ? matches[0] : null;
        }
        if (comboDoc && comboDoc.computedNutrition) {
          const cn = comboDoc.computedNutrition;
          // Normalize into a structure compatible with populateModal
          nutrition = {
            _computed: true,
            name: comboDoc.name || 'Combo',
            servingsPerContainer: cn.servingsPerCombo || cn.servingsPerContainer || 1,
            perServing: cn.perServing || {},
            perCombo: cn.perCombo || {},
            allergens: cn.allergens || [],
            disclaimer: cn.disclaimer || comboDoc.disclaimer || '',
            breakdown: cn.breakdown || [],
            sauceNote: cn.sauceNote || null,
          };
        } else if (comboDoc && Array.isArray(comboDoc.items) && comboDoc.items.length) {
          // Fallback: client-side compute by summing referenced nutritionData docs (no sauce/range logic)
          try {
            const refs = comboDoc.items;
            const chunks = (arr, n) => arr.length ? [arr.slice(0, n), ...chunks(arr.slice(n), n)] : [];
            const pulls = [];
            for (const c of chunks(refs, 10)) {
              pulls.push(FirebaseService.getAll('nutritionData', { where: ['id', '==', c[0]], limit: 1 }));
              for (let i = 1; i < c.length; i++) {
                pulls.push(FirebaseService.getAll('nutritionData', { where: ['id', '==', c[i]], limit: 1 }));
              }
            }
            const results = (await Promise.all(pulls)).flat().filter(Boolean);
            const byId = {};
            results.forEach(d => { byId[d.id] = d; });
            const fields = ['calories','totalFat','saturatedFat','transFat','cholesterol','sodium','totalCarbs','dietaryFiber','totalSugars','addedSugars','protein','vitaminD','calcium','iron','potassium'];
            const totals = Object.fromEntries(fields.map(f => [f, 0]));
            const breakdown = [];
            const allergens = new Set();
            refs.forEach(refId => {
              const item = byId[refId];
              if (!item) return;
              const n = item.nutrients || item;
              totals.calories += n.calories || 0;
              totals.totalFat += n.totalFat?.amount ?? n.totalFat ?? 0;
              totals.saturatedFat += n.saturatedFat?.amount ?? n.saturatedFat ?? 0;
              totals.transFat += n.transFat?.amount ?? n.transFat ?? 0;
              totals.cholesterol += n.cholesterol?.amount ?? n.cholesterol ?? 0;
              totals.sodium += n.sodium?.amount ?? n.sodium ?? 0;
              totals.totalCarbs += n.totalCarbs?.amount ?? n.totalCarbs ?? 0;
              totals.dietaryFiber += n.dietaryFiber?.amount ?? n.dietaryFiber ?? 0;
              totals.totalSugars += n.totalSugars?.amount ?? n.totalSugars ?? 0;
              totals.addedSugars += n.addedSugars?.amount ?? n.addedSugars ?? 0;
              totals.protein += n.protein?.amount ?? n.protein ?? 0;
              totals.vitaminD += n.vitaminD?.amount ?? n.vitaminD ?? 0;
              totals.calcium += n.calcium?.amount ?? n.calcium ?? 0;
              totals.iron += n.iron?.amount ?? n.iron ?? 0;
              totals.potassium += n.potassium?.amount ?? n.potassium ?? 0;
              breakdown.push({ refId, name: item.name, qty: 1, calories: Math.round(n.calories || 0) });
              NutritionService.formatAllergens(item.allergens).forEach(a => allergens.add(a));
            });
            const servings = comboDoc.servingsPerCombo || comboDoc.feedsCount || 1;
            const round1 = (v) => Math.round((v + Number.EPSILON) * 10) / 10;
            const round0 = (v) => Math.round(v);
            const perCombo = {
              calories: round0(totals.calories),
              totalFat: round1(totals.totalFat),
              saturatedFat: round1(totals.saturatedFat),
              transFat: round1(totals.transFat || 0),
              cholesterol: round0(totals.cholesterol),
              sodium: round0(totals.sodium),
              totalCarbs: round0(totals.totalCarbs),
              dietaryFiber: round0(totals.dietaryFiber || 0),
              totalSugars: round0(totals.totalSugars || 0),
              addedSugars: round0(totals.addedSugars || 0),
              protein: round0(totals.protein),
              vitaminD: round1(totals.vitaminD || 0),
              calcium: round0(totals.calcium || 0),
              iron: round1(totals.iron || 0),
              potassium: round0(totals.potassium || 0)
            };
            const perServing = {};
            Object.entries(perCombo).forEach(([k, v]) => {
              perServing[k] = (k === 'totalFat' || k === 'saturatedFat' || k === 'transFat' || k === 'vitaminD' || k === 'iron')
                ? round1(v / servings)
                : round0(v / servings);
            });
            nutrition = {
              _computed: true,
              name: comboDoc.name || 'Combo',
              servingsPerContainer: servings,
              perServing,
              perCombo,
              allergens: Array.from(allergens),
              breakdown,
              disclaimer: comboDoc.disclaimer || ''
            };
          } catch (e) {
            console.warn('Fallback combo nutrition compute failed:', e);
          }
        }
      }

      // Fallback to item/nutritionData lookup (wings/sides/sauces)
      if (!nutrition) {
        if (sauceId) {
          nutrition = await NutritionService.getNutritionWithSauce(itemId, sauceId);
        } else {
          nutrition = await NutritionService.getById(itemId);
        }
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

    // Extract the nutrition values - handle both nested and flat structures
    const getNutrientValue = (nutrient) => {
      if (typeof nutrient === 'object' && nutrient !== null && 'amount' in nutrient) {
        return nutrient.amount;
      }
      return nutrient || 0;
    };

    // Get base nutrition values
    // For computed combos, select data based on toggle state
    const baseData = nutrition._computed
      ? (this.showPerServing ? (nutrition.perServing || {}) : (nutrition.perCombo || {}))
      : (nutrition.nutrients || nutrition);

    const perServingNutrients = {
      calories: baseData.calories || 0,
      totalFat: getNutrientValue(baseData.totalFat),
      saturatedFat: getNutrientValue(baseData.saturatedFat),
      transFat: getNutrientValue(baseData.transFat),
      cholesterol: getNutrientValue(baseData.cholesterol),
      sodium: getNutrientValue(baseData.sodium),
      totalCarbs: getNutrientValue(baseData.totalCarbs),
      dietaryFiber: getNutrientValue(baseData.dietaryFiber),
      totalSugars: getNutrientValue(baseData.totalSugars),
      addedSugars: getNutrientValue(baseData.addedSugars),
      protein: getNutrientValue(baseData.protein),
      vitaminD: getNutrientValue(baseData.vitaminD),
      calcium: getNutrientValue(baseData.calcium),
      iron: getNutrientValue(baseData.iron),
      potassium: getNutrientValue(baseData.potassium)
    };

    // Calculate display data based on toggle state
    let displayData;
    if (nutrition._computed) {
      // Already selected appropriate per-serving or per-combo values in baseData
      displayData = perServingNutrients;
    } else if (this.showPerServing || !hasMultipleServings) {
      // Show per-serving values (raw data from Firebase)
      displayData = perServingNutrients;
      console.log('Showing per-serving nutrition:', displayData);
    } else {
      // Show TOTAL values (multiply per-serving by servings)
      const servings = nutrition.servingsPerContainer;
      displayData = {
        calories: Math.round(perServingNutrients.calories * servings),
        totalFat: Math.round(perServingNutrients.totalFat * servings * 10) / 10,
        saturatedFat: Math.round(perServingNutrients.saturatedFat * servings * 10) / 10,
        transFat: Math.round(perServingNutrients.transFat * servings * 10) / 10,
        cholesterol: Math.round(perServingNutrients.cholesterol * servings),
        sodium: Math.round(perServingNutrients.sodium * servings),
        totalCarbs: Math.round(perServingNutrients.totalCarbs * servings),
        dietaryFiber: Math.round(perServingNutrients.dietaryFiber * servings),
        totalSugars: Math.round(perServingNutrients.totalSugars * servings),
        addedSugars: Math.round(perServingNutrients.addedSugars * servings),
        protein: Math.round(perServingNutrients.protein * servings),
        vitaminD: Math.round(perServingNutrients.vitaminD * servings * 10) / 10,
        calcium: Math.round(perServingNutrients.calcium * servings),
        iron: Math.round(perServingNutrients.iron * servings * 10) / 10,
        potassium: Math.round(perServingNutrients.potassium * servings)
      };
      console.log('Showing TOTAL nutrition (per-serving × servings):', displayData);
    }

    // Title
    document.getElementById('nutritionTitle').textContent = `Nutrition Information - ${nutrition.name}`;

    // Serving size and toggle
    const servingToggle = document.getElementById('servingToggle');
    if (hasMultipleServings) {
      servingToggle.style.display = 'block';
      document.getElementById('servingsPerContainer').textContent = nutrition.servingsPerContainer;

      // Update the serving count text based on toggle state
      const servingsCount = document.getElementById('servingsCount');
      if (this.showPerServing) {
        servingsCount.textContent = '1 serving • ';
      } else {
        servingsCount.textContent = `${nutrition.servingsPerContainer} servings • `;
      }

      // Update the toggle checkbox state
      const toggleCheckbox = document.getElementById('perServingToggle');
      if (toggleCheckbox) {
        toggleCheckbox.checked = this.showPerServing;
      }
    } else {
      servingToggle.style.display = 'none';
      document.getElementById('servingsCount').textContent = '';
    }

    // Show appropriate serving size
    const servingSizeElement = document.getElementById('servingSize');
    if (this.showPerServing && nutrition.perServing?.servingSize) {
      servingSizeElement.textContent = nutrition.perServing.servingSize;
    } else if (nutrition.servingSize) {
      servingSizeElement.textContent = nutrition.servingSize;
    } else if (nutrition.serving?.size) {
      servingSizeElement.textContent = nutrition.serving.size;
    } else {
      servingSizeElement.textContent = '';
    }

    // Populate nutrition values from display data
    document.getElementById('calories').textContent = getNutrientValue(displayData.calories);
    document.getElementById('totalFat').textContent = getNutrientValue(displayData.totalFat);
    document.getElementById('saturatedFat').textContent = getNutrientValue(displayData.saturatedFat);
    document.getElementById('transFat').textContent = getNutrientValue(displayData.transFat || 0);
    document.getElementById('cholesterol').textContent = getNutrientValue(displayData.cholesterol);
    document.getElementById('sodium').textContent = getNutrientValue(displayData.sodium);
    document.getElementById('totalCarbs').textContent = getNutrientValue(displayData.totalCarbs);
    document.getElementById('dietaryFiber').textContent = getNutrientValue(displayData.dietaryFiber || 0);
    document.getElementById('totalSugars').textContent = getNutrientValue(displayData.totalSugars || 0) || getNutrientValue(displayData.sugars);
    document.getElementById('addedSugars').textContent = getNutrientValue(displayData.addedSugars || 0);
    document.getElementById('protein').textContent = getNutrientValue(displayData.protein);

    // FDA 2020 Required Nutrients - use display data for vitamins too
    const vitaminD = getNutrientValue(displayData.vitaminD || 0);
    const calcium = getNutrientValue(displayData.calcium || 0);
    const iron = getNutrientValue(displayData.iron || 0);
    const potassium = getNutrientValue(displayData.potassium || 0);

    document.getElementById('vitaminD').textContent = vitaminD;
    document.getElementById('calcium').textContent = calcium;
    document.getElementById('iron').textContent = iron;
    document.getElementById('potassium').textContent = potassium;

    // Mobile vitamins
    document.getElementById('vitaminDMobile').textContent = vitaminD;
    document.getElementById('calciumMobile').textContent = calcium;
    document.getElementById('ironMobile').textContent = iron;
    document.getElementById('potassiumMobile').textContent = potassium;

    // Calculate Daily Values - use the display data for correct per-serving calculations
    const dailyValues = NutritionService.calculateDailyValues(displayData);

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

    // Combo breakdown (if computed)
    const breakdownSection = document.getElementById('comboBreakdownSection');
    const breakdownList = document.getElementById('comboBreakdownList');
    const sauceNoteEl = document.getElementById('comboSauceNote');
    const disclaimerEl = document.getElementById('comboDisclaimer');
    if (nutrition._computed && Array.isArray(nutrition.breakdown) && nutrition.breakdown.length) {
      breakdownSection.style.display = 'block';
      breakdownList.innerHTML = nutrition.breakdown.map(b => {
        const qtyText = typeof b.qty === 'string' ? b.qty : `x${b.qty}`;
        return `<div class="breakdown-row"><span>${qtyText} ${b.name || b.refId}</span><span>${b.calories ?? 0} cal</span></div>`;
      }).join('');
      if (nutrition.sauceNote) {
        sauceNoteEl.style.display = 'block';
        if (nutrition.sauceNote.policy === 'representative') {
          sauceNoteEl.textContent = `Includes representative sauce (${nutrition.sauceNote.representativeId || 'sauce'}) at ${nutrition.sauceNote.portion || ''}.`;
        } else if (nutrition.sauceNote.policy === 'range') {
          sauceNoteEl.textContent = `Sauce adds variable calories.`;
        }
      } else {
        sauceNoteEl.style.display = 'none';
      }
      if (nutrition.disclaimer) {
        disclaimerEl.style.display = 'block';
        disclaimerEl.textContent = nutrition.disclaimer;
      } else {
        disclaimerEl.style.display = 'none';
      }
    } else {
      breakdownSection.style.display = 'none';
    }
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
      'sesame': { icon: '🌱', label: 'Sesame (FDA 2023)', severity: 'medium' }
    };

    const formattedAllergens = NutritionService.formatAllergens(nutrition.allergens);

    // Add SESAME for wings and fried items (FDA 2023 requirement)
    if (formattedAllergens && !formattedAllergens.includes('sesame') &&
        (nutrition.category === 'wings' || nutrition.category === 'sides')) {
      formattedAllergens.push('sesame');
    }

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
    // Handle both old warning field and new allergens.crossContactWarning
    const warningText = nutrition.warning ||
                       (nutrition.allergens && nutrition.allergens.crossContactWarning) ||
                       'Prepared in a kitchen that handles all major allergens. Cross-contamination may occur.';
    warningEl.textContent = warningText;
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
      // Add SESAME to allergens if not already included (FDA 2023 requirement)
      if (!formattedAllergens.includes('sesame') &&
          (nutrition.category === 'wings' || nutrition.category === 'sides')) {
        formattedAllergens.push('sesame');
      }
      allergenText = `Warning: Contains ${formattedAllergens.join(', ')}. `;
    }

    // Get calories from the nested structure
    const calories = nutrition.nutrients?.calories || nutrition.calories || 0;
    announcement.textContent = `Nutrition information for ${nutrition.name}. ${allergenText}${calories} calories per serving.`;

    document.body.appendChild(announcement);
    setTimeout(() => announcement.remove(), 3000);
  }

  close() {
    this.modal.style.display = 'none';
    document.body.style.overflow = '';
    this.currentItem = null;

    // Reset toggle state
    this.showPerServing = false;
    const toggle = document.getElementById('perServingToggle');
    if (toggle) toggle.checked = false;

    this.switchTab('nutrition');
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
