import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import solid from '@solidjs/vite-plugin';
import { playwright } from '@vitest/browser-playwright';

const browser = process.env.FORM_DEMOS_BROWSER === '1';

export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  plugins: [solid({ compiler: 'babel' })],
  test: {
    environment: browser ? 'node' : 'jsdom',
    include: ['form.test.tsx'],
    maxWorkers: 1,
    environmentOptions: { jsdom: { url: 'http://localhost/' } },
    browser: browser ? {
      enabled: true,
      provider: playwright(),
      instances: [{ browser: 'chromium' }],
      headless: true,
    } : undefined,
  },
});
