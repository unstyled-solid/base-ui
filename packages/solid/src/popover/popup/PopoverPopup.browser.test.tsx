import { afterEach, beforeEach, expect } from 'vitest';
import { createSignal } from 'solid-js';
import { browserCase, createRenderer, screen, waitFor, firePointer, fireEvent, waitSingleFrame } from '../../../test';
import { Popover } from '../index';

const { render } = createRenderer();
const animationEnvironment = globalThis as typeof globalThis & { BASE_UI_ANIMATIONS_DISABLED?: boolean };
let previousAnimationsDisabled: boolean | undefined;
beforeEach(() => { previousAnimationsDisabled = animationEnvironment.BASE_UI_ANIMATIONS_DISABLED; animationEnvironment.BASE_UI_ANIMATIONS_DISABLED = false; });
afterEach(() => { animationEnvironment.BASE_UI_ANIMATIONS_DISABLED = previousAnimationsDisabled; });
browserCase({ source: 'packages/react/src/popover/popup/PopoverPopup.test.tsx', case: 'display:none focused child restores focus to popup', environment: 'browser', issue: 'bsolid-browser' }, async () => {
  const view = await render(() => {
    const [hidden, setHidden] = createSignal(false);
    return <Popover.Root open><Popover.Trigger>Toggle</Popover.Trigger><Popover.Portal><Popover.Positioner><Popover.Popup data-testid="popup">
      <button style={{ display: hidden() ? 'none' : undefined }} onClick={() => setHidden(true)}>Hide</button><input />
    </Popover.Popup></Popover.Positioner></Popover.Portal></Popover.Root>;
  });
  await waitFor(() => expect(screen.getByRole('button', { name: 'Hide' })).toHaveFocus());
  await view.user.click(screen.getByRole('button', { name: 'Hide' }));
  await waitFor(() => expect(screen.getByTestId('popup')).toHaveFocus());
});

for (const width of ['240px', 'calc(100vw - 10px)']) {
  browserCase({ source: 'packages/react/src/popover/root/PopoverRoot.test.tsx', case: `touch scroll lock width=${width}`, environment: 'browser', issue: 'bsolid-browser' }, async () => {
    await render(() => <Popover.Root modal><Popover.Trigger>Toggle</Popover.Trigger><Popover.Portal><Popover.Positioner style={{ width }}>
      <Popover.Popup>Content</Popover.Popup>
    </Popover.Positioner></Popover.Portal></Popover.Root>);
    const trigger = screen.getByRole('button');
    firePointer.down(trigger, { timeStamp: 100, pointerType: 'touch' });
    fireEvent.mouseDown(trigger); fireEvent.click(trigger, { detail: 1 });
    const popup = await screen.findByRole('dialog');
    await waitSingleFrame();
    const document = popup.ownerDocument;
    const locked = () => document.documentElement.style.overflow === 'hidden' || document.documentElement.hasAttribute('data-base-ui-scroll-locked') || document.body.style.overflow === 'hidden';
    if (width === '240px') expect(locked()).toBe(false);
    else await waitFor(() => expect(locked()).toBe(true));
  });
}

for (const preceding of [false, true]) {
  browserCase({ source: 'packages/react/src/popover/root/PopoverRoot.test.tsx', case: `nonmodal reverse/forward tab bridge popup precedes trigger=${preceding}`, environment: 'browser', issue: 'bsolid-browser' }, async () => {
    function Popup() {
      return <Popover.Portal><Popover.Positioner><Popover.Popup><input aria-label="Inside" /></Popover.Popup></Popover.Positioner></Popover.Portal>;
    }
    const view = await render(() => <><input aria-label="Before" /><Popover.Root defaultOpen>
      {preceding && <Popup />}<Popover.Trigger>Toggle</Popover.Trigger><input aria-label="After" />{!preceding && <Popup />}
    </Popover.Root></>);
    await waitFor(() => expect(screen.getByRole('textbox', { name: 'Inside' })).toHaveFocus());
    await view.user.tab({ shift: true });
    await waitFor(() => expect(screen.getByRole('button', { name: 'Toggle' })).toHaveFocus());
    expect(screen.getByRole('dialog')).toBeVisible();
    await view.user.tab();
    await waitFor(() => expect(screen.getByRole('textbox', { name: 'Inside' })).toHaveFocus());
    await view.user.tab();
    await waitFor(() => expect(screen.getByRole('textbox', { name: 'After' })).toHaveFocus());
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });
}
