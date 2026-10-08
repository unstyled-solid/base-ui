import { expect, it, vi } from 'vitest';
import { addEventListener } from './addEventListener';
import { mergeCleanups } from './mergeCleanups';
it('preserves exact listener, options and removal arguments (source)', () => {
  const target = { addEventListener: vi.fn(), removeEventListener: vi.fn() };
  const listener = vi.fn();
  const options = { capture: true, passive: false };
  const unsubscribe = addEventListener(target, 'click', listener, options);
  expect(target.addEventListener).toHaveBeenCalledWith('click', listener, options);
  unsubscribe();
  expect(target.removeEventListener).toHaveBeenCalledWith('click', listener, options);
});
it('supports native receiver, handleEvent, capture, once and abort signals', () => {
  const node = document.createElement('button');
  const controller = new AbortController();
  const calls: unknown[] = [];
  const remove = addEventListener(node, 'click', function (event) { calls.push(this, event.type); }, { capture: true, signal: controller.signal });
  const object = { handleEvent: vi.fn() };
  const removeObject = addEventListener(node, 'click', object, { once: true });
  node.click();
  node.click();
  expect(calls).toEqual([node, 'click', node, 'click']);
  expect(object.handleEvent).toHaveBeenCalledTimes(1);
  controller.abort();
  node.click();
  expect(calls).toHaveLength(4);
  mergeCleanups(false, remove, null, undefined, removeObject)();
});
it('composes cleanup in input order and keeps source repeated-call semantics', () => {
  const calls: number[] = [];
  const dispose = mergeCleanups(() => { calls.push(1); }, false, () => { calls.push(2); });
  dispose(); dispose();
  expect(calls).toEqual([1, 2, 1, 2]);
});
