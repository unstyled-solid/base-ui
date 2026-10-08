import { describe, expect } from 'vitest';
import { userEvent as nativeUser } from 'vitest/browser';
import { createSignal, Show } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { browserCase, createRenderer, fireEvent, firePointer, screen, waitFor } from '#test-utils';
import { NavigationMenu } from './index';
import { Dialog } from '../dialog';
import { Popover } from '../popover';
import { FloatingPortal } from '../floating-ui-react/components/FloatingPortal';
import { FloatingPortalLite } from '../utils/FloatingPortalLite';

const source = 'packages/react/src/navigation-menu/root/NavigationMenuRoot.test.tsx';
const issue = 'bsolid-navigation-menu-replay';
const { render } = createRenderer();
function Navigation(props: { children: JSX.Element }) {
  return <NavigationMenu.Root><NavigationMenu.List><NavigationMenu.Item value="a">
    <NavigationMenu.Trigger>Navigation</NavigationMenu.Trigger><NavigationMenu.Content data-testid="navigation-content">{props.children}</NavigationMenu.Content>
  </NavigationMenu.Item></NavigationMenu.List><NavigationMenu.Portal><NavigationMenu.Positioner><NavigationMenu.Popup><NavigationMenu.Viewport /></NavigationMenu.Popup></NavigationMenu.Positioner></NavigationMenu.Portal></NavigationMenu.Root>;
}
function NestedDialog() {
  return <Dialog.Root><Dialog.Trigger>Open dialog</Dialog.Trigger><Dialog.Portal><Dialog.Popup data-testid="nested-popup" style={{ position: 'fixed', top: '150px', left: '150px', 'z-index': 1, background: 'white', padding: '20px' }} onClick={(event) => event.stopPropagation()}><button>Nested action</button></Dialog.Popup></Dialog.Portal></Dialog.Root>;
}
function NestedPopover() {
  return <Popover.Root><Popover.Trigger>Open popover</Popover.Trigger><Popover.Portal><Popover.Positioner><Popover.Popup data-testid="nested-popup" onClick={(event) => event.stopPropagation()}><button>Nested action</button></Popover.Popup></Popover.Positioner></Popover.Portal></Popover.Root>;
}

describe('NavigationMenu real nested overlays source replay', () => {
  for (const [name, BranchPortal] of [['body portal', FloatingPortal], ['default minimal portal', FloatingPortalLite]] as const) {
    browserCase({ source, case: `nested popup logical containment through a ${name} without a floating tree node`, environment: 'browser', issue }, async () => {
      const view = await render(() => {
        const [open, setOpen] = createSignal(false);
        return <><Navigation><button onClick={() => setOpen(true)}>Open logical branch</button><Show when={open()}>
          <BranchPortal container={name === 'body portal' ? document.body : undefined} style={{ position: 'fixed', top: '150px', left: '150px', 'z-index': 1 }}>
            <button onClick={(event) => event.stopPropagation()}>Branch action</button>
          </BranchPortal>
        </Show></Navigation><button>Outside action</button></>;
      });
      await nativeUser.click(screen.getByText('Navigation'));
      const content = await screen.findByTestId('navigation-content');
      await nativeUser.click(screen.getByText('Open logical branch'));
      const branch = screen.getByText('Branch action').parentElement!;
      expect(branch.parentElement).toBe(document.body);
      await nativeUser.click(screen.getByText('Branch action'));
      expect(screen.getByTestId('navigation-content')).toBe(content);
      expect(content).toBeVisible();
      expect(screen.getByText('Navigation')).toHaveAttribute('aria-expanded', 'true');
      await nativeUser.click(screen.getByText('Outside action'));
      await waitFor(() => expect(screen.queryByTestId('navigation-content')).toBeNull());
      expect(branch.isConnected).toBe(false);
      view.unmount();
    });
  }
  for (const [name, Nested] of [['dialog', NestedDialog], ['popover', NestedPopover]] as const) {
    browserCase({ source, case: `keeps the menu open when interacting with a nested ${name}`, environment: 'browser', issue }, async () => {
      const view = await render(() => <Navigation><Nested /></Navigation>);
      await nativeUser.click(screen.getByText('Navigation'));
      const content = await screen.findByTestId('navigation-content');
      await nativeUser.click(screen.getByText(`Open ${name}`));
      expect(await screen.findByTestId('nested-popup')).toBeVisible();
      await nativeUser.click(screen.getByText('Nested action'));
      expect(screen.getByTestId('navigation-content')).toBe(content);
      expect(content).toBeVisible();
      expect(screen.getByText('Navigation')).toHaveAttribute('aria-expanded', 'true');
    });
  }
  browserCase({ source, case: 'keeps a hover-open menu open when pointerdown happens on a nested dialog trigger', environment: 'browser', issue }, async () => {
    const view = await render(() => <Navigation><NestedDialog /></Navigation>);
    await nativeUser.hover(screen.getByText('Navigation'));
    const content = await screen.findByTestId('navigation-content');
    const trigger = screen.getByText('Open dialog');
    firePointer.down(trigger, { pointerType: 'mouse', timeStamp: 100 });
    fireEvent.mouseLeave(content);
    await nativeUser.click(trigger);
    expect(await screen.findByTestId('nested-popup')).toBeVisible();
    await waitFor(() => expect(screen.getByTestId('navigation-content')).toBeVisible());
    expect(screen.getByText('Navigation')).toHaveAttribute('aria-expanded', 'true');
  });
});
