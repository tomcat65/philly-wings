/**
 * Catering Value Propositions Component
 * Shows key differentiators and why customers should choose us
 */

export function renderValueProps() {
  return `
    <section class="value-props-section">
      <div class="section-header">
        <h2>Why Choose Philly Wings Express Catering?</h2>
        <p class="section-subtitle">We're not your average wing spot. We're Philadelphia through and through.</p>
      </div>

      <div class="props-grid">
        <div class="prop-card">
          <div class="prop-icon">🔥</div>
          <h3>14 Signature Sauces</h3>
          <p>
            <strong>More variety than anyone else.</strong> We offer 14 incredible sauces so everyone
            on your team finds their perfect flavor match.
          </p>
          <ul class="prop-list">
            <li>5 Philly-exclusive flavors</li>
            <li>9 Classic crowd-pleasers</li>
            <li>Heat levels 0-5 for all preferences</li>
          </ul>
        </div>

        <div class="prop-card prop-featured">
          <div class="prop-icon">❤️‍🔥</div>
          <h3>Woman-Owned & Philly Authentic</h3>
          <p>
            Born in Oxford Circle, perfected in every kitchen. Our sauce names tell Philly stories -
            Northeast Hot Lemon, Broad & Pattison Burn, Gritty's Revenge.
          </p>
          <ul class="prop-list">
            <li>Woman-owned Northeast Philly business</li>
            <li>Named after real Philly neighborhoods</li>
            <li>Game day specialists (Eagles, Phillies, Sixers, Flyers)</li>
          </ul>
        </div>

        <div class="prop-card">
          <div class="prop-icon">✨</div>
          <h3>Fresh, Never Frozen</h3>
          <p>
            <strong>Double-fried for ultimate crispiness.</strong> All serving supplies included -
            plates, napkins, wet wipes, and sauce labels. Professional setup optional.
          </p>
          <ul class="prop-list">
            <li>Vented packaging keeps wings crispy</li>
            <li>Complete serving supplies included</li>
            <li>Professional setup available upon request</li>
          </ul>
        </div>
      </div>

      <div class="trust-badges">
        <div class="badge">
          <strong>500+</strong>
          <span>Offices Fed</span>
        </div>
        <div class="badge">
          <strong>4.8★</strong>
          <span>Average Rating</span>
        </div>
        <div class="badge">
          <strong>24/7</strong>
          <span>ezCater Support</span>
        </div>
      </div>
    </section>
  `;
}
