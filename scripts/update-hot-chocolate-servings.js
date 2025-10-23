/**
 * Update Ghirardelli Hot Chocolate serving information
 * Hot chocolate uses 12oz cups (not 8oz like coffee)
 *
 * Calculations:
 * - 96oz ÷ 12oz = 8 servings
 * - 128oz ÷ 12oz = 10.67 ≈ 10 servings
 */

const admin = require('firebase-admin');
const serviceAccount = require('../philly-wings-firebase-adminsdk-fbsvc-b9a46d307f.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function updateHotChocolateServings() {
  console.log('🍫 Starting Hot Chocolate servings update...\n');

  try {
    const docRef = db.collection('menuItems').doc('ghirardelli_hot_chocolate');
    const doc = await docRef.get();

    if (!doc.exists) {
      console.error('❌ Hot Chocolate document not found!');
      process.exit(1);
    }

    const data = doc.data();
    console.log('📋 Current data:');
    console.log('  96oz variant:', data.variants[0]);
    console.log('  128oz variant:', data.variants[1]);
    console.log('');

    // Update variants with correct serving information
    const updatedVariants = [
      {
        id: '96oz_cambro',
        name: '96oz Cambro',
        basePrice: 119.99,
        servings: 8,              // Fixed: 96 ÷ 12 = 8
        servingSize: '12oz cup',   // Fixed: Hot chocolate uses 12oz cups
        cupSize: '12oz',          // Added for consistency
        volume: '96oz',
        active: true
      },
      {
        id: '128oz_cambro',
        name: '128oz Cambro',
        basePrice: 134.99,
        servings: 10,             // Fixed: 128 ÷ 12 = 10.67 ≈ 10
        servingSize: '12oz cup',   // Fixed: Hot chocolate uses 12oz cups
        cupSize: '12oz',          // Added for consistency
        volume: '128oz',
        active: true
      }
    ];

    // Update the document
    await docRef.update({
      variants: updatedVariants
    });

    console.log('✅ Successfully updated Hot Chocolate servings:');
    console.log('  96oz Cambro: 8 servings (12oz cups)');
    console.log('  128oz Cambro: 10 servings (12oz cups)');
    console.log('');

    // Verify the update
    const updatedDoc = await docRef.get();
    const updatedData = updatedDoc.data();
    console.log('📋 Verified updated data:');
    console.log('  96oz variant:', updatedData.variants[0]);
    console.log('  128oz variant:', updatedData.variants[1]);

  } catch (error) {
    console.error('❌ Error updating Hot Chocolate servings:', error);
    process.exit(1);
  }

  console.log('\n🎉 Hot Chocolate servings update complete!');
  process.exit(0);
}

updateHotChocolateServings();
