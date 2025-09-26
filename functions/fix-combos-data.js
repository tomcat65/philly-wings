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

async function fixCombosData() {
  try {
    console.log('🔧 Fixing combos data to match production structure...\n');

    // Clear existing combos in emulator first
    const emulatorCombos = await db.collection('combos').get();
    for (const doc of emulatorCombos.docs) {
      await doc.ref.delete();
    }
    console.log('🗑️ Cleared existing combos from emulator');

    // Add the correct combo structure based on the screenshot
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
          // Add more breakdown items as needed
        }
      },
      // Add other required fields that would be in the actual production data
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // This is just the structure - we need the actual production data
    console.log('⚠️ This script shows the structure, but we need the real production data');
    console.log('📝 Based on your screenshot, the combo has:');
    console.log('   - active: true');
    console.log('   - badges: ["Most Popular", "Feeds 5-6"]');
    console.log('   - basePrice: 42.99');
    console.log('   - computedNutrition with allergens and breakdown');
    console.log('   - Document ID: Mwp2hJceFkGrFKqmIQKX');

    console.log('\n❓ Should I connect directly to production Firebase to get the real data?');

  } catch (error) {
    console.error('Error fixing combos data:', error);
  }
}

fixCombosData();