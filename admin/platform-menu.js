// Platform Menu Management System
import { auth, db } from '../src/firebase-config';
import { onAuthStateChanged } from 'firebase/auth';
import {
    collection,
    doc,
    getDocs,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    serverTimestamp,
    query,
    orderBy
} from 'firebase/firestore';

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
    // Check authentication
    onAuthStateChanged(auth, (user) => {
        if (!user) {
            window.location.href = '/admin/';
        } else {
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

// Load Menu Data from Firebase
async function loadMenuData() {
    try {
        showLoading(true);

        // Load all menu items with variant structure
        const menuItemsSnap = await getDocs(query(collection(db, 'menuItems'), orderBy('sortOrder')));

        // Reset data
        menuData.wings = [];
        menuData.sides = [];
        menuData.drinks = [];
        menuData.items = {};

        // Process menu items with variants
        menuItemsSnap.docs.forEach(doc => {
            const item = { id: doc.id, ...doc.data() };

            // Store in items lookup
            menuData.items[item.id] = item;

            // If item has variants, expand them for display
            if (item.variants && item.variants.length > 0) {
                item.variants.forEach(variant => {
                    const expandedItem = {
                        ...variant,
                        parentId: item.id,
                        parentName: item.name,
                        baseItem: false,
                        category: item.category,
                        modifierGroups: item.modifierGroups || [],
                        images: item.images
                    };

                    // Categorize by parent category
                    if (item.category === 'wings') {
                        menuData.wings.push(expandedItem);
                    } else if (item.category === 'sides') {
                        menuData.sides.push(expandedItem);
                    } else if (item.category === 'drinks') {
                        menuData.drinks.push(expandedItem);
                    }
                });
            } else {
                // Old format compatibility
                if (item.category === 'wings') {
                    menuData.wings.push(item);
                } else if (item.category === 'sides') {
                    menuData.sides.push(item);
                } else if (item.category === 'drinks') {
                    menuData.drinks.push(item);
                }
            }
        });

        // Load combos from separate collection
        const combosSnap = await getDocs(query(collection(db, 'combos'), orderBy('sortOrder')));
        menuData.combos = combosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Load sauces
        const saucesSnap = await getDocs(query(collection(db, 'sauces'), orderBy('sortOrder')));
        menuData.sauces = saucesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Try to load modifier groups (may not exist)
        try {
            const modifiersSnap = await getDocs(collection(db, 'modifierGroups'));
            modifiersSnap.docs.forEach(doc => {
                menuData.modifiers[doc.id] = doc.data();
            });
        } catch (e) {
            console.log('ModifierGroups collection not found');
        }

        // Display menu items
        displayMenuItems();
        calculateAverageMargin();

    } catch (error) {
        console.error('Error loading menu data:', error);
        showError('Failed to load menu data');
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
    // Handle variant structure - platformPricing is directly on variant
    const platformPrice = item.platformPricing?.[currentPlatform] || item.basePrice || 0;
    const margin = calculateMargin(item.basePrice, platformPrice, currentPlatform);

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
                        const price = item.platformPricing?.[key] || item.basePrice || 0;
                        return `
                            <div class="price-badge">
                                <img src="/images/logos/${key}-logo.svg" alt="${platform.name}">
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
                        const platformPrice = item.platformPricing?.[key]?.price || item.basePrice || 0;
                        const margin = calculateMargin(item.basePrice, platformPrice, key);
                        const marginClass = margin >= 40 ? 'good' : margin >= 30 ? 'warning' : 'bad';

                        return `
                            <div class="platform-price-card">
                                <h4>
                                    <img src="/images/logos/${key}-logo.svg" alt="${platform.name}">
                                    ${platform.name}
                                </h4>
                                <div class="price-input-group">
                                    <span>$</span>
                                    <input type="number" class="price-input" id="price_${key}"
                                           value="${platformPrice}" step="0.50"
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

    } catch (error) {
        console.error('Error saving item:', error);
        showError('Failed to save changes');
    }
}

// Find Item Category
function findItemCategory(itemId) {
    for (const category of ['wings', 'sides', 'combos', 'sauces']) {
        if (menuData[category].some(item => item.id === itemId)) {
            return category;
        }
    }
    return null;
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