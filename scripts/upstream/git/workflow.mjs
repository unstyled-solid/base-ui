import { existsSync, readFileSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { git } from './process.mjs';
import {
  atomicWrite, checkoutSha, fail, hash, immutableWrite, json, readJson, readState, safePath, saveState,
  sourcePaths, unlock, validateState, withSourceLock,
} from './state.mjs';
import {
  fetchCandidate, initialize, inspectSource, repositoryRoot, requireAncestor,
  requireClean, requireCommit, requireHead,
} from './checkout.mjs';
import { changeReport } from './report.mjs';

function episodeDirectory(paths, id) { return safePath(paths.episodes, id); }

export function validateEpisode(paths, state) {
  if (!state.activeEpisode) return;
  const e = state.activeEpisode;
  const directory = episodeDirectory(paths, e.id);
  const text = readFileSync(join(directory, 'report.json'), 'utf8');
  const report = JSON.parse(text);
  const episode = readJson(join(directory, 'episode.json'));
  if (hash(text) !== e.reportHash || episode.reportHash !== e.reportHash ||
      report.source !== paths.source || episode.source !== paths.source ||
      report.fromSha !== e.fromSha || report.toSha !== e.toSha ||
      episode.fromSha !== e.fromSha || episode.toSha !== e.toSha || episode.id !== e.id) {
    fail('STALE_REPORT', 'Active episode/report does not match its immutable range/hash. Restore the artifact or investigate before proceeding.');
  }
  if (existsSync(join(directory, 'abandoned.json'))) fail('ABANDONED_EPISODE', 'Active state points to an abandoned episode. Resume the pending transaction or investigate state.');
}

function pins(info, paths, state) {
  for (const sha of new Set([state.baselineSourceSha, state.fetchedCandidateSha,
    state.verifiedParitySha, state.queuedCandidateSha, state.activeEpisode?.fromSha].filter(Boolean))) {
    requireCommit(info.checkout, sha);
    git(info.checkout, ['update-ref', `refs/baseui-solid2/${paths.source}/pins/${sha}`, sha]);
  }
}

function validateJournal(paths, transaction) {
  if (transaction.version !== 1 || transaction.source !== paths.source ||
      !['update', 'queue', 'abandon', 'init'].includes(transaction.operation)) {
    fail('INVALID_JOURNAL', 'Transaction source/version/operation does not match. Preserve the journal and investigate.');
  }
  validateState(transaction.before); validateState(transaction.after);
  for (const key of ['repositoryUrl', 'branch', 'submodulePath', 'baselineSourceSha', 'verifiedParitySha']) {
    if (transaction.before[key] !== transaction.after[key]) fail('INVALID_JOURNAL', `Fetch transaction cannot modify ${key}.`);
  }
  if (transaction.toHead !== checkoutSha(paths, transaction.after) ||
      !/^[a-f0-9]{40}$/.test(transaction.fromHead) || !Array.isArray(transaction.artifacts)) {
    fail('INVALID_JOURNAL', 'Invalid transaction checkout or artifacts.');
  }
  for (const artifact of transaction.artifacts) {
    if (!/^[a-f0-9]{40}-[a-f0-9]{40}\/(episode|report|abandoned)\.json$/.test(artifact.path) ||
        typeof artifact.text !== 'string') fail('INVALID_JOURNAL', 'Invalid transaction artifact path/text.');
  }
  const { before, after, operation } = transaction;
  const invalidTransition =
    (operation === 'init' && json(before) !== json(after)) ||
    (operation !== 'init' && transaction.fromHead !== checkoutSha(paths, before)) ||
    (operation === 'update' && (before.activeEpisode != null || !after.activeEpisode ||
      after.activeEpisode.fromSha !== before.fetchedCandidateSha || after.queuedCandidateSha != null)) ||
    (operation === 'queue' && (!before.activeEpisode || !after.queuedCandidateSha ||
      before.fetchedCandidateSha !== after.fetchedCandidateSha || json(before.activeEpisode) !== json(after.activeEpisode))) ||
    (operation === 'abandon' && (!before.activeEpisode || after.activeEpisode != null ||
      after.fetchedCandidateSha !== before.activeEpisode.fromSha));
  if (invalidTransition) fail('INVALID_JOURNAL', 'Transaction would violate candidate/episode transition invariants. Preserve it for coordinator review.');
}

// The durable intent is written BEFORE artifacts/checkout/state. A rerun finishes exactly
// that intent rather than fetching a different tip. Hooks exist only for fixture fault injection.
function finish(root, paths, transaction, checkpoint) {
  validateJournal(paths, transaction);
  const current = readState(paths);
  if (json(current) !== json(transaction.before) && json(current) !== json(transaction.after)) {
    fail('STATE_CONFLICT', 'State changed outside the pending transaction. Preserve the journal and coordinate with the state owner.');
  }
  let info = inspectSource(root, current, paths.source);
  if (info.missing && transaction.operation === 'init') {
    info = initialize(root, current, paths.source);
    checkpoint('initialized');
  }
  requireClean(info); requireHead(info, [transaction.fromHead, transaction.toHead]);
  if (transaction.operation === 'update') requireAncestor(info.checkout,
    transaction.before.fetchedCandidateSha, transaction.after.fetchedCandidateSha);
  if (transaction.operation === 'queue') requireAncestor(info.checkout,
    transaction.before.queuedCandidateSha ?? transaction.before.fetchedCandidateSha, transaction.after.queuedCandidateSha);
  pins(info, paths, transaction.before); pins(info, paths, transaction.after);
  for (const artifact of transaction.artifacts) {
    immutableWrite(safePath(paths.episodes, artifact.path), artifact.text);
  }
  validateEpisode(paths, transaction.after);
  checkpoint('artifacts');
  // Recheck immediately before checkout; never use --force/reset/stash/clean.
  const latest = inspectSource(root, current, paths.source);
  requireClean(latest); requireHead(latest, [transaction.fromHead, transaction.toHead]);
  if (latest.head !== transaction.toHead) git(info.checkout, ['-c', 'core.hooksPath=/dev/null', 'checkout', '--detach', transaction.toHead]);
  checkpoint('checkout');
  saveState(paths, transaction.after, () => checkpoint('state-temp'));
  checkpoint('state');
  unlinkSync(paths.journal);
  return { outcome: transaction.operation, source: paths.source, state: transaction.after };
}

function transact(root, paths, before, after, info, operation, artifacts, checkpoint) {
  const transaction = { version: 1, source: paths.source, operation, before, after,
    fromHead: info.head ?? info.gitlinkSha, toHead: checkoutSha(paths, after), artifacts };
  validateJournal(paths, transaction);
  atomicWrite(paths.journal, json(transaction));
  checkpoint('journal');
  return finish(root, paths, transaction, checkpoint);
}

export function runUpstream({ root = process.cwd(), source = 'base-ui', command = 'status',
  reason, token, checkpoint = () => {} } = {}) {
  root = repositoryRoot(root);
  const paths = sourcePaths(root, source);
  if (!['init', 'update', 'status', 'abandon', 'unlock'].includes(command)) {
    fail('UNKNOWN_COMMAND', command === 'verify'
      ? 'Verification is not implemented by the fetch wrapper. bsolid-upstream-verify must validate exact evidence before advancing parity.'
      : `Unknown command ${command}. Use init, update, status, abandon or unlock.`);
  }
  if (command === 'unlock') return unlock(paths, token);
  if (command === 'status') {
    const state = readState(paths);
    const info = inspectSource(root, state, source);
    return { source, state, checkout: info, pendingTransaction: existsSync(paths.journal),
      lock: existsSync(paths.lock) ? readJson(paths.lock) : null,
      parity: state.verifiedParitySha === null ? 'unverified' : 'recorded-by-verifier' };
  }
  return withSourceLock(paths, () => {
    if (existsSync(paths.journal)) {
      const result = finish(root, paths, readJson(paths.journal), checkpoint);
      return { ...result, outcome: 'resumed', resumedOperation: result.outcome };
    }
    const before = readState(paths);
    let info = inspectSource(root, before, source);
    requireClean(info);
    validateEpisode(paths, before);
    if (command === 'init') {
      if (info.missing) return transact(root, paths, before, before, info, 'init', [], checkpoint);
      // An existing checkout is never silently moved back to the recorded pin.
      requireHead(info, [checkoutSha(paths, before)]);
      for (const sha of [before.fetchedCandidateSha, before.baselineSourceSha,
        before.verifiedParitySha, before.queuedCandidateSha].filter(Boolean)) requireCommit(info.checkout, sha);
      return { outcome: 'unchanged', source, state: before };
    }
    // One-command fetch on a fresh clone. A missing active worker checkout still
    // requires explicit init; do not infer that its owner wants it recreated.
    if (command === 'update' && info.missing && !before.activeEpisode) {
      transact(root, paths, before, before, info, 'init', [], checkpoint);
      info = inspectSource(root, before, source);
    }
    requireHead(info, [checkoutSha(paths, before)]);
    for (const sha of [before.baselineSourceSha, before.verifiedParitySha, before.activeEpisode?.fromSha, before.queuedCandidateSha].filter(Boolean)) requireCommit(info.checkout, sha);
    if (command === 'abandon') {
      if (!before.activeEpisode) return { outcome: 'unchanged', source, state: before };
      if (typeof reason !== 'string' || !reason.trim()) fail('REASON_REQUIRED', 'Abandon requires --reason <coordinator explanation>; historical artifacts are retained.');
      const e = before.activeEpisode;
      const after = { ...before, fetchedCandidateSha: e.fromSha, activeEpisode: null };
      return transact(root, paths, before, after, info, 'abandon', [{ path: `${e.id}/abandoned.json`,
        text: json({ source, episodeId: e.id, reportHash: e.reportHash, reason, restoredSha: checkoutSha(paths, after) }) }], checkpoint);
    }
    const candidate = fetchCandidate(info, before);
    requireAncestor(info.checkout, before.fetchedCandidateSha, candidate);
    if (before.queuedCandidateSha) requireAncestor(info.checkout, before.queuedCandidateSha, candidate);
    if (candidate === before.fetchedCandidateSha || (before.activeEpisode && candidate === before.queuedCandidateSha)) {
      return { outcome: 'unchanged', source, state: before };
    }
    if (before.activeEpisode) {
      const after = { ...before, queuedCandidateSha: candidate };
      return transact(root, paths, before, after, info, 'queue', [], checkpoint);
    }
    const id = `${before.fetchedCandidateSha}-${candidate}`;
    const directory = episodeDirectory(paths, id);
    if (existsSync(join(directory, 'abandoned.json'))) {
      fail('ABANDONED_RANGE', `Range ${id} was explicitly abandoned. Retain its history; coordinator review or a later descendant is required, not implicit reactivation.`);
    }
    const report = json(changeReport(info.checkout, source, before, before.fetchedCandidateSha, candidate));
    const activeEpisode = { id, fromSha: before.fetchedCandidateSha, toSha: candidate, reportHash: hash(report) };
    const after = { ...before, fetchedCandidateSha: candidate, queuedCandidateSha: null, activeEpisode };
    const artifacts = [
      { path: `${id}/report.json`, text: report },
      { path: `${id}/episode.json`, text: json({ schemaVersion: 1, source, ...activeEpisode,
        previousVerifiedParitySha: before.verifiedParitySha }) },
    ];
    return transact(root, paths, before, after, info, 'update', artifacts, checkpoint);
  });
}
