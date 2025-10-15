const admin = require('firebase-admin');

const serviceAccount = require('/home/tomcat65/projects/docs/Phillywingsexpress/philly-wings-firebase-adminsdk-fbsvc-b9a46d307f.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'philly-wings'
});

const db = admin.firestore();

async function updateSpringMix() {
  console.log('\n🥗 Updating Spring Mix Salad image...');

  const imageUrl = 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Fgarden-salad_800x800.webp?alt=media';

  try {
    await db.collection('freshSalads').doc('spring_mix_salad').update({
      imageUrl: imageUrl
    });

    console.log('✅ Successfully updated spring_mix_salad!');
    console.log('\nImage URL:', imageUrl);

  } catch (error) {
    console.error('❌ Error updating image:', error.message);
    process.exit(1);
  }

  process.exit(0);
}

updateSpringMix();
