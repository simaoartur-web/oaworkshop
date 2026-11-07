import '@testing-library/jest-dom/vitest';

window.scrollTo = () => {};

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
