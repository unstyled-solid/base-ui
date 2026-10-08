// Source-first review at 19511bb171f3b360b006c94cf6d07e53cb446505:
// FieldControl input/blur ordering, FieldRoot registration and useFieldValidation eligibility.
import { describe, expect, it, vi } from 'vitest';
import { createSignal } from 'solid-js';
import { Portal } from '@solidjs/web';
import { createRenderer, fireEvent, flushMicrotasks, screen } from '../../test';
import { Field } from './index';
import { Form } from '../form/Form';
import type { FieldControlProps } from './control/FieldControl';

const { render, renderProps } = createRenderer();
const input = () => screen.getByRole<HTMLInputElement | HTMLTextAreaElement>('textbox');

describe('Field source-first review regressions', () => {
  for (const prevention of ['cancel', 'preventDefault'] as const) {
    it(`uses accepted controlled props even when the input request is ${prevention}`, async () => {
      const validate = vi.fn((_value: unknown) => null);
      await render(() => {
        const [value, setValue] = createSignal('');
        return <Field.Root validationMode="onChange" validate={validate}>
          <Field.Control value={value()} onValueChange={(next, details) => {
            setValue(next.toUpperCase());
            if (prevention === 'cancel') details.cancel();
            else details.event.preventDefault();
          }} />
        </Field.Root>;
      });
      fireEvent.input(input(), { cancelable: true, target: { value: 'accepted' } });
      await flushMicrotasks();
      expect(input()).toHaveValue('ACCEPTED');
      expect(validate).toHaveBeenCalledTimes(1);
      expect(validate.mock.lastCall?.[0]).toBe('ACCEPTED');
      expect(input()).toHaveAttribute('data-dirty');
    });
  }

  it('validates native constraints against the accepted controlled rewrite', async () => {
    await render(() => {
      const [value, setValue] = createSignal('');
      return <Field.Root validationMode="onChange"><Field.Control type="email" value={value()}
        onValueChange={() => setValue('accepted@example.com')} /><Field.Error /></Field.Root>;
    });
    fireEvent.input(input(), { target: { value: 'invalid' } });
    await flushMicrotasks();
    expect(input()).toHaveValue('accepted@example.com');
    expect(input()).not.toHaveAttribute('aria-invalid');
    expect(input()).toHaveAttribute('data-valid');
  });

  it('calls current input and blur callbacks in source order without double-validating change', async () => {
    const order: string[] = [];
    const old = vi.fn();
    const validate = vi.fn((_value: unknown) => { order.push('validate'); return null; });
    const view = await renderProps<{ current: boolean }>((p) => <Field.Root validationMode="onChange" validate={validate}>
      <Field.Control onInput={p.current ? () => { order.push('input'); } : old}
        onValueChange={p.current ? () => { order.push('value'); } : old}
        onBlur={p.current ? () => { order.push('blur'); } : old} />
    </Field.Root>, { current: false });
    await view.setProps({ current: true });
    fireEvent.input(input(), { target: { value: 'edited' } });
    fireEvent.change(input());
    fireEvent.blur(input());
    await flushMicrotasks();
    expect(order).toEqual(['input', 'value', 'validate', 'blur']);
    expect(old).not.toHaveBeenCalled();
    expect(validate).toHaveBeenCalledTimes(1);
    expect(input()).toHaveAttribute('data-touched');
  });

  it('keeps prevented Base UI blur untouched while ordinary default prevention still commits', async () => {
    const validate = vi.fn(() => null);
    const view = await renderProps<{ skip: boolean }>((p) => <Field.Root validationMode="onBlur" validate={validate}>
      <Field.Control onBlur={(event) => p.skip ? event.preventBaseUIHandler() : event.preventDefault()} />
    </Field.Root>, { skip: true });
    fireEvent.blur(input());
    await flushMicrotasks();
    expect(validate).not.toHaveBeenCalled();
    expect(input()).not.toHaveAttribute('data-touched');
    await view.setProps({ skip: false });
    fireEvent.blur(input());
    await flushMicrotasks();
    expect(validate).toHaveBeenCalledTimes(1);
    expect(input()).toHaveAttribute('data-touched');
  });

  it('submits a context-associated portaled input using its current DOM value', async () => {
    const submitted = vi.fn();
    await render(() => <Form data-testid="form" onFormSubmit={submitted}>
      <Field.Root name="message"><Portal><Field.Control defaultValue="initial" /></Portal></Field.Root>
    </Form>);
    expect(input().form).toBeNull();
    input().value = 'portal edit';
    fireEvent.submit(screen.getByTestId('form'));
    await flushMicrotasks();
    expect(submitted.mock.lastCall?.[0]).toEqual({ message: 'portal edit' });
  });

  it('projects a direct Control value even when explicitly associated with another native form', async () => {
    const submitted = vi.fn();
    await render(() => <><form id="foreign" /><Form data-testid="form" onFormSubmit={submitted}>
      <Field.Root name="message"><Field.Control form="foreign" defaultValue="current" /><Field.Error /></Field.Root>
    </Form></>);
    expect(input().form?.id).toBe('foreign');
    fireEvent.submit(screen.getByTestId('form'));
    await flushMicrotasks();
    expect(submitted.mock.lastCall?.[0]).toEqual({ message: 'current' });
    expect(input()).not.toHaveAttribute('aria-invalid');
  });

  it('uses direct Control native validity as the fallback even with foreign form association', async () => {
    await render(() => <><form id="foreign" /><Form data-testid="form" onSubmit={(event) => event.preventDefault()}>
      <Field.Root name="message"><Field.Control form="foreign" required /><Field.Error match="valueMissing">Required</Field.Error></Field.Root>
    </Form></>);
    fireEvent.submit(screen.getByTestId('form'));
    await flushMicrotasks();
    expect(screen.getByText('Required')).toBeVisible();
    expect(input()).toHaveAttribute('aria-invalid', 'true');
  });

  it('restores a rejected controlled edit even when the consumer skips the Base UI input handler', async () => {
    const changed = vi.fn();
    await render(() => <Field.Root><Field.Control value="accepted" onValueChange={changed}
      onInput={(event) => event.preventBaseUIHandler()} /></Field.Root>);
    fireEvent.input(input(), { target: { value: 'rejected' } });
    await flushMicrotasks();
    expect(changed).not.toHaveBeenCalled();
    expect(input()).toHaveValue('accepted');
    expect(input()).not.toHaveAttribute('data-dirty');
  });

  it('keeps a registered label ID when another Field.Label mounts in the same scope', async () => {
    const view = await renderProps<{ second: boolean }>((p) => <Field.Root>
      <Field.Label id="registered">First</Field.Label><Field.Control />
      {p.second && <Field.Label id="candidate">Second</Field.Label>}
    </Field.Root>, { second: false });
    await view.setProps({ second: true });
    expect(screen.getByText('Second')).toHaveAttribute('id', 'registered');
    expect(input()).toHaveAttribute('aria-labelledby', 'registered');
  });

  it('updates the uncontrolled reset default without replacing DOM edits or the field baseline', async () => {
    const view = await renderProps<{ defaultValue: string }>((p) => <form data-testid="native-form">
      <Field.Root><Field.Control defaultValue={p.defaultValue} /></Field.Root>
    </form>, { defaultValue: 'initial' });
    const node = input();
    node.value = 'edited';
    await view.setProps({ defaultValue: 'updated' });
    expect(input()).toBe(node);
    expect(node.value).toBe('edited');
    expect(node.defaultValue).toBe('updated');
    screen.getByTestId<HTMLFormElement>('native-form').reset();
    expect(node.value).toBe('updated');
    fireEvent.input(node, { target: { value: 'initial' } });
    await flushMicrotasks();
    expect(node).not.toHaveAttribute('data-dirty');
  });

  it('updates a pristine reset default without changing its initial displayed value', async () => {
    const view = await renderProps<{ defaultValue: string }>((p) => <Field.Root>
      <Field.Control defaultValue={p.defaultValue} />
    </Field.Root>, { defaultValue: 'initial' });
    await view.setProps({ defaultValue: 'updated' });
    expect(input()).toHaveValue('initial');
    expect(input().defaultValue).toBe('updated');
    expect(input()).not.toHaveAttribute('data-dirty');
  });

  it('projects the accepted controlled value into the native reset default', async () => {
    const view = await renderProps<{ value: string }>((p) => <Field.Root><Field.Control value={p.value} /></Field.Root>, { value: 'initial' });
    expect(input().defaultValue).toBe('initial');
    await view.setProps({ value: 'accepted' });
    expect(input()).toHaveValue('accepted');
    expect(input().defaultValue).toBe('accepted');
  });

  it('initializes reset-default behavior again when a render callback replaces the native host', async () => {
    const first: FieldControlProps['render'] = (props) => <input {...props} />;
    const second: FieldControlProps['render'] = (props) => <input {...props} data-replacement="" />;
    const view = await renderProps<{ render: FieldControlProps['render']; defaultValue: string }>((p) =>
      <Field.Root><Field.Control render={p.render} defaultValue={p.defaultValue} /></Field.Root>,
    { render: first, defaultValue: 'initial' });
    const old = input();
    await view.setProps({ render: second, defaultValue: 'replacement' });
    const replacement = input();
    expect(replacement).not.toBe(old);
    expect(replacement).toHaveValue('replacement');
    await view.setProps({ defaultValue: 'reset' });
    expect(replacement).toHaveValue('replacement');
    expect(replacement.defaultValue).toBe('reset');
  });

  it('validates the native textarea render target authorized by FieldControl.spec.tsx', async () => {
    await render(() => <Field.Root validationMode="onBlur" dirty>
      <Field.Control<HTMLTextAreaElement> required render={(props) => <textarea {...props} />} />
      <Field.Error match="valueMissing">Required textarea</Field.Error>
    </Field.Root>);
    expect(input().tagName).toBe('TEXTAREA');
    fireEvent.blur(input());
    await flushMicrotasks();
    expect(screen.getByText('Required textarea')).toBeVisible();
    expect(input()).toHaveAttribute('aria-invalid', 'true');
  });
});
