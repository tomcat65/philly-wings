/**
 * Package Data Transformer Service
 *
 * Transforms production cateringPackages format → component-ready format
 * Handles schema mismatches between human-readable package data and machine-readable component needs
 *
 * Problem: Production uses "Family Coleslaw" strings, components need { id: "sally_sherman_coleslaw", size: "family" }
 * Solution: Dynamic mapping built from actual Firestore collections with fuzzy matching fallbacks
 *
 * Created: 2025-11-05
 * Story: SP-010 (Sides Selector - Preset Loading)
 */

import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase-config.js';

class PackageDataTransformer {
  constructor() {
    this.sidesMapping = null;
    this.pricingCache = null; // Cache for basePrice, servings from Firestore
    this.initialized = false;
    this.initPromise = null; // Store the initialization promise
  }

  /**
   * Initialize transformer by building mappings from Firestore
   * Call this once at app startup
   * @returns {Promise} The initialization promise
   */
  async initialize() {
    if (this.initialized) {
      console.log('📦 Package transformer already initialized');
      return;
    }

    // If initialization is in progress, return the existing promise
    if (this.initPromise) {
      console.log('📦 Reusing existing initialization promise');
      return this.initPromise;
    }

    console.log('📦 Initializing package data transformer...');

    // Store the initialization promise so concurrent calls can await it
    this.initPromise = this._doInitialize();
    return this.initPromise;
  }

  /**
   * Internal initialization implementation
   * @private
   */
  async _doInitialize() {
    try {
      // Initialize pricing cache structure
      this.pricingCache = {
        chips: null,
        coldSides: {},
        salads: {},
        desserts: {}
      };

      // Fetch chips pricing first
      const chipsPricing = await this.fetchChipsPricing();
      this.pricingCache.chips = chipsPricing;

      // Build sides mapping (also populates pricing cache)
      this.sidesMapping = await this.buildSidesMapping();

      // Build desserts cache
      await this.buildDessertsCache();

      this.initialized = true;
      console.log('✅ Package transformer initialized with', Object.keys(this.sidesMapping).length, 'side mappings');
      console.log('💰 Pricing cache loaded:', {
        chips: this.pricingCache.chips ? `$${this.pricingCache.chips.toFixed(2)}` : 'N/A',
        coldSides: Object.keys(this.pricingCache.coldSides).length + ' variants',
        salads: Object.keys(this.pricingCache.salads).length + ' variants',
        desserts: Object.keys(this.pricingCache.desserts).length + ' variants'
      });
    } catch (error) {
      console.error('❌ Failed to initialize package transformer:', error);
      this.sidesMapping = {}; // Fallback to empty mapping
      this.pricingCache = { chips: 10.58, coldSides: {}, salads: {}, desserts: {} }; // Fallback pricing
      this.initialized = true; // Still mark as initialized to prevent retry loops
    }
  }

  /**
   * Build dynamic mapping from Firestore collections
   * Maps human-readable names → { id, size }
   * Also caches pricing data from variants
   */
  async buildSidesMapping() {
    const mapping = {};

    // Fetch all cold sides and salads
    const [coldSides, salads] = await Promise.all([
      this.fetchColdSides(),
      this.fetchFreshSalads()
    ]);

    // Build mappings for cold sides AND cache pricing
    coldSides.forEach(side => {
      side.variants?.forEach(variant => {
        // Production schema: variant has 'size' field (regular/large/family) and 'id'
        // Generate keys using both variant.name and size-based patterns
        const keys = this.generateMappingKeys(variant.name, side.name, variant.size);

        keys.forEach(key => {
          mapping[key] = { id: side.id, size: variant.id, type: 'coldSide' };
        });

        // Cache pricing data: key = "sideId_variantId" → { basePrice, servings, name }
        const pricingKey = `${side.id}_${variant.id}`;
        this.pricingCache.coldSides[pricingKey] = {
          basePrice: variant.basePrice || 0,
          servings: variant.servings || 0,
          name: variant.name || side.name
        };
        console.log('💰 Cached cold side pricing:', {
          key: pricingKey,
          sideId: side.id,
          variantId: variant.id,
          basePrice: variant.basePrice || 0,
          name: variant.name || side.name
        });
      });
    });

    // Build mappings for salads AND cache pricing
    salads.forEach(salad => {
      salad.variants?.forEach(variant => {
        const keys = this.generateMappingKeys(variant.name, salad.name, variant.size);

        keys.forEach(key => {
          mapping[key] = { id: salad.id, size: variant.id, type: 'salad' };
        });

        // Cache pricing data
        const pricingKey = `${salad.id}_${variant.id}`;
        this.pricingCache.salads[pricingKey] = {
          basePrice: variant.basePrice || 0,
          servings: variant.servings || 0,
          name: variant.name || salad.name
        };
        console.log('💰 Cached salad pricing:', {
          key: pricingKey,
          saladId: salad.id,
          variantId: variant.id,
          basePrice: variant.basePrice || 0,
          name: variant.name || salad.name
        });
      });
    });

    return mapping;
  }

  /**
   * Generate multiple mapping key variations for fuzzy matching
   * Handles production schema: variants have 'size' field (regular/large/family)
   * Package data uses descriptive names like "Family Coleslaw" or "Large Veggie Sticks Tray"
   *
   * Example: variantName="Coleslaw (Family Size)", itemName="Sally Sherman Classic Coleslaw", size="family"
   * Generates:
   *   - "Coleslaw (Family Size)" (exact variant name)
   *   - "Family Sally Sherman Classic Coleslaw" (size + full item name)
   *   - "Family Coleslaw" (size + simplified item)
   *   - All lowercase versions
   */
  generateMappingKeys(variantName, itemName, size) {
    const keys = [];

    // Add exact variant name
    keys.push(variantName);
    keys.push(variantName.toLowerCase());

    // If size is provided, generate size-based keys
    // This maps package format "Family Coleslaw" to actual product
    if (size) {
      // Capitalize size for package format ("family" → "Family")
      const capitalizedSize = size.charAt(0).toUpperCase() + size.slice(1);

      // Full name: "Family" + "Sally Sherman Classic Coleslaw"
      const sizeFullName = `${capitalizedSize} ${itemName}`;
      keys.push(sizeFullName);
      keys.push(sizeFullName.toLowerCase());

      // Simplified: "Family" + "Coleslaw"
      const simplifiedItem = this.simplifyItemName(itemName);
      if (simplifiedItem !== itemName) {
        const sizeSimpleName = `${capitalizedSize} ${simplifiedItem}`;
        keys.push(sizeSimpleName);
        keys.push(sizeSimpleName.toLowerCase());
      }

      // Also try: "Large" + "Veggie Sticks Tray" where itemName is "Celery & Carrot Sticks"
      // Generate alias based on simplified name
      if (simplifiedItem === 'Celery & Carrot Sticks' || simplifiedItem === 'Celery &amp; Carrot Sticks') {
        const veggieTrayAlias = `${capitalizedSize} Veggie Sticks Tray`;
        keys.push(veggieTrayAlias);
        keys.push(veggieTrayAlias.toLowerCase());
      }
    }

    return keys;
  }

  /**
   * Simplify item name by extracting key identifier
   * "Sally Sherman Classic Coleslaw" → "Coleslaw"
   * "Spring Mix Salad" → "Spring Mix Salad" (keep as is)
   */
  simplifyItemName(name) {
    // Common patterns to remove
    const patterns = [
      /^Sally Sherman (Classic )?/i,
      /^Restaurant Depot /i,
      /^Fresh Produce /i
    ];

    let simplified = name;
    patterns.forEach(pattern => {
      simplified = simplified.replace(pattern, '');
    });

    return simplified.trim();
  }

  /**
   * Transform complete package data to component-ready format
   * Automatically waits for initialization if not ready
   * @param {Object} packageObj - Package object from Firestore
   * @returns {Promise<Object>} Transformed package data
   */
  async transformPackage(packageObj) {
    // Wait for initialization if needed
    if (!this.initialized && this.initPromise) {
      console.log('⏳ Waiting for transformer initialization before transforming...');
      await this.initPromise;
    }

    if (!this.initialized) {
      console.warn('⚠️ Transformer not initialized, returning empty sides');
      return {
        chips: null,
        coldSides: [],
        salads: [],
        dips: null
      };
    }

    return {
      chips: this.transformChips(packageObj.chips, packageObj),
      coldSides: this.transformColdSides(packageObj.coldSides, packageObj),
      salads: this.transformSalads(packageObj.salads, packageObj),
      dips: this.transformDips(packageObj.dips)
    };
  }

  /**
   * Transform chips data with pricing and included quantity
   * @param {Object} chipsData - Chips data from package
   * @param {Object} packageObj - Full package object (for reference)
   * @returns {Object} Enhanced chips object with pricing fields
   */
  transformChips(chipsData, packageObj) {
    if (!chipsData) return null;

    const includedQuantity = chipsData.fivePacksIncluded || 0;
    const unitPrice = this.pricingCache?.chips || 10.58; // Fallback to $10.58

    return {
      id: 'miss_vickies_chips',
      quantity: includedQuantity, // Initialize with included quantity
      includedQuantity,
      unitPrice,
      displayName: "Miss Vickie's Chips 5-Pack",
      totalBags: chipsData.totalBags || (includedQuantity * 5) || 0
    };
  }

  /**
   * Transform cold sides array with pricing and included quantities
   * @param {Array} coldSidesArray - Cold sides array from package
   * @param {Object} packageObj - Full package object
   * @returns {Array} Enhanced cold sides with pricing fields
   */
  transformColdSides(coldSidesArray, packageObj) {
    if (!Array.isArray(coldSidesArray)) return [];

    return coldSidesArray.map(item => {
      const mapped = this.findMapping(item.item);

      if (!mapped || mapped.type !== 'coldSide') {
        console.warn(`⚠️ Could not map cold side: "${item.item}"`);
        return null;
      }

      // Get pricing from cache
      const pricing = this.getPriceForVariant(mapped.id, mapped.size, 'coldSide');

      // Get included quantity from package
      const includedQuantity = item.quantity || 0;

      const unitPrice = pricing?.basePrice || 0;
      if (unitPrice === 0) {
        console.warn('⚠️ Cold side has unitPrice = 0:', {
          itemName: item.item,
          mappedId: mapped.id,
          mappedSize: mapped.size,
          pricingFound: !!pricing,
          pricingData: pricing
        });
      }

      return {
        id: mapped.id,
        size: mapped.size,
        quantity: includedQuantity, // Initialize with included quantity
        includedQuantity,
        unitPrice,
        displayName: item.item, // Use package's customer-facing name
        servings: pricing?.servings || 0
      };
    }).filter(Boolean); // Remove nulls
  }

  /**
   * Transform salads array with pricing and included quantities
   * @param {Array} saladsArray - Salads array from package
   * @param {Object} packageObj - Full package object
   * @returns {Array} Enhanced salads with pricing fields
   */
  transformSalads(saladsArray, packageObj) {
    if (!Array.isArray(saladsArray)) return [];

    return saladsArray.map(item => {
      const mapped = this.findMapping(item.item);

      if (!mapped || mapped.type !== 'salad') {
        console.warn(`⚠️ Could not map salad: "${item.item}"`);
        return null;
      }

      // Get pricing from cache
      const pricing = this.getPriceForVariant(mapped.id, mapped.size, 'salad');

      // Get included quantity from package
      const includedQuantity = item.quantity || 0;

      const unitPrice = pricing?.basePrice || 0;
      if (unitPrice === 0) {
        console.warn('⚠️ Salad has unitPrice = 0:', {
          itemName: item.item,
          mappedId: mapped.id,
          mappedSize: mapped.size,
          pricingFound: !!pricing,
          pricingData: pricing
        });
      }

      return {
        id: mapped.id,
        size: mapped.size,
        quantity: includedQuantity, // Initialize with included quantity
        includedQuantity,
        unitPrice,
        displayName: item.item, // Use package's customer-facing name
        servings: pricing?.servings || 0
      };
    }).filter(Boolean);
  }

  /**
   * Transform dips data (for future use)
   */
  transformDips(dipsData) {
    if (!dipsData) return [];

    // For now, just return structure indicating included dips
    // Component will handle actual dip selection
    return {
      fivePacksIncluded: dipsData.fivePacksIncluded || 0,
      totalContainers: dipsData.totalContainers || (dipsData.fivePacksIncluded * 5) || 0
    };
  }

  /**
   * Get pricing for a specific variant from cache
   * @param {string} id - Item ID (e.g., 'sally_sherman_coleslaw')
   * @param {string} size - Variant ID (e.g., 'coleslaw_family')
   * @param {string} type - Type: 'coldSide' or 'salad'
   * @returns {Object} { basePrice, servings, name }
   */
  getPriceForVariant(id, size, type) {
    if (!this.pricingCache) {
      console.warn('⚠️ Pricing cache not initialized');
      return null;
    }

    const pricingKey = `${id}_${size}`;
    const cache = type === 'salad' ? this.pricingCache.salads : this.pricingCache.coldSides;

    console.log('🔍 Looking up pricing:', {
      pricingKey,
      type,
      id,
      size,
      cacheSize: Object.keys(cache).length,
      found: !!cache[pricingKey]
    });

    const result = cache[pricingKey] || null;

    if (!result) {
      const availableKeys = Object.keys(cache).slice(0, 10);
      console.warn('⚠️ Pricing not found for:', {
        lookupKey: pricingKey,
        type,
        availableKeys: availableKeys.length > 0 ? availableKeys : 'none',
        totalCached: Object.keys(cache).length
      });
    } else {
      console.log('✅ Pricing found:', {
        key: pricingKey,
        basePrice: result.basePrice,
        servings: result.servings
      });
    }

    return result;
  }

  /**
   * Get included quantity for an item from package data
   * Uses reverse mapping: finds which package item corresponds to this id+size
   * @param {Array} packageArray - Array from package (e.g., packageObj.coldSides)
   * @param {string} id - Item ID (e.g., 'sally_sherman_coleslaw')
   * @param {string} size - Variant ID (e.g., 'coleslaw_family')
   * @returns {number} Included quantity from package
   */
  getIncludedQuantity(packageArray, id, size) {
    if (!Array.isArray(packageArray)) return 0;

    // Try to find matching package item using reverse mapping
    for (const pkgItem of packageArray) {
      const mapped = this.findMapping(pkgItem.item);
      if (mapped && mapped.id === id && mapped.size === size) {
        return pkgItem.quantity || 0;
      }
    }

    return 0; // Not included in package
  }

  /**
   * Find mapping with fuzzy matching fallbacks
   */
  findMapping(itemName) {
    if (!this.sidesMapping || !itemName) return null;

    // Try exact match
    if (this.sidesMapping[itemName]) {
      return this.sidesMapping[itemName];
    }

    // Try case-insensitive match
    const lowerItemName = itemName.toLowerCase();
    if (this.sidesMapping[lowerItemName]) {
      return this.sidesMapping[lowerItemName];
    }

    // Try partial match (check if any key contains the search term)
    const partialMatch = Object.keys(this.sidesMapping).find(key =>
      key.toLowerCase().includes(lowerItemName) ||
      lowerItemName.includes(key.toLowerCase())
    );

    if (partialMatch) {
      console.log(`📍 Found partial match for "${itemName}" → "${partialMatch}"`);
      return this.sidesMapping[partialMatch];
    }

    return null;
  }

  /**
   * Fetch chips pricing from cateringAddOns collection
   * Source data is in menuItems, but catering-specific pricing is in cateringAddOns
   * If basePrice is 0, follows sourceCollection/sourceDocumentId/sourceVariantId references
   * @returns {Promise<number>} Base price for chips 5-pack
   */
  async fetchChipsPricing() {
    try {
      // Query cateringAddOns by id field (not document ID)
      const q = query(
        collection(db, 'cateringAddOns'),
        where('id', '==', 'chips-5pack'),
        where('active', '==', true)
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const chipsDoc = snapshot.docs[0].data();
        let basePrice = chipsDoc.basePrice;

        // If basePrice is 0, follow source reference to get actual price
        if (basePrice === 0 && chipsDoc.sourceCollection && chipsDoc.sourceDocumentId) {
          console.log('🔍 Chips basePrice is 0, following source reference...', {
            sourceCollection: chipsDoc.sourceCollection,
            sourceDocumentId: chipsDoc.sourceDocumentId,
            sourceVariantId: chipsDoc.sourceVariantId
          });

          try {
            // Fetch from source collection
            const sourceDocRef = doc(db, chipsDoc.sourceCollection, chipsDoc.sourceDocumentId);
            const sourceDocSnap = await getDoc(sourceDocRef);

            if (sourceDocSnap.exists()) {
              const sourceData = sourceDocSnap.data();

              // If sourceVariantId specified, look in variants array
              if (chipsDoc.sourceVariantId && sourceData.variants) {
                // Try multiple variant ID patterns (sourceVariantId might not match actual variant.id)
                const variant = sourceData.variants.find(
                  v => v.id === chipsDoc.sourceVariantId || 
                       v.id === 'five-pack' || 
                       v.id === 'chips_single' ||
                       (v.name && v.name.toLowerCase().includes('5-pack'))
                );

                if (variant) {
                  // Try basePrice first, then price field (seed data might use 'price' instead of 'basePrice')
                  const variantPrice = variant.basePrice || variant.price;
                  if (variantPrice && variantPrice > 0) {
                    basePrice = variantPrice;
                    console.log('✅ Chips pricing loaded from source variant:', {
                      variantId: variant.id,
                      variantName: variant.name,
                      basePrice: `$${basePrice.toFixed(2)} per 5-pack`
                    });
                  } else {
                    console.warn('⚠️ Variant found but has no price:', {
                      variantId: variant.id,
                      variantName: variant.name,
                      variantData: variant
                    });
                  }
                } else {
                  // Try to find any variant with basePrice > 0 (fallback)
                  const pricedVariant = sourceData.variants.find(
                    v => (v.basePrice && v.basePrice > 0) || (v.price && v.price > 0)
                  );
                  if (pricedVariant) {
                    basePrice = pricedVariant.basePrice || pricedVariant.price;
                    console.log('✅ Chips pricing loaded from first priced variant:', {
                      variantId: pricedVariant.id,
                      variantName: pricedVariant.name,
                      basePrice: `$${basePrice.toFixed(2)} per 5-pack`
                    });
                  } else {
                    console.warn('⚠️ No priced variants found in source document:', {
                      sourceVariantId: chipsDoc.sourceVariantId,
                      availableVariants: sourceData.variants.map(v => ({
                        id: v.id,
                        name: v.name,
                        basePrice: v.basePrice,
                        price: v.price
                      }))
                    });
                  }
                }
              } else if (sourceData.basePrice) {
                // Fallback to document-level basePrice
                basePrice = sourceData.basePrice;
                console.log('✅ Chips pricing loaded from source document:', `$${basePrice.toFixed(2)} per 5-pack`);
              } else {
                console.warn('⚠️ Source document has no variants or basePrice:', {
                  hasVariants: !!sourceData.variants,
                  variantCount: sourceData.variants?.length || 0,
                  hasBasePrice: !!sourceData.basePrice
                });
              }
            }
          } catch (sourceError) {
            console.warn('⚠️ Error fetching chips pricing from source:', sourceError);
            // Continue with basePrice = 0, will use fallback below
          }
        }

        // If we still have a valid price, return it
        if (basePrice && basePrice > 0) {
          console.log('💰 Chips pricing loaded:', `$${basePrice.toFixed(2)} per 5-pack`);
          return basePrice;
        }

        // If basePrice is still 0, use fallback
        console.warn('⚠️ Chips basePrice is 0 after source lookup, using fallback');
        return 10.58; // Fallback price
      }

      console.warn('⚠️ Chips pricing not found in cateringAddOns, using fallback');
      return 10.58; // Fallback price
    } catch (error) {
      console.error('❌ Error fetching chips pricing from cateringAddOns:', error);
      return 10.58; // Fallback price
    }
  }

  /**
   * Fetch cold sides from Firestore
   */
  async fetchColdSides() {
    try {
      const q = query(
        collection(db, 'coldSides'),
        where('active', '==', true)
        // Note: orderBy removed to avoid composite index requirement in production
        // Sorting handled in-memory instead
      );
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort in memory by sortOrder
      return items.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    } catch (error) {
      console.error('Error fetching cold sides:', error);
      return [];
    }
  }

  /**
   * Fetch fresh salads from Firestore
   */
  async fetchFreshSalads() {
    try {
      const q = query(
        collection(db, 'freshSalads'),
        where('active', '==', true)
        // Note: orderBy removed to avoid composite index requirement in production
        // Sorting handled in-memory instead
      );
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort in memory by sortOrder
      return items.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    } catch (error) {
      console.error('Error fetching fresh salads:', error);
      return [];
    }
  }

  /**
   * Fetch desserts from Firestore
   */
  async fetchDesserts() {
    try {
      const q = query(
        collection(db, 'desserts'),
        where('active', '==', true)
        // Note: orderBy removed to avoid composite index requirement in production
        // Sorting handled in-memory instead
      );
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort in memory by sortOrder
      return items.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    } catch (error) {
      console.error('Error fetching desserts:', error);
      return [];
    }
  }

  /**
   * Build desserts pricing cache
   * Caches 5-pack variant pricing for each dessert
   */
  async buildDessertsCache() {
    try {
      const desserts = await this.fetchDesserts();

      desserts.forEach(dessert => {
        dessert.variants?.forEach(variant => {
          // Cache all variants, but prioritize 5-pack
          const pricingKey = `${dessert.id}_${variant.id}`;
          this.pricingCache.desserts[pricingKey] = {
            basePrice: variant.basePrice || 0,
            servings: variant.servings || 0,
            size: variant.size || variant.unit || 'unknown',
            name: variant.name || dessert.name
          };

          console.log('💰 Cached dessert pricing:', {
            key: pricingKey,
            dessertId: dessert.id,
            variantId: variant.id,
            size: variant.size || variant.unit,
            basePrice: variant.basePrice || 0,
            servings: variant.servings || 0
          });
        });
      });

      console.log('✅ Desserts cache built:', Object.keys(this.pricingCache.desserts).length, 'variants');
    } catch (error) {
      console.error('❌ Failed to build desserts cache:', error);
    }
  }

  /**
   * Get dessert pricing by ID and variant
   * @param {string} dessertId - Dessert document ID
   * @param {string} variantId - Variant ID (e.g., '5-pack' or 'individual')
   * @returns {Object|null} - {basePrice, servings, size, name} or null
   */
  getDessertPricing(dessertId, variantId) {
    const pricingKey = `${dessertId}_${variantId}`;
    const result = this.pricingCache.desserts?.[pricingKey] || null;

    if (!result) {
      console.warn('⚠️ Dessert pricing not found for:', {
        lookupKey: pricingKey,
        dessertId,
        variantId,
        availableKeys: Object.keys(this.pricingCache.desserts || {}).slice(0, 10)
      });
    }

    return result;
  }

  /**
   * Get mapping info for debugging
   */
  getMappingInfo() {
    if (!this.initialized) {
      return { initialized: false, mappings: 0 };
    }

    return {
      initialized: true,
      mappings: Object.keys(this.sidesMapping).length,
      sampleMappings: Object.keys(this.sidesMapping).slice(0, 5)
    };
  }
}

// Export singleton instance
export const packageTransformer = new PackageDataTransformer();

// Export class for testing
export { PackageDataTransformer };
