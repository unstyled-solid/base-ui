import { expect, it } from 'vitest';
import { flush, untrack } from 'solid-js';
import { createRenderer } from '../../../test';
import { createField } from './createField';
import { FormContext } from '../form-context';
import type { FormContext as FormValue } from '../contracts/field';
import type { FieldRootContextValue } from '../field-root-context';

it('createField clears visible dirty without forgetting native required validation or its replacement baseline', async () => {
  let field!: FieldRootContextValue, input!: HTMLInputElement;
  await createRenderer().render(() => {
    field = createField({});
    return <input required ref={node => { input = node; }} />;
  });
  const first = Symbol(), replacement = Symbol();
  field.registerFieldControl(first, { controlRef: () => input, id: 'field', value: '' });
  field.validation.registerInput(Symbol(), input);
  field.setDirty(true); field.setDirty(false);
  field.registerFieldControl(replacement, { controlRef: () => input, id: 'field', value: 'replacement' });
  field.registerFieldControl(first, undefined);
  await field.validation.commit('');
  flush();
  expect(untrack(() => field.state.dirty)).toBe(false);
  expect(untrack(() => field.validityData.initialValue)).toBe('');
  expect(untrack(() => field.validityData.state.valueMissing)).toBe(true);
});

it('createField retains live controlled dirty overrides while ignoring control dirty writes', async () => {
  let field!: FieldRootContextValue;
  const view = await createRenderer().renderProps((props: { dirty: boolean }) => {
    field = createField({ get dirty() { return props.dirty; } });
    return <output>{String(field.state.dirty)}</output>;
  }, { dirty: false });
  field.setDirty(true); flush();
  expect(view.getByRole('status')).toHaveTextContent('false');
  await view.setProps({ dirty: true });
  field.setDirty(false); flush();
  expect(view.getByRole('status')).toHaveTextContent('true');
  await view.setProps({ dirty: false });
  expect(view.getByRole('status')).toHaveTextContent('false');
});

it('createField keeps field baseline and registry order across replacement and ignores stale cleanup', async () => {
  let field!: FieldRootContextValue;
  const form: FormValue = { errors: {}, clearErrors() {}, elementRef: () => null, fields: new Map(), validationMode: 'onSubmit', submitCount: 0 };
  function Probe() { field = createField({ name: 'field', validate: () => 'invalid' }); return <output>{field.validityData.error}</output>; }
  const view = await createRenderer().render(() => <FormContext value={form}><Probe /></FormContext>);
  const first = Symbol(), next = Symbol();
  field.registerFieldControl(first, { controlRef: () => null, id: 'field', value: 'initial' });
  field.registerFieldControl(next, { controlRef: () => null, id: 'field', value: 'replacement' });
  field.registerFieldControl(first, undefined);
  expect(form.fields.has('field')).toBe(true);
  field.validate();
  expect(form.fields.get('field')!.validityData.state.valid).toBe(false);
  expect(form.fields.get('field')!.validityData.initialValue).toBe('initial');
  flush();
  expect(view.getByRole('status')).toHaveTextContent('invalid');
});

it('createField publishes neutral async validity synchronously and ignores stale results', async () => {
  let field!: FieldRootContextValue;
  const resolves: ((value: string | null) => void)[] = [];
  const view = await createRenderer().render(() => {
    field = createField({ validationMode: 'onSubmit', validate: () => new Promise<string | null>((resolve) => resolves.push(resolve)) });
    return <output>{field.validityData.error}</output>;
  });
  const first = field.validation.commit('first');
  const next = field.validation.commit('second');
  resolves[1]!(null);
  await next;
  resolves[0]!('stale error');
  await first;
  flush();
  expect(untrack(() => field.validityData.state.valid)).toBe(true);
  expect(view.getByRole('status').textContent).toBe('');
});

it('createField restores displaced custom validity and chooses the first invalid group input', async () => {
  let field!: FieldRootContextValue;
  let input!: HTMLInputElement;
  const view = await createRenderer().render(() => {
    field = createField({ validate: () => 'owned error' });
    return <input ref={(node) => { input = node; }} />;
  });
  const source = Symbol();
  field.validation.registerInput(source, input);
  await field.validation.commit('value');
  expect(input.validationMessage).toBe('owned error');
  input.setCustomValidity('external replacement');
  view.unmount();
  expect(input.validationMessage).toBe('external replacement');
});

it('createField submit validation marks native required constraints even with controlled dirty=false', async () => {
  let field!: FieldRootContextValue;
  let input!: HTMLInputElement;
  const view = await createRenderer().render(() => {
    field = createField({ dirty: false });
    return <input required ref={(node) => { input = node; }} />;
  });
  field.validation.registerInput(Symbol(), input);
  field.validate();
  flush();
  expect(untrack(() => field.state.dirty)).toBe(false);
  expect(untrack(() => field.validityData.state.valueMissing)).toBe(true);
  expect(untrack(() => field.validityData.state.valid)).toBe(false);
  view.unmount();
});

it('createField preserves a same-turn custom failure while the next async validation is pending', async () => {
  let field!: FieldRootContextValue;
  let resolve!: (value: null) => void;
  const view = await createRenderer().render(() => {
    field = createField({ validationMode: 'onBlur', validate: (value) => value === 'first' ? 'failure' : new Promise<null>((done) => { resolve = done; }) });
    return <output>{field.validityData.error}</output>;
  });
  const first = field.validation.commit('first');
  const next = field.validation.commit('second');
  flush();
  expect(view.getByRole('status')).toHaveTextContent('failure');
  resolve(null);
  await next; await first;
  flush();
  expect(view.getByRole('status').textContent).toBe('');
});

it('createField ignores inherited Form errors but recognizes own prototype-named errors', async () => {
  const form: FormValue = { errors: {}, clearErrors() {}, elementRef: () => null, fields: new Map(), validationMode: 'onSubmit', submitCount: 0 };
  function Probe(props: { name: string }) {
    const field = createField({ get name() { return props.name; } });
    return <output>{String(field.invalid)}</output>;
  }
  const view = await createRenderer().renderProps((props: { name: string; errors: Record<string, string> }) =>
    <FormContext value={{ ...form, get errors() { return props.errors; } }}><Probe name={props.name} /></FormContext>,
  { name: 'constructor', errors: {} });
  expect(view.getByRole('status')).toHaveTextContent('false');
  await view.setProps({ errors: { constructor: 'own error' } });
  expect(view.getByRole('status')).toHaveTextContent('true');
  await view.setProps({ name: 'toString' });
  expect(view.getByRole('status')).toHaveTextContent('false');
});

it('createField defaults to submit validation without a Form provider', async () => {
  let field!: FieldRootContextValue;
  await createRenderer().render(() => {
    field = createField({});
    return <output>{field.validationMode}:{String(field.shouldValidateOnChange())}</output>;
  }).then((view) => expect(view.getByRole('status')).toHaveTextContent('onSubmit:false'));
});

it('createField validates direct native fallbacks, including foreign-form textarea, separately from groups', async () => {
  let field!: FieldRootContextValue;
  let ownForm!: HTMLFormElement, foreign!: HTMLFormElement, input!: HTMLInputElement, textarea!: HTMLTextAreaElement;
  const form: FormValue = { errors: {}, clearErrors() {}, elementRef: () => ownForm, fields: new Map(), validationMode: 'onSubmit', submitCount: 0 };
  function Probe() { field = createField({}); return <><form ref={(node) => { ownForm = node; }} /><form id="foreign" ref={(node) => { foreign = node; }} /><input required ref={(node) => { input = node; }} /><textarea required form="foreign" ref={(node) => { textarea = node; }} /></>; }
  await createRenderer().render(() => <FormContext value={form}><Probe /></FormContext>);
  const source = Symbol();
  field.validation.registerInput(source, textarea);
  expect(textarea.form).toBe(foreign);
  field.validate(); flush(); expect(untrack(() => field.validityData.state.valueMissing)).toBe(true);
  textarea.value = 'valid'; field.validate(); flush(); expect(untrack(() => field.validityData.state.valid)).toBe(true);
  // A foreign group member is excluded; it must not fall back to the direct ref.
  field.validation.registerInput(source, input, { controlRef: () => input });
  field.validation.registerInput(Symbol(), textarea, { controlRef: () => textarea });
  field.validate(); flush(); expect(untrack(() => field.validityData.state.valueMissing)).toBe(true);
});
