# Step 5 Photo Card UI Implementation Plan
**Date:** October 26, 2025
**Status:** Planning & Review Phase
**Goal:** Replace boring text-list UI with image-rich photo card selectors

---

## DISCOVERY PHASE - What We Learned

### ✅ Research Complete: Existing Photo Card Component

**Location:** `/src/components/catering/photo-card-selector.js` (already exists!)

**Features Available:**
- `renderPhotoCardSelector()` - Main rendering function
- `initPhotoCardSelector()` - Event handler initialization
- `renderDipCounterSelector()` - Counter-based selection (for dips with quantity)
- Image display with lazy loading
- Selection overlays with checkmarks (✓)
- Badges: "Popular", "Best Value", "New"
- Heat level indicators: 🌶️🌶️🌶️
- Price display: +$X.XX
- Dietary tags: "vegetarian", "vegan", "crispy"
- Multi-select support with max limits
- Smooth animations on click

**Currently Used By:** `boxed-meals-flow-v2.js`

### ✅ Firebase Storage Audit - IMAGES FOUND!

**CRITICAL DISCOVERY:** All product images already exist in Firestore with `imageUrl` fields!

**Example URLs found:**
- Cold Sides: `https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Fcoleslaw-salad_800x800.webp`
- Desserts: `https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Fmarble-pound-cake_800x800.webp`
- All in WebP format (800x800)

**Collections with imageUrl:**
- ✅ coldSides (coleslaw, potato salad, veggie sticks)
- ✅ desserts (brownies, pound cake, cheesecakes, red velvet)
- ✅ freshSalads (caesar, spring mix, etc.)
- ✅ menuItems/beverages (iced tea, coffee, etc.)

**Implication:** NO placeholders needed! Fetch from Firestore collections directly

### ✅ Current Step 5 Implementation (What We Built Wrong)

**Location:** `guided-planner.js` lines 1235-1500

**Current Render Functions:**
- `renderCategorySection()` - Chips/Dips (plain text + quantity)
- `renderColdSidesSection()` - Plain text list
- `renderSaladsSection()` - Plain text list
- `renderDessertsSection()` - Plain text list
- `renderBeveragesSection()` - Plain text list

**Current Pricing Logic:** ✅ CORRECT (keep this!)
- `handleQuantityChange()` - State updates
- `updatePriceDelta()` - Per-item pricing
- `updatePackageSummaryPricing()` - Right panel live updates
- Richard's pricing system integration working

---

## PHOTO CARD DATA STRUCTURE MAPPING

### Required Item Structure for Photo Cards

```javascript
{
  id: string,              // Unique identifier
  name: string,            // Display name
  description: string,     // Enticing copy
  imageUrl: string,        // Firebase Storage URL or placeholder
  price: number,           // Add-on cost (for extras)
  badge: string,           // "Popular", "Best Value", null
  heatLevel: number,       // 0-5 (for sauces only)
  tags: [string],          // ["vegetarian", "vegan", "gluten-free"]
  isSpecial: boolean       // Highlight treatment
}
```

### Step 5 Categories → Photo Card Mapping

#### 1. COLD SIDES
**Current Package Data:**
```javascript
pkg.coldSides = [
  { item: "Family Coleslaw", quantity: 1 },
  { item: "Family Potato Salad", quantity: 1 }
]
```

**Transform To:**
```javascript
[
  {
    id: "family-coleslaw",
    name: "Family Coleslaw",
    description: "Sally Sherman's creamy classic",
    imageUrl: "/assets/coleslaw.jpg" OR getPlaceholderImage(),
    price: 12.00,  // From modification-pricing.js
    badge: "Popular",
    tags: ["vegetarian"],
    quantity: 1  // Track separately
  },
  {
    id: "family-potato-salad",
    name: "Family Potato Salad",
    description: "Homestyle with fresh herbs",
    imageUrl: "/assets/potato-salad.jpg",
    price: 14.00,
    tags: ["vegetarian"],
    quantity: 1
  }
]
```

#### 2. SALADS
**Current Package Data:**
```javascript
pkg.salads = [
  { item: "Caesar Salad (Family Size)", quantity: 1 }
]
```

**Transform To:**
```javascript
[
  {
    id: "caesar-family",
    name: "Caesar Salad",
    description: "Crisp romaine, parmesan, garlic croutons",
    imageUrl: "/assets/caesar-salad.jpg",
    price: 27.99,
    badge: "Best Value",
    tags: ["vegetarian", "family-size"],
    quantity: 1
  }
]
```

#### 3. DESSERTS
**Current Package Data:**
```javascript
pkg.desserts = [
  { item: "Marble Pound Cake", quantity: 1 }
]
```

**Transform To:**
```javascript
[
  {
    id: "marble-pound-cake-5pack",
    name: "Marble Pound Cake 5-Pack",
    description: "Daisy's Bakery classic - rich and moist",
    imageUrl: "/assets/pound-cake.jpg",
    price: 17.50,
    badge: "Popular",
    tags: ["vegetarian", "feeds-5"],
    quantity: 1
  }
]
```

#### 4. BEVERAGES
**Current Package Data:**
```javascript
pkg.beverages = [
  { item: "Boxed Iced Tea 96oz", quantity: 1 }
]
```

**Split into HOT and COLD, transform to:**
```javascript
hotBeverages: [
  {
    id: "lavazza-coffee-96oz",
    name: "Lavazza Coffee 96oz",
    description: "Premium Italian roast - serves 6",
    imageUrl: "/assets/coffee.jpg",
    price: 48.00,
    badge: "Premium",
    tags: ["hot", "serves-6"],
    quantity: 1
  }
],
coldBeverages: [
  {
    id: "iced-tea-96oz",
    name: "Boxed Iced Tea 96oz",
    description: "Refreshing brewed tea - serves 6",
    imageUrl: "/assets/iced-tea.jpg",
    price: 12.99,
    tags: ["cold", "serves-6"],
    quantity: 1
  }
]
```

---

## INTEGRATION APPROACH

### Phase 1: Add Imports to guided-planner.js

```javascript
// Add to top of guided-planner.js (after existing imports)
import {
  renderPhotoCardSelector,
  initPhotoCardSelector,
  PHOTO_SELECTOR_CONFIGS
} from './photo-card-selector.js';
```

### Phase 2: Create Transform Functions

**Location:** After mapping functions (line ~140)

```javascript
/**
 * Transform package cold sides to photo card items
 */
function transformColdSidesToPhotoCards(coldSides) {
  return coldSides.map(side => {
    const itemName = side.item || side;
    const pricingKey = mapItemToPricingKey('coldSides', itemName);
    const pricing = pricingKey ? getRemovalCredit(pricingKey.itemName, pricingKey.category) : 0;

    return {
      id: itemName.toLowerCase().replace(/\s+/g, '-'),
      name: itemName,
      description: getDescriptionForItem('coldSides', itemName),
      imageUrl: getImageUrlForItem('coldSides', itemName),
      price: pricing,
      badge: getBadgeForItem('coldSides', itemName),
      tags: getTagsForItem('coldSides', itemName),
      quantity: side.quantity || 1
    };
  });
}

// Similar functions for: transformSaladsToPhotoCards(),
// transformDessertsToPhotoCards(), transformBeveragesToPhotoCards()
```

### Phase 3: Replace Render Functions

**OLD (lines 1345-1380):**
```javascript
function renderColdSidesSection(coldSides) {
  let html = `<div class="customize-category">...`;
  coldSides.forEach((side, index) => {
    html += `<div class="customize-item">...</div>`; // Plain text
  });
  return html;
}
```

**NEW:**
```javascript
function renderColdSidesSection(coldSides) {
  const photoCardItems = transformColdSidesToPhotoCards(coldSides);

  return `
    <div class="customize-category">
      ${renderPhotoCardSelector({
        category: 'cold-sides',
        items: photoCardItems,
        selectedId: null,  // No selection needed, just display with quantity
        multiSelect: false,
        onSelect: () => {}
      })}
      <!-- Quantity controls overlay on cards -->
      <div class="quantity-overlays">
        ${photoCardItems.map((item, index) => `
          <div class="qty-overlay" data-card-index="${index}">
            <button class="qty-btn qty-minus" data-type="coldSides" data-item="${index}">−</button>
            <span class="qty-display" data-type="coldSides" data-item="${index}">${item.quantity}</span>
            <button class="qty-btn qty-plus" data-type="coldSides" data-item="${index}">+</button>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}
```

### Phase 4: Image Handling Strategy - FETCH FROM FIRESTORE!

**NEW APPROACH: Query Firestore collections for imageUrl**

```javascript
/**
 * Fetch cold sides with images from Firestore
 */
async function fetchColdSidesWithImages() {
  try {
    const q = query(
      collection(db, 'coldSides'),
      where('active', '==', true),
      orderBy('sortOrder', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching cold sides:', error);
    return [];
  }
}

// Similar functions for: fetchDessertsWithImages(), fetchSaladsWithImages(), fetchBeveragesWithImages()
```

**Then match package items to Firestore data:**
```javascript
function enrichColdSideWithImage(packageItem, firestoreItems) {
  const itemName = packageItem.item || packageItem;

  // Find matching Firestore item
  const match = firestoreItems.find(fsItem =>
    fsItem.name.toLowerCase().includes(itemName.toLowerCase()) ||
    itemName.toLowerCase().includes(fsItem.name.toLowerCase())
  );

  return {
    id: match?.id || itemName.toLowerCase().replace(/\s+/g, '-'),
    name: itemName,
    description: match?.description || "Delicious and fresh",
    imageUrl: match?.imageUrl || null,  // Real Firebase Storage URL!
    quantity: packageItem.quantity || 1,
    tags: match?.dietaryTags || [],
    allergens: match?.allergens || []
  };
}
```

### Phase 5: Helper Functions for Enticing Content

```javascript
function getDescriptionForItem(category, itemName) {
  const descriptions = {
    'Family Coleslaw': "Sally Sherman's creamy classic with crisp cabbage",
    'Family Potato Salad': "Homestyle with fresh herbs and tangy dressing",
    'Caesar Salad (Family Size)': "Crisp romaine, parmesan, garlic croutons",
    'Spring Mix Salad (Family Size)': "Fresh greens with balsamic vinaigrette",
    'Marble Pound Cake 5-Pack': "Daisy's Bakery - rich, moist, unforgettable",
    'NY Cheesecake 5-Pack': "Classic creamy New York style",
    // ... etc
  };

  return descriptions[itemName] || "Delicious and fresh";
}

function getBadgeForItem(category, itemName) {
  const badges = {
    'Family Coleslaw': 'Popular',
    'Caesar Salad (Family Size)': 'Best Value',
    'Marble Pound Cake 5-Pack': 'Popular',
    'Lavazza Coffee 96oz': 'Premium',
    // ... etc
  };

  return badges[itemName] || null;
}

function getTagsForItem(category, itemName) {
  const allTags = {
    'Family Coleslaw': ['vegetarian', 'serves-8'],
    'Caesar Salad (Family Size)': ['vegetarian', 'family-size'],
    'Cauliflower Wings': ['vegan', 'plant-based'],
    // ... etc
  };

  return allTags[itemName] || [];
}
```

### Phase 6: Quantity Controls Integration

**Challenge:** Photo cards are selection-based, but we need quantity controls

**Solution:** Overlay quantity controls on selected cards

```css
/* Add to catering.css */
.photo-card {
  position: relative;
}

.qty-overlay {
  position: absolute;
  bottom: 10px;
  right: 10px;
  display: flex;
  gap: 8px;
  background: white;
  padding: 4px 8px;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  z-index: 10;
}

.qty-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid #ddd;
  background: white;
  font-size: 18px;
  cursor: pointer;
}

.qty-display {
  min-width: 24px;
  text-align: center;
  font-weight: 600;
}
```

---

## IMPLEMENTATION SEQUENCE

### Step 1: Add Imports ✓
- Import photo card components into guided-planner.js
- No code changes to photo-card-selector.js (it's perfect as-is)

### Step 2: Create Transform Functions ✓
- `transformColdSidesToPhotoCards()`
- `transformSaladsToPhotoCards()`
- `transformDessertsToPhotoCards()`
- `transformBeveragesToPhotoCards()` (split hot/cold)

### Step 3: Create Helper Functions ✓
- `getImageUrlForItem()` - Placeholder strategy
- `getDescriptionForItem()` - Enticing copy
- `getBadgeForItem()` - "Popular", "Best Value"
- `getTagsForItem()` - Dietary tags

### Step 4: Replace Render Functions ✓
- Replace `renderColdSidesSection()`
- Replace `renderSaladsSection()`
- Replace `renderDessertsSection()`
- Replace `renderBeveragesSection()` (split into hot/cold)
- Keep `renderCategorySection()` for chips/dips (they're simple)

### Step 5: Add CSS for Quantity Overlays ✓
- Update `/src/styles/catering.css`
- Position quantity controls over photo cards
- Ensure mobile responsiveness

### Step 6: Integrate Event Handlers ✓
- Keep existing `attachQuantityChangeListeners()`
- Works with new structure (data attributes match)
- No changes needed to pricing logic

### Step 7: Test Build & Deploy ✓
- `npm run build`
- Test in emulator
- Verify images load (placeholders)
- Verify quantity controls work
- Verify pricing updates

---

## RISKS & MITIGATIONS

### Risk 1: Image Placeholders Look Unprofessional
**Mitigation:** Use colored placeholders with category theming + item names
**Future:** Add real product photography session to backlog

### Risk 2: Photo Cards Break Existing Pricing Logic
**Mitigation:** Keep all pricing functions untouched, only change UI layer
**Testing:** Verify each quantity change still triggers pricing updates

### Risk 3: Quantity Controls Conflict with Card Selection
**Mitigation:** Don't use card selection, just display cards with overlay controls
**Alternative:** Use dip counter selector pattern (chips/badges with +/-)

### Risk 4: Mobile Layout Issues
**Mitigation:** Photo cards already have responsive grid classes
**Testing:** Test on mobile viewport in emulator

---

## WHAT WE KEEP (DON'T TOUCH)

✅ **All Pricing Logic:**
- `handleQuantityChange()` - lines 984-1034
- `updatePriceDelta()` - lines 1041-1093
- `updatePackageSummaryPricing()` - lines 1129-1264
- `mapItemToPricingKey()` - lines 91-140
- `initializeCustomizedIncludes()` - lines 857-939

✅ **State Management:**
- `wizardState.customizedIncludes` structure
- Event listener attachment pattern
- Right panel summary rendering

✅ **Photo Card Component:**
- No changes to `photo-card-selector.js`
- It's production-ready and working perfectly in boxed meals

---

## SUCCESS CRITERIA

Before showing to user, verify:

1. ✅ Cold sides display as photo cards with images
2. ✅ Salads display as photo cards with images
3. ✅ Desserts display as photo cards with images
4. ✅ Beverages split into hot/cold with photo cards
5. ✅ Each card shows: image, name, description, badge (if applicable)
6. ✅ Quantity controls overlay on bottom-right of each card
7. ✅ Clicking +/- updates quantity display
8. ✅ Pricing updates in real-time in right panel
9. ✅ Mobile responsive (cards stack properly)
10. ✅ No console errors
11. ✅ Build succeeds without warnings

---

## ESTIMATED TIME

- Import setup: 5 minutes
- Transform functions: 20 minutes
- Helper functions (descriptions, badges): 30 minutes
- Replace render functions: 30 minutes
- CSS for quantity overlays: 15 minutes
- Testing & debugging: 30 minutes
- **Total: ~2 hours**

---

## FILES TO MODIFY

1. `/src/components/catering/guided-planner.js`
   - Add imports (line ~17)
   - Add transform functions (line ~140)
   - Add helper functions (line ~200)
   - Replace render functions (lines 1345-1500)

2. `/src/styles/catering.css`
   - Add `.qty-overlay` styles
   - Add mobile responsive breakpoints

3. **NO CHANGES TO:**
   - `/src/components/catering/photo-card-selector.js` (perfect as-is)
   - `/src/constants/modification-pricing.js` (pricing logic)
   - Any other files

---

## NEXT STEPS

**AWAITING USER APPROVAL:**

Should we proceed with this plan? Key decisions:

1. **Use placeholder images for now?** (vs waiting for real photos)
2. **Keep quantity overlay approach?** (vs alternative UI patterns)
3. **Implement all categories at once?** (vs one category as proof-of-concept)

**Once approved, implementation order:**
1. Start with Cold Sides category as proof-of-concept
2. Show user, get feedback
3. Roll out to remaining categories
4. Polish & deploy

---
**Status:** READY FOR REVIEW - Awaiting user approval to proceed
