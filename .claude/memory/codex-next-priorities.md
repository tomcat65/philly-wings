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

### 5) Hosting Canonical Redirect
- In Firebase Hosting → Custom domains, set 301 from apex `phillywingsexpress.com` → `https://www.phillywingsexpress.com` (preserve path & query) or via `firebase.json`.
- Confirm both apex and www SSL “Provisioned”.

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
1) Configure 301 apex → www redirect in Hosting UI (or `firebase.json`).
2) Verify/create missing `nutritionData` docs for 12/24/30/50 and sides/combos.
3) CI: add PR audit job (manifest, link 404s, WebP coverage).
4) Backups: export Firestore collections (`menuItems`, `combos`, `sauces`, `modifierGroups`, `nutritionData`).
5) (If needed) Seed any straggler `menuItems` variants via admin panel.

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
