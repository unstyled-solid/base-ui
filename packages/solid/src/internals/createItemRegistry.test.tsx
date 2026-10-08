import { expect, it } from 'vitest';
import { flush, untrack } from 'solid-js';
import { createRenderer } from '../../test';
import { createItemRegistry } from './createItemRegistry';

it('createItemRegistry publishes immutable snapshots and ignores stale replacement cleanup', async () => {
  let registry!: ReturnType<typeof createItemRegistry<string, number>>;
  const view = await createRenderer().render(() => {
    registry = createItemRegistry<string, number>();
    return <output>{[...registry.items.values()].join(',')}</output>;
  });
  const first = registry.registerItem('a', 1);
  registry.registerItem('b', 2);
  expect([...registry.liveItems.values()]).toEqual([1, 2]);
  expect(untrack(() => registry.items.size)).toBe(0);
  flush();
  const previous = untrack(() => registry.items);
  const replacement = registry.registerItem('a', 3);
  first();
  flush();
  expect(view.getByRole('status')).toHaveTextContent('3,2');
  expect([...previous.values()]).toEqual([1, 2]);
  replacement();
  replacement();
  flush();
  expect(view.getByRole('status')).toHaveTextContent('2');
});
