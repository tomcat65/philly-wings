const admin = require('firebase-admin');

const serviceAccount = require('/home/tomcat65/projects/docs/Phillywingsexpress/philly-wings-firebase-adminsdk-fbsvc-b9a46d307f.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'philly-wings'
});

const db = admin.firestore();

async function updateColdSidesImages() {
  console.log('\n🥗 Updating cold sides images...');

  const coldSides = [
    {
      id: 'sally_sherman_coleslaw',
      imageUrl: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Fcoleslaw-salad_800x800.webp?alt=media'
    },
    {
      id: 'sally_sherman_potato_salad',
      imageUrl: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Fpotato-salad_800x800.webp?alt=media'
    }
  ];

  try {
    for (const item of coldSides) {
      await db.collection('coldSides').doc(item.id).update({
        imageUrl: item.imageUrl
      });
      console.log(`✅ Updated ${item.id}`);
    }

    console.log('\n🎉 All cold sides images updated successfully!');

  } catch (error) {
    console.error('❌ Error updating images:', error.message);
    process.exit(1);
  }

  process.exit(0);
}

updateColdSidesImages();
