import { it } from 'node:test';
import assert from 'node:assert/strict';
import { browserBatchPlan, runBrowserBatches } from './browser-batch.mjs';

it('uses every native shard once and retains filters/reporters without launching a dry run', () => {
  const plan = browserBatchPlan(['chromium', '--dry-run', '--shards=4', '--reporter=dot', 'family with spaces']);
  assert.deepEqual(plan.batches.map(({ args }) => args[0]), ['--shard=1/4', '--shard=2/4', '--shard=3/4', '--shard=4/4']);
  for (const { args } of plan.batches) assert.deepEqual(args.slice(1), ['--no-watch', '--reporter=dot', 'family with spaces']);
  assert.equal(runBrowserBatches(plan, () => { throw new Error('dry-run launched a browser'); }), 0);
});

it('continues through later shards and preserves a failed qualification result', () => {
  const calls = [];
  const status = runBrowserBatches(browserBatchPlan(['browsers', '--shards=3']), (_node, args) => {
    calls.push(args);
    return { status: calls.length === 2 ? 1 : 0 };
  });
  assert.equal(calls.length, 3);
  assert.equal(status, 1);
  for (const args of calls) assert.equal(args[1], 'browsers');
});

it('rejects invalid or conflicting shard ownership instead of dropping cases', () => {
  for (const flag of ['--shards=0', '--shards=1.5', '--shards=33', '--shard=2/4']) {
    assert.throws(() => browserBatchPlan([flag]));
  }
});

it('routes every headed native-document shard to its real runner target', () => {
  const plan = browserBatchPlan(['chromium-native', '--shards=2', '--dry-run']);
  assert.deepEqual(plan.batches.map(batch => batch.target), ['chromium-native', 'chromium-native']);
  assert.equal(runBrowserBatches(plan, () => { throw new Error('dry-run launched native document'); }), 0);
});
