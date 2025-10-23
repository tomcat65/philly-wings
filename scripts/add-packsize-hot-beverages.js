/**
 * Add packSize field to hot beverages
 * Codex feedback: hot beverages should have packSize like other items
 */

const admin = require('firebase-admin');
const serviceAccountPath = '/home/tomcat65/projects/docs/Phillywingsexpress/philly-wings-firebase-adminsdk-fbsvc-b9a46d307f.json';

admin.initializeApp({
  credential: admin.credential.cert(require(serviceAccountPath))
});

const db = admin.firestore();

// Map doc IDs to their packSize based on name
const updates = {
  'Uz9CQ6MLxCSvEI9oc1hC': '96oz',  // Premium Lavazza Coffee (96oz)
  'YoVyh67mpczUhkMkVrOw': '96oz',  // Premium Ghirardelli Hot Chocolate (96oz)
  'oqnRWB0Yn1sxmHlXq1iu': '128oz', // Premium Lavazza Coffee (128oz)
  'sOYRG0fIQsBCRdbWyJeo': '128oz'  // Premium Ghirardelli Hot Chocolate (128oz)
};

async function addPackSizes() {
  console.log('📦 Adding packSize field to hot beverages...\n');

  try {
    const batch = db.batch();
    let count = 0;

    for (const [docId, packSize] of Object.entries(updates)) {
      const docRef = db.collection('cateringAddOns').doc(docId);

      // Get current data to verify
      const doc = await docRef.get();
      if (!doc.exists) {
        console.log(`⚠️  Doc ${docId} not found, skipping`);
        continue;
      }

      const data = doc.data();
      console.log(`✅ Updating: ${data.name}`);
      console.log(`   Adding packSize: ${packSize}`);

      batch.update(docRef, { packSize });
      count++;
    }

    await batch.commit();
    console.log(`\n🎉 Successfully updated ${count} hot beverages with packSize!\n`);

    // Verify
    console.log('🔍 Verifying updates...');
    const snapshot = await db.collection('cateringAddOns')
      .where('category', '==', 'hot-beverages')
      .get();

    snapshot.forEach(doc => {
      const data = doc.data();
      console.log(`  ✅ ${data.name}: packSize = ${data.packSize}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addPackSizes();
