// Source: upstream FieldControl.test.tsx + FieldRoot defaultValue/style/remount cases,
// SHA 19511bb171f3b360b006c94cf6d07e53cb446505. Native input replaces synthetic change.
import { describe, expect, it, vi } from 'vitest';
import { createSignal } from 'solid-js';
import { createRenderer, fireEvent, flushMicrotasks, screen, waitFor, browserCase } from '../../../test';
import { Field } from '../index';
import { Form } from '../../form/Form';
import type { FieldControlProps } from './FieldControl';

const { render, renderProps } = createRenderer();
const control = () => screen.getByRole<HTMLInputElement>('textbox');
async function edit(value: string) { fireEvent.input(control(), { target: { value } }); await flushMicrotasks(); }
async function blur() { fireEvent.blur(control()); await flushMicrotasks(); }

describe('Field.Control native editing', () => {
  it('works standalone with current callbacks and native refs', async () => {
    const first = vi.fn();
    const second = vi.fn();
    const ref = vi.fn();
    const view = await renderProps((p: FieldControlProps) => <Field.Control {...p} />, { onValueChange: first, ref });
    expect(ref).toHaveBeenCalledWith(control());
    await edit('a');
    expect(first.mock.lastCall?.[0]).toBe('a');
    expect(first.mock.lastCall?.[1].event.type).toBe('input');
    await view.setProps({ onValueChange: second });
    await edit('b');
    expect(first).toHaveBeenCalledTimes(1);
    expect(second.mock.lastCall?.[0]).toBe('b');
    view.unmount();
    expect(ref).toHaveBeenLastCalledWith(null);
  });

  for (const controlled of [false, true]) {
    it(`validates once per edit (${controlled ? 'controlled' : 'uncontrolled'})`, async () => {
      const validate = vi.fn((_value: unknown) => null);
      let setups = 0;
      await render(() => {
        const [value, setValue] = createSignal('');
        return <Field.Root validationMode="onChange" validate={validate}><Field.Control value={controlled ? value() : undefined} onValueChange={setValue} render={(p) => { setups++; return <input {...p} />; }} /></Field.Root>;
      });
      const node = control();
      await edit('a');
      expect(validate).toHaveBeenCalledTimes(1);
      expect(validate.mock.lastCall?.[0]).toBe('a');
      for (const value of ['ab', 'abc']) await edit(value);
      expect(validate).toHaveBeenCalledTimes(3);
      expect(validate.mock.lastCall?.[0]).toBe('abc');
      expect(control()).toBe(node);
      expect(setups).toBe(1);
    });
  }

  it('never publishes rejected controlled candidates', async () => {
    const validate = vi.fn((_value: unknown) => null);
    const changed = vi.fn();
    await render(() => <Field.Root validationMode="onChange" validate={validate} data-testid="root"><Field.Control value="initial" onValueChange={changed} /></Field.Root>);
    await edit('rejected');
    expect(changed.mock.lastCall?.[0]).toBe('rejected');
    expect(control()).toHaveValue('initial');
    expect(validate).not.toHaveBeenCalled();
    expect(screen.getByTestId('root')).not.toHaveAttribute('data-dirty');
  });

  it('validates only the accepted rewritten controlled value', async () => {
    const validate = vi.fn((_value: unknown) => null);
    await render(() => {
      const [value, setValue] = createSignal('');
      return <Field.Root validationMode="onChange" validate={validate}><Field.Control value={value()} onValueChange={(next) => setValue(next.toUpperCase())} /></Field.Root>;
    });
    await edit('abc');
    expect(control()).toHaveValue('ABC');
    expect(validate).toHaveBeenCalledTimes(1);
    expect(validate.mock.lastCall?.[0]).toBe('ABC');
  });

  it('serializes numeric controlled values for baseline comparisons', async () => {
    await render(() => {
      const [value, setValue] = createSignal(5);
      return <Field.Root data-testid="root"><Field.Control value={value()} onValueChange={(next) => setValue(Number(next))} /></Field.Root>;
    });
    expect(screen.getByTestId('root')).not.toHaveAttribute('data-dirty');
    await edit('56');
    expect(screen.getByTestId('root')).toHaveAttribute('data-dirty');
    await edit('5');
    expect(screen.getByTestId('root')).not.toHaveAttribute('data-dirty');
  });

  it('syncs programmatic controlled updates without a value-change callback', async () => {
    const changed = vi.fn();
    const validate = vi.fn((_value: unknown) => null);
    const view = await renderProps((p: { value: string }) => <Field.Root validationMode="onChange" validate={validate}><Field.Control value={p.value} onValueChange={changed} /></Field.Root>, { value: '' });
    await view.setProps({ value: 'external' });
    expect(control()).toHaveAttribute('data-filled');
    expect(control()).toHaveAttribute('data-dirty');
    expect(validate).toHaveBeenCalledTimes(1);
    expect(validate.mock.lastCall?.[0]).toBe('external');
    expect(changed).not.toHaveBeenCalled();
  });

  it('sets filled state from a controlled value on an inputless render target', async () => {
    await render(() => <Field.Root data-testid="root"><Field.Control<HTMLDivElement> value="value" render={(p) => <div {...p} />} /></Field.Root>);
    expect(screen.getByTestId('root')).toHaveAttribute('data-filled');
  });

  it('retains the field baseline when a controlled control unmounts and remounts', async () => {
    const view = await renderProps((p: { mounted: boolean; value: string }) => <Field.Root data-testid="root">{p.mounted && <Field.Control value={p.value} />}</Field.Root>, { mounted: true, value: 'initial' });
    await view.setProps({ value: 'changed' });
    expect(screen.getByTestId('root')).toHaveAttribute('data-dirty');
    await view.setProps({ mounted: false });
    await view.setProps({ mounted: true });
    expect(screen.getByTestId('root')).toHaveAttribute('data-dirty');
    await view.setProps({ value: 'initial' });
    expect(screen.getByTestId('root')).not.toHaveAttribute('data-dirty');
  });

  for (const value of ['', 'programmatic']) {
    it(`preserves DOM authority across focus and prop updates (${JSON.stringify(value)})`, async () => {
      const view = await renderProps((p: { title: string }) => <Field.Root><Field.Control defaultValue="initial" title={p.title} /></Field.Root>, { title: 'before' });
      const node = control();
      node.value = value;
      fireEvent.focus(node);
      await view.setProps({ title: 'after' });
      expect(control()).toBe(node);
      expect(node).toHaveValue(value);
    });
  }

  for (const mode of ['cancel', 'preventDefault', 'preventBaseUIHandler'] as const) {
    it(`preserves source cancellation side effects: ${mode}`, async () => {
      const validate = vi.fn(() => null);
      const changed = vi.fn((_next: string, details: Field.Control.ChangeEventDetails) => { if (mode === 'cancel') details.cancel(); });
      await render(() => <Form errors={{ message: 'Server error' }}><Field.Root name="message" validationMode="onChange" validate={validate}><Field.Control onValueChange={changed} onInput={(event) => { if (mode === 'preventDefault') event.preventDefault(); if (mode === 'preventBaseUIHandler') event.preventBaseUIHandler(); }} /><Field.Error /></Field.Root></Form>);
      fireEvent.input(control(), { cancelable: true, target: { value: 'edited' } });
      await flushMicrotasks();
      expect(control()).toHaveValue('edited');
      expect(validate).not.toHaveBeenCalled();
      expect(screen.getByText('Server error')).toBeVisible();
      expect(changed).toHaveBeenCalledTimes(mode === 'preventBaseUIHandler' ? 0 : 1);
      if (mode !== 'preventBaseUIHandler') {
        expect(control()).toHaveAttribute('data-dirty');
        expect(control()).toHaveAttribute('data-filled');
      }
    });
  }

  it('observes native capture-phase default prevention without suppressing the callback', async () => {
    const validate = vi.fn();
    const changed = vi.fn();
    await render(() => <Field.Root validationMode="onChange" validate={validate}><Field.Control onValueChange={changed} /></Field.Root>);
    control().addEventListener('input', (event) => event.preventDefault(), { capture: true, once: true });
    fireEvent.input(control(), { cancelable: true, target: { value: 'edited' } });
    await flushMicrotasks();
    expect(changed).toHaveBeenCalledTimes(1);
    expect(validate).not.toHaveBeenCalled();
  });

  it('validates the final accepted value on controlled blur normalization', async () => {
    const validate = vi.fn((_value: unknown) => 'Invalid');
    await render(() => {
      const [value, setValue] = createSignal('');
      return <Field.Root validationMode="onBlur" validate={validate}><Field.Control value={value()} onValueChange={setValue} onBlur={() => setValue((v) => v.trim())} /><Field.Error /></Field.Root>;
    });
    await edit('foo ');
    await blur();
    expect(control()).toHaveValue('foo');
    expect(validate.mock.lastCall?.[0]).toBe('foo');
    expect(screen.getByText('Invalid')).toBeVisible();
  });

  it('keeps final async blur validation when the earlier candidate resolves last', async () => {
    const resolvers = new Map<string, (value: string | null) => void>();
    const validate = vi.fn((value: unknown) => new Promise<string | null>((resolve) => resolvers.set(String(value), resolve)));
    await render(() => {
      const [value, setValue] = createSignal('');
      return <Field.Root validationMode="onBlur" validate={validate}><Field.Control value={value()} onValueChange={setValue} onBlur={() => setValue((v) => v.trim())} /><Field.Error /></Field.Root>;
    });
    await edit('foo ');
    await blur();
    expect(validate).toHaveBeenCalledTimes(2);
    expect(validate.mock.lastCall?.[0]).toBe('foo');
    resolvers.get('foo')!('Final error');
    await flushMicrotasks();
    expect(screen.getByText('Final error')).toBeVisible();
    resolvers.get('foo ')!('Stale error');
    await flushMicrotasks();
    expect(screen.queryByText('Stale error')).toBeNull();
    expect(screen.getByText('Final error')).toBeVisible();
  });

  it('does not surface required noise after a controlled blur reset to baseline', async () => {
    await render(() => {
      const [value, setValue] = createSignal('');
      return <Field.Root validationMode="onBlur"><Field.Control required value={value()} onValueChange={setValue} onBlur={() => setValue('')} /><Field.Error match="valueMissing">Required</Field.Error></Field.Root>;
    });
    await edit('foo');
    await blur();
    expect(control()).toHaveValue('');
    expect(control()).not.toHaveAttribute('data-dirty');
    expect(screen.queryByText('Required')).toBeNull();
  });

  it('reports required when a prefilled uncontrolled value is cleared', async () => {
    await render(() => <Field.Root validationMode="onChange"><Field.Control defaultValue="value" required /><Field.Error match="valueMissing">Required</Field.Error></Field.Root>);
    expect(control()).toHaveAttribute('data-filled');
    await edit('');
    expect(control()).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Required')).toBeVisible();
  });

  for (const controlled of [false, true]) {
    it(`clears filled when an empty ${controlled ? 'controlled' : 'uncontrolled'} control replaces a prefilled control`, async () => {
      const view = await renderProps((p: { empty: boolean }) => <Field.Root data-testid="root">{p.empty ? <Field.Control value={controlled ? '' : undefined} /> : <Field.Control value={controlled ? 'filled' : undefined} defaultValue="filled" />}</Field.Root>, { empty: false });
      expect(screen.getByTestId('root')).toHaveAttribute('data-filled');
      await view.setProps({ empty: true });
      expect(screen.getByTestId('root')).not.toHaveAttribute('data-filled');
    });
  }

  for (const target of ['control', 'root', 'unmount'] as const) {
    it(`cleans focused ownership on ${target}`, async () => {
      const view = await renderProps((p: { disabled: boolean }) => <Field.Root data-testid="root" disabled={target === 'root' && p.disabled}><Field.Label>Label</Field.Label>{!(target === 'unmount' && p.disabled) && <Field.Control disabled={target === 'control' && p.disabled} />}</Field.Root>, { disabled: false });
      control().focus();
      await flushMicrotasks();
      expect(screen.getByTestId('root')).toHaveAttribute('data-focused');
      const node = control();
      expect(node).toHaveAttribute('data-focused');
      await view.setProps({ disabled: true });
      expect(screen.getByTestId('root')).not.toHaveAttribute('data-focused');
      if (target !== 'unmount') expect(node).not.toHaveAttribute('data-focused');
      expect(screen.getByText('Label')).not.toHaveAttribute('data-focused');
    });
  }

  it('reacquires focus after re-enable without a stale focused owner', async () => {
    const view = await renderProps((p: { disabled: boolean }) => <><Field.Root data-testid="root"><Field.Control disabled={p.disabled} /></Field.Root><button>Outside</button></>, { disabled: false });
    control().focus();
    await flushMicrotasks();
    await view.setProps({ disabled: true });
    expect(screen.getByTestId('root')).not.toHaveAttribute('data-focused');
    screen.getByText('Outside').focus();
    await view.setProps({ disabled: false });
    expect(screen.getByTestId('root')).not.toHaveAttribute('data-focused');
    control().focus();
    await flushMicrotasks();
    expect(screen.getByTestId('root')).toHaveAttribute('data-focused');
  });

  it('autofocus acquires shared focus state', async () => {
    await render(() => <Field.Root data-testid="root"><Field.Control autoFocus /><Field.Label>Label</Field.Label></Field.Root>);
    expect(control()).toHaveFocus();
    expect(screen.getByTestId('root')).toHaveAttribute('data-focused');
  });

  it('validates Enter outside a form', async () => {
    const validate = vi.fn((_value: unknown) => null);
    await render(() => <Field.Root validate={validate}><Field.Control defaultValue="a" /></Field.Root>);
    fireEvent.keyDown(control(), { key: 'Enter' });
    await flushMicrotasks();
    expect(validate).toHaveBeenCalledTimes(1);
    expect(validate.mock.lastCall?.[0]).toBe('a');
  });

  it('Enter fallback validates the latest value after ancestor normalization', async () => {
    const validate = vi.fn((_value: unknown) => null);
    await render(() => {
      const [value, setValue] = createSignal('a');
      return <Form onKeyDown={() => setValue('')}><Field.Root validate={validate}><Field.Control value={value()} /></Field.Root><input aria-label="other" /></Form>;
    });
    fireEvent.keyDown(screen.getByDisplayValue('a'), { key: 'Enter' });
    await waitFor(() => expect(validate).toHaveBeenCalledTimes(1));
    expect(validate.mock.lastCall?.[0]).toBe('');
  });

  for (const submission of ['implicit', 'multiple-inputs', 'disabled-submit'] as const) {
    browserCase({ source: 'packages/react/src/field/control/FieldControl.test.tsx', case: `Enter ${submission}`, environment: 'browser', issue: 'bsolid-browser' }, async () => {
      const validate = vi.fn(() => null);
      const submit = vi.fn((event: Event) => event.preventDefault());
      const view = await render(() => <Form onSubmit={submit}><Field.Root validate={validate}><Field.Control defaultValue="a" /></Field.Root>{submission === 'multiple-inputs' ? <input aria-label="other" /> : <button type="submit" disabled={submission === 'disabled-submit'}>submit</button>}</Form>);
      await view.user.click(screen.getByDisplayValue('a'));
      await view.user.keyboard('{Enter}');
      await waitFor(() => expect(validate).toHaveBeenCalledTimes(1));
      expect(submit).toHaveBeenCalledTimes(submission === 'implicit' ? 1 : 0);
    });
  }
});
