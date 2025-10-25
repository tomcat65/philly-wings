/**
 * Storage Utilities Test Suite
 * Tests localStorage persistence with versioning and expiration
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  saveToStorage,
  loadFromStorage,
  clearStorage,
  hasStoredData,
  getStorageAge
} from '../../src/utils/storage.js';

describe('Storage Utilities', () => {
  const TEST_KEY = 'test_storage_key';
  const TEST_DATA = {
    package: { id: 'test-package', name: 'Test Package' },
    wings: { boneless: 50, boneIn: 25 }
  };

  // Mock localStorage
  let localStorageMock;

  beforeEach(() => {
    localStorageMock = {
      store: {},
      getItem(key) {
        return this.store[key] || null;
      },
      setItem(key, value) {
        this.store[key] = String(value);
      },
      removeItem(key) {
        delete this.store[key];
      },
      clear() {
        this.store = {};
      }
    };

    global.localStorage = localStorageMock;
  });

  afterEach(() => {
    localStorageMock.clear();
  });

  describe('saveToStorage', () => {
    it('should save data with version and timestamp', () => {
      const result = saveToStorage(TEST_KEY, TEST_DATA);

      expect(result).toBe(true);
      const stored = JSON.parse(localStorageMock.getItem(TEST_KEY));
      expect(stored.version).toBe(1);
      expect(stored.timestamp).toBeTypeOf('number');
      expect(stored.data).toEqual(TEST_DATA);
    });

    it('should handle save errors gracefully', () => {
      // Mock setItem to throw error
      vi.spyOn(localStorageMock, 'setItem').mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const result = saveToStorage(TEST_KEY, TEST_DATA);

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to save to localStorage:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('loadFromStorage', () => {
    it('should load valid data', () => {
      saveToStorage(TEST_KEY, TEST_DATA);
      const loaded = loadFromStorage(TEST_KEY);

      expect(loaded).toEqual(TEST_DATA);
    });

    it('should return null for non-existent key', () => {
      const loaded = loadFromStorage('non_existent_key');
      expect(loaded).toBeNull();
    });

    it('should return null for expired data', () => {
      // Save data with old timestamp (25+ hours ago)
      const expiredPayload = {
        version: 1,
        timestamp: Date.now() - (25 * 60 * 60 * 1000), // 25 hours ago
        data: TEST_DATA
      };
      localStorageMock.setItem(TEST_KEY, JSON.stringify(expiredPayload));

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const loaded = loadFromStorage(TEST_KEY);

      expect(loaded).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith('Storage expired, clearing:', TEST_KEY);
      expect(localStorageMock.getItem(TEST_KEY)).toBeNull();

      consoleSpy.mockRestore();
    });

    it('should return null for version mismatch', () => {
      // Save data with wrong version
      const wrongVersionPayload = {
        version: 99,
        timestamp: Date.now(),
        data: TEST_DATA
      };
      localStorageMock.setItem(TEST_KEY, JSON.stringify(wrongVersionPayload));

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const loaded = loadFromStorage(TEST_KEY);

      expect(loaded).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith('Storage version mismatch, clearing:', TEST_KEY);
      expect(localStorageMock.getItem(TEST_KEY)).toBeNull();

      consoleSpy.mockRestore();
    });

    it('should handle malformed JSON gracefully', () => {
      localStorageMock.setItem(TEST_KEY, 'invalid json {{{');

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const loaded = loadFromStorage(TEST_KEY);

      expect(loaded).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to load from localStorage:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('clearStorage', () => {
    it('should clear stored data', () => {
      saveToStorage(TEST_KEY, TEST_DATA);
      expect(localStorageMock.getItem(TEST_KEY)).not.toBeNull();

      const result = clearStorage(TEST_KEY);

      expect(result).toBe(true);
      expect(localStorageMock.getItem(TEST_KEY)).toBeNull();
    });

    it('should handle clear errors gracefully', () => {
      vi.spyOn(localStorageMock, 'removeItem').mockImplementation(() => {
        throw new Error('Access denied');
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const result = clearStorage(TEST_KEY);

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to clear localStorage:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('hasStoredData', () => {
    it('should return true for existing data', () => {
      saveToStorage(TEST_KEY, TEST_DATA);
      expect(hasStoredData(TEST_KEY)).toBe(true);
    });

    it('should return false for non-existent data', () => {
      expect(hasStoredData('non_existent_key')).toBe(false);
    });

    it('should handle errors gracefully', () => {
      vi.spyOn(localStorageMock, 'getItem').mockImplementation(() => {
        throw new Error('Access denied');
      });

      expect(hasStoredData(TEST_KEY)).toBe(false);
    });
  });

  describe('getStorageAge', () => {
    it('should return age in milliseconds for existing data', () => {
      saveToStorage(TEST_KEY, TEST_DATA);

      // Wait a small amount
      const age = getStorageAge(TEST_KEY);

      expect(age).toBeTypeOf('number');
      expect(age).toBeGreaterThanOrEqual(0);
      expect(age).toBeLessThan(1000); // Should be less than 1 second
    });

    it('should return null for non-existent data', () => {
      const age = getStorageAge('non_existent_key');
      expect(age).toBeNull();
    });

    it('should calculate age correctly', () => {
      // Save data with known timestamp
      const savedTime = Date.now() - 5000; // 5 seconds ago
      const payload = {
        version: 1,
        timestamp: savedTime,
        data: TEST_DATA
      };
      localStorageMock.setItem(TEST_KEY, JSON.stringify(payload));

      const age = getStorageAge(TEST_KEY);

      expect(age).toBeGreaterThanOrEqual(5000);
      expect(age).toBeLessThan(6000); // Allow some variance
    });

    it('should handle malformed JSON gracefully', () => {
      localStorageMock.setItem(TEST_KEY, 'invalid json {{{');

      const age = getStorageAge(TEST_KEY);
      expect(age).toBeNull();
    });
  });

  describe('Integration: Save and Load Flow', () => {
    it('should save and load data correctly', () => {
      const saved = saveToStorage(TEST_KEY, TEST_DATA);
      expect(saved).toBe(true);

      const loaded = loadFromStorage(TEST_KEY);
      expect(loaded).toEqual(TEST_DATA);

      const exists = hasStoredData(TEST_KEY);
      expect(exists).toBe(true);

      const age = getStorageAge(TEST_KEY);
      expect(age).toBeGreaterThanOrEqual(0);
    });

    it('should handle complete lifecycle', () => {
      // Save
      saveToStorage(TEST_KEY, TEST_DATA);
      expect(hasStoredData(TEST_KEY)).toBe(true);

      // Load
      const loaded = loadFromStorage(TEST_KEY);
      expect(loaded).toEqual(TEST_DATA);

      // Clear
      clearStorage(TEST_KEY);
      expect(hasStoredData(TEST_KEY)).toBe(false);

      // Load after clear should return null
      const loadedAfterClear = loadFromStorage(TEST_KEY);
      expect(loadedAfterClear).toBeNull();
    });
  });
});
