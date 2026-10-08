import { expect, it, vi } from 'vitest';
import { createSignal } from 'solid-js';
import { createRenderer } from '../../../test';
import { FloatingPortal } from './FloatingPortal';
import { DirectionProvider } from '../../direction-provider';
import { useDirection } from '../../internals/direction-context';
import { createButton } from '../../internals/use-button/useButton';
import { createRenderElement } from '../../internals/createRenderElement';
import { createPopup } from '../../utils/popups/createPopup';
import { createChangeEventDetails } from '../../internals/createBaseUIEventDetails';

it('FloatingPortal preserves context through null waiting and real ShadowRoot mounts', async () => {
  const host = document.createElement('div'); document.body.append(host);
  const shadow = host.attachShadow({ mode: 'open' });
  function Probe() { const direction = useDirection(); return <output>{direction()}</output>; }
  const view = await createRenderer().renderProps<{ container: ShadowRoot | null }>((props) =>
    <DirectionProvider direction="rtl"><FloatingPortal container={props.container}><Probe /></FloatingPortal></DirectionProvider>, { container: null });
  expect(shadow.textContent).toBe('');
  await view.setProps({ container: shadow });
  expect(shadow.textContent).toBe('rtl');
  expect(shadow.querySelector('[data-base-ui-shadow-portal]')).toBeInstanceOf(HTMLElement);
  view.unmount();
  expect(shadow.childElementCount).toBe(0);
  host.remove();
});

it('FloatingPortal routes initially mounted delegated events to only its owning root and releases its lease', async () => {
  const first = vi.fn(), second = vi.fn();
  const one = await createRenderer().render(() => <FloatingPortal><button onClick={first}>First</button></FloatingPortal>);
  const two = await createRenderer().render(() => <FloatingPortal><button onClick={second}>Second</button></FloatingPortal>);
  const a = one.getByRole('button', { name: 'First' }), b = two.getByRole('button', { name: 'Second' });
  await one.user.click(a); expect(first).toHaveBeenCalledOnce(); expect(second).not.toHaveBeenCalled();
  await two.user.click(b); expect(second).toHaveBeenCalledOnce();
  one.unmount(); a.click(); expect(first).toHaveBeenCalledOnce();
  await two.user.click(b); expect(second).toHaveBeenCalledTimes(2);
});

it('FloatingPortal unresolved accessor falls back while literal null waits', async () => {
  const view = await createRenderer().render(() => <FloatingPortal container={() => null}><output>fallback</output></FloatingPortal>);
  expect(document.body.textContent).toContain('fallback');
  view.unmount();
  expect(document.querySelector('[data-base-ui-portal]')).toBeNull();
});

it('initial portal button getter pipelines retain an internal click under explicit undefined', async () => {
  const change = vi.fn();
  const view = await createRenderer().render(() => {
    const popup = createPopup({ defaultOpen: true, onOpenChange: () => change });
    function Close() {
      const button = createButton();
      return createRenderElement<{}, HTMLElement>('button', {}, { ref: button.buttonRef, props: [
        { onClick(event: MouseEvent) { popup.setOpen(false, createChangeEventDetails('close-press', event)); }, children: 'Close pipeline' },
        { onClick: undefined }, button.getButtonProps,
      ] });
    }
    return <FloatingPortal><Close /><output>{String(popup.state.open)}</output></FloatingPortal>;
  });
  await view.user.click(view.getByRole('button', { name: 'Close pipeline' }));
  expect(change).toHaveBeenCalledOnce(); expect(view.getByRole('status')).toHaveTextContent('false');
});

it('portal content projection waits for literal null and disposes the logical child owner on removal', async () => {
  let mounts = 0;
  function Child() { mounts++; return <output>Owned child</output>; }
  const view = await createRenderer().renderProps<{ container: HTMLElement | null }>((props) => <FloatingPortal container={props.container}><Child /></FloatingPortal>, { container: null });
  expect(mounts).toBe(0);
  await view.setProps({ container: document.body }); expect(mounts).toBe(1);
  expect(view.getByRole('status')).toHaveTextContent('Owned child');
  await view.setProps({ container: null }); expect(view.queryByRole('status')).toBeNull();
  await view.setProps({ container: document.body }); expect(mounts).toBe(2);
});

it('portal container replacement keeps owned context and native events current', async () => {
  const container = document.createElement('div'); document.body.append(container);
  function Counter() {
    const direction = useDirection(), [count, setCount] = createSignal(0);
    return <button onClick={() => setCount((value) => value + 1)}>{direction()}:{count()}</button>;
  }
  const view = await createRenderer().renderProps<{ container: HTMLElement; direction: 'ltr' | 'rtl' }>((props) =>
    <DirectionProvider direction={props.direction}><FloatingPortal container={props.container}><Counter /></FloatingPortal></DirectionProvider>, { container: document.body, direction: 'ltr' });
  try {
    await view.user.click(view.getByRole('button')); expect(view.getByRole('button')).toHaveTextContent('ltr:1');
    await view.setProps({ container, direction: 'rtl' });
    expect(container.querySelector('button')).toBe(view.getByRole('button'));
    await view.user.click(view.getByRole('button')); expect(view.getByRole('button')).toHaveTextContent('rtl:2');
  } finally { view.unmount(); container.remove(); }
});
