# Firestore Settings Document Setup

## Adding Fields to the `main` document in `settings` collection

### 1. Business Hours
Click "+ Add field" and create:

**Field name**: `businessHours` (type: Map)

Inside businessHours, add these nested fields:

#### monday (Map)
- `open`: "11:00" (string)
- `close`: "22:00" (string)

#### tuesday (Map)
- `open`: "11:00" (string)
- `close`: "22:00" (string)

#### wednesday (Map)
- `open`: "11:00" (string)
- `close`: "22:00" (string)

#### thursday (Map)
- `open`: "11:00" (string)
- `close`: "22:00" (string)

#### friday (Map)
- `open`: "11:00" (string)
- `close`: "23:00" (string)

#### saturday (Map)
- `open`: "11:00" (string)
- `close`: "23:00" (string)

#### sunday (Map)
- `open`: "12:00" (string)
- `close`: "21:00" (string)

### 2. Delivery Platforms
**Field name**: `deliveryPlatforms` (type: Map)

Inside deliveryPlatforms, add:

#### doorDash (Map)
- `active`: true (boolean)
- `url`: "" (string)

#### uberEats (Map)
- `active`: true (boolean)
- `url`: "" (string)

#### grubHub (Map)
- `active`: true (boolean)
- `url`: "" (string)

### 3. Analytics
**Field name**: `analytics` (type: Map)

Inside analytics, add:
- `orderCount`: 0 (number)
- `lastHourOrders`: 17 (number)

### 4. Timestamp
**Field name**: `updatedAt` (type: Timestamp)
- Click the clock icon to set current time

## Alternative: Using Firebase Admin SDK

If you prefer, you can run this script locally to set up the document:

```javascript
// setup-firestore.js
const admin = require('firebase-admin');

// Initialize admin SDK (you'll need a service account key)
admin.initializeApp({
  credential: admin.credential.cert('./path-to-service-account-key.json')
});

const db = admin.firestore();

async function setupSettings() {
  const settingsData = {
    businessHours: {
      monday: { open: "11:00", close: "22:00" },
      tuesday: { open: "11:00", close: "22:00" },
      wednesday: { open: "11:00", close: "22:00" },
      thursday: { open: "11:00", close: "22:00" },
      friday: { open: "11:00", close: "23:00" },
      saturday: { open: "11:00", close: "23:00" },
      sunday: { open: "12:00", close: "21:00" }
    },
    deliveryPlatforms: {
      doorDash: { active: true, url: "" },
      uberEats: { active: true, url: "" },
      grubHub: { active: true, url: "" }
    },
    analytics: {
      orderCount: 0,
      lastHourOrders: 17
    },
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };

  try {
    await db.collection('settings').doc('main').set(settingsData);
    console.log('Settings document created successfully!');
  } catch (error) {
    console.error('Error creating settings:', error);
  }
}

setupSettings();
```

## Quick Test
After adding all fields, visit your site and check if:
1. The live order count shows "17 orders this hour"
2. The admin panel can read the settings