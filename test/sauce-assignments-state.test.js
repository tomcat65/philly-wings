/**
 * Tests for Sauce Assignment State Functions (Story 1)
 * Tests preset algorithms, validation, summary calculation, and migration
 *
 * @epic SP-SAUCE-ASSIGNMENT-001
 * @story SP-SAUCE-STORY-1
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  applyPreset,
  validateWingTypeAssignment,
  validateAllAssignments,
  calculateSauceAssignmentSummary,
  migrateSauceData
} from '../src/services/shared-platter-state-service.js';

// Mock sauce data
const mockSauces = [
  { id: 'buffalo', name: 'Buffalo', category: 'signature-sauce', isDryRub: false },
  { id: 'bbq', name: 'BBQ', category: 'signature-sauce', isDryRub: false },
  { id: 'lemon-pepper', name: 'Lemon Pepper', category: 'dry-rub', isDryRub: true }
];

const mockWingDistribution = {
  boneless: 50,
  boneIn: 30,
  cauliflower: 0,
  boneInStyle: 'mixed',
  distributionSource: 'manual'
};

describe('Sauce Assignment State Functions', () => {

  // ===== PRESET ALGORITHMS =====

  describe('applyPreset - All Same', () => {
    it('should assign first sauce to all wing types (all wings)', () => {
      const result = applyPreset('all-same', mockSauces, mockWingDistribution);

      expect(result.boneless).toHaveLength(1);
      expect(result.boneless[0].sauceId).toBe('buffalo');
      expect(result.boneless[0].wingCount).toBe(50);

      expect(result.boneIn).toHaveLength(1);
      expect(result.boneIn[0].sauceId).toBe('buffalo');
      expect(result.boneIn[0].wingCount).toBe(30);

      expect(result.cauliflower).toHaveLength(0); // 0 wings
    });

    it('should work with single sauce selection', () => {
      const singleSauce = [mockSauces[0]];
      const result = applyPreset('all-same', singleSauce, mockWingDistribution);

      expect(result.boneless[0].wingCount).toBe(50);
      expect(result.boneIn[0].wingCount).toBe(30);
    });
  });

  describe('applyPreset - Even Mix', () => {
    it('should distribute remainder correctly (80 wings / 3 sauces = 27+27+26)', () => {
      const distribution = { boneless: 80, boneIn: 0, cauliflower: 0 };
      const result = applyPreset('even-mix', mockSauces, distribution);

      expect(result.boneless).toHaveLength(3);
      expect(result.boneless[0].wingCount).toBe(27); // floor(80/3) + 1
      expect(result.boneless[1].wingCount).toBe(27); // floor(80/3) + 1
      expect(result.boneless[2].wingCount).toBe(26); // floor(80/3)

      const total = result.boneless.reduce((sum, a) => sum + a.wingCount, 0);
      expect(total).toBe(80);
    });

    it('should handle even distribution (60 wings / 3 sauces = 20+20+20)', () => {
      const distribution = { boneless: 60, boneIn: 0, cauliflower: 0 };
      const result = applyPreset('even-mix', mockSauces, distribution);

      expect(result.boneless).toHaveLength(3);
      expect(result.boneless[0].wingCount).toBe(20);
      expect(result.boneless[1].wingCount).toBe(20);
      expect(result.boneless[2].wingCount).toBe(20);
    });

    it('should distribute across multiple wing types', () => {
      const result = applyPreset('even-mix', mockSauces, mockWingDistribution);

      // Boneless: 50/3 = 17+17+16
      expect(result.boneless[0].wingCount).toBe(17);
      expect(result.boneless[1].wingCount).toBe(17);
      expect(result.boneless[2].wingCount).toBe(16);

      // BoneIn: 30/3 = 10+10+10
      expect(result.boneIn[0].wingCount).toBe(10);
      expect(result.boneIn[1].wingCount).toBe(10);
      expect(result.boneIn[2].wingCount).toBe(10);
    });
  });

  describe('applyPreset - One Per Wing Type', () => {
    it('should wrap around when more wing types than sauces', () => {
      const distribution = { boneless: 50, boneIn: 30, cauliflower: 20 };
      const result = applyPreset('one-per-type', mockSauces, distribution);

      expect(result.boneless[0].sauceId).toBe('buffalo');  // index 0 % 3 = 0
      expect(result.boneIn[0].sauceId).toBe('bbq');        // index 1 % 3 = 1
      expect(result.cauliflower[0].sauceId).toBe('lemon-pepper'); // index 2 % 3 = 2

      expect(result.boneless[0].wingCount).toBe(50);
      expect(result.boneIn[0].wingCount).toBe(30);
      expect(result.cauliflower[0].wingCount).toBe(20);
    });

    it('should wrap around correctly with 2 sauces, 3 wing types', () => {
      const twoSauces = mockSauces.slice(0, 2);
      const distribution = { boneless: 50, boneIn: 30, cauliflower: 20 };
      const result = applyPreset('one-per-type', twoSauces, distribution);

      expect(result.boneless[0].sauceId).toBe('buffalo');     // 0 % 2 = 0
      expect(result.boneIn[0].sauceId).toBe('bbq');           // 1 % 2 = 1
      expect(result.cauliflower[0].sauceId).toBe('buffalo');  // 2 % 2 = 0 (wrap)
    });

    it('should skip wing types with 0 count', () => {
      const result = applyPreset('one-per-type', mockSauces, mockWingDistribution);

      expect(result.boneless).toHaveLength(1);
      expect(result.boneIn).toHaveLength(1);
      expect(result.cauliflower).toHaveLength(0); // Skipped
    });
  });

  describe('applyPreset - Custom', () => {
    it('should return empty assignments', () => {
      const result = applyPreset('custom', mockSauces, mockWingDistribution);

      expect(result.boneless).toHaveLength(0);
      expect(result.boneIn).toHaveLength(0);
      expect(result.cauliflower).toHaveLength(0);
    });
  });

  describe('applyPreset - Edge Cases', () => {
    it('should handle zero wing types (all 0 counts)', () => {
      const emptyDistribution = { boneless: 0, boneIn: 0, cauliflower: 0 };
      const result = applyPreset('all-same', mockSauces, emptyDistribution);

      expect(result.boneless).toHaveLength(0);
      expect(result.boneIn).toHaveLength(0);
      expect(result.cauliflower).toHaveLength(0);
    });

    it('should handle empty sauce selection', () => {
      const result = applyPreset('all-same', [], mockWingDistribution);

      expect(result.boneless).toHaveLength(0);
      expect(result.boneIn).toHaveLength(0);
      expect(result.cauliflower).toHaveLength(0);
    });
  });

  // ===== VALIDATION FUNCTIONS =====

  describe('validateWingTypeAssignment', () => {
    it('should validate correct assignment (75/80 wings)', () => {
      const assignments = [
        { sauceId: 'buffalo', wingCount: 75, sauceCategory: 'signature-sauce', applicationMethod: 'tossed' }
      ];

      const result = validateWingTypeAssignment('boneless', assignments, 80);

      expect(result.valid).toBe(false);
      expect(result.assignedTotal).toBe(75);
      expect(result.percentComplete).toBe(94); // Math.round(75/80 * 100)
      expect(result.errors).toContain('Assign 5 more wings');
    });

    it('should validate perfect assignment (80/80 wings)', () => {
      const assignments = [
        { sauceId: 'buffalo', wingCount: 80, sauceCategory: 'signature-sauce', applicationMethod: 'tossed' }
      ];

      const result = validateWingTypeAssignment('boneless', assignments, 80);

      expect(result.valid).toBe(true);
      expect(result.assignedTotal).toBe(80);
      expect(result.percentComplete).toBe(100);
      expect(result.errors).toHaveLength(0);
    });

    it('should catch over-assignment (85/80 wings)', () => {
      const assignments = [
        { sauceId: 'buffalo', wingCount: 85, sauceCategory: 'signature-sauce', applicationMethod: 'tossed' }
      ];

      const result = validateWingTypeAssignment('boneless', assignments, 80);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Remove 5 wings');
    });

    it('should catch negative wing counts', () => {
      const assignments = [
        { sauceId: 'buffalo', wingCount: -10, sauceCategory: 'signature-sauce', applicationMethod: 'tossed' }
      ];

      const result = validateWingTypeAssignment('boneless', assignments, 80);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Wing count cannot be negative');
    });

    it('should catch dry-rub with on-the-side', () => {
      const assignments = [
        { sauceId: 'lemon-pepper', wingCount: 80, sauceCategory: 'dry-rub', applicationMethod: 'on-the-side' }
      ];

      const result = validateWingTypeAssignment('boneless', assignments, 80);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Dry rubs cannot be served on-the-side');
    });

    it('should handle zero wing types (valid)', () => {
      const assignments = [];
      const result = validateWingTypeAssignment('cauliflower', assignments, 0);

      expect(result.valid).toBe(true);
      expect(result.percentComplete).toBe(100);
    });
  });

  describe('validateAllAssignments', () => {
    it('should validate all wing types together', () => {
      const sauceAssignments = {
        assignments: {
          boneless: [
            { sauceId: 'buffalo', wingCount: 50, sauceCategory: 'signature-sauce', applicationMethod: 'tossed' }
          ],
          boneIn: [
            { sauceId: 'bbq', wingCount: 30, sauceCategory: 'signature-sauce', applicationMethod: 'tossed' }
          ],
          cauliflower: []
        }
      };

      const result = validateAllAssignments(sauceAssignments, mockWingDistribution);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should catch errors across multiple wing types', () => {
      const sauceAssignments = {
        assignments: {
          boneless: [
            { sauceId: 'buffalo', wingCount: 45, sauceCategory: 'signature-sauce', applicationMethod: 'tossed' }
          ],
          boneIn: [
            { sauceId: 'lemon-pepper', wingCount: 30, sauceCategory: 'dry-rub', applicationMethod: 'on-the-side' }
          ],
          cauliflower: []
        }
      };

      const result = validateAllAssignments(sauceAssignments, mockWingDistribution);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.includes('boneless'))).toBe(true);
      expect(result.errors.some(e => e.includes('boneIn'))).toBe(true);
    });
  });

  // ===== SUMMARY CALCULATOR =====

  describe('calculateSauceAssignmentSummary', () => {
    it('should calculate total wings assigned', () => {
      const sauceAssignments = {
        assignments: {
          boneless: [
            { sauceId: 'buffalo', wingCount: 50, applicationMethod: 'tossed' }
          ],
          boneIn: [
            { sauceId: 'bbq', wingCount: 30, applicationMethod: 'tossed' }
          ],
          cauliflower: []
        }
      };

      const summary = calculateSauceAssignmentSummary(sauceAssignments);

      expect(summary.totalWingsAssigned).toBe(80);
      expect(summary.byApplicationMethod.tossed).toBe(80);
      expect(summary.byApplicationMethod.onTheSide).toBe(0);
      expect(summary.containersNeeded).toBe(0);
    });

    it('should calculate containers correctly (Math.ceil(wingCount * 0.5))', () => {
      const sauceAssignments = {
        assignments: {
          boneless: [
            { sauceId: 'buffalo', wingCount: 30, applicationMethod: 'on-the-side' }
          ],
          boneIn: [
            { sauceId: 'bbq', wingCount: 10, applicationMethod: 'on-the-side' }
          ],
          cauliflower: []
        }
      };

      const summary = calculateSauceAssignmentSummary(sauceAssignments);

      // 30 wings * 0.5 = 15 containers
      // 10 wings * 0.5 = 5 containers
      // Total = 20 containers
      expect(summary.containersNeeded).toBe(20);
      expect(summary.byApplicationMethod.onTheSide).toBe(40);
      expect(summary.byApplicationMethod.tossed).toBe(0);
    });

    it('should handle mixed application methods', () => {
      const sauceAssignments = {
        assignments: {
          boneless: [
            { sauceId: 'buffalo', wingCount: 25, applicationMethod: 'tossed' },
            { sauceId: 'bbq', wingCount: 25, applicationMethod: 'on-the-side' }
          ],
          boneIn: [],
          cauliflower: []
        }
      };

      const summary = calculateSauceAssignmentSummary(sauceAssignments);

      expect(summary.totalWingsAssigned).toBe(50);
      expect(summary.byApplicationMethod.tossed).toBe(25);
      expect(summary.byApplicationMethod.onTheSide).toBe(25);
      expect(summary.containersNeeded).toBe(13); // Math.ceil(25 * 0.5)
    });
  });

  // ===== MIGRATION FUNCTION =====

  describe('migrateSauceData', () => {
    it('should migrate old sauces to new structure using One-Per-Type preset', () => {
      const oldSauces = [
        { id: 'buffalo', name: 'Buffalo', wingCount: 50, category: 'signature-sauce' },
        { id: 'bbq', name: 'BBQ', wingCount: 30, category: 'signature-sauce' }
      ];

      const result = migrateSauceData(oldSauces, mockWingDistribution);

      expect(result.selectedSauces).toHaveLength(2);
      expect(result.appliedPreset).toBe('one-per-type');
      expect(result.assignments.boneless[0].sauceId).toBe('buffalo');
      expect(result.assignments.boneIn[0].sauceId).toBe('bbq');
      expect(result.summary.totalWingsAssigned).toBe(80);
    });

    it('should filter out sauces with wingCount 0', () => {
      const oldSauces = [
        { id: 'buffalo', name: 'Buffalo', wingCount: 80 },
        { id: 'bbq', name: 'BBQ', wingCount: 0 },
        { id: 'lemon-pepper', name: 'Lemon Pepper', wingCount: 0 }
      ];

      const result = migrateSauceData(oldSauces, mockWingDistribution);

      expect(result.selectedSauces).toHaveLength(1);
      expect(result.selectedSauces[0].id).toBe('buffalo');
    });

    it('should handle empty old sauces array', () => {
      const result = migrateSauceData([], mockWingDistribution);

      expect(result.selectedSauces).toHaveLength(0);
      expect(result.appliedPreset).toBe(null);
      expect(result.assignments.boneless).toHaveLength(0);
    });

    it('should preserve sauce metadata during migration', () => {
      const oldSauces = [
        {
          id: 'buffalo',
          name: 'Buffalo',
          wingCount: 80,
          category: 'signature-sauce',
          isDryRub: false,
          heatLevel: 3,
          imageUrl: 'https://example.com/buffalo.jpg'
        }
      ];

      const result = migrateSauceData(oldSauces, mockWingDistribution);

      expect(result.selectedSauces[0].category).toBe('signature-sauce');
      expect(result.selectedSauces[0].isDryRub).toBe(false);
      expect(result.selectedSauces[0].heatLevel).toBe(3);
      expect(result.selectedSauces[0].imageUrl).toBe('https://example.com/buffalo.jpg');
    });
  });

  // ===== INTEGRATION TEST =====

  describe('Integration: Apply Preset → Validate → Summary', () => {
    it('should complete full workflow from preset to validated summary', () => {
      // Step 1: Apply preset
      const assignments = applyPreset('even-mix', mockSauces, mockWingDistribution);

      // Step 2: Validate
      const sauceAssignments = { assignments };
      const validation = validateAllAssignments(sauceAssignments, mockWingDistribution);

      expect(validation.valid).toBe(true);

      // Step 3: Calculate summary
      const summary = calculateSauceAssignmentSummary(sauceAssignments);

      expect(summary.totalWingsAssigned).toBe(80);
      expect(summary.byApplicationMethod.tossed).toBe(80);
      expect(summary.containersNeeded).toBe(0);
    });
  });
});
