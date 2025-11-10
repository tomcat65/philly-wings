/**
 * Test per-person cost calculation (SP-OS-S2 + SP-OS-S3)
 * Run with: node test-per-person-cost.js
 */

import { calculatePricing } from './src/utils/pricing-aggregator.js';

console.log('='.repeat(60));
console.log('PER-PERSON COST TEST - SP-OS-S2 + SP-OS-S3');
console.log('='.repeat(60));

// Mock state
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
    beverages: []
  },
  eventDetails: {
    guestCount: 15  // 15 guests
  }
};

console.log('\nTEST 1: Base package with 15 guests');
console.log('-'.repeat(60));
const test1 = calculatePricing(mockState);
console.log('Base Price: $329.99');
console.log('Subtotal:', `$${test1.totals.subtotal.toFixed(2)}`);
console.log('Tax (8%):', `$${test1.totals.tax.toFixed(2)}`);
console.log('Total:', `$${test1.totals.total.toFixed(2)}`);
console.log('Guest Count:', test1.totals.guestCount);
console.log('Per Person Cost:', `$${test1.totals.perPersonCost.toFixed(2)}`);
const expectedTotal1 = 329.99 * 1.08; // With 8% tax
const expectedPerPerson1 = Number((expectedTotal1 / 15).toFixed(2));
console.log('Expected per-person:', `$${expectedPerPerson1}`);
console.log('✓ PASS:', test1.totals.perPersonCost === expectedPerPerson1 ? 'YES' : 'NO');

// Test 2: With 20 guests
console.log('\nTEST 2: Same package with 20 guests');
console.log('-'.repeat(60));
mockState.eventDetails.guestCount = 20;
const test2 = calculatePricing(mockState);
console.log('Total:', `$${test2.totals.total.toFixed(2)}`);
console.log('Guest Count:', test2.totals.guestCount);
console.log('Per Person Cost:', `$${test2.totals.perPersonCost.toFixed(2)}`);
const expectedPerPerson2 = Number((test2.totals.total / 20).toFixed(2));
console.log('Expected per-person:', `$${expectedPerPerson2}`);
console.log('✓ PASS:', test2.totals.perPersonCost === expectedPerPerson2 ? 'YES' : 'NO');

// Test 3: With differential pricing + different guest count
console.log('\nTEST 3: With distribution change (+$10) and 25 guests');
console.log('-'.repeat(60));
mockState.currentConfig.wingDistribution = {
  boneless: 100,
  boneIn: 100,
  cauliflower: 0,
  boneInStyle: 'mixed'
};
mockState.eventDetails.guestCount = 25;
const test3 = calculatePricing(mockState);
console.log('Base Price: $329.99');
console.log('Wing Differential: +$10.00');
console.log('Subtotal:', `$${test3.totals.subtotal.toFixed(2)}`);
console.log('Tax (8%):', `$${test3.totals.tax.toFixed(2)}`);
console.log('Total:', `$${test3.totals.total.toFixed(2)}`);
console.log('Guest Count:', test3.totals.guestCount);
console.log('Per Person Cost:', `$${test3.totals.perPersonCost.toFixed(2)}`);
const expectedPerPerson3 = Number((test3.totals.total / 25).toFixed(2));
console.log('Expected per-person:', `$${expectedPerPerson3}`);
console.log('✓ PASS:', test3.totals.perPersonCost === expectedPerPerson3 ? 'YES' : 'NO');

console.log('\n' + '='.repeat(60));
console.log('PER-PERSON COST TEST COMPLETE');
console.log('Per-person cost updates dynamically based on:');
console.log('  - Total price (base + upcharges - discounts + tax)');
console.log('  - Guest count from event details');
console.log('='.repeat(60) + '\n');
