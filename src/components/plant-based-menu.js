/**
 * Plant-Based Wings Menu Component
 * Displays dual prep methods (fried/baked) with hero images
 */
import { getPlantBasedWings, getVariantsByPrepMethod } from '../services/plant-based-wings-service.js';

export class PlantBasedMenu {
  constructor() {
    this.container = document.getElementById('plant-based-container');
    this.wings = [];
  }

  async init() {
    if (!this.container) {
      console.warn('Plant-based wings container not found in DOM');
      return;
    }

    try {
      console.log('Loading plant-based wings from Firebase...');
      this.wings = await getPlantBasedWings();
      console.log(`Loaded ${this.wings.length} plant-based wing items`);
      this.render();
    } catch (error) {
      console.error('Error loading plant-based wings:', error);
      this.showErrorMessage();
    }
  }

  render() {
    if (!this.wings.length) {
      this.container.innerHTML = '<p class="no-items-message">No plant-based wings available at this time.</p>';
      return;
    }

    this.container.innerHTML = this.wings.map(wing => this.createDualPrepCard(wing)).join('');
  }

  createDualPrepCard(wing) {
    const friedImageUrl = wing.images?.fried || '';
    const bakedImageUrl = wing.images?.baked || '';

    // Group variants by prep method (only active variants)
    const friedVariants = getVariantsByPrepMethod(wing, 'fried').filter(v => v.active !== false);
    const bakedVariants = getVariantsByPrepMethod(wing, 'baked').filter(v => v.active !== false);

    const dietaryTags = (wing.dietaryTags || [])
      .map(tag => `<span class="tag tag-${tag}">${tag}</span>`)
      .join('');

    return `
      <div class="menu-item-card plant-based-card">
        <div class="item-header">
          <h3 class="item-name">${wing.name || 'Plant-Based Wings'}</h3>
          <p class="item-description">${wing.description || ''}</p>
          ${dietaryTags ? `<div class="dietary-tags">${dietaryTags}</div>` : ''}
        </div>

        <div class="dual-prep-methods">
          ${friedVariants.length > 0 ? this.createPrepMethodCard('fried', '🔥 Fried', friedImageUrl, friedVariants, wing.name) : ''}
          ${bakedVariants.length > 0 ? this.createPrepMethodCard('baked', '🌿 Baked', bakedImageUrl, bakedVariants, wing.name) : ''}
        </div>

        <button class="order-now-btn"
                onclick="document.getElementById('orderSection').scrollIntoView({behavior: 'smooth'})">
          ORDER NOW →
        </button>
      </div>
    `;
  }

  createPrepMethodCard(prepMethod, title, imageUrl, variants, wingName) {
    return `
      <div class="prep-method-card" data-prep="${prepMethod}">
        ${imageUrl ? `
          <picture>
            <source srcset="${imageUrl.replace('_800x800', '_1920x1080')}" media="(min-width: 768px)">
            <img src="${imageUrl}"
                 alt="${wingName} - ${prepMethod}"
                 class="prep-image"
                 loading="lazy">
          </picture>
        ` : ''}
        <div class="prep-content">
          <h4 class="prep-method-title">${title}</h4>
          <div class="variants-list">
            ${variants.map(v => `
              <div class="variant-row">
                <span class="variant-name">${v.name || `${v.count} pieces`}</span>
                <span class="variant-price-note">See app for pricing</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  showErrorMessage() {
    this.container.innerHTML = `
      <p class="error-message">
        Unable to load plant-based wings. Please refresh the page or try again later.
      </p>
    `;
  }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const plantBasedMenu = new PlantBasedMenu();
    plantBasedMenu.init();
  });
} else {
  const plantBasedMenu = new PlantBasedMenu();
  plantBasedMenu.init();
}
