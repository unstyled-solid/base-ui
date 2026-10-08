import { describe, expect, it } from 'vitest';
import { createContext, onCleanup } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { createRenderer, waitFor } from '../../test';
import * as Menu from './index.parts';

const { render, renderProps } = createRenderer();

describe('Menu resolved children and payload rendering', () => {
  for (const filtered of [false, true]) {
    it(`retains provider-wrapped JSX through live popup IDs (filtered=${filtered})`, async () => {
      const WrapperContext = createContext<null>(null);
      let mounts = 0;
      let disposals = 0;
      function Item() {
        mounts += 1;
        onCleanup(() => { disposals += 1; });
        return <Menu.Item>Copy</Menu.Item>;
      }
      function ResolvedContent(props: { children?: JSX.Element }) {
        return <WrapperContext value={null}>{props.children}</WrapperContext>;
      }
      function Content(props: { id: string }) {
        return <Menu.Root defaultOpen><ResolvedContent>
          <Menu.Trigger>Actions</Menu.Trigger>
          <Menu.Portal><Menu.Positioner><Menu.Popup id={props.id}>
            {filtered ? <><Menu.Input aria-label="Query" /><Menu.List><Item /></Menu.List></> : <Item />}
          </Menu.Popup></Menu.Positioner></Menu.Portal>
        </ResolvedContent></Menu.Root>;
      }
      const view = await renderProps((props: { id: string }) => filtered
        ? <Menu.FilterProvider><Content id={props.id} /></Menu.FilterProvider>
        : <Content id={props.id} />, { id: 'first-popup' });
      const popup = view.getByRole(filtered ? 'dialog' : 'menu');
      const item = view.getByRole('menuitem', { name: 'Copy' });
      expect(mounts).toBe(1);
      await view.setProps({ id: 'second-popup' });
      await waitFor(() => expect(view.getByRole('button', { name: 'Actions' })).toHaveAttribute('aria-controls', 'second-popup'));
      expect(view.getByRole(filtered ? 'dialog' : 'menu') === popup).toBe(true);
      expect(view.getByRole('menuitem', { name: 'Copy' }) === item).toBe(true);
      expect(mounts).toBe(1);
      expect(disposals).toBe(0);
      view.unmount();
      expect(disposals).toBe(1);
    });

    it(`keeps genuine payload callbacks live across trigger switches (filtered=${filtered})`, async () => {
      const handle = Menu.createHandle<{ label: string }>();
      let callbacks = 0;
      const one = { label: 'One' }, two = { label: 'Two' };
      function Content() {
        return <Menu.Root handle={handle} defaultOpen defaultTriggerId="one">{data => {
          callbacks += 1;
          return <>
            <Menu.Trigger id="one" payload={one}>First</Menu.Trigger>
            <Menu.Trigger id="two" payload={two}>Second</Menu.Trigger>
            <Menu.Portal><Menu.Positioner><Menu.Popup>
              {filtered ? <><Menu.Input aria-label="Query" /><Menu.List><Menu.Item>{data.payload?.label}</Menu.Item></Menu.List></>
                : <Menu.Item>{data.payload?.label}</Menu.Item>}
            </Menu.Popup></Menu.Positioner></Menu.Portal>
          </>;
        }}</Menu.Root>;
      }
      const view = await render(() => filtered ? <Menu.FilterProvider><Content /></Menu.FilterProvider> : <Content />);
      const item = view.getByRole('menuitem', { name: 'One' });
      const trigger = view.getByRole('button', { name: 'Second' });
      expect(callbacks).toBe(1);
      handle.open('two');
      await waitFor(() => expect(item).toHaveTextContent('Two'));
      expect(view.getByRole('menuitem', { name: 'Two' }) === item).toBe(true);
      expect(view.getByRole('button', { name: 'Second' }) === trigger).toBe(true);
      expect(callbacks).toBe(1);
    });

    it(`supports source-shaped destructured payload callbacks (filtered=${filtered})`, async () => {
      const handle = Menu.createHandle<{ label: string }>();
      const one = { label: 'One' }, two = { label: 'Two' };
      function Content() {
        return <Menu.Root handle={handle} defaultOpen defaultTriggerId="one">{({ payload }) => <>
          <Menu.Trigger id="one" payload={one}>First</Menu.Trigger>
          <Menu.Trigger id="two" payload={two}>Second</Menu.Trigger>
          <output>{payload?.label}</output>
        </>}</Menu.Root>;
      }
      const view = await render(() => filtered ? <Menu.FilterProvider><Content /></Menu.FilterProvider> : <Content />);
      expect(view.getByRole('status')).toHaveTextContent('One');
      handle.open('two');
      await waitFor(() => expect(view.getByRole('status')).toHaveTextContent('Two'));
      expect(view.getAllByRole('button', { name: /^(First|Second)$/ })).toHaveLength(2);
      expect(view.getByRole('button', { name: 'Second' })).toHaveAttribute('aria-expanded', 'true');
    });
  }
});
