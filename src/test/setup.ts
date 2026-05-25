import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach } from 'vitest';
import '@/engine/templates';

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  cleanup();
  localStorage.clear();
});
