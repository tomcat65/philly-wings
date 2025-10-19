# Boxed Meals V2 - CSS Style Guide

## 📁 Files Created

### 1. `src/styles/boxed-meals-v2.css` (1,100+ lines)
Main stylesheet with all component styles

### 2. `src/styles/boxed-meals-animations.css` (450+ lines)
Animation library for micro-interactions

---

## 🎨 Design System

### Color Palette

```css
/* Primary Brand */
--philly-orange: #ff6b35;
--philly-orange-dark: #e55a28;
--philly-orange-light: #ff8555;

/* Gray Scale */
--gray-50 through --gray-900

/* Status Colors */
--success: #10b981;
--warning: #f59e0b;
--error: #ef4444;
--info: #3b82f6;
```

### Spacing Scale

```css
--spacing-xs: 4px
--spacing-sm: 8px
--spacing-md: 16px
--spacing-lg: 24px
--spacing-xl: 32px
--spacing-2xl: 48px
```

### Border Radius

```css
--radius-sm: 6px
--radius-md: 8px
--radius-lg: 12px
--radius-xl: 16px
```

### Shadows

```css
--shadow-sm: subtle elevation
--shadow-md: card elevation
--shadow-lg: hover state
--shadow-xl: modal/overlay
```

---

## 📱 Responsive Breakpoints

### Mobile First Approach

```css
/* Base styles: Mobile (< 640px) */
.template-grid {
  grid-template-columns: 1fr;
}

/* Small tablets (640px+) */
@media (min-width: 640px) {
  .template-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Tablets (768px+) */
@media (min-width: 768px) {
  .template-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop (1024px+) */
@media (min-width: 1024px) {
  .template-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .configuration-container {
    grid-template-columns: 1fr 400px; /* 60/40 split */
  }
}
```

### Key Responsive Behaviors

**Desktop (1024px+):**
- Template cards: 3-column grid
- Configuration: 60% main / 40% preview sidebar
- Preview panel: Sticky positioned
- Photo cards: 3-4 column grids

**Tablet (768-1023px):**
- Template cards: 2-column grid
- Configuration: Stacked layout
- Preview panel: Stacked below config
- Photo cards: 2-3 column grids

**Mobile (<768px):**
- Template cards: Single column
- Configuration: Full width
- Preview panel: Fixed bottom sheet (max-height: 50vh)
- Photo cards: 1-2 column grids
- Compact spacing

---

## 🎭 Component Styles

### Template Selector

#### Template Cards
```css
.template-card {
  /* Card Container */
  background: white;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);

  /* Hover Effects */
  transition: transform 200ms, box-shadow 200ms;
}

.template-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-xl);
  border-color: var(--philly-orange);
}
```

#### Image Effects
```css
.template-image img {
  transition: transform 300ms;
}

.template-card:hover .template-image img {
  transform: scale(1.05); /* Zoom on hover */
}
```

#### Badges
```css
.template-badge {
  /* "Most Popular" badge */
  position: absolute;
  top: 16px;
  right: 16px;
  background: var(--philly-orange);
  color: white;
}

.template-social-proof {
  /* "47 orders this month" */
  position: absolute;
  bottom: 16px;
  left: 16px;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(4px);
}
```

---

### Photo Card Selectors

#### Card States
```css
.photo-card {
  /* Default */
  border: 2px solid var(--gray-200);
}

.photo-card:hover {
  border-color: var(--philly-orange-light);
  transform: translateY(-2px);
}

.photo-card.card-selected {
  border-color: var(--philly-orange);
  background: #fff7ed; /* Light orange tint */
}

.photo-card:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.2);
}
```

#### Selection Overlay
```css
.card-selected-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 107, 53, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
}

.selected-check {
  font-size: 3rem;
  color: white;
  animation: checkPop 200ms ease-out;
}
```

---

### Live Preview Panel

#### Sticky Positioning
```css
.live-preview-panel {
  position: sticky;
  top: var(--spacing-xl); /* 32px from top */

  /* Desktop */
  background: white;
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-lg);
}

/* Mobile: Bottom Sheet */
@media (max-width: 1023px) {
  .live-preview-panel {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    max-height: 50vh;
    overflow-y: auto;
    border-radius: var(--radius-xl) var(--radius-xl) 0 0;
    z-index: 100;
  }
}
```

#### Box Visualization
```css
.box-outline {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-sm);
}

.box-item {
  background: white;
  border-radius: var(--radius-md);
  padding: var(--spacing-sm);
  box-shadow: var(--shadow-sm);
}
```

#### Pricing Display
```css
.preview-pricing {
  background: linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%);
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
}

.price-value-large {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--philly-orange);
}
```

---

### Box Count Selector

```css
.count-presets {
  display: flex;
  gap: var(--spacing-sm);
}

.preset-btn {
  min-width: 80px;
  border: 2px solid var(--gray-300);
  transition: all 150ms;
}

.preset-btn.preset-active {
  background: var(--philly-orange);
  border-color: var(--philly-orange);
  color: white;
}
```

---

## 🎬 Animations

### Entrance Animations

#### Staggered Card Entrance
```css
.template-card {
  animation: fadeIn 400ms ease-out;
}

.template-card:nth-child(1) { animation-delay: 0ms; }
.template-card:nth-child(2) { animation-delay: 100ms; }
.template-card:nth-child(3) { animation-delay: 200ms; }
.template-card:nth-child(4) { animation-delay: 300ms; }
```

#### Preview Panel Slide-In
```css
.live-preview-panel {
  animation: slideInRight 400ms ease-out;
}

@media (max-width: 1023px) {
  .live-preview-panel {
    animation: slideInUp 300ms ease-out;
  }
}
```

---

### Interactive Animations

#### Card Click Pulse
```css
@keyframes cardPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(0.98); }
}

.photo-card.card-clicked {
  animation: cardPulse 300ms ease-out;
}
```

#### Selection Checkmark Pop
```css
@keyframes checkPop {
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

.selected-check {
  animation: checkPop 200ms ease-out;
}
```

#### Button Glow on Hover
```css
@keyframes glow {
  0%, 100% { box-shadow: 0 0 5px rgba(255, 107, 53, 0.3); }
  50% { box-shadow: 0 0 20px rgba(255, 107, 53, 0.6); }
}

.btn-primary:hover:not(:disabled) {
  animation: glow 2s ease-in-out infinite;
}
```

---

### Loading States

#### Shimmer Effect
```css
@keyframes shimmer {
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
}

.loading-shimmer {
  animation: shimmer 2s infinite;
  background: linear-gradient(
    to right,
    #f3f4f6 0%,
    #e5e7eb 20%,
    #f3f4f6 40%,
    #f3f4f6 100%
  );
  background-size: 1000px 100%;
}
```

#### Skeleton Placeholders
```css
[class*="skeleton-"] {
  background: linear-gradient(
    90deg,
    var(--gray-100) 0%,
    var(--gray-200) 50%,
    var(--gray-100) 100%
  );
  animation: shimmer 1.5s ease-in-out infinite;
}
```

---

### Validation Animations

#### Shake on Error
```css
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}

.validation-message {
  animation: shake 400ms ease-out;
}
```

#### Price Update Highlight
```css
@keyframes priceChange {
  0% { color: var(--philly-orange); transform: scale(1); }
  50% { color: var(--philly-orange-dark); transform: scale(1.1); }
  100% { color: var(--philly-orange); transform: scale(1); }
}

.price-value-large.price-updating {
  animation: priceChange 400ms ease-out;
}
```

---

## ♿ Accessibility Features

### Focus States

```css
.photo-card:focus {
  outline: none;
  border-color: var(--philly-orange);
  box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.2);
  animation: focusRing 600ms ease-out;
}
```

### Screen Reader Only

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

### Reduced Motion Support

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Touch Targets

All interactive elements have minimum 44px touch targets:

```css
.photo-card {
  min-height: 44px;
}

.preset-btn {
  min-width: 80px;
  padding: 8px 24px; /* Exceeds 44px height */
}
```

---

## 🎯 Button System

### Primary Buttons
```css
.btn-primary {
  background: var(--philly-orange);
  color: white;
  border: none;
}

.btn-primary:hover:not(:disabled) {
  background: var(--philly-orange-dark);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

### Secondary Buttons
```css
.btn-secondary {
  background: white;
  color: var(--philly-orange);
  border: 2px solid var(--philly-orange);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--philly-orange);
  color: white;
}
```

### Button Sizes
```css
.btn-large {
  font-size: 1.125rem;
  padding: 24px 32px;
}

.btn-sm {
  font-size: 0.875rem;
  padding: 4px 16px;
}
```

---

## 🖨️ Print Styles

```css
@media print {
  .btn-back,
  .btn-template-select,
  .btn-bulk-apply,
  .btn-request-quote {
    display: none;
  }

  .live-preview-panel {
    position: static;
    box-shadow: none;
    border: 1px solid var(--gray-300);
  }
}
```

---

## 🚀 Performance Notes

### GPU Acceleration
- All animations use `transform` and `opacity` (GPU-accelerated)
- Avoid animating `width`, `height`, `top`, `left`

### Transition Timing
- Fast: 150ms (button clicks, hovers)
- Base: 200ms (card interactions)
- Slow: 300ms (page transitions)

### Image Loading
- Images use `loading="lazy"` attribute
- Placeholder backgrounds while loading
- Shimmer effect for skeleton states

---

## 🎨 Usage Examples

### Adding a New Template Card

```html
<div class="template-card" data-template-id="new-template">
  <div class="template-image">
    <img src="path/to/image.jpg" alt="Template Name" loading="lazy">
    <span class="template-badge">New!</span>
  </div>
  <div class="template-content">
    <div class="template-title-row">
      <h3 class="template-name">Template Name</h3>
      <span class="template-heat">🌶️🌶️</span>
    </div>
    <p class="template-tagline">Short description</p>
    <p class="template-description">Longer description here...</p>
    <button class="btn-template-select btn-primary">
      Start with Template Name
    </button>
  </div>
</div>
```

### Adding a Photo Card

```html
<div class="photo-card" data-item-id="item-1" role="radio" tabindex="0">
  <div class="photo-card-image">
    <img src="path/to/item.jpg" alt="Item Name" class="card-img">
    <span class="card-heat-indicator">🌶️🌶️🌶️</span>
  </div>
  <div class="photo-card-content">
    <h5 class="card-title">Item Name</h5>
    <p class="card-description">Item description...</p>
    <span class="card-price">+$2.00</span>
  </div>
</div>
```

---

## 📝 Customization Guide

### Changing Brand Colors

Update CSS variables in `:root`:

```css
:root {
  --philly-orange: #your-color;
  --philly-orange-dark: #darker-shade;
  --philly-orange-light: #lighter-shade;
}
```

### Adjusting Spacing

Modify spacing scale:

```css
:root {
  --spacing-md: 20px; /* Instead of 16px */
  --spacing-xl: 40px; /* Instead of 32px */
}
```

### Customizing Animations

Adjust animation durations:

```css
:root {
  --transition-fast: 100ms;  /* Faster */
  --transition-base: 250ms;  /* Slower */
}
```

---

## 🐛 Troubleshooting

### Cards Not Animating
- Check if animations.css is imported
- Verify no `prefers-reduced-motion` setting
- Check browser supports CSS animations

### Preview Panel Not Sticky
- Verify parent has enough height
- Check `position: sticky` support
- Ensure no `overflow: hidden` on ancestors

### Images Not Loading
- Verify Firebase Storage URLs are correct
- Check CORS settings
- Ensure images exist at specified paths

---

**Created:** 2025-10-17
**Version:** 2.0
**Maintained by:** TomCat65
