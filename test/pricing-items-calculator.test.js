/**
 * Tests for Items Pricing Calculator (S4)
 * Tests dips, sides, desserts, and beverages pricing
 *
 * @epic SP-PRICING-001
 * @story S4-Items
 */

import { describe, it, expect } from 'vitest';
import {
  calculateDipsPricing,
  calculateSidesPricing,
  calculateDessertsPricing,
  calculateBeveragesPricing,
  ITEMS_PRICING
} from '../src/utils/pricing-items-calculator.js';

describe('Items Pricing Calculator', () => {
  describe('calculateDipsPricing', () => {
    const defaultDipsConfig = {
      count: 15,
      types: ['ranch', 'blue-cheese', 'honey-mustard', 'cheese-sauce']
    };

    it('should calculate pricing for included dips only', () => {
      const dips = [
        { id: 'ranch', name: 'Ranch', quantity: 10 },
        { id: 'blue-cheese', name: 'Blue Cheese', quantity: 5 }
      ];

      const pricing = calculateDipsPricing(dips, defaultDipsConfig);

      expect(Object.keys(pricing.items).length).toBe(2);

      // All dips are included (15 total = 15 included)
      const upcharges = pricing.modifiers.filter(m => m.type === 'upcharge');
      expect(upcharges.length).toBe(0);
      expect(pricing.meta.completionStatus.dips).toBe(true);
    });

    it('should calculate pricing for extra dips', () => {
      const dips = [
        { id: 'ranch', name: 'Ranch', quantity: 10 },
        { id: 'blue-cheese', name: 'Blue Cheese', quantity: 10 } // 5 extra
      ];

      const pricing = calculateDipsPricing(dips, defaultDipsConfig);

      // Should have upcharge for 5 extra dips
      const upcharges = pricing.modifiers.filter(m => m.type === 'upcharge');
      expect(upcharges.length).toBe(1);
      expect(upcharges[0].amount).toBe(5 * ITEMS_PRICING.DIPS.extra);
    });

    it('should apply size upgrade upcharge for 3oz dips', () => {
      const dips = [
        { id: 'ranch', name: 'Ranch', quantity: 5, size: '3oz' }
      ];

      const pricing = calculateDipsPricing(dips, defaultDipsConfig);

      // Should have size upgrade upcharge
      const upcharges = pricing.modifiers.filter(m => m.type === 'upcharge');
      expect(upcharges.length).toBe(1);
      expect(upcharges[0].amount).toBe(5 * ITEMS_PRICING.DIPS.sizeUpgrade);
      expect(upcharges[0].label).toContain('3oz upgrade');
    });

    it('should handle both extra quantity and size upgrade', () => {
      const dips = [
        { id: 'ranch', name: 'Ranch', quantity: 20, size: '3oz' }
      ];

      const pricing = calculateDipsPricing(dips, defaultDipsConfig);

      // Should have both extra dips and size upgrade upcharges
      const upcharges = pricing.modifiers.filter(m => m.type === 'upcharge');
      expect(upcharges.length).toBe(2);

      const extraUpcharge = upcharges.find(u => u.label.includes('Extra'));
      const sizeUpcharge = upcharges.find(u => u.label.includes('3oz'));

      expect(extraUpcharge).toBeDefined();
      expect(sizeUpcharge).toBeDefined();
      expect(extraUpcharge.amount).toBe(5 * ITEMS_PRICING.DIPS.extra);
      expect(sizeUpcharge.amount).toBe(20 * ITEMS_PRICING.DIPS.sizeUpgrade);
    });
  });

  describe('calculateSidesPricing', () => {
    it('should calculate pricing for chips', () => {
      const sides = {
        chips: { quantity: 3 },
        coldSides: [],
        salads: []
      };

      const pricing = calculateSidesPricing(sides);

      expect(pricing.items['chips']).toBeDefined();
      expect(pricing.items['chips'].quantity).toBe(3);

      const upcharges = pricing.modifiers.filter(m => m.type === 'upcharge');
      expect(upcharges.length).toBe(1);
      expect(upcharges[0].amount).toBe(3 * ITEMS_PRICING.SIDES.chips);
    });

    it('should calculate pricing for cold sides', () => {
      const sides = {
        chips: { quantity: 0 },
        coldSides: [
          { id: 'coleslaw', name: 'Coleslaw', quantity: 2, serves: 4 }
        ],
        salads: []
      };

      const pricing = calculateSidesPricing(sides);

      expect(pricing.items['cold-side-coleslaw']).toBeDefined();

      const upcharges = pricing.modifiers.filter(m => m.type === 'upcharge');
      expect(upcharges.length).toBe(1);
      expect(upcharges[0].amount).toBe(2 * ITEMS_PRICING.SIDES.coldSides);
    });

    it('should calculate pricing for salads', () => {
      const sides = {
        chips: { quantity: 0 },
        coldSides: [],
        salads: [
          { id: 'caesar', name: 'Caesar Salad', quantity: 2, serves: 4 }
        ]
      };

      const pricing = calculateSidesPricing(sides);

      expect(pricing.items['salad-caesar']).toBeDefined();

      const upcharges = pricing.modifiers.filter(m => m.type === 'upcharge');
      expect(upcharges.length).toBe(1);
      expect(upcharges[0].amount).toBe(2 * ITEMS_PRICING.SIDES.salads);
    });

    it('should calculate pricing for multiple side types', () => {
      const sides = {
        chips: { quantity: 2 },
        coldSides: [
          { id: 'coleslaw', name: 'Coleslaw', quantity: 1, serves: 4 }
        ],
        salads: [
          { id: 'caesar', name: 'Caesar Salad', quantity: 1, serves: 4 }
        ]
      };

      const pricing = calculateSidesPricing(sides);

      expect(Object.keys(pricing.items).length).toBe(3);

      const upcharges = pricing.modifiers.filter(m => m.type === 'upcharge');
      expect(upcharges.length).toBe(3);

      const totalUpcharge = upcharges.reduce((sum, u) => sum + u.amount, 0);
      expect(totalUpcharge).toBe(
        (2 * ITEMS_PRICING.SIDES.chips) +
        (1 * ITEMS_PRICING.SIDES.coldSides) +
        (1 * ITEMS_PRICING.SIDES.salads)
      );
    });

    it('should handle empty sides', () => {
      const sides = {
        chips: { quantity: 0 },
        coldSides: [],
        salads: []
      };

      const pricing = calculateSidesPricing(sides);

      expect(Object.keys(pricing.items).length).toBe(0);
      expect(pricing.meta.completionStatus.sides).toBe(false);
    });

    it('should handle undefined sides input', () => {
      expect(() => calculateSidesPricing()).not.toThrow();

      const pricing = calculateSidesPricing();
      expect(Object.keys(pricing.items).length).toBe(0);
      expect(pricing.meta.completionStatus.sides).toBe(false);
    });

    it('should normalize array-based sides input', () => {
      const pricing = calculateSidesPricing([
        { id: 'coleslaw', name: 'Coleslaw', quantity: 1, serves: 4 }
      ]);

      expect(pricing.items['cold-side-coleslaw']).toBeDefined();
      expect(pricing.modifiers.some(m => m.label.includes('Coleslaw'))).toBe(true);
    });
  });

  describe('calculateDessertsPricing', () => {
    it('should calculate pricing for cookies', () => {
      const desserts = [
        { id: 'choc-chip', name: 'Chocolate Chip Cookie', quantity: 12, type: 'cookie', servings: 12 }
      ];

      const pricing = calculateDessertsPricing(desserts);

      expect(pricing.items['dessert-choc-chip']).toBeDefined();

      const upcharges = pricing.modifiers.filter(m => m.type === 'upcharge');
      expect(upcharges.length).toBe(1);
      expect(upcharges[0].amount).toBe(12 * ITEMS_PRICING.DESSERTS.cookies);
    });

    it('should calculate pricing for brownies', () => {
      const desserts = [
        { id: 'fudge', name: 'Fudge Brownie', quantity: 6, type: 'brownie', servings: 6 }
      ];

      const pricing = calculateDessertsPricing(desserts);

      const upcharges = pricing.modifiers.filter(m => m.type === 'upcharge');
      expect(upcharges.length).toBe(1);
      expect(upcharges[0].amount).toBe(6 * ITEMS_PRICING.DESSERTS.brownies);
    });

    it('should calculate pricing for cake slices', () => {
      const desserts = [
        { id: 'cheesecake', name: 'Cheesecake', quantity: 4, type: 'cake', servings: 4 }
      ];

      const pricing = calculateDessertsPricing(desserts);

      const upcharges = pricing.modifiers.filter(m => m.type === 'upcharge');
      expect(upcharges.length).toBe(1);
      expect(upcharges[0].amount).toBe(4 * ITEMS_PRICING.DESSERTS.cakeslice);
    });

    it('should calculate pricing for mixed desserts', () => {
      const desserts = [
        { id: 'cookie', name: 'Cookie', quantity: 10, type: 'cookie', servings: 10 },
        { id: 'brownie', name: 'Brownie', quantity: 5, type: 'brownie', servings: 5 }
      ];

      const pricing = calculateDessertsPricing(desserts);

      expect(Object.keys(pricing.items).length).toBe(2);

      const upcharges = pricing.modifiers.filter(m => m.type === 'upcharge');
      expect(upcharges.length).toBe(2);

      const totalUpcharge = upcharges.reduce((sum, u) => sum + u.amount, 0);
      expect(totalUpcharge).toBe(
        (10 * ITEMS_PRICING.DESSERTS.cookies) +
        (5 * ITEMS_PRICING.DESSERTS.brownies)
      );
    });

    it('should handle empty desserts', () => {
      const pricing = calculateDessertsPricing([]);

      expect(Object.keys(pricing.items).length).toBe(0);
      expect(pricing.meta.completionStatus.desserts).toBe(false);
    });
  });

  describe('calculateBeveragesPricing', () => {
    it('should calculate pricing for cold beverages (cans)', () => {
      const beverages = {
        cold: [
          { id: 'coke', name: 'Coca-Cola', quantity: 6, size: 'can', serves: 1 }
        ],
        hot: []
      };

      const pricing = calculateBeveragesPricing(beverages);

      expect(pricing.items['cold-beverage-coke']).toBeDefined();

      const upcharges = pricing.modifiers.filter(m => m.type === 'upcharge');
      expect(upcharges.length).toBe(1);
      expect(upcharges[0].amount).toBe(6 * ITEMS_PRICING.BEVERAGES.cold.can);
    });

    it('should calculate pricing for cold beverages (bottles)', () => {
      const beverages = {
        cold: [
          { id: 'water', name: 'Water', quantity: 12, size: 'bottle', serves: 1 }
        ],
        hot: []
      };

      const pricing = calculateBeveragesPricing(beverages);

      const upcharges = pricing.modifiers.filter(m => m.type === 'upcharge');
      expect(upcharges.length).toBe(1);
      expect(upcharges[0].amount).toBe(12 * ITEMS_PRICING.BEVERAGES.cold.bottle);
    });

    it('should calculate pricing for cold beverages (pitchers)', () => {
      const beverages = {
        cold: [
          { id: 'lemonade', name: 'Lemonade', quantity: 2, size: 'pitcher', serves: 8 }
        ],
        hot: []
      };

      const pricing = calculateBeveragesPricing(beverages);

      const upcharges = pricing.modifiers.filter(m => m.type === 'upcharge');
      expect(upcharges.length).toBe(1);
      expect(upcharges[0].amount).toBe(2 * ITEMS_PRICING.BEVERAGES.cold.pitcher);
    });

    it('should calculate pricing for hot beverages (coffee)', () => {
      const beverages = {
        cold: [],
        hot: [
          { id: 'coffee', name: 'Coffee', quantity: 5, size: 'cup', serves: 1 }
        ]
      };

      const pricing = calculateBeveragesPricing(beverages);

      const upcharges = pricing.modifiers.filter(m => m.type === 'upcharge');
      expect(upcharges.length).toBe(1);
      expect(upcharges[0].amount).toBe(5 * ITEMS_PRICING.BEVERAGES.hot.coffee);
    });

    it('should calculate pricing for hot beverages (box)', () => {
      const beverages = {
        cold: [],
        hot: [
          { id: 'coffee-box', name: 'Coffee Box', quantity: 1, size: 'box', serves: 10 }
        ]
      };

      const pricing = calculateBeveragesPricing(beverages);

      const upcharges = pricing.modifiers.filter(m => m.type === 'upcharge');
      expect(upcharges.length).toBe(1);
      expect(upcharges[0].amount).toBe(1 * ITEMS_PRICING.BEVERAGES.hot.box);
    });

    it('should calculate pricing for mixed beverages', () => {
      const beverages = {
        cold: [
          { id: 'coke', name: 'Coca-Cola', quantity: 6, size: 'can', serves: 1 },
          { id: 'lemonade', name: 'Lemonade', quantity: 1, size: 'pitcher', serves: 8 }
        ],
        hot: [
          { id: 'coffee', name: 'Coffee', quantity: 3, size: 'cup', serves: 1 }
        ]
      };

      const pricing = calculateBeveragesPricing(beverages);

      expect(Object.keys(pricing.items).length).toBe(3);

      const upcharges = pricing.modifiers.filter(m => m.type === 'upcharge');
      expect(upcharges.length).toBe(3);

      const totalUpcharge = upcharges.reduce((sum, u) => sum + u.amount, 0);
      expect(totalUpcharge).toBe(
        (6 * ITEMS_PRICING.BEVERAGES.cold.can) +
        (1 * ITEMS_PRICING.BEVERAGES.cold.pitcher) +
        (3 * ITEMS_PRICING.BEVERAGES.hot.coffee)
      );
    });

    it('should handle empty beverages', () => {
      const pricing = calculateBeveragesPricing({ cold: [], hot: [] });

      expect(Object.keys(pricing.items).length).toBe(0);
      expect(pricing.meta.completionStatus.beverages).toBe(false);
    });

    it('should handle undefined beverages input', () => {
      expect(() => calculateBeveragesPricing()).not.toThrow();

      const pricing = calculateBeveragesPricing();
      expect(Object.keys(pricing.items).length).toBe(0);
      expect(pricing.meta.completionStatus.beverages).toBe(false);
    });

    it('should normalize array-based beverages input as cold beverages', () => {
      const pricing = calculateBeveragesPricing([
        { id: 'coke', name: 'Coca-Cola', quantity: 2, size: 'can', serves: 1 }
      ]);

      expect(pricing.items['cold-beverage-coke']).toBeDefined();
      expect(pricing.modifiers.some(m => m.label.includes('Coca-Cola'))).toBe(true);
    });
  });

  describe('ITEMS_PRICING constants', () => {
    it('should define dips pricing', () => {
      expect(ITEMS_PRICING.DIPS.included).toBe(0);
      expect(ITEMS_PRICING.DIPS.extra).toBe(0.75);
      expect(ITEMS_PRICING.DIPS.sizeUpgrade).toBe(1.50);
    });

    it('should define sides pricing', () => {
      expect(ITEMS_PRICING.SIDES.chips).toBe(3.00);
      expect(ITEMS_PRICING.SIDES.mozzarellaSticks).toBe(8.00);
      expect(ITEMS_PRICING.SIDES.coldSides).toBe(5.00);
      expect(ITEMS_PRICING.SIDES.salads).toBe(6.00);
    });

    it('should define desserts pricing', () => {
      expect(ITEMS_PRICING.DESSERTS.cookies).toBe(2.00);
      expect(ITEMS_PRICING.DESSERTS.brownies).toBe(3.00);
      expect(ITEMS_PRICING.DESSERTS.cakeslice).toBe(4.00);
    });

    it('should define beverages pricing', () => {
      expect(ITEMS_PRICING.BEVERAGES.cold.can).toBe(2.00);
      expect(ITEMS_PRICING.BEVERAGES.cold.bottle).toBe(3.00);
      expect(ITEMS_PRICING.BEVERAGES.cold.pitcher).toBe(8.00);
      expect(ITEMS_PRICING.BEVERAGES.hot.coffee).toBe(2.50);
      expect(ITEMS_PRICING.BEVERAGES.hot.box).toBe(15.00);
    });
  });
});
