# Scripts Directory

## Structure

### `/setup`
- **Sally setup scripts** - Agent configuration
- **Firebase initialization** - Project setup
- **Image optimization** - Asset processing

### `/data`
- **Population scripts** - Load sample data to Firestore
- **JSON data files** - Sample menu items, reviews, settings

### `/admin`
- **Admin user creation** - Set up admin access
- **Admin utilities** - Management scripts

## Quick Commands

```bash
# Set up Sally agent
./scripts/setup/setup-sally.sh

# Populate Firestore with sample data
node scripts/data/populate-firestore.js

# Create admin user
node scripts/admin/create-admin-user.js
```