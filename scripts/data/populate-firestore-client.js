// Firebase Client SDK setup for populating Firestore
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  addDoc,
  serverTimestamp,
  connectFirestoreEmulator
} from 'firebase/firestore';

// Firebase configuration from environment variables
// IMPORTANT: Never hardcode API keys or sensitive configuration
// Ensure all values are provided via environment variables
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

// Validate configuration
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error("Firebase configuration is missing required environment variables.");
  console.error("Please ensure the following environment variables are set:");
  console.error("- VITE_FIREBASE_API_KEY");
  console.error("- VITE_FIREBASE_AUTH_DOMAIN");
  console.error("- VITE_FIREBASE_PROJECT_ID");
  console.error("- VITE_FIREBASE_STORAGE_BUCKET");
  console.error("- VITE_FIREBASE_MESSAGING_SENDER_ID");
  console.error("- VITE_FIREBASE_APP_ID");
  process.exit(1);
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Check if we should use emulator
const useEmulator = process.env.USE_EMULATOR === 'true';
if (useEmulator) {
  console.log('🔧 Using Firestore Emulator at localhost:8080');
  connectFirestoreEmulator(db, 'localhost', 8080);
}

async function populateFirestore() {
  console.log('🚀 Starting Firestore population for Philly Wings...\n');

  try {
    // 1. Settings Collection
    console.log('📝 Creating settings document...');
    await setDoc(doc(db, 'settings', 'main'), {
      businessHours: {
        monday: { open: "11:00", close: "22:00" },
        tuesday: { open: "11:00", close: "22:00" },
        wednesday: { open: "11:00", close: "22:00" },
        thursday: { open: "11:00", close: "22:00" },
        friday: { open: "11:00", close: "23:00" },
        saturday: { open: "11:00", close: "23:00" },
        sunday: { open: "12:00", close: "21:00" }
      },
      deliveryPlatforms: {
        doorDash: {
          active: true,
          url: "https://www.doordash.com/store/philly-wings-express"
        },
        uberEats: {
          active: true,
          url: "https://www.ubereats.com/store/philly-wings-express"
        },
        grubHub: {
          active: true,
          url: "https://www.grubhub.com/restaurant/philly-wings-express"
        }
      },
      socialMedia: {
        instagram: "@phillywingsexpress",
        facebook: "phillywingsexpress",
        twitter: "@phillywings"
      },
      analytics: {
        orderCount: 0,
        lastHourOrders: 17
      },
      updatedAt: serverTimestamp()
    });
    console.log('✅ Settings created');

    // 2. Game Day Banners
    console.log('🏈 Creating game day banner...');
    await addDoc(collection(db, 'gameDayBanners'), {
      active: true,
      team1: "EAGLES",
      team2: "COWBOYS",
      gameDate: new Date("2025-09-14T17:00:00.000Z"),
      message: "Order your Tailgate Special now",
      specialOffer: "Free delivery on orders $30+",
      priority: 1,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log('✅ Game day banner created');

    // 3. Menu Items
    console.log('🍗 Creating menu items...');
    const menuItems = [
      {
        name: "Classic Buffalo",
        description: "The OG jawn. Crispy wings tossed in traditional buffalo sauce.",
        category: "wings",
        price: 12.99,
        heatLevel: 3,
        active: true,
        featured: true,
        sortOrder: 1,
        ingredients: ["chicken", "buffalo sauce", "butter", "cayenne"],
        allergens: ["dairy"],
        imageUrl: "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        name: "Honey Jawn Fire",
        description: "Sweet at first, then BAM! Don't say we ain't warn youse.",
        category: "wings",
        price: 13.99,
        heatLevel: 4,
        active: true,
        featured: true,
        sortOrder: 2,
        ingredients: ["chicken", "honey", "habanero", "garlic"],
        allergens: [],
        imageUrl: "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        name: "Dallas Crusher",
        description: "This jawn crushes Cowboys fans AND your taste buds.",
        category: "wings",
        price: 14.99,
        heatLevel: 5,
        active: true,
        featured: true,
        sortOrder: 3,
        ingredients: ["chicken", "ghost pepper", "carolina reaper", "special blend"],
        allergens: [],
        imageUrl: "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        name: "Gritty's Garlic Parm",
        description: "Smooth as Gritty on ice. This jawn smacks different.",
        category: "wings",
        price: 12.99,
        heatLevel: 1,
        active: true,
        featured: true,
        sortOrder: 4,
        ingredients: ["chicken", "garlic", "parmesan", "herbs"],
        allergens: ["dairy"],
        imageUrl: "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
    ];

    for (const item of menuItems) {
      await addDoc(collection(db, 'menuItems'), item);
      console.log(`  ✅ Added: ${item.name}`);
    }

    // 4. Combos
    console.log('🎯 Creating combo deal...');
    await addDoc(collection(db, 'combos'), {
      name: "The Tailgater",
      description: "20 wings, large fries, and 4 drinks. Perfect for the squad.",
      items: [
        { itemId: "wings-20", quantity: 1 },
        { itemId: "fries-large", quantity: 1 },
        { itemId: "drinks", quantity: 4 }
      ],
      originalPrice: 54.99,
      comboPrice: 44.99,
      savings: 10.00,
      active: true,
      featured: true,
      gameDay: true,
      limitedTime: false,
      sortOrder: 1,
      imageUrl: "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log('✅ Combo created');

    // 5. Reviews
    console.log('⭐ Creating reviews...');
    const reviews = [
      {
        customerName: "Chris M.",
        rating: 5,
        text: "Yo these jawns SMACK! Dallas Crusher had me sweatin' but I'd run it back.",
        platform: "DoorDash",
        featured: true,
        verified: true,
        createdAt: serverTimestamp()
      },
      {
        customerName: "Maria S.",
        rating: 5,
        text: "Crispy, juicy, perfect. My new Sunday tradition.",
        platform: "Uber Eats",
        featured: true,
        verified: true,
        createdAt: serverTimestamp()
      },
      {
        customerName: "James T.",
        rating: 5,
        text: "Forget the cheesesteaks. These wings are Philly's best kept secret.",
        platform: "Grubhub",
        featured: true,
        verified: true,
        createdAt: serverTimestamp()
      }
    ];

    for (const review of reviews) {
      await addDoc(collection(db, 'reviews'), review);
      console.log(`  ✅ Added review from: ${review.customerName}`);
    }

    // 6. Live Orders
    console.log('📦 Creating live orders...');
    const liveOrders = [
      {
        customerName: "Mike",
        neighborhood: "Fishtown",
        items: "copped The Tailgater jawn",
        timestamp: serverTimestamp(),
        display: true
      },
      {
        customerName: "Sarah",
        neighborhood: "Mayfair",
        items: "said 'lemme get that MVP Meal'",
        timestamp: serverTimestamp(),
        display: true
      },
      {
        customerName: "Tommy",
        neighborhood: "Delco",
        items: "grabbed 50 wings for the squad",
        timestamp: serverTimestamp(),
        display: true
      }
    ];

    for (const order of liveOrders) {
      await addDoc(collection(db, 'liveOrders'), order);
      console.log(`  ✅ Added order from: ${order.customerName}`);
    }

    console.log('\n🎉 Firestore population complete!');
    console.log('\n📊 Summary:');
    console.log('- Settings: 1 document');
    console.log('- Game Day Banners: 1 document');
    console.log('- Menu Items: 4 documents');
    console.log('- Combos: 1 document');
    console.log('- Reviews: 3 documents');
    console.log('- Live Orders: 3 documents');
    console.log('\n✨ Your Philly Wings Firebase is ready to go!');

  } catch (error) {
    console.error('❌ Error populating Firestore:', error);
  }

  process.exit(0);
}

// Run the population
populateFirestore();