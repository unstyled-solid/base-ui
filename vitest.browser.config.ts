import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import shared from './vitest.config.ts';
import { fixtureServer } from './scripts/test/fixture-server.ts';
import { safeScreenshot, focusNativeDocument } from './test/harness/browser-commands.ts';
import { runnerNavigationBoundary } from './test/harness/runner-navigation.ts';

const names = (process.env.HARNESS_BROWSERS ?? 'chromium').split(',');
const nativeDocument = process.env.HARNESS_NATIVE_DOCUMENT === '1';
const browsers = names.map((name) => {
  if (name !== 'chromium' && name !== 'firefox' && name !== 'webkit') throw new Error(`Unsupported browser: ${name}`);
  return { browser: name } as const;
});

export default defineConfig({
  ...shared,
  plugins: [runnerNavigationBoundary(), ...shared.plugins ?? [], fixtureServer()],
  cacheDir: process.env.HARNESS_CACHE_DIR ?? 'test/harness/.cache/browser',
  test: {
    ...shared.test,
    name: 'solid2-real-browser-development',
    maxWorkers: nativeDocument || process.env.HARNESS_BATCH_FILE ? 1 : shared.test?.maxWorkers,
    fileParallelism: nativeDocument || process.env.HARNESS_BATCH_FILE ? false : shared.test?.fileParallelism,
    provide: { harnessNativeDocument: nativeDocument },
    include: process.env.HARNESS_BATCH_FILE ? [process.env.HARNESS_BATCH_FILE] : [...shared.test?.include ?? [], ...(nativeDocument ? ['test/native-harness/**/*.browser.test.{ts,tsx}'] : [])],
    // Replace, rather than append, the jsdom exclusions: browserCase also lives in ordinary suites.
    exclude: ['**/*.ssr.test.*', '**/*.node.test.*', ...(process.env.HARNESS_PROBE ? [] : ['**/negative/**']), '**/.generated/**', '**/.cache/**',
      '**/*source-inventory*', '**/*SourceInventory*', '**/ToastSource.test.ts',
      '**/createId.lifecycle.test.tsx'],
    browser: {
      enabled: true,
      headless: !nativeDocument,
      screenshotFailures: true,
      screenshotDirectory: './test/harness/.cache/screenshots',
      commands: { __vitest_screenshot: safeScreenshot, prepareNativeDocument: focusNativeDocument },
      provider: playwright({
        actionTimeout: 5_000,
        contextOptions: { timezoneId: 'UTC' },
        launchOptions: process.env.HARNESS_CHROMIUM_EXECUTABLE ? { executablePath: process.env.HARNESS_CHROMIUM_EXECUTABLE } : {},
      }),
      instances: browsers,
    },
    setupFiles: ['./test/harness/browser-setup.ts'],
  },
});
