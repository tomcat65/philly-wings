const admin = require('firebase-admin');

const serviceAccount = require('/home/tomcat65/projects/docs/Phillywingsexpress/philly-wings-firebase-adminsdk-fbsvc-b9a46d307f.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'philly-wings'
});

const db = admin.firestore();

async function listPlantBased() {
  const snapshot = await db.collection('plantBasedWings').get();

  console.log(`\nFound ${snapshot.size} documents in plantBasedWings:\n`);

  snapshot.forEach(doc => {
    console.log(`ID: ${doc.id}`);
    console.log('Data:', JSON.stringify(doc.data(), null, 2));
    console.log('---');
  });

  process.exit(0);
}

listPlantBased();
