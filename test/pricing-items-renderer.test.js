/**
 * Tests for Items Pricing Renderer (S7)
 * Tests HTML rendering, empty states, subscriptions for all item types
 *
 * @epic SP-PRICING-001
 * @story S7-AllUI
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import {
  renderItemsPricing,
  renderSaucesPricing,
  renderDipsPricing,
  renderSidesPricing,
  renderDessertsPricing,
  renderBeveragesPricing,
  initItemsPricing
} from '../src/components/catering/pricing-items-renderer.js';

describe('Items Pricing Renderer', () => {
  let dom;
  let document;

  beforeEach(() => {
    // Create a virtual DOM for testing
    dom = new JSDOM('<!DOCTYPE html><div id="items-pricing"></div>');
    document = dom.window.document;
    global.document = document;
    global.window = dom.window;
  });

  afterEach(() => {
    delete global.document;
    delete global.window;
  });

  // Sample pricing data for testing
  const samplePricing = {
    items: {
      'sauce-buffalo': {
        id: 'sauce-buffalo',
        type: 'sauce',
        name: 'Buffalo',
        sauceType: 'wet-sauce',
        heatLevel: 3,
        included: true,
        basePrice: 0
      },
      'sauce-bbq': {
        id: 'sauce-bbq',
        type: 'sauce',
        name: 'BBQ',
        sauceType: 'wet-sauce',
        heatLevel: 0,
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
      },
      'side-fries': {
        id: 'side-fries',
        type: 'side',
        name: 'Regular Fries',
        quantity: 1,
        serves: 4,
        basePrice: 6.99
      },
      'dessert-cookies': {
        id: 'dessert-cookies',
        type: 'dessert',
        name: 'Chocolate Chip Cookies',
        quantity: 6,
        basePrice: 8.99
      },
      'beverage-coke': {
        id: 'beverage-coke',
        type: 'beverage',
        name: 'Coca-Cola',
        quantity: 4,
        size: '20oz',
        temperature: 'cold',
        basePrice: 12.00
      }
    },
    modifiers: [],
    meta: {
      completionStatus: {},
      lastCalculated: new Date().toISOString()
    },
    totals: {
      itemsSubtotal: 27.98,
      upcharges: 0,
      discounts: 0,
      subtotal: 27.98,
      tax: 0,
      total: 27.98
    }
  };

  describe('renderItemsPricing', () => {
    it('should render items pricing container', () => {
      const html = renderItemsPricing(samplePricing);

      expect(html).toContain('pricing-items-container');
      expect(html).toContain('id="items-pricing"');
    });

    it('should render all item sections', () => {
      const html = renderItemsPricing(samplePricing);

      expect(html).toContain('pricing-sauces');
      expect(html).toContain('pricing-dips');
      expect(html).toContain('pricing-sides');
      expect(html).toContain('pricing-desserts');
      expect(html).toContain('pricing-beverages');
    });

    it('should render empty state when pricing is null', () => {
      const html = renderItemsPricing(null);

      expect(html).toContain('pricing-empty');
      expect(html).toContain('No additional items configured');
    });

    it('should render empty state when no items', () => {
      const emptyPricing = {
        items: {},
        modifiers: [],
        meta: {},
        totals: {}
      };

      const html = renderItemsPricing(emptyPricing);

      expect(html).toContain('No additional items configured');
    });

    it('should use custom container ID', () => {
      const html = renderItemsPricing(samplePricing, { containerId: 'custom-items' });

      expect(html).toContain('id="custom-items"');
    });

    it('should hide details when showDetails is false', () => {
      const html = renderItemsPricing(samplePricing, { showDetails: false });

      expect(html).toContain('pricing-items-container');
      expect(html).not.toContain('pricing-details');
    });
  });

  describe('renderSaucesPricing', () => {
    it('should render sauces section', () => {
      const html = renderSaucesPricing(samplePricing);

      expect(html).toContain('pricing-sauces');
      expect(html).toContain('Sauces');
      expect(html).toContain('2 sauces');
    });

    it('should render included sauces', () => {
      const html = renderSaucesPricing(samplePricing);

      expect(html).toContain('Included Sauces');
      expect(html).toContain('Buffalo');
      expect(html).toContain('BBQ');
    });

    it('should render heat level indicators', () => {
      const html = renderSaucesPricing(samplePricing);

      expect(html).toContain('heat-badge');
      expect(html).toContain('🟠'); // Heat level 3 for Buffalo
    });

    it('should show included badge when no upcharges', () => {
      const html = renderSaucesPricing(samplePricing);

      expect(html).toContain('Included');
      expect(html).not.toContain('upcharge-amount');
    });

    it('should render extra sauces with upcharges', () => {
      const pricingWithExtra = {
        ...samplePricing,
        items: {
          ...samplePricing.items,
          'sauce-extra': {
            id: 'sauce-extra',
            type: 'sauce',
            name: 'Garlic Parmesan',
            sauceType: 'wet-sauce',
            heatLevel: 1,
            included: false,
            basePrice: 0
          }
        },
        modifiers: [
          {
            id: 'mod-1',
            itemId: 'sauce-extra',
            type: 'upcharge',
            amount: 2.00,
            label: 'Extra sauce: Garlic Parmesan (+$2.00)',
            source: 'sauces'
          }
        ]
      };

      const html = renderSaucesPricing(pricingWithExtra);

      expect(html).toContain('Extra Sauces');
      expect(html).toContain('Garlic Parmesan');
      expect(html).toContain('$2.00');
    });

    it('should render warnings', () => {
      const pricingWithWarnings = {
        ...samplePricing,
        modifiers: [
          {
            id: 'mod-1',
            itemId: 'sauces',
            type: 'warning',
            amount: 0,
            label: 'Bulk pricing available',
            source: 'sauces'
          }
        ]
      };

      const html = renderSaucesPricing(pricingWithWarnings);

      expect(html).toContain('warning-message');
      expect(html).toContain('⚠️');
      expect(html).toContain('Bulk pricing available');
    });

    it('should render empty state when no sauces', () => {
      const pricingNoSauces = {
        items: {},
        modifiers: []
      };

      const html = renderSaucesPricing(pricingNoSauces);

      expect(html).toContain('pricing-empty');
    });
  });

  describe('renderDipsPricing', () => {
    it('should render dips section', () => {
      const html = renderDipsPricing(samplePricing);

      expect(html).toContain('pricing-dips');
      expect(html).toContain('Dips');
      expect(html).toContain('2 dips');
    });

    it('should render dip items with quantity', () => {
      const html = renderDipsPricing(samplePricing);

      expect(html).toContain('Ranch');
      expect(html).toContain('×2');
    });

    it('should render size badge', () => {
      const html = renderDipsPricing(samplePricing);

      expect(html).toContain('size-badge');
      expect(html).toContain('1.5oz');
    });

    it('should show included badge when no upcharges', () => {
      const html = renderDipsPricing(samplePricing);

      expect(html).toContain('Included');
    });

    it('should render upcharges', () => {
      const pricingWithUpcharges = {
        ...samplePricing,
        modifiers: [
          {
            id: 'mod-1',
            itemId: 'dip-ranch',
            type: 'upcharge',
            amount: 1.50,
            label: 'Extra dips',
            source: 'dips'
          }
        ]
      };

      const html = renderDipsPricing(pricingWithUpcharges);

      expect(html).toContain('Upcharges');
      expect(html).toContain('$1.50');
    });

    it('should render empty state when no dips', () => {
      const pricingNoDips = {
        items: {},
        modifiers: []
      };

      const html = renderDipsPricing(pricingNoDips);

      expect(html).toContain('pricing-empty');
    });
  });

  describe('renderSidesPricing', () => {
    it('should render sides section', () => {
      const html = renderSidesPricing(samplePricing);

      expect(html).toContain('pricing-sides');
      expect(html).toContain('Sides');
      expect(html).toContain('1 items');
    });

    it('should render side items', () => {
      const html = renderSidesPricing(samplePricing);

      expect(html).toContain('Regular Fries');
    });

    it('should render serves badge', () => {
      const html = renderSidesPricing(samplePricing);

      expect(html).toContain('serves-badge');
      expect(html).toContain('Serves 4');
    });

    it('should show quantity when > 1', () => {
      const pricingMultipleSides = {
        ...samplePricing,
        items: {
          'side-fries': {
            id: 'side-fries',
            type: 'side',
            name: 'Regular Fries',
            quantity: 3,
            serves: 4,
            basePrice: 6.99
          }
        }
      };

      const html = renderSidesPricing(pricingMultipleSides);

      expect(html).toContain('×3');
    });

    it('should render total upcharge', () => {
      const html = renderSidesPricing(samplePricing);

      expect(html).toContain('Sides Total');
      expect(html).toContain('upcharge-amount');
    });

    it('should render empty state when no sides', () => {
      const pricingNoSides = {
        items: {},
        modifiers: []
      };

      const html = renderSidesPricing(pricingNoSides);

      expect(html).toContain('pricing-empty');
    });
  });

  describe('renderDessertsPricing', () => {
    it('should render desserts section', () => {
      const html = renderDessertsPricing(samplePricing);

      expect(html).toContain('pricing-desserts');
      expect(html).toContain('Desserts');
      expect(html).toContain('6 items');
    });

    it('should render dessert items', () => {
      const html = renderDessertsPricing(samplePricing);

      expect(html).toContain('Chocolate Chip Cookies');
      expect(html).toContain('×6');
    });

    it('should render total upcharge', () => {
      const html = renderDessertsPricing(samplePricing);

      expect(html).toContain('Desserts Total');
      expect(html).toContain('upcharge-amount');
    });

    it('should render empty state when no desserts', () => {
      const pricingNoDesserts = {
        items: {},
        modifiers: []
      };

      const html = renderDessertsPricing(pricingNoDesserts);

      expect(html).toContain('pricing-empty');
    });
  });

  describe('renderBeveragesPricing', () => {
    it('should render beverages section', () => {
      const html = renderBeveragesPricing(samplePricing);

      expect(html).toContain('pricing-beverages');
      expect(html).toContain('Beverages');
      expect(html).toContain('1 items');
    });

    it('should group by temperature', () => {
      const html = renderBeveragesPricing(samplePricing);

      expect(html).toContain('Cold Beverages');
      expect(html).toContain('Coca-Cola');
    });

    it('should render hot beverages', () => {
      const pricingWithHot = {
        ...samplePricing,
        items: {
          ...samplePricing.items,
          'beverage-coffee': {
            id: 'beverage-coffee',
            type: 'beverage',
            name: 'Coffee',
            quantity: 2,
            size: '12oz',
            temperature: 'hot',
            basePrice: 4.00
          }
        }
      };

      const html = renderBeveragesPricing(pricingWithHot);

      expect(html).toContain('Hot Beverages');
      expect(html).toContain('Coffee');
    });

    it('should render quantity and size', () => {
      const html = renderBeveragesPricing(samplePricing);

      expect(html).toContain('×4');
      expect(html).toContain('20oz');
    });

    it('should render total upcharge', () => {
      const html = renderBeveragesPricing(samplePricing);

      expect(html).toContain('Beverages Total');
      expect(html).toContain('upcharge-amount');
    });

    it('should render empty state when no beverages', () => {
      const pricingNoBeverages = {
        items: {},
        modifiers: []
      };

      const html = renderBeveragesPricing(pricingNoBeverages);

      expect(html).toContain('pricing-empty');
    });
  });

  describe('initItemsPricing', () => {
    it('should initialize with initial pricing', () => {
      initItemsPricing('items-pricing', samplePricing);

      const container = document.getElementById('items-pricing');
      expect(container.innerHTML).toContain('pricing-items-container');
      expect(container.innerHTML).toContain('Sauces');
    });

    it('should initialize with null pricing (empty state)', () => {
      initItemsPricing('items-pricing', null);

      const container = document.getElementById('items-pricing');
      expect(container.innerHTML).toContain('No additional items configured');
    });

    it('should error when container not found', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      const unsubscribe = initItemsPricing('non-existent-id');

      expect(consoleError).toHaveBeenCalledWith(
        expect.stringContaining('Items pricing container not found')
      );
      expect(typeof unsubscribe).toBe('function');

      consoleError.mockRestore();
    });

    it('should apply custom options', () => {
      initItemsPricing('items-pricing', samplePricing, {
        showDetails: false
      });

      const container = document.getElementById('items-pricing');
      expect(container.innerHTML).toContain('pricing-items-container');
      expect(container.innerHTML).not.toContain('pricing-details');
    });

    it('should return unsubscribe function', () => {
      const unsubscribe = initItemsPricing('items-pricing', samplePricing);

      expect(typeof unsubscribe).toBe('function');

      unsubscribe();
    });
  });

  describe('edge cases', () => {
    it('should handle mixed included and extra sauces', () => {
      const mixedPricing = {
        items: {
          'sauce-1': { id: 'sauce-1', type: 'sauce', name: 'Buffalo', included: true },
          'sauce-2': { id: 'sauce-2', type: 'sauce', name: 'BBQ', included: true },
          'sauce-3': { id: 'sauce-3', type: 'sauce', name: 'Ranch', included: false }
        },
        modifiers: []
      };

      const html = renderSaucesPricing(mixedPricing);

      expect(html).toContain('Included Sauces');
      expect(html).toContain('Extra Sauces');
      expect(html).toContain('Buffalo');
      expect(html).toContain('Ranch');
    });

    it('should handle items without optional fields', () => {
      const minimalPricing = {
        items: {
          'sauce-1': { id: 'sauce-1', type: 'sauce', name: 'Buffalo' },
          'dip-1': { id: 'dip-1', type: 'dip', name: 'Ranch', quantity: 1 },
          'side-1': { id: 'side-1', type: 'side', name: 'Fries', quantity: 1 },
          'dessert-1': { id: 'dessert-1', type: 'dessert', name: 'Cookie', quantity: 1 },
          'beverage-1': { id: 'beverage-1', type: 'beverage', name: 'Soda', quantity: 1, temperature: 'cold' }
        },
        modifiers: []
      };

      const html = renderItemsPricing(minimalPricing);

      expect(html).toContain('Buffalo');
      expect(html).toContain('Ranch');
      expect(html).toContain('Fries');
      expect(html).toContain('Cookie');
      expect(html).toContain('Soda');
    });

    it('should handle zero heat level', () => {
      const zeroPricing = {
        items: {
          'sauce-1': { id: 'sauce-1', type: 'sauce', name: 'Mild', heatLevel: 0 }
        },
        modifiers: []
      };

      const html = renderSaucesPricing(zeroPricing);

      // Heat level 0 should not show badge (per implementation)
      expect(html).not.toContain('heat-badge');
    });
  });
});
