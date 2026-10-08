// Real-component replay of pinned packages/react/src/form/Form.test.tsx.
// Source SHA: 19511bb171f3b360b006c94cf6d07e53cb446505.
import { createSignal, untrack } from 'solid-js';
import { describe, expect, it, vi } from 'vitest';
import { browserCase, createRenderer, fireEvent, flushMicrotasks, waitFor } from '../../test';
import { Form } from './Form';
import { Field } from '../field';
import { FieldsetRoot } from '../fieldset/root/FieldsetRoot';
import { useFormContext } from '../internals/form-context';
import type { FormContext } from '../internals/contracts/field';

const { render, renderProps } = createRenderer();
function Capture(props: { read: (form: FormContext) => void }) {
  props.read(useFormContext()!);
  return null;
}
function submit(form: HTMLFormElement) {
  const event = new SubmitEvent('submit', { bubbles: true, cancelable: true });
  form.dispatchEvent(event);
  return event;
}

describe('Form real Field replay', () => {
  it('submits through native onSubmit while a valid async validator remains pending', async () => {
    const submitted = vi.fn((event: SubmitEvent) => event.preventDefault());
    const validate = vi.fn(() => new Promise<null>(() => {}));
    const view = await render(() => <Form onSubmit={submitted}>
      <Field.Root validate={validate}><Field.Control /></Field.Root>
      <button type="submit">Submit</button>
    </Form>);
    await view.user.click(view.getByRole('button'));
    expect(validate).toHaveBeenCalledTimes(1);
    expect(submitted).toHaveBeenCalledTimes(1);
  });

  it('focuses external errors only on submit and removes both errors upon change', async () => {
    const view = await render(() => {
      const [errors, setErrors] = createSignal<Form.Props['errors']>({});
      return <Form errors={errors()} onSubmit={(event) => {
        event.preventDefault();
        const values = new FormData(event.currentTarget);
        setErrors({ ...(values.get('name') === '' && { name: 'Name is required' }),
          ...(values.get('age') === '' && { age: 'Age is required' }) });
      }}>
        <Field.Root name="name"><Field.Control data-testid="name" /><Field.Error data-testid="name-error" /></Field.Root>
        <Field.Root name="age"><Field.Control data-testid="age" /><Field.Error data-testid="age-error" /></Field.Root>
        <button type="submit">Submit</button>
      </Form>;
    });
    const name = view.getByTestId('name'); const age = view.getByTestId('age');
    const button = view.getByRole('button');
    await view.user.click(button);
    expect(name).toHaveFocus();
    expect(view.getByTestId('name-error')).toBeInTheDocument();
    expect(view.getByTestId('age-error')).toBeInTheDocument();
    fireEvent.input(name, { target: { value: 'John' } }); await flushMicrotasks();
    expect(age).not.toHaveFocus();
    // Native exit completion commits separately from input/error clearing.
    await waitFor(() => expect(view.queryByTestId('name-error')).toBeNull());
    await view.user.click(button);
    expect(age).toHaveFocus();
    fireEvent.input(age, { target: { value: '42' } }); await flushMicrotasks();
    await waitFor(() => expect(view.queryByTestId('age-error')).toBeNull());
    await view.user.click(button);
    expect(age).not.toHaveFocus();
  });

  it('runs field validation on the first Backspace after a submit error is set', async () => {
    const validate = vi.fn((value: unknown) => value === 'abcd' ? 'field error' : null);
    const view = await render(() => {
      const [errors, setErrors] = createSignal<Form.Props['errors']>({});
      return <Form errors={errors()} onSubmit={(event) => {
        event.preventDefault();
        setErrors(new FormData(event.currentTarget).get('name') === 'abcde' ? { name: 'submit error' } : {});
      }}>
        <Field.Root name="name" validate={validate}><Field.Control /><Field.Error data-testid="error" /></Field.Root>
        <button type="submit">Submit</button>
      </Form>;
    });
    const input = view.getByRole('textbox');
    await view.user.click(input); await view.user.keyboard('abcde');
    await view.user.click(view.getByRole('button'));
    expect(view.getByTestId('error')).toHaveTextContent('submit error');
    validate.mockClear();
    await view.user.click(input); await view.user.keyboard('{Backspace}');
    expect(validate).toHaveBeenCalledTimes(1);
    expect(view.getByTestId('error')).toHaveTextContent('field error');
  });
  it('blocks custom and native errors synchronously, validates all fields, then focuses/selects', async () => {
    const submitted = vi.fn();
    const order: string[] = [];
    const view = await render(() => <Form onFormSubmit={submitted}>
      <Field.Root name="custom" validate={() => { order.push('custom'); return 'Custom error'; }}>
        <Field.Control data-testid="custom" /><Field.Error data-testid="custom-error" />
      </Field.Root>
      <Field.Root name="native" validate={() => { order.push('native'); return null; }}>
        <Field.Control data-testid="native" required /><Field.Error data-testid="native-error" />
      </Field.Root>
    </Form>);
    const custom = view.getByTestId('custom') as HTMLInputElement;
    custom.value = 'selected';
    const select = vi.spyOn(custom, 'select');
    expect(submit(custom.form!).defaultPrevented).toBe(true);
    expect(order).toEqual(['custom', 'native']);
    expect(submitted).not.toHaveBeenCalled();
    expect(custom).toHaveFocus();
    expect(select).toHaveBeenCalledTimes(1);
    expect([custom.selectionStart, custom.selectionEnd]).toEqual([0, 8]);
    await flushMicrotasks();
    expect(view.getByTestId('custom-error')).toHaveTextContent('Custom error');
    expect(view.getByTestId('native')).toHaveAttribute('aria-invalid', 'true');
    expect(view.getByTestId('native-error')).toBeVisible();
    select.mockRestore();
  });

  it('uses DOM order after movement without changing registration order', async () => {
    let context!: FormContext;
    const view = await render(() => <Form>
      <Capture read={(form) => { context = form; }} />
      <Field.Root><Field.Control data-testid="a" required /></Field.Root>
      <Field.Root><Field.Control data-testid="b" required /></Field.Root>
    </Form>);
    const a = view.getByTestId('a'); const b = view.getByTestId('b');
    const keys = [...context.fields.keys()];
    a.parentElement!.before(b.parentElement!);
    expect(submit(a.closest('form')!).defaultPrevented).toBe(true);
    expect([...context.fields.keys()]).toEqual(keys);
    expect(b).toHaveFocus();
  });

  it('keeps registration-order fallback across separate shadow roots', async () => {
    const hosts = [document.createElement('div'), document.createElement('div')];
    document.body.append(...hosts);
    const roots = hosts.map((host) => host.attachShadow({ mode: 'open' }));
    const view = await render(() => <Form data-testid="form">
      <Field.Root><Field.Control data-testid="a" required /></Field.Root>
      <Field.Root><Field.Control data-testid="b" required /></Field.Root>
    </Form>);
    const a = view.getByTestId('a'); const b = view.getByTestId('b');
    try {
      roots[0].append(a); roots[1].append(b);
      expect(submit(view.getByTestId('form') as HTMLFormElement).defaultPrevented).toBe(true);
      expect(roots[0].activeElement).toBe(a);
      fireEvent.input(a, { target: { value: 'changed' } });
      fireEvent.input(a, { target: { value: '' } });
      expect(submit(view.getByTestId('form') as HTMLFormElement).defaultPrevented).toBe(true);
      expect(roots[0].activeElement).toBe(a);
    } finally { view.unmount(); hosts.forEach((host) => host.remove()); }
  });

  it('projects live DOM values after native onSubmit and uses native event details', async () => {
    const submitted = vi.fn();
    const view = await render(() => <Form onSubmit={(event) => {
      const input = event.currentTarget.elements.namedItem('name') as HTMLInputElement;
      input.value = 'changed by native callback';
      event.preventDefault();
    }} onFormSubmit={submitted}>
      <Field.Root name="name"><Field.Control defaultValue="initial" /></Field.Root>
      <Field.Root><Field.Control defaultValue="unnamed" /></Field.Root>
    </Form>);
    const event = submit(view.container.querySelector('form')!);
    expect(submitted).toHaveBeenCalledWith({ name: 'changed by native callback' }, expect.objectContaining({ event, reason: 'none' }));
    expect(event.defaultPrevented).toBe(true);
  });

  it('re-runs onBlur cross-field validation on submit using current values', async () => {
    const submitted = vi.fn();
    const validate = vi.fn((value: unknown, values: Form.Values) => value === values.password ? null : 'Passwords do not match');
    const view = await render(() => <Form onFormSubmit={submitted}>
      <Field.Root name="password" validationMode="onBlur"><Field.Control data-testid="password" /></Field.Root>
      <Field.Root name="confirm" validationMode="onBlur" validate={validate}>
        <Field.Control data-testid="confirm" /><Field.Error data-testid="error" />
      </Field.Root>
    </Form>);
    const password = view.getByTestId('password'); const confirm = view.getByTestId('confirm');
    fireEvent.input(password, { target: { value: 'secret' } });
    fireEvent.input(confirm, { target: { value: 'typo' } });
    fireEvent.blur(confirm); await flushMicrotasks();
    expect(validate).toHaveBeenCalledTimes(1);
    expect(view.getByTestId('error')).toHaveTextContent('Passwords do not match');
    fireEvent.input(password, { target: { value: 'typo' } });
    fireEvent.blur(password); await flushMicrotasks();
    submit(password.closest('form')!);
    expect(validate).toHaveBeenCalledTimes(2);
    expect(submitted).toHaveBeenCalledTimes(1);
    await flushMicrotasks();
    await waitFor(() => expect(view.queryByTestId('error')).toBeNull());
  });

  it('allows pending onSubmit async validation and retires its stale error on the next submit', async () => {
    const submitted = vi.fn();
    const validate = vi.fn((value: unknown) => Promise.resolve(value === 'bad' ? 'Async error' : null));
    const view = await render(() => <Form onFormSubmit={submitted}>
      <Field.Root name="name" validate={validate}><Field.Control defaultValue="bad" /><Field.Error data-testid="error" /></Field.Root>
    </Form>);
    const control = view.getByRole('textbox') as HTMLInputElement;
    submit(control.form!);
    expect(submitted).toHaveBeenCalledTimes(1);
    await flushMicrotasks();
    expect(view.getByTestId('error')).toHaveTextContent('Async error');
    fireEvent.input(control, { target: { value: 'good' } });
    submit(control.form!);
    expect(submitted).toHaveBeenCalledTimes(2);
    await flushMicrotasks();
    expect(view.queryByTestId('error')).toBeNull();
  });

  for (const mode of ['onBlur', 'onChange'] as const) {
    it(`keeps resolved async errors blocking during revalidation in ${mode}`, async () => {
      const resolvers: ((value: string | null) => void)[] = [];
      const submitted = vi.fn();
      const view = await render(() => <Form onFormSubmit={submitted}>
        <Field.Root name="username" validationMode={mode} validate={() => new Promise<string | null>((resolve) => resolvers.push(resolve))}>
          <Field.Control /><Field.Error data-testid="error" />
        </Field.Root>
      </Form>);
      const control = view.getByRole('textbox') as HTMLInputElement;
      fireEvent.input(control, { target: { value: 'taken' } });
      if (mode === 'onBlur') fireEvent.blur(control);
      await flushMicrotasks();
      resolvers[0]('Taken'); await flushMicrotasks();
      expect(view.getByTestId('error')).toHaveTextContent('Taken');
      expect(submit(control.form!).defaultPrevented).toBe(true);
      expect(submitted).not.toHaveBeenCalled();
      expect(view.getByTestId('error')).toHaveTextContent('Taken');
      resolvers.at(-1)!(null); await flushMicrotasks();
      await waitFor(() => expect(view.queryByTestId('error')).toBeNull());
    });
  }

  it('blocks external invalidity even when custom validation returns null', async () => {
    const submitted = vi.fn();
    const view = await render(() => <Form onFormSubmit={submitted}>
      <Field.Root invalid validate={() => null}><Field.Control /><Field.Error /></Field.Root>
    </Form>);
    const control = view.getByRole('textbox') as HTMLInputElement;
    expect(submit(control.form!).defaultPrevented).toBe(true);
    expect(submitted).not.toHaveBeenCalled();
    await flushMicrotasks();
    expect(control).toHaveAttribute('aria-invalid', 'true');
  });

  it('scopes unnamed and same-name controls independently and clears native errors on edit', async () => {
    const submitted = vi.fn();
    const view = await render(() => <Form onFormSubmit={submitted}>
      <Field.Root><Field.Control required data-testid="unnamed" /><Field.Error data-testid="unnamed-error" /></Field.Root>
      <Field.Root name="same"><Field.Control required data-testid="first" /><Field.Error data-testid="first-error" /></Field.Root>
      <Field.Root name="same"><Field.Control defaultValue="sent" data-testid="second" /><Field.Error data-testid="second-error" /></Field.Root>
    </Form>);
    const unnamed = view.getByTestId('unnamed'); const first = view.getByTestId('first');
    submit(unnamed.closest('form')!); await flushMicrotasks();
    expect(submitted).not.toHaveBeenCalled();
    expect(unnamed).toHaveFocus();
    expect(view.getByTestId('first-error')).toBeVisible();
    expect(view.queryByTestId('second-error')).toBeNull();
    fireEvent.input(unnamed, { target: { value: 'valid' } });
    fireEvent.input(first, { target: { value: 'valid' } }); await flushMicrotasks();
    await waitFor(() => expect(view.queryByTestId('unnamed-error')).toBeNull());
    await waitFor(() => expect(view.queryByTestId('first-error')).toBeNull());
    submit(first.closest('form')!);
    expect(submitted.mock.lastCall?.[0]).toEqual({ same: 'sent' });
  });

  for (const fieldset of [false, true]) {
    it(`removes disabled ${fieldset ? 'fieldset' : 'control'} registration, clears UI and re-enables`, async () => {
      const submitted = vi.fn();
      const view = await renderProps((props: { disabled: boolean }) => <Form onFormSubmit={submitted}>
        <FieldsetRoot disabled={fieldset && props.disabled}>
          <Field.Root name="name"><Field.Control required disabled={!fieldset && props.disabled} /><Field.Error data-testid="error" /></Field.Root>
        </FieldsetRoot>
      </Form>, { disabled: false });
      const control = view.getByRole('textbox') as HTMLInputElement;
      submit(control.form!); await flushMicrotasks();
      expect(submitted).not.toHaveBeenCalled();
      expect(control).toHaveAttribute('aria-invalid', 'true');
      expect(view.getByTestId('error')).toBeInTheDocument();
      await view.setProps({ disabled: true });
      expect(control).toBeDisabled();
      expect(control).not.toHaveAttribute('aria-invalid');
      // React Field.Error hides when the root/fieldset is disabled. A disabled
      // child control alone clears aria-invalid and registration, not root validity.
      if (fieldset) expect(view.queryByTestId('error')).toBeNull();
      submit(control.form!);
      expect(submitted).toHaveBeenCalledTimes(1);
      expect(submitted.mock.lastCall?.[0]).toEqual({});
      await view.setProps({ disabled: false });
      submit(control.form!);
      expect(submitted).toHaveBeenCalledTimes(1);
      await flushMicrotasks();
      expect(control).toHaveAttribute('aria-invalid', 'true');
      expect(view.getByTestId('error')).toBeInTheDocument();
      fireEvent.input(control, { target: { value: 'sent' } }); await flushMicrotasks();
      submit(control.form!);
      expect(submitted).toHaveBeenCalledTimes(2);
      expect(submitted.mock.lastCall?.[0]).toEqual({ name: 'sent' });
    });
  }

  it('imperative validation sees current names, IDs, validator and removal without submitting or focusing', async () => {
    let actions: Form.Actions | null = null;
    const old = vi.fn(() => 'Old'); const current = vi.fn(() => 'Current');
    const submitted = vi.fn();
    const view = await renderProps((props: { name: string; id: string; mounted: boolean; validate: typeof old }) =>
      <Form data-testid="form" actionsRef={(value) => { actions = value; }} onFormSubmit={submitted}>
        {props.mounted && <Field.Root name={props.name} validate={props.validate}>
          <Field.Control id={props.id} /><Field.Error data-testid="error" />
        </Field.Root>}
      </Form>, { name: 'old', id: 'old-id', mounted: true, validate: old });
    await view.setProps({ name: 'current', id: 'current-id', validate: current });
    untrack(() => actions!.validate('old'));
    expect(old).not.toHaveBeenCalled(); expect(current).not.toHaveBeenCalled();
    untrack(() => actions!.validate('current')); await flushMicrotasks();
    expect(current).toHaveBeenCalledTimes(1);
    expect(view.getByTestId('error')).toHaveTextContent('Current');
    expect(view.getByRole('textbox')).not.toHaveFocus();
    expect(submitted).not.toHaveBeenCalled();
    await view.setProps({ mounted: false });
    untrack(() => actions!.validate());
    expect(current).toHaveBeenCalledTimes(1);
    submit(view.getByTestId('form') as HTMLFormElement);
    expect(submitted.mock.lastCall?.[0]).toEqual({});
    await view.setProps({ mounted: true });
    untrack(() => actions!.validate('current')); await flushMicrotasks();
    expect(current).toHaveBeenCalledTimes(2);
    expect(view.getByRole('textbox')).toHaveAttribute('id', 'current-id');
  });

  it('focuses async external errors once after submit and clears only the changed own error', async () => {
    const errors = Object.assign(Object.create(null), { first: 'First error', second: 'Second error' });
    const view = await render(() => {
      const [external, setExternal] = createSignal<Form.Props['errors']>();
      return <Form errors={external()} onFormSubmit={() => { void Promise.resolve().then(() => setExternal(errors)); }}>
        <Field.Root name="first"><Field.Control data-testid="first" /><Field.Error data-testid="first-error" /></Field.Root>
        <Field.Root name="second"><Field.Control data-testid="second" /><Field.Error data-testid="second-error" /></Field.Root>
      </Form>;
    });
    const first = view.getByTestId('first'); const second = view.getByTestId('second');
    submit(first.closest('form')!);
    await waitFor(() => expect(first).toHaveFocus());
    expect(view.getByTestId('first-error')).toHaveTextContent('First error');
    expect(view.getByTestId('second-error')).toHaveTextContent('Second error');
    fireEvent.input(first, { target: { value: 'changed' } }); await flushMicrotasks();
    await waitFor(() => expect(view.queryByTestId('first-error')).toBeNull());
    expect(view.getByTestId('second-error')).toHaveTextContent('Second error');
    expect(second).not.toHaveFocus();
    expect(errors.first).toBe('First error');
  });

  it('does not swap focus on change after two blocked submissions', async () => {
    const view = await render(() => {
      const [errors, setErrors] = createSignal<Form.Props['errors']>({});
      return <Form errors={errors()} onSubmit={(event) => {
        event.preventDefault(); setErrors({ first: 'First', second: 'Second' });
      }}>
        <Field.Root name="first"><Field.Control data-testid="first" /><Field.Error data-testid="first-error" /></Field.Root>
        <Field.Root name="second"><Field.Control data-testid="second" /><Field.Error data-testid="second-error" /></Field.Root>
      </Form>;
    });
    const first = view.getByTestId('first'); const second = view.getByTestId('second');
    const form = first.closest('form')!;
    submit(form); await flushMicrotasks();
    expect(first).toHaveFocus();
    submit(form); await flushMicrotasks();
    fireEvent.input(first, { target: { value: 'changed' } }); await flushMicrotasks();
    expect(second).not.toHaveFocus();
    await waitFor(() => expect(view.queryByTestId('first-error')).toBeNull());
  });

  it('clears every controlled Field change in one staged commit and keeps the third error', async () => {
    const errors = { a: 'A', b: 'B', c: 'C' };
    const view = await renderProps((props: { value: string }) => <Form errors={errors}>
      <Field.Root name="a"><Field.Control value={props.value} /><Field.Error data-testid="a-error" /></Field.Root>
      <Field.Root name="b"><Field.Control value={props.value} /><Field.Error data-testid="b-error" /></Field.Root>
      <Field.Root name="c"><Field.Control value="" /><Field.Error data-testid="c-error" /></Field.Root>
    </Form>, { value: '' });
    expect(view.getByTestId('a-error')).toBeVisible();
    expect(view.getByTestId('b-error')).toBeVisible();
    await view.setProps({ value: 'changed' });
    expect(view.queryByTestId('a-error')).toBeNull();
    expect(view.queryByTestId('b-error')).toBeNull();
    expect(view.getByTestId('c-error')).toHaveTextContent('C');
    expect(errors).toEqual({ a: 'A', b: 'B', c: 'C' });
  });

  for (const mode of ['onSubmit', 'onChange', 'onBlur'] as const) {
    it(`clears external errors and applies the ${mode} validation boundary on first edit`, async () => {
      const validate = vi.fn(() => 'Client error');
      const view = await render(() => <Form errors={{ name: 'Server error' }}>
        <Field.Root name="name" invalid={mode !== 'onSubmit'} validationMode={mode} validate={validate}>
          <Field.Control /><Field.Error data-testid="error" />
        </Field.Root>
      </Form>);
      const control = view.getByRole('textbox') as HTMLInputElement;
      expect(view.getByTestId('error')).toHaveTextContent('Server error');
      if (mode === 'onSubmit') submit(control.form!);
      validate.mockClear();
      fireEvent.input(control, { target: { value: 'changed' } }); await flushMicrotasks();
      if (mode === 'onBlur') {
        expect(validate).not.toHaveBeenCalled();
        await waitFor(() => expect(view.queryByTestId('error')).toBeNull());
        fireEvent.blur(control); await flushMicrotasks();
      }
      expect(validate).toHaveBeenCalledTimes(1);
      expect(view.getByTestId('error')).toHaveTextContent('Client error');
    });
  }

  it('ignores inherited external error properties for validity and submission', async () => {
    const submitted = vi.fn();
    const errors = Object.create({ name: 'Inherited error' });
    const view = await render(() => <Form errors={errors} onFormSubmit={submitted}>
      <Field.Root name="name"><Field.Control defaultValue="sent" /><Field.Error data-testid="error" /></Field.Root>
    </Form>);
    const control = view.getByRole('textbox') as HTMLInputElement;
    expect(control).not.toHaveAttribute('aria-invalid');
    expect(view.queryByTestId('error')).toBeNull();
    submit(control.form!);
    expect(submitted.mock.lastCall?.[0]).toEqual({ name: 'sent' });
  });
});

browserCase({ source: 'packages/react/src/form/Form.test.tsx', case: 'real Field native submission focus and selection',
  environment: 'browser', issue: 'bsolid-browser' }, async () => {
  const submitted = vi.fn();
  const view = await render(() => <Form onFormSubmit={submitted}>
    <Field.Root validate={() => 'Invalid'}><Field.Control defaultValue="select me" /><Field.Error /></Field.Root>
    <button type="submit">Submit</button>
  </Form>);
  const control = view.getByRole('textbox') as HTMLInputElement;
  await view.user.click(view.getByRole('button'));
  expect(submitted).not.toHaveBeenCalled();
  expect(control).toHaveFocus();
  expect([control.selectionStart, control.selectionEnd]).toEqual([0, 9]);
});
