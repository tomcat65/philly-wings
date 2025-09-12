# Philly Wings Express - Full Stack Setup Guide

## Overview
This project has been converted from a static website to a full-stack application using:
- **Frontend**: Vite, vanilla JavaScript with ES modules
- **Backend**: Firebase (Firestore, Storage, Authentication, Hosting)
- **Admin Panel**: Located at `/admin`

## Changes Made

### 1. UI Fixes
- Fixed DashDoor rating overlap on desktop (moved down to bottom: 80px)
- Added bright green color (#00FF00) to "THE JAWN" text with glow effect
- Added floating animation for the rating badge

### 2. Firebase Integration
- Created data models for dynamic content
- Set up Firebase services for CRUD operations
- Implemented real-time updates for game day banners and live orders

### 3. Dynamic Content Areas
- **Game Day Banner**: Updates from Firebase, customizable teams/dates/offers
- **Menu Items**: Dynamic wing flavors with images from Firebase Storage
- **Combos**: Special deals manageable through admin
- **Reviews**: Featured customer reviews from database
- **Live Orders**: Real-time order ticker

### 4. Admin Panel (`/admin`)
- Secure login with Firebase Auth
- Content management for:
  - Game day banners
  - Menu items with image uploads
  - Combo deals
  - Customer reviews
  - Site settings

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Firebase Setup
1. Create a new Firebase project at https://console.firebase.google.com
2. Enable these services:
   - Authentication (Email/Password)
   - Firestore Database
   - Storage
   - Hosting

3. Get your Firebase config and create `.env` file:
```bash
cp .env.example .env
# Edit .env with your Firebase credentials
```

### 3. Initialize Firebase
```bash
npm install -g firebase-tools
firebase login
firebase init
# Select your project and use existing configuration files
```

### 4. Create Admin User
In Firebase Console:
1. Go to Authentication > Users
2. Add a new user with email/password
3. Use this account to login to `/admin`

### 5. Development
```bash
# Run local dev server
npm run dev

# Run with Firebase emulators
npm run emulators
```

### 6. Deployment
```bash
# Build and deploy to Firebase Hosting
npm run deploy
```

## Data Structure

### Collections:
- `gameDayBanners`: Game day announcements
- `menuItems`: Food items (wings, sides, drinks)
- `combos`: Special combo deals
- `liveOrders`: Recent order display
- `reviews`: Customer testimonials
- `settings`: Site-wide settings

## Next Steps
1. Configure Firebase project with your credentials
2. Add initial content through admin panel
3. Upload menu item images
4. Set up payment integration (if needed)
5. Configure delivery platform URLs in settings

## Admin Features
- Dynamic game day banners with team matchups
- Menu management with images and heat levels
- Combo deals with expiration dates
- Review moderation
- Business hours and platform settings