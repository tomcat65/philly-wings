const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

async function fixDesserts() {
  console.log('Fixing Marble Pound Cake...');
  await db.collection('desserts').doc('marble_pound_cake').update({
    'variants.0.basePrice': 3.50,
    'variants.0.platformPricing': {
      doordash: 4.73,
      ubereats: 4.73,
      grubhub: 4.25
    }
  });
  console.log('✅ Marble Pound Cake updated');

  console.log('Fixing Gourmet Brownies...');
  await db.collection('desserts').doc('gourmet_brownies').update({
    'variants.0.basePrice': 4.00,
    'variants.0.platformPricing': {
      doordash: 5.40,
      ubereats: 5.40,
      grubhub: 4.86
    }
  });
  console.log('✅ Gourmet Brownies updated');

  console.log('\n✅ All dessert prices fixed!');
  process.exit(0);
}

fixDesserts().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
