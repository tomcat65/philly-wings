import { db } from '../firebase-config.js';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';

/**
 * Fetches all active desserts from Firestore
 * @returns {Promise<Array>} Array of dessert items with variants
 */
export async function getDesserts() {
  try {
    const dessertsRef = collection(db, 'desserts');
    const q = query(
      dessertsRef,
      where('active', '==', true),
      orderBy('sortOrder')
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching desserts:', error);
    return [];
  }
}

/**
 * Fetches a specific dessert by ID
 * @param {string} dessertId - The ID of the dessert to fetch
 * @returns {Promise<Object|null>} Dessert data or null if not found
 */
export async function getDessertById(dessertId) {
  try {
    const desserts = await getDesserts();
    return desserts.find(dessert => dessert.id === dessertId) || null;
  } catch (error) {
    console.error(`Error fetching dessert ${dessertId}:`, error);
    return null;
  }
}

/**
 * Calculates platform price for a dessert variant
 * @param {Object} variant - Dessert variant object
 * @param {string} platform - 'doordash', 'ubereats', or 'grubhub'
 * @returns {number} Platform-specific price
 */
export function getPlatformPrice(variant, platform) {
  if (!variant || !variant.platformPricing) return variant?.basePrice || 0;
  return variant.platformPricing[platform] || variant.basePrice;
}

/**
 * Checks if dessert requires thawing
 * @param {Object} dessert - Dessert item object
 * @returns {boolean} True if dessert has thaw time
 */
export function requiresThawing(dessert) {
  return Boolean(dessert?.thawTime);
}

/**
 * Gets desserts by supplier
 * @param {Array} desserts - Array of dessert items
 * @param {string} supplier - Supplier name
 * @returns {Array} Filtered desserts from the supplier
 */
export function getDessertsBySupplier(desserts, supplier) {
  return desserts.filter(d => d.supplier === supplier);
}
