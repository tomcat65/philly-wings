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

async function inspectSyncedData() {
  try {
    console.log('🔍 Inspecting synced data in emulator...\n');

    // Check combos in detail
    console.log('🔥 COMBOS COLLECTION:');
    const combosSnapshot = await db.collection('combos').get();

    if (combosSnapshot.empty) {
      console.log('❌ No combos found');
    } else {
      combosSnapshot.docs.forEach(doc => {
        const data = doc.data();
        console.log(`📄 Document ID: ${doc.id}`);
        console.log(`   Full data: ${JSON.stringify(data, null, 2)}`);
        console.log('');
      });
    }

    // Check menuItems in detail
    console.log('\n📋 MENU ITEMS COLLECTION:');
    const menuItemsSnapshot = await db.collection('menuItems').get();

    menuItemsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      console.log(`📄 Document ID: ${doc.id}`);
      console.log(`   id: ${data.id}`);
      console.log(`   name: ${data.name}`);
      console.log(`   category: ${data.category}`);
      if (data.variants && data.variants.length > 0) {
        console.log(`   first variant: ${JSON.stringify(data.variants[0], null, 2)}`);
      }
      console.log('');
    });

    // Check sauces
    console.log('\n🌶️ SAUCES COLLECTION:');
    const saucesSnapshot = await db.collection('sauces').get();
    console.log(`Found ${saucesSnapshot.docs.length} sauces:`);
    saucesSnapshot.docs.forEach(doc => {
      const data = doc.data();
      console.log(`   - ${doc.id}: ${data.name} (category: ${data.category || 'none'})`);
    });

  } catch (error) {
    console.error('Error inspecting data:', error);
  }
}

inspectSyncedData();