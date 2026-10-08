import { defineConfig } from 'vitest/config';
import base from '../../../vitest.config.ts';

export default defineConfig({
  ...base,
  cacheDir: 'docs/demos/field/.cache',
  test: { ...base.test, include: ['docs/demos/field/**/*.test.tsx'] },
});
