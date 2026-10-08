import { describe, expect, it, vi } from 'vitest';
import { createRenderer, fireEvent, waitFor } from '../../../test';
import { Autocomplete } from '../index';
import { AutocompleteFixture, type FixtureProps } from '../test/AutocompleteFixture';

// Source SHA 19511bb171f3b360b006c94cf6d07e53cb446505: Root.test.tsx mode/filter/value,
// readOnly, object stringification, keyboard interactions and input-inside-popup sections.
describe('Autocomplete.Root', () => {
  const { render, renderProps } = createRenderer();

  it('does not open on input click by default, but opens on typing', async () => {
    const view = await render(() => <AutocompleteFixture />);
    const input = view.getByTestId('input');
    await view.user.click(input);
    expect(input).toHaveAttribute('aria-expanded', 'false');
    await view.user.type(input, 'a');
    expect(input).toHaveAttribute('aria-expanded', 'true');
  });

  it.each(['list', 'both', 'inline', 'none'] as const)('mode=%s preserves filtering and display semantics', async (mode) => {
    const view = await render(() => <AutocompleteFixture mode={mode} items={['apple', 'banana', 'cherry']} />);
    const input = view.getByTestId('input');
    await view.user.type(input, 'a');
    const staticItems = mode === 'inline' || mode === 'none';
    expect(view.getAllByRole('option')).toHaveLength(staticItems ? 3 : 2);
    await view.user.keyboard('{ArrowDown}');
    expect(input).toHaveValue(mode === 'both' || mode === 'inline' ? 'apple' : 'a');
    expect(view.getAllByRole('option')).toHaveLength(staticItems ? 3 : 2);
    expect(input).toHaveAttribute('aria-autocomplete', mode);
  });

  it('mode=both keeps the typed query during completion, including new item arrival', async () => {
    const filter = vi.fn((item: string, query: string) => item.includes(query));
    const view = await renderProps<FixtureProps>((props) => <AutocompleteFixture {...props} />,
      { mode: 'both', items: ['apple', 'banana'], filter });
    const input = view.getByTestId('input');
    await view.user.type(input, 'a');
    await view.user.keyboard('{ArrowDown}');
    expect(input).toHaveValue('apple');
    filter.mockClear();
    await view.setProps({ items: ['apple', 'banana', 'apricot'] });
    expect(filter).toHaveBeenCalled();
    expect(filter.mock.calls.every(([, query]) => query === 'a')).toBe(true);
    await view.user.hover(view.getByRole('option', { name: 'banana' }));
    expect(input).toHaveValue('apple');
  });

  it.each(['list', 'both'] as const)('mode=%s respects locale, custom filtering and explicit null', async (mode) => {
    const view = await renderProps<FixtureProps>((props) => <AutocompleteFixture {...props} />,
      { mode, items: ['Isparta', 'İzmir'], locale: 'tr' });
    await view.user.type(view.getByTestId('input'), 'i');
    expect(view.queryByRole('option', { name: 'Isparta' })).toBe(null);
    expect(view.getByRole('option', { name: 'İzmir' })).toBeInTheDocument();
    await view.setProps({ filter: (item, query) => item[0] === query.toUpperCase() });
    expect(view.getByRole('option', { name: 'Isparta' })).toBeInTheDocument();
    expect(view.queryByRole('option', { name: 'İzmir' })).toBe(null);
    await view.setProps({ filter: null });
    expect(view.getAllByRole('option')).toHaveLength(2);
  });

  it.each(['inline', 'none'] as const)('mode=%s does not invoke custom filtering', async (mode) => {
    const filter = vi.fn(() => false);
    const view = await render(() => <AutocompleteFixture mode={mode} filter={filter} />);
    await view.user.type(view.getByTestId('input'), 'unmatched');
    expect(view.getAllByRole('option')).toHaveLength(3);
    expect(filter).not.toHaveBeenCalled();
  });

  it('external values replace temporary completion without replacing the input node', async () => {
    const view = await renderProps<FixtureProps>((props) => <AutocompleteFixture {...props} />,
      { mode: 'both', value: 'a', defaultOpen: true });
    const input = view.getByTestId('input');
    await view.user.click(input);
    await view.user.keyboard('{ArrowDown}');
    expect(input).toHaveValue('alpha');
    await view.setProps({ value: 'be' });
    expect(view.getByTestId('input')).toBe(input);
    expect(input).toHaveValue('be');
    await view.setProps({ value: null as never });
    expect(input).toHaveValue('');
  });

  it('does not revive a completion after a controlled value or inline permission round trip', async () => {
    let actions!: Autocomplete.Root.Actions;
    const view = await renderProps<FixtureProps>((props) => <AutocompleteFixture {...props} />, {
      mode: 'both', value: 'a', open: true,
      actionsRef: (value) => { if (value) actions = value; },
    });
    const input = view.getByTestId('input');
    actions.highlightItem('first');
    await waitFor(() => expect(input).toHaveValue('alpha'));
    await view.setProps({ value: 'be' });
    await view.setProps({ value: 'a' });
    expect(input).toHaveValue('a');
    actions.highlightItem('none');
    actions.highlightItem('first');
    await waitFor(() => expect(input).toHaveValue('alpha'));
    await view.setProps({ mode: 'none' });
    await view.setProps({ mode: 'both' });
    expect(view.getByTestId('input')).toBe(input);
    expect(input).toHaveValue('a');
    expect(view.getAllByRole('option')).toHaveLength(3);
  });

  it('reads replacement highlight callbacks and stringifiers through the real shared actions', async () => {
    const first = vi.fn();
    const second = vi.fn();
    const item = { label: 'Alpha', value: 'A' };
    let actions!: Autocomplete.Root.Actions;
    const view = await renderProps<Omit<Autocomplete.Root.Props<typeof item>, 'items'> & { items: readonly (typeof item)[] }>((props) =>
      <Autocomplete.Root {...props}>
        <Autocomplete.Input data-testid="input" />
        <Autocomplete.List>{(value: typeof item) => <Autocomplete.Item value={value}>{value.label}</Autocomplete.Item>}</Autocomplete.List>
      </Autocomplete.Root>, {
        items: [item], mode: 'both', inline: true, open: true, onItemHighlighted: first,
        actionsRef: (value) => { if (value) actions = value; },
      });
    await view.setProps({ onItemHighlighted: second, itemToStringValue: (value) => value.value });
    actions.highlightItem('first');
    await waitFor(() => expect(view.getByTestId('input')).toHaveValue('A'));
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenLastCalledWith(item, expect.objectContaining({ reason: 'imperative-action' }));
  });

  it('readOnly retires pending completion, exposes none, permits navigation but not commits', async () => {
    const onValueChange = vi.fn();
    const view = await renderProps<FixtureProps>((props) => <AutocompleteFixture {...props} />,
      { mode: 'both', onValueChange });
    const input = view.getByTestId('input');
    await view.user.type(input, 'a');
    await view.user.keyboard('{ArrowDown}');
    expect(input).toHaveValue('alpha');
    await view.setProps({ readOnly: true });
    expect(input).toHaveValue('a');
    expect(input).toHaveAttribute('aria-autocomplete', 'none');
    expect(view.getByRole('listbox')).toHaveAttribute('aria-readonly', 'true');
    onValueChange.mockClear();
    await view.user.click(view.getByRole('option', { name: 'beta' }));
    expect(onValueChange).not.toHaveBeenCalled();
    await view.setProps({ readOnly: false });
    expect(input).toHaveValue('a');
  });

  it('does not expose data-placeholder on Trigger or InputGroup', async () => {
    const view = await render(() => <AutocompleteFixture />);
    for (const name of ['trigger', 'group']) expect(view.getByTestId(name)).not.toHaveAttribute('data-placeholder');
    await view.user.type(view.getByTestId('input'), 'al');
    for (const name of ['trigger', 'group']) expect(view.getByTestId(name)).not.toHaveAttribute('data-placeholder');
  });

  it.each(['label', 'value', 'country'] as const)('filters and commits objects using %s', async (key) => {
    const items = [{ [key]: 'United States' }, { [key]: 'Canada' }, { [key]: 'Australia' }];
    const view = await render(() => <Autocomplete.Root items={items}
      itemToStringValue={key === 'country' ? (item) => item.country! : undefined}>
      <Autocomplete.Input />
      <Autocomplete.Portal><Autocomplete.Positioner><Autocomplete.Popup><Autocomplete.List>
        {(item: Record<string, string>) => <Autocomplete.Item value={item}>{item[key]}</Autocomplete.Item>}
      </Autocomplete.List></Autocomplete.Popup></Autocomplete.Positioner></Autocomplete.Portal>
    </Autocomplete.Root>);
    const input = view.getByRole('combobox');
    await view.user.type(input, 'can');
    expect(view.getAllByRole('option')).toHaveLength(1);
    if (key === 'country') await view.user.keyboard('{ArrowDown}{Enter}');
    else await view.user.click(view.getByRole('option', { name: 'Canada' }));
    expect(input).toHaveValue('Canada');
  });

  it.each(['Enter', 'Escape'])('popup input preserves text and restores focus after %s', async (key) => {
    const changed = vi.fn();
    const view = await render(() => <AutocompleteFixture inputInside autoHighlight={key === 'Enter'} onValueChange={changed} />);
    const trigger = view.getByTestId('trigger');
    await view.user.click(trigger);
    const input = await view.findByTestId('input');
    await waitFor(() => expect(input).toHaveFocus());
    await view.user.type(input, 'al');
    if (key === 'Enter') expect(view.getByRole('option', { name: 'alpha' })).toHaveAttribute('data-highlighted');
    await view.user.keyboard(`{${key}}`);
    await waitFor(() => expect(view.queryByRole('dialog')).toBe(null));
    expect(trigger).toHaveFocus();
    expect(trigger).toHaveTextContent(key === 'Enter' ? 'alpha' : 'al');
    if (key === 'Escape') expect(changed.mock.lastCall?.[0]).toBe('al');
    await view.user.click(trigger);
    expect(await view.findByTestId('input')).toHaveValue(key === 'Enter' ? 'alpha' : 'al');
    expect(view.getByRole('option', { name: 'alpha' })).toBeInTheDocument();
    if (key === 'Escape') {
      expect(view.getByRole('option', { name: 'alpine' })).toBeInTheDocument();
      expect(view.queryByRole('option', { name: 'beta' })).toBe(null);
    }
    await view.user.keyboard('{Escape}');
    await waitFor(() => expect(view.queryByRole('dialog')).toBe(null));
  });

  it('closes on Tab after a commit followed by more typing', async () => {
    const view = await render(() => <><AutocompleteFixture autoHighlight /><button>After</button></>);
    const input = view.getByTestId('input');
    await view.user.type(input, 'al');
    expect(view.getByRole('option', { name: 'alpha' })).toHaveAttribute('data-highlighted');
    await view.user.keyboard('{Enter}');
    expect(input).toHaveValue('alpha');
    await waitFor(() => expect(view.queryByRole('listbox')).toBe(null));
    await view.user.clear(input);
    await view.user.type(input, 'a');
    expect(view.getByRole('listbox')).toBeInTheDocument();
    await view.user.tab();
    await waitFor(() => expect(view.queryByRole('listbox')).toBe(null));
  });

  it('forwards the original native hover and leave event details', async () => {
    const callback = vi.fn();
    const view = await render(() => <AutocompleteFixture open onItemHighlighted={callback} />);
    const item = view.getByRole('option', { name: 'alpha' });
    const move = new MouseEvent('mousemove', { bubbles: true });
    // This tests a move, not the stationary WebKit scroll-under-pointer case.
    // Keep the original event identity while supplying an actual nonzero delta.
    Object.defineProperty(move, 'movementX', { value: 1 });
    fireEvent(item, move);
    await waitFor(() => expect(callback).toHaveBeenLastCalledWith('alpha', expect.objectContaining({ reason: 'pointer', event: move })));
    expect(callback.mock.lastCall?.[1].event).toBe(move);
    // Native onPointerLeave receives pointerleave; React synthesized this lane
    // from pointerout. Preserve the exact dispatched native event in details.
    const leave = new PointerEvent('pointerleave', { pointerType: 'mouse' });
    fireEvent(item, leave);
    await waitFor(() => expect(callback).toHaveBeenLastCalledWith(undefined, expect.objectContaining({ reason: 'pointer', event: leave })));
    expect(callback.mock.lastCall?.[1].event).toBe(leave);
  });

  it('readOnly opens with ArrowDown but never commits a pressed option', async () => {
    const changed = vi.fn();
    const view = await render(() => <AutocompleteFixture readOnly onValueChange={changed} />);
    const input = view.getByTestId('input');
    await view.user.click(input);
    await view.user.keyboard('{ArrowDown}');
    expect(await view.findByRole('listbox')).toHaveAttribute('aria-readonly', 'true');
    await view.user.click(view.getByRole('option', { name: 'beta' }));
    expect(changed).not.toHaveBeenCalled();
    expect(input).toHaveValue('');
  });

  it('readOnly keyboard highlights do not fill a both-mode input', async () => {
    const view = await render(() => <AutocompleteFixture readOnly mode="both" />);
    const input = view.getByTestId('input');
    expect(input).toHaveAttribute('aria-autocomplete', 'none');
    input.focus();
    await view.user.keyboard('{ArrowDown}{ArrowDown}');
    await waitFor(() => expect(view.getByRole('option', { name: 'alpha' })).toHaveAttribute('data-highlighted'));
    expect(input).toHaveValue('');
    expect(input).toHaveAttribute('aria-autocomplete', 'none');
  });

  it('an unfocused synthetic click does not establish an arrow-key highlight', async () => {
    const view = await render(() => <AutocompleteFixture items={['apple', 'banana']} autoHighlight openOnInputClick />);
    const input = view.getByTestId('input');
    fireEvent.click(input);
    expect(input).not.toHaveAttribute('aria-activedescendant');
    await view.user.keyboard('{ArrowDown}');
    expect(input).not.toHaveAttribute('aria-activedescendant');
    await view.user.keyboard('{ArrowDown}');
    expect(input).not.toHaveAttribute('aria-activedescendant');
    await view.user.keyboard('{Escape}');
    await view.user.click(input);
    expect(input).not.toHaveAttribute('aria-activedescendant');
    await view.user.keyboard('{ArrowUp}');
    await waitFor(() => expect(input).toHaveAttribute('aria-activedescendant'));
  });

  it.each(['inline', 'none'] as const)('static JSX items retain mode=%s editing semantics', async (mode) => {
    const view = await render(() => <Autocomplete.Root mode={mode} openOnInputClick>
      <Autocomplete.Input />
      <Autocomplete.Portal><Autocomplete.Positioner><Autocomplete.Popup><Autocomplete.List>
        <Autocomplete.Item value="apple">apple</Autocomplete.Item>
        <Autocomplete.Item value="banana">banana</Autocomplete.Item>
        <Autocomplete.Item value="cherry">cherry</Autocomplete.Item>
      </Autocomplete.List></Autocomplete.Popup></Autocomplete.Positioner></Autocomplete.Portal>
    </Autocomplete.Root>);
    const input = view.getByRole('combobox');
    await view.user.click(input);
    await view.user.keyboard('{ArrowDown}');
    expect(input).toHaveValue(mode === 'inline' ? 'apple' : '');
    expect(view.getAllByRole('option')).toHaveLength(3);
    await view.user.type(input, mode === 'inline' ? 'b' : 'x');
    if (mode === 'none') await view.user.keyboard('{ArrowDown}');
    expect(input).toHaveValue(mode === 'inline' ? 'appleb' : 'x');
    expect(view.getAllByRole('option')).toHaveLength(3);
  });

  it.each(['list', 'both'] as const)('filter=null retains unmatched movie objects in mode=%s', async (mode) => {
    const items = [{ title: 'Pulp Fiction' }, { title: 'The Godfather' }, { title: 'The Dark Knight' }];
    const view = await render(() => <Autocomplete.Root mode={mode} items={items} filter={null} itemToStringValue={(item) => item.title}>
      <Autocomplete.Input />
      <Autocomplete.Portal><Autocomplete.Positioner><Autocomplete.Popup><Autocomplete.List>
        {(item: { title: string }) => <Autocomplete.Item value={item}>{item.title}</Autocomplete.Item>}
      </Autocomplete.List></Autocomplete.Popup></Autocomplete.Positioner></Autocomplete.Portal>
    </Autocomplete.Root>);
    await view.user.type(view.getByRole('combobox'), '1994');
    expect(view.getAllByRole('option')).toHaveLength(3);
    for (const item of items) expect(view.getByRole('option', { name: item.title })).toBeInTheDocument();
  });

  it('controlled null initially exposes an empty query and matching items', async () => {
    const view = await render(() => <AutocompleteFixture mode="both" value={null as never} items={['apple']} defaultOpen />);
    expect(view.getByTestId('input')).toHaveValue('');
    expect(view.getByRole('option', { name: 'apple' })).toBeInTheDocument();
  });

  it.each(['list', 'both'] as const)('initial custom filtering overrides locale in mode=%s', async (mode) => {
    const view = await render(() => <AutocompleteFixture mode={mode} locale="tr" items={['Isparta', 'İzmir']}
      filter={(item, query) => item[0] === query.toUpperCase()} />);
    await view.user.type(view.getByTestId('input'), 'i');
    expect(view.getByRole('option', { name: 'Isparta' })).toBeInTheDocument();
    expect(view.queryByRole('option', { name: 'İzmir' })).toBe(null);
  });
});
