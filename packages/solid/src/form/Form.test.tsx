import { createEffect, flush, onCleanup, untrack } from 'solid-js';
import { describe, expect, it, vi } from 'vitest';
import { browserCase, createRenderer, describeConformance, fireEvent } from '../../test';
import { Form } from './Form';
import { mergeProps } from '../merge-props';
import { useFormContext } from '../internals/form-context/FormContext';
import type { FormContext, FormFieldRegistration, FieldValidityData } from '../internals/contracts/field';

// Source: packages/react/src/form/Form.test.tsx at 19511bb171f3b360b006c94cf6d07e53cb446505.
// Registry fixture isolates Form orchestration; Form.field.test.tsx replays real Field/core.
const { render, renderProps } = createRenderer();
function validity(valid: boolean | null = true): FieldValidityData {
  return { state: { valid, badInput: false, customError: false, patternMismatch: false,
    rangeOverflow: false, rangeUnderflow: false, stepMismatch: false, tooLong: false,
    tooShort: false, typeMismatch: false, valueMissing: false },
  error: '', errors: [], value: '', initialValue: '' };
}
function Register(props: { id: string; name?: string; invalid?: boolean; required?: boolean;
  validate?: (entry: FormFieldRegistration) => void; capture?: (entry: FormFieldRegistration) => void;
  value?: unknown; getValue?: () => unknown; hidden?: boolean; external?: boolean }) {
  const form = useFormContext()!;
  let input: HTMLInputElement | null = null;
  const entry: FormFieldRegistration = {
    get name() { return props.name; },
    validityData: validity(), controlRef: () => input,
    getValue: () => props.getValue ? props.getValue() : props.value ?? input?.value,
    validate() {
      if (props.validate) props.validate(entry);
      else entry.validityData = validity(props.invalid ? false : input?.validity.valid ?? true);
    },
  };
  form.fields.set(props.id, entry);
  props.capture?.(entry);
  onCleanup(() => { if (form.fields.get(props.id) === entry) form.fields.delete(props.id); });
  createEffect(() => props.external && props.name ? form.errors[props.name] : undefined,
    (error) => { if (props.external) entry.validityData = validity(!error); });
  return props.hidden ? null : <input ref={(node) => { input = node; }} data-testid={props.id}
    required={props.required} onInput={() => form.clearErrors(props.name)} />;
}
function Capture(props: { read: (context: FormContext) => void }) {
  props.read(useFormContext()!);
  return null;
}
function submit(form: HTMLFormElement) {
  const event = new SubmitEvent('submit', { bubbles: true, cancelable: true });
  form.dispatchEvent(event);
  return event;
}

describe('Form', () => {
  describeConformance((props) => <Form {...props} />, {
    initialProps: {}, refInstanceof: HTMLFormElement,
  });
  it('blocks synchronously, validates every field, and focuses/selects the DOM-first invalid control', async () => {
    const calls: string[] = [];
    const handler = vi.fn();
    const view = await render(() => <Form onFormSubmit={handler}>
      <Register id="a" validate={(entry) => { calls.push('a'); entry.validityData = validity(false); }} />
      <Register id="b" validate={(entry) => { calls.push('b'); entry.validityData = validity(false); }} />
    </Form>);
    const a = view.getByTestId('a');
    const b = view.getByTestId('b') as HTMLInputElement;
    b.value = 'selected';
    a.before(b); // Keyed movement: registry identity/order deliberately stays unchanged.
    expect(submit(a.closest('form')!).defaultPrevented).toBe(true);
    expect(calls).toEqual(['a', 'b']);
    expect(handler).not.toHaveBeenCalled();
    expect(b).toHaveFocus();
    expect([b.selectionStart, b.selectionEnd]).toEqual([0, 8]);
  });

  it('blocks an invalid field without a control but focuses a later usable invalid field', async () => {
    const view = await render(() => <Form><Register id="absent" hidden invalid />
      <Register id="native" required /></Form>);
    const input = view.getByTestId('native');
    expect(submit(input.closest('form')!).defaultPrevented).toBe(true);
    expect(input).toHaveFocus();
  });

  it('preserves registration-order fallback for controls in separate shadow roots', async () => {
    const view = await render(() => <Form data-testid="form"><Register id="a" invalid /><Register id="b" invalid /></Form>);
    const first = document.createElement('div');
    const second = document.createElement('div');
    document.body.append(first, second);
    const rootA = first.attachShadow({ mode: 'open' });
    const rootB = second.attachShadow({ mode: 'open' });
    const a = view.getByTestId('a');
    const b = view.getByTestId('b');
    try {
      rootA.append(a); rootB.append(b);
      expect(submit(view.getByTestId('form') as HTMLFormElement).defaultPrevented).toBe(true);
      expect(rootA.activeElement).toBe(a);
    } finally { first.remove(); second.remove(); }
  });

  it('does not await pending async validation; resolved invalidity blocks the next submit', async () => {
    let resolve!: () => void;
    const handler = vi.fn();
    const view = await render(() => <Form onFormSubmit={handler}>
      <Register id="async" validate={(entry) => {
        void new Promise<void>((done) => { resolve = done; }).then(() => { entry.validityData = validity(false); });
      }} />
    </Form>);
    const form = view.getByTestId('async').closest('form')!;
    submit(form);
    expect(handler).toHaveBeenCalledTimes(1);
    resolve(); await Promise.resolve();
    submit(form);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('uses the fresh synchronous verdict to retire stale errors on the next submit', async () => {
    let invalid = true;
    const handler = vi.fn();
    const view = await render(() => <Form onFormSubmit={handler}><Register id="control"
      validate={(entry) => { entry.validityData = validity(!invalid); }} /></Form>);
    const form = view.getByTestId('control').closest('form')!;
    submit(form); invalid = false; submit(form);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('increments submit count before validators and projects getValue after the native callback', async () => {
    let context!: FormContext;
    let projected = 5;
    const order: string[] = [];
    const onFormSubmit = vi.fn(() => { order.push('values'); });
    const view = await render(() => <Form onSubmit={(event) => {
      expect(event).toBeInstanceOf(SubmitEvent); expect(event.currentTarget).toBe(view.container.querySelector('form'));
      order.push('native'); projected = 6;
    }} onFormSubmit={onFormSubmit}>
      <Capture read={(value) => { context = value; }} />
      <Register id="number" name="quantity" getValue={() => projected}
        validate={() => { expect(context.submitCount).toBe(1); order.push('validate'); }} />
      <Register id="unnamed" value="omitted" />
    </Form>);
    submit(view.container.querySelector('form')!);
    expect(order).toEqual(['validate', 'native', 'values']);
    expect(onFormSubmit).toHaveBeenCalledTimes(1);
    expect(onFormSubmit).toHaveBeenCalledWith({ quantity: 6 }, expect.objectContaining({
      reason: 'none', event: expect.objectContaining({ defaultPrevented: true }),
    }));
  });

  it('imperative validation targets the first current matching name, all on empty name, and detaches', async () => {
    let actions: Form.Actions | null = null;
    let context!: FormContext;
    const first = vi.fn(); const second = vi.fn();
    const ref = vi.fn((value: Form.Actions | null) => { actions = value; });
    const view = await render(() => <Form actionsRef={ref}>
      <Capture read={(value) => { context = value; }} />
      <Register id="a" name="same" validate={first} /><Register id="b" name="same" validate={second} />
    </Form>);
    untrack(() => actions!.validate('same'));
    expect(first).toHaveBeenCalledTimes(1); expect(second).not.toHaveBeenCalled();
    context.fields.delete('a');
    untrack(() => actions!.validate('same'));
    expect(second).toHaveBeenCalledTimes(1);
    untrack(() => actions!.validate(''));
    expect(second).toHaveBeenCalledTimes(2);
    expect(context.submitCount).toBe(0);
    const stale = actions!;
    view.unmount();
    expect(ref).toHaveBeenLastCalledWith(null);
    stale.validate(); expect(second).toHaveBeenCalledTimes(2);
  });

  it('clears several own errors in one staged commit without mutating external errors', async () => {
    let context!: FormContext;
    const errors = Object.assign(Object.create({ inherited: 'inherited' }), { a: 'A', b: 'B', c: 'C' });
    await render(() => <Form errors={errors}><Capture read={(value) => { context = value; }} /></Form>);
    untrack(() => { context.clearErrors('inherited'); context.clearErrors(undefined); });
    flush(); expect(untrack(() => context.errors)).toBe(errors);
    untrack(() => { context.clearErrors('a'); context.clearErrors('b'); });
    flush(); expect(untrack(() => context.errors)).toEqual({ c: 'C' });
    expect(errors.a).toBe('A'); expect(errors.b).toBe('B');
  });

  it('focuses external errors only after a successful submit, not on later error clearing', async () => {
    let context!: FormContext;
    const view = await renderProps((props: { errors?: Form.Props['errors'] }) =>
      <Form errors={props.errors} onFormSubmit={() => {}}>
        <Capture read={(value) => { context = value; }} />
        <Register id="a" name="a" external /><Register id="b" name="b" external />
      </Form>, {});
    const a = view.getByTestId('a'); const b = view.getByTestId('b');
    await view.setProps({ errors: { a: 'A' } });
    expect(a).not.toHaveFocus();
    await view.setProps({ errors: undefined });
    submit(a.closest('form')!);
    await view.setProps({ errors: { a: 'A', b: 'B' } });
    await Promise.resolve();
    expect(a).toHaveFocus();
    untrack(() => context.clearErrors('a')); flush(); await Promise.resolve();
    expect(b).not.toHaveFocus();
  });

  it('keeps the host and current callback live, with consumer noValidate override', async () => {
    const before = vi.fn(); const after = vi.fn();
    const view = await renderProps<Form.Props>((props) => <Form {...props} />, { onFormSubmit: before });
    const form = view.container.querySelector('form')!;
    expect(form.noValidate).toBe(true);
    await view.setProps({ noValidate: false, onFormSubmit: after });
    expect(view.container.querySelector('form')).toBe(form);
    expect(form.noValidate).toBe(false);
    fireEvent.submit(form);
    expect(before).not.toHaveBeenCalled(); expect(after).toHaveBeenCalledTimes(1);
  });

  it('allows explicit undefined to mask the native noValidate default', async () => {
    const view = await render(() => <Form noValidate={undefined} />);
    expect(view.container.querySelector('form')).not.toHaveAttribute('novalidate');
  });

  it('exposes the source noValidate render prop and keeps the custom host under Form context', async () => {
    let context!: FormContext;
    const view = await render(() => <Form render={(props) => {
      context = useFormContext()!;
      return <form {...props} data-validation={String(props.noValidate)} />;
    }}><Register id="control" name="value" /></Form>);
    const form = view.container.querySelector('form')!;
    expect(form).toHaveAttribute('data-validation', 'true');
    expect(context.fields.size).toBe(1);
    expect(context.elementRef()).toBe(form);
  });

  it('detaches replaced action refs while retaining the live action object', async () => {
    const before = vi.fn(); const after = vi.fn();
    const view = await renderProps<Form.Props>((props) => <Form {...props} />, { actionsRef: before });
    const actions = before.mock.calls[0][0];
    await view.setProps({ actionsRef: after });
    expect(before).toHaveBeenLastCalledWith(null);
    expect(after).toHaveBeenCalledWith(actions);
    view.unmount();
    expect(after).toHaveBeenLastCalledWith(null);
  });

  it('leaves a valid native submit unprevented without onFormSubmit', async () => {
    const native = vi.fn();
    // Gecko follows an unprevented synthetic submit. Keep the real default
    // action in an owned blank frame, rather than navigating the Vitest tester
    // back into its transport bootstrap.
    const view = await render(() => <Form onSubmit={native} action="about:blank" target="form-submit-target">
      <Register id="valid" /><iframe name="form-submit-target" src="about:blank" title="Submission target" />
    </Form>);
    const event = submit(view.container.querySelector('form')!);
    expect(native).toHaveBeenCalledWith(event);
    expect(event.defaultPrevented).toBe(false);
  });

  it('continues onFormSubmit after native prevention and supports bound current handlers', async () => {
    const native = vi.fn((_data: string, event: SubmitEvent) => { event.preventDefault(); });
    const handler = vi.fn();
    const view = await render(() => <Form onSubmit={[native, 'bound']} onFormSubmit={handler} />);
    const event = submit(view.container.querySelector('form')!);
    expect(native).toHaveBeenCalledWith('bound', event);
    expect(handler).toHaveBeenCalledWith({}, expect.objectContaining({ event }));
    expect(event.defaultPrevented).toBe(true);
  });

  it('honors render-handler Base UI prevention before any internal validation', async () => {
    let context!: FormContext;
    const validate = vi.fn();
    const handler = vi.fn();
    const view = await render(() => <Form onFormSubmit={handler} render={(props) => <form
      {...mergeProps<'form'>(props, { onSubmit(event) {
        event.preventDefault(); event.preventBaseUIHandler();
      } })} />}>
      <Capture read={(value) => { context = value; }} /><Register id="control" validate={validate} />
    </Form>);
    submit(view.container.querySelector('form')!);
    expect(context.submitCount).toBe(0);
    expect(validate).not.toHaveBeenCalled();
    expect(handler).not.toHaveBeenCalled();
  });

  it('consumes same-turn removal/re-enabling of registry entries for validity and values', async () => {
    let context!: FormContext;
    let entry!: FormFieldRegistration;
    const handler = vi.fn();
    const view = await render(() => <Form onFormSubmit={handler}>
      <Capture read={(value) => { context = value; }} />
      <Register id="control" name="control" required capture={(value) => { entry = value; }} />
    </Form>);
    const control = view.getByTestId('control') as HTMLInputElement;
    const form = control.closest('form')!;
    submit(form); expect(handler).not.toHaveBeenCalled();
    // Foundation owns disabled/unmounted registration policy; Form sees its live removal.
    control.disabled = true; context.fields.delete('control');
    submit(form); expect(handler.mock.lastCall?.[0]).toEqual({});
    control.disabled = false; context.fields.set('control', entry);
    submit(form); expect(handler).toHaveBeenCalledTimes(1);
    control.value = 'sent'; submit(form);
    expect(handler.mock.lastCall?.[0]).toEqual({ control: 'sent' });
    control.remove(); context.fields.delete('control');
    submit(form); expect(handler.mock.lastCall?.[0]).toEqual({});
  });

  it('keeps unnamed and same-name invalid entries independently blocking', async () => {
    const handler = vi.fn();
    const view = await render(() => <Form onFormSubmit={handler}>
      <Register id="unnamed" invalid /><Register id="first" name="same" invalid />
      <Register id="second" name="same" />
    </Form>);
    const input = view.getByTestId('unnamed');
    expect(submit(input.closest('form')!).defaultPrevented).toBe(true);
    expect(input).toHaveFocus(); expect(handler).not.toHaveBeenCalled();
  });

  browserCase({ source: 'packages/react/src/form/Form.test.tsx',
    case: 'blocks submit and focuses/selects the first invalid control', environment: 'browser',
    issue: 'bsolid-browser' }, async () => {
    const handler = vi.fn();
    const view = await render(() => <Form onFormSubmit={handler}>
      <Register id="browser-control" invalid /><button type="submit">Submit</button>
    </Form>);
    const input = view.getByTestId('browser-control') as HTMLInputElement;
    input.value = 'select me';
    await view.user.click(view.getByRole('button'));
    expect(input).toHaveFocus();
    expect([input.selectionStart, input.selectionEnd]).toEqual([0, 9]);
    expect(handler).not.toHaveBeenCalled();
  });

  browserCase({ source: 'packages/react/src/form/Form.test.tsx',
    case: 'noValidate native submission policy', environment: 'browser',
    issue: 'bsolid-browser' }, async () => {
    let context!: FormContext;
    const handler = vi.fn();
    const view = await renderProps<Form.Props>((props) => <Form {...props}>
      <Capture read={(value) => { context = value; }} />
      <input required /><button type="submit">Submit</button>
    </Form>, { onFormSubmit: handler });
    const form = view.container.querySelector('form')!;
    const button = view.getByRole('button');
    await view.user.click(button);
    expect(handler).toHaveBeenCalledTimes(1);
    expect(context.submitCount).toBe(1);
    await view.setProps({ noValidate: false });
    expect(view.container.querySelector('form')).toBe(form);
    await view.user.click(button);
    expect(handler).toHaveBeenCalledTimes(1);
    expect(context.submitCount).toBe(1);
  });
});
