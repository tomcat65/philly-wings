/**
 * ROLLBACK: Restore Hot Beverages to Original State
 * Reverts Phase 1 & 2 changes if migration causes issues
 *
 * This restores cateringAddOns to direct pricing (no references)
 * and optionally deletes menuItems documents
 */

const admin = require('firebase-admin');
const serviceAccountPath = '/home/tomcat65/projects/docs/Phillywingsexpress/philly-wings-firebase-adminsdk-fbsvc-b9a46d307f.json';

admin.initializeApp({
  credential: admin.credential.cert(require(serviceAccountPath))
});

const db = admin.firestore();

// Original cateringAddOns state (before migration)
const originalState = {
  'Uz9CQ6MLxCSvEI9oc1hC': {
    id: "lavazza-coffee-96oz",
    name: "Premium Lavazza Coffee (96oz)",
    category: "hot-beverages",
    displayOrder: 10,
    active: true,
    servings: 12,
    servingSize: "8oz cup",
    description: "Premium Lavazza Italian Coffee - Italy's #1 since 1895. Rich hazelnut & brown sugar notes. Freshly ground for each order. Includes cups, lids, cream & sugar.",
    marketingHook: "The same authentic Italian coffee served in upscale cafés",
    specifications: {
      brand: "Lavazza Super Crema",
      origin: "Italy",
      established: "1895",
      volume: "96oz",
      servings: 12,
      servingSize: "8oz",
      staysHot: "2+ hours",
      includes: ["8oz cups", "lids", "sleeves", "sugar packets", "creamer", "stirrers"]
    },
    allergens: ["dairy"],
    dietaryTags: ["vegan-available"],
    nutritionPerServing: {
      servingSize: "8 fl oz",
      calories: 5,
      note: "Black coffee only. Add-ins (cream, sugar) increase calories."
    },
    temperatureGuidelines: {
      safeHoldingTemp: 135,
      optimalServing: "165-180°F",
      maxSafeTime: 4,
      warningThreshold: 90,
      guarantee: "Delivered in insulated cambros - stays hot 2+ hours"
    },
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fcatering%2Fhot-beverages%2Fhot-bev-96oz.webp?alt=media",
    availableForTiers: [1, 2, 3],
    platformPricing: { ezcater: 128.39 },
    basePrice: 106.99,
    packSize: "96oz"
  },

  'YoVyh67mpczUhkMkVrOw': {
    id: "ghirardelli-hot-chocolate-96oz",
    name: "Premium Ghirardelli Hot Chocolate (96oz)",
    category: "hot-beverages",
    displayOrder: 12,
    active: true,
    servings: 12,
    servingSize: "8oz cup",
    description: "Premium Ghirardelli Hot Chocolate - San Francisco's finest since 1852. Rich, velvety Dutch cocoa. Includes cups, marshmallows & stirrers.",
    marketingHook: "Not powder - real chocolate. Perfect for meetings, events & gatherings.",
    specifications: {
      brand: "Ghirardelli Premium Cocoa",
      origin: "San Francisco, USA",
      established: "1852",
      volume: "96oz",
      servings: 12,
      servingSize: "8oz",
      staysHot: "2+ hours",
      includes: ["8oz cups", "lids", "sleeves", "marshmallows", "stirrers"]
    },
    allergens: ["dairy", "soy"],
    dietaryTags: ["vegetarian"],
    nutritionPerServing: {
      servingSize: "8 fl oz",
      calories: 180,
      note: "Estimated. Contains milk and cocoa. Final nutrition data pending supplier confirmation."
    },
    temperatureGuidelines: {
      safeHoldingTemp: 135,
      optimalServing: "165-180°F",
      maxSafeTime: 4,
      warningThreshold: 90,
      guarantee: "Delivered in insulated cambros - stays hot 2+ hours"
    },
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fcatering%2Fhot-beverages%2Fhot-bev-96oz.webp?alt=media",
    availableForTiers: [1, 2, 3],
    platformPricing: { ezcater: 143.99 },
    basePrice: 119.99,
    packSize: "96oz"
  },

  'oqnRWB0Yn1sxmHlXq1iu': {
    id: "lavazza-coffee-128oz",
    name: "Premium Lavazza Coffee (128oz)",
    category: "hot-beverages",
    displayOrder: 11,
    active: true,
    servings: 16,
    servingSize: "8oz cup",
    description: "Premium Lavazza Italian Coffee - Italy's #1 since 1895. Rich hazelnut & brown sugar notes. Freshly ground for each order. Includes cups, lids, cream & sugar.",
    marketingHook: "The same authentic Italian coffee served in upscale cafés",
    specifications: {
      brand: "Lavazza Super Crema",
      origin: "Italy",
      established: "1895",
      volume: "128oz",
      servings: 16,
      servingSize: "8oz",
      staysHot: "2+ hours",
      includes: ["8oz cups", "lids", "sleeves", "sugar packets", "creamer", "stirrers"]
    },
    allergens: ["dairy"],
    dietaryTags: ["vegan-available"],
    nutritionPerServing: {
      servingSize: "8 fl oz",
      calories: 5,
      note: "Black coffee only. Add-ins (cream, sugar) increase calories."
    },
    temperatureGuidelines: {
      safeHoldingTemp: 135,
      optimalServing: "165-180°F",
      maxSafeTime: 4,
      warningThreshold: 90,
      guarantee: "Delivered in insulated cambros - stays hot 2+ hours"
    },
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fcatering%2Fhot-beverages%2Fhot-bev-128oz.webp?alt=media",
    availableForTiers: [1, 2, 3],
    platformPricing: { ezcater: 141.59 },
    basePrice: 117.99,
    packSize: "128oz"
  },

  'sOYRG0fIQsBCRdbWyJeo': {
    id: "ghirardelli-hot-chocolate-128oz",
    name: "Premium Ghirardelli Hot Chocolate (128oz)",
    category: "hot-beverages",
    displayOrder: 13,
    active: true,
    servings: 16,
    servingSize: "8oz cup",
    description: "Premium Ghirardelli Hot Chocolate - San Francisco's finest since 1852. Rich, velvety Dutch cocoa. Includes cups, marshmallows & stirrers.",
    marketingHook: "Not powder - real chocolate. Perfect for meetings, events & gatherings.",
    specifications: {
      brand: "Ghirardelli Premium Cocoa",
      origin: "San Francisco, USA",
      established: "1852",
      volume: "128oz",
      servings: 16,
      servingSize: "8oz",
      staysHot: "2+ hours",
      includes: ["8oz cups", "lids", "sleeves", "marshmallows", "stirrers"]
    },
    allergens: ["dairy", "soy"],
    dietaryTags: ["vegetarian"],
    nutritionPerServing: {
      servingSize: "8 fl oz",
      calories: 180,
      note: "Estimated. Contains milk and cocoa. Final nutrition data pending supplier confirmation."
    },
    temperatureGuidelines: {
      safeHoldingTemp: 135,
      optimalServing: "165-180°F",
      maxSafeTime: 4,
      warningThreshold: 90,
      guarantee: "Delivered in insulated cambros - stays hot 2+ hours"
    },
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fcatering%2Fhot-beverages%2Fhot-bev-128oz.webp?alt=media",
    availableForTiers: [1, 2, 3],
    platformPricing: { ezcater: 161.99 },
    basePrice: 134.99,
    packSize: "128oz"
  }
};

async function rollback() {
  console.log('⏪ ROLLBACK: Restoring Hot Beverages to Original State\n');

  try {
    const batch = db.batch();
    let count = 0;

    // Restore cateringAddOns documents
    console.log('📝 Restoring cateringAddOns documents...');
    for (const [docId, originalData] of Object.entries(originalState)) {
      const docRef = db.collection('cateringAddOns').doc(docId);
      console.log(`  ✅ Restoring: ${originalData.name}`);
      console.log(`     Removing source references, restoring basePrice: $${originalData.basePrice}`);
      batch.set(docRef, originalData);
      count++;
    }

    await batch.commit();
    console.log(`\n🎉 Restored ${count} cateringAddOns documents to original state!\n`);

    // Delete menuItems documents
    console.log('🗑️  Deleting menuItems documents...');
    const menuItemsToDelete = [
      'lavazza_premium_coffee',
      'ghirardelli_hot_chocolate'
    ];

    const deleteBatch = db.batch();
    for (const docId of menuItemsToDelete) {
      const docRef = db.collection('menuItems').doc(docId);
      const doc = await docRef.get();
      if (doc.exists) {
        console.log(`  ✅ Deleting: ${doc.data().name}`);
        deleteBatch.delete(docRef);
      } else {
        console.log(`  ⚠️  ${docId} not found in menuItems`);
      }
    }

    await deleteBatch.commit();
    console.log('\n✅ Rollback Complete!');
    console.log('\nHot beverages restored to original state (direct pricing in cateringAddOns)');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error during rollback:', error);
    process.exit(1);
  }
}

rollback();
