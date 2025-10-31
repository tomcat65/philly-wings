/**
 * Catering Customization Context
 * Global state management for shared platter customization flow
 */

import React, { createContext, useContext, useReducer, useEffect, useMemo } from 'react';
import { loadFromStorage, saveToStorage, clearStorage } from '../utils/storage.js';
import { calculatePricing } from '../utils/pricing.js';
import { validateState } from '../utils/validation.js';

const CateringContext = createContext(null);

const STORAGE_KEY = 'catering_customization';

// Initial state shape
const initialState = {
  // Selected package
  package: {
    id: null,
    name: null,
    basePrice: 0,
    servesMin: 0,
    servesMax: 0,
    wingOptions: {},
    sauceSelections: {},
    dips: {}
  },

  // Wing customization
  wings: {
    plantBased: {
      quantity: 0,
      prep: null  // 'baked' | 'fried' | 'split'
    },
    boneless: {
      quantity: 0
    },
    boneIn: {
      quantity: 0,
      style: 'mixed'  // 'mixed' | 'flats' | 'drums'
    },
    total: 0
  },

  // Sauce selections
  sauces: {
    selected: [],  // Array of sauce IDs
    min: 0,
    max: 0
  },

  // Dip selections
  dips: [],  // [{ dipId: 'ranch', fivePacks: 2 }]

  // Sides & Salads
  sides: {
    chips: { fivePacks: 0, included: true },
    coldSides: [],  // Selected cold side IDs
    salads: []  // [{ saladId, quantity, isAddon, price }]
  },

  // Desserts
  desserts: [],  // [{ dessertId, fivePacks, price }]

  // Beverages
  beverages: [],  // [{ beverageId, quantity, price, isAddon }]

  // Quick-adds
  quickAdds: [],  // [{ itemId, quantity, price, type }]

  // Pricing
  pricing: {
    basePrice: 0,
    customizationAdjustments: 0,
    addOns: 0,
    quickAdds: 0,
    subtotal: 0,
    tax: 0,
    deliveryFee: 0,
    total: 0
  },

  // Delivery info
  delivery: {
    date: null,
    timeWindow: null,
    address: {},
    specialInstructions: ''
  },

  // Validation
  validation: {
    isValid: false,
    errors: {},
    warnings: {}
  },

  // UI state
  ui: {
    currentStep: 0,
    isLoading: false,
    isSaving: false,
    lastSaved: null
  }
};

// Action types
export const ACTIONS = {
  SELECT_PACKAGE: 'SELECT_PACKAGE',
  UPDATE_WINGS: 'UPDATE_WINGS',
  SELECT_SAUCE: 'SELECT_SAUCE',
  UPDATE_DIPS: 'UPDATE_DIPS',
  UPDATE_SIDES: 'UPDATE_SIDES',
  ADD_DESSERT: 'ADD_DESSERT',
  REMOVE_DESSERT: 'REMOVE_DESSERT',
  ADD_BEVERAGE: 'ADD_BEVERAGE',
  REMOVE_BEVERAGE: 'REMOVE_BEVERAGE',
  ADD_QUICK_ADD: 'ADD_QUICK_ADD',
  REMOVE_QUICK_ADD: 'REMOVE_QUICK_ADD',
  UPDATE_DELIVERY: 'UPDATE_DELIVERY',
  UPDATE_PRICING: 'UPDATE_PRICING',
  SET_VALIDATION: 'SET_VALIDATION',
  SET_CURRENT_STEP: 'SET_CURRENT_STEP',
  RESET_STATE: 'RESET_STATE',
  HYDRATE_STATE: 'HYDRATE_STATE'
};

/**
 * Reducer function for state management
 */
function customizationReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SELECT_PACKAGE:
      return {
        ...initialState,
        package: action.payload,
        wings: {
          ...initialState.wings,
          total: action.payload.wingOptions?.totalWings || 0,
          boneless: {
            quantity: action.payload.wingOptions?.boneless || 0
          },
          boneIn: {
            quantity: action.payload.wingOptions?.boneIn || 0,
            style: 'mixed'
          }
        },
        sauces: {
          selected: [],
          min: action.payload.sauceSelections?.min || 0,
          max: action.payload.sauceSelections?.max || 0
        },
        dips: [],
        sides: {
          ...initialState.sides,
          chips: {
            fivePacks: action.payload.chips?.fivePacksIncluded || 0,
            included: true
          }
        },
        pricing: {
          ...initialState.pricing,
          basePrice: action.payload.basePrice || 0
        }
      };

    case ACTIONS.UPDATE_WINGS:
      return {
        ...state,
        wings: { ...state.wings, ...action.payload }
      };

    case ACTIONS.SELECT_SAUCE:
      return {
        ...state,
        sauces: {
          ...state.sauces,
          selected: action.payload
        }
      };

    case ACTIONS.UPDATE_DIPS:
      return {
        ...state,
        dips: action.payload
      };

    case ACTIONS.UPDATE_SIDES:
      return {
        ...state,
        sides: { ...state.sides, ...action.payload }
      };

    case ACTIONS.ADD_DESSERT:
      return {
        ...state,
        desserts: [...state.desserts, action.payload]
      };

    case ACTIONS.REMOVE_DESSERT:
      return {
        ...state,
        desserts: state.desserts.filter((_, index) => index !== action.payload)
      };

    case ACTIONS.ADD_BEVERAGE:
      return {
        ...state,
        beverages: [...state.beverages, action.payload]
      };

    case ACTIONS.REMOVE_BEVERAGE:
      return {
        ...state,
        beverages: state.beverages.filter((_, index) => index !== action.payload)
      };

    case ACTIONS.ADD_QUICK_ADD:
      return {
        ...state,
        quickAdds: [...state.quickAdds, action.payload]
      };

    case ACTIONS.REMOVE_QUICK_ADD:
      return {
        ...state,
        quickAdds: state.quickAdds.filter((_, index) => index !== action.payload)
      };

    case ACTIONS.UPDATE_DELIVERY:
      return {
        ...state,
        delivery: { ...state.delivery, ...action.payload }
      };

    case ACTIONS.UPDATE_PRICING:
      return {
        ...state,
        pricing: action.payload
      };

    case ACTIONS.SET_VALIDATION:
      return {
        ...state,
        validation: action.payload
      };

    case ACTIONS.SET_CURRENT_STEP:
      return {
        ...state,
        ui: { ...state.ui, currentStep: action.payload }
      };

    case ACTIONS.RESET_STATE:
      clearStorage(STORAGE_KEY);
      return initialState;

    case ACTIONS.HYDRATE_STATE:
      return {
        ...state,
        ...action.payload,
        ui: {
          ...state.ui,
          isLoading: false
        }
      };

    default:
      return state;
  }
}

/**
 * Catering Customization Provider Component
 */
export function CateringCustomizationProvider({ children }) {
  const [state, dispatch] = useReducer(
    customizationReducer,
    initialState,
    (initial) => {
      // Hydrate from localStorage on init
      const saved = loadFromStorage(STORAGE_KEY);
      return saved ? { ...initial, ...saved } : initial;
    }
  );

  // Auto-save to localStorage on state changes (debounced)
  useEffect(() => {
    if (state.package?.id) {
      const timeoutId = setTimeout(() => {
        saveToStorage(STORAGE_KEY, state);
      }, 1000); // Debounce 1 second

      return () => clearTimeout(timeoutId);
    }
  }, [state]);

  // Auto-recalculate pricing on relevant changes
  useEffect(() => {
    if (!state.package?.id) return;

    const newPricing = calculatePricing(state);

    // Only update if pricing actually changed
    if (JSON.stringify(newPricing) !== JSON.stringify(state.pricing)) {
      dispatch({
        type: ACTIONS.UPDATE_PRICING,
        payload: newPricing
      });
    }
  }, [
    state.package,
    state.desserts,
    state.beverages,
    state.quickAdds,
    state.sides.salads
  ]);

  // Auto-validate on state changes
  useEffect(() => {
    if (!state.package?.id) return;

    const validation = validateState(state);

    // Only update if validation changed
    if (JSON.stringify(validation) !== JSON.stringify(state.validation)) {
      dispatch({
        type: ACTIONS.SET_VALIDATION,
        payload: validation
      });
    }
  }, [
    state.package,
    state.wings,
    state.sauces,
    state.dips,
    state.delivery
  ]);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    state,
    dispatch,
    actions: ACTIONS
  }), [state]);

  return (
    <CateringContext.Provider value={value}>
      {children}
    </CateringContext.Provider>
  );
}

/**
 * Custom hook to use the catering customization context
 */
export function useCateringCustomization() {
  const context = useContext(CateringContext);

  if (!context) {
    throw new Error(
      'useCateringCustomization must be used within CateringCustomizationProvider'
    );
  }

  return context;
}
