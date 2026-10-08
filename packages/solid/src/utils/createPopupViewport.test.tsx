import { expect, it, vi } from 'vitest';
import { onSettled } from 'solid-js';
import { createRenderer, advanceFrame, advanceTimers } from '../../test';
import { createPopup } from './popups/createPopup';
import { createPopupViewport } from './createPopupViewport';
it('createPopupViewport retains a visual DOM clone while replacing trigger-owned current content', async () => {
  vi.useFakeTimers();
  const a = document.createElement('button'), b = document.createElement('button'); a.id = 'a'; b.id = 'b';
  document.body.append(a, b);
  const view = await createRenderer().renderProps((props: { id: string }) => {
    const store = createPopup({ open: () => true, triggerId: () => props.id });
    onSettled(() => {
      const removeA = store.registerTrigger('a', a, 'A'), removeB = store.registerTrigger('b', b, 'B');
      return () => { removeA(); removeB(); };
    });
    const viewport = createPopupViewport({ store, side: 'bottom', children: () => <span>Content-{props.id}</span> });
    return <div ref={store.setPopupElement}>{viewport.children}</div>;
  }, { id: 'a' });
  const first = view.container.querySelector('[data-current]');
  await view.setProps({ id: 'b' });
  expect(view.container.querySelector('[data-current]')).not.toBe(first);
  expect(view.container.querySelector('[data-current]')).toHaveTextContent('Content-b');
  expect(view.container.querySelector('[data-previous]')).toHaveTextContent('Content-a');
  expect(view.container.querySelector('[data-previous]')).toHaveAttribute('inert');
  await advanceFrame();
  await advanceTimers(0);
  expect(view.container.querySelector('[data-previous]')).toBeNull();
  view.unmount();
  await advanceTimers(0);
  a.remove(); b.remove();
});
