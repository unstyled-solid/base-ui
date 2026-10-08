import { afterEach, beforeEach, expect, vi } from 'vitest';
import { createSignal } from 'solid-js';
import { createRenderer, browserCase, waitFor } from '../../test';
import { createRenderElement } from '../internals/createRenderElement';
import { createPopupAutoResize } from './createPopupAutoResize';

const environment = globalThis as typeof globalThis & { BASE_UI_ANIMATIONS_DISABLED?: boolean };
let previous: boolean | undefined;
beforeEach(() => { previous = environment.BASE_UI_ANIMATIONS_DISABLED; environment.BASE_UI_ANIMATIONS_DISABLED = false; });
afterEach(() => { environment.BASE_UI_ANIMATIONS_DISABLED = previous; });

browserCase({ source: 'packages/react/src/utils/usePopupAutoResize.ts', case: 'stable layout inputs preserve the running resize and release fixed size', environment: 'browser', issue: 'bsolid-review-foundations' }, async () => {
  const measured = vi.fn();
  const view = await createRenderer().renderProps((props: { width: number; revision: number }) => {
    const [popup, setPopup] = createSignal<HTMLElement | null>(null, { ownedWrite: true });
    const [positioner, setPositioner] = createSignal<HTMLElement | null>(null, { ownedWrite: true });
    createPopupAutoResize({ get popupElement() { return popup(); }, get positionerElement() { return positioner(); }, mounted: true,
      get content() { return props.width; }, get side() { props.revision; return 'bottom' as const; }, direction: 'ltr', onMeasureLayout: measured });
    const content = createRenderElement('div', {}, { ref: setPopup, props: { 'data-testid': 'resizing-popup',
      style: { width: 'var(--popup-width)', height: 'var(--popup-height)', transition: 'width 10s linear' },
      get children() { return <div style={{ width: `${props.width}px`, height: '40px' }}>Resize content</div>; },
    } });
    return createRenderElement('div', {}, { ref: setPositioner, props: {
      style: { width: 'var(--positioner-width)', height: 'var(--positioner-height)' }, children: content,
    } });
  }, { width: 200, revision: 0 });
  const popup = view.getByTestId('resizing-popup');
  await waitFor(() => expect(popup.style.getPropertyValue('--popup-width')).toBe('auto'));
  await view.setProps({ width: 300 });
  await waitFor(() => expect(popup.getAnimations().length).toBeGreaterThan(0));
  const count = measured.mock.calls.length;
  const animation = popup.getAnimations()[0]!;
  await view.setProps({ revision: 1 });
  expect(measured).toHaveBeenCalledTimes(count);
  expect(popup.getAnimations()).toContain(animation);
  popup.getAnimations().forEach(entry => entry.finish());
  await waitFor(() => expect(popup.style.getPropertyValue('--popup-width')).toBe('auto'));
  expect(popup.getBoundingClientRect().width).toBe(300);
  view.unmount();
});
