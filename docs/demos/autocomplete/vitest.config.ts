import { defineConfig } from 'vitest/config';
import base from '../../../vitest.config.ts';

export default defineConfig({
  ...base,
  cacheDir: 'docs/demos/autocomplete/.cache',
  test: {
    ...base.test,
    include: ['docs/demos/autocomplete/*.test.tsx'],
    reporters: ['default'],
  },
});
