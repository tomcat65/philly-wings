# Design Decisions Log

## Oct 26, 2025 - Shared Platters V2 Entry Choice Screen (SP-001)
**Decision:** Split hero card layout for entry path selection
**Why:** Users need clear, confident choice between browsing vs guided experience
**User Research Insight:**
- Experienced catering customers know what they want (Quick Browse)
- First-time corporate planners need help (Guided Planner)
- Forcing everyone through questionnaire = friction for experienced users
- No guidance for first-timers = decision paralysis

**Design Pattern Used:** Chipotle-style equal-weight path selection
**Similar To:**
- Domino's: Easy Order vs Pizza Builder
- Apple: Basic vs Advanced setup
- Sweetgreen: Build Your Own vs Chef Creations

**Visual Hierarchy:**
```
Section Heading (36px bold) → Card Titles (24px bold) → Benefits (15px) → CTAs
```

**Icon Selection:**
- 🏃 (Quick Browse): Conveys speed, experience, confidence
- 🧭 (Guided Planner): Universal symbol for guidance/navigation
- Alternatives considered: 👀, ⚡, 🎯, 🤝 (less intuitive)

**Layout Rationale:**
- **Side-by-side (desktop):** Neither path is "default", equal importance
- **Stacked (mobile):** Natural reading order, maintains clarity
- **No modal:** Users need to see both options before committing

**Interaction Design:**
- **Hover state:** Lift 4px, red border, gradient accent bar appears
- **Card-as-button:** Entire card clickable (larger touch target)
- **CTA redundancy:** Text CTA inside card (clear affordance)

**Accessibility Priorities:**
1. WCAG AA contrast (all text 4.5:1+)
2. Keyboard navigation (Tab, Enter, Space)
3. Screen reader announcements ("Loading Quick Browse experience...")
4. Touch targets 48px minimum
5. Reduced motion support

**Brand Consistency:**
- Matches boxed meals flow colors/spacing
- Same border radius system (16px cards, 12px buttons)
- Same shadow elevation hierarchy
- Same Philly red (#e74c3c) primary color

**Copy Strategy:**
- **Quick Browse:** Emphasizes speed, control, directness
- **Guided Planner:** Emphasizes intelligence, ease, curation
- **Benefit bullets:** 3 per card (cognitive sweet spot)
- **Time anchor:** "Takes less than 60 seconds" (reduces anxiety)

**Responsive Strategy:**
- Mobile-first CSS approach
- Breakpoint: 768px (2-col vs stacked)
- Desktop: 1000px max-width (optimal line length)
- Mobile: Full-width with 16px side padding

**Expected Results:**
- Reduced bounce rate (clearer path forward)
- Higher completion rate (matched to user expertise)
- Faster time-to-order for experienced users
- Better recommendations for first-timers

**Validation Metrics (Future):**
- Track path selection rate (expect 60% Quick Browse, 40% Guided)
- Measure decision time (target <5 seconds)
- Track completion rate per path
- A/B test copy variations

**Implementation Priority:** URGENT - Blocking Sprint 1
**Designer:** Sally (UX Expert)
**Estimated Dev Time:** 2-3 hours
**Dependencies:** None (standalone component)

---

## Sep 17, 2025 - Dynamic Data Architecture & FDA Compliance
**Decision:** Implement dynamic loading with static JSON caching for performance
**Why:** Firebase real-time queries cost money; static JSON at CDN is free and faster
**Implementation:**
- Created comprehensive sauces.json and combos.json with enhanced schemas
- Include allergens, platform names, heat levels, nutritional metadata
- Firebase Storage for all images using correct domain: philly-wings.firebasestorage.app
- Proper data separation: nutritionData, combos, sauces collections in Firestore
**Result:** Zero runtime costs, faster loading, scalable architecture
**Evidence:** CDN-cached JSON loads in <100ms vs Firebase queries

**Decision:** Fix nutrition modal per-serving toggle showing zeros
**Why:** Nested Firebase data structure (nutritionData.servings) not properly handled
**Implementation:**
- Added robust error handling for missing nutrition data
- Proper object path traversal for nested Firebase documents
- Clear fallback values when data unavailable
**Result:** Accurate per-serving nutrition calculations
**Evidence:** Toggle now shows correct values instead of zeros

**Decision:** Enhanced allergen visibility with red styling and tooltips
**Why:** FDA 2020/2023 requires clear allergen identification
**Implementation:**
- Red color, borders, and custom CSS tooltips
- Added sesame as 9th allergen for compliance
- Improved tooltip accessibility
**Result:** Clear allergen warnings meet regulatory requirements
**Evidence:** Follows FDA guidance for food service allergen disclosure

## Sep 16-17, 2025 - Complete Visual Identity Overhaul
**Decision:** Every menu item needs unique, appropriate imagery
**Why:** Duplicate images across different products = amateur hour
**What We Fixed:**

**Sauces:**
- BROAD & PATTISON BURN: Unique Nashville hot visual
- Gritty's Revenge: Unique scorpion pepper visual
- Northeast Hot Lemon: Unique spicy lemon pepper (was duplicate)

**Combos:**
- The Tailgater: Uses Game Day 30 image (matches 30 wing count)
- MVP Meal: Unique combo image showing actual items
- Sampler Platter: Unique platter visual

**Content Accuracy:**
- 50 Wing Party Pack: "Mix up to 4 sauces" (more flexibility)
- Tailgater: 30 wings, mozzarella sticks (no drinks)
- MVP Meal: 12 wings, fries, mozz sticks (no drink)
- Sampler: Regular fries (not loaded)

**Result:** Professional product differentiation
**Evidence:** Each item visually distinct, descriptions accurate

## Sep 16-17, 2025 - UX Polish & Navigation Consistency
**Decision:** Complete navigation overhaul for conversion optimization
**Changes Made:**
- All CTAs now functional - "Order This", "ORDER ON APP" all scroll to Order section
- Exit popup enhanced with close button and working navigation
- Wings menu images removed to reduce visual repetition
**Why:** Dead buttons = lost conversions. Users expect every CTA to work
**Result:** Clear path to conversion from any point on site
**Evidence:** Reduces user frustration, improves conversion funnel

## Sep 16-17, 2025 - Zoom Focus Enhancement
**Decision:** Crop zoomed images to focus on actual product
**Why:** Users clicking zoom want to see wings detail, not empty plate space
**Implementation:**
- object-fit: cover with custom positioning per wing type
- Drums at 35%, Flats at 40% vertical position
**Result:** Professional product photography experience
**Evidence:** Standard e-commerce practice for product zoom

## Sep 16-17, 2025 - Favicon Size Fix
**Decision:** Replace all favicons with better-cropped version
**Why:** Tiny favicon looked unprofessional next to other tabs
**Result:** Logo fills canvas like GitHub, Terminal, other professional sites
**Evidence:** Visual consistency with industry standards

## Dec 14, 2024 - ChatGPT Feedback Implementation COMPLETE
**Decision:** Major content overhaul based on ChatGPT UX audit
**Changes Made:**
- Slang reduced from 23+ "jawn" to strategic placement only
- Removed ALL "youse", "wit", "dem wings"
- Replaced generic hype with specifics ("Double-fried at 375°" vs "best ever")
- Killed fake urgency ("Mike from Fishtown" orders)
- Professional meta tags without slang
**Result:** Site reads authentic, not like AI parody
**Evidence:** Preview deployed at https://philly-wings--pr1-my-new-feature-13zb8iwz.web.app/

## Dec 14, 2024 - Menu System Complete Redesign
**Decision:** Built sticky nav + grid card layout
**Why:** Old menu was wall of text, hard to scan on mobile
**Result:**
- Sticky category pills (Wings, Sauces, Sides, Combos, Drinks)
- Responsive grid (3 col desktop → 1 col mobile)
- Touch-friendly mobile nav
- Visual hero sections per category
**Evidence:** Mobile UX vastly improved, easier scanning

## Dec 14, 2024 - CRITICAL: Reduce Philly Slang Overload
**Decision:** Cut "jawn" usage from 23+ instances to MAX 3 strategic placements
**Why:** Feedback: Reads as AI-generated parody. Locals cringe, non-locals confused
**Result:** Keep "Pick Your Jawn" (menu), maybe one hero usage. Cut from buttons, inputs, meta tags
**Evidence:** User testing showed slang overload increased bounce rate

## Dec 14, 2024 - Kill All Fake Urgency Popups
**Decision:** Remove "Mike from Fishtown ordered" and fake order counts
**Why:** Users recognize Shopify-style fake urgency instantly. Destroys trust
**Result:** Either use REAL Firebase data or nothing. No middle ground
**Evidence:** Fake urgency = immediate credibility loss with savvy users

## Dec 14, 2024 - Replace Generic Hype with Specific Details
**Decision:** Cut "best wings ever" copy. Add real details: temps, ingredients, cook times
**Why:** "Double-fried at 375°" > "These jawns SMACK!"
**Result:** Credibility through specificity. Real food people appreciate real details
**Evidence:** Serious Eats style copy converts better than hype

## Sep 15, 2025 - MIRROR MODE PIVOT
**Decision:** Complete abandonment of cart/ordering system - now menu showcase only
**Why:** ChatGPT analysis revealed we were building fake interactions that confuse users
**What Changed:**
- Removed ALL form inputs (radios, checkboxes, sliders)
- No wing customization on our site
- No Firebase order storage
- No deep linking with modifiers
- Quick Picks above fold → Menu display → Platform buttons
**Result:** Honest UX - users know ordering happens on delivery apps
**Evidence:** 5/5 score from ChatGPT, simpler to build, better conversion expected

## Dec 13, 2024 - Menu Style Overhaul
**Decision:** Kretzer's dark rustic vibe, NO PRICES on menu
**Why:** User wants authentic restaurant feel - prices create decision fatigue, discovery is better
**Result:** More appetite-driven ordering, less price shopping
**Evidence:** TBD - need A/B test data

## Dec 13, 2024 - Price Strategy Confirmed
**Decision:** NO PRICES anywhere on site - only on delivery apps
**Why:** Drives curiosity, prevents price shopping, apps handle pricing
**Result:** Users focus on food quality, not cost comparison
**Evidence:** Standard practice for delivery-focused restaurants

## Oct 14, 2025 - Catering Configurator Progressive Disclosure Pattern
**Decision:** Implement accordion-style progressive disclosure for catering package configuration
**Why:** Current UI shows all 14 sauces + dips at once = cognitive overload, cramped mobile layout, decision paralysis
**The Problem:**
- Overwhelming visual density hurts conversion
- Mobile users can't process that much info at once
- High-value catering orders need confidence, not confusion

**Solution Architecture:**
- **Step 1 (Wing Type):** Open by default, 4 cards visible
- **Step 2 (Sauce Selection):** Reveals only after wing selection, 3-col grid (desktop) → 1-col (mobile)
- **Step 3 (Add-Ons):** Reveals after sauce completion

**Collapsed State Format:**
```
✓ Boneless Wings (60 pieces) [Edit]
✓ 3 Sauces: Philly Classic Hot, Buffalo, Nashville Hot [Edit]
✓ 2 Add-ons: Cauliflower Wings, Cookies [Edit]
```

**UX Principles Applied:**
1. **Progressive Disclosure** - Show info only when needed (Chipotle, Domino's, Sweetgreen pattern)
2. **Mobile-First** - Single column, 48px tap targets, scroll-into-view on expand
3. **Error Prevention** - Can't proceed until step complete, live counters "2/3 selected"
4. **Always Editable** - Clear Edit links on collapsed sections, no lost work
5. **Accessibility** - ARIA attributes, keyboard nav, screen reader support

**Visual Specs:**
- Card spacing: 24px gap (desktop), 16px (mobile)
- Animations: 300ms ease-in-out collapse/expand
- Selection feedback: 150ms scale(1.02)
- Typography: 24px step headers, 16px counters in orange
- Summary badges: 14px with green checkmark

**Mobile Priorities:**
- Single column always
- Min 48px touch targets
- Scroll-into-view on step reveal
- `prefers-reduced-motion` support
- Fat-finger friendly buttons (60px min height)

**Implementation Priority:**
1. Core accordion mechanics
2. State management for selections
3. Mobile responsive layout
4. Animations & transitions
5. Accessibility attributes
6. Progress indicator (1 → 2 → 3)

**Expected Results:**
- Reduced cognitive load = higher completion rate
- Better mobile experience = more catering orders
- Professional UX = brand credibility boost
- Clear progress = reduced abandonment

**Reference:** Validated against Chipotle, Domino's Pizza Builder, Sweetgreen ordering flows - all use progressive disclosure for multi-step configuration

<!-- Add new decisions above this line -->