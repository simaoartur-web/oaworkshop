import '@testing-library/jest-dom/vitest';
import { configure } from '@testing-library/react';

// Allow sufficient time for React.lazy route chunks under parallel Vitest execution
configure({ asyncUtilTimeout: 5000 });

window.scrollTo = () => {};

if (typeof URL.createObjectURL !== 'function') {
  Object.defineProperty(URL, 'createObjectURL', {
    writable: true,
    configurable: true,
    value: () => `blob:oa-jsdom-session/${Date.now()}`,
  });
}

if (typeof URL.revokeObjectURL !== 'function') {
  Object.defineProperty(URL, 'revokeObjectURL', {
    writable: true,
    configurable: true,
    value: () => {},
  });
}

// Mock matchMedia for jsdom (prefers-reduced-motion checks in Framer Motion)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});
