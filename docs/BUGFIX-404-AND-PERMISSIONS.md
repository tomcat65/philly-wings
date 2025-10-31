# Bug Fixes: 404 Error and Firestore Permissions

**Date**: 2025-10-27
**Status**: ✅ Fixed
**Impact**: Users blocked at platter customization start

## Problem

User reported console errors preventing progression:

```
package-default.webp:1 Failed to load resource: the server responded with a status of 404 (Not Found)
template-selector.js:244 Error fetching templates: FirebaseError: Missing or insufficient permissions.
```

## Root Causes

### Issue 1: Missing heroImage in Package Data

**Problem**: Preview Anchor Screen expects `selectedPackage.heroImage` but Firestore packages use `imageUrl`

**Files Affected**:
- `/src/services/catering-service.js` - normalizePackageRecord()
- `/src/components/catering/preview-anchor-screen.js` - line 55
- `/scripts/seed-catering-data.js` - packages have `imageUrl` not `heroImage`

**Why it happened**:
- Seed data has `imageUrl: 'catering/lunch-box-special.webp'`
- Service normalization only checked `pkg.heroImage`
- Fallback to `/images/placeholders/package-default.webp` which doesn't exist

### Issue 2: Firestore Rules Typo

**Problem**: Code queries `boxedMealTemplates` but Firestore rules only had `boxedMealsTemplates` (with 's')

**Files Affected**:
- `/firestore.rules` - line 221 (only had boxedMealsTemplates)
- `/src/components/catering/template-selector.js` - line 236 (uses boxedMealTemplates)

**Why it happened**:
- Inconsistent naming between code and rules
- Rules file had `boxedMealsTemplates` (plural "Meals")
- Code queries `boxedMealTemplates` (singular "Meal")

## Solutions

### Fix 1: Update heroImage Fallback Chain

**File**: `/src/services/catering-service.js:41`

**Before**:
```javascript
heroImage: pkg.heroImage || '/images/placeholders/package-default.webp'
```

**After**:
```javascript
heroImage: pkg.heroImage || pkg.imageUrl || '/images/placeholders/package-default.webp'
```

**Impact**: Now checks both `heroImage` AND `imageUrl` before falling back to placeholder

### Fix 2: Add Missing Firestore Rule

**File**: `/firestore.rules:226-230`

**Added**:
```javascript
// Boxed meal templates (alternate spelling) - public read, admin write
match /boxedMealTemplates/{templateId} {
  allow read: if true; // Public for boxed meals configurator
  allow write: if isAdmin(); // Only admins can modify templates
}
```

**Impact**: Allows both spellings to work (backward compatible)

## Testing

### Verified Fixes

1. ✅ Build completes without errors
2. ✅ Emulators start successfully
3. ✅ Firestore rules deployed to emulator
4. ✅ No more 404 errors for package images
5. ✅ Template selector can read from Firestore

### Test URLs

**Catering Flow**:
- Local: http://127.0.0.1:5003/catering.html

**Emulator UI**:
- Firestore: http://127.0.0.1:4002/firestore
- Functions: http://127.0.0.1:4002/functions

## Prevention

### Future Best Practices

1. **Consistent Field Names**: Use same field names in seed data, TypeScript types, and service normalization
2. **Firestore Rule Coverage**: Add rules for both singular/plural collection names during development
3. **Placeholder Images**: Create actual placeholder images in `/public/images/placeholders/`
4. **Fallback Chain**: Always check multiple field name variations (heroImage, imageUrl, image)

### Recommended Next Steps

1. **Create Placeholder Images**:
   ```bash
   mkdir -p public/images/placeholders
   # Add package-default.webp, addon-default.webp
   ```

2. **Standardize Field Names**:
   - Decide: `imageUrl` vs `heroImage`
   - Update TypeScript types
   - Update seed scripts
   - Update service normalizers

3. **Audit Firestore Rules**:
   - Check all collection names match code
   - Add rules for any missing collections
   - Test with emulator before deploying to production

## Related Files

- `/src/services/catering-service.js` (normalizePackageRecord)
- `/src/components/catering/preview-anchor-screen.js` (image display)
- `/src/components/catering/template-selector.js` (Firestore query)
- `/firestore.rules` (security rules)
- `/scripts/seed-catering-data.js` (seed data structure)

## Conclusion

Both blocking errors have been fixed:

1. **404 Error**: Fixed by adding `pkg.imageUrl` to fallback chain
2. **Permission Error**: Fixed by adding Firestore rule for `boxedMealTemplates` collection

Users can now proceed past the platter customization start screen without console errors.

**Status**: Ready for testing with emulators running on:
- Hosting: http://127.0.0.1:5003
- Functions: http://127.0.0.1:5002
- Firestore: http://127.0.0.1:8081
