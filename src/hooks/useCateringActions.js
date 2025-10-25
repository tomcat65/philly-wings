/**
 * Catering Actions Hook
 * Provides convenient action methods for state mutations
 */

import { useCateringCustomization, ACTIONS } from '../context/CateringCustomizationContext.js';

export function useCateringActions() {
  const { state, dispatch } = useCateringCustomization();

  return {
    /**
     * Select a catering package and initialize state
     */
    selectPackage: (packageData) => {
      dispatch({ type: ACTIONS.SELECT_PACKAGE, payload: packageData });
    },

    /**
     * Update wing quantities and options
     */
    updateWings: (wingUpdate) => {
      dispatch({ type: ACTIONS.UPDATE_WINGS, payload: wingUpdate });
    },

    /**
     * Toggle a sauce selection on/off
     */
    toggleSauce: (sauceId) => {
      const { selected, max } = state.sauces;

      if (selected.includes(sauceId)) {
        // Remove sauce
        dispatch({
          type: ACTIONS.SELECT_SAUCE,
          payload: selected.filter(id => id !== sauceId)
        });
      } else if (selected.length < max) {
        // Add sauce
        dispatch({
          type: ACTIONS.SELECT_SAUCE,
          payload: [...selected, sauceId]
        });
      }
    },

    /**
     * Set all sauce selections at once
     */
    setSauces: (sauceIds) => {
      dispatch({ type: ACTIONS.SELECT_SAUCE, payload: sauceIds });
    },

    /**
     * Update dip selections
     */
    updateDips: (dips) => {
      dispatch({ type: ACTIONS.UPDATE_DIPS, payload: dips });
    },

    /**
     * Add or update a dip 5-pack selection
     */
    setDipQuantity: (dipId, fivePacks) => {
      const currentDips = state.dips || [];
      const existingIndex = currentDips.findIndex(d => d.dipId === dipId);

      let newDips;
      if (fivePacks === 0) {
        // Remove dip if quantity is 0
        newDips = currentDips.filter(d => d.dipId !== dipId);
      } else if (existingIndex >= 0) {
        // Update existing
        newDips = [...currentDips];
        newDips[existingIndex] = { dipId, fivePacks };
      } else {
        // Add new
        newDips = [...currentDips, { dipId, fivePacks }];
      }

      dispatch({ type: ACTIONS.UPDATE_DIPS, payload: newDips });
    },

    /**
     * Update sides selection
     */
    updateSides: (sidesUpdate) => {
      dispatch({ type: ACTIONS.UPDATE_SIDES, payload: sidesUpdate });
    },

    /**
     * Add a salad
     */
    addSalad: (saladId, quantity = 1, price = 0, isAddon = true) => {
      const newSalads = [
        ...(state.sides.salads || []),
        { saladId, quantity, price, isAddon }
      ];
      dispatch({
        type: ACTIONS.UPDATE_SIDES,
        payload: { salads: newSalads }
      });
    },

    /**
     * Remove a salad by index
     */
    removeSalad: (index) => {
      const newSalads = state.sides.salads.filter((_, i) => i !== index);
      dispatch({
        type: ACTIONS.UPDATE_SIDES,
        payload: { salads: newSalads }
      });
    },

    /**
     * Add a dessert 5-pack
     */
    addDessert: (dessertId, fivePacks = 1, price = 0) => {
      dispatch({
        type: ACTIONS.ADD_DESSERT,
        payload: { dessertId, fivePacks, price }
      });
    },

    /**
     * Remove a dessert by index
     */
    removeDessert: (index) => {
      dispatch({ type: ACTIONS.REMOVE_DESSERT, payload: index });
    },

    /**
     * Add a beverage
     */
    addBeverage: (beverageId, quantity = 1, price = 0, isAddon = false) => {
      dispatch({
        type: ACTIONS.ADD_BEVERAGE,
        payload: { beverageId, quantity, price, isAddon }
      });
    },

    /**
     * Remove a beverage by index
     */
    removeBeverage: (index) => {
      dispatch({ type: ACTIONS.REMOVE_BEVERAGE, payload: index });
    },

    /**
     * Add a quick-add item
     */
    addQuickAdd: (itemId, quantity = 1, price = 0, type = 'misc') => {
      dispatch({
        type: ACTIONS.ADD_QUICK_ADD,
        payload: { itemId, quantity, price, type }
      });
    },

    /**
     * Remove a quick-add by index
     */
    removeQuickAdd: (index) => {
      dispatch({ type: ACTIONS.REMOVE_QUICK_ADD, payload: index });
    },

    /**
     * Update delivery information
     */
    updateDelivery: (deliveryUpdate) => {
      dispatch({ type: ACTIONS.UPDATE_DELIVERY, payload: deliveryUpdate });
    },

    /**
     * Set delivery date
     */
    setDeliveryDate: (date) => {
      dispatch({
        type: ACTIONS.UPDATE_DELIVERY,
        payload: { date }
      });
    },

    /**
     * Set delivery time window
     */
    setDeliveryTime: (timeWindow) => {
      dispatch({
        type: ACTIONS.UPDATE_DELIVERY,
        payload: { timeWindow }
      });
    },

    /**
     * Set delivery address
     */
    setDeliveryAddress: (address) => {
      dispatch({
        type: ACTIONS.UPDATE_DELIVERY,
        payload: { address }
      });
    },

    /**
     * Set special instructions
     */
    setSpecialInstructions: (instructions) => {
      dispatch({
        type: ACTIONS.UPDATE_DELIVERY,
        payload: { specialInstructions: instructions }
      });
    },

    /**
     * Navigate to a specific step
     */
    goToStep: (step) => {
      dispatch({ type: ACTIONS.SET_CURRENT_STEP, payload: step });
    },

    /**
     * Go to next step
     */
    nextStep: () => {
      dispatch({
        type: ACTIONS.SET_CURRENT_STEP,
        payload: state.ui.currentStep + 1
      });
    },

    /**
     * Go to previous step
     */
    previousStep: () => {
      dispatch({
        type: ACTIONS.SET_CURRENT_STEP,
        payload: Math.max(0, state.ui.currentStep - 1)
      });
    },

    /**
     * Reset entire customization state
     */
    resetCustomization: () => {
      dispatch({ type: ACTIONS.RESET_STATE });
    }
  };
}
