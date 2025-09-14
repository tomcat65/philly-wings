#!/usr/bin/env node

// This script uses Firebase MCP tools through command-line to populate Firestore
const { execSync } = require('child_process');

// Helper function to execute firebase MCP commands
function executeMCPCommand(command) {
  try {
    const result = execSync(command, { encoding: 'utf8' });
    return result;
  } catch (error) {
    console.error('Error executing command:', error.message);
    return null;
  }
}

// Settings document data
const settingsData = {
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
  updatedAt: new Date().toISOString()
};

// Game Day Banner data
const gameDayBanner = {
  active: true,
  team1: "EAGLES",
  team2: "COWBOYS",
  gameDate: "2025-09-14T17:00:00.000Z",
  message: "Order your Tailgate Special now",
  specialOffer: "Free delivery on orders $30+",
  priority: 1,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// Menu Items data
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Combo data
const combo = {
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
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// Reviews data
const reviews = [
  {
    customerName: "Chris M.",
    rating: 5,
    text: "Yo these jawns SMACK! Dallas Crusher had me sweatin' but I'd run it back.",
    platform: "DoorDash",
    featured: true,
    verified: true,
    createdAt: new Date().toISOString()
  },
  {
    customerName: "Maria S.",
    rating: 5,
    text: "Crispy, juicy, perfect. My new Sunday tradition.",
    platform: "Uber Eats",
    featured: true,
    verified: true,
    createdAt: new Date().toISOString()
  },
  {
    customerName: "James T.",
    rating: 5,
    text: "Forget the cheesesteaks. These wings are Philly's best kept secret.",
    platform: "Grubhub",
    featured: true,
    verified: true,
    createdAt: new Date().toISOString()
  }
];

// Live Orders data
const liveOrders = [
  {
    customerName: "Mike",
    neighborhood: "Fishtown",
    items: "copped The Tailgater jawn",
    timestamp: new Date().toISOString(),
    display: true
  },
  {
    customerName: "Sarah",
    neighborhood: "Mayfair",
    items: "said 'lemme get that MVP Meal'",
    timestamp: new Date().toISOString(),
    display: true
  },
  {
    customerName: "Tommy",
    neighborhood: "Delco",
    items: "grabbed 50 wings for the squad",
    timestamp: new Date().toISOString(),
    display: true
  }
];

console.log('📦 Starting Firestore data setup for Philly Wings...\n');

// Log all the data that will be created
console.log('Data to be created:');
console.log('==================\n');

console.log('1. Settings Collection (1 document):');
console.log(JSON.stringify(settingsData, null, 2));
console.log('\n');

console.log('2. Game Day Banner (1 document):');
console.log(JSON.stringify(gameDayBanner, null, 2));
console.log('\n');

console.log('3. Menu Items (4 documents):');
menuItems.forEach((item, index) => {
  console.log(`   ${index + 1}. ${item.name} - $${item.price}`);
});
console.log('\n');

console.log('4. Combo Deals (1 document):');
console.log(`   - ${combo.name} - $${combo.comboPrice}`);
console.log('\n');

console.log('5. Reviews (3 documents):');
reviews.forEach((review, index) => {
  console.log(`   ${index + 1}. ${review.customerName} - ${review.rating} stars`);
});
console.log('\n');

console.log('6. Live Orders (3 documents):');
liveOrders.forEach((order, index) => {
  console.log(`   ${index + 1}. ${order.customerName} from ${order.neighborhood}`);
});
console.log('\n');

console.log('==================\n');
console.log('✅ Data structure prepared successfully!');
console.log('\nTo populate this data in Firestore, use the Firebase MCP tools or run the Firebase Admin SDK script.');
console.log('\nNext steps:');
console.log('1. Ensure you are authenticated with Firebase');
console.log('2. Use Firebase MCP tools to create these documents');
console.log('3. Or use the Firebase Console to manually add this data');