/**
 * Pricing Calculation Test Suite
 * Tests pricing engine for catering orders
 */

import { describe, it, expect } from 'vitest';
import {
  calculatePricing,
  formatPrice,
  calculatePricePerPerson
} from '../../src/utils/pricing.js';

describe('Pricing Utilities', () => {
  describe('calculatePricing', () => {
    it('should calculate base price only', () => {
      const state = {
        package: { basePrice: 149.99 },
        sides: {},
        desserts: [],
        beverages: [],
        quickAdds: []
      };

      const pricing = calculatePricing(state);

      expect(pricing.basePrice).toBe(149.99);
      expect(pricing.addOns).toBe(0);
      expect(pricing.quickAdds).toBe(0);
      expect(pricing.subtotal).toBe(149.99);
      expect(pricing.tax).toBe(12.00); // 8% of 149.99 = 11.9992 -> 12.00
      expect(pricing.deliveryFee).toBe(25.00); // Under $300
      expect(pricing.total).toBe(186.99); // 149.99 + 12.00 + 25.00
    });

    it('should calculate with addon salads', () => {
      const state = {
        package: { basePrice: 149.99 },
        sides: {
          salads: [
            { saladId: 'caesar', quantity: 2, price: 12.99, isAddon: true },
            { saladId: 'garden', quantity: 1, price: 9.99, isAddon: true }
          ]
        },
        desserts: [],
        beverages: [],
        quickAdds: []
      };

      const pricing = calculatePricing(state);

      const expectedAddOns = (12.99 * 2) + (9.99 * 1); // 35.97
      const expectedSubtotal = 149.99 + expectedAddOns; // 185.96

      expect(pricing.addOns).toBe(35.97);
      expect(pricing.subtotal).toBe(185.96);
      expect(pricing.tax).toBe(14.88); // 8% of 185.96
      expect(pricing.deliveryFee).toBe(25.00);
      expect(pricing.total).toBe(225.84); // 185.96 + 14.88 + 25.00
    });

    it('should calculate with desserts', () => {
      const state = {
        package: { basePrice: 200.00 },
        sides: {},
        desserts: [
          { dessertId: 'brownie', fivePacks: 2, price: 15.00 },
          { dessertId: 'cookie', fivePacks: 1, price: 12.00 }
        ],
        beverages: [],
        quickAdds: []
      };

      const pricing = calculatePricing(state);

      const expectedAddOns = (15.00 * 2) + (12.00 * 1); // 42.00
      const expectedSubtotal = 200.00 + expectedAddOns; // 242.00

      expect(pricing.addOns).toBe(42.00);
      expect(pricing.subtotal).toBe(242.00);
      expect(pricing.tax).toBe(19.36); // 8% of 242.00
      expect(pricing.deliveryFee).toBe(25.00);
      expect(pricing.total).toBe(286.36);
    });

    it('should calculate with addon beverages', () => {
      const state = {
        package: { basePrice: 180.00 },
        sides: {},
        desserts: [],
        beverages: [
          { beverageId: 'iced-tea', quantity: 2, price: 8.99, isAddon: true },
          { beverageId: 'water', quantity: 12, price: 1.00, isAddon: false } // Not addon
        ],
        quickAdds: []
      };

      const pricing = calculatePricing(state);

      const expectedAddOns = 8.99 * 2; // 17.98 (water not counted)
      const expectedSubtotal = 180.00 + expectedAddOns; // 197.98

      expect(pricing.addOns).toBe(17.98);
      expect(pricing.subtotal).toBe(197.98);
      expect(pricing.tax).toBe(15.84); // 8% of 197.98
      expect(pricing.deliveryFee).toBe(25.00);
      expect(pricing.total).toBe(238.82);
    });

    it('should calculate with quick-adds', () => {
      const state = {
        package: { basePrice: 150.00 },
        sides: {},
        desserts: [],
        beverages: [],
        quickAdds: [
          { itemId: 'utensils', quantity: 50, price: 0.25, type: 'misc' },
          { itemId: 'napkins', quantity: 100, price: 0.10, type: 'misc' }
        ]
      };

      const pricing = calculatePricing(state);

      const expectedQuickAdds = (0.25 * 50) + (0.10 * 100); // 22.50
      const expectedSubtotal = 150.00 + expectedQuickAdds; // 172.50

      expect(pricing.quickAdds).toBe(22.50);
      expect(pricing.subtotal).toBe(172.50);
      expect(pricing.tax).toBe(13.80); // 8% of 172.50
      expect(pricing.deliveryFee).toBe(25.00);
      expect(pricing.total).toBe(211.30);
    });

    it('should apply free delivery for orders over $300', () => {
      const state = {
        package: { basePrice: 320.00 },
        sides: {},
        desserts: [],
        beverages: [],
        quickAdds: []
      };

      const pricing = calculatePricing(state);

      expect(pricing.subtotal).toBe(320.00);
      expect(pricing.tax).toBe(25.60); // 8% of 320.00
      expect(pricing.deliveryFee).toBe(0); // Free delivery over $300
      expect(pricing.total).toBe(345.60); // 320.00 + 25.60 + 0
    });

    it('should apply delivery fee at exactly $300', () => {
      const state = {
        package: { basePrice: 300.00 },
        sides: {},
        desserts: [],
        beverages: [],
        quickAdds: []
      };

      const pricing = calculatePricing(state);

      expect(pricing.subtotal).toBe(300.00);
      expect(pricing.deliveryFee).toBe(0); // Free at $300
    });

    it('should apply delivery fee just under $300', () => {
      const state = {
        package: { basePrice: 299.99 },
        sides: {},
        desserts: [],
        beverages: [],
        quickAdds: []
      };

      const pricing = calculatePricing(state);

      expect(pricing.subtotal).toBe(299.99);
      expect(pricing.deliveryFee).toBe(25.00); // Still charged under $300
    });

    it('should calculate complete order with all items', () => {
      const state = {
        package: { basePrice: 249.99 },
        sides: {
          salads: [
            { saladId: 'caesar', quantity: 3, price: 12.99, isAddon: true }
          ]
        },
        desserts: [
          { dessertId: 'brownie', fivePacks: 2, price: 15.00 }
        ],
        beverages: [
          { beverageId: 'iced-tea', quantity: 3, price: 8.99, isAddon: true }
        ],
        quickAdds: [
          { itemId: 'plates', quantity: 50, price: 0.30, type: 'misc' }
        ]
      };

      const pricing = calculatePricing(state);

      const saladsTotal = 12.99 * 3; // 38.97
      const dessertsTotal = 15.00 * 2; // 30.00
      const beveragesTotal = 8.99 * 3; // 26.97
      const quickAddsTotal = 0.30 * 50; // 15.00
      const expectedAddOns = saladsTotal + dessertsTotal + beveragesTotal; // 95.94
      const expectedSubtotal = 249.99 + expectedAddOns + quickAddsTotal; // 360.93

      expect(pricing.basePrice).toBe(249.99);
      expect(pricing.addOns).toBe(95.94);
      expect(pricing.quickAdds).toBe(15.00);
      expect(pricing.subtotal).toBe(360.93);
      expect(pricing.tax).toBe(28.87); // 8% of 360.93
      expect(pricing.deliveryFee).toBe(0); // Free over $300
      expect(pricing.total).toBe(389.80); // 360.93 + 28.87 + 0
    });

    it('should handle empty state gracefully', () => {
      const state = {
        package: {},
        sides: {},
        desserts: [],
        beverages: [],
        quickAdds: []
      };

      const pricing = calculatePricing(state);

      expect(pricing.basePrice).toBe(0);
      expect(pricing.addOns).toBe(0);
      expect(pricing.quickAdds).toBe(0);
      expect(pricing.subtotal).toBe(0);
      expect(pricing.tax).toBe(0);
      expect(pricing.deliveryFee).toBe(25.00); // Still charges delivery
      expect(pricing.total).toBe(25.00);
    });

    it('should round tax and total to 2 decimal places', () => {
      const state = {
        package: { basePrice: 123.45 },
        sides: {},
        desserts: [],
        beverages: [],
        quickAdds: []
      };

      const pricing = calculatePricing(state);

      expect(pricing.tax).toBe(9.88); // 8% of 123.45 = 9.876 -> 9.88
      expect(pricing.total).toBe(158.33); // 123.45 + 9.88 + 25.00
    });
  });

  describe('formatPrice', () => {
    it('should format whole numbers', () => {
      expect(formatPrice(100)).toBe('$100.00');
      expect(formatPrice(0)).toBe('$0.00');
    });

    it('should format decimal prices', () => {
      expect(formatPrice(149.99)).toBe('$149.99');
      expect(formatPrice(12.50)).toBe('$12.50');
      expect(formatPrice(0.99)).toBe('$0.99');
    });

    it('should handle large amounts', () => {
      expect(formatPrice(1234.56)).toBe('$1,234.56');
      expect(formatPrice(10000)).toBe('$10,000.00');
    });

    it('should handle negative values (refunds)', () => {
      expect(formatPrice(-25.00)).toBe('-$25.00');
    });

    it('should round to 2 decimal places', () => {
      expect(formatPrice(12.999)).toBe('$13.00');
      expect(formatPrice(12.991)).toBe('$12.99');
    });
  });

  describe('calculatePricePerPerson', () => {
    it('should calculate price per person', () => {
      expect(calculatePricePerPerson(200, 10)).toBe(20.00);
      expect(calculatePricePerPerson(149.99, 12)).toBe(12.50);
      expect(calculatePricePerPerson(500, 25)).toBe(20.00);
    });

    it('should round to 2 decimal places', () => {
      expect(calculatePricePerPerson(100, 3)).toBe(33.33);
      expect(calculatePricePerPerson(100, 7)).toBe(14.29);
    });

    it('should handle zero people count', () => {
      expect(calculatePricePerPerson(200, 0)).toBe(0);
    });

    it('should handle null/undefined people count', () => {
      expect(calculatePricePerPerson(200, null)).toBe(0);
      expect(calculatePricePerPerson(200, undefined)).toBe(0);
    });

    it('should handle edge cases', () => {
      expect(calculatePricePerPerson(0, 10)).toBe(0);
      expect(calculatePricePerPerson(1000, 1)).toBe(1000.00);
    });
  });
});
