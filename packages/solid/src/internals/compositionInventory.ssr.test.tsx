import { expect, it } from 'vitest';
import { renderToString } from '@solidjs/web';
import { compositionCases, resolvePart } from '../../../../test/harness/CompositionInventoryFixture';
import { createUniqueId } from 'solid-js';
import { tracePropReads, runtimeAllocationDivergence, captureAllocations } from '../../../../test/harness/allocationTrace';

it('allocation probe rejects a getter that reserves a real owner slot', () => {
  expect(() => renderToString(() => {
    tracePropReads(() => { createUniqueId(); });
    return '';
  })).toThrow('Impure prop read allocated an owner slot');
});

it('reports the first inserted allocation with stacks and restores nested capture', () => {
  const previous = globalThis.__baseUIAllocationTrace;
  const outer = captureAllocations();
  const inner = captureAllocations();
  try {
    globalThis.__baseUIAllocationTrace?.({ owner: 'root', next: 0, stack: 'inserted getter' });
    inner.stop();
    globalThis.__baseUIAllocationTrace?.({ owner: 'root', next: 1, stack: 'original allocation' });
    expect(inner.points).toHaveLength(1);
    expect(outer.points).toHaveLength(1);
    expect(runtimeAllocationDivergence(outer.points, inner.points)).toContain('First allocation divergence at 0');
    expect(runtimeAllocationDivergence(outer.points, inner.points)).toContain('inserted getter');
    expect(runtimeAllocationDivergence(outer.points, outer.points)).toBeNull();
    expect(runtimeAllocationDivergence([], inner.points)).toContain('First allocation divergence at 0');
  } finally { outer.stop(); }
  expect(globalThis.__baseUIAllocationTrace).toBe(previous);
});

for (const part of compositionCases) {
  it(`${part.id} public aliases and deterministic component host SSR`, () => {
    for (const name of part.exports) expect(resolvePart(name)).toBe(resolvePart(part.id));
    const render = () => renderToString(() => <part.Fixture />, { renderId: 'inventory-' });
    const first = render();
    expect(render()).toBe(first);
    expect(renderToString(() => <part.Fixture reads={5} />, { renderId: 'inventory-' })).toBe(first);
    if (!part.clientMounted) {
      expect(first).toContain(`data-inventory-host="${part.id}"`);
    }
  });
}
