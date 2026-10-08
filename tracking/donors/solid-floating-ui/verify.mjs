// Read-only donor intake validation. Shared update/selector engine belongs to scripts/upstream.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, matchesGlob } from 'node:path';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const own = 'tracking/donors/solid-floating-ui/';
const read = (path) => readFileSync(join(root, path), 'utf8');
const json = (path) => JSON.parse(read(path));
const command = (...args) => execFileSync('rtk', ['proxy', ...args], {
  cwd: root, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024,
}).trim();
const state = json('tracking/donors/solid-floating-ui.json');
const provenance = json(`${own}provenance.json`);
const map = json(`${own}source-map.json`);
const git = (...args) => command('git', '-C', state.submodulePath, ...args);

assert.match(state.baselineSourceSha, /^[a-f0-9]{40}$/);
assert.equal(state.baselineSourceSha, provenance.sourceSha);
assert.equal(map.sourceSha, provenance.sourceSha);
assert.equal(map.baseUiSha, provenance.behavioralOracle.sourceSha);
assert.equal(git('rev-parse', 'HEAD'), state.baselineSourceSha);
assert.equal(git('status', '--porcelain=v1', '--untracked-files=all'), '');
assert.equal(git('remote', 'get-url', 'origin'), state.repositoryUrl);
assert.equal(command('git', 'config', '-f', '.gitmodules', `submodule.${state.submodulePath}.path`), state.submodulePath);
assert.equal(command('git', 'config', '-f', '.gitmodules', `submodule.${state.submodulePath}.url`), state.repositoryUrl);
assert.equal(command('git', 'config', '-f', '.gitmodules', `submodule.${state.submodulePath}.branch`), state.branch);
assert.equal(command('git', 'ls-files', '--stage', state.submodulePath),
  `160000 ${state.baselineSourceSha} 0\t${state.submodulePath}`);
assert.equal(command('git', '-C', provenance.behavioralOracle.submodulePath, 'rev-parse', 'HEAD'), map.baseUiSha);
assert.equal(command('git', '-C', provenance.behavioralOracle.submodulePath, 'status', '--porcelain=v1', '--untracked-files=all'), '');

const license = read(`${state.submodulePath}/${provenance.license.sourcePath}`);
assert.equal(read(provenance.license.preservedCopy), license);
assert.equal(git('hash-object', provenance.license.sourcePath), provenance.license.gitBlobSha);
assert.ok(license.includes(provenance.license.copyright));
const pkg = json(`${state.submodulePath}/${provenance.packagePath}`);
assert.equal(pkg.version, provenance.packageVersion);
assert.equal(pkg.license, provenance.license.spdx);
assert.equal(pkg.peerDependencies['solid-js'], provenance.compatibility.donorSolidPeer);
assert.equal(pkg.devDependencies['solid-js'], provenance.compatibility.donorSolidDev);
assert.equal(pkg.peerDependencies['@floating-ui/dom'], provenance.compatibility.donorDomPeer);
assert.equal(pkg.devDependencies['@floating-ui/dom'], provenance.compatibility.donorDomDev);

const sourceFiles = git('ls-files', map.sourceRoot).split('\n').filter(Boolean);
const mapped = map.groups.flatMap((group) => group.sources.map((source) => map.sourceRoot + source));
assert.equal(new Set(mapped).size, mapped.length, 'duplicate source assignment');
assert.deepEqual([...mapped].sort(), [...sourceFiles].sort(), 'unclassified or nonexistent donor runtime source');
const specs = git('ls-files', 'packages/solid-floating-ui/e2e/specs').split('\n').filter(Boolean);
const mappedSpecs = map.groups.flatMap((group) => group.donorTests);
assert.deepEqual([...new Set(mappedSpecs)].sort(), specs.sort(), 'unclassified donor spec');

const owners = [...new Set(map.groups.filter((group) => group.targets.length).map((group) => group.owner))];
const tickets = JSON.parse(command('bd', 'show', ...owners, '--json'));
const byId = new Map(tickets.map((ticket) => [ticket.id, ticket]));
const targetOwners = new Map();
for (const group of map.groups) {
  assert.ok(group.decision && group.seam && group.gate, `missing decision: ${group.id}`);
  for (const target of group.targets) {
    const path = map.targetRoot + target;
    const ticket = byId.get(group.owner);
    assert.ok(ticket?.metadata?.owns?.some((pattern) => matchesGlob(path, pattern)),
      `${path} is outside ${group.owner} ownership`);
    assert.ok(!targetOwners.has(path) || targetOwners.get(path) === group.owner,
      `competing target owners: ${path}`);
    targetOwners.set(path, group.owner);
  }
  for (const source of group.oracle) {
    assert.ok(existsSync(join(root, provenance.behavioralOracle.submodulePath, source)), `missing oracle: ${source}`);
  }
  for (const source of group.donorTests) {
    assert.ok(existsSync(join(root, state.submodulePath, source)), `missing donor spec: ${source}`);
  }
}
const followups = JSON.parse(command('bd', 'show', ...provenance.followups, '--json'));
assert.deepEqual(followups.map((issue) => issue.id).sort(), [...provenance.followups].sort());
assert.equal(provenance.compatibility.adaptedSourceSha, null, 'intake assessment must not claim implementation');
assert.equal(state.verifiedParitySha, null, 'intake assessment must not claim parity');
console.log(JSON.stringify({
  result: 'PASS', sourceSha: state.baselineSourceSha, baseUiSha: map.baseUiSha,
  cleanSubmodules: true, stagedGitlink: true, licenseByteIdentical: true,
  runtimeSources: mapped.length, donorSpecs: specs.length, mappedTargets: targetOwners.size,
  owners: owners.length, followups: followups.map((issue) => issue.id),
  sourceMapSha256: createHash('sha256').update(read(`${own}source-map.json`)).digest('hex'),
  qualification: 'intake only; production adaptation and browser replay pending',
}, null, 2));
