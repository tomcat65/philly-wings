# Gate 4: New Menu Items Implementation Plan

## Executive Summary

This document outlines three implementation approaches for adding new menu items to Philly Wings Express:

**New Items to Add:**
1. **Cauliflower Wings** (with baked/fried preparation options)
2. **Desserts Section** (cookies, brownies, etc.)
3. **Fresh Salad Section** (garden salads, caesar, etc.)
4. **Enhanced Sides**: Coleslaw, Potato Salad, Celery & Carrots (dipping vegetables)

**Key Requirements:**
- All data must come from Firebase (Firestore for data, Storage for images)
- Must work across both frontend (catering.html) and platform menus (DoorDash, UberEats, GrubHub)
- Maintain existing architecture patterns
- Support platform-specific pricing

---

## Current Architecture Analysis

### Firebase Collections Structure
```
firestore/
├── menuItems/              # Base menu items (wings, fries, mozzarella, drinks, teas)
├── cateringPackages/       # Catering packages (tiers 1-3)
├── cateringAddOns/         # Add-ons (vegetarian & desserts) - GATE 3
├── sauces/                 # 14 signature sauces
├── combos/                 # Combo meals
└── settings/               # Global settings
```

### Frontend Data Flow
```
Frontend (catering.html)
  ↓
catering-service.js → getCateringPackages()
  ↓
Firestore → cateringPackages collection
  ↓
package-configurator.js → renders UI with hardcoded sauce data
```

### Platform Menu Data Flow
```
Platform Request (doordash.com)
  ↓
functions/index.js → platformMenu()
  ↓
fetchCompleteMenu() → Firestore parallel fetch
  ↓
processPlatformMenu() → applies pricing markup
  ↓
generateDoorDashHTML() → renders complete HTML
```

### Current menuItems Schema
```javascript
{
  id: "wings",
  name: "Wings",
  category: "wings",
  baseItem: true,
  active: true,
  sortOrder: 1,
  allergens: ["gluten"],
  images: {
    hero: "https://storage.../wings-hero.jpg"
  },
  variants: [
    {
      id: "wings_6_bonein",
      name: "6 Wings (Bone-In)",
      count: 6,
      type: "bone-in",
      basePrice: 8.99,
      platformPricing: {
        doordash: 12.14,
        ubereats: 12.14,
        grubhub: 10.92
      },
      includedSauces: 1
    }
  ]
}
```

---

## Three Implementation Approaches

### **Approach 1: Extended Variants Pattern (Recommended)**
**Strategy:** Extend existing `menuItems` collection with new categories and preparation options

#### Firebase Schema Changes

**1. Add Cauliflower Wings to menuItems**
```javascript
// New document: menuItems/cauliflower_wings
{
  id: "cauliflower_wings",
  name: "Cauliflower Wings",
  category: "wings",
  description: "Plant-based crispy cauliflower wings",
  baseItem: true,
  active: true,
  sortOrder: 2,
  dietaryTags: ["vegan", "vegetarian"],
  allergens: ["gluten"], // breading
  images: {
    hero: "https://firebasestorage.../cauliflower-wings-hero.webp"
  },
  variants: [
    {
      id: "cauliflower_6_fried",
      name: "6 Cauliflower Wings (Fried)",
      count: 6,
      prepMethod: "fried",
      basePrice: 9.99,
      platformPricing: {
        doordash: 13.49,
        ubereats: 13.49,
        grubhub: 12.14
      },
      includedSauces: 1,
      prepTime: 8, // minutes
      equipment: ["fryer"]
    },
    {
      id: "cauliflower_6_baked",
      name: "6 Cauliflower Wings (Baked)",
      count: 6,
      prepMethod: "baked",
      basePrice: 9.99,
      platformPricing: {
        doordash: 13.49,
        ubereats: 13.49,
        grubhub: 12.14
      },
      includedSauces: 1,
      prepTime: 12,
      equipment: ["impinger-oven"]
    },
    {
      id: "cauliflower_12_fried",
      name: "12 Cauliflower Wings (Fried)",
      count: 12,
      prepMethod: "fried",
      basePrice: 16.99,
      platformPricing: {
        doordash: 22.94,
        ubereats: 22.94,
        grubhub: 20.64
      },
      includedSauces: 2,
      prepTime: 10,
      equipment: ["fryer"]
    },
    {
      id: "cauliflower_12_baked",
      name: "12 Cauliflower Wings (Baked)",
      count: 12,
      prepMethod: "baked",
      basePrice: 16.99,
      platformPricing: {
        doordash: 22.94,
        ubereats: 22.94,
        grubhub: 20.64
      },
      includedSauces: 2,
      prepTime: 15,
      equipment: ["impinger-oven"]
    }
    // Add 24, 30, 50 variants with both prep methods
  ]
}
```

**2. Add Desserts Category**
```javascript
// New document: menuItems/desserts
{
  id: "desserts",
  name: "Desserts",
  category: "desserts",
  description: "Sweet treats to complete your meal",
  baseItem: true,
  active: true,
  sortOrder: 7,
  images: {
    hero: "https://firebasestorage.../desserts-hero.webp"
  },
  variants: [
    {
      id: "chocolate_chip_cookies",
      name: "Chocolate Chip Cookies (4 pack)",
      count: 4,
      basePrice: 5.99,
      platformPricing: {
        doordash: 8.09,
        ubereats: 8.09,
        grubhub: 7.28
      },
      description: "Fresh-baked chocolate chip cookies",
      allergens: ["gluten", "dairy", "eggs"],
      images: {
        card: "https://firebasestorage.../cookies.webp"
      }
    },
    {
      id: "brownies",
      name: "Fudge Brownies (4 pack)",
      count: 4,
      basePrice: 6.99,
      platformPricing: {
        doordash: 9.44,
        ubereats: 9.44,
        grubhub: 8.49
      },
      description: "Rich chocolate fudge brownies",
      allergens: ["gluten", "dairy", "eggs"],
      images: {
        card: "https://firebasestorage.../brownies.webp"
      }
    },
    {
      id: "churros",
      name: "Cinnamon Sugar Churros (6 pack)",
      count: 6,
      basePrice: 7.99,
      platformPricing: {
        doordash: 10.79,
        ubereats: 10.79,
        grubhub: 9.71
      },
      description: "Crispy churros with cinnamon sugar",
      allergens: ["gluten"],
      images: {
        card: "https://firebasestorage.../churros.webp"
      }
    }
  ]
}
```

**3. Add Salads Category**
```javascript
// New document: menuItems/salads
{
  id: "salads",
  name: "Fresh Salads",
  category: "salads",
  description: "Fresh, crisp salads for lighter options",
  baseItem: true,
  active: true,
  sortOrder: 4,
  images: {
    hero: "https://firebasestorage.../salads-hero.webp"
  },
  variants: [
    {
      id: "garden_salad",
      name: "Garden Salad",
      size: "individual",
      basePrice: 7.99,
      platformPricing: {
        doordash: 10.79,
        ubereats: 10.79,
        grubhub: 9.71
      },
      description: "Fresh lettuce, tomatoes, cucumbers, carrots, croutons",
      dietaryTags: ["vegetarian"],
      allergens: ["gluten"], // croutons
      dressing: ["ranch", "italian", "caesar", "balsamic"],
      images: {
        card: "https://firebasestorage.../garden-salad.webp"
      }
    },
    {
      id: "caesar_salad",
      name: "Caesar Salad",
      size: "individual",
      basePrice: 8.99,
      platformPricing: {
        doordash: 12.14,
        ubereats: 12.14,
        grubhub: 10.92
      },
      description: "Romaine lettuce, parmesan, croutons, caesar dressing",
      dietaryTags: ["vegetarian"],
      allergens: ["gluten", "dairy", "fish"], // anchovies in dressing
      images: {
        card: "https://firebasestorage.../caesar-salad.webp"
      }
    },
    {
      id: "garden_salad_large",
      name: "Garden Salad (Family Size)",
      size: "family",
      basePrice: 19.99,
      platformPricing: {
        doordash: 26.99,
        ubereats: 26.99,
        grubhub: 24.29
      },
      description: "Serves 6-8 people",
      dietaryTags: ["vegetarian"],
      allergens: ["gluten"],
      images: {
        card: "https://firebasestorage.../garden-salad-large.webp"
      }
    }
  ]
}
```

**4. Add New Sides to Existing Sides Category**
```javascript
// Update existing document: menuItems/sides (new collection)
// OR add to fries document as new variants
{
  id: "sides",
  name: "Sides",
  category: "sides",
  description: "Delicious side items",
  baseItem: true,
  active: true,
  sortOrder: 3,
  variants: [
    {
      id: "coleslaw",
      name: "Coleslaw",
      size: "regular",
      basePrice: 3.99,
      platformPricing: {
        doordash: 5.39,
        ubereats: 5.39,
        grubhub: 4.85
      },
      description: "Creamy coleslaw with fresh cabbage",
      allergens: ["dairy", "eggs"],
      dietaryTags: ["vegetarian"],
      images: {
        card: "https://firebasestorage.../coleslaw.webp"
      }
    },
    {
      id: "potato_salad",
      name: "Potato Salad",
      size: "regular",
      basePrice: 4.49,
      platformPricing: {
        doordash: 6.06,
        ubereats: 6.06,
        grubhub: 5.46
      },
      description: "Classic potato salad with mayo and herbs",
      allergens: ["dairy", "eggs"],
      dietaryTags: ["vegetarian"],
      images: {
        card: "https://firebasestorage.../potato-salad.webp"
      }
    },
    {
      id: "veggie_sticks",
      name: "Celery & Carrot Sticks",
      size: "regular",
      basePrice: 3.49,
      platformPricing: {
        doordash: 4.71,
        ubereats: 4.71,
        grubhub: 4.24
      },
      description: "Fresh celery and carrot sticks for dipping",
      allergens: [],
      dietaryTags: ["vegan", "vegetarian", "gluten-free"],
      includes: ["2 dipping cups (ranch or blue cheese)"],
      images: {
        card: "https://firebasestorage.../veggie-sticks.webp"
      }
    },
    {
      id: "coleslaw_large",
      name: "Coleslaw (Family Size)",
      size: "family",
      basePrice: 12.99,
      platformPricing: {
        doordash: 17.54,
        ubereats: 17.54,
        grubhub: 15.79
      },
      description: "Serves 6-8 people",
      allergens: ["dairy", "eggs"],
      dietaryTags: ["vegetarian"]
    },
    {
      id: "potato_salad_large",
      name: "Potato Salad (Family Size)",
      size: "family",
      basePrice: 14.99,
      platformPricing: {
        doordash: 20.24,
        ubereats: 20.24,
        grubhub: 18.22
      },
      description: "Serves 6-8 people",
      allergens: ["dairy", "eggs"],
      dietaryTags: ["vegetarian"]
    }
  ]
}
```

#### Frontend Changes (Catering)

**1. Update package-configurator.js - Add Cauliflower Option**
```javascript
// In renderWingTypeSelector(), add after boneless option:
{
  id: 'cauliflower',
  label: 'Cauliflower Wings',
  dietaryTags: ['vegan'],
  prepOptions: ['fried', 'baked'], // NEW: prep method selector
  allergens: ['gluten'],
  equipment: ['fryer', 'impinger-oven']
}

// Add prep method selector (shows when cauliflower selected):
<div class="prep-method-selector" id="cauliflower-prep-${packageId}" style="display: none;">
  <p class="sub-label">Preparation Method:</p>
  <label class="sub-option">
    <input type="radio" name="cauliflower-prep-${packageId}" value="fried" checked>
    <span>🔥 Fried (Crispier, 8 min prep)</span>
  </label>
  <label class="sub-option">
    <input type="radio" name="cauliflower-prep-${packageId}" value="baked">
    <span>🌱 Baked (Healthier, 12 min prep)</span>
  </label>
</div>
```

**2. Update cateringAddOns Collection (Already exists from Gate 3)**
```javascript
// Add new documents to cateringAddOns collection:
{
  id: "dessert-cookies",
  category: "dessert",
  name: "Chocolate Chip Cookies",
  description: "Fresh-baked cookies (12 pack)",
  basePrice: 14.99,
  servings: 12,
  featured: true,
  dietaryTags: ["vegetarian"],
  allergens: ["gluten", "dairy", "eggs"],
  availableForTiers: [1, 2, 3],
  images: {
    card: "https://firebasestorage.../cookies-catering.webp"
  },
  active: true
}

// Add salads as add-ons:
{
  id: "fresh-salad-garden",
  category: "salad",
  name: "Garden Salad (Family)",
  description: "Fresh mixed greens (serves 8-10)",
  basePrice: 19.99,
  servings: 10,
  featured: true,
  dietaryTags: ["vegetarian"],
  allergens: ["gluten"],
  availableForTiers: [2, 3],
  images: {
    card: "https://firebasestorage.../garden-salad-catering.webp"
  },
  active: true
}
```

**3. Update add-ons-selector.js - Add Salads Section**
```javascript
// Create new function in add-ons-selector.js:
export function renderSaladsAddOns(saladItems, tier, packageId) {
  if (!saladItems || saladItems.length === 0) return '';

  return `
    <div class="add-ons-category salads-category">
      <h5 class="category-title">🥗 Fresh Salads</h5>
      <p class="category-description">Healthy sides for dietary variety</p>
      <div class="add-ons-grid">
        ${saladItems.map(salad => renderAddOnCard(salad, packageId)).join('')}
      </div>
    </div>
  `;
}
```

#### Platform Menu Changes

**1. Update functions/index.js - Fetch New Collections**
```javascript
async function fetchCompleteMenu() {
  const [menuItemsSnapshot, combosSnapshot, saucesSnapshot, settingsDoc, cateringAddOnsSnapshot] = await Promise.all([
    db.collection('menuItems').get(),
    db.collection('combos').get(),
    db.collection('sauces').get(),
    db.collection('settings').doc('main').get(),
    db.collection('cateringAddOns').where('active', '==', true).get() // NEW
  ]);

  // Parse menuItems including new categories
  const menuItems = {};
  menuItemsSnapshot.docs.forEach(doc => {
    const data = doc.data();
    if (data.id) {
      menuItems[data.id] = data;
    }
  });

  return {
    wings: menuItems.wings || { variants: [] },
    cauliflower_wings: menuItems.cauliflower_wings || { variants: [] }, // NEW
    fries: menuItems.fries || { variants: [] },
    sides: menuItems.sides || { variants: [] }, // NEW
    mozzarella: menuItems.mozzarella_sticks || { variants: [] },
    salads: menuItems.salads || { variants: [] }, // NEW
    desserts: menuItems.desserts || { variants: [] }, // NEW
    drinks: menuItems.drinks || { variants: [] },
    // ... existing items
  };
}
```

**2. Create New Platform Module: sides-veggie-sticks.js**
```javascript
// functions/lib/platforms/doordash/modules/sides-veggie-sticks.js
function generateSidesVeggieSticks(menuData = {}) {
  const veggieVariants = (menuData.sides?.variants || [])
    .filter(v => v.id === 'veggie_sticks');

  return `
    (function(){
      window.openVeggieModal = function() {
        window.openSidesModal({
          sideKey: 'veggie_sticks',
          modalTitle: 'Celery & Carrot Sticks',
          variants: ${JSON.stringify(veggieVariants)},
          includedDips: 2
        });
      };
    })();
  `;
}

module.exports = { generateSidesVeggieSticks };
```

**3. Update HTML Generation - Add New Sections**
```javascript
// In html.js, add new sections:
${generateSaladsSection(menuData.salads)}
${generateDessertsSection(menuData.desserts)}
${generateEnhancedSidesSection(menuData.sides)} // coleslaw, potato salad, veggies
```

#### Pros & Cons

**✅ Pros:**
- Follows existing architecture patterns exactly
- Minimal code changes required
- Natural Firebase structure extension
- Easy to understand and maintain
- Platform pricing already structured correctly
- Leverages existing modal systems

**❌ Cons:**
- menuItems collection grows larger (6 documents → 10 documents)
- Need to update multiple platform generation files
- Requires coordination between catering and platform menus

**Effort Estimate:** 16-20 hours
- Firebase schema: 2 hours
- Frontend catering updates: 6 hours
- Platform menu updates: 8 hours
- Testing across all platforms: 4 hours

---

### **Approach 2: Category-Based Collections**
**Strategy:** Create separate Firestore collections for each major category

#### Firebase Schema Changes

**New Collections:**
```
firestore/
├── menuItems/              # Keep only core items (wings, fries, drinks)
├── wingsVariants/          # All wing types including cauliflower
│   ├── traditional/        # Subcollection: bone-in, boneless
│   └── plantBased/         # Subcollection: cauliflower
├── sidesItems/             # All sides consolidated
├── saladsItems/            # All salads
├── dessertsItems/          # All desserts
├── cateringPackages/       # Unchanged
└── cateringAddOns/         # Unchanged
```

**Example: wingsVariants/plantBased/cauliflower**
```javascript
{
  id: "cauliflower",
  name: "Cauliflower Wings",
  type: "plant-based",
  dietaryTags: ["vegan", "vegetarian"],
  allergens: ["gluten"],
  active: true,
  images: {
    hero: "https://firebasestorage.../cauliflower-hero.webp"
  },
  prepMethods: {
    fried: {
      available: true,
      prepTime: 8,
      equipment: ["fryer"],
      priceModifier: 0 // same price
    },
    baked: {
      available: true,
      prepTime: 12,
      equipment: ["impinger-oven"],
      priceModifier: 0
    }
  },
  sizes: [
    {
      count: 6,
      basePrice: 9.99,
      platformPricing: {
        doordash: 13.49,
        ubereats: 13.49,
        grubhub: 12.14
      },
      includedSauces: 1
    },
    {
      count: 12,
      basePrice: 16.99,
      platformPricing: {
        doordash: 22.94,
        ubereats: 22.94,
        grubhub: 20.64
      },
      includedSauces: 2
    }
    // ... more sizes
  ]
}
```

**Example: sidesItems/coleslaw**
```javascript
{
  id: "coleslaw",
  name: "Coleslaw",
  category: "cold-sides",
  dietaryTags: ["vegetarian"],
  allergens: ["dairy", "eggs"],
  active: true,
  images: {
    card: "https://firebasestorage.../coleslaw.webp"
  },
  sizes: [
    {
      size: "regular",
      servings: 1,
      basePrice: 3.99,
      platformPricing: {
        doordash: 5.39,
        ubereats: 5.39,
        grubhub: 4.85
      }
    },
    {
      size: "family",
      servings: 8,
      basePrice: 12.99,
      platformPricing: {
        doordash: 17.54,
        ubereats: 17.54,
        grubhub: 15.79
      }
    }
  ]
}
```

#### Code Changes

**1. Create New Service: wings-variants-service.js**
```javascript
export async function getAllWingTypes() {
  const traditionalRef = collection(db, 'wingsVariants', 'traditional');
  const plantBasedRef = collection(db, 'wingsVariants', 'plantBased');

  const [traditional, plantBased] = await Promise.all([
    getDocs(traditionalRef),
    getDocs(plantBasedRef)
  ]);

  return {
    traditional: traditional.docs.map(doc => ({id: doc.id, ...doc.data()})),
    plantBased: plantBased.docs.map(doc => ({id: doc.id, ...doc.data()}))
  };
}
```

**2. Update functions/index.js**
```javascript
async function fetchCompleteMenu() {
  const [
    menuItemsSnapshot,
    wingsVariantsTraditional,
    wingsVariantsPlantBased,
    sidesItemsSnapshot,
    saladsItemsSnapshot,
    dessertsItemsSnapshot,
    combosSnapshot,
    saucesSnapshot,
    settingsDoc
  ] = await Promise.all([
    db.collection('menuItems').get(),
    db.collection('wingsVariants').doc('traditional').collection('types').get(),
    db.collection('wingsVariants').doc('plantBased').collection('types').get(),
    db.collection('sidesItems').get(),
    db.collection('saladsItems').get(),
    db.collection('dessertsItems').get(),
    db.collection('combos').get(),
    db.collection('sauces').get(),
    db.collection('settings').doc('main').get()
  ]);

  // Merge and normalize data
  return {
    wings: mergeWingVariants(wingsVariantsTraditional, wingsVariantsPlantBased),
    sides: normalizeSides(sidesItemsSnapshot),
    salads: normalizeSalads(saladsItemsSnapshot),
    desserts: normalizeDesserts(dessertsItemsSnapshot),
    // ... rest
  };
}
```

#### Pros & Cons

**✅ Pros:**
- Better data organization by category
- Easier to scale per-category
- Cleaner separation of concerns
- Can set different permissions per collection
- Easier to query specific categories
- Subcollections allow for better hierarchy

**❌ Cons:**
- **Breaking change** - requires data migration
- More complex fetch logic (9 parallel queries vs 4)
- Higher Firestore read costs (more documents)
- Requires refactor of ALL existing code
- More service files to maintain
- **High risk** of breaking existing platform menus

**Effort Estimate:** 40-50 hours
- Data migration scripts: 8 hours
- New service layer: 10 hours
- Frontend refactor: 12 hours
- Platform menu refactor: 12 hours
- Testing and rollback planning: 8 hours

---

### **Approach 3: Hybrid - Extend + New Collections**
**Strategy:** Keep core items in menuItems, add new collections only for new categories

#### Firebase Schema Changes

**Keep Existing:**
```
menuItems/          # wings, fries, mozzarella, drinks - UNCHANGED
combos/             # UNCHANGED
sauces/             # UNCHANGED
cateringPackages/   # UNCHANGED
cateringAddOns/     # UNCHANGED
```

**Add New Collections:**
```
plantBasedWings/    # NEW - just cauliflower variants
freshSalads/        # NEW - all salad items
desserts/           # NEW - all dessert items
coldSides/          # NEW - coleslaw, potato salad, veggies
```

**Example: plantBasedWings/cauliflower**
```javascript
{
  id: "cauliflower",
  name: "Cauliflower Wings",
  category: "plant-based-wings",
  description: "Crispy plant-based wings",
  baseItem: true,
  active: true,
  dietaryTags: ["vegan", "vegetarian"],
  allergens: ["gluten"],
  sortOrder: 1,
  images: {
    hero: "https://firebasestorage.../cauliflower-wings.webp"
  },
  prepMethods: ["fried", "baked"],
  defaultPrepMethod: "fried",
  variants: [
    {
      id: "cauliflower_6_fried",
      name: "6 Cauliflower Wings (Fried)",
      count: 6,
      prepMethod: "fried",
      basePrice: 9.99,
      platformPricing: {
        doordash: 13.49,
        ubereats: 13.49,
        grubhub: 12.14
      },
      includedSauces: 1,
      prepTime: 8
    },
    {
      id: "cauliflower_6_baked",
      name: "6 Cauliflower Wings (Baked)",
      count: 6,
      prepMethod: "baked",
      basePrice: 9.99,
      platformPricing: {
        doordash: 13.49,
        ubereats: 13.49,
        grubhub: 12.14
      },
      includedSauces: 1,
      prepTime: 12
    }
    // ... more variants
  ]
}
```

**Example: coldSides/coleslaw**
```javascript
{
  id: "coleslaw",
  name: "Coleslaw",
  category: "cold-sides",
  description: "Creamy coleslaw with fresh cabbage",
  baseItem: true,
  active: true,
  sortOrder: 1,
  dietaryTags: ["vegetarian"],
  allergens: ["dairy", "eggs"],
  images: {
    card: "https://firebasestorage.../coleslaw.webp"
  },
  variants: [
    {
      id: "coleslaw_regular",
      name: "Coleslaw",
      size: "regular",
      basePrice: 3.99,
      platformPricing: {
        doordash: 5.39,
        ubereats: 5.39,
        grubhub: 4.85
      }
    },
    {
      id: "coleslaw_family",
      name: "Coleslaw (Family Size)",
      size: "family",
      servings: 8,
      basePrice: 12.99,
      platformPricing: {
        doordash: 17.54,
        ubereats: 17.54,
        grubhub: 15.79
      }
    }
  ]
}
```

#### Code Changes

**1. Extend fetchCompleteMenu() - Backward Compatible**
```javascript
async function fetchCompleteMenu() {
  // Existing queries (UNCHANGED)
  const [menuItemsSnapshot, combosSnapshot, saucesSnapshot, settingsDoc] = await Promise.all([
    db.collection('menuItems').get(),
    db.collection('combos').get(),
    db.collection('sauces').get(),
    db.collection('settings').doc('main').get()
  ]);

  // NEW queries for new categories
  const [plantBasedWingsSnapshot, freshSaladsSnapshot, dessertsSnapshot, coldSidesSnapshot] = await Promise.all([
    db.collection('plantBasedWings').where('active', '==', true).get(),
    db.collection('freshSalads').where('active', '==', true).get(),
    db.collection('desserts').where('active', '==', true).get(),
    db.collection('coldSides').where('active', '==', true).get()
  ]).catch(err => {
    console.warn('New collections not found, using defaults:', err);
    return [{ docs: [] }, { docs: [] }, { docs: [] }, { docs: [] }];
  });

  // Parse existing (UNCHANGED logic)
  const menuItems = {};
  menuItemsSnapshot.docs.forEach(doc => {
    const data = doc.data();
    if (data.id) menuItems[data.id] = data;
  });

  // Add new categories
  return {
    // Existing items (UNCHANGED)
    wings: menuItems.wings || { variants: [] },
    fries: menuItems.fries || { variants: [] },
    mozzarella: menuItems.mozzarella_sticks || { variants: [] },
    drinks: menuItems.drinks || { variants: [] },

    // NEW items from new collections
    cauliflowerWings: plantBasedWingsSnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))[0] || { variants: [] },
    salads: freshSaladsSnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() })),
    desserts: dessertsSnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() })),
    coldSides: coldSidesSnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() })),

    combos: combosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
    // ... rest unchanged
  };
}
```

**2. Create Minimal New Services**
```javascript
// src/services/plant-based-wings-service.js
export async function getCauliflowerWings() {
  const snapshot = await getDocs(
    query(collection(db, 'plantBasedWings'), where('active', '==', true))
  );
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// src/services/salads-service.js
export async function getFreshSalads() {
  const snapshot = await getDocs(
    query(collection(db, 'freshSalads'), where('active', '==', true), orderBy('sortOrder'))
  );
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
```

**3. Frontend Changes - Modular Additions**
```javascript
// package-configurator.js - Add to existing wing options
import { getCauliflowerWings } from '../../services/plant-based-wings-service.js';

async function loadCauliflowerOption() {
  const cauliflowerData = await getCauliflowerWings();
  if (cauliflowerData.length > 0) {
    // Add to wing type selector
    return {
      id: 'cauliflower',
      label: 'Cauliflower Wings',
      prepMethods: cauliflowerData[0].prepMethods,
      variants: cauliflowerData[0].variants
    };
  }
  return null;
}
```

#### Pros & Cons

**✅ Pros:**
- **Zero breaking changes** to existing code
- New features isolated in new collections
- Backward compatible (fails gracefully if collections missing)
- Easier rollback (just disable new collections)
- Can deploy incrementally (one category at a time)
- Lower risk than Approach 2
- Easy A/B testing of new items

**❌ Cons:**
- Slight inconsistency in data architecture
- More collections to manage (4 new collections)
- Need to remember where each category lives
- Slightly more complex fetch logic (8 queries vs 4)

**Effort Estimate:** 20-24 hours
- New Firebase collections: 3 hours
- New service files: 4 hours
- Frontend integration: 6 hours
- Platform menu integration: 7 hours
- Testing: 4 hours

---

## Recommendation Matrix

| Criteria | Approach 1 | Approach 2 | Approach 3 |
|----------|-----------|-----------|-----------|
| **Risk Level** | Low | **High** | Very Low |
| **Breaking Changes** | None | **Many** | None |
| **Code Complexity** | Medium | High | Medium-Low |
| **Effort (hours)** | 16-20 | **40-50** | 20-24 |
| **Scalability** | Good | Excellent | Good |
| **Maintainability** | Good | Excellent | Very Good |
| **Rollback Ease** | Easy | **Difficult** | Very Easy |
| **Data Consistency** | Excellent | Excellent | Good |
| **Firestore Costs** | Low | **Medium** | Medium-Low |
| **Deploy Strategy** | All-at-once | Phased | Incremental ✅ |

---

## Final Recommendation: **Approach 3 (Hybrid)**

### Why Approach 3 Wins:

1. **Zero Risk** - No breaking changes to existing code
2. **Incremental Deployment** - Can ship one category at a time:
   - Week 1: Cauliflower wings
   - Week 2: Cold sides
   - Week 3: Salads
   - Week 4: Desserts
3. **Easy Rollback** - Just set `active: false` on new collections
4. **Backward Compatible** - Works even if new collections don't exist yet
5. **Clean Separation** - New features don't touch existing battle-tested code
6. **Reasonable Effort** - 20-24 hours vs 40-50 for Approach 2

### Implementation Order:

**Phase 1: Cauliflower Wings (Week 1)**
1. Create `plantBasedWings` collection with cauliflower document
2. Upload cauliflower wing images to Firebase Storage
3. Add cauliflower option to catering configurator
4. Update platform menus to include cauliflower
5. Test across all 3 platforms

**Phase 2: Cold Sides (Week 2)**
1. Create `coldSides` collection (coleslaw, potato salad, veggie sticks)
2. Upload side images
3. Add to platform menus in Sides section
4. Add to catering packages as standard sides

**Phase 3: Salads (Week 3)**
1. Create `freshSalads` collection
2. Upload salad images
3. Create new Salads section in platform menus
4. Add as catering add-ons

**Phase 4: Desserts (Week 4)**
1. Create `desserts` collection
2. Upload dessert images
3. Create Desserts section in platform menus
4. Add to catering add-ons

---

## Firebase Storage Requirements

### Image Assets Needed

**Cauliflower Wings:**
- `images/cauliflower-wings-hero.webp` (1920x1080)
- `images/cauliflower-wings-fried.webp` (800x600)
- `images/cauliflower-wings-baked.webp` (800x600)
- `images/resized/cauliflower-wings_200x200.webp`

**Cold Sides:**
- `images/coleslaw.webp` (800x600)
- `images/potato-salad.webp` (800x600)
- `images/veggie-sticks.webp` (800x600)
- `images/resized/coleslaw_200x200.webp`
- `images/resized/potato-salad_200x200.webp`
- `images/resized/veggie-sticks_200x200.webp`

**Salads:**
- `images/salads-hero.webp` (1920x1080)
- `images/garden-salad.webp` (800x600)
- `images/caesar-salad.webp` (800x600)
- `images/garden-salad-large.webp` (800x600)
- `images/resized/garden-salad_200x200.webp`
- `images/resized/caesar-salad_200x200.webp`

**Desserts:**
- `images/desserts-hero.webp` (1920x1080)
- `images/chocolate-chip-cookies.webp` (800x600)
- `images/fudge-brownies.webp` (800x600)
- `images/churros.webp` (800x600)
- `images/resized/cookies_200x200.webp`
- `images/resized/brownies_200x200.webp`
- `images/resized/churros_200x200.webp`

---

## Next Steps

1. **User Approval** - Review this plan and approve Approach 3
2. **Create Firestore Documents** - Use Firebase Console or scripts to add documents
3. **Upload Images** - Add all image assets to Firebase Storage
4. **Phase 1 Implementation** - Start with cauliflower wings
5. **Test on Emulator** - Verify platform menus work correctly
6. **Deploy Phase 1** - Ship cauliflower wings to production
7. **Repeat for Phases 2-4**

---

## Questions for User

1. Do you approve Approach 3 (Hybrid) as the implementation strategy?
2. Do you want to proceed with all phases or just Phase 1 (Cauliflower) first?
3. Do you have existing images for these items, or should we use placeholder images?
4. Should desserts be in `desserts` collection or added to `cateringAddOns`?
5. For veggie sticks, should dips be included in price or charged separately?
