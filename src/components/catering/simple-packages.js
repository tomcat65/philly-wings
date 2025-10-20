/**
 * Simple Package Browse View (Default)
 * Quick overview with optional wizard launcher
 */

import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../firebase-config.js';
import { renderPackageConfigurator } from './package-configurator.js';
import { getAddOnsSplitByCategory } from '../../services/catering-addons-service.js';

export async function renderSimplePackages() {
  const packages = await fetchPackages();

  // Fetch add-ons for each tier (cache to avoid duplicate reads)
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

  return `
    <section class="simple-packages-section">
      <div class="packages-header">
        <h2>Shared Platters</h2>
        <p class="packages-subtitle">Perfect for tailgates, celebrations, office parties & game days</p>
        <p class="packages-description">
          Everyone shares from party-friendly platters with your choice of wing flavors,
          signature sauces, and sides. Great for any gathering where food brings people together.
        </p>
      </div>

      <!-- Choice Banner -->
      <div class="browse-choice-banner">
        <div class="choice-option active" id="quick-browse-tab">
          <div class="choice-icon">⚡</div>
          <div class="choice-label">Quick Browse</div>
          <div class="choice-desc">See all packages at a glance</div>
        </div>
        <div class="choice-divider">or</div>
        <div class="choice-option" id="guided-planner-tab">
          <div class="choice-icon">🎯</div>
          <div class="choice-label">Guided Planner</div>
          <div class="choice-desc">Get personalized recommendations</div>
        </div>
      </div>

      <!-- Quick Browse View (Default) -->
      <div id="quick-browse-view" class="quick-browse-view">
        <div class="simple-packages-grid">
          ${packages.map(pkg => renderSimplePackageCard(pkg, tierAddOnsMap[pkg.tier] || { vegetarian: [], desserts: [], hotBeverages: [] })).join('')}
        </div>

        <div class="browse-actions">
          <a href="https://www.ezcater.com/brand/pvt/philly-wings-express"
             class="btn-primary btn-large"
             target="_blank"
             rel="noopener noreferrer">
            Order on ezCater →
          </a>
          <a href="tel:+12673763113" class="btn-secondary btn-large">
            Call Us: (267) 376-3113
          </a>
        </div>

        <div class="help-box">
          <p class="help-text">
            <strong>Not sure which package is right?</strong><br>
            Use our <button class="btn-text-link" id="launch-wizard-btn">Guided Planner</button>
            to get personalized recommendations based on your event details.
          </p>
        </div>
      </div>

      <!-- Guided Planner View (Hidden by default) -->
      <div id="guided-planner-view" class="guided-planner-view" style="display: none;">
        <!-- Wizard will be injected here -->
      </div>
    </section>
  `;
}

function renderSimplePackageCard(pkg, tierAddOns = { vegetarian: [], desserts: [], hotBeverages: [] }) {
  // If package has wingOptions (new schema), render configurator with hot beverages
  if (pkg.wingOptions && pkg.sauceSelections && pkg.dipsIncluded) {
    return renderPackageConfigurator(pkg, tierAddOns);
  }

  // Otherwise, render static card (backward compatibility)
  return `
    <div class="simple-package-card">
      <div class="package-badge-row">
        ${pkg.popular ? '<span class="popular-badge">⭐ Most Popular</span>' : ''}
      </div>

      <h3 class="package-name">${pkg.name}</h3>

      <div class="package-serves-banner">
        <span class="serves-icon">👥</span>
        <span class="serves-text">Serves ${pkg.servesMin}-${pkg.servesMax} people</span>
      </div>

      <div class="package-highlights">
        <div class="highlight-item">
          <span class="highlight-icon">🍗</span>
          <span class="highlight-text"><strong>${pkg.totalWings}</strong> Wings</span>
        </div>
        <div class="highlight-item">
          <span class="highlight-icon">🌶️</span>
          <span class="highlight-text"><strong>${pkg.sauceCount}</strong> Sauce Choices</span>
        </div>
        ${pkg.sidesIncluded ? `
          <div class="highlight-item">
            <span class="highlight-icon">🍟</span>
            <span class="highlight-text">${pkg.sidesIncluded}</span>
          </div>
        ` : ''}
        ${pkg.dipsIncluded ? `
          <div class="highlight-item">
            <span class="highlight-icon">🥣</span>
            <span class="highlight-text">${pkg.dipsIncluded}</span>
          </div>
        ` : ''}
      </div>

      ${pkg.description ? `
        <p class="package-tagline">${pkg.description}</p>
      ` : ''}

      <div class="package-card-footer">
        <a href="https://www.ezcater.com/brand/pvt/philly-wings-express"
           class="btn-package-order"
           target="_blank"
           rel="noopener noreferrer">
          Order This Package →
        </a>
      </div>
    </div>
  `;
}

async function fetchPackages() {
  try {
    const q = query(
      collection(db, 'cateringPackages'),
      where('active', '==', true),
      where('type', '==', 'party-platters'),
      orderBy('tier', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching packages:', error);
    return getSamplePackages();
  }
}

function getSamplePackages() {
  return [
    {
      id: 'sampler',
      name: 'Sampler Spread',
      servesMin: 10,
      servesMax: 12,
      totalWings: 100,
      sauceCount: 3,
      sidesIncluded: 'Fries for 10',
      dipsIncluded: '3 Ranch Cups',
      popular: true,
      description: 'Perfect for office lunches and small team meetings'
    },
    {
      id: 'lunch-box',
      name: 'Lunch Box Special',
      servesMin: 12,
      servesMax: 15,
      totalWings: 125,
      sauceCount: 4,
      sidesIncluded: 'Fries for 12',
      dipsIncluded: '4 Ranch Cups',
      description: 'Great for larger teams and celebrations'
    }
  ];
}

/**
 * Initialize view switching between quick browse and guided planner
 */
export function initPackageViewSwitching(wizardData) {
  // Tab switching
  const quickBrowseTab = document.getElementById('quick-browse-tab');
  const guidedPlannerTab = document.getElementById('guided-planner-tab');
  const quickBrowseView = document.getElementById('quick-browse-view');
  const guidedPlannerView = document.getElementById('guided-planner-view');
  const launchWizardBtn = document.getElementById('launch-wizard-btn');

  function showQuickBrowse() {
    quickBrowseTab?.classList.add('active');
    guidedPlannerTab?.classList.remove('active');
    if (quickBrowseView) quickBrowseView.style.display = 'block';
    if (guidedPlannerView) guidedPlannerView.style.display = 'none';
  }

  function showGuidedPlanner() {
    quickBrowseTab?.classList.remove('active');
    guidedPlannerTab?.classList.add('active');
    if (quickBrowseView) quickBrowseView.style.display = 'none';
    if (guidedPlannerView) {
      guidedPlannerView.style.display = 'block';

      // Inject wizard HTML if not already present
      if (!guidedPlannerView.querySelector('.guided-planner-section')) {
        guidedPlannerView.innerHTML = wizardData.html;

        // Initialize wizard interactions AFTER DOM insertion
        import('./wizard-interactions.js').then(module => {
          module.initWizardInteractions(wizardData.packages, wizardData.sauces, wizardData.addOns);
        });
      }
    }

    // Scroll to planner
    document.getElementById('catering-packages')?.scrollIntoView({ behavior: 'smooth' });
  }

  // Event listeners
  if (quickBrowseTab) {
    quickBrowseTab.addEventListener('click', showQuickBrowse);
  }

  if (guidedPlannerTab) {
    guidedPlannerTab.addEventListener('click', showGuidedPlanner);
  }

  if (launchWizardBtn) {
    launchWizardBtn.addEventListener('click', (e) => {
      e.preventDefault();
      showGuidedPlanner();
    });
  }
}
