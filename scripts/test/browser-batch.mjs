import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { mkdtempSync, readFileSync, rmSync, mkdirSync, writeFileSync, renameSync, readdirSync, openSync, closeSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';

const root = fileURLToPath(new URL('../../', import.meta.url));
const runner = fileURLToPath(new URL('./run.mjs', import.meta.url));
const require = createRequire(import.meta.url);
const vitest = join(dirname(require.resolve('vitest/package.json')), 'vitest.mjs');
const ts = require('typescript');

export function inventoryPlan(inventory) {
  if (!Array.isArray(inventory) || !inventory.length) throw new Error('Empty browser inventory');
  const seen = new Set();
  return inventory.map(({ file, projectName }) => {
    const engine = /\((chromium|firefox|webkit)\)$/.exec(projectName ?? '')?.[1];
    if (!engine || typeof file !== 'string' || !file.startsWith(root)) throw new Error('Invalid browser inventory entry');
    const key = `${engine}:${file}`;
    if (seen.has(key)) throw new Error(`Duplicate browser inventory entry: ${key}`);
    seen.add(key);
    return { file, engine };
  }).sort((a, b) => a.engine.localeCompare(b.engine) || a.file.localeCompare(b.file));
}

export function validReceipt(receipt, file) {
  return receipt?.reason === 'passed' && receipt.files?.length === 1 && receipt.files[0] === file
    && receipt.failed === 0 && receipt.failedFiles === 0 && receipt.pending === 0
    && receipt.unhandled === 0 && receipt.unfinishedModules === 0;
}

const digest = (value) => createHash('sha256').update(value).digest('hex');
function atomicJSON(file, value) {
  writeFileSync(`${file}.tmp`, JSON.stringify(value, null, 2));
  renameSync(`${file}.tmp`, file);
}

// Inventory/config/toolchain/harness changes invalidate the matrix. Local
// source/test/fixture dependencies are checked transitively for each entry.
export function qualificationFingerprint(plan, target, args) {
  const hash = createHash('sha256');
  hash.update(JSON.stringify({ plan, target, args, node: process.version }));
  function visit(path, productionOnly = false) {
    for (const entry of readdirSync(join(root, path), { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === '__screenshots__') continue;
      const child = `${path}/${entry.name}`;
      if (entry.isDirectory()) visit(child, productionOnly);
      else if (entry.isFile() && !(productionOnly && /\.(?:test|spec)\.[^.]+$/.test(child))) {
        hash.update(child); hash.update(readFileSync(join(root, child)));
      }
    }
  }
  for (const path of ['packages/solid/test', 'test/harness', 'test/ssr-harness', 'scripts/test']) visit(path);
  for (const path of ['vitest.config.ts', 'vitest.browser.config.ts', 'package.json', 'pnpm-lock.yaml']) {
    hash.update(path); hash.update(readFileSync(join(root, path)));
  }
  return hash.digest('hex');
}

export function dependencyFingerprint(file) {
  const config = ts.readConfigFile(join(root, 'tsconfig.json'), ts.sys.readFile);
  const compilerOptions = ts.parseJsonConfigFileContent(config.config, ts.sys, root).options;
  const seen = new Set();
  function visit(path) {
    if (seen.has(path) || path.includes('/node_modules/')) return;
    seen.add(path);
    const text = readFileSync(path, 'utf8');
    if (/\.[cm]?[jt]sx?$/.test(path)) for (const { fileName: specifier } of ts.preProcessFile(text, true, true).importedFiles) {
      const resolved = specifier === '#test-utils' ? join(root, 'packages/solid/test/index.ts')
        : ts.resolveModuleName(specifier, path, compilerOptions, ts.sys).resolvedModule?.resolvedFileName
          ?? (specifier.startsWith('.') && existsSync(resolve(dirname(path), specifier)) ? resolve(dirname(path), specifier) : undefined);
      if (resolved) visit(resolved);
      else if (specifier.startsWith('.')) throw new Error(`Unresolved local test dependency ${specifier} in ${path}`);
    }
  }
  visit(file);
  const hash = createHash('sha256');
  for (const path of [...seen].sort()) { hash.update(path); hash.update(readFileSync(path)); }
  return hash.digest('hex');
}

export function runIsolatedBrowserFiles(target, args, launch = spawnSync, options = {}) {
  if (args.some((arg) => arg.startsWith('--shard') || arg.startsWith('--bail') || arg.startsWith('--passWithNoTests'))) {
    throw new Error('Bounded qualification owns inventory and requires complete execution');
  }
  const retained = options.directory ?? process.env.HARNESS_BATCH_DIRECTORY;
  const timeout = Number(process.env.HARNESS_BATCH_TIMEOUT_MS ?? 300_000);
  if (!Number.isInteger(timeout) || timeout <= 0) throw new Error('Invalid browser process watchdog');
  const directory = retained ? resolve(retained) : mkdtempSync(join(tmpdir(), 'bsolid-browser-batches-'));
  if (retained) mkdirSync(directory, { recursive: true });
  const inventoryFile = join(directory, 'inventory.json');
  const env = { ...process.env, TZ: 'UTC', HARNESS_TARGET: 'browser',
    HARNESS_BROWSERS: target === 'browsers' ? (process.env.HARNESS_BROWSERS ?? 'chromium,firefox,webkit') : 'chromium',
    HARNESS_NATIVE_DOCUMENT: target === 'chromium-native' ? '1' : '' };
  try {
    const discovery = launch(process.execPath, [vitest, 'list', '--config', 'vitest.browser.config.ts',
      '--filesOnly', `--json=${inventoryFile}`, ...args], { cwd: root, stdio: 'inherit', env });
    if (discovery.error || discovery.status !== 0) throw new Error('Browser inventory discovery failed');
    const inventory = inventoryPlan(JSON.parse(readFileSync(inventoryFile, 'utf8')));
    const selectionFile = options.selection ?? process.env.HARNESS_BATCH_SELECTION;
    const selection = selectionFile ? JSON.parse(readFileSync(selectionFile, 'utf8')).entries : inventory;
    if (!Array.isArray(selection) || !selection.length) throw new Error('Empty browser selection');
    const selectedKeys = new Set(selection.map(({ engine, file }) => `${engine}:${file}`));
    const plan = inventory.filter(({ engine, file }) => selectedKeys.has(`${engine}:${file}`));
    if (plan.length !== selection.length) throw new Error('Browser selection has duplicate or undiscovered entries');
    const shared = retained ? (options.fingerprint ?? qualificationFingerprint)(inventory, target, args) : '';
    if (retained) atomicJSON(join(directory, 'plan.json'), { inventory, plan, shared, selectionFile });
    const totals = {};
    let failed = 0;
    let executed = 0;
    let resumed = 0;
    const results = [];
    const summary = () => ({ intended: plan.length, executed, resumed, failedBatches: failed, engines: totals, results,
      unexecuted: plan.slice(results.length) });
    for (const [index, { file, engine }] of plan.entries()) {
      const key = `${engine}:${file}`;
      // Compute immediately before launch so a repaired fixture never receives
      // an earlier test-code fingerprint from the start of a long inventory.
      const fingerprint = digest(`${shared}:${engine}:${retained ? dependencyFingerprint(file) : readFileSync(file)}`);
      const name = digest(key);
      const receiptFile = join(directory, `receipt-${name}.json`);
      const checkpointFile = join(directory, `checkpoint-${name}.json`);
      let previous;
      if (retained) { try { previous = JSON.parse(readFileSync(checkpointFile, 'utf8')); } catch { /* No usable checkpoint. */ } }
      const reusable = previous?.fingerprint === fingerprint && previous?.status === 0 && validReceipt(previous.receipt, file);
      console.log(`[HARNESS_BATCH] ${index + 1}/${plan.length} ${engine} ${file}`);
      let result;
      let receipt = reusable ? previous.receipt : undefined;
      if (reusable) { resumed++; result = { status: 0 }; console.log('[HARNESS_BATCH_RESUMED] matching complete receipt'); }
      else {
        rmSync(receiptFile, { force: true });
        const log = retained ? openSync(join(directory, `${name}.log`), 'w') : undefined;
        try {
          executed++;
          result = launch(process.execPath, [runner, target, ...args], { cwd: root,
            stdio: log === undefined ? 'inherit' : ['ignore', log, log], timeout, detached: true,
            env: { ...env, HARNESS_BROWSERS: engine, HARNESS_BATCH_FILE: file, HARNESS_BATCH_RECEIPT: receiptFile } });
          // A watchdog must close the runner's Vite/provider descendants too.
          // Only our freshly detached child process group is eligible.
          if ((result.error || result.status === null) && result.pid > 0) {
            try { process.kill(-result.pid, 'SIGTERM'); }
            catch (error) { if (error.code !== 'ESRCH') throw error; }
          }
        } finally { if (log !== undefined) closeSync(log); }
        try { receipt = JSON.parse(readFileSync(receiptFile, 'utf8')); } catch { /* Missing receipt is an abort. */ }
        if (retained) atomicJSON(checkpointFile, { engine, file, fingerprint, status: result.status,
          signal: result.signal, error: result.error?.message, receipt });
      }
      const complete = !result.error && result.status === 0 && validReceipt(receipt, file);
      if (!complete) { failed++; console.error(`[HARNESS_BATCH_FAILURE] ${engine} ${file} status=${result.status} signal=${result.signal ?? 'none'} receipt=${JSON.stringify(receipt ?? null)}`); }
      const counts = totals[engine] ??= { files: 0, passed: 0, failed: 0, skipped: 0, pending: 0, unhandled: 0, incomplete: 0 };
      counts.files++;
      const finished = receipt?.files?.length === 1 && receipt.files[0] === file && receipt.pending === 0
        && receipt.unfinishedModules === 0 && ['passed', 'failed'].includes(receipt.reason);
      if (!finished || result.error || result.status === null) counts.incomplete++;
      for (const key of ['passed', 'failed', 'skipped', 'pending', 'unhandled']) counts[key] += receipt?.[key] ?? 0;
      results.push({ engine, file, complete, resumed: reusable, receipt, log: retained ? join(directory, `${name}.log`) : undefined });
      if (retained) atomicJSON(join(directory, 'summary.json'), summary());
    }
    console.log(`[HARNESS_BATCH_FINAL] ${JSON.stringify({ ...summary(), results: undefined, unexecuted: undefined })}`);
    return failed ? 1 : 0;
  } finally { if (!retained) rmSync(directory, { recursive: true, force: true }); }
}

export function browserBatchPlan(input) {
  const args = [...input];
  const target = ['chromium', 'browsers', 'chromium-native'].includes(args[0]) ? args.shift() : 'chromium';
  let shards = 4;
  let dryRun = false;
  const forwarded = [];
  for (const arg of args) {
    if (arg === '--dry-run') dryRun = true;
    else if (arg.startsWith('--shards=')) shards = Number(arg.slice('--shards='.length));
    else if (arg.startsWith('--shard')) throw new Error('Use --shards=N; the batch runner owns every --shard=i/N');
    else if (arg !== '--no-watch') forwarded.push(arg);
  }
  if (!Number.isInteger(shards) || shards < 1 || shards > 32) throw new Error('--shards must be an integer from 1 to 32');
  return {
    dryRun,
    batches: Array.from({ length: shards }, (_, index) => ({
      target, args: [`--shard=${index + 1}/${shards}`, '--no-watch', ...forwarded],
    })),
  };
}

function quote(arg) { return /^[\w=./:-]+$/.test(arg) ? arg : `'${arg.replaceAll("'", "'\\''")}'`; }

export function runBrowserBatches(plan, launch = spawnSync) {
  const { target, args } = plan.batches[0];
  const forwarded = args.filter((arg) => !arg.startsWith('--shard=') && arg !== '--no-watch');
  if (plan.dryRun) {
    console.log(`[browser batch] ${target} exact file/engine inventory; sequential fresh processes; args=${forwarded.map(quote).join(' ')}`);
    return 0;
  }
  return runIsolatedBrowserFiles(target, forwarded, launch);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const plan = browserBatchPlan(process.argv.slice(2));
    // Retain legacy --shards syntax, but qualification now uses exact inventory
    // rather than hash shards whose process lifetime grows with the suite.
    process.exitCode = runBrowserBatches(plan);
  }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
