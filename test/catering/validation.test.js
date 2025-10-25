/**
 * Validation Engine Test Suite
 * Tests validation for catering customization
 */

import { describe, it, expect, vi } from 'vitest';
import {
  validateState,
  validateWings,
  validateSauces,
  validateDips,
  validateDelivery,
  validateServiceArea
} from '../../src/utils/validation.js';

describe('Validation Utilities', () => {
  describe('validateState', () => {
    it('should fail without package selection', () => {
      const state = {
        package: {},
        wings: {},
        sauces: {},
        dips: [],
        delivery: {}
      };

      const result = validateState(state);

      expect(result.isValid).toBe(false);
      expect(result.errors.package).toBe('Please select a catering package');
    });

    it('should validate complete valid state', () => {
      const state = {
        package: {
          id: 'lunch-box-special',
          wingOptions: { totalWings: 100 },
          dips: { fivePacksIncluded: 3 }
        },
        wings: {
          plantBased: { quantity: 0 },
          boneless: { quantity: 75 },
          boneIn: { quantity: 25 }
        },
        sauces: {
          selected: ['buffalo', 'bbq', 'honey-garlic'],
          min: 3,
          max: 5
        },
        dips: [
          { dipId: 'ranch', fivePacks: 2 },
          { dipId: 'blue-cheese', fivePacks: 1 }
        ],
        delivery: {
          date: new Date(Date.now() + (72 * 60 * 60 * 1000)).toISOString(), // 72 hours from now
          timeWindow: '11:00 AM - 1:00 PM',
          address: { street: '123 Main St', city: 'Philadelphia', zip: '19103' }
        }
      };

      const result = validateState(state);

      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(0);
    });

    it('should collect errors from all validators', () => {
      const state = {
        package: {
          id: 'test-package',
          wingOptions: { totalWings: 100 },
          dips: { fivePacksIncluded: 3 }
        },
        wings: {
          plantBased: { quantity: 0 },
          boneless: { quantity: 50 }, // Wrong total (only 50, need 100)
          boneIn: { quantity: 0 }
        },
        sauces: {
          selected: ['buffalo'], // Need min 3
          min: 3,
          max: 5
        },
        dips: [], // Need 3 five-packs
        delivery: {} // Missing all fields
      };

      const result = validateState(state);

      expect(result.isValid).toBe(false);
      expect(result.errors.wingTotal).toBeDefined();
      expect(result.errors.sauces).toBeDefined();
      expect(result.errors.dips).toBeDefined();
      expect(result.errors.deliveryDate).toBeDefined();
    });
  });

  describe('validateWings', () => {
    const mockPackage = {
      wingOptions: { totalWings: 100 }
    };

    it('should validate correct wing total', () => {
      const wings = {
        plantBased: { quantity: 0 },
        boneless: { quantity: 75 },
        boneIn: { quantity: 25 }
      };

      const result = validateWings(wings, mockPackage);

      expect(result.errors).toEqual({});
    });

    it('should error on incorrect wing total', () => {
      const wings = {
        plantBased: { quantity: 0 },
        boneless: { quantity: 50 },
        boneIn: { quantity: 30 } // Total 80, need 100
      };

      const result = validateWings(wings, mockPackage);

      expect(result.errors.wingTotal).toBe('Total must be 100 wings (currently 80)');
    });

    it('should error when plant-based missing prep method', () => {
      const wings = {
        plantBased: { quantity: 20, prep: null }, // No prep selected
        boneless: { quantity: 50 },
        boneIn: { quantity: 30 }
      };

      const result = validateWings(wings, mockPackage);

      expect(result.errors.plantBasedPrep).toBe('Please select preparation method for plant-based wings');
    });

    it('should allow plant-based with prep method', () => {
      const wings = {
        plantBased: { quantity: 20, prep: 'baked' },
        boneless: { quantity: 50 },
        boneIn: { quantity: 30 }
      };

      const result = validateWings(wings, mockPackage);

      expect(result.errors.plantBasedPrep).toBeUndefined();
    });

    it('should warn on all plant-based order', () => {
      const wings = {
        plantBased: { quantity: 100, prep: 'fried' },
        boneless: { quantity: 0 },
        boneIn: { quantity: 0 }
      };

      const result = validateWings(wings, mockPackage);

      expect(result.warnings.allPlantBased).toBe('All plant-based order - confirm this is intentional');
    });

    it('should warn on small plant-based quantity', () => {
      const wings = {
        plantBased: { quantity: 5, prep: 'baked' },
        boneless: { quantity: 70 },
        boneIn: { quantity: 25 }
      };

      const result = validateWings(wings, mockPackage);

      expect(result.warnings.smallPlantBased).toBe('Consider ordering at least 10 plant-based wings for better variety');
    });

    it('should handle missing package gracefully', () => {
      const wings = {
        plantBased: { quantity: 0 },
        boneless: { quantity: 50 },
        boneIn: { quantity: 50 }
      };

      const result = validateWings(wings, {});

      expect(result.errors).toEqual({});
      expect(result.warnings).toEqual({});
    });
  });

  describe('validateSauces', () => {
    it('should validate correct sauce count', () => {
      const sauces = {
        selected: ['buffalo', 'bbq', 'honey-garlic'],
        min: 3,
        max: 5
      };

      const result = validateSauces(sauces);

      expect(result.errors).toEqual({});
    });

    it('should error on too few sauces', () => {
      const sauces = {
        selected: ['buffalo'],
        min: 3,
        max: 5
      };

      const result = validateSauces(sauces);

      expect(result.errors.sauces).toBe('Please select at least 3 sauces');
    });

    it('should error on too many sauces', () => {
      const sauces = {
        selected: ['buffalo', 'bbq', 'honey-garlic', 'teriyaki', 'garlic-parm', 'hot'],
        min: 3,
        max: 5
      };

      const result = validateSauces(sauces);

      expect(result.errors.sauces).toBe('Maximum 5 sauces allowed');
    });

    it('should use singular form for min=1', () => {
      const sauces = {
        selected: [],
        min: 1,
        max: 5
      };

      const result = validateSauces(sauces);

      expect(result.errors.sauces).toBe('Please select at least 1 sauce');
    });

    it('should use plural form for min>1', () => {
      const sauces = {
        selected: ['buffalo'],
        min: 2,
        max: 5
      };

      const result = validateSauces(sauces);

      expect(result.errors.sauces).toBe('Please select at least 2 sauces');
    });

    it('should handle null sauces gracefully', () => {
      const result = validateSauces(null);

      expect(result.errors).toEqual({});
    });

    it('should handle missing selected array', () => {
      const sauces = {
        min: 3,
        max: 5
      };

      const result = validateSauces(sauces);

      expect(result.errors.sauces).toBe('Please select at least 3 sauces');
    });
  });

  describe('validateDips', () => {
    const mockPackage = {
      dips: { fivePacksIncluded: 3 }
    };

    it('should validate correct dip count', () => {
      const dips = [
        { dipId: 'ranch', fivePacks: 2 },
        { dipId: 'blue-cheese', fivePacks: 1 }
      ];

      const result = validateDips(dips, mockPackage);

      expect(result.errors).toEqual({});
    });

    it('should error on too few dip five-packs', () => {
      const dips = [
        { dipId: 'ranch', fivePacks: 1 }
      ];

      const result = validateDips(dips, mockPackage);

      expect(result.errors.dips).toBe('Please select 3 dip 5-packs');
    });

    it('should allow more than included amount', () => {
      const dips = [
        { dipId: 'ranch', fivePacks: 2 },
        { dipId: 'blue-cheese', fivePacks: 2 } // Total 4, included is 3
      ];

      const result = validateDips(dips, mockPackage);

      expect(result.errors).toEqual({});
    });

    it('should use singular for 1 five-pack', () => {
      const singlePackage = {
        dips: { fivePacksIncluded: 1 }
      };

      const result = validateDips([], singlePackage);

      expect(result.errors.dips).toBe('Please select 1 dip 5-pack');
    });

    it('should handle missing package gracefully', () => {
      const dips = [
        { dipId: 'ranch', fivePacks: 2 }
      ];

      const result = validateDips(dips, {});

      expect(result.errors).toEqual({});
    });

    it('should handle null dips gracefully', () => {
      const result = validateDips(null, mockPackage);

      expect(result.errors).toEqual({});
    });
  });

  describe('validateDelivery', () => {
    it('should validate complete delivery info', () => {
      const delivery = {
        date: new Date(Date.now() + (72 * 60 * 60 * 1000)).toISOString(), // 72 hours from now
        timeWindow: '11:00 AM - 1:00 PM',
        address: { street: '123 Main St', city: 'Philadelphia', zip: '19103' }
      };

      const result = validateDelivery(delivery);

      expect(result.errors).toEqual({});
    });

    it('should error on missing date', () => {
      const delivery = {
        timeWindow: '11:00 AM - 1:00 PM',
        address: { street: '123 Main St' }
      };

      const result = validateDelivery(delivery);

      expect(result.errors.deliveryDate).toBe('Please select a delivery date');
    });

    it('should error on date within 24 hours', () => {
      const delivery = {
        date: new Date(Date.now() + (12 * 60 * 60 * 1000)).toISOString(), // 12 hours from now
        timeWindow: '11:00 AM - 1:00 PM',
        address: { street: '123 Main St' }
      };

      const result = validateDelivery(delivery);

      expect(result.errors.deliveryDate).toBe('Orders require 24-hour advance notice');
    });

    it('should warn on date within 24-48 hours', () => {
      const delivery = {
        date: new Date(Date.now() + (36 * 60 * 60 * 1000)).toISOString(), // 36 hours from now
        timeWindow: '11:00 AM - 1:00 PM',
        address: { street: '123 Main St' }
      };

      const result = validateDelivery(delivery);

      expect(result.errors.deliveryDate).toBeUndefined();
      expect(result.warnings.deliveryDate).toBe('Orders placed with 24-48 hours notice may incur rush fees');
    });

    it('should not warn on date 48+ hours out', () => {
      const delivery = {
        date: new Date(Date.now() + (72 * 60 * 60 * 1000)).toISOString(), // 72 hours from now
        timeWindow: '11:00 AM - 1:00 PM',
        address: { street: '123 Main St' }
      };

      const result = validateDelivery(delivery);

      expect(result.warnings.deliveryDate).toBeUndefined();
    });

    it('should error on missing time window', () => {
      const delivery = {
        date: new Date(Date.now() + (72 * 60 * 60 * 1000)).toISOString(),
        address: { street: '123 Main St' }
      };

      const result = validateDelivery(delivery);

      expect(result.errors.deliveryTime).toBe('Please select a delivery time window');
    });

    it('should error on missing address', () => {
      const delivery = {
        date: new Date(Date.now() + (72 * 60 * 60 * 1000)).toISOString(),
        timeWindow: '11:00 AM - 1:00 PM'
      };

      const result = validateDelivery(delivery);

      expect(result.errors.deliveryAddress).toBe('Please enter a delivery address');
    });

    it('should error on incomplete address', () => {
      const delivery = {
        date: new Date(Date.now() + (72 * 60 * 60 * 1000)).toISOString(),
        timeWindow: '11:00 AM - 1:00 PM',
        address: { city: 'Philadelphia' } // Missing street
      };

      const result = validateDelivery(delivery);

      expect(result.errors.deliveryAddress).toBe('Please enter a delivery address');
    });

    it('should handle null delivery gracefully', () => {
      const result = validateDelivery(null);

      expect(result.errors).toEqual({});
      expect(result.warnings).toEqual({});
    });
  });

  describe('validateServiceArea', () => {
    it('should validate complete address', async () => {
      const address = {
        street: '123 Main St',
        city: 'Philadelphia',
        zip: '19103'
      };

      const result = await validateServiceArea(address);

      expect(result.isValid).toBe(true);
      expect(result.deliveryFee).toBe(25.00);
      expect(result.estimatedTime).toBe('60-90 minutes');
    });

    it('should error on incomplete address', async () => {
      const address = {
        street: '123 Main St'
        // Missing city and zip
      };

      const result = await validateServiceArea(address);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Complete address required for delivery validation');
    });

    it('should error on missing address', async () => {
      const result = await validateServiceArea(null);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Complete address required for delivery validation');
    });

    it('should simulate async API call', async () => {
      const address = {
        street: '123 Main St',
        city: 'Philadelphia',
        zip: '19103'
      };

      const startTime = Date.now();
      await validateServiceArea(address);
      const endTime = Date.now();

      // Should take at least 100ms (simulated API call)
      expect(endTime - startTime).toBeGreaterThanOrEqual(100);
    });
  });
});
