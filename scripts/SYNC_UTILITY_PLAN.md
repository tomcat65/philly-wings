# CateringAddOns Sync Utility - Design Specification

## Purpose

Maintain consistency of denormalized fields in `cateringAddOns` collection when source data changes in origin collections (`desserts`, `menuItems`, `coldSides`, `freshSalads`).

## Scope

### Denormalized Fields to Sync
These "stable" fields are duplicated for performance and must stay in sync:
- `name` - Display name
- `basePrice` - Base pricing (before platform markup)
- `imageUrl` - Product image reference
- `allergens` - Array of allergen strings
- `dietaryTags` - Array of dietary classification tags
- `description` - Product description text

### Timestamp Fields for Tracking
- `sourceLastUpdated` - ISO timestamp from source document's last update
- `lastSyncedAt` - ISO timestamp when sync utility last ran

### Out of Scope
Fields NOT synced (managed only in cateringAddOns):
- `category`, `packSize`, `availableForTiers`, `displayOrder` - Organization fields
- `sourceCollection`, `sourceDocumentId`, `sourceVariantId` - Source pointer fields
- `platformPricing`, `active`, `marketingCopy` - Catering-specific fields
- `servings`, `quantityMultiplier`, `suggestedQuantities` - Pack-specific fields

## Architecture

### Data Flow
```
Source Collections           cateringAddOns
┌─────────────────┐         ┌──────────────────┐
│ desserts        │────────>│ Reference Docs   │
│ menuItems       │  Sync   │ - sourcePointers │
│ coldSides       │ ──────> │ - denormalized   │
│ freshSalads     │         │   fields         │
└─────────────────┘         └──────────────────┘
```

### Source Pointer Pattern
Each cateringAddOn with source pointers contains:
```javascript
{
  sourceCollection: "desserts",
  sourceDocumentId: "marble_pound_cake",
  sourceVariantId: "marble_pound_cake_slice" // optional
}
```

### Sync Logic
1. Query all `cateringAddOns` where `sourceCollection` exists
2. For each add-on:
   - Fetch source document from `{sourceCollection}/{sourceDocumentId}`
   - If `sourceVariantId` exists, extract variant data from `variants` array
   - Compare `sourceLastUpdated` timestamp
   - If source is newer, update denormalized fields
   - Update `lastSyncedAt` timestamp

## Implementation Options

### Option A: Manual CLI Script (RECOMMENDED for MVP)
**Pros:**
- Simple to implement and test
- Full control over when sync runs
- Easy to verify changes before deployment
- Low complexity, low risk

**Cons:**
- Requires manual execution
- Potential for human error (forgetting to run)
- No automatic detection of source changes

**Implementation:**
```bash
node scripts/sync-catering-addons.js
```

### Option B: Cloud Function Trigger (Future Enhancement)
**Pros:**
- Automatic sync on source data changes
- Zero manual intervention
- Always up-to-date

**Cons:**
- Higher complexity
- Multiple triggers needed (one per source collection)
- Potential for circular updates
- Higher Firebase costs

**Implementation:**
```javascript
exports.syncCateringAddOnsOnDessertUpdate = functions.firestore
  .document('desserts/{docId}')
  .onUpdate(async (change, context) => {
    // Find affected cateringAddOns
    // Update denormalized fields
  });
```

### Option C: Scheduled Function (Future Enhancement)
**Pros:**
- Periodic automatic sync
- Lower cost than triggers
- Catches all changes in batch

**Cons:**
- Delay between source update and sync
- May update unchanged items
- Still requires monitoring

**Implementation:**
```javascript
exports.scheduledCateringAddOnsSync = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    // Sync all items with source pointers
  });
```

## Recommended Approach: Phased Implementation

### Phase 1: Manual Sync Script (Immediate)
Create `scripts/sync-catering-addons.js` with:
- Dry-run mode (preview changes)
- Detailed logging (what changed, why)
- Batch updates for efficiency
- Error handling and rollback

### Phase 2: Monitoring & Alerts (Near-term)
- Add dashboard query to detect stale data
- Alert when `sourceLastUpdated > lastSyncedAt` for X days
- Include sync status in admin tools

### Phase 3: Automation (Future)
- Implement Cloud Function triggers or scheduled sync
- Only after manual sync proves reliable
- Consider cost/benefit of real-time vs scheduled

## Script Specification: `sync-catering-addons.js`

### Command-line Interface
```bash
# Dry run (preview changes only)
node scripts/sync-catering-addons.js --dry-run

# Sync all items
node scripts/sync-catering-addons.js

# Sync specific category
node scripts/sync-catering-addons.js --category=desserts

# Force sync even if timestamps match
node scripts/sync-catering-addons.js --force
```

### Algorithm
```
1. Get all cateringAddOns with sourceCollection != null
2. Group by sourceCollection for efficient queries
3. For each add-on:
   a. Fetch source document
   b. If sourceVariantId exists:
      - Find variant in source.variants array
      - Extract variant-specific fields
   c. Else:
      - Use top-level source fields
   d. Compare denormalized fields:
      - name, basePrice, imageUrl, allergens, dietaryTags, description
   e. If any field differs OR --force flag:
      - Log changes (field, old value, new value)
      - Queue update in batch
   f. Update lastSyncedAt timestamp
4. Execute batch update
5. Report summary (X items checked, Y updated, Z errors)
```

### Error Handling
- **Source document not found**: Log warning, skip sync, flag for review
- **Variant not found**: Log error, skip sync, flag for review
- **Batch write fails**: Rollback, log error, exit with error code
- **Network/Firestore errors**: Retry with exponential backoff

### Output Format
```
🔄 Syncing cateringAddOns from source collections...

Checking 18 items with source pointers...

✅ marble-pound-cake-individual - No changes
✅ gourmet-brownies-5pack - No changes
⚠️  boxed-iced-tea-96oz - UPDATES NEEDED:
    - basePrice: 8.99 → 9.49 (+0.50)
    - name: "Boxed Iced Tea (96oz)" → "Premium Iced Tea (96oz)"

🎉 Sync Summary:
   - 18 items checked
   - 16 items up-to-date
   - 2 items updated
   - 0 errors

Updated platformPricing based on new basePrices (ezCater +20%)
```

## Data Integrity Safeguards

### Before Sync
1. Create backup: `node scripts/backup-catering-addons.js`
2. Run in dry-run mode first
3. Review changes carefully

### During Sync
1. Use Firestore batch operations (atomic updates)
2. Validate source data before copying
3. Preserve non-synced fields exactly

### After Sync
1. Run verification: `node test-catering-addons.js`
2. Compare backup to updated data
3. Manual spot-check in Firebase Console

## Maintenance Workflow

### When Source Data Changes
1. Update source collection (desserts, menuItems, etc.)
2. Run backup: `node scripts/backup-catering-addons.js`
3. Run sync (dry-run): `node scripts/sync-catering-addons.js --dry-run`
4. Review changes in output
5. Run sync (live): `node scripts/sync-catering-addons.js`
6. Verify: `node test-catering-addons.js`
7. Test in emulator
8. Deploy if needed

### Regular Maintenance
- Weekly: Check for drift (`sourceLastUpdated > lastSyncedAt`)
- Monthly: Full sync verification
- Quarterly: Review automation opportunity

## Future Enhancements

### Smart Sync
- Only sync if source timestamp is newer
- Track which fields changed for detailed audit trail
- Support bulk source updates with single cateringAddOns sync

### Validation Rules
- Ensure basePrice > 0
- Validate imageUrl format
- Check allergens against approved list
- Verify dietaryTags against taxonomy

### Admin Dashboard
- Visual diff of changes before sync
- One-click sync from admin UI
- Sync history and audit log
- Alerts for stale data (> 7 days out of sync)

## Cost Considerations

### Manual Script
- **Reads**: ~40 reads per sync (18 cateringAddOns + 18 source docs)
- **Writes**: Variable (only items that changed)
- **Cost**: ~$0.001 per sync
- **Frequency**: On-demand (maybe 2-4x per month)

### Cloud Function Triggers
- **Reads**: 2 reads per source update (get cateringAddOns + verify)
- **Writes**: Variable
- **Function executions**: Every source collection update
- **Cost**: Depends on update frequency
- **Estimate**: If 50 source updates/month → ~$0.10/month

### Scheduled Function
- **Reads**: ~40 reads per run
- **Writes**: Variable
- **Executions**: 30-365 times per month (daily-hourly)
- **Cost**: Daily = ~$0.03/month, Hourly = ~$0.72/month

## Recommendation

**Start with Phase 1**: Implement manual `sync-catering-addons.js` script.

**Rationale:**
- Source data changes infrequently (maybe 1-2 times per week)
- Manual control reduces risk during MVP phase
- Low cost, high reliability
- Can automate later if needed

**Timeline:**
- Phase 1 (Manual Script): Implement now before PR
- Phase 2 (Monitoring): After 2-4 weeks of manual sync experience
- Phase 3 (Automation): Revisit in Q2 2025 if update frequency increases
