import assert from 'node:assert/strict';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { gunzipSync } from 'node:zlib';

export const temporaryRoot = '/var/folders/k1/dqkw16gn09q6492v5jn1x_jc0000gn/T/opencode';
export const pins = Object.freeze({
  'solid-js': '2.0.0-rc.13', '@solidjs/web': '2.0.0-rc.13',
  '@solidjs/signals': '2.0.0-rc.13', '@solidjs/compiler': '2.0.0-rc.13',
  '@solidjs/babel-plugin': '2.0.0-rc.13', '@solidjs/vite-plugin': '3.0.0-next.47',
  '@babel/core': '7.29.7', vite: '8.3.2', typescript: '5.9.3',
  playwright: '1.63.0', publint: '0.3.25', '@arethetypeswrong/core': '0.18.5',
});
export const optionalPins = Object.freeze({ 'date-fns': '4.4.0', '@date-fns/tz': '1.5.0', luxon: '3.7.2', '@types/luxon': '3.7.6' });
export const peerSets = Object.freeze({ ordinary: [], 'date-fns': ['date-fns', '@date-fns/tz'], luxon: ['luxon', '@types/luxon'], both: Object.keys(optionalPins) });
export const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
export const specifier = (name, key) => name + (key === '.' ? '' : key.slice(1));
export const conditionSets = () => Array.from({ length: 64 }, (_, mask) =>
  ['types', 'browser', 'node', 'worker', 'deno', 'development'].filter((_, bit) => mask & (1 << bit)));
export function selectCondition(entry, conditions) {
  if (typeof entry === 'string') return entry;
  for (const [key, value] of Object.entries(entry)) {
    if (key === 'default' || conditions.includes(key)) {
      const selected = selectCondition(value, conditions);
      if (selected !== undefined) return selected;
    }
  }
}
export function parseArgs(argv) {
  const result = {};
  for (let i = 0; i < argv.length; i += 2) {
    assert(['--tarball', '--output', '--qualification'].includes(argv[i]), `Unknown argument ${argv[i]}`);
    assert(argv[i + 1] && !argv[i + 1].startsWith('--'), `Missing value for ${argv[i]}`);
    const key = argv[i].slice(2);
    assert(!(key in result), `Duplicate ${argv[i]}`);
    assert(path.isAbsolute(argv[i + 1]), `${argv[i]} must be absolute`);
    result[key] = argv[i + 1];
  }
  assert(result.tarball && result.output, 'Required: --tarball /absolute/archive.tgz --output /absolute/new-evidence-directory');
  return result;
}
export function inside(parent, child) {
  const relative = path.relative(parent, child);
  return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
}
export function safeArchivePath(name) {
  assert(name.startsWith('package/'), `Archive entry outside package/: ${name}`);
  const relative = name.slice(8).replace(/\/$/, '');
  assert(relative && !relative.includes('\\') && !relative.includes('\0') && !relative.includes('%'), `Unsafe archive path: ${name}`);
  assert(relative.split('/').every(part => part && part !== '.' && part !== '..'), `Unsafe archive path: ${name}`);
  return relative;
}
// Inspect actual archive bytes, never npm's predicted pack list or a staged directory.
// npm archives use ustar/PAX. Reject links, special files, unknown metadata and duplicates.
export function inspectArchive(bytes) {
  const tar = gunzipSync(bytes, { maxOutputLength: 512 * 1024 * 1024 });
  const files = new Map();
  const names = new Set();
  let offset = 0, extended = {};
  let terminated = false;
  const text = buffer => buffer.toString('utf8').split('\0')[0];
  while (offset + 512 <= tar.length) {
    const header = tar.subarray(offset, offset + 512);
    if (header.every(byte => byte === 0)) { terminated = true; assert(tar.subarray(offset).every(byte => byte === 0), 'Nonzero trailing tar data'); break; }
    const expected = Number.parseInt(text(header.subarray(148, 156)).trim(), 8);
    const sum = header.reduce((total, byte, index) => total + (index >= 148 && index < 156 ? 32 : byte), 0);
    assert.equal(sum, expected, 'Invalid tar header checksum');
    const sizeField = text(header.subarray(124, 136)).trim();
    assert(/^[0-7]+$/.test(sizeField), 'Invalid tar size field');
    const size = Number.parseInt(sizeField, 8);
    assert(Number.isSafeInteger(size) && size >= 0 && offset + 512 + size <= tar.length, 'Invalid/truncated tar size');
    const body = tar.subarray(offset + 512, offset + 512 + size);
    const type = text(header.subarray(156, 157)) || '0';
    const prefix = text(header.subarray(345, 500));
    const name = extended.path ?? (prefix ? `${prefix}/` : '') + text(header.subarray(0, 100));
    offset += 512 + Math.ceil(size / 512) * 512;
    if (type === 'x') {
      assert.equal(Object.keys(extended).length, 0, 'Stacked PAX headers');
      let cursor = 0;
      while (cursor < body.length) {
        const space = body.indexOf(32, cursor);
        const length = Number(body.subarray(cursor, space).toString());
        assert(Number.isSafeInteger(length) && length > space - cursor + 1 && cursor + length <= body.length, 'Invalid PAX record');
        const record = body.subarray(space + 1, cursor + length - 1).toString();
        const equal = record.indexOf('=');
        assert(equal > 0, 'Invalid PAX key');
        const key = record.slice(0, equal), value = record.slice(equal + 1);
        assert(['path', 'mtime', 'atime', 'ctime', 'uid', 'gid', 'uname', 'gname'].includes(key), `Unreviewed PAX key ${key}`);
        extended[key] = value;
        cursor += length;
      }
      continue;
    }
    extended = {};
    assert(['0', '5'].includes(type), `Archive links/special entries forbidden: ${name} (${type})`);
    if (type === '5' && name === 'package/') continue;
    const relative = safeArchivePath(name);
    assert(!names.has(relative), `Duplicate archive entry ${relative}`);
    assert(![...files.keys()].some(file => relative.startsWith(`${file}/`)), `Archive file used as directory: ${relative}`);
    if (type === '0') assert(![...names].some(file => file.startsWith(`${relative}/`)), `Archive directory replaced by file: ${relative}`);
    names.add(relative);
    if (type === '0') files.set(relative, Buffer.from(body));
  }
  assert.equal(Object.keys(extended).length, 0, 'Dangling PAX metadata');
  assert(terminated, 'Missing tar terminator');
  assert(files.has('package.json'), 'Archive missing package.json');
  return { sha256: sha256(bytes), files, inventory: [...files].map(([file, content]) => ({ file, bytes: content.length, sha256: sha256(content) })) };
}
export function assertInventory(archive, manifest, contract) {
  assert.equal(manifest.type, 'module');
  assert.equal(manifest.license, 'MIT');
  assert.equal(manifest.name, contract.identity.publicationName ?? contract.identity.workspaceName);
  assert.equal(manifest.version, contract.identity.version);
  if (!contract.identity.publicationName) assert.equal(manifest.private, true);
  assert(!manifest.workspaces && !manifest.scripts, 'Published workspace/lifecycle script leak');
  for (const field of ['dependencies', 'peerDependencies', 'devDependencies', 'optionalDependencies']) {
    for (const [name, version] of Object.entries(manifest[field] ?? {})) {
      assert(!/^(?:react(?:-dom)?|@types\/react(?:-dom)?|@base-ui\/|@floating-ui\/react|use-sync-external-store)(?:$|\/)/.test(name), `React dependency ${name}`);
      assert(!/^(?:workspace:|file:|link:|npm:)/.test(version), `Unpublishable dependency ${name}: ${version}`);
    }
  }
  for (const name of ['solid-js', '@solidjs/web']) assert.equal(manifest.peerDependencies?.[name], pins[name], `Required exact peer ${name}`);
  for (const name of Object.keys(optionalPins)) {
    assert.equal(manifest.peerDependenciesMeta?.[name]?.optional, true, `Optional metadata ${name}`);
    assert(!manifest.dependencies?.[name] && !manifest.optionalDependencies?.[name], `Eager optional peer ${name}`);
  }
  for (const file of ['LICENSE', 'NOTICE', 'README.md']) assert(archive.files.get(file)?.length, `Missing packed ${file}`);
  assert.match(archive.files.get('LICENSE').toString(), /MIT|Permission is hereby granted/);
  assert([...archive.files.keys()].some(file => file.startsWith('docs/') && file.endsWith('.md')), 'Missing packed Markdown');
  for (const [file, content] of archive.files) {
    const directories = [contract.format.domDirectory, contract.format.serverDirectory, contract.format.declarationsDirectory, 'docs', 'notices'];
    const metadata = ['package.json', 'LICENSE', 'NOTICE', 'THIRD-PARTY-NOTICES.md', 'README.md', 'CHANGELOG.md'];
    assert(metadata.includes(file) || directories.some(directory => file.startsWith(`${directory}/`)), `Unexpected packed path ${file}`);
    assert(!/(?:^|\/)(?:node_modules|src|__tests__|tests?|specs?|fixtures?|__fixtures__|proof|negative|testUtils|test-utils|scripts?|\.cache|\.git|\.beads|coverage|\.generated)(?:\/|$)|\.(?:test|spec|probe|typecheck)\.|\.tsbuildinfo$|\.tsx$/.test(file), `Unpublishable archive file ${file}`);
    assert(!/\.(?:fixtures?|[\w-]*fixture)\.|(?:Fixture|Fixtures)\.(?:js|d\.ts)(?:\.map)?$/.test(file), `Test fixture leaked into archive: ${file}`);
    if (file.endsWith('.map')) {
      const map = JSON.parse(content);
      assert(!map.sourceRoot || !path.isAbsolute(map.sourceRoot), `Absolute sourceRoot ${file}`);
      assert(map.sources.every(source => !path.isAbsolute(source) && !source.includes('node_modules')), `Nonportable source map ${file}`);
    }
    if (file.endsWith('.js')) assert(archive.files.has(`${file}.map`), `Missing runtime sourcemap ${file}`);
  }
}
export const requiredQualifications = ['source-export-completeness', 'current-markdown', 'adopted-notices', 'side-effect-audit', 'style-listener-disposal', 'prehydration-events'];
// Cross-owner evidence is archive-bound, hashed and explicit. Missing evidence is a
// blocker, never a successful skip or a self-reported boolean treated as proof.
export function validateQualification(input, hash, artifacts) {
  assert.equal(input.schemaVersion, 1);
  assert.equal(input.archiveSha256, hash, 'Qualification belongs to another archive');
  for (const name of requiredQualifications) {
    const entry = input.obligations?.[name];
    assert(entry && entry.status === 'passed' && entry.owner && entry.command && entry.assertions?.length && entry.artifacts?.length, `Missing qualification ${name}`);
    for (const artifact of entry.artifacts) {
      assert(path.isAbsolute(artifact.path) && /^[a-f0-9]{64}$/.test(artifact.sha256), `Invalid evidence artifact for ${name}`);
      assert(artifacts.has(artifact.path), `Missing evidence artifact: ${artifact.path}`);
      assert.equal(sha256(artifacts.get(artifact.path)), artifact.sha256, `Evidence changed: ${artifact.path}`);
    }
    const gates = entry.artifacts.filter(artifact => artifact.kind === 'gate-json');
    assert(gates.length, `Missing machine-readable gate evidence for ${name}`);
    for (const artifact of gates) {
      const gate = JSON.parse(artifacts.get(artifact.path));
      assert.equal(gate.schemaVersion, 1, `${name}: unsupported gate evidence`);
      assert.equal(gate.archiveSha256, hash, `${name}: gate checked another archive`);
      assert.equal(gate.status, 'passed', `${name}: gate did not pass`);
      assert.equal(gate.owner, entry.owner, `${name}: evidence owner mismatch`);
      assert.equal(gate.command, entry.command, `${name}: evidence command mismatch`);
      assert.equal(gate.exitCode, 0, `${name}: failed command`);
      assert.equal(gate.signal, null, `${name}: interrupted command`);
      assert.deepEqual(gate.blockers, [], `${name}: unresolved gate blockers`);
      assert.deepEqual(gate.diagnostics, [], `${name}: unapproved diagnostics`);
      for (const assertion of entry.assertions) assert(gate.assertions?.some(result => result.id === assertion && result.status === 'passed'), `${name}: missing executed assertion ${assertion}`);
      assert(gate.assertions.every(result => result.status === 'passed'), `${name}: incomplete/skipped assertion`);
      for (const log of [gate.stdout, gate.stderr]) {
        assert(log && entry.artifacts.some(candidate => candidate.kind === 'raw-log' && candidate.path === log), `${name}: full command log missing`);
      }
    }
  }
  assert(input.markdown && Object.keys(input.markdown).length, 'Missing current Markdown hash inventory');
  assert(input.notices?.length, 'Missing adopted-source notice inventory');
  return input;
}
export function assertCoverage(report, contract) {
  assert.match(report.archiveSha256 ?? '', /^[a-f0-9]{64}$/);
  assert.deepEqual(Object.keys(report.consumers).sort(), Object.keys(peerSets).sort());
  for (const [kind, consumer] of Object.entries(report.consumers)) {
    for (const stage of ['installation', 'import-audit', 'initialization', 'types', 'fixture-types', 'resolution', 'runtime', 'temporal', 'ssr', 'browser', 'shaking', 'optimized-behavior']) assert.equal(consumer.stages[stage]?.status, 'passed', `${kind}: incomplete ${stage}`);
    const expected = Object.keys(contract.exports).filter(key => {
      if (!key.includes('temporal-adapter-')) return true;
      return kind === 'both' || key.endsWith(`temporal-adapter-${kind}`);
    }).sort();
    assert.deepEqual(consumer.typeKeys?.slice().sort(), expected, `${kind}: incomplete export type accounting`);
    assert.equal(consumer.typeModes?.join(','), 'Bundler,NodeNext');
    assert.equal(consumer.resolutionSets, 64);
    assert.equal(consumer.stages.browser.sets, 8, `${kind}: incomplete browser condition matrix`);
    assert.equal(consumer.stages['worker-ssr']?.status, 'passed', `${kind}: incomplete worker SSR`);
    assert.equal(consumer.stages['worker-ssr'].sets, 8, `${kind}: incomplete mixed worker condition matrix`);
  }
  for (const stage of ['inventory', 'analysis', 'production-browser', 'tree-shaking', 'qualifications']) assert.equal(report.stages[stage]?.status, 'passed', `Incomplete mandatory ${stage}`);
  assert.equal(report.blockers.length, 0, 'Unresolved mandatory obligations');
}
