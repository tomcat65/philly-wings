const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin
const serviceAccount = require('/home/tomcat65/projects/docs/Phillywingsexpress/philly-wings-firebase-adminsdk-fbsvc-b9a46d307f.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'philly-wings'
});

const db = admin.firestore();

async function uploadCollection(collectionName, dataFile) {
  console.log(`\nUploading ${collectionName} collection from ${dataFile}...`);

  const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  const items = Array.isArray(data) ? data : [data];

  for (const item of items) {
    const docId = item.id;
    delete item.id; // Remove id from document data

    try {
      await db.collection(collectionName).doc(docId).set(item);
      console.log(`✓ Uploaded ${docId}`);
    } catch (error) {
      console.error(`✗ Failed to upload ${docId}:`, error.message);
    }
  }
}

async function main() {
  try {
    // Upload desserts
    await uploadCollection('desserts', '/tmp/desserts-data-corrected.json');

    // Upload salads
    await uploadCollection('freshSalads', '/tmp/fresh-salads-data-corrected.json');

    // Upload cold sides
    await uploadCollection('coldSides', '/tmp/cold-sides-data-corrected.json');

    // Upload cauliflower wings
    await uploadCollection('plantBasedWings', '/tmp/cauliflower-wings-data.json');

    console.log('\n✅ All collections uploaded successfully!');
  } catch (error) {
    console.error('\n❌ Upload failed:', error);
  } finally {
    process.exit(0);
  }
}

main();
