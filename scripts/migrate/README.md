# FDA-Compliant Nutrition Data Import

This directory contains scripts and data for importing FDA 2020-compliant nutrition information to the Firestore `nutritionData` collection.

## Files

- **`nutrition-data-json.js`** - Complete nutrition data in FDA-compliant format
- **`import-nutrition.js`** - Firebase Admin script to import data
- **`add-nutrition-data.js`** - Alternative import script with validation

## Quick Import Options

### Option 1: Firebase Console (Manual)
1. Open Firebase Console → Firestore Database
2. Create collection `nutritionData` if it doesn't exist
3. For each item in `nutrition-data-json.js`:
   - Click "Add document"
   - Use the item's `id` as Document ID
   - Copy the item data as fields

### Option 2: Firebase CLI
```bash
# Export data to JSON file first
node -e "
import('./nutrition-data-json.js').then(m => {
  console.log(JSON.stringify(m.nutritionDataForFirestore, null, 2));
}).catch(console.error);
" > nutrition-data.json

# Import to Firestore
firebase firestore:import nutrition-data.json --collection-path nutritionData
```

### Option 3: Node.js Script
```bash
# Install dependencies
npm install firebase-admin

# Set Firebase project ID
export FIREBASE_PROJECT_ID="your-project-id"

# Run import script
node scripts/migrate/import-nutrition.js
```

## FDA Compliance Features

All nutrition data includes:

### 🥗 **FDA 2020 Requirements**
- ✅ Added sugars with %DV
- ✅ Vitamin D in mcg with %DV
- ✅ Potassium in mg with %DV
- ✅ Proper serving sizes (4 wings = 120g base)
- ✅ FDA rounding rules applied

### 🚨 **Allergen Management**
- ✅ Big 9 allergen declarations
- ✅ Cross-contact warnings
- ✅ "May contain" statements
- ✅ Supplier verification tracking

### 📊 **Data Structure**
- ✅ Comprehensive nutrient profiles
- ✅ Daily value calculations
- ✅ Compliance audit trails
- ✅ Marketing claims validation
- ✅ Menu categorization

## Items Included

### Wings (Based on 4-wing/120g serving)
- **6 Wings** (1.5 servings) - 540 calories
- **12 Wings** (3 servings) - 1,080 calories
- **24 Wings** (6 servings) - 2,160 calories
- **30 Wings** (7.5 servings) - 2,700 calories
- **50 Wings** (12.5 servings) - 4,500 calories

### Sides
- **Loaded Fries** - 680 calories
- **Mozzarella Sticks** (6) - 540 calories
- **French Fries** (medium) - 380 calories

### Combos
- **The Tailgater** - 2,580 calories (serves 3-4)
- **MVP Meal** - 1,460 calories (single serving)
- **Sampler Platter** - 1,760 calories (serves 2-3)

## Validation

All data has been validated for:
- Required FDA fields
- Proper serving sizes
- Allergen completeness
- Daily value calculations
- Cross-contact warnings

## Next Steps After Import

1. **Verify in Firebase Console** - Check that all documents imported correctly
2. **Update Components** - Modify nutrition modal to use new data structure
3. **Test Display** - Ensure nutrition facts render properly on website
4. **Compliance Review** - Schedule quarterly nutrition data audits
5. **Staff Training** - Brief team on allergen procedures and nutrition claims

## Compliance Notes

⚠️ **Important**: This nutrition data is estimated based on standard ingredients and preparation methods. For legal compliance:

- Conduct third-party lab testing annually
- Maintain supplier allergen certificates
- Document all recipe changes
- Train staff on allergen protocols
- Review data quarterly for accuracy

For questions about FDA compliance, consult with a qualified food labeling expert.