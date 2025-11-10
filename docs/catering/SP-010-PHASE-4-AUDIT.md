# SP-010 Phase 4: Price Breakdown Sidebar - Audit & Implementation Plan

**Date:** 2025-11-06  
**Status:** Planning Phase  
**Sprint:** SP-010 Phase 4 (Deferred from previous sprint)

---

## Executive Summary

Phase 4 implements the **Price Breakdown Sidebar UI** component to provide real-time pricing transparency for sides customization. This component will display:
- Base package price
- Included items (no charge)
- Additional items (upcharges)
- Removed items (credits)
- Running total

**User Selection:** According to entity notes, user selected "mockup-option-1.html" (sticky sidebar summary), but the ORDER-SUMMARY-MOCKUPS.md file shows "Approach 1: Inline Comparison" as recommended. **Need clarification on which UI approach to implement.**

---

## 1. Current State Analysis

### 1.1 Completed Work (Phases 1-3)

✅ **Phase 1: Transformer Pricing Enhancements**
- File: `/src/services/package-data-transformer.js`
- Added `pricingCache` property structure: `{ chips: null, coldSides: {}, salads: {} }`
- Created `fetchChipsPricing()` method (queries `cateringAddOns` collection)
- Enhanced `buildSidesMapping()` to populate pricing cache
- Modified transform methods to include: `includedQuantity`, `unitPrice`, `displayName`, `servings`

✅ **Phase 2: Pricing Calculator Overhaul**
- File: `/src/utils/pricing-items-calculator.js`
- Removed hardcoded `ITEMS_PRICING.SIDES` constants
- Implemented included quantity logic: `additional = max(0, quantity - includedQuantity)`
- Added 'included' modifiers (no charge items)
- Pricing now comes from transformer's cached Firestore data

✅ **Phase 3: Removal Credits Implementation**
- Added removal credit logic: `removed = max(0, includedQuantity - quantity)`
- Applies negative 'removal-credit' modifiers
- All three item types (chips, coldSides, salads) have complete logic
- Build successful, no compilation errors

### 1.2 Current Pricing Data Structure

**Source:** `/src/utils/pricing-data-structure.js`

```javascript
{
  items: {
    'chips': { id, type, name, quantity, includedQty, additionalQty, unit },
    'cold-side-{id}': { id, type, name, quantity, includedQty, additionalQty, serves },
    'salad-{id}': { id, type, name, quantity, includedQty, additionalQty, serves }
  },
  modifiers: [
    { itemId, type: 'included', amount: 0, label: '5 Chips 5-Packs included - $0.00' },
    { itemId, type: 'upcharge', amount: 21.16, label: 'Additional Chips (2) (+$10.58 each)' },
    { itemId, type: 'removal-credit', amount: -6.99, label: 'Removed Large Veggie Tray (1) - Credit $6.99' }
  ],
  totals: {
    basePrice: 329.99,
    modificationsTotal: 14.17,  // sum of all modifiers
    subtotal: 344.16,
    tax: 27.53,
    total: 371.69
  }
}
```

### 1.3 Current UI Structure

**Customization Screen Layout:**
- File: `/src/components/catering/customization-screen.js`
- **Left Panel:** Customization sections (wings, sauces, dips, sides, desserts, beverages)
- **Right Panel:** Pricing summary panel (sticky, 400px width)
  - Currently uses `pricing-summary-master.js` which renders card grid layout
  - Container ID: `pricing-summary-container`
  - CSS: `.pricing-summary-panel` (sticky, top: 2rem, max-height: calc(100vh - 4rem))

**Mobile Layout:**
- Floating pricing button at bottom
- Mobile pricing drawer (collapsible)

**Current Pricing Summary:**
- Uses `renderCardGrid()` from `kitchen-breakdown-card-renderer.js`
- Shows package includes with modification badges
- Does NOT show detailed price breakdown by modifier type

### 1.4 Sides Selector Current State

**File:** `/src/components/catering/sides-selector.js`

**Current Features:**
- Chips subsection with counter
- Cold sides with size variants (Regular/Large/Family)
- Fresh salads with size variants (Individual/Family)
- Responsive design (compact mobile, large card desktop)
- Photo cards with allergen badges
- Real-time pricing integration via `recalculatePricing()`

**Missing (Phase 4D):**
- No display of `includedQuantity` badges (e.g., "5 included")
- No visual indication of included vs additional items

---

## 2. Mockup Analysis

### 2.1 Entity Notes vs Documentation

**Entity Notes Say:**
> "User selected mockup-option-1.html (sticky sidebar summary)"

**ORDER-SUMMARY-MOCKUPS.md Shows:**
- Approach 1: Inline Comparison (Recommended)
- Approach 2: Two-Column Side-by-Side
- Approach 3: Accordion Expand/Collapse
- Approach 4: Badge-Based Timeline Style

**Analysis:**
- Entity notes mention "sticky sidebar summary" which matches Approach 1's compact, mobile-friendly design
- "mockup-option-1.html" likely refers to Approach 1 (first option in the document)
- Approach 1 is explicitly marked as "Recommended" in ORDER-SUMMARY-MOCKUPS.md
- Approach 1 matches the "sticky sidebar" requirement from entity notes

**Decision:** Use **Approach 1: Inline Comparison** - it matches both the entity notes ("sticky sidebar") and the recommended approach in the documentation.

### 2.2 Approach 1: Inline Comparison (Recommended)

**Structure:**
```
ORDER SUMMARY
├─ Base Price: $329.99
├─ Included Items (Blue Box)
│  ├─ 5 Chips 5-Packs included - $0.00
│  ├─ 2 Family Coleslaw included - $0.00
│  └─ 3 Large Veggie Trays included - $0.00
├─ Additional Items (Green +)
│  └─ Additional Chips (2) (+$10.58 each) +$21.16
├─ Removed Items (Red -)
│  └─ Removed Large Veggie Tray (1) - Credit $6.99
└─ Running Total: $344.16
```

**Pros:**
- Compact, single section per category
- Clear visual hierarchy
- Mobile-friendly

### 2.3 Sticky Sidebar Requirements (from entity)

**Desktop (≥768px):**
- Sticky sidebar on right
- Position: `sticky`, `top: 2rem`
- Max height: `calc(100vh - 4rem)`
- Overflow: `auto`

**Mobile (<768px):**
- Fixed bottom bar
- Tap to expand
- Collapsible drawer

---

## 3. Data Flow Analysis

### 3.1 Pricing State Flow

```
Firestore Collections
  ↓
PackageDataTransformer.initialize()
  ↓ fetchChipsPricing(), buildSidesMapping()
  ↓
pricingCache populated
  ↓
transformPackage(packageObj)
  ↓ returns objects with {includedQuantity, unitPrice, displayName, servings}
  ↓
State: currentConfig.sides
  ↓
calculateSidesPricing(sides)
  ↓ applies included/upcharge/removal-credit logic
  ↓
Returns pricing structure with modifiers
  ↓
pricing-aggregator.js merges all pricing
  ↓
Unified pricing structure
  ↓
Price Breakdown Sidebar subscribes to pricing changes
  ↓
Renders sections: Base, Included, Additional, Removed, Total
```

### 3.2 Subscription Pattern

**Current Pattern (from customization-screen.js):**
```javascript
onStateChange('currentConfig.*', updatePricingSummary);
```

**Existing Pattern (from pricing-summary-master.js):**
```javascript
// Subscribe to pricing updates
const pricingUnsubscribe = onPricingChange('pricing:updated', (pricing) => {
  const currentState = getState();
  const html = renderPricingSummary(pricing, currentState, options);
  container.innerHTML = html;
});

// Subscribe to config changes (for non-price updates)
const configUnsubscribe = onStateChange('currentConfig.*', (path, value) => {
  const currentPricing = getCurrentPricing();
  const currentState = getState();
  const html = renderPricingSummary(currentPricing, currentState, options);
  container.innerHTML = html;
});
```

**New Sidebar Should:**
- **Primary:** Subscribe to `onPricingChange('pricing:updated', callback)` - most efficient, avoids duplicate calculations
- **Secondary:** Subscribe to `onStateChange('currentConfig.*', callback)` - catches non-price config changes (e.g., sauce assignments)
- Use `getCurrentPricing()` to get cached pricing (avoids recalculation)
- Update in real-time as user modifies sides

**Recommended Implementation:**
```javascript
export function initPriceBreakdownSidebar() {
  const container = document.getElementById('pricing-summary-container');
  if (!container) {
    console.error('Price breakdown sidebar container not found');
    return () => {}; // Return no-op unsubscribe
  }

  // Get initial pricing
  const initialPricing = getCurrentPricing();
  container.innerHTML = renderPriceBreakdownSidebar(initialPricing);

  // Subscribe to pricing updates (primary)
  const pricingUnsubscribe = onPricingChange('pricing:updated', (pricing) => {
    const freshContainer = document.getElementById('pricing-summary-container');
    if (freshContainer) {
      freshContainer.innerHTML = renderPriceBreakdownSidebar(pricing);
    }
  });

  // Subscribe to config changes (secondary - for non-price updates)
  const configUnsubscribe = onStateChange('currentConfig.*', () => {
    const currentPricing = getCurrentPricing(); // Use cached pricing
    const freshContainer = document.getElementById('pricing-summary-container');
    if (freshContainer) {
      freshContainer.innerHTML = renderPriceBreakdownSidebar(currentPricing);
    }
  });

  // Return unsubscribe function
  return () => {
    pricingUnsubscribe();
    configUnsubscribe();
  };
}
```

---

## 4. Integration Points

### 4.1 Component Integration

**File:** `/src/components/catering/customization-screen.js`

**Current:**
```javascript
<div class="pricing-summary-panel sticky">
  ${renderPricingSummary(selectedPackage, state.currentConfig)}
</div>
```

**New Approach Options:**

**Option A: Replace existing pricing summary**
- Replace `renderPricingSummary()` call with `renderPriceBreakdownSidebar()`
- Keep same container structure
- Pros: Simple, no layout changes
- Cons: Loses existing card grid view

**Option B: Add sidebar alongside existing summary**
- Add new sidebar component
- Keep existing summary for kitchen breakdown
- Pros: Both views available
- Cons: Duplicate information, more complex

**Option C: Toggle between views**
- Add toggle button
- Show either card grid OR price breakdown
- Pros: User choice
- Cons: More UI complexity

**Recommendation:** **Option A - Replace existing summary** (per entity notes: "sticky sidebar summary")

**Rationale:**
- Entity notes explicitly say "sticky sidebar summary" (singular)
- Current card grid doesn't show price breakdown by modifier type
- New sidebar provides better price transparency (goal of Phase 4)
- Simpler implementation, no UI conflicts
- Can always add toggle later if needed

**Implementation Strategy:**
- Replace `initPricingSummary()` call with `initPriceBreakdownSidebar()`
- Keep same container structure (`#pricing-summary-container`)
- Reuse existing CSS classes where possible
- Maintain mobile drawer pattern (reuse existing mobile pricing drawer)

### 4.2 CSS Integration

**File:** `/src/styles/customization-screen.css`

**Current `.pricing-summary-panel` styles:**
- Width: 400px
- Sticky positioning
- Max height: calc(100vh - 4rem)
- Overflow-y: auto

**New Sidebar CSS File:**
- `/src/styles/price-breakdown-sidebar.css`
- Desktop: sticky sidebar (≥768px)
- Mobile: fixed bottom bar (<768px)
- Import in customization-screen.js or main CSS file

### 4.3 Sides Selector Integration (Phase 4D)

**File:** `/src/components/catering/sides-selector.js`

**Current Counter Display:**
```html
<span class="counter-display" id="chips-counter">${currentQuantity}</span>
```

**New Display with Included Badge:**
```html
<span class="counter-display" id="chips-counter">
  ${currentQuantity}
  ${includedQuantity > 0 ? `<span class="included-badge">${includedQuantity} included</span>` : ''}
</span>
```

**Data Source:**
- `preSelected.chips.includedQuantity` (from transformer)
- Need to pass `includedQuantity` through render functions

---

## 5. Implementation Plan

### Phase 4A: Create Price Breakdown Sidebar Component

**File:** `/src/components/catering/price-breakdown-sidebar.js`

**Functions:**
1. `renderPriceBreakdownSidebar(pricingState)`
   - Input: Unified pricing structure from `pricing-aggregator.js`
   - Output: HTML string
   - Sections:
     - Base Price
     - Included Items (blue box, $0.00)
     - Additional Items (green +, upcharges)
     - Removed Items (red -, credits)
     - Running Total

2. `initPriceBreakdownSidebar()`
   - Subscribe to pricing changes
   - Find container: `#pricing-summary-container`
   - Render initial state
   - Set up subscription: `onPricingChange(callback)` or `onStateChange('currentConfig.*', callback)`

**Data Processing:**
```javascript
/**
 * Render price breakdown sidebar
 * @param {Object} pricing - Unified pricing structure from pricing-aggregator.js
 * @returns {string} HTML string
 */
export function renderPriceBreakdownSidebar(pricing) {
  if (!pricing || !pricing.totals) {
    return renderEmptyState();
  }

  // Extract modifiers by type (only for sides category)
  const sidesModifiers = pricing.modifiers.filter(m => {
    const item = pricing.items[m.itemId];
    return item && item.type === 'side';
  });

  const includedModifiers = sidesModifiers.filter(m => m.type === 'included');
  const upchargeModifiers = sidesModifiers.filter(m => m.type === 'upcharge');
  const removalModifiers = sidesModifiers.filter(m => m.type === 'removal-credit');

  // Calculate running total (subtotal, pre-tax)
  // Note: pricing.totals.subtotal already includes all modifiers
  const basePrice = pricing.totals.basePrice || 0;
  const modificationsTotal = upchargeModifiers.reduce((sum, m) => sum + m.amount, 0) +
                             removalModifiers.reduce((sum, m) => sum + m.amount, 0);
  const runningTotal = basePrice + modificationsTotal;

  return `
    <div class="price-breakdown-sidebar">
      <h3 class="breakdown-title">Price Breakdown</h3>
      
      <!-- Base Price Section -->
      <div class="price-breakdown-section section-base">
        <div class="breakdown-item">
          <span class="breakdown-label">Base Package</span>
          <span class="breakdown-value">$${basePrice.toFixed(2)}</span>
        </div>
      </div>

      <!-- Included Items Section -->
      ${includedModifiers.length > 0 ? `
        <div class="price-breakdown-section section-included">
          <h4 class="section-header">
            <span class="section-icon">📦</span>
            Included Items
          </h4>
          <div class="breakdown-items">
            ${includedModifiers.map(mod => `
              <div class="breakdown-item included-item">
                <span class="breakdown-label">${mod.label}</span>
                <span class="breakdown-value">$0.00</span>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Additional Items Section -->
      ${upchargeModifiers.length > 0 ? `
        <div class="price-breakdown-section section-additional">
          <h4 class="section-header">
            <span class="section-icon">➕</span>
            Additional Items
          </h4>
          <div class="breakdown-items">
            ${upchargeModifiers.map(mod => `
              <div class="breakdown-item additional-item">
                <span class="breakdown-label">${mod.label}</span>
                <span class="breakdown-value positive">+$${Math.abs(mod.amount).toFixed(2)}</span>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Removed Items Section -->
      ${removalModifiers.length > 0 ? `
        <div class="price-breakdown-section section-removed">
          <h4 class="section-header">
            <span class="section-icon">➖</span>
            Removed Items (Credit)
          </h4>
          <div class="breakdown-items">
            ${removalModifiers.map(mod => `
              <div class="breakdown-item removed-item">
                <span class="breakdown-label">${mod.label}</span>
                <span class="breakdown-value negative">-$${Math.abs(mod.amount).toFixed(2)}</span>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Running Total Section -->
      <div class="price-breakdown-section section-total">
        <div class="breakdown-item total-item">
          <span class="breakdown-label">Subtotal</span>
          <span class="breakdown-value total-value">$${runningTotal.toFixed(2)}</span>
        </div>
        <div class="breakdown-item tax-item">
          <span class="breakdown-label">Tax (8%)</span>
          <span class="breakdown-value">$${pricing.totals.tax.toFixed(2)}</span>
        </div>
        <div class="breakdown-item grand-total-item">
          <span class="breakdown-label">Total</span>
          <span class="breakdown-value grand-total">$${pricing.totals.total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  `;
}

function renderEmptyState() {
  return `
    <div class="price-breakdown-sidebar empty">
      <p class="empty-message">No pricing information available</p>
    </div>
  `;
}
```

### Phase 4B: Create CSS Styles

**File:** `/src/styles/price-breakdown-sidebar.css`

**Desktop Styles (≥768px):**
- Sticky sidebar (reuse `.pricing-summary-panel` styles)
- Section headers with icons
- Color coding:
  - Included: Blue background (`rgba(52, 152, 219, 0.1)`)
  - Additional: Green background (`rgba(39, 174, 96, 0.1)`)
  - Removed: Red background (`rgba(231, 76, 60, 0.1)`)

**Mobile Styles (<768px):**
- Fixed bottom bar
- Collapsed state: Shows total only
- Expanded state: Full breakdown
- Tap to expand/collapse
- Backdrop overlay when expanded

**CSS Classes & Structure:**
```css
/* Main Container */
.price-breakdown-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Section Headers */
.section-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}

.section-icon {
  font-size: 1rem;
}

/* Sections */
.section-included {
  background: rgba(52, 152, 219, 0.1);
  border-left: 3px solid #3498db;
  padding: 0.75rem;
  border-radius: 6px;
}

.section-additional {
  background: rgba(39, 174, 96, 0.1);
  border-left: 3px solid #27ae60;
  padding: 0.75rem;
  border-radius: 6px;
}

.section-removed {
  background: rgba(231, 76, 60, 0.1);
  border-left: 3px solid #e74c3c;
  padding: 0.75rem;
  border-radius: 6px;
}

.section-total {
  border-top: 2px solid var(--gray-300);
  padding-top: 1rem;
  margin-top: 0.5rem;
}

/* Items */
.breakdown-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  font-size: 0.9375rem;
}

.breakdown-label {
  flex: 1;
  color: var(--gray-700);
}

.breakdown-value {
  font-weight: 600;
  color: var(--gray-900);
}

.breakdown-value.positive {
  color: #27ae60;
}

.breakdown-value.negative {
  color: #e74c3c;
}

.total-value {
  font-size: 1.125rem;
  font-weight: 700;
}

.grand-total {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--philly-red);
}

/* Mobile Styles */
@media (max-width: 767px) {
  .price-breakdown-sidebar {
    /* Mobile drawer styles */
  }
}
```

**Badge Classes (for sides selector):**
```css
.included-badge {
  display: inline-block;
  background: rgba(52, 152, 219, 0.1);
  color: #3498db;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  margin-left: 0.5rem;
  font-weight: 600;
  white-space: nowrap;
}
```

### Phase 4C: Integrate into Customization Screen

**File:** `/src/components/catering/customization-screen.js`

**Changes:**
1. Import new component:
   ```javascript
   import { renderPriceBreakdownSidebar, initPriceBreakdownSidebar } from './price-breakdown-sidebar.js';
   ```

2. Update `renderPricingSummary()`:
   ```javascript
   function renderPricingSummary(pkg, config = {}) {
     return `<div id="pricing-summary-container" class="summary-content"></div>`;
   }
   ```
   (Keep same structure, component will fill it)

3. Update `initCustomizationScreen()`:
   ```javascript
   // Replace or supplement initPricingSummary() call
   initPriceBreakdownSidebar();
   ```

4. Update `updatePricingSummary()`:
   ```javascript
   function updatePricingSummary() {
     const pricing = getCurrentPricing();
     const container = document.getElementById('pricing-summary-container');
     if (container) {
       container.innerHTML = renderPriceBreakdownSidebar(pricing);
     }
   }
   ```

**Alternative:** Keep existing `initPricingSummary()` and add sidebar as separate component (if Option B or C chosen)

### Phase 4D: Update Sides Selector with Included Badges

**File:** `/src/components/catering/sides-selector.js`

**Changes:**

1. **Chips Subsection:**
   ```javascript
   async function renderChipsSubsection(preSelected) {
     const includedQty = preSelected?.includedQuantity || 0;
     // ... existing code ...
     
     // Add badge to counter display
     <span class="counter-display" id="chips-counter">
       ${currentQuantity}
       ${includedQty > 0 ? `<span class="included-badge">${includedQty} included</span>` : ''}
     </span>
   ```

2. **Cold Sides:**
   ```javascript
   function renderColdSideLarge(side, preSelected) {
     const includedQty = preSelected?.includedQuantity || 0;
     // ... add badge near counter ...
   ```

3. **Salads:**
   ```javascript
   function renderSaladLarge(salad, preSelected) {
     const includedQty = preSelected?.includedQuantity || 0;
     // ... add badge near counter ...
   ```

**CSS for Badges:**
```css
.included-badge {
  display: inline-block;
  background: rgba(52, 152, 219, 0.1);
  color: #3498db;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  margin-left: 0.5rem;
  font-weight: 600;
}
```

---

## 6. Technical Considerations

### 6.1 Performance

**Current Performance:**
- Pricing calculation: ~20-30ms (per entity notes)
- Real-time updates: Debounced 150ms (from customization-screen.js)

**Sidebar Updates:**
- Should subscribe to pricing changes (not state changes directly)
- Use existing `onPricingChange()` from `pricing-aggregator.js`
- Avoid duplicate calculations

### 6.2 State Management

**Current Pattern:**
- `shared-platter-state-service.js` with pub/sub
- `onStateChange('currentConfig.*')` for nested changes
- `pricing-aggregator.js` caches current pricing

**Sidebar Should:**
- Subscribe to `onPricingChange()` (preferred)
- OR subscribe to `onStateChange('currentConfig.*')` and call `getCurrentPricing()`
- Avoid subscribing to both (duplicate updates)

### 6.3 Mobile Behavior

**Current Mobile Pattern:**
- Floating pricing button (`.mobile-pricing-button`)
- Mobile pricing drawer (`.mobile-pricing-drawer`, collapsible)
- Drawer content ID: `mobile-drawer-content`

**New Sidebar Mobile Strategy:**
- **Option 1 (Recommended):** Reuse existing mobile drawer
  - Replace content in `#mobile-drawer-content` with price breakdown sidebar
  - Keep existing drawer open/close behavior
  - Pros: No new UI elements, consistent UX
  - Cons: Need to coordinate with existing drawer logic

- **Option 2:** Create new fixed bottom bar
  - New component: `.price-breakdown-mobile-bar`
  - Collapsed: Shows total only (70px height)
  - Expanded: Full breakdown (max 85vh)
  - Pros: Dedicated component, clearer separation
  - Cons: Duplicate mobile pricing UI

**Recommendation:** **Option 1** - Reuse existing mobile drawer, replace content with price breakdown sidebar

**Implementation:**
```javascript
// In customization-screen.js, update renderMobilePricingButton()
function renderMobilePricingButton() {
  // ... existing code ...
  
  // Update drawer content to use price breakdown sidebar
  <div class="drawer-content" id="mobile-drawer-content">
    ${renderPriceBreakdownSidebar(getCurrentPricing())}
  </div>
}

// Subscribe mobile drawer to pricing updates
onPricingChange('pricing:updated', (pricing) => {
  const drawerContent = document.getElementById('mobile-drawer-content');
  if (drawerContent) {
    drawerContent.innerHTML = renderPriceBreakdownSidebar(pricing);
  }
});
```

### 6.4 Data Availability

**Critical Check:**
- Verify `includedQuantity` is available in `preSelected` data
- Check transformer output structure
- Ensure `calculateSidesPricing()` receives correct data format

**From Entity Notes:**
- Transformer returns: `{includedQuantity, unitPrice, displayName, servings}`
- State structure: `currentConfig.sides = { chips: {...}, coldSides: [...], salads: [...] }`
- Pricing calculator expects: `chips.includedQuantity`, `coldSides[].includedQuantity`, etc.

---

## 7. Risks & Mitigation

### Risk 1: Mockup Confusion
**Issue:** Entity says "mockup-option-1.html" but file doesn't exist  
**Mitigation:** Clarify with user which approach to implement (Approach 1 recommended)

### Risk 2: Duplicate Pricing Displays
**Issue:** Existing pricing summary + new sidebar = confusion  
**Mitigation:** Replace existing summary (Option A) or add clear toggle

### Risk 3: Mobile UI Conflict
**Issue:** Existing mobile pricing drawer + new sidebar = overlap  
**Mitigation:** Reuse existing mobile drawer or clearly separate functionality

### Risk 4: Performance Impact
**Issue:** Additional subscription + rendering = slower updates  
**Mitigation:** Use existing `onPricingChange()` subscription, avoid duplicate calculations

### Risk 5: Data Structure Mismatch
**Issue:** `includedQuantity` not available in expected format  
**Mitigation:** Audit transformer output, verify data flow before implementation

---

## 8. Testing Plan

### 8.1 Unit Tests
- Test `renderPriceBreakdownSidebar()` with various pricing structures
- Test modifier grouping (included, upcharge, removal)
- Test running total calculation

### 8.2 Integration Tests
- Test sidebar updates when sides change
- Test mobile expand/collapse behavior
- Test included badge display in sides selector

### 8.3 Browser Testing
- Test with Tailgate Party Pack (5 chips included)
- Test upcharge scenario (select 7 chips → +2 upcharge)
- Test removal credit scenario (select 2 veggie trays when 3 included → -1 credit)
- Test responsive behavior (desktop sticky, mobile bottom bar)

### 8.4 Test Scenarios (from entity notes)
1. ✅ Verify included items show $0.00 charge
2. ✅ Test upcharges for additional items
3. ✅ Test removal credits for items below included quantity
4. ✅ Test responsive behavior desktop/mobile
5. ✅ Verify real-time price updates in sidebar

---

## 9. Definition of Done

- [ ] Phase 4A: `price-breakdown-sidebar.js` component created
- [ ] Phase 4B: `price-breakdown-sidebar.css` created with desktop/mobile styles
- [ ] Phase 4C: Integrated into `customization-screen.js`
- [ ] Phase 4D: Sides selector shows included badges
- [ ] All sections render correctly (Base, Included, Additional, Removed, Total)
- [ ] Real-time updates work when sides change
- [ ] Mobile behavior: fixed bottom bar with tap-to-expand
- [ ] Desktop behavior: sticky sidebar
- [ ] Build successful (`npm run build`)
- [ ] Browser testing complete with Tailgate Party Pack
- [ ] No console errors
- [ ] Performance: Updates within 150ms debounce window

---

## 10. Decision Matrix & Resolved Questions

### 10.1 Resolved Decisions

| Question | Decision | Rationale |
|----------|----------|------------|
| **Mockup approach** | Approach 1: Inline Comparison | Matches "sticky sidebar" requirement, recommended in docs |
| **Replace or supplement** | Replace existing summary | Entity notes say "sticky sidebar summary" (singular), simpler |
| **Mobile coordination** | Reuse existing mobile drawer | Consistent UX, no duplicate UI elements |
| **Running total** | Pre-tax subtotal | Show subtotal in breakdown, tax and total in final section |
| **Badge styling** | Blue badge, inline with counter | Matches included items color scheme, non-intrusive |

### 10.2 Remaining Open Questions

1. **Modifier filtering scope:** Should sidebar show ONLY sides modifiers, or all modifiers (wings, sauces, dips, etc.)?
   - **Recommendation:** Start with sides only (matches Phase 4 scope), expand later if needed

2. **Empty state handling:** What should sidebar show when no package selected or no sides customized?
   - **Recommendation:** Show base price only, hide sections with no modifiers

3. **Accessibility:** Should sidebar be keyboard navigable? ARIA labels?
   - **Recommendation:** Add ARIA labels, ensure keyboard navigation, test with screen readers

4. **Animation/transitions:** Should price changes animate or update instantly?
   - **Recommendation:** Subtle fade-in for new items, instant updates for performance

---

## 11. Implementation Sequence

### Step 1: Pre-Implementation Verification
- [ ] Verify `includedQuantity` available in `preSelected` data structure
- [ ] Test transformer output with Tailgate Party Pack
- [ ] Confirm pricing modifiers structure matches expectations
- [ ] Verify `onPricingChange()` subscription works correctly

### Step 2: Phase 4A - Component Creation
- [ ] Create `/src/components/catering/price-breakdown-sidebar.js`
- [ ] Implement `renderPriceBreakdownSidebar(pricing)` function
- [ ] Implement `initPriceBreakdownSidebar()` function
- [ ] Add error handling and empty state
- [ ] Test with mock pricing data

### Step 3: Phase 4B - CSS Styles
- [ ] Create `/src/styles/price-breakdown-sidebar.css`
- [ ] Implement desktop sticky sidebar styles (≥768px)
- [ ] Implement mobile drawer styles (<768px)
- [ ] Add color coding (blue/green/red)
- [ ] Test responsive behavior

### Step 4: Phase 4C - Integration
- [ ] Import component in `customization-screen.js`
- [ ] Replace `initPricingSummary()` with `initPriceBreakdownSidebar()`
- [ ] Update `updatePricingSummary()` function
- [ ] Integrate mobile drawer content
- [ ] Import CSS file

### Step 5: Phase 4D - Sides Selector Badges
- [ ] Update `renderChipsSubsection()` to show included badge
- [ ] Update `renderColdSideLarge()` to show included badge
- [ ] Update `renderSaladLarge()` to show included badge
- [ ] Add badge CSS to `sides-selector.css` or `catering.css`
- [ ] Test badge display with various packages

### Step 6: Testing & Validation
- [ ] Test with Tailgate Party Pack (5 chips included)
- [ ] Test upcharge scenario (7 chips → +2)
- [ ] Test removal credit (2 veggie trays when 3 included)
- [ ] Test responsive behavior (desktop/mobile)
- [ ] Test real-time updates
- [ ] Verify build succeeds (`npm run build`)
- [ ] Check console for errors
- [ ] Performance check (updates within 150ms)

### Step 7: Edge Cases
- [ ] Test with package that has no sides
- [ ] Test with all sides removed
- [ ] Test with all sides at included quantity
- [ ] Test rapid quantity changes
- [ ] Test package switching

## 12. Code Structure Reference

### File: `/src/components/catering/price-breakdown-sidebar.js`
```javascript
/**
 * Price Breakdown Sidebar Component - SP-010 Phase 4
 * 
 * Displays real-time pricing breakdown for sides customization:
 * - Base package price
 * - Included items (no charge)
 * - Additional items (upcharges)
 * - Removed items (credits)
 * - Running total
 */

import { onPricingChange, getCurrentPricing } from '../../utils/pricing-aggregator.js';
import { onStateChange } from '../../services/shared-platter-state-service.js';

export function renderPriceBreakdownSidebar(pricing) { /* ... */ }
export function initPriceBreakdownSidebar() { /* ... */ }
function renderEmptyState() { /* ... */ }
```

### File: `/src/styles/price-breakdown-sidebar.css`
```css
/**
 * Price Breakdown Sidebar Styles - SP-010 Phase 4
 * 
 * Desktop: Sticky sidebar (≥768px)
 * Mobile: Fixed bottom bar (<768px)
 */

/* Main container */
.price-breakdown-sidebar { /* ... */ }

/* Sections */
.section-included { /* ... */ }
.section-additional { /* ... */ }
.section-removed { /* ... */ }
.section-total { /* ... */ }

/* Mobile styles */
@media (max-width: 767px) { /* ... */ }
```

## 13. Performance Benchmarks

**Target Performance:**
- Initial render: < 50ms
- Update render: < 30ms
- Subscription callback: < 10ms overhead
- Total update cycle: < 150ms (matches debounce window)

**Measurement:**
```javascript
// Add performance logging
const startTime = performance.now();
container.innerHTML = renderPriceBreakdownSidebar(pricing);
const duration = performance.now() - startTime;
if (duration > 50) {
  console.warn('Price breakdown render exceeded budget:', duration);
}
```

## 14. Accessibility Considerations

- [ ] Add ARIA labels to sections: `aria-label="Included Items Section"`
- [ ] Ensure keyboard navigation works
- [ ] Test with screen reader (NVDA/JAWS)
- [ ] Ensure color contrast meets WCAG AA (4.5:1)
- [ ] Add `role="region"` to sidebar container
- [ ] Add `aria-live="polite"` for dynamic updates

---

**Document Status:** Ready for review and clarification before implementation begins.

