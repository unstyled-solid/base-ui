import { spawnSync, spawn } from 'node:child_process';
import { readFileSync, writeFileSync, realpathSync, existsSync, lstatSync } from 'node:fs';
import { resolve, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BASELINE, git, readTree } from './git.mjs';
import { analyzeTests, dependencyGraph } from './analyze.mjs';
import { ingestCollections, requirements } from './runtime.mjs';
import { stableJSON } from './inventory.mjs';

const temporary = '/var/folders/k1/dqkw16gn09q6492v5jn1x_jc0000gn/T/opencode';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

/** @param {string[]} command @param {string} checkout @param {number} budget */
export async function boundedChild(command, checkout, budget) {
  return new Promise((done) => {
    const child = spawn('rtk', command.slice(1), { cwd: checkout, detached: true, stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '', stderr = '', error, timeout;
    const killGroup = (signal) => { if (child.pid) try { process.kill(-child.pid, signal); } catch (e) { if (e.code !== 'ESRCH') throw e; } };
    const timer = setTimeout(() => {
      error = new Error(`Collection exceeded bounded ${budget}ms timeout`);
      killGroup('SIGTERM'); timeout = setTimeout(() => killGroup('SIGKILL'), 2_000);
    }, budget);
    child.stdout.on('data', (data) => { stdout += data; });
    child.stderr.on('data', (data) => { stderr += data; });
    child.on('error', (cause) => { error = cause; });
    child.on('close', (status, signal) => {
      clearTimeout(timer); clearTimeout(timeout); killGroup('SIGKILL');
      done({ stdout, stderr, error, status, signal });
    });
  });
}

export async function main(args = process.argv.slice(2)) {
  const options = new Map();
  for (let i = 0; i < args.length; i += 2) {
    if (!['--checkout', '--node', '--output', '--previous'].includes(args[i]) || !args[i + 1] || options.has(args[i])) throw new Error('Usage: collect.mjs --checkout <isolated-clone> --node <isolated-node24> --output <new-temporary-json> [--previous <old-jsdom-json>]');
    options.set(args[i], args[i + 1]);
  }
  if (!['--checkout', '--node', '--output'].every((key) => options.has(key))) throw new Error('Explicit isolated checkout, Node and output required');
  const checkout = realpathSync(options.get('--checkout')), node = realpathSync(options.get('--node'));
  const requestedOutput = resolve(options.get('--output'));
  const parent = realpathSync(dirname(requestedOutput)), approved = realpathSync(temporary);
  const output = resolve(parent, basename(requestedOutput));
  for (const path of [checkout, node, parent]) if (!path.startsWith(`${approved}/`) && path !== approved) throw new Error('Collector paths must be under approved temporary parent');
  if (existsSync(output) || lstatSync(dirname(output)).isSymbolicLink()) throw new Error('Output must be new, with a real temporary parent');
  const verify = () => {
    if (git(checkout, ['rev-parse', 'HEAD']).toString().trim() !== BASELINE) throw new Error('Wrong isolated checkout SHA');
    if (git(checkout, ['status', '--porcelain', '--untracked-files=no']).toString().trim()) throw new Error('Isolated checkout has tracked modifications');
    if (!lstatSync(resolve(checkout, '.git')).isDirectory()) throw new Error('Use an independent clone, not a canonical worktree');
    if (!readFileSync(resolve(checkout, 'pnpm-lock.yaml')).equals(git(checkout, ['show', `${BASELINE}:pnpm-lock.yaml`]))) throw new Error('Frozen upstream lockfile drift');
  };
  verify();
  const version = spawnSync('rtk', ['proxy', node, '-p', 'process.version'], { encoding: 'utf8' });
  if (version.status !== 0 || !/^v24\./.test(version.stdout.trim()) || Number(version.stdout.trim().split('.')[1]) < 15) throw new Error('Compatible isolated Node >=24.15 required');
  const packageVersion = (name) => JSON.parse(readFileSync(resolve(checkout, `node_modules/${name}/package.json`), 'utf8')).version;
  const vitestVersion = packageVersion('vitest');
  if (!/^5\./.test(vitestVersion)) throw new Error('Installed upstream Vitest5 required');
  const entries = readTree(checkout), graph = dependencyGraph(entries);
  const sources = entries.map((e) => ({ path: e.path, blob: e.blob, tests: analyzeTests(e.path, e.content),
    ...graph.details.get(e.path), transitiveConsumers: graph.consumers(e.path) }));
  const manifest = { baseline: BASELINE, sources }, required = requirements(manifest);
  const documents = [];
  if (options.has('--previous')) {
    const previous = JSON.parse(readFileSync(realpathSync(options.get('--previous')), 'utf8'));
    const validated = ingestCollections(manifest, [previous]);
    if (previous.method !== 'vitest-runtime-collect' || validated.files.length === 0 || validated.files.some((f) => f.environment !== 'jsdom')) throw new Error('--previous requires the retained jsdom batch');
    documents.push(previous);
  }
  const stages = options.has('--previous') ? ['chromium', 'firefox', 'webkit', 'node', 'typescript', 'screen-reader'] : ['jsdom'];
  // Preflight every retained artifact before launching any stage. No old evidence
  // may be overwritten, even if the main output happens not to exist yet.
  for (const stage of stages) {
    const path = stages.length === 1 ? output : `${output}.${stage}.json`;
    for (const artifact of [path, `${path}.request.json`, `${path}.log`]) if (existsSync(artifact)) throw new Error(`Evidence already exists: ${artifact}`);
  }
  if (existsSync(`${output}.summary.json`)) throw new Error('Summary already exists');
  const results = [];
  for (const stage of stages) {
    const stageOutput = stages.length === 1 ? output : `${output}.${stage}.json`;
    const requestPath = `${stageOutput}.request.json`;
    let paths, projects, method, toolchain, adapter;
    if (stage === 'typescript') {
      paths = required.types; projects = []; method = 'typescript-compiler-collect';
      toolchain = { node: version.stdout.trim(), typescript: packageVersion('typescript') }; adapter = 'type-collect.mjs';
    } else if (stage === 'screen-reader') {
      paths = required.files.filter((f) => f.project === 'screen-reader').map((f) => f.path);
      projects = []; method = 'playwright-list'; toolchain = { node: version.stdout.trim(), playwright: packageVersion('@playwright/test') }; adapter = 'playwright-collect.mjs';
    } else {
      paths = required.files.filter((f) => f.environment === stage && f.project !== 'screen-reader').map((f) => f.path);
      projects = [...new Set(required.files.filter((f) => f.environment === stage && f.project !== 'screen-reader').map((f) => f.project))];
      method = 'vitest-runtime-collect'; toolchain = { node: version.stdout.trim(), vitest: vitestVersion }; adapter = 'vitest-collect.mjs';
    }
    const command = ['rtk', 'proxy', 'env', `VITEST_ENV=${stage}`, 'TZ=UTC', node, resolve(root, 'scripts/tracking', adapter), requestPath];
    writeFileSync(requestPath, stableJSON({ checkout, output: stageOutput, baseline: BASELINE, environment: stage, projects, paths,
      sources: sources.map(({ path, blob }) => ({ path, blob })), helpers: sources.filter((s) => s.tests?.kind === 'conformance-helper').map(({ path, blob }) => ({ path, blob })),
      vitestVersion, playwrightVersion: toolchain.playwright, command }), { flag: 'wx' });
    console.log(`COLLECT ONLY ${stage}: ${paths.length} pinned files`);
    const result = await boundedChild(command, checkout, ['chromium', 'firefox', 'webkit'].includes(stage) ? 120_000 : stage === 'screen-reader' ? 50_000 : stage === 'node' ? 60_000 : 90_000);
    writeFileSync(`${stageOutput}.log`, `${result.stdout ?? ''}${result.stderr ?? ''}${result.error?.stack ?? ''}`, { flag: 'wx' });
    if (!existsSync(stageOutput)) {
      const error = `Collector produced no task tree: exit=${result.status} signal=${result.signal} ${result.error?.message ?? ''}`;
      const fallback = { schemaVersion: 1, baseline: BASELINE, method, command, toolchain, files: [], errors: [error],
        ...(stage === 'typescript' ? { programPolicy: 'source-only-no-emit-pinned-test-options', configurations: sources.filter((s) => ['tsconfig.base.json', 'packages/react/tsconfig.test.json', 'packages/utils/tsconfig.test.json'].includes(s.path)).map(({ path, blob }) => ({ path, blob })) } : { specifications: [] }) };
      writeFileSync(stageOutput, stableJSON(fallback), { flag: 'wx' });
    }
    documents.push(JSON.parse(readFileSync(stageOutput, 'utf8')));
    results.push({ stage, output: stageOutput, log: `${stageOutput}.log`, exitCode: result.status });
    verify();
  }
  const batch = stages.length === 1 ? documents[0] : { schemaVersion: 1, baseline: BASELINE, method: 'collection-batch', documents };
  if (stages.length > 1) writeFileSync(output, stableJSON(batch), { flag: 'wx' });
  const collection = ingestCollections(manifest, [batch]);
  const summary = { collection: output, stages: results, collectedCases: collection.cases.length,
    environments: Object.fromEntries(['jsdom', 'chromium', 'firefox', 'webkit', 'node'].map((env) => [env, {
      files: collection.files.filter((f) => f.environment === env).length, cases: collection.cases.filter((c) => c.environment === env).length,
      skipped: collection.cases.filter((c) => c.environment === env && c.mode === 'skip').length }])),
    collectedTypeScenarios: collection.typeCases.length, collectedTypeFiles: collection.typeFiles.length,
    helperProvenance: collection.helperProvenance.map((h) => ({ path: h.path, cases: h.cases.length })),
    totalCases: collection.complete ? collection.cases.length : null, missingFileEnvironments: collection.missing.length,
    missingTypeSpecs: collection.typeSpecPaths, blockers: collection.blocked, complete: collection.complete };
  writeFileSync(`${output}.summary.json`, stableJSON(summary), { flag: 'wx' });
  console.log(JSON.stringify(summary, null, 2));
  process.exitCode = collection.complete ? 0 : 1;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { await main(); } catch (error) { console.error(error.stack ?? error); process.exitCode = 1; }
}
