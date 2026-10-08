import { expect, it } from 'vitest';
import { createSignal } from 'solid-js';
import { createRenderer } from '../../test';
import { MenubarContext, useMenubarContext } from './MenubarContext';
import { MenubarContext as MenuHostContext, useMenubarContext as useMenuHostContext } from '../menu/host/MenuHostContexts';

const { render } = createRenderer();
it('MenubarContext supports optional absence and rejects required absence', async () => {
  function Probe() {
    expect(useMenubarContext(true)).toBeNull();
    expect(() => useMenubarContext()).toThrow(/MenubarContext is missing/);
    return null;
  }
  await render(() => <Probe />);
});

it('MenubarContext is the Menu-owned identity and accessor, not a parallel context', () => {
  expect(MenubarContext).toBe(MenuHostContext);
  expect(useMenubarContext).toBe(useMenuHostContext);
});

it('MenubarContext gives Menu consumers live state and isolates sibling hosts', async () => {
  function Host(props: { name: string }) {
    const [open, setOpen] = createSignal(false);
    const context: MenubarContext = {
      modal: true, disabled: false, contentElement: null, setContentElement() {},
      get hasSubmenuOpen() { return open(); }, setHasSubmenuOpen: setOpen,
      orientation: 'horizontal', allowMouseUpTriggerRef: { current: false }, rootId: props.name,
    };
    return <MenubarContext value={context}><Consumer name={props.name} /></MenubarContext>;
  }
  function Consumer(props: { name: string }) {
    const host = useMenuHostContext();
    return <button data-testid={props.name} onClick={() => host.setHasSubmenuOpen(true)}>
      {host.hasSubmenuOpen ? 'open' : 'closed'}
    </button>;
  }
  const view = await render(() => <><Host name="first" /><Host name="second" /></>);
  const first = view.getByTestId('first');
  await view.user.click(first);
  expect(view.getByTestId('first')).toBe(first);
  expect(first).toHaveTextContent('open');
  expect(view.getByTestId('second')).toHaveTextContent('closed');
});
