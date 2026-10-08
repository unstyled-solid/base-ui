import { defineConfig } from 'vitest/config';
import solid from '@solidjs/vite-plugin';
import { playwright } from '@vitest/browser-playwright';

export default defineConfig({
  plugins: [solid()],
  cacheDir: 'docs/demos/tabs/.cache',
  test: {
    include: ['docs/demos/tabs/interactions.test.tsx'],
    setupFiles: ['./test/harness/browser-setup.ts'],
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser: 'chromium' }],
    },
  },
});
