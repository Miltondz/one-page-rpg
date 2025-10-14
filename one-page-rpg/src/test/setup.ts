import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// Cleanup después de cada test
afterEach(() => {
  cleanup();
});

// Mock global fetch para los tests
global.fetch = vi.fn();
