// Pinned NumberFieldRoot.test.tsx Form/Field integration, using the real public parts.
import { describe, expect, it, vi } from 'vitest';
import { createSignal, flush } from 'solid-js';
import { createRenderer, fireEvent, flushMicrotasks, screen, waitFor } from '../../test';
import { Field } from '../field';
import { Form } from '../form/Form';
import { NumberField } from './index';

describe('NumberField real Form/Field source semantics', () => {
  const { render } = createRenderer();
  it('blocks native step mismatch, projects its error, revalidates and submits a raw number', async () => {
    const submit = vi.fn();
    await render(() => <Form onFormSubmit={submit}>
      <Field.Root name="quantity">
        <NumberField.Root min={0} step={0.1}>
          <NumberField.Input /><NumberField.Increment />
        </NumberField.Root>
        <Field.Error match="stepMismatch" data-testid="error">step mismatch</Field.Error>
      </Field.Root>
      <button type="submit">Submit</button>
    </Form>);
    const input = screen.getByRole('textbox');
    const button = screen.getByText('Submit');
    fireEvent.input(input, { target: { value: '0.11' } }); flush();
    fireEvent.click(button); flush();
    expect(submit).not.toHaveBeenCalled();
    const error = screen.getByTestId('error');
    expect(error).toHaveTextContent('step mismatch');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    fireEvent.input(input, { target: { value: '0.1' } }); flush();
    expect(input).not.toHaveAttribute('aria-invalid');
    expect(document.querySelector<HTMLInputElement>('input[type=number]')!.validity.stepMismatch).toBe(false);
    await waitFor(() => expect(error).not.toBeInTheDocument());
    expect(screen.queryByTestId('error')).toBeNull();
    fireEvent.click(button); flush();
    expect(submit.mock.lastCall?.[0]).toEqual({ quantity: 0.1 });
  });
  it('clears required submit errors using a stepper without an additional blur commit', async () => {
    const commit = vi.fn();
    const view = await render(() => <Form>
      <Field.Root name="quantity">
        <NumberField.Root required onValueCommitted={commit}><NumberField.Input /><NumberField.Increment /></NumberField.Root>
        <Field.Error match="valueMissing" data-testid="error">required</Field.Error>
      </Field.Root><button type="submit">Submit</button>
    </Form>);
    await view.user.click(screen.getByText('Submit'));
    const error = screen.getByTestId('error');
    expect(error).toHaveTextContent('required');
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
    await view.user.click(screen.getByLabelText('Increase'));
    expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-invalid');
    await waitFor(() => expect(error).not.toBeInTheDocument());
    expect(screen.queryByTestId('error')).toBeNull();
    fireEvent.blur(screen.getByRole('textbox')); flush();
    expect(commit).toHaveBeenCalledTimes(1);
    expect(commit.mock.lastCall?.[0]).toBe(0);
  });
  it('projects label/description and clears server errors on numeric changes', async () => {
    await render(() => <Form errors={{ quantity: 'server error' }}>
      <Field.Root name="quantity">
        <NumberField.Root defaultValue={1}>
          <NumberField.Input aria-describedby="external-description" />
        </NumberField.Root>
        <Field.Label data-testid="label">Quantity</Field.Label>
        <Field.Description data-testid="description">Amount to purchase</Field.Description>
        <Field.Error data-testid="error" />
      </Field.Root>
    </Form>);
    const input = screen.getByRole<HTMLInputElement>('textbox');
    const error = screen.getByTestId('error');
    expect(screen.getByTestId('label')).toHaveAttribute('for', input.id);
    expect(input).toHaveAttribute('aria-describedby', `external-description ${screen.getByTestId('description').id} ${screen.getByTestId('error').id}`);
    expect(input).toHaveAttribute('aria-invalid', 'true');
    fireEvent.input(input, { target: { value: '5' } }); flush();
    expect(input).not.toHaveAttribute('aria-invalid');
    expect(input).toHaveAttribute('aria-describedby', `external-description ${screen.getByTestId('description').id}`);
    await waitFor(() => expect(error).not.toBeInTheDocument());
    expect(screen.queryByTestId('error')).toBeNull();
  });
  it('validates the autofilled native input once across input/change, including cancellation', async () => {
    const validate = vi.fn((_value: unknown) => null);
    await render(() => <Field.Root validationMode="onChange" validate={validate}>
      <NumberField.Root onValueChange={(_value, details) => details.cancel()}><NumberField.Input /></NumberField.Root>
    </Field.Root>);
    const hidden = document.querySelector<HTMLInputElement>('input[type=number]')!;
    fireEvent.input(hidden, { target: { value: '7' } }); flush();
    fireEvent.change(hidden); flush();
    expect(screen.getByRole('textbox')).toHaveValue('');
    expect(validate).toHaveBeenCalledTimes(1);
    expect(validate.mock.lastCall?.[0]).toBe(7);
  });
  it('validates the latest clamped candidate on blur and revalidates external updates', async () => {
    const validate = vi.fn((value: unknown) => value === 5 ? 'error' : null);
    await render(() => {
      const [value, setValue] = createSignal<number | null>(5);
      return <Form><Field.Root name="quantity" validationMode="onBlur" validate={validate}>
        <NumberField.Root value={value()} max={5} onValueChange={setValue}><NumberField.Input /></NumberField.Root>
        <Field.Error data-testid="error" />
      </Field.Root><button type="button" onClick={() => setValue(3)}>External</button></Form>;
    });
    const input = screen.getByRole('textbox');
    fireEvent.input(input, { target: { value: '9' } }); flush();
    fireEvent.blur(input); flush();
    expect(validate.mock.lastCall).toEqual([5, { quantity: 5 }]);
    expect(input).toHaveAttribute('aria-invalid', 'true');
    fireEvent.click(screen.getByText('External')); await flushMicrotasks();
    expect(input).not.toHaveAttribute('aria-invalid');
  });
});
