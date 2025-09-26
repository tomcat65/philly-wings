const admin = require('firebase-admin');

// Initialize admin if not already done
let db;
try {
  if (!admin.apps.length) {
    admin.initializeApp();
  }
  db = admin.firestore();
} catch (e) {
  db = admin.firestore();
}

/**
 * Fetch complete menu data from Firestore
 * @returns {Promise<Object>} Complete menu data with all collections
 */
async function fetchCompleteMenu() {
  console.log('> Fetching menu data from Firestore...');

  const [combosSnapshot, wingsSnapshot, friesSnapshot, mozzarellaSnapshot, drinksSnapshot, saucesSnapshot, settingsSnapshot] = await Promise.all([
    db.collection('combos').get(),
    db.collection('menuItems').where('category', '==', 'wings').get(),
    db.collection('menuItems').where('category', '==', 'fries').get(),
    db.collection('menuItems').where('category', '==', 'mozzarella-sticks').get(),
    db.collection('beverages').get(),
    db.collection('sauces').get(),
    db.collection('settings').doc('general').get()
  ]);

  // Process data
  const combos = combosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  const wings = wingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  const fries = friesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  const mozzarella = mozzarellaSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  const drinks = drinksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  const sauces = saucesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  const settings = settingsSnapshot.exists ? settingsSnapshot.data() : {};

  return {
    combos,
    wings,
    sides: { fries, mozzarella },
    beverages: drinks,
    sauces,
    settings
  };
}

/**
 * Save published menu metadata to Firestore
 * @param {Object} metadata Menu publication metadata
 * @returns {Promise<string>} Document ID
 */
async function saveMenuMetadata(metadata) {
  const docRef = await db.collection('publishedMenus').add({
    ...metadata,
    publishedAt: admin.firestore.FieldValue.serverTimestamp()
  });
  return docRef.id;
}

module.exports = {
  db,
  fetchCompleteMenu,
  saveMenuMetadata
};