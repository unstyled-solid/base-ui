import { untrack } from 'solid-js';
import { describe, expect, it, vi } from 'vitest';
import { createRenderer, fireEvent, screen, waitFor } from '../../../test';
import { Select } from '../index';
import { useSelectRootContext } from './SelectRootContext';
import type { SelectModel } from '../store';
import type { SelectRootActions } from './SelectRoot';

const { render, renderProps } = createRenderer();
describe('Select source-first regression checks', () => {
  it('keeps all reported native elements and commits a user pointer click', async () => {
    let model!: SelectModel;
    const Probe = () => { model = useSelectRootContext(); return null; };
    const changed = vi.fn();
    const pointer = vi.fn();
    const view = await render(() => <Select.Root defaultOpen defaultValue="a" onValueChange={changed}>
      <Probe /><Select.Trigger><Select.Value /></Select.Trigger>
      <Select.Portal><Select.Positioner alignItemWithTrigger={false}><Select.Popup data-testid="popup">
        <Select.List data-testid="list"><Select.Item value="a">Apple</Select.Item>
          <Select.Item value="b" onPointerDown={pointer}>Banana</Select.Item></Select.List>
      </Select.Popup></Select.Positioner></Select.Portal>
    </Select.Root>);
    const list = screen.getByTestId('list');
    const popup = screen.getByTestId('popup');
    expect(untrack(() => model.listElement)).toBe(list);
    expect(untrack(() => model.popupElement)).toBe(popup);
    expect(untrack(() => model.valueElement)).toBe(screen.getByRole('combobox').querySelector('span'));
    expect(popup).toHaveAttribute('role', 'presentation');
    expect(changed).not.toHaveBeenCalled();
    const banana = screen.getByRole('option', { name: 'Banana' });
    await view.user.hover(banana);
    expect(screen.getByTestId('popup')).toBe(popup);
    expect(screen.getByTestId('list')).toBe(list);
    expect(untrack(() => model.valueElement)).toBe(screen.getByRole('combobox').querySelector('span'));
    expect(screen.getByRole('option', { name: 'Banana' })).toBe(banana);
    await view.user.click(banana);
    expect(pointer).toHaveBeenCalledOnce();
    expect(changed).toHaveBeenCalledExactlyOnceWith('b', expect.objectContaining({ reason: 'item-press' }));
  });
  it('reads live interaction enablement and callback replacement on the same trigger', async () => {
    const old = vi.fn();
    const next = vi.fn();
    const view = await renderProps((props: Select.Root.Props<string>) => <Select.Root {...props}><Select.Trigger>Open</Select.Trigger></Select.Root>, { disabled: true, onOpenChange: old });
    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);
    expect(old).not.toHaveBeenCalled();
    await view.setProps({ disabled: false, onOpenChange: next });
    expect(screen.getByRole('combobox')).toBe(trigger);
    fireEvent.click(trigger);
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'));
    expect(next).toHaveBeenCalledExactlyOnceWith(true, expect.objectContaining({ reason: 'trigger-press' }));
    expect(old).not.toHaveBeenCalled();
  });
  it('honors Base UI handler prevention before opening and change-details cancellation', async () => {
    const changed = vi.fn((_open, details) => details.cancel());
    const view = await renderProps((props: { prevent: boolean }) => <Select.Root onOpenChange={changed}>
      <Select.Trigger onClick={event => { if (props.prevent) event.preventBaseUIHandler(); }}>Open</Select.Trigger>
    </Select.Root>, { prevent: true });
    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);
    expect(changed).not.toHaveBeenCalled();
    await view.setProps({ prevent: false });
    fireEvent.click(trigger);
    expect(changed).toHaveBeenCalledOnce();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });
  it('names the nameless multiple validation input and restores hidden-input focus to the trigger', async () => {
    await render(() => <Select.Root id="fruit" name="fruit" multiple required><Select.Trigger>Fruit</Select.Trigger></Select.Root>);
    const input = screen.getByRole('textbox', { hidden: true });
    expect(input).toHaveAttribute('id', 'fruit-hidden-input');
    expect(input).not.toHaveAttribute('name');
    expect(input).toHaveAttribute('required');
    input.focus();
    expect(screen.getByRole('combobox')).toHaveFocus();
  });
  it('ignores runtime label id overrides and links the actual custom trigger id', async () => {
    await render(() => <Select.Root id="fruit"><Select.Label {...{ id: 'ignored' }}>Fruit</Select.Label><Select.Trigger id="custom">Open</Select.Trigger></Select.Root>);
    const label = screen.getByText('Fruit');
    const trigger = screen.getByRole('combobox');
    expect(label.id).toBe('fruit-label');
    expect(trigger).toHaveAttribute('aria-labelledby', label.id);
    fireEvent.click(label);
    expect(trigger).toHaveFocus();
  });
  it.each([false, true])('handles native input autofill and its paired change exactly once (canceled: %s)', async canceled => {
    const changed = vi.fn((_value, details) => { if (canceled) details.cancel(); });
    await render(() => <Select.Root name="fruit" defaultValue="a" onValueChange={changed}>
      <Select.Trigger><Select.Value /></Select.Trigger><Select.Portal><Select.Positioner alignItemWithTrigger={false}><Select.Popup>
        <Select.Item value="a">Apple</Select.Item><Select.Item value="b">Banana</Select.Item>
      </Select.Popup></Select.Positioner></Select.Portal>
    </Select.Root>);
    const input = screen.getByRole<HTMLInputElement>('textbox', { hidden: true });
    fireEvent.input(input, { target: { value: 'Banana' } });
    // The browser's subsequent change observes the restored/current projection.
    fireEvent.change(input);
    await waitFor(() => expect(changed).toHaveBeenCalledOnce());
    expect(changed.mock.calls[0][0]).toBe('b');
    expect(input.value).toBe(canceled ? 'a' : 'b');
    expect(screen.getByRole('combobox')).toHaveTextContent(canceled ? 'a' : 'b');
  });
  it('exposes source default Field state when no Field owns the selected value', async () => {
    const state = vi.fn();
    await render(() => <Select.Root value="a"><Select.Label class={value => { state(value.disabled, value.filled, value.valid); return ''; }}>Fruit</Select.Label><Select.Trigger>Open</Select.Trigger></Select.Root>);
    expect(state).toHaveBeenCalledWith(false, false, null);
    expect(screen.getByRole('combobox')).not.toHaveAttribute('data-filled');
  });
  it.each([false, true])('reconciles removal of every mounted item (multiple: %s)', async multiple => {
    const changed = vi.fn();
    const view = await renderProps((props: { items: string[] }) => <Select.Root open multiple={multiple} defaultValue={multiple ? ['a'] : 'a'} onValueChange={changed}>
      <Select.Trigger><Select.Value placeholder="Pick" /></Select.Trigger><Select.Positioner alignItemWithTrigger={false}><Select.Popup>
        {props.items.map(value => <Select.Item value={value}>{value}</Select.Item>)}
      </Select.Popup></Select.Positioner>
    </Select.Root>, { items: ['a', 'b'] });
    expect(changed).not.toHaveBeenCalled();
    await view.setProps({ items: [] });
    await waitFor(() => expect(changed).toHaveBeenCalledOnce());
    expect(changed.mock.calls[0][0]).toEqual(multiple ? [] : null);
    expect(screen.getByRole('combobox')).toHaveTextContent('Pick');
    expect(screen.queryAllByRole('option')).toHaveLength(0);
  });
  it('does not clear a selected value while grouped items are inserted and reordered', async () => {
    const changed = vi.fn();
    const view = await renderProps((props: { items: string[] }) => <Select.Root open value="b" onValueChange={changed}>
      <Select.Trigger><Select.Value /></Select.Trigger><Select.Positioner alignItemWithTrigger={false}><Select.Popup>
        <Select.Group><Select.GroupLabel>Fruit</Select.GroupLabel>{props.items.map(value => <Select.Item value={value}><Select.ItemText>{value}</Select.ItemText></Select.Item>)}</Select.Group>
        <Select.Group><Select.GroupLabel>Other</Select.GroupLabel><Select.Item value="z">z</Select.Item></Select.Group>
      </Select.Popup></Select.Positioner>
    </Select.Root>, { items: ['b', 'c'] });
    await view.setProps({ items: ['c', 'b', 'a'] });
    expect(screen.getByRole('option', { name: 'b' })).toHaveAttribute('data-selected');
    expect(changed).not.toHaveBeenCalled();
    await view.setProps({ items: ['a', 'b', 'c'] });
    expect(screen.getByRole('option', { name: 'b' })).toHaveAttribute('data-selected');
    expect(changed).not.toHaveBeenCalled();
  });
  it('preserves a kept indicator and settles its deselection transition', async () => {
    const view = await renderProps((props: { value: string }) => <Select.Root open value={props.value}>
      <Select.Positioner alignItemWithTrigger={false}><Select.Item value="a">Apple<Select.ItemIndicator keepMounted data-testid="indicator" /></Select.Item></Select.Positioner>
    </Select.Root>, { value: 'b' });
    const indicator = screen.getByTestId('indicator');
    expect(indicator).not.toHaveAttribute('data-selected');
    expect(indicator).toHaveTextContent('✔️');
    await view.setProps({ value: 'a' });
    expect(screen.getByTestId('indicator')).toBe(indicator);
    expect(indicator).toHaveAttribute('data-selected');
    await view.setProps({ value: 'b' });
    expect(screen.getByTestId('indicator')).toBe(indicator);
    expect(indicator).not.toHaveAttribute('data-selected');
    await waitFor(() => expect(indicator).not.toHaveAttribute('data-ending-style'));
  });
  it('invokes live action refs untracked on replacement and disposal', async () => {
    const calls: [string, string, SelectRootActions | null][] = [];
    const view = await renderProps((props: { second: boolean; token: string }) => {
      const first = (actions: SelectRootActions | null) => { calls.push(['first', props.token, actions]); };
      const second = (actions: SelectRootActions | null) => { calls.push(['second', props.token, actions]); };
      return <Select.Root actionsRef={props.second ? second : first}><Select.Trigger>Open</Select.Trigger></Select.Root>;
    }, { second: false, token: 'before' });
    const actions = calls[0][2];
    await view.setProps({ second: true, token: 'after' });
    expect(calls).toEqual([['first', 'before', actions], ['first', 'after', null], ['second', 'after', actions]]);
    view.unmount();
    expect(calls.at(-1)).toEqual(['second', 'after', null]);
  });
});
