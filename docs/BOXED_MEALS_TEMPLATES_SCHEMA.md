# Boxed Meals Templates Schema

## Overview
Pre-configured box templates to accelerate ordering and reduce decision fatigue. Templates showcase proven combinations with social proof and appetite appeal.

## Collection: `boxedMealTemplates`

### Document Structure

```javascript
{
  id: "office-favorite",              // Document ID (kebab-case)
  name: "Office Favorite",            // Display name
  tagline: "Mild & Crowd-Pleasing",   // Short descriptor
  description: "Perfect for mixed teams who want classic flavors everyone loves. Boneless wings with Sweet BBQ sauce, creamy dips, and NY Cheesecake to finish.",

  heroImage: "templates/office-favorite.jpg",  // Firebase Storage path

  // Default SKU configuration
  defaultConfig: {
    wingType: "boneless",             // boneless | bone-in | plant-based
    sauce: "sweet-bbq",               // sauce document ID
    dips: ["ranch", "honey-mustard"], // Array of dip IDs (always 2)
    side: "chips",                    // Side option
    dessert: "ny-cheesecake"          // Dessert document ID
  },

  // Visual preview assets
  previewImages: {
    wings: "products/boneless-wings.jpg",
    sauce: "sauces/sweet-bbq-bottle.jpg",
    side: "sides/chips.jpg",
    dessert: "desserts/ny-cheesecake.jpg"
  },

  // Metadata
  tags: ["mild", "corporate", "popular"],
  heatLevel: 1,                       // 0-5 scale

  // Social proof
  stats: {
    ordersThisMonth: 47,
    avgRating: 4.8,
    topCustomerType: "corporate"      // corporate | sports | events
  },

  // Display control
  sortOrder: 1,
  active: true,
  featured: true
}
```

## Initial Templates (3 Curated Options)

### 1. Office Favorite
- **Target:** Corporate planners, safe choice
- **Heat:** Mild (level 1)
- **Wings:** Boneless
- **Sauce:** Sweet BBQ
- **Dips:** Ranch + Honey Mustard
- **Side:** Miss Vickie's Chips
- **Dessert:** NY Cheesecake

### 2. Game Day Combo
- **Target:** Sports events, casual gatherings
- **Heat:** Medium (level 2)
- **Wings:** Bone-In
- **Sauce:** Classic Buffalo
- **Dips:** Ranch + Blue Cheese
- **Side:** Coleslaw
- **Dessert:** Gourmet Brownie

### 3. Fire & Ice
- **Target:** Adventurous groups, heat lovers
- **Heat:** Hot (level 4)
- **Wings:** Boneless (50% Hot Honey, 50% Mango Habanero - requires custom config)
- **Dips:** Ranch + Blue Cheese
- **Side:** Potato Salad
- **Dessert:** Crème Brûlée Cheesecake

### 4. Build from Scratch
- **Special template ID:** `custom`
- **No defaults:** Starts with empty config
- **Hero image:** Generic wings assortment

## Firestore Indexes Required

```
Collection: boxedMealTemplates
Fields: active (Ascending), sortOrder (Ascending)
```

## Security Rules

```javascript
match /boxedMealTemplates/{templateId} {
  // Public read access
  allow read: if true;

  // Admin write only
  allow write: if request.auth != null &&
    request.auth.token.admin == true;
}
```

## Usage Flow

1. User lands on boxed meals page
2. Template selection screen displays 3-4 curated options + "Build from Scratch"
3. User selects template → defaultConfig pre-fills configuration form
4. User can customize from template baseline
5. Live preview updates with selections

## Future Enhancements

- **Seasonal templates:** "Holiday Party Box", "Summer BBQ"
- **A/B testing:** Track which templates convert best
- **Dynamic social proof:** Real-time order counts
- **User-created templates:** Save custom configs for reordering
