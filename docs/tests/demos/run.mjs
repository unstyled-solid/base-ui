import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../../../', import.meta.url));
for (const args of [
  ['--test', 'docs/tests/demos/catalog.test.mjs'],
  ['--conditions=browser', '--conditions=development', 'node_modules/vitest/vitest.mjs', 'run', '--config', 'docs/tests/demos/vitest.config.ts'],
  ['docs/tests/demos/browser.mjs'],
]) {
  const result = spawnSync(process.execPath, args, { cwd: root, stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
