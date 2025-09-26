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

async function debugFirebaseData() {
  try {
    console.log('🔍 Debugging Firebase Data Structure...\n');

    // Check what collections exist
    console.log('📂 Available Collections:');
    const collections = await db.listCollections();
    collections.forEach(collection => {
      console.log(`  - ${collection.id}`);
    });

    console.log('\n📋 MenuItems Collection:');
    const menuItemsSnapshot = await db.collection('menuItems').get();
    if (menuItemsSnapshot.empty) {
      console.log('  ❌ No documents found in menuItems');
    } else {
      menuItemsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        console.log(`  📄 Document: ${doc.id}`);
        console.log(`     - id: ${data.id || 'N/A'}`);
        console.log(`     - name: ${data.name || 'N/A'}`);
        console.log(`     - variants: ${data.variants?.length || 0} items`);
        if (data.variants?.length > 0) {
          console.log(`     - first variant: ${JSON.stringify(data.variants[0], null, 2)}`);
        }
      });
    }

    console.log('\n🌶️ Sauces Collection:');
    const saucesSnapshot = await db.collection('sauces').get();
    if (saucesSnapshot.empty) {
      console.log('  ❌ No documents found in sauces');
    } else {
      console.log(`  ✅ Found ${saucesSnapshot.docs.length} sauce documents`);
      saucesSnapshot.docs.slice(0, 3).forEach(doc => {
        const data = doc.data();
        console.log(`     - ${doc.id}: ${data.name} (${data.category || 'no category'})`);
      });
    }

    console.log('\n🔥 Combos Collection:');
    const combosSnapshot = await db.collection('combos').get();
    if (combosSnapshot.empty) {
      console.log('  ❌ No documents found in combos');
    } else {
      console.log(`  ✅ Found ${combosSnapshot.docs.length} combo documents`);
    }

    // Check if there are separate wings/beverages collections
    console.log('\n🍗 Checking for Wings Collection:');
    try {
      const wingsSnapshot = await db.collection('wings').get();
      if (wingsSnapshot.empty) {
        console.log('  ❌ No documents found in wings collection');
      } else {
        console.log(`  ✅ Found ${wingsSnapshot.docs.length} wing documents`);
      }
    } catch (e) {
      console.log('  ❌ Wings collection does not exist');
    }

    console.log('\n🥤 Checking for Beverages Collection:');
    try {
      const beveragesSnapshot = await db.collection('beverages').get();
      if (beveragesSnapshot.empty) {
        console.log('  ❌ No documents found in beverages collection');
      } else {
        console.log(`  ✅ Found ${beveragesSnapshot.docs.length} beverage documents`);
      }
    } catch (e) {
      console.log('  ❌ Beverages collection does not exist');
    }

  } catch (error) {
    console.error('Error debugging Firebase:', error);
  }
}

debugFirebaseData();