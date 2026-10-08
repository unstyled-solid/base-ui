import { defineConfig } from 'vitest/config';
import shared from '../../../vitest.config.ts';

export default defineConfig({
  ...shared,
  cacheDir: 'docs/demos/drawer/.cache/jsdom',
  test: {
    ...shared.test,
    include: ['docs/demos/drawer/demos.test.tsx'],
    exclude: [],
  },
});
