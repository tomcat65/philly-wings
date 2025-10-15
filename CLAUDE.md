- do not let context reach 75% without updating relevant entities (we need to have full context for next conversation), main entities: philly-wings-project and philly-wings-catering (there might be other entities)
- use firebase-community for crud operations and firebase-official for project management
- whenever in doubt or needing detailed information use context7 mcp
- DEPLOYMENT: We deploy through GitHub Actions, not directly. User might have a PR that allows preview of changes. User is in charge of deploying when changes are made. DO NOT run firebase deploy commands.
- GIT COMMITS: User (human) is in charge of committing. ONLY commit when user gives explicit permission. Never commit without permission.

## Philly Wings Express - Platform Menu System

Philly Wings is a sophisticated Firebase-powered platform menu generation system (not a simple static site).

### Core Architecture
- **Server-Side Rendered Menus**: Firebase Functions generate dynamic HTML menus for delivery platforms
- **Real-time Data**: All content from Firestore (combos, beverages, sauces, pricing)
- **Media Assets**: Served from Firebase Storage with automatic WebP conversion
- **Platform-Specific**: Each platform (DoorDash, UberEats, GrubHub) gets customized pricing and formatting

### Critical Working URLs (Firebase Functions)
**Local Development (Emulator - CURRENTLY ACTIVE on port 5002)**:
- DoorDash: http://localhost:5002/philly-wings/us-central1/platformMenu?platform=doordash
- UberEats: http://localhost:5002/philly-wings/us-central1/platformMenu?platform=ubereats
- GrubHub: http://localhost:5002/philly-wings/us-central1/platformMenu?platform=grubhub

**Note**:  IF Emulators are currently active on port 5002 - no need to restart them!

**Production URLs** (what gets passed to platforms):
- DoorDash: https://us-central1-philly-wings.cloudfunctions.net/platformMenu?platform=doordash
- UberEats: https://us-central1-philly-wings.cloudfunctions.net/platformMenu?platform=ubereats
- GrubHub: https://us-central1-philly-wings.cloudfunctions.net/platformMenu?platform=grubhub

Else start fresh emulators 

DO NOT USE PORTS 6174, 3004, 6379,7474,and 8080 (they are used in neural collaboration)

### Menu Generation Process
1. Firebase Function in `/functions/index.js` receives platform parameter
2. Fetches data from Firestore collections (combos, menuItems, sauces, beverages)
3. Applies platform pricing (DoorDash/UberEats: 35% markup, GrubHub: 21.5%)
4. Generates complete responsive HTML with CSS styling
5. Returns server-rendered menu to platform/browser
6. Updates automatically when Firestore data changes

### Key Implementation Areas
- **Beverage Section**: Card-based layout with modals, responsive WebP images
- **Combo Section**: Sorted by wing count, platform-specific pricing
- **Wings Section**: Two cards (Boneless first, then Bone-In)
- **Sides Section**: Three categories (Fries, Loaded Fries, Mozzarella Sticks)
- **Dips Section**: Separated from sauces, 4 individual cards with 1.5oz specification
- **Sauce Section**: Full-width images showing cup contents from top

### Focus Areas
- Server-side menu generation for delivery platforms
- Platform-specific pricing and markup calculations
- Responsive design across desktop/tablet/mobile
- Firebase Storage image optimization (WebP conversion)
- Real-time Firestore data integration

### Start Emulators
```bash
firebase emulators:start --only hosting,functions
```
- remember to work on the refactored code
## code must be kept simple and compact (NO LARGE FILES)
use import and modules extensively
- remember not Erika, its "claude"