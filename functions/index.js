// Cloud Functions for platform menu publishing
const functions = require('firebase-functions');
const admin = require('firebase-admin');

try {
  admin.initializeApp();
} catch (e) {}

const db = admin.firestore();
const storage = admin.storage();

/**
 * Callable: publishPlatformMenu
 * payload: { platform: 'doordash'|'ubereats'|'grubhub', snapshot: object }
 * Writes JSON to Storage: platform-menus/{platform}/{ts}.json and latest.json
 * Writes metadata to Firestore: publishedMenus/{id}
 */
exports.publishPlatformMenu = functions.https.onCall(async (data, context) => {
  if (!context.auth || !context.auth.token || !(context.auth.token.admin === true || context.auth.token.admin === 'true')) {
    throw new functions.https.HttpsError('permission-denied', 'Admin privileges required');
  }

  const platform = (data && data.platform) || 'doordash';
  const snapshot = (data && data.snapshot) || null;
  if (!snapshot || typeof snapshot !== 'object') {
    throw new functions.https.HttpsError('invalid-argument', 'Missing snapshot payload');
  }

  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const fileBase = `platform-menus/${platform}`;
  const versionedPath = `${fileBase}/${ts}.json`;
  const latestPath = `${fileBase}/latest.json`;

  const bucket = storage.bucket();

  const buffer = Buffer.from(JSON.stringify(snapshot, null, 2));
  await bucket.file(versionedPath).save(buffer, {
    contentType: 'application/json',
    resumable: false
  });

  // Also write latest.json
  await bucket.file(latestPath).save(buffer, {
    contentType: 'application/json',
    resumable: false
  });

  // Build public URLs (Firebase Hosting style or storage.googleapis)
  const bucketName = bucket.name;
  const versionedUrl = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(versionedPath)}?alt=media`;
  const latestUrl = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(latestPath)}?alt=media`;

  // Save metadata
  const menuId = `${platform}-${ts}`;
  await db.collection('publishedMenus').doc(menuId).set({
    platform,
    menuId,
    urls: { versionedUrl, latestUrl },
    publishedAt: admin.firestore.FieldValue.serverTimestamp(),
    publishedBy: context.auth.token.email || context.auth.uid || 'admin',
    status: 'active'
  });

  return { menuId, versionedUrl, latestUrl };
});
