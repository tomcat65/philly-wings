/**
 * Integration Tests for Admin Menu Data Loading
 *
 * Tests the complete workflow of loading menu data in the admin panel
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator, collection, getDocs } from 'firebase/firestore';
import { seedTestData } from '../scripts/seed-test-data.js';

// Test configuration
const TEST_CONFIG = {
  apiKey: "demo-api-key",
  authDomain: "demo-project.firebaseapp.com",
  projectId: "philly-wings-test",
  storageBucket: "demo-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "demo-app-id"
};

let app, db;

// Setup test environment
async function setupTestEnvironment() {
  console.log('🔧 Setting up test environment...');

  // Initialize Firebase app only if not already initialized
  app = getApps().length === 0 ? initializeApp(TEST_CONFIG) : getApp();
  db = getFirestore(app);

  // Connect to emulator
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
    console.log('✅ Connected to Firestore emulator');
  } catch (error) {
    if (error.code === 'failed-precondition') {
      console.log('⚠️  Already connected to emulator');
    } else {
      throw error;
    }
  }

  // Skip seeding - data already seeded with admin SDK
  console.log('✅ Using existing test data (seeded with admin SDK)');
}

// Test: Menu Items Collection Loading
async function testMenuItemsLoading() {
  console.log('\n📦 Testing menuItems collection loading...');

  const menuItemsSnap = await getDocs(collection(db, 'menuItems'));
  const menuItems = menuItemsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  // Verify we have menu items
  if (menuItems.length === 0) {
    throw new Error('No menu items found in test data');
  }
  console.log(`✅ Found ${menuItems.length} menu items`);

  // Test each menu item structure
  for (const item of menuItems) {
    console.log(`🔍 Testing item: ${item.name}`);

    // Verify required fields
    if (!item.name) throw new Error(`Item ${item.id} missing name`);
    if (!item.category) throw new Error(`Item ${item.id} missing category`);

    // Check basePrice - either at top level or in variants
    const hasTopLevelPrice = typeof item.basePrice === 'number';
    const hasVariantPrices = item.variants && item.variants.length > 0 &&
                             item.variants.every(v => typeof v.basePrice === 'number');

    if (!hasTopLevelPrice && !hasVariantPrices) {
      throw new Error(`Item ${item.id} has no valid pricing (neither basePrice nor variant prices)`);
    }

    // Test variants structure (critical for our fix)
    if (item.variants) {
      if (typeof item.variants === 'string') {
        throw new Error(`Item ${item.id} has variants as string (data corruption!)`);
      }
      if (!Array.isArray(item.variants)) {
        throw new Error(`Item ${item.id} has invalid variants structure`);
      }

      console.log(`   ✓ Has ${item.variants.length} variants (proper array)`);

      // Test each variant
      for (const variant of item.variants) {
        if (!variant.id) throw new Error(`Variant missing ID in ${item.id}`);
        if (!variant.name) throw new Error(`Variant missing name in ${item.id}`);
        if (typeof variant.basePrice !== 'number') throw new Error(`Variant has invalid basePrice in ${item.id}`);

        // Test platform pricing
        if (!variant.platformPricing) throw new Error(`Variant missing platformPricing in ${item.id}`);

        const platforms = ['doordash', 'ubereats', 'grubhub'];
        for (const platform of platforms) {
          const price = variant.platformPricing[platform];
          if (typeof price !== 'number') {
            throw new Error(`Variant has invalid ${platform} pricing in ${item.id}`);
          }
        }
      }
    } else {
      console.log(`   ✓ Single item (no variants)`);
    }
  }

  console.log('✅ All menu items passed structure validation');
  return menuItems;
}

// Test: Data Processing (Simulating Admin Panel Logic)
function testDataProcessing(menuItems) {
  console.log('\n⚙️  Testing data processing logic...');

  const processedData = {
    wings: [],
    sides: [],
    drinks: [],
    items: {}
  };

  for (const item of menuItems) {
    processedData.items[item.id] = item;

    // Simulate admin panel variant expansion
    if (item.variants && Array.isArray(item.variants) && item.variants.length > 0) {
      item.variants.forEach((variant, index) => {
        const expandedItem = {
          ...variant,
          id: variant.id || `${item.id}_variant_${index}`,
          parentId: item.id,
          parentName: item.name,
          baseItem: false,
          category: item.category,
          modifierGroups: item.modifierGroups || [],
          images: item.images || {}
        };

        // Categorize
        if (item.category === 'wings') {
          processedData.wings.push(expandedItem);
        } else if (item.category === 'sides') {
          processedData.sides.push(expandedItem);
        } else if (item.category === 'drinks') {
          processedData.drinks.push(expandedItem);
        }
      });
    } else {
      // Single item
      const singleItem = {
        ...item,
        baseItem: true
      };

      if (item.category === 'wings') {
        processedData.wings.push(singleItem);
      } else if (item.category === 'sides') {
        processedData.sides.push(singleItem);
      } else if (item.category === 'drinks') {
        processedData.drinks.push(singleItem);
      }
    }
  }

  // Verify processing results
  console.log(`✅ Processed: ${processedData.wings.length} wings, ${processedData.sides.length} sides, ${processedData.drinks.length} drinks`);

  if (processedData.wings.length === 0) throw new Error('No wings found after processing');
  if (processedData.sides.length === 0) throw new Error('No sides found after processing');

  return processedData;
}

// Test: Platform Pricing Calculation
function testPlatformPricing(processedData) {
  console.log('\n💰 Testing platform pricing calculations...');

  const platforms = ['doordash', 'ubereats', 'grubhub'];

  for (const category of ['wings', 'sides', 'drinks']) {
    for (const item of processedData[category]) {
      for (const platform of platforms) {
        // Simulate getPlatformPrice logic
        const platformPricing = item.platformPricing[platform];
        let price;

        if (typeof platformPricing === 'number') {
          price = platformPricing;
        } else if (typeof platformPricing === 'object' && platformPricing?.price) {
          price = platformPricing.price;
        } else {
          price = item.basePrice || 0;
        }

        if (typeof price !== 'number' || price < 0) {
          throw new Error(`Invalid price calculation for ${item.name} on ${platform}`);
        }

        // Verify platform pricing is higher than base price (markup)
        if (price < item.basePrice) {
          console.warn(`⚠️  ${item.name} on ${platform}: platform price (${price}) less than base price (${item.basePrice})`);
        }
      }
    }
  }

  console.log('✅ Platform pricing calculations passed');
}

// Test: Modifier Groups Loading
async function testModifierGroups() {
  console.log('\n🔧 Testing modifier groups loading...');

  const modifierGroupsSnap = await getDocs(collection(db, 'modifierGroups'));
  const modifierGroups = modifierGroupsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  if (modifierGroups.length === 0) {
    throw new Error('No modifier groups found');
  }

  for (const group of modifierGroups) {
    if (!group.name) throw new Error(`Modifier group ${group.id} missing name`);
    if (!group.type) throw new Error(`Modifier group ${group.id} missing type`);
    if (!Array.isArray(group.options)) throw new Error(`Modifier group ${group.id} missing options array`);

    for (const option of group.options) {
      if (!option.id) throw new Error(`Option missing ID in modifier group ${group.id}`);
      if (!option.name) throw new Error(`Option missing name in modifier group ${group.id}`);
      if (typeof option.price !== 'number') throw new Error(`Option has invalid price in modifier group ${group.id}`);
    }
  }

  console.log(`✅ ${modifierGroups.length} modifier groups validated`);
  return modifierGroups;
}

// Test: Complete Workflow Simulation
async function testCompleteWorkflow() {
  console.log('\n🚀 Testing complete admin panel workflow...');

  // Step 1: Load menu items (what admin panel does)
  const menuItems = await testMenuItemsLoading();

  // Step 2: Process data (expand variants)
  const processedData = testDataProcessing(menuItems);

  // Step 3: Test pricing calculations
  testPlatformPricing(processedData);

  // Step 4: Load modifier groups
  const modifierGroups = await testModifierGroups();

  console.log('✅ Complete workflow test passed!');

  return {
    menuItems: processedData,
    modifierGroups
  };
}

// Main test runner
async function runTests() {
  console.log('🧪 Starting Admin Menu Integration Tests');
  console.log('========================================\n');

  try {
    await setupTestEnvironment();
    const results = await testCompleteWorkflow();

    console.log('\n🎉 ALL TESTS PASSED!');
    console.log('📊 Test Results:');
    console.log(`   - Wings: ${results.menuItems.wings.length} items`);
    console.log(`   - Sides: ${results.menuItems.sides.length} items`);
    console.log(`   - Drinks: ${results.menuItems.drinks.length} items`);
    console.log(`   - Modifier Groups: ${results.modifierGroups.length} groups`);

    return true;
  } catch (error) {
    console.error('\n💥 TEST FAILED:', error.message);
    console.error(error.stack);
    return false;
  }
}

// Export for npm scripts
export { runTests };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const success = await runTests();
  process.exit(success ? 0 : 1);
}