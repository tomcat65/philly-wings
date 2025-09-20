# Technical Findings

## Firebase Storage
- Hero video uploaded: hero-wings-sauced.mp4 (3MB)
- Images uploaded: Multiple assets including:
  - Wing types: original-drums.png, original-flats.png, boneless-wings.png
  - Sides: mozzarella-sticks.png (2.06MB), fries.png (1.84MB)
  - Various sauce images
- All assets served via Firebase CDN
- Storage was completely empty before Dec 13
- IMPORTANT: Use /mnt/c/ paths when uploading from WSL to Firebase Storage

## Performance
- Asset sizes optimized: All under 3MB
- Using Firebase Storage URLs directly
- Video autoplay with muted/loop
- Images lazy loaded where appropriate

## Security Incident - Dec 13, 2024
- API key exposed in .env.example on GitHub
- Google Cloud detected and alerted
- FIXED: Replaced with placeholders
- Pushed clean version to repo
- No other files contained exposed keys

## Analytics Setup
- GA4 configured but needs proper ID
- Platform click tracking implemented
- Missing proper conversion events

## Wing Ordering Flow - MIRROR MODE (Sep 15, 2025)
- CRITICAL PIVOT: We're a menu showcase, NOT an ordering system
- Analyzed Charley's UX - learned what NOT to do (fake cart interactions)
- ChatGPT feedback integrated - achieved 5/5 score with mirror mode approach
- Rewrote wing-menu-flow.md completely - removed all cart/selection logic
- New approach: Display-only menu → Drive traffic to delivery platforms
- Key insight: No form inputs, no state management, no deep linking
- Success metric: Platform CTR >70%, time to click <15 seconds
- Implementation: Quick Picks above fold → Menu display → Platform buttons
- Analytics only - track views and platform clicks, not selections

## Team Member: Erika (Nutrition Expert)
- Role: FDA compliance and nutrition data management
- Activation: Run claude erika to activate
- Coordinates on: Nutrition modal UI, allergen displays

## Platform Menu Admin Panel Debug Session (Sep 18, 2025)

### Issues Found & Fixed:

#### 1. Data Structure Mismatch
**Problem**: Platform menu was expecting old flat structure but data is now variant-based
**Solution**: Updated `loadMenuData()` to handle both legacy and variant structures
- Enhanced variant processing with proper ID generation
- Added fallback for items without variants
- Improved error handling with detailed logging

#### 2. Firebase Collection Access
**Problem**: Code was trying to access `menuItems` collection but uncertain about structure
**Solution**:
- Added try-catch blocks for each collection
- Enhanced logging to track collection sizes
- Added fallback data structures for missing collections

#### 3. Platform Pricing Format Inconsistency
**Problem**: Platform pricing could be object `{price: number}` or direct number
**Solution**: Created `getPlatformPrice()` helper function
- Handles both object and number formats
- Falls back to basePrice when platform pricing missing
- Used consistently across display and editor functions

#### 4. Authentication Redirect Loop
**Problem**: Immediate redirect on auth failure could cause loops
**Solution**: Added 1-second delay before redirect to prevent loops

#### 5. Missing Navigation
**Problem**: No way to access platform menu from main admin panel
**Solution**:
- Added "Platform Menu Manager" tab to main admin
- Created informative description with features list
- Added direct link to platform-menu.html

#### 6. Visual Indicators Missing
**Problem**: Hard to see which platform is currently selected
**Solution**: Added CSS class for active price badges

### Code Changes Made:

#### Files Modified:
1. `/admin/index.html` - Added navigation tab and section
2. `/admin/platform-menu.js` - Fixed data loading, display, and pricing logic
3. `/admin/platform-menu.css` - Added active state styling

#### Key Functions Updated:
- `loadMenuData()` - Enhanced error handling and variant processing
- `createMenuItem()` - Fixed pricing display for all formats
- `displayItemEditor()` - Updated pricing form handling
- `findItemCategory()` - Added variant and collection detection

#### New Features Added:
- Console logging for debugging data loading
- Fallback modifier groups when collection missing
- Active platform visual indicators
- Better error messages with specific details

### Data Structure Understanding:

#### menuItems Collection:
```javascript
{
  id: "wings-6",
  name: "Traditional Wings",
  category: "wings",
  variants: [
    {
      name: "6 Wings",
      basePrice: 8.99,
      platformPricing: {
        doordash: { price: 11.99, active: true },
        ubereats: 11.99  // Can be direct number too
      }
    }
  ]
}
```

#### Platform Pricing Formats Supported:
- Object format: `{price: 11.99, active: true}`
- Direct number: `11.99`
- Fallback to basePrice if missing

### Testing Checklist:
- [ ] Load platform menu without errors
- [ ] See all menu categories populated
- [ ] Select items and see pricing editor
- [ ] Switch between platforms and see price updates
- [ ] Save item changes to Firebase
- [ ] Navigate between main admin and platform menu

### Next Steps:
1. Test with live data on preview environment
2. Add sample data if collections are empty
3. Test save functionality with real Firebase writes
4. Implement platform menu link generation
5. Add modifier groups management

### Firebase Collections Required:
- `menuItems` - Main menu items with variants
- `combos` - Combo deals
- `sauces` - Available sauces and rubs
- `modifierGroups` - Optional modifier options
- `publishedMenus` - Generated platform menus (auto-created)

### Performance Notes:
- Static JSON caching still preferred for public site
- Admin panel loads directly from Firestore for real-time management
- WebP images already optimized for fast loading
- Firebase persistence enabled for offline access
