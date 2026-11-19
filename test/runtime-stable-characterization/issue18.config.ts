import { defineConfig } from 'vitest/config';
import solid from '@solidjs/vite-plugin';

const server = process.env.ISSUE18_SSR === '1';
export default defineConfig({
  plugins: [solid({ compiler: 'babel', ssr: true })],
  cacheDir: 'test/runtime-stable-characterization/.cache',
  test: {
    environment: server ? 'node' : 'jsdom',
    include: [`test/runtime-stable-characterization/*.${server ? 'ssr' : 'dom'}.test.tsx`],
    maxWorkers: 1,
    isolate: true,
  },
});
