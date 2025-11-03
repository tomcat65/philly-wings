/**
 * Catering Service - Firestore data access for catering
 */

import { db } from '../firebase-config.js';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';

/**
 * Normalize addon array with image fallbacks
 * @param {Array|Object} field - Raw addon data from Firestore
 * @param {string} category - Addon category (cold-sides, salads, desserts, beverages)
 * @returns {Array} Normalized addons with image fallback chain
 */
function normalizeAddonArray(field, category) {
  const arr = Array.isArray(field) ? field : (field ? Object.values(field) : []);
  return arr.map(item => ({
    ...item,
    // Image fallback chain: specific item → category → default placeholder
    image: item.image || `/images/addons/${category}.webp`,
    fallback: `/images/placeholders/addon-default.webp`
  }));
}

/**
 * Normalize package data to ensure consistent schema
 * Prevents "t is not iterable" errors in Step 5
 * Enhanced with image fallback system for visual richness
 * @param {Object} pkg - Raw package from Firestore
 * @returns {Object} Normalized package with guaranteed array fields and image fallbacks
 */
export function normalizePackageRecord(pkg) {
  return {
    ...pkg,
    isPlantBased: Boolean(pkg.isPlantBased),
    // Force-cast to arrays with image fallbacks
    coldSides: normalizeAddonArray(pkg.coldSides, 'cold-sides'),
    salads: normalizeAddonArray(pkg.salads, 'salads'),
    desserts: normalizeAddonArray(pkg.desserts, 'desserts'),
    beverages: normalizeAddonArray(pkg.beverages, 'beverages'),
    // Package hero image fallback - check both heroImage and imageUrl
    heroImage: pkg.heroImage || pkg.imageUrl || '/images/placeholders/package-default.webp'
  };
}

/**
 * Get all active catering packages
 * @returns {Promise<Array>} Array of catering packages
 */
export async function getCateringPackages() {
  try {
    const packagesRef = collection(db, 'cateringPackages');
    const q = query(
      packagesRef,
      where('active', '==', true),
      orderBy('tier')
    );

    const snapshot = await getDocs(q);
    const packages = snapshot.docs.map(doc =>
      normalizePackageRecord({
        id: doc.id,
        ...doc.data()
      })
    );

    // Sort by basePrice in memory after fetching
    return packages.sort((a, b) => {
      if (a.tier !== b.tier) return a.tier - b.tier;
      return a.basePrice - b.basePrice;
    });
  } catch (error) {
    console.error('Error fetching catering packages:', error);
    throw error;
  }
}

/**
 * Get packages by tier
 * @param {number} tier - Tier number (1, 2, or 3)
 * @returns {Promise<Array>} Packages in that tier
 */
export async function getPackagesByTier(tier) {
  const packages = await getCateringPackages();
  return packages.filter(pkg => pkg.tier === tier);
}

/**
 * Calculate total prep time based on wing type and package size
 * @param {Object} packageData - Package configuration
 * @param {string} wingType - Selected wing type ('bone-in', 'boneless', 'cauliflower', 'mixed')
 * @returns {number} Total prep time in minutes
 */
export function calculateTotalPrepTime(packageData, wingType) {
  const { totalWings } = packageData.wingOptions;

  // Base prep times per wing type (minutes per 10 wings)
  const prepTimes = {
    'bone-in': 2.5,      // Classic wings take longer
    'boneless': 2.0,     // Faster than bone-in
    'cauliflower': 2.2,  // Similar to boneless, slightly longer for crispiness
    'mixed': 2.5         // Use longest time for mixed
  };

  const baseTime = (totalWings / 10) * (prepTimes[wingType] || 2.5);

  // Add sauce application time (1 min per sauce)
  const sauceTime = (packageData.sauceSelections?.max || 0) * 1;

  // Add packaging time (5 min base + 0.5 min per 10 wings)
  const packagingTime = 5 + (totalWings / 10) * 0.5;

  return Math.ceil(baseTime + sauceTime + packagingTime);
}

/**
 * Get required equipment based on wing type selection
 * @param {string} wingType - Selected wing type
 * @param {Object} packageData - Package configuration
 * @returns {Array<string>} Required equipment list
 */
export function getRequiredEquipment(wingType, packageData) {
  const equipment = new Set();

  // Base equipment for all orders
  equipment.add('packaging-station');
  equipment.add('sauce-station');

  // Wing-specific equipment
  switch (wingType) {
    case 'bone-in':
    case 'boneless':
      equipment.add('fryer');
      break;
    case 'cauliflower':
      // Cauliflower can use fryer or impinger oven
      equipment.add('fryer');
      equipment.add('impinger-oven'); // Alternative prep method
      break;
    case 'mixed':
      equipment.add('fryer'); // Mixed uses same fryer
      break;
  }

  // Check if sides require additional equipment
  if (packageData.sides) {
    packageData.sides.forEach(side => {
      if (side.item.toLowerCase().includes('fries')) {
        equipment.add('fryer');
      }
      if (side.item.toLowerCase().includes('mozzarella')) {
        equipment.add('fryer');
      }
    });
  }

  return Array.from(equipment);
}

/**
 * Get daily capacity constraints for cauliflower wings
 * @param {Date} orderDate - Requested delivery date
 * @returns {Object} Capacity info { available: boolean, remaining: number, dailyCap: number }
 */
export function getCauliflowerCapacity(orderDate) {
  // Daily cap for cauliflower wings (from Gate 3 requirements)
  const DAILY_CAP = 500; // pieces per day

  // TODO: Query Firestore for existing cauliflower orders on this date
  // For now, return full capacity
  return {
    available: true,
    remaining: DAILY_CAP,
    dailyCap: DAILY_CAP,
    date: orderDate.toISOString().split('T')[0]
  };
}

/**
 * Get single package by ID
 * @param {string} packageId - Package document ID
 * @returns {Promise<Object|null>} Package data or null (normalized)
 */
export async function getPackageById(packageId) {
  const packages = await getCateringPackages();
  const pkg = packages.find(pkg => pkg.id === packageId) || null;
  return pkg ? normalizePackageRecord(pkg) : null;
}

/**
 * Format price for display
 * Note: We don't show prices on frontend, but this is here for potential future use
 * @param {number} price - Price in dollars
 * @returns {string} Formatted price
 */
export function formatPrice(price) {
  return `$${price.toFixed(2)}`;
}
