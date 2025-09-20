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
- Next: homepage-specific derivative generation (1920x1080/800x800/200x200) for any remaining filenames to maximize WebP swaps.

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
1) Seed remaining `menuItems` (fries, mozzarella sticks, drinks).
2) Patch `public/data/combos.json` for parity (Game Day 30, Date Night Dozen) and sync Firestore combo docs.
3) Verify/create missing `nutritionData` docs for 12/24/30/50.
4) Generate storage manifest via `gsutil ls -r` (requires approval) or wait for Official MCP.
5) Configure 301 apex → www redirect in Hosting UI (or `firebase.json`).

---
Owner: Codex
Last updated: 2025‑09‑20 (Combos synced; WebP path enabled; audits)
