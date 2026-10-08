import { describe, expect, it, vi } from 'vitest';
import { flush } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { createRenderer, fireEvent, firePointer, screen, waitFor } from '../../../test';
import { ContextMenu } from '../index';
import { ContextMenuFixture } from '../ContextMenu.test-fixture';

vi.mock('../../utils/platform', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../utils/platform')>();
  return { ...actual, platform: { ...actual.platform, os: { ...actual.platform.os, mac: true, apple: true } } };
});

// Source: ContextMenuRoot.test.tsx; navigation/selection implementations are borrowed Menu parts.
describe('ContextMenu.Root (Mac)', () => {
  const { render } = createRenderer();
  for (const alignOffset of [0, -5]) {
    it(`ignores spawn-point mouseup with alignOffset=${alignOffset}`, async () => {
      const changed = vi.fn();
      await render(() => <ContextMenuFixture root={{ onOpenChange: changed }} positioner={{ alignOffset }} />);
      fireEvent.contextMenu(screen.getByTestId('trigger'), { clientX: 18, clientY: 18, button: 2 });
      flush();
      fireEvent.mouseUp(screen.getByTestId('item'), { clientX: 18, clientY: 18, button: 2 });
      flush();
      expect(screen.getByTestId('popup')).toBeInTheDocument();
      expect(changed).toHaveBeenCalledTimes(1);
    });
  }
  it('allows mouseup after leaving the initial cursor point', async () => {
    const changed = vi.fn();
    await render(() => <ContextMenuFixture root={{ onOpenChange: changed }} positioner={{ alignOffset: 0 }} />);
    fireEvent.contextMenu(screen.getByTestId('trigger'), { clientX: 20, clientY: 20, button: 2 });
    flush();
    firePointer.move(document.body, { clientX: 24, clientY: 24, pointerType: 'mouse', timeStamp: 100 });
    fireEvent.mouseUp(screen.getByTestId('item'), { clientX: 24, clientY: 24, button: 2 });
    flush();
    await waitFor(() => expect(screen.queryByTestId('popup')).toBeNull());
    expect(changed).toHaveBeenLastCalledWith(false, expect.objectContaining({ reason: 'item-press' }));
  });
  it('closes nested submenus with item-press when releasing over a deep item', async () => {
    const rootChanged = vi.fn();
    const submenuChanged = vi.fn();
    const view = await render(() => <ContextMenuFixture root={{ onOpenChange: rootChanged }}>
      <ContextMenu.SubmenuRoot defaultOpen onOpenChange={submenuChanged}>
        <ContextMenu.SubmenuTrigger delay={1} data-testid="submenu-trigger">More</ContextMenu.SubmenuTrigger>
        <ContextMenu.Portal><ContextMenu.Positioner><ContextMenu.Popup data-testid="submenu">
          <ContextMenu.Item data-testid="deep-item">Deep action</ContextMenu.Item>
        </ContextMenu.Popup></ContextMenu.Positioner></ContextMenu.Portal>
      </ContextMenu.SubmenuRoot>
    </ContextMenuFixture>);
    fireEvent.contextMenu(screen.getByTestId('trigger'), { clientX: 10, clientY: 10, button: 2 });
    flush();
    await view.user.hover(screen.getByTestId('submenu-trigger'));
    fireEvent.mouseUp(await screen.findByTestId('deep-item'), { button: 2 });
    flush();
    await waitFor(() => expect(screen.queryByTestId('submenu')).toBeNull());
    await waitFor(() => expect(screen.queryByTestId('popup')).toBeNull());
    expect(submenuChanged).toHaveBeenLastCalledWith(false, expect.objectContaining({ reason: 'item-press' }));
    expect(rootChanged).toHaveBeenLastCalledWith(false, expect.objectContaining({ reason: 'item-press' }));
  });
  it('does not activate a submenu trigger on gesture release', async () => {
    const changed = vi.fn();
    await render(() => <ContextMenuFixture>
      <ContextMenu.SubmenuRoot onOpenChange={changed}>
        <ContextMenu.SubmenuTrigger openOnHover={false} data-testid="submenu-trigger">More</ContextMenu.SubmenuTrigger>
        <ContextMenu.Portal><ContextMenu.Positioner><ContextMenu.Popup data-testid="submenu" /></ContextMenu.Positioner></ContextMenu.Portal>
      </ContextMenu.SubmenuRoot>
    </ContextMenuFixture>);
    fireEvent.contextMenu(screen.getByTestId('trigger'), { clientX: 20, clientY: 20, button: 2 });
    flush();
    firePointer.move(document.body, { clientX: 24, clientY: 24, timeStamp: 100 });
    fireEvent.mouseUp(screen.getByTestId('submenu-trigger'), { clientX: 24, clientY: 24, button: 2 });
    flush();
    expect(screen.queryByTestId('submenu')).toBeNull();
    expect(changed).not.toHaveBeenCalled();
  });
  it('does not open when disabled', async () => {
    const changed = vi.fn();
    await render(() => <ContextMenuFixture root={{ disabled: true, onOpenChange: changed }} />);
    fireEvent.contextMenu(screen.getByTestId('trigger'), { clientX: 10, clientY: 10, button: 2 });
    flush();
    expect(screen.queryByTestId('popup')).toBeNull();
    expect(changed).not.toHaveBeenCalled();
  });
  it('returns focus to the focused surface when closing with Shift+Tab', async () => {
    const view = await render(() => <ContextMenuFixture trigger={{
      // The render callback deliberately changes the host from div to button.
      render: (props) => <button {...props as JSX.ButtonHTMLAttributes<HTMLButtonElement>} />,
    }} />);
    const surface = screen.getByRole('button', { name: 'Surface' });
    await view.user.tab();
    expect(surface).toHaveFocus();
    fireEvent.contextMenu(surface, { clientX: 20, clientY: 20, button: 2 });
    await waitFor(() => expect(screen.getByRole('menu')).toHaveFocus());
    await view.user.tab({ shift: true });
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
    expect(surface).toHaveFocus();
  });
});
