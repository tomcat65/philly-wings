/**
 * Catering Customization Context Integration Test Suite
 * Tests complete state management flow with auto-features
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import {
  CateringCustomizationProvider,
  useCateringCustomization,
  ACTIONS
} from '../../src/context/CateringCustomizationContext.js';
import { useCateringActions } from '../../src/hooks/useCateringActions.js';

// Mock localStorage
const createLocalStorageMock = () => ({
  store: {},
  getItem(key) {
    return this.store[key] || null;
  },
  setItem(key, value) {
    this.store[key] = String(value);
  },
  removeItem(key) {
    delete this.store[key];
  },
  clear() {
    this.store = {};
  }
});

describe('Catering Customization Context', () => {
  let localStorageMock;

  beforeEach(() => {
    localStorageMock = createLocalStorageMock();
    global.localStorage = localStorageMock;
    vi.useFakeTimers();
  });

  afterEach(() => {
    localStorageMock.clear();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('Context Provider', () => {
    it('should provide initial state', () => {
      const { result } = renderHook(() => useCateringCustomization(), {
        wrapper: CateringCustomizationProvider
      });

      expect(result.current.state).toBeDefined();
      expect(result.current.state.package.id).toBeNull();
      expect(result.current.state.wings.total).toBe(0);
      expect(result.current.state.pricing.total).toBe(0);
      expect(result.current.dispatch).toBeTypeOf('function');
    });

    it('should throw error when used outside provider', () => {
      expect(() => {
        renderHook(() => useCateringCustomization());
      }).toThrow('useCateringCustomization must be used within CateringCustomizationProvider');
    });
  });

  describe('Package Selection', () => {
    it('should select package and initialize state', () => {
      const { result } = renderHook(() => useCateringCustomization(), {
        wrapper: CateringCustomizationProvider
      });

      const packageData = {
        id: 'lunch-box-special',
        name: 'Lunch Box Special',
        basePrice: 149.99,
        wingOptions: {
          totalWings: 100,
          boneless: 75,
          boneIn: 25
        },
        sauceSelections: {
          min: 3,
          max: 5
        },
        dips: {
          fivePacksIncluded: 3
        },
        chips: {
          fivePacksIncluded: 2
        }
      };

      act(() => {
        result.current.dispatch({
          type: ACTIONS.SELECT_PACKAGE,
          payload: packageData
        });
      });

      expect(result.current.state.package.id).toBe('lunch-box-special');
      expect(result.current.state.package.basePrice).toBe(149.99);
      expect(result.current.state.wings.boneless.quantity).toBe(75);
      expect(result.current.state.wings.boneIn.quantity).toBe(25);
      expect(result.current.state.sauces.min).toBe(3);
      expect(result.current.state.sauces.max).toBe(5);
      expect(result.current.state.sides.chips.fivePacks).toBe(2);
    });
  });

  describe('Wing Customization', () => {
    it('should update wing quantities', () => {
      const { result } = renderHook(() => useCateringCustomization(), {
        wrapper: CateringCustomizationProvider
      });

      act(() => {
        result.current.dispatch({
          type: ACTIONS.UPDATE_WINGS,
          payload: {
            boneless: { quantity: 60 },
            boneIn: { quantity: 40 }
          }
        });
      });

      expect(result.current.state.wings.boneless.quantity).toBe(60);
      expect(result.current.state.wings.boneIn.quantity).toBe(40);
    });

    it('should update bone-in style', () => {
      const { result } = renderHook(() => useCateringCustomization(), {
        wrapper: CateringCustomizationProvider
      });

      act(() => {
        result.current.dispatch({
          type: ACTIONS.UPDATE_WINGS,
          payload: {
            boneIn: { quantity: 50, style: 'flats' }
          }
        });
      });

      expect(result.current.state.wings.boneIn.style).toBe('flats');
    });

    it('should update plant-based with prep method', () => {
      const { result } = renderHook(() => useCateringCustomization(), {
        wrapper: CateringCustomizationProvider
      });

      act(() => {
        result.current.dispatch({
          type: ACTIONS.UPDATE_WINGS,
          payload: {
            plantBased: { quantity: 20, prep: 'baked' }
          }
        });
      });

      expect(result.current.state.wings.plantBased.quantity).toBe(20);
      expect(result.current.state.wings.plantBased.prep).toBe('baked');
    });
  });

  describe('Sauce Selection', () => {
    it('should select sauces', () => {
      const { result } = renderHook(() => useCateringCustomization(), {
        wrapper: CateringCustomizationProvider
      });

      const sauces = ['buffalo', 'bbq', 'honey-garlic'];

      act(() => {
        result.current.dispatch({
          type: ACTIONS.SELECT_SAUCE,
          payload: sauces
        });
      });

      expect(result.current.state.sauces.selected).toEqual(sauces);
    });
  });

  describe('Add-ons Management', () => {
    it('should add dessert', () => {
      const { result } = renderHook(() => useCateringCustomization(), {
        wrapper: CateringCustomizationProvider
      });

      act(() => {
        result.current.dispatch({
          type: ACTIONS.ADD_DESSERT,
          payload: { dessertId: 'brownie', fivePacks: 2, price: 15.00 }
        });
      });

      expect(result.current.state.desserts).toHaveLength(1);
      expect(result.current.state.desserts[0].dessertId).toBe('brownie');
      expect(result.current.state.desserts[0].fivePacks).toBe(2);
    });

    it('should remove dessert by index', () => {
      const { result } = renderHook(() => useCateringCustomization(), {
        wrapper: CateringCustomizationProvider
      });

      act(() => {
        result.current.dispatch({
          type: ACTIONS.ADD_DESSERT,
          payload: { dessertId: 'brownie', fivePacks: 2, price: 15.00 }
        });
        result.current.dispatch({
          type: ACTIONS.ADD_DESSERT,
          payload: { dessertId: 'cookie', fivePacks: 1, price: 12.00 }
        });
      });

      expect(result.current.state.desserts).toHaveLength(2);

      act(() => {
        result.current.dispatch({
          type: ACTIONS.REMOVE_DESSERT,
          payload: 0
        });
      });

      expect(result.current.state.desserts).toHaveLength(1);
      expect(result.current.state.desserts[0].dessertId).toBe('cookie');
    });

    it('should add beverage', () => {
      const { result } = renderHook(() => useCateringCustomization(), {
        wrapper: CateringCustomizationProvider
      });

      act(() => {
        result.current.dispatch({
          type: ACTIONS.ADD_BEVERAGE,
          payload: { beverageId: 'iced-tea', quantity: 2, price: 8.99, isAddon: true }
        });
      });

      expect(result.current.state.beverages).toHaveLength(1);
      expect(result.current.state.beverages[0].beverageId).toBe('iced-tea');
    });

    it('should add quick-add', () => {
      const { result } = renderHook(() => useCateringCustomization(), {
        wrapper: CateringCustomizationProvider
      });

      act(() => {
        result.current.dispatch({
          type: ACTIONS.ADD_QUICK_ADD,
          payload: { itemId: 'utensils', quantity: 50, price: 0.25, type: 'misc' }
        });
      });

      expect(result.current.state.quickAdds).toHaveLength(1);
      expect(result.current.state.quickAdds[0].itemId).toBe('utensils');
    });
  });

  describe('Delivery Information', () => {
    it('should update delivery info', () => {
      const { result } = renderHook(() => useCateringCustomization(), {
        wrapper: CateringCustomizationProvider
      });

      const delivery = {
        date: '2025-02-01',
        timeWindow: '11:00 AM - 1:00 PM',
        address: { street: '123 Main St', city: 'Philadelphia', zip: '19103' }
      };

      act(() => {
        result.current.dispatch({
          type: ACTIONS.UPDATE_DELIVERY,
          payload: delivery
        });
      });

      expect(result.current.state.delivery.date).toBe('2025-02-01');
      expect(result.current.state.delivery.timeWindow).toBe('11:00 AM - 1:00 PM');
      expect(result.current.state.delivery.address.street).toBe('123 Main St');
    });
  });

  describe('UI State', () => {
    it('should navigate to step', () => {
      const { result } = renderHook(() => useCateringCustomization(), {
        wrapper: CateringCustomizationProvider
      });

      act(() => {
        result.current.dispatch({
          type: ACTIONS.SET_CURRENT_STEP,
          payload: 3
        });
      });

      expect(result.current.state.ui.currentStep).toBe(3);
    });
  });

  describe('State Reset', () => {
    it('should reset to initial state', () => {
      const { result } = renderHook(() => useCateringCustomization(), {
        wrapper: CateringCustomizationProvider
      });

      // Make changes
      act(() => {
        result.current.dispatch({
          type: ACTIONS.SELECT_PACKAGE,
          payload: { id: 'test', basePrice: 100 }
        });
        result.current.dispatch({
          type: ACTIONS.ADD_DESSERT,
          payload: { dessertId: 'brownie', fivePacks: 1, price: 15.00 }
        });
      });

      expect(result.current.state.package.id).toBe('test');
      expect(result.current.state.desserts).toHaveLength(1);

      // Reset
      act(() => {
        result.current.dispatch({ type: ACTIONS.RESET_STATE });
      });

      expect(result.current.state.package.id).toBeNull();
      expect(result.current.state.desserts).toHaveLength(0);
      expect(localStorageMock.getItem('catering_customization')).toBeNull();
    });
  });

  describe('Auto-save Feature', () => {
    it('should auto-save to localStorage after package selection', async () => {
      const { result } = renderHook(() => useCateringCustomization(), {
        wrapper: CateringCustomizationProvider
      });

      act(() => {
        result.current.dispatch({
          type: ACTIONS.SELECT_PACKAGE,
          payload: { id: 'lunch-box-special', basePrice: 149.99 }
        });
      });

      // Fast-forward debounce timer (1 second)
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      const stored = localStorageMock.getItem('catering_customization');
      expect(stored).not.toBeNull();

      const parsed = JSON.parse(stored);
      expect(parsed.data.package.id).toBe('lunch-box-special');
    });

    it('should debounce multiple rapid changes', async () => {
      const { result } = renderHook(() => useCateringCustomization(), {
        wrapper: CateringCustomizationProvider
      });

      act(() => {
        result.current.dispatch({
          type: ACTIONS.SELECT_PACKAGE,
          payload: { id: 'test', basePrice: 100 }
        });
      });

      act(() => {
        vi.advanceTimersByTime(500); // Only 500ms
      });

      act(() => {
        result.current.dispatch({
          type: ACTIONS.ADD_DESSERT,
          payload: { dessertId: 'brownie', fivePacks: 1, price: 15.00 }
        });
      });

      // Should not have saved yet
      expect(localStorageMock.getItem('catering_customization')).toBeNull();

      // Complete debounce
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // Now it should save
      const stored = localStorageMock.getItem('catering_customization');
      expect(stored).not.toBeNull();
    });
  });

  describe('Auto-pricing Feature', () => {
    it('should have pricing structure in state', () => {
      const { result } = renderHook(() => useCateringCustomization(), {
        wrapper: CateringCustomizationProvider
      });

      // Verify pricing structure exists
      expect(result.current.state.pricing).toBeDefined();
      expect(result.current.state.pricing.basePrice).toBe(0);
      expect(result.current.state.pricing.addOns).toBe(0);
      expect(result.current.state.pricing.subtotal).toBe(0);
      expect(result.current.state.pricing.tax).toBe(0);
      expect(result.current.state.pricing.deliveryFee).toBe(0);
      expect(result.current.state.pricing.total).toBe(0);

      // Note: Auto-pricing calculation is tested in pricing.test.js
      // The useEffect that triggers auto-pricing is an implementation detail
    });
  });

  describe('useCateringActions Hook', () => {
    it('should provide convenience action methods', () => {
      const { result } = renderHook(
        () => ({
          context: useCateringCustomization(),
          actions: useCateringActions()
        }),
        { wrapper: CateringCustomizationProvider }
      );

      expect(result.current.actions.selectPackage).toBeTypeOf('function');
      expect(result.current.actions.updateWings).toBeTypeOf('function');
      expect(result.current.actions.toggleSauce).toBeTypeOf('function');
      expect(result.current.actions.addDessert).toBeTypeOf('function');
      expect(result.current.actions.nextStep).toBeTypeOf('function');
    });

    it('should toggle sauce on/off', () => {
      const { result } = renderHook(
        () => ({
          context: useCateringCustomization(),
          actions: useCateringActions()
        }),
        { wrapper: CateringCustomizationProvider }
      );

      // Set up sauces with max
      act(() => {
        result.current.context.dispatch({
          type: ACTIONS.SELECT_PACKAGE,
          payload: {
            id: 'test',
            sauceSelections: { min: 3, max: 5 }
          }
        });
      });

      // Add sauce
      act(() => {
        result.current.actions.toggleSauce('buffalo');
      });

      expect(result.current.context.state.sauces.selected).toContain('buffalo');

      // Remove sauce
      act(() => {
        result.current.actions.toggleSauce('buffalo');
      });

      expect(result.current.context.state.sauces.selected).not.toContain('buffalo');
    });

    it('should set dip quantity', () => {
      const { result } = renderHook(
        () => ({
          context: useCateringCustomization(),
          actions: useCateringActions()
        }),
        { wrapper: CateringCustomizationProvider }
      );

      act(() => {
        result.current.actions.setDipQuantity('ranch', 2);
      });

      expect(result.current.context.state.dips).toHaveLength(1);
      expect(result.current.context.state.dips[0].dipId).toBe('ranch');
      expect(result.current.context.state.dips[0].fivePacks).toBe(2);

      // Update quantity
      act(() => {
        result.current.actions.setDipQuantity('ranch', 3);
      });

      expect(result.current.context.state.dips).toHaveLength(1);
      expect(result.current.context.state.dips[0].fivePacks).toBe(3);

      // Remove by setting to 0
      act(() => {
        result.current.actions.setDipQuantity('ranch', 0);
      });

      expect(result.current.context.state.dips).toHaveLength(0);
    });

    it('should navigate steps', () => {
      const { result } = renderHook(
        () => ({
          context: useCateringCustomization(),
          actions: useCateringActions()
        }),
        { wrapper: CateringCustomizationProvider }
      );

      expect(result.current.context.state.ui.currentStep).toBe(0);

      act(() => {
        result.current.actions.nextStep();
      });

      expect(result.current.context.state.ui.currentStep).toBe(1);

      act(() => {
        result.current.actions.previousStep();
      });

      expect(result.current.context.state.ui.currentStep).toBe(0);

      // Should not go below 0
      act(() => {
        result.current.actions.previousStep();
      });

      expect(result.current.context.state.ui.currentStep).toBe(0);
    });
  });
});
