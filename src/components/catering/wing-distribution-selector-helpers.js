/**
 * TIER 2 & 3: Helper functions for enhanced slider UX
 * Mobile buttons, tooltip updates, animations, and screen reader support
 */

/**
 * TIER 2: Initialize mobile +/- buttons with long-press support
 */
export function initSliderButtons(traditionalCount, plantBasedCount) {
  const buttons = document.querySelectorAll('[data-adjust]');

  buttons.forEach(button => {
    const adjustValue = parseInt(button.dataset.adjust);
    let interval;
    let timeout;

    const adjust = () => {
      const slider = document.getElementById('traditional-boneless-slider');
      if (!slider) return;

      const currentValue = parseInt(slider.value);
      const newValue = Math.max(
        0,
        Math.min(traditionalCount, currentValue + adjustValue)
      );

      slider.value = newValue;
      slider.dispatchEvent(new Event('input'));

      // TIER 2: Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(5);
      }
    };

    // Single tap
    button.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      adjust();

      // Start continuous adjustment after 500ms (long press)
      timeout = setTimeout(() => {
        interval = setInterval(adjust, 150);
      }, 500);
    });

    // Stop continuous adjustment
    const stopAdjusting = () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };

    button.addEventListener('pointerup', stopAdjusting);
    button.addEventListener('pointerleave', stopAdjusting);
    button.addEventListener('pointercancel', stopAdjusting);
  });
}

/**
 * TIER 3: Update tooltip value during drag
 */
export function updateSliderTooltip(bonelessCount) {
  const tooltip = document.getElementById('slider-tooltip');
  if (tooltip) {
    tooltip.textContent = `${bonelessCount} boneless`;
  }
}

/**
 * TIER 3: Update UI only (no state changes) for immediate feedback
 */
export function updateSliderUIOnly(bonelessCount, traditionalCount) {
  const boneInCount = traditionalCount - bonelessCount;

  // Update value displays with animation
  const bonelessDisplay = document.getElementById('traditional-boneless-count');
  const boneInDisplay = document.getElementById('traditional-bonein-count');
  const bonelessPercent = document.getElementById('boneless-percent');
  const boneInPercent = document.getElementById('bonein-percent');

  if (bonelessDisplay) {
    animateValueChange(bonelessDisplay);
    bonelessDisplay.textContent = bonelessCount;
  }

  if (boneInDisplay) {
    animateValueChange(boneInDisplay);
    boneInDisplay.textContent = boneInCount;
  }

  if (bonelessPercent) {
    bonelessPercent.textContent = `${Math.round((bonelessCount / traditionalCount) * 100)}%`;
  }

  if (boneInPercent) {
    boneInPercent.textContent = `${Math.round((boneInCount / traditionalCount) * 100)}%`;
  }

  // Update screen reader live region
  updateScreenReaderAnnouncement(bonelessCount, boneInCount);
}

/**
 * TIER 3: Animate value changes with pulse effect
 */
function animateValueChange(element) {
  element.classList.add('updating');
  setTimeout(() => element.classList.remove('updating'), 300);
}

/**
 * TIER 3: Update screen reader live region for accessibility
 */
function updateScreenReaderAnnouncement(bonelessCount, boneInCount) {
  const liveRegion = document.getElementById('slider-live-region');
  if (liveRegion) {
    liveRegion.textContent = `${bonelessCount} boneless, ${boneInCount} bone-in`;
  }
}
