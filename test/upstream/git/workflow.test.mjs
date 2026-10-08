import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, renameSync, rmSync, symlinkSync } from 'node:fs';
import { join } from 'node:path';
import { hostname } from 'node:os';
import { fileURLToPath } from 'node:url';
import { runUpstream } from '../../../scripts/upstream/git/workflow.mjs';
import { hash, json, saveState, sourcePaths, withSourceLock } from '../../../scripts/upstream/git/state.mjs';
import { fixture, g, write, commit } from './fixtures.mjs';

const cli = fileURLToPath(new URL('../../../scripts/upstream/cli.mjs', import.meta.url));
const run = (f, command, options = {}) => runUpstream({ root: f.root, source: f.source, command, ...options });
const fails = (fn, code) => assert.throws(fn, (error) => error.code === code, `expected ${code}`);
const bytes = (path) => readFileSync(path, 'utf8');
function checkPin(f, sha) { assert.equal(g(f.checkout, 'rev-parse', 'HEAD'), sha); }

test('fresh clone init and read-only status preserve null parity and parent gitlink', (t) => {
  const f = fixture(t, { initialized: false });
  const state = bytes(f.paths.state);
  const index = g(f.root, 'ls-files', '--stage');
  assert.equal(run(f, 'status').checkout.missing, true);
  assert.equal(run(f, 'init').outcome, 'init');
  checkPin(f, f.baseline);
  assert.equal(run(f, 'init').outcome, 'unchanged');
  assert.equal(run(f, 'status').parity, 'unverified');
  assert.equal(bytes(f.paths.state), state);
  assert.equal(g(f.root, 'ls-files', '--stage'), index);
  assert.equal(existsSync(f.paths.journal), false);
});

test('same SHA is byte-identical no-op; advancing creates complete immutable raw report', (t) => {
  const f = fixture(t);
  const original = bytes(f.paths.state);
  assert.equal(run(f, 'update').outcome, 'unchanged');
  assert.equal(bytes(f.paths.state), original);
  renameSync(join(f.producer, 'rename me.txt'), join(f.producer, 'renamed\nfile.txt'));
  rmSync(join(f.producer, 'delete.txt'));
  write(join(f.producer, 'added.txt'), 'added\n');
  const next = f.advance();
  const result = run(f, 'update');
  assert.equal(result.outcome, 'update');
  assert.equal(result.state.verifiedParitySha, null);
  assert.equal(result.state.baselineSourceSha, f.baseline);
  checkPin(f, next);
  const dir = join(f.paths.episodes, `${f.baseline}-${next}`);
  const reportText = bytes(join(dir, 'report.json'));
  const report = JSON.parse(reportText);
  assert.equal(hash(reportText), result.state.activeEpisode.reportHash);
  assert.deepEqual(report.commits, [next]);
  assert.ok(report.changes.some((c) => c.status === 'R' && c.oldPath === 'rename me.txt' && c.newPath === 'renamed\nfile.txt'));
  assert.ok(report.changes.some((c) => c.status === 'D' && c.newPath === null));
  assert.ok(report.changes.some((c) => c.status === 'A' && c.oldPath === null));
  assert.ok(report.changes.every((c) => c.disposition === 'untriaged'));
  const stateText = bytes(f.paths.state);
  assert.equal(run(f, 'update').outcome, 'unchanged');
  assert.equal(bytes(f.paths.state), stateText);
  assert.equal(bytes(join(dir, 'report.json')), reportText);
});

test('active worker checkout is frozen while later fetches queue; previous verified pin survives', (t) => {
  const f = fixture(t);
  saveState(f.paths, { ...f.state, verifiedParitySha: f.baseline, provenance: { preserved: true } });
  const next = f.advance('next');
  run(f, 'update');
  const later = f.advance('later');
  assert.equal(run(f, 'update').outcome, 'queue');
  checkPin(f, next);
  assert.equal(f.readState().queuedCandidateSha, later);
  assert.equal(f.readState().verifiedParitySha, f.baseline);
  assert.deepEqual(f.readState().provenance, { preserved: true });
  assert.equal(g(f.checkout, 'rev-parse', `refs/baseui-solid2/base-ui/pins/${f.baseline}`), f.baseline);
  assert.equal(run(f, 'update').outcome, 'unchanged');
  // Simulate the separately owned verifier after it has validated exact evidence.
  withSourceLock(f.paths, () => saveState(f.paths, { ...f.readState(), activeEpisode: null, verifiedParitySha: next }));
  assert.equal(run(f, 'update').outcome, 'update');
  checkPin(f, later);
  assert.equal(f.readState().activeEpisode.fromSha, next);
  assert.equal(f.readState().verifiedParitySha, next);
});

for (const kind of ['tracked', 'untracked', 'ignored', 'staged']) {
  test(`dirty ${kind} work is never overwritten by init/update/abandon`, (t) => {
    const f = fixture(t);
    const file = kind === 'tracked' || kind === 'staged' ? 'source.txt' : kind === 'ignored' ? 'ignored.txt' : 'personal.txt';
    const path = join(f.checkout, file);
    write(path, 'developer work\n');
    if (kind === 'staged') g(f.checkout, 'add', file);
    const state = bytes(f.paths.state);
    const gitStatus = g(f.checkout, 'status', '--porcelain=v1', '--ignored');
    f.advance();
    for (const command of ['init', 'update', 'abandon']) fails(() => run(f, command, { reason: 'fixture' }), 'DIRTY_SOURCE');
    assert.equal(bytes(path), 'developer work\n');
    assert.equal(bytes(f.paths.state), state);
    assert.equal(g(f.checkout, 'status', '--porcelain=v1', '--ignored'), gitStatus);
    checkPin(f, f.baseline);
  });
}

test('one-command update initializes a fresh clone before freezing its next candidate', (t) => {
  const f = fixture(t, { initialized: false });
  const next = f.advance();
  assert.equal(run(f, 'update').outcome, 'update');
  checkPin(f, next);
  assert.equal(f.readState().activeEpisode.fromSha, f.baseline);
  assert.equal(f.readState().verifiedParitySha, null);
});

test('missing active worker checkout is not silently recreated by update', (t) => {
  const f = fixture(t);
  const next = f.advance(); run(f, 'update');
  rmSync(f.checkout, { recursive: true });
  fails(() => run(f, 'update'), 'MISSING_SUBMODULE');
  assert.equal(existsSync(f.checkout), false);
  assert.equal(run(f, 'init').outcome, 'init');
  checkPin(f, next);
});

test('remote failure leaves state and checkout intact', (t) => {
  const f = fixture(t);
  renameSync(f.remote, `${f.remote}.offline`);
  const state = bytes(f.paths.state);
  fails(() => run(f, 'update'), 'GIT_FAILED');
  assert.equal(bytes(f.paths.state), state);
  checkPin(f, f.baseline);
});

test('rewritten upstream history and branch rollback fail without moving candidate', (t) => {
  const f = fixture(t);
  const next = f.advance(); run(f, 'update');
  g(f.remote, 'update-ref', `refs/heads/${f.branch}`, f.baseline);
  fails(() => run(f, 'update'), 'NON_ANCESTOR');
  g(f.producer, 'checkout', '--orphan', 'rewritten');
  write(join(f.producer, 'source.txt'), 'rewritten\n');
  const orphan = commit(f.producer, 'rewritten root');
  g(f.remote, 'fetch', f.producer, 'rewritten');
  g(f.remote, 'update-ref', `refs/heads/${f.branch}`, orphan);
  fails(() => run(f, 'update'), 'NON_ANCESTOR');
  checkPin(f, next);
});

test('missing recorded commit does not guess a baseline', (t) => {
  const f = fixture(t);
  saveState(f.paths, { ...f.state, baselineSourceSha: '1'.repeat(40) });
  fails(() => run(f, 'update'), 'MISSING_COMMIT');
  checkPin(f, f.baseline);
});

test('wrong URL, metadata branch, local URL and attached branch are rejected', (t) => {
  const f = fixture(t);
  g(f.checkout, 'remote', 'set-url', 'origin', `${f.remote}.wrong`);
  fails(() => run(f, 'update'), 'WRONG_REMOTE');
  g(f.checkout, 'remote', 'set-url', 'origin', f.remote);
  g(f.root, 'config', '-f', '.gitmodules', 'submodule.upstream/base-ui.branch', 'other');
  fails(() => run(f, 'init'), 'SUBMODULE_CONFIG');
  g(f.root, 'config', '-f', '.gitmodules', 'submodule.upstream/base-ui.branch', f.branch);
  g(f.root, 'config', 'submodule.upstream/base-ui.url', 'wrong');
  fails(() => run(f, 'update'), 'SUBMODULE_CONFIG');
  g(f.root, 'config', 'submodule.upstream/base-ui.url', f.remote);
  g(f.checkout, 'checkout', '-b', 'worker-branch');
  fails(() => run(f, 'update'), 'WRONG_BRANCH');
});

test('checkout movement and symlink into a reference are rejected without touching it', (t) => {
  const f = fixture(t);
  const next = f.advance();
  g(f.checkout, 'fetch', 'origin', f.branch);
  g(f.checkout, 'checkout', '--detach', next);
  fails(() => run(f, 'init'), 'CHECKOUT_MOVED');
  fails(() => run(f, 'update'), 'CHECKOUT_MOVED');
  const reference = join(f.temp, 'reference');
  renameSync(f.checkout, reference);
  write(join(reference, 'source.txt'), 'reference work\n');
  symlinkSync(reference, f.checkout);
  fails(() => run(f, 'init'), 'UNSAFE_PATH');
  assert.equal(bytes(join(reference, 'source.txt')), 'reference work\n');
});

test('abandon requires explanation, restores from pin and retains immutable report and prior parity', (t) => {
  const f = fixture(t);
  saveState(f.paths, { ...f.state, verifiedParitySha: f.baseline });
  const next = f.advance(); run(f, 'update');
  const report = join(f.paths.episodes, `${f.baseline}-${next}`, 'report.json');
  const reportBytes = bytes(report);
  fails(() => run(f, 'abandon'), 'REASON_REQUIRED');
  assert.equal(run(f, 'abandon', { reason: 'coordinator halted fixture' }).outcome, 'abandon');
  checkPin(f, f.baseline);
  assert.equal(f.readState().verifiedParitySha, f.baseline);
  assert.equal(f.readState().activeEpisode, null);
  assert.equal(bytes(report), reportBytes);
  assert.ok(existsSync(join(f.paths.episodes, `${f.baseline}-${next}`, 'abandoned.json')));
  assert.equal(run(f, 'abandon').outcome, 'unchanged');
  fails(() => run(f, 'update'), 'ABANDONED_RANGE');
});

for (const point of ['journal', 'artifacts', 'checkout', 'state-temp', 'state']) {
  test(`interruption after ${point} resumes the frozen candidate rather than new remote tip`, (t) => {
    const f = fixture(t);
    const next = f.advance();
    assert.throws(() => run(f, 'update', { checkpoint: (stage) => { if (stage === point) throw new Error('simulated interruption'); } }), /simulated interruption/);
    assert.ok(existsSync(f.paths.journal));
    assert.equal(existsSync(f.paths.lock), false);
    f.advance('later');
    assert.equal(run(f, 'status').pendingTransaction, true);
    assert.equal(run(f, 'update').outcome, 'resumed');
    checkPin(f, next);
    assert.equal(f.readState().fetchedCandidateSha, next);
    assert.equal(existsSync(f.paths.journal), false);
  });
}

test('dirty interrupted checkout blocks resume and retains intent for later recovery', (t) => {
  const f = fixture(t); const next = f.advance();
  assert.throws(() => run(f, 'update', { checkpoint: () => { throw new Error('stop'); } }), /stop/);
  write(join(f.checkout, 'personal.txt'), 'saved\n');
  fails(() => run(f, 'update'), 'DIRTY_SOURCE');
  assert.ok(existsSync(f.paths.journal));
  assert.equal(bytes(join(f.checkout, 'personal.txt')), 'saved\n');
  rmSync(join(f.checkout, 'personal.txt')); // Fixture user resolves own work.
  run(f, 'update'); checkPin(f, next);
});

test('init intent survives interruption between clone and recorded candidate checkout', (t) => {
  const f = fixture(t, { initialized: false });
  const next = f.advance();
  saveState(f.paths, { ...f.state, fetchedCandidateSha: next });
  assert.throws(() => run(f, 'init', { checkpoint: (point) => {
    if (point === 'initialized') throw new Error('clone interrupted');
  } }), /clone interrupted/);
  checkPin(f, f.baseline);
  assert.equal(run(f, 'init').outcome, 'resumed');
  checkPin(f, next);
  assert.equal(f.readState().verifiedParitySha, null);
  assert.equal(g(f.root, 'ls-files', '--stage', '--', f.state.submodulePath).slice(7, 47), f.baseline);
});

test('interrupted abandonment resumes after its tombstone exists', (t) => {
  const f = fixture(t); f.advance(); run(f, 'update');
  assert.throws(() => run(f, 'abandon', { reason: 'stop batch', checkpoint: (point) => {
    if (point === 'artifacts') throw new Error('abandon interrupted');
  } }), /abandon interrupted/);
  assert.equal(run(f, 'abandon').outcome, 'resumed');
  checkPin(f, f.baseline);
  assert.equal(f.readState().activeEpisode, null);
});

test('out-of-band state mutation blocks journal replay without losing either record', (t) => {
  const f = fixture(t); f.advance();
  assert.throws(() => run(f, 'update', { checkpoint: () => { throw new Error('stop'); } }), /stop/);
  saveState(f.paths, { ...f.readState(), coordinatorNote: 'concurrent edit' });
  fails(() => run(f, 'update'), 'STATE_CONFLICT');
  assert.equal(f.readState().coordinatorNote, 'concurrent edit');
  assert.ok(existsSync(f.paths.journal));
  checkPin(f, f.baseline);
});

test('external reference Git metadata is rejected even without a checkout symlink', (t) => {
  const f = fixture(t);
  // Point only the .git indirection at an independent reference, not a submodule.
  write(join(f.checkout, '.git'), `gitdir: ${join(f.producer, '.git')}\n`);
  const head = g(f.producer, 'rev-parse', 'HEAD');
  fails(() => run(f, 'update'), 'EXTERNAL_GIT_DIR');
  assert.equal(g(f.producer, 'rev-parse', 'HEAD'), head);
  assert.equal(g(f.producer, 'status', '--porcelain'), '');
});

test('immutable collision and stale report fail closed', (t) => {
  const f = fixture(t); const next = f.advance();
  const path = join(f.paths.episodes, `${f.baseline}-${next}`, 'report.json');
  write(path, 'historical report, do not replace\n');
  fails(() => run(f, 'update'), 'IMMUTABLE_CONFLICT');
  assert.equal(bytes(path), 'historical report, do not replace\n');
  checkPin(f, f.baseline);
  rmSync(path); // Fixture coordinator restores the missing valid artifact via journal.
  run(f, 'update');
  write(path, '{}\n');
  fails(() => run(f, 'update'), 'STALE_REPORT');
  checkPin(f, next);
});

test('lock serializes independent CLI process, status stays readable, live lock cannot be stolen', (t) => {
  const f = fixture(t);
  withSourceLock(f.paths, () => {
    const result = spawnSync('rtk', ['proxy', process.execPath, cli, 'update', '--root', f.root], { encoding: 'utf8' });
    assert.equal(result.status, 1);
    assert.equal(JSON.parse(result.stderr).error, 'LOCKED');
    const owner = run(f, 'status').lock;
    fails(() => run(f, 'unlock', { token: owner.token }), 'LOCK_LIVE');
  });
  assert.equal(existsSync(f.paths.lock), false);
});

test('dead local locks require exact token before transaction resume', (t) => {
  const f = fixture(t);
  const exited = spawnSync('rtk', ['proxy', process.execPath, '-e', 'process.stdout.write(String(process.pid))'], { encoding: 'utf8' });
  assert.equal(exited.status, 0);
  write(f.paths.lock, json({ host: hostname(), pid: Number(exited.stdout), token: 'dead-fixture' }));
  fails(() => run(f, 'update'), 'LOCKED');
  fails(() => run(f, 'unlock', { token: 'wrong' }), 'LOCK_RECOVERY');
  assert.equal(run(f, 'unlock', { token: 'dead-fixture' }).outcome, 'unlocked');
  assert.equal(run(f, 'update').outcome, 'unchanged');
});

test('source selection supports independent donor branch, SHA and state without touching Base UI', (t) => {
  const f = fixture(t);
  const donor = fixture(t, { source: 'solid-floating-ui', branch: 'main' });
  // Register a second independent fixture source in the SAME consumer repository.
  const donorState = donor.state;
  write(join(f.root, 'tracking/donors/solid-floating-ui.json'), json(donorState));
  write(join(f.root, '.gitmodules'), bytes(join(f.root, '.gitmodules')) + bytes(join(donor.root, '.gitmodules')));
  g(f.root, 'update-index', '--add', '--cacheinfo', `160000,${donor.baseline},upstream/solid-floating-ui`);
  const baseBytes = bytes(f.paths.state);
  const adaptation = join(f.root, 'packages/solid/src/internals/createBaseUIFloating.ts');
  write(adaptation, '// owned RC13 adaptation: preserve these bytes\n');
  runUpstream({ root: f.root, source: 'solid-floating-ui', command: 'init' });
  const next = donor.advance('donor next');
  withSourceLock(f.paths, () => {
    const result = runUpstream({ root: f.root, source: 'solid-floating-ui', command: 'update' });
    assert.equal(result.state.branch, 'main');
    assert.equal(result.state.fetchedCandidateSha, next);
    assert.equal(result.state.verifiedParitySha, null);
  });
  assert.equal(bytes(f.paths.state), baseBytes);
  checkPin(f, f.baseline);
  const cliResult = spawnSync('rtk', ['proxy', process.execPath, cli, 'status', '--root', f.root, '--source', 'solid-floating-ui', '--json'], { encoding: 'utf8' });
  assert.equal(cliResult.status, 0);
  assert.equal(JSON.parse(cliResult.stdout).source, 'solid-floating-ui');
  const donorPaths = sourcePaths(f.root, 'solid-floating-ui');
  const donorCheckout = join(f.root, donorState.submodulePath);
  assert.equal(g(donorCheckout, 'rev-parse', 'HEAD'), donor.baseline, 'first donor update must leave baseline HEAD fixed');
  const later = donor.advance('donor later');
  const executeDonor = (command, options) => runUpstream({ root: f.root, source: 'solid-floating-ui', command, ...options });
  assert.equal(executeDonor('update').outcome, 'queue');
  assert.equal(g(donorCheckout, 'rev-parse', 'HEAD'), donor.baseline);
  assert.equal(JSON.parse(bytes(donorPaths.state)).queuedCandidateSha, later);
  executeDonor('abandon', { reason: 'donor fixture coordinator' });
  assert.equal(g(donorCheckout, 'rev-parse', 'HEAD'), donor.baseline);
  assert.throws(() => executeDonor('update', { checkpoint: (point) => {
    if (point === 'state-temp') throw new Error('donor interruption');
  } }), /donor interruption/);
  assert.equal(executeDonor('update').outcome, 'resumed');
  assert.equal(g(donorCheckout, 'rev-parse', 'HEAD'), donor.baseline);
  assert.equal(JSON.parse(bytes(donorPaths.state)).fetchedCandidateSha, later);
  assert.equal(bytes(adaptation), '// owned RC13 adaptation: preserve these bytes\n');
  assert.equal(bytes(f.paths.state), baseBytes);
  checkPin(f, f.baseline);
  fails(() => run(f, 'verify'), 'UNKNOWN_COMMAND');
  fails(() => runUpstream({ root: f.root, source: '../ref', command: 'status' }), 'UNKNOWN_SOURCE');
});
