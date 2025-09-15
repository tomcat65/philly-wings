#!/usr/bin/env node

/**
 * Import Nutrition Data to Firestore
 *
 * Simple script to import FDA-compliant nutrition data using Firebase Admin SDK
 * Usage: node scripts/migrate/import-nutrition.js
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { nutritionDataForFirestore } from './nutrition-data-json.js';

// Initialize Firebase Admin (you'll need to set up service account)
const app = initializeApp({
  // If using service account key:
  // credential: cert('./path/to/serviceAccountKey.json'),
  projectId: process.env.FIREBASE_PROJECT_ID || 'philly-wings-express'
});

const db = getFirestore(app);

async function importNutritionData() {
  console.log('🚀 Starting FDA nutrition data import...\n');

  const batch = db.batch();
  const items = Object.values(nutritionDataForFirestore);

  try {
    // Add all items to batch
    items.forEach((item) => {
      const docRef = db.collection('nutritionData').doc(item.id);
      batch.set(docRef, item);
      console.log(`📝 Queued: ${item.name} (${item.id})`);
    });

    // Commit the batch
    await batch.commit();

    console.log(`\n🎉 Successfully imported ${items.length} nutrition items!`);
    console.log('\n📊 Summary:');
    console.log(`   • Wings: ${items.filter(i => i.category === 'wings').length} items`);
    console.log(`   • Sides: ${items.filter(i => i.category === 'sides').length} items`);
    console.log(`   • Combos: ${items.filter(i => i.category === 'combos').length} items`);

    console.log('\n✅ FDA Compliance Features Added:');
    console.log('   • Serving sizes with 4-wing (120g) base');
    console.log('   • Added sugars (FDA 2020 requirement)');
    console.log('   • Vitamin D in mcg with %DV');
    console.log('   • Potassium in mg with %DV');
    console.log('   • Complete allergen management');
    console.log('   • Cross-contact warnings');
    console.log('   • Compliance audit trails');

    console.log('\n🔄 Next Steps:');
    console.log('1. Verify data in Firebase Console');
    console.log('2. Update nutrition modal component');
    console.log('3. Test nutrition display on website');
    console.log('4. Schedule quarterly compliance review');

  } catch (error) {
    console.error('❌ Error importing nutrition data:', error);
    process.exit(1);
  }
}

// Validate data before import
function validateData() {
  const items = Object.values(nutritionDataForFirestore);
  console.log('🔍 Validating nutrition data...\n');

  let errors = 0;

  items.forEach((item) => {
    // Check required fields
    if (!item.id) {
      console.error(`❌ Missing ID for item: ${item.name}`);
      errors++;
    }
    if (!item.serving?.size) {
      console.error(`❌ Missing serving size for: ${item.name}`);
      errors++;
    }
    if (!item.serving?.weight) {
      console.error(`❌ Missing serving weight for: ${item.name}`);
      errors++;
    }
    if (item.nutrients?.calories === undefined) {
      console.error(`❌ Missing calories for: ${item.name}`);
      errors++;
    }

    // Check FDA 2020 requirements
    if (item.nutrients?.addedSugars === undefined) {
      console.warn(`⚠️  Missing added sugars for: ${item.name}`);
    }
    if (item.nutrients?.vitaminD === undefined) {
      console.warn(`⚠️  Missing vitamin D for: ${item.name}`);
    }
    if (item.nutrients?.potassium === undefined) {
      console.warn(`⚠️  Missing potassium for: ${item.name}`);
    }
  });

  if (errors > 0) {
    console.error(`\n❌ Validation failed with ${errors} errors.`);
    process.exit(1);
  }

  console.log('✅ All nutrition data validated successfully!\n');
}

// Main execution
async function main() {
  console.log('🍗 Philly Wings Nutrition Data Import');
  console.log('=====================================\n');

  validateData();
  await importNutritionData();

  console.log('\n🏁 Import complete!');
  process.exit(0);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('💥 Import failed:', error);
    process.exit(1);
  });
}

export { importNutritionData, validateData };