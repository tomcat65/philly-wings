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

async function checkCombos() {
  try {
    console.log('🔍 Checking combos collection in detail...\n');

    // Check combos collection
    const combosSnapshot = await db.collection('combos').get();

    if (combosSnapshot.empty) {
      console.log('❌ Combos collection is empty in emulator');
      console.log('📝 Note: Production Firebase might have combos data');
    } else {
      console.log(`✅ Found ${combosSnapshot.docs.length} combo documents in emulator:`);
      combosSnapshot.docs.forEach(doc => {
        const data = doc.data();
        console.log(`\n📄 Document ID: ${doc.id}`);
        console.log(`   Name: ${data.name || 'N/A'}`);
        console.log(`   Base Price: $${data.basePrice || 'N/A'}`);
        console.log(`   Description: ${data.description || 'N/A'}`);
      });
    }

    // Also check if combos data might be in menuItems
    console.log('\n🔍 Checking if combos might be in menuItems collection...');
    const menuItemsSnapshot = await db.collection('menuItems').get();

    let foundCombosInMenuItems = false;
    menuItemsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.id === 'combos' || data.category === 'combos') {
        foundCombosInMenuItems = true;
        console.log(`✅ Found combos data in menuItems: ${doc.id}`);
        console.log(`   Variants: ${data.variants?.length || 0} items`);
      }
    });

    if (!foundCombosInMenuItems) {
      console.log('❌ No combos data found in menuItems either');
    }

  } catch (error) {
    console.error('Error checking combos:', error);
  }
}

checkCombos();