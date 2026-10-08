// Source: FieldRoot.test.tsx validation, debounce, custom-validity and Form integration;
// FieldError.test.tsx match/text/list; FieldValidity.test.tsx. Pinned SHA 19511bb171f3b360b006c94cf6d07e53cb446505.
import { describe, expect, it, vi } from 'vitest';
import { untrack } from 'solid-js';
import { createRenderer, fireEvent, flushMicrotasks, screen, advanceTimers, browserCase, waitFor } from '../../../test';
import { Field } from '../index';
import { Form } from '../../form/Form';
import type { FormErrors } from '../../internals/contracts/field';
import { useFieldRootContext } from '../../internals/field-root-context';

const { render, renderProps } = createRenderer();
const control = () => screen.getByRole<HTMLInputElement>('textbox');
async function edit(value: string) { fireEvent.input(control(), { target: { value } }); await flushMicrotasks(); }
async function blur() { fireEvent.blur(control()); await flushMicrotasks(); }
async function submit() { fireEvent.submit(screen.getByTestId('form')); await flushMicrotasks(); }

describe('Field validation through field-core', () => {
  for (const mode of ['onChange', 'onBlur'] as const) {
    it(`source previously valid result retires to neutral while revalidating in ${mode}`, async () => {
      const resolvers: ((value: string | null) => void)[] = [];
      const validate = vi.fn(() => new Promise<string | null>((resolve) => { resolvers.push(resolve); }));
      await render(() => <Field.Root data-testid="root" validationMode={mode} validate={validate}>
        <Field.Control data-testid="control" /><Field.Error data-testid="error" />
      </Field.Root>);
      const root = screen.getByTestId('root');
      fireEvent.input(control(), { target: { value: 'good' } });
      if (mode === 'onBlur') fireEvent.blur(control());
      await waitFor(() => expect(validate).toHaveBeenCalledTimes(1));
      resolvers[0](null);
      await waitFor(() => expect(root).toHaveAttribute('data-valid', ''));
      if (mode === 'onBlur') {
        fireEvent.focus(control());
        fireEvent.blur(control());
      } else fireEvent.input(control(), { target: { value: 'taken' } });
      await waitFor(() => expect(validate).toHaveBeenCalledTimes(2));
      expect(root).not.toHaveAttribute('data-valid');
      expect(root).not.toHaveAttribute('data-invalid');
      resolvers[1]('Username is taken');
      await waitFor(() => expect(root).toHaveAttribute('data-invalid', ''));
      expect(screen.getByTestId('error')).toHaveTextContent('Username is taken');
    });
  }

  for (const mode of ['onSubmit', 'onChange', 'onBlur'] as const) {
    it(`validates at the ${mode} boundary and exposes live validity`, async () => {
      const validate = vi.fn(() => 'Invalid');
      await render(() => <Form data-testid="form" onSubmit={(e) => e.preventDefault()}><Field.Root validationMode={mode} validate={validate}><Field.Control /><Field.Error /><Field.Validity>{(s) => <output>{`${s.value}:${s.error}:${s.validity.customError}`}</output>}</Field.Validity></Field.Root></Form>);
      expect(validate).not.toHaveBeenCalled();
      await edit('bad');
      if (mode !== 'onChange') expect(validate).not.toHaveBeenCalled();
      if (mode === 'onBlur') await blur();
      if (mode === 'onSubmit') await submit();
      expect(validate).toHaveBeenCalledTimes(1);
      expect(control()).toHaveAttribute('aria-invalid', 'true');
      expect(screen.getByRole('status')).toHaveTextContent('bad:Invalid:true');
    });

    it(`publishes neutral validity during async ${mode} validation`, async () => {
      let resolve!: (value: string) => void;
      await render(() => <Form data-testid="form" onSubmit={(e) => e.preventDefault()}><Field.Root validationMode={mode} validate={() => new Promise<string>((r) => { resolve = r; })}><Field.Control /><Field.Error /><Field.Validity>{(s) => <output>{String(s.validity.valid)}</output>}</Field.Validity></Field.Root></Form>);
      await edit('bad');
      if (mode === 'onBlur') await blur();
      if (mode === 'onSubmit') await submit();
      expect(control()).not.toHaveAttribute('data-valid');
      expect(control()).not.toHaveAttribute('data-invalid');
      expect(screen.getByRole('status')).toHaveTextContent('null');
      resolve('Async error');
      await flushMicrotasks();
      expect(screen.getByText('Async error')).toBeVisible();
      expect(control()).toHaveAttribute('data-invalid');
    });
  }

  it('inherits Form validationMode but allows a Field override', async () => {
    const inherited = vi.fn();
    const override = vi.fn();
    await render(() => <Form validationMode="onChange"><Field.Root validate={inherited}><Field.Control aria-label="inherited" /></Field.Root><Field.Root validationMode="onBlur" validate={override}><Field.Control aria-label="override" /></Field.Root></Form>);
    fireEvent.input(screen.getByLabelText('inherited'), { target: { value: 'a' } });
    fireEvent.input(screen.getByLabelText('override'), { target: { value: 'b' } });
    await flushMicrotasks();
    expect(inherited).toHaveBeenCalledTimes(1);
    expect(override).not.toHaveBeenCalled();
    fireEvent.blur(screen.getByLabelText('override'));
    await flushMicrotasks();
    expect(override).toHaveBeenCalledTimes(1);
  });

  for (const result of [undefined, null, '', [], ['', '']] as (undefined | null | string | string[])[]) {
    it(`accepts empty validation result ${JSON.stringify(result)}`, async () => {
      const submitted = vi.fn();
      await render(() => <Form data-testid="form" onFormSubmit={submitted}><Field.Root name="field" validationMode="onChange" validate={() => Array.isArray(result) ? [...result] : result}><Field.Control /><Field.Error data-testid="error" /></Field.Root></Form>);
      await edit('valid');
      expect(control()).not.toHaveAttribute('aria-invalid');
      expect(control()).not.toHaveAttribute('data-invalid');
      expect(control().validationMessage).toBe('');
      expect(screen.queryByTestId('error')).toBeNull();
      await submit();
      expect(submitted).toHaveBeenCalledTimes(1);
      expect(submitted.mock.lastCall?.[0]).toEqual({ field: 'valid' });
    });
  }

  it('suppresses pristine required noise but remembers prior user edits', async () => {
    await render(() => <Field.Root validationMode="onBlur"><Field.Control required /><Field.Error match="valueMissing">Required</Field.Error><Field.Validity>{(s) => <output>{s.errors.join(',')}</output>}</Field.Validity></Field.Root>);
    await blur();
    expect(control()).not.toHaveAttribute('aria-invalid');
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
    await edit('a');
    await edit('');
    await blur();
    expect(screen.getByText('Required')).toBeVisible();
  });

  it('uses controlled dirty for native required validation', async () => {
    await render(() => <Field.Root dirty validationMode="onBlur"><Field.Control required /><Field.Error match="valueMissing">Required</Field.Error></Field.Root>);
    await blur();
    expect(screen.getByText('Required')).toBeVisible();
  });

  it('temporarily clears required on edit while deferring typeMismatch until blur', async () => {
    await render(() => <Field.Root validationMode="onBlur"><Field.Control type="email" required /><Field.Error match="valueMissing">Required</Field.Error><Field.Error match="typeMismatch">Email</Field.Error></Field.Root>);
    await edit('a');
    await edit('');
    await blur();
    expect(screen.getByText('Required')).toBeVisible();
    await edit('invalid');
    expect(screen.queryByText('Required')).toBeNull();
    expect(screen.queryByText('Email')).toBeNull();
    await blur();
    expect(screen.getByText('Email')).toBeVisible();
    await edit('');
    expect(screen.queryByText('Email')).toBeNull();
    expect(screen.getByText('Required')).toBeVisible();
  });

  it('discards older async results', async () => {
    const resolvers = new Map<string, (value: string | null) => void>();
    await render(() => <Field.Root validationMode="onChange" validate={(v) => new Promise<string | null>((r) => resolvers.set(String(v), r))}><Field.Control /><Field.Error /></Field.Root>);
    await edit('old');
    await edit('new');
    resolvers.get('new')!(null);
    await flushMicrotasks();
    resolvers.get('old')!('Stale');
    await flushMicrotasks();
    expect(screen.queryByText('Stale')).toBeNull();
    expect(control()).not.toHaveAttribute('aria-invalid');
  });

  it('invalidates pending validation on control disposal', async () => {
    let resolve!: (value: string) => void;
    const view = await renderProps((p: { mounted: boolean }) => <Field.Root validationMode="onChange" validate={() => new Promise<string>((r) => { resolve = r; })}>{p.mounted && <Field.Control />}<Field.Error /></Field.Root>, { mounted: true });
    await edit('old');
    await view.setProps({ mounted: false });
    resolve('Stale');
    await flushMicrotasks();
    expect(screen.queryByText('Stale')).toBeNull();
  });

  it('retires stale native failures when the new constraint verdict is valid', async () => {
    const resolvers: ((value: null) => void)[] = [];
    const submitted = vi.fn();
    await render(() => <Form data-testid="form" onFormSubmit={submitted}><Field.Root name="email" validationMode="onChange" validate={() => new Promise<null>((resolve) => resolvers.push(resolve))}><Field.Control type="email" /><Field.Error data-testid="error" /></Field.Root></Form>);
    await edit('invalid');
    resolvers[0](null);
    await flushMicrotasks();
    expect(control()).toHaveAttribute('data-invalid');
    await edit('name@example.com');
    expect(control()).not.toHaveAttribute('data-invalid');
    expect(control()).not.toHaveAttribute('data-valid');
    expect(screen.queryByTestId('error')).toBeNull();
    await submit();
    expect(submitted).toHaveBeenCalledTimes(1);
    resolvers[resolvers.length - 1](null);
    await flushMicrotasks();
    expect(control()).toHaveAttribute('data-valid');
  });

  for (const mode of ['onSubmit', 'onChange', 'onBlur'] as const) {
    it(`synchronously blocks native constraint failures in ${mode} mode even with an async validator`, async () => {
      const validate = vi.fn(() => new Promise<null>(() => {}));
      const submitted = vi.fn();
      await render(() => <Form data-testid="form" onFormSubmit={submitted}><Field.Root validationMode={mode} validate={validate}><Field.Control required /><Field.Error match="valueMissing">Required</Field.Error></Field.Root></Form>);
      await submit();
      expect(submitted).not.toHaveBeenCalled();
      expect(validate).toHaveBeenCalledTimes(mode === 'onBlur' ? 0 : 1);
      expect(screen.getByText('Required')).toBeVisible();
      expect(control()).toHaveAttribute('aria-invalid', 'true');
    });
  }

  it('retains a published custom error when a later validator rejects', async () => {
    let commit!: (value: unknown) => Promise<void>;
    let calls = 0;
    function ReadCommit() { commit = useFieldRootContext(false).validation.commit; return null; }
    await render(() => <Field.Root validationMode="onBlur" validate={async () => {
      calls++;
      if (calls === 2) throw new Error('network');
      return 'Published';
    }}><Field.Control /><Field.Error /><ReadCommit /></Field.Root>);
    await edit('taken');
    await blur();
    expect(screen.getByText('Published')).toBeVisible();
    await expect(commit('taken')).rejects.toThrow('network');
    expect(screen.getByText('Published')).toBeVisible();
    expect(control()).toHaveAttribute('aria-invalid', 'true');
  });

  for (const mode of ['onBlur', 'onChange', 'onSubmit'] as const) {
    it(`handles previous custom errors while revalidating in ${mode}`, async () => {
      const resolvers: ((value: string | null) => void)[] = [];
      const submitted = vi.fn();
      await render(() => <Form data-testid="form" onFormSubmit={submitted}><Field.Root name="name" validationMode={mode} validate={() => new Promise<string | null>((resolve) => resolvers.push(resolve))}><Field.Control /><Field.Error /></Field.Root></Form>);
      await edit('taken');
      if (mode === 'onBlur') await blur();
      if (mode === 'onSubmit') await submit();
      resolvers[0]('Taken');
      await flushMicrotasks();
      expect(screen.getByText('Taken')).toBeVisible();
      if (mode === 'onBlur') await blur();
      else if (mode === 'onChange') await edit('taken2');
      else await submit();
      if (mode === 'onSubmit') expect(screen.queryByText('Taken')).toBeNull();
      else {
        expect(screen.getByText('Taken')).toBeVisible();
        await submit();
        expect(submitted).not.toHaveBeenCalled();
      }
      resolvers[resolvers.length - 1](null);
      await flushMicrotasks();
      // The validator settles before the owned exit-completion callback commits.
      await waitFor(() => expect(screen.queryByText('Taken')).toBeNull());
    });
  }

  it('debounces changes and cancels queued work on disposal', async () => {
    vi.useFakeTimers();
    try {
      const validate = vi.fn(() => 'Error');
      const view = await renderProps((p: { mounted: boolean }) => <Field.Root validationMode="onChange" validationDebounceTime={100} validate={validate}>{p.mounted && <Field.Control />}<Field.Error /></Field.Root>, { mounted: true });
      await edit('a');
      await advanceTimers(99);
      await edit('ab');
      await advanceTimers(99);
      expect(validate).not.toHaveBeenCalled();
      await advanceTimers(1);
      expect(validate).toHaveBeenCalledTimes(1);
      await edit('abc');
      await view.setProps({ mounted: false });
      await advanceTimers(100);
      expect(validate).toHaveBeenCalledTimes(1);
      view.unmount();
    } finally { vi.useRealTimers(); }
  });

  it('discards an in-flight result as soon as a newer debounced edit arrives', async () => {
    vi.useFakeTimers();
    try {
      const resolvers = new Map<string, (value: string | null) => void>();
      const view = await render(() => <Field.Root validationMode="onChange" validationDebounceTime={100} validate={(value) => new Promise<string | null>((resolve) => resolvers.set(String(value), resolve))}><Field.Control /><Field.Error /></Field.Root>);
      await edit('old');
      await advanceTimers(100);
      await edit('new');
      resolvers.get('old')!('Stale');
      await flushMicrotasks();
      expect(screen.queryByText('Stale')).toBeNull();
      await advanceTimers(100);
      resolvers.get('new')!(null);
      await flushMicrotasks();
      expect(control()).not.toHaveAttribute('aria-invalid');
      view.unmount();
    } finally { vi.useRealTimers(); }
  });

  for (const external of [false, true]) {
    it(`owns only its custom-validity message (external=${external})`, async () => {
      await render(() => <Field.Root validationMode="onChange" validate={(v) => v === 'bad' ? 'Owned\r\nmessage' : null}><Field.Control /><Field.Error /></Field.Root>);
      if (external) control().setCustomValidity('Foreign');
      await edit('bad');
      expect(control().validationMessage).toBe('Owned\nmessage');
      await edit('good');
      expect(control().validationMessage).toBe(external ? 'Foreign' : '');
      if (external) expect(screen.getByText('Foreign')).toBeVisible();
    });
  }

  it('does not restore withdrawn foreign validity', async () => {
    await render(() => <Field.Root validationMode="onChange" validate={(v) => v === 'bad' ? 'Owned' : null}><Field.Control /><Field.Error /></Field.Root>);
    control().setCustomValidity('Foreign');
    await edit('bad');
    control().setCustomValidity('');
    await edit('good');
    expect(control().validationMessage).toBe('');
  });

  it('does not adopt a native constraint message as displaced custom validity', async () => {
    await render(() => <Field.Root validationMode="onChange" validate={(v) => v === 'bad' ? 'Owned' : null}><Field.Control type="email" /></Field.Root>);
    await edit('bad');
    expect(control().validationMessage).toBe('Owned');
    await edit('a@b.co');
    expect(control().validity.customError).toBe(false);
    expect(control().validationMessage).toBe('');
  });

  it('preserves foreign validity during required change revalidation while deferring other constraints', async () => {
    await render(() => <Field.Root validationMode="onBlur"><Field.Control type="email" required /><Field.Error match="typeMismatch">Type mismatch</Field.Error><Field.Validity>{(s) => <output>{`${s.validity.customError}:${s.validity.typeMismatch}:${s.errors.join(',')}`}</output>}</Field.Validity></Field.Root>);
    await edit('a');
    await edit('');
    await blur();
    control().setCustomValidity('Foreign');
    await edit('invalid');
    expect(control().validationMessage).toBe('Foreign');
    expect(screen.queryByText('Type mismatch')).toBeNull();
    expect(screen.getByRole('status')).toHaveTextContent('true:false:Foreign');
  });

  it('clears its owned custom message while the native input is disabled', async () => {
    let actions: Field.Root.Actions | null = null;
    const view = await renderProps((p: { disabled: boolean; failing: boolean }) => <Field.Root actionsRef={(value) => { actions = value; }} validate={() => p.failing ? 'Owned' : null}><Field.Control disabled={p.disabled} /></Field.Root>, { disabled: false, failing: true });
    actions!.validate();
    await flushMicrotasks();
    expect(control().validationMessage).toBe('Owned');
    await view.setProps({ disabled: true, failing: false });
    actions!.validate();
    await flushMicrotasks();
    await view.setProps({ disabled: false });
    expect(control().validationMessage).toBe('');
  });

  it('validates current DOM values, names, replacement and removal through real Form', async () => {
    const submitted = vi.fn();
    const validate = vi.fn((_value: unknown, _values: Record<string, unknown>) => null);
    const view = await renderProps((p: { name?: string; mounted: boolean }) => <Form data-testid="form" onFormSubmit={submitted}>{p.mounted && <Field.Root><Field.Control name={p.name} defaultValue="one" aria-label="first" /></Field.Root>}<Field.Root name="second" validate={validate}><Field.Control defaultValue="two" aria-label="second" /></Field.Root></Form>, { name: 'first', mounted: true });
    screen.getByRole<HTMLInputElement>('textbox', { name: 'first' }).value = 'dom-edit';
    await submit();
    expect(submitted.mock.lastCall?.[0]).toEqual({ first: 'dom-edit', second: 'two' });
    expect(validate.mock.lastCall?.[1]).toEqual({ first: 'dom-edit', second: 'two' });
    await view.setProps({ name: 'renamed' });
    await submit();
    expect(submitted.mock.lastCall?.[0]).toEqual({ renamed: 'dom-edit', second: 'two' });
    await view.setProps({ name: undefined });
    await submit();
    expect(submitted.mock.lastCall?.[0]).toEqual({ second: 'two' });
    await view.setProps({ mounted: false });
    await submit();
    expect(validate.mock.lastCall?.[1]).toEqual({ second: 'two' });
  });

  it('excludes disabled native controls from Form and restores their current values on re-enable', async () => {
    const submitted = vi.fn();
    const view = await renderProps((p: { disabled: boolean }) => <Form data-testid="form" onFormSubmit={submitted}><Field.Root name="value"><Field.Control defaultValue="initial" disabled={p.disabled} /></Field.Root></Form>, { disabled: false });
    await edit('edited');
    await submit();
    expect(submitted.mock.lastCall?.[0]).toEqual({ value: 'edited' });
    await view.setProps({ disabled: true });
    await submit();
    expect(submitted.mock.lastCall?.[0]).toEqual({});
    await view.setProps({ disabled: false });
    await submit();
    expect(submitted.mock.lastCall?.[0]).toEqual({ value: 'edited' });
  });

  it('uses synchronous validity in the live Form Map before submission continues', async () => {
    const submitted = vi.fn();
    await render(() => <Form data-testid="form" onFormSubmit={submitted}><Field.Root name="field" validate={() => 'Blocked'}><Field.Control /><Field.Error /></Field.Root></Form>);
    await submit();
    expect(submitted).not.toHaveBeenCalled();
    expect(screen.getByText('Blocked')).toBeVisible();
    expect(control()).toHaveFocus();
  });
});

describe('Field.Error and Field.Validity projections', () => {
  it('keeps the default error hidden through edit/clear/blur and shows it on submit', async () => {
    await render(() => <Form data-testid="form"><Field.Root><Field.Control required />
      <Field.Error>Message</Field.Error></Field.Root></Form>);
    expect(screen.queryByText('Message')).toBeNull();
    fireEvent.focus(control()); await edit('a'); await edit(''); await blur();
    expect(screen.queryByText('Message')).toBeNull();
    await submit();
    expect(screen.getByText('Message')).toBeInTheDocument();
  });

  for (const match of ['valueMissing', 'customError'] as const) {
    it(`replays the exact ${match} error match action sequence`, async () => {
      await render(() => <Form data-testid="form"><Field.Root validate={match === 'customError' ? () => 'error' : undefined}>
        <Field.Control required={match === 'valueMissing'} minlength={2} />
        <Field.Error match={match}>Message</Field.Error>
      </Field.Root></Form>);
      expect(screen.queryByText('Message')).toBeNull();
      if (match === 'customError') {
        fireEvent.focus(control()); await edit('a'); await blur();
        expect(screen.queryByText('Message')).toBeNull();
      }
      await submit();
      expect(screen.getByText('Message')).toBeInTheDocument();
      if (match === 'valueMissing') {
        fireEvent.focus(control()); await edit('a');
        expect(screen.queryByText('Message')).toBeNull();
        await edit('');
        expect(screen.getByText('Message')).toBeInTheDocument();
      }
    });
  }

  for (const mode of ['onBlur', 'onSubmit'] as const) {
    it(`passes neutral then valid native validity data in ${mode}`, async () => {
      let state!: Field.Validity.State;
      await render(() => <Form data-testid="form" onSubmit={(event) => event.preventDefault()}>
        <Field.Root validationMode={mode}><Field.Control required />
          <Field.Validity>{(value) => { state = value; return null; }}</Field.Validity>
        </Field.Root>
      </Form>);
      expect(untrack(() => state.validity.valid)).toBeNull();
      if (mode === 'onSubmit') {
        await submit();
        expect(untrack(() => state.validity.valid)).toBe(false);
        expect(untrack(() => state.validity.valueMissing)).toBe(true);
        untrack(() => expect(state).toHaveProperty('transitionStatus'));
      }
      fireEvent.focus(control());
      await edit('test');
      if (mode === 'onBlur') await blur();
      expect(untrack(() => state.value)).toBe('test');
      expect(untrack(() => state.validity.valid)).toBe(true);
      expect(untrack(() => state.validity.valueMissing)).toBe(false);
    });
  }

  for (const result of ['error', ['1', '2']] as const) {
    it(`passes exact error and errors for onBlur result ${JSON.stringify(result)}`, async () => {
      let state!: Field.Validity.State;
      await render(() => <Field.Root validationMode="onBlur" validate={() => typeof result === 'string' ? result : [...result]}>
        <Field.Control /><Field.Validity>{(value) => { state = value; return null; }}</Field.Validity>
      </Field.Root>);
      fireEvent.focus(control()); await blur();
      expect(untrack(() => state.error)).toBe(typeof result === 'string' ? result : result[0]);
      expect(untrack(() => state.errors)).toEqual(typeof result === 'string' ? [result] : [...result]);
    });
  }
  for (const match of [undefined, false, true] as const) {
    for (const error of ['Reserved', ['Reserved'], ['Reserved', 'Too short']]) {
      it(`projects Form errors for match=${String(match)}, error=${JSON.stringify(error)}`, async () => {
        await render(() => <Form errors={{ name: error }}><Field.Root name="name"><Field.Control /><Field.Error match={match} data-testid="error" /></Field.Root></Form>);
        const node = screen.getByTestId('error');
        expect(node).toHaveTextContent('Reserved');
        if (Array.isArray(error) && error.length > 1) {
          expect(node.querySelector('ul')).not.toBeNull();
          expect(node).toHaveTextContent('Too short');
        } else expect(node.querySelector('ul')).toBeNull();
        expect(node.querySelectorAll('li')).toHaveLength(Array.isArray(error) && error.length > 1 ? 2 : 0);
        expect(control()).toHaveAttribute('aria-describedby', node.id);
      });
    }
  }

  for (const errors of [{}, { name: [] }, { name: '' }] as FormErrors[]) {
    it(`ignores absent, inherited and empty errors (${JSON.stringify(errors)})`, async () => {
      await render(() => <Form errors={errors}><Field.Root name={Object.keys(errors).length ? 'name' : 'constructor'}><Field.Control /><Field.Error data-testid="error" /></Field.Root></Form>);
      expect(screen.queryByTestId('error')).toBeNull();
      expect(control()).not.toHaveAttribute('aria-invalid');
    });
  }

  it('uses control-name fallback, switches to root-name precedence and clears errors on edit', async () => {
    const view = await renderProps((p: { rootName?: string }) => <Form errors={{ email: 'Taken' }}><Field.Root name={p.rootName}><Field.Control name="email" /><Field.Error /></Field.Root></Form>, { rootName: 'root' });
    expect(control()).toHaveAttribute('name', 'root');
    expect(screen.queryByText('Taken')).toBeNull();
    await view.setProps({ rootName: undefined });
    expect(control()).toHaveAttribute('name', 'email');
    expect(screen.getByText('Taken')).toBeVisible();
    await edit('next');
    expect(screen.queryByText('Taken')).toBeNull();
    expect(control()).not.toHaveAttribute('aria-invalid');
  });

  it('specific matches show client errors rather than external messages', async () => {
    await render(() => <Form data-testid="form" errors={{ name: 'Server' }}><Field.Root name="name" validate={() => ['Client', 'Other']}><Field.Control /><Field.Error match="customError" data-testid="specific" /><Field.Error data-testid="default" /></Field.Root></Form>);
    await submit();
    expect(screen.getByTestId('specific')).toHaveTextContent('Client');
    expect(screen.getByTestId('specific')).not.toHaveTextContent('Server');
    expect(screen.getByTestId('specific').querySelectorAll('li')).toHaveLength(2);
    expect(screen.getByTestId('default')).toHaveTextContent('Server');
  });

  it('hides computed errors while disabled but match=true remains visible', async () => {
    await render(() => <Form errors={{ name: 'Server' }}><Field.Root disabled name="name"><Field.Control /><Field.Error data-testid="hidden" /><Field.Error match data-testid="forced">Forced</Field.Error></Field.Root></Form>);
    expect(screen.queryByTestId('hidden')).toBeNull();
    expect(screen.getByText('Forced')).toBeVisible();
    expect(control()).toHaveAttribute('data-invalid');
    expect(control()).not.toHaveAttribute('aria-invalid');
  });

  it('does not register empty error IDs and cleans IDs when match changes', async () => {
    const view = await renderProps((p: { id: string; match: boolean }) => <Field.Root><Field.Control aria-describedby="external" /><Field.Error id={p.id} match={p.match}>Error</Field.Error></Field.Root>, { id: '', match: true });
    expect(control()).toHaveAttribute('aria-describedby', 'external');
    await view.setProps({ id: 'error' });
    expect(control()).toHaveAttribute('aria-describedby', 'external error');
    await view.setProps({ match: false });
    expect(control()).toHaveAttribute('aria-describedby', 'external');
  });

  it('Validity callback exposes live errors, initial value and external invalidity', async () => {
    const view = await renderProps((p: { invalid: boolean }) => <Field.Root invalid={p.invalid} validationMode="onBlur" validate={() => ['One', 'Two']}><Field.Control defaultValue="initial" /><Field.Validity>{(s) => <output>{`${s.validity.valid}|${s.initialValue}|${s.value}|${s.error}|${s.errors.join(',')}`}</output>}</Field.Validity></Field.Root>, { invalid: false });
    await view.setProps({ invalid: true });
    expect(screen.getByRole('status')).toHaveTextContent('false|initial');
    await view.setProps({ invalid: false });
    await edit('changed');
    await blur();
    expect(screen.getByRole('status')).toHaveTextContent('false|initial|changed|One|One,Two');
  });

  for (const mode of ['onBlur', 'onSubmit'] as const) {
    it(`immediately exposes valueMissing after a stale custom error in ${mode} mode`, async () => {
      const validate = vi.fn(() => 'Custom');
      await render(() => <Form data-testid="form"><Field.Root validationMode={mode} validate={validate}><Field.Control required /><Field.Error match="valueMissing">Required</Field.Error><Field.Validity>{(s) => <output>{`${s.value}:${s.validity.customError}:${s.validity.valueMissing}`}</output>}</Field.Validity></Field.Root></Form>);
      await edit('invalid');
      if (mode === 'onBlur') await blur(); else await submit();
      expect(screen.getByRole('status')).toHaveTextContent('invalid:true:false');
      expect(validate).toHaveBeenCalledTimes(1);
      await edit('');
      expect(screen.getByText('Required')).toBeVisible();
      expect(screen.getByRole('status')).toHaveTextContent(`:${mode === 'onSubmit'}:true`);
      expect(validate).toHaveBeenCalledTimes(mode === 'onSubmit' ? 2 : 1);
      if (mode === 'onBlur') await blur(); else await submit();
      expect(screen.getByText('Required')).toBeVisible();
      expect(screen.getByRole('status')).toHaveTextContent(`:${mode === 'onSubmit'}:true`);
    });
  }
});

browserCase({ source: 'packages/react/src/field/validity/FieldValidity.test.tsx', case: 'defers badInput during required change revalidation', environment: 'browser', issue: 'bsolid-browser' }, async () => {
  await render(() => <Field.Root validationMode="onBlur" validate={() => 'Custom'}><Field.Control type="number" required /><Field.Error match="valueMissing">Required</Field.Error><Field.Error match="badInput">Bad input</Field.Error><Field.Validity>{(s) => <output>{`${s.value}:${s.validity.valueMissing}:${s.validity.badInput}`}</output>}</Field.Validity></Field.Root>);
  const { userEvent: user } = await import('vitest/browser');
  const input = screen.getByRole<HTMLInputElement>('spinbutton');
  await user.click(input);
  await user.keyboard('1{Tab}');
  await user.click(input);
  // Native editing, rather than assigning .value, sets the badInput buffer.
  await user.keyboard(navigator.platform.includes('Mac') ? '{Meta>}a{/Meta}e' : '{Control>}a{/Control}e');
  expect(input.validity.valueMissing).toBe(true);
  expect(input.validity.badInput).toBe(true);
  expect(screen.getByRole('status')).toHaveTextContent('1:false:false');
  expect(screen.queryByText('Required')).toBeNull();
  expect(screen.queryByText('Bad input')).toBeNull();
});

for (const custom of [false, true]) {
  browserCase({ source: 'packages/react/src/field/root/FieldRoot.test.tsx', case: `barred controls with ${custom ? 'owned' : 'foreign'} custom validity`, environment: 'browser', issue: 'bsolid-browser' }, async () => {
    const submitted = vi.fn();
    const view = await renderProps((p: { readOnly: boolean }) => <Form data-testid="form" onFormSubmit={submitted}><Field.Root name="field" validationMode="onChange" validate={custom ? () => 'Owned' : undefined}><Field.Control readonly={p.readOnly} /><Field.Error data-testid="error" /></Field.Root></Form>, { readOnly: true });
    expect(control().willValidate).toBe(false);
    control().setCustomValidity('Foreign');
    await edit('abc');
    if (custom) {
      expect(screen.getByTestId('error')).toHaveTextContent('Owned');
      await view.setProps({ readOnly: false });
      expect(control().validationMessage).toBe('Foreign');
    } else {
      expect(control()).not.toHaveAttribute('data-invalid');
      expect(screen.queryByTestId('error')).toBeNull();
      await submit();
      expect(submitted).toHaveBeenCalledTimes(1);
    }
  });
}
