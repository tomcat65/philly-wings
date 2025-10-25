/**
 * Catering Add-Ons Service
 * Firestore data access for add-ons with lightweight reference schema
 * Updated for packSize field and new category structure
 */

import { db } from '../firebase-config.js';
import { collection, getDocs, query, where, orderBy, doc, getDoc } from 'firebase/firestore';

/**
 * Enrich add-ons with runtime pricing from source collections
 * Implements Option A: Pure single source of truth
 * @param {Array} addOns - Array of add-on metadata from cateringAddOns collection
 * @returns {Promise<Array>} Enriched add-ons with current pricing and details
 */
async function enrichAddOnsWithPricing(addOns) {
  // Group add-ons by source collection for batch fetching
  const bySource = {
    desserts: addOns.filter(a => a.sourceCollection === 'desserts'),
    menuItems: addOns.filter(a => a.sourceCollection === 'menuItems'),
    freshSalads: addOns.filter(a => a.sourceCollection === 'freshSalads'),
    coldSides: addOns.filter(a => a.sourceCollection === 'coldSides')
  };

  // Fetch all source documents in parallel
  const sourceData = {
    desserts: {},
    menuItems: {},
    freshSalads: {},
    coldSides: {}
  };

  await Promise.all([
    // Fetch desserts
    ...Array.from(new Set(bySource.desserts.map(a => a.sourceDocumentId))).map(async (docId) => {
      const docRef = doc(db, 'desserts', docId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        sourceData.desserts[docId] = docSnap.data();
      }
    }),

    // Fetch menuItems
    ...Array.from(new Set(bySource.menuItems.map(a => a.sourceDocumentId))).map(async (docId) => {
      const docRef = doc(db, 'menuItems', docId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        sourceData.menuItems[docId] = docSnap.data();
      }
    }),

    // Fetch freshSalads
    ...Array.from(new Set(bySource.freshSalads.map(a => a.sourceDocumentId))).map(async (docId) => {
      const docRef = doc(db, 'freshSalads', docId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        sourceData.freshSalads[docId] = docSnap.data();
      }
    }),

    // Fetch coldSides
    ...Array.from(new Set(bySource.coldSides.map(a => a.sourceDocumentId))).map(async (docId) => {
      const docRef = doc(db, 'coldSides', docId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        sourceData.coldSides[docId] = docSnap.data();
      }
    })
  ]);

  // Enrich each add-on with source data
  return addOns.map(addOn => {
    // Skip enrichment for items without source references (they have direct pricing)
    if (!addOn.sourceCollection || !addOn.sourceDocumentId) {
      return addOn;
    }

    const sourceDoc = sourceData[addOn.sourceCollection]?.[addOn.sourceDocumentId];

    if (!sourceDoc) {
      console.warn(`Missing source document: ${addOn.sourceCollection}/${addOn.sourceDocumentId}`);
      return addOn; // Return as-is if source missing
    }

    // Find the specific variant
    const variant = sourceDoc.variants?.find(v => v.id === addOn.sourceVariantId);

    if (!variant) {
      console.warn(`Missing variant ${addOn.sourceVariantId} in ${addOn.sourceDocumentId}`);
      return addOn; // Return as-is if variant missing
    }

    // Calculate price with pack multiplier
    const multiplier = addOn.quantityMultiplier || 1;
    const basePrice = variant.basePrice || 0;
    const price = basePrice * multiplier;

    // Return enriched add-on
    return {
      ...addOn,
      name: addOn.name || `${sourceDoc.name} (${addOn.packSize})`,
      basePrice: price,
      price: price,
      servings: (variant.servings || 1) * multiplier,
      cupSize: variant.cupSize,
      imageUrl: addOn.imageUrl || sourceDoc.imageUrl,
      allergens: addOn.allergens || sourceDoc.allergens || [],
      dietaryTags: addOn.dietaryTags || sourceDoc.dietaryTags || [],
      description: addOn.description || sourceDoc.description
    };
  });
}

/**
 * Get all active catering add-ons with runtime pricing from source collections
 * @returns {Promise<Array>} Array of enriched add-on objects
 */
export async function getCateringAddOns() {
  try {
    const addOnsRef = collection(db, 'cateringAddOns');
    const q = query(
      addOnsRef,
      where('active', '==', true)
    );

    const snapshot = await getDocs(q);
    const addOns = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Enrich with pricing from source collections
    const enriched = await enrichAddOnsWithPricing(addOns);

    // Sort in memory to avoid composite index requirement
    enriched.sort((a, b) => {
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category);
      }
      return (a.displayOrder || 0) - (b.displayOrder || 0);
    });

    return enriched;
  } catch (error) {
    console.error('Error fetching catering add-ons:', error);
    throw error;
  }
}

/**
 * Get add-ons filtered by category with runtime pricing
 * @param {string} category - 'desserts', 'beverages', 'salads', 'sides', 'quick-adds', 'hot-beverages'
 * @returns {Promise<Array>} Filtered add-ons with current pricing
 */
export async function getAddOnsByCategory(category) {
  try {
    const addOnsRef = collection(db, 'cateringAddOns');
    const q = query(
      addOnsRef,
      where('active', '==', true),
      where('category', '==', category)
    );

    const snapshot = await getDocs(q);
    const addOns = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Enrich with pricing from source collections
    const enriched = await enrichAddOnsWithPricing(addOns);

    // Sort in memory to avoid composite index requirement
    enriched.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

    return enriched;
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
 * Get all add-ons split by category (no tier filtering)
 * Useful for premium services like boxed meals where all add-ons should be available
 * @returns {Promise<Object>} { desserts: [], beverages: [], salads: [], sides: [], quickAdds: [], hotBeverages: [], saucesToGo: [], dipsToGo: [] }
 */
export async function getAllAddOnsSplitByCategory() {
  const [allAddOns, saucesAndDips] = await Promise.all([
    getCateringAddOns(),
    getSaucesAndDipsToGo()
  ]);

  const desserts = allAddOns.filter(addOn => addOn.category === 'desserts');
  const beverages = allAddOns.filter(addOn => addOn.category === 'beverages');

  return {
    desserts: groupItemsByPackVariants(desserts),
    beverages: groupBeveragesByVariants(beverages),
    salads: allAddOns.filter(addOn => addOn.category === 'salads'),
    sides: allAddOns.filter(addOn => addOn.category === 'sides'),
    quickAdds: allAddOns.filter(addOn => addOn.category === 'quick-adds'),
    hotBeverages: groupItemsByPackVariants(allAddOns.filter(addOn => addOn.category === 'hot-beverages')),
    saucesToGo: groupSaucesByVariants(saucesAndDips.saucesToGo),
    dipsToGo: groupDipsByVariants(saucesAndDips.dipsToGo)
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

/**
 * Get wet sauces for to-go ordering (from sauces collection)
 * Returns sauces with both individual and 5-pack options
 * @returns {Promise<Array>} Array of sauce to-go items with pack size variants
 */
export async function getSaucesToGo() {
  try {
    const saucesRef = collection(db, 'sauces');
    const q = query(
      saucesRef,
      where('active', '==', true),
      where('category', '==', 'signature-sauce'),
      where('isDryRub', '==', false)
    );

    const snapshot = await getDocs(q);
    const sauces = [];

    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const basePrice = data.basePrice || 0.85;

      // Individual cup
      sauces.push({
        id: `${data.id}-individual`,
        sourceId: data.id,
        name: `${data.name} (Individual)`,
        displayName: data.name,
        category: 'sauces-to-go',
        packSize: 'individual',
        basePrice: basePrice,
        price: basePrice,
        servings: 1,
        imageUrl: data.imageUrl,
        heatLevel: data.heatLevel || 0,
        allergens: data.allergens || [],
        description: `${data.description} - 1.5oz cup`,
        sortOrder: data.sortOrder || 99
      });

      // 5-pack
      sauces.push({
        id: `${data.id}-5pack`,
        sourceId: data.id,
        name: `${data.name} (5-Pack)`,
        displayName: data.name,
        category: 'sauces-to-go',
        packSize: '5pack',
        basePrice: basePrice * 5,
        price: basePrice * 5,
        servings: 5,
        imageUrl: data.imageUrl,
        heatLevel: data.heatLevel || 0,
        allergens: data.allergens || [],
        description: `${data.description} - 5 x 1.5oz cups`,
        sortOrder: data.sortOrder || 99
      });
    });

    // Sort by original sortOrder, then by packSize (individual before 5pack)
    sauces.sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
      return a.packSize === 'individual' ? -1 : 1;
    });

    return sauces;
  } catch (error) {
    console.error('Error fetching sauces to-go:', error);
    throw error;
  }
}

/**
 * Get dips for to-go ordering (from sauces collection, dipping-sauce category)
 * Returns dips with both individual and 5-pack options
 * @returns {Promise<Array>} Array of dip to-go items with pack size variants
 */
export async function getDipsToGo() {
  try {
    const saucesRef = collection(db, 'sauces');
    const q = query(
      saucesRef,
      where('active', '==', true),
      where('category', '==', 'dipping-sauce')
    );

    const snapshot = await getDocs(q);
    const dips = [];

    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const basePrice = data.basePrice || 0.55;

      // Individual cup
      dips.push({
        id: `${data.id}-individual`,
        sourceId: data.id,
        name: `${data.name} (Individual)`,
        displayName: data.name,
        category: 'dips-to-go',
        packSize: 'individual',
        basePrice: basePrice,
        price: basePrice,
        servings: 1,
        imageUrl: data.imageUrl,
        allergens: data.allergens || [],
        description: `${data.description} - 1.5oz cup`,
        sortOrder: data.sortOrder || 99
      });

      // 5-pack
      dips.push({
        id: `${data.id}-5pack`,
        sourceId: data.id,
        name: `${data.name} (5-Pack)`,
        displayName: data.name,
        category: 'dips-to-go',
        packSize: '5pack',
        basePrice: basePrice * 5,
        price: basePrice * 5,
        servings: 5,
        imageUrl: data.imageUrl,
        allergens: data.allergens || [],
        description: `${data.description} - 5 x 1.5oz cups`,
        sortOrder: data.sortOrder || 99
      });
    });

    // Sort by sortOrder, then by packSize (individual before 5pack)
    dips.sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
      return a.packSize === 'individual' ? -1 : 1;
    });

    return dips;
  } catch (error) {
    console.error('Error fetching dips to-go:', error);
    throw error;
  }
}

/**
 * Get all sauces and dips to-go combined
 * @returns {Promise<Object>} { saucesToGo: [], dipsToGo: [] }
 */
export async function getSaucesAndDipsToGo() {
  try {
    const [saucesToGo, dipsToGo] = await Promise.all([
      getSaucesToGo(),
      getDipsToGo()
    ]);

    return {
      saucesToGo,
      dipsToGo
    };
  } catch (error) {
    console.error('Error fetching sauces and dips to-go:', error);
    throw error;
  }
}

/**
 * Group sauces by sourceId into pack variant objects
 * @param {Array} sauces - Array of sauce items with individual/5pack variants
 * @returns {Array} Array of grouped sauce objects with variants
 */
function groupSaucesByVariants(sauces) {
  const grouped = {};

  sauces.forEach(sauce => {
    const sourceId = sauce.sourceId;
    if (!grouped[sourceId]) {
      grouped[sourceId] = {
        sourceId: sourceId,
        displayName: sauce.displayName,
        description: sauce.description,
        imageUrl: sauce.imageUrl,
        heatLevel: sauce.heatLevel,
        allergens: sauce.allergens,
        category: 'sauces-to-go',
        hasVariants: true,
        variants: {}
      };
    }

    // Add variant (individual or 5pack)
    grouped[sourceId].variants[sauce.packSize] = {
      id: sauce.id,
      price: sauce.price,
      servings: sauce.servings,
      packSize: sauce.packSize
    };
  });

  return Object.values(grouped);
}

/**
 * Group dips by sourceId into pack variant objects
 * @param {Array} dips - Array of dip items with individual/5pack variants
 * @returns {Array} Array of grouped dip objects with variants
 */
function groupDipsByVariants(dips) {
  const grouped = {};

  dips.forEach(dip => {
    const sourceId = dip.sourceId;
    if (!grouped[sourceId]) {
      grouped[sourceId] = {
        sourceId: sourceId,
        displayName: dip.displayName,
        description: dip.description,
        imageUrl: dip.imageUrl,
        allergens: dip.allergens,
        category: 'dips-to-go',
        hasVariants: true,
        variants: {}
      };
    }

    // Add variant (individual or 5pack)
    grouped[sourceId].variants[dip.packSize] = {
      id: dip.id,
      price: dip.price,
      servings: dip.servings,
      packSize: dip.packSize
    };
  });

  return Object.values(grouped);
}

/**
 * Group beverages by sourceDocumentId AND packSize into variant objects
 * Creates separate cards for each pack size (96oz, 3gal) with their own images
 * Each card shows flavorVariant options (sweet/unsweet)
 * @param {Array} beverages - Array of beverage items from cateringAddOns
 * @returns {Array} Array of grouped beverage objects with flavor variants
 */
function groupBeveragesByVariants(beverages) {
  const grouped = {};
  const singles = [];

  beverages.forEach(item => {
    if (item.sourceDocumentId && item.flavorVariant && item.packSize) {
      // Group by source + pack size to create separate cards for each size
      const groupingKey = `${item.sourceDocumentId}-${item.packSize}`;

      if (!grouped[groupingKey]) {
        // Extract base name and add pack size
        const baseName = item.name ? item.name.replace(/\s*\(.*?\)\s*/g, '').trim() : 'Boxed Iced Tea';
        const displayName = `${baseName} (${item.packSize})`;

        grouped[groupingKey] = {
          sourceId: item.sourceDocumentId,
          packSize: item.packSize,
          displayName: displayName,
          name: displayName,
          description: item.description,
          imageUrl: item.imageUrl, // Each pack size has its own image
          category: item.category,
          hasVariants: true,
          variants: {}
        };
      }

      // Variant key is just the flavor (sweet/unsweet)
      const variantKey = item.flavorVariant;

      // Add flavor variant
      grouped[groupingKey].variants[variantKey] = {
        id: item.id,
        price: item.price,
        servings: item.servings || 1,
        cupSize: item.cupSize,
        flavorVariant: item.flavorVariant,
        variantLabel: item.flavorVariant.charAt(0).toUpperCase() + item.flavorVariant.slice(1)
      };
    } else {
      // No variants - single item
      singles.push(item);
    }
  });

  return [...Object.values(grouped), ...singles];
}

/**
 * Group desserts or other items by sourceDocumentId into pack variant objects
 * Uses sourceDocumentId for reliable grouping (handles singular/plural name variations)
 * @param {Array} items - Array of items from cateringAddOns
 * @returns {Array} Array of items (grouped if they have packSize variants)
 */
function groupItemsByPackVariants(items) {
  const grouped = {};
  const singles = [];

  items.forEach(item => {
    if (item.packSize && item.sourceDocumentId) {
      // Use sourceDocumentId as grouping key (more reliable than name parsing)
      const groupingKey = item.sourceDocumentId;

      if (!grouped[groupingKey]) {
        // Extract display name by removing parentheses
        const displayName = item.name.replace(/\s*\(.*?\)\s*/g, '').trim();

        grouped[groupingKey] = {
          sourceId: item.sourceDocumentId,
          displayName: displayName,
          name: displayName,
          description: item.description,
          imageUrl: item.imageUrl,
          category: item.category,
          hasVariants: true,
          variants: {}
        };
      } else {
        // Update display name if current variant has longer name (prefer plural forms)
        const currentDisplayName = item.name.replace(/\s*\(.*?\)\s*/g, '').trim();
        if (currentDisplayName.length > grouped[groupingKey].displayName.length) {
          grouped[groupingKey].displayName = currentDisplayName;
          grouped[groupingKey].name = currentDisplayName;
        }
      }

      // Add variant
      grouped[groupingKey].variants[item.packSize] = {
        id: item.id,
        price: item.price,
        servings: item.servings || 1,
        cupSize: item.cupSize,
        packSize: item.packSize
      };
    } else if (item.packSize) {
      // Has pack size but no sourceDocumentId - treat as single item
      singles.push(item);
    } else {
      // No pack size - single item
      singles.push(item);
    }
  });

  return [...Object.values(grouped), ...singles];
}
