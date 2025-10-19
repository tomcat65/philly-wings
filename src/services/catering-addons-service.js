/**
 * Catering Add-Ons Service
 * Firestore data access for add-ons (vegetarian & desserts)
 * Gate 3 implementation - ready for pairing with codex-philly
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
      orderBy('featured', 'desc'),
      orderBy('basePrice')
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
 * @param {string} category - 'vegetarian' or 'dessert'
 * @returns {Promise<Array>} Filtered add-ons
 */
export async function getAddOnsByCategory(category) {
  try {
    const addOnsRef = collection(db, 'cateringAddOns');
    const q = query(
      addOnsRef,
      where('active', '==', true),
      where('category', '==', category),
      orderBy('featured', 'desc'),
      orderBy('basePrice')
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
 * @returns {Promise<Object>} { vegetarian: [], desserts: [], hotBeverages: [] }
 */
export async function getAddOnsSplitByCategory(tier) {
  const allAddOns = await getAddOnsForTier(tier);

  return {
    vegetarian: allAddOns.filter(addOn => addOn.category === 'vegetarian'),
    desserts: allAddOns.filter(addOn => addOn.category === 'dessert'),
    hotBeverages: allAddOns.filter(addOn => addOn.category === 'hot-beverages')
  };
}
