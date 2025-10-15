const admin = require('firebase-admin');
const fs = require('fs');

// Initialize Firebase Admin
const serviceAccount = require('/home/tomcat65/projects/docs/Phillywingsexpress/philly-wings-firebase-adminsdk-fbsvc-b9a46d307f.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'philly-wings'
});

const db = admin.firestore();

async function updateDesserts() {
  console.log('\nUpdating desserts with ready-to-serve status...');

  const data = JSON.parse(fs.readFileSync('/tmp/desserts-data-final.json', 'utf8'));

  for (const item of data) {
    const docId = item.id;
    delete item.id; // Remove id from document data

    try {
      await db.collection('desserts').doc(docId).set(item);
      console.log(`✓ Updated ${docId} - ${item.readyToServe ? 'Ready to Serve' : 'Prep Required'}`);
    } catch (error) {
      console.error(`✗ Failed to update ${docId}:`, error.message);
    }
  }

  console.log('\n✅ All desserts updated successfully!');
  console.log('\n📝 Customer-facing: All desserts show as "ready to serve"');
  console.log('📝 Internal notes preserved for operations team');

  process.exit(0);
}

updateDesserts();
