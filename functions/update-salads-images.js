const admin = require('firebase-admin');

const serviceAccount = require('/home/tomcat65/projects/docs/Phillywingsexpress/philly-wings-firebase-adminsdk-fbsvc-b9a46d307f.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'philly-wings'
});

const db = admin.firestore();

async function updateSaladsImages() {
  console.log('\n🥗 Updating fresh salads images...');

  const salads = [
    {
      id: 'caesar_salad',
      imageUrl: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Fcaesar-salad_800x800.webp?alt=media'
    },
    {
      id: 'garden_salad',
      imageUrl: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Fgarden-salad_800x800.webp?alt=media'
    }
  ];

  try {
    for (const salad of salads) {
      await db.collection('freshSalads').doc(salad.id).update({
        imageUrl: salad.imageUrl
      });
      console.log(`✅ Updated ${salad.id}`);
    }

    console.log('\n🎉 All salads images updated successfully!');

  } catch (error) {
    console.error('❌ Error updating images:', error.message);
    process.exit(1);
  }

  process.exit(0);
}

updateSaladsImages();
