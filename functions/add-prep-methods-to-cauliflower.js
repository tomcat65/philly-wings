const admin = require('firebase-admin');

// Initialize if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

async function addPrepMethodsToCauliflower() {
  console.log('Adding prepMethod field to cauliflower wing variants...\n');

  const variants = [
    { id: 'cauliflower_6', prepMethod: 'fried' },
    { id: 'cauliflower_12', prepMethod: 'fried' },
    { id: 'cauliflower_24', prepMethod: 'fried' },
    { id: 'cauliflower_6_wet', prepMethod: 'baked' },
    { id: 'cauliflower_12_wet', prepMethod: 'baked' },
    { id: 'cauliflower_24_wet', prepMethod: 'baked' }
  ];

  // Get current document
  const docRef = db.collection('plantBasedWings').doc('cauliflower');
  const doc = await docRef.get();
  const data = doc.data();

  // Update each variant with prepMethod
  const updatedVariants = data.variants.map(v => {
    const variantUpdate = variants.find(update => update.id === v.id);
    if (variantUpdate) {
      return { ...v, prepMethod: variantUpdate.prepMethod };
    }
    return v;
  });

  // Write back to Firestore
  await docRef.update({ variants: updatedVariants });

  console.log('✅ Successfully added prepMethod to all 6 cauliflower variants:');
  variants.forEach(v => console.log(`  - ${v.id}: prepMethod = ${v.prepMethod}`));
}

addPrepMethodsToCauliflower()
  .then(() => {
    console.log('\n✅ All done!');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
