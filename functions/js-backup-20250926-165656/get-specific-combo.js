const admin = require('firebase-admin');

// Initialize Production Firebase
let productionApp;
try {
  productionApp = admin.initializeApp({
    projectId: 'philly-wings'
  }, 'production');
} catch (e) {
  productionApp = admin.app('production');
}

// Initialize Emulator Firebase
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
let emulatorApp;
try {
  emulatorApp = admin.initializeApp({
    projectId: 'philly-wings'
  }, 'emulator');
} catch (e) {
  emulatorApp = admin.app('emulator');
}

const productionDb = productionApp.firestore();
const emulatorDb = emulatorApp.firestore();

async function getSpecificCombo() {
  try {
    console.log('🔍 Looking for specific combo document: Mwp2hJceFkGrFKqmIQKX\n');

    // Try to get the specific document ID from the screenshot
    const specificComboRef = productionDb.collection('combos').doc('Mwp2hJceFkGrFKqmIQKX');
    const specificComboDoc = await specificComboRef.get();

    if (specificComboDoc.exists) {
      const data = specificComboDoc.data();
      console.log('✅ Found the specific combo!');
      console.log(`📄 Document ID: ${specificComboDoc.id}`);
      console.log(`📝 Full data: ${JSON.stringify(data, null, 2)}`);

      // Import this specific combo to emulator
      await emulatorDb.collection('combos').doc(specificComboDoc.id).set(data);
      console.log('✅ Imported specific combo to emulator');

    } else {
      console.log('❌ Specific combo document not found');

      // Let's search all combos for any that might have the right structure
      console.log('\n🔍 Searching all combos for ones with computedNutrition...');
      const allCombos = await productionDb.collection('combos').get();

      allCombos.docs.forEach(doc => {
        const data = doc.data();
        console.log(`\n📄 Document ID: ${doc.id}`);

        // Check if this combo has the structure we're looking for
        if (data.computedNutrition || data.active !== undefined || data.badges) {
          console.log('🎯 This combo has the right structure!');
          console.log(`   - active: ${data.active}`);
          console.log(`   - badges: ${JSON.stringify(data.badges)}`);
          console.log(`   - basePrice: ${data.basePrice}`);
          console.log(`   - has computedNutrition: ${!!data.computedNutrition}`);
          console.log(`📝 Full data: ${JSON.stringify(data, null, 2)}`);
        } else {
          console.log('❌ Simple structure combo');
          console.log(`   - basePrice: ${data.basePrice}`);
          console.log(`   - name: ${data.name}`);
        }
      });
    }

  } catch (error) {
    console.error('❌ Error getting specific combo:', error.message);
  }
}

getSpecificCombo();