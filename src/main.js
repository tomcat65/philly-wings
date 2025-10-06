import './firebase-config';
import './components/game-day-banner';
import './components/menu-navigation';
import './components/nutrition-modal-firebase';
import { MenuService, ReviewService, LiveOrderService, FirebaseService } from './services/firebase-service';
import { initAnalytics, setupSectionObservers, setupBounceTracking } from './analytics';
import './services/webp-image-service';

// Dynamic content loaders
class PhillyWingsApp {
  constructor() {
    this.init();
  }

  async init() {
    // Initialize analytics first (Mirror Mode tracking)
    initAnalytics();
    setupSectionObservers();
    setupBounceTracking();

    // Load dynamic content
    await Promise.all([
      // this.loadFlavors(), // Commented out - using new menu system
      this.loadReviews(),
      this.initLiveOrders()
    ]);

    // Initialize acquisition system
    this.initAcquisitionSystem();

    // Initialize existing scripts
    this.initExistingScripts();
  }

  async loadFlavors() {
    try {
      const wingItems = await MenuService.getActiveItems('wings');
      const flavorGrid = document.querySelector('.flavor-grid');
      
      if (flavorGrid && wingItems.length > 0) {
        flavorGrid.innerHTML = wingItems.map(item => this.createFlavorCard(item)).join('');
      }
    } catch (error) {
      console.error('Error loading flavors:', error);
    }
  }

  createFlavorCard(item) {
    const heatMeter = Array.from({length: 5}, (_, i) => 
      `<span class="heat-flame ${i < item.heatLevel ? 'active' : ''}">🔥</span>`
    ).join('');

    return `
      <div class="flavor-card ${item.heatLevel === 5 ? 'atomic' : ''}" data-heat="${item.heatLevel}">
        <div class="flavor-image">
          ${item.imageUrl ? `<img src="${item.imageUrl}" alt="${item.name}" loading="lazy">` : ''}
          <div class="heat-meter">${heatMeter}</div>
          ${item.heatLevel === 5 ? '<div class="atomic-warning">☢️ ATOMIC</div>' : ''}
        </div>
        <h3 class="flavor-name chalk-text">${item.name}</h3>
        <p class="flavor-description">${item.description}</p>
        ${item.price ? `<p class="flavor-price">$${item.price.toFixed(2)}</p>` : ''}
      </div>
    `;
  }

  async loadReviews() {
    try {
      const reviews = await ReviewService.getFeaturedReviews();
      const reviewsGrid = document.querySelector('.reviews-grid');
      
      if (reviewsGrid && reviews.length > 0) {
        reviewsGrid.innerHTML = reviews.map(review => `
          <div class="review-card">
            <div class="review-rating">${'⭐'.repeat(review.rating)}</div>
            <p class="review-text">"${review.text}"</p>
            <p class="review-author">- ${review.customerName}, ${review.platform}</p>
          </div>
        `).join('');
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  }

  initLiveOrders() {
    const orderTicker = document.getElementById('orderTicker');
    if (!orderTicker) return;

    // Subscribe to live orders
    LiveOrderService.subscribeToRecent((orders) => {
      orderTicker.innerHTML = orders.map(order => {
        const timeAgo = this.getTimeAgo(order.timestamp);
        return `
          <div class="order-item">
            <span class="order-time">${timeAgo}</span>
            <span class="order-details">Order placed: ${order.items}</span>
          </div>
        `;
      }).join('');
    }, 3);
  }

  getTimeAgo(timestamp) {
    if (!timestamp) return 'just now';
    
    const seconds = Math.floor((Date.now() - timestamp.seconds * 1000) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hour ago`;
    return `${Math.floor(seconds / 86400)} day ago`;
  }

  initAcquisitionSystem() {
    // Set up VIP access trigger - modal will be available globally
    const vipTrigger = document.getElementById('vipAccessTrigger');
    if (vipTrigger) {
      vipTrigger.addEventListener('click', () => {
        if (window.acquisitionModal) {
          window.acquisitionModal.show();
        } else {
          console.warn('AcquisitionModal not ready yet');
        }
      });
    }
  }

  initExistingScripts() {
    // Import existing scripts functionality
    const scriptTag = document.createElement('script');
    scriptTag.src = '/scripts.js';
    scriptTag.defer = true;
    document.body.appendChild(scriptTag);
  }
}

// Global function for allergen info display
window.showAllergenInfo = function(element) {
  const allergens = element.getAttribute('data-allergens');
  if (!allergens) return;

  alert(`Allergen Information:\n\nContains: ${allergens}\n\nPlease verify with the platform for complete allergen information.`);

  if (typeof gtag !== 'undefined') {
    gtag('event', 'click', {
      'event_category': 'Info',
      'event_label': 'Specific Allergen Info',
      'custom_parameters': { 'allergens': allergens }
    });
  }

  if (event) {
    event.stopPropagation();
    event.preventDefault();
  }
};

// Initialize app
new PhillyWingsApp();