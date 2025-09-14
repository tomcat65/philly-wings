const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Get project ID from environment variables
const projectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID;

if (!projectId) {
  console.error('Error: FIREBASE_PROJECT_ID or VITE_FIREBASE_PROJECT_ID environment variable is not set.');
  console.error('Please create a .env file with your Firebase configuration.');
  process.exit(1);
}

// Initialize Firebase Admin
// Try to use service account if available, otherwise use default credentials
let appConfig = { projectId: projectId };

// Check for service account key in environment variable or file
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || './service-account.json';
if (fs.existsSync(serviceAccountPath)) {
  try {
    const serviceAccount = require(path.resolve(serviceAccountPath));
    appConfig.credential = cert(serviceAccount);
    console.log('Using service account credentials');
  } catch (error) {
    console.log('Service account file found but could not be loaded, using default credentials');
  }
} else {
  console.log('No service account file found, using default credentials');
  console.log('Make sure you are authenticated with Firebase CLI: firebase login');
}

const app = initializeApp(appConfig);

const auth = getAuth();

async function createAdminUser() {
  try {
    console.log('Creating admin user...');

    // Create the user
    const userRecord = await auth.createUser({
      email: 'admin@phillywingsexpress.com',
      password: 'HVqrqzqiA3703!7S',
      emailVerified: true,
      disabled: false
    });

    console.log('✅ Successfully created admin user:');
    console.log(`   Email: ${userRecord.email}`);
    console.log(`   UID: ${userRecord.uid}`);

    // Set custom claims to mark this user as admin
    await auth.setCustomUserClaims(userRecord.uid, { admin: true });
    console.log('✅ Admin claims set for user');

  } catch (error) {
    if (error.code === 'auth/email-already-exists') {
      console.log('⚠️  Admin user already exists');

      // Get the existing user and set admin claims
      try {
        const existingUser = await auth.getUserByEmail('admin@phillywingsexpress.com');
        await auth.setCustomUserClaims(existingUser.uid, { admin: true });
        console.log('✅ Admin claims updated for existing user');
        console.log(`   Email: ${existingUser.email}`);
        console.log(`   UID: ${existingUser.uid}`);
      } catch (updateError) {
        console.error('Error updating existing user:', updateError);
      }
    } else {
      console.error('Error creating admin user:', error);
    }
  }

  process.exit();
}

createAdminUser();