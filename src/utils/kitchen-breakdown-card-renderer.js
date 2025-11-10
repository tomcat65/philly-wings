/**
 * Kitchen Breakdown Card Renderer - Approach 2: Compact Card Grid
 *
 * Renders order summary as interactive cards in a responsive grid.
 * Each category gets its own card showing base package + customizations.
 *
 * @module kitchen-breakdown-card-renderer
 * @created 2025-11-05
 */

/**
 * Get icon emoji for category
 */
function getCategoryIcon(category) {
  const icons = {
    wings: '🍗',
    dips: '🥣',
    sides: '🍟',
    desserts: '🍰',
    beverages: '🧃'
  };
  return icons[category] || '✓';
}

/**
 * Render Wings Card
 */
export function renderWingsCard(packageInfo, currentConfig, modifications) {
  const wingDist = currentConfig.wingDistribution || {};
  const totalWings = (wingDist.boneless || 0) + (wingDist.boneIn || 0) + (wingDist.cauliflower || 0);

  if (totalWings === 0) return '';

  const defaultDist = packageInfo?.wingOptions?.defaultDistribution || {};
  const bonelessDelta = (wingDist.boneless || 0) - (defaultDist.boneless || 0);
  const boneInDelta = (wingDist.boneIn || 0) - (defaultDist.boneIn || 0);
  const cauliflowerDelta = wingDist.cauliflower || 0;

  const isModified = modifications.wings?.isModified || false;
  const sauceAssignments = currentConfig.sauceAssignments || {};
  const hasSauces = Object.values(sauceAssignments.assignments || {}).some(arr => arr && arr.length > 0);

  let html = `
    <div class="category-card ${isModified ? 'modified' : ''}">
      <div class="card-header-section">
        <div class="card-icon">${getCategoryIcon('wings')}</div>
        <div class="card-title-group">
          <h3 class="card-title">Wings</h3>
          <div class="card-subtitle">${totalWings} total wings</div>
        </div>
      </div>
      <div class="card-content">
        <div><strong>Base:</strong> ${defaultDist.boneless || 0} Boneless + ${defaultDist.boneIn || 0} Bone-In</div>
  `;

  if (isModified) {
    html += `
        <div class="card-section">
          <div class="card-section-title">Changed to:</div>
          ${wingDist.boneless > 0 ? `<div class="card-item">• ${wingDist.boneless} Boneless${bonelessDelta !== 0 ? ` <span class="card-delta-badge ${bonelessDelta > 0 ? 'positive' : 'negative'}">${bonelessDelta > 0 ? '+' : ''}${bonelessDelta}</span>` : ''}</div>` : ''}
          ${wingDist.boneIn > 0 ? `<div class="card-item">• ${wingDist.boneIn} Bone-In${boneInDelta !== 0 ? ` <span class="card-delta-badge ${boneInDelta > 0 ? 'positive' : 'negative'}">${boneInDelta > 0 ? '+' : ''}${boneInDelta}</span>` : ''}</div>` : ''}
          ${wingDist.cauliflower > 0 ? `<div class="card-item">• ${wingDist.cauliflower} Cauliflower <span class="card-delta-badge positive">+${cauliflowerDelta}</span></div>` : ''}
        </div>
    `;
  }

  if (hasSauces) {
    html += `
        <div class="card-status-box ${isModified ? 'modified' : ''}">
          ✓ Sauces assigned to all wing types
        </div>
    `;
  }

  html += `
      </div>
    </div>
  `;

  return html;
}

/**
 * Render Dips Card
 */
export function renderDipsCard(packageInfo, currentConfig, modifications) {
  const baseDips = packageInfo.dips || {};
  const baseTotalContainers = baseDips.totalContainers || 0;
  const baseFivePacks = baseDips.fivePacksIncluded || 0;
  const baseDipTypes = baseDips.options || [];

  if (baseTotalContainers === 0) return '';

  const customDips = currentConfig.dips || [];
  const hasCustomizations = customDips.length > 0;
  const isModified = modifications.dips?.isModified || false;

  let html = `
    <div class="category-card ${isModified ? 'modified' : ''}">
      <div class="card-header-section">
        <div class="card-icon">${getCategoryIcon('dips')}</div>
        <div class="card-title-group">
          <h3 class="card-title">Dips</h3>
          <div class="card-subtitle">${baseFivePacks} five-packs (${baseTotalContainers} containers)</div>
        </div>
      </div>
      <div class="card-content">
        <div><strong>Base:</strong> ${baseDipTypes.map(d => d.charAt(0).toUpperCase() + d.slice(1).replace('-', ' ')).join(', ')}</div>
  `;

  if (!hasCustomizations) {
    html += `
        <div class="card-status-box">
          ✓ No changes - using base package
        </div>
    `;
  } else {
    // Show customized dips
    html += `
        <div class="card-section">
          <div class="card-section-title">Your Selection:</div>
    `;
    customDips.forEach(dip => {
      html += `<div class="card-item">• ${dip.quantity} ${dip.name}</div>`;
    });
    html += `
        </div>
    `;
  }

  html += `
      </div>
    </div>
  `;

  return html;
}

/**
 * Render Sides Card
 */
export function renderSidesCard(packageInfo, currentConfig, modifications) {
  const baseChips = packageInfo.chips || {};
  const baseColdSides = packageInfo.coldSides || [];
  const baseSalads = packageInfo.salads || [];

  const hasBaseChips = baseChips.fivePacksIncluded > 0;
  const hasBaseColdSides = baseColdSides.length > 0;
  const hasBaseSalads = baseSalads.length > 0;

  if (!hasBaseChips && !hasBaseColdSides && !hasBaseSalads) return '';

  const customSides = currentConfig.sides || {};
  const hasCustomizations = (customSides.chips?.quantity || 0) > 0 || (customSides.coldSides || []).length > 0 || (customSides.salads || []).length > 0;
  const isModified = modifications.sides?.isModified || false;

  // Count total items
  let totalItems = 0;
  if (hasBaseChips) totalItems++;
  totalItems += baseColdSides.length + baseSalads.length;

  let html = `
    <div class="category-card ${isModified ? 'modified' : ''}">
      <div class="card-header-section">
        <div class="card-icon">${getCategoryIcon('sides')}</div>
        <div class="card-title-group">
          <h3 class="card-title">Sides</h3>
          <div class="card-subtitle">${totalItems} items</div>
        </div>
      </div>
      <div class="card-content">
        <div><strong>Includes:</strong></div>
  `;

  if (hasBaseChips) {
    const totalBags = baseChips.fivePacksIncluded * 5;
    html += `<div class="card-item">• ${baseChips.fivePacksIncluded} Chip 5-Packs (${totalBags} bags)</div>`;
  }

  baseColdSides.forEach(side => {
    const totalServings = side.quantity * (side.serves || 0);
    html += `<div class="card-item">• ${side.quantity} ${side.item} (serves ${totalServings})</div>`;
  });

  baseSalads.forEach(salad => {
    const totalServings = salad.quantity * (salad.serves || 0);
    html += `<div class="card-item">• ${salad.quantity} ${salad.item} (serves ${totalServings})</div>`;
  });

  if (!hasCustomizations) {
    html += `
        <div class="card-status-box">
          ✓ No changes - using base package
        </div>
    `;
  }

  html += `
      </div>
    </div>
  `;

  return html;
}

/**
 * Render Beverages Card
 */
export function renderBeveragesCard(packageInfo, currentConfig, modifications) {
  const baseBeverages = packageInfo.beverages || [];

  if (baseBeverages.length === 0) return '';

  const customBeverages = currentConfig.beverages || {};
  const hasCustomizations = (customBeverages.cold || []).length > 0 || (customBeverages.hot || []).length > 0;
  const isModified = modifications.beverages?.isModified || false;

  let html = `
    <div class="category-card ${isModified ? 'modified' : ''}">
      <div class="card-header-section">
        <div class="card-icon">${getCategoryIcon('beverages')}</div>
        <div class="card-title-group">
          <h3 class="card-title">Beverages</h3>
          <div class="card-subtitle">${baseBeverages.length} item${baseBeverages.length > 1 ? 's' : ''}</div>
        </div>
      </div>
      <div class="card-content">
  `;

  baseBeverages.forEach(bev => {
    const options = bev.options ? ` (${bev.options.join(' or ')})` : '';
    html += `<div class="card-item">• ${bev.quantity} × ${bev.item}${options}</div>`;
  });

  if (!hasCustomizations) {
    html += `
        <div class="card-status-box">
          ✓ No changes - using base package
        </div>
    `;
  }

  html += `
      </div>
    </div>
  `;

  return html;
}

/**
 * Render Desserts Card (if package includes desserts)
 */
export function renderDessertsCard(packageInfo, currentConfig, modifications) {
  const baseDesserts = packageInfo.desserts || [];
  const customDesserts = currentConfig.desserts || [];

  const hasBaseDesserts = baseDesserts.length > 0;
  const hasCustomDesserts = customDesserts.length > 0;

  if (!hasBaseDesserts && !hasCustomDesserts) return '';

  const isModified = modifications.desserts?.isModified || false;

  let html = `
    <div class="category-card ${isModified ? 'modified' : ''}">
      <div class="card-header-section">
        <div class="card-icon">${getCategoryIcon('desserts')}</div>
        <div class="card-title-group">
          <h3 class="card-title">Desserts</h3>
          <div class="card-subtitle">${hasBaseDesserts ? baseDesserts.length : customDesserts.length} item${(hasBaseDesserts ? baseDesserts.length : customDesserts.length) > 1 ? 's' : ''}</div>
        </div>
      </div>
      <div class="card-content">
  `;

  if (hasBaseDesserts) {
    baseDesserts.forEach(dessert => {
      const totalServings = dessert.quantity * (dessert.serves || dessert.servings || 0);
      html += `<div class="card-item">• ${dessert.quantity} ${dessert.item || dessert.name} (serves ${totalServings})</div>`;
    });

    if (!hasCustomDesserts) {
      html += `
        <div class="card-status-box">
          ✓ No changes - using base package
        </div>
      `;
    }
  } else if (hasCustomDesserts) {
    customDesserts.forEach(dessert => {
      const totalServings = dessert.quantity * (dessert.servings || 0);
      html += `<div class="card-item">• ${dessert.quantity} ${dessert.name} (${totalServings} servings)</div>`;
    });
  }

  html += `
      </div>
    </div>
  `;

  return html;
}

/**
 * Render complete card grid with all categories
 */
export function renderCardGrid(packageInfo, currentConfig, modifications, pricing) {
  const cards = [
    renderWingsCard(packageInfo, currentConfig, modifications),
    renderDipsCard(packageInfo, currentConfig, modifications),
    renderSidesCard(packageInfo, currentConfig, modifications),
    renderBeveragesCard(packageInfo, currentConfig, modifications),
    renderDessertsCard(packageInfo, currentConfig, modifications)
  ].filter(Boolean);

  let html = `<div class="order-summary-card-grid">`;
  html += cards.join('');
  html += `</div>`;

  // Add footer with totals
  const subtotal = pricing?.totals?.subtotal || '$0.00';
  const servesMin = packageInfo?.servesMin || 0;
  const servesMax = packageInfo?.servesMax || 0;

  html += `
    <div class="order-summary-footer">
      <div class="summary-footer-item">
        <div class="summary-footer-label">Order Total</div>
        <div class="summary-footer-value">${subtotal}</div>
      </div>
      <div class="summary-footer-item">
        <div class="summary-footer-label">Serves</div>
        <div class="summary-footer-value">${servesMin}-${servesMax}</div>
      </div>
    </div>
  `;

  return html;
}
