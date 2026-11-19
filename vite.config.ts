import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

function resolveManualChunk(id: string): string | undefined {
  const normalized = id.replace(/\\/g, '/');

  // Keep Vite's preload & Rollup CJS helpers in vendor-react so entry chunks
  // never pull lazy vendor chunks (such as vendor-r3f / vendor-three) eagerly.
  if (
    normalized.includes('vite/preload-helper') ||
    normalized.includes('commonjsHelpers')
  ) {
    return 'vendor-react';
  }

  if (!normalized.includes('/node_modules/')) {
    return undefined;
  }

  if (/\/node_modules\/(react|react-dom|scheduler)\//.test(normalized)) {
    return 'vendor-react';
  }
  if (/\/node_modules\/react-router(-dom)?\//.test(normalized)) {
    return 'vendor-router';
  }
  if (
    /\/node_modules\/(framer-motion|motion-dom|motion-utils)\//.test(
      normalized,
    )
  ) {
    return 'vendor-motion';
  }
  if (/\/node_modules\/lucide-react\//.test(normalized)) {
    return 'vendor-icons';
  }
  if (/\/node_modules\/three\//.test(normalized)) {
    return 'vendor-three';
  }
  if (
    /\/node_modules\/(@react-three\/|three-stdlib|zustand|suspend-react|its-fine|react-use-measure|maath|camera-controls|troika-|bidi-js|webgl-sdf-generator|@use-gesture|detect-gpu|meshoptimizer|stats-gl|stats\.js)/.test(
      normalized,
    )
  ) {
    return 'vendor-r3f';
  }
  return undefined;
}

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: resolveManualChunk,
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    testTimeout: 20000,
    maxWorkers: 4,
  },
});
