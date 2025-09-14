const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, addDoc, collection, connectFirestoreEmulator } = require('firebase/firestore');
const fs = require('fs');

// Firebase configuration - you need to set your actual config values as environment variables
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "your-api-key",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "philly-wings.firebaseapp.com",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "philly-wings",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "philly-wings.firebasestorage.app",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.VITE_FIREBASE_APP_ID || "your-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function populateProductionFirestore() {
  try {
    console.log('Starting Production Firestore population...');

    // 1. Settings collection
    const settingsData = JSON.parse(fs.readFileSync('./settings-data.json', 'utf8'));
    await setDoc(doc(db, 'settings', 'main'), settingsData);
    console.log('✅ Settings document created');

    // 2. Game Day Banners collection
    const gameDayData = JSON.parse(fs.readFileSync('./game-day-banner-data.json', 'utf8'));
    await addDoc(collection(db, 'gameDayBanners'), gameDayData);
    console.log('✅ Game day banner document created');

    // 3. Menu Items collection
    const menuItemsData = JSON.parse(fs.readFileSync('./menu-items-data.json', 'utf8'));
    const menuItemIds = ['classic-buffalo', 'honey-jawn-fire', 'dallas-crusher', 'grittys-garlic-parm'];
    for (let i = 0; i < menuItemsData.length; i++) {
      const { id, ...itemData } = menuItemsData[i];
      await setDoc(doc(db, 'menuItems', menuItemIds[i]), itemData);
    }
    console.log('✅ Menu items documents created');

    // 4. Combos collection
    const combosData = JSON.parse(fs.readFileSync('./combos-data.json', 'utf8'));
    const { id: comboId, ...comboData } = combosData;
    await setDoc(doc(db, 'combos', comboId), comboData);
    console.log('✅ Combos document created');

    // 5. Reviews collection
    const reviewsData = JSON.parse(fs.readFileSync('./reviews-data.json', 'utf8'));
    const reviewIds = ['review-1', 'review-2', 'review-3'];
    for (let i = 0; i < reviewsData.length; i++) {
      const { id, ...reviewData } = reviewsData[i];
      await setDoc(doc(db, 'reviews', reviewIds[i]), reviewData);
    }
    console.log('✅ Reviews documents created');

    // 6. Live Orders collection
    const liveOrdersData = JSON.parse(fs.readFileSync('./live-orders-data.json', 'utf8'));
    const orderIds = ['order-1', 'order-2', 'order-3'];
    for (let i = 0; i < liveOrdersData.length; i++) {
      const { id, ...orderData } = liveOrdersData[i];
      await setDoc(doc(db, 'liveOrders', orderIds[i]), orderData);
    }
    console.log('✅ Live orders documents created');

    console.log('🎉 All Production Firestore documents created successfully!');

  } catch (error) {
    console.error('❌ Error populating Production Firestore:', error.message);
    console.error('Full error:', error);
  }
}

populateProductionFirestore();