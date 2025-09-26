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

async function createCorrectCombo() {
  try {
    console.log('🔧 Creating correct combo structure based on screenshot...\n');

    // Clear existing combos in emulator first
    const emulatorCombos = await db.collection('combos').get();
    for (const doc of emulatorCombos.docs) {
      await doc.ref.delete();
    }
    console.log('🗑️ Cleared existing combos from emulator');

    // Create the correct combo structure from the screenshot
    const correctCombo = {
      active: true,
      badges: ["Most Popular", "Feeds 5-6"],
      basePrice: 42.99,
      computedNutrition: {
        allergens: {
          0: "wheat",
          1: "soy",
          2: "milk",
          3: "egg"
        },
        breakdown: {
          0: {
            calories: 360,
            name: "30 Wings",
            qty: 1,
            refId: "30-wings"
          }
        }
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // Add the combo with the exact document ID from screenshot
    await db.collection('combos').doc('Mwp2hJceFkGrFKqmIQKX').set(correctCombo);

    console.log('✅ Successfully created correct combo!');
    console.log(`📄 Document ID: Mwp2hJceFkGrFKqmIQKX`);
    console.log(`   - active: ${correctCombo.active}`);
    console.log(`   - badges: ${JSON.stringify(correctCombo.badges)}`);
    console.log(`   - basePrice: ${correctCombo.basePrice}`);
    console.log(`   - allergens: ${Object.values(correctCombo.computedNutrition.allergens).join(', ')}`);
    console.log(`   - breakdown: ${correctCombo.computedNutrition.breakdown[0].name} (${correctCombo.computedNutrition.breakdown[0].calories} cal)`);

    console.log('\n🎉 Combo structure now matches your screenshot!');

  } catch (error) {
    console.error('Error creating correct combo:', error);
  }
}

createCorrectCombo();