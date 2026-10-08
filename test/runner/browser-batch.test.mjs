import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { writeFileSync, mkdtempSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { isAuxiliaryTesterNavigation } from '../harness/runner-navigation.ts';
import { inventoryPlan, validReceipt, runIsolatedBrowserFiles } from '../../scripts/test/browser-batch.mjs';

const file = fileURLToPath(new URL('../harness/Harness.test.tsx', import.meta.url));
test('exact inventory retains the same file in all three engines without duplicates', () => {
  const rows = ['webkit', 'chromium', 'firefox'].map((engine) => ({ file, projectName: `suite (${engine})` }));
  assert.deepEqual(inventoryPlan(rows).map((entry) => entry.engine), ['chromium', 'firefox', 'webkit']);
  assert.throws(() => inventoryPlan([...rows, rows[0]]), /Duplicate/);
  assert.throws(() => inventoryPlan([]), /Empty/);
});
test('only a complete exact-file receipt qualifies; crashes, pending and missing coverage fail closed', () => {
  const receipt = { reason: 'passed', files: [file], failed: 0, failedFiles: 0, pending: 0, unhandled: 0, unfinishedModules: 0 };
  assert.equal(validReceipt(receipt, file), true);
  for (const patch of [{ reason: 'interrupted' }, { files: [] }, { files: [file, file] }, { failed: 1 }, { pending: 1 }, { unhandled: 1 }, { unfinishedModules: 1 }]) {
    assert.equal(validReceipt({ ...receipt, ...patch }, file), false);
  }
  assert.equal(validReceipt(undefined, file), false);
});
test('discovery failure cannot produce green qualification', () => {
  assert.throws(() => runIsolatedBrowserFiles('browsers', [], () => ({ status: null, signal: 'SIGABRT' })), /discovery failed/);
  assert.throws(() => runIsolatedBrowserFiles('browsers', ['--shard=1/4']), /complete execution/);
});
test('native auxiliary tester navigation cannot join the original runner transport', () => {
  assert.equal(isAuxiliaryTesterNavigation('/?sessionId=abc#details', 'document'), true);
  assert.equal(isAuxiliaryTesterNavigation('/?sessionId=abc', 'iframe'), false);
  assert.equal(isAuxiliaryTesterNavigation('/__vitest_test__/?sessionId=abc', 'document'), false);
  assert.equal(isAuxiliaryTesterNavigation('/fixture?sessionId=abc', 'document'), false);
  assert.equal(isAuxiliaryTesterNavigation('/', 'document'), false);
});
test('fresh sequential children execute every discovered engine after an abort', () => {
  const engines = ['chromium', 'firefox', 'webkit'];
  const executed = [];
  const status = runIsolatedBrowserFiles('browsers', [], (_executable, args, options) => {
    if (args[1] === 'list') {
      writeFileSync(args.find(arg => arg.startsWith('--json=')).slice(7), JSON.stringify(engines.map(engine => ({ file, projectName: `suite (${engine})` }))));
      return { status: 0 };
    }
    const engine = options.env.HARNESS_BROWSERS;
    executed.push(engine);
    assert.equal(options.env.HARNESS_BATCH_FILE, file);
    if (engine === 'chromium') return { status: null, signal: 'SIGABRT' };
    writeFileSync(options.env.HARNESS_BATCH_RECEIPT, JSON.stringify({ reason: 'passed', files: [file], failedFiles: 0, passed: 2, failed: 0, skipped: 1, pending: 0, unhandled: 0, unfinishedModules: 0 }));
    return { status: 0 };
  });
  assert.equal(status, 1);
  assert.deepEqual(executed, engines);
});

test('durable resume reuses only fingerprint-matched green receipts and retries an abort', () => {
  const directory = mkdtempSync(join(tmpdir(), 'browser-resume-test-'));
  let fingerprint = 'original';
  const executed = [];
  let abort = true;
  const launch = (_executable, args, options) => {
    if (args[1] === 'list') {
      writeFileSync(args.find(arg => arg.startsWith('--json=')).slice(7), JSON.stringify(['chromium', 'firefox'].map(engine => ({ file, projectName: `suite (${engine})` }))));
      return { status: 0 };
    }
    executed.push(options.env.HARNESS_BROWSERS);
    if (options.env.HARNESS_BROWSERS === 'firefox' && abort) return { status: null, signal: 'SIGABRT' };
    writeFileSync(options.env.HARNESS_BATCH_RECEIPT, JSON.stringify({ reason: 'passed', files: [file], failedFiles: 0, passed: 2, failed: 0, skipped: 1, pending: 0, unhandled: 0, unfinishedModules: 0 }));
    return { status: 0 };
  };
  const options = { directory, fingerprint: () => fingerprint };
  try {
    assert.equal(runIsolatedBrowserFiles('browsers', [], launch, options), 1);
    abort = false;
    assert.equal(runIsolatedBrowserFiles('browsers', [], launch, options), 0);
    assert.deepEqual(executed, ['chromium', 'firefox', 'firefox']);
    let summary = JSON.parse(readFileSync(join(directory, 'summary.json')));
    assert.equal(summary.resumed, 1);
    assert.equal(summary.executed, 1);
    assert.equal(summary.engines.chromium.passed + summary.engines.firefox.passed, 4);
    fingerprint = 'changed-shared-code-or-inventory';
    assert.equal(runIsolatedBrowserFiles('browsers', [], launch, options), 0);
    summary = JSON.parse(readFileSync(join(directory, 'summary.json')));
    assert.equal(summary.resumed, 0);
    assert.equal(summary.executed, 2);
    assert.equal(summary.unexecuted.length, 0);
  } finally { rmSync(directory, { recursive: true, force: true }); }
});

test('selection fails closed for duplicates or undiscovered file-engine pairs', () => {
  const directory = mkdtempSync(join(tmpdir(), 'browser-selection-test-'));
  const selection = join(directory, 'selection.json');
  const launch = (_executable, args) => {
    writeFileSync(args.find(arg => arg.startsWith('--json=')).slice(7), JSON.stringify([{ file, projectName: 'suite (chromium)' }]));
    return { status: 0 };
  };
  try {
    for (const entries of [[{ file, engine: 'webkit' }], [{ file, engine: 'chromium' }, { file, engine: 'chromium' }]]) {
      writeFileSync(selection, JSON.stringify({ entries }));
      assert.throws(() => runIsolatedBrowserFiles('browsers', [], launch, { selection }), /duplicate or undiscovered/);
    }
  } finally { rmSync(directory, { recursive: true, force: true }); }
});
