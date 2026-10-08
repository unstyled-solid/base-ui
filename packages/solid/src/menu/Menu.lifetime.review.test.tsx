import { describe, expect, it, vi } from 'vitest';
import { onCleanup, untrack } from 'solid-js';
import { createRenderer, fireEvent, waitFor } from '../../test';
import * as Menu from './index.parts';
import { Menubar } from '../menubar/Menubar';
import * as ContextMenu from '../context-menu/index.parts';

const { render, renderProps } = createRenderer();

describe('Menu native child lifetime', () => {
  for (const scenario of [
    { controlled: false, canceled: false, expected: 'two' },
    { controlled: false, canceled: true, expected: 'one' },
    { controlled: true, canceled: false, expected: 'one' },
  ]) {
    it(`reports current accepted trigger on same-turn imperative close (controlled=${scenario.controlled}, canceled=${scenario.canceled})`, async () => {
      const handle = Menu.createHandle<number>();
      const order: string[] = [];
      let reported: Element | undefined;
      const view = await render(() => <Menu.Root handle={handle} defaultOpen defaultTriggerId="one" triggerId={scenario.controlled ? 'one' : undefined}
        onOpenChange={(open, details) => {
          order.push(`${open ? 'open' : 'close'}:${details.trigger?.id}`);
          if (open && scenario.canceled) details.cancel();
          if (!open) { reported = details.trigger; details.preventUnmountOnClose(); }
        }}>{state => <>
          <Menu.Trigger id="one" payload={1}>One</Menu.Trigger>
          <Menu.Trigger id="two" payload={2}>Two</Menu.Trigger>
          <output>{state.payload}</output>
        </>}</Menu.Root>);
      handle.open('two');
      handle.close();
      expect(reported === view.getByRole('button', { name: scenario.expected === 'two' ? 'Two' : 'One' })).toBe(true);
      expect(order).toEqual(['open:two', `close:${scenario.expected}`]);
      await waitFor(() => expect(view.getByRole('status')).toHaveTextContent(scenario.expected === 'two' ? '2' : '1'));
      expect(untrack(() => handle.isOpen)).toBe(false);
    });
  }

  for (const kind of ['menu', 'context-menu'] as const) {
    it(`isolates item-close transactions between independent nested ${kind} roots`, async () => {
      const outer = vi.fn();
      const inner = vi.fn();
      const view = await render(() => kind === 'menu'
        ? <Menu.Root open onOpenChange={outer}><Menu.Root open onOpenChange={inner}><Menu.Item>Inner action</Menu.Item></Menu.Root></Menu.Root>
        : <ContextMenu.Root open onOpenChange={outer}><ContextMenu.Root open onOpenChange={inner}><ContextMenu.Item>Inner action</ContextMenu.Item></ContextMenu.Root></ContextMenu.Root>);
      fireEvent.click(view.getByRole('menuitem', { name: 'Inner action' }));
      expect(inner).toHaveBeenCalledWith(false, expect.objectContaining({ reason: 'item-press' }));
      expect(outer).not.toHaveBeenCalled();
    });
  }

  for (const host of ['standalone', 'menubar'] as const) {
    for (const custom of [false, true]) {
      it(`retains ${host} trigger children through open and disabled changes (custom=${custom})`, async () => {
        let mounts = 0;
        let disposals = 0;
        function Child() {
          mounts += 1;
          onCleanup(() => { disposals += 1; });
          return <span data-testid="child">Actions</span>;
        }
        const view = await renderProps((props: { open: boolean; disabled: boolean }) => {
          const content = () => <Menu.Root open={props.open}>
            <Menu.Trigger disabled={props.disabled} render={custom ? attributes => <button {...attributes} /> : undefined}>
              <Child />
            </Menu.Trigger>
          </Menu.Root>;
          return host === 'menubar' ? <Menubar>{content()}</Menubar> : content();
        }, { open: false, disabled: false });
        const child = view.getByTestId('child');
        const trigger = child.parentElement!;
        expect(mounts).toBe(1);
        await view.setProps({ open: true });
        expect(view.getByTestId('child') === child).toBe(true);
        expect(child.parentElement === trigger).toBe(true);
        expect(trigger).toHaveAttribute('aria-expanded', 'true');
        await view.setProps({ disabled: true });
        expect(view.getByTestId('child') === child).toBe(true);
        expect(trigger).toBeDisabled();
        await view.setProps({ open: false, disabled: false });
        expect(view.getByTestId('child') === child).toBe(true);
        expect(mounts).toBe(1);
        expect(disposals).toBe(0);
        view.unmount();
        expect(disposals).toBe(1);
      });
    }
  }

  for (const kind of ['item', 'checkbox', 'radio', 'link', 'submenu'] as const) {
    it(`retains ${kind} children through root and selection changes`, async () => {
      let mounts = 0;
      let disposals = 0;
      function Child() {
        mounts += 1;
        onCleanup(() => { disposals += 1; });
        return <span data-testid="child">Action</span>;
      }
      const view = await renderProps((props: { open: boolean; disabled: boolean; checked: boolean }) => <Menu.Root open={props.open} disabled={props.disabled}>
        {kind === 'item' ? <Menu.Item><Child /></Menu.Item>
          : kind === 'checkbox' ? <Menu.CheckboxItem checked={props.checked}><Child /></Menu.CheckboxItem>
            : kind === 'radio' ? <Menu.RadioGroup value={props.checked ? 'action' : null}><Menu.RadioItem value="action"><Child /></Menu.RadioItem></Menu.RadioGroup>
              : kind === 'link' ? <Menu.LinkItem href="#action"><Child /></Menu.LinkItem>
                : <Menu.SubmenuRoot open={props.checked}><Menu.SubmenuTrigger><Child /></Menu.SubmenuTrigger></Menu.SubmenuRoot>}
      </Menu.Root>, { open: true, disabled: false, checked: false });
      const child = view.getByTestId('child');
      const item = child.parentElement!;
      expect(mounts).toBe(1);
      await view.setProps({ checked: true });
      expect(view.getByTestId('child') === child).toBe(true);
      await view.setProps({ disabled: true });
      expect(view.getByTestId('child') === child).toBe(true);
      await view.setProps({ open: false, disabled: false, checked: false });
      expect(view.getByTestId('child') === child).toBe(true);
      expect(child.parentElement === item).toBe(true);
      expect(mounts).toBe(1);
      expect(disposals).toBe(0);
      view.unmount();
      expect(disposals).toBe(1);
    });
  }
});
