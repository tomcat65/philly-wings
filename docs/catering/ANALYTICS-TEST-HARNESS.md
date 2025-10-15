# Analytics Test Harness - Catering Add-Ons

**Purpose**: Manual DebugView testing for Gate 2 analytics helpers before Gate 3 UI implementation.

**Created**: October 13, 2025
**Owner**: Codex-Philly (lead), Claude (implementation)
**Status**: Ready for DebugView validation

---

## Quick Start

### Option 1: Browser Console Testing (Recommended)

1. **Start dev server**:
   ```bash
   npm run dev
   ```

2. **Open catering page**:
   ```
   http://localhost:5173/catering.html
   ```

3. **Open DevTools Console** (F12)

4. **Verify gtag loaded**:
   ```javascript
   typeof gtag === 'function'  // Should return true
   ```

5. **Load analytics module**:
   ```javascript
   // Import won't work in console, but functions are on window object
   typeof window.trackAddOnSelected === 'function'  // Should return true
   ```

6. **Run test suite** (paste entire block below):

---

## Console Test Suite

```javascript
// ============================================================================
// ANALYTICS TEST HARNESS - Catering Add-Ons
// Copy/paste this entire block into browser console
// ============================================================================

console.log('%c🧪 Starting Analytics Test Suite', 'font-size: 16px; font-weight: bold; color: #4CAF50');

// Mock add-on data (matches seed data structure)
const mockAddOns = {
  eggplant: {
    id: 'elenas-eggplant-parmesan-tray',
    name: "Elena's Eggplant Parmesan",
    category: 'vegetarian',
    basePrice: 45.00,
    supplier: "Restaurant Depot - Elena's"
  },
  cauliflower: {
    id: 'cauliflower-wings-50',
    name: 'Cauliflower Wings',
    category: 'vegetarian',
    basePrice: 50.00,
    supplier: 'Restaurant Depot - Sysco'
  },
  cookies: {
    id: 'daisys-chocolate-chip-cookies-24',
    name: "Daisy's Chocolate Chip Cookies",
    category: 'dessert',
    basePrice: 28.00,
    supplier: "Daisy's Bakery"
  },
  cake: {
    id: 'chefs-quality-sheet-cake',
    name: "Chef's Quality Sheet Cake",
    category: 'dessert',
    basePrice: 35.00,
    supplier: "Restaurant Depot - Chef's Quality"
  }
};

// Test package tier (Tier 1 = Office Lunch)
const testTier = 1;
const testPackageId = 'lunch-box-special';

console.log('\n--- Test 1: Add-On Selected (No Preparation Variant) ---');
console.log('Expected: add_on_selected event + vegetarian_interest event');
window.trackAddOnSelected(mockAddOns.eggplant, testTier, undefined, 1);

console.log('\n--- Test 2: Add-On Selected (With Preparation Variant) ---');
console.log('Expected: add_on_selected event (with preparation_method=fried) + vegetarian_interest event');
window.trackAddOnSelected(mockAddOns.cauliflower, testTier, 'fried', 1);

console.log('\n--- Test 3: Preparation Method Changed ---');
console.log('Expected: preparation_method_changed event (fried → baked)');
window.trackPreparationMethodChanged(mockAddOns.cauliflower.id, 'fried', 'baked', testTier);

console.log('\n--- Test 4: Add-On Selected (Dessert) ---');
console.log('Expected: add_on_selected event + dessert_interest event');
window.trackAddOnSelected(mockAddOns.cookies, testTier, undefined, 1);

console.log('\n--- Test 5: Add-On Removed (No Variant) ---');
console.log('Expected: add_on_removed event');
window.trackAddOnRemoved(mockAddOns.cookies.id, 'dessert', testTier);

console.log('\n--- Test 6: Add-On Removed (With Variant) ---');
console.log('Expected: add_on_removed event (with preparation_method=baked)');
window.trackAddOnRemoved(mockAddOns.cauliflower.id, 'vegetarian', testTier, 'baked');

console.log('\n--- Test 7: Total Calculated ---');
console.log('Expected: total_calculated event (with value parameter)');
const basePrice = 149.99;
const addOnsTotal = 45.00 + 50.00 + 28.00; // Eggplant + Cauliflower + Cookies
const finalPrice = basePrice + addOnsTotal;
window.trackTotalCalculated(
  testPackageId,
  testTier,
  basePrice,
  addOnsTotal,
  finalPrice,
  3, // total add-ons
  2, // vegetarian count
  1  // dessert count
);

console.log('\n--- Test 8: ezCater Redirect (Conversion) ---');
console.log('Expected: ezcater_redirect event (with time_to_order and value)');
const selectedAddOns = [mockAddOns.eggplant, mockAddOns.cauliflower, mockAddOns.cookies];
window.trackEzCaterRedirect(testPackageId, testTier, finalPrice, selectedAddOns);

console.log('\n%c✅ Test Suite Complete!', 'font-size: 14px; font-weight: bold; color: #4CAF50');
console.log('%cCheck GA4 DebugView for events:', 'font-size: 12px; color: #2196F3');
console.log('https://analytics.google.com/analytics/web/#/debugview/');
console.log('\nExpected events fired:');
console.log('1. add_on_selected (Elena\'s Eggplant)');
console.log('2. vegetarian_interest (auto-fired)');
console.log('3. add_on_selected (Cauliflower Wings, fried)');
console.log('4. vegetarian_interest (auto-fired)');
console.log('5. preparation_method_changed (fried → baked)');
console.log('6. add_on_selected (Cookies)');
console.log('7. dessert_interest (auto-fired)');
console.log('8. add_on_removed (Cookies)');
console.log('9. add_on_removed (Cauliflower Wings, baked)');
console.log('10. total_calculated');
console.log('11. ezcater_redirect');
console.log('\nTotal: 11 events');
```

---

## DebugView Validation Checklist

### 1. **add_on_selected** (Elena's Eggplant)
- [ ] Event name: `add_on_selected`
- [ ] `event_category`: `catering`
- [ ] `item_id`: `elenas-eggplant-parmesan-tray`
- [ ] `item_name`: `Elena's Eggplant Parmesan`
- [ ] `category`: `vegetarian`
- [ ] `price`: `45`
- [ ] `package_tier`: `1`
- [ ] `selection_count`: `1`
- [ ] `preparation_method`: **NOT PRESENT** (correct - no variants)

### 2. **vegetarian_interest** (auto-fired)
- [ ] Event name: `vegetarian_interest`
- [ ] `event_category`: `catering`
- [ ] `package_tier`: `1`
- [ ] `add_on_count`: `1`
- [ ] `has_preparation_choice`: `false`

### 3. **add_on_selected** (Cauliflower Wings)
- [ ] Event name: `add_on_selected`
- [ ] `item_id`: `cauliflower-wings-50`
- [ ] `item_name`: `Cauliflower Wings`
- [ ] `category`: `vegetarian`
- [ ] `price`: `50`
- [ ] `package_tier`: `1`
- [ ] `selection_count`: `1`
- [ ] `preparation_method`: `fried` ✅ **PRESENT** (has variants)

### 4. **vegetarian_interest** (auto-fired)
- [ ] `has_preparation_choice`: `true` (cauliflower has variants)

### 5. **preparation_method_changed**
- [ ] Event name: `preparation_method_changed`
- [ ] `event_category`: `catering`
- [ ] `item_id`: `cauliflower-wings-50`
- [ ] `from_method`: `fried`
- [ ] `to_method`: `baked`
- [ ] `package_tier`: `1`

### 6. **add_on_selected** (Cookies)
- [ ] Event name: `add_on_selected`
- [ ] `category`: `dessert`
- [ ] `price`: `28`
- [ ] `preparation_method`: **NOT PRESENT** (correct)

### 7. **dessert_interest** (auto-fired)
- [ ] Event name: `dessert_interest`
- [ ] `event_category`: `catering`
- [ ] `package_tier`: `1`
- [ ] `add_on_count`: `1`

### 8. **add_on_removed** (Cookies)
- [ ] Event name: `add_on_removed`
- [ ] `item_id`: `daisys-chocolate-chip-cookies-24`
- [ ] `category`: `dessert`
- [ ] `package_tier`: `1`
- [ ] `preparation_method`: **NOT PRESENT** (correct)

### 9. **add_on_removed** (Cauliflower Wings)
- [ ] Event name: `add_on_removed`
- [ ] `item_id`: `cauliflower-wings-50`
- [ ] `category`: `vegetarian`
- [ ] `package_tier`: `1`
- [ ] `preparation_method`: `baked` ✅ **PRESENT** (tracking removal state)

### 10. **total_calculated**
- [ ] Event name: `total_calculated`
- [ ] `event_category`: `catering`
- [ ] `package_id`: `lunch-box-special`
- [ ] `package_tier`: `1`
- [ ] `base_price`: `149.99`
- [ ] `add_ons_total`: `123` (45 + 50 + 28)
- [ ] `final_price`: `272.99`
- [ ] `add_on_count`: `3`
- [ ] `vegetarian_count`: `2`
- [ ] `dessert_count`: `1`
- [ ] `value`: `272.99` ✅ **PRESENT** (conversion tracking)

### 11. **ezcater_redirect** (Primary Conversion)
- [ ] Event name: `ezcater_redirect`
- [ ] `event_category`: `conversion`
- [ ] `package_id`: `lunch-box-special`
- [ ] `package_tier`: `1`
- [ ] `final_price`: `272.99`
- [ ] `add_ons_count`: `3`
- [ ] `time_to_order`: [integer seconds]
- [ ] `value`: `272.99` ✅ **PRESENT** (conversion value)

---

## Edge Case Testing

### Test A: Rapid Add/Remove (Prevent Duplicates)
```javascript
// Fire add and remove rapidly
window.trackAddOnSelected(mockAddOns.cookies, 1, undefined, 1);
window.trackAddOnRemoved(mockAddOns.cookies.id, 'dessert', 1);
// Expected: 2 distinct events (add_on_selected, add_on_removed)
// Should NOT see duplicate events
```

### Test B: Method Change Without Selection
```javascript
// This should be prevented by UI validation, but test the event itself
window.trackPreparationMethodChanged('cauliflower-wings-50', 'fried', 'baked', 1);
// Expected: Event fires (UI must prevent this state)
// Note: Document in Gate 3 that toggle should be disabled until add-on selected
```

### Test C: Total Calculated on Page Load (Should NOT Fire)
```javascript
// This should only fire when user adds/removes add-ons
// UI must NOT call trackTotalCalculated() on initial render
// Only call when state changes
```

---

## Session Storage Verification

After running test suite, check session storage:

```javascript
// Check conversion tracking data
console.log('Catering Order Started:', sessionStorage.getItem('catering_order_started'));
console.log('Add-Ons Count:', sessionStorage.getItem('catering_add_ons_count'));
console.log('Time to Order:', sessionStorage.getItem('time_to_order'));

// Expected output:
// catering_order_started: "lunch-box-special"
// catering_add_ons_count: "3"
// time_to_order: [seconds since page load]
```

---

## Option 2: Standalone Test Page

If you prefer a dedicated test page:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Analytics Test Harness - Catering Add-Ons</title>

  <!-- GA4 -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-XXXXXXXXXX');
  </script>

  <style>
    body {
      font-family: system-ui;
      max-width: 800px;
      margin: 50px auto;
      padding: 20px;
    }
    button {
      margin: 10px 5px;
      padding: 10px 20px;
      font-size: 14px;
      cursor: pointer;
    }
    .test-section {
      border: 1px solid #ddd;
      padding: 20px;
      margin: 20px 0;
      border-radius: 8px;
    }
    .console-output {
      background: #1e1e1e;
      color: #d4d4d4;
      padding: 15px;
      border-radius: 4px;
      font-family: monospace;
      font-size: 12px;
      overflow-x: auto;
    }
  </style>
</head>
<body>
  <h1>🧪 Analytics Test Harness</h1>
  <p><strong>Status:</strong> Ready for DebugView validation</p>
  <p><strong>GA4 Property:</strong> G-XXXXXXXXXX (replace with actual ID)</p>

  <div class="test-section">
    <h2>Instructions</h2>
    <ol>
      <li>Open <a href="https://analytics.google.com/analytics/web/#/debugview/" target="_blank">GA4 DebugView</a></li>
      <li>Click buttons below to fire events</li>
      <li>Verify events appear in DebugView with correct parameters</li>
    </ol>
  </div>

  <div class="test-section">
    <h2>Test Controls</h2>
    <button onclick="runAllTests()">▶️ Run All Tests</button>
    <button onclick="clearConsole()">🗑️ Clear Console</button>
    <button onclick="checkSessionStorage()">💾 Check Session Storage</button>
  </div>

  <div class="test-section">
    <h2>Individual Tests</h2>
    <button onclick="test1()">Test 1: Add Eggplant (no variant)</button>
    <button onclick="test2()">Test 2: Add Cauliflower (fried)</button>
    <button onclick="test3()">Test 3: Change Method (fried→baked)</button>
    <button onclick="test4()">Test 4: Add Cookies (dessert)</button>
    <button onclick="test5()">Test 5: Remove Cookies</button>
    <button onclick="test6()">Test 6: Remove Cauliflower (baked)</button>
    <button onclick="test7()">Test 7: Calculate Total</button>
    <button onclick="test8()">Test 8: ezCater Redirect</button>
  </div>

  <div class="test-section">
    <h2>Console Output</h2>
    <div id="output" class="console-output">
      Click "Run All Tests" to begin...
    </div>
  </div>

  <!-- Import analytics module -->
  <script type="module">
    import {
      trackAddOnSelected,
      trackAddOnRemoved,
      trackPreparationMethodChanged,
      trackTotalCalculated,
      trackEzCaterRedirect
    } from './src/analytics.js';

    // Make functions globally available
    window.trackAddOnSelected = trackAddOnSelected;
    window.trackAddOnRemoved = trackAddOnRemoved;
    window.trackPreparationMethodChanged = trackPreparationMethodChanged;
    window.trackTotalCalculated = trackTotalCalculated;
    window.trackEzCaterRedirect = trackEzCaterRedirect;
  </script>

  <!-- Test runner script (paste the test suite from above) -->
  <script src="./docs/catering/test-runner.js"></script>
</body>
</html>
```

---

## Known Issues / Notes

1. **GA4 Property ID**: Replace `G-XXXXXXXXXX` with actual property ID
2. **Module Import**: If testing standalone page, ensure proper module paths
3. **DebugView Delay**: Events may take 5-10 seconds to appear in DebugView
4. **Local Testing**: DebugView works on localhost (no need for production domain)

---

## Success Criteria

✅ All 11 events fire correctly
✅ `preparation_method` only present when variants exist
✅ `value` parameter present on `total_calculated` and `ezcater_redirect`
✅ Auto-fire events (`vegetarian_interest`, `dessert_interest`) work
✅ Session storage persists conversion data
✅ No duplicate events on rapid clicks
✅ Console logs match expected output

---

**Next Steps After DebugView Pass:**
- Gate 3: Build Step 3 vegetarian add-ons UI
- Gate 3: Build Step 4 desserts UI
- Gate 3: Wire analytics to real component interactions
- Gate 3: Build sticky summary with running total calculator

---

*Last Updated: October 13, 2025*
*Codex-Philly to run DebugView validation before Gate 3 implementation*
