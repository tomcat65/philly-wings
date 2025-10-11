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
    this.updateProgress();
    this.loadSportsData();
  }

  createModalHTML() {
    const modalHTML = `
      <div id="acquisitionModal" class="acquisition-modal-overlay" style="display: none;">
        <div class="acquisition-modal">
          <button class="modal-close" onclick="acquisitionModal.hide()">&times;</button>

          <div class="modal-progress">
            <div class="progress-track"><span class="progress-bar"></span></div>
            <div class="step-indicators">
              <span class="step-indicator active">1</span>
              <span class="step-indicator">2</span>
              <span class="step-indicator">3</span>
            </div>
          </div>

          <!-- Step 1: Email Collection -->
          <div class="modal-step step-1 active" data-step="1">
            <div class="modal-hero">
              <span class="hero-badge">PHILLY VIP CREW</span>
              <h2 class="modal-headline">🔥 GAME DAY ALERTS DIRECT FROM ARLETH</h2>
              <p class="modal-subtitle">Get the text the Bird Gang gets—exclusive drops, free delivery nights, and the sauce lineup before kickoff.</p>
            </div>

            <div class="perk-grid">
              <div class="perk-card">
                <div class="perk-icon">🎯</div>
                <div class="perk-copy">
                  <strong>15% OFF TONIGHT</strong>
                  <span>Your first order hits instantly.</span>
                </div>
              </div>
              <div class="perk-card">
                <div class="perk-icon">🔥</div>
                <div class="perk-copy">
                  <strong>Flavor Drops First</strong>
                  <span>Be first on new sauces + limited runs.</span>
                </div>
              </div>
              <div class="perk-card">
                <div class="perk-icon">🏈</div>
                <div class="perk-copy">
                  <strong>Game Day Reminders</strong>
                  <span>Texts when Philly squads take the field.</span>
                </div>
              </div>
            </div>

            <form class="modal-form" id="step1Form">
              <div class="form-group">
                <label for="userName">Who am I hooking up?</label>
                <input type="text" id="userName" placeholder="Jess from Oxford Circle" maxlength="80" required>
              </div>
              <div class="form-group">
                <label for="userEmail">Drop your email to join the crew</label>
                <input type="email" id="userEmail" placeholder="you@example.com" required>
              </div>
              <button type="submit" class="step-button primary">Text me the game day deals →</button>
              <p class="cta-microcopy">Arleth texts 1-2× per week. No bots, no spam. Opt out whenever.</p>
            </form>
          </div>

          <!-- Step 2: Sports Preferences + Phone -->
          <div class="modal-step step-2" data-step="2">
            <div class="modal-hero">
              <span class="hero-badge">HYPED FOR PHILLY SPORTS</span>
              <h2 class="modal-headline">WHO SHOULD I REMIND YOU ABOUT?</h2>
              <p class="modal-subtitle" id="arlethMessage">"Hey—it's Arleth. Big game this week. Want me to personally hit you with the specials before kickoff?"</p>
            </div>

            <form class="modal-form" id="step2Form">
              <div class="form-group">
                <label for="userPhone">Phone number (optional)</label>
                <input type="tel" id="userPhone" placeholder="(267) 555-0199">
              </div>

              <!-- TCPA-Compliant SMS Opt-In Checkbox -->
              <div class="sms-consent-section">
                <label class="sms-consent-label">
                  <input type="checkbox" id="smsConsent" value="1">
                  <span class="consent-text">
                    <strong>Yes, I want to receive SMS updates from Philly Wings Express.</strong>
                  </span>
                </label>
                <p class="sms-disclosure">
                  By checking this box, you agree to receive text messages including game day reminders, special offers, and order notifications. Message frequency varies (typically 2-4 messages per month). Reply <strong>STOP</strong> to opt-out anytime. Reply <strong>HELP</strong> for assistance. Standard message and data rates may apply. Your mobile information will not be sold or shared with third parties for promotional purposes.
                </p>
              </div>

              <div class="sports-preferences">
                <h4>Pick your Philly squads (optional):</h4>
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
                <label for="reminderTiming">When should I ping you?</label>
                <select name="reminderTiming" id="reminderTiming">
                  <option value="2h_before">2 hours pre-game (prep time)</option>
                  <option value="1h_before">1 hour pre-game (last call)</option>
                  <option value="halftime">Halftime (snack attack)</option>
                </select>
              </div>

              <div class="button-group">
                <button type="submit" class="step-button primary">Lock in my Philly alerts 🚀</button>
                <button type="button" class="step-button secondary" onclick="acquisitionModal.skipToStep3()">I'll take the deals without sports</button>
              </div>
            </form>
          </div>

          <!-- Step 3: Thank You + Next Steps -->
          <div class="modal-step step-3" data-step="3">
            <div class="success-animation">🎉</div>
            <h2 class="modal-headline">YOU’RE ON THE LIST!</h2>
            <p class="modal-subtitle">Watch for Arleth’s texts—she’ll hit you with the inside scoop before the rest of Philly hears it.</p>

            <div class="next-steps">
              <div class="step">
                <span class="step-number">1</span>
                <span>Check your email for the 15% welcome code.</span>
              </div>
              <div class="step">
                <span class="step-number">2</span>
                <span>Save Arleth’s number so you don’t miss the game day blast.</span>
              </div>
              <div class="step">
                <span class="step-number">3</span>
                <span>Craving already? Jump to the ordering section below.</span>
              </div>
            </div>

            <div class="modal-testimonial">
              <p class="quote">“Arleth’s reminder hit 90 minutes before kickoff—free delivery, extra sauce. Wings were waiting when Hurts took the field.”</p>
              <span class="author">— Jared R., South Philly</span>
            </div>

            <button class="step-button primary" onclick="document.getElementById('orderSection').scrollIntoView({behavior: 'smooth'}); acquisitionModal.hide();">
              Take me to the wings →
            </button>

            <div class="arleth-signature">
              <p>“Appreciate you rolling with us—see you on game day!” – Arleth</p>
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
    // VIP Access Button trigger
    const vipButton = document.getElementById('vipAccessTrigger');
    if (vipButton) {
      vipButton.addEventListener('click', (e) => {
        e.preventDefault();
        this.show('vip_button_click');
      });
    }

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
      // Use hosting rewrite route for emulator, direct function for production
      const isLocal = window.location.hostname === 'localhost' ||
                     window.location.hostname === '127.0.0.1' ||
                     window.location.port === '5003';
      const apiUrl = isLocal
        ? '/api/phillygames'  // Use hosting rewrite
        : 'https://us-central1-philly-wings.cloudfunctions.net/phillyGames';

      console.log('Environment detection:', {
        hostname: window.location.hostname,
        port: window.location.port,
        isLocal,
        apiUrl
      });

      const response = await fetch(apiUrl);
      const data = await response.json();

      this.sportsData = data;
      this.updateTeamCheckboxes(data.games);
      this.updateArlethMessage(data.games);
    } catch (error) {
      console.warn('Sports data unavailable - using fallback mode:', error.message);
      // Graceful fallback - show generic sports options
      this.createFallbackSportsData();
    }
  }

  createFallbackSportsData() {
    // Fallback sports data when API unavailable
    this.sportsData = {
      games: [
        { teamKey: 'nfl', sport: 'Eagles', icon: '🦅' },
        { teamKey: 'nba', sport: '76ers', icon: '🏀' },
        { teamKey: 'mlb', sport: 'Phillies', icon: '⚾' },
        { teamKey: 'nhl', sport: 'Flyers', icon: '🏒' }
      ]
    };
    this.updateTeamCheckboxes(this.sportsData.games);
    this.updateArlethMessage(this.sportsData.games);
  }

  updateTeamCheckboxes(games) {
    if (!games || games.length === 0) return;

    // Map API sport names to checkbox values
    const teamMapping = {
      'Eagles': 'eagles',
      '76ers': 'sixers',
      'Phillies': 'phillies',
      'Flyers': 'flyers'
    };

    const upcomingGames = games.filter(game =>
      new Date(game.gameTime) <= new Date(Date.now() + 24 * 60 * 60 * 1000)
    );

    upcomingGames.forEach(game => {
      const teamValue = teamMapping[game.sport] || game.teamKey;
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
      const message = `"Hey! It's Arleth. Big ${nextGame.sport} game ${timeToGame} - want me to personally remind you about game day wing specials?" 📱`;

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
    const modalContent = modal.querySelector('.acquisition-modal');
    if (modalContent) {
      modalContent.classList.remove('is-hiding');
    }

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
    if (!modal) return;
    const modalContent = modal.querySelector('.acquisition-modal');
    if (modalContent) {
      modalContent.classList.add('is-hiding');
    }
    modal.style.display = 'none';
  }

  nextStep() {
    const steps = Array.from(document.querySelectorAll('.modal-step'));
    if (!steps.length) return;

    const nextIndex = this.currentStep; // zero-based progression
    if (nextIndex >= steps.length) {
      // already on the final step; keep it visible
      this.currentStep = steps.length;
      this.updateProgress();
      return;
    }

    const currentStepEl = document.querySelector('.modal-step.active');
    const nextStepEl = document.querySelector(`.modal-step.step-${nextIndex + 1}`);

    if (currentStepEl) currentStepEl.classList.remove('active');
    if (nextStepEl) nextStepEl.classList.add('active');

    this.currentStep = Math.min(steps.length, this.currentStep + 1);
    this.updateProgress();
  }

  async handleStep1() {
    const nameInput = document.getElementById('userName');
    const name = nameInput ? nameInput.value.trim() : '';
    const email = document.getElementById('userEmail').value.trim();

    if (!name) {
      this.showError('Let me know who I’m texting—drop your name.');
      return;
    }

    if (!this.validateEmail(email)) {
      this.showError('Please enter a valid email address');
      return;
    }

    const submitBtn = document.querySelector('#step1Form .step-button.primary');
    if (submitBtn) submitBtn.disabled = true;

    this.userData.name = name;
    this.userData.email = email;
    this.userData.step1CompletedAt = new Date();

    this.trackEvent('acquisition_step_completed', {
      step_number: 1,
      email_provided: true,
      name_provided: true
    });

    this.nextStep();

    if (submitBtn) submitBtn.disabled = false;
  }

  async handleStep2() {
    const submitBtn = document.querySelector('#step2Form .step-button.primary');
    if (submitBtn) submitBtn.disabled = true;

    const phone = document.getElementById('userPhone').value.trim();
    const smsConsent = document.getElementById('smsConsent').checked;
    const selectedTeams = Array.from(document.querySelectorAll('.team-checkboxes input[type="checkbox"]:checked'))
      .map(cb => cb.value);
    const reminderTiming = document.getElementById('reminderTiming').value;

    // Validate: if phone provided, SMS consent must be checked
    if (phone && !smsConsent) {
      this.showError('To receive SMS updates, please check the consent box above.');
      if (submitBtn) submitBtn.disabled = false;
      return;
    }

    // Only store phone if SMS consent given
    this.userData.phoneNumber = smsConsent && phone ? phone : null;
    this.userData.smsConsent = smsConsent;
    this.userData.smsConsentTimestamp = smsConsent ? new Date() : null;
    this.userData.selectedTeams = selectedTeams;
    this.userData.reminderTiming = reminderTiming;
    this.userData.step2CompletedAt = new Date();

    this.trackEvent('acquisition_step_completed', {
      step_number: 2,
      phone_provided: !!phone,
      sms_consent_given: smsConsent,
      teams_selected: selectedTeams.length,
      teams_list: selectedTeams.join(',')
    });

    const success = await this.submitSubscription();
    if (success) {
      this.nextStep();
    } else {
      this.updateProgress();
    }

    if (submitBtn) submitBtn.disabled = false;
  }

  async skipToStep3() {
    this.userData.skippedSports = true;
    const submitBtn = document.querySelector('#step2Form .step-button.primary');
    if (submitBtn) submitBtn.disabled = true;
    const success = await this.submitSubscription();
    if (success) {
      this.nextStep();
    } else {
      this.updateProgress();
    }
    if (submitBtn) submitBtn.disabled = false;
  }

  updateProgress() {
    const indicators = Array.from(document.querySelectorAll('.step-indicator'));
    if (!indicators.length) return;

    indicators.forEach((indicator, index) => {
      indicator.classList.remove('active', 'completed');
      if (index + 1 < this.currentStep) {
        indicator.classList.add('completed');
      } else if (index + 1 === this.currentStep) {
        indicator.classList.add('active');
      }
    });

    const progressBar = document.querySelector('.progress-bar');
    if (progressBar && indicators.length > 1) {
      const progress = Math.max(0, Math.min(1, (this.currentStep - 1) / (indicators.length - 1)));
      progressBar.style.width = `${progress * 100}%`;
    }
  }

  async submitSubscription() {
    // Define subscriberData outside try block to fix scope issue
    const subscriberData = {
      email: this.userData.email,
      name: this.userData.name || null,
      phone: this.userData.phoneNumber || null,  // Field name expected by createSubscriber
      phoneNumber: this.userData.phoneNumber || null,
      source: 'website_modal',
      subscribedAt: new Date(),
      status: 'active',

      // TCPA Compliance Fields
      smsConsent: this.userData.smsConsent || false,
      smsConsentTimestamp: this.userData.smsConsentTimestamp || null,
      smsConsentMethod: 'website_checkbox',
      smsConsentIPAddress: null, // Could be added if needed

      // Array field expected by createSubscriber function
      sportTeams: this.userData.selectedTeams || [],
      selectedTeams: this.userData.selectedTeams || [],  // Keep for fallback

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
        textAlerts: this.userData.smsConsent && !!this.userData.phoneNumber,
        weeklyDeals: true
      }
    };

    try {

      // Save using enhanced createSubscriber function
      const isLocal = window.location.hostname === 'localhost' ||
                     window.location.hostname === '127.0.0.1' ||
                     window.location.port === '5003';
      const baseUrl = isLocal
        ? 'http://127.0.0.1:5002'
        : 'https://us-central1-philly-wings.cloudfunctions.net';

      console.log('Subscriber save - environment detection:', {
        hostname: window.location.hostname,
        port: window.location.port,
        isLocal,
        baseUrl
      });

      const response = await fetch(`${baseUrl}/createSubscriber`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data: subscriberData })
      });

      const result = await response.json();
      if (!result.result?.success) {
        throw new Error(result.error || 'Failed to create subscriber');
      }

      // Store subscriber info for analytics
      this.subscriberInfo = result.result;

      this.trackEvent('acquisition_complete', {
        session_id: this.getSessionId(),
        total_time: Date.now() - this.getSessionStart(),
        phone_provided: !!this.userData.phoneNumber,
        teams_selected: this.userData.selectedTeams?.length || 0,
        skipped_sports: this.userData.skippedSports || false
      });

      return true;

    } catch (error) {
      console.warn('Enhanced subscriber creation failed, trying basic save:', error.message);

      try {
        // Fallback to basic Firebase creation
        await window.FirebaseService.create('emailSubscribers', {
          email: subscriberData.email,
          name: subscriberData.name,
          subscribedAt: new Date(),
          source: subscriberData.source,
          interests: subscriberData.interests,
          sportTeams: subscriberData.selectedTeams,
          tags: ['newsletter', 'perks', 'fallback']
        });

        console.log('Subscriber saved with basic method');
        return true;
      } catch (fallbackError) {
        console.error('Both enhanced and basic subscription failed:', fallbackError);
        this.showError('Something went wrong. Please try again.');
        return false;
      }
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

// Initialize global modal instance when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.acquisitionModal = new AcquisitionModal();
  });
} else {
  window.acquisitionModal = new AcquisitionModal();
}
