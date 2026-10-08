import { afterEach, expect, it } from 'vitest';
import { createEffect, createMemo, createRoot, createSignal, flush } from 'solid-js';
import { attribution } from 'solid-js/attribution';
import { expectDiagnostic } from '../../../test/harness/diagnostics';

let dispose: (() => void) | undefined;
afterEach(() => { attribution.disable(); dispose?.(); dispose = undefined; });

function updateShape(make: (version: number) => object) {
  let update!: () => void;
  attribution.enable();
  createRoot(cleanup => {
    dispose = cleanup;
    const [version, setVersion] = createSignal(0);
    const shape = createMemo(() => make(version()));
    createEffect(shape, () => undefined);
    update = () => { setVersion(v => v + 1); flush(); };
  });
  return update;
}

it('does not invoke own object accessors, including identical getter functions', () => {
  let reads = 0;
  const getter = () => { reads++; throw new Error('diagnostic invoked getter'); };
  const update = updateShape(() => Object.defineProperty({}, 'children', { enumerable: true, get: getter }));
  for (let i = 0; i < 5; i++) update();
  expect(reads).toBe(0);
});

it('does not invoke own array index accessors', () => {
  let reads = 0;
  const update = updateShape(() => Object.defineProperty([], '0', { enumerable: true, configurable: true, get() { reads++; throw new Error('array getter invoked'); } }));
  for (let i = 0; i < 5; i++) update();
  expect(reads).toBe(0);
});

it('does not invoke getters when successive records have different keys', () => {
  let reads = 0;
  const update = updateShape(v => Object.defineProperty({}, v % 2 ? 'other' : 'children', { enumerable: true, get() { reads++; return v; } }));
  for (let i = 0; i < 5; i++) update();
  expect(reads).toBe(0);
});

it('keeps ordinary plain-object unstable-output diagnostics enabled', async () => {
  await expectDiagnostic({ code: 'UNSTABLE_MEMO_OUTPUT', message: /\[UNSTABLE_MEMO_OUTPUT\]/, count: 1 }, () => {
    const update = updateShape(() => ({ count: 1, label: 'same' }));
    for (let i = 0; i < 5; i++) update();
  });
});

it('keeps ordinary array unstable-output diagnostics enabled', async () => {
  await expectDiagnostic({ code: 'UNSTABLE_MEMO_OUTPUT', message: /\[UNSTABLE_MEMO_OUTPUT\]/, count: 1 }, () => {
    const update = updateShape(() => [1, 'same']);
    for (let i = 0; i < 5; i++) update();
  });
});

it('does not report unstable output for changing data values', () => {
  const update = updateShape(version => ({ version }));
  for (let i = 0; i < 5; i++) update();
});
