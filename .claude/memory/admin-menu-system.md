# Admin Menu System - Platform Management

## Created: 2025-01-17
## Last Updated: 2025-09-21 - **CRITICAL**: Margin calculation fix and data cleanup

### System Overview
Complete admin menu management system for delivery platform integration (DoorDash, UberEats, Grubhub). Located at `/admin/platform-menu.html` with tablet-optimized interface for managing platform-specific pricing and generating shareable menu links.

## Key Files
- `/admin/platform-menu.html` - Main admin interface
- `/admin/platform-menu.css` - Tablet-optimized styles
- `/admin/platform-menu.js` - Menu management functionality
- `/menu/platform-view.html` - Public menu view for platforms
- `/data/combos.json` - Corrected combo descriptions
- `/public/data/combos.json` - Public-facing combo data

## Database Structure

### Collections
1. **wings** - 5 sizes (6, 12, 24, 30, 50)
2. **sides** - Fries (regular/large), Loaded Fries, Mozz Sticks (4 ratios)
3. **combos** - 5 combos with corrected descriptions
4. **sauces** - 14 total (4 dry rubs, 6 signature, 4 dipping)
5. **modifierGroups** - Wing styles, sauce selections, extras
6. **publicMenus** - Generated platform menu links

### Mozzarella Sticks Ratio System
- **1 ratio** = 4 sticks + 1 marinara (1.5oz)
- **2 ratios** = 8 sticks + 2 marinara (3oz)
- **3 ratios** = 12 sticks + 3 marinara (4.5oz)
- **4 ratios** = 16 sticks + 4 marinara (6oz)

## Corrected Menu Items (As of 2025-01-17)

### Wings
- 6, 12, 24, 30, 50 wings available
- Modifiers: Regular, All Drums (+$1.50), All Flats (+$1.50), Boneless
- Sauce limits: 6(1), 12(2), 24(2), 30(3), 50(4)
- Extra sauce: +$1.49

### Sides
- **Fries** - Regular (1lb paper cup) and Large (2lb box)
- **Loaded Fries** - Cheese sauce & bacon
- **Mozzarella Sticks** - 4pc with marinara (base unit)
- All dips in 1.5oz containers

### Combos (CORRECTED)
1. **Sampler Platter** - 6 wings, 4 mozz sticks, regular fries
2. **MVP Meal** - 12 wings, 4 mozz sticks, regular fries
3. **The Tailgater** - 24 wings, 8 mozz sticks (2 ratios), 1 large fries
4. **Game Day 30** - 30 wings only (mix 3 sauces)
5. **Party Pack 50** - 50 wings, 16 mozz sticks (4 ratios), 3 large fries

### Items We DON'T Have
- ❌ NO chicken tenders
- ❌ NO onion rings
- ❌ NO sodas (only bottled water)
- ❌ NO cheese fries (we have LOADED fries with bacon)
- ❌ NO celery/carrots included

## Platform Pricing Strategy

### Commission Structure
- **DoorDash**: 30% + 2.9% processing + $0.30
- **UberEats**: 30% + 3.05% processing + $0.35
- **Grubhub**: 20% + 3.05% processing + $0.30 + $1 delivery

### Pricing Markup Formula
- **DoorDash/UberEats**: Base price × 1.33 (33% markup)
- **Grubhub**: Base price × 1.28 (28% markup - lower fees)
- Round to nearest $0.50 for clean pricing

### Target Margins
- ✅ **Good**: >40% (green indicator)
- ⚠️ **Warning**: 30-40% (yellow indicator)
- ❌ **Bad**: <30% (red indicator)
- **Minimum acceptable**: 35% after all fees

## Admin Features

### Menu Management
- Click any item to edit
- Platform-specific pricing per item
- Real-time margin calculator
- Visual margin indicators (color-coded)
- Active/inactive toggles
- Bulk price sync option

### Modifier System
- Wing styles with pricing
- Sauce selections (max per size)
- Dipping sauces ($1.25 each)
- Extra options (Extra Crispy FREE, Sauce on Side FREE)

### Platform Integration
- Generate unique shareable links
- QR code generation
- PDF export capability
- Email to platform option
- Preview before sending

### Example Menu Link
```
https://phillywingsexpress.com/menu/doordash/menu_1737664000000_abc123xyz
```

## Tablet Optimizations
- Touch targets minimum 44px
- Responsive grid layout
- Single-screen workflow
- Large buttons for kitchen use
- Quick edit modals
- Auto-save functionality

## Firebase Structure Example
```javascript
// Wings document
{
  id: "wings-6",
  name: "6 Wings",
  description: "Perfect solo order. Choose your sauce.",
  basePrice: 8.99,
  platformPricing: {
    doordash: { price: 11.99, active: true },
    ubereats: { price: 11.99, active: true },
    grubhub: { price: 11.49, active: true }
  },
  portionDetails: {
    count: 6,
    weight: "180g",
    container: "small clamshell"
  },
  modifierGroups: ["wingStyle", "sauceSelection", "extras"]
}
```

## Key Business Rules
1. **Never below 35% margin** - Even during promotions
2. **Push small orders** - 6-wing orders have best margins (54%)
3. **Mozz sticks follow ratios** - Always in multiples of 4
4. **Platform parity** - Keep prices consistent per platform
5. **No price on main site** - Only show on platform menus

## Admin Access
- URL: `/admin/platform-menu.html`
- Requires Firebase authentication
- Works on Android tablets
- Real-time Firebase sync
- Multi-user safe

## Deployment Notes
- Changes save to Firebase immediately
- Platform menus update in real-time
- Generated links are permanent
- Old links remain valid after updates
- Preview before sharing with platforms

## Support & Troubleshooting
- Firebase collections must exist before use
- Images stored in Firebase Storage
- WebP versions auto-generated
- Platform logos in `/images/logos/`
- All prices in USD

## Recent Updates (2025-01-17)
- Fixed Sampler Platter (removed tenders/onion rings)
- Corrected Tailgater to 24 wings, 8 mozz sticks
- Updated Party Pack to 16 mozz sticks (4 ratios)
- Established mozz stick ratio system
- Built complete admin interface
- Created platform menu generator
- Implemented margin calculator
- Added tablet optimizations

## CRITICAL System Issue Resolution (2025-09-21)

### ❌ **Problem Encountered**
- Average margin calculation broke: 45.2% → 0.0%
- Admin interface became unstable
- Menu link generation failing

### 🔍 **Root Cause Analysis**
**Incompatible menu items were added** that broke our proven working schema:

**❌ Problematic Items Added** (Now backed up):
- `wings-6` (6 Wings) - Document ID: `BdbjqIs4xtZO4ddwPRLv`
- `wings-10` (10 Wings) - Document ID: `E112LlISGmoeMJBS0sUh`
- `wings-20` (20 Wings) - Document ID: `CWwizDijTKJXXhh0PEBV`

**Issues with new items**:
1. **Separate documents** instead of variants within Wings document
2. **Mixed pricing structures**: `platformPricing.doordash: 13.76` vs `platformPricing.doordash.price: 13.76`
3. **Conflicting base prices**: `basePrice: 9.49` vs `variants[].price: 9.49`
4. **Non-standard wing counts**: 10, 20 were never in original offering

### ✅ **Solution Applied**

**1. Enhanced Margin Calculation Logic**
- Updated `calculateAverageMargin()` function in `admin/platform-menu.js:948-1006`
- Now handles multiple data structure formats safely
- Added proper error checking and NaN/Infinity protection

**2. Data Cleanup & Backup**
- **Backed up problematic items** → `.claude/memory/richard-menu-items-backup.json`
- **Removed conflicting documents** from live menuItems collection
- **Preserved original working schema**: 6, 12, 24, 30, 50 wings only

**3. Restored System Stability**
- Average margin calculation: ✅ **45.2%** (stable)
- Wings count: ✅ **5 items** (correct)
- Admin interface: ✅ **Fully functional**

### 📊 **Data Structure Standards (ENFORCED)**

**✅ CORRECT Way** (What we use):
```javascript
// Single Wings document with variants
Wings: {
  id: "wings",
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

**❌ AVOID** (What caused problems):
```javascript
// Separate documents with mixed structures
wings-6: {
  id: "wings-6",
  basePrice: 9.49,
  platformPricing: { doordash: 13.76 },  // Direct number
  variants: [{ price: 9.49 }]            // Conflicting pricing
}
```

### 🚨 **Prevention Rules**

1. **NEVER add wing counts** other than: 6, 12, 24, 30, 50
2. **ALWAYS use variants** within existing Wings document
3. **ALWAYS test margin calculation** after database changes
4. **ALWAYS backup experimental items** before going live
5. **STICK to approved data structures** - don't mix formats

### 🛠️ **Troubleshooting Guide**

**If Average Margin Shows 0.0%:**
1. Check browser console for data structure warnings
2. Look for items with mixed `platformPricing` formats
3. Verify no duplicate wing count documents exist
4. Test `calculateAverageMargin()` function in dev tools
5. Emergency fix: Remove problematic items, restore from backup

**Backup File Location**: `.claude/memory/richard-menu-items-backup.json`

### ✅ **System Health Check (Current)**
- ✅ Average Margin: **45.2%**
- ✅ Wings: **5 items** (6, 12, 24, 30, 50)
- ✅ Data Structure: **Consistent**
- ✅ Admin Interface: **Stable**
- ✅ Menu Generation: **Working**

**Last Verified**: 2025-09-21 20:03 GMT