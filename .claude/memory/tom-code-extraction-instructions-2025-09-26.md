# Code Extraction Instructions for Tom - Wings Modal Refactoring
**Date**: September 26, 2025
**Priority**: CRITICAL - Wings Modal Missing Key Functionality

## 🎯 OBJECTIVE
Extract specific code snippets from backup files to restore missing "on the side" sauce functionality in our modular wings modal WITHOUT returning to huge monolithic files.

## 📁 FILE STRUCTURE

### Working Files (MODULAR - Keep These):
- **Main Coordinator**: `/functions/lib/platforms/doordash/javascript-modular.js` (185 lines)
- **Wings Modal**: `/functions/lib/platforms/doordash/modules/wings-modal-complete.js` (431 lines)
- **Index Router**: `/functions/lib/platforms/doordash/index.js`

### Backup Source Files (Extract From These):
- **Complete Backup**: `/functions/lib-backup-20250926-165529/platforms/doordash/javascript.js` (1883 lines)
- **Alternative Source**: `/functions/lib/platforms/doordash/javascript-backup-complete.js`

## 🚨 CRITICAL MISSING FUNCTIONALITY

### 1. "On the Side" Sauce Selection (Lines 1177-1190 in backup)
**What's Missing**: Toggle for signature sauces to order "on the side" (1.5oz cups)

**Extract This Code Block**:
```javascript
// Add "on the side" toggle for signature sauces only (not dry rubs) - ALWAYS VISIBLE
(!isDryRub ?
  '<div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #eee; opacity: ' + (isSelected ? '1' : '0.6') + ';">' +
    '<label class="on-side-toggle-container" style="display: flex; align-items: center; justify-content: space-between; font-size: 12px; color: #666; cursor: ' + (isSelected ? 'pointer' : 'not-allowed') + ';" onclick="' + (isSelected ? 'event.stopPropagation();' : 'event.stopPropagation(); alert(\\'Please select this sauce first to enable \\\"On the Side\\\" option\\');') + '">' +
      '<span class="toggle-label" style="font-size: 11px; color: ' + (isSelected ? '#888' : '#bbb') + '; font-weight: ' + (isSelected ? 'normal' : 'bold') + ';">🥄 On the Side (1.5oz)</span>' +
      '<div style="display: flex; align-items: center; gap: 8px;">' +
        '<input type="checkbox" class="on-side-toggle" ' + (isOnSide && isSelected ? 'checked' : '') + ' ' + (isSelected ? '' : 'disabled') + ' onchange="' + (isSelected ? 'toggleOnSide(\\'' + sauce.id + '\\', this.checked)' : '') + '" style="display: none;">' +
        '<span class="toggle-slider" style="position: relative; display: inline-block; width: 30px; height: 16px; background-color: ' + (isOnSide && isSelected ? '#ff6b35' : isSelected ? '#ccc' : '#eee') + '; border-radius: 16px; transition: 0.3s; cursor: ' + (isSelected ? 'pointer' : 'not-allowed') + '; border: ' + (isSelected ? 'none' : '1px solid #ddd') + ';" onclick="' + (isSelected ? 'this.previousElementSibling.click();' : 'alert(\\'Please select this sauce first to enable \\\"On the Side\\\" option\\');') + '">' +
          '<span style="position: absolute; content: \\'\\'; height: 12px; width: 12px; left: ' + (isOnSide && isSelected ? '16px' : '2px') + '; bottom: 2px; background-color: ' + (isSelected ? 'white' : '#f5f5f5') + '; transition: 0.3s; border-radius: 50%; border: ' + (isSelected ? 'none' : '1px solid #ddd') + ';"></span>' +
        '</span>' +
      '</div>' +
    '</label>' +
  '</div>'
: '')
```

### 2. toggleOnSide Function (Found via grep in backup)
**Extract This Function**:
```javascript
window.toggleOnSide = function(sauceId, isOnSide) {
  // Ensure sauce preferences object exists
  if (!saucePreferences[sauceId]) {
    saucePreferences[sauceId] = { selected: false, onSide: false };
  }
  // Update the preference
  saucePreferences[sauceId].onSide = isOnSide;
  // Log for debugging
  console.log('Toggled sauce preference:', {
    sauceId: sauceId,
    onSide: isOnSide,
    allPreferences: saucePreferences
  });
  // Re-render the sauce selection to update the toggle slider display
  populateSauceSelection();
};
```

### 3. saucePreferences Variable Declaration
**Add This Variable** (found in backup):
```javascript
let saucePreferences = {};
```

### 4. Variable References in Sauce Loop
**Look for these variables in the backup sauce rendering loop**:
- `isOnSide` - Extract how this is calculated
- Logic for checking `saucePreferences[sauce.id]?.onSide`

## 🔧 IMPLEMENTATION STEPS

### Step 1: Add Missing Variable
In `/functions/lib/platforms/doordash/modules/wings-modal-complete.js`:
```javascript
// Add this with other wing modal variables (around line 15)
let saucePreferences = {};
```

### Step 2: Reset in Modal Initialization
In the `openWingModal` function, add:
```javascript
saucePreferences = {}; // Reset sauce preferences
```

### Step 3: Update Sauce Rendering Loop
In the `populateSauceSelection` function (around line 355), within the sauce mapping:
```javascript
// Add these variable calculations before the return statement:
const isOnSide = saucePreferences[sauce.id]?.onSide || false;

// Then add the "on the side" toggle HTML block after the heat display div
```

### Step 4: Add toggleOnSide Function
Add the `toggleOnSide` function after the `populateSauceSelection` function.

### Step 5: Update toggleSauceSelection Function
Ensure it initializes sauce preferences when selecting sauces:
```javascript
// In toggleSauceSelection function, when adding a sauce:
if (!saucePreferences[sauceId]) {
  saucePreferences[sauceId] = { selected: true, onSide: false };
} else {
  saucePreferences[sauceId].selected = true;
}
```

## 🚫 WHAT TO AVOID

### DON'T:
- Copy entire functions from backup (they're too large)
- Revert to monolithic files
- Copy code without understanding the variable dependencies
- Add new files - work within existing modular structure

### DO:
- Extract specific code snippets only
- Verify variable dependencies before copying
- Test each addition incrementally
- Keep the modular architecture clean

## 🎯 SUCCESS CRITERIA

### After Implementation, User Should See:
1. ✅ **Sauce Selection**: All sauces display with heat levels
2. ✅ **"On the Side" Toggle**: Visible for signature sauces (not dry rubs)
3. ✅ **Toggle Functionality**: Can enable/disable "on the side" for selected sauces
4. ✅ **Visual Feedback**: Toggle slider changes color/position when enabled
5. ✅ **Order Summary**: Only appears at final step (not step 2)

### Test Cases:
1. Select a signature sauce → "On the side" toggle should appear
2. Select a dry rub → No "on the side" toggle
3. Toggle "on the side" → Slider should animate and state should persist
4. Deselect sauce → "On the side" toggle should become disabled

## 📍 FILE LOCATIONS TO MODIFY

**Primary Target**: `/functions/lib/platforms/doordash/modules/wings-modal-complete.js`

**Lines to Focus On**:
- Line ~15: Add `saucePreferences` variable
- Line ~50: Reset in `openWingModal`
- Line ~355-400: Update sauce rendering in `populateSauceSelection`
- Line ~420+: Add `toggleOnSide` function
- Line ~250: Update `toggleSauceSelection` function

## ⚠️ DEBUGGING NOTES

### Current Issues:
1. **Order Summary Early**: Appears in step 2 instead of final step
2. **Missing Variables**: `isOnSide` not defined in current modular code
3. **Missing Function**: `toggleOnSide` function doesn't exist

### Console Errors to Fix:
- `ReferenceError: toggleOnSide is not defined`
- Missing sauce preference tracking

## 🎉 EXPECTED RESULT
Wings modal with complete "on the side" functionality while maintaining clean modular architecture (431 lines vs original 1883 lines).