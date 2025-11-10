/**
 * Recommendation Card Component
 * Displays recommended packages with match scores and reasons
 */

/**
 * Render a single recommendation card
 * @param {object} pkg - Package data with matchScore and matchReasons
 * @param {number} index - Card index for staggered animation
 * @returns {string} HTML string
 */
export function renderRecommendationCard(pkg, index = 0) {
  const animationDelay = index * 100; // Stagger animations

  // Determine badge text based on match score
  let badgeText = '';
  let badgeClass = '';

  if (pkg.matchScore >= 85) {
    badgeText = '⭐ PERFECT MATCH';
    badgeClass = 'badge-perfect';
  } else if (pkg.matchScore >= 70) {
    badgeText = '✨ HIGHLY RECOMMENDED';
    badgeClass = 'badge-high';
  } else if (pkg.matchScore >= 50) {
    badgeText = '👍 RECOMMENDED';
    badgeClass = 'badge-good';
  }

  // Format price
  const formattedPrice = `$${pkg.basePrice.toFixed(2)}`;
  const pricePerPerson = (pkg.basePrice / ((pkg.servesMin + pkg.servesMax) / 2)).toFixed(2);

  // Get package image URL (fallback to placeholder)
  const imageUrl = pkg.imageUrl || '/images/packages/placeholder.jpg';

  return `
    <div class="recommendation-card" style="animation-delay: ${animationDelay}ms" data-package-id="${pkg.id}">
      ${badgeText ? `
        <div class="recommendation-badge ${badgeClass}">
          ${badgeText}
        </div>
      ` : ''}

      <div class="recommendation-image">
        <img src="${imageUrl}" alt="${pkg.name}" loading="lazy" />
      </div>

      <div class="recommendation-content">
        <h3 class="recommendation-title">${pkg.name}</h3>

        <div class="recommendation-meta">
          <span class="meta-serves">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 8a3 3 0 100-6 3 3 0 000 6zm0 1c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
            Serves ${pkg.servesMin}-${pkg.servesMax}
          </span>
          <span class="meta-price">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8.5 1a.5.5 0 01.5.5v1.293l3.146 3.147a.5.5 0 01-.708.708L8.5 3.707V13.5a.5.5 0 01-1 0V3.707L4.354 6.854a.5.5 0 11-.708-.708L7.793 2H6.5a.5.5 0 010-1h2z"/>
            </svg>
            Starting at ${formattedPrice}
          </span>
        </div>

        <div class="recommendation-pricing">
          <span class="price-per-person">${pricePerPerson}/person</span>
        </div>

        ${pkg.matchReasons && pkg.matchReasons.length > 0 ? `
          <div class="recommendation-reasons">
            <p class="reasons-title">Why we recommend this:</p>
            <ul class="reasons-list">
              ${pkg.matchReasons.map(reason => `
                <li class="reason-item">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="7" fill="#10b981" fill-opacity="0.1"/>
                    <path d="M5 8l2 2 4-4" stroke="#10b981" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                  <span>${reason}</span>
                </li>
              `).join('')}
            </ul>
          </div>
        ` : ''}

        <button class="recommendation-cta" onclick="selectRecommendedPackage('${pkg.id}')">
          Customize This Package
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M7 4l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
    </div>
  `;
}

/**
 * Render recommendation results section
 * @param {array} packages - Array of recommended packages with match scores
 * @param {object} filters - Applied filters for summary
 * @returns {string} HTML string
 */
export function renderRecommendationResults(packages, filters) {
  if (!packages || packages.length === 0) {
    return renderNoResults(filters);
  }

  // Import formatFilterSummary dynamically
  const filterSummary = formatFilterSummaryForDisplay(filters);

  return `
    <div class="recommendation-results">
      <div class="results-header">
        <h2 class="results-title">Your Personalized Recommendations</h2>
        <p class="results-subtitle">
          Based on: <strong>${filterSummary}</strong>
        </p>
        <button class="results-clear" onclick="clearRecommendationFilters()">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          Clear filters & browse all
        </button>
      </div>

      <div class="recommendation-grid">
        ${packages.map((pkg, index) => renderRecommendationCard(pkg, index)).join('')}
      </div>

      ${packages.length > 0 && packages.length < 3 ? `
        <div class="results-footer">
          <p>Showing ${packages.length} matching package${packages.length === 1 ? '' : 's'}</p>
          <button class="btn-secondary" onclick="clearRecommendationFilters()">
            View all packages
          </button>
        </div>
      ` : ''}
    </div>
  `;
}

/**
 * Render no results message
 * @param {object} filters - Applied filters
 * @returns {string} HTML string
 */
function renderNoResults(filters) {
  return `
    <div class="recommendation-no-results">
      <div class="no-results-icon">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="30" stroke="#e0e0e0" stroke-width="4"/>
          <path d="M32 20v16m0 8h.01" stroke="#666" stroke-width="4" stroke-linecap="round"/>
        </svg>
      </div>
      <h3 class="no-results-title">No Perfect Matches Found</h3>
      <p class="no-results-message">
        We couldn't find packages that match all your preferences, but we have great options available!
      </p>
      <div class="no-results-actions">
        <button class="btn-primary" onclick="clearRecommendationFilters()">
          View All Packages
        </button>
        <button class="btn-secondary" onclick="openQuestionnaire()">
          Try Different Filters
        </button>
      </div>
    </div>
  `;
}

/**
 * Format filter summary for display
 * @param {object} filters - Filter object
 * @returns {string} Formatted summary
 */
function formatFilterSummaryForDisplay(filters) {
  const parts = [];

  if (filters.peopleCount) {
    parts.push(`${filters.peopleCount} people`);
  }

  if (filters.budgetRange) {
    parts.push(`${filters.budgetRange.symbol} budget`);
  }

  if (filters.dietaryRestrictions?.length > 0) {
    if (filters.dietaryRestrictions.includes('vegan')) {
      parts.push('vegan');
    } else if (filters.dietaryRestrictions.includes('vegetarian')) {
      parts.push('vegetarian');
    }
  }

  if (filters.occasion && filters.occasion !== 'other') {
    const occasionLabels = {
      'office-lunch': 'office lunch',
      'office-party': 'office party',
      'game-day': 'game day',
      'corporate-event': 'corporate event'
    };
    parts.push(occasionLabels[filters.occasion] || filters.occasion);
  }

  return parts.length > 0 ? parts.join(' • ') : 'your preferences';
}

/**
 * Select a recommended package (global handler)
 */
window.selectRecommendedPackage = function(packageId) {
  // Track analytics
  if (window.gtag) {
    gtag('event', 'package_selected', {
      package_id: packageId,
      source: 'recommendations'
    });
  }

  // Navigate to customization flow
  if (window.startCustomization) {
    window.startCustomization(packageId);
  } else {
    console.warn('Customization flow not available');
  }
};

/**
 * Clear recommendation filters (global handler)
 */
window.clearRecommendationFilters = function() {
  // Track analytics
  if (window.gtag) {
    gtag('event', 'filters_cleared', {
      source: 'recommendations'
    });
  }

  // Clear localStorage
  try {
    localStorage.removeItem('catering_filters');
  } catch (e) {
    console.warn('Could not clear filters', e);
  }

  // Reload packages without filters
  if (window.loadAllPackages) {
    window.loadAllPackages();
  } else {
    // Fallback: reload page
    window.location.reload();
  }
};
