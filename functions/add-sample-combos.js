const admin = require('firebase-admin');

// Initialize Firebase Admin (use emulator)
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';

try {
  admin.initializeApp({
    projectId: 'philly-wings'
  });
} catch (e) {
  console.log('Firebase already initialized');
}

const db = admin.firestore();

async function addSampleCombos() {
  try {
    console.log('🔥 Adding sample combos data to emulator...');

    const sampleCombos = [
      {
        id: 'sampler-combo',
        name: 'Wing Sampler',
        description: '6 wings (2 sauces) + fries + drink',
        basePrice: 12.99,
        platformPricing: {
          doordash: 17.54,   // 12.99 * 1.35
          grubhub: 15.78,    // 12.99 * 1.215
          ubereats: 17.54    // 12.99 * 1.35
        },
        wingCount: 6,
        includedSauces: 2,
        includes: ['6 Wings', 'Regular Fries', 'Fountain Drink'],
        savings: '15%',
        category: 'combo'
      },
      {
        id: 'mvp-combo',
        name: 'MVP Combo',
        description: '12 wings (2 sauces) + large fries + drink',
        basePrice: 18.99,
        platformPricing: {
          doordash: 25.64,
          grubhub: 23.08,
          ubereats: 25.64
        },
        wingCount: 12,
        includedSauces: 2,
        includes: ['12 Wings', 'Large Fries', 'Fountain Drink'],
        savings: '17%',
        category: 'combo'
      },
      {
        id: 'family-combo',
        name: 'Family Pack',
        description: '24 wings (4 sauces) + 2 large fries + 4 drinks',
        basePrice: 39.99,
        platformPricing: {
          doordash: 53.99,
          grubhub: 48.59,
          ubereats: 53.99
        },
        wingCount: 24,
        includedSauces: 4,
        includes: ['24 Wings', '2 Large Fries', '4 Fountain Drinks'],
        savings: '20%',
        category: 'combo'
      }
    ];

    // Add each combo to the combos collection
    for (const combo of sampleCombos) {
      await db.collection('combos').add({
        ...combo,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    console.log(`✅ Successfully added ${sampleCombos.length} sample combos to emulator!`);
    console.log('Combos added:');
    sampleCombos.forEach(combo => {
      console.log(`  - ${combo.name}: $${combo.basePrice} (DoorDash: $${combo.platformPricing.doordash})`);
    });

  } catch (error) {
    console.error('Error adding sample combos:', error);
  }
}

addSampleCombos();