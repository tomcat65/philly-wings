const admin = require('firebase-admin');

// Initialize Production Firebase
const productionApp = admin.initializeApp({
  projectId: 'philly-wings'
}, 'production');

// Initialize Emulator Firebase
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
const emulatorApp = admin.initializeApp({
  projectId: 'philly-wings'
}, 'emulator');

const productionDb = productionApp.firestore();
const emulatorDb = emulatorApp.firestore();

async function importProductionData() {
  try {
    console.log('🔄 Importing production data to emulator...\n');

    // Import menuItems collection
    console.log('📋 Importing menuItems collection...');
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
        console.log(`   ✅ Imported: ${data.name || data.id}`);
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

    // Import combos collection (should already be there but let's sync it)
    console.log('\n🔥 Syncing combos collection...');
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

      // Import each document
      for (const doc of combosSnapshot.docs) {
        const data = doc.data();
        await emulatorDb.collection('combos').doc(doc.id).set(data);
        console.log(`   ✅ Imported: ${data.name || data.id}`);
      }
    }

    console.log('\n🎉 Production data import completed!');

  } catch (error) {
    console.error('❌ Error importing production data:', error.message);
    if (error.code === 'permission-denied') {
      console.log('\n💡 Tip: Make sure you\'re authenticated with Firebase CLI:');
      console.log('   firebase login');
    }
  }
}

importProductionData();