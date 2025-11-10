/**
 * Shared Add-Ons UI Rendering Utilities
 *
 * Provides reusable rendering functions for add-ons masonry card UI.
 * Used by both boxed meals and shared platters for consistent UX.
 *
 * @module shared-addons-ui
 */

/**
 * Render masonry category with horizontal scroll
 * @param {string} title - Category title
 * @param {string} icon - Emoji icon
 * @param {Array} items - Array of add-on items
 * @param {boolean} featured - Whether items should be featured (larger cards)
 * @returns {string} HTML string for category
 */
export function renderMasonryCategory(title, icon, items, featured = false) {
  if (!items || items.length === 0) return '';

  return `
    <div class="masonry-category">
      <div class="masonry-category-header">
        <span class="category-icon">${icon}</span>
        <span class="category-name">${title}</span>
      </div>
      <div class="horizontal-scroll">
        ${items.map(item => renderMasonryCard(item, featured)).join('')}
      </div>
    </div>
  `;
}

/**
 * Render individual masonry card
 * @param {Object} item - Add-on item
 * @param {boolean} featured - Whether card should be featured size
 * @returns {string} HTML string for masonry card
 */
export function renderMasonryCard(item, featured = false) {
  // Check if item has pack variants (multiple pack sizes)
  if (item.hasVariants && item.variants) {
    return renderPackVariantCard(item, featured);
  }

  // Regular single-variant card
  const cardClass = featured ? 'masonry-card featured' : 'masonry-card';
  const price = item.price ? `$${item.price.toFixed(2)}` : 'Price varies';
  const servingInfo = item.serves ? ` • Serves ${item.serves}` : '';
  const packInfo = item.packSize ? ` (${item.packSize})` : '';

  return `
    <div class="${cardClass}" data-addon-id="${item.id}" data-name="${item.name}" data-price="${item.price || 0}" data-category="${item.category}">
      <div class="masonry-card-image">
        ${item.imageUrl ? `<img src="${item.imageUrl}" alt="${item.name}" loading="lazy">` : getIconForCategory(item.category)}
      </div>
      <div class="masonry-card-content">
        <div class="masonry-card-name">${item.name}</div>
        <div class="masonry-card-desc">${item.description || ''}${packInfo}${servingInfo}</div>
        <div class="masonry-card-footer">
          <div class="masonry-card-price">${price}</div>
          <div class="quantity-controls" style="display: none;">
            <button class="qty-btn qty-minus" data-addon-id="${item.id}">−</button>
            <span class="qty-display" data-addon-id="${item.id}">0</span>
            <button class="qty-btn qty-plus" data-addon-id="${item.id}">+</button>
          </div>
          <button class="quick-add-btn" data-addon-id="${item.id}">+ Add</button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render pack variant card with multiple pack size options (Compact Rows)
 * @param {Object} item - Item with hasVariants:true and variants object
 * @param {boolean} featured - Whether card should be featured size
 * @returns {string} HTML string for pack variant card
 */
export function renderPackVariantCard(item, featured = false) {
  const cardClass = featured ? 'masonry-card pack-variant-card featured' : 'masonry-card pack-variant-card';
  const heatIndicator = item.heatLevel ? `<span class="heat-level">${'🌶️'.repeat(item.heatLevel)}</span>` : '';

  // Get variant pack sizes (individual, 5pack, etc.)
  const variants = Object.entries(item.variants || {});
  if (variants.length === 0) return ''; // Safety check

  return `
    <div class="${cardClass}" data-source-id="${item.sourceId}" data-category="${item.category}">
      <div class="masonry-card-image">
        ${item.imageUrl ? `<img src="${item.imageUrl}" alt="${item.displayName}" loading="lazy">` : getIconForCategory(item.category)}
      </div>
      <div class="masonry-card-content">
        <div class="masonry-card-name">${item.displayName || item.name} ${heatIndicator}</div>
        <div class="masonry-card-desc">${item.description || ''}</div>

        <!-- Pack Variant Selectors (Compact Rows) -->
        <div class="pack-variant-selectors">
          ${variants.map(([packSize, variant]) => `
            <div class="variant-row" data-variant="${packSize}" data-variant-id="${variant.id}">
              <div class="variant-label">
                <span class="variant-name">${formatPackSize(packSize)}</span>
                <span class="variant-price">$${(variant.price || 0).toFixed(2)}</span>
                ${variant.servings && variant.servings > 1 ?
                  `<span class="variant-servings">Serves ${variant.servings}${variant.cupSize ? ` (${variant.cupSize} cups)` : ''}</span>`
                  : ''}
              </div>
              <div class="variant-qty">
                <button class="qty-btn qty-minus" data-variant-id="${variant.id}" data-variant-price="${variant.price || 0}" data-servings="${variant.servings || 0}" data-cup-size="${variant.cupSize || ''}">−</button>
                <span class="qty-display" data-variant-id="${variant.id}">0</span>
                <button class="qty-btn qty-plus" data-variant-id="${variant.id}" data-variant-price="${variant.price || 0}" data-servings="${variant.servings || 0}" data-cup-size="${variant.cupSize || ''}">+</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

/**
 * Get emoji icon for category
 * @param {string} category - Category identifier
 * @returns {string} HTML string with emoji placeholder
 */
export function getIconForCategory(category) {
  const icons = {
    'quick-adds': '🥤',
    'beverages': '🧃',
    'hot-beverages': '☕',
    'salads': '🥗',
    'sides': '🥔',
    'desserts': '🍰',
    'sauces-to-go': '🌶️',
    'dips-to-go': '🥫'
  };
  return `<div class="emoji-placeholder">${icons[category] || '🍴'}</div>`;
}

/**
 * Format pack size for display
 * @param {string} packSize - Pack size identifier (e.g., 'individual', '5pack')
 * @returns {string} Formatted pack size label
 */
export function formatPackSize(packSize) {
  const formats = {
    'individual': 'Individual',
    '5pack': '5-Pack',
    'family': 'Family Pack',
    'slice': 'Slice',
    'gallon': 'Gallon'
  };
  return formats[packSize] || packSize;
}
