const admin = require('firebase-admin');

process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8081';
admin.initializeApp({ projectId: 'philly-wings' });
const db = admin.firestore();

async function testData() {
  console.log('🧪 Testing Emulator Data\n');
  console.log('='.repeat(50));
  
  // Test sauces
  console.log('\n📝 SAUCES:');
  const saucesSnap = await db.collection('sauces').where('active', '==', true).get();
  console.log(`Total active sauces: ${saucesSnap.size}`);
  
  const byCategory = {};
  saucesSnap.docs.forEach(doc => {
    const data = doc.data();
    const cat = data.category || 'unknown';
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push({ id: doc.id, name: data.name, price: data.basePrice });
  });
  
  Object.entries(byCategory).forEach(([cat, items]) => {
    console.log(`\n  ${cat}:`);
    items.forEach(item => {
      console.log(`    ✅ ${item.name} (${item.id}) - $${item.price}`);
    });
  });
  
  // Test catering packages
  console.log('\n\n📦 CATERING PACKAGES:');
  const packagesSnap = await db.collection('cateringPackages').where('active', '==', true).get();
  console.log(`Total active packages: ${packagesSnap.size}`);
  
  packagesSnap.docs.forEach(doc => {
    const data = doc.data();
    console.log(`  ✅ ${data.name} (${doc.id})`);
    console.log(`     Serves: ${data.servesMin}-${data.servesMax} | Price: $${data.basePrice}`);
  });
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ Emulator data check complete!\n');
  
  process.exit(0);
}

testData().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
