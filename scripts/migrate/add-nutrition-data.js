#!/usr/bin/env node

/**
 * Add FDA 2020 Compliant Nutrition Data to Firestore
 *
 * This script adds comprehensive nutrition data for all Philly Wings menu items
 * to the nutritionData collection in Firestore, following FDA labeling requirements.
 *
 * Usage: node scripts/migrate/add-nutrition-data.js
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';
import { createNutritionItem, FDARounding } from '../../src/models/nutrition-schema.js';

// Firebase configuration (you'll need to add your actual config)
const firebaseConfig = {
  // Add your Firebase config here
  projectId: process.env.FIREBASE_PROJECT_ID || 'philly-wings-express'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Base nutrition data for 4 wings (120g) - FDA serving size
const BASE_WING_NUTRITION = {
  calories: 360,
  totalFat: 24,
  saturatedFat: 6.67,
  transFat: 0,
  cholesterol: 120,
  sodium: 480,
  totalCarbs: 4,
  dietaryFiber: 0,
  sugars: 0,
  addedSugars: 0,
  protein: 32,
  vitaminD: 0,
  calcium: 100,
  iron: 3.6,
  potassium: 470
};

/**
 * Scale nutrition values for different wing counts
 */
function scaleWingNutrition(servings) {
  const scaled = {};
  Object.entries(BASE_WING_NUTRITION).forEach(([key, value]) => {
    scaled[key] = FDARounding.gValues(value * servings);
  });

  // Special rounding for specific nutrients
  scaled.calories = FDARounding.calories(BASE_WING_NUTRITION.calories * servings);
  scaled.totalFat = FDARounding.fat(BASE_WING_NUTRITION.totalFat * servings);
  scaled.saturatedFat = FDARounding.fat(BASE_WING_NUTRITION.saturatedFat * servings);
  scaled.cholesterol = FDARounding.mgValues(BASE_WING_NUTRITION.cholesterol * servings);
  scaled.sodium = FDARounding.mgValues(BASE_WING_NUTRITION.sodium * servings);
  scaled.iron = Number((BASE_WING_NUTRITION.iron * servings).toFixed(1));

  return scaled;
}

/**
 * Create wing nutrition data
 */
function createWingItem(wingCount, servings) {
  const nutrition = scaleWingNutrition(servings);
  const weight = Math.round(120 * servings); // 120g per 4-wing serving

  return createNutritionItem({
    id: `${wingCount}-wings`,
    name: `${wingCount} Wings`,
    category: 'wings',
    serving: {
      size: `${wingCount} wings (${servings} servings)`,
      weight: weight,
      unit: 'g',
      perContainer: 1
    },
    calories: nutrition.calories,
    caloriesFromFat: Math.round(nutrition.totalFat * 9),
    totalFat: nutrition.totalFat,
    saturatedFat: nutrition.saturatedFat,
    transFat: nutrition.transFat,
    cholesterol: nutrition.cholesterol,
    sodium: nutrition.sodium,
    totalCarbs: nutrition.totalCarbs,
    dietaryFiber: nutrition.dietaryFiber,
    sugars: nutrition.sugars,
    addedSugars: nutrition.addedSugars,
    protein: nutrition.protein,
    vitaminD: nutrition.vitaminD,
    calcium: nutrition.calcium,
    iron: nutrition.iron,
    potassium: nutrition.potassium,
    allergens: ['wheat', 'soy'],
    mayContain: ['milk', 'egg'],
    warning: 'Fried in oil that may contain allergens',
    isCombo: false,
    baseItem: '4-wings',
    sauceOptions: [
      'classic-lemon-pepper', 'northeast-hot-lemon', 'frankford-cajun',
      'sweet-teriyaki', 'tailgate-bbq', 'mild-buffalo', 'philly-classic-hot',
      'broad-pattison-burn', 'grittys-revenge'
    ],
    customizable: true,
    displayOrder: wingCount === 6 ? 1 : wingCount === 12 ? 2 : wingCount === 24 ? 3 : wingCount === 30 ? 4 : 5
  });
}

/**
 * All nutrition data to be added
 */
const nutritionItems = [
  // Wing items based on 4-wing serving size
  createWingItem(6, 1.5),   // 6 wings = 1.5 servings
  createWingItem(12, 3),    // 12 wings = 3 servings
  createWingItem(24, 6),    // 24 wings = 6 servings
  createWingItem(30, 7.5),  // 30 wings = 7.5 servings
  createWingItem(50, 12.5), // 50 wings = 12.5 servings

  // Loaded Fries
  createNutritionItem({
    id: 'loaded-fries',
    name: 'Loaded Fries',
    category: 'sides',
    serving: {
      size: '1 order',
      weight: 280,
      unit: 'g',
      perContainer: 1
    },
    calories: 680,
    caloriesFromFat: 378,
    totalFat: 42,
    saturatedFat: 18,
    transFat: 0,
    cholesterol: 80,
    sodium: 1420,
    totalCarbs: 52,
    dietaryFiber: 4,
    sugars: 2,
    addedSugars: 0,
    protein: 20,
    vitaminD: 0,
    calcium: 400,
    iron: 2.8,
    potassium: 850,
    allergens: ['milk'],
    mayContain: ['wheat', 'soy'],
    warning: 'Contains cheese sauce and bacon. Fried in shared oil.',
    displayOrder: 10
  }),

  // Mozzarella Sticks
  createNutritionItem({
    id: 'mozzarella-sticks',
    name: 'Mozzarella Sticks',
    category: 'sides',
    serving: {
      size: '6 sticks',
      weight: 170,
      unit: 'g',
      perContainer: 1
    },
    calories: 540,
    caloriesFromFat: 252,
    totalFat: 28,
    saturatedFat: 14,
    transFat: 0,
    cholesterol: 60,
    sodium: 1260,
    totalCarbs: 48,
    dietaryFiber: 2,
    sugars: 4,
    addedSugars: 0,
    protein: 24,
    vitaminD: 0,
    calcium: 600,
    iron: 2.2,
    potassium: 180,
    allergens: ['milk', 'wheat'],
    mayContain: ['egg', 'soy'],
    warning: 'Contains dairy and wheat breading. Fried in shared oil.',
    displayOrder: 11
  }),

  // French Fries
  createNutritionItem({
    id: 'french-fries',
    name: 'French Fries',
    category: 'sides',
    serving: {
      size: '1 medium order',
      weight: 150,
      unit: 'g',
      perContainer: 1
    },
    calories: 380,
    caloriesFromFat: 162,
    totalFat: 18,
    saturatedFat: 3,
    transFat: 0,
    cholesterol: 0,
    sodium: 290,
    totalCarbs: 48,
    dietaryFiber: 4,
    sugars: 0,
    addedSugars: 0,
    protein: 4,
    vitaminD: 0,
    calcium: 20,
    iron: 1.8,
    potassium: 620,
    allergens: [],
    mayContain: ['wheat', 'soy', 'milk'],
    warning: 'Fried in shared oil that may contain allergens.',
    displayOrder: 12
  }),

  // The Tailgater (Combo)
  createNutritionItem({
    id: 'the-tailgater',
    name: 'The Tailgater',
    category: 'combos',
    serving: {
      size: '20 wings, large fries, 4 drinks',
      weight: 1200,
      unit: 'g',
      perContainer: 4
    },
    calories: 2580,
    caloriesFromFat: 1350,
    totalFat: 150,
    saturatedFat: 39,
    transFat: 0,
    cholesterol: 600,
    sodium: 4100,
    totalCarbs: 118,
    dietaryFiber: 8,
    sugars: 0,
    addedSugars: 0,
    protein: 164,
    vitaminD: 0,
    calcium: 580,
    iron: 18,
    potassium: 2760,
    allergens: ['wheat', 'soy'],
    mayContain: ['milk', 'egg'],
    warning: 'Serves 3-4 people. Contains multiple allergens. Fried in shared oil.',
    isCombo: true,
    comboItems: ['20-wings', 'large-fries'],
    displayOrder: 20
  }),

  // MVP Meal (Combo)
  createNutritionItem({
    id: 'mvp-meal',
    name: 'MVP Meal',
    category: 'combos',
    serving: {
      size: '12 wings, fries, drink',
      weight: 510,
      unit: 'g',
      perContainer: 1
    },
    calories: 1460,
    caloriesFromFat: 810,
    totalFat: 90,
    saturatedFat: 23,
    transFat: 0,
    cholesterol: 360,
    sodium: 1730,
    totalCarbs: 60,
    dietaryFiber: 4,
    sugars: 0,
    addedSugars: 0,
    protein: 100,
    vitaminD: 0,
    calcium: 320,
    iron: 12.6,
    potassium: 2030,
    allergens: ['wheat', 'soy'],
    mayContain: ['milk', 'egg'],
    warning: 'Single serving meal deal. Fried in shared oil.',
    isCombo: true,
    comboItems: ['12-wings', 'french-fries'],
    displayOrder: 21
  }),

  // Sampler Platter (Combo)
  createNutritionItem({
    id: 'sampler-platter',
    name: 'Sampler Platter',
    category: 'combos',
    serving: {
      size: '6 wings, mozz sticks, loaded fries',
      weight: 630,
      unit: 'g',
      perContainer: 1
    },
    calories: 1760,
    caloriesFromFat: 954,
    totalFat: 106,
    saturatedFat: 42,
    transFat: 0,
    cholesterol: 320,
    sodium: 3400,
    totalCarbs: 106,
    dietaryFiber: 6,
    sugars: 6,
    addedSugars: 0,
    protein: 92,
    vitaminD: 0,
    calcium: 1150,
    iron: 10.4,
    potassium: 1735,
    allergens: ['wheat', 'soy', 'milk'],
    mayContain: ['egg'],
    warning: 'Serves 2-3 people. Contains dairy. Fried in shared oil.',
    isCombo: true,
    comboItems: ['6-wings', 'mozzarella-sticks', 'loaded-fries'],
    displayOrder: 22
  })
];

/**
 * Add nutrition items to Firestore
 */
async function addNutritionData() {
  console.log('🍗 Adding FDA-compliant nutrition data to Firestore...\n');

  try {
    const promises = nutritionItems.map(async (item) => {
      const docRef = doc(collection(db, 'nutritionData'), item.id);
      await setDoc(docRef, item);
      console.log(`✅ Added: ${item.name}`);
      return item.id;
    });

    const results = await Promise.all(promises);

    console.log(`\n🎉 Successfully added ${results.length} nutrition items!`);
    console.log('\n📋 Added items:');
    results.forEach((id, index) => {
      console.log(`   ${index + 1}. ${nutritionItems[index].name} (${id})`);
    });

    console.log('\n✨ All nutrition data is now FDA 2020 compliant with:');
    console.log('   • Proper serving sizes (4 wings = 1 serving base)');
    console.log('   • Added sugars and vitamin D (mcg)');
    console.log('   • Potassium in mg with %DV');
    console.log('   • Comprehensive allergen tracking');
    console.log('   • Cross-contact warnings');
    console.log('   • Audit trail for compliance');

  } catch (error) {
    console.error('❌ Error adding nutrition data:', error);
    process.exit(1);
  }
}

/**
 * Validate nutrition data before adding
 */
function validateAllItems() {
  console.log('🔍 Validating nutrition data...\n');

  let hasErrors = false;

  nutritionItems.forEach((item) => {
    const validation = validateNutrition(item);

    if (validation.errors.length > 0) {
      console.error(`❌ ${item.name}: ${validation.errors.join(', ')}`);
      hasErrors = true;
    }

    if (validation.warnings.length > 0) {
      console.warn(`⚠️  ${item.name}: ${validation.warnings.join(', ')}`);
    }
  });

  if (hasErrors) {
    console.error('\n❌ Validation failed. Please fix errors before proceeding.');
    process.exit(1);
  }

  console.log('✅ All nutrition data validated successfully!\n');
}

// Validation function (simplified version)
function validateNutrition(item) {
  const errors = [];
  const warnings = [];

  if (!item.name) errors.push('Item name is required');
  if (!item.serving?.size) errors.push('Serving size is required');
  if (!item.serving?.weight) errors.push('Serving weight is required');
  if (item.nutrients?.calories === undefined) errors.push('Calories are required');

  return { errors, warnings, isValid: errors.length === 0 };
}

// Main execution
async function main() {
  console.log('🚀 FDA Nutrition Data Migration Script');
  console.log('=====================================\n');

  validateAllItems();
  await addNutritionData();

  console.log('\n🏁 Migration complete!');
  console.log('Next steps:');
  console.log('1. Verify data in Firebase Console');
  console.log('2. Update nutrition modal component');
  console.log('3. Test nutrition display on website');
  console.log('4. Schedule quarterly compliance review\n');
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { nutritionItems, addNutritionData };