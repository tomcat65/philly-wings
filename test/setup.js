/**
 * Vitest Test Setup
 * Global test configuration and utilities
 */

import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock console methods to reduce noise in test output
global.console = {
  ...console,
  error: vi.fn(),
  warn: vi.fn(),
  log: console.log // Keep log for debugging
};

// Mock window.matchMedia (not available in JSDOM)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
});
