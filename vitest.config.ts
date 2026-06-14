import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: false,
    setupFiles: ['./src/tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100,
      },
      include: [
        'src/utils/**',
        'src/services/**',
        'src/data/**',
        'src/context/**',
      ],
      exclude: [
        'src/main.tsx',
        'src/App.tsx',
        'src/types/**',
        'src/components/**',
        'src/pages/**',
        'src/data/tips.ts',
        'src/data/emissionFactors.ts',
        'src/tests/**',
      ],
    },
  },
});
