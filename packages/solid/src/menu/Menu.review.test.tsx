import { describe, expect, it, vi } from 'vitest';
import { Show } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { createRenderer, describeConformance, popupConformanceTests, screen, fireEvent, waitFor, sourceCase, browserCase, firePointer } from '../../test';
import * as Menu from './index.parts';
import type { MenuRoot } from './root/MenuRoot';
import { DirectionProvider } from '../direction-provider/DirectionProvider';
import { ToolbarRootContext } from '../toolbar/root/ToolbarRootContext';
import { ContextMenuRootContext } from './host/MenuHostContexts';
import { Menubar } from '../menubar/Menubar';
import { Separator } from '../separator/Separator';

const { render, renderProps } = createRenderer();
function Popup(props: { children?: JSX.Element; keepMounted?: boolean; id?: string; anchor?: Menu.Positioner.Props['anchor'] }) {
  return <Menu.Portal keepMounted={props.keepMounted}><Menu.Positioner anchor={props.anchor}><Menu.Popup id={props.id}>{props.children}</Menu.Popup></Menu.Positioner></Menu.Portal>;
}

// Each invocation retains the source provider boundary and initial part props.
// Native callbacks replace React element cloning in the shared conformance suite.
describe('Menu plain part source conformance', () => {
  describe('Trigger', () => {
    describeConformance<Menu.Trigger.State, Menu.Trigger.Props, HTMLButtonElement>(props => <Menu.Root open><Menu.Trigger {...props} /></Menu.Root>, { initialProps: {}, refInstanceof: HTMLButtonElement, button: true });
  });
  describe('Item', () => {
    describeConformance<Menu.Item.State, Menu.Item.Props, HTMLDivElement>(props => <Menu.Root open><Menu.Item {...props} /></Menu.Root>, { initialProps: {}, refInstanceof: HTMLDivElement, button: true });
  });
  describe('LinkItem', () => {
    describeConformance<Menu.LinkItem.State, Menu.LinkItem.Props, HTMLAnchorElement>(props => <Menu.Root open><Menu.LinkItem {...props} /></Menu.Root>, { initialProps: {}, refInstanceof: HTMLAnchorElement });
  });
  describe('CheckboxItem', () => {
    describeConformance<Menu.CheckboxItem.State, Menu.CheckboxItem.Props, HTMLDivElement>(props => <Menu.Root open><Menu.CheckboxItem {...props} /></Menu.Root>, { initialProps: {}, refInstanceof: HTMLDivElement });
  });
  describe('RadioItem', () => {
    describeConformance<Menu.RadioItem.State, Menu.RadioItem.Props, HTMLDivElement>(props => <Menu.Root open><Menu.RadioGroup value="0"><Menu.RadioItem {...props} /></Menu.RadioGroup></Menu.Root>, { initialProps: { value: '0' }, refInstanceof: HTMLDivElement });
  });
  describe('CheckboxItemIndicator', () => {
    describeConformance<Menu.CheckboxItemIndicator.State, Menu.CheckboxItemIndicator.Props, HTMLSpanElement>(props => <Menu.Root open><Popup><Menu.CheckboxItem><Menu.CheckboxItemIndicator {...props} /></Menu.CheckboxItem></Popup></Menu.Root>, { initialProps: { keepMounted: true }, refInstanceof: HTMLSpanElement, click: 'dispatch' });
  });
  describe('RadioItemIndicator', () => {
    describeConformance<Menu.RadioItemIndicator.State, Menu.RadioItemIndicator.Props, HTMLSpanElement>(props => <Menu.Root open><Popup><Menu.RadioGroup><Menu.RadioItem value=""><Menu.RadioItemIndicator {...props} /></Menu.RadioItem></Menu.RadioGroup></Popup></Menu.Root>, { initialProps: { keepMounted: true }, refInstanceof: HTMLSpanElement, click: 'dispatch' });
  });
  describe('Arrow', () => {
    describeConformance<Menu.Arrow.State, Menu.Arrow.Props, HTMLDivElement>(props => <Menu.Root open><Popup><Menu.Arrow {...props} /></Popup></Menu.Root>, { initialProps: {}, refInstanceof: HTMLDivElement, click: 'dispatch' });
  });
  describe('Backdrop', () => {
    describeConformance<Menu.Backdrop.State, Menu.Backdrop.Props, HTMLDivElement>(props => <Menu.Root open><Menu.Backdrop {...props} /></Menu.Root>, { initialProps: {}, refInstanceof: HTMLDivElement });
  });
  describe('Portal', () => {
    describeConformance<Menu.Portal.State, Menu.Portal.Props, HTMLDivElement>(props => <Menu.Root><Menu.Portal {...props} /></Menu.Root>, { initialProps: { keepMounted: true }, refInstanceof: HTMLDivElement });
  });
  describe('Positioner', () => {
    describeConformance<Menu.Positioner.State, Menu.Positioner.Props, HTMLDivElement>(props => <Menu.Root open><Menu.Portal><Menu.Positioner {...props} /></Menu.Portal></Menu.Root>, { initialProps: {}, refInstanceof: HTMLDivElement });
  });
  describe('Popup', () => {
    describeConformance<Menu.Popup.State, Menu.Popup.Props, HTMLDivElement>(props => <Menu.Root open><Menu.Portal><Menu.Positioner><Menu.Popup {...props} /></Menu.Positioner></Menu.Portal></Menu.Root>, { initialProps: {}, refInstanceof: HTMLDivElement });
  });
  describe('List', () => {
    describeConformance<Menu.List.State, Menu.List.Props, HTMLDivElement>(props => <Menu.Root open><Popup><Menu.List {...props} /></Popup></Menu.Root>, { initialProps: {}, refInstanceof: HTMLDivElement });
  });
  describe('SubmenuTrigger', () => {
    describeConformance<Menu.SubmenuTrigger.State, Menu.SubmenuTrigger.Props, HTMLDivElement>(props => <Menu.Root open><Popup><Menu.SubmenuRoot><Menu.SubmenuTrigger {...props} /></Menu.SubmenuRoot></Popup></Menu.Root>, { initialProps: {}, refInstanceof: HTMLDivElement, button: true });
  });
  describe('Viewport', () => {
    describeConformance<Menu.Viewport.State, Menu.Viewport.Props, HTMLDivElement>(props => <Menu.Root open><Menu.Trigger>Trigger</Menu.Trigger><Popup><Menu.Viewport {...props} /></Popup></Menu.Root>, { initialProps: {}, refInstanceof: HTMLDivElement });
  });
});

popupConformanceTests({
  createComponent: props => <Menu.Root {...props.root}><Menu.Trigger {...props.trigger}>Open menu</Menu.Trigger><Menu.Portal {...props.portal}><Menu.Positioner><Menu.Popup {...props.popup}><Menu.Item>Item</Menu.Item></Menu.Popup></Menu.Positioner></Menu.Portal></Menu.Root>,
  triggerMouseAction: 'click', expectedPopupRole: 'menu', browserIssue: 'bsolid-browser',
});

describe('Menu filter part source conformance', () => {
  function FilterPopup(props: { children?: JSX.Element; query?: string; controlledQuery?: boolean; withInput?: boolean; inList?: boolean }) {
    return <Menu.FilterProvider defaultValue={props.query} value={props.controlledQuery ? props.query : undefined}><Menu.Root open><Popup>
      {props.withInput !== false && <Menu.Input aria-label="Filter" />}
      {props.inList ? <Menu.List>{props.children}</Menu.List> : props.children}
    </Popup></Menu.Root></Menu.FilterProvider>;
  }
  describe('Trigger', () => {
    describeConformance<Menu.Trigger.State, Menu.Trigger.Props, HTMLButtonElement>(props => <Menu.FilterProvider><Menu.Root><Menu.Trigger {...props} /></Menu.Root></Menu.FilterProvider>, { initialProps: {}, refInstanceof: HTMLButtonElement, button: true });
  });
  describe('Input', () => {
    describeConformance<Menu.Input.State, Menu.Input.Props, HTMLInputElement>(props => <FilterPopup withInput={false}><Menu.Input {...props} /></FilterPopup>, { initialProps: {}, refInstanceof: HTMLInputElement });
  });
  describe('Clear', () => {
    describeConformance<Menu.Clear.State, Menu.Clear.Props, HTMLButtonElement>(props => <FilterPopup query="query" controlledQuery><Menu.Clear {...props} /></FilterPopup>, { initialProps: {}, refInstanceof: HTMLButtonElement, button: true, click: 'dispatch' });
  });
  describe('Empty', () => {
    describeConformance<Menu.Empty.State, Menu.Empty.Props, HTMLDivElement>(props => <FilterPopup><Menu.Empty {...props} /></FilterPopup>, { initialProps: {}, refInstanceof: HTMLDivElement });
  });
  describe('List', () => {
    describeConformance<Menu.List.State, Menu.List.Props, HTMLDivElement>(props => <FilterPopup><Menu.List {...props} /></FilterPopup>, { initialProps: {}, refInstanceof: HTMLDivElement });
  });
  describe('Popup', () => {
    describeConformance<Menu.Popup.State, Menu.Popup.Props, HTMLDivElement>(props => <Menu.FilterProvider><Menu.Root open><Menu.Portal><Menu.Positioner><Menu.Popup {...props}><Menu.Input aria-label="Filter" /></Menu.Popup></Menu.Positioner></Menu.Portal></Menu.Root></Menu.FilterProvider>, { initialProps: {}, refInstanceof: HTMLDivElement });
  });
  describe('Item', () => {
    describeConformance<Menu.Item.State, Menu.Item.Props, HTMLDivElement>(props => <FilterPopup inList><Menu.Item {...props} /></FilterPopup>, { initialProps: {}, refInstanceof: HTMLDivElement, button: true });
  });
  describe('LinkItem', () => {
    describeConformance<Menu.LinkItem.State, Menu.LinkItem.Props, HTMLAnchorElement>(props => <FilterPopup inList><Menu.LinkItem {...props} /></FilterPopup>, { initialProps: { href: '#' }, refInstanceof: HTMLAnchorElement });
  });
  describe('CheckboxItem', () => {
    describeConformance<Menu.CheckboxItem.State, Menu.CheckboxItem.Props, HTMLDivElement>(props => <FilterPopup inList><Menu.CheckboxItem {...props} /></FilterPopup>, { initialProps: {}, refInstanceof: HTMLDivElement });
  });
  describe('RadioGroup', () => {
    describeConformance<Menu.RadioGroup.State, Menu.RadioGroup.Props, HTMLDivElement>(props => <FilterPopup inList><Menu.RadioGroup {...props}><Menu.RadioItem value="value" /></Menu.RadioGroup></FilterPopup>, { initialProps: {}, refInstanceof: HTMLDivElement });
  });
  describe('RadioItem', () => {
    describeConformance<Menu.RadioItem.State, Menu.RadioItem.Props, HTMLDivElement>(props => <FilterPopup inList><Menu.RadioGroup defaultValue="value"><Menu.RadioItem {...props} /></Menu.RadioGroup></FilterPopup>, { initialProps: { value: 'value' }, refInstanceof: HTMLDivElement });
  });
  describe('Group', () => {
    describeConformance<Menu.Group.State, Menu.Group.Props, HTMLDivElement>(props => <FilterPopup inList><Menu.Group {...props} /></FilterPopup>, { initialProps: {}, refInstanceof: HTMLDivElement, click: 'dispatch' });
  });
  describe('Arrow', () => {
    describeConformance<Menu.Arrow.State, Menu.Arrow.Props, HTMLDivElement>(props => <FilterPopup><Menu.Arrow {...props} /></FilterPopup>, { initialProps: {}, refInstanceof: HTMLDivElement, click: 'dispatch' });
  });
  describe('Backdrop', () => {
    describeConformance<Menu.Backdrop.State, Menu.Backdrop.Props, HTMLDivElement>(props => <Menu.FilterProvider><Menu.Root open><Menu.Portal><Menu.Backdrop {...props} /><Menu.Positioner><Menu.Popup><Menu.Input aria-label="Filter" /></Menu.Popup></Menu.Positioner></Menu.Portal></Menu.Root></Menu.FilterProvider>, { initialProps: {}, refInstanceof: HTMLDivElement });
  });
  describe('Separator', () => {
    describeConformance<Separator.State, Separator.Props, HTMLDivElement>(props => <FilterPopup inList><Menu.Separator {...props} /></FilterPopup>, { initialProps: {}, refInstanceof: HTMLDivElement });
  });
  describe('SubmenuTrigger', () => {
    describeConformance<Menu.SubmenuTrigger.State, Menu.SubmenuTrigger.Props, HTMLDivElement>(props => <FilterPopup inList><Menu.FilterProvider><Menu.SubmenuRoot><Menu.SubmenuTrigger {...props} /></Menu.SubmenuRoot></Menu.FilterProvider></FilterPopup>, { initialProps: {}, refInstanceof: HTMLDivElement, button: true });
  });
});

describe('Menu source-first root and host regressions', () => {
  it('popup aria-label overrides its trigger label', async () => {
    await render(() => <Menu.Root open><Menu.Trigger>Actions</Menu.Trigger><Menu.Portal><Menu.Positioner><Menu.Popup aria-label="Commands" /></Menu.Positioner></Menu.Portal></Menu.Root>);
    expect(screen.getByRole('menu', { name: 'Commands' })).not.toHaveAttribute('aria-labelledby');
  });
  it('popup render callback supplies aria-labelledby', async () => {
    await render(() => <Menu.Root open><span id="commands-label">Commands</span><Menu.Portal><Menu.Positioner><Menu.Popup render={props => <section {...props} aria-labelledby="commands-label" />} /></Menu.Positioner></Menu.Portal></Menu.Root>);
    expect(screen.getByRole('menu', { name: 'Commands' })).toHaveAttribute('aria-labelledby', 'commands-label');
  });
  it('arrow entry from custom popup content restarts at the list boundary', async () => {
    const view = await render(() => <Menu.Root><Menu.Trigger>Open</Menu.Trigger><Popup><button type="button">Custom</button><Menu.Item>One</Menu.Item><Menu.Item>Two</Menu.Item><Menu.Item>Three</Menu.Item></Popup></Menu.Root>);
    await view.user.click(screen.getByRole('button', { name: 'Open' }));
    const one = await screen.findByRole('menuitem', { name: 'One' }); one.focus();
    await view.user.keyboard('{ArrowDown}');
    await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Two' })).toHaveFocus());
    screen.getByRole('button', { name: 'Custom' }).focus();
    await view.user.keyboard('{ArrowDown}');
    await waitFor(() => expect(one).toHaveFocus());
  });
  it.each(['default', 'element', 'accessor', 'false', 'true', 'null'] as const)('popup finalFocus resolves %s on item close', async mode => {
    let input: HTMLInputElement | undefined;
    const view = await render(() => <><Menu.Root><Menu.Trigger>Open</Menu.Trigger><Menu.Portal><Menu.Positioner><Menu.Popup
      finalFocus={mode === 'default' ? undefined : mode === 'element' || mode === 'accessor' ? () => input ?? null : mode === 'false' ? false : mode === 'true' ? () => true : () => null}
    ><Menu.Item>Close</Menu.Item></Menu.Popup></Menu.Positioner></Menu.Portal></Menu.Root><input data-testid="input-to-focus" ref={node => { input = node; }} /></>);
    const trigger = screen.getByRole('button', { name: 'Open' });
    await view.user.click(trigger);
    await view.user.click(await screen.findByRole('menuitem', { name: 'Close' }));
    if (mode === 'element' || mode === 'accessor') await waitFor(() => expect(input).toHaveFocus());
    else if (mode === 'false') await waitFor(() => expect(trigger).not.toHaveFocus());
    else await waitFor(() => expect(trigger).toHaveFocus());
  });
  sourceCase({ source: 'packages/react/src/menu/root/MenuRoot.test.tsx', case: 'onOpenChange cancel() prevents opening while uncontrolled', environment: 'jsdom' }, async () => {
    const change = vi.fn((_: boolean, details: MenuRoot.ChangeEventDetails) => details.cancel());
    const view = await render(() => <Menu.Root onOpenChange={change}><Menu.Trigger>Open</Menu.Trigger><Popup><Menu.Item>Copy</Menu.Item></Popup></Menu.Root>);
    await view.user.click(screen.getByRole('button'));
    await waitFor(() => expect(change).toHaveBeenCalled());
    expect(screen.queryByRole('menu')).toBeNull();
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false');
  });

  it('reads the current close callback and retains the actual closing trigger', async () => {
    const first = vi.fn();
    const current = vi.fn((_: boolean, details: MenuRoot.ChangeEventDetails) => details.cancel());
    const view = await renderProps((props: { changed: typeof current }) => <Menu.Root defaultOpen onOpenChange={props.changed}><Menu.Trigger>Open</Menu.Trigger><Popup><Menu.Item>Copy</Menu.Item></Popup></Menu.Root>, { changed: first });
    const trigger = screen.getByRole('button', { name: 'Open' });
    const popup = screen.getByRole('menu');
    await view.setProps({ changed: current });
    popup.focus();
    await view.user.keyboard('{Escape}');
    expect(first.mock.calls.length).toBe(0);
    expect(current).toHaveBeenCalledTimes(1);
    const [next, details] = current.mock.calls[0]!;
    expect(next).toBe(false); expect(details.reason).toBe('escape-key'); expect(details.isCanceled).toBe(true);
    expect(details.trigger === trigger).toBe(true);
    expect(screen.getByRole('menu') === popup).toBe(true);
  });

  sourceCase({ source: 'packages/react/src/menu/list/MenuList.test.tsx', case: 'takes the menu role and label from the popup / live list id', environment: 'jsdom' }, async () => {
    const view = await renderProps((props: { id: string }) => <Menu.Root defaultOpen><Menu.Trigger>Actions</Menu.Trigger><Popup><Menu.List id={props.id}><Menu.Item>Copy</Menu.Item></Menu.List></Popup></Menu.Root>, { id: 'first-list' });
    const list = screen.getByRole('menu', { name: 'Actions' });
    expect(list.parentElement).toHaveAttribute('role', 'presentation');
    expect(list).toHaveAttribute('tabindex', '-1');
    expect(screen.getByRole('button', { name: 'Actions' })).toHaveAttribute('aria-controls', 'first-list');
    await view.setProps({ id: 'second-list' });
    await waitFor(() => expect(screen.getByRole('button', { name: 'Actions' })).toHaveAttribute('aria-controls', 'second-list'));
    expect(screen.getByRole('menu') === list).toBe(true);
  });

  it('observes a popup id supplied and changed by its native render callback', async () => {
    const view = await renderProps((props: { id: string }) => <Menu.Root defaultOpen><Menu.Trigger>Actions</Menu.Trigger><Menu.Portal><Menu.Positioner><Menu.Popup render={attributes => <section {...attributes} id={props.id}><Menu.Item>Copy</Menu.Item></section>} /></Menu.Positioner></Menu.Portal></Menu.Root>, { id: 'render-popup' });
    const popup = screen.getByRole('menu');
    expect(screen.getByRole('button', { name: 'Actions' })).toHaveAttribute('aria-controls', 'render-popup');
    await view.setProps({ id: 'render-popup-next' });
    await waitFor(() => expect(screen.getByRole('button', { name: 'Actions' }).getAttribute('aria-controls')).toBe('render-popup-next'));
    expect(screen.getByRole('menu') === popup).toBe(true);
  });

  sourceCase({ source: 'packages/react/src/menu/popup/MenuPopup.test.tsx', case: 'stops toolbar navigation keys without blocking ordinary key events', environment: 'jsdom' }, async () => {
    const parent = vi.fn();
    await render(() => <ToolbarRootContext value={{ disabled: false, orientation: 'horizontal' }}><div onKeyDown={parent}><Menu.Root><Menu.Portal keepMounted><Menu.Positioner><Menu.Popup data-testid="popup" /></Menu.Positioner></Menu.Portal></Menu.Root></div></ToolbarRootContext>);
    fireEvent.keyDown(screen.getByTestId('popup'), { key: 'ArrowRight' });
    expect(parent.mock.calls.length).toBe(0);
    fireEvent.keyDown(screen.getByTestId('popup'), { key: 'F1' });
    expect(parent).toHaveBeenCalledOnce();
    expect(parent.mock.calls.every(([event]) => event.key === 'F1')).toBe(true);
  });

  it('uses the exact Separator alias', () => { expect(Menu.Separator).toBe(Separator); });

  it('publishes context-menu host refs and releases them on disposal', async () => {
    const host: ContextMenuRootContext = {
      anchor: { getBoundingClientRect: () => new DOMRect(40, 50, 0, 0) }, setAnchor() {},
      rootId: 'context-owner', backdropRef: { current: null }, internalBackdropRef: { current: null },
      actionsRef: { current: null }, positionerRef: { current: null }, allowMouseUpTriggerRef: { current: true }, initialCursorPointRef: { current: null },
    };
    const view = await render(() => <ContextMenuRootContext value={host}><Menu.Root defaultOpen><Menu.Portal><Menu.Backdrop /><Menu.Positioner><Menu.Popup><Menu.Item>Copy</Menu.Item></Menu.Popup></Menu.Positioner></Menu.Portal></Menu.Root></ContextMenuRootContext>);
    expect(host.actionsRef.current).not.toBeNull();
    expect(host.positionerRef.current).toContainElement(screen.getByRole('menu'));
    expect(host.positionerRef.current).toHaveStyle({ position: 'fixed' });
    expect(host.backdropRef.current).toHaveAttribute('role', 'presentation');
    expect(host.internalBackdropRef.current).not.toBeNull();
    expect(screen.getByRole('menu')).toHaveAttribute('data-rootownerid', 'context-owner');
    view.unmount();
    for (const ref of [host.actionsRef, host.positionerRef, host.backdropRef, host.internalBackdropRef]) expect(ref.current).toBeNull();
  });

  it('keeps Menubar host disabled state live in contained triggers', async () => {
    const view = await renderProps((props: { disabled: boolean }) => <Menubar disabled={props.disabled} modal={false}><Menu.Root><Menu.Trigger>File</Menu.Trigger><Popup><Menu.Item>Copy</Menu.Item></Popup></Menu.Root></Menubar>, { disabled: true });
    expect(screen.getByRole('menuitem', { name: 'File' })).toHaveAttribute('data-disabled');
    await view.setProps({ disabled: false });
    expect(screen.getByRole('menuitem', { name: 'File' })).not.toHaveAttribute('data-disabled');
  });
});

describe('Menu source-first item selection and indicators', () => {
  it.each([true, false])('controlled checkbox publishes both state attributes (checked=%s)', async checked => {
    const view = await render(() => <Menu.Root><Menu.Trigger>Open</Menu.Trigger><Popup><Menu.CheckboxItem checked={checked}>Item</Menu.CheckboxItem></Popup></Menu.Root>);
    await view.user.click(screen.getByRole('button', { name: 'Open' }));
    const item = await screen.findByRole('menuitemcheckbox');
    expect(item).toHaveAttribute('aria-checked', String(checked));
    expect(item).toHaveAttribute(checked ? 'data-checked' : 'data-unchecked', '');
  });

  it('checkbox clicks notify exactly once per toggle and retain the menu', async () => {
    const changed = vi.fn();
    const view = await render(() => <Menu.Root><Menu.Trigger>Open</Menu.Trigger><Popup><Menu.CheckboxItem onCheckedChange={changed}>Item</Menu.CheckboxItem></Popup></Menu.Root>);
    await view.user.click(screen.getByRole('button', { name: 'Open' }));
    const item = await screen.findByRole('menuitemcheckbox');
    await view.user.click(item);
    expect(changed).toHaveBeenCalledTimes(1);
    expect(changed.mock.lastCall?.[0]).toBe(true);
    expect(item).toHaveAttribute('aria-checked', 'true');
    expect(item).toHaveAttribute('data-checked', '');
    expect(screen.getByRole('menu')).toBeInTheDocument();
    await view.user.click(item);
    expect(changed).toHaveBeenCalledTimes(2);
    expect(changed.mock.lastCall?.[0]).toBe(false);
    expect(item).toHaveAttribute('aria-checked', 'false');
    expect(item).toHaveAttribute('data-unchecked', '');
  });

  it('checkbox Space toggles twice after ArrowDown opening', async () => {
    const view = await render(() => <Menu.Root><Menu.Trigger>Open</Menu.Trigger><Popup><Menu.CheckboxItem>Item</Menu.CheckboxItem></Popup></Menu.Root>);
    screen.getByRole('button', { name: 'Open' }).focus();
    await view.user.keyboard('{ArrowDown}');
    const item = screen.getByRole('menuitemcheckbox');
    await waitFor(() => expect(item).toHaveFocus());
    await view.user.keyboard(' ');
    expect(item).toHaveAttribute('data-checked', '');
    await view.user.keyboard(' ');
    expect(item).toHaveAttribute('data-unchecked', '');
  });

  it('closing during checkbox typeahead clears it before the next Space activation', async () => {
    const view = await render(() => <Menu.Root><Menu.Trigger>Open</Menu.Trigger><Popup><Menu.CheckboxItem>Settings</Menu.CheckboxItem></Popup></Menu.Root>);
    const trigger = screen.getByRole('button', { name: 'Open' });
    trigger.focus();
    await view.user.keyboard('{Enter}');
    await waitFor(() => expect(screen.getByRole('menuitemcheckbox')).toHaveFocus());
    await view.user.keyboard('s{Escape}');
    await waitFor(() => expect(trigger).toHaveFocus());
    await view.user.keyboard('{Enter}');
    const item = screen.getByRole('menuitemcheckbox');
    await waitFor(() => expect(item).toHaveFocus());
    expect(item).toHaveAttribute('aria-checked', 'false');
    await view.user.keyboard(' ');
    expect(item).toHaveAttribute('aria-checked', 'true');
  });

  it('radio click reports the numeric value and publishes selected attributes', async () => {
    const changed = vi.fn();
    const view = await render(() => <Menu.Root><Menu.Trigger>Open</Menu.Trigger><Popup><Menu.RadioGroup defaultValue={0} onValueChange={changed}><Menu.RadioItem value={1}>Item</Menu.RadioItem></Menu.RadioGroup></Popup></Menu.Root>);
    await view.user.click(screen.getByRole('button', { name: 'Open' }));
    const item = await screen.findByRole('menuitemradio');
    await view.user.click(item);
    expect(changed).toHaveBeenCalledTimes(1);
    expect(changed.mock.lastCall?.[0]).toBe(1);
    expect(item).toHaveAttribute('aria-checked', 'true');
    expect(item).toHaveAttribute('data-checked', '');
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });
  it('radio Space selects after ArrowDown opening', async () => {
    const view = await render(() => <Menu.Root><Menu.Trigger>Open</Menu.Trigger><Menu.Portal><Menu.Positioner><Menu.RadioGroup defaultValue={0}><Menu.RadioItem value={1}>Item</Menu.RadioItem></Menu.RadioGroup></Menu.Positioner></Menu.Portal></Menu.Root>);
    screen.getByRole('button', { name: 'Open' }).focus();
    await view.user.keyboard('{ArrowDown}');
    const item = screen.getByRole('menuitemradio');
    await waitFor(() => expect(item).toHaveFocus());
    await view.user.keyboard(' ');
    expect(item).toHaveAttribute('data-checked', '');
  });

  it.each(['checkbox', 'radio'] as const)('kept-mounted %s selection survives trigger close and reopen', async kind => {
    const view = await render(() => <Menu.Root modal={false}><Menu.Trigger>Open</Menu.Trigger><Popup keepMounted>{kind === 'checkbox'
      ? <Menu.CheckboxItem>Item</Menu.CheckboxItem>
      : <Menu.RadioGroup defaultValue={0}><Menu.RadioItem value={1}>Item</Menu.RadioItem></Menu.RadioGroup>}
    </Popup></Menu.Root>);
    const trigger = screen.getByRole('button', { name: 'Open' });
    await view.user.click(trigger);
    const item = await screen.findByRole(kind === 'checkbox' ? 'menuitemcheckbox' : 'menuitemradio');
    await view.user.click(item);
    await view.user.click(trigger);
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
    await view.user.click(trigger);
    const reopened = await screen.findByRole(kind === 'checkbox' ? 'menuitemcheckbox' : 'menuitemradio');
    expect(reopened).toHaveAttribute('aria-checked', 'true');
    expect(reopened).toHaveAttribute('data-checked', '');
  });

  it.each(['item', 'checkbox', 'radio-group', 'radio-item'] as const)('disabled %s suppresses activation and consumer key handlers', async kind => {
    const click = vi.fn(), down = vi.fn(), up = vi.fn(), changed = vi.fn();
    const view = await render(() => <Menu.Root open><Popup>{kind === 'item'
      ? <Menu.Item disabled onClick={click} onKeyDown={down} onKeyUp={up}>One</Menu.Item>
      : kind === 'checkbox'
        ? <Menu.CheckboxItem disabled onClick={click} onKeyDown={down} onKeyUp={up} onCheckedChange={changed}>One</Menu.CheckboxItem>
        : <Menu.RadioGroup disabled={kind === 'radio-group'} defaultValue={0} onValueChange={changed}>
          <Menu.RadioItem value="one" disabled={kind === 'radio-item'} onClick={click} onKeyDown={down} onKeyUp={up}>One</Menu.RadioItem>
          <Menu.RadioItem value="two" onClick={click} onKeyDown={down} onKeyUp={up}>Two</Menu.RadioItem>
        </Menu.RadioGroup>}
    </Popup></Menu.Root>);
    const role = kind === 'item' ? 'menuitem' : kind === 'checkbox' ? 'menuitemcheckbox' : 'menuitemradio';
    const item = screen.getByRole(role, { name: 'One' });
    item.focus();
    expect(item).toHaveFocus();
    expect(item).toHaveAttribute('data-disabled');
    fireEvent.keyDown(item, { key: 'Enter' });
    expect(down).not.toHaveBeenCalled(); expect(click).not.toHaveBeenCalled(); expect(changed).not.toHaveBeenCalled();
    fireEvent.keyUp(item, { key: 'Space' });
    expect(up).not.toHaveBeenCalled(); expect(click).not.toHaveBeenCalled(); expect(changed).not.toHaveBeenCalled();
    fireEvent.click(item);
    expect(down).not.toHaveBeenCalled(); expect(up).not.toHaveBeenCalled(); expect(click).not.toHaveBeenCalled(); expect(changed).not.toHaveBeenCalled();
    if (kind === 'radio-group' || kind === 'radio-item') {
      const second = screen.getByRole('menuitemradio', { name: 'Two' });
      expect(second.hasAttribute('data-disabled')).toBe(kind === 'radio-group');
      await view.user.keyboard('{ArrowDown}');
      await waitFor(() => expect(second).toHaveFocus());
      down.mockClear();
      fireEvent.keyDown(second, { key: 'Enter' });
      if (kind === 'radio-item') {
        expect(down).toHaveBeenCalledTimes(1); expect(click).toHaveBeenCalledTimes(1); expect(changed).toHaveBeenCalledTimes(1);
        expect(changed.mock.calls[0][0]).toBe('two');
        await view.user.keyboard('{ArrowDown}');
        await waitFor(() => expect(item).toHaveFocus());
      } else {
        expect(down).not.toHaveBeenCalled(); expect(click).not.toHaveBeenCalled(); expect(changed).not.toHaveBeenCalled();
        fireEvent.keyUp(second, { key: 'Space' }); fireEvent.click(second);
        expect(up).not.toHaveBeenCalled(); expect(click).not.toHaveBeenCalled(); expect(changed).not.toHaveBeenCalled();
      }
    }
  });

  it('native disabled button items are skipped in both navigation directions', async () => {
    const view = await render(() => <Menu.Root open><Popup><Menu.Item>1</Menu.Item><Menu.Item nativeButton render={props => <button {...props} type="button" disabled />}>2</Menu.Item><Menu.Item>3</Menu.Item></Popup></Menu.Root>);
    const first = screen.getByRole('menuitem', { name: '1' }), last = screen.getByRole('menuitem', { name: '3' });
    first.focus();
    await view.user.keyboard('{ArrowDown}');
    await waitFor(() => expect(last).toHaveFocus());
    await view.user.keyboard('{ArrowUp}');
    await waitFor(() => expect(first).toHaveFocus());
  });

  it('accumulates same-turn uncontrolled checkbox proposals, with fresh callbacks', async () => {
    const first = vi.fn(); const changed = vi.fn();
    const view = await renderProps((props: { changed: (value: boolean, details: MenuRoot.ChangeEventDetails) => void }) => <Menu.Root open><Menu.CheckboxItem onCheckedChange={props.changed}>Flag<Menu.CheckboxItemIndicator data-testid="indicator" /></Menu.CheckboxItem></Menu.Root>, { changed: first });
    const item = screen.getByRole('menuitemcheckbox');
    await view.setProps({ changed });
    fireEvent.click(item); fireEvent.click(item);
    await waitFor(() => expect(changed).toHaveBeenCalledTimes(2));
    expect(changed.mock.calls.map(call => call[0])).toEqual([true, false]);
    expect(item).toHaveAttribute('aria-checked', 'false');
    expect(first).not.toHaveBeenCalled();
  });

  it.each(['checkbox', 'radio'] as const)('consumer Base UI prevention cancels %s activation before selection', async mode => {
    const changed = vi.fn();
    const view = await render(() => <Menu.Root open>{mode === 'checkbox' ? <Menu.CheckboxItem onClick={event => event.preventBaseUIHandler()} onCheckedChange={changed}>Flag</Menu.CheckboxItem> : <Menu.RadioGroup onValueChange={changed}><Menu.RadioItem value="a" onClick={event => event.preventBaseUIHandler()}>A</Menu.RadioItem></Menu.RadioGroup>}</Menu.Root>);
    await view.user.click(screen.getByRole(mode === 'checkbox' ? 'menuitemcheckbox' : 'menuitemradio'));
    expect(changed).not.toHaveBeenCalled();
    expect(screen.getByRole(mode === 'checkbox' ? 'menuitemcheckbox' : 'menuitemradio')).toHaveAttribute('aria-checked', 'false');
  });

  it('does not change a controlled checkbox until the consumer commits the prop', async () => {
    const changed = vi.fn();
    const view = await renderProps((props: { checked: boolean }) => <Menu.Root open><Menu.CheckboxItem checked={props.checked} onCheckedChange={changed}>Flag<Menu.CheckboxItemIndicator keepMounted data-testid="indicator" /></Menu.CheckboxItem></Menu.Root>, { checked: false });
    const item = screen.getByRole('menuitemcheckbox');
    await view.user.click(item);
    expect(changed).toHaveBeenCalledWith(true, expect.objectContaining({ reason: 'item-press' }));
    expect(item).toHaveAttribute('aria-checked', 'false');
    await view.setProps({ checked: true });
    expect(screen.getByRole('menuitemcheckbox')).toBe(item);
    expect(screen.getByTestId('indicator')).toHaveAttribute('data-checked');
    expect(screen.getByTestId('indicator')).toHaveAttribute('aria-hidden', 'true');
  });

  sourceCase({ source: 'packages/react/src/menu/radio-item/MenuRadioItem.test.tsx', case: 'group cancellation and identity-based radio values', environment: 'jsdom' }, async () => {
    const a = {}; const b = {}; const changed = vi.fn((_: unknown, details: MenuRoot.ChangeEventDetails) => details.cancel());
    const view = await render(() => <Menu.Root open><Menu.RadioGroup defaultValue={a} onValueChange={changed}><Menu.GroupLabel>Choice</Menu.GroupLabel><Menu.RadioItem value={a}>A</Menu.RadioItem><Menu.RadioItem value={b}>B</Menu.RadioItem></Menu.RadioGroup></Menu.Root>);
    await view.user.click(screen.getByRole('menuitemradio', { name: 'B' }));
    expect(changed).toHaveBeenCalledWith(b, expect.objectContaining({ reason: 'item-press', isCanceled: true }));
    expect(screen.getByRole('menuitemradio', { name: 'A' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('group', { name: 'Choice' })).toContainElement(screen.getByRole('menuitemradio', { name: 'B' }));
  });

  it('preserves native link modifiers and default prevention independently', async () => {
    const clicked = vi.fn();
    await render(() => <Menu.Root open><Menu.LinkItem href="#details" target="_blank" onClick={clicked}>Docs</Menu.LinkItem></Menu.Root>);
    const item = screen.getByRole('menuitem');
    const event = new MouseEvent('click', { bubbles: true, cancelable: true, ctrlKey: true, metaKey: true, shiftKey: true });
    fireEvent(item, event);
    expect(clicked).toHaveBeenCalledWith(expect.objectContaining({ ctrlKey: true, metaKey: true, shiftKey: true }));
    expect(event.defaultPrevented).toBe(false);
    expect(item.tagName).toBe('A');
    expect(item).toHaveAttribute('target', '_blank');
    expect(item).toHaveAttribute('tabindex', '-1');
  });

  it('checkbox selection cancellation is independent of closeOnClick and preserves callback order', async () => {
    const order: string[] = [];
    const view = await render(() => <Menu.Root defaultOpen onOpenChange={() => { order.push('open'); }}><Popup><Menu.CheckboxItem closeOnClick onClick={() => { order.push('consumer'); }} onCheckedChange={(_value, details) => { order.push('checked'); details.cancel(); }}>Flag</Menu.CheckboxItem></Popup></Menu.Root>);
    await view.user.click(screen.getByRole('menuitemcheckbox'));
    expect(order).toEqual(['consumer', 'checked', 'open']);
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
  });
});

describe('Menu source-first nested navigation', () => {
  it.each(['ltr', 'rtl'] as const)('triggerless nested Escape stays local (%s)', async direction => {
    const changed = vi.fn();
    const view = await render(() => <DirectionProvider direction={direction}><Menu.Root defaultOpen modal={false} onOpenChange={changed}><Popup anchor={() => document.body}><Menu.SubmenuRoot><Menu.SubmenuTrigger openOnHover={false}>More</Menu.SubmenuTrigger><Popup><Menu.Item>Leaf</Menu.Item></Popup></Menu.SubmenuRoot></Popup></Menu.Root></DirectionProvider>);
    const trigger = screen.getByRole('menuitem', { name: 'More' });
    trigger.focus();
    await view.user.keyboard(direction === 'rtl' ? '{ArrowLeft}' : '{ArrowRight}');
    await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Leaf' })).toHaveFocus());
    await view.user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('menuitem', { name: 'Leaf' })).toBeNull());
    await waitFor(() => expect(trigger).toHaveFocus());
    expect(changed).not.toHaveBeenCalled();
    expect(screen.getByRole('menu')).toHaveAttribute('data-open');
  });

  it('a canceled cross-axis close retains the child while returning focus as in source', async () => {
    const view = await render(() => <Menu.Root defaultOpen modal={false}><Popup><Menu.SubmenuRoot defaultOpen onOpenChange={(next, details) => { if (!next) details.cancel(); }}><Menu.SubmenuTrigger openOnHover={false}>More</Menu.SubmenuTrigger><Popup><Menu.Item>Leaf</Menu.Item></Popup></Menu.SubmenuRoot></Popup></Menu.Root>);
    const leaf = screen.getByRole('menuitem', { name: 'Leaf' }); leaf.focus();
    await view.user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('menuitem', { name: 'More' })).toHaveFocus();
    expect(screen.getAllByRole('menu')).toHaveLength(2);
  });
});

describe('Menu source-first scoped filtering', () => {
  it('replays navigation and Enter from items holding real screen-reader focus', async () => {
    const clicked = vi.fn();
    const view = await render(() => <Menu.FilterProvider><Menu.Root defaultOpen><Menu.Trigger>Actions</Menu.Trigger><Popup><Menu.Input aria-label="Filter actions" /><Menu.List><Menu.Item>Rename</Menu.Item><Menu.Item onClick={clicked}>Delete</Menu.Item></Menu.List></Popup></Menu.Root></Menu.FilterProvider>);
    const input = screen.getByRole('searchbox');
    await waitFor(() => expect(input).toHaveFocus());
    await view.user.keyboard('{ArrowDown}');
    const rename = screen.getByRole('menuitem', { name: 'Rename' }), del = screen.getByRole('menuitem', { name: 'Delete' });
    expect(input).toHaveAttribute('aria-activedescendant', rename.id);
    rename.focus();
    await view.user.keyboard('{ArrowDown}');
    await waitFor(() => expect(input).toHaveAttribute('aria-activedescendant', del.id));
    expect(input).toHaveFocus();
    del.focus();
    await view.user.keyboard('{Enter}');
    expect(clicked).toHaveBeenCalledTimes(1);
    expect(input).toHaveValue('');
  });
  it.each([false, 'always'] as const)('real item-to-input focus return honors autoHighlight=%s', async autoHighlight => {
    const view = await render(() => <Menu.FilterProvider autoHighlight={autoHighlight}><Menu.Root defaultOpen><Popup><Menu.Input aria-label="Query" /><Menu.List><Menu.Item>Rename</Menu.Item><Menu.Item>Delete</Menu.Item></Menu.List></Popup></Menu.Root></Menu.FilterProvider>);
    const input = screen.getByRole('searchbox'), rename = screen.getByRole('menuitem', { name: 'Rename' });
    await waitFor(() => expect(input).toHaveFocus());
    if (!autoHighlight) await view.user.keyboard('{ArrowDown}');
    await waitFor(() => expect(input).toHaveAttribute('aria-activedescendant', rename.id));
    rename.focus(); input.focus();
    if (autoHighlight) expect(input).toHaveAttribute('aria-activedescendant', rename.id);
    else {
      await waitFor(() => expect(input).not.toHaveAttribute('aria-activedescendant'));
      expect(rename).not.toHaveAttribute('data-highlighted');
    }
  });
  it('focused list replays navigation, commits Enter and preserves typing defaults', async () => {
    const clicked = vi.fn();
    const view = await render(() => <Menu.FilterProvider><Menu.Root defaultOpen><Menu.Trigger>Fruit</Menu.Trigger><Popup><Menu.Input aria-label="Filter fruit" /><Menu.List><Menu.Item closeOnClick={false} onClick={clicked}>Apple</Menu.Item><Menu.Item>Banana</Menu.Item></Menu.List></Popup></Menu.Root></Menu.FilterProvider>);
    const input = screen.getByRole('searchbox'), list = screen.getByRole('menu'), apple = screen.getByRole('menuitem', { name: 'Apple' });
    await waitFor(() => expect(input).toHaveFocus());
    input.blur(); list.focus(); expect(list).toHaveFocus();
    expect(fireEvent.keyDown(list, { key: 'ArrowDown' })).toBe(false);
    await waitFor(() => expect(input).toHaveAttribute('aria-activedescendant', apple.id));
    expect(input).toHaveFocus();
    input.blur(); list.focus(); fireEvent.keyDown(list, { key: 'Enter' });
    expect(clicked).toHaveBeenCalledTimes(1);
    input.blur(); list.focus();
    expect(fireEvent.keyDown(list, { key: 'z' })).toBe(true);
    expect(input).toHaveFocus();
    input.blur(); list.focus(); fireEvent.keyDown(list, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });
  it.each([
    ['vertical', 'ltr', 'ArrowLeft'], ['vertical', 'rtl', 'ArrowRight'],
    ['horizontal', 'ltr', 'ArrowUp'], ['horizontal', 'rtl', 'ArrowUp'],
  ] as const)('custom filtered popup content returns input focus with %s %s %s', async (orientation, direction, key) => {
    await render(() => <DirectionProvider direction={direction}><Menu.FilterProvider><Menu.Root defaultOpen orientation={orientation}><Popup><Menu.Input aria-label="Query" /><button type="button">Extra action</button><Menu.List><Menu.Item>Rename</Menu.Item></Menu.List></Popup></Menu.Root></Menu.FilterProvider></DirectionProvider>);
    const action = screen.getByRole('button', { name: 'Extra action' }); action.focus();
    expect(action).toHaveFocus();
    fireEvent.keyDown(action, { key });
    expect(screen.getByRole('searchbox')).toHaveFocus();
  });
  it('controlled query refusal preserves the value without cancellation', async () => {
    const changed = vi.fn();
    const view = await render(() => <Menu.FilterProvider value="dup" onValueChange={changed}><Menu.Root open><Menu.Trigger>Actions</Menu.Trigger><Popup><Menu.Input aria-label="Query" /><Menu.List><Menu.Item>Rename</Menu.Item><Menu.Item>Delete</Menu.Item><Menu.Item>Duplicate</Menu.Item></Menu.List></Popup></Menu.Root></Menu.FilterProvider>);
    const input = screen.getByRole('searchbox');
    expect(input).toHaveValue('dup'); expect(screen.getAllByRole('menuitem')).toHaveLength(1);
    await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Duplicate' })).toBeVisible());
    input.focus();
    await view.user.type(input, 'x');
    expect(changed).toHaveBeenCalledWith('dupx', expect.anything());
    expect(input).toHaveValue('dup');
  });
  it('uses Turkish locale for the default filter', async () => {
    await render(() => <Menu.FilterProvider defaultValue="ı" locale="tr"><Menu.Root open><Menu.Trigger>Actions</Menu.Trigger><Popup><Menu.Input aria-label="Query" /><Menu.List><Menu.Item>Istanbul</Menu.Item></Menu.List></Popup></Menu.Root></Menu.FilterProvider>);
    await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Istanbul' })).toBeVisible());
  });
  it('the trigger controls the labelled dialog while the input controls the list', async () => {
    await render(() => <Menu.FilterProvider><Menu.Root defaultOpen><Menu.Trigger>Actions</Menu.Trigger><Popup id="filter-dialog"><Menu.Input aria-label="Query" /><Menu.List id="filter-list"><Menu.Item>Copy</Menu.Item></Menu.List></Popup></Menu.Root></Menu.FilterProvider>);
    expect(screen.getByRole('dialog', { name: 'Actions' })).toHaveAttribute('id', 'filter-dialog');
    expect(screen.getByRole('button', { name: 'Actions' })).toHaveAttribute('aria-haspopup', 'dialog');
    expect(screen.getByRole('button', { name: 'Actions' })).toHaveAttribute('aria-controls', 'filter-dialog');
    expect(screen.getByRole('searchbox')).toHaveAttribute('aria-controls', 'filter-list');
    expect(screen.getByRole('menu', { name: 'Actions' })).toHaveAttribute('id', 'filter-list');
  });

  it.each([false, true, 'always'] as const)('query filtering, Clear and empty state use autoHighlight=%s', async autoHighlight => {
    const view = await render(() => <Menu.FilterProvider autoHighlight={autoHighlight}><Menu.Root defaultOpen><Menu.Trigger>Actions</Menu.Trigger><Popup><Menu.Input aria-label="Query" /><Menu.Clear aria-label="Clear" /><Menu.List><Menu.Item>Rename</Menu.Item><Menu.Item>Delete</Menu.Item></Menu.List><Menu.Empty>No results</Menu.Empty></Popup></Menu.Root></Menu.FilterProvider>);
    const input = screen.getByRole('searchbox');
    await view.user.type(input, 'del');
    const item = screen.getByRole('menuitem', { name: 'Delete' });
    expect(screen.queryByRole('menuitem', { name: 'Rename' })).toBeNull();
    if (autoHighlight) await waitFor(() => expect(input).toHaveAttribute('aria-activedescendant', item.id));
    else expect(input).not.toHaveAttribute('aria-activedescendant');
    const clear = screen.getByLabelText('Clear');
    expect(clear).toHaveAttribute('tabindex', '-1'); expect(clear).toHaveAttribute('aria-hidden', 'true');
    await view.user.click(clear);
    expect(input).toHaveValue(''); expect(input).toHaveFocus();
    await view.user.type(input, 'zzz');
    expect(screen.queryAllByRole('menuitem')).toHaveLength(0);
    expect(screen.getByRole('status')).toHaveTextContent('No results');
  });

  it('a canceled controlled query leaves value and results unchanged', async () => {
    const changed = vi.fn((_: string, details: Menu.FilterProvider.ChangeEventDetails) => details.cancel());
    const view = await render(() => <Menu.FilterProvider value="del" onValueChange={changed}><Menu.Root defaultOpen><Popup><Menu.Input aria-label="Query" /><Menu.List><Menu.Item>Rename</Menu.Item><Menu.Item>Delete</Menu.Item></Menu.List></Popup></Menu.Root></Menu.FilterProvider>);
    const input = screen.getByRole('searchbox');
    await view.user.type(input, 'x');
    expect(changed).toHaveBeenCalledWith('delx', expect.objectContaining({ isCanceled: true }));
    expect(input).toHaveValue('del'); expect(screen.getByRole('menuitem')).toHaveTextContent('Delete');
  });

  it('keeps groups mounted but hides their labels with nonmatching radio items', async () => {
    const view = await render(() => <Menu.FilterProvider><Menu.Root defaultOpen><Popup><Menu.Input aria-label="Query" /><Menu.List><Menu.Item>Rename</Menu.Item><Menu.RadioGroup defaultValue="date" data-testid="group"><Menu.GroupLabel>Sort</Menu.GroupLabel><Menu.RadioItem value="date">Date</Menu.RadioItem></Menu.RadioGroup></Menu.List></Popup></Menu.Root></Menu.FilterProvider>);
    const group = screen.getByTestId('group');
    await view.user.type(screen.getByRole('searchbox'), 'rename');
    await waitFor(() => expect(group).toHaveAttribute('hidden'));
    await view.user.clear(screen.getByRole('searchbox'));
    expect(screen.getByTestId('group') === group).toBe(true);
    expect(screen.getByRole('menuitemradio')).toHaveAttribute('aria-checked', 'true');
  });

  it('matches children changed while an item is filtered out', async () => {
    const view = await renderProps((props: { query: string; label: string }) => <Menu.FilterProvider value={props.query}><Menu.Root open><Popup anchor={() => document.body}><Menu.Input aria-label="Query" /><Menu.List><Menu.Item>{props.label}</Menu.Item><Menu.Item>Delete</Menu.Item></Menu.List></Popup></Menu.Root></Menu.FilterProvider>, { query: '', label: 'Rename' });
    await view.setProps({ query: 'del' });
    await waitFor(() => expect(screen.queryByRole('menuitem', { name: 'Rename' })).toBeNull());
    await view.setProps({ label: 'Duplicate' });
    await view.setProps({ query: 'dup' });
    await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Duplicate' })).toBeVisible());
  });

  it('invalidates the highlight after an externally inserted result without reporting its shifted occupant', async () => {
    const highlighted = vi.fn();
    const view = await renderProps((props: { inserted: boolean }) => <Menu.FilterProvider><Menu.Root open onItemHighlighted={highlighted}><Popup><Menu.Input aria-label="Query" /><Menu.List><Show when={props.inserted}><Menu.Item>Archive</Menu.Item></Show><Menu.Item>Rename</Menu.Item><Menu.Item>Delete</Menu.Item></Menu.List></Popup></Menu.Root></Menu.FilterProvider>, { inserted: false });
    const input = screen.getByRole('searchbox');
    input.focus(); await view.user.keyboard('{ArrowDown}{ArrowDown}');
    await waitFor(() => expect(input).toHaveAttribute('aria-activedescendant', screen.getByRole('menuitem', { name: 'Delete' }).id));
    highlighted.mockClear(); await view.setProps({ inserted: true });
    await waitFor(() => expect(input).not.toHaveAttribute('aria-activedescendant'));
    expect(highlighted.mock.calls.map(call => call[0]?.textContent)).toEqual([undefined]);
  });

  it('owns independent queries and returns filtered submenu focus to the parent input', async () => {
    const view = await render(() => <Menu.FilterProvider><Menu.Root defaultOpen><Popup anchor={() => document.body}><Menu.Input aria-label="Parent" /><Menu.List><Menu.Item>Rename</Menu.Item><Menu.FilterProvider><Menu.SubmenuRoot><Menu.SubmenuTrigger openOnHover={false}>More</Menu.SubmenuTrigger><Popup><Menu.Input aria-label="Child" /><Menu.List><Menu.Item>Projects</Menu.Item><Menu.Item>Archive</Menu.Item></Menu.List></Popup></Menu.SubmenuRoot></Menu.FilterProvider></Menu.List></Popup></Menu.Root></Menu.FilterProvider>);
    const input = screen.getByRole('searchbox', { name: 'Parent' });
    await waitFor(() => expect(input).toHaveFocus());
    await view.user.keyboard('{ArrowDown}{ArrowDown}{ArrowRight}');
    const child = await screen.findByRole('searchbox', { name: 'Child' });
    await waitFor(() => expect(child).toHaveFocus());
    await view.user.type(child, 'arch');
    expect(screen.queryByRole('menuitem', { name: 'Projects' })).toBeNull();
    expect(screen.getByRole('menuitem', { name: 'Rename' })).toBeVisible();
    expect(input).toHaveValue('');
    await view.user.keyboard('{Escape}');
    await waitFor(() => expect(input).toHaveFocus());
    expect(screen.getByRole('menuitem', { name: 'More' })).toHaveAttribute('data-highlighted');
  });
});

browserCase({ source: 'packages/react/src/menu/submenu-trigger/MenuSubmenuTrigger.screenReaderPress.test.tsx', case: 'openOnHover=false trailing synthetic click does not undo screen reader mousedown', environment: 'browser', issue: 'bsolid-accessibility' }, async () => {
  await render(() => <Menu.Root defaultOpen><Popup><Menu.SubmenuRoot><Menu.SubmenuTrigger openOnHover={false}>More</Menu.SubmenuTrigger><Popup><Menu.Item>Leaf</Menu.Item></Popup></Menu.SubmenuRoot></Popup></Menu.Root>);
  const trigger = screen.getByRole('menuitem', { name: 'More' });
  firePointer.down(trigger, { pointerType: 'mouse', width: 1, height: 1, pressure: 0, buttons: 0, timeStamp: 100 });
  fireEvent.mouseDown(trigger, { detail: 0 });
  await screen.findByRole('menuitem', { name: 'Leaf' });
  fireEvent.click(trigger, { detail: 0 });
  await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Leaf' })).toBeVisible());
});

for (const [name, first, second, expected] of [
  ['right down', [10, 10], [200, 100], ['right', 'down']],
  ['left up', [200, 100], [10, 10], ['left', 'up']],
  ['right', [10, 50], [200, 52], ['right']],
  ['down', [50, 10], [52, 100], ['down']],
  ['tolerance', [50, 50], [52, 52], []],
  ['left down', [200, 10], [10, 100], ['left', 'down']],
  ['right up', [10, 100], [200, 10], ['right', 'up']],
] as const) {
  browserCase({ source: 'packages/react/src/menu/viewport/MenuViewport.test.tsx', case: `activation direction ${name}`, environment: 'browser', issue: 'bsolid-browser' }, async () => {
    const global = globalThis as typeof globalThis & { BASE_UI_ANIMATIONS_DISABLED?: boolean };
    const disabled = global.BASE_UI_ANIMATIONS_DISABLED; global.BASE_UI_ANIMATIONS_DISABLED = false;
    try {
      const view = await render(() => <>
        <style>{'[data-transitioning] [data-current] { animation: menu-current .3s linear; } @keyframes menu-current { from { opacity: 0; } to { opacity: 1; } }'}</style>
        <Menu.Root<number>>{data => <>
          <Menu.Trigger payload={0} style={{ position: 'absolute', left: `${first[0]}px`, top: `${first[1]}px`, width: '100px', height: '50px' }}>First</Menu.Trigger>
          <Menu.Trigger payload={1} style={{ position: 'absolute', left: `${second[0]}px`, top: `${second[1]}px`, width: '100px', height: '50px' }}>Second</Menu.Trigger>
          <Popup><Menu.Viewport data-testid="viewport">Content {data.payload}</Menu.Viewport></Popup>
        </>}</Menu.Root>
      </>);
      await view.user.click(screen.getByRole('button', { name: 'First' }));
      await screen.findByText('Content 0');
      await view.user.click(screen.getByRole('button', { name: 'Second' }));
      const viewport = screen.getByTestId('viewport');
      await waitFor(() => expect(viewport).toHaveAttribute('data-activation-direction'));
      expect((viewport.getAttribute('data-activation-direction') ?? '').split(' ').filter(Boolean).sort()).toEqual([...expected].sort());
    } finally { global.BASE_UI_ANIMATIONS_DISABLED = disabled; }
  });
}

for (const kind of ['checkbox', 'radio'] as const) {
  browserCase({ source: `packages/react/src/menu/${kind}-item/Menu${kind === 'checkbox' ? 'Checkbox' : 'Radio'}Item.test.tsx`, case: 'Space during active typeahead does not select', environment: 'browser', issue: 'bsolid-browser' }, async () => {
    const changed = vi.fn();
    const view = await render(() => <Menu.Root open><Popup>{kind === 'checkbox'
      ? <><Menu.CheckboxItem onCheckedChange={changed}>Item One</Menu.CheckboxItem><Menu.CheckboxItem onCheckedChange={changed}>Item Two</Menu.CheckboxItem></>
      : <Menu.RadioGroup defaultValue={0} onValueChange={changed}><Menu.RadioItem value={1}>Item One</Menu.RadioItem><Menu.RadioItem value={2}>Item Two</Menu.RadioItem></Menu.RadioGroup>}
    </Popup></Menu.Root>);
    const role = kind === 'checkbox' ? 'menuitemcheckbox' : 'menuitemradio';
    screen.getByRole(role, { name: 'Item One' }).focus();
    await view.user.keyboard('Item T');
    const second = screen.getByRole(role, { name: 'Item Two' });
    await waitFor(() => expect(second).toHaveFocus());
    await view.user.keyboard('  ');
    expect(changed).not.toHaveBeenCalled();
    expect(second).toHaveAttribute('aria-checked', 'false');
  });

  browserCase({ source: `packages/react/src/menu/${kind}-item/Menu${kind === 'checkbox' ? 'Checkbox' : 'Radio'}Item.test.tsx`, case: 'Enter selects after ArrowDown opening', environment: 'browser', issue: 'bsolid-browser' }, async () => {
    const view = await render(() => <Menu.Root><Menu.Trigger>Open</Menu.Trigger><Popup>{kind === 'checkbox'
      ? <Menu.CheckboxItem>Item</Menu.CheckboxItem>
      : <Menu.RadioGroup defaultValue={0}><Menu.RadioItem value={1}>Item</Menu.RadioItem></Menu.RadioGroup>}
    </Popup></Menu.Root>);
    screen.getByRole('button', { name: 'Open' }).focus();
    await view.user.keyboard('{ArrowDown}');
    const item = screen.getByRole(kind === 'checkbox' ? 'menuitemcheckbox' : 'menuitemradio');
    await waitFor(() => expect(item).toHaveFocus());
    await view.user.keyboard('{Enter}');
    expect(item).toHaveAttribute('data-checked', '');
  });

  for (const animation of ['none', 'keepMounted', 'unmount'] as const) {
    browserCase({ source: `packages/react/src/menu/${kind}-item-indicator/Menu${kind === 'checkbox' ? 'Checkbox' : 'Radio'}ItemIndicator.test.tsx`, case: `indicator exit ${animation}`, environment: 'browser', issue: 'bsolid-browser' }, async () => {
      const previous = globalThis.BASE_UI_ANIMATIONS_DISABLED;
      globalThis.BASE_UI_ANIMATIONS_DISABLED = false;
      try {
        const finished = vi.fn();
        const view = await renderProps((props: { selected: boolean }) => <>
          {animation !== 'none' && <style>{'@keyframes menu-indicator-exit { to { opacity: 0; } } .menu-indicator-exit[data-ending-style] { animation: menu-indicator-exit 150ms linear; }'}</style>}
          <Menu.Root open modal={false}><Popup>{kind === 'checkbox'
            ? <Menu.CheckboxItem checked={props.selected}><Menu.CheckboxItemIndicator class="menu-indicator-exit" data-testid="indicator" keepMounted={animation === 'keepMounted'} onAnimationEnd={finished} /></Menu.CheckboxItem>
            : <Menu.RadioGroup value={props.selected ? 'a' : 'b'}><Menu.RadioItem value="a"><Menu.RadioItemIndicator class="menu-indicator-exit" data-testid="indicator" keepMounted={animation === 'keepMounted'} onAnimationEnd={finished} /></Menu.RadioItem><Menu.RadioItem value="b"><Menu.RadioItemIndicator keepMounted /></Menu.RadioItem></Menu.RadioGroup>}
          </Popup></Menu.Root>
        </>, { selected: true });
        const indicator = screen.getByTestId('indicator');
        expect(indicator).not.toHaveAttribute('hidden');
        await view.setProps({ selected: false });
        if (animation === 'none') await waitFor(() => expect(screen.queryByTestId('indicator')).toBeNull());
        else {
          expect(indicator).toHaveAttribute('data-ending-style');
          if (animation === 'keepMounted') await waitFor(() => expect(finished).toHaveBeenCalledTimes(1));
          else await waitFor(() => expect(screen.queryByTestId('indicator')).toBeNull());
        }
      } finally { globalThis.BASE_UI_ANIMATIONS_DISABLED = previous; }
    });
  }
}
