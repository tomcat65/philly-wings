# Philly Wings Express - Complete System Architecture

## System Overview
Last Updated: 2025-09-21
**Major Update**: Resolved margin calculation issue and data structure conflicts

### Three Distinct Components:
1. **Frontend (Marketing Site)** - Drive traffic to delivery platforms
2. **Admin Panel** - Internal menu & price management
3. **Platform Menu Pages** - Immutable menu data for delivery partners

---

## 1. Frontend (Marketing Site)
**URL**: `www.phillywingsexpress.com`
**Purpose**: Single goal - drive traffic to delivery platforms

### Features:
- Beautiful food photography
- "Order Now" buttons → DoorDash/UberEats/Grubhub
- NO ordering functionality
- NO real-time pricing (just "From $X.XX")
- SEO optimized to attract local customers
- Game day specials/promotions
- Customer reviews
- Story/brand building

**Key Point**: This is a MARKETING site, not an e-commerce site

---

## 2. Admin Panel
**URL**: `www.phillywingsexpress.com/admin/`
**Purpose**: Internal menu & price management
**Access**: Password protected (admin@phillywingsexpress.com / admin2025)

### Features:
- Menu item management (add/edit/delete)
- Platform-specific pricing:
  - DoorDash: +35% markup (30% commission)
  - UberEats: +35% markup (30% commission)
  - Grubhub: +25% markup (20% commission)
- Modifier groups management
- Generate immutable menu links for platforms
- Track published menu versions
- Analytics/reporting

---

## 3. Platform Menu Pages
**URL Pattern**: `www.phillywingsexpress.com/menu/[platform]/[unique-id]`
**Example**: `www.phillywingsexpress.com/menu/doordash/2024-01-15-abc123`
**Purpose**: Provide menu data to delivery platforms

### Features:
- PUBLIC (no login required)
- IMMUTABLE (snapshot frozen at publish time)
- PLATFORM-SPECIFIC (shows only relevant platform's prices)
- STRUCTURED DATA (easy for platforms to parse)
- NO ORDERING (just data display)

---

## Database Architecture

### Live Collections (Admin Edits These):
```javascript
menuItems/           // Current menu items
  wings_6: {
    name: "6 Wings",
    basePrice: 8.99,
    platformPricing: {
      doordash: 12.99,
      ubereats: 12.99,
      grubhub: 11.99
    },
    modifierGroups: ["sauce_choice", "wing_type", "add_dips"]
  }

modifierGroups/      // Customization options
  sauce_choice: {
    name: "Choose Your Sauce",
    required: true,
    min: 1,
    max: 1,
    options: [
      { name: "Buffalo", price: 0 },
      { name: "BBQ", price: 0 },
      { name: "Lemon Pepper", price: 0 }
    ]
  }

combos/              // Bundle deals
  party_pack_50: {
    name: "Party Pack 50",
    components: [
      { type: "wings", itemId: "wings_50", maxSauces: 4 },
      { type: "sides", itemId: "fries_large", quantity: 3 },
      { type: "sides", itemId: "mozzarella_16" }
    ],
    basePrice: 89.99,
    platformPricing: {
      doordash: 119.99,
      ubereats: 119.99,
      grubhub: 109.99
    }
  }
```

### Frozen Collections (Never Change):
```javascript
publishedMenus/      // Immutable snapshots
  doordash_2024_01_15_abc123: {
    platform: "doordash",
    url: "menu/doordash/2024-01-15-abc123",
    publishedAt: "2024-01-15T10:30:00Z",
    status: "active",
    frozenData: {
      // Complete menu snapshot at publish time
      categories: [...],
      items: [...],
      modifiers: [...]
    },
    metadata: {
      publishedBy: "admin@phillywingsexpress.com",
      sentToPlatform: true,
      platformConfirmed: true
    }
  }
```

---

## Workflow

### 1. Menu Management Flow:
```
Admin logs in →
Edits menu items/prices →
Changes are DRAFT status →
Preview changes →
Ready to publish
```

### 2. Platform Publishing Flow:
```
Admin clicks "Publish to DoorDash" →
System creates immutable snapshot →
Generates unique URL →
Admin copies URL →
Sends to DoorDash rep →
DoorDash imports menu →
Menu goes live on platform
```

### 3. Customer Flow:
```
Google "wings near me" →
Finds phillywingsexpress.com →
Sees beautiful wings photos →
Clicks "Order on DoorDash" →
Redirected to DoorDash app/site →
Orders through platform →
Restaurant receives order
```

---

## Critical Business Rules

1. **Frontend NEVER shows real-time prices** - Only "starting at" prices
2. **Frontend NEVER takes orders** - Only redirects to platforms
3. **Admin changes DON'T affect published menus** - Immutable snapshots
4. **Each platform has different prices** - Based on commission rates
5. **Menu links are permanent** - Once published, never change
6. **New prices require new menu link** - Send updated URL to platform
7. **Platform menus are PUBLIC** - No authentication required
8. **Modifiers can have price impacts** - All drums +$2, extra sauce +$0.75

---

## Security Model

```javascript
// Firestore Rules
match /menuItems/{item} {
  allow read: if request.auth.uid == 'admin';
  allow write: if request.auth.uid == 'admin';
}

match /publishedMenus/{menu} {
  allow read: if true;        // Public can read
  allow create: if isAdmin();  // Admin only
  allow update: if false;      // Never allow updates
  allow delete: if false;      // Never allow deletes
}

match /publicMenus/{menu} {
  allow read: if true;        // Public menu links
  allow write: if false;       // Created by admin only
}
```

---

## Platform Menu Requirements

### What DoorDash Needs:
- Item names
- Prices (with each item)
- Modifiers to customize items (optional)
- Categories for organization
- Descriptions
- Allergen information
- Business hours
- Delivery zones

### What We Provide at `menu/doordash/[id]`:
```html
<!DOCTYPE html>
<html>
<head>
  <title>Philly Wings Express - DoorDash Menu</title>
  <script type="application/ld+json">
  {
    "@context": "http://schema.org",
    "@type": "Menu",
    "name": "Philly Wings Express Menu",
    "hasMenuSection": [...]
  }
  </script>
</head>
<body>
  <!-- Clean, parseable HTML menu structure -->
  <!-- No JavaScript required for functionality -->
  <!-- Mobile responsive -->
  <!-- Print friendly -->
</body>
</html>
```

---

## System Benefits

1. **Clean Separation**: Marketing site vs. menu management vs. platform data
2. **Price Integrity**: Published menus can't be accidentally changed
3. **Platform Compliance**: Each platform gets exactly what they need
4. **Version Control**: Complete history of all published menus
5. **Simple Operations**: Admin focuses on menu, not tech
6. **Scalable**: Can add more platforms easily
7. **Audit Trail**: Know exactly what was sent to platforms and when
8. **No Conflicts**: Each platform has its own immutable menu

---

## Implementation Checklist

### Phase 1: Database Restructure
- [ ] Create new menuItems structure with sizes as variants
- [ ] Migrate existing items to new structure
- [ ] Set up modifierGroups collection
- [ ] Create publishedMenus collection

### Phase 2: Admin Panel Updates
- [ ] Build new menu item editor (sizes as variants)
- [ ] Add modifier group management
- [ ] Create "Publish Menu" workflow
- [ ] Add published menu history view

### Phase 3: Platform Menu Pages
- [ ] Create menu page template
- [ ] Implement snapshot system
- [ ] Add structured data (JSON-LD)
- [ ] Test with platform requirements

### Phase 4: Testing & Deployment
- [ ] Test menu generation
- [ ] Verify immutability
- [ ] Test platform import
- [ ] Deploy to production

---

## Key Insights

**We are NOT building an ordering system**
We are building a menu data management and publishing system that feeds the platforms where actual ordering happens.

**The frontend is for marketing only**
Its job is to make people hungry and click through to delivery platforms.

**Platform menus are contracts**
Once published and shared with a platform, they cannot be changed. New prices = new menu link.

**Simplicity is key**
Admin manages menu → Publishes to platforms → Customers order on platforms → Restaurant fulfills orders

---

## Platform-Specific Notes

### DoorDash
- Prefers menu links over manual entry
- Can handle complex modifiers
- Updates menu within 24-48 hours
- Supports scheduled menu changes

### UberEats
- Similar to DoorDash requirements
- May require additional photos
- Faster menu updates (same day possible)

### Grubhub
- Lower commission but slower updates
- Less sophisticated modifier system
- May require manual entry for complex items

---

## Critical System Issues & Resolutions

### Issue: Margin Calculation Breaking (Sept 21, 2025)

**Problem**: Average margin calculation showed 45.2% then dropped to 0.0%

**Root Cause**: New menu items added with incompatible data structures
- Original working schema: Single `Wings` document with variants array
- New problematic items: Separate documents with conflicting pricing structures
- Admin interface couldn't process mixed data formats

**Items Causing Issues**:
```javascript
// Problematic structure (separate documents)
menuItems/BdbjqIs4xtZO4ddwPRLv: {
  id: "wings-6",
  platformPricing: { doordash: 13.76 },  // Direct number
  variants: [{ price: 9.49 }]              // Conflicting pricing
}

// Working structure (variants in single doc)
menuItems/RLhhyuaE4rxKj47Puu3W: {
  id: "wings",
  variants: [{
    id: "wings_6",
    platformPricing: { doordash: 8.99 }   // Clean structure
  }]
}
```

**Solution Applied**:
1. **Enhanced `calculateAverageMargin()` function** to handle multiple data structures
2. **Backed up problematic items** to `richard-menu-items-backup.json`
3. **Removed conflicting documents** from live database
4. **Restored original working schema**: 6, 12, 24, 30, 50 wings only

**Code Fix Location**: `admin/platform-menu.js:948-1006`

**Result**: ✅ Average margin calculation restored to 45.2% (stable)

### Data Structure Standards

**✅ Approved Structure** (Use This):
```javascript
// Single document with variants
Wings: {
  variants: [
    {
      id: "wings_6",
      name: "6 Wings",
      basePrice: 5.99,
      platformPricing: {
        doordash: 8.99,
        ubereats: 8.99,
        grubhub: 7.99
      }
    }
  ]
}
```

**❌ Problematic Structure** (Avoid):
```javascript
// Separate documents with mixed pricing
wings-6: {
  basePrice: 9.49,
  platformPricing: { doordash: 13.76 },  // Direct number
  variants: [{ price: 9.49 }]            // Conflicting data
}
```

### Prevention Guidelines

1. **Always use variants** within single category documents
2. **Maintain consistent pricing structure** across all items
3. **Test margin calculation** after adding new items
4. **Back up experimental items** before going live
5. **Stick to approved wing counts**: 6, 12, 24, 30, 50 only

### Troubleshooting Margin Issues

**Symptoms**: Average margin shows 0.0% or unexpected values

**Debug Steps**:
1. Check console logs for data structure warnings
2. Verify all items have proper `platformPricing` format
3. Look for items with `variants` arrays vs direct pricing
4. Test with single platform first
5. Use browser dev tools to inspect `menuData` object

**Emergency Fix**: Remove problematic items, restore from backup