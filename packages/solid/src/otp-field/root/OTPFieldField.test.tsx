import { describe, expect, it, vi } from 'vitest';
import { createRenderer, fireEvent, screen } from '../../../test';
import { Field } from '../../field';
import { Form } from '../../form/Form';
import { OTPField } from '../index';
import { Fixture, focus, input, settle, slots, values } from '../OTPField.test-utils';

// Real shared Field/Form integration, not a replacement validation engine.
describe('OTPField Field/Form integration', () => {
  const { render, renderProps } = createRenderer();

  it('registers the first slot for Field.Label and shares label/description ownership', async () => {
    await render(() => <Field.Root name="otp">
      <Field.Label data-testid="label">Verification code</Field.Label>
      <Field.Description data-testid="description">Enter the code</Field.Description>
      <Fixture aria-describedby="external-description" />
    </Field.Root>);
    const label = screen.getByTestId('label');
    const description = screen.getByTestId('description');
    expect(label).toHaveAttribute('for', slots()[0].id);
    expect(screen.getByRole('group')).toHaveAttribute('aria-labelledby', label.id);
    expect(screen.getByRole('group')).toHaveAttribute('aria-describedby', `external-description ${description.id}`);
    slots().forEach((node) => {
      expect(node).toHaveAttribute('aria-labelledby', label.id);
      expect(node).not.toHaveAttribute('aria-describedby', description.id);
    });
  });

  it('validates the logical string only when focus leaves the group in onBlur mode', async () => {
    const validate = vi.fn(() => null);
    await render(() => <><Form><Field.Root name="otp" validationMode="onBlur" validate={validate}>
      <Fixture validationType="none" />
    </Field.Root></Form><button>Outside</button></>);
    await focus(slots()[0]);
    await input(slots()[0], '1');
    fireEvent.blur(slots()[1], { relatedTarget: slots()[2] });
    await settle();
    expect(validate).not.toHaveBeenCalled();
    fireEvent.blur(slots()[1], { relatedTarget: screen.getByRole('button') });
    await settle();
    expect(validate).toHaveBeenCalledExactlyOnceWith('1', { otp: '1' });
  });

  it('publishes dirty/filled/touched while using the field name over the root name', async () => {
    await render(() => <Field.Root name="field-name" data-testid="field"><Fixture name="root-name" /></Field.Root>);
    expect(document.querySelector('input[name="field-name"]')).not.toBeNull();
    expect(document.querySelector('input[name="root-name"]')).toBeNull();
    await focus(slots()[0]);
    await input(slots()[0], '1');
    expect(screen.getByTestId('field')).toHaveAttribute('data-dirty');
    expect(screen.getByTestId('field')).toHaveAttribute('data-filled');
    fireEvent.blur(slots()[1]);
    await settle();
    expect(screen.getByTestId('field')).toHaveAttribute('data-touched');
  });

  it('synchronizes accepted native values before onChange validation inspects them', async () => {
    const observed: string[] = [];
    await render(() => <Form><Field.Root name="otp" validationMode="onChange" validate={(value) => {
      observed.push(`${value}:${document.querySelector<HTMLInputElement>('input[name="otp"]')!.value}:${values()}`);
      return null;
    }}><Fixture required /><Field.Error data-testid="error" /></Field.Root></Form>);
    await input(slots()[0], '1');
    expect(document.querySelector<HTMLInputElement>('input[name="otp"]')!.validity.patternMismatch).toBe(true);
    slots().forEach((node) => expect(node).toHaveAttribute('data-invalid'));
    await input(slots()[1], '23456');
    expect(observed).toEqual(['1:1:1', '123456:123456:123456']);
    slots().forEach((node) => expect(node).not.toHaveAttribute('data-invalid'));
  });

  it.each(['disabled', 'readOnly'] as const)('keeps external errors while %s blocks hidden autofill', async (lock) => {
    const change = vi.fn(); const invalid = vi.fn(); const complete = vi.fn();
    await render(() => <Form errors={{ otp: 'Server error' }}><Field.Root name="otp">
      <Fixture {...{ [lock]: true }} onValueChange={change} onValueInvalid={invalid} onValueComplete={complete} />
      <Field.Error data-testid="error" />
    </Field.Root></Form>);
    await input(document.querySelector<HTMLInputElement>('input[name="otp"]')!, '12a3456');
    expect(screen.getByTestId('error')).toHaveTextContent('Server error');
    expect(values()).toBe('');
    expect(change).not.toHaveBeenCalled();
    expect(invalid).not.toHaveBeenCalled();
    expect(complete).not.toHaveBeenCalled();
    slots().forEach((node) => expect(node.getAttribute('aria-invalid')).toBe(lock === 'disabled' ? null : 'true'));
  });

  it('auto-submits a Base UI Form using synchronous accepted registry values', async () => {
    const submit = vi.fn((event: SubmitEvent) => event.preventDefault());
    await render(() => <Form onSubmit={submit}><Field.Root name="otp"><Fixture autoSubmit /></Field.Root></Form>);
    await input(slots()[0], '123456');
    expect(submit).toHaveBeenCalledTimes(1);
  });

  it('blocks invalid Form auto-submit and displays custom validity', async () => {
    const submit = vi.fn((event: SubmitEvent) => event.preventDefault());
    await render(() => <Form onSubmit={submit}><Field.Root name="otp" validate={() => 'Invalid OTP'}>
      <Fixture autoSubmit /><Field.Error data-testid="error" />
    </Field.Root></Form>);
    await input(slots()[0], '123456');
    expect(submit).not.toHaveBeenCalled();
    expect(screen.getByTestId('error')).toHaveTextContent('Invalid OTP');
  });

  it('does not take focus back from the first invalid field after autosubmit', async () => {
    await render(() => <Form>
      <Field.Root name="email" validate={() => 'Required'}><Field.Label>Email</Field.Label><Field.Control /><Field.Error /></Field.Root>
      <Field.Root name="otp"><Fixture autoSubmit /></Field.Root>
    </Form>);
    const email = screen.getByRole<HTMLInputElement>('textbox', { name: 'Email' });
    const otp = slots().filter((node) => node !== email);
    await input(otp[0], '123456');
    expect(email).toHaveAttribute('aria-invalid', 'true');
    expect(email).toHaveFocus();
  });

  it.each(['disabled', 'unmounted'] as const)('clears Field and Root focus on %s without requiring blur', async (kind) => {
    const view = await renderProps((props: { disabled: boolean; mounted: boolean }) => <Field.Root data-testid="field">
      {props.mounted && <Fixture disabled={props.disabled} />}
    </Field.Root>, { disabled: false, mounted: true });
    await focus(slots()[0]);
    expect(screen.getByTestId('field')).toHaveAttribute('data-focused');
    await view.setProps(kind === 'disabled' ? { disabled: true } : { mounted: false });
    expect(screen.getByTestId('field')).not.toHaveAttribute('data-focused');
    if (kind === 'disabled') expect(screen.getByRole('group')).not.toHaveAttribute('data-focused');
  });

  it('keeps sibling focus after a previously focused slot is removed and reindexes', async () => {
    const view = await renderProps((props: { first: boolean }) => <Field.Root data-testid="field">
      <OTPField.Root length={props.first ? 3 : 2} defaultValue="1">
        {props.first && <OTPField.Input />}<OTPField.Input /><OTPField.Input />
      </OTPField.Root>
    </Field.Root>, { first: true });
    const second = slots()[1];
    await focus(slots()[0]);
    await focus(second);
    await view.setProps({ first: false });
    expect(second).toHaveFocus();
    expect(screen.getByTestId('field')).toHaveAttribute('data-focused');
    expect(slots()[0]).toBe(second);
    expect(slots().map((slot) => slot.tabIndex)).toEqual([0, -1]);
  });

  it('clears focus when the focused slot unmounts but the field remains', async () => {
    const view = await renderProps((props: { first: boolean }) => <Field.Root data-testid="field">
      <OTPField.Root length={props.first ? 3 : 2}>
        {props.first && <OTPField.Input />}<OTPField.Input /><OTPField.Input />
      </OTPField.Root>
    </Field.Root>, { first: true });
    await focus(slots()[0]);
    await view.setProps({ first: false });
    expect(screen.getByTestId('field')).not.toHaveAttribute('data-focused');
    expect(screen.getByRole('group')).not.toHaveAttribute('data-focused');
  });
});
