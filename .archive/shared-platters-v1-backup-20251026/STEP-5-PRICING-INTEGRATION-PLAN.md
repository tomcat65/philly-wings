# Step 5 Pricing Integration - Implementation Plan
**Date**: October 26, 2025
**Task**: Integrate Richard's modification pricing into Step 5 customization wizard
**Estimated Total Time**: 3-4 hours across 6 shards

---

## Current State Analysis

### What's Already Built ✅

1. **UI Framework**: Split-screen layout with left panel (controls) + right panel (summary)
2. **Quantity Controls**: +/- buttons for all categories (chips, dips, coldSides, salads, desserts, beverages)
3. **Data Structure**: Each item has `data-type` and `data-item` attributes
4. **Pricing Constants**: `/src/constants/modification-pricing.js` with all 25 items
5. **Helper Functions**: `getRemovalCredit()`, `getAddOnCost()`, `calculateModificationPricing()`

### What's Missing ❌

1. **State Tracking**: No `wizardState.customizedIncludes` to track modifications
2. **Event Listeners**: Quantity buttons don't update state
3. **Price Calculation**: Placeholder `$0.00` never changes
4. **Live Summary**: Right panel shows static base price
5. **Validation**: No 20% cap enforcement
6. **Item Name Mapping**: Package items don't map to pricing object keys

---

## The Complete Flow

### User Interaction Flow
```
1. User arrives at Step 5 with selectedPackage from Step 2
2. UI renders all included items with base quantities
3. User clicks +/- buttons to modify quantities
4. Each click:
   a. Updates quantity display
   b. Updates wizardState.customizedIncludes
   c. Calculates new price delta for that item
   d. Updates right panel summary
   e. Validates 20% cap
   f. Shows warning if exceeded
5. User clicks "Continue" → validation check → proceed or block
```

### Data Flow
```
selectedPackage.chips.fivePacksIncluded = 3
     ↓
User clicks MINUS button
     ↓
New quantity: 2 (removed 1 pack)
     ↓
Look up: "Miss Vickie's Chips 5-Pack" in MODIFICATION_PRICING
     ↓
removalCredit = $4.25 per pack
     ↓
Total credit: $4.25 × 1 = $4.25
     ↓
Update price-delta span: "-$4.25"
     ↓
Update right panel: "Removed Items: -$4.25"
     ↓
Validate total credits ≤ 20% of basePrice
```

---

## SHARD 1: Item Name Mapping Strategy

**Problem**: Package data uses generic names, pricing object uses specific names

**Package Data**:
```javascript
pkg.chips = { fivePacksIncluded: 3, brand: "Miss Vickie's" }
pkg.coldSides = [
  { item: "Family Coleslaw", quantity: 2 },
  { item: "Family Potato Salad", quantity: 1 }
]
```

**Pricing Object Keys**:
```javascript
MODIFICATION_PRICING.chips["Miss Vickie's Chips 5-Pack"]
MODIFICATION_PRICING.coldSides["Family Coleslaw"]
```

### Solution: Mapping Functions

Create mapping functions to translate package data to pricing keys:

```javascript
/**
 * Map package item to pricing object key
 * @param {string} type - Category type (chips, dips, coldSides, etc.)
 * @param {Object|string} item - Package item data
 * @returns {Object} {category, itemName}
 */
function mapItemToPricingKey(type, item) {
  const mappings = {
    chips: () => ({
      category: 'chips',
      itemName: "Miss Vickie's Chips 5-Pack"
    }),

    dips: () => ({
      category: 'dips',
      itemName: "Dip 5-Pack"
    }),

    coldSides: (itemData) => ({
      category: 'coldSides',
      itemName: itemData.item // Already matches: "Family Coleslaw", etc.
    }),

    salads: (itemData) => ({
      category: 'salads',
      itemName: itemData.item.includes('Caesar')
        ? "Caesar Salad (Family Size)"
        : "Spring Mix Salad (Family Size)"
    }),

    desserts: (itemData) => ({
      category: 'desserts',
      itemName: mapDessertName(itemData.item) // Helper for dessert variants
    }),

    hotBeverages: (itemData) => ({
      category: 'hotBeverages',
      itemName: itemData.item // "Lavazza Coffee 96oz", etc.
    }),

    coldBeverages: (itemData) => ({
      category: 'coldBeverages',
      itemName: itemData.item // "Boxed Iced Tea 96oz", etc.
    })
  };

  return mappings[type] ? mappings[type](item) : null;
}

/**
 * Map dessert package names to pricing keys
 */
function mapDessertName(packageName) {
  const dessertMappings = {
    'Marble Pound Cake 5-Pack': 'Marble Pound Cake 5-Pack',
    'Gourmet Brownies 5-Pack': 'Gourmet Brownies 5-Pack',
    'Red Velvet Cake 5-Pack': 'Red Velvet Cake 5-Pack',
    'Crème Brûlée Cheesecake 5-Pack': 'Crème Brûlée Cheesecake 5-Pack',
    'NY Cheesecake 5-Pack': 'NY Cheesecake 5-Pack'
  };

  return dessertMappings[packageName] || packageName;
}
```

**Files to modify**: `guided-planner.js` (add mapping functions after imports)

**Estimated Time**: 30 minutes

---

## SHARD 2: State Management Structure

**Create `wizardState.customizedIncludes` object**:

```javascript
wizardState.customizedIncludes = {
  chips: {
    baseQuantity: 3,           // From package
    currentQuantity: 2,        // After user changes
    delta: -1,                 // Change amount
    priceImpact: -4.25         // Credit or charge
  },

  dips: {
    baseQuantity: 6,
    currentQuantity: 6,
    delta: 0,
    priceImpact: 0
  },

  coldSides: [
    {
      itemName: "Family Coleslaw",
      baseQuantity: 2,
      currentQuantity: 1,
      delta: -1,
      priceImpact: -6.00      // Removal credit
    },
    {
      itemName: "Family Potato Salad",
      baseQuantity: 1,
      currentQuantity: 2,
      delta: +1,
      priceImpact: +16.80     // Add-on cost
    }
  ],

  // ... similar for salads, desserts, beverages
};
```

### Initialize State Function

```javascript
/**
 * Initialize Step 5 customization state from selected package
 */
function initializeCustomizationState() {
  if (!wizardState.selectedPackage) {
    console.warn('⚠️ Cannot initialize customization without selected package');
    return;
  }

  const pkg = wizardState.selectedPackage;

  wizardState.customizedIncludes = {
    chips: pkg.chips ? {
      baseQuantity: pkg.chips.fivePacksIncluded || 0,
      currentQuantity: pkg.chips.fivePacksIncluded || 0,
      delta: 0,
      priceImpact: 0
    } : null,

    dips: pkg.dips ? {
      baseQuantity: pkg.dips.fivePacksIncluded || 0,
      currentQuantity: pkg.dips.fivePacksIncluded || 0,
      delta: 0,
      priceImpact: 0
    } : null,

    coldSides: Array.isArray(pkg.coldSides) ? pkg.coldSides.map(side => ({
      itemName: side.item,
      baseQuantity: side.quantity || 0,
      currentQuantity: side.quantity || 0,
      delta: 0,
      priceImpact: 0
    })) : [],

    // ... similar for salads, desserts, beverages
  };

  console.log('✅ Customization state initialized:', wizardState.customizedIncludes);
}
```

**Call this function** in `initializeStep5CustomizePackage()` (line 751)

**Files to modify**: `guided-planner.js` (add function, call in init)

**Estimated Time**: 45 minutes

---

## SHARD 3: Quantity Change Handlers

**Attach event listeners to +/- buttons**:

```javascript
/**
 * Handle quantity change for customization item
 * @param {string} type - Category type (chips, dips, coldSides, etc.)
 * @param {string|number} itemIndex - Item identifier
 * @param {number} delta - Change amount (+1 or -1)
 */
function handleCustomizationQuantityChange(type, itemIndex, delta) {
  if (!wizardState.customizedIncludes) {
    console.warn('⚠️ Customization state not initialized');
    return;
  }

  const state = wizardState.customizedIncludes[type];

  // Handle simple categories (chips, dips)
  if (type === 'chips' || type === 'dips') {
    if (!state) return;

    const newQuantity = Math.max(0, state.currentQuantity + delta);
    state.currentQuantity = newQuantity;
    state.delta = newQuantity - state.baseQuantity;

    // Calculate price impact
    const mapping = mapItemToPricingKey(type, null);
    if (state.delta < 0) {
      // Removal - credit
      const creditPerUnit = getRemovalCredit(mapping.itemName, mapping.category);
      state.priceImpact = state.delta * creditPerUnit; // Negative number
    } else if (state.delta > 0) {
      // Addition - charge
      const costPerUnit = getAddOnCost(mapping.itemName, mapping.category);
      state.priceImpact = state.delta * costPerUnit; // Positive number
    } else {
      state.priceImpact = 0;
    }

    // Update UI
    updateQuantityDisplay(type, 'base', newQuantity);
    updatePriceDelta(type, 'base', state.priceImpact);
    updatePricingSummary();

  }
  // Handle array categories (coldSides, salads, desserts, beverages)
  else {
    if (!Array.isArray(state)) return;
    const item = state[itemIndex];
    if (!item) return;

    const newQuantity = Math.max(0, item.currentQuantity + delta);
    item.currentQuantity = newQuantity;
    item.delta = newQuantity - item.baseQuantity;

    // Calculate price impact
    const mapping = mapItemToPricingKey(type, { item: item.itemName });
    if (item.delta < 0) {
      const creditPerUnit = getRemovalCredit(mapping.itemName, mapping.category);
      item.priceImpact = item.delta * creditPerUnit;
    } else if (item.delta > 0) {
      const costPerUnit = getAddOnCost(mapping.itemName, mapping.category);
      item.priceImpact = item.delta * costPerUnit;
    } else {
      item.priceImpact = 0;
    }

    // Update UI
    updateQuantityDisplay(type, itemIndex, newQuantity);
    updatePriceDelta(type, itemIndex, item.priceImpact);
    updatePricingSummary();
  }

  console.log('📊 Updated customization state:', wizardState.customizedIncludes);
}

/**
 * Update quantity display in UI
 */
function updateQuantityDisplay(type, itemIndex, newQuantity) {
  const display = document.querySelector(
    `.qty-display[data-type="${type}"][data-item="${itemIndex}"]`
  );
  if (display) {
    display.textContent = newQuantity;
  }
}

/**
 * Update price delta display in UI
 */
function updatePriceDelta(type, itemIndex, priceImpact) {
  const deltaSpan = document.querySelector(
    `.price-delta[data-type="${type}"][data-item="${itemIndex}"]`
  );
  if (deltaSpan) {
    deltaSpan.textContent = formatPriceDelta(priceImpact);

    // Add CSS classes for styling
    deltaSpan.classList.remove('positive', 'negative', 'neutral');
    if (priceImpact > 0) {
      deltaSpan.classList.add('positive');
    } else if (priceImpact < 0) {
      deltaSpan.classList.add('negative');
    } else {
      deltaSpan.classList.add('neutral');
    }
  }
}

/**
 * Attach event listeners to all quantity buttons
 */
function attachCustomizationListeners() {
  // Find all +/- buttons
  const buttons = document.querySelectorAll('.qty-btn');

  buttons.forEach(button => {
    const type = button.dataset.type;
    const itemIndex = button.dataset.item;
    const delta = button.classList.contains('qty-plus') ? 1 : -1;

    // Remove old listener (if any)
    const clone = button.cloneNode(true);
    button.replaceWith(clone);

    // Add new listener
    clone.addEventListener('click', (e) => {
      e.preventDefault();
      handleCustomizationQuantityChange(type, itemIndex, delta);
    });
  });

  console.log('✅ Customization listeners attached');
}
```

**Call `attachCustomizationListeners()`** after rendering left panel in `initializeStep5CustomizePackage()`

**Files to modify**: `guided-planner.js` (add functions, call in init)

**Estimated Time**: 60 minutes

---

## SHARD 4: Live Pricing Summary (Right Panel)

**Update `renderPackageSummary()` to be dynamic**:

Current implementation (lines 1013-1057) is static. Need to make it update live.

### New Implementation

```javascript
/**
 * Update pricing summary in right panel (called after every quantity change)
 */
function updatePricingSummary() {
  if (!wizardState.selectedPackage || !wizardState.customizedIncludes) {
    return;
  }

  const pkg = wizardState.selectedPackage;
  const basePrice = pkg.basePrice || 329.99;

  // Collect all removed items
  const removedItems = [];
  const addedItems = [];

  Object.entries(wizardState.customizedIncludes).forEach(([type, data]) => {
    if (!data) return;

    // Simple categories (chips, dips)
    if (type === 'chips' || type === 'dips') {
      if (data.delta < 0) {
        const mapping = mapItemToPricingKey(type, null);
        removedItems.push({
          name: mapping.itemName,
          category: mapping.category,
          quantity: Math.abs(data.delta)
        });
      } else if (data.delta > 0) {
        const mapping = mapItemToPricingKey(type, null);
        addedItems.push({
          name: mapping.itemName,
          category: mapping.category,
          quantity: data.delta
        });
      }
    }
    // Array categories
    else if (Array.isArray(data)) {
      data.forEach(item => {
        if (item.delta < 0) {
          const mapping = mapItemToPricingKey(type, { item: item.itemName });
          removedItems.push({
            name: mapping.itemName,
            category: mapping.category,
            quantity: Math.abs(item.delta)
          });
        } else if (item.delta > 0) {
          const mapping = mapItemToPricingKey(type, { item: item.itemName });
          addedItems.push({
            name: mapping.itemName,
            category: mapping.category,
            quantity: item.delta
          });
        }
      });
    }
  });

  // Calculate pricing using Richard's system
  const pricing = calculateModificationPricing(basePrice, removedItems, addedItems);

  // Update UI elements
  document.getElementById('base-price-display').textContent = formatPrice(basePrice);

  const addedLine = document.getElementById('added-items-line');
  const addedPrice = document.getElementById('added-items-price');
  if (pricing.addOnCharges > 0) {
    addedLine.style.display = 'flex';
    addedPrice.textContent = formatPriceDelta(pricing.addOnCharges);
  } else {
    addedLine.style.display = 'none';
  }

  const removedLine = document.getElementById('removed-items-line');
  const removedPrice = document.getElementById('removed-items-price');
  if (pricing.removalCredits > 0) {
    removedLine.style.display = 'flex';
    removedPrice.textContent = formatPriceDelta(-pricing.removalCredits); // Negative for display
  } else {
    removedLine.style.display = 'none';
  }

  document.getElementById('current-total-price').textContent = formatPrice(pricing.finalPrice);

  // Check if cap exceeded
  if (pricing.capExceeded) {
    showCapWarning(pricing.exceededAmount, pricing.removalCredits, pricing.addOnCharges);
  } else {
    hideCapWarning();
  }

  console.log('💰 Pricing summary updated:', pricing);
}
```

**Files to modify**: `guided-planner.js` (replace static summary, add update function)

**Estimated Time**: 45 minutes

---

## SHARD 5: 20% Cap Validation & UI Warnings

**Add validation warning UI**:

```javascript
/**
 * Show 20% removal credit cap warning
 */
function showCapWarning(exceededAmount, totalCredits, totalCharges) {
  // Create or show warning element
  let warningDiv = document.getElementById('removal-cap-warning');

  if (!warningDiv) {
    warningDiv = document.createElement('div');
    warningDiv.id = 'removal-cap-warning';
    warningDiv.className = 'cap-warning';

    const summaryDiv = document.querySelector('.price-summary');
    if (summaryDiv) {
      summaryDiv.insertBefore(warningDiv, summaryDiv.firstChild);
    }
  }

  const maxCredit = wizardState.selectedPackage.basePrice * 0.20;

  warningDiv.innerHTML = `
    <div class="warning-header">
      <span class="warning-icon">⚠️</span>
      <strong>Removal Credit Limit Reached</strong>
    </div>
    <p class="warning-message">
      Maximum removal credit is capped at 20% of base package price ($${maxCredit.toFixed(2)}).
      You've attempted to remove $${totalCredits.toFixed(2)} worth of items.
    </p>
    <p class="warning-action">
      <strong>Options:</strong><br>
      • Add back ${exceededAmount.toFixed(2)} worth of removed items, OR<br>
      • Add $${(exceededAmount + 10).toFixed(2)}+ in extras to increase total value
    </p>
  `;

  warningDiv.style.display = 'block';

  // Disable Continue button
  const continueBtn = document.getElementById('wizard-next');
  if (continueBtn) {
    continueBtn.disabled = true;
    continueBtn.classList.add('disabled');
    continueBtn.title = 'Cannot proceed - removal credit limit exceeded';
  }
}

/**
 * Hide cap warning
 */
function hideCapWarning() {
  const warningDiv = document.getElementById('removal-cap-warning');
  if (warningDiv) {
    warningDiv.style.display = 'none';
  }

  // Re-enable Continue button
  const continueBtn = document.getElementById('wizard-next');
  if (continueBtn) {
    continueBtn.disabled = false;
    continueBtn.classList.remove('disabled');
    continueBtn.title = '';
  }
}
```

**Add CSS** to `/src/styles/customize-package.css`:

```css
.cap-warning {
  background: #fff3cd;
  border: 2px solid #ffc107;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.warning-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.warning-icon {
  font-size: 24px;
}

.warning-message {
  margin: 8px 0;
  color: #856404;
}

.warning-action {
  margin: 8px 0;
  padding: 8px;
  background: #fff;
  border-radius: 4px;
  font-size: 0.9em;
}
```

**Files to modify**: `guided-planner.js` (add functions), `customize-package.css` (add styles)

**Estimated Time**: 30 minutes

---

## SHARD 6: End-to-End Testing

**Test Cases**:

1. ✅ **Load Step 5** with realistic package
   - Verify all items render
   - Verify base quantities match package
   - Verify initial price = basePrice

2. ✅ **Remove 1 chip 5-pack** (high-margin item)
   - Price delta: -$4.25 (50% credit)
   - Summary: "Removed Items: -$4.25"
   - Total: basePrice - $4.25

3. ✅ **Remove 2 coleslaw** (high-margin)
   - Price delta: -$12.00 ($6.00 × 2)
   - Total credits now: $16.25
   - No warning (under 20% cap)

4. ✅ **Add 1 Caesar salad** (medium-margin)
   - Price delta: +$33.59 (add-on cost)
   - Summary: "Added Items: +$33.59"
   - Total: basePrice - $16.25 + $33.59

5. ✅ **Test 20% cap**
   - Remove enough items to hit 20% ($65.98 for $329.99 package)
   - Warning appears
   - Continue button disabled

6. ✅ **Add items to fix cap**
   - Add desserts or beverages
   - Warning disappears
   - Continue enabled

**Files to modify**: None (manual testing)

**Estimated Time**: 30 minutes

---

## Summary Timeline

| Shard | Task | Time | Cumulative |
|-------|------|------|------------|
| 1 | Item name mapping | 30 min | 0:30 |
| 2 | State management | 45 min | 1:15 |
| 3 | Quantity handlers | 60 min | 2:15 |
| 4 | Live pricing summary | 45 min | 3:00 |
| 5 | Cap validation | 30 min | 3:30 |
| 6 | E2E testing | 30 min | **4:00** |

**Total Estimated Time**: 4 hours

---

## Files to Modify

1. `/src/components/catering/guided-planner.js`
   - Add mapping functions (Shard 1)
   - Add state initialization (Shard 2)
   - Add event handlers (Shard 3)
   - Update pricing summary (Shard 4)
   - Add validation UI (Shard 5)

2. `/src/styles/customize-package.css`
   - Add warning styles (Shard 5)

3. **No Firebase changes needed** - all pricing is client-side calculation

---

## Next Session Plan

When ready to implement:

1. **Start with Shard 1** - Mapping functions (quick win)
2. **Then Shard 2** - State structure (foundation)
3. **Then Shard 3** - Event handlers (interaction)
4. **Then Shard 4** - Live summary (visual feedback)
5. **Then Shard 5** - Validation (safety)
6. **Finally Shard 6** - Testing (verification)

Each shard is independently testable, so we can commit progress incrementally!

---

*Plan created October 26, 2025 by TomCat65*
