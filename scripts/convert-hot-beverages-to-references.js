/**
 * Phase 2: Convert Hot Beverage cateringAddOns to References
 * Updates 4 documents to reference menuItems instead of storing data directly
 * Creates lightweight reference architecture for enrichAddOnsWithPricing()
 */

const admin = require('firebase-admin');
const serviceAccountPath = '/home/tomcat65/projects/docs/Phillywingsexpress/philly-wings-firebase-adminsdk-fbsvc-b9a46d307f.json';

admin.initializeApp({
  credential: admin.credential.cert(require(serviceAccountPath))
});

const db = admin.firestore();

// Mapping of cateringAddOns document IDs to their new references
const referenceUpdates = {
  // Lavazza Coffee 96oz
  'Uz9CQ6MLxCSvEI9oc1hC': {
    id: "lavazza-coffee-96oz",
    category: "hot-beverages",

    // 🔑 NEW: Source references
    sourceCollection: "menuItems",
    sourceDocumentId: "lavazza_premium_coffee",
    sourceVariantId: "96oz_cambro",

    packSize: "96oz",
    quantityMultiplier: 1,
    displayOrder: 10,
    active: true,

    // Keep image override
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fcatering%2Fhot-beverages%2Fhot-bev-96oz.webp?alt=media"
  },

  // Lavazza Coffee 128oz
  'oqnRWB0Yn1sxmHlXq1iu': {
    id: "lavazza-coffee-128oz",
    category: "hot-beverages",

    sourceCollection: "menuItems",
    sourceDocumentId: "lavazza_premium_coffee",
    sourceVariantId: "128oz_cambro",

    packSize: "128oz",
    quantityMultiplier: 1,
    displayOrder: 11,
    active: true,

    imageUrl: "https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fcatering%2Fhot-beverages%2Fhot-bev-128oz.webp?alt=media"
  },

  // Ghirardelli Hot Chocolate 96oz
  'YoVyh67mpczUhkMkVrOw': {
    id: "ghirardelli-hot-chocolate-96oz",
    category: "hot-beverages",

    sourceCollection: "menuItems",
    sourceDocumentId: "ghirardelli_hot_chocolate",
    sourceVariantId: "96oz_cambro",

    packSize: "96oz",
    quantityMultiplier: 1,
    displayOrder: 12,
    active: true,

    imageUrl: "https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fcatering%2Fhot-beverages%2Fhot-bev-96oz.webp?alt=media"
  },

  // Ghirardelli Hot Chocolate 128oz
  'sOYRG0fIQsBCRdbWyJeo': {
    id: "ghirardelli-hot-chocolate-128oz",
    category: "hot-beverages",

    sourceCollection: "menuItems",
    sourceDocumentId: "ghirardelli_hot_chocolate",
    sourceVariantId: "128oz_cambro",

    packSize: "128oz",
    quantityMultiplier: 1,
    displayOrder: 13,
    active: true,

    imageUrl: "https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fcatering%2Fhot-beverages%2Fhot-bev-128oz.webp?alt=media"
  }
};

async function convertToReferences() {
  console.log('☕ Phase 2: Converting Hot Beverages to References\n');
  console.log('Updating 4 cateringAddOns documents...\n');

  try {
    // First verify menuItems exist
    console.log('🔍 Verifying menuItems exist...');
    const lavazzaDoc = await db.collection('menuItems').doc('lavazza_premium_coffee').get();
    const ghirardelliDoc = await db.collection('menuItems').doc('ghirardelli_hot_chocolate').get();

    if (!lavazzaDoc.exists || !ghirardelliDoc.exists) {
      console.error('❌ ERROR: menuItems documents not found!');
      console.error('   Please run migrate-hot-beverages-to-menuitems.js first');
      process.exit(1);
    }
    console.log('  ✅ Lavazza Premium Coffee found');
    console.log('  ✅ Ghirardelli Hot Chocolate found\n');

    const batch = db.batch();
    let count = 0;

    for (const [docId, newData] of Object.entries(referenceUpdates)) {
      const docRef = db.collection('cateringAddOns').doc(docId);

      // Get current data to show what's changing
      const doc = await docRef.get();
      if (!doc.exists) {
        console.log(`⚠️  Doc ${docId} not found, skipping`);
        continue;
      }

      const oldData = doc.data();
      console.log(`📝 Converting: ${oldData.name}`);
      console.log(`   Old: basePrice = $${oldData.basePrice} (stored directly)`);
      console.log(`   New: sourceCollection = "${newData.sourceCollection}"`);
      console.log(`        sourceDocumentId = "${newData.sourceDocumentId}"`);
      console.log(`        sourceVariantId = "${newData.sourceVariantId}"`);
      console.log(`   Enrichment will fetch price from menuItems at runtime\n`);

      // Replace entire document with new reference structure
      batch.set(docRef, newData);
      count++;
    }

    await batch.commit();
    console.log(`🎉 Successfully converted ${count} hot beverage documents to references!\n`);

    // Verify
    console.log('🔍 Verifying conversion...');
    for (const [docId, expectedData] of Object.entries(referenceUpdates)) {
      const doc = await db.collection('cateringAddOns').doc(docId).get();
      if (doc.exists) {
        const data = doc.data();
        const hasReferences = data.sourceCollection && data.sourceDocumentId && data.sourceVariantId;
        console.log(`  ${hasReferences ? '✅' : '❌'} ${data.id}`);
        console.log(`     sourceCollection: ${data.sourceCollection || 'MISSING'}`);
        console.log(`     sourceDocumentId: ${data.sourceDocumentId || 'MISSING'}`);
        console.log(`     sourceVariantId: ${data.sourceVariantId || 'MISSING'}`);
        console.log(`     basePrice field: ${data.basePrice ? 'STILL EXISTS (should be removed)' : 'Removed ✅'}`);
      } else {
        console.log(`  ❌ ${docId} NOT FOUND`);
      }
    }

    console.log('\n✅ Phase 2 Complete!');
    console.log('\n🎯 Next Steps:');
    console.log('   1. Test in UI: Add hot beverages to cart');
    console.log('   2. Verify prices show correctly');
    console.log('   3. Verify totals include hot beverages');
    console.log('   4. Check console for errors');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

convertToReferences();
