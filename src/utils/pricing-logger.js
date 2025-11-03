/**
 * Pricing Logger - Structured Logging with Performance Tracking
 *
 * Provides structured logging for pricing calculations with:
 * - Multiple log levels (error, warn, info, debug)
 * - Performance timing instrumentation
 * - JSON export capabilities
 * - Real-time DevTools integration
 *
 * @module pricing-logger
 * @created 2025-10-31
 * @epic SP-PRICING-001
 * @story S1-Foundation
 */

/**
 * Log levels with numeric priorities
 */
const LOG_LEVELS = {
  ERROR: { name: 'ERROR', priority: 0, color: '#ef4444' },
  WARN: { name: 'WARN', priority: 1, color: '#f59e0b' },
  INFO: { name: 'INFO', priority: 2, color: '#3b82f6' },
  DEBUG: { name: 'DEBUG', priority: 3, color: '#6b7280' }
};

/**
 * Default logger configuration
 */
const DEFAULT_CONFIG = {
  level: LOG_LEVELS.INFO,
  maxEntries: 1000,
  enableConsole: true,
  enableDevTools: true,
  timestamps: true
};

/**
 * PricingLogger class for structured logging
 */
class PricingLogger {
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.entries = [];
    this.timings = new Map();
    this.listeners = [];
  }

  /**
   * Log an error
   * @param {string} message - Error message
   * @param {Object} data - Additional error data
   */
  error(message, data = {}) {
    this._log(LOG_LEVELS.ERROR, message, data);
  }

  /**
   * Log a warning
   * @param {string} message - Warning message
   * @param {Object} data - Additional warning data
   */
  warn(message, data = {}) {
    this._log(LOG_LEVELS.WARN, message, data);
  }

  /**
   * Log info
   * @param {string} message - Info message
   * @param {Object} data - Additional info data
   */
  info(message, data = {}) {
    this._log(LOG_LEVELS.INFO, message, data);
  }

  /**
   * Log debug info
   * @param {string} message - Debug message
   * @param {Object} data - Additional debug data
   */
  debug(message, data = {}) {
    this._log(LOG_LEVELS.DEBUG, message, data);
  }

  /**
   * Start performance timer
   * @param {string} label - Timer label
   */
  startTimer(label) {
    this.timings.set(label, performance.now());
  }

  /**
   * End performance timer and log duration
   * @param {string} label - Timer label
   * @param {Object} data - Additional data to log with timing
   * @returns {number} Duration in milliseconds
   */
  endTimer(label, data = {}) {
    const startTime = this.timings.get(label);
    if (!startTime) {
      this.warn(`Timer "${label}" was not started`, { label });
      return 0;
    }

    const duration = performance.now() - startTime;
    this.timings.delete(label);

    this.info(`⏱️ ${label}`, {
      ...data,
      duration: `${duration.toFixed(2)}ms`,
      durationMs: duration
    });

    return duration;
  }

  /**
   * Internal logging method
   * @private
   */
  _log(level, message, data = {}) {
    // Check if log level is enabled
    if (level.priority > this.config.level.priority) {
      return;
    }

    const entry = {
      level: level.name,
      message,
      data,
      timestamp: this.config.timestamps ? new Date().toISOString() : null,
      id: this._generateId()
    };

    // Add to entries array
    this.entries.push(entry);

    // Trim entries if over max
    if (this.entries.length > this.config.maxEntries) {
      this.entries.shift();
    }

    // Console output
    if (this.config.enableConsole) {
      this._logToConsole(level, entry);
    }

    // Notify DevTools listeners
    if (this.config.enableDevTools) {
      this._notifyListeners(entry);
    }
  }

  /**
   * Log to browser console with color coding
   * @private
   */
  _logToConsole(level, entry) {
    const style = `color: ${level.color}; font-weight: bold;`;
    const timestamp = entry.timestamp ? `[${entry.timestamp}]` : '';

    console.log(
      `%c[${level.name}]%c ${timestamp} ${entry.message}`,
      style,
      'color: inherit;',
      entry.data
    );
  }

  /**
   * Notify DevTools listeners of new log entry
   * @private
   */
  _notifyListeners(entry) {
    this.listeners.forEach(listener => {
      try {
        listener(entry);
      } catch (error) {
        console.error('Error in logger listener:', error);
      }
    });
  }

  /**
   * Generate unique ID for log entry
   * @private
   */
  _generateId() {
    return `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Subscribe to log entries (for DevTools)
   * @param {Function} callback - Callback function receiving log entries
   * @returns {Function} Unsubscribe function
   */
  subscribe(callback) {
    this.listeners.push(callback);

    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Export logs as JSON
   * @param {Object} options - Export options
   * @returns {string} JSON string of log entries
   */
  exportJSON(options = {}) {
    const { level = null, since = null, limit = null } = options;

    let filtered = this.entries;

    // Filter by level
    if (level) {
      const levelPriority = LOG_LEVELS[level.toUpperCase()]?.priority;
      if (levelPriority !== undefined) {
        filtered = filtered.filter(entry => {
          const entryLevel = LOG_LEVELS[entry.level]?.priority;
          return entryLevel <= levelPriority;
        });
      }
    }

    // Filter by timestamp
    if (since) {
      filtered = filtered.filter(entry =>
        new Date(entry.timestamp) >= new Date(since)
      );
    }

    // Limit results
    if (limit) {
      filtered = filtered.slice(-limit);
    }

    return JSON.stringify({
      exported: new Date().toISOString(),
      count: filtered.length,
      entries: filtered
    }, null, 2);
  }

  /**
   * Clear all log entries
   */
  clear() {
    this.entries = [];
    this.info('Log entries cleared');
  }

  /**
   * Get current log entries
   * @param {Object} options - Filter options
   * @returns {Array<Object>} Log entries
   */
  getEntries(options = {}) {
    const { level = null, limit = null } = options;

    let filtered = this.entries;

    if (level) {
      const levelPriority = LOG_LEVELS[level.toUpperCase()]?.priority;
      if (levelPriority !== undefined) {
        filtered = filtered.filter(entry => {
          const entryLevel = LOG_LEVELS[entry.level]?.priority;
          return entryLevel <= levelPriority;
        });
      }
    }

    if (limit) {
      filtered = filtered.slice(-limit);
    }

    return filtered;
  }

  /**
   * Set log level
   * @param {string} levelName - Level name (ERROR, WARN, INFO, DEBUG)
   */
  setLevel(levelName) {
    const level = LOG_LEVELS[levelName.toUpperCase()];
    if (level) {
      this.config.level = level;
      this.info(`Log level set to ${level.name}`);
    } else {
      this.warn(`Invalid log level: ${levelName}`);
    }
  }

  /**
   * Get performance summary
   * @returns {Object} Performance metrics summary
   */
  getPerformanceSummary() {
    const timingEntries = this.entries.filter(entry =>
      entry.message.startsWith('⏱️')
    );

    const summary = {
      totalTimings: timingEntries.length,
      timings: {}
    };

    timingEntries.forEach(entry => {
      const label = entry.message.replace('⏱️ ', '');
      if (!summary.timings[label]) {
        summary.timings[label] = {
          count: 0,
          total: 0,
          min: Infinity,
          max: -Infinity,
          avg: 0
        };
      }

      const duration = entry.data.durationMs;
      const stats = summary.timings[label];

      stats.count++;
      stats.total += duration;
      stats.min = Math.min(stats.min, duration);
      stats.max = Math.max(stats.max, duration);
      stats.avg = stats.total / stats.count;
    });

    return summary;
  }
}

// Create singleton instance
const pricingLogger = new PricingLogger();

// Export singleton and class
export default pricingLogger;
export { PricingLogger, LOG_LEVELS };
