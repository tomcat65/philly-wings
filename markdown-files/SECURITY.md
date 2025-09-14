# Security Configuration Guide

## Overview
This document outlines the security improvements implemented for the Philly Wings Firebase project.

## Environment Variables Setup

### Required Environment Variables
Create a `.env` file in the project root with the following variables:

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Admin Configuration
VITE_ADMIN_EMAIL=admin@phillywingsexpress.com

# For server-side scripts (optional)
FIREBASE_PROJECT_ID=your_project_id
```

### Service Account (for admin scripts)
For scripts that require admin access, you can either:

1. Use Firebase CLI authentication:
   ```bash
   firebase login
   ```

2. Use a service account key:
   - Download from Firebase Console > Project Settings > Service Accounts
   - Save as `service-account.json` in project root
   - Or set `GOOGLE_APPLICATION_CREDENTIALS` environment variable

## Security Rules

### Firestore Security Rules
The Firestore rules have been updated with proper authentication and authorization:

- **Public Read Collections**: `settings`, `menuItems`, `combos`, `liveOrders`, `reviews`, `gameDayBanners`
- **Authenticated Access**: Orders, user profiles
- **Admin Only**: Write operations on most collections, admin collection access
- **User-specific**: Users can only access their own orders and profiles

Key security features:
- Input validation for all write operations
- Role-based access control (admin vs regular users)
- Owner-based access for user-specific data
- Default deny for undefined paths

### Storage Security Rules
Storage rules have been updated with:

- **Public Read Paths**: `/public/`, `/menu-items/`, `/combos/`, `/game-day-banners/`
- **Authenticated Write**: All write operations require authentication
- **Admin Only**: Admin uploads folder with 50MB limit
- **File Type Validation**: Image-only uploads for most paths
- **Size Limits**:
  - Public images: 5MB
  - Banners: 10MB
  - Profile images: 2MB
  - Admin uploads: 50MB

## Files Updated

### Removed Hardcoded Credentials From:
- `populate-firestore.html` - Now shows placeholder values with validation
- `populate-firestore-client.js` - Uses environment variables with validation
- All setup scripts - Now use environment variables

### Updated to Use Environment Variables:
- `populate-firestore.js`
- `setup-main-doc.js`
- `setup-settings-main.js`
- `setup-settings-admin.js`
- `create-admin-user.js`
- `setup-with-service-account.js`

### Security Files:
- `.gitignore` - Updated to exclude all environment files and service account keys
- `firestore.rules` - Production-ready security rules
- `storage.rules` - Production-ready storage rules

## Best Practices Implemented

1. **No Hardcoded Credentials**: All sensitive data moved to environment variables
2. **Input Validation**: Security rules validate data types and required fields
3. **Least Privilege**: Users only have access to what they need
4. **Admin Role**: Separate admin role with custom claims
5. **File Type Restrictions**: Storage only accepts appropriate file types
6. **Size Limits**: Prevent abuse with file size restrictions
7. **Default Deny**: Explicit allow rules, default deny everything else

## Deployment Checklist

Before deploying to production:

1. ✅ Create `.env` file with production credentials
2. ✅ Deploy security rules: `firebase deploy --only firestore:rules,storage:rules`
3. ✅ Set up admin users with custom claims
4. ✅ Test authentication flows
5. ✅ Verify security rules work as expected
6. ✅ Rotate any exposed API keys in Firebase Console

## Important Notes

⚠️ **API Key Rotation Required**: Since API keys were previously exposed in the repository, you should:
1. Go to Firebase Console > Project Settings
2. Generate new API keys
3. Update your `.env` file with new keys
4. Restrict API key usage in Google Cloud Console

⚠️ **Never Commit**:
- `.env` files
- Service account keys
- Any file with actual credentials

## Testing Security Rules

Test your security rules using the Firebase Emulator:

```bash
# Start emulators
firebase emulators:start

# Run your app against emulators
npm run dev
```

## Support

For security concerns or questions, please contact the development team.