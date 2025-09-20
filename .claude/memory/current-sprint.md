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

## COMPLETED (Sep 17, 2025 - Production Deployment)
- [X] Deployed to production via main branch
- [X] Changed mobile zoom from double-tap to single-tap
- [X] Fixed menu content accuracy (50 Wings name, mozzarella sticks quantity)
- [X] Updated all combo descriptions in Firebase (source of truth)
- [X] Created Docker testing environment for local development
- [X] All features production-ready and live

## COMPLETED (Sep 17, 2025 - Combo Updates & WebP Implementation)
- [X] Updated Combo Descriptions Across Site
  - Party Pack 50: 16 mozzarella sticks (was 20), Feeds 8-10
  - Tailgater: 24 wings, 8 mozzarella sticks, 1 large fries, Feeds 3-5
  - Game Day 30: Added Feeds 5-6
  - Updated both JSON files and Firebase documents
- [X] Implemented WebP Image Optimization
  - Installed Firebase Resize Images extension
  - Configured for WebP conversion with 3 sizes (200x200, 800x800, 1920x1080)
  - Successfully converted 30 images to WebP format
  - Created dynamic WebP service for automatic browser detection
  - 60-80% file size reduction achieved
  - Fallback to original images for unsupported browsers

## IN PROGRESS (Sep 18, 2025 - Platform Menu Admin Debug & Fix)
- [X] Debugged Platform Menu Admin Panel Loading Issues
  - Fixed data loading logic to handle variant structure correctly
  - Enhanced error handling with detailed console logging
  - Updated Firebase collection access patterns
  - Fixed authentication redirect loops
- [X] Added Navigation Between Admin Pages
  - Added "Platform Menu Manager" tab to main admin panel
  - Created clear description of features and benefits
  - Added direct link to platform-menu.html
- [X] Fixed Platform Pricing Data Structure
  - Handle both object {price: number} and direct number formats
  - Added fallback to basePrice when platform pricing missing
  - Updated margin calculations for accuracy
  - Added visual indicators for active platform
- [X] Enhanced Item Display Logic
  - Fixed variant expansion and categorization
  - Added proper parent-child relationships
  - Improved error handling for missing data
  - Added detailed console logging for debugging

## NEXT UP - Virtual Kitchen Admin
- [ ] Test platform menu manager with real data
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