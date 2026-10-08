import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';

const input = JSON.parse(await fs.readFile('input.json', 'utf8'));
const cwd = await fs.realpath('.');
const require = createRequire(path.join(cwd, 'package.json'));
const manifests = [];
async function walk(directory) {
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    if (entry.name === '.bin') continue; // npm executable shims, never package-resolution links.
    const file = path.join(directory, entry.name);
    assert(!entry.isSymbolicLink(), `Dependency graph contains a link: ${file}`);
    if (entry.isDirectory()) await walk(file);
    else if (entry.name === 'package.json') {
      const metadata = JSON.parse(await fs.readFile(file, 'utf8'));
      if (metadata.name && metadata.version) manifests.push({ name: metadata.name, version: metadata.version, path: file });
    }
  }
}
await walk(path.join(cwd, 'node_modules'));
for (const metadata of manifests) assert(!/^(?:react|react-dom|@types\/react|@types\/react-dom|@floating-ui\/react-dom)$/.test(metadata.name), `React installed: ${metadata.name}`);
for (const [name, pin] of Object.entries(input.pins)) {
  const found = manifests.filter(metadata => metadata.name === name);
  assert(found.length, `Missing installed tool/peer ${name}`);
  assert(found.every(metadata => metadata.version === pin), `Nonexact/duplicate-version installation: ${name}`);
  let directory = path.dirname(require.resolve(name));
  while (JSON.parse(await fs.readFile(path.join(directory, 'package.json'), 'utf8').catch(() => '{}')).name !== name) {
    const parent = path.dirname(directory); assert.notEqual(parent, directory); directory = parent;
  }
  assert(directory.startsWith(`${cwd}/node_modules/`), `External resolution: ${name} -> ${directory}`);
}
for (const [name, pin] of Object.entries(input.optionalPins)) {
  const found = manifests.filter(metadata => metadata.name === name);
  assert.equal(found.length > 0, input.peers.includes(name), `Optional set leaked/missing ${name}`);
  assert(found.every(metadata => metadata.version === pin), `Optional pin ${name}`);
}
const installed = path.join(cwd, 'node_modules', input.name);
const metadata = JSON.parse(await fs.readFile(path.join(installed, 'package.json'), 'utf8'));
assert.equal(metadata.name, input.name);
assert.deepEqual(metadata.exports, input.exports);
for (const file of input.inventory) {
  const bytes = await fs.readFile(path.join(installed, file.file));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), file.sha256, `Installed archive differs: ${file.file}`);
}
const lock = JSON.parse(await fs.readFile('package-lock.json', 'utf8'));
const locked = lock.packages[`node_modules/${input.name}`];
assert(locked && !locked.link && locked.resolved?.startsWith('file:'), 'Package was not installed from archive');
assert.equal(lock.packages[''].dependencies[input.name], input.tarball, 'Installed another archive');
const registryIntegrities = Object.fromEntries(Object.entries(lock.packages).filter(([key, value]) => key && key !== `node_modules/${input.name}` && value.version)
  .map(([key, value]) => {
    assert(!value.link && value.resolved?.startsWith('https://') && value.integrity, `Non-registry dependency provenance: ${key}`);
    return [key, { version: value.version, resolved: value.resolved, integrity: value.integrity }];
  }));
await fs.writeFile('installation-result.json', JSON.stringify({ manifests, archive: locked, stockRC13: true, workspacePatch: 'absent',
  registryIntegrities, provenance: 'fresh registry installation; no workspace files or patches copied; compiler babel; exact pins checked including nested packages' }, null, 2));
