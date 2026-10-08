import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import { defineConfig } from 'vitest/config';
import solid from '@solidjs/vite-plugin';

const server = process.env.HARNESS_TARGET === 'ssr';
const probe = process.env.HARNESS_PROBE;
// Also cover direct Vitest invocations before workers import date/Intl consumers.
process.env.TZ = 'UTC';
const maxWorkers = Number(process.env.HARNESS_MAX_WORKERS ?? 2);
if (!Number.isInteger(maxWorkers) || maxWorkers < 1 || maxWorkers > 4) throw new Error('HARNESS_MAX_WORKERS must be an integer from 1 to 4');
export default defineConfig({
  // RC13 native SSR hoists type-only generic identifiers into runtime captures.
  // The pinned Babel backend preserves the same dev diagnostics without that defect.
  plugins: [solid({ compiler: 'babel', ssr: true, solid: { hydratable: true } }), {
    name: 'harness-ssr-artifact',
    resolveId(id) { if (id === 'virtual:harness-ssr') return '\0virtual:harness-ssr'; },
    load(id) {
      if (id !== '\0virtual:harness-ssr') return;
      if (!process.env.HARNESS_SSR_ARTIFACT) throw new Error('Run hydration through scripts/test/run.mjs to prepare its isolated SSR artifact');
      return `export default ${readFileSync(process.env.HARNESS_SSR_ARTIFACT, 'utf8')}`;
    },
  }],
  cacheDir: process.env.HARNESS_CACHE_DIR ?? `test/harness/.cache/${server ? 'server' : 'jsdom'}`,
  resolve: {
    alias: {
      '#test-utils': fileURLToPath(new URL('./packages/solid/test/index.ts', import.meta.url)),
      // A single real registration for existing source helper imports in both
      // environments; do not merge incompatible third-party asymmetric APIs.
      '@testing-library/jest-dom/vitest': fileURLToPath(new URL('./test/harness/matchers.ts', import.meta.url)),
    },
  },
  test: {
    name: server ? 'solid2-server' : 'solid2-browser-development',
    environment: server ? 'node' : 'jsdom',
    globals: false,
    isolate: true,
    pool: 'forks',
    maxWorkers,
    fileParallelism: true,
    // A file shares its DOM and diagnostic scope; files still run concurrently.
    maxConcurrency: 1,
    env: { TZ: 'UTC' },
    reporters: ['default', './scripts/test/worker-reporter.ts'],
    setupFiles: [server ? './test/ssr-harness/setup.ts' : './test/harness/setup.ts'],
    include: probe ? [`test/contracts/negative/${probe}.probe.{ts,tsx}`] : server
      ? ['test/ssr-harness/**/*.ssr.test.{ts,tsx}', 'test/integration/**/*.ssr.test.{ts,tsx}', 'packages/solid/**/*.ssr.test.{ts,tsx}']
       : ['test/harness/**/*.test.{ts,tsx}', 'test/contracts/**/*.test.{ts,tsx}', 'test/integration/**/*.test.{ts,tsx}', 'packages/solid/**/*.test.{ts,tsx}'],
    exclude: server || probe ? [] : ['**/*.ssr.test.*', '**/*.browser.test.*', '**/negative/**'],
    passWithNoTests: false,
    environmentOptions: { jsdom: { pretendToBeVisual: true, url: 'http://localhost/' } },
  },
});
