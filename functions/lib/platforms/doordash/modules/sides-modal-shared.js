/**
 * Sides Modal Shared Module
 * Provides a configurable modal shell for all sides orchestrators.
 * The orchestrators supply a config object describing variants, steps,
 * and optional customization so we avoid duplicating legacy modal code.
 */

function generateSidesModalSharedJS(menuData = {}) {
  // Build dips from Firebase sauces data filtered for dipping sauces
  function buildDipsFromFirebase() {
    const saucesData = menuData.sauces || [];
    const dippingSauces = saucesData.filter(sauce =>
      sauce.category === 'dip' ||
      /ranch|blue.?cheese|honey.?mustard|cheese.?sauce/i.test(sauce.name || '')
    );

    if (dippingSauces.length > 0) {
      return dippingSauces.map(sauce => ({
        id: sauce.id || sauce.name.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
        name: sauce.name,
        price: sauce.platformPrice || (sauce.basePrice * 1.35) || 0.75,
        description: sauce.description || sauce.subtitle || ''
      }));
    }

    // Fallback if no dipping sauces found in Firebase
    return [
      { id: 'ranch', name: 'Ranch', price: 0.75, description: 'Cool & creamy ranch dip' },
      { id: 'blue_cheese', name: 'Blue Cheese', price: 0.75, description: 'Tangy blue cheese dip' },
      { id: 'honey_mustard', name: 'Honey Mustard', price: 0.75, description: 'Sweet honey mustard dip' },
      { id: 'cheese_sauce', name: 'Cheese Sauce', price: 0.75, description: 'Warm & melty cheese sauce' }
    ];
  }

  const defaultDips = buildDipsFromFirebase();

  return `
    (function(){
      const DEFAULT_DIPS = ${JSON.stringify(defaultDips)};
      const STEP_CONTAINER_IDS = {
        variants: 'sideModalVariants',
        customization: 'sideModalCustomization',
        dips: 'sideModalDips',
        summary: 'sideModalSummary'
      };

      const STEP_DEFAULT_LABELS = {
        variants: 'Options',
        customization: 'Customize',
        dips: 'Dips',
        summary: 'Summary'
      };

      const STEP_DEFAULT_TITLES = {
        variants: 'Choose Your Side',
        customization: 'Customize Your Order',
        dips: 'Extra Dipping Sauces',
        summary: 'Order Summary'
      };

      const state = {
        config: null,
        steps: [],
        stepIndex: 0,
        quantities: {},
        dips: {},
        customization: {}
      };

      function formatCurrency(value) {
        const number = Number(value);
        if (Number.isNaN(number)) return '0.00';
        return number.toFixed(2);
      }

      function getVariantPrice(variant) {
        if (typeof variant.platformPrice === 'number') return variant.platformPrice;
        if (typeof variant.price === 'number') return variant.price;
        if (typeof variant.basePrice === 'number') return variant.basePrice;
        const parsed = parseFloat(variant.platformPrice || variant.price || variant.basePrice);
        return Number.isNaN(parsed) ? 0 : parsed;
      }

      function ensureCustomizationDefaults(config) {
        if (!config.customization || !config.customization.enabled) return;
        const key = config.customization.stateKey || 'customOption';
        const defaultId = config.customization.defaultOption || (config.customization.options && config.customization.options[0]?.id);
        if (defaultId && !state.customization[key]) {
          state.customization[key] = defaultId;
        }
      }

      function buildStepDefinitions(config) {
        const order = Array.isArray(config.stepOrder) && config.stepOrder.length ? config.stepOrder : ['variants', 'dips', 'summary'];
        const steps = [];
        order.forEach((key) => {
          if (key === 'variants') {
            steps.push({ key: 'variants', label: config.stepLabels?.variants || STEP_DEFAULT_LABELS.variants, title: config.stepTitles?.variants || STEP_DEFAULT_TITLES.variants, requiresSelection: true });
          }
          if (key === 'customization' && config.customization && config.customization.enabled) {
            steps.push({ key: 'customization', label: config.stepLabels?.customization || STEP_DEFAULT_LABELS.customization, title: config.stepTitles?.customization || STEP_DEFAULT_TITLES.customization, requiresCustomization: config.customization.required !== false });
          }
          if (key === 'dips' && config.dipsEnabled !== false) {
            steps.push({ key: 'dips', label: config.stepLabels?.dips || STEP_DEFAULT_LABELS.dips, title: config.stepTitles?.dips || STEP_DEFAULT_TITLES.dips });
          }
          if (key === 'summary') {
            steps.push({ key: 'summary', label: config.stepLabels?.summary || STEP_DEFAULT_LABELS.summary, title: config.stepTitles?.summary || STEP_DEFAULT_TITLES.summary });
          }
        });
        // Ensure we always have a summary step.
        if (!steps.some(step => step.key === 'summary')) {
          steps.push({ key: 'summary', label: config.stepLabels?.summary || STEP_DEFAULT_LABELS.summary, title: config.stepTitles?.summary || STEP_DEFAULT_TITLES.summary });
        }
        return steps;
      }

      function getStepContainer(stepKey) {
        const containerId = STEP_CONTAINER_IDS[stepKey];
        if (!containerId) return null;
        return document.getElementById(containerId) || null;
      }

      function hideAllStepContainers() {
        Object.values(STEP_CONTAINER_IDS).forEach((id) => {
          const container = document.getElementById(id);
          if (container) {
            container.classList.remove('active');
          }
        });
      }

      function configureProgress(steps) {
        const progressEl = document.getElementById('sideModalProgress');
        if (!progressEl) return;
        progressEl.style.cssText = 'display: flex; justify-content: center; gap: 1rem; margin-top: 1rem;';
        progressEl.innerHTML = steps.map((step, index) => {
          return '<div class="progress-step' + (index === 0 ? ' active' : '') + '" data-step="' + (index + 1) + '" style="' +
            'width: 40px; ' +
            'height: 40px; ' +
            'border-radius: 50%; ' +
            'background: ' + (index === 0 ? '#FF3333' : '#f0f0f0') + '; ' +
            'color: ' + (index === 0 ? 'white' : '#666') + '; ' +
            'display: flex; ' +
            'align-items: center; ' +
            'justify-content: center; ' +
            'font-weight: 700; ' +
            'font-size: 12px; ' +
            'transition: all 0.3s ease; ' +
            'position: relative; ' +
            'z-index: 1;' +
          '">' + step.label + '</div>';
        }).join('');
      }

      function updateProgress() {
        const progressEl = document.getElementById('sideModalProgress');
        if (!progressEl) return;
        const steps = progressEl.querySelectorAll('.progress-step');
        steps.forEach((el, index) => {
          el.classList.remove('active', 'completed');
          if (index < state.stepIndex) {
            el.classList.add('completed');
            el.style.background = '#FFE66D';
            el.style.color = '#333';
          } else if (index === state.stepIndex) {
            el.classList.add('active');
            el.style.background = '#FF3333';
            el.style.color = 'white';
          } else {
            el.style.background = '#f0f0f0';
            el.style.color = '#666';
          }
        });
      }

      function setModalHeaderTitles() {
        const titleEl = document.getElementById('sideModalTitle');
        if (titleEl && state.config) {
          titleEl.textContent = state.config.modalTitle || 'Choose Your Side';
        }
        const currentStep = state.steps[state.stepIndex];
        if (!currentStep) return;
        const titleId = {
          variants: 'sideVariantsTitle',
          customization: 'sideCustomizationTitle',
          dips: 'sideDipsTitle',
          summary: 'sideSummaryTitle'
        }[currentStep.key];
        if (titleId) {
          const el = document.getElementById(titleId);
          if (el) {
            el.textContent = currentStep.title || STEP_DEFAULT_TITLES[currentStep.key] || 'Step';
          }
        }
      }

      function renderVariantsStep(container) {
        if (!container || !state.config) return;
        const variants = state.config.variants || [];
        if (!variants.length) {
          container.innerHTML = '<div style="text-align: center; padding: 2rem; color: #666; font-size: 16px;"><p>No sides available at the moment.</p></div>';
          return;
        }

        container.innerHTML = variants.map(variant => {
          const quantity = state.quantities[variant.id] || 0;
          const subtitle = variant.subtitle || variant.description || '';
          const price = formatCurrency(getVariantPrice(variant));

          return '<div class="enhanced-side-card' + (quantity > 0 ? ' selected' : '') + '" onclick="updateSideQuantity(\\'' + variant.id + '\\', 1)" style="' +
            'background: ' + (quantity > 0 ? 'linear-gradient(135deg, #fff5f2 0%, #ffede8 100%)' : 'white') + '; ' +
            'border: 2px solid ' + (quantity > 0 ? '#ff6b35' : '#e0e0e0') + '; ' +
            'border-radius: 16px; ' +
            'padding: 1.5rem; ' +
            'margin-bottom: 1rem; ' +
            'cursor: pointer; ' +
            'transition: all 0.3s ease; ' +
            'box-shadow: ' + (quantity > 0 ? '0 8px 25px rgba(255, 107, 53, 0.15)' : '0 2px 10px rgba(0,0,0,0.1)') + '; ' +
            'transform: ' + (quantity > 0 ? 'translateY(-2px)' : 'none') + '; ' +
            'position: relative; ' +
            'overflow: hidden;' +
          '">' +
            '<div style="position: relative; z-index: 2;">' +
              '<div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">' +
                '<div style="flex: 1;">' +
                  '<h4 style="margin: 0 0 0.5rem 0; font-size: 1.1rem; font-weight: 600; color: #1a1a1a; line-height: 1.3;">' + (variant.name || 'Side Option') + '</h4>' +
                  (subtitle ? '<p style="margin: 0; color: #666; font-size: 14px; line-height: 1.4;">' + subtitle + '</p>' : '') +
                '</div>' +
                '<div style="margin-left: 1rem; text-align: right;">' +
                  '<div style="font-size: 1.25rem; font-weight: 700; color: #ff6b35; margin-bottom: 0.5rem;">$' + price + '</div>' +
                '</div>' +
              '</div>' +
              '<div style="display: flex; justify-content: space-between; align-items: center;">' +
                '<div style="font-size: 13px; color: #888; font-weight: 500;">Click to add • Tap again to increase</div>' +
                '<div class="enhanced-quantity-controls" style="display: flex; align-items: center; gap: 12px; background: ' + (quantity > 0 ? '#fff' : '#f8f9fa') + '; border-radius: 25px; padding: 8px 16px; border: 1px solid ' + (quantity > 0 ? '#ff6b35' : '#dee2e6') + ';">' +
                  '<button class="enhanced-quantity-btn" onclick="event.stopPropagation(); updateSideQuantity(\\'' + variant.id + '\\', -1)" ' +
                    'style="width: 32px; height: 32px; border: none; background: ' + (quantity === 0 ? '#f1f3f4' : '#ff6b35') + '; color: ' + (quantity === 0 ? '#9aa0a6' : 'white') + '; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: bold; cursor: ' + (quantity === 0 ? 'not-allowed' : 'pointer') + '; transition: all 0.2s ease; opacity: ' + (quantity === 0 ? '0.5' : '1') + ';" ' +
                    (quantity === 0 ? 'disabled' : '') + '>−</button>' +
                  '<span class="enhanced-quantity-display" id="qty_' + variant.id + '" style="min-width: 24px; text-align: center; font-size: 16px; font-weight: 600; color: #1a1a1a;">' + quantity + '</span>' +
                  '<button class="enhanced-quantity-btn" onclick="event.stopPropagation(); updateSideQuantity(\\'' + variant.id + '\\', 1)" ' +
                    'style="width: 32px; height: 32px; border: none; background: #ff6b35; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: bold; cursor: pointer; transition: all 0.2s ease;">+</button>' +
                '</div>' +
              '</div>' +
            '</div>' +
            (quantity > 0 ? '<div style="position: absolute; top: 12px; right: 12px; width: 24px; height: 24px; background: #ff6b35; border-radius: 50%; display: flex; align-items: center; justify-content: center; z-index: 3;"><svg width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 5L5 9L13 1" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></div>' : '') +
          '</div>';
        }).join('');
      }

      function renderCustomizationStep(container) {
        if (!container || !state.config || !state.config.customization || !state.config.customization.enabled) {
          if (container) container.innerHTML = '<div style="text-align: center; padding: 2rem; color: #666; font-size: 16px;"><p>No customization available.</p></div>';
          return;
        }
        const customization = state.config.customization;
        const key = customization.stateKey || 'customOption';
        const options = customization.options || [];
        if (!options.length) {
          container.innerHTML = '<div style="text-align: center; padding: 2rem; color: #666; font-size: 16px;"><p>No customization options configured.</p></div>';
          return;
        }
        const selectedId = state.customization[key];
        container.innerHTML = options.map(option => {
          const isSelected = option.id === selectedId;
          return '<div class="enhanced-customization-option" onclick="setSideCustomizationOption(\\'' + option.id + '\\')" style="' +
            'display: flex; ' +
            'align-items: center; ' +
            'justify-content: space-between; ' +
            'padding: 1.5rem; ' +
            'border: 2px solid ' + (isSelected ? '#ff6b35' : '#e0e0e0') + '; ' +
            'border-radius: 16px; ' +
            'margin-bottom: 1rem; ' +
            'background: ' + (isSelected ? 'linear-gradient(135deg, #fff5f2 0%, #ffede8 100%)' : 'white') + '; ' +
            'cursor: pointer; ' +
            'transition: all 0.3s ease; ' +
            'box-shadow: ' + (isSelected ? '0 8px 25px rgba(255, 107, 53, 0.15)' : '0 2px 10px rgba(0,0,0,0.1)') + '; ' +
            'transform: ' + (isSelected ? 'translateY(-2px)' : 'none') + '; ' +
            'position: relative; ' +
            'overflow: hidden;' +
          '">' +
            '<div style="flex: 1; position: relative; z-index: 2;">' +
              '<div style="font-weight: 600; color: #1a1a1a; font-size: 1.1rem; margin-bottom: 0.5rem;">' + option.label + '</div>' +
              (option.description ? '<div style="color: #666; font-size: 14px; line-height: 1.4;">' + option.description + '</div>' : '') +
            '</div>' +
            '<div style="margin-left: 1rem; position: relative; z-index: 2;">' +
              '<div style="width: 28px; height: 28px; border-radius: 50%; border: 2px solid ' + (isSelected ? '#ff6b35' : '#ccc') + '; display: flex; align-items: center; justify-content: center; background: ' + (isSelected ? '#ff6b35' : 'white') + '; transition: all 0.3s ease;">' +
                (isSelected ? '<svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 6L5.5 10.5L15 1" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' : '') +
              '</div>' +
            '</div>' +
            (isSelected ? '<div style="position: absolute; top: 12px; right: 12px; background: #ff6b35; color: white; padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Selected</div>' : '') +
          '</div>';
        }).join('');
      }

      function renderDipsStep(container) {
        if (!container || !state.config) return;
        const dips = state.config.dipsEnabled === false ? [] : (state.config.dips || DEFAULT_DIPS);
        if (!dips.length) {
          container.innerHTML = '<p style="text-align:center; color:#666;">No extra dips available.</p>';
          return;
        }

        container.innerHTML =
          '<div style="margin-bottom: 20px; font-size: 14px; color: #666; text-align: center;">Select extra dipping sauces (optional) - $' + formatCurrency(dips[0]?.price || 0.75) + ' each</div>' +
          '<div style="margin-bottom: 16px; text-align: center;">' +
            '<button onclick="skipSideDips()" style="padding: 10px 20px; background: #f8f9fa; border: 2px solid #dee2e6; color: #6c757d; border-radius: 8px; cursor: pointer; font-size: 14px;">Skip Dips (None)</button>' +
          '</div>' +
          dips.map(dip => {
            const quantity = state.dips[dip.id] || 0;
            return '<div class="side-dip-option" style="display: flex; align-items: center; justify-content: space-between; padding: 15px; border: 2px solid ' + (quantity > 0 ? '#ff6b35' : '#e0e0e0') + '; border-radius: 12px; margin-bottom: 12px; background: ' + (quantity > 0 ? '#fff5f2' : 'white') + ';">' +
              '<div style="flex: 1;">' +
                '<h5 style="margin: 0 0 4px 0; color: #1a1a1a; font-size: 16px;">' + dip.name + '</h5>' +
                '<p style="margin: 0; color: #666; font-size: 14px;">' + (dip.description || '') + (dip.price ? ' - $' + formatCurrency(dip.price) + ' each' : '') + '</p>' +
              '</div>' +
              '<div style="display: flex; align-items: center; gap: 12px;">' +
                '<button onclick="adjustSideDipQuantity(\\\'' + dip.id + '\\\', -1)" style="width: 36px; height: 36px; border: 2px solid ' + (quantity === 0 ? '#ccc' : '#ff6b35') + '; background: white; color: ' + (quantity === 0 ? '#ccc' : '#ff6b35') + '; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: bold; cursor: ' + (quantity === 0 ? 'not-allowed' : 'pointer') + '; opacity: ' + (quantity === 0 ? '0.3' : '1') + ';" ' + (quantity === 0 ? 'disabled' : '') + '>−</button>' +
                '<span style="min-width: 24px; text-align: center; font-size: 18px; font-weight: bold; color: #1a1a1a;">' + quantity + '</span>' +
                '<button onclick="adjustSideDipQuantity(\\\'' + dip.id + '\\\', 1)" style="width: 36px; height: 36px; border: 2px solid #ff6b35; background: #ff6b35; color: white; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: bold; cursor: pointer;">+</button>' +
              '</div>' +
            '</div>';
          }).join('');
      }

      function renderSummaryStep(container) {
        if (!container || !state.config) return;
        const payload = buildOrderPayload();

        if (!payload.items.length) {
          container.innerHTML = '<div style="text-align: center; padding: 3rem; color: #666; font-size: 16px;"><p>No items selected yet.</p><p style="font-size: 14px; margin-top: 1rem;">Go back to select your items.</p></div>';
          return;
        }

        const itemHtml = payload.items.map(item =>
          '<div style="' +
            'display: flex; ' +
            'justify-content: space-between; ' +
            'align-items: center; ' +
            'padding: 12px 0; ' +
            'border-bottom: 1px solid #f0f0f0; ' +
            'font-size: 16px;' +
          '">' +
            '<div style="flex: 1;">' +
              '<div style="font-weight: 600; color: #1a1a1a; margin-bottom: 2px;">' + item.name + '</div>' +
              '<div style="font-size: 14px; color: #666;">Qty: ' + item.quantity + '</div>' +
            '</div>' +
            '<div style="font-weight: 700; color: #ff6b35; font-size: 18px;">$' + formatCurrency(item.total) + '</div>' +
          '</div>'
        ).join('');

        const dipHtml = payload.dips.length ?
          '<div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 2px solid #f0f0f0;">' +
            '<div style="display: flex; align-items: center; margin-bottom: 1rem;">' +
              '<div style="width: 4px; height: 20px; background: #ff6b35; border-radius: 2px; margin-right: 12px;"></div>' +
              '<h4 style="margin: 0; font-weight: 600; font-size: 16px; color: #1a1a1a;">Extra Dipping Sauces</h4>' +
            '</div>' +
            payload.dips.map(dip =>
              '<div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; font-size: 15px;">' +
                '<span style="color: #555;">' + dip.name + ' × ' + dip.quantity + '</span>' +
                '<span style="font-weight: 600; color: #ff6b35;">$' + formatCurrency(dip.total) + '</span>' +
              '</div>'
            ).join('') +
          '</div>' :
          '<div style="margin-top: 1.5rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; text-align: center;">' +
            '<div style="font-size: 14px; color: #666; font-style: italic;">No extra dipping sauces selected</div>' +
          '</div>';

        let customizationHtml = '';
        if (payload.customization.length) {
          customizationHtml = '<div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 2px solid #f0f0f0;">' +
            '<div style="display: flex; align-items: center; margin-bottom: 1rem;">' +
              '<div style="width: 4px; height: 20px; background: #28a745; border-radius: 2px; margin-right: 12px;"></div>' +
              '<h4 style="margin: 0; font-weight: 600; font-size: 16px; color: #1a1a1a;">Customization</h4>' +
            '</div>' +
            payload.customization.map(entry =>
              '<div style="padding: 8px 16px; background: #e8f5e8; border-radius: 8px; margin-bottom: 8px; font-size: 14px; color: #2d5a3d; font-weight: 500;">' +
                entry.label +
              '</div>'
            ).join('') +
          '</div>';
        }

        container.innerHTML =
          '<div style="' +
            'background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%); ' +
            'border: 2px solid #e9ecef; ' +
            'border-radius: 16px; ' +
            'padding: 1.5rem; ' +
            'box-shadow: 0 4px 20px rgba(0,0,0,0.08);' +
          '">' +
            '<div style="text-align: center; margin-bottom: 1.5rem;">' +
              '<h3 style="margin: 0 0 0.5rem 0; font-size: 20px; font-weight: 700; color: #1a1a1a;">' + (state.config.summaryHeading || 'Order Summary') + '</h3>' +
              '<div style="width: 60px; height: 3px; background: linear-gradient(90deg, #ff6b35 0%, #ffa726 100%); border-radius: 2px; margin: 0 auto;"></div>' +
            '</div>' +
            '<div style="margin-bottom: 1rem;">' + itemHtml + '</div>' +
            dipHtml +
            customizationHtml +
            '<div style="' +
              'margin-top: 2rem; ' +
              'padding: 1.5rem; ' +
              'background: linear-gradient(135deg, #ff6b35 0%, #ff8f65 100%); ' +
              'border-radius: 12px; ' +
              'box-shadow: 0 4px 15px rgba(255, 107, 53, 0.3);' +
            '">' +
              '<div style="display: flex; justify-content: space-between; align-items: center;">' +
                '<span style="font-size: 20px; font-weight: 600; color: white;">Total</span>' +
                '<span style="font-size: 24px; font-weight: 800; color: white;">$' + formatCurrency(payload.total) + '</span>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div style="display: flex; gap: 1rem; margin-top: 1.5rem;">' +
            '<button onclick="continueShopping()" style="' +
              'flex: 1; ' +
              'padding: 1rem 1.5rem; ' +
              'background: white; ' +
              'border: 2px solid #e9ecef; ' +
              'color: #6c757d; ' +
              'border-radius: 12px; ' +
              'cursor: pointer; ' +
              'font-size: 16px; ' +
              'font-weight: 600; ' +
              'transition: all 0.3s ease;' +
            '" onmouseover="this.style.background=\\\'#f8f9fa\\\'; this.style.borderColor=\\\'#dee2e6\\\'" onmouseout="this.style.background=\\\'white\\\'; this.style.borderColor=\\\'#e9ecef\\\'">← Continue Shopping</button>' +
            '<button onclick="finishSideOrder()" style="' +
              'flex: 2; ' +
              'padding: 1rem 1.5rem; ' +
              'background: linear-gradient(135deg, #28a745 0%, #34ce57 100%); ' +
              'border: 2px solid #28a745; ' +
              'color: white; ' +
              'border-radius: 12px; ' +
              'cursor: pointer; ' +
              'font-size: 16px; ' +
              'font-weight: 700; ' +
              'transition: all 0.3s ease; ' +
              'box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);' +
            '" onmouseover="this.style.transform=\\\'translateY(-2px)\\\'; this.style.boxShadow=\\\'0 6px 20px rgba(40, 167, 69, 0.4)\\\'" onmouseout="this.style.transform=\\\'none\\\'; this.style.boxShadow=\\\'0 4px 15px rgba(40, 167, 69, 0.3)\\\'">Add to Cart 🛒</button>' +
          '</div>';
      }

      function buildOrderPayload() {
        const variants = state.config?.variants || [];
        const items = Object.keys(state.quantities).map((variantId) => {
          const quantity = state.quantities[variantId];
          const variant = variants.find(v => v.id === variantId);
          if (!variant || quantity <= 0) return null;
          const unitPrice = getVariantPrice(variant);
          return {
            id: variant.id,
            name: variant.name || 'Side Option',
            quantity,
            unitPrice,
            total: unitPrice * quantity
          };
        }).filter(Boolean);

        const dipSelections = Object.keys(state.dips).map(dipId => {
          const dipData = (state.config?.dips || DEFAULT_DIPS).find(d => d.id === dipId);
          const quantity = state.dips[dipId];
          if (!dipData || quantity <= 0) return null;
          const price = typeof dipData.price === 'number' ? dipData.price : 0.75;
          return {
            id: dipData.id,
            name: dipData.name,
            quantity,
            unitPrice: price,
            total: price * quantity
          };
        }).filter(Boolean);

        const customizationEntries = [];
        if (state.config?.customization && state.config.customization.enabled) {
          const key = state.config.customization.stateKey || 'customOption';
          const selectedId = state.customization[key];
          const option = state.config.customization.options?.find(opt => opt.id === selectedId);
          if (option) {
            customizationEntries.push({ key, value: selectedId, label: option.summaryLabel || option.label });
          }
        }

        const subtotal = items.reduce((sum, item) => sum + item.total, 0) + dipSelections.reduce((sum, dip) => sum + dip.total, 0);

        return {
          sideKey: state.config?.sideKey || 'side',
          title: state.config?.modalTitle || 'Side',
          items,
          dips: dipSelections,
          customization: customizationEntries,
          total: subtotal
        };
      }

      function returnToInitialState() {
        state.steps = [];
        state.stepIndex = 0;
        state.quantities = {};
        state.dips = {};
        state.customization = {};
      }

      function updateButtons() {
        const backBtn = document.getElementById('sideModalBackBtn');
        const nextBtn = document.getElementById('sideModalNextBtn');
        const addBtn = document.getElementById('sideModalAddToCartBtn');
        if (backBtn) backBtn.style.display = state.stepIndex > 0 ? 'block' : 'none';

        const isFinalStep = state.stepIndex === state.steps.length - 1;
        if (nextBtn) nextBtn.style.display = isFinalStep ? 'none' : 'block';
        if (addBtn) addBtn.style.display = isFinalStep ? 'block' : 'none';

        if (nextBtn) {
          nextBtn.disabled = !canAdvance();
        }
      }

      function canAdvance() {
        const currentStep = state.steps[state.stepIndex];
        if (!currentStep) return true;
        if (currentStep.key === 'variants' && totalSelectedQuantity() === 0) return false;
        if (currentStep.key === 'customization' && currentStep.requiresCustomization) {
          const key = state.config?.customization?.stateKey || 'customOption';
          return Boolean(state.customization[key]);
        }
        return true;
      }

      function totalSelectedQuantity() {
        return Object.values(state.quantities).reduce((sum, qty) => sum + qty, 0);
      }

      function renderCurrentStep() {
        hideAllStepContainers();
        const currentStep = state.steps[state.stepIndex];
        if (!currentStep) return;
        const container = getStepContainer(currentStep.key);
        if (!container) return;
        container.classList.add('active');
        setModalHeaderTitles();
        updateProgress();
        switch (currentStep.key) {
          case 'variants':
            renderVariantsStep(document.getElementById('sideOptions'));
            break;
          case 'customization':
            renderCustomizationStep(document.getElementById('sideCustomizationContent'));
            break;
          case 'dips':
            renderDipsStep(document.getElementById('sideExtraDips'));
            break;
          case 'summary':
            renderSummaryStep(document.getElementById('sideOrderSummary'));
            break;
        }
        updateButtons();
      }

      window.openSidesModal = function(config) {
        try {
          if (!config || !Array.isArray(config.variants)) {
            console.error('openSidesModal requires a config with a variants array');
            return;
          }

          returnToInitialState();
          state.config = Object.assign({
            modalTitle: 'Choose Your Side',
            stepOrder: ['variants', 'dips', 'summary'],
            dipsEnabled: true,
            dips: DEFAULT_DIPS.slice()
          }, config);

          if (!Array.isArray(state.config.dips) || !state.config.dips.length) {
            state.config.dips = DEFAULT_DIPS.slice();
          }

          state.steps = buildStepDefinitions(state.config);
          ensureCustomizationDefaults(state.config);

          configureProgress(state.steps);
          const modal = document.getElementById('sidesModal');
          if (!modal) {
            console.error('sidesModal element not found in DOM');
            return;
          }
          modal.style.display = 'flex';
          document.body.style.overflow = 'hidden';

          renderCurrentStep();
        } catch (error) {
          console.error('openSidesModal failed', error);
        }
      };

      window.openSideModal = window.openSidesModal;

      window.closeSidesModal = function() {
        const modal = document.getElementById('sidesModal');
        if (modal) {
          modal.style.display = 'none';
        }
        document.body.style.overflow = 'auto';
      };

      window.navigateSideModalStep = function(direction) {
        if (!state.steps.length) return;
        if (direction > 0 && !canAdvance()) {
          alert('Please complete this step before continuing.');
          return;
        }

        state.stepIndex += direction;
        if (state.stepIndex < 0) state.stepIndex = 0;
        if (state.stepIndex > state.steps.length - 1) state.stepIndex = state.steps.length - 1;

        renderCurrentStep();
      };

      window.updateSideQuantity = function(variantId, delta) {
        const currentQuantity = state.quantities[variantId] || 0;
        const nextQuantity = Math.max(0, currentQuantity + delta);
        if (nextQuantity === 0) {
          delete state.quantities[variantId];
        } else {
          state.quantities[variantId] = nextQuantity;
        }
        if (state.steps[state.stepIndex]?.key === 'variants') {
          renderVariantsStep(document.getElementById('sideOptions'));
        }
        updateButtons();
      };

      window.adjustSideDipQuantity = function(dipId, delta) {
        const current = state.dips[dipId] || 0;
        const next = Math.max(0, Math.min(10, current + delta));
        if (next === 0) {
          delete state.dips[dipId];
        } else {
          state.dips[dipId] = next;
        }
        renderDipsStep(document.getElementById('sideExtraDips'));
      };

      window.skipSideDips = function() {
        state.dips = {};
        const nextStep = state.steps[state.stepIndex + 1];
        if (nextStep && nextStep.key === 'summary') {
          state.stepIndex += 1;
          renderCurrentStep();
        } else {
          renderDipsStep(document.getElementById('sideExtraDips'));
        }
      };

      window.setSideCustomizationOption = function(optionId) {
        if (!state.config || !state.config.customization) return;
        const key = state.config.customization.stateKey || 'customOption';
        state.customization[key] = optionId;
        renderCustomizationStep(document.getElementById('sideCustomizationContent'));
        updateButtons();
      };

      window.addSideOrderToCart = function() {
        const payload = buildOrderPayload();
        if (!payload.items.length) {
          alert('Please select at least one side before adding to cart.');
          return;
        }
        const submitHandlerName = state.config?.onSubmit;
        if (submitHandlerName && typeof window[submitHandlerName] === 'function') {
          try {
            window[submitHandlerName](payload);
          } catch (error) {
            console.error('Side modal submit handler failed', error);
          }
        } else {
          console.log('Side order payload:', payload);
          alert('Side added to cart! (Demo)');
        }
        closeSidesModal();
      };

      window.continueShopping = function() {
        closeSidesModal();
      };

      window.finishSideOrder = function() {
        addSideOrderToCart();
      };
    })();
  `;
}

module.exports = {
  generateSidesModalSharedJS
};
