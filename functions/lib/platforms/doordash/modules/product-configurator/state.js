/**
 * Product Configurator - State Management
 * Centralized state machine for product customization flow
 */

/**
 * ProductConfiguratorState class
 * Manages all state for a product customization session
 */
class ProductConfiguratorState {
  constructor(productConfig, productData, globalData = {}) {
    this.productConfig = productConfig;
    this.productData = productData;
    this.globalData = globalData; // sauces, dips, etc.
    this.currentStepIndex = 0;
    this.selections = {};
    this.priceBreakdown = { base: 0, addons: [], total: 0 };
  }

  /**
   * Get current step configuration
   */
  get currentStep() {
    return this.productConfig.customizationFlow[this.currentStepIndex];
  }

  /**
   * Get current step ID
   */
  get currentStepId() {
    return this.currentStep?.id;
  }

  /**
   * Get total number of steps
   */
  get totalSteps() {
    return this.productConfig.customizationFlow.length;
  }

  /**
   * Check if current step should be skipped based on skipIf condition
   */
  shouldSkipCurrentStep() {
    const step = this.currentStep;
    if (!step || !step.skipIf) return false;

    // Example: skipIf: { includedDips: 'no-dip' }
    const [checkKey, checkValue] = Object.entries(step.skipIf)[0];
    return this.selections[checkKey] === checkValue;
  }

  /**
   * Check if can navigate to next step (validation)
   */
  canNavigateNext() {
    if (!this.currentStep) return false;

    // Get step renderer
    const STEP_RENDERERS = require('./step-renderers').STEP_RENDERERS;
    const renderer = STEP_RENDERERS[this.currentStep.type];

    if (!renderer) {
      console.warn(`No renderer found for step type: ${this.currentStep.type}`);
      return true; // Allow navigation if no renderer
    }

    const validation = renderer.validate(this.currentStep, this.selections);
    return validation.valid;
  }

  /**
   * Get validation error for current step
   */
  getValidationError() {
    const STEP_RENDERERS = require('./step-renderers').STEP_RENDERERS;
    const renderer = STEP_RENDERERS[this.currentStep.type];

    if (!renderer) return null;

    const validation = renderer.validate(this.currentStep, this.selections);
    return validation.error || null;
  }

  /**
   * Navigate to next step
   */
  navigateNext() {
    if (!this.canNavigateNext()) {
      return false;
    }

    let nextIndex = this.currentStepIndex + 1;

    // Skip steps based on skipIf conditions
    while (nextIndex < this.totalSteps) {
      this.currentStepIndex = nextIndex;
      if (!this.shouldSkipCurrentStep()) {
        break;
      }
      nextIndex++;
    }

    this.recalculatePrice();
    return true;
  }

  /**
   * Navigate to previous step
   */
  navigateBack() {
    if (this.currentStepIndex <= 0) {
      return false;
    }

    let prevIndex = this.currentStepIndex - 1;

    // Skip steps backward based on skipIf conditions
    while (prevIndex >= 0) {
      this.currentStepIndex = prevIndex;
      if (!this.shouldSkipCurrentStep()) {
        break;
      }
      prevIndex--;
    }

    return true;
  }

  /**
   * Jump to specific step (for editing)
   */
  jumpToStep(stepId) {
    const index = this.productConfig.customizationFlow.findIndex(s => s.id === stepId);
    if (index >= 0) {
      this.currentStepIndex = index;
      return true;
    }
    return false;
  }

  /**
   * Check if on first step
   */
  isFirstStep() {
    return this.currentStepIndex === 0;
  }

  /**
   * Check if on last step
   */
  isLastStep() {
    return this.currentStepIndex === this.totalSteps - 1;
  }

  /**
   * Set selection for a step
   */
  setSelection(stepId, value) {
    this.selections[stepId] = value;
    this.recalculatePrice();
  }

  /**
   * Set variant selection (special case)
   */
  setVariant(variant) {
    this.selections.variant = variant;
    this.recalculatePrice();
  }

  /**
   * Toggle multi-choice selection
   */
  toggleMultiChoice(stepId, optionId) {
    if (!this.selections[stepId]) {
      this.selections[stepId] = [];
    }

    const index = this.selections[stepId].indexOf(optionId);
    if (index >= 0) {
      // Remove if already selected
      this.selections[stepId].splice(index, 1);
    } else {
      // Add if not selected
      this.selections[stepId].push(optionId);
    }

    this.recalculatePrice();
  }

  /**
   * Recalculate price based on current selections
   */
  recalculatePrice() {
    const { PRICING_STRATEGIES } = require('./pricing-strategies');
    const strategy = PRICING_STRATEGIES[this.productConfig.productType];

    if (strategy) {
      this.priceBreakdown = strategy.calculate(
        this.selections,
        this.productData,
        this.productConfig
      );
    } else {
      console.warn(`No pricing strategy for: ${this.productConfig.productType}`);
      this.priceBreakdown = { base: 0, addons: [], total: 0 };
    }
  }

  /**
   * Convert state to order item for cart
   */
  toOrderItem() {
    return {
      productId: this.productData.id,
      productName: this.productConfig.displayName,
      category: this.productConfig.category,
      selections: { ...this.selections },
      pricing: { ...this.priceBreakdown },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Serialize state for storage/debugging
   */
  serialize() {
    return {
      productConfig: this.productConfig,
      productData: this.productData,
      currentStepIndex: this.currentStepIndex,
      selections: this.selections,
      priceBreakdown: this.priceBreakdown
    };
  }

  /**
   * Deserialize state from stored data
   */
  static deserialize(data, globalData) {
    const state = new ProductConfiguratorState(
      data.productConfig,
      data.productData,
      globalData
    );
    state.currentStepIndex = data.currentStepIndex;
    state.selections = data.selections;
    state.priceBreakdown = data.priceBreakdown;
    return state;
  }
}

module.exports = {
  ProductConfiguratorState
};
