import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { hash, json, withSourceLock } from '../../../scripts/upstream/git/state.mjs';
import { createFixtureVerifier, runVerification } from '../../../scripts/upstream/verify/core.mjs';
import { auditBeads } from '../../../scripts/upstream/verify/beads.mjs';
import { seed, fixture, write, bytes, descriptor, g, pins, verifierWorkerProgram } from './fixtures.mjs';

const fails = (fn, code) => assert.throws(fn, (error) => error.code === code, `expected ${code}`);

test('real immutable Base UI range: bounded fail-closed verifier and isolated recovery', async (t) => {
  const seeds = { 'base-ui': seed(t, 'base-ui') };
  for (const [name, mutate, code] of [
    ['missing mandatory gate', (f) => { f.bundle.gates.pop(); f.republish(); }, 'MISSING_GATE'],
    ['missing Firefox platform', (f) => { f.bundle.gates = f.bundle.gates.filter((ref) => !ref.path.includes('browser-firefox')); f.republish(); }, 'MISSING_GATE'],
    ['failed browser', (f) => f.changeGate('browser-chromium', (gate) => { gate.status = 'failed'; gate.failures = 1; }), 'FAILED_GATE'],
    ['stale gate source SHA', (f) => f.changeGate('unit-node', (gate) => { gate.tuple.candidateSha = '1'.repeat(40); }), 'STALE_GATE'],
    ['gate diagnostics', (f) => f.changeGate('unit-node', (gate) => { gate.diagnostics = 1; }), 'FAILED_GATE'],
    ['missing artifact', (f) => rmSync(join(f.root, 'proof/package.tgz')), 'MISSING_EVIDENCE'],
    ['changed artifact bytes', (f) => write(join(f.root, 'proof/package.tgz'), 'changed'), 'EVIDENCE_HASH'],
    ['changed report', (f) => write(join(f.paths.episodes, f.readState().activeEpisode.id, 'report.json'), '{}\n'), 'STALE_REPORT'],
    ['fingerprint mismatch', (f) => { f.bundle.fingerprint = '1'.repeat(64); f.republish(); }, 'FINGERPRINT_MISMATCH'],
    ['changed port source', (f) => write(join(f.root, f.target), '// edited'), 'FINGERPRINT_MISMATCH'],
    ['changed port tests', (f) => write(join(f.root, f.testPath), '// edited'), 'FINGERPRINT_MISMATCH'],
    ['changed tool bytes', (f) => write(join(f.root, 'pnpm-lock.yaml'), 'edited'), 'FINGERPRINT_MISMATCH'],
    ['changed patch', (f) => write(join(f.root, 'docs/patches/fixture.patch'), 'edited'), 'FINGERPRINT_MISMATCH'],
    ['new unlisted test file', (f) => write(join(f.root, 'test/new.test.mjs'), '// new'), 'FINGERPRINT_MISMATCH'],
    ['open required task', (f) => { const issues = f.getIssues(); issues.find((row) => row.id === 'fixture-owner').status = 'open'; f.setIssues(issues); }, 'OPEN_TASK'],
    ['omitted open parity bug', (f) => f.setIssues([...f.getIssues(), { id: 'unlisted-bug', status: 'open', type: 'bug', dependencies: [] }]), 'OPEN_BLOCKER'],
    ['open prerequisite', (f) => { const issues = f.getIssues(); issues[0].dependencies = ['missing-dependency']; f.setIssues(issues); }, 'OPEN_TASK'],
    ['pending CLI transaction', (f) => write(f.paths.journal, '{}\n'), 'PENDING_TRANSACTION'],
    ['dirty SHA checkout', (f) => write(join(f.checkout, 'personal.txt'), 'keep my bytes'), 'DIRTY_SOURCE'],
    ['moved SHA', (f) => g(f.checkout, 'checkout', '--detach', pins['base-ui'].from), 'CHECKOUT_MOVED'],
    ['missing recorded SHA', (f) => f.save({ ...f.readState(), baselineSourceSha: '1'.repeat(40) }), 'MISSING_COMMIT'],
    ['QUEUED case is not passing', (f) => f.changeGate('browser-firefox', (gate) => { gate.cases[0].status = 'pending-browser'; }), 'INCOMPLETE_SCENARIOS'],
    ['failed original source case cannot become an adaptation', (f) => f.changeGate('source-tests-node', (gate) => {
      Object.assign(gate.cases[0], { status: 'adapted', sourceStatus: 'failed', reason: 'not allowed', reviewTask: 'fixture-owner' });
    }), 'INCOMPLETE_SCENARIOS'],
    ['missing obligated scenario', (f) => f.changeGate('browser-webkit', (gate) => { gate.cases = []; }), 'INCOMPLETE_SCENARIOS'],
    ['case blocker', (f) => f.changeGate('browser-chromium', (gate) => { gate.cases[0].blockers = ['open-case']; }), 'OPEN_BLOCKER'],
    ['tampered gate fingerprint file', (f) => write(join(f.root, f.bundle.gates[0].path), '{}\n'), 'EVIDENCE_HASH'],
    ['invented extra case', (f) => f.changeGate('browser-chromium', (gate) => gate.cases.push({ id: 'invented', status: 'passing' })), 'INCOMPLETE_SCENARIOS'],
  ]) await t.test(name, (child) => {
    const f = fixture(child, seeds); mutate(f);
    const before = bytes(f.paths.state);
    fails(() => f.verify({ advance: true }), code);
    assert.equal(bytes(f.paths.state), before);
    assert.equal(existsSync(f.paths.lock), false);
  });

  await t.test('unknown mapping and incomplete runtime inventory cannot be hidden by rehashing', (child) => {
    const f = fixture(child, seeds);
    // Deliberately keep the immutable tuple consistent when corrupting a producer.
    function producerChange(path, value, property) {
      write(join(f.root, path), json(value)); f.bundle[property] = descriptor(f.root, path);
      f.tuple[property === 'plan' ? 'mappingHash' : 'inventoryHash'] = f.bundle[property].sha256;
      f.bundle.fingerprint = hash(json(f.tuple));
      for (const ref of f.bundle.gates) {
        const gate = JSON.parse(bytes(join(f.root, ref.path))); gate.tuple = f.tuple;
        write(join(f.root, ref.path), json(gate)); ref.sha256 = descriptor(f.root, ref.path).sha256;
      }
      f.republish();
    }
    const saved = structuredClone(f.plan);
    f.plan.sourceMap.pop(); producerChange('proof/plan.json', f.plan, 'plan');
    fails(() => f.verify({ advance: true }), 'UNKNOWN_MAPPING');
    f.plan.sourceMap = saved.sourceMap;
    producerChange('proof/plan.json', f.plan, 'plan');
    f.inventory.unresolved = ['unexpanded conformance'];
    producerChange('proof/inventory.json', f.inventory, 'inventory');
    fails(() => f.verify({ advance: true }), 'INCOMPLETE_SCENARIOS');
    assert.equal(f.readState().verifiedParitySha, pins['base-ui'].from);
  });

  await t.test('check-only then one advance retains previous state, QUEUED candidate and immutable receipt', (child) => {
    const f = fixture(child, seeds);
    f.queue();
    const before = bytes(f.paths.state);
    const index = g(f.root, 'ls-files', '--stage');
    const sourceRefs = g(f.checkout, 'show-ref');
    assert.equal(f.verify().outcome, 'eligible');
    assert.equal(bytes(f.paths.state), before);
    const advanced = f.verify({ advance: true });
    assert.equal(advanced.outcome, 'advanced'); assert.equal(advanced.queued, 'QUEUED');
    assert.equal(advanced.state.verifiedParitySha, pins['base-ui'].to);
    assert.equal(advanced.state.queuedCandidateSha, pins['base-ui'].later);
    assert.equal(advanced.state.activeEpisode, null);
    assert.equal(advanced.state.baselineSourceSha, pins['base-ui'].from);
    assert.equal(g(f.root, 'ls-files', '--stage'), index);
    assert.equal(g(f.checkout, 'show-ref'), sourceRefs, 'verifier does not mutate even fixture source refs');
    const receipt = JSON.parse(bytes(join(f.root, advanced.receiptPath)));
    assert.equal(json(receipt.before), before); assert.equal(receipt.after.verification.scope, 'fixture');
    assert.equal(receipt.before.verifiedParitySha, pins['base-ui'].from);
    assert.equal(receipt.after.verification.previousVerifiedParitySha, pins['base-ui'].from);
    const after = bytes(f.paths.state);
    assert.equal(f.verify({ advance: true }).outcome, 'unchanged');
    assert.equal(bytes(f.paths.state), after);
    assert.equal(f.cli('update').state.activeEpisode.fromSha, pins['base-ui'].to);
  });

  for (const stage of ['receipt', 'state-temp', 'state']) await t.test(`crash at ${stage} retries exactly once`, (child) => {
    const f = fixture(child, seeds); const before = bytes(f.paths.state);
    assert.throws(() => f.verify({ advance: true, checkpoint: (point) => { if (point === stage) throw new Error('interrupted'); } }), /interrupted/);
    assert.equal(existsSync(f.paths.lock), false);
    if (stage !== 'state') assert.equal(bytes(f.paths.state), before);
    assert.equal(f.verify({ advance: true }).outcome, stage === 'state' ? 'unchanged' : 'advanced');
    assert.equal(f.verify({ advance: true }).outcome, 'unchanged');
  });

  await t.test('same-lock concurrency, locked reread and evidence reread', (child) => {
    const f = fixture(child, seeds);
    withSourceLock(f.paths, () => {
      fails(() => f.verify({ advance: true }), 'LOCKED');
      const ref = descriptor(f.root, 'proof/evidence.json');
      const core = new URL('../../../scripts/upstream/verify/core.mjs', import.meta.url).href;
      const code = verifierWorkerProgram({ root: f.root, core, toolchain: f.bundle.toolchain,
        issues: f.getIssues(), evidencePath: ref.path, evidenceHash: ref.sha256 });
      const other = spawnSync('rtk', ['proxy', process.execPath, '--input-type=module', '-e', code], { encoding: 'utf8' });
      assert.equal(other.status, 1); assert.equal(JSON.parse(other.stderr).code, 'LOCKED');
    });
    fails(() => f.verify({ advance: true, checkpoint: (point) => {
      if (point === 'prepared') f.save({ ...f.readState(), note: 'concurrent writer' });
    } }), 'STATE_CONFLICT');
    fails(() => f.verify({ advance: true, checkpoint: (point) => {
      if (point === 'prepared') write(join(f.root, f.target), 'concurrent component edit');
    } }), 'FINGERPRINT_MISMATCH');
    assert.equal(f.readState().verifiedParitySha, pins['base-ui'].from);
  });

  await t.test('hard crash leaves source lock for explicit CLI unlock and receipt retry', (child) => {
    const f = fixture(child, seeds);
    const modulePath = new URL('../../../scripts/upstream/git/state.mjs', import.meta.url).href;
    const code = `import {withSourceLock,sourcePaths} from ${JSON.stringify(modulePath)}; withSourceLock(sourcePaths(${JSON.stringify(f.root)}),()=>process.exit(73));`;
    const stopped = spawnSync('rtk', ['proxy', process.execPath, '--input-type=module', '-e', code], { encoding: 'utf8' });
    assert.equal(stopped.status, 73);
    const owner = JSON.parse(bytes(f.paths.lock));
    fails(() => f.verify({ advance: true }), 'LOCKED');
    assert.equal(f.cli('unlock', { token: owner.token }).outcome, 'unlocked');
    assert.equal(f.verify({ advance: true }).outcome, 'advanced');
  });

  await t.test('initial pin requires final approval; fixture evidence rejected by production entry', (child) => {
    const f = fixture(child, seeds, 'base-ui', { initial: true });
    assert.equal(f.verify().outcome, 'eligible');
    const issues = f.getIssues(); issues.find((row) => row.id === 'bsolid-release-ready').metadata = {};
    f.setIssues(issues);
    fails(() => f.verify({ advance: true }), 'INITIAL_QUALIFICATION');
    const ref = descriptor(f.root, 'proof/evidence.json');
    fails(() => runVerification({ root: f.root, evidencePath: ref.path, evidenceHash: ref.sha256 }), 'INVALID_EVIDENCE');
    fails(() => createFixtureVerifier({ root: new URL('../../../', import.meta.url).pathname }), 'FIXTURE_ROOT');
    assert.equal(f.readState().verifiedParitySha, null);
  });
});

test('actual donor candidate objects qualify separately from baseline HEAD and Base UI oracle', (t) => {
  const seeds = { 'base-ui': seed(t, 'base-ui'), 'solid-floating-ui': seed(t, 'solid-floating-ui') };
  const f = fixture(t, seeds, 'solid-floating-ui');
  const baseStatePath = join(f.root, 'tracking/upstream.json');
  const baseBytes = bytes(baseStatePath);
  const adaptation = bytes(join(f.root, f.target));
  assert.equal(g(f.checkout, 'rev-parse', 'HEAD'), pins['solid-floating-ui'].from);
  assert.equal(f.readState().fetchedCandidateSha, pins['solid-floating-ui'].to);
  assert.equal(f.verify({ advance: true }).outcome, 'advanced');
  assert.equal(g(f.checkout, 'rev-parse', 'HEAD'), pins['solid-floating-ui'].from);
  assert.equal(f.readState().baselineSourceSha, pins['solid-floating-ui'].from);
  assert.equal(bytes(baseStatePath), baseBytes);
  assert.equal(bytes(join(f.root, f.target)), adaptation);
  assert.equal(f.verify({ advance: true }).outcome, 'unchanged');
  write(baseStatePath, json({ ...JSON.parse(baseBytes), verifiedParitySha: null }));
  fails(() => f.verify(), 'ORACLE_MISMATCH');
});

test('Beads audit fails closed for missing/cyclic/unknown blocker statuses', () => {
  fails(() => auditBeads([], ['absent']), 'OPEN_TASK');
  fails(() => auditBeads([{ id: 'bad', status: 'unknown' }], []), 'BEADS_UNAVAILABLE');
  fails(() => auditBeads([{ id: 'a', status: 'closed', dependencies: ['b'] },
    { id: 'b', status: 'closed', dependencies: ['a'] }], ['a']), 'OPEN_BLOCKER');
});
