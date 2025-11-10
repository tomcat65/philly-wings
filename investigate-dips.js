const admin = require('firebase-admin');

process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8081';
admin.initializeApp({ projectId: 'philly-wings' });
const db = admin.firestore();

async function investigate() {
  console.log('🔍 INVESTIGATING DIPS DATA\n');
  console.log('='.repeat(60));
  
  // Check what we seeded
  console.log('\n1. CHECKING SEED DATA (seed-emulator-complete.js):\n');
  
  const saucesSnap = await db.collection('sauces')
    .where('category', '==', 'dipping-sauce')
    .where('active', '==', true)
    .get();
  
  console.log(`Found ${saucesSnap.size} dips in Firestore:\n`);
  
  saucesSnap.docs.forEach(doc => {
    const data = doc.data();
    console.log(`  ID: ${doc.id}`);
    console.log(`  Name: ${data.name}`);
    console.log(`  Category: ${data.category}`);
    console.log(`  Price: $${data.basePrice}`);
    console.log(`  Has imageUrl: ${!!data.imageUrl}`);
    if (data.imageUrl) {
      console.log(`  Image URL present: YES`);
    } else {
      console.log(`  Image URL present: NO`);
    }
    console.log('');
  });
  
  console.log('\n2. CHECKING SEED SOURCES:\n');
  console.log('  seed-emulator-complete.js: 4 dips (ranch, blue-cheese, honey-mustard, bbq-dip)');
  console.log('  seed-emulator-sauces.js: Had honey-mustard only');
  
  console.log('\n3. COMPONENT QUERY BEHAVIOR:\n');
  console.log('  Component queries: collection("sauces")');
  console.log('  Filters: category == "dipping-sauce" AND active == true');
  console.log('  Order: sortOrder asc');
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ Investigation complete\n');
  
  process.exit(0);
}

investigate().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
