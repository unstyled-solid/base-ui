import { defineConfig } from 'vitest/config';
import shared from '../../../vitest.browser.config.ts';

export default defineConfig({
  ...shared,
  cacheDir: 'docs/demos/autocomplete/.cache/browser',
  test: {
    ...shared.test,
    include: ['docs/demos/autocomplete/demos.test.tsx', 'docs/demos/autocomplete/virtualized.browser.test.tsx'],
    reporters: ['default'],
    browser: {
      ...shared.test?.browser,
      screenshotDirectory: './docs/demos/autocomplete/.cache/screenshots',
    },
  },
});
