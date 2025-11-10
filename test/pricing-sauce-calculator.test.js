/**
 * Tests for Sauce Pricing Calculator (S3)
 * Tests sauce selection, validation, upcharges, and bulk pricing
 *
 * @epic SP-PRICING-001
 * @story S3-Sauces
 */

import { describe, it, expect } from 'vitest';
import {
  calculateSaucePricing,
  validateSauceSelections,
  calculateBulkSaucePricing,
  getSauceSummary,
  getSauceTypeLabel,
  getHeatLevelIndicator,
  SAUCE_PRICING
} from '../src/utils/pricing-sauce-calculator.js';

describe('Sauce Pricing Calculator', () => {
  const defaultPackage = {
    min: 3,
    max: 3,
    allowedTypes: ['dry-rub', 'wet-sauce']
  };

  const sampleSauces = [
    { id: 'buffalo', name: 'Buffalo', type: 'wet-sauce', heatLevel: 3 },
    { id: 'bbq', name: 'BBQ', type: 'wet-sauce', heatLevel: 1 },
    { id: 'garlic-parm', name: 'Garlic Parmesan', type: 'wet-sauce', heatLevel: 0 }
  ];

  describe('calculateSaucePricing', () => {
    it('should calculate pricing for included sauces only', () => {
      const pricing = calculateSaucePricing(sampleSauces, defaultPackage);

      expect(Object.keys(pricing.items).length).toBe(3);
      expect(pricing.items['sauce-buffalo']).toBeDefined();
      expect(pricing.items['sauce-buffalo'].included).toBe(true);

      // No upcharges for included sauces
      const upcharges = pricing.modifiers.filter(m => m.type === 'upcharge');
      expect(upcharges.length).toBe(0);
    });

    it('should calculate pricing for extra sauces', () => {
      const extraSauces = [
        ...sampleSauces,
        { id: 'honey-hot', name: 'Honey Hot', type: 'wet-sauce', heatLevel: 3 },
        { id: 'teriyaki', name: 'Teriyaki', type: 'wet-sauce', heatLevel: 1 }
      ];

      const pricing = calculateSaucePricing(extraSauces, defaultPackage);

      // Should have 3 included + 2 extra = 5 total
      expect(Object.keys(pricing.items).length).toBe(5);

      // Should have 2 upcharges for extra sauces
      const upcharges = pricing.modifiers.filter(m => m.type === 'upcharge');
      expect(upcharges.length).toBe(2);
      expect(upcharges[0].amount).toBe(SAUCE_PRICING.EXTRA.perSauce);
      expect(upcharges[1].amount).toBe(SAUCE_PRICING.EXTRA.perSauce);
    });

    it('should mark included vs extra sauces correctly', () => {
      const extraSauces = [
        ...sampleSauces,
        { id: 'honey-hot', name: 'Honey Hot', type: 'wet-sauce', heatLevel: 3 }
      ];

      const pricing = calculateSaucePricing(extraSauces, defaultPackage);

      // First 3 should be included
      expect(pricing.items['sauce-buffalo'].included).toBe(true);
      expect(pricing.items['sauce-bbq'].included).toBe(true);
      expect(pricing.items['sauce-garlic-parm'].included).toBe(true);

      // 4th should be extra
      expect(pricing.items['sauce-extra-honey-hot'].included).toBe(false);
    });

    it('should suggest bulk pricing for 5+ extra sauces', () => {
      const manySauces = [
        ...sampleSauces,
        { id: 's4', name: 'Sauce 4', type: 'wet-sauce', heatLevel: 2 },
        { id: 's5', name: 'Sauce 5', type: 'wet-sauce', heatLevel: 2 },
        { id: 's6', name: 'Sauce 6', type: 'wet-sauce', heatLevel: 2 },
        { id: 's7', name: 'Sauce 7', type: 'wet-sauce', heatLevel: 2 },
        { id: 's8', name: 'Sauce 8', type: 'wet-sauce', heatLevel: 2 }
      ];

      const pricing = calculateSaucePricing(manySauces, defaultPackage);

      // Should have bulk pricing warning
      const warnings = pricing.modifiers.filter(m => m.type === 'warning');
      const bulkWarning = warnings.find(w => w.label.includes('5-pack'));

      expect(bulkWarning).toBeDefined();
      expect(bulkWarning.label).toContain('Save');
    });

    it('should suggest 10-pack for 10+ extra sauces', () => {
      const manySauces = Array.from({ length: 13 }, (_, i) => ({
        id: `s${i}`,
        name: `Sauce ${i}`,
        type: 'wet-sauce',
        heatLevel: 2
      }));

      const pricing = calculateSaucePricing(manySauces, defaultPackage);

      // Should have 10-pack bulk pricing warning
      const warnings = pricing.modifiers.filter(m => m.type === 'warning');
      const bulkWarning = warnings.find(w => w.label.includes('10-pack'));

      expect(bulkWarning).toBeDefined();
    });

    it('should mark completion status when within min/max', () => {
      const pricing = calculateSaucePricing(sampleSauces, defaultPackage);

      expect(pricing.meta.completionStatus.sauces).toBe(true);
    });

    it('should mark incomplete when below minimum', () => {
      const pricing = calculateSaucePricing([sampleSauces[0]], defaultPackage);

      expect(pricing.meta.completionStatus.sauces).toBe(false);
    });

    it('should handle empty sauce list', () => {
      const pricing = calculateSaucePricing([], defaultPackage);

      expect(Object.keys(pricing.items).length).toBe(0);
      expect(pricing.meta.completionStatus.sauces).toBe(false);
    });

    it('should handle different package configurations', () => {
      const tier2Package = {
        min: 4,
        max: 4,
        allowedTypes: ['dry-rub', 'wet-sauce']
      };

      const fourSauces = [
        ...sampleSauces,
        { id: 'honey-hot', name: 'Honey Hot', type: 'wet-sauce', heatLevel: 3 }
      ];

      const pricing = calculateSaucePricing(fourSauces, tier2Package);

      // All 4 should be included (no extra)
      const upcharges = pricing.modifiers.filter(m => m.type === 'upcharge');
      expect(upcharges.length).toBe(0);
      expect(pricing.meta.completionStatus.sauces).toBe(true);
    });
  });

  describe('validateSauceSelections', () => {
    it('should validate correct sauce count', () => {
      const result = validateSauceSelections(sampleSauces, defaultPackage);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should reject below minimum', () => {
      const result = validateSauceSelections([sampleSauces[0]], defaultPackage);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Select at least 3'))).toBe(true);
    });

    it('should warn about extra sauces', () => {
      const extraSauces = [
        ...sampleSauces,
        { id: 'honey-hot', name: 'Honey Hot', type: 'wet-sauce', heatLevel: 3 }
      ];

      const result = validateSauceSelections(extraSauces, defaultPackage);

      expect(result.errors.some(e => e.includes('1 extra sauce'))).toBe(true);
    });

    it('should detect duplicate sauces', () => {
      const duplicates = [
        ...sampleSauces,
        { id: 'buffalo', name: 'Buffalo', type: 'wet-sauce', heatLevel: 3 } // duplicate
      ];

      const result = validateSauceSelections(duplicates, defaultPackage);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Duplicate sauces'))).toBe(true);
    });

    it('should reject disallowed sauce types', () => {
      const invalidSauces = [
        ...sampleSauces,
        { id: 'custom', name: 'Custom', type: 'custom-type', heatLevel: 0 }
      ];

      const result = validateSauceSelections(invalidSauces, defaultPackage);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('not allowed'))).toBe(true);
    });

    it('should allow dry-rub sauces when permitted', () => {
      const mixedSauces = [
        { id: 'lemon-pepper', name: 'Lemon Pepper', type: 'dry-rub', heatLevel: 0 },
        { id: 'buffalo', name: 'Buffalo', type: 'wet-sauce', heatLevel: 3 },
        { id: 'bbq', name: 'BBQ', type: 'wet-sauce', heatLevel: 1 }
      ];

      const result = validateSauceSelections(mixedSauces, defaultPackage);

      expect(result.valid).toBe(true);
    });

    it('should reject dry-rub when not allowed', () => {
      const wetOnlyPackage = {
        min: 3,
        max: 3,
        allowedTypes: ['wet-sauce']
      };

      const mixedSauces = [
        { id: 'lemon-pepper', name: 'Lemon Pepper', type: 'dry-rub', heatLevel: 0 },
        { id: 'buffalo', name: 'Buffalo', type: 'wet-sauce', heatLevel: 3 },
        { id: 'bbq', name: 'BBQ', type: 'wet-sauce', heatLevel: 1 }
      ];

      const result = validateSauceSelections(mixedSauces, wetOnlyPackage);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('dry-rub'))).toBe(true);
    });
  });

  describe('calculateBulkSaucePricing', () => {
    it('should return no bulk pricing for less than 5 extra', () => {
      const result = calculateBulkSaucePricing(3);

      expect(result.regularPrice).toBe(3 * SAUCE_PRICING.EXTRA.perSauce);
      expect(result.bulkPrice).toBeNull();
      expect(result.savings).toBe(0);
      expect(result.recommended).toBe(false);
    });

    it('should calculate 5-pack pricing for 5-9 extra sauces', () => {
      const result = calculateBulkSaucePricing(5);

      expect(result.regularPrice).toBe(10.00); // 5 * $2.00
      expect(result.bulkPrice).toBe(SAUCE_PRICING.EXTRA.bulk5);
      expect(result.savings).toBe(2.00);
      expect(result.bulkType).toBe('5-pack');
      expect(result.recommended).toBe(true);
    });

    it('should calculate 10-pack pricing for 10+ extra sauces', () => {
      const result = calculateBulkSaucePricing(10);

      expect(result.regularPrice).toBe(20.00); // 10 * $2.00
      expect(result.bulkPrice).toBe(SAUCE_PRICING.EXTRA.bulk10);
      expect(result.savings).toBe(5.00);
      expect(result.bulkType).toBe('10-pack');
      expect(result.recommended).toBe(true);
    });

    it('should prefer 10-pack over 5-pack when applicable', () => {
      const result = calculateBulkSaucePricing(12);

      expect(result.bulkType).toBe('10-pack');
      expect(result.bulkPrice).toBe(SAUCE_PRICING.EXTRA.bulk10);
    });
  });

  describe('getSauceSummary', () => {
    it('should generate complete summary', () => {
      const summary = getSauceSummary(sampleSauces, defaultPackage);

      expect(summary.total).toBe(3);
      expect(summary.included).toBe(3);
      expect(summary.extra).toBe(0);
      expect(summary.complete).toBe(true);
    });

    it('should group sauces by type', () => {
      const mixedSauces = [
        { id: 'lemon-pepper', name: 'Lemon Pepper', type: 'dry-rub', heatLevel: 0 },
        { id: 'buffalo', name: 'Buffalo', type: 'wet-sauce', heatLevel: 3 },
        { id: 'bbq', name: 'BBQ', type: 'wet-sauce', heatLevel: 1 }
      ];

      const summary = getSauceSummary(mixedSauces, defaultPackage);

      expect(summary.byType['wet-sauce']).toBe(2);
      expect(summary.byType['dry-rub']).toBe(1);
    });

    it('should group sauces by heat level', () => {
      const summary = getSauceSummary(sampleSauces, defaultPackage);

      expect(summary.byHeatLevel[0]).toBe(1); // Garlic Parm
      expect(summary.byHeatLevel[1]).toBe(1); // BBQ
      expect(summary.byHeatLevel[3]).toBe(1); // Buffalo
    });

    it('should calculate extra sauce counts and pricing', () => {
      const extraSauces = [
        ...sampleSauces,
        { id: 'honey-hot', name: 'Honey Hot', type: 'wet-sauce', heatLevel: 3 },
        { id: 'teriyaki', name: 'Teriyaki', type: 'wet-sauce', heatLevel: 1 }
      ];

      const summary = getSauceSummary(extraSauces, defaultPackage);

      expect(summary.total).toBe(5);
      expect(summary.included).toBe(3);
      expect(summary.extra).toBe(2);
      expect(summary.pricing.extraSauceCost).toBe(4.00);
    });

    it('should include bulk pricing information', () => {
      const manySauces = Array.from({ length: 8 }, (_, i) => ({
        id: `s${i}`,
        name: `Sauce ${i}`,
        type: 'wet-sauce',
        heatLevel: 2
      }));

      const summary = getSauceSummary(manySauces, defaultPackage);

      expect(summary.pricing.bulkPricing.recommended).toBe(true);
      expect(summary.pricing.bulkPricing.bulkType).toBe('5-pack');
    });

    it('should handle empty sauce list', () => {
      const summary = getSauceSummary([], defaultPackage);

      expect(summary.total).toBe(0);
      expect(summary.included).toBe(0);
      expect(summary.extra).toBe(0);
      expect(summary.complete).toBe(false);
    });
  });

  describe('getSauceTypeLabel', () => {
    it('should return label for dry-rub', () => {
      expect(getSauceTypeLabel('dry-rub')).toBe('Dry Rub');
    });

    it('should return label for wet-sauce', () => {
      expect(getSauceTypeLabel('wet-sauce')).toBe('Wet Sauce');
    });

    it('should return original for unknown type', () => {
      expect(getSauceTypeLabel('unknown')).toBe('unknown');
    });
  });

  describe('getHeatLevelIndicator', () => {
    it('should return correct indicators for all levels', () => {
      expect(getHeatLevelIndicator(0)).toBe('🟢');
      expect(getHeatLevelIndicator(1)).toBe('🟢');
      expect(getHeatLevelIndicator(2)).toBe('🟡');
      expect(getHeatLevelIndicator(3)).toBe('🟠');
      expect(getHeatLevelIndicator(4)).toBe('🔴');
      expect(getHeatLevelIndicator(5)).toBe('💀');
    });

    it('should default to green for unknown levels', () => {
      expect(getHeatLevelIndicator(99)).toBe('🟢');
    });
  });

  describe('SAUCE_PRICING constants', () => {
    it('should define included pricing', () => {
      expect(SAUCE_PRICING.INCLUDED).toBe(0);
    });

    it('should define extra sauce pricing', () => {
      expect(SAUCE_PRICING.EXTRA.perSauce).toBe(2.00);
      expect(SAUCE_PRICING.EXTRA.bulk5).toBe(8.00);
      expect(SAUCE_PRICING.EXTRA.bulk10).toBe(15.00);
    });

    it('should define sauce types', () => {
      expect(SAUCE_PRICING.TYPES['dry-rub']).toBeDefined();
      expect(SAUCE_PRICING.TYPES['wet-sauce']).toBeDefined();
      expect(SAUCE_PRICING.TYPES['dry-rub'].length).toBeGreaterThan(0);
      expect(SAUCE_PRICING.TYPES['wet-sauce'].length).toBeGreaterThan(0);
    });
  });
});
