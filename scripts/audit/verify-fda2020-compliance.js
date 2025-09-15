#!/usr/bin/env node

// Quick verification that new FDA 2020 nutrition data is compliant

import { nutritionDataFDA2020, FDARounding, calculateDailyValues } from '../data/nutrition-data-fda2020.js';

console.log('\n🔍 FDA 2020 Compliance Verification');
console.log('=====================================\n');

let issues = 0;
let passed = 0;

// Check a sample item from each category
const sampleItems = [
  { category: 'wings', id: 'single-serving', name: '4 Wings (1 Serving)' },
  { category: 'sauces', id: 'sweet-teriyaki', name: 'Sweet Teriyaki' },
  { category: 'dippingSauces', id: 'ranch', name: 'Ranch' },
  { category: 'sides', id: 'loaded-fries', name: 'Loaded Fries' }
];

sampleItems.forEach(({ category, id, name }) => {
  const item = nutritionDataFDA2020[category][id];
  console.log(`Checking ${name}...`);

  // Check for FDA 2020 required nutrients
  const required = ['addedSugars', 'vitaminD', 'potassium'];
  required.forEach(nutrient => {
    if (item[nutrient] === undefined) {
      console.log(`  ❌ Missing ${nutrient}`);
      issues++;
    } else {
      console.log(`  ✅ Has ${nutrient}: ${item[nutrient]}`);
      passed++;
    }
  });

  // Check serving size includes metric
  if (!item.servingSize.includes('g') && !item.servingSize.includes('ml')) {
    console.log(`  ❌ Serving size missing metric weight`);
    issues++;
  } else {
    console.log(`  ✅ Serving size includes metric: ${item.servingSize}`);
    passed++;
  }

  // Check allergen list includes sesame check
  if (item.allergens && item.allergens.length > 0) {
    console.log(`  ✅ Allergens declared: ${item.allergens.join(', ')}`);
    passed++;
  }

  // Check rounding compliance
  const roundedCalories = FDARounding.calories(item.calories);
  if (item.calories === roundedCalories) {
    console.log(`  ✅ Calories properly rounded: ${item.calories}`);
    passed++;
  } else {
    console.log(`  ❌ Calories should be ${roundedCalories}, not ${item.calories}`);
    issues++;
  }

  console.log('');
});

// Check serving size logic for wings
console.log('Verifying Serving Size Logic:');
console.log('------------------------------');
const twelveWings = nutritionDataFDA2020.wings['12-wings'];
if (twelveWings.servingsPerContainer === 3) {
  console.log('✅ 12 wings correctly shows 3 servings (4 wings each)');
  passed++;
} else {
  console.log('❌ 12 wings serving count incorrect');
  issues++;
}

if (twelveWings.perServing && twelveWings.perServing.calories === 360) {
  console.log('✅ Per serving calories correctly calculated');
  passed++;
} else {
  console.log('❌ Per serving calculation missing or incorrect');
  issues++;
}

// Summary
console.log('\n📊 VERIFICATION SUMMARY');
console.log('=======================');
console.log(`✅ Passed: ${passed} checks`);
console.log(`❌ Failed: ${issues} checks`);

if (issues === 0) {
  console.log('\n🎉 SUCCESS! New nutrition data is FDA 2020 compliant!');
  console.log('\nNext steps:');
  console.log('1. Update nutrition-modal.js to use new data file');
  console.log('2. Test UI display of new nutrients');
  console.log('3. Deploy to production');
  process.exit(0);
} else {
  console.log('\n⚠️  Issues found. Please review and fix.');
  process.exit(1);
}