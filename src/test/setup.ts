import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock fetch for level loading
// @ts-ignore - mock fetch for testing
(globalThis as any).fetch = vi.fn();

// Mock matchMedia for responsive tests
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
    dispatchEvent: vi.fn(),
  })),
});
