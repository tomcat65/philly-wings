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

async function addDrinksData() {
  try {
    console.log('🥤 Adding drinks data to menuItems...');

    const drinksData = {
      id: "drinks",
      name: "Beverages",
      description: "Refreshing drinks to complement your wings",
      category: "beverages",
      variants: [
        {
          id: "fountain_drink",
          name: "Fountain Drink",
          size: "medium",
          basePrice: 2.49,
          platformPricing: {
            doordash: 3.36,   // 2.49 * 1.35
            grubhub: 3.03,    // 2.49 * 1.215
            ubereats: 3.36    // 2.49 * 1.35
          },
          description: "Coca-Cola, Sprite, Orange Fanta, or Diet Coke",
          options: ["Coca-Cola", "Sprite", "Orange Fanta", "Diet Coke"]
        },
        {
          id: "bottled_water",
          name: "Bottled Water",
          size: "16.9oz",
          basePrice: 1.99,
          platformPricing: {
            doordash: 2.69,
            grubhub: 2.42,
            ubereats: 2.69
          },
          description: "Pure bottled water"
        },
        {
          id: "energy_drink",
          name: "Energy Drink",
          size: "16oz",
          basePrice: 3.49,
          platformPricing: {
            doordash: 4.71,
            grubhub: 4.24,
            ubereats: 4.71
          },
          description: "Red Bull or Monster Energy",
          options: ["Red Bull", "Monster Energy"]
        }
      ],
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // Add drinks to menuItems collection
    await db.collection('menuItems').add(drinksData);

    console.log('✅ Successfully added drinks data!');
    console.log(`Added ${drinksData.variants.length} drink variants`);

  } catch (error) {
    console.error('Error adding drinks data:', error);
  }
}

addDrinksData();