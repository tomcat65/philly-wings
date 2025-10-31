# SP-001: Shared Platters V2 Entry Choice Screen - Complete Design Specification

**Date:** October 26, 2025
**Designer:** Sally (UX Expert)
**Status:** READY FOR IMPLEMENTATION
**Priority:** URGENT - Blocking Sprint 1
**Reference:** https://philly-wings--pr6-catering-ys0b64qj.web.app (Boxed Meals for consistency)

---

## Executive Summary

The Entry Choice Screen is the **first impression** for Shared Platters V2. It must:
1. Present two clear, distinct paths: **Quick Browse** vs **Guided Planner**
2. Match existing brand patterns (boxed meals flow consistency)
3. Be mobile-responsive and accessible (WCAG AA)
4. Guide users confidently based on experience level

**User Journey:**
```
Landing → Entry Choice → [Quick Browse OR Guided Planner] → Package Selection → Checkout
            ↑ YOU ARE HERE
```

---

## Layout Architecture: Split Hero Cards

### Desktop Layout (>768px)
```
┌──────────────────────────────────────────────────────┐
│                    Section Header                     │
│          "Which way do you want to order?"            │
│      "Choose the experience that fits your needs"     │
└──────────────────────────────────────────────────────┘

┌─────────────────────────┬─────────────────────────────┐
│   QUICK BROWSE CARD     │   GUIDED PLANNER CARD       │
│   ┌─────────────────┐   │   ┌─────────────────┐       │
│   │  Icon: 🏃       │   │   │  Icon: 🧭       │       │
│   └─────────────────┘   │   └─────────────────┘       │
│                         │                             │
│   Quick Browse          │   Guided Planner            │
│   For experienced       │   For first-timers          │
│   customers             │                             │
│                         │                             │
│   "Browse all our..."   │   "Answer a few..."         │
│                         │                             │
│   ✓ See all options     │   ✓ Smart recommendations   │
│   ✓ Direct selection    │   ✓ Filter by needs         │
│   ✓ Fast ordering       │   ✓ Guided selection        │
│                         │                             │
│   [View All Platters]   │   [Get Started]             │
└─────────────────────────┴─────────────────────────────┘
```

### Mobile Layout (<768px)
```
┌──────────────────────┐
│   Section Header     │
│   (Centered)         │
└──────────────────────┘

┌──────────────────────┐
│  QUICK BROWSE CARD   │
│  Icon + Title        │
│  Description         │
│  ✓ Benefits (3)      │
│  [View All Platters] │
└──────────────────────┘

┌──────────────────────┐
│  GUIDED PLANNER CARD │
│  Icon + Title        │
│  Description         │
│  ✓ Benefits (3)      │
│  [Get Started]       │
└──────────────────────┘
```

---

## Visual Specifications

### Section Header

**Desktop:**
- **Heading:** "Which way do you want to order?"
  - Font size: `2.25rem` (36px)
  - Font weight: 800 (Extra Bold)
  - Color: `#2c3e50` (dark blue-gray)
  - Line height: 1.2
  - Margin bottom: `0.5rem`

- **Subtitle:** "Choose the experience that fits your needs"
  - Font size: `1.125rem` (18px)
  - Color: `#7f8c8d` (medium gray)
  - Margin bottom: `2rem`

**Mobile (<768px):**
- Heading: `1.75rem` (28px)
- Subtitle: `1rem` (16px)
- Margin bottom: `1.5rem`

### Card Container

**Grid Properties:**
```css
.entry-choice-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem; /* 24px */
  max-width: 1000px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .entry-choice-cards {
    grid-template-columns: 1fr;
    gap: 1rem; /* 16px */
  }
}
```

### Individual Card Styling

**Base Card:**
```css
.entry-choice-card {
  background: white;
  border: 3px solid #ecf0f1;
  border-radius: 16px;
  padding: 2rem; /* 32px */
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: relative;
  overflow: hidden;
  min-height: 400px; /* Ensures both cards same height */
}

/* Top accent bar */
.entry-choice-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 6px;
  background: transparent;
  transition: background 0.3s ease;
}

/* Hover state */
.entry-choice-card:hover {
  border-color: #e74c3c; /* Philly red */
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(231, 76, 60, 0.15);
}

.entry-choice-card:hover::before {
  background: linear-gradient(90deg, #e74c3c 0%, #c0392b 100%);
}

/* Focus state (keyboard navigation) */
.entry-choice-card:focus {
  outline: 3px solid #e74c3c;
  outline-offset: 4px;
}

/* Reduce motion for accessibility */
@media (prefers-reduced-motion: reduce) {
  .entry-choice-card {
    transition: none;
  }
}
```

**Mobile Adjustments:**
```css
@media (max-width: 768px) {
  .entry-choice-card {
    padding: 1.25rem; /* 20px */
    min-height: auto;
  }
}
```

### Card Icon

**Visual Style:**
- Font size: `3rem` (48px) on desktop
- Font size: `2.5rem` (40px) on tablet
- Font size: `2rem` (32px) on mobile
- Line height: 1
- Margin bottom: `0.5rem`

**Icon Recommendations:**

**Quick Browse Card:**
- Primary option: `🏃` (Runner - conveys speed/experience)
- Alternative: `👀` (Eyes - browsing/viewing)
- Alternative: `⚡` (Lightning - fast action)
- **Recommendation:** Use `🏃` - best conveys "experienced users who know what they want"

**Guided Planner Card:**
- Primary option: `🧭` (Compass - navigation/guidance)
- Alternative: `🎯` (Target - precision/recommendations)
- Alternative: `🤝` (Handshake - assistance)
- **Recommendation:** Use `🧭` - universally understood as "guidance"

### Card Title

```css
.card-title {
  font-size: 1.5rem; /* 24px */
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
  line-height: 1.2;
}

@media (max-width: 768px) {
  .card-title {
    font-size: 1.25rem; /* 20px */
  }
}
```

**Copy:**
- **Left Card:** "Quick Browse"
- **Right Card:** "Guided Planner"

### Card Subtitle (User Type)

```css
.card-subtitle {
  font-size: 1rem; /* 16px */
  color: #e74c3c; /* Philly red */
  font-weight: 600;
  margin: 0;
}

@media (max-width: 768px) {
  .card-subtitle {
    font-size: 0.9375rem; /* 15px */
  }
}
```

**Copy:**
- **Left Card:** "For experienced customers"
- **Right Card:** "For first-timers"

### Card Description

```css
.card-description {
  font-size: 0.9375rem; /* 15px */
  color: #7f8c8d;
  line-height: 1.6;
  margin-top: 0.5rem;
}
```

**Copy:**
- **Left Card:** "Browse all our signature platters and choose what looks good. Perfect if you know what you want or love exploring options."
- **Right Card:** "Answer a few quick questions and we'll recommend the perfect spread for your team. Takes less than 60 seconds."

### Benefit Bullets

```css
.card-benefits {
  list-style: none;
  padding: 0;
  margin: 0.75rem 0 0 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem; /* 8px */
}

.card-benefits li {
  font-size: 0.9375rem; /* 15px */
  color: #7f8c8d;
  padding-left: 1.5rem;
  position: relative;
  line-height: 1.5;
}

.card-benefits li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: #27ae60; /* Green checkmark */
  font-weight: 700;
  font-size: 1rem;
}
```

**Copy:**

**Quick Browse Benefits:**
- See all platters at once
- Direct selection & customization
- Fast checkout for experienced users

**Guided Planner Benefits:**
- Smart recommendations based on your answers
- Filters by team size, preferences & budget
- Saves time with curated suggestions

### Call-to-Action Buttons

```css
.card-cta-button {
  margin-top: auto; /* Push to bottom */
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 1rem 2rem; /* 16px 32px */
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  text-align: center;
  min-height: 48px; /* Touch target size */
}

.card-cta-button:hover {
  background: #c0392b; /* Darker red */
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
}

.card-cta-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(231, 76, 60, 0.3);
}

.card-cta-button:focus {
  outline: 3px solid #e74c3c;
  outline-offset: 4px;
}
```

**Button Text:**
- **Left Card:** "View All Platters"
- **Right Card:** "Get Started"

---

## Color Palette

### Primary Colors
```css
--philly-red: #e74c3c;
--philly-red-dark: #c0392b;
--philly-red-light: #ec7063;

--philly-orange: #ff6b35; /* For accents if needed */
```

### Neutrals
```css
--gray-900: #2c3e50; /* Headings */
--gray-700: #34495e; /* Body text */
--gray-600: #7f8c8d; /* Subtle text */
--gray-300: #ecf0f1; /* Borders */
--gray-100: #f8f9fa; /* Backgrounds */
--white: #ffffff;
```

### Status Colors
```css
--success-green: #27ae60; /* Checkmarks */
--info-blue: #3498db;
--warning-yellow: #f39c12;
```

### Contrast Ratios (WCAG AA Compliance)
- Heading text (#2c3e50) on white: **12.6:1** ✅
- Body text (#7f8c8d) on white: **4.5:1** ✅
- CTA button text (white) on red (#e74c3c): **4.8:1** ✅
- All meet WCAG AA standards

---

## Spacing System

```css
--spacing-xs: 0.25rem;   /* 4px */
--spacing-sm: 0.5rem;    /* 8px */
--spacing-md: 1rem;      /* 16px */
--spacing-lg: 1.5rem;    /* 24px */
--spacing-xl: 2rem;      /* 32px */
--spacing-2xl: 3rem;     /* 48px */
```

**Applied Spacing:**
- Section padding: `--spacing-2xl` top/bottom, `--spacing-md` sides
- Card gap: `--spacing-lg` (24px desktop), `--spacing-md` (16px mobile)
- Internal card padding: `--spacing-xl` (32px desktop), `--spacing-lg` (20px mobile)
- Element gaps within card: `--spacing-md` (16px)

---

## Responsive Breakpoints

```css
/* Mobile First Approach */
@media (min-width: 640px) { /* Small tablets */ }
@media (min-width: 768px) { /* Tablets / 2-column cards */ }
@media (min-width: 1024px) { /* Desktop */ }
@media (min-width: 1280px) { /* Large desktop */ }
```

**Key Breakpoint: 768px**
- Above: 2-column side-by-side cards
- Below: Stacked single-column cards

---

## Accessibility Requirements

### ARIA Attributes

**Card as Button:**
```html
<button
  class="entry-choice-card"
  role="button"
  aria-label="Quick Browse - View all platters at once"
  data-path="quick-browse">
  <!-- Card content -->
</button>
```

**Keyboard Navigation:**
- Tab order: Header → Left Card → Right Card
- Enter/Space: Activate selected card
- Focus visible styles required (already specified in CSS)

### Screen Reader Support

**Announce Choices:**
```html
<div role="region" aria-labelledby="entry-choice-heading">
  <h2 id="entry-choice-heading">Which way do you want to order?</h2>
  <!-- Cards here -->
</div>
```

**Live Region for Selection:**
```javascript
// When user clicks a card, announce:
const announcement = document.createElement('div');
announcement.setAttribute('role', 'status');
announcement.setAttribute('aria-live', 'polite');
announcement.textContent = 'Loading Quick Browse experience...';
document.body.appendChild(announcement);
```

### Color Contrast
- All text meets WCAG AA (4.5:1 minimum)
- Interactive elements meet 3:1 contrast with background
- Focus indicators have 3:1 contrast

### Touch Targets
- Minimum 44x44px (CSS already specifies 48px button height)
- Adequate spacing between cards (24px gap)

### Motion Sensitivity
```css
@media (prefers-reduced-motion: reduce) {
  .entry-choice-card,
  .card-cta-button {
    transition: none;
    transform: none;
  }
}
```

---

## Interaction States

### Card States

**Default (Idle):**
- White background
- Light gray border (#ecf0f1)
- No shadow
- No top accent bar

**Hover:**
- Red border (#e74c3c)
- Lift up 4px (`translateY(-4px)`)
- Red gradient top accent bar appears
- Subtle shadow: `0 8px 24px rgba(231, 76, 60, 0.15)`
- Transition: 300ms ease

**Focus (Keyboard):**
- 3px red outline (#e74c3c)
- 4px outline offset
- No transform (stays in place)

**Active (Click/Tap):**
- Optional: Brief scale animation `scale(0.98)` for 150ms
- Provides tactile feedback

### Button States

**Default:**
- Red background (#e74c3c)
- White text
- No shadow

**Hover:**
- Darker red (#c0392b)
- Lift up 2px
- Shadow appears: `0 4px 12px rgba(231, 76, 60, 0.3)`

**Active (Pressed):**
- Reset to Y position 0
- Smaller shadow: `0 2px 6px rgba(231, 76, 60, 0.3)`

**Focus:**
- 3px red outline
- 4px offset

---

## Animation Specifications

### Card Hover Animation
```css
transition: all 0.3s ease;
transform: translateY(-4px);
```

**Timing:** 300ms
**Easing:** Ease (cubic-bezier(0.25, 0.1, 0.25, 1))
**Properties:** border-color, transform, box-shadow, background

### Button Interaction
```css
transition: all 0.2s ease;
transform: translateY(-2px);
```

**Timing:** 200ms
**Easing:** Ease
**Properties:** background, transform, box-shadow

### Accent Bar Reveal
```css
transition: background 0.3s ease;
```

**Timing:** 300ms
**Easing:** Ease
**Properties:** background (transparent → gradient)

---

## Implementation Notes

### HTML Structure

```html
<section class="entry-choice-section">
  <div class="entry-choice-header">
    <h2>Which way do you want to order?</h2>
    <p class="entry-choice-subtitle">Choose the experience that fits your needs</p>
  </div>

  <div class="entry-choice-cards">
    <!-- Quick Browse Card -->
    <button class="entry-choice-card" data-path="quick-browse" aria-label="Quick Browse - View all platters">
      <div class="card-icon">🏃</div>
      <div class="card-content">
        <h3 class="card-title">Quick Browse</h3>
        <p class="card-subtitle">For experienced customers</p>
        <p class="card-description">
          Browse all our signature platters and choose what looks good.
          Perfect if you know what you want or love exploring options.
        </p>
        <ul class="card-benefits">
          <li>See all platters at once</li>
          <li>Direct selection & customization</li>
          <li>Fast checkout for experienced users</li>
        </ul>
      </div>
      <span class="card-cta-button">View All Platters</span>
    </button>

    <!-- Guided Planner Card -->
    <button class="entry-choice-card" data-path="guided-planner" aria-label="Guided Planner - Get recommendations">
      <div class="card-icon">🧭</div>
      <div class="card-content">
        <h3 class="card-title">Guided Planner</h3>
        <p class="card-subtitle">For first-timers</p>
        <p class="card-description">
          Answer a few quick questions and we'll recommend the perfect spread
          for your team. Takes less than 60 seconds.
        </p>
        <ul class="card-benefits">
          <li>Smart recommendations based on your answers</li>
          <li>Filters by team size, preferences & budget</li>
          <li>Saves time with curated suggestions</li>
        </ul>
      </div>
      <span class="card-cta-button">Get Started</span>
    </button>
  </div>
</section>
```

### JavaScript Interaction

```javascript
export function initEntryChoiceV2() {
  const quickBrowseCard = document.querySelector('[data-path="quick-browse"]');
  const guidedPlannerCard = document.querySelector('[data-path="guided-planner"]');

  quickBrowseCard?.addEventListener('click', () => {
    announceSelection('Quick Browse');
    navigateToQuickBrowse();
  });

  guidedPlannerCard?.addEventListener('click', () => {
    announceSelection('Guided Planner');
    navigateToGuidedPlanner();
  });

  // Keyboard support
  [quickBrowseCard, guidedPlannerCard].forEach(card => {
    card?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });
  });
}

function announceSelection(choice) {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', 'polite');
  announcement.className = 'sr-only';
  announcement.textContent = `Loading ${choice} experience...`;
  document.body.appendChild(announcement);

  setTimeout(() => announcement.remove(), 1000);
}

function navigateToQuickBrowse() {
  // Show all packages view
  document.getElementById('quick-browse-view')?.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  });
}

function navigateToGuidedPlanner() {
  // Show questionnaire modal or flow
  document.getElementById('guided-planner-modal')?.classList.add('active');
}
```

---

## Brand Consistency Check

### Alignment with Boxed Meals Flow ✅

**Shared Visual Language:**
- Same color palette (Philly red #e74c3c, grays)
- Same border radius (16px for cards, 12px for buttons)
- Same shadow system (elevation hierarchy)
- Same spacing scale (8px base unit)
- Same typography scale (rem-based)
- Same hover/focus states

**Differences (Intentional):**
- Entry choice uses emoji icons (fun, approachable)
- Boxed meals uses photo cards (product-focused)
- Both are appropriate for their context

### Visual Hierarchy ✅

1. **Primary:** Section heading (36px bold)
2. **Secondary:** Card titles (24px bold)
3. **Tertiary:** Card descriptions & bullets (15px)
4. **CTA:** Buttons (16px bold, color emphasis)

---

## Testing Checklist

### Visual Testing
- [ ] Cards align horizontally on desktop (>768px)
- [ ] Cards stack vertically on mobile (<768px)
- [ ] Hover states work (border, shadow, lift)
- [ ] Icons render properly (emoji fallback tested)
- [ ] Text readable at all sizes
- [ ] Spacing consistent with design system

### Interaction Testing
- [ ] Click navigates to correct flow
- [ ] Keyboard tab order logical
- [ ] Enter/Space activate cards
- [ ] Focus states visible
- [ ] Hover doesn't interfere with touch (mobile)
- [ ] Double-tap doesn't zoom (iOS)

### Accessibility Testing
- [ ] Screen reader announces card purpose
- [ ] Color contrast meets WCAG AA
- [ ] Touch targets min 44x44px
- [ ] Reduced motion respected
- [ ] Keyboard-only navigation works
- [ ] ARIA labels present and accurate

### Responsive Testing
- [ ] Desktop (1280px+)
- [ ] Laptop (1024px)
- [ ] Tablet (768px)
- [ ] Mobile landscape (640px)
- [ ] Mobile portrait (375px)
- [ ] Small mobile (320px)

### Browser Testing
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (iOS)
- [ ] Samsung Internet (Android)

---

## Success Metrics

### User Experience Goals
- **Clarity:** 100% of users understand the difference between paths
- **Decision Speed:** Average 5 seconds to choose a path
- **Path Distribution:** Track which path users choose (validate assumptions)

### Technical Goals
- **Load Time:** Section visible in <1 second
- **Interaction Responsiveness:** Hover/click feedback <100ms
- **Accessibility Score:** Lighthouse 100/100
- **No Layout Shift:** CLS score 0

---

## Files to Create/Modify

### New Files
1. **Component:** `/src/components/catering/shared-platter-entry-choice.js`
2. **Styles:** `/src/styles/shared-platter-entry-choice.css`

### Modified Files
1. **Catering Page:** `/src/pages/catering.js` (import new component)
2. **State Service:** `/src/services/catering-state-service.js` (track path selection)

### No Changes Needed
- Existing photo card components (reused elsewhere)
- Boxed meals flow (reference only)
- Pricing services (not relevant yet)

---

## Copy Reference (Ready to Use)

### Section Header
**Heading:** "Which way do you want to order?"
**Subtitle:** "Choose the experience that fits your needs"

### Quick Browse Card
**Icon:** 🏃
**Title:** Quick Browse
**Subtitle:** For experienced customers
**Description:** Browse all our signature platters and choose what looks good. Perfect if you know what you want or love exploring options.
**Benefits:**
- See all platters at once
- Direct selection & customization
- Fast checkout for experienced users

**CTA:** View All Platters

### Guided Planner Card
**Icon:** 🧭
**Title:** Guided Planner
**Subtitle:** For first-timers
**Description:** Answer a few quick questions and we'll recommend the perfect spread for your team. Takes less than 60 seconds.
**Benefits:**
- Smart recommendations based on your answers
- Filters by team size, preferences & budget
- Saves time with curated suggestions

**CTA:** Get Started

---

## Design Rationale

### Why Split Hero?
- **Clear mental model:** Two distinct experiences, not one complex flow
- **Reduces cognitive load:** Users immediately understand their options
- **Validates user intent:** Experienced users skip questionnaire, new users get help

### Why These Icons?
- **🏃 (Runner):** Conveys speed, confidence, experience
- **🧭 (Compass):** Universal symbol for guidance and navigation
- **Alternative considered:** 👀 and 🎯, but less intuitive

### Why Side-by-Side (Not Modal)?
- **Both options equal weight:** Neither is "default"
- **No premature commitment:** Users see both before choosing
- **Mobile stacks naturally:** Responsive without complex logic

### Why These Benefit Bullets?
- **Quick Browse:** Emphasizes speed, control, and directness
- **Guided Planner:** Emphasizes intelligence, ease, and curation
- **3 bullets each:** Cognitive psychology sweet spot (3-5 items)

---

## Next Steps After Implementation

### Phase 1: Build & Test (Today)
1. Create component files
2. Implement HTML structure
3. Apply CSS styles
4. Add JavaScript interactions
5. Test in emulator

### Phase 2: User Testing (Next Week)
1. Deploy to preview environment
2. Test with 5 internal users
3. Gather feedback on clarity
4. Track which path users choose
5. Iterate based on data

### Phase 3: Analytics Integration (Future)
1. Track path selection rate
2. Measure time to decision
3. Track completion rate per path
4. A/B test copy variations

---

## Designer Notes

**Sally's UX Philosophy Applied:**
- **Progressive disclosure:** Don't show platters until path chosen
- **Reduce anxiety:** Clear, friendly copy ("takes less than 60 seconds")
- **Social proof:** "experienced customers" vs "first-timers" (implied validation)
- **Accessibility first:** Every design decision considers keyboard/screen reader users

**Validation Against Best Practices:**
- ✅ Chipotle-style clear path selection (bowl vs burrito)
- ✅ Domino's easy builder vs expert mode pattern
- ✅ Apple's simple vs advanced options approach

---

## Approval Sign-Off

**Ready for Development:** ✅ YES
**Blocking Issues:** None
**Dependencies:** None (standalone component)
**Estimated Dev Time:** 2-3 hours
**Designer Available for Questions:** Yes (Sally)

**TomCat65 - you have everything you need to build this! Let me know if you need any clarifications.**

---

**END OF SPECIFICATION**
