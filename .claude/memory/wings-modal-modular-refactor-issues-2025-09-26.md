# Wings Modal Modular Refactor - Current Issues & Status

**Date**: September 26, 2025
**Context**: Transitioning from monolithic JavaScript to modular architecture

## Current Problem Summary

The wings modal was successfully moved to a modular architecture, but several critical features were lost or incomplete during the transition:

### ❌ Issues Identified:

1. **"On the Side" Sauce Selection MISSING**
   - User complaint: "lost the on the side selection for the sauces"
   - Critical functionality for signature sauces
   - Was present in backup file but removed during simplification

2. **Order Summary Appearing Early**
   - Shows "Order Summary" section even on step 2
   - Should only appear at final step (5 for boneless, 6 for bone-in)
   - Screenshot evidence: `/home/tomcat65/projects/dev/philly-wings/screenshots/wings-modal-2-step.png`

3. **Incomplete Modular Implementation**
   - Several functions still have placeholder implementations
   - Missing wing allocation feedback
   - Missing complete dip selection
   - Missing wing style selection

### ✅ Progress Made:

1. **JavaScript Syntax Fixed**
   - Template literal escaping issues resolved
   - `generateWingVariants` function added
   - No more ReferenceError issues

2. **Sauce Selection Restored**
   - Complete sauce categorization (dry rubs vs signature sauces)
   - Heat level display with emojis
   - Sauce selection limits working
   - `toggleSauceSelection` function implemented

3. **Architecture Transition**
   - Using modular: `/functions/lib/platforms/doordash/javascript-modular.js`
   - Wings modal: `/functions/lib/platforms/doordash/modules/wings-modal-complete.js`
   - Clean separation achieved

## Files Involved

### Current Active Files:
- `/functions/lib/platforms/doordash/index.js` - Using `javascript-modular.js`
- `/functions/lib/platforms/doordash/javascript-modular.js` - Main modular coordinator
- `/functions/lib/platforms/doordash/modules/wings-modal-complete.js` - Wings modal implementation

### Reference Files (Complete Implementations):
- `/functions/lib-backup-20250926-165529/platforms/doordash/javascript.js` - Original working version
- `/functions/lib/platforms/doordash/javascript-backup-complete.js` - Another backup

## Missing Functionality from Backup

### "On the Side" Toggle (lines 1177-1200 in backup):
```javascript
// Add "on the side" toggle for signature sauces only (not dry rubs)
(!isDryRub ?
  '<div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #eee;">' +
    '<label class="on-side-toggle-container">' +
      '<span>🥄 On the Side (1.5oz)</span>' +
      '<input type="checkbox" onchange="toggleOnSide(\\'' + sauce.id + '\\', this.checked)">' +
    '</label>' +
  '</div>'
: '')
```

### Wing Allocation System:
- Advanced wing distribution for 12+ wings with multiple sauces
- Visual allocation feedback
- Allocation adjustment controls

### Complete Step Implementations:
- `populateIncludedDipSelection()` - Still placeholder
- `populateWingStyleSelection()` - Still placeholder
- `populateExtraDipSelection()` - Still placeholder

## Immediate Next Steps

1. **Restore "On the Side" Functionality**
   - Extract complete sauce selection from backup
   - Add `toggleOnSide` function
   - Restore sauce preference tracking

2. **Debug Order Summary Early Appearance**
   - Investigate CSS specificity issues
   - Check if all modal steps are showing simultaneously
   - Verify JavaScript step navigation logic

3. **Complete Remaining Placeholder Functions**
   - Extract from backup: `populateIncludedDipSelection`
   - Extract from backup: `populateWingStyleSelection`
   - Extract from backup: `populateExtraDipSelection`

4. **Test Complete Flow**
   - Verify all 6 steps work properly
   - Ensure order summary only shows at end
   - Test wing allocation for large orders

## User Feedback

- "lost the on the side selection for the sauces. This is frustrating"
- Requested memory update and continue conversation setup for next session
- User wants complete functionality restored while maintaining modular architecture

## Architecture Goal

Maintain clean modular structure while preserving ALL functionality from the original monolithic implementation. The modular approach should enhance maintainability without sacrificing features.