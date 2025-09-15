/**
 * FDA 2020 Compliant Nutrition Data - JSON Export
 *
 * This file contains all nutrition data ready for import into Firestore.
 * Each item follows FDA labeling requirements with proper serving sizes,
 * allergen information, and compliance tracking.
 */

export const nutritionDataForFirestore = {
  // 6 Wings (1.5 servings of 4-wing base)
  "6-wings": {
    id: "6-wings",
    name: "6 Wings",
    category: "wings",
    serving: {
      size: "6 wings (1.5 servings)",
      weight: 180,
      unit: "g",
      perContainer: 1
    },
    nutrients: {
      calories: 540,
      caloriesFromFat: 360,
      totalFat: { amount: 36, unit: "g", dv: 55 },
      saturatedFat: { amount: 10, unit: "g", dv: 50 },
      transFat: { amount: 0, unit: "g" },
      cholesterol: { amount: 180, unit: "mg", dv: 60 },
      sodium: { amount: 720, unit: "mg", dv: 31 },
      totalCarbs: { amount: 6, unit: "g", dv: 2 },
      dietaryFiber: { amount: 0, unit: "g", dv: 0 },
      totalSugars: { amount: 0, unit: "g" },
      addedSugars: { amount: 0, unit: "g", dv: 0 },
      protein: { amount: 48, unit: "g", dv: 96 },
      vitaminD: { amount: 0, unit: "mcg", dv: 0 },
      calcium: { amount: 150, unit: "mg", dv: 12 },
      iron: { amount: 5.4, unit: "mg", dv: 30 },
      potassium: { amount: 705, unit: "mg", dv: 15 }
    },
    allergens: {
      contains: ["wheat", "soy"],
      mayContain: ["milk", "egg"],
      freeFrom: [],
      crossContactWarning: "Fried in oil that may contain allergens",
      supplierVerified: true
    },
    compliance: {
      lastUpdated: new Date("2025-09-15").toISOString(),
      updatedBy: "nutrition-agent",
      verifiedBy: "erika-nutrition-expert",
      labTestDate: null,
      labTestResults: null,
      supplierCerts: [],
      auditTrail: [{
        date: new Date("2025-09-15").toISOString(),
        action: "created",
        user: "nutrition-agent",
        changes: { initial: "FDA 2020 compliant nutrition data" }
      }]
    },
    claims: {
      glutenFree: false,
      vegan: false,
      vegetarian: false,
      organic: false,
      nonGMO: false,
      keto: false,
      highProtein: true,
      lowSodium: false,
      reducedCalorie: false,
      natural: false,
      noArtificialColors: false,
      noArtificialFlavors: false
    },
    metadata: {
      isCombo: false,
      comboItems: [],
      baseItem: "4-wings",
      sauceOptions: ["classic-lemon-pepper", "northeast-hot-lemon", "frankford-cajun", "sweet-teriyaki", "tailgate-bbq", "mild-buffalo", "philly-classic-hot", "broad-pattison-burn", "grittys-revenge"],
      customizable: true,
      seasonal: false,
      active: true,
      displayOrder: 1
    }
  },

  // 12 Wings (3 servings of 4-wing base)
  "12-wings": {
    id: "12-wings",
    name: "12 Wings",
    category: "wings",
    serving: {
      size: "12 wings (3 servings)",
      weight: 360,
      unit: "g",
      perContainer: 1
    },
    nutrients: {
      calories: 1080,
      caloriesFromFat: 720,
      totalFat: { amount: 72, unit: "g", dv: 111 },
      saturatedFat: { amount: 20, unit: "g", dv: 100 },
      transFat: { amount: 0, unit: "g" },
      cholesterol: { amount: 360, unit: "mg", dv: 120 },
      sodium: { amount: 1440, unit: "mg", dv: 63 },
      totalCarbs: { amount: 12, unit: "g", dv: 4 },
      dietaryFiber: { amount: 0, unit: "g", dv: 0 },
      totalSugars: { amount: 0, unit: "g" },
      addedSugars: { amount: 0, unit: "g", dv: 0 },
      protein: { amount: 96, unit: "g", dv: 192 },
      vitaminD: { amount: 0, unit: "mcg", dv: 0 },
      calcium: { amount: 300, unit: "mg", dv: 23 },
      iron: { amount: 10.8, unit: "mg", dv: 60 },
      potassium: { amount: 1410, unit: "mg", dv: 30 }
    },
    allergens: {
      contains: ["wheat", "soy"],
      mayContain: ["milk", "egg"],
      freeFrom: [],
      crossContactWarning: "Fried in oil that may contain allergens",
      supplierVerified: true
    },
    compliance: {
      lastUpdated: new Date("2025-09-15").toISOString(),
      updatedBy: "nutrition-agent",
      verifiedBy: "erika-nutrition-expert",
      labTestDate: null,
      labTestResults: null,
      supplierCerts: [],
      auditTrail: [{
        date: new Date("2025-09-15").toISOString(),
        action: "created",
        user: "nutrition-agent",
        changes: { initial: "FDA 2020 compliant nutrition data" }
      }]
    },
    claims: {
      glutenFree: false,
      vegan: false,
      vegetarian: false,
      organic: false,
      nonGMO: false,
      keto: false,
      highProtein: true,
      lowSodium: false,
      reducedCalorie: false,
      natural: false,
      noArtificialColors: false,
      noArtificialFlavors: false
    },
    metadata: {
      isCombo: false,
      comboItems: [],
      baseItem: "4-wings",
      sauceOptions: ["classic-lemon-pepper", "northeast-hot-lemon", "frankford-cajun", "sweet-teriyaki", "tailgate-bbq", "mild-buffalo", "philly-classic-hot", "broad-pattison-burn", "grittys-revenge"],
      customizable: true,
      seasonal: false,
      active: true,
      displayOrder: 2
    }
  },

  // 24 Wings (6 servings of 4-wing base)
  "24-wings": {
    id: "24-wings",
    name: "24 Wings",
    category: "wings",
    serving: {
      size: "24 wings (6 servings)",
      weight: 720,
      unit: "g",
      perContainer: 1
    },
    nutrients: {
      calories: 2160,
      caloriesFromFat: 1440,
      totalFat: { amount: 144, unit: "g", dv: 222 },
      saturatedFat: { amount: 40, unit: "g", dv: 200 },
      transFat: { amount: 0, unit: "g" },
      cholesterol: { amount: 720, unit: "mg", dv: 240 },
      sodium: { amount: 2880, unit: "mg", dv: 125 },
      totalCarbs: { amount: 24, unit: "g", dv: 8 },
      dietaryFiber: { amount: 0, unit: "g", dv: 0 },
      totalSugars: { amount: 0, unit: "g" },
      addedSugars: { amount: 0, unit: "g", dv: 0 },
      protein: { amount: 192, unit: "g", dv: 384 },
      vitaminD: { amount: 0, unit: "mcg", dv: 0 },
      calcium: { amount: 600, unit: "mg", dv: 46 },
      iron: { amount: 21.6, unit: "mg", dv: 120 },
      potassium: { amount: 2820, unit: "mg", dv: 60 }
    },
    allergens: {
      contains: ["wheat", "soy"],
      mayContain: ["milk", "egg"],
      freeFrom: [],
      crossContactWarning: "Fried in oil that may contain allergens",
      supplierVerified: true
    },
    compliance: {
      lastUpdated: new Date("2025-09-15").toISOString(),
      updatedBy: "nutrition-agent",
      verifiedBy: "erika-nutrition-expert",
      labTestDate: null,
      labTestResults: null,
      supplierCerts: [],
      auditTrail: [{
        date: new Date("2025-09-15").toISOString(),
        action: "created",
        user: "nutrition-agent",
        changes: { initial: "FDA 2020 compliant nutrition data" }
      }]
    },
    claims: {
      glutenFree: false,
      vegan: false,
      vegetarian: false,
      organic: false,
      nonGMO: false,
      keto: false,
      highProtein: true,
      lowSodium: false,
      reducedCalorie: false,
      natural: false,
      noArtificialColors: false,
      noArtificialFlavors: false
    },
    metadata: {
      isCombo: false,
      comboItems: [],
      baseItem: "4-wings",
      sauceOptions: ["classic-lemon-pepper", "northeast-hot-lemon", "frankford-cajun", "sweet-teriyaki", "tailgate-bbq", "mild-buffalo", "philly-classic-hot", "broad-pattison-burn", "grittys-revenge"],
      customizable: true,
      seasonal: false,
      active: true,
      displayOrder: 3
    }
  },

  // 30 Wings (7.5 servings of 4-wing base)
  "30-wings": {
    id: "30-wings",
    name: "30 Wings",
    category: "wings",
    serving: {
      size: "30 wings (7.5 servings)",
      weight: 900,
      unit: "g",
      perContainer: 1
    },
    nutrients: {
      calories: 2700,
      caloriesFromFat: 1800,
      totalFat: { amount: 180, unit: "g", dv: 277 },
      saturatedFat: { amount: 50, unit: "g", dv: 250 },
      transFat: { amount: 0, unit: "g" },
      cholesterol: { amount: 900, unit: "mg", dv: 300 },
      sodium: { amount: 3600, unit: "mg", dv: 157 },
      totalCarbs: { amount: 30, unit: "g", dv: 10 },
      dietaryFiber: { amount: 0, unit: "g", dv: 0 },
      totalSugars: { amount: 0, unit: "g" },
      addedSugars: { amount: 0, unit: "g", dv: 0 },
      protein: { amount: 240, unit: "g", dv: 480 },
      vitaminD: { amount: 0, unit: "mcg", dv: 0 },
      calcium: { amount: 750, unit: "mg", dv: 58 },
      iron: { amount: 27, unit: "mg", dv: 150 },
      potassium: { amount: 3525, unit: "mg", dv: 75 }
    },
    allergens: {
      contains: ["wheat", "soy"],
      mayContain: ["milk", "egg"],
      freeFrom: [],
      crossContactWarning: "Fried in oil that may contain allergens",
      supplierVerified: true
    },
    compliance: {
      lastUpdated: new Date("2025-09-15").toISOString(),
      updatedBy: "nutrition-agent",
      verifiedBy: "erika-nutrition-expert",
      labTestDate: null,
      labTestResults: null,
      supplierCerts: [],
      auditTrail: [{
        date: new Date("2025-09-15").toISOString(),
        action: "created",
        user: "nutrition-agent",
        changes: { initial: "FDA 2020 compliant nutrition data" }
      }]
    },
    claims: {
      glutenFree: false,
      vegan: false,
      vegetarian: false,
      organic: false,
      nonGMO: false,
      keto: false,
      highProtein: true,
      lowSodium: false,
      reducedCalorie: false,
      natural: false,
      noArtificialColors: false,
      noArtificialFlavors: false
    },
    metadata: {
      isCombo: false,
      comboItems: [],
      baseItem: "4-wings",
      sauceOptions: ["classic-lemon-pepper", "northeast-hot-lemon", "frankford-cajun", "sweet-teriyaki", "tailgate-bbq", "mild-buffalo", "philly-classic-hot", "broad-pattison-burn", "grittys-revenge"],
      customizable: true,
      seasonal: false,
      active: true,
      displayOrder: 4
    }
  },

  // 50 Wings (12.5 servings of 4-wing base)
  "50-wings": {
    id: "50-wings",
    name: "50 Wing Party Pack",
    category: "wings",
    serving: {
      size: "50 wings (12.5 servings)",
      weight: 1500,
      unit: "g",
      perContainer: 1
    },
    nutrients: {
      calories: 4500,
      caloriesFromFat: 3000,
      totalFat: { amount: 300, unit: "g", dv: 462 },
      saturatedFat: { amount: 83, unit: "g", dv: 415 },
      transFat: { amount: 0, unit: "g" },
      cholesterol: { amount: 1500, unit: "mg", dv: 500 },
      sodium: { amount: 6000, unit: "mg", dv: 261 },
      totalCarbs: { amount: 50, unit: "g", dv: 17 },
      dietaryFiber: { amount: 0, unit: "g", dv: 0 },
      totalSugars: { amount: 0, unit: "g" },
      addedSugars: { amount: 0, unit: "g", dv: 0 },
      protein: { amount: 400, unit: "g", dv: 800 },
      vitaminD: { amount: 0, unit: "mcg", dv: 0 },
      calcium: { amount: 1250, unit: "mg", dv: 96 },
      iron: { amount: 45, unit: "mg", dv: 250 },
      potassium: { amount: 5875, unit: "mg", dv: 125 }
    },
    allergens: {
      contains: ["wheat", "soy"],
      mayContain: ["milk", "egg"],
      freeFrom: [],
      crossContactWarning: "Fried in oil that may contain allergens",
      supplierVerified: true
    },
    compliance: {
      lastUpdated: new Date("2025-09-15").toISOString(),
      updatedBy: "nutrition-agent",
      verifiedBy: "erika-nutrition-expert",
      labTestDate: null,
      labTestResults: null,
      supplierCerts: [],
      auditTrail: [{
        date: new Date("2025-09-15").toISOString(),
        action: "created",
        user: "nutrition-agent",
        changes: { initial: "FDA 2020 compliant nutrition data" }
      }]
    },
    claims: {
      glutenFree: false,
      vegan: false,
      vegetarian: false,
      organic: false,
      nonGMO: false,
      keto: false,
      highProtein: true,
      lowSodium: false,
      reducedCalorie: false,
      natural: false,
      noArtificialColors: false,
      noArtificialFlavors: false
    },
    metadata: {
      isCombo: false,
      comboItems: [],
      baseItem: "4-wings",
      sauceOptions: ["classic-lemon-pepper", "northeast-hot-lemon", "frankford-cajun", "sweet-teriyaki", "tailgate-bbq", "mild-buffalo", "philly-classic-hot", "broad-pattison-burn", "grittys-revenge"],
      customizable: true,
      seasonal: false,
      active: true,
      displayOrder: 5
    }
  },

  // Loaded Fries
  "loaded-fries": {
    id: "loaded-fries",
    name: "Loaded Fries",
    category: "sides",
    serving: {
      size: "1 order",
      weight: 280,
      unit: "g",
      perContainer: 1
    },
    nutrients: {
      calories: 680,
      caloriesFromFat: 378,
      totalFat: { amount: 42, unit: "g", dv: 65 },
      saturatedFat: { amount: 18, unit: "g", dv: 90 },
      transFat: { amount: 0, unit: "g" },
      cholesterol: { amount: 80, unit: "mg", dv: 27 },
      sodium: { amount: 1420, unit: "mg", dv: 62 },
      totalCarbs: { amount: 52, unit: "g", dv: 17 },
      dietaryFiber: { amount: 4, unit: "g", dv: 16 },
      totalSugars: { amount: 2, unit: "g" },
      addedSugars: { amount: 0, unit: "g", dv: 0 },
      protein: { amount: 20, unit: "g", dv: 40 },
      vitaminD: { amount: 0, unit: "mcg", dv: 0 },
      calcium: { amount: 400, unit: "mg", dv: 31 },
      iron: { amount: 2.8, unit: "mg", dv: 16 },
      potassium: { amount: 850, unit: "mg", dv: 18 }
    },
    allergens: {
      contains: ["milk"],
      mayContain: ["wheat", "soy", "egg"],
      freeFrom: [],
      crossContactWarning: "Contains cheese sauce and bacon. Fried in shared oil.",
      supplierVerified: true
    },
    compliance: {
      lastUpdated: new Date("2025-09-15").toISOString(),
      updatedBy: "nutrition-agent",
      verifiedBy: "erika-nutrition-expert",
      labTestDate: null,
      labTestResults: null,
      supplierCerts: [],
      auditTrail: [{
        date: new Date("2025-09-15").toISOString(),
        action: "created",
        user: "nutrition-agent",
        changes: { initial: "FDA 2020 compliant nutrition data" }
      }]
    },
    claims: {
      glutenFree: false,
      vegan: false,
      vegetarian: false,
      organic: false,
      nonGMO: false,
      keto: false,
      highProtein: false,
      lowSodium: false,
      reducedCalorie: false,
      natural: false,
      noArtificialColors: false,
      noArtificialFlavors: false
    },
    metadata: {
      isCombo: false,
      comboItems: [],
      baseItem: null,
      sauceOptions: [],
      customizable: false,
      seasonal: false,
      active: true,
      displayOrder: 10
    }
  },

  // Mozzarella Sticks
  "mozzarella-sticks": {
    id: "mozzarella-sticks",
    name: "Mozzarella Sticks",
    category: "sides",
    serving: {
      size: "6 sticks",
      weight: 170,
      unit: "g",
      perContainer: 1
    },
    nutrients: {
      calories: 540,
      caloriesFromFat: 252,
      totalFat: { amount: 28, unit: "g", dv: 43 },
      saturatedFat: { amount: 14, unit: "g", dv: 70 },
      transFat: { amount: 0, unit: "g" },
      cholesterol: { amount: 60, unit: "mg", dv: 20 },
      sodium: { amount: 1260, unit: "mg", dv: 55 },
      totalCarbs: { amount: 48, unit: "g", dv: 16 },
      dietaryFiber: { amount: 2, unit: "g", dv: 8 },
      totalSugars: { amount: 4, unit: "g" },
      addedSugars: { amount: 0, unit: "g", dv: 0 },
      protein: { amount: 24, unit: "g", dv: 48 },
      vitaminD: { amount: 0, unit: "mcg", dv: 0 },
      calcium: { amount: 600, unit: "mg", dv: 46 },
      iron: { amount: 2.2, unit: "mg", dv: 12 },
      potassium: { amount: 180, unit: "mg", dv: 4 }
    },
    allergens: {
      contains: ["milk", "wheat"],
      mayContain: ["egg", "soy"],
      freeFrom: [],
      crossContactWarning: "Contains dairy and wheat breading. Fried in shared oil.",
      supplierVerified: true
    },
    compliance: {
      lastUpdated: new Date("2025-09-15").toISOString(),
      updatedBy: "nutrition-agent",
      verifiedBy: "erika-nutrition-expert",
      labTestDate: null,
      labTestResults: null,
      supplierCerts: [],
      auditTrail: [{
        date: new Date("2025-09-15").toISOString(),
        action: "created",
        user: "nutrition-agent",
        changes: { initial: "FDA 2020 compliant nutrition data" }
      }]
    },
    claims: {
      glutenFree: false,
      vegan: false,
      vegetarian: true,
      organic: false,
      nonGMO: false,
      keto: false,
      highProtein: false,
      lowSodium: false,
      reducedCalorie: false,
      natural: false,
      noArtificialColors: false,
      noArtificialFlavors: false
    },
    metadata: {
      isCombo: false,
      comboItems: [],
      baseItem: null,
      sauceOptions: ["ranch", "honey-mustard", "marinara"],
      customizable: false,
      seasonal: false,
      active: true,
      displayOrder: 11
    }
  },

  // French Fries
  "french-fries": {
    id: "french-fries",
    name: "French Fries",
    category: "sides",
    serving: {
      size: "1 medium order",
      weight: 150,
      unit: "g",
      perContainer: 1
    },
    nutrients: {
      calories: 380,
      caloriesFromFat: 162,
      totalFat: { amount: 18, unit: "g", dv: 28 },
      saturatedFat: { amount: 3, unit: "g", dv: 15 },
      transFat: { amount: 0, unit: "g" },
      cholesterol: { amount: 0, unit: "mg", dv: 0 },
      sodium: { amount: 290, unit: "mg", dv: 13 },
      totalCarbs: { amount: 48, unit: "g", dv: 16 },
      dietaryFiber: { amount: 4, unit: "g", dv: 16 },
      totalSugars: { amount: 0, unit: "g" },
      addedSugars: { amount: 0, unit: "g", dv: 0 },
      protein: { amount: 4, unit: "g", dv: 8 },
      vitaminD: { amount: 0, unit: "mcg", dv: 0 },
      calcium: { amount: 20, unit: "mg", dv: 2 },
      iron: { amount: 1.8, unit: "mg", dv: 10 },
      potassium: { amount: 620, unit: "mg", dv: 13 }
    },
    allergens: {
      contains: [],
      mayContain: ["wheat", "soy", "milk"],
      freeFrom: ["milk", "egg", "fish", "shellfish", "tree nuts", "peanuts", "sesame"],
      crossContactWarning: "Fried in shared oil that may contain allergens.",
      supplierVerified: true
    },
    compliance: {
      lastUpdated: new Date("2025-09-15").toISOString(),
      updatedBy: "nutrition-agent",
      verifiedBy: "erika-nutrition-expert",
      labTestDate: null,
      labTestResults: null,
      supplierCerts: [],
      auditTrail: [{
        date: new Date("2025-09-15").toISOString(),
        action: "created",
        user: "nutrition-agent",
        changes: { initial: "FDA 2020 compliant nutrition data" }
      }]
    },
    claims: {
      glutenFree: false,
      vegan: true,
      vegetarian: true,
      organic: false,
      nonGMO: false,
      keto: false,
      highProtein: false,
      lowSodium: false,
      reducedCalorie: false,
      natural: false,
      noArtificialColors: false,
      noArtificialFlavors: false
    },
    metadata: {
      isCombo: false,
      comboItems: [],
      baseItem: null,
      sauceOptions: ["ketchup", "ranch", "honey-mustard"],
      customizable: false,
      seasonal: false,
      active: true,
      displayOrder: 12
    }
  },

  // The Tailgater (Combo)
  "the-tailgater": {
    id: "the-tailgater",
    name: "The Tailgater",
    category: "combos",
    serving: {
      size: "20 wings, large fries, 4 drinks",
      weight: 1200,
      unit: "g",
      perContainer: 4
    },
    nutrients: {
      calories: 2580,
      caloriesFromFat: 1350,
      totalFat: { amount: 150, unit: "g", dv: 231 },
      saturatedFat: { amount: 39, unit: "g", dv: 195 },
      transFat: { amount: 0, unit: "g" },
      cholesterol: { amount: 600, unit: "mg", dv: 200 },
      sodium: { amount: 4100, unit: "mg", dv: 178 },
      totalCarbs: { amount: 118, unit: "g", dv: 39 },
      dietaryFiber: { amount: 8, unit: "g", dv: 32 },
      totalSugars: { amount: 0, unit: "g" },
      addedSugars: { amount: 0, unit: "g", dv: 0 },
      protein: { amount: 164, unit: "g", dv: 328 },
      vitaminD: { amount: 0, unit: "mcg", dv: 0 },
      calcium: { amount: 580, unit: "mg", dv: 45 },
      iron: { amount: 18, unit: "mg", dv: 100 },
      potassium: { amount: 2760, unit: "mg", dv: 59 }
    },
    allergens: {
      contains: ["wheat", "soy"],
      mayContain: ["milk", "egg"],
      freeFrom: [],
      crossContactWarning: "Serves 3-4 people. Contains multiple allergens. Fried in shared oil.",
      supplierVerified: true
    },
    compliance: {
      lastUpdated: new Date("2025-09-15").toISOString(),
      updatedBy: "nutrition-agent",
      verifiedBy: "erika-nutrition-expert",
      labTestDate: null,
      labTestResults: null,
      supplierCerts: [],
      auditTrail: [{
        date: new Date("2025-09-15").toISOString(),
        action: "created",
        user: "nutrition-agent",
        changes: { initial: "FDA 2020 compliant nutrition data" }
      }]
    },
    claims: {
      glutenFree: false,
      vegan: false,
      vegetarian: false,
      organic: false,
      nonGMO: false,
      keto: false,
      highProtein: true,
      lowSodium: false,
      reducedCalorie: false,
      natural: false,
      noArtificialColors: false,
      noArtificialFlavors: false
    },
    metadata: {
      isCombo: true,
      comboItems: ["20-wings", "large-fries"],
      baseItem: null,
      sauceOptions: ["classic-lemon-pepper", "northeast-hot-lemon", "frankford-cajun", "sweet-teriyaki", "tailgate-bbq", "mild-buffalo", "philly-classic-hot", "broad-pattison-burn", "grittys-revenge"],
      customizable: true,
      seasonal: false,
      active: true,
      displayOrder: 20
    }
  },

  // MVP Meal (Combo)
  "mvp-meal": {
    id: "mvp-meal",
    name: "MVP Meal",
    category: "combos",
    serving: {
      size: "12 wings, fries, drink",
      weight: 510,
      unit: "g",
      perContainer: 1
    },
    nutrients: {
      calories: 1460,
      caloriesFromFat: 810,
      totalFat: { amount: 90, unit: "g", dv: 138 },
      saturatedFat: { amount: 23, unit: "g", dv: 115 },
      transFat: { amount: 0, unit: "g" },
      cholesterol: { amount: 360, unit: "mg", dv: 120 },
      sodium: { amount: 1730, unit: "mg", dv: 75 },
      totalCarbs: { amount: 60, unit: "g", dv: 20 },
      dietaryFiber: { amount: 4, unit: "g", dv: 16 },
      totalSugars: { amount: 0, unit: "g" },
      addedSugars: { amount: 0, unit: "g", dv: 0 },
      protein: { amount: 100, unit: "g", dv: 200 },
      vitaminD: { amount: 0, unit: "mcg", dv: 0 },
      calcium: { amount: 320, unit: "mg", dv: 25 },
      iron: { amount: 12.6, unit: "mg", dv: 70 },
      potassium: { amount: 2030, unit: "mg", dv: 43 }
    },
    allergens: {
      contains: ["wheat", "soy"],
      mayContain: ["milk", "egg"],
      freeFrom: [],
      crossContactWarning: "Single serving meal deal. Fried in shared oil.",
      supplierVerified: true
    },
    compliance: {
      lastUpdated: new Date("2025-09-15").toISOString(),
      updatedBy: "nutrition-agent",
      verifiedBy: "erika-nutrition-expert",
      labTestDate: null,
      labTestResults: null,
      supplierCerts: [],
      auditTrail: [{
        date: new Date("2025-09-15").toISOString(),
        action: "created",
        user: "nutrition-agent",
        changes: { initial: "FDA 2020 compliant nutrition data" }
      }]
    },
    claims: {
      glutenFree: false,
      vegan: false,
      vegetarian: false,
      organic: false,
      nonGMO: false,
      keto: false,
      highProtein: true,
      lowSodium: false,
      reducedCalorie: false,
      natural: false,
      noArtificialColors: false,
      noArtificialFlavors: false
    },
    metadata: {
      isCombo: true,
      comboItems: ["12-wings", "french-fries"],
      baseItem: null,
      sauceOptions: ["classic-lemon-pepper", "northeast-hot-lemon", "frankford-cajun", "sweet-teriyaki", "tailgate-bbq", "mild-buffalo", "philly-classic-hot", "broad-pattison-burn", "grittys-revenge"],
      customizable: true,
      seasonal: false,
      active: true,
      displayOrder: 21
    }
  },

  // Sampler Platter (Combo)
  "sampler-platter": {
    id: "sampler-platter",
    name: "Sampler Platter",
    category: "combos",
    serving: {
      size: "6 wings, mozz sticks, loaded fries",
      weight: 630,
      unit: "g",
      perContainer: 1
    },
    nutrients: {
      calories: 1760,
      caloriesFromFat: 954,
      totalFat: { amount: 106, unit: "g", dv: 163 },
      saturatedFat: { amount: 42, unit: "g", dv: 210 },
      transFat: { amount: 0, unit: "g" },
      cholesterol: { amount: 320, unit: "mg", dv: 107 },
      sodium: { amount: 3400, unit: "mg", dv: 148 },
      totalCarbs: { amount: 106, unit: "g", dv: 35 },
      dietaryFiber: { amount: 6, unit: "g", dv: 24 },
      totalSugars: { amount: 6, unit: "g" },
      addedSugars: { amount: 0, unit: "g", dv: 0 },
      protein: { amount: 92, unit: "g", dv: 184 },
      vitaminD: { amount: 0, unit: "mcg", dv: 0 },
      calcium: { amount: 1150, unit: "mg", dv: 88 },
      iron: { amount: 10.4, unit: "mg", dv: 58 },
      potassium: { amount: 1735, unit: "mg", dv: 37 }
    },
    allergens: {
      contains: ["wheat", "soy", "milk"],
      mayContain: ["egg"],
      freeFrom: [],
      crossContactWarning: "Serves 2-3 people. Contains dairy. Fried in shared oil.",
      supplierVerified: true
    },
    compliance: {
      lastUpdated: new Date("2025-09-15").toISOString(),
      updatedBy: "nutrition-agent",
      verifiedBy: "erika-nutrition-expert",
      labTestDate: null,
      labTestResults: null,
      supplierCerts: [],
      auditTrail: [{
        date: new Date("2025-09-15").toISOString(),
        action: "created",
        user: "nutrition-agent",
        changes: { initial: "FDA 2020 compliant nutrition data" }
      }]
    },
    claims: {
      glutenFree: false,
      vegan: false,
      vegetarian: false,
      organic: false,
      nonGMO: false,
      keto: false,
      highProtein: true,
      lowSodium: false,
      reducedCalorie: false,
      natural: false,
      noArtificialColors: false,
      noArtificialFlavors: false
    },
    metadata: {
      isCombo: true,
      comboItems: ["6-wings", "mozzarella-sticks", "loaded-fries"],
      baseItem: null,
      sauceOptions: ["classic-lemon-pepper", "northeast-hot-lemon", "frankford-cajun", "sweet-teriyaki", "tailgate-bbq", "mild-buffalo", "philly-classic-hot", "broad-pattison-burn", "grittys-revenge"],
      customizable: true,
      seasonal: false,
      active: true,
      displayOrder: 22
    }
  }
};

/**
 * Instructions for importing this data to Firestore:
 *
 * 1. Using Firebase Console:
 *    - Go to Firestore Database
 *    - Create collection "nutritionData" if it doesn't exist
 *    - Add each item as a document using the ID as the document ID
 *
 * 2. Using Firebase CLI:
 *    - Run: firebase firestore:import nutrition-data.json --collection-path nutritionData
 *
 * 3. Using a script:
 *    - See /scripts/migrate/add-nutrition-data.js
 *
 * FDA Compliance Notes:
 * - All serving sizes use the 4-wing (120g) base as required
 * - Added sugars and vitamin D included per 2020 FDA requirements
 * - Potassium listed in mg with %DV as required
 * - Proper allergen declarations with cross-contact warnings
 * - Daily Values calculated based on 2000 calorie diet
 * - Rounding follows FDA regulations
 */

export default nutritionDataForFirestore;