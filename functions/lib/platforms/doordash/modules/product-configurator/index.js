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

            // Calculate price per item
            const DOORDASH_MARKUP = 1.35; // 35% markup

            return \`
              <div class="step-optional-addons">
                <h3 class="step-title">\${stepConfig.label}</h3>
                \${stepConfig.description ? \`<p class="step-description">\${stepConfig.description}</p>\` : ''}
                <div class="addons-grid">
                  \${options.map(addon => {
                    const quantity = selectedAddons[addon.id] || 0;

                    // Get price: either from Firebase basePrice with markup, or fallback to hardcoded
                    let pricePerItem;
                    if (stepConfig.priceSource === 'firebase' && addon.basePrice) {
                      pricePerItem = parseFloat((addon.basePrice * DOORDASH_MARKUP).toFixed(2));
                    } else {
                      pricePerItem = stepConfig.pricePerItem || 0.99;
                    }

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
            const DOORDASH_MARKUP = 1.35; // 35% markup
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

                const addonItems = Object.entries(selectedAddons).map(([addonId, qty]) => {
                  if (qty <= 0) return '';
                  const addon = addonsList.find(a => a.id === addonId);
                  if (!addon) return '';

                  // Get price: either from Firebase basePrice with markup, or fallback to hardcoded
                  let pricePerItem;
                  if (addonsStep.priceSource === 'firebase' && addon.basePrice) {
                    pricePerItem = parseFloat((addon.basePrice * DOORDASH_MARKUP).toFixed(2));
                  } else {
                    pricePerItem = addonsStep.pricePerItem || 0.99;
                  }

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
          calculate(selections, productData, productConfig, globalData = {}) {
            let base = 0;
            const addons = [];
            const DOORDASH_MARKUP = 1.35; // 35% markup

            // Base price from variant
            if (selections.variant) {
              base = selections.variant.platformPrice || selections.variant.basePrice || 0;
            }

            // Process all optional addon steps dynamically
            const optionalAddonSteps = productConfig.customizationFlow?.filter(step => step.type === 'optional-addons') || [];

            optionalAddonSteps.forEach(step => {
              const selectedAddons = selections[step.id];
              if (!selectedAddons || Object.keys(selectedAddons).length === 0) return;

              // Get the correct data source
              let addonsList = [];
              if (step.dataSource === 'dippingSauces' && globalData?.dippingSauces) {
                addonsList = globalData.dippingSauces;
              } else if (step.dataSource === 'sauces' && globalData?.sauces) {
                addonsList = globalData.sauces.filter(s =>
                  s.category !== 'dipping-sauce' &&
                  s.category !== 'dry-rub' &&
                  s.active !== false
                );
              }

              // Calculate addon prices
              Object.entries(selectedAddons).forEach(([addonId, qty]) => {
                if (qty <= 0) return;

                const addon = addonsList.find(a => a.id === addonId);
                if (!addon) return;

                // Get price: either from Firebase basePrice with markup, or fallback to hardcoded
                let pricePerItem;
                if (step.priceSource === 'firebase' && addon.basePrice) {
                  pricePerItem = parseFloat((addon.basePrice * DOORDASH_MARKUP).toFixed(2));
                } else {
                  pricePerItem = step.pricePerItem || 0.99;
                }

                const lineTotal = parseFloat((pricePerItem * qty).toFixed(2));
                addons.push({
                  name: \`\${qty}x \${addon.name}\`,
                  price: lineTotal
                });
              });
            });

            // Protein addon (for salads)
            if (selections.protein) {
              const proteinPrice = 4.99;
              addons.push({
                name: 'Added Protein',
                price: proteinPrice
              });
            }

            // Calculate total
            const addonTotal = addons.reduce((sum, addon) => sum + addon.price, 0);
            const total = parseFloat((base + addonTotal).toFixed(2));

            return {
              base: parseFloat(base.toFixed(2)),
              addons,
              total
            };
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
            this.priceBreakdown = strategy.calculate(this.selections, this.data, this.config, this.globalData);
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

          this.ensureModalStyles();

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
        },

        ensureModalStyles() {
          if (!document.getElementById('productConfiguratorFallbackStyles')) {
            const fallbackStyle = document.createElement('style');
            fallbackStyle.id = 'productConfiguratorFallbackStyles';
            fallbackStyle.textContent = \`
              .product-config-modal .step-title {
                font-size: 1.25rem;
                font-weight: 700;
                color: #1a202c;
                margin-bottom: 1rem;
              }

              .product-config-modal .step-description {
                font-size: 0.95rem;
                color: #4a5568;
                margin-bottom: 1rem;
              }

              .product-config-modal .choice-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
                gap: 1rem;
              }

              .product-config-modal .choice-card {
                background: #f7fafc;
                border: 2px solid transparent;
                border-radius: 10px;
                padding: 1.1rem;
                text-align: left;
                cursor: pointer;
                transition: all 0.2s ease;
              }

              .product-config-modal .choice-card:hover {
                border-color: #cbd5f5;
              }

              .product-config-modal .choice-card.selected {
                border-color: #0f766e;
                background: #e6fffa;
              }

              .product-config-modal .choice-icon {
                font-size: 1.5rem;
                margin-bottom: 0.5rem;
              }

              .product-config-modal .choice-label {
                font-size: 1.1rem;
                margin: 0 0 0.35rem 0;
                color: #1a202c;
              }

              .product-config-modal .variant-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
                gap: 0.85rem;
              }

              .product-config-modal .variant-card {
                border: 2px solid #e2e8f0;
                border-radius: 10px;
                padding: 1rem;
                text-align: center;
                cursor: pointer;
                display: flex;
                flex-direction: column;
                gap: 0.35rem;
                transition: all 0.2s ease;
                background: #ffffff;
              }

              .product-config-modal .variant-card.selected {
                border-color: #0f766e;
                background: #e6fffa;
              }

              .product-config-modal .variant-name {
                font-weight: 600;
                color: #1a202c;
              }

              .product-config-modal .variant-price {
                font-size: 1.1rem;
                font-weight: 700;
                color: #047857;
              }

              .product-config-modal .selection-counter {
                font-size: 0.95rem;
                color: #4a5568;
                margin-bottom: 0.75rem;
              }

              .product-config-modal .multi-choice-grid,
              .product-config-modal .dips-grid,
              .product-config-modal .addons-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 0.75rem;
              }

              .product-config-modal .multi-choice-card,
              .product-config-modal .dip-card,
              .product-config-modal .addon-card {
                border: 2px solid #e2e8f0;
                border-radius: 10px;
                padding: 0.9rem;
                background: #ffffff;
                cursor: pointer;
                transition: all 0.2s ease;
                position: relative;
              }

              .product-config-modal .multi-choice-card.selected,
              .product-config-modal .dip-card.selected,
              .product-config-modal .addon-card.selected {
                border-color: #0f766e;
                background: #e6fffa;
              }

              .product-config-modal .multi-choice-card.disabled,
              .product-config-modal .dip-card.disabled,
              .product-config-modal .addon-card.disabled {
                opacity: 0.5;
                cursor: not-allowed;
              }

              .product-config-modal .quantity-controls {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 0.75rem;
                margin-top: 0.75rem;
              }

              .product-config-modal .qty-btn {
                width: 34px;
                height: 34px;
                border-radius: 50%;
                border: none;
                background: #0f766e;
                color: #ffffff;
                font-size: 1.25rem;
                line-height: 1;
                cursor: pointer;
                transition: all 0.2s ease;
              }

              .product-config-modal .qty-btn[disabled] {
                background: #cbd5f5;
                cursor: not-allowed;
              }

              .product-config-modal .modal-footer button {
                transition: background 0.2s ease, transform 0.2s ease;
              }

              .product-config-modal .modal-footer button:hover:not([disabled]) {
                transform: translateY(-1px);
              }

              @media (max-width: 640px) {
                .product-config-modal .modal-content {
                  width: 94%;
                  max-height: 96vh;
                }

                .product-config-modal .choice-grid,
                .product-config-modal .variant-grid,
                .product-config-modal .multi-choice-grid,
                .product-config-modal .dips-grid,
                .product-config-modal .addons-grid {
                  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
                }

                .product-config-modal .modal-footer {
                  flex-direction: column;
                }

                .product-config-modal .modal-footer button {
                  width: 100%;
                }
              }
            \`;
            document.head.appendChild(fallbackStyle);
          }

          const modal = document.getElementById('productConfigModal');
          if (!modal || modal.dataset.pcStyleApplied === 'true') {
            return;
          }

          const modalStyles = window.getComputedStyle(modal);
          if (modalStyles.position === 'static' || modalStyles.position === 'initial') {
            Object.assign(modal.style, {
              position: 'fixed',
              top: '0',
              left: '0',
              width: '100%',
              height: '100%',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0, 0, 0, 0.7)',
              zIndex: '10000'
            });
          }

          const backdrop = modal.querySelector('.modal-backdrop');
          if (backdrop) {
            const backdropStyles = window.getComputedStyle(backdrop);
            if (backdropStyles.position === 'static' || backdropStyles.position === 'initial') {
              Object.assign(backdrop.style, {
                position: 'absolute',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
                cursor: 'pointer'
              });
            }
          }

          const content = modal.querySelector('.modal-content');
          if (content) {
            const contentStyles = window.getComputedStyle(content);
            if (contentStyles.position === 'static' || contentStyles.maxWidth === 'none') {
              Object.assign(content.style, {
                position: 'relative',
                background: '#ffffff',
                borderRadius: '12px',
                width: '90%',
                maxWidth: '600px',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)'
              });
            }
          }

          const body = modal.querySelector('.modal-body');
          if (body) {
            const bodyStyles = window.getComputedStyle(body);
            if (bodyStyles.overflowY === 'visible') {
              Object.assign(body.style, {
                flex: '1 1 auto',
                padding: '1.5rem',
                overflowY: 'auto'
              });
            }
          }

          const footer = modal.querySelector('.modal-footer');
          if (footer) {
            const footerStyles = window.getComputedStyle(footer);
            if (footerStyles.display === 'block') {
              Object.assign(footer.style, {
                display: 'flex',
                gap: '1rem',
                padding: '1.5rem',
                borderTop: '1px solid #e0e0e0'
              });
            }
          }

          const actionButtons = modal.querySelectorAll('#productConfigBackBtn, #productConfigNextBtn, #productConfigAddBtn');
          actionButtons.forEach(button => {
            const buttonStyles = window.getComputedStyle(button);
            if (buttonStyles.padding === '0px' || buttonStyles.backgroundColor === 'rgba(0, 0, 0, 0)') {
              Object.assign(button.style, {
                flex: '1 1 auto',
                padding: '0.9rem 1.25rem',
                borderRadius: '8px',
                border: 'none',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer'
              });
            }
          });

          const backBtn = document.getElementById('productConfigBackBtn');
          if (backBtn && backBtn.dataset.pcAccentApplied !== 'true') {
            Object.assign(backBtn.style, {
              background: '#e2e8f0',
              color: '#1a202c'
            });
            backBtn.dataset.pcAccentApplied = 'true';
          }

          const nextBtn = document.getElementById('productConfigNextBtn');
          if (nextBtn && nextBtn.dataset.pcAccentApplied !== 'true') {
            Object.assign(nextBtn.style, {
              background: '#004c54',
              color: '#ffffff'
            });
            nextBtn.dataset.pcAccentApplied = 'true';
          }

          const addBtn = document.getElementById('productConfigAddBtn');
          if (addBtn && addBtn.dataset.pcAccentApplied !== 'true') {
            Object.assign(addBtn.style, {
              background: '#ff6b35',
              color: '#ffffff'
            });
            addBtn.dataset.pcAccentApplied = 'true';
          }

          modal.dataset.pcStyleApplied = 'true';
        }
      };

      console.log('✅ Product Configurator initialized');

      // ==============================================
      // EVENT DELEGATION FOR CROSS-PLATFORM SUPPORT
      // ==============================================
      // UberEats and GrubHub strip inline onclick handlers for security
      // We attach listeners via event delegation to work on all platforms

      function attachProductConfigListeners() {
        // Find all buttons with data-product-id attribute
        const buttons = document.querySelectorAll('[data-product-id]');

        buttons.forEach(button => {
          // Skip if already has listener attached (prevent duplicates)
          if (button.dataset.listenerAttached === 'true') return;

          button.addEventListener('click', function(event) {
            try {
              const productId = this.getAttribute('data-product-id');
              const productDataStr = this.getAttribute('data-product-data');

              if (!productId || !productDataStr) {
                console.warn('[Configurator] Missing data attributes on button:', this);
                return;
              }

              const productData = JSON.parse(productDataStr);
              console.log('[Configurator] Event delegation triggered for:', productId);
              window.productConfigurator.open(productId, productData);
            } catch (error) {
              console.error('[Configurator] Error in event delegation:', error);
            }
          });

          // Mark as having listener attached
          button.dataset.listenerAttached = 'true';
          console.log('[Configurator] Listener attached to:', button.dataset.productId);
        });
      }

      // Attach listeners on DOMContentLoaded
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', attachProductConfigListeners);
      } else {
        // DOM already loaded, attach immediately
        attachProductConfigListeners();
      }

      // MutationObserver to handle dynamically inserted buttons
      const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          if (mutation.addedNodes.length > 0) {
            // Check if any added nodes contain product config buttons
            mutation.addedNodes.forEach(function(node) {
              if (node.nodeType === 1) { // Element node
                // Check if the node itself has data-product-id
                if (node.hasAttribute && node.hasAttribute('data-product-id')) {
                  attachProductConfigListeners();
                }
                // Check if any descendants have data-product-id
                if (node.querySelectorAll) {
                  const buttons = node.querySelectorAll('[data-product-id]');
                  if (buttons.length > 0) {
                    attachProductConfigListeners();
                  }
                }
              }
            });
          }
        });
      });

      // Start observing the document for changes
      observer.observe(document.body || document.documentElement, {
        childList: true,
        subtree: true
      });

      console.log('✅ Event delegation and MutationObserver initialized');
    })();

    // ==============================================
    // GLOBAL HELPER FUNCTIONS (BACKWARD COMPATIBILITY)
    // ==============================================
    // Keep this for DoorDash which still allows inline handlers
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
