/**
 * Catering Hero Component
 * Hero section for catering landing page
 */

export function renderCateringHero() {
  return `
    <section class="catering-hero">
      <div class="hero-background">
        <div class="hero-overlay"></div>
      </div>

      <div class="hero-content">
        <div class="hero-logo">
          <img src="/apple-touch-icon.png"
               alt="Philly Wings Express Logo"
               loading="eager">
        </div>

        <div class="hero-text">
          <h1 class="hero-title">
            <span class="highlight">LEGENDARY</span> Wings<br>
            That Make Your Event <span class="highlight">UNFORGETTABLE</span>
          </h1>
          <p class="hero-subtitle">
            Northeast Philly's Most Outrageous Wing Experience — 14 Mind-Blowing Sauces, Zero Boring Meetings
          </p>

          <div class="hero-stats">
            <div class="stat">
              <span class="stat-number">14</span>
              <span class="stat-label">Insane Sauces</span>
            </div>
            <div class="stat">
              <span class="stat-number">10-100+</span>
              <span class="stat-label">Happy People</span>
            </div>
            <div class="stat">
              <span class="stat-number">2HR</span>
              <span class="stat-label">Minimum Notice</span>
            </div>
          </div>

          <div class="hero-cta">
            <button class="btn-primary btn-large" onclick="scrollToPackages()">
              🔥 FEED THE SQUAD NOW 🔥
            </button>
            <p class="hero-note">⚡ Office parties • Game day madness • Corporate events that stand out ⚡<br>
            <em>2-hour minimum notice • Advanced orders get the VIP treatment!</em></p>
          </div>
        </div>
      </div>
    </section>
  `;
}

// Scroll to packages section
window.scrollToPackages = () => {
  const packagesSection = document.querySelector('#catering-packages');
  if (packagesSection) {
    packagesSection.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }
};
