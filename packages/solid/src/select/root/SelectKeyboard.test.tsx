import { describe, expect, it, vi } from 'vitest';
import { createRenderer, fireEvent, screen, waitFor } from '../../../test';
import { flush } from 'solid-js';
import { Select } from '../index';
import type { SelectRootActions, SelectRootProps } from './SelectRoot';

const { render, renderProps } = createRenderer();
function Fixture(props: SelectRootProps<string, false>) {
  return <Select.Root {...props}><Select.Trigger><Select.Value placeholder="Pick" /></Select.Trigger>
    <Select.Portal><Select.Positioner alignItemWithTrigger={false}><Select.Popup>
      <Select.Item value="a">Apple</Select.Item><Select.Item value="b">Banana</Select.Item>
      <Select.Item value="blue" disabled>Blueberry</Select.Item><Select.Item value="c">Cherry</Select.Item>
    </Select.Popup></Select.Positioner></Select.Portal>
  </Select.Root>;
}

// Pinned SelectRoot/SelectItem tests: keyboard focus differs from selected value;
// disabled options remain browsable but never commit, typeahead skips them.
describe('Select source keyboard focus and value transactions', () => {
  it.each(['{ArrowDown}', '{ArrowUp}', '{Enter}', '[Space]'])('opens with %s and focuses the selected option', async key => {
    const view = await render(() => <Fixture defaultValue="b" />);
    screen.getByRole('combobox').focus();
    await view.user.keyboard(key);
    await waitFor(() => expect(screen.getByRole('option', { name: 'Banana' })).toHaveFocus());
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('option', { name: 'Banana' })).toHaveAttribute('data-selected');
  });
  it('keeps disabled items keyboard-focusable, while Enter cannot select them', async () => {
    const changed = vi.fn();
    const view = await render(() => <Fixture defaultOpen defaultValue="b" onValueChange={changed} />);
    await waitFor(() => expect(screen.getByRole('option', { name: 'Banana' })).toHaveFocus());
    await view.user.keyboard('{ArrowDown}{Enter}');
    expect(screen.getByRole('option', { name: 'Blueberry' })).toHaveFocus();
    expect(changed).not.toHaveBeenCalled();
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'true');
    await view.user.keyboard('{End}');
    expect(screen.getByRole('option', { name: 'Cherry' })).toHaveFocus();
    await view.user.keyboard('{Home}');
    expect(screen.getByRole('option', { name: 'Apple' })).toHaveFocus();
  });
  it('allows readonly open typeahead without committing a value and skips disabled matches', async () => {
    const changed = vi.fn();
    const view = await render(() => <Fixture readOnly defaultOpen defaultValue="a" onValueChange={changed} />);
    await waitFor(() => expect(screen.getByRole('option', { name: 'Apple' })).toHaveFocus());
    await view.user.keyboard('b');
    await waitFor(() => expect(screen.getByRole('option', { name: 'Banana' })).toHaveFocus());
    await view.user.keyboard('b');
    expect(screen.getByRole('option', { name: 'Banana' })).toHaveFocus();
    expect(screen.getByRole('option', { name: 'Blueberry' })).not.toHaveAttribute('data-highlighted');
    await view.user.keyboard('{Enter}');
    expect(changed).not.toHaveBeenCalled();
    expect(screen.getByRole('combobox')).toHaveTextContent('a');
  });
  it('keeps the focus anchor while controlled selection changes in an open popup', async () => {
    const view = await renderProps(Fixture, { open: true, value: 'a' });
    const apple = screen.getByRole('option', { name: 'Apple' });
    await waitFor(() => expect(apple).toHaveFocus());
    await view.setProps({ value: 'b' });
    expect(screen.getByRole('option', { name: 'Apple' })).toBe(apple);
    expect(apple).toHaveFocus();
    expect(apple).toHaveAttribute('aria-selected', 'false');
    expect(apple).toHaveAttribute('data-highlighted');
    expect(screen.getByRole('option', { name: 'Banana' })).toHaveAttribute('aria-selected', 'true');
  });
  it('honors the last same-turn imperative highlight even when it equals the committed index', async () => {
    let actions!: SelectRootActions;
    await render(() => <Fixture defaultOpen defaultValue="a" actionsRef={value => { if (value) actions = value; }} />);
    const apple = screen.getByRole('option', { name: 'Apple' });
    await waitFor(() => expect(apple).toHaveFocus());
    actions.highlightItem('last');
    actions.highlightItem('first');
    flush();
    await waitFor(() => expect(apple).toHaveFocus());
    expect(apple).toHaveAttribute('data-highlighted');
    expect(screen.getByRole('option', { name: 'Cherry' })).not.toHaveAttribute('data-highlighted');
  });
  it('delivers value before close with the same native keyboard activation event', async () => {
    const calls: [string, unknown, Event][] = [];
    const view = await render(() => <Fixture defaultOpen defaultValue="a"
      onValueChange={(value, details) => { calls.push(['value', value, details.event]); }}
      onOpenChange={(open, details) => { calls.push(['open', open, details.event]); }} />);
    await waitFor(() => expect(screen.getByRole('option', { name: 'Apple' })).toHaveFocus());
    await view.user.keyboard('{ArrowDown}{Enter}');
    expect(calls.map(([kind, value]) => [kind, value])).toEqual([['value', 'b'], ['open', false]]);
    expect(calls[0][2]).toBe(calls[1][2]);
    await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());
  });
  it('typeahead spaces do not activate an option or poison subsequent pointer selection', async () => {
    const changed = vi.fn();
    const view = await render(() => <Select.Root defaultOpen onValueChange={changed}><Select.Trigger><Select.Value /></Select.Trigger>
      <Select.Portal><Select.Positioner alignItemWithTrigger={false}><Select.Popup>
        <Select.Item value="one">Item One</Select.Item><Select.Item value="two">Item Two</Select.Item>
      </Select.Popup></Select.Positioner></Select.Portal>
    </Select.Root>);
    const first = screen.getByRole('option', { name: 'Item One' });
    first.focus();
    await view.user.keyboard('item t');
    expect(changed).not.toHaveBeenCalled();
    const second = screen.getByRole('option', { name: 'Item Two' });
    await waitFor(() => expect(second).toHaveFocus());
    await view.user.keyboard(' ');
    expect(changed).not.toHaveBeenCalled();
    await view.user.click(second);
    expect(changed).toHaveBeenCalledExactlyOnceWith('two', expect.objectContaining({ reason: 'item-press' }));
  });
  it('canceled controlled close opt-outs are cleared by a subsequent controlled reopen', async () => {
    const completed = vi.fn();
    const view = await renderProps(Fixture, { open: true, onOpenChangeComplete: completed,
      onOpenChange: (_open, details) => { details.preventUnmountOnClose(); details.cancel(); } });
    fireEvent.keyDown(screen.getByRole('listbox'), { key: 'Escape' });
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'true');
    await view.setProps({ open: false });
    await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());
    expect(completed.mock.calls.filter(([open]) => !open)).toHaveLength(1);
    await view.setProps({ open: true });
    await screen.findByRole('listbox');
    await view.setProps({ open: false });
    await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());
    expect(completed.mock.calls.filter(([open]) => !open)).toHaveLength(2);
  });
});
