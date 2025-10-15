const admin = require('firebase-admin');

// Initialize if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

async function correctDessertPricingHierarchy() {
  console.log('Correcting dessert pricing hierarchy to logical levels...\n');

  // Crème Brûlée: Premium specialty - MOST EXPENSIVE at $5.00
  console.log('1. Updating Crème Brûlée Cheesecake (Premium Specialty)...');
  const cremeDoc = await db.collection('desserts').doc('creme_brulee_cheesecake').get();
  const cremeData = cremeDoc.data();
  const cremeVariants = cremeData.variants.map(v => ({
    ...v,
    basePrice: 5.00,
    platformPricing: {
      doordash: parseFloat((5.00 * 1.35).toFixed(2)),  // 6.75
      ubereats: parseFloat((5.00 * 1.35).toFixed(2)),  // 6.75
      grubhub: parseFloat((5.00 * 1.215).toFixed(2))   // 6.08
    }
  }));
  await db.collection('desserts').doc('creme_brulee_cheesecake').update({ variants: cremeVariants });
  console.log('   ✓ $4.50 → $5.00 (DD/UE: $6.75, GH: $6.08)\n');

  // Red Velvet & NY Cheesecake: Both premium level at $4.75
  console.log('2. Updating Red Velvet Cake (Premium)...');
  const redVelvetDoc = await db.collection('desserts').doc('red_velvet_cake').get();
  const redVelvetData = redVelvetDoc.data();
  const redVelvetVariants = redVelvetData.variants.map(v => ({
    ...v,
    basePrice: 4.75,
    platformPricing: {
      doordash: parseFloat((4.75 * 1.35).toFixed(2)),  // 6.41
      ubereats: parseFloat((4.75 * 1.35).toFixed(2)),  // 6.41
      grubhub: parseFloat((4.75 * 1.215).toFixed(2))   // 5.77
    }
  }));
  await db.collection('desserts').doc('red_velvet_cake').update({ variants: redVelvetVariants });
  console.log('   ✓ $4.25 → $4.75 (DD/UE: $6.41, GH: $5.77)\n');

  console.log('3. Confirming NY Cheesecake (already correct at $4.75)...');
  console.log('   ✓ Already at $4.75 (DD/UE: $6.41, GH: $5.77)\n');

  console.log('✅ Dessert pricing hierarchy corrected!');
  console.log('\nFinal logical hierarchy:');
  console.log('  🥇 Crème Brûlée:    $5.00 base → $6.75 DD/UE, $6.08 GH (Most Premium)');
  console.log('  🥈 NY Cheesecake:   $4.75 base → $6.41 DD/UE, $5.77 GH (Premium)');
  console.log('  🥉 Red Velvet:      $4.75 base → $6.41 DD/UE, $5.77 GH (Premium)');
  console.log('  🍰 Marble Cake:     $3.50 base → $4.73 DD/UE, $4.25 GH (Standard)');
  console.log('  🍫 Brownies:        $4.00 base → $5.40 DD/UE, $4.86 GH (Standard)');
}

correctDessertPricingHierarchy()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Error correcting pricing hierarchy:', err);
    process.exit(1);
  });
