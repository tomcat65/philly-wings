/**
 * Catering Entry Choice Component
 * Slab-style toggle for dual-path experience
 * "Shared Platters" vs "Individually Boxed Meals"
 */

export function renderEntryChoice() {
  return `
    <section class="catering-entry-choice">
      <div class="entry-choice-header">
        <h2>How do you want the food served?</h2>
        <p class="entry-choice-subtitle">Choose the style that fits your event</p>
      </div>

      <div class="entry-choice-toggle">
        <button
          class="entry-choice-option active"
          id="shared-platters-choice"
          data-flow-type="party-platters"
          aria-pressed="true">
          <div class="choice-icon">🍗</div>
          <div class="choice-content">
            <h3 class="choice-title">Shared Platters</h3>
            <p class="choice-description">Party-friendly spreads</p>
            <ul class="choice-bullets">
              <li>Perfect for tailgates, celebrations & office parties</li>
              <li>Everyone shares from the same platters</li>
              <li>Customizable sauce selections</li>
            </ul>
          </div>
        </button>

        <button
          class="entry-choice-option"
          id="boxed-meals-choice"
          data-flow-type="boxed-meals"
          aria-pressed="false">
          <div class="choice-icon">📦</div>
          <div class="choice-content">
            <h3 class="choice-title">Individually Boxed Meals</h3>
            <p class="choice-description">On-the-go teams</p>
            <ul class="choice-bullets">
              <li>Ideal for corporate lunches & meetings</li>
              <li>Each person gets their own box</li>
              <li>Minimum 10 boxes per order</li>
            </ul>
          </div>
        </button>
      </div>
    </section>
  `;
}

/**
 * Initialize entry choice interactions
 * Handles flow switching and persistence
 */
export function initEntryChoice() {
  const sharedChoice = document.getElementById('shared-platters-choice');
  const boxedChoice = document.getElementById('boxed-meals-choice');
  const sharedFlow = document.getElementById('shared-platters-flow');
  const boxedFlow = document.getElementById('boxed-meals-flow');

  // Get sticky container for scroll behavior
  const entryChoiceSection = document.querySelector('.catering-entry-choice');

  // Handle scroll persistence
  let lastScrollY = 0;
  const handleScroll = () => {
    const currentScrollY = window.scrollY;

    if (currentScrollY > 300) {
      entryChoiceSection?.classList.add('is-sticky');
    } else {
      entryChoiceSection?.classList.remove('is-sticky');
    }

    lastScrollY = currentScrollY;
  };

  window.addEventListener('scroll', handleScroll, { passive: true });

  /**
   * Switch to Shared Platters flow
   */
  function activateSharedPlatters() {
    // Update button states
    sharedChoice?.classList.add('active');
    sharedChoice?.setAttribute('aria-pressed', 'true');
    boxedChoice?.classList.remove('active');
    boxedChoice?.setAttribute('aria-pressed', 'false');

    // Hide the choice section entirely
    if (entryChoiceSection) {
      entryChoiceSection.style.display = 'none';
    }

    // Show/hide flows
    if (sharedFlow) sharedFlow.style.display = 'block';
    if (boxedFlow) boxedFlow.style.display = 'none';

    // Store preference
    sessionStorage.setItem('cateringFlowType', 'party-platters');

    // Announce to screen readers
    announceFlowChange('Shared Platters');

    // Auto-scroll to content
    setTimeout(() => {
      sharedFlow?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  /**
   * Switch to Boxed Meals flow
   */
  function activateBoxedMeals() {
    // Update button states
    boxedChoice?.classList.add('active');
    boxedChoice?.setAttribute('aria-pressed', 'true');
    sharedChoice?.classList.remove('active');
    sharedChoice?.setAttribute('aria-pressed', 'false');

    // Hide the choice section entirely
    if (entryChoiceSection) {
      entryChoiceSection.style.display = 'none';
    }

    // Show/hide flows
    if (sharedFlow) sharedFlow.style.display = 'none';
    if (boxedFlow) boxedFlow.style.display = 'block';

    // Store preference
    sessionStorage.setItem('cateringFlowType', 'boxed-meals');

    // Announce to screen readers
    announceFlowChange('Individually Boxed Meals');

    // Auto-scroll to content
    setTimeout(() => {
      boxedFlow?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  /**
   * Announce flow change to screen readers
   */
  function announceFlowChange(flowName) {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'sr-only';
    announcement.textContent = `Now showing ${flowName} options`;
    document.body.appendChild(announcement);

    setTimeout(() => {
      announcement.remove();
    }, 1000);
  }

  // Attach event listeners
  sharedChoice?.addEventListener('click', activateSharedPlatters);
  boxedChoice?.addEventListener('click', activateBoxedMeals);

  /**
   * Reset flow to show entry choice (called when navigating from nav)
   */
  function resetToEntryChoice() {
    // Show entry choice section
    if (entryChoiceSection) {
      entryChoiceSection.style.display = 'block';
    }

    // Hide both flows
    if (sharedFlow) sharedFlow.style.display = 'none';
    if (boxedFlow) boxedFlow.style.display = 'none';

    // Reset button states to default (shared platters active)
    sharedChoice?.classList.add('active');
    sharedChoice?.setAttribute('aria-pressed', 'true');
    boxedChoice?.classList.remove('active');
    boxedChoice?.setAttribute('aria-pressed', 'false');

    // Clear session storage
    sessionStorage.removeItem('cateringFlowType');
  }

  // Listen for hash changes to detect nav clicks
  const handleHashChange = () => {
    if (window.location.hash === '#catering-packages') {
      resetToEntryChoice();
    }
  };

  window.addEventListener('hashchange', handleHashChange);

  // Check if we just navigated to #catering-packages
  const isDirectNavigation = window.location.hash === '#catering-packages';

  // Restore previous selection if exists (but NOT if coming from nav)
  const savedFlow = sessionStorage.getItem('cateringFlowType');
  if (savedFlow === 'boxed-meals' && !isDirectNavigation) {
    activateBoxedMeals();
  } else if (savedFlow === 'party-platters' && !isDirectNavigation) {
    activateSharedPlatters();
  }

  // Cleanup function
  return () => {
    window.removeEventListener('scroll', handleScroll);
    window.removeEventListener('hashchange', handleHashChange);
  };
}
