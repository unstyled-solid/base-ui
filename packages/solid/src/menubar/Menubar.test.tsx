import { describe, expect, it, vi } from 'vitest';
import { createSignal, flush, untrack } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { browserCase, createRenderer, describeConformance, fireEvent, isJSDOM, screen, waitFor } from '../../test';
import type { ConformantComponentProps } from '../../test/describeConformance';
import { DirectionProvider } from '../direction-provider';
import * as Menu from '../menu/index.parts';
import type { MenuRootChangeEventDetails } from '../menu/root/MenuRoot';
import { Menubar, type MenubarProps, type MenubarState } from './Menubar';
import { TestMenubar, type Variant } from './Menubar.fixtures';

const source = 'packages/react/src/menubar/Menubar.test.tsx';
const { render, renderProps } = createRenderer();
const trigger = (name = 'file') => screen.getByTestId(`${name}-trigger`);
const menu = (name = 'file') => screen.queryByTestId(`${name}-menu`);
async function opened(name = 'file') { await screen.findByTestId(`${name}-menu`); }
async function closed(name = 'file') { await waitFor(() => expect(menu(name)).toBeNull()); }
async function focused(id: string) { await waitFor(() => expect(screen.getByTestId(id)).toHaveFocus()); }
function focus(element: HTMLElement) {
  // Explicit focus in these fixtures models keyboard handoff, not a pointer
  // focus inherited from the preceding test/browser interaction.
  element.focus({ focusVisible: true } as FocusOptions);
  flush();
}
async function keyboard(user: { keyboard(text: string): Promise<unknown> }, text: string) {
  // Native focus-visible modality cannot be changed by synthetic key events.
  if (isJSDOM) await user.keyboard(text);
  else await (await import('vitest/browser')).userEvent.keyboard(text);
}
function touchClick(element: HTMLElement) {
  fireEvent(element, new PointerEvent('click', { bubbles: true, cancelable: true, pointerType: 'touch' }));
  flush();
}
function touchDown(element: HTMLElement) {
  fireEvent.pointerDown(element, { pointerType: 'touch' });
  fireEvent.mouseDown(element);
  flush();
}

describe('Menubar', () => {
  describeConformance<MenubarState, MenubarProps & ConformantComponentProps<MenubarState>>((props) => <Menubar {...props} />, {
    initialProps: {}, refInstanceof: HTMLDivElement,
    state: {
      change: { orientation: 'vertical', modal: false },
      assert: (state, changed) => { expect(untrack(() => state.orientation)).toBe(changed ? 'vertical' : 'horizontal'); expect(untrack(() => state.modal)).toBe(!changed); },
      class: (state) => state.orientation, before: 'horizontal', after: 'vertical',
    },
  });

  it('keeps defaults and live host state without replacing the host', async () => {
    const view = await renderProps((props: MenubarProps) => <Menubar {...props} />, {});
    const root = screen.getByRole('menubar');
    expect(root).toHaveAttribute('aria-orientation', 'horizontal');
    expect(root).toHaveAttribute('data-modal');
    expect(root).not.toHaveAttribute('data-has-submenu-open');
    await view.setProps({ orientation: 'vertical', modal: false });
    expect(screen.getByRole('menubar')).toBe(root);
    expect(root).toHaveAttribute('aria-orientation', 'vertical');
    expect(root).toHaveAttribute('data-orientation', 'vertical');
    expect(root).not.toHaveAttribute('data-modal');
  });

  for (const variant of ['contained', 'detached', 'multiple'] as const) {
    describe(variant, () => {
      it('focus alone stays idle; Enter opens', async () => {
        const { user } = await render(() => <TestMenubar variant={variant} />);
        expect(screen.getAllByRole('menuitem')).toHaveLength(3);
        await user.tab();
        expect(trigger()).toHaveFocus();
        expect(menu()).toBeNull();
        await user.keyboard('{Enter}');
        await opened();
      });
      it('Space opens and keyboard navigation enters nested menus and returns', async () => {
        const { user } = await render(() => <TestMenubar variant={variant} />);
        focus(trigger());
        await user.keyboard(' ');
        await focused('file-item-1');
        await user.keyboard('{ArrowDown}');
        await focused('file-item-2');
        await user.keyboard('{ArrowDown}');
        await focused('share-trigger');
        await user.keyboard('{ArrowRight}');
        await focused('share-item-1');
        await user.keyboard('{ArrowLeft}');
        await closed('share');
        await focused('share-trigger');
      });
      it('Home and End move between boundary triggers', async () => {
        const { user } = await render(() => <TestMenubar variant={variant} />);
        focus(trigger());
        await user.keyboard('{End}');
        expect(trigger('view')).toHaveFocus();
        await user.keyboard('{Home}');
        expect(trigger()).toHaveFocus();
      });
      for (const orientation of ['horizontal', 'vertical'] as const) {
        for (const direction of ['ltr', 'rtl'] as const) {
          for (const loopFocus of [false, true]) {
            it(`roves ${orientation}/${direction}/loop=${loopFocus}`, async () => {
              const { user } = await render(() => <DirectionProvider direction={direction}>
                <TestMenubar variant={variant} orientation={orientation} loopFocus={loopFocus} />
              </DirectionProvider>);
              const next = orientation === 'vertical' ? 'ArrowDown' : direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
              const previous = orientation === 'vertical' ? 'ArrowUp' : direction === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
              focus(trigger());
              await user.keyboard(`{${next}}`);
              expect(trigger('edit')).toHaveFocus();
              expect(menu('edit')).toBeNull();
              await user.keyboard(`{${next}}{${next}}`);
              expect(trigger(loopFocus ? 'file' : 'view')).toHaveFocus();
              await user.keyboard('{Home}');
              await user.keyboard(`{${previous}}`);
              expect(trigger(loopFocus ? 'view' : 'file')).toHaveFocus();
            });
          }
          it(`opens on the cross axis ${orientation}/${direction}`, async () => {
            const { user } = await render(() => <DirectionProvider direction={direction}>
              <TestMenubar variant={variant} orientation={orientation} />
            </DirectionProvider>);
            focus(trigger());
            if (orientation === 'vertical') {
              await user.keyboard(direction === 'rtl' ? '{ArrowRight}' : '{ArrowLeft}');
              expect(menu()).toBeNull();
            }
            await user.keyboard(orientation === 'horizontal' ? '{ArrowDown}' : direction === 'rtl' ? '{ArrowLeft}' : '{ArrowRight}');
            await opened();
          });
        }
      }
      it('transfers keyboard-open menus and closes the nested tree', async () => {
        const { user } = await render(() => <TestMenubar variant={variant} />);
        focus(trigger());
        await keyboard(user, '{Enter}');
        await focused('file-item-1');
        await keyboard(user, '{ArrowDown}{ArrowDown}{ArrowRight}');
        await focused('share-item-1');
        await keyboard(user, '{ArrowRight}');
        await opened('edit');
        await closed('share');
        await closed();
        expect(screen.getByRole('menubar')).toHaveAttribute('data-has-submenu-open');
        await keyboard(user, '{ArrowLeft}');
        await opened();
        await closed('edit');
      });
      it('permits keyboard item navigation after mouse opening', async () => {
        const { user } = await render(() => <TestMenubar variant={variant} />);
        await user.click(trigger());
        await opened();
        await user.keyboard('{ArrowDown}');
        await focused('file-item-1');
        await user.keyboard('{ArrowDown}');
        await focused('file-item-2');
      });
      it('permits menu transfer after mouse opening', async () => {
        const { user } = await render(() => <TestMenubar variant={variant} />);
        await user.click(trigger());
        await opened();
        await keyboard(user, '{ArrowRight}');
        await opened('edit');
        await closed();
      });
      it('disables every trigger and removes the tab stop', async () => {
        const { user } = await render(() => <TestMenubar variant={variant} disabled />);
        expect(trigger()).toBeDisabled();
        await user.tab();
        expect(document.body).toHaveFocus();
        await user.click(trigger());
        expect(menu()).toBeNull();
      });
      it('one outside touch closes the entire tree', async () => {
        await render(() => <><TestMenubar variant={variant} /><button data-testid="outside">Outside</button></>);
        touchDown(trigger());
        await opened();
        touchDown(trigger('share'));
        await opened('share');
        touchDown(screen.getByTestId('outside'));
        await closed('share');
        await closed();
      });
      it('gives nested portals a visible-to-accessibility group owner inside their parent menu', async () => {
        const { user } = await render(() => <TestMenubar variant={variant} />);
        await user.click(trigger());
        await opened();
        touchDown(trigger('share'));
        await opened('share');
        const portal = menu('share')!.closest('[data-base-ui-portal]')!;
        expect(portal.id).not.toBe('');
        const owner = menu()!.querySelector(`span[aria-owns="${portal.id}"]`);
        expect(owner).toHaveAttribute('role', 'group');
        expect(owner).not.toHaveAttribute('aria-hidden');
        expect(screen.getByRole('menubar')).toHaveAttribute('data-has-submenu-open');
      });
      registerBrowserCases(variant);
    });
  }

  it('suppresses delayed touch trigger clicks for 300ms after focus handoff', async () => {
    const { user } = await render(() => <TestMenubar />);
    await user.click(trigger());
    await opened();
    vi.useFakeTimers();
    try {
      focus(trigger('edit'));
      expect(menu('edit')).not.toBeNull();
      touchClick(trigger('edit'));
      expect(menu('edit')).not.toBeNull();
      await vi.advanceTimersByTimeAsync(310);
    } finally { vi.useRealTimers(); }
    touchClick(trigger('edit'));
    await closed('edit');
  });
  it('accepts real touch item clicks during the focus handoff cooldown', async () => {
    const { user } = await render(() => <TestMenubar />);
    await user.click(trigger());
    await opened();
    vi.useFakeTimers();
    try {
      focus(trigger('edit'));
      touchClick(screen.getByTestId('edit-item-1'));
      await vi.advanceTimersByTimeAsync(310);
    } finally { vi.useRealTimers(); }
    await closed('edit');
  });
  it('preserves outside focus on triggerless close', async () => {
    const { user } = await render(() => {
      const [open, setOpen] = createSignal(true);
      return <><button data-testid="outside">Outside</button><Menubar>
        <Menu.Root open={open()} onOpenChange={setOpen}>
          <Menu.Portal keepMounted><Menu.Positioner><Menu.Popup data-testid="triggerless-menu"><Menu.Item>Item</Menu.Item></Menu.Popup></Menu.Positioner></Menu.Portal>
        </Menu.Root>
      </Menubar></>;
    });
    await user.click(screen.getByTestId('outside'));
    await waitFor(() => expect(screen.getByTestId('triggerless-menu')).not.toHaveAttribute('data-open'));
    expect(screen.getByTestId('outside')).toHaveFocus();
  });
  it('keeps a disabled-first menubar reachable', async () => {
    const { user } = await render(() => <Menubar>
      <Menu.Root><Menu.Trigger disabled data-testid="first">File</Menu.Trigger></Menu.Root>
      <Menu.Root><Menu.Trigger data-testid="second">Edit</Menu.Trigger></Menu.Root>
    </Menubar>);
    expect(screen.getByTestId('first')).toBeDisabled();
    expect(screen.getByTestId('first')).toHaveAttribute('tabindex', '-1');
    expect(screen.getByTestId('second')).toHaveAttribute('tabindex', '0');
    await user.tab();
    expect(screen.getByTestId('second')).toHaveFocus();
  });
  it('reports closes for both nested roots before handing off to the next menu', async () => {
    const rootChange = vi.fn();
    const childChange = vi.fn();
    const nextChange = vi.fn();
    const { user } = await render(() => <Menubar>
      <Menu.Root onOpenChange={rootChange}>
        <Menu.Trigger data-testid="file-trigger">File</Menu.Trigger>
        <Menu.Portal><Menu.Positioner data-testid="file-menu"><Menu.Popup>
          <Menu.Item data-testid="file-item-1">Open</Menu.Item>
          <Menu.SubmenuRoot onOpenChange={childChange}>
            <Menu.SubmenuTrigger data-testid="share-trigger">Share</Menu.SubmenuTrigger>
            <Menu.Portal><Menu.Positioner data-testid="share-menu"><Menu.Popup>
              <Menu.Item data-testid="share-item-1">Email</Menu.Item>
            </Menu.Popup></Menu.Positioner></Menu.Portal>
          </Menu.SubmenuRoot>
        </Menu.Popup></Menu.Positioner></Menu.Portal>
      </Menu.Root>
      <Menu.Root onOpenChange={nextChange}>
        <Menu.Trigger data-testid="edit-trigger">Edit</Menu.Trigger>
        <Menu.Portal><Menu.Positioner data-testid="edit-menu"><Menu.Popup><Menu.Item>Copy</Menu.Item></Menu.Popup></Menu.Positioner></Menu.Portal>
      </Menu.Root>
    </Menubar>);
    focus(trigger());
    await keyboard(user, '{Enter}');
    await focused('file-item-1');
    await keyboard(user, '{ArrowDown}{ArrowRight}');
    await focused('share-item-1');
    await keyboard(user, '{ArrowRight}');
    await opened('edit');
    await closed('share');
    await closed();
    expect(childChange.mock.lastCall?.[0]).toBe(false);
    expect(rootChange.mock.lastCall?.[0]).toBe(false);
    expect(nextChange.mock.lastCall?.[0]).toBe(true);
    expect(screen.getByRole('menubar')).toHaveAttribute('data-has-submenu-open');
  });
  it('retains open host state when a close request is canceled and uses current callbacks', async () => {
    const initial = vi.fn();
    const current = vi.fn();
    const view = await renderProps((props: { cancel: boolean; changed: boolean }) => <Menubar>
      <Menu.Root onOpenChange={(open: boolean, details: MenuRootChangeEventDetails) => {
        (props.changed ? current : initial)(open, details.reason);
        if (!open && props.cancel) details.cancel();
      }}>
        <Menu.Trigger data-testid="file-trigger">File</Menu.Trigger>
        <Menu.Portal><Menu.Positioner data-testid="file-menu"><Menu.Popup><Menu.Item data-testid="file-item-1">Open</Menu.Item></Menu.Popup></Menu.Positioner></Menu.Portal>
      </Menu.Root>
    </Menubar>, { cancel: true, changed: false });
    await view.user.click(trigger());
    await opened();
    expect(initial).toHaveBeenCalled();
    await view.setProps({ changed: true });
    await view.user.click(screen.getByTestId('file-item-1'));
    expect(current).toHaveBeenLastCalledWith(false, 'item-press');
    expect(menu()).not.toBeNull();
    expect(screen.getByRole('menubar')).toHaveAttribute('data-has-submenu-open');
    await view.setProps({ cancel: false });
    await view.user.click(screen.getByTestId('file-item-1'));
    await closed();
    expect(screen.getByRole('menubar')).not.toHaveAttribute('data-has-submenu-open');
  });
  it('disables items in a controlled-open disabled host', async () => {
    const click = vi.fn();
    const { user } = await render(() => <Menubar disabled><Menu.Root open>
      <Menu.Trigger>File</Menu.Trigger><Menu.Portal><Menu.Positioner><Menu.Popup>
        <Menu.Item data-testid="item" onClick={click}>Open</Menu.Item>
      </Menu.Popup></Menu.Positioner></Menu.Portal>
    </Menu.Root></Menubar>);
    expect(screen.getByTestId('item')).toHaveAttribute('aria-disabled', 'true');
    await user.click(screen.getByTestId('item'));
    expect(click).not.toHaveBeenCalled();
  });
  for (const variant of ['contained', 'detached'] as const) {
    it(`gives ${variant} portals correct accessibility ownership`, async () => {
      const { user } = await render(() => <TestMenubar variant={variant} />);
      await user.click(trigger());
      await opened();
      const portal = menu()!.closest('[data-base-ui-portal]')!;
      expect(portal.id).not.toBe('');
      const owner = document.querySelector(`span[aria-owns="${portal.id}"]`);
      expect(owner).not.toBeNull();
      if (variant === 'contained') {
        expect(screen.getByRole('menubar')).toContainElement(owner as HTMLElement);
        expect(owner).toHaveAttribute('role', 'group');
        expect(owner).not.toHaveAttribute('aria-hidden');
      } else {
        expect(screen.getByRole('menubar')).not.toContainElement(owner as HTMLElement);
        expect(owner).not.toHaveAttribute('role');
      }
    });
  }
});

function registerBrowserCases(variant: Variant) {
  async function renderBrowser(factory: () => JSX.Element) {
    await render(factory);
    const { userEvent } = await import('vitest/browser');
    return { user: userEvent };
  }
  const browser = (name: string, run: () => Promise<void>) => browserCase({ source, case: `${variant}: ${name}`, environment: 'browser', issue: 'bsolid-browser' }, run);
  browser('click toggles the trigger', async () => {
    const { user } = await renderBrowser(() => <TestMenubar variant={variant} />);
    await user.click(trigger()); await opened();
    await user.click(trigger()); await closed();
  });
  browser('idle hover does not open', async () => {
    const { user } = await renderBrowser(() => <TestMenubar variant={variant} />);
    await user.hover(trigger()); expect(menu()).toBeNull();
  });
  browser('hover transfers open menus and preserves host state', async () => {
    const { user } = await renderBrowser(() => <TestMenubar variant={variant} />);
    await user.click(trigger()); await opened();
    expect(screen.getByRole('menubar')).toHaveAttribute('data-has-submenu-open');
    await user.hover(trigger('edit')); await opened('edit'); await closed();
    await user.hover(trigger('view')); await opened('view'); await closed('edit');
  });
  browser('hover opens nested menus and transfers out of a nested item', async () => {
    const { user } = await renderBrowser(() => <TestMenubar variant={variant} />);
    await user.click(trigger()); await opened();
    expect(screen.getByRole('menubar')).toHaveAttribute('data-has-submenu-open');
    await user.hover(trigger('share')); await opened('share');
    await user.hover(screen.getByTestId('share-item-1'));
    await user.hover(trigger('edit')); await opened('edit'); await closed('share'); await closed();
  });
  for (const hoverOpen of [false, true]) browser(`nested closeOnClick after ${hoverOpen ? 'hover' : 'click'}`, async () => {
    const { user } = await renderBrowser(() => <TestMenubar variant={variant} />);
    if (hoverOpen) { await user.click(trigger()); await opened(); await user.hover(trigger('view')); }
    else await user.click(trigger('view'));
    await opened('view');
    await user.hover(trigger('layout')); await opened('layout');
    await user.click(screen.getByTestId('layout-item-2'));
    expect(menu('layout')).not.toBeNull();
  });
  browser('Escape closes keyboard-open menu', async () => {
    const { user } = await renderBrowser(() => <TestMenubar variant={variant} />);
    focus(trigger()); await user.keyboard('{Enter}'); await opened();
    await user.keyboard('{Escape}'); await closed();
  });
  browser('hover reopens after click-close and a fresh handoff (#2222)', async () => {
    const { user } = await renderBrowser(() => <TestMenubar variant={variant} />);
    await user.click(trigger()); await opened();
    expect(screen.getByRole('menubar')).toHaveAttribute('data-has-submenu-open');
    await user.hover(trigger('edit')); await opened('edit');
    await user.click(trigger('edit')); await closed('edit');
    expect(screen.getByRole('menubar')).not.toHaveAttribute('data-has-submenu-open');
    await user.click(trigger()); await opened();
    expect(screen.getByRole('menubar')).toHaveAttribute('data-has-submenu-open');
    await user.hover(trigger('edit')); await opened('edit');
  });
}
