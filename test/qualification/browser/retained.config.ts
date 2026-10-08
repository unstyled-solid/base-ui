import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import shared from '../../../vitest.browser.config.ts';

const files = process.env.QUALIFICATION_SOLID_FILES?.split(',');
if (!files?.length || files.some((file) => !/^(packages\/solid\/|test\/harness\/).+\.test\.tsx?$/.test(file)
  || file.includes('..') || file.includes('*'))) {
  throw new Error('QUALIFICATION_SOLID_FILES must contain explicit retained test paths, not a broad suite/glob');
}
export default defineConfig({
  ...shared,
  root: fileURLToPath(new URL('../../../', import.meta.url)),
  cacheDir: fileURLToPath(new URL('./.cache/retained', import.meta.url)),
  test: {
    ...shared.test,
    name: 'qualification-focused-retained-solid',
    include: files,
    reporters: ['default'],
    browser: {
      ...shared.test?.browser,
      screenshotDirectory: fileURLToPath(new URL('./.cache/retained/screenshots', import.meta.url)),
    },
  },
});
