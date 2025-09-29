# Codex Memory Context — Philly Wings Platform Menu (2025‑09‑27)

This document captures what was implemented in this session, why, and where. It is written to get a new engineer (or a new Codex/Claude session) up to speed quickly and accurately.

## High‑Level Outcomes

- Server‑Side Rendering (SSR) now works for DoorDash, UberEats, and Grubhub from the Firebase Functions HTTP endpoint.
- Admin callable `publishPlatformMenu` returns Storage URLs (`versionedUrl`, `latestUrl`) and stores them in Firestore metadata.
- Hosting includes a `/platform/**` rewrite to the SSR function for convenient testing.
- Robust data fallbacks were added so SSR pages still render in emulator/dev when Firestore is incomplete (wings, combos, sauces, beverages).
- The DoorDash Wings modal was upgraded with correct multi‑sauce allocation (6‑wing units), “No Sauce”, “No Dip”, and improved dip handling and summary.
- Started Phase 2 of a modular refactor to split Wing flows into Boneless vs. Bone‑In orchestrators, with shared helpers (Phase 1 entry points are in place).

---

## Files Touched (with rationale)

### 1) Firebase Functions — API and data handling

- `functions/index.js`
  - Added imports for UberEats and Grubhub SSR generators.
  - Enhanced platform extraction: query, path (`/platform/:platform`), subdomain (`x-forwarded-host`/`host`).
  - HTTP `platformMenu` now serves HTML for `doordash | ubereats | grubhub`.
  - Added robust `fetchCompleteMenu` with fallbacks:
    - Legacy `menuItems` snapshot support
    - Fallback to `lib/core/firestore.fetchCompleteMenu` when sections are empty
    - Local fallbacks for `menu-items.json` (wings), minimal sauces, beverages, and combos
    - Infer `wing.type` when missing; normalize for render
  - `processPlatformMenu` adds default `type` (boneless/bone‑in) for wings when missing.
  - Callable `publishPlatformMenu` now returns public Storage URLs and stores `{ storage: { versionedUrl, latestUrl, ... } }` in Firestore metadata.

- `firebase.json`
  - Added Hosting rewrite: `/platform/**` → `platformMenu` (HTTP function) for SSR testing.

### 2) Platform SSR — implementations and UI safety

- `functions/lib/platforms/ubereats/index.js`
  - Implemented SSR using shared DoorDash HTML/CSS/JS with UberEats branding.

- `functions/lib/platforms/grubhub/index.js`
  - Implemented SSR using shared DoorDash HTML/CSS/JS with Grubhub branding.

- `functions/lib/platforms/doordash/html.js`
  - Combos: Added safe fallbacks (derived names, image, and price from base with default markup) to render even when Firestore docs are sparse.
  - Wings section: Button handlers now call flow‑specific entry points (see Phase 2 below).

### 3) DoorDash modular assets — modal logic and styles

- `functions/lib/platforms/doordash/modules/wings-modal-complete.js`
  - Step 1: Wing size cards retain selected state; Next disabled until a size is chosen.
  - Step 2: “No Sauce” toggle – clears sauces and jumps to Dips; On‑Side toggle only for wet sauces; allocation system in 6‑wing increments with Equal Split and Clear.
  - Step 3: “No Dip” — jumps straight to final Summary.
  - Step 4 (bone‑in): Wing Style (Regular/All Drums/All Flats) with $1.50 upcharge only for bone‑in.
  - Step 4 (boneless): Extra Dips render reliably even when the default container is not present; added “No Extra Dips” (skip).
  - Final step: Add to Cart button visible only on final step; Next hidden.
  - Summary: shows friendly dip names; included vs. extra dips with quantities; wing style label and upcharge only for bone‑in; cleaned out legacy extra‑dips block.
  - Summary container creation: auto‑creates in active step and hides any stray extra‑dips container (fix for boneless summary layout).

- `functions/lib/platforms/doordash/css.js`
  - Already had `.wing-variant-card.selected`; card selection now used by Step 1.

### 4) Phase 2 — split flows and add shared helpers

- Added `functions/lib/platforms/doordash/modules/wings-shared.js`
  - Flow entry points:
    - `openBonelessWingModal()` → currently calls legacy `openWingModal('boneless')`.
    - `openBoneInWingModal()` → currently calls legacy `openWingModal('bone-in')`.
  - Shared helpers (active now):
    - `formatDipName(id)` (friendly names from sauce catalog)
    - `buildWingOrderPayload()` (structured payload: type, variant, sauces + onSide + allocations, included/extra dips, totals)
    - `addWingOrderToCart()` (logs payload; placeholder for real cart)

- `functions/lib/platforms/doordash/javascript-modular.js`
  - Includes `wings-shared.js` inject after the legacy modal to reuse its state.
  - Removed older generic event listeners; HTML now calls the new flow‑specific entry points explicitly.

- `functions/lib/platforms/doordash/html.js`
  - Updated wing card buttons:
    - Boneless → `openBonelessWingModal()`
    - Bone‑In → `openBoneInWingModal()`

---

## Why These Changes

- SSR parity across platforms: To present professional, shareable menus and avoid client‑side Firebase config issues.
- Admin callable UX: Returning Storage URLs (versioned and latest) aligns the backend with the Admin panel’s expectations.
- Data stability: Emulator/dev frequently misses production fields. Fallbacks keep SSR pages functional and predictable.
- Modal UX correctness: The Wings ordering flow must honor business rules (6‑wing allocations, On‑Side for wet sauces, “No Sauce”, “No Dip”, extra dips optional, proper summary).
- Readability & maintainability: Splitting wings flow into Boneless vs. Bone‑In removes cross‑flow branching and is easier to reason about. Shared helpers reduce duplication.

---

## Testing Pointers

- Functions Emulator URLs (default ports in repo):
  - DoorDash: `http://127.0.0.1:5002/philly-wings/us-central1/platformMenu?platform=doordash`
  - UberEats: `http://127.0.0.1:5002/philly-wings/us-central1/platformMenu?platform=ubereats`
  - Grubhub: `http://127.0.0.1:5002/philly-wings/us-central1/platformMenu?platform=grubhub`

- Hosting SSR route:
  - DoorDash: `http://127.0.0.1:5003/platform/doordash`

- Admin (for publishing snapshots):
  - `http://127.0.0.1:5003/admin/platform-menu.html`
  - “Publish to Storage” will now show `versionedUrl` and `latestUrl`.

---

## Phase 2 Plan (in progress)

1) Extract shared renderers into `wings-shared.js`:
   - `renderSizeOptions`, `renderSauceOptions`, `renderIncludedDips`, `renderExtraDips`, `renderSummary`
   - `equalSplitBy6`, `validateAllocationBy6`, `calcTotals`

2) Create flow orchestrators:
   - `wings-boneless.js` (5 steps)
   - `wings-bonein.js` (6 steps)

3) Switch flow entry points to call the orchestrators after parity validation → remove legacy `wings-modal-complete.js`.

4) Optional: Align pricing multipliers across Admin and Functions; integrate Add‑to‑Cart with Firestore or API.

---

## Known Follow‑Ups

- Pricing multiplier consistency (Admin uses 1.33/1.33/1.28 vs Functions 1.35/1.35/1.215).
- Cart integration (replace console log with real cart action).
- Remove legacy modal once both flows are fully migrated and validated.

