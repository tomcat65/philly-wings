// Nutrition Modal Component for Philly Wings Express
import { nutritionData, calculateDailyValues, getNutritionById } from '../../scripts/data/nutrition-data.js';

export class NutritionModal {
  constructor() {
    this.modal = null;
    this.currentItem = null;
    this.init();
  }

  init() {
    // Create modal HTML structure
    this.createModal();
    // Add event listeners
    this.setupEventListeners();
  }

  createModal() {
    const modalHTML = `
      <div id="nutritionModal" class="nutrition-modal" style="display: none;">
        <div class="nutrition-modal-content">
          <div class="nutrition-modal-header">
            <h2 id="nutritionTitle">Nutrition Information</h2>
            <button class="close-modal" aria-label="Close">&times;</button>
          </div>

          <div class="nutrition-modal-body">
            <div class="nutrition-facts">
              <div class="nutrition-facts-header">
                <h3>Nutrition Facts</h3>
                <p class="serving-size">Serving Size: <span id="servingSize"></span></p>
              </div>

              <div class="nutrition-separator thick"></div>

              <div class="nutrition-row">
                <span class="nutrition-label bold">Amount Per Serving</span>
              </div>

              <div class="nutrition-row">
                <span class="nutrition-label"><b>Calories</b> <span id="calories"></span></span>
                <span class="nutrition-value">Calories from Fat <span id="caloriesFromFat"></span></span>
              </div>

              <div class="nutrition-separator"></div>

              <div class="nutrition-row">
                <span class="nutrition-label right">% Daily Value*</span>
              </div>

              <div class="nutrition-row">
                <span class="nutrition-label"><b>Total Fat</b> <span id="totalFat"></span>g</span>
                <span class="nutrition-value bold"><span id="totalFatDV"></span>%</span>
              </div>

              <div class="nutrition-row indent">
                <span class="nutrition-label">Saturated Fat <span id="saturatedFat"></span>g</span>
                <span class="nutrition-value bold"><span id="saturatedFatDV"></span>%</span>
              </div>

              <div class="nutrition-row indent">
                <span class="nutrition-label">Trans Fat <span id="transFat"></span>g</span>
              </div>

              <div class="nutrition-row">
                <span class="nutrition-label"><b>Cholesterol</b> <span id="cholesterol"></span>mg</span>
                <span class="nutrition-value bold"><span id="cholesterolDV"></span>%</span>
              </div>

              <div class="nutrition-row">
                <span class="nutrition-label"><b>Sodium</b> <span id="sodium"></span>mg</span>
                <span class="nutrition-value bold"><span id="sodiumDV"></span>%</span>
              </div>

              <div class="nutrition-row">
                <span class="nutrition-label"><b>Total Carbohydrate</b> <span id="totalCarbs"></span>g</span>
                <span class="nutrition-value bold"><span id="totalCarbsDV"></span>%</span>
              </div>

              <div class="nutrition-row indent">
                <span class="nutrition-label">Dietary Fiber <span id="dietaryFiber"></span>g</span>
                <span class="nutrition-value bold"><span id="dietaryFiberDV"></span>%</span>
              </div>

              <div class="nutrition-row indent">
                <span class="nutrition-label">Sugars <span id="sugars"></span>g</span>
              </div>

              <div class="nutrition-row">
                <span class="nutrition-label"><b>Protein</b> <span id="protein"></span>g</span>
                <span class="nutrition-value bold"><span id="proteinDV"></span>%</span>
              </div>

              <div class="nutrition-separator thick"></div>

              <div class="nutrition-vitamins">
                <div class="nutrition-row">
                  <span>Vitamin A <span id="vitaminA">0</span>%</span>
                  <span>Vitamin C <span id="vitaminC">0</span>%</span>
                </div>
                <div class="nutrition-row">
                  <span>Calcium <span id="calcium">0</span>%</span>
                  <span>Iron <span id="iron">0</span>%</span>
                </div>
              </div>

              <div class="nutrition-separator"></div>

              <div class="nutrition-disclaimer">
                <p>* Percent Daily Values are based on a 2,000 calorie diet. Your daily values may be higher or lower depending on your calorie needs.</p>
              </div>
            </div>

            <div class="allergen-info">
              <h4>Allergen Information</h4>
              <div id="allergenList" class="allergen-list"></div>
              <p id="allergenWarning" class="warning-text"></p>
            </div>
          </div>
        </div>
      </div>
    `;

    // Add modal to body
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
  }

  open(category, itemId) {
    const nutrition = getNutritionById(category, itemId);

    if (!nutrition) {
      console.error('Nutrition data not found for:', category, itemId);
      return;
    }

    this.currentItem = nutrition;
    this.populateModal(nutrition);
    this.modal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Prevent background scroll
  }

  populateModal(nutrition) {
    // Title
    document.getElementById('nutritionTitle').textContent = `Nutrition Information - ${nutrition.name}`;

    // Basic nutrition facts
    document.getElementById('servingSize').textContent = nutrition.servingSize;
    document.getElementById('calories').textContent = nutrition.calories;
    document.getElementById('caloriesFromFat').textContent = nutrition.caloriesFromFat || Math.round(nutrition.totalFat * 9);

    // Macronutrients
    document.getElementById('totalFat').textContent = nutrition.totalFat;
    document.getElementById('saturatedFat').textContent = nutrition.saturatedFat;
    document.getElementById('transFat').textContent = nutrition.transFat;
    document.getElementById('cholesterol').textContent = nutrition.cholesterol;
    document.getElementById('sodium').textContent = nutrition.sodium;
    document.getElementById('totalCarbs').textContent = nutrition.totalCarbs;
    document.getElementById('dietaryFiber').textContent = nutrition.dietaryFiber;
    document.getElementById('sugars').textContent = nutrition.sugars;
    document.getElementById('protein').textContent = nutrition.protein;

    // Calculate and display daily values
    const dailyValues = calculateDailyValues(nutrition);
    document.getElementById('totalFatDV').textContent = dailyValues.totalFatDV;
    document.getElementById('saturatedFatDV').textContent = dailyValues.saturatedFatDV;
    document.getElementById('cholesterolDV').textContent = dailyValues.cholesterolDV;
    document.getElementById('sodiumDV').textContent = dailyValues.sodiumDV;
    document.getElementById('totalCarbsDV').textContent = dailyValues.totalCarbsDV;
    document.getElementById('dietaryFiberDV').textContent = dailyValues.dietaryFiberDV;
    document.getElementById('proteinDV').textContent = dailyValues.proteinDV;

    // Vitamins (if available)
    document.getElementById('vitaminA').textContent = nutrition.vitaminA || 0;
    document.getElementById('vitaminC').textContent = nutrition.vitaminC || 0;
    document.getElementById('calcium').textContent = nutrition.calcium || 0;
    document.getElementById('iron').textContent = nutrition.iron || 0;

    // Allergens
    const allergenList = document.getElementById('allergenList');
    allergenList.innerHTML = '';

    if (nutrition.allergens && nutrition.allergens.length > 0) {
      const allergenIcons = {
        'milk': '🥛 Dairy',
        'egg': '🥚 Egg',
        'soy': '🫘 Soy',
        'wheat': '🌾 Wheat/Gluten',
        'peanut': '🥜 Peanut',
        'tree-nut': '🌰 Tree Nuts',
        'fish': '🐟 Fish',
        'shellfish': '🦐 Shellfish',
        'sesame': '🌱 Sesame'
      };

      nutrition.allergens.forEach(allergen => {
        const allergenDiv = document.createElement('div');
        allergenDiv.className = 'allergen-item';
        allergenDiv.textContent = allergenIcons[allergen] || allergen;
        allergenList.appendChild(allergenDiv);
      });
    } else {
      allergenList.innerHTML = '<p>No major allergens</p>';
    }

    // Warning
    const warningEl = document.getElementById('allergenWarning');
    warningEl.textContent = nutrition.warning || 'Prepared in a kitchen that handles all major allergens.';
  }

  close() {
    this.modal.style.display = 'none';
    document.body.style.overflow = ''; // Restore scrolling
    this.currentItem = null;
  }
}

// Initialize modal when DOM is ready
let nutritionModal;
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    nutritionModal = new NutritionModal();
    window.nutritionModal = nutritionModal; // Make globally accessible
  });
} else {
  nutritionModal = new NutritionModal();
  window.nutritionModal = nutritionModal;
}

// Export for use in other modules
export default NutritionModal;