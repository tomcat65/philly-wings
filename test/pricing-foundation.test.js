/**
 * Tests for Pricing Foundation (S1)
 * Tests data structures, logging, and timing utilities
 *
 * @epic SP-PRICING-001
 * @story S1-Foundation
 */

import {
  createPricingStructure,
  createPricingItem,
  createPricingModifier,
  addItem,
  addModifier,
  calculateTotals,
  getItemsByType,
  getModifiersForItem,
  validateStructure,
  cloneStructure
} from '../src/utils/pricing-data-structure.js';

import { PricingLogger, LOG_LEVELS } from '../src/utils/pricing-logger.js';

import {
  timeFunction,
  measure,
  checkBudget,
  PERFORMANCE_BUDGETS
} from '../src/utils/pricing-timing.js';

describe('Pricing Data Structure', () => {
  describe('createPricingStructure', () => {
    it('should create empty pricing structure with correct schema', () => {
      const structure = createPricingStructure();

      expect(structure).toHaveProperty('items');
      expect(structure).toHaveProperty('modifiers');
      expect(structure).toHaveProperty('totals');
      expect(structure).toHaveProperty('meta');

      expect(structure.items).toEqual({});
      expect(structure.modifiers).toEqual([]);
      expect(structure.totals.total).toBe(0);
    });

    it('should have all required total fields', () => {
      const structure = createPricingStructure();

      expect(structure.totals).toHaveProperty('basePrice');
      expect(structure.totals).toHaveProperty('modificationsTotal');
      expect(structure.totals).toHaveProperty('subtotal');
      expect(structure.totals).toHaveProperty('tax');
      expect(structure.totals).toHaveProperty('total');
    });

    it('should have completion status for all sections', () => {
      const structure = createPricingStructure();

      expect(structure.meta.completionStatus).toHaveProperty('wings');
      expect(structure.meta.completionStatus).toHaveProperty('sauces');
      expect(structure.meta.completionStatus).toHaveProperty('dips');
      expect(structure.meta.completionStatus).toHaveProperty('sides');
      expect(structure.meta.completionStatus).toHaveProperty('desserts');
      expect(structure.meta.completionStatus).toHaveProperty('beverages');
    });
  });

  describe('createPricingItem', () => {
    it('should create item with required fields', () => {
      const item = createPricingItem('wings-boneless', 'wing', {
        quantity: 50,
        sauces: ['buffalo']
      });

      expect(item.id).toBe('wings-boneless');
      expect(item.type).toBe('wing');
      expect(item.basePrice).toBe(0);
      expect(item.quantity).toBe(50);
      expect(item.sauces).toEqual(['buffalo']);
    });

    it('should handle item without extra data', () => {
      const item = createPricingItem('sauce-ranch', 'sauce');

      expect(item.id).toBe('sauce-ranch');
      expect(item.type).toBe('sauce');
      expect(item.basePrice).toBe(0);
    });
  });

  describe('createPricingModifier', () => {
    it('should create modifier with unique ID', () => {
      const mod1 = createPricingModifier('wings-1', 'upcharge', 5.00, 'Extra wings');
      const mod2 = createPricingModifier('wings-1', 'upcharge', 5.00, 'Extra wings');

      expect(mod1.id).not.toBe(mod2.id);
      expect(mod1.itemId).toBe('wings-1');
      expect(mod1.type).toBe('upcharge');
      expect(mod1.amount).toBe(5.00);
      expect(mod1.label).toBe('Extra wings');
    });

    it('should include creation timestamp', () => {
      const mod = createPricingModifier('item-1', 'discount', -2.00, 'Promo');

      expect(mod.createdAt).toBeDefined();
      expect(new Date(mod.createdAt)).toBeInstanceOf(Date);
    });
  });

  describe('addItem', () => {
    it('should add item to structure', () => {
      const structure = createPricingStructure();
      addItem(structure, 'wings-1', 'wing', { quantity: 50 });

      expect(structure.items['wings-1']).toBeDefined();
      expect(structure.items['wings-1'].type).toBe('wing');
      expect(structure.items['wings-1'].quantity).toBe(50);
    });

    it('should return updated structure', () => {
      const structure = createPricingStructure();
      const updated = addItem(structure, 'sauce-1', 'sauce');

      expect(updated).toBe(structure);
      expect(updated.items['sauce-1']).toBeDefined();
    });
  });

  describe('addModifier', () => {
    it('should add modifier to structure', () => {
      const structure = createPricingStructure();
      addModifier(structure, 'wings-1', 'upcharge', 10.00, 'Premium sauce');

      expect(structure.modifiers.length).toBe(1);
      expect(structure.modifiers[0].itemId).toBe('wings-1');
      expect(structure.modifiers[0].amount).toBe(10.00);
    });

    it('should support multiple modifiers', () => {
      const structure = createPricingStructure();
      addModifier(structure, 'wings-1', 'upcharge', 5.00, 'Mod 1');
      addModifier(structure, 'wings-1', 'discount', -2.00, 'Mod 2');

      expect(structure.modifiers.length).toBe(2);
    });
  });

  describe('calculateTotals', () => {
    it('should calculate totals correctly', () => {
      const structure = createPricingStructure();
      addModifier(structure, 'item-1', 'upcharge', 10.00, 'Extra 1');
      addModifier(structure, 'item-2', 'upcharge', 5.00, 'Extra 2');

      calculateTotals(structure, 100.00);

      expect(structure.totals.basePrice).toBe(100.00);
      expect(structure.totals.modificationsTotal).toBe(15.00);
      expect(structure.totals.subtotal).toBe(115.00);
      expect(structure.totals.tax).toBe(9.20); // 8% of 115
      expect(structure.totals.total).toBe(124.20);
    });

    it('should exclude warnings from modifications total', () => {
      const structure = createPricingStructure();
      addModifier(structure, 'item-1', 'upcharge', 10.00, 'Extra');
      addModifier(structure, 'item-2', 'warning', 0, 'Warning message');

      calculateTotals(structure, 100.00);

      expect(structure.totals.modificationsTotal).toBe(10.00);
    });

    it('should handle negative modifiers (discounts)', () => {
      const structure = createPricingStructure();
      addModifier(structure, 'item-1', 'discount', -15.00, 'Promo');

      calculateTotals(structure, 100.00);

      expect(structure.totals.modificationsTotal).toBe(-15.00);
      expect(structure.totals.subtotal).toBe(85.00);
    });
  });

  describe('getItemsByType', () => {
    it('should filter items by type', () => {
      const structure = createPricingStructure();
      addItem(structure, 'wings-1', 'wing');
      addItem(structure, 'wings-2', 'wing');
      addItem(structure, 'sauce-1', 'sauce');

      const wings = getItemsByType(structure, 'wing');
      const sauces = getItemsByType(structure, 'sauce');

      expect(Object.keys(wings).length).toBe(2);
      expect(Object.keys(sauces).length).toBe(1);
    });

    it('should return empty object for non-existent type', () => {
      const structure = createPricingStructure();
      const items = getItemsByType(structure, 'nonexistent');

      expect(items).toEqual({});
    });
  });

  describe('getModifiersForItem', () => {
    it('should get modifiers for specific item', () => {
      const structure = createPricingStructure();
      addModifier(structure, 'wings-1', 'upcharge', 5.00, 'Mod 1');
      addModifier(structure, 'wings-1', 'upcharge', 3.00, 'Mod 2');
      addModifier(structure, 'sauce-1', 'upcharge', 2.00, 'Mod 3');

      const mods = getModifiersForItem(structure, 'wings-1');

      expect(mods.length).toBe(2);
      expect(mods[0].itemId).toBe('wings-1');
      expect(mods[1].itemId).toBe('wings-1');
    });

    it('should return empty array for item with no modifiers', () => {
      const structure = createPricingStructure();
      const mods = getModifiersForItem(structure, 'nonexistent');

      expect(mods).toEqual([]);
    });
  });

  describe('validateStructure', () => {
    it('should validate correct structure', () => {
      const structure = createPricingStructure();
      addItem(structure, 'wings-1', 'wing');
      addModifier(structure, 'wings-1', 'upcharge', 5.00, 'Mod');

      const result = validateStructure(structure);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should catch modifier referencing non-existent item', () => {
      const structure = createPricingStructure();
      addModifier(structure, 'nonexistent-item', 'upcharge', 5.00, 'Mod');

      const result = validateStructure(structure);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('non-existent item');
    });

    it('should catch invalid structure shape', () => {
      const badStructure = { items: 'not-an-object' };
      const result = validateStructure(badStructure);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('cloneStructure', () => {
    it('should create deep copy', () => {
      const structure = createPricingStructure();
      addItem(structure, 'wings-1', 'wing', { quantity: 50 });
      addModifier(structure, 'wings-1', 'upcharge', 5.00, 'Mod');

      const clone = cloneStructure(structure);

      expect(clone).toEqual(structure);
      expect(clone).not.toBe(structure);
      expect(clone.items).not.toBe(structure.items);
      expect(clone.modifiers).not.toBe(structure.modifiers);
    });

    it('should not affect original when clone is modified', () => {
      const structure = createPricingStructure();
      addItem(structure, 'wings-1', 'wing');

      const clone = cloneStructure(structure);
      addItem(clone, 'wings-2', 'wing');

      expect(Object.keys(structure.items).length).toBe(1);
      expect(Object.keys(clone.items).length).toBe(2);
    });
  });
});

describe('Pricing Logger', () => {
  let logger;

  beforeEach(() => {
    logger = new PricingLogger({
      enableConsole: false, // Disable console for tests
      maxEntries: 100
    });
  });

  describe('Logging levels', () => {
    it('should log error messages', () => {
      logger.error('Test error', { code: 500 });

      const entries = logger.getEntries();
      expect(entries.length).toBe(1);
      expect(entries[0].level).toBe('ERROR');
      expect(entries[0].message).toBe('Test error');
    });

    it('should log warn messages', () => {
      logger.warn('Test warning');

      const entries = logger.getEntries();
      expect(entries[0].level).toBe('WARN');
    });

    it('should log info messages', () => {
      logger.info('Test info');

      const entries = logger.getEntries();
      expect(entries[0].level).toBe('INFO');
    });

    it('should log debug messages', () => {
      const debugLogger = new PricingLogger({
        enableConsole: false,
        level: LOG_LEVELS.DEBUG // Enable debug level
      });

      debugLogger.debug('Test debug');

      const entries = debugLogger.getEntries();
      expect(entries[0].level).toBe('DEBUG');
    });
  });

  describe('Log level filtering', () => {
    it('should respect log level configuration', () => {
      const testLogger = new PricingLogger({
        enableConsole: false,
        level: LOG_LEVELS.WARN
      });

      testLogger.debug('Debug message');
      testLogger.info('Info message');
      testLogger.warn('Warn message');
      testLogger.error('Error message');

      const entries = testLogger.getEntries();
      expect(entries.length).toBe(2); // Only WARN and ERROR
    });
  });

  describe('Performance timing', () => {
    it('should start and end timers', () => {
      logger.startTimer('test-operation');

      // Simulate work
      for (let i = 0; i < 1000; i++) {}

      const duration = logger.endTimer('test-operation');

      expect(duration).toBeGreaterThan(0);
    });

    it('should log timing results', () => {
      logger.startTimer('test-operation');
      logger.endTimer('test-operation');

      const entries = logger.getEntries();
      const timingEntry = entries.find(e => e.message.includes('test-operation'));

      expect(timingEntry).toBeDefined();
      expect(timingEntry.data.durationMs).toBeGreaterThan(0);
    });

    it('should handle missing timer gracefully', () => {
      const duration = logger.endTimer('nonexistent-timer');

      expect(duration).toBe(0);

      const entries = logger.getEntries();
      const warnEntry = entries.find(e => e.level === 'WARN');
      expect(warnEntry).toBeDefined();
    });
  });

  describe('Entry management', () => {
    it('should limit entries to maxEntries', () => {
      const smallLogger = new PricingLogger({ maxEntries: 5, enableConsole: false });

      for (let i = 0; i < 10; i++) {
        smallLogger.info(`Message ${i}`);
      }

      expect(smallLogger.getEntries().length).toBe(5);
    });

    it('should clear all entries', () => {
      logger.info('Message 1');
      logger.info('Message 2');

      logger.clear();

      expect(logger.getEntries().length).toBe(1); // Only "cleared" message
    });
  });

  describe('Export functionality', () => {
    it('should export logs as JSON', () => {
      logger.info('Test message', { data: 'value' });

      const json = logger.exportJSON();
      const parsed = JSON.parse(json);

      expect(parsed).toHaveProperty('exported');
      expect(parsed).toHaveProperty('count');
      expect(parsed).toHaveProperty('entries');
      expect(parsed.entries.length).toBeGreaterThan(0);
    });

    it('should filter exports by level', () => {
      logger.debug('Debug');
      logger.info('Info');
      logger.warn('Warn');
      logger.error('Error');

      const json = logger.exportJSON({ level: 'WARN' });
      const parsed = JSON.parse(json);

      // Should only include WARN and ERROR
      const levels = parsed.entries.map(e => e.level);
      expect(levels).toContain('WARN');
      expect(levels).toContain('ERROR');
      expect(levels).not.toContain('DEBUG');
    });
  });

  describe('Performance summary', () => {
    it('should generate performance summary', () => {
      logger.startTimer('operation-a');
      logger.endTimer('operation-a');

      logger.startTimer('operation-a');
      logger.endTimer('operation-a');

      const summary = logger.getPerformanceSummary();

      expect(summary.totalTimings).toBe(2);
      expect(summary.timings['operation-a']).toBeDefined();
      expect(summary.timings['operation-a'].count).toBe(2);
    });
  });
});

describe('Pricing Timing Utilities', () => {
  describe('timeFunction', () => {
    it('should time synchronous function execution', () => {
      const testFn = () => {
        let sum = 0;
        for (let i = 0; i < 1000; i++) sum += i;
        return sum;
      };

      const timedFn = timeFunction(testFn, 'Test Function');
      const result = timedFn();

      expect(result).toBe(499500);
    });

    it('should preserve function context', () => {
      const obj = {
        value: 42,
        getValue() {
          return this.value;
        }
      };

      const timedGetValue = timeFunction(obj.getValue, 'Get Value');
      const result = timedGetValue.call(obj);

      expect(result).toBe(42);
    });
  });

  describe('measure', () => {
    it('should return result and duration', () => {
      const { result, duration } = measure(() => {
        return 2 + 2;
      });

      expect(result).toBe(4);
      expect(duration).toBeGreaterThanOrEqual(0);
    });
  });

  describe('checkBudget', () => {
    it('should return true when within budget', () => {
      const withinBudget = checkBudget(30, 50, 'Test Operation');

      expect(withinBudget).toBe(true);
    });

    it('should return false when exceeding budget', () => {
      const withinBudget = checkBudget(60, 50, 'Test Operation');

      expect(withinBudget).toBe(false);
    });
  });

  describe('Performance budgets', () => {
    it('should define calculation budget', () => {
      expect(PERFORMANCE_BUDGETS.CALCULATION).toBe(50);
    });

    it('should define rendering budget', () => {
      expect(PERFORMANCE_BUDGETS.RENDERING).toBe(16);
    });

    it('should define total update budget', () => {
      expect(PERFORMANCE_BUDGETS.TOTAL_UPDATE).toBe(100);
    });
  });
});
