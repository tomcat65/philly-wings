const admin = require('firebase-admin');

// Initialize Firebase Admin
try {
  admin.initializeApp();
} catch (e) {
  console.log('Firebase already initialized');
}

const db = admin.firestore();

async function addLargeFries() {
  try {
    console.log('Adding large fries variant...');

    // First, get the current fries document
    const friesSnapshot = await db.collection('menuItems').where('id', '==', 'fries').get();

    if (friesSnapshot.empty) {
      console.error('No fries document found!');
      return;
    }

    const friesDoc = friesSnapshot.docs[0];
    const friesData = friesDoc.data();

    console.log('Current fries variants:', friesData.variants?.length || 0);

    // Add the large fries variant
    const largeFriesVariant = {
      basePrice: 3.75,
      description: "Golden crispy fries - large size",
      id: "fries_large",
      name: "Large Fries",
      platformPricing: {
        doordash: 5.06,  // 3.75 * 1.35
        grubhub: 4.56,   // 3.75 * 1.215
        ubereats: 5.06   // 3.75 * 1.35
      },
      size: "large"
    };

    // Add to variants array
    const updatedVariants = [...(friesData.variants || []), largeFriesVariant];

    // Update the document
    await friesDoc.ref.update({
      variants: updatedVariants,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('✅ Successfully added large fries variant!');
    console.log('Total variants now:', updatedVariants.length);

  } catch (error) {
    console.error('Error adding large fries:', error);
  }
}

addLargeFries();