// Sauce Menu Component - Loads sauces from Firebase
import { SauceService } from '../services/firebase-service';

export class SauceMenu {
  constructor() {
    this.dryRubsContainer = document.getElementById('dry-rubs-container');
    this.signaturesContainer = document.getElementById('signature-sauces-container');
    this.dippingContainer = document.getElementById('dipping-sauces-container');
    this.sauces = [];

    // Heat level labels and dots derived from heatLevel
    this.heatLabels = ["No Heat", "Mild", "Medium", "Hot", "Extra Hot", "INSANE"];
    this.heatDots = ["○○○○○", "🔥○○○○", "🔥🔥○○○", "🔥🔥🔥○○", "🔥🔥🔥🔥○", "🔥🔥🔥🔥🔥"];
  }

  async init() {
    if (!this.dryRubsContainer || !this.signaturesContainer || !this.dippingContainer) {
      console.warn('Sauce containers not found in DOM');
      return;
    }

    try {
      // Try Firebase first
      console.log('Loading sauces from Firebase...');
      this.sauces = await SauceService.getActiveSauces();
      console.log(`Loaded ${this.sauces.length} sauces from Firebase`);
    } catch (firebaseError) {
      console.warn('Firebase failed, falling back to static JSON:', firebaseError);
      
      try {
        // Fallback to static JSON
        const response = await fetch('/data/sauces.json', { cache: 'no-store' });
        if (!response.ok) throw new Error('Failed to load static JSON');
        
        const data = await response.json();
        this.sauces = data.sauces || [];
        console.log(`Loaded ${this.sauces.length} sauces from static JSON fallback`);
      } catch (staticError) {
        console.error('Both Firebase and static JSON failed:', staticError);
        this.showErrorMessage();
        return;
      }
    }

    // Derive display values from heat level
    this.sauces.forEach(sauce => {
      sauce.displayHeatLabel = this.heatLabels[sauce.heatLevel] || "Mild";
      sauce.displayHeatDots = this.heatDots[sauce.heatLevel] || "○○○○○";
    });

    this.renderByCategory();
  }

  renderByCategory() {
    // Group sauces by category
    const categories = {
      'dry-rub': [],
      'signature-sauce': [],
      'dipping-sauce': []
    };

    this.sauces.forEach(sauce => {
      if (categories[sauce.category]) {
        categories[sauce.category].push(sauce);
      }
    });

    // Sort each category by sortOrder
    Object.values(categories).forEach(sauces => {
      sauces.sort((a, b) => a.sortOrder - b.sortOrder);
    });

    // Render each section
    this.renderDryRubs(categories['dry-rub']);
    this.renderSignatures(categories['signature-sauce']);
    this.renderDipping(categories['dipping-sauce']);
  }

  renderDryRubs(sauces) {
    if (!sauces.length) {
      this.dryRubsContainer.innerHTML = '<p>No dry rubs available at this time.</p>';
      return;
    }

    this.dryRubsContainer.innerHTML = '';
    sauces.forEach(sauce => {
      const card = this.createSauceCard(sauce);
      this.dryRubsContainer.appendChild(card);
    });

    // Re-initialize zoom for dynamically loaded images
    if (typeof window.initFoodImageZoom === 'function') {
      setTimeout(() => window.initFoodImageZoom(), 100);
    }
  }

  renderSignatures(sauces) {
    if (!sauces.length) {
      this.signaturesContainer.innerHTML = '<p>No signature sauces available at this time.</p>';
      return;
    }

    this.signaturesContainer.innerHTML = '';
    sauces.forEach(sauce => {
      const card = this.createSauceCard(sauce);
      this.signaturesContainer.appendChild(card);
    });

    // Re-initialize zoom for dynamically loaded images
    if (typeof window.initFoodImageZoom === 'function') {
      setTimeout(() => window.initFoodImageZoom(), 100);
    }
  }

  renderDipping(sauces) {
    if (!sauces.length) {
      this.dippingContainer.innerHTML = '<p>No dipping sauces available at this time.</p>';
      return;
    }

    this.dippingContainer.innerHTML = '';
    sauces.forEach(sauce => {
      const card = this.createDippingCard(sauce);
      this.dippingContainer.appendChild(card);
    });
  }

  createSauceCard(sauce) {
    const card = document.createElement('div');
    card.className = `menu-card${sauce.featured ? ' featured' : ''}`;

    // Add allergen indicator if needed
    const allergenInfo = sauce.allergens && sauce.allergens.length > 0 ?
      `<div class="allergen-info" title="Contains: ${sauce.allergens.join(', ')}">ⓘ</div>` : '';

    // Add badges if present
    const badges = sauce.badges && sauce.badges.length > 0 ?
      `<div class="sauce-badges">${sauce.badges.map(badge =>
        `<span class="sauce-badge">${badge}</span>`).join('')}</div>` : '';

    card.innerHTML = `
      <img src="${sauce.imageUrl}"
           alt="${sauce.altText || sauce.name}"
           class="menu-card-img"
           loading="lazy">
      <div class="menu-card-content">
        <h3 class="menu-card-title">${sauce.name}</h3>
        <p class="menu-card-desc">${sauce.description}</p>
        ${badges}
        <div class="heat-indicator">
          <span class="heat-level">${sauce.displayHeatLabel}</span>
          <span class="heat-flames">${sauce.displayHeatDots}</span>
        </div>
        ${allergenInfo}
      </div>
    `;

    return card;
  }

  createDippingCard(sauce) {
    const card = document.createElement('div');
    card.className = 'dip-card';

    // Add allergen indicator for dipping sauces
    const allergenMark = sauce.allergens && sauce.allergens.length > 0 ?
      ` <span class="allergen-mark" title="Contains: ${sauce.allergens.join(', ')}">ⓘ</span>` : '';

    card.innerHTML = `
      <img src="${sauce.imageUrl}"
           alt="${sauce.altText || sauce.name}"
           class="dip-image"
           loading="lazy">
      <div class="dip-content">
        <h4>${sauce.name}${allergenMark}</h4>
        <p>${sauce.description}</p>
      </div>
    `;

    return card;
  }

  showErrorMessage() {
    const errorMsg = '<p class="error-message">Unable to load sauces. Please refresh the page.</p>';
    if (this.dryRubsContainer) this.dryRubsContainer.innerHTML = errorMsg;
    if (this.signaturesContainer) this.signaturesContainer.innerHTML = errorMsg;
    if (this.dippingContainer) this.dippingContainer.innerHTML = errorMsg;
  }

  // Method to refresh sauces (can be called from admin panel)
  async refresh() {
    await this.init();
  }

  // Method to get sauce by ID (useful for other components)
  getSauceById(sauceId) {
    return this.sauces.find(sauce => sauce.id === sauceId);
  }

  // Method to get sauces by category
  getSaucesByCategory(category) {
    return this.sauces.filter(sauce => sauce.category === category);
  }
}

// Initialize sauce menu when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.sauceMenu = new SauceMenu();
    window.sauceMenu.init();
  });
} else {
  window.sauceMenu = new SauceMenu();
  window.sauceMenu.init();
}// Firebase-first sauce loading deployed Sun Oct  5 20:03:16 CDT 2025
