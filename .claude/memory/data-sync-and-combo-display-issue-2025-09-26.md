# Data Sync and Combo Display Issue - 2025-09-26

## Current Status
**Issue**: After reverting to last working commit and syncing production data, combo section shows generic images and missing combo details.

## What We Discovered
1. **Git Revert Successful**: Wings functionality restored and working properly
2. **Production Data Sync Completed**: Successfully synced all collections from production to emulator
3. **Root Problem Identified**: Production combo data is incomplete

### Production Combo Data Structure (Current)
```json
{
  "active": true,
  "badges": ["Most Popular", "Feeds 5-6"],
  "basePrice": 42.99,
  "computedNutrition": {
    "allergens": {...},
    "breakdown": {...}
  }
}
```

### Missing Required Fields for Display
- `name` (combo title)
- `description` (combo details)
- `imageUrl` (specific combo image)
- `platformPricing` (platform-specific prices)

## Current Working State
✅ **Firebase Functions**: Running on port 5002
✅ **Wings Ordering**: Fully functional after revert
✅ **Data Sync**: Production data successfully copied to emulator
✅ **Beverages & Sauces**: Working with real production data
❌ **Combos Display**: Shows generic fallback image and no names/descriptions

## Backups Created
- `functions/lib-backup-20250926-165529/` - Complete lib directory backup
- `functions/js-backup-20250926-165656/` - Individual JS files backup
- Contains enhanced sides modal functionality to potentially restore later

## Next Steps
1. **Add missing fields** to production combo data:
   - `name`: "30 Wings Family Pack" (or appropriate name)
   - `description`: Detailed combo description
   - `imageUrl`: Specific Firebase Storage URL for combo image
   - `platformPricing`: DoorDash/UberEats/GrubHub pricing

2. **Alternative**: Check if complete combo data exists in different collection

3. **Restore sides enhancements** from backup once combo issue resolved

## Firebase MCP Status
- User reports Firebase MCP disconnected
- Need to reconnect Firebase MCP tools for easier data manipulation