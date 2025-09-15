// Nutrition Data for Philly Wings Express
// Based on industry standards for fried chicken wings and common sides
// All values are approximate and should be verified with actual product testing

export const nutritionData = {
  // WINGS (base nutrition without sauce)
  wings: {
    '6-wings': {
      id: '6-wings',
      name: '6 Wings',
      servingSize: '6 wings',
      calories: 540,
      caloriesFromFat: 324,
      totalFat: 36,
      saturatedFat: 10,
      transFat: 0,
      cholesterol: 180,
      sodium: 720,
      totalCarbs: 6,
      dietaryFiber: 0,
      sugars: 0,
      protein: 48,
      vitaminA: 2,
      vitaminC: 0,
      calcium: 4,
      iron: 10,
      allergens: ['soy', 'wheat'],
      warning: 'Fried in oil that may contain allergens'
    },
    '12-wings': {
      id: '12-wings',
      name: '12 Wings',
      servingSize: '12 wings',
      calories: 1080,
      caloriesFromFat: 648,
      totalFat: 72,
      saturatedFat: 20,
      transFat: 0,
      cholesterol: 360,
      sodium: 1440,
      totalCarbs: 12,
      dietaryFiber: 0,
      sugars: 0,
      protein: 96,
      vitaminA: 4,
      vitaminC: 0,
      calcium: 8,
      iron: 20,
      allergens: ['soy', 'wheat'],
      warning: 'Fried in oil that may contain allergens'
    },
    '24-wings': {
      id: '24-wings',
      name: '24 Wings',
      servingSize: '24 wings',
      calories: 2160,
      caloriesFromFat: 1296,
      totalFat: 144,
      saturatedFat: 40,
      transFat: 0,
      cholesterol: 720,
      sodium: 2880,
      totalCarbs: 24,
      dietaryFiber: 0,
      sugars: 0,
      protein: 192,
      vitaminA: 8,
      vitaminC: 0,
      calcium: 16,
      iron: 40,
      allergens: ['soy', 'wheat'],
      warning: 'Fried in oil that may contain allergens'
    },
    '30-wings': {
      id: '30-wings',
      name: '30 Wings',
      servingSize: '30 wings',
      calories: 2700,
      caloriesFromFat: 1620,
      totalFat: 180,
      saturatedFat: 50,
      transFat: 0,
      cholesterol: 900,
      sodium: 3600,
      totalCarbs: 30,
      dietaryFiber: 0,
      sugars: 0,
      protein: 240,
      vitaminA: 10,
      vitaminC: 0,
      calcium: 20,
      iron: 50,
      allergens: ['soy', 'wheat'],
      warning: 'Fried in oil that may contain allergens'
    },
    '50-wings': {
      id: '50-wings',
      name: '50 Wing Party Pack',
      servingSize: '50 wings',
      calories: 4500,
      caloriesFromFat: 2700,
      totalFat: 300,
      saturatedFat: 83,
      transFat: 0,
      cholesterol: 1500,
      sodium: 6000,
      totalCarbs: 50,
      dietaryFiber: 0,
      sugars: 0,
      protein: 400,
      vitaminA: 17,
      vitaminC: 0,
      calcium: 33,
      iron: 83,
      allergens: ['soy', 'wheat'],
      warning: 'Fried in oil that may contain allergens'
    }
  },

  // SAUCES (per 2 oz serving - typical amount for 6 wings)
  sauces: {
    'classic-lemon-pepper': {
      id: 'classic-lemon-pepper',
      name: 'Classic Lemon Pepper (Dry Rub)',
      servingSize: '1 oz seasoning',
      calories: 20,
      totalFat: 0,
      saturatedFat: 0,
      transFat: 0,
      cholesterol: 0,
      sodium: 380,
      totalCarbs: 4,
      dietaryFiber: 1,
      sugars: 0,
      protein: 1,
      allergens: [],
      warning: 'Contains black pepper and citrus'
    },
    'northeast-hot-lemon': {
      id: 'northeast-hot-lemon',
      name: 'Northeast Hot Lemon (Dry Rub)',
      servingSize: '1 oz seasoning',
      calories: 25,
      totalFat: 0,
      saturatedFat: 0,
      transFat: 0,
      cholesterol: 0,
      sodium: 420,
      totalCarbs: 5,
      dietaryFiber: 1,
      sugars: 0,
      protein: 1,
      allergens: [],
      warning: 'Contains cayenne pepper - spicy'
    },
    'frankford-cajun': {
      id: 'frankford-cajun',
      name: 'Frankford Cajun (Dry Rub)',
      servingSize: '1 oz seasoning',
      calories: 30,
      totalFat: 0,
      saturatedFat: 0,
      transFat: 0,
      cholesterol: 0,
      sodium: 460,
      totalCarbs: 6,
      dietaryFiber: 2,
      sugars: 1,
      protein: 1,
      allergens: [],
      warning: 'Contains paprika and garlic'
    },
    'sweet-teriyaki': {
      id: 'sweet-teriyaki',
      name: 'Sweet Teriyaki',
      servingSize: '2 oz',
      calories: 130,
      totalFat: 0,
      saturatedFat: 0,
      transFat: 0,
      cholesterol: 0,
      sodium: 1020,
      totalCarbs: 32,
      dietaryFiber: 0,
      sugars: 26,
      protein: 2,
      allergens: ['soy', 'wheat'],
      warning: 'Contains soy sauce and sesame'
    },
    'tailgate-bbq': {
      id: 'tailgate-bbq',
      name: 'Tailgate BBQ',
      servingSize: '2 oz',
      calories: 140,
      totalFat: 0,
      saturatedFat: 0,
      transFat: 0,
      cholesterol: 0,
      sodium: 580,
      totalCarbs: 34,
      dietaryFiber: 0,
      sugars: 28,
      protein: 0,
      allergens: [],
      warning: 'Contains high fructose corn syrup'
    },
    'mild-buffalo': {
      id: 'mild-buffalo',
      name: 'Mild Buffalo',
      servingSize: '2 oz',
      calories: 20,
      totalFat: 2,
      saturatedFat: 0,
      transFat: 0,
      cholesterol: 0,
      sodium: 920,
      totalCarbs: 2,
      dietaryFiber: 0,
      sugars: 0,
      protein: 0,
      allergens: [],
      warning: 'Contains cayenne pepper sauce'
    },
    'philly-classic-hot': {
      id: 'philly-classic-hot',
      name: 'Philly Classic Hot',
      servingSize: '2 oz',
      calories: 25,
      totalFat: 2,
      saturatedFat: 0,
      transFat: 0,
      cholesterol: 0,
      sodium: 1200,
      totalCarbs: 2,
      dietaryFiber: 0,
      sugars: 0,
      protein: 0,
      allergens: [],
      warning: 'Hot sauce - contains cayenne'
    },
    'broad-pattison-burn': {
      id: 'broad-pattison-burn',
      name: 'Broad & Pattison Burn',
      servingSize: '2 oz',
      calories: 80,
      totalFat: 3,
      saturatedFat: 0,
      transFat: 0,
      cholesterol: 0,
      sodium: 980,
      totalCarbs: 12,
      dietaryFiber: 1,
      sugars: 8,
      protein: 0,
      allergens: [],
      warning: 'Nashville hot - very spicy with cayenne and brown sugar'
    },
    'grittys-revenge': {
      id: 'grittys-revenge',
      name: "Gritty's Revenge",
      servingSize: '2 oz',
      calories: 40,
      totalFat: 3,
      saturatedFat: 0,
      transFat: 0,
      cholesterol: 0,
      sodium: 1400,
      totalCarbs: 3,
      dietaryFiber: 1,
      sugars: 1,
      protein: 0,
      allergens: [],
      warning: 'EXTREME HEAT - Scorpion pepper sauce. Not for children!'
    }
  },

  // DIPPING SAUCES (per 1.5 oz cup)
  dippingSauces: {
    'ranch': {
      id: 'ranch',
      name: 'Ranch',
      servingSize: '1.5 oz',
      calories: 190,
      totalFat: 20,
      saturatedFat: 3,
      transFat: 0,
      cholesterol: 10,
      sodium: 420,
      totalCarbs: 2,
      dietaryFiber: 0,
      sugars: 1,
      protein: 1,
      allergens: ['milk', 'egg'],
      warning: 'Contains dairy and egg'
    },
    'honey-mustard': {
      id: 'honey-mustard',
      name: 'Honey Mustard',
      servingSize: '1.5 oz',
      calories: 140,
      totalFat: 12,
      saturatedFat: 2,
      transFat: 0,
      cholesterol: 10,
      sodium: 220,
      totalCarbs: 8,
      dietaryFiber: 0,
      sugars: 6,
      protein: 0,
      allergens: ['egg'],
      warning: 'Contains honey and mustard seed'
    },
    'blue-cheese': {
      id: 'blue-cheese',
      name: 'Blue Cheese',
      servingSize: '1.5 oz',
      calories: 200,
      totalFat: 21,
      saturatedFat: 4,
      transFat: 0,
      cholesterol: 20,
      sodium: 480,
      totalCarbs: 2,
      dietaryFiber: 0,
      sugars: 1,
      protein: 2,
      allergens: ['milk'],
      warning: 'Contains dairy and blue cheese cultures'
    }
  },

  // SIDES
  sides: {
    'loaded-fries': {
      id: 'loaded-fries',
      name: 'Loaded Fries',
      servingSize: '1 order',
      calories: 680,
      totalFat: 42,
      saturatedFat: 18,
      transFat: 0,
      cholesterol: 80,
      sodium: 1420,
      totalCarbs: 52,
      dietaryFiber: 4,
      sugars: 2,
      protein: 20,
      allergens: ['milk'],
      warning: 'Contains cheese sauce and bacon'
    },
    'mozzarella-sticks': {
      id: 'mozzarella-sticks',
      name: 'Mozzarella Sticks (6)',
      servingSize: '6 sticks',
      calories: 540,
      totalFat: 28,
      saturatedFat: 14,
      transFat: 0,
      cholesterol: 60,
      sodium: 1260,
      totalCarbs: 48,
      dietaryFiber: 2,
      sugars: 4,
      protein: 24,
      allergens: ['milk', 'wheat'],
      warning: 'Contains dairy and wheat breading'
    },
    'french-fries': {
      id: 'french-fries',
      name: 'French Fries',
      servingSize: '1 medium order',
      calories: 380,
      totalFat: 18,
      saturatedFat: 3,
      transFat: 0,
      cholesterol: 0,
      sodium: 290,
      totalCarbs: 48,
      dietaryFiber: 4,
      sugars: 0,
      protein: 4,
      allergens: [],
      warning: 'Fried in shared oil'
    },
    'bottled-water': {
      id: 'bottled-water',
      name: 'Bottled Water',
      servingSize: '16.9 oz',
      calories: 0,
      totalFat: 0,
      saturatedFat: 0,
      transFat: 0,
      cholesterol: 0,
      sodium: 0,
      totalCarbs: 0,
      dietaryFiber: 0,
      sugars: 0,
      protein: 0,
      allergens: [],
      warning: ''
    }
  },

  // COMBOS (calculated from components)
  combos: {
    'the-tailgater': {
      id: 'the-tailgater',
      name: 'The Tailgater',
      servingSize: '20 wings, large fries, 4 drinks',
      calories: 2580, // 20 wings (1800) + large fries (780)
      totalFat: 150,
      saturatedFat: 39,
      transFat: 0,
      cholesterol: 600,
      sodium: 4100,
      totalCarbs: 118,
      dietaryFiber: 8,
      sugars: 0,
      protein: 164,
      allergens: ['soy', 'wheat'],
      warning: 'Serves 3-4 people. Contains multiple allergens.'
    },
    'mvp-meal': {
      id: 'mvp-meal',
      name: 'MVP Meal',
      servingSize: '12 wings, fries, drink',
      calories: 1460, // 12 wings (1080) + fries (380)
      totalFat: 90,
      saturatedFat: 23,
      transFat: 0,
      cholesterol: 360,
      sodium: 1730,
      totalCarbs: 60,
      dietaryFiber: 4,
      sugars: 0,
      protein: 100,
      allergens: ['soy', 'wheat'],
      warning: 'Single serving meal deal'
    },
    'sampler-platter': {
      id: 'sampler-platter',
      name: 'Sampler Platter',
      servingSize: '6 wings, mozz sticks, loaded fries',
      calories: 1760, // 6 wings (540) + mozz (540) + loaded fries (680)
      totalFat: 106,
      saturatedFat: 42,
      transFat: 0,
      cholesterol: 320,
      sodium: 3400,
      totalCarbs: 106,
      dietaryFiber: 6,
      sugars: 6,
      protein: 92,
      allergens: ['soy', 'wheat', 'milk'],
      warning: 'Serves 2-3 people. Contains dairy.'
    }
  }
};

// Helper function to calculate nutrition with sauce
export function calculateNutritionWithSauce(wingItem, sauceItem) {
  if (!wingItem || !sauceItem) return wingItem;

  return {
    ...wingItem,
    calories: wingItem.calories + sauceItem.calories,
    totalFat: wingItem.totalFat + sauceItem.totalFat,
    saturatedFat: wingItem.saturatedFat + sauceItem.saturatedFat,
    sodium: wingItem.sodium + sauceItem.sodium,
    totalCarbs: wingItem.totalCarbs + sauceItem.totalCarbs,
    sugars: wingItem.sugars + sauceItem.sugars,
    allergens: [...new Set([...wingItem.allergens, ...sauceItem.allergens])]
  };
}

// Export function to get nutrition by item ID
export function getNutritionById(category, itemId) {
  return nutritionData[category]?.[itemId] || null;
}

// Calculate daily value percentages
export function calculateDailyValues(nutrition) {
  const dailyValues = {
    totalFat: 65, // grams
    saturatedFat: 20, // grams
    cholesterol: 300, // mg
    sodium: 2300, // mg
    totalCarbs: 300, // grams
    dietaryFiber: 25, // grams
    protein: 50 // grams
  };

  return {
    totalFatDV: Math.round((nutrition.totalFat / dailyValues.totalFat) * 100),
    saturatedFatDV: Math.round((nutrition.saturatedFat / dailyValues.saturatedFat) * 100),
    cholesterolDV: Math.round((nutrition.cholesterol / dailyValues.cholesterol) * 100),
    sodiumDV: Math.round((nutrition.sodium / dailyValues.sodium) * 100),
    totalCarbsDV: Math.round((nutrition.totalCarbs / dailyValues.totalCarbs) * 100),
    dietaryFiberDV: Math.round((nutrition.dietaryFiber / dailyValues.dietaryFiber) * 100),
    proteinDV: Math.round((nutrition.protein / dailyValues.protein) * 100)
  };
}