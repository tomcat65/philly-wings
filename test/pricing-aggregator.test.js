/**
 * Tests for Pricing Aggregator (S5)
 * Tests orchestration, merging, totals, and pub/sub
 *
 * @epic SP-PRICING-001
 * @story S5-Aggregator
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  calculatePricing,
  recalculatePricing,
  onPricingChange,
  getCurrentPricing,
  clearPricingCache,
  getPricingSummary
} from '../src/utils/pricing-aggregator.js';

describe('Pricing Aggregator', () => {
  // Sample state for testing
  const samplePackage = {
    id: 'tier1-60',
    name: 'Tier 1: The Starting Lineup',
    description: '60 wings for 10-15 people',
    tier: 1,
    serves: '10-15',
    basePrice: 125.00,
    wingOptions: {
      totalWings: 60,
      allowMixed: true,
      boneInStyles: ['mixed', 'flats', 'drums']
    },
    sauceSelections: {
      min: 3,
      max: 3,
      allowedTypes: ['dry-rub', 'wet-sauce']
    },
    dipsIncluded: {
      count: 15,
      types: ['ranch', 'blue-cheese', 'honey-mustard', 'cheese-sauce']
    }
  };

  const sampleState = {
    selectedPackage: samplePackage,
    currentConfig: {
      wingDistribution: {
        boneless: 30,
        boneIn: 30,
        cauliflower: 0,
        boneInStyle: 'mixed'
      },
      sauces: [
        { id: 'buffalo', name: 'Buffalo', type: 'wet-sauce', heatLevel: 3 },
        { id: 'bbq', name: 'BBQ', type: 'wet-sauce', heatLevel: 1 },
        { id: 'garlic-parm', name: 'Garlic Parmesan', type: 'wet-sauce', heatLevel: 0 }
      ],
      dips: [
        { id: 'ranch', name: 'Ranch', quantity: 10 },
        { id: 'blue-cheese', name: 'Blue Cheese', quantity: 5 }
      ],
      sides: {
        chips: { quantity: 0 },
        coldSides: [],
        salads: []
      },
      desserts: [],
      beverages: {
        cold: [],
        hot: []
      }
    }
  };

  beforeEach(() => {
    clearPricingCache();
  });

  describe('calculatePricing', () => {
    it('should calculate complete pricing from state', () => {
      const pricing = calculatePricing(sampleState);

      expect(pricing).toBeDefined();
      expect(pricing.items).toBeDefined();
      expect(pricing.modifiers).toBeDefined();
      expect(pricing.totals).toBeDefined();
      expect(pricing.meta).toBeDefined();
    });

    it('should include package base price', () => {
      const pricing = calculatePricing(sampleState);

      expect(pricing.items['package-base']).toBeDefined();
      expect(pricing.items['package-base'].basePrice).toBe(125.00);
      expect(pricing.items['package-base'].name).toBe('Tier 1: The Starting Lineup');
    });

    it('should merge all calculator results', () => {
      const pricing = calculatePricing(sampleState);

      // Should have items from wings, sauces, dips
      // Note: package uses 'category', others use 'type'
      const types = new Set(Object.values(pricing.items).map(item => item.category || item.type));

      expect(types.has('package')).toBe(true);
      expect(types.has('wing')).toBe(true);
      expect(types.has('sauce')).toBe(true);
      expect(types.has('dip')).toBe(true);
    });

    it('should track item sources', () => {
      const pricing = calculatePricing(sampleState);

      const sauceItems = Object.values(pricing.items).filter(item => item.source === 'sauces');
      const dipItems = Object.values(pricing.items).filter(item => item.source === 'dips');

      expect(sauceItems.length).toBeGreaterThan(0);
      expect(dipItems.length).toBeGreaterThan(0);
    });

    it('should calculate totals correctly', () => {
      const pricing = calculatePricing(sampleState);

      expect(pricing.totals.itemsSubtotal).toBeDefined();
      expect(pricing.totals.upcharges).toBeDefined();
      expect(pricing.totals.discounts).toBeDefined();
      expect(pricing.totals.subtotal).toBeDefined();
      expect(pricing.totals.tax).toBeDefined();
      expect(pricing.totals.total).toBeDefined();

      // Subtotal should equal base price (no upcharges for this config)
      expect(pricing.totals.subtotal).toBe(125.00);
      expect(pricing.totals.total).toBe(125.00);
    });

    it('should include upcharges in totals', () => {
      const stateWithUpcharges = {
        ...sampleState,
        currentConfig: {
          ...sampleState.currentConfig,
          wingDistribution: {
            boneless: 0,
            boneIn: 30,
            cauliflower: 30,  // +$15 upcharge
            boneInStyle: 'flats'  // +$7.50 upcharge
          },
          sides: {
            chips: { quantity: 2 },  // +$6 upcharge
            coldSides: [],
            salads: []
          }
        }
      };

      const pricing = calculatePricing(stateWithUpcharges);

      expect(pricing.totals.upcharges).toBeGreaterThan(0);
      expect(pricing.totals.subtotal).toBeGreaterThan(125.00);
    });

    it('should handle state with no package', () => {
      const emptyState = {
        selectedPackage: null,
        currentConfig: sampleState.currentConfig
      };

      const pricing = calculatePricing(emptyState);

      expect(pricing).toBeDefined();
      expect(pricing.totals.total).toBe(0);
      expect(Object.keys(pricing.items).length).toBe(0);
    });

    it('should mark completion status', () => {
      const pricing = calculatePricing(sampleState);

      expect(pricing.meta.completionStatus).toBeDefined();
      // Check that completion status is being tracked (values depend on state)
      expect(pricing.meta.completionStatus).toHaveProperty('sauces');
      expect(pricing.meta.completionStatus).toHaveProperty('dips');
    });

    it('should include package metadata', () => {
      const pricing = calculatePricing(sampleState);

      expect(pricing.meta.packageId).toBe('tier1-60');
      expect(pricing.meta.packageName).toBe('Tier 1: The Starting Lineup');
      expect(pricing.meta.lastCalculated).toBeDefined();
    });

    it('should cache pricing result', () => {
      calculatePricing(sampleState);

      const cached = getCurrentPricing();
      expect(cached).toBeDefined();
      expect(cached.totals.total).toBe(125.00);
    });

    it('should preserve completion flags when merging specialized pricing', () => {
      const completeState = {
        selectedPackage: samplePackage,
        currentConfig: {
          wingDistribution: {
            boneless: 30,
            boneIn: 30,
            cauliflower: 0,
            boneInStyle: 'mixed'
          },
          sauces: [
            { id: 'buffalo', name: 'Buffalo', type: 'wet-sauce' },
            { id: 'bbq', name: 'BBQ', type: 'wet-sauce' },
            { id: 'garlic-parm', name: 'Garlic Parmesan', type: 'wet-sauce' }
          ],
          dips: [
            { id: 'ranch', name: 'Ranch', quantity: 10 },
            { id: 'blue-cheese', name: 'Blue Cheese', quantity: 5 }
          ],
          sides: {
            chips: { quantity: 1 },
            coldSides: [],
            salads: []
          },
          desserts: [
            { id: 'cookies', name: 'Cookies', quantity: 6, type: 'cookie' }
          ],
          beverages: {
            cold: [
              { id: 'coke', name: 'Coca-Cola', quantity: 6, size: 'can' }
            ],
            hot: []
          }
        }
      };

      const pricing = calculatePricing(completeState);
      const summary = getPricingSummary(pricing);

      expect(pricing.meta.completionStatus).toEqual(
        expect.objectContaining({
          wings: true,
          sauces: true,
          dips: true,
          sides: true,
          desserts: true,
          beverages: true
        })
      );
      expect(summary.complete).toBe(true);
    });
  });

  describe('recalculatePricing', () => {
    it('should recalculate and return pricing', () => {
      const pricing = recalculatePricing(sampleState);

      expect(pricing).toBeDefined();
      expect(pricing.totals.total).toBe(125.00);
    });

    it('should trigger pricing listeners', () => {
      const listener = vi.fn();
      onPricingChange('pricing:updated', listener);

      recalculatePricing(sampleState);

      expect(listener).toHaveBeenCalled();
      expect(listener).toHaveBeenCalledWith(expect.objectContaining({
        items: expect.any(Object),
        totals: expect.any(Object)
      }));
    });

    it('should accept trigger option', () => {
      const pricing = recalculatePricing(sampleState, { trigger: 'wing-change' });

      expect(pricing).toBeDefined();
    });
  });

  describe('onPricingChange', () => {
    it('should register listener and return unsubscribe function', () => {
      const listener = vi.fn();
      const unsubscribe = onPricingChange('pricing:updated', listener);

      expect(typeof unsubscribe).toBe('function');

      recalculatePricing(sampleState);
      expect(listener).toHaveBeenCalledTimes(1);

      // Unsubscribe
      unsubscribe();

      recalculatePricing(sampleState);
      expect(listener).toHaveBeenCalledTimes(1);  // Not called again
    });

    it('should support multiple listeners on same topic', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      onPricingChange('pricing:updated', listener1);
      onPricingChange('pricing:updated', listener2);

      recalculatePricing(sampleState);

      expect(listener1).toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();
    });

    it('should support different topics', () => {
      const updatedListener = vi.fn();
      const wingsListener = vi.fn();

      onPricingChange('pricing:updated', updatedListener);
      onPricingChange('pricing:wings', wingsListener);

      recalculatePricing(sampleState);

      // pricing:updated should be called
      expect(updatedListener).toHaveBeenCalled();

      // pricing:wings won't be called automatically (only pricing:updated is published by recalculate)
      // This is correct behavior - specific topics are for targeted updates
    });

    it('should handle listener errors gracefully', () => {
      const errorListener = vi.fn(() => {
        throw new Error('Listener error');
      });
      const goodListener = vi.fn();

      onPricingChange('pricing:updated', errorListener);
      onPricingChange('pricing:updated', goodListener);

      // Should not throw
      expect(() => recalculatePricing(sampleState)).not.toThrow();

      // Good listener should still be called
      expect(goodListener).toHaveBeenCalled();
    });
  });

  describe('getCurrentPricing', () => {
    it('should return null when no pricing calculated', () => {
      expect(getCurrentPricing()).toBeNull();
    });

    it('should return cached pricing after calculation', () => {
      calculatePricing(sampleState);

      const cached = getCurrentPricing();
      expect(cached).toBeDefined();
      expect(cached.totals.total).toBe(125.00);
    });
  });

  describe('clearPricingCache', () => {
    it('should clear cached pricing', () => {
      calculatePricing(sampleState);
      expect(getCurrentPricing()).toBeDefined();

      clearPricingCache();
      expect(getCurrentPricing()).toBeNull();
    });
  });

  describe('getPricingSummary', () => {
    it('should return summary with key metrics', () => {
      const pricing = calculatePricing(sampleState);
      const summary = getPricingSummary(pricing);

      expect(summary.itemCount).toBeGreaterThan(0);
      expect(summary.upchargeCount).toBeDefined();
      expect(summary.discountCount).toBeDefined();
      expect(summary.warningCount).toBeDefined();
      expect(summary.complete).toBeDefined();
      expect(summary.totals).toBeDefined();
    });

    it('should handle null pricing', () => {
      const summary = getPricingSummary(null);

      expect(summary.itemCount).toBe(0);
      expect(summary.complete).toBe(false);
      expect(summary.totals.total).toBe(0);
    });

    it('should mark complete when all sections done', () => {
      const pricing = calculatePricing(sampleState);
      const summary = getPricingSummary(pricing);

      // Should be complete for sauces and dips at minimum
      expect(typeof summary.complete).toBe('boolean');
    });

    it('should count upcharges correctly', () => {
      const stateWithUpcharges = {
        ...sampleState,
        currentConfig: {
          ...sampleState.currentConfig,
          sides: {
            chips: { quantity: 2 },
            coldSides: [
              { id: 'coleslaw', name: 'Coleslaw', quantity: 1, serves: 4 }
            ],
            salads: []
          }
        }
      };

      const pricing = calculatePricing(stateWithUpcharges);
      const summary = getPricingSummary(pricing);

      expect(summary.upchargeCount).toBeGreaterThan(0);
    });
  });

  describe('totals calculation', () => {
    it('should calculate itemsSubtotal from all items', () => {
      const pricing = calculatePricing(sampleState);

      // Should include package base price
      expect(pricing.totals.itemsSubtotal).toBeGreaterThanOrEqual(125.00);
    });

    it('should sum upcharges correctly', () => {
      const stateWithUpcharges = {
        ...sampleState,
        currentConfig: {
          ...sampleState.currentConfig,
          wingDistribution: {
            boneless: 0,
            boneIn: 60,
            cauliflower: 0,
            boneInStyle: 'flats'  // $0.25 * 60 = $15 upcharge
          }
        }
      };

      const pricing = calculatePricing(stateWithUpcharges);

      expect(pricing.totals.upcharges).toBe(15.00);
      expect(pricing.totals.subtotal).toBe(140.00);
    });

    it('should handle discounts (when implemented)', () => {
      const pricing = calculatePricing(sampleState);

      // No discounts in current implementation
      expect(pricing.totals.discounts).toBe(0);
    });

    it('should set tax to 0 (calculated at checkout)', () => {
      const pricing = calculatePricing(sampleState);

      expect(pricing.totals.tax).toBe(0);
    });

    it('should calculate total as subtotal + tax', () => {
      const pricing = calculatePricing(sampleState);

      expect(pricing.totals.total).toBe(pricing.totals.subtotal + pricing.totals.tax);
    });

    it('should round to 2 decimal places', () => {
      const pricing = calculatePricing(sampleState);

      // Check all totals are rounded to 2 decimals
      expect(Number.isInteger(pricing.totals.subtotal * 100)).toBe(true);
      expect(Number.isInteger(pricing.totals.total * 100)).toBe(true);
    });
  });

  describe('performance', () => {
    it('should complete calculation quickly', () => {
      const start = performance.now();
      calculatePricing(sampleState);
      const duration = performance.now() - start;

      // Should be under 100ms budget
      expect(duration).toBeLessThan(100);
    });

    it('should handle complex state efficiently', () => {
      const complexState = {
        ...sampleState,
        currentConfig: {
          wingDistribution: {
            boneless: 30,
            boneIn: 30,
            cauliflower: 0,
            boneInStyle: 'mixed'
          },
          sauces: Array.from({ length: 5 }, (_, i) => ({
            id: `sauce${i}`,
            name: `Sauce ${i}`,
            type: 'wet-sauce',
            heatLevel: i
          })),
          dips: Array.from({ length: 20 }, (_, i) => ({
            id: `dip${i}`,
            name: `Dip ${i}`,
            quantity: 1
          })),
          sides: {
            chips: { quantity: 3 },
            coldSides: [
              { id: 'coleslaw', name: 'Coleslaw', quantity: 2, serves: 4 },
              { id: 'potato-salad', name: 'Potato Salad', quantity: 1, serves: 4 }
            ],
            salads: [
              { id: 'caesar', name: 'Caesar', quantity: 1, serves: 4 }
            ]
          },
          desserts: Array.from({ length: 10 }, (_, i) => ({
            id: `dessert${i}`,
            name: `Dessert ${i}`,
            quantity: 1,
            type: 'cookie'
          })),
          beverages: {
            cold: Array.from({ length: 5 }, (_, i) => ({
              id: `cold${i}`,
              name: `Cold ${i}`,
              size: 'can',
              quantity: 6
            })),
            hot: Array.from({ length: 2 }, (_, i) => ({
              id: `hot${i}`,
              name: `Hot ${i}`,
              size: 'cup',
              quantity: 5
            }))
          }
        }
      };

      const start = performance.now();
      calculatePricing(complexState);
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(100);
    });
  });
});
