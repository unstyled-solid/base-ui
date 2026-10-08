import { createHash } from 'node:crypto';
import { gunzipSync } from 'node:zlib';
import { readFile, realpath, lstat } from 'node:fs/promises';
import path from 'node:path';

export const requiredRows = [
  ['archive', 'Installed package byte-for-byte matches supplied tarball', 'compile'],
  ['conditions', 'Separate production/development server/client graphs use RC13', 'compile'],
  ['server-globals', 'Real server component graph imports without browser globals', 'server'],
  ['request-isolation', 'Concurrent requests isolate values and reset ID namespace', 'server'],
  ['root-ids', 'Multiple hydration roots preserve IDs and label/description ownership', 'browser'],
  ['stream-shell', 'Incremental stream emits Loading shell and settled real components', 'server'],
  ['stream-hydration', 'Streamed hosts hydrate with original identity and working events', 'browser'],
  ['async-list', 'Keyed async list updates retain original hosts during held updates', 'browser'],
  ['error-boundary', 'Server Errored fallback and client attachment preserve error markup', 'browser'],
  ['open-closed', 'Actual Tabs and Dialog initially open/closed controls', 'browser'],
  ['keep-mounted', 'Closed retained content is inaccessible and survives reopen', 'browser'],
  ['conditional', 'Conditional children unmount/remount independently of retained panel', 'browser'],
  ['identity-events', 'Original Field/Input/Toggle hosts, native events exactly once', 'browser'],
  ['nested-roots', 'Nested and sibling roots delegate once and dispose independently', 'browser'],
  ['disposal', 'Repeated actual-component mount/unmount, detached host events inactive', 'browser'],
  ['stale-async', 'Result after disposal cannot mutate retained streamed hosts', 'browser'],
  ['portal', 'Actual Dialog portal is absent on server and owned after hydration', 'browser'],
  ['portal-containers', 'HTMLElement inside ShadowRoot and iframe body containers', 'browser'],
  ['csp-nonce', 'Renderer and Base UI prehydration scripts/style elements propagate nonce', 'browser'],
  ['csp-disabled', 'ScrollArea and Select disableStyleElements omit injected style', 'browser'],
  ['tabs-prehydration', 'Tabs script executes before hydration then unmounts, null selection omits script', 'browser'],
  ['slider-prehydration', 'Inset Slider script positions server thumb before hydration', 'browser'],
  ['delayed-trigger', 'Close detached Dialog before delayed trigger hydration', 'blocked'],
  ['resource-counts', 'Package observer/listener/timer/owner baseline after repeated disposal', 'blocked'],
  ['stream-abort', 'Abandoned stream releases async sources and request owners', 'blocked'],
  ['id-variants', 'Canonical useId explicit override updates, prefix/suffix and multi-IDREF variants', 'blocked'],
  ['hydration-hooks', 'Canonical hydration utility server/client snapshots', 'blocked'],
];

export function newReport() {
  return { ticket: 'bsolid-hydration', qualified: false, modes: {}, rows: requiredRows.map(([id, contract, stage]) => ({
    id, contract, stage, status: 'blocked', reason: stage === 'blocked'
      ? ({ 'delayed-trigger': 'Fixture authored, RC13 delayed-trigger identity/replay assertion not yet implemented.',
        'resource-counts': 'Fixture cleanup counts are not package-wide resource leak evidence; deterministic package resource instrumentation not implemented.',
        'stream-abort': 'Transport abort/async iterator return qualification not implemented.' })[id]
        ?? ({ 'id-variants': 'Public component generated IDs covered; internal utility override/prefix/suffix/multi-IDREF fixtures not implemented.',
          'hydration-hooks': 'Utilities are private, no source imports allowed; public-component lifecycle adaptation does not directly qualify utility snapshots. React 17 compatibility branch is framework-only unsupported.' })[id]
      : 'Stable archive qualification not executed.',
    evidence: [],
  })) };
}

export function mark(report, ids, mode, status, evidence) {
  for (const id of ids) {
    const row = report.rows.find(row => row.id === id);
    if (!row) throw new Error(`Unknown coverage row: ${id}`);
    row.evidence.push({ mode, status, evidence });
    row.status = row.evidence.some(e => e.status === 'failed') ? 'failed'
      : ['production', 'development'].every(mode => row.evidence.some(e => e.mode === mode && e.status === 'passed')) ? 'passed' : 'blocked';
    row.reason = row.status === 'passed' ? null : row.status === 'failed' ? 'See exact failing evidence.' : 'Both modes must execute successfully.';
  }
}

export function parseArgs(args) {
  const options = { phase: 'compile' };
  const seen = new Set();
  for (let index = 0; index < args.length; index += 2) {
    const key = args[index];
    if (!['--consumer', '--tarball', '--output', '--phase'].includes(key) || !args[index + 1] || args[index + 1].startsWith('--')) throw new Error(`Invalid argument ${key}`);
    if (seen.has(key)) throw new Error(`Repeated argument ${key}`);
    seen.add(key);
    options[key.slice(2)] = args[index + 1];
  }
  for (const key of ['consumer', 'tarball', 'output']) if (!options[key]) throw new Error(`Required --${key}`);
  if (!['compile', 'browser'].includes(options.phase)) throw new Error('Expected --phase compile|browser');
  return options;
}

export function defaultFunction(module, name) {
  // createRequire resolves the plugin's node/CJS branch. Dynamic-import CJS
  // wraps its exports object once more than a native ESM default export.
  const value = module.default?.default ?? module.default;
  if (typeof value !== 'function') throw new Error(`Missing callable tool default: ${name}`);
  return value;
}

export function within(parent, child) {
  const relative = path.relative(parent, child);
  return relative !== '' && relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative);
}

const text = bytes => bytes.toString('utf8').replace(/\0.*$/s, '');
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');

// npm pack emits ustar/PAX archives. Read the archive directly: no installation,
// extraction, manifest edits or trust in the lane's claimed fingerprint.
export function archiveFiles(compressed) {
  const data = gunzipSync(compressed, { maxOutputLength: 512 * 1024 * 1024 });
  const files = new Map();
  let nextPath;
  for (let offset = 0; offset + 512 <= data.length;) {
    const header = data.subarray(offset, offset + 512);
    if (header.every(value => value === 0)) break;
    const expected = parseInt(text(header.subarray(148, 156)).trim(), 8);
    const checksum = header.reduce((sum, value, index) => sum + (index >= 148 && index < 156 ? 32 : value), 0);
    if (checksum !== expected) throw new Error('Invalid tar header checksum');
    const size = parseInt(text(header.subarray(124, 136)).trim() || '0', 8);
    if (!Number.isSafeInteger(size) || size < 0 || offset + 512 + size > data.length) throw new Error('Invalid tar entry size');
    const payload = data.subarray(offset + 512, offset + 512 + size);
    const type = text(header.subarray(156, 157));
    const prefix = text(header.subarray(345, 500));
    let name = [prefix, text(header.subarray(0, 100))].filter(Boolean).join('/');
    offset += 512 + Math.ceil(size / 512) * 512;
    if (type === 'x') {
      let at = 0;
      while (at < payload.length) {
        const space = payload.indexOf(32, at);
        const length = Number(payload.subarray(at, space).toString());
        if (space < at || !Number.isSafeInteger(length) || length <= space - at || at + length > payload.length) throw new Error('Invalid PAX record');
        const record = payload.subarray(space + 1, at + length - 1).toString();
        if (record.startsWith('path=')) nextPath = record.slice(5);
        at += length;
      }
      continue;
    }
    if (type === 'g') throw new Error('Global PAX metadata unsupported; archive must be npm pack output');
    name = nextPath ?? name; nextPath = undefined;
    if (!name.startsWith('package/') || name.split('/').some(part => part === '..' || part === '.') || name.includes('\\')) throw new Error(`Unsafe archive path: ${name}`);
    if (type === '5') continue;
    if (type !== '' && type !== '0') throw new Error(`Nonregular tarball entry: ${name}`);
    const relative = name.slice('package/'.length);
    if (!relative || files.has(relative)) throw new Error(`Duplicate/empty archive entry: ${name}`);
    files.set(relative, payload);
  }
  if (!files.has('package.json')) throw new Error('Tarball lacks package manifest');
  return files;
}

export async function verifyArchive(tarball, consumer, repository) {
  consumer = await realpath(consumer);
  const compressed = await readFile(tarball);
  const files = archiveFiles(compressed);
  const manifest = JSON.parse(files.get('package.json').toString());
  if (manifest.name !== 'baseui-solid2') throw new Error(`Unexpected archive name: ${manifest.name}`);
  const installed = await realpath(path.join(consumer, 'node_modules', manifest.name));
  if (!within(consumer, installed) || within(repository, installed)) throw new Error('Package is a workspace/outside-consumer link');
  for (const [relative, bytes] of files) {
    const target = path.join(installed, relative);
    const actual = await realpath(target);
    if (!within(installed, actual) || !(await lstat(target)).isFile()) throw new Error(`Nonregular installed artifact: ${relative}`);
    if (sha256(await readFile(target)) !== sha256(bytes)) throw new Error(`Installed archive mismatch: ${relative}`);
  }
  return { installed, name: manifest.name, version: manifest.version, sha256: sha256(compressed), verifiedFiles: files.size };
}
