// FDA 2020 Compliant Nutrition Data for Philly Wings Express
// Updated with proper serving sizes (4 wings = 1 serving) and FDA 2020 requirements
// Includes: Added Sugars, Vitamin D (mcg), Potassium (mg), and Sesame allergen tracking

export const nutritionDataFDA2020 = {
  // WINGS - Per 4 wings serving (FDA standard portion)
  wings: {
    'single-serving': {
      id: 'single-serving',
      name: '4 Wings (1 Serving)',
      servingSize: '4 wings (120g)',
      servingsPerContainer: 1,
      calories: 360, // Rounded per FDA rules
      caloriesFromFat: 216,
      totalFat: 24,
      saturatedFat: 7,
      transFat: 0,
      cholesterol: 120,
      sodium: 480,
      totalCarbs: 4,
      dietaryFiber: 0,
      totalSugars: 0,
      addedSugars: 0, // NEW FDA 2020
      protein: 32,
      vitaminD: 0.2, // NEW FDA 2020 (mcg)
      calcium: 20,
      iron: 1.5,
      potassium: 340, // NEW FDA 2020 (mg)
      vitaminA: 15,
      vitaminC: 0,
      allergens: ['soy', 'wheat', 'sesame'], // Added sesame (2023 requirement)
      warning: 'Fried in oil that may contain allergens. May contain traces of peanuts, tree nuts, milk, egg, fish, and shellfish.'
    },
    '6-wings': {
      id: '6-wings',
      name: '6 Wings',
      servingSize: '6 wings (180g)',
      servingsPerContainer: 1.5,
      calories: 540,
      caloriesFromFat: 324,
      totalFat: 36,
      saturatedFat: 10,
      transFat: 0,
      cholesterol: 180,
      sodium: 720,
      totalCarbs: 6,
      dietaryFiber: 0,
      totalSugars: 0,
      addedSugars: 0,
      protein: 48,
      vitaminD: 0.3,
      calcium: 30,
      iron: 2.3,
      potassium: 510,
      vitaminA: 23,
      vitaminC: 0,
      allergens: ['soy', 'wheat', 'sesame'],
      warning: 'Fried in oil that may contain allergens. May contain traces of peanuts, tree nuts, milk, egg, fish, and shellfish.',
      perServing: {
        calories: 360,
        totalFat: 24,
        saturatedFat: 7,
        cholesterol: 120,
        sodium: 480,
        totalCarbs: 4,
        protein: 32
      }
    },
    '12-wings': {
      id: '12-wings',
      name: '12 Wings',
      servingSize: '12 wings (360g)',
      servingsPerContainer: 3,
      calories: 1080,
      caloriesFromFat: 648,
      totalFat: 72,
      saturatedFat: 20,
      transFat: 0,
      cholesterol: 360,
      sodium: 1440,
      totalCarbs: 12,
      dietaryFiber: 0,
      totalSugars: 0,
      addedSugars: 0,
      protein: 96,
      vitaminD: 0.6,
      calcium: 60,
      iron: 4.5,
      potassium: 1020,
      vitaminA: 45,
      vitaminC: 0,
      allergens: ['soy', 'wheat', 'sesame'],
      warning: 'Fried in oil that may contain allergens. May contain traces of peanuts, tree nuts, milk, egg, fish, and shellfish.',
      perServing: {
        calories: 360,
        totalFat: 24,
        saturatedFat: 7,
        cholesterol: 120,
        sodium: 480,
        totalCarbs: 4,
        protein: 32
      }
    },
    '24-wings': {
      id: '24-wings',
      name: '24 Wings',
      servingSize: '24 wings (720g)',
      servingsPerContainer: 6,
      calories: 2160,
      caloriesFromFat: 1296,
      totalFat: 144,
      saturatedFat: 40,
      transFat: 0,
      cholesterol: 720,
      sodium: 2880,
      totalCarbs: 24,
      dietaryFiber: 0,
      totalSugars: 0,
      addedSugars: 0,
      protein: 192,
      vitaminD: 1.2,
      calcium: 120,
      iron: 9,
      potassium: 2040,
      vitaminA: 90,
      vitaminC: 0,
      allergens: ['soy', 'wheat', 'sesame'],
      warning: 'Fried in oil that may contain allergens. May contain traces of peanuts, tree nuts, milk, egg, fish, and shellfish.',
      perServing: {
        calories: 360,
        totalFat: 24,
        saturatedFat: 7,
        cholesterol: 120,
        sodium: 480,
        totalCarbs: 4,
        protein: 32
      }
    },
    '30-wings': {
      id: '30-wings',
      name: '30 Wings',
      servingSize: '30 wings (900g)',
      servingsPerContainer: 7.5,
      calories: 2700,
      caloriesFromFat: 1620,
      totalFat: 180,
      saturatedFat: 50,
      transFat: 0,
      cholesterol: 900,
      sodium: 3600,
      totalCarbs: 30,
      dietaryFiber: 0,
      totalSugars: 0,
      addedSugars: 0,
      protein: 240,
      vitaminD: 1.5,
      calcium: 150,
      iron: 11.3,
      potassium: 2550,
      vitaminA: 113,
      vitaminC: 0,
      allergens: ['soy', 'wheat', 'sesame'],
      warning: 'Fried in oil that may contain allergens. May contain traces of peanuts, tree nuts, milk, egg, fish, and shellfish.',
      perServing: {
        calories: 360,
        totalFat: 24,
        saturatedFat: 7,
        cholesterol: 120,
        sodium: 480,
        totalCarbs: 4,
        protein: 32
      }
    },
    '50-wings': {
      id: '50-wings',
      name: '50 Wing Party Pack',
      servingSize: '50 wings (1500g)',
      servingsPerContainer: 12.5,
      calories: 4500,
      caloriesFromFat: 2700,
      totalFat: 300,
      saturatedFat: 83,
      transFat: 0,
      cholesterol: 1500,
      sodium: 6000,
      totalCarbs: 50,
      dietaryFiber: 0,
      totalSugars: 0,
      addedSugars: 0,
      protein: 400,
      vitaminD: 2.5,
      calcium: 250,
      iron: 18.8,
      potassium: 4250,
      vitaminA: 188,
      vitaminC: 0,
      allergens: ['soy', 'wheat', 'sesame'],
      warning: 'Fried in oil that may contain allergens. May contain traces of peanuts, tree nuts, milk, egg, fish, and shellfish.',
      perServing: {
        calories: 360,
        totalFat: 24,
        saturatedFat: 7,
        cholesterol: 120,
        sodium: 480,
        totalCarbs: 4,
        protein: 32
      }
    }
  },

  // SAUCES - Per 2 tbsp (30g) serving (FDA standard for condiments)
  sauces: {
    'classic-lemon-pepper': {
      id: 'classic-lemon-pepper',
      name: 'Classic Lemon Pepper (Dry Rub)',
      servingSize: '2 tbsp (10g)',
      calories: 20,
      totalFat: 0,
      saturatedFat: 0,
      transFat: 0,
      cholesterol: 0,
      sodium: 380,
      totalCarbs: 4,
      dietaryFiber: 1,
      totalSugars: 0,
      addedSugars: 0,
      protein: 1,
      vitaminD: 0,
      calcium: 15,
      iron: 0.5,
      potassium: 45,
      allergens: [],
      warning: 'Contains black pepper and citrus. May contain traces of sesame.'
    },
    'northeast-hot-lemon': {
      id: 'northeast-hot-lemon',
      name: 'Northeast Hot Lemon (Dry Rub)',
      servingSize: '2 tbsp (10g)',
      calories: 25,
      totalFat: 0,
      saturatedFat: 0,
      transFat: 0,
      cholesterol: 0,
      sodium: 420,
      totalCarbs: 5,
      dietaryFiber: 1,
      totalSugars: 0,
      addedSugars: 0,
      protein: 1,
      vitaminD: 0,
      calcium: 15,
      iron: 0.5,
      potassium: 50,
      allergens: [],
      warning: 'Contains cayenne pepper - spicy. May contain traces of sesame.'
    },
    'frankford-cajun': {
      id: 'frankford-cajun',
      name: 'Frankford Cajun (Dry Rub)',
      servingSize: '2 tbsp (10g)',
      calories: 30,
      totalFat: 0,
      saturatedFat: 0,
      transFat: 0,
      cholesterol: 0,
      sodium: 460,
      totalCarbs: 6,
      dietaryFiber: 2,
      totalSugars: 1,
      addedSugars: 0,
      protein: 1,
      vitaminD: 0,
      calcium: 20,
      iron: 0.8,
      potassium: 80,
      allergens: [],
      warning: 'Contains paprika and garlic. May contain traces of sesame.'
    },
    'sweet-teriyaki': {
      id: 'sweet-teriyaki',
      name: 'Sweet Teriyaki',
      servingSize: '2 tbsp (30g)',
      calories: 70,
      totalFat: 0,
      saturatedFat: 0,
      transFat: 0,
      cholesterol: 0,
      sodium: 510,
      totalCarbs: 16,
      dietaryFiber: 0,
      totalSugars: 13,
      addedSugars: 12,
      protein: 1,
      vitaminD: 0,
      calcium: 10,
      iron: 0.3,
      potassium: 45,
      allergens: ['soy', 'wheat', 'sesame'],
      warning: 'Contains soy sauce and sesame'
    },
    'tailgate-bbq': {
      id: 'tailgate-bbq',
      name: 'Tailgate BBQ',
      servingSize: '2 tbsp (30g)',
      calories: 70,
      totalFat: 0,
      saturatedFat: 0,
      transFat: 0,
      cholesterol: 0,
      sodium: 290,
      totalCarbs: 17,
      dietaryFiber: 0,
      totalSugars: 14,
      addedSugars: 13,
      protein: 0,
      vitaminD: 0,
      calcium: 5,
      iron: 0.2,
      potassium: 35,
      allergens: [],
      warning: 'Contains high fructose corn syrup'
    },
    'mild-buffalo': {
      id: 'mild-buffalo',
      name: 'Mild Buffalo',
      servingSize: '2 tbsp (30g)',
      calories: 10,
      totalFat: 1,
      saturatedFat: 0,
      transFat: 0,
      cholesterol: 0,
      sodium: 460,
      totalCarbs: 1,
      dietaryFiber: 0,
      totalSugars: 0,
      addedSugars: 0,
      protein: 0,
      vitaminD: 0,
      calcium: 0,
      iron: 0,
      potassium: 20,
      allergens: [],
      warning: 'Contains cayenne pepper sauce'
    },
    'philly-classic-hot': {
      id: 'philly-classic-hot',
      name: 'Philly Classic Hot',
      servingSize: '2 tbsp (30g)',
      calories: 15,
      totalFat: 1,
      saturatedFat: 0,
      transFat: 0,
      cholesterol: 0,
      sodium: 600,
      totalCarbs: 1,
      dietaryFiber: 0,
      totalSugars: 0,
      addedSugars: 0,
      protein: 0,
      vitaminD: 0,
      calcium: 0,
      iron: 0,
      potassium: 25,
      allergens: [],
      warning: 'Hot sauce - contains cayenne'
    },
    'broad-pattison-burn': {
      id: 'broad-pattison-burn',
      name: 'Broad & Pattison Burn',
      servingSize: '2 tbsp (30g)',
      calories: 40,
      totalFat: 1.5,
      saturatedFat: 0,
      transFat: 0,
      cholesterol: 0,
      sodium: 490,
      totalCarbs: 6,
      dietaryFiber: 0.5,
      totalSugars: 4,
      addedSugars: 4,
      protein: 0,
      vitaminD: 0,
      calcium: 5,
      iron: 0.2,
      potassium: 30,
      allergens: [],
      warning: 'Nashville hot - very spicy with cayenne and brown sugar'
    },
    'grittys-revenge': {
      id: 'grittys-revenge',
      name: "Gritty's Revenge",
      servingSize: '2 tbsp (30g)',
      calories: 20,
      totalFat: 1.5,
      saturatedFat: 0,
      transFat: 0,
      cholesterol: 0,
      sodium: 700,
      totalCarbs: 1.5,
      dietaryFiber: 0.5,
      totalSugars: 0.5,
      addedSugars: 0,
      protein: 0,
      vitaminD: 0,
      calcium: 0,
      iron: 0,
      potassium: 15,
      allergens: [],
      warning: 'EXTREME HEAT - Scorpion pepper sauce. Not for children!'
    }
  },

  // DIPPING SAUCES - Per 2 tbsp (30g) serving
  dippingSauces: {
    'ranch': {
      id: 'ranch',
      name: 'Ranch',
      servingSize: '2 tbsp (30g)',
      calories: 130,
      totalFat: 13,
      saturatedFat: 2,
      transFat: 0,
      cholesterol: 5,
      sodium: 280,
      totalCarbs: 1,
      dietaryFiber: 0,
      totalSugars: 1,
      addedSugars: 0,
      protein: 1,
      vitaminD: 0.1,
      calcium: 20,
      iron: 0,
      potassium: 25,
      allergens: ['milk', 'egg'],
      warning: 'Contains dairy and egg'
    },
    'honey-mustard': {
      id: 'honey-mustard',
      name: 'Honey Mustard',
      servingSize: '2 tbsp (30g)',
      calories: 90,
      totalFat: 8,
      saturatedFat: 1,
      transFat: 0,
      cholesterol: 5,
      sodium: 150,
      totalCarbs: 5,
      dietaryFiber: 0,
      totalSugars: 4,
      addedSugars: 3,
      protein: 0,
      vitaminD: 0,
      calcium: 5,
      iron: 0,
      potassium: 15,
      allergens: ['egg'],
      warning: 'Contains honey and mustard seed'
    },
    'blue-cheese': {
      id: 'blue-cheese',
      name: 'Blue Cheese',
      servingSize: '2 tbsp (30g)',
      calories: 140,
      totalFat: 14,
      saturatedFat: 3,
      transFat: 0,
      cholesterol: 15,
      sodium: 320,
      totalCarbs: 1,
      dietaryFiber: 0,
      totalSugars: 1,
      addedSugars: 0,
      protein: 1,
      vitaminD: 0.2,
      calcium: 40,
      iron: 0,
      potassium: 30,
      allergens: ['milk'],
      warning: 'Contains dairy and blue cheese cultures'
    }
  },

  // SIDES - Standard serving sizes
  sides: {
    'loaded-fries': {
      id: 'loaded-fries',
      name: 'Loaded Fries',
      servingSize: '1 order (340g)',
      calories: 680,
      totalFat: 42,
      saturatedFat: 18,
      transFat: 0,
      cholesterol: 80,
      sodium: 1420,
      totalCarbs: 52,
      dietaryFiber: 4,
      totalSugars: 2,
      addedSugars: 0,
      protein: 20,
      vitaminD: 0.8,
      calcium: 280,
      iron: 2.5,
      potassium: 820,
      allergens: ['milk'],
      warning: 'Contains cheese sauce and bacon. Fried in shared oil.'
    },
    'mozzarella-sticks': {
      id: 'mozzarella-sticks',
      name: 'Mozzarella Sticks (6)',
      servingSize: '6 sticks (180g)',
      calories: 540,
      totalFat: 28,
      saturatedFat: 14,
      transFat: 0,
      cholesterol: 60,
      sodium: 1260,
      totalCarbs: 48,
      dietaryFiber: 2,
      totalSugars: 4,
      addedSugars: 2,
      protein: 24,
      vitaminD: 0.5,
      calcium: 480,
      iron: 1.8,
      potassium: 240,
      allergens: ['milk', 'wheat'],
      warning: 'Contains dairy and wheat breading. Fried in shared oil.'
    },
    'french-fries': {
      id: 'french-fries',
      name: 'French Fries',
      servingSize: '1 medium (120g)',
      calories: 380,
      totalFat: 18,
      saturatedFat: 3,
      transFat: 0,
      cholesterol: 0,
      sodium: 290,
      totalCarbs: 48,
      dietaryFiber: 4,
      totalSugars: 0,
      addedSugars: 0,
      protein: 4,
      vitaminD: 0,
      calcium: 15,
      iron: 0.8,
      potassium: 610,
      allergens: [],
      warning: 'Fried in shared oil that may contain allergens'
    },
    'bottled-water': {
      id: 'bottled-water',
      name: 'Bottled Water',
      servingSize: '16.9 fl oz (500ml)',
      calories: 0,
      totalFat: 0,
      saturatedFat: 0,
      transFat: 0,
      cholesterol: 0,
      sodium: 0,
      totalCarbs: 0,
      dietaryFiber: 0,
      totalSugars: 0,
      addedSugars: 0,
      protein: 0,
      vitaminD: 0,
      calcium: 0,
      iron: 0,
      potassium: 0,
      allergens: [],
      warning: ''
    }
  },

  // COMBOS - Show per serving info
  combos: {
    'the-tailgater': {
      id: 'the-tailgater',
      name: 'The Tailgater',
      servingSize: '20 wings, large fries (serves 5)',
      servingsPerContainer: 5,
      totalCalories: 2960,
      perServingCalories: 590, // Per person when shared
      totalFat: 168,
      saturatedFat: 42,
      transFat: 0,
      cholesterol: 600,
      sodium: 4680,
      totalCarbs: 124,
      dietaryFiber: 8,
      totalSugars: 0,
      addedSugars: 0,
      protein: 164,
      vitaminD: 1.0,
      calcium: 95,
      iron: 9.3,
      potassium: 2320,
      allergens: ['soy', 'wheat', 'sesame'],
      warning: 'Serves 5 people. Contains multiple allergens. Fried in shared oil.'
    },
    'mvp-meal': {
      id: 'mvp-meal',
      name: 'MVP Meal',
      servingSize: '12 wings, fries, drink',
      servingsPerContainer: 3, // 12 wings = 3 servings
      calories: 1460,
      totalFat: 90,
      saturatedFat: 23,
      transFat: 0,
      cholesterol: 360,
      sodium: 1730,
      totalCarbs: 60,
      dietaryFiber: 4,
      totalSugars: 0,
      addedSugars: 0,
      protein: 100,
      vitaminD: 0.6,
      calcium: 75,
      iron: 5.3,
      potassium: 1630,
      allergens: ['soy', 'wheat', 'sesame'],
      warning: 'Single person meal. Fried in shared oil.'
    },
    'sampler-platter': {
      id: 'sampler-platter',
      name: 'Sampler Platter',
      servingSize: '6 wings, mozz sticks, loaded fries (serves 2-3)',
      servingsPerContainer: 2.5,
      totalCalories: 1760,
      perServingCalories: 704, // When shared by 2.5
      totalFat: 106,
      saturatedFat: 42,
      transFat: 0,
      cholesterol: 320,
      sodium: 3400,
      totalCarbs: 106,
      dietaryFiber: 6,
      totalSugars: 6,
      addedSugars: 2,
      protein: 92,
      vitaminD: 1.6,
      calcium: 790,
      iron: 4.6,
      potassium: 1570,
      allergens: ['soy', 'wheat', 'milk', 'sesame'],
      warning: 'Serves 2-3 people. Contains dairy. Fried in shared oil.'
    }
  }
};

// Helper function to calculate nutrition with sauce (using proper serving sizes)
export function calculateNutritionWithSauce(wingItem, sauceItem) {
  if (!wingItem || !sauceItem) return wingItem;

  // For wings with perServing data, use that
  const baseNutrition = wingItem.perServing || wingItem;

  return {
    ...baseNutrition,
    calories: baseNutrition.calories + sauceItem.calories,
    totalFat: baseNutrition.totalFat + sauceItem.totalFat,
    saturatedFat: baseNutrition.saturatedFat + sauceItem.saturatedFat,
    sodium: baseNutrition.sodium + sauceItem.sodium,
    totalCarbs: baseNutrition.totalCarbs + sauceItem.totalCarbs,
    totalSugars: (baseNutrition.totalSugars || 0) + (sauceItem.totalSugars || 0),
    addedSugars: (baseNutrition.addedSugars || 0) + (sauceItem.addedSugars || 0),
    allergens: [...new Set([...baseNutrition.allergens, ...sauceItem.allergens])]
  };
}

// FDA Rounding Rules (21 CFR 101.9(c))
export const FDARounding = {
  calories: (val) => {
    if (val < 5) return 0;
    if (val <= 50) return Math.round(val / 5) * 5;
    return Math.round(val / 10) * 10;
  },
  fat: (val) => {
    if (val < 0.5) return 0;
    if (val < 5) return Math.round(val * 2) / 2; // Round to nearest 0.5g
    return Math.round(val); // Round to nearest 1g
  },
  mgValues: (val) => { // For sodium, cholesterol, potassium
    if (val < 5) return 0;
    if (val <= 140) return Math.round(val / 5) * 5;
    return Math.round(val / 10) * 10;
  },
  carbs: (val) => {
    if (val < 0.5) return 0;
    return Math.round(val);
  },
  protein: (val) => {
    if (val < 0.5) return 0;
    return Math.round(val);
  },
  vitaminD: (val) => { // In mcg
    if (val < 0.05) return 0;
    return Math.round(val * 10) / 10; // Round to nearest 0.1 mcg
  }
};

// Calculate daily value percentages (FDA 2020 values)
export function calculateDailyValues(nutrition) {
  const dailyValues = {
    totalFat: 78, // grams (updated from 65g)
    saturatedFat: 20, // grams
    cholesterol: 300, // mg
    sodium: 2300, // mg
    totalCarbs: 275, // grams (updated from 300g)
    dietaryFiber: 28, // grams (updated from 25g)
    addedSugars: 50, // grams (NEW)
    protein: 50, // grams
    vitaminD: 20, // mcg (NEW)
    calcium: 1300, // mg
    iron: 18, // mg
    potassium: 4700 // mg (NEW)
  };

  return {
    totalFatDV: Math.round((nutrition.totalFat / dailyValues.totalFat) * 100),
    saturatedFatDV: Math.round((nutrition.saturatedFat / dailyValues.saturatedFat) * 100),
    cholesterolDV: Math.round((nutrition.cholesterol / dailyValues.cholesterol) * 100),
    sodiumDV: Math.round((nutrition.sodium / dailyValues.sodium) * 100),
    totalCarbsDV: Math.round((nutrition.totalCarbs / dailyValues.totalCarbs) * 100),
    dietaryFiberDV: Math.round((nutrition.dietaryFiber / dailyValues.dietaryFiber) * 100),
    addedSugarsDV: Math.round((nutrition.addedSugars / dailyValues.addedSugars) * 100),
    proteinDV: Math.round((nutrition.protein / dailyValues.protein) * 100),
    vitaminDDV: Math.round((nutrition.vitaminD / dailyValues.vitaminD) * 100),
    calciumDV: Math.round((nutrition.calcium / dailyValues.calcium) * 100),
    ironDV: Math.round((nutrition.iron / dailyValues.iron) * 100),
    potassiumDV: Math.round((nutrition.potassium / dailyValues.potassium) * 100)
  };
}

// Export function to get nutrition by item ID
export function getNutritionById(category, itemId) {
  return nutritionDataFDA2020[category]?.[itemId] || null;
}

// Check if item meets specific dietary claims
export function checkDietaryClaims(nutrition) {
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

  return claims;
}