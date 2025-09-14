const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, serverTimestamp } = require('firebase/firestore');
require('dotenv').config();

// Get project ID from environment variables
const projectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID;

if (!projectId) {
  console.error('Error: FIREBASE_PROJECT_ID or VITE_FIREBASE_PROJECT_ID environment variable is not set.');
  console.error('Please create a .env file with your Firebase configuration.');
  process.exit(1);
}

// Firebase configuration
const firebaseConfig = {
  projectId: projectId
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function setupSettings() {
  try {
    // Create settings document with ID "main"
    const settingsRef = doc(db, 'settings', 'main');

    await setDoc(settingsRef, {
      businessHours: {
        monday: { open: "10:30am", close: "07:15pm" },
        tuesday: { open: "10:30am", close: "07:15pm" },
        wednesday: { open: "10:30am", close: "07:15pm" },
        thursday: { open: "10:30am", close: "07:15pm" },
        friday: { open: "09:30am", close: "08:15pm" },
        saturday: { open: "09:30am", close: "08:15pm" },
        sunday: { open: "10:30am", close: "06:15pm" }
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
        tiktok: "@phillywings"
      },
      analytics: {
        orderCount: 0,
        lastHourOrders: 17
      },
      updatedAt: serverTimestamp()
    });

    console.log('✅ Settings document created with ID "main"');
  } catch (error) {
    console.error('Error:', error);
  }

  process.exit(0);
}

setupSettings();