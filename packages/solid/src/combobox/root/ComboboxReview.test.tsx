import { For, createSignal, flush, untrack } from 'solid-js';
import { describe, expect, it, vi } from 'vitest';
import { createRenderer, fireEvent, screen, waitFor, browserCase, advanceTimers, isJSDOM } from '../../../test';
import { Combobox } from '../index';
import { AriaCombobox } from './AriaCombobox';
import { useComboboxRootContext } from './ComboboxRootContext';
import { INITIAL_LIVE_REGION_TEXT_MUTATION_RESET_DELAY } from '../../internals/createInitialLiveRegionTextMutation';
import { Field } from '../../field';
import { Form } from '../../form';

const users = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }, { id: 3, name: 'Carol' }];
const items = Combobox.createItems(users, { getValue: (user) => user.id, getLabel: (user) => user.name });
function List() { return <Combobox.List>{(user: typeof users[number]) => <Combobox.Item value={user.id}>{user.name}</Combobox.Item>}</Combobox.List>; }
function Popup() { return <Combobox.Portal><Combobox.Positioner><Combobox.Popup><List /></Combobox.Popup></Combobox.Positioner></Combobox.Portal>; }
function NonePopup() { return <Combobox.Portal><Combobox.Positioner><Combobox.Popup><Combobox.List><Combobox.Item value="new">new</Combobox.Item></Combobox.List></Combobox.Popup></Combobox.Positioner></Combobox.Portal>; }
function Chips() { return <Combobox.Chips><Combobox.Value>{(values: number[]) => <For each={values}>{(value) => <Combobox.Chip data-testid={`chip-${value}`}>{value}<Combobox.ChipRemove aria-label={`Remove ${value}`} /></Combobox.Chip>}</For>}</Combobox.Value><Combobox.Input /></Combobox.Chips>; }
const rootSource = 'packages/react/src/combobox/root/ComboboxRoot.test.tsx';

describe('Combobox source-first review regressions', () => {
  const { render, renderProps } = createRenderer();

  it('direct List owns floating containment, so canceled pointer selection stays open', async () => {
    const changed = vi.fn((_value, details) => details.cancel());
    const view = await render(() => <Combobox.Root items={items} defaultOpen onValueChange={changed}><Combobox.Input /><List /></Combobox.Root>);
    await view.user.click(view.getByRole('option', { name: 'Bob' }));
    expect(changed).toHaveBeenCalledTimes(1);
    expect(view.getByRole('combobox')).toHaveAttribute('aria-expanded', 'true');
    expect(view.getByRole('combobox')).toHaveValue('');
  });

  it('selection callbacks run value, input fill, close, and close completion in source order', async () => {
    const calls: string[] = [];
    const view = await render(() => <Combobox.Root items={items} defaultOpen onValueChange={(_, d) => calls.push(`value:${d.reason}`)} onInputValueChange={(_, d) => calls.push(`input:${d.reason}`)} onOpenChange={(_, d) => calls.push(`open:${d.reason}`)} onOpenChangeComplete={(open) => calls.push(`complete:${open}`)}><Combobox.Input /><Popup /></Combobox.Root>);
    await screen.findByRole('option', { name: 'Bob' }); calls.length = 0;
    await view.user.click(screen.getByRole('option', { name: 'Bob' }));
    await waitFor(() => expect(calls).toContain('complete:false'));
    expect(calls).toEqual(['value:item-press', 'input:item-press', 'open:item-press', 'complete:false']);
  });

  it('opening an already open input and closing an already closed root are no-op callbacks', async () => {
    const changed = vi.fn(); const actions = { current: null as Combobox.Root.Actions | null };
    const view = await render(() => <Combobox.Root items={items} onOpenChange={changed} actionsRef={actions}><Combobox.Input /><List /></Combobox.Root>);
    actions.current!.close(); flush(); expect(changed).not.toHaveBeenCalled();
    expect(view.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false');
    await view.user.click(view.getByRole('combobox')); await view.user.click(view.getByRole('combobox'));
    expect(changed).toHaveBeenCalledTimes(1);
  });

  it('restores a canceled native edit and invokes the current input handler', async () => {
    const canceled = vi.fn((_value: string, d: Combobox.Root.ChangeEventDetails) => d.cancel());
    const accepted = vi.fn();
    const view = await renderProps((props: { onChange: Combobox.Root.Props<string>['onInputValueChange'] }) => <Combobox.Root defaultInputValue="old" onInputValueChange={props.onChange}><Combobox.Input /></Combobox.Root>, { onChange: canceled });
    const input = view.getByRole('combobox');
    fireEvent.input(input, { target: { value: 'ignored' }, inputType: 'insertText' }); flush();
    expect(input).toHaveValue('old'); expect(canceled).toHaveBeenCalledTimes(1);
    await view.setProps({ onChange: accepted });
    fireEvent.input(input, { target: { value: 'new' }, inputType: 'insertText' }); flush();
    expect(input).toHaveValue('new'); expect(accepted).toHaveBeenCalledTimes(1);
  });

  it('controlled input rejection restores the actual prop without a blanket flush', async () => {
    const view = await render(() => <Combobox.Root inputValue="fixed"><Combobox.Input /></Combobox.Root>);
    const input = view.getByRole('combobox');
    await view.user.type(input, 'x');
    expect(input).toHaveValue('fixed');
  });

  it('clears selection on empty input without preventing an independent canceled input request', async () => {
    const changed = vi.fn();
    const view = await render(() => <Combobox.Root items={items} defaultValue={1} onValueChange={changed}><Combobox.Input /><List /></Combobox.Root>);
    await view.user.clear(view.getByRole('combobox'));
    expect(changed).toHaveBeenLastCalledWith(null, expect.objectContaining({ reason: 'input-clear' }));
    expect(view.getByRole('combobox')).toHaveValue('');
  });

  it('canceled label synchronization preserves the old input while Value follows new metadata', async () => {
    const view = await renderProps((props: { value: number }) => <Combobox.Root items={items} value={props.value} onInputValueChange={(_, d) => { if (d.reason === 'none') d.cancel(); }}><Combobox.Input /><output><Combobox.Value /></output></Combobox.Root>, { value: 1 });
    await view.setProps({ value: 2 });
    expect(view.getByRole('combobox')).toHaveValue('Alice');
    expect(view.getByRole('status')).toHaveTextContent('Bob');
  });

  it('a controlled selected-value change replaces an edited query and synchronizes its label only once', async () => {
    const changed = vi.fn();
    const view = await renderProps((props: { value: number }) => <Combobox.Root items={items} value={props.value} onInputValueChange={changed}><Combobox.Input /><List /></Combobox.Root>, { value: 1 });
    const input = view.getByRole('combobox');
    fireEvent.input(input, { target: { value: 'typed query' }, inputType: 'insertText' }); flush(); changed.mockClear();
    await view.setProps({ value: 2 });
    expect(input).toHaveValue('Bob');
    expect(changed).toHaveBeenCalledTimes(1); expect(changed).toHaveBeenCalledWith('Bob', expect.objectContaining({ reason: 'none' }));
  });

  it('retains one host and root-local labels across shared collection window replacements', async () => {
    const shared = Combobox.createItems([] as typeof users, { getValue: (user) => user.id, getLabel: (user) => user.name });
    const view = await renderProps((props: { results: typeof users }) => <><Combobox.Root items={shared} filteredItems={props.results} value={1}><Combobox.Input data-testid="a" /></Combobox.Root><Combobox.Root items={shared} filteredItems={[{ id: 1, name: 'Alicia' }]} value={1}><Combobox.Input data-testid="b" /></Combobox.Root></>, { results: [users[0]] });
    const input = view.getByTestId('a'); input.focus();
    await view.setProps({ results: [] });
    expect(view.getByTestId('a')).toBe(input); expect(input).toHaveValue('1'); expect(input).toHaveFocus();
    expect(view.getByTestId('b')).toHaveValue('Alicia');
  });

  it.each([0, '', false, 10n] as const)('projects primitive %s without mistaking it for no selection', async (value) => {
    const collection = Combobox.createItems([{ value, label: 'Chosen' }], { getValue: (item) => item.value, getLabel: (item) => item.label });
    const view = await render(() => <form><Combobox.Root items={collection} defaultValue={value} name="choice"><Combobox.Input /><Combobox.Value placeholder="Pick" /></Combobox.Root></form>);
    expect(view.getByRole('combobox')).toHaveValue('Chosen');
    expect(new FormData(view.container.querySelector('form')!).get('choice')).toBe(String(value));
    expect(view.queryByText('Pick')).toBeNull();
  });

  it('group limits/filter callbacks remain in the leaf domain and label each group', async () => {
    const groups = [{ name: 'Team A', items: users.slice(0, 2) }, { name: 'Team B', items: users.slice(2) }];
    const collection = Combobox.createItems(groups, { getValue: (user: typeof users[number]) => user.id, getLabel: (user) => user.name });
    const filter = vi.fn((user: typeof users[number]) => user.id > 1);
    const view = await render(() => <Combobox.Root items={collection} defaultOpen filter={filter} limit={1}><Combobox.Input /><Combobox.List>{(group: typeof groups[number]) => <Combobox.Group items={group.items}><Combobox.GroupLabel>{group.name}</Combobox.GroupLabel><Combobox.Collection>{(user: typeof users[number]) => <Combobox.Item value={user.id}>{user.name}</Combobox.Item>}</Combobox.Collection></Combobox.Group>}</Combobox.List></Combobox.Root>);
    await view.user.type(view.getByRole('combobox'), 'x');
    expect(view.getAllByRole('option')).toHaveLength(1);
    expect(view.getByRole('group')).toHaveAccessibleName('Team A');
    expect(view.getByRole('option')).toHaveTextContent('Bob');
    expect(new Set(filter.mock.calls.map(([user]) => user))).toEqual(new Set(users.slice(0, 2)));
  });

  it('uses selected-label stringification in a collection-aware public useFilter', async () => {
    const filter = Combobox.useFilter({ value: 2 }).contains;
    const view = await render(() => <Combobox.Root items={items} filter={filter} defaultValue={2} defaultOpen><Combobox.Input /><List /></Combobox.Root>);
    await view.user.clear(view.getByRole('combobox')); await view.user.type(view.getByRole('combobox'), 'ali');
    expect(view.getAllByRole('option')).toHaveLength(1); expect(view.getByRole('option')).toHaveTextContent('Alice');
  });

  it('preserves textarea editing but only exposes combobox semantics while expanded', async () => {
    const view = await render(() => <Combobox.Root items={items}><Combobox.Input render={(props) => <textarea {...props} />} /><List /></Combobox.Root>);
    const input = view.getByRole('textbox');
    expect(input).not.toHaveAttribute('role'); expect(input).not.toHaveAttribute('type');
    await view.user.type(input, 'bo');
    expect(input).toHaveAttribute('role', 'combobox'); expect(input).toHaveAttribute('aria-controls', view.getByRole('listbox').id); expect(input).toHaveValue('bo');
  });

  it('inline blur clears highlight and refocus restores only an existing slot', async () => {
    const view = await renderProps((props: { results: typeof users }) => <><Combobox.Root items={items} filteredItems={props.results} inline open><Combobox.Input /><List /></Combobox.Root><button>Outside</button></>, { results: users });
    const input = view.getByRole('combobox'); input.focus(); await view.user.keyboard('{ArrowDown}');
    expect(input).toHaveAttribute('aria-activedescendant');
    await view.user.click(view.getByText('Outside')); expect(input).not.toHaveAttribute('aria-activedescendant');
    await view.user.click(input); expect(input).toHaveAttribute('aria-activedescendant');
    await view.user.click(view.getByText('Outside')); await view.setProps({ results: [] }); await view.user.click(input);
    expect(input).not.toHaveAttribute('aria-activedescendant');
  });

  it('autoHighlight resolves fresh derived results and clears an empty list', async () => {
    const highlight = vi.fn();
    const view = await render(() => <Combobox.Root items={items} autoHighlight onItemHighlighted={highlight}><Combobox.Input /><List /></Combobox.Root>);
    await view.user.type(view.getByRole('combobox'), 'bo');
    expect(view.getByRole('option', { name: 'Bob' })).toHaveAttribute('data-highlighted');
    expect(highlight).toHaveBeenLastCalledWith(2, expect.objectContaining({ index: 0, reason: 'none' }));
    await view.user.type(view.getByRole('combobox'), 'zzz');
    expect(view.getByRole('combobox')).not.toHaveAttribute('aria-activedescendant');
  });

  it('imperative same-turn navigation uses a transaction cursor and traverses aria-disabled items', async () => {
    const actions = { current: null as Combobox.Root.Actions | null }; const highlighted = vi.fn();
    const view = await render(() => <Combobox.Root items={items} defaultOpen actionsRef={actions} onItemHighlighted={highlighted}><Combobox.Input /><Combobox.List>{(user: typeof users[number]) => <Combobox.Item value={user.id} disabled={user.id === 2}>{user.name}</Combobox.Item>}</Combobox.List></Combobox.Root>);
    actions.current!.highlightItem('first'); actions.current!.highlightItem('next'); flush();
    expect(view.getByRole('option', { name: 'Bob' })).toHaveAttribute('data-highlighted');
    expect(highlighted.mock.calls.map(([value]) => value)).toEqual([1, 2]);
    actions.current!.highlightItem('none'); flush(); expect(view.getByRole('combobox')).not.toHaveAttribute('aria-activedescendant');
  });

  it('multiple same-turn selection accumulates explicit proposals rather than stale getters', async () => {
    const changed = vi.fn();
    const view = await render(() => <Combobox.Root items={items} multiple defaultOpen onValueChange={changed}><Combobox.Input /><List /></Combobox.Root>);
    fireEvent.click(view.getByRole('option', { name: 'Alice' })); fireEvent.click(view.getByRole('option', { name: 'Bob' })); flush();
    expect(changed.mock.calls.map(([value]) => value)).toEqual([[1], [1, 2]]);
  });

  it('Backspace removes the last rendered chip rather than a hidden selected value', async () => {
    const changed = vi.fn();
    const view = await render(() => <Combobox.Root multiple defaultValue={[1, 2, 3]} onValueChange={changed}><Combobox.Chips><Combobox.Chip>1</Combobox.Chip><Combobox.Chip>2</Combobox.Chip><Combobox.Input /></Combobox.Chips></Combobox.Root>);
    view.getByRole('combobox').focus(); await view.user.keyboard('{Backspace}');
    expect(changed).toHaveBeenLastCalledWith([1, 3], expect.objectContaining({ reason: 'none' }));
  });

  it('input navigation resumes an existing chip cursor after focus returns', async () => {
    const view = await render(() => <Combobox.Root multiple defaultValue={[1, 2, 3]}><Chips /></Combobox.Root>);
    const input = view.getByRole('combobox'); input.focus(); await view.user.keyboard('{ArrowLeft}'); expect(view.getByTestId('chip-3')).toHaveFocus();
    input.focus(); await view.user.keyboard('{ArrowLeft}'); expect(view.getByTestId('chip-2')).toHaveFocus();
    input.focus(); await view.user.keyboard('{ArrowRight}'); expect(view.getByTestId('chip-3')).toHaveFocus();
  });

  it('chip remove cancellation and allowPropagation are independent of pointer highlight clearing', async () => {
    const bubbled = vi.fn(); const actions = { current: null as Combobox.Root.Actions | null };
    const view = await render(() => <div onClick={bubbled}><Combobox.Root items={items} multiple defaultValue={[1, 2]} defaultOpen actionsRef={actions} onValueChange={(_, d) => { d.cancel(); d.allowPropagation(); }}><Chips /><List /></Combobox.Root></div>);
    actions.current!.highlightItem('first'); flush();
    fireEvent.click(view.getByRole('button', { name: 'Remove 1' })); flush();
    expect(view.getByTestId('chip-1')).toBeInTheDocument(); expect(bubbled).toHaveBeenCalledTimes(1);
    expect(view.getByRole('combobox')).not.toHaveAttribute('aria-activedescendant'); expect(view.getByRole('combobox')).toHaveFocus();
  });

  it('reset uses the external owning form, respects prevented reset, and restores multiple serialization', async () => {
    const view = await render(() => <><form id="external" /><form><Combobox.Root items={items} multiple defaultValue={[1, 2]} name="users" form="external"><Chips /><List /></Combobox.Root></form></>);
    const owner = view.container.querySelector<HTMLFormElement>('#external')!;
    await view.user.click(view.getByRole('button', { name: 'Remove 1' }));
    expect(new FormData(owner).getAll('users')).toEqual(['2']);
    const prevent = (event: Event) => event.preventDefault(); owner.addEventListener('reset', prevent);
    owner.reset(); await Promise.resolve(); flush(); expect(new FormData(owner).getAll('users')).toEqual(['2']);
    owner.removeEventListener('reset', prevent); owner.reset(); await Promise.resolve(); flush();
    expect(new FormData(owner).getAll('users')).toEqual(['1', '2']);
  });

  it('reset retains an explicitly controlled null initial value instead of falling through to defaultValue', async () => {
    const changed = vi.fn();
    const view = await render(() => <form><Combobox.Root items={items} value={null} defaultValue={1} name="user" onValueChange={changed}><Combobox.Input /></Combobox.Root><button type="reset">Reset</button></form>);
    await view.user.click(view.getByText('Reset'));
    expect(changed).toHaveBeenLastCalledWith(null, expect.objectContaining({ reason: 'none' }));
    expect(view.getByRole('combobox')).toHaveValue('');
  });

  it.each(['2', 'bOB'])('hidden autofill matches serialized/derived label %s without opening', async (text) => {
    const changed = vi.fn();
    const view = await render(() => <Combobox.Root items={items} name="user" onValueChange={changed}><Combobox.Input /><Popup /></Combobox.Root>);
    const hidden = view.container.querySelector<HTMLInputElement>('input[name="user"]')!;
    fireEvent.input(hidden, { target: { value: text }, inputType: 'insertReplacementText' });
    await waitFor(() => expect(view.getByRole('combobox')).toHaveValue('Bob'));
    expect(changed).toHaveBeenLastCalledWith(2, expect.objectContaining({ reason: 'none' }));
    expect(screen.queryByRole('listbox')).toBeNull(); expect(hidden).toHaveValue('2');
  });

  it('rendered-text autofill mounts registered labels but serialized matches win first', async () => {
    const changed = vi.fn();
    const view = await render(() => <Combobox.Root name="country" onValueChange={changed}><Combobox.Input /><Combobox.Portal><Combobox.Positioner><Combobox.Popup><Combobox.List><Combobox.Item value="CA">US</Combobox.Item><Combobox.Item value="US">United States</Combobox.Item></Combobox.List></Combobox.Popup></Combobox.Positioner></Combobox.Portal></Combobox.Root>);
    const hidden = view.container.querySelector<HTMLInputElement>('input[name="country"]')!;
    fireEvent.input(hidden, { target: { value: 'US' } }); await waitFor(() => expect(changed).toHaveBeenCalled());
    expect(changed.mock.lastCall?.[0]).toBe('US');
    fireEvent.input(hidden, { target: { value: 'United States' } }); await waitFor(() => expect(changed).toHaveBeenCalledTimes(2));
    expect(changed.mock.lastCall?.[0]).toBe('US');
  });

  it.each(['readOnly', 'disabled', 'canceled', 'multiple'] as const)('restores hidden autofill when %s', async (lock) => {
    const changed = vi.fn((_value, d) => { if (lock === 'canceled') d.cancel(); });
    const view = await render(() => <Combobox.Root items={items} name="user" readOnly={lock === 'readOnly'} disabled={lock === 'disabled'} multiple={lock === 'multiple'} onValueChange={changed}><Combobox.Input /></Combobox.Root>);
    const hidden = view.container.querySelector<HTMLInputElement>('input[aria-hidden="true"]')!;
    fireEvent.input(hidden, { target: { value: 'Bob' } }); await Promise.resolve(); flush(); await Promise.resolve();
    expect(hidden).toHaveValue(''); expect(view.getByRole('combobox')).toHaveValue('');
    if (lock !== 'canceled') expect(changed).not.toHaveBeenCalled();
  });

  it.each(['accept', 'ignore', 'transform', 'cancel-fill'] as const)('none-mode submit uses committed controlled input (%s)', async (mode) => {
    const submitted: FormDataEntryValue[][] = [];
    const view = await render(() => {
      const [value, setValue] = createSignal('old');
      return <form onSubmit={(event) => { event.preventDefault(); submitted.push(new FormData(event.currentTarget).getAll('search')); }}><AriaCombobox selectionMode="none" inputValue={value()} name="search" submitOnItemClick defaultOpen onInputValueChange={(next, d) => { if (mode === 'cancel-fill') d.cancel(); else if (mode !== 'ignore') setValue(mode === 'transform' ? next.toUpperCase() : next); }}><Combobox.Input /><NonePopup /></AriaCombobox></form>;
    });
    await view.user.click(screen.getByRole('option', { name: 'new' }));
    await waitFor(() => expect(submitted).toHaveLength(1));
    expect(submitted).toEqual([[mode === 'accept' ? 'new' : mode === 'transform' ? 'NEW' : 'old']]);
  });

  it('Status and Empty mutate initial live-region text then restore it without replacing hosts', async () => {
    vi.useFakeTimers();
    const view = await render(() => <Combobox.Root items={[]}><Combobox.Status data-testid="status">Searching</Combobox.Status><Combobox.Empty data-testid="empty">No results</Combobox.Empty></Combobox.Root>);
    const status = view.getByTestId('status'), empty = view.getByTestId('empty');
    expect(status.textContent).toBe('Searching\u2060'); expect(empty.textContent).toBe('No results\u2060');
    await advanceTimers(INITIAL_LIVE_REGION_TEXT_MUTATION_RESET_DELAY);
    expect(status.textContent).toBe('Searching'); expect(empty.textContent).toBe('No results');
    view.unmount(); vi.useRealTimers();
  });

  it('successful autofill updates actual Field dirty/validation while cancellation retains its server error', async () => {
    const validate = vi.fn(() => null);
    const view = await renderProps((props: { cancel: boolean }) => <Form errors={{ user: 'server error' }}><Field.Root name="user" validationMode="onChange" validate={validate}><Combobox.Root items={items} onValueChange={(_, details) => { if (props.cancel) details.cancel(); }}><Combobox.Input /><List /></Combobox.Root><Field.Error /></Field.Root></Form>, { cancel: true });
    const input = view.getByRole('combobox'); const hidden = view.container.querySelector<HTMLInputElement>('input[name="user"]')!;
    fireEvent.input(hidden, { target: { value: 'Bob' } }); await Promise.resolve(); flush(); await Promise.resolve();
    expect(input).not.toHaveAttribute('data-dirty'); expect(view.getByText('server error')).toBeInTheDocument();
    expect(validate).not.toHaveBeenCalled();
    await view.setProps({ cancel: false });
    fireEvent.input(hidden, { target: { value: 'Bob' } }); await waitFor(() => expect(input).toHaveAttribute('data-dirty'));
    expect(validate).toHaveBeenLastCalledWith(2, expect.anything());
    await waitFor(() => expect(view.queryByText('server error')).toBeNull());
  });

  it('Form receives serialized derived multiple values from the shared field registry', async () => {
    const submitted = vi.fn();
    const view = await render(() => <Form onFormSubmit={submitted}><Field.Root name="users"><Combobox.Root items={items} multiple defaultValue={[1, 2]} itemToStringValue={(id) => `user-${id}`}><Combobox.Input /></Combobox.Root></Field.Root><button type="submit">Submit</button></Form>);
    await view.user.click(view.getByText('Submit'));
    expect(submitted).toHaveBeenCalledWith({ users: ['user-1', 'user-2'] }, expect.anything());
  });

  it('chip deletion focuses the surviving next coordinate after the native commit', async () => {
    const view = await render(() => <Combobox.Root multiple defaultValue={[1, 2, 3]}><Chips /></Combobox.Root>);
    const chip = view.getByTestId('chip-1'); chip.focus();
    await view.user.keyboard('{Delete}');
    expect(view.queryByTestId('chip-1')).toBeNull(); expect(view.getByTestId('chip-2')).toHaveFocus();
  });

  it('Icon remains usable outside a root without invented popup data attributes', async () => {
    const view = await render(() => <Combobox.Icon />);
    expect(view.container.querySelector('span')).toHaveTextContent('▼');
    expect(view.container.querySelector('span')).not.toHaveAttribute('data-popup-open');
  });

  it('controlled closing retains the manual opt-out and a reopen releases it for a later close', async () => {
    const complete = vi.fn(); const actions = { current: null as Combobox.Root.Actions | null };
    const view = await renderProps((props: { open: boolean }) => <Combobox.Root items={items} open={props.open} actionsRef={actions} onOpenChange={(_, d) => d.preventUnmountOnClose()} onOpenChangeComplete={complete}><Combobox.Input /><Popup /></Combobox.Root>, { open: true });
    await screen.findByRole('listbox');
    actions.current!.close(); flush(); await view.setProps({ open: false });
    expect(screen.getByRole('listbox')).toBeInTheDocument(); expect(complete).not.toHaveBeenCalledWith(false);
    await view.setProps({ open: true }); await view.setProps({ open: false });
    await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());
    expect(complete.mock.calls.filter(([open]) => !open)).toHaveLength(1);
  });

  it('ignores an unmount action while open and does not repeat close completion', async () => {
    const complete = vi.fn(); const actions = { current: null as Combobox.Root.Actions | null };
    await render(() => <Combobox.Root items={items} defaultOpen actionsRef={actions} onOpenChange={(_, d) => d.preventUnmountOnClose()} onOpenChangeComplete={complete}><Combobox.Input /><Popup /></Combobox.Root>);
    const list = await screen.findByRole('listbox'); actions.current!.unmount(); flush();
    expect(screen.getByRole('listbox')).toBe(list); expect(complete).not.toHaveBeenCalledWith(false);
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'true');
    actions.current!.close(); actions.current!.unmount(); actions.current!.unmount(); flush();
    await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());
    expect(complete.mock.calls.filter(([open]) => !open)).toHaveLength(1);
  });

  it('virtualized lookup uses filtered derived coordinates even when explicit DOM indexes are omitted', async () => {
    const changed = vi.fn(); const highlighted = vi.fn();
    const view = await render(() => <Combobox.Root items={items} virtualized defaultOpen onValueChange={changed} onItemHighlighted={highlighted}><Combobox.Input /><List /></Combobox.Root>);
    await view.user.type(view.getByRole('combobox'), 'bo'); await view.user.keyboard('{ArrowDown}{Enter}');
    expect(highlighted).toHaveBeenCalledWith(2, expect.objectContaining({ index: 0 }));
    expect(changed).toHaveBeenLastCalledWith(2, expect.objectContaining({ reason: 'item-press' }));
  });

  it.each([false, true])('Indicator uses the shared default glyph and selected-only lifetime (keepMounted=%s)', async (keepMounted) => {
    const view = await renderProps((props: { value: number }) => <Combobox.Root value={props.value} items={items} open><Combobox.Input /><Combobox.List><Combobox.Item value={1}>Alice<Combobox.ItemIndicator keepMounted={keepMounted} data-testid="indicator" /></Combobox.Item><Combobox.Item value={2}>Bob</Combobox.Item></Combobox.List></Combobox.Root>, { value: 1 });
    const indicator = view.getByTestId('indicator');
    expect(indicator).toHaveTextContent('✔️'); expect(indicator).toHaveAttribute('aria-hidden', 'true'); expect(indicator).toHaveAttribute('data-selected');
    await view.setProps({ value: 2 });
    if (keepMounted) {
      expect(view.getByTestId('indicator')).toBe(indicator); expect(indicator).not.toHaveAttribute('data-selected');
      await waitFor(() => expect(indicator).not.toHaveAttribute('data-ending-style'));
    } else expect(view.queryByTestId('indicator')).toBeNull();
  });

  it('supports the source standalone Root > Item > kept Indicator conformance composition', async () => {
    const view = await render(() => <Combobox.Root><Combobox.Item><Combobox.ItemIndicator keepMounted data-testid="indicator" /></Combobox.Item></Combobox.Root>);
    expect(view.getByTestId('indicator')).toHaveAttribute('aria-hidden', 'true');
  });

  it('shared Field/local label registration follows the pinned native label association', async () => {
    const view = await render(() => <Field.Root><Field.Label>Field title</Field.Label><Combobox.Root><Combobox.Label>Local title</Combobox.Label><Combobox.Trigger>Open</Combobox.Trigger></Combobox.Root></Field.Root>);
    const trigger = view.getByRole('combobox');
    // Pinned React browser replay gives both labels the shared ID; the first
    // element with that ID names the trigger. jsdom's name implementation can
    // choose the other duplicate, so assert the actual ID-reference contract.
    const labelledBy = trigger.getAttribute('aria-labelledby');
    expect(labelledBy).toBe(view.getByText('Field title').id);
    expect(view.getByText('Local title').id).toBe(labelledBy);
    if (!isJSDOM) {
      expect(trigger.ownerDocument.getElementById(labelledBy!)).toBe(view.getByText('Field title'));
      expect(trigger).toHaveAccessibleName('Field title');
    }
    expect(trigger.getAttribute('aria-labelledby')?.split(' ')).toHaveLength(1);
  });

  it('item-origin closing delivers keyboard provenance to the shared final-focus callback', async () => {
    const finalFocus = vi.fn(() => false);
    const view = await render(() => <Combobox.Root items={items} defaultOpen><Combobox.Trigger>Open</Combobox.Trigger><Combobox.Portal><Combobox.Positioner><Combobox.Popup finalFocus={finalFocus}><Combobox.Input aria-label="Search" /><List /></Combobox.Popup></Combobox.Positioner></Combobox.Portal></Combobox.Root>);
    const input = await screen.findByRole('combobox', { name: 'Search' }); input.focus();
    await view.user.keyboard('{ArrowDown}{Enter}');
    await waitFor(() => expect(finalFocus).toHaveBeenCalledWith('keyboard'));
    expect(finalFocus).toHaveBeenCalledTimes(1);
  });

  browserCase({ source: rootSource, case: 'resets only the nearest scrollable wrapper when composed in a scrollable dialog', environment: 'browser', issue: 'bsolid-browser' }, async () => {
    const data = Array.from({ length: 50 }, (_, index) => `item-${index}`);
    const view = await render(() => <Combobox.Root items={data} inline open><div role="dialog" data-testid="dialog" style={{ height: '80px', 'overflow-y': 'auto', 'overflow-anchor': 'none' }}><div style={{ height: '100px' }} /><Combobox.Input /><div data-testid="viewport" style={{ height: '100px', 'overflow-y': 'auto' }}><Combobox.List>{(item: string) => <Combobox.Item value={item} style={{ height: '24px' }}>{item}</Combobox.Item>}</Combobox.List></div></div></Combobox.Root>);
    const input = view.getByRole('combobox'); await view.user.click(input);
    const dialog = view.getByTestId('dialog'), viewport = view.getByTestId('viewport');
    // Keep the focused input visible: otherwise Firefox's native caret reveal
    // scrolls the outer dialog independently of the component's list reset.
    dialog.scrollTop = 80; viewport.scrollTop = 40; const dialogTop = dialog.scrollTop;
    expect(dialogTop).toBeGreaterThan(0);
    expect(viewport.scrollTop).toBeGreaterThan(0); await view.user.keyboard('item-1');
    await waitFor(() => expect(viewport.scrollTop).toBe(0)); expect(dialog.scrollTop).toBe(dialogTop);
  });

  browserCase({ source: rootSource, case: 'targets items an external virtualizer has not rendered', environment: 'browser', issue: 'bsolid-browser' }, async () => {
    const data = Array.from({ length: 100 }, (_, id) => ({ id, name: `item-${id}` }));
    const collection = Combobox.createItems(data, { getValue: (item) => item.id, getLabel: (item) => item.name });
    const actions = { current: null as Combobox.Root.Actions | null }; const highlighted = vi.fn();
    const view = await render(() => {
      const [start, setStart] = createSignal(0);
      function Window() { const filtered = Combobox.useFilteredItems<typeof data[number]>(); return <For each={filtered().slice(start(), start() + 10)}>{(item) => <Combobox.Item value={item.id} index={item.id}>{item.name}</Combobox.Item>}</For>; }
      return <Combobox.Root items={collection} virtualized defaultOpen actionsRef={actions} onItemHighlighted={(value, d) => { highlighted(value, d); if (d.reason === 'imperative-action') setStart(Math.max(0, d.index - 5)); }}><Combobox.Input /><Combobox.List><Window /></Combobox.List></Combobox.Root>;
    });
    expect(view.queryByRole('option', { name: 'item-99' })).toBeNull(); actions.current!.highlightItem('last'); flush();
    await waitFor(() => expect(highlighted).toHaveBeenLastCalledWith(99, expect.objectContaining({ reason: 'imperative-action', index: 99 })));
    await waitFor(() => expect(view.getByRole('option', { name: 'item-99' })).toHaveAttribute('data-highlighted'));
  });
});
