import { describe, expect, it, vi } from 'vitest';
import { createRenderer, describeConformance, fireEvent, browserCase, waitFor } from '../../test';
import { RadioGroup, type RadioGroupProps } from './RadioGroup';
import { Radio } from '../radio';
import { Fieldset } from '../fieldset';
import { DirectionContext } from '../internals/direction-context';

// Source: radio-group/RadioGroup.test.tsx and radio/root/RadioRoot.test.tsx,
// 19511bb171f3b360b006c94cf6d07e53cb446505. Native refs detach with null in RC13;
// callback-return cleanup is deliberately not a React compatibility feature.
describe('RadioGroup', () => {
  const { render, renderProps } = createRenderer();

  describeConformance((props) => <RadioGroup {...props} />, {
    initialProps: {}, refInstanceof: HTMLDivElement,
  });

  it('forwards root id/role overrides while keeping group value off the host', async () => {
    const view = await render(() => <RadioGroup id="choices" role="switch" value="a" />);
    expect(view.getByRole('switch')).toHaveAttribute('id', 'choices');
    expect(view.getByRole('switch')).not.toHaveAttribute('value');
  });

  it('selects identity values including null and serializes only the hidden input', async () => {
    const value = { id: 1 };
    const other = { id: 1 };
    const change = vi.fn();
    const view = await render(() => <form>
      <RadioGroup name="choice" onValueChange={change}>
        <Radio.Root value={value} aria-label="object" />
        <Radio.Root value={other} aria-label="other" />
        <Radio.Root value={null} aria-label="null" />
      </RadioGroup>
    </form>);
    const a = view.getByRole('radio', { name: 'object' });
    await view.user.click(a);
    expect(change.mock.lastCall?.[0]).toBe(value);
    expect(a).toHaveAttribute('aria-checked', 'true');
    expect(a).not.toHaveAttribute('value');
    expect(view.getByRole('radio', { name: 'other' })).toHaveAttribute('aria-checked', 'false');
    expect(new FormData(view.container.querySelector('form')!).get('choice')).toBe(JSON.stringify(value));
    await view.user.click(view.getByRole('radio', { name: 'null' }));
    expect(change.mock.lastCall?.[0]).toBe(null);
    expect(a).toHaveAttribute('aria-checked', 'false');
  });

  it('selects only on Space keyup, not Enter, and bubbles one user click', async () => {
    const change = vi.fn();
    const parent = vi.fn();
    const view = await render(() => <div onClick={parent}>
      <RadioGroup onValueChange={change}><Radio.Root value="a" aria-label="A" /></RadioGroup>
    </div>);
    const radio = view.getByRole('radio');
    radio.focus();
    await view.user.keyboard('{Enter}');
    expect(change).not.toHaveBeenCalled();
    await view.user.keyboard('[Space>]');
    expect(change).not.toHaveBeenCalled();
    await view.user.keyboard('[/Space]');
    expect(change).toHaveBeenCalledExactlyOnceWith('a', expect.objectContaining({ reason: 'none' }));
    expect(parent).toHaveBeenCalledTimes(1);
  });

  it.each(['root', 'input', 'arrow'] as const)('rolls back canceled %s activation including native checked siblings', async (activation) => {
    const change = vi.fn((_value, details) => details.cancel());
    const view = await render(() => <RadioGroup defaultValue="a" onValueChange={change}>
      <Radio.Root value="a" aria-label="A" /><Radio.Root value="b" aria-label="B" />
    </RadioGroup>);
    const [a, b] = view.getAllByRole('radio');
    if (activation === 'root') await view.user.click(b);
    else if (activation === 'input') await view.user.click(b.nextElementSibling!);
    else { a.focus(); await view.user.keyboard('{ArrowDown}'); expect(b).toHaveFocus(); }
    expect(change).toHaveBeenCalledTimes(1);
    expect(a).toHaveAttribute('aria-checked', 'true');
    expect(b).toHaveAttribute('aria-checked', 'false');
    expect(a.nextElementSibling).toBeChecked();
    expect(b.nextElementSibling).not.toBeChecked();
  });

  it.each(['ltr', 'rtl'] as const)('roves in %s, skips disabled radios, and emits no ancestor navigation clicks', async (direction) => {
    const parent = vi.fn();
    const view = await render(() => <DirectionContext value={() => direction}>
      <div onClick={parent}><RadioGroup defaultValue="a">
        <Radio.Root value="a" aria-label="A" />
        <Radio.Root value="disabled" disabled aria-label="disabled" />
        <Radio.Root value="b" aria-label="B" />
      </RadioGroup></div>
    </DirectionContext>);
    const a = view.getByRole('radio', { name: 'A' });
    const b = view.getByRole('radio', { name: 'B' });
    a.focus();
    await view.user.keyboard(direction === 'ltr' ? '{ArrowRight}' : '{ArrowLeft}');
    expect(b).toHaveFocus();
    expect(b).toHaveAttribute('aria-checked', 'true');
    await view.user.keyboard('{Shift>}{ArrowDown}{/Shift}');
    expect(a).toHaveFocus();
    expect(parent).not.toHaveBeenCalled();
    await view.user.keyboard('{End}');
    expect(a).toHaveFocus();
  });

  it.each(['altKey', 'ctrlKey', 'metaKey', 'single'] as const)('does not leave a stale selection transaction after %s navigation', async (modifier) => {
    const change = vi.fn();
    const view = await render(() => <>
      <RadioGroup onValueChange={change}>
        <Radio.Root value="a" aria-label="A" />
        <Radio.Root value="b" aria-label="B" disabled={modifier === 'single'} />
      </RadioGroup><button>Outside</button>
    </>);
    const a = view.getByRole('radio', { name: 'A' });
    a.focus();
    fireEvent.keyDown(a, { key: 'ArrowDown', ...(modifier === 'single' ? {} : { [modifier]: true }) });
    expect(a).toHaveFocus();
    expect(a).toHaveAttribute('aria-checked', 'false');
    await view.user.tab();
    expect(view.getByRole('button', { name: 'Outside' })).toHaveFocus();
    await view.user.tab({ shift: true });
    expect(a).toHaveFocus();
    expect(change).not.toHaveBeenCalled();
    expect(a).toHaveAttribute('aria-checked', 'false');
  });

  it('uses live controlled values, callbacks, and render state without recreating hosts', async () => {
    const before = vi.fn();
    const after = vi.fn();
    const view = await renderProps((props: RadioGroupProps<string>) => <RadioGroup {...props}>
      <Radio.Root value="a" aria-label="A" class={(state) => ({ selected: state.checked })} />
      <Radio.Root value="b" aria-label="B" />
    </RadioGroup>, { value: 'a', onValueChange: before });
    const a = view.getByRole('radio', { name: 'A' });
    const b = view.getByRole('radio', { name: 'B' });
    await view.user.click(b);
    expect(before).toHaveBeenCalledTimes(1);
    expect(a.nextElementSibling).toBeChecked();
    expect(b.nextElementSibling).not.toBeChecked();
    await view.setProps({ value: 'b', onValueChange: after });
    expect(view.getByRole('radio', { name: 'A' })).toBe(a);
    expect(a).not.toHaveClass('selected');
    await view.user.click(a);
    expect(after).toHaveBeenCalledTimes(1);
    expect(b).toHaveAttribute('aria-checked', 'true');
  });

  it('carries explicit candidates through multiple native activations in one turn', async () => {
    const change = vi.fn();
    const view = await render(() => <RadioGroup defaultValue="a" onValueChange={change}>
      <Radio.Root value="a" aria-label="A" /><Radio.Root value="b" aria-label="B" />
    </RadioGroup>);
    const a = view.getByRole('radio', { name: 'A' });
    const b = view.getByRole('radio', { name: 'B' });
    fireEvent.click(b);
    fireEvent.click(a);
    await waitFor(() => expect(change.mock.calls.map(([value]) => value)).toEqual(['b', 'a']));
    expect(a).toHaveAttribute('aria-checked', 'true');
    expect(a.nextElementSibling).toBeChecked();
    expect(b.nextElementSibling).not.toBeChecked();
  });

  it('transfers and detaches inputRef as selection, callback, and eligibility change', async () => {
    const oldRef = vi.fn();
    const newRef = vi.fn();
    type Props = { inputRef: (input: HTMLInputElement) => void; disabled: boolean; mounted: boolean };
    const view = await renderProps((props: Props) => <RadioGroup inputRef={props.inputRef}>
      <Radio.Root value="a" aria-label="A" disabled />
      {props.mounted && <Radio.Root value="b" aria-label="B" disabled={props.disabled} />}
    </RadioGroup>, { inputRef: oldRef, disabled: false, mounted: true });
    const input = view.getByRole('radio', { name: 'B' }).nextElementSibling;
    expect(oldRef).toHaveBeenLastCalledWith(input);
    await view.setProps({ inputRef: newRef });
    expect(oldRef).toHaveBeenLastCalledWith(null);
    expect(newRef).toHaveBeenLastCalledWith(input);
    await view.setProps({ disabled: true });
    expect(newRef).toHaveBeenLastCalledWith(null);
    await view.setProps({ disabled: false });
    expect(newRef).toHaveBeenLastCalledWith(input);
    await view.setProps({ mounted: false });
    expect(newRef).toHaveBeenLastCalledWith(null);
  });

  it('keeps stable refs through unrelated updates, clears to the first input, and detaches on disposal', async () => {
    const inputRef = vi.fn();
    const view = await renderProps<{ value: string | null; title: string }>((props) => <RadioGroup value={props.value} title={props.title} inputRef={inputRef}>
      <Radio.Root value="a" aria-label="A" /><Radio.Root value="b" aria-label="B" />
    </RadioGroup>, { value: 'b', title: 'before' });
    const a = view.getByRole('radio', { name: 'A' }).nextElementSibling;
    const b = view.getByRole('radio', { name: 'B' }).nextElementSibling;
    expect(inputRef).toHaveBeenLastCalledWith(b);
    inputRef.mockClear();
    await view.setProps({ title: 'after' });
    expect(inputRef).not.toHaveBeenCalled();
    await view.setProps({ value: null });
    expect(inputRef).toHaveBeenLastCalledWith(a);
    expect(a).not.toBeChecked();
    expect(b).not.toBeChecked();
    view.unmount();
    expect(inputRef).toHaveBeenLastCalledWith(null);
  });

  it('transfers native ref arrays and supports removing/restoring inputRef without replacing inputs', async () => {
    const first = vi.fn();
    const second = vi.fn();
    const third = vi.fn();
    const view = await renderProps<RadioGroupProps<string>>((props) => <RadioGroup {...props}>
      <Radio.Root value="a" /><Radio.Root value="b" />
    </RadioGroup>, { value: 'b', inputRef: [first, second] });
    const input = view.getAllByRole('radio')[1].nextElementSibling;
    expect(first).toHaveBeenLastCalledWith(input);
    expect(second).toHaveBeenLastCalledWith(input);
    await view.setProps({ inputRef: third });
    expect(first).toHaveBeenLastCalledWith(null);
    expect(second).toHaveBeenLastCalledWith(null);
    expect(third).toHaveBeenLastCalledWith(input);
    await view.setProps({ inputRef: undefined });
    expect(third).toHaveBeenLastCalledWith(null);
    await view.setProps({ inputRef: third });
    expect(third).toHaveBeenLastCalledWith(input);
    view.unmount();
    expect(third).toHaveBeenLastCalledWith(null);
  });

  it('owns inputRef independently of nativeButton render wrappers', async () => {
    const inputRef = vi.fn();
    const view = await render(() => <RadioGroup inputRef={inputRef}>
      <Radio.Root nativeButton value="a" render={(props) => <label><button {...props} /><span>A</span></label>} />
      <Radio.Root nativeButton value="b" render={(props) => <label><button {...props} /><span>B</span></label>} />
    </RadioGroup>);
    const inputs = view.container.querySelectorAll('input[type="radio"]');
    expect(inputs).toHaveLength(2);
    expect(inputRef).toHaveBeenLastCalledWith(inputs[0]);
    await view.user.click(view.getByRole('radio', { name: 'B' }));
    expect(inputRef).toHaveBeenLastCalledWith(inputs[1]);
  });

  it('detaches a selected-after-mount representative when it unmounts', async () => {
    const inputRef = vi.fn();
    const view = await renderProps((props: { show: boolean }) => <RadioGroup inputRef={inputRef}>
      <Radio.Root value="a" aria-label="A" />{props.show && <Radio.Root value="b" aria-label="B" />}
    </RadioGroup>, { show: true });
    await view.user.click(view.getByRole('radio', { name: 'B' }));
    expect(inputRef).toHaveBeenLastCalledWith(view.getByRole('radio', { name: 'B' }).nextElementSibling);
    await view.setProps({ show: false });
    expect(inputRef).toHaveBeenLastCalledWith(null);
  });

  it.each([false, true])('uses Space keyup without Enter activation on a nativeButton=%s host', async (nativeButton) => {
    const change = vi.fn();
    const view = await render(() => <RadioGroup onValueChange={change}>
      <Radio.Root value="a" nativeButton={nativeButton} render={nativeButton ? (props) => <button {...props} /> : undefined} />
    </RadioGroup>);
    const radio = view.getByRole('radio');
    radio.focus();
    await view.user.keyboard('{Enter}');
    expect(change).not.toHaveBeenCalled();
    await view.user.keyboard('[Space>]');
    expect(change).not.toHaveBeenCalled();
    await view.user.keyboard('[/Space]');
    expect(change).toHaveBeenCalledExactlyOnceWith('a', expect.anything());
  });

  it.each(['ltr', 'rtl'] as const)('preserves selected tab entry, wrapping and live direction in %s', async (direction) => {
    const view = await renderProps((props: { direction: 'ltr' | 'rtl' }) => <DirectionContext value={() => props.direction}>
      <button>Before</button><RadioGroup defaultValue="b">
        <Radio.Root value="a" aria-label="A" /><Radio.Root value="b" aria-label="B" /><Radio.Root value="c" aria-label="C" />
      </RadioGroup><button>After</button>
    </DirectionContext>, { direction });
    const [a, b, c] = view.getAllByRole('radio');
    expect(a).toHaveAttribute('tabindex', '-1');
    expect(b).toHaveAttribute('tabindex', '0');
    expect(c).toHaveAttribute('tabindex', '-1');
    b.focus();
    for (const target of [c, a, b]) {
      await view.user.keyboard('{ArrowDown}');
      expect(target).toHaveFocus();
      expect(target).toHaveAttribute('aria-checked', 'true');
    }
    await view.user.keyboard('{ArrowUp}');
    expect(a).toHaveFocus();
    await view.user.keyboard(direction === 'ltr' ? '{ArrowLeft}' : '{ArrowRight}');
    expect(c).toHaveFocus();
    await view.user.tab();
    expect(view.getByRole('button', { name: 'After' })).toHaveFocus();
    await view.user.tab({ shift: true });
    expect(c).toHaveFocus();
    await view.setProps({ direction: direction === 'ltr' ? 'rtl' : 'ltr' });
    await view.user.keyboard(direction === 'ltr' ? '{ArrowLeft}' : '{ArrowRight}');
    expect(a).toHaveFocus();
    expect(a).toHaveAttribute('aria-checked', 'true');
  });

  it.each(['disabled', 'readOnly'] as const)('inherits live group %s into controls and hidden inputs', async (mode) => {
    const change = vi.fn();
    const view = await renderProps((props: { blocked: boolean }) => <RadioGroup disabled={mode === 'disabled' && props.blocked} readOnly={mode === 'readOnly' && props.blocked} onValueChange={change}>
      <Radio.Root value="a" aria-label="A" /><Radio.Root value="b" aria-label="B" />
    </RadioGroup>, { blocked: true });
    const [a, b] = view.getAllByRole('radio');
    expect(view.getByRole('radiogroup')).toHaveAttribute(mode === 'disabled' ? 'aria-disabled' : 'aria-readonly', 'true');
    await view.user.click(a);
    a.focus();
    await view.user.keyboard('{ArrowDown}');
    expect(change).not.toHaveBeenCalled();
    expect(a.nextElementSibling).not.toBeChecked();
    expect(b.nextElementSibling).not.toBeChecked();
    await view.setProps({ blocked: false });
    await view.user.click(b);
    expect(b).toHaveAttribute('aria-checked', 'true');
  });

  it.each(['name', 'disabled', 'required', 'readOnly'] as const)('retains raw control/input identity when group %s changes', async (key) => {
    const view = await renderProps<RadioGroupProps<string>>((props) => <RadioGroup {...props}>
      <Radio.Root value="a" aria-label="A" /><Radio.Root value="b" aria-label="B" />
    </RadioGroup>, { name: 'before' });
    const group = view.getByRole('radiogroup');
    const a = view.getByRole('radio', { name: 'A' });
    const input = a.nextElementSibling;
    await view.setProps(key === 'name' ? { name: 'after' } : { [key]: true });
    expect(view.getByRole('radiogroup')).toBe(group);
    expect(view.getByRole('radio', { name: 'A' })).toBe(a);
    expect(a.nextElementSibling).toBe(input);
  });

  it('moves the removed highlighted tab stop back to the controlled selected radio', async () => {
    const view = await renderProps((props: { show: boolean }) => <RadioGroup value="b">
      <Radio.Root value="a" aria-label="A" /><Radio.Root value="b" aria-label="B" />
      {props.show && <Radio.Root value="c" aria-label="C" />}
    </RadioGroup>, { show: true });
    view.getByRole('radio', { name: 'B' }).focus();
    await view.user.keyboard('{ArrowDown}');
    expect(view.getByRole('radio', { name: 'C' })).toHaveAttribute('tabindex', '0');
    await view.setProps({ show: false });
    expect(view.getByRole('radio', { name: 'B' })).toHaveAttribute('tabindex', '0');
    expect(view.getByRole('radio', { name: 'A' })).toHaveAttribute('tabindex', '-1');
  });

  it('detaches a removed representative even when another enabled input survives', async () => {
    const inputRef = vi.fn();
    const view = await renderProps((props: { show: boolean }) => <RadioGroup inputRef={inputRef}>
      {props.show && <Radio.Root value="a" aria-label="A" />}
      <Radio.Root value="b" aria-label="B" />
    </RadioGroup>, { show: true });
    expect(inputRef).toHaveBeenLastCalledWith(view.getByRole('radio', { name: 'A' }).nextElementSibling);
    await view.setProps({ show: false });
    expect(inputRef).toHaveBeenLastCalledWith(null);
    await view.user.click(view.getByRole('radio', { name: 'B' }));
    expect(inputRef).toHaveBeenLastCalledWith(view.getByRole('radio', { name: 'B' }).nextElementSibling);
  });

  it.each([false, true])('restores form reset state without notifying (controlled=%s)', async (controlled) => {
    const change = vi.fn();
    const view = await render(() => <form>
      <RadioGroup name="choice" value={controlled ? 'b' : undefined} defaultValue="a" onValueChange={change}>
        <Radio.Root value="a" aria-label="A" /><Radio.Root value="b" aria-label="B" />
      </RadioGroup><button type="reset">Reset</button>
    </form>);
    await view.user.click(view.getByRole('radio', { name: controlled ? 'A' : 'B' }));
    change.mockClear();
    await view.user.click(view.getByRole('button'));
    const selected = view.getByRole('radio', { name: controlled ? 'B' : 'A' });
    expect(selected).toHaveAttribute('aria-checked', 'true');
    expect(selected.nextElementSibling).toBeChecked();
    expect(change).not.toHaveBeenCalled();
  });

  it('honors a canceled native reset', async () => {
    const view = await render(() => <form onReset={(event) => event.preventDefault()}>
      <RadioGroup defaultValue="a"><Radio.Root value="a" aria-label="A" /><Radio.Root value="b" aria-label="B" /></RadioGroup>
      <button type="reset">Reset</button>
    </form>);
    const b = view.getByRole('radio', { name: 'B' });
    await view.user.click(b);
    await view.user.click(view.getByRole('button'));
    expect(b.nextElementSibling).toBeChecked();
  });

  it('tracks live external form ownership for reset and successful input data', async () => {
    const change = vi.fn();
    const view = await renderProps((props: { form: string; name: string; required: boolean }) => <>
      <form id="first-form"><button type="reset">First reset</button></form>
      <form id="second-form"><button type="reset">Second reset</button></form>
      <RadioGroup name={props.name} form={props.form} required={props.required} defaultValue="a" onValueChange={change}>
        <Radio.Root value="a" aria-label="A" /><Radio.Root value="b" aria-label="B" />
      </RadioGroup>
    </>, { form: 'first-form', name: 'before', required: false });
    const a = view.getByRole('radio', { name: 'A' });
    const b = view.getByRole('radio', { name: 'B' });
    const input = b.nextElementSibling as HTMLInputElement;
    await view.user.click(b);
    await view.setProps({ form: 'second-form', name: 'after', required: true });
    expect(input.form?.id).toBe('second-form');
    expect(input).toHaveAttribute('required');
    expect(input).toHaveAttribute('name', 'after');
    expect(new FormData(view.container.querySelectorAll('form')[0]).getAll('before')).toEqual([]);
    expect(new FormData(view.container.querySelectorAll('form')[1]).getAll('after')).toEqual(['b']);
    change.mockClear();
    await view.user.click(view.getByRole('button', { name: 'First reset' }));
    expect(b).toHaveAttribute('aria-checked', 'true');
    await view.user.click(view.getByRole('button', { name: 'Second reset' }));
    expect(a).toHaveAttribute('aria-checked', 'true');
    expect(a.nextElementSibling).toBeChecked();
    expect(change).not.toHaveBeenCalled();
  });

  it('clears an uncontrolled group with no default on native reset', async () => {
    const view = await render(() => <form><RadioGroup name="choice"><Radio.Root value="a" /></RadioGroup><button type="reset">Reset</button></form>);
    const radio = view.getByRole('radio');
    await view.user.click(radio);
    await view.user.click(view.getByRole('button'));
    expect(radio).toHaveAttribute('aria-checked', 'false');
    expect(radio.nextElementSibling).not.toBeChecked();
  });

  it('updates fieldset disabled and legend labeling live', async () => {
    const view = await renderProps((props: { disabled: boolean; legend: string; label?: string }) => <Fieldset.Root disabled={props.disabled}>
      <Fieldset.Legend id={props.legend}>Legend</Fieldset.Legend>
      <RadioGroup aria-labelledby={props.label}><Radio.Root value="a" /></RadioGroup>
    </Fieldset.Root>, { disabled: true, legend: 'legend-a', label: 'explicit' });
    const group = view.getByRole('radiogroup');
    expect(group).toHaveAttribute('aria-labelledby', 'explicit');
    expect(view.getByRole('radio')).toHaveAttribute('aria-disabled', 'true');
    await view.setProps({ disabled: false, legend: 'legend-b', label: undefined });
    // Explicit undefined masks the inherited label; omitting the prop is tested by
    // the direct Fieldset composition case in the fieldset family's suite.
    expect(view.getByRole('radio')).not.toHaveAttribute('aria-disabled', 'true');
    expect(group).not.toHaveAttribute('aria-labelledby');
  });

  browserCase({ source: 'packages/react/src/radio-group/RadioGroup.test.tsx',
    case: 'disabled checked radio satisfies required group but is not successful',
    environment: 'browser', issue: 'bsolid-browser' }, async () => {
    const view = await render(() => <form>
      <RadioGroup name="choice" required defaultValue="a">
        <Radio.Root value="a" disabled /><Radio.Root value="b" />
      </RadioGroup>
    </form>);
    const form = view.container.querySelector('form')!;
    expect(form.checkValidity()).toBe(true);
    expect(new FormData(form).getAll('choice')).toEqual([]);
  });

  browserCase({ source: 'packages/react/src/radio-group/RadioGroup.test.tsx',
    case: 'external form ownership and required validation', environment: 'browser', issue: 'bsolid-browser' }, async () => {
    const view = await render(() => <>
      <form id="external" />
      <RadioGroup name="choice" form="external" required><Radio.Root value="a" /></RadioGroup>
    </>);
    const form = view.container.querySelector('form')!;
    expect(form.checkValidity()).toBe(false);
    await view.user.click(view.getByRole('radio'));
    expect(form.checkValidity()).toBe(true);
    expect(new FormData(form).get('choice')).toBe('a');
  });
});
