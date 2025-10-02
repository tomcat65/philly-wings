#!/usr/bin/env node

/**
 * Data Migration Script: Fix Corrupted Menu Data
 *
 * Issue: Arrays and objects were stored as strings in Firestore
 * Solution: Delete corrupted docs and recreate with proper data types
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, getDocs, deleteDoc, setDoc, serverTimestamp } from 'firebase/firestore';

// Firebase config for emulator or production
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyD0H8YVJhF5RTxNPdLWVVD0RwBszLkgPs8",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "philly-wings.firebaseapp.com",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "philly-wings",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "philly-wings.firebasestorage.app",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "568455923870",
  appId: process.env.VITE_FIREBASE_APP_ID || "1:568455923870:web:ac722e66e7fe19f3bc5e08"
};

// Check if running with emulator
const useEmulator = process.env.NODE_ENV === 'development' || process.argv.includes('--emulator');

if (useEmulator) {
  console.log('🔧 Using Firebase Emulators');
  process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
  process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Correct menu data structure
const MENU_ITEMS = [
  {
    id: 'wings',
    name: 'Wings',
    category: 'wings',
    description: 'Fresh, never frozen wings double-fried to crispy perfection',
    baseItem: true,
    active: true,
    sortOrder: 1,
    modifierGroups: ['sauce_choice', 'wing_style', 'extra_sauces'],
    variants: [
      {
        id: 'wings_6',
        name: '6 Wings',
        description: 'Half dozen crispy wings',
        basePrice: 5.99,
        platformPricing: {
          doordash: 8.99,
          ubereats: 8.99,
          grubhub: 7.99
        },
        portionDetails: {
          count: 6,
          servings: 1
        },
        sortOrder: 1
      },
      {
        id: 'wings_12',
        name: '12 Wings',
        description: 'One dozen crispy wings',
        basePrice: 10.99,
        platformPricing: {
          doordash: 15.99,
          ubereats: 15.99,
          grubhub: 13.99
        },
        portionDetails: {
          count: 12,
          servings: 2
        },
        sortOrder: 2
      },
      {
        id: 'wings_24',
        name: '24 Wings',
        description: 'Two dozen wings, mix up to 2 sauces',
        basePrice: 19.99,
        platformPricing: {
          doordash: 28.99,
          ubereats: 28.99,
          grubhub: 24.99
        },
        portionDetails: {
          count: 24,
          servings: 4,
          maxSauces: 2
        },
        sortOrder: 3
      },
      {
        id: 'wings_30',
        name: '30 Wings',
        description: 'Thirty wings, mix up to 3 sauces',
        basePrice: 24.99,
        platformPricing: {
          doordash: 35.99,
          ubereats: 35.99,
          grubhub: 31.99
        },
        portionDetails: {
          count: 30,
          servings: 5,
          maxSauces: 3,
          feeds: '5-6 people'
        },
        sortOrder: 4
      },
      {
        id: 'wings_50',
        name: '50 Wings',
        description: 'Fifty wings, mix up to 4 sauces',
        basePrice: 39.99,
        platformPricing: {
          doordash: 59.99,
          ubereats: 59.99,
          grubhub: 51.99
        },
        portionDetails: {
          count: 50,
          servings: 8,
          maxSauces: 4,
          feeds: '8-10 people'
        },
        sortOrder: 5
      }
    ],
    images: {
      hero: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fphilly-classic-hot.png?alt=media',
      thumbnail: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fmenu%2Fresized%2Fphilly-classic-hot_200x200.webp?alt=media'
    },
    createdAt: '2025-01-18T14:00:00Z',
    updatedAt: '2025-01-18T14:00:00Z'
  },
  {
    id: 'fries',
    name: 'Fries',
    category: 'sides',
    description: 'Golden crispy fries',
    baseItem: true,
    active: true,
    sortOrder: 2,
    customization: {
      toppingsPlacement: [
        {
          id: 'on_top',
          label: 'On Top',
          description: 'Cheese sauce and bacon served over the fries for maximum flavor.'
        },
        {
          id: 'on_side',
          label: 'On the Side',
          description: 'Toppings served separately to keep fries crisp.'
        }
      ]
    },
    variants: [
      {
        id: 'fries_regular',
        name: 'Regular Fries',
        description: '1lb of crispy golden fries',
        basePrice: 2.99,
        platformPricing: {
          doordash: 4.99,
          ubereats: 4.99,
          grubhub: 3.99
        },
        portionDetails: {
          weight: '1 lb',
          container: 'paper cup'
        },
        sortOrder: 1
      },
      {
        id: 'fries_large',
        name: 'Large Fries',
        description: '2lbs of crispy golden fries',
        basePrice: 4.99,
        platformPricing: {
          doordash: 7.99,
          ubereats: 7.99,
          grubhub: 6.99
        },
        portionDetails: {
          weight: '2 lbs',
          container: 'takeout box'
        },
        sortOrder: 2
      },
      {
        id: 'loaded_fries',
        name: 'Loaded Fries',
        description: 'Fries topped with cheese sauce and crispy bacon',
        basePrice: 5.99,
        platformPricing: {
          doordash: 8.99,
          ubereats: 8.99,
          grubhub: 7.99
        },
        portionDetails: {
          weight: '1.5 lbs',
          container: 'takeout box',
          toppings: ['cheese sauce', 'bacon bits']
        },
        allergens: ['dairy'],
        sortOrder: 3
      }
    ],
    images: {
      hero: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Floaded-fries.png?alt=media'
    },
    createdAt: '2025-01-18T14:00:00Z',
    updatedAt: '2025-01-18T14:00:00Z'
  },
  {
    id: 'mozzarella_sticks',
    name: 'Mozzarella Sticks',
    category: 'sides',
    description: 'Crispy golden mozzarella sticks with marinara sauce',
    baseItem: true,
    active: true,
    sortOrder: 3,
    variants: [
      {
        id: 'mozz_4',
        name: '4 Mozzarella Sticks',
        description: '4 sticks with 1 marinara sauce',
        basePrice: 3.99,
        platformPricing: {
          doordash: 5.99,
          ubereats: 5.99,
          grubhub: 4.99
        },
        portionDetails: {
          count: 4,
          sauces: 1,
          ratio: 1
        },
        sortOrder: 1
      },
      {
        id: 'mozz_8',
        name: '8 Mozzarella Sticks',
        description: '8 sticks with 2 marinara sauces',
        basePrice: 6.99,
        platformPricing: {
          doordash: 10.99,
          ubereats: 10.99,
          grubhub: 8.99
        },
        portionDetails: {
          count: 8,
          sauces: 2,
          ratio: 2
        },
        sortOrder: 2
      },
      {
        id: 'mozz_12',
        name: '12 Mozzarella Sticks',
        description: '12 sticks with 3 marinara sauces',
        basePrice: 9.99,
        platformPricing: {
          doordash: 14.99,
          ubereats: 14.99,
          grubhub: 12.99
        },
        portionDetails: {
          count: 12,
          sauces: 3,
          ratio: 3
        },
        sortOrder: 3
      },
      {
        id: 'mozz_16',
        name: '16 Mozzarella Sticks',
        description: '16 sticks with 4 marinara sauces',
        basePrice: 12.99,
        platformPricing: {
          doordash: 18.99,
          ubereats: 18.99,
          grubhub: 16.99
        },
        portionDetails: {
          count: 16,
          sauces: 4,
          ratio: 4
        },
        sortOrder: 4
      }
    ],
    allergens: ['dairy', 'gluten'],
    images: {
      hero: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fmozzarella-sticks.png?alt=media'
    },
    createdAt: '2025-01-18T14:00:00Z',
    updatedAt: '2025-01-18T14:00:00Z'
  },
  {
    id: 'drinks',
    name: 'Drinks',
    category: 'drinks',
    description: 'Beverages',
    baseItem: true,
    active: true,
    sortOrder: 4,
    variants: [
      {
        id: 'water_bottle',
        name: 'Bottled Water',
        description: '16.9oz bottled water',
        basePrice: 1.49,
        platformPricing: {
          doordash: 2.99,
          ubereats: 2.99,
          grubhub: 2.49
        },
        portionDetails: {
          size: '16.9 oz',
          brand: 'Dasani or similar'
        },
        sortOrder: 1
      }
    ],
    images: {
      hero: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fwater-bottle.jpg?alt=media'
    },
    createdAt: '2025-01-18T14:00:00Z',
    updatedAt: '2025-01-18T14:00:00Z'
  }
];

async function clearExistingData() {
  console.log('🗑️  Clearing existing corrupted data...');

  try {
    const menuItemsSnap = await getDocs(collection(db, 'menuItems'));
    const deletePromises = menuItemsSnap.docs.map(docSnap => deleteDoc(doc(db, 'menuItems', docSnap.id)));
    await Promise.all(deletePromises);
    console.log(`✅ Deleted ${menuItemsSnap.docs.length} corrupted menuItems`);
  } catch (error) {
    console.error('❌ Error deleting old data:', error);
  }
}

async function seedCorrectData() {
  console.log('🌱 Seeding correct menu data...');

  const promises = MENU_ITEMS.map(async (item) => {
    try {
      await setDoc(doc(db, 'menuItems', item.id), {
        ...item,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log(`✅ Added ${item.name} with ${item.variants.length} variants`);
    } catch (error) {
      console.error(`❌ Error adding ${item.name}:`, error);
    }
  });

  await Promise.all(promises);
}

async function verifyData() {
  console.log('🔍 Verifying migrated data...');

  const menuItemsSnap = await getDocs(collection(db, 'menuItems'));

  console.log(`📊 Found ${menuItemsSnap.docs.length} menu items:`);

  menuItemsSnap.docs.forEach(docSnap => {
    const data = docSnap.data();
    console.log(`  - ${data.name}: ${Array.isArray(data.variants) ? data.variants.length : 0} variants`);

    // Verify data types
    if (typeof data.variants === 'string') {
      console.error(`❌ ${data.name} still has variants as string!`);
    } else if (Array.isArray(data.variants)) {
      console.log(`✅ ${data.name} has proper variant array`);
    }
  });
}

async function main() {
  console.log('🚀 Starting Menu Data Migration...');
  console.log(`Environment: ${useEmulator ? 'EMULATOR' : 'PRODUCTION'}`);

  try {
    await clearExistingData();
    await seedCorrectData();
    await verifyData();

    console.log('🎉 Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main as fixMenuData, MENU_ITEMS };
