const admin = require('firebase-admin');

// Initialize if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

async function updateDessertPrices() {
  console.log('Updating dessert prices to Richard\'s authorized amounts...\n');

  // Red Velvet Cake: $3.50 → $4.25
  console.log('1. Updating Red Velvet Cake...');
  const redVelvetDoc = await db.collection('desserts').doc('red_velvet_cake').get();
  const redVelvetData = redVelvetDoc.data();
  const redVelvetVariants = redVelvetData.variants.map(v => ({
    ...v,
    basePrice: 4.25,
    platformPricing: {
      doordash: parseFloat((4.25 * 1.35).toFixed(2)),  // 5.74
      ubereats: parseFloat((4.25 * 1.35).toFixed(2)),  // 5.74
      grubhub: parseFloat((4.25 * 1.215).toFixed(2))   // 5.16
    }
  }));
  await db.collection('desserts').doc('red_velvet_cake').update({ variants: redVelvetVariants });
  console.log('   ✓ $3.50 → $4.25 (DD/UE: $5.74, GH: $5.16)\n');

  // Crème Brûlée Cheesecake: $3.50 → $4.50
  console.log('2. Updating Crème Brûlée Cheesecake...');
  const cremeDoc = await db.collection('desserts').doc('creme_brulee_cheesecake').get();
  const cremeData = cremeDoc.data();
  const cremeVariants = cremeData.variants.map(v => ({
    ...v,
    basePrice: 4.50,
    platformPricing: {
      doordash: parseFloat((4.50 * 1.35).toFixed(2)),  // 6.08
      ubereats: parseFloat((4.50 * 1.35).toFixed(2)),  // 6.08
      grubhub: parseFloat((4.50 * 1.215).toFixed(2))   // 5.47
    }
  }));
  await db.collection('desserts').doc('creme_brulee_cheesecake').update({ variants: cremeVariants });
  console.log('   ✓ $3.50 → $4.50 (DD/UE: $6.08, GH: $5.47)\n');

  // NY Cheesecake: $4.00 → $4.75
  console.log('3. Updating NY Cheesecake...');
  const nyDoc = await db.collection('desserts').doc('ny_cheesecake').get();
  const nyData = nyDoc.data();
  const nyVariants = nyData.variants.map(v => ({
    ...v,
    basePrice: 4.75,
    platformPricing: {
      doordash: parseFloat((4.75 * 1.35).toFixed(2)),  // 6.41
      ubereats: parseFloat((4.75 * 1.35).toFixed(2)),  // 6.41
      grubhub: parseFloat((4.75 * 1.215).toFixed(2))   // 5.77
    }
  }));
  await db.collection('desserts').doc('ny_cheesecake').update({ variants: nyVariants });
  console.log('   ✓ $4.00 → $4.75 (DD/UE: $6.41, GH: $5.77)\n');

  console.log('✅ All dessert prices updated to Richard\'s authorized amounts!');
  console.log('\nMarble Pound Cake ($3.50) and Gourmet Brownies ($4.00) unchanged - already correct.');
}

updateDessertPrices()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Error updating prices:', err);
    process.exit(1);
  });
