import { describe, expect, it, vi } from 'vitest';
import { createRenderer, describeConformance, fireEvent } from '../../../test';
import { Radio } from '..';
import { RadioGroup } from '../../radio-group';
import { createRenderElement } from '../../internals/createRenderElement';

describe('RadioRoot', () => {
  const { render, renderProps } = createRenderer();

  describeConformance((props) => <Radio.Root value="" {...props} />, {
    initialProps: {}, refInstanceof: HTMLSpanElement, testRenderPropWith: 'span', button: true,
  });

  it('sets checked and unchecked data attributes without forwarding value', async () => {
    const view = await render(() => <RadioGroup defaultValue="checked">
      <Radio.Root value="checked" data-testid="checked" />
      <Radio.Root value="unchecked" data-testid="unchecked" />
    </RadioGroup>);
    expect(view.getByTestId('checked')).toHaveAttribute('data-checked');
    expect(view.getByTestId('checked')).not.toHaveAttribute('data-unchecked');
    expect(view.getByTestId('unchecked')).toHaveAttribute('data-unchecked');
    expect(view.getByTestId('unchecked')).not.toHaveAttribute('data-checked');
    for (const node of view.getAllByRole('radio')) expect(node).not.toHaveAttribute('value');
  });

  it('allows null selection and clears it when another radio is clicked', async () => {
    const view = await render(() => <RadioGroup>
      <Radio.Root value={null} data-testid="null" /><Radio.Root value="a" data-testid="a" />
    </RadioGroup>);
    await view.user.click(view.getByTestId('null'));
    expect(view.getByTestId('null')).toHaveAttribute('aria-checked', 'true');
    await view.user.click(view.getByTestId('a'));
    expect(view.getByTestId('null')).toHaveAttribute('aria-checked', 'false');
  });

  it('supports standalone empty-value selection and native ref cleanup', async () => {
    const ref = vi.fn();
    const inputRef = vi.fn();
    const view = await render(() => <Radio.Root value="" ref={ref} inputRef={inputRef} />);
    const radio = view.getByRole('radio');
    expect(radio.tagName).toBe('SPAN');
    expect(radio).toHaveAttribute('aria-checked', 'true');
    expect(radio.nextElementSibling).toBeChecked();
    expect(ref).toHaveBeenLastCalledWith(radio);
    expect(inputRef).toHaveBeenLastCalledWith(radio.nextElementSibling);
    view.unmount();
    expect(ref).toHaveBeenLastCalledWith(null);
    expect(inputRef).toHaveBeenLastCalledWith(null);
  });

  it.each(['preventDefault', 'preventBaseUIHandler'] as const)('honors consumer %s independently', async (method) => {
    const change = vi.fn();
    const view = await render(() => <RadioGroup onValueChange={change}>
      <Radio.Root value="a" onClick={(event) => event[method]()} />
    </RadioGroup>);
    await view.user.click(view.getByRole('radio'));
    expect(change).not.toHaveBeenCalled();
    expect(view.getByRole('radio').nextElementSibling).not.toBeChecked();
  });

  it.each([false, true])('does not interpret stopPropagation as selection cancellation (nativeButton=%s)', async (nativeButton) => {
    const parent = vi.fn();
    const view = await render(() => <div onClick={parent}>
      <RadioGroup><Radio.Root value="a" nativeButton={nativeButton} render={nativeButton ? (props) => <button {...props} /> : undefined} onClick={(event) => event.stopPropagation()} /></RadioGroup>
    </div>);
    const radio = view.getByRole('radio');
    await view.user.click(radio);
    expect(radio).toHaveAttribute('aria-checked', 'true');
    expect(parent).not.toHaveBeenCalled();
  });

  it('preserves consumer click, value callback, and single ancestor click ordering', async () => {
    const calls: string[] = [];
    const view = await render(() => <div onClick={() => calls.push('ancestor')}>
      <RadioGroup onValueChange={() => calls.push('value')}><Radio.Root value="a" onClick={(event) => {
        expect(event.currentTarget).toBe(view.getByRole('radio'));
        calls.push('consumer');
      }} /></RadioGroup>
    </div>);
    await view.user.click(view.getByRole('radio'));
    expect(calls).toEqual(['consumer', 'value', 'ancestor']);
  });

  it('forwards modifier properties through native activation', async () => {
    const change = vi.fn();
    const view = await render(() => <RadioGroup onValueChange={change}><Radio.Root value="a" /></RadioGroup>);
    await view.user.keyboard('{Shift>}');
    await view.user.click(view.getByRole('radio'));
    await view.user.keyboard('{/Shift}');
    expect(change.mock.lastCall?.[1].event.shiftKey).toBe(true);
  });

  it.each(['root', 'input', 'label', 'arrow'] as const)('honors late native input click cancellation through %s activation', async (activation) => {
    const change = vi.fn();
    const parent = vi.fn();
    const view = await render(() => <div onClick={parent}>
      <label for="cancel-input">B label</label>
      <RadioGroup name="choice" defaultValue="a" onValueChange={change}>
        <Radio.Root value="a" aria-label="A" /><Radio.Root value="b" id="cancel-input" aria-label="B" />
      </RadioGroup>
    </div>);
    const a = view.getByRole('radio', { name: 'A' });
    const b = view.getByRole('radio', { name: 'B' });
    const input = b.nextElementSibling as HTMLInputElement;
    const cancel = (event: Event) => event.preventDefault();
    input.addEventListener('click', cancel);
    if (activation === 'root') await view.user.click(b);
    else if (activation === 'input') await view.user.click(input);
    else if (activation === 'label') await view.user.click(view.getByText('B label'));
    else { a.focus(); await view.user.keyboard('{ArrowDown}'); expect(b).toHaveFocus(); }
    expect(change).not.toHaveBeenCalled();
    expect(a).toHaveAttribute('aria-checked', 'true');
    expect(a.nextElementSibling).toBeChecked();
    expect(b).toHaveAttribute('aria-checked', 'false');
    expect(input).not.toBeChecked();
    expect(parent).toHaveBeenCalledTimes(activation === 'root' || activation === 'label' ? 1 : 0);
    input.removeEventListener('click', cancel);
    await view.user.click(b);
    expect(change).toHaveBeenCalledExactlyOnceWith('b', expect.objectContaining({ reason: 'none' }));
  });

  it('notifies only for a changed selection and exposes the native modifier click event', async () => {
    const change = vi.fn();
    const view = await render(() => <RadioGroup defaultValue="a" onValueChange={change}>
      <Radio.Root value="a" aria-label="A" /><Radio.Root value="b" aria-label="B" />
    </RadioGroup>);
    await view.user.click(view.getByRole('radio', { name: 'A' }));
    expect(change).not.toHaveBeenCalled();
    await view.user.keyboard('{Control>}{Alt>}{Meta>}');
    await view.user.click(view.getByRole('radio', { name: 'B' }));
    await view.user.keyboard('{/Meta}{/Alt}{/Control}');
    expect(change.mock.lastCall?.[1].event).toBeInstanceOf(MouseEvent);
    expect(change.mock.lastCall?.[1].event).toMatchObject({ type: 'click', ctrlKey: true, altKey: true, metaKey: true });
  });

  it('uses aria-disabled on the non-native control and disabled only on its input', async () => {
    const view = await render(() => <RadioGroup><Radio.Root value="a" disabled /></RadioGroup>);
    const radio = view.getByRole('radio');
    expect(radio).toHaveAttribute('aria-disabled', 'true');
    expect(radio).not.toHaveAttribute('disabled');
    expect(radio.nextElementSibling).toBeDisabled();
  });

  it('prefers aria-label over implicit and explicit native labels', async () => {
    const view = await render(() => <RadioGroup>
      <label><Radio.Root value="a" aria-label="Apple" />Other name</label>
    </RadioGroup>);
    expect(view.getByRole('radio')).not.toHaveAttribute('aria-labelledby');
    expect(view.getByRole('radio')).toHaveAccessibleName('Apple');
    await view.user.click(view.getByText('Other name'));
    expect(view.getByRole('radio')).toHaveAttribute('aria-checked', 'true');
  });

  it('keeps native on as the default hidden value when value is undefined', async () => {
    const change = vi.fn();
    const view = await render(() => <RadioGroup onValueChange={change}>
      <Radio.Root value={undefined} />
    </RadioGroup>);
    const input = view.getByRole('radio').nextElementSibling as HTMLInputElement;
    expect(input).not.toHaveAttribute('value');
    expect(input.value).toBe('on');
    fireEvent.click(input);
    await view.user.keyboard('{Shift}');
    expect(change).not.toHaveBeenCalled();
  });

  it('removes a previously serialized hidden value when the identifying value becomes undefined', async () => {
    const view = await renderProps<{ value: string | undefined }>((props) => <Radio.Root value={props.value} />, { value: 'a' });
    const input = view.getByRole('radio').nextElementSibling as HTMLInputElement;
    expect(input).toHaveAttribute('value', 'a');
    await view.setProps({ value: undefined });
    expect(input).not.toHaveAttribute('value');
    expect(input.value).toBe('on');
  });

  it('associates nativeButton ids with the visible button and bubbles one click', async () => {
    const parent = vi.fn();
    const view = await render(() => <div onClick={parent}>
      <label for="native-radio">Native</label>
      <RadioGroup>
        <Radio.Root value="a" id="native-radio" nativeButton render={(props) => createRenderElement('button', {}, { props })} />
      </RadioGroup>
    </div>);
    const radio = view.getByRole('radio');
    expect(radio).toHaveAttribute('id', 'native-radio');
    expect(radio.nextElementSibling).not.toHaveAttribute('id', 'native-radio');
    await view.user.click(view.getByText('Native'));
    expect(radio).toHaveAttribute('aria-checked', 'true');
    // The label's original click and the forwarded native button click bubble;
    // the internal hidden input click does not.
    expect(parent).toHaveBeenCalledTimes(2);
  });

  it('updates native label association when the input id changes, preserving the host', async () => {
    const view = await renderProps((props: { id: string }) => <>
      <label for="a">Label A</label><label for="b">Label B</label>
      <RadioGroup><Radio.Root value="a" id={props.id} /></RadioGroup>
    </>, { id: 'a' });
    const radio = view.getByRole('radio');
    expect(radio).toHaveAccessibleName('Label A');
    const labelA = view.getByText('Label A');
    expect(labelA.id).not.toBe('');
    expect(radio).toHaveAttribute('aria-labelledby', labelA.id);
    await view.setProps({ id: 'b' });
    expect(view.getByRole('radio')).toBe(radio);
    expect(radio).toHaveAccessibleName('Label B');
    const labelB = view.getByText('Label B');
    expect(labelB.id).not.toBe('');
    expect(labelB.id).not.toBe(labelA.id);
    expect(radio).toHaveAttribute('aria-labelledby', labelB.id);
    await view.user.click(view.getByText('Label B'));
    expect(radio).toHaveAttribute('aria-checked', 'true');
  });

  it.each(['disabled', 'readOnly'] as const)('updates %s live and prevents direct input activation', async (mode) => {
    const view = await renderProps((props: { blocked: boolean }) => <RadioGroup>
      <Radio.Root value="a" disabled={mode === 'disabled' && props.blocked} readOnly={mode === 'readOnly' && props.blocked} />
    </RadioGroup>, { blocked: true });
    const radio = view.getByRole('radio');
    await view.user.click(radio.nextElementSibling!);
    expect(radio).toHaveAttribute('aria-checked', 'false');
    await view.setProps({ blocked: false });
    await view.user.click(radio);
    expect(radio).toHaveAttribute('aria-checked', 'true');
  });
});
