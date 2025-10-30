/**
 * Package Gallery Component - Quick Browse Path (FLOW A)
 *
 * Displays all 8 shared platter packages from Firestore with:
 * - Responsive grid layout (3-col desktop, 2-col tablet, 1-col mobile)
 * - Real-time filtering (guest count, price, dietary)
 * - Sorting options (price, size, popularity)
 * - Package detail modal
 * - Lazy-loaded images with WebP optimization
 * - Selection updates state service
 *
 * Epic: SP-V2-001
 * Story: SP-002 (Package Gallery)
 * Points: 5
 * Created: 2025-10-26
 */

import { db, storage } from '../../firebase-config.js';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import { updateState, setPackage } from '../../services/shared-platter-state-service.js';

function isPlantBasedPackage(pkg) {
  if (!pkg) return false;
  if (pkg.isPlantBased === true) return true;
  if (pkg.isPlantBased === false) return false;

  if (Array.isArray(pkg.dietaryTags)) {
    const normalizedTags = pkg.dietaryTags.map(tag => tag.toLowerCase());
    if (normalizedTags.some(tag => tag === 'plant-based' || tag === 'vegan')) {
      return true;
    }
  }

  return Boolean(pkg.id && pkg.id.includes('plant-based'));
}

// ===== COMPONENT STATE =====
let allPackages = [];
let filteredPackages = [];
let currentFilters = {
  guestCount: null,
  minPrice: null,
  maxPrice: null,
  dietary: []
};
let currentSort = 'default';
let isLoading = true;
let modalPackage = null;

// ===== FIRESTORE DATA FETCHING =====

/**
 * Fetch all active packages from Firestore
 * @returns {Promise<Array>} Array of package objects
 */
async function fetchPackages() {
  try {
    const packagesQuery = query(
      collection(db, 'cateringPackages'),
      where('active', '==', true),
      orderBy('sortOrder', 'asc')
    );

    const snapshot = await getDocs(packagesQuery);
    const packages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`Fetched ${packages.length} packages from Firestore`);
    return packages;
  } catch (error) {
    console.error('Error fetching packages:', error);
    throw error;
  }
}

/**
 * Get Firebase Storage image URL
 * @param {string} imageUrl - Storage path (e.g., "catering/packages/lunch-box.webp")
 * @returns {Promise<string>} Download URL
 */
async function getPackageImageUrl(imageUrl) {
  if (!imageUrl) {
    return '/images/placeholders/package-default.webp';
  }

  try {
    const imageRef = ref(storage, imageUrl);
    const url = await getDownloadURL(imageRef);
    return url;
  } catch (error) {
    console.warn('Image not found in Storage, using fallback:', imageUrl);
    return '/images/placeholders/package-default.webp';
  }
}

// ===== FILTERING & SORTING =====

/**
 * Apply filters to packages
 * @param {Array} packages - All packages
 * @param {Object} filters - Filter criteria
 * @returns {Array} Filtered packages
 */
function filterPackages(packages, filters) {
  return packages.filter(pkg => {
    // Guest count filter
    if (filters.guestCount != null) {
      const guestCount = Number(filters.guestCount);
      if (!Number.isNaN(guestCount) && guestCount > 0) {
        const serves = pkg.servingSize || {};
        const min = typeof serves.min === 'number' ? serves.min : (typeof pkg.servesMin === 'number' ? pkg.servesMin : null);
        const max = typeof serves.max === 'number' ? serves.max : (typeof pkg.servesMax === 'number' ? pkg.servesMax : null);

        if (min !== null && guestCount < min) return false;
        if (max !== null && guestCount > max) return false;
      }
    }

    // Price range filter
    if (filters.minPrice && pkg.basePrice < filters.minPrice) return false;
    if (filters.maxPrice && pkg.basePrice > filters.maxPrice) return false;

    // Dietary filter
    if (filters.dietary.length > 0) {
      if (filters.dietary.includes('vegetarian') || filters.dietary.includes('vegan')) {
        if (!isPlantBasedPackage(pkg)) return false;
      }
    }

    return true;
  });
}

/**
 * Sort packages by selected criterion
 * @param {Array} packages - Packages to sort
 * @param {string} sortBy - Sort criterion
 * @returns {Array} Sorted packages
 */
function sortPackages(packages, sortBy) {
  const sorted = [...packages];

  switch (sortBy) {
    case 'price-low':
      return sorted.sort((a, b) => a.basePrice - b.basePrice);
    case 'price-high':
      return sorted.sort((a, b) => b.basePrice - a.basePrice);
    case 'size-small':
      return sorted.sort((a, b) => {
        const aWings = a.wingOptions?.totalWings || 0;
        const bWings = b.wingOptions?.totalWings || 0;
        return aWings - bWings;
      });
    case 'size-large':
      return sorted.sort((a, b) => {
        const aWings = a.wingOptions?.totalWings || 0;
        const bWings = b.wingOptions?.totalWings || 0;
        return bWings - aWings;
      });
    case 'popularity':
      return sorted.sort((a, b) => {
        if (a.popular && !b.popular) return -1;
        if (!a.popular && b.popular) return 1;
        return 0;
      });
    case 'default':
    default:
      return sorted.sort((a, b) => a.sortOrder - b.sortOrder);
  }
}

/**
 * Update filtered/sorted packages and re-render
 */
function applyFiltersAndSort() {
  filteredPackages = filterPackages(allPackages, currentFilters);
  filteredPackages = sortPackages(filteredPackages, currentSort);
  renderGallery();
}

// ===== EVENT HANDLERS =====

/**
 * Handle guest count filter change
 */
function handleGuestCountFilter(event) {
  const value = parseInt(event.target.value);
  currentFilters.guestCount = value || null;
  applyFiltersAndSort();
}

/**
 * Handle price range filter change
 */
function handlePriceRangeFilter(min, max) {
  currentFilters.minPrice = min;
  currentFilters.maxPrice = max;
  applyFiltersAndSort();
}

/**
 * Handle dietary filter change
 */
function handleDietaryFilter(event) {
  const value = event.target.value;
  const checked = event.target.checked;

  if (checked) {
    currentFilters.dietary.push(value);
  } else {
    currentFilters.dietary = currentFilters.dietary.filter(d => d !== value);
  }

  applyFiltersAndSort();
}

/**
 * Clear all filters
 */
function clearFilters() {
  currentFilters = {
    guestCount: null,
    minPrice: null,
    maxPrice: null,
    dietary: []
  };

  // Reset form inputs
  document.querySelectorAll('.filter-control').forEach(input => {
    if (input.type === 'checkbox') {
      input.checked = false;
    } else {
      input.value = '';
    }
  });

  applyFiltersAndSort();
}

/**
 * Handle sort change
 */
function handleSortChange(event) {
  currentSort = event.target.value;
  applyFiltersAndSort();
}

/**
 * Open package detail modal
 */
function openPackageModal(pkg) {
  modalPackage = pkg;
  renderModal();
}

/**
 * Close package detail modal
 */
function closePackageModal() {
  modalPackage = null;
  document.querySelector('.package-modal')?.remove();
}

/**
 * Select package and navigate to customization
 */
function selectPackage(pkg) {
  // Update state service
  setPackage(pkg);
  updateState('flowType', 'quick-browse');
  updateState('currentStep', 'customization');

  // Close modal
  closePackageModal();

  // Navigate to customization screen
  // (will be handled by main router/orchestrator)
  window.dispatchEvent(new CustomEvent('navigate-to-customization', { detail: pkg }));
}

// ===== RENDER FUNCTIONS =====

/**
 * Render loading skeleton
 */
function renderLoadingSkeleton() {
  const skeletons = Array(6).fill(null).map(() => `
    <div class="package-card skeleton">
      <div class="skeleton-image"></div>
      <div class="skeleton-title"></div>
      <div class="skeleton-text"></div>
      <div class="skeleton-text"></div>
      <div class="skeleton-price"></div>
      <div class="skeleton-button"></div>
    </div>
  `).join('');

  return `<div class="package-grid">${skeletons}</div>`;
}

/**
 * Render single package card
 */
function renderPackageCard(pkg) {
  const serves = pkg.servingSize || {};
  const wings = pkg.wingOptions?.totalWings || 0;
  const sauces = pkg.sauceSelections?.max || 0;

  return `
    <div class="package-card" data-package-id="${pkg.id}">
      ${pkg.popular ? '<div class="popular-badge">🔥 POPULAR</div>' : ''}

      <div class="package-image-wrapper">
        <img
          src="${pkg.heroImage || '/images/placeholders/package-default.webp'}"
          alt="${pkg.name}"
          class="package-image"
          loading="lazy"
        />
      </div>

      <div class="package-content">
        <div class="package-header">
          <h3 class="package-name">${pkg.name}</h3>
          <span class="package-tier">Tier ${pkg.tier}</span>
        </div>

        <p class="package-serves">Serves ${serves.min}-${serves.max} people</p>

        <ul class="package-highlights">
          <li>• ${wings} Total Wings</li>
          <li>• ${sauces} Sauce Selections</li>
          <li>• Chips, Dips & Sides</li>
          <li>• Desserts & Beverages</li>
        </ul>

        <div class="package-footer">
          <div class="package-price">
            <span class="price-label">Starting at</span>
            <span class="price-value">$${pkg.basePrice.toFixed(2)}</span>
          </div>

          <button
            class="btn-select-package"
            data-package-id="${pkg.id}"
          >
            Select Package
          </button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render filter controls
 */
function renderFilters() {
  const activeFilterCount = [
    currentFilters.guestCount ? 1 : 0,
    currentFilters.minPrice || currentFilters.maxPrice ? 1 : 0,
    currentFilters.dietary.length
  ].reduce((a, b) => a + b, 0);

  return `
    <div class="gallery-filters">
      <div class="filter-group">
        <label for="guest-count-filter">Guest Count</label>
        <input
          type="number"
          id="guest-count-filter"
          class="filter-control"
          placeholder="Enter guest count"
          min="10"
          max="100"
          value="${currentFilters.guestCount || ''}"
        />
      </div>

      <div class="filter-group">
        <label for="price-min-filter">Price Range</label>
        <div class="price-range-inputs">
          <input
            type="number"
            id="price-min-filter"
            class="filter-control price-input"
            placeholder="Min"
            value="${currentFilters.minPrice || ''}"
          />
          <span>-</span>
          <input
            type="number"
            id="price-max-filter"
            class="filter-control price-input"
            placeholder="Max"
            value="${currentFilters.maxPrice || ''}"
          />
        </div>
      </div>

      <div class="filter-group">
        <label>Dietary</label>
        <div class="dietary-checkboxes">
          <label class="checkbox-label">
            <input
              type="checkbox"
              value="vegetarian"
              class="filter-control"
              ${currentFilters.dietary.includes('vegetarian') ? 'checked' : ''}
            />
            Vegetarian
          </label>
          <label class="checkbox-label">
            <input
              type="checkbox"
              value="vegan"
              class="filter-control"
              ${currentFilters.dietary.includes('vegan') ? 'checked' : ''}
            />
            Vegan
          </label>
        </div>
      </div>

      ${activeFilterCount > 0 ? `
        <button class="btn-clear-filters">
          Clear Filters (${activeFilterCount})
        </button>
      ` : ''}
    </div>
  `;
}

/**
 * Render sort controls
 */
function renderSortControls() {
  return `
    <div class="gallery-sort">
      <label for="sort-select">Sort by:</label>
      <select id="sort-select" class="sort-control">
        <option value="default" ${currentSort === 'default' ? 'selected' : ''}>Default</option>
        <option value="price-low" ${currentSort === 'price-low' ? 'selected' : ''}>Price (Low to High)</option>
        <option value="price-high" ${currentSort === 'price-high' ? 'selected' : ''}>Price (High to Low)</option>
        <option value="size-small" ${currentSort === 'size-small' ? 'selected' : ''}>Size (Smallest First)</option>
        <option value="size-large" ${currentSort === 'size-large' ? 'selected' : ''}>Size (Largest First)</option>
        <option value="popularity" ${currentSort === 'popularity' ? 'selected' : ''}>Popularity</option>
      </select>
    </div>
  `;
}

/**
 * Render gallery grid
 */
function renderGallery() {
  const container = document.querySelector('.package-gallery-container');
  if (!container) return;

  if (isLoading) {
    container.innerHTML = `
      <div class="gallery-header">
        <h2>Browse Our Shared Platter Packages</h2>
      </div>
      ${renderLoadingSkeleton()}
    `;
    return;
  }

  const galleryHTML = `
    <div class="gallery-header">
      <h2>Browse Our Shared Platter Packages</h2>
      <p class="gallery-subtitle">Choose the perfect spread for your event</p>
    </div>

    <div class="gallery-controls">
      ${renderFilters()}
      ${renderSortControls()}
    </div>

    <div class="gallery-results">
      <p class="results-count">
        Showing ${filteredPackages.length} of ${allPackages.length} packages
      </p>
    </div>

    <div class="package-grid">
      ${filteredPackages.length > 0
        ? filteredPackages.map(pkg => renderPackageCard(pkg)).join('')
        : '<p class="no-results">No packages match your filters. Try adjusting your criteria.</p>'
      }
    </div>
  `;

  container.innerHTML = galleryHTML;
  attachEventListeners();
}

/**
 * Render package detail modal
 */
function renderModal() {
  if (!modalPackage) return;

  const pkg = modalPackage;
  const serves = pkg.servingSize || {};
  const wings = pkg.wingOptions?.totalWings || 0;

  const modalHTML = `
    <div class="package-modal" role="dialog" aria-modal="true">
      <div class="modal-overlay"></div>
      <div class="modal-content">
        <button class="modal-close" aria-label="Close">&times;</button>

        <div class="modal-image">
          <img src="${pkg.heroImage || '/images/placeholders/package-default.webp'}" alt="${pkg.name}" />
          ${pkg.popular ? '<div class="popular-badge-large">🔥 POPULAR CHOICE</div>' : ''}
        </div>

        <div class="modal-details">
          <h2>${pkg.name}</h2>
          <p class="modal-tier">Tier ${pkg.tier} • Serves ${serves.min}-${serves.max} people</p>

          <div class="modal-price">
            <span class="price-value">$${pkg.basePrice.toFixed(2)}</span>
            <span class="price-label">starting price</span>
          </div>

          <div class="modal-description">
            <h3>What's Included:</h3>
            <ul>
              <li><strong>${wings} Wings</strong> - Your choice of boneless, bone-in, or mixed</li>
              <li><strong>${pkg.sauceSelections?.max || 0} Sauce Selections</strong> - Choose from 14 flavors</li>
              <li><strong>Chips & Dips</strong> - Miss Vickie's variety with 4 dip options</li>
              <li><strong>Sides</strong> - Coleslaw, potato salad, veggie trays, salads</li>
              <li><strong>Desserts</strong> - 5-packs of gourmet treats</li>
              <li><strong>Beverages</strong> - Cold (iced tea, water) and hot (coffee, cocoa) options</li>
            </ul>
          </div>

          <button class="btn-select-package-modal" data-package-id="${pkg.id}">
            Select This Package
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHTML);
  attachModalListeners();
}

// ===== EVENT LISTENER ATTACHMENT =====

/**
 * Attach event listeners to gallery controls
 */
function attachEventListeners() {
  // Guest count filter
  document.getElementById('guest-count-filter')?.addEventListener('change', handleGuestCountFilter);

  // Price range filters
  document.getElementById('price-min-filter')?.addEventListener('change', (e) => {
    const min = parseInt(e.target.value) || null;
    const max = currentFilters.maxPrice;
    handlePriceRangeFilter(min, max);
  });

  document.getElementById('price-max-filter')?.addEventListener('change', (e) => {
    const max = parseInt(e.target.value) || null;
    const min = currentFilters.minPrice;
    handlePriceRangeFilter(min, max);
  });

  // Dietary filters
  document.querySelectorAll('.dietary-checkboxes input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', handleDietaryFilter);
  });

  // Clear filters
  document.querySelector('.btn-clear-filters')?.addEventListener('click', clearFilters);

  // Sort control
  document.getElementById('sort-select')?.addEventListener('change', handleSortChange);

  // Package card clicks
  document.querySelectorAll('.btn-select-package').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const packageId = e.target.dataset.packageId;
      const pkg = allPackages.find(p => p.id === packageId);
      if (pkg) openPackageModal(pkg);
    });
  });
}

/**
 * Attach event listeners to modal
 */
function attachModalListeners() {
  // Close modal
  document.querySelector('.modal-close')?.addEventListener('click', closePackageModal);
  document.querySelector('.modal-overlay')?.addEventListener('click', closePackageModal);

  // Select package from modal
  document.querySelector('.btn-select-package-modal')?.addEventListener('click', (e) => {
    const packageId = e.target.dataset.packageId;
    const pkg = allPackages.find(p => p.id === packageId);
    if (pkg) selectPackage(pkg);
  });

  // ESC key to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalPackage) {
      closePackageModal();
    }
  });
}

// ===== INITIALIZATION =====

/**
 * Initialize package gallery
 */
export async function initPackageGallery(containerSelector = '.package-gallery-container') {
  const container = document.querySelector(containerSelector);
  if (!container) {
    console.error('Package gallery container not found:', containerSelector);
    return;
  }

  try {
    isLoading = true;
    renderGallery();

    // Fetch packages from Firestore
    allPackages = await fetchPackages();
    filteredPackages = [...allPackages];

    isLoading = false;
    renderGallery();
  } catch (error) {
    console.error('Failed to initialize package gallery:', error);
    container.innerHTML = `
      <div class="error-state">
        <p>Sorry, we couldn't load the packages. Please try again later.</p>
        <button onclick="location.reload()">Retry</button>
      </div>
    `;
  }
}

/**
 * Cleanup function
 */
export function destroyPackageGallery() {
  closePackageModal();
  allPackages = [];
  filteredPackages = [];
  currentFilters = { guestCount: null, minPrice: null, maxPrice: null, dietary: [] };
  currentSort = 'default';
}
