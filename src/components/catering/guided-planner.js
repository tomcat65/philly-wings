/**
 * Guided Catering Planner - Wizard-style event planning experience
 * Collects structured data for future direct ordering flow
 */

import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../firebase-config.js';
import { initWizardInteractions } from './wizard-interactions.js';

// Wizard state management
let wizardState = {
  currentStep: 1,
  totalSteps: 5,
  eventDetails: {
    guestCount: null,
    eventType: null,
    eventDate: null
  },
  selectedPackage: null,
  sauceSelections: [],
  addOns: [],
  contactInfo: {}
};

/**
 * Main render function for the guided planner
 */
export async function renderGuidedPlanner() {
  // Load data from Firestore
  const packages = await fetchCateringPackages();
  const sauces = await fetchSauces();
  const addOns = await fetchAddOns();

  const html = `
    <section id="catering-planner" class="guided-planner-section">
      <div class="planner-header">
        <h2>Plan Your Shared Platter Event</h2>
        <p class="planner-subtitle">Let's find the perfect package for your celebration</p>
      </div>

      ${renderProgressIndicator()}

      <div class="planner-wizard">
        ${renderStep1EventDetails()}
        ${renderStep2PackageSelection(packages)}
        ${renderStep3SauceCustomization(sauces)}
        ${renderStep4AddOns(addOns)}
        ${renderStep5ReviewContact()}
      </div>

      <div class="wizard-navigation">
        <button id="wizard-prev" class="btn-secondary btn-wizard" style="display: none;">
          ← Previous
        </button>
        <button id="wizard-next" class="btn-primary btn-wizard">
          Continue →
        </button>
      </div>
    </section>
  `;

  // Attach event listeners after render
  setTimeout(() => initWizardInteractions(packages, sauces, addOns), 100);

  return html;
}

/**
 * Progress indicator showing current step
 */
function renderProgressIndicator() {
  const steps = [
    { num: 1, label: 'Event Details' },
    { num: 2, label: 'Choose Package' },
    { num: 3, label: 'Customize Wings' },
    { num: 4, label: 'Add Extras' },
    { num: 5, label: 'Review & Contact' }
  ];

  return `
    <div class="wizard-progress">
      ${steps.map(step => `
        <div class="progress-step ${wizardState.currentStep === step.num ? 'active' : ''} ${wizardState.currentStep > step.num ? 'completed' : ''}">
          <div class="step-number">${step.num}</div>
          <div class="step-label">${step.label}</div>
        </div>
      `).join('<div class="progress-connector"></div>')}
    </div>
  `;
}

/**
 * Step 1: Event Details
 */
function renderStep1EventDetails() {
  return `
    <div class="wizard-step" id="step-1" style="display: block;">
      <div class="step-content">
        <h3 class="step-title">Tell Us About Your Event</h3>
        <p class="step-description">Help us recommend the perfect package</p>

        <div class="form-group">
          <label for="guest-count">How many people are you feeding?</label>
          <div class="guest-count-selector">
            ${[
              { range: '10-15', label: '10-15 people', value: 12 },
              { range: '16-25', label: '16-25 people', value: 20 },
              { range: '26-40', label: '26-40 people', value: 33 },
              { range: '41-60', label: '41-60 people', value: 50 },
              { range: '60+', label: '60+ people', value: 70 }
            ].map(option => `
              <button class="guest-count-option" data-count="${option.value}">
                <span class="count-range">${option.range}</span>
                <span class="count-label">${option.label}</span>
              </button>
            `).join('')}
          </div>
        </div>

        <div class="form-group">
          <label for="event-type">What's the occasion?</label>
          <div class="event-type-grid">
            ${[
              { icon: '💼', label: 'Office Lunch', value: 'office-lunch' },
              { icon: '🏈', label: 'Game Day Party', value: 'game-day' },
              { icon: '🎉', label: 'Team Celebration', value: 'celebration' },
              { icon: '👥', label: 'Client Meeting', value: 'client-meeting' },
              { icon: '🎓', label: 'School Event', value: 'school-event' },
              { icon: '🏆', label: 'Other Event', value: 'other' }
            ].map(type => `
              <button class="event-type-card" data-type="${type.value}">
                <span class="event-icon">${type.icon}</span>
                <span class="event-label">${type.label}</span>
              </button>
            `).join('')}
          </div>
        </div>

        <div class="form-group">
          <label for="event-date">When do you need it?</label>
          <input type="date"
                 id="event-date"
                 class="form-input"
                 min="${getMinDate()}"
                 placeholder="Select delivery date">
          <p class="field-hint">📅 24-hour advance notice required</p>
        </div>
      </div>
    </div>
  `;
}

/**
 * Step 2: Package Selection (simplified based on guest count)
 */
function renderStep2PackageSelection(packages) {
  return `
    <div class="wizard-step" id="step-2" style="display: none;">
      <div class="step-content">
        <h3 class="step-title">Choose Your Package</h3>
        <p class="step-description" id="package-recommendation"></p>

        <div class="package-cards" id="package-cards">
          ${packages.map(pkg => renderPackageCard(pkg)).join('')}
        </div>

        <div class="package-help">
          <p>💡 <strong>Need help choosing?</strong> Call us at <a href="tel:+12673763113">(267) 376-3113</a></p>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render individual package card
 */
function renderPackageCard(pkg) {
  return `
    <div class="package-card" data-package-id="${pkg.id}">
      <div class="package-header">
        <h4 class="package-name">${pkg.name}</h4>
        <div class="package-serves">Serves ${pkg.servesMin}-${pkg.servesMax} people</div>
      </div>

      <div class="package-body">
        <div class="package-includes">
          <div class="include-item">
            <span class="include-icon">🍗</span>
            <span class="include-text">${pkg.totalWings} Wings</span>
          </div>
          <div class="include-item">
            <span class="include-icon">🌶️</span>
            <span class="include-text">${pkg.sauceCount} Sauce Choices</span>
          </div>
          ${pkg.sidesIncluded ? `
            <div class="include-item">
              <span class="include-icon">🍟</span>
              <span class="include-text">${pkg.sidesIncluded}</span>
            </div>
          ` : ''}
          ${pkg.dipsIncluded ? `
            <div class="include-item">
              <span class="include-icon">🥣</span>
              <span class="include-text">${pkg.dipsIncluded}</span>
            </div>
          ` : ''}
        </div>

        ${pkg.popular ? '<div class="package-badge">⭐ Most Popular</div>' : ''}
        ${pkg.description ? `<p class="package-description">${pkg.description}</p>` : ''}
      </div>

      <div class="package-footer">
        <button class="btn-select-package" data-package-id="${pkg.id}">
          Select This Package
        </button>
      </div>
    </div>
  `;
}

/**
 * Step 3: Sauce Customization
 */
function renderStep3SauceCustomization(sauces) {
  return `
    <div class="wizard-step" id="step-3" style="display: none;">
      <div class="step-content">
        <h3 class="step-title">Choose Your Sauces</h3>
        <p class="step-description" id="sauce-instruction"></p>

        <div class="sauce-selector-wizard">
          <div class="sauce-grid">
            ${sauces.map(sauce => `
              <div class="sauce-card" data-sauce-id="${sauce.id}">
                <div class="sauce-name">${sauce.name}</div>
                <div class="sauce-heat">
                  ${'🌶️'.repeat(sauce.heatLevel || 1)}
                </div>
                ${sauce.description ? `<p class="sauce-desc">${sauce.description}</p>` : ''}
                <button class="btn-select-sauce" data-sauce-id="${sauce.id}">
                  Select
                </button>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="sauce-selections">
          <h4>Your Selections (<span id="sauce-count">0</span>/<span id="sauce-max">0</span>)</h4>
          <div id="selected-sauces" class="selected-sauce-list"></div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Step 4: Add-ons & Extras
 */
function renderStep4AddOns(addOns) {
  return `
    <div class="wizard-step" id="step-4" style="display: none;">
      <div class="step-content">
        <h3 class="step-title">Add Extras (Optional)</h3>
        <p class="step-description">Make your event even better with these add-ons</p>

        <div class="addon-grid">
          ${addOns.map(addon => `
            <div class="addon-card">
              <div class="addon-header">
                <h5 class="addon-name">${addon.name}</h5>
                ${addon.category ? `<span class="addon-category">${addon.category}</span>` : ''}
              </div>
              ${addon.description ? `<p class="addon-description">${addon.description}</p>` : ''}
              <div class="addon-footer">
                <button class="btn-toggle-addon" data-addon-id="${addon.id}">
                  <span class="addon-add">+ Add</span>
                  <span class="addon-remove" style="display: none;">✓ Added</span>
                </button>
              </div>
            </div>
          `).join('')}
        </div>

        <div class="skip-addons">
          <p>Don't need extras? <button class="btn-text" id="skip-addons">Skip this step →</button></p>
        </div>
      </div>
    </div>
  `;
}

/**
 * Step 5: Review & Contact
 */
function renderStep5ReviewContact() {
  return `
    <div class="wizard-step" id="step-5" style="display: none;">
      <div class="step-content">
        <h3 class="step-title">Review Your Order</h3>
        <p class="step-description">Almost there! Let's confirm your selections</p>

        <div class="order-summary">
          <div class="summary-section">
            <h4>Event Details</h4>
            <div id="summary-event"></div>
          </div>

          <div class="summary-section">
            <h4>Package</h4>
            <div id="summary-package"></div>
          </div>

          <div class="summary-section">
            <h4>Sauces</h4>
            <div id="summary-sauces"></div>
          </div>

          <div class="summary-section" id="summary-addons-section" style="display: none;">
            <h4>Add-ons</h4>
            <div id="summary-addons"></div>
          </div>
        </div>

        <div class="contact-form">
          <h4>Your Contact Information</h4>
          <p class="form-intro">We'll use this to follow up with your quote and finalize details</p>

          <div class="form-row">
            <div class="form-group">
              <label for="contact-name">Name *</label>
              <input type="text" id="contact-name" class="form-input" required>
            </div>
            <div class="form-group">
              <label for="contact-company">Company</label>
              <input type="text" id="contact-company" class="form-input">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="contact-email">Email *</label>
              <input type="email" id="contact-email" class="form-input" required>
            </div>
            <div class="form-group">
              <label for="contact-phone">Phone *</label>
              <input type="tel" id="contact-phone" class="form-input" required>
            </div>
          </div>

          <div class="form-group">
            <label for="contact-notes">Special Requests or Notes</label>
            <textarea id="contact-notes" class="form-textarea" rows="3" placeholder="Dietary restrictions, delivery instructions, etc."></textarea>
          </div>
        </div>

        <div class="submit-quote">
          <button id="submit-quote-request" class="btn-primary btn-large">
            Get Your Free Quote
          </button>
          <p class="submit-note">We'll respond within 2 hours during business hours</p>
        </div>
      </div>
    </div>
  `;
}

/**
 * Fetch data functions
 */
async function fetchCateringPackages() {
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

async function fetchSauces() {
  try {
    const q = query(
      collection(db, 'sauces'),
      where('active', '==', true),
      orderBy('sortOrder', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching sauces:', error);
    return getSampleSauces();
  }
}

async function fetchAddOns() {
  try {
    const q = query(
      collection(db, 'cateringAddOns'),
      where('active', '==', true),
      orderBy('category', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching add-ons:', error);
    return [];
  }
}

/**
 * Sample data fallbacks
 */
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

function getSampleSauces() {
  return [
    { id: 'buffalo', name: 'Classic Buffalo', heatLevel: 2, description: 'The original' },
    { id: 'bbq', name: 'Sweet BBQ', heatLevel: 0, description: 'Tangy & sweet' },
    { id: 'honey-hot', name: 'Honey Hot', heatLevel: 3, description: 'Sweet heat balance' },
    { id: 'garlic-parm', name: 'Garlic Parmesan', heatLevel: 0, description: 'Savory favorite' }
  ];
}

/**
 * Utility functions
 */
function getMinDate() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
}

export { wizardState };
