# Codex Continue Conversation — Philly Wings Platform Menu (2025‑09‑27)

Use this as the conversation bootstrap for a new session. It contains a succinct state snapshot and immediate next steps.

## Current State Snapshot

- SSR platform pages live behind a Firebase Functions HTTP endpoint and work for:
  - DoorDash, UberEats, Grubhub (DoorDash has the most complete UI)
- Hosting rewrite added: `/platform/**` → `platformMenu` for SSR testing.
- Admin callable `publishPlatformMenu` returns and stores public Storage URLs.
- Data fallbacks keep SSR working in emulator/dev when Firestore is incomplete (wings/combos/sauces/beverages).
- DoorDash Wings Modal was upgraded:
  - 6‑wing allocation rules, Equal Split, Clear; “No Sauce” → jump to Dips; “No Dip” → jump to Summary
  - Wing Style step and $1.50 upcharge only for bone‑in
  - Extra Dips: boneless step 4 works; “No Extra Dips” → summary
  - Summary shows friendly dip names, style, upcharge, totals; Add‑to‑Cart only on final step
- Phase 2 modularization started:
  - Shared helper module created: `wings-shared.js` (flow entry points + payload builder)
  - Wing card buttons now call `openBonelessWingModal()` / `openBoneInWingModal()`

## Important Files

- Functions entry + data fallbacks: `functions/index.js`
- Hosting: `firebase.json` (rewrite: `/platform/**`)
- DoorDash platform modules:
  - HTML: `functions/lib/platforms/doordash/html.js`
  - CSS: `functions/lib/platforms/doordash/css.js`
  - Modal: `functions/lib/platforms/doordash/modules/wings-modal-complete.js`
  - Shared (Phase 2): `functions/lib/platforms/doordash/modules/wings-shared.js`
  - JS coordinator: `functions/lib/platforms/doordash/javascript-modular.js`
- Additional SSR generators:
  - UberEats: `functions/lib/platforms/ubereats/index.js`
  - Grubhub: `functions/lib/platforms/grubhub/index.js`

## Test URLs (emulator defaults)

- Functions:
  - DoorDash: http://127.0.0.1:5002/philly-wings/us-central1/platformMenu?platform=doordash
  - UberEats: http://127.0.0.1:5002/philly-wings/us-central1/platformMenu?platform=ubereats
  - Grubhub: http://127.0.0.1:5002/philly-wings/us-central1/platformMenu?platform=grubhub
- Hosting rewrite:
  - DoorDash: http://127.0.0.1:5003/platform/doordash
- Admin:
  - Platform Menu Manager: http://127.0.0.1:5003/admin/platform-menu.html

## Immediate Next Steps (Phase 2)

1) Extract shared UI renderers into `wings-shared.js`:
   - renderSizeOptions, renderSauceOptions, renderIncludedDips, renderExtraDips, renderSummary
   - equalSplitBy6, validateAllocationBy6, calcTotals
2) Implement two small flow orchestrators using the shared builders:
   - wings-boneless.js (5 steps)
   - wings-bonein.js (6 steps)
3) Switch `openBonelessWingModal` / `openBoneInWingModal` to call new orchestrators instead of legacy `openWingModal`.
4) Parity test both flows in emulator; remove the legacy `wings-modal-complete.js` once stable.

## Optional Follow‑Ups

- Align pricing multipliers across Admin vs Functions.
- Replace Add‑to‑Cart console logging with a real cart action (Firestore or API).
- Subdomain routing for production SSR (e.g., doordash.* → function).

## Notes

- If DoorDash combos look sparse in production, SSR now derives names, images, and prices to render reliably.
- Payload builder returns: type, variant, sauces (allocation/onSide), dips, totals. Ready to integrate with cart.

---

### Continue Prompt

"Continue Phase 2 of the modular wings flow refactor. Extract shared UI renderers and helpers into `wings-shared.js`, implement `wings-boneless.js` and `wings-bonein.js` to orchestrate their step sequences with the shared functions, swap the entry points to use these orchestrators, and validate both flows end‑to‑end in the emulator. Once parity is confirmed, remove `wings-modal-complete.js`. Keep behavior unchanged during extraction; move logic in small, testable slices."

