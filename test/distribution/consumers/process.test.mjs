import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { command } from '../../../scripts/distribution/consumers/process.mjs';
import { temporaryRoot } from '../../../scripts/distribution/consumers/policy.mjs';

async function fixture(run) {
  const directory = await fs.mkdtemp(path.join(temporaryRoot, 'bsolid-consumer-unit-'));
  try { await run(directory); } finally { await fs.rm(directory, { recursive: true, force: true }); }
}
test('command evidence retains exact untruncated stdout/stderr and nonzero exit', async () => fixture(async directory => {
  const stdout = '\u001b[31mexact diagnostic\u001b[0m\n' + 'x'.repeat(70_000) + '\n';
  const stderr = 'TS2307: π missing dependency\n';
  const args = ['-e', `process.stdout.write(${JSON.stringify(stdout)}); process.stderr.write(${JSON.stringify(stderr)}); process.exitCode=7;`];
  const result = await command(directory, directory, 'failure', process.execPath, args, { allowFailure: true });
  assert.equal(result.code, 7); assert.equal(result.timedOut, false);
  assert.deepEqual(result.command, ['rtk', 'proxy', process.execPath, ...args]);
  assert.equal(await fs.readFile(result.stdout, 'utf8'), stdout);
  assert.equal(await fs.readFile(result.stderr, 'utf8'), stderr);
  const saved = JSON.parse(await fs.readFile(path.join(directory, 'failure.command.json')));
  assert.equal(saved.code, 7); assert.equal(saved.cwd, directory);
}));
test('failed and timed-out child execution cannot return successful evidence', async () => fixture(async directory => {
  await assert.rejects(command(directory, directory, 'nonzero', process.execPath, ['-e', 'process.exit(3)']), /Command failed/);
  const result = await command(directory, directory, 'timeout', process.execPath, ['-e', 'setInterval(()=>{},1000)'], { timeout: 50, allowFailure: true });
  assert.equal(result.timedOut, true);
  assert(result.code !== 0 || result.signal);
  assert.equal(JSON.parse(await fs.readFile(path.join(directory, 'timeout.command.json'))).timedOut, true);
}));
