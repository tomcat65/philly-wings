import { db } from '../firebase-config.js';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';

/**
 * Fetches all active salads from Firestore
 * @returns {Promise<Array>} Array of salad items with variants
 */
export async function getSalads() {
  try {
    const saladsRef = collection(db, 'freshSalads');
    const q = query(
      saladsRef,
      where('active', '==', true),
      orderBy('sortOrder')
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching salads:', error);
    return [];
  }
}

/**
 * Fetches a specific salad by ID
 * @param {string} saladId - The ID of the salad to fetch
 * @returns {Promise<Object|null>} Salad data or null if not found
 */
export async function getSaladById(saladId) {
  try {
    const salads = await getSalads();
    return salads.find(salad => salad.id === saladId) || null;
  } catch (error) {
    console.error(`Error fetching salad ${saladId}:`, error);
    return null;
  }
}

/**
 * Gets variants by size
 * @param {Object} salad - Salad item object
 * @param {string} size - 'individual', 'family', or 'platter'
 * @returns {Object|null} Variant for the specified size
 */
export function getVariantBySize(salad, size) {
  if (!salad || !salad.variants) return null;
  return salad.variants.find(v => v.size === size) || null;
}

/**
 * Gets available dressing options for a salad
 * @param {Object} salad - Salad item object
 * @returns {Array} Array of dressing options or empty array
 */
export function getDressingOptions(salad) {
  return salad?.dressingOptions || [];
}

/**
 * Calculates platform price for a salad variant
 * @param {Object} variant - Salad variant object
 * @param {string} platform - 'doordash', 'ubereats', or 'grubhub'
 * @returns {number} Platform-specific price
 */
export function getPlatformPrice(variant, platform) {
  if (!variant || !variant.platformPricing) return variant?.basePrice || 0;
  return variant.platformPricing[platform] || variant.basePrice;
}

/**
 * Gets salads by dietary tag
 * @param {Array} salads - Array of salad items
 * @param {string} tag - Dietary tag ('vegan', 'vegetarian', 'gluten-free')
 * @returns {Array} Filtered salads with the tag
 */
export function getSaladsByDietaryTag(salads, tag) {
  return salads.filter(s => s.dietaryTags?.includes(tag));
}
