/**
 * Fresh Salads Menu Component
 * Displays salad items with serving size and ingredient details
 */
import { getSalads } from '../services/salads-service.js';

export class SaladsMenu {
  constructor() {
    this.container = document.getElementById('salads-container');
    this.salads = [];
  }

  async init() {
    if (!this.container) {
      console.warn('Salads container not found in DOM');
      return;
    }

    try {
      console.log('Loading salads from Firebase...');
      this.salads = await getSalads();
      console.log(`Loaded ${this.salads.length} salad items`);
      this.render();
    } catch (error) {
      console.error('Error loading salads:', error);
      this.showErrorMessage();
    }
  }

  render() {
    if (!this.salads.length) {
      this.container.innerHTML = '<p class="no-items-message">No salads available at this time.</p>';
      return;
    }

    this.container.innerHTML = this.salads.map(salad => this.createSaladCard(salad)).join('');
  }

  createSaladCard(salad) {
    const imageUrl = salad.imageUrl || salad.images?.card || '';
    const servingSize = salad.servingSize || salad.serves;

    return `
      <div class="menu-card">
        ${imageUrl ? `
          <img src="${imageUrl}"
               alt="${salad.name}"
               class="menu-card-img"
               loading="lazy">
        ` : ''}
        <div class="menu-card-content">
          <h3 class="menu-card-title">${salad.name}</h3>
          <p class="menu-card-desc">${salad.description || ''}</p>

          ${servingSize ? `<span class="serving-size-badge">Serves ${servingSize}</span>` : ''}

          ${salad.dressingOptions && salad.dressingOptions.length > 0 ? `
            <p style="margin-top: 0.75rem; font-size: 0.875rem; color: #666;">
              <strong>Dressings:</strong> ${salad.dressingOptions.join(', ')}
            </p>
          ` : ''}

          ${salad.variants && salad.variants.length > 0 ? `
            <div class="variants-list" style="margin-top: 1rem;">
              ${salad.variants.map(v => `
                <div class="variant-row">
                  <span class="variant-name">${v.name || `Serves ${v.serves || servingSize}`}</span>
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

  showErrorMessage() {
    this.container.innerHTML = `
      <p class="error-message">
        Unable to load salads. Please refresh the page or try again later.
      </p>
    `;
  }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const saladsMenu = new SaladsMenu();
    saladsMenu.init();
  });
} else {
  const saladsMenu = new SaladsMenu();
  saladsMenu.init();
}
