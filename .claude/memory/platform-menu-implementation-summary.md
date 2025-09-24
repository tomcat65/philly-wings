# Platform Menu Implementation Summary

## Overview
Philly Wings Express has a comprehensive Firebase-powered platform menu generation system that creates customized menus for delivery platforms (DoorDash, UberEats, GrubHub) with platform-specific pricing and formatting.

## Access Points & URLs

### Firebase Emulators Setup (Currently Running)
- **Hosting Emulator**: http://127.0.0.1:5000 (static content)
- **Firebase UI**: http://127.0.0.1:4000
- **Functions Emulator**: http://localhost:5002 (ACTIVE)
- **Platform Menu Function**: http://localhost:5002/philly-wings/us-central1/platformMenu

### Server-Side Rendered Platform Menus (PRODUCTION READY)
These are the **actual Firebase Function URLs that generate dynamic menus** for delivery platforms:

**Local Development (Emulator - Currently Active on Port 5002)**:
- **DoorDash Menu**: http://localhost:5002/philly-wings/us-central1/platformMenu?platform=doordash
- **UberEats Menu**: http://localhost:5002/philly-wings/us-central1/platformMenu?platform=ubereats
- **GrubHub Menu**: http://localhost:5002/philly-wings/us-central1/platformMenu?platform=grubhub

**Production URLs** (what platforms actually receive):
- **DoorDash**: https://us-central1-philly-wings.cloudfunctions.net/platformMenu?platform=doordash
- **UberEats**: https://us-central1-philly-wings.cloudfunctions.net/platformMenu?platform=ubereats
- **GrubHub**: https://us-central1-philly-wings.cloudfunctions.net/platformMenu?platform=grubhub

### How Server-Side Menu Generation Works
1. **Firebase Function** (`platformMenu` in functions/index.js) receives platform parameter
2. **Fetches real-time data** from Firestore (combos, beverages, sauces, etc.)
3. **Applies platform-specific pricing**:
   - DoorDash: 35% markup
   - UberEats: 35% markup
   - GrubHub: 21.5% markup
4. **Generates complete HTML page** with CSS styling and responsive design
5. **Returns rendered HTML** directly to platform/browser
6. **Updates automatically** when Firestore data changes

### How to Start Emulators
```bash
# Start all emulators
npm run emulators
# OR specific emulators
firebase emulators:start --only hosting,functions
```

## Major Implementations Completed

### 1. Beverage Section Redesign
**File**: `/home/tomcat65/projects/dev/philly-wings/functions/index.js` (lines ~3540-3600)
- **Before**: Simple list format
- **After**: Card-based layout with click functionality and modals
- **Features**: Responsive images (desktop/tablet/mobile), proper WebP resizing
- **Fixed Issues**:
  - Iced tea image not displaying
  - Water bottle clipping/oversizing
  - Fountain drinks full-width image display

### 2. Dips Section Separation
**File**: `/home/tomcat65/projects/dev/philly-wings/functions/index.js` (lines ~3700-3800)
- **Created**: `generateDipsSection()` function
- **Separated**: Dips from sauces into dedicated section
- **Cards**: Ranch, Honey Mustard, Blue Cheese, Cheese Sauce (4 individual cards)
- **Details**: Added "1.5 oz cups" specification, removed inaccurate "Made Fresh Daily"
- **Image Position**: Optimized to show cup contents (40% from top positioning)

### 3. Combo Ordering System
**File**: `/home/tomcat65/projects/dev/philly-wings/functions/index.js` (lines ~2660-2670)
- **Added**: `combos.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))`
- **Order**: Sampler Platter → MVP Meal → Tailgater → Game Day 30 → Party Pack 50
- **Firestore Updates**: Updated sortOrder values (1,2,3,4,5) for proper wing count progression

### 4. Wings Section Redesign
**File**: `/home/tomcat65/projects/dev/philly-wings/functions/index.js` (lines ~2900-3000)
- **Before**: Individual wing items
- **After**: 2 category cards (Boneless first, then Bone-In)
- **Format**: Category-based selection with descriptions and images

### 5. Sides Section Redesign
**File**: `/home/tomcat65/projects/dev/philly-wings/functions/index.js` (lines ~3200-3300)
- **Cards**: 3 main categories
  - **Fries**: Original and Large sizes available
  - **Loaded Fries**: Large size with cheese sauce and bacon
  - **Mozzarella Sticks**: Available in 4, 8, 12, 16 quantities

### 6. Sauce Images Optimization
**File**: `/home/tomcat65/projects/dev/philly-wings/functions/index.js` (CSS sections)
- **Fixed**: Full-width sauce images showing from cup top
- **CSS**: Added proper object-fit and object-position properties
- **Images**: All sauce images now display cup contents properly

## Image Management System

### Firebase Storage Structure
```
images/
├── [original-images].png
└── resized/
    ├── [image-name]_400x400.webp   # Mobile
    ├── [image-name]_600x600.webp   # Tablet
    └── [image-name]_800x800.webp   # Desktop
```

### Recent Image Updates
1. **Tailgater Combo**: Updated to show boneless wings version
   - **Path**: `images/resized/tailgater-combo-boneless_800x800.webp`
   - **Content**: Boneless wings, fries, mozzarella sticks, dips

2. **Broad & Pattison Burn**: Fixed missing sauce image
   - **Path**: `images/resized/broad-pattison-burn_800x800.webp`

### Image Processing Workflow
1. Upload original PNG to `images/` folder in Firebase Storage
2. Firebase function automatically triggers
3. Converts to WebP format in 3 sizes (400x400, 600x600, 800x800)
4. Stores in `images/resized/` folder
5. Update Firestore document with resized WebP URL

## Platform Pricing Strategy
- **DoorDash**: 35% markup on base prices
- **UberEats**: 35% markup on base prices
- **GrubHub**: 21.5% markup on base prices

## Firebase Collections Structure
- **combos**: Combo deals with sortOrder, pricing, components
- **menuItems**: Individual menu items with variants
- **sauces**: Sauce/seasoning options with heat levels
- **modifierGroups**: Customization options
- **beverages**: Drink options with platform pricing

## Key Technical Features
- **Responsive Design**: CSS media queries for desktop/tablet/mobile
- **Dynamic Pricing**: Platform-specific price calculations
- **Image Optimization**: Automatic WebP conversion and resizing
- **Modal System**: JavaScript-based product detail modals
- **CSS Grid Layouts**: Responsive card-based sections
- **Real-time Updates**: Firebase Firestore integration

## Testing & Validation
- **Emulator Environment**: Local testing with Firebase emulators
- **Live Preview**: Real-time menu generation and preview
- **Cross-Platform**: Tested across all three delivery platforms
- **Responsive Testing**: Verified on desktop, tablet, mobile viewports

## Future Maintenance
- Images auto-process when uploaded to `images/` folder
- Menu updates via admin panel at `/admin/platform-menu.html`
- Platform pricing adjustable in Firebase Functions code
- New menu sections can be added by extending the generation functions

---
*Last Updated: September 24, 2025*
*Implementation completed with Firebase emulators running on localhost*