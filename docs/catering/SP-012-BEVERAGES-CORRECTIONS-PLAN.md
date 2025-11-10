# SP-012: Beverages Section - Corrections Plan

**Date**: 2025-11-07
**Status**: 🔴 Needs Corrections
**Issue**: Implemented wrong beverage products

## Problems Identified

### 1. Wrong Water Product ❌
**Current**: Generic "bottled_water_packs" with spring water
**Correct**: Dasani bottled water (16.9oz) - individual bottles used in boxed meals

### 2. Wrong Tea Product ❌
**Current**: Using `bagged_tea` document (ID: v1tYQ669l1jlaOPQURpd)
**Correct**: Only `boxed_iced_tea` for catering (NO bagged tea for catering)

**Evidence**:
- From BOXED_MEALS_SCHEMA.md: "Bottled water automatically included (from menuItems drinks category)"
- From seed-production.js line 277-291: Individual Dasani water bottles
- User correction: "no bagged teas, only the boxed"

## Current Production Data (Verified)

### Existing Documents

**1. menuItems/drinks (ID: kEJTNxzMmNApCqqkwYpO)**
```javascript
{
  id: 'drinks',
  name: 'Drinks',
  category: 'drinks',
  variants: [
    {
      id: 'water_bottle',
      name: 'Bottled Water',
      description: '16.9oz bottled water',
      basePrice: 1.49,
      portionDetails: {
        size: '16.9 oz',
        brand: 'Dasani or similar'
      }
    }
    // ... other drink variants (7 total)
  ]
}
```

**2. menuItems/boxed_iced_tea (ID: 4lt9yiHeJgF8nx1Nx5nO)** ✅
```javascript
{
  id: 'boxed_iced_tea',
  name: 'Boxed Iced Tea',
  category: 'drinks',
  basePrice: 19.99,
  variants: [
    {
      id: 'sweet_tea_96oz_box',
      name: 'Sweet Tea 96oz Box',
      basePrice: 19.99,
      servings: 6,
      volume: '96oz'
    },
    {
      id: 'unsweetened_tea_96oz_box',
      name: 'Unsweetened Tea 96oz Box',
      basePrice: 19.99,
      servings: 6,
      volume: '96oz'
    },
    {
      id: 'sweet_tea_3gallon_box',
      name: 'Sweet Tea 3 Gallon Box',
      basePrice: 80.64,
      servings: 24,
      volume: '384oz'
    },
    {
      id: 'unsweetened_tea_3gallon_box',
      name: 'Unsweetened Tea 3 Gallon Box',
      basePrice: 80.64,
      servings: 24,
      volume: '384oz'
    }
  ]
}
```

**3. menuItems/lavazza_premium_coffee (ID: lavazza_premium_coffee)** ✅
```javascript
{
  id: 'lavazza_premium_coffee',
  name: 'Lavazza Premium Coffee',
  category: 'hot-beverages',
  availableFor: ['catering'],
  variants: [
    {
      id: '96oz_cambro',
      name: '96oz Cambro',
      basePrice: 49.99,
      servings: 12
    },
    {
      id: '128oz_cambro',
      name: '128oz Cambro',
      basePrice: 64.99,
      servings: 16
    }
  ]
}
```

**4. menuItems/ghirardelli_hot_chocolate (ID: ghirardelli_hot_chocolate)** ✅
```javascript
{
  id: 'ghirardelli_hot_chocolate',
  name: 'Ghirardelli Hot Chocolate',
  category: 'hot-beverages',
  availableFor: ['catering'],
  variants: [
    {
      id: '96oz_cambro',
      name: '96oz Cambro',
      basePrice: 59.99,
      servings: 12
    },
    {
      id: '128oz_cambro',
      name: '128oz Cambro',
      basePrice: 79.99,
      servings: 16
    }
  ]
}
```

**5. menuItems/bagged_tea (ID: v1tYQ669l1jlaOPQURpd)** ❌ DELETE
```javascript
{
  id: 'bagged_tea',
  name: 'Bagged Tea',
  category: 'drinks',
  basePrice: 8.99,
  // This should NOT be in catering
}
```

**6. menuItems/bottled_water_packs (ID: eAAWN7v8MJj3cNhC3yTR)** ❌ DELETE
```javascript
{
  id: 'bottled_water_packs',
  name: 'Bottled Water',
  category: 'beverages',
  // Wrong product - created by mistake
}
```

## Correct Beverages for Catering

### Cold Beverages (2 products)

**1. Boxed Iced Tea** ✅ (Already Exists)
- Source: `menuItems/boxed_iced_tea`
- 4 variants (Sweet/Unsweetened in 96oz and 3-gallon)
- Used in: Shared platters catering

**2. Dasani Bottled Water** (Use existing drinks document)
- Source: `menuItems/drinks` → `water_bottle` variant
- Individual 16.9oz bottles
- Pricing structure for catering packs:
  - 5-Pack: $7.45 (5 × $1.49)
  - 10-Pack: $14.90 (10 × $1.49)
  - 20-Pack: $29.80 (20 × $1.49)
- Used in: Boxed meals (auto-included), Shared platters (add-on)

### Hot Beverages (2 products)

**3. Lavazza Premium Coffee** ✅ (Already Exists)
- Source: `menuItems/lavazza_premium_coffee`
- 2 variants (96oz/128oz cambro)
- Used in: Shared platters catering

**4. Ghirardelli Hot Chocolate** ✅ (Already Exists)
- Source: `menuItems/ghirardelli_hot_chocolate`
- 2 variants (96oz/128oz cambro)
- Used in: Shared platters catering

## Correction Actions Required

### Database Corrections

**1. Delete Wrong Documents**
```javascript
// Delete bottled_water_packs (created by mistake)
await db.collection('menuItems').doc('eAAWN7v8MJj3cNhC3yTR').delete();

// Delete bagged_tea (not for catering)
await db.collection('menuItems').doc('v1tYQ669l1jlaOPQURpd').delete();
```

**2. Use Existing Water from Drinks Document**
- No new document needed
- Query `menuItems/drinks` and extract `water_bottle` variant
- Display as quantity selector (not pack selector)
- Calculate pack pricing: quantity × $1.49

### Code Corrections

**1. beverages-selector.js**

**Current Query**:
```javascript
const q = query(
  collection(db, 'menuItems'),
  where('category', 'in', ['beverages', 'drinks', 'hot-beverages']),
  where('active', '==', true)
);
```

**Corrected Query**:
```javascript
// Get multiple documents with specific logic
const coldBeverages = [];
const hotBeverages = [];

// 1. Get boxed iced tea
const boxedTeaDoc = await getDoc(doc(db, 'menuItems', 'boxed_iced_tea'));
if (boxedTeaDoc.exists()) {
  coldBeverages.push({ id: boxedTeaDoc.id, ...boxedTeaDoc.data() });
}

// 2. Get water bottles from drinks document
const drinksDoc = await getDoc(doc(db, 'menuItems', 'drinks'));
if (drinksDoc.exists()) {
  const drinksData = drinksDoc.data();
  const waterVariant = drinksData.variants?.find(v => v.id === 'water_bottle');
  if (waterVariant) {
    coldBeverages.push({
      id: 'dasani_water',
      name: 'Dasani Bottled Water',
      category: 'beverages',
      description: '16.9oz premium bottled water',
      variants: [
        {
          id: 'water_5pack',
          name: '5 Bottles',
          quantity: 5,
          basePrice: 7.45,
          servings: 5,
          unit: 'bottles'
        },
        {
          id: 'water_10pack',
          name: '10 Bottles',
          quantity: 10,
          basePrice: 14.90,
          servings: 10,
          unit: 'bottles'
        },
        {
          id: 'water_20pack',
          name: '20 Bottles',
          quantity: 20,
          basePrice: 29.80,
          servings: 20,
          unit: 'bottles'
        }
      ]
    });
  }
}

// 3. Get hot beverages
const q = query(
  collection(db, 'menuItems'),
  where('category', '==', 'hot-beverages'),
  where('active', '==', true)
);
const hotSnapshot = await getDocs(q);
hotSnapshot.forEach(doc => {
  hotBeverages.push({ id: doc.id, ...doc.data() });
});
```

**2. UI Display Changes**

**Water Display**:
- Show as "Dasani Bottled Water"
- Dropdown options: "5 Bottles ($7.45)", "10 Bottles ($14.90)", "20 Bottles ($29.80)"
- Not "5-Pack", "10-Pack" - use "bottles" terminology

**Tea Display**:
- Show ONLY "Boxed Iced Tea" (no bagged tea)
- 4 variants as dropdowns

### Pricing Corrections

**Water Pricing Logic**:
```javascript
// NOT pack-based, but quantity-based
{
  id: 'dasani_water',
  name: 'Dasani Bottled Water',
  variantId: 'water_10pack',
  variantName: '10 Bottles',
  quantity: 2,  // User selected 2 orders of 10 bottles
  basePrice: 14.90,  // Price per 10-bottle order
  servings: 10,
  totalBottles: 20  // 2 orders × 10 bottles = 20 total bottles
}
```

## Implementation Steps

### Step 1: Database Cleanup
- [ ] Delete `bottled_water_packs` document
- [ ] Delete `bagged_tea` document
- [ ] Verify 4 correct documents remain

### Step 2: Component Updates
- [ ] Update `fetchBeverages()` query logic
- [ ] Add water variant transformation
- [ ] Remove bagged tea filtering
- [ ] Update UI labels (bottles vs packs)

### Step 3: Testing
- [ ] Verify only 4 beverages show (2 cold, 2 hot)
- [ ] Test water bottle quantity selector
- [ ] Test boxed tea variants
- [ ] Test coffee variants
- [ ] Test hot chocolate variants
- [ ] Verify pricing calculations

### Step 4: Documentation
- [ ] Update SP-012-IMPLEMENTATION-SUMMARY.md
- [ ] Update component JSDoc comments
- [ ] Update state structure documentation

## Expected Final State

### Cold Beverages Section
```
❄️ COLD BEVERAGES

┌─────────────────────────────────────────────────────┐
│ Boxed Iced Tea              │ Sweet Tea 96oz Box    │
│ Premium iced tea in boxes   │ $19.99                │
│                             │ Qty: [+/-]            │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ Dasani Bottled Water        │ 10 Bottles            │
│ 16.9oz premium water        │ $14.90                │
│                             │ Qty: [+/-]            │
└─────────────────────────────────────────────────────┘
```

### Hot Beverages Section
```
☕ HOT BEVERAGES

┌─────────────────────────────────────────────────────┐
│ Lavazza Premium Coffee      │ 96oz Cambro           │
│ Italian premium coffee      │ $49.99                │
│                             │ Qty: [+/-]            │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ Ghirardelli Hot Chocolate   │ 96oz Cambro           │
│ Premium hot chocolate       │ $59.99                │
│                             │ Qty: [+/-]            │
└─────────────────────────────────────────────────────┘
```

## Summary

**Correct Beverages** (4 total):
1. ✅ Boxed Iced Tea (4 variants) - exists
2. ✅ Dasani Bottled Water (extract from drinks/water_bottle) - transform to 5/10/20 bottles
3. ✅ Lavazza Premium Coffee (2 variants) - exists
4. ✅ Ghirardelli Hot Chocolate (2 variants) - exists

**To Delete** (2):
1. ❌ bottled_water_packs (wrong product)
2. ❌ bagged_tea (not for catering)

**Key Changes**:
- Water uses individual Dasani bottles (from boxed meals), not generic packs
- Display as "bottles" not "packs" (5/10/20 bottles)
- No bagged tea - only boxed iced tea for catering
