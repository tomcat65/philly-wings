/**
 * Photo Card Selector Component
 * Visual card-based selectors for wings, sauces, sides, desserts
 * Replaces basic dropdowns with appetite-appealing thumbnails
 */

/**
 * Render photo card selector for any category
 */
export function renderPhotoCardSelector(options) {
  const {
    category,      // 'wings' | 'sauces' | 'sides' | 'desserts'
    items,         // Array of items to display
    selectedId,    // Currently selected item ID
    multiSelect = false,
    maxSelections = null,
    onSelect       // Callback function
  } = options;

  return `
    <div class="photo-card-selector" data-category="${category}">
      <div class="card-selector-header">
        <h4 class="selector-title">${getCategoryTitle(category)}</h4>
        <p class="selector-subtitle">${getCategorySubtitle(category, multiSelect, maxSelections)}</p>
      </div>

      <div class="photo-cards-grid ${getGridClass(category)}">
        ${items.map(item => renderPhotoCard(item, category, selectedId, multiSelect)).join('')}
      </div>
    </div>
  `;
}

/**
 * Render individual photo card
 */
function renderPhotoCard(item, category, selectedId, multiSelect) {
  const isSelected = multiSelect
    ? selectedId?.includes(item.id)
    : selectedId === item.id;

  return `
    <div class="photo-card ${isSelected ? 'card-selected' : ''} ${item.isSpecial ? 'card-special' : ''}"
         data-item-id="${item.id}"
         data-category="${category}"
         role="${multiSelect ? 'checkbox' : 'radio'}"
         aria-checked="${isSelected}"
         tabindex="0">

      <div class="photo-card-image">
        <img
          src="${getItemImage(item, category)}"
          alt="${item.name}"
          loading="lazy"
          class="card-img">

        ${isSelected ? `
          <div class="card-selected-overlay">
            <span class="selected-check">✓</span>
          </div>
        ` : ''}

        ${item.badge ? `
          <span class="card-badge">${item.badge}</span>
        ` : ''}

        ${item.heatLevel ? `
          <span class="card-heat-indicator">
            ${'🌶️'.repeat(item.heatLevel)}
          </span>
        ` : ''}
      </div>

      <div class="photo-card-content">
        <h5 class="card-title">${item.name}</h5>

        ${item.description ? `
          <p class="card-description">${item.description}</p>
        ` : ''}

        ${item.tags?.length ? `
          <div class="card-tags">
            ${item.tags.slice(0, 2).map(tag => `
              <span class="card-tag">${tag}</span>
            `).join('')}
          </div>
        ` : ''}

        ${item.price ? `
          <span class="card-price">+$${item.price.toFixed(2)}</span>
        ` : ''}
      </div>
    </div>
  `;
}

/**
 * Initialize card selector interactions
 */
export function initPhotoCardSelector(category, multiSelect, maxSelections, onSelect) {
  const cards = document.querySelectorAll(`.photo-card[data-category="${category}"]`);

  cards.forEach(card => {
    // Click handler
    card.addEventListener('click', () => {
      handleCardSelection(card, category, multiSelect, maxSelections, onSelect);
    });

    // Keyboard handler
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleCardSelection(card, category, multiSelect, maxSelections, onSelect);
      }
    });
  });
}

/**
 * Handle card selection logic
 */
function handleCardSelection(card, category, multiSelect, maxSelections, onSelect) {
  const itemId = card.dataset.itemId;
  const isSelected = card.classList.contains('card-selected');

  if (multiSelect) {
    // Multi-select logic
    const selectedCards = document.querySelectorAll(`.photo-card[data-category="${category}"].card-selected`);

    if (isSelected) {
      // Deselect
      card.classList.remove('card-selected');
      card.setAttribute('aria-checked', 'false');
    } else {
      // Check if we can select more
      if (maxSelections && selectedCards.length >= maxSelections) {
        // Show validation message
        showValidationMessage(category, `Maximum ${maxSelections} selections allowed`);
        return;
      }

      card.classList.add('card-selected');
      card.setAttribute('aria-checked', 'true');
    }

    // Get all selected IDs
    const allSelected = Array.from(
      document.querySelectorAll(`.photo-card[data-category="${category}"].card-selected`)
    ).map(c => c.dataset.itemId);

    onSelect(allSelected);

  } else {
    // Single-select logic
    const allCards = document.querySelectorAll(`.photo-card[data-category="${category}"]`);

    // Deselect all
    allCards.forEach(c => {
      c.classList.remove('card-selected');
      c.setAttribute('aria-checked', 'false');
    });

    // Select clicked card
    card.classList.add('card-selected');
    card.setAttribute('aria-checked', 'true');

    onSelect(itemId);
  }

  // Add animation
  card.classList.add('card-clicked');
  setTimeout(() => card.classList.remove('card-clicked'), 300);
}

/**
 * Show validation message
 */
function showValidationMessage(category, message) {
  const selector = document.querySelector(`.photo-card-selector[data-category="${category}"]`);
  if (!selector) return;

  // Remove existing message
  const existing = selector.querySelector('.selector-validation');
  if (existing) existing.remove();

  // Add new message
  const validationEl = document.createElement('div');
  validationEl.className = 'selector-validation';
  validationEl.textContent = message;
  validationEl.setAttribute('role', 'alert');

  selector.querySelector('.card-selector-header').appendChild(validationEl);

  // Auto-remove after 3 seconds
  setTimeout(() => validationEl.remove(), 3000);
}

// ========================================
// Counter-Based Dip Selector
// ========================================

/**
 * Render dip selector with counters - Chip/Badge Style (allows 2x same dip)
 */
export function renderDipCounterSelector(options) {
  const {
    items,         // Array of dip items
    selectedCounts = {},  // Object: { 'ranch': 1, 'blue-cheese': 1 }
    maxTotal = 2,  // Total dips allowed
    onCountChange  // Callback: (dipCounts) => void
  } = options;

  const totalSelected = Object.values(selectedCounts).reduce((sum, count) => sum + count, 0);

  return `
    <div class="dip-counter-selector">
      <div class="card-selector-header">
        <div>
          <h4 class="selector-title">🥣 Select Dips</h4>
          <p class="selector-subtitle">Select ${maxTotal} total (can choose same dip multiple times)</p>
        </div>
        <div class="dip-total-counter ${totalSelected === maxTotal ? 'counter-complete' : ''}">
          <span class="counter-value">${totalSelected} / ${maxTotal}</span>
        </div>
      </div>

      <div class="dip-counter-grid">
        ${items.map(item => renderDipCounterCard(item, selectedCounts[item.id] || 0, totalSelected, maxTotal)).join('')}
      </div>
    </div>
  `;
}

/**
 * Render individual dip card - Chip/Badge Style (no images)
 */
function renderDipCounterCard(item, count, totalSelected, maxTotal) {
  const canIncrement = totalSelected < maxTotal;
  const canDecrement = count > 0;

  return `
    <div class="dip-counter-card ${count > 0 ? 'has-selection' : ''}" data-dip-id="${item.id}">
      <span class="dip-card-icon">🥣</span>
      <span class="dip-card-name">${item.name}</span>

      <div class="dip-counter-controls">
        <button
          class="btn-dip-decrement ${!canDecrement ? 'disabled' : ''}"
          data-dip-id="${item.id}"
          aria-label="Remove one ${item.name}"
          ${!canDecrement ? 'disabled' : ''}>
          −
        </button>

        <span class="dip-count-display" aria-live="polite">
          ${count}
        </span>

        <button
          class="btn-dip-increment ${!canIncrement ? 'disabled' : ''}"
          data-dip-id="${item.id}"
          aria-label="Add one ${item.name}"
          ${!canIncrement ? 'disabled' : ''}>
          +
        </button>
      </div>
    </div>
  `;
}

/**
 * Initialize dip counter interactions
 */
export function initDipCounterSelector(maxTotal, onCountChange) {
  const incrementBtns = document.querySelectorAll('.btn-dip-increment');
  const decrementBtns = document.querySelectorAll('.btn-dip-decrement');

  // Track current counts
  let dipCounts = {};

  // Initialize from current display
  document.querySelectorAll('.dip-counter-card').forEach(card => {
    const dipId = card.dataset.dipId;
    const countDisplay = card.querySelector('.dip-count-display');
    dipCounts[dipId] = parseInt(countDisplay.textContent) || 0;
  });

  // Increment handlers
  incrementBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.disabled) return;

      const dipId = btn.dataset.dipId;
      const totalSelected = Object.values(dipCounts).reduce((sum, count) => sum + count, 0);

      if (totalSelected < maxTotal) {
        dipCounts[dipId] = (dipCounts[dipId] || 0) + 1;
        updateDipCounterDisplay(dipCounts, maxTotal, onCountChange);
      }
    });
  });

  // Decrement handlers
  decrementBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.disabled) return;

      const dipId = btn.dataset.dipId;

      if (dipCounts[dipId] > 0) {
        dipCounts[dipId]--;
        updateDipCounterDisplay(dipCounts, maxTotal, onCountChange);
      }
    });
  });
}

/**
 * Update dip counter display after count change
 */
function updateDipCounterDisplay(dipCounts, maxTotal, onCountChange) {
  const totalSelected = Object.values(dipCounts).reduce((sum, count) => sum + count, 0);

  // Update each card
  document.querySelectorAll('.dip-counter-card').forEach(card => {
    const dipId = card.dataset.dipId;
    const count = dipCounts[dipId] || 0;

    // Update count display
    const countDisplay = card.querySelector('.dip-count-display');
    if (countDisplay) countDisplay.textContent = count;

    // Update card styling
    card.classList.toggle('has-selection', count > 0);

    // Update buttons
    const incrementBtn = card.querySelector('.btn-dip-increment');
    const decrementBtn = card.querySelector('.btn-dip-decrement');

    if (incrementBtn) {
      const canIncrement = totalSelected < maxTotal;
      incrementBtn.disabled = !canIncrement;
      incrementBtn.classList.toggle('disabled', !canIncrement);
    }

    if (decrementBtn) {
      const canDecrement = count > 0;
      decrementBtn.disabled = !canDecrement;
      decrementBtn.classList.toggle('disabled', !canDecrement);
    }
  });

  // Update total counter
  const totalCounter = document.querySelector('.dip-total-counter');
  if (totalCounter) {
    const counterValue = totalCounter.querySelector('.counter-value');
    if (counterValue) counterValue.textContent = `${totalSelected} / ${maxTotal}`;

    totalCounter.classList.toggle('counter-complete', totalSelected === maxTotal);
  }

  // Callback with updated counts
  if (onCountChange) {
    // Convert to array format: ['ranch', 'blue-cheese'] for 1 ranch + 1 blue cheese
    // or ['ranch', 'ranch'] for 2 ranch
    const dipArray = [];
    Object.entries(dipCounts).forEach(([dipId, count]) => {
      for (let i = 0; i < count; i++) {
        dipArray.push(dipId);
      }
    });
    onCountChange(dipArray, dipCounts);
  }
}

// ========================================
// Configuration Helpers
// ========================================

function getCategoryTitle(category) {
  const titles = {
    'wings': '🍗 Choose Your Wings',
    'sauces': '🌶️ Pick Your Sauce',
    'dips': '🥣 Select Dips',
    'sides': '🥗 Choose a Side',
    'desserts': '🍰 Pick Your Dessert'
  };
  return titles[category] || category;
}

function getCategorySubtitle(category, multiSelect, maxSelections) {
  if (multiSelect && maxSelections) {
    return `Select exactly ${maxSelections}`;
  }
  if (multiSelect) {
    return 'Select all that apply';
  }
  return 'Choose one option';
}

function getGridClass(category) {
  // Different grid layouts for different categories
  const gridClasses = {
    'wings': 'grid-3-col',      // 3 wing types
    'sauces': 'grid-4-col',     // Many sauces
    'dips': 'grid-3-col',       // 3 dip options
    'sides': 'grid-3-col',      // 3 side options
    'desserts': 'grid-4-col'    // Multiple desserts
  };
  return gridClasses[category] || 'grid-3-col';
}

function getItemImage(item, category) {
  // Use Firebase Storage URLs when available
  // For now, placeholder with item-specific text
  if (item.imageUrl) return item.imageUrl;

  const colors = {
    'wings': 'ff6b35',
    'sauces': 'f05545',
    'dips': '4ecdc4',
    'sides': '95e1d3',
    'desserts': 'f38181'
  };

  return `https://placehold.co/300x200/${colors[category] || 'cccccc'}/white?text=${encodeURIComponent(item.name)}`;
}

/**
 * Preset configurations for common categories
 */
export const PHOTO_SELECTOR_CONFIGS = {
  wings: {
    category: 'wings',
    multiSelect: false,
    items: [
      {
        id: 'boneless',
        name: 'Boneless Wings',
        description: 'Tender all-white meat',
        tags: ['Popular', 'Easy to eat'],
        imageUrl: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Fphilly-classic-hot_1920x1080.webp?alt=media&token=1d0f025d-9893-45e7-8df1-7899562b92ee'
      },
      {
        id: 'bone-in',
        name: 'Bone-In Wings',
        description: 'Traditional authentic',
        tags: ['Classic', 'More flavor'],
        price: 1.50,
        imageUrl: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Fbroad-pattison-burn_1920x1080.webp?alt=media&token=0efd0118-108e-4207-85da-4d3fe32b8e58'
      },
      {
        id: 'plant-based',
        name: 'Plant-Based',
        description: 'Cauliflower wings',
        tags: ['Vegetarian', 'Crispy'],
        price: 2.00,
        badge: 'New',
        imageUrl: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Fcauliflower-fried_1920x1080.webp?alt=media&token=ebb8a967-0d76-4b47-b599-11b252ef449f'
      }
    ]
  },

  dips: {
    category: 'dips',
    multiSelect: true,
    maxSelections: 2,
    items: [
      {
        id: 'ranch',
        name: 'Ranch',
        description: 'Creamy classic',
        tags: ['Popular'],
        imageUrl: null
      },
      {
        id: 'blue-cheese',
        name: 'Blue Cheese',
        description: 'Tangy & bold',
        tags: ['Traditional'],
        imageUrl: null
      },
      {
        id: 'honey-mustard',
        name: 'Honey Mustard',
        description: 'Sweet & tangy',
        tags: ['Sweet'],
        imageUrl: null
      }
    ]
  },

  sides: {
    category: 'sides',
    multiSelect: false,
    items: [
      {
        id: 'chips',
        name: "Miss Vickie's Chips",
        description: 'Assorted flavors',
        tags: ['Crunchy', 'Variety'],
        imageUrl: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Fmiss-vickies-chips_1920x1080.webp?alt=media&token=50dadac7-2c72-4ffc-96f4-1d9407df0bf3'
      },
      {
        id: 'coleslaw',
        name: 'Coleslaw',
        description: 'Fresh & crisp',
        tags: ['Cold', 'Refreshing'],
        imageUrl: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Fcoleslaw-salad_1920x1080.webp?alt=media&token=70ebf6df-b3e0-4c0b-96c2-fa9e2b3e500f'
      },
      {
        id: 'potato-salad',
        name: 'Potato Salad',
        description: 'Creamy homestyle',
        tags: ['Cold', 'Hearty'],
        imageUrl: 'https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Fpotato-salad_1920x1080.webp?alt=media&token=86426886-f423-4964-98e3-d2ddb4ef7512'
      }
    ]
  }
};
