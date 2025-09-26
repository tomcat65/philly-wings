const admin = require('firebase-admin');

// First, let's make sure we're properly authenticated
console.log('🔐 Checking Firebase authentication...');

// Initialize Production Firebase (no emulator settings)
let productionApp;
try {
  productionApp = admin.initializeApp({
    projectId: 'philly-wings'
  }, 'production');
  console.log('✅ Connected to production Firebase');
} catch (e) {
  console.log('⚠️ Production app already initialized:', e.message);
  productionApp = admin.app('production');
}

// Initialize Emulator Firebase separately
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
let emulatorApp;
try {
  emulatorApp = admin.initializeApp({
    projectId: 'philly-wings'
  }, 'emulator');
  console.log('✅ Connected to emulator Firebase');
} catch (e) {
  console.log('⚠️ Emulator app already initialized:', e.message);
  emulatorApp = admin.app('emulator');
}

const productionDb = productionApp.firestore();
const emulatorDb = emulatorApp.firestore();

async function importRealProductionData() {
  try {
    console.log('🔄 Importing REAL production data to emulator...\n');

    // Import combos collection with full details
    console.log('🔥 Importing combos collection...');
    const combosSnapshot = await productionDb.collection('combos').get();

    if (combosSnapshot.empty) {
      console.log('❌ No combos found in production');
    } else {
      console.log(`✅ Found ${combosSnapshot.docs.length} combos in production`);

      // Clear existing combos in emulator first
      const emulatorCombos = await emulatorDb.collection('combos').get();
      for (const doc of emulatorCombos.docs) {
        await doc.ref.delete();
      }
      console.log('🗑️ Cleared existing combos from emulator');

      // Import each document with full data structure
      for (const doc of combosSnapshot.docs) {
        const data = doc.data();
        await emulatorDb.collection('combos').doc(doc.id).set(data);

        console.log(`   ✅ Imported combo: ${doc.id}`);
        console.log(`      - active: ${data.active}`);
        console.log(`      - badges: ${JSON.stringify(data.badges)}`);
        console.log(`      - basePrice: ${data.basePrice}`);
        console.log(`      - has computedNutrition: ${!!data.computedNutrition}`);
        console.log(`      - allergens count: ${data.computedNutrition?.allergens ? Object.keys(data.computedNutrition.allergens).length : 0}`);
        console.log(`      - breakdown items: ${data.computedNutrition?.breakdown ? Object.keys(data.computedNutrition.breakdown).length : 0}`);
      }
    }

    // Import menuItems collection with full details
    console.log('\n📋 Importing menuItems collection...');
    const menuItemsSnapshot = await productionDb.collection('menuItems').get();

    if (menuItemsSnapshot.empty) {
      console.log('❌ No menuItems found in production');
    } else {
      console.log(`✅ Found ${menuItemsSnapshot.docs.length} menuItems in production`);

      // Clear existing menuItems in emulator first
      const emulatorMenuItems = await emulatorDb.collection('menuItems').get();
      for (const doc of emulatorMenuItems.docs) {
        await doc.ref.delete();
      }
      console.log('🗑️ Cleared existing menuItems from emulator');

      // Import each document
      for (const doc of menuItemsSnapshot.docs) {
        const data = doc.data();
        await emulatorDb.collection('menuItems').doc(doc.id).set(data);
        console.log(`   ✅ Imported: ${data.name || data.id} (${data.category || 'no category'})`);
        if (data.variants) {
          console.log(`      - variants: ${data.variants.length}`);
        }
      }
    }

    // Import sauces collection
    console.log('\n🌶️ Importing sauces collection...');
    const saucesSnapshot = await productionDb.collection('sauces').get();

    if (saucesSnapshot.empty) {
      console.log('❌ No sauces found in production');
    } else {
      console.log(`✅ Found ${saucesSnapshot.docs.length} sauces in production`);

      // Clear existing sauces in emulator first
      const emulatorSauces = await emulatorDb.collection('sauces').get();
      for (const doc of emulatorSauces.docs) {
        await doc.ref.delete();
      }
      console.log('🗑️ Cleared existing sauces from emulator');

      // Import each document
      for (const doc of saucesSnapshot.docs) {
        const data = doc.data();
        await emulatorDb.collection('sauces').doc(doc.id).set(data);
        console.log(`   ✅ Imported: ${data.name || data.id}`);
      }
    }

    console.log('\n🎉 REAL production data import completed!');
    console.log('📝 The emulator now has the exact same data as production Firebase');

  } catch (error) {
    console.error('❌ Error importing production data:', error.message);
    console.error('Full error:', error);

    if (error.code === 'permission-denied') {
      console.log('\n💡 Authentication issue. Let\'s check if we\'re logged in:');
      console.log('   firebase login');
      console.log('   firebase projects:list');
    }
  }
}

importRealProductionData();