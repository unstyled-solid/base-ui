import { defineConfig } from 'vitest/config';
import shared from '../../../vitest.config.ts';

export default defineConfig({
  ...shared,
  test: {
    ...shared.test,
    include: ['docs/tests/runtime-probe/**/*.test.tsx'],
    exclude: [],
  },
});
