# Wing Menu Flow - Mirror Mode Implementation Guide

## Overview
Marketing showcase site that displays wing options and drives traffic to delivery platforms (DoorDash, UberEats, Grubhub). NO on-site ordering - all customization happens in delivery apps.

## Core Purpose
- **What we ARE:** Beautiful menu display that educates and excites
- **What we're NOT:** An ordering system or cart
- **Goal:** Get customers to click through to delivery platforms in <15 seconds

## Menu Display Structure

### Hero Section
```html
<section class="hero-wings">
  <h1>Philly's Best Wings - Delivered Fresh</h1>
  <p>Hand-tossed, double-fried, and sauced to perfection</p>
  <button onclick="scrollToSection('#quick-picks')">View Menu</button>
  <button onclick="scrollToSection('#order-now')" class="cta">Order Now</button>
</section>
```

### Quick Picks (Above the Fold)
```html
<section id="quick-picks" class="quick-picks-gallery">
  <h2>Popular Combos</h2>

  <div class="combo-cards">
    <div class="combo-card" onclick="scrollToSection('#order-now')">
      <span class="badge">MOST POPULAR</span>
      <img src="30-wings-buffalo.jpg" alt="Game Day Special">
      <h3>Game Day 30</h3>
      <p>30 Classic Wings • Buffalo & BBQ</p>
      <span class="price">From $34.99</span>
      <button class="cta">Order This →</button>
    </div>

    <div class="combo-card" onclick="scrollToSection('#order-now')">
      <img src="12-wings-mixed.jpg" alt="Date Night">
      <h3>Date Night Dozen</h3>
      <p>12 Wings • Choose 2 Sauces</p>
      <span class="price">From $15.99</span>
      <button class="cta">Order This →</button>
    </div>

    <div class="combo-card" onclick="scrollToSection('#order-now')">
      <img src="50-wings-party.jpg" alt="Party Pack">
      <h3>Party Pack 50</h3>
      <p>50 Wings • Up to 4 Sauces • Mix Types</p>
      <span class="price">From $54.99</span>
      <button class="cta">Order This →</button>
    </div>
  </div>
</section>
```

### Wing Sizes Display
```html
<section class="wing-sizes">
  <h2>Choose Your Size</h2>

  <div class="size-cards">
    <div class="size-card" data-size="6">
      <img src="6-wings.jpg" alt="6 Wings">
      <h3>6 Wings</h3>
      <div class="info-badges">
        <span class="badge">Feeds 1</span>
        <span class="badge">1 Sauce</span>
      </div>
      <p class="price">From $8.99</p>
      <a href="#order-now" class="order-link">Order in App →</a>
    </div>

    <div class="size-card popular" data-size="12">
      <span class="popular-badge">POPULAR</span>
      <img src="12-wings.jpg" alt="12 Wings">
      <h3>12 Wings</h3>
      <div class="info-badges">
        <span class="badge">Feeds 1-2</span>
        <span class="badge">2 Sauces</span>
      </div>
      <p class="price">From $15.99</p>
      <a href="#order-now" class="order-link">Order in App →</a>
    </div>

    <!-- Continue for 24, 30, 50 -->
  </div>

  <div class="size-info">
    <p>📱 Select your size and customize in the delivery app</p>
  </div>
</section>
```

### Wing Types Education
```html
<section class="wing-types-info">
  <h2>Wing Styles</h2>

  <div class="type-showcase">
    <div class="type-card">
      <img src="classic-wings.jpg" alt="Classic Wings">
      <h3>Classic (Bone-In)</h3>
      <p>Traditional drums & flats, crispy outside, juicy inside</p>
    </div>

    <div class="type-card">
      <img src="boneless-wings.jpg" alt="Boneless Wings">
      <h3>Boneless</h3>
      <p>All white meat, perfect for dipping</p>
    </div>
  </div>

  <div class="mix-info">
    <h3>🎉 Mix & Match Available!</h3>
    <p>30 & 50 piece orders can mix Classic and Boneless</p>
    <div class="mix-examples">
      <span class="example">All Classic</span>
      <span class="example">Half & Half</span>
      <span class="example">Custom Mix</span>
    </div>
    <p class="helper">Mix in 6-piece increments • Choose in delivery app</p>
  </div>
</section>
```

### Sauce Gallery
```html
<section class="sauce-showcase">
  <h2>Our Signature Sauces</h2>
  <p class="sauce-rules">6 wings = 1 sauce • 12 wings = 2 sauces • 24/30 wings = 3 sauces • 50 wings = 4 sauces</p>

  <div class="sauce-grid">
    <div class="sauce-card">
      <img src="buffalo-sauce.jpg" alt="Buffalo">
      <h4>Buffalo</h4>
      <div class="sauce-info">
        <span class="heat">🌶️🌶️</span>
        <span class="calories">60 cal</span>
      </div>
      <p>Classic tangy heat</p>
    </div>

    <div class="sauce-card">
      <img src="lemon-pepper.jpg" alt="Lemon Pepper">
      <h4>Classic Lemon Pepper</h4>
      <div class="sauce-info">
        <span class="heat">No heat</span>
        <span class="calories">180 cal</span>
      </div>
      <p>Zesty & savory</p>
    </div>

    <div class="sauce-card">
      <img src="dallas-crusher.jpg" alt="Dallas Crusher">
      <h4>Dallas Crusher</h4>
      <div class="sauce-info">
        <span class="heat">🌶️🌶️🌶️🌶️</span>
        <span class="calories">300 cal</span>
      </div>
      <p>Extreme heat warning!</p>
    </div>

    <!-- Continue for all 8 sauces -->
  </div>

  <p class="helper">🍗 Choose your sauces when ordering in the delivery app</p>
</section>
```

### Sides & Add-ons Display
```html
<section class="sides-showcase">
  <h2>Complete Your Meal</h2>

  <div class="sides-grid">
    <div class="side-card">
      <img src="fries.jpg" alt="Fries">
      <h4>Fries</h4>
      <p>Hand-cut, crispy perfection</p>
      <span class="note">Multiple sizes available</span>
    </div>

    <div class="side-card">
      <img src="mozzarella-sticks.jpg" alt="Mozzarella Sticks">
      <h4>Mozzarella Sticks</h4>
      <p>Melty cheese, crispy coating</p>
    </div>
  </div>

  <div class="addons-info">
    <h3>Popular Add-ons</h3>
    <div class="addon-badges">
      <span class="addon">Ranch</span>
      <span class="addon">Blue Cheese</span>
      <span class="addon">Extra Crispy</span>
    </div>
    <p class="helper">Add extras in the delivery app</p>
  </div>
</section>
```

### Platform Selection (Primary CTA)
```html
<section id="order-now" class="platform-selection">
  <h2>Ready to Order?</h2>
  <p>Choose your delivery app to customize and checkout</p>

  <div class="platform-buttons">
    <a href="https://www.doordash.com/store/philly-wings-express-philadelphia-123456/"
       onclick="trackPlatformClick('doordash')"
       class="platform-btn doordash">
      <img src="doordash-logo.svg" alt="DoorDash">
      <span>Order on DoorDash</span>
      <span class="delivery-time">25-35 min</span>
    </a>

    <a href="https://www.ubereats.com/store/philly-wings-express/abcdef"
       onclick="trackPlatformClick('ubereats')"
       class="platform-btn ubereats">
      <img src="ubereats-logo.svg" alt="Uber Eats">
      <span>Order on Uber Eats</span>
      <span class="delivery-time">30-40 min</span>
    </a>

    <a href="https://www.grubhub.com/restaurant/philly-wings-express-philadelphia"
       onclick="trackPlatformClick('grubhub')"
       class="platform-btn grubhub">
      <img src="grubhub-logo.svg" alt="Grubhub">
      <span>Order on Grubhub</span>
      <span class="delivery-time">35-45 min</span>
    </a>
  </div>

  <div class="platform-features">
    <p>✅ All customization options available in-app</p>
    <p>🚚 Real-time delivery tracking</p>
    <p>💳 Multiple payment options</p>
  </div>
</section>
```

## JavaScript Implementation

### Analytics Only (No State Management)
```javascript
// track.js - Analytics only, no order state
function trackPlatformClick(platform) {
  // GA4 Event
  gtag('event', 'platform_click', {
    'event_category': 'conversion',
    'event_label': platform,
    'value': 1
  });

  // Optional: Track what they were viewing
  const lastViewedSize = sessionStorage.getItem('last_viewed_size');
  if (lastViewedSize) {
    gtag('event', 'platform_click_with_interest', {
      'platform': platform,
      'interested_in': lastViewedSize
    });
  }
}

function trackSectionView(section) {
  gtag('event', 'section_view', {
    'event_category': 'engagement',
    'section_name': section
  });
}

function trackQuickPickView(combo) {
  gtag('event', 'quick_pick_view', {
    'event_category': 'menu',
    'combo_name': combo
  });
}

// Track scroll depth
let maxScroll = 0;
window.addEventListener('scroll', debounce(() => {
  const scrollPercent = (window.scrollY / document.body.scrollHeight) * 100;
  if (scrollPercent > maxScroll) {
    maxScroll = scrollPercent;
    if (maxScroll > 75) {
      gtag('event', 'scroll_depth', {
        'event_category': 'engagement',
        'depth': '75_percent'
      });
    }
  }
}, 500));
```

### Smooth Scroll Navigation
```javascript
// navigation.js
function scrollToSection(selector) {
  const element = document.querySelector(selector);
  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });

    // Track navigation
    trackSectionView(selector.replace('#', ''));
  }
}

// Auto-highlight platform buttons when in view
const observerOptions = {
  root: null,
  rootMargin: '0px',
  threshold: 0.5
};

const platformObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      trackSectionView('platform-selection');
    }
  });
}, observerOptions);

const platformSection = document.querySelector('#order-now');
if (platformSection) {
  platformObserver.observe(platformSection);
}
```

### Performance Optimizations
```javascript
// images.js - Lazy load images
const imageObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      img.classList.add('loaded');
      imageObserver.unobserve(img);
    }
  });
});

document.querySelectorAll('img[data-src]').forEach(img => {
  imageObserver.observe(img);
});
```

## CSS Structure (Mobile-First)
```css
/* Base mobile styles */
.platform-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
}

.platform-btn {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-radius: 12px;
  min-height: 60px; /* Touch-friendly */
  text-decoration: none;
  transition: transform 0.2s;
}

.platform-btn:active {
  transform: scale(0.98);
}

/* Tablet and up */
@media (min-width: 768px) {
  .platform-buttons {
    flex-direction: row;
    justify-content: center;
  }

  .combo-cards,
  .size-cards,
  .sauce-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
  }
}

/* Sticky CTA on mobile */
@media (max-width: 767px) {
  .sticky-cta {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 1rem;
    background: white;
    box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
    z-index: 100;
  }
}
```

## Firebase Configuration (Analytics Only)

### Firestore Collections
```javascript
// NO wing_orders collection needed!
// Only store platform catalog for reference

// platformCatalogs/{platform}
{
  platform: 'doordash',
  storeUrl: 'https://www.doordash.com/store/...',
  storeId: '123456',
  availableItems: ['6-wings', '12-wings', '24-wings', '30-wings', '50-wings'],
  lastUpdated: timestamp
}
```

### Analytics Events to Track
```javascript
// Key events for GA4
const ANALYTICS_EVENTS = {
  // Primary conversions
  'platform_click': { platform: 'doordash|ubereats|grubhub' },

  // Engagement metrics
  'quick_pick_view': { combo_name: string },
  'size_card_view': { size: number },
  'sauce_gallery_view': { sauce: string },

  // User journey
  'time_to_platform': { seconds: number },
  'scroll_depth': { percent: number },
  'bounce': { at_section: string },

  // A/B testing
  'variant_view': { test_name: string, variant: string }
};
```

## Success Metrics

### Primary KPIs
- **Platform CTR:** >70% (visitors who click through to delivery apps)
- **Time to platform click:** <15 seconds
- **Bounce rate:** <30%
- **Mobile performance:** Lighthouse score >90

### Secondary Metrics
- Quick Pick engagement rate
- Most viewed menu sections before clicking platform
- Platform preference distribution
- Peak ordering times

### A/B Testing Opportunities
1. Quick Picks above fold vs Menu first
2. Number of Quick Pick options (3 vs 5)
3. Platform button styles (logos only vs with delivery times)
4. Sticky CTA vs in-flow buttons
5. Sauce gallery layout (grid vs carousel)

## Implementation Checklist

### Must Have (Day 1)
- [ ] Hero with dual CTAs (View Menu / Order Now)
- [ ] Quick Picks section with 3 popular combos
- [ ] Wing sizes display with badges
- [ ] Platform selection with 3 delivery options
- [ ] GA4 analytics tracking
- [ ] Mobile-responsive layout
- [ ] Image lazy loading

### Should Have (Day 2-3)
- [ ] Sauce gallery with heat indicators
- [ ] Wing types education section
- [ ] Sides showcase
- [ ] Smooth scroll navigation
- [ ] Intersection Observer for analytics
- [ ] Loading states for images

### Nice to Have (Future)
- [ ] Delivery time estimates (via API)
- [ ] Dynamic "trending" badges from analytics
- [ ] Seasonal menu items section
- [ ] Customer photos gallery
- [ ] Live order count (if available from platforms)

## Key Differences from Cart-Based Approach

### What We DON'T Build
- ❌ No form inputs or selectors
- ❌ No order state management
- ❌ No Firebase order documents
- ❌ No deep linking with modifiers
- ❌ No "Add to Cart" buttons
- ❌ No checkout flow
- ❌ No price calculations

### What We DO Build
- ✅ Beautiful menu photography
- ✅ Clear information hierarchy
- ✅ Educational content about options
- ✅ Fast path to platform selection
- ✅ Analytics-driven optimization
- ✅ Trust signals (delivery times, features)
- ✅ Mobile-first responsive design

## Content Guidelines

### Photography Requirements
- High-res hero images (2000px width, compressed)
- Consistent lighting and angles
- Show sauce/cooking detail
- Include lifestyle shots (people enjoying)

### Copy Voice
- Excited but not pushy
- Descriptive but concise
- Focus on taste and quality
- Clear about platform handoff

### Naming Consistency
Must match EXACTLY across all platforms:
- "30 PC Classic Wings" (not "30 Piece" or "30pc")
- "Buffalo Sauce" (not "Buffalo Style" or "Hot Buffalo")
- "Classic Lemon Pepper" (consistent across platforms)

## Definition of Done

### Functionality
- [ ] All Quick Picks link to platform section
- [ ] All size cards link to platform section
- [ ] Platform buttons open correct store pages
- [ ] Analytics fire on all key interactions
- [ ] Images lazy load properly
- [ ] Site loads in <3 seconds on 3G

### User Experience
- [ ] Time to platform click <15 seconds
- [ ] All touch targets ≥44px
- [ ] Smooth scroll between sections
- [ ] Clear visual hierarchy
- [ ] No confusing cart-like interactions

### Analytics
- [ ] GA4 properly configured
- [ ] All events firing correctly
- [ ] Platform clicks tracked
- [ ] Engagement metrics visible

### Testing
- [ ] Mobile responsive (320px to 414px)
- [ ] Tablet responsive (768px+)
- [ ] Desktop responsive (1024px+)
- [ ] Cross-browser (Chrome, Safari, Firefox)
- [ ] Accessibility (WCAG 2.1 AA)