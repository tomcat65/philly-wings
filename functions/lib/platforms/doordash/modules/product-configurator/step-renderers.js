/**
 * Product Configurator - Step Renderers
 * Composable step rendering functions for different input types
 */

/**
 * Step renderer registry
 * Each renderer provides render() and validate() functions
 */
const STEP_RENDERERS = {
  /**
   * Single Choice Renderer
   * Used for: Prep method, wing style, dressing style
   */
  'single-choice': {
    render(stepConfig, currentSelections, productData) {
      const selectedId = currentSelections[stepConfig.id];

      return `
        <div class="step-single-choice">
          <h3 class="step-title">${stepConfig.label}</h3>
          ${stepConfig.description ? `<p class="step-description">${stepConfig.description}</p>` : ''}
          <div class="choice-grid">
            ${stepConfig.options.map(opt => `
              <button class="choice-card ${selectedId === opt.id ? 'selected' : ''}"
                      data-step="${stepConfig.id}"
                      data-option="${opt.id}"
                      onclick="window.productConfigurator.selectOption('${stepConfig.id}', '${opt.id}')">
                <div class="choice-icon">${opt.emoji || opt.label.charAt(0)}</div>
                <h4 class="choice-label">${opt.label}</h4>
                ${opt.description ? `<p class="choice-description">${opt.description}</p>` : ''}
                ${opt.price ? `<span class="choice-price">+$${opt.price.toFixed(2)}</span>` : ''}
              </button>
            `).join('')}
          </div>
        </div>
      `;
    },

    validate(stepConfig, selections) {
      if (stepConfig.required && !selections[stepConfig.id]) {
        return { valid: false, error: `Please select ${stepConfig.label.toLowerCase()}` };
      }
      return { valid: true };
    }
  },

  /**
   * Variant Selector Renderer
   * Used for: Wing sizes, salad sizes, portion selection
   */
  'variant-selector': {
    render(stepConfig, currentSelections, productData) {
      let variants = productData.variants || [];
      const selectedVariant = currentSelections.variant;

      // Filter variants based on dependencies (e.g., fried vs baked)
      if (stepConfig.dependsOn && currentSelections[stepConfig.dependsOn]) {
        const filterValue = currentSelections[stepConfig.dependsOn];
        variants = variants.filter(v => {
          // For plant-based wings: filter by prepMethod
          if (v.prepMethod) {
            return v.prepMethod === filterValue;
          }
          return true;
        });
      }

      // Filter out inactive variants
      variants = variants.filter(v => v.active !== false);

      if (variants.length === 0) {
        return `<p class="no-variants">No options available for your selection.</p>`;
      }

      return `
        <div class="step-variant-selector">
          <h3 class="step-title">${stepConfig.label}</h3>
          <div class="variant-grid">
            ${variants.map(v => `
              <button class="variant-card ${selectedVariant?.id === v.id ? 'selected' : ''}"
                      data-variant-id="${v.id}"
                      onclick='window.productConfigurator.selectVariant(${JSON.stringify(v).replace(/'/g, "&#39;")})'>
                <span class="variant-name">${v.name}</span>
                <span class="variant-price">$${(v.platformPrice || v.basePrice || 0).toFixed(2)}</span>
                ${v.description ? `<p class="variant-description">${v.description}</p>` : ''}
              </button>
            `).join('')}
          </div>
        </div>
      `;
    },

    validate(stepConfig, selections) {
      if (stepConfig.required && !selections.variant) {
        return { valid: false, error: 'Please select a size' };
      }
      return { valid: true };
    }
  },

  /**
   * Multi-Choice Renderer
   * Used for: Sauce selection with min/max limits
   */
  'multi-choice': {
    render(stepConfig, currentSelections, productData, globalData) {
      const selectedIds = currentSelections[stepConfig.id] || [];

      // Get options from global data (e.g., sauces)
      let options = [];
      if (stepConfig.dataSource === 'sauces' && globalData?.sauces) {
        options = globalData.sauces.filter(s =>
          s.category !== 'dipping-sauce' && s.active !== false
        );
      }

      const maxReached = selectedIds.length >= (stepConfig.maxSelections || 999);

      return `
        <div class="step-multi-choice">
          <h3 class="step-title">${stepConfig.label}</h3>
          ${stepConfig.description ? `<p class="step-description">${stepConfig.description}</p>` : ''}
          <div class="selection-counter">
            <span class="counter-current">${selectedIds.length}</span> /
            <span class="counter-max">${stepConfig.maxSelections || '∞'}</span> selected
            ${stepConfig.minSelections ? `<span class="counter-min">(Min: ${stepConfig.minSelections})</span>` : ''}
          </div>
          <div class="multi-choice-grid">
            ${options.map(opt => {
              const isSelected = selectedIds.includes(opt.id);
              const isDisabled = !isSelected && maxReached;

              return `
                <button class="multi-choice-card ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}"
                        data-option-id="${opt.id}"
                        ${isDisabled ? 'disabled' : ''}
                        onclick="window.productConfigurator.toggleMultiChoice('${stepConfig.id}', '${opt.id}')">
                  ${opt.imageUrl ? `<img src="${opt.imageUrl}" alt="${opt.name}" class="option-image">` : ''}
                  <h4 class="option-name">${opt.name}</h4>
                  ${opt.heatLevel ? `<div class="heat-meter">${'🔥'.repeat(opt.heatLevel)}</div>` : ''}
                  ${opt.description ? `<p class="option-description">${opt.description}</p>` : ''}
                  ${isSelected ? '<span class="check-mark">✓</span>' : ''}
                </button>
              `;
            }).join('')}
          </div>
        </div>
      `;
    },

    validate(stepConfig, selections) {
      const selectedIds = selections[stepConfig.id] || [];

      if (stepConfig.required && selectedIds.length < (stepConfig.minSelections || 1)) {
        return {
          valid: false,
          error: `Please select at least ${stepConfig.minSelections || 1} option(s)`
        };
      }

      if (stepConfig.maxSelections && selectedIds.length > stepConfig.maxSelections) {
        return {
          valid: false,
          error: `Maximum ${stepConfig.maxSelections} selections allowed`
        };
      }

      return { valid: true };
    }
  },

  /**
   * Review/Summary Renderer
   * Shows complete order summary with pricing
   */
  'review': {
    render(stepConfig, currentSelections, productData, globalData, priceBreakdown) {
      const config = window.productConfigurator?.config;
      const flow = config?.customizationFlow || [];

      // Build summary items
      const summaryItems = [];

      flow.forEach(step => {
        if (step.type === 'review') return; // Skip summary step itself

        const selection = currentSelections[step.id];
        if (!selection) return;

        let displayText = '';

        switch (step.type) {
          case 'single-choice':
            const option = step.options?.find(o => o.id === selection);
            displayText = option ? option.label : selection;
            break;

          case 'variant-selector':
            displayText = currentSelections.variant?.name || 'Unknown variant';
            break;

          case 'multi-choice':
            const selectedIds = selection;
            const options = globalData?.sauces?.filter(s => selectedIds.includes(s.id)) || [];
            displayText = options.map(o => o.name).join(', ');
            break;

          case 'optional-addons':
            const addonIds = Object.keys(selection);
            displayText = addonIds.length > 0 ? `${addonIds.length} addon(s)` : 'None';
            break;
        }

        if (displayText) {
          summaryItems.push(`
            <div class="summary-item">
              <span class="summary-label">${step.label}:</span>
              <span class="summary-value">${displayText}</span>
              ${stepConfig.allowEdit ? `
                <button class="edit-step-btn" onclick="window.productConfigurator.editStep('${step.id}')">
                  Edit
                </button>
              ` : ''}
            </div>
          `);
        }
      });

      return `
        <div class="step-review">
          <h3 class="step-title">${stepConfig.label}</h3>
          <div class="summary-items">
            ${summaryItems.join('')}
          </div>

          ${stepConfig.showPriceBreakdown && priceBreakdown ? `
            <div class="price-breakdown">
              <div class="price-row">
                <span class="price-label">Base Price:</span>
                <span class="price-value">$${priceBreakdown.base.toFixed(2)}</span>
              </div>
              ${priceBreakdown.addons.map(addon => `
                <div class="price-row addon">
                  <span class="price-label">${addon.name}:</span>
                  <span class="price-value">+$${addon.price.toFixed(2)}</span>
                </div>
              `).join('')}
              <div class="price-row total">
                <span class="price-label">Total:</span>
                <span class="price-value">$${priceBreakdown.total.toFixed(2)}</span>
              </div>
            </div>
          ` : ''}
        </div>
      `;
    },

    validate(stepConfig, selections) {
      // Summary step is always valid
      return { valid: true };
    }
  }
};

module.exports = {
  STEP_RENDERERS
};
