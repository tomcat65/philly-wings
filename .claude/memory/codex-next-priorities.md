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

## Session Summary (2025‑09‑19)
- Official Firebase MCP did not load in this run; Community MCP worked.
- Verified Firestore connectivity and listed root collections.
- Seeded `menuItems/wings` with 5 variants and modifier groups: `sauce_choice`, `wing_style`, `extra_sauces`.
- Updated docs: `docs/firebase/STATUS.md` now shows `menuItems (1 doc)` and includes the new path.
- Updated backup: `backups/firebase-snapshot.json` now reflects 1 `menuItems` doc.
- Storage list via Community returned empty (likely listing blocked). Known assets still referenced and load via public URLs.

## To‑Dos

### 1) Seed Menu Items (Firestore)
- Done: `wings` created with variants `6/12/24/30/50` and modifier groups attached.
- Next: add remaining base items using same schema:
  - `fries` variants: `fries-regular`, `fries-large`, `loaded-fries`
  - `mozzarella_sticks` variants: `mozzarella-sticks-4`, `-8`, `-12`, `-16`
  - `drinks` variants: `water-bottle`

### 2) Combos — Align JSON + Firestore
- Ensure `public/data/combos.json` includes all visible combos:
  - Add “Game Day 30” (present in Firestore, missing in JSON if so).
  - Add “Date Night Dozen” (if desired for web).
- Verify Tailgater image URL; keep badges/descriptions consistent.
- Keep Firestore combos in sync (IDs and imageUrl match web JSON).

### 3) Nutrition Data
- Verify docs exist in `nutritionData` for: `12-wings`, `24-wings`, `30-wings`, `50-wings` (6‑wings present).
- Confirm sides/combos entries: `french-fries`, `loaded-fries`, `mozzarella-sticks`, `mvp-meal`.

### 4) Storage Manifest & WebP Audit
- Now that bucket is fixed, attempt full object listing using Community MCP (temporary) to produce manifest:
  - `docs/firebase/storage-manifest.json` and `.md`
- Verify for every referenced image there is a WebP in `images/resized/`:
  - `_1920x1080.webp` hero/banners; `_800x800.webp` cards; `_200x200.webp` thumbs.
- Upload missing WebP assets; keep originals as fallback.

### 5) Hosting Canonical Redirect
- In Firebase Hosting → Custom domains, set 301 from apex `phillywingsexpress.com` → `https://www.phillywingsexpress.com` (preserve path & query) or via `firebase.json`.
- Confirm both apex and www SSL “Provisioned”.

### 6) Backups / Guardrails
- Export Firestore after seeding: `menuItems`, `combos`, `sauces`, `modifierGroups`, `nutritionData`.
- (Optional) Add admin export/import for menus (admin‑only) for quick restore.

## Proposed Next Steps (Execution Plan)
1) Seed remaining `menuItems` (fries, mozzarella sticks, drinks).
2) Patch `public/data/combos.json` for parity (Game Day 30, Date Night Dozen) and sync Firestore combo docs.
3) Verify/create missing `nutritionData` docs for 12/24/30/50.
4) Generate storage manifest via `gsutil ls -r` (requires approval) or wait for Official MCP.
5) Configure 301 apex → www redirect in Hosting UI (or `firebase.json`).

---
Owner: Codex
Last updated: 2025‑09‑19 (Community MCP seeded wings)
