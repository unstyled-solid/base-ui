import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);
const [command, ...args] = process.argv.slice(2);
// All bootstrap checks are one-shot. Normalize the source project's --no-watch spelling.
const filters = args.filter((arg) => arg !== '--no-watch');
function run(entry, args = [], env = {}) {
  const result = spawnSync(process.execPath, [entry, ...args], {
    stdio: 'inherit', env: { ...process.env, ...env },
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
function tests(target) {
  run(join(dirname(require.resolve('vitest/package.json')), 'vitest.mjs'), [
    'run', '--config', fileURLToPath(new URL('./vitest.config.mjs', import.meta.url)), ...filters,
  ], { BOOTSTRAP_TARGET: target });
}
switch (command) {
  case 'jsdom': tests('jsdom'); break;
  case 'ssr': tests('ssr'); break;
  case 'types':
    run(require.resolve('typescript/bin/tsc'), ['--noEmit', '-p', 'tsconfig.json', ...filters]);
    break;
  case 'contracts':
    run(require.resolve('typescript/bin/tsc'), ['--noEmit', '-p', 'tsconfig.json']);
    run(fileURLToPath(new URL('./identity.mjs', import.meta.url)));
    run(fileURLToPath(new URL('./compiler.mjs', import.meta.url)));
    tests('jsdom');
    tests('ssr');
    break;
  default: {
    const owners = {
      'coverage-map': 'bsolid-inventory',
      package: 'bsolid-dist-build / bsolid-dist-contract',
      browsers: 'bsolid-browser',
      parity: 'bsolid-browser / bsolid-upstream-verify',
    };
    console.error(`Command ${command} is not implemented by bootstrap. Owner: ${owners[command] ?? 'unknown'}. See docs/contracts.md; this is not a passing gate.`);
    process.exitCode = 1;
  }
}
