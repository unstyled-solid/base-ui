import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { parseMdx, walk, codeReferences, cssReferences } from '../../content/transforms/parse.mjs';
import { transformPage } from '../../content/transforms/page.mjs';
import { SOURCE_SHA, VERSION, PUBLIC_ROOT, SNAPSHOT, OUTPUT, helpers, tools, exclusions, pageDisposition } from '../../content/transforms/policy.mjs';

export const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
export const json = (value) => `${JSON.stringify(value, null, 2)}\n`;
const sorted = (values) => [...values].sort();
const git = (root, ...args) => execFileSync('rtk', ['proxy', 'git', '-C', path.join(root, 'upstream/base-ui'), ...args], { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 }).trimEnd();
const isPage = (p) => p.startsWith('docs/src/app/(docs)/') && p.endsWith('/page.mdx');
const isStyle = (p) => p.endsWith('.css');
const isCode = (p) => /\.(?:[cm]?[jt]sx?)$/.test(p);
const asset = (p) => /\.(?:woff2?|ttf|otf|png|jpe?g|webp|gif|svg|avif|ico|mp4|webm|pdf)$/.test(p);
const factories = new Set(['docs/src/utils/createDemo.ts', 'docs/src/utils/createTypes.tsx']);
const controls = new Set(['LICENSE', 'docs/package.json', 'docs/README.md', 'docs/next.config.mjs', 'docs/src/mdx-components.tsx', 'docs/src/app/sitemap/index.ts']);
const refused = (p) => p.includes('/(private)/') || p.includes('/careers/') || /(?:^|\/)(?:\.env[^/]*|\.vercel|credentials[^/]*|analytics[^/]*|GoogleAnalytics[^/]*|gtag[^/]*)/.test(p);
const snapshotIndex = 'docs/upstream/snapshot.json';
const manifestFile = 'docs/upstream-manifest.json';
const implementationFiles = [
  'docs/content/transforms/policy.mjs', 'docs/content/transforms/parse.mjs',
  'docs/content/transforms/page.mjs', 'docs/scripts/sync/engine.mjs',
];

export async function verifyTools() {
  for (const [name, expected] of Object.entries(tools)) {
    let directory = path.dirname(new URL(import.meta.resolve(name)).pathname);
    for (;;) {
      let pkg;
      try { pkg = JSON.parse(await fs.readFile(path.join(directory, 'package.json'), 'utf8')); }
      catch (e) { if (e.code !== 'ENOENT') throw e; }
      if (pkg?.name === name) {
        if (pkg.version !== expected) throw new Error(`${name}: expected ${expected}, resolved ${pkg.version}; ask bsolid-dist-contract to integrate exact versions`);
        break;
      }
      const parent = path.dirname(directory);
      if (parent === directory) throw new Error(`Cannot verify parser package ${name}`);
      directory = parent;
    }
  }
}

export function safePath(root, relative) {
  if (path.isAbsolute(relative) || relative.includes('\\') || relative.split('/').some((p) => p === '..' || p === '.' || p === '')) throw new Error(`Unsafe path: ${relative}`);
  return path.join(root, relative);
}
async function noSymlinks(root, relative) {
  safePath(root, relative);
  let cursor = root;
  for (const segment of relative.split('/')) {
    cursor = path.join(cursor, segment);
    try { if ((await fs.lstat(cursor)).isSymbolicLink()) throw new Error(`Refusing symlink: ${relative}`); }
    catch (e) { if (e.code !== 'ENOENT') throw e; }
  }
}
export async function writeChanged(root, file, bytes, check = false) {
  if (!(file.startsWith(`${SNAPSHOT}/`) || file.startsWith(`${OUTPUT}/`) || file === snapshotIndex || file === manifestFile)) throw new Error(`Outside docs-content output ownership: ${file}`);
  await noSymlinks(root, file);
  const target = safePath(root, file);
  const next = Buffer.from(bytes);
  let current;
  try { current = await fs.readFile(target); } catch (e) { if (e.code !== 'ENOENT') throw e; }
  if (current?.equals(next)) return false;
  if (check) throw new Error(`Stale or missing ${file}; run pnpm docs:sync (or --import for changed pinned inputs)`);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, next);
  return true;
}

function resolveReference(file, ref, catalog) {
  const value = ref.value;
  if (/^(?:https?:|data:|#|mailto:|tel:)/.test(value)) return { ...ref, disposition: 'external-url', target: null };
  let base;
  if (value.startsWith('.')) base = path.posix.normalize(path.posix.join(path.posix.dirname(file), value));
  else if (value.startsWith('docs/')) base = value;
  else if (value.startsWith('/')) base = `docs/public${value.split(/[?#]/)[0]}`;
  else return { ...ref, disposition: 'external-package', target: null };
  const candidates = [base, ...['.ts', '.tsx', '.mjs', '.js', '.json', '/index.ts', '/index.tsx', '/index.mjs', '/index.js'].map((ext) => base + ext)];
  const target = candidates.find((p) => catalog.has(p));
  if (!target) {
    if (ref.kind === 'asset' && ['.', '..', './', '../'].includes(value)) return { ...ref, disposition: 'source-directory-metadata', target: null };
    // Absolute site routes are links, not missing files. Local imports/assets must resolve.
    if (value.startsWith('/') && !asset(base)) return { ...ref, disposition: 'site-route', target: null };
    throw new Error(`${file}: unresolved ${ref.kind} ${value}; inventory an explicit upstream gap, do not drop it`);
  }
  if (refused(target)) throw new Error(`${file}: dependency ${target} violates named exclusion policy`);
  return { ...ref, target, disposition: target.endsWith('/types.md') ? 'react-types-not-authoritative' : 'snapshot' };
}

function references(source, file) {
  if (file.endsWith('.mdx')) {
    const refs = [];
    walk(parseMdx(source, file), (node) => {
      if (node.type === 'mdxjsEsm') for (const item of node.data.estree.body) {
        if (item.type === 'ImportDeclaration') refs.push({ value: item.source.value, kind: 'import' });
      }
      if (node.type === 'image') refs.push({ value: node.url, kind: 'asset' });
      if (node.type.startsWith('mdxJsx')) for (const a of node.attributes) {
        if ((['src', 'poster'].includes(a.name) || node.name === 'link' && a.name === 'href') && typeof a.value === 'string') refs.push({ value: a.value, kind: 'asset' });
      }
    });
    return refs;
  }
  if (isStyle(file)) return cssReferences(source, file);
  if (isCode(file)) {
    const parsed = codeReferences(source, file);
    if (parsed.diagnostics.length || parsed.unresolved.length) throw new Error(`${file}: source dependency parser needs explicit mapping: ${JSON.stringify({ diagnostics: parsed.diagnostics, dynamicImports: parsed.unresolved })}`);
    return parsed.refs.map(({ value, kind }) => ({ value, kind }));
  }
  return [];
}
function kindOf(file) {
  if (isPage(file)) return 'page';
  if (helpers.includes(file)) return 'pure-tooling';
  if (controls.has(file)) return 'provenance';
  if (file.endsWith('/types.md')) return 'react-generated-api';
  if (/\/types\.tsx?$/.test(file)) return 'react-api-source';
  if (isStyle(file)) return 'stylesheet';
  if (asset(file)) return 'asset';
  if (file.includes('/demos/')) return 'demo-dependency';
  return 'referenced-source';
}
function dispositionOf(file) {
  if (isPage(file)) return pageDisposition(file);
  if (file.endsWith('/types.md')) return 'excluded-react-type-output';
  if (isStyle(file)) return 'byte-identical-stylesheet';
  if (helpers.includes(file)) return 'byte-identical-pure-tooling';
  if (asset(file)) return file.includes('/fonts/') ? 'license-review-required' : 'byte-identical-asset';
  return 'source-reference-only';
}

export async function capture(root) {
  if (git(root, 'rev-parse', 'HEAD') !== SOURCE_SHA) throw new Error(`Pinned checkout must be ${SOURCE_SHA}; importer never moves the checkout`);
  if (git(root, 'status', '--porcelain')) throw new Error('Canonical upstream is dirty; preserve developer changes and stop');
  const catalog = new Set(git(root, 'ls-tree', '-r', '--name-only', SOURCE_SHA, 'docs', 'LICENSE').split('\n'));
  const initial = sorted(catalog).filter((p) => isPage(p) || controls.has(p) || helpers.includes(p) || p.startsWith('docs/src/css/') || p.endsWith('/types.md') && p.startsWith(`${PUBLIC_ROOT}/`));
  const queue = [...initial];
  const records = new Map();
  const blobs = new Map();
  const boundaryTargets = new Set();
  for (let i = 0; i < queue.length; i++) {
    const file = queue[i];
    if (records.has(file)) continue;
    if (refused(file)) throw new Error(`Excluded input ${file}`);
    await noSymlinks(path.join(root, 'upstream/base-ui'), file);
    const bytes = await fs.readFile(safePath(path.join(root, 'upstream/base-ui'), file));
    const kind = kindOf(file);
    // Renderer/factory sources are reference boundaries, not a recursive copy of Next.
    const boundary = factories.has(file) || controls.has(file) || kind === 'react-api-source' || (file.startsWith('docs/src/components/') && !helpers.includes(file) && !isStyle(file));
    const refs = kind === 'react-generated-api' ? [] : references(bytes.toString('utf8'), file).map((ref) => {
      const resolved = resolveReference(file, ref, catalog);
      if (boundary && resolved.target && !isStyle(resolved.target)) resolved.disposition = 'framework-boundary-not-imported';
      return resolved;
    });
    const destination = kind === 'react-generated-api' ? null : `${SNAPSHOT}/${file}`;
    records.set(file, { source: file, sha256: hash(bytes), bytes: bytes.length, destination, kind,
      disposition: dispositionOf(file), dependencies: refs, ...(boundary ? { traversalBoundary: 'framework-runtime-or-react-api-source-not-executed' } : {}) });
    if (destination) blobs.set(destination, bytes);
    for (const ref of refs) if (ref.target) {
      if (ref.disposition === 'framework-boundary-not-imported') boundaryTargets.add(ref.target);
      else queue.push(ref.target);
    }
  }
  for (const file of sorted(boundaryTargets)) if (!records.has(file)) {
    const bytes = await fs.readFile(safePath(path.join(root, 'upstream/base-ui'), file));
    records.set(file, { source: file, sha256: hash(bytes), bytes: bytes.length, destination: null,
      kind: 'framework-boundary', disposition: 'excluded-framework-runtime', exclusionRule: 'react-renderer-boundary', dependencies: [] });
  }
  const snapshot = { schemaVersion: 1, sourceSha: SOURCE_SHA, repository: 'https://github.com/mui/base-ui',
    catalog: sorted(catalog).filter((p) => isPage(p) || p.endsWith('/types.md') || /\/page\.[jt]sx?$/.test(p)),
    records: sorted(records.keys()).map((p) => records.get(p)) };
  // All graph resolution succeeds before any snapshot files are touched.
  for (const [file, bytes] of blobs) await writeChanged(root, file, bytes);
  await writeChanged(root, snapshotIndex, json(snapshot));
  return snapshot;
}

export async function readSnapshot(root) {
  const snapshot = JSON.parse(await fs.readFile(safePath(root, snapshotIndex), 'utf8'));
  if (snapshot.sourceSha !== SOURCE_SHA) throw new Error(`Snapshot SHA must be ${SOURCE_SHA}`);
  const sources = new Set();
  for (const record of snapshot.records) {
    if (sources.has(record.source)) throw new Error(`Duplicate snapshot source ${record.source}`);
    sources.add(record.source);
    if (!record.destination) continue;
    if (record.destination !== `${SNAPSHOT}/${record.source}`) throw new Error(`Invalid snapshot mapping ${record.source}`);
    await noSymlinks(root, record.destination);
    const bytes = await fs.readFile(safePath(root, record.destination));
    if (hash(bytes) !== record.sha256) throw new Error(`Snapshot hash mismatch: ${record.destination}; original inputs are immutable; use reviewed transforms or --import`);
  }
  for (const file of snapshot.catalog.filter(isPage)) if (!sources.has(file)) throw new Error(`Missing public page disposition: ${file}`);
  return snapshot;
}

export async function buildPlan(root, snapshot, readInput = (file) => fs.readFile(safePath(root, file), 'utf8')) {
  const outputs = new Map();
  const pages = [];
  const licenseRecord = snapshot.records.find((r) => r.source === 'LICENSE');
  if (!licenseRecord) throw new Error('Snapshot is missing the upstream MIT license');
  for (const record of snapshot.records.filter((r) => r.kind === 'page')) {
    const source = await readInput(record.destination);
    const page = await transformPage(source, record.source, root);
    const file = `${OUTPUT}/pages/${record.source.slice('docs/src/app/(docs)/'.length).replace(/\.mdx$/, '.json')}`;
    const bytes = json(page);
    outputs.set(file, bytes);
    pages.push({ source: record.source, route: page.route, destination: file, sha256: hash(bytes), disposition: page.disposition,
      title: page.title, headings: page.headings, imports: page.imports, nodes: page.nodes, adaptations: page.adaptations, publishable: false });
  }
  const entries = snapshot.records.map((r) => ({ ...r, sourceSha: SOURCE_SHA, transformationVersion: VERSION,
    owner: 'bsolid-docs-content', license: { spdx: r.source.includes('/fonts/') ? 'NOASSERTION' : 'MIT',
      source: 'LICENSE', destination: licenseRecord.destination, sha256: licenseRecord.sha256,
      scope: r.source.includes('/fonts/') ? 'Repository MIT notice retained; font redistribution rights need explicit review before site publication.' : 'Upstream repository MIT notice; retain embedded notices.' },
    ...(r.kind === 'pure-tooling' ? { package: { name: 'docs', version: `git:${SOURCE_SHA}`, manifest: `${SNAPSHOT}/docs/package.json` } } : {}),
    ...(r.kind === 'page' ? { generated: pages.find((p) => p.source === r.source).destination } : {}) }));
  const transformationSources = [];
  for (const source of implementationFiles) transformationSources.push({ source, sha256: hash(await fs.readFile(safePath(root, source))) });
  const manifest = { schemaVersion: 1, sourceSha: SOURCE_SHA, repository: snapshot.repository, transformationVersion: VERSION, transformationSources,
    snapshotIndex, snapshotSha256: hash(json(snapshot)), toolVersions: tools,
    verifiedParitySha: null, publication: { package: 'baseui-solid2', private: true, nameDecision: 'unresolved' },
    policy: { unknownNodes: 'fail-with-source-location', expressions: 'static-literals-only-no-eval',
      reactTypes: 'never-authoritative', historicalReleases: 'upstream-react-context-only',
      semanticFlags: 'require-reviewed-overlays-before-publication', exclusions },
    excludedRoutes: snapshot.catalog.filter((p) => !isPage(p) && /\/page\.[jt]sx?$/.test(p)).map((source) => ({ source, rule: source.includes('/(private)/') ? 'private-routes' : source.includes('/careers/') ? 'careers' : 'next-shell' })),
    entries, pages };
  outputs.set(manifestFile, json(manifest));
  outputs.set(`${OUTPUT}/report.json`, json({ sourceSha: SOURCE_SHA, transformationVersion: VERSION,
    publicPages: pages.length, capturedInputs: entries.filter((e) => e.destination).length,
    excludedReactTypeTables: entries.filter((e) => e.kind === 'react-generated-api').length,
    semanticFlags: pages.reduce((n, p) => n + p.adaptations.length, 0),
    handlers: sorted(new Set(pages.flatMap((p) => p.nodes.map((n) => n.handler)))),
    pages: pages.map(({ source, route, destination, disposition, adaptations }) => ({ source, route, destination, disposition, semanticFlagCount: adaptations.length })),
    qualification: 'Inventory and deterministic transformation only; no rendering, API, component or browser parity claim.' }));
  return outputs;
}

export async function synchronize(root, { check = false, importSource = false, verifyUpstream = false } = {}) {
  if (check && importSource) throw new Error('--check and --import are mutually exclusive; check never writes');
  await verifyTools();
  const snapshot = importSource ? await capture(root) : await readSnapshot(root);
  if (verifyUpstream) {
    if (git(root, 'rev-parse', 'HEAD') !== SOURCE_SHA || git(root, 'status', '--porcelain')) throw new Error('Upstream verification requires the clean pinned checkout');
    for (const record of snapshot.records) {
      const bytes = await fs.readFile(safePath(path.join(root, 'upstream/base-ui'), record.source));
      if (hash(bytes) !== record.sha256) throw new Error(`Upstream source mismatch: ${record.source}`);
    }
  }
  const plan = await buildPlan(root, snapshot);
  async function auditOutputs(directory) {
    let entries;
    try { entries = await fs.readdir(safePath(root, directory), { withFileTypes: true }); }
    catch (e) { if (e.code === 'ENOENT') return; throw e; }
    for (const entry of entries) {
      const file = `${directory}/${entry.name}`;
      if (entry.isSymbolicLink()) throw new Error(`Refusing symlink: ${file}`);
      if (entry.isDirectory()) await auditOutputs(file);
      else if (!plan.has(file)) throw new Error(`Uninventoried generated file ${file}; review before removal, never silently retain obsolete routes`);
    }
  }
  await auditOutputs(OUTPUT);
  const changed = [];
  for (const [file, bytes] of plan) if (await writeChanged(root, file, bytes, check)) changed.push(file);
  return { mode: check ? 'check' : importSource ? 'import' : 'sync', pages: snapshot.records.filter((r) => r.kind === 'page').length, outputs: plan.size, changed };
}
