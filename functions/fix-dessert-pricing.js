const admin = require('firebase-admin');

// Initialize if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

async function fixDessertPricing() {
  console.log('Fixing dessert pricing to per-serving basis...\n');

  // Fix Marble Pound Cake
  console.log('Updating Marble Pound Cake...');
  await db.collection('desserts').doc('marble_pound_cake').update({
    'variants': [{
      id: 'pound_cake_slice',
      name: 'Marble Pound Cake Slice',
      count: 1,
      basePrice: 3.50,
      platformPricing: {
        doordash: parseFloat((3.50 * 1.35).toFixed(2)),
        ubereats: parseFloat((3.50 * 1.35).toFixed(2)),
        grubhub: parseFloat((3.50 * 1.215).toFixed(2))
      }
    }]
  });
  console.log('✓ Marble Pound Cake updated: $3.50 base → DoorDash/UberEats $4.73, GrubHub $4.25\n');

  // Fix Gourmet Brownies
  console.log('Updating Gourmet Brownies...');
  await db.collection('desserts').doc('gourmet_brownies').update({
    'variants': [{
      id: 'brownie_single',
      name: 'Gourmet Brownie',
      count: 1,
      basePrice: 4.00,
      platformPricing: {
        doordash: parseFloat((4.00 * 1.35).toFixed(2)),
        ubereats: parseFloat((4.00 * 1.35).toFixed(2)),
        grubhub: parseFloat((4.00 * 1.215).toFixed(2))
      }
    }]
  });
  console.log('✓ Gourmet Brownies updated: $4.00 base → DoorDash/UberEats $5.40, GrubHub $4.86\n');

  console.log('All dessert pricing fixed successfully!');
}

fixDessertPricing()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Error fixing dessert pricing:', err);
    process.exit(1);
  });
