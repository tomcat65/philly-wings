/**
 * Seed Catering Add-Ons v2 - Lightweight Reference Schema
 * Run with: node scripts/seed-catering-addons-v2.js
 * Or for emulator: node scripts/seed-catering-addons-v2.js --emulator
 *
 * This seeds 18 add-ons with the new lightweight reference schema:
 * - 10 desserts (5 individual + 5 five-packs)
 * - 2 beverages (96oz + 3gal boxed tea)
 * - 2 salads (family size)
 * - 2 sides (family size)
 * - 2 quick-adds (5pack water + chips)
 *
 * Hot beverages (4 items) are NOT included - they're catering-exclusive
 * and already exist with their own schema.
 */

const admin = require('firebase-admin');
const path = require('path');

// Parse command line args
const useEmulator = process.argv.includes('--emulator');

// Initialize Firebase Admin
if (useEmulator) {
  console.log('🧪 Using Firestore Emulator');
  process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8081';
  admin.initializeApp({ projectId: 'philly-wings' });
} else {
  const serviceAccountPath = '/home/tomcat65/projects/docs/Phillywingsexpress/philly-wings-firebase-adminsdk-fbsvc-b9a46d307f.json';
  admin.initializeApp({
    credential: admin.credential.cert(require(serviceAccountPath))
  });
}

const db = admin.firestore();
const timestamp = new Date().toISOString();

/**
 * Catering Add-Ons with Lightweight Reference Schema
 */
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
    sourceVariantId: 'chips_single',
    name: "Miss Vickie's Chips (5-Pack)",
    basePrice: 7.50,
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

async function seedCateringAddOns() {
  console.log('\n🌱 Seeding Catering Add-Ons v2 (Lightweight Reference Schema)...\n');

  let successCount = 0;
  let errorCount = 0;

  for (const addOn of cateringAddOns) {
    try {
      await db.collection('cateringAddOns').doc(addOn.id).set(addOn);
      console.log(`   ✅ ${addOn.name} (${addOn.packSize})`);
      successCount++;
    } catch (error) {
      console.error(`   ❌ Error seeding ${addOn.id}:`, error.message);
      errorCount++;
    }
  }

  console.log(`\n📊 Seeding Complete:`);
  console.log(`   ✅ Success: ${successCount} items`);
  console.log(`   ❌ Errors: ${errorCount} items`);
  console.log(`\n📋 Summary:`);
  console.log(`   - 10 desserts (5 individual + 5 five-packs)`);
  console.log(`   - 2 beverages (96oz + 3gal boxed tea)`);
  console.log(`   - 2 salads (family size)`);
  console.log(`   - 2 sides (family size)`);
  console.log(`   - 2 quick-adds (5pack water + chips)`);
  console.log(`\n⚠️  Note: Hot beverages (4 items) are NOT seeded by this script.`);
  console.log(`   They're catering-exclusive and use a different schema.\n`);
}

seedCateringAddOns()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
