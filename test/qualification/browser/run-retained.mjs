import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const args = process.argv.slice(2).filter((arg) => arg !== '--no-watch');
const option = (name) => args.includes(name) ? args[args.indexOf(name) + 1] : undefined;
for (let i = 0; i < args.length; i++) {
  if (['--browsers', '--files', '--test-name'].includes(args[i]) && args[i + 1] && !args[i + 1].startsWith('--')) { i++; continue; }
  throw new Error(`Unknown/incomplete argument ${args[i]}`);
}
if (!option('--files') || !option('--test-name')) throw new Error('Use --files <explicit-paths> AND --test-name <pattern>; broad concurrent suite replay is not allowed');
const browsers = option('--browsers') ?? 'chromium,firefox,webkit';
const result = spawnSync('rtk', ['proxy', 'env', `HARNESS_BROWSERS=${browsers}`,
  `QUALIFICATION_SOLID_FILES=${option('--files')}`, process.execPath,
  resolve(root, 'node_modules/vitest/vitest.mjs'), 'run', '--config',
  fileURLToPath(new URL('./retained.config.ts', import.meta.url)), '--testNamePattern', option('--test-name')], {
  cwd: root, stdio: 'inherit', timeout: 120_000,
});
if (result.error) console.error(result.error.message);
process.exitCode = result.status === 0 ? 0 : 1;
