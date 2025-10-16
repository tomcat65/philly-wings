/**
 * Product Configurator - Main Orchestrator
 * Unified product customization modal system
 */

const { PRODUCT_CONFIGS } = require('./product-configs');
const { STEP_RENDERERS } = require('./step-renderers');
const { ProductConfiguratorState } = require('./state');

/**
 * Generate Product Configurator JavaScript
 * This function returns JavaScript code that will be injected into the platform menu HTML
 */
function generateProductConfiguratorJS(menuData = {}) {
  // Serialize configs and renderers for client-side use
  const configsJSON = JSON.stringify(PRODUCT_CONFIGS);
  const saucesJSON = JSON.stringify(menuData.sauces || []);

  return `
    (function() {
      // ============================================================================
      // PRODUCT CONFIGURATOR - Unified Modal System
      // ============================================================================

      // Import configurations
      const PRODUCT_CONFIGS = ${configsJSON};
      const GLOBAL_DATA = {
        sauces: ${saucesJSON},
        dippingSauces: ${saucesJSON}.filter(s => s.category === 'dipping-sauce')
      };

      // Step Renderers (client-side implementations)
      const STEP_RENDERERS = {
        'single-choice': {
          render(stepConfig, currentSelections, productData) {
            const selectedId = currentSelections[stepConfig.id];
            return \`
              <div class="step-single-choice">
                <h3 class="step-title">\${stepConfig.label}</h3>
                \${stepConfig.description ? \`<p class="step-description">\${stepConfig.description}</p>\` : ''}
                <div class="choice-grid">
                  \${stepConfig.options.map(opt => \`
                    <button class="choice-card \${selectedId === opt.id ? 'selected' : ''}"
                            onclick="window.productConfigurator.selectOption('\${stepConfig.id}', '\${opt.id}')">
                      <div class="choice-icon">\${opt.emoji || opt.label.charAt(0)}</div>
                      <h4 class="choice-label">\${opt.label}</h4>
                      \${opt.description ? \`<p class="choice-description">\${opt.description}</p>\` : ''}
                    </button>
                  \`).join('')}
                </div>
              </div>
            \`;
          },
          validate(stepConfig, selections) {
            if (stepConfig.required && !selections[stepConfig.id]) {
              return { valid: false, error: \`Please select \${stepConfig.label.toLowerCase()}\` };
            }
            return { valid: true };
          }
        },

        'variant-selector': {
          render(stepConfig, currentSelections, productData) {
            let variants = productData.variants || [];
            const selectedVariant = currentSelections.variant;

            if (stepConfig.dependsOn && currentSelections[stepConfig.dependsOn]) {
              const filterValue = currentSelections[stepConfig.dependsOn];
              variants = variants.filter(v => v.prepMethod === filterValue);
            }

            variants = variants.filter(v => v.active !== false);

            return \`
              <div class="step-variant-selector">
                <h3 class="step-title">\${stepConfig.label}</h3>
                <div class="variant-grid">
                  \${variants.map(v => \`
                    <button class="variant-card \${selectedVariant?.id === v.id ? 'selected' : ''}"
                            data-variant='\${JSON.stringify(v).replace(/'/g, "&#39;")}'
                            onclick="window.productConfigurator.selectVariantFromData(this)">
                      <span class="variant-name">\${v.name}</span>
                      <span class="variant-price">$\${(v.platformPrice || v.basePrice || 0).toFixed(2)}</span>
                    </button>
                  \`).join('')}
                </div>
              </div>
            \`;
          },
          validate(stepConfig, selections) {
            if (stepConfig.required && !selections.variant) {
              return { valid: false, error: 'Please select a size' };
            }
            return { valid: true };
          }
        },

        'multi-choice': {
          render(stepConfig, currentSelections, productData, globalData) {
            const selectedIds = currentSelections[stepConfig.id] || [];
            const saucePrefs = currentSelections.saucePreferences || {};
            let options = [];
            let dryRubs = [];
            let wetSauces = [];

            if (stepConfig.dataSource === 'sauces' && globalData?.sauces) {
              const allSauces = globalData.sauces.filter(s => s.category !== 'dipping-sauce' && s.active !== false);
              dryRubs = allSauces.filter(s => s.category === 'dry-rub').sort((a, b) => (a.heatLevel || 1) - (b.heatLevel || 1));
              wetSauces = allSauces.filter(s => s.category === 'signature-sauce').sort((a, b) => (a.heatLevel || 1) - (b.heatLevel || 1));
            }

            const maxReached = selectedIds.length >= (stepConfig.maxSelections || 999);

            const renderSauceCard = (sauce, isDryRub) => {
              const isSelected = selectedIds.includes(sauce.id);
              const isDisabled = !isSelected && maxReached;
              const isOnSide = saucePrefs[sauce.id]?.onSide || false;
              const heatLevel = sauce.heatLevel || 1;
              const heatDisplay = heatLevel <= 1 ? 'Mild' : heatLevel <= 2 ? 'Medium' : heatLevel <= 3 ? 'Hot' : 'Extra Hot';
              const heatEmoji = heatLevel <= 1 ? '🚫🌶️' : '🌶️'.repeat(heatLevel);

              return \`
                <div class="sauce-card \${isSelected ? 'selected' : ''} \${isDisabled ? 'disabled' : ''}"
                     style="opacity: \${isDisabled ? '0.5' : '1'}; cursor: \${isDisabled ? 'not-allowed' : 'pointer'};"
                     onclick="window.productConfigurator.toggleMultiChoice('\${stepConfig.id}', '\${sauce.id}')">
                  <div class="sauce-card-header">
                    <div class="sauce-info">
                      <h4 class="sauce-name">\${sauce.name}</h4>
                      <p class="sauce-description">\${sauce.description || ''}</p>
                      <div class="heat-indicator">\${heatEmoji} \${heatDisplay}</div>
                    </div>
                    <div class="selection-indicator">
                      \${isSelected ? '<span class="check-mark">✓</span>' : ''}
                    </div>
                  </div>
                  \${!isDryRub && isSelected ? \`
                    <div class="sauce-on-side-toggle" onclick="event.stopPropagation();">
                      <label class="toggle-label">
                        <span>🥄 On the Side (1.5oz)</span>
                        <input type="checkbox" \${isOnSide ? 'checked' : ''}
                               onchange="window.productConfigurator.toggleSauceOnSide('\${sauce.id}', this.checked)" />
                        <span class="toggle-slider"></span>
                      </label>
                    </div>
                  \` : ''}
                </div>
              \`;
            };

            return \`
              <div class="step-multi-choice">
                <h3 class="step-title">\${stepConfig.label}</h3>
                \${stepConfig.description ? \`<p class="step-description">\${stepConfig.description}</p>\` : ''}
                <div class="selection-counter">
                  <span class="counter-current">\${selectedIds.length}</span> /
                  <span class="counter-max">\${stepConfig.maxSelections || '∞'}</span> selected
                </div>
                <div class="sauces-two-column-layout">
                  <div class="sauce-column">
                    <h4 class="sauce-column-title">🧄 Dry Rubs</h4>
                    <div class="sauce-cards">
                      \${dryRubs.map(s => renderSauceCard(s, true)).join('')}
                    </div>
                  </div>
                  <div class="sauce-column">
                    <h4 class="sauce-column-title">🌶️ Signature Sauces</h4>
                    <div class="sauce-cards">
                      \${wetSauces.map(s => renderSauceCard(s, false)).join('')}
                    </div>
                  </div>
                </div>
              </div>
            \`;
          },
          validate(stepConfig, selections) {
            const selectedIds = selections[stepConfig.id] || [];
            if (stepConfig.required && selectedIds.length < (stepConfig.minSelections || 1)) {
              return { valid: false, error: \`Please select at least \${stepConfig.minSelections || 1} sauce(s)\` };
            }
            return { valid: true };
          }
        },

        'included-dips': {
          render(stepConfig, currentSelections, productData, globalData) {
            const selectedDips = currentSelections[stepConfig.id] || {};
            const dippingSauces = globalData?.dippingSauces || [];
            const noDipSelected = currentSelections[stepConfig.id] === 'no-dip';

            // Calculate total quantity selected
            const totalSelected = noDipSelected ? 0 : Object.values(selectedDips).reduce((sum, qty) => sum + (qty || 0), 0);
            const maxSelections = stepConfig.maxSelections || 2;

            return \`
              <div class="step-included-dips">
                <h3 class="step-title">\${stepConfig.label}</h3>
                \${stepConfig.description ? \`<p class="step-description">\${stepConfig.description}</p>\` : ''}
                <div class="selection-counter">
                  <span class="counter-current">\${totalSelected}</span> /
                  <span class="counter-max">\${maxSelections}</span> selected
                </div>
                \${stepConfig.noDipOption ? \`
                  <button class="no-dip-option \${noDipSelected ? 'selected' : ''}"
                          onclick="window.productConfigurator.selectNoDip('\${stepConfig.id}')">
                    🚫 No Dipping Sauce
                  </button>
                \` : ''}
                <div class="dips-grid">
                  \${dippingSauces.map(dip => {
                    const currentQty = selectedDips[dip.id] || 0;
                    const canIncrease = totalSelected < maxSelections && !noDipSelected;
                    const canDecrease = currentQty > 0;
                    return \`
                      <div class="dip-card \${currentQty > 0 ? 'selected' : ''} \${noDipSelected ? 'disabled' : ''}">
                        \${dip.imageUrl ? \`<img src="\${dip.imageUrl}" alt="\${dip.name}" class="dip-image">\` : ''}
                        <h4 class="dip-name">\${dip.name}</h4>
                        <div class="quantity-controls">
                          <button class="qty-btn minus"
                                  \${!canDecrease ? 'disabled' : ''}
                                  onclick="window.productConfigurator.changeIncludedDipQuantity('\${stepConfig.id}', '\${dip.id}', -1)">−</button>
                          <span class="qty-display">\${currentQty}</span>
                          <button class="qty-btn plus"
                                  \${!canIncrease ? 'disabled' : ''}
                                  onclick="window.productConfigurator.changeIncludedDipQuantity('\${stepConfig.id}', '\${dip.id}', 1)">+</button>
                        </div>
                      </div>
                    \`;
                  }).join('')}
                </div>
              </div>
            \`;
          },
          validate(stepConfig, selections) {
            const selection = selections[stepConfig.id];
            if (selection === 'no-dip') return { valid: true };
            const selectedDips = selection || {};
            const totalQty = Object.values(selectedDips).reduce((sum, qty) => sum + (qty || 0), 0);
            if (stepConfig.required && totalQty === 0) {
              return { valid: false, error: 'Please select at least one dipping sauce or choose "No Dipping Sauce"' };
            }
            return { valid: true };
          }
        },

        'optional-addons': {
          render(stepConfig, currentSelections, productData, globalData) {
            const selectedAddons = currentSelections[stepConfig.id] || {};
            let options = [];

            // Handle different data sources
            if (stepConfig.dataSource === 'dippingSauces' && globalData?.dippingSauces) {
              options = globalData.dippingSauces;
            } else if (stepConfig.dataSource === 'sauces' && globalData?.sauces) {
              // Filter out dipping sauces and dry rubs, only show wet wing sauces
              options = globalData.sauces.filter(s =>
                s.category !== 'dipping-sauce' &&
                s.category !== 'dry-rub' &&
                s.active !== false
              );
            }

            const pricePerItem = stepConfig.pricePerItem || 0.99;

            return \`
              <div class="step-optional-addons">
                <h3 class="step-title">\${stepConfig.label}</h3>
                \${stepConfig.description ? \`<p class="step-description">\${stepConfig.description}</p>\` : ''}
                <div class="addons-grid">
                  \${options.map(addon => {
                    const quantity = selectedAddons[addon.id] || 0;
                    return \`
                      <div class="addon-card \${quantity > 0 ? 'selected' : ''}">
                        \${addon.imageUrl ? \`<img src="\${addon.imageUrl}" alt="\${addon.name}" class="addon-image">\` : ''}
                        <h4 class="addon-name">\${addon.name}</h4>
                        <p class="addon-price">$\${pricePerItem.toFixed(2)} each</p>
                        <div class="quantity-controls">
                          <button class="qty-btn" onclick="window.productConfigurator.changeAddonQuantity('\${stepConfig.id}', '\${addon.id}', -1)" \${quantity === 0 ? 'disabled' : ''}>−</button>
                          <span class="quantity">\${quantity}</span>
                          <button class="qty-btn" onclick="window.productConfigurator.changeAddonQuantity('\${stepConfig.id}', '\${addon.id}', 1)">+</button>
                        </div>
                      </div>
                    \`;
                  }).join('')}
                </div>
              </div>
            \`;
          },
          validate() { return { valid: true }; }
        },

        'review': {
          render(stepConfig, currentSelections, productData, globalData, priceBreakdown, config) {
            const flow = config.customizationFlow || [];
            const variant = currentSelections.variant;
            const variantName = variant?.name || productData?.name || 'Item';
            const basePrice = priceBreakdown?.base || 0;

            // Build detailed sections
            let sections = [];

            // Header: Product name and base price
            sections.push(\`
              <div class="review-header">
                <h4 class="review-product-name">\${variantName}</h4>
                <div class="review-base-price">Base Price: $\${basePrice.toFixed(2)}</div>
              </div>
            \`);

            // Sauces section (multi-choice with wing allocation and on-the-side preferences)
            const saucesStep = flow.find(s => s.id === 'sauces');
            const selectedSauces = currentSelections['sauces'] || [];
            const saucePreferences = currentSelections.saucePreferences || {};
            if (saucesStep && selectedSauces.length > 0) {
              const saucesList = globalData?.sauces || [];
              const wingCount = variant?.count || variant?.wingCount || 0;
              const wingsPerSauce = wingCount > 0 ? Math.floor(wingCount / selectedSauces.length) : 0;

              const sauceItems = selectedSauces.map(sauceId => {
                const sauce = saucesList.find(s => s.id === sauceId);
                const isOnSide = saucePreferences[sauceId]?.onSide || false;
                return sauce ? \`<li>\${wingsPerSauce} wings with \${sauce.name}\${isOnSide ? ' (on the side)' : ''}</li>\` : '';
              }).filter(Boolean).join('');

              sections.push(\`
                <div class="review-section">
                  <strong>Sauces (\${selectedSauces.length} included):</strong>
                  <ul class="review-list">\${sauceItems}</ul>
                  <div class="review-meta">Total Wings: \${wingCount}</div>
                </div>
              \`);
            }

            // Wing Style (for bone-in wings)
            const wingStyleStep = flow.find(s => s.id === 'wingStyle');
            if (wingStyleStep && currentSelections['wingStyle']) {
              const option = wingStyleStep.options?.find(o => o.id === currentSelections['wingStyle']);
              if (option) {
                const priceModifier = option.priceModifier || 0;
                sections.push(\`
                  <div class="review-section">
                    <strong>Wing Style:</strong> \${option.label} \${priceModifier > 0 ? \`+$\${priceModifier.toFixed(2)}\` : ''}
                  </div>
                \`);
              }
            }

            // Included Dips
            const includedDipsStep = flow.find(s => s.id === 'included-dips');
            const selectedIncludedDips = currentSelections['included-dips'];
            if (includedDipsStep && selectedIncludedDips && selectedIncludedDips !== 'no-dip') {
              const dipsList = globalData?.dippingSauces || [];
              const maxDips = includedDipsStep.maxSelections || 2;

              // selectedIncludedDips is now an object with quantities: {ranch: 2, blue_cheese: 1}
              const totalQty = Object.values(selectedIncludedDips).reduce((sum, qty) => sum + (qty || 0), 0);

              const dipItems = Object.entries(selectedIncludedDips).map(([dipId, qty]) => {
                if (qty <= 0) return '';
                const dip = dipsList.find(d => d.id === dipId);
                return dip ? \`<li>\${qty}x \${dip.name}</li>\` : '';
              }).filter(Boolean).join('');

              sections.push(\`
                <div class="review-section">
                  <strong>Included Dips (\${totalQty} of \${maxDips}):</strong>
                  <ul class="review-list">\${dipItems}</ul>
                </div>
              \`);
            } else if (selectedIncludedDips === 'no-dip') {
              sections.push(\`
                <div class="review-section">
                  <strong>Included Dips:</strong> No Dipping Sauce
                </div>
              \`);
            }

            // Extra Dips / Optional Addons (handle all optional-addons type steps)
            const optionalAddonSteps = flow.filter(s => s.type === 'optional-addons');
            optionalAddonSteps.forEach(addonsStep => {
              const selectedAddons = currentSelections[addonsStep.id];
              if (selectedAddons && Object.keys(selectedAddons).length > 0) {
                // Get addon list from dataSource (sauces or dippingSauces)
                let addonsList = [];
                if (addonsStep.dataSource === 'sauces') {
                  addonsList = globalData?.sauces || [];
                } else if (addonsStep.dataSource === 'dippingSauces') {
                  addonsList = globalData?.dippingSauces || [];
                }

                const pricePerItem = addonsStep.pricePerItem || 0;

                const addonItems = Object.entries(selectedAddons).map(([addonId, qty]) => {
                  if (qty <= 0) return '';
                  const addon = addonsList.find(a => a.id === addonId);
                  if (!addon) return '';
                  return \`<li>\${qty}x \${addon.name} ($\${pricePerItem.toFixed(2)} each)</li>\`;
                }).filter(Boolean).join('');

                if (addonItems) {
                  sections.push(\`
                    <div class="review-section">
                      <strong>\${addonsStep.label}:</strong>
                      <ul class="review-list">\${addonItems}</ul>
                    </div>
                  \`);
                }
              }
            });

            // Preparation method (for plant-based)
            const prepStep = flow.find(s => s.id === 'preparation');
            if (prepStep && currentSelections['preparation']) {
              const option = prepStep.options?.find(o => o.id === currentSelections['preparation']);
              if (option) {
                sections.push(\`
                  <div class="review-section">
                    <strong>Preparation:</strong> \${option.label}
                  </div>
                \`);
              }
            }

            // Price breakdown
            let priceSection = '';
            if (priceBreakdown) {
              const addonRows = priceBreakdown.addons.map(addon => \`
                <div class="price-row addon">
                  <span class="price-label">\${addon.name}:</span>
                  <span class="price-value">+$\${addon.price.toFixed(2)}</span>
                </div>
              \`).join('');

              priceSection = \`
                <div class="price-breakdown">
                  \${addonRows}
                  <div class="price-row total">
                    <span class="price-label"><strong>Total:</strong></span>
                    <span class="price-value"><strong>$\${priceBreakdown.total.toFixed(2)}</strong></span>
                  </div>
                </div>
              \`;
            }

            return \`
              <div class="step-review">
                <h3 class="step-title">Order Summary</h3>
                \${sections.join('')}
                \${priceSection}
              </div>
            \`;
          },
          validate() { return { valid: true }; }
        }
      };

      // Pricing Strategies
      const PRICING_STRATEGIES = {
        'configurable-entree': {
          calculate(selections, productData, productConfig) {
            let base = selections.variant?.platformPrice || selections.variant?.basePrice || 0;
            const addons = [];

            // Calculate all optional-addons steps dynamically
            const flow = productConfig?.customizationFlow || [];
            const optionalAddonSteps = flow.filter(step => step.type === 'optional-addons');

            optionalAddonSteps.forEach(step => {
              const selectedAddons = selections[step.id];
              if (selectedAddons && typeof selectedAddons === 'object') {
                const pricePerItem = step.pricePerItem || 0;

                // Sum up quantities for this addon step
                const quantities = Object.entries(selectedAddons)
                  .filter(([_, qty]) => qty > 0)
                  .map(([id, qty]) => ({ id, qty }));

                const totalQty = quantities.reduce((sum, item) => sum + item.qty, 0);

                if (totalQty > 0) {
                  // Use step label for addon name (e.g., "Extra Sauces (Optional)" or "Extra Dipping Sauces")
                  const label = step.label.replace(/\s*\(Optional\)\s*/i, '').trim();
                  addons.push({
                    name: \`\${totalQty}x \${label}\`,
                    price: pricePerItem * totalQty
                  });
                }
              }
            });

            const total = parseFloat((base + addons.reduce((s, a) => s + a.price, 0)).toFixed(2));
            return { base: parseFloat(base.toFixed(2)), addons, total };
          }
        }
      };

      // Product Configurator State Class
      class ProductConfiguratorState {
        constructor(productConfig, productData, globalData) {
          this.config = productConfig;
          this.data = productData;
          this.globalData = globalData;
          this.currentStepIndex = 0;
          this.selections = {};
          this.priceBreakdown = { base: 0, addons: [], total: 0 };
        }

        get currentStep() { return this.config.customizationFlow[this.currentStepIndex]; }
        get totalSteps() { return this.config.customizationFlow.length; }
        isFirstStep() { return this.currentStepIndex === 0; }
        isLastStep() { return this.currentStepIndex === this.totalSteps - 1; }

        canNavigateNext() {
          const renderer = STEP_RENDERERS[this.currentStep.type];
          return renderer ? renderer.validate(this.currentStep, this.selections).valid : true;
        }

        navigateNext() {
          if (this.canNavigateNext() && !this.isLastStep()) {
            this.currentStepIndex++;
            this.recalculatePrice();
            return true;
          }
          return false;
        }

        navigateBack() {
          if (!this.isFirstStep()) {
            this.currentStepIndex--;
            return true;
          }
          return false;
        }

        recalculatePrice() {
          const strategy = PRICING_STRATEGIES[this.config.productType];
          if (strategy) {
            this.priceBreakdown = strategy.calculate(this.selections, this.data, this.config);
          }
        }
      }

      // Global Product Configurator API
      window.productConfigurator = {
        state: null,

        open(productId, productData) {
          try {
            console.log('[Configurator] Opening product:', productId);
            const config = PRODUCT_CONFIGS[productId];
            if (!config) {
              console.error('[Configurator] Unknown product:', productId);
              return;
            }

            console.log('[Configurator] Config found:', config);
            this.state = new ProductConfiguratorState(config, productData, GLOBAL_DATA);
            console.log('[Configurator] State created:', this.state);

            this.render();
            console.log('[Configurator] Rendered successfully');

            this.showModal();
            console.log('[Configurator] Modal shown');
          } catch (error) {
            console.error('[Configurator] Error in open():', error);
          }
        },

        close() {
          const modal = document.getElementById('productConfigModal');
          if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
          }
          this.state = null;
        },

        render() {
          try {
            if (!this.state) {
              console.warn('[Configurator] render() called with no state');
              return;
            }

            const step = this.state.currentStep;
            console.log('[Configurator] Rendering step:', step);

            const renderer = STEP_RENDERERS[step.type];
            if (!renderer) {
              console.error('[Configurator] No renderer for step type:', step.type);
              return;
            }

            console.log('[Configurator] Using renderer:', step.type);
            const html = renderer.render(
              step,
              this.state.selections,
              this.state.data,
              GLOBAL_DATA,
              this.state.priceBreakdown,
              this.state.config
            );

            console.log('[Configurator] HTML generated, length:', html.length);

            const bodyEl = document.getElementById('productConfigModalBody');
            if (!bodyEl) {
              console.error('[Configurator] Modal body element not found!');
              return;
            }

            bodyEl.innerHTML = html;
            console.log('[Configurator] HTML injected into modal body');

            this.updateProgress();
            this.updateButtons();
          } catch (error) {
            console.error('[Configurator] Error in render():', error);
          }
        },

        updateProgress() {
          const steps = document.querySelectorAll('#productConfigModalProgress .progress-step');
          steps.forEach((el, idx) => {
            el.classList.toggle('active', idx === this.state.currentStepIndex);
          });
        },

        updateButtons() {
          const backBtn = document.getElementById('productConfigBackBtn');
          const nextBtn = document.getElementById('productConfigNextBtn');
          const addBtn = document.getElementById('productConfigAddBtn');

          if (backBtn) backBtn.style.display = this.state.isFirstStep() ? 'none' : 'block';
          if (nextBtn) nextBtn.style.display = this.state.isLastStep() ? 'none' : 'block';
          if (addBtn) addBtn.style.display = this.state.isLastStep() ? 'block' : 'none';
        },

        showModal() {
          // Generate dynamic progress indicators
          const progressContainer = document.getElementById('productConfigModalProgress');
          if (progressContainer && this.state) {
            const totalSteps = this.state.totalSteps;
            progressContainer.innerHTML = Array.from({ length: totalSteps }, (_, i) =>
              \`<div class="progress-step \${i === 0 ? 'active' : ''}" data-step="\${i + 1}"></div>\`
            ).join('');
          }

          const modal = document.getElementById('productConfigModal');
          if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
          }
        },

        next() {
          if (this.state.navigateNext()) {
            this.render();
          }
        },

        back() {
          if (this.state.navigateBack()) {
            this.render();
          }
        },

        selectOption(stepId, optionId) {
          this.state.selections[stepId] = optionId;
          this.state.recalculatePrice();
          // Re-render to show visual selection feedback
          this.render();
        },

        selectVariant(variant) {
          this.state.selections.variant = variant;
          this.state.recalculatePrice();
          this.render();
        },

        selectVariantFromData(buttonElement) {
          try {
            const variantDataStr = buttonElement.getAttribute('data-variant');
            const variant = JSON.parse(variantDataStr);
            this.selectVariant(variant);
          } catch (error) {
            console.error('Error parsing variant data:', error);
          }
        },

        toggleMultiChoice(stepId, optionId) {
          if (!this.state.selections[stepId]) this.state.selections[stepId] = [];
          const idx = this.state.selections[stepId].indexOf(optionId);
          if (idx >= 0) {
            this.state.selections[stepId].splice(idx, 1);
          } else {
            this.state.selections[stepId].push(optionId);
          }
          this.state.recalculatePrice();
          this.render();
        },

        selectNoDip(stepId) {
          this.state.selections[stepId] = 'no-dip';
          this.state.recalculatePrice();
          this.render();
        },

        toggleSauceOnSide(sauceId, isOnSide) {
          if (!this.state.selections.saucePreferences) {
            this.state.selections.saucePreferences = {};
          }
          if (!this.state.selections.saucePreferences[sauceId]) {
            this.state.selections.saucePreferences[sauceId] = {};
          }
          this.state.selections.saucePreferences[sauceId].onSide = isOnSide;
          console.log('[Configurator] Sauce on-side toggled:', sauceId, isOnSide);
          this.render();
        },

        changeAddonQuantity(stepId, addonId, delta) {
          if (!this.state.selections[stepId]) this.state.selections[stepId] = {};
          const current = this.state.selections[stepId][addonId] || 0;
          const newQty = Math.max(0, current + delta);
          if (newQty === 0) {
            delete this.state.selections[stepId][addonId];
          } else {
            this.state.selections[stepId][addonId] = newQty;
          }
          this.state.recalculatePrice();
          this.render();
        },

        changeIncludedDipQuantity(stepId, dipId, delta) {
          if (!this.state.selections[stepId]) this.state.selections[stepId] = {};

          // Find the step config to get maxSelections
          const step = this.state.config.customizationFlow.find(s => s.id === stepId);
          const maxSelections = step?.maxSelections || 2;

          // Calculate current total quantity
          const currentSelections = this.state.selections[stepId];
          const totalQty = Object.values(currentSelections).reduce((sum, qty) => sum + (qty || 0), 0);

          const current = currentSelections[dipId] || 0;
          const newQty = current + delta;

          // Enforce constraints
          if (newQty < 0) return; // Can't go below 0
          if (delta > 0 && totalQty >= maxSelections) return; // Can't exceed max

          if (newQty === 0) {
            delete this.state.selections[stepId][dipId];
          } else {
            this.state.selections[stepId][dipId] = newQty;
          }

          this.render();
        },

        addToCart() {
          const orderItem = this.state.selections;
          console.log('Add to cart:', orderItem);
          alert('Order added to cart! (Integration with cart system pending)');
          this.close();
        }
      };

      console.log('✅ Product Configurator initialized');
    })();

    // ==============================================
    // GLOBAL HELPER FUNCTIONS
    // ==============================================
    window.openPlantBasedWingModal = function(buttonElement) {
      try {
        const productId = buttonElement.getAttribute('data-product-id');
        const productDataStr = buttonElement.getAttribute('data-product-data');
        const productData = JSON.parse(productDataStr);

        console.log('Opening plant-based modal:', productId, productData);
        window.productConfigurator.open(productId, productData);
      } catch (error) {
        console.error('Error opening plant-based wing modal:', error);
      }
    };
  `;
}

module.exports = {
  generateProductConfiguratorJS,
  PRODUCT_CONFIGS,
  STEP_RENDERERS,
  ProductConfiguratorState
};
