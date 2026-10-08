import { describe, expect, it, vi } from 'vitest';
import { flush, untrack } from 'solid-js';
import { createRenderer, fireEvent, screen } from '../../test';
import { CompositeItem } from '../internals/composite';
import { useFloatingParentNodeId, useFloatingTree } from '../floating-ui-react/components/FloatingTree';
import type { MenuTree, MenuTreeEvents } from '../menu/utils/MenuTreeEvents';
import type { MenuOpenEventDetails } from '../menu/utils/types';
import { DirectionProvider } from '../direction-provider';
import { Menubar, type MenubarProps } from './Menubar';
import { useMenubarContext, type MenubarContext } from './MenubarContext';

const { render, renderProps } = createRenderer();

// Exercise the real host/composite/tree without instantiating a Menu popup.
// Full Menu interaction outcomes remain in Menubar.test.tsx.
function Items() {
  return <><CompositeItem tag="button">File</CompositeItem>
    <CompositeItem tag="button">Edit</CompositeItem>
    <CompositeItem tag="button">View</CompositeItem></>;
}

describe('Menubar host', () => {
  for (const orientation of ['horizontal', 'vertical'] as const) {
    for (const direction of ['ltr', 'rtl'] as const) {
      it(`uses current ${orientation}/${direction} roving and loop settings`, async () => {
        const view = await renderProps((props: MenubarProps) => <DirectionProvider direction={direction}>
          <Menubar {...props}><Items /></Menubar>
        </DirectionProvider>, { orientation, loopFocus: false });
        const root = screen.getByRole('menubar');
        const [file, edit, last] = screen.getAllByRole('button');
        file!.focus(); flush();
        const next = orientation === 'vertical' ? 'ArrowDown' : direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
        const previous = orientation === 'vertical' ? 'ArrowUp' : direction === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
        await view.user.keyboard(`{${next}}`);
        expect(edit).toHaveFocus();
        expect(edit).toHaveAttribute('tabindex', '0');
        expect(file).toHaveAttribute('tabindex', '-1');
        await view.user.keyboard('{End}');
        expect(last).toHaveFocus();
        await view.user.keyboard(`{${next}}`);
        expect(last).toHaveFocus();
        await view.setProps({ loopFocus: true });
        await view.user.keyboard(`{${next}}`);
        expect(file).toHaveFocus();
        await view.user.keyboard(`{${previous}}`);
        expect(last).toHaveFocus();
        await view.user.keyboard('{Home}');
        expect(file).toHaveFocus();
        expect(screen.getByRole('menubar')).toBe(root);
      });
    }
  }

  it('reads live orientation without replacing the focused item', async () => {
    const view = await renderProps((props: MenubarProps) => <Menubar {...props}><Items /></Menubar>, {});
    const file = screen.getByRole('button', { name: 'File' });
    file.focus(); flush();
    await view.setProps({ orientation: 'vertical' });
    expect(screen.getByRole('button', { name: 'File' })).toBe(file);
    expect(file).toHaveFocus();
    await view.user.keyboard('{ArrowRight}');
    expect(file).toHaveFocus();
    await view.user.keyboard('{ArrowDown}');
    expect(screen.getByRole('button', { name: 'Edit' })).toHaveFocus();
  });

  it('only direct menu events update state, retaining sibling/list handoff and isolating hosts', async () => {
    const probes: { tree: MenuTree; parentId: string | null }[] = [];
    function Probe() {
      probes.push({ tree: useFloatingTree<MenuTreeEvents>()!, parentId: useFloatingParentNodeId() });
      return null;
    }
    await render(() => <><Menubar aria-label="first"><Probe /><Items /></Menubar><Menubar aria-label="second"><Probe /></Menubar></>);
    const [first, second] = screen.getAllByRole('menubar');
    const { tree, parentId } = probes[0]!;
    function emit(open: boolean, reason: MenuOpenEventDetails['reason'], parent = parentId, nodeId: string | undefined = 'file') {
      tree.events.emit('menuopenchange', { open, reason, parentNodeId: parent, nodeId });
      flush();
    }
    emit(true, 'trigger-press', 'nested-parent');
    tree.events.emit('menuopenchange', { open: true, reason: 'trigger-press', parentNodeId: parentId, nodeId: undefined });
    flush();
    expect(first).not.toHaveAttribute('data-has-submenu-open');
    emit(true, 'trigger-press');
    expect(first).toHaveAttribute('data-has-submenu-open');
    expect(second).not.toHaveAttribute('data-has-submenu-open');
    emit(false, 'sibling-open');
    expect(first).toHaveAttribute('data-has-submenu-open');
    emit(false, 'list-navigation');
    expect(first).toHaveAttribute('data-has-submenu-open');
    emit(false, 'item-press', 'nested-parent');
    expect(first).toHaveAttribute('data-has-submenu-open');
    emit(false, 'item-press');
    expect(first).not.toHaveAttribute('data-has-submenu-open');
    // Explicit proposals compose in one turn; no immediate staged getter read.
    tree.events.emit('menuopenchange', { open: true, reason: 'trigger-focus', parentNodeId: parentId, nodeId: 'file' });
    tree.events.emit('menuopenchange', { open: false, reason: 'sibling-open', parentNodeId: parentId, nodeId: 'file' });
    tree.events.emit('menuopenchange', { open: true, reason: 'trigger-focus', parentNodeId: parentId, nodeId: 'edit' });
    flush();
    expect(first).toHaveAttribute('data-has-submenu-open');
  });

  it('enables composite hover highlighting only while a direct menu is open', async () => {
    let publish!: (open: boolean) => void;
    function Probe() {
      const tree = useFloatingTree<MenuTreeEvents>()!;
      const parentNodeId = useFloatingParentNodeId();
      publish = (open) => tree.events.emit('menuopenchange', { open, parentNodeId, nodeId: 'file', reason: 'trigger-press' });
      return null;
    }
    await render(() => <Menubar><Probe /><Items /></Menubar>);
    const file = screen.getByRole('button', { name: 'File' });
    const edit = screen.getByRole('button', { name: 'Edit' });
    file.focus(); flush();
    fireEvent.mouseMove(edit); flush();
    expect(file).toHaveFocus();
    publish(true); flush();
    fireEvent.mouseMove(edit); flush();
    expect(edit).toHaveFocus();
    publish(false); flush();
    fireEvent.mouseMove(file); flush();
    expect(edit).toHaveFocus();
  });

  it('keeps native event currentTarget typing and independent Base UI cancellation', async () => {
    const current = vi.fn();
    const view = await renderProps((props: { prevent: boolean; changed: boolean }) => <Menubar onKeyDown={(event) => {
      const host: HTMLDivElement = event.currentTarget;
      expect(host).toBe(screen.getByRole('menubar'));
      current(props.changed, event.defaultPrevented);
      if (props.prevent) event.preventBaseUIHandler();
      else event.preventDefault();
    }}><Items /></Menubar>, { prevent: true, changed: false });
    const file = screen.getByRole('button', { name: 'File' });
    file.focus(); flush();
    await view.user.keyboard('{ArrowRight}');
    expect(file).toHaveFocus();
    expect(current).toHaveBeenLastCalledWith(false, false);
    await view.setProps({ prevent: false, changed: true });
    await view.user.keyboard('{ArrowRight}');
    expect(screen.getByRole('button', { name: 'Edit' })).toHaveFocus();
    expect(current).toHaveBeenLastCalledWith(true, false);
  });

  it('stops handled main-axis keys while leaving cross-axis keys for menus', async () => {
    const ancestor = vi.fn();
    const { user } = await render(() => <div onKeyDown={ancestor}><Menubar><Items /></Menubar></div>);
    screen.getByRole('button', { name: 'File' }).focus(); flush();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('button', { name: 'Edit' })).toHaveFocus();
    expect(ancestor).not.toHaveBeenCalled();
    await user.keyboard('{ArrowDown}');
    expect(ancestor).toHaveBeenCalledTimes(1);
  });

  it('gives custom render handlers a native div event and retains the context host ref', async () => {
    let content!: MenubarContext;
    function Probe() { content = useMenubarContext(); return null; }
    const view = await render(() => <Menubar render={(props) => <div {...props} ref={(node) => props.ref?.(node)} onKeyDown={(event) => {
      const host: HTMLDivElement = event.currentTarget;
      expect(host).toBe(screen.getByRole('menubar'));
      const handler = props.onKeyDown;
      if (typeof handler === 'function') handler(event);
      else if (handler) handler[0](handler[1], event);
    }} />}><Probe /><Items /></Menubar>);
    expect(untrack(() => content.contentElement)).toBe(screen.getByRole('menubar'));
    screen.getByRole('button', { name: 'File' }).focus(); flush();
    await view.user.keyboard('{ArrowRight}');
    expect(screen.getByRole('button', { name: 'Edit' })).toHaveFocus();
  });

  it('unsubscribes its direct-child listener on disposal', async () => {
    const observe = (tree: MenuTree) => vi.spyOn(tree.events, 'off');
    let off!: ReturnType<typeof observe>;
    function Probe() {
      off = observe(useFloatingTree<MenuTreeEvents>()!);
      return null;
    }
    const view = await render(() => <Menubar><Probe /></Menubar>);
    view.unmount();
    expect(off).toHaveBeenCalledWith('menuopenchange', expect.any(Function));
    off.mockRestore();
  });
});
