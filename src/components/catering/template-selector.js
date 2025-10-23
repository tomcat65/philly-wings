/**
 * Template Selector Component
 * Entry screen for boxed meals - curated templates + custom option
 */

import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../firebase-config.js';

/**
 * Render template selection screen
 */
export async function renderTemplateSelector() {
  const templates = await fetchTemplates();

  return `
    <section class="template-selector">
      <div class="template-header">
        <h2>Choose Your Starting Point</h2>
        <p class="template-subtitle">
          Start with a proven combo or build your own from scratch
        </p>
        <div class="template-tip">
          <span class="tip-icon">💡</span>
          <span class="tip-text">Templates save you 80% setup time - customize after selection</span>
        </div>
      </div>

      <div class="template-grid">
        ${templates.map(template => renderTemplateCard(template)).join('')}
        ${renderCustomOption()}
      </div>
    </section>
  `;
}

/**
 * Render individual template card
 */
function renderTemplateCard(template) {
  const heatIcons = '🌶️'.repeat(template.heatLevel || 1);

  return `
    <div class="template-card" data-template-id="${template.id}">
      <div class="template-image">
        <img
          src="${getImageUrl(template.heroImage)}"
          alt="${template.name}"
          loading="lazy">
        ${template.featured ? '<span class="template-badge">Most Popular</span>' : ''}
        ${template.stats?.ordersThisMonth > 20 ?
          `<span class="template-social-proof">${template.stats.ordersThisMonth} orders this month</span>`
          : ''}
      </div>

      <div class="template-content">
        <div class="template-title-row">
          <h3 class="template-name">${template.name}</h3>
          <span class="template-heat" title="Heat level ${template.heatLevel}/5">
            ${heatIcons}
          </span>
        </div>

        <p class="template-tagline">${template.tagline}</p>
        <p class="template-description">${template.description}</p>

        <div class="template-preview-items">
          <span class="preview-item">
            <span class="item-icon">🍗</span>
            ${formatWingType(template.defaultConfig.wingType)}
          </span>
          <span class="preview-item">
            <span class="item-icon">🌶️</span>
            ${template.defaultConfig.sauce}
          </span>
          <span class="preview-item">
            <span class="item-icon">🍰</span>
            ${template.defaultConfig.dessert}
          </span>
        </div>

        ${template.stats?.avgRating ? `
          <div class="template-rating">
            <span class="rating-stars">${'★'.repeat(Math.floor(template.stats.avgRating))}${'☆'.repeat(5 - Math.floor(template.stats.avgRating))}</span>
            <span class="rating-value">${template.stats.avgRating}</span>
          </div>
        ` : ''}

        <button class="btn-template-select btn-primary" data-template-id="${template.id}">
          Start with ${template.name}
        </button>
      </div>
    </div>
  `;
}

/**
 * Render custom/build-from-scratch option
 */
function renderCustomOption() {
  return `
    <div class="template-card template-card-custom" data-template-id="custom">
      <div class="template-image template-image-custom">
        <div class="custom-icon-wrapper">
          <span class="custom-icon">🎨</span>
        </div>
      </div>

      <div class="template-content">
        <h3 class="template-name">Build from Scratch</h3>
        <p class="template-tagline">Total Customization</p>
        <p class="template-description">
          Choose every detail yourself - perfect if you have specific requirements or dietary needs.
        </p>

        <div class="template-benefits">
          <span class="benefit-item">✓ Full control</span>
          <span class="benefit-item">✓ No defaults</span>
          <span class="benefit-item">✓ Maximum flexibility</span>
        </div>

        <button class="btn-template-select btn-secondary" data-template-id="custom">
          Build Custom Box
        </button>
      </div>
    </div>
  `;
}

/**
 * Initialize template selector interactions
 */
export function initTemplateSelector(onTemplateSelect) {
  console.log('🔧 initTemplateSelector called, callback:', typeof onTemplateSelect);

  const templateCards = document.querySelectorAll('.template-card');
  const selectButtons = document.querySelectorAll('.btn-template-select');

  console.log(`📋 Found ${templateCards.length} template cards`);
  console.log(`📋 Found ${selectButtons.length} select buttons`);

  // Card click handlers
  templateCards.forEach((card, index) => {
    console.log(`✅ Attaching card click handler #${index + 1}, templateId:`, card.dataset.templateId);
    card.addEventListener('click', (e) => {
      console.log('🖱️ Card clicked!', card.dataset.templateId);
      // Don't trigger if button was clicked (button has its own handler)
      if (!e.target.closest('.btn-template-select')) {
        const templateId = card.dataset.templateId;
        console.log('📞 Calling selectTemplate for card:', templateId);
        selectTemplate(templateId, onTemplateSelect);
      }
    });
  });

  // Button click handlers
  selectButtons.forEach((button, index) => {
    console.log(`✅ Attaching button click handler #${index + 1}, templateId:`, button.dataset.templateId);
    button.addEventListener('click', (e) => {
      console.log('🖱️ Button clicked!', button.dataset.templateId);
      e.stopPropagation();
      const templateId = button.dataset.templateId;
      console.log('📞 Calling selectTemplate for button:', templateId);
      selectTemplate(templateId, onTemplateSelect);
    });
  });

  console.log('✅ Template selector initialization complete');
}

/**
 * Handle template selection
 */
async function selectTemplate(templateId, callback) {
  console.log('🎯 selectTemplate called:', { templateId, callbackType: typeof callback });

  // Add loading state
  const button = document.querySelector(`.btn-template-select[data-template-id="${templateId}"]`);
  console.log('🔍 Button found:', button ? 'YES' : 'NO');
  let originalText = '';

  if (button) {
    originalText = button.textContent;
    button.textContent = 'Loading...';
    button.disabled = true;
    console.log('⏳ Button set to loading state');
  }

  try {
    if (templateId === 'custom') {
      console.log('📦 Custom template selected');
      // Custom template - no defaults
      callback({
        id: 'custom',
        name: 'Custom Box',
        defaultConfig: null
      });
    } else {
      console.log('📦 Fetching template:', templateId);
      // Fetch full template data
      const template = await fetchTemplateById(templateId);
      console.log('✅ Template fetched:', template);
      console.log('📞 Calling callback with template');
      callback(template);
    }
  } catch (error) {
    console.error('❌ Error loading template:', error);
    if (button) {
      button.textContent = originalText;
      button.disabled = false;
    }
    alert('Failed to load template. Please try again.');
  }
}

/**
 * Fetch active templates from Firestore
 */
async function fetchTemplates() {
  try {
    const q = query(
      collection(db, 'boxedMealTemplates'),
      where('active', '==', true),
      orderBy('sortOrder', 'asc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching templates:', error);
    return getSampleTemplates();
  }
}

/**
 * Fetch single template by ID
 */
async function fetchTemplateById(templateId) {
  try {
    const templates = await fetchTemplates();
    return templates.find(t => t.id === templateId);
  } catch (error) {
    console.error('Error fetching template:', error);
    return null;
  }
}

/**
 * Sample templates for fallback/testing
 */
function getSampleTemplates() {
  return [
    {
      id: 'office-favorite',
      name: 'Office Favorite',
      tagline: 'Mild & Crowd-Pleasing',
      description: 'Perfect for mixed teams. Boneless wings with Sweet BBQ, classic dips, and NY Cheesecake.',
      heroImage: 'images/resized/office-favorite_1920x1080.webp',
      heatLevel: 1,
      featured: true,
      defaultConfig: {
        wingCount: 6,
        wingType: 'boneless',
        sauce: 'sweet-bbq',
        dips: ['ranch', 'honey-mustard'],
        side: 'chips',
        dessert: 'ny-cheesecake'
      },
      stats: {
        ordersThisMonth: 47,
        avgRating: 4.8
      },
      sortOrder: 1,
      active: true
    },
    {
      id: 'game-day',
      name: 'Game Day Combo',
      tagline: 'Classic Buffalo Heat',
      description: 'Authentic sports bar experience. Bone-in wings with Classic Buffalo and Gourmet Brownie.',
      heroImage: 'images/resized/game-day-template_1920x1080.webp',
      heatLevel: 2,
      defaultConfig: {
        wingCount: 6,
        wingType: 'bone-in',
        wingStyle: 'mixed',
        sauce: 'classic-buffalo',
        dips: ['ranch', 'blue-cheese'],
        side: 'coleslaw',
        dessert: 'gourmet-brownie'
      },
      stats: {
        ordersThisMonth: 34,
        avgRating: 4.9
      },
      sortOrder: 2,
      active: true
    },
    {
      id: 'fire-ice',
      name: 'Fire & Ice',
      tagline: 'Bold & Adventurous',
      description: 'For heat lovers. Boneless wings with spicy sauce blend, cooling dips, and premium cheesecake.',
      heroImage: 'images/resized/fire-ice_1920x1080.webp',
      heatLevel: 4,
      defaultConfig: {
        wingCount: 6,
        wingType: 'boneless',
        sauce: 'hot-honey',
        dips: ['ranch', 'blue-cheese'],
        side: 'potato-salad',
        dessert: 'creme-brulee-cheesecake'
      },
      stats: {
        ordersThisMonth: 21,
        avgRating: 4.7
      },
      sortOrder: 3,
      active: true
    },
    {
      id: 'veggie-delight',
      name: 'Veggie Delight',
      tagline: 'Plant-Based & Refreshing',
      description: 'Perfect for plant-based diets. Delicious plant-based wings with Sweet Teriyaki, fresh veggie sticks, and bottled water.',
      heroImage: 'images/resized/veggie-delight_1920x1080.webp',
      heatLevel: 1,
      featured: true,
      defaultConfig: {
        wingCount: 6,
        wingType: 'plant-based',
        plantBasedPrep: 'fried',  // Default to fried preparation
        sauce: 'sweet-teriyaki',
        dips: ['ranch', 'honey-mustard'],
        side: 'veggie-sticks',
        dessert: 'no-dessert'  // No dessert included
      },
      stats: {
        ordersThisMonth: 18,
        avgRating: 4.6
      },
      sortOrder: 4,
      active: true
    }
  ];
}

/**
 * Helper: Format wing type for display
 */
function formatWingType(type) {
  const types = {
    'boneless': 'Boneless',
    'bone-in': 'Bone-In',
    'plant-based': 'Plant-Based'
  };
  return types[type] || type;
}

/**
 * Helper: Get Firebase Storage URL
 */
function getImageUrl(path) {
  if (!path) return `https://placehold.co/400x300/ff6b35/white?text=No+Image`;

  // If it's already a full URL, return as-is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // Construct Firebase Storage URL
  const bucket = 'philly-wings.firebasestorage.app';
  const encodedPath = encodeURIComponent(path);
  return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodedPath}?alt=media`;
}
