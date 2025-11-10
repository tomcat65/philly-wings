const admin = require('firebase-admin');

// Connect to emulator
process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8081';
admin.initializeApp({ projectId: 'philly-wings' });
const db = admin.firestore();

const sauces = [
  // Signature Sauces (for wings)
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
  
  // Dipping Sauces (SP-009 requirements)
  {
    id: "ranch",
    name: "Ranch",
    category: "dipping-sauce",
    description: "Classic creamy ranch dipping sauce",
    heatLevel: 0,
    active: true,
    sortOrder: 10,
    isDryRub: false,
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Franch-dip_1920x1080.webp?alt=media",
    basePrice: 0.75
  },
  {
    id: "blue-cheese",
    name: "Blue Cheese",
    category: "dipping-sauce",
    description: "Tangy blue cheese dipping sauce",
    heatLevel: 0,
    active: true,
    sortOrder: 11,
    isDryRub: false,
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Fblue-cheese_1920x1080.webp?alt=media",
    basePrice: 0.75
  },
  {
    id: "honey-mustard",
    name: "Honey Mustard",
    category: "dipping-sauce",
    description: "Sweet honey mustard dipping sauce",
    heatLevel: 0,
    active: true,
    sortOrder: 12,
    isDryRub: false,
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Fhoney-mustard_1920x1080.webp?alt=media",
    basePrice: 0.75
  }
];

async function seed() {
  console.log('🌱 Seeding complete sauce data with images...\n');
  
  let signatureCount = 0;
  let dryRubCount = 0;
  let dipCount = 0;
  
  for (const sauce of sauces) {
    await db.collection('sauces').doc(sauce.id).set(sauce);
    
    if (sauce.category === 'signature-sauce') signatureCount++;
    else if (sauce.category === 'dry-rub') dryRubCount++;
    else if (sauce.category === 'dipping-sauce') dipCount++;
    
    console.log(`  ✅ ${sauce.name} (${sauce.category})`);
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`   - ${signatureCount} signature sauces`);
  console.log(`   - ${dryRubCount} dry rub`);
  console.log(`   - ${dipCount} dipping sauces`);
  console.log(`   - All with imageUrl fields`);
  console.log('\n✅ Complete! Emulator ready for testing.');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
