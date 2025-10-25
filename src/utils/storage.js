/**
 * Storage Utilities
 * Handles localStorage persistence for catering customization
 */

const STORAGE_VERSION = 1;
const MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Save data to localStorage with versioning and timestamp
 * @param {string} key - Storage key
 * @param {object} data - Data to store
 * @returns {boolean} Success status
 */
export function saveToStorage(key, data) {
  try {
    const payload = {
      version: STORAGE_VERSION,
      timestamp: Date.now(),
      data
    };
    localStorage.setItem(key, JSON.stringify(payload));
    return true;
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
    return false;
  }
}

/**
 * Load data from localStorage with version and expiration checks
 * @param {string} key - Storage key
 * @returns {object|null} Stored data or null
 */
export function loadFromStorage(key) {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return null;

    const payload = JSON.parse(stored);

    // Version check
    if (payload.version !== STORAGE_VERSION) {
      console.warn('Storage version mismatch, clearing:', key);
      clearStorage(key);
      return null;
    }

    // Expiration check (24 hours)
    const age = Date.now() - payload.timestamp;
    if (age > MAX_AGE_MS) {
      console.warn('Storage expired, clearing:', key);
      clearStorage(key);
      return null;
    }

    return payload.data;
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return null;
  }
}

/**
 * Clear data from localStorage
 * @param {string} key - Storage key
 * @returns {boolean} Success status
 */
export function clearStorage(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Failed to clear localStorage:', error);
    return false;
  }
}

/**
 * Check if data exists in storage
 * @param {string} key - Storage key
 * @returns {boolean} True if data exists
 */
export function hasStoredData(key) {
  try {
    const stored = localStorage.getItem(key);
    return stored !== null;
  } catch (error) {
    return false;
  }
}

/**
 * Get storage age in milliseconds
 * @param {string} key - Storage key
 * @returns {number|null} Age in ms or null if not found
 */
export function getStorageAge(key) {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return null;

    const payload = JSON.parse(stored);
    return Date.now() - payload.timestamp;
  } catch (error) {
    return null;
  }
}
