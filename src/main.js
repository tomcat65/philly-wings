import './firebase-config';
import './components/game-day-banner';
import { MenuService, ReviewService, LiveOrderService, FirebaseService } from './services/firebase-service';

// Dynamic content loaders
class PhillyWingsApp {
  constructor() {
    this.init();
  }

  async init() {
    // Load dynamic content
    await Promise.all([
      this.loadFlavors(),
      this.loadReviews(),
      this.initLiveOrders()
    ]);

    // Initialize email capture
    this.initEmailCapture();

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
            <span class="order-details">${order.customerName} from ${order.neighborhood} ${order.items}</span>
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

  initEmailCapture() {
    const emailForm = document.getElementById('emailForm');
    if (!emailForm) return;

    emailForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const emailInput = document.getElementById('customerEmail');
      const email = emailInput.value.trim();
      const submitBtn = emailForm.querySelector('.email-submit');
      
      if (!email) return;

      // Disable form during submission
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>Hold up...</span>';

      try {
        // Save email to Firebase
        await FirebaseService.create('emailSubscribers', {
          email: email,
          source: 'website',
          subscribedAt: new Date(),
          tags: ['newsletter', 'perks']
        });

        // Show success message
        emailForm.innerHTML = `
          <div style="color: #00FF00; font-size: 24px; font-family: 'Bebas Neue', sans-serif;">
            <p style="margin-bottom: 16px;">Yo, you're in! 🔥</p>
            <p style="font-size: 18px; color: #F5F5F5;">Check your email for that 15% off jawn</p>
          </div>
        `;

        // Track conversion
        if (typeof gtag !== 'undefined') {
          gtag('event', 'email_signup', {
            'event_category': 'Engagement',
            'event_label': 'Newsletter'
          });
        }
      } catch (error) {
        console.error('Error saving email:', error);
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>I\'m In</span><span class="arrow">→</span>';
        alert('Yo, something went wrong. Try again?');
      }
    });
  }

  initExistingScripts() {
    // Import existing scripts functionality
    const scriptTag = document.createElement('script');
    scriptTag.src = '/scripts.js';
    scriptTag.defer = true;
    document.body.appendChild(scriptTag);
  }
}

// Initialize app
new PhillyWingsApp();