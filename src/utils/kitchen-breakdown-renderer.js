/**
 * Kitchen-Ready Breakdown Renderer
 *
 * Renders hierarchical, detailed breakdowns for all package components:
 * - Wings with sauce assignments and container calculations
 * - Dips with 5-pack bundling
 * - Sides, desserts, beverages with serving calculations
 * - Progressive rendering with fallback support
 *
 * @module kitchen-breakdown-renderer
 * @created 2025-11-04
 * @epic SP-SUMMARY-WINDOW
 */

import {
  calculateSideContainers,
  calculateDipContainers,
  detectModifications,
  getWingStyleLabel
} from './kitchen-breakdown-calculator.js';

/**
 * Memoization cache for expensive calculations
 */
const breakdownCache = new Map();

/**
 * Clear breakdown cache (call on state changes)
 */
export function clearBreakdownCache() {
  breakdownCache.clear();
}

/**
 * Render complete wings breakdown with progressive fallbacks
 *
 * @param {Object} packageInfo - Package configuration
 * @param {Object} currentConfig - Current user customizations
 * @param {Object} modifications - Modification flags
 * @returns {string} HTML string
 */
export function renderWingsBreakdown(packageInfo, currentConfig, modifications) {
  const wingDist = currentConfig.wingDistribution || {};
  let sauceAssignments = currentConfig.sauceAssignments || {};
  const totalWings = (wingDist.boneless || 0) + (wingDist.boneIn || 0) + (wingDist.cauliflower || 0);

  if (totalWings === 0) {
    return renderBaseWings(packageInfo);
  }

  // Check if sauces are assigned
  const hasAssignments = Object.values(sauceAssignments.assignments || {})
    .some(arr => arr && arr.length > 0);

  // ADAPTER LAYER (Phase 1): If no assignments but sauceDistributions exists, adapt it
  // TODO: Remove this adapter in Phase 2 when all data is in sauceAssignments format
  if (!hasAssignments && currentConfig.sauceDistributions) {
    sauceAssignments = adaptLegacySauceDistributions(currentConfig.sauceDistributions);
  }

  const hasAdaptedAssignments = Object.values(sauceAssignments.assignments || {})
    .some(arr => arr && arr.length > 0);

  if (hasAdaptedAssignments) {
    return renderFullWingBreakdown(packageInfo, wingDist, sauceAssignments, modifications);
  } else {
    return renderWingsWithoutSauces(wingDist, modifications);
  }
}

/**
 * Render full wing breakdown with base package + customizations
 * HYBRID RESPONSIVE: Timeline on mobile, Two-column on desktop (>768px)
 *
 * @param {Object} packageInfo - Package with default distribution
 * @param {Object} wingDist - Current wing distribution {boneless, boneIn, cauliflower, boneInStyle}
 * @param {Object} sauceAssignments - Sauce assignments by wing type
 * @param {Object} modifications - Modification flags
 * @returns {string} HTML string
 */
function renderFullWingBreakdown(packageInfo, wingDist, sauceAssignments, modifications) {
  const totalWings = (wingDist.boneless || 0) + (wingDist.boneIn || 0) + (wingDist.cauliflower || 0);
  const isModified = modifications.wings?.isModified || false;
  const hasNewTypes = wingDist.cauliflower > 0;

  // Get base package defaults
  const defaultDist = packageInfo?.wingOptions?.defaultDistribution || {};
  const defaultBoneless = defaultDist.boneless || 0;
  const defaultBoneIn = defaultDist.boneIn || 0;

  // Calculate deltas
  const bonelessDelta = (wingDist.boneless || 0) - defaultBoneless;
  const boneInDelta = (wingDist.boneIn || 0) - defaultBoneIn;
  const cauliflowerDelta = wingDist.cauliflower || 0;

  // Calculate price impact if cauliflower was added
  const priceImpact = modifications.wings?.changes?.find(c => c.type === 'cauliflower' && c.isNew);

  let html = `
    <li class="include-item ${isModified ? 'modified' : ''}">
      <div class="include-header">
        <span class="include-icon">✓</span>
        <span class="include-text">Wings: ${totalWings} Total</span>
        ${isModified ? '<span class="include-badge modified">Modified</span>' : ''}
      </div>
      <div class="breakdown-details">
  `;

  // TIMELINE SECTION: Base Package + Changes (Mobile: stacked, Desktop: two-column)
  html += `<div class="timeline-section two-column-layout">`;

  // LEFT/TOP COLUMN: Base Package
  html += `
    <div class="timeline-column base">
      <div class="timeline-badge base">🏷️ Package Includes (Base)</div>
      <div style="margin-left: 0.5rem; color: #666;">
        ${defaultBoneless > 0 ? `<div>• ${defaultBoneless} Boneless Wings</div>` : ''}
        ${defaultBoneIn > 0 ? `<div>• ${defaultBoneIn} Bone-In Wings</div>` : ''}
      </div>
    </div>
  `;

  // RIGHT/BOTTOM COLUMN: Your Changes
  html += `
    <div class="timeline-column changes">
      <div class="timeline-badge changes">🔄 Your Changes</div>
      <div style="margin-left: 0.5rem; color: #666;">
        <div style="font-weight: 600; margin-bottom: 0.5rem;">Changed distribution:</div>
        <div style="margin-left: 0.75rem;">
          ${wingDist.boneless > 0 ? `<div>• ${wingDist.boneless} Boneless${bonelessDelta !== 0 ? ` <span class="delta">(${bonelessDelta > 0 ? '+' : ''}${bonelessDelta})</span>` : ''}</div>` : ''}
          ${wingDist.boneIn > 0 ? `<div>• ${wingDist.boneIn} Bone-In${boneInDelta !== 0 ? ` <span class="delta">(${boneInDelta > 0 ? '+' : ''}${boneInDelta})</span>` : ''}</div>` : ''}
          ${wingDist.cauliflower > 0 ? `<div>• ${wingDist.cauliflower} Cauliflower <span class="delta">(+${cauliflowerDelta})</span> <span class="include-badge new">New</span></div>` : ''}
        </div>
  `;

  // Add sauce assignments
  const assignments = sauceAssignments.assignments || {};
  const hasSauces = Object.values(assignments).some(arr => arr && arr.length > 0);

  if (hasSauces) {
    html += `
        <div style="margin-top: 1rem; font-weight: 600;">Added sauce assignments:</div>
        <div style="margin-left: 0.75rem; font-size: 0.9rem; margin-top: 0.5rem;">
    `;

    if (assignments.boneless && assignments.boneless.length > 0) {
      html += `<div style="margin-bottom: 0.5rem;"><strong>Boneless:</strong> ${assignments.boneless.map(a =>
        `${a.sauceName} (${a.wingCount}, ${a.applicationMethod === 'on-the-side' ? 'side' : 'tossed'}${a.applicationMethod === 'on-the-side' ? ' - ' + Math.ceil(a.wingCount / 15) + ' cont.' : ''})`
      ).join(', ')}</div>`;
    }

    if (assignments.boneIn && assignments.boneIn.length > 0) {
      html += `<div style="margin-bottom: 0.5rem;"><strong>Bone-In:</strong> ${assignments.boneIn.map(a =>
        `${a.sauceName} (${a.wingCount}, ${a.applicationMethod === 'on-the-side' ? 'side' : 'tossed'}${a.applicationMethod === 'on-the-side' ? ' - ' + Math.ceil(a.wingCount / 15) + ' cont.' : ''})`
      ).join(', ')}</div>`;
    }

    if (assignments.cauliflower && assignments.cauliflower.length > 0) {
      html += `<div><strong>Cauliflower:</strong> ${assignments.cauliflower.map(a =>
        `${a.sauceName} (${a.wingCount}, ${a.applicationMethod === 'on-the-side' ? 'side' : 'tossed'}${a.applicationMethod === 'on-the-side' ? ' - ' + Math.ceil(a.wingCount / 15) + ' cont.' : ''})`
      ).join(', ')}</div>`;
    }

    html += `
        </div>
    `;
  }

  // Price impact if applicable
  if (priceImpact && cauliflowerDelta > 0) {
    html += `
        <div class="price-impact">
          💰 Price Impact: Cauliflower upcharge applies
        </div>
    `;
  }

  html += `
      </div>
    </div>
  `;

  html += `
      </div>
    </li>
  `;

  return html;
}

/**
 * Render wing type section with sauce assignments
 *
 * @param {string} wingTypeName - Display name
 * @param {number} totalWings - Total wings for this type
 * @param {Array} assignments - Sauce assignments for this wing type
 * @param {boolean} isNew - Whether this is a new wing type
 * @returns {string} HTML string
 */
function renderWingTypeSection(wingTypeName, totalWings, assignments, isNew = false) {
  let html = `
    <div class="breakdown-section">
      <div class="breakdown-section-header">
        └─ ${wingTypeName} (${totalWings} total)${isNew ? ' <span class="include-badge new">New</span>' : ''}
      </div>
  `;

  // Render each sauce assignment
  assignments.forEach(assignment => {
    html += renderSauceAssignment(assignment);
  });

  html += `
    </div>
  `;

  return html;
}

/**
 * Render individual sauce assignment with container calculation
 *
 * @param {Object} assignment - {sauceId, sauceName, wingCount, applicationMethod, sauceInfo}
 * @returns {string} HTML string
 */
function renderSauceAssignment(assignment) {
  const { sauceName, wingCount, applicationMethod, sauceInfo = {} } = assignment;
  const isTossed = applicationMethod === 'tossed';

  let html = `
    <div class="breakdown-item">
      • ${wingCount} wings - ${sauceName} (${isTossed ? 'tossed in sauce' : 'on the side'})
  `;

  // Add container calculation for "on the side"
  if (!isTossed) {
    const containers = calculateSideContainers(wingCount, sauceInfo);

    html += `
      <div class="breakdown-subitem">
        → <span class="container-highlight">${containers.count} × ${containers.size} containers</span>
      </div>
      <div class="breakdown-subitem breakdown-note">
        (serving ~${containers.wingsPerContainer} wings per container)
      </div>
    `;
  }

  html += `
    </div>
  `;

  return html;
}

/**
 * Render wings without sauce assignments (pending state)
 *
 * @param {Object} wingDist - Wing distribution
 * @param {Object} modifications - Modification flags
 * @returns {string} HTML string
 */
function renderWingsWithoutSauces(wingDist, modifications) {
  const totalWings = (wingDist.boneless || 0) + (wingDist.boneIn || 0) + (wingDist.cauliflower || 0);
  const isModified = modifications.wings?.isModified || false;

  return `
    <li class="include-item ${isModified ? 'modified' : ''}">
      <div class="include-header">
        <span class="include-icon">✓</span>
        <span class="include-text">
          ${totalWings} Wings Total
          (${[
            wingDist.boneless > 0 ? `${wingDist.boneless} Boneless` : null,
            wingDist.boneIn > 0 ? `${wingDist.boneIn} Bone-In` : null,
            wingDist.cauliflower > 0 ? `${wingDist.cauliflower} Cauliflower` : null
          ].filter(Boolean).join(' + ')})
        </span>
        ${isModified ? '<span class="include-badge modified">Modified</span>' : ''}
        <span class="include-badge pending">Sauces Pending</span>
      </div>
      <div class="breakdown-details">
        <div class="breakdown-note">
          Complete sauce distribution to see detailed breakdown
        </div>
      </div>
    </li>
  `;
}

/**
 * Render base wings (no customization yet)
 *
 * @param {Object} packageInfo - Package configuration
 * @returns {string} HTML string
 */
function renderBaseWings(packageInfo) {
  const defaultDist = packageInfo.wingOptions?.defaultDistribution || {};
  const totalWings = (defaultDist.boneless || 0) + (defaultDist.boneIn || 0);

  if (totalWings === 0) {
    return '';
  }

  return `
    <li class="include-item">
      <div class="include-header">
        <span class="include-icon">✓</span>
        <span class="include-text">
          ${totalWings} Wings Total
          (${[
            defaultDist.boneless > 0 ? `${defaultDist.boneless} Boneless` : null,
            defaultDist.boneIn > 0 ? `${defaultDist.boneIn} Bone-In` : null
          ].filter(Boolean).join(' + ')})
        </span>
      </div>
      <div class="breakdown-details">
        <div class="breakdown-note">
          Customize wings distribution to see detailed breakdown
        </div>
      </div>
    </li>
  `;
}

/**
 * Render dips breakdown with 5-pack bundling
 * Shows base package + changes in hybrid responsive layout
 *
 * @param {Object} packageInfo - Package configuration
 * @param {Object} currentConfig - Current user customizations
 * @param {Object} modifications - Modification flags
 * @returns {string} HTML string
 */
export function renderDipsBreakdown(packageInfo, currentConfig, modifications) {
  // Handle "No Dips" option
  if (currentConfig.noDips) {
    return `
      <li class="include-item modified">
        <div class="include-header">
          <span class="include-icon">✓</span>
          <span class="include-text">Dips skipped by customer request</span>
          <span class="include-badge modified">Modified</span>
        </div>
      </li>
    `;
  }

  // Get base package dips
  const baseDips = packageInfo.dips || {};
  const baseTotalContainers = baseDips.totalContainers || 0;
  const baseFivePacks = baseDips.fivePacksIncluded || 0;
  const baseDipTypes = baseDips.options || [];

  if (baseTotalContainers === 0) {
    return ''; // Package doesn't include dips
  }

  // Get customized dips
  const customDips = currentConfig.dips || [];
  const hasCustomizations = customDips.length > 0;

  if (!hasCustomizations) {
    // Show base package only (no customizations)
    return `
      <li class="include-item">
        <div class="include-header">
          <span class="include-icon">✓</span>
          <span class="include-text">
            Dips: ${baseFivePacks} 5-Pack${baseFivePacks > 1 ? 's' : ''} (${baseTotalContainers} containers)
          </span>
        </div>
        <div class="breakdown-details">
          <div style="margin-left: 0.5rem; color: #666;">
            • ${baseDipTypes.map(d => d.charAt(0).toUpperCase() + d.slice(1).replace('-', ' ')).join(', ')}
          </div>
        </div>
      </li>
    `;
  }

  // Show base package + customizations with hybrid layout
  const dipCalc = calculateDipContainers(customDips);
  const isModified = modifications.dips?.isModified || false;
  const delta = dipCalc.totalRequested - baseTotalContainers;

  let html = `
    <li class="include-item ${isModified ? 'modified' : ''}">
      <div class="include-header">
        <span class="include-icon">✓</span>
        <span class="include-text">Dips: ${dipCalc.totalRequested} Total Containers</span>
        ${isModified ? '<span class="include-badge modified">Modified</span>' : ''}
      </div>
      <div class="breakdown-details">
  `;

  // TIMELINE SECTION: Base Package + Changes (Mobile: stacked, Desktop: two-column)
  html += `<div class="timeline-section two-column-layout">`;

  // LEFT/TOP COLUMN: Base Package
  html += `
    <div class="timeline-column base">
      <div class="timeline-badge base">🏷️ Package Includes (Base)</div>
      <div style="margin-left: 0.5rem; color: #666;">
        <div>• ${baseFivePacks} Dip 5-Packs (${baseTotalContainers} containers)</div>
        <div style="margin-left: 0.75rem; font-size: 0.9rem; margin-top: 0.25rem;">
          ${baseDipTypes.map(d => d.charAt(0).toUpperCase() + d.slice(1).replace('-', ' ')).join(', ')}
        </div>
      </div>
    </div>
  `;

  // RIGHT/BOTTOM COLUMN: Your Changes
  html += `
    <div class="timeline-column changes">
      <div class="timeline-badge changes">🔄 Your Changes</div>
      <div style="margin-left: 0.5rem; color: #666;">
        <div style="font-weight: 600; margin-bottom: 0.5rem;">
          Changed to: ${dipCalc.packsNeeded} 5-Packs (${dipCalc.totalRequested} containers)
          ${delta !== 0 ? ` <span class="delta">(${delta > 0 ? '+' : ''}${delta})</span>` : ''}
        </div>
        <div style="margin-left: 0.75rem; font-size: 0.9rem;">
  `;

  // Show breakdown by dip type
  dipCalc.breakdown.forEach(dip => {
    html += `<div>• ${dip.quantity} ${dip.name} (${dip.size})</div>`;
  });

  // Show extras if any
  if (dipCalc.extras > 0) {
    html += `
      <div style="margin-top: 0.5rem; font-style: italic; font-size: 0.85rem;">
        Note: ${dipCalc.extras} extra container${dipCalc.extras > 1 ? 's' : ''} (sold in 5-packs)
      </div>
    `;
  }

  html += `
        </div>
      </div>
    </div>
  `;

  html += `
      </div>
    </li>
  `;

  return html;
}

/**
 * Render sides breakdown
 * Shows base package + changes in hybrid responsive layout
 *
 * @param {Object} packageInfo - Package configuration
 * @param {Object} currentConfig - Current user customizations
 * @param {Object} modifications - Modification flags
 * @returns {string} HTML string
 */
export function renderSidesBreakdown(packageInfo, currentConfig, modifications) {
  // Get base package sides
  const baseChips = packageInfo.chips || {};
  const baseColdSides = packageInfo.coldSides || [];
  const baseSalads = packageInfo.salads || [];

  const hasBaseChips = baseChips.fivePacksIncluded > 0;
  const hasBaseColdSides = baseColdSides.length > 0;
  const hasBaseSalads = baseSalads.length > 0;
  const hasAnySides = hasBaseChips || hasBaseColdSides || hasBaseSalads;

  if (!hasAnySides) {
    return ''; // Package doesn't include any sides
  }

  // Get customized sides
  const customSides = currentConfig.sides || {};
  const customChipsQty = customSides.chips?.quantity || 0;
  const customColdSides = customSides.coldSides || [];
  const customSalads = customSides.salads || [];

  const hasCustomizations = customChipsQty > 0 || customColdSides.length > 0 || customSalads.length > 0;

  if (!hasCustomizations) {
    // Show base package only (no customizations)
    let html = `
      <li class="include-item">
        <div class="include-header">
          <span class="include-icon">✓</span>
          <span class="include-text">Sides</span>
        </div>
        <div class="breakdown-details">
    `;

    // Base chips
    if (hasBaseChips) {
      const totalBags = baseChips.fivePacksIncluded * 5;
      html += `
        <div class="breakdown-item">
          • ${baseChips.fivePacksIncluded} ${baseChips.brand} 5-Pack${baseChips.fivePacksIncluded > 1 ? 's' : ''} (${totalBags} chip bags)
        </div>
      `;
    }

    // Base cold sides
    baseColdSides.forEach(side => {
      const totalServings = side.quantity * (side.serves || 0);
      html += `
        <div class="breakdown-item">
          • ${side.quantity} ${side.item} (serves ${totalServings})
        </div>
      `;
    });

    // Base salads
    baseSalads.forEach(salad => {
      const totalServings = salad.quantity * (salad.serves || 0);
      html += `
        <div class="breakdown-item">
          • ${salad.quantity} ${salad.item} (serves ${totalServings})
        </div>
      `;
    });

    html += `
        </div>
      </li>
    `;

    return html;
  }

  // Show base package + customizations with hybrid layout
  const isModified = modifications.sides?.isModified || false;

  let html = `
    <li class="include-item ${isModified ? 'modified' : ''}">
      <div class="include-header">
        <span class="include-icon">✓</span>
        <span class="include-text">Sides</span>
        ${isModified ? '<span class="include-badge modified">Modified</span>' : ''}
      </div>
      <div class="breakdown-details">
  `;

  // TIMELINE SECTION: Base Package + Changes
  html += `<div class="timeline-section two-column-layout">`;

  // LEFT/TOP COLUMN: Base Package
  html += `
    <div class="timeline-column base">
      <div class="timeline-badge base">🏷️ Package Includes (Base)</div>
      <div style="margin-left: 0.5rem; color: #666; font-size: 0.9rem;">
  `;

  if (hasBaseChips) {
    const totalBags = baseChips.fivePacksIncluded * 5;
    html += `<div>• ${baseChips.fivePacksIncluded} ${baseChips.brand} 5-Packs (${totalBags} bags)</div>`;
  }

  baseColdSides.forEach(side => {
    const totalServings = side.quantity * (side.serves || 0);
    html += `<div>• ${side.quantity} ${side.item} (serves ${totalServings})</div>`;
  });

  baseSalads.forEach(salad => {
    const totalServings = salad.quantity * (salad.serves || 0);
    html += `<div>• ${salad.quantity} ${salad.item} (serves ${totalServings})</div>`;
  });

  html += `
      </div>
    </div>
  `;

  // RIGHT/BOTTOM COLUMN: Your Changes
  html += `
    <div class="timeline-column changes">
      <div class="timeline-badge changes">🔄 Your Changes</div>
      <div style="margin-left: 0.5rem; color: #666; font-size: 0.9rem;">
  `;

  // Custom chips
  if (customChipsQty > 0) {
    const totalBags = customChipsQty * 5;
    const delta = customChipsQty - (baseChips.fivePacksIncluded || 0);
    html += `<div>• ${customChipsQty} Chip 5-Packs (${totalBags} bags) <span class="delta">(${delta > 0 ? '+' : ''}${delta})</span></div>`;
  }

  // Custom cold sides
  customColdSides.forEach(side => {
    const totalServings = side.quantity * (side.serves || 0);
    // Find matching base side to calculate delta
    const baseSide = baseColdSides.find(b => b.item === side.name);
    const delta = side.quantity - (baseSide?.quantity || 0);
    html += `<div>• ${side.quantity} ${side.name} (serves ${totalServings})`;
    if (delta !== 0) {
      html += ` <span class="delta">(${delta > 0 ? '+' : ''}${delta})</span>`;
    }
    if (!baseSide) {
      html += ` <span class="include-badge new">New</span>`;
    }
    html += `</div>`;
  });

  // Custom salads
  customSalads.forEach(salad => {
    const totalServings = salad.quantity * (salad.serves || 0);
    const baseSalad = baseSalads.find(b => b.item === salad.name);
    const delta = salad.quantity - (baseSalad?.quantity || 0);
    html += `<div>• ${salad.quantity} ${salad.name} (serves ${totalServings})`;
    if (delta !== 0) {
      html += ` <span class="delta">(${delta > 0 ? '+' : ''}${delta})</span>`;
    }
    if (!baseSalad) {
      html += ` <span class="include-badge new">New</span>`;
    }
    html += `</div>`;
  });

  html += `
      </div>
    </div>
  `;

  html += `
      </div>
    </li>
  `;

  return html;
}

/**
 * Render desserts breakdown
 * Shows base package + changes in hybrid responsive layout
 *
 * @param {Object} packageInfo - Package configuration
 * @param {Object} currentConfig - Current user customizations
 * @param {Object} modifications - Modification flags
 * @returns {string} HTML string
 */
export function renderDessertsBreakdown(packageInfo, currentConfig, modifications) {
  // Get base package desserts
  const baseDesserts = packageInfo.desserts || [];

  // Get customized desserts
  const customDesserts = currentConfig.desserts || [];

  const hasBaseDesserts = baseDesserts.length > 0;
  const hasCustomDesserts = customDesserts.length > 0;

  if (!hasBaseDesserts && !hasCustomDesserts) {
    return ''; // No desserts at all
  }

  if (!hasBaseDesserts && hasCustomDesserts) {
    // Only custom desserts (added by customer, not in base)
    const isModified = modifications.desserts?.isModified || false;

    let html = `
      <li class="include-item ${isModified ? 'modified' : ''}">
        <div class="include-header">
          <span class="include-icon">✓</span>
          <span class="include-text">Desserts</span>
          ${isModified ? '<span class="include-badge modified">Modified</span>' : ''}
          <span class="include-badge new">Added</span>
        </div>
        <div class="breakdown-details">
    `;

    customDesserts.forEach(dessert => {
      const totalServings = dessert.quantity * (dessert.servings || 0);
      html += `
        <div class="breakdown-item">
          • ${dessert.quantity} ${dessert.name} (${dessert.servings} servings each, ${totalServings} total)
        </div>
      `;
    });

    html += `
        </div>
      </li>
    `;

    return html;
  }

  if (hasBaseDesserts && !hasCustomDesserts) {
    // Show base package only (no customizations)
    let html = `
      <li class="include-item">
        <div class="include-header">
          <span class="include-icon">✓</span>
          <span class="include-text">Desserts</span>
        </div>
        <div class="breakdown-details">
    `;

    baseDesserts.forEach(dessert => {
      const totalServings = dessert.quantity * (dessert.serves || dessert.servings || 0);
      html += `
        <div class="breakdown-item">
          • ${dessert.quantity} ${dessert.item || dessert.name} (serves ${totalServings})
        </div>
      `;
    });

    html += `
        </div>
      </li>
    `;

    return html;
  }

  // Show base package + customizations with hybrid layout
  const isModified = modifications.desserts?.isModified || false;

  let html = `
    <li class="include-item ${isModified ? 'modified' : ''}">
      <div class="include-header">
        <span class="include-icon">✓</span>
        <span class="include-text">Desserts</span>
        ${isModified ? '<span class="include-badge modified">Modified</span>' : ''}
      </div>
      <div class="breakdown-details">
  `;

  // TIMELINE SECTION: Base Package + Changes
  html += `<div class="timeline-section two-column-layout">`;

  // LEFT/TOP COLUMN: Base Package
  html += `
    <div class="timeline-column base">
      <div class="timeline-badge base">🏷️ Package Includes (Base)</div>
      <div style="margin-left: 0.5rem; color: #666; font-size: 0.9rem;">
  `;

  baseDesserts.forEach(dessert => {
    const totalServings = dessert.quantity * (dessert.serves || dessert.servings || 0);
    html += `<div>• ${dessert.quantity} ${dessert.item || dessert.name} (serves ${totalServings})</div>`;
  });

  html += `
      </div>
    </div>
  `;

  // RIGHT/BOTTOM COLUMN: Your Changes
  html += `
    <div class="timeline-column changes">
      <div class="timeline-badge changes">🔄 Your Changes</div>
      <div style="margin-left: 0.5rem; color: #666; font-size: 0.9rem;">
  `;

  customDesserts.forEach(dessert => {
    const totalServings = dessert.quantity * (dessert.servings || 0);
    const baseDessert = baseDesserts.find(b => (b.item || b.name) === dessert.name);
    const delta = dessert.quantity - (baseDessert?.quantity || 0);
    html += `<div>• ${dessert.quantity} ${dessert.name} (${totalServings} servings)`;
    if (delta !== 0) {
      html += ` <span class="delta">(${delta > 0 ? '+' : ''}${delta})</span>`;
    }
    if (!baseDessert) {
      html += ` <span class="include-badge new">New</span>`;
    }
    html += `</div>`;
  });

  html += `
      </div>
    </div>
  `;

  html += `
      </div>
    </li>
  `;

  return html;
}

/**
 * Render beverages breakdown
 * Shows base package + changes in hybrid responsive layout
 *
 * @param {Object} packageInfo - Package configuration
 * @param {Object} currentConfig - Current user customizations
 * @param {Object} modifications - Modification flags
 * @returns {string} HTML string
 */
export function renderBeveragesBreakdown(packageInfo, currentConfig, modifications) {
  // Get base package beverages
  const baseBeverages = packageInfo.beverages || [];

  if (baseBeverages.length === 0) {
    return ''; // Package doesn't include beverages
  }

  // Get customized beverages
  const customBeverages = currentConfig.beverages || {};
  const customColdBevs = customBeverages.cold || [];
  const customHotBevs = customBeverages.hot || [];

  const hasCustomizations = customColdBevs.length > 0 || customHotBevs.length > 0;

  if (!hasCustomizations) {
    // Show base package only (no customizations)
    let html = `
      <li class="include-item">
        <div class="include-header">
          <span class="include-icon">✓</span>
          <span class="include-text">Beverages</span>
        </div>
        <div class="breakdown-details">
    `;

    baseBeverages.forEach(bev => {
      const options = bev.options ? ` (${bev.options.join(' or ')})` : '';
      html += `
        <div class="breakdown-item">
          • ${bev.quantity} × ${bev.item}${options}
        </div>
      `;
    });

    html += `
        </div>
      </li>
    `;

    return html;
  }

  // Show base package + customizations with hybrid layout
  const isModified = modifications.beverages?.isModified || false;

  let html = `
    <li class="include-item ${isModified ? 'modified' : ''}">
      <div class="include-header">
        <span class="include-icon">✓</span>
        <span class="include-text">Beverages</span>
        ${isModified ? '<span class="include-badge modified">Modified</span>' : ''}
      </div>
      <div class="breakdown-details">
  `;

  // TIMELINE SECTION: Base Package + Changes
  html += `<div class="timeline-section two-column-layout">`;

  // LEFT/TOP COLUMN: Base Package
  html += `
    <div class="timeline-column base">
      <div class="timeline-badge base">🏷️ Package Includes (Base)</div>
      <div style="margin-left: 0.5rem; color: #666; font-size: 0.9rem;">
  `;

  baseBeverages.forEach(bev => {
    const options = bev.options ? ` (${bev.options.join(' or ')})` : '';
    html += `<div>• ${bev.quantity} × ${bev.item}${options}</div>`;
  });

  html += `
      </div>
    </div>
  `;

  // RIGHT/BOTTOM COLUMN: Your Changes
  html += `
    <div class="timeline-column changes">
      <div class="timeline-badge changes">🔄 Your Changes</div>
      <div style="margin-left: 0.5rem; color: #666; font-size: 0.9rem;">
  `;

  // Custom cold beverages
  if (customColdBevs.length > 0) {
    html += `<div style="font-weight: 600; margin-bottom: 0.25rem;">Cold Beverages:</div>`;
    customColdBevs.forEach(bev => {
      const baseBev = baseBeverages.find(b => b.item === bev.name);
      const delta = bev.quantity - (baseBev?.quantity || 0);
      html += `<div style="margin-left: 0.5rem;">• ${bev.quantity} ${bev.name} (${bev.size}, serves ${bev.serves})`;
      if (delta !== 0) {
        html += ` <span class="delta">(${delta > 0 ? '+' : ''}${delta})</span>`;
      }
      if (!baseBev) {
        html += ` <span class="include-badge new">New</span>`;
      }
      html += `</div>`;
    });
  }

  // Custom hot beverages
  if (customHotBevs.length > 0) {
    html += `<div style="font-weight: 600; margin-bottom: 0.25rem; ${customColdBevs.length > 0 ? 'margin-top: 0.5rem;' : ''}">Hot Beverages:</div>`;
    customHotBevs.forEach(bev => {
      const baseBev = baseBeverages.find(b => b.item === bev.name);
      const delta = bev.quantity - (baseBev?.quantity || 0);
      html += `<div style="margin-left: 0.5rem;">• ${bev.quantity} ${bev.name} (${bev.size}, serves ${bev.serves})`;
      if (delta !== 0) {
        html += ` <span class="delta">(${delta > 0 ? '+' : ''}${delta})</span>`;
      }
      if (!baseBev) {
        html += ` <span class="include-badge new">New</span>`;
      }
      html += `</div>`;
    });
  }

  html += `
      </div>
    </div>
  `;

  html += `
      </div>
    </li>
  `;

  return html;
}

/**
 * Render supplies (static, no customization)
 *
 * @param {Object} packageInfo - Package configuration
 * @returns {string} HTML string
 */
export function renderSuppliesBreakdown(packageInfo) {
  return `
    <li class="include-item">
      <div class="include-header">
        <span class="include-icon">✓</span>
        <span class="include-text">Complete serving supplies (plates, napkins, utensils, wet wipes)</span>
      </div>
    </li>
  `;
}

/**
 * ADAPTER FUNCTION (Phase 1 - TEMPORARY)
 * Adapts legacy sauceDistributions format to sauceAssignments format
 *
 * This allows the renderer to work with both old and new data structures
 * during the transition period.
 *
 * TODO: Remove this function in Phase 2 when all data is migrated to sauceAssignments
 *
 * @param {Object} sauceDistributions - Legacy sauce distributions {boneless: [], boneIn: [], cauliflower: []}
 * @returns {Object} Adapted sauceAssignments structure
 */
function adaptLegacySauceDistributions(sauceDistributions) {
  const adapted = {
    selectedSauces: [],
    appliedPreset: null,
    assignments: {
      boneless: [],
      boneIn: [],
      cauliflower: []
    },
    summary: { totalWingsAssigned: 0, byApplicationMethod: {}, containersNeeded: 0 }
  };

  // Adapt each wing type's distributions
  ['boneless', 'boneIn', 'cauliflower'].forEach(wingType => {
    const distributions = sauceDistributions[wingType] || [];

    adapted.assignments[wingType] = distributions.map(item => ({
      sauceId: item.sauceId,
      sauceName: item.sauceName || 'Unknown Sauce',  // May be missing in old format
      sauceCategory: item.sauceCategory || 'signature-sauce',
      wingCount: item.quantity || 0,
      applicationMethod: item.application === 'side' ? 'on-the-side' : 'tossed',
      sauceInfo: item.sauceInfo || {
        isDryRub: false,
        viscosity: 'thin',
        category: 'signature-sauce'
      }
    }));
  });

  return adapted;
}
