const admin = require('firebase-admin');

// Connect to emulator
process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8081';
admin.initializeApp({ projectId: 'philly-wings' });
const db = admin.firestore();

const sauces = [
  {
    id: "mild-buffalo", name: "Mild Buffalo", category: "signature-sauce", 
    heatLevel: 1, active: true, sortOrder: 7, isDryRub: false, basePrice: 0.85
  },
  {
    id: "philly-classic-hot", name: "Philly Classic Hot", category: "signature-sauce",
    heatLevel: 3, active: true, sortOrder: 8, isDryRub: false, basePrice: 0.85
  },
  {
    id: "sweet-teriyaki", name: "Sweet Teriyaki", category: "signature-sauce",
    heatLevel: 0, active: true, sortOrder: 5, isDryRub: false, basePrice: 0.85
  },
  {
    id: "tailgate-bbq", name: "Tailgate BBQ", category: "signature-sauce",
    heatLevel: 0, active: true, sortOrder: 6, isDryRub: false, basePrice: 0.85
  },
  {
    id: "classic-lemon-pepper", name: "Classic Lemon Pepper", category: "dry-rub",
    heatLevel: 1, active: true, sortOrder: 1, isDryRub: true, basePrice: 0.85
  },
  {
    id: "ranch", name: "Ranch", category: "dipping-sauce",
    heatLevel: 0, active: true, sortOrder: 10, isDryRub: false, basePrice: 0.75
  },
  {
    id: "blue-cheese", name: "Blue Cheese", category: "dipping-sauce",
    heatLevel: 0, active: true, sortOrder: 11, isDryRub: false, basePrice: 0.75
  },
  {
    id: "honey-mustard", name: "Honey Mustard", category: "dipping-sauce",
    heatLevel: 0, active: true, sortOrder: 12, isDryRub: false, basePrice: 0.75
  },
  {
    id: "bbq-dip", name: "BBQ Sauce", category: "dipping-sauce",
    heatLevel: 0, active: true, sortOrder: 13, isDryRub: false, basePrice: 0.75
  }
];

async function seed() {
  console.log('🌱 Seeding complete emulator data...\n');
  
  // Seed sauces
  console.log('📝 Seeding sauces...');
  for (const sauce of sauces) {
    await db.collection('sauces').doc(sauce.id).set(sauce);
    console.log(`  ✅ ${sauce.name}`);
  }
  
  console.log('\n✅ Complete! Emulator ready for testing.');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
