const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('/home/tomcat65/projects/docs/Phillywingsexpress/philly-wings-firebase-adminsdk-fbsvc-b9a46d307f.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'philly-wings'
});

const db = admin.firestore();

async function updateCauliflowerImages() {
  console.log('\n🌱 Updating Cauliflower Wings images...');

  const imageUrls = {
    hero: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Fcauliflower-fried_1920x1080.webp?alt=media',
    card: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Fcauliflower-fried_1920x1080.webp?alt=media',
    fried: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Fcauliflower-fried_800x800.webp?alt=media',
    baked: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Fcauliflower-baked_800x800.webp?alt=media'
  };

  try {
    await db.collection('plantBasedWings').doc('cauliflower').update({
      images: imageUrls
    });

    console.log('✅ Successfully updated cauliflower wings images!');
    console.log('\nImage URLs:');
    console.log('  Hero/Card:', imageUrls.hero);
    console.log('  Fried:', imageUrls.fried);
    console.log('  Baked:', imageUrls.baked);

  } catch (error) {
    console.error('❌ Error updating images:', error.message);
    process.exit(1);
  }

  process.exit(0);
}

updateCauliflowerImages();
