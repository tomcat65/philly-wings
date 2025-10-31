# Manual Testing Checklist - CateringAddOns Migration

## 🎯 Test Environment
- **Main App**: http://127.0.0.1:5003
- **Catering Page**: http://127.0.0.1:5003/catering.html
- **Emulator UI**: http://127.0.0.1:4002/
- **Firestore**: Production (emulator not running, using live data)

## ✅ Pre-Test Verification

### Database State
- [x] 22 active cateringAddOns in Firestore
- [x] 6 categories: desserts, beverages, salads, sides, quick-adds, hot-beverages
- [x] All items have `packSize` field (including hot beverages)
- [x] 18 items have source pointers
- [x] Backup created: `cateringAddOns-backup-2025-10-19.json`

## 📋 Test Scenarios

### 1. Page Load & Initial Rendering
**Location**: http://127.0.0.1:5003/catering.html

- [ ] Page loads without console errors
- [ ] "Build Your Package" section displays
- [ ] All 3 package tiers visible (Starter, Standard, Premium)
- [ ] No JavaScript errors in browser console (F12)

### 2. Package Selection & Add-Ons Display
**Action**: Click "Customize Package" on any tier

**Verify Add-Ons Sections Render**:
- [ ] 🔥 Hot Beverages section displays
- [ ] 🥤 Beverages section displays
- [ ] 🍰 Desserts section displays
- [ ] 🥗 Salads section displays
- [ ] 🍟 Sides section displays
- [ ] ⚡ Quick Adds section displays

**Verify Category Ordering**:
- [ ] Hot Beverages appears FIRST
- [ ] Beverages appears second
- [ ] Desserts appears third
- [ ] Salads, Sides, Quick Adds follow

### 3. Pack Size Grouping (Desserts)
**Action**: Scroll to Desserts section

**Verify Pack Size Subgroups**:
- [ ] "Individual Portions" subgroup exists
- [ ] Shows 5 individual desserts under this subgroup
- [ ] "5-Pack Bundles" subgroup exists
- [ ] Shows 5 five-pack desserts under this subgroup

**Verify Individual Items** (sample check):
- [ ] "Daisy's Marble Pound Cake (Individual)" displays
- [ ] "Daisy's Marble Pound Cake (5-Pack)" displays
- [ ] Both have different prices (individual ≈ $3.50, 5-pack ≈ $17.50)

### 4. Pack Size Information Display (NEW)
**Action**: Inspect any add-on card

**Verify Pack Size is Visible** (should appear in bold):
- [ ] Desserts show: **individual** or **5pack**
- [ ] Beverages show: **96oz** or **3gal**
- [ ] Hot Beverages show: **96oz** or **128oz**
- [ ] Salads/Sides show: **family**
- [ ] Quick Adds show: **5pack**

**Verify Serving Info Format**:
```
<bold>packSize</bold> • Serves X • serving size
```
Example: **individual** • Serves 1 • 1 slice
Example: **5pack** • Serves 5 • 5 slices
Example: **96oz** • Serves 6 • 16oz per serving

### 5. Quantity Multiplier Badge (NEW)
**Action**: Check 5-pack items for quantity badge

**Verify Badge Displays**:
- [ ] 5-pack desserts show badge: "5× slices"
- [ ] 5-pack quick adds show badge: "5× items" or "5× bottles"
- [ ] Badge appears as overlay on card image (top-right or similar)
- [ ] Badge styling is visible and distinct

### 6. Add-On Selection & Quantity Controls
**Action**: Test quantity controls on various items

**For Desserts** (individual):
- [ ] Suggested quantities: 1, 2, 3, 4, 5 buttons visible
- [ ] Click "2" → quantity selector shows 2
- [ ] Price updates correctly (individual price × 2)

**For Desserts** (5-pack):
- [ ] Suggested quantities visible
- [ ] Click "1" → quantity selector shows 1
- [ ] Price shows 5-pack price × 1

**For Beverages**:
- [ ] 96oz option has quantity controls
- [ ] 3gal option has quantity controls
- [ ] Both work independently

**For Hot Beverages**:
- [ ] 96oz coffee has quantity controls
- [ ] 128oz coffee has quantity controls
- [ ] Hot chocolate variants work similarly

### 7. Dietary Tags & Allergen Info
**Action**: Check any dessert card

**Verify Tags Display**:
- [ ] Vegetarian tag visible (green badge/icon)
- [ ] Allergen info expandable/visible
- [ ] Allergens list includes: gluten, dairy, eggs

### 8. Price Calculations
**Action**: Add multiple items and check total

**Add to Cart**:
- [ ] 2× Individual Marble Pound Cake (should be ~$7.00)
- [ ] 1× 5-Pack Gourmet Brownies (should be ~$20.00)
- [ ] 1× Boxed Iced Tea 96oz (should be ~$12.99)

**Verify**:
- [ ] Subtotal calculates correctly
- [ ] Items show in cart summary
- [ ] Remove button works for each item
- [ ] Total updates when items removed

### 9. Tier-Specific Availability
**Action**: Test different tiers

**Starter Tier** (smallest):
- [ ] All `availableForTiers: [1,2,3]` items show
- [ ] No errors about missing add-ons

**Standard Tier** (medium):
- [ ] Same items as Starter (all items available for all tiers)

**Premium Tier** (largest):
- [ ] Same items as Starter/Standard

### 10. Image Loading & Responsiveness
**Action**: Check images across different screen sizes

**Desktop View** (>1024px):
- [ ] All add-on images load correctly
- [ ] Images are crisp (WebP format preferred)
- [ ] Grid layout displays properly (2-3 columns)

**Tablet View** (768px-1024px):
- [ ] Images scale appropriately
- [ ] Grid adjusts to 2 columns
- [ ] No horizontal overflow

**Mobile View** (<768px):
- [ ] Images load and display
- [ ] Grid becomes single column
- [ ] Touch controls work for quantity selection

### 11. Source Pointer Data Accuracy
**Action**: Spot-check data accuracy against source collections

**Compare Desserts** (check Firebase Console if needed):
- [ ] "Marble Pound Cake" name matches `desserts/marble_pound_cake`
- [ ] Price matches source + ezCater markup (+20%)
- [ ] Image URL matches source
- [ ] Allergens match source

**Note**: Hot beverages won't have source pointers (standalone items)

### 12. Console Errors & Network
**Action**: Monitor browser console throughout testing

**Check for**:
- [ ] No JavaScript errors
- [ ] No failed network requests (check Network tab)
- [ ] Firestore queries complete successfully
- [ ] Images load from Firebase Storage

## 🐛 Issues to Watch For

### Known Issues (should NOT occur):
- ❌ Missing pack size information on cards
- ❌ Hot beverages without `packSize` field
- ❌ Old category structure (vegetarian, etc.)
- ❌ Missing add-on sections
- ❌ Duplicate items in lists

### Report If You See:
- Layout breaks or overlapping elements
- Missing images or broken image links
- Incorrect pricing calculations
- Add-ons not filtering by tier correctly
- Quantity controls not working
- Pack size groups not organized properly

## 📊 Performance Checks

### Load Times:
- [ ] Initial page load < 3 seconds
- [ ] Add-ons data loads < 2 seconds
- [ ] Images load progressively (lazy loading)

### Firestore Queries:
- [ ] Check Network tab for duplicate queries
- [ ] Verify efficient query patterns (orderBy category + displayOrder)

## ✅ Success Criteria

All of the following must be true:
1. ✅ All 6 category sections render
2. ✅ Pack sizes are visible in bold on all cards
3. ✅ Quantity multiplier badges show on 5-packs
4. ✅ Hot beverages show 96oz/128oz pack sizes
5. ✅ Desserts group by individual/5pack
6. ✅ All quantity controls work
7. ✅ Price calculations are accurate
8. ✅ No console errors
9. ✅ Responsive design works across screen sizes
10. ✅ Images load correctly from Storage

## 📝 Testing Notes

**Date**: _____________
**Tester**: _____________
**Browser**: _____________
**Screen Size**: _____________

**Issues Found**:
```
[Record any issues here]
```

**Overall Status**:
- [ ] ✅ PASS - Ready for PR
- [ ] ⚠️ MINOR ISSUES - Document and decide if blocking
- [ ] ❌ FAIL - Major issues, needs fixes

---

## 🚀 After Manual Testing

If all tests pass:
1. ✅ Mark manual testing as complete
2. ✅ Document any minor issues
3. ✅ Create PR with full context
4. ✅ Request Codex final review
5. ✅ Deploy to preview environment
