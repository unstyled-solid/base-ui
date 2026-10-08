import { defineConfig } from 'vitest/config';
import solid from '@solidjs/vite-plugin';

export default defineConfig({
  cacheDir: 'docs/demos/menu/.cache',
  plugins: [solid({ compiler: 'babel' })],
  test: {
    environment: 'jsdom',
    include: ['docs/demos/menu/**/*.test.tsx'],
    maxWorkers: 1,
    setupFiles: ['./test/harness/setup.ts'],
  },
});
