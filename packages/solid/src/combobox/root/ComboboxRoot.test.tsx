import { createSignal, flush } from 'solid-js';
import { describe, it, expect, vi } from 'vitest';
import { createRenderer, browserCase, fireEvent, waitFor, sourceCase, screen } from '../../../test';
import { Combobox } from '../index';
import { useComboboxRootContext } from './ComboboxRootContext';
const source = 'packages/react/src/combobox/root/ComboboxRoot.test.tsx';
const users = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }, { id: 3, name: 'Carol' }];
const items = Combobox.createItems(users, { getValue: (user) => user.id, getLabel: (user) => user.name });
function Contents() { return <Combobox.List>{(user: typeof users[number]) => <Combobox.Item value={user.id}>{user.name}</Combobox.Item>}</Combobox.List>; }
function PopupContents() { return <Combobox.Portal><Combobox.Positioner><Combobox.Popup><Contents /></Combobox.Popup></Combobox.Positioner></Combobox.Portal>; }
function SelectedChips() {
  const model = useComboboxRootContext();
  return <Combobox.Chips><Combobox.Value>{(values: number[]) => values.map((value) => <Combobox.Chip>{model.derived.label(value)}<Combobox.ChipRemove aria-label={`Remove ${value}`} /></Combobox.Chip>)}</Combobox.Value><Combobox.Input /></Combobox.Chips>;
}
describe('Combobox production interactions (shared engines, no mock replacements)', () => {
  const { render, renderProps } = createRenderer();
  sourceCase({ source, case: 'manual unmount: close and unmount in one staged transaction', environment: 'jsdom', adaptation: 'native callbacks and staged Solid writes' }, async () => {
    const actions = { current: null as Combobox.Root.Actions | null }; const complete = vi.fn();
    const view = await render(() => <><button onClick={() => { actions.current!.close(); actions.current!.unmount(); }}>Close now</button><Combobox.Root items={items} defaultOpen actionsRef={actions} onOpenChange={(_open, details) => details.preventUnmountOnClose()} onOpenChangeComplete={complete}><Combobox.Input /><PopupContents /></Combobox.Root></>);
    await view.user.click(view.getByText('Close now'));
    await waitFor(() => expect(view.queryByRole('listbox')).toBeNull());
    expect(complete.mock.calls.filter(([open]) => !open)).toHaveLength(1);
  });
  sourceCase({ source, case: 'ignores an opt-out on a canceled close', environment: 'jsdom' }, async () => {
    let cancel = true;
    const view = await render(() => <Combobox.Root items={items} defaultOpen onOpenChange={(open, details) => { if (!open && cancel) { details.preventUnmountOnClose(); details.cancel(); } }}><Combobox.Input /><PopupContents /></Combobox.Root>);
    await view.user.click(await screen.findByRole('option', { name: 'Bob' }));
    expect(view.getByRole('combobox')).toHaveAttribute('aria-expanded', 'true');
    expect(screen.queryByRole('listbox')).not.toBeNull();
    cancel = false;
    await view.user.click(screen.getByRole('option', { name: 'Bob' }));
    await waitFor(() => expect(view.queryByRole('listbox')).toBeNull());
  });
  it('selects derived values with the keyboard and retains virtual input focus', async () => {
    const changed = vi.fn();
    const view = await render(() => <Combobox.Root items={items} onValueChange={changed}><Combobox.Input /><PopupContents /></Combobox.Root>);
    const input = view.getByRole('combobox');
    await view.user.click(input);
    const first = await screen.findByRole('option', { name: 'Alice' });
    expect(view.getByRole('combobox')).toBe(input);
    expect(input).toHaveFocus();
    await view.user.keyboard('{ArrowDown}');
    await waitFor(() => expect(input).toHaveAttribute('aria-activedescendant', first.id));
    await view.user.keyboard('{Enter}');
    expect(changed.mock.lastCall?.[0]).toBe(1); expect(input).toHaveValue('Alice'); expect(input).toHaveFocus();
  });
  it('cancellation prevents value, input-fill and close after an item press', async () => {
    const view = await render(() => <Combobox.Root items={items} defaultOpen onValueChange={(_value, details) => details.cancel()}><Combobox.Input /><Contents /></Combobox.Root>);
    await view.user.click(view.getByRole('option', { name: 'Bob' }));
    expect(view.getByRole('combobox')).toHaveValue(''); expect(view.getByRole('combobox')).toHaveAttribute('aria-expanded', 'true');
    expect(view.getByRole('option', { name: 'Bob' })).toHaveAttribute('aria-selected', 'false');
  });
  it('does not open the popup through imperative highlighting', async () => {
    const actions = { current: null as Combobox.Root.Actions | null }; const highlighted = vi.fn();
    const view = await render(() => <><button onClick={() => actions.current!.highlightItem('next')}>Highlight</button><Combobox.Root items={items} actionsRef={actions} onItemHighlighted={highlighted}><Combobox.Input /><PopupContents /></Combobox.Root></>);
    await view.user.click(view.getByText('Highlight')); expect(view.queryByRole('listbox')).toBeNull(); expect(highlighted).not.toHaveBeenCalled();
  });
  it('keeps imperative previous/next within the list and reports derived values', async () => {
    const actions = { current: null as Combobox.Root.Actions | null }; const highlighted = vi.fn();
    const view = await render(() => <><button onClick={() => actions.current!.highlightItem('first')}>First</button><button onClick={() => actions.current!.highlightItem('previous')}>Previous</button><Combobox.Root items={items} defaultOpen actionsRef={actions} onItemHighlighted={highlighted}><Combobox.Input /><Contents /></Combobox.Root></>);
    actions.current!.highlightItem('first'); flush(); actions.current!.highlightItem('previous'); flush();
    expect(highlighted.mock.lastCall?.[0]).toBe(3); expect(highlighted.mock.lastCall?.[1]).toMatchObject({ reason: 'imperative-action', index: 2 });
  });
  it('multiple mode projects one hidden field per derived value and reset restores defaults', async () => {
    const view = await render(() => <form><Combobox.Root items={items} multiple defaultOpen defaultValue={[1]} name="users"><Combobox.Input /><Contents /></Combobox.Root><button type="reset">Reset</button></form>);
    await view.user.click(view.getByRole('option', { name: 'Bob' }));
    const form = view.container.querySelector('form')!;
    expect(new FormData(form).getAll('users')).toEqual(['1', '2']);
    await view.user.click(view.getByText('Reset')); expect(new FormData(form).getAll('users')).toEqual(['1']);
  });
  it('chip removal keeps the input focused and an unrelated highlight intact', async () => {
    const actions = { current: null as Combobox.Root.Actions | null };
    const view = await render(() => <><button onClick={() => actions.current!.highlightItem('last')}>Last</button><Combobox.Root items={items} multiple defaultOpen defaultValue={[1, 2]} actionsRef={actions}><SelectedChips /><Contents /></Combobox.Root></>);
    actions.current!.highlightItem('last'); flush(); await view.user.click(view.getByRole('button', { name: 'Remove 1' }));
    expect(view.getByRole('combobox')).toHaveFocus(); expect(view.getByRole('option', { name: 'Carol' })).toHaveAttribute('data-highlighted');
    expect(view.getByRole('combobox')).toHaveAttribute('aria-expanded', 'true');
  });
  it('readOnly allows browsing without removing chips or changing submitted selection', async () => {
    const changed = vi.fn();
    const view = await render(() => <Combobox.Root items={items} multiple readOnly defaultValue={[1]} name="users" onValueChange={changed}><SelectedChips /><Contents /></Combobox.Root>);
    await view.user.click(view.getByRole('combobox')); await view.user.click(view.getByRole('button', { name: 'Remove 1' }));
    expect(changed).not.toHaveBeenCalled(); expect(view.container.querySelector('input[name="users"]')).toHaveValue('1');
  });
  it('updates an external selected label without replacing the focused input', async () => {
    const shared = Combobox.createItems([] as typeof users, { getValue: (user) => user.id, getLabel: (user) => user.name });
    const view = await renderProps((props: { results: typeof users }) => <Combobox.Root items={shared} value={1} filteredItems={props.results}><Combobox.Input /></Combobox.Root>, { results: [users[0]] });
    const input = view.getByRole('combobox'); input.focus();
    await view.setProps({ results: [{ id: 1, name: 'Alicia' }] });
    expect(view.getByRole('combobox')).toBe(input); expect(input).toHaveValue('Alicia'); expect(input).toHaveFocus();
    await view.setProps({ results: [] }); expect(input).toHaveValue('1');
  });
  browserCase({ source, case: 'input inside popup: keyboard selection restores trigger focus', environment: 'browser', issue: 'bsolid-browser' }, async () => {
    const view = await render(() => <Combobox.Root items={items}><Combobox.Trigger>Open</Combobox.Trigger><Combobox.Portal><Combobox.Positioner><Combobox.Popup><Combobox.Input aria-label="Search" /><Contents /></Combobox.Popup></Combobox.Positioner></Combobox.Portal></Combobox.Root>);
    const trigger = view.getByText('Open'); await view.user.click(trigger);
    const input = await view.findByRole('combobox', { name: 'Search' }); await waitFor(() => expect(input).toHaveFocus());
    await view.user.type(input, 'bo'); await view.user.keyboard('{ArrowDown}{Enter}');
    await waitFor(() => expect(view.queryByRole('dialog')).toBeNull()); expect(trigger).toHaveFocus();
    await view.user.click(trigger); expect(await view.findByRole('combobox', { name: 'Search' })).toHaveValue('');
  });
  browserCase({ source: 'packages/react/src/combobox/positioner/ComboboxPositioner.test.tsx', case: 'custom anchor geometry and owned scroll', environment: 'browser', issue: 'bsolid-browser' }, async () => {
    let anchor: HTMLDivElement | undefined;
    const view = await render(() => <><div ref={anchor} style={{ position: 'absolute', top: '100px', left: '100px', width: '120px', height: '30px' }} /><Combobox.Root items={items} defaultOpen><Combobox.Input /><Combobox.Portal><Combobox.Positioner anchor={() => anchor ?? null} side="bottom" sideOffset={8} data-testid="positioner"><Combobox.Popup><Contents /></Combobox.Popup></Combobox.Positioner></Combobox.Portal></Combobox.Root></>);
    await waitFor(() => expect(Math.round(view.getByTestId('positioner').getBoundingClientRect().top)).toBe(138));
    expect(view.getByTestId('positioner')).toHaveAttribute('data-side', 'bottom');
  });
});
