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
          <img src="https://firebasestorage.googleapis.com/v0/b/philly-wings.firebasestorage.app/o/images%2Fresized%2Fphilly-wings-logo_1920x1080.webp?alt=media&token=d7825b4a-8ea5-4a81-88e0-de452fc6b41c"
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
              <span class="stat-number">24HR</span>
              <span class="stat-label">Minimum Notice</span>
            </div>
          </div>

          <div class="hero-cta">
            <button class="btn-primary btn-large" onclick="scrollToPlanner()">
              🔥 PLAN YOUR EVENT 🔥
            </button>
            <button class="btn-secondary btn-large" onclick="scrollToPackages()" style="margin-top: 12px;">
              Browse All Packages
            </button>
            <p class="hero-note">⚡ Office parties • Game day madness • Corporate events that stand out ⚡<br>
            <em>24-hour minimum notice • Advanced orders get the VIP treatment!</em></p>
          </div>
        </div>
      </div>
    </section>
  `;
}

// Scroll to guided planner section
window.scrollToPlanner = () => {
  const plannerSection = document.querySelector('#catering-planner');
  if (plannerSection) {
    plannerSection.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }
};

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
