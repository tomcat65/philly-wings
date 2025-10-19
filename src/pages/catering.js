/**
 * Catering Landing Page
 * Dual-path experience: Shared Platters vs Individually Boxed Meals
 * Future-ready for direct ordering flow
 */

import '../styles/catering.css';
import '../styles/catering-entry-choice.css';
import '../styles/simple-packages.css';
import '../styles/guided-planner.css';
import '../styles/boxed-meals-v2.css';
import '../styles/boxed-meals-animations.css';
import { renderCateringHero } from '../components/catering/hero.js';
import { renderValueProps } from '../components/catering/value-props.js';
import { renderEntryChoice, initEntryChoice } from '../components/catering/catering-entry-choice.js';
import { renderSimplePackages, initPackageViewSwitching } from '../components/catering/simple-packages.js';
import { renderGuidedPlanner } from '../components/catering/guided-planner.js';
import { renderBoxedMealsFlow, initBoxedMealsFlow } from '../components/catering/boxed-meals-flow-v2.js';

export async function renderCateringPage() {
  // Pre-render both flows
  const simplePackagesHtml = await renderSimplePackages();
  const wizardHtml = await renderGuidedPlanner();
  const boxedMealsHtml = await renderBoxedMealsFlow();

  // Initialize interactions after render
  setTimeout(() => {
    initEntryChoice();
    initPackageViewSwitching(wizardHtml);
    initBoxedMealsFlow();
  }, 100);

  return `
    <div class="catering-page">
      ${renderCateringHero()}
      ${renderValueProps()}

      ${renderEntryChoice()}

      <!-- Shared Platters Flow (Default) -->
      <div id="shared-platters-flow" style="display: block;">
        <div id="catering-packages">
          ${simplePackagesHtml}
        </div>
      </div>

      <!-- Boxed Meals Flow (Hidden by default) -->
      <div id="boxed-meals-flow" style="display: none;">
        ${boxedMealsHtml}
      </div>

      ${renderFAQ()}
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
      answer: 'We deliver within a 10-mile radius of our Oxford Circle location. This covers most of Philadelphia including Center City, University City, and surrounding neighborhoods.'
    },
    {
      question: 'How does payment work?',
      answer: 'All orders are processed securely through ezCater. You\'ll complete payment directly on their platform, and they provide 24/7 customer support for any payment questions.'
    },
    {
      question: 'Can I customize sauce selections?',
      answer: 'Absolutely! Each package includes a specific number of sauce selections. You can choose any combination from our 14 signature sauces. We recommend mixing heat levels to accommodate everyone on your team.'
    },
    {
      question: 'What if I need to change my order?',
      answer: 'Contact ezCater customer support as soon as possible. Changes can typically be made up to 24 hours before your delivery time.'
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
