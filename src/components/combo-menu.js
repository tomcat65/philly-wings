// Combo Menu Component - Loads combos from static JSON cache
export class ComboMenu {
  constructor() {
    this.container = document.getElementById('combo-menu-items');
    this.combos = [];
  }

  async init() {
    if (!this.container) return;

    try {
      // Load combos from CDN-cached JSON
      const response = await fetch(`/data/combos.json?v=${Date.now()}`, { cache: 'no-store' });
      if (!response.ok) throw new Error('Failed to load combos');

      this.combos = await response.json();
      this.render();
    } catch (error) {
      console.error('Error loading combos:', error);
      // Fallback to showing error message
      this.container.innerHTML = '<p class="error-message">Unable to load combos. Please refresh the page.</p>';
    }
  }

  render() {
    if (!this.combos.length) {
      this.container.innerHTML = '<p>No combos available at this time.</p>';
      return;
    }

    // Clear container
    this.container.innerHTML = '';

    // Render each combo
    this.combos.forEach(combo => {
      const card = this.createComboCard(combo);
      this.container.appendChild(card);
    });

    // Re-initialize zoom for dynamically loaded images
    if (typeof window.initFoodImageZoom === 'function') {
      setTimeout(() => window.initFoodImageZoom(), 100);
    }
  }

  createComboCard(combo) {
    const card = document.createElement('div');
    card.className = `menu-card${combo.featured ? ' featured' : ''}`;

    // Generate nutrition button ID based on combo ID
    const nutritionId = combo.id.replace('combo-', '');

    card.innerHTML = `
      <img src="${combo.imageUrl}"
           alt="${combo.name}"
           class="menu-card-img"
           loading="lazy">
      <div class="menu-card-content">
        <h3 class="menu-card-title">${combo.name}</h3>
        <p class="menu-card-desc">${combo.description}</p>
        ${combo.badges && combo.badges.length ?
          `<div class="combo-badges">${combo.badges.map(badge =>
            `<span class="badge">${badge}</span>`).join('')}</div>` : ''}
        <button class="nutrition-btn"
                onclick="window.nutritionModal.open('combos', '${nutritionId}')">
          📊 Nutrition Info
        </button>
        ${combo.featured ?
          '<span class="menu-card-price featured">Game Day Special</span>' :
          `<button class="menu-card-price"
                   onclick="document.getElementById('orderSection').scrollIntoView({behavior: 'smooth'}); return false;"
                   style="cursor: pointer; background: none; border: none; color: inherit; font: inherit;">
            ORDER ON APP
          </button>`}
      </div>
    `;

    return card;
  }

  // Method to refresh combos (can be called from admin panel)
  async refresh() {
    await this.init();
  }
}

// Initialize combo menu when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.comboMenu = new ComboMenu();
    window.comboMenu.init();
  });
} else {
  window.comboMenu = new ComboMenu();
  window.comboMenu.init();
}
