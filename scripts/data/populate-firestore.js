const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
require('dotenv').config();

// Get project ID from environment variables
const projectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID;

if (!projectId) {
  console.error('Error: FIREBASE_PROJECT_ID or VITE_FIREBASE_PROJECT_ID environment variable is not set.');
  console.error('Please create a .env file with your Firebase configuration.');
  console.error('Example: FIREBASE_PROJECT_ID=your-project-id');
  process.exit(1);
}

// Initialize Firebase Admin with project ID from environment
const app = initializeApp({
  projectId: projectId,
});

const db = getFirestore();

async function populateFirestore() {
  console.log('🚀 Starting Firestore population for Philly Wings...\n');

  try {
    // 1. Settings Collection
    console.log('📝 Creating settings document...');
    await db.collection('settings').doc('main').set({
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
      updatedAt: FieldValue.serverTimestamp()
    });
    console.log('✅ Settings created');

    // 2. Game Day Banners
    console.log('🏈 Creating game day banner...');
    await db.collection('gameDayBanners').add({
      active: true,
      team1: "EAGLES",
      team2: "COWBOYS",
      gameDate: new Date("2025-09-14T17:00:00.000Z"),
      message: "Order your Tailgate Special now",
      specialOffer: "Free delivery on orders $30+",
      priority: 1,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
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
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
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
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
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
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
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
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      }
    ];

    for (const item of menuItems) {
      await db.collection('menuItems').add(item);
      console.log(`  ✅ Added: ${item.name}`);
    }

    // 4. Combos
    console.log('🎯 Creating combo deal...');
    await db.collection('combos').add({
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
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
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
        createdAt: FieldValue.serverTimestamp()
      },
      {
        customerName: "Maria S.",
        rating: 5,
        text: "Crispy, juicy, perfect. My new Sunday tradition.",
        platform: "Uber Eats",
        featured: true,
        verified: true,
        createdAt: FieldValue.serverTimestamp()
      },
      {
        customerName: "James T.",
        rating: 5,
        text: "Forget the cheesesteaks. These wings are Philly's best kept secret.",
        platform: "Grubhub",
        featured: true,
        verified: true,
        createdAt: FieldValue.serverTimestamp()
      }
    ];

    for (const review of reviews) {
      await db.collection('reviews').add(review);
      console.log(`  ✅ Added review from: ${review.customerName}`);
    }

    // 6. Live Orders
    console.log('📦 Creating live orders...');
    const liveOrders = [
      {
        customerName: "Mike",
        neighborhood: "Fishtown",
        items: "copped The Tailgater jawn",
        timestamp: FieldValue.serverTimestamp(),
        display: true
      },
      {
        customerName: "Sarah",
        neighborhood: "Mayfair",
        items: "said 'lemme get that MVP Meal'",
        timestamp: FieldValue.serverTimestamp(),
        display: true
      },
      {
        customerName: "Tommy",
        neighborhood: "Delco",
        items: "grabbed 50 wings for the squad",
        timestamp: FieldValue.serverTimestamp(),
        display: true
      }
    ];

    for (const order of liveOrders) {
      await db.collection('liveOrders').add(order);
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
    console.error('❌ Error populating Firestore:', error.message);
    console.log('\n💡 Make sure you have the proper authentication set up.');
    console.log('You may need to:');
    console.log('1. Set GOOGLE_APPLICATION_CREDENTIALS environment variable');
    console.log('2. Or run: gcloud auth application-default login');
    console.log('3. Or use a service account key file');
  }

  process.exit(0);
}

// Run the population
populateFirestore();