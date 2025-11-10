/**
 * Pricing Timing Instrumentation Helpers
 *
 * Provides utilities for measuring and optimizing pricing calculation performance:
 * - Function timing decorators
 * - Async operation timing
 * - Batch timing for multiple operations
 * - Performance budget warnings
 *
 * @module pricing-timing
 * @created 2025-10-31
 * @epic SP-PRICING-001
 * @story S1-Foundation
 */

import pricingLogger from './pricing-logger.js';

/**
 * Performance budgets (in milliseconds)
 */
export const PERFORMANCE_BUDGETS = {
  CALCULATION: 50,      // Single calculation should be < 50ms
  RENDERING: 16,        // Rendering should be < 16ms (60 FPS)
  TOTAL_UPDATE: 100     // Total update cycle should be < 100ms
};

/**
 * Wrap a synchronous function with timing
 * @param {Function} fn - Function to time
 * @param {string} label - Label for timing
 * @param {Object} options - Timing options
 * @returns {Function} Wrapped function
 *
 * @example
 * const timedCalculate = timeFunction(calculateWingPricing, 'Wing Pricing');
 * const result = timedCalculate(config);
 */
export function timeFunction(fn, label, options = {}) {
  const { warnBudget = null, logLevel = 'debug' } = options;

  return function (...args) {
    pricingLogger.startTimer(label);

    try {
      const result = fn.apply(this, args);
      const duration = pricingLogger.endTimer(label);

      // Check performance budget
      if (warnBudget && duration > warnBudget) {
        pricingLogger.warn(`${label} exceeded budget`, {
          duration: `${duration.toFixed(2)}ms`,
          budget: `${warnBudget}ms`,
          overage: `${(duration - warnBudget).toFixed(2)}ms`
        });
      }

      return result;
    } catch (error) {
      pricingLogger.endTimer(label);
      pricingLogger.error(`${label} failed`, { error: error.message });
      throw error;
    }
  };
}

/**
 * Wrap an async function with timing
 * @param {Function} fn - Async function to time
 * @param {string} label - Label for timing
 * @param {Object} options - Timing options
 * @returns {Function} Wrapped async function
 *
 * @example
 * const timedFetch = timeAsyncFunction(fetchPricingData, 'Fetch Pricing');
 * const data = await timedFetch();
 */
export function timeAsyncFunction(fn, label, options = {}) {
  const { warnBudget = null } = options;

  return async function (...args) {
    pricingLogger.startTimer(label);

    try {
      const result = await fn.apply(this, args);
      const duration = pricingLogger.endTimer(label);

      if (warnBudget && duration > warnBudget) {
        pricingLogger.warn(`${label} exceeded budget`, {
          duration: `${duration.toFixed(2)}ms`,
          budget: `${warnBudget}ms`
        });
      }

      return result;
    } catch (error) {
      pricingLogger.endTimer(label);
      pricingLogger.error(`${label} failed`, { error: error.message });
      throw error;
    }
  };
}

/**
 * Time a batch of operations
 * @param {Array<Function>} operations - Array of functions to execute
 * @param {string} label - Label for batch timing
 * @returns {Array} Array of results
 *
 * @example
 * const results = timeBatch([
 *   () => calculateWings(),
 *   () => calculateSauces(),
 *   () => calculateDips()
 * ], 'Calculate All Items');
 */
export function timeBatch(operations, label) {
  pricingLogger.startTimer(label);
  const results = [];

  try {
    operations.forEach((op, index) => {
      const opLabel = `${label}[${index}]`;
      pricingLogger.startTimer(opLabel);

      results.push(op());

      pricingLogger.endTimer(opLabel);
    });

    pricingLogger.endTimer(label, { count: operations.length });
    return results;
  } catch (error) {
    pricingLogger.endTimer(label);
    pricingLogger.error(`${label} batch failed`, { error: error.message });
    throw error;
  }
}

/**
 * Create a timing decorator for class methods
 * @param {string} label - Label for timing
 * @param {Object} options - Timing options
 * @returns {Function} Method decorator
 *
 * @example
 * class PricingCalculator {
 *   @timed('Calculate Total')
 *   calculateTotal(config) {
 *     // method implementation
 *   }
 * }
 */
export function timed(label, options = {}) {
  return function (target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args) {
      return timeFunction(originalMethod, label, options).apply(this, args);
    };

    return descriptor;
  };
}

/**
 * Measure execution time and return both result and duration
 * @param {Function} fn - Function to measure
 * @returns {Object} { result, duration }
 *
 * @example
 * const { result, duration } = measure(() => expensiveCalculation());
 * console.log(`Took ${duration}ms`);
 */
export function measure(fn) {
  const start = performance.now();
  const result = fn();
  const duration = performance.now() - start;

  return { result, duration };
}

/**
 * Measure async execution time
 * @param {Function} fn - Async function to measure
 * @returns {Promise<Object>} { result, duration }
 */
export async function measureAsync(fn) {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;

  return { result, duration };
}

/**
 * Create a performance checkpoint
 * @param {string} label - Checkpoint label
 * @returns {Function} Function to mark checkpoint end
 *
 * @example
 * const checkpoint = createCheckpoint('Data Processing');
 * // ... do work ...
 * checkpoint(); // Logs duration
 */
export function createCheckpoint(label) {
  pricingLogger.startTimer(label);

  return (data = {}) => {
    return pricingLogger.endTimer(label, data);
  };
}

/**
 * Check if operation is within performance budget
 * @param {number} duration - Duration in milliseconds
 * @param {number} budget - Budget in milliseconds
 * @param {string} label - Operation label
 * @returns {boolean} True if within budget
 */
export function checkBudget(duration, budget, label) {
  const withinBudget = duration <= budget;

  if (!withinBudget) {
    pricingLogger.warn(`${label} exceeded budget`, {
      duration: `${duration.toFixed(2)}ms`,
      budget: `${budget}ms`,
      overage: `${(duration - budget).toFixed(2)}ms`,
      percentOver: `${(((duration - budget) / budget) * 100).toFixed(1)}%`
    });
  }

  return withinBudget;
}

/**
 * Throttle function execution
 * @param {Function} fn - Function to throttle
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(fn, delay) {
  let lastCall = 0;

  return function (...args) {
    const now = Date.now();

    if (now - lastCall >= delay) {
      lastCall = now;
      return fn.apply(this, args);
    }
  };
}

/**
 * Debounce function execution
 * @param {Function} fn - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(fn, delay) {
  let timeoutId;

  return function (...args) {
    clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

/**
 * Create a rate limiter
 * @param {number} maxCalls - Maximum calls per period
 * @param {number} period - Period in milliseconds
 * @returns {Function} Rate limiter wrapper
 */
export function rateLimit(maxCalls, period) {
  const calls = [];

  return function (fn) {
    return function (...args) {
      const now = Date.now();

      // Remove old calls outside the period
      while (calls.length > 0 && calls[0] < now - period) {
        calls.shift();
      }

      if (calls.length < maxCalls) {
        calls.push(now);
        return fn.apply(this, args);
      } else {
        pricingLogger.warn('Rate limit exceeded', {
          maxCalls,
          period: `${period}ms`,
          retryAfter: `${(calls[0] + period - now)}ms`
        });
        return null;
      }
    };
  };
}

/**
 * Get performance summary for all timed operations
 * @returns {Object} Performance summary
 */
export function getPerformanceSummary() {
  return pricingLogger.getPerformanceSummary();
}

/**
 * Reset all timing data
 */
export function resetTimings() {
  pricingLogger.clear();
  pricingLogger.info('Timing data reset');
}
