import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import solid from '@solidjs/vite-plugin';

const server = process.env.BOOTSTRAP_TARGET === 'ssr';
export default defineConfig({
  plugins: [solid({ ssr: server })],
  cacheDir: 'packages/solid/src/internals/contracts/proof/.cache/vite',
  test: {
    name: server ? 'bootstrap-ssr' : 'bootstrap-client',
    environment: server ? 'node' : 'jsdom',
    include: [server
      ? 'packages/solid/src/internals/contracts/proof/*.ssr.test.tsx'
      : 'packages/solid/src/internals/contracts/proof/*.test.tsx'],
    exclude: server ? [] : ['**/*.ssr.test.tsx'],
    setupFiles: [fileURLToPath(new URL('./diagnostics.mjs', import.meta.url))],
    globals: false,
  },
});
