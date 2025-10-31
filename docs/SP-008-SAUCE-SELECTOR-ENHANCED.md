# SP-008: Enhanced Sauce Photo Card Selector

**Status**: ✅ Component Built (Integration Pending)
**Created**: 2025-10-27
**Epic**: Shared Platters V2
**Priority**: MUST HAVE (Biggest Gap)

## Overview

Transform the static sauce showcase into an interactive Netflix-style photo card selector with multi-select capabilities, heat filtering, and social proof.

## Problem Statement

Current `sauce-selector.js` is a **static showcase** - it displays sauces beautifully but doesn't allow interactive selection during catering customization. This creates a gap in the user flow:

1. User completes conversational wizard
2. User sees package recommendations
3. User clicks "Customize Every Detail"
4. **🚨 GAP**: No interactive sauce selector in customization screen

## Solution

Enhanced photo-based multi-select sauce selector with:

- **Selection cart at top** - Visual feedback of chosen sauces
- **Netflix-style browsing** - Photo cards with hover effects
- **Heat level filtering** - All, Mild, Medium, Hot, Insane
- **Social proof badges** - ⭐ Popular, 🔥 Hot Pick, 🦅 Philly
- **Smart defaults pre-selected** - From preview anchor screen
- **Max selection enforcement** - Friendly validation messages
- **Mobile-first responsive** - Touch-friendly targets

## Files Created

### Components
- `/src/components/catering/sauce-photo-card-selector.js` - Main selector component
  - `renderSaucePhotoCardSelector(options)` - Render selector with cart
  - `initSaucePhotoCardSelector(maxSelections, onSelectionChange)` - Init interactions
  - `handleSauceCardClick()` - Selection/deselection logic
  - `updateCartDisplay()` - Live cart updates
  - `handleHeatFilter()` - Heat level filtering

### Styles
- `/src/styles/sauce-photo-card-selector.css` - Complete styling
  - Selection cart with completion states
  - Heat filter buttons
  - Photo cards with overlays
  - Social proof badges
  - Mobile responsive breakpoints
  - Animations (shake, pulse, slide-in)

## Key Features

### 1. Selection Cart at Top

```javascript
const cart = {
  header: '🌶️ Your Sauce Selection',
  counter: '2 / 3', // Live updates
  items: [
    { icon: '🟢', name: 'Honey BBQ', removable: true },
    { icon: '🟡', name: 'Philly Medium Buffalo', removable: true }
  ],
  tip: 'Pro Tip: Mix heat levels (mild, medium, hot) to satisfy everyone'
};
```

**Visual States**:
- Default: Orange gradient background
- Complete (3/3): Green gradient background
- Over limit: Red gradient background with shake animation

### 2. Heat Level Filtering

Five filter buttons:
- **All Sauces** (default)
- **🟢 Mild (0-1)** - No heat, all flavor
- **🟡 Medium (2-3)** - Gentle to medium kick
- **🔴 Hot (4)** - Hot & spicy
- **💀 Insane (5)** - Scorpion pepper madness

Filter logic:
```javascript
const heatCategories = {
  0: 'mild', 1: 'mild',
  2: 'medium', 3: 'medium',
  4: 'hot',
  5: 'insane'
};
```

### 3. Social Proof Badges

Automatically assigned based on data:
- **⭐ Popular** - Top sellers (Honey BBQ, Philly Medium, Lemon Pepper)
- **🔥 Hot Pick** - Trending (South Street Hot, Asian Zing)
- **🦅 Philly** - Philly Signature category

### 4. Smart Defaults Pre-Selected

Integration with Preview Anchor Screen smart defaults:

```javascript
// From preview anchor screen
const smartSauceDefaults = {
  corporate: ['honey-bbq', 'philly-medium', 'lemon-pepper'],
  sports: ['honey-bbq', 'philly-medium', 'south-street-hot'],
  party: ['honey-bbq', 'asian-zing', 'south-street-hot']
};

// Pass to selector
renderSaucePhotoCardSelector({
  maxSelections: 3,
  preSelectedIds: smartSauceDefaults[eventType],
  onSelectionChange: handleSauceChange
});
```

### 5. Max Selection Enforcement

Friendly UX when limit reached:

```javascript
function showMaxSelectionMessage(maxSelections) {
  // Display: "⚠️ Maximum 3 sauces selected. Remove one to add another."
  // Cart shakes with animation
  // Auto-dismiss after 3 seconds
  // No aggressive blocking - user understands constraint
}
```

## Usage Example

### In Customization Screen (SP-006)

```javascript
import {
  renderSaucePhotoCardSelector,
  initSaucePhotoCardSelector
} from './sauce-photo-card-selector.js';

// Render selector
const sauceSelectorHtml = await renderSaucePhotoCardSelector({
  maxSelections: packageData.sauceSelections, // e.g., 3
  preSelectedIds: state.currentConfig.sauces || [], // Smart defaults
  onSelectionChange: handleSauceSelectionChange
});

// Initialize after render
initSaucePhotoCardSelector(
  packageData.sauceSelections,
  (selectedSauceIds) => {
    // Update state
    updateState('currentConfig', {
      sauces: selectedSauceIds,
      saucesSource: 'manual'
    });

    // Update live pricing
    recalculateTotalPrice();
  }
);
```

## State Management

### State Structure

```javascript
{
  currentConfig: {
    sauces: ['honey-bbq', 'philly-medium', 'lemon-pepper'],
    saucesSource: 'smart-defaults' | 'manual'
  }
}
```

### Source Tracking

- `'smart-defaults'` - From preview anchor screen (pre-selected)
- `'manual'` - User manually changed selection

This allows us to:
1. Show "✓ Using smart defaults" badge if unchanged
2. Track conversion funnel (% who customize vs use defaults)
3. Analytics on sauce popularity by event type

## Mobile Responsiveness

### Breakpoints

- **< 640px (Mobile)**
  - Single column grid
  - Stacked cart items
  - Vertical filter buttons
  - 150px card images

- **640px - 767px (Small Tablet)**
  - 2 column grid
  - Wrapped cart items
  - Wrapped filter buttons
  - 180px card images

- **768px - 1023px (Tablet)**
  - 3 column grid
  - Inline cart items
  - Inline filter buttons

- **1024px+ (Desktop)**
  - 4 column grid
  - Full feature set

### Touch Targets

All interactive elements ≥44px for accessibility:
- Photo cards: min-height 44px
- Filter buttons: min-height 44px
- Cart remove buttons: 20x20px in 44px touch area

## Animations

### Card Selection
```css
@keyframes checkPop {
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}
```

### Cart Shake (Max Selection)
```css
@keyframes cartShake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-8px); }
  75% { transform: translateX(8px); }
}
```

### Cart Item Slide-In
```css
@keyframes itemSlideIn {
  from { transform: scale(0.8); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
```

All animations respect `prefers-reduced-motion: reduce`.

## Accessibility

### ARIA Attributes

```html
<div
  class="sauce-photo-card"
  role="checkbox"
  aria-checked="true"
  tabindex="0">
  <!-- Card content -->
</div>

<div class="cart-validation" role="alert">
  ⚠️ Maximum 3 sauces selected...
</div>

<button
  class="heat-filter-btn active"
  aria-pressed="true">
  All Sauces
</button>
```

### Keyboard Navigation

- **Tab** - Focus card
- **Enter/Space** - Toggle selection
- **Tab through filters** - Change heat level
- **Enter on filter** - Apply filter

## Performance

### Image Loading

```html
<img
  src="${sauce.imageUrl || getPlaceholderImage(sauce)}"
  alt="${sauce.name}"
  loading="lazy">
```

- Lazy loading for below-fold images
- Placeholder fallbacks for missing images
- Heat-level color-coded placeholders

### Firebase Query

```javascript
const q = query(
  collection(db, 'sauces'),
  where('active', '==', true),
  orderBy('sortOrder', 'asc')
);
```

Single optimized query with compound index.

## Conversion Psychology

### Trust Signals
- **Social proof badges** - "⭐ Popular" creates FOMO
- **Heat level transparency** - Builds confidence
- **Smart defaults pre-selected** - Reduces decision fatigue
- **Pro tips** - Positions us as experts

### Micro-Commitments
- Selecting first sauce → Easier to select 2nd & 3rd
- Visual cart fills up → Completion satisfaction
- Max limit badge → Achievement when complete

### Friction Reduction
- Pre-selected smart defaults → Skip if satisfied
- Heat filtering → Find preferences faster
- Visual browsing → Appetite appeal
- One-click removal from cart → Easy undo

## Integration Checklist

- [x] Component built (`sauce-photo-card-selector.js`)
- [x] Styles created (`sauce-photo-card-selector.css`)
- [x] CSS imported in `catering.js`
- [ ] Integrate into SP-006 Customization Screen
- [ ] Connect to Preview Anchor Screen smart defaults
- [ ] Wire up state management callbacks
- [ ] Test max selection enforcement
- [ ] Test heat filtering
- [ ] Verify mobile responsiveness
- [ ] Add analytics tracking
- [ ] Load test with all 14 sauces from Firestore

## Testing Scenarios

### Functional Testing
1. Pre-select 3 smart defaults → Verify cart shows all 3
2. Click 4th sauce → See validation message
3. Remove sauce from cart → Verify deselection in grid
4. Filter by heat level → Verify correct sauces shown
5. Select sauce, filter, deselect → Verify state consistency

### Mobile Testing
1. Touch targets ≥44px on iPhone SE
2. Cart items stack vertically
3. Filter buttons stack vertically
4. Cards in single column
5. Remove buttons accessible with thumb

### Edge Cases
1. No sauces selected → "Select sauces from below" message
2. All sauces selected (max) → Green cart, all buttons disabled
3. User clears all defaults → Analytics: "abandoned defaults"
4. Firebase timeout → Graceful loading state
5. Missing sauce images → Color-coded placeholders

## Future Enhancements

### Phase 2 (Post-MVP)
- [ ] **Sauce flavor profiles** - Sweet, Tangy, Smoky tags
- [ ] **Pairing suggestions** - "Great with boneless wings"
- [ ] **User reviews** - "4.8/5 stars from 200+ orders"
- [ ] **Video previews** - 3-second sauce pour clips
- [ ] **Sauce sampler upsell** - "Try all 14 for +$12"

### Analytics to Track
- Sauce selection conversion rate (% who customize)
- Most popular sauce combinations by event type
- Average time to select sauces
- Heat level distribution (% mild vs hot)
- Smart default abandonment rate

## Success Metrics

**Primary KPIs**:
- 70%+ use smart defaults (low customization = happy customers)
- <30 seconds to select sauces (fast = less drop-off)
- 85%+ balanced heat mix (mild + medium + hot)

**Secondary KPIs**:
- Mobile completion rate matches desktop
- <5% max selection validation triggers (good UX)
- Heat filtering used by 40%+ (helpful feature)

## Conclusion

The enhanced SP-008 Sauce Photo Card Selector transforms sauce selection from a chore into a delightful browsing experience. By combining:

1. **Visual appeal** - Photo cards with appetite appeal
2. **Smart guidance** - Pre-selected defaults + pro tips
3. **Easy exploration** - Heat filtering + social proof
4. **Friendly constraints** - Max selection with clear feedback
5. **Mobile excellence** - Touch-friendly, responsive

We create a selector that works for 90% without customization, while empowering the 10% who want full control to browse 14 sauces effortlessly.

**Next Step**: Integrate into SP-006 Customization Screen to connect Preview Anchor → Sauce Selection → Final Review flow.
