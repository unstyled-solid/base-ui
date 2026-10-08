import { createSignal, flush, For, Show, untrack } from 'solid-js';
import { Portal } from '@solidjs/web';
import { describe, expect, it, vi } from 'vitest';
import { createRenderer, fireEvent, sourceCase, browserCase, screen, waitFor } from '../../../test';
import { TestRoot, ControlledRoot, Item, List, Popup } from '../test/host';
import { FilterDropdownInput as Input } from '../input/FilterDropdownInput';
import { FilterDropdownEmpty as Empty } from '../empty/FilterDropdownEmpty';
import { useFilterDropdownItemContext, useFilterDropdownRootContext, type FilterDropdownRootContext, type FilterDropdownItemContext } from './FilterDropdownRootContext';
import type { FilterDropdownRootProps } from './FilterDropdownRoot';
import { createChangeEventDetails } from '../../internals/createBaseUIEventDetails';
import { createFilterDropdownGroup } from '../group/useFilterDropdownGroup';
import { FilterDropdownGroupContext } from '../group/FilterDropdownGroupContext';
import { createFilterDropdownItem } from '../item/useFilterDropdownItem';

const source = 'packages/react/src/filter-dropdown/root/FilterDropdownRoot.test.tsx';
describe('FilterDropdown Root', () => {
  const { render, renderProps } = createRenderer();
  sourceCase({ source, case: 'renders the expected markup and ARIA relationships', environment: 'jsdom' }, async () => {
    const view = await render(() => <><button id="host-trigger">Choose a country</button><TestRoot open value="" triggerId="host-trigger"><Popup><Input aria-label="Filter countries" /><List id={undefined} /></Popup></TestRoot></>);
    const input = view.getByRole('searchbox');
    const list = view.getByRole('menu', { name: 'Choose a country' });
    expect(view.getByRole('dialog')).toHaveAttribute('aria-labelledby', 'host-trigger');
    for (const [key, value] of Object.entries({ type: 'text', inputmode: 'search', autocomplete: 'off', spellcheck: 'false', autocorrect: 'off', autocapitalize: 'none' })) expect(input).toHaveAttribute(key, value);
    expect(input.id).not.toBe('');
    expect(list.id).not.toBe('');
    expect(list).toHaveAttribute('tabindex', '-1');
    expect(input).toHaveAttribute('aria-controls', list.id);
    for (const attribute of ['enterkeyhint', 'aria-expanded', 'aria-activedescendant', 'aria-autocomplete']) expect(input).not.toHaveAttribute(attribute);
  });
  sourceCase({ source, case: 'updates relationships when id props change / releases id overrides when their props are removed', environment: 'jsdom' }, async () => {
    const view = await renderProps<{ id?: string | null; trigger?: string | null }>((props) => <TestRoot open value="" triggerId={props.trigger}><Popup id={props.id ?? undefined}><Input /><List id={props.id} /></Popup></TestRoot>, { id: 'first', trigger: 'trigger' });
    const input = view.getByRole('searchbox');
    const list = view.getByRole('menu');
    await view.setProps({ id: 'second' });
    expect(input).toHaveAttribute('aria-controls', 'second');
    expect(view.getByRole('menu')).toBe(list);
    for (const id of ['', null]) { await view.setProps({ id, trigger: id }); expect(input).not.toHaveAttribute('aria-controls'); expect(view.getByRole('dialog')).not.toHaveAttribute('aria-labelledby'); }
    await view.setProps({ id: undefined });
    expect(list.id).not.toBe('');
    expect(input).toHaveAttribute('aria-controls', list.id);
  });
  sourceCase({ source, case: 'keeps the live region in sync with a changing Empty message', environment: 'jsdom' }, async () => {
    const view = await renderProps((props: { message: string }) => <TestRoot open value="zz"><Input /><Empty>{props.message}</Empty><List /></TestRoot>, { message: 'No matches for zz' });
    expect(view.getByRole('status')).toHaveTextContent('No matches for zz');
    await view.setProps({ message: 'No matches for zzq' });
    expect(view.getByRole('status')).toHaveTextContent('No matches for zzq');
  });
  it('does not mount Empty while matching items register in the same turn', async () => {
    const mounted = vi.fn();
    function Message() { mounted(); return 'Nothing'; }
    const view = await render(() => <TestRoot open value="can"><Empty><Message /></Empty><List><Item>Canada</Item></List></TestRoot>);
    expect(view.getByRole('menuitem')).toHaveTextContent('Canada');
    expect(view.queryByRole('status')).toBeNull();
    expect(mounted).not.toHaveBeenCalled();
  });
  it('uses the trimmed query override while the input retains its displayed spaces', async () => {
    const view = await render(() => <TestRoot open value="Mexico" query="  can  "><Input /><List><Item>Canada</Item><Item>Mexico</Item></List></TestRoot>);
    expect(view.getByRole('searchbox')).toHaveValue('  can  ');
    expect(view.getAllByRole('menuitem').map(node => node.textContent)).toEqual(['Canada']);
  });
  for (const autoHighlight of [false, true, 'always'] as const) {
    it(`autoHighlight=${autoHighlight} uses committed queries and match identity`, async () => {
      let active: number | null = null;
      const setActive = vi.fn((value: number | null) => { active = value; });
      const view = await renderProps((props: { value: string; label: string; extra: boolean }) => <TestRoot open value={props.value} autoHighlight={autoHighlight} getActiveIndex={() => active} setActiveIndex={setActive}><List><Item label={props.label}>Canada</Item><Item>Cambodia</Item>{props.extra && <Item>Mexico</Item>}</List></TestRoot>, { value: 'ca', label: 'Canada', extra: false });
      expect(active).toBe(autoHighlight ? 0 : null);
      active = 1; setActive.mockClear();
      await view.setProps({ extra: true, label: 'CANADA' });
      expect(active).toBe(1);
      await view.setProps({ value: 'can' });
      expect(active).toBe(autoHighlight ? 0 : null);
      await view.setProps({ value: '' });
      expect(active).toBe(autoHighlight === 'always' ? 0 : null);
    });
  }
  it('does not accept a controlled query proposal; cancellation vetoes highlight reset independently', async () => {
    let context!: FilterDropdownRootContext;
    function Probe() { context = useFilterDropdownRootContext(); return null; }
    const setActive = vi.fn();
    const reject = vi.fn();
    const view = await renderProps<{ onValueChange: NonNullable<FilterDropdownRootProps['onValueChange']> }>((props) => <TestRoot open value="can" onValueChange={props.onValueChange} setActiveIndex={setActive}><Probe /><Input /><List><Item>Canada</Item><Item>Mexico</Item></List></TestRoot>, { onValueChange: reject });
    const details = createChangeEventDetails('input-change');
    details.event.preventDefault();
    untrack(() => context.onValueChange('mex', details)); flush();
    expect(view.getByRole('menuitem')).toHaveTextContent('Canada');
    expect(setActive).toHaveBeenLastCalledWith(null);
    await view.setProps({ onValueChange: (_next, event) => event.cancel() });
    setActive.mockClear();
    untrack(() => context.onValueChange('mex', createChangeEventDetails('input-change'))); flush();
    expect(setActive).not.toHaveBeenCalled();
  });
  for (const filter of [null, undefined] as const) {
    sourceCase({ source, case: filter === null ? 'filter=null clears a stale highlight when the item set changes / keeps autoHighlight seeding the first item' : 'clears a stale highlight when items change with an empty query', environment: 'jsdom', adaptation: 'host-owned ordered DOM list transition, no unfinished Menu import' }, async () => {
      let context!: FilterDropdownRootContext;
      let active: number | null = 1;
      const nodes = [document.createElement('div'), document.createElement('div')];
      const listRef = { current: nodes };
      function Probe() { context = useFilterDropdownRootContext(); return null; }
      const view = await renderProps<{ auto: boolean | 'always'; value: string }>((props) => <TestRoot open value={props.value} filter={filter} autoHighlight={props.auto} listRef={listRef} getActiveIndex={() => active} setActiveIndex={next => { active = next; }}><Probe /><List><Item>A</Item><Item>B</Item></List></TestRoot>, { auto: false, value: filter === null ? 'q' : '' });
      listRef.current = [...nodes, document.createElement('div')];
      untrack(() => context.onItemsChange(nodes));
      expect(active).toBe(1);
      const previous = listRef.current;
      listRef.current = [nodes[1]!, nodes[0]!];
      untrack(() => context.onItemsChange(previous));
      expect(active).toBeNull();
      await view.setProps({ auto: filter === null ? true : 'always', value: filter === null ? 'q' : '' });
      expect(active).toBe(0);
      const beforeEmpty = listRef.current; listRef.current = [];
      untrack(() => context.onItemsChange(beforeEmpty)); expect(active).toBeNull();
      listRef.current = nodes;
      untrack(() => context.onItemsChange([])); expect(active).toBe(0);
    });
  }
  it('filters changed hidden labels and discovers late items without remounting existing matches', async () => {
    const view = await renderProps((props: { label: string; items: string[] }) => <TestRoot open value="can"><List><Item label={props.label}>First</Item><For each={props.items}>{name => <Item>{name}</Item>}</For></List></TestRoot>, { label: 'Mexico', items: ['Canada'] });
    const canada = view.getByRole('menuitem');
    await view.setProps({ label: 'Cancun', items: ['Canada', 'Canton', 'Peru'] });
    expect(view.getAllByRole('menuitem').map(node => node.textContent)).toEqual(['First', 'Canada', 'Canton']);
    expect(view.getByText('Canada')).toBe(canada);
  });
  it('hides empty groups, retains requested groups, and isolates nested list membership', async () => {
    function Group(props: { children?: import('@solidjs/web').JSX.Element }) {
      const group = createFilterDropdownGroup();
      return <FilterDropdownGroupContext value={group.context}><section data-testid="group" hidden={group.hidden}>{props.children}</section></FilterDropdownGroupContext>;
    }
    const view = await renderProps((props: { retained: boolean }) => <TestRoot open value="can"><List><Group><Item retainGroup={props.retained}>Mexico</Item><TestRoot open value=""><List><Item>Canada</Item></List></TestRoot></Group></List></TestRoot>, { retained: false });
    expect(view.getByTestId('group')).toHaveAttribute('hidden');
    await view.setProps({ retained: true }); expect(view.getByTestId('group')).not.toHaveAttribute('hidden');
  });
  it('retains an enclosing group for a mounted submenu trigger with an explicit parent owner', async () => {
    function Trigger(props: { retained: boolean; context: FilterDropdownItemContext }) {
      const item = createFilterDropdownItem({ label: 'Mexico', get context() { return props.context; }, get retainGroup() { return props.retained; } });
      return <Show when={item.visible || props.retained}><div role="menuitem" ref={item.ref}>Mexico</div></Show>;
    }
    function Group(props: { retained: boolean }) {
      const parent = useFilterDropdownItemContext();
      const group = createFilterDropdownGroup();
      return <FilterDropdownGroupContext value={group.context}><section data-testid="parent-group" hidden={group.hidden}>
        <TestRoot open value=""><Trigger context={parent} retained={props.retained} /><List><Item>Canada</Item></List></TestRoot>
      </section></FilterDropdownGroupContext>;
    }
    const view = await renderProps((props: { retained: boolean }) => <TestRoot open value="can"><List><Group retained={props.retained} /></List></TestRoot>, { retained: true });
    expect(view.getByTestId('parent-group')).not.toHaveAttribute('hidden');
    await view.setProps({ retained: false });
    expect(view.getByTestId('parent-group')).toHaveAttribute('hidden');
  });
  it('resets locally edited focus/modality when the host changes openedByKeyboard', async () => {
    let context!: FilterDropdownRootContext;
    function Probe() { context = useFilterDropdownRootContext(); return null; }
    const view = await renderProps((props: { keyboard: boolean }) => <TestRoot open value="" openedByKeyboard={props.keyboard}><Probe /><Input activeItemId="active" /></TestRoot>, { keyboard: false });
    untrack(() => { context.setInputFocusVisible(true); context.setKeyboardModality(false); }); flush();
    expect(view.getByRole('searchbox')).toHaveAttribute('data-highlighted');
    await view.setProps({ keyboard: true });
    expect(untrack(() => context.inputFocusVisible)).toBe(true);
    expect(untrack(() => context.keyboardModality)).toBe(true);
    expect(view.getByRole('searchbox')).not.toHaveAttribute('data-highlighted');
    await view.setProps({ keyboard: false });
    expect(untrack(() => context.inputFocusVisible)).toBe(false);
    expect(untrack(() => context.keyboardModality)).toBe(false);
  });
  it('keeps hidden children text current and discovers changed descendant text on the next query', async () => {
    const view = await renderProps((props: { value: string; hidden: string; descendant: string }) => <TestRoot open value={props.value}><List>
      <Item>{props.hidden}</Item><Item><span>{props.descendant}</span></Item>
    </List></TestRoot>, { value: 'can', hidden: 'Mexico', descendant: 'Canada' });
    const canada = view.getByRole('menuitem');
    await view.setProps({ hidden: 'Canton' });
    expect(view.getAllByRole('menuitem').map(node => node.textContent)).toEqual(['Canton', 'Canada']);
    expect(view.getByText('Canada').parentElement).toBe(canada);
    await view.setProps({ descendant: 'Peru', value: 'per' });
    expect(view.getAllByRole('menuitem').map(node => node.textContent)).toEqual(['Peru']);
  });
  it('observes actual render callback IDs and their replacement, removal and disposal', async () => {
    const view = await renderProps<{ id: string | null | undefined; mounted: boolean }>(props => <TestRoot open value=""><Input /><Show when={props.mounted}>
      <List render={passed => <div {...passed} id={props.id === undefined ? passed.id : props.id ?? undefined} />} />
    </Show></TestRoot>, { id: 'render-first', mounted: true });
    const input = view.getByRole('searchbox');
    const list = view.getByRole('menu');
    await waitFor(() => expect(input).toHaveAttribute('aria-controls', 'render-first'));
    await view.setProps({ id: 'render-second' });
    await waitFor(() => expect(input).toHaveAttribute('aria-controls', 'render-second'));
    expect(view.getByRole('menu')).toBe(list);
    for (const id of ['', null]) {
      await view.setProps({ id });
      await waitFor(() => expect(input).not.toHaveAttribute('aria-controls'));
    }
    await view.setProps({ id: undefined });
    await waitFor(() => expect(input).toHaveAttribute('aria-controls', list.id));
    expect(list.id).not.toBe('');
    await view.setProps({ mounted: false });
    expect(list.isConnected).toBe(false);
    expect(input.getAttribute('aria-controls')).not.toBe('render-second');
  });
  it('keeps the live count and stale-cleanup identity correct', async () => {
    let context!: FilterDropdownItemContext;
    function Probe() { context = useFilterDropdownItemContext(); return null; }
    await render(() => <TestRoot open value=""><Probe /></TestRoot>);
    const key = Symbol();
    const old = context.registerItem(key, { getText: () => 'A' });
    const replacement = context.registerItem(key, { getText: () => 'B' });
    old();
    expect(untrack(() => context.store.state.registeredItemCount)).toBe(1);
    replacement();
    expect(untrack(() => context.store.state.registeredItemCount)).toBe(0);
    flush();
  });
  sourceCase({ source, case: 'keeps focus on the input when the list or popup background is clicked / focuses the input when the pointer enters or popup receives focus', environment: 'jsdom' }, async () => {
    const view = await render(() => <TestRoot open value=""><Popup data-testid="popup" tabindex={-1}><Input /><List /></Popup><button>Outside</button></TestRoot>);
    const input = view.getByRole('searchbox');
    await view.user.click(input); await view.user.click(view.getByRole('menu')); expect(input).toHaveFocus();
    await view.user.click(view.getByTestId('popup')); expect(input).toHaveFocus();
    await view.user.hover(view.getByRole('button')); view.getByRole('button').focus(); await view.user.hover(view.getByTestId('popup')); expect(input).toHaveFocus();
    view.getByRole('button').focus(); view.getByTestId('popup').focus(); expect(input).toHaveFocus();
  });
  for (const portal of [false, true]) {
    const nestedCase = async () => {
      function Child() { return <TestRoot open value=""><Popup data-testid="child"><Input aria-label="child" /><List /></Popup></TestRoot>; }
      const view = await render(() => <TestRoot open value=""><Popup><Input aria-label="parent" />{portal ? <Portal><Child /></Portal> : <Child />}</Popup></TestRoot>);
      view.getByLabelText('parent').focus();
      await view.user.hover(screen.getByTestId('child'));
      expect(screen.getByLabelText('child')).toHaveFocus();
    };
    sourceCase({ source, case: `does not focus a parent input when the pointer enters a ${portal ? 'portalled' : 'inline'} nested popup`, environment: 'jsdom', adaptation: 'native host fixture supplies popup-owned behavior' }, nestedCase);
    browserCase({ source, case: `nested ${portal ? 'portal' : 'inline'} focus geometry`, environment: 'browser', issue: 'bsolid-browser' }, nestedCase);
  }
});
