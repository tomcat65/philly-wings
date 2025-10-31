/**
 * Recommendations & Filtering Test Suite
 * Tests smart recommendation algorithm and filtering logic
 */

import { describe, it, expect } from 'vitest';
import {
  calculateMatchScore,
  getMatchReasons,
  getRecommendations,
  getBudgetRanges,
  getPeopleRanges,
  getDietaryOptions,
  getOccasionOptions,
  formatFilterSummary
} from '../../src/utils/recommendations.js';

describe('Recommendation Utilities', () => {
  // Mock package data
  const mockPackages = [
    {
      id: 'lunch-box-special',
      name: 'Lunch Box Special',
      basePrice: 149.99,
      servesMin: 10,
      servesMax: 12,
      active: true,
      popular: true,
      occasionTags: ['office-lunch'],
      dietaryTags: []
    },
    {
      id: 'northeast-philly-feast',
      name: 'Northeast Philly Feast',
      basePrice: 449.99,
      servesMin: 30,
      servesMax: 35,
      active: true,
      popular: true,
      occasionTags: ['office-party', 'corporate-event'],
      dietaryTags: []
    },
    {
      id: 'plant-power-pack',
      name: 'Plant Power Pack',
      basePrice: 189.99,
      servesMin: 10,
      servesMax: 12,
      active: true,
      popular: false,
      occasionTags: ['office-lunch'],
      dietaryTags: ['plant-based', 'vegan', 'vegetarian']
    },
    {
      id: 'game-day-feast',
      name: 'Game Day Feast',
      basePrice: 599.99,
      servesMin: 50,
      servesMax: 60,
      active: true,
      popular: true,
      occasionTags: ['game-day'],
      dietaryTags: []
    },
    {
      id: 'inactive-package',
      name: 'Inactive Package',
      basePrice: 299.99,
      servesMin: 20,
      servesMax: 25,
      active: false,
      popular: false,
      occasionTags: [],
      dietaryTags: []
    }
  ];

  describe('calculateMatchScore', () => {
    it('should give high score for perfect people count match', () => {
      const pkg = mockPackages[0]; // Serves 10-12
      const filters = { peopleCount: 11 }; // Midpoint

      const score = calculateMatchScore(pkg, filters);

      expect(score).toBeGreaterThan(40); // Should get close to max 50 for people match
    });

    it('should give lower score for people count at edge of range', () => {
      const pkg = mockPackages[0]; // Serves 10-12, popular: true (+10)
      const filters = { peopleCount: 10 }; // At minimum

      const score = calculateMatchScore(pkg, filters);

      // Should get ~49 for people count + 10 for popularity = 59
      expect(score).toBeLessThan(60);
      expect(score).toBeGreaterThan(40);
    });

    it('should give high score for budget match', () => {
      const pkg = mockPackages[0]; // $149.99
      const filters = {
        budgetRange: { min: 100, max: 200, symbol: '$' }
      };

      const score = calculateMatchScore(pkg, filters);

      expect(score).toBeGreaterThanOrEqual(30); // Budget match points
    });

    it('should give zero score for budget mismatch', () => {
      const pkg = mockPackages[1]; // $449.99, popular: true (+10)
      const filters = {
        budgetRange: { min: 0, max: 200, symbol: '$' }
      };

      const score = calculateMatchScore(pkg, filters);

      // No budget match, but still gets 10 points for popularity
      expect(score).toBe(10);
    });

    it('should add points for occasion match', () => {
      const pkg = mockPackages[0]; // Has 'office-lunch' tag
      const filtersWithOccasion = { occasion: 'office-lunch' };
      const filtersWithoutOccasion = {};

      const scoreWith = calculateMatchScore(pkg, filtersWithOccasion);
      const scoreWithout = calculateMatchScore(pkg, filtersWithoutOccasion);

      expect(scoreWith).toBeGreaterThan(scoreWithout);
    });

    it('should add points for popular packages', () => {
      const popularPkg = mockPackages[0]; // popular: true
      const unpopularPkg = mockPackages[2]; // popular: false
      const filters = {};

      const popularScore = calculateMatchScore(popularPkg, filters);
      const unpopularScore = calculateMatchScore(unpopularPkg, filters);

      expect(popularScore).toBeGreaterThan(unpopularScore);
    });

    it('should calculate combined score correctly', () => {
      const pkg = mockPackages[0]; // Lunch Box Special
      const filters = {
        peopleCount: 11,
        budgetRange: { min: 100, max: 200, symbol: '$' },
        occasion: 'office-lunch'
      };

      const score = calculateMatchScore(pkg, filters);

      // Should get points for all three factors + popularity
      expect(score).toBeGreaterThan(80);
    });
  });

  describe('getMatchReasons', () => {
    it('should return people count reason', () => {
      const pkg = mockPackages[0]; // Serves 10-12
      const filters = { peopleCount: 11 };

      const reasons = getMatchReasons(pkg, filters);

      expect(reasons).toContain('Perfect for 11 people');
    });

    it('should return budget reason', () => {
      const pkg = mockPackages[0]; // $149.99
      const filters = {
        budgetRange: { min: 100, max: 200, symbol: '$' }
      };

      const reasons = getMatchReasons(pkg, filters);

      expect(reasons).toContain('Within your budget range');
    });

    it('should return plant-based reason for vegan filter', () => {
      const pkg = mockPackages[2]; // Plant Power Pack
      const filters = { dietaryRestrictions: ['vegan'] };

      const reasons = getMatchReasons(pkg, filters);

      expect(reasons).toContain('100% plant-based option available');
    });

    it('should return occasion reason', () => {
      const pkg = mockPackages[3]; // Game Day Feast
      const filters = { occasion: 'game-day' };

      const reasons = getMatchReasons(pkg, filters);

      expect(reasons).toContain('Popular for game day events');
    });

    it('should return popularity reason', () => {
      const pkg = mockPackages[0]; // popular: true
      const filters = {};

      const reasons = getMatchReasons(pkg, filters);

      expect(reasons).toContain('Customer favorite');
    });

    it('should return multiple reasons when applicable', () => {
      const pkg = mockPackages[0]; // Lunch Box Special
      const filters = {
        peopleCount: 11,
        budgetRange: { min: 100, max: 200, symbol: '$' },
        occasion: 'office-lunch'
      };

      const reasons = getMatchReasons(pkg, filters);

      expect(reasons.length).toBeGreaterThan(2);
    });
  });

  describe('getRecommendations', () => {
    it('should filter out inactive packages', () => {
      const filters = {};
      const recommendations = getRecommendations(mockPackages, filters);

      const hasInactive = recommendations.some(pkg => pkg.id === 'inactive-package');
      expect(hasInactive).toBe(false);
    });

    it('should filter by people count', () => {
      const filters = { peopleCount: 11 }; // Should match packages serving 10-12

      const recommendations = getRecommendations(mockPackages, filters);

      recommendations.forEach(pkg => {
        expect(pkg.servesMin).toBeLessThanOrEqual(11);
        expect(pkg.servesMax).toBeGreaterThanOrEqual(11);
      });
    });

    it('should filter by vegan dietary restriction', () => {
      const filters = { dietaryRestrictions: ['vegan'] };

      const recommendations = getRecommendations(mockPackages, filters);

      recommendations.forEach(pkg => {
        expect(pkg.dietaryTags).toContain('plant-based');
      });
    });

    it('should filter by budget range', () => {
      const filters = {
        budgetRange: { min: 0, max: 200, symbol: '$' }
      };

      const recommendations = getRecommendations(mockPackages, filters);

      recommendations.forEach(pkg => {
        expect(pkg.basePrice).toBeLessThanOrEqual(200);
      });
    });

    it('should sort by match score (highest first)', () => {
      const filters = {
        peopleCount: 11,
        budgetRange: { min: 100, max: 200, symbol: '$' }
      };

      const recommendations = getRecommendations(mockPackages, filters);

      for (let i = 0; i < recommendations.length - 1; i++) {
        expect(recommendations[i].matchScore).toBeGreaterThanOrEqual(recommendations[i + 1].matchScore);
      }
    });

    it('should include match score and reasons in results', () => {
      const filters = { peopleCount: 11 };

      const recommendations = getRecommendations(mockPackages, filters);

      recommendations.forEach(pkg => {
        expect(pkg.matchScore).toBeTypeOf('number');
        expect(Array.isArray(pkg.matchReasons)).toBe(true);
      });
    });

    it('should handle no filters (return all active packages)', () => {
      const filters = {};

      const recommendations = getRecommendations(mockPackages, filters);

      expect(recommendations.length).toBe(4); // 4 active packages
    });

    it('should handle filters that match no packages', () => {
      const filters = {
        peopleCount: 200, // No package serves this many
        budgetRange: { min: 0, max: 100, symbol: '$' } // No package this cheap
      };

      const recommendations = getRecommendations(mockPackages, filters);

      expect(recommendations.length).toBe(0);
    });

    it('should handle multiple overlapping filters', () => {
      const filters = {
        peopleCount: 11,
        budgetRange: { min: 100, max: 300, symbol: '$$' },
        occasion: 'office-lunch',
        dietaryRestrictions: []
      };

      const recommendations = getRecommendations(mockPackages, filters);

      expect(recommendations.length).toBeGreaterThan(0);
      recommendations.forEach(pkg => {
        expect(pkg.servesMin).toBeLessThanOrEqual(11);
        expect(pkg.servesMax).toBeGreaterThanOrEqual(11);
        expect(pkg.basePrice).toBeLessThanOrEqual(300);
      });
    });
  });

  describe('getBudgetRanges', () => {
    it('should return 4 budget ranges', () => {
      const ranges = getBudgetRanges();

      expect(ranges).toHaveLength(4);
    });

    it('should have ascending min values', () => {
      const ranges = getBudgetRanges();

      for (let i = 0; i < ranges.length - 1; i++) {
        expect(ranges[i + 1].min).toBeGreaterThanOrEqual(ranges[i].min);
      }
    });

    it('should have proper structure', () => {
      const ranges = getBudgetRanges();

      ranges.forEach(range => {
        expect(range).toHaveProperty('label');
        expect(range).toHaveProperty('symbol');
        expect(range).toHaveProperty('min');
        expect(range).toHaveProperty('max');
        expect(range.min).toBeTypeOf('number');
        expect(range.max).toBeTypeOf('number');
        expect(range.max).toBeGreaterThan(range.min);
      });
    });
  });

  describe('getPeopleRanges', () => {
    it('should return 5 people ranges', () => {
      const ranges = getPeopleRanges();

      expect(ranges).toHaveLength(5);
    });

    it('should have ascending min values', () => {
      const ranges = getPeopleRanges();

      for (let i = 0; i < ranges.length - 1; i++) {
        expect(ranges[i + 1].min).toBeGreaterThanOrEqual(ranges[i].min);
      }
    });

    it('should have proper structure', () => {
      const ranges = getPeopleRanges();

      ranges.forEach(range => {
        expect(range).toHaveProperty('label');
        expect(range).toHaveProperty('min');
        expect(range).toHaveProperty('max');
        expect(range).toHaveProperty('value');
        expect(range.value).toBeGreaterThanOrEqual(range.min);
        expect(range.value).toBeLessThanOrEqual(range.max);
      });
    });
  });

  describe('getDietaryOptions', () => {
    it('should return 3 dietary options', () => {
      const options = getDietaryOptions();

      expect(options).toHaveLength(3);
    });

    it('should include none, vegetarian, and vegan', () => {
      const options = getDietaryOptions();
      const values = options.map(opt => opt.value);

      expect(values).toContain('none');
      expect(values).toContain('vegetarian');
      expect(values).toContain('vegan');
    });
  });

  describe('getOccasionOptions', () => {
    it('should return 5 occasion options', () => {
      const options = getOccasionOptions();

      expect(options).toHaveLength(5);
    });

    it('should have icons for each occasion', () => {
      const options = getOccasionOptions();

      options.forEach(option => {
        expect(option).toHaveProperty('icon');
        expect(option.icon).toBeTypeOf('string');
      });
    });
  });

  describe('formatFilterSummary', () => {
    it('should format people count only', () => {
      const filters = { peopleCount: 25 };
      const summary = formatFilterSummary(filters);

      expect(summary).toBe('25 people');
    });

    it('should format budget only', () => {
      const filters = { budgetRange: { symbol: '$$' } };
      const summary = formatFilterSummary(filters);

      expect(summary).toBe('$$ budget');
    });

    it('should format vegan restriction', () => {
      const filters = { dietaryRestrictions: ['vegan'] };
      const summary = formatFilterSummary(filters);

      expect(summary).toBe('vegan');
    });

    it('should format vegetarian restriction', () => {
      const filters = { dietaryRestrictions: ['vegetarian'] };
      const summary = formatFilterSummary(filters);

      expect(summary).toBe('vegetarian');
    });

    it('should format occasion', () => {
      const filters = { occasion: 'office-lunch' };
      const summary = formatFilterSummary(filters);

      expect(summary).toBe('office lunch');
    });

    it('should combine multiple filters', () => {
      const filters = {
        peopleCount: 30,
        budgetRange: { symbol: '$$' },
        dietaryRestrictions: ['vegan'],
        occasion: 'game-day'
      };
      const summary = formatFilterSummary(filters);

      expect(summary).toContain('30 people');
      expect(summary).toContain('$$ budget');
      expect(summary).toContain('vegan');
      expect(summary).toContain('game day');
      expect(summary).toMatch(/•/); // Should use bullet separator
    });

    it('should return default message for no filters', () => {
      const filters = {};
      const summary = formatFilterSummary(filters);

      expect(summary).toBe('All packages');
    });

    it('should ignore "other" occasion', () => {
      const filters = {
        peopleCount: 20,
        occasion: 'other'
      };
      const summary = formatFilterSummary(filters);

      expect(summary).toBe('20 people');
      expect(summary).not.toContain('other');
    });
  });
});
