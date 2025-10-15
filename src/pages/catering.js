/**
 * Catering Landing Page
 * Marketing showcase for Philly Wings Express catering
 * Orders processed through ezCater
 */

import '../styles/catering.css';
import { renderCateringHero } from '../components/catering/hero.js';
import { renderValueProps } from '../components/catering/value-props.js';
import { renderCateringPackages } from '../components/catering/packages.js';
import { renderSauceSelector } from '../components/catering/sauce-selector.js';

export async function renderCateringPage() {
  const packagesHtml = await renderCateringPackages();

  return `
    <div class="catering-page">
      ${renderCateringHero()}
      ${renderValueProps()}
      ${packagesHtml}
      ${renderSauceSelector()}
      ${renderCateringCTA()}
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
          <a href="tel:+12155551234" class="btn-secondary btn-large">
            Call Us: (215) 555-1234
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
      answer: 'Our boneless wings can accommodate most dietary needs. Contact us directly at (215) 555-1234 to discuss specific allergen concerns. All our nutrition information is available on our website.'
    },
    {
      question: 'What if I need to feed more than 100 people?',
      answer: 'We love large events! Contact us directly at (215) 555-1234 and we\'ll work with you to create a custom package that fits your needs.'
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
        <a href="tel:+12155551234" class="btn-secondary">Call Us: (215) 555-1234</a>
      </div>
    </section>
  `;
}
