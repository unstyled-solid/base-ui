import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { parseCli, executeCli } from '../../../scripts/upstream/cli.mjs';
import { json, withSourceLock, sourcePaths } from '../../../scripts/upstream/git/state.mjs';
import { validateGates } from '../../../scripts/upstream/verify/evidence.mjs';
import { fixture, seed, bytes, write, descriptor, pins, g } from './fixtures.mjs';

const cli = fileURLToPath(new URL('../../../scripts/upstream/cli.mjs', import.meta.url));
const digest = 'a'.repeat(64);
const proofArgs = (f) => {
  const reference = descriptor(f.root, 'proof/evidence.json');
  return ['verify', '--root', f.root, '--source', f.source, '--evidence-path', reference.path, '--evidence-hash', reference.sha256];
};
const fails = (fn, code) => assert.throws(fn, (error) => error.code === code, `expected ${code}`);
const invoke = (args, cwd = tmpdir()) => spawnSync('rtk', ['proxy', process.execPath, cli, ...args], { cwd, encoding: 'utf8' });

test('CLI command schema: strict evidence, selectors, duplicate flags and command-scoped options', () => {
  assert.deepEqual(parseCli([]), { command: 'status' });
  assert.deepEqual(parseCli(['verify', '--evidence-path', 'proof/evidence.json', '--evidence-hash', digest]),
    { command: 'verify', evidencePath: 'proof/evidence.json', evidenceHash: digest, advance: false });
  assert.equal(parseCli(['verify', '--advance', '--source', 'solid-floating-ui', '--evidence-path', 'proof.json', '--evidence-hash', digest]).advance, true);
  for (const [args, code] of [
    [['verify'], 'MISSING_EVIDENCE'],
    [['verify', '--evidence-path', 'proof.json'], 'MISSING_EVIDENCE'],
    [['verify', '--evidence-hash', digest], 'MISSING_EVIDENCE'],
    [['verify', '--evidence-path'], 'INVALID_OPTIONS'],
    [['verify', '--evidence-hash', '--json'], 'INVALID_OPTIONS'],
    [['verify', '--evidence-path', 'proof.json', '--evidence-hash', 'A'.repeat(64)], 'INVALID_OPTIONS'],
    [['verify', '--evidence-path', 'proof.json', '--evidence-hash', 'a'.repeat(63)], 'INVALID_OPTIONS'],
    [['verify', '--evidence-path', '../proof.json', '--evidence-hash', digest], 'UNSAFE_PATH'],
    [['verify', '--evidence-path', '/proof.json', '--evidence-hash', digest], 'UNSAFE_PATH'],
    [['verify', '--evidence-path', 'proof\\file.json', '--evidence-hash', digest], 'UNSAFE_PATH'],
    [['verify', '--evidence-path', './proof.json', '--evidence-hash', digest], 'UNSAFE_PATH'],
    [['verify', '--evidence-path', 'proof//file.json', '--evidence-hash', digest], 'UNSAFE_PATH'],
    [['verify', '--evidence-path', 'proof\0.json', '--evidence-hash', digest], 'INVALID_OPTIONS'],
    [['verify', '--evidence-path', 'proof.json', '--evidence-path', 'other.json'], 'INVALID_OPTIONS'],
    [['verify', '--evidence-hash', digest, '--evidence-hash', digest], 'INVALID_OPTIONS'],
    [['verify', '--advance', '--advance'], 'INVALID_OPTIONS'],
    [['status', '--json', '--json'], 'INVALID_OPTIONS'],
    [['status', '--no-watch', '--no-watch'], 'INVALID_OPTIONS'],
    [['status', '--source', 'base-ui', '--source', 'base-ui'], 'INVALID_OPTIONS'],
    [['status', '--evidence-path', 'proof.json'], 'INVALID_OPTIONS'],
    [['update', '--advance'], 'INVALID_OPTIONS'],
    [['verify', '--token', 'owner'], 'INVALID_OPTIONS'],
    [['verify', '--reason', 'approval'], 'INVALID_OPTIONS'],
    [['status', '--source', 'all'], 'UNKNOWN_SOURCE'],
    [['other'], 'UNKNOWN_COMMAND'],
    [['verify', '--fixture'], 'INVALID_OPTIONS'],
    [['status', '--help', '--json'], 'INVALID_OPTIONS'],
  ]) fails(() => parseCli(args), code);
});

test('CLI routes only verify to core, preserving transport command arguments', () => {
  const calls = [];
  const services = { upstream: (options) => { calls.push(['transport', options]); return { outcome: 'transport' }; },
    verify: (options) => { calls.push(['verify', options]); return { outcome: 'eligible' }; } };
  for (const command of ['init', 'update', 'status', 'abandon', 'unlock']) {
    const args = [command, '--source', 'solid-floating-ui', '--root', '/fixture', '--json', '--no-watch'];
    if (command === 'abandon') args.push('--reason', 'coordinator stop');
    if (command === 'unlock') args.push('--token', 'exact-owner-token');
    executeCli(args, services);
    assert.equal(calls.at(-1)[0], 'transport');
    assert.equal(calls.at(-1)[1].command, command);
    assert.equal(calls.at(-1)[1].source, 'solid-floating-ui');
  }
  const args = ['verify', '--source', 'base-ui', '--root', '/fixture', '--evidence-path', 'proof.json', '--evidence-hash', digest];
  executeCli(args, services);
  assert.deepEqual(calls.at(-1), ['verify', { source: 'base-ui', root: '/fixture', evidencePath: 'proof.json', evidenceHash: digest, advance: false }]);
  executeCli([...args, '--advance'], services);
  assert.equal(calls.at(-1)[1].advance, true);
  const count = calls.length;
  fails(() => executeCli(['update', '--evidence-hash', digest], services), 'INVALID_OPTIONS');
  assert.equal(calls.length, count);
});

test('executable CLI produces structured schema errors and strict help without touching repositories', () => {
  for (const [args, expected] of [[['verify'], 'MISSING_EVIDENCE'], [['status', '--advance'], 'INVALID_OPTIONS'],
    [['verify', '--evidence-path', 'proof.json', '--evidence-hash', 'not-a-hash'], 'INVALID_OPTIONS']]) {
    const result = invoke(args);
    assert.equal(result.status, 1); assert.equal(result.stdout, '');
    const error = JSON.parse(result.stderr); assert.equal(error.error, expected); assert.equal(typeof error.message, 'string');
  }
  const help = invoke(['verify', '--help']);
  assert.equal(help.status, 0); assert.match(help.stdout, /check-only by default/); assert.match(help.stdout, /--evidence-hash/);
  const bypass = invoke(['verify', '--help', '--advance']);
  assert.equal(bypass.status, 1); assert.equal(JSON.parse(bypass.stderr).error, 'INVALID_OPTIONS');
});

test('routed real core: default check-only, explicit fixture advance, retained queue and idempotence', (t) => {
  const f = fixture(t, { 'base-ui': seed(t, 'base-ui') }); f.queue();
  const before = bytes(f.paths.state);
  const services = { verify: f.verify, upstream: () => assert.fail('verify must never invoke fetch/transport') };
  assert.equal(executeCli(proofArgs(f), services).outcome, 'eligible');
  assert.equal(bytes(f.paths.state), before);
  const result = executeCli([...proofArgs(f), '--advance'], services);
  assert.equal(result.outcome, 'advanced'); assert.equal(result.scope, 'fixture');
  assert.equal(result.state.queuedCandidateSha, pins['base-ui'].later);
  assert.equal(result.state.baselineSourceSha, pins['base-ui'].from);
  assert.equal(executeCli([...proofArgs(f), '--advance'], services).outcome, 'unchanged');
});

test('executable production route rejects fixture scope with and without explicit advance', (t) => {
  const f = fixture(t, { 'base-ui': seed(t, 'base-ui') });
  const before = bytes(f.paths.state);
  for (const extra of [[], ['--advance']]) {
    const result = invoke([...proofArgs(f), ...extra], f.root);
    assert.equal(result.status, 1); assert.equal(JSON.parse(result.stderr).error, 'INVALID_EVIDENCE');
    assert.equal(bytes(f.paths.state), before); assert.equal(existsSync(f.paths.lock), false);
  }
});

test('explicit advance cannot bypass final approval or omitted open parity tickets', (t) => {
  const seeds = { 'base-ui': seed(t, 'base-ui') };
  const initial = fixture(t, seeds, 'base-ui', { initial: true });
  const before = bytes(initial.paths.state);
  const issues = initial.getIssues(); issues.find((issue) => issue.id === 'bsolid-release-ready').metadata = {};
  initial.setIssues(issues);
  fails(() => executeCli([...proofArgs(initial), '--advance'], { verify: initial.verify }), 'INITIAL_QUALIFICATION');
  assert.equal(bytes(initial.paths.state), before);
  const f = fixture(t, seeds);
  // Production always asks this join to include coordinator approval, even for
  // weekly candidates. An explicit CLI flag is not that approval.
  fails(() => validateGates(f.root, f.bundle, f.plan, f.tuple, true), 'MISSING_GATE');
  f.setIssues([...f.getIssues(), { id: 'unlisted-parity-task', status: 'blocked', type: 'task', labels: ['parity'], dependencies: [] }]);
  fails(() => executeCli([...proofArgs(f), '--advance'], { verify: f.verify }), 'OPEN_BLOCKER');
  assert.equal(f.readState().verifiedParitySha, pins['base-ui'].from);
});

test('pending transaction arriving during preparation is refused under the shared lock', (t) => {
  const f = fixture(t, { 'base-ui': seed(t, 'base-ui') });
  const before = bytes(f.paths.state);
  fails(() => f.verify({ advance: true, checkpoint: (stage) => { if (stage === 'prepared') write(f.paths.journal, '{}\n'); } }), 'PENDING_TRANSACTION');
  assert.equal(bytes(f.paths.state), before); assert.equal(existsSync(f.paths.lock), false); assert.equal(bytes(f.paths.journal), '{}\n');
});

test('retained receipt cannot authorize provenance/baseline changes on replay', (t) => {
  const f = fixture(t, { 'base-ui': seed(t, 'base-ui') });
  const result = f.verify({ advance: true });
  const before = bytes(f.paths.state);
  const receiptPath = join(f.root, result.receiptPath);
  const receipt = JSON.parse(bytes(receiptPath)); receipt.after.baselineSourceSha = pins['base-ui'].to;
  write(receiptPath, json(receipt));
  fails(() => f.verify({ advance: true }), 'STATE_CONFLICT');
  assert.equal(bytes(f.paths.state), before);
});

test('donor routing retains baseline and refuses oracle lock, pending journal and dirty source', (t) => {
  const f = fixture(t, { 'base-ui': seed(t, 'base-ui'), 'solid-floating-ui': seed(t, 'solid-floating-ui') }, 'solid-floating-ui');
  const before = bytes(f.paths.state);
  const oraclePaths = sourcePaths(f.root, 'base-ui');
  withSourceLock(oraclePaths, () => fails(() => executeCli(proofArgs(f), { verify: f.verify }), 'LOCKED'));
  assert.equal(g(f.checkout, 'rev-parse', 'HEAD'), pins['solid-floating-ui'].from);
  const personal = join(f.checkout, 'personal.txt');
  write(personal, 'preserve donor user work\n');
  fails(() => executeCli(proofArgs(f), { verify: f.verify }), 'DIRTY_SOURCE');
  assert.equal(bytes(personal), 'preserve donor user work\n');
  rmSync(personal); // Fixture user resolves its own work; verifier never does.
  write(f.paths.journal, '{}\n');
  fails(() => executeCli(proofArgs(f), { verify: f.verify }), 'PENDING_TRANSACTION');
  assert.equal(bytes(f.paths.state), before);
  // The core suite independently proves successful donor qualification. Here the
  // pending source journal is retained, never auto-recovered by verify.
});

test('CLI rejects missing/malformed exact evidence files without source/state writes', (t) => {
  const f = fixture(t, { 'base-ui': seed(t, 'base-ui') });
  const before = bytes(f.paths.state);
  const missing = invoke(['verify', '--root', f.root, '--evidence-path', 'proof/absent.json', '--evidence-hash', digest, '--advance']);
  assert.equal(missing.status, 1); assert.equal(JSON.parse(missing.stderr).error, 'MISSING_EVIDENCE');
  write(join(f.root, 'proof/invalid.json'), 'not-json\n');
  const ref = descriptor(f.root, 'proof/invalid.json');
  const invalid = invoke(['verify', '--root', f.root, '--evidence-path', ref.path, '--evidence-hash', ref.sha256]);
  assert.equal(invalid.status, 1); assert.equal(JSON.parse(invalid.stderr).error, 'INVALID_EVIDENCE');
  assert.equal(bytes(f.paths.state), before); assert.equal(existsSync(f.paths.lock), false);
});
