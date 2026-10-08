import { expect, it, vi } from 'vitest';
import { flush } from 'solid-js';
import { createRenderer, fireEvent, firePointer } from '../../test';
import { Slider } from './index';
import type { SliderRootProps } from './root/SliderRoot';
import type { SliderThumbProps } from './thumb/SliderThumb';

const { render, renderProps } = createRenderer();

it('Slider default part DOM matches the pinned source attributes and native input structure', async () => {
  const view = await render(() => <Slider.Root id="volume" defaultValue={30} data-testid="root">
    <Slider.Label data-testid="label">Volume</Slider.Label><Slider.Value data-testid="value" />
    <Slider.Control data-testid="control"><Slider.Track data-testid="track">
      <Slider.Indicator data-testid="indicator" /><Slider.Thumb data-testid="thumb"><span data-testid="child" /></Slider.Thumb>
    </Slider.Track></Slider.Control>
  </Slider.Root>);
  const attributes = (element: Element) => Object.fromEntries(Array.from(element.attributes)
    .filter(({ name }) => name !== 'data-testid' && name !== 'style').map(({ name, value }) => [name, value]));
  const orientation = { 'data-orientation': 'horizontal' };
  expect(attributes(view.getByTestId('root'))).toEqual({ ...orientation, role: 'group', id: 'volume', 'aria-labelledby': 'volume-label' });
  expect(attributes(view.getByTestId('label'))).toEqual({ ...orientation, id: 'volume-label' });
  const input = view.getByRole('slider') as HTMLInputElement;
  expect(attributes(view.getByTestId('value'))).toEqual({ ...orientation, 'aria-live': 'off', for: input.id });
  for (const part of ['control', 'track', 'indicator']) expect(attributes(view.getByTestId(part))).toEqual(orientation);
  const thumb = view.getByTestId('thumb');
  expect(attributes(thumb)).toEqual({ ...orientation, 'data-index': '0', id: thumb.id });
  expect(thumb.id).not.toBe('');
  expect(input.id).not.toBe('');
  expect(attributes(input)).toEqual({
    'aria-labelledby': 'volume-label', 'aria-orientation': 'horizontal', 'aria-valuenow': '30',
    id: input.id, min: '0', max: '100', step: '1', type: 'range', value: '30',
  });
  expect(Array.from(thumb.children)).toEqual([view.getByTestId('child'), input]);
  expect(view.getByTestId('value').tagName).toBe('OUTPUT');
  for (const part of ['root', 'label', 'control', 'track', 'indicator', 'thumb']) expect(view.getByTestId(part).tagName).toBe('DIV');
  expect(view.getByTestId('track').style.position).toBe('relative');
  expect(thumb.style.insetInlineStart).toBe('30%');
  expect(thumb.style.translate).toBe('-50% -50%');
  expect(view.getByTestId('indicator').style.width).toBe('30%');
});

// React's controlled range value is reflected in both the live property and
// serialized value/defaultValue. Native reset and DOM cloning consume the latter.
it('Slider native value attribute and reset projection follow the published value', async () => {
  const view = await renderProps<SliderRootProps>((props) => <form><Slider.Root {...props} name="volume">
    <Slider.Thumb />
  </Slider.Root></form>, { value: 30 });
  const input = view.getByRole('slider') as HTMLInputElement;
  expect(input).toHaveAttribute('value', '30');
  expect(input.defaultValue).toBe('30');
  await view.setProps({ value: 40 });
  expect(input).toHaveAttribute('value', '40');
  expect(input.defaultValue).toBe('40');
  const form = view.container.querySelector('form')!;
  form.reset();
  expect(input.value).toBe('40');
  expect(new FormData(form).get('volume')).toBe('40');
});

// Source: SliderControl's latestValuesRef and SliderRoot's comparison against
// valueUnwrapped. A published controlled update replaces the comparison baseline,
// while the last accepted interaction value still owns the eventual commit.
it.each([40, 80])('Slider drag reconciles an external scalar value of %s', async (external) => {
  const change = vi.fn();
  const commit = vi.fn();
  const view = await renderProps<SliderRootProps>((props) => <Slider.Root {...props}>
    <Slider.Control data-testid="control"><Slider.Thumb /></Slider.Control>
  </Slider.Root>, { value: 20, onValueChange: change, onValueCommitted: commit });
  const control = view.getByTestId('control');
  vi.spyOn(control, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 100, 10));
  firePointer.down(control, { timeStamp: 1, button: 0, buttons: 1, clientX: 40 });
  flush();
  expect(change).toHaveBeenCalledTimes(1);
  await view.setProps({ value: external });
  firePointer.move(document.body, { timeStamp: 2, buttons: 1, clientX: 40 });
  firePointer.up(document.body, { timeStamp: 3, buttons: 0, clientX: 90 });
  flush();
  expect(change).toHaveBeenCalledTimes(external === 40 ? 1 : 2);
  expect(commit).toHaveBeenCalledExactlyOnceWith(40, expect.objectContaining({ reason: external === 40 ? 'track-press' : 'drag' }));
  expect(view.getByRole('slider')).toHaveAttribute('aria-valuenow', String(external));
});

it('Slider drag does not report a no-op after an external range update', async () => {
  const change = vi.fn();
  const view = await renderProps<SliderRootProps>((props) => <Slider.Root {...props}>
    <Slider.Control data-testid="control"><Slider.Thumb index={0} data-testid="thumb" /><Slider.Thumb index={1} /></Slider.Control>
  </Slider.Root>, { value: [20, 80], onValueChange: change });
  const control = view.getByTestId('control');
  const thumb = view.getByTestId('thumb');
  vi.spyOn(control, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 100, 10));
  vi.spyOn(thumb, 'getBoundingClientRect').mockReturnValue(new DOMRect(10, 0, 20, 10));
  firePointer.down(thumb, { timeStamp: 1, button: 0, buttons: 1, clientX: 20 });
  firePointer.move(document.body, { timeStamp: 2, buttons: 1, clientX: 30 });
  flush();
  await view.setProps({ value: [40, 80] });
  change.mockClear();
  firePointer.move(document.body, { timeStamp: 3, buttons: 1, clientX: 40 });
  firePointer.up(document.body, { timeStamp: 4, buttons: 0, clientX: 40 });
  flush();
  expect(change).not.toHaveBeenCalled();
});

it('Slider controlled drag acceptance does not acknowledge a value the parent rejected', async () => {
  const change = vi.fn();
  const view = await render(() => <Slider.Root value={20} onValueChange={change}>
    <Slider.Control data-testid="control"><Slider.Thumb /></Slider.Control>
  </Slider.Root>);
  const control = view.getByTestId('control');
  vi.spyOn(control, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 100, 10));
  firePointer.down(control, { timeStamp: 1, button: 0, buttons: 1, clientX: 40 });
  await Promise.resolve();
  firePointer.move(document.body, { timeStamp: 2, buttons: 1, clientX: 40 });
  firePointer.up(document.body, { timeStamp: 3, buttons: 0, clientX: 40 });
  flush();
  expect(change.mock.calls.map(([value]) => value)).toEqual([40, 40]);
  expect(view.getByRole('slider')).toHaveAttribute('aria-valuenow', '20');
});

// Source: Thumb.test.tsx focus-visible restoration suppresses internal blur/focus,
// and the user's key callback runs first with the native input currentTarget.
it('Slider focus-visible restoration keeps user focus/blur callbacks quiet', async () => {
  const focus = vi.fn();
  const blur = vi.fn();
  const order: string[] = [];
  const view = await render(() => <Slider.Root defaultValue={40} onValueChange={() => order.push('change')} onValueCommitted={() => order.push('commit')}>
    <Slider.Thumb onFocus={focus} onBlur={blur} onKeyDown={(event) => { expect(event.currentTarget).toBe(input); order.push('key'); }} />
  </Slider.Root>);
  const input = view.getByRole('slider');
  input.focus(); flush();
  vi.spyOn(input, 'matches').mockImplementation((selector) => selector !== ':focus-visible');
  fireEvent.keyDown(input, { key: 'ArrowRight' }); flush();
  expect(focus).toHaveBeenCalledTimes(1);
  expect(blur).not.toHaveBeenCalled();
  expect(input).toHaveFocus();
  expect(order).toEqual(['key', 'change', 'commit']);
});

it('Slider replaces inputRef on the existing native input and detaches on disposal', async () => {
  const before = vi.fn();
  const after = vi.fn();
  const view = await renderProps<SliderThumbProps>((props) => <Slider.Root defaultValue={30}><Slider.Thumb {...props} /></Slider.Root>, { inputRef: before });
  const input = view.getByRole('slider');
  input.focus(); flush();
  await view.setProps({ inputRef: after });
  expect(view.getByRole('slider')).toBe(input);
  expect(input).toHaveFocus();
  expect(before).toHaveBeenLastCalledWith(null);
  expect(after).toHaveBeenLastCalledWith(input);
  view.unmount();
  expect(after).toHaveBeenLastCalledWith(null);
});

it('Slider native controlled input rolls back the form projection when the parent does not acknowledge', async () => {
  const change = vi.fn();
  const view = await render(() => <form><Slider.Root name="volume" value={30} onValueChange={change}><Slider.Thumb /></Slider.Root></form>);
  const input = view.getByRole('slider') as HTMLInputElement;
  fireEvent.input(input, { target: { value: '70' } });
  await Promise.resolve();
  flush();
  expect(change).toHaveBeenCalledExactlyOnceWith(70, expect.objectContaining({ reason: 'input-change' }));
  expect(input.value).toBe('30');
  expect(input).toHaveAttribute('aria-valuenow', '30');
  expect(new FormData(view.container.querySelector('form')!).get('volume')).toBe('30');
});
