# Codex Project Status — Firebase MCP Connectivity

## Current Findings
- Community Firebase MCP fails before serving requests: logs show it aborts with "Cannot connect via stdio: HTTP server already running at localhost:3000," so Codex never receives a stdio endpoint.
- Official Firebase MCP cannot start because the Firebase CLI inside this environment is unauthenticated and lacks write permission to `~/.config`, causing every command to exit early.
- Claude proposed containerizing both MCP servers (and an Admin SDK variant) so they run in isolated Docker containers using stdio transport with mounted service-account credentials. Cursor is drafting the implementation plan.

## Recent Completion: DoorDash Sides Modals Refactor
- ✅ **COMPLETED**: Refactored all sides modals from legacy code to modular architecture
- ✅ **COMPLETED**: Implemented three separate modals: fries, loaded fries, mozzarella sticks
- ✅ **COMPLETED**: Enhanced UI with professional styling, gradients, animations
- ✅ **COMPLETED**: Removed all hardcoded data, converted to Firebase-driven system
- ✅ **COMPLETED**: Fixed module import errors and JavaScript syntax issues
- 🔄 **PENDING**: Firebase data updates (fries customization, sauce categories)

## Implications
- Codex cannot currently read/write Firestore via MCP, so menu validation relies on emulator UI or manually reseeding (`node scripts/fix-menu-data.js --emulator`, `node scripts/seed-with-admin.js`).
- Sides modal updates were applied via seed definitions (fries customization, dip categories) but require local verification until the MCP path works again.
- **All sides modals are functional with fallback data** while Firebase updates are pending.

## Next Actions
1. **IMMEDIATE**: Codex-philly to update Firebase collections:
   - Add `customization.toppingsPlacement` to `menuItems/fries` document
   - Add `category: "dip"` field to dipping sauces in `sauces` collection
2. Cursor to publish the Docker-based MCP plan (community, official, Admin SDK).
3. Implement containerized MCP services and update `~/.codex/config.toml` to point to the new stdio wrappers.
4. Validate Firestore access through the new containers; once confirmed, verify updated Firebase data.
5. Document the container workflow for future sessions (start/stop scripts, credential mounts, testing commands).

_Last updated: 2025-09-30_
