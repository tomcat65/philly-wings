const admin = require('firebase-admin');

// Initialize if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

async function fixDessertServings() {
  console.log('Fixing Marble Pound Cake and Gourmet Brownies to individual servings...\n');

  // Marble Pound Cake: Change from 12-pack wholesale to individual slice
  console.log('1. Updating Marble Pound Cake...');
  await db.collection('desserts').doc('marble_pound_cake').update({
    variants: [{
      id: 'pound_cake_slice',
      name: 'Marble Pound Cake',
      count: 1,
      basePrice: 3.50,
      platformPricing: {
        doordash: parseFloat((3.50 * 1.35).toFixed(2)),  // 4.73
        ubereats: parseFloat((3.50 * 1.35).toFixed(2)),  // 4.73
        grubhub: parseFloat((3.50 * 1.215).toFixed(2))   // 4.25
      }
    }]
  });
  console.log('   ✓ Changed from 12-pack ($1.46) to individual slice ($3.50)');
  console.log('   ✓ DoorDash/UberEats: $4.73, GrubHub: $4.25\n');

  // Gourmet Brownies: Change from 12-pack wholesale to individual piece
  console.log('2. Updating Gourmet Brownies...');
  await db.collection('desserts').doc('gourmet_brownies').update({
    variants: [{
      id: 'brownie_single',
      name: 'Gourmet Brownie',
      count: 1,
      basePrice: 4.00,
      platformPricing: {
        doordash: parseFloat((4.00 * 1.35).toFixed(2)),  // 5.40
        ubereats: parseFloat((4.00 * 1.35).toFixed(2)),  // 5.40
        grubhub: parseFloat((4.00 * 1.215).toFixed(2))   // 4.86
      }
    }]
  });
  console.log('   ✓ Changed from 12-pack to individual brownie ($4.00)');
  console.log('   ✓ DoorDash/UberEats: $5.40, GrubHub: $4.86\n');

  console.log('✅ Both desserts now show as individual servings with correct pricing!');
}

fixDessertServings()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
