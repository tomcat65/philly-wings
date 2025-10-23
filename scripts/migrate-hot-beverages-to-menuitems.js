/**
 * Phase 1: Create Hot Beverage Products in menuItems
 * Migrates Lavazza Coffee and Ghirardelli Hot Chocolate from cateringAddOns-only to menuItems
 * with catering-only flag (availableFor: ["catering"])
 */

const admin = require('firebase-admin');
const serviceAccountPath = '/home/tomcat65/projects/docs/Phillywingsexpress/philly-wings-firebase-adminsdk-fbsvc-b9a46d307f.json';

admin.initializeApp({
  credential: admin.credential.cert(require(serviceAccountPath))
});

const db = admin.firestore();

// menuItems documents to create
const hotBeverageProducts = [
  {
    id: "lavazza_premium_coffee",
    name: "Lavazza Premium Coffee",
    category: "hot-beverages",

    // 🔑 KEY: Catering-only flag
    availableFor: ["catering"],

    active: true,
    featured: false,

    description: "Premium Lavazza Italian Coffee - Italy's #1 since 1895. Rich hazelnut & brown sugar notes. Freshly ground for each order. Includes cups, lids, cream & sugar.",

    marketingHook: "The same authentic Italian coffee served in upscale cafés",

    // Variants = different sizes
    variants: [
      {
        id: "96oz_cambro",
        name: "96oz Cambro",
        basePrice: 106.99,
        servings: 12,
        servingSize: "8oz cup",
        volume: "96oz",
        active: true
      },
      {
        id: "128oz_cambro",
        name: "128oz Cambro",
        basePrice: 117.99,
        servings: 16,
        servingSize: "8oz cup",
        volume: "128oz",
        active: true
      }
    ],

    // Rich metadata from current cateringAddOns
    specifications: {
      brand: "Lavazza Super Crema",
      origin: "Italy",
      established: "1895",
      staysHot: "2+ hours",
      includes: ["8oz cups", "lids", "sleeves", "sugar packets", "creamer", "stirrers"]
    },

    temperatureGuidelines: {
      safeHoldingTemp: 135,
      optimalServing: "165-180°F",
      maxSafeTime: 4,
      warningThreshold: 90,
      guarantee: "Delivered in insulated cambros - stays hot 2+ hours"
    },

    allergens: ["dairy"],
    dietaryTags: ["vegan-available"],

    nutritionPerServing: {
      servingSize: "8 fl oz",
      calories: 5,
      note: "Black coffee only. Add-ins (cream, sugar) increase calories."
    },

    // Images per variant
    images: {
      hero: "https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fcatering%2Fhot-beverages%2Fhot-bev-96oz.webp?alt=media",
      variants: {
        "96oz_cambro": "https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fcatering%2Fhot-beverages%2Fhot-bev-96oz.webp?alt=media",
        "128oz_cambro": "https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fcatering%2Fhot-beverages%2Fhot-bev-128oz.webp?alt=media"
      }
    },

    platformPricing: {
      ezcater: {
        "96oz_cambro": 128.39,
        "128oz_cambro": 141.59
      }
    }
  },
  {
    id: "ghirardelli_hot_chocolate",
    name: "Ghirardelli Hot Chocolate",
    category: "hot-beverages",

    // 🔑 KEY: Catering-only flag
    availableFor: ["catering"],

    active: true,
    featured: false,

    description: "Premium Ghirardelli Hot Chocolate - San Francisco's finest since 1852. Rich, velvety Dutch cocoa. Includes cups, marshmallows & stirrers.",

    marketingHook: "Not powder - real chocolate. Perfect for meetings, events & gatherings.",

    variants: [
      {
        id: "96oz_cambro",
        name: "96oz Cambro",
        basePrice: 119.99,
        servings: 12,
        servingSize: "8oz cup",
        volume: "96oz",
        active: true
      },
      {
        id: "128oz_cambro",
        name: "128oz Cambro",
        basePrice: 134.99,
        servings: 16,
        servingSize: "8oz cup",
        volume: "128oz",
        active: true
      }
    ],

    specifications: {
      brand: "Ghirardelli Premium Cocoa",
      origin: "San Francisco, USA",
      established: "1852",
      staysHot: "2+ hours",
      includes: ["8oz cups", "lids", "sleeves", "marshmallows", "stirrers"]
    },

    temperatureGuidelines: {
      safeHoldingTemp: 135,
      optimalServing: "165-180°F",
      maxSafeTime: 4,
      warningThreshold: 90,
      guarantee: "Delivered in insulated cambros - stays hot 2+ hours"
    },

    allergens: ["dairy", "soy"],
    dietaryTags: ["vegetarian"],

    nutritionPerServing: {
      servingSize: "8 fl oz",
      calories: 180,
      note: "Estimated. Contains milk and cocoa. Final nutrition data pending supplier confirmation."
    },

    images: {
      hero: "https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fcatering%2Fhot-beverages%2Fhot-bev-96oz.webp?alt=media",
      variants: {
        "96oz_cambro": "https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fcatering%2Fhot-beverages%2Fhot-bev-96oz.webp?alt=media",
        "128oz_cambro": "https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fcatering%2Fhot-beverages%2Fhot-bev-128oz.webp?alt=media"
      }
    },

    platformPricing: {
      ezcater: {
        "96oz_cambro": 143.99,
        "128oz_cambro": 161.99
      }
    }
  }
];

async function migrateHotBeverages() {
  console.log('☕ Phase 1: Migrating Hot Beverages to menuItems\n');
  console.log('Creating 2 parent products with catering-only flag...\n');

  try {
    const batch = db.batch();

    for (const product of hotBeverageProducts) {
      const docRef = db.collection('menuItems').doc(product.id);

      // Check if already exists
      const existing = await docRef.get();
      if (existing.exists) {
        console.log(`⚠️  ${product.name} already exists in menuItems, skipping...`);
        continue;
      }

      console.log(`✅ Creating: ${product.name}`);
      console.log(`   ID: ${product.id}`);
      console.log(`   Category: ${product.category}`);
      console.log(`   Available For: ${product.availableFor.join(', ')}`);
      console.log(`   Variants: ${product.variants.length}`);
      product.variants.forEach(v => {
        console.log(`      - ${v.name}: $${v.basePrice} (${v.servings} servings)`);
      });
      console.log('');

      batch.set(docRef, product);
    }

    await batch.commit();
    console.log('🎉 Successfully created hot beverage products in menuItems!\n');

    // Verify
    console.log('🔍 Verifying migration...');
    for (const product of hotBeverageProducts) {
      const doc = await db.collection('menuItems').doc(product.id).get();
      if (doc.exists) {
        const data = doc.data();
        console.log(`  ✅ ${data.name}`);
        console.log(`     availableFor: ${data.availableFor.join(', ')}`);
        console.log(`     variants: ${data.variants.length}`);
      } else {
        console.log(`  ❌ ${product.id} NOT FOUND`);
      }
    }

    console.log('\n✅ Phase 1 Complete!');
    console.log('\nNext step: Run convert-hot-beverages-to-references.js');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

migrateHotBeverages();
