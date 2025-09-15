// Nutrition Service - Fetches FDA 2020 compliant nutrition data from Firebase
// Created by Sally for dynamic nutrition management

import { FirebaseService } from './firebase-service';

export const NutritionService = {
  // Get nutrition data by item ID
  async getById(itemId) {
    try {
      // First try to find by the id field
      const items = await FirebaseService.getAll('nutritionData', {
        where: ['id', '==', itemId],
        limit: 1
      });

      if (items && items.length > 0) {
        return items[0];
      }

      // Fallback to document ID
      return await FirebaseService.getById('nutritionData', itemId);
    } catch (error) {
      console.error('Error fetching nutrition data:', error);
      return null;
    }
  },

  // Get all nutrition items by category
  async getByCategory(category) {
    try {
      return await FirebaseService.getAll('nutritionData', {
        where: ['category', '==', category],
        orderBy: ['sortOrder', 'asc']
      });
    } catch (error) {
      console.error('Error fetching nutrition by category:', error);
      return [];
    }
  },

  // Get all active nutrition items
  async getAllActive() {
    try {
      return await FirebaseService.getAll('nutritionData', {
        where: ['active', '==', true],
        orderBy: ['sortOrder', 'asc']
      });
    } catch (error) {
      console.error('Error fetching active nutrition items:', error);
      return [];
    }
  },

  // Subscribe to real-time nutrition updates
  subscribeToItem(itemId, callback) {
    return FirebaseService.subscribe('nutritionData', (items) => {
      const item = items.find(i => i.id === itemId);
      callback(item);
    }, {
      where: ['id', '==', itemId],
      limit: 1
    });
  },

  // Calculate daily values based on FDA 2020 standards
  calculateDailyValues(nutrition) {
    const dailyValues = {
      totalFat: 78, // grams (FDA 2020)
      saturatedFat: 20, // grams
      cholesterol: 300, // mg
      sodium: 2300, // mg
      totalCarbs: 275, // grams (FDA 2020)
      dietaryFiber: 28, // grams (FDA 2020)
      addedSugars: 50, // grams (FDA 2020 NEW)
      protein: 50, // grams
      vitaminD: 20, // mcg (FDA 2020 NEW)
      calcium: 1300, // mg
      iron: 18, // mg
      potassium: 4700 // mg (FDA 2020 NEW)
    };

    // Helper function to extract value from nutrient object or return direct value
    const getNutrientValue = (nutrient) => {
      if (typeof nutrient === 'object' && nutrient !== null && 'amount' in nutrient) {
        return nutrient.amount;
      }
      return nutrient || 0;
    };

    return {
      totalFatDV: Math.round((getNutrientValue(nutrition.totalFat) / dailyValues.totalFat) * 100),
      saturatedFatDV: Math.round((getNutrientValue(nutrition.saturatedFat) / dailyValues.saturatedFat) * 100),
      cholesterolDV: Math.round((getNutrientValue(nutrition.cholesterol) / dailyValues.cholesterol) * 100),
      sodiumDV: Math.round((getNutrientValue(nutrition.sodium) / dailyValues.sodium) * 100),
      totalCarbsDV: Math.round((getNutrientValue(nutrition.totalCarbs) / dailyValues.totalCarbs) * 100),
      dietaryFiberDV: Math.round((getNutrientValue(nutrition.dietaryFiber) / dailyValues.dietaryFiber) * 100),
      addedSugarsDV: Math.round((getNutrientValue(nutrition.addedSugars) / dailyValues.addedSugars) * 100),
      proteinDV: Math.round((getNutrientValue(nutrition.protein) / dailyValues.protein) * 100),
      vitaminDDV: Math.round((getNutrientValue(nutrition.vitaminD) / dailyValues.vitaminD) * 100),
      calciumDV: Math.round((getNutrientValue(nutrition.calcium) / dailyValues.calcium) * 100),
      ironDV: Math.round((getNutrientValue(nutrition.iron) / dailyValues.iron) * 100),
      potassiumDV: Math.round((getNutrientValue(nutrition.potassium) / dailyValues.potassium) * 100)
    };
  },

  // Check dietary claims
  checkDietaryClaims(nutrition) {
    const claims = [];

    // High Protein (≥20% DV)
    if (nutrition.protein && (nutrition.protein / 50) >= 0.2) {
      claims.push('High Protein');
    }

    // Low Sodium (<140mg)
    if (nutrition.sodium && nutrition.sodium < 140) {
      claims.push('Low Sodium');
    }

    // Low Fat (<3g)
    if (nutrition.totalFat && nutrition.totalFat < 3) {
      claims.push('Low Fat');
    }

    // No Added Sugars
    if (nutrition.addedSugars === 0) {
      claims.push('No Added Sugars');
    }

    // Good Source of Potassium (≥10% DV)
    if (nutrition.potassium && (nutrition.potassium / 4700) >= 0.1) {
      claims.push('Good Source of Potassium');
    }

    // Keto-Friendly (≤5g net carbs per serving)
    if (nutrition.totalCarbs && nutrition.dietaryFiber !== undefined) {
      const netCarbs = nutrition.totalCarbs - nutrition.dietaryFiber;
      if (netCarbs <= 5) {
        claims.push('Keto-Friendly');
      }
    }

    // Gluten-Free (no wheat allergen)
    const allergensList = this.formatAllergens(nutrition.allergens);
    if (!allergensList || !allergensList.includes('wheat')) {
      claims.push('Gluten-Free Option Available');
    }

    return claims;
  },

  // Format allergens for display
  formatAllergens(allergens) {
    if (!allergens) return [];

    // Handle object format with contains/mayContain properties
    if (typeof allergens === 'object' && !Array.isArray(allergens)) {
      // Combine contains and mayContain arrays
      const contains = allergens.contains || [];
      const mayContain = allergens.mayContain || [];
      return [...contains, ...mayContain];
    }

    // Handle array format
    if (Array.isArray(allergens)) {
      return allergens;
    }

    // Handle string format from Firebase
    if (typeof allergens === 'string') {
      // Parse string like "[soy, wheat, sesame]"
      const cleanString = allergens.replace(/[\[\]]/g, '');
      return cleanString.split(',').map(a => a.trim());
    }

    return [];
  },

  // Get nutrition with combined sauce
  async getNutritionWithSauce(wingItemId, sauceItemId) {
    try {
      const [wingItem, sauceItem] = await Promise.all([
        this.getById(wingItemId),
        sauceItemId ? this.getById(sauceItemId) : null
      ]);

      if (!wingItem) return null;
      if (!sauceItem) return wingItem;

      // Combine nutrition values
      return {
        ...wingItem,
        name: `${wingItem.name} with ${sauceItem.name}`,
        calories: wingItem.calories + sauceItem.calories,
        totalFat: wingItem.totalFat + sauceItem.totalFat,
        saturatedFat: wingItem.saturatedFat + sauceItem.saturatedFat,
        sodium: wingItem.sodium + sauceItem.sodium,
        totalCarbs: wingItem.totalCarbs + sauceItem.totalCarbs,
        totalSugars: (wingItem.totalSugars || 0) + (sauceItem.totalSugars || 0),
        addedSugars: (wingItem.addedSugars || 0) + (sauceItem.addedSugars || 0),
        allergens: [...new Set([
          ...this.formatAllergens(wingItem.allergens),
          ...this.formatAllergens(sauceItem.allergens)
        ])]
      };
    } catch (error) {
      console.error('Error combining nutrition data:', error);
      return null;
    }
  }
};

export default NutritionService;