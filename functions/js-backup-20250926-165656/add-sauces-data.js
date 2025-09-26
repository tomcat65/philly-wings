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

async function addSaucesData() {
  try {
    console.log('🌶️ Adding sauces data to sauces collection...');

    const saucesData = [
      // Wing Sauces
      {
        id: 'buffalo_mild',
        name: 'Buffalo Mild',
        category: 'wing_sauce',
        heatLevel: 1,
        description: 'Classic mild buffalo sauce with buttery flavor',
        ingredients: ['Cayenne peppers', 'Butter', 'Vinegar', 'Garlic'],
        isVegan: false,
        isGlutenFree: true
      },
      {
        id: 'buffalo_medium',
        name: 'Buffalo Medium',
        category: 'wing_sauce',
        heatLevel: 2,
        description: 'Traditional buffalo sauce with moderate heat',
        ingredients: ['Cayenne peppers', 'Butter', 'Vinegar', 'Garlic'],
        isVegan: false,
        isGlutenFree: true
      },
      {
        id: 'buffalo_hot',
        name: 'Buffalo Hot',
        category: 'wing_sauce',
        heatLevel: 3,
        description: 'Spicy buffalo sauce for heat lovers',
        ingredients: ['Cayenne peppers', 'Butter', 'Vinegar', 'Garlic', 'Habanero'],
        isVegan: false,
        isGlutenFree: true
      },
      {
        id: 'bbq_sweet',
        name: 'Sweet BBQ',
        category: 'wing_sauce',
        heatLevel: 0,
        description: 'Sweet and tangy barbecue sauce',
        ingredients: ['Tomato', 'Brown sugar', 'Molasses', 'Vinegar'],
        isVegan: true,
        isGlutenFree: true
      },
      {
        id: 'honey_mustard',
        name: 'Honey Mustard',
        category: 'wing_sauce',
        heatLevel: 0,
        description: 'Sweet honey mixed with tangy mustard',
        ingredients: ['Honey', 'Dijon mustard', 'Mayonnaise'],
        isVegan: false,
        isGlutenFree: true
      },
      {
        id: 'garlic_parmesan',
        name: 'Garlic Parmesan',
        category: 'wing_sauce',
        heatLevel: 0,
        description: 'Savory garlic and parmesan cheese blend',
        ingredients: ['Garlic', 'Parmesan cheese', 'Butter', 'Herbs'],
        isVegan: false,
        isGlutenFree: true
      },
      {
        id: 'teriyaki',
        name: 'Teriyaki',
        category: 'wing_sauce',
        heatLevel: 0,
        description: 'Sweet Japanese-style teriyaki glaze',
        ingredients: ['Soy sauce', 'Sugar', 'Mirin', 'Ginger'],
        isVegan: true,
        isGlutenFree: false
      },
      {
        id: 'lemon_pepper',
        name: 'Lemon Pepper',
        category: 'wing_sauce',
        heatLevel: 0,
        description: 'Zesty lemon with cracked black pepper',
        ingredients: ['Lemon zest', 'Black pepper', 'Salt', 'Herbs'],
        isVegan: true,
        isGlutenFree: true
      }
    ];

    // Add each sauce to the sauces collection
    for (const sauce of saucesData) {
      await db.collection('sauces').add({
        ...sauce,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    console.log(`✅ Successfully added ${saucesData.length} sauces to emulator!`);
    console.log('Sauces added:');
    saucesData.forEach(sauce => {
      const heat = '🌶️'.repeat(sauce.heatLevel) || '🟢';
      console.log(`  - ${sauce.name} ${heat} (${sauce.category})`);
    });

  } catch (error) {
    console.error('Error adding sauces data:', error);
  }
}

addSaucesData();