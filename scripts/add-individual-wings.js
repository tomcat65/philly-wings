// Individual Wings Menu Implementation
// Richard's Competitive Pricing Strategy - Phase 1

import { FirebaseService } from '../src/services/firebase-service.js';

const individualWingItems = [
  {
    id: 'wings-6',
    name: '6 Wings',
    description: 'Choose from our signature sauces and dry rubs. Perfect for a personal meal.',
    category: 'wings',
    price: 9.49,
    platformPricing: {
      doordash: 13.76,   // 9.49 × 1.45
      ubereats: 13.76,   // 9.49 × 1.45
      grubhub: 11.86     // 9.49 × 1.25
    },
    basePrice: 9.49,
    active: true,
    featured: false,
    sortOrder: 10,
    heatLevel: 0, // Varies by sauce selection
    nutritionalInfo: {
      estimatedCalories: '420-480',
      note: 'Calories vary by sauce selection'
    },
    customizable: true,
    availableOn: ['doordash', 'ubereats', 'grubhub', 'website'],
    competitorBenchmark: {
      wingstop: 8.99,
      bww: 9.49,
      competitive: true
    }
  },
  {
    id: 'wings-10',
    name: '10 Wings',
    description: 'Our most popular wing count. Mix and match up to 2 sauces for the perfect combination.',
    category: 'wings',
    price: 13.99,
    platformPricing: {
      doordash: 20.29,   // 13.99 × 1.45
      ubereats: 20.29,   // 13.99 × 1.45
      grubhub: 17.49     // 13.99 × 1.25
    },
    basePrice: 13.99,
    active: true,
    featured: true, // Most popular option
    sortOrder: 11,
    heatLevel: 0,
    nutritionalInfo: {
      estimatedCalories: '700-800',
      note: 'Calories vary by sauce selection'
    },
    customizable: true,
    availableOn: ['doordash', 'ubereats', 'grubhub', 'website'],
    competitorBenchmark: {
      wingstop: 12.99,
      bww: 14.99,
      competitive: true
    }
  },
  {
    id: 'wings-20',
    name: '20 Wings',
    description: 'Perfect for sharing or when you really want wings. Mix up to 4 different sauces.',
    category: 'wings',
    price: 26.99,
    platformPricing: {
      doordash: 39.14,   // 26.99 × 1.45
      ubereats: 39.14,   // 26.99 × 1.45
      grubhub: 33.74     // 26.99 × 1.25
    },
    basePrice: 26.99,
    active: true,
    featured: false,
    sortOrder: 12,
    heatLevel: 0,
    nutritionalInfo: {
      estimatedCalories: '1400-1600',
      note: 'Calories vary by sauce selection'
    },
    customizable: true,
    availableOn: ['doordash', 'ubereats', 'grubhub', 'website'],
    competitorBenchmark: {
      wingstop: 24.99,
      wingsOut: 21.99,
      premiumPositioning: true
    }
  }
];

// Function to add individual wing items
async function addIndividualWings() {
  console.log('🚀 Adding Individual Wing Menu Items - Richard\'s Pricing Strategy Phase 1');

  for (const wingItem of individualWingItems) {
    try {
      console.log(`Adding ${wingItem.name} at $${wingItem.price}...`);

      const docId = await FirebaseService.create('menuItems', wingItem);
      console.log(`✅ ${wingItem.name} added successfully with ID: ${docId}`);

      // Log pricing details
      console.log(`   Platform Pricing:
      - DoorDash: $${wingItem.platformPricing.doordash}
      - UberEats: $${wingItem.platformPricing.ubereats}
      - Grubhub: $${wingItem.platformPricing.grubhub}`);

    } catch (error) {
      console.error(`❌ Error adding ${wingItem.name}:`, error);
    }
  }

  console.log('✨ Phase 1 Complete - Individual Wings Added');
  console.log('📊 Expected Revenue Impact: +8% from individual wing orders');
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  addIndividualWings();
}

export { addIndividualWings, individualWingItems };