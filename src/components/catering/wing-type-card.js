/**
 * WingTypeCard Component
 * Individual wing type selector card for SHARD-2
 * Handles quantity selection, prep method (plant-based), and drum style (bone-in)
 */

export class WingTypeCard {
  constructor(config) {
    this.type = config.type; // 'plant-based' | 'boneless' | 'bone-in'
    this.quantity = config.quantity || 0;
    this.maxQuantity = config.maxQuantity;
    this.icon = config.icon;
    this.displayName = config.displayName;
    this.description = config.description;
    this.onChange = config.onChange;
    this.validationState = config.validationState || 'valid';

    // Conditional props
    this.prepMethod = config.prepMethod; // For plant-based only
    this.onPrepChange = config.onPrepChange;
    this.drumStyle = config.drumStyle; // For bone-in only
    this.onStyleChange = config.onStyleChange;
  }

  /**
   * Calculate percentage of total wings
   */
  getPercentage() {
    if (this.maxQuantity === 0) return 0;
    return Math.round((this.quantity / this.maxQuantity) * 100);
  }

  /**
   * Handle quantity increment
   */
  increment() {
    const newQuantity = Math.min(this.quantity + 1, this.maxQuantity);
    if (newQuantity !== this.quantity) {
      this.onChange(newQuantity);
    }
  }

  /**
   * Handle quantity decrement
   */
  decrement() {
    const newQuantity = Math.max(this.quantity - 1, 0);
    if (newQuantity !== this.quantity) {
      this.onChange(newQuantity);
    }
  }

  /**
   * Handle direct input change
   */
  handleDirectInput(value) {
    const numValue = parseInt(value, 10);

    if (isNaN(numValue)) {
      this.onChange(0);
      return;
    }

    const clampedValue = Math.max(0, Math.min(numValue, this.maxQuantity));
    this.onChange(clampedValue);
  }

  /**
   * Render prep method toggle (plant-based only)
   */
  renderPrepMethodToggle() {
    if (this.type !== 'plant-based' || this.quantity === 0) {
      return '';
    }

    const methods = [
      { value: 'baked', label: 'Baked', icon: '🔥' },
      { value: 'fried', label: 'Fried', icon: '🍳' },
      { value: 'split', label: 'Split 50/50', icon: '⚖️' }
    ];

    return `
      <div class="prep-method-toggle">
        <label class="toggle-label">Preparation Method:</label>
        <div class="toggle-options">
          ${methods.map(method => `
            <label class="radio-option ${this.prepMethod === method.value ? 'selected' : ''}">
              <input
                type="radio"
                name="prep-method-${this.type}"
                value="${method.value}"
                ${this.prepMethod === method.value ? 'checked' : ''}
                data-action="prep-change"
              />
              <span class="radio-icon">${method.icon}</span>
              <span class="radio-label">${method.label}</span>
            </label>
          `).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Render drum style selector (bone-in only)
   */
  renderDrumStyleSelector() {
    if (this.type !== 'bone-in' || this.quantity === 0) {
      return '';
    }

    const styles = [
      { value: 'mixed', label: 'Mixed', icon: '🔄' },
      { value: 'flats', label: 'All Flats', icon: '🪽' },
      { value: 'drums', label: 'All Drums', icon: '🍗' }
    ];

    return `
      <div class="drum-style-toggle">
        <label class="toggle-label">Wing Style:</label>
        <div class="toggle-options">
          ${styles.map(style => `
            <label class="radio-option ${this.drumStyle === style.value ? 'selected' : ''}">
              <input
                type="radio"
                name="drum-style-${this.type}"
                value="${style.value}"
                ${this.drumStyle === style.value ? 'checked' : ''}
                data-action="style-change"
              />
              <span class="radio-icon">${style.icon}</span>
              <span class="radio-label">${style.label}</span>
            </label>
          `).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Render the card HTML
   */
  render() {
    const percentage = this.getPercentage();
    const isActive = this.quantity > 0;

    return `
      <div class="wing-type-card ${this.validationState} ${isActive ? 'active' : ''}" data-type="${this.type}">
        <div class="card-header">
          <div class="card-icon">${this.icon}</div>
          <div class="card-title">
            <h3>${this.displayName}</h3>
            <p class="card-description">${this.description}</p>
          </div>
        </div>

        <div class="quantity-control">
          <button
            class="quantity-btn decrement"
            data-action="decrement"
            ${this.quantity === 0 ? 'disabled' : ''}
            aria-label="Decrease ${this.displayName} quantity"
          >
            −
          </button>

          <input
            type="number"
            class="quantity-input"
            value="${this.quantity}"
            min="0"
            max="${this.maxQuantity}"
            data-action="direct-input"
            aria-label="${this.displayName} quantity"
          />

          <button
            class="quantity-btn increment"
            data-action="increment"
            ${this.quantity >= this.maxQuantity ? 'disabled' : ''}
            aria-label="Increase ${this.displayName} quantity"
          >
            +
          </button>
        </div>

        <div class="percentage-display">
          <span class="percentage-value">${percentage}%</span>
          <span class="percentage-label">of total</span>
        </div>

        ${this.renderPrepMethodToggle()}
        ${this.renderDrumStyleSelector()}
      </div>
    `;
  }

  /**
   * Attach event listeners to rendered card
   */
  attachEventListeners(cardElement) {
    // Quantity buttons
    const decrementBtn = cardElement.querySelector('[data-action="decrement"]');
    const incrementBtn = cardElement.querySelector('[data-action="increment"]');
    const directInput = cardElement.querySelector('[data-action="direct-input"]');

    if (decrementBtn) {
      decrementBtn.addEventListener('click', () => this.decrement());
    }

    if (incrementBtn) {
      incrementBtn.addEventListener('click', () => this.increment());
    }

    if (directInput) {
      directInput.addEventListener('change', (e) => this.handleDirectInput(e.target.value));
      directInput.addEventListener('blur', (e) => this.handleDirectInput(e.target.value));
    }

    // Prep method radios (plant-based)
    const prepRadios = cardElement.querySelectorAll('[data-action="prep-change"]');
    prepRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        if (this.onPrepChange) {
          this.onPrepChange(e.target.value);
        }
      });
    });

    // Drum style radios (bone-in)
    const styleRadios = cardElement.querySelectorAll('[data-action="style-change"]');
    styleRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        if (this.onStyleChange) {
          this.onStyleChange(e.target.value);
        }
      });
    });
  }

  /**
   * Update card state and re-render
   */
  update(newConfig) {
    Object.assign(this, newConfig);
    return this.render();
  }
}
