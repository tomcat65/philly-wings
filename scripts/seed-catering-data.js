/**
 * Seed Catering Packages and Add-Ons to Firestore
 * Run with: node scripts/seed-catering-data.js
 * Or for emulator: node scripts/seed-catering-data.js --emulator
 *
 * Matches production Firestore schema for cateringPackages collection.
 */

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Parse command line args
const useEmulator = process.argv.includes('--emulator');

// Initialize Firebase Admin
if (useEmulator) {
  console.log('🧪 Using Firestore Emulator at 127.0.0.1:8081');
  process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8081';
  admin.initializeApp({
    projectId: 'philly-wings'
  });
} else {
  const rawServiceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    path.join(__dirname, '..', 'serviceAccountKey.json');
  const serviceAccountPath = path.isAbsolute(rawServiceAccountPath)
    ? rawServiceAccountPath
    : path.resolve(process.cwd(), rawServiceAccountPath);

  if (!fs.existsSync(serviceAccountPath)) {
    console.error(
      '❌ Service account file not found. Set GOOGLE_APPLICATION_CREDENTIALS or place serviceAccountKey.json in project root.'
    );
    process.exit(1);
  }

  const serviceAccount = require(serviceAccountPath);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

/**
 * Catering Package Data - Mirrors Production Firestore
 */
const cateringPackages = [
  {
    id: 'lunch-box-special',
    name: 'Lunch Box Special',
    tier: 1,
    servesMin: 10,
    servesMax: 12,
    basePrice: 149.99,
    priceLabel: 'Starting at',
    description: 'Perfect for team lunches and small meetings. Mix of boneless and bone-in wings with chips and fresh sides.',
    marketingHook: 'Perfect when the team earned it - feeds 10-12 people',
    popular: true,
    imageUrl: 'catering/lunch-box-special.webp',
    wingOptions: {
      totalWings: 100,
      boneless: 75,
      boneIn: 25,
      allowCustomMix: true,
      boneInOptions: ['mixed', 'flats', 'drums'],
      // Wing cost tracking for differential pricing (SP-OS-S1)
      defaultDistribution: {
        boneless: 75,
        boneIn: 25,
        cauliflower: 0
      },
      perWingCosts: {
        boneless: 0.80,
        boneIn: 1.00,
        cauliflower: 1.30
      }
    },
    sauceSelections: {
      min: 3,
      max: 4,
      allowedTypes: ['dry-rub', 'signature-sauce']
    },
    dips: {
      fivePacksIncluded: 3,
      totalContainers: 15,
      options: ['ranch', 'honey-mustard', 'blue-cheese', 'cheese-sauce']
    },
    chips: {
      fivePacksIncluded: 2,
      totalBags: 10,
      brand: "Miss Vickie's Variety"
    },
    coldSides: [
      { item: 'Family Coleslaw', quantity: 1, serves: 8 },
      { item: 'Large Veggie Sticks Tray', quantity: 1, serves: 10 }
    ],
    salads: [],
    desserts: [],
    beverages: [],
    includes: [
      '75 Boneless Wings + 25 Bone-In Wings (100 total)',
      "2 Miss Vickie's Variety 5-Packs (10 chip bags)",
      '1 Family Coleslaw (serves 8)',
      '1 Large Veggie Sticks Tray',
      '3 Dip 5-Packs (15 containers)',
      '3-4 Sauce selections',
      'Complete serving supplies (plates, napkins, utensils, wet wipes)'
    ],
    active: true,
    sortOrder: 1
  },
  {
    id: 'sampler-spread',
    name: 'Sampler Spread',
    tier: 1,
    servesMin: 15,
    servesMax: 20,
    basePrice: 209.99,
    priceLabel: 'Starting at',
    description: 'Great for client lunches and department meetings. More variety with increased portions and optional desserts.',
    marketingHook: 'More sauce variety = more excitement - feeds 15-20 people',
    popular: false,
    imageUrl: 'catering/sampler-spread.webp',
    wingOptions: {
      totalWings: 150,
      boneless: 110,
      boneIn: 40,
      allowCustomMix: true,
      boneInOptions: ['mixed', 'flats', 'drums'],
      // Wing cost tracking for differential pricing (SP-OS-S1)
      defaultDistribution: {
        boneless: 110,
        boneIn: 40,
        cauliflower: 0
      },
      perWingCosts: {
        boneless: 0.80,
        boneIn: 1.00,
        cauliflower: 1.30
      }
    },
    sauceSelections: {
      min: 4,
      max: 5,
      allowedTypes: ['dry-rub', 'signature-sauce']
    },
    dips: {
      fivePacksIncluded: 4,
      totalContainers: 20,
      options: ['ranch', 'honey-mustard', 'blue-cheese', 'cheese-sauce']
    },
    chips: {
      fivePacksIncluded: 3,
      totalBags: 15,
      brand: "Miss Vickie's Variety"
    },
    coldSides: [
      { item: 'Family Coleslaw', quantity: 1, serves: 8 },
      { item: 'Family Potato Salad', quantity: 1, serves: 8 },
      { item: 'Large Veggie Sticks Tray', quantity: 2, serves: 20 }
    ],
    salads: [],
    desserts: [
      { item: 'Dessert 5-Pack', quantity: 1, optional: true, serves: 5 }
    ],
    beverages: [],
    includes: [
      '110 Boneless Wings + 40 Bone-In Wings (150 total)',
      "3 Miss Vickie's Variety 5-Packs (15 chip bags)",
      '1 Family Coleslaw (serves 8)',
      '1 Family Potato Salad (serves 8)',
      '2 Large Veggie Sticks Trays',
      '4 Dip 5-Packs (20 containers)',
      '4-5 Sauce selections',
      'Optional: 1 Dessert 5-Pack',
      'Complete serving supplies (plates, napkins, utensils, wet wipes)'
    ],
    active: true,
    sortOrder: 2
  },
  {
    id: 'tailgate-party-pack',
    name: 'Tailgate Party Pack',
    tier: 2,
    servesMin: 20,
    servesMax: 25,
    basePrice: 329.99,
    priceLabel: 'Starting at',
    description: 'Perfect for office parties, birthday celebrations, watch parties. Heavy sports theme for Eagles/Phillies/Sixers/Flyers games.',
    marketingHook: 'Perfect for office parties and game day events - feeds 20-25 people',
    popular: true,
    imageUrl: 'catering/tailgate-party-pack.webp',
    wingOptions: {
      totalWings: 200,
      boneless: 150,
      boneIn: 50,
      allowCustomMix: true,
      boneInOptions: ['mixed', 'flats', 'drums'],
      // Wing cost tracking for differential pricing (SP-OS-S1)
      defaultDistribution: {
        boneless: 150,
        boneIn: 50,
        cauliflower: 0
      },
      perWingCosts: {
        boneless: 0.80,
        boneIn: 1.00,
        cauliflower: 1.30
      }
    },
    sauceSelections: {
      min: 6,
      max: 6,
      allowedTypes: ['dry-rub', 'signature-sauce']
    },
    dips: {
      fivePacksIncluded: 5,
      totalContainers: 25,
      options: ['ranch', 'honey-mustard', 'blue-cheese', 'cheese-sauce']
    },
    chips: {
      fivePacksIncluded: 5,
      totalBags: 25,
      brand: "Miss Vickie's Variety"
    },
    coldSides: [
      { item: 'Family Coleslaw', quantity: 2, serves: 16 },
      { item: 'Family Potato Salad', quantity: 2, serves: 16 },
      { item: 'Large Veggie Sticks Tray', quantity: 3, serves: 25 }
    ],
    salads: [
      { item: 'Family Caesar Salad', quantity: 1, serves: 8 }
    ],
    desserts: [],
    beverages: [
      {
        item: '96oz Iced Tea',
        quantity: 1,
        options: ['Sweet', 'Unsweet']
      }
    ],
    includes: [
      '150 Boneless Wings + 50 Bone-In Wings (200 total)',
      "5 Miss Vickie's Variety 5-Packs (25 chip bags)",
      '2 Family Coleslaw (serves 16)',
      '2 Family Potato Salad (serves 16)',
      '3 Large Veggie Sticks Trays',
      '1 Family Caesar Salad (serves 8)',
      '5 Dip 5-Packs (25 containers)',
      '6 Sauce selections',
      '96oz Iced Tea (Sweet or Unsweet)',
      'Complete serving supplies (plates, napkins, utensils, wet wipes)'
    ],
    active: true,
    sortOrder: 3
  },
  {
    id: 'northeast-philly-feast',
    name: 'Northeast Philly Feast',
    tier: 2,
    servesMin: 30,
    servesMax: 35,
    basePrice: 449.99,
    priceLabel: 'Starting at',
    description: 'Name emphasizes local Philly authenticity as differentiator. Perfect for large office celebrations and company events.',
    marketingHook: 'Ideal for large office celebrations - feeds 30-35 people',
    popular: false,
    imageUrl: 'catering/northeast-philly-feast.webp',
    wingOptions: {
      totalWings: 300,
      boneless: 225,
      boneIn: 75,
      allowCustomMix: true,
      boneInOptions: ['mixed', 'flats', 'drums'],
      // Wing cost tracking for differential pricing (SP-OS-S1)
      defaultDistribution: {
        boneless: 225,
        boneIn: 75,
        cauliflower: 0
      },
      perWingCosts: {
        boneless: 0.80,
        boneIn: 1.00,
        cauliflower: 1.30
      }
    },
    sauceSelections: {
      min: 8,
      max: 8,
      allowedTypes: ['dry-rub', 'signature-sauce']
    },
    dips: {
      fivePacksIncluded: 7,
      totalContainers: 35,
      options: ['ranch', 'honey-mustard', 'blue-cheese', 'cheese-sauce']
    },
    chips: {
      fivePacksIncluded: 7,
      totalBags: 35,
      brand: "Miss Vickie's Variety"
    },
    coldSides: [
      { item: 'Family Coleslaw', quantity: 3, serves: 24 },
      { item: 'Family Potato Salad', quantity: 3, serves: 24 },
      { item: 'Large Veggie Sticks Tray', quantity: 4, serves: 35 }
    ],
    salads: [
      { item: 'Family Caesar Salad', quantity: 1, serves: 8 },
      { item: 'Family Spring Mix Salad', quantity: 1, serves: 8 }
    ],
    desserts: [
      { item: 'Dessert 5-Pack', quantity: 2, serves: 10 }
    ],
    beverages: [
      { item: '96oz Iced Tea Sweet', quantity: 1 },
      { item: '96oz Iced Tea Unsweet', quantity: 1 }
    ],
    includes: [
      '225 Boneless Wings + 75 Bone-In Wings (300 total)',
      "7 Miss Vickie's Variety 5-Packs (35 chip bags)",
      '3 Family Coleslaw (serves 24)',
      '3 Family Potato Salad (serves 24)',
      '4 Large Veggie Sticks Trays',
      '2 Family Salads - 1 Caesar + 1 Spring Mix (serves 16 total)',
      '7 Dip 5-Packs (35 containers)',
      '8 Sauce selections',
      '2x 96oz Iced Tea (Sweet + Unsweet)',
      '2 Dessert 5-Packs (10 individual desserts)',
      'Complete serving supplies (plates, napkins, utensils, wet wipes)'
    ],
    active: true,
    sortOrder: 4
  },
  {
    id: 'game-day-blowout',
    name: 'Game Day Blowout',
    tier: 3,
    servesMin: 50,
    servesMax: 60,
    basePrice: 749.99,
    priceLabel: 'Starting at',
    description: 'Enough variety for everyone to find their favorite! Perfect for company-wide events, Super Bowl parties, playoff watch parties.',
    marketingHook: 'Perfect for company-wide events and major parties - feeds 50-60 people',
    popular: true,
    imageUrl: 'catering/game-day-blowout.webp',
    wingOptions: {
      totalWings: 500,
      boneless: 375,
      boneIn: 125,
      allowCustomMix: true,
      boneInOptions: ['mixed', 'flats', 'drums'],
      // Wing cost tracking for differential pricing (SP-OS-S1)
      defaultDistribution: {
        boneless: 375,
        boneIn: 125,
        cauliflower: 0
      },
      perWingCosts: {
        boneless: 0.80,
        boneIn: 1.00,
        cauliflower: 1.30
      }
    },
    sauceSelections: {
      min: 10,
      max: 10,
      allowedTypes: ['dry-rub', 'signature-sauce']
    },
    dips: {
      fivePacksIncluded: 12,
      totalContainers: 60,
      options: ['ranch', 'honey-mustard', 'blue-cheese', 'cheese-sauce']
    },
    chips: {
      fivePacksIncluded: 12,
      totalBags: 60,
      brand: "Miss Vickie's Variety"
    },
    coldSides: [
      { item: 'Family Coleslaw', quantity: 5, serves: 40 },
      { item: 'Family Potato Salad', quantity: 5, serves: 40 },
      { item: 'Large Veggie Sticks Tray', quantity: 6, serves: 60 }
    ],
    salads: [
      { item: 'Family Caesar Salad', quantity: 2, serves: 16 },
      { item: 'Family Spring Mix Salad', quantity: 2, serves: 16 }
    ],
    desserts: [
      { item: 'Dessert 5-Pack', quantity: 4, serves: 20 }
    ],
    beverages: [
      { item: '3-Gallon Iced Tea Sweet', quantity: 1 },
      { item: '3-Gallon Iced Tea Unsweet', quantity: 1 },
      { item: '96oz Coffee', quantity: 1, optional: true },
      { item: '96oz Hot Chocolate', quantity: 1, optional: true }
    ],
    includes: [
      '375 Boneless Wings + 125 Bone-In Wings (500 total)',
      "12 Miss Vickie's Variety 5-Packs (60 chip bags)",
      '5 Family Coleslaw (serves 40)',
      '5 Family Potato Salad (serves 40)',
      '6 Large Veggie Sticks Trays',
      '4 Family Salads - 2 Caesar + 2 Spring Mix (serves 32 total)',
      '12 Dip 5-Packs (60 containers)',
      '10 Sauce selections',
      '2x 3-Gallon Iced Tea (Sweet + Unsweet)',
      '4 Dessert 5-Packs (20 individual desserts)',
      'Optional: Hot Beverage Service (96oz Coffee + 96oz Hot Chocolate)',
      'Complete serving supplies (plates, napkins, utensils, wet wipes)'
    ],
    active: true,
    sortOrder: 5
  },
  {
    id: 'championship-spread',
    name: 'Championship Spread',
    tier: 3,
    servesMin: 90,
    servesMax: 100,
    basePrice: 1399.99,
    priceLabel: 'Starting at',
    description: 'ONLY catering option offering all 14 flavors simultaneously. Premium experience for large corporate events, championship celebrations, major parties.',
    marketingHook: 'Ultimate catering experience with all 14 sauces - feeds 90-100 people',
    popular: false,
    imageUrl: 'catering/championship-spread.webp',
    wingOptions: {
      totalWings: 900,
      boneless: 675,
      boneIn: 225,
      allowCustomMix: true,
      boneInOptions: ['mixed', 'flats', 'drums'],
      // Wing cost tracking for differential pricing (SP-OS-S1)
      defaultDistribution: {
        boneless: 675,
        boneIn: 225,
        cauliflower: 0
      },
      perWingCosts: {
        boneless: 0.80,
        boneIn: 1.00,
        cauliflower: 1.30
      }
    },
    sauceSelections: {
      min: 14,
      max: 14,
      allowedTypes: ['dry-rub', 'signature-sauce'],
      allSauces: true
    },
    dips: {
      fivePacksIncluded: 20,
      totalContainers: 100,
      options: ['ranch', 'honey-mustard', 'blue-cheese', 'cheese-sauce'],
      allDips: true
    },
    chips: {
      fivePacksIncluded: 20,
      totalBags: 100,
      brand: "Miss Vickie's Variety"
    },
    coldSides: [
      { item: 'Family Coleslaw', quantity: 10, serves: 80 },
      { item: 'Family Potato Salad', quantity: 10, serves: 80 },
      { item: 'Large Veggie Sticks Tray', quantity: 12, serves: 100 }
    ],
    salads: [
      { item: 'Family Caesar Salad', quantity: 4, serves: 32 },
      { item: 'Family Spring Mix Salad', quantity: 4, serves: 32 }
    ],
    desserts: [
      { item: 'Dessert 5-Pack', quantity: 8, serves: 40 }
    ],
    beverages: [
      { item: '3-Gallon Iced Tea Sweet', quantity: 1 },
      { item: '3-Gallon Iced Tea Unsweet', quantity: 1 },
      { item: '3-Gallon Iced Tea Half-and-Half', quantity: 1 },
      { item: 'Water 5-Pack', quantity: 2 },
      { item: '128oz Lavazza Coffee', quantity: 1 },
      { item: '128oz Ghirardelli Hot Chocolate', quantity: 1 }
    ],
    includes: [
      '675 Boneless Wings + 225 Bone-In Wings (900 total)',
      "20 Miss Vickie's Variety 5-Packs (100 chip bags)",
      '10 Family Coleslaw (serves 80)',
      '10 Family Potato Salad (serves 80)',
      '12 Large Veggie Sticks Trays',
      '8 Family Salads - 4 Caesar + 4 Spring Mix (serves 64 total)',
      '20 Dip 5-Packs (100 containers)',
      'ALL 14 Sauce selections (complete sauce bar)',
      '3x 3-Gallon Iced Tea (Sweet, Unsweet, Half-and-Half)',
      '2 Water 5-Packs (10 bottled waters)',
      '128oz Lavazza Coffee Service',
      '128oz Ghirardelli Hot Chocolate Service',
      '8 Dessert 5-Packs (40 individual desserts)',
      'Premium serving supplies and setup'
    ],
    active: true,
    sortOrder: 6
  },
  {
    id: 'plant-based-lunch-special',
    name: 'Plant-Based Lunch Special',
    tier: 1,
    servesMin: 10,
    servesMax: 12,
    basePrice: 159.99,
    priceLabel: 'Starting at',
    description: '100% plant-based cauliflower wings with generous sides and salad. Perfect for vegan-friendly team lunches.',
    marketingHook: 'Plant-based perfection - feeds 10-12 people',
    popular: false,
    imageUrl: 'catering/plant-based-lunch-special.webp',
    wingOptions: {
      totalWings: 100,
      plantBased: 100,
      prepOptions: ['baked', 'fried'],
      allowCustomMix: false,
      // Wing cost tracking for differential pricing (SP-OS-S1)
      // Plant-based packages cannot be customized, but schema included for consistency
      defaultDistribution: {
        boneless: 0,
        boneIn: 0,
        cauliflower: 100
      },
      perWingCosts: {
        boneless: 0.80,
        boneIn: 1.00,
        cauliflower: 1.30
      }
    },
    sauceSelections: {
      min: 4,
      max: 4,
      allowedTypes: ['dry-rub', 'signature-sauce']
    },
    dips: {
      fivePacksIncluded: 3,
      totalContainers: 15,
      options: ['ranch', 'honey-mustard', 'blue-cheese', 'cheese-sauce']
    },
    chips: {
      fivePacksIncluded: 3,
      totalBags: 15,
      brand: "Miss Vickie's Variety"
    },
    coldSides: [
      { item: 'Family Coleslaw', quantity: 2, serves: 16 },
      { item: 'Family Potato Salad', quantity: 1, serves: 8 },
      { item: 'Large Veggie Sticks Tray', quantity: 2, serves: 20 }
    ],
    salads: [
      { item: 'Family Spring Mix Salad', quantity: 1, serves: 8 }
    ],
    desserts: [],
    beverages: [],
    includes: [
      '100 Plant-Based Wings (cauliflower florets - fried or baked)',
      "3 Miss Vickie's Variety 5-Packs (15 chip bags)",
      '2 Family Coleslaw (serves 16)',
      '1 Family Potato Salad (serves 8)',
      '2 Large Veggie Sticks Trays',
      '1 Family Spring Mix Salad (serves 8)',
      '3 Dip 5-Packs (15 containers)',
      '4 Sauce selections',
      'Complete serving supplies (plates, napkins, utensils, wet wipes)'
    ],
    active: true,
    sortOrder: 7,
    dietaryTags: ['plant-based', 'vegan-friendly']
  },
  {
    id: 'plant-based-sampler-spread',
    name: 'Plant-Based Sampler Spread',
    tier: 1,
    servesMin: 15,
    servesMax: 20,
    basePrice: 219.99,
    priceLabel: 'Starting at',
    description: '150 plant-based cauliflower wings with premium sides, salads, and desserts. Ideal for vegan-inclusive company events.',
    marketingHook: 'Plant-based variety for the whole team - feeds 15-20 people',
    popular: false,
    imageUrl: 'catering/plant-based-sampler-spread.webp',
    wingOptions: {
      totalWings: 150,
      plantBased: 150,
      prepOptions: ['baked', 'fried', 'split'],
      allowCustomMix: false,
      // Wing cost tracking for differential pricing (SP-OS-S1)
      // Plant-based packages cannot be customized, but schema included for consistency
      defaultDistribution: {
        boneless: 0,
        boneIn: 0,
        cauliflower: 150
      },
      perWingCosts: {
        boneless: 0.80,
        boneIn: 1.00,
        cauliflower: 1.30
      }
    },
    sauceSelections: {
      min: 4,
      max: 4,
      allowedTypes: ['dry-rub', 'signature-sauce']
    },
    dips: {
      fivePacksIncluded: 4,
      totalContainers: 20,
      options: ['ranch', 'honey-mustard', 'blue-cheese', 'cheese-sauce']
    },
    chips: {
      fivePacksIncluded: 4,
      totalBags: 20,
      brand: "Miss Vickie's Variety"
    },
    coldSides: [
      { item: 'Family Coleslaw', quantity: 2, serves: 16 },
      { item: 'Family Potato Salad', quantity: 2, serves: 16 },
      { item: 'Large Veggie Sticks Tray', quantity: 3, serves: 25 }
    ],
    salads: [
      { item: 'Family Caesar Salad', quantity: 1, serves: 8 },
      { item: 'Family Spring Mix Salad', quantity: 1, serves: 8 }
    ],
    desserts: [
      { item: 'Dessert 5-Pack', quantity: 2, serves: 10 }
    ],
    beverages: [],
    includes: [
      '150 Plant-Based Wings (cauliflower florets - fried or baked)',
      "4 Miss Vickie's Variety 5-Packs (20 chip bags)",
      '2 Family Coleslaw (serves 16)',
      '2 Family Potato Salad (serves 16)',
      '3 Large Veggie Sticks Trays',
      '2 Family Salads - 1 Caesar + 1 Spring Mix (serves 16 total)',
      '4 Dip 5-Packs (20 containers)',
      '4 Sauce selections',
      '2 Dessert 5-Packs (10 individual desserts)',
      'Complete serving supplies (plates, napkins, utensils, wet wipes)'
    ],
    active: true,
    sortOrder: 8,
    dietaryTags: ['plant-based', 'vegan-friendly']
  }
];

/**
 * Seed catering packages to Firestore
 */
async function seedCateringPackages() {
  console.log('🌱 Seeding catering packages to Firestore...\n');

  const batch = db.batch();
  let count = 0;

  for (const pkg of cateringPackages) {
    const docRef = db.collection('cateringPackages').doc(pkg.id);
    batch.set(docRef, {
      ...pkg,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    count++;
    console.log(`✅ Prepared: ${pkg.name} (Tier ${pkg.tier}, serves ${pkg.servesMin}-${pkg.servesMax})`);
  }

  await batch.commit();
  console.log(`\n🎉 Successfully seeded ${count} catering packages!`);
}

/**
 * Catering Add-Ons Data - Lightweight Reference Schema
 * References source collections instead of duplicating data
 * Includes: 10 desserts, 2 beverages, 2 salads, 2 sides, 2 quick-adds
 */
const timestamp = new Date().toISOString();

const cateringAddOns = [
  // ========== DESSERTS - INDIVIDUAL ==========
  {
    id: 'marble-pound-cake-individual',
    category: 'desserts',
    packSize: 'individual',
    availableForTiers: [1, 2, 3],
    displayOrder: 1,
    active: true,
    marketingCopy: "Nobody left behind - Daisy's famous marble pound cake slice",
    sourceCollection: 'desserts',
    sourceDocumentId: 'marble_pound_cake',
    sourceVariantId: 'marble_pound_cake_slice',
    name: "Daisy's Marble Pound Cake (Individual)",
    basePrice: 3.50,
    servings: 1,
    quantityMultiplier: 1,
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Fmarble-pound-cake_800x800.webp?alt=media',
    allergens: ['gluten', 'dairy', 'eggs'],
    dietaryTags: ['vegetarian'],
    description: 'Individually wrapped marble pound cake slice',
    platformPricing: { ezcater: 4.2 },
    sourceLastUpdated: timestamp,
    lastSyncedAt: timestamp,
    suggestedQuantities: [1, 2, 3, 4, 5],
    quantityLabel: 'slices'
  },
  {
    id: 'gourmet-brownies-individual',
    category: 'desserts',
    packSize: 'individual',
    availableForTiers: [1, 2, 3],
    displayOrder: 2,
    active: true,
    marketingCopy: "Daisy's signature gourmet brownie - rich and fudgy",
    sourceCollection: 'desserts',
    sourceDocumentId: 'gourmet_brownies',
    sourceVariantId: 'brownie_single',
    name: "Daisy's Gourmet Brownie (Individual)",
    basePrice: 4.00,
    servings: 1,
    quantityMultiplier: 1,
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Fgourmet-brownie_800x800.webp?alt=media',
    allergens: ['gluten', 'dairy', 'eggs'],
    dietaryTags: ['vegetarian'],
    description: 'Individually wrapped gourmet brownie with chocolate drizzle',
    platformPricing: { ezcater: 5 },
    sourceLastUpdated: timestamp,
    lastSyncedAt: timestamp,
    suggestedQuantities: [1, 2, 3, 4, 5],
    quantityLabel: 'brownies'
  },
  {
    id: 'mini-cheesecake-individual',
    category: 'desserts',
    packSize: 'individual',
    availableForTiers: [1, 2, 3],
    displayOrder: 3,
    active: true,
    marketingCopy: 'Classic mini cheesecake with graham cracker crust',
    sourceCollection: 'desserts',
    sourceDocumentId: 'mini_cheesecake',
    sourceVariantId: 'mini_cheesecake_single',
    name: 'Mini Cheesecake (Individual)',
    basePrice: 4.50,
    servings: 1,
    quantityMultiplier: 1,
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Fmini-cheesecake_800x800.webp?alt=media',
    allergens: ['gluten', 'dairy', 'eggs'],
    dietaryTags: ['vegetarian'],
    description: 'Individual New York-style mini cheesecake with fruit glaze',
    platformPricing: { ezcater: 5.5 },
    sourceLastUpdated: timestamp,
    lastSyncedAt: timestamp,
    suggestedQuantities: [1, 2, 3, 4, 5],
    quantityLabel: 'cheesecakes'
  },
  {
    id: 'chocolate-chip-cookie-individual',
    category: 'desserts',
    packSize: 'individual',
    availableForTiers: [1, 2, 3],
    displayOrder: 4,
    active: true,
    marketingCopy: 'Fresh-baked chocolate chip cookies (individually wrapped)',
    sourceCollection: 'desserts',
    sourceDocumentId: 'chocolate_chip_cookie',
    sourceVariantId: 'cookie_single',
    name: 'Chocolate Chip Cookie (Individual)',
    basePrice: 2.75,
    servings: 1,
    quantityMultiplier: 1,
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Fchocolate-chip-cookie_800x800.webp?alt=media',
    allergens: ['gluten', 'dairy', 'eggs'],
    dietaryTags: ['vegetarian'],
    description: 'Individually wrapped chocolate chip cookie baked in-house',
    platformPricing: { ezcater: 3.3 },
    sourceLastUpdated: timestamp,
    lastSyncedAt: timestamp,
    suggestedQuantities: [1, 2, 3, 4, 5, 6, 7],
    quantityLabel: 'cookies'
  },
  {
    id: 'brookie-individual',
    category: 'desserts',
    packSize: 'individual',
    availableForTiers: [1, 2, 3],
    displayOrder: 5,
    active: true,
    marketingCopy: 'Half brownie, half cookie, 100% Philly favorite',
    sourceCollection: 'desserts',
    sourceDocumentId: 'brookie',
    sourceVariantId: 'brookie_single',
    name: 'Brookie (Individual)',
    basePrice: 3.75,
    servings: 1,
    quantityMultiplier: 1,
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Fbrookie_800x800.webp?alt=media',
    allergens: ['gluten', 'dairy', 'eggs'],
    dietaryTags: ['vegetarian'],
    description: 'The best of both worlds: brownie + cookie in one indulgent treat',
    platformPricing: { ezcater: 4.4 },
    sourceLastUpdated: timestamp,
    lastSyncedAt: timestamp,
    suggestedQuantities: [1, 2, 3, 4, 5],
    quantityLabel: 'brookies'
  },

  // ========== DESSERTS - FIVE PACKS ==========
  {
    id: 'brownie-5pack',
    category: 'desserts',
    packSize: '5pack',
    availableForTiers: [1, 2, 3],
    displayOrder: 6,
    active: true,
    marketingCopy: 'Shareable brownie platter - 5 pieces of Daisy’s famous recipe',
    sourceCollection: 'desserts',
    sourceDocumentId: 'gourmet_brownies',
    sourceVariantId: 'brownie_5pack',
    name: "Daisy's Gourmet Brownies (5-Pack)",
    basePrice: 18.00,
    servings: 5,
    quantityMultiplier: 5,
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Fgourmet-brownie_800x800.webp?alt=media',
    allergens: ['gluten', 'dairy', 'eggs'],
    dietaryTags: ['vegetarian'],
    description: 'Shareable brownie platter cut into 5 generous pieces',
    platformPricing: { ezcater: 22 },
    sourceLastUpdated: timestamp,
    lastSyncedAt: timestamp,
    suggestedQuantities: [1, 2, 3, 4],
    quantityLabel: 'platters'
  },
  {
    id: 'cookie-5pack',
    category: 'desserts',
    packSize: '5pack',
    availableForTiers: [1, 2, 3],
    displayOrder: 7,
    active: true,
    marketingCopy: 'Baked fresh every morning - 5 warm cookies',
    sourceCollection: 'desserts',
    sourceDocumentId: 'chocolate_chip_cookie',
    sourceVariantId: 'cookie_5pack',
    name: 'Chocolate Chip Cookies (5-Pack)',
    basePrice: 10.50,
    servings: 5,
    quantityMultiplier: 5,
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Fchocolate-chip-cookie_800x800.webp?alt=media',
    allergens: ['gluten', 'dairy', 'eggs'],
    dietaryTags: ['vegetarian'],
    description: 'Five warm chocolate chip cookies baked fresh in-house',
    platformPricing: { ezcater: 12.5 },
    sourceLastUpdated: timestamp,
    lastSyncedAt: timestamp,
    suggestedQuantities: [1, 2, 3, 4, 5],
    quantityLabel: 'bags'
  },
  {
    id: 'muni-cheesecake-5pack',
    category: 'desserts',
    packSize: '5pack',
    availableForTiers: [1, 2, 3],
    displayOrder: 8,
    active: true,
    marketingCopy: 'Assorted mini cheesecakes - perfect bite-sized treats',
    sourceCollection: 'desserts',
    sourceDocumentId: 'mini_cheesecake',
    sourceVariantId: 'mini_cheesecake_5pack',
    name: 'Mini Cheesecake Sampler (5-Pack)',
    basePrice: 21.50,
    servings: 5,
    quantityMultiplier: 5,
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Fmini-cheesecake_800x800.webp?alt=media',
    allergens: ['gluten', 'dairy', 'eggs'],
    dietaryTags: ['vegetarian'],
    description: 'Assorted mini cheesecakes - includes seasonal rotating flavors',
    platformPricing: { ezcater: 25 },
    sourceLastUpdated: timestamp,
    lastSyncedAt: timestamp,
    suggestedQuantities: [1, 2, 3, 4],
    quantityLabel: 'samplers'
  },
  {
    id: 'brookie-5pack',
    category: 'desserts',
    packSize: '5pack',
    availableForTiers: [1, 2, 3],
    displayOrder: 9,
    active: true,
    marketingCopy: 'Fan-favorite brookie platter - 5 indulgent pieces',
    sourceCollection: 'desserts',
    sourceDocumentId: 'brookie',
    sourceVariantId: 'brookie_5pack',
    name: 'Brookies (5-Pack)',
    basePrice: 17.50,
    servings: 5,
    quantityMultiplier: 5,
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Fbrookie_800x800.webp?alt=media',
    allergens: ['gluten', 'dairy', 'eggs'],
    dietaryTags: ['vegetarian'],
    description: 'Five brookies (half brownie, half cookie) cut for sharing',
    platformPricing: { ezcater: 21 },
    sourceLastUpdated: timestamp,
    lastSyncedAt: timestamp,
    suggestedQuantities: [1, 2, 3, 4],
    quantityLabel: 'platters'
  },
  {
    id: 'vegan-brownie-5pack',
    category: 'desserts',
    packSize: '5pack',
    availableForTiers: [1, 2, 3],
    displayOrder: 10,
    active: true,
    marketingCopy: 'Vegan-friendly brownie bars made with dark chocolate',
    sourceCollection: 'desserts',
    sourceDocumentId: 'vegan_brownie',
    sourceVariantId: 'vegan_brownie_5pack',
    name: 'Vegan Brownies (5-Pack)',
    basePrice: 19.00,
    servings: 5,
    quantityMultiplier: 5,
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Fvegan-brownie_800x800.webp?alt=media',
    allergens: ['gluten'],
    dietaryTags: ['vegan'],
    description: 'Plant-based brownie bars made with dark chocolate and olive oil',
    platformPricing: { ezcater: 23 },
    sourceLastUpdated: timestamp,
    lastSyncedAt: timestamp,
    suggestedQuantities: [1, 2, 3],
    quantityLabel: 'platters'
  },

  // ========== BEVERAGES ==========
  {
    id: '96oz-iced-tea',
    category: 'beverages',
    packSize: '96oz',
    availableForTiers: [1, 2, 3],
    displayOrder: 11,
    active: true,
    marketingCopy: '96oz insulated carrier - choose sweet or unsweet',
    sourceCollection: 'beverages',
    sourceDocumentId: 'iced_tea_96oz',
    sourceVariantId: 'iced_tea_carrier',
    name: '96oz Iced Tea Carrier',
    basePrice: 12.00,
    servings: 8,
    quantityMultiplier: 1,
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Ficed-tea-carrier_800x800.webp?alt=media',
    allergens: [],
    dietaryTags: ['vegan'],
    description: 'Insulated beverage carrier with cups, lids, and sweetener packets',
    platformPricing: { ezcater: 14 },
    sourceLastUpdated: timestamp,
    lastSyncedAt: timestamp,
    options: ['Sweet', 'Unsweet'],
    suggestedQuantities: [1, 2, 3, 4],
    quantityLabel: 'carriers'
  },
  {
    id: '3gal-iced-tea',
    category: 'beverages',
    packSize: '3gal',
    availableForTiers: [2, 3],
    displayOrder: 12,
    active: true,
    marketingCopy: 'Large event iced tea service (sweet/unsweet/half-and-half)',
    sourceCollection: 'beverages',
    sourceDocumentId: 'iced_tea_3gal',
    sourceVariantId: 'iced_tea_dispenser',
    name: '3-Gallon Iced Tea Dispenser',
    basePrice: 34.00,
    servings: 25,
    quantityMultiplier: 1,
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Ficed-tea-dispenser_800x800.webp?alt=media',
    allergens: [],
    dietaryTags: ['vegan'],
    description: 'Full iced tea service with 3-gallon dispenser, cups, lids, and citrus garnish',
    platformPricing: { ezcater: 39 },
    sourceLastUpdated: timestamp,
    lastSyncedAt: timestamp,
    options: ['Sweet', 'Unsweet', 'Half-and-Half'],
    suggestedQuantities: [1, 2, 3],
    quantityLabel: 'dispensers'
  },

  // ========== SALADS ==========
  {
    id: 'caesar-salad-family',
    category: 'salads',
    packSize: 'family',
    availableForTiers: [1, 2, 3],
    displayOrder: 13,
    active: true,
    marketingCopy: 'Classic Caesar with romaine, parmesan, croutons, and dressing',
    sourceCollection: 'freshSalads',
    sourceDocumentId: 'caesar_family',
    sourceVariantId: 'caesar_family_bowl',
    name: 'Family Caesar Salad',
    basePrice: 22.00,
    servings: 8,
    quantityMultiplier: 1,
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Fcaesar-salad_800x800.webp?alt=media',
    allergens: ['dairy', 'gluten'],
    dietaryTags: ['vegetarian'],
    description: 'Family-sized Caesar salad with dressing on the side',
    platformPricing: { ezcater: 26 },
    sourceLastUpdated: timestamp,
    lastSyncedAt: timestamp,
    suggestedQuantities: [1, 2, 3],
    quantityLabel: 'bowls'
  },
  {
    id: 'spring-mix-salad-family',
    category: 'salads',
    packSize: 'family',
    availableForTiers: [1, 2, 3],
    displayOrder: 14,
    active: true,
    marketingCopy: 'Mixed greens with seasonal veggies and house vinaigrette',
    sourceCollection: 'freshSalads',
    sourceDocumentId: 'spring_mix_family',
    sourceVariantId: 'spring_mix_family_bowl',
    name: 'Family Spring Mix Salad',
    basePrice: 24.00,
    servings: 8,
    quantityMultiplier: 1,
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Fspring-mix-salad_800x800.webp?alt=media',
    allergens: [],
    dietaryTags: ['vegan'],
    description: 'Seasonal spring mix salad with house-made vinaigrette',
    platformPricing: { ezcater: 28 },
    sourceLastUpdated: timestamp,
    lastSyncedAt: timestamp,
    suggestedQuantities: [1, 2, 3],
    quantityLabel: 'bowls'
  },

  // ========== SIDES ==========
  {
    id: 'coleslaw-family',
    category: 'sides',
    packSize: 'family',
    availableForTiers: [1, 2, 3],
    displayOrder: 15,
    active: true,
    marketingCopy: 'Creamy homestyle coleslaw (serves 8)',
    sourceCollection: 'coldSides',
    sourceDocumentId: 'homestyle_coleslaw_family',
    sourceVariantId: 'coleslaw_family_bowl',
    name: 'Family Coleslaw',
    basePrice: 14.00,
    servings: 8,
    quantityMultiplier: 1,
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Fcoleslaw_800x800.webp?alt=media',
    allergens: ['eggs'],
    dietaryTags: ['vegetarian'],
    description: 'Creamy homestyle coleslaw with shredded cabbage and carrots',
    platformPricing: { ezcater: 16.5 },
    sourceLastUpdated: timestamp,
    lastSyncedAt: timestamp,
    suggestedQuantities: [1, 2, 3, 4, 5],
    quantityLabel: 'bowls'
  },
  {
    id: 'potato-salad-family',
    category: 'sides',
    packSize: 'family',
    availableForTiers: [1, 2, 3],
    displayOrder: 16,
    active: true,
    marketingCopy: 'Creamy red potato salad with dill and scallions',
    sourceCollection: 'coldSides',
    sourceDocumentId: 'potato_salad_family',
    sourceVariantId: 'potato_salad_family_bowl',
    name: 'Family Potato Salad',
    basePrice: 16.00,
    servings: 8,
    quantityMultiplier: 1,
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Fpotato-salad_800x800.webp?alt=media',
    allergens: ['eggs'],
    dietaryTags: ['vegetarian'],
    description: 'Red bliss potato salad with dill, scallions, and house dressing',
    platformPricing: { ezcater: 18.5 },
    sourceLastUpdated: timestamp,
    lastSyncedAt: timestamp,
    suggestedQuantities: [1, 2, 3, 4, 5],
    quantityLabel: 'bowls'
  },

  // ========== QUICK-ADDS ==========
  {
    id: 'water-5pack',
    category: 'quick-adds',
    packSize: '5pack',
    availableForTiers: [1, 2, 3],
    displayOrder: 17,
    active: true,
    marketingCopy: 'Pack of 5 bottled waters (16.9oz each)',
    sourceCollection: 'menuItems',
    sourceDocumentId: 'HDtMAgkIiERc9bsIJ12j',
    sourceVariantId: 'water_single',
    name: 'Water Bottles (5-Pack)',
    basePrice: 0, // Placeholder - pricing resolved from source variant
    servings: 5,
    quantityMultiplier: 5,
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Fwater-bottles_800x800.webp?alt=media',
    allergens: [],
    dietaryTags: ['vegan'],
    description: 'Five bottled waters (16.9oz) - perfect add-on for any package',
    platformPricing: { ezcater: 8.5 },
    sourceLastUpdated: timestamp,
    lastSyncedAt: timestamp,
    suggestedQuantities: [1, 2, 3, 4, 5],
    quantityLabel: '5-packs'
  },
  {
    id: 'chips-5pack',
    category: 'quick-adds',
    packSize: '5pack',
    availableForTiers: [1, 2, 3],
    displayOrder: 18,
    active: true,
    marketingCopy: "Miss Vickie's premium kettle chips - variety flavors",
    sourceCollection: 'menuItems',
    sourceDocumentId: 'HDtMAgkIiERc9bsIJ12j',
    sourceVariantId: 'chips_single',
    name: "Miss Vickie's Chips (5-Pack)",
    basePrice: 0, // Placeholder - pricing resolved from source variant
    servings: 5,
    quantityMultiplier: 5,
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fmiss-vickies-chips.webp?alt=media',
    allergens: [],
    dietaryTags: ['vegetarian'],
    description: "5 bags of Miss Vickie's premium kettle chips - variety flavors",
    platformPricing: { ezcater: 9 },
    sourceLastUpdated: timestamp,
    lastSyncedAt: timestamp,
    suggestedQuantities: [1, 2, 3, 4],
    quantityLabel: '5-packs'
  }
];

cateringAddOns.forEach(addOn => {
  if (addOn.basePrice === 0 && addOn.sourceVariantId) {
    console.warn(`⚠️  ${addOn.id} has basePrice of 0 and relies on enrichment. Consider setting fallback price.`);
  }
  if (addOn.basePrice === 0 && !addOn.sourceVariantId) {
    throw new Error(`❌ ${addOn.id} has invalid pricing: basePrice is 0 with no sourceVariantId`);
  }
});

/**
 * Seed catering add-ons to Firestore with lightweight reference schema
 */
async function seedCateringAddOns() {
  console.log('\n🌱 Seeding catering add-ons (Lightweight Reference Schema)...\n');

  const batch = db.batch();
  let count = 0;

  for (const addOn of cateringAddOns) {
    const docRef = db.collection('cateringAddOns').doc(addOn.id);
    batch.set(docRef, addOn);
    count++;
    console.log(`✅ Prepared: ${addOn.name} (${addOn.category}/${addOn.packSize}, $${addOn.basePrice})`);
  }

  await batch.commit();
  console.log(`\n🎉 Successfully seeded ${count} catering add-ons!`);
  console.log('   📋 Summary:');
  console.log('      - 10 desserts (5 individual + 5 five-packs)');
  console.log('      - 2 beverages (96oz + 3gal)');
  console.log('      - 2 salads (family size)');
  console.log('      - 2 sides (family size)');
  console.log('      - 2 quick-adds (5-packs)');
}

/**
 * Initialize availability collection for next 90 days
 */
async function seedCateringAvailability() {
  console.log('\n📅 Initializing catering availability for next 90 days...\n');

  const today = new Date();
  const batch = db.batch();
  let count = 0;

  for (let i = 0; i < 90; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD

    const docRef = db.collection('cateringAvailability').doc(dateStr);
    batch.set(docRef, {
      date: dateStr,
      totalWingsOrdered: 0,
      maxDailyCapacity: 1000,
      ordersCount: 0,
      maxOrdersPerDay: 8,
      notes: ''
    });
    count++;

    if (i < 7) {
      console.log(`✅ Initialized: ${dateStr}`);
    } else if (i === 7) {
      console.log(`   ... and ${90 - 7} more dates`);
    }
  }

  await batch.commit();
  console.log(`\n🎉 Successfully initialized ${count} days of availability!`);
}

/**
 * Main execution
 */
async function main() {
  try {
    console.log('\n🚀 Starting Catering Data Seed\n');
    console.log('=================================\n');

    await seedCateringPackages();
    await seedCateringAddOns();
    await seedCateringAvailability();

    console.log('\n=================================');
    console.log('✅ All catering data seeded successfully!\n');
    console.log('📦 Collections created:');
    console.log('   - cateringPackages (8 packages)');
    console.log('   - cateringAddOns (18 items with lightweight reference schema)');
    console.log('   - cateringAvailability (90 days)\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding catering data:', error);
    process.exit(1);
  }
}

// Run the script
main();
