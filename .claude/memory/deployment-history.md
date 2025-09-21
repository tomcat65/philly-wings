# Deployment History & Release Notes

## Recent Deployments

### v2.3.1 - Sept 18, 2025 (Current Production)
**Time**: 2:34 PM EST
**Duration**: 3 minutes
**Downtime**: Zero
**Changes**:
- ✅ WebP image optimization
- ✅ Menu snapshot system  
- ✅ Platform-specific pricing display
- ✅ Admin UI improvements

**Rollback Plan**: Revert to v2.3.0 if issues
**Status**: Stable, no issues reported

### v2.3.0 - Sept 15, 2025
**Time**: 10:15 AM EST
**Major Release**: New modifier system
**Changes**:
- ✅ Drag-drop modifier groups (Sally's design)
- ✅ Nutrition calculator integration (Erika's formulas)
- ✅ Bundle pricing engine (Richard's logic)
- ✅ Performance improvements

**Issues**: 
- Minor CSS bug on iPad (fixed in v2.3.1)
- All platforms confirmed menu updates

### v2.2.8 - Sept 10, 2025
**Time**: 8:00 PM EST
**Emergency Fix**: Platform sync issue
**Problem**: DoorDash prices showing incorrect
**Solution**: Fixed rounding error in price calculation
**Deployment Time**: 8 minutes (rushed)

## Deployment Checklist

```bash
# Pre-deployment
✅ All tests passing
✅ Lighthouse score > 90
✅ Richard approved pricing logic
✅ Sally approved UX changes
✅ Erika verified nutrition data
✅ Backup current production

# Deployment steps
1. git tag -a v2.3.1 -m "WebP optimization and fixes"
2. npm run build
3. firebase deploy --only hosting
4. firebase deploy --only functions
5. Verify all platform menu URLs
6. Clear CDN cache
7. Monitor error logs for 30 mins

# Post-deployment
✅ Check all platform integrations
✅ Verify admin panel access
✅ Test order flow on each platform
✅ Monitor performance metrics
✅ Update status page
```

## Rollback Procedures

### Quick Rollback (< 5 minutes)
```bash
# If issues detected immediately
firebase hosting:rollback
firebase functions:rollback

# Verify rollback
curl https://phillywingsexpress.com/version
```

### Full Rollback Process
```bash
# For major issues
git checkout v2.3.0
npm install
npm run build
firebase deploy --project production

# Update DNS if needed
# Notify platforms of URL changes
# Clear all caches
```

## Version History

| Version | Date | Type | Key Changes | Status |
|---------|------|------|-------------|---------|
| v2.3.1 | Sept 18 | Patch | WebP images, bug fixes | ✅ Stable |
| v2.3.0 | Sept 15 | Minor | Modifier system | ✅ Stable |
| v2.2.8 | Sept 10 | Patch | Price sync fix | ✅ Stable |
| v2.2.7 | Sept 5 | Patch | Service worker | ✅ Stable |
| v2.2.0 | Aug 28 | Minor | Admin redesign | ✅ Stable |
| v2.1.0 | Aug 15 | Minor | Platform pages | ✅ Stable |
| v2.0.0 | Aug 1 | Major | Firebase migration | ✅ Stable |

## Platform Update Log

### DoorDash
- Sept 18: Sent new menu URL (v2.3.1)
- Sept 16: Confirmed receipt, updated within 48hrs
- Aug 30: Price update request
- Aug 15: Initial platform pages launch

### UberEats  
- Sept 18: Auto-sync successful
- Sept 15: Manual update for modifiers
- Sept 1: API integration activated
- Aug 15: Platform pages accepted

### Grubhub
- Sept 18: Email sent with new URL
- Sept 17: Phone confirmation required
- Sept 5: Manual menu update
- Aug 20: Platform rep training

## Deployment Metrics

### Average Deployment Time
- Hosting only: 2-3 minutes
- Functions only: 4-5 minutes  
- Full deployment: 6-8 minutes
- With rollback: < 5 minutes

### Success Rate
- Successful deploys: 67
- Failed deploys: 3
- Rollbacks needed: 1
- Success rate: 95.7%

## CI/CD Pipeline Status

```yaml
# Current GitHub Actions workflow
name: Deploy to Production
on:
  push:
    tags:
      - 'v*'

jobs:
  test:
    - Run linter
    - Run unit tests
    - Run integration tests
    - Check bundle size
    
  deploy:
    - Build production bundle
    - Deploy to Firebase
    - Run smoke tests
    - Notify Slack channel
```

## Monitoring & Alerts

### Deployment Notifications
- Slack: #philly-wings-deploys
- Email: tom@phillywingsexpress.com
- SMS: On critical failures only

### Health Checks
```javascript
// Automated checks after deploy
const healthChecks = [
  'https://phillywingsexpress.com/health',
  'https://phillywingsexpress.com/api/menu',
  'https://phillywingsexpress.com/admin/health'
];

// Platform menu checks
const platformChecks = [
  '/menu/doordash/latest',
  '/menu/ubereats/latest',
  '/menu/grubhub/latest'
];
```

## Lessons from Failed Deployments

### Aug 5 - Firebase Function Memory Issue
**Problem**: Functions timing out
**Cause**: Insufficient memory allocation
**Fix**: Increased from 256MB to 512MB
**Prevention**: Load test new functions

### July 20 - Cache Invalidation Bug
**Problem**: Old prices showing after update
**Cause**: CDN cache not cleared
**Fix**: Manual cache purge
**Prevention**: Auto-purge in deploy script

### July 12 - Database Migration Failure
**Problem**: Menu items disappeared  
**Cause**: Migration script error
**Fix**: Restored from backup
**Prevention**: Test migrations on staging