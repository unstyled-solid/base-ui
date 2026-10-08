import { describe, expect, it, vi } from 'vitest';
import { createSignal, flush, untrack } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { createRenderer, describeConformance, fireEvent, waitFor, browserCase } from '../../../test';
import type { ConformantComponentProps } from '../../../test/describeConformance';
import { Switch } from '../index';
import type { SwitchRootProps, SwitchRootState } from './SwitchRoot';
import { createField, type FieldOptions } from '../../internals/field-core';
import { FieldRootContext } from '../../internals/field-root-context';
import { FormContext, type FormContextValue } from '../../internals/form-context';

// Behavioral source: packages/react/src/switch/root/SwitchRoot.test.tsx @ 19511bb.
// Live props/native events replace rerender/React act. No foundation is mocked.
const { render, renderProps } = createRenderer();
const nativeButton: SwitchRootProps['render'] = (props) => {
  // Renderer-owned props already brand native events; specialize its generic host ref.
  return <button {...props as JSX.ButtonHTMLAttributes<HTMLButtonElement>} />;
};
function FieldFixture(props: FieldOptions & { children?: JSX.Element }) {
  const field = createField(props);
  return <FieldRootContext value={field}>{props.children}</FieldRootContext>;
}

describe('Switch.Root', () => {
  describeConformance<SwitchRootState, SwitchRootProps & ConformantComponentProps<SwitchRootState>>((props) => <Switch.Root {...props} />, {
    initialProps: { checked: false },
    refInstanceof: window.HTMLSpanElement,
    testRenderPropWith: 'span',
    button: true,
    state: {
      change: { checked: true },
      assert: (state, changed) => expect(untrack(() => state.checked)).toBe(changed),
      class: (state) => state.checked ? 'on' : 'off', before: 'off', after: 'on',
    },
  });

  it('defaults to a span and adjacent unchecked checkbox with no value attribute', async () => {
    const view = await render(() => <Switch.Root><Switch.Thumb data-testid="thumb" /></Switch.Root>);
    const root = view.getByRole('switch');
    const input = view.getByRole('checkbox', { hidden: true });
    expect(root.tagName).toBe('SPAN');
    expect(root.nextElementSibling).toBe(input);
    expect(root).toHaveAttribute('aria-checked', 'false');
    expect(root).toHaveAttribute('data-unchecked');
    expect(input).not.toHaveAttribute('value');
    expect(input).toHaveAttribute('tabindex', '-1');
    expect(input).toHaveAttribute('aria-hidden', 'true');
    expect(root).not.toHaveAttribute('aria-readonly');
    expect(root).not.toHaveAttribute('aria-required');
    expect(view.getByTestId('thumb')).toHaveAttribute('data-unchecked');
  });

  it('tolerates ref-time focus, blur and click before the input mounts', async () => {
    const changed = vi.fn();
    const view = await render(() => <Switch.Root onCheckedChange={changed} ref={(node) => {
      node?.focus(); node?.blur(); node?.click();
    }} />);
    expect(view.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
    expect(changed).not.toHaveBeenCalled();
  });

  it.each(['visible', 'hidden', 'wrapping label', 'linked label'] as const)('activates from %s exactly once', async (target) => {
    const changed = vi.fn();
    const view = await render(() => target === 'wrapping label'
      ? <label data-testid="label"><Switch.Root onCheckedChange={changed} />Toggle</label>
      : <><label for="switch-input" data-testid="label">Toggle</label><Switch.Root id="switch-input" onCheckedChange={changed} /></>);
    const root = view.getByRole('switch');
    const input = view.getByRole<HTMLInputElement>('checkbox', { hidden: true });
    const node = target === 'visible' ? root : target === 'hidden' ? input : view.getByTestId('label');
    expect(root).toHaveAttribute('aria-checked', 'false');
    await view.user.click(node);
    expect(root).toHaveAttribute('aria-checked', 'true');
    expect(input.checked).toBe(true);
    expect(changed).toHaveBeenCalledTimes(1);
    expect(changed.mock.calls[0]?.[0]).toBe(true);
    expect(changed.mock.calls[0]?.[1].reason).toBe('none');
  });

  it.each([false, true])('retains one ancestor click with modifiers (nativeButton=%s)', async (native) => {
    const ancestor = vi.fn();
    const changed = vi.fn();
    const view = await render(() => <div onClick={ancestor}><Switch.Root nativeButton={native}
      render={native ? nativeButton : undefined} onCheckedChange={changed} /></div>);
    fireEvent.click(view.getByRole('switch'), { ctrlKey: true, shiftKey: true, altKey: true, metaKey: true });
    flush();
    await Promise.resolve();
    expect(ancestor).toHaveBeenCalledTimes(1);
    expect(changed).toHaveBeenCalledTimes(1);
    expect(changed.mock.calls[0]?.[1].event).toMatchObject({ ctrlKey: true, shiftKey: true, altKey: true, metaKey: true });
    expect(view.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
  });

  it.each([false, true])('stopPropagation suppresses ancestors without blocking state (nativeButton=%s)', async (native) => {
    const ancestor = vi.fn();
    const view = await render(() => <div onClick={ancestor}><Switch.Root nativeButton={native}
      render={native ? nativeButton : undefined} onClick={(event) => event.stopPropagation()} /></div>);
    await view.user.click(view.getByRole('switch'));
    expect(ancestor).not.toHaveBeenCalled();
    expect(view.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
  });

  it.each(['Enter', 'Space'])('activates with %s on both host types', async (key) => {
    const view = await render(() => <><Switch.Root aria-label="span" /><Switch.Root aria-label="button" nativeButton render={nativeButton} /></>);
    for (const root of view.getAllByRole('switch')) {
      expect(root).toHaveAttribute('aria-checked', 'false');
      await view.user.tab();
      expect(root).toHaveFocus();
      await view.user.keyboard(`[${key}]`);
      expect(root).toHaveAttribute('aria-checked', 'true');
    }
  });

  it.each(['visible', 'hidden'])('cancellation restores native state from %s', async (target) => {
    const view = await render(() => <FieldFixture><Switch.Root onCheckedChange={(_, details) => details.cancel()} /></FieldFixture>);
    const root = view.getByRole('switch');
    const input = view.getByRole<HTMLInputElement>('checkbox', { hidden: true });
    await view.user.click(target === 'visible' ? root : input);
    expect(root).toHaveAttribute('aria-checked', 'false');
    expect(input.checked).toBe(false);
    expect(root).not.toHaveAttribute('data-dirty');
    expect(root).not.toHaveAttribute('data-filled');
  });

  it('ignores an already default-prevented hidden click', async () => {
    const changed = vi.fn();
    const view = await render(() => <Switch.Root onCheckedChange={changed} />);
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    event.preventDefault();
    fireEvent(view.getByRole('checkbox', { hidden: true }), event);
    flush();
    await Promise.resolve();
    expect(changed).not.toHaveBeenCalled();
    expect(view.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
  });

  it('details.cancel does not set native defaultPrevented or suppress the original ancestor click', async () => {
    let details: import('./SwitchRoot').SwitchRootChangeEventDetails | undefined;
    const ancestor = vi.fn();
    const view = await render(() => <div onClick={ancestor}><Switch.Root onCheckedChange={(_, next) => {
      details = next; next.cancel();
    }} /></div>);
    await view.user.click(view.getByRole('switch'));
    expect(details?.isCanceled).toBe(true);
    expect(details?.event.defaultPrevented).toBe(false);
    expect(ancestor).toHaveBeenCalledTimes(1);
    expect(view.getByRole<HTMLInputElement>('checkbox', { hidden: true }).checked).toBe(false);
  });

  it('handles native change events without a preceding click', async () => {
    const changed = vi.fn();
    const view = await render(() => <Switch.Root onCheckedChange={changed} />);
    const input = view.getByRole<HTMLInputElement>('checkbox', { hidden: true });
    input.checked = true;
    fireEvent.change(input);
    flush();
    await Promise.resolve();
    expect(view.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
    expect(changed).toHaveBeenCalledTimes(1);
  });

  it.each([false, true])('does not discard an independent same-turn change after a click (canceled=%s)', async (canceled) => {
    let cancel = canceled;
    const changed = vi.fn((_: boolean, details: import('./SwitchRoot').SwitchRootChangeEventDetails) => {
      if (cancel) details.cancel();
    });
    const view = await render(() => <Switch.Root onCheckedChange={changed} />);
    const input = view.getByRole<HTMLInputElement>('checkbox', { hidden: true });
    input.click();
    cancel = false;
    input.checked = canceled;
    fireEvent.change(input);
    flush();
    await Promise.resolve();
    expect(changed).toHaveBeenCalledTimes(2);
    expect(changed.mock.calls.map(([checked]) => checked)).toEqual([true, canceled]);
    expect(input.checked).toBe(canceled);
    expect(view.getByRole('switch')).toHaveAttribute('aria-checked', String(canceled));
  });

  it('carries native candidates through two same-turn activations without a staged getter', async () => {
    const changed = vi.fn();
    const view = await render(() => <Switch.Root onCheckedChange={changed} />);
    const input = view.getByRole<HTMLInputElement>('checkbox', { hidden: true });
    input.click();
    input.click();
    flush();
    await Promise.resolve();
    expect(changed.mock.calls.map(([checked]) => checked)).toEqual([true, false]);
    expect(input.checked).toBe(false);
    expect(view.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
  });

  it('keeps preventDefault separate from preventBaseUIHandler', async () => {
    const view = await renderProps((props: SwitchRootProps) => <Switch.Root {...props} />, {
      onClick: (event) => event.preventDefault(),
    });
    const root = view.getByRole('switch');
    await view.user.click(root);
    expect(root).toHaveAttribute('aria-checked', 'true');
    await view.setProps({ onClick: (event) => event.preventBaseUIHandler() });
    await view.user.click(root);
    expect(root).toHaveAttribute('aria-checked', 'true');
  });

  it('uses current callbacks and respects controlled refusal and external changes', async () => {
    const first = vi.fn();
    const next = vi.fn();
    const view = await renderProps((props: SwitchRootProps) => <Switch.Root {...props} />, { checked: false, onCheckedChange: first });
    const root = view.getByRole('switch');
    const input = view.getByRole<HTMLInputElement>('checkbox', { hidden: true });
    await view.user.click(root);
    expect(first).toHaveBeenCalledTimes(1);
    expect(root).toHaveAttribute('aria-checked', 'false');
    expect(input.checked).toBe(false);
    await view.setProps({ onCheckedChange: next });
    await view.user.click(root);
    expect(next).toHaveBeenCalledTimes(1);
    await view.setProps({ checked: true });
    expect(view.getByRole('switch')).toBe(root);
    expect(input.checked).toBe(true);
    expect(root).toHaveAttribute('aria-checked', 'true');
    await view.setProps({ checked: false });
    expect(root).toHaveAttribute('aria-checked', 'false');
    expect(input.checked).toBe(false);
  });

  it('accepts controlled proposals without an uncontrolled intermediate state', async () => {
    const view = await render(() => {
      const [checked, setChecked] = createSignal(false);
      return <Switch.Root checked={checked()} onCheckedChange={(value) => setChecked(value)} />;
    });
    await view.user.click(view.getByRole('switch'));
    expect(view.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
    expect(view.getByRole<HTMLInputElement>('checkbox', { hidden: true }).checked).toBe(true);
  });

  it.each(['disabled', 'readOnly'] as const)('%s blocks visible, hidden and label activation', async (prop) => {
    const changed = vi.fn();
    const view = await render(() => <label data-testid="label"><Switch.Root {...{ [prop]: true }} onCheckedChange={changed} /></label>);
    const root = view.getByRole('switch');
    for (const node of [root, view.getByRole('checkbox', { hidden: true }), view.getByTestId('label')]) {
      await view.user.click(node);
      expect(root).toHaveAttribute('aria-checked', 'false');
    }
    expect(changed).not.toHaveBeenCalled();
    if (prop === 'disabled') {
      expect(root).not.toHaveAttribute('disabled');
      expect(root).toHaveAttribute('aria-disabled', 'true');
    } else expect(root).toHaveAttribute('aria-readonly', 'true');
  });

  it('keeps all state hooks and state callbacks live on a stable root and thumb', async () => {
    let live!: Readonly<SwitchRootState>;
    const view = await renderProps((props: SwitchRootProps) => <Switch.Root {...props}
      class={(state) => ({ active: state.checked })}
      render={(host, state) => { live = state; return <span {...host as JSX.HTMLAttributes<HTMLSpanElement>} />; }}>
      <Switch.Thumb data-testid="thumb" class={(state) => state.checked ? 'on' : 'off'} />
    </Switch.Root>, { defaultChecked: true, disabled: true, required: true, readOnly: true });
    const root = view.getByRole('switch');
    const thumb = view.getByTestId('thumb');
    for (const node of [root, thumb]) for (const attr of ['checked', 'disabled', 'required', 'readonly']) expect(node).toHaveAttribute(`data-${attr}`);
    expect(root).toHaveAttribute('aria-required', 'true');
    await view.setProps({ disabled: false, readOnly: false });
    await view.user.click(root);
    expect(view.getByRole('switch')).toBe(root);
    expect(view.getByTestId('thumb')).toBe(thumb);
    expect(untrack(() => live.checked)).toBe(false);
    expect(root).not.toHaveClass('active');
    expect(thumb).toHaveClass('off');
    for (const node of [root, thumb]) {
      expect(node).toHaveAttribute('data-unchecked');
      expect(node).not.toHaveAttribute('data-checked');
    }
  });

  it('only puts name and value on the input and supports ref replacement/disposal', async () => {
    const first = vi.fn();
    const second = vi.fn();
    const view = await renderProps((props: SwitchRootProps) => <Switch.Root {...props} />, { name: 'setting', value: 'yes', inputRef: first });
    const root = view.getByRole('switch');
    const input = view.getByRole('checkbox', { hidden: true });
    expect(root).not.toHaveAttribute('name');
    expect(root).not.toHaveAttribute('value');
    expect(input).toHaveAttribute('name', 'setting');
    expect(input).toHaveAttribute('value', 'yes');
    expect(first).toHaveBeenCalledWith(input);
    await view.setProps({ inputRef: second, value: undefined });
    expect(first).toHaveBeenLastCalledWith(null);
    expect(second).toHaveBeenLastCalledWith(input);
    expect(input).not.toHaveAttribute('value');
    expect((input as HTMLInputElement).value).toBe('on');
    view.unmount();
    expect(second).toHaveBeenLastCalledWith(null);
  });

  it('projects live value/name/form/uncheckedValue changes onto the same native input', async () => {
    const view = await renderProps<SwitchRootProps>((props) => <>
      <form id="first" /><form id="second" /><Switch.Root {...props} />
    </>, { form: 'first', name: 'setting', value: 'yes', uncheckedValue: 'no' });
    const input = view.getByRole<HTMLInputElement>('checkbox', { hidden: true });
    const first = view.container.querySelector<HTMLFormElement>('#first')!;
    const second = view.container.querySelector<HTMLFormElement>('#second')!;
    expect(new FormData(first).getAll('setting')).toEqual(['no']);
    await view.setProps({ form: 'second', name: 'updated', uncheckedValue: '' });
    expect(new FormData(first).getAll('setting')).toEqual([]);
    expect(new FormData(second).getAll('updated')).toEqual(['']);
    await view.user.click(view.getByRole('switch'));
    expect(new FormData(second).getAll('updated')).toEqual(['yes']);
    await view.setProps({ value: undefined });
    expect(view.getByRole('checkbox', { hidden: true })).toBe(input);
    expect(input).not.toHaveAttribute('value');
    expect(new FormData(second).getAll('updated')).toEqual(['on']);
    await view.setProps({ value: '' });
    expect(new FormData(second).getAll('updated')).toEqual(['']);
    await view.setProps({ disabled: true });
    expect(new FormData(second).getAll('updated')).toEqual([]);
    await view.setProps({ disabled: false, value: 'latest' });
    expect(new FormData(second).getAll('updated')).toEqual(['latest']);
    second.reset();
    await Promise.resolve();
    expect(input.checked).toBe(true);
    expect(new FormData(second).getAll('updated')).toEqual(['latest']);
  });

  it('orders root, checked-change and ancestor callbacks using the bridged native event', async () => {
    const calls: string[] = [];
    let root!: HTMLElement;
    let input!: HTMLInputElement;
    const view = await render(() => <div onClick={(event) => {
      expect(event.target).toBe(root); calls.push('ancestor');
    }}><Switch.Root onClick={(event) => {
      expect(event.currentTarget).toBe(root); calls.push('root');
    }} onCheckedChange={(checked, details) => {
      expect(checked).toBe(true);
      expect(details.event).toBeInstanceOf(MouseEvent);
      expect(details.event.target).toBe(input);
      expect(details.event.currentTarget).toBe(input);
      calls.push('change');
    }} /></div>);
    root = view.getByRole('switch');
    input = view.getByRole('checkbox', { hidden: true });
    await view.user.click(root);
    expect(calls).toEqual(['root', 'change', 'ancestor']);
  });

  it.each([false, true])('keeps canceled/readOnly hidden activation native state consistent (initial checked=%s)', async (checked) => {
    const changed = vi.fn((_: boolean, details: import('./SwitchRoot').SwitchRootChangeEventDetails) => details.cancel());
    const view = await renderProps<SwitchRootProps>((props) => <Switch.Root {...props} />, { defaultChecked: checked, onCheckedChange: changed });
    const input = view.getByRole<HTMLInputElement>('checkbox', { hidden: true });
    await view.user.click(input);
    expect(input.checked).toBe(checked);
    expect(changed).toHaveBeenCalledTimes(1);
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    event.preventDefault();
    fireEvent(input, event);
    await Promise.resolve();
    expect(input.checked).toBe(checked);
    expect(changed).toHaveBeenCalledTimes(1);
    await view.setProps({ readOnly: true });
    await view.user.click(input);
    expect(input.checked).toBe(checked);
    expect(changed).toHaveBeenCalledTimes(1);
  });

  it('overrides built-in role and forwards styles and attributes', async () => {
    const view = await render(() => <Switch.Root role="checkbox" data-testid="root" title="custom" style={{ color: 'red' }} />);
    expect(view.getByTestId('root')).toHaveAttribute('role', 'checkbox');
    expect(view.getByTestId('root')).toHaveAttribute('title', 'custom');
    expect(view.getByTestId('root').style.color).toBe('red');
  });

  it('updates native label fallback when id or label association changes and honors aria-label', async () => {
    const view = await renderProps<SwitchRootProps>((props) => <>
      <label for="a">Label A</label><label for="b">Label B</label><Switch.Root {...props} />
    </>, { id: 'a' });
    const root = view.getByRole('switch');
    expect(root).toHaveAccessibleName('Label A');
    expect(view.getByText('Label A').id).not.toBe('');
    const labelA = view.getByText('Label A');
    expect(root).toHaveAttribute('aria-labelledby', labelA.id);
    await view.setProps({ id: 'b' });
    await waitFor(() => expect(root).toHaveAccessibleName('Label B'));
    const labelB = view.getByText('Label B');
    expect(labelB.id).not.toBe('');
    expect(labelB.id).not.toBe(labelA.id);
    expect(root).toHaveAttribute('aria-labelledby', labelB.id);
    view.getByText('Label B').remove();
    const label = document.createElement('label');
    label.htmlFor = 'b'; label.textContent = 'Replacement';
    view.container.append(label);
    await waitFor(() => expect(root).toHaveAccessibleName('Replacement'));
    await view.setProps({ 'aria-label': 'Explicit' });
    expect(root).not.toHaveAttribute('aria-labelledby');
    expect(root).toHaveAccessibleName('Explicit');
  });

  it('applies control ID to a native button and retains native label activation', async () => {
    const view = await render(() => <><label for="native">Native</label><Switch.Root id="native" nativeButton render={nativeButton} /></>);
    const root = view.getByRole('switch');
    expect(root).toHaveAttribute('id', 'native');
    expect(view.getByRole('checkbox', { hidden: true })).not.toHaveAttribute('id');
    await view.user.click(view.getByText('Native'));
    expect(root).toHaveAttribute('aria-checked', 'true');
  });

  it.each([
    { value: undefined, uncheckedValue: undefined, off: null, on: 'on' },
    { value: undefined, uncheckedValue: 'off', off: 'off', on: 'on' },
    { value: 'yes', uncheckedValue: 'no', off: 'no', on: 'yes' },
    { value: '', uncheckedValue: '', off: '', on: '' },
  ])('matches native FormData through off/on/off: %j', async ({ value, uncheckedValue, off, on }) => {
    const view = await render(() => <><form id="external" /><Switch.Root form="external" name="setting" value={value} uncheckedValue={uncheckedValue} /></>);
    const form = view.container.querySelector('form')!;
    const data = () => new FormData(form).getAll('setting');
    expect(data()).toEqual(off === null ? [] : [off]);
    await view.user.click(view.getByRole('switch'));
    expect(data()).toEqual([on]);
    await view.user.click(view.getByRole('switch'));
    expect(data()).toEqual(off === null ? [] : [off]);
  });

  it('excludes disabled values and preserves managed checkedness across reset', async () => {
    const changed = vi.fn();
    const view = await renderProps((props: SwitchRootProps) => <form><Switch.Root name="setting" uncheckedValue="off" {...props} /></form>, { disabled: true, onCheckedChange: changed });
    const form = view.container.querySelector('form')!;
    expect(new FormData(form).get('setting')).toBe(null);
    await view.setProps({ disabled: false });
    await view.user.click(view.getByRole('switch'));
    form.reset();
    await Promise.resolve();
    expect(view.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
    expect(view.getByRole<HTMLInputElement>('checkbox', { hidden: true }).checked).toBe(true);
    expect(new FormData(form).get('setting')).toBe('on');
    expect(changed).toHaveBeenCalledTimes(1);
  });

  describe('real field-core integration', () => {
    it('inherits field name/disabled and releases focus without blur', async () => {
      const view = await renderProps((props: { disabled: boolean; mounted: boolean }) => <FieldFixture name="field" disabled={props.disabled}>
        {props.mounted && <Switch.Root name="own" />}
      </FieldFixture>, { disabled: false, mounted: true });
      const root = view.getByRole('switch');
      expect(view.getByRole('checkbox', { hidden: true })).toHaveAttribute('name', 'field');
      root.focus(); flush();
      expect(root).toHaveAttribute('data-focused');
      await view.setProps({ disabled: true });
      expect(root).not.toHaveAttribute('data-focused');
      expect(root).toHaveAttribute('data-disabled');
      await view.setProps({ mounted: false });
      expect(root.isConnected).toBe(false);
    });

    it('tracks touched, dirty and filled and validates exactly once per accepted change', async () => {
      const validate = vi.fn((_value: unknown) => null);
      const view = await render(() => <FieldFixture validationMode="onChange" validate={validate}><Switch.Root /></FieldFixture>);
      const root = view.getByRole('switch');
      expect(root).not.toHaveAttribute('data-filled');
      await view.user.click(root);
      expect(root).toHaveAttribute('data-filled');
      expect(root).toHaveAttribute('data-dirty');
      expect(validate).toHaveBeenCalledTimes(1);
      expect(validate.mock.calls[0]?.[0]).toBe(true);
      root.blur(); flush();
      expect(root).toHaveAttribute('data-touched');
      expect(root).not.toHaveAttribute('data-focused');
      await view.user.click(root);
      expect(root).not.toHaveAttribute('data-filled');
      expect(root).not.toHaveAttribute('data-dirty');
      expect(validate).toHaveBeenCalledTimes(2);
    });

    it.each(['onChange', 'onBlur'] as const)('validates using %s', async (mode) => {
      const validate = vi.fn((value: unknown) => value ? 'error' : null);
      const view = await render(() => <FieldFixture validationMode={mode} validate={validate}><Switch.Root /></FieldFixture>);
      const root = view.getByRole('switch');
      await view.user.click(root);
      if (mode === 'onBlur') {
        expect(root).not.toHaveAttribute('aria-invalid');
        root.blur(); flush();
      }
      await waitFor(() => expect(root).toHaveAttribute('aria-invalid', 'true'));
      expect(validate).toHaveBeenCalledTimes(1);
    });

    it('validates external controlled transitions and clears errors only on committed changes', async () => {
      const validate = vi.fn((value: unknown) => value ? 'error' : null);
      const clearErrors = vi.fn();
      const form: FormContextValue = { errors: { setting: 'external' }, clearErrors, fields: new Map(), elementRef: () => null, validationMode: 'onSubmit', submitCount: 0 };
      const view = await renderProps((props: SwitchRootProps) => <FormContext value={form}>
        <FieldFixture name="setting" validationMode="onChange" validate={validate}><Switch.Root {...props} /></FieldFixture>
      </FormContext>, { checked: false });
      expect(clearErrors).not.toHaveBeenCalled();
      await view.user.click(view.getByRole('switch'));
      expect(clearErrors).not.toHaveBeenCalled();
      await view.setProps({ checked: true });
      expect(clearErrors).toHaveBeenCalledExactlyOnceWith('setting');
      expect(validate).toHaveBeenCalledTimes(1);
      expect(validate.mock.calls[0]?.[0]).toBe(true);
    });
  });

  browserCase({ source: 'packages/react/src/switch/root/SwitchRoot.test.tsx',
    case: 'native required validation, successful submission and managed reset', environment: 'browser', issue: 'bsolid-browser' }, async () => {
    const submit = vi.fn((event: SubmitEvent) => event.preventDefault());
    const view = await render(() => <form onSubmit={submit}><Switch.Root required name="setting" />
      <button type="submit">Submit</button><button type="reset">Reset</button></form>);
    await view.user.click(view.getByText('Submit'));
    expect(submit).not.toHaveBeenCalled();
    await view.user.click(view.getByRole('switch'));
    await view.user.click(view.getByText('Submit'));
    expect(submit).toHaveBeenCalledTimes(1);
    await view.user.click(view.getByText('Reset'));
    expect(view.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
    expect(new FormData(view.container.querySelector('form')!).get('setting')).toBe('on');
  });
});
