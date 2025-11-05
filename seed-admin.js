const admin = require('firebase-admin');

process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8081';

admin.initializeApp({projectId: 'philly-wings'});
const db = admin.firestore();

const sauces = [
  // DRY RUBS (sortOrder 1-4)
  {
    id: "classic-lemon-pepper",
    name: "Classic Lemon Pepper",
    category: "dry-rub",
    description: "Classic lemon pepper - zesty citrus, cracked black pepper",
    heatLevel: 1,
    active: true,
    sortOrder: 1,
    isDryRub: true,
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Flemon-pepper-dry-rub_1920x1080.webp?alt=media",
    basePrice: 0.85
  },
  {
    id: "northeast-hot-lemon",
    name: "Northeast Hot Lemon",
    category: "dry-rub",
    description: "Spicy lemon pepper with cayenne kick",
    heatLevel: 2,
    active: true,
    sortOrder: 2,
    isDryRub: true,
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Fnortheast-hot-lemon_1920x1080.webp?alt=media",
    basePrice: 0.85
  },
  {
    id: "frankford-cajun",
    name: "Frankford Cajun",
    category: "dry-rub",
    description: "Bold Cajun blend - paprika, garlic, herbs",
    heatLevel: 2,
    active: true,
    sortOrder: 3,
    isDryRub: true,
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Fcajun-dry-rub_1920x1080.webp?alt=media",
    basePrice: 0.85
  },
  {
    id: "garlic-parmesan",
    name: "Garlic Parmesan",
    category: "dry-rub",
    description: "Creamy garlic butter with aged parmesan",
    heatLevel: 0,
    active: true,
    sortOrder: 4,
    isDryRub: true,
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Fgarlic-parmesan-dry-rub_1920x1080.webp?alt=media",
    basePrice: 0.85
  },

  // SIGNATURE SAUCES (sortOrder 5-10)
  {
    id: "sweet-teriyaki",
    name: "Sweet Teriyaki",
    category: "signature-sauce",
    description: "Teriyaki glaze - soy, ginger, sesame",
    heatLevel: 0,
    active: true,
    sortOrder: 5,
    isDryRub: false,
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Fteriyaki-sauced_1920x1080.webp?alt=media",
    basePrice: 0.85
  },
  {
    id: "tailgate-bbq",
    name: "Tailgate BBQ",
    category: "signature-sauce",
    description: "Classic BBQ - sweet, tangy, smoky",
    heatLevel: 0,
    active: true,
    sortOrder: 6,
    isDryRub: false,
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Fbbq-sauced_1920x1080.webp?alt=media",
    basePrice: 0.85
  },
  {
    id: "mild-buffalo",
    name: "Mild Buffalo",
    category: "signature-sauce",
    description: "Mild buffalo - all flavor, easy heat",
    heatLevel: 1,
    active: true,
    sortOrder: 7,
    isDryRub: false,
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Fbuffalo-sauced_1920x1080.webp?alt=media",
    basePrice: 0.85
  },
  {
    id: "philly-classic-hot",
    name: "Philly Classic Hot",
    category: "signature-sauce",
    description: "Traditional hot buffalo - the perfect heat",
    heatLevel: 3,
    active: true,
    sortOrder: 8,
    isDryRub: false,
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Fphilly-classic-hot_1920x1080.webp?alt=media",
    basePrice: 0.85
  },
  {
    id: "broad-pattison-burn",
    name: "Broad & Pattison Burn",
    category: "signature-sauce",
    description: "Nashville-style hot - cayenne, brown sugar",
    heatLevel: 4,
    active: true,
    sortOrder: 9,
    isDryRub: false,
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Fbroad-pattison-burn_1920x1080.webp?alt=media",
    basePrice: 0.85
  },
  {
    id: "grittys-revenge",
    name: "Gritty's Revenge",
    category: "signature-sauce",
    description: "Scorpion pepper sauce - NOT for rookies!",
    heatLevel: 5,
    active: true,
    featured: true,
    sortOrder: 10,
    isDryRub: false,
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Fgrittys-revenge_1920x1080.webp?alt=media",
    basePrice: 0.85
  },

  // DIPPING SAUCES (sortOrder 11-14)
  {
    id: "ranch",
    name: "Ranch",
    category: "dipping-sauce",
    description: "Cool & creamy",
    heatLevel: 0,
    active: true,
    sortOrder: 11,
    isDryRub: false,
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Franch-dip_800x800.webp?alt=media",
    basePrice: 0.55
  },
  {
    id: "honey-mustard",
    name: "Honey Mustard",
    category: "dipping-sauce",
    description: "Sweet & tangy",
    heatLevel: 0,
    active: true,
    sortOrder: 12,
    isDryRub: false,
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Fhoney-mustard_800x800.webp?alt=media",
    basePrice: 0.55
  },
  {
    id: "blue-cheese",
    name: "Blue Cheese",
    category: "dipping-sauce",
    description: "Classic chunky",
    heatLevel: 0,
    active: true,
    sortOrder: 13,
    isDryRub: false,
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Fblue-cheese_800x800.webp?alt=media",
    basePrice: 0.55
  },
  {
    id: "cheese-sauce",
    name: "Cheese Sauce",
    category: "dipping-sauce",
    description: "Warm & melty",
    heatLevel: 0,
    active: true,
    sortOrder: 14,
    isDryRub: false,
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Fcheese-sauce_800x800.webp?alt=media",
    basePrice: 0.55
  }
];

async function seedSauces() {
  console.log('🌱 Seeding sauces to emulator using Admin SDK...');
  console.log(`📊 Total sauces to seed: ${sauces.length}`);

  // Clear existing sauces first
  console.log('🧹 Clearing existing sauces...');
  const existingDocs = await db.collection('sauces').get();
  const deletePromises = existingDocs.docs.map(doc => doc.ref.delete());
  await Promise.all(deletePromises);
  console.log(`✅ Cleared ${existingDocs.size} existing sauces`);

  // Add new sauces
  for (const sauce of sauces) {
    try {
      await db.collection('sauces').add(sauce);
      console.log(`✅ Added ${sauce.name} (${sauce.category})`);
    } catch (error) {
      console.error(`❌ Error adding ${sauce.name}:`, error);
    }
  }

  console.log('✅ Seeding complete!');
  console.log(`📈 Summary:`);
  console.log(`   - Dry Rubs: ${sauces.filter(s => s.isDryRub).length}`);
  console.log(`   - Signature Sauces: ${sauces.filter(s => s.category === 'signature-sauce').length}`);
  console.log(`   - Dipping Sauces: ${sauces.filter(s => s.category === 'dipping-sauce').length}`);
  console.log(`   - Total: ${sauces.length} sauces`);
  
  process.exit(0);
}

seedSauces();
