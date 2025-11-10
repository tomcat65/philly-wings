/**
 * Pricing DevTools Panel - Development Tools Integration
 *
 * Provides real-time debugging panel for pricing calculations:
 * - Live log streaming
 * - Performance metrics visualization
 * - Data structure inspection
 * - Export capabilities
 *
 * @module pricing-devtools
 * @created 2025-10-31
 * @epic SP-PRICING-001
 * @story S1-Foundation
 */

import pricingLogger from './pricing-logger.js';

/**
 * DevTools panel state
 */
let devToolsState = {
  isOpen: false,
  isPinned: false,
  position: { x: 20, y: 20 },
  size: { width: 400, height: 600 },
  activeTab: 'logs',
  unsubscribe: null
};

/**
 * Initialize DevTools panel
 * Only available in development mode
 */
export function initDevTools() {
  // Only enable in development
  if (process.env.NODE_ENV === 'production') {
    return;
  }

  // Add keyboard shortcut (Ctrl+Shift+P)
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'P') {
      e.preventDefault();
      toggleDevTools();
    }
  });

  pricingLogger.info('DevTools initialized', {
    shortcut: 'Ctrl+Shift+P',
    enabled: true
  });
}

/**
 * Toggle DevTools panel visibility
 */
export function toggleDevTools() {
  if (devToolsState.isOpen) {
    closeDevTools();
  } else {
    openDevTools();
  }
}

/**
 * Open DevTools panel
 */
export function openDevTools() {
  if (devToolsState.isOpen) return;

  const panel = createDevToolsPanel();
  document.body.appendChild(panel);

  // Subscribe to logger
  devToolsState.unsubscribe = pricingLogger.subscribe((entry) => {
    addLogEntry(entry);
  });

  devToolsState.isOpen = true;
  pricingLogger.info('DevTools panel opened');
}

/**
 * Close DevTools panel
 */
export function closeDevTools() {
  const panel = document.getElementById('pricing-devtools');
  if (panel) {
    panel.remove();
  }

  // Unsubscribe from logger
  if (devToolsState.unsubscribe) {
    devToolsState.unsubscribe();
    devToolsState.unsubscribe = null;
  }

  devToolsState.isOpen = false;
  pricingLogger.info('DevTools panel closed');
}

/**
 * Create DevTools panel HTML
 * @returns {HTMLElement} DevTools panel element
 */
function createDevToolsPanel() {
  const panel = document.createElement('div');
  panel.id = 'pricing-devtools';
  panel.className = 'pricing-devtools-panel';

  panel.innerHTML = `
    <div class="devtools-header">
      <div class="devtools-title">
        <span class="devtools-icon">🛠️</span>
        <h3>Pricing DevTools</h3>
      </div>
      <div class="devtools-actions">
        <button class="devtools-btn" id="devtools-pin" title="Pin panel">📌</button>
        <button class="devtools-btn" id="devtools-close" title="Close (Ctrl+Shift+P)">✕</button>
      </div>
    </div>

    <div class="devtools-tabs">
      <button class="devtools-tab active" data-tab="logs">📝 Logs</button>
      <button class="devtools-tab" data-tab="performance">⏱️ Performance</button>
      <button class="devtools-tab" data-tab="structure">🏗️ Structure</button>
    </div>

    <div class="devtools-content">
      <div class="devtools-tab-content active" id="devtools-logs">
        <div class="devtools-toolbar">
          <select id="devtools-log-level">
            <option value="DEBUG">All Logs</option>
            <option value="INFO" selected>Info+</option>
            <option value="WARN">Warnings+</option>
            <option value="ERROR">Errors Only</option>
          </select>
          <button class="devtools-btn-sm" id="devtools-clear">Clear</button>
          <button class="devtools-btn-sm" id="devtools-export">Export JSON</button>
        </div>
        <div class="devtools-logs-container" id="logs-container"></div>
      </div>

      <div class="devtools-tab-content" id="devtools-performance">
        <div class="devtools-perf-summary" id="perf-summary">
          <p class="devtools-loading">Performance data will appear as calculations run...</p>
        </div>
      </div>

      <div class="devtools-tab-content" id="devtools-structure">
        <div class="devtools-structure-view" id="structure-view">
          <p class="devtools-loading">Structure data will appear when pricing is calculated...</p>
        </div>
      </div>
    </div>
  `;

  // Add event listeners
  setupEventListeners(panel);

  // Apply saved position
  applyPanelPosition(panel);

  // Make draggable
  makeDraggable(panel);

  return panel;
}

/**
 * Setup event listeners for DevTools panel
 */
function setupEventListeners(panel) {
  // Close button
  panel.querySelector('#devtools-close').addEventListener('click', closeDevTools);

  // Pin button
  panel.querySelector('#devtools-pin').addEventListener('click', () => {
    devToolsState.isPinned = !devToolsState.isPinned;
    panel.classList.toggle('pinned', devToolsState.isPinned);
  });

  // Tab switching
  panel.querySelectorAll('.devtools-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      switchTab(tab.dataset.tab);
    });
  });

  // Log level filter
  panel.querySelector('#devtools-log-level').addEventListener('change', (e) => {
    filterLogs(e.target.value);
  });

  // Clear logs
  panel.querySelector('#devtools-clear').addEventListener('click', () => {
    pricingLogger.clear();
    panel.querySelector('#logs-container').innerHTML = '';
  });

  // Export JSON
  panel.querySelector('#devtools-export').addEventListener('click', exportLogs);
}

/**
 * Switch active tab
 */
function switchTab(tabName) {
  devToolsState.activeTab = tabName;

  // Update tab buttons
  document.querySelectorAll('.devtools-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.tab === tabName);
  });

  // Update tab content
  document.querySelectorAll('.devtools-tab-content').forEach(content => {
    content.classList.toggle('active', content.id === `devtools-${tabName}`);
  });

  // Refresh content for active tab
  if (tabName === 'performance') {
    updatePerformanceTab();
  } else if (tabName === 'structure') {
    updateStructureTab();
  }
}

/**
 * Add log entry to logs panel
 */
function addLogEntry(entry) {
  const container = document.getElementById('logs-container');
  if (!container) return;

  const logEl = document.createElement('div');
  logEl.className = `devtools-log-entry log-${entry.level.toLowerCase()}`;

  const timestamp = entry.timestamp
    ? new Date(entry.timestamp).toLocaleTimeString()
    : '';

  logEl.innerHTML = `
    <div class="log-header">
      <span class="log-level">${entry.level}</span>
      <span class="log-time">${timestamp}</span>
    </div>
    <div class="log-message">${entry.message}</div>
    ${Object.keys(entry.data).length > 0 ? `
      <details class="log-data">
        <summary>Data</summary>
        <pre>${JSON.stringify(entry.data, null, 2)}</pre>
      </details>
    ` : ''}
  `;

  container.appendChild(logEl);

  // Auto-scroll to bottom
  container.scrollTop = container.scrollHeight;

  // Limit displayed entries
  while (container.children.length > 100) {
    container.removeChild(container.firstChild);
  }
}

/**
 * Filter logs by level
 */
function filterLogs(level) {
  const entries = pricingLogger.getEntries({ level });
  const container = document.getElementById('logs-container');
  if (!container) return;

  container.innerHTML = '';
  entries.forEach(entry => addLogEntry(entry));
}

/**
 * Update performance tab
 */
function updatePerformanceTab() {
  const summary = pricingLogger.getPerformanceSummary();
  const container = document.getElementById('perf-summary');
  if (!container) return;

  if (summary.totalTimings === 0) {
    container.innerHTML = '<p class="devtools-loading">No performance data yet</p>';
    return;
  }

  let html = `<h4>Performance Summary (${summary.totalTimings} timings)</h4>`;

  Object.entries(summary.timings).forEach(([label, stats]) => {
    html += `
      <div class="perf-metric">
        <div class="perf-label">${label}</div>
        <div class="perf-stats">
          <span>Calls: ${stats.count}</span>
          <span>Avg: ${stats.avg.toFixed(2)}ms</span>
          <span>Min: ${stats.min.toFixed(2)}ms</span>
          <span>Max: ${stats.max.toFixed(2)}ms</span>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

/**
 * Update structure tab
 */
function updateStructureTab() {
  const container = document.getElementById('structure-view');
  if (!container) return;

  // This will be populated by pricing calculator
  container.innerHTML = '<p class="devtools-loading">Structure inspection coming in S2...</p>';
}

/**
 * Export logs as JSON
 */
function exportLogs() {
  const json = pricingLogger.exportJSON();
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `pricing-logs-${Date.now()}.json`;
  a.click();

  URL.revokeObjectURL(url);
  pricingLogger.info('Logs exported', { filename: a.download });
}

/**
 * Apply panel position
 */
function applyPanelPosition(panel) {
  panel.style.left = `${devToolsState.position.x}px`;
  panel.style.top = `${devToolsState.position.y}px`;
  panel.style.width = `${devToolsState.size.width}px`;
  panel.style.height = `${devToolsState.size.height}px`;
}

/**
 * Make panel draggable
 */
function makeDraggable(panel) {
  const header = panel.querySelector('.devtools-header');
  let isDragging = false;
  let currentX;
  let currentY;
  let initialX;
  let initialY;

  header.style.cursor = 'move';

  header.addEventListener('mousedown', (e) => {
    if (devToolsState.isPinned) return;

    isDragging = true;
    initialX = e.clientX - devToolsState.position.x;
    initialY = e.clientY - devToolsState.position.y;
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    e.preventDefault();
    currentX = e.clientX - initialX;
    currentY = e.clientY - initialY;

    devToolsState.position = { x: currentX, y: currentY };
    panel.style.left = `${currentX}px`;
    panel.style.top = `${currentY}px`;
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
  });
}

/**
 * Expose pricing structure to DevTools
 * Called by pricing calculator
 */
export function exposeStructure(structure) {
  if (!devToolsState.isOpen) return;

  const container = document.getElementById('structure-view');
  if (!container) return;

  container.innerHTML = `
    <pre class="structure-json">${JSON.stringify(structure, null, 2)}</pre>
  `;
}

// Auto-initialize in development
if (process.env.NODE_ENV !== 'production') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDevTools);
  } else {
    initDevTools();
  }
}
