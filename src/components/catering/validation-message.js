/**
 * ValidationMessage Component
 * Displays error, warning, and info messages for wing customization
 * SHARD-2: Wing Customization Interface
 */

export class ValidationMessage {
  constructor(config) {
    this.type = config.type || 'info'; // 'error' | 'warning' | 'info' | 'success'
    this.message = config.message || '';
    this.details = config.details || null;
    this.dismissible = config.dismissible !== false;
    this.onDismiss = config.onDismiss || null;
  }

  /**
   * Get icon based on message type
   */
  getIcon() {
    const icons = {
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️',
      success: '✅'
    };
    return icons[this.type] || icons.info;
  }

  /**
   * Get accessible role for screen readers
   */
  getRole() {
    return this.type === 'error' ? 'alert' : 'status';
  }

  /**
   * Render the validation message
   */
  render() {
    if (!this.message) {
      return '';
    }

    return `
      <div class="validation-message ${this.type}" role="${this.getRole()}" aria-live="polite">
        <div class="validation-content">
          <span class="validation-icon" aria-hidden="true">${this.getIcon()}</span>
          <div class="validation-text">
            <p class="validation-main">${this.message}</p>
            ${this.details ? `<p class="validation-details">${this.details}</p>` : ''}
          </div>
        </div>
        ${this.dismissible ? `
          <button
            class="validation-dismiss"
            data-action="dismiss"
            aria-label="Dismiss message"
          >
            ×
          </button>
        ` : ''}
      </div>
    `;
  }

  /**
   * Attach event listeners
   */
  attachEventListeners(element) {
    if (this.dismissible) {
      const dismissBtn = element.querySelector('[data-action="dismiss"]');
      if (dismissBtn) {
        dismissBtn.addEventListener('click', () => {
          element.remove();
          if (this.onDismiss) {
            this.onDismiss();
          }
        });
      }
    }
  }

  /**
   * Update message and re-render
   */
  update(newConfig) {
    Object.assign(this, newConfig);
    return this.render();
  }
}

/**
 * Validation message factory functions for common scenarios
 */
export const ValidationMessages = {
  /**
   * Total wing count doesn't match package requirement
   */
  totalMismatch(current, required) {
    const diff = required - current;
    return new ValidationMessage({
      type: 'error',
      message: `Total wings must equal ${required}`,
      details: diff > 0
        ? `You need ${diff} more wing${diff !== 1 ? 's' : ''}`
        : `You have ${Math.abs(diff)} too many wing${Math.abs(diff) !== 1 ? 's' : ''}`,
      dismissible: false
    });
  },

  /**
   * Close to maximum for a wing type
   */
  approachingMax(wingType, current, max) {
    const remaining = max - current;
    if (remaining <= 10 && remaining > 0) {
      return new ValidationMessage({
        type: 'warning',
        message: `Only ${remaining} more ${wingType} wings available`,
        dismissible: true
      });
    }
    return null;
  },

  /**
   * Plant-based prep method required
   */
  prepMethodRequired() {
    return new ValidationMessage({
      type: 'error',
      message: 'Please select a preparation method for plant-based wings',
      dismissible: false
    });
  },

  /**
   * Bone-in style required
   */
  drumStyleRequired() {
    return new ValidationMessage({
      type: 'error',
      message: 'Please select a wing style for bone-in wings',
      dismissible: false
    });
  },

  /**
   * Success message when validation passes
   */
  validSelection() {
    return new ValidationMessage({
      type: 'success',
      message: 'Wing selection complete!',
      dismissible: true
    });
  },

  /**
   * Info tip about presets
   */
  presetTip() {
    return new ValidationMessage({
      type: 'info',
      message: 'Try our preset combinations for quick selection',
      details: 'Choose from Balanced Mix, All Boneless, Traditional, or Plant-Based',
      dismissible: true
    });
  },

  /**
   * Auto-adjustment notification
   */
  autoAdjusted(adjustedTypes) {
    return new ValidationMessage({
      type: 'info',
      message: 'Wing quantities auto-adjusted',
      details: `Adjusted: ${adjustedTypes.join(', ')} to maintain total`,
      dismissible: true
    });
  },

  /**
   * Minimum quantity warning
   */
  minimumQuantity(wingType, minimum) {
    return new ValidationMessage({
      type: 'warning',
      message: `${wingType} wings should be at least ${minimum} for best variety`,
      dismissible: true
    });
  }
};
