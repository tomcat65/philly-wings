const admin = require('firebase-admin');

// Initialize Firebase Admin
try {
  admin.initializeApp();
} catch (e) {
  console.log('Firebase already initialized');
}

const db = admin.firestore();

async function checkFries() {
  try {
    console.log('Checking fries data in Firestore...');

    // Get the fries document
    const friesSnapshot = await db.collection('menuItems').where('id', '==', 'fries').get();

    if (friesSnapshot.empty) {
      console.log('❌ No fries document found!');
      return;
    }

    const friesDoc = friesSnapshot.docs[0];
    const friesData = friesDoc.data();

    console.log('✅ Fries document found:');
    console.log('Document ID:', friesDoc.id);
    console.log('Variants count:', friesData.variants?.length || 0);

    if (friesData.variants) {
      console.log('\n📋 Fries variants:');
      friesData.variants.forEach((variant, index) => {
        console.log(`${index + 1}. ${variant.name} (${variant.id})`);
        console.log(`   Size: ${variant.size || 'N/A'}`);
        console.log(`   Base Price: $${variant.basePrice}`);
        console.log(`   Platform Pricing:`, variant.platformPricing);
        console.log('');
      });
    }

  } catch (error) {
    console.error('Error checking fries:', error);
  }
}

checkFries();