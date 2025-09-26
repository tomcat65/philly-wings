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

async function addWingsData() {
  try {
    console.log('🍗 Adding wings data to menuItems...');

    const wingsData = {
      id: "wings",
      name: "Wings",
      description: "Fresh chicken wings with your choice of sauce",
      category: "wings",
      variants: [
        // Boneless Wings
        {
          id: "wings_6_boneless",
          name: "6 Boneless Wings",
          count: 6,
          type: "boneless",
          basePrice: 6.99,
          platformPricing: {
            doordash: 9.44,   // 6.99 * 1.35
            grubhub: 8.49,    // 6.99 * 1.215
            ubereats: 9.44    // 6.99 * 1.35
          },
          description: "6 tender boneless wings with your choice of sauce",
          includedSauces: 1
        },
        {
          id: "wings_12_boneless",
          name: "12 Boneless Wings",
          count: 12,
          type: "boneless",
          basePrice: 11.99,
          platformPricing: {
            doordash: 16.19,
            grubhub: 14.57,
            ubereats: 16.19
          },
          description: "12 tender boneless wings with your choice of sauce",
          includedSauces: 2
        },
        {
          id: "wings_24_boneless",
          name: "24 Boneless Wings",
          count: 24,
          type: "boneless",
          basePrice: 20.99,
          platformPricing: {
            doordash: 28.34,
            grubhub: 25.50,
            ubereats: 28.34
          },
          description: "24 tender boneless wings with your choice of sauce",
          includedSauces: 4
        },
        // Bone-In Wings
        {
          id: "wings_6_bonein",
          name: "6 Bone-In Wings",
          count: 6,
          type: "bone-in",
          basePrice: 8.99,
          platformPricing: {
            doordash: 12.14,
            grubhub: 10.92,
            ubereats: 12.14
          },
          description: "6 traditional bone-in wings with your choice of sauce",
          includedSauces: 1
        },
        {
          id: "wings_12_bonein",
          name: "12 Bone-In Wings",
          count: 12,
          type: "bone-in",
          basePrice: 14.99,
          platformPricing: {
            doordash: 20.24,
            grubhub: 18.22,
            ubereats: 20.24
          },
          description: "12 traditional bone-in wings with your choice of sauce",
          includedSauces: 2
        },
        {
          id: "wings_24_bonein",
          name: "24 Bone-In Wings",
          count: 24,
          type: "bone-in",
          basePrice: 25.99,
          platformPricing: {
            doordash: 35.09,
            grubhub: 31.58,
            ubereats: 35.09
          },
          description: "24 traditional bone-in wings with your choice of sauce",
          includedSauces: 4
        }
      ],
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // Add wings to menuItems collection
    await db.collection('menuItems').add(wingsData);

    console.log('✅ Successfully added wings data!');
    console.log(`Added ${wingsData.variants.length} wing variants`);

  } catch (error) {
    console.error('Error adding wings data:', error);
  }
}

addWingsData();