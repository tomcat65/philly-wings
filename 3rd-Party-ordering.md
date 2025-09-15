# 3rd Party Delivery Platform Integration Guide
## Philly Wings Express

Last Updated: December 14, 2024

---

## 🎯 Executive Summary

Philly Wings Express operates as a **marketing-first website** that drives traffic to third-party delivery platforms. We do NOT process orders directly - all transactions occur on DoorDash, UberEats, or Grubhub.

### Current Architecture
- **Website**: Firebase-powered marketing site (this repo)
- **Menu Data**: Stored in Firestore (`menuItems` collection)
- **Order Processing**: 100% handled by delivery platforms
- **POS Integration**: Manual menu management on each platform

---

## 📊 Current State Analysis

### What We Have
```javascript
// Firestore Collections
- menuItems/       // Our menu data
- combos/          // Combo deals
- settings/        // Platform URLs & config
- liveOrders/      // Display-only order feed
- reviews/         // Customer reviews

// Platform Links (hardcoded)
- DoorDash: https://www.doordash.com/store/philly-wings-express
- UberEats: https://www.ubereats.com/store/philly-wings-express
- Grubhub: https://www.grubhub.com/restaurant/philly-wings-express
```

### What We DON'T Have
- ❌ API connections to delivery platforms
- ❌ Automatic menu sync
- ❌ Real-time order data
- ❌ Platform click tracking
- ❌ Conversion analytics

---

## 🔄 How Delivery Platforms Connect

### 1. DoorDash Integration Options

#### A. Manual Management (CURRENT STATE)
- Login to DoorDash Merchant Portal
- Update menu items manually
- Manage availability through Order Manager app

#### B. POS Integration (RECOMMENDED)
- **Supported POS**: Square, Toast, Clover, Checkmate
- **Setup Time**: 3-7 days
- **Benefits**:
  - Auto menu sync from POS
  - Orders flow directly to kitchen
  - No tablet needed
  - Real-time inventory updates

#### C. API Integration (ADVANCED)
- **Status**: Currently at capacity (2024)
- **Requirements**:
  - Developer account approval
  - Webhook endpoints
  - Menu API implementation
  - Self-Serve Integration Onboarding (SSIO)

### 2. UberEats Integration Options

#### A. Manual Management (CURRENT STATE)
- Uber Eats Manager dashboard
- Menu Maker tool for updates
- Tablet for order management

#### B. POS Integration (RECOMMENDED)
- **Supported POS**: Toast, Square, Clover, NCR Aloha
- **Setup Time**: 4-8 weeks
- **Process**:
  1. Register at developer.uber.com
  2. Get API credentials
  3. Test in sandbox
  4. Work with UberEats partner manager

#### C. Direct API Integration
- **Endpoints**:
  ```
  GET/PUT /eats/stores/{store_id}/menus
  POST /eats/stores/{store_id}/status
  ```
- **Requirements**: Developer approval, webhook implementation

### 3. Grubhub Integration Options

#### A. Manual Management (CURRENT STATE)
- Grubhub for Restaurants dashboard
- Portal menu updates
- Tablet-based order management

#### B. POS Integration (AVAILABLE)
- **Supported POS**: Clover, Toast, Breadcrumb, MICROS
- **Setup Process**:
  1. Login to Grubhub for Restaurants
  2. Navigate to Settings → POS Integration
  3. Select your POS system
  4. Enter API credentials

#### C. API Access
- **Status**: Case-by-case approval required
- **Alternative**: Use middleware like Parseur or KitchenHub

---

## 🚀 Recommended Implementation Strategy

### Phase 1: Foundation (IMMEDIATE)
1. **Add Click Tracking**
   ```javascript
   // Track platform clicks in Firebase Analytics
   function trackPlatformClick(platform) {
     gtag('event', 'platform_click', {
       'platform': platform,
       'timestamp': new Date(),
       'source_page': window.location.pathname
     });

     // Store in Firestore for reporting
     db.collection('analytics').add({
       event: 'platform_click',
       platform: platform,
       timestamp: firebase.firestore.FieldValue.serverTimestamp()
     });
   }
   ```

2. **Create Menu Export Tool**
   ```javascript
   // Admin tool to export menu for platforms
   async function exportMenuForPlatform(platform) {
     const menuItems = await db.collection('menuItems').get();

     const formatters = {
       doordash: formatForDoorDash,
       ubereats: formatForUberEats,
       grubhub: formatForGrubhub
     };

     return formatters[platform](menuItems);
   }
   ```

### Phase 2: Middleware Integration (30 DAYS)

**Option A: KitchenHub** (RECOMMENDED)
- Single API for all platforms
- $99-299/month
- Features:
  - Unified menu management
  - Order aggregation
  - Real-time sync
  - Analytics dashboard

**Option B: Deliverect**
- Enterprise solution
- Custom pricing
- Direct POS integration
- Advanced analytics

### Phase 3: POS Integration (60-90 DAYS)

**Recommended POS: Toast**
- Native integration with all 3 platforms
- Menu sync every 24 hours
- Order injection to kitchen
- Inventory management
- Cost: ~$150/month + hardware

**Implementation Steps:**
1. Sign up for Toast POS
2. Import menu from Firestore
3. Connect DoorDash (3 days)
4. Connect UberEats (2 weeks)
5. Connect Grubhub (1 week)

---

## 📈 Metrics & Tracking

### Current Gaps
```javascript
// What we're missing:
- Platform click-through rate (CTR)
- Conversion rate (clicks → orders)
- Average order value by platform
- Customer acquisition cost (CAC)
- Platform performance comparison
```

### Proposed Analytics Setup
```javascript
// Enhanced tracking implementation
const PlatformAnalytics = {
  // Track user journey
  trackImpression: (platform) => {},
  trackHover: (platform, duration) => {},
  trackClick: (platform) => {},

  // Estimate conversions (requires manual input)
  recordDailyOrders: async (platform, orderCount, revenue) => {
    await db.collection('platformMetrics').add({
      platform,
      date: new Date().toISOString().split('T')[0],
      orders: orderCount,
      revenue: revenue,
      clicks: await getDailyClicks(platform)
    });
  },

  // Calculate metrics
  getConversionRate: async (platform, dateRange) => {
    // clicks → orders conversion
  },

  getPlatformROI: async (platform) => {
    // revenue vs commission fees
  }
};
```

---

## 🔧 Technical Implementation Details

### Current Menu Structure (Firestore)
```javascript
{
  // menuItems collection
  id: "wing-6-count",
  name: "6 Wings",
  description: "Perfect solo order. Choose your sauce.",
  category: "wings",
  price: null,  // Prices on platforms only
  image: "firebase-storage-url",
  active: true,
  sortOrder: 1,

  // Platform-specific fields (proposed)
  platformData: {
    doordash: {
      id: "dd-123456",
      price: 8.99,
      available: true
    },
    ubereats: {
      id: "ue-789012",
      price: 9.49,
      available: true
    },
    grubhub: {
      id: "gh-345678",
      price: 8.99,
      available: true
    }
  }
}
```

### Webhook Endpoints (Future State)
```javascript
// Express endpoints for platform webhooks
app.post('/webhooks/doordash/order', (req, res) => {
  // Handle new order notification
  const order = req.body;
  updateLiveOrdersFeed(order);
  updateAnalytics('doordash', order);
});

app.post('/webhooks/ubereats/menu-sync', (req, res) => {
  // Sync menu changes back to Firestore
  const menuUpdates = req.body;
  syncMenuWithFirestore('ubereats', menuUpdates);
});
```

---

## 💰 Cost-Benefit Analysis

### Current State (Manual)
- **Time**: 2-3 hours/week managing 3 platforms
- **Errors**: ~5% order issues from menu inconsistencies
- **Opportunity Cost**: Can't track conversions or optimize

### With POS Integration
- **Setup Cost**: $500-1000 (one-time)
- **Monthly Cost**: $150-300 (POS + middleware)
- **Time Saved**: 10+ hours/month
- **Error Reduction**: <1% order issues
- **ROI**: Break-even in 2-3 months

### Revenue Impact
```
Current (estimated):
- 100 daily orders across platforms
- No visibility into platform performance
- Can't optimize marketing spend

With Integration:
- Track platform-specific conversion
- Optimize menu for each platform
- A/B test pricing strategies
- Estimated 15-20% revenue increase
```

---

## 🎬 Action Items

### Immediate (This Week)
1. [ ] Add GTM/GA4 click tracking to platform buttons
2. [ ] Create admin page for platform metrics input
3. [ ] Set up daily metrics collection in Firestore
4. [ ] Document current manual menu update process

### Short Term (30 Days)
1. [ ] Evaluate middleware solutions (KitchenHub, Deliverect)
2. [ ] Get quotes from POS providers
3. [ ] Create menu export tool for CSV/JSON
4. [ ] Build platform performance dashboard

### Long Term (90 Days)
1. [ ] Implement chosen POS system
2. [ ] Complete platform integrations
3. [ ] Automate menu sync workflow
4. [ ] Launch conversion tracking system

---

## 📚 Resources

### Platform Documentation
- [DoorDash Developer Portal](https://developer.doordash.com)
- [Uber Eats API Docs](https://developer.uber.com/docs/eats)
- [Grubhub Partner Portal](https://get.grubhub.com)

### Middleware Solutions
- [KitchenHub](https://www.trykitchenhub.com) - Unified delivery API
- [Deliverect](https://www.deliverect.com) - Enterprise integration
- [Otter](https://www.tryotter.com) - Order management
- [Checkmate](https://www.checkmate.menu) - Menu aggregator

### POS Systems with Native Integration
- [Toast POS](https://pos.toasttab.com) - Best overall
- [Square for Restaurants](https://squareup.com/us/en/point-of-sale/restaurants)
- [Clover](https://www.clover.com/pos-systems/restaurant)

---

## 🚨 Critical Considerations

### Data Ownership
- Menu data lives in YOUR Firestore
- Platforms have their own copy
- Changes must sync bi-directionally
- Always maintain source of truth

### Platform Dependencies
- Each platform can change APIs without notice
- Commission rates vary (15-30%)
- Exclusive deals may limit multi-platform strategy
- Terms of Service restrictions on data usage

### Security Requirements
- API keys must be server-side only
- Webhook endpoints need verification
- PCI compliance for any payment data
- GDPR/CCPA for customer information

---

## 📞 Next Steps

1. **Review this document with stakeholders**
2. **Decide on integration strategy** (Manual → Middleware → POS)
3. **Budget approval** for chosen solution
4. **Contact platform partner managers** for better rates
5. **Begin Phase 1 implementation** (tracking & metrics)

---

*Document maintained by: Philly Wings Tech Team*
*For questions: tech@phillywingsexpress.com*