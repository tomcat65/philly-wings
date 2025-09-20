#!/usr/bin/env node

/**
 * Production Menu Data Restoration
 * Uses Firebase Admin SDK to create proper menu structure in PRODUCTION
 */

import admin from 'firebase-admin';

// Initialize Firebase Admin for PRODUCTION (no emulator settings)
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'philly-wings'
  });
}

const db = admin.firestore();

// Correct menu items with proper array structures
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
        description: 'Half dozen wings with your choice of sauce',
        basePrice: 5.99,
        platformPricing: {
          doordash: 8.99,
          ubereats: 8.99,
          grubhub: 7.99
        },
        portionDetails: {
          count: 6,
          servings: 1,
          maxSauces: 1
        },
        sortOrder: 1
      },
      {
        id: 'wings_12',
        name: '12 Wings',
        description: 'A dozen wings with your choice of sauce',
        basePrice: 10.99,
        platformPricing: {
          doordash: 16.99,
          ubereats: 16.99,
          grubhub: 14.99
        },
        portionDetails: {
          count: 12,
          servings: 2,
          maxSauces: 1
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
          maxSauces: 3
        },
        sortOrder: 4
      },
      {
        id: 'wings_50',
        name: '50 Wings',
        description: 'Fifty wings for the big game, mix up to 4 sauces',
        basePrice: 39.99,
        platformPricing: {
          doordash: 59.99,
          ubereats: 59.99,
          grubhub: 51.99
        },
        portionDetails: {
          count: 50,
          servings: 8,
          maxSauces: 4
        },
        sortOrder: 5
      }
    ],
    images: {
      hero: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fphilly-classic-hot.png?alt=media'
    }
  },
  {
    id: 'fries',
    name: 'Fries',
    category: 'sides',
    description: 'Golden crispy fries',
    baseItem: true,
    active: true,
    sortOrder: 2,
    variants: [
      {
        id: 'fries_small',
        name: 'Small Fries',
        description: 'Individual serving of crispy fries',
        basePrice: 2.99,
        platformPricing: {
          doordash: 4.99,
          ubereats: 4.99,
          grubhub: 3.99
        },
        portionDetails: {
          size: 'Small',
          servings: 1
        },
        sortOrder: 1
      },
      {
        id: 'fries_large',
        name: 'Large Fries',
        description: 'Shareable portion of crispy fries',
        basePrice: 4.99,
        platformPricing: {
          doordash: 7.99,
          ubereats: 7.99,
          grubhub: 6.49
        },
        portionDetails: {
          size: 'Large',
          servings: 3
        },
        sortOrder: 2
      },
      {
        id: 'fries_loaded',
        name: 'Loaded Fries',
        description: 'Large fries topped with cheese sauce, bacon bits, and green onions',
        basePrice: 8.99,
        platformPricing: {
          doordash: 13.99,
          ubereats: 13.99,
          grubhub: 11.99
        },
        portionDetails: {
          size: 'Large',
          servings: 3,
          toppings: ['cheese sauce', 'bacon bits', 'green onions']
        },
        sortOrder: 3
      }
    ],
    images: {
      hero: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Floaded-fries.png?alt=media'
    }
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
        description: 'Four crispy mozzarella sticks with marinara',
        basePrice: 5.99,
        platformPricing: {
          doordash: 8.99,
          ubereats: 8.99,
          grubhub: 7.49
        },
        portionDetails: {
          count: 4,
          servings: 1,
          sauce: 'marinara'
        },
        sortOrder: 1
      },
      {
        id: 'mozz_6',
        name: '6 Mozzarella Sticks',
        description: 'Six crispy mozzarella sticks with marinara',
        basePrice: 7.99,
        platformPricing: {
          doordash: 11.99,
          ubereats: 11.99,
          grubhub: 9.99
        },
        portionDetails: {
          count: 6,
          servings: 2,
          sauce: 'marinara'
        },
        sortOrder: 2
      },
      {
        id: 'mozz_8',
        name: '8 Mozzarella Sticks',
        description: 'Eight crispy mozzarella sticks with marinara',
        basePrice: 9.99,
        platformPricing: {
          doordash: 14.99,
          ubereats: 14.99,
          grubhub: 12.49
        },
        portionDetails: {
          count: 8,
          servings: 3,
          sauce: 'marinara'
        },
        sortOrder: 3
      },
      {
        id: 'mozz_12',
        name: '12 Mozzarella Sticks',
        description: 'Dozen crispy mozzarella sticks with marinara - perfect for sharing',
        basePrice: 13.99,
        platformPricing: {
          doordash: 20.99,
          ubereats: 20.99,
          grubhub: 17.49
        },
        portionDetails: {
          count: 12,
          servings: 4,
          sauce: 'marinara'
        },
        sortOrder: 4
      }
    ],
    allergens: ['dairy', 'gluten'],
    images: {
      hero: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fmozzarella-sticks.png?alt=media'
    }
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
    }
  }
];

async function restoreProductionMenu() {
  console.log('🚀 Restoring Production Menu with Admin SDK...');
  console.log('🎯 Target: PRODUCTION Firebase (philly-wings)');

  try {
    // Create correct menu items using batch write
    const batch = db.batch();

    MENU_ITEMS.forEach((item) => {
      const docRef = db.collection('menuItems').doc(item.id);
      batch.set(docRef, {
        ...item,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`  ✅ Prepared ${item.name} (${item.variants.length} variants)`);
    });

    await batch.commit();
    console.log(`  ✨ Committed ${MENU_ITEMS.length} menu items to PRODUCTION`);

    // Verify the fix
    console.log('🔍 Verifying production menu...');
    const menuItemsSnap = await db.collection('menuItems').get();
    const menuItems = menuItemsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    console.log(`📊 Found ${menuItems.length} menu items in production:`);

    menuItems.forEach(item => {
      if (item.variants && Array.isArray(item.variants)) {
        console.log(`  ✅ ${item.name}: ${item.variants.length} variants (proper arrays)`);
      } else if (item.variants) {
        console.log(`  ❌ ${item.name}: variants corrupted`);
      } else {
        console.log(`  - ${item.name}: no variants`);
      }
    });

    console.log('🎉 Production menu restoration completed!');
    console.log('🔗 Admin panel should now work: https://philly-wings.web.app/admin/platform-menu.html');

    process.exit(0);
  } catch (error) {
    console.error('💥 Production restoration failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  restoreProductionMenu();
}

export { restoreProductionMenu };
