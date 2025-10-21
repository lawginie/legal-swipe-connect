/**
 * Test Setup Configuration
 * Global test setup for Vitest including DOM matchers and mocks
 */

import '@testing-library/jest-dom';
import { vi, afterEach } from 'vitest';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock as Storage;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.sessionStorage = sessionStorageMock as Storage;

// Mock window.ethereum for Web3 tests
Object.defineProperty(window, 'ethereum', {
  writable: true,
  value: {
    request: vi.fn(),
    on: vi.fn(),
    removeListener: vi.fn(),
    isMetaMask: true,
  },
});

// Mock environment variables
vi.mock('@/config/environment', () => ({
  config: {
    supabase: {
      url: 'https://test.supabase.co',
      anonKey: 'test-anon-key',
      projectId: 'test-project',
    },
    development: {
      testCredentials: {
        base: {
          email: 'base@test.com',
          password: 'password123',
          fullName: 'Base Admin',
          userType: 'client',
        },
        client: {
          email: 'client@test.com',
          password: 'password123',
          fullName: 'John Client',
          userType: 'client',
        },
        lawyer: {
          email: 'lawyer@test.com',
          password: 'password123',
          fullName: 'Sarah Lawyer',
          userType: 'lawyer',
        },
      },
      baseWallet: {
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
      },
    },
    features: {
      enableBaseWallet: true,
      enableOfflineMode: false,
      enableAnalytics: false,
    },
    logging: {
      level: 'debug',
      enableConsole: true,
      enableRemote: false,
    },
  },
}));

// Global test utilities
global.testUtils = {
  // Helper to wait for async operations
  waitForAsync: (ms = 0) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Helper to create mock user sessions
  createMockSession: (userType: 'client' | 'lawyer' | 'base' = 'client') => ({
    user: {
      id: `${userType}-test-id`,
      email: `${userType}@test.com`,
      user_metadata: {
        full_name: `Test ${userType.charAt(0).toUpperCase() + userType.slice(1)}`,
        user_type: userType,
      },
    },
    access_token: 'test-access-token',
    refresh_token: 'test-refresh-token',
  }),
};

// Suppress console warnings in tests unless explicitly testing them
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

console.warn = (...args) => {
  if (
    args[0]?.includes?.('React Router') ||
    args[0]?.includes?.('Warning:')
  ) {
    return;
  }
  originalConsoleWarn(...args);
};

console.error = (...args) => {
  if (
    args[0]?.includes?.('Warning:') ||
    args[0]?.includes?.('React Router')
  ) {
    return;
  }
  originalConsoleError(...args);
};

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks();
  localStorageMock.clear();
  sessionStorageMock.clear();
});