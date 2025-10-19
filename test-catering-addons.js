/**
 * Local test script for cateringAddOns migration
 * Tests new lightweight schema with packSize field
 */

const admin = require('firebase-admin');
const serviceAccount = require('/home/tomcat65/projects/docs/Phillywingsexpress/philly-wings-firebase-adminsdk-fbsvc-b9a46d307f.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function testCateringAddOns() {
  console.log('🔍 Testing cateringAddOns migration...\n');

  try {
    // Test 1: Get all items
    console.log('Test 1: Fetching all cateringAddOns...');
    const snapshot = await db.collection('cateringAddOns')
      .where('active', '==', true)
      .get();

    console.log(`✅ Found ${snapshot.size} active items\n`);

    // Test 2: Group by category
    console.log('Test 2: Grouping by category...');
    const byCategory = {};
    snapshot.forEach(doc => {
      const data = doc.data();
      const category = data.category || 'unknown';
      if (!byCategory[category]) byCategory[category] = [];
      byCategory[category].push({
        id: data.id,
        name: data.name,
        packSize: data.packSize,
        basePrice: data.basePrice
      });
    });

    Object.keys(byCategory).sort().forEach(cat => {
      console.log(`\n  ${cat}: ${byCategory[cat].length} items`);
      byCategory[cat].forEach(item => {
        console.log(`    - ${item.name} (${item.packSize || 'N/A'}) - $${item.basePrice}`);
      });
    });

    // Test 3: Verify source pointers
    console.log('\n\nTest 3: Verifying source pointers...');
    let withSourcePointers = 0;
    let withoutSourcePointers = 0;

    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.sourceCollection && data.sourceDocumentId) {
        withSourcePointers++;
      } else {
        withoutSourcePointers++;
        console.log(`  ⚠️  Missing source pointers: ${data.name} (${data.category})`);
      }
    });

    console.log(`  ✅ Items with source pointers: ${withSourcePointers}`);
    console.log(`  ⚠️  Items without source pointers: ${withoutSourcePointers}`);

    // Test 4: Check packSize field
    console.log('\n\nTest 4: Checking packSize distribution...');
    const byPackSize = {};
    snapshot.forEach(doc => {
      const data = doc.data();
      const packSize = data.packSize || 'missing';
      byPackSize[packSize] = (byPackSize[packSize] || 0) + 1;
    });

    Object.keys(byPackSize).sort().forEach(size => {
      console.log(`  ${size}: ${byPackSize[size]} items`);
    });

    // Test 5: Sample item structure
    console.log('\n\nTest 5: Sample item structure...');
    const sampleDoc = snapshot.docs[0];
    const sampleData = sampleDoc.data();
    console.log('Sample item:', JSON.stringify({
      id: sampleData.id,
      name: sampleData.name,
      category: sampleData.category,
      packSize: sampleData.packSize,
      basePrice: sampleData.basePrice,
      sourceCollection: sampleData.sourceCollection,
      sourceDocumentId: sampleData.sourceDocumentId,
      availableForTiers: sampleData.availableForTiers
    }, null, 2));

    console.log('\n✅ All tests passed!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

testCateringAddOns();
