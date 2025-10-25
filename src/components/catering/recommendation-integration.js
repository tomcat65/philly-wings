/**
 * Recommendation System Integration
 * Connects smart questionnaire, filtering, and package display
 */

import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../firebase-config.js';
import { getRecommendations } from '../../utils/recommendations.js';
import { renderRecommendationResults } from './recommendation-card.js';
import { loadSavedFilters } from './smart-questionnaire.js';

let cachedPackages = null;

/**
 * Fetch all active catering packages from Firestore
 * @returns {Promise<Array>} Package data with metadata
 */
async function fetchPackagesForRecommendations() {
  // Return cached if available
  if (cachedPackages) {
    return cachedPackages;
  }

  try {
    const packagesQuery = query(
      collection(db, 'cateringPackages'),
      where('active', '==', true),
      orderBy('servesMin', 'asc')
    );

    const snapshot = await getDocs(packagesQuery);
    const packages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Enrich with metadata for recommendations
    const enriched = packages.map(pkg => ({
      ...pkg,
      // Ensure all required fields exist
      servesMin: pkg.servesMin || 10,
      servesMax: pkg.servesMax || 15,
      basePrice: pkg.basePrice || 0,
      popular: pkg.popular || false,
      occasionTags: pkg.occasionTags || [],
      dietaryTags: pkg.dietaryTags || [],
      imageUrl: pkg.imageUrl || null
    }));

    cachedPackages = enriched;
    return enriched;
  } catch (error) {
    console.error('Error fetching packages for recommendations:', error);
    return [];
  }
}

/**
 * Filter and display recommended packages
 * @param {object} filters - Customer preferences from questionnaire
 */
export async function filterPackagesByRecommendations(filters) {
  try {
    // Fetch all packages
    const allPackages = await fetchPackagesForRecommendations();

    // Apply recommendation algorithm
    const recommendations = getRecommendations(allPackages, filters);

    // Get results container
    const resultsContainer = document.getElementById('recommendation-results-container');
    const packagesSection = document.getElementById('catering-packages');

    if (!resultsContainer) {
      console.warn('Recommendation results container not found');
      return;
    }

    if (recommendations.length === 0) {
      // Show no results message
      resultsContainer.innerHTML = renderRecommendationResults([], filters);
      resultsContainer.style.display = 'block';

      // Keep regular packages visible as fallback
      if (packagesSection) {
        packagesSection.style.display = 'block';
      }
    } else {
      // Render recommendations
      resultsContainer.innerHTML = renderRecommendationResults(recommendations, filters);
      resultsContainer.style.display = 'block';

      // Hide regular packages when showing recommendations
      if (packagesSection) {
        packagesSection.style.display = 'none';
      }

      // Scroll to recommendations
      setTimeout(() => {
        resultsContainer.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);
    }

    // Track analytics
    if (window.gtag) {
      gtag('event', 'recommendations_displayed', {
        filter_count: Object.keys(filters).filter(k => filters[k]).length,
        result_count: recommendations.length,
        top_match_score: recommendations[0]?.matchScore || 0
      });
    }
  } catch (error) {
    console.error('Error filtering packages by recommendations:', error);

    // Show error state
    const resultsContainer = document.getElementById('recommendation-results-container');
    if (resultsContainer) {
      resultsContainer.innerHTML = `
        <div class="recommendation-error">
          <p>Sorry, we're having trouble loading recommendations right now.</p>
          <button class="btn-primary" onclick="location.reload()">
            Reload Page
          </button>
        </div>
      `;
      resultsContainer.style.display = 'block';
    }
  }
}

/**
 * Load all packages without filters
 */
window.loadAllPackages = async function() {
  const resultsContainer = document.getElementById('recommendation-results-container');
  const packagesSection = document.getElementById('catering-packages');

  // Hide recommendations
  if (resultsContainer) {
    resultsContainer.innerHTML = '';
    resultsContainer.style.display = 'none';
  }

  // Show regular packages
  if (packagesSection) {
    packagesSection.style.display = 'block';

    // Scroll to packages
    setTimeout(() => {
      packagesSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }, 100);
  }

  // Track analytics
  if (window.gtag) {
    gtag('event', 'view_all_packages', {
      source: 'clear_filters'
    });
  }
};

/**
 * Initialize recommendation system on page load
 */
export function initRecommendationSystem() {
  // Check for saved filters from previous session
  const savedFilters = loadSavedFilters();

  if (savedFilters) {
    // Show recommendations based on saved filters
    setTimeout(() => {
      filterPackagesByRecommendations(savedFilters);
    }, 500);

    // Track analytics
    if (window.gtag) {
      gtag('event', 'filters_restored', {
        source: 'localStorage'
      });
    }
  }

  // Pre-fetch packages in background for faster filtering
  fetchPackagesForRecommendations().catch(err => {
    console.warn('Background package fetch failed:', err);
  });
}

/**
 * Start customization flow for a selected package
 * @param {string} packageId - Package ID to customize
 */
window.startCustomization = function(packageId) {
  // Track analytics
  if (window.gtag) {
    gtag('event', 'customization_started', {
      package_id: packageId,
      source: 'recommendations'
    });
  }

  // For now, scroll to the package in the regular list
  // In future, this will launch the customization modal
  const packagesSection = document.getElementById('catering-packages');
  if (packagesSection) {
    // Show packages section
    packagesSection.style.display = 'block';

    // Find and highlight the selected package
    const packageCard = packagesSection.querySelector(`[data-package-id="${packageId}"]`);
    if (packageCard) {
      packageCard.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });

      // Add highlight effect
      packageCard.style.animation = 'none';
      setTimeout(() => {
        packageCard.style.animation = 'highlightPulse 2s ease-in-out';
      }, 10);
    } else {
      // Package not found in current view, just scroll to section
      packagesSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }
};

// Make filterPackagesByRecommendations available globally
window.filterPackagesByRecommendations = filterPackagesByRecommendations;
