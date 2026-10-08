import { defineConfig } from 'vitest/config';
import shared from '../../../vitest.browser.config.ts';

export default defineConfig({
  ...shared,
  cacheDir: 'docs/demos/drawer/.cache/browser',
  test: {
    ...shared.test,
    include: ['docs/demos/drawer/demos.test.tsx'],
    exclude: [],
    browser: {
      ...shared.test?.browser,
      screenshotDirectory: './docs/demos/drawer/.cache/screenshots',
    },
  },
});
