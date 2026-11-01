import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';

// Exercise the actual installed comparator, including the versioned pnpm patch.
// Its inspection must remain inert, but genuine data changes must stay visible.
const source = readFileSync(new URL('../../node_modules/@solidjs/signals/dist/dev.attribution.js', import.meta.url), 'utf8');
const start = source.indexOf('const UNSTABLE_KEY_CAP = 64;');
const end = source.indexOf('function checkUnstableOutput(', start);
assert.ok(start >= 0 && end > start, 'installed diagnostic comparator must be found');
const equivalent = runInNewContext(`${source.slice(start, end)}\nshallowEquivalent`);

test('unstable-output inspection never executes application getters', () => {
  let reads = 0;
  const object = () => ({ get children() { reads++; throw new Error('application getter executed'); } });
  const array = () => Object.defineProperty([], '0', { enumerable: true, configurable: true, get() { reads++; throw new Error('array getter executed'); } });
  assert.equal(equivalent(object(), object()), false);
  assert.equal(equivalent(array(), array()), false);
  assert.equal(reads, 0);
});

test('RC20 symbol-keyed changes remain visible to unstable-output inspection', () => {
  const key = Symbol('dynamic');
  const same = {};
  assert.equal(equivalent({ [key]: same }, { [key]: same }), true);
  assert.equal(equivalent({ [key]: {} }, { [key]: {} }), false);
  assert.equal(equivalent({ value: 1 }, { value: 2 }), false);
  assert.equal(equivalent({ value: 1 }, { value: 1 }), true);
});

test('inspection preserves array length, sparse presence and data-value differences', () => {
  assert.equal(equivalent([1], [1]), true);
  assert.equal(equivalent([1], [2]), false);
  assert.equal(equivalent([], [undefined]), false);
  assert.equal(equivalent(new Array(1), [undefined]), false);
  assert.equal(equivalent(new Array(1), new Array(1)), true);
});
