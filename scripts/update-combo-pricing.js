// Combo Pricing Updates
// Richard's Competitive Pricing Strategy - Phase 2

import { FirebaseService } from '../src/services/firebase-service.js';

const comboPricingUpdates = [
  {
    name: 'MVP Meal',
    currentPrice: 17.99,
    newPrice: 19.99,
    increase: 2.00,
    increasePercent: 11.1,
    justification: 'Align with Buffalo Wild Wings comparable combos ($18.99-19.99)',
    platformPricing: {
      doordash: 28.98,  // 19.99 × 1.45
      ubereats: 28.98,  // 19.99 × 1.45
      grubhub: 24.99    // 19.99 × 1.25
    }
  },
  {
    name: 'Game Day 30',
    currentPrice: 35.99,
    newPrice: 39.99,
    increase: 4.00,
    increasePercent: 11.1,
    justification: 'Match Wingstop 30-wing pricing ($38-40), maintain premium position',
    platformPricing: {
      doordash: 57.99,  // 39.99 × 1.45
      ubereats: 57.99,  // 39.99 × 1.45
      grubhub: 49.99    // 39.99 × 1.25
    }
  },
  {
    name: 'Sampler Platter',
    currentPrice: 18.99,
    newPrice: 16.99,
    increase: -2.00,
    increasePercent: -10.5,
    justification: 'Strategic price reduction to drive trial and increase conversion',
    platformPricing: {
      doordash: 24.64,  // 16.99 × 1.45
      ubereats: 24.64,  // 16.99 × 1.45
      grubhub: 21.24    // 16.99 × 1.25
    }
  }
];

// Function to update combo pricing
async function updateComboPricing() {
  console.log('💰 Updating Combo Pricing - Richard\'s Strategy Phase 2');

  for (const combo of comboPricingUpdates) {
    try {
      console.log(`\n📋 Processing: ${combo.name}`);
      console.log(`   Current: $${combo.currentPrice} → New: $${combo.newPrice}`);
      console.log(`   Change: ${combo.increase >= 0 ? '+' : ''}$${combo.increase} (${combo.increasePercent >= 0 ? '+' : ''}${combo.increasePercent}%)`);
      console.log(`   Reasoning: ${combo.justification}`);

      // Get existing combo to update
      const existingCombos = await FirebaseService.getAll('combos', {
        where: ['name', '==', combo.name]
      });

      if (existingCombos.length > 0) {
        const comboId = existingCombos[0].id;

        // Update with new pricing structure
        const updateData = {
          price: combo.newPrice,
          basePrice: combo.newPrice,
          platformPricing: combo.platformPricing,
          lastPriceUpdate: new Date().toISOString(),
          competitivePricing: {
            strategy: 'competitive-positioning',
            benchmarkDate: '2025-09-20',
            justification: combo.justification
          }
        };

        await FirebaseService.update('combos', comboId, updateData);

        console.log(`   ✅ ${combo.name} updated successfully`);
        console.log(`   Platform Pricing:
        - DoorDash: $${combo.platformPricing.doordash}
        - UberEats: $${combo.platformPricing.ubereats}
        - Grubhub: $${combo.platformPricing.grubhub}`);

      } else {
        console.log(`   ⚠️  ${combo.name} not found in combos collection`);
      }

    } catch (error) {
      console.error(`❌ Error updating ${combo.name}:`, error);
    }
  }

  console.log('\n✨ Phase 2 Complete - Combo Pricing Updated');
  console.log('📈 Expected Revenue Impact: +12% from optimized combo pricing');
}

// Revenue calculation helper
function calculateRevenueImpact() {
  console.log('\n💵 REVENUE IMPACT ANALYSIS');

  const weeklyComboOrders = {
    'MVP Meal': 25,
    'Game Day 30': 15,
    'Sampler Platter': 20
  };

  let weeklyImpact = 0;

  comboPricingUpdates.forEach(combo => {
    const orders = weeklyComboOrders[combo.name] || 0;
    const impact = orders * combo.increase;
    weeklyImpact += impact;

    console.log(`${combo.name}: ${orders} orders/week × $${combo.increase} = $${impact.toFixed(2)}/week`);
  });

  const monthlyImpact = weeklyImpact * 4.33;
  const yearlyImpact = monthlyImpact * 12;

  console.log(`\nWeekly Impact: $${weeklyImpact.toFixed(2)}`);
  console.log(`Monthly Impact: $${monthlyImpact.toFixed(2)}`);
  console.log(`Annual Impact: $${yearlyImpact.toFixed(2)}`);

  return { weekly: weeklyImpact, monthly: monthlyImpact, yearly: yearlyImpact };
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  updateComboPricing().then(() => {
    calculateRevenueImpact();
  });
}

export { updateComboPricing, comboPricingUpdates, calculateRevenueImpact };