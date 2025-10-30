/**
 * Catering Landing Page
 * Dual-path experience: Shared Platters vs Individually Boxed Meals
 * Future-ready for direct ordering flow
 */

import '../styles/catering.css';
import '../styles/catering-entry-choice.css';
import '../styles/wing-customization.css'; // SHARD-2
import '../styles/sauce-allocation.css'; // Phase 2: Sauce allocation UI
import '../styles/customize-package.css'; // NEW: Step 5 - Customize Package
import '../styles/shared-photo-cards.css'; // PHASE 0: Shared visual components
import '../styles/shared-platter-entry-choice.css'; // SP-001: Shared Platters V2 Entry Choice
import '../styles/event-details-form.css'; // SP-003: Event Details Form
import '../styles/package-recommendations.css'; // SP-004: Package Recommendations
import '../styles/preview-anchor-screen.css'; // SP-005: Preview Anchor Screen
import '../styles/customization-screen.css'; // SP-006: Split-Screen Customization
import '../styles/wing-distribution-selector.css'; // SP-007: Wing Distribution Selector
import '../styles/sauce-photo-card-selector.css'; // SP-008: Enhanced Sauce Selector
import '../styles/boxed-meals-v2.css';
import '../styles/boxed-meals-animations.css';
import '../styles/smart-questionnaire.css';
import '../styles/recommendation-card.css';
import '../styles/portion-guide.css';
import '../styles/conversational-wing-distribution.css'; // SP-003 Enhancement: Conversational wizard
import '../styles/footer-help.css'; // Footer help section with FAQ link
import { renderCateringHero } from '../components/catering/hero.js';
import { renderEntryChoice, initEntryChoice } from '../components/catering/catering-entry-choice.js';
import { renderBoxedMealsFlow, initBoxedMealsFlow } from '../components/catering/boxed-meals-flow-v2.js';
import { renderSmartQuestionnaire } from '../components/catering/smart-questionnaire.js';
import { renderPortionGuide } from '../components/catering/portion-guide.js';
import { renderEntryChoiceV2, initEntryChoiceV2 } from '../components/catering/shared-platter-entry-choice.js';
import { renderPackageRecommendations, initPackageRecommendations, loadAndRenderRecommendations } from '../components/catering/package-recommendations.js';
import { renderCustomizationScreen, initCustomizationScreen } from '../components/catering/customization-screen.js';

export async function renderCateringPage() {
  // Pre-render boxed meals flow
  const boxedMealsHtml = await renderBoxedMealsFlow();

  // Initialize interactions after DOM is fully ready
  // Use requestAnimationFrame for more reliable DOM readiness
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      initEntryChoice();
      initEntryChoiceV2(); // SP-001: Initialize Shared Platters V2 entry choice
      initBoxedMealsFlow();
      initPackageRecommendations(); // SP-004: Initialize package recommendations
      initCustomizationScreen(); // SP-006: Initialize customization screen

      // SP-003 & SP-004: Listen for navigation events from Event Details Form
      setupNavigationListeners();
    });
  });

  // Setup navigation event listeners
  function setupNavigationListeners() {
    // Navigate to recommendations (from event details form)
    window.addEventListener('navigate-to-recommendations', (event) => {
      console.log('Navigating to recommendations with event details:', event.detail);

      // Hide event details form
      const eventDetailsContainer = document.getElementById('event-details-form-container');
      if (eventDetailsContainer) {
        eventDetailsContainer.style.display = 'none';
      }

      // Show package recommendations
      const recommendationsContainer = document.getElementById('package-recommendations-container');
      if (recommendationsContainer) {
        recommendationsContainer.style.display = 'block';
        recommendationsContainer.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });

        // Load and render recommendations with event details
        loadAndRenderRecommendations();
      } else {
        console.warn('Package recommendations container not found');
      }
    });

    // Navigate back to entry choice
    window.addEventListener('navigate-to-entry-choice', () => {
      console.log('Navigating back to entry choice');

      // Hide event details form
      const eventDetailsContainer = document.getElementById('event-details-form-container');
      if (eventDetailsContainer) {
        eventDetailsContainer.style.display = 'none';
      }

      // Hide recommendations
      const recommendationsContainer = document.getElementById('package-recommendations-container');
      if (recommendationsContainer) {
        recommendationsContainer.style.display = 'none';
      }

      // Show entry choice section
      const entrySection = document.querySelector('.entry-choice-section');
      if (entrySection) {
        entrySection.style.display = 'block';
        entrySection.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  }

  return `
    <div class="catering-page">
      ${renderCateringHero()}

      ${renderEntryChoice()}

      <!-- Shared Platters Flow (Default) -->
      <div id="shared-platters-flow" style="display: block;">
        <!-- SP-001: Shared Platters V2 Entry Choice (Quick Browse vs Guided Planner) -->
        ${renderEntryChoiceV2()}

        <!-- SP-002: Package Gallery (Quick Browse path) -->
        <div id="package-gallery-view" style="display: none;">
          <!-- Package gallery will be rendered here -->
        </div>

        <!-- SP-003: Event Details Form (Guided Planner path) -->
        <div id="event-details-form-container" style="display: none;">
          <!-- Event details form will be rendered here -->
        </div>

        <!-- SP-004: Package Recommendations (Guided Planner path) -->
        ${renderPackageRecommendations()}

        <!-- SP-006: Customization Screen (Convergence point for both flows) -->
        ${renderCustomizationScreen()}
      </div>

      <!-- Boxed Meals Flow (Hidden by default) -->
      <div id="boxed-meals-flow" style="display: none;">
        ${boxedMealsHtml}
      </div>

      <!-- Footer Help Section -->
      ${renderFooterHelp()}

      <!-- Smart Questionnaire Modal -->
      ${renderSmartQuestionnaire()}

      <!-- Portion Guide Modal -->
      ${renderPortionGuide()}
    </div>
  `;
}

function renderCateringCTA() {
  return `
    <section class="catering-final-cta">
      <div class="cta-content">
        <h2>Ready to Feed Your Team the Philly Way?</h2>
        <p class="cta-subtitle">
          Orders processed securely through ezCater with 24/7 customer support.
          24-hour advance notice required.
        </p>

        <div class="cta-buttons">
          <a href="https://www.ezcater.com/brand/pvt/philly-wings-express"
             class="btn-primary btn-large"
             target="_blank"
             rel="noopener noreferrer">
            Order Catering on ezCater →
          </a>
          <a href="tel:+12673763113" class="btn-secondary btn-large">
            Call Us: (267) 376-3113
          </a>
        </div>

        <div class="cta-trust">
          <p>✅ Secure payment through ezCater</p>
          <p>✅ 24/7 customer support</p>
          <p>✅ 500+ offices fed across Philadelphia</p>
        </div>
      </div>
    </section>
  `;
}

function renderFooterHelp() {
  return `
    <section class="catering-footer-help">
      <div class="footer-help-content">
        <h3>Need help with your order?</h3>
        <p class="help-subtitle">We're here to answer your questions</p>
        <div class="help-actions">
          <a href="/catering-faq.html" class="btn-help-link" target="_blank" rel="noopener noreferrer">
            <span class="help-icon">📖</span>
            <span class="help-text">View FAQ</span>
          </a>
          <a href="tel:+12673763113" class="btn-help-link">
            <span class="help-icon">📞</span>
            <span class="help-text">Call Us: (267) 376-3113</span>
          </a>
        </div>
      </div>
    </section>
  `;
}
