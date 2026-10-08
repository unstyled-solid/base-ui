import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { git, gitText } from '../../../scripts/upstream/git/process.mjs';
import { hash, json, readState, saveState, sourcePaths } from '../../../scripts/upstream/git/state.mjs';
import { runUpstream } from '../../../scripts/upstream/git/workflow.mjs';
import { createFixtureVerifier } from '../../../scripts/upstream/verify/core.mjs';
import { fingerprint, inputRoots, mandatoryGates, gateTasks, snapshotInputs } from '../../../scripts/upstream/verify/evidence.mjs';

export const pins = {
  'base-ui': { from: 'ca5b43fca6f94ba27c46b875b34f0eefcd5ed27a', to: '46f746399bc63a985157859f7568fbaf0097d528', later: '19511bb171f3b360b006c94cf6d07e53cb446505', branch: 'master' },
  'solid-floating-ui': { from: '0a7028eb6f4fa2cda712393f818d2ccb81b1c83a', to: '0492e49b746deed543dbc167a9a58ed1210c2393', branch: 'main' },
};
const project = fileURLToPath(new URL('../../../', import.meta.url));
export const g = (root, ...args) => gitText(root, args);
export function write(path, bytes) { mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, bytes); }
export const bytes = (path) => readFileSync(path, 'utf8');
export function descriptor(root, path) { return { path, sha256: hash(readFileSync(join(root, path))) }; }

// Also compiled with representative data in the syntax preflight. Parentheses
// make the object an expression returned by the arrow, rather than a block.
export function verifierWorkerProgram({ root, core, toolchain, issues, evidencePath, evidenceHash }) {
  return `import {createFixtureVerifier} from ${JSON.stringify(core)}; const verify=createFixtureVerifier({root:${JSON.stringify(root)},runtime:()=>(${JSON.stringify(toolchain)}),beads:()=>${JSON.stringify(issues)}}); try {verify(${JSON.stringify({ evidencePath, evidenceHash, advance: true })});process.exitCode=2;}catch(e){process.stderr.write(JSON.stringify({code:e.code}));process.exitCode=1;}`;
}

// Copy immutable objects once. All ref/index/config/checkout writes below target
// temporary clones; neither canonical submodule receives even a fetch/update-ref.
export function seed(t, source) {
  const temp = mkdtempSync(join(tmpdir(), 'bsolid-verify-seed-'));
  t.after(() => rmSync(temp, { recursive: true, force: true }));
  const remote = join(temp, 'seed.git');
  g(temp, 'clone', '--bare', '--no-hardlinks', join(project, 'upstream', source), remote);
  return remote;
}

export function fixture(t, seeds, source = 'base-ui', { initial = false } = {}) {
  const temp = mkdtempSync(join(tmpdir(), 'bsolid-verify-fixture-'));
  t.after(() => rmSync(temp, { recursive: true, force: true }));
  const root = join(temp, 'consumer'); mkdirSync(root);
  g(root, 'init', '--initial-branch=fixture');
  write(join(root, '.upstream-verify-fixture.json'), json({ schemaVersion: 1, scope: 'fixture' }));
  const remotes = {};
  const initialize = (selection, pin, verified = null) => {
    const p = pins[selection];
    const remote = join(temp, `${selection}.git`);
    g(temp, 'clone', '--bare', '--shared', seeds[selection], remote);
    g(remote, 'update-ref', `refs/heads/${p.branch}`, pin);
    remotes[selection] = remote;
    const state = { repositoryUrl: remote, branch: p.branch, submodulePath: `upstream/${selection}`,
      baselineSourceSha: pin, fetchedCandidateSha: pin, verifiedParitySha: verified };
    const paths = sourcePaths(root, selection);
    write(paths.state, json(state));
    const modules = join(root, '.gitmodules');
    let previous = ''; try { previous = bytes(modules); } catch {}
    write(modules, previous + `[submodule "upstream/${selection}"]\n\tpath = upstream/${selection}\n\turl = ${remote}\n\tbranch = ${p.branch}\n`);
    g(root, 'add', '.gitmodules');
    g(root, 'update-index', '--add', '--cacheinfo', `160000,${pin},upstream/${selection}`);
    mkdirSync(join(root, 'upstream'), { recursive: true });
    const checkout = join(root, state.submodulePath);
    g(root, 'clone', '--shared', '--no-checkout', remote, checkout);
    // Small real worktrees with complete immutable object history, not fake commits.
    g(checkout, 'sparse-checkout', 'set', '--no-cone', 'LICENSE', selection === 'base-ui' ? 'packages/react/src/toast' : 'src');
    g(checkout, '-c', 'core.hooksPath=/dev/null', 'checkout', '--detach', pin);
    return { state, paths, checkout };
  };
  if (source === 'solid-floating-ui') initialize('base-ui', pins['base-ui'].later, pins['base-ui'].later);
  const p = pins[source];
  const { state, paths, checkout } = initialize(source, p.from, initial ? null : p.from);
  const cli = (command, options = {}) => runUpstream({ root, source, command, ...options });
  if (!initial) {
    g(remotes[source], 'update-ref', `refs/heads/${p.branch}`, p.to);
    cli('update');
  }
  for (const [category, names] of Object.entries(inputRoots)) for (const name of names) {
    if (name.includes('.') && !['scripts', 'distribution', 'test', 'docs'].includes(name)) write(join(root, name), `${category} ${name}\n`);
    else mkdirSync(join(root, name), { recursive: true });
  }
  const target = 'packages/solid/src/fixture.ts';
  const testPath = 'test/fixture.test.mjs';
  write(join(root, target), '// fixture handoff; no claim of real component reconciliation\n');
  write(join(root, testPath), '// fixture accounting only\n');
  write(join(root, 'docs/patches/fixture.patch'), 'fixture patch bytes\n');
  write(join(root, 'scripts/fixture.mjs'), '// fixture tool bytes\n');
  write(join(root, 'docs/fixture.md'), 'fixture docs\n');
  const runtime = { node: process.version, pnpm: 'fixture-only', solid: '2.0.0-rc.13' };
  let issuesOverride;
  const beads = (_root, required) => issuesOverride ?? [...new Set(required)].sort().map((id) => ({
    id, status: 'closed', type: 'task', labels: [], metadata: {}, dependencies: [],
  })).concat(initial ? [{ id: 'bsolid-release-ready', status: 'open', type: 'task', labels: [],
    metadata: { verificationAuthorizationHash: bundle.gates.at(-1).sha256 }, dependencies: [] }] : []);
  const verify = createFixtureVerifier({ root, runtime: () => runtime, beads });
  const current = readState(paths);
  const candidate = current.fetchedCandidateSha;
  const rawTree = git(checkout, ['ls-tree', '-r', '-z', '--full-tree', candidate]).stdout;
  const entries = rawTree.split('\0').filter(Boolean).map((line) => {
    const [, mode, , blob, path] = line.match(/^(\d+) (blob|commit) ([a-f0-9]{40})\t([\s\S]+)$/);
    return { path, blob, mode };
  });
  const report = initial ? { changes: [] } : JSON.parse(bytes(join(paths.episodes, current.activeEpisode.id, 'report.json')));
  const context = { schemaVersion: 1, source, candidateSha: candidate,
    reportHash: current.activeEpisode?.reportHash ?? null, oracleSha: source === 'base-ui' ? candidate : pins['base-ui'].later };
  const plan = { ...context, mappingRevision: 'fixture-mapping-v1', tasks: ['fixture-owner'], blockers: [], requiredGates: [],
    sourceMap: entries.map((entry) => ({ ...entry, disposition: 'excluded-with-reason', reason: 'Fixture scope only; not a real reconciliation.',
      reviewTask: 'fixture-owner', targets: [], tests: [] })),
    changes: report.changes.map((change, index) => ({ index, changeHash: hash(json(change)),
      disposition: 'reconciled', reason: 'Fixture changed-owner handoff.', task: 'fixture-owner', targets: [target], tests: [testPath] })) };
  const scenarioSource = plan.sourceMap.find((entry) => entry.path.endsWith('.test.tsx')) ?? plan.sourceMap[0];
  scenarioSource.disposition = 'translated'; scenarioSource.targets = [target]; scenarioSource.tests = [testPath];
  const inventory = { ...context, complete: true, runtimeExpanded: true, unresolved: [], obligations: [{
    id: 'fixture-only-scenario', kind: 'runtime-case', sourcePath: scenarioSource.path, sourceBlob: scenarioSource.blob,
    requirements: ['browser/chromium', 'browser/firefox', 'browser/webkit', 'source-tests/node'],
  }] };
  write(join(root, 'proof/plan.json'), json(plan));
  write(join(root, 'proof/inventory.json'), json(inventory));
  write(join(root, 'proof/package.tgz'), 'fixture package artifact; NOT a global parity build\n');
  const bundle = { ...context, kind: initial ? 'initial' : 'weekly', scope: 'fixture',
    fromSha: current.activeEpisode?.fromSha ?? candidate, sourceTreeHash: hash(rawTree), toolchain: runtime,
    plan: descriptor(root, 'proof/plan.json'), inventory: descriptor(root, 'proof/inventory.json'),
    inputs: snapshotInputs(root), artifacts: [descriptor(root, 'proof/package.tgz')], gates: [] };
  const tuple = { source, fromSha: bundle.fromSha, candidateSha: candidate, reportHash: bundle.reportHash,
    oracleSha: bundle.oracleSha, sourceTreeHash: bundle.sourceTreeHash, mappingHash: bundle.plan.sha256,
    inventoryHash: bundle.inventory.sha256, inputHash: fingerprint(bundle.inputs), toolchain: runtime, artifacts: bundle.artifacts };
  bundle.fingerprint = fingerprint(tuple);
  const requirements = Object.entries(mandatoryGates).flatMap(([name, platforms]) => platforms.map((platform) => ({ name, platform })));
  if (initial) requirements.push({ name: 'release-ready', platform: 'coordinator' });
  for (const { name, platform } of requirements) {
    const path = `proof/gates/${name}-${platform}.json`;
    const artifact = `proof/logs/${name}-${platform}.txt`;
    write(join(root, artifact), 'Fixture gate assertion; no real behavioral test execution claimed.\n');
    const record = { name, platform, tuple, status: 'passed', exitCode: 0, failures: 0, errors: 0, unresolved: 0, diagnostics: 0,
      command: 'rtk proxy node --test test/upstream/verify/core.test.mjs', versions: { fixture: '1' },
      task: gateTasks[name] ?? 'bsolid-release-ready', artifacts: [descriptor(root, artifact),
        ...(name === 'package' ? bundle.artifacts : [])],
      cases: inventory.obligations.filter((row) => row.requirements.includes(`${name}/${platform}`)).map((row) => ({
        id: row.id, status: 'passing', targets: [testPath], blockers: [],
      })), ...(name === 'release-ready' ? { authorization: 'approved' } : {}) };
    write(join(root, path), json(record));
    bundle.gates.push(descriptor(root, path));
  }
  const evidencePath = 'proof/evidence.json';
  function publish() { write(join(root, evidencePath), json(bundle)); return descriptor(root, evidencePath).sha256; }
  let evidenceHash = publish();
  return { root, source, checkout, state, paths, cli, plan, inventory, bundle, tuple, report, target, testPath,
    verify: (options = {}) => verify({ source, evidencePath, evidenceHash, ...options }),
    republish: () => { evidenceHash = publish(); },
    changeGate: (key, edit) => {
      const reference = bundle.gates.find((ref) => ref.path.endsWith(`${key}.json`));
      const record = JSON.parse(bytes(join(root, reference.path))); edit(record);
      write(join(root, reference.path), json(record)); reference.sha256 = descriptor(root, reference.path).sha256;
      evidenceHash = publish();
    },
    setIssues: (issues) => { issuesOverride = issues; },
    getIssues: () => beads(root, [...plan.tasks, ...plan.sourceMap.map((row) => row.reviewTask), ...Object.values(gateTasks), 'bsolid-upstream-impact', ...(source === 'solid-floating-ui' ? ['bsolid-donor-update-proof'] : [])]),
    queue: () => { g(remotes[source], 'update-ref', `refs/heads/${p.branch}`, p.later); return cli('update'); },
    readState: () => readState(paths), save: (next) => saveState(paths, next),
  };
}
