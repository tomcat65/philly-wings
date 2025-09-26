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

async function addOriginalFries() {
  try {
    console.log('Adding original fries variant...');

    // Get the current fries document
    const friesSnapshot = await db.collection('menuItems').where('id', '==', 'fries').get();

    if (friesSnapshot.empty) {
      console.error('No fries document found!');
      return;
    }

    const friesDoc = friesSnapshot.docs[0];
    const friesData = friesDoc.data();

    console.log('Current fries variants:', friesData.variants?.length || 0);

    // Check if original fries already exists
    const hasOriginal = friesData.variants?.some(v => v.id === 'fries_original' || v.size === 'small' || v.name.toLowerCase().includes('original'));

    if (hasOriginal) {
      console.log('✅ Original fries variant already exists!');
      return;
    }

    // Add the original fries variant
    const originalFriesVariant = {
      basePrice: 2.75,
      description: "Golden crispy fries - original size",
      id: "fries_original",
      name: "Original Fries",
      platformPricing: {
        doordash: 3.71,  // 2.75 * 1.35
        grubhub: 3.34,   // 2.75 * 1.215
        ubereats: 3.71   // 2.75 * 1.35
      },
      size: "small"
    };

    // Add to variants array (put original first)
    const updatedVariants = [originalFriesVariant, ...(friesData.variants || [])];

    // Update the document
    await friesDoc.ref.update({
      variants: updatedVariants,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('✅ Successfully added original fries variant!');
    console.log('Total variants now:', updatedVariants.length);

  } catch (error) {
    console.error('Error adding original fries:', error);
  }
}

addOriginalFries();