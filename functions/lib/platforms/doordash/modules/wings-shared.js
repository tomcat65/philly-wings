/**
 * Wings Shared Orchestrators
 * Phase 1: Provide separate entry points for boneless and bone-in flows
 * without duplicating the internal modal logic yet. This keeps behavior
 * stable while we migrate logic into dedicated flow modules.
 */

function generateWingsSharedJS() {
  return `
    // ==============================================
    // FLOW ENTRY POINTS - PHASE 2 ORCHESTRATORS
    // ==============================================
    window.openBonelessWingModal = function(wingsData) {
      // Use new boneless orchestrator if available, fallback to legacy
      if (typeof window.openBonelessWingModal_v2 === 'function') {
        window.openBonelessWingModal_v2(wingsData);
      } else if (typeof window.openWingModal === 'function') {
        window.openWingModal('boneless', wingsData);
      } else {
        console.warn('No boneless wing modal implementation available');
      }
    };

    window.openBoneInWingModal = function(wingsData) {
      // Use new bone-in orchestrator if available, fallback to legacy
      if (typeof window.openBoneInWingModal_v2 === 'function') {
        window.openBoneInWingModal_v2(wingsData);
      } else if (typeof window.openWingModal === 'function') {
        window.openWingModal('bone-in', wingsData);
      } else {
        console.warn('No bone-in wing modal implementation available');
      }
    };

    // ==============================================
    // SHARED STATE UTILS
    // ==============================================
    window.ensureWingGlobals = function() {
      window.selectedSauces = window.selectedSauces || [];
      window.wingAllocation = window.wingAllocation || {}; // { sauceId: qty }
      window.saucePreferences = window.saucePreferences || {}; // { sauceId: { onSide: boolean } }
      window.selectedIncludedDips = window.selectedIncludedDips || {}; // { dipId: qty }
      window.selectedExtraDips = window.selectedExtraDips || {}; // { dipId: qty }
    };

    // Get DOM container by id or element
    window.getContainerEl = function(container) {
      if (!container) return null;
      if (typeof container === 'string') return document.getElementById(container) || document.querySelector(container);
      return container;
    }

    // ==============================================
    // SHARED HELPERS (Phase 2)
    // ==============================================
    window.formatDipName = function(id) {
      const allSauces = (window.strategicMenu && strategicMenu.sauces) || window.firestoreSauces || [];
      const dip = (allSauces || []).find(s => s.id === id);
      if (dip && dip.name) return dip.name;
      return String(id || '').replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    };

    // Calculate totals from current state (or overrides)
    window.calcTotals = function(opts = {}) {
      const variant = opts.variant || window.selectedWingVariant || null;
      const base = variant ? (variant.platformPrice || variant.basePrice || 0) : 0;
      const type = (opts.type || window.currentWingType || 'boneless');
      const style = (type === 'bone-in') ? (opts.wingStyle || window.selectedWingStyle || 'regular') : 'n/a';
      const styleUpcharge = (type === 'bone-in' && style !== 'regular') ? 1.50 : 0;
      const extraDipsTotal = Object.values(opts.extraDips || window.selectedExtraDips || {}).reduce((s, q) => s + (q * 0.75), 0);
      return {
        base,
        wingStyleUpcharge: styleUpcharge,
        extraDips: extraDipsTotal,
        total: base + styleUpcharge + extraDipsTotal
      };
    };

    // Allocation helpers for 6-wing units
    window.equalSplitBy6 = function(sauceIds) {
      window.ensureWingGlobals();
      const ids = Array.isArray(sauceIds) ? sauceIds : (window.selectedSauces || []);
      if (!window.selectedWingVariant || !window.selectedWingVariant.count || !ids.length) return;
      const total = window.selectedWingVariant.count;
      const units = Math.floor(total / 6);
      if (units <= 0) return;
      const per = Math.floor(units / ids.length);
      const remainder = units - (per * ids.length);
      const allocation = {};
      ids.forEach((id, idx) => {
        const extra = idx < remainder ? 1 : 0;
        allocation[id] = (per + extra) * 6;
      });
      window.wingAllocation = allocation;
    };

    window.validateAllocationBy6 = function() {
      window.ensureWingGlobals();
      const errs = [];
      const variant = window.selectedWingVariant;
      if (!variant || !variant.count) return { valid: true, errors: [] };
      const total = variant.count;
      const sum = Object.values(window.wingAllocation || {}).reduce((s, n) => s + (Number(n) || 0), 0);
      if (sum !== total) errs.push('Allocation total does not match wing count');
      for (const [id, qty] of Object.entries(window.wingAllocation || {})) {
        if ((Number(qty) || 0) % 6 !== 0) errs.push('Allocation for ' + id + ' must be in multiples of 6');
      }
      return { valid: errs.length === 0, errors: errs };
    };

    // Sauce on-the-side preference toggle
    window.toggleSauceOnSide = function(sauceId, value) {
      window.ensureWingGlobals();
      if (!sauceId) return;
      window.saucePreferences[sauceId] = window.saucePreferences[sauceId] || {};
      window.saucePreferences[sauceId].onSide = (typeof value === 'boolean') ? value : !window.saucePreferences[sauceId].onSide;
    };

    // Summary gating utility (orchestrators can decide when to render)
    window.shouldShowSummary = function(stepIndex, totalSteps) {
      return Number(stepIndex) === Number(totalSteps);
    };

    // Build payload from current modal state (relies on shared global vars declared by wings modal)
    window.buildWingOrderPayload = function() {
      try {
        const saucesList = (window.selectedSauces || []).map(id => {
          const sauce = ((window.strategicMenu && strategicMenu.sauces) || window.firestoreSauces || []).find(s => s.id === id) || { id };
          const allocation = (window.selectedWingVariant && selectedSauces.length > 1)
            ? (window.wingAllocation ? (wingAllocation[id] || 0) : 0)
            : (window.selectedWingVariant ? selectedWingVariant.count : 0);
          return { id, name: sauce.name || id, onSide: !!(window.saucePreferences && saucePreferences[id] && saucePreferences[id].onSide), allocation };
        });

        const included = Object.entries(window.selectedIncludedDips || {})
          .filter(([id, qty]) => id !== 'no-dip' && qty > 0)
          .map(([id, qty]) => ({ id, name: window.formatDipName(id), qty }));

        const extras = Object.entries(window.selectedExtraDips || {})
          .map(([id, qty]) => ({ id, name: window.formatDipName(id), qty, unitPrice: 0.75 }));

        const base = window.selectedWingVariant ? (selectedWingVariant.platformPrice || selectedWingVariant.basePrice || 0) : 0;
        const styleUpcharge = (window.currentWingType === 'bone-in' && window.selectedWingStyle !== 'regular') ? 1.50 : 0;
        const extraDipsTotal = Object.values(window.selectedExtraDips || {}).reduce((s, q) => s + q * 0.75, 0);

        return {
          type: window.currentWingType || 'boneless',
          variant: window.selectedWingVariant ? {
            id: selectedWingVariant.id,
            name: selectedWingVariant.name,
            count: selectedWingVariant.count,
            basePrice: selectedWingVariant.basePrice,
            platformPrice: selectedWingVariant.platformPrice
          } : null,
          wingStyle: window.currentWingType === 'bone-in' ? (window.selectedWingStyle || 'regular') : 'n/a',
          sauces: saucesList,
          includedDips: included,
          extraDips: extras,
          totals: { base, wingStyleUpcharge: styleUpcharge, extraDips: extraDipsTotal, total: base + styleUpcharge + extraDipsTotal },
          timestamp: new Date().toISOString()
        };
      } catch (e) {
        console.error('buildWingOrderPayload failed', e);
        return null;
      }
    };

    window.addWingOrderToCart = function() {
      const payload = window.buildWingOrderPayload();
      if (payload) {
        console.log('🧾 Wing order payload:', payload);
        // TODO: Replace with real cart integration
      }
      if (typeof window.closeWingModal === 'function') window.closeWingModal();
    };

    // ==============================================
    // SHARED RENDERERS (Phase 2)
    // Note: These renderers are not auto-wired into the legacy modal.
    // Orchestrators should call them and manage step transitions.
    // ==============================================

    // Render size/variant options
    window.renderSizeOptions = function(container, opts = {}) {
      window.ensureWingGlobals();
      const el = window.getContainerEl(container);
      if (!el) return;
      const variants = (opts.variants) || ((window.strategicMenu && strategicMenu.wings && strategicMenu.wings.variants) ? strategicMenu.wings.variants : []);
      if (!Array.isArray(variants)) { el.innerHTML = '<p>No wing sizes available.</p>'; return; }
      el.innerHTML = variants.map(v => {
        const price = (v.platformPrice != null ? v.platformPrice : v.basePrice) || 0;
        return '<button class="wing-size" data-id="' + v.id + '">' +
          '<div class="wing-size-name">' + (v.name || (v.count + ' Wings')) + '</div>' +
          '<div class="wing-size-meta">' + (v.count || '') + ' — $' + price.toFixed(2) + '</div>' +
          '</button>';
      }).join('');
      el.querySelectorAll('button.wing-size').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          const v = variants.find(x => String(x.id) === String(id));
          if (v) {
            window.selectedWingVariant = v;
            // Reset allocations when size changes
            window.wingAllocation = {};
          }
          if (typeof opts.onSelect === 'function') opts.onSelect(v);
        });
      });
    };

    // Categorize sauces into two columns (dry rubs vs signature) with fallbacks
    window.renderSauceOptions = function(container, opts = {}) {
      window.ensureWingGlobals();
      const el = window.getContainerEl(container);
      if (!el) return;
      const sauces = (opts.sauces) || ((window.strategicMenu && strategicMenu.sauces) || window.firestoreSauces || []);
      const isDry = s => (s.category === 'dry-rub') || (s.type === 'dry') || /rub/i.test(s.name || '');
      const dry = sauces.filter(isDry);
      const wet = sauces.filter(s => !isDry(s));
      const card = function(s) {
        const heatIcons = (s.heat || 0) > 0 ? '🌶️'.repeat(Math.min(3, s.heat)) : '🚫🌶️';
        return (
          '<div class="sauce-card" data-id="' + s.id + '">' +
            '<div class="sauce-name">' + (s.name || s.id) + '</div>' +
            '<div class="sauce-heat">' + heatIcons + '</div>' +
            '<div class="sauce-actions">' +
              '<button class="sauce-pick">Select</button>' +
              '<label class="on-side"><input type="checkbox" class="sauce-on-side"> On the side</label>' +
            '</div>' +
          '</div>'
        );
      };
      el.innerHTML = (
        '<div class="sauce-columns">' +
          '<div class="col dry">' +
            '<h4>Dry Rubs</h4>' +
            dry.map(card).join('') +
          '</div>' +
          '<div class="col wet">' +
            '<h4>Signature Sauces</h4>' +
            wet.map(card).join('') +
          '</div>' +
        '</div>'
      );
      el.querySelectorAll('.sauce-card').forEach(node => {
        const id = node.getAttribute('data-id');
        node.querySelector('.sauce-pick')?.addEventListener('click', () => {
          if (!window.selectedSauces.includes(id)) window.selectedSauces.push(id);
          if (typeof opts.onSelect === 'function') opts.onSelect(id);
        });
        node.querySelector('.sauce-on-side')?.addEventListener('change', (e) => {
          window.toggleSauceOnSide(id, !!e.target.checked);
          if (typeof opts.onToggleOnSide === 'function') opts.onToggleOnSide(id, !!e.target.checked);
        });
      });
    };

    // Included dips selector (with "No Dip")
    window.renderIncludedDips = function(container, opts = {}) {
      window.ensureWingGlobals();
      const el = window.getContainerEl(container);
      if (!el) return;
      const dips = (opts.dips) || ((window.strategicMenu && strategicMenu.sauces) || window.firestoreSauces || []);
      const maxIncluded = Number(opts.maxIncluded || 1);
      const item = function(d) {
        return (
          '<div class="dip-row" data-id="' + d.id + '">' +
            '<span class="dip-name">' + (d.name || d.id) + '</span>' +
            '<div class="dip-qty">' +
              '<button class="dec">-</button>' +
              '<span class="qty">' + (window.selectedIncludedDips[d.id] || 0) + '</span>' +
              '<button class="inc">+</button>' +
            '</div>' +
          '</div>'
        );
      };
      el.innerHTML = (
        '<div class="dip-list">' +
          '<label class="no-dip"><input type="checkbox" id="no-dip-checkbox"> No Dip</label>' +
          dips.map(item).join('') +
        '</div>'
      );
      const total = () => Object.values(window.selectedIncludedDips).reduce((s, n) => s + (Number(n) || 0), 0);
      el.querySelector('#no-dip-checkbox')?.addEventListener('change', (e) => {
        if (e.target.checked) {
          window.selectedIncludedDips = { 'no-dip': 1 };
          el.querySelectorAll('.qty').forEach(q => q.textContent = '0');
        } else {
          delete window.selectedIncludedDips['no-dip'];
        }
        if (typeof opts.onChange === 'function') opts.onChange(window.selectedIncludedDips);
      });
      el.querySelectorAll('.dip-row').forEach(row => {
        const id = row.getAttribute('data-id');
        row.querySelector('.dec')?.addEventListener('click', () => {
          if (window.selectedIncludedDips['no-dip']) return; // locked
          const cur = Number(window.selectedIncludedDips[id] || 0);
          window.selectedIncludedDips[id] = Math.max(0, cur - 1);
          row.querySelector('.qty').textContent = String(window.selectedIncludedDips[id]);
          if (typeof opts.onChange === 'function') opts.onChange(window.selectedIncludedDips);
        });
        row.querySelector('.inc')?.addEventListener('click', () => {
          if (window.selectedIncludedDips['no-dip']) return; // locked
          if (total() >= maxIncluded) return;
          const cur = Number(window.selectedIncludedDips[id] || 0);
          window.selectedIncludedDips[id] = cur + 1;
          row.querySelector('.qty').textContent = String(window.selectedIncludedDips[id]);
          if (typeof opts.onChange === 'function') opts.onChange(window.selectedIncludedDips);
        });
      });
    };

    // Extra dips (priced, unlimited)
    window.renderExtraDips = function(container, opts = {}) {
      window.ensureWingGlobals();
      const el = window.getContainerEl(container);
      if (!el) return;
      const dips = (opts.dips) || ((window.strategicMenu && strategicMenu.sauces) || window.firestoreSauces || []);
      const price = Number(opts.unitPrice || 0.75);
      const item = function(d) {
        return (
          '<div class="dip-row" data-id="' + d.id + '">' +
            '<span class="dip-name">' + (d.name || d.id) + '</span>' +
            '<span class="dip-price">$' + price.toFixed(2) + '</span>' +
            '<div class="dip-qty">' +
              '<button class="dec">-</button>' +
              '<span class="qty">' + (window.selectedExtraDips[d.id] || 0) + '</span>' +
              '<button class="inc">+</button>' +
            '</div>' +
          '</div>'
        );
      };
      el.innerHTML = '<div class="dip-list">' + dips.map(item).join('') + '</div>';
      el.querySelectorAll('.dip-row').forEach(row => {
        const id = row.getAttribute('data-id');
        row.querySelector('.dec')?.addEventListener('click', () => {
          const cur = Number(window.selectedExtraDips[id] || 0);
          window.selectedExtraDips[id] = Math.max(0, cur - 1);
          row.querySelector('.qty').textContent = String(window.selectedExtraDips[id]);
          if (typeof opts.onChange === 'function') opts.onChange(window.selectedExtraDips);
        });
        row.querySelector('.inc')?.addEventListener('click', () => {
          const cur = Number(window.selectedExtraDips[id] || 0);
          window.selectedExtraDips[id] = cur + 1;
          row.querySelector('.qty').textContent = String(window.selectedExtraDips[id]);
          if (typeof opts.onChange === 'function') opts.onChange(window.selectedExtraDips);
        });
      });
    };

    // Order summary (read-only; orchestrators control when to enable Add-to-Cart)
    window.renderSummary = function(container, opts = {}) {
      window.ensureWingGlobals();
      const el = window.getContainerEl(container);
      if (!el) return;
      const payload = window.buildWingOrderPayload();
      if (!payload) { el.innerHTML = '<p>Nothing selected yet.</p>'; return; }
      const saucesHtml = (payload.sauces || []).map(function(s){
        const side = s.onSide ? ' (on the side)' : '';
        const alloc = s.allocation ? (' — ' + s.allocation) : '';
        return '<li>' + s.name + side + alloc + '</li>';
      }).join('');
      const includedHtml = (payload.includedDips || []).map(function(d){ return '<li>' + d.name + ' × ' + d.qty + '</li>'; }).join('');
      const extrasHtml = (payload.extraDips || []).map(function(d){ return '<li>' + d.name + ' × ' + d.qty + '</li>'; }).join('');
      const t = payload.totals || window.calcTotals();
      el.innerHTML = (
        '<div class="order-summary">' +
          '<div class="summary-line"><strong>Type:</strong> ' + payload.type + '</div>' +
          '<div class="summary-line"><strong>Variant:</strong> ' + (payload.variant ? payload.variant.name : 'n/a') + '</div>' +
          '<div class="summary-line"><strong>Wing Style:</strong> ' + payload.wingStyle + '</div>' +
          '<div class="summary-block"><strong>Sauces:</strong><ul>' + (saucesHtml || '<li>None</li>') + '</ul></div>' +
          '<div class="summary-block"><strong>Included Dips:</strong><ul>' + (includedHtml || '<li>None</li>') + '</ul></div>' +
          '<div class="summary-block"><strong>Extra Dips:</strong><ul>' + (extrasHtml || '<li>None</li>') + '</ul></div>' +
          '<div class="totals">' +
            '<div>Base: $' + ((t.base || 0).toFixed(2)) + '</div>' +
            (t.wingStyleUpcharge ? ('<div>Style Upcharge: $' + t.wingStyleUpcharge.toFixed(2) + '</div>') : '') +
            (t.extraDips ? ('<div>Extra Dips: $' + t.extraDips.toFixed(2) + '</div>') : '') +
            '<div class="total"><strong>Total: $' + ((t.total || 0).toFixed(2)) + '</strong></div>' +
          '</div>' +
          '<div class="actions">' +
            '<button id="add-to-cart" ' + (opts.enableAddToCart ? '' : 'disabled') + '>Add to Cart</button>' +
          '</div>' +
        '</div>'
      );
      const btn = el.querySelector('#add-to-cart');
      if (btn) btn.addEventListener('click', () => window.addWingOrderToCart());
    };
  `;
}

module.exports = {
  generateWingsSharedJS
};
