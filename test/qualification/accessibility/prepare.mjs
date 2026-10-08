import { mkdir, readFile, writeFile, realpath, symlink, cp, stat } from 'node:fs/promises';
import { resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { root, directory, files, digest } from './inventory.mjs';

export const cache = resolve(directory, '.cache');
export function options(args, names) {
  const result = {};
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i];
    if (!names.includes(key) || !args[i + 1] || args[i + 1].startsWith('--') || result[key]) throw new Error(`Invalid option ${key}`);
    result[key] = args[i + 1];
  }
  return result;
}
export function owned(path) {
  const value = resolve(path);
  if (!value.startsWith(`${cache}/`)) throw new Error(`Generated output must be under ${cache}`);
  return value;
}
export async function treeHash(packagePath) {
  const records = [];
  for (const path of await files(packagePath)) records.push([relative(packagePath, path), digest(await readFile(path))]);
  return digest(JSON.stringify(records));
}
export async function fixtureHash() {
  const paths = (await files(directory)).filter((p) => !p.startsWith(`${cache}/`));
  return digest(JSON.stringify(await Promise.all(paths.map(async (p) => [relative(directory, p), digest(await readFile(p))]))));
}
export async function readPrepared(path = resolve(cache, 'prepared.json')) {
  const value = JSON.parse(await readFile(owned(path), 'utf8'));
  value.host = owned(value.host);
  const packagePath = await realpath(resolve(value.host, 'node_modules/baseui-solid2'));
  if (packagePath !== value.packagePath || await treeHash(packagePath) !== value.packageSha256) throw new Error('Installed package changed since preparation');
  if (await fixtureHash() !== value.fixtureSha256) throw new Error('Fixtures changed since preparation; prepare again');
  if (value.tarball && digest(await readFile(value.tarball)) !== value.artifactSha256) throw new Error('Tarball changed since preparation');
  for (const entry of value.peers) {
    const path = await realpath(resolve(value.host, 'node_modules', entry.name));
    if (path !== entry.path || digest(await readFile(resolve(path, 'package.json'))) !== entry.manifestSha256) throw new Error(`Peer changed: ${entry.name}`);
  }
  return value;
}
export async function prepare(args) {
  const opts = options(args, ['--tarball', '--consumer']);
  if (Boolean(opts['--tarball']) === Boolean(opts['--consumer'])) throw new Error('Exactly one --tarball or --consumer is required');
  await mkdir(cache, { recursive: true });
  let packagePath, artifactSha256, tarball;
  const peerRoot = opts['--consumer'] ? resolve(opts['--consumer'], 'node_modules') : resolve(root, 'node_modules');
  if (opts['--tarball']) {
    tarball = await realpath(resolve(opts['--tarball']));
    artifactSha256 = digest(await readFile(tarball));
    const install = owned(resolve(cache, `archive-${artifactSha256}`));
    // Use existing system tar through RTK; no install scripts, dependency changes or network.
    const list = spawnSync('rtk', ['proxy', 'tar', '-tzf', tarball], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
    if (list.status !== 0) throw new Error(list.stderr || 'Cannot list archive');
    const entries = list.stdout.split('\n').filter(Boolean);
    if (!entries.length || entries.some((p) => !p.startsWith('package/') || p.split('/').includes('..'))) throw new Error('Archive must contain only safe package/ entries');
    if (!(await stat(install).catch(() => null))) {
      await mkdir(install);
      const extracted = spawnSync('rtk', ['proxy', 'tar', '-xzf', tarball, '-C', install], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
      if (extracted.status !== 0) throw new Error(extracted.stderr || 'Archive extraction failed');
    }
    packagePath = await realpath(resolve(install, 'package'));
  } else {
    const consumer = await realpath(resolve(opts['--consumer']));
    if (consumer === root || consumer.startsWith(`${root}/`)) throw new Error('--consumer must be an independent external consumer');
    packagePath = await realpath(resolve(consumer, 'node_modules/baseui-solid2'));
    if (packagePath.startsWith(`${root}/packages/solid`)) throw new Error('Workspace package links are forbidden');
  }
  const manifest = JSON.parse(await readFile(resolve(packagePath, 'package.json'), 'utf8'));
  if (manifest.name !== 'baseui-solid2') throw new Error(`Unexpected artifact package ${manifest.name}`);
  const packageSha256 = await treeHash(packagePath);
  artifactSha256 ??= packageSha256;
  const host = owned(resolve(cache, `host-${artifactSha256}-${Date.now()}`));
  await mkdir(resolve(host, 'node_modules'), { recursive: true });
  await symlink(packagePath, resolve(host, 'node_modules/baseui-solid2'), 'dir');
  const peers = [];
  // Exact already-supported peers only; Vite/compiler/Playwright remain project tools.
  for (const name of ['solid-js', '@solidjs/web', '@solidjs/signals']) {
    const path = await realpath(resolve(peerRoot, name));
    const text = await readFile(resolve(path, 'package.json'));
    const pkg = JSON.parse(text);
    if (pkg.version !== '2.0.0-rc.13') throw new Error(`Expected RC13 ${name}, got ${pkg.version}`);
    await mkdir(dirname(resolve(host, 'node_modules', name)), { recursive: true });
    await symlink(path, resolve(host, 'node_modules', name), 'dir');
    peers.push({ name, path, version: pkg.version, manifestSha256: digest(text) });
  }
  // Actual third-party runtime dependencies already installed in the chosen consumer/toolchain.
  for (const name of Object.keys(manifest.dependencies ?? {})) {
    if (name === 'baseui-solid2' || peers.some((p) => p.name === name)) continue;
    const path = await realpath(resolve(peerRoot, name));
    await mkdir(dirname(resolve(host, 'node_modules', name)), { recursive: true });
    await symlink(path, resolve(host, 'node_modules', name), 'dir');
  }
  // Resolve imports originating inside the extracted package through the installed peer set.
  if (tarball && !(await stat(resolve(packagePath, 'node_modules')).catch(() => null)))
    await symlink(resolve(host, 'node_modules'), resolve(packagePath, 'node_modules'), 'dir');
  await writeFile(resolve(host, 'package.json'), JSON.stringify({ private: true, type: 'module' }));
  for (const file of ['host.tsx', 'index.html', 'fixture.css', 'tsconfig.json']) await cp(resolve(directory, file), resolve(host, file));
  const require = createRequire(resolve(host, 'package.json'));
  const imports = [...(await readFile(resolve(host, 'host.tsx'), 'utf8')).matchAll(/from 'baseui-solid2\/([^']+)'/g)].map((match) => match[1]);
  const resolvedImports = imports.map((name) => ({ name, resolved: require.resolve(`baseui-solid2/${name}`) }));
  for (const entry of resolvedImports) {
    const actual = await realpath(entry.resolved);
    if (!actual.startsWith(`${packagePath}/`) || /\.[cm]?tsx?$/.test(actual)) throw new Error(`Packed compiled export required: ${entry.name} -> ${actual}`);
  }
  const record = { schemaVersion: 1, mode: tarball ? 'installed-tarball' : 'external-consumer', tarball: tarball ?? null,
    artifactSha256, packageSha256, packagePath, packageVersion: manifest.version, host, peers, resolvedImports,
    fixtureSha256: await fixtureHash(), prepared: new Date().toISOString() };
  await writeFile(resolve(cache, 'prepared.json'), `${JSON.stringify(record, null, 2)}\n`);
  console.log(JSON.stringify(record, null, 2));
  return record;
}
if (process.argv[1] === fileURLToPath(import.meta.url)) await prepare(process.argv.slice(2));
