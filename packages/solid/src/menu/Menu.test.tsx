import { describe, expect, it, vi } from 'vitest';
import { Show } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { createRenderer, browserCase, firePointer, fireEvent, waitFor, within } from '../../test';
import * as Menu from './index.parts';
import type { MenuRoot } from './root/MenuRoot';
const renderer = createRenderer();
async function render(...args: Parameters<typeof renderer.render>) {
  return { ...await renderer.render(...args), ...within(document.body) };
}
async function renderProps<P extends object>(factory: (props: P) => JSX.Element, initial: P) {
  return { ...await renderer.renderProps(factory, initial), ...within(document.body) };
}
function Content(props: { children?: JSX.Element; keepMounted?: boolean }) {
  return <Menu.Portal keepMounted={props.keepMounted}><Menu.Positioner><Menu.Popup>{props.children}</Menu.Popup></Menu.Positioner></Menu.Portal>;
}
describe('Menu transactions and all item modes', () => {
  it.each([false, true])('default-open is page-load content; keepMounted=%s', async keepMounted => {
    const view = await render(() => <Menu.Root defaultOpen><Menu.Trigger>Open</Menu.Trigger><Content keepMounted={keepMounted}><Menu.Item>Copy</Menu.Item></Content></Menu.Root>);
    const popup = view.getByRole('menu');
    expect(popup).toHaveAttribute('data-open');
    expect(popup).not.toHaveAttribute('data-starting-style');
    await view.user.keyboard('{Escape}');
    await waitFor(() => expect(view.queryByRole('menu')).toBeNull());
    expect(popup.isConnected).toBe(keepMounted);
  });
  it('canceled Escape preserves open state and focus', async () => {
    const changed = vi.fn((next: boolean, details: MenuRoot.ChangeEventDetails) => { if (!next) details.cancel(); });
    const view = await render(() => <Menu.Root defaultOpen onOpenChange={changed}><Menu.Trigger>Open</Menu.Trigger><Content><Menu.Item>Copy</Menu.Item></Content></Menu.Root>);
    const popup = view.getByRole('menu'); popup.focus();
    await view.user.keyboard('{Escape}');
    expect(changed).toHaveBeenCalledWith(false, expect.objectContaining({ reason: 'escape-key', isCanceled: true }));
    expect(popup).toHaveAttribute('data-open');
    expect(popup).toHaveFocus();
  });
  it('consumer prevention is independent of defaultPrevented', async () => {
    const view = await render(() => <Menu.Root defaultOpen><Menu.Trigger>Open</Menu.Trigger><Content>
      <Menu.Item onClick={event => event.preventBaseUIHandler()}>Keep</Menu.Item>
      <Menu.Item onClick={event => event.preventDefault()}>Close</Menu.Item>
    </Content></Menu.Root>);
    await view.user.click(view.getByRole('menuitem', { name: 'Keep' }));
    expect(view.getByRole('menu')).toBeInTheDocument();
    await view.user.click(view.getByRole('menuitem', { name: 'Close' }));
    await waitFor(() => expect(view.queryByRole('menu')).toBeNull());
  });
  it('checkbox/radio cancel local changes and links keep native defaults', async () => {
    const checkbox = vi.fn((_: boolean, details: MenuRoot.ChangeEventDetails) => details.cancel());
    const radio = vi.fn((_: unknown, details: MenuRoot.ChangeEventDetails) => details.cancel());
    const view = await render(() => <Menu.Root defaultOpen><Content>
      <Menu.CheckboxItem onCheckedChange={checkbox}>Flag</Menu.CheckboxItem>
      <Menu.RadioGroup defaultValue="a" onValueChange={radio}><Menu.RadioItem value="a">A</Menu.RadioItem><Menu.RadioItem value="b">B</Menu.RadioItem></Menu.RadioGroup>
      <Menu.LinkItem href="#native">Link</Menu.LinkItem>
    </Content></Menu.Root>);
    await view.user.click(view.getByRole('menuitemcheckbox'));
    expect(view.getByRole('menuitemcheckbox')).toHaveAttribute('aria-checked', 'false');
    await view.user.click(view.getByRole('menuitemradio', { name: 'B' }));
    expect(view.getByRole('menuitemradio', { name: 'A' })).toHaveAttribute('aria-checked', 'true');
    expect(view.getByRole('menuitemradio', { name: 'B' })).toHaveAttribute('aria-checked', 'false');
    expect(view.getByRole('menuitem', { name: 'Link' })).toHaveAttribute('href', '#native');
    expect(view.getByRole('menu')).toBeInTheDocument();
  });
  it('disabled items remain navigable without firing consumer activation', async () => {
    const clicked = vi.fn();
    const view = await render(() => <Menu.Root defaultOpen><Content><Menu.Item>A</Menu.Item><Menu.Item disabled onClick={clicked}>B</Menu.Item><Menu.Item>C</Menu.Item></Content></Menu.Root>);
    view.getByRole('menuitem', { name: 'A' }).focus();
    await view.user.keyboard('{ArrowDown}{Enter}');
    expect(view.getByRole('menuitem', { name: 'B' })).toHaveFocus();
    expect(clicked).not.toHaveBeenCalled();
  });
  it.each([false, true])('imperative highlight respects loopFocus=%s and never opens a closed menu', async loopFocus => {
    const actions = { current: null as MenuRoot.Actions | null }; const highlighted = vi.fn();
    const view = await render(() => <Menu.Root defaultOpen loopFocus={loopFocus} actionsRef={actions} onItemHighlighted={highlighted}><Menu.Trigger>Open</Menu.Trigger><Content><Menu.Item label="Alpha">A</Menu.Item><Menu.Item>B</Menu.Item></Content></Menu.Root>);
    await waitFor(() => expect(view.getByRole('menu')).toHaveFocus());
    actions.current!.highlightItem('last');
    await waitFor(() => expect(view.getByRole('menuitem', { name: 'B' })).toHaveFocus());
    actions.current!.highlightItem('next');
    await waitFor(() => expect(view.getByRole('menuitem', { name: loopFocus ? 'A' : 'B' })).toHaveFocus());
    actions.current!.highlightItem('none');
    await waitFor(() => expect(view.getByRole('menu')).toHaveFocus());
    expect(highlighted).toHaveBeenCalledWith(undefined, expect.objectContaining({ reason: 'imperative-action' }));
    actions.current!.close();
    await waitFor(() => expect(view.queryByRole('menu')).toBeNull());
    actions.current!.highlightItem('first');
    expect(view.queryByRole('menu')).toBeNull();
  });
  it('manual close retains popup until unmount action', async () => {
    const actions = { current: null as MenuRoot.Actions | null };
    const view = await render(() => <Menu.Root defaultOpen actionsRef={actions} onOpenChange={(next, details) => { if (!next) details.preventUnmountOnClose(); }}><Content><Menu.Item>Close</Menu.Item></Content></Menu.Root>);
    const popup = view.getByRole('menu');
    await view.user.click(view.getByRole('menuitem'));
    expect(popup.isConnected).toBe(true);
    actions.current!.unmount();
    await waitFor(() => expect(popup.isConnected).toBe(false));
  });
  it('detached root remount resets payload while preserving the trigger host', async () => {
    const handle = Menu.createHandle<number>();
    const view = await renderProps((props: { mounted: boolean }) => <>
      <Menu.Trigger id="detached" handle={handle} payload={7}>Open</Menu.Trigger>
      <Show when={props.mounted}><Menu.Root handle={handle}>{data => <><span data-testid="payload">{data.payload ?? 'empty'}</span><Content><Menu.Item>Copy</Menu.Item></Content></>}</Menu.Root></Show>
    </>, { mounted: true });
    const trigger = view.getByRole('button');
    await view.user.click(trigger);
    await waitFor(() => expect(view.getByTestId('payload')).toHaveTextContent('7'));
    await view.setProps({ mounted: false });
    expect(handle.isOpen).toBe(false);
    await view.setProps({ mounted: true });
    expect(view.getByTestId('payload')).toHaveTextContent('empty');
    expect(view.getByRole('button')).toBe(trigger);
    await view.user.click(trigger);
    await waitFor(() => expect(view.getByTestId('payload')).toHaveTextContent('7'));
  });
});
describe('Menu provider-scoped filtering', () => {
  it('keeps real focus on input, preserves matching identity and checked state through hiding', async () => {
    const view = await render(() => <Menu.FilterProvider><Menu.Root defaultOpen><Menu.Trigger>Open</Menu.Trigger><Content>
      <Menu.Input aria-label="Query" /><Menu.List><Menu.Item>Apple</Menu.Item><Menu.CheckboxItem defaultChecked>Banana</Menu.CheckboxItem></Menu.List><Menu.Empty>Empty</Menu.Empty><Menu.Clear>Clear</Menu.Clear>
    </Content></Menu.Root></Menu.FilterProvider>);
    const input = view.getByRole('searchbox'); const apple = view.getByRole('menuitem', { name: 'Apple' });
    await view.user.type(input, 'app');
    expect(view.getByRole('menuitem', { name: 'Apple' })).toBe(apple);
    expect(view.queryByRole('menuitemcheckbox')).toBeNull();
    await view.user.clear(input);
    expect(view.getByRole('menuitemcheckbox')).toHaveAttribute('aria-checked', 'true');
    await view.user.keyboard('{ArrowDown}');
    expect(input).toHaveFocus();
    expect(input).toHaveAttribute('aria-activedescendant', apple.id);
  });
  it('plain submenus inside a filter provider retain plain menu semantics', async () => {
    const view = await render(() => <Menu.FilterProvider><Menu.Root defaultOpen><Content>
      <Menu.Input aria-label="Query" /><Menu.List><Menu.SubmenuRoot><Menu.SubmenuTrigger openOnHover={false}>More</Menu.SubmenuTrigger><Content><Menu.Item>Nested</Menu.Item></Content></Menu.SubmenuRoot></Menu.List>
    </Content></Menu.Root></Menu.FilterProvider>);
    expect(view.getByRole('menuitem', { name: 'More' })).toHaveAttribute('aria-haspopup', 'menu');
    await view.user.click(view.getByRole('menuitem', { name: 'More' }));
    await view.findByRole('menuitem', { name: 'Nested' });
    expect(view.getAllByRole('menu')).toHaveLength(2);
    expect(view.getAllByRole('searchbox')).toHaveLength(1);
  });
});
browserCase({ source: 'packages/react/src/menu/submenu-trigger/MenuSubmenuTrigger.screenReaderPress.test.tsx', case: 'repeated synthetic screen-reader activation toggles only submenu', environment: 'browser', issue: 'bsolid-accessibility' }, async () => {
  const view = await render(() => <Menu.Root defaultOpen><Content><Menu.SubmenuRoot><Menu.SubmenuTrigger>More</Menu.SubmenuTrigger><Content><Menu.Item>Nested</Menu.Item></Content></Menu.SubmenuRoot></Content></Menu.Root>);
  const trigger = view.getByRole('menuitem', { name: 'More' });
  function press(timeStamp: number) {
    firePointer.down(trigger, { pointerType: 'mouse', width: 1, height: 1, pressure: 0, buttons: 0, timeStamp });
    fireEvent.mouseDown(trigger, { detail: 0 }); fireEvent.click(trigger, { detail: 0 });
  }
  press(100);
  await waitFor(() => expect(view.getByRole('menuitem', { name: 'Nested' })).toBeInTheDocument());
  press(200);
  await waitFor(() => expect(view.queryByRole('menuitem', { name: 'Nested' })).toBeNull());
  expect(view.getByRole('menu')).toBeInTheDocument();
  press(300);
  await waitFor(() => expect(view.getByRole('menuitem', { name: 'Nested' })).toBeInTheDocument());
  expect(view.getAllByRole('menu')).toHaveLength(2);
});
browserCase({ source: 'packages/react/src/menu/viewport/MenuViewport.test.tsx', case: 'morphing containers retain previous content, geometry and inertness until animation completes', environment: 'browser', issue: 'bsolid-browser' }, async () => {
  const globals = globalThis as typeof globalThis & { BASE_UI_ANIMATIONS_DISABLED?: boolean };
  const previousFlag = globals.BASE_UI_ANIMATIONS_DISABLED;
  globals.BASE_UI_ANIMATIONS_DISABLED = false;
  try {
    const view = await render(() => <>
      <style>{`
        #menu-viewport[data-transitioning] [data-previous] { animation: menu-out .3s ease-out forwards; }
        #menu-viewport[data-transitioning] [data-current] { animation: menu-in .3s ease-out forwards; }
        @keyframes menu-out { from { transform: translateX(0); opacity: 1; } to { transform: translateX(-30%); opacity: 0; } }
        @keyframes menu-in { from { transform: translateX(30%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      `}</style>
      <Menu.Root<number>>{data => <>
        <Menu.Trigger payload={0} style={{ position: 'absolute', top: '10px', left: '10px', width: '100px', height: '50px' }}>First</Menu.Trigger>
        <Menu.Trigger payload={1} style={{ position: 'absolute', top: '100px', left: '200px', width: '100px', height: '50px' }}>Second</Menu.Trigger>
        <Content><Menu.Viewport id="menu-viewport"><div>Content {data.payload}</div></Menu.Viewport></Content>
      </>}</Menu.Root>
    </>);
    await view.user.click(view.getByRole('button', { name: 'First' }));
    await waitFor(() => expect(view.getByText('Content 0')).toBeVisible());
    await view.user.click(view.getByRole('button', { name: 'Second' }));
    const viewport = view.getByRole('menu').querySelector('#menu-viewport')!;
    await waitFor(() => expect(viewport.querySelector('[data-previous]')).not.toBeNull());
    const old = viewport.querySelector<HTMLElement>('[data-previous]')!;
    expect(old).toHaveAttribute('inert');
    expect(old.textContent).toBe('Content 0');
    expect(old.style.getPropertyValue('--popup-width')).toMatch(/^\d+(?:\.\d+)?px$/);
    expect(old.style.getPropertyValue('--popup-height')).toMatch(/^\d+(?:\.\d+)?px$/);
    expect(viewport.querySelector('[data-current]')?.textContent).toBe('Content 1');
    await waitFor(() => expect(viewport.querySelector('[data-previous]')).toBeNull());
    expect(view.getByText('Content 1')).toBeVisible();
  } finally {
    globals.BASE_UI_ANIMATIONS_DISABLED = previousFlag;
  }
});
