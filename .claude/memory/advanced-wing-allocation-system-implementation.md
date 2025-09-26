# Advanced Wing Allocation System Implementation

## Project Overview
We are implementing a sophisticated wing allocation system for Philly Wings Express that allows customers to:
1. Select no sauce option
2. Choose how many wings get each sauce (for 12+ wing orders)
3. Select multiple sauces with "on the side" options for classic sauces only (not for dry rubs)
4. Skip dips with a "No Dip" option
5. Get a detailed order summary showing wing breakdown

## System Requirements & Customer Experience

### Wing Count Behaviors:
- **6 Wings**: All wings get the same sauce(s), "on the side" toggle available
- **12+ Wings**: Wing quantity allocation per sauce, "on the side" toggle available

### Sauce Type Logic:
- **🌶️ Dry Rubs**: Applied during cooking, NO "on the side" option
- **🍯 Classic Sauces**: Can be "on the side" (1.5oz cup), quantity allocation for 12+

### Enhanced Customer Flow:
```
Wing Selection → Enhanced Sauce Selection → Enhanced Dips → Order Summary
     ↓                    ↓                      ↓            ↓
  6,12,24,30,50      Sauce + "On Side"      "No Dip" option  Detailed breakdown
                     Wing quantities (12+)
```

## Implementation Strategy: 4-Step Incremental Approach

### Step 1: "On the Side" Toggle for Classic Sauces ⏳ IN PROGRESS
**Goal**: Add toggle buttons next to classic sauces only
**Risk**: Low - UI enhancement only
**Status**: 🔄 Currently implementing
**Wait for approval before Step 2**

### Step 2: "No Dip" Option in Included Dips Section ⏳ PENDING
**Goal**: Allow customers to skip dips entirely
**Risk**: Low - UI enhancement with simple flow logic
**Status**: ⏸️ Awaiting Step 1 completion
**Wait for approval before Step 3**

### Step 3: Wing Quantity Selectors (12+ Wings) ⏳ PENDING
**Goal**: Add quantity controls and wing allocation tracking
**Risk**: Medium - Complex allocation logic
**Status**: ⏸️ Awaiting Step 2 completion
**Wait for approval before Step 4**

### Step 4: Smart Flow Logic & Validation ⏳ PENDING
**Goal**: Add business logic and error handling
**Risk**: Medium - Complex validation logic
**Status**: ⏸️ Awaiting Step 3 completion

---

## Step 1 Technical Implementation Details

### Files to Modify:
**Primary File**: `/home/tomcat65/projects/dev/philly-wings/functions/index.js`

### Specific Code Sections:

#### Section A: Data Structure Enhancement (around line 3316)
**Location**: Before or after `populateSauceSelection()` function
**Add**: New tracking object for sauce preferences
```javascript
// New object to track sauce preferences
let saucePreferences = {}; // { sauceId: { selected: true, onSide: false } }
```

#### Section B: Classic Sauces HTML Generation (line 3347-3352)
**Current Code Location**: Lines 3347-3352 in `classicSauces.map()` function
**Modification**: Add "on the side" toggle ONLY to classic sauces

**BEFORE:**
```javascript
classicSauces.map(sauce =>
    '<div class="sauce-option" onclick="toggleSauce(\\'' + sauce.id + '\\')\">' +
        '<div class="sauce-info">' +
            '<h5>' + sauce.name + '</h5>' +
            '<p class="sauce-description">' + (sauce.description || 'Classic wing sauce') + '</p>' +
        '</div>' +
    '</div>'
).join('')
```

**AFTER:**
```javascript
classicSauces.map(sauce =>
    '<div class="sauce-option" onclick="toggleSauce(\\'' + sauce.id + '\\')\">' +
        '<div class="sauce-info">' +
            '<h5>' + sauce.name + '</h5>' +
            '<p class="sauce-description">' + (sauce.description || 'Classic wing sauce') + '</p>' +
        '</div>' +
        '<div class="sauce-controls">' +
            '<label class="toggle-container">' +
                '<span class="toggle-label">On the Side (1.5oz)</span>' +
                '<input type="checkbox" class="on-side-toggle" data-sauce-id="' + sauce.id + '" onclick="toggleOnSide(event, \\'' + sauce.id + '\\')\">' +
                '<span class="toggle-slider"></span>' +
            '</label>' +
        '</div>' +
    '</div>'
).join('')
```

#### Section C: New JavaScript Function (after line 3386)
**Location**: After existing `toggleSauce` function
**Add**: New `toggleOnSide` function
```javascript
// New function to handle on-the-side toggle
window.toggleOnSide = function(event, sauceId) {
    event.stopPropagation(); // Prevent triggering sauce selection

    if (!saucePreferences[sauceId]) {
        saucePreferences[sauceId] = { selected: false, onSide: false };
    }

    saucePreferences[sauceId].onSide = event.target.checked;

    // Update display if needed
    updateOrderSummary();
};
```

#### Section D: CSS Styling Addition (in generateGrubHubCSS function)
**Location**: Add to CSS section in the strategic menu generation
**Add**: Toggle styling
```css
.sauce-controls {
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid #eee;
}

.toggle-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 12px;
    color: #666;
    cursor: pointer;
}

.toggle-label {
    font-size: 11px;
    color: #888;
}

.on-side-toggle {
    margin: 0 8px;
    cursor: pointer;
}

.toggle-slider {
    position: relative;
    display: inline-block;
    width: 30px;
    height: 16px;
    background-color: #ccc;
    border-radius: 16px;
    transition: 0.3s;
}

.on-side-toggle:checked + .toggle-slider {
    background-color: #ff6b35;
}
```

#### Section E: Order Summary Update (lines ~2894 and ~7763)
**Location**: Where sauce summary is displayed
**Modification**: Update to show "(on the side)" when applicable

### Implementation Constraints:
1. **Quote Escaping**: Use `\\'' + sauceId + '\\'` pattern consistently
2. **Event Handling**: Use `event.stopPropagation()` to prevent conflicts
3. **CSS Integration**: Add to existing CSS generation functions
4. **Data Persistence**: Maintain state during modal flow

### Testing Requirements for Step 1:
- [ ] Dry rubs don't show "on the side" toggle
- [ ] Classic sauces show "on the side" toggle
- [ ] Toggle state persists during selection
- [ ] Toggle clicks don't trigger sauce selection
- [ ] Order summary shows "(on the side)" notation
- [ ] No JavaScript syntax errors
- [ ] Works on DoorDash and UberEats platforms

### Success Criteria:
✅ Customer can select a classic sauce (e.g., Buffalo)
✅ Customer sees "On the Side (1.5oz)" toggle option
✅ Customer can toggle on/off without affecting sauce selection
✅ Order summary displays "Buffalo (on the side)" when toggled
✅ Dry rubs (e.g., Cajun) don't show toggle option
✅ No breaking changes to existing functionality

---

## Future Steps Overview:

### Step 2: "No Dip" Option
- Add to `populateIncludedDipSelection()` function
- Implement skip-to-summary logic

### Step 3: Wing Quantity Selectors
- Add quantity controls for 12+ wing orders
- Implement wing allocation tracking
- Add remaining wings counter

### Step 4: Smart Flow & Validation
- Add allocation validation
- Handle edge cases
- Optimize user experience

## Technical Notes:
- Main implementation file: `/home/tomcat65/projects/dev/philly-wings/functions/index.js`
- Current active sauce selection function: `populateSauceSelection()` (line 3316)
- Current toggleSauce function: line 3358
- Summary display locations: lines ~2894, ~7763
- Firebase emulators running on port 5002
- Test URLs: DoorDash and UberEats platforms (GrubHub has separate issues)

## Competition Analysis:
- Buffalo Wild Wings shows "Sauce on Side" in their ordering system
- Most competitors require sauce selection, we're adding flexibility
- This system will be a competitive advantage for customer customization

**Status**: Ready to implement Step 1 - waiting for user approval to proceed with code changes.