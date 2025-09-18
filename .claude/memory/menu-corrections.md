# Menu Corrections Log

## Common Mistakes to Avoid
1. **NEVER add chicken tenders** - Philly Wings Express has never had tenders
2. **NEVER add onion rings** - Not part of the menu
3. **NEVER add sodas/soft drinks** - Only bottled water
4. **NEVER call it "cheese fries"** - It's "Loaded Fries" with cheese AND bacon
5. **NEVER create a "Family Feast" combo** - Doesn't exist

## Correct Sauce Names (from Firebase sauces collection)
The `sauces` collection in Firebase is authoritative. The `menuItems` collection has old/incorrect names like:
- "Dallas Crusher" - NOT A REAL SAUCE
- "Honey Jawn Fire" - NOT A REAL SAUCE
- "Gritty's Garlic Parm" - WRONG, it's just "Garlic Parmesan" as a dry rub

## Firebase Collections Structure
- `combos` - The 5 actual combo meals
- `sauces` - The 14 actual sauces (THIS IS THE SOURCE OF TRUTH)
- `menuItems` - Has old/incorrect data, don't use for sauce names
- `menu-sections` - Has some incorrect info (mentions tenders in sampler)

## Website Issues
- Sampler Platter on website incorrectly mentions "4 tenders" - this is a bug
- Should be "6 wings + regular fries" only

## Admin Menu Location
- Local: http://localhost:5000/menu-admin.html
- Firebase hosting target: admin.phillywingsexpress.com
- Master menu file: /admin/menu-master.js

Last updated: 2025-01-17