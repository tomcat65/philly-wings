// Philly Wings Express - Customer Acquisition Modal with Game Day Reminders
// Enhanced 3-step modal with live ESPN data integration

class AcquisitionModal {
  constructor() {
    this.currentStep = 1;
    this.userData = {};
    this.hasShown = false;
    this.abTestManager = new ABTestManager();
    this.socialProofManager = new SocialProofManager();
    this.triggers = {
      exitIntent: false,
      timeOnSite: false,
      scrollDepth: false,
      menuViews: false
    };

    this.init();
  }

  init() {
    this.createModalHTML();
    this.setupTriggers();
    this.setupEventListeners();
    this.loadSportsData();
  }

  createModalHTML() {
    const modalHTML = `
      <div id="acquisitionModal" class="acquisition-modal-overlay" style="display: none;">
        <div class="acquisition-modal">
          <button class="modal-close" onclick="acquisitionModal.hide()">&times;</button>

          <!-- Step 1: Email Collection -->
          <div class="modal-step step-1 active">
            <div class="modal-header">
              <h2 class="modal-headline">${this.abTestManager.getVariant('modal_headline')}</h2>
              <span class="social-proof-counter">Join 2,847+ Philly fans</span>
            </div>

            <div class="perks-preview">
              <div class="perk">
                <span class="perk-icon">🎫</span>
                <span class="perk-text">15% off first order</span>
              </div>
              <div class="perk">
                <span class="perk-icon">🔥</span>
                <span class="perk-text">New flavors first</span>
              </div>
              <div class="perk">
                <span class="perk-icon">🏈</span>
                <span class="perk-text">Game day specials</span>
              </div>
            </div>

            <form class="modal-form" id="step1Form">
              <div class="form-group">
                <input type="email" id="userEmail" placeholder="Your email address" required>
                <button type="submit" class="step-button primary">
                  ${this.abTestManager.getVariant('cta_button')}
                </button>
              </div>
              <p class="trust-message">📧 No spam - just deals that slap 🤙</p>
            </form>
          </div>

          <!-- Step 2: Sports Preferences + Phone -->
          <div class="modal-step step-2">
            <div class="modal-header">
              <h2>🏆 Unlock VIP + Game Day Alerts</h2>
              <span class="vip-badge">ARLETH'S PERSONAL UPDATES</span>
            </div>

            <div class="arleth-intro">
              <div class="owner-photo-placeholder">📸</div>
              <p id="arlethMessage">"Hey! It's Arleth, the owner. Want me to personally text you about game days? I send the real inside scoop - not robot messages!" 📱</p>
            </div>

            <form class="modal-form" id="step2Form">
              <div class="form-group">
                <input type="tel" id="userPhone" placeholder="Phone (for VIP game day texts from Arleth)">
              </div>

              <div class="sports-preferences">
                <h4>Which Philly teams do you follow?</h4>
                <div class="team-checkboxes" id="teamCheckboxes">
                  <label class="team-option">
                    <input type="checkbox" value="eagles">
                    <span class="team-info">🦅 Eagles</span>
                    <span class="game-alert"></span>
                  </label>
                  <label class="team-option">
                    <input type="checkbox" value="phillies">
                    <span class="team-info">⚾ Phillies</span>
                    <span class="game-alert"></span>
                  </label>
                  <label class="team-option">
                    <input type="checkbox" value="sixers">
                    <span class="team-info">🏀 76ers</span>
                    <span class="game-alert"></span>
                  </label>
                  <label class="team-option">
                    <input type="checkbox" value="flyers">
                    <span class="team-info">🏒 Flyers</span>
                    <span class="game-alert"></span>
                  </label>
                </div>
              </div>

              <div class="timing-preference">
                <label>When do you want game reminders?</label>
                <select name="reminderTiming" id="reminderTiming">
                  <option value="2h_before">2 hours before (plan ahead)</option>
                  <option value="1h_before">1 hour before (last minute)</option>
                  <option value="halftime">During the game (halftime snacks)</option>
                </select>
              </div>

              <div class="button-group">
                <button type="submit" class="step-button primary">Yes! Arleth, keep me posted! 🚀</button>
                <button type="button" class="step-button secondary" onclick="acquisitionModal.skipToStep3()">Just wings, no sports</button>
              </div>
            </form>
          </div>

          <!-- Step 3: Thank You + Next Steps -->
          <div class="modal-step step-3">
            <div class="success-animation">🎉</div>
            <h2>Welcome to the Family!</h2>

            <div class="next-steps">
              <div class="step">
                <span class="step-number">1</span>
                <span>Check your email for 15% off</span>
              </div>
              <div class="step">
                <span class="step-number">2</span>
                <span>Order your wings on DoorDash/UberEats</span>
              </div>
              <div class="step">
                <span class="step-number">3</span>
                <span>Tag us @phillywingsexpress</span>
              </div>
            </div>

            <button class="step-button primary" onclick="document.getElementById('orderSection').scrollIntoView({behavior: 'smooth'}); acquisitionModal.hide();">
              Order My Wings Now 🔥
            </button>

            <div class="arleth-signature">
              <p>"Can't wait to hook you up with the good stuff!" - Arleth</p>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }

  setupTriggers() {
    // Exit-intent detection
    let exitTimer;
    document.addEventListener('mouseleave', (e) => {
      if (e.clientY <= 0 && !this.hasShown && window.innerWidth > 768) {
        exitTimer = setTimeout(() => {
          this.show('exit_intent');
        }, 500);
      }
    });

    document.addEventListener('mouseenter', () => {
      clearTimeout(exitTimer);
    });

    // Time on site trigger (45 seconds)
    setTimeout(() => {
      this.triggers.timeOnSite = true;
      this.checkTriggerConditions();
    }, 45000);

    // Scroll depth tracking
    let maxScrollDepth = 0;
    window.addEventListener('scroll', () => {
      const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      maxScrollDepth = Math.max(maxScrollDepth, scrollPercent);

      if (maxScrollDepth >= 60 && !this.triggers.scrollDepth) {
        this.triggers.scrollDepth = true;
        this.checkTriggerConditions();
      }
    });

    // Menu navigation tracking
    const menuButtons = document.querySelectorAll('.menu-nav-btn');
    let menuViews = 0;

    menuButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        menuViews++;
        if (menuViews >= 3 && !this.triggers.menuViews) {
          this.triggers.menuViews = true;
          this.checkTriggerConditions();
        }
      });
    });
  }

  checkTriggerConditions() {
    const triggerCount = Object.values(this.triggers).filter(Boolean).length;

    // Show modal when 2+ conditions are met
    if (triggerCount >= 2 && !this.hasShown) {
      this.show('engagement_triggered');
    }
  }

  setupEventListeners() {
    // Step 1 form submission
    document.getElementById('step1Form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleStep1();
    });

    // Step 2 form submission
    document.getElementById('step2Form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleStep2();
    });

    // Close modal on overlay click
    document.getElementById('acquisitionModal').addEventListener('click', (e) => {
      if (e.target.classList.contains('acquisition-modal-overlay')) {
        this.hide();
      }
    });
  }

  async loadSportsData() {
    try {
      // Use existing phillyGames endpoint
      const response = await fetch('/philly-wings/us-central1/phillyGames');
      const data = await response.json();

      this.sportsData = data;
      this.updateTeamCheckboxes(data.games);
      this.updateArlethMessage(data.games);
    } catch (error) {
      console.error('Error loading sports data:', error);
      // Graceful fallback - modal still works without sports data
    }
  }

  updateTeamCheckboxes(games) {
    if (!games || games.length === 0) return;

    const upcomingGames = games.filter(game =>
      new Date(game.gameTime) <= new Date(Date.now() + 24 * 60 * 60 * 1000)
    );

    upcomingGames.forEach(game => {
      const teamValue = game.team?.toLowerCase();
      const checkbox = document.querySelector(`input[value="${teamValue}"]`);
      if (checkbox) {
        const gameAlert = checkbox.parentElement.querySelector('.game-alert');
        gameAlert.innerHTML = '🔥 Playing today!';
        checkbox.parentElement.classList.add('playing-soon');
      }
    });
  }

  updateArlethMessage(games) {
    if (!games || games.length === 0) return;

    const nextGame = games.find(game => new Date(game.gameTime) > new Date());
    if (nextGame) {
      const timeToGame = this.formatRelativeTime(nextGame.gameTime);
      const message = `"Hey! It's Arleth. Big ${nextGame.team} game ${timeToGame} - want me to personally remind you about game day wing specials?" 📱`;

      const messageElement = document.getElementById('arlethMessage');
      if (messageElement) {
        messageElement.innerHTML = message;
      }
    }
  }

  formatRelativeTime(gameTime) {
    const now = new Date();
    const game = new Date(gameTime);
    const diffHours = Math.round((game - now) / (1000 * 60 * 60));

    if (diffHours < 24) {
      return diffHours <= 1 ? 'starting soon' : `in ${diffHours} hours`;
    } else {
      const diffDays = Math.round(diffHours / 24);
      return diffDays === 1 ? 'tomorrow' : `in ${diffDays} days`;
    }
  }

  show(trigger = 'manual') {
    if (this.hasShown) return;

    this.hasShown = true;
    const modal = document.getElementById('acquisitionModal');
    modal.style.display = 'flex';

    // Track modal show event
    this.trackEvent('acquisition_modal_shown', {
      trigger_type: trigger,
      ab_headline: this.abTestManager.getVariant('modal_headline'),
      ab_cta: this.abTestManager.getVariant('cta_button')
    });

    // Update social proof counter
    this.socialProofManager.updateCounters();
  }

  hide() {
    const modal = document.getElementById('acquisitionModal');
    modal.style.display = 'none';
  }

  nextStep() {
    const currentStepEl = document.querySelector('.modal-step.active');
    const nextStepEl = document.querySelector(`.modal-step.step-${this.currentStep + 1}`);

    if (currentStepEl) currentStepEl.classList.remove('active');
    if (nextStepEl) nextStepEl.classList.add('active');

    this.currentStep++;
  }

  async handleStep1() {
    const email = document.getElementById('userEmail').value.trim();

    if (!this.validateEmail(email)) {
      this.showError('Please enter a valid email address');
      return;
    }

    this.userData.email = email;
    this.userData.step1CompletedAt = new Date();

    this.trackEvent('acquisition_step_completed', {
      step_number: 1,
      email_provided: true
    });

    this.nextStep();
  }

  async handleStep2() {
    const phone = document.getElementById('userPhone').value.trim();
    const selectedTeams = Array.from(document.querySelectorAll('input[type="checkbox"]:checked'))
      .map(cb => cb.value);
    const reminderTiming = document.getElementById('reminderTiming').value;

    this.userData.phoneNumber = phone;
    this.userData.selectedTeams = selectedTeams;
    this.userData.reminderTiming = reminderTiming;
    this.userData.step2CompletedAt = new Date();

    this.trackEvent('acquisition_step_completed', {
      step_number: 2,
      phone_provided: !!phone,
      teams_selected: selectedTeams.length,
      teams_list: selectedTeams.join(',')
    });

    await this.submitSubscription();
    this.nextStep();
  }

  skipToStep3() {
    this.userData.skippedSports = true;
    this.submitSubscription();
    this.nextStep();
  }

  async submitSubscription() {
    try {
      const subscriberData = {
        email: this.userData.email,
        phoneNumber: this.userData.phoneNumber || null,
        source: 'website_modal',
        subscribedAt: new Date(),
        status: 'active',

        sportsPreferences: {
          eagles: this.userData.selectedTeams?.includes('eagles') || false,
          phillies: this.userData.selectedTeams?.includes('phillies') || false,
          sixers: this.userData.selectedTeams?.includes('sixers') || false,
          flyers: this.userData.selectedTeams?.includes('flyers') || false,
          gameReminders: this.userData.selectedTeams?.length > 0 || false,
          preferredTiming: this.userData.reminderTiming || '2h_before'
        },

        customerContext: {
          signupDevice: window.innerWidth <= 768 ? 'mobile' : 'desktop',
          signupTime: new Date().toISOString(),
          pageViews: this.getPageViews(),
          timeOnSite: Math.round((Date.now() - this.getSessionStart()) / 1000),
          scrollDepth: this.getMaxScrollDepth(),
          abTestVariants: this.abTestManager.userVariants
        },

        preferences: {
          gameDay: true,
          newFlavors: true,
          textAlerts: !!this.userData.phoneNumber,
          weeklyDeals: true
        }
      };

      // Save to Firebase
      await window.FirebaseService.create('emailSubscribers', subscriberData);

      this.trackEvent('acquisition_complete', {
        session_id: this.getSessionId(),
        total_time: Date.now() - this.getSessionStart(),
        phone_provided: !!this.userData.phoneNumber,
        teams_selected: this.userData.selectedTeams?.length || 0,
        skipped_sports: this.userData.skippedSports || false
      });

    } catch (error) {
      console.error('Error saving subscription:', error);
      this.showError('Something went wrong. Please try again.');
    }
  }

  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  showError(message) {
    // Simple error display - could be enhanced
    alert(message);
  }

  trackEvent(eventName, parameters) {
    if (typeof gtag !== 'undefined') {
      gtag('event', eventName, {
        event_category: 'Customer Acquisition',
        ...parameters
      });
    }
  }

  // Utility methods
  getSessionId() {
    return sessionStorage.getItem('sessionId') || 'session_' + Date.now();
  }

  getSessionStart() {
    return parseInt(sessionStorage.getItem('sessionStart')) || Date.now();
  }

  getPageViews() {
    return parseInt(sessionStorage.getItem('pageViews')) || 1;
  }

  getMaxScrollDepth() {
    return parseInt(sessionStorage.getItem('maxScrollDepth')) || 0;
  }
}

// A/B Testing Manager
class ABTestManager {
  constructor() {
    this.tests = {
      modal_headline: {
        variants: [
          "🔥 Join the Philly Wings VIP Club",
          "🏈 Get Game Day Specials",
          "🍗 Exclusive Wing Deals Await"
        ],
        weights: [40, 30, 30]
      },
      cta_button: {
        variants: [
          "Count Me In! →",
          "Get My Deals 🔥",
          "I'm Ready for Wings!"
        ],
        weights: [50, 25, 25]
      }
    };

    this.userVariants = this.getUserVariants();
  }

  getUserVariants() {
    const stored = localStorage.getItem('philly_ab_tests');
    if (stored) return JSON.parse(stored);

    const variants = {};
    Object.keys(this.tests).forEach(testName => {
      variants[testName] = this.selectVariant(this.tests[testName]);
    });

    localStorage.setItem('philly_ab_tests', JSON.stringify(variants));
    return variants;
  }

  selectVariant(test) {
    const random = Math.random() * 100;
    let cumulative = 0;

    for (let i = 0; i < test.variants.length; i++) {
      cumulative += test.weights[i];
      if (random <= cumulative) {
        return { index: i, variant: test.variants[i] };
      }
    }

    return { index: 0, variant: test.variants[0] };
  }

  getVariant(testName) {
    return this.userVariants[testName]?.variant || this.tests[testName].variants[0];
  }
}

// Social Proof Manager
class SocialProofManager {
  constructor() {
    this.baseCount = 2847;
    this.init();
  }

  init() {
    this.updateCounters();
    setInterval(() => this.updateCounters(), 300000); // Every 5 minutes
  }

  updateCounters() {
    const now = new Date();
    const hour = now.getHours();

    if (hour >= 11 && hour <= 20) { // Business hours
      const increment = Math.floor(Math.random() * 3) + 1;
      this.baseCount += increment;

      const counters = document.querySelectorAll('.social-proof-counter');
      counters.forEach(counter => {
        counter.textContent = `Join ${this.baseCount.toLocaleString()}+ Philly fans`;
      });
    }
  }
}

// Export the class for import usage
export { AcquisitionModal };

// Initialize global modal instance
window.acquisitionModal = new AcquisitionModal();