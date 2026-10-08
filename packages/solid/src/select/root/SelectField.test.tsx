import type { JSX } from '@solidjs/web';
import { describe, expect, it, vi } from 'vitest';
import { createRenderer, fireEvent, screen, waitFor } from '../../../test';
import { createField, type FieldOptions } from '../../internals/field-core';
import { FieldRootContext, useFieldRootContext } from '../../internals/field-root-context';
import { LabelableProvider } from '../../internals/labelable-provider';
import { Form } from '../../form/Form';
import { useFormContext } from '../../internals/form-context';
import { Select } from '../index';
import { Field } from '../../field';

const { render } = createRenderer();
function FieldScope(props: FieldOptions & { children?: JSX.Element }) {
  const Owner = () => {
    const field = createField(props);
    return <FieldRootContext value={field}>{props.children}</FieldRootContext>;
  };
  return <LabelableProvider><Owner /></LabelableProvider>;
}
function Popup() {
  return <Select.Portal><Select.Positioner alignItemWithTrigger={false}><Select.Popup>
    <Select.Item value="a">Apple</Select.Item><Select.Item value="b">Banana</Select.Item>
  </Select.Popup></Select.Positioner></Select.Portal>;
}
function FieldObservation() {
  const field = useFieldRootContext();
  return <output data-testid="field-state" data-dirty={field?.state.dirty ? '' : undefined}
    data-filled={field?.state.filled ? '' : undefined}>{JSON.stringify(field?.validityData.initialValue)}</output>;
}

describe('Select real field-core registration and validation', () => {
  it('gives the surrounding Field label precedence over a separately scoped Select.Label', async () => {
    await render(() => <Field.Root><Field.Label data-testid="field-label">Outer label</Field.Label>
      <Select.Root><LabelableProvider><Select.Label>Local label</Select.Label></LabelableProvider><Select.Trigger>Open</Select.Trigger></Select.Root>
    </Field.Root>);
    const fieldLabel = screen.getByTestId('field-label');
    const trigger = screen.getByRole('combobox');
    expect(trigger).toHaveAttribute('aria-labelledby', fieldLabel.id);
    expect(trigger).toHaveAccessibleName('Outer label');
  });
  it('Field name takes precedence and disabled state excludes native submission', async () => {
    await render(() => <form><FieldScope name="field" disabled><Select.Root name="select" defaultValue="a"><Select.Trigger><Select.Value /></Select.Trigger></Select.Root></FieldScope></form>);
    expect(screen.getByRole('combobox')).toBeDisabled();
    expect(screen.getByRole('textbox', { hidden: true })).toHaveAttribute('name', 'field');
    expect(new FormData(document.querySelector('form')!).get('field')).toBeNull();
  });
  it('accepted autofill marks dirty/filled and validates the committed scalar value', async () => {
    const validate = vi.fn(() => null);
    await render(() => <FieldScope name="fruit" validationMode="onChange" validate={validate}><Select.Root>
      <Select.Trigger><Select.Value /></Select.Trigger><Popup />
    </Select.Root><FieldObservation /></FieldScope>);
    const trigger = screen.getByRole('combobox');
    expect(trigger).not.toHaveAttribute('data-dirty');
    fireEvent.change(screen.getByRole('textbox', { hidden: true }), { target: { value: 'Banana' } });
    await waitFor(() => expect(trigger).toHaveAttribute('data-dirty'));
    expect(trigger).toHaveAttribute('data-filled');
    expect(screen.getByTestId('field-state')).toHaveAttribute('data-dirty');
    expect(screen.getByTestId('field-state')).toHaveAttribute('data-filled');
    expect(screen.getByTestId('field-state')).toHaveTextContent('null');
    expect(screen.getByRole('combobox')).toBe(trigger);
    await waitFor(() => expect(validate).toHaveBeenCalledWith('b', expect.anything()));
  });
  it('canceled autofill preserves field validity, dirty state and external form errors', async () => {
    const validate = vi.fn(() => null);
    const Errors = () => { const form = useFormContext(); return <span data-testid="error">{form?.errors.fruit}</span>; };
    await render(() => <Form errors={{ fruit: 'server error' }}><Errors /><FieldScope name="fruit" validationMode="onChange" validate={validate}>
      <Select.Root onValueChange={(_value, details) => details.cancel()}><Select.Trigger><Select.Value /></Select.Trigger><Popup /></Select.Root>
    </FieldScope></Form>);
    const input = screen.getByRole('textbox', { hidden: true });
    fireEvent.change(input, { target: { value: 'b' } });
    await Promise.resolve();
    expect(screen.getByRole('combobox')).not.toHaveAttribute('data-dirty');
    expect(screen.getByTestId('error')).toHaveTextContent('server error');
    expect(input).toHaveValue('');
    expect(validate).not.toHaveBeenCalled();
  });
  it('clears errors only after an accepted committed value change', async () => {
    const Errors = () => { const form = useFormContext(); return <span data-testid="error">{form?.errors.fruit}</span>; };
    const view = await render(() => <Form errors={{ fruit: 'server error' }}><Errors /><FieldScope name="fruit"><Select.Root defaultOpen>
      <Select.Trigger><Select.Value /></Select.Trigger><Popup />
    </Select.Root></FieldScope></Form>);
    await view.user.click(screen.getByRole('option', { name: 'Banana' }));
    await waitFor(() => expect(screen.getByTestId('error').textContent).toBe(''));
  });
  it('multiple dirty comparison is ordered and returns clean only to the initial order', async () => {
    const view = await render(() => <FieldScope><Select.Root multiple defaultOpen defaultValue={['a', 'b']}>
      <Select.Trigger><Select.Value /></Select.Trigger><Popup />
    </Select.Root><FieldObservation /></FieldScope>);
    const trigger = screen.getByRole('combobox');
    const apple = screen.getByRole('option', { name: 'Apple' });
    await view.user.click(apple); await view.user.click(apple);
    expect(trigger).toHaveAttribute('data-dirty');
    expect(screen.getByTestId('field-state')).toHaveAttribute('data-dirty');
    expect(screen.getByTestId('field-state').textContent).toBe('["a","b"]');
    const banana = screen.getByRole('option', { name: 'Banana' });
    await view.user.click(banana); await view.user.click(banana);
    await waitFor(() => expect(trigger).not.toHaveAttribute('data-dirty'));
    expect(screen.getByTestId('field-state')).not.toHaveAttribute('data-dirty');
    expect(screen.getByRole('combobox')).toBe(trigger);
  });
  it('object multiple dirty comparison uses the item comparer rather than reference equality', async () => {
    const value = { id: 1, label: 'One' };
    const view = await render(() => <FieldScope><Select.Root multiple defaultOpen defaultValue={[{ ...value }]} isItemEqualToValue={(a, b) => a.id === b.id}>
      <Select.Trigger><Select.Value /></Select.Trigger><Select.Portal><Select.Positioner alignItemWithTrigger={false}><Select.Popup><Select.Item value={value}>One</Select.Item></Select.Popup></Select.Positioner></Select.Portal>
    </Select.Root><FieldObservation /></FieldScope>);
    const option = screen.getByRole('option');
    const trigger = screen.getByRole('combobox');
    await view.user.click(option); expect(screen.getByRole('combobox')).toHaveAttribute('data-dirty');
    expect(screen.getByTestId('field-state')).toHaveAttribute('data-dirty');
    await view.user.click(option);
    await waitFor(() => expect(screen.getByRole('combobox')).not.toHaveAttribute('data-dirty'));
    expect(screen.getByTestId('field-state')).not.toHaveAttribute('data-dirty');
    expect(screen.getByTestId('field-state').textContent).toBe(JSON.stringify([value]));
    expect(screen.getByRole('combobox')).toBe(trigger);
  });
  it('publishes controlled scalar dirty/filled transitions and clears only at the original null baseline', async () => {
    const validate = vi.fn((_value: unknown) => null);
    const view = await createRenderer().renderProps<{ value: string | null }>((props) =>
      <Field.Root name="fruit" validationMode="onChange" validate={validate}><Select.Root value={props.value}>
        <Select.Trigger><Select.Value /></Select.Trigger>
      </Select.Root><FieldObservation /></Field.Root>, { value: null });
    const trigger = screen.getByRole('combobox');
    const initialCalls = validate.mock.calls.length;
    for (const [index, value] of ['b', null, 'a'].entries()) {
      await view.setProps({ value });
      expect(validate).toHaveBeenCalledTimes(initialCalls + index + 1);
      expect(validate.mock.lastCall?.[0]).toBe(value);
      if (value === null) {
        expect(trigger).not.toHaveAttribute('data-dirty');
        expect(trigger).not.toHaveAttribute('data-filled');
        expect(screen.getByTestId('field-state')).not.toHaveAttribute('data-dirty');
      } else {
        expect(trigger).toHaveAttribute('data-dirty');
        expect(trigger).toHaveAttribute('data-filled');
        expect(screen.getByTestId('field-state')).toHaveAttribute('data-dirty');
      }
      expect(screen.getByTestId('field-state')).toHaveTextContent('null');
      expect(screen.getByRole('combobox')).toBe(trigger);
    }
  });
  it('registers per-value serialization for real Form submit without passing the array to stringifiers', async () => {
    const submit = vi.fn();
    const view = await render(() => <Form onFormSubmit={submit}><FieldScope name="fruit"><Select.Root multiple value={[{ code: 'a' }, { code: 'b' }] as const} itemToStringValue={item => item.code.toUpperCase()}>
      <Select.Trigger><Select.Value /></Select.Trigger>
    </Select.Root></FieldScope><button type="submit">Submit</button></Form>);
    await view.user.click(screen.getByText('Submit'));
    expect(submit.mock.calls[0][0]).toEqual({ fruit: ['A', 'B'] });
  });
});
