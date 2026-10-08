import { defineConfig } from 'vitest/config';
import base from '../../../vitest.config';

export default defineConfig({
  ...base,
  cacheDir: 'docs/demos/navigation-menu/.cache',
  test: { ...base.test, include: ['docs/demos/navigation-menu/*.test.tsx'], maxWorkers: 1 },
});
