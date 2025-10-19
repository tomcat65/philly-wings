/**
 * Catering Add-Ons Service
 * Firestore data access for add-ons with lightweight reference schema
 * Updated for packSize field and new category structure
 */

import { db } from '../firebase-config.js';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';

/**
 * Get all active catering add-ons
 * @returns {Promise<Array>} Array of add-on objects
 */
export async function getCateringAddOns() {
  try {
    const addOnsRef = collection(db, 'cateringAddOns');
    const q = query(
      addOnsRef,
      where('active', '==', true),
      orderBy('category'),
      orderBy('displayOrder')
    );

    const snapshot = await getDocs(q);
    const addOns = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return addOns;
  } catch (error) {
    console.error('Error fetching catering add-ons:', error);
    throw error;
  }
}

/**
 * Get add-ons filtered by category
 * @param {string} category - 'desserts', 'beverages', 'salads', 'sides', 'quick-adds', 'hot-beverages'
 * @returns {Promise<Array>} Filtered add-ons
 */
export async function getAddOnsByCategory(category) {
  try {
    const addOnsRef = collection(db, 'cateringAddOns');
    const q = query(
      addOnsRef,
      where('active', '==', true),
      where('category', '==', category),
      orderBy('displayOrder')
    );

    const snapshot = await getDocs(q);
    const addOns = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return addOns;
  } catch (error) {
    console.error(`Error fetching ${category} add-ons:`, error);
    throw error;
  }
}

/**
 * Get add-ons available for a specific package tier
 * @param {number} tier - Package tier (1, 2, or 3)
 * @returns {Promise<Array>} Add-ons available for this tier
 */
export async function getAddOnsForTier(tier) {
  const allAddOns = await getCateringAddOns();
  return allAddOns.filter(addOn => addOn.availableForTiers.includes(tier));
}

/**
 * Get add-ons by category AND tier
 * @param {string} category - 'vegetarian' or 'dessert'
 * @param {number} tier - Package tier (1, 2, or 3)
 * @returns {Promise<Array>} Filtered add-ons
 */
export async function getAddOnsByCategoryAndTier(category, tier) {
  const categoryAddOns = await getAddOnsByCategory(category);
  return categoryAddOns.filter(addOn => addOn.availableForTiers.includes(tier));
}

/**
 * Get single add-on by ID
 * @param {string} addOnId - Add-on document ID
 * @returns {Promise<Object|null>} Add-on data or null
 */
export async function getAddOnById(addOnId) {
  const allAddOns = await getCateringAddOns();
  return allAddOns.find(addOn => addOn.id === addOnId) || null;
}

/**
 * Get add-ons split into categories for rendering
 * @param {number} tier - Package tier
 * @returns {Promise<Object>} { desserts: [], beverages: [], salads: [], sides: [], quickAdds: [], hotBeverages: [] }
 */
export async function getAddOnsSplitByCategory(tier) {
  const allAddOns = await getAddOnsForTier(tier);

  return {
    desserts: allAddOns.filter(addOn => addOn.category === 'desserts'),
    beverages: allAddOns.filter(addOn => addOn.category === 'beverages'),
    salads: allAddOns.filter(addOn => addOn.category === 'salads'),
    sides: allAddOns.filter(addOn => addOn.category === 'sides'),
    quickAdds: allAddOns.filter(addOn => addOn.category === 'quick-adds'),
    hotBeverages: allAddOns.filter(addOn => addOn.category === 'hot-beverages')
  };
}

/**
 * Get add-ons grouped by packSize within a category
 * @param {string} category - Category to filter by
 * @param {number} tier - Package tier
 * @returns {Promise<Object>} { individual: [], '5pack': [], family: [] }
 */
export async function getAddOnsByPackSize(category, tier) {
  const categoryAddOns = await getAddOnsByCategoryAndTier(category, tier);

  const grouped = {};
  categoryAddOns.forEach(addOn => {
    const packSize = addOn.packSize || 'other';
    if (!grouped[packSize]) grouped[packSize] = [];
    grouped[packSize].push(addOn);
  });

  return grouped;
}
