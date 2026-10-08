import { describe, expect, it, vi } from 'vitest';
import { untrack } from 'solid-js';
import type { ComponentProps } from '@solidjs/web';
import { browserCase, createRenderer, describeConformance, fireEvent, flushMicrotasks } from '../../test';
import type { ConformantComponentProps } from '../../test/describeConformance';
import { Input, InputDataAttributes, type InputProps, type InputState } from './index';
import { Field } from '../field';

// Upstream Input.test.tsx at 19511bb171f3b360b006c94cf6d07e53cb446505:
// describeConformance(<Input />) -> native factory/live-props conformance below.
// FieldControl engine scenarios remain owned by Field; these exercise the facade seam.
describe('<Input />', () => {
  const { render, renderProps } = createRenderer();

  // The harness uses native event/render types and a narrower style/ref surface;
  // the component decorates those same native events through the shared engine.
  describeConformance<InputState, ConformantComponentProps<InputState> & { disabled?: boolean }>(
    (props) => <Input {...props as InputProps} />, {
    initialProps: {},
    refInstanceof: HTMLInputElement,
    state: {
      change: { disabled: true },
      assert: (state, changed) => expect(untrack(() => state.disabled)).toBe(changed),
      class: (state) => state.disabled ? 'disabled' : 'enabled',
      before: 'enabled',
      after: 'disabled',
    },
  });

  it('exports the exact source data-attribute namespace', () => {
    expect({ ...InputDataAttributes }).toEqual({
      disabled: 'data-disabled', valid: 'data-valid', invalid: 'data-invalid',
      touched: 'data-touched', dirty: 'data-dirty', filled: 'data-filled', focused: 'data-focused',
    });
  });

  it('keeps uncontrolled edits when native props and defaultValue change', async () => {
    const view = await renderProps<InputProps>((props) => <Input {...props} />, {
      defaultValue: 'initial', name: 'first', placeholder: 'before',
    });
    const input = view.getByRole('textbox') as HTMLInputElement;
    expect(input.type).toBe('text');
    expect(input.value).toBe('initial');
    await view.user.type(input, '-edited');
    await view.setProps({ defaultValue: 'replacement', name: 'second', placeholder: 'after', disabled: true });
    expect(view.getByRole('textbox')).toBe(input);
    expect(input.value).toBe('initial-edited');
    expect(input).toHaveAttribute('name', 'second');
    expect(input).toHaveAttribute('placeholder', 'after');
    expect(input).toBeDisabled();
    expect(input).toHaveAttribute(InputDataAttributes.disabled);
  });

  it('forwards controlled updates and the current per-keystroke value callback', async () => {
    const first = vi.fn();
    const second = vi.fn();
    const view = await renderProps<InputProps>((props) => <Input {...props} />, {
      value: 'a', onValueChange: first,
    });
    const input = view.getByRole('textbox');
    fireEvent.input(input, { target: { value: 'ab' } });
    expect(first).toHaveBeenCalledWith('ab', expect.objectContaining({ reason: 'none', event: expect.any(Event) }));
    await view.setProps({ value: 'c', onValueChange: second });
    expect(view.getByRole('textbox')).toBe(input);
    expect(input).toHaveValue('c');
    fireEvent.input(input, { target: { value: 'cd' } });
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledWith('cd', expect.objectContaining({ reason: 'none' }));
  });

  it('inherits Field label, error and name associations', async () => {
    const view = await render(() => (
      <Field.Root name="email" invalid>
        <Field.Label>Email</Field.Label>
        <Input name="ignored" />
        <Field.Error match>Invalid email</Field.Error>
      </Field.Root>
    ));
    const input = view.getByRole('textbox', { name: 'Email' });
    const error = view.getByText('Invalid email');
    expect(input).toHaveAttribute('name', 'email');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input.getAttribute('aria-describedby')?.split(/\s+/)).toContain(error.id);
  });

  it('inherits reactive Field disabled state', async () => {
    const view = await renderProps((props: { disabled: boolean }) => (
      <Field.Root disabled={props.disabled}><Input /></Field.Root>
    ), { disabled: false });
    const input = view.getByRole('textbox');
    expect(input).not.toBeDisabled();
    await view.setProps({ disabled: true });
    expect(view.getByRole('textbox')).toBe(input);
    expect(input).toBeDisabled();
    expect(input).toHaveAttribute(InputDataAttributes.disabled);
  });

  it('preserves independent native handler prevention and change cancellation', async () => {
    const changed = vi.fn((_value: string, details: Input.ChangeEventDetails) => {
      details.cancel();
      expect(details.isCanceled).toBe(true);
      expect(details.event.defaultPrevented).toBe(false);
    });
    const view = await renderProps<InputProps>((props) => <Input {...props} />, {
      onValueChange: changed,
      onInput: (event) => event.preventBaseUIHandler(),
    });
    const input = view.getByRole('textbox');
    fireEvent.input(input, { target: { value: 'blocked' }, cancelable: true });
    expect(changed).not.toHaveBeenCalled();
    await view.setProps({ onInput: undefined });
    fireEvent.input(input, { target: { value: 'canceled' }, cancelable: true });
    expect(changed).toHaveBeenCalledTimes(1);
  });

  it('forwards replacement render callbacks and refs to the new target', async () => {
    const firstRef = vi.fn();
    const secondRef = vi.fn();
    const view = await renderProps<InputProps>((props) => <Input {...props} />, {
      ref: firstRef,
      render: (props) => <input {...props} data-testid="first" />,
    });
    const first = view.getByTestId('first');
    expect(firstRef).toHaveBeenCalledWith(first);
    await view.setProps({ ref: secondRef, render: (props) => <textarea {...props as ComponentProps<'textarea'>} data-testid="second" /> });
    const second = view.getByTestId('second');
    expect(first.isConnected).toBe(false);
    expect(second).toBeInstanceOf(HTMLTextAreaElement);
    expect(secondRef).toHaveBeenCalledWith(second);
  });

  it('replaces refs on the existing native node without replaying the old attachment', async () => {
    const firstRef = vi.fn();
    const secondRef = vi.fn();
    const thirdRef = vi.fn();
    const view = await renderProps<InputProps>((props) => <Input {...props} />, { ref: firstRef });
    const input = view.getByRole('textbox');
    await view.setProps({ ref: [secondRef, thirdRef] });
    expect(view.getByRole('textbox')).toBe(input);
    expect(firstRef.mock.calls.filter(([node]) => node === input)).toHaveLength(1);
    expect(secondRef).toHaveBeenCalledWith(input);
    expect(thirdRef).toHaveBeenCalledWith(input);
    await view.setProps({ ref: undefined, placeholder: 'updated' });
    expect(secondRef.mock.calls.filter(([node]) => node === input)).toHaveLength(1);
    expect(thirdRef.mock.calls.filter(([node]) => node === input)).toHaveLength(1);
    view.unmount();
    expect(input.isConnected).toBe(false);
  });

  it('keeps getter receivers and current callback access through the facade', async () => {
    const first = vi.fn();
    const second = vi.fn();
    const initial = {
      text: 'first', callback: first,
      get value() { expect(this).toBe(initial); return this.text; },
      get name() { expect(this).toBe(initial); return `${this.text}-name`; },
      get onValueChange() { expect(this).toBe(initial); return this.callback; },
    };
    const view = await renderProps<InputProps>((props) => <Input {...props} />, initial);
    const input = view.getByRole('textbox');
    expect(input).toHaveValue('first');
    expect(input).toHaveAttribute('name', 'first-name');
    fireEvent.input(input, { target: { value: 'edited' } });
    expect(first).toHaveBeenCalledTimes(1);
    const next = {
      text: 'second', callback: second,
      get value() { expect(this).toBe(next); return this.text; },
      get name() { expect(this).toBe(next); return `${this.text}-name`; },
      get onValueChange() { expect(this).toBe(next); return this.callback; },
    };
    await view.setProps(next);
    expect(view.getByRole('textbox')).toBe(input);
    expect(input).toHaveValue('second');
    expect(input).toHaveAttribute('name', 'second-name');
    fireEvent.input(input, { target: { value: 'next edit' } });
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledWith('next edit', expect.objectContaining({ reason: 'none' }));
  });

  it('preserves native input callback order and distinguishes preventDefault from Base UI prevention', async () => {
    const calls: string[] = [];
    const view = await renderProps<InputProps>((props) => <Input {...props} />, {
      onInput: (event) => { calls.push('input'); event.preventDefault(); },
      onValueChange: (_value, details) => {
        calls.push('value');
        expect(details.event.defaultPrevented).toBe(true);
        expect(details.isCanceled).toBe(false);
      },
    });
    const input = view.getByRole('textbox');
    fireEvent.input(input, { cancelable: true, target: { value: 'native-prevented' } });
    expect(calls).toEqual(['input', 'value']);
    calls.length = 0;
    await view.setProps({ onInput: (event) => { calls.push('replacement'); event.preventBaseUIHandler(); } });
    fireEvent.input(input, { cancelable: true, target: { value: 'base-ui-prevented' } });
    expect(calls).toEqual(['replacement']);
  });

  for (const customized of [false, true]) {
    it(`projects live native form props and Field name/disabled (${customized ? 'render callback' : 'default host'})`, async () => {
      const view = await renderProps((props: { name: string; disabled: boolean; required: boolean; readonly: boolean; value: number }) => (
        <><form id="input-form" data-testid="form" />
          <Field.Root name={props.name} disabled={props.disabled}>
            <Input form="input-form" name="ignored" type="number" value={props.value}
              required={props.required} readonly={props.readonly} min="0" max="10" step="2"
              render={customized ? (nativeProps) => <input {...nativeProps} /> : undefined} />
          </Field.Root></>
      ), { name: 'amount', disabled: false, required: true, readonly: true, value: 4 });
      const input = view.getByRole('spinbutton') as HTMLInputElement;
      const form = view.getByTestId('form') as HTMLFormElement;
      expect(input.form).toBe(form);
      expect(input.required).toBe(true);
      expect(input.readOnly).toBe(true);
      expect([input.min, input.max, input.step]).toEqual(['0', '10', '2']);
      expect([...new FormData(form)]).toEqual([['amount', '4']]);
      await view.setProps({ name: 'renamed', value: 8, required: false, readonly: false });
      expect(view.getByRole('spinbutton')).toBe(input);
      expect(input.required).toBe(false);
      expect(input.readOnly).toBe(false);
      expect([...new FormData(form)]).toEqual([['renamed', '8']]);
      await view.setProps({ disabled: true });
      expect(input).toBeDisabled();
      expect([...new FormData(form)]).toEqual([]);
      await view.setProps({ disabled: false });
      expect([...new FormData(form)]).toEqual([['renamed', '8']]);
    });
  }

  it('retains the registered Field label ID while updating control, description and error IDs on the same input', async () => {
    const view = await renderProps((props: { id: string; labelId: string; descriptionId: string; errorId: string; labelMounted: boolean }) => (
      <Field.Root invalid>
        {props.labelMounted && <Field.Label id={props.labelId}>Email</Field.Label>}
        <Field.Description id={props.descriptionId}>Help</Field.Description>
        <Input id={props.id} aria-describedby="consumer-description" />
        <Field.Error match id={props.errorId}>Invalid email</Field.Error>
      </Field.Root>
    ), { id: 'first-input', labelId: 'first-label', descriptionId: 'first-help', errorId: 'first-error', labelMounted: true });
    const input = view.getByRole('textbox', { name: 'Email' });
    const label = view.getByText('Email');
    expect(label).toHaveAttribute('for', 'first-input');
    expect(input).toHaveAttribute('aria-labelledby', 'first-label');
    expect(input.getAttribute('aria-describedby')?.split(/\s+/).sort()).toEqual(['consumer-description', 'first-error', 'first-help']);
    await view.setProps({ id: 'second-input', labelId: 'second-label', descriptionId: 'second-help', errorId: 'second-error' });
    await flushMicrotasks();
    expect(view.getByRole('textbox', { name: 'Email' })).toBe(input);
    expect(label).toHaveAttribute('for', 'second-input');
    // Pinned FieldLabel.tsx:43-45 resolves labelId ?? idProp. Once registered,
    // the scope's label ID takes precedence over a replacement id candidate.
    expect(label).toHaveAttribute('id', 'first-label');
    expect(input).toHaveAttribute('aria-labelledby', label.id);
    expect(input.getAttribute('aria-describedby')?.split(/\s+/).sort()).toEqual(['consumer-description', 'second-error', 'second-help']);
    await view.setProps({ labelMounted: false });
    expect(view.getByRole('textbox')).toBe(input);
    expect(label.isConnected).toBe(false);
    expect(input).not.toHaveAttribute('aria-labelledby');
    await view.setProps({ labelMounted: true });
    const replacementLabel = view.getByText('Email');
    expect(replacementLabel).not.toBe(label);
    expect(replacementLabel).toHaveAttribute('id', 'second-label');
    expect(replacementLabel).toHaveAttribute('for', 'second-input');
    expect(view.getByRole('textbox', { name: 'Email' })).toBe(input);
    expect(input).toHaveAttribute('aria-labelledby', replacementLabel.id);
  });

  browserCase({
    source: 'packages/react/src/input/Input.test.tsx',
    case: 'facade live composition preserves focus and selection',
    environment: 'browser', issue: 'bsolid-browser',
  }, async () => {
    const view = await renderProps<InputProps>((props) => <Input {...props} />, {
      defaultValue: 'selection', render: (props) => <input {...props} />,
    });
    const input = view.getByRole('textbox') as HTMLInputElement;
    input.focus();
    input.setSelectionRange(2, 5);
    await view.setProps({ class: 'updated', style: { color: 'red' }, name: 'updated' });
    expect(view.getByRole('textbox')).toBe(input);
    expect(input).toHaveFocus();
    expect(input.selectionStart).toBe(2);
    expect(input.selectionEnd).toBe(5);
  });
});
