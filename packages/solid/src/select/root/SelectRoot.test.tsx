import { createSignal, flush } from 'solid-js';
import { describe, expect, it, vi } from 'vitest';
import { createRenderer, fireEvent, screen, waitFor } from '../../../test';
import { Select } from '../index';
import { useSelectRootContext } from './SelectRootContext';
import { createChangeEventDetails } from '../../internals/createBaseUIEventDetails';
import type { SelectRootActions, SelectRootProps } from './SelectRoot';

const { render, renderProps } = createRenderer();
function Options() {
  return <Select.Portal><Select.Positioner alignItemWithTrigger={false}><Select.Popup>
    <Select.List>
      <Select.Item value="a"><Select.ItemText>Apple</Select.ItemText><Select.ItemIndicator /></Select.Item>
      <Select.Item value="b"><Select.ItemText>Banana</Select.ItemText><Select.ItemIndicator /></Select.Item>
      <Select.Item value="c" disabled><Select.ItemText>Cherry</Select.ItemText></Select.Item>
    </Select.List>
  </Select.Popup></Select.Positioner></Select.Portal>;
}
function Fixture(props: SelectRootProps<string, boolean>) {
  return <Select.Root {...props}><Select.Label>Fruit</Select.Label><Select.Trigger><Select.Value placeholder="Pick" /><Select.Icon /></Select.Trigger><Options /></Select.Root>;
}

describe('Select model and native forms', () => {
  it('resolves labels before the popup mounts and updates the same trigger', async () => {
    const view = await renderProps(Fixture, { value: 'a', items: { a: 'Apple', b: 'Banana' } });
    const trigger = screen.getByRole('combobox');
    expect(trigger).toHaveTextContent('Apple');
    expect(screen.queryByRole('listbox', { hidden: true })).toBeNull();
    await view.setProps({ value: 'b' });
    expect(screen.getByRole('combobox')).toBe(trigger);
    expect(trigger).toHaveTextContent('Banana');
  });
  it('updates label and trigger IDs without recreating either host', async () => {
    const view = await renderProps(Fixture, { id: 'first' });
    const trigger = screen.getByRole('combobox');
    const label = screen.getByText('Fruit');
    expect(trigger).toHaveAttribute('aria-labelledby', label.id);
    await view.setProps({ id: 'second' });
    expect(trigger.id).toBe('second');
    expect(label.id).toBe('second-label');
    expect(trigger).toHaveAttribute('aria-labelledby', 'second-label');
  });
  it('a null item label overrides placeholder while remaining empty for forms', async () => {
    await render(() => <Select.Root items={[{ value: null, label: 'None' }]} name="fruit"><Select.Value placeholder="Pick" /></Select.Root>);
    expect(screen.getByText('None')).toHaveAttribute('data-placeholder');
    expect(screen.getByRole('textbox', { hidden: true })).toHaveValue('');
  });
  it('serializes multiple objects per item into an external native form', async () => {
    const values = [{ code: 'US' }, { code: 'CA' }] as const;
    const stringify = vi.fn((item: { code: string }) => item.code.toUpperCase());
    await render(() => <><form id="external" /><Select.Root multiple value={values} name="country" form="external" itemToStringValue={stringify} required><Select.Value /></Select.Root></>);
    const form = document.getElementById('external') as HTMLFormElement;
    expect(new FormData(form).getAll('country')).toEqual(['US', 'CA']);
    expect(screen.getByRole('textbox', { hidden: true })).not.toHaveAttribute('required');
    expect(stringify.mock.calls.every(([value]) => !Array.isArray(value))).toBe(true);
  });
  it('keeps empty multiple selection required and nameless', async () => {
    await render(() => <Select.Root multiple value={[]} name="fruit" required><Select.Value placeholder="Pick" /></Select.Root>);
    const input = screen.getByRole('textbox', { hidden: true });
    expect(input).toHaveAttribute('required');
    expect(input).not.toHaveAttribute('name');
    expect(document.querySelectorAll('input[name="fruit"]')).toHaveLength(0);
  });
  it('cancellation leaves the single value unchanged while selection still closes', async () => {
    const onValueChange = vi.fn((_value, details) => details.cancel());
    const view = await render(() => <Fixture defaultOpen defaultValue="a" onValueChange={onValueChange} />);
    await view.user.click(screen.getByRole('option', { name: 'Banana' }));
    expect(onValueChange).toHaveBeenCalledOnce();
    expect(screen.getByRole('combobox')).toHaveTextContent('a');
    await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());
  });
  it('controlled requests do not acknowledge themselves', async () => {
    const changed = vi.fn();
    const view = await render(() => <Fixture defaultOpen value="a" onValueChange={changed} />);
    await view.user.click(screen.getByRole('option', { name: 'Banana' }));
    expect(changed.mock.calls[0][0]).toBe('b');
    expect(screen.getByRole('combobox')).toHaveTextContent('a');
  });
  it('honors native reset and its default prevention', async () => {
    const Command = () => {
      const model = useSelectRootContext();
      return <button type="button" onClick={() => model.setValue('b', createChangeEventDetails('none'))}>Change</button>;
    };
    await render(() => <form><Select.Root defaultValue="a" name="fruit"><Select.Value /><Command /></Select.Root></form>);
    const form = document.querySelector('form')!;
    fireEvent.click(screen.getByText('Change')); flush();
    expect(new FormData(form).get('fruit')).toBe('b');
    form.reset();
    await waitFor(() => expect(new FormData(form).get('fruit')).toBe('a'));
    form.addEventListener('reset', event => event.preventDefault(), { once: true });
    fireEvent.click(screen.getByText('Change')); flush(); form.reset();
    await Promise.resolve();
    expect(new FormData(form).get('fruit')).toBe('b');
  });
  it('matches autofill serialized values before earlier rendered labels, case-insensitively', async () => {
    await render(() => <Select.Root name="country"><Select.Value /><Select.Portal><Select.Positioner alignItemWithTrigger={false}><Select.Popup><Select.Item value="CA">US</Select.Item><Select.Item value="US">United States</Select.Item></Select.Popup></Select.Positioner></Select.Portal></Select.Root>);
    fireEvent.change(screen.getByRole('textbox', { hidden: true }), { target: { value: 'us' } });
    await waitFor(() => expect(screen.getByText('US', { selector: 'span' })).toBeInTheDocument());
  });
  it.each(['disabled', 'readOnly', 'multiple'] as const)('ignores scalar autofill in %s mode', async mode => {
    const changed = vi.fn();
    await render(() => <Fixture {...{ [mode]: true }} name="fruit" onValueChange={changed} />);
    fireEvent.change(screen.getByRole('textbox', { hidden: true }), { target: { value: 'Banana' } });
    await Promise.resolve();
    expect(changed).not.toHaveBeenCalled();
  });
  it('no-match autofill leaves the selected value unchanged', async () => {
    const changed = vi.fn();
    await render(() => <Fixture defaultValue="a" name="fruit" onValueChange={changed} />);
    fireEvent.change(screen.getByRole('textbox', { hidden: true }), { target: { value: 'missing' } });
    await Promise.resolve();
    expect(changed).not.toHaveBeenCalled();
    expect(screen.getByRole('combobox')).toHaveTextContent('a');
  });
});

describe('Select interactions and lifecycle', () => {
  it('toggles multiple selection without closing', async () => {
    const changed = vi.fn();
    const view = await render(() => <Fixture multiple defaultValue={null} defaultOpen onValueChange={changed} />);
    const banana = screen.getByRole('option', { name: 'Banana' });
    await view.user.click(banana);
    expect(banana).toHaveAttribute('data-selected');
    expect(changed.mock.calls[0][0]).toEqual(['b']);
    await view.user.click(banana);
    expect(changed.mock.calls[1][0]).toEqual([]);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });
  it.each(['disabled', 'readOnly'] as const)('cannot commit from forced-open %s root', async mode => {
    const changed = vi.fn();
    const view = await render(() => <Fixture {...{ [mode]: true }} open onValueChange={changed} />);
    await view.user.click(screen.getByRole('option', { name: 'Banana' }));
    expect(changed).not.toHaveBeenCalled();
  });
  it('readOnly still opens and browses via keyboard', async () => {
    const view = await render(() => <Fixture readOnly />);
    screen.getByRole('combobox').focus();
    await view.user.keyboard('{ArrowDown}');
    const list = await screen.findByRole('listbox');
    expect(list).toHaveAttribute('aria-readonly', 'true');
    await waitFor(() => expect(screen.getByRole('option', { name: 'Apple' })).toHaveFocus());
    await view.user.keyboard('{End}');
    await waitFor(() => expect(screen.getByRole('option', { name: 'Cherry' })).toHaveFocus());
  });
  it('closed typeahead skips disabled options and keeps the popup closed', async () => {
    const view = await render(() => <Select.Root><Select.Trigger><Select.Value /></Select.Trigger><Select.Portal><Select.Positioner alignItemWithTrigger={false}><Select.Popup><Select.Item value="apricot" disabled>Apricot</Select.Item><Select.Item value="avocado">Avocado</Select.Item></Select.Popup></Select.Positioner></Select.Portal></Select.Root>);
    screen.getByRole('combobox').focus();
    await view.user.keyboard('a');
    expect(screen.getByRole('combobox')).toHaveTextContent('avocado');
    expect(screen.queryByRole('listbox')).toBeNull();
  });
  it('imperative highlight targets never wrap and none returns popup focus', async () => {
    let actions: SelectRootActions | null = null;
    const view = await render(() => <Fixture actionsRef={value => { actions = value; }} />);
    actions!.highlightItem('last'); flush();
    expect(screen.queryByRole('listbox')).toBeNull();
    await view.user.click(screen.getByRole('combobox'));
    await screen.findByRole('listbox');
    for (const [target, label] of [['first', 'Apple'], ['previous', 'Apple'], ['next', 'Banana'], ['last', 'Cherry'], ['next', 'Cherry']] as const) {
      actions!.highlightItem(target); flush();
      await waitFor(() => expect(screen.getByRole('option', { name: label })).toHaveFocus());
    }
    actions!.highlightItem('none'); flush();
    await waitFor(() => expect(screen.getByRole('listbox').parentElement).toHaveFocus());
    expect(screen.getAllByRole('option').some(item => item.hasAttribute('data-highlighted'))).toBe(false);
  });
  it('handles all imperative targets on an empty list without opening', async () => {
    let actions: SelectRootActions | null = null;
    await render(() => <Select.Root actionsRef={value => { actions = value; }}><Select.Trigger /><Select.Portal><Select.Positioner alignItemWithTrigger={false}><Select.Popup /></Select.Positioner></Select.Portal></Select.Root>);
    for (const target of ['first', 'last', 'next', 'previous', 'none'] as const) actions!.highlightItem(target);
    flush(); expect(screen.queryByRole('listbox')).toBeNull();
  });
  it('keeps manual closing mounted, handles batched close/unmount once', async () => {
    let actions: SelectRootActions | null = null;
    const completed = vi.fn();
    await render(() => <Fixture defaultOpen actionsRef={value => { actions = value; }} onOpenChange={(_open, details) => details.preventUnmountOnClose()} onOpenChangeComplete={completed} />);
    actions!.unmount(); flush(); expect(screen.getByRole('listbox')).toBeInTheDocument();
    actions!.close(); actions!.unmount(); actions!.unmount(); flush();
    await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());
    expect(completed.mock.calls.filter(([open]) => !open)).toHaveLength(1);
  });
  it('canceled closes do not leave a stale manual-unmount opt-out', async () => {
    let cancel = true;
    const view = await render(() => <Fixture defaultOpen onOpenChange={(open, details) => { if (!open && cancel) { details.preventUnmountOnClose(); details.cancel(); } }} />);
    await view.user.click(screen.getByRole('option', { name: 'Banana' }));
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'true');
    cancel = false;
    await view.user.click(screen.getByRole('option', { name: 'Apple' }));
    await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());
  });
  it('uses fresh callbacks after live prop replacement', async () => {
    const old = vi.fn(); const next = vi.fn();
    const view = await renderProps(Fixture, { defaultOpen: true, onValueChange: old });
    await view.setProps({ onValueChange: next });
    await view.user.click(screen.getByRole('option', { name: 'Banana' }));
    expect(old).not.toHaveBeenCalled(); expect(next).toHaveBeenCalledOnce();
  });
  it('retains object identity and calls multiple comparers only per item', async () => {
    const item = { id: 1, label: 'One' };
    const equal = vi.fn((a: typeof item, b: typeof item) => { if (Array.isArray(b)) throw new Error('array passed to equality'); return a.id === b.id; });
    const view = await render(() => <Select.Root multiple defaultOpen defaultValue={[{ ...item }]} isItemEqualToValue={equal}><Select.Trigger><Select.Value /></Select.Trigger><Select.Portal><Select.Positioner alignItemWithTrigger={false}><Select.Popup><Select.Item value={item}>One</Select.Item></Select.Popup></Select.Positioner></Select.Portal></Select.Root>);
    const option = screen.getByRole('option'); expect(option).toHaveAttribute('data-selected');
    await view.user.click(option); expect(option).not.toHaveAttribute('data-selected');
    expect(equal.mock.calls.every(([, value]) => !Array.isArray(value))).toBe(true);
  });
  it('reconciles same-count item replacement through the shared registry', async () => {
    await render(() => {
      const [items, setItems] = createSignal(['a', 'b']);
      return <><button onClick={() => setItems(['a', 'd'])}>Replace</button><Select.Root defaultOpen defaultValue="b"><Select.Trigger><Select.Value placeholder="Pick" /></Select.Trigger><Select.Portal><Select.Positioner alignItemWithTrigger={false}><Select.Popup>{items().map(value => <Select.Item value={value}>{value}</Select.Item>)}</Select.Popup></Select.Positioner></Select.Portal></Select.Root></>;
    });
    fireEvent.click(screen.getByText('Replace'));
    await waitFor(() => expect(screen.getByRole('combobox').textContent?.replace('▼', '')).toBe('Pick'));
    expect(screen.getAllByRole('option').every(item => !item.hasAttribute('data-selected'))).toBe(true);
  });
});
