import { createHash, randomUUID } from 'node:crypto';
import { hostname } from 'node:os';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import {
  existsSync, lstatSync, mkdirSync, openSync, closeSync, writeFileSync, readFileSync,
  fsyncSync, renameSync, unlinkSync, linkSync,
} from 'node:fs';
import { UpstreamError } from './process.mjs';

export const sources = Object.freeze({
  'base-ui': { statePath: 'tracking/upstream.json', episodesPath: 'tracking/updates', checkoutField: 'fetchedCandidateSha' },
  'solid-floating-ui': {
    statePath: 'tracking/donors/solid-floating-ui.json',
    episodesPath: 'tracking/donors/solid-floating-ui/updates',
    checkoutField: 'baselineSourceSha',
  },
});
export const shaPattern = /^[a-f0-9]{40}$/;
export const episodePattern = /^[a-f0-9]{40}-[a-f0-9]{40}$/;
export const json = (value) => `${JSON.stringify(value, null, 2)}\n`;
export const hash = (text) => createHash('sha256').update(text).digest('hex');
export const checkoutSha = (paths, state) => state[sources[paths.source].checkoutField];

export function fail(code, message) {
  throw new UpstreamError(code, message);
}

// Refuse paths through symlinks, including an upstream directory linked to ../ref.
export function safePath(root, name) {
  if (typeof name !== 'string' || !name || isAbsolute(name) || name.includes('\\') ||
      name.split('/').some((part) => !part || part === '.' || part === '..')) {
    fail('UNSAFE_PATH', `Expected a repository-relative path, received ${JSON.stringify(name)}.`);
  }
  const path = resolve(root, name);
  let current = root;
  for (const part of relative(root, path).split('/')) {
    current = join(current, part);
    if (lstatSync(current, { throwIfNoEntry: false })?.isSymbolicLink()) {
      fail('UNSAFE_PATH', `Refusing symlink ${current}; use an independent source checkout.`);
    }
  }
  return path;
}

export function sourcePaths(root, source = 'base-ui') {
  const adapter = sources[source];
  if (!adapter) fail('UNKNOWN_SOURCE', `Unknown source ${source}; choose ${Object.keys(sources).join(', ')}.`);
  const state = safePath(root, adapter.statePath);
  return { source, state, episodes: safePath(root, adapter.episodesPath),
    lock: `${state}.lock`, journal: `${state}.transaction.json` };
}

export function validateState(state) {
  if (!state || typeof state !== 'object' || Array.isArray(state)) fail('INVALID_STATE', 'Source state must be an object.');
  for (const key of ['repositoryUrl', 'branch', 'submodulePath']) {
    if (typeof state[key] !== 'string' || !state[key] || /[\x00-\x1f]/.test(state[key]) || state[key].startsWith('-')) {
      fail('INVALID_STATE', `State ${key} must be a nonempty safe string.`);
    }
  }
  for (const key of ['baselineSourceSha', 'fetchedCandidateSha']) {
    if (!shaPattern.test(state[key])) fail('INVALID_STATE', `State ${key} must be a full immutable commit SHA.`);
  }
  if (state.verifiedParitySha !== null && !shaPattern.test(state.verifiedParitySha)) {
    fail('INVALID_STATE', 'verifiedParitySha must be null or a full commit SHA. Fetch is not parity.');
  }
  if (state.queuedCandidateSha != null && !shaPattern.test(state.queuedCandidateSha)) {
    fail('INVALID_STATE', 'queuedCandidateSha must be null or a full commit SHA.');
  }
  if (state.activeEpisode != null) {
    const e = state.activeEpisode;
    if (!episodePattern.test(e.id) || e.id !== `${e.fromSha}-${e.toSha}` ||
        !shaPattern.test(e.fromSha) || e.toSha !== state.fetchedCandidateSha ||
        !/^[a-f0-9]{64}$/.test(e.reportHash)) {
      fail('INVALID_STATE', 'activeEpisode must identify the exact candidate range and SHA-256 report hash.');
    }
  }
  return state;
}

export function readJson(path) {
  try { return JSON.parse(readFileSync(path, 'utf8')); }
  catch (error) { fail('INVALID_JSON', `Cannot read ${path}: ${error.message}. Restore the recorded state; do not invent a baseline.`); }
}
export function readState(paths) { return validateState(readJson(paths.state)); }

function syncDirectory(path) {
  const fd = openSync(path, 'r');
  try { fsyncSync(fd); } finally { closeSync(fd); }
}

export function atomicWrite(path, text, beforeRename = () => {}) {
  mkdirSync(dirname(path), { recursive: true });
  const temp = `${path}.${randomUUID()}.tmp`;
  const fd = openSync(temp, 'wx');
  try {
    writeFileSync(fd, text);
    fsyncSync(fd);
  } finally { closeSync(fd); }
  try { beforeRename(); renameSync(temp, path); syncDirectory(dirname(path)); }
  finally { if (existsSync(temp)) unlinkSync(temp); }
}

// Publish complete bytes without replacing an existing episode artifact, even on replay.
export function immutableWrite(path, text) {
  if (existsSync(path)) {
    if (readFileSync(path, 'utf8') !== text) fail('IMMUTABLE_CONFLICT', `Historical artifact differs: ${path}. Restore it or investigate; it will not be overwritten.`);
    return;
  }
  mkdirSync(dirname(path), { recursive: true });
  const temp = `${path}.${randomUUID()}.tmp`;
  atomicWrite(temp, text);
  try { linkSync(temp, path); syncDirectory(dirname(path)); }
  finally { unlinkSync(temp); }
}

export function saveState(paths, state, beforeRename) {
  validateState(state);
  atomicWrite(paths.state, json(state), beforeRename);
}

// Every writer, including the future verifier, must hold this same source-local lock.
// Stale locks are deliberately not stolen: explicit recovery checks host, PID and token.
export function withSourceLock(paths, action) {
  const owner = { token: randomUUID(), pid: process.pid, host: hostname(), source: paths.source };
  let fd;
  try { fd = openSync(paths.lock, 'wx'); }
  catch (error) {
    if (error.code === 'EEXIST') fail('LOCKED', `Source ${paths.source} is locked at ${paths.lock}. Wait for its owner; after a crash use status then unlock --token <token>.`);
    throw error;
  }
  try {
    writeFileSync(fd, json(owner)); fsyncSync(fd);
    return action();
  } finally {
    closeSync(fd);
    if (existsSync(paths.lock) && readJson(paths.lock).token === owner.token) unlinkSync(paths.lock);
  }
}

export function unlock(paths, token) {
  if (!existsSync(paths.lock)) return { outcome: 'unchanged' };
  const owner = readJson(paths.lock);
  if (!token || token !== owner.token || owner.host !== hostname() || !Number.isInteger(owner.pid) || owner.pid <= 0) {
    fail('LOCK_RECOVERY', 'Lock token/host/PID does not match. Inspect the lock and coordinate with its owner; never delete a live lock.');
  }
  try { process.kill(owner.pid, 0); }
  catch (error) {
    if (error.code !== 'ESRCH') fail('LOCK_RECOVERY', 'Cannot prove the lock owner is dead. Coordinate with its owner.');
    unlinkSync(paths.lock);
    return { outcome: 'unlocked', source: paths.source };
  }
  fail('LOCK_LIVE', `Process ${owner.pid} still owns the lock; wait for it to finish.`);
}
