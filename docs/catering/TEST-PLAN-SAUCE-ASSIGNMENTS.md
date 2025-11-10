# Test Plan: Per-Wing-Type Sauce Assignment System
**Epic**: SP-SAUCE-ASSIGNMENT-001
**Date**: 2025-11-03
**Status**: Ready for Testing
**Tester**: QA Team / Product Owner

---

## Table of Contents
1. [Test Environment Setup](#test-environment-setup)
2. [Unit Test Coverage](#unit-test-coverage)
3. [Component Testing](#component-testing)
4. [Integration Testing](#integration-testing)
5. [User Acceptance Testing](#user-acceptance-testing)
6. [Edge Case Testing](#edge-case-testing)
7. [Regression Testing](#regression-testing)
8. [Performance Testing](#performance-testing)
9. [Test Execution Checklist](#test-execution-checklist)

---

## Test Environment Setup

### Prerequisites
```bash
# 1. Start Firebase emulators
firebase emulators:start --only firestore,hosting,functions

# 2. Verify emulator ports
# Firestore UI: http://localhost:4000
# Hosting: http://localhost:5000

# 3. Run unit tests (should show 27 passing)
npm test -- sauce-assignments-state.test.js
```

### Test Data Requirements
- **10 wing sauces** in Firestore (category !== 'dipping-sauce')
- **4 dipping sauces** in Firestore (category === 'dipping-sauce')
- At least **2 dry rubs** (isDryRub: true)
- Sample platter with wings: boneless (50), bone-in (50), cauliflower (50)

### Browser Testing Matrix
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Mobile Safari (iOS)
- Chrome Mobile (Android)

---

## Unit Test Coverage

### ✅ Story 1: State Service Tests
**File**: `test/sauce-assignments-state.test.js`
**Tests**: 27 total
**Status**: All passing (65ms)

#### Test Categories:
1. **Preset Algorithms** (12 tests)
   - All Same preset: basic, single sauce, three wing types
   - Even Mix preset: perfect division, remainder distribution
   - One Per Wing Type preset: exact match, more wings than sauces, more sauces than wings
   - Custom preset: empty initialization

2. **Validation Functions** (8 tests)
   - Under-assignment detection (50/80 wings)
   - Over-assignment detection (90/80 wings)
   - Perfect assignment validation (80/80 wings)
   - Nearly complete validation (75/80 wings)
   - Zero assignment detection
   - Empty assignment array handling

3. **Summary Calculations** (4 tests)
   - Total wings assigned calculation
   - Application method breakdown
   - Container count calculation
   - Overall validation aggregation

4. **Migration Function** (2 tests)
   - Legacy single sauce conversion
   - Legacy multiple sauces conversion

5. **Integration Test** (1 test)
   - Full workflow: apply preset → validate → summarize

**Run Command**:
```bash
npm test -- sauce-assignments-state.test.js
```

**Expected Output**:
```
✓ should apply "all-same" preset correctly (3 ms)
✓ should apply "even-mix" preset with perfect division (2 ms)
...
Test Suites: 1 passed, 1 total
Tests:       27 passed, 27 total
Time:        65 ms
```

---

## Component Testing

### Test 1: Sauce Preset Selector Component
**File**: `src/components/catering/sauce-preset-selector.js`
**User Story**: SP-SAUCE-STORY-2

#### Test Cases:

##### TC-PSC-001: Initial Render
- **Given**: User navigates to sauce-assignments section with 3 sauces selected
- **When**: Component renders
- **Then**:
  - ✅ Four preset cards displayed (All Same, Even Mix, One Per Wing Type, Custom)
  - ✅ "One Per Wing Type" card is selected by default
  - ✅ Preview text shows correct sauce-to-wing-type mapping
  - ✅ "Apply Preset" button is enabled and visible

##### TC-PSC-002: Preset Selection
- **Given**: Component is rendered
- **When**: User clicks "Even Mix" card
- **Then**:
  - ✅ Card gets selected visual state (orange border, gradient background)
  - ✅ Previous selection deselected
  - ✅ Preview text updates to show even distribution calculation

##### TC-PSC-003: Preview Text Accuracy
- **Given**: Platter with boneless (50), bone-in (30), and 3 sauces
- **When**: "Even Mix" preset is selected
- **Then**:
  - ✅ Preview shows: "Each sauce gets 17 wings (boneless), 10 wings (bone-in)"
  - ✅ Remainder handling is correct (50/3 = 16+17+17, 30/3 = 10+10+10)

##### TC-PSC-004: Apply Preset Action
- **Given**: "All Same" preset is selected
- **When**: User clicks "Apply Preset" button
- **Then**:
  - ✅ State updates with correct appliedPreset value
  - ✅ Assignments object populated correctly
  - ✅ Transition to sauce-assignment-summary component
  - ✅ Console log confirms preset application

##### TC-PSC-005: Skip to Custom
- **Given**: Component is rendered
- **When**: User clicks "Skip to Custom" link
- **Then**:
  - ✅ State updates with appliedPreset: 'custom'
  - ✅ Assignments initialized with empty arrays
  - ✅ Transition to sauce-assignment-summary
  - ✅ User can manually assign from scratch

##### TC-PSC-006: Mobile Responsiveness
- **Given**: Component rendered on mobile device (375px width)
- **When**: User views the screen
- **Then**:
  - ✅ Preset cards stack vertically
  - ✅ All content readable (no overflow)
  - ✅ Touch targets at least 44x44px
  - ✅ "Apply Preset" button full-width

---

### Test 2: Sauce Assignment Summary Component
**File**: `src/components/catering/sauce-assignment-summary.js`
**User Story**: SP-SAUCE-STORY-3

#### Test Cases:

##### TC-SAS-001: Summary Display
- **Given**: Preset applied with 3 wing types and 3 sauces
- **When**: Component renders
- **Then**:
  - ✅ Three wing type sections displayed (boneless, bone-in, cauliflower)
  - ✅ Each section shows total wing count
  - ✅ Assigned sauces listed with wing counts
  - ✅ Application methods displayed correctly (tossed/on-the-side)
  - ✅ "Edit" button visible for each wing type

##### TC-SAS-002: Validation Visual Feedback
- **Given**: Boneless has 45/50 wings assigned
- **When**: Component renders
- **Then**:
  - ✅ Progress bar shows 90% (yellow color)
  - ✅ Validation message: "Assign 5 more wings"
  - ✅ Edit button highlighted or pulsing
  - ✅ Overall validation status shows incomplete

##### TC-SAS-003: Perfect Assignment Display
- **Given**: All wing types have 100% assignment
- **When**: Component renders
- **Then**:
  - ✅ All progress bars green (100%)
  - ✅ Green checkmarks for all wing types
  - ✅ Overall validation: "All wings assigned ✅"
  - ✅ "Continue to Add-ons" button enabled

##### TC-SAS-004: No Sauce Display
- **Given**: Boneless has 50 wings total, 40 assigned to sauces
- **When**: Component renders
- **Then**:
  - ✅ "No Sauce" row displayed with 10 wings
  - ✅ Yellow warning icon visible
  - ✅ Descriptive text: "Served plain (no sauce)"
  - ✅ Row styling distinct from sauce rows

##### TC-SAS-005: Dry Rub Indication
- **Given**: Assignment includes "Lemon Pepper" dry rub
- **When**: Component renders
- **Then**:
  - ✅ Sauce row shows dry rub badge
  - ✅ Application method shows "Tossed (dry rub)" with lock icon
  - ✅ Tooltip explains dry rubs are always tossed

##### TC-SAS-006: Container Count Display
- **Given**: 2 assignments with "on-the-side" method (50 wings each)
- **When**: Component renders
- **Then**:
  - ✅ Container count shown: "25 containers (FREE)"
  - ✅ Formula tooltip: "1 container per 2 wings"
  - ✅ Total containers updated in real-time

##### TC-SAS-007: Edit Wing Type Action
- **Given**: Summary displayed
- **When**: User clicks "Edit" button for boneless
- **Then**:
  - ✅ Modal opens with sauce wing type editor
  - ✅ Current assignments pre-filled
  - ✅ Focus on first editable field
  - ✅ Summary visible in background (dimmed)

##### TC-SAS-008: Reset to Preset Action
- **Given**: User has customized assignments manually
- **When**: User clicks "Reset All to Preset" button
- **Then**:
  - ✅ Confirmation dialog appears
  - ✅ Dialog text: "Reset all assignments to [preset name]?"
  - ✅ On confirm: assignments revert to original preset
  - ✅ Validation re-runs automatically

##### TC-SAS-009: Continue to Add-ons Action
- **Given**: All validations pass (100% assignment)
- **When**: User clicks "Continue to Add-ons" button
- **Then**:
  - ✅ State saved to shared platter service
  - ✅ Transition to "dips" section
  - ✅ Sauce assignments section marked complete
  - ✅ Navigation dot turns green

---

### Test 3: Sauce Wing Type Editor Modal
**File**: `src/components/catering/sauce-wing-type-editor.js`
**User Story**: SP-SAUCE-STORY-4

#### Test Cases:

##### TC-SWE-001: Modal Open Animation
- **Given**: User clicks "Edit" for boneless
- **When**: Modal opens
- **Then**:
  - ✅ Overlay fades in (0.3s transition)
  - ✅ Modal slides up from bottom
  - ✅ Focus trapped inside modal
  - ✅ Body scroll disabled

##### TC-SWE-002: Pre-filled Values
- **Given**: Boneless has 3 sauce assignments (20, 15, 15 wings)
- **When**: Modal opens for boneless
- **Then**:
  - ✅ Three sauce rows displayed with correct names
  - ✅ Wing count inputs show 20, 15, 15
  - ✅ Application method toggles show correct state
  - ✅ Total shows "50 wings assigned"

##### TC-SWE-003: Wing Count Input - Auto Clamp
- **Given**: Modal open for boneless (50 total wings)
- **When**: User types "75" in wing count input
- **Then**:
  - ✅ Value automatically clamped to 50
  - ✅ Input shows "50" (not "75")
  - ✅ No error message needed
  - ✅ Validation updates immediately

##### TC-SWE-004: Wing Count Input - Negative Clamp
- **Given**: Modal open
- **When**: User types "-10" in wing count input
- **Then**:
  - ✅ Value automatically clamped to 0
  - ✅ Assignment removed from array if count = 0
  - ✅ Validation updates

##### TC-SWE-005: Application Method Toggle - Wet Sauce
- **Given**: Modal open with "Buffalo" sauce (wet)
- **When**: User toggles between tossed and on-the-side
- **Then**:
  - ✅ Toggle switches smoothly
  - ✅ Active icon highlighted (orange gradient)
  - ✅ State updates immediately
  - ✅ Container count updates for on-the-side

##### TC-SWE-006: Application Method Toggle - Dry Rub
- **Given**: Modal open with "Lemon Pepper" (dry rub)
- **When**: User views the toggle
- **Then**:
  - ✅ Toggle disabled (grayed out)
  - ✅ Only tossed icon visible
  - ✅ Tooltip: "Dry rubs are always tossed"
  - ✅ Cannot change to on-the-side

##### TC-SWE-007: Live Validation - Under Assignment
- **Given**: Modal open for boneless (50 total)
- **When**: User assigns 45 wings total
- **Then**:
  - ✅ Progress bar shows 90% (yellow)
  - ✅ Validation error: "Assign 5 more wings"
  - ✅ Save button disabled
  - ✅ No sauce row shows "5 wings (plain)"

##### TC-SWE-008: Live Validation - Over Assignment
- **Given**: Modal open for boneless (50 total)
- **When**: User assigns 55 wings total
- **Then**:
  - ✅ Progress bar shows 110% (red)
  - ✅ Validation error: "Remove 5 wings"
  - ✅ Save button disabled
  - ✅ Red error styling on inputs

##### TC-SWE-009: Live Validation - Perfect Assignment
- **Given**: Modal open for boneless (50 total)
- **When**: User assigns exactly 50 wings
- **Then**:
  - ✅ Progress bar shows 100% (green)
  - ✅ Green checkmark icon
  - ✅ Validation message: "All wings assigned ✅"
  - ✅ Save button enabled

##### TC-SWE-010: No Sauce Confirmation - 100% Plain
- **Given**: Modal open with all wing counts set to 0
- **When**: User clicks "Save Changes"
- **Then**:
  - ✅ Confirmation dialog appears
  - ✅ Dialog text: "You have assigned ZERO wings to any sauce. All 50 boneless wings will be served plain (no sauce). Are you sure?"
  - ✅ On Cancel: stays in modal
  - ✅ On Confirm: saves and closes modal

##### TC-SWE-011: No Sauce Confirmation - Partial Assignment (>0%)
- **Given**: Modal open with 25 wings assigned (50% assignment)
- **When**: User clicks "Save Changes"
- **Then**:
  - ✅ No confirmation dialog (partial assignment is OK)
  - ✅ Saves immediately
  - ✅ Modal closes
  - ✅ Summary updates with 25 assigned + 25 no sauce

##### TC-SWE-012: Save Changes Action
- **Given**: Modal open with valid edits (100% assignment)
- **When**: User clicks "Save Changes"
- **Then**:
  - ✅ State updates with new assignments
  - ✅ Modal closes with fade-out animation
  - ✅ Summary component re-renders
  - ✅ Overall validation recalculates

##### TC-SWE-013: Cancel Action
- **Given**: Modal open with unsaved edits
- **When**: User clicks "Cancel"
- **Then**:
  - ✅ Modal closes immediately
  - ✅ No state changes
  - ✅ Summary shows original values
  - ✅ No confirmation needed

##### TC-SWE-014: Click Outside to Close
- **Given**: Modal open
- **When**: User clicks overlay background
- **Then**:
  - ✅ Modal closes (same as Cancel)
  - ✅ No state changes
  - ✅ Body scroll re-enabled

##### TC-SWE-015: Keyboard Navigation
- **Given**: Modal open
- **When**: User presses Tab key
- **Then**:
  - ✅ Focus cycles through: inputs → toggles → buttons
  - ✅ Focus trapped inside modal
  - ✅ Escape key closes modal
  - ✅ Enter key saves (if valid)

---

## Integration Testing

### Test Flow 1: Complete Sauce Assignment Flow
**Scenario**: User creates new shared platter and assigns sauces

#### Steps:
1. **Wing Distribution Screen**
   - ✅ Select boneless (50), bone-in (50), cauliflower (50)
   - ✅ Click "Next"

2. **Sauce Selection Screen**
   - ✅ Select 3 sauces (Buffalo, BBQ, Lemon Pepper)
   - ✅ Section marked complete (green dot)
   - ✅ Click "Next" or navigate to Sauce Assignments

3. **Sauce Preset Selector**
   - ✅ Component renders with 4 preset cards
   - ✅ "One Per Wing Type" is selected by default
   - ✅ Preview shows: "Boneless → Buffalo, Bone-In → BBQ, Cauliflower → Lemon Pepper"
   - ✅ Click "Apply Preset"

4. **Sauce Assignment Summary**
   - ✅ Three sections displayed (boneless, bone-in, cauliflower)
   - ✅ Each section shows 50/50 wings (100% green)
   - ✅ Lemon Pepper shows "Tossed (dry rub)" with lock icon
   - ✅ Buffalo/BBQ show "Tossed" (can toggle)

5. **Edit Wing Type**
   - ✅ Click "Edit" for boneless
   - ✅ Modal opens with Buffalo (50 wings, tossed)
   - ✅ Change Buffalo to 30 wings
   - ✅ Leave 20 wings unassigned (no sauce)
   - ✅ Validation shows 60% (yellow bar)
   - ✅ Click "Cancel" (no changes saved)

6. **Edit Again - Fix Validation**
   - ✅ Click "Edit" for boneless again
   - ✅ Set Buffalo to 50 wings (100%)
   - ✅ Validation green
   - ✅ Click "Save Changes"
   - ✅ Modal closes, summary updates

7. **Continue to Add-ons**
   - ✅ All three wing types show 100% (green)
   - ✅ "Continue to Add-ons" button enabled
   - ✅ Click button
   - ✅ Navigate to "Dips" section
   - ✅ Sauce Assignments section marked complete

**Expected State After Flow**:
```javascript
{
  sauceAssignments: {
    selectedSauces: [/* 3 sauce objects */],
    appliedPreset: 'one-per-type',
    assignments: {
      boneless: [{sauceId: 'buffalo', wingCount: 50, applicationMethod: 'tossed'}],
      boneIn: [{sauceId: 'bbq', wingCount: 50, applicationMethod: 'tossed'}],
      cauliflower: [{sauceId: 'lemon-pepper', wingCount: 50, applicationMethod: 'tossed'}]
    },
    summary: {
      totalWingsAssigned: 150,
      validations: {
        boneless: {valid: true, errors: []},
        boneIn: {valid: true, errors: []},
        cauliflower: {valid: true, errors: []},
        overall: {valid: true, errors: []}
      }
    }
  }
}
```

---

### Test Flow 2: Skip Preset to Custom Assignment
**Scenario**: Advanced user wants full manual control

#### Steps:
1. **Sauce Selection Screen**
   - ✅ Select 5 sauces
   - ✅ Navigate to Sauce Assignments

2. **Sauce Preset Selector**
   - ✅ Click "Skip to Custom" link (bottom of screen)
   - ✅ Immediate transition to summary (no preset applied)

3. **Sauce Assignment Summary - Empty State**
   - ✅ Three wing type sections displayed
   - ✅ All show 0% assignment (red)
   - ✅ Validation errors: "Assign all 50 wings"
   - ✅ "Continue to Add-ons" button disabled

4. **Custom Assignment**
   - ✅ Click "Edit" for boneless
   - ✅ Manually assign: Buffalo (20), BBQ (15), Honey Garlic (15)
   - ✅ Save changes
   - ✅ Repeat for bone-in and cauliflower
   - ✅ All validations turn green

5. **Final State**
   - ✅ appliedPreset: 'custom'
   - ✅ All assignments valid
   - ✅ Can proceed to dips

---

### Test Flow 3: Change Preset Mid-Flow
**Scenario**: User applies preset, then wants to try different preset

#### Steps:
1. **Apply "All Same" Preset**
   - ✅ Buffalo assigned to all three wing types
   - ✅ Each shows 50 wings

2. **Click "Reset All to Preset" Button**
   - ✅ Confirmation dialog appears
   - ✅ Click "Yes, Reset"
   - ✅ Navigate back to preset selector

3. **Apply "Even Mix" Preset**
   - ✅ Buffalo (17), BBQ (17), Honey Garlic (16) for each wing type
   - ✅ All validations green

4. **Verify State**
   - ✅ appliedPreset changed from 'all-same' to 'even-mix'
   - ✅ Previous assignments completely replaced
   - ✅ No residual data from first preset

---

## User Acceptance Testing

### UAT-001: First-Time User Experience
**User**: Restaurant owner with no technical background
**Goal**: Successfully assign sauces to wings

**Acceptance Criteria**:
- ✅ User understands purpose of each screen (clear labels, icons)
- ✅ Preset descriptions are clear and helpful
- ✅ Preview text accurately describes what will happen
- ✅ Validation messages are actionable ("Assign 5 more wings", not "Invalid state")
- ✅ User can complete flow in <3 minutes
- ✅ No confusion about tossed vs on-the-side

**Test Script**:
1. Give user scenario: "Create a shared platter with 150 wings, assign different sauces"
2. Observe user navigation (no assistance)
3. Note confusion points, time to complete
4. Ask user to explain what "Even Mix" preset does
5. Ask user why Lemon Pepper can't be "on-the-side"

**Success Metrics**:
- User completes flow without asking for help
- User understands dry rub restrictions
- User notices and corrects validation errors independently

---

### UAT-002: Advanced User - Custom Assignments
**User**: Catering manager who orders weekly
**Goal**: Create complex custom sauce distribution

**Acceptance Criteria**:
- ✅ User can skip preset screen
- ✅ User can manually assign multiple sauces to one wing type
- ✅ User can intentionally leave wings with no sauce
- ✅ User can switch application methods easily
- ✅ Container count is visible and understood

**Test Script**:
1. User scenario: "Split boneless 50/50 Buffalo tossed and Ranch on-the-side"
2. User should skip preset selector
3. User should use modal to create split assignment
4. Verify user checks container count

---

### UAT-003: Mobile User Experience
**User**: Customer ordering on phone (375px screen)
**Goal**: Complete sauce assignment on mobile

**Acceptance Criteria**:
- ✅ All text readable (no zooming needed)
- ✅ Touch targets ≥44x44px
- ✅ Modal fits screen (no horizontal scroll)
- ✅ Inputs don't trigger zoom on focus (font-size ≥16px)
- ✅ Validation messages visible without scrolling

**Test Script**:
1. Open customization screen on iPhone SE
2. Navigate to sauce assignments
3. Apply preset (finger tap, not stylus)
4. Edit wing type in modal
5. Verify save button reachable without scrolling

---

## Edge Case Testing

### Edge Case 1: Single Wing Type
**Scenario**: User orders boneless only (no bone-in, no cauliflower)

**Test Steps**:
1. Set distribution: boneless (100), bone-in (0), cauliflower (0)
2. Select 3 sauces
3. Apply "Even Mix" preset

**Expected Behavior**:
- ✅ Preset applies to boneless only
- ✅ Bone-in and cauliflower sections not displayed in summary
- ✅ Validation checks only boneless
- ✅ Overall validation considers only active wing types

---

### Edge Case 2: Single Sauce Selected
**Scenario**: User selects only 1 sauce for 3 wing types

**Test Steps**:
1. Select only "Buffalo" sauce
2. Apply "Even Mix" preset

**Expected Behavior**:
- ✅ All wing types get 100% Buffalo
- ✅ No errors or warnings
- ✅ Preview text accurate: "All wings get Buffalo"

---

### Edge Case 3: More Sauces Than Wing Types
**Scenario**: User selects 5 sauces but only has boneless and bone-in

**Test Steps**:
1. Set distribution: boneless (50), bone-in (50), cauliflower (0)
2. Select 5 sauces
3. Apply "One Per Wing Type" preset

**Expected Behavior**:
- ✅ Boneless gets sauce 1, bone-in gets sauce 2
- ✅ Sauces 3-5 are unused (but still in selectedSauces array)
- ✅ User can manually add unused sauces via edit modal

---

### Edge Case 4: Odd Wing Count Distribution
**Scenario**: User has 47 wings, 3 sauces selected

**Test Steps**:
1. Set distribution: boneless (47)
2. Select 3 sauces
3. Apply "Even Mix" preset

**Expected Behavior**:
- ✅ Distribution: 16 + 16 + 15 = 47 wings
- ✅ Remainder (47 % 3 = 2) distributed to first 2 sauces
- ✅ Validation shows 100% (green)

---

### Edge Case 5: Zero Sauces Selected
**Scenario**: User navigates to sauce assignments without selecting sauces

**Test Steps**:
1. Skip sauce selection screen (force navigation)
2. Land on sauce-assignments section

**Expected Behavior**:
- ✅ Preset selector shows empty state
- ✅ Message: "Please select sauces first"
- ✅ Button to go back to sauce selection
- ✅ Cannot apply preset

---

### Edge Case 6: All Dry Rubs Selected
**Scenario**: User selects only dry rubs (Lemon Pepper, Garlic Parmesan, Cajun)

**Test Steps**:
1. Select 3 dry rubs
2. Apply "Even Mix" preset
3. View summary

**Expected Behavior**:
- ✅ All assignments show "Tossed (dry rub)"
- ✅ Application method toggle disabled
- ✅ Container count = 0
- ✅ No on-the-side option available

---

### Edge Case 7: Browser Back Button
**Scenario**: User clicks browser back button mid-flow

**Test Steps**:
1. Apply preset, navigate to summary
2. Click browser back button
3. Re-enter sauce assignments section

**Expected Behavior**:
- ✅ State persists (preset still applied)
- ✅ Summary displayed (not preset selector)
- ✅ All assignments intact
- ✅ Validation state preserved

---

### Edge Case 8: Rapid Input Changes
**Scenario**: User rapidly changes wing count inputs

**Test Steps**:
1. Open modal for boneless
2. Rapidly type numbers in wing count inputs (stress test)
3. Validation should keep up

**Expected Behavior**:
- ✅ Auto-clamp happens in real-time
- ✅ Validation updates smoothly (no lag)
- ✅ Progress bar animates without flicker
- ✅ No state corruption

---

## Regression Testing

### Regression Test 1: Legacy Draft Migration
**Scenario**: User has existing draft with old sauce format

**Test Steps**:
1. Load draft with legacy format:
   ```javascript
   { sauces: ['buffalo', 'bbq', 'ranch'] }
   ```
2. Navigate to sauce assignments section
3. Verify migration to new format

**Expected Behavior**:
- ✅ Migration function auto-applies "One Per Wing Type" preset
- ✅ New format populated correctly
- ✅ User sees summary (not preset selector)
- ✅ All validations pass
- ✅ User can edit normally

**Verification Query**:
```javascript
const state = getState();
console.log(state.currentConfig.sauceAssignments.appliedPreset); // 'one-per-type'
console.log(state.currentConfig.sauceAssignments.assignments); // populated
```

---

### Regression Test 2: Existing Functionality Unaffected
**Goal**: Ensure sauce assignment system doesn't break existing features

**Test Areas**:
1. **Wing Distribution**
   - ✅ Slider still works
   - ✅ Summary calculations correct
   - ✅ Navigation to next section works

2. **Sauce Selection (Legacy)**
   - ✅ Photo cards selectable
   - ✅ Selected sauces displayed
   - ✅ Section completion validation works

3. **Dips Section**
   - ✅ Still accessible after sauce assignments
   - ✅ Dip selection works
   - ✅ No conflicts with sauce assignments

4. **Final Summary**
   - ✅ Pricing calculator includes all selections
   - ✅ Order summary displays sauces correctly
   - ✅ Checkout flow unaffected

---

### Regression Test 3: State Persistence
**Scenario**: User navigates away and back to sauce assignments

**Test Steps**:
1. Apply "Even Mix" preset
2. Navigate to dips section
3. Navigate back to sauce-assignments section
4. Navigate forward to beverages
5. Navigate back to sauce-assignments again

**Expected Behavior**:
- ✅ Applied preset still selected
- ✅ Assignments intact
- ✅ Validation state preserved
- ✅ No data loss or duplication

---

## Performance Testing

### Performance Test 1: Large Dataset Handling
**Scenario**: User selects 10 sauces for 500 wings

**Test Steps**:
1. Set distribution: boneless (200), bone-in (200), cauliflower (100)
2. Select all 10 available sauces
3. Apply "Even Mix" preset
4. Measure time to render summary

**Acceptance Criteria**:
- ✅ Preset calculation completes in <100ms
- ✅ Summary renders in <200ms
- ✅ Modal opens in <300ms
- ✅ No UI freezing or lag

**Measurement**:
```javascript
console.time('preset-apply');
applyPreset('even-mix');
console.timeEnd('preset-apply'); // Should be <100ms
```

---

### Performance Test 2: Validation Performance
**Scenario**: Real-time validation during rapid input

**Test Steps**:
1. Open modal with 10 sauce rows
2. Rapidly change wing counts (10 inputs in 5 seconds)
3. Monitor validation updates

**Acceptance Criteria**:
- ✅ Validation updates within 50ms of input change
- ✅ Progress bar animates smoothly (60fps)
- ✅ No input lag or delayed feedback
- ✅ Browser console shows no performance warnings

---

### Performance Test 3: Modal Animation Smoothness
**Scenario**: Open and close modal repeatedly

**Test Steps**:
1. Open modal (overlay fade + slide up)
2. Close modal immediately
3. Repeat 10 times rapidly

**Acceptance Criteria**:
- ✅ Animations complete without stutter
- ✅ No animation glitches or flashes
- ✅ Focus management works correctly
- ✅ Memory usage stable (no leaks)

---

## Test Execution Checklist

### Pre-Testing Setup
- [ ] Firebase emulators running on correct ports
- [ ] Test data seeded (10 sauces + 4 dips)
- [ ] Browser DevTools open (Console + Network tabs)
- [ ] Unit tests passing (27/27)
- [ ] Git branch: `catering` (clean state)

### Component Tests
- [ ] TC-PSC-001 to TC-PSC-006 (Preset Selector) - 6 tests
- [ ] TC-SAS-001 to TC-SAS-009 (Summary) - 9 tests
- [ ] TC-SWE-001 to TC-SWE-015 (Modal Editor) - 15 tests

### Integration Tests
- [ ] Test Flow 1: Complete sauce assignment flow
- [ ] Test Flow 2: Skip preset to custom
- [ ] Test Flow 3: Change preset mid-flow

### User Acceptance Tests
- [ ] UAT-001: First-time user experience
- [ ] UAT-002: Advanced user - custom assignments
- [ ] UAT-003: Mobile user experience

### Edge Case Tests
- [ ] Edge Case 1: Single wing type
- [ ] Edge Case 2: Single sauce selected
- [ ] Edge Case 3: More sauces than wing types
- [ ] Edge Case 4: Odd wing count distribution
- [ ] Edge Case 5: Zero sauces selected
- [ ] Edge Case 6: All dry rubs selected
- [ ] Edge Case 7: Browser back button
- [ ] Edge Case 8: Rapid input changes

### Regression Tests
- [ ] Regression Test 1: Legacy draft migration
- [ ] Regression Test 2: Existing functionality unaffected
- [ ] Regression Test 3: State persistence

### Performance Tests
- [ ] Performance Test 1: Large dataset handling
- [ ] Performance Test 2: Validation performance
- [ ] Performance Test 3: Modal animation smoothness

### Cross-Browser Testing
- [ ] Chrome (desktop + mobile)
- [ ] Firefox (desktop)
- [ ] Safari (desktop + iOS)
- [ ] Edge (desktop)

### Sign-Off
- [ ] All critical tests passing
- [ ] No P0/P1 bugs found
- [ ] Performance benchmarks met
- [ ] UAT feedback positive
- [ ] Ready for production deployment

---

## Bug Reporting Template

```markdown
**Bug ID**: BUG-SA-XXX
**Severity**: P0 (Critical) / P1 (High) / P2 (Medium) / P3 (Low)
**Component**: [Preset Selector / Summary / Modal Editor / State Service]
**Test Case**: TC-XXX-XXX

**Description**:
[What went wrong]

**Steps to Reproduce**:
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Behavior**:
[What should happen]

**Actual Behavior**:
[What actually happened]

**Screenshots/Video**:
[Attach if applicable]

**Console Errors**:
```javascript
[Paste any console errors]
```

**Environment**:
- Browser: [Chrome 120.0]
- OS: [macOS 14.1]
- Screen Size: [1920x1080]
- Emulator Port: [5002]

**Suggested Fix**:
[If known]
```

---

## Test Metrics & Success Criteria

### Unit Test Coverage
- ✅ **Target**: 27/27 tests passing (100%)
- ✅ **Actual**: 27/27 passing in 65ms
- ✅ **Code Coverage**: State service functions covered

### Component Test Coverage
- **Target**: 30/30 test cases passing (100%)
- **Critical Path**: All TC-*-001 tests must pass (initial render)
- **User Journey**: All integration flows must pass (3/3)

### Performance Benchmarks
- **Preset Application**: <100ms
- **Summary Render**: <200ms
- **Modal Open**: <300ms
- **Validation Update**: <50ms
- **Animation Frame Rate**: 60fps

### User Acceptance
- **Task Completion**: 90% of users complete flow without help
- **Time to Complete**: <3 minutes for standard flow
- **Error Recovery**: Users fix validation errors independently
- **Mobile Usability**: 100% of touch targets ≥44px

### Regression Criteria
- **Zero Breaking Changes**: All existing features work
- **Legacy Migration**: 100% success rate
- **State Persistence**: No data loss across navigation

---

## Sign-Off

**QA Lead**: _________________ Date: _______
**Product Owner**: _________________ Date: _______
**Engineering Lead**: _________________ Date: _______

---

**Next Steps After Testing**:
1. Address any P0/P1 bugs found
2. Update neural entity with test results
3. Create production deployment PR
4. Schedule user training/documentation review
5. Plan post-deployment monitoring
