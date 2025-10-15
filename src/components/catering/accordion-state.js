/**
 * Accordion State Management for Catering Configurator
 * Progressive disclosure pattern - only show what's needed
 */

export class ConfiguratorAccordion {
  constructor(packageId) {
    this.packageId = packageId;
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
    // Start with Step 1 expanded
    this.expandStep(1);
    this.collapseStep(2);
    this.collapseStep(3);

    // Set up event listeners
    this.setupWingTypeListeners();
    this.setupSauceListeners();
    this.setupEditListeners();
  }

  /**
   * Expand a step section
   */
  expandStep(stepNumber) {
    const section = document.querySelector(`[data-step="${stepNumber}"][data-package="${this.packageId}"]`);
    if (!section) return;

    section.classList.add('step-expanded');
    section.classList.remove('step-collapsed');
    section.setAttribute('aria-expanded', 'true');

    // Scroll into view smoothly
    setTimeout(() => {
      section.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);

    this.currentStep = stepNumber;
  }

  /**
   * Collapse a step section with summary
   */
  collapseStep(stepNumber) {
    const section = document.querySelector(`[data-step="${stepNumber}"][data-package="${this.packageId}"]`);
    if (!section) return;

    section.classList.add('step-collapsed');
    section.classList.remove('step-expanded');
    section.setAttribute('aria-expanded', 'false');
  }

  /**
   * Mark step as complete and show summary
   */
  completeStep(stepNumber, summaryText) {
    this.completedSteps.add(stepNumber);

    const section = document.querySelector(`[data-step="${stepNumber}"][data-package="${this.packageId}"]`);
    if (!section) return;

    // Update summary badge
    const summaryEl = section.querySelector('.step-summary-text');
    if (summaryEl) {
      summaryEl.textContent = summaryText;
    }

    // Add completion checkmark
    section.classList.add('step-complete');

    // Update progress indicator
    this.updateProgressIndicator(stepNumber, 'complete');

    // Collapse current step
    this.collapseStep(stepNumber);

    // Expand next step if available
    const nextStep = stepNumber + 1;
    if (nextStep <= 3) {
      setTimeout(() => {
        this.expandStep(nextStep);
        this.updateProgressIndicator(nextStep, 'active');
      }, 300); // Wait for collapse animation
    }
  }

  /**
   * Update progress indicator visual state
   */
  updateProgressIndicator(stepNumber, state) {
    const progressIndicator = document.getElementById(`progress-${this.packageId}`);
    if (!progressIndicator) return;

    const progressStep = progressIndicator.querySelector(`.progress-step[data-step="${stepNumber}"]`);
    if (!progressStep) return;

    // Remove all state classes
    progressStep.classList.remove('progress-step-active', 'progress-step-complete', 'progress-step-pending');

    // Add appropriate state class
    if (state === 'complete') {
      progressStep.classList.add('progress-step-complete');
    } else if (state === 'active') {
      progressStep.classList.add('progress-step-active');
    } else {
      progressStep.classList.add('progress-step-pending');
    }
  }

  /**
   * Setup wing type selection listeners
   */
  setupWingTypeListeners() {
    const wingInputs = document.querySelectorAll(`input[name="wing-type-${this.packageId}"]`);

    wingInputs.forEach(input => {
      input.addEventListener('change', (e) => {
        const wingType = e.target.value;
        this.selections.wingType = wingType;

        // Get the label text
        const label = e.target.closest('.wing-type-card').querySelector('h5').textContent;
        const totalWings = document.querySelector(`[data-package="${this.packageId}"]`)
          ?.dataset.totalWings || '60';

        // Complete Step 1
        this.completeStep(1, `${label} (${totalWings} pieces)`);
      });
    });
  }

  /**
   * Setup sauce selection listeners
   */
  setupSauceListeners() {
    // Track sauce selections
    const sauceCards = document.querySelectorAll(`.sauce-card[data-package="${this.packageId}"]`);
    const maxSauces = parseInt(document.querySelector(`#sauce-count-${this.packageId}`)
      ?.closest('.selection-counter')?.textContent.match(/\/(\d+)/)?.[1] || 3);

    sauceCards.forEach(card => {
      card.addEventListener('click', () => {
        const sauceId = card.dataset.sauceId;
        const sauceName = card.querySelector('.sauce-name')?.textContent;

        if (card.classList.contains('selected')) {
          // Deselect
          card.classList.remove('selected');
          this.selections.sauces = this.selections.sauces.filter(s => s.id !== sauceId);
        } else {
          // Select if under max
          if (this.selections.sauces.length < maxSauces) {
            card.classList.add('selected');
            this.selections.sauces.push({ id: sauceId, name: sauceName });
          }
        }

        // Update counter
        this.updateSauceCounter();

        // Check if step complete
        if (this.selections.sauces.length === maxSauces) {
          const sauceNames = this.selections.sauces.map(s => s.name).join(', ');
          this.completeStep(2, `${maxSauces} Sauces: ${sauceNames}`);
        }
      });
    });
  }

  /**
   * Update sauce selection counter
   */
  updateSauceCounter() {
    const counterEl = document.getElementById(`sauce-count-${this.packageId}`);
    if (counterEl) {
      const count = this.selections.sauces.length;
      counterEl.textContent = count;

      // Add animation
      counterEl.style.transform = 'scale(1.2)';
      setTimeout(() => {
        counterEl.style.transform = 'scale(1)';
      }, 150);
    }

    // Update encouragement message
    const maxSauces = parseInt(counterEl?.closest('.selection-counter')?.textContent.match(/\/(\d+)/)?.[1] || 3);
    if (window.updateEncouragementMessage) {
      window.updateEncouragementMessage(this.packageId, maxSauces);
    }
  }

  /**
   * Setup edit button listeners
   */
  setupEditListeners() {
    const editButtons = document.querySelectorAll(`.step-edit-btn[data-package="${this.packageId}"]`);

    editButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const stepNumber = parseInt(btn.dataset.step);
        this.expandStep(stepNumber);
      });
    });
  }

  /**
   * Get current state
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
 * Initialize accordion for a package
 */
export function initAccordion(packageId) {
  if (!window.configuratorAccordions[packageId]) {
    window.configuratorAccordions[packageId] = new ConfiguratorAccordion(packageId);
    window.configuratorAccordions[packageId].init();
  }
  return window.configuratorAccordions[packageId];
}
