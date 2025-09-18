#!/usr/bin/env node

// This script resets the admin password
// Run with: node scripts/reset-admin-password.js

import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize admin SDK
const serviceAccount = JSON.parse(
  readFileSync(join(__dirname, '../firebase-service-account.json'), 'utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function resetAdminPassword() {
  const email = 'admin@phillywingsexpress.com';
  const newPassword = 'Brun0@77494';

  try {
    // Get user by email
    const userRecord = await admin.auth().getUserByEmail(email);
    console.log('Found user:', userRecord.uid);

    // Update password
    await admin.auth().updateUser(userRecord.uid, {
      password: newPassword
    });

    console.log('✅ Password successfully reset for', email);
    console.log('New password:', newPassword);

    process.exit(0);
  } catch (error) {
    console.error('Error resetting password:', error);
    process.exit(1);
  }
}

resetAdminPassword();