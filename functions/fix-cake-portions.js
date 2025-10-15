const admin = require('firebase-admin');

const serviceAccount = require('/home/tomcat65/projects/docs/Phillywingsexpress/philly-wings-firebase-adminsdk-fbsvc-b9a46d307f.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'philly-wings'
});

const db = admin.firestore();

async function fixCakePortions() {
  console.log('\n🍰 Updating cake portions to individual slices...');

  const updates = [
    {
      id: 'creme_brulee_cheesecake',
      variant: {
        id: 'cheesecake_slice',
        name: 'Creme Brulée Cheesecake',
        slices: 1,
        basePrice: 3.5,
        platformPricing: {
          doordash: 4.73,
          ubereats: 4.73,
          grubhub: 4.25
        }
      }
    },
    {
      id: 'red_velvet_cake',
      variant: {
        id: 'red_velvet_slice',
        name: 'Red Velvet Cake',
        slices: 1,
        basePrice: 3.5,
        platformPricing: {
          doordash: 4.73,
          ubereats: 4.73,
          grubhub: 4.25
        }
      }
    },
    {
      id: 'ny_cheesecake',
      variant: {
        id: 'ny_cheesecake_slice',
        name: 'New York Cheesecake',
        slices: 1,
        basePrice: 4,
        platformPricing: {
          doordash: 5.4,
          ubereats: 5.4,
          grubhub: 4.86
        }
      }
    }
  ];

  try {
    for (const update of updates) {
      await db.collection('desserts').doc(update.id).update({
        variants: [update.variant]
      });
      console.log(`✅ Updated ${update.id} to individual slice`);
    }

    console.log('\n🎉 All cakes updated to individual portions!');

  } catch (error) {
    console.error('❌ Error updating portions:', error.message);
    process.exit(1);
  }

  process.exit(0);
}

fixCakePortions();
