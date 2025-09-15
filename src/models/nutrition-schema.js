// Enhanced Nutrition Schema for Philly Wings Express
// FDA-compliant structure following 21 CFR 101.11 requirements

export const NutritionSchema = {
  // Unique identifier
  id: String,
  
  // Display name
  name: String,
  
  // Category: wings, sauces, sides, combos, drinks
  category: String,
  
  // Serving information
  serving: {
    size: String,        // "6 wings" - consumer-friendly description
    weight: Number,      // 168 - weight in grams
    unit: String,        // "g" - always grams for consistency
    perContainer: Number // 1 - servings per container
  },
  
  // Nutrients with FDA-compliant structure
  nutrients: {
    // Macronutrients (mandatory)
    calories: Number,
    caloriesFromFat: Number, // Optional post-2020, but we'll keep for transparency
    
    totalFat: { 
      amount: Number, 
      unit: String, // "g"
      dv: Number    // Daily Value percentage
    },
    saturatedFat: { 
      amount: Number, 
      unit: String, // "g"
      dv: Number 
    },
    transFat: { 
      amount: Number, 
      unit: String  // "g" - no DV for trans fat
    },
    
    cholesterol: { 
      amount: Number, 
      unit: String, // "mg"
      dv: Number 
    },
    sodium: { 
      amount: Number, 
      unit: String, // "mg"
      dv: Number 
    },
    
    totalCarbs: { 
      amount: Number, 
      unit: String, // "g"
      dv: Number 
    },
    dietaryFiber: { 
      amount: Number, 
      unit: String, // "g"
      dv: Number 
    },
    totalSugars: { 
      amount: Number, 
      unit: String  // "g" - no DV for total sugars
    },
    addedSugars: { 
      amount: Number, 
      unit: String, // "g"
      dv: Number    // NEW - required as of 2020
    },
    
    protein: { 
      amount: Number, 
      unit: String, // "g"
      dv: Number 
    },
    
    // Micronutrients (updated requirements)
    vitaminD: { 
      amount: Number, 
      unit: String, // "mcg"
      dv: Number    // NEW - required as of 2020
    },
    calcium: { 
      amount: Number, 
      unit: String, // "mg"
      dv: Number 
    },
    iron: { 
      amount: Number, 
      unit: String, // "mg"
      dv: Number 
    },
    potassium: { 
      amount: Number, 
      unit: String, // "mg"
      dv: Number    // NEW - required as of 2020
    }
  },
  
  // Allergen information with enhanced tracking
  allergens: {
    contains: [String],      // ["wheat", "soy"] - allergens present
    mayContain: [String],    // Cross-contact risks
    freeFrom: [String],      // Explicitly free from these allergens
    crossContactWarning: String, // "Fried in oil that may contain allergens"
    supplierVerified: Boolean    // Supplier allergen statement on file
  },
  
  // Compliance tracking
  compliance: {
    lastUpdated: Date,
    updatedBy: String,       // User who made the update
    verifiedBy: String,      // Nutritionist/compliance officer
    labTestDate: Date,       // Last third-party lab test
    labTestResults: String,  // Reference to lab report
    supplierCerts: [{
      supplier: String,
      certType: String,      // "allergen", "nutrition", "organic", etc.
      validUntil: Date,
      documentUrl: String
    }],
    auditTrail: [{
      date: Date,
      action: String,        // "created", "updated", "verified"
      user: String,
      changes: Object        // What was changed
    }]
  },
  
  // Marketing claims (must be substantiated)
  claims: {
    glutenFree: Boolean,
    vegan: Boolean,
    vegetarian: Boolean,
    organic: Boolean,
    nonGMO: Boolean,
    keto: Boolean,          // <5g net carbs
    highProtein: Boolean,   // >20% DV
    lowSodium: Boolean,     // <140mg
    reducedCalorie: Boolean,// 25% fewer calories than reference
    natural: Boolean,
    noArtificialColors: Boolean,
    noArtificialFlavors: Boolean
  },
  
  // Additional metadata
  metadata: {
    isCombo: Boolean,       // Combination of multiple items
    comboItems: [String],   // IDs of items in combo
    baseItem: String,       // For items with multiple variations
    sauceOptions: [String], // Available sauce IDs
    customizable: Boolean,  // Can be modified
    seasonal: Boolean,      // Limited time item
    active: Boolean,        // Currently on menu
    displayOrder: Number    // Menu display order
  }
};

// Helper function to create a new nutrition item with defaults
export function createNutritionItem(data) {
  return {
    id: data.id || generateId(),
    name: data.name,
    category: data.category,
    
    serving: {
      size: data.serving?.size || '',
      weight: data.serving?.weight || 0,
      unit: data.serving?.unit || 'g',
      perContainer: data.serving?.perContainer || 1
    },
    
    nutrients: {
      calories: data.calories || 0,
      caloriesFromFat: data.caloriesFromFat || 0,
      
      totalFat: createNutrient(data.totalFat, 'g', 65),
      saturatedFat: createNutrient(data.saturatedFat, 'g', 20),
      transFat: createNutrient(data.transFat, 'g'),
      
      cholesterol: createNutrient(data.cholesterol, 'mg', 300),
      sodium: createNutrient(data.sodium, 'mg', 2300),
      
      totalCarbs: createNutrient(data.totalCarbs, 'g', 300),
      dietaryFiber: createNutrient(data.dietaryFiber, 'g', 25),
      totalSugars: createNutrient(data.sugars || data.totalSugars, 'g'),
      addedSugars: createNutrient(data.addedSugars || 0, 'g', 50),
      
      protein: createNutrient(data.protein, 'g', 50),
      
      vitaminD: createNutrient(data.vitaminD || 0, 'mcg', 20),
      calcium: createNutrient(data.calcium || 0, 'mg', 1300),
      iron: createNutrient(data.iron || 0, 'mg', 18),
      potassium: createNutrient(data.potassium || 0, 'mg', 4700)
    },
    
    allergens: {
      contains: data.allergens || [],
      mayContain: data.mayContain || [],
      freeFrom: data.freeFrom || [],
      crossContactWarning: data.warning || '',
      supplierVerified: false
    },
    
    compliance: {
      lastUpdated: new Date(),
      updatedBy: 'system',
      verifiedBy: null,
      labTestDate: null,
      labTestResults: null,
      supplierCerts: [],
      auditTrail: [{
        date: new Date(),
        action: 'created',
        user: 'system',
        changes: { initial: true }
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
      isCombo: data.isCombo || false,
      comboItems: data.comboItems || [],
      baseItem: data.baseItem || null,
      sauceOptions: data.sauceOptions || [],
      customizable: data.customizable || false,
      seasonal: data.seasonal || false,
      active: true,
      displayOrder: data.displayOrder || 999
    }
  };
}

// Helper to create nutrient object with daily value calculation
function createNutrient(value, unit, dailyValue) {
  if (typeof value === 'object') {
    return value; // Already formatted
  }
  
  const amount = value || 0;
  const nutrient = { amount, unit };
  
  if (dailyValue) {
    nutrient.dv = Math.round((amount / dailyValue) * 100);
  }
  
  return nutrient;
}

// Generate unique ID
function generateId() {
  return `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// FDA Rounding Rules
export const FDARounding = {
  // Round calories according to FDA rules
  calories(value) {
    if (value < 5) return 0;
    if (value <= 50) return Math.round(value / 5) * 5;
    return Math.round(value / 10) * 10;
  },
  
  // Round fat values
  fat(value) {
    if (value < 0.5) return 0;
    if (value <= 5) return Math.round(value * 2) / 2; // Round to 0.5
    return Math.round(value);
  },
  
  // Round cholesterol and sodium
  mgValues(value) {
    if (value < 5) return 0;
    if (value <= 140) return Math.round(value / 5) * 5;
    return Math.round(value / 10) * 10;
  },
  
  // Round carbs, fiber, sugars, protein
  gValues(value) {
    if (value < 0.5) return 0;
    if (value < 1) return '<1';
    return Math.round(value);
  },
  
  // Round percentage daily values
  percentDV(value) {
    return Math.round(value);
  }
};

// Daily Values for 2000 calorie diet (FDA standards)
export const DailyValues = {
  totalFat: 65,         // g
  saturatedFat: 20,     // g
  cholesterol: 300,     // mg
  sodium: 2300,         // mg
  totalCarbs: 300,      // g
  dietaryFiber: 25,     // g
  addedSugars: 50,      // g
  protein: 50,          // g
  vitaminD: 20,         // mcg
  calcium: 1300,        // mg
  iron: 18,             // mg
  potassium: 4700       // mg
};

// Calculate all daily values for an item
export function calculateDailyValues(nutrients) {
  const dvs = {};
  
  Object.entries(nutrients).forEach(([key, nutrient]) => {
    if (nutrient && typeof nutrient === 'object' && DailyValues[key]) {
      nutrient.dv = FDARounding.percentDV(
        (nutrient.amount / DailyValues[key]) * 100
      );
    }
  });
  
  return nutrients;
}

// Validate nutrition data for FDA compliance
export function validateNutrition(item) {
  const errors = [];
  const warnings = [];
  
  // Required fields
  if (!item.name) errors.push('Item name is required');
  if (!item.serving?.size) errors.push('Serving size is required');
  if (!item.serving?.weight) errors.push('Serving weight in grams is required');
  if (item.nutrients?.calories === undefined) errors.push('Calories are required');
  
  // Check for new FDA requirements (2020)
  if (item.nutrients?.addedSugars === undefined) {
    warnings.push('Added sugars are required as of 2020 FDA rules');
  }
  if (item.nutrients?.vitaminD === undefined) {
    warnings.push('Vitamin D is required as of 2020 FDA rules');
  }
  if (item.nutrients?.potassium === undefined) {
    warnings.push('Potassium is required as of 2020 FDA rules');
  }
  
  // Allergen requirements
  if (!item.allergens?.contains && !item.allergens?.freeFrom) {
    warnings.push('Allergen information should be provided');
  }
  
  // Cross-contact warning for fried items
  if (item.category === 'wings' || item.category === 'sides') {
    if (!item.allergens?.crossContactWarning) {
      warnings.push('Cross-contact warning recommended for fried items');
    }
  }
  
  return { errors, warnings, isValid: errors.length === 0 };
}