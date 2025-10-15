# GA4 Event Spec – Catering Add-Ons

## Event Definitions

### add_on_selected
- **Triggered**: When user selects an add-on card
- **Parameters**:
  - `item_id` (string)
  - `item_name` (string)
  - `category` (string)
  - `price` (number)
  - `package_tier` (number)
  - `preparation_method` (string | undefined)
  - `selection_count` (number)

### add_on_removed
- **Triggered**: When user deselects an add-on
- **Parameters**:
  - `item_id`
  - `category`
  - `package_tier`
  - `preparation_method`

### preparation_method_changed
- **Triggered**: User toggles fried ↔ baked
- **Parameters**:
  - `item_id`
  - `from_method`
  - `to_method`
  - `package_tier`

### vegetarian_interest
- **Triggered**: Vegetarian step viewed or any vegetarian add-on selected
- **Parameters**:
  - `package_tier`
  - `add_on_count`
  - `has_preparation_choice` (boolean)

### dessert_interest
- **Triggered**: Dessert step viewed or dessert add-on selected
- **Parameters**:
  - `package_tier`
  - `add_on_count`

### total_calculated
- **Triggered**: Summary updated (base + add-ons)
- **Parameters**:
  - `package_id`
  - `package_tier`
  - `base_price`
  - `add_ons_total`
  - `final_price`
  - `add_on_count`
  - `vegetarian_count`
  - `dessert_count`

## Implementation Notes
- Use existing `analytics.js` wrapper; add typed helpers:
  - `trackAddOnSelected(payload)` etc.
- Log `preparation_method` only when variant available; otherwise omit.
- Defer Firestore logging to Gate 3 order submit path.

## QA Checklist
1. **DevTools / GA DebugView**:
   - Trigger each event once; confirm parameters emit.
   - Toggle preparation method and confirm `preparation_method_changed` fires with `from/to`.
2. **Edge Cases**:
   - Add-on added then removed immediately (ensure both events fire).
   - Preparation method changed without selection (should not happen; guard in UI).
   - Total recalculates when modifying sauces or add-ons; verify only fires on add-on changes.
3. **Emulator Scenario**:
   - Run `npm run dev` against emulator, walk full configurator flow, capture console logs for event debug.
4. **Unit Hook**:
   - Add tests (if feasible) around analytics helper functions to ensure payload formatting.

---

# Configurator Flow – Step 3 & 4

## Step 3: Vegetarian Options
- Insert between sauces and dips.
- Layout:
  1. Section header with badge + brief copy.
  2. Cards for each vegetarian add-on (Eggplant, Cauliflower).
  3. Cauliflower card includes toggle group (Fried/Baked) + sauce selector allowing max 2 sauces.
  4. Add button updates running total in sticky summary.

- UX Patterns:
  - Use radio-group style for preparation method; default to fried.
  - Display prep time & equipment badges (from add-on data) for transparency.
  - Show max daily units as tooltip if close to limit (future enhancement).

## Step 4: Desserts
- Similar grid of cards; simple add/remove buttons.
- No prep variants; show serving size and margin tag.

## Running Total
- Sticky summary (right rail desktop, bottom drawer mobile) shows:
  - Base price
  - Add-ons subtotal
  - Estimated total
  - Prep time estimate (base + add-ons via helper)
  - Required equipment icons

## Flow Diagram (text)
1. Step 1: Choose package
2. Step 2: Select sauces (unchanged)
3. Step 3: Vegetarian add-ons
   - Select Eggplant (optional)
   - Select Cauliflower
     - Toggle preparation method (default fried)
     - Choose up to two sauces (chip selector with counter)
4. Step 4: Desserts
   - Add Daisy’s cookies or cake
5. Step 5: Dips/Review
   - Summary with totals, prep time, equipment, allergens
   - CTA to proceed to checkout

---

# Firestore Order Schema Draft

## `cateringOrders` Additions
```
selectedAddOns: [
  {
    addOnId: string,
    name: string,
    category: string,
    quantity: number,
    unitPrice: number,
    totalPrice: number,
    preparationMethod?: fried | baked,
    sauceSplit?: {
      totalSauces: number,
      selections: Array<{ sauceId: string, portion: number }>
    },
    notes?: string
  }
],
addOnsSubtotal: number,
prepTimeMinutes: number,
requiredEquipment: string[],
allergens: string[]
```

## Downstream Consumers
- Admin dashboard: update order detail view to show add-ons with preparation method and sauce split.
- Reporting: aggregate add-on revenue and method usage.
- Capacity check: compare selection counts against `maxDailyUnits` (future enhancement).
```
