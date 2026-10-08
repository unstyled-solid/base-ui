import { createSignal, flush, untrack } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { describe, expect, it, vi } from 'vitest';
import { createRenderer, describeConformance, fireEvent, browserCase, waitFor } from '../../../test';
import type { ConformantComponentProps } from '../../../test/describeConformance';
import type { HTMLProps } from '../../internals/types';
import { CheckboxRoot, type CheckboxRootProps, type CheckboxRootState } from './CheckboxRoot';
import { CheckboxIndicator } from '../indicator/CheckboxIndicator';
import { CheckboxGroup } from '../../checkbox-group/CheckboxGroup';

// The host is explicitly narrowed to a button; the shared render contract accepts any HTMLElement.
const NativeButton = (props: HTMLProps) => <button {...(props as JSX.ButtonHTMLAttributes<HTMLButtonElement>)} />;

// Source: packages/react/src/checkbox/root/CheckboxRoot.test.tsx @ 19511bb171f3b360b006c94cf6d07e53cb446505.
// Native events and live props replace synthetic events/rerender. React17 fallback is inapplicable;
// ID replacement and remount outcomes are retained below; hydration replay belongs to bsolid-hydration.
describe('CheckboxRoot', () => {
  const { render, renderProps } = createRenderer();
  describeConformance<CheckboxRootState, ConformantComponentProps<CheckboxRootState> & { checked?: boolean }>((props) => <CheckboxRoot {...(props as CheckboxRootProps)} />, {
    initialProps: { checked: false }, refInstanceof: HTMLSpanElement, button: true, testRenderPropWith: 'span',
    state: {
      change: { checked: true }, before: 'unchecked', after: 'checked',
      class: (state) => state.checked ? 'checked' : 'unchecked',
      assert: (state, changed) => expect(untrack(() => state.checked)).toBe(changed),
    },
  });
  it('renders a span with an adjacent hidden native checkbox and live ARIA', async () => {
    const view = await renderProps((props: CheckboxRootProps) => <CheckboxRoot {...props} />, {});
    const root = view.getByRole('checkbox');
    const input = view.container.querySelector('input')!;
    expect(root).not.toHaveAttribute('aria-readonly');
    expect(root).not.toHaveAttribute('aria-required');
    expect(root.tagName).toBe('SPAN');
    expect(root.nextElementSibling).toBe(input);
    expect(input.type).toBe('checkbox');
    expect(input).toHaveAttribute('aria-hidden', 'true');
    expect(input.tabIndex).toBe(-1);
    expect(root).toHaveAttribute('aria-checked', 'false');
    await view.setProps({ required: true, readOnly: true });
    expect(root).toHaveAttribute('aria-required', 'true');
    expect(root).toHaveAttribute('aria-readonly', 'true');
    expect(input.required).toBe(true);
  });
  it('allows a role override and puts name/form/value only on the input', async () => {
    const view = await render(() => <CheckboxRoot role="switch" name="terms" form="f" value="yes" />);
    const root = view.getByRole('switch');
    const input = view.container.querySelector('input')!;
    for (const attribute of ['name', 'form', 'value']) expect(root).not.toHaveAttribute(attribute);
    expect(input).toHaveAttribute('name', 'terms');
    expect(input).toHaveAttribute('form', 'f');
    expect(input.value).toBe('yes');
  });
  it.each([false, true])('toggles and emits one bubbling click (nativeButton=%s)', async (nativeButton) => {
    const ancestor = vi.fn();
    const changed = vi.fn();
    const view = await render(() => <div onClick={ancestor}>
      <CheckboxRoot nativeButton={nativeButton} render={nativeButton ? NativeButton : undefined} onCheckedChange={changed} />
    </div>);
    const root = view.getByRole('checkbox');
    const input = view.container.querySelector('input')!;
    for (const expected of [true, false]) {
      await view.user.click(root);
      expect(input.checked).toBe(expected);
      expect(root).toHaveAttribute('aria-checked', String(expected));
    }
    expect(ancestor).toHaveBeenCalledTimes(2);
    expect(changed).toHaveBeenCalledTimes(2);
    expect(changed.mock.calls[0][1].reason).toBe('none');
    expect(changed.mock.calls[0][1].event).toBeInstanceOf(Event);
  });
  it.each([false, true])('stopPropagation stops ancestors without stopping selection (nativeButton=%s)', async (nativeButton) => {
    const ancestor = vi.fn();
    const view = await render(() => <div onClick={ancestor}>
      <CheckboxRoot nativeButton={nativeButton} render={nativeButton ? NativeButton : undefined}
        onClick={(event) => event.stopPropagation()} />
    </div>);
    await view.user.click(view.getByRole('checkbox'));
    expect(ancestor).not.toHaveBeenCalled();
    expect(view.getByRole('checkbox')).toHaveAttribute('aria-checked', 'true');
  });
  it('preventBaseUIHandler suppresses activation independently of native prevention', async () => {
    const view = await render(() => <CheckboxRoot onClick={(event) => event.preventBaseUIHandler()} />);
    await view.user.click(view.getByRole('checkbox'));
    expect(view.getByRole('checkbox')).toHaveAttribute('aria-checked', 'false');
  });
  it('tolerates imperative focus/blur/click before the input mounts', async () => {
    const view = await render(() => <CheckboxRoot ref={(node) => { node?.focus(); node?.blur(); node?.click(); }} />);
    expect(view.getByRole('checkbox')).toHaveAttribute('aria-checked', 'false');
  });
  it('rolls back both native and exposed state on a canceled checked change', async () => {
    const changed = vi.fn<NonNullable<CheckboxRootProps['onCheckedChange']>>((_, details) => details.cancel());
    const view = await render(() => <CheckboxRoot onCheckedChange={changed} indeterminate />);
    const root = view.getByRole('checkbox');
    const input = view.container.querySelector('input')!;
    await view.user.click(root);
    expect(changed).toHaveBeenCalledTimes(1);
    expect(input.checked).toBe(false);
    expect(input.indeterminate).toBe(true);
    expect(root).toHaveAttribute('aria-checked', 'mixed');
  });
  it('keeps controlled state authoritative without acknowledgement', async () => {
    const changed = vi.fn();
    const view = await render(() => <CheckboxRoot checked={false} onCheckedChange={changed} />);
    await view.user.click(view.getByRole('checkbox'));
    expect(changed.mock.calls[0][0]).toBe(true);
    expect(view.container.querySelector('input')!.checked).toBe(false);
    expect(view.getByRole('checkbox')).toHaveAttribute('aria-checked', 'false');
  });
  it('uses the current callback and preserves host identity on external updates', async () => {
    const old = vi.fn(); const current = vi.fn();
    const view = await renderProps((props: CheckboxRootProps) => <CheckboxRoot {...props} />, { checked: false, onCheckedChange: old });
    const root = view.getByRole('checkbox');
    await view.setProps({ checked: true, onCheckedChange: current });
    expect(view.getByRole('checkbox')).toBe(root);
    expect(root).toHaveAttribute('aria-checked', 'true');
    await view.user.click(root);
    expect(old).not.toHaveBeenCalled();
    expect(current.mock.calls[0][0]).toBe(false);
  });
  it('preserves click modifiers in checked-change details', async () => {
    const changed = vi.fn();
    const view = await render(() => <CheckboxRoot onCheckedChange={changed} />);
    fireEvent.click(view.getByRole('checkbox'), { shiftKey: true, ctrlKey: true, altKey: true, metaKey: true });
    flush();
    expect(changed).toHaveBeenCalledTimes(1);
    expect(changed.mock.calls[0][1].event).toMatchObject({ shiftKey: true, ctrlKey: true, altKey: true, metaKey: true });
  });
  it('accepts direct native input activation', async () => {
    const view = await render(() => <CheckboxRoot />);
    view.container.querySelector('input')!.click(); flush();
    expect(view.getByRole('checkbox')).toHaveAttribute('aria-checked', 'true');
  });
  it.each(['pre-canceled', 'native listener'] as const)('ignores a hidden input click canceled by %s', async (mode) => {
    const changed = vi.fn();
    const view = await render(() => <CheckboxRoot onCheckedChange={changed} />);
    const input = view.container.querySelector('input')!;
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    if (mode === 'pre-canceled') event.preventDefault();
    else input.addEventListener('click', (click) => click.preventDefault(), { once: true });
    input.dispatchEvent(event); flush();
    expect(changed).not.toHaveBeenCalled();
    expect(input.checked).toBe(false);
    expect(view.getByRole('checkbox')).toHaveAttribute('aria-checked', 'false');
  });
  it.each([false, true])('Space activates and Enter does not (nativeButton=%s)', async (nativeButton) => {
    const view = await render(() => <CheckboxRoot nativeButton={nativeButton} render={nativeButton ? NativeButton : undefined} />);
    const root = view.getByRole('checkbox');
    await view.user.tab(); expect(root).toHaveFocus();
    await view.user.keyboard('[Enter]'); expect(root).toHaveAttribute('aria-checked', 'false');
    await view.user.keyboard('[Space]'); expect(root).toHaveAttribute('aria-checked', 'true');
  });
  it('uses aria-disabled on the non-native root and disables the native input', async () => {
    const view = await render(() => <CheckboxRoot disabled />);
    const root = view.getByRole('checkbox');
    expect(root).not.toHaveAttribute('disabled');
    expect(root).toHaveAttribute('aria-disabled', 'true');
    expect(view.container.querySelector('input')!.disabled).toBe(true);
    await view.user.click(root);
    expect(root).toHaveAttribute('aria-checked', 'false');
  });
  it.each(['root', 'label', 'input'] as const)('readOnly blocks %s activation', async (target) => {
    const changed = vi.fn();
    const view = await render(() => <label data-testid="label"><CheckboxRoot readOnly onCheckedChange={changed} />Label</label>);
    const node = target === 'root' ? view.getByRole('checkbox') : target === 'label' ? view.getByTestId('label') : view.container.querySelector('input')!;
    node.click(); flush();
    expect(changed).not.toHaveBeenCalled();
    expect(view.container.querySelector('input')!.checked).toBe(false);
  });
  it.each([false, true])('retains mixed native and ARIA state across changes (controlled=%s)', async (controlled) => {
    const view = await render(() => {
      const [checked, setChecked] = createSignal(false);
      return <CheckboxRoot indeterminate checked={controlled ? checked() : undefined} onCheckedChange={setChecked} />;
    });
    const input = view.container.querySelector('input')!;
    expect(input.indeterminate).toBe(true);
    for (const expected of [true, false]) {
      await view.user.click(view.getByRole('checkbox'));
      expect(input.checked).toBe(expected);
      expect(input.indeterminate).toBe(true);
      expect(view.getByRole('checkbox')).toHaveAttribute('aria-checked', 'mixed');
    }
  });
  it('indeterminate overrides checked style hooks on both parts', async () => {
    const view = await render(() => <CheckboxRoot checked indeterminate><CheckboxIndicator data-testid="indicator" /></CheckboxRoot>);
    for (const node of [view.getByRole('checkbox'), view.getByTestId('indicator')]) {
      expect(node).toHaveAttribute('data-indeterminate');
      expect(node).not.toHaveAttribute('data-checked');
      expect(node).not.toHaveAttribute('data-unchecked');
    }
  });
  it('mirrors checked/disabled/readOnly/required style hooks to the indicator', async () => {
    const view = await renderProps((props: CheckboxRootProps) => <CheckboxRoot {...props}><CheckboxIndicator keepMounted data-testid="indicator" /></CheckboxRoot>,
      { defaultChecked: true, disabled: true, readOnly: true, required: true });
    const root = view.getByRole('checkbox');
    for (const node of [root, view.getByTestId('indicator')]) {
      for (const attribute of ['data-checked', 'data-disabled', 'data-readonly', 'data-required']) expect(node).toHaveAttribute(attribute);
      expect(node).not.toHaveAttribute('data-unchecked');
    }
    await view.setProps({ disabled: false, readOnly: false });
    await view.user.click(root);
    expect(root).toHaveAttribute('data-unchecked');
  });
  it.each([false, true])('explicit labels activate the proper id owner (nativeButton=%s)', async (nativeButton) => {
    const view = await render(() => <><label for="checkbox-input">Toggle</label>
      <CheckboxRoot id="checkbox-input" nativeButton={nativeButton} render={nativeButton ? NativeButton : undefined} /></>);
    const root = view.getByRole('checkbox'); const input = view.container.querySelector('input')!;
    expect(nativeButton ? root : input).toHaveAttribute('id', 'checkbox-input');
    expect(nativeButton ? input : root).not.toHaveAttribute('id', 'checkbox-input');
    await view.user.click(view.getByText('Toggle'));
    expect(root).toHaveAttribute('aria-checked', 'true');
  });
  it.each([false, true])('drops removed explicit IDs and keeps the host (nativeButton=%s)', async (nativeButton) => {
    const view = await renderProps((props: CheckboxRootProps) => <CheckboxRoot {...props} />,
      { nativeButton, id: 'explicit', render: nativeButton ? NativeButton : undefined });
    const root = view.getByRole('checkbox');
    await view.setProps({ id: undefined });
    const node = nativeButton ? root : view.container.querySelector('input')!;
    expect(node.id).not.toBe(''); expect(node.id).not.toBe('explicit');
    expect(view.getByRole('checkbox')).toBe(root);
  });
  it('does not reuse an unmounted explicit id', async () => {
    const view = await renderProps((props: { replace: boolean }) => <>{props.replace ? <CheckboxRoot /> : <CheckboxRoot id="old" />}</>, { replace: false });
    await view.setProps({ replace: true });
    expect(view.container.querySelector('input')!.id).not.toBe('old');
    expect(view.container.querySelector('input')!.id).not.toBe('');
  });
  it('wrapping labels and root clicks toggle only once', async () => {
    const changed = vi.fn();
    const view = await render(() => <label data-testid="label"><CheckboxRoot onCheckedChange={changed} />Toggle</label>);
    await view.user.click(view.getByRole('checkbox'));
    expect(changed).toHaveBeenCalledTimes(1);
    await view.user.click(view.getByTestId('label'));
    expect(changed).toHaveBeenCalledTimes(2);
    expect(view.getByRole('checkbox')).toHaveAttribute('aria-checked', 'false');
  });
  it.each(['', ' ', '\n\t ', undefined])('ignores blank aria-label %j in favor of a native label', async (ariaLabel) => {
    const view = await render(() => <label><CheckboxRoot aria-label={ariaLabel} />Native label</label>);
    expect(view.getByRole('checkbox')).toHaveAccessibleName('Native label');
  });
  it('tracks current aria-label and dynamic associated labels', async () => {
    const view = await renderProps<{ ariaLabel?: string; show: boolean }>((props) => <>
      {props.show && <label for="dynamic">Associated label</label>}<CheckboxRoot id="dynamic" aria-label={props.ariaLabel} />
    </>, { show: true });
    const root = view.getByRole('checkbox');
    expect(root).toHaveAccessibleName('Associated label');
    await view.setProps({ ariaLabel: 'Custom' }); expect(root).toHaveAccessibleName('Custom');
    await view.setProps({ ariaLabel: ' ' }); expect(root).toHaveAccessibleName('Associated label');
    await view.setProps({ show: false, ariaLabel: undefined }); expect(root).toHaveAccessibleName('');
    expect(root).not.toHaveAttribute('aria-labelledby');
    await view.setProps({ show: true }); expect(root).toHaveAccessibleName('Associated label');
  });
  it('updates native fallback labels when the input id changes', async () => {
    const view = await renderProps((props: CheckboxRootProps) => <><label for="a">Label A</label><label for="b">Label B</label><CheckboxRoot {...props} /></>, { id: 'a' });
    const root = view.getByRole('checkbox');
    expect(root).toHaveAccessibleName('Label A');
    const labelA = view.getByText('Label A');
    expect(labelA.id).not.toBe('');
    expect(root).toHaveAttribute('aria-labelledby', labelA.id);
    await view.setProps({ id: 'b' });
    await waitFor(() => expect(root).toHaveAccessibleName('Label B'));
    const labelB = view.getByText('Label B');
    expect(labelB.id).not.toBe('');
    expect(labelB.id).not.toBe(labelA.id);
    expect(root).toHaveAttribute('aria-labelledby', labelB.id);
  });
  it('owns inputRef replacement and disposal', async () => {
    const first = vi.fn(); const second = vi.fn();
    const view = await renderProps((props: CheckboxRootProps) => <CheckboxRoot {...props} />, { inputRef: first });
    const input = view.container.querySelector('input')!;
    expect(first).toHaveBeenCalledWith(input);
    await view.setProps({ inputRef: second });
    expect(first).toHaveBeenLastCalledWith(null);
    expect(second).toHaveBeenLastCalledWith(input);
    view.unmount(); expect(second).toHaveBeenLastCalledWith(null);
  });
  it('invokes live input refs untracked during replacement and disposal', async () => {
    const calls: { label: string; node: HTMLInputElement | null }[] = [];
    const first = (label: string, node: HTMLInputElement | null) => { calls.push({ label, node }); };
    const second = vi.fn(first);
    const view = await renderProps<{ label: string; replace: boolean }>((props) => {
      const firstRef = (node: HTMLInputElement | null) => first(props.label, node);
      const secondRef = (node: HTMLInputElement | null) => second(props.label, node);
      return <CheckboxRoot inputRef={props.replace ? secondRef : firstRef} />;
    }, { label: 'before', replace: false });
    const input = view.container.querySelector('input')!;
    expect(calls).toEqual([{ label: 'before', node: input }]);
    await view.setProps({ label: 'after', replace: true });
    expect(calls).toEqual([{ label: 'before', node: input }, { label: 'after', node: null }, { label: 'after', node: input }]);
    view.unmount();
    expect(second).toHaveBeenLastCalledWith('after', null);
  });
  it('moves hidden input focus to the exposed control', async () => {
    const view = await render(() => <CheckboxRoot />);
    view.container.querySelector('input')!.focus(); flush();
    expect(view.getByRole('checkbox')).toHaveFocus();
  });
  it('honors manually indeterminate grouped parents', async () => {
    const view = await render(() => <CheckboxGroup value={[]} allValues={['one']}><CheckboxRoot parent indeterminate /><CheckboxRoot value="one" /></CheckboxGroup>);
    expect(view.getAllByRole('checkbox')[0]).toHaveAttribute('aria-checked', 'mixed');
    expect(view.container.querySelector('input')!.indeterminate).toBe(true);
  });

  describe('native form projection and reset', () => {
    it.each([
      { value: undefined, uncheckedValue: undefined, off: null, on: 'on' },
      { value: 'yes', uncheckedValue: undefined, off: null, on: 'yes' },
      { value: undefined, uncheckedValue: 'off', off: 'off', on: 'on' },
      { value: 'true', uncheckedValue: 'false', off: 'false', on: 'true' },
      { value: '', uncheckedValue: '', off: '', on: '' },
    ])('submits native values %#', async ({ value, uncheckedValue, off, on }) => {
      const view = await render(() => <form><CheckboxRoot name="test" value={value} uncheckedValue={uncheckedValue} /></form>);
      const form = view.container.querySelector('form')!;
      expect(new FormData(form).get('test')).toBe(off);
      await view.user.click(view.getByRole('checkbox'));
      expect(new FormData(form).getAll('test')).toEqual([on]);
      await view.user.click(view.getByRole('checkbox'));
      expect(new FormData(form).get('test')).toBe(off);
    });
    it.each([false, true])('external form and disabled projection (disabled=%s)', async (disabled) => {
      const view = await render(() => <><form id="external" /><CheckboxRoot form="external" name="test" uncheckedValue="off" disabled={disabled} /></>);
      const form = view.container.querySelector('form')!;
      expect(new FormData(form).get('test')).toBe(disabled ? null : 'off');
      await view.user.click(view.getByRole('checkbox'));
      expect(new FormData(form).get('test')).toBe(disabled ? null : 'on');
    });
    it.each([false, true])('reset silently restores uncontrolled default (%s)', async (defaultChecked) => {
      const changed = vi.fn();
      const view = await render(() => <form><CheckboxRoot name="test" defaultChecked={defaultChecked} onCheckedChange={changed} indeterminate /></form>);
      await view.user.click(view.getByRole('checkbox'));
      view.container.querySelector('form')!.reset();
      await waitFor(() => expect(view.getByRole('checkbox')).toHaveAttribute('aria-checked', 'mixed'));
      await waitFor(() => expect(view.container.querySelector('input')!.checked).toBe(defaultChecked));
      expect(view.container.querySelector('input')!.indeterminate).toBe(true);
      expect(changed).toHaveBeenCalledTimes(1);
    });
    it('canceled reset retains the selected state', async () => {
      const view = await render(() => <form onReset={(event) => event.preventDefault()}><CheckboxRoot /></form>);
      await view.user.click(view.getByRole('checkbox'));
      view.container.querySelector('form')!.reset(); await Promise.resolve(); flush();
      expect(view.getByRole('checkbox')).toHaveAttribute('aria-checked', 'true');
      expect(view.container.querySelector('input')!.checked).toBe(true);
    });
    it('controlled reset does not override current props or notify', async () => {
      const changed = vi.fn();
      const view = await renderProps((props: CheckboxRootProps) => <form><CheckboxRoot {...props} /></form>, { checked: false, onCheckedChange: changed });
      await view.setProps({ checked: true });
      view.container.querySelector('form')!.reset();
      await waitFor(() => expect(view.container.querySelector('input')!.checked).toBe(true));
      expect(changed).not.toHaveBeenCalled();
    });
  });

  for (const mode of ['normal', 'native', 'readOnly', 'external', 'consumer-cancel', 'ancestor-cancel', 'no-submitter', 'disabled-submitter'] as const) {
    browserCase({ source: 'packages/react/src/checkbox/root/CheckboxRoot.test.tsx', case: `Enter form submission: ${mode}`, environment: 'browser', issue: 'bsolid-browser' }, async () => {
      const submit = vi.fn((event: SubmitEvent) => event.preventDefault());
      const submitClick = vi.fn();
      const checkbox = () => <CheckboxRoot name="test" form={mode === 'external' ? 'target' : undefined}
        readOnly={mode === 'readOnly'} nativeButton={mode === 'native'} render={mode === 'native' ? NativeButton : undefined}
        onKeyDown={mode === 'consumer-cancel' ? (event) => event.preventDefault() : undefined} />;
      const view = await render(() => <>
        {mode === 'external' && checkbox()}
        <form id="target" onSubmit={submit} onKeyDown={mode === 'ancestor-cancel' ? (event) => event.preventDefault() : undefined}>
          {mode !== 'external' && checkbox()}
          {mode !== 'no-submitter' && <button type="submit" disabled={mode === 'disabled-submitter'} onClick={submitClick}>Submit</button>}
          {mode === 'disabled-submitter' && <button type="submit">Later submitter</button>}
        </form>
      </>);
      const root = view.getByRole('checkbox'); root.focus();
      await view.user.keyboard('[Enter]');
      const submits = ['normal', 'native', 'readOnly', 'external'].includes(mode);
      expect(submit).toHaveBeenCalledTimes(submits ? 1 : 0);
      expect(submitClick).toHaveBeenCalledTimes(submits ? 1 : 0);
      if (submits) expect(submit.mock.calls[0][0].submitter).toBe(view.getByText('Submit'));
      expect(root).toHaveAttribute('aria-checked', 'false');
    });
  }
});
