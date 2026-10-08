import type { JSX } from '@solidjs/web';
import { createSignal } from 'solid-js';
import { describe, expect, it, vi } from 'vitest';
import { createRenderer, screen } from '../../../test';
import { Select } from '../index';
import type { SelectRootProps } from '../root/SelectRoot';

const { render, renderProps } = createRenderer();
interface CaseProps extends Pick<SelectRootProps<any, boolean>, 'value' | 'items' | 'multiple' | 'itemToStringLabel' | 'itemToStringValue'> {
  content?: JSX.Element | ((value: any) => JSX.Element); placeholder?: JSX.Element;
}
function Fixture(props: CaseProps) {
  return <Select.Root value={props.value} items={props.items} multiple={props.multiple} itemToStringLabel={props.itemToStringLabel} itemToStringValue={props.itemToStringValue}>
    <Select.Value data-testid="value" placeholder={props.placeholder}>{props.content}</Select.Value>
  </Select.Root>;
}
const cases: readonly [string, CaseProps, string][] = [
  ['record', { value: 'a', items: { a: 'Apple' } }, 'Apple'],
  ['record fallback', { value: 'missing', items: { a: 'Apple' } }, 'missing'],
  ['record null', { value: null, items: { null: 'None' } }, 'None'],
  ['array', { value: 'a', items: [{ value: 'a', label: 'Apple' }] }, 'Apple'],
  ['array fallback', { value: 'missing', items: [{ value: 'a', label: 'Apple' }] }, 'missing'],
  ['grouped array', { value: 'a', items: [{ heading: 'Fruit', items: [{ value: 'a', label: 'Apple' }] }] }, 'Apple'],
  ['automatic object label', { value: { value: 'a', label: 'Apple' } }, 'Apple'],
  ['object value lookup', { value: { value: 'a' }, items: [{ value: 'a', label: 'Apple' }] }, 'Apple'],
  ['custom object label', { value: { code: 'a' }, itemToStringLabel: item => `Code ${item.code}` }, 'Code a'],
  ['children overrides record', { value: 'a', items: { a: 'Apple' }, content: 'Custom' }, 'Custom'],
  ['children function overrides array', { value: 'a', items: [{ value: 'a', label: 'Apple' }], content: value => `Custom ${value}` }, 'Custom a'],
  ['null placeholder', { value: null, placeholder: 'Pick' }, 'Pick'],
  ['selected hides placeholder', { value: 'a', placeholder: 'Pick' }, 'a'],
  ['children overrides placeholder', { value: null, placeholder: 'Pick', content: 'Custom' }, 'Custom'],
  ['function overrides placeholder', { value: null, placeholder: 'Pick', content: value => value ?? 'Custom' }, 'Custom'],
  ['array null label overrides placeholder', { value: null, items: [{ value: null, label: 'None' }], placeholder: 'Pick' }, 'None'],
  ['record null label overrides placeholder', { value: null, items: { null: 'None' }, placeholder: 'Pick' }, 'None'],
  ['missing null label uses placeholder', { value: null, items: [{ value: null, label: null }], placeholder: 'Pick' }, 'Pick'],
  ['group null label overrides placeholder', { value: null, items: [{ items: [{ value: null, label: 'None' }] }], placeholder: 'Pick' }, 'None'],
  ['multiple record', { multiple: true, value: ['a', 'b'], items: { a: 'Apple', b: 'Banana' } }, 'Apple, Banana'],
  ['multiple array', { multiple: true, value: ['a', 'b'], items: [{ value: 'a', label: 'Apple' }, { value: 'b', label: 'Banana' }] }, 'Apple, Banana'],
  ['multiple raw', { multiple: true, value: ['a', 'b'] }, 'a, b'],
  ['multiple single', { multiple: true, value: ['a'] }, 'a'],
  ['multiple empty', { multiple: true, value: [] }, ''],
  ['multiple placeholder', { multiple: true, value: [], placeholder: 'Pick' }, 'Pick'],
  ['multiple children function', { multiple: true, value: ['a', 'b'], content: value => value.join(' + ') }, 'a + b'],
  ['multiple children override', { multiple: true, value: ['a', 'b'], items: { a: 'Apple', b: 'Banana' }, content: 'Custom' }, 'Custom'],
];
describe('Select.Value pinned label and placeholder semantics', () => {
  it('passes the scalar value on the first children call before opening', async () => {
    const children = vi.fn();
    const view = await render(() => <Select.Root value="1">
      <Select.Trigger><Select.Value>{value => { children(value); return value; }}</Select.Value></Select.Trigger>
      <Select.Portal><Select.Positioner><Select.Popup><Select.Item value="1">one</Select.Item></Select.Popup></Select.Positioner></Select.Portal>
    </Select.Root>);
    await view.user.click(screen.getByText('1'));
    expect(children.mock.calls[0]?.[0]).toBe('1');
    expect(children.mock.calls[0]?.at(-1)).toBe('1');
  });
  it.each(['record', 'array'] as const)('updates a stable %s lookup through two external value changes', async format => {
    const labels = { sans: 'Sans-serif', serif: 'Serif', mono: 'Monospace' };
    const items = format === 'record' ? labels : Object.entries(labels).map(([value, label]) => ({ value, label }));
    const view = await render(() => {
      const [value, setValue] = createSignal<string | null>('sans');
      return <><button onClick={() => setValue('serif')}>serif</button><button onClick={() => setValue('mono')}>mono</button>
        <Select.Root value={value()} onValueChange={setValue} items={items}>
          <Select.Trigger><Select.Value data-testid="value" /></Select.Trigger>
          <Select.Portal><Select.Positioner><Select.Popup>
            <Select.Item value="sans">Sans-serif</Select.Item><Select.Item value="serif">Serif</Select.Item><Select.Item value="mono">Monospace</Select.Item>
          </Select.Popup></Select.Positioner></Select.Portal>
        </Select.Root></>;
    });
    expect(screen.getByTestId('value')).toHaveTextContent('Sans-serif');
    await view.user.click(screen.getByRole('button', { name: 'serif' }));
    expect(screen.getByTestId('value')).toHaveTextContent('Serif');
    await view.user.click(screen.getByRole('button', { name: 'mono' }));
    expect(screen.getByTestId('value')).toHaveTextContent('Monospace');
  });
  it('updates scalar children text after opening and restores the null fallback', async () => {
    const view = await render(() => {
      const [value, setValue] = createSignal<string | null>(null);
      return <><button onClick={() => setValue('1')}>1</button><button onClick={() => setValue('2')}>2</button><button onClick={() => setValue(null)}>null</button>
        <Select.Root value={value()} onValueChange={setValue}>
          <Select.Trigger><Select.Value data-testid="value">{val => val ?? 'initial'}</Select.Value></Select.Trigger>
          <Select.Portal><Select.Positioner><Select.Popup><Select.Item value="1">1</Select.Item><Select.Item value="2">2</Select.Item></Select.Popup></Select.Positioner></Select.Portal>
        </Select.Root></>;
    });
    await view.user.click(screen.getByText('initial'));
    await view.user.click(screen.getByRole('button', { name: '1' }));
    expect(screen.getByTestId('value')).toHaveTextContent('1');
    await view.user.click(screen.getByRole('button', { name: '2' }));
    expect(screen.getByTestId('value')).toHaveTextContent('2');
    await view.user.click(screen.getByRole('button', { name: 'null' }));
    expect(screen.getByTestId('value')).toHaveTextContent('initial');
  });
  it('passes the raw multiple array on the first children call despite record labels', async () => {
    const children = vi.fn();
    await render(() => <Select.Root multiple value={['sans', 'serif']} items={{ sans: 'Sans-serif', serif: 'Serif' }}>
      <Select.Value>{values => { children(values); return `Selected: ${values.join(' + ')}`; }}</Select.Value>
    </Select.Root>);
    expect(children.mock.calls[0]?.[0]).toEqual(['sans', 'serif']);
    expect(screen.getByText('Selected: sans + serif')).toBeInTheDocument();
  });
  it('displays the placeholder with an omitted value and no items', async () => {
    await render(() => <Select.Root><Select.Value data-testid="value" placeholder="Select an option" /></Select.Root>);
    expect(screen.getByTestId('value')).toHaveTextContent('Select an option');
  });
  it.each(cases)('%s', async (_name, props, expected) => {
    await render(() => <Fixture {...props} />);
    expect(screen.getByTestId('value').textContent).toBe(expected);
  });
  it('updates labels and items on one host while the popup is never mounted', async () => {
    const view = await renderProps(Fixture, { value: 'a', items: [{ value: 'a', label: 'Apple' }] });
    const value = screen.getByTestId('value');
    await view.setProps({ items: [{ value: 'a', label: 'New Apple' }, { value: 'c', label: 'Citrus' }] });
    expect(value.textContent).toBe('New Apple');
    await view.setProps({ value: 'c' });
    expect(screen.getByTestId('value')).toBe(value);
    expect(value.textContent).toBe('Citrus');
    expect(screen.queryByRole('listbox', { hidden: true })).toBeNull();
  });
  it('preserves JSX labels and separators rather than serializing them', async () => {
    await render(() => <Select.Root multiple value={['a', 'b']} items={[{ value: 'a', label: <strong>Apple</strong> }, { value: 'b', label: <em>Banana</em> }]}><Select.Value data-testid="value" /></Select.Root>);
    const value = screen.getByTestId('value');
    expect(value.querySelector('strong')).toHaveTextContent('Apple');
    expect(value.querySelector('em')).toHaveTextContent('Banana');
    expect(value.textContent).toBe('Apple, Banana');
  });
  it('keeps readonly multiple input identity when exposing children', async () => {
    const values = ['a', 'b'] as const;
    let received: unknown;
    await render(() => <Select.Root multiple value={values}><Select.Value>{value => { received = value; return value.join(', '); }}</Select.Value></Select.Root>);
    expect(received).toBe(values);
    expect(values).toEqual(['a', 'b']);
  });
  it('empty serialization marks placeholder while still displaying a custom object label', async () => {
    await render(() => <Select.Root value={{ code: '', label: 'Default' }} itemToStringValue={item => item.code}><Select.Value data-testid="value" /></Select.Root>);
    expect(screen.getByTestId('value')).toHaveAttribute('data-placeholder');
    expect(screen.getByTestId('value').textContent).toBe('Default');
  });
  it('preserves a JSX label in a single record lookup', async () => {
    await render(() => <Select.Root value="sans" items={{ sans: <span>Sans-serif</span> }}>
      <Select.Value data-testid="value" />
    </Select.Root>);
    expect(screen.getByTestId('value').querySelector('span')).toHaveTextContent('Sans-serif');
  });
  it('preserves a JSX label in a single array lookup', async () => {
    await render(() => <Select.Root value="bold" items={[{ value: 'bold', label: <strong>Bold Text</strong> }]}>
      <Select.Value data-testid="value" />
    </Select.Root>);
    expect(screen.getByTestId('value').querySelector('strong')).toHaveTextContent('Bold Text');
  });
  it('preserves JSX placeholder content', async () => {
    await render(() => <Select.Root><Select.Value placeholder={<span data-testid="placeholder">Select an option</span>} /></Select.Root>);
    expect(screen.getByTestId('placeholder')).toHaveTextContent('Select an option');
  });
  it('defaults multiple children to an empty value array', async () => {
    const received = vi.fn();
    await render(() => <Select.Root multiple><Select.Value>{value => { received(value); return ''; }}</Select.Value></Select.Root>);
    expect(received.mock.calls[0]?.[0]).toEqual([]);
  });
  it('serializes automatic object value properties into the named hidden input', async () => {
    await render(() => <Select.Root name="country" value={{ label: 'Canada', value: 'CA' }}>
      <Select.Trigger><Select.Value /></Select.Trigger>
    </Select.Root>);
    const input = screen.getByRole('textbox', { hidden: true });
    expect(input).toHaveValue('CA');
    expect(input).toHaveAttribute('name', 'country');
  });
  it('uses the placeholder for omitted value when a record has no null key', async () => {
    await render(() => <Select.Root items={{ option1: 'Option 1', option2: 'Option 2' }}>
      <Select.Value data-testid="value" placeholder="Select an option" />
    </Select.Root>);
    expect(screen.getByTestId('value')).toHaveTextContent('Select an option');
  });
});
