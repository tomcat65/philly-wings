/**
 * WingCustomization Component - SHARD-2
 * Main orchestrator for wing customization interface
 * Features: Auto-adjustment, presets, validation, context integration
 */

import { WingTypeCard } from './wing-type-card.js';
import { DistributionPreview } from './distribution-preview.js';
import { ValidationMessage, ValidationMessages } from './validation-message.js';

export class WingCustomization {
  constructor(config) {
    this.package = config.package;
    this.context = config.context; // CateringCustomizationContext
    this.onCustomizationChange = config.onCustomizationChange;
    this.container = config.container;

    // Initialize state
    this.state = {
      distribution: {
        plantBased: 0,
        boneless: this.package.wingOptions.totalWings,
        boneIn: 0
      },
      prepMethod: null, // 'baked' | 'fried' | 'split'
      drumStyle: 'mixed', // 'mixed' | 'flats' | 'drums'
      validationMessages: [],
      startTime: Date.now()
    };

    this.components = {
      cards: {},
      preview: null,
      messages: []
    };

    this.init();
  }

  /**
   * Initialize component
   */
  init() {
    this.loadStateFromContext();
    this.render();
    this.attachEventListeners();
    this.logAnalytics('wing_customization_started');
  }

  /**
   * Load existing state from context if available
   */
  loadStateFromContext() {
    if (this.context && this.context.state.wingDistribution) {
      const saved = this.context.state.wingDistribution;
      this.state.distribution = { ...saved.distribution };
      this.state.prepMethod = saved.prepMethod || null;
      this.state.drumStyle = saved.drumStyle || 'mixed';
    }
  }

  /**
   * Preset configurations
   */
  get presets() {
    const total = this.package.wingOptions.totalWings;

    return {
      balancedMix: {
        name: 'Balanced Mix',
        description: 'Perfect variety',
        icon: '🔄',
        distribution: {
          plantBased: 0,
          boneless: Math.floor(total * 0.75),
          boneIn: Math.ceil(total * 0.25)
        }
      },
      allBoneless: {
        name: 'All Boneless',
        description: 'Easy to eat',
        icon: '🍗',
        distribution: {
          plantBased: 0,
          boneless: total,
          boneIn: 0
        }
      },
      traditional: {
        name: 'Traditional',
        description: '50/50 split',
        icon: '⚖️',
        distribution: {
          plantBased: 0,
          boneless: Math.floor(total * 0.5),
          boneIn: Math.ceil(total * 0.5)
        }
      },
      plantBased: {
        name: 'Plant-Based',
        description: '100% plant-based',
        icon: '🌱',
        distribution: {
          plantBased: total,
          boneless: 0,
          boneIn: 0
        }
      }
    };
  }

  /**
   * Auto-adjustment algorithm
   * Maintains total wing count when user changes a quantity
   */
  autoAdjustDistribution(changedType, newQuantity) {
    const total = this.package.wingOptions.totalWings;
    const remaining = total - newQuantity;
    const types = ['plantBased', 'boneless', 'boneIn'];
    const otherTypes = types.filter(t => t !== changedType);

    // Create new distribution
    const newDistribution = { [changedType]: newQuantity };

    // If user set one type to total, zero out others
    if (remaining === 0) {
      otherTypes.forEach(type => {
        newDistribution[type] = 0;
      });
      return newDistribution;
    }

    // Calculate current total of other types
    const currentOtherTotal = otherTypes.reduce(
      (sum, type) => sum + this.state.distribution[type],
      0
    );

    // Proportional distribution
    if (currentOtherTotal > 0) {
      let allocated = 0;

      otherTypes.forEach((type, index) => {
        if (index === otherTypes.length - 1) {
          // Last type gets remainder to ensure exact total
          newDistribution[type] = remaining - allocated;
        } else {
          const proportion = this.state.distribution[type] / currentOtherTotal;
          const amount = Math.round(proportion * remaining);
          newDistribution[type] = amount;
          allocated += amount;
        }
      });
    } else {
      // If other types are all zero, distribute evenly
      const perType = Math.floor(remaining / otherTypes.length);
      let allocated = 0;

      otherTypes.forEach((type, index) => {
        if (index === otherTypes.length - 1) {
          newDistribution[type] = remaining - allocated;
        } else {
          newDistribution[type] = perType;
          allocated += perType;
        }
      });
    }

    return newDistribution;
  }

  /**
   * Apply preset combination
   */
  applyPreset(presetKey) {
    const preset = this.presets[presetKey];
    if (!preset) return;

    this.state.distribution = { ...preset.distribution };

    // Reset conditional options
    if (this.state.distribution.plantBased === 0) {
      this.state.prepMethod = null;
    }
    if (this.state.distribution.boneIn === 0) {
      this.state.drumStyle = 'mixed';
    }

    this.logAnalytics('wing_preset_selected', {
      preset_name: presetKey,
      distribution: this.state.distribution
    });

    this.updateState();
  }

  /**
   * Handle quantity change for a wing type
   */
  handleQuantityChange(type, newQuantity) {
    const adjustedDistribution = this.autoAdjustDistribution(type, newQuantity);
    this.state.distribution = adjustedDistribution;

    // Reset conditional options if quantity becomes zero
    if (type === 'plantBased' && newQuantity === 0) {
      this.state.prepMethod = null;
    }
    if (type === 'boneIn' && newQuantity === 0) {
      this.state.drumStyle = 'mixed';
    }

    this.logAnalytics('wing_quantity_adjusted', {
      wing_type: type,
      new_quantity: newQuantity,
      adjustment_method: 'manual'
    });

    this.updateState();
  }

  /**
   * Handle prep method change (plant-based)
   */
  handlePrepMethodChange(method) {
    this.state.prepMethod = method;
    this.updateState();
  }

  /**
   * Handle drum style change (bone-in)
   */
  handleDrumStyleChange(style) {
    this.state.drumStyle = style;
    this.updateState();
  }

  /**
   * Validate current selection
   */
  validate() {
    const messages = [];
    const total = Object.values(this.state.distribution).reduce((a, b) => a + b, 0);
    const required = this.package.wingOptions.totalWings;

    // Total wing count validation
    if (total !== required) {
      messages.push(ValidationMessages.totalMismatch(total, required));
    }

    // Plant-based prep method validation
    if (this.state.distribution.plantBased > 0 && !this.state.prepMethod) {
      messages.push(ValidationMessages.prepMethodRequired());
    }

    // Bone-in style validation
    if (this.state.distribution.boneIn > 0 && !this.state.drumStyle) {
      messages.push(ValidationMessages.drumStyleRequired());
    }

    // Success message
    if (messages.length === 0) {
      messages.push(ValidationMessages.validSelection());
    }

    this.state.validationMessages = messages;
    return messages.length === 0 || messages.every(m => m.type !== 'error');
  }

  /**
   * Update state and re-render
   */
  updateState() {
    this.validate();
    this.render();

    // Update context
    if (this.context) {
      this.context.dispatch({
        type: 'SET_WING_DISTRIBUTION',
        payload: {
          distribution: { ...this.state.distribution },
          prepMethod: this.state.prepMethod,
          drumStyle: this.state.drumStyle
        }
      });
    }

    // Notify parent
    if (this.onCustomizationChange) {
      this.onCustomizationChange({
        distribution: { ...this.state.distribution },
        prepMethod: this.state.prepMethod,
        drumStyle: this.state.drumStyle,
        isValid: this.validate()
      });
    }
  }

  /**
   * Render component
   */
  render() {
    const total = this.package.wingOptions.totalWings;

    const html = `
      <div class="wing-customization-container">
        <div class="wing-customization-header">
          <h2>Customize Your Wings</h2>
          <p class="wing-customization-subtitle">Choose ${total} wings total</p>
        </div>

        ${this.renderPresetButtons()}
        ${this.renderDistributionPreview()}
        ${this.renderValidationMessages()}
        ${this.renderWingTypeCards()}
      </div>
    `;

    this.container.innerHTML = html;
    this.attachCardEventListeners();
  }

  /**
   * Render preset buttons
   */
  renderPresetButtons() {
    return `
      <div class="wing-preset-buttons">
        ${Object.entries(this.presets).map(([key, preset]) => `
          <button
            class="preset-button"
            data-preset="${key}"
          >
            <span class="preset-icon">${preset.icon}</span>
            <span>${preset.name}</span>
          </button>
        `).join('')}
      </div>
    `;
  }

  /**
   * Render distribution preview
   */
  renderDistributionPreview() {
    const preview = new DistributionPreview({
      distribution: this.state.distribution,
      totalRequired: this.package.wingOptions.totalWings,
      showValidation: true
    });

    return preview.render();
  }

  /**
   * Render validation messages
   */
  renderValidationMessages() {
    return this.state.validationMessages.map(msg => msg.render()).join('');
  }

  /**
   * Render wing type cards
   */
  renderWingTypeCards() {
    const wingTypes = [
      {
        type: 'plant-based',
        icon: '🌱',
        displayName: 'Plant-Based Wings',
        description: 'Delicious plant-based alternative'
      },
      {
        type: 'boneless',
        icon: '🍗',
        displayName: 'Boneless Wings',
        description: 'All white meat, easy to eat'
      },
      {
        type: 'bone-in',
        icon: '🦴',
        displayName: 'Bone-In Wings',
        description: 'Traditional, full of flavor'
      }
    ];

    return `
      <div class="wing-type-cards-grid">
        ${wingTypes.map(wt => {
          const card = new WingTypeCard({
            type: wt.type,
            quantity: this.state.distribution[this.getDistributionKey(wt.type)],
            maxQuantity: this.package.wingOptions.totalWings,
            icon: wt.icon,
            displayName: wt.displayName,
            description: wt.description,
            onChange: (qty) => this.handleQuantityChange(this.getDistributionKey(wt.type), qty),
            validationState: 'valid',
            prepMethod: wt.type === 'plant-based' ? this.state.prepMethod : undefined,
            onPrepChange: wt.type === 'plant-based' ? (m) => this.handlePrepMethodChange(m) : undefined,
            drumStyle: wt.type === 'bone-in' ? this.state.drumStyle : undefined,
            onStyleChange: wt.type === 'bone-in' ? (s) => this.handleDrumStyleChange(s) : undefined
          });

          return card.render();
        }).join('')}
      </div>
    `;
  }

  /**
   * Get distribution key from type (handles camelCase conversion)
   */
  getDistributionKey(type) {
    const keyMap = {
      'plant-based': 'plantBased',
      'boneless': 'boneless',
      'bone-in': 'boneIn'
    };
    return keyMap[type];
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Preset buttons
    this.container.addEventListener('click', (e) => {
      const presetBtn = e.target.closest('[data-preset]');
      if (presetBtn) {
        this.applyPreset(presetBtn.dataset.preset);
      }
    });
  }

  /**
   * Attach event listeners to wing type cards
   */
  attachCardEventListeners() {
    const cards = this.container.querySelectorAll('.wing-type-card');

    cards.forEach(cardElement => {
      const type = cardElement.dataset.type;
      const key = this.getDistributionKey(type);

      const card = new WingTypeCard({
        type: type,
        quantity: this.state.distribution[key],
        maxQuantity: this.package.wingOptions.totalWings,
        icon: '',
        displayName: '',
        description: '',
        onChange: (qty) => this.handleQuantityChange(key, qty),
        validationState: 'valid',
        prepMethod: type === 'plant-based' ? this.state.prepMethod : undefined,
        onPrepChange: type === 'plant-based' ? (m) => this.handlePrepMethodChange(m) : undefined,
        drumStyle: type === 'bone-in' ? this.state.drumStyle : undefined,
        onStyleChange: type === 'bone-in' ? (s) => this.handleDrumStyleChange(s) : undefined
      });

      card.attachEventListeners(cardElement);
    });
  }

  /**
   * Log analytics event
   */
  logAnalytics(eventName, data = {}) {
    console.log(`[Analytics] ${eventName}`, {
      package_id: this.package.id,
      total_wings: this.package.wingOptions.totalWings,
      ...data
    });

    // TODO: Integrate with Firebase Analytics when available
    // firebase.analytics().logEvent(eventName, data);
  }

  /**
   * Get completion summary
   */
  getSummary() {
    return {
      distribution: { ...this.state.distribution },
      prepMethod: this.state.prepMethod,
      drumStyle: this.state.drumStyle,
      isValid: this.validate(),
      timeSpentSeconds: Math.floor((Date.now() - this.state.startTime) / 1000)
    };
  }

  /**
   * Complete customization and log analytics
   */
  complete() {
    const summary = this.getSummary();

    this.logAnalytics('wing_customization_completed', {
      plant_based: summary.distribution.plantBased,
      boneless: summary.distribution.boneless,
      bone_in: summary.distribution.boneIn,
      prep_method: summary.prepMethod,
      bone_in_style: summary.drumStyle,
      time_spent_seconds: summary.timeSpentSeconds
    });

    return summary;
  }
}
