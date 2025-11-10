/**
 * Tests for Wings Pricing Renderer (S6)
 * Tests HTML rendering, empty states, subscriptions
 *
 * @epic SP-PRICING-001
 * @story S6-WingsUI
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import {
  renderWingsPricing,
  subscribeWingsPricing,
  initWingsPricing
} from '../src/components/catering/pricing-wings-renderer.js';

describe('Wings Pricing Renderer', () => {
  let dom;
  let document;

  beforeEach(() => {
    // Create a virtual DOM for testing
    dom = new JSDOM('<!DOCTYPE html><div id="wings-pricing"></div>');
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
      }
    },
    modifiers: [],
    meta: {
      completionStatus: {},
      lastCalculated: new Date().toISOString()
    },
    totals: {
      itemsSubtotal: 125,
      upcharges: 0,
      discounts: 0,
      subtotal: 125,
      tax: 0,
      total: 125
    }
  };

  describe('renderWingsPricing', () => {
    it('should render wings pricing section', () => {
      const html = renderWingsPricing(samplePricing);

      expect(html).toContain('pricing-wings');
      expect(html).toContain('Wings Pricing');
      expect(html).toContain('60 wings');
    });

    it('should render wing items', () => {
      const html = renderWingsPricing(samplePricing);

      expect(html).toContain('Boneless Wings');
      expect(html).toContain('Bone-In Wings');
      expect(html).toContain('30 wings');
    });

    it('should show included badge when no upcharges', () => {
      const html = renderWingsPricing(samplePricing);

      expect(html).toContain('Included');
      expect(html).not.toContain('upcharge-amount');
    });

    it('should render upcharges when present', () => {
      const pricingWithUpcharges = {
        ...samplePricing,
        modifiers: [
          {
            id: 'mod-1',
            itemId: 'wings-bone-in',
            type: 'upcharge',
            amount: 7.50,
            label: 'Flats only (30) (+$0.25 each)',
            source: 'wings'
          }
        ]
      };

      const html = renderWingsPricing(pricingWithUpcharges);

      expect(html).toContain('$7.50');
      expect(html).toContain('Premium Options');
      expect(html).toContain('Flats only');
    });

    it('should render cauliflower wings with plant-based badge', () => {
      const pricingWithCauliflower = {
        ...samplePricing,
        items: {
          'wings-cauliflower': {
            id: 'wings-cauliflower',
            type: 'wing',
            wingType: 'cauliflower',
            quantity: 20,
            plantBased: true,
            dietary: ['vegan', 'vegetarian'],
            basePrice: 0
          }
        }
      };

      const html = renderWingsPricing(pricingWithCauliflower);

      expect(html).toContain('Cauliflower Wings');
      expect(html).toContain('🌱');
      expect(html).toContain('plant-based-badge');
    });

    it('should render bone-in style variations', () => {
      const pricingWithFlats = {
        items: {
          'wings-bone-in': {
            id: 'wings-bone-in',
            type: 'wing',
            wingType: 'bone-in',
            quantity: 60,
            style: 'flats',
            basePrice: 0
          }
        },
        modifiers: [],
        meta: {},
        totals: {}
      };

      const html = renderWingsPricing(pricingWithFlats);

      expect(html).toContain('Flats Only');
    });

    it('should render warnings when present', () => {
      const pricingWithWarnings = {
        ...samplePricing,
        modifiers: [
          {
            id: 'mod-1',
            itemId: 'wings',
            type: 'warning',
            amount: 0,
            label: 'Wing distribution does not match package total',
            source: 'wings'
          }
        ]
      };

      const html = renderWingsPricing(pricingWithWarnings);

      expect(html).toContain('warning');
      expect(html).toContain('⚠️');
      expect(html).toContain('Wing distribution does not match');
    });

    it('should hide details when showDetails is false', () => {
      const html = renderWingsPricing(samplePricing, { showDetails: false });

      expect(html).toContain('Wings Pricing');
      expect(html).not.toContain('pricing-details');
    });

    it('should hide upcharges when showUpcharges is false', () => {
      const pricingWithUpcharges = {
        ...samplePricing,
        modifiers: [
          {
            id: 'mod-1',
            itemId: 'wings',
            type: 'upcharge',
            amount: 10,
            label: 'Test upcharge',
            source: 'wings'
          }
        ]
      };

      const html = renderWingsPricing(pricingWithUpcharges, { showUpcharges: false });

      expect(html).toContain('Wings Pricing');
      expect(html).not.toContain('Premium Options');
    });

    it('should use custom container ID', () => {
      const html = renderWingsPricing(samplePricing, { containerId: 'custom-wings' });

      expect(html).toContain('id="custom-wings"');
    });
  });

  describe('renderWingsPricing - empty states', () => {
    it('should render empty state when pricing is null', () => {
      const html = renderWingsPricing(null);

      expect(html).toContain('pricing-empty');
      expect(html).toContain('No wings configured yet');
    });

    it('should render empty state when no wing items', () => {
      const emptyPricing = {
        items: {},
        modifiers: [],
        meta: {},
        totals: {}
      };

      const html = renderWingsPricing(emptyPricing);

      expect(html).toContain('No wings configured yet');
    });

    it('should render empty state when items is undefined', () => {
      const html = renderWingsPricing({});

      expect(html).toContain('No wings configured yet');
    });
  });

  describe('subscribeWingsPricing', () => {
    it('should warn when container not found', () => {
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const unsubscribe = subscribeWingsPricing('non-existent-id');

      expect(consoleWarn).toHaveBeenCalledWith(
        expect.stringContaining('Wings pricing container not found')
      );
      expect(typeof unsubscribe).toBe('function');

      consoleWarn.mockRestore();
    });

    it('should return unsubscribe function', () => {
      const unsubscribe = subscribeWingsPricing('wings-pricing');

      expect(typeof unsubscribe).toBe('function');

      unsubscribe();
    });
  });

  describe('initWingsPricing', () => {
    it('should initialize with initial pricing', () => {
      initWingsPricing('wings-pricing', samplePricing);

      const container = document.getElementById('wings-pricing');
      expect(container.innerHTML).toContain('Wings Pricing');
      expect(container.innerHTML).toContain('60 wings');
    });

    it('should initialize with null pricing (empty state)', () => {
      initWingsPricing('wings-pricing', null);

      const container = document.getElementById('wings-pricing');
      expect(container.innerHTML).toContain('No wings configured yet');
    });

    it('should error when container not found', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      const unsubscribe = initWingsPricing('non-existent-id');

      expect(consoleError).toHaveBeenCalledWith(
        expect.stringContaining('Wings pricing container not found')
      );
      expect(typeof unsubscribe).toBe('function');

      consoleError.mockRestore();
    });

    it('should apply custom options', () => {
      initWingsPricing('wings-pricing', samplePricing, {
        showDetails: false,
        showUpcharges: false
      });

      const container = document.getElementById('wings-pricing');
      expect(container.innerHTML).toContain('Wings Pricing');
      expect(container.innerHTML).not.toContain('pricing-details');
    });

    it('should return unsubscribe function', () => {
      const unsubscribe = initWingsPricing('wings-pricing', samplePricing);

      expect(typeof unsubscribe).toBe('function');

      unsubscribe();
    });
  });

  describe('wing type labels and icons', () => {
    it('should show correct icons for each wing type', () => {
      const bonelessHtml = renderWingsPricing({
        items: {
          'wings-boneless': {
            id: 'wings-boneless',
            type: 'wing',
            wingType: 'boneless',
            quantity: 20
          }
        },
        modifiers: [],
        meta: {},
        totals: {}
      });

      const boneInHtml = renderWingsPricing({
        items: {
          'wings-bone-in': {
            id: 'wings-bone-in',
            type: 'wing',
            wingType: 'bone-in',
            quantity: 20
          }
        },
        modifiers: [],
        meta: {},
        totals: {}
      });

      const cauliflowerHtml = renderWingsPricing({
        items: {
          'wings-cauliflower': {
            id: 'wings-cauliflower',
            type: 'wing',
            wingType: 'cauliflower',
            quantity: 20
          }
        },
        modifiers: [],
        meta: {},
        totals: {}
      });

      expect(bonelessHtml).toContain('🍗');
      expect(boneInHtml).toContain('🦴');
      expect(cauliflowerHtml).toContain('🥦');
    });
  });

  describe('multiple upcharges', () => {
    it('should render all upcharges correctly', () => {
      const pricingWithMultipleUpcharges = {
        ...samplePricing,
        items: {
          'wings-bone-in': {
            id: 'wings-bone-in',
            type: 'wing',
            wingType: 'bone-in',
            quantity: 30,
            style: 'flats'
          },
          'wings-cauliflower': {
            id: 'wings-cauliflower',
            type: 'wing',
            wingType: 'cauliflower',
            quantity: 30
          }
        },
        modifiers: [
          {
            id: 'mod-1',
            itemId: 'wings-bone-in',
            type: 'upcharge',
            amount: 7.50,
            label: 'Flats only (30) (+$0.25 each)',
            source: 'wings'
          },
          {
            id: 'mod-2',
            itemId: 'wings-cauliflower',
            type: 'upcharge',
            amount: 15.00,
            label: 'Cauliflower wings (30) (+$0.50 each)',
            source: 'wings'
          }
        ]
      };

      const html = renderWingsPricing(pricingWithMultipleUpcharges);

      expect(html).toContain('$7.50');
      expect(html).toContain('$15.00');
      expect(html).toContain('$22.50'); // Total upcharges in badge
      expect(html).toContain('Flats only');
      expect(html).toContain('Cauliflower wings');
    });
  });
});
