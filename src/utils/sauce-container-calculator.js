/**
 * Sauce Container Calculator Utility
 * Calculates sauce container requirements for on-the-side sauce orders
 *
 * Formula: Math.ceil(wingCount * 0.5)
 * - 1 container per 2 wings
 * - Always rounds up to ensure sufficient sauce
 * - Only applies to "on-the-side" application method
 * - Dry rubs are always tossed (no containers)
 *
 * Display Logic:
 * - Show container count in summary/editor (informational only)
 * - Containers are FREE for sauce assignments
 * - Do NOT add to order pricing (sauces are already assigned)
 *
 * Created: 2025-11-03
 * Epic: SP-SAUCE-ASSIGNMENT-001
 * Story: SP-SAUCE-STORY-5
 */

/**
 * Calculate container count for on-the-side sauce
 * @param {number} wingCount - Number of wings
 * @returns {number} Container count (always integer)
 */
export function calculateContainerCount(wingCount) {
  if (!wingCount || wingCount <= 0) {
    return 0;
  }

  // Formula: 1 container per 2 wings (rounded up)
  return Math.ceil(wingCount * 0.5);
}

/**
 * Calculate total containers needed for all assignments
 * @param {Object} assignments - Full assignments object {boneless: [], boneIn: [], cauliflower: []}
 * @returns {number} Total container count
 */
export function calculateTotalContainers(assignments) {
  let totalContainers = 0;

  // Iterate through all wing types
  Object.values(assignments).forEach(wingTypeAssignments => {
    if (Array.isArray(wingTypeAssignments)) {
      wingTypeAssignments.forEach(assignment => {
        // Only count "on-the-side" assignments
        if (assignment.applicationMethod === 'on-the-side') {
          totalContainers += calculateContainerCount(assignment.wingCount);
        }
      });
    }
  });

  return totalContainers;
}

/**
 * Get container breakdown by wing type
 * @param {Object} assignments - Full assignments object
 * @returns {Object} Container breakdown {boneless: 5, boneIn: 3, cauliflower: 2, total: 10}
 */
export function getContainerBreakdown(assignments) {
  const breakdown = {
    boneless: 0,
    boneIn: 0,
    cauliflower: 0,
    total: 0
  };

  // Calculate per wing type
  Object.entries(assignments).forEach(([wingType, wingTypeAssignments]) => {
    if (Array.isArray(wingTypeAssignments)) {
      wingTypeAssignments.forEach(assignment => {
        if (assignment.applicationMethod === 'on-the-side') {
          const containerCount = calculateContainerCount(assignment.wingCount);
          breakdown[wingType] += containerCount;
          breakdown.total += containerCount;
        }
      });
    }
  });

  return breakdown;
}

/**
 * Get container details for a specific assignment
 * @param {Object} assignment - Single assignment object
 * @returns {Object} Container details {needed: 3, displayText: "3 containers", isFree: true}
 */
export function getContainerDetails(assignment) {
  const needed = assignment.applicationMethod === 'on-the-side'
    ? calculateContainerCount(assignment.wingCount)
    : 0;

  const displayText = needed === 0
    ? 'No containers'
    : needed === 1
      ? '1 container'
      : `${needed} containers`;

  return {
    needed,
    displayText,
    isFree: true, // Always FREE for sauce assignments
    note: needed > 0 ? 'FREE with sauce assignment' : null
  };
}

/**
 * Validate container calculation (for testing)
 * @param {number} wingCount - Wing count
 * @param {number} expectedContainers - Expected result
 * @returns {boolean} Whether calculation matches expected
 */
export function validateContainerCalculation(wingCount, expectedContainers) {
  return calculateContainerCount(wingCount) === expectedContainers;
}

/**
 * Get container count examples for UI display
 * @returns {Array} Examples [{wings: 10, containers: 5}, ...]
 */
export function getContainerExamples() {
  return [
    { wings: 10, containers: 5 },
    { wings: 20, containers: 10 },
    { wings: 25, containers: 13 },
    { wings: 50, containers: 25 },
    { wings: 75, containers: 38 },
    { wings: 100, containers: 50 }
  ];
}
