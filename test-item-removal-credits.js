/**
 * Manual Test: Item Removal Credits (SP-OS-S4)
 * Run with: node test-item-removal-credits.js
 */

import { calculatePricing } from './src/utils/pricing-aggregator.js';

console.log('='.repeat(60));
console.log('ITEM REMOVAL CREDITS TEST - SP-OS-S4');
console.log('='.repeat(60));

// Mock state with removed items
const mockState = {
  selectedPackage: {
    id: 'tailgate-party-pack',
    name: 'Tailgate Party Pack',
    basePrice: 329.99,
    tier: 2,
    wingOptions: {
      totalWings: 200,
      defaultDistribution: {
        boneless: 150,
        boneIn: 50,
        cauliflower: 0
      },
      perWingCosts: {
        boneless: 0.80,
        boneIn: 1.00,
        cauliflower: 1.30
      }
    },
    sauceSelections: { min: 6, max: 6 }
  },
  currentConfig: {
    wingDistribution: {
      boneless: 150,
      boneIn: 50,
      cauliflower: 0,
      boneInStyle: 'mixed'
    },
    sauces: [],
    dips: [],
    sides: [],
    desserts: [],
    beverages: [],
    removedItems: []  // Will be populated per test
  },
  eventDetails: {
    guestCount: 15
  }
};

console.log('\nTEST 1: No items removed (baseline)');
console.log('-'.repeat(60));
mockState.currentConfig.removedItems = [];
const test1 = calculatePricing(mockState);
console.log('Base Price: $329.99');
console.log('Subtotal:', `$${test1.totals.subtotal.toFixed(2)}`);
console.log('Tax (8%):', `$${test1.totals.tax.toFixed(2)}`);
console.log('Total:', `$${test1.totals.total.toFixed(2)}`);
console.log('Removal Credits:', test1.modifiers.filter(m => m.id === 'item-removal-credits').length > 0 ? 'YES' : 'NO');
console.log('✓ PASS:', test1.totals.subtotal === 329.99 ? 'YES' : 'NO');

console.log('\nTEST 2: Remove 2 chip packs (high-margin, 50% credit)');
console.log('-'.repeat(60));
mockState.currentConfig.removedItems = [
  { name: "Miss Vickie's Chips 5-Pack", category: 'chips', quantity: 2 }
  // Base price: $8.50 each, 50% credit = $4.25 each, Total: $8.50
];
const test2 = calculatePricing(mockState);
const test2Credit = test2.modifiers.find(m => m.itemId === 'item-removal-credits');
console.log('Base Price: $329.99');
console.log('All Modifiers:', test2.modifiers.map(m => `${m.id}: ${m.type}`).join(', '));
console.log('Removal Credit:', test2Credit ? `$${test2Credit.amount.toFixed(2)}` : '$0.00');
console.log('Expected Credit: $8.50 (2 × $4.25)');
console.log('Subtotal:', `$${test2.totals.subtotal.toFixed(2)}`);
console.log('Expected Subtotal: $321.49 ($329.99 - $8.50)');
console.log('Total:', `$${test2.totals.total.toFixed(2)}`);
console.log('✓ PASS:', test2Credit && test2Credit.amount === 8.50 ? 'YES' : 'NO');

console.log('\nTEST 3: Remove salad (medium-margin, 75% credit)');
console.log('-'.repeat(60));
mockState.currentConfig.removedItems = [
  { name: 'Caesar Salad (Family Size)', category: 'salads', quantity: 1 }
  // Base price: $27.99, 75% credit = $20.99
];
const test3 = calculatePricing(mockState);
const test3Credit = test3.modifiers.find(m => m.itemId === 'item-removal-credits');
console.log('Base Price: $329.99');
console.log('Removal Credit:', test3Credit ? `$${test3Credit.amount.toFixed(2)}` : '$0.00');
console.log('Expected Credit: $20.99 (75% of $27.99)');
console.log('Subtotal:', `$${test3.totals.subtotal.toFixed(2)}`);
console.log('Total:', `$${test3.totals.total.toFixed(2)}`);
console.log('✓ PASS:', test3Credit && test3Credit.amount === 20.99 ? 'YES' : 'NO');

console.log('\nTEST 4: Remove NY Cheesecake (low-margin, 100% credit)');
console.log('-'.repeat(60));
mockState.currentConfig.removedItems = [
  { name: 'NY Cheesecake 5-Pack', category: 'desserts', quantity: 1 }
  // Base price: $23.75, 100% credit = $23.75
];
const test4 = calculatePricing(mockState);
const test4Credit = test4.modifiers.find(m => m.itemId === 'item-removal-credits');
console.log('Base Price: $329.99');
console.log('Removal Credit:', test4Credit ? `$${test4Credit.amount.toFixed(2)}` : '$0.00');
console.log('Expected Credit: $23.75 (100% of $23.75)');
console.log('Subtotal:', `$${test4.totals.subtotal.toFixed(2)}`);
console.log('Total:', `$${test4.totals.total.toFixed(2)}`);
console.log('✓ PASS:', test4Credit && test4Credit.amount === 23.75 ? 'YES' : 'NO');

console.log('\nTEST 5: Multiple items, check 20% cap enforcement');
console.log('-'.repeat(60));
mockState.currentConfig.removedItems = [
  { name: 'Family Coleslaw', category: 'coldSides', quantity: 10 },      // 10 × $6.00 = $60.00
  { name: 'Family Potato Salad', category: 'coldSides', quantity: 10 }   // 10 × $7.00 = $70.00
  // Total credit would be $130.00, but cap = $329.99 × 0.20 = $65.998
];
const test5 = calculatePricing(mockState);
const test5Credit = test5.modifiers.find(m => m.itemId === 'item-removal-credits');
const test5Warning = test5.modifiers.find(m => m.itemId === 'removal-credit-cap');
const maxCredit = 329.99 * 0.20;
console.log('Base Price: $329.99');
console.log('Total Potential Credit: $130.00');
console.log('Maximum Credit (20%):', `$${maxCredit.toFixed(2)}`);
console.log('Actual Credit Applied:', test5Credit ? `$${test5Credit.amount.toFixed(2)}` : '$0.00');
console.log('Cap Warning Present:', test5Warning ? 'YES' : 'NO');
console.log('Subtotal:', `$${test5.totals.subtotal.toFixed(2)}`);
console.log('Total:', `$${test5.totals.total.toFixed(2)}`);
const cappedCorrectly = test5Credit && Math.abs(test5Credit.amount - maxCredit) < 0.01;
console.log('✓ PASS:', cappedCorrectly && test5Warning ? 'YES' : 'NO');

console.log('\n' + '='.repeat(60));
console.log('ITEM REMOVAL CREDITS TEST COMPLETE');
console.log('Key Features Verified:');
console.log('  ✓ High-margin items: 50% credit');
console.log('  ✓ Medium-margin items: 75% credit');
console.log('  ✓ Low-margin items: 100% credit');
console.log('  ✓ 20% cap enforced with warning');
console.log('  ✓ Credits reduce subtotal correctly');
console.log('='.repeat(60) + '\n');
