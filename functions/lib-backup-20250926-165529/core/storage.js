const admin = require('firebase-admin');

// Initialize storage
let storage;
try {
  if (!admin.apps.length) {
    admin.initializeApp();
  }
  storage = admin.storage();
} catch (e) {
  storage = admin.storage();
}

/**
 * Generate optimized image URL for menu items
 * @param {Object} item Menu item with image property
 * @param {string} size Size specification (e.g., '200x200')
 * @returns {string} Optimized image URL
 */
function generateOptimizedImageUrl(item, size = '200x200') {
  if (!item.image) {
    return getDefaultWingImage(item.type || 'boneless');
  }

  // If it's already a full URL, return as is
  if (item.image.startsWith('http://') || item.image.startsWith('https://')) {
    return item.image;
  }

  // Handle Firebase Storage paths
  if (item.image.startsWith('gs://') || item.image.includes('firebasestorage.googleapis.com')) {
    // Extract path from Firebase Storage URL
    let imagePath = item.image;

    if (item.image.includes('firebasestorage.googleapis.com')) {
      // Extract the path from a full Firebase Storage URL
      const urlMatch = item.image.match(/\/o\/(.+?)\?/);
      if (urlMatch && urlMatch[1]) {
        imagePath = decodeURIComponent(urlMatch[1]);
      }
    } else if (item.image.startsWith('gs://')) {
      // Extract path from gs:// URL
      imagePath = item.image.replace(/^gs:\/\/[^\/]+\//, '');
    }

    // Return URL with size transformation
    const bucket = storage.bucket();
    const file = bucket.file(imagePath);

    // For now, return the basic URL - can add image transformation service later
    return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(imagePath)}?alt=media`;
  }

  // Fallback to default image
  return getDefaultWingImage(item.type || 'boneless');
}

/**
 * Get default wing image based on type
 * @param {string} type Wing type (boneless, bone-in, etc.)
 * @returns {string} Default image URL
 */
function getDefaultWingImage(type) {
  return type === 'bone-in' ?
    'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=200&h=200&fit=crop&crop=center' :
    'https://images.unsplash.com/photo-1562967914-608f82629710?w=200&h=200&fit=crop&crop=center';
}

/**
 * Save menu data to Firebase Storage
 * @param {string} platform Platform name (doordash, ubereats, grubhub)
 * @param {Object} menuData Menu data to save
 * @returns {Promise<string>} Storage URL
 */
async function saveMenuToStorage(platform, menuData) {
  const timestamp = Date.now();
  const fileName = `platform-menus/${platform}/${timestamp}.json`;
  const latestFileName = `platform-menus/${platform}/latest.json`;

  const bucket = storage.bucket();

  // Save timestamped version
  await bucket.file(fileName).save(JSON.stringify(menuData, null, 2), {
    metadata: {
      contentType: 'application/json'
    }
  });

  // Save as latest
  await bucket.file(latestFileName).save(JSON.stringify(menuData, null, 2), {
    metadata: {
      contentType: 'application/json'
    }
  });

  return `gs://${bucket.name}/${fileName}`;
}

module.exports = {
  storage,
  generateOptimizedImageUrl,
  getDefaultWingImage,
  saveMenuToStorage
};