/**
 * Edit Modal Framework
 * Reusable modal for inline editing without navigation
 * Uses draft pattern from cateringStateService
 */

import { cateringStateService } from '../../services/catering-state-service.js';

/**
 * Open edit modal for a specific section
 * @param {string} flowType - 'boxed-meals' | 'guided-planner'
 * @param {string} section - Section identifier (e.g., 'box-config', 'contact', 'extras')
 * @param {Object} options - { title, renderContent, onApply, onCancel }
 */
export function openEditModal(flowType, section, options = {}) {
  const {
    title = 'Edit',
    renderContent,
    onApply,
    onCancel,
    validateBeforeApply
  } = options;

  // Create draft from current state
  const draft = cateringStateService.createDraft(flowType);

  // Create modal overlay
  const modal = document.createElement('div');
  modal.className = 'edit-modal-overlay';
  modal.innerHTML = `
    <div class="edit-modal-container">
      <div class="edit-modal-header">
        <h2 class="edit-modal-title">${title}</h2>
        <button class="edit-modal-close" aria-label="Close">×</button>
      </div>

      <div class="edit-modal-body" id="edit-modal-content-${section}">
        <!-- Content will be injected here -->
      </div>

      <div class="edit-modal-footer">
        <button class="btn-secondary edit-modal-cancel">Cancel</button>
        <button class="btn-primary edit-modal-apply">Apply Changes</button>
      </div>
    </div>
  `;

  // Append to body
  document.body.appendChild(modal);

  // Get content container
  const contentContainer = modal.querySelector(`#edit-modal-content-${section}`);

  // Render section-specific content
  if (renderContent) {
    renderContent(contentContainer, draft, (updates) => {
      // Update draft when content changes
      cateringStateService.updateDraft(flowType, updates);
    });
  }

  // Wire up event handlers
  const closeBtn = modal.querySelector('.edit-modal-close');
  const cancelBtn = modal.querySelector('.edit-modal-cancel');
  const applyBtn = modal.querySelector('.edit-modal-apply');

  // Close handler
  const handleClose = () => {
    // Discard draft
    cateringStateService.discardDraft(flowType);

    // Call onCancel callback if provided
    if (onCancel) {
      onCancel();
    }

    // Remove modal
    modal.remove();
  };

  // Apply handler
  const handleApply = async () => {
    // Validate if validator provided
    if (validateBeforeApply) {
      const validation = validateBeforeApply(cateringStateService.getDraft(flowType));
      if (!validation.isValid) {
        alert('Please fix the following errors:\n\n' + validation.errors.join('\n'));
        return;
      }
    }

    // Apply draft to main state
    const result = await cateringStateService.applyDraft(flowType, section);

    if (!result.isValid) {
      alert('Validation failed:\n\n' + result.errors.join('\n'));
      return;
    }

    // Call onApply callback if provided
    if (onApply) {
      await onApply(cateringStateService.getState(flowType));
    }

    // Remove modal
    modal.remove();
  };

  // Event listeners
  closeBtn.addEventListener('click', handleClose);
  cancelBtn.addEventListener('click', handleClose);
  applyBtn.addEventListener('click', handleApply);

  // Close on overlay click (outside modal)
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      handleClose();
    }
  });

  // Close on Escape key
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      handleClose();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);

  return {
    close: handleClose,
    getDraft: () => cateringStateService.getDraft(flowType),
    updateDraft: (updates) => cateringStateService.updateDraft(flowType, updates)
  };
}

/**
 * Render box configuration in modal for boxed meals
 * @param {HTMLElement} container - Container element
 * @param {Object} draft - Draft state
 * @param {Function} onUpdate - Callback when draft updates
 */
export function renderBoxConfigInModal(container, draft, onUpdate) {
  const { currentConfig, boxCount } = draft;

  container.innerHTML = `
    <div class="modal-config-section">
      <h3>Box Configuration</h3>

      <div class="config-field">
        <label class="config-label">Number of Boxes</label>
        <div class="box-count-controls">
          <button class="box-count-btn" data-count="10">10 Boxes</button>
          <button class="box-count-btn" data-count="15">15 Boxes</button>
          <button class="box-count-btn" data-count="20">20 Boxes</button>
          <button class="box-count-btn" data-count="25">25 Boxes</button>
          <div class="custom-box-count">
            <input
              type="number"
              id="modal-custom-box-count"
              class="form-input"
              placeholder="Custom"
              min="10"
              step="1"
              value="${boxCount > 25 ? boxCount : ''}">
            <span class="custom-label">Custom Amount</span>
          </div>
        </div>
      </div>

      <div class="config-field">
        <label class="config-label">Wing Count Per Box</label>
        <div class="wing-count-selector" id="modal-wing-count-selector">
          <button class="wing-count-option ${currentConfig.wingCount === 6 ? 'active' : ''}" data-count="6">
            <span class="count">6</span> Wings
          </button>
          <button class="wing-count-option ${currentConfig.wingCount === 10 ? 'active' : ''}" data-count="10">
            <span class="count">10</span> Wings
          </button>
          <button class="wing-count-option ${currentConfig.wingCount === 12 ? 'active' : ''}" data-count="12">
            <span class="count">12</span> Wings
          </button>
        </div>
      </div>

      <div class="config-summary">
        <p><strong>Total Wings:</strong> <span id="modal-total-wings">${boxCount * currentConfig.wingCount}</span></p>
      </div>
    </div>
  `;

  // Wire up interactions
  const boxCountBtns = container.querySelectorAll('.box-count-btn');
  const customInput = container.getElementById('modal-custom-box-count');
  const wingCountBtns = container.querySelectorAll('.wing-count-option');
  const totalWingsSpan = container.getElementById('modal-total-wings');

  // Update total wings display
  const updateTotalWings = () => {
    const currentDraft = cateringStateService.getDraft('boxed-meals');
    const total = currentDraft.boxCount * currentDraft.currentConfig.wingCount;
    totalWingsSpan.textContent = total;
  };

  // Box count buttons
  boxCountBtns.forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.dataset.count) === boxCount);

    btn.addEventListener('click', () => {
      const count = parseInt(btn.dataset.count);

      // Update button states
      boxCountBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      customInput.value = '';

      // Update draft
      onUpdate({ boxCount: count });
      updateTotalWings();
    });
  });

  // Custom box count
  customInput.addEventListener('blur', () => {
    const value = parseInt(customInput.value);
    if (value && value >= 10) {
      boxCountBtns.forEach(b => b.classList.remove('active'));
      onUpdate({ boxCount: value });
      updateTotalWings();
    }
  });

  // Wing count buttons
  wingCountBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const count = parseInt(btn.dataset.count);

      // Update button states
      wingCountBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Update draft
      onUpdate({
        currentConfig: {
          ...cateringStateService.getDraft('boxed-meals').currentConfig,
          wingCount: count
        }
      });
      updateTotalWings();
    });
  });
}

/**
 * Render contact form in modal
 * @param {HTMLElement} container - Container element
 * @param {Object} draft - Draft state
 * @param {Function} onUpdate - Callback when draft updates
 */
export async function renderContactInModal(container, draft, onUpdate) {
  // Import and render the shared contact form
  try {
    const { renderContactForm, initContactFormInteractions, collectContactData } = await import('./contact-form.js');

    // Render the contact form with current draft data
    container.innerHTML = `
      <div class="modal-contact-section">
        ${renderContactForm(draft.contact)}
      </div>
    `;

    // Initialize interactions (date validation, billing address toggle, etc.)
    initContactFormInteractions();

    // Update draft on any input change
    const inputs = container.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      input.addEventListener('input', () => {
        const contactData = collectContactData();
        onUpdate({ contact: contactData });
      });

      input.addEventListener('change', () => {
        const contactData = collectContactData();
        onUpdate({ contact: contactData });
      });
    });
  } catch (error) {
    console.error('Error loading contact form:', error);
    container.innerHTML = `
      <p style="color: #d94b1e; text-align: center; padding: 20px;">
        Unable to load contact form. Please try again.
      </p>
    `;
  }
}

/**
 * Render extras/add-ons in modal
 * @param {HTMLElement} container - Container element
 * @param {Object} draft - Draft state
 * @param {Function} onUpdate - Callback when draft updates
 */
export async function renderExtrasInModal(container, draft, onUpdate) {
  const { extras } = draft;

  container.innerHTML = `
    <div class="modal-extras-section">
      <h3>Order Extras</h3>
      <p class="extras-subtitle">Add or remove items to complement your boxes</p>

      <div id="modal-extras-content">
        <p class="loading-text">Loading add-ons...</p>
      </div>
    </div>
  `;

  // Load add-ons dynamically
  try {
    // Import the catering add-ons service
    const { getAllAddOnsSplitByCategory } = await import('../../services/catering-addons-service.js');
    const addOns = await getAllAddOnsSplitByCategory();

    // Render extras by category
    renderExtrasContent(container.querySelector('#modal-extras-content'), addOns, extras, onUpdate);
  } catch (error) {
    console.error('Error loading add-ons:', error);
    container.querySelector('#modal-extras-content').innerHTML = `
      <p style="color: #d94b1e; text-align: center; padding: 20px;">
        Unable to load add-ons. Please try again.
      </p>
    `;
  }
}

/**
 * Render extras content with add/remove functionality
 */
function renderExtrasContent(container, addOns, currentExtras, onUpdate) {
  const categories = [
    { key: 'beverages', label: 'Cold Beverages', items: addOns.beverages || [] },
    { key: 'hotBeverages', label: 'Hot Beverages', items: addOns.hotBeverages || [] },
    { key: 'salads', label: 'Fresh Salads', items: addOns.salads || [] },
    { key: 'sides', label: 'Premium Sides', items: addOns.sides || [] },
    { key: 'desserts', label: 'Desserts', items: addOns.desserts || [] },
    { key: 'quickAdds', label: 'Quick Add-Ons', items: addOns.quickAdds || [] }
  ];

  const html = categories
    .filter(cat => cat.items.length > 0)
    .map(category => {
      const categoryItems = currentExtras[category.key] || [];

      return `
        <div class="modal-category-section">
          <h4 class="modal-category-title">${category.label}</h4>
          <div class="modal-extras-grid">
            ${category.items.map(item => {
              const existingItem = categoryItems.find(e => e.id === item.id);
              const quantity = existingItem ? existingItem.quantity : 0;

              return `
                <div class="modal-extra-card ${quantity > 0 ? 'selected' : ''}" data-item-id="${item.id}" data-category="${category.key}">
                  ${item.imageUrl ? `<img src="${item.imageUrl}" alt="${item.name}" class="extra-img">` : ''}
                  <div class="extra-info">
                    <div class="extra-name">${item.name}</div>
                    <div class="extra-price">$${item.price.toFixed(2)}</div>
                  </div>
                  <div class="extra-controls">
                    ${quantity > 0 ? `
                      <button class="qty-btn minus" data-action="decrease">−</button>
                      <span class="qty-display">${quantity}</span>
                      <button class="qty-btn plus" data-action="increase">+</button>
                    ` : `
                      <button class="btn-add-extra" data-action="add">Add</button>
                    `}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }).join('');

  container.innerHTML = html || '<p style="color: #999; text-align: center; padding: 20px;">No add-ons available</p>';

  // Wire up controls
  container.querySelectorAll('.modal-extra-card').forEach(card => {
    const itemId = card.dataset.itemId;
    const category = card.dataset.category;

    const addBtn = card.querySelector('[data-action="add"]');
    const minusBtn = card.querySelector('[data-action="decrease"]');
    const plusBtn = card.querySelector('[data-action="increase"]');

    if (addBtn) {
      addBtn.addEventListener('click', () => {
        updateExtraQuantity(itemId, category, 1, addOns, currentExtras, onUpdate);
        // Re-render to show quantity controls
        renderExtrasContent(container, addOns, cateringStateService.getDraft('boxed-meals').extras, onUpdate);
      });
    }

    if (minusBtn) {
      minusBtn.addEventListener('click', () => {
        const currentQty = getCurrentQuantity(itemId, category, currentExtras);
        updateExtraQuantity(itemId, category, Math.max(0, currentQty - 1), addOns, currentExtras, onUpdate);
        renderExtrasContent(container, addOns, cateringStateService.getDraft('boxed-meals').extras, onUpdate);
      });
    }

    if (plusBtn) {
      plusBtn.addEventListener('click', () => {
        const currentQty = getCurrentQuantity(itemId, category, currentExtras);
        updateExtraQuantity(itemId, category, currentQty + 1, addOns, currentExtras, onUpdate);
        renderExtrasContent(container, addOns, cateringStateService.getDraft('boxed-meals').extras, onUpdate);
      });
    }
  });
}

/**
 * Get current quantity of an extra item
 */
function getCurrentQuantity(itemId, category, extras) {
  const categoryItems = extras[category] || [];
  const item = categoryItems.find(e => e.id === itemId);
  return item ? item.quantity : 0;
}

/**
 * Update extra item quantity in draft
 */
function updateExtraQuantity(itemId, category, newQuantity, addOns, currentExtras, onUpdate) {
  const categoryKey = category;
  const categoryItems = [...(currentExtras[categoryKey] || [])];

  // Find the item details from addOns
  const allCategoryItems = addOns[categoryKey] || [];
  const itemDetails = allCategoryItems.find(item => item.id === itemId);

  if (!itemDetails) return;

  // Update or add item
  const existingIndex = categoryItems.findIndex(e => e.id === itemId);

  if (newQuantity === 0) {
    // Remove item
    if (existingIndex !== -1) {
      categoryItems.splice(existingIndex, 1);
    }
  } else if (existingIndex !== -1) {
    // Update existing
    categoryItems[existingIndex].quantity = newQuantity;
  } else {
    // Add new
    categoryItems.push({
      id: itemId,
      name: itemDetails.name,
      price: itemDetails.price,
      quantity: newQuantity
    });
  }

  // Update draft
  onUpdate({
    extras: {
      ...currentExtras,
      [categoryKey]: categoryItems
    }
  });
}
