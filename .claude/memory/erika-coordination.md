# Erika-Sally Coordination Notes

## 2025-09-15 - URGENT: Nutrition Modal UI Updates Needed

### Critical UI Changes Required

**Sally, we need to update the nutrition modal ASAP for FDA compliance!**

#### 1. New Data File Location
- **OLD:** `scripts/data/nutrition-data.js`
- **NEW:** `scripts/data/nutrition-data-fda2020.js`
- Import path needs updating in `nutrition-modal.js`

#### 2. New Nutrients to Display (FDA 2020 Required)
The modal needs to show these NEW nutrients:
- **Added Sugars** (g) - Show under Total Sugars with indent
- **Vitamin D** (mcg) - Not IU! Must be in micrograms
- **Potassium** (mg) - Critical for heart health claims

#### 3. Serving Size Display Changes
**CRITICAL:** Must show realistic serving sizes
- Wings now show "4 wings (120g)" as base serving
- Larger orders show "Servings per container: X"
- Consider adding toggle: "Show per serving" vs "Show total"

#### 4. Allergen Display Improvements
- Add **SESAME** to allergen list (9th major allergen as of 2023)
- Cross-contamination warning more prominent
- Consider allergen icons for quick scanning

#### 5. Visual/UX Suggestions
- **Calories** should be LARGEST/BOLDEST (FDA requirement)
- Daily Value % should align right
- Consider color coding:
  - Red: High sodium/saturated fat (>20% DV)
  - Green: High protein/fiber (>20% DV)
  - Yellow: Contains allergens

#### 6. Mobile Optimization
- Current modal might be too tall with new nutrients
- Consider collapsible sections or tabs:
  - Tab 1: Basic Nutrition
  - Tab 2: Vitamins & Minerals
  - Tab 3: Allergens & Warnings

#### 7. Accessibility Requirements
- Ensure screen readers announce allergen warnings FIRST
- High contrast mode for nutritional values
- Text should be scalable for vision-impaired users

### Testing Checklist
- [ ] All new nutrients display correctly
- [ ] Serving size math is accurate for multi-serving items
- [ ] Allergen warnings are prominent
- [ ] Mobile view isn't cut off
- [ ] Accessibility compliance (WCAG 2.1 AA)

### Files to Update
1. `src/components/nutrition-modal.js` - Main modal component
2. `src/styles/nutrition-modal.css` - Styling updates
3. Any admin panel that manages nutrition data

### Coordination Needed
**Erika needs from Sally:**
- Confirmation when UI updates are complete
- Screenshots of new modal for compliance documentation
- Any issues with data structure changes

**Sally can reach Erika:**
- Updates on UI implementation progress
- Questions about specific nutrient display requirements
- Accessibility concerns

### Deadline
FDA compliance is legally required - let's aim to deploy by end of week!

### Notes from Erika
"Yo Sally, I know this is a lot of changes, but the FDA don't play. The new data file has everything calculated correctly with proper serving sizes (4 wings per serving, not the whole order!). Hit me up if you need clarification on any nutrient or how to display it. Remember - customer safety first, especially with that sesame allergen. Let's make this modal both compliant AND user-friendly!"

### Recent Decisions
- Using 4 wings as standard serving (not 3) for consistency
- All items include cross-contamination warnings
- Combos show both total and per-person nutrition