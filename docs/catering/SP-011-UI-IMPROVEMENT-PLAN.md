# SP-011 Desserts UI Improvement Plan

**Date**: 2025-11-07
**Issue**: Desktop dessert cards are too large, UI needs drastic improvement
**Current Pattern**: Following SP-009 dips counter selector pattern
**Goal**: Create a more compact, elegant, and user-friendly desserts selection experience

---

## Current Issues Analysis

### Problems Identified

1. **Card Size**: Dessert cards likely using same dimensions as dips/sides, making them oversized for desktop
2. **Layout Inefficiency**: 5 desserts in a large card grid waste screen real estate
3. **Visual Hierarchy**: Image-heavy cards may dominate when desserts are optional add-ons
4. **Mobile-First Overflow**: Pattern optimized for mobile may not scale well to desktop

### Current Structure (From Code Review)

```html
<div class="dessert-card">
  <div class="dessert-card-image">
    <img src="..." class="dessert-img">
    <div class="allergen-badges">...</div>
  </div>
  <div class="dessert-card-content">
    <h5 class="dessert-card-name">Dessert Name</h5>
    <p class="dessert-card-description">Description text</p>
    <p class="dessert-card-details">
      <span>5 servings</span>
      <span>$12.99</span>
    </p>
  </div>
  <div class="dessert-counter-controls">
    <button>−</button>
    <span>0</span>
    <button>+</button>
  </div>
  <p class="dessert-unit-label">five-packs</p>
</div>
```

**Assumptions**:
- Grid layout with large photo cards
- Vertical card orientation
- Full image display for each dessert
- Counter below image/description

---

## Mockup Option 1: Compact Horizontal List

**Design Philosophy**: Minimize vertical space, maximize information density

### Visual Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│ 🍰 Desserts                   2 five-packs included (10 desserts)   │
│ ☐ Skip Desserts (credit -$24.99)                                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│ ┌──────┬─────────────────────────────────────────┬────────────────┐ │
│ │ [📷] │ Gourmet Brownies                        │  [−] 0 [+]     │ │
│ │ 80px │ Rich chocolate brownies (5 servings)    │  $12.99        │ │
│ └──────┴─────────────────────────────────────────┴────────────────┘ │
│                                                                       │
│ ┌──────┬─────────────────────────────────────────┬────────────────┐ │
│ │ [📷] │ NY Cheesecake                           │  [−] 2 [+]     │ │
│ │ 80px │ Classic New York style (5 servings)     │  $15.99        │ │
│ └──────┴─────────────────────────────────────────┴────────────────┘ │
│                                                                       │
│ ┌──────┬─────────────────────────────────────────┬────────────────┐ │
│ │ [📷] │ Red Velvet Cake                         │  [−] 1 [+]     │ │
│ │ 80px │ Cream cheese frosting (5 servings)      │  $14.99        │ │
│ └──────┴─────────────────────────────────────────┴────────────────┘ │
│                                                                       │
│ ... (2 more desserts)                                                │
│                                                                       │
│ Total: 3 five-packs (15 individual desserts)                         │
└─────────────────────────────────────────────────────────────────────┘
```

### Key Features

- **Horizontal rows** instead of vertical cards
- **Small thumbnail** (80×80px) on left
- **Inline counter** on right side
- **Single-line description** with price
- **List-style layout** like a menu
- **Responsive**: Stacks on mobile (card-style)

### HTML Structure

```html
<div class="desserts-list-layout">
  <div class="dessert-row" data-dessert-id="...">
    <div class="dessert-thumbnail">
      <img src="..." class="dessert-thumb-img">
    </div>
    <div class="dessert-info-inline">
      <h5 class="dessert-name-inline">Gourmet Brownies</h5>
      <p class="dessert-description-inline">Rich chocolate brownies (5 servings)</p>
    </div>
    <div class="dessert-price-inline">$12.99</div>
    <div class="dessert-counter-inline">
      <button class="counter-btn counter-minus">−</button>
      <span class="counter-display">0</span>
      <button class="counter-btn counter-plus">+</button>
    </div>
  </div>
</div>
```

### CSS Key Points

```css
.dessert-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e5e7eb;
  transition: background 0.2s;
}

.dessert-row:hover {
  background: #f9fafb;
}

.dessert-thumbnail {
  width: 80px;
  height: 80px;
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
}

.dessert-info-inline {
  flex: 1;
  min-width: 0;
}

.dessert-name-inline {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
}

.dessert-description-inline {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dessert-price-inline {
  font-weight: 600;
  color: #059669;
  margin-right: 1.5rem;
}

.dessert-counter-inline {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Mobile: Convert to card layout */
@media (max-width: 768px) {
  .dessert-row {
    flex-direction: column;
    align-items: stretch;
  }

  .dessert-thumbnail {
    width: 100%;
    height: 150px;
  }
}
```

### Advantages

✅ **Space Efficient**: 5 desserts fit in ~500px vertical space
✅ **Scannable**: Easy to compare prices and options
✅ **Fast Selection**: Counter immediately visible
✅ **Professional**: Clean, restaurant menu aesthetic
✅ **Responsive**: Graceful mobile degradation

### Disadvantages

❌ Small images may not showcase desserts well
❌ Less visual appeal than photo cards
❌ Description truncation may hide important info

---

## Mockup Option 2: Compact Card Grid (2-3 Columns)

**Design Philosophy**: Maintain card aesthetic but reduce size dramatically

### Visual Layout (Desktop 3-column)

```
┌───────────────────────────────────────────────────────────────────┐
│ 🍰 Desserts                 2 five-packs included (10 desserts)   │
│ ☐ Skip Desserts (credit -$24.99)                                  │
├───────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐                           │
│  │ [Photo] │  │ [Photo] │  │ [Photo] │                           │
│  │ 150×100 │  │ 150×100 │  │ 150×100 │                           │
│  ├─────────┤  ├─────────┤  ├─────────┤                           │
│  │Brownies │  │Cheesecak│  │Red Velve│                           │
│  │$12.99   │  │$15.99   │  │$14.99   │                           │
│  │[−] 0 [+]│  │[−] 2 [+]│  │[−] 1 [+]│                           │
│  └─────────┘  └─────────┘  └─────────┘                           │
│                                                                     │
│  ┌─────────┐  ┌─────────┐                                         │
│  │ [Photo] │  │ [Photo] │                                         │
│  │ 150×100 │  │ 150×100 │                                         │
│  ├─────────┤  ├─────────┤                                         │
│  │Pound Cak│  │Creme Bru│                                         │
│  │$13.99   │  │$16.99   │                                         │
│  │[−] 0 [+]│  │[−] 0 [+]│                                         │
│  └─────────┘  └─────────┘                                         │
│                                                                     │
│ Total: 3 five-packs (15 individual desserts)                       │
└───────────────────────────────────────────────────────────────────┘
```

### Key Features

- **3-column grid** on desktop (2-col tablet, 1-col mobile)
- **Smaller cards**: ~150px wide vs current large cards
- **16:9 aspect ratio** for images (150×100px)
- **Minimal text**: Name + price only
- **Counter integrated** into card footer
- **Hover effects** for visual feedback

### HTML Structure

```html
<div class="desserts-compact-grid">
  <div class="dessert-card-compact" data-dessert-id="...">
    <div class="dessert-card-compact-image">
      <img src="..." class="dessert-compact-img">
      <span class="dessert-servings-badge">5 servings</span>
    </div>
    <div class="dessert-card-compact-body">
      <h5 class="dessert-compact-name">Gourmet Brownies</h5>
      <p class="dessert-compact-price">$12.99</p>
      <div class="dessert-compact-counter">
        <button class="counter-btn counter-minus">−</button>
        <span class="counter-display">0</span>
        <button class="counter-btn counter-plus">+</button>
      </div>
    </div>
  </div>
</div>
```

### CSS Key Points

```css
.desserts-compact-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  padding: 1rem 0;
}

@media (max-width: 1024px) {
  .desserts-compact-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .desserts-compact-grid {
    grid-template-columns: 1fr;
  }
}

.dessert-card-compact {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s;
  cursor: pointer;
}

.dessert-card-compact:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transform: translateY(-2px);
}

.dessert-card-compact-image {
  position: relative;
  width: 100%;
  aspect-ratio: 3/2;
  overflow: hidden;
  background: #f3f4f6;
}

.dessert-compact-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.dessert-servings-badge {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: rgba(0,0,0,0.7);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
}

.dessert-card-compact-body {
  padding: 0.75rem;
  text-align: center;
}

.dessert-compact-name {
  font-size: 0.875rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dessert-compact-price {
  font-size: 1rem;
  font-weight: 700;
  color: #059669;
  margin: 0 0 0.75rem 0;
}

.dessert-compact-counter {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
}

.counter-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid #d1d5db;
  background: white;
  font-size: 1.25rem;
  line-height: 1;
  cursor: pointer;
  transition: all 0.2s;
}

.counter-btn:hover:not(:disabled) {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.counter-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.counter-display {
  font-size: 1.125rem;
  font-weight: 600;
  min-width: 2rem;
  text-align: center;
}
```

### Advantages

✅ **Visual Appeal**: Still shows dessert photos prominently
✅ **Compact**: 3 columns means better space usage
✅ **Familiar Pattern**: Maintains card-based UI consistency
✅ **Responsive Grid**: CSS Grid handles all screen sizes
✅ **Hover Feedback**: Interactive feel for desktop users

### Disadvantages

❌ Still takes more vertical space than list view
❌ Descriptions hidden (only visible on hover?)
❌ Small cards may feel cramped on mobile

---

## Mockup Option 3: Hybrid "Carousel + Quick Select"

**Design Philosophy**: Best of both worlds - visual showcase + compact selection

### Visual Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ 🍰 Desserts                 2 five-packs included (10 desserts) │
│ ☐ Skip Desserts (credit -$24.99)                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│ ┌───────────────────────────────────────────────────────────┐   │
│ │  Featured Dessert Carousel                                │   │
│ │  ┌─────────────────────────────────────────────────────┐  │   │
│ │  │                                                       │  │   │
│ │  │         [Large Photo of Cheesecake]                  │  │   │
│ │  │              300×200px                                │  │   │
│ │  │                                                       │  │   │
│ │  │  ← NY Cheesecake - $15.99 (5 servings) →            │  │   │
│ │  │     Classic New York style with graham crust         │  │   │
│ │  │                                                       │  │   │
│ │  │              [−]  2  [+]                              │  │   │
│ │  └─────────────────────────────────────────────────────┘  │   │
│ │  ● ○ ○ ○ ○  (carousel indicators)                        │   │
│ └───────────────────────────────────────────────────────────┘   │
│                                                                   │
│ ┌───────────────────────────────────────────────────────────┐   │
│ │  Quick Add Menu                                           │   │
│ │  ┌────────────────┬────────────────┬────────────────────┐ │   │
│ │  │ Brownies       │ Pound Cake     │ Red Velvet         │ │   │
│ │  │ $12.99 [+]  0  │ $13.99 [+]  0  │ $14.99 [+]  1      │ │   │
│ │  └────────────────┴────────────────┴────────────────────┘ │   │
│ │  ┌────────────────┬────────────────┐                      │   │
│ │  │ Creme Brulee   │                │                      │   │
│ │  │ $16.99 [+]  0  │                │                      │   │
│ │  └────────────────┴────────────────┘                      │   │
│ └───────────────────────────────────────────────────────────┘   │
│                                                                   │
│ Total: 3 five-packs (15 individual desserts)                     │
└─────────────────────────────────────────────────────────────────┘
```

### Key Features

- **Top Section**: Image carousel showcasing desserts
  - Large photo (300×200px)
  - Left/right arrows
  - Full description visible
  - Counter for featured item
  - Auto-rotation optional

- **Bottom Section**: Quick-add menu (compact chips)
  - Name + price + quick-add button
  - Shows current quantity
  - Click item to show in carousel above
  - Grid of compact buttons

### HTML Structure

```html
<div class="desserts-hybrid-layout">
  <!-- Carousel Section -->
  <div class="dessert-carousel">
    <button class="carousel-prev" aria-label="Previous dessert">‹</button>
    <div class="carousel-content">
      <div class="carousel-slide active" data-dessert-id="ny-cheesecake">
        <img src="..." class="carousel-img">
        <div class="carousel-info">
          <h4 class="carousel-dessert-name">NY Cheesecake</h4>
          <p class="carousel-dessert-price">$15.99 <span class="servings-note">(5 servings)</span></p>
          <p class="carousel-dessert-description">Classic New York style with graham crust</p>
          <div class="carousel-counter">
            <button class="counter-btn counter-minus">−</button>
            <span class="counter-display">2</span>
            <button class="counter-btn counter-plus">+</button>
          </div>
        </div>
      </div>
    </div>
    <button class="carousel-next" aria-label="Next dessert">›</button>
    <div class="carousel-indicators">
      <span class="indicator active"></span>
      <span class="indicator"></span>
      <span class="indicator"></span>
      <span class="indicator"></span>
      <span class="indicator"></span>
    </div>
  </div>

  <!-- Quick Select Menu -->
  <div class="dessert-quick-menu">
    <h5 class="quick-menu-title">Quick Add</h5>
    <div class="quick-menu-grid">
      <div class="quick-menu-item" data-dessert-id="gourmet-brownies">
        <div class="quick-item-info">
          <span class="quick-item-name">Brownies</span>
          <span class="quick-item-price">$12.99</span>
        </div>
        <div class="quick-item-controls">
          <button class="quick-add-btn">+</button>
          <span class="quick-item-qty">0</span>
        </div>
      </div>
      <!-- Repeat for other desserts -->
    </div>
  </div>
</div>
```

### CSS Key Points

```css
/* Carousel */
.dessert-carousel {
  position: relative;
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 1.5rem;
}

.carousel-content {
  display: flex;
  overflow: hidden;
  border-radius: 8px;
}

.carousel-slide {
  display: none;
  flex-direction: row;
  gap: 2rem;
  align-items: center;
  min-width: 100%;
}

.carousel-slide.active {
  display: flex;
}

.carousel-img {
  width: 300px;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.carousel-info {
  flex: 1;
}

.carousel-dessert-name {
  font-size: 1.5rem;
  margin: 0 0 0.5rem 0;
}

.carousel-dessert-price {
  font-size: 1.25rem;
  font-weight: 700;
  color: #059669;
  margin: 0 0 0.75rem 0;
}

.carousel-dessert-description {
  color: #6b7280;
  margin: 0 0 1rem 0;
}

.carousel-prev,
.carousel-next {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: white;
  border: none;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  font-size: 2rem;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: all 0.2s;
}

.carousel-prev { left: 1rem; }
.carousel-next { right: 1rem; }

.carousel-prev:hover,
.carousel-next:hover {
  background: #f3f4f6;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.carousel-indicators {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
}

.indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #d1d5db;
  cursor: pointer;
  transition: all 0.2s;
}

.indicator.active {
  background: #059669;
  transform: scale(1.25);
}

/* Quick Menu */
.dessert-quick-menu {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
}

.quick-menu-title {
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  color: #6b7280;
  margin: 0 0 0.75rem 0;
  letter-spacing: 0.05em;
}

.quick-menu-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}

@media (max-width: 640px) {
  .quick-menu-grid {
    grid-template-columns: 1fr;
  }
}

.quick-menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.quick-menu-item:hover {
  background: #f9fafb;
  border-color: #059669;
}

.quick-item-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.quick-item-name {
  font-size: 0.875rem;
  font-weight: 600;
}

.quick-item-price {
  font-size: 0.75rem;
  color: #059669;
  font-weight: 700;
}

.quick-item-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.quick-add-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #059669;
  color: white;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  transition: all 0.2s;
}

.quick-add-btn:hover {
  background: #047857;
  transform: scale(1.1);
}

.quick-item-qty {
  font-size: 0.875rem;
  font-weight: 600;
  min-width: 1.5rem;
  text-align: center;
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .carousel-slide {
    flex-direction: column;
  }

  .carousel-img {
    width: 100%;
    height: 200px;
  }

  .carousel-prev,
  .carousel-next {
    width: 36px;
    height: 36px;
    font-size: 1.5rem;
  }
}
```

### Advantages

✅ **Visual Showcase**: Large carousel highlights desserts beautifully
✅ **Quick Selection**: Fast add via bottom menu
✅ **Engaging UX**: Interactive carousel is fun to browse
✅ **Space Efficient**: Compact quick-add menu
✅ **Dual Interface**: Browse (carousel) + quick-add (menu)
✅ **Mobile-Friendly**: Carousel works well on touch devices

### Disadvantages

❌ More complex to implement
❌ Requires carousel JavaScript logic
❌ Two interaction patterns may confuse some users
❌ Takes more vertical space than Option 1

---

## Comparison Matrix

| Feature | Option 1: List | Option 2: Compact Grid | Option 3: Hybrid Carousel |
|---------|----------------|------------------------|---------------------------|
| **Vertical Space** | 🟢 Minimal (~500px) | 🟡 Moderate (~600px) | 🔴 Larger (~700px) |
| **Visual Appeal** | 🔴 Low (tiny thumbs) | 🟢 Good (cards) | 🟢 Excellent (large photos) |
| **Information Density** | 🟢 High | 🟡 Medium | 🟡 Medium |
| **Mobile Experience** | 🟢 Excellent | 🟢 Good | 🟡 Good (carousel can be tricky) |
| **Development Effort** | 🟢 Low | 🟢 Low | 🔴 High (carousel logic) |
| **Accessibility** | 🟢 Excellent | 🟢 Good | 🟡 Moderate (complex controls) |
| **User Familiarity** | 🟢 Very familiar | 🟢 Familiar | 🟡 Unique |
| **Speed of Selection** | 🟢 Fast | 🟢 Fast | 🟡 Moderate |
| **Scalability** | 🟢 Handles many items | 🟡 Gets crowded >8 items | 🟢 Works with any count |

**Legend**: 🟢 Best | 🟡 Good | 🔴 Concern

---

## Recommended Approach

### Primary Recommendation: **Option 1 (Compact Horizontal List)**

**Why?**

1. **Solves Core Problem**: Drastically reduces card size - exactly what user requested
2. **Desktop Optimized**: Makes excellent use of wide screens
3. **Fast Implementation**: Simplest CSS changes, minimal JS refactoring
4. **Professional**: Restaurant menu aesthetic fits catering context
5. **Accessible**: Screen readers handle lists excellently
6. **Responsive**: Mobile fallback to card-style is straightforward

### Alternative Recommendation: **Option 2 (Compact Grid)**

Use if:
- Visual appeal is higher priority than space efficiency
- Users prefer browsing photos over scanning text
- Desserts are a premium upsell feature
- Consistency with other card-based sections matters

### Experimental Option: **Option 3 (Hybrid Carousel)**

Use if:
- Desserts are a major selling point
- Want to create a unique, memorable experience
- Have time for more complex development
- Users are tech-savvy enough for dual interfaces

---

## Implementation Plan (Option 1 - Recommended)

### Phase 1: CSS Updates (30 min)

1. Create `.desserts-list-layout` container class
2. Style `.dessert-row` with flexbox
3. Responsive breakpoints for mobile card fallback
4. Update counter button styles for inline display
5. Add hover states and transitions

### Phase 2: HTML Structure (15 min)

1. Refactor `renderDessertCard()` to `renderDessertRow()`
2. Restructure div layout from vertical to horizontal
3. Update class names to match new pattern
4. Ensure data attributes preserved for JS

### Phase 3: JavaScript (Minimal Changes - 10 min)

1. Update selectors if class names changed
2. No logic changes needed (counter handlers stay same)
3. Test counter increment/decrement
4. Verify state management still works

### Phase 4: Testing (20 min)

1. Desktop: Verify compact layout, spacing, alignment
2. Tablet: Check 2-column or list behavior
3. Mobile: Confirm card fallback works
4. Accessibility: Keyboard navigation, screen readers
5. Cross-browser: Chrome, Firefox, Safari

**Total Estimated Time: ~75 minutes**

---

## Visual Design Specifications (Option 1)

### Color Palette

```css
--dessert-bg: #ffffff;
--dessert-border: #e5e7eb;
--dessert-hover-bg: #f9fafb;
--dessert-text-primary: #111827;
--dessert-text-secondary: #6b7280;
--dessert-price-color: #059669;
--dessert-counter-border: #d1d5db;
--dessert-counter-hover: #9ca3af;
```

### Typography

```css
.dessert-name-inline {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.25;
  color: var(--dessert-text-primary);
}

.dessert-description-inline {
  font-size: 14px;
  line-height: 1.5;
  color: var(--dessert-text-secondary);
}

.dessert-price-inline {
  font-size: 16px;
  font-weight: 700;
  color: var(--dessert-price-color);
}
```

### Spacing

```css
.dessert-row {
  padding: 12px 16px; /* Compact but not cramped */
  gap: 16px; /* Consistent spacing between elements */
}

.desserts-list-layout {
  margin-top: 16px;
  margin-bottom: 24px;
}
```

### Interactions

```css
/* Hover State */
.dessert-row:hover {
  background-color: var(--dessert-hover-bg);
  cursor: pointer;
  transition: background-color 0.2s ease;
}

/* Focus State (Accessibility) */
.dessert-row:focus-within {
  outline: 2px solid #059669;
  outline-offset: 2px;
}

/* Counter Button States */
.counter-btn:hover:not(:disabled) {
  background-color: var(--dessert-hover-bg);
  border-color: var(--dessert-counter-hover);
  transform: scale(1.05);
}

.counter-btn:active:not(:disabled) {
  transform: scale(0.95);
}

.counter-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
```

---

## Accessibility Checklist

### Option 1 (List Layout)

- [ ] Semantic HTML: Use `<ul>` for list container
- [ ] ARIA roles: `role="listitem"` for each row
- [ ] Keyboard navigation: Tab through rows, Space/Enter to interact
- [ ] Screen reader labels: Descriptive aria-labels on buttons
- [ ] Focus indicators: Clear outline on focused elements
- [ ] Color contrast: Minimum 4.5:1 ratio for all text
- [ ] Touch targets: Minimum 44×44px for buttons (mobile)
- [ ] Skip link: Allow users to skip desserts section if desired

### Example Accessible Markup

```html
<ul class="desserts-list-layout" role="list" aria-label="Available desserts">
  <li class="dessert-row" role="listitem" data-dessert-id="gourmet-brownies">
    <img src="..." alt="Gourmet Brownies - rich chocolate dessert">
    <div class="dessert-info-inline">
      <h5 id="dessert-brownies-name">Gourmet Brownies</h5>
      <p id="dessert-brownies-desc">Rich chocolate brownies (5 servings)</p>
    </div>
    <span class="dessert-price-inline" aria-label="Price: $12.99">$12.99</span>
    <div class="dessert-counter-inline" role="group" aria-labelledby="dessert-brownies-name">
      <button
        class="counter-btn counter-minus"
        aria-label="Decrease Gourmet Brownies quantity"
        aria-describedby="dessert-brownies-qty">
        −
      </button>
      <span
        id="dessert-brownies-qty"
        class="counter-display"
        role="status"
        aria-live="polite"
        aria-atomic="true">
        0
      </span>
      <button
        class="counter-btn counter-plus"
        aria-label="Increase Gourmet Brownies quantity"
        aria-describedby="dessert-brownies-qty">
        +
      </button>
    </div>
  </li>
</ul>
```

---

## Next Steps

1. **User Decision**: Which mockup option to proceed with?
2. **Design Review**: Share mockups with stakeholders
3. **CSS Framework**: Create stylesheet for chosen option
4. **Component Refactor**: Update desserts-counter-selector.js
5. **Testing**: Validate on PR preview
6. **Iteration**: Gather feedback and refine

---

**Questions for User:**

1. Which mockup option resonates most with your vision?
2. Is space efficiency or visual appeal the higher priority?
3. Are there any specific design requirements (brand colors, fonts)?
4. Should desserts have more or less visual prominence than dips/sides?
5. Do you want me to proceed with implementation of Option 1 immediately?

---

**Created by**: Claude Code
**Date**: 2025-11-07
**Status**: Awaiting user feedback on mockup selection
