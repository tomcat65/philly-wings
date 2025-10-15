import { db } from '../firebase-config.js';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';

/**
 * Fetches all active plant-based wing options from Firestore
 * @returns {Promise<Array>} Array of plant-based wing items with variants
 */
export async function getPlantBasedWings() {
  try {
    const wingsRef = collection(db, 'plantBasedWings');
    const q = query(
      wingsRef,
      where('active', '==', true),
      orderBy('sortOrder')
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching plant-based wings:', error);
    return [];
  }
}

/**
 * Fetches a specific plant-based wing by ID
 * @param {string} wingId - The ID of the wing to fetch
 * @returns {Promise<Object|null>} Wing data or null if not found
 */
export async function getPlantBasedWingById(wingId) {
  try {
    const wings = await getPlantBasedWings();
    return wings.find(wing => wing.id === wingId) || null;
  } catch (error) {
    console.error(`Error fetching plant-based wing ${wingId}:`, error);
    return null;
  }
}

/**
 * Gets available variants for a specific prep method
 * @param {Object} wing - Wing item object
 * @param {string} prepMethod - 'fried' or 'baked'
 * @returns {Array} Filtered variants for the prep method
 */
export function getVariantsByPrepMethod(wing, prepMethod) {
  if (!wing || !wing.variants) return [];
  return wing.variants.filter(v => v.prepMethod === prepMethod);
}

/**
 * Gets all available prep methods for a wing
 * @param {Object} wing - Wing item object
 * @returns {Array} Array of unique prep methods
 */
export function getAvailablePrepMethods(wing) {
  if (!wing || !wing.prepMethods) return [];
  return wing.prepMethods;
}

/**
 * Calculates platform price for a variant
 * @param {Object} variant - Wing variant object
 * @param {string} platform - 'doordash', 'ubereats', or 'grubhub'
 * @returns {number} Platform-specific price
 */
export function getPlatformPrice(variant, platform) {
  if (!variant || !variant.platformPricing) return variant?.basePrice || 0;
  return variant.platformPricing[platform] || variant.basePrice;
}
