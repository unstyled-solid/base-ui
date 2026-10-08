import path from 'node:path';
import { defineConfig } from 'vite';
import solid from '@solidjs/vite-plugin';

export default defineConfig({
  plugins: [solid()],
  cacheDir: path.join(import.meta.dirname, '.cache/build'),
  build: {
    outDir: path.join(import.meta.dirname, '.build'),
    lib: { entry: path.join(import.meta.dirname, 'entry.ts'), formats: ['es'], fileName: 'autocomplete' },
    rolldownOptions: { external: ['solid-js', '@solidjs/web'] },
  },
});
