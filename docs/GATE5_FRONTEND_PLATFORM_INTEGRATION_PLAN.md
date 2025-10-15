# Gate 5: Frontend UI & Platform Menu Integration Plan

## Overview

Integrate the new menu items (plant-based wings, desserts, salads, cold sides) into:
1. **Catering Configurator** - Frontend UI for customer selection
2. **Platform Menus** - DoorDash, UberEats, GrubHub HTML generators

## Current State Analysis

### Catering Configurator Structure
- **Location**: `/src/components/catering/`
- **Main Files**:
  - `package-configurator.js` - Main configurator orchestration
  - `add-ons-selector.js` - Add-ons rendering (vegetarian, desserts)
  - `sauce-selector.js` - Sauce selection UI
  - `accordion-state.js` - Step-by-step accordion logic

### Platform Menu Structure
- **Location**: `/functions/lib/platforms/`
- **Structure**: Each platform has its own directory with:
  - `html.js` - HTML template generation
  - `css.js` - Platform-specific styles
  - `index.js` - Main export
  - `modules/` - Reusable section renderers

### Backend Data Flow
✅ Already complete - functions/index.js fetches all new collections

---

## Implementation Plan

### Phase 1: Catering Configurator Updates

#### 1.1 Wing Type Selector Enhancement
**File**: `src/components/catering/package-configurator.js`

**Changes**:
- Add "Plant-Based Wings" option to wing type selector
- Include prep method selector (Fried/Baked) for cauliflower wings
- Update validation to handle plant-based selection

**New Functions**:
```javascript
function renderWingTypeSelector(packageData) {
  // Add third option: Plant-Based (Cauliflower)
  // Include prep method toggle (fried/baked)
  // Visual indicator: leaf icon for plant-based
}

function renderPrepMethodSelector(packageId) {
  // Toggle between fried/baked
  // Show prep time difference
  // Update pricing based on method
}
```

#### 1.2 Add-Ons Selector Expansion
**File**: `src/components/catering/add-ons-selector.js`

**Current State**: Has `vegetarian` and `desserts` categories

**Changes**:
- Rename `vegetarian` → `plant-based` (broader category)
- Add **Salads** section (freshSalads collection)
- Add **Cold Sides** section (coldSides collection)
- Update **Desserts** section with new items (desserts collection)

**New Structure**:
```javascript
export function renderAddOnsStep(packageId) {
  return `
    ${renderPlantBasedAddOns(packageId)}  // Includes existing vegetarian items
    ${renderSaladsAddOns(packageId)}      // NEW: Fresh salads
    ${renderColdSidesAddOns(packageId)}   // NEW: Cold sides
    ${renderDessertsAddOns(packageId)}    // UPDATED: New desserts
  `;
}
```

#### 1.3 Service Integration
**Files**: Update to use new services

```javascript
// In add-ons-selector.js
import { getPlantBasedWings } from '../../services/plant-based-wings-service.js';
import { getDesserts } from '../../services/desserts-service.js';
import { getSalads } from '../../services/salads-service.js';
import { getColdSides } from '../../services/cold-sides-service.js';
```

#### 1.4 UI Component Designs

**Plant-Based Wings Card**:
```html
<div class="wing-type-card" data-type="plant-based">
  <div class="card-badge">🌱 Plant-Based</div>
  <img src="cauliflower-wings.webp" alt="Cauliflower Wings">
  <h4>Cauliflower Wings</h4>
  <p>Crispy & delicious • Vegan friendly</p>

  <div class="prep-method-selector">
    <button class="prep-btn active" data-method="fried">
      🔥 Fried <span class="prep-time">8 min</span>
    </button>
    <button class="prep-btn" data-method="baked">
      🍞 Baked <span class="prep-time">12 min</span>
    </button>
  </div>
</div>
```

**Salads Section**:
```html
<div class="add-ons-category salads-category">
  <div class="category-header">
    <h4>🥗 Fresh Salads</h4>
    <span class="category-badge">Made to Order</span>
  </div>

  <div class="add-ons-grid">
    <!-- Salad cards with size selector -->
    <div class="add-on-card" data-item="spring-mix-salad">
      <img src="spring-mix-salad.webp">
      <h5>Spring Mix Salad</h5>
      <p>Fresh spring mix, tomatoes, cucumbers</p>

      <div class="size-selector">
        <button class="size-btn" data-size="individual">Individual</button>
        <button class="size-btn" data-size="family">Family (8)</button>
      </div>

      <div class="dressing-selector">
        <select>
          <option>Ranch</option>
          <option>Balsamic</option>
          <option>Italian</option>
          <option>Caesar</option>
        </select>
      </div>

      <span class="price">$7.99+</span>
      <button class="add-btn">Add to Order</button>
    </div>
  </div>
</div>
```

**Cold Sides Section**:
```html
<div class="add-ons-category cold-sides-category">
  <div class="category-header">
    <h4>🥙 Cold Sides</h4>
    <span class="supplier-badge">Sally Sherman</span>
  </div>

  <div class="add-ons-grid">
    <div class="add-on-card" data-item="coleslaw">
      <img src="sally-sherman-coleslaw.webp">
      <h5>Classic Coleslaw</h5>
      <p>Creamy coleslaw with fresh cabbage</p>

      <div class="size-selector">
        <button data-size="regular">Regular (8oz)</button>
        <button data-size="large">Large (32oz)</button>
        <button data-size="family">Family (64oz)</button>
      </div>

      <span class="price">$3.99+</span>
      <button class="add-btn">Add to Order</button>
    </div>
  </div>
</div>
```

**Desserts Section (Updated)**:
```html
<div class="add-ons-category desserts-category">
  <div class="category-header">
    <h4>🍰 Desserts</h4>
    <span class="supplier-badge">Ready to Serve</span>
  </div>

  <div class="add-ons-grid">
    <!-- All desserts ready to serve -->
    <div class="add-on-card" data-item="creme-brulee-cheesecake">
      <img src="creme-brulee-cheesecake.webp">
      <h5>Creme Brulee Cheesecake</h5>
      <p>Premium cheesecake • 14 slices</p>

      <div class="pricing">
        <span class="price">$30.00</span>
        <span class="per-slice">$2.14/slice</span>
      </div>

      <button class="add-btn">Add to Order</button>
    </div>

    <div class="add-on-card" data-item="marble-pound-cake">
      <img src="marble-pound-cake.webp">
      <h5>Daisy's Marble Pound Cake</h5>
      <p>Individually wrapped • 12 count</p>

      <div class="pricing">
        <span class="price">$1.08 each</span>
      </div>

      <button class="add-btn">Add to Order</button>
    </div>
  </div>
</div>
```

---

### Phase 2: Platform Menu HTML Updates

#### 2.1 DoorDash Platform
**Files**: `/functions/lib/platforms/doordash/`

**Update `html.js`**: Add new sections after existing categories

```javascript
// In generateDoorDashHTML() function

function generateMenuSections(menuData) {
  return `
    ${generateCombosSection(menuData.combos)}
    ${generateWingsSection(menuData.wings)}
    ${generatePlantBasedWingsSection(menuData.plantBasedWings)}  // NEW
    ${generateSidesSection(menuData)}
    ${generateColdSidesSection(menuData.coldSides)}             // NEW
    ${generateSaladsSection(menuData.freshSalads)}              // NEW
    ${generateDessertsSection(menuData.desserts)}               // NEW
    ${generateBeveragesSection(menuData)}
    ${generateDipsSection(menuData)}
    ${generateSaucesSection(menuData.sauces)}
  `;
}
```

**New Section Generators**:

```javascript
function generatePlantBasedWingsSection(plantBasedWings) {
  if (!plantBasedWings || plantBasedWings.length === 0) return '';

  return `
    <section class="menu-section plant-based-section" id="plant-based-wings">
      <div class="section-header">
        <h2>🌱 Plant-Based Wings</h2>
        <p class="section-description">Crispy cauliflower wings with your choice of sauce</p>
      </div>

      <div class="items-grid">
        ${plantBasedWings.map(wing => `
          <div class="menu-item-card" data-item-id="${wing.id}">
            <img src="${wing.images.hero}" alt="${wing.name}" loading="lazy">

            <div class="item-content">
              <h3>${wing.name}</h3>
              <p class="item-description">${wing.description}</p>

              <div class="dietary-tags">
                ${wing.dietaryTags.map(tag => `
                  <span class="tag tag-${tag}">${tag}</span>
                `).join('')}
              </div>

              <div class="prep-methods">
                <span class="badge">Fried</span>
                <span class="badge">Baked</span>
              </div>
            </div>

            <div class="variants-list">
              ${wing.variants.map(variant => `
                <div class="variant-row">
                  <span class="variant-name">${variant.name}</span>
                  <span class="variant-price">$${variant.platformPricing.doordash.toFixed(2)}</span>
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    </section>
  `;
}

function generateSaladsSection(salads) {
  if (!salads || salads.length === 0) return '';

  return `
    <section class="menu-section salads-section" id="fresh-salads">
      <div class="section-header">
        <h2>🥗 Fresh Salads</h2>
        <p class="section-description">Made-to-order salads with premium ingredients</p>
      </div>

      <div class="items-grid">
        ${salads.map(salad => `
          <div class="menu-item-card" data-item-id="${salad.id}">
            <img src="${salad.images.card}" alt="${salad.name}" loading="lazy">

            <div class="item-content">
              <h3>${salad.name}</h3>
              <p class="item-description">${salad.description}</p>

              ${salad.dressingOptions ? `
                <div class="dressing-options">
                  <strong>Dressing Options:</strong>
                  <span>${salad.dressingOptions.join(', ')}</span>
                </div>
              ` : ''}

              <div class="dietary-tags">
                ${salad.dietaryTags.map(tag => `
                  <span class="tag tag-${tag}">${tag}</span>
                `).join('')}
              </div>
            </div>

            <div class="variants-list">
              ${salad.variants.map(variant => `
                <div class="variant-row">
                  <span class="variant-name">${variant.name}</span>
                  <span class="servings">(${variant.servings} ${variant.servings === 1 ? 'serving' : 'servings'})</span>
                  <span class="variant-price">$${variant.platformPricing.doordash.toFixed(2)}</span>
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    </section>
  `;
}

function generateColdSidesSection(coldSides) {
  if (!coldSides || coldSides.length === 0) return '';

  return `
    <section class="menu-section cold-sides-section" id="cold-sides">
      <div class="section-header">
        <h2>🥙 Cold Sides</h2>
        <p class="section-description">Premium sides from Sally Sherman & Restaurant Depot</p>
      </div>

      <div class="items-grid">
        ${coldSides.map(side => `
          <div class="menu-item-card" data-item-id="${side.id}">
            <img src="${side.images.card}" alt="${side.name}" loading="lazy">

            <div class="item-content">
              <h3>${side.name}</h3>
              <p class="item-description">${side.description}</p>

              ${side.supplier ? `
                <div class="supplier-badge">
                  <span>Supplier: ${side.supplier}</span>
                </div>
              ` : ''}

              ${side.includes ? `
                <div class="includes-list">
                  <strong>Includes:</strong>
                  <ul>
                    ${side.includes.map(item => `<li>${item}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}
            </div>

            <div class="variants-list">
              ${side.variants.map(variant => `
                <div class="variant-row">
                  <span class="variant-name">${variant.name}</span>
                  ${variant.weight ? `<span class="weight">(${variant.weight})</span>` : ''}
                  <span class="variant-price">$${variant.platformPricing.doordash.toFixed(2)}</span>
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    </section>
  `;
}

function generateDessertsSection(desserts) {
  if (!desserts || desserts.length === 0) return '';

  return `
    <section class="menu-section desserts-section" id="desserts">
      <div class="section-header">
        <h2>🍰 Desserts</h2>
        <p class="section-description">Premium desserts from Daisy's Bakery, Chef's Quality & Bindi - Ready to Serve</p>
      </div>

      <div class="items-grid">
        ${desserts.map(dessert => `
          <div class="menu-item-card" data-item-id="${dessert.id}">
            <img src="${dessert.images.card}" alt="${dessert.name}" loading="lazy">

            <div class="item-content">
              <h3>${dessert.name}</h3>
              <p class="item-description">${dessert.description}</p>

              <div class="supplier-info">
                <strong>${dessert.supplier}</strong>
              </div>
            </div>

            <div class="variants-list">
              ${dessert.variants.map(variant => `
                <div class="variant-row">
                  <span class="variant-name">${variant.name}</span>
                  ${variant.slices ? `<span class="slices">(${variant.slices} slices)</span>` : ''}
                  ${variant.count ? `<span class="count">(${variant.count} pieces)</span>` : ''}
                  <span class="variant-price">$${variant.platformPricing.doordash.toFixed(2)}</span>
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    </section>
  `;
}
```

#### 2.2 Update CSS Styles
**File**: `/functions/lib/platforms/doordash/css.js`

Add styles for new sections:

```javascript
const newSectionStyles = `
  /* Plant-Based Wings Section */
  .plant-based-section {
    background: linear-gradient(135deg, #f0fff4 0%, #c6f6d5 100%);
  }

  .plant-based-section .section-header h2::before {
    content: '🌱';
    margin-right: 0.5rem;
  }

  .prep-methods {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }

  .prep-methods .badge {
    padding: 0.25rem 0.75rem;
    background: #f7fafc;
    border-radius: 12px;
    font-size: 0.875rem;
    font-weight: 500;
  }

  /* Salads Section */
  .salads-section {
    background: linear-gradient(135deg, #fffff0 0%, #fef9e7 100%);
  }

  .dressing-options {
    margin-top: 0.75rem;
    padding: 0.75rem;
    background: white;
    border-radius: 8px;
    font-size: 0.875rem;
  }

  .dressing-options strong {
    display: block;
    margin-bottom: 0.25rem;
    color: #2d3748;
  }

  /* Cold Sides Section */
  .cold-sides-section {
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  }

  .supplier-badge {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    background: #4299e1;
    color: white;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
    margin-top: 0.5rem;
  }

  .includes-list {
    margin-top: 0.75rem;
    padding: 0.75rem;
    background: white;
    border-radius: 8px;
    font-size: 0.875rem;
  }

  .includes-list ul {
    margin: 0.5rem 0 0 1.25rem;
    padding: 0;
  }

  /* Desserts Section */
  .desserts-section {
    background: linear-gradient(135deg, #fff5f7 0%, #fed7e2 100%);
  }

  .supplier-info {
    margin-top: 0.75rem;
    padding: 0.5rem;
    background: white;
    border-radius: 6px;
    font-size: 0.875rem;
  }

  .supplier-info strong {
    display: block;
    color: #2d3748;
    margin-bottom: 0.25rem;
  }

  /* Dietary Tags */
  .dietary-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 0.75rem;
  }

  .tag {
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
  }

  .tag-vegan {
    background: #c6f6d5;
    color: #22543d;
  }

  .tag-vegetarian {
    background: #bee3f8;
    color: #2c5282;
  }

  .tag-gluten-free {
    background: #feebc8;
    color: #7c2d12;
  }
`;
```

#### 2.3 Repeat for UberEats and GrubHub
Apply similar changes to:
- `/functions/lib/platforms/ubereats/html.js`
- `/functions/lib/platforms/grubhub/html.js`

With platform-specific pricing adjustments in each.

---

## Phase 3: Implementation Order

### Step 1: Platform Menus (Backend) ✅ EASIER, TEST FIRST
1. Update DoorDash HTML generator
2. Update DoorDash CSS
3. Test DoorDash menu locally
4. Repeat for UberEats
5. Repeat for GrubHub

**Why First**:
- Simpler (no interactivity)
- Backend already fetching data
- Easier to verify visually

### Step 2: Catering Configurator (Frontend)
1. Update add-ons selector with new categories
2. Add plant-based wing selector
3. Integrate new services
4. Test on local catering page
5. Verify data flow end-to-end

**Why Second**:
- Depends on platform menu patterns
- More complex (interactive UX)
- Requires state management

---

## Testing Checklist

### Platform Menu Testing
- [ ] Plant-based wings section renders correctly
- [ ] Salads display with dressing options
- [ ] Cold sides show supplier badges
- [ ] Desserts display thaw notices for frozen items
- [ ] All dietary tags appear correctly
- [ ] Platform-specific pricing is accurate
- [ ] Images load properly (WebP format)
- [ ] Responsive design works on mobile/tablet

### Catering Configurator Testing
- [ ] Cauliflower wing option selectable
- [ ] Prep method toggle works (fried/baked)
- [ ] Add-ons load from new services
- [ ] Salad size selector functions
- [ ] Dressing selector works
- [ ] Cold sides size options display
- [ ] Dessert cards show correct info
- [ ] Thaw time warnings appear
- [ ] Price calculations include add-ons
- [ ] Sticky summary updates correctly

### Data Integrity Testing
- [ ] All 13 documents fetch from Firestore
- [ ] Platform pricing calculations correct
- [ ] Dietary tags filter properly
- [ ] Allergen warnings display
- [ ] Supplier information shows

---

## File Modification Summary

### New Files to Create
- None (all infrastructure exists)

### Files to Modify

**Frontend (Catering)**:
1. `/src/components/catering/package-configurator.js`
2. `/src/components/catering/add-ons-selector.js`
3. `/src/styles/catering.css`

**Backend (Platform Menus)**:
4. `/functions/lib/platforms/doordash/html.js`
5. `/functions/lib/platforms/doordash/css.js`
6. `/functions/lib/platforms/ubereats/html.js`
7. `/functions/lib/platforms/ubereats/css.js`
8. `/functions/lib/platforms/grubhub/html.js`
9. `/functions/lib/platforms/grubhub/css.js`

**Total**: 9 files to modify

---

## Estimated Timeline

- **Phase 1 (Platform Menus)**: 4-6 hours
  - DoorDash: 1.5 hours
  - UberEats: 1.5 hours
  - GrubHub: 1.5 hours
  - Testing: 1 hour

- **Phase 2 (Catering UI)**: 6-8 hours
  - Add-ons expansion: 3 hours
  - Wing selector update: 2 hours
  - Service integration: 1 hour
  - Styling: 2 hours

- **Phase 3 (Testing)**: 2-3 hours
  - Platform menu verification
  - Catering configurator testing
  - Cross-browser testing

**Total**: 12-17 hours

---

## Next Actions

1. ✅ Verify backend data is fetching correctly (COMPLETE)
2. Start with DoorDash platform menu updates
3. Test DoorDash menu on emulator
4. Proceed to other platforms
5. Move to catering configurator
6. Final integration testing

---

**Status**: Ready to implement
**Priority**: Platform menus first (easier, visible results)
**Dependencies**: None (all backend complete)
