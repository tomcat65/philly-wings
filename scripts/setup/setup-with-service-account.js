const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Get project ID from environment variables
const projectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID;

if (!projectId) {
  console.error('Error: FIREBASE_PROJECT_ID or VITE_FIREBASE_PROJECT_ID environment variable is not set.');
  console.error('Please create a .env file with your Firebase configuration.');
  process.exit(1);
}

// Initialize Firebase Admin with service account
let appConfig = { projectId: projectId };

// Check for service account key in environment variable or file
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || './service-account.json';
if (!fs.existsSync(serviceAccountPath)) {
  console.error('Error: Service account key file not found at:', serviceAccountPath);
  console.error('Please ensure you have a service account key file and set GOOGLE_APPLICATION_CREDENTIALS environment variable.');
  console.error('Or place the service account key file at ./service-account.json');
  process.exit(1);
}

try {
  const serviceAccount = require(path.resolve(serviceAccountPath));
  appConfig.credential = cert(serviceAccount);
  console.log('Using service account credentials from:', serviceAccountPath);
} catch (error) {
  console.error('Error loading service account key:', error.message);
  process.exit(1);
}

const app = initializeApp(appConfig);

const db = getFirestore();

async function createMainSettings() {
  try {
    console.log('Creating settings document with ID "main"...');

    // Reference to the specific document with ID "main"
    const docRef = db.collection('settings').doc('main');

    // Set the document data
    await docRef.set({
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
      updatedAt: FieldValue.serverTimestamp()
    });

    console.log('✅ Successfully created settings document with ID "main"');
    console.log('Document path: settings/main');

  } catch (error) {
    console.error('Error:', error);
  }

  process.exit();
}

createMainSettings();