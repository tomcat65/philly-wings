/**
 * Seed Catering Data Script
 * Seeds Firestore with catering packages and availability calendar
 *
 * Usage:
 *   node scripts/seed-catering-data.js           (production)
 *   node scripts/seed-catering-data.js --emulator (emulator)
 */

const admin = require('firebase-admin');

// Check if running against emulator
const useEmulator = process.argv.includes('--emulator');

// Initialize Firebase Admin
if (useEmulator) {
  process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8081';
  console.log('🧪 Using Firestore Emulator at 127.0.0.1:8081');
}

admin.initializeApp({
  projectId: 'philly-wings'
});

const db = admin.firestore();

// 6 Catering Packages (2 per tier)
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
    wingCount: 60,
    sauceSelections: 3,
    composition: {
      wings: { ref: 'menuItems/boneless-wings', quantity: 60, type: 'boneless' },
      sides: [{ ref: 'menuItems/large-fries', quantity: 3, name: 'Large Fries' }],
      addons: [{ ref: 'menuItems/mozzarella-sticks', quantity: 12, name: 'Mozzarella Sticks' }]
    },
    includes: [
      '60 wings (choice of 3 sauces)',
      '3 large fries',
      '12 mozzarella sticks',
      '15 dipping cups (ranch/blue cheese/cheese sauce)',
      'Plates, napkins, wet wipes included'
    ],
    description: 'Perfect when the team earned it. 3 sauce choices mean everyone is happy. Feeds 10-12. You are welcome.',
    marketingHook: 'Perfect for team lunches and small meetings',
    popular: true,
    imageUrl: 'catering/lunch-box-special.webp',
    active: true
  },
  {
    id: 'sampler-spread',
    name: 'The Sampler Spread',
    tier: 1,
    servesMin: 12,
    servesMax: 15,
    basePrice: 189.99,
    targetMargin: 57.5,
    wingCount: 75,
    sauceSelections: 4,
    composition: {
      wings: { ref: 'menuItems/boneless-wings', quantity: 75, type: 'boneless' },
      sides: [
        { ref: 'menuItems/large-fries', quantity: 4, name: 'Large Fries' },
        { ref: 'menuItems/loaded-fries', quantity: 2, name: 'Loaded Fries' }
      ],
      addons: [{ ref: 'menuItems/mozzarella-sticks', quantity: 16, name: 'Mozzarella Sticks' }]
    },
    includes: [
      '75 wings (choice of 4 sauces)',
      '4 large fries',
      '2 loaded fries',
      '16 mozzarella sticks',
      '20 dipping cups',
      'Full serving setup included'
    ],
    description: 'When 3 sauces is not enough. 4 sauces, more sides, more options. Slightly larger crew? This is your move.',
    marketingHook: 'Great for lunch meetings and work celebrations',
    popular: false,
    imageUrl: 'catering/sampler-spread.webp',
    active: true
  },

  // TIER 2: Party Packages (20-35 people)
  {
    id: 'game-day-feast',
    name: 'The Game Day Feast',
    tier: 2,
    servesMin: 20,
    servesMax: 25,
    basePrice: 349.99,
    targetMargin: 57.5,
    wingCount: 150,
    sauceSelections: 5,
    composition: {
      wings: { ref: 'menuItems/boneless-wings', quantity: 150, type: 'boneless' },
      sides: [
        { ref: 'menuItems/large-fries', quantity: 6, name: 'Large Fries' },
        { ref: 'menuItems/loaded-fries', quantity: 4, name: 'Loaded Fries' }
      ],
      addons: [{ ref: 'menuItems/mozzarella-sticks', quantity: 24, name: 'Mozzarella Sticks' }]
    },
    includes: [
      '150 wings (choice of 5 sauces)',
      '6 large fries',
      '4 loaded fries',
      '24 mozzarella sticks',
      '35 dipping cups',
      'Chafing setup for warm serving',
      'Full serving supplies'
    ],
    description: 'Named for Broad & Pattison. Eagles. Phillies. Sixers. Flyers. This feeds 20-25 people who came to watch Philly win.',
    marketingHook: 'Perfect for game day parties and celebrations',
    popular: true,
    imageUrl: 'catering/game-day-feast.webp',
    active: true
  },
  {
    id: 'party-platter',
    name: 'The Party Platter',
    tier: 2,
    servesMin: 30,
    servesMax: 35,
    basePrice: 499.99,
    targetMargin: 57.5,
    wingCount: 200,
    sauceSelections: 6,
    composition: {
      wings: { ref: 'menuItems/boneless-wings', quantity: 200, type: 'boneless' },
      sides: [
        { ref: 'menuItems/large-fries', quantity: 8, name: 'Large Fries' },
        { ref: 'menuItems/loaded-fries', quantity: 6, name: 'Loaded Fries' }
      ],
      addons: [{ ref: 'menuItems/mozzarella-sticks', quantity: 32, name: 'Mozzarella Sticks' }]
    },
    includes: [
      '200 wings (choice of 6 sauces)',
      '8 large fries',
      '6 loaded ffries',
      '32 mozzarella sticks',
      '45 dipping cups',
      'Professional chafing setup',
      'Complete serving supplies and labels'
    ],
    description: '200 wings. 6 sauce choices. Feeds 30-35. This is when you mean business. Birthday party? Office celebration? This handles it.',
    marketingHook: 'Ideal for large gatherings and celebrations',
    popular: false,
    imageUrl: 'catering/party-platter.webp',
    active: true
  },

  // TIER 3: Large Event Packages (50-100 people)
  {
    id: 'office-celebration',
    name: 'The Office Celebration',
    tier: 3,
    servesMin: 50,
    servesMax: 60,
    basePrice: 849.99,
    targetMargin: 57.5,
    wingCount: 350,
    sauceSelections: 8,
    composition: {
      wings: { ref: 'menuItems/boneless-wings', quantity: 350, type: 'boneless' },
      sides: [
        { ref: 'menuItems/large-fries', quantity: 14, name: 'Large Fries' },
        { ref: 'menuItems/loaded-fries', quantity: 10, name: 'Loaded Fries' }
      ],
      addons: [{ ref: 'menuItems/mozzarella-sticks', quantity: 60, name: 'Mozzarella Sticks' }]
    },
    includes: [
      '350 wings (choice of 8 sauces)',
      '14 large fries',
      '10 loaded fries',
      '60 mozzarella sticks',
      '70 dipping cups',
      'Full professional setup with warmers',
      'Serving utensils and labeled containers',
      'Setup instructions'
    ],
    description: 'Company milestone? Team appreciation? 350 wings with 8 sauce choices feeds 50-60 people properly. This is the big show.',
    marketingHook: 'Perfect for corporate events and large celebrations',
    popular: false,
    imageUrl: 'catering/office-celebration.webp',
    active: true
  },
  {
    id: 'championship-spread',
    name: 'The Championship Spread',
    tier: 3,
    servesMin: 80,
    servesMax: 100,
    basePrice: 1299.99,
    targetMargin: 57.5,
    wingCount: 550,
    sauceSelections: 10,
    composition: {
      wings: { ref: 'menuItems/boneless-wings', quantity: 550, type: 'boneless' },
      sides: [
        { ref: 'menuItems/large-fries', quantity: 22, name: 'Large Fries' },
        { ref: 'menuItems/loaded-fries', quantity: 16, name: 'Loaded Fries' }
      ],
      addons: [{ ref: 'menuItems/mozzarella-sticks', quantity: 100, name: 'Mozzarella Sticks' }]
    },
    includes: [
      '550 wings (choice of 10 sauces)',
      '22 large fries',
      '16 loaded fries',
      '100 mozzarella sticks',
      '110 dipping cups',
      'Complete professional catering setup',
      'Labeled warmers and serving stations',
      'Setup and breakdown assistance available'
    ],
    description: 'The biggest. 550 wings, 10 sauce choices, feeds 80-100 people. When the whole company shows up. Eagles championship party level.',
    marketingHook: 'Ultimate package for major events and large gatherings',
    popular: false,
    imageUrl: 'catering/championship-spread.webp',
    active: true
  }
];

// Seed packages
async function seedPackages() {
  console.log('🌱 Seeding catering packages to Firestore...\n');

  const batch = db.batch();

  for (const pkg of cateringPackages) {
    const { id, ...data } = pkg;
    const docRef = db.collection('cateringPackages').doc(id);
    batch.set(docRef, data);
    console.log(`✅ Prepared: ${data.name} (Tier ${data.tier}, serves ${data.servesMin}-${data.servesMax})`);
  }

  await batch.commit();
  console.log(`\n🎉 Successfully seeded ${cateringPackages.length} catering packages!\n`);
}

// Initialize availability calendar (90 days)
async function seedAvailability() {
  console.log('📅 Initializing catering availability for next 90 days...\n');

  const batch = db.batch();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 90; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);

    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD

    const docRef = db.collection('cateringAvailability').doc(dateStr);
    batch.set(docRef, {
      date: dateStr,
      dateTimestamp: admin.firestore.Timestamp.fromDate(date),
      maxDailyCapacity: 1000, // Max wings per day
      maxOrdersPerDay: 8,      // Max orders per day
      totalWingsOrdered: 0,
      ordersCount: 0,
      orders: [],
      available: true,
      notes: '',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    if (i % 15 === 0) {
      console.log(`✅ Initialized: ${dateStr}`);
    }
  }

  await batch.commit();
  console.log(`\n🎉 Successfully initialized 90 days of availability!\n`);
}

// Main execution
async function main() {
  try {
    await seedPackages();
    await seedAvailability();

    console.log('✨ Catering data seeding complete!');
    console.log('\n📊 Summary:');
    console.log(`   - 6 catering packages (2 per tier)`);
    console.log(`   - 90 days of availability calendar`);
    console.log(`   - Firestore: ${useEmulator ? 'EMULATOR' : 'PRODUCTION'}`);

    if (useEmulator) {
      console.log('\n🔗 View data at: http://127.0.0.1:4002/firestore');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

main();
