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

async function syncAllCollections() {
  try {
    console.log('🔄 Syncing ALL production data to emulator...\n');

    // Get list of all collections in production
    const collections = await productionDb.listCollections();
    console.log(`📂 Found ${collections.length} collections in production:`);
    collections.forEach(col => console.log(`   - ${col.id}`));

    // Sync each collection
    for (const collection of collections) {
      const collectionId = collection.id;
      console.log(`\n📋 Syncing collection: ${collectionId}`);

      try {
        // Get all documents from production collection
        const snapshot = await productionDb.collection(collectionId).get();

        if (snapshot.empty) {
          console.log(`   ❌ No documents found in ${collectionId}`);
          continue;
        }

        console.log(`   ✅ Found ${snapshot.docs.length} documents`);

        // Clear existing collection in emulator
        const emulatorSnapshot = await emulatorDb.collection(collectionId).get();
        const batch = emulatorDb.batch();

        emulatorSnapshot.docs.forEach(doc => {
          batch.delete(doc.ref);
        });
        await batch.commit();
        console.log(`   🗑️ Cleared existing ${collectionId} from emulator`);

        // Copy all documents to emulator
        const copyBatch = emulatorDb.batch();
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          copyBatch.set(emulatorDb.collection(collectionId).doc(doc.id), data);
        });
        await copyBatch.commit();

        console.log(`   ✅ Copied ${snapshot.docs.length} documents to emulator`);

        // Show sample data
        snapshot.docs.slice(0, 2).forEach(doc => {
          const data = doc.data();
          console.log(`      📄 ${doc.id}: ${data.name || data.id || 'unnamed'}`);
          if (data.variants) {
            console.log(`         - variants: ${data.variants.length}`);
          }
          if (data.badges) {
            console.log(`         - badges: ${JSON.stringify(data.badges)}`);
          }
          if (data.basePrice) {
            console.log(`         - basePrice: $${data.basePrice}`);
          }
        });

      } catch (error) {
        console.error(`   ❌ Error syncing ${collectionId}:`, error.message);
      }
    }

    console.log('\n🎉 Production data sync completed!');
    console.log('📝 Emulator now has the exact same data as production');

  } catch (error) {
    console.error('❌ Error syncing production data:', error.message);
    if (error.code === 'permission-denied') {
      console.log('\n💡 Authentication issue. Make sure you\'re logged in:');
      console.log('   firebase login');
    }
  }
}

syncAllCollections();