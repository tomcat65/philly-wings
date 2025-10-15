const admin = require('firebase-admin');

const serviceAccount = require('/home/tomcat65/projects/docs/Phillywingsexpress/philly-wings-firebase-adminsdk-fbsvc-b9a46d307f.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'philly-wings'
});

const db = admin.firestore();

async function updateDessertsImages() {
  console.log('\n🍰 Updating all desserts images...');

  const desserts = [
    {
      id: 'marble_pound_cake',
      imageUrl: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Fmarble-pound-cake_800x800.webp?alt=media'
    },
    {
      id: 'gourmet_brownies',
      imageUrl: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Fgourmet-brownies_800x800.webp?alt=media'
    },
    {
      id: 'creme_brulee_cheesecake',
      imageUrl: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Fcreme-brulee-cheesecake_800x800.webp?alt=media'
    },
    {
      id: 'red_velvet_cake',
      imageUrl: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Fred-velvet-cake_800x800.webp?alt=media'
    },
    {
      id: 'ny_cheesecake',
      imageUrl: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Fnew-york-cheesecake_800x800.webp?alt=media'
    }
  ];

  try {
    for (const dessert of desserts) {
      await db.collection('desserts').doc(dessert.id).update({
        imageUrl: dessert.imageUrl
      });
      console.log(`✅ Updated ${dessert.id}`);
    }

    console.log('\n🎉 All desserts images updated successfully!');

  } catch (error) {
    console.error('❌ Error updating images:', error.message);
    process.exit(1);
  }

  process.exit(0);
}

updateDessertsImages();
