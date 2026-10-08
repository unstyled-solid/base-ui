import { expect, vi } from 'vitest';
import { createRoot } from 'solid-js';
import { browserCase } from '../../test/sourceCase';
import { createRenderer } from '../../test/createRenderer';
import { LifecycleIdFixture } from './createId.fixture';
import { createAnimationFrame } from './createAnimationFrame';
import { createIdleCallback } from './createIdleCallback';

browserCase({ source: 'packages/utils/src/useId.test.tsx', case: 'live IDs retain native focus and selection', environment: 'browser', issue: 'bsolid-lifecycle-browser-replay' }, async () => {
  const { renderProps } = createRenderer();
  const view = await renderProps<{ id: string | undefined }>((props) => <LifecycleIdFixture id={props.id} />, { id: undefined });
  const input = view.container.querySelector('input')!;
  input.value = 'selected text'; input.focus(); input.setSelectionRange(2, 8);
  await view.setProps({ id: 'updated' });
  expect(document.activeElement).toBe(input);
  expect(input.selectionStart).toBe(2); expect(input.selectionEnd).toBe(8);
  expect(view.container.querySelector('input')).toBe(input);
  expect(view.container.querySelector('label')!.htmlFor).toBe('updated');
});

browserCase({ source: 'packages/utils/src/useAnimationFrame.test.ts', case: 'native frame and idle disposal before delivery', environment: 'browser', issue: 'bsolid-lifecycle-browser-replay' }, async () => {
  const stale = vi.fn(); const current = vi.fn();
  const dispose = createRoot((dispose) => {
    const frame = createAnimationFrame(); const idle = createIdleCallback();
    frame.request(stale); frame.request(current); idle.start(stale); idle.clear();
    return dispose;
  });
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  expect(stale).not.toHaveBeenCalled(); expect(current).toHaveBeenCalledOnce();
  dispose();
  const cancelled = createRoot((dispose) => { createAnimationFrame().request(stale); createIdleCallback().start(stale); return dispose; });
  cancelled();
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  expect(stale).not.toHaveBeenCalled();
});
