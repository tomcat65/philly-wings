# Philly Wings Express - Catering System Setup Guide

Complete setup instructions for the ezCater-integrated catering system.

## 📋 **Overview**

The catering system has three main components:
1. **Frontend Showcase** (phillywingsexpress.com/catering) - Marketing page, no pricing
2. **ezCater Integration** - Menu sync + order webhooks
3. **Admin Dashboard** - Order management

---

## 🚀 **Quick Start (Local Development)**

### 1. Install Dependencies

```bash
# Install functions dependencies
cd functions
npm install
cd ..

# Verify axios was installed
cd functions && npm list axios
```

### 2. Seed Catering Data (Emulator)

```bash
# Start Firebase emulators (if not already running)
firebase emulators:start --only firestore,functions,hosting

# In another terminal, seed data to emulator
node scripts/seed-catering-data.js --emulator
```

**Expected Output:**
```
🌱 Seeding catering packages to Firestore...
✅ Prepared: The Lunch Box Special (Tier 1, serves 10-12)
✅ Prepared: The Sampler Spread (Tier 1, serves 12-15)
... (6 packages total)
🎉 Successfully seeded 6 catering packages!

📅 Initializing catering availability for next 90 days...
✅ Initialized: 2025-10-13
... (90 days total)
🎉 Successfully initialized 90 days of availability!
```

### 3. Configure ezCater Credentials (Emulator)

```bash
# Set test credentials for local development
firebase functions:config:set \
  ezcater.api_token="test_token_for_emulator" \
  ezcater.webhook_secret="test_secret_for_emulator" \
  ezcater.api_url="https://api.ezcater.com/api/v3"

# Verify config
firebase functions:config:get
```

### 4. Test Firebase Functions

```bash
# Functions are available at:
# - http://localhost:5002/philly-wings/us-central1/ezCaterOrderWebhook (webhook)
# - http://localhost:5002/philly-wings/us-central1/syncCateringMenuToEzCater (callable)

# Test webhook with curl
curl -X POST http://localhost:5002/philly-wings/us-central1/ezCaterOrderWebhook \
  -H "Content-Type: application/json" \
  -H "x-ezcater-signature: test_signature" \
  -d '{
    "order_id": "TEST-001",
    "customer": {
      "company_name": "Test Company",
      "contact_name": "John Doe",
      "email": "john@test.com",
      "phone": "555-1234"
    },
    "items": [{
      "name": "The Lunch Box Special",
      "serves": 12,
      "wing_count": 60,
      "modifiers": [{
        "name": "Sauce Selections",
        "selected_options": ["Philly Classic Hot", "Northeast Hot Lemon", "Honey BBQ"]
      }]
    }],
    "delivery_date": "2025-10-20T12:00:00Z",
    "delivery_time": "12:00 PM",
    "delivery_address": {
      "street": "123 Market St",
      "city": "Philadelphia",
      "state": "PA",
      "zip": "19103"
    },
    "special_instructions": "Please deliver to reception desk",
    "total_price": 149.99
  }'
```

### 5. Verify in Firestore Emulator UI

Open http://localhost:4002 and check:
- `cateringPackages` - Should have 6 documents
- `cateringAvailability` - Should have 90 documents
- `cateringOrders` - Should have your test order (if webhook test succeeded)

---

## 🌐 **Production Setup**

### Step 1: ezCater Account Setup

1. **Apply as Restaurant Partner**
   - Email: menus@ezcater.com
   - Subject: "New Restaurant Partner Application - Philly Wings Express"
   - Include: Business name, address, phone, EIN, bank account info

2. **Complete ezManage Profile**
   - Business hours: (Your hours)
   - Service area: 10-mile radius from location
   - Lead time: 24 hours minimum
   - Contact info for support

3. **Create API User**
   - Login to ezManage dashboard
   - Navigate to: Settings → API Access
   - Click "Create API User"
   - Copy the API token (save securely!)

4. **Request Webhook Setup**
   - Email: api_support@ezcater.com
   - Provide webhook URL: `https://us-central1-philly-wings.cloudfunctions.net/ezCaterOrderWebhook`
   - They will provide webhook secret

### Step 2: Configure Production Credentials

```bash
# Set production credentials
firebase functions:config:set \
  ezcater.api_token="YOUR_ACTUAL_API_TOKEN_FROM_EZMANAGE" \
  ezcater.webhook_secret="YOUR_WEBHOOK_SECRET_FROM_EZCATER" \
  ezcater.api_url="https://api.ezcater.com/api/v3"

# Verify
firebase functions:config:get
```

### Step 3: Seed Production Data

```bash
# Seed to production Firestore (NO --emulator flag)
node scripts/seed-catering-data.js
```

### Step 4: Deploy Functions

```bash
# Deploy catering functions only
firebase deploy --only functions:syncCateringMenuToEzCater,functions:ezCaterOrderWebhook,functions:onCateringPackageUpdate

# Or deploy all functions
firebase deploy --only functions
```

### Step 5: Deploy Security Rules

```bash
firebase deploy --only firestore:rules
```

### Step 6: Test Menu Sync

```bash
# Call the sync function manually via Firebase CLI
firebase functions:call syncCateringMenuToEzCater

# Or via Firebase Console:
# 1. Go to Firebase Console → Functions
# 2. Find syncCateringMenuToEzCater
# 3. Click "Test function"
# 4. Use empty request data: {}
```

### Step 7: Verify in ezManage

1. Login to ezManage dashboard
2. Navigate to Menu section
3. You should see 3 categories with 6 total packages:
   - Office Lunch Packages (2 items)
   - Party Packages (2 items)
   - Large Event Packages (2 items)

---

## 🧪 **Testing the Complete Flow**

### Test 1: Menu Sync

```bash
# Check sync logs in Firestore
# Collection: ezCaterSyncLog
# Should have entries with status: "success" or "error"
```

### Test 2: Order Webhook (Production)

```bash
# Place a test order on ezCater (use smallest package)
# Watch Firestore for new document in cateringOrders
# Check notifications collection for new notification
```

### Test 3: Availability Tracking

```bash
# After test order, check cateringAvailability
# Find the document for your test order date
# Verify totalWingsOrdered and ordersCount incremented
```

---

## 🔐 **Security Notes**

### Firestore Rules
- `cateringPackages` - Public read (for frontend), admin write only
- `cateringOrders` - Admin read only (contains PII), no direct writes (server-only via admin SDK)
- `cateringAvailability` - Admin read only, Functions write only
- `ezCaterSyncLog` - Admin read only, Functions write only
- `notifications` - Admin read only, Functions write only

### Admin Custom Claims

Set admin custom claim for authorized users:

```javascript
// Via Firebase Admin SDK or Firebase CLI
const admin = require('firebase-admin');
admin.auth().setCustomUserClaims(uid, { admin: true });
```

Or via Firebase CLI:
```bash
firebase auth:import users.json --hash-algo=bcrypt
```

---

## 📊 **Monitoring & Debugging**

### Check Function Logs

```bash
# View recent logs
firebase functions:log

# Filter for catering functions
firebase functions:log --only syncCateringMenuToEzCater,ezCaterOrderWebhook
```

### Firestore Collections to Monitor

1. **ezCaterSyncLog** - Menu sync history
   - Check `status` field for errors
   - Review `response` or `error` fields

2. **cateringOrders** - Incoming orders
   - Verify `source: 'ezcater'`
   - Check `status` and `paymentStatus`

3. **notifications** - Alert queue
   - Type: `new_catering_order`
   - Admin dashboard displays these

4. **cateringAvailability** - Capacity tracking
   - Monitor `totalWingsOrdered` vs `maxDailyCapacity`
   - Alert if approaching limits (>800 wings)

---

## 🚨 **Troubleshooting**

### Issue: Menu sync fails with 401 Unauthorized

**Solution:**
```bash
# Verify API token is set correctly
firebase functions:config:get ezcater.api_token

# If missing or wrong, update it
firebase functions:config:set ezcater.api_token="CORRECT_TOKEN"

# Redeploy functions
firebase deploy --only functions
```

### Issue: Webhook returns 401 Invalid Signature

**Causes:**
1. Webhook secret not configured
2. Webhook secret doesn't match ezCater's
3. Request body modified before signature check

**Solution:**
```bash
# Verify webhook secret
firebase functions:config:get ezcater.webhook_secret

# Contact api_support@ezcater.com to verify correct secret
```

### Issue: Orders not appearing in Firestore

**Check:**
1. Webhook URL registered with ezCater correctly
2. Function logs for errors: `firebase functions:log`
3. Firestore security rules allow server writes
4. Function has permission to write to Firestore

### Issue: Availability not updating

**Check:**
1. Order webhook successfully processing
2. `deliveryDate` field present in order
3. `wingCount` field present in order
4. `cateringAvailability` document exists for date

---

## 📝 **Common Tasks**

### Add a New Catering Package

1. Add package to `scripts/seed-catering-data.js`
2. Run seed script: `node scripts/seed-catering-data.js`
3. Menu auto-syncs to ezCater (via Firestore trigger)
4. Or manually sync: `firebase functions:call syncCateringMenuToEzCater`

### Update Package Pricing

1. Edit package in Firestore (via Firebase Console or admin dashboard)
2. Auto-sync triggers on write
3. Or manually sync if needed

### Temporarily Disable Catering

**Option 1: Pause in ezManage Dashboard**
- Login to ezManage
- Temporarily disable menu

**Option 2: Set All Packages Inactive**
```javascript
// Via Firestore or admin dashboard
// Set active: false on all packages
// Then manually sync menu
```

---

## 🎯 **Next Steps After Setup**

1. ✅ **Photography** - Schedule professional shoot ($800-1200)
2. ✅ **Frontend** - Build marketing showcase page
3. ✅ **Admin Dashboard** - Build order management UI
4. ✅ **Testing** - Place real test orders
5. ✅ **Soft Launch** - Announce on social media
6. ✅ **Monitoring** - Track orders and performance

---

## 📞 **Support Contacts**

- **ezCater Menus:** menus@ezcater.com
- **ezCater API Support:** api_support@ezcater.com
- **ezCater Account Manager:** (Assigned after approval)

---

## 📂 **File Structure Reference**

```
philly-wings/
├── scripts/
│   └── seed-catering-data.js          ← Seed 6 packages + availability
├── functions/
│   ├── ezcater/
│   │   ├── menuSync.js                ← Menu API sync logic
│   │   └── orderWebhook.js            ← Order webhook handler
│   ├── index.js                       ← Function exports
│   └── package.json                   ← Added axios dependency
├── firestore.rules                    ← Security rules (updated)
└── CATERING_SETUP.md                  ← This file
```

---

**Questions? Issues? Check Firebase Function logs or Firestore collections for debugging!**
