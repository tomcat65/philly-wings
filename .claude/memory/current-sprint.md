# Current Sprint - Sep 17, 2025

## Sprint Goal
Finalize Dynamic Data Architecture & Nutrition Compliance Implementation

## Context Update
- **Owner**: Charley's Philly Steaks franchisee at Franklin Mills Mall
- **Situation**: Food court struggling ($7K/week, need $15-20K)
- **Strategy**: Virtual kitchens from existing kitchen
- **Brands**: PhillyWingsExpress (live), PhillyPizzaBueno (next), multiple domains owned
- **Tech**: Using existing Android tablets, Firebase (free tier)
- **Admin**: Already has basic admin panel at /admin

## COMPLETED (Sep 17, 2025 - Firebase Data Architecture & Nutrition Modal Fixes)
- [X] Fixed Nutrition Modal Per-Serving Toggle Bug
  - Resolved zeros display due to nested Firebase data structure
  - Added proper error handling for missing nutrition data
  - Per-serving calculations now work correctly
- [X] Dynamic Data Loading Implementation
  - Created comprehensive sauces.json and combos.json with enhanced schemas
  - Static JSON caching for zero runtime costs
  - All images using correct Firebase Storage domain
  - No hardcoding - everything loads dynamically
- [X] Fixed All Missing Images
  - Corrected sauce image URLs: buffalo-sauced.png, classic-buffalo-wings.png, etc.
  - Corrected combo image URLs: game-day-30-wings.png, party-pack-50-wings.png, etc.
  - Uploaded custom Philly Classic Hot image to Firebase Storage
- [X] Enhanced Allergen Indicators
  - Red color, borders, and custom CSS tooltips for visibility
  - Added sesame as 9th allergen for FDA 2020/2023 compliance
- [X] Data Architecture Separation
  - Properly separated nutritionData, combos, sauces in Firestore
  - Optimized performance with static JSON caching

## COMPLETED (Sep 16-17, 2025 - Complete Visual & Content Overhaul)
- [X] All Sauce Images Fixed
  - BROAD & PATTISON BURN: Unique Nashville hot image
  - Gritty's Revenge: Unique scorpion pepper image
  - Northeast Hot Lemon: Unique spicy lemon pepper image
- [X] All Combo Updates Complete
  - 50 Wing Party Pack: Now allows 4 sauce mix
  - Tailgater: 30 wings (not 20), mozz sticks, large fries
  - MVP Meal: 12 wings, fries, mozz sticks (no drink)
  - Sampler Platter: Regular fries (not loaded)
  - All combos have unique images now
- [X] Gallery Section Fixed
  - MVP Meal Combo image updated
  - Description corrected (regular fries)

## COMPLETED (Sep 16-17, 2025 - Earlier UX Fixes)
- [X] Favicon Visibility Fix
  - Replaced all favicon files with better-cropped version (fills canvas)
  - Now matches size of other professional sites in browser tabs
  - Added favicon-source.png for future reference
- [X] Gallery Content Fixes
  - Changed "Every. Damn. Time." to "Every God luvin' time."
  - Fixed Gritty's Garlic Parm image (now uses garlic-parmesan-dry-rub.png)
  - Updated MVP Meal to "MVP Meal Combo" with combo-platter.png
  - Description: "12 Wings, Mozzarella Sticks, Loaded Fries"
- [X] Wing Image Zoom Enhancement
  - Added object-fit: cover to crop zoomed images
  - Custom zoom positions for drums (35%) and flats (40%)
  - Shows close-up of wings instead of full image with empty space
- [X] Navigation & CTA Fixes
  - All "Order This" buttons in Popular Combos scroll to Order section
  - All "ORDER ON APP" links now clickable and functional
  - Exit-intent popup: Added close button, fixed "Lemme Get That Deal" navigation
- [X] Popular Combos Image Updates
  - Game Day 30: New dedicated game-day-30-wings.png
  - Party Pack 50: New party-pack-50-wings.png with sides in description
  - Date Night Dozen: Still using classic buffalo (unchanged)
- [X] Wings Menu Cleanup
  - Removed all duplicate images from wing size cards
  - Kept hero banner image only for cleaner layout

## COMPLETED (Sep 15, 2025 - Evening Session 2)
- [X] Fixed Mozzarella Sticks & Fries Images
  - Corrected wrong images (was showing buffalo wings)
  - Uploaded proper images to Firebase Storage
  - Renamed "French Fries" to "Fries"
  - Resolved upload issue (file path vs actual file content)
  - Images now displaying correctly on preview site

## COMPLETED (Sep 15, 2025 - Evening)
- [X] Wing Type Selector Visual Upgrade
  - Replaced text buttons with image-based cards
  - Three options: Drums, Flats, Boneless (each with own image)
  - Images from Firebase Storage (original-drums.png, original-flats.png, boneless-wings.png)
  - Responsive 3-column grid (1 column on mobile)
  - Green Eagles border for active selection
- [X] Image Zoom Feature
  - Click any wing image for full-screen detail view
  - Smooth zoom animations with dark overlay
  - Three close methods: X button, click outside, Escape key
  - Mobile-optimized sizing
  - Helps customers see wing details before ordering

## COMPLETED TODAY (Dec 14)
- [X] Added 30-count wings option (6, 12, 24, 30, 50)
- [X] Updated sauce names for local market:
  - Classic Lemon Pepper (was Liberty Bell)
  - Northeast Hot Lemon (was South Street Zing)
  - Frankford Cajun (was Fishtown Fire)
  - Sweet Teriyaki (was Chinatown Sweet)
  - Mild Buffalo (was Rookie Buffalo)
- [X] Created comprehensive 3rd-Party-ordering.md documentation
- [X] Researched all platform integration options
- [X] Discovered existing admin panel structure

## IN PROGRESS - Final Polish & Performance
- [ ] Performance optimization testing
- [ ] Cross-browser nutrition modal testing
- [ ] Final image optimization
- [ ] Mobile UX validation

## NEXT UP - Virtual Kitchen Admin
- [ ] Extend admin for multi-brand management
- [ ] Add live order dashboard for tablets
- [ ] Create kitchen display system (KDS)
- [ ] Build revenue tracking ($7K → $15K goal)
- [ ] Platform order aggregation view

## Key Insights
- No budget for POS system
- Must work with existing tablets
- Multiple virtual brands from one kitchen
- Delivery-only model (no walk-ins)
- Franklin Mills location = ghost kitchen opportunity