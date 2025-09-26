# Firebase Image Field Structure - Complete Documentation

*Date: September 23, 2025*

## 🖼️ Image Field Patterns Across Collections

### 1. **menuItems Collection**
```javascript
images: {
  hero: "https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fwings-hero.jpg?alt=media"
}
```
**Pattern**: Single `hero` image for primary display
**Used by**: Wings, Fries, Drinks, Mozzarella Sticks

### 2. **combos Collection**
```javascript
imageUrl: "https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fmvp-meal-combo.png?alt=media"
```
**Pattern**: Direct `imageUrl` property
**Used by**: All combo items (MVP Meal, Game Day 30, Sampler, etc.)

### 3. **sauces Collection**
```javascript
imageUrl: "https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fbuffalo-sauced.png?alt=media"
```
**Pattern**: Direct `imageUrl` property
**Used by**: All sauce items (Mild Buffalo, Classic Hot, Teriyaki, etc.)

### 4. **variants (within menuItems)**
```javascript
variants: [
  {
    id: "bottled_water",
    name: "Bottled Water",
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fwater-bottle.png?alt=media"
  }
]
```
**Pattern**: Optional `imageUrl` at variant level
**Used by**: Specific drink variants, some food variants

## 🔗 Firebase Storage URL Structure

### Base Pattern
```
https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/{encoded_path}?alt=media
```

### Path Categories
1. **Root Images**: `images%2F{filename}`
2. **Menu Categories**: `images%2Fmenu%2F{filename}`
3. **Categorized**: `images%2F{category}%2F{filename}`

### File Naming Conventions
- **Wings**: `wings-hero.jpg`
- **Combos**: `{combo-name}.png` (e.g., `mvp-meal-combo.png`)
- **Sauces**: `{sauce-name}.png` (e.g., `buffalo-sauced.png`)
- **Sides**: `{item-name}.jpg` (e.g., `fries-loaded.jpg`)
- **Drinks**: `{drink-type}.jpg/png` (e.g., `water-bottle.png`)

## 📊 Image Field Priority System

### 1. **Primary Display Logic**
```javascript
// Priority order for image selection
const getImageUrl = (item) => {
  return item.imageUrl ||           // Direct imageUrl (combos, sauces)
         item.images?.hero ||       // Hero image (menuItems)
         item.images?.main ||       // Alternative main image
         DEFAULT_PLACEHOLDER;       // Fallback image
};
```

### 2. **Collection-Specific Patterns**

**menuItems**: Use `images.hero` for consistency
**combos**: Use `imageUrl` directly
**sauces**: Use `imageUrl` directly
**variants**: Check variant-level `imageUrl` first, fallback to parent

### 3. **Platform Menu Implementation**
```javascript
// Current working implementation
const imageUrl = combo.imageUrl ||
                menuItem.images?.hero ||
                variant.imageUrl ||
                `${FALLBACK_IMAGE_BASE}/${item.id}.png`;
```

## 🎯 Key Insights for Platform Menu

### ✅ Correctly Implemented
- Combos now use `combo.imageUrl` from Firestore ✅
- MenuItems use `images.hero` properly ✅
- Fallback logic prevents broken images ✅

### 🔧 Implementation Notes
- **No hardcoding**: All images come from Firestore data
- **Fallback chain**: Multiple fallback options prevent broken displays
- **Consistent URLs**: All use Firebase Storage with proper alt=media
- **Performance**: Images are optimized and served via CDN

### 📁 Storage Organization
```
/images/
  ├── wings-hero.jpg           # Main menu items
  ├── fries-loaded.jpg
  ├── water-bottle.png
  ├── mvp-meal-combo.png       # Combo images
  ├── sampler-platter.png
  ├── party-pack-50-wings.png
  ├── buffalo-sauced.png       # Sauce images
  ├── teriyaki-sauced.png
  └── /menu/                   # Categorized images
      └── philly-classic-hot.jpg
```

## 🚀 Platform Menu Integration

### Current Status
✅ **Fixed**: Combo images show unique images from Firestore
✅ **Fixed**: Drinks use proper hero images
✅ **Fixed**: Sauces load imageUrl correctly
✅ **Fixed**: No hardcoded image mappings

### Image Loading Flow
1. Query Firestore for item data
2. Extract imageUrl/images.hero based on collection
3. Apply fallback logic if image missing
4. Render with alt text and loading states
5. All images served from Firebase Storage CDN

## 📋 Maintenance Guidelines

1. **New Items**: Always include proper imageUrl or images.hero
2. **File Naming**: Use consistent kebab-case naming
3. **Optimization**: Images should be WebP when possible
4. **Alt Text**: Include altText field for accessibility
5. **Fallbacks**: Ensure graceful degradation for missing images

## ✅ Status: Complete Image Documentation
All image field patterns documented and properly implemented in platform menu system.