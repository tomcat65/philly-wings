# Catering Image System

## Overview
The Shared Platters wizard uses a placeholder image system with runtime fallbacks to ensure a graceful user experience even when images are missing.

## Image Categories

### 1. Wing Type Hero Images
**Location**: `/public/images/wings/`
**Purpose**: Large hero images for Step 3 (Wing Customization)

**Required Images**:
- `boneless-hero.webp` (600x400px, ~60KB)
- `bone-in-hero.webp` (600x400px, ~60KB)
- `cauliflower-hero.webp` (600x400px, ~60KB)

**Fallback**: `/public/images/placeholders/wing-default.webp`

**Usage Example**:
```javascript
<img
  src="/images/wings/boneless-hero.webp"
  alt="Boneless Wings"
  loading="lazy"
  onerror="this.src='/images/placeholders/wing-default.webp'"
/>
```

---

### 2. Sauce Preview Images
**Location**: `/public/images/sauces/`
**Purpose**: Thumbnail images for Step 4 (Sauce Allocation Modal)

**Required Images** (14 signature sauces):
- `philly-classic-hot.webp` (300x300px, ~25KB)
- `northeast-hot-lemon.webp` (300x300px, ~25KB)
- `broad-pattison-burn.webp` (300x300px, ~25KB)
- `frankford-cajun.webp` (300x300px, ~25KB)
- `grittys-revenge.webp` (300x300px, ~25KB)
- `honey-bbq.webp` (300x300px, ~25KB)
- `teriyaki.webp` (300x300px, ~25KB)
- `lemon-pepper.webp` (300x300px, ~25KB)
- `buffalo.webp` (300x300px, ~25KB)
- `nashville-hot.webp` (300x300px, ~25KB)
- `bbq.webp` (300x300px, ~25KB)
- `mild.webp` (300x300px, ~25KB)
- `garlic-parmesan.webp` (300x300px, ~25KB)
- `sweet-chili.webp` (300x300px, ~25KB)

**Fallback**: `/public/images/placeholders/sauce-default.webp`

---

### 3. Add-On Category Images
**Location**: `/public/images/addons/`
**Purpose**: Photo cards for Step 5 (Customize Package)

**Required Images**:
- `cold-sides.webp` (300x200px, ~25KB) - Carrot/celery sticks
- `salads.webp` (300x200px, ~25KB) - Garden salad
- `desserts.webp` (300x200px, ~25KB) - Assorted desserts
- `beverages.webp` (300x200px, ~25KB) - Canned beverages

**Specific Add-On Images** (optional, fallback to category):
- `veggie-sticks.webp`
- `garden-salad.webp`
- `chocolate-chip-cookies.webp`
- `canned-soda.webp`
- `bottled-water.webp`

**Fallback Hierarchy**:
1. Specific item image: `/images/addons/veggie-sticks.webp`
2. Category image: `/images/addons/cold-sides.webp`
3. Generic fallback: `/images/placeholders/addon-default.webp`

---

### 4. Package Hero Images (Optional)
**Location**: `/public/images/packages/`
**Purpose**: Future enhancement for package selection

**Naming Convention**: `{tier}-{packageName}.webp`
- `tier-1-starter-pack.webp`
- `tier-2-crowd-pleaser.webp`
- `tier-3-tailgate-party.webp`

**Fallback**: `/public/images/placeholders/package-default.webp`

---

## Placeholder Images

All placeholders must exist at `/public/images/placeholders/`:

1. **wing-default.webp** (600x400px, ~30KB)
   - Generic chicken wings image
   - Warm orange/brown tones

2. **sauce-default.webp** (300x300px, ~15KB)
   - Generic sauce cup image
   - Neutral colors

3. **addon-default.webp** (300x200px, ~15KB)
   - Generic food container image
   - Clean, simple design

4. **package-default.webp** (600x400px, ~30KB)
   - Generic catering box image
   - Philly Wings branding

---

## Image Optimization Guidelines

### File Format
- **Primary**: WebP (best compression, modern browsers)
- **Fallback**: JPG (older browsers via picture element)

### Compression Targets
- **Thumbnails (150px)**: ~8KB
- **Photo Cards (300px)**: ~25KB
- **Hero Images (600px)**: ~60KB

### Responsive Images Example
```html
<picture>
  <source srcset="/images/wings/boneless-hero.webp" type="image/webp">
  <source srcset="/images/wings/boneless-hero.jpg" type="image/jpeg">
  <img
    src="/images/wings/boneless-hero.jpg"
    alt="Boneless Wings"
    loading="lazy"
  />
</picture>
```

---

## Loading Strategy

### Progressive Loading
1. **Step Activation**: Load images required for current step only
2. **Lazy Loading**: Use `loading="lazy"` for off-screen images
3. **Intersection Observer**: Preload next step images when user scrolls

### Implementation Example
```javascript
// Load Step 3 images when step becomes active
function activateStep3() {
  const wingImages = document.querySelectorAll('[data-wing-image]');
  wingImages.forEach(img => {
    if (img.dataset.src) {
      img.src = img.dataset.src; // Trigger lazy load
    }
  });
}
```

---

## Runtime Fallback Strategy

### Service Layer (catering-service.js)
```javascript
export function normalizePackageRecord(pkg) {
  return {
    ...pkg,
    coldSides: normalizeAddonArray(pkg.coldSides, 'cold-sides'),
    salads: normalizeAddonArray(pkg.salads, 'salads'),
    desserts: normalizeAddonArray(pkg.desserts, 'desserts'),
    beverages: normalizeAddonArray(pkg.beverages, 'beverages'),
    heroImage: pkg.heroImage || '/images/placeholders/package-default.webp'
  };
}

function normalizeAddonArray(field, category) {
  const arr = Array.isArray(field) ? field : (field ? Object.values(field) : []);
  return arr.map(item => ({
    ...item,
    image: item.image || `/images/addons/${category}.webp`,
    fallback: `/images/placeholders/addon-default.webp`
  }));
}
```

### Component Layer (HTML)
```html
<img
  src="${item.image}"
  alt="${item.name}"
  onerror="this.src='${item.fallback || '/images/placeholders/addon-default.webp'}'"
  loading="lazy"
/>
```

---

## Firestore Schema (Optional Enhancement)

### Package Document
```javascript
{
  id: "tailgate-party-pack",
  name: "Tailgate Party Pack",
  tier: 3,
  heroImage: "/images/packages/tier-3-tailgate-party.webp", // NEW
  coldSides: [
    {
      item: "Veggie Sticks with Ranch",
      quantity: 2,
      image: "/images/addons/veggie-sticks.webp" // NEW
    }
  ]
}
```

### Sauce Document
```javascript
{
  name: "Philly Classic Hot",
  heatLevel: 3,
  category: "philly-signature",
  image: "/images/sauces/philly-classic-hot.webp" // NEW
}
```

---

## Testing Checklist

- [ ] All placeholder images exist and load correctly
- [ ] Fallback chain works when specific images are missing
- [ ] Images lazy-load on step activation
- [ ] WebP format served to modern browsers
- [ ] JPG fallback works in older browsers
- [ ] Image file sizes meet compression targets
- [ ] Alt text is descriptive for accessibility
- [ ] Images render correctly on mobile (portrait/landscape)
- [ ] Broken image icons never shown to users

---

## Next Steps (Implementation)

1. ✅ Create shared-photo-cards.css with reusable styles
2. ✅ Document image system and fallback strategy
3. 🔄 Enhance normalizePackageRecord() with image fallbacks
4. 📋 Create placeholder images (Figma/Photoshop)
5. 📋 Upload optimized WebP images to Firebase Storage
6. 📋 Add image fields to Firestore documents
7. 📋 Implement progressive loading in wizard components
