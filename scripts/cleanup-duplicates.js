/**
 * Cleanup duplicate cateringAddOns
 * Lists all document IDs and helps identify duplicates
 */

const admin = require('firebase-admin');
const serviceAccountPath = '/home/tomcat65/projects/docs/Phillywingsexpress/philly-wings-firebase-adminsdk-fbsvc-b9a46d307f.json';

admin.initializeApp({
  credential: admin.credential.cert(require(serviceAccountPath))
});

const db = admin.firestore();

async function checkDuplicates() {
  console.log('🔍 Checking cateringAddOns for duplicates...\n');

  try {
    const snapshot = await db.collection('cateringAddOns')
      .where('active', '==', true)
      .get();

    console.log(`Found ${snapshot.size} active items\n`);

    const byCategory = {};
    const allIds = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      const category = data.category || 'unknown';
      if (!byCategory[category]) byCategory[category] = [];

      byCategory[category].push({
        id: doc.id,
        name: data.name,
        packSize: data.packSize,
        hasSourcePointers: !!(data.sourceCollection && data.sourceDocumentId)
      });

      allIds.push(doc.id);
    });

    // Check for duplicate IDs
    const idCounts = {};
    allIds.forEach(id => {
      idCounts[id] = (idCounts[id] || 0) + 1;
    });

    const duplicateIds = Object.keys(idCounts).filter(id => idCounts[id] > 1);
    if (duplicateIds.length > 0) {
      console.log('⚠️  DUPLICATE IDs FOUND:');
      duplicateIds.forEach(id => {
        console.log(`   ${id}: ${idCounts[id]} occurrences`);
      });
    } else {
      console.log('✅ No duplicate document IDs');
    }

    console.log('\n📋 Items by category:\n');
    Object.keys(byCategory).sort().forEach(cat => {
      console.log(`${cat}: ${byCategory[cat].length} items`);
      byCategory[cat].forEach(item => {
        const sourceStatus = item.hasSourcePointers ? '✅' : '❌';
        console.log(`  ${sourceStatus} ${item.id} - ${item.name} (${item.packSize || 'N/A'})`);
      });
      console.log('');
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkDuplicates();
