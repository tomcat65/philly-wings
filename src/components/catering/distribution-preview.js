/**
 * DistributionPreview Component
 * Visual representation of wing distribution breakdown
 * SHARD-2: Wing Customization Interface
 */

export class DistributionPreview {
  constructor(config) {
    this.distribution = config.distribution || {
      plantBased: 0,
      boneless: 0,
      boneIn: 0
    };
    this.totalRequired = config.totalRequired;
    this.showValidation = config.showValidation !== false;
  }

  /**
   * Calculate current total
   */
  getCurrentTotal() {
    return this.distribution.plantBased +
           this.distribution.boneless +
           this.distribution.boneIn;
  }

  /**
   * Calculate percentage for each wing type
   */
  getPercentages() {
    const current = this.getCurrentTotal();
    if (current === 0) {
      return { plantBased: 0, boneless: 0, boneIn: 0 };
    }

    return {
      plantBased: Math.round((this.distribution.plantBased / current) * 100),
      boneless: Math.round((this.distribution.boneless / current) * 100),
      boneIn: Math.round((this.distribution.boneIn / current) * 100)
    };
  }

  /**
   * Check if distribution is valid
   */
  isValid() {
    return this.getCurrentTotal() === this.totalRequired;
  }

  /**
   * Get validation status icon and message
   */
  getValidationStatus() {
    const current = this.getCurrentTotal();
    const required = this.totalRequired;

    if (current === required) {
      return {
        icon: '✅',
        message: 'Perfect!',
        class: 'valid'
      };
    } else if (current < required) {
      return {
        icon: '⚠️',
        message: `${required - current} more needed`,
        class: 'warning'
      };
    } else {
      return {
        icon: '❌',
        message: `${current - required} too many`,
        class: 'error'
      };
    }
  }

  /**
   * Render individual segment
   */
  renderSegment(type, percentage, quantity, label, color) {
    if (quantity === 0) {
      return '';
    }

    return `
      <div
        class="preview-segment segment-${type}"
        style="width: ${percentage}%; background-color: ${color};"
        data-type="${type}"
        title="${label}: ${quantity} wings (${percentage}%)"
      >
        <span class="segment-label">${percentage}%</span>
      </div>
    `;
  }

  /**
   * Render the preview bar
   */
  render() {
    const percentages = this.getPercentages();
    const current = this.getCurrentTotal();
    const validation = this.getValidationStatus();

    // Wing type configurations
    const wingTypes = [
      {
        type: 'plant-based',
        label: '🌱 Plant-Based',
        color: '#4caf50',
        percentage: percentages.plantBased,
        quantity: this.distribution.plantBased
      },
      {
        type: 'boneless',
        label: '🍗 Boneless',
        color: '#ff9800',
        percentage: percentages.boneless,
        quantity: this.distribution.boneless
      },
      {
        type: 'bone-in',
        label: '🦴 Bone-In',
        color: '#795548',
        percentage: percentages.boneIn,
        quantity: this.distribution.boneIn
      }
    ];

    return `
      <div class="distribution-preview ${validation.class}">
        <div class="preview-header">
          <h3 class="preview-title">Wing Distribution</h3>
          <div class="preview-total">
            <span class="total-current">${current}</span>
            <span class="total-separator">/</span>
            <span class="total-required">${this.totalRequired}</span>
            <span class="total-label">wings</span>
          </div>
        </div>

        <div class="preview-bar-container">
          <div class="preview-bar" role="progressbar" aria-valuenow="${current}" aria-valuemax="${this.totalRequired}">
            ${wingTypes.map(wt => this.renderSegment(
              wt.type,
              wt.percentage,
              wt.quantity,
              wt.label,
              wt.color
            )).join('')}
          </div>
        </div>

        <div class="preview-legend">
          ${wingTypes.map(wt => wt.quantity > 0 ? `
            <div class="legend-item">
              <span class="legend-color" style="background-color: ${wt.color};"></span>
              <span class="legend-label">${wt.label}</span>
              <span class="legend-value">${wt.quantity} (${wt.percentage}%)</span>
            </div>
          ` : '').join('')}
        </div>

        ${this.showValidation ? `
          <div class="preview-validation ${validation.class}">
            <span class="validation-icon" aria-hidden="true">${validation.icon}</span>
            <span class="validation-message">${validation.message}</span>
          </div>
        ` : ''}
      </div>
    `;
  }

  /**
   * Update distribution and re-render
   */
  update(newConfig) {
    Object.assign(this, newConfig);
    return this.render();
  }

  /**
   * Get summary for analytics
   */
  getSummary() {
    return {
      distribution: { ...this.distribution },
      percentages: this.getPercentages(),
      total: this.getCurrentTotal(),
      required: this.totalRequired,
      isValid: this.isValid()
    };
  }
}
