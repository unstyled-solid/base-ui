// Root/Input source Field cases use the engine seam, not public Field or Form imports.
import { describe, expect, it, vi } from 'vitest';
import { flush } from 'solid-js';
import { createRenderer, fireEvent, screen } from '../../test';
import { createField } from '../internals/field-core';
import { FieldRootContext } from '../internals/field-root-context';
import { LabelableProvider } from '../internals/labelable-provider';
import { NumberFieldRoot } from './root/NumberFieldRoot';
import { NumberFieldInput } from './input/NumberFieldInput';
import type { NumberFieldRootProps } from './root/NumberFieldRoot';

function Bridge(props: NumberFieldRootProps & { validationMode?: 'onBlur' | 'onChange'; validate?: (value: unknown) => string | null; mounted?: boolean }) {
  const field = createField({ get name() { return 'amount'; }, get disabled() { return props.disabled; },
    get validationMode() { return props.validationMode; }, get validate() { return props.validate; } });
  return <LabelableProvider><FieldRootContext value={field}>
    <div data-testid="field" data-focused={field.state.focused ? '' : undefined}>
      {props.mounted !== false && <NumberFieldRoot value={props.value} defaultValue={props.defaultValue}
        max={props.max} readOnly={props.readOnly} onValueChange={props.onValueChange} onValueCommitted={props.onValueCommitted}>
        <NumberFieldInput />
      </NumberFieldRoot>}
    </div>
  </FieldRootContext></LabelableProvider>;
}
describe('NumberField field-core source projection', () => {
  const { render, renderProps } = createRenderer();
  it('projects dirty, filled, focused and touched without losing readOnly focus', async () => {
    await render(() => <Bridge />);
    const node = screen.getByRole('textbox');
    fireEvent.focus(node); flush(); expect(node).toHaveAttribute('data-focused');
    fireEvent.input(node, { target: { value: '1' } }); flush();
    expect(node).toHaveAttribute('data-dirty'); expect(node).toHaveAttribute('data-filled');
    fireEvent.blur(node); flush(); expect(node).toHaveAttribute('data-touched'); expect(node).not.toHaveAttribute('data-focused');
  });
  it('removes focus ownership on disable and unmount without a native blur', async () => {
    const view = await renderProps<Parameters<typeof Bridge>[0]>(Bridge, { readOnly: true });
    fireEvent.focus(screen.getByRole('textbox')); flush(); expect(screen.getByTestId('field')).toHaveAttribute('data-focused');
    await view.setProps({ disabled: true }); expect(screen.getByTestId('field')).not.toHaveAttribute('data-focused');
    await view.setProps({ disabled: false }); fireEvent.focus(screen.getByRole('textbox')); flush();
    await view.setProps({ mounted: false }); expect(screen.getByTestId('field')).not.toHaveAttribute('data-focused');
  });
  it('validates the clamped candidate on blur and revalidates later external changes', async () => {
    const validate = vi.fn((value: unknown) => value === 5 ? 'error' : null);
    const view = await renderProps<Parameters<typeof Bridge>[0]>(Bridge, { value: 5, max: 5, validationMode: 'onBlur', validate });
    const node = screen.getByRole('textbox');
    fireEvent.input(node, { target: { value: '9' } }); flush(); fireEvent.blur(node); flush();
    expect(validate.mock.lastCall?.[0]).toBe(5);
    expect(node).toHaveAttribute('aria-invalid', 'true');
    await view.setProps({ value: 3 });
    expect(node).not.toHaveAttribute('aria-invalid');
  });
  it('retains source canceled-autofill validation while keeping numeric state unchanged', async () => {
    const validate = vi.fn((_value: unknown) => null);
    await render(() => <Bridge validationMode="onChange" validate={validate} onValueChange={(_value, details) => details.cancel()} />);
    fireEvent.change(document.querySelector('input[type=number]')!, { target: { value: '7' } }); flush();
    expect(screen.getByRole('textbox')).toHaveValue('');
    expect(validate.mock.lastCall?.[0]).toBe(7);
  });
});
