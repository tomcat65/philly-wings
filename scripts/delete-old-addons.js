/**
 * Delete old cateringAddOns with random IDs
 * Keep only semantic IDs from new seed script
 */

const admin = require('firebase-admin');
const serviceAccountPath = '/home/tomcat65/projects/docs/Phillywingsexpress/philly-wings-firebase-adminsdk-fbsvc-b9a46d307f.json';

admin.initializeApp({
  credential: admin.credential.cert(require(serviceAccountPath))
});

const db = admin.firestore();

// IDs to keep (semantic IDs from seed script + hot beverages)
const keepIds = [
  // Desserts
  'marble-pound-cake-individual',
  'gourmet-brownies-individual',
  'red-velvet-cake-individual',
  'creme-brulee-cheesecake-individual',
  'ny-cheesecake-individual',
  'marble-pound-cake-5pack',
  'gourmet-brownies-5pack',
  'red-velvet-cake-5pack',
  'creme-brulee-cheesecake-5pack',
  'ny-cheesecake-5pack',
  // Beverages
  'boxed-iced-tea-96oz',
  'boxed-iced-tea-3gal',
  // Salads
  'caesar-salad-family',
  'spring-mix-family',
  // Sides
  'coleslaw-family',
  'potato-salad-family',
  // Quick-adds
  'bottled-water-5pack',
  'chips-5pack',
  // Hot beverages (keep their random IDs)
  'Uz9CQ6MLxCSvEI9oc1hC',
  'YoVyh67mpczUhkMkVrOw',
  'oqnRWB0Yn1sxmHlXq1iu',
  'sOYRG0fIQsBCRdbWyJeo'
];

async function deleteOldItems() {
  console.log('🗑️  Deleting old cateringAddOns with random IDs...\n');

  try {
    const snapshot = await db.collection('cateringAddOns')
      .where('active', '==', true)
      .get();

    console.log(`Found ${snapshot.size} active items\n`);

    const toDelete = [];
    const toKeep = [];

    snapshot.forEach(doc => {
      if (keepIds.includes(doc.id)) {
        toKeep.push({ id: doc.id, name: doc.data().name });
      } else {
        toDelete.push({ id: doc.id, name: doc.data().name, category: doc.data().category });
      }
    });

    console.log(`✅ Keeping ${toKeep.length} items (semantic IDs + hot beverages)`);
    console.log(`🗑️  Deleting ${toDelete.length} items (old random IDs)\n`);

    if (toDelete.length === 0) {
      console.log('No items to delete!');
      process.exit(0);
    }

    console.log('Items to delete:');
    toDelete.forEach(item => {
      console.log(`  - ${item.id}: ${item.name} (${item.category})`);
    });

    console.log('\nDeleting...');
    const batch = db.batch();
    toDelete.forEach(item => {
      batch.delete(db.collection('cateringAddOns').doc(item.id));
    });

    await batch.commit();
    console.log(`\n✅ Successfully deleted ${toDelete.length} old items!`);
    console.log(`✅ Kept ${toKeep.length} items with semantic IDs\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

deleteOldItems();
