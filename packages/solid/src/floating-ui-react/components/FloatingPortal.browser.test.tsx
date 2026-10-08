import { expect, vi } from 'vitest';
import { createSignal } from 'solid-js';
import { getDelegatedRoot } from '@solidjs/web';
import { browserCase, createRenderer, waitFor } from '../../../test';
import { createRenderElement } from '../../internals/createRenderElement';
import { FloatingPortal } from './FloatingPortal';
import { Popover } from '../../popover';
import { platform } from '../../utils/platform';

browserCase({ source: 'packages/react/src/floating-ui-react/components/FloatingPortal.test.tsx', case: 'aria-owns helper uses the minimal fixed owner style independently of focus guards', environment: 'browser', issue: 'bsolid-portal' }, async () => {
  const view = await createRenderer().render(() => <Popover.Root defaultOpen>
    <Popover.Trigger>Owner trigger</Popover.Trigger>
    <Popover.Portal id="owner-style-portal"><Popover.Positioner><Popover.Popup><input aria-label="Owner popup" /></Popover.Popup></Popover.Positioner></Popover.Portal>
  </Popover.Root>);
  await waitFor(() => expect(view.getByRole('textbox')).toHaveFocus());
  const owner = document.querySelector<HTMLElement>('span[aria-owns="owner-style-portal"]')!;
  expect(owner).not.toBeNull();
  expect(owner.style.cssText).toBe('clip-path: inset(50%); position: fixed; top: 0px; left: 0px;');
  const guard = owner.previousElementSibling as HTMLElement;
  expect(guard).toHaveAttribute('data-type', 'outside');
  expect(guard.style.width).toBe('1px');
  expect(guard.style.height).toBe('1px');
  expect(guard.style.overflow).toBe('hidden');
});

browserCase({ source: 'packages/react/src/floating-ui-react/components/FloatingPortal.test.tsx', case: 'native portal events and keyboard focus retain independent logical render roots', environment: 'browser', issue: 'bsolid-qqii' }, async () => {
  const { userEvent } = await import('vitest/browser');
  const clickedOne = vi.fn(), clickedTwo = vi.fn(), bubbledOne = vi.fn(), bubbledTwo = vi.fn();
  const focusedOne = vi.fn(), focusedTwo = vi.fn();
  const one = await createRenderer().render(() => <div onClick={bubbledOne} onFocusIn={focusedOne}>
    <FloatingPortal><button onClick={clickedOne}>First root portal</button></FloatingPortal>
  </div>);
  const two = await createRenderer().render(() => <div onClick={bubbledTwo} onFocusIn={focusedTwo}>
    <FloatingPortal><button onClick={clickedTwo}>Second root portal</button></FloatingPortal>
  </div>);
  const first = one.getByRole('button', { name: 'First root portal' });
  const second = two.getByRole('button', { name: 'Second root portal' });
  expect(getDelegatedRoot(first)).toBe(one.container);
  expect(getDelegatedRoot(second)).toBe(two.container);
  await userEvent.click(first);
  // WebKit does not focus native buttons on mouse click. Establish native
  // focus explicitly there; the following Tab still exercises keyboard order.
  if (platform.engine.webkit) first.focus();
  expect(first).toHaveFocus();
  expect(clickedOne).toHaveBeenCalledOnce(); expect(bubbledOne).toHaveBeenCalledOnce();
  expect(focusedOne).toHaveBeenCalledOnce();
  expect(clickedOne.mock.calls[0]![0].isTrusted).toBe(true);
  expect(clickedTwo).not.toHaveBeenCalled(); expect(bubbledTwo).not.toHaveBeenCalled(); expect(focusedTwo).not.toHaveBeenCalled();
  await userEvent.keyboard('{Tab}');
  expect(second).toHaveFocus(); expect(focusedTwo).toHaveBeenCalledOnce();
  await userEvent.keyboard('{Enter}');
  expect(clickedTwo).toHaveBeenCalledOnce(); expect(bubbledTwo).toHaveBeenCalledOnce();
  one.unmount();
  first.click(); expect(clickedOne).toHaveBeenCalledOnce(); expect(bubbledOne).toHaveBeenCalledOnce();
  await userEvent.click(second);
  expect(clickedTwo).toHaveBeenCalledTimes(2); expect(bubbledTwo).toHaveBeenCalledTimes(2);
  expect(getDelegatedRoot(second)).toBe(two.container);
  two.unmount(); expect(second.isConnected).toBe(false);
});

for (const preceding of [false, true]) {
  browserCase({ source: 'packages/react/src/popover/root/PopoverRoot.test.tsx', case: `native reverse/forward portal Tab bridge, popup precedes trigger=${preceding}`, environment: 'browser', issue: 'bsolid-qqii' }, async () => {
    const { userEvent } = await import('vitest/browser');
    function Popup() { return <Popover.Portal><Popover.Positioner><Popover.Popup><input aria-label="Inside" /></Popover.Popup></Popover.Positioner></Popover.Portal>; }
    const view = await createRenderer().render(() => <><input aria-label="Before" /><Popover.Root defaultOpen>
      {preceding && <Popup />}<Popover.Trigger>Toggle</Popover.Trigger><input aria-label="After" />{!preceding && <Popup />}
    </Popover.Root></>);
    await waitFor(() => expect(view.getByRole('textbox', { name: 'Inside' })).toHaveFocus());
    await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
    await waitFor(() => expect(view.getByRole('button', { name: 'Toggle' })).toHaveFocus());
    expect(view.getByRole('dialog')).toBeVisible();
    await userEvent.keyboard('{Tab}');
    await waitFor(() => expect(view.getByRole('textbox', { name: 'Inside' })).toHaveFocus());
    await userEvent.keyboard('{Tab}');
    await waitFor(() => expect(view.getByRole('textbox', { name: 'After' })).toHaveFocus());
    await waitFor(() => expect(view.queryByRole('dialog')).toBeNull());
  });
}

browserCase({ source: 'packages/react/src/toast/viewport/ToastViewport.tsx', case: 'focused native portal host stays stationary when its sibling slots change', environment: 'browser', issue: 'bsolid-qqii' }, async () => {
  const { userEvent } = await import('vitest/browser');
  function Content() {
    const [active, setActive] = createSignal(false);
    const host = createRenderElement('input', {}, { props: {
      'aria-label': 'Retained portal input',
      onKeyDown(event: KeyboardEvent) { if (event.key === 'Enter') setActive(value => !value); },
    } });
    return <>{active() && <button>Leading guard</button>}{host}{!active() && <aside>Trailing announcement</aside>}</>;
  }
  const view = await createRenderer().render(() => <FloatingPortal><Content /></FloatingPortal>);
  const input = view.getByRole('textbox', { name: 'Retained portal input' });
  await userEvent.click(input); expect(input).toHaveFocus();
  const records: MutationRecord[] = [];
  const observer = new MutationObserver(batch => { records.push(...batch); });
  observer.observe(input.parentNode!, { childList: true });
  try {
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(view.getByRole('button', { name: 'Leading guard' })).toBeInTheDocument());
    expect(view.queryByText('Trailing announcement')).toBeNull();
    expect(view.getByRole('textbox')).toBe(input); expect(input).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(view.queryByRole('button', { name: 'Leading guard' })).toBeNull());
    expect(view.getByText('Trailing announcement')).toBeInTheDocument();
    expect(view.getByRole('textbox')).toBe(input); expect(input).toHaveFocus();
    records.push(...observer.takeRecords());
    expect(records.some(record => [...record.removedNodes].includes(input))).toBe(false);
  } finally { observer.disconnect(); view.unmount(); }
});
