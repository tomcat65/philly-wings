/**
 * Catering Packages Component
 * Displays all catering packages grouped by tier
 * No pricing shown - CTA directs to ezCater
 */

import { getCateringPackages } from '../../services/catering-service.js';
import { getAddOnsSplitByCategory } from '../../services/catering-addons-service.js';
import { renderPackageConfigurator } from './package-configurator.js';
import { initAccordion } from './accordion-state.js';

export async function renderCateringPackages() {
  let packages = await getCateringPackages();

  // If no packages from Firestore, use sample data for testing
  if (packages.length === 0) {
    packages = getSamplePackages();
  }

  // Fetch add-ons once per tier (cache to avoid duplicate reads)
  const tierAddOnsMap = {};
  const tiers = Array.from(new Set(packages.map(pkg => pkg.tier)));

  for (const tier of tiers) {
    try {
      tierAddOnsMap[tier] = await getAddOnsSplitByCategory(tier);
    } catch (error) {
      console.warn(`Unable to load add-ons for tier ${tier}:`, error);
      tierAddOnsMap[tier] = { vegetarian: [], desserts: [], hotBeverages: [] };
    }
  }

  // Group packages by tier
  const tier1 = packages.filter(pkg => pkg.tier === 1);
  const tier2 = packages.filter(pkg => pkg.tier === 2);
  const tier3 = packages.filter(pkg => pkg.tier === 3);

  // Initialize accordions after DOM is ready
  setTimeout(() => {
    packages.forEach(pkg => {
      initAccordion(pkg.id);
    });
  }, 100);

  return `
    <section id="catering-packages" class="packages-section">
      <div class="section-header">
        <h2>Choose Your Package</h2>
        <p class="section-subtitle">From office lunches to large events - we've got you covered</p>
      </div>

      ${renderTier('Office Lunch Packages', 'Perfect for team meetings and lunch deliveries', tier1, tierAddOnsMap[1])}
      ${renderTier('Party Packages', 'Game day, celebrations, and gatherings', tier2, tierAddOnsMap[2])}
      ${renderTier('Large Event Packages', 'Corporate events and big celebrations', tier3, tierAddOnsMap[3])}

      <div class="packages-cta">
        <h3>Ready to Order?</h3>
        <p>Orders processed securely through ezCater with 24/7 support</p>
        <a href="https://www.ezcater.com/brand/pvt/philly-wings-express"
           class="btn-primary btn-large"
           target="_blank"
           rel="noopener noreferrer">
          Order on ezCater →
        </a>
        <p class="cta-note">24-hour advance notice required • Minimum order: 10 people</p>
      </div>
    </section>
  `;
}

function renderTier(tierTitle, tierDescription, packages, tierAddOns = { vegetarian: [], desserts: [], hotBeverages: [] }) {
  if (packages.length === 0) return '';

  return `
    <div class="packages-tier">
      <div class="tier-header">
        <h3 class="tier-title">${tierTitle}</h3>
        <p class="tier-description">${tierDescription}</p>
      </div>

      <div class="packages-grid">
        ${packages.map(pkg => renderPackageCard(pkg, tierAddOns)).join('')}
      </div>
    </div>
  `;
}

function renderPackageCard(pkg, tierAddOns = { vegetarian: [], desserts: [], hotBeverages: [] }) {
  // If package has wingOptions (new schema), render configurator
  if (pkg.wingOptions && pkg.sauceSelections && pkg.dipsIncluded) {
    return renderPackageConfigurator(pkg, tierAddOns);
  }

  // Otherwise, render static card (backward compatibility)
  const popularBadge = pkg.popular ? '<span class="popular-badge">Most Popular</span>' : '';
  const servesRange = pkg.servesMin === pkg.servesMax
    ? `Serves ${pkg.servesMin}`
    : `Serves ${pkg.servesMin}-${pkg.servesMax}`;

  return `
    <div class="package-card ${pkg.popular ? 'package-featured' : ''}">
      ${popularBadge}

      <div class="package-image">
        <img src="/images/${pkg.imageUrl}"
             alt="${pkg.name}"
             loading="lazy">
      </div>

      <div class="package-content">
        <h4 class="package-name">${pkg.name}</h4>
        <p class="package-serves">${servesRange} • ${pkg.wingCount} wings</p>

        <p class="package-description">${pkg.description}</p>

        <div class="package-includes">
          <h5>What's Included:</h5>
          <ul class="includes-list">
            ${pkg.includes.map(item => `<li>${item}</li>`).join('')}
          </ul>
        </div>

        <div class="package-sauces">
          <p class="sauces-note">
            🔥 Choose ${pkg.sauceSelections} sauces from our 14 signature flavors
          </p>
        </div>

        <div class="package-hook">
          <p>${pkg.marketingHook}</p>
        </div>
      </div>

      <div class="package-footer">
        <a href="https://www.ezcater.com/brand/pvt/philly-wings-express"
           class="btn-secondary btn-block"
           target="_blank"
           rel="noopener noreferrer">
          Order This Package →
        </a>
        <p class="footer-note">Pricing shown at checkout</p>
      </div>
    </div>
  `;
}

/**
 * Sample packages for testing (with configurator data)
 */
function getSamplePackages() {
  return [
    {
      id: 'lunch-box-special',
      name: 'The Lunch Box Special',
      tier: 1,
      servesMin: 10,
      servesMax: 12,
      basePrice: 149.99,
      description: 'Perfect for team lunches and small meetings',
      marketingHook: 'Everyone gets their favorite!',
      popular: false,
      imageUrl: 'catering/lunch-box-special.webp',

      // New configurator schema
      wingOptions: {
        totalWings: 60,
        allowMixed: true,
        types: [
          { id: 'bone-in', label: 'Classic Bone-In', dietaryTags: [], prepOptions: ['mixed', 'flats', 'drums'] },
          { id: 'boneless', label: 'Boneless', dietaryTags: [], prepOptions: [] },
          { id: 'cauliflower', label: 'Cauliflower Wings', dietaryTags: ['vegan'], prepOptions: [], allergens: ['none'], equipment: ['fryer'] },
          { id: 'mixed', label: 'Mix & Match', dietaryTags: [], prepOptions: [] }
        ],
        boneInOptions: ['mixed', 'flats', 'drums']
      },

      sauceSelections: {
        min: 3,
        max: 3,
        allowedTypes: ['dry-rub', 'wet-sauce']
      },

      dipsIncluded: {
        count: 15,
        types: ['ranch', 'blue-cheese', 'honey-mustard', 'cheese-sauce']
      },

      sides: [
        { item: 'Large Fries', quantity: 3 },
        { item: 'Mozzarella Sticks', quantity: 12 }
      ],

      includes: ['Plates', 'Napkins', 'Wet Wipes', 'Serving Utensils'],
      active: true
    },
    {
      id: 'sampler-spread',
      name: 'The Sampler Spread',
      tier: 1,
      servesMin: 12,
      servesMax: 15,
      basePrice: 179.99,
      description: 'Great for client lunches and department meetings',
      marketingHook: 'More sauce variety = more excitement',
      popular: true,
      imageUrl: 'catering/sampler-spread.webp',

      wingOptions: {
        totalWings: 72,
        allowMixed: true,
        types: [
          { id: 'bone-in', label: 'Classic Bone-In', dietaryTags: [], prepOptions: ['mixed', 'flats', 'drums'] },
          { id: 'boneless', label: 'Boneless', dietaryTags: [], prepOptions: [] },
          { id: 'cauliflower', label: 'Cauliflower Wings', dietaryTags: ['vegan'], prepOptions: [], allergens: ['none'], equipment: ['fryer'] },
          { id: 'mixed', label: 'Mix & Match', dietaryTags: [], prepOptions: [] }
        ],
        boneInOptions: ['mixed', 'flats', 'drums']
      },

      sauceSelections: {
        min: 4,
        max: 4,
        allowedTypes: ['dry-rub', 'wet-sauce']
      },

      dipsIncluded: {
        count: 20,
        types: ['ranch', 'blue-cheese', 'honey-mustard', 'cheese-sauce']
      },

      sides: [
        { item: 'Large Fries', quantity: 4 },
        { item: 'Mozzarella Sticks', quantity: 16 }
      ],

      includes: ['Plates', 'Napkins', 'Wet Wipes', 'Serving Utensils'],
      active: true
    }
  ];
}
