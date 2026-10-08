// Source-derived real control cases from React Form.test.tsx at
// 19511bb171f3b360b006c94cf6d07e53cb446505; no core-registration substitutes.
import { untrack } from 'solid-js';
import { describe, expect, it, vi } from 'vitest';
import { createRenderer, fireEvent, flushMicrotasks } from '../../test';
import { Form } from './Form';
import { Field } from '../field';
import { Checkbox } from '../checkbox';
import { Switch } from '../switch';
import { NumberField } from '../number-field';

const { render, renderProps } = createRenderer();
describe('Form real registered controls', () => {
  it('keeps focusing the first invalid Checkbox after its value changes twice', async () => {
    const submitted = vi.fn();
    const view = await render(() => <Form onFormSubmit={submitted}>
      <Field.Root name="a"><Checkbox.Root required data-testid="a" /></Field.Root>
      <Field.Root name="b"><Checkbox.Root required data-testid="b" /></Field.Root>
      <button type="submit">Submit</button>
    </Form>);
    const a = view.getByTestId('a'); const button = view.getByRole('button', { name: 'Submit' });
    await view.user.click(button);
    expect(a).toHaveFocus();
    await view.user.click(a); await view.user.click(a);
    await view.user.click(button);
    expect(a).toHaveFocus();
    expect(submitted).not.toHaveBeenCalled();
  });

  it('blocks an unnamed Switch and retires its invalid state on change', async () => {
    const submitted = vi.fn();
    const view = await render(() => <Form onFormSubmit={submitted}>
      <Field.Root><Switch.Root required /><Field.Error data-testid="error" /></Field.Root>
      <button type="submit">Submit</button>
    </Form>);
    const control = view.getByRole('switch'); const button = view.getByRole('button', { name: 'Submit' });
    await view.user.click(button);
    expect(submitted).not.toHaveBeenCalled();
    expect(control).toHaveAttribute('aria-invalid', 'true');
    expect(view.getByTestId('error')).toBeVisible();
    await view.user.click(control);
    expect(control).not.toHaveAttribute('aria-invalid');
    expect(view.queryByTestId('error')).toBeNull();
    await view.user.click(button);
    expect(submitted).toHaveBeenCalledTimes(1);
    expect(submitted.mock.lastCall?.[0]).toEqual({});
  });

  it('keeps same-name Switch validity field-scoped', async () => {
    const submitted = vi.fn();
    const view = await render(() => <Form onFormSubmit={submitted}>
      <Field.Root name="shared"><Switch.Root required data-testid="first" /><Field.Error data-testid="first-error" /></Field.Root>
      <Field.Root name="shared"><Switch.Root required defaultChecked data-testid="second" /><Field.Error data-testid="second-error" /></Field.Root>
      <button type="submit">Submit</button>
    </Form>);
    await view.user.click(view.getByRole('button'));
    expect(submitted).not.toHaveBeenCalled();
    expect(view.getByTestId('first')).toHaveAttribute('aria-invalid', 'true');
    expect(view.getByTestId('first-error')).toBeVisible();
    expect(view.getByTestId('second')).not.toHaveAttribute('aria-invalid');
    expect(view.queryByTestId('second-error')).toBeNull();
  });

  it('removes the previous registration when a later Switch takes over the same Field', async () => {
    const submitted = vi.fn();
    const view = await render(() => <Form onFormSubmit={submitted}>
      <Field.Root>
        <Switch.Root required data-testid="first" />
        <Switch.Root required defaultChecked data-testid="second" />
        <Field.Error data-testid="error" />
      </Field.Root>
      <button type="submit">Submit</button>
    </Form>);
    await view.user.click(view.getByRole('button'));
    expect(submitted).toHaveBeenCalledTimes(1);
    expect(view.queryByTestId('error')).toBeNull();
    expect(view.getByTestId('first')).not.toHaveAttribute('aria-invalid');
    expect(view.getByTestId('second')).not.toHaveAttribute('aria-invalid');
  });

  it('projects Field.Control strings and NumberField numeric values', async () => {
    const submitted = vi.fn();
    const view = await render(() => <Form onFormSubmit={submitted}>
      <Field.Root name="username"><Field.Control defaultValue="alice132" /></Field.Root>
      <Field.Root name="quantity"><NumberField.Root defaultValue={5}><NumberField.Input /></NumberField.Root></Field.Root>
      <button type="submit">Submit</button>
    </Form>);
    await view.user.click(view.getByRole('button'));
    expect(submitted).toHaveBeenCalledWith({ username: 'alice132', quantity: 5 }, expect.objectContaining({
      event: expect.objectContaining({ defaultPrevented: true }),
    }));
    expect(submitted).toHaveBeenCalledTimes(1);
  });

  it('imperatively validates all real controls or the first matching named field', async () => {
    let actions: Form.Actions | null = null;
    const view = await render(() => <Form actionsRef={(value) => { actions = value; }}>
      <Field.Root name="username"><Field.Control required /><Field.Error data-testid="username-error" /></Field.Root>
      <Field.Root name="quantity" validate={() => 'Number error'}><NumberField.Root defaultValue={5}>
        <NumberField.Input />
      </NumberField.Root><Field.Error data-testid="quantity-error" /></Field.Root>
    </Form>);
    expect(view.queryByTestId('username-error')).toBeNull();
    expect(view.queryByTestId('quantity-error')).toBeNull();
    untrack(() => actions!.validate('quantity')); await flushMicrotasks();
    expect(view.queryByTestId('username-error')).toBeNull();
    expect(view.getByTestId('quantity-error')).toHaveTextContent('Number error');
    untrack(() => actions!.validate()); await flushMicrotasks();
    expect(view.getByTestId('username-error')).toBeVisible();
    expect(view.getByTestId('quantity-error')).toHaveTextContent('Number error');
  });

  it('clears every controlled Switch error changed in one commit', async () => {
    const errors = { a: 'A', b: 'B', c: 'C' };
    const view = await renderProps((props: { checked: boolean }) => <Form errors={errors}>
      <Field.Root name="a"><Switch.Root checked={props.checked} /><Field.Error data-testid="a-error" /></Field.Root>
      <Field.Root name="b"><Switch.Root checked={props.checked} /><Field.Error data-testid="b-error" /></Field.Root>
      <Field.Root name="c"><Switch.Root checked={false} /><Field.Error data-testid="c-error" /></Field.Root>
    </Form>, { checked: false });
    expect(view.getByTestId('a-error')).toBeVisible();
    expect(view.getByTestId('b-error')).toBeVisible();
    await view.setProps({ checked: true });
    expect(view.queryByTestId('a-error')).toBeNull();
    expect(view.queryByTestId('b-error')).toBeNull();
    expect(view.getByTestId('c-error')).toHaveTextContent('C');
  });

  it('removes an unmounted required Field from validation and values', async () => {
    const submitted = vi.fn();
    const view = await renderProps((props: { mounted: boolean }) => <Form data-testid="form" onFormSubmit={submitted}>
      <Field.Root name="name"><Field.Control defaultValue="Alice" /></Field.Root>
      {props.mounted && <Field.Root name="email"><Field.Control required /><Field.Error data-testid="email-error" /></Field.Root>}
    </Form>, { mounted: true });
    fireEvent.submit(view.getByTestId('form')); await flushMicrotasks();
    expect(submitted).not.toHaveBeenCalled();
    expect(view.getByTestId('email-error')).toBeVisible();
    await view.setProps({ mounted: false });
    fireEvent.submit(view.getByTestId('form'));
    expect(submitted.mock.lastCall?.[0]).toEqual({ name: 'Alice' });
  });
});
