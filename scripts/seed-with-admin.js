#!/usr/bin/env node

/**
 * Test Data Seeder using Firebase Admin SDK (bypasses security rules)
 */

import admin from 'firebase-admin';
import { MENU_ITEMS } from './fix-menu-data.js';

// Initialize Firebase Admin for emulator
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'philly-wings'
  });
}

// Point to emulator
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
const db = admin.firestore();

// Test modifier groups
const MODIFIER_GROUPS = [
  {
    id: 'sauce_choice',
    name: 'Choose Your Sauce',
    description: 'Select sauce for your wings',
    type: 'single_select',
    required: true,
    min: 1,
    max: 1,
    sortOrder: 1,
    options: [
      { id: 'mild-buffalo', name: 'Mild Buffalo', price: 0, default: false },
      { id: 'philly-classic-hot', name: 'Philly Classic Hot', price: 0, default: false },
      { id: 'broad-pattison-burn', name: 'BROAD & PATTISON BURN', price: 0, default: false },
      { id: 'grittys-revenge', name: 'Gritty\'s Revenge', price: 0, default: false },
      { id: 'tailgate-bbq', name: 'Tailgate BBQ', price: 0, default: false },
      { id: 'sweet-teriyaki', name: 'Sweet Teriyaki', price: 0, default: false },
      { id: 'classic-lemon-pepper', name: 'Classic Lemon Pepper', price: 0, default: false },
      { id: 'northeast-hot-lemon', name: 'Northeast Hot Lemon', price: 0, default: false },
      { id: 'frankford-cajun', name: 'Frankford Cajun', price: 0, default: false },
      { id: 'garlic-parmesan', name: 'Garlic Parmesan', price: 0, default: false }
    ],
    active: true
  },
  {
    id: 'wing_style',
    name: 'Wing Style',
    description: 'Choose your wing style',
    type: 'single_select',
    required: true,
    min: 1,
    max: 1,
    sortOrder: 2,
    options: [
      { id: 'regular', name: 'Regular (Mix of Drums & Flats)', price: 0, default: true },
      { id: 'all-drums', name: 'All Drums', price: 1.5, default: false },
      { id: 'all-flats', name: 'All Flats', price: 1.5, default: false },
      { id: 'boneless', name: 'Boneless', price: 0, default: false }
    ],
    active: true
  },
  {
    id: 'extra_sauces',
    name: 'Extra Sauces & Dips',
    description: 'Add extra sauces or dips',
    type: 'multi_select',
    required: false,
    min: 0,
    max: 4,
    sortOrder: 3,
    options: [
      { id: 'ranch', name: 'Ranch Dip', price: 0.75, default: false },
      { id: 'honey-mustard', name: 'Honey Mustard', price: 0.75, default: false },
      { id: 'blue-cheese', name: 'Blue Cheese', price: 0.75, default: false },
      { id: 'cheese-sauce', name: 'Cheese Sauce', price: 1.25, default: false },
      { id: 'extra-marinara', name: 'Extra Marinara', price: 0.75, default: false }
    ],
    active: true
  }
];

// Test combo deals
const COMBOS = [
  {
    id: 'game_day_30',
    name: 'Game Day 30',
    category: 'combos',
    description: '30 wings (mix up to 3 sauces), 2 large fries, 8 mozzarella sticks. Perfect for game day!',
    active: true,
    featured: true,
    sortOrder: 1,
    components: [
      { type: 'wings', itemId: 'wings', variantId: 'wings_30', quantity: 1, customizable: true },
      { type: 'sides', itemId: 'fries', variantId: 'fries_large', quantity: 2 },
      { type: 'sides', itemId: 'mozzarella_sticks', variantId: 'mozz_8', quantity: 1 }
    ],
    basePrice: 24.99,
    platformPricing: {
      doordash: 35.99,
      ubereats: 35.99,
      grubhub: 31.99
    },
    portionDetails: {
      feeds: '5-6 people',
      totalPieces: 30
    },
    modifierGroups: ['sauce_choice_combo', 'wing_style', 'extra_sauces']
  },
  {
    id: 'the_tailgater',
    name: 'The Tailgater',
    category: 'combos',
    description: '24 wings + 8 mozzarella sticks + large fries. Perfect for sharing!',
    active: true,
    featured: true,
    sortOrder: 2,
    components: [
      {
        type: 'wings',
        itemId: 'wings',
        variantId: 'wings_24',
        quantity: 1,
        customizable: true
      },
      {
        type: 'sides',
        itemId: 'mozzarella_sticks',
        variantId: 'mozz_8',
        quantity: 1
      },
      {
        type: 'sides',
        itemId: 'fries',
        variantId: 'fries_large',
        quantity: 1
      }
    ],
    basePrice: 31.99,
    platformPricing: {
      doordash: 47.99,
      ubereats: 47.99,
      grubhub: 40.99
    },
    portionDetails: {
      feeds: '3-5 people',
      totalPieces: '24 wings + 8 sticks + large fries'
    },
    modifierGroups: ['sauce_choice_combo', 'wing_style', 'extra_sauces'],
    savings: {
      amount: 6.97,
      percentage: 15
    }
  }
];

// Test sauces
const SAUCES = [
  {
    id: 'mild-buffalo',
    name: 'Mild Buffalo',
    category: 'signature-sauce',
    description: 'Mild buffalo - all flavor, easy heat',
    heatLevel: 1,
    active: true,
    featured: false,
    sortOrder: 7,
    allergens: ['dairy'],
    isDryRub: false,
    containsDairy: true,
    containsGluten: false,
    vegetarian: true,
    platformAvailability: ['doordash', 'ubereats', 'grubhub']
  },
  {
    id: 'grittys-revenge',
    name: 'Gritty\'s Revenge',
    category: 'signature-sauce',
    description: 'Scorpion pepper heat that even Gritty respects',
    heatLevel: 5,
    active: true,
    featured: true,
    sortOrder: 10,
    allergens: [],
    isDryRub: false,
    containsDairy: false,
    containsGluten: false,
    vegetarian: true,
    platformAvailability: ['doordash', 'ubereats', 'grubhub']
  },
  {
    id: 'ranch',
    name: 'Ranch',
    category: 'dip',
    description: 'Cool & creamy ranch dip',
    basePrice: 0.75,
    active: true,
    sortOrder: 201,
    allergens: ['dairy', 'egg'],
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fdips%2Franch.png?alt=media',
    platformAvailability: ['doordash', 'ubereats', 'grubhub']
  },
  {
    id: 'honey-mustard',
    name: 'Honey Mustard',
    category: 'dip',
    description: 'Sweet & tangy honey mustard dip',
    basePrice: 0.75,
    active: true,
    sortOrder: 202,
    allergens: [],
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fdips%2Fhoney-mustard.png?alt=media',
    platformAvailability: ['doordash', 'ubereats', 'grubhub']
  },
  {
    id: 'blue-cheese',
    name: 'Blue Cheese',
    category: 'dip',
    description: 'Chunky blue cheese dip',
    basePrice: 0.75,
    active: true,
    sortOrder: 203,
    allergens: ['dairy'],
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fdips%2Fblue-cheese.png?alt=media',
    platformAvailability: ['doordash', 'ubereats', 'grubhub']
  },
  {
    id: 'cheese-sauce',
    name: 'Cheese Sauce',
    category: 'dip',
    description: 'Warm & melty cheese sauce',
    basePrice: 0.75,
    active: true,
    sortOrder: 204,
    allergens: ['dairy'],
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fdips%2Fcheese-sauce.png?alt=media',
    platformAvailability: ['doordash', 'ubereats', 'grubhub']
  }
];

async function seedCollection(collectionName, data, description) {
  console.log(`🌱 Seeding ${description}...`);

  const batch = db.batch();

  data.forEach((item) => {
    const docRef = db.collection(collectionName).doc(item.id);
    batch.set(docRef, {
      ...item,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log(`  ✅ Prepared ${item.name || item.id}`);
  });

  await batch.commit();
  console.log(`  ✨ Committed ${data.length} documents to ${collectionName}`);
}

async function main() {
  console.log('🚀 Seeding Firebase Emulator with Test Data (Admin SDK)...');

  try {
    await seedCollection('menuItems', MENU_ITEMS, 'Menu Items with Variants');
    await seedCollection('modifierGroups', MODIFIER_GROUPS, 'Modifier Groups');
    await seedCollection('combos', COMBOS, 'Combo Deals');
    await seedCollection('sauces', SAUCES, 'Sauces & Seasonings');

    console.log('🎉 Test data seeding completed!');
    console.log('🔗 Access admin panel: http://localhost:5000/admin/platform-menu.html');
    console.log('🔗 Firebase UI: http://localhost:4000');

    process.exit(0);
  } catch (error) {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main as seedWithAdmin };
