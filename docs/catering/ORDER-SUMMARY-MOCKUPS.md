# Order Summary Mockups: Original vs Customized

## Approach 1: Inline Comparison (Recommended)
Shows modifications inline with original values for easy comparison

```
┌─────────────────────────────────────────────────────────────┐
│ ORDER SUMMARY                                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ✓ Wings Total: 200 → 200 (Modified Distribution)          │
│   └─ Original: 100 Boneless + 100 Bone-In                 │
│   └─ Your Choice: 90 Boneless + 60 Bone-In + 50 Cauli    │
│                                                             │
│   Sauce Assignments:                                        │
│   └─ Boneless Wings (90 total)                            │
│      • 45 wings - Buffalo (on the side)                    │
│        → 3 × 1.5oz containers                              │
│      • 45 wings - BBQ (tossed in sauce)                    │
│                                                             │
│   └─ Bone-In Wings (60 total)                             │
│      • 30 wings - Hot (on the side)                        │
│        → 2 × 1.5oz containers                              │
│      • 30 wings - Teriyaki (tossed in sauce)               │
│                                                             │
│   └─ Cauliflower Wings (50 total) [NEW]                   │
│      • 50 wings - Garlic Parm (tossed in sauce)           │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ ✓ Dips: 15 Total (3 packs of 5)                          │
│   └─ 5 Ranch, 5 Blue Cheese, 5 Honey Mustard              │
│   └─ Standard - No changes                                 │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ ✓ Sides: 2 Large Sides                                    │
│   └─ Original: Fries + Mac & Cheese                        │
│   └─ Standard - No changes                                 │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ ✓ Complete serving supplies                                │
│   └─ Plates, napkins, utensils, wet wipes                 │
└─────────────────────────────────────────────────────────────┘
```

**Pros:**
- Compact - single section per category
- Easy to see what changed vs what stayed the same
- Clear visual hierarchy with arrows (→) for changes
- "Standard - No changes" for unmodified items

**Cons:**
- Might be cluttered if many changes


---

## Approach 2: Two-Column Side-by-Side
Original on left, customizations on right

```
┌─────────────────────────────────────────────────────────────────────────┐
│ ORDER SUMMARY                                                           │
├──────────────────────────────────┬──────────────────────────────────────┤
│ STANDARD PACKAGE                 │ YOUR CUSTOMIZATIONS                  │
├──────────────────────────────────┼──────────────────────────────────────┤
│ ✓ 200 Wings                     │ ✓ 200 Wings (Modified) [ORANGE]     │
│   • 100 Boneless                 │   • 90 Boneless                      │
│   • 100 Bone-In                  │   • 60 Bone-In                       │
│                                  │   • 50 Cauliflower [NEW/GREEN]       │
│                                  │                                      │
│                                  │   Sauce Assignments:                 │
│                                  │   └─ Boneless (90):                  │
│                                  │      • 45 - Buffalo (side)           │
│                                  │        → 3 × 1.5oz containers        │
│                                  │      • 45 - BBQ (tossed)             │
│                                  │                                      │
│                                  │   └─ Bone-In (60):                   │
│                                  │      • 30 - Hot (side)               │
│                                  │        → 2 × 1.5oz containers        │
│                                  │      • 30 - Teriyaki (tossed)        │
│                                  │                                      │
│                                  │   └─ Cauliflower (50):               │
│                                  │      • 50 - Garlic Parm (tossed)     │
├──────────────────────────────────┼──────────────────────────────────────┤
│ ✓ 15 Dips (3 packs)             │ ✓ 15 Dips - Standard                │
│   • Ranch, Blue Cheese,          │   (No changes)                       │
│     Honey Mustard                │                                      │
├──────────────────────────────────┼──────────────────────────────────────┤
│ ✓ 2 Large Sides                 │ ✓ 2 Large Sides - Standard          │
│   • Fries                        │   (No changes)                       │
│   • Mac & Cheese                 │                                      │
├──────────────────────────────────┴──────────────────────────────────────┤
│ ✓ Complete serving supplies (plates, napkins, utensils, wet wipes)     │
└─────────────────────────────────────────────────────────────────────────┘
```

**Pros:**
- Very clear separation between original and customized
- Easy to compare at a glance
- Good for desktop/tablet

**Cons:**
- Takes more horizontal space
- Awkward on mobile (would need to stack vertically)
- Right side empty for unmodified items


---

## Approach 3: Accordion Expand/Collapse with Details
Collapsed shows summary, expanded shows full breakdown

```
┌─────────────────────────────────────────────────────────────┐
│ ORDER SUMMARY                                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ▼ Wings: 200 Total (Modified Distribution) [ORANGE] ▼     │
├─────────────────────────────────────────────────────────────┤
│   📦 Standard Package Includes:                            │
│   • 100 Boneless Wings                                      │
│   • 100 Bone-In Wings (Mixed - Drums & Flats)             │
│                                                             │
│   ✏️ Your Customizations:                                  │
│   • Changed to: 90 Boneless + 60 Bone-In + 50 Cauli       │
│   • Price Impact: +$27.00 (cauliflower upcharge)          │
│                                                             │
│   🌶️ Sauce Assignments You Added:                         │
│   └─ Boneless Wings (90 total)                            │
│      • 45 wings - Buffalo (on the side)                    │
│        → 3 × 1.5oz containers                              │
│      • 45 wings - BBQ (tossed in sauce)                    │
│                                                             │
│   └─ Bone-In Wings (60 total)                             │
│      • 30 wings - Hot (on the side)                        │
│        → 2 × 1.5oz containers                              │
│      • 30 wings - Teriyaki (tossed in sauce)               │
│                                                             │
│   └─ Cauliflower Wings (50 total) [NEW]                   │
│      • 50 wings - Garlic Parm (tossed in sauce)           │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ ▶ Dips: 15 Total - Standard (No Changes) ▶                │
│   (Click to expand)                                         │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ ▶ Sides: 2 Large Sides - Standard (No Changes) ▶          │
│   (Click to expand)                                         │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ ▶ Supplies: Complete serving set ▶                        │
│   (Click to expand)                                         │
└─────────────────────────────────────────────────────────────┘
```

**Pros:**
- Clean collapsed view shows just what changed
- Expands to show full details including original package content
- Good for mobile - saves vertical space
- Icons make sections clear (📦 = original, ✏️ = changes, 🌶️ = sauces)

**Cons:**
- Requires interaction to see details
- User might miss information if they don't expand


---

## Approach 4: Badge-Based Timeline Style
Shows changes as a timeline/history

```
┌─────────────────────────────────────────────────────────────┐
│ ORDER SUMMARY                                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ✓ Wings: 200 Total [MODIFIED]                             │
│                                                             │
│   🏷️ PACKAGE INCLUDES (BASE):                              │
│   • 100 Boneless Wings                                      │
│   • 100 Bone-In Wings                                       │
│                                                             │
│   🔄 YOUR CHANGES:                                          │
│   ├─ Changed distribution:                                  │
│   │  • 90 Boneless (-10) [ORANGE]                          │
│   │  • 60 Bone-In (-40) [ORANGE]                           │
│   │  • 50 Cauliflower (+50) [GREEN/NEW]                    │
│   │                                                         │
│   └─ Added sauce assignments:                               │
│      ├─ Boneless: Buffalo (45, side - 3 containers),       │
│      │             BBQ (45, tossed)                         │
│      ├─ Bone-In: Hot (30, side - 2 containers),            │
│      │            Teriyaki (30, tossed)                     │
│      └─ Cauliflower: Garlic Parm (50, tossed)              │
│                                                             │
│   💰 Price Impact: +$27.00                                  │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ ✓ Dips: 15 Total [STANDARD]                               │
│                                                             │
│   🏷️ PACKAGE INCLUDES:                                     │
│   • 15 dips (3 packs of 5): Ranch, Blue Cheese,           │
│     Honey Mustard                                           │
│                                                             │
│   ✅ No changes - keeping as standard                       │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ ✓ Sides: 2 Large Sides [STANDARD]                         │
│                                                             │
│   🏷️ PACKAGE INCLUDES:                                     │
│   • Fries                                                   │
│   • Mac & Cheese                                            │
│                                                             │
│   ✅ No changes - keeping as standard                       │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ ✓ Supplies [STANDARD]                                      │
│   🏷️ Complete serving supplies: plates, napkins,           │
│      utensils, wet wipes                                    │
└─────────────────────────────────────────────────────────────┘
```

**Pros:**
- Very clear what's included in base package vs what changed
- Shows delta values (+50, -10, -40) for easy understanding
- Price impact shown prominently
- Works well vertically (good for mobile)

**Cons:**
- More verbose - takes more vertical space
- Repeated structure for each category


---

## My Recommendation: **Approach 1 (Inline Comparison)**

**Reasoning:**
1. **Compact** - doesn't waste space on unmodified items
2. **Clear** - arrow notation (→) is universally understood
3. **Mobile-friendly** - works well in narrow viewports
4. **Scannable** - modifications stand out with badges and hierarchy
5. **Kitchen-ready** - shows exactly what to prepare with container counts

**Key Features:**
- Modified items show: `Original → Your Choice`
- Unmodified items show: `Standard - No changes`
- New additions get `[NEW]` badge in green
- Sauce details always shown (this is what kitchen needs)
- Container calculations for "on the side" sauces

Would you like me to implement **Approach 1**, or would you prefer one of the alternatives?