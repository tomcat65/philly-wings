#!/usr/bin/env node

/**
 * Seed Emulator with New Menu Sections (Plant-Based, Desserts, Salads, Cold Sides)
 * Copies data from production Firestore to emulator
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';

// Initialize production Firebase
const serviceAccount = JSON.parse(
  readFileSync('/home/tomcat65/projects/docs/Phillywingsexpress/philly-wings-firebase-adminsdk-fbsvc-b9a46d307f.json', 'utf8')
);

const prodApp = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'philly-wings'
}, 'prod');

// Initialize emulator Firebase
const emulatorApp = admin.initializeApp({
  projectId: 'philly-wings'
}, 'emulator');

// Point emulator app to emulator
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8081';

const prodDb = prodApp.firestore();
const emulatorDb = emulatorApp.firestore();

async function seedCollection(collectionName) {
  console.log(`\n🌱 Seeding ${collectionName}...`);

  try {
    // Get all docs from production
    const snapshot = await prodDb.collection(collectionName).get();

    if (snapshot.empty) {
      console.log(`  ⚠️  No documents found in production ${collectionName}`);
      return;
    }

    console.log(`  📦 Found ${snapshot.docs.length} documents`);

    // Write each doc to emulator
    const batch = emulatorDb.batch();

    snapshot.docs.forEach(doc => {
      const docRef = emulatorDb.collection(collectionName).doc(doc.id);
      batch.set(docRef, doc.data());
      console.log(`  ✅ Added ${doc.id}`);
    });

    await batch.commit();
    console.log(`  ✨ ${collectionName} seeded successfully!`);

  } catch (error) {
    console.error(`  ❌ Error seeding ${collectionName}:`, error);
  }
}

async function main() {
  console.log('🚀 Seeding Firebase Emulator with New Menu Sections...');
  console.log('📍 Emulator: localhost:8081');
  console.log('📍 Production: philly-wings');

  try {
    // Seed the 4 new collections
    await seedCollection('plantBasedWings');
    await seedCollection('desserts');
    await seedCollection('freshSalads');
    await seedCollection('coldSides');

    console.log('\n🎉 Emulator seeding completed!');
    console.log('🔗 View data: http://localhost:4000/firestore');
    console.log('🔗 Test site: http://localhost:3000');

    process.exit(0);
  } catch (error) {
    console.error('\n💥 Seeding failed:', error);
    process.exit(1);
  }
}

main();
