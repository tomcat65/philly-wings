/**
 * Catering Service - Firestore data access for catering
 */

import { db } from '../firebase-config.js';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';

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
    const packages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

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
 * @returns {Promise<Object|null>} Package data or null
 */
export async function getPackageById(packageId) {
  const packages = await getCateringPackages();
  return packages.find(pkg => pkg.id === packageId) || null;
}

/**
 * Get all 14 signature sauces for display
 * @returns {Array} Sauce information
 */
export function getAllSauces() {
  // Static sauce list matching what we send to ezCater
  return [
    {
      name: "Philly Classic Hot",
      description: "City pride - classic buffalo heat",
      heatLevel: 3,
      category: "philly-signature",
      story: "The original. What put us on the map. Classic buffalo heat with Philly attitude."
    },
    {
      name: "Northeast Hot Lemon",
      description: "Spicy lemon pepper - Oxford Circle style",
      heatLevel: 3,
      category: "philly-signature",
      story: "Named for Oxford Circle, Mayfair, and Frankford where Arleth grew up. Spicy lemon pepper with cayenne kick."
    },
    {
      name: "Broad & Pattison Burn",
      description: "Named for the sports complex",
      heatLevel: 4,
      category: "philly-signature",
      story: "Named for the intersection where the Eagles, Phillies, and Sixers play. Heat that matches game day intensity."
    },
    {
      name: "Frankford Cajun",
      description: "Northeast Philly cajun seasoning",
      heatLevel: 3,
      category: "philly-signature",
      story: "Frankford Avenue meets Louisiana. Northeast Philly's take on cajun spice."
    },
    {
      name: "Gritty's Revenge",
      description: "Flyers mascot - scorpion pepper heat!",
      heatLevel: 5,
      category: "philly-signature",
      story: "Named after the Flyers' chaotic mascot. Scorpion pepper heat that's absolutely unhinged. Not for the weak."
    },
    {
      name: "Honey BBQ",
      description: "Sweet and smoky crowd-pleaser",
      heatLevel: 1,
      category: "classic",
      story: "Sweet, smoky, and always a crowd favorite. Perfect for the team members who like it mild."
    },
    {
      name: "Teriyaki",
      description: "Asian-inspired sweet glaze",
      heatLevel: 1,
      category: "classic",
      story: "Asian-inspired sweetness that balances out the heat lovers on your team."
    },
    {
      name: "Lemon Pepper",
      description: "Zesty citrus seasoning",
      heatLevel: 1,
      category: "classic",
      story: "Bright, zesty, and no heat. For the sauce skeptics who still want flavor."
    },
    {
      name: "Buffalo",
      description: "Classic tangy buffalo sauce",
      heatLevel: 2,
      category: "classic",
      story: "The standard bearer. Classic tangy buffalo that everyone knows and loves."
    },
    {
      name: "Nashville Hot",
      description: "Southern-style cayenne heat",
      heatLevel: 4,
      category: "classic",
      story: "Music City meets the City of Brotherly Love. Southern cayenne heat done right."
    },
    {
      name: "BBQ",
      description: "Traditional smoky barbecue",
      heatLevel: 1,
      category: "classic",
      story: "Traditional smoky barbecue. Simple, reliable, delicious."
    },
    {
      name: "Mild",
      description: "Gentle heat for sensitive palates",
      heatLevel: 1,
      category: "classic",
      story: "For your team members who think ketchup is spicy. We got you."
    },
    {
      name: "Garlic Parmesan",
      description: "Savory garlic butter coating",
      heatLevel: 0,
      category: "classic",
      story: "Savory garlic and parmesan. Zero heat, all flavor. The safe choice."
    },
    {
      name: "Sweet Chili",
      description: "Asian sweet heat",
      heatLevel: 2,
      category: "classic",
      story: "Sweet with a gentle kick. Asian-inspired flavor that finds the middle ground."
    }
  ];
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
