# Technical Architecture Decisions

## Why Vanilla JS Instead of React?
**Date**: 2025-01-02
**Decision**: Use vanilla JavaScript for entire frontend
**Rationale**:
- Faster initial load (critical for mobile users on slow connections)
- No build step complexity 
- Easier for small team maintenance
- Firebase Hosting serves static files efficiently
- Total JS bundle: 23KB vs React minimum 140KB

## Image Optimization Strategy  
**Date**: 2025-01-15
**Decision**: WebP with fallbacks
**Implementation**:
- Convert all images to WebP (68% smaller)
- Keep JPEG fallbacks for older browsers
- Lazy load below the fold
- Serve responsive sizes (320w, 640w, 1280w)
- Cache for 1 year with immutable naming

## Database Structure
**Date**: 2025-01-05
**Decision**: Denormalized for read performance
**Details**:
- Published menus are immutable snapshots
- Prices calculated at publish time (not runtime)
- Audit trail on all changes
- Separate collections for live vs published data

## Platform Integration Approach
**Date**: 2025-01-08
**Decision**: Pull model, not push
**Why**: 
- Platforms pull from our public URLs
- No API keys to manage
- No rate limits to worry about
- Simple rollback (just give them old URL)

## Firebase Functions Strategy
**Date**: 2025-01-12
**Decision**: Minimal use, only for critical paths
**Current Functions**:
1. Image optimization on upload
2. Menu publish/snapshot creation
3. Analytics aggregation (runs nightly)

## Admin Authentication
**Date**: 2025-01-03
**Decision**: Simple Firebase Auth with single admin user
**Future**: May add role-based access when team grows

## Performance Budget
**Date**: 2025-01-10
**Targets**:
- First Paint: < 1s
- Interactive: < 2s
- Total Page Weight: < 500KB
- Firebase Reads: < 50k/month