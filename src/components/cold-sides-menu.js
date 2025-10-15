/**
 * Cold Sides Menu Component
 * Displays cold side items with weight info and supplier badges
 */
import { getColdSides } from '../services/cold-sides-service.js';

export class ColdSidesMenu {
  constructor() {
    this.container = document.getElementById('cold-sides-container');
    this.coldSides = [];
  }

  async init() {
    if (!this.container) {
      console.warn('Cold sides container not found in DOM');
      return;
    }

    try {
      console.log('Loading cold sides from Firebase...');
      this.coldSides = await getColdSides();
      console.log(`Loaded ${this.coldSides.length} cold side items`);
      this.render();
    } catch (error) {
      console.error('Error loading cold sides:', error);
      this.showErrorMessage();
    }
  }

  render() {
    if (!this.coldSides.length) {
      this.container.innerHTML = '<p class="no-items-message">No cold sides available at this time.</p>';
      return;
    }

    this.container.innerHTML = this.coldSides.map(side => this.createColdSideCard(side)).join('');
  }

  createColdSideCard(side) {
    const imageUrl = side.imageUrl || side.images?.card || '';
    const weight = side.weight || side.portionSize;
    const supplierClass = this.getSupplierClass(side.supplier);

    return `
      <div class="menu-card">
        ${imageUrl ? `
          <img src="${imageUrl}"
               alt="${side.name}"
               class="menu-card-img"
               loading="lazy">
        ` : ''}
        <div class="menu-card-content">
          <h3 class="menu-card-title">${side.name}</h3>
          <p class="menu-card-desc">${side.description || ''}</p>

          ${weight ? `<span class="weight-badge">${weight}</span>` : ''}
          ${side.supplier ? `<span class="supplier-badge ${supplierClass}">${side.supplier}</span>` : ''}

          ${side.variants && side.variants.length > 0 ? `
            <div class="variants-list" style="margin-top: 1rem;">
              ${side.variants.map(v => `
                <div class="variant-row">
                  <span class="variant-name">${v.name || (v.weight ? v.weight : 'Standard')}</span>
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

    if (normalized.includes('sysco')) {
      return 'supplier-sysco';
    }
    if (normalized.includes('garden') || normalized.includes('fresh')) {
      return 'supplier-garden-fresh';
    }

    return '';
  }

  showErrorMessage() {
    this.container.innerHTML = `
      <p class="error-message">
        Unable to load cold sides. Please refresh the page or try again later.
      </p>
    `;
  }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const coldSidesMenu = new ColdSidesMenu();
    coldSidesMenu.init();
  });
} else {
  const coldSidesMenu = new ColdSidesMenu();
  coldSidesMenu.init();
}
