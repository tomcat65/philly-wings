# Platform Menu Preview URLs - Firebase Emulators

## Current Setup (September 23, 2025)
Firebase emulators running with production Firestore data connection.

### Emulator Configuration
- **Functions Emulator**: Port 5001
- **Hosting Emulator**: Port 5000
- **Firestore**: Connected to production (not emulated)
- **Storage**: Connected to production (not emulated)

## Platform Menu Preview URLs

### Direct Function URLs (Raw HTML)
```
🚚 DoorDash Menu:
http://localhost:5001/philly-wings/us-central1/platformMenu?platform=doordash

🛵 UberEats Menu:
http://localhost:5001/philly-wings/us-central1/platformMenu?platform=ubereats

🥡 GrubHub Menu:
http://localhost:5001/philly-wings/us-central1/platformMenu?platform=grubhub
```

### Admin Panel Interface (Preferred)
```
🎛️ Admin Platform Menu Manager:
http://localhost:5000/admin/platform-menu.html
```

The admin panel provides:
- Visual previews of all three platforms
- Side-by-side comparison
- Professional interface with platform branding
- Easy navigation between platforms

### Additional Admin URLs
```
🏠 Main Admin Dashboard:
http://localhost:5000/admin/

🔧 Firebase Emulator UI:
http://localhost:4000/
```

## How to Start Emulators

### For Production Data Connection:
```bash
# Connect to real Firestore data (recommended for testing)
firebase emulators:start --only hosting,functions
```

### For Local Test Data:
```bash
# Use emulated Firestore with test data
firebase emulators:start
npm run seed:test
```

## Verification Status ✅
- All three platform menus generating correctly
- Real production data loading (wings, combos, sides, beverages, sauces)
- Platform-specific pricing and branding working
- Firebase Storage images loading properly
- Professional UI with responsive design

## Notes
- Functions run on port 5001, not 5002
- Admin panel is the recommended way to preview menus
- Production Firestore connection requires proper authentication
- All platform markups applied correctly (DoorDash/UberEats: 35%, GrubHub: 21.5%)

Last Updated: September 23, 2025