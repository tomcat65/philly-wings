# Codex Memory — Next Priorities (Philly Wings Express)

## Context Snapshot
- Hosting: apex now points to Firebase; www works. Add 301 apex → www (Hosting UI or firebase.json). SSL will auto‑provision for both.
- Firestore: combos, sauces, modifierGroups, nutrition, nutritionData present. menuItems now seeded with `wings` doc.
- Storage: Bucket `philly-wings.firebasestorage.app` confirmed. Official MCP previously could fetch individual objects; this session it did not load. WebP pipeline active (`images/resized/*`).

## MCP Policy (Important)
- Primary: Use Community Firebase MCP for Firestore writes/reads (confirmed working).
- Storage reads: Prefer Official Firebase MCP when available; if it fails to load, proceed with known URLs and/or request `gsutil` manifest dump when approved.

## Artifacts for Current State
- Markdown report: `docs/firebase/STATUS.md`
- JSON snapshot: `backups/firebase-snapshot.json`

## Session Summary (2025‑09‑20)
- Official Firebase MCP did not load in this run; Community MCP worked.
- Verified Firestore connectivity and listed root collections.
- Seeded menuItems: kept `wings`; added `fries`, `mozzarella_sticks` (incl. 4/6/8/12/16), `drinks` (water-bottle). Synced IDs with web JSON.
- Docs/backups updated to reflect 4 menu items.
- Generated full Storage manifest via gcloud and audits (link and WebP). Uploaded dips (blue-cheese/cheese-sauce/honey-mustard/ranch-dip) and correct sport‑cap water-bottle; fixed stale images.
- Fixed repo references (remaps) so live content 404 audit is green. Added tiny content endpoint `public/api/content/our-story`.
- Combos: added Game Day 30 to web JSON, corrected Tailgater image, updated Game Day 30 copy (adds 2 large fries + 8 mozz sticks) across site components, seeds, and menu PDF; updated Firestore combo doc.
- WebP rollout: hardened client interceptor; enabled nested Storage rule `/images/**`; prepared homepage derivative sweep; manifest now shows many WebP derivatives present.

## To‑Dos

### 1) Seed Menu Items (Firestore)
- Done: `wings`, `fries`, `mozzarella_sticks` (4/6/8/12/16), `drinks` (water-bottle) seeded and verified.

### 2) Combos — Align JSON + Firestore
- Done: Game Day 30 added and copy synced; Tailgater image fixed; Firestore combo updated. Optional: add Date Night Dozen.

### 3) Nutrition Data
- Verify docs exist in `nutritionData` for: `12-wings`, `24-wings`, `30-wings`, `50-wings` (6‑wings present).
- Confirm sides/combos entries: `french-fries`, `loaded-fries`, `mozzarella-sticks`, `mvp-meal`.

### 4) Storage Manifest & WebP Audit
- Done: Manifest + audits generated; nested Storage rule deployed for `/images/**`.
- Done: homepage derivative coverage verified; direct WebP links patched in `index.html`, `public/data/sauces.json`, and `public/data/combos.json`. Preview audit shows 0 non‑WebP, 0 broken.

### 5) Hosting Canonical Redirect — Resolved
- Decision: Keep apex serving directly (no apex→www 301). SSL for both apex and www is provisioned.

### 6) Backups / Guardrails
- Export Firestore after seeding: `menuItems`, `combos`, `sauces`, `modifierGroups`, `nutritionData`.
- (Optional) Add admin export/import for menus (admin‑only) for quick restore.

### 7) Admin Writes / Rules / Indexes
- Done: firestore.rules updated for variant schema; composite indexes added; storage.rules nested path enabled. Ensure admin customClaims.

### 8) PWA Icons & Manifest
- Done: copied icons to `public/`. Next: align manifest icon paths with these filenames to remove warnings.

### 9) CI Audits
- Add a GH Action to run: storage manifest, link 404 audit, WebP audit on PR.

## Proposed Next Steps (Execution Plan)
1) Verify/create missing `nutritionData` docs for 12/24/30/50 and sides/combos.
2) CI: add PR audit job (manifest, link 404s, WebP coverage).
3) Backups: export Firestore collections (`menuItems`, `combos`, `sauces`, `modifierGroups`, `nutritionData`).
4) (If needed) Seed any straggler `menuItems` variants via admin panel.

---
Owner: Codex
Last updated: 2025‑09‑20 (WebP coverage 100% on preview; favicon/manifest fixed)
- Nutrition combos rollout (admin + site)
  - Gate JSON feed upload via `VITE_ENABLE_NUTRITION_FEED_UPLOAD` (default false in preview).
  - Replace recompute alert with toast; show success even if feed skipped.
  - Implement Cloud Function:
    - onWrite(combos/*, nutritionData/*): recompute `computedNutrition` and publish feed; bump version.
    - callable: manual recompute/publish from Admin.
  - Optional: always prefer Firestore for modal; keep static JSON as final fallback only.

## 2025‑09‑20 — Nutrition Preview Updates (Deployed)

What we shipped
- Admin flag gating for combos nutrition feed upload (skips Storage; Firestore only).
- Toast UX replacing alert on recompute (success even when upload skipped).
- Deep sanitizer before Firestore `updateDoc` to remove undefined/NaN/Infinity.
- Logos for platform tabs added to `public/images/logos/` (removes 404s).

Files modified
- `admin/platform-menu.js` — gating, sanitizer, toast, serialization fix.
- `GITHUB_ACTIONS_SETUP.md` — doc for `VITE_ENABLE_NUTRITION_FEED_UPLOAD`.
- `public/images/logos/{doordash,ubereats,grubhub}-logo.svg` — added.

Verification (Preview pr3)
- Recompute updates `combos/*`.computedNutrition without client Storage; no updateDoc warnings.
- Upload skip logs present; no Storage PUTs.
- Platform logos render in UI.

Next tasks
1) Cloud Functions
   - `onWrite` triggers for `combos/*` and `nutritionData/*` to recompute `computedNutrition` and publish JSON atomically; bump a version.
   - `callable` function to allow Admin button to run server‑side recompute/publish.
2) CI audits on PR (Storage manifest diff, link 404 check, WebP coverage report).
3) Backups: export core collections (`menuItems`, `combos`, `sauces`, `modifierGroups`, `nutritionData`).
4) Optional: Admin import/export tools for menus; content seeding automation.

## 2025‑09‑20 — Platform Menus, Modifiers, Dips, and Publish Pipeline (Completed)

Scope
- Clean up MVP Meal duplicate; enforce combo pricing & order.
- Split Dips from Sauces in Admin; encode per‑6 wing allowances (sauces, dips, sauce‑on‑side, cuts, boneless/classic).
- Consolidate Sides for partner export (single item + Portion Size modifier).
- Add Admin buttons for Preview JSON, Download JSON, and publish via Cloud Function to Storage (Versioned + Latest URL).

Files touched
- `admin/platform-menu.js`
  - Added allowance helpers: `getWingsCountFromItem`, `getWingsCountFromComboItems`, `computeWingAllowancesByCount`, `getModifierPricingMeta`.
  - Default wing variant `modifierGroups`: `['wing_type','wing_cut','sauce_choice','extra_sauces','extra_dips']`.
  - Inline Allowances panel in editor (wings/combos): shows sets‑of‑6, allowed sauces, included sauce cups, included dips, extra cup prices, wing cut surcharge, and floor rule text.
  - Split Sauces vs Dips in Admin UI rendering (`menuData.dips`, `#dips-items`).
  - Ensured modifier groups loaded/created (and upserted to Firestore):
    - `sauce_choice`: per‑6 rules, includes “Original (No Sauce)”, on‑side doesn’t count against dips.
    - `extra_sauces`: price per cup ($1.00), included per 6 = 0.
    - `extra_dips`: included per 6 = 2; price per extra = $1.25; options sourced from dips.
    - `wing_type`: classic | boneless (required).
    - `wing_cut`: mix | all_drums | all_flats; surchargePer6 = $1.50; appliesTo classic only.
  - Platform export snapshot (`buildCompleteMenuSnapshot`):
    - Adds `platformExport.consolidated` with:
      - `sides`: consolidated item per side with required `portion_size` modifier (4/8/12/16) using price deltas.
      - `wingsSplitRules`: per‑6 allowances & pricing for sauces, dips, wing cuts, classic/boneless.
      - `combos`: includes `flexibleComponents` enabling fries substitutions (regular/large/loaded) and add/remove sides/drinks, and `wingsCount`.
    - Includes `allowances` per wings/combos item in `snapshot.items[...]` for downstream clients.
  - Publishing flow hardening:
    - Deep sanitize snapshot before writes, re‑apply `serverTimestamp()` after sanitize.
    - Added `previewPlatformJSON`, `downloadPlatformJSON`, `publishToStorage` (callable) actions; exposed on `window.*`.
  - Sorting: combos sorted by `sortOrder` for stable presentation.

- `admin/platform-menu.html`
  - Added Quick Action buttons: `🧪 Preview Platform JSON`, `⬇️ Download JSON`, `☁️ Publish to Storage`.
  - Added Dips section (`🫙 Dips`) with item count.

- `src/firebase-config.js`
  - Exported `functions = getFunctions(app)` for callable.

- `functions/index.js` (NEW)
  - Callable `publishPlatformMenu` (admin‑only) writes versioned and latest JSON under `platform-menus/{platform}/` in Storage and records metadata in `publishedMenus/{platform‑timestamp}`. Returns Versioned + Latest URLs (firebasestorage endpoints).

- `functions/package.json` (NEW)
  - Node 18 engines, dependencies: `firebase-admin`, `firebase-functions`.

- `storage.rules`
  - Added public read for `platform-menus/**`; admin write.

- `firebase.json`
  - Added `"functions": { "source": "functions" }` to enable function deployment.

- Documentation/backups updated earlier in this session when deduping MVP:
  - `docs/firebase/STATUS.md`: combos reduced to 5; duplicated MVP removed.
  - `backups/firebase-snapshot.json`: combos count adjusted; legacy MVP removed.

Firestore changes
- Combos (dedupe + pricing + order):
  - Deleted legacy docs: `combos/D1F7cvfjgfMyEfPrdvBE` (mvp_meal), `3yhbryADluFsEx8O2xdU` (sampler_platter), `m8XgnkYctZlA44j4wJbo` (game_day_30), `TkYtV7xlPbM06W71Ex8D` (party_pack_50), `fEAlRAD4aWoWGlf6PCiy` (the_tailgater).
  - Kept canonical web docs and set:
    - `LHVOJwNbXNuXOZbpHtGO` (combo‑mvp): basePrice 17.99, sortOrder 1.
    - `Qzhmx3q9twaSR62M0R7l` (combo‑sampler): basePrice 18.99, sortOrder 0.
    - `VQBQJsNsTPSdM3jUSuFm` (combo‑tailgater): basePrice 47.99, sortOrder 2.
    - `Mwp2hJceFkGrFKgmIQKX` (combo‑game‑day‑30): basePrice 35.99, sortOrder 3.
    - `iKGdzL0l3zjB3JZ6VegH` (combo‑party‑pack): basePrice 104.99, sortOrder 4.
  - Platform pricing set: GH lower for certain combos (Tailgater, Party Pack, Sampler, Game Day).

- Mozzarella Sticks variants (sides): removed 6‑count; confirmed 4/8/12/16 only (with per‑platform pricing). Admin still lists variants; platform export consolidates via size modifier.

- Modifiers (created/upserted): `sauce_choice`, `extra_sauces`, `extra_dips`, `wing_type`, `wing_cut` with per‑6 metadata and prices.

Admin UX changes
- Allowances panel in item editor for wings & combos (computed per sets of 6; floor rule for 50 wings).
- Modifier Editor modal renders and persists the 5 groups; supports tuning per‑6 counts and per‑cup/per‑extra pricing.
- Dips appear as their own Admin category and are available as paid add‑ons.

Publish & links
- Short‑term Firestore writes were hardened (sanitize + re‑apply timestamps) but switched to Cloud Function publish to Storage for a robust partner‑facing link.
- Callable function deployed (`us‑central1`). Admin button returns:
  - Versioned JSON URL: `.../platform-menus/{platform}/{timestamp}.json?alt=media`
  - Latest JSON URL: `.../platform-menus/{platform}/latest.json?alt=media` (stable link to share with partners).

Decisions & policies
- Public site is a marketing showcase; partner menus and logic live in the platform export.
- Categories for partners: Wings (6/12/24/30/50), Sauces (modifiers only), Dips (own category and add‑on), Sides (consolidated), Drinks, Combos.
- Wings remain separate SKUs to keep per‑6 allowances straightforward for partner ingestion.
- Combos support substitutions and add/remove with price deltas.

Open items / Next actions
1) Deploy path already in place. Validate Admin “☁️ Publish to Storage” now returns Versioned + Latest URLs and share Latest with partners.
2) Optional: Add a small “Copy URL” button in publish modal.
3) Optional: CI to auto‑publish `latest.json` on main‑branch merges (GitHub Actions calling the callable).
4) Upgrade Cloud Functions runtime to Node 20 and `firebase-functions` to v5+ (breaking changes likely) before 2025‑10‑30.
5) Consider pinning client Functions region (e.g., `getFunctions(app, 'us-central1')`) to match deployed region.
6) Optional: Add `extra_dips` modifier to relevant sides as paid add‑on if partners want dips exposed alongside sides.
7) Keep backups: run Firestore export for `menuItems`, `combos`, `sauces`, `modifierGroups`, `nutritionData`.

Owner: Codex
Last updated: 2025‑09‑20 — Platform menus export + publish pipeline live

## SESSION STATUS SUMMARY
**Updated**: 2025-09-20
**Focus**: Database cleanup and optimization completed successfully

### Major Accomplishments This Session ✅
1. **Legacy Data Cleanup**: Removed unused 'nutrition' collection (20 documents)
2. **Image Integration**: Successfully added water bottle and sauce images to Firebase Storage
3. **Display Fix**: Resolved water bottle image scaling issue with CSS object-fit: contain
4. **Mobile Optimization**: Verified responsive design works perfectly across all devices
5. **Sauce Menu Enhancement**: Upgraded from text-only to visual image-based cards

### Current Technical State
- **Database**: 13 optimized collections (streamlined from 14)
- **Images**: All new assets integrated with Firebase Storage URLs
- **Performance**: Maintained 23KB bundle size and fast loading times
- **Mobile**: Cross-device compatibility verified and working
- **Code Quality**: Enhanced sauce-menu.js and styling improvements

### Ready for Next Phase
- Database optimized and cleaned of legacy data
- Image system fully integrated and responsive
- Performance targets maintained
- Foundation prepared for conversion optimization and feature development

### Preview Environment
- **Branch**: nutrition (cleanup work completed)
- **Preview URL**: https://philly-wings--pr3-nutrition-fdj518og.web.app
- **Status**: Ready for deployment and next development priorities

## 2025‑09‑20 — Cloud Function Live + Admin Publish Verified

Status
- Function `publishPlatformMenu (us‑central1)` deployed (callable; admin‑only). Artifact cleanup policy set (30 days).
- Storage rules allow public read for `platform-menus/**`; functions bypass rules for writes.
- Admin Platform Menu shows new Quick Actions: `☁️ Publish to Storage`, `⬇️ Download JSON`, `🧪 Preview Platform JSON`.

How to Publish / Share
- In Admin → Platform Menu Manager:
  1) Click `☁️ Publish to Storage`.
  2) Modal shows two URLs:
     - Versioned: `https://firebasestorage.googleapis.com/v0/b/{bucket}/o/platform-menus/{platform}/{timestamp}.json?alt=media`
     - Latest: `https://firebasestorage.googleapis.com/v0/b/{bucket}/o/platform-menus/{platform}/latest.json?alt=media`
  3) Share the Latest URL with partner platforms (stable pointer).
- Use `🧪 Preview Platform JSON` to inspect payload before publish; use `⬇️ Download JSON` for manual handoff if needed.

Admin View (Verified)
- Categories present and correct: Wings (6/12/24/30/50), Sides (7), Drinks (1), Combos (5), Sauces & Rubs (10), Dips (4).
- Modifiers ensured/loaded: `sauce_choice`, `extra_sauces`, `extra_dips`, `wing_type`, `wing_cut`.

Notes / Follow‑ups
- If function region matters for client, pin via `getFunctions(app, 'us-central1')` in `src/firebase-config.js`.
- Optional: add Copy URL button in publish modal for faster partner handoff.
- Optional: CI job to auto‑publish Latest on main merges (calls the callable).
