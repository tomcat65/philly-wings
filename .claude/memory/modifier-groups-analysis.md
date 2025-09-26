# Modifier Groups Analysis - Complete Schema Documentation

*Date: September 23, 2025*

## 🎯 Modifier Groups Collection Structure

### Core Schema Properties
- **id**: Unique identifier (e.g., `sauce_choice`, `wing_style`, `fountain-flavors`)
- **name**: Display name (e.g., "Choose Your Sauce", "Wing Style")
- **description**: User-facing description
- **type**: `single_select`, `multi_select`, `single`, `multiple`
- **required**: Boolean - whether user must make selection
- **min/max**: Minimum and maximum selections allowed
- **sortOrder**: Display order in UI
- **options**: Array of selectable options
- **active**: Boolean - whether modifier group is available

### Menu Item Interconnections

**Wings (`menuItems/RLhhyuaE4rxKj47Puu3W`)**:
```javascript
modifierGroups: [
  "sauce_choice",    // Single sauce selection
  "wing_style",      // Regular/All Drums/All Flats/Boneless
  "extra_sauces"     // Additional sauce cups
]
```

**Drinks** - Uses `fountain-flavors` modifier for fountain drinks
**Mozzarella Sticks** - No modifiers (standalone item)
**Fries** - No modifiers (variants handle different types)

### Modifier Group Types in System

#### 1. **Sauce Selection Groups**
- `sauce_choice`: Single sauce (standard wings)
- `sauce_choice_combo`: Up to 2 sauces (combo items)
- `sauce_choice_party`: Up to 4 sauces (party packs)

#### 2. **Wing Style/Cut Groups**
- `wing_style`: Regular/All Drums/All Flats/Boneless
- `wing_cut`: Mix/All Drums/All Flats (classic only)
- `wing_type`: Classic vs Boneless

#### 3. **Additional Items Groups**
- `extra_sauces`: Extra sauce cups ($1 each)
- `extra_dips`: Ranch, Blue Cheese, Honey Mustard, Cheese ($1.25 each)
- `fountain-flavors`: Coke, Sprite, Dr Pepper, etc.

### Option Structure
```javascript
options: [
  {
    id: "mild-buffalo",
    name: "Mild Buffalo",
    price: 0,              // Additional cost
    default: false,        // Default selection
    sortOrder: 1,          // Display order
    description: "Classic buffalo flavor" // Optional
  }
]
```

### Legacy vs New Schema Patterns

**Legacy Pattern** (document IDs: `sauce_choice`, `wing_cut`):
- Uses `perUnit`, `includedPerUnit`, `pricePerExtra`
- More complex unit-based pricing

**New Pattern** (with generated IDs):
- Cleaner structure with `min`/`max`
- Direct price-per-option model
- Better suited for platform menu generation

### Platform Integration Logic

**Pricing**: Base item price + modifier prices = total
**Variants**: Wings use variants (6, 12, 24, etc.) with different included sauce counts
**Rules**: Required modifiers must be selected; optional ones add cost

### Sauce Option Mapping
All sauce options reference the same 10 core sauces:
1. Mild Buffalo
2. Philly Classic Hot
3. BROAD & PATTISON BURN
4. Gritty's Revenge
5. Tailgate BBQ
6. Sweet Teriyaki
7. Classic Lemon Pepper
8. Northeast Hot Lemon
9. Frankford Cajun
10. Garlic Parmesan

## 🔗 Key Relationships

1. **menuItems.modifierGroups** → **modifierGroups collection**
2. **Wing variants** determine included sauce count
3. **Combo items** use specialized sauce selectors (2-4 sauces)
4. **Platform pricing** applies to base + modifiers

## 🚀 Implementation Notes

- Modifier groups are correctly implemented in Firestore
- Platform menu function should map `menuItems.modifierGroups` to full modifier data
- Each modifier group has proper pricing and selection rules
- System supports both required and optional modifications
- Legacy documents exist but new schema is preferred for future items

## ✅ Status: Complete Schema Analysis
All modifier group interconnections mapped and documented for platform menu generation.