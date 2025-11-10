/**
 * Shared Platters V2 - Entry Choice Screen Component
 *
 * Presents two distinct ordering paths:
 * 1. Quick Browse - For experienced customers who want to see all options
 * 2. Guided Planner - For first-timers who need recommendations
 *
 * Design: Sally (UX Expert)
 * Implementation: Claude Code
 * Story: SP-001
 * Created: 2025-10-27
 */

import { updateState } from '../../services/shared-platter-state-service.js';
import { loadAndRenderRecommendations } from './package-recommendations.js';
import { initEventDetailsForm } from './event-details-form.js';

/**
 * Initialize the entry choice screen
 * Sets up event listeners and accessibility features
 */
export function initEntryChoiceV2() {
  const quickBrowseCard = document.querySelector('[data-path="quick-browse"]');
  const guidedPlannerCard = document.querySelector('[data-path="guided-planner"]');

  if (!quickBrowseCard || !guidedPlannerCard) {
    console.warn('Entry choice cards not found in DOM');
    return;
  }

  // Quick Browse path
  quickBrowseCard.addEventListener('click', () => {
    handlePathSelection('quick-browse', 'Quick Browse');
  });

  // Guided Planner path
  guidedPlannerCard.addEventListener('click', () => {
    handlePathSelection('guided-planner', 'Guided Planner');
  });

  // Keyboard support (Enter and Space keys)
  [quickBrowseCard, guidedPlannerCard].forEach(card => {
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });
  });

  console.log('Entry choice V2 initialized');
}

/**
 * Handle path selection
 * @param {string} path - Selected path ('quick-browse' or 'guided-planner')
 * @param {string} label - Human-readable label for announcements
 */
function handlePathSelection(path, label) {
  // Update state service
  updateState('flowType', path);

  // Set appropriate starting step
  if (path === 'quick-browse') {
    updateState('currentStep', 'package-recommendations');
  } else {
    // Guided Planner starts with event details form (SP-003)
    updateState('currentStep', 'event-details');
  }

  // Announce selection for screen readers
  announceSelection(label);

  // Navigate to appropriate view
  if (path === 'quick-browse') {
    navigateToQuickBrowse();
  } else {
    navigateToGuidedPlanner();
  }
}

/**
 * Announce selection to screen readers
 * @param {string} choice - The choice made by the user
 */
function announceSelection(choice) {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', 'polite');
  announcement.className = 'sr-only';
  announcement.textContent = `Loading ${choice} experience...`;
  document.body.appendChild(announcement);

  // Remove announcement after 1 second
  setTimeout(() => {
    announcement.remove();
  }, 1000);
}

/**
 * Navigate to Quick Browse view
 * Shows all packages in gallery format
 */
function navigateToQuickBrowse() {
  // Hide entry choice section
  const entrySection = document.querySelector('.entry-choice-section');
  if (entrySection) {
    entrySection.style.display = 'none';
  }

  // Show package recommendations (SP-004) - same as Guided Planner
  // Both paths show all available packages, just with different entry UX
  const recommendationsContainer = document.getElementById('package-recommendations-container');
  if (recommendationsContainer) {
    recommendationsContainer.style.display = 'block';
    recommendationsContainer.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });

    // Load and render all packages
    loadAndRenderRecommendations();
  } else {
    console.warn('Package recommendations container not found');
  }
}

/**
 * Navigate to Guided Planner view
 * Shows SP-003 Event Details Form FIRST to collect guest count and event type
 */
function navigateToGuidedPlanner() {
  // Hide entry choice section
  const entrySection = document.querySelector('.entry-choice-section');
  if (entrySection) {
    entrySection.style.display = 'none';
  }

  // Show event details form (SP-003) - FIRST STEP in Guided Planner
  const eventDetailsContainer = document.getElementById('event-details-form-container');
  if (eventDetailsContainer) {
    eventDetailsContainer.style.display = 'block';
    eventDetailsContainer.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });

    // Initialize the event details form
    initEventDetailsForm();
  } else {
    console.warn('Event details form container not found');
  }
}

/**
 * Show placeholder for unimplemented views
 * @param {string} viewName - Name of the view
 */
function showPlaceholder(viewName) {
  const placeholder = document.createElement('div');
  placeholder.style.cssText = 'padding: 3rem; text-align: center; background: #f8f9fa; border-radius: 16px; margin: 2rem auto; max-width: 600px;';
  placeholder.innerHTML = `
    <h2 style="color: #2c3e50; margin-bottom: 1rem;">${viewName}</h2>
    <p style="color: #7f8c8d; margin-bottom: 1.5rem;">This view will be implemented in the next sprint.</p>
    <button onclick="location.reload()" style="background: #e74c3c; color: white; border: none; padding: 0.75rem 2rem; border-radius: 8px; cursor: pointer; font-size: 1rem;">
      ← Back to Entry Choice
    </button>
  `;

  const container = document.querySelector('.catering-container') || document.body;
  container.appendChild(placeholder);
}

/**
 * Render the entry choice section HTML
 * @returns {string} HTML string for the entry choice section
 */
export function renderEntryChoiceV2() {
  return `
    <section class="entry-choice-section" role="region" aria-labelledby="entry-choice-heading">
      <div class="entry-choice-header">
        <h2 id="entry-choice-heading">Which way do you want to order?</h2>
        <p class="entry-choice-subtitle">Choose the experience that fits your needs</p>
      </div>

      <div class="entry-choice-cards">
        <!-- Quick Browse Card -->
        <article class="entry-choice-card" data-path="quick-browse" role="button" tabindex="0" aria-label="Quick Browse - View all platters at once">
          <div class="card-icon">🏃</div>
          <div class="card-content">
            <h3 class="card-title">Quick Browse</h3>
            <p class="card-subtitle">For experienced customers</p>
            <p class="card-description">
              Browse all our signature platters and choose what looks good.
              Perfect if you know what you want or love exploring options.
            </p>
            <ul class="card-benefits">
              <li>See all platters at once</li>
              <li>Direct selection & customization</li>
              <li>Fast checkout for experienced users</li>
            </ul>
          </div>
          <span class="card-cta-button">View All Platters</span>
        </article>

        <!-- Guided Planner Card -->
        <article class="entry-choice-card" data-path="guided-planner" role="button" tabindex="0" aria-label="Guided Planner - Get personalized recommendations">
          <div class="card-icon">🧭</div>
          <div class="card-content">
            <h3 class="card-title">Guided Planner</h3>
            <p class="card-subtitle">For first-timers</p>
            <p class="card-description">
              Answer a few quick questions and we'll recommend the perfect spread
              for your team. Takes less than 60 seconds.
            </p>
            <ul class="card-benefits">
              <li>Smart recommendations based on your answers</li>
              <li>Filters by team size, preferences & budget</li>
              <li>Saves time with curated suggestions</li>
            </ul>
          </div>
          <span class="card-cta-button">Get Started</span>
        </article>
      </div>
    </section>

    <!-- Placeholder sections for future stories -->
    <div id="package-gallery-view" style="display: none;">
      <!-- SP-002: Package Gallery will go here -->
    </div>

    <div id="guided-planner-view" style="display: none;">
      <!-- SP-003: Event Details Form will go here -->
    </div>
  `;
}
