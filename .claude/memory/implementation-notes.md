# Implementation Notes - Code Patterns That Work

## Firebase Optimization Patterns

### Smart Caching Strategy
```javascript
// Cache firestore reads for 5 minutes
const menuCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getCachedMenu = async (platform) => {
  const cached = menuCache.get(platform);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  
  const fresh = await firestore.collection('menus').doc(platform).get();
  menuCache.set(platform, { data: fresh.data(), timestamp: Date.now() });
  return fresh.data();
};
```

### Image Loading Pattern
```javascript
// Progressive image loading with blur-up effect
const loadImage = (img) => {
  const full = new Image();
  full.src = img.dataset.src;
  full.onload = () => {
    img.src = full.src;
    img.classList.add('loaded');
  };
};

// Intersection Observer for lazy loading
const imageObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      loadImage(entry.target);
      imageObserver.unobserve(entry.target);
    }
  });
});
```

## Platform Integration Patterns

### Menu Snapshot Creation
```javascript
// Create immutable snapshot for platform
const createMenuSnapshot = async (platform) => {
  const menuData = await firestore.collection('menuItems').get();
  const modifiers = await firestore.collection('modifierGroups').get();
  
  const snapshot = {
    platform,
    timestamp: Date.now(),
    version: generateVersion(),
    frozen: true,
    data: {
      items: menuData.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        price: doc.data().platformPricing[platform]
      })),
      modifiers: modifiers.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    }
  };
  
  return firestore.collection('publishedMenus').add(snapshot);
};
```

### Platform Price Display
```javascript
// Always show platform-specific pricing
const displayPrice = (item, platform) => {
  const price = item.platformPricing[platform];
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(price);
  
  return `<span class="price" data-platform="${platform}">${formatted}</span>`;
};
```

## Admin Panel Patterns

### Form Validation Helper
```javascript
// Reusable validation for menu items
const validateMenuItem = (data) => {
  const errors = {};
  
  if (!data.name || data.name.length < 3) {
    errors.name = 'Name must be at least 3 characters';
  }
  
  if (!data.basePrice || data.basePrice < 0) {
    errors.basePrice = 'Price must be positive';
  }
  
  // Platform prices must be higher than base
  ['doordash', 'ubereats', 'grubhub'].forEach(platform => {
    if (data.platformPricing[platform] < data.basePrice * 1.2) {
      errors[platform] = 'Platform price too low for margins';
    }
  });
  
  return Object.keys(errors).length ? errors : null;
};
```

## Performance Patterns

### Debounced Search
```javascript
// Prevent excessive Firebase queries
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
};

const searchMenu = debounce(async (query) => {
  const results = await firestore
    .collection('menuItems')
    .where('name', '>=', query)
    .where('name', '<=', query + '\uf8ff')
    .limit(10)
    .get();
  
  displaySearchResults(results);
}, 300);
```

## Error Handling Pattern
```javascript
// Consistent error handling across the app
const safeAsync = (fn) => async (...args) => {
  try {
    return await fn(...args);
  } catch (error) {
    console.error('Error:', error);
    
    // User-friendly messages
    const message = error.code === 'permission-denied' 
      ? 'Please log in to continue'
      : 'Something went wrong. Please try again.';
    
    showNotification(message, 'error');
    
    // Log to analytics
    analytics.track('error', {
      message: error.message,
      stack: error.stack,
      function: fn.name
    });
  }
};

// Usage
const saveMenuItem = safeAsync(async (data) => {
  await firestore.collection('menuItems').add(data);
  showNotification('Menu item saved!', 'success');
});
```

## CSS Patterns

### Mobile-First Responsive
```css
/* Base mobile styles */
.menu-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

/* Tablet and up */
@media (min-width: 768px) {
  .menu-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .menu-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
  }
}
```