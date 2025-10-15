# Catering Operations Procedures
## Philly Wings Express - Vegetarian & Dessert Add-Ons

**Last Updated**: October 13, 2025
**Version**: 1.0.0
**Owner**: Operations Team

---

## Table of Contents
1. [Controlled Vocabularies](#controlled-vocabularies)
2. [Storage Requirements](#storage-requirements)
3. [Team Capabilities](#team-capabilities)
4. [Equipment Requirements](#equipment-requirements)
5. [Prep Time Guidelines](#prep-time-guidelines)
6. [Allergen Management](#allergen-management)
7. [Daily Capacity Limits](#daily-capacity-limits)
8. [Supplier Information](#supplier-information)

---

## Controlled Vocabularies

### Storage Types
| Value | Description | Temperature Range | SOP Reference |
|-------|-------------|-------------------|---------------|
| `frozen` | Requires freezer storage | 0°F or below | SOP-STORE-001 |
| `refrigerated` | Requires refrigeration | 33-40°F | SOP-STORE-002 |
| `dry` | Dry storage | Room temp | SOP-STORE-003 |
| `ambient` | Room temperature | 65-75°F | SOP-STORE-004 |

### Team Capabilities
| Value | Description | Staff Requirements | Training Cert |
|-------|-------------|-------------------|---------------|
| `heat-only` | Only heating required | Basic food safety | FS-101 |
| `fry` | Requires fryer operation | Fryer certified | FRY-201 |
| `assemble` | Assembly/plating only | Food handler | FH-101 |
| `none` | No prep required | None | N/A |

### Required Equipment
| Value | Equipment Name | Location | Maintenance |
|-------|---------------|----------|-------------|
| `impingerOven` | Impinger Conveyor Oven | Kitchen Station 1 | Weekly clean |
| `fryer` | Double-Basket Fryer | Kitchen Station 2 | Daily oil check |
| `refrigeration` | Walk-in Refrigerator | Back storage | Temp log 2x/day |
| `chafing` | Chafing Dish Set | Catering supplies | Clean after each use |
| `boxingStation` | Packaging Station | Prep area | Daily sanitize |

### Allergens (FDA Major + Common)
| Value | FDA Major | Tracking Required | Cross-Contact Risk |
|-------|-----------|-------------------|-------------------|
| `dairy` | Yes | Yes | High |
| `egg` | Yes | Yes | Medium |
| `gluten` | Yes (wheat) | Yes | High |
| `soy` | Yes | Yes | Low |
| `nuts` | Yes | Yes | Critical |
| `shellfish` | Yes | Yes | Critical |
| `sesame` | Yes | Yes | Medium |
| `fish` | Yes | Yes | Critical |
| `none` | N/A | No | N/A |

### Dietary Tags
| Value | Definition | Verification Required | Label Format |
|-------|------------|----------------------|--------------|
| `vegetarian` | No meat/poultry/fish | Supplier cert | 🌱 VEGETARIAN |
| `vegan` | No animal products | Supplier cert | 🌱 VEGAN |
| `gluten-free` | <20ppm gluten | Lab test | GF |
| `contains-nuts` | Warning label | Always | ⚠️ CONTAINS NUTS |
| `dairy-free` | No dairy | Supplier cert | DF |
| `halal` | Halal certified | Cert required | HALAL |
| `kosher` | Kosher certified | Cert required | KOSHER |

---

## Storage Requirements

### Frozen Items
**Items**: Elena's Eggplant Parmesan, Cauliflower Wings, Chef's Quality Cake, Chef Pierre Cheesecake

**Procedures**:
1. Store at 0°F or below
2. FIFO rotation (first in, first out)
3. Maximum storage: 90 days from receipt
4. Label with receipt date
5. Thawing protocols:
   - Elena's Eggplant: Overnight refrigeration (12-16 hours)
   - Cauliflower Wings: Cook from frozen
   - Cakes: Refrigeration thaw 4-6 hours
   - Cheesecake: Refrigeration thaw 2-3 hours

### Refrigerated Items
**Items**: Sally Sherman Coleslaw

**Procedures**:
1. Store at 33-40°F
2. Check "use by" date daily
3. Maximum storage: 7 days from receipt
4. Keep sealed until service
5. Discard if temperature abuse suspected

### Ambient Items
**Items**: Daisy's Cookies

**Procedures**:
1. Store at room temperature 65-75°F
2. Same-day delivery required
3. Maximum storage: 24 hours
4. Keep in original packaging
5. No refrigeration (affects texture)

---

## Team Capabilities

### Heat-Only Items
**Items**: Elena's Eggplant Parmesan

**Required Skills**:
- Basic food safety certification (FS-101)
- Oven operation training
- Temperature verification (thermometer use)

**Procedure**:
1. Verify item is fully thawed (refrigeration thaw)
2. Preheat impinger oven to 350°F
3. Place tray on conveyor belt
4. Set timer: 45-50 minutes
5. Check internal temp: 165°F minimum
6. Rest 5 minutes before service

**Quality Checks**:
- Internal temp 165°F or higher
- Cheese fully melted and bubbly
- Edges not burned
- Tray structurally sound for transport

### Fry Items
**Items**: Cauliflower Wings

**Required Skills**:
- Fryer certification (FRY-201)
- Double-fry technique training
- Sauce tossing certification

**Procedure**:
1. Heat fryer oil to 350°F
2. First fry: 5-6 minutes from frozen
3. Remove, drain, rest 2 minutes
4. Second fry: 3-4 minutes until golden
5. Drain thoroughly
6. Toss in sauce immediately while hot
7. Package for service

**Quality Checks**:
- Golden brown color
- Crispy exterior
- Hot throughout (check few pieces)
- Evenly coated with sauce
- No excess oil pooling

### No-Prep Items
**Items**: Daisy's Cookies, Sally Sherman Coleslaw, Cakes, Cheesecake

**Required Skills**:
- Basic food handler certification (FH-101)
- Proper packaging techniques

**Procedure**:
1. Verify item temperature (if refrigerated)
2. Check "use by" dates
3. Package appropriately for catering order
4. Label with allergen information
5. Keep refrigerated items cold until pickup

---

## Preparation Variants

Some add-ons support multiple preparation methods. Selection is stored in the `preparationOptions` field and must be recorded on the production sheet.

| Add-On | Variant ID | Method Overview | Equipment | Prep Time | Max Daily Units |
|--------|------------|-----------------|-----------|-----------|-----------------|
| Cauliflower Wings | `fried` | Double-fry from frozen (5-6 min + rest + 3-4 min), toss while hot, dedicated vegetarian oil when required. | Fryer | 35 min | 15 |
| Cauliflower Wings | `baked` | Impinger bake 12 min, flip, bake 10-12 min, 2 min broiler finish, 3 min rack rest before saucing. | Impinger Oven | 45 min | 8 |

**Sauce Limit**: Regardless of preparation method, guests may choose up to two sauces per 50-piece order (25/25 split or single sauce). Document the split on the run sheet.

---

## Prep Time Guidelines

### Time Allocations (Average)

| Item | Prep Time | Notes |
|------|-----------|-------|
| Elena's Eggplant Parmesan | 50 min | Includes heating + rest time |
| Cauliflower Wings (50pc) | 35 min | Includes double-fry process |
| Sally Sherman Coleslaw | 5 min | Portioning + packaging only |
| Daisy's Cookies | 5 min | Packaging only |
| Chef's Quality Cake | 15 min | Thawing must be done in advance |
| Chef Pierre Cheesecake | 10 min | Thawing must be done in advance |

### Workflow Optimization

**For Multiple Add-Ons**:
- Start thawing items first (cakes, cheesecake)
- Begin Elena's Eggplant (longest prep)
- While eggplant heats, fry cauliflower wings
- Package cold items last (maintain temp)
- Total parallel workflow: ~60 minutes max

**Prep Time Calculation**:
```
Base Package Prep + Sum(Add-On Prep Times) = Total Prep Time
Example: 40 min (wings) + 50 min (eggplant) + 5 min (cookies) = 95 minutes
```

---

## Allergen Management

### Cross-Contact Prevention

**Critical Control Points**:
1. **Fryer**: Cauliflower wings use same fryer as chicken wings
   - Risk: Gluten, soy cross-contact
   - Mitigation: New oil batch for vegetarian-only orders (if requested)
   - Communication: Default assumes shared fryer

2. **Prep Surfaces**: Shared surfaces with chicken products
   - Risk: Cross-contact with vegetarian items
   - Mitigation: Sanitize before vegetarian prep
   - Communication: Document cleaning procedure

3. **Sauce Tossing**: Shared tossing bowls
   - Risk: Allergen cross-contact
   - Mitigation: Dedicated vegetarian bowls
   - Communication: Label clearly

### Allergen Declarations

**Required on All Packaging**:
```
Contains: [List all allergens present]
May Contain: [List shared equipment allergens]
Processed in facility that handles: Dairy, Eggs, Wheat, Soy, Tree Nuts
```

**Example Labels**:
- Elena's Eggplant: "Contains: Dairy, Gluten, Egg"
- Cauliflower Wings: "Contains: Gluten, Soy. Fried in shared equipment with chicken"
- Daisy's Cookies: "Contains: Gluten, Egg, Dairy, Soy. May contain: Tree Nuts"

---

## Daily Capacity Limits

### System-Wide Maximums

| Item | Max Daily Units | Reason | Override Process |
|------|----------------|--------|------------------|
| Elena's Eggplant | 10 trays | Oven capacity | Manager approval |
| Cauliflower Wings (fried) | 15 orders (50pc) | Fryer time | Manager approval |
| Cauliflower Wings (baked) | 8 orders (50pc) | Impinger oven rack space | Manager approval |
| Sally Sherman Coleslaw | 20 quarts | Supplier delivery limit | 48hr notice |
| Daisy's Cookies | 25 boxes | Same-day delivery limit | 48hr notice |
| Chef's Quality Cake | 8 cakes | Thaw time constraint | 72hr notice |
| Chef Pierre Cheesecake | 12 boxes | Thaw time + storage | 72hr notice |

### Capacity Monitoring

**Daily Tracking**:
- Check `cateringAddOns` collection for `maxDailyUnits`
- Update `cateringAvailability` with units sold
- Alert at 80% capacity (automate)
- Block orders at 100% capacity

**Override Requests**:
1. Manager reviews request
2. Verify oven/fryer availability
3. Confirm supplier can deliver
4. Update capacity in system
5. Document override reason

---

## Supplier Information

### Supplier SKU Reference

| Supplier | Item | SKU | Lead Time | Ordering Method |
|----------|------|-----|-----------|----------------|
| Restaurant Depot - Elena's | Eggplant Parmesan | ELENA-EGGPLANT-FULL | 2 days | In-store pickup |
| Restaurant Depot - Sysco | Cauliflower Wings | SYSCO-CAULI-50PC | 2 days | In-store pickup |
| Restaurant Depot - Sally Sherman | Coleslaw | SALLY-COLESLAW-QT | 1 day | In-store pickup |
| Restaurant Depot - Chef's Quality | Sheet Cake | CHEFS-SHEET-QTR | 2 days | In-store pickup |
| Restaurant Depot - Chef Pierre | Cheesecake Bites | PIERRE-CHEESE-BITES-50 | 2 days | In-store pickup |
| Daisy's Bakery | Chocolate Chip Cookies | DAISY-CHOC-CHIP-24 | 1 day | Phone order + delivery |

### Lead Time Requirements

**Standard Lead Times**:
- 1 day: Daisy's Cookies, Sally Sherman Coleslaw
- 2 days: All Restaurant Depot frozen items

**Catering Order Minimum**:
- 24 hours advance notice (standard)
- Add-ons require +1 day if not in stock
- Weekend orders: Order by Thursday noon

**Emergency Procedures**:
- Daisy's Bakery: Call before 9am for same-day (limited availability)
- Restaurant Depot: Check stock levels online before promising
- Backup suppliers: Document alternatives in SOP-SUPPLY-001

---

## Training Requirements

### Staff Certifications

**Required for All Staff**:
- [ ] Food Safety Certification (FS-101)
- [ ] Allergen Awareness Training (AL-101)
- [ ] Cross-Contact Prevention (CC-201)

**Required by Role**:
- Heat-Only Items: No additional training
- Fryer Items: Fryer Certification (FRY-201)
- Assembly Items: Food Handler Certification (FH-101)

### Competency Checklist

**Heat-Only (Elena's Eggplant)**:
- [ ] Can identify fully thawed product
- [ ] Operates impinger oven correctly
- [ ] Uses thermometer properly (165°F verification)
- [ ] Understands rest time importance
- [ ] Packages for safe transport

**Fryer (Cauliflower Wings)**:
- [ ] Maintains oil temperature at 350°F
- [ ] Executes double-fry technique
- [ ] Drains properly between fries
- [ ] Tosses in sauce while hot
- [ ] Packages immediately after saucing

**No-Prep Items**:
- [ ] Verifies temperature of refrigerated items
- [ ] Checks use-by dates
- [ ] Packages with proper allergen labels
- [ ] Maintains cold chain for refrigerated items

---

## Quality Control Standards

### Acceptance Criteria

**Elena's Eggplant Parmesan**:
- Internal temp: 165°F minimum
- Cheese: Fully melted, no cold spots
- Appearance: No burnt edges, golden top
- Packaging: Sturdy tray, no leaks

**Cauliflower Wings**:
- Color: Golden brown (not dark or pale)
- Texture: Crispy exterior, hot throughout
- Sauce: Evenly coated, not pooling
- Packaging: Ventilated container, upright

**Daisy's Cookies**:
- Freshness: Same-day delivery verified
- Appearance: No broken cookies
- Packaging: Sealed, labeled
- Count: 24 cookies verified

**Dessert Items**:
- Temperature: Properly thawed (not frozen, not warm)
- Appearance: No freezer burn, intact packaging
- Labeling: Allergen info present

### Rejection Criteria

**Reject and Document**:
- Any item past use-by date
- Any item showing temperature abuse
- Any item with damaged packaging
- Any item missing allergen labeling
- Any item not meeting appearance standards

---

## Emergency Contacts

**Operations Manager**: [TBD]
**Supplier Contacts**:
- Restaurant Depot: (215) 555-DEPOT
- Daisy's Bakery: (215) 555-DAISY

**Food Safety Hotline**: (215) 555-SAFE
**Equipment Maintenance**: (215) 555-MAINT

---

*This document must be reviewed and updated quarterly. Next review: January 13, 2026.*
