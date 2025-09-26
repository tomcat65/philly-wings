# Hardcoded Data Analysis - Remaining Issues Found

*Date: September 23, 2025*

## 🚨 Critical Hardcoded Data Sections Identified

### 1. **Hardcoded Wings Array** (Lines 2637-2668)
```javascript
wings: [
  {
    id: 'boneless-6',
    name: '6 Boneless Wings',
    description: 'Tender boneless wings with 1 sauce',
    price: 6.99 * multiplier,
    image: 'boneless-wings',
    badge: 'CUSTOMER FAVORITE'
  },
  // ... more hardcoded wings
]
```
**Issue**: Should use Firestore `menuItems/wings` variants instead
**Impact**: Wing pricing, descriptions, and availability not reflecting Firestore data

### 2. **Hardcoded Sides Array** (Lines 2669-2699)
```javascript
sides: [
  {
    id: 'loaded-fries',
    name: 'Loaded Fries',
    description: 'Fries topped with cheese, bacon & sour cream',
    price: 8.99 * multiplier,
    image: 'loaded-fries',
    badge: 'SIGNATURE'
  },
  // ... more hardcoded sides
]
```
**Issue**: Should use Firestore `menuItems/fries` and `menuItems/mozzarella_sticks` variants
**Impact**: Missing proper variety and pricing from Firestore

### 3. **Hardcoded Beverages Fallback** (Lines 2700-2728)
```javascript
beverages: beverages && beverages.length > 0 ? beverages : [
  {
    id: 'fountain-drinks',
    name: 'Fountain Drinks',
    description: '20oz or 32oz • 8 flavors: Coke, Diet Coke, Sprite...',
    basePrice: 2.49,
    imageUrl: 'https://...'
  },
  // ... more hardcoded beverages
]
```
**Issue**: Fallback should use Firestore `menuItems/drinks` variants properly
**Impact**: Not reflecting actual drink options and pricing from Firestore

## 🎯 Required Fixes

### Fix 1: Replace Wings Array with Firestore Data
**Current**: Hardcoded 4 wing options (6/12 boneless, 6/12 bone-in)
**Target**: Use `menuItems.wings.variants` array from Firestore
**Data Source**: `menuItems/RLhhyuaE4rxKj47Puu3W` variants

### Fix 2: Replace Sides Array with Firestore Data
**Current**: Hardcoded 4 side options
**Target**: Use `menuItems.fries.variants` + `menuItems.mozzarella_sticks.variants`
**Data Sources**:
- `menuItems/f6aCNjRZ277NliIo1Hmz` (fries)
- `menuItems/GmXfuczi4k4hUPBGDXJx` (mozzarella)

### Fix 3: Fix Beverages Fallback Logic
**Current**: Hardcoded fallback beverages
**Target**: Always use Firestore `menuItems.drinks.variants`
**Data Source**: `menuItems/kEJTNxzMmNApCqqkwYpO` variants

## 📊 Firestore Data Structure for Replacement

### Wings Variants (from Firestore)
```javascript
// Available: wings_6_bonein, wings_6_boneless, wings_12_bonein, etc.
// Each has: id, name, count, type, basePrice, platformPricing, description
```

### Fries Variants (from Firestore)
```javascript
// Available: fries_regular, fries_cheese, fries_loaded, fries_bacon_cheese
// Each has: id, name, size, basePrice, platformPricing, description
```

### Mozzarella Variants (from Firestore)
```javascript
// Available: mozzarella_4, mozzarella_8, mozzarella_12, mozzarella_16
// Each has: id, name, count, basePrice, platformPricing, description
```

### Drinks Variants (from Firestore)
```javascript
// Available: fountain_20oz, fountain_32oz, bottled_water
// Each has: id, name, size, basePrice, platformPricing, description
```

## 🔧 Implementation Strategy

### Step 1: Extract Wings from menuItems
```javascript
const wingsData = menuItems.find(item => item.id === 'wings');
const wingsArray = wingsData?.variants?.map(variant => ({
  id: variant.id,
  name: variant.name,
  description: variant.description,
  price: variant.basePrice * multiplier,
  image: wingsData.images?.hero,
  badge: variant.count >= 24 ? 'PARTY SIZE' : variant.count >= 12 ? 'GREAT VALUE' : 'CUSTOMER FAVORITE'
})) || [];
```

### Step 2: Extract Sides from menuItems
```javascript
const friesData = menuItems.find(item => item.id === 'fries');
const mozzData = menuItems.find(item => item.id === 'mozzarella_sticks');
const sidesArray = [
  ...(friesData?.variants?.map(variant => ({...})) || []),
  ...(mozzData?.variants?.map(variant => ({...})) || [])
];
```

### Step 3: Fix Beverages Logic
```javascript
const drinksData = menuItems.find(item => item.id === 'drinks');
const beveragesArray = drinksData?.variants?.map(variant => ({
  id: variant.id,
  name: variant.name,
  description: variant.description,
  basePrice: variant.basePrice,
  platformPrice: (variant.basePrice * multiplier).toFixed(2),
  imageUrl: variant.imageUrl || drinksData.images?.hero
})) || [];
```

## ⚠️ Impact of Current Hardcoding

### Problems Caused:
1. **Price Inconsistency**: Hardcoded prices don't match Firestore platform pricing
2. **Missing Options**: Limited to 4 wing variants vs 10 available in Firestore
3. **Outdated Info**: Descriptions and availability not reflecting admin updates
4. **Image Issues**: Using hardcoded image names vs Firebase Storage URLs
5. **Platform Differences**: Not respecting platform-specific pricing models

### User Experience Issues:
- Customers see different options on platform vs admin panel
- Pricing discrepancies between platforms
- Missing premium options (30, 50 wing counts)
- Inconsistent branding and descriptions

## 🚀 Priority Level: **HIGH**

These hardcoded arrays directly contradict the requirement that "nothing can be hard coded, everything is served from our backend." Must be fixed to ensure data consistency across the platform.

## ✅ Next Actions Required

1. **[URGENT]** Replace hardcoded wings array with Firestore variants
2. **[URGENT]** Replace hardcoded sides array with Firestore variants
3. **[URGENT]** Fix beverages fallback to always use Firestore data
4. **[TESTING]** Verify all platform endpoints show consistent Firestore data
5. **[VALIDATION]** Confirm pricing matches admin panel exactly

## 📁 Files to Modify
- **Primary**: `/home/tomcat65/projects/dev/philly-wings/functions/index.js` (lines 2637-2728)
- **Test**: Platform menu URLs after changes
- **Validate**: Against Firestore data in admin panel