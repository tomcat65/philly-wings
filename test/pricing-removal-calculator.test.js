/**
 * Unit Tests: Item Removal Credit Calculator
 * Tests SP-OS-S4 implementation
 */

import { describe, it, expect } from 'vitest';
import {
  calculateRemovalCredits,
  validateRemovalCap,
  getItemMarginTier
} from '../src/utils/pricing-removal-calculator.js';

describe('calculateRemovalCredits()', () => {
  const basePackageConfig = {
    basePrice: 329.99,
    name: 'Tailgate Party Pack'
  };

  it('should return empty structure when no items removed', () => {
    const pricing = calculateRemovalCredits([], basePackageConfig);

    expect(pricing.modifiers).toHaveLength(0);
    expect(pricing.meta.completionStatus.removals).toBe(true);
  });

  it('should calculate credit for single removed item (high-margin)', () => {
    const removedItems = [
      { name: "Miss Vickie's Chips 5-Pack", category: 'chips', quantity: 1 }
    ];

    const pricing = calculateRemovalCredits(removedItems, basePackageConfig);

    expect(pricing.modifiers).toHaveLength(1);
    expect(pricing.modifiers[0].type).toBe('discount');
    expect(pricing.modifiers[0].amount).toBe(4.25); // 50% of $8.50
    expect(pricing.modifiers[0].label).toContain('Item removal credits');
  });

  it('should calculate credit for multiple removed items', () => {
    const removedItems = [
      { name: "Miss Vickie's Chips 5-Pack", category: 'chips', quantity: 2 }, // 2 x $4.25 = $8.50
      { name: 'Dip 5-Pack', category: 'dips', quantity: 3 }                 // 3 x $1.75 = $5.25
    ];

    const pricing = calculateRemovalCredits(removedItems, basePackageConfig);

    expect(pricing.modifiers).toHaveLength(1);
    expect(pricing.modifiers[0].type).toBe('discount');
    expect(pricing.modifiers[0].amount).toBe(13.75); // $8.50 + $5.25
  });

  it('should apply 20% cap when total credits exceed limit', () => {
    // Remove high-value items that exceed 20% cap
    const removedItems = [
      { name: 'Family Coleslaw', category: 'coldSides', quantity: 10 },      // 10 x $6.00 = $60
      { name: 'Family Potato Salad', category: 'coldSides', quantity: 10 }   // 10 x $7.00 = $70
    ];
    // Total: $130, but cap = $329.99 * 0.20 = $65.998

    const pricing = calculateRemovalCredits(removedItems, basePackageConfig);

    // Should cap at 20% of base price
    const maxCredit = basePackageConfig.basePrice * 0.20;

    expect(pricing.modifiers).toHaveLength(2); // discount + warning
    const discountModifier = pricing.modifiers.find(m => m.type === 'discount');
    const warningModifier = pricing.modifiers.find(m => m.type === 'warning');

    expect(discountModifier.amount).toBeCloseTo(maxCredit, 2);
    expect(warningModifier).toBeDefined();
    expect(warningModifier.label).toContain('20%');
    expect(pricing.meta.capExceeded).toBe(true);
  });

  it('should handle medium-margin items (75% credit)', () => {
    const removedItems = [
      { name: 'Caesar Salad (Family Size)', category: 'salads', quantity: 1 }
    ];

    const pricing = calculateRemovalCredits(removedItems, basePackageConfig);

    expect(pricing.modifiers[0].amount).toBe(20.99); // 75% of $27.99
  });

  it('should handle low-margin items (100% credit)', () => {
    const removedItems = [
      { name: 'NY Cheesecake 5-Pack', category: 'desserts', quantity: 1 }
    ];

    const pricing = calculateRemovalCredits(removedItems, basePackageConfig);

    expect(pricing.modifiers[0].amount).toBe(23.75); // 100% of $23.75
  });

  it('should handle unknown items gracefully', () => {
    const removedItems = [
      { name: 'Unknown Item', category: 'chips', quantity: 1 }
    ];

    const pricing = calculateRemovalCredits(removedItems, basePackageConfig);

    expect(pricing.modifiers).toHaveLength(0); // No credit for unknown item
  });

  it('should include removal breakdown in metadata', () => {
    const removedItems = [
      { name: 'Dip 5-Pack', category: 'dips', quantity: 2 }
    ];

    const pricing = calculateRemovalCredits(removedItems, basePackageConfig);

    expect(pricing.meta.removalBreakdown).toBeDefined();
    expect(pricing.meta.removalBreakdown).toHaveLength(1);
    expect(pricing.meta.removalBreakdown[0]).toMatchObject({
      name: 'Dip 5-Pack',
      category: 'dips',
      quantity: 2,
      creditPerUnit: 1.75,
      totalCredit: 3.50
    });
  });
});

describe('validateRemovalCap()', () => {
  const basePrice = 329.99;

  it('should validate credits within 20% cap', () => {
    const removedItems = [
      { name: 'Dip 5-Pack', category: 'dips', quantity: 10 } // 10 x $1.75 = $17.50
    ];

    const validation = validateRemovalCap(removedItems, basePrice);

    expect(validation.valid).toBe(true);
    expect(validation.capExceeded).toBe(false);
    expect(validation.totalCredits).toBe(17.50);
    expect(validation.cappedCredits).toBe(17.50);
    expect(validation.maxCredit).toBeCloseTo(basePrice * 0.20, 2);
  });

  it('should detect when cap is exceeded', () => {
    const removedItems = [
      { name: 'Family Coleslaw', category: 'coldSides', quantity: 20 } // 20 x $6.00 = $120
    ];

    const validation = validateRemovalCap(removedItems, basePrice);

    expect(validation.valid).toBe(false);
    expect(validation.capExceeded).toBe(true);
    expect(validation.totalCredits).toBe(120);
    expect(validation.cappedCredits).toBeCloseTo(basePrice * 0.20, 2);
    expect(validation.exceededAmount).toBeGreaterThan(0);
  });

  it('should return correct cap percentage', () => {
    const validation = validateRemovalCap([], basePrice);

    expect(validation.capPercentage).toBe(0.20);
  });
});

describe('getItemMarginTier()', () => {
  it('should return high for high-margin items', () => {
    const tier = getItemMarginTier("Miss Vickie's Chips 5-Pack", 'chips');
    expect(tier).toBe('high');
  });

  it('should return medium for medium-margin items', () => {
    const tier = getItemMarginTier('Caesar Salad (Family Size)', 'salads');
    expect(tier).toBe('medium');
  });

  it('should return low for low-margin items', () => {
    const tier = getItemMarginTier('NY Cheesecake 5-Pack', 'desserts');
    expect(tier).toBe('low');
  });

  it('should return unknown for unknown items', () => {
    const tier = getItemMarginTier('Unknown Item', 'chips');
    expect(tier).toBe('unknown');
  });
});

describe('Integration: Removal Credits in Full Pricing', () => {
  it('should integrate removal credits with other pricing calculations', () => {
    // This will be tested in pricing-aggregator integration tests
    // Verifying the structure is compatible
    const removedItems = [
      { name: 'Dip 5-Pack', category: 'dips', quantity: 2 }
    ];

    const pricing = calculateRemovalCredits(removedItems, { basePrice: 329.99 });

    // Should have unified pricing structure
    expect(pricing).toHaveProperty('items');
    expect(pricing).toHaveProperty('modifiers');
    expect(pricing).toHaveProperty('meta');
    expect(pricing.meta).toHaveProperty('completionStatus');
    expect(pricing.meta.completionStatus.removals).toBe(true);
  });
});
