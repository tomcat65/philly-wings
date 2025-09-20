// Platform Menu Management System
import { auth, db, storage } from '../src/firebase-config';
import { onAuthStateChanged } from 'firebase/auth';
import {
    collection,
    doc,
    getDocs,
    getDoc,
    query,
    where,
    setDoc,
    updateDoc,
    deleteDoc,
    serverTimestamp
} from 'firebase/firestore';
import { ref as storageRef, uploadBytes } from 'firebase/storage';

// State Management
let currentPlatform = 'doordash';
let selectedItem = null;
let menuData = {
    wings: [],
    sides: [],
    combos: [],
    sauces: [],
    modifiers: {}
};

// Platform configurations
const platforms = {
    doordash: {
        name: 'DoorDash',
        commission: 0.30,
        processing: 0.029,
        fixed: 0.30,
        color: '#ff3008'
    },
    ubereats: {
        name: 'Uber Eats',
        commission: 0.30,
        processing: 0.0305,
        fixed: 0.35,
        color: '#06c167'
    },
    grubhub: {
        name: 'Grubhub',
        commission: 0.20,
        processing: 0.0305,
        fixed: 0.30,
        deliveryFee: 1.00,
        color: '#f63440'
    }
};

// Mozzarella Sticks Ratios
const mozzStickRatios = {
    4: { ratio: 1, marinara: 1 },
    8: { ratio: 2, marinara: 2 },
    12: { ratio: 3, marinara: 3 },
    16: { ratio: 4, marinara: 4 }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('Platform Menu Manager initializing...');

    // Check authentication with better error handling
    onAuthStateChanged(auth, (user) => {
        if (!user) {
            console.log('User not authenticated, redirecting to admin login');
            // Add a small delay to prevent redirect loops
            setTimeout(() => {
                window.location.href = '/admin/';
            }, 1000);
        } else {
            console.log('User authenticated:', user.email);
            window.currentUser = user;
            setupEventListeners();
            loadMenuData();
        }
    });
});

// Setup Event Listeners
function setupEventListeners() {
    // Platform tabs
    document.querySelectorAll('.platform-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            const platform = e.currentTarget.dataset.platform;
            switchPlatform(platform);
        });
    });

    // Category toggles
    document.querySelectorAll('.category-header').forEach(header => {
        header.addEventListener('click', () => {
            const category = header.parentElement;
            category.classList.toggle('collapsed');
        });
    });
}

// Switch Platform View
function switchPlatform(platform) {
    currentPlatform = platform;

    // Update active tab
    document.querySelectorAll('.platform-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.platform === platform);
    });

    // Refresh prices display
    if (selectedItem) {
        displayItemEditor(selectedItem);
    }

    // Update average margin
    calculateAverageMargin();
}

// Helper function to safely get platform price
function getPlatformPrice(item, platform) {
    if (!item.platformPricing) return item.basePrice || 0;

    const platformPricing = item.platformPricing[platform];

    // Handle different pricing formats
    if (typeof platformPricing === 'number') {
        return platformPricing;
    } else if (typeof platformPricing === 'object' && platformPricing?.price) {
        return platformPricing.price;
    } else {
        return item.basePrice || 0;
    }
}

// Validate item data structure
function validateItemData(item) {
    const errors = [];

    if (!item.name) errors.push('Missing name');
    if (!item.category) errors.push('Missing category');
    if (typeof item.basePrice !== 'number') errors.push('Invalid basePrice');

    // Check if variants is malformed string
    if (typeof item.variants === 'string') {
        errors.push('Variants stored as string (data corruption)');
    }

    return errors;
}

// Load Menu Data from Firebase
async function loadMenuData() {
    try {
        showLoading(true);
        console.log('🔄 Loading menu data...');

        // Reset data structure
        menuData.wings = [];
        menuData.sides = [];
        menuData.drinks = [];
        menuData.combos = [];
        menuData.sauces = [];
        menuData.items = {};
        menuData.modifiers = {};

        // Load menu items with enhanced error handling
        try {
            console.log('📦 Fetching menuItems collection...');
            const menuItemsSnap = await getDocs(collection(db, 'menuItems'));
            console.log(`✅ Found ${menuItemsSnap.docs.length} menu items`);

            if (menuItemsSnap.docs.length === 0) {
                console.warn('⚠️  No menu items found in database');
                showError('No menu items found. Please seed test data or run migration script.');
                return;
            }

            menuItemsSnap.docs.forEach(docSnap => {
                const item = { id: docSnap.id, ...docSnap.data() };

                // Validate item data
                const validationErrors = validateItemData(item);
                if (validationErrors.length > 0) {
                    console.error(`❌ Item ${item.name || item.id} has errors:`, validationErrors);

                    // If variants is corrupted, show specific error
                    if (validationErrors.includes('Variants stored as string (data corruption)')) {
                        showError(`Data corruption detected in ${item.name}. Please run migration script.`);
                        return;
                    }
                }

                console.log(`🔍 Processing item: ${item.name} (${item.category})`);
                console.log(`   - Has variants: ${Array.isArray(item.variants) ? item.variants.length : 'No'}`);

                // Store in items lookup
                menuData.items[item.id] = item;

                // If item has variants, expand them for display
                if (item.variants && Array.isArray(item.variants) && item.variants.length > 0) {
                    console.log(`   - Expanding ${item.variants.length} variants`);

                    item.variants.forEach((variant, index) => {
                        // Use variant's own ID if available, otherwise generate one
                        const variantId = variant.id || `${item.id}_variant_${index}`;

                        const expandedItem = {
                            ...variant,
                            id: variantId,
                            parentId: item.id,
                            parentName: item.name,
                            baseItem: false,
                            category: item.category,
                            modifierGroups: item.modifierGroups || [],
                            images: item.images || {},
                            basePrice: variant.basePrice || item.basePrice || 0,
                            platformPricing: variant.platformPricing || {},
                            // Preserve original item properties
                            allergens: variant.allergens || item.allergens || [],
                            active: variant.active !== undefined ? variant.active : item.active
                        };

                        // Categorize by parent category
                        if (item.category === 'wings') {
                            menuData.wings.push(expandedItem);
                        } else if (item.category === 'sides') {
                            menuData.sides.push(expandedItem);
                        } else if (item.category === 'drinks') {
                            menuData.drinks.push(expandedItem);
                        }

                        console.log(`     ✓ Added variant: ${variant.name} ($${variant.basePrice})`);
                    });
                } else {
                    // Single item (no variants) or legacy format
                    console.log(`   - Single item (no variants)`);

                    const singleItem = {
                        ...item,
                        baseItem: true,
                        platformPricing: item.platformPricing || {},
                        active: item.active !== undefined ? item.active : true
                    };

                    if (item.category === 'wings') {
                        menuData.wings.push(singleItem);
                    } else if (item.category === 'sides') {
                        menuData.sides.push(singleItem);
                    } else if (item.category === 'drinks') {
                        menuData.drinks.push(singleItem);
                    }
                }
            });
        } catch (menuError) {
            console.error('❌ Error loading menuItems:', menuError);
            showError('Failed to load menu items: ' + menuError.message);
            return;
        }

        // Load combos from separate collection
        try {
            const combosSnap = await getDocs(collection(db, 'combos'));
            menuData.combos = combosSnap.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                platformPricing: doc.data().platformPricing || {}
            }));
            console.log(`Loaded ${menuData.combos.length} combos`);
        } catch (comboError) {
            console.error('Error loading combos:', comboError);
        }

        // Load sauces
        try {
            const saucesSnap = await getDocs(collection(db, 'sauces'));
            menuData.sauces = saucesSnap.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                platformPricing: doc.data().platformPricing || {}
            }));
            console.log(`Loaded ${menuData.sauces.length} sauces`);
        } catch (sauceError) {
            console.error('Error loading sauces:', sauceError);
        }

        // Try to load modifier groups (may not exist yet)
        try {
            const modifiersSnap = await getDocs(collection(db, 'modifierGroups'));
            modifiersSnap.docs.forEach(doc => {
                menuData.modifiers[doc.id] = doc.data();
            });
            console.log(`Loaded ${Object.keys(menuData.modifiers).length} modifier groups`);
        } catch (modifierError) {
            console.log('ModifierGroups collection not found, creating default structure');
            // Create default modifier structure
            menuData.modifiers = {
                sauce_choice: {
                    name: 'Sauce Choice',
                    type: 'single',
                    required: true,
                    options: menuData.sauces.map(sauce => ({
                        id: sauce.id,
                        name: sauce.name,
                        price: 0
                    }))
                },
                wing_style: {
                    name: 'Wing Style',
                    type: 'single',
                    required: false,
                    options: [
                        { id: 'regular', name: 'Regular Mix', price: 0 },
                        { id: 'drums', name: 'All Drums', price: 1.50 },
                        { id: 'flats', name: 'All Flats', price: 1.50 },
                        { id: 'boneless', name: 'Boneless', price: 0 }
                    ]
                }
            };
        }

        console.log('Menu data loaded successfully:', {
            wings: menuData.wings.length,
            sides: menuData.sides.length,
            drinks: menuData.drinks.length,
            combos: menuData.combos.length,
            sauces: menuData.sauces.length,
            modifiers: Object.keys(menuData.modifiers).length
        });

        // Display menu items
        displayMenuItems();
        calculateAverageMargin();

    } catch (error) {
        console.error('Error loading menu data:', error);
        showError('Failed to load menu data: ' + error.message);
    } finally {
        showLoading(false);
    }
}

// Display Menu Items in Categories
function displayMenuItems() {
    // Display Wings
    const wingsContainer = document.getElementById('wings-items');
    if (wingsContainer) {
        wingsContainer.innerHTML = menuData.wings.map(item => createMenuItem(item, 'wings')).join('');
        updateCategoryCount('wings', menuData.wings.length);
    }

    // Display Sides
    const sidesContainer = document.getElementById('sides-items');
    if (sidesContainer) {
        sidesContainer.innerHTML = menuData.sides.map(item => createMenuItem(item, 'sides')).join('');
        updateCategoryCount('sides', menuData.sides.length);
    }

    // Display Drinks
    const drinksContainer = document.getElementById('drinks-items');
    if (drinksContainer) {
        drinksContainer.innerHTML = menuData.drinks.map(item => createMenuItem(item, 'drinks')).join('');
        updateCategoryCount('drinks', menuData.drinks.length);
    }

    // Display Combos
    const combosContainer = document.getElementById('combos-items');
    if (combosContainer) {
        combosContainer.innerHTML = menuData.combos.map(item => createMenuItem(item, 'combos')).join('');
        updateCategoryCount('combos', menuData.combos.length);
    }

    // Display Sauces (if container exists)
    const saucesContainer = document.getElementById('sauces-items');
    if (saucesContainer) {
        saucesContainer.innerHTML = menuData.sauces.map(item => createMenuItem(item, 'sauces')).join('');
    }

    // Add click handlers
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', () => selectItem(item));
    });
}

// Update Category Count
function updateCategoryCount(category, count) {
    const categoryElement = document.querySelector(`[data-category="${category}"] .item-count`);
    if (categoryElement) {
        categoryElement.textContent = `${count} items`;
    }
}

// Create Menu Item HTML
function createMenuItem(item, category) {
    if (!item || !item.name) {
        console.warn('Invalid item passed to createMenuItem:', item);
        return '';
    }

    // Handle platform pricing - could be object with price property or direct number
    const getPlatformPrice = (platform) => {
        const platformData = item.platformPricing?.[platform];
        if (typeof platformData === 'object' && platformData.price !== undefined) {
            return platformData.price;
        } else if (typeof platformData === 'number') {
            return platformData;
        }
        return item.basePrice || 0;
    };

    const platformPrice = getPlatformPrice(currentPlatform);
    const margin = calculateMargin(item.basePrice || 0, platformPrice, currentPlatform);

    // Show parent name if this is a variant
    const displayName = item.parentName ? `${item.name}` : item.name;
    const showCategory = item.parentName ? `(${item.parentName})` : '';

    return `
        <div class="menu-item" data-id="${item.id}" data-category="${category}" data-parent="${item.parentId || ''}">
            <div class="item-info">
                <div class="item-name">${displayName} ${showCategory}</div>
                <div class="item-description">${item.description || ''}</div>
                ${item.portionDetails ? `
                    <div class="item-portion">
                        ${item.portionDetails.count ? `${item.portionDetails.count} pieces` : ''}
                        ${item.portionDetails.weight ? item.portionDetails.weight : ''}
                        ${item.portionDetails.feeds ? ` • Feeds ${item.portionDetails.feeds}` : ''}
                    </div>
                ` : ''}
                <div class="item-prices">
                    ${Object.entries(platforms).map(([key, platform]) => {
                        const price = getPlatformPrice(key);
                        const isActive = currentPlatform === key;
                        return `
                            <div class="price-badge ${isActive ? 'active' : ''}">
                                <img src="/images/logos/${key}-logo.svg" alt="${platform.name}" onerror="this.style.display='none'">
                                <span>$${price.toFixed(2)}</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        </div>
    `;
}

// Select Item for Editing
function selectItem(itemElement) {
    // Remove previous selection
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });

    // Add active class
    itemElement.classList.add('active');

    // Find item data
    const itemId = itemElement.dataset.id;
    const category = itemElement.dataset.category;
    selectedItem = menuData[category].find(item => item.id === itemId);

    // Display editor
    displayItemEditor(selectedItem);
}

// Display Item Editor
function displayItemEditor(item) {
    const editorContainer = document.getElementById('itemEditor');

    if (!item) {
        editorContainer.innerHTML = '<div class="empty-state"><p>Select an item to edit</p></div>';
        document.getElementById('deleteBtn').style.display = 'none';
        return;
    }

    document.getElementById('deleteBtn').style.display = 'block';

    const isCombo = findItemCategory(item.id) === 'combos';

    // Build editor form
    editorContainer.innerHTML = `
        <form class="editor-form" onsubmit="saveItem(event)">
            <div class="form-group">
                <label>Item Name</label>
                <input type="text" class="form-control" id="itemName" value="${item.name}" required>
            </div>

            <div class="form-group">
                <label>Description</label>
                <textarea class="form-control" id="itemDescription">${item.description || ''}</textarea>
            </div>

            <div class="form-group">
                <label>Base Price (Your Cost)</label>
                <input type="number" class="form-control" id="basePrice" value="${item.basePrice}" step="0.01" required>
            </div>

            <div class="form-group">
                <label>Platform Pricing</label>
                <div class="platform-pricing">
                    ${Object.entries(platforms).map(([key, platform]) => {
                        // Handle both object and number formats for platform pricing
                        const platformData = item.platformPricing?.[key];
                        let platformPrice = 0;

                        if (typeof platformData === 'object' && platformData.price !== undefined) {
                            platformPrice = platformData.price;
                        } else if (typeof platformData === 'number') {
                            platformPrice = platformData;
                        } else {
                            platformPrice = item.basePrice || 0;
                        }

                        const margin = calculateMargin(item.basePrice || 0, platformPrice, key);
                        const marginClass = margin >= 40 ? 'good' : margin >= 30 ? 'warning' : 'bad';

                        return `
                            <div class="platform-price-card">
                                <h4>
                                    <img src="/images/logos/${key}-logo.svg" alt="${platform.name}" onerror="this.style.display='none'">
                                    ${platform.name}
                                </h4>
                                <div class="price-input-group">
                                    <span>$</span>
                                    <input type="number" class="price-input" id="price_${key}"
                                           value="${platformPrice.toFixed(2)}" step="0.50"
                                           onchange="updateMargin('${key}')">
                                </div>
                                <div class="margin-display ${marginClass}" id="margin_${key}">
                                    ${margin.toFixed(1)}% margin
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>

            ${isCombo ? `
            <div class="form-group">
                <label>Servings Per Combo</label>
                <input type="number" min="1" class="form-control" id="servingsPerCombo" value="${item.servingsPerCombo || item.feedsCount || 1}" step="1">
            </div>
            <div class="form-group">
                <label>Sauce Policy</label>
                <select class="form-control" id="saucePolicy">
                    <option value="none" ${item.saucePolicy === 'none' || !item.saucePolicy ? 'selected' : ''}>None</option>
                    <option value="representative" ${item.saucePolicy === 'representative' ? 'selected' : ''}>Representative Sauce</option>
                    <option value="range" ${item.saucePolicy === 'range' ? 'selected' : ''}>Range Note Only</option>
                </select>
            </div>
            <div class="form-group">
                <label>Representative Sauce ID (nutritionData id)</label>
                <input type="text" class="form-control" id="representativeSauceId" value="${item.representativeSauceId || ''}" placeholder="e.g., mild-buffalo">
            </div>
            <div class="form-group">
                <label>Sauce Portion Rule (JSON)</label>
                <textarea class="form-control" id="saucePortionRule" rows="3" placeholder='{"unit":"oz","per":"wings","qtyPerUnit":1,"perCount":6}'>${item.saucePortionRule ? JSON.stringify(item.saucePortionRule) : ''}</textarea>
                <small>Example: 1 oz per 6 wings. For per order: {"unit":"oz","per":"order","qtyPerUnit":1}</small>
            </div>
            <div class="form-group">
                <label>Disclaimer</label>
                <textarea class="form-control" id="comboDisclaimer" rows="2" placeholder="Nutrition varies by sauce selection">${item.disclaimer || ''}</textarea>
            </div>
            ` : ''}

            ${item.portionDetails ? `
                <div class="form-group">
                    <label>Portion Details</label>
                    <div class="portion-info">
                        ${item.portionDetails.count ? `<p>Count: ${item.portionDetails.count}</p>` : ''}
                        ${item.portionDetails.weight ? `<p>Weight: ${item.portionDetails.weight}</p>` : ''}
                        ${item.portionDetails.container ? `<p>Container: ${item.portionDetails.container}</p>` : ''}
                        ${item.portionDetails.includes ? `<p>Includes: ${item.portionDetails.includes.join(', ')}</p>` : ''}
                    </div>
                </div>
            ` : ''}

            ${item.modifierGroups ? `
                <div class="form-group">
                    <label>Modifiers</label>
                    <button type="button" class="btn-secondary" onclick="openModifierModal()">
                        ⚙️ Edit Modifiers
                    </button>
                </div>
            ` : ''}

            <div class="form-group">
                <label>
                    <input type="checkbox" id="itemActive" ${item.active ? 'checked' : ''}>
                    Active on all platforms
                </label>
            </div>

            <div class="form-group">
                <button type="submit" class="btn-primary">💾 Save Changes</button>
            </div>
        </form>
    `;
}

// Calculate Margin
function calculateMargin(basePrice, platformPrice, platform) {
    const config = platforms[platform];
    const commission = platformPrice * config.commission;
    const processing = platformPrice * config.processing + config.fixed;
    const deliveryFee = config.deliveryFee || 0;

    const netRevenue = platformPrice - commission - processing - deliveryFee;
    const profit = netRevenue - basePrice;
    const margin = (profit / netRevenue) * 100;

    return margin;
}

// Update Margin Display
function updateMargin(platform) {
    if (!selectedItem) return;

    const basePrice = parseFloat(document.getElementById('basePrice').value) || 0;
    const platformPrice = parseFloat(document.getElementById(`price_${platform}`).value) || 0;

    const margin = calculateMargin(basePrice, platformPrice, platform);
    const marginDisplay = document.getElementById(`margin_${platform}`);

    marginDisplay.textContent = `${margin.toFixed(1)}% margin`;
    marginDisplay.className = `margin-display ${margin >= 40 ? 'good' : margin >= 30 ? 'warning' : 'bad'}`;
}

// Calculate Average Margin
function calculateAverageMargin() {
    let totalMargin = 0;
    let count = 0;

    ['wings', 'sides', 'combos'].forEach(category => {
        menuData[category].forEach(item => {
            if (item.platformPricing?.[currentPlatform]?.price) {
                const margin = calculateMargin(
                    item.basePrice,
                    item.platformPricing[currentPlatform].price,
                    currentPlatform
                );
                totalMargin += margin;
                count++;
            }
        });
    });

    const avgMargin = count > 0 ? totalMargin / count : 0;
    const marginElement = document.getElementById('avgMargin');
    marginElement.textContent = `${avgMargin.toFixed(1)}%`;
    marginElement.className = `margin-value ${avgMargin >= 40 ? 'good' : avgMargin >= 30 ? 'warning' : 'bad'}`;
}

// Save Item
async function saveItem(event) {
    event.preventDefault();

    if (!selectedItem) return;

    try {
        showSaving();

        // Gather form data
        const updatedItem = {
            ...selectedItem,
            name: document.getElementById('itemName').value,
            description: document.getElementById('itemDescription').value,
            basePrice: parseFloat(document.getElementById('basePrice').value),
            platformPricing: {},
            active: document.getElementById('itemActive').checked,
            updatedAt: serverTimestamp()
        };

        // Get platform prices
        Object.keys(platforms).forEach(platform => {
            updatedItem.platformPricing[platform] = {
                price: parseFloat(document.getElementById(`price_${platform}`).value),
                active: true
            };
        });

        // Determine collection based on item category
        const category = findItemCategory(selectedItem.id);

        // Read extra combo fields
        if (category === 'combos') {
            const servingsEl = document.getElementById('servingsPerCombo');
            const saucePolicyEl = document.getElementById('saucePolicy');
            const repSauceEl = document.getElementById('representativeSauceId');
            const ruleEl = document.getElementById('saucePortionRule');
            const disclaimerEl = document.getElementById('comboDisclaimer');

            updatedItem.servingsPerCombo = Math.max(1, parseInt(servingsEl?.value || (selectedItem.servingsPerCombo || selectedItem.feedsCount || 1)) || 1);
            updatedItem.saucePolicy = saucePolicyEl?.value || 'none';
            updatedItem.representativeSauceId = repSauceEl?.value?.trim() || '';
            try {
                updatedItem.saucePortionRule = ruleEl?.value ? JSON.parse(ruleEl.value) : undefined;
            } catch (_) {
                if (selectedItem.saucePortionRule) updatedItem.saucePortionRule = selectedItem.saucePortionRule;
            }
            updatedItem.disclaimer = (disclaimerEl?.value || '').trim();
        }

        // If this is a combo, compute computedNutrition before save
        if (category === 'combos') {
            try {
                const cn = await computeComboNutrition({ ...selectedItem, ...updatedItem });
                updatedItem.computedNutrition = cn;
            } catch (err) {
                console.warn('Could not compute combo nutrition:', err);
            }
        }

        // Save to Firebase
        await updateDoc(doc(db, category, selectedItem.id), updatedItem);

        // Update local data
        const categoryData = menuData[category];
        const itemIndex = categoryData.findIndex(item => item.id === selectedItem.id);
        if (itemIndex !== -1) {
            categoryData[itemIndex] = updatedItem;
        }

        // Refresh display
        displayMenuItems();
        showSaved();

        // If combo updated, also upload the combos nutrition feed
        if (category === 'combos') {
            try {
                await uploadCombosNutritionFeed();
            } catch (e) {
                console.warn('Failed to upload combos-nutrition.json:', e);
            }
        }

    } catch (error) {
        console.error('Error saving item:', error);
        showError('Failed to save changes');
    }
}

// Find Item Category and Collection
function findItemCategory(itemId) {
    // Check if it's a variant (has _variant_ in ID)
    if (itemId.includes('_variant_')) {
        const parentId = itemId.split('_variant_')[0];
        if (menuData.items[parentId]) {
            return 'menuItems'; // Variants are stored in parent items
        }
    }

    // Check direct collections
    for (const category of ['combos', 'sauces']) {
        if (menuData[category].some(item => item.id === itemId)) {
            return category;
        }
    }

    // Check if it's in menuItems
    if (menuData.items[itemId]) {
        return 'menuItems';
    }

    console.warn('Could not find collection for item:', itemId);
    return 'menuItems'; // Default fallback
}

// Generate Menu Link - Creates Immutable Published Menu
async function generateMenuLink() {
    const modal = document.getElementById('linkModal');
    modal.style.display = 'flex';

    const platform = currentPlatform === 'all' ? 'doordash' : currentPlatform;

    try {
        // Generate unique ID with date for easy identification
        const timestamp = new Date().toISOString().split('T')[0];
        const uniqueId = Math.random().toString(36).substring(2, 9);
        const menuId = `${platform}-${timestamp}-${uniqueId}`;

        // Create complete frozen menu snapshot for publishedMenus collection
        const publishedMenu = {
            // Metadata
            platform: platform,
            menuId: menuId,
            url: `/menu/${platform}/${menuId}`,
            publishedAt: serverTimestamp(),
            publishedBy: window.currentUser?.email || 'admin',
            status: 'active',

            // Restaurant Info
            restaurant: {
                name: 'Philly Wings Express',
                description: 'Real Wings for Real Ones - Made in Philly',
                address: '1455 Franklin Mills Circle, Philadelphia, PA 19154',
                phone: '(267) 579-2040',
                hours: {
                    monday: '11:00 AM - 10:00 PM',
                    tuesday: '11:00 AM - 10:00 PM',
                    wednesday: '11:00 AM - 10:00 PM',
                    thursday: '11:00 AM - 10:00 PM',
                    friday: '11:00 AM - 11:00 PM',
                    saturday: '11:00 AM - 11:00 PM',
                    sunday: '12:00 PM - 9:00 PM'
                }
            },

            // Platform Configuration
            platformConfig: {
                name: platforms[platform].name,
                commission: platforms[platform].commission,
                processing: platforms[platform].processing,
                fixed: platforms[platform].fixed
            },

            // Complete Frozen Menu Data
            frozenData: await buildCompleteMenuSnapshot(platform),

            // Display Options
            includeImages: document.getElementById('includeImages')?.checked ?? true,
            includeNutrition: document.getElementById('includeNutrition')?.checked ?? false,
            includeAllergens: document.getElementById('includeAllergens')?.checked ?? true
        };

        // Save to publishedMenus collection (immutable)
        await setDoc(doc(db, 'publishedMenus', menuId), publishedMenu);

        // Also save simplified version to publicMenus for backward compatibility
        const publicMenu = {
            platform: platform,
            restaurant: publishedMenu.restaurant,
            categories: await buildMenuCategories(platform),
            generated: serverTimestamp()
        };
        await setDoc(doc(db, 'publicMenus', menuId), publicMenu);

        // Generate link
        const menuLink = `${window.location.origin}/menu/${platform}/${menuId}`;
        document.getElementById('generatedLink').value = menuLink;

        // Generate QR code (placeholder - would use QR library)
        document.getElementById('qrCode').innerHTML = `
            <p>QR Code for:</p>
            <code>${menuLink}</code>
            <p style="margin-top: 1rem; color: #666;">
                Share this link with ${platforms[platform].name}
            </p>
        `;

        // Log success
        console.log(`Menu published successfully: ${menuLink}`);

    } catch (error) {
        console.error('Error generating menu link:', error);
        showError('Failed to generate menu link');
    }
}

// Build Complete Menu Snapshot for Immutable Storage
async function buildCompleteMenuSnapshot(platform) {
    const snapshot = {
        categories: [],
        items: {},
        modifiers: {},
        sauces: []
    };

    // Process Wings with variant structure
    const wingsItems = [];
    menuData.wings.forEach(variant => {
        const itemId = variant.id;
        const platformPrice = variant.platformPricing?.[platform] || variant.basePrice || 0;

        snapshot.items[itemId] = {
            id: itemId,
            name: variant.name,
            description: variant.description || '',
            category: 'wings',
            price: platformPrice,
            basePrice: variant.basePrice || 0,
            parentId: variant.parentId,
            image: variant.images?.hero || '',
            modifierGroups: variant.modifierGroups || ['sauce_choice', 'wing_style', 'extra_sauces'],
            portionDetails: variant.portionDetails || {},
            nutrition: variant.nutrition || null,
            allergens: variant.allergens || [],
            active: true,
            sortOrder: variant.sortOrder || 999
        };
        wingsItems.push(itemId);
    });

    // Process Sides with variant structure
    const sidesItems = [];
    menuData.sides.forEach(variant => {
        const itemId = variant.id;
        const platformPrice = variant.platformPricing?.[platform] || variant.basePrice || 0;

        snapshot.items[itemId] = {
            id: itemId,
            name: variant.name,
            description: variant.description || '',
            category: 'sides',
            price: platformPrice,
            basePrice: variant.basePrice || 0,
            parentId: variant.parentId,
            image: variant.images?.hero || '',
            modifierGroups: variant.modifierGroups || [],
            portionDetails: variant.portionDetails || {},
            nutrition: variant.nutrition || null,
            allergens: variant.allergens || [],
            active: true,
            sortOrder: variant.sortOrder || 999
        };
        sidesItems.push(itemId);
    });

    // Process Drinks with variant structure
    const drinksItems = [];
    menuData.drinks.forEach(variant => {
        const itemId = variant.id;
        const platformPrice = variant.platformPricing?.[platform] || variant.basePrice || 0;

        snapshot.items[itemId] = {
            id: itemId,
            name: variant.name,
            description: variant.description || '',
            category: 'drinks',
            price: platformPrice,
            basePrice: variant.basePrice || 0,
            parentId: variant.parentId,
            image: variant.images?.hero || '',
            modifierGroups: variant.modifierGroups || [],
            portionDetails: variant.portionDetails || {},
            allergens: variant.allergens || [],
            active: true,
            sortOrder: variant.sortOrder || 999
        };
        drinksItems.push(itemId);
    });

    // Process Combos
    const combosItems = [];
    menuData.combos.filter(item => item.active).forEach(item => {
        const itemId = item.id;
        const platformPrice = item.platformPricing?.[platform] || item.basePrice || 0;

        snapshot.items[itemId] = {
            id: itemId,
            name: item.name,
            description: item.description || '',
            category: 'combos',
            price: platformPrice,
            basePrice: item.basePrice || 0,
            image: item.images?.original || '',
            components: item.components || [],
            modifierGroups: item.modifierGroups || [],
            feedsCount: item.feedsCount || '',
            nutrition: item.nutrition || null,
            allergens: item.allergens || [],
            active: true,
            sortOrder: item.sortOrder || 999
        };
        combosItems.push(itemId);
    });

    // Build Categories with item references
    snapshot.categories = [
        {
            id: 'wings',
            name: 'Wings',
            description: 'Fresh, never frozen wings with your choice of our signature sauces',
            sortOrder: 1,
            items: wingsItems
        },
        {
            id: 'sides',
            name: 'Sides',
            description: 'Perfect sides to complete your meal',
            sortOrder: 2,
            items: sidesItems
        },
        {
            id: 'drinks',
            name: 'Drinks',
            description: 'Refreshing beverages',
            sortOrder: 3,
            items: drinksItems
        },
        {
            id: 'combos',
            name: 'Combos & Deals',
            description: 'Save with our combo meals',
            sortOrder: 4,
            items: combosItems
        }
    ];

    // Copy modifier groups
    snapshot.modifiers = { ...menuData.modifiers };

    // Copy active sauces
    snapshot.sauces = menuData.sauces.filter(s => s.active).map(sauce => ({
        ...sauce,
        platformAvailable: sauce.platformAvailability?.includes(platform)
    }));

    return snapshot;
}

// Build Menu Categories for Export
async function buildMenuCategories(platform) {
    const categories = [];

    // Wings
    categories.push({
        name: 'Wings',
        description: 'Double-fried, hand-tossed perfection',
        items: menuData.wings.filter(item => item.active).map(item => ({
            id: item.id,
            name: item.name,
            description: item.description,
            price: item.platformPricing[platform]?.price || item.basePrice,
            image: item.images?.original || '',
            modifiers: buildItemModifiers(item),
            portionDetails: item.portionDetails
        }))
    });

    // Sides
    categories.push({
        name: 'Sides',
        description: 'The perfect wingman for your wings',
        items: menuData.sides.filter(item => item.active).map(item => ({
            id: item.id,
            name: item.name,
            description: item.description,
            price: item.platformPricing[platform]?.price || item.basePrice,
            image: item.images?.original || '',
            portionDetails: item.portionDetails
        }))
    });

    // Combos
    categories.push({
        name: 'Combo Deals',
        description: 'More bang for your buck',
        items: menuData.combos.filter(item => item.active).map(item => ({
            id: item.id,
            name: item.name,
            description: item.description,
            price: item.platformPricing[platform]?.price || item.basePrice,
            image: item.images?.original || '',
            components: item.components,
            feedsCount: item.feedsCount
        }))
    });

    // Sauces
    categories.push({
        name: 'Sauces & Rubs',
        description: 'From sweet to scorching - all made in-house',
        items: menuData.sauces.filter(item => item.active).map(item => ({
            id: item.id,
            name: item.name,
            description: item.description,
            heatLevel: item.heatLevel,
            allergens: item.allergens,
            isDryRub: item.isDryRub
        }))
    });

    return categories;
}

// Build Item Modifiers
function buildItemModifiers(item) {
    const modifiers = [];

    if (item.modifierGroups) {
        item.modifierGroups.forEach(groupId => {
            const group = menuData.modifiers[groupId];
            if (group) {
                modifiers.push({
                    name: group.name,
                    type: group.type,
                    required: group.required,
                    options: group.options
                });
            }
        });
    }

    return modifiers;
}

// Copy Link to Clipboard
function copyLink() {
    const linkInput = document.getElementById('generatedLink');
    linkInput.select();
    document.execCommand('copy');

    // Show feedback
    const button = event.target;
    const originalText = button.textContent;
    button.textContent = '✓ Copied!';
    setTimeout(() => {
        button.textContent = originalText;
    }, 2000);
}

// Close Link Modal
function closeLinkModal() {
    document.getElementById('linkModal').style.display = 'none';
}

// Open Modifier Modal
function openModifierModal() {
    document.getElementById('modifierModal').style.display = 'flex';
}

// Close Modifier Modal
function closeModifierModal() {
    document.getElementById('modifierModal').style.display = 'none';
}

// Save Modifiers
async function saveModifiers() {
    // Implementation for saving modifier changes
    try {
        showSaving();

        // Gather modifier data and save to Firebase
        // ... implementation details

        showSaved();
        closeModifierModal();
    } catch (error) {
        console.error('Error saving modifiers:', error);
        showError('Failed to save modifier changes');
    }
}

// Sync Prices Across Platforms
async function syncPrices() {
    if (!confirm('This will apply a standard markup to all items based on base prices. Continue?')) {
        return;
    }

    try {
        showSaving();

        const markup = {
            doordash: 1.33,  // 33% markup
            ubereats: 1.33,
            grubhub: 1.28    // 28% markup (lower fees)
        };

        // Update all items
        for (const category of ['wings', 'sides', 'combos']) {
            for (const item of menuData[category]) {
                if (item.basePrice) {
                    item.platformPricing = {};

                    Object.entries(markup).forEach(([platform, multiplier]) => {
                        const price = Math.round((item.basePrice * multiplier) * 2) / 2; // Round to nearest 0.50
                        item.platformPricing[platform] = { price, active: true };
                    });

                    // Save to Firebase
                    await updateDoc(doc(db, category, item.id), {
                        platformPricing: item.platformPricing,
                        updatedAt: serverTimestamp()
                    });
                }
            }
        }

        // Refresh display
        displayMenuItems();
        calculateAverageMargin();
        showSaved();

    } catch (error) {
        console.error('Error syncing prices:', error);
        showError('Failed to sync prices');
    }
}

// Delete Item
async function deleteItem() {
    if (!selectedItem) return;

    if (!confirm(`Are you sure you want to delete "${selectedItem.name}"?`)) {
        return;
    }

    try {
        showSaving();

        const category = findItemCategory(selectedItem.id);
        await deleteDoc(doc(db, category, selectedItem.id));

        // Remove from local data
        const categoryData = menuData[category];
        const itemIndex = categoryData.findIndex(item => item.id === selectedItem.id);
        if (itemIndex !== -1) {
            categoryData.splice(itemIndex, 1);
        }

        // Clear editor
        selectedItem = null;
        displayItemEditor(null);

        // Refresh display
        displayMenuItems();
        showSaved();

    } catch (error) {
        console.error('Error deleting item:', error);
        showError('Failed to delete item');
    }
}

// Preview Menu
function previewMenu() {
    const platform = currentPlatform === 'all' ? 'doordash' : currentPlatform;
    window.open(`/menu/preview/${platform}`, '_blank');
}

// Export Menu PDF
function exportMenuPDF() {
    window.print();
}

// UI Helper Functions
function showLoading(show) {
    document.body.classList.toggle('loading', show);
}

function showSaving() {
    const status = document.getElementById('lastSaved');
    status.textContent = 'Saving...';
    status.className = 'save-status saving';
}

function showSaved() {
    const status = document.getElementById('lastSaved');
    status.textContent = 'All changes saved';
    status.className = 'save-status saved';
}

function showError(message) {
    const status = document.getElementById('lastSaved');
    status.textContent = message;
    status.className = 'save-status';

    // Show alert
    alert(message);
}

// Make functions globally available
window.loadMenuData = loadMenuData;
window.saveItem = saveItem;
window.deleteItem = deleteItem;
window.generateMenuLink = generateMenuLink;
window.copyLink = copyLink;
window.closeLinkModal = closeLinkModal;
window.openModifierModal = openModifierModal;
window.closeModifierModal = closeModifierModal;
window.saveModifiers = saveModifiers;
window.syncPrices = syncPrices;
window.previewMenu = previewMenu;
window.exportMenuPDF = exportMenuPDF;
window.updateMargin = updateMargin;
// Expose utility to recompute/upload nutrition feed from console
window.uploadCombosNutritionFeed = uploadCombosNutritionFeed;

// UI action: recompute and upload combo nutrition feed
async function recomputeComboNutrition() {
    try {
        showSaving();
        await uploadCombosNutritionFeed();
        showSaved();
        alert('Combo nutrition recomputed and uploaded.');
    } catch (e) {
        console.error('Recompute nutrition failed:', e);
        showError('Failed to recompute combo nutrition');
    }
}
window.recomputeComboNutrition = recomputeComboNutrition;

// --- Nutrition Computation & Feed Upload Helpers ---

// Compute combo nutrition by summing referenced nutritionData items
async function computeComboNutrition(combo) {
    const components = (combo.components && Array.isArray(combo.components) && combo.components.length)
        ? combo.components
        : (Array.isArray(combo.items) ? combo.items.map(id => ({ refId: id, qty: 1 })) : []);

    if (!components.length) {
        throw new Error('Combo has no components to compute nutrition');
    }

    const refIds = components.map(c => c.refId);
    const nutritionItems = await fetchNutritionByIds(refIds);

    const byId = {};
    nutritionItems.forEach(item => { if (item?.id) byId[item.id] = item; });

    const fields = ['calories','totalFat','saturatedFat','transFat','cholesterol','sodium','totalCarbs','dietaryFiber','totalSugars','addedSugars','protein','vitaminD','calcium','iron','potassium'];
    const totals = Object.fromEntries(fields.map(f => [f, 0]));
    const breakdown = [];
    const allergensSet = new Set();

    components.forEach(({ refId, qty = 1 }) => {
        const item = byId[refId];
        if (!item) return;
        const nutrients = item.nutrients || item;

        fields.forEach(f => {
            const val = typeof nutrients[f] === 'object' && nutrients[f] !== null && 'amount' in nutrients[f]
                ? (nutrients[f].amount || 0)
                : (nutrients[f] || 0);
            totals[f] += (val || 0) * qty;
        });

        const cal = (nutrients.calories || 0) * qty;
        breakdown.push({ refId, qty, name: item.name || refId, calories: Math.round(cal) });

        const allergens = formatAllergens(item.allergens);
        allergens.forEach(a => allergensSet.add(a));
    });

    const servingsPerCombo = combo.servingsPerCombo || combo.feedsCount || 1;

    const round1 = (v) => Math.round((v + Number.EPSILON) * 10) / 10; // 1 decimal
    const round0 = (v) => Math.round(v);

    const perCombo = {
        calories: round0(totals.calories),
        totalFat: round1(totals.totalFat),
        saturatedFat: round1(totals.saturatedFat),
        transFat: round1(totals.transFat || 0),
        cholesterol: round0(totals.cholesterol),
        sodium: round0(totals.sodium),
        totalCarbs: round0(totals.totalCarbs),
        dietaryFiber: round0(totals.dietaryFiber || 0),
        totalSugars: round0(totals.totalSugars || 0),
        addedSugars: round0(totals.addedSugars || 0),
        protein: round0(totals.protein),
        vitaminD: round1(totals.vitaminD || 0),
        calcium: round0(totals.calcium || 0),
        iron: round1(totals.iron || 0),
        potassium: round0(totals.potassium || 0)
    };

    // Sauce handling (representative): add sauce nutrition to totals if configured
    let sauceNote = undefined;
    if (combo.saucePolicy === 'representative' && combo.representativeSauceId) {
        try {
            const [sauceItem] = await fetchNutritionByIds([combo.representativeSauceId]);
            if (sauceItem) {
                // Determine portion multiplier based on rule
                const rule = combo.saucePortionRule || { unit: 'oz', per: 'wings', qtyPerUnit: 1, perCount: 6 };
                let totalOz = rule.qtyPerUnit || 1;
                if (rule.per === 'wings') {
                    // estimate wings count from components like "12-wings"
                    const wingCount = components.reduce((acc, c) => {
                        const m = /^(\d+)-wings$/.exec(c.refId);
                        return acc + (m ? (parseInt(m[1], 10) * (c.qty || 1)) : 0);
                    }, 0);
                    const perCount = rule.perCount || 6;
                    totalOz = (wingCount / perCount) * (rule.qtyPerUnit || 1);
                } else if (rule.per === 'order') {
                    totalOz = rule.qtyPerUnit || 1;
                }

                const s = sauceItem.nutrients || sauceItem;
                const fieldsSauce = ['calories','totalFat','saturatedFat','transFat','cholesterol','sodium','totalCarbs','dietaryFiber','totalSugars','addedSugars','protein','vitaminD','calcium','iron','potassium'];
                const adders = {};
                fieldsSauce.forEach(f => {
                    const val = typeof s[f] === 'object' && s[f] !== null && 'amount' in s[f] ? (s[f].amount || 0) : (s[f] || 0);
                    adders[f] = val * totalOz; // assume per 1 oz base
                });
                // Apply to totals/perCombo
                perCombo.calories = round0(perCombo.calories + adders.calories);
                perCombo.totalFat = round1(perCombo.totalFat + adders.totalFat);
                perCombo.saturatedFat = round1(perCombo.saturatedFat + adders.saturatedFat);
                perCombo.transFat = round1(perCombo.transFat + (adders.transFat || 0));
                perCombo.cholesterol = round0(perCombo.cholesterol + adders.cholesterol);
                perCombo.sodium = round0(perCombo.sodium + adders.sodium);
                perCombo.totalCarbs = round0(perCombo.totalCarbs + adders.totalCarbs);
                perCombo.dietaryFiber = round0(perCombo.dietaryFiber + (adders.dietaryFiber || 0));
                perCombo.totalSugars = round0(perCombo.totalSugars + (adders.totalSugars || 0));
                perCombo.addedSugars = round0(perCombo.addedSugars + (adders.addedSugars || 0));
                perCombo.protein = round0(perCombo.protein + adders.protein);
                perCombo.vitaminD = round1(perCombo.vitaminD + (adders.vitaminD || 0));
                perCombo.calcium = round0(perCombo.calcium + (adders.calcium || 0));
                perCombo.iron = round1(perCombo.iron + (adders.iron || 0));
                perCombo.potassium = round0(perCombo.potassium + (adders.potassium || 0));

                // Add to breakdown and allergens
                breakdown.push({ refId: combo.representativeSauceId, qty: `${totalOz} oz`, name: sauceItem.name || 'Sauce', calories: round0(adders.calories) });
                formatAllergens(sauceItem.allergens).forEach(a => allergensSet.add(a));

                sauceNote = { policy: 'representative', representativeId: combo.representativeSauceId, portion: `${totalOz} oz` };
            }
        } catch (_) {}
    }

    const perServing = {};
    Object.entries(perCombo).forEach(([k, v]) => {
        perServing[k] = (k === 'totalFat' || k === 'saturatedFat' || k === 'transFat' || k === 'vitaminD' || k === 'iron')
            ? round1(v / servingsPerCombo)
            : round0(v / servingsPerCombo);
    });

    return {
        perCombo,
        perServing,
        allergens: Array.from(allergensSet),
        breakdown,
        sauceNote,
        servingsPerCombo,
        lastComputedAt: Date.now(),
        disclaimer: combo.disclaimer || ''
    };
}

async function fetchNutritionByIds(ids) {
    const chunk = (arr, size) => arr.length ? [arr.slice(0, size), ...chunk(arr.slice(size), size)] : [];
    const chunks = chunk(ids, 10);
    const results = [];
    for (const c of chunks) {
        const q = query(collection(db, 'nutritionData'), where('id', 'in', c));
        const snap = await getDocs(q);
        snap.forEach(d => results.push(d.data()));
    }
    return results;
}

function formatAllergens(allergens) {
    if (!allergens) return [];
    if (Array.isArray(allergens)) return allergens;
    if (typeof allergens === 'object') {
        return [...(allergens.contains || []), ...(allergens.mayContain || [])];
    }
    if (typeof allergens === 'string') {
        const clean = allergens.replace(/[\[\]]/g, '');
        return clean.split(',').map(s => s.trim()).filter(Boolean);
    }
    return [];
}

async function uploadCombosNutritionFeed() {
    const combosSnap = await getDocs(collection(db, 'combos'));
    const combos = [];
    for (const docSnap of combosSnap.docs) {
        const data = { id: docSnap.id, ...docSnap.data() };
        // Always recompute to incorporate latest nutritionData (e.g., sauces)
        let cn = null;
        try { cn = await computeComboNutrition(data); } catch (_) {}
        if (cn) {
            combos.push({ id: data.id, name: data.name, computedNutrition: cn, updatedAt: Date.now() });
        }
    }

    const json = new TextEncoder().encode(JSON.stringify(combos));
    const ref = storageRef(storage, 'public/combos-nutrition.json');
    await uploadBytes(ref, json, { contentType: 'application/json' });
}
