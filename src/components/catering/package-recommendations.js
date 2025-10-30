/**
 * Package Recommendations Component - SP-004
 * Guided Planner - FLOW B Step 2
 *
 * Shows personalized package recommendations based on event details
 * - Top 3 packages with smart filtering and sorting
 * - "Best Match" badge on #1 recommendation
 * - Dynamic "Why we chose this" reasoning
 * - Escape hatches to view all packages or change details
 *
 * Story: SP-004
 * Created: 2025-10-27
 */

import { getState, updateState } from '../../services/shared-platter-state-service.js';
import { getCateringPackages } from '../../services/catering-service.js';

function isPlantBasedPackage(pkg) {
  if (!pkg) return false;
  if (pkg.isPlantBased === true) return true;
  if (pkg.isPlantBased === false) return false;

  if (Array.isArray(pkg.dietaryTags)) {
    const normalizedTags = pkg.dietaryTags.map(tag => tag.toLowerCase());
    if (normalizedTags.some(tag => tag === 'plant-based' || tag === 'vegan')) {
      return true;
    }
  }

  return Boolean(pkg.id && pkg.id.includes('plant-based'));
}

// ========================================
// Component Initialization
// ========================================

export function initPackageRecommendations() {
  const container = document.getElementById('package-recommendations-container');
  if (!container) return;

  // Only load if container is visible (user navigated to this step)
  // This prevents errors on initial page load
  if (container.style.display === 'none') {
    console.log('📦 Package recommendations container hidden - skipping initialization');
    return;
  }

  // Load recommendations and render
  loadAndRenderRecommendations();
}

// ========================================
// Load and Render
// ========================================

export async function loadAndRenderRecommendations() {
  const container = document.getElementById('package-recommendations-container');
  if (!container) return;

  // Show loading state
  container.innerHTML = renderLoadingState();

  try {
    // Get event details from state
    const state = getState();
    const eventDetails = state.eventDetails;

    // Fetch all packages
    const allPackages = await getCateringPackages();

    // If no event details (Quick Browse path), show all packages
    // If event details exist (Guided Planner path), show top 3 recommendations
    let recommendations;
    if (!eventDetails || !eventDetails.guestCount || !eventDetails.eventType) {
      // Quick Browse: Show all packages
      recommendations = allPackages;
    } else {
      // Guided Planner: Get top 3 recommendations based on event details
      recommendations = getPackageRecommendations(allPackages, eventDetails);
    }

    if (recommendations.length === 0) {
      container.innerHTML = renderNoMatchesState(eventDetails);
      return;
    }

    // Render recommendations
    // Use different render based on whether event details exist
    if (eventDetails && eventDetails.guestCount && eventDetails.eventType) {
      // Guided Planner: Show event-based recommendations
      container.innerHTML = renderRecommendations(recommendations, eventDetails);
    } else {
      // Quick Browse: Show all packages without event context
      container.innerHTML = renderAllPackages(recommendations);
    }

    // Initialize interactions
    setupPackageSelection(recommendations);
    setupNavigationButtons();

  } catch (error) {
    console.error('Error loading recommendations:', error);
    container.innerHTML = renderErrorState('Unable to load packages. Please try again.');
  }
}

// ========================================
// Recommendation Algorithm
// ========================================

function getPackageRecommendations(allPackages, eventDetails) {
  const { guestCount, eventType, dietaryNeeds = [] } = eventDetails;

  // Step 1: Find perfect fits (guest count within range)
  const perfectFits = allPackages.filter(pkg =>
    guestCount >= pkg.servesMin &&
    guestCount <= pkg.servesMax
  );

  // Step 2: Sort ALL packages by distance from guest count (as fallback)
  const sortedByDistance = [...allPackages].sort((a, b) => {
    const aMidpoint = (a.servesMin + a.servesMax) / 2;
    const bMidpoint = (b.servesMin + b.servesMax) / 2;
    const aDistance = Math.abs(aMidpoint - guestCount);
    const bDistance = Math.abs(bMidpoint - guestCount);
    return aDistance - bDistance;
  });

  // Step 3: Combine - prioritize perfect fits, fill remainder with closest alternatives
  let recommended = [...perfectFits];

  // Add closest alternatives until we have 3 packages
  for (const pkg of sortedByDistance) {
    if (recommended.length >= 3) break;
    if (!recommended.includes(pkg)) {
      recommended.push(pkg);
    }
  }

  // Step 4: Prioritize by dietary needs
  if (dietaryNeeds.includes('vegetarian') || dietaryNeeds.includes('vegan')) {
    const plantBased = recommended.filter(isPlantBasedPackage);
    const others = recommended.filter(pkg => !isPlantBasedPackage(pkg));
    recommended = [...plantBased, ...others];
  }

  // Step 5: Sort by event type preferences
  if (eventType === 'corporate') {
    // Higher tiers for corporate events
    recommended.sort((a, b) => {
      if (b.tier !== a.tier) return b.tier - a.tier;
      return b.basePrice - a.basePrice; // Higher price indicates premium
    });
  } else if (eventType === 'sports') {
    // Popular packages for sports events
    recommended.sort((a, b) => {
      const aPopular = a.popular ? 1 : 0;
      const bPopular = b.popular ? 1 : 0;
      if (bPopular !== aPopular) return bPopular - aPopular;
      return a.basePrice - b.basePrice; // Lower price for sports (value)
    });
  } else if (eventType === 'party') {
    // Popular and mid-tier for parties
    recommended.sort((a, b) => {
      const aPopular = a.popular ? 1 : 0;
      const bPopular = b.popular ? 1 : 0;
      if (bPopular !== aPopular) return bPopular - aPopular;
      return Math.abs(a.tier - 2) - Math.abs(b.tier - 2); // Prefer Tier 2
    });
  }

  // Step 6: Return top 3 with enhanced reasoning
  return recommended.slice(0, 3).map((pkg, index) => {
    const isBestMatch = index === 0;
    const isExactFit = perfectFits.includes(pkg);

    return {
      ...pkg,
      isBestMatch,
      isExactFit, // Track whether it's a perfect fit or alternative
      reasoning: generateReasoning(pkg, eventDetails, isBestMatch, isExactFit, guestCount)
    };
  });
}

// ========================================
// Reasoning Generator
// ========================================

function generateReasoning(pkg, eventDetails, isBestMatch, isExactFit, guestCount) {
  const reasons = [];
  const { eventType, dietaryNeeds = [] } = eventDetails;

  // Size match with fit quality messaging
  if (isExactFit) {
    // Perfect fit - guest count within package range
    const servesRange = `${pkg.servesMin}-${pkg.servesMax}`;
    reasons.push(`✅ Perfect for ${servesRange} guests`);
  } else {
    // Not exact fit - show trade-offs
    if (guestCount < pkg.servesMin) {
      const under = pkg.servesMin - guestCount;
      reasons.push(`${pkg.servesMin}-${pkg.servesMax} guests (${under} fewer than minimum - expect leftovers)`);
    } else if (guestCount > pkg.servesMax) {
      const over = guestCount - pkg.servesMax;
      reasons.push(`${pkg.servesMin}-${pkg.servesMax} guests (${over} more than maximum - portions will be lighter)`);
    }
  }

  // Event type match
  const eventTypeMessages = {
    'corporate': 'Great for professional events',
    'sports': 'Perfect for watch parties',
    'party': 'Ideal for celebrations',
    'other': 'Versatile for any occasion'
  };
  reasons.push(eventTypeMessages[eventType] || 'Great choice for your event');

  // Popularity
  if (pkg.popular) {
    reasons.push('Customer favorite');
  }

  // Dietary
  const hasVegetarianNeeds = dietaryNeeds.includes('vegetarian') || dietaryNeeds.includes('vegan');
  if (isPlantBasedPackage(pkg) && hasVegetarianNeeds) {
    reasons.push('Plant-based options available');
  }

  // Tier highlight for best match
  if (isBestMatch && pkg.tier >= 2) {
    reasons.push('Premium selection');
  } else if (isBestMatch && pkg.tier === 1) {
    reasons.push('Best value');
  }

  return reasons;
}

// ========================================
// Render Functions
// ========================================

/**
 * Render all packages (Quick Browse - no event details yet)
 */
function renderAllPackages(packages) {
  return `
    <div class="package-recommendations">
      <!-- Browse Header (no event details) -->
      <div class="recommendations-header">
        <h2 class="recap-title">Choose Your Perfect Package</h2>
        <p class="recommendations-subtitle">
          Browse all available shared platter packages. Customize after selecting.
        </p>
      </div>

      <!-- Packages Grid -->
      <div class="recommendations-grid">
        ${packages.map((pkg, index) => renderPackageCard(pkg)).join('')}
      </div>

      <!-- Note about customization -->
      <div class="browse-note">
        <p>💡 All packages can be fully customized after selection (wings, sauces, sides, and more)</p>
      </div>
    </div>
  `;
}

/**
 * Render recommendations with event context (Guided Planner)
 */
function renderRecommendations(recommendations, eventDetails) {
  const { guestCount, eventType } = eventDetails;

  const eventTypeLabels = {
    'corporate': 'Corporate Meeting',
    'sports': 'Sports Watch Party',
    'party': 'Social Party',
    'other': 'Event'
  };

  return `
    <div class="package-recommendations">
      <!-- Event Recap Header -->
      <div class="recommendations-header">
        <div class="event-recap">
          <h2 class="recap-title">Based on your event:</h2>
          <p class="recap-details">
            <span class="recap-item">${guestCount} guests</span>
            <span class="recap-separator">•</span>
            <span class="recap-item">${eventTypeLabels[eventType] || eventType}</span>
          </p>
        </div>
        <h3 class="recommendations-subtitle">We recommend these packages:</h3>
      </div>

      <!-- Recommendations Grid -->
      <div class="recommendations-grid">
        ${recommendations.map((pkg, index) => renderRecommendationCard(pkg, index)).join('')}
      </div>

      <!-- Navigation Actions -->
      <div class="recommendations-actions">
        <button type="button" class="btn-secondary" id="btn-view-all-packages">
          View All Packages
        </button>
        <button type="button" class="btn-secondary-outline" id="btn-change-event-details">
          ← Change Event Details
        </button>
      </div>
    </div>
  `;
}

/**
 * Render simple package card (Quick Browse - no event reasoning)
 */
function renderPackageCard(pkg) {
  const formattedPrice = pkg.basePrice ? `$${pkg.basePrice.toFixed(2)}` : 'Price TBD';

  // Tier label
  const tierLabels = { 1: 'Tier 1', 2: 'Tier 2', 3: 'Tier 3' };
  const tierLabel = tierLabels[pkg.tier] || '';

  // Serves range
  const servesText = pkg.servesMin && pkg.servesMax
    ? `Serves ${pkg.servesMin}-${pkg.servesMax} people`
    : 'Serves varies';

  return `
    <article
      class="recommendation-card"
      data-package-id="${pkg.id}"
      role="button"
      tabindex="0"
      aria-label="${pkg.name || 'Package'} - ${servesText}">

      <!-- Badges -->
      ${pkg.popular ? '<div class="card-badge popular-badge">🔥 Popular</div>' : ''}
      <div class="card-badge customizable-badge">🔀 Fully Customizable</div>

      <!-- Hero Image -->
      <div class="card-image-wrapper">
        <img
          src="${pkg.heroImage || '/images/placeholders/package-default.webp'}"
          alt="${pkg.name || 'Package'}"
          class="card-image"
          loading="lazy">
      </div>

      <!-- Card Content -->
      <div class="card-content">
        <div class="card-header">
          <h4 class="card-title">${pkg.name || 'Catering Package'}</h4>
          ${tierLabel ? `<span class="card-tier">${tierLabel}</span>` : ''}
        </div>

        <p class="card-serves">${servesText}</p>

        ${pkg.description ? `<p class="card-description">${pkg.description}</p>` : ''}

        <p class="card-customization-note">Can split between traditional and plant-based wings</p>

        <div class="card-footer">
          <span class="card-price">${formattedPrice}</span>
          <button class="btn-select-package" data-package-id="${pkg.id}">
            Select & Customize →
          </button>
        </div>
      </div>
    </article>
  `;
}

/**
 * Render recommendation card with event reasoning (Guided Planner)
 */
function renderRecommendationCard(pkg, index) {
  const isBestMatch = pkg.isBestMatch;
  const formattedPrice = pkg.basePrice ? `$${pkg.basePrice.toFixed(2)}` : 'Price TBD';

  // Tier label
  const tierLabels = {
    1: 'Tier 1',
    2: 'Tier 2',
    3: 'Tier 3'
  };
  const tierLabel = tierLabels[pkg.tier] || '';

  // Serves range
  const servesText = pkg.servesMin && pkg.servesMax
    ? `Serves ${pkg.servesMin}-${pkg.servesMax} people`
    : 'Serves varies';

  return `
    <article
      class="recommendation-card ${isBestMatch ? 'best-match' : ''}"
      data-package-id="${pkg.id}"
      role="button"
      tabindex="0"
      aria-label="${pkg.name || 'Package'} - ${servesText}">

      <!-- Badges -->
      ${isBestMatch ? '<div class="card-badge best-match-badge">⭐ Best Match</div>' : ''}
      ${pkg.popular && !isBestMatch ? '<div class="card-badge popular-badge">🔥 Popular</div>' : ''}
      <div class="card-badge customizable-badge">🔀 Fully Customizable</div>

      <!-- Hero Image -->
      <div class="card-image-wrapper">
        <img
          src="${pkg.heroImage || '/images/placeholders/package-default.webp'}"
          alt="${pkg.name || 'Package'}"
          class="card-image"
          loading="lazy">
      </div>

      <!-- Card Content -->
      <div class="card-content">
        <div class="card-header">
          <h4 class="card-title">${pkg.name || 'Catering Package'}</h4>
          ${tierLabel ? `<span class="card-tier">${tierLabel}</span>` : ''}
        </div>

        <p class="card-serves">${servesText}</p>

        <p class="card-customization-note">Can split between traditional and plant-based wings</p>

        <!-- Why We Chose This -->
        ${pkg.reasoning && pkg.reasoning.length > 0 ? `
          <div class="card-reasoning">
            <p class="reasoning-label">Why we chose this:</p>
            <ul class="reasoning-list">
              ${pkg.reasoning.map(reason => `<li class="reasoning-item">✓ ${reason}</li>`).join('')}
            </ul>
          </div>
        ` : ''}

        <!-- Price -->
        <div class="card-price">
          <span class="price-label">Starting at</span>
          <span class="price-value">${formattedPrice}</span>
        </div>

        <!-- CTA Button -->
        <button
          type="button"
          class="btn-select-package ${isBestMatch ? 'btn-primary' : 'btn-secondary'}"
          data-package-id="${pkg.id}">
          ${isBestMatch ? 'Choose & Customize' : 'Select & Customize'} →
        </button>
      </div>
    </article>
  `;
}

function renderLoadingState() {
  return `
    <div class="recommendations-loading" role="status" aria-live="polite">
      <div class="aural-spinner" aria-hidden="true"></div>
      <p class="loading-text">Finding the perfect packages for your event...</p>
    </div>
  `;
}

function renderErrorState(message) {
  return `
    <div class="recommendations-error">
      <div class="error-icon">⚠️</div>
      <p class="error-message">${message}</p>
      <button type="button" class="btn-secondary" id="btn-back-to-event-details">
        ← Back to Event Details
      </button>
    </div>
  `;
}

function renderNoMatchesState(eventDetails) {
  return `
    <div class="recommendations-no-matches">
      <div class="no-matches-icon">🔍</div>
      <h3 class="no-matches-title">No exact matches found</h3>
      <p class="no-matches-message">
        We couldn't find packages that perfectly fit ${eventDetails.guestCount} guests,
        but we have many options available.
      </p>
      <div class="no-matches-actions">
        <button type="button" class="btn-primary" id="btn-view-all-packages-fallback">
          View All Packages
        </button>
        <button type="button" class="btn-secondary-outline" id="btn-change-guest-count">
          Adjust Guest Count
        </button>
      </div>
    </div>
  `;
}

// ========================================
// Event Handlers
// ========================================

function setupPackageSelection(recommendations) {
  // Get all select buttons
  const selectButtons = document.querySelectorAll('.btn-select-package');

  selectButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      const packageId = button.dataset.packageId;
      handlePackageSelection(packageId, recommendations);
    });
  });

  // Also allow clicking the entire card
  const cards = document.querySelectorAll('.recommendation-card');
  cards.forEach(card => {
    card.addEventListener('click', () => {
      const packageId = card.dataset.packageId;
      handlePackageSelection(packageId, recommendations);
    });

    // Keyboard support
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const packageId = card.dataset.packageId;
        handlePackageSelection(packageId, recommendations);
      }
    });
  });
}

function handlePackageSelection(packageId, recommendations) {
  const selectedPackage = recommendations.find(pkg => pkg.id === packageId);

  if (!selectedPackage) {
    console.error('Package not found:', packageId);
    return;
  }

  // Update state
  updateState('selectedPackage', selectedPackage);
  updateState('currentStep', 'customize-spread');

  // Announce selection for screen readers
  announceSelection(selectedPackage.name);

  // Navigate to customization screen (SP-006)
  navigateToCustomization();
}

function setupNavigationButtons() {
  // View All Packages button
  const viewAllButton = document.getElementById('btn-view-all-packages');
  const viewAllFallback = document.getElementById('btn-view-all-packages-fallback');

  if (viewAllButton) {
    viewAllButton.addEventListener('click', () => {
      updateState('currentStep', 'package-selection');
      navigateToPackageGallery();
    });
  }

  if (viewAllFallback) {
    viewAllFallback.addEventListener('click', () => {
      updateState('currentStep', 'package-selection');
      navigateToPackageGallery();
    });
  }

  // Change Event Details button
  const changeDetailsButton = document.getElementById('btn-change-event-details');
  const changeGuestCountButton = document.getElementById('btn-change-guest-count');
  const backButton = document.getElementById('btn-back-to-event-details');

  if (changeDetailsButton) {
    changeDetailsButton.addEventListener('click', () => {
      updateState('currentStep', 'event-details');
      navigateToEventDetails();
    });
  }

  if (changeGuestCountButton) {
    changeGuestCountButton.addEventListener('click', () => {
      updateState('currentStep', 'event-details');
      navigateToEventDetails();
    });
  }

  if (backButton) {
    backButton.addEventListener('click', () => {
      updateState('currentStep', 'event-details');
      navigateToEventDetails();
    });
  }
}

// ========================================
// Navigation Helpers
// ========================================

function navigateToCustomization() {
  // Hide recommendations
  const recommendationsContainer = document.getElementById('package-recommendations-container');
  if (recommendationsContainer) {
    recommendationsContainer.style.display = 'none';
  }

  // Show customization screen (SP-006 - not yet implemented)
  const customizationContainer = document.getElementById('customization-screen-container');
  if (customizationContainer) {
    customizationContainer.style.display = 'block';
    customizationContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Initialize customization screen if function exists
    if (typeof window.initCustomizationScreen === 'function') {
      window.initCustomizationScreen();
    }
  } else {
    console.warn('Customization screen (SP-006) not yet implemented - showing placeholder');
    showPlaceholder('Customization Screen (SP-006)');
  }
}

function navigateToPackageGallery() {
  // Clear event details to show ALL packages
  updateState('eventDetails', {
    guestCount: null,
    eventType: '',
    dietaryNeeds: []
  });
  updateState('flowType', 'quick-browse');

  // Re-render recommendations (will show all packages)
  loadAndRenderRecommendations();

  // Scroll to top of recommendations
  const recommendationsContainer = document.getElementById('package-recommendations-container');
  if (recommendationsContainer) {
    recommendationsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function navigateToEventDetails() {
  // Hide recommendations
  const recommendationsContainer = document.getElementById('package-recommendations-container');
  if (recommendationsContainer) {
    recommendationsContainer.style.display = 'none';
  }

  // Show event details form (SP-003)
  const eventDetailsContainer = document.getElementById('event-details-form-container');
  if (eventDetailsContainer) {
    eventDetailsContainer.style.display = 'block';
    eventDetailsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// ========================================
// Accessibility
// ========================================

function announceSelection(packageName) {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', 'polite');
  announcement.className = 'sr-only';
  announcement.textContent = `Selected ${packageName}. Loading customization options...`;
  document.body.appendChild(announcement);

  setTimeout(() => {
    announcement.remove();
  }, 1000);
}

// ========================================
// Placeholder for Unimplemented Screens
// ========================================

function showPlaceholder(screenName) {
  const placeholder = document.createElement('div');
  placeholder.style.cssText = 'padding: 3rem; text-align: center; background: #f8f9fa; border-radius: 16px; margin: 2rem auto; max-width: 600px;';
  placeholder.innerHTML = `
    <h2 style="color: #2c3e50; margin-bottom: 1rem;">${screenName}</h2>
    <p style="color: #7f8c8d; margin-bottom: 1.5rem;">This screen will be implemented in the next sprint.</p>
    <button onclick="location.reload()" style="background: #e74c3c; color: white; border: none; padding: 0.75rem 2rem; border-radius: 8px; cursor: pointer; font-size: 1rem;">
      ← Back to Start
    </button>
  `;

  const container = document.querySelector('.catering-container') || document.body;
  container.appendChild(placeholder);
  placeholder.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ========================================
// Public API
// ========================================

export function renderPackageRecommendations() {
  return `
    <div id="package-recommendations-container" class="package-recommendations-wrapper" style="display: none;">
      <!-- Recommendations will be dynamically loaded here -->
      <!-- Container hidden until user navigates from event details form -->
    </div>
  `;
}
