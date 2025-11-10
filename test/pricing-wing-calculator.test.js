/**
 * Tests for Wing Pricing Calculator (S2)
 * Tests wing distribution, validation, upcharges, and sauce allocation
 *
 * @epic SP-PRICING-001
 * @story S2-Wings
 */

import { describe, it, expect } from 'vitest';
import {
  calculateWingPricing,
  calculateDistributionDifferential,
  validateWingDistribution,
  calculateSauceAllocation,
  getWingTypeSummary,
  WING_PRICING
} from '../src/utils/pricing-wing-calculator.js';

describe('Wing Pricing Calculator', () => {
  const defaultPackage = {
    totalWings: 60
  };

  describe('calculateWingPricing', () => {
    it('should calculate pricing for all boneless wings', () => {
      const distribution = {
        boneless: 60,
        boneIn: 0,
        cauliflower: 0,
        boneInStyle: 'mixed'
      };

      const pricing = calculateWingPricing(distribution, defaultPackage);

      expect(pricing.items['wings-boneless']).toBeDefined();
      expect(pricing.items['wings-boneless'].quantity).toBe(60);
      expect(pricing.items['wings-boneless'].type).toBe('wing');
      expect(pricing.items['wings-boneless'].wingType).toBe('boneless');
      expect(pricing.modifiers.filter(m => m.type === 'upcharge').length).toBe(0);
    });

    it('should calculate pricing for all bone-in wings (mixed)', () => {
      const distribution = {
        boneless: 0,
        boneIn: 60,
        cauliflower: 0,
        boneInStyle: 'mixed'
      };

      const pricing = calculateWingPricing(distribution, defaultPackage);

      expect(pricing.items['wings-bone-in']).toBeDefined();
      expect(pricing.items['wings-bone-in'].quantity).toBe(60);
      expect(pricing.items['wings-bone-in'].style).toBe('mixed');
      expect(pricing.modifiers.filter(m => m.type === 'upcharge').length).toBe(0);
    });

    it('should apply upcharge for flats only', () => {
      const distribution = {
        boneless: 0,
        boneIn: 60,
        cauliflower: 0,
        boneInStyle: 'flats'
      };

      const pricing = calculateWingPricing(distribution, defaultPackage);

      const upchargeMods = pricing.modifiers.filter(m => m.type === 'upcharge');
      expect(upchargeMods.length).toBe(1);
      expect(upchargeMods[0].amount).toBe(60 * WING_PRICING.UPCHARGES.flatsOnly);
      expect(upchargeMods[0].label).toContain('Flats only');
    });

    it('should apply upcharge for drums only', () => {
      const distribution = {
        boneless: 0,
        boneIn: 60,
        cauliflower: 0,
        boneInStyle: 'drums'
      };

      const pricing = calculateWingPricing(distribution, defaultPackage);

      const upchargeMods = pricing.modifiers.filter(m => m.type === 'upcharge');
      expect(upchargeMods.length).toBe(1);
      expect(upchargeMods[0].amount).toBe(60 * WING_PRICING.UPCHARGES.drumsOnly);
      expect(upchargeMods[0].label).toContain('Drums only');
    });

    it('should calculate pricing for cauliflower wings with upcharge', () => {
      const distribution = {
        boneless: 0,
        boneIn: 0,
        cauliflower: 60,
        boneInStyle: 'mixed'
      };

      const pricing = calculateWingPricing(distribution, defaultPackage);

      expect(pricing.items['wings-cauliflower']).toBeDefined();
      expect(pricing.items['wings-cauliflower'].quantity).toBe(60);
      expect(pricing.items['wings-cauliflower'].dietary).toContain('vegan');

      const upchargeMods = pricing.modifiers.filter(m => m.type === 'upcharge');
      expect(upchargeMods.length).toBe(1);
      expect(upchargeMods[0].amount).toBe(60 * WING_PRICING.UPCHARGES.cauliflower);
    });

    it('should handle mixed wing types', () => {
      const distribution = {
        boneless: 20,
        boneIn: 20,
        cauliflower: 20,
        boneInStyle: 'mixed'
      };

      const pricing = calculateWingPricing(distribution, defaultPackage);

      expect(pricing.items['wings-boneless']).toBeDefined();
      expect(pricing.items['wings-bone-in']).toBeDefined();
      expect(pricing.items['wings-cauliflower']).toBeDefined();

      // Only cauliflower should have upcharge (bone-in is mixed)
      const upchargeMods = pricing.modifiers.filter(m => m.type === 'upcharge');
      expect(upchargeMods.length).toBe(1);
      expect(upchargeMods[0].itemId).toBe('wings-cauliflower');
    });

    it('should handle mixed wing types with flats only', () => {
      const distribution = {
        boneless: 20,
        boneIn: 20,
        cauliflower: 20,
        boneInStyle: 'flats'
      };

      const pricing = calculateWingPricing(distribution, defaultPackage);

      // Both bone-in (flats) and cauliflower should have upcharges
      const upchargeMods = pricing.modifiers.filter(m => m.type === 'upcharge');
      expect(upchargeMods.length).toBe(2);

      const flatsUpcharge = upchargeMods.find(m => m.itemId === 'wings-bone-in');
      const cauliUpcharge = upchargeMods.find(m => m.itemId === 'wings-cauliflower');

      expect(flatsUpcharge.amount).toBe(20 * WING_PRICING.UPCHARGES.flatsOnly);
      expect(cauliUpcharge.amount).toBe(20 * WING_PRICING.UPCHARGES.cauliflower);
    });

    it('should mark completion status when distribution matches package', () => {
      const distribution = {
        boneless: 30,
        boneIn: 30,
        cauliflower: 0,
        boneInStyle: 'mixed'
      };

      const pricing = calculateWingPricing(distribution, defaultPackage);

      expect(pricing.meta.completionStatus.wings).toBe(true);
    });

    it('should mark incomplete when distribution does not match package', () => {
      const distribution = {
        boneless: 20,
        boneIn: 20,
        cauliflower: 0,
        boneInStyle: 'mixed'
      };

      const pricing = calculateWingPricing(distribution, defaultPackage);

      expect(pricing.meta.completionStatus.wings).toBe(false);
    });

    it('should warn about extra wings', () => {
      const distribution = {
        boneless: 40,
        boneIn: 30,
        cauliflower: 0,
        boneInStyle: 'mixed'
      };

      const pricing = calculateWingPricing(distribution, defaultPackage);

      const warnings = pricing.modifiers.filter(m => m.type === 'warning');
      expect(warnings.length).toBeGreaterThan(0);

      // Should have both validation warning and extra wings warning
      const extraWingsWarning = warnings.find(w => w.label.includes('extra wings'));
      expect(extraWingsWarning).toBeDefined();
      expect(extraWingsWarning.label).toContain('10 extra wings');
    });

    it('should apply distribution differential when schema is present (SP-OS-S1)', () => {
      const packageWithSchema = {
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
      };

      // User changes to 100 boneless, 100 bone-in (more expensive)
      const distribution = {
        boneless: 100,
        boneIn: 100,
        cauliflower: 0,
        boneInStyle: 'mixed'
      };

      const pricing = calculateWingPricing(distribution, packageWithSchema);

      // Should have a distribution differential upcharge
      const distributionMod = pricing.modifiers.find(m => m.itemId === 'wings-distribution');
      expect(distributionMod).toBeDefined();
      expect(distributionMod.type).toBe('upcharge');
      expect(distributionMod.amount).toBe(10.00); // Differential from test above
      expect(distributionMod.label).toContain('Wing distribution adjustment');
    });

    it('should apply distribution savings when switching to cheaper wings (SP-OS-S1)', () => {
      const packageWithSchema = {
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
      };

      // User changes to all boneless (cheaper)
      const distribution = {
        boneless: 200,
        boneIn: 0,
        cauliflower: 0,
        boneInStyle: 'mixed'
      };

      const pricing = calculateWingPricing(distribution, packageWithSchema);

      // Should have a distribution differential discount
      const distributionMod = pricing.modifiers.find(m => m.itemId === 'wings-distribution');
      expect(distributionMod).toBeDefined();
      expect(distributionMod.type).toBe('discount');
      expect(distributionMod.amount).toBe(10.00); // Absolute value
      expect(distributionMod.label).toContain('Wing distribution savings');
    });

    it('should not add differential modifier when distribution matches defaults (SP-OS-S1)', () => {
      const packageWithSchema = {
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
      };

      // User keeps default distribution
      const distribution = {
        boneless: 150,
        boneIn: 50,
        cauliflower: 0,
        boneInStyle: 'mixed'
      };

      const pricing = calculateWingPricing(distribution, packageWithSchema);

      // Should NOT have a distribution differential modifier
      const distributionMod = pricing.modifiers.find(m => m.itemId === 'wings-distribution');
      expect(distributionMod).toBeUndefined();
    });

    it('should work without schema (backward compatibility for SP-OS-S1)', () => {
      const packageWithoutSchema = {
        totalWings: 60
      };

      const distribution = {
        boneless: 30,
        boneIn: 30,
        cauliflower: 0,
        boneInStyle: 'mixed'
      };

      // Should not throw error and should not add differential
      const pricing = calculateWingPricing(distribution, packageWithoutSchema);

      const distributionMod = pricing.modifiers.find(m => m.itemId === 'wings-distribution');
      expect(distributionMod).toBeUndefined();
    });
  });

  describe('validateWingDistribution', () => {
    it('should validate correct distribution', () => {
      const distribution = {
        boneless: 30,
        boneIn: 30,
        cauliflower: 0
      };

      const result = validateWingDistribution(distribution, defaultPackage);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should reject distribution not matching package total', () => {
      const distribution = {
        boneless: 20,
        boneIn: 20,
        cauliflower: 0
      };

      const result = validateWingDistribution(distribution, defaultPackage);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('must equal package amount');
    });

    it('should enforce minimum per type when mixing', () => {
      const distribution = {
        boneless: 55,
        boneIn: 5, // Below minimum of 10
        cauliflower: 0
      };

      const result = validateWingDistribution(distribution, defaultPackage);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Minimum 10 bone-in'))).toBe(true);
    });

    it('should allow single type below minimum', () => {
      const distribution = {
        boneless: 0,
        boneIn: 60,
        cauliflower: 0
      };

      const result = validateWingDistribution(distribution, defaultPackage);

      expect(result.valid).toBe(true);
    });

    it('should reject negative quantities', () => {
      const distribution = {
        boneless: 70,
        boneIn: -10,
        cauliflower: 0
      };

      const result = validateWingDistribution(distribution, defaultPackage);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('cannot be negative'))).toBe(true);
    });

    it('should validate all three types mixed correctly', () => {
      const distribution = {
        boneless: 20,
        boneIn: 20,
        cauliflower: 20
      };

      const result = validateWingDistribution(distribution, defaultPackage);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should reject if any mixed type is below minimum', () => {
      const distribution = {
        boneless: 25,
        boneIn: 30,
        cauliflower: 5 // Below minimum
      };

      const result = validateWingDistribution(distribution, defaultPackage);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Minimum 10 cauliflower'))).toBe(true);
    });
  });

  describe('calculateDistributionDifferential (SP-OS-S1)', () => {
    const packageWithSchema = {
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
    };

    it('should return zero differential when distribution matches defaults', () => {
      const currentDistribution = {
        boneless: 150,
        boneIn: 50,
        cauliflower: 0
      };

      const result = calculateDistributionDifferential(currentDistribution, packageWithSchema);

      expect(result.differential).toBe(0);
      expect(result.breakdown.current.total).toBe(result.breakdown.default.total);
    });

    it('should calculate positive differential when switching to more expensive wings', () => {
      // Switch from 150 boneless ($0.80) to 100 bone-in ($1.00)
      // Lose 50 × $0.80 = -$40.00
      // Gain 50 × $1.00 = +$50.00
      // Differential = +$10.00
      const currentDistribution = {
        boneless: 100,
        boneIn: 100,
        cauliflower: 0
      };

      const result = calculateDistributionDifferential(currentDistribution, packageWithSchema);

      expect(result.differential).toBe(10.00);
      expect(result.breakdown.current.total).toBe(180.00); // 100×0.80 + 100×1.00
      expect(result.breakdown.default.total).toBe(170.00); // 150×0.80 + 50×1.00
    });

    it('should calculate negative differential when switching to cheaper wings', () => {
      // Switch from 50 bone-in ($1.00) to 50 boneless ($0.80)
      // Lose 50 × $1.00 = -$50.00
      // Gain 50 × $0.80 = +$40.00
      // Differential = -$10.00
      const currentDistribution = {
        boneless: 200,
        boneIn: 0,
        cauliflower: 0
      };

      const result = calculateDistributionDifferential(currentDistribution, packageWithSchema);

      expect(result.differential).toBe(-10.00);
      expect(result.breakdown.current.total).toBe(160.00); // 200×0.80
      expect(result.breakdown.default.total).toBe(170.00); // 150×0.80 + 50×1.00
    });

    it('should calculate differential for cauliflower wings', () => {
      // Switch from 50 bone-in ($1.00) to 50 cauliflower ($1.30)
      // Lose 50 × $1.00 = -$50.00
      // Gain 50 × $1.30 = +$65.00
      // Differential = +$15.00
      const currentDistribution = {
        boneless: 150,
        boneIn: 0,
        cauliflower: 50
      };

      const result = calculateDistributionDifferential(currentDistribution, packageWithSchema);

      expect(result.differential).toBe(15.00);
      expect(result.breakdown.current.total).toBe(185.00); // 150×0.80 + 50×1.30
      expect(result.breakdown.default.total).toBe(170.00); // 150×0.80 + 50×1.00
    });

    it('should handle complex distribution changes', () => {
      // Change to: 100 boneless, 50 bone-in, 50 cauliflower
      // Current: 100×0.80 + 50×1.00 + 50×1.30 = 80 + 50 + 65 = $195.00
      // Default: 150×0.80 + 50×1.00 + 0×1.30 = 120 + 50 + 0 = $170.00
      // Differential = +$25.00
      const currentDistribution = {
        boneless: 100,
        boneIn: 50,
        cauliflower: 50
      };

      const result = calculateDistributionDifferential(currentDistribution, packageWithSchema);

      expect(result.differential).toBe(25.00);
      expect(result.breakdown.current.boneless.cost).toBe(80.00);
      expect(result.breakdown.current.boneIn.cost).toBe(50.00);
      expect(result.breakdown.current.cauliflower.cost).toBe(65.00);
    });

    it('should return zero differential when schema data is missing (backward compatibility)', () => {
      const packageWithoutSchema = {
        totalWings: 200
      };

      const currentDistribution = {
        boneless: 100,
        boneIn: 100,
        cauliflower: 0
      };

      const result = calculateDistributionDifferential(currentDistribution, packageWithoutSchema);

      expect(result.differential).toBe(0);
      expect(result.breakdown).toBeNull();
    });

    it('should provide detailed breakdown in result', () => {
      const currentDistribution = {
        boneless: 100,
        boneIn: 100,
        cauliflower: 0
      };

      const result = calculateDistributionDifferential(currentDistribution, packageWithSchema);

      // Current breakdown
      expect(result.breakdown.current.boneless.count).toBe(100);
      expect(result.breakdown.current.boneless.cost).toBe(80.00);
      expect(result.breakdown.current.boneIn.count).toBe(100);
      expect(result.breakdown.current.boneIn.cost).toBe(100.00);

      // Default breakdown
      expect(result.breakdown.default.boneless.count).toBe(150);
      expect(result.breakdown.default.boneless.cost).toBe(120.00);
      expect(result.breakdown.default.boneIn.count).toBe(50);
      expect(result.breakdown.default.boneIn.cost).toBe(50.00);

      // Differential
      expect(result.breakdown.differential).toBe(10.00);
    });

    it('should handle plant-based package (100% cauliflower default)', () => {
      const plantBasedPackage = {
        totalWings: 100,
        defaultDistribution: {
          boneless: 0,
          boneIn: 0,
          cauliflower: 100
        },
        perWingCosts: {
          boneless: 0.80,
          boneIn: 1.00,
          cauliflower: 1.30
        }
      };

      const currentDistribution = {
        boneless: 0,
        boneIn: 0,
        cauliflower: 100
      };

      const result = calculateDistributionDifferential(currentDistribution, plantBasedPackage);

      expect(result.differential).toBe(0); // No change from default
      expect(result.breakdown.current.total).toBe(130.00); // 100×1.30
      expect(result.breakdown.default.total).toBe(130.00);
    });
  });

  describe('calculateSauceAllocation', () => {
    const sauces = [
      { id: 'buffalo', name: 'Buffalo' },
      { id: 'bbq', name: 'BBQ' },
      { id: 'garlic-parm', name: 'Garlic Parmesan' }
    ];

    it('should allocate sauces evenly across all wing types', () => {
      const distribution = {
        boneless: 20,
        boneIn: 20,
        cauliflower: 20
      };

      const allocation = calculateSauceAllocation(sauces, distribution, defaultPackage);

      expect(allocation.boneless).toBeDefined();
      expect(allocation.boneIn).toBeDefined();
      expect(allocation.cauliflower).toBeDefined();

      // Each wing type should have all sauces
      expect(Object.keys(allocation.boneless).length).toBe(3);
      expect(Object.keys(allocation.boneIn).length).toBe(3);
      expect(Object.keys(allocation.cauliflower).length).toBe(3);

      // Proportions should be 1/3 each
      expect(allocation.boneless['buffalo'].proportion).toBeCloseTo(1/3, 2);
      expect(allocation.boneIn['buffalo'].proportion).toBeCloseTo(1/3, 2);
      expect(allocation.cauliflower['buffalo'].proportion).toBeCloseTo(1/3, 2);
    });

    it('should handle single wing type', () => {
      const distribution = {
        boneless: 60,
        boneIn: 0,
        cauliflower: 0
      };

      const allocation = calculateSauceAllocation(sauces, distribution, defaultPackage);

      // Only boneless should have allocations
      expect(Object.keys(allocation.boneless).length).toBe(3);
      expect(Object.keys(allocation.boneIn).length).toBe(0);
      expect(Object.keys(allocation.cauliflower).length).toBe(0);

      // Proportion should be 100%
      expect(allocation.boneless['buffalo'].proportion).toBe(1);
    });

    it('should handle two wing types', () => {
      const distribution = {
        boneless: 30,
        boneIn: 30,
        cauliflower: 0
      };

      const allocation = calculateSauceAllocation(sauces, distribution, defaultPackage);

      // Only boneless and bone-in should have allocations
      expect(Object.keys(allocation.boneless).length).toBe(3);
      expect(Object.keys(allocation.boneIn).length).toBe(3);
      expect(Object.keys(allocation.cauliflower).length).toBe(0);

      // Proportions should be 50% each
      expect(allocation.boneless['buffalo'].proportion).toBe(0.5);
      expect(allocation.boneIn['buffalo'].proportion).toBe(0.5);
    });

    it('should return empty allocation when no sauces', () => {
      const distribution = {
        boneless: 30,
        boneIn: 30,
        cauliflower: 0
      };

      const allocation = calculateSauceAllocation([], distribution, defaultPackage);

      expect(Object.keys(allocation.boneless).length).toBe(0);
      expect(Object.keys(allocation.boneIn).length).toBe(0);
      expect(Object.keys(allocation.cauliflower).length).toBe(0);
    });

    it('should return empty allocation when no wings', () => {
      const distribution = {
        boneless: 0,
        boneIn: 0,
        cauliflower: 0
      };

      const allocation = calculateSauceAllocation(sauces, distribution, defaultPackage);

      expect(Object.keys(allocation.boneless).length).toBe(0);
      expect(Object.keys(allocation.boneIn).length).toBe(0);
      expect(Object.keys(allocation.cauliflower).length).toBe(0);
    });
  });

  describe('getWingTypeSummary', () => {
    it('should return summary for all boneless', () => {
      const distribution = {
        boneless: 60,
        boneIn: 0,
        cauliflower: 0,
        boneInStyle: 'mixed'
      };

      const summary = getWingTypeSummary(distribution);

      expect(summary.length).toBe(1);
      expect(summary[0].type).toBe('boneless');
      expect(summary[0].label).toBe('Boneless');
      expect(summary[0].quantity).toBe(60);
      expect(summary[0].upcharge).toBe(0);
    });

    it('should return summary for bone-in mixed', () => {
      const distribution = {
        boneless: 0,
        boneIn: 60,
        cauliflower: 0,
        boneInStyle: 'mixed'
      };

      const summary = getWingTypeSummary(distribution);

      expect(summary.length).toBe(1);
      expect(summary[0].type).toBe('boneIn');
      expect(summary[0].label).toBe('Bone-In (Mixed)');
      expect(summary[0].quantity).toBe(60);
      expect(summary[0].upcharge).toBe(0);
    });

    it('should return summary for bone-in flats with upcharge', () => {
      const distribution = {
        boneless: 0,
        boneIn: 60,
        cauliflower: 0,
        boneInStyle: 'flats'
      };

      const summary = getWingTypeSummary(distribution);

      expect(summary.length).toBe(1);
      expect(summary[0].type).toBe('boneIn');
      expect(summary[0].label).toBe('Bone-In (Flats Only)');
      expect(summary[0].upcharge).toBe(60 * WING_PRICING.UPCHARGES.flatsOnly);
    });

    it('should return summary for cauliflower with dietary tags', () => {
      const distribution = {
        boneless: 0,
        boneIn: 0,
        cauliflower: 60,
        boneInStyle: 'mixed'
      };

      const summary = getWingTypeSummary(distribution);

      expect(summary.length).toBe(1);
      expect(summary[0].type).toBe('cauliflower');
      expect(summary[0].label).toBe('Cauliflower Wings');
      expect(summary[0].quantity).toBe(60);
      expect(summary[0].upcharge).toBe(60 * WING_PRICING.UPCHARGES.cauliflower);
      expect(summary[0].dietary).toContain('vegan');
      expect(summary[0].dietary).toContain('vegetarian');
    });

    it('should return summary for mixed wing types', () => {
      const distribution = {
        boneless: 20,
        boneIn: 20,
        cauliflower: 20,
        boneInStyle: 'drums'
      };

      const summary = getWingTypeSummary(distribution);

      expect(summary.length).toBe(3);

      const boneless = summary.find(s => s.type === 'boneless');
      const boneIn = summary.find(s => s.type === 'boneIn');
      const cauliflower = summary.find(s => s.type === 'cauliflower');

      expect(boneless.quantity).toBe(20);
      expect(boneless.upcharge).toBe(0);

      expect(boneIn.quantity).toBe(20);
      expect(boneIn.label).toBe('Bone-In (Drums Only)');
      expect(boneIn.upcharge).toBe(20 * WING_PRICING.UPCHARGES.drumsOnly);

      expect(cauliflower.quantity).toBe(20);
      expect(cauliflower.upcharge).toBe(20 * WING_PRICING.UPCHARGES.cauliflower);
    });

    it('should return empty array when no wings', () => {
      const distribution = {
        boneless: 0,
        boneIn: 0,
        cauliflower: 0,
        boneInStyle: 'mixed'
      };

      const summary = getWingTypeSummary(distribution);

      expect(summary.length).toBe(0);
    });
  });

  describe('WING_PRICING constants', () => {
    it('should define base prices', () => {
      expect(WING_PRICING.BASE.boneless).toBe(0);
      expect(WING_PRICING.BASE.boneIn).toBe(0);
    });

    it('should define upcharges', () => {
      expect(WING_PRICING.UPCHARGES.cauliflower).toBe(0.50);
      expect(WING_PRICING.UPCHARGES.flatsOnly).toBe(0.25);
      expect(WING_PRICING.UPCHARGES.drumsOnly).toBe(0.25);
      expect(WING_PRICING.UPCHARGES.mixed).toBe(0);
    });

    it('should define minimums', () => {
      expect(WING_PRICING.MINIMUMS.perType).toBe(10);
      expect(WING_PRICING.MINIMUMS.total).toBe(20);
    });
  });
});
