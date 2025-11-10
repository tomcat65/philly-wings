/**
 * Add-Ons State Transformer
 *
 * Transforms simple ID→quantity state structure into enriched categorized
 * arrays that the pricing calculator expects.
 *
 * This transformation layer allows us to keep state simple (fast UI updates)
 * while providing rich data for pricing calculations.
 *
 * @module addons-state-transformer
 * @created 2025-11-09
 * @epic SP-013 (Add-Ons Pricing Fix)
 */

import { getAddOnById, getVariantById } from './catering-addons-service.js';
import { formatPackSize } from '../components/catering/shared-addons-ui.js';

/**
 * Transform simple add-ons state to enriched categorized format for pricing
 *
 * Input (simple state):
 *   addOns: { 'addon-id-1': 2, 'addon-id-2': 1 }
 *   variantAddOns: { 'variant-id-1': 3 }
 *
 * Output (enriched for pricing):
 *   {
 *     quickAdds: [{ id, name, quantity, basePrice, category, servings, packSize, quantityLabel }],
 *     hotBeverages: [...],
 *     beverages: [...],
 *     salads: [...],
 *     sides: [...],
 *     desserts: [...],
 *     saucesToGo: [...],
 *     dipsToGo: [...]
 *   }
 *
 * @param {Object} addOns - Regular add-ons (ID → quantity map)
 * @param {Object} variantAddOns - Variant add-ons (variantID → quantity map)
 * @returns {Promise<Object>} Categorized enriched add-ons
 */
export async function transformAddOnsForPricing(addOns = {}, variantAddOns = {}) {
  // Cache lookups within this transformation to avoid duplicates
  const itemCache = new Map();

  // Initialize categorized structure
  const categorized = {
    quickAdds: [],
    hotBeverages: [],
    beverages: [],
    salads: [],
    sides: [],
    desserts: [],
    saucesToGo: [],
    dipsToGo: []
  };

  try {
    // Transform regular add-ons (ID → quantity)
    for (const [addonId, qty] of Object.entries(addOns)) {
      if (qty <= 0) continue; // Skip zero quantities

      // Check cache first
      let item = itemCache.get(addonId);
      if (!item) {
        item = await getAddOnById(addonId);
        if (item) {
          itemCache.set(addonId, item);
        }
      }

      if (!item) {
        console.warn(`[Transformer] Add-on ${addonId} not found, skipping`);
        continue;
      }

      // Map Firestore category to pricing calculator category key
      const categoryKey = mapCategoryKey(item.category);

      // Create enriched item object
      categorized[categoryKey].push({
        id: addonId,
        name: item.name,
        quantity: qty,
        basePrice: item.price || item.basePrice || 0,
        category: item.category,
        servings: item.servings || qty,
        packSize: item.packSize || 'single',
        quantityLabel: item.quantityLabel || 'items'
      });

      console.log(`[Transformer] Enriched regular add-on: ${item.name} (${qty}x) → ${categoryKey}`);
    }

    // Transform variant add-ons (variantID → quantity)
    for (const [variantId, qty] of Object.entries(variantAddOns)) {
      if (qty <= 0) continue; // Skip zero quantities

      // Check cache first
      let variant = itemCache.get(variantId);
      if (!variant) {
        variant = await getVariantById(variantId);
        if (variant) {
          itemCache.set(variantId, variant);
        }
      }

      if (!variant) {
        console.warn(`[Transformer] Variant ${variantId} not found, skipping`);
        continue;
      }

      // Map Firestore category to pricing calculator category key
      const categoryKey = mapCategoryKey(variant.category);

      // Create enriched variant object with formatted name
      const formattedPackSize = formatPackSize(variant.packSize);
      const displayName = `${variant.baseName} (${formattedPackSize})`;

      categorized[categoryKey].push({
        id: variantId,
        name: displayName,
        quantity: qty,
        basePrice: variant.price || 0,
        category: variant.category,
        servings: variant.servings || qty,
        packSize: variant.packSize,
        quantityLabel: 'items'
      });

      console.log(`[Transformer] Enriched variant: ${displayName} (${qty}x) → ${categoryKey}`);
    }

    // Log transformation summary
    const totalItems = Object.values(categorized).reduce((sum, arr) => sum + arr.length, 0);
    const categoriesWithItems = Object.entries(categorized)
      .filter(([_, items]) => items.length > 0)
      .map(([key]) => key);

    console.log(`[Transformer] Transformation complete: ${totalItems} items across ${categoriesWithItems.length} categories`, {
      categories: categoriesWithItems,
      cacheHits: itemCache.size,
      regularAddOns: Object.keys(addOns).length,
      variantAddOns: Object.keys(variantAddOns).length
    });

    return categorized;

  } catch (error) {
    console.error('[Transformer] Transformation failed', {
      error: error.message,
      stack: error.stack
    });
    // Return empty structure on error to prevent pricing calculation from breaking
    return categorized;
  }
}

/**
 * Map Firestore category names to pricing calculator category keys
 *
 * Firestore uses kebab-case (e.g., 'quick-adds', 'hot-beverages')
 * Pricing calculator uses camelCase (e.g., 'quickAdds', 'hotBeverages')
 *
 * @param {string} firestoreCategory - Category from Firestore
 * @returns {string} Pricing calculator category key
 */
function mapCategoryKey(firestoreCategory) {
  const categoryMap = {
    'quick-adds': 'quickAdds',
    'hot-beverages': 'hotBeverages',
    'beverages': 'beverages',
    'salads': 'salads',
    'sides': 'sides',
    'desserts': 'desserts',
    'sauces-to-go': 'saucesToGo',
    'dips-to-go': 'dipsToGo'
  };

  const mapped = categoryMap[firestoreCategory];

  if (!mapped) {
    console.warn(`[Transformer] Unknown category '${firestoreCategory}', defaulting to 'quickAdds'`);
    return 'quickAdds';
  }

  return mapped;
}
