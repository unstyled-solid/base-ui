import { defineConfig } from 'vitest/config';
import solid from '@solidjs/vite-plugin';

export default defineConfig({
  plugins: [solid({ compiler: 'babel' })],
  cacheDir: 'docs/tests/demos/.cache',
  test: {
    css: true,
    environment: 'jsdom',
    include: ['docs/tests/demos/**/*.test.tsx'],
    maxWorkers: 1,
    environmentOptions: { jsdom: { url: 'https://docs.example/' } },
  },
});
