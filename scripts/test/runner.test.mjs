import { it } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const cwd = fileURLToPath(new URL('../../', import.meta.url));
function run(target, filter, env = {}, args = []) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ['scripts/test/run.mjs', target, filter, '--no-watch', ...args], { cwd, env: { ...process.env, ...env } });
    let output = '';
    child.stdout.on('data', (data) => { output += data; });
    child.stderr.on('data', (data) => { output += data; });
    child.on('error', reject);
    child.on('close', (status) => resolve({ status, output }));
  });
}

it('concurrent independent server compilation and hydration runners retain their own artifacts', async () => {
  const results = await Promise.all([run('jsdom', 'Hydration.test.tsx'), run('ssr', 'Compiler.ssr.test.tsx')]);
  for (const { status, output } of results) {
    assert.equal(status, 0, output);
    assert.match(output, /isolated production SSR compilation/);
    assert.match(output, /1 passed/);
  }
});

it('worker exits remain failed and report the unfinished source file/test with a selected reporter', async () => {
  const { status, output } = await run('jsdom', 'worker-exit', { HARNESS_PROBE: 'worker-exit' }, ['--reporter=dot']);
  assert.equal(status, 1, output);
  assert.match(output, /Worker exited unexpectedly/);
  assert.match(output, /HARNESS_UNFINISHED_MODULE.*worker-exit\.probe\.ts/);
  assert.match(output, /HARNESS_UNFINISHED_TEST.*HARNESS_WORKER_EXIT_PROBE/);
});

it('two real fork workers overlap and isolate module-local TZ from a non-UTC caller', async () => {
  const directory = mkdtempSync(join(cwd, 'test/ssr-harness/.generated/pool-'));
  try {
    const { status, output } = await run('jsdom', 'worker-', {
      HARNESS_PROBE: 'worker-{a,b}', HARNESS_POOL_PROBE: directory, HARNESS_MAX_WORKERS: '2', TZ: 'Europe/Tallinn',
    });
    assert.equal(status, 0, output);
    const a = JSON.parse(readFileSync(join(directory, 'a'), 'utf8'));
    const b = JSON.parse(readFileSync(join(directory, 'b'), 'utf8'));
    assert.notEqual(a.pid, b.pid, 'isolation uses independent real worker processes');
    assert.deepEqual([a.timezone, b.timezone], ['Asia/Tokyo', 'UTC']);
    assert.match(output, /HARNESS_EXECUTION.*maxWorkers=2 TZ=UTC/);
  } finally { rmSync(directory, { recursive: true, force: true }); }
});
