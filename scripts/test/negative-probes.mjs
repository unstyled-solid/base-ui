import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const cwd = fileURLToPath(new URL('../../', import.meta.url));
const vitest = join(dirname(require.resolve('vitest/package.json')), 'vitest.mjs');
for (const [probe, marker] of [
  ['reactivity', 'HARNESS_REACTIVITY_PROBE'], ['cleanup', 'HARNESS_CLEANUP_FAILURE'],
  ['owner', 'HARNESS_OWNER_LEAK'], ['diagnostic', 'HARNESS_DIAGNOSTICS'], ['conditions', 'HARNESS_SERVER_CONDITIONS'],
  ['identity', 'HARNESS_IDENTITY_PROBE'], ['event-order', 'HARNESS_EVENT_ORDER_PROBE'],
]) {
  const result = spawnSync(process.execPath, [vitest, 'run', '--config', 'vitest.config.ts'], {
    cwd, encoding: 'utf8', env: { ...process.env, HARNESS_TARGET: 'jsdom', HARNESS_PROBE: probe },
  });
  const output = result.stdout + result.stderr;
  assert.equal(result.status, 1, `${probe}: expected test failure, got ${result.status}\n${output}`);
  assert.ok(output.includes(marker), `${probe}: wrong failure, missing ${marker}\n${output}`);
  assert.match(output, /1 failed/, `${probe}: a real test must execute\n${output}`);
  console.log(`PASS: negative ${probe} failed with ${marker}`);
}
const types = spawnSync(process.execPath, [require.resolve('typescript/bin/tsc'), '-p', 'test/contracts/negative/tsconfig.json', '--pretty', 'false'], { cwd, encoding: 'utf8' });
assert.equal(types.status, 2, types.stdout + types.stderr);
assert.match(types.stdout, /type-error\.tsx.*TS2322/, types.stdout);
console.log('PASS: negative native-event type fixture rejected with TS2322');
const missing = spawnSync(process.execPath, [vitest, 'run', '--config', 'vitest.config.ts', 'ThisFilterMustNeverMatch'], { cwd, encoding: 'utf8', env: { ...process.env, HARNESS_TARGET: 'jsdom', HARNESS_PROBE: '' } });
assert.equal(missing.status, 1);
assert.match(missing.stdout + missing.stderr, /No test files found/);
console.log('PASS: unmatched test filter fails closed');
