/**
 * Desserts Menu Component
 * Displays dessert items with supplier badges and thaw time
 */
import { getDesserts, requiresThawing } from '../services/desserts-service.js';

export class DessertsMenu {
  constructor() {
    this.container = document.getElementById('desserts-container');
    this.desserts = [];
  }

  async init() {
    if (!this.container) {
      console.warn('Desserts container not found in DOM');
      return;
    }

    try {
      console.log('Loading desserts from Firebase...');
      this.desserts = await getDesserts();
      console.log(`Loaded ${this.desserts.length} dessert items`);
      this.render();
    } catch (error) {
      console.error('Error loading desserts:', error);
      this.showErrorMessage();
    }
  }

  render() {
    if (!this.desserts.length) {
      this.container.innerHTML = '<p class="no-items-message">No desserts available at this time.</p>';
      return;
    }

    this.container.innerHTML = this.desserts.map(dessert => this.createDessertCard(dessert)).join('');
  }

  createDessertCard(dessert) {
    const imageUrl = dessert.imageUrl || dessert.images?.card || '';
    const supplierClass = this.getSupplierClass(dessert.supplier);
    const needsThawing = requiresThawing(dessert);

    // Filter to individual portions only (count: 1)
    const individualPortions = (dessert.variants || []).filter(v => v.count === 1);

    return `
      <div class="menu-card">
        ${imageUrl ? `
          <img src="${imageUrl}"
               alt="${dessert.name}"
               class="menu-card-img"
               loading="lazy">
        ` : ''}
        <div class="menu-card-content">
          <h3 class="menu-card-title">${dessert.name}</h3>
          <p class="menu-card-desc">${dessert.description || ''}</p>

          ${dessert.supplier ? `<span class="supplier-badge ${supplierClass}">${dessert.supplier}</span>` : ''}
          ${needsThawing ? `<span class="thaw-time-badge">Thaw Time: ${dessert.thawTime}</span>` : ''}

          ${individualPortions.length > 0 ? `
            <div class="variants-list" style="margin-top: 1rem;">
              ${individualPortions.map(v => `
                <div class="variant-row">
                  <span class="variant-name">${v.name || 'Individual Portion'}</span>
                  <span class="variant-price-note">See app for pricing</span>
                </div>
              `).join('')}
            </div>
          ` : ''}

          <button class="menu-card-price"
                  onclick="document.getElementById('orderSection').scrollIntoView({behavior: 'smooth'}); return false;"
                  style="cursor: pointer; background: none; border: none; color: inherit; font: inherit; margin-top: 1rem; padding: 0.75rem 1.5rem; background: #004c54; color: #fff; border-radius: 8px; font-weight: 700; width: 100%;">
            ORDER ON APP
          </button>
        </div>
      </div>
    `;
  }

  getSupplierClass(supplier) {
    if (!supplier) return '';

    const normalized = supplier.toLowerCase().replace(/[^a-z]/g, '');

    if (normalized.includes('daisys') || normalized.includes('daisy')) {
      return 'supplier-daisys';
    }
    if (normalized.includes('chefs') || normalized.includes('chef')) {
      return 'supplier-chefs-quality';
    }
    if (normalized.includes('bindi')) {
      return 'supplier-bindi';
    }

    return '';
  }

  showErrorMessage() {
    this.container.innerHTML = `
      <p class="error-message">
        Unable to load desserts. Please refresh the page or try again later.
      </p>
    `;
  }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const dessertsMenu = new DessertsMenu();
    dessertsMenu.init();
  });
} else {
  const dessertsMenu = new DessertsMenu();
  dessertsMenu.init();
}
