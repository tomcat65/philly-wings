import { db } from '../firebase-config.js';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';

/**
 * Fetches all active cold sides from Firestore
 * @returns {Promise<Array>} Array of cold side items with variants
 */
export async function getColdSides() {
  try {
    const sidesRef = collection(db, 'coldSides');
    const q = query(
      sidesRef,
      where('active', '==', true),
      orderBy('sortOrder')
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching cold sides:', error);
    return [];
  }
}

/**
 * Fetches a specific cold side by ID
 * @param {string} sideId - The ID of the side to fetch
 * @returns {Promise<Object|null>} Side data or null if not found
 */
export async function getColdSideById(sideId) {
  try {
    const sides = await getColdSides();
    return sides.find(side => side.id === sideId) || null;
  } catch (error) {
    console.error(`Error fetching cold side ${sideId}:`, error);
    return null;
  }
}

/**
 * Gets variants by size
 * @param {Object} side - Side item object
 * @param {string} size - 'regular', 'large', or 'family'
 * @returns {Object|null} Variant for the specified size
 */
export function getVariantBySize(side, size) {
  if (!side || !side.variants) return null;
  return side.variants.find(v => v.size === size) || null;
}

/**
 * Calculates platform price for a side variant
 * @param {Object} variant - Side variant object
 * @param {string} platform - 'doordash', 'ubereats', or 'grubhub'
 * @returns {number} Platform-specific price
 */
export function getPlatformPrice(variant, platform) {
  if (!variant || !variant.platformPricing) return variant?.basePrice || 0;
  return variant.platformPricing[platform] || variant.basePrice;
}

/**
 * Gets available sizes for a side item
 * @param {Object} side - Side item object
 * @returns {Array} Array of available sizes
 */
export function getAvailableSizes(side) {
  if (!side || !side.variants) return [];
  return side.variants.map(v => v.size);
}

/**
 * Gets Sally Sherman products
 * @param {Array} sides - Array of side items
 * @returns {Array} Filtered sides from Sally Sherman
 */
export function getSallyShermanProducts(sides) {
  return sides.filter(s => s.supplier === 'Sally Sherman');
}
