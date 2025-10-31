/**
 * Smart Recommendations & Filtering
 * Business logic for package recommendations based on customer preferences
 */

/**
 * Calculate match score for a package based on filters (SHARD-1-v2)
 * @param {object} pkg - Package data
 * @param {object} filters - Customer filter preferences
 * @returns {number} Match score (0-100)
 */
export function calculateMatchScore(pkg, filters) {
  let score = 0;

  // People count match (50 points max)
  if (filters.peopleCount) {
    const midpoint = (pkg.servesMin + pkg.servesMax) / 2;
    const diff = Math.abs(filters.peopleCount - midpoint);
    score += Math.max(0, 50 - diff);
  }

  // Dietary compatibility (30 points)
  if (filters.dietaryNeeds) {
    if (filters.dietaryNeeds === 'vegan') {
      // Vegan requires plant-based options
      if (pkg.dietaryTags?.includes('plant-based')) {
        score += 30;
      }
    } else if (filters.dietaryNeeds === 'vegetarian') {
      // Vegetarian benefits from plant-based but not required
      if (pkg.dietaryTags?.includes('plant-based')) {
        score += 20; // Partial points for vegetarian-friendly
      } else {
        score += 10; // Some points for regular packages (can pick around)
      }
    } else {
      // 'none' - no dietary restrictions, all packages get full points
      score += 30;
    }
  }

  // Popularity boost (10 points)
  if (pkg.popular) {
    score += 10;
  }

  return Math.round(score);
}

/**
 * Generate human-readable match reasons (SHARD-1-v2)
 * @param {object} pkg - Package data
 * @param {object} filters - Customer filter preferences
 * @returns {array} Array of reason strings
 */
export function getMatchReasons(pkg, filters) {
  const reasons = [];

  // People count match
  if (filters.peopleCount) {
    if (filters.peopleCount >= pkg.servesMin && filters.peopleCount <= pkg.servesMax) {
      reasons.push(`Perfect for your ${filters.peopleCount} people`);
    }
  }

  // Dietary compatibility
  if (filters.dietaryNeeds) {
    if (filters.dietaryNeeds === 'vegan' && pkg.dietaryTags?.includes('plant-based')) {
      reasons.push('100% plant-based option available');
    } else if (filters.dietaryNeeds === 'vegetarian' && pkg.dietaryTags?.includes('plant-based')) {
      reasons.push('Vegetarian-friendly with plant-based options');
    }
  }

  // Popularity
  if (pkg.popular) {
    reasons.push('Customer favorite');
  }

  // Value indicators
  if (pkg.totalWings && filters.peopleCount) {
    const wingsPerPerson = Math.round(pkg.totalWings / ((pkg.servesMin + pkg.servesMax) / 2));
    if (wingsPerPerson >= 12) {
      reasons.push('Great variety with ' + pkg.totalWings + ' wings');
    }
  }

  return reasons;
}

/**
 * Filter and rank packages based on customer preferences (SHARD-1-v2)
 * @param {array} packages - All available packages
 * @param {object} filters - Customer filter preferences
 * @returns {array} Filtered and sorted packages with match scores
 */
export function getRecommendations(packages, filters) {
  // Start with active packages only
  let filtered = packages.filter(pkg => pkg.active !== false);

  // Filter by people count (primary filter)
  if (filters.peopleCount) {
    filtered = filtered.filter(pkg =>
      pkg.servesMin <= filters.peopleCount &&
      pkg.servesMax >= filters.peopleCount
    );
  }

  // Filter by dietary needs
  if (filters.dietaryNeeds === 'vegan') {
    // Vegan requires plant-based options - strict filter
    filtered = filtered.filter(pkg =>
      pkg.dietaryTags?.includes('plant-based')
    );
  }
  // For 'vegetarian' and 'none', show all packages (scoring will prioritize plant-based for vegetarian)

  // Calculate match scores and reasons for all filtered packages
  const scored = filtered.map(pkg => ({
    ...pkg,
    matchScore: calculateMatchScore(pkg, filters),
    matchReasons: getMatchReasons(pkg, filters)
  }));

  // Sort by match score (highest first)
  return scored.sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Get predefined budget ranges
 * @returns {array} Budget range options
 */
export function getBudgetRanges() {
  return [
    { label: 'Budget', symbol: '$', min: 0, max: 200 },
    { label: 'Moderate', symbol: '$$', min: 200, max: 500 },
    { label: 'Premium', symbol: '$$$', min: 500, max: 1000 },
    { label: 'Deluxe', symbol: '$$$$', min: 1000, max: 10000 }
  ];
}

/**
 * Get predefined people count ranges
 * @returns {array} People count options
 */
export function getPeopleRanges() {
  return [
    { label: '10-15 people', min: 10, max: 15, value: 12 },
    { label: '15-25 people', min: 15, max: 25, value: 20 },
    { label: '25-50 people', min: 25, max: 50, value: 35 },
    { label: '50-75 people', min: 50, max: 75, value: 62 },
    { label: '75+ people', min: 75, max: 200, value: 100 }
  ];
}

/**
 * Get dietary restriction options
 * @returns {array} Dietary restriction options
 */
export function getDietaryOptions() {
  return [
    { value: 'none', label: 'No restrictions' },
    { value: 'vegetarian', label: 'Vegetarian options needed' },
    { value: 'vegan', label: 'Vegan/Plant-based only' }
  ];
}

/**
 * Get occasion options
 * @returns {array} Occasion options
 */
export function getOccasionOptions() {
  return [
    { value: 'office-lunch', label: 'Team Lunch', icon: '🍴' },
    { value: 'office-party', label: 'Office Party', icon: '🎉' },
    { value: 'game-day', label: 'Game Day', icon: '🏈' },
    { value: 'corporate-event', label: 'Corporate Event', icon: '💼' },
    { value: 'other', label: 'Other', icon: '📅' }
  ];
}

/**
 * Format filters for display
 * @param {object} filters - Filter object
 * @returns {string} Human-readable filter summary
 */
export function formatFilterSummary(filters) {
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

  return parts.length > 0 ? parts.join(' • ') : 'All packages';
}
