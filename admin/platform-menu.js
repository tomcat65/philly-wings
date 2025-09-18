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

        // Load wings
        const wingsSnap = await getDocs(query(collection(db, 'wings'), orderBy('sortOrder')));
        menuData.wings = wingsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Load sides
        const sidesSnap = await getDocs(query(collection(db, 'sides'), orderBy('sortOrder')));
        menuData.sides = sidesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Load combos
        const combosSnap = await getDocs(query(collection(db, 'combos'), orderBy('sortOrder')));
        menuData.combos = combosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Load sauces
        const saucesSnap = await getDocs(query(collection(db, 'sauces'), orderBy('sortOrder')));
        menuData.sauces = saucesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Load modifier groups
        const modifiersSnap = await getDocs(collection(db, 'modifierGroups'));
        modifiersSnap.docs.forEach(doc => {
            menuData.modifiers[doc.id] = doc.data();
        });

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
    wingsContainer.innerHTML = menuData.wings.map(item => createMenuItem(item, 'wings')).join('');

    // Display Sides
    const sidesContainer = document.getElementById('sides-items');
    sidesContainer.innerHTML = menuData.sides.map(item => createMenuItem(item, 'sides')).join('');

    // Display Combos
    const combosContainer = document.getElementById('combos-items');
    combosContainer.innerHTML = menuData.combos.map(item => createMenuItem(item, 'combos')).join('');

    // Display Sauces
    const saucesContainer = document.getElementById('sauces-items');
    saucesContainer.innerHTML = menuData.sauces.map(item => createMenuItem(item, 'sauces')).join('');

    // Add click handlers
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', () => selectItem(item));
    });
}

// Create Menu Item HTML
function createMenuItem(item, category) {
    const platformPrice = item.platformPricing?.[currentPlatform]?.price || item.basePrice || 0;
    const margin = calculateMargin(item.basePrice, platformPrice, currentPlatform);

    return `
        <div class="menu-item" data-id="${item.id}" data-category="${category}">
            <div class="item-info">
                <div class="item-name">${item.name}</div>
                <div class="item-description">${item.description || ''}</div>
                <div class="item-prices">
                    ${Object.entries(platforms).map(([key, platform]) => {
                        const price = item.platformPricing?.[key]?.price || item.basePrice || 0;
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

// Generate Menu Link
async function generateMenuLink() {
    const modal = document.getElementById('linkModal');
    modal.style.display = 'flex';

    const platform = currentPlatform === 'all' ? 'doordash' : currentPlatform;

    try {
        // Generate unique ID
        const menuId = `menu_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Create public menu document
        const menuDoc = {
            platform: platform,
            restaurant: {
                name: 'Philly Wings Express',
                description: 'Real Wings for Real Ones - Made in Philly',
                address: 'South Philadelphia, PA',
                phone: '(267) 376-3113'
            },
            categories: await buildMenuCategories(platform),
            generated: serverTimestamp(),
            includeImages: document.getElementById('includeImages')?.checked ?? true,
            includeNutrition: document.getElementById('includeNutrition')?.checked ?? false,
            includeAllergens: document.getElementById('includeAllergens')?.checked ?? true
        };

        // Save to Firebase
        await setDoc(doc(db, 'publicMenus', menuId), menuDoc);

        // Generate link
        const menuLink = `https://phillywingsexpress.com/menu/${platform}/${menuId}`;
        document.getElementById('generatedLink').value = menuLink;

        // Generate QR code (placeholder - would use QR library)
        document.getElementById('qrCode').innerHTML = `
            <p>QR Code for:</p>
            <code>${menuLink}</code>
            <p style="margin-top: 1rem; color: #666;">
                [QR code would be generated here using qrcode.js library]
            </p>
        `;

    } catch (error) {
        console.error('Error generating menu link:', error);
        showError('Failed to generate menu link');
    }
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