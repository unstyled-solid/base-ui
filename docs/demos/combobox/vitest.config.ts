import { defineConfig } from 'vitest/config';
import solid from '@solidjs/vite-plugin';
export default defineConfig({
  plugins: [solid(process.env.COMBOBOX_NATIVE ? {} : { compiler: 'babel' })],
  cacheDir: 'docs/demos/combobox/.cache',
  test: {
    environment: 'jsdom',
    setupFiles: ['test/harness/setup.ts'],
    include: ['docs/demos/combobox/interactions.test.tsx'],
    maxWorkers: 1,
    environmentOptions: { jsdom: { pretendToBeVisual: true, url: 'http://localhost/' } },
  },
});
