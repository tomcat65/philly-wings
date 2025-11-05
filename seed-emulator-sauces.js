import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator, collection, addDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "demo-key",
  projectId: "philly-wings",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
connectFirestoreEmulator(db, '127.0.0.1', 8081);

const sauces = [
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
    id: "honey-mustard",
    name: "Honey Mustard",
    category: "dipping-sauce",
    description: "Sweet honey mustard dipping sauce",
    heatLevel: 0,
    active: true,
    sortOrder: 12,
    isDryRub: false,
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Fhoney-mustard-dip_1920x1080.webp?alt=media",
    basePrice: 0.75
  }
];

async function seedSauces() {
  console.log('🌱 Seeding sauces to emulator...');

  for (const sauce of sauces) {
    try {
      const docRef = await addDoc(collection(db, 'sauces'), sauce);
      console.log(`✅ Added ${sauce.name} with ID: ${docRef.id}`);
    } catch (error) {
      console.error(`❌ Error adding ${sauce.name}:`, error);
    }
  }

  console.log('✅ Seeding complete!');
  process.exit(0);
}

seedSauces();
