// Master Menu for Philly Wings Express
// Platform pricing includes 30% fee markup + COGS + labor + overhead
// Based on Richard's pricing strategy analysis

export const PLATFORM_FEES = {
  doordash: 0.30,    // 30% commission
  ubereats: 0.30,    // 30% commission
  grubhub: 0.285,    // 28.5% commission (slightly better)
  direct: 0.0        // Our website (no fees)
};

export const COST_MULTIPLIERS = {
  labor: 0.25,       // 25% of COGS
  overhead: 0.15,    // 15% of COGS
  packaging: 0.08,   // 8% of COGS
  targetMargin: 0.35 // 35% minimum margin after all costs
};

// Calculate platform price from base cost
export function calculatePlatformPrice(baseCost, platformFee = 0.30) {
  const laborCost = baseCost * COST_MULTIPLIERS.labor;
  const overheadCost = baseCost * COST_MULTIPLIERS.overhead;
  const packagingCost = baseCost * COST_MULTIPLIERS.packaging;

  const trueCost = baseCost + laborCost + overheadCost + packagingCost;

  // Formula: Platform Price = True Cost / (1 - Platform% - Target Margin%)
  const platformPrice = trueCost / (1 - platformFee - COST_MULTIPLIERS.targetMargin);

  // Round to nearest .49 or .99 for psychological pricing
  const rounded = Math.ceil(platformPrice);
  if (rounded < 10) {
    return rounded - 0.01; // $X.99
  } else if (rounded < 20) {
    return rounded - 0.51; // $XX.49
  } else {
    return rounded - 0.01; // $XX.99
  }
}

// Master Menu Structure
export const masterMenu = {
  wings: {
    category: 'Wings',
    description: 'Fresh, never frozen wings. Choose your size and flavor.',
    items: [
      {
        id: '6-wings',
        name: '6 Wings',
        description: 'Perfect personal size. Choose your sauce.',
        baseCost: 3.85, // From supplier invoice
        directPrice: 8.99,
        platformPrices: {
          doordash: 11.99,
          ubereats: 11.99,
          grubhub: 11.49
        },
        modifiers: {
          sauces: {
            required: true,
            limit: 1,
            options: [] // Will populate from sauces
          },
          extras: {
            required: false,
            options: [
              { name: 'Extra Sauce', price: 0.75 },
              { name: 'All Drums', price: 1.50 },
              { name: 'All Flats', price: 1.50 },
              { name: 'Boneless', price: 0 }
            ]
          }
        },
        calories: '540-680',
        prepTime: 12,
        featured: true
      },
      {
        id: '12-wings',
        name: '12 Wings',
        description: 'Share or satisfy a big appetite. Mix up to 2 sauces.',
        baseCost: 7.70,
        directPrice: 16.99,
        platformPrices: {
          doordash: 21.99,
          ubereats: 21.99,
          grubhub: 21.49
        },
        modifiers: {
          sauces: {
            required: true,
            limit: 2,
            options: []
          },
          extras: {
            required: false,
            options: [
              { name: 'Extra Sauce', price: 1.00 },
              { name: 'All Drums', price: 2.50 },
              { name: 'All Flats', price: 2.50 }
            ]
          }
        },
        calories: '1080-1360',
        prepTime: 15,
        featured: true
      },
      {
        id: '24-wings',
        name: '24 Wings',
        description: 'Great for small groups. Mix up to 3 sauces.',
        baseCost: 15.40,
        directPrice: 32.99,
        platformPrices: {
          doordash: 42.99,
          ubereats: 42.99,
          grubhub: 41.99
        },
        modifiers: {
          sauces: {
            required: true,
            limit: 3,
            options: []
          }
        },
        calories: '2160-2720',
        prepTime: 20
      },
      {
        id: '30-wings-quick',
        name: '30 Wing Quick Pick',
        description: 'Pre-selected popular flavors for faster service.',
        baseCost: 19.25,
        directPrice: 39.99,
        platformPrices: {
          doordash: 52.99,
          ubereats: 52.99,
          grubhub: 51.99
        },
        modifiers: {
          sauces: {
            required: false,
            preset: ['Classic Buffalo', 'BBQ', 'Lemon Pepper']
          }
        },
        calories: '2700-3400',
        prepTime: 15,
        featured: true
      },
      {
        id: '50-wings-party',
        name: '50 Wing Party Pack',
        description: 'Perfect for parties. Choose up to 5 sauces.',
        baseCost: 32.00,
        directPrice: 64.99,
        platformPrices: {
          doordash: 84.99,
          ubereats: 84.99,
          grubhub: 82.99
        },
        modifiers: {
          sauces: {
            required: true,
            limit: 5,
            options: []
          },
          style: {
            required: false,
            options: [
              { name: 'All Drums', price: 3.00 },
              { name: 'All Flats', price: 3.00 },
              { name: 'Boneless', price: 0 }
            ]
          }
        },
        calories: '4500-5600',
        prepTime: 30
      }
    ]
  },


  combos: {
    category: 'Combos',
    description: 'Complete meals with wings, sides, and more.',
    items: [
      {
        id: 'game-day-30',
        name: 'Game Day 30',
        description: '30 wings (mix up to 3 sauces), 2 large fries, 8 mozzarella sticks',
        baseCost: 19.25,
        directPrice: 34.99,
        platformPrices: {
          doordash: 52.99,
          ubereats: 52.99,
          grubhub: 51.99
        },
        includes: ['30 wings', '2 large fries', '8 mozzarella sticks'],
        modifiers: {
          wingFlavors: { required: true, limit: 3 }
        },
        badges: ['Most Popular', 'Feeds 5-6'],
        prepTime: 25,
        featured: true,
        feeds: '5-6 people'
      },
      {
        id: 'the-tailgater',
        name: 'The Tailgater',
        description: '24 wings (mix up to 3 sauces), 8 mozzarella sticks, 1 large fries',
        baseCost: 28.00,
        directPrice: 44.99,
        platformPrices: {
          doordash: 64.99,
          ubereats: 64.99,
          grubhub: 63.99
        },
        includes: ['24 wings', '8 mozzarella sticks', '1 large fries'],
        modifiers: {
          wingFlavors: { required: true, limit: 3 }
        },
        badges: ['Best for sharing', 'Feeds 3-5'],
        prepTime: 25,
        featured: true,
        feeds: '3-5 people'
      },
      {
        id: 'mvp-meal',
        name: 'MVP Meal',
        description: '12 wings, regular fries, 4 mozzarella sticks',
        baseCost: 11.50,
        directPrice: 22.99,
        platformPrices: {
          doordash: 32.99,
          ubereats: 32.99,
          grubhub: 31.99
        },
        includes: ['12 wings', 'regular fries', '4 mozzarella sticks'],
        modifiers: {
          wingFlavors: { required: true, limit: 2 }
        },
        badges: ['Game day essential'],
        prepTime: 20,
        featured: true
      },
      {
        id: 'sampler-platter',
        name: 'Sampler Platter',
        description: '6 wings, 4 mozzarella sticks, regular fries',
        baseCost: 5.95,
        directPrice: 13.99,
        platformPrices: {
          doordash: 19.99,
          ubereats: 19.99,
          grubhub: 19.49
        },
        includes: ['6 wings', '4 mozzarella sticks', 'regular fries'],
        modifiers: {
          wingFlavor: { required: true, limit: 1 }
        },
        badges: ['Try everything'],
        prepTime: 15,
        featured: false
      },
      {
        id: 'party-pack-50',
        name: 'Party Pack 50',
        description: '50 wings (mix up to 4 sauces), 3 large fries, 16 mozzarella sticks',
        baseCost: 42.00,
        directPrice: 74.99,
        platformPrices: {
          doordash: 109.99,
          ubereats: 109.99,
          grubhub: 107.99
        },
        includes: ['50 wings', '3 large fries', '16 mozzarella sticks'],
        modifiers: {
          wingFlavors: { required: true, limit: 4 }
        },
        badges: ['Best value', 'Feeds 8-10'],
        prepTime: 35,
        featured: true,
        feeds: '8-10 people'
      }
    ]
  },

  sides: {
    category: 'Sides',
    description: 'Perfect companions to your wings.',
    items: [
      {
        id: 'fries-reg',
        name: 'Regular Fries',
        description: 'Fresh cut, perfectly seasoned.',
        baseCost: 1.25,
        directPrice: 3.49,
        platformPrices: {
          doordash: 4.99,
          ubereats: 4.99,
          grubhub: 4.79
        },
        calories: '380',
        prepTime: 5
      },
      {
        id: 'fries-large',
        name: 'Large Fries',
        description: 'Extra portion of our famous fries.',
        baseCost: 1.85,
        directPrice: 4.99,
        platformPrices: {
          doordash: 6.99,
          ubereats: 6.99,
          grubhub: 6.79
        },
        calories: '540',
        prepTime: 5
      },
      {
        id: 'loaded-fries',
        name: 'Loaded Fries',
        description: 'Fries topped with cheese sauce and bacon.',
        baseCost: 2.85,
        directPrice: 6.99,
        platformPrices: {
          doordash: 9.49,
          ubereats: 9.49,
          grubhub: 9.29
        },
        calories: '680',
        prepTime: 7
      },
      {
        id: 'mozzarella-sticks-4',
        name: 'Mozzarella Sticks (4)',
        description: 'Golden fried with marinara.',
        baseCost: 2.00,
        directPrice: 4.99,
        platformPrices: {
          doordash: 7.49,
          ubereats: 7.49,
          grubhub: 7.29
        },
        calories: '360',
        prepTime: 6
      },
      {
        id: 'mozzarella-sticks-8',
        name: 'Mozzarella Sticks (8)',
        description: 'Double order with marinara.',
        baseCost: 3.75,
        directPrice: 8.99,
        platformPrices: {
          doordash: 12.99,
          ubereats: 12.99,
          grubhub: 12.49
        },
        calories: '720',
        prepTime: 7
      }
    ]
  },

  sauces: {
    category: 'Sauces & Flavors',
    description: 'Our signature sauces and dry rubs.',
    heatScale: {
      0: 'No Heat',
      1: 'Mild',
      2: 'Medium',
      3: 'Hot',
      4: 'Extra Hot',
      5: 'INSANE'
    },
    items: [
      // DRY RUBS
      {
        id: 'classic-lemon-pepper',
        name: 'Classic Lemon Pepper',
        description: 'Classic lemon pepper - zesty citrus, cracked black pepper',
        heatLevel: 1,
        type: 'dry',
        isDryRub: true,
        allergens: [],
        featured: false
      },
      {
        id: 'northeast-hot-lemon',
        name: 'Northeast Hot Lemon',
        description: 'Spicy lemon pepper with cayenne kick',
        heatLevel: 2,
        type: 'dry',
        isDryRub: true,
        allergens: [],
        featured: false
      },
      {
        id: 'frankford-cajun',
        name: 'Frankford Cajun',
        description: 'Bold Cajun blend - paprika, garlic, herbs',
        heatLevel: 2,
        type: 'dry',
        isDryRub: true,
        allergens: [],
        featured: false
      },
      {
        id: 'garlic-parmesan',
        name: 'Garlic Parmesan',
        description: 'Creamy garlic butter with aged parmesan',
        heatLevel: 0,
        type: 'dry',
        isDryRub: true,
        allergens: ['dairy'],
        featured: false
      },
      // SIGNATURE SAUCES
      {
        id: 'sweet-teriyaki',
        name: 'Sweet Teriyaki',
        description: 'Teriyaki glaze - soy, ginger, sesame',
        heatLevel: 0,
        type: 'wet',
        isDryRub: false,
        allergens: ['soy', 'sesame'],
        featured: false
      },
      {
        id: 'tailgate-bbq',
        name: 'Tailgate BBQ',
        description: 'Classic BBQ - sweet, tangy, smoky',
        heatLevel: 0,
        type: 'wet',
        isDryRub: false,
        allergens: [],
        featured: false
      },
      {
        id: 'mild-buffalo',
        name: 'Mild Buffalo',
        description: 'Mild buffalo - all flavor, easy heat',
        heatLevel: 1,
        type: 'wet',
        isDryRub: false,
        allergens: ['dairy'],
        featured: false
      },
      {
        id: 'philly-classic-hot',
        name: 'Philly Classic Hot',
        description: 'Traditional hot buffalo - the perfect heat',
        heatLevel: 3,
        type: 'wet',
        isDryRub: false,
        allergens: ['dairy'],
        featured: false
      },
      {
        id: 'broad-pattison-burn',
        name: 'Broad & Pattison Burn',
        description: 'Nashville-style hot - cayenne, brown sugar',
        heatLevel: 4,
        type: 'wet',
        isDryRub: false,
        allergens: [],
        featured: false
      },
      {
        id: 'grittys-revenge',
        name: "Gritty's Revenge",
        description: 'Scorpion pepper sauce - NOT for rookies!',
        heatLevel: 5,
        type: 'wet',
        isDryRub: false,
        allergens: [],
        featured: true
      },
      // DIPPING SAUCES
      {
        id: 'ranch',
        name: 'Ranch',
        description: 'Cool & creamy',
        heatLevel: 0,
        type: 'dip',
        isDryRub: false,
        allergens: ['dairy', 'egg'],
        featured: false
      },
      {
        id: 'honey-mustard',
        name: 'Honey Mustard',
        description: 'Sweet & tangy',
        heatLevel: 0,
        type: 'dip',
        isDryRub: false,
        allergens: [],
        featured: false
      },
      {
        id: 'blue-cheese',
        name: 'Blue Cheese',
        description: 'Classic chunky',
        heatLevel: 0,
        type: 'dip',
        isDryRub: false,
        allergens: ['dairy'],
        featured: false
      },
      {
        id: 'cheese-sauce',
        name: 'Cheese Sauce',
        description: 'Warm & melty',
        heatLevel: 0,
        type: 'dip',
        isDryRub: false,
        allergens: ['dairy'],
        featured: false
      }
    ]
  },

  drinks: {
    category: 'Drinks',
    description: 'Cool down the heat',
    items: [
      {
        id: 'bottled-water',
        name: 'Bottled Water',
        description: 'Ice cold bottled water to cool down the heat',
        baseCost: 0.35,
        directPrice: 1.49,
        platformPrices: {
          doordash: 2.49,
          ubereats: 2.49,
          grubhub: 2.49
        },
        calories: '0',
        prepTime: 0
      }
    ]
  },

  extras: {
    category: 'Extras',
    items: [
      {
        id: 'ranch-cup',
        name: 'Ranch Dressing',
        description: '2oz cup',
        baseCost: 0.25,
        directPrice: 0.75,
        platformPrices: {
          doordash: 1.25,
          ubereats: 1.25,
          grubhub: 1.25
        }
      },
      {
        id: 'blue-cheese-cup',
        name: 'Blue Cheese Dressing',
        description: '2oz cup',
        baseCost: 0.30,
        directPrice: 0.75,
        platformPrices: {
          doordash: 1.25,
          ubereats: 1.25,
          grubhub: 1.25
        }
      },
      {
        id: 'celery-carrots',
        name: 'Celery & Carrots',
        description: 'Fresh cut veggies',
        baseCost: 0.75,
        directPrice: 1.99,
        platformPrices: {
          doordash: 2.99,
          ubereats: 2.99,
          grubhub: 2.99
        }
      },
      {
        id: 'extra-sauce',
        name: 'Extra Sauce',
        description: 'Any flavor, 2oz',
        baseCost: 0.35,
        directPrice: 0.99,
        platformPrices: {
          doordash: 1.49,
          ubereats: 1.49,
          grubhub: 1.49
        }
      }
    ]
  }
};

// Export functions for platform-specific menus
export function getMenuForPlatform(platform) {
  const menu = JSON.parse(JSON.stringify(masterMenu)); // Deep copy

  // Adjust prices based on platform
  Object.keys(menu).forEach(category => {
    if (menu[category].items) {
      menu[category].items.forEach(item => {
        if (item.platformPrices && item.platformPrices[platform]) {
          item.price = item.platformPrices[platform];
        } else if (item.directPrice) {
          // Fallback to calculating price if not specified
          item.price = calculatePlatformPrice(item.baseCost, PLATFORM_FEES[platform]);
        }
      });
    }
  });

  return menu;
}

// Generate modifiers list with prices
export function getModifiersWithPricing(platform = 'doordash') {
  return {
    sauces: masterMenu.sauces.items.map(sauce => ({
      ...sauce,
      price: 0 // First sauce is free
    })),
    extras: masterMenu.extras.items.map(extra => ({
      ...extra,
      price: extra.platformPrices[platform] || extra.directPrice
    })),
    upgrades: {
      allDrums: { name: 'All Drums', price: platform === 'direct' ? 1.00 : 1.50 },
      allFlats: { name: 'All Flats', price: platform === 'direct' ? 1.00 : 1.50 },
      extraCrispy: { name: 'Extra Crispy', price: 0 },
      lightSauce: { name: 'Light Sauce', price: 0 },
      extraSauce: { name: 'Extra Sauce on Wings', price: 0 },
      sauceOnSide: { name: 'Sauce on Side', price: 0 }
    }
  };
}

// Calculate margin for reporting
export function calculateMargin(item, platform) {
  const platformPrice = item.platformPrices[platform];
  const trueCost = item.baseCost * (1 + COST_MULTIPLIERS.labor + COST_MULTIPLIERS.overhead + COST_MULTIPLIERS.packaging);
  const platformFee = platformPrice * PLATFORM_FEES[platform];
  const netRevenue = platformPrice - trueCost - platformFee;
  const marginPercent = (netRevenue / platformPrice) * 100;

  return {
    price: platformPrice,
    cost: trueCost,
    platformFee: platformFee,
    netRevenue: netRevenue,
    marginPercent: marginPercent.toFixed(1)
  };
}
