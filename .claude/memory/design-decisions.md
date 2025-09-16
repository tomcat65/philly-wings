# Design Decisions Log

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

<!-- Add new decisions above this line -->