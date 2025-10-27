# SP-001: Visual Mockup Reference
**ASCII Art Representations for Developer Reference**

---

## Desktop View (>768px)

```
┌────────────────────────────────────────────────────────────────────────┐
│                                                                        │
│                   Which way do you want to order?                      │
│            Choose the experience that fits your needs                  │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────┬──────────────────────────────────┐
│ ╔══════════════════════════════╗ │ ╔══════════════════════════════╗ │
│ ║     [6px accent bar]         ║ │ ║     [6px accent bar]         ║ │
│ ╚══════════════════════════════╝ │ ╚══════════════════════════════╝ │
│                                  │                                  │
│          🏃 (48px)               │          🧭 (48px)               │
│                                  │                                  │
│      Quick Browse                │      Guided Planner              │
│      (24px, bold)                │      (24px, bold)                │
│                                  │                                  │
│   For experienced customers      │   For first-timers               │
│   (16px, red)                    │   (16px, red)                    │
│                                  │                                  │
│   Browse all our signature       │   Answer a few quick questions   │
│   platters and choose what       │   and we'll recommend the        │
│   looks good. Perfect if you     │   perfect spread for your team.  │
│   know what you want or love     │   Takes less than 60 seconds.    │
│   exploring options.             │                                  │
│   (15px, gray)                   │   (15px, gray)                   │
│                                  │                                  │
│   ✓ See all platters at once    │   ✓ Smart recommendations        │
│   ✓ Direct selection &           │   ✓ Filters by team size,        │
│     customization                │     preferences & budget         │
│   ✓ Fast checkout for            │   ✓ Saves time with curated      │
│     experienced users            │     suggestions                  │
│   (15px bullets)                 │   (15px bullets)                 │
│                                  │                                  │
│                                  │                                  │
│   ┌──────────────────────────┐   │   ┌──────────────────────────┐   │
│   │  View All Platters       │   │   │  Get Started             │   │
│   │  (48px height, full)     │   │   │  (48px height, full)     │   │
│   └──────────────────────────┘   │   └──────────────────────────┘   │
│                                  │                                  │
└──────────────────────────────────┴──────────────────────────────────┘
     (32px padding all sides)           (32px padding all sides)
     (16px border radius)                (16px border radius)
     (3px border - gray)                 (3px border - gray)

     Total card width: ~465px each
     Gap between cards: 24px
     Container max-width: 1000px
```

---

## Mobile View (<768px)

```
┌──────────────────────────────┐
│                              │
│   Which way do you           │
│   want to order?             │
│   (28px, centered)           │
│                              │
│   Choose the experience      │
│   that fits your needs       │
│   (16px, centered)           │
│                              │
└──────────────────────────────┘

┌──────────────────────────────┐
│ ╔══════════════════════════╗ │
│ ║  [accent bar]            ║ │
│ ╚══════════════════════════╝ │
│                              │
│         🏃 (32px)            │
│                              │
│     Quick Browse             │
│     (20px, bold)             │
│                              │
│  For experienced customers   │
│  (15px, red)                 │
│                              │
│  Browse all our signature... │
│  (14px, gray)                │
│                              │
│  ✓ See all platters at once │
│  ✓ Direct selection &        │
│    customization             │
│  ✓ Fast checkout             │
│  (13px bullets)              │
│                              │
│  ┌────────────────────────┐  │
│  │  View All Platters     │  │
│  └────────────────────────┘  │
│                              │
└──────────────────────────────┘
     (20px padding all sides)
     (Full width - 16px margin)

     ↓ 16px gap ↓

┌──────────────────────────────┐
│ ╔══════════════════════════╗ │
│ ║  [accent bar]            ║ │
│ ╚══════════════════════════╝ │
│                              │
│         🧭 (32px)            │
│                              │
│     Guided Planner           │
│     (20px, bold)             │
│                              │
│  For first-timers            │
│  (15px, red)                 │
│                              │
│  Answer a few quick...       │
│  (14px, gray)                │
│                              │
│  ✓ Smart recommendations     │
│  ✓ Filters by needs          │
│  ✓ Curated suggestions       │
│  (13px bullets)              │
│                              │
│  ┌────────────────────────┐  │
│  │  Get Started           │  │
│  └────────────────────────┘  │
│                              │
└──────────────────────────────┘
     (20px padding all sides)
```

---

## Hover State (Desktop)

```
┌──────────────────────────────────┐
│ ╔══════════════════════════════╗ │ ← Red gradient bar (visible)
│ ║ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ║ │
│ ╚══════════════════════════════╝ │
│                                  │
│          🏃                      │
│                                  │ ← Card lifts 4px up
│      Quick Browse                │
│                                  │
│   For experienced customers      │ ← Border changes to red (#e74c3c)
│                                  │
│   [description text...]          │
│                                  │ ← Shadow appears:
│   ✓ [bullets...]                 │   0 8px 24px rgba(231,76,60,0.15)
│                                  │
│   ┌──────────────────────────┐   │
│   │  View All Platters ←     │   │ ← Button also has hover state
│   └──────────────────────────┘   │
│                                  │
└──────────────────────────────────┘
```

---

## Focus State (Keyboard Navigation)

```
┌──────────────────────────────────┐
║║                                ║║ ← 3px red outline
║║          🏃                    ║║   with 4px offset
║║                                ║║
║║      Quick Browse              ║║
║║                                ║║
║║   For experienced customers    ║║
║║                                ║║
║║   [description text...]        ║║
║║                                ║║
║║   ✓ [bullets...]               ║║
║║                                ║║
║║   ┌──────────────────────────┐ ║║
║║   │  View All Platters       │ ║║
║║   └──────────────────────────┘ ║║
║║                                ║║
└──────────────────────────────────┘
```

---

## Button States (CTA)

**Default:**
```
┌────────────────────────────┐
│                            │  Background: #e74c3c (red)
│   View All Platters        │  Text: white
│                            │  Height: 48px
└────────────────────────────┘  Border-radius: 12px
```

**Hover:**
```
┌────────────────────────────┐
│                            │  Background: #c0392b (darker red)
│   View All Platters ↑      │  Lift: 2px up
│                            │  Shadow: 0 4px 12px rgba(231,76,60,0.3)
└────────────────────────────┘
      (elevated 2px)
```

**Pressed:**
```
┌────────────────────────────┐
│                            │  Background: #c0392b
│   View All Platters        │  Lift: reset to 0
│                            │  Shadow: 0 2px 6px rgba(231,76,60,0.3)
└────────────────────────────┘
```

---

## Color Swatches

```
Primary Red:
████████  #e74c3c  (Philly red - borders, buttons, accents)

Dark Red:
████████  #c0392b  (Button hover state)

Dark Gray:
████████  #2c3e50  (Headings, card titles)

Medium Gray:
████████  #7f8c8d  (Body text, descriptions)

Light Gray:
████████  #ecf0f1  (Default borders)

Success Green:
████████  #27ae60  (Checkmarks in bullets)

White:
████████  #ffffff  (Card backgrounds, button text)
```

---

## Spacing Grid

```
Card Padding (Desktop):
┌──────────────────────────────────┐
│ ←────── 32px ──────→             │
│ ↑                                │
│ 32px                             │
│ ↓                                │
│    [Content Area]                │
│                                  │
│ ↑                                │
│ 32px                             │
│ ↓                                │
│                                  │
└──────────────────────────────────┘
      ←────── 32px ──────→

Card Padding (Mobile):
┌──────────────────────────────┐
│ ←──── 20px ────→             │
│ ↑                            │
│ 20px                         │
│ ↓                            │
│    [Content Area]            │
│                              │
└──────────────────────────────┘
      ←──── 20px ────→

Internal Spacing:
Icon → 8px → Title
Title → 4px → Subtitle
Subtitle → 8px → Description
Description → 12px → Benefits
Benefits → 16px → Button
```

---

## Typography Scale

```
Section Heading:
Which way do you want to order?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
36px | Font Weight: 800 | Color: #2c3e50
Line Height: 1.2

Section Subtitle:
Choose the experience that fits your needs
───────────────────────────────────────────
18px | Font Weight: 400 | Color: #7f8c8d
Line Height: 1.4

Card Title:
Quick Browse
━━━━━━━━━━━━
24px | Font Weight: 700 | Color: #2c3e50
Line Height: 1.2

Card Subtitle:
For experienced customers
─────────────────────────
16px | Font Weight: 600 | Color: #e74c3c
Line Height: 1.3

Card Description:
Browse all our signature platters...
────────────────────────────────────
15px | Font Weight: 400 | Color: #7f8c8d
Line Height: 1.6

Benefit Bullets:
✓ See all platters at once
──────────────────────────
15px | Font Weight: 400 | Color: #7f8c8d
Line Height: 1.5
Checkmark: 16px | Color: #27ae60

CTA Button:
View All Platters
─────────────────
16px | Font Weight: 600 | Color: #ffffff
Line Height: 1
```

---

## Responsive Breakpoints

```
Mobile Portrait (320px - 639px):
┌─────────────────┐
│  Single Column  │
│  Stacked Cards  │
│  Full Width     │
│  20px Padding   │
└─────────────────┘

Mobile Landscape (640px - 767px):
┌──────────────────────┐
│   Single Column      │
│   Stacked Cards      │
│   Max-width: 600px   │
│   24px Padding       │
└──────────────────────┘

Tablet (768px - 1023px):
┌────────────────┬────────────────┐
│  Two Columns   │  Two Columns   │
│  Side by Side  │  Side by Side  │
│  Max-width:    │  Max-width:    │
│  900px         │  900px         │
└────────────────┴────────────────┘

Desktop (1024px+):
┌────────────────┬────────────────┐
│  Two Columns   │  Two Columns   │
│  Side by Side  │  Side by Side  │
│  Max-width: 1000px container    │
│  Optimal viewing experience     │
└────────────────┴────────────────┘
```

---

## Animation Timing

```
Card Hover Animation:
────────────────────────
Duration: 300ms
Easing: ease
Properties: border-color, transform, box-shadow
Transform: translateY(-4px)

Button Hover Animation:
──────────────────────
Duration: 200ms
Easing: ease
Properties: background, transform, box-shadow
Transform: translateY(-2px)

Accent Bar Reveal:
─────────────────
Duration: 300ms
Easing: ease
Properties: background
From: transparent
To: linear-gradient(90deg, #e74c3c, #c0392b)

Click Feedback:
──────────────
Duration: 150ms
Easing: ease-out
Transform: scale(0.98) → scale(1)
```

---

## Touch Target Sizes

```
Minimum Touch Targets (Mobile):
┌────────────────────┐
│                    │  Width: 100%
│                    │  Height: 48px minimum
│   CTA Button       │  Padding: 16px vertical
│                    │  (Exceeds 44x44px WCAG minimum)
│                    │
└────────────────────┘

Card Touch Target:
┌──────────────────────────────┐
│                              │  Entire card clickable
│                              │  Min height: 350px (mobile)
│   [Card Content]             │  Full width - 16px margins
│                              │  Easy thumb reach
│                              │
└──────────────────────────────┘
```

---

## Implementation Checklist

Visual:
- [ ] Section heading: 36px bold #2c3e50
- [ ] Section subtitle: 18px #7f8c8d
- [ ] 2-column grid (desktop), 1-column (mobile)
- [ ] 24px gap desktop, 16px gap mobile
- [ ] Cards: 16px border-radius, 3px border
- [ ] Icons: 48px desktop, 32px mobile
- [ ] Card titles: 24px bold
- [ ] Card subtitles: 16px red (#e74c3c)
- [ ] Descriptions: 15px gray (#7f8c8d)
- [ ] Benefit bullets: ✓ green (#27ae60)
- [ ] Buttons: 48px height, 12px border-radius
- [ ] White background, red (#e74c3c) button

Interactions:
- [ ] Hover: Lift 4px, red border, accent bar, shadow
- [ ] Focus: 3px red outline, 4px offset
- [ ] Click: Brief scale animation
- [ ] Button hover: Darker red, lift 2px
- [ ] Keyboard nav: Tab, Enter, Space
- [ ] Smooth animations: 300ms cards, 200ms buttons

Responsive:
- [ ] Desktop: 2-column side-by-side
- [ ] Tablet: 2-column maintained
- [ ] Mobile: Stacked single column
- [ ] Breakpoint: 768px
- [ ] Max-width: 1000px container

Accessibility:
- [ ] ARIA labels on cards
- [ ] Keyboard navigation support
- [ ] Screen reader announcements
- [ ] Color contrast WCAG AA
- [ ] Touch targets 48px+
- [ ] Reduced motion support
- [ ] Focus visible styles
```

---

**END OF VISUAL MOCKUP**
