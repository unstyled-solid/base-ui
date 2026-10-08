import { existsSync, readFileSync, realpathSync } from 'node:fs';
import { join, relative, resolve, isAbsolute } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { checkoutSha, fail, hash, immutableWrite, json, readJson, readState, safePath, saveState,
  sourcePaths, validateState, withSourceLock } from '../git/state.mjs';
import { repositoryRoot, inspectSource, requireClean, requireHead, requireCommit, requireAncestor } from '../git/checkout.mjs';
import { validateEpisode } from '../git/workflow.mjs';
import { git } from '../git/process.mjs';
import { changeReport } from '../git/report.mjs';
import { array, check, documentEvidence, fileEvidence, fingerprint, nonempty, same, snapshotInputs,
  unique, validateGates, validateScenarios } from './evidence.mjs';
import { readBeads, auditBeads } from './beads.mjs';

function runtimeVersions() {
  const result = spawnSync('rtk', ['proxy', 'pnpm', '--version'], { encoding: 'utf8' });
  check(!result.error && result.status === 0, 'TOOLCHAIN_MISMATCH', 'Cannot establish pnpm version.');
  return { node: process.version, pnpm: result.stdout.trim(), solid: '2.0.0-rc.13' };
}

function tree(checkout, sha) {
  const text = git(checkout, ['ls-tree', '-r', '-z', '--full-tree', sha]).stdout;
  return { sha256: hash(text), entries: text.split('\0').filter(Boolean).map((line) => {
    const match = line.match(/^(\d+) (blob|commit) ([a-f0-9]{40})\t([\s\S]+)$/);
    check(match, 'UNKNOWN_MAPPING', 'Cannot parse exact source tree.');
    return { mode: match[1], blob: match[3], path: match[4] };
  }) };
}

function validateMapping(root, plan, sourceTree, report) {
  const mappings = array(plan.sourceMap, 'sourceMap');
  unique(mappings.map((entry) => entry.path), 'source mappings');
  same(mappings.map(({ path, blob, mode }) => ({ path, blob, mode })).sort((a, b) => a.path.localeCompare(b.path, 'en')),
    [...sourceTree.entries].sort((a, b) => a.path.localeCompare(b.path, 'en')), 'UNKNOWN_MAPPING', 'Source mappings do not cover the exact candidate tree.');
  const tasks = [...array(plan.tasks, 'tasks')];
  check(array(plan.blockers, 'plan blockers').length === 0, 'OPEN_BLOCKER', 'Impact plan contains unresolved blockers.');
  for (const entry of mappings) {
    check(['translated', 'pure-adapted', 'framework-only', 'excluded-with-reason'].includes(entry.disposition) &&
      nonempty(entry.reason) && nonempty(entry.reviewTask), 'UNKNOWN_MAPPING', `Unreviewed mapping ${entry.path}.`);
    tasks.push(entry.reviewTask);
    array(entry.targets, 'mapping targets'); array(entry.tests, 'mapping tests');
    if (['translated', 'pure-adapted'].includes(entry.disposition)) {
      check(entry.targets.length > 0 && entry.tests.length > 0, 'UNKNOWN_MAPPING', `Missing source/test targets for ${entry.path}.`);
    }
    for (const target of [...entry.targets, ...entry.tests]) {
      check(!target.startsWith('upstream/') && !target.startsWith('tracking/'), 'UNKNOWN_MAPPING', 'Targets must be actual port source/tests.');
      check(existsSync(safePath(root, target)), 'UNKNOWN_MAPPING', `Missing mapped target ${target}.`);
    }
  }
  const changes = array(plan.changes, 'change dispositions');
  unique(changes.map((entry) => entry.index), 'change indices');
  check(changes.length === report.changes.length, 'UNKNOWN_MAPPING', 'Every raw diff entry, including deletions, requires a disposition.');
  for (let index = 0; index < report.changes.length; index++) {
    const disposition = changes.find((entry) => entry.index === index);
    check(disposition && disposition.changeHash === hash(json(report.changes[index])) &&
      ['reconciled', 'reviewed-noop', 'removed', 'renamed'].includes(disposition.disposition) &&
      nonempty(disposition.reason) && nonempty(disposition.task), 'UNKNOWN_MAPPING', `Untriaged/unknown raw change ${index}.`);
    tasks.push(disposition.task);
    check(array(disposition.targets, 'changed targets').length > 0 || disposition.disposition === 'reviewed-noop',
      'UNKNOWN_MAPPING', `Changed entry ${index} lacks target/test handoff.`);
    array(disposition.tests, 'changed tests');
    if (disposition.disposition !== 'reviewed-noop') check(disposition.tests.length > 0, 'UNKNOWN_MAPPING', `Changed entry ${index} lacks tests.`);
    for (const path of [...disposition.targets, ...disposition.tests]) check(existsSync(safePath(root, path)), 'UNKNOWN_MAPPING', `Missing changed target ${path}.`);
  }
  return tasks;
}

function pending(paths) {
  check(!existsSync(paths.journal), 'PENDING_TRANSACTION', 'Resume the existing CLI transaction before verification; never infer its outcome.');
}

function validate(root, paths, state, reference, adapters, fixtureOnly) {
  const bundle = documentEvidence(root, reference);
  check(bundle.schemaVersion === 1 && bundle.source === paths.source &&
    ['initial', 'weekly'].includes(bundle.kind) && bundle.scope === (fixtureOnly ? 'fixture' : 'global'),
  'INVALID_EVIDENCE', 'Wrong evidence version/source/scope; fixture proof never certifies global parity.');
  const initial = bundle.kind === 'initial';
  const candidate = state.fetchedCandidateSha;
  check(bundle.candidateSha === candidate, 'STALE_GATE', 'Evidence is for another candidate SHA.');
  if (initial) {
    check(state.verifiedParitySha === null && !state.activeEpisode && bundle.fromSha === candidate && bundle.reportHash === null,
      'INITIAL_QUALIFICATION', 'Initial qualification needs the unverified exact pin, no active update.');
  } else {
    check(state.activeEpisode && bundle.fromSha === state.activeEpisode.fromSha && bundle.reportHash === state.activeEpisode.reportHash,
      'STALE_REPORT', 'Weekly proof does not identify the active immutable range/hash.');
    validateEpisode(paths, state);
  }
  const info = inspectSource(root, state, paths.source);
  requireClean(info); requireHead(info, [checkoutSha(paths, state)]);
  for (const sha of [state.baselineSourceSha, candidate, state.verifiedParitySha, state.queuedCandidateSha].filter(Boolean)) requireCommit(info.checkout, sha);
  requireAncestor(info.checkout, bundle.fromSha, candidate);
  if (state.queuedCandidateSha) requireAncestor(info.checkout, candidate, state.queuedCandidateSha);
  const sourceTree = tree(info.checkout, candidate);
  check(bundle.sourceTreeHash === sourceTree.sha256, 'FINGERPRINT_MISMATCH', 'Candidate Git tree hash mismatch.');
  const report = initial ? { changes: [] } : JSON.parse(readFileSync(join(paths.episodes, state.activeEpisode.id, 'report.json'), 'utf8'));
  if (!initial) {
    // Hash/range matching alone cannot prove a producer included every Git change/commit.
    same(report, changeReport(info.checkout, paths.source, state, bundle.fromSha, candidate),
      'STALE_REPORT', 'Raw report differs from the actual immutable Git range.');
    const episode = JSON.parse(readFileSync(join(paths.episodes, state.activeEpisode.id, 'episode.json'), 'utf8'));
    check(episode.previousVerifiedParitySha === state.verifiedParitySha, 'STALE_REPORT', 'Episode lost the previous verified pin.');
  }
  let oracleSha = candidate;
  if (paths.source === 'solid-floating-ui') {
    const oraclePaths = sourcePaths(root, 'base-ui');
    pending(oraclePaths);
    check(!existsSync(oraclePaths.lock), 'LOCKED', 'Base UI oracle is being mutated.');
    const oracle = readState(oraclePaths);
    const oracleInfo = inspectSource(root, oracle, 'base-ui');
    requireClean(oracleInfo); requireHead(oracleInfo, [checkoutSha(oraclePaths, oracle)]);
    oracleSha = bundle.oracleSha;
    check(oracleSha === oracle.verifiedParitySha && /^[a-f0-9]{40}$/.test(oracleSha),
      'ORACLE_MISMATCH', 'Donor qualification requires a separately verified immutable Base UI oracle.');
    check(fixtureOnly || oracle.verification?.scope === 'global', 'ORACLE_MISMATCH', 'An unscoped historical oracle pin is not global qualification.');
    requireCommit(oracleInfo.checkout, oracleSha);
    requireHead(oracleInfo, [oracleSha]);
  }
  check(bundle.oracleSha === oracleSha, 'ORACLE_MISMATCH', 'Wrong behavioral oracle SHA.');
  same(bundle.toolchain, adapters.runtime(), 'TOOLCHAIN_MISMATCH', 'Evidence runtime/tool versions differ from current verifier tools.');
  const inputs = snapshotInputs(root, adapters.inputRoots);
  same(bundle.inputs, inputs, 'FINGERPRINT_MISMATCH', 'Source/test/tool/patch/docs bytes or file inventory changed.');
  check(array(bundle.artifacts, 'qualification artifacts').length > 0, 'MISSING_EVIDENCE', 'No exact packed/built artifact evidence.');
  unique(bundle.artifacts.map((artifact) => artifact.path), 'qualification artifacts');
  for (const artifact of bundle.artifacts) fileEvidence(root, artifact);
  const tuple = { source: paths.source, fromSha: bundle.fromSha, candidateSha: candidate,
    reportHash: bundle.reportHash, oracleSha, sourceTreeHash: sourceTree.sha256,
    mappingHash: bundle.plan?.sha256, inventoryHash: bundle.inventory?.sha256,
    inputHash: fingerprint(inputs), toolchain: bundle.toolchain, artifacts: bundle.artifacts };
  check(bundle.fingerprint === fingerprint(tuple), 'FINGERPRINT_MISMATCH', 'Evidence tuple fingerprint mismatch.');
  const plan = documentEvidence(root, bundle.plan);
  const inventory = documentEvidence(root, bundle.inventory);
  for (const value of [plan, inventory]) {
    check(value.schemaVersion === 1 && value.source === paths.source && value.candidateSha === candidate &&
      value.reportHash === bundle.reportHash && value.oracleSha === oracleSha,
    'STALE_REPORT', 'Mapping/runtime inventory context is stale.');
  }
  check(nonempty(plan.mappingRevision), 'UNKNOWN_MAPPING', 'An immutable mapping revision is required.');
  const tasks = validateMapping(root, plan, sourceTree, report);
  // Every production qualification requires explicit same-tuple live approval,
  // including weekly advancement from an already qualified pin. Fixture receipts
  // are never an authorization for a production transition.
  const initialQualification = initial || state.verifiedParitySha === null || !fixtureOnly;
  const { records, tasks: gateTaskIds } = validateGates(root, bundle, plan, tuple, initialQualification);
  tasks.push(...gateTaskIds, ...validateScenarios(plan, inventory, records), 'bsolid-upstream-impact');
  if (paths.source === 'solid-floating-ui') tasks.push('bsolid-donor-update-proof');
  const authorizationHash = initialQualification ? records.get('release-ready/coordinator').reference.sha256 : undefined;
  const issues = adapters.beads(root, [...new Set(tasks)]);
  auditBeads(issues, tasks, authorizationHash);
  return { bundle, tuple, fingerprint: bundle.fingerprint, beadsHash: hash(json(issues)) };
}

// Production defaults cannot consume fixture evidence. The only injectable seam is
// explicitly confined to temporary fixture roots; it never touches canonical state.
export function createFixtureVerifier({ root, ...adapters }) {
  const location = realpathSync(root);
  const inside = relative(realpathSync(tmpdir()), location);
  check(inside && !inside.startsWith('..') && !isAbsolute(inside) &&
    existsSync(join(location, '.upstream-verify-fixture.json')), 'FIXTURE_ROOT', 'Fixture adapters require an explicitly marked temporary root.');
  return (options) => verify({ ...options, root: location }, adapters, true);
}

/**
 * @typedef {object} VerificationOptions
 * @property {string} [root]
 * @property {'base-ui'|'solid-floating-ui'} [source]
 * @property {string} [evidencePath]
 * @property {string} [evidenceHash]
 * @property {boolean} [advance]
 * @property {(stage: string) => void} [checkpoint]
 */
/** @param {VerificationOptions} [options] */
export function runVerification(options = {}) { return verify(options, {}, false); }

function advancedState(before, evidenceHash, fingerprint, receiptPath, scope) {
  return { ...before, verifiedParitySha: before.fetchedCandidateSha, activeEpisode: null,
    verification: { scope, evidenceHash, fingerprint,
      previousVerifiedParitySha: before.verifiedParitySha, receiptPath } };
}

function verify({ root = process.cwd(), source = 'base-ui', evidencePath, evidenceHash,
  advance = false, checkpoint = () => {} }, overrides, fixtureOnly) {
  root = repositoryRoot(resolve(root));
  const paths = sourcePaths(root, source);
  const adapters = { runtime: runtimeVersions, beads: readBeads, ...overrides };
  const reference = { path: evidencePath, sha256: evidenceHash };
  check(typeof advance === 'boolean', 'INVALID_OPTIONS', 'advance must be an explicit boolean, never a truthy string.');
  check(nonempty(evidencePath) && /^[a-f0-9]{64}$/.test(evidenceHash), 'MISSING_EVIDENCE', 'Provide an evidence path and its reviewed exact-byte SHA-256.');
  pending(paths);
  const observed = readState(paths);
  const receiptPath = safePath(paths.episodes, `${observed.fetchedCandidateSha}-${evidenceHash}/verification.json`);
  const receipt = existsSync(receiptPath) ? readJson(receiptPath) : null;
  const basis = receipt?.before ?? observed;
  if (receipt) {
    check(receipt.schemaVersion === 1 && receipt.evidenceHash === evidenceHash && receipt.source === source &&
      /^[a-f0-9]{64}$/.test(receipt.fingerprint) && /^[a-f0-9]{64}$/.test(receipt.beadsHash), 'STATE_CONFLICT', 'Wrong verification receipt.');
    validateState(receipt.before); validateState(receipt.after);
    same(receipt.after, advancedState(receipt.before, evidenceHash, receipt.fingerprint,
      relative(root, receiptPath), fixtureOnly ? 'fixture' : 'global'), 'STATE_CONFLICT', 'Retained receipt contains an unauthorized state transition.');
    check(json(observed) === json(receipt.before) || json(observed) === json(receipt.after), 'STATE_CONFLICT', 'State diverged from retained verification receipt.');
  }
  const prepared = validate(root, paths, basis, reference, adapters, fixtureOnly);
  if (receipt) check(receipt.fingerprint === prepared.fingerprint, 'STATE_CONFLICT', 'Receipt fingerprint differs from its exact evidence.');
  checkpoint('prepared');
  return withSourceLock(paths, () => {
    pending(paths);
    const current = readState(paths);
    same(current, observed, 'STATE_CONFLICT', 'Source state changed while evidence was gathered; rerun verification.');
    const checked = validate(root, paths, basis, reference, adapters, fixtureOnly);
    same(checked, prepared, 'STATE_CONFLICT', 'Evidence/Beads changed while acquiring the source lock.');
    if (receipt && json(current) === json(receipt.after)) return { outcome: 'unchanged', source, scope: checked.bundle.scope, state: current };
    if (!advance) return { outcome: 'eligible', source, scope: checked.bundle.scope,
      candidateSha: current.fetchedCandidateSha, queuedCandidateSha: current.queuedCandidateSha ?? null, fingerprint: checked.fingerprint };
    const after = advancedState(current, evidenceHash, checked.fingerprint, relative(root, receiptPath), checked.bundle.scope);
    const retained = { schemaVersion: 1, source, evidenceHash, fingerprint: checked.fingerprint,
      beadsHash: checked.beadsHash, before: current, after };
    immutableWrite(receiptPath, json(retained));
    checkpoint('receipt');
    // Receipt first, then fsynced atomic rename. A crash before/after rename is
    // replayable from the retained before/after pair, without a competing journal.
    saveState(paths, after, () => checkpoint('state-temp'));
    checkpoint('state');
    return { outcome: 'advanced', source, scope: checked.bundle.scope, state: after,
      queued: after.queuedCandidateSha ? 'QUEUED' : null, receiptPath: relative(root, receiptPath) };
  });
}
