# Firebase Initial Data Setup Guide

This guide contains all the data structures and collections needed to initialize the Philly Wings Express Firebase project.

## Project Information
- **Project ID**: philly-wings
- **Project Name**: philly-wings
- **Default URL**: https://philly-wings.web.app
- **Admin URL**: https://philly-wings.web.app/admin

## Required Firebase Services
1. **Authentication** - Email/Password enabled
2. **Firestore Database** - Production mode
3. **Storage** - For image uploads
4. **Hosting** - Already deployed

## Firestore Collections and Documents

### 1. Settings Collection
**Collection**: `settings`  
**Document ID**: `main`

```json
{
  "businessHours": {
    "monday": { "open": "10:30am", "close": "07:15pm" },
    "tuesday": { "open": "10:30am", "close": "07:15pm" },
    "wednesday": { "open": "10:30am", "close": "07:15pm" },
    "thursday": { "open": "10:30am", "close": "07:15pm" },
    "friday": { "open": "09:30am", "close": "08:15pm" },
    "saturday": { "open": "09:30am", "close": "08:15pm" },
    "sunday": { "open": "10:30", "close": "06:15pm" }
  },
  "deliveryPlatforms": {
    "doorDash": { 
      "active": true, 
      "url": "https://www.doordash.com/store/philly-wings-express" 
    },
    "uberEats": { 
      "active": true, 
      "url": "https://www.ubereats.com/store/philly-wings-express" 
    },
    "grubHub": { 
      "active": true, 
      "url": "https://www.grubhub.com/restaurant/philly-wings-express" 
    }
  },
  "socialMedia": {
    "instagram": "@phillywingsexpress",
    "facebook": "phillywingsexpress",
    "tiktok": "@phillywings"
  },
  "analytics": {
    "orderCount": 0,
    "lastHourOrders": 17
  },
  "updatedAt": "SERVER_TIMESTAMP"
}
```

### 2. Game Day Banners Collection
**Collection**: `gameDayBanners`

Sample document:
```json
{
  "active": true,
  "team1": "EAGLES",
  "team2": "COWBOYS",
  "gameDate": "2025-09-14T17:00:00.000Z",
  "message": "Order your Tailgate Special now",
  "specialOffer": "Free delivery on orders $30+",
  "priority": 1,
  "createdAt": "SERVER_TIMESTAMP",
  "updatedAt": "SERVER_TIMESTAMP"
}
```

### 3. Menu Items Collection
**Collection**: `menuItems`

Sample wing items:
```json
[
  {
    "name": "Classic Buffalo",
    "description": "The OG jawn. Crispy wings tossed in traditional buffalo sauce.",
    "category": "wings",
    "price": 12.99,
    "heatLevel": 3,
    "active": true,
    "featured": true,
    "sortOrder": 1,
    "ingredients": ["chicken", "buffalo sauce", "butter", "cayenne"],
    "allergens": ["dairy"],
    "imageUrl": "",
    "createdAt": "SERVER_TIMESTAMP",
    "updatedAt": "SERVER_TIMESTAMP"
  },
  {
    "name": "Honey Jawn Fire",
    "description": "Sweet at first, then BAM! Don't say we ain't warn youse.",
    "category": "wings",
    "price": 13.99,
    "heatLevel": 4,
    "active": true,
    "featured": true,
    "sortOrder": 2,
    "ingredients": ["chicken", "honey", "habanero", "garlic"],
    "allergens": [],
    "imageUrl": "",
    "createdAt": "SERVER_TIMESTAMP",
    "updatedAt": "SERVER_TIMESTAMP"
  },
  {
    "name": "Dallas Crusher",
    "description": "This jawn crushes Cowboys fans AND your taste buds.",
    "category": "wings",
    "price": 14.99,
    "heatLevel": 5,
    "active": true,
    "featured": true,
    "sortOrder": 3,
    "ingredients": ["chicken", "ghost pepper", "carolina reaper", "special blend"],
    "allergens": [],
    "imageUrl": "",
    "createdAt": "SERVER_TIMESTAMP",
    "updatedAt": "SERVER_TIMESTAMP"
  },
  {
    "name": "Gritty's Garlic Parm",
    "description": "Smooth as Gritty on ice. This jawn smacks different.",
    "category": "wings",
    "price": 12.99,
    "heatLevel": 1,
    "active": true,
    "featured": true,
    "sortOrder": 4,
    "ingredients": ["chicken", "garlic", "parmesan", "herbs"],
    "allergens": ["dairy"],
    "imageUrl": "",
    "createdAt": "SERVER_TIMESTAMP",
    "updatedAt": "SERVER_TIMESTAMP"
  }
]
```

### 4. Combos Collection
**Collection**: `combos`

Sample combo:
```json
{
  "name": "The Tailgater",
  "description": "20 wings, large fries, and 4 drinks. Perfect for the squad.",
  "items": [
    { "itemId": "wings-20", "quantity": 1 },
    { "itemId": "fries-large", "quantity": 1 },
    { "itemId": "drinks", "quantity": 4 }
  ],
  "originalPrice": 54.99,
  "comboPrice": 44.99,
  "savings": 10.00,
  "active": true,
  "featured": true,
  "gameDay": true,
  "limitedTime": false,
  "sortOrder": 1,
  "imageUrl": "",
  "createdAt": "SERVER_TIMESTAMP",
  "updatedAt": "SERVER_TIMESTAMP"
}
```

### 5. Reviews Collection
**Collection**: `reviews`

Sample reviews:
```json
[
  {
    "customerName": "Chris M.",
    "rating": 5,
    "text": "Yo these jawns SMACK! Dallas Crusher had me sweatin' but I'd run it back.",
    "platform": "DoorDash",
    "featured": true,
    "verified": true,
    "createdAt": "SERVER_TIMESTAMP"
  },
  {
    "customerName": "Maria S.",
    "rating": 5,
    "text": "Crispy, juicy, perfect. My new Sunday tradition.",
    "platform": "Uber Eats",
    "featured": true,
    "verified": true,
    "createdAt": "SERVER_TIMESTAMP"
  },
  {
    "customerName": "James T.",
    "rating": 5,
    "text": "Forget the cheesesteaks. These wings are Philly's best kept secret.",
    "platform": "Grubhub",
    "featured": true,
    "verified": true,
    "createdAt": "SERVER_TIMESTAMP"
  }
]
```

### 6. Live Orders Collection
**Collection**: `liveOrders`

Sample orders (for ticker display):
```json
[
  {
    "customerName": "Mike",
    "neighborhood": "Fishtown",
    "items": "copped The Tailgater jawn",
    "timestamp": "SERVER_TIMESTAMP",
    "display": true
  },
  {
    "customerName": "Sarah",
    "neighborhood": "Mayfair",
    "items": "said 'lemme get that MVP Meal'",
    "timestamp": "SERVER_TIMESTAMP",
    "display": true
  },
  {
    "customerName": "Tommy",
    "neighborhood": "Delco",
    "items": "grabbed 50 wings for the squad",
    "timestamp": "SERVER_TIMESTAMP",
    "display": true
  }
]
```

### 7. Email Subscribers Collection
**Collection**: `emailSubscribers`

Structure (created automatically when users sign up):
```json
{
  "email": "customer@example.com",
  "source": "website",
  "subscribedAt": "SERVER_TIMESTAMP",
  "tags": ["newsletter", "perks"]
}
```

## Authentication Setup

### Admin User
Create at least one admin user in Firebase Authentication:
- Email: [admin@phillywingsexpress.com]
- Password: [HVqrqzqiA3703!7S]
- This user can access the admin panel at /admin

## Storage Structure

Create these folders in Firebase Storage:
- `/menu-items/` - For menu item images
- `/combos/` - For combo deal images
- `/banners/` - For promotional banners

## Security Rules Status

### Firestore Rules (firestore.rules)
- ✅ Public read for active content
- ✅ Admin write access with authentication
- ✅ Email collection allows public creation

### Storage Rules (storage.rules)
- ✅ Public read access
- ✅ Admin write access with authentication
- ✅ 5MB file size limit

## Testing Checklist

After initialization, verify:
- [ ] Game day banner appears with "17 orders this hour"
- [ ] Menu items load on main page
- [ ] Reviews display in social proof section
- [ ] Live orders ticker shows recent orders
- [ ] Admin can login at /admin
- [ ] Email signup form works
- [ ] Business hours display correctly

## Notes for Firebase MCP

When using Firebase MCP to initialize:
1. Replace all instances of "SERVER_TIMESTAMP" with `serverTimestamp()`
2. Generate unique document IDs for collections without specified IDs
3. Ensure all Date strings are converted to proper Timestamp objects
4. The `settings` collection must have exactly one document with ID `main`

## Environment Variables Needed

Create `.env` file with:
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=philly-wings.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=philly-wings
VITE_FIREBASE_STORAGE_BUCKET=philly-wings.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```