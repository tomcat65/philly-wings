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

async function checkDrinks() {
  try {
    console.log('🥤 Checking for drinks data in menuItems collection...\n');

    const menuItemsSnapshot = await db.collection('menuItems').get();

    if (menuItemsSnapshot.empty) {
      console.log('❌ No documents found in menuItems');
      return;
    }

    console.log(`📋 Found ${menuItemsSnapshot.docs.length} documents in menuItems:`);

    menuItemsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      console.log(`\n📄 Document ID: ${doc.id}`);
      console.log(`   - id: ${data.id || 'N/A'}`);
      console.log(`   - name: ${data.name || 'N/A'}`);
      console.log(`   - category: ${data.category || 'N/A'}`);
      console.log(`   - variants: ${data.variants?.length || 0} items`);

      // Check if this might be drinks
      if (data.id === 'drinks' || data.category === 'drinks' || data.name?.toLowerCase().includes('drink')) {
        console.log('   🥤 FOUND DRINKS DATA!');
        console.log(`   Full data: ${JSON.stringify(data, null, 2)}`);
      }

      // Show all document IDs and names for reference
      console.log(`   Document Firebase ID: ${doc.id}`);
    });

  } catch (error) {
    console.error('Error checking drinks:', error);
  }
}

checkDrinks();