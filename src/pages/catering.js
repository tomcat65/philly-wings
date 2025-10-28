/**
 * Catering Landing Page
 * Dual-path experience: Shared Platters vs Individually Boxed Meals
 * Future-ready for direct ordering flow
 */

import '../styles/catering.css';
import '../styles/catering-entry-choice.css';
import '../styles/simple-packages.css';
import '../styles/guided-planner.css';
import '../styles/wing-customization.css'; // SHARD-2
import '../styles/sauce-allocation.css'; // Phase 2: Sauce allocation UI
import '../styles/customize-package.css'; // NEW: Step 5 - Customize Package
import '../styles/shared-photo-cards.css'; // PHASE 0: Shared visual components
import '../styles/shared-platter-entry-choice.css'; // SP-001: Shared Platters V2 Entry Choice
import '../styles/event-details-form.css'; // SP-003: Event Details Form
import '../styles/package-recommendations.css'; // SP-004: Package Recommendations
import '../styles/customization-screen.css'; // SP-006: Split-Screen Customization
import '../styles/wing-distribution-selector.css'; // SP-007: Wing Distribution Selector
import '../styles/boxed-meals-v2.css';
import '../styles/boxed-meals-animations.css';
import '../styles/smart-questionnaire.css';
import '../styles/recommendation-card.css';
import '../styles/portion-guide.css';
import '../styles/conversational-wing-distribution.css'; // SP-003 Enhancement: Conversational wizard
import { renderCateringHero } from '../components/catering/hero.js';
import { renderEntryChoice, initEntryChoice } from '../components/catering/catering-entry-choice.js';
import { renderSimplePackages, initPackageViewSwitching } from '../components/catering/simple-packages.js';
import { renderGuidedPlanner } from '../components/catering/guided-planner.js';
import { renderBoxedMealsFlow, initBoxedMealsFlow } from '../components/catering/boxed-meals-flow-v2.js';
import { renderSmartQuestionnaire } from '../components/catering/smart-questionnaire.js';
import { renderPortionGuide } from '../components/catering/portion-guide.js';
import { renderEntryChoiceV2, initEntryChoiceV2 } from '../components/catering/shared-platter-entry-choice.js';
import { renderPackageRecommendations, initPackageRecommendations, loadAndRenderRecommendations } from '../components/catering/package-recommendations.js';
import { renderCustomizationScreen, initCustomizationScreen } from '../components/catering/customization-screen.js';
import { renderDistributionConfirmation, initDistributionConfirmation } from '../components/catering/distribution-confirmation.js';

export async function renderCateringPage() {
  // Pre-render both flows
  const simplePackagesHtml = await renderSimplePackages();
  const wizardData = await renderGuidedPlanner(); // Returns { html, packages, sauces, addOns }
  const boxedMealsHtml = await renderBoxedMealsFlow();

  // Initialize interactions after DOM is fully ready
  // Use requestAnimationFrame for more reliable DOM readiness
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      initEntryChoice();
      initEntryChoiceV2(); // SP-001: Initialize Shared Platters V2 entry choice
      initPackageViewSwitching(wizardData);
      initBoxedMealsFlow();
      initPackageRecommendations(); // SP-004: Initialize package recommendations
      initCustomizationScreen(); // SP-006: Initialize customization screen
      initDistributionConfirmation(); // SP-003 Enhancement: Initialize confirmation modal

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

        <div id="catering-packages">
          ${simplePackagesHtml}
        </div>
      </div>

      <!-- Boxed Meals Flow (Hidden by default) -->
      <div id="boxed-meals-flow" style="display: none;">
        ${boxedMealsHtml}
      </div>

      ${renderFAQ()}

      <!-- Smart Questionnaire Modal -->
      ${renderSmartQuestionnaire()}

      <!-- Portion Guide Modal -->
      ${renderPortionGuide()}

      <!-- Distribution Confirmation Modal (SP-003 Enhancement) -->
      ${renderDistributionConfirmation()}
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

function renderFAQ() {
  const faqs = [
    {
      question: 'How far in advance do I need to order?',
      answer: 'We require 24 hours advance notice for all catering orders. For orders over 100 people, we recommend 48 hours notice to ensure we can accommodate your event.'
    },
    {
      question: 'What is your delivery area?',
      answer: 'We deliver within a 10-mile radius of our Oxford Circle location. This covers most of NE Philadelphia including Frankford, Tacony, Bridesburg, Port Richmond, Kensington, Mayfair, Holmesburg, Torresdale, Fishtown, Northern Liberties, South Philly, Northern Liberties, Bucks County, Lower Northeast, Germantown, East Falls, Bristol, and surrounding neighborhoods.'
    },
    {
      question: 'How does payment work?',
      answer: 'All orders are processed securely through Stripe. You\'ll complete payment directly on their platform, and they provide 24/7 customer support for any payment questions.'
    },
    {
      question: 'Can I customize sauce selections?',
      answer: 'Absolutely! Each package includes a specific number of sauce selections. You can choose any combination from our 14 signature sauces. We recommend mixing heat levels to accommodate everyone on your team.'
    },
    {
      question: 'What if I need to change my order?',
      answer: 'Contact customer support as soon as possible. Changes can typically be made up to 24 hours before your delivery time.'
    },
    {
      question: 'Do you provide serving supplies?',
      answer: 'Yes! All packages include plates, napkins, wet wipes, and serving utensils. We also label each sauce container so your team knows what they\'re getting.'
    },
    {
      question: 'Can I order for dietary restrictions?',
      answer: 'Our boneless wings can accommodate most dietary needs. Contact us directly at (267) 376-3113 to discuss specific allergen concerns. All our nutrition information is available on our website.'
    },
    {
      question: 'What if I need to feed more than 100 people?',
      answer: 'We love large events! Contact us directly at (267) 376-3113 and we\'ll work with you to create a custom package that fits your needs.'
    }
  ];

  return `
    <section class="catering-faq">
      <div class="section-header">
        <h2>Frequently Asked Questions</h2>
        <p class="section-subtitle">Everything you need to know about catering with us</p>
      </div>

      <div class="faq-grid">
        ${faqs.map((faq, index) => `
          <div class="faq-item">
            <h4 class="faq-question">${faq.question}</h4>
            <p class="faq-answer">${faq.answer}</p>
          </div>
        `).join('')}
      </div>

      <div class="faq-contact">
        <p>Still have questions?</p>
        <a href="tel:+12673763113" class="btn-secondary">Call Us: (267) 376-3113</a>
      </div>
    </section>
  `;
}
