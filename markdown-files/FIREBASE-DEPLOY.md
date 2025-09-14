# Firebase Deployment Guide for Philly Wings Express

## Prerequisites Completed ✅
- Firebase project: `philly-wings`
- Firebase CLI installed and logged in as `talvarez.uh@gmail.com`
- All configuration files in place

## Required Firebase Services
Enable these in your Firebase Console (https://console.firebase.google.com):

1. **Authentication**
   - Enable Email/Password provider
   - Add your admin email

2. **Firestore Database**
   - Create database in production mode
   - Security rules already configured in `firestore.rules`

3. **Storage**
   - Enable Firebase Storage
   - Security rules already configured in `storage.rules`

4. **Hosting**
   - Already configured

## Build and Deploy Steps

### 1. Build the Project
```bash
npm run build
```

### 2. Deploy Everything
```bash
# Deploy all services
firebase deploy

# Or deploy specific services
firebase deploy --only hosting
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
firebase deploy --only firestore:indexes
```

### 3. Initialize Firestore Collections
After deployment, create these collections in Firebase Console:
- `gameDayBanners`
- `menuItems`
- `combos`
- `liveOrders`
- `reviews`
- `settings`
- `emailSubscribers`

### 4. Create Initial Settings Document
In Firestore, create a document with ID `main` in the `settings` collection:
```json
{
  "businessHours": {
    "monday": { "open": "11:00", "close": "22:00" },
    "tuesday": { "open": "11:00", "close": "22:00" },
    "wednesday": { "open": "11:00", "close": "22:00" },
    "thursday": { "open": "11:00", "close": "22:00" },
    "friday": { "open": "11:00", "close": "23:00" },
    "saturday": { "open": "11:00", "close": "23:00" },
    "sunday": { "open": "12:00", "close": "21:00" }
  },
  "deliveryPlatforms": {
    "doorDash": { "active": true, "url": "" },
    "uberEats": { "active": true, "url": "" },
    "grubHub": { "active": true, "url": "" }
  },
  "analytics": {
    "orderCount": 0,
    "lastHourOrders": 17
  }
}
```

## Test Your Deployment

### Local Testing
```bash
# Test with emulators
npm run emulators

# Test with Vite dev server
npm run dev
```

### Production URLs
- Main site: https://philly-wings.web.app
- Admin panel: https://philly-wings.web.app/admin

## Troubleshooting

### Common Issues

1. **"Permission denied" errors**
   - Check Firebase Auth is enabled
   - Verify security rules are deployed
   - Ensure you're logged in for admin access

2. **Images not loading**
   - Check Storage is enabled
   - Verify CORS settings in Firebase Storage

3. **Admin login not working**
   - Create user in Firebase Auth console
   - Use email/password authentication

### Environment Variables
Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
# Edit .env with your Firebase config
```

## Next Steps
1. Add initial content through admin panel
2. Upload menu images
3. Configure delivery platform URLs
4. Set up custom domain (phillywingsexpress.com)
5. Configure SSL certificates

## Custom Domain Setup
In Firebase Hosting:
1. Add custom domain: phillywingsexpress.com
2. Add subdomain: admin.phillywingsexpress.com
3. Follow DNS verification steps
4. Wait for SSL provisioning