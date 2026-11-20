import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { verify } from '../../scripts/distribution/verify.mjs';
import { temporaryRoot, sha256 } from '../../scripts/distribution/consumers/policy.mjs';

async function fixture(t, fail) {
  await fs.mkdir(temporaryRoot, { recursive: true });
  const output = await fs.mkdtemp(path.join(temporaryRoot, 'verify-test-'));
  t.after(() => fs.rm(output, { recursive: true, force: true }));
  const calls = [];
  const bytes = Buffer.from('one immutable candidate');
  const execute = async (cwd, logs, name, executable, args) => {
    calls.push({ name, executable, args });
    await fs.mkdir(logs, { recursive: true });
    const stdout = path.join(logs, `${name}.stdout.log`), stderr = path.join(logs, `${name}.stderr.log`);
    await fs.writeFile(stdout, name === 'pack' ? JSON.stringify([{ filename: 'candidate.tgz' }]) : '');
    await fs.writeFile(stderr, name === fail ? 'broken export: ./menu' : '');
    if (name === 'pack') await fs.writeFile(path.join(output, 'candidate.tgz'), bytes);
    return { code: name === fail ? 1 : 0, signal: null, stdout, stderr };
  };
  return { output, execute, calls, bytes };
}

test('verification orders generation and passes one immutable candidate to both archive runners', async t => {
  const f = await fixture(t);
  const report = await verify(f);
  assert.deepEqual(f.calls.map(c => c.name), ['preflight', 'orchestration', 'package', 'api', 'site', 'markdown', 'runtime-docs', 'notices', 'pack', 'public-types', 'interactions', 'qualification', 'consumers']);
  assert.equal(report.status, 'passed');
  assert.equal(report.archiveSha256, sha256(f.bytes));
  for (const call of f.calls.slice(-2)) assert.equal(call.args[call.args.indexOf('--tarball') + 1], report.tarball);
  assert.equal(f.calls.at(-1).args.at(-1), path.join(f.output, 'qualification-0/qualification.json'));
});

test('verification stops on the actual failure and retains the failed stage', async t => {
  const f = await fixture(t, 'package');
  await assert.rejects(verify(f), /package: broken export: .\/menu/);
  assert.deepEqual(f.calls.map(c => c.name), ['preflight', 'orchestration', 'package']);
  const report = JSON.parse(await fs.readFile(path.join(f.output, 'verification.json')));
  assert.equal(report.status, 'failed');
  assert.equal(report.stages.at(-1).status, 'failed');
  assert.equal(report.tarball, undefined);
});

test('a browser failure resumes without rebuilding or repacking the unchanged candidate', async t => {
  const f = await fixture(t, 'interactions');
  await assert.rejects(verify({ ...f, inputs: 'source-a' }), /interactions/);
  const before = f.calls.length;
  const original = f.execute;
  const execute = async (...args) => {
    const result = await original(...args);
    if (args[2] === 'interactions') { result.code = 0; await fs.writeFile(result.stderr, ''); }
    return result;
  };
  const report = await verify({ ...f, execute, inputs: 'source-a', resume: true });
  assert.equal(report.status, 'passed');
  assert.deepEqual(f.calls.slice(before).map(call => call.name), ['preflight', 'interactions', 'qualification', 'consumers']);
  assert.equal(f.calls.filter(call => call.name === 'pack').length, 1);
  await assert.rejects(verify({ ...f, inputs: 'source-b', resume: true }), /inputs changed/);
});
