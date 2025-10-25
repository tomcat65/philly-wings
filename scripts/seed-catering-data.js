/**
 * Seed Catering Packages and Add-Ons to Firestore
 * Run with: node scripts/seed-catering-data.js
 * Or for emulator: node scripts/seed-catering-data.js --emulator
 *
 * TypeScript types defined in: /src/types/catering.ts
 */

const admin = require('firebase-admin');
const path = require('path');

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
  const serviceAccountPath = '/home/tomcat65/projects/docs/Phillywingsexpress/philly-wings-firebase-adminsdk-fbsvc-b9a46d307f.json';
  admin.initializeApp({
    credential: admin.credential.cert(require(serviceAccountPath))
  });
}

const db = admin.firestore();

const baseWingTypes = [
  { id: 'bone-in', label: 'Classic Bone-In', dietaryTags: [], prepOptions: ['mixed', 'flats', 'drums'] },
  { id: 'boneless', label: 'Boneless', dietaryTags: [], prepOptions: [] },
  { id: 'cauliflower', label: 'Cauliflower Wings', dietaryTags: ['vegan'], prepOptions: [], allergens: ['none'], equipment: ['fryer'] },
  { id: 'mixed', label: 'Mix & Match', dietaryTags: [], prepOptions: [] }
];

const defaultDipTypes = ['ranch', 'blue-cheese', 'honey-mustard', 'cheese-sauce'];

/**
 * Catering Package Data - 6 Tiered Packages
 */
const cateringPackages = [
  // TIER 1: Office Lunch Packages (10-15 people)
  {
    id: 'lunch-box-special',
    name: 'The Lunch Box Special',
    tier: 1,
    servesMin: 10,
    servesMax: 12,
    basePrice: 149.99,
    targetMargin: 57.5,
    description: 'Perfect when the team earned it. 3 sauce choices mean everyone\'s happy. Feeds 10-12. You\'re welcome.',
    marketingHook: 'Perfect for team lunches and small meetings',
    popular: true,
    imageUrl: 'catering/lunch-box-special.webp',
    wingOptions: {
      totalWings: 60,
      allowMixed: true,
      types: baseWingTypes,
      boneInOptions: ['mixed', 'flats', 'drums']
    },
    sauceSelections: {
      min: 3,
      max: 3,
      allowedTypes: ['dry-rub', 'wet-sauce']
    },
    dipsIncluded: {
      count: 15,
      types: defaultDipTypes
    },
    sides: [
      { item: 'Large Fries', quantity: 3 },
      { item: 'Mozzarella Sticks', quantity: 12 }
    ],
    includes: [
      '60 wings (choice of 3 sauces)',
      '3 large fries',
      '12 mozzarella sticks',
      '15 dipping cups (ranch/blue cheese/cheese sauce)',
      'Plates, napkins, wet wipes included'
    ],
    active: true
  },
  {
    id: 'sampler-spread',
    name: 'The Sampler Spread',
    tier: 1,
    servesMin: 12,
    servesMax: 15,
    basePrice: 179.99,
    targetMargin: 59,
    description: 'More sauce variety = more excitement. Perfect for client lunches and department meetings. Feeds 12-15.',
    marketingHook: 'Ideal for client lunches and department meetings',
    popular: false,
    imageUrl: 'catering/sampler-spread.webp',
    wingOptions: {
      totalWings: 72,
      allowMixed: true,
      types: baseWingTypes,
      boneInOptions: ['mixed', 'flats', 'drums']
    },
    sauceSelections: {
      min: 4,
      max: 4,
      allowedTypes: ['dry-rub', 'wet-sauce']
    },
    dipsIncluded: {
      count: 20,
      types: defaultDipTypes
    },
    sides: [
      { item: 'Large Fries', quantity: 4 },
      { item: 'Mozzarella Sticks', quantity: 16 }
    ],
    includes: [
      '72 wings (choice of 4 different sauces for variety)',
      '4 large fries',
      '16 mozzarella sticks',
      '20 dipping cups',
      'Plates, napkins, wet wipes included'
    ],
    active: true
  },

  // TIER 2: Party Packages (20-35 people)
  {
    id: 'tailgate-party-pack',
    name: 'The Tailgate Party Pack',
    tier: 2,
    servesMin: 20,
    servesMax: 25,
    basePrice: 329.99,
    targetMargin: 60,
    description: 'Perfect for office parties, birthday celebrations, watch parties. Heavy sports theme for Eagles/Phillies/Sixers/Flyers games. Feeds 20-25.',
    marketingHook: 'Perfect for office parties and game day events',
    popular: true,
    imageUrl: 'catering/tailgate-party-pack.webp',
    wingOptions: {
      totalWings: 120,
      allowMixed: true,
      types: baseWingTypes,
      boneInOptions: ['mixed', 'flats', 'drums']
    },
    sauceSelections: {
      min: 5,
      max: 5,
      allowedTypes: ['dry-rub', 'wet-sauce']
    },
    dipsIncluded: {
      count: 30,
      types: defaultDipTypes
    },
    sides: [
      { item: 'Large Fries', quantity: 6 },
      { item: 'Mozzarella Sticks', quantity: 24 }
    ],
    includes: [
      '120 wings (choice of 5 sauces)',
      '6 large fries',
      '24 mozzarella sticks',
      '30 dipping cups',
      'Optional 2 Caesar salads (+$24)',
      'Plates, napkins, wet wipes, serving utensils included'
    ],
    active: true
  },
  {
    id: 'northeast-philly-feast',
    name: 'The Northeast Philly Feast',
    tier: 2,
    servesMin: 30,
    servesMax: 35,
    basePrice: 449.99,
    targetMargin: 61,
    description: 'Name emphasizes local Philly authenticity as differentiator. Perfect for large office celebrations and company events. Feeds 30-35.',
    marketingHook: 'Ideal for large office celebrations',
    popular: false,
    imageUrl: 'catering/northeast-philly-feast.webp',
    wingOptions: {
      totalWings: 180,
      allowMixed: true,
      types: baseWingTypes,
      boneInOptions: ['mixed', 'flats', 'drums']
    },
    sauceSelections: {
      min: 6,
      max: 6,
      allowedTypes: ['dry-rub', 'wet-sauce']
    },
    dipsIncluded: {
      count: 40,
      types: defaultDipTypes
    },
    sides: [
      { item: 'Large Fries', quantity: 8 },
      { item: 'Mozzarella Sticks', quantity: 32 },
      { item: 'Large Caesar Salads', quantity: 3 }
    ],
    includes: [
      '180 wings (choice of 6 sauces - shows off variety!)',
      '8 large fries',
      '32 mozzarella sticks',
      '3 large Caesar salads',
      '40 dipping cups',
      'Full setup with plates, napkins, wet wipes, serving trays, tongs'
    ],
    active: true
  },

  // TIER 3: Large Event Packages (50-100 people)
  {
    id: 'game-day-blowout',
    name: 'The Game Day Blowout',
    tier: 3,
    servesMin: 50,
    servesMax: 60,
    basePrice: 749.99,
    targetMargin: 62.5,
    description: 'Enough variety for everyone to find their favorite! Perfect for company-wide events, Super Bowl parties, playoff watch parties. Feeds 50-60.',
    marketingHook: 'Perfect for company-wide events and major parties',
    popular: true,
    imageUrl: 'catering/game-day-blowout.webp',
    wingOptions: {
      totalWings: 300,
      allowMixed: true,
      types: baseWingTypes,
      boneInOptions: ['mixed', 'flats', 'drums']
    },
    sauceSelections: {
      min: 8,
      max: 8,
      allowedTypes: ['dry-rub', 'wet-sauce']
    },
    dipsIncluded: {
      count: 60,
      types: defaultDipTypes
    },
    sides: [
      { item: 'Large Fries', quantity: 12 },
      { item: 'Mozzarella Sticks', quantity: 48 },
      { item: 'Large Caesar Salads', quantity: 5 }
    ],
    includes: [
      '300 wings (choice of 8 sauces - maximum variety!)',
      '12 large fries',
      '48 mozzarella sticks',
      '5 large Caesar salads',
      '60 dipping cups',
      'Complete setup with serving supplies'
    ],
    active: true
  },
  {
    id: 'championship-spread',
    name: 'The Championship Spread',
    tier: 3,
    servesMin: 90,
    servesMax: 100,
    basePrice: 1399.99,
    targetMargin: 63.5,
    description: 'ONLY catering option offering all 14 flavors simultaneously. Premium experience for large corporate events, championship celebrations, major parties. Feeds 90-100.',
    marketingHook: 'Ultimate catering experience with all 14 sauces',
    popular: false,
    imageUrl: 'catering/championship-spread.webp',
    wingOptions: {
      totalWings: 600,
      allowMixed: true,
      types: baseWingTypes,
      boneInOptions: ['mixed', 'flats', 'drums']
    },
    sauceSelections: {
      min: 14,
      max: 14,
      allowedTypes: ['dry-rub', 'wet-sauce']
    },
    dipsIncluded: {
      count: 100,
      types: defaultDipTypes
    },
    sides: [
      { item: 'Large Fries', quantity: 20 },
      { item: 'Mozzarella Sticks', quantity: 80 },
      { item: 'Large Caesar Salads', quantity: 8 }
    ],
    includes: [
      '600 wings (ALL 14 SAUCES AVAILABLE - ultimate differentiator!)',
      '20 large fries',
      '80 mozzarella sticks',
      '8 large Caesar salads',
      '100 dipping cups',
      'Premium setup with optional chafing dishes (+$50)',
      'Dedicated setup staff coordination'
    ],
    active: true
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
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Fgourmet-brownies_800x800.webp?alt=media',
    allergens: ['gluten', 'dairy', 'eggs'],
    dietaryTags: ['vegetarian'],
    description: 'Individually wrapped gourmet brownie',
    platformPricing: { ezcater: 4.8 },
    sourceLastUpdated: timestamp,
    lastSyncedAt: timestamp,
    suggestedQuantities: [1, 2, 3, 4, 5],
    quantityLabel: 'brownies'
  },
  {
    id: 'red-velvet-cake-individual',
    category: 'desserts',
    packSize: 'individual',
    availableForTiers: [1, 2, 3],
    displayOrder: 3,
    active: true,
    marketingCopy: 'Classic southern red velvet cake slice',
    sourceCollection: 'desserts',
    sourceDocumentId: 'red_velvet_cake',
    sourceVariantId: 'red_velvet_slice',
    name: 'Red Velvet Cake (Individual)',
    basePrice: 4.25,
    servings: 1,
    quantityMultiplier: 1,
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Fred-velvet-cake_800x800.webp?alt=media',
    allergens: ['gluten', 'dairy', 'eggs'],
    dietaryTags: ['vegetarian'],
    description: 'Individual slice of southern red velvet cake',
    platformPricing: { ezcater: 5.1 },
    sourceLastUpdated: timestamp,
    lastSyncedAt: timestamp,
    suggestedQuantities: [1, 2, 3, 4, 5],
    quantityLabel: 'slices'
  },
  {
    id: 'creme-brulee-cheesecake-individual',
    category: 'desserts',
    packSize: 'individual',
    availableForTiers: [1, 2, 3],
    displayOrder: 4,
    active: true,
    marketingCopy: 'Premium crème brûlée cheesecake - a luxurious treat',
    sourceCollection: 'desserts',
    sourceDocumentId: 'creme_brulee_cheesecake',
    sourceVariantId: 'creme_brulee_slice',
    name: 'Crème Brûlée Cheesecake (Individual)',
    basePrice: 4.50,
    servings: 1,
    quantityMultiplier: 1,
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Fcreme-brulee-cheesecake_800x800.webp?alt=media',
    allergens: ['gluten', 'dairy', 'eggs'],
    dietaryTags: ['vegetarian'],
    description: 'Premium crème brûlée cheesecake slice',
    platformPricing: { ezcater: 5.4 },
    sourceLastUpdated: timestamp,
    lastSyncedAt: timestamp,
    suggestedQuantities: [1, 2, 3, 4, 5],
    quantityLabel: 'slices'
  },
  {
    id: 'ny-cheesecake-individual',
    category: 'desserts',
    packSize: 'individual',
    availableForTiers: [1, 2, 3],
    displayOrder: 5,
    active: true,
    marketingCopy: 'Classic New York cheesecake - creamy perfection',
    sourceCollection: 'desserts',
    sourceDocumentId: 'ny_cheesecake',
    sourceVariantId: 'ny_cheesecake_slice',
    name: 'NY Cheesecake (Individual)',
    basePrice: 4.75,
    servings: 1,
    quantityMultiplier: 1,
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Fnew-york-cheesecake_800x800.webp?alt=media',
    allergens: ['gluten', 'dairy', 'eggs'],
    dietaryTags: ['vegetarian'],
    description: 'Individual slice of classic NY cheesecake',
    platformPricing: { ezcater: 5.7 },
    sourceLastUpdated: timestamp,
    lastSyncedAt: timestamp,
    suggestedQuantities: [1, 2, 3, 4, 5],
    quantityLabel: 'slices'
  },

  // ========== DESSERTS - 5PACK ==========
  {
    id: 'marble-pound-cake-5pack',
    category: 'desserts',
    packSize: '5pack',
    availableForTiers: [1, 2, 3],
    displayOrder: 6,
    active: true,
    marketingCopy: "Nobody left behind - Daisy's famous marble pound cake in convenient 5-pack",
    sourceCollection: 'desserts',
    sourceDocumentId: 'marble_pound_cake',
    sourceVariantId: 'marble_pound_cake_slice',
    name: "Daisy's Marble Pound Cake (5-Pack)",
    basePrice: 17.50,
    servings: 5,
    quantityMultiplier: 5,
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Fmarble-pound-cake_800x800.webp?alt=media',
    allergens: ['gluten', 'dairy', 'eggs'],
    dietaryTags: ['vegetarian'],
    description: '5 individually wrapped marble pound cake slices',
    platformPricing: { ezcater: 21 },
    sourceLastUpdated: timestamp,
    lastSyncedAt: timestamp,
    suggestedQuantities: [1, 2, 3, 4],
    quantityLabel: '5-packs'
  },
  {
    id: 'gourmet-brownies-5pack',
    category: 'desserts',
    packSize: '5pack',
    availableForTiers: [1, 2, 3],
    displayOrder: 7,
    active: true,
    marketingCopy: "Daisy's signature gourmet brownies - perfect for sharing",
    sourceCollection: 'desserts',
    sourceDocumentId: 'gourmet_brownies',
    sourceVariantId: 'brownie_single',
    name: "Daisy's Gourmet Brownies (5-Pack)",
    basePrice: 20.00,
    servings: 5,
    quantityMultiplier: 5,
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Fgourmet-brownies_800x800.webp?alt=media',
    allergens: ['gluten', 'dairy', 'eggs'],
    dietaryTags: ['vegetarian'],
    description: '5 individually wrapped gourmet brownies',
    platformPricing: { ezcater: 24 },
    sourceLastUpdated: timestamp,
    lastSyncedAt: timestamp,
    suggestedQuantities: [1, 2, 3, 4],
    quantityLabel: '5-packs'
  },
  {
    id: 'red-velvet-cake-5pack',
    category: 'desserts',
    packSize: '5pack',
    availableForTiers: [1, 2, 3],
    displayOrder: 8,
    active: true,
    marketingCopy: 'Classic southern red velvet - perfect for teams',
    sourceCollection: 'desserts',
    sourceDocumentId: 'red_velvet_cake',
    sourceVariantId: 'red_velvet_slice',
    name: 'Red Velvet Cake (5-Pack)',
    basePrice: 21.25,
    servings: 5,
    quantityMultiplier: 5,
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Fred-velvet-cake_800x800.webp?alt=media',
    allergens: ['gluten', 'dairy', 'eggs'],
    dietaryTags: ['vegetarian'],
    description: '5 slices of southern red velvet cake',
    platformPricing: { ezcater: 25.5 },
    sourceLastUpdated: timestamp,
    lastSyncedAt: timestamp,
    suggestedQuantities: [1, 2, 3, 4],
    quantityLabel: '5-packs'
  },
  {
    id: 'creme-brulee-cheesecake-5pack',
    category: 'desserts',
    packSize: '5pack',
    availableForTiers: [1, 2, 3],
    displayOrder: 9,
    active: true,
    marketingCopy: 'Premium crème brûlée cheesecake - impress your guests',
    sourceCollection: 'desserts',
    sourceDocumentId: 'creme_brulee_cheesecake',
    sourceVariantId: 'creme_brulee_slice',
    name: 'Crème Brûlée Cheesecake (5-Pack)',
    basePrice: 22.50,
    servings: 5,
    quantityMultiplier: 5,
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Fcreme-brulee-cheesecake_800x800.webp?alt=media',
    allergens: ['gluten', 'dairy', 'eggs'],
    dietaryTags: ['vegetarian'],
    description: '5 premium crème brûlée cheesecake slices',
    platformPricing: { ezcater: 27 },
    sourceLastUpdated: timestamp,
    lastSyncedAt: timestamp,
    suggestedQuantities: [1, 2, 3, 4],
    quantityLabel: '5-packs'
  },
  {
    id: 'ny-cheesecake-5pack',
    category: 'desserts',
    packSize: '5pack',
    availableForTiers: [1, 2, 3],
    displayOrder: 10,
    active: true,
    marketingCopy: 'Classic New York cheesecake - a crowd favorite',
    sourceCollection: 'desserts',
    sourceDocumentId: 'ny_cheesecake',
    sourceVariantId: 'ny_cheesecake_slice',
    name: 'NY Cheesecake (5-Pack)',
    basePrice: 23.75,
    servings: 5,
    quantityMultiplier: 5,
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Fnew-york-cheesecake_800x800.webp?alt=media',
    allergens: ['gluten', 'dairy', 'eggs'],
    dietaryTags: ['vegetarian'],
    description: '5 slices of classic New York cheesecake',
    platformPricing: { ezcater: 28.5 },
    sourceLastUpdated: timestamp,
    lastSyncedAt: timestamp,
    suggestedQuantities: [1, 2, 3, 4],
    quantityLabel: '5-packs'
  },

  // ========== BEVERAGES ==========
  {
    id: 'boxed-iced-tea-96oz',
    category: 'beverages',
    packSize: '96oz',
    availableForTiers: [1, 2, 3],
    displayOrder: 1,
    active: true,
    marketingCopy: 'Premium iced tea in convenient 96oz box - perfect for small groups',
    sourceCollection: 'menuItems',
    sourceDocumentId: '4lt9yiHeJgF8nx1Nx5nO',
    sourceVariantId: 'tea_96oz',
    name: 'Boxed Iced Tea (96oz - Serves 6)',
    basePrice: 12.99,
    servings: 6,
    servingSize: '16oz cup',
    quantityMultiplier: 1,
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fboxed-iced-tea.webp?alt=media',
    allergens: [],
    dietaryTags: ['vegan', 'gluten-free'],
    description: 'Premium iced tea in 96oz box with ice. Choose sweet or unsweet.',
    platformPricing: { ezcater: 15.59 },
    sourceLastUpdated: timestamp,
    lastSyncedAt: timestamp,
    suggestedQuantities: [1, 2, 3, 4],
    quantityLabel: 'boxes'
  },
  {
    id: 'boxed-iced-tea-3gal',
    category: 'beverages',
    packSize: '3gal',
    availableForTiers: [1, 2, 3],
    displayOrder: 2,
    active: true,
    marketingCopy: 'Premium iced tea in 3-gallon box - ideal for larger gatherings',
    sourceCollection: 'menuItems',
    sourceDocumentId: '4lt9yiHeJgF8nx1Nx5nO',
    sourceVariantId: 'tea_3gal',
    name: 'Boxed Iced Tea (3 Gallon - Serves 24)',
    basePrice: 54.26,
    servings: 24,
    servingSize: '16oz cup',
    quantityMultiplier: 1,
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fboxed-iced-tea.webp?alt=media',
    allergens: [],
    dietaryTags: ['vegan', 'gluten-free'],
    description: 'Premium iced tea in 3 gallon box with ice. Choose sweet or unsweet.',
    platformPricing: { ezcater: 65.11 },
    sourceLastUpdated: timestamp,
    lastSyncedAt: timestamp,
    suggestedQuantities: [1, 2, 3],
    quantityLabel: 'boxes'
  },

  // ========== SALADS ==========
  {
    id: 'caesar-salad-family',
    category: 'salads',
    packSize: 'family',
    availableForTiers: [1, 2, 3],
    displayOrder: 1,
    active: true,
    marketingCopy: 'Classic Caesar salad - perfect for any gathering',
    sourceCollection: 'freshSalads',
    sourceDocumentId: 'caesar_salad',
    sourceVariantId: 'caesar_salad_family',
    name: 'Caesar Salad (Family Size)',
    basePrice: 27.99,
    servings: 8,
    quantityMultiplier: 1,
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Fcaesar-salad_800x800.webp?alt=media',
    allergens: ['gluten', 'dairy', 'fish'],
    dietaryTags: ['vegetarian'],
    description: 'Romaine, parmesan, croutons, caesar dressing - serves 8',
    platformPricing: { ezcater: 33.59 },
    sourceLastUpdated: timestamp,
    lastSyncedAt: timestamp,
    suggestedQuantities: [1, 2, 3],
    quantityLabel: 'trays'
  },
  {
    id: 'spring-mix-family',
    category: 'salads',
    packSize: 'family',
    availableForTiers: [1, 2, 3],
    displayOrder: 2,
    active: true,
    marketingCopy: 'Fresh spring mix salad - light and healthy',
    sourceCollection: 'freshSalads',
    sourceDocumentId: 'spring_mix_salad',
    sourceVariantId: 'spring_mix_family',
    name: 'Spring Mix Salad (Family Size)',
    basePrice: 24.99,
    servings: 8,
    quantityMultiplier: 1,
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Fgarden-salad_800x800.webp?alt=media',
    allergens: [],
    dietaryTags: ['vegetarian', 'vegan', 'gluten-free'],
    description: 'Fresh greens, choice of dressing - serves 8',
    platformPricing: { ezcater: 29.99 },
    sourceLastUpdated: timestamp,
    lastSyncedAt: timestamp,
    suggestedQuantities: [1, 2, 3],
    quantityLabel: 'trays'
  },

  // ========== SIDES ==========
  {
    id: 'coleslaw-family',
    category: 'sides',
    packSize: 'family',
    availableForTiers: [1, 2, 3],
    displayOrder: 1,
    active: true,
    marketingCopy: "Sally Sherman's premium creamy coleslaw",
    sourceCollection: 'coldSides',
    sourceDocumentId: 'sally_sherman_coleslaw',
    sourceVariantId: 'coleslaw_family',
    name: 'Coleslaw (Family Size)',
    basePrice: 19.99,
    servings: 8,
    quantityMultiplier: 1,
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Fcoleslaw-salad_800x800.webp?alt=media',
    allergens: ['dairy', 'eggs'],
    dietaryTags: ['vegetarian'],
    description: 'Premium creamy coleslaw - serves 8',
    platformPricing: { ezcater: 23.99 },
    sourceLastUpdated: timestamp,
    lastSyncedAt: timestamp,
    suggestedQuantities: [1, 2, 3],
    quantityLabel: 'trays'
  },
  {
    id: 'potato-salad-family',
    category: 'sides',
    packSize: 'family',
    availableForTiers: [1, 2, 3],
    displayOrder: 2,
    active: true,
    marketingCopy: "Sally Sherman's classic creamy potato salad",
    sourceCollection: 'coldSides',
    sourceDocumentId: 'sally_sherman_potato_salad',
    sourceVariantId: 'potato_salad_family',
    name: 'Potato Salad (Family Size)',
    basePrice: 22.99,
    servings: 8,
    quantityMultiplier: 1,
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Fpotato-salad_800x800.webp?alt=media',
    allergens: ['dairy', 'eggs'],
    dietaryTags: ['vegetarian'],
    description: 'Classic creamy potato salad - serves 8',
    platformPricing: { ezcater: 27.59 },
    sourceLastUpdated: timestamp,
    lastSyncedAt: timestamp,
    suggestedQuantities: [1, 2, 3],
    quantityLabel: 'trays'
  },

  // ========== QUICK-ADDS ==========
  {
    id: 'bottled-water-5pack',
    category: 'quick-adds',
    packSize: '5pack',
    availableForTiers: [1, 2, 3],
    displayOrder: 1,
    active: true,
    marketingCopy: 'Nobody left behind - premium bottled water 5-pack',
    sourceCollection: 'menuItems',
    sourceDocumentId: 'kEJTNxzMmNApCqqkwYpO',
    sourceVariantId: 'bottled_water',
    name: 'Bottled Water (5-Pack)',
    basePrice: 10.00,
    servings: 5,
    quantityMultiplier: 5,
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fbottled-water.webp?alt=media',
    allergens: [],
    dietaryTags: ['vegan', 'gluten-free'],
    description: '5 premium bottled waters - nobody left behind',
    platformPricing: { ezcater: 12 },
    sourceLastUpdated: timestamp,
    lastSyncedAt: timestamp,
    suggestedQuantities: [1, 2, 3, 4],
    quantityLabel: '5-packs'
  },
  {
    id: 'chips-5pack',
    category: 'quick-adds',
    packSize: '5pack',
    availableForTiers: [1, 2, 3],
    displayOrder: 2,
    active: true,
    marketingCopy: "Miss Vickie's premium kettle chips - variety flavors",
    sourceCollection: 'menuItems',
    sourceDocumentId: 'HDtMAgkIiERc9bsIJ12j',
    // References single chip variant - runtime enrichment multiplies basePrice by quantityMultiplier (5)
    // to calculate 5-pack price. This ensures single source of truth for pricing.
    sourceVariantId: 'chips_single',
    name: "Miss Vickie's Chips (5-Pack)",
    basePrice: 7.50, // Reference price - overwritten at runtime by enrichment (single chip price * 5)
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
    console.log('   - cateringPackages (6 packages)');
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
