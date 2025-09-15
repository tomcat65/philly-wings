#!/usr/bin/env node

// Script to migrate nutrition data to Firebase Firestore
// Requires Firebase Admin SDK and service account credentials

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { nutritionData } from '../data/nutrition-data.js';
import { createNutritionItem } from '../../src/models/nutrition-schema.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check for service account credentials
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || 
  path.join(__dirname, '../../service-account-key.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Service account key not found!');
  console.error('Please set GOOGLE_APPLICATION_CREDENTIALS or place service-account-key.json in project root');
  console.error('\nTo get a service account key:');
  console.error('1. Go to Firebase Console > Project Settings > Service Accounts');
  console.error('2. Click "Generate new private key"');
  console.error('3. Save the file as service-account-key.json in project root');
  process.exit(1);
}

// Initialize Firebase Admin
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

console.log('🚀 Starting Firestore nutrition data migration...\n');

// Migration statistics
const stats = {
  total: 0,
  success: 0,
  errors: 0,
  startTime: Date.now()
};

// Helper to parse serving weight
function parseServingWeight(servingSize) {
  const defaultWeights = {
    '6 wings': 168,
    '12 wings': 336,
    '24 wings': 672,
    '30 wings': 840,
    '50 wings': 1400,
    '2 oz': 57,
    '1.5 oz': 43,
    '1 oz seasoning': 28,
    '1 order': 200,
    '6 sticks': 150,
    '1 medium order': 150,
    '16.9 oz': 500
  };
  
  return defaultWeights[servingSize] || 100;
}

// Batch write function
async function batchWriteItems(items, collectionName) {
  const batch = db.batch();
  let batchCount = 0;
  
  for (const [id, item] of Object.entries(items)) {
    const docRef = db.collection('nutrition').doc(collectionName).collection('items').doc(id);
    
    // Transform to enhanced schema
    const enhancedItem = createNutritionItem({
      id: item.id,
      name: item.name,
      category: collectionName,
      
      serving: {
        size: item.servingSize,
        weight: parseServingWeight(item.servingSize),
        unit: 'g',
        perContainer: 1
      },
      
      calories: item.calories,
      caloriesFromFat: item.caloriesFromFat,
      
      totalFat: item.totalFat,
      saturatedFat: item.saturatedFat,
      transFat: item.transFat,
      
      cholesterol: item.cholesterol,
      sodium: item.sodium,
      
      totalCarbs: item.totalCarbs,
      dietaryFiber: item.dietaryFiber,
      sugars: item.sugars,
      addedSugars: item.addedSugars || 0,
      
      protein: item.protein,
      
      vitaminA: item.vitaminA || 0,
      vitaminC: item.vitaminC || 0,
      calcium: item.calcium || 0,
      iron: item.iron || 0,
      vitaminD: 0, // Add default for missing nutrients
      potassium: 0,
      
      allergens: item.allergens || [],
      crossContactWarning: item.warning || ''
    });
    
    // Add Firestore metadata
    enhancedItem.compliance.lastUpdated = FieldValue.serverTimestamp();
    enhancedItem.compliance.updatedBy = 'migration-script';
    
    batch.set(docRef, enhancedItem);
    batchCount++;
    stats.total++;
    
    // Firestore has a limit of 500 operations per batch
    if (batchCount === 500) {
      await batch.commit();
      console.log(`  📦 Committed batch of 500 items`);
      batchCount = 0;
    }
  }
  
  // Commit remaining items
  if (batchCount > 0) {
    await batch.commit();
    console.log(`  📦 Committed final batch of ${batchCount} items`);
  }
}

// Create allergen matrix
async function createAllergenMatrix() {
  const allergenMatrix = {
    milk: [],
    eggs: [],
    fish: [],
    shellfish: [],
    treeNuts: [],
    peanuts: [],
    wheat: [],
    soybeans: [],
    sesame: []
  };
  
  // Build matrix from all categories
  Object.entries(nutritionData).forEach(([category, items]) => {
    Object.entries(items).forEach(([id, item]) => {
      if (item.allergens && item.allergens.length > 0) {
        item.allergens.forEach(allergen => {
          const key = allergen.toLowerCase().replace(/[\s-]/g, '');
          if (allergenMatrix[key]) {
            allergenMatrix[key].push({
              category,
              id: item.id,
              name: item.name
            });
          }
        });
      }
    });
  });
  
  // Save to Firestore
  await db.collection('nutrition').doc('allergenMatrix').set({
    matrix: allergenMatrix,
    lastUpdated: FieldValue.serverTimestamp(),
    updatedBy: 'migration-script'
  });
  
  console.log('✅ Allergen matrix created');
}

// Create category summaries
async function createCategorySummaries() {
  const summaries = {};
  
  Object.entries(nutritionData).forEach(([category, items]) => {
    const itemArray = Object.values(items);
    
    summaries[category] = {
      totalItems: itemArray.length,
      averageCalories: Math.round(
        itemArray.reduce((sum, item) => sum + item.calories, 0) / itemArray.length
      ),
      calorieRange: {
        min: Math.min(...itemArray.map(item => item.calories)),
        max: Math.max(...itemArray.map(item => item.calories))
      },
      commonAllergens: [...new Set(
        itemArray.flatMap(item => item.allergens || [])
      )],
      lastUpdated: FieldValue.serverTimestamp()
    };
  });
  
  await db.collection('nutrition').doc('summaries').set(summaries);
  console.log('✅ Category summaries created');
}

// Main migration function
async function migrate() {
  try {
    // Migrate each category
    console.log('📍 Migrating wings...');
    await batchWriteItems(nutritionData.wings, 'wings');
    stats.success += Object.keys(nutritionData.wings).length;
    
    console.log('\n📍 Migrating sauces...');
    await batchWriteItems(nutritionData.sauces, 'sauces');
    stats.success += Object.keys(nutritionData.sauces).length;
    
    console.log('\n📍 Migrating dipping sauces...');
    await batchWriteItems(nutritionData.dippingSauces, 'dippingSauces');
    stats.success += Object.keys(nutritionData.dippingSauces).length;
    
    console.log('\n📍 Migrating sides...');
    await batchWriteItems(nutritionData.sides, 'sides');
    stats.success += Object.keys(nutritionData.sides).length;
    
    console.log('\n📍 Migrating combos...');
    await batchWriteItems(nutritionData.combos, 'combos');
    stats.success += Object.keys(nutritionData.combos).length;
    
    // Create supporting documents
    console.log('\n📍 Creating allergen matrix...');
    await createAllergenMatrix();
    
    console.log('\n📍 Creating category summaries...');
    await createCategorySummaries();
    
    // Create migration metadata
    await db.collection('nutrition').doc('_metadata').set({
      migrationDate: FieldValue.serverTimestamp(),
      version: '2.0',
      totalItems: stats.total,
      categories: Object.keys(nutritionData),
      features: [
        'FDA 2020 compliance',
        'Enhanced allergen tracking',
        'Metric weights',
        'Supplier certification tracking',
        'Audit trail support'
      ]
    });
    
    // Display summary
    const duration = Math.round((Date.now() - stats.startTime) / 1000);
    console.log('\n' + '='.repeat(50));
    console.log('✅ MIGRATION COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(50));
    console.log(`Total items migrated: ${stats.success}`);
    console.log(`Errors: ${stats.errors}`);
    console.log(`Duration: ${duration} seconds`);
    console.log('\nFirestore structure:');
    console.log('  nutrition/');
    console.log('    ├── wings/items/{itemId}');
    console.log('    ├── sauces/items/{itemId}');
    console.log('    ├── dippingSauces/items/{itemId}');
    console.log('    ├── sides/items/{itemId}');
    console.log('    ├── combos/items/{itemId}');
    console.log('    ├── allergenMatrix');
    console.log('    ├── summaries');
    console.log('    └── _metadata');
    
    // Update Firestore rules reminder
    console.log('\n⚠️  Don\'t forget to update firestore.rules:');
    console.log('match /nutrition/{document=**} {');
    console.log('  allow read: if true;');
    console.log('  allow write: if request.auth != null && request.auth.token.admin == true;');
    console.log('}');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    stats.errors++;
    process.exit(1);
  }
}

// Run migration
migrate().then(() => {
  console.log('\n🎉 All done! Nutrition data is now in Firestore.');
  process.exit(0);
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});