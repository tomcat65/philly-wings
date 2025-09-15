// FDA 2020 Compliant Nutrition Data for Firebase

const nutritionItems = [
  {
    id: "6-wings",
    name: "6 Wings",
    category: "wings",
    servingSize: "4 wings (120g)",
    servingsPerContainer: 1.5,
    serving: {
      size: "4 wings (120g)",
      weight: 120,
      unit: "g",
      perContainer: 1.5
    },
    nutrients: {
      calories: 360,
      caloriesFromFat: 216,
      totalFat: { amount: 24, unit: "g", dv: 31 },
      saturatedFat: { amount: 6.67, unit: "g", dv: 33 },
      transFat: { amount: 0, unit: "g" },
      cholesterol: { amount: 120, unit: "mg", dv: 40 },
      sodium: { amount: 480, unit: "mg", dv: 21 },
      totalCarbs: { amount: 4, unit: "g", dv: 1 },
      dietaryFiber: { amount: 0, unit: "g", dv: 0 },
      totalSugars: { amount: 0, unit: "g" },
      addedSugars: { amount: 0, unit: "g", dv: 0 },
      protein: { amount: 32, unit: "g", dv: 64 },
      vitaminD: { amount: 0, unit: "mcg", dv: 0 },
      calcium: { amount: 100, unit: "mg", dv: 8 },
      iron: { amount: 3.6, unit: "mg", dv: 20 },
      potassium: { amount: 470, unit: "mg", dv: 10 }
    },
    allergens: {
      contains: ["wheat", "soy"],
      mayContain: ["milk", "egg"],
      freeFrom: [],
      crossContactWarning: "Fried in oil that may contain allergens"
    }
  },
  {
    id: "12-wings",
    name: "12 Wings",
    category: "wings",
    servingSize: "4 wings (120g)",
    servingsPerContainer: 3,
    serving: {
      size: "4 wings (120g)",
      weight: 120,
      unit: "g",
      perContainer: 3
    },
    nutrients: {
      calories: 360,
      caloriesFromFat: 216,
      totalFat: { amount: 24, unit: "g", dv: 31 },
      saturatedFat: { amount: 6.67, unit: "g", dv: 33 },
      transFat: { amount: 0, unit: "g" },
      cholesterol: { amount: 120, unit: "mg", dv: 40 },
      sodium: { amount: 480, unit: "mg", dv: 21 },
      totalCarbs: { amount: 4, unit: "g", dv: 1 },
      dietaryFiber: { amount: 0, unit: "g", dv: 0 },
      totalSugars: { amount: 0, unit: "g" },
      addedSugars: { amount: 0, unit: "g", dv: 0 },
      protein: { amount: 32, unit: "g", dv: 64 },
      vitaminD: { amount: 0, unit: "mcg", dv: 0 },
      calcium: { amount: 100, unit: "mg", dv: 8 },
      iron: { amount: 3.6, unit: "mg", dv: 20 },
      potassium: { amount: 470, unit: "mg", dv: 10 }
    },
    allergens: {
      contains: ["wheat", "soy"],
      mayContain: ["milk", "egg"],
      freeFrom: [],
      crossContactWarning: "Fried in oil that may contain allergens"
    }
  },
  {
    id: "24-wings",
    name: "24 Wings",
    category: "wings",
    servingSize: "4 wings (120g)",
    servingsPerContainer: 6,
    serving: {
      size: "4 wings (120g)",
      weight: 120,
      unit: "g",
      perContainer: 6
    },
    nutrients: {
      calories: 360,
      caloriesFromFat: 216,
      totalFat: { amount: 24, unit: "g", dv: 31 },
      saturatedFat: { amount: 6.67, unit: "g", dv: 33 },
      transFat: { amount: 0, unit: "g" },
      cholesterol: { amount: 120, unit: "mg", dv: 40 },
      sodium: { amount: 480, unit: "mg", dv: 21 },
      totalCarbs: { amount: 4, unit: "g", dv: 1 },
      dietaryFiber: { amount: 0, unit: "g", dv: 0 },
      totalSugars: { amount: 0, unit: "g" },
      addedSugars: { amount: 0, unit: "g", dv: 0 },
      protein: { amount: 32, unit: "g", dv: 64 },
      vitaminD: { amount: 0, unit: "mcg", dv: 0 },
      calcium: { amount: 100, unit: "mg", dv: 8 },
      iron: { amount: 3.6, unit: "mg", dv: 20 },
      potassium: { amount: 470, unit: "mg", dv: 10 }
    },
    allergens: {
      contains: ["wheat", "soy"],
      mayContain: ["milk", "egg"],
      freeFrom: [],
      crossContactWarning: "Fried in oil that may contain allergens"
    }
  },
  {
    id: "30-wings",
    name: "30 Wings",
    category: "wings",
    servingSize: "4 wings (120g)",
    servingsPerContainer: 7.5,
    serving: {
      size: "4 wings (120g)",
      weight: 120,
      unit: "g",
      perContainer: 7.5
    },
    nutrients: {
      calories: 360,
      caloriesFromFat: 216,
      totalFat: { amount: 24, unit: "g", dv: 31 },
      saturatedFat: { amount: 6.67, unit: "g", dv: 33 },
      transFat: { amount: 0, unit: "g" },
      cholesterol: { amount: 120, unit: "mg", dv: 40 },
      sodium: { amount: 480, unit: "mg", dv: 21 },
      totalCarbs: { amount: 4, unit: "g", dv: 1 },
      dietaryFiber: { amount: 0, unit: "g", dv: 0 },
      totalSugars: { amount: 0, unit: "g" },
      addedSugars: { amount: 0, unit: "g", dv: 0 },
      protein: { amount: 32, unit: "g", dv: 64 },
      vitaminD: { amount: 0, unit: "mcg", dv: 0 },
      calcium: { amount: 100, unit: "mg", dv: 8 },
      iron: { amount: 3.6, unit: "mg", dv: 20 },
      potassium: { amount: 470, unit: "mg", dv: 10 }
    },
    allergens: {
      contains: ["wheat", "soy"],
      mayContain: ["milk", "egg"],
      freeFrom: [],
      crossContactWarning: "Fried in oil that may contain allergens"
    }
  },
  {
    id: "50-wings",
    name: "50 Wing Party Pack",
    category: "wings",
    servingSize: "4 wings (120g)",
    servingsPerContainer: 12.5,
    serving: {
      size: "4 wings (120g)",
      weight: 120,
      unit: "g",
      perContainer: 12.5
    },
    nutrients: {
      calories: 360,
      caloriesFromFat: 216,
      totalFat: { amount: 24, unit: "g", dv: 31 },
      saturatedFat: { amount: 6.67, unit: "g", dv: 33 },
      transFat: { amount: 0, unit: "g" },
      cholesterol: { amount: 120, unit: "mg", dv: 40 },
      sodium: { amount: 480, unit: "mg", dv: 21 },
      totalCarbs: { amount: 4, unit: "g", dv: 1 },
      dietaryFiber: { amount: 0, unit: "g", dv: 0 },
      totalSugars: { amount: 0, unit: "g" },
      addedSugars: { amount: 0, unit: "g", dv: 0 },
      protein: { amount: 32, unit: "g", dv: 64 },
      vitaminD: { amount: 0, unit: "mcg", dv: 0 },
      calcium: { amount: 100, unit: "mg", dv: 8 },
      iron: { amount: 3.6, unit: "mg", dv: 20 },
      potassium: { amount: 470, unit: "mg", dv: 10 }
    },
    allergens: {
      contains: ["wheat", "soy"],
      mayContain: ["milk", "egg"],
      freeFrom: [],
      crossContactWarning: "Fried in oil that may contain allergens"
    }
  },
  {
    id: "loaded-fries",
    name: "Loaded Fries",
    category: "sides",
    servingSize: "1 serving (340g)",
    servingsPerContainer: 1,
    serving: {
      size: "1 serving",
      weight: 340,
      unit: "g",
      perContainer: 1
    },
    nutrients: {
      calories: 680,
      caloriesFromFat: 369,
      totalFat: { amount: 41, unit: "g", dv: 53 },
      saturatedFat: { amount: 14, unit: "g", dv: 70 },
      transFat: { amount: 0.5, unit: "g" },
      cholesterol: { amount: 65, unit: "mg", dv: 22 },
      sodium: { amount: 1420, unit: "mg", dv: 62 },
      totalCarbs: { amount: 58, unit: "g", dv: 21 },
      dietaryFiber: { amount: 5, unit: "g", dv: 18 },
      totalSugars: { amount: 2, unit: "g" },
      addedSugars: { amount: 0, unit: "g", dv: 0 },
      protein: { amount: 18, unit: "g", dv: 36 },
      vitaminD: { amount: 0.8, unit: "mcg", dv: 4 },
      calcium: { amount: 260, unit: "mg", dv: 20 },
      iron: { amount: 2.5, unit: "mg", dv: 14 },
      potassium: { amount: 980, unit: "mg", dv: 21 }
    },
    allergens: {
      contains: ["milk", "wheat"],
      mayContain: ["soy"],
      freeFrom: [],
      crossContactWarning: "May contain traces of other allergens"
    }
  },
  {
    id: "mozzarella-sticks",
    name: "Mozzarella Sticks",
    category: "sides",
    servingSize: "6 sticks (180g)",
    servingsPerContainer: 1,
    serving: {
      size: "6 sticks",
      weight: 180,
      unit: "g",
      perContainer: 1
    },
    nutrients: {
      calories: 540,
      caloriesFromFat: 270,
      totalFat: { amount: 30, unit: "g", dv: 38 },
      saturatedFat: { amount: 13, unit: "g", dv: 65 },
      transFat: { amount: 0, unit: "g" },
      cholesterol: { amount: 75, unit: "mg", dv: 25 },
      sodium: { amount: 1180, unit: "mg", dv: 51 },
      totalCarbs: { amount: 42, unit: "g", dv: 15 },
      dietaryFiber: { amount: 2, unit: "g", dv: 7 },
      totalSugars: { amount: 3, unit: "g" },
      addedSugars: { amount: 1, unit: "g", dv: 2 },
      protein: { amount: 24, unit: "g", dv: 48 },
      vitaminD: { amount: 0.6, unit: "mcg", dv: 3 },
      calcium: { amount: 520, unit: "mg", dv: 40 },
      iron: { amount: 1.8, unit: "mg", dv: 10 },
      potassium: { amount: 280, unit: "mg", dv: 6 }
    },
    allergens: {
      contains: ["milk", "wheat", "egg"],
      mayContain: ["soy"],
      freeFrom: [],
      crossContactWarning: "Fried in oil that may contain allergens"
    }
  },
  {
    id: "french-fries",
    name: "French Fries",
    category: "sides",
    servingSize: "1 medium (170g)",
    servingsPerContainer: 1,
    serving: {
      size: "1 medium",
      weight: 170,
      unit: "g",
      perContainer: 1
    },
    nutrients: {
      calories: 380,
      caloriesFromFat: 162,
      totalFat: { amount: 18, unit: "g", dv: 23 },
      saturatedFat: { amount: 2.5, unit: "g", dv: 13 },
      transFat: { amount: 0, unit: "g" },
      cholesterol: { amount: 0, unit: "mg", dv: 0 },
      sodium: { amount: 320, unit: "mg", dv: 14 },
      totalCarbs: { amount: 50, unit: "g", dv: 18 },
      dietaryFiber: { amount: 5, unit: "g", dv: 18 },
      totalSugars: { amount: 0, unit: "g" },
      addedSugars: { amount: 0, unit: "g", dv: 0 },
      protein: { amount: 4, unit: "g", dv: 8 },
      vitaminD: { amount: 0, unit: "mcg", dv: 0 },
      calcium: { amount: 20, unit: "mg", dv: 2 },
      iron: { amount: 1.1, unit: "mg", dv: 6 },
      potassium: { amount: 750, unit: "mg", dv: 16 }
    },
    allergens: {
      contains: [],
      mayContain: ["wheat", "soy"],
      freeFrom: ["milk", "egg", "nuts"],
      crossContactWarning: "Fried in shared fryer"
    }
  },
  {
    id: "the-tailgater",
    name: "The Tailgater",
    category: "combos",
    servingSize: "1/4 of combo",
    servingsPerContainer: 4,
    serving: {
      size: "1/4 of combo",
      weight: 350,
      unit: "g",
      perContainer: 4
    },
    nutrients: {
      calories: 645,
      caloriesFromFat: 306,
      totalFat: { amount: 34, unit: "g", dv: 44 },
      saturatedFat: { amount: 8.5, unit: "g", dv: 43 },
      transFat: { amount: 0, unit: "g" },
      cholesterol: { amount: 120, unit: "mg", dv: 40 },
      sodium: { amount: 800, unit: "mg", dv: 35 },
      totalCarbs: { amount: 41, unit: "g", dv: 15 },
      dietaryFiber: { amount: 3, unit: "g", dv: 11 },
      totalSugars: { amount: 2, unit: "g" },
      addedSugars: { amount: 0, unit: "g", dv: 0 },
      protein: { amount: 38, unit: "g", dv: 76 },
      vitaminD: { amount: 0, unit: "mcg", dv: 0 },
      calcium: { amount: 110, unit: "mg", dv: 8 },
      iron: { amount: 4.2, unit: "mg", dv: 23 },
      potassium: { amount: 620, unit: "mg", dv: 13 }
    },
    allergens: {
      contains: ["wheat", "soy"],
      mayContain: ["milk", "egg"],
      freeFrom: [],
      crossContactWarning: "Contains multiple menu items"
    }
  },
  {
    id: "mvp-meal",
    name: "MVP Meal",
    category: "combos",
    servingSize: "1 meal",
    servingsPerContainer: 1,
    serving: {
      size: "1 meal",
      weight: 530,
      unit: "g",
      perContainer: 1
    },
    nutrients: {
      calories: 1460,
      caloriesFromFat: 648,
      totalFat: { amount: 72, unit: "g", dv: 92 },
      saturatedFat: { amount: 22.5, unit: "g", dv: 113 },
      transFat: { amount: 0, unit: "g" },
      cholesterol: { amount: 360, unit: "mg", dv: 120 },
      sodium: { amount: 1760, unit: "mg", dv: 77 },
      totalCarbs: { amount: 66, unit: "g", dv: 24 },
      dietaryFiber: { amount: 5, unit: "g", dv: 18 },
      totalSugars: { amount: 2, unit: "g" },
      addedSugars: { amount: 0, unit: "g", dv: 0 },
      protein: { amount: 100, unit: "g", dv: 200 },
      vitaminD: { amount: 0, unit: "mcg", dv: 0 },
      calcium: { amount: 320, unit: "mg", dv: 25 },
      iron: { amount: 11.9, unit: "mg", dv: 66 },
      potassium: { amount: 1640, unit: "mg", dv: 35 }
    },
    allergens: {
      contains: ["wheat", "soy"],
      mayContain: ["milk", "egg"],
      freeFrom: [],
      crossContactWarning: "Contains multiple menu items"
    }
  },
  {
    id: "sampler-platter",
    name: "Sampler Platter",
    category: "combos",
    servingSize: "1/2 of platter",
    servingsPerContainer: 2,
    serving: {
      size: "1/2 of platter",
      weight: 400,
      unit: "g",
      perContainer: 2
    },
    nutrients: {
      calories: 880,
      caloriesFromFat: 477,
      totalFat: { amount: 53, unit: "g", dv: 68 },
      saturatedFat: { amount: 17, unit: "g", dv: 85 },
      transFat: { amount: 0.25, unit: "g" },
      cholesterol: { amount: 155, unit: "mg", dv: 52 },
      sodium: { amount: 1400, unit: "mg", dv: 61 },
      totalCarbs: { amount: 60, unit: "g", dv: 22 },
      dietaryFiber: { amount: 4, unit: "g", dv: 14 },
      totalSugars: { amount: 3, unit: "g" },
      addedSugars: { amount: 0.5, unit: "g", dv: 1 },
      protein: { amount: 38, unit: "g", dv: 76 },
      vitaminD: { amount: 0.4, unit: "mcg", dv: 2 },
      calcium: { amount: 310, unit: "mg", dv: 24 },
      iron: { amount: 4.2, unit: "mg", dv: 23 },
      potassium: { amount: 770, unit: "mg", dv: 16 }
    },
    allergens: {
      contains: ["milk", "wheat", "soy", "egg"],
      mayContain: [],
      freeFrom: [],
      crossContactWarning: "Contains multiple menu items"
    }
  }
];

// Export for use in scripts
console.log(JSON.stringify(nutritionItems, null, 2));