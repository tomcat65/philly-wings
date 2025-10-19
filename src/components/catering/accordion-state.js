/**
 * Accordion State Management for Catering Configurator
 * Implements progressive disclosure, accessibility, and state syncing.
 */

export class ConfiguratorAccordion {
  constructor(packageId) {
    this.packageId = packageId;
    this.sections = {};
    this.currentStep = 1;
    this.completedSteps = new Set();
    this.selections = {
      wingType: null,
      sauces: [],
      addOns: []
    };
  }

  /**
   * Initialize accordion behavior
   */
  init() {
    this.cacheSections();

    // Lock downstream steps until prerequisites are satisfied
    this.lockStep(2);
    this.lockStep(3);

    // Start with step 1 expanded
    this.expandStep(1);
    this.updateProgressIndicator(1, 'active');
    this.refreshMobileProgress();

    // Wire listeners
    this.setupWingTypeListeners();
    this.setupSauceListeners();
    this.setupAddOnListeners();
    this.setupEditListeners();
  }

  /**
   * Cache step elements for faster lookup
   */
  cacheSections() {
    const nodes = document.querySelectorAll(`.configurator-section[data-package="${this.packageId}"]`);
    nodes.forEach(node => {
      const step = Number(node.dataset.step);
      const summaryEl = node.querySelector('.step-summary-text');
      this.sections[step] = {
        element: node,
        summaryEl,
        defaultSummary: summaryEl?.dataset.defaultSummary || summaryEl?.textContent?.trim() || '',
        unlockedSummary: summaryEl?.dataset.unlockedSummary || null,
        optional: node.dataset.optional === 'true'
      };
    });
  }

  /**
   * Expand a step (unless locked)
   */
  expandStep(stepNumber) {
    const section = this.sections[stepNumber]?.element;
    if (!section || section.dataset.locked === 'true') return;

    section.classList.add('step-expanded');
    section.classList.remove('step-collapsed');
    section.setAttribute('aria-expanded', 'true');

    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      section.scrollIntoView({ behavior: 'auto', block: 'start' });
    } else {
      setTimeout(() => {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }

    const headingId = section.getAttribute('aria-labelledby');
    const heading = headingId ? document.getElementById(headingId) : null;
    if (heading) {
      heading.focus({ preventScroll: true });
    } else {
      section.setAttribute('tabindex', '-1');
      section.focus({ preventScroll: true });
    }

    this.currentStep = stepNumber;
    this.updateProgressIndicator(stepNumber, 'active');
    this.refreshMobileProgress();
  }

  /**
   * Collapse a step
   */
  collapseStep(stepNumber) {
    const section = this.sections[stepNumber]?.element;
    if (!section) return;

    section.classList.add('step-collapsed');
    section.classList.remove('step-expanded');
    section.setAttribute('aria-expanded', 'false');
  }

  /**
   * Lock a step (preventing expansion/editing)
   */
  lockStep(stepNumber) {
    const section = this.sections[stepNumber]?.element;
    if (!section) return;

    section.dataset.locked = 'true';
    section.classList.add('step-locked');

    const editBtn = section.querySelector('.step-edit-btn');
    if (editBtn) {
      editBtn.setAttribute('disabled', 'true');
      editBtn.setAttribute('aria-disabled', 'true');
    }

    const { unlockedSummary, defaultSummary, summaryEl } = this.sections[stepNumber];
    if (summaryEl) {
      summaryEl.textContent = defaultSummary || unlockedSummary || summaryEl.textContent;
    }
  }

  /**
   * Unlock a step so it can be edited
   */
  unlockStep(stepNumber) {
    const section = this.sections[stepNumber]?.element;
    if (!section) return;

    section.dataset.locked = 'false';
    section.classList.remove('step-locked');

    const editBtn = section.querySelector('.step-edit-btn');
    if (editBtn) {
      editBtn.removeAttribute('disabled');
      editBtn.setAttribute('aria-disabled', 'false');
    }

    const { unlockedSummary, summaryEl } = this.sections[stepNumber];
    if (summaryEl && unlockedSummary) {
      summaryEl.textContent = unlockedSummary;
    }
  }

  /**
   * Set summary text for a step
   */
  setSummaryText(stepNumber, text) {
    const summaryEl = this.sections[stepNumber]?.summaryEl;
    if (summaryEl) {
      summaryEl.textContent = text;
    }
  }

  /**
   * Complete a step and move forward
   */
  completeStep(stepNumber, summaryText) {
    const section = this.sections[stepNumber]?.element;
    if (!section) return;

    this.completedSteps.add(stepNumber);
    section.classList.add('step-complete');
    this.setSummaryText(stepNumber, summaryText);
    this.collapseStep(stepNumber);
    this.updateProgressIndicator(stepNumber, 'complete');

    const nextStep = stepNumber + 1;
    if (this.sections[nextStep]) {
      this.unlockStep(nextStep);
      this.expandStep(nextStep);
    } else {
      this.refreshMobileProgress();
    }
  }

  /**
   * Reset a step back to default state
   */
  resetStep(stepNumber, options = {}) {
    const { lock = false, keepExpanded = false } = options;
    const section = this.sections[stepNumber]?.element;
    if (!section) return;

    this.completedSteps.delete(stepNumber);
    section.classList.remove('step-complete');

    const { defaultSummary } = this.sections[stepNumber];
    if (defaultSummary) {
      this.setSummaryText(stepNumber, defaultSummary);
    }

    if (lock) {
      this.lockStep(stepNumber);
    } else {
      this.unlockStep(stepNumber);
    }

    if (!keepExpanded) {
      this.collapseStep(stepNumber);
    } else {
      this.expandStep(stepNumber);
    }

    const state = this.currentStep === stepNumber ? 'active' : 'pending';
    this.updateProgressIndicator(stepNumber, state);
  }

  /**
   * Update progress indicator state classes
   */
  updateProgressIndicator(stepNumber, state) {
    const indicator = document.getElementById(`progress-${this.packageId}`);
    if (!indicator) {
      this.refreshMobileProgress();
      return;
    }

    const stepNode = indicator.querySelector(`.progress-step[data-step="${stepNumber}"]`);
    if (!stepNode) return;

    stepNode.classList.remove('progress-step-active', 'progress-step-complete', 'progress-step-pending');
    if (state === 'complete') {
      stepNode.classList.add('progress-step-complete');
    } else if (state === 'active') {
      stepNode.classList.add('progress-step-active');
    } else {
      stepNode.classList.add('progress-step-pending');
    }

    this.refreshMobileProgress();
  }

  /**
   * Determine next actionable step for mobile progress
   */
  getActiveStepNumber() {
    if (!this.completedSteps.has(1)) return 1;
    if (!this.completedSteps.has(2)) return 2;
    if (!this.completedSteps.has(3)) return 3;
    return 3;
  }

  /**
   * Update the mobile-only progress summary
   */
  refreshMobileProgress() {
    const mobileIndicator = document.getElementById(`progress-summary-${this.packageId}`);
    if (!mobileIndicator) return;

    if (this.completedSteps.size === 3) {
      mobileIndicator.textContent = 'All steps complete';
      return;
    }

    const activeStep = this.getActiveStepNumber();
    mobileIndicator.textContent = `Step ${activeStep} of 3`;
  }

  /**
   * Setup wing type listeners
   */
  setupWingTypeListeners() {
    const inputs = document.querySelectorAll(`input[name="wing-type-${this.packageId}"]`);
    inputs.forEach(input => {
      input.addEventListener('change', event => {
        const wingType = event.target.value;
        const card = event.target.closest('.wing-type-card');
        const label = card?.querySelector('h5')?.textContent?.trim() || 'Wing selection';
        const totalWings = this.sections[1]?.element?.dataset.totalWings || '60';

        const summary = `${label} (${totalWings} pieces)`;
        const wasComplete = this.completedSteps.has(1);

        this.selections.wingType = wingType;

        if (wasComplete) {
          this.setSummaryText(1, summary);
        } else {
          this.completeStep(1, summary);
        }

        this.unlockStep(2);

        if (wasComplete) {
          this.resetStep(2, { lock: false, keepExpanded: true });
          this.resetStep(3, { lock: true, keepExpanded: false });
          this.completedSteps.delete(2);
          this.completedSteps.delete(3);

          if (window.selectedAddOns?.[this.packageId]?.length) {
            const toRemove = [...window.selectedAddOns[this.packageId]];
            toRemove.forEach(addOn => {
              window.setAddOnQuantity(addOn.id, addOn.packageTier, this.packageId, addOn.category, 0);
            });
          }

          this.expandStep(2);
        }
      });
    });
  }

  /**
   * Setup sauce selection listeners
   */
  setupSauceListeners() {
    const stepSection = this.sections[2]?.element;
    if (!stepSection) return;

    const max = Number(stepSection.dataset.maxSauces) || 3;

    const cards = stepSection.querySelectorAll('.sauce-card');
    cards.forEach(card => {
      const checkbox = card.querySelector('input[type="checkbox"]');
      if (!checkbox) return;

      checkbox.addEventListener('change', () => {
        const checkedCount = stepSection.querySelectorAll('.sauce-card input[type="checkbox"]:checked').length;
        if (checkbox.checked && checkedCount > max) {
          checkbox.checked = false;
          card.classList.remove('selected');
          return;
        }

        card.classList.toggle('selected', checkbox.checked);
      });

      card.addEventListener('click', event => {
        if (event.target.tagName === 'INPUT') return;
        checkbox.checked = !checkbox.checked;
        checkbox.dispatchEvent(new Event('change', { bubbles: true }));
      });
    });

    this.syncSauceSelections();
  }

  /**
   * Synchronize sauce selections with UI state
   */
  syncSauceSelections() {
    const stepSection = this.sections[2]?.element;
    if (!stepSection) return;

    const max = Number(stepSection.dataset.maxSauces) || 3;

    const selectedInputs = stepSection.querySelectorAll('.sauce-card input[type="checkbox"]:checked');
    this.selections.sauces = Array.from(selectedInputs).map(input => {
      const card = input.closest('.sauce-card');
      return {
        id: input.value,
        name: card?.querySelector('.sauce-name')?.textContent?.trim() || input.value
      };
    });

    this.updateSauceCounter();

    const totalSelected = this.selections.sauces.length;
    if (window.updateEncouragementMessage) {
      window.updateEncouragementMessage(this.packageId, max);
    }

    if (totalSelected === max) {
      const sauceNames = this.selections.sauces.map(s => s.name).join(', ');
      if (this.completedSteps.has(2)) {
        this.setSummaryText(2, `${max} Sauces: ${sauceNames}`);
        this.unlockStep(3);
        this.updateProgressIndicator(2, 'complete');
      } else {
        this.completeStep(2, `${max} Sauces: ${sauceNames}`);
      }
    } else {
      if (this.completedSteps.has(2) && totalSelected < max) {
        this.resetStep(2, { lock: false, keepExpanded: true });
        this.resetStep(3, { lock: true, keepExpanded: false });
        this.completedSteps.delete(2);
        this.completedSteps.delete(3);
        this.unlockStep(2);
        this.updateProgressIndicator(3, 'pending');
      }
    }
  }

  /**
   * Update sauce counter UI
   */
  updateSauceCounter() {
    const counterEl = document.getElementById(`sauce-count-${this.packageId}`);
    if (!counterEl) return;

    counterEl.textContent = this.selections.sauces.length;
    counterEl.style.transform = 'scale(1.2)';
    setTimeout(() => {
      counterEl.style.transform = 'scale(1)';
    }, 150);
  }

  /**
   * Setup add-on listeners
   */
  setupAddOnListeners() {
    this.handleAddOnSelectionChange();
  }

  /**
   * Handle add-on changes without completing the step
   */
  handleAddOnSelectionChange() {
    const selectedAddOns = window.selectedAddOns?.[this.packageId] || [];
    this.selections.addOns = selectedAddOns;

    if (this.completedSteps.has(3)) {
      const summary = this.buildAddOnSummary(selectedAddOns);
      this.setSummaryText(3, summary);
    }
  }

  /**
   * Finalize add-on step (either skip or continue)
   */
  commitAddOnsStep(skip = false) {
    if (!this.sections[3]) return;

    if (skip && window.selectedAddOns?.[this.packageId]?.length) {
      const toRemove = [...window.selectedAddOns[this.packageId]];
      toRemove.forEach(addOn => {
        window.setAddOnQuantity(addOn.id, addOn.packageTier, this.packageId, addOn.category, 0);
      });
    }

    const selectedAddOns = window.selectedAddOns?.[this.packageId] || [];
    this.selections.addOns = selectedAddOns;

    const summary = this.buildAddOnSummary(selectedAddOns, skip);
    if (this.completedSteps.has(3)) {
      this.setSummaryText(3, summary);
      this.collapseStep(3);
      this.updateProgressIndicator(3, 'complete');
      this.refreshMobileProgress();
      return;
    }

    this.completeStep(3, summary);
  }

  /**
   * Build summary text for add-on selections
   */
  buildAddOnSummary(addOns, skipped = false) {
    if (skipped || addOns.length === 0) {
      return 'No add-ons selected';
    }

    const expanded = addOns.map(addOn => {
      const qty = addOn.quantity || 0;
      return qty > 1 ? `${addOn.name} × ${qty}` : addOn.name;
    });

    const displayNames = expanded.slice(0, 2).join(', ');
    const overflow = expanded.length > 2 ? ` +${expanded.length - 2} more` : '';
    const totalQty = addOns.reduce((sum, addOn) => sum + (addOn.quantity || 0), 0);
    const label = totalQty === 1 ? 'Add-on' : 'Add-ons';
    return `${totalQty} ${label}: ${displayNames}${overflow}`;
  }

  /**
   * Setup edit button listeners
   */
  setupEditListeners() {
    const buttons = document.querySelectorAll(`.step-edit-btn[data-package="${this.packageId}"]`);
    buttons.forEach(button => {
      button.addEventListener('click', event => {
        event.preventDefault();
        const step = Number(button.dataset.step);
        if (button.hasAttribute('disabled')) return;
        this.expandStep(step);
      });
    });
  }

  /**
   * Expose current state (useful for analytics/debugging)
   */
  getState() {
    return {
      currentStep: this.currentStep,
      completedSteps: Array.from(this.completedSteps),
      selections: this.selections
    };
  }
}

// Global accordion instances
window.configuratorAccordions = window.configuratorAccordions || {};

/**
 * Initialize accordion for a specific package
 */
export function initAccordion(packageId) {
  if (!window.configuratorAccordions[packageId]) {
    window.configuratorAccordions[packageId] = new ConfiguratorAccordion(packageId);
    window.configuratorAccordions[packageId].init();
  }
  return window.configuratorAccordions[packageId];
}
