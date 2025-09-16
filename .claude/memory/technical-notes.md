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
