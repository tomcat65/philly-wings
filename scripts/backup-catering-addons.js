/**
 * Backup current cateringAddOns from Firestore
 * Run with: node scripts/backup-catering-addons.js
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin
const serviceAccountPath = '/home/tomcat65/projects/docs/Phillywingsexpress/philly-wings-firebase-adminsdk-fbsvc-b9a46d307f.json';
admin.initializeApp({
  credential: admin.credential.cert(require(serviceAccountPath))
});

const db = admin.firestore();

async function backupCateringAddOns() {
  console.log('🔍 Fetching all cateringAddOns from Firestore...\n');

  try {
    const snapshot = await db.collection('cateringAddOns')
      .where('active', '==', true)
      .get();

    const addOns = [];
    snapshot.forEach(doc => {
      addOns.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Sort by category and displayOrder
    addOns.sort((a, b) => {
      if (a.category !== b.category) return a.category.localeCompare(b.category);
      return a.displayOrder - b.displayOrder;
    });

    console.log(`✅ Found ${addOns.length} active items\n`);

    // Group by category for display
    const byCategory = {};
    addOns.forEach(item => {
      const cat = item.category || 'unknown';
      if (!byCategory[cat]) byCategory[cat] = [];
      byCategory[cat].push(item);
    });

    console.log('📋 Summary:');
    Object.keys(byCategory).sort().forEach(cat => {
      console.log(`   ${cat}: ${byCategory[cat].length} items`);
    });

    // Save to file
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `cateringAddOns-backup-${timestamp}.json`;
    const filepath = path.join(__dirname, '..', filename);

    fs.writeFileSync(filepath, JSON.stringify(addOns, null, 2));
    console.log(`\n💾 Backup saved to: ${filename}`);
    console.log(`   Total items: ${addOns.length}`);
    console.log(`   Schema: Lightweight Reference (with source pointers)\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating backup:', error);
    process.exit(1);
  }
}

backupCateringAddOns();
