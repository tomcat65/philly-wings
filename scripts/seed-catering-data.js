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
  const serviceAccountPath = path.join(__dirname, '..', 'philly-wings-firebase-adminsdk-fbsvc-b9a46d307f.json');
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
 * Catering Add-Ons Data - Vegetarian & Desserts
 * Based on TypeScript types in /src/types/catering.ts
 */
const cateringAddOns = [
  // VEGETARIAN MAIN ALTERNATIVES
  {
    id: 'elenas-eggplant-parmesan-tray',
    name: "Elena's Eggplant Parmesan",
    category: 'vegetarian',
    type: 'main-alternative',
    description: 'Authentic Italian eggplant parmesan, ready to heat and serve. Crispy breaded eggplant layered with marinara and melted mozzarella.',
    supplier: "Restaurant Depot - Elena's",
    supplierSku: 'ELENA-EGGPLANT-FULL',
    storageType: 'frozen',
    leadTimeDays: 2,
    prepTimeMinutes: 50,
    teamCapability: 'heat-only',
    requiredEquipment: ['impingerOven'],
    operationalNotes: 'Thaw overnight in refrigeration. Heat at 350°F for 45-50 minutes until internal temp reaches 165°F.',
    servingSize: 'Full tray',
    serves: '12-15 people',
    basePrice: 45.00,
    costPerUnit: 18.50,
    marginTarget: 59,
    availableForTiers: [1, 2, 3],
    maxDailyUnits: 10,
    allergens: ['dairy', 'gluten', 'egg'],
    dietaryTags: ['vegetarian'],
    imageUrl: 'catering/elenas-eggplant-parmesan.webp',
    badge: 'Vegetarian',
    featured: true,
    active: true
  },
  {
    id: 'cauliflower-wings-50',
    name: 'Cauliflower Wings',
    category: 'vegetarian',
    type: 'wing-alternative',
    description: 'Crispy breaded cauliflower, double-fried just like our chicken wings. Choose any 2 of our 14 signature sauces!',
    supplier: 'Restaurant Depot - Sysco Veggie',
    supplierSku: 'SYSCO-CAULI-50PC',
    storageType: 'frozen',
    leadTimeDays: 2,
    prepTimeMinutes: 35,
    teamCapability: 'fry',
    requiredEquipment: ['fryer'],
    operationalNotes: 'Fry from frozen at 350°F for 5-6 minutes, rest 2 minutes, second fry 3-4 minutes until golden. Toss in sauce immediately. SAUCE LIMIT: Customer may select up to 2 different sauces per 50-piece order (split 25/25 or keep all 50 in one sauce).',
    servingSize: '50 pieces',
    serves: '8-10 people',
    basePrice: 50.00,
    costPerUnit: 19.75,
    marginTarget: 60.5,
    availableForTiers: [1, 2, 3],
    maxDailyUnits: 15,
    allergens: ['gluten', 'soy'],
    dietaryTags: ['vegetarian'],
    preparationOptions: [
      {
        id: 'fried',
        label: 'Fried – double fry finish',
        teamCapability: 'fry',
        requiredEquipment: ['fryer'],
        prepTimeMinutes: 35,
        operationalNotes: 'Fry from frozen at 350°F for 5-6 minutes, rest 2 minutes, second fry 3-4 minutes until golden. Toss in sauce immediately. Maintain dedicated fryer oil before chicken batches.'
      },
      {
        id: 'baked',
        label: 'Baked – impinger oven finish',
        teamCapability: 'heat-only',
        requiredEquipment: ['impingerOven'],
        prepTimeMinutes: 45,
        maxDailyUnits: 8,
        operationalNotes: 'Bake from frozen on parchment-lined sheet at 425°F in impinger for 12 minutes, flip, bake additional 10-12 minutes until internal temp 165°F. Finish 2-minute broiler pass for crunch. Allow 3-minute rest on rack before saucing.'
      }
    ],
    imageUrl: 'catering/cauliflower-wings.webp',
    badge: 'Vegetarian',
    featured: true,
    active: true
  },
  {
    id: 'sally-sherman-coleslaw-quart',
    name: "Sally Sherman's Coleslaw",
    category: 'vegetarian',
    type: 'side',
    description: 'Classic creamy coleslaw with crisp cabbage and carrots. Perfect cooling side for spicy wings.',
    supplier: 'Restaurant Depot - Sally Sherman',
    supplierSku: 'SALLY-COLESLAW-QT',
    storageType: 'refrigerated',
    leadTimeDays: 1,
    prepTimeMinutes: 5,
    teamCapability: 'none',
    requiredEquipment: ['refrigeration'],
    operationalNotes: 'Keep refrigerated. Serve cold. Stir before serving.',
    servingSize: '1 quart',
    serves: '6-8 people',
    basePrice: 12.00,
    costPerUnit: 4.25,
    marginTarget: 64.6,
    availableForTiers: [1, 2, 3],
    maxDailyUnits: 20,
    allergens: ['egg', 'dairy'],
    dietaryTags: ['vegetarian', 'gluten-free'],
    imageUrl: 'catering/sally-sherman-coleslaw.webp',
    badge: 'Vegetarian',
    featured: false,
    active: true
  },

  // DESSERTS
  {
    id: 'daisys-chocolate-chip-cookies-24',
    name: "Daisy's Chocolate Chip Cookies",
    category: 'dessert',
    type: 'cookies',
    description: 'Fresh-baked chocolate chip cookies from local Northeast Philly bakery. Soft, chewy, and loaded with chips.',
    supplier: "Daisy's Bakery - Northeast Philly",
    supplierSku: 'DAISY-CHOC-CHIP-24',
    storageType: 'ambient',
    leadTimeDays: 1,
    prepTimeMinutes: 5,
    teamCapability: 'none',
    requiredEquipment: ['boxingStation'],
    operationalNotes: 'Same-day delivery required. Store at room temperature. Package in individual sleeves if available.',
    servingSize: '24 cookies',
    serves: '24 people',
    basePrice: 28.00,
    costPerUnit: 13.20,
    marginTarget: 52.9,
    availableForTiers: [1, 2, 3],
    maxDailyUnits: 25,
    allergens: ['gluten', 'egg', 'dairy', 'soy'],
    dietaryTags: ['vegetarian'],
    imageUrl: 'catering/daisys-cookies.webp',
    badge: 'Local',
    featured: true,
    active: true
  },
  {
    id: 'chefs-quality-sheet-cake-quarter',
    name: "Chef's Quality Sheet Cake",
    category: 'dessert',
    type: 'cake',
    description: 'Classic vanilla or chocolate sheet cake. Perfect for celebrations and large groups.',
    supplier: "Restaurant Depot - Chef's Quality",
    supplierSku: 'CHEFS-SHEET-QTR',
    storageType: 'frozen',
    leadTimeDays: 2,
    prepTimeMinutes: 15,
    teamCapability: 'none',
    requiredEquipment: ['refrigeration'],
    operationalNotes: 'Thaw in refrigeration 4-6 hours before service. Keep refrigerated until serving.',
    servingSize: '1/4 sheet',
    serves: '20-25 people',
    basePrice: 35.00,
    costPerUnit: 12.75,
    marginTarget: 63.6,
    availableForTiers: [2, 3],
    maxDailyUnits: 8,
    allergens: ['gluten', 'egg', 'dairy', 'soy'],
    dietaryTags: ['vegetarian'],
    imageUrl: 'catering/chefs-quality-cake.webp',
    badge: 'Premium',
    featured: false,
    active: true
  },
  {
    id: 'chef-pierre-cheesecake-bites-50',
    name: 'Chef Pierre Cheesecake Bites',
    category: 'dessert',
    type: 'cheesecake',
    description: 'Individual New York-style cheesecake bites. Rich, creamy, and perfectly portioned.',
    supplier: 'Restaurant Depot - Chef Pierre',
    supplierSku: 'PIERRE-CHEESE-BITES-50',
    storageType: 'frozen',
    leadTimeDays: 2,
    prepTimeMinutes: 10,
    teamCapability: 'none',
    requiredEquipment: ['refrigeration'],
    operationalNotes: 'Thaw in refrigeration 2-3 hours before service. Serve chilled.',
    servingSize: '50 pieces',
    serves: '50 people',
    basePrice: 45.00,
    costPerUnit: 18.25,
    marginTarget: 59.4,
    availableForTiers: [2, 3],
    maxDailyUnits: 12,
    allergens: ['gluten', 'egg', 'dairy'],
    dietaryTags: ['vegetarian'],
    imageUrl: 'catering/chef-pierre-cheesecake.webp',
    badge: 'Premium',
    featured: true,
    active: true
  }
];

/**
 * Seed catering add-ons to Firestore
 */
async function seedCateringAddOns() {
  console.log('\n🌱 Seeding catering add-ons to Firestore...\n');

  const batch = db.batch();
  let count = 0;

  for (const addOn of cateringAddOns) {
    const docRef = db.collection('cateringAddOns').doc(addOn.id);
    batch.set(docRef, {
      ...addOn,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    });
    count++;
    console.log(`✅ Prepared: ${addOn.name} (${addOn.category}, $${addOn.basePrice})`);
  }

  await batch.commit();
  console.log(`\n🎉 Successfully seeded ${count} catering add-ons!`);
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
    console.log('   - cateringAddOns (6 add-ons: 3 vegetarian, 3 desserts)');
    console.log('   - cateringAvailability (90 days)\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding catering data:', error);
    process.exit(1);
  }
}

// Run the script
main();
