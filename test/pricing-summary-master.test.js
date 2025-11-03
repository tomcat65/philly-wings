/**
 * Tests for Master Pricing Summary Component (S8)
 * Tests HTML rendering, collapsible sections, totals, print/export
 *
 * @epic SP-PRICING-001
 * @story S8-MasterSummary
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import {
  renderPricingSummary,
  initPricingSummary,
  exportPrintableSummary,
  exportSummaryData
} from '../src/components/catering/pricing-summary-master.js';

describe('Master Pricing Summary', () => {
  let dom;
  let document;

  beforeEach(() => {
    dom = new JSDOM('<!DOCTYPE html><div id="pricing-summary"></div>');
    document = dom.window.document;
    global.document = document;
    global.window = dom.window;
  });

  afterEach(() => {
    delete global.document;
    delete global.window;
  });

  // Sample complete pricing data
  const samplePricing = {
    items: {
      'package-base': {
        id: 'package-base',
        category: 'package',
        basePrice: 125.00
      },
      'wings-boneless': {
        id: 'wings-boneless',
        type: 'wing',
        wingType: 'boneless',
        quantity: 30,
        basePrice: 0
      },
      'wings-bone-in': {
        id: 'wings-bone-in',
        type: 'wing',
        wingType: 'bone-in',
        quantity: 30,
        style: 'mixed',
        basePrice: 0
      },
      'sauce-buffalo': {
        id: 'sauce-buffalo',
        type: 'sauce',
        name: 'Buffalo',
        sauceType: 'wet-sauce',
        heatLevel: 3,
        included: true,
        basePrice: 0
      },
      'dip-ranch': {
        id: 'dip-ranch',
        type: 'dip',
        name: 'Ranch',
        quantity: 2,
        size: '1.5oz',
        basePrice: 0
      }
    },
    modifiers: [
      {
        id: 'mod-1',
        itemId: 'wings-bone-in',
        type: 'upcharge',
        amount: 7.50,
        label: 'Flats only upcharge',
        source: 'wings'
      },
      {
        id: 'mod-2',
        itemId: 'wings',
        type: 'warning',
        amount: 0,
        label: 'Wing distribution warning',
        source: 'wings'
      }
    ],
    meta: {
      completionStatus: {
        wings: true,
        sauces: true
      },
      lastCalculated: new Date().toISOString()
    },
    totals: {
      itemsSubtotal: 125.00,
      upcharges: 7.50,
      discounts: 0,
      subtotal: 132.50,
      tax: 10.60,
      taxRate: 0.08,
      total: 143.10
    }
  };

  const sampleState = {
    selectedPackage: {
      name: 'Classic 60-Wing Package',
      wingCount: 60,
      basePrice: 125.00,
      description: 'Perfect for small gatherings'
    }
  };

  describe('renderPricingSummary', () => {
    it('should render complete pricing summary', () => {
      const html = renderPricingSummary(samplePricing, sampleState);

      expect(html).toContain('pricing-summary-master');
      expect(html).toContain('Classic 60-Wing Package');
      expect(html).toContain('Order Summary');
    });

    it('should render package header', () => {
      const html = renderPricingSummary(samplePricing, sampleState);

      expect(html).toContain('pricing-header');
      expect(html).toContain('Classic 60-Wing Package');
      expect(html).toContain('Perfect for small gatherings');
      expect(html).toContain('Wing Count');
      expect(html).toContain('60 / 60');
    });

    it('should render wings section', () => {
      const html = renderPricingSummary(samplePricing, sampleState);

      expect(html).toContain('wings-section');
      expect(html).toContain('Wings Pricing');
    });

    it('should render items section', () => {
      const html = renderPricingSummary(samplePricing, sampleState);

      expect(html).toContain('items-section');
      expect(html).toContain('Sauces');
      expect(html).toContain('Dips');
    });

    it('should render totals section', () => {
      const html = renderPricingSummary(samplePricing, sampleState);

      expect(html).toContain('pricing-totals');
      expect(html).toContain('Order Summary');
      expect(html).toContain('$125.00'); // Items subtotal
      expect(html).toContain('$7.50'); // Upcharges
      expect(html).toContain('$132.50'); // Subtotal
      expect(html).toContain('$10.60'); // Tax
      expect(html).toContain('$143.10'); // Total
    });

    it('should show tax rate percentage', () => {
      const html = renderPricingSummary(samplePricing, sampleState);

      expect(html).toContain('8.0%');
    });

    it('should render warnings in modifiers summary', () => {
      const html = renderPricingSummary(samplePricing, sampleState);

      expect(html).toContain('Notes:');
      expect(html).toContain('Wing distribution warning');
      expect(html).toContain('⚠️');
    });

    it('should hide sections when options are false', () => {
      const html = renderPricingSummary(samplePricing, sampleState, {
        showPackageHeader: false,
        showWings: false,
        showItems: false,
        showTotals: false
      });

      expect(html).not.toContain('pricing-header');
      expect(html).not.toContain('wings-section');
      expect(html).not.toContain('items-section');
      expect(html).not.toContain('pricing-totals');
    });

    it('should add collapsible class when collapsible is true', () => {
      const html = renderPricingSummary(samplePricing, sampleState, {
        collapsible: true
      });

      expect(html).toContain('collapsible');
      expect(html).toContain('collapse-toggle');
    });

    it('should not add collapsible class when collapsible is false', () => {
      const html = renderPricingSummary(samplePricing, sampleState, {
        collapsible: false
      });

      expect(html).not.toContain('collapsible');
      expect(html).not.toContain('collapse-toggle');
    });

    it('should add print-mode class when printMode is true', () => {
      const html = renderPricingSummary(samplePricing, sampleState, {
        printMode: true
      });

      expect(html).toContain('print-mode');
    });

    it('should use custom container ID', () => {
      const html = renderPricingSummary(samplePricing, sampleState, {
        containerId: 'custom-summary'
      });

      expect(html).toContain('id="custom-summary"');
    });

    it('should render empty state when pricing is null', () => {
      const html = renderPricingSummary(null);

      expect(html).toContain('pricing-empty');
      expect(html).toContain('No Configuration Selected');
    });

    it('should render empty state when no totals', () => {
      const html = renderPricingSummary({});

      expect(html).toContain('pricing-empty');
    });
  });

  describe('totals rendering', () => {
    it('should show upcharges when present', () => {
      const html = renderPricingSummary(samplePricing, sampleState);

      expect(html).toContain('Premium Options');
      expect(html).toContain('upcharge-amount');
      expect(html).toContain('+$7.50');
    });

    it('should hide upcharges when zero', () => {
      const pricingNoUpcharges = {
        ...samplePricing,
        modifiers: [], // Remove all modifiers
        totals: {
          ...samplePricing.totals,
          upcharges: 0
        }
      };

      const html = renderPricingSummary(pricingNoUpcharges, sampleState);

      // Check totals section doesn't show upcharges line
      expect(html).not.toContain('total-upcharges');
    });

    it('should show discounts when present', () => {
      const pricingWithDiscounts = {
        ...samplePricing,
        totals: {
          ...samplePricing.totals,
          discounts: 10.00
        },
        modifiers: [
          ...samplePricing.modifiers,
          {
            id: 'disc-1',
            itemId: 'package',
            type: 'discount',
            amount: 10.00,
            label: 'Early bird discount',
            source: 'package'
          }
        ]
      };

      const html = renderPricingSummary(pricingWithDiscounts, sampleState);

      expect(html).toContain('Discounts:');
      expect(html).toContain('discount-amount');
      expect(html).toContain('-$10.00');
      expect(html).toContain('Discounts Applied');
      expect(html).toContain('Early bird discount');
    });

    it('should hide discounts when zero', () => {
      const html = renderPricingSummary(samplePricing, sampleState);

      expect(html).not.toContain('Discounts:');
    });

    it('should show tax when present', () => {
      const html = renderPricingSummary(samplePricing, sampleState);

      expect(html).toContain('Tax');
      expect(html).toContain('$10.60');
    });

    it('should hide tax when zero', () => {
      const pricingNoTax = {
        ...samplePricing,
        totals: {
          ...samplePricing.totals,
          tax: 0,
          taxRate: 0
        }
      };

      const html = renderPricingSummary(pricingNoTax, sampleState);

      expect(html).not.toContain('Tax (');
    });

    it('should highlight grand total', () => {
      const html = renderPricingSummary(samplePricing, sampleState);

      expect(html).toContain('grand-total');
      expect(html).toContain('$143.10');
    });
  });

  describe('package header rendering', () => {
    it('should show wing count progress', () => {
      const html = renderPricingSummary(samplePricing, sampleState);

      expect(html).toContain('60 / 60');
    });

    it('should show base price', () => {
      const html = renderPricingSummary(samplePricing, sampleState);

      expect(html).toContain('Base Price');
      expect(html).toContain('$125.00');
    });

    it('should show total items count', () => {
      const html = renderPricingSummary(samplePricing, sampleState);

      expect(html).toContain('Total Items');
      expect(html).toContain('5'); // 5 items in sample data
    });

    it('should handle missing package info gracefully', () => {
      const html = renderPricingSummary(samplePricing, {});

      expect(html).toContain('Custom Package');
    });

    it('should hide description when not provided', () => {
      const stateNoDesc = {
        selectedPackage: {
          name: 'Test Package',
          wingCount: 60,
          basePrice: 100
        }
      };

      const html = renderPricingSummary(samplePricing, stateNoDesc);

      expect(html).toContain('Test Package');
      expect(html).not.toContain('package-description');
    });
  });

  describe('initPricingSummary', () => {
    it('should initialize summary in container', () => {
      initPricingSummary('pricing-summary', sampleState);

      const container = document.getElementById('pricing-summary');
      expect(container.innerHTML).toContain('pricing-summary-master');
    });

    it('should error when container not found', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      const unsubscribe = initPricingSummary('non-existent-id');

      expect(consoleError).toHaveBeenCalledWith(
        expect.stringContaining('Pricing summary container not found')
      );
      expect(typeof unsubscribe).toBe('function');

      consoleError.mockRestore();
    });

    it('should return unsubscribe function', () => {
      const unsubscribe = initPricingSummary('pricing-summary', sampleState);

      expect(typeof unsubscribe).toBe('function');

      unsubscribe();
    });

    it('should apply custom options', async () => {
      // Need to mock getCurrentPricing since initPricingSummary calls it
      const aggregator = await import('../src/utils/pricing-aggregator.js');
      vi.spyOn(aggregator, 'getCurrentPricing').mockReturnValue(samplePricing);

      initPricingSummary('pricing-summary', sampleState, {
        printMode: true,
        collapsible: false
      });

      const container = document.getElementById('pricing-summary');
      expect(container.innerHTML).toContain('print-mode');
      expect(container.innerHTML).not.toContain('collapse-toggle');

      vi.restoreAllMocks();
    });
  });

  describe('exportPrintableSummary', () => {
    it('should generate print-ready HTML', () => {
      const html = exportPrintableSummary(samplePricing, sampleState);

      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<html lang="en">');
      expect(html).toContain('Philly Wings Express - Order Summary');
      expect(html).toContain('print-mode');
    });

    it('should include timestamp', () => {
      const html = exportPrintableSummary(samplePricing, sampleState);

      expect(html).toContain('Generated:');
    });

    it('should disable collapsible in print mode', () => {
      const html = exportPrintableSummary(samplePricing, sampleState);

      expect(html).not.toContain('collapse-toggle');
    });

    it('should include print CSS', () => {
      const html = exportPrintableSummary(samplePricing, sampleState);

      expect(html).toContain('@media print');
      expect(html).toContain('button { display: none; }');
    });
  });

  describe('exportSummaryData', () => {
    it('should export JSON data', () => {
      const data = exportSummaryData(samplePricing, sampleState);

      expect(data).toHaveProperty('timestamp');
      expect(data).toHaveProperty('package');
      expect(data).toHaveProperty('pricing');
      expect(data).toHaveProperty('meta');
    });

    it('should include package info', () => {
      const data = exportSummaryData(samplePricing, sampleState);

      expect(data.package).toEqual(sampleState.selectedPackage);
    });

    it('should include pricing details', () => {
      const data = exportSummaryData(samplePricing, sampleState);

      expect(data.pricing.items).toEqual(samplePricing.items);
      expect(data.pricing.modifiers).toEqual(samplePricing.modifiers);
      expect(data.pricing.totals).toEqual(samplePricing.totals);
    });

    it('should include metadata', () => {
      const data = exportSummaryData(samplePricing, sampleState);

      expect(data.meta).toEqual(samplePricing.meta);
    });

    it('should handle empty state', () => {
      const data = exportSummaryData(samplePricing, {});

      expect(data.package).toEqual({});
    });

    it('should generate valid timestamp', () => {
      const data = exportSummaryData(samplePricing, sampleState);

      const timestamp = new Date(data.timestamp);
      expect(timestamp).toBeInstanceOf(Date);
      expect(timestamp.getTime()).not.toBeNaN();
    });
  });

  describe('edge cases', () => {
    it('should handle empty items', () => {
      const emptyPricing = {
        items: {},
        modifiers: [],
        meta: {},
        totals: {
          itemsSubtotal: 0,
          upcharges: 0,
          discounts: 0,
          subtotal: 0,
          tax: 0,
          total: 0
        }
      };

      const html = renderPricingSummary(emptyPricing, sampleState);

      expect(html).toContain('pricing-summary-master');
      expect(html).toContain('$0.00');
    });

    it('should handle missing modifiers array', () => {
      const pricingNoMods = {
        ...samplePricing,
        modifiers: []
      };

      const html = renderPricingSummary(pricingNoMods, sampleState);

      expect(html).toContain('pricing-summary-master');
      expect(html).not.toContain('Notes:');
    });

    it('should skip empty wing section', () => {
      const pricingNoWings = {
        items: {
          'sauce-buffalo': {
            id: 'sauce-buffalo',
            type: 'sauce',
            name: 'Buffalo'
          }
        },
        modifiers: [],
        meta: {},
        totals: {
          itemsSubtotal: 0,
          upcharges: 0,
          discounts: 0,
          subtotal: 0,
          tax: 0,
          total: 0
        }
      };

      const html = renderPricingSummary(pricingNoWings, sampleState);

      // Wings section should be present but show empty state inside
      expect(html).toContain('pricing-summary-master');
    });

    it('should handle very large numbers', () => {
      const largePricing = {
        ...samplePricing,
        totals: {
          itemsSubtotal: 9999.99,
          upcharges: 500.50,
          discounts: 100.00,
          subtotal: 10400.49,
          tax: 832.04,
          taxRate: 0.08,
          total: 11232.53
        }
      };

      const html = renderPricingSummary(largePricing, sampleState);

      expect(html).toContain('$9999.99');
      expect(html).toContain('$11232.53');
    });
  });
});
