import { expect, it, vi } from 'vitest';
import { flush } from 'solid-js';
import { createRenderer, fireEvent, expectType } from '../../test';
import { Slider } from './index';
import type { SliderRootProps, SliderRootChangeEventDetails, SliderRootCommitEventDetails } from './root/SliderRoot';
import type { SliderThumbProps } from './thumb/SliderThumb';
import { FieldRoot } from '../field/root/FieldRoot';

const { render, renderProps } = createRenderer();
// Canonical source: slider/{root,thumb,label,value,control,track}/*.test.tsx.
// React rerenders become renderProps patches; nested input is native, not synthetic.
it('Slider class/style and render-state callbacks remain live on the focused host', async () => {
  const view = await renderProps<SliderRootProps>((props) => <Slider.Root {...props}
    class={(state) => `value-${state.values[0]}`} style={(state) => ({ opacity: state.values[0] / 100 })}
    render={(native, state) => <section {...native} data-testid="root" data-value={state.values[0]} />}>
    <Slider.Thumb />
  </Slider.Root>, { value: 30 });
  const root = view.getByTestId('root'); const input = view.getByRole('slider'); input.focus(); flush();
  await view.setProps({ value: 40 });
  expect(view.getByTestId('root')).toBe(root); expect(input).toHaveFocus();
  expect(root).toHaveClass('value-40'); expect(root.style.opacity).toBe('0.4'); expect(root).toHaveAttribute('data-value', '40');
});
it('Slider defaults and disabled/orientation state propagate to every part', async () => {
  const view = await renderProps<SliderRootProps>((props) => <Slider.Root data-testid="root" {...props}>
    <Slider.Label data-testid="label" /><Slider.Value data-testid="value" />
    <Slider.Control data-testid="control"><Slider.Track data-testid="track"><Slider.Indicator data-testid="indicator" /><Slider.Thumb data-testid="thumb" /></Slider.Track></Slider.Control>
  </Slider.Root>, {});
  const input = view.getByRole('slider');
  expect(input).toHaveAttribute('min', '0'); expect(input).toHaveAttribute('max', '100'); expect(input).toHaveAttribute('step', '1');
  expect(view.getByTestId('control')).not.toHaveAttribute('tabindex'); expect(view.getByTestId('thumb')).not.toHaveAttribute('tabindex');
  input.focus(); flush();
  const blur = vi.spyOn(input, 'blur');
  await view.setProps({ disabled: true, orientation: 'vertical' });
  // Canonical jsdom case asserts the explicit blur call. jsdom keeps disabled
  // controls focused; actual focus removal is retained in the browser case.
  expect(input).toBeDisabled(); expect(blur).toHaveBeenCalled();
  for (const part of ['root', 'label', 'value', 'control', 'track', 'indicator', 'thumb']) {
    expect(view.getByTestId(part)).toHaveAttribute('data-disabled', '');
    expect(view.getByTestId(part)).toHaveAttribute('data-orientation', 'vertical');
  }
});
it('Slider Thumb forwards ARIA to the native input, using getAriaValueText precedence', async () => {
  const view = await renderProps<SliderThumbProps>((props) => <Slider.Root defaultValue={50}><Slider.Control><Slider.Thumb {...props} /></Slider.Control></Slider.Root>, {
    'aria-label': 'Volume', 'aria-describedby': 'description', 'aria-valuetext': 'ignored',
    getAriaValueText: (formatted, value, index) => `${formatted}/${value}/${index}`,
  });
  const input = view.getByRole('slider');
  expect(input).toHaveAttribute('aria-label', 'Volume'); expect(input).toHaveAttribute('aria-describedby', 'description');
  expect(input).toHaveAttribute('aria-valuetext', '50/50/0');
  await view.setProps({ getAriaValueText: null, getAriaLabel: () => 'New label', 'aria-labelledby': 'explicit' });
  expect(input).toHaveAttribute('aria-label', 'New label'); expect(input).toHaveAttribute('aria-labelledby', 'explicit');
  expect(input).toHaveAttribute('aria-valuetext', 'ignored');
});
it('Slider native inputRef and tabIndex remain independent from wrapper refs', async () => {
  const ref = vi.fn(); const inputRef = vi.fn();
  const view = await render(() => <Slider.Root><Slider.Control><Slider.Thumb ref={ref} inputRef={inputRef} tabIndex={-1} /></Slider.Control></Slider.Root>);
  const input = view.getByRole('slider');
  expect(inputRef).toHaveBeenCalledWith(input); expect(ref.mock.calls[0][0]).toBe(input.parentElement);
  expect(input).toHaveAttribute('tabindex', '-1'); expect(input.parentElement).not.toHaveAttribute('tabindex');
});
it('Slider label id follows live root id without replacing the focused native input', async () => {
  const view = await renderProps<SliderRootProps>((props) => <Slider.Root {...props}>
    <Slider.Label data-testid="label">Volume</Slider.Label><Slider.Control><Slider.Thumb /></Slider.Control>
  </Slider.Root>, { id: 'before' });
  const input = view.getByRole('slider'); input.focus(); flush();
  await view.setProps({ id: 'after' });
  expect(view.getByTestId('label')).toHaveAttribute('id', 'after-label');
  expect(view.container.querySelector('[role="group"]')).toHaveAttribute('id', 'after');
  expect(view.container.querySelector('[role="group"]')).toHaveAttribute('aria-labelledby', 'after-label');
  expect(input).toHaveAttribute('aria-labelledby', 'after-label'); expect(view.getByRole('slider')).toBe(input); expect(input).toHaveFocus();
});
it('Slider accessible thumb labels suppress fallback linkage and no label invents no linkage', async () => {
  const view = await render(() => <><Slider.Root defaultValue={[20, 80]}><Slider.Label>Price range</Slider.Label><Slider.Control><Slider.Thumb getAriaLabel={() => 'Minimum price'} /><Slider.Thumb getAriaLabel={() => 'Maximum price'} /></Slider.Control></Slider.Root><Slider.Root><Slider.Thumb aria-label="Volume" /></Slider.Root></>);
  for (const name of ['Minimum price', 'Maximum price', 'Volume']) {
    const input = view.getByRole('slider', { name }); expect(input).toHaveAttribute('aria-label', name); expect(input).not.toHaveAttribute('aria-labelledby');
  }
});
it('Slider single label click focuses its input', async () => {
  const view = await render(() => <Slider.Root><Slider.Label data-testid="label">Volume</Slider.Label><Slider.Control><Slider.Thumb /></Slider.Control></Slider.Root>);
  await view.user.click(view.getByTestId('label')); expect(view.getByRole('slider')).toHaveFocus();
});
it('Slider Label safely handles absence and does not focus arbitrary thumbs in a range', async () => {
  const view = await render(() => <><Slider.Root><Slider.Label data-testid="absent" /><Slider.Control /></Slider.Root>
    <Slider.Root defaultValue={[20, 40]}><Slider.Label data-testid="range" /><Slider.Control><Slider.Thumb index={0} /><Slider.Thumb index={1} /></Slider.Control></Slider.Root></>);
  await view.user.click(view.getByTestId('absent')); await view.user.click(view.getByTestId('range'));
  view.getAllByRole('slider').forEach((input) => expect(input).not.toHaveFocus());
});
it('Slider Value render function reacts to locale and format changes', async () => {
  const children = vi.fn((formatted: readonly string[], values: readonly number[]) => `${formatted.join('/')} (${values.join('/')})`);
  const view = await renderProps<SliderRootProps>((props) => <Slider.Root {...props}><Slider.Value>{children}</Slider.Value></Slider.Root>, { value: [40, 65] });
  await view.setProps({ locale: 'de-DE', format: { style: 'currency', currency: 'EUR' } });
  const formatted = [40, 65].map((value) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value));
  expect(children.mock.lastCall).toEqual([formatted, [40, 65]]);
});
it('Slider does not manufacture values for excess thumbs', async () => {
  const change = vi.fn(); const commit = vi.fn();
  const view = await render(() => <Slider.Root defaultValue={[10, 20]} onValueChange={change} onValueCommitted={commit}>
    <Slider.Control><Slider.Thumb /><Slider.Thumb /><Slider.Thumb /></Slider.Control>
  </Slider.Root>);
  const extra = view.getAllByRole('slider')[2]; extra.focus(); fireEvent.keyDown(extra, { key: 'ArrowRight' }); flush();
  expect(change).not.toHaveBeenCalled(); expect(commit).not.toHaveBeenCalled(); expect(extra).not.toHaveAttribute('aria-valuenow');
});
it.each(['ArrowRight', 'PageUp', 'Enter'])('Slider current key callback is invoked for %s', async (key) => {
  const first = vi.fn(); const second = vi.fn((event) => event.preventBaseUIHandler());
  const view = await renderProps<SliderThumbProps>((props) => <Slider.Root defaultValue={50}><Slider.Thumb {...props} /></Slider.Root>, { onKeyDown: first });
  await view.setProps({ onKeyDown: second }); fireEvent.keyDown(view.getByRole('slider'), { key }); flush();
  expect(first).not.toHaveBeenCalled(); expect(second).toHaveBeenCalledTimes(1);
  expect(view.getByRole('slider')).toHaveAttribute('aria-valuenow', '50');
});
it('Slider input cancellation restores the successful native form value', async () => {
  const view = await render(() => <form><Slider.Root name="volume" defaultValue={50} onValueChange={(_value, details) => details.cancel()}>
    <Slider.Thumb />
  </Slider.Root></form>);
  const input = view.getByRole('slider') as HTMLInputElement;
  fireEvent.input(input, { target: { value: '75' } }); flush();
  expect(input.value).toBe('50');
  expect(new FormData(view.container.querySelector('form')!).get('volume')).toBe('50');
});

// Source Value/Label/Thumb bodies: retain the initial observations as well as
// live updates; a callback replacement case alone does not cover native defaults.
it.each([
  { value: 40, text: '40' },
  { value: [40, 65], text: '40 – 65' },
  { value: [40, 60, 80, 95], text: '40 – 60 – 80 – 95' },
])('Slider Value renders every value $text', async ({ value, text }) => {
  const view = await render(() => <Slider.Root defaultValue={value}><Slider.Value data-testid="output" /></Slider.Root>);
  expect(view.getByTestId('output').textContent).toBe(text);
});
it('Slider Value associates unique nonempty ids with every thumb', async () => {
  const view = await render(() => <Slider.Root defaultValue={[40, 65]}><Slider.Value data-testid="output" />
    <Slider.Control><Slider.Thumb index={0} /><Slider.Thumb index={1} /></Slider.Control></Slider.Root>);
  const ids = view.getAllByRole('slider').map((input) => input.id);
  expect(ids).not.toContain(''); expect(new Set(ids).size).toBe(ids.length);
  expect(view.getByTestId('output')).toHaveAttribute('for', ids.join(' '));
});
it.each([{ value: 40 }, { value: [50, 75] }] as const)('Slider output and thumb formatting stay live for $value', async ({ value }) => {
  const view = await renderProps<SliderRootProps>((props) => <Slider.Root {...props}>
    <Slider.Value data-testid="output" /><Slider.Control><Slider.Thumb index={0} />
      {Array.isArray(value) && <Slider.Thumb index={1} />}</Slider.Control></Slider.Root>, { defaultValue: value });
  const values = typeof value === 'number' ? [value] : value;
  const inputs = view.getAllByRole('slider'); const output = view.getByTestId('output');
  expect(output.textContent).toBe(values.map((v) => new Intl.NumberFormat().format(v)).join(' – '));
  if (values.length === 1) expect(inputs[0]).not.toHaveAttribute('aria-valuetext');
  else inputs.forEach((input, index) => expect(input).toHaveAttribute('aria-valuetext', `${values[index]} ${index ? 'end' : 'start'} range`));
  const format: Intl.NumberFormatOptions = { style: 'currency', currency: 'USD' };
  await view.setProps({ format });
  const formatted = values.map((v) => new Intl.NumberFormat(undefined, format).format(v));
  expect(output.textContent).toBe(formatted.join(' – '));
  inputs.forEach((input, index) => expect(input).toHaveAttribute('aria-valuetext', `${formatted[index]}${values.length > 1 ? ` ${index ? 'end' : 'start'} range` : ''}`));
  expect(view.getByTestId('output')).toBe(output);
});
it.each([{ value: 70.51 }, { value: [24.8, 70.51] }] as const)('Slider locale formats $value', async ({ value }) => {
  const format = { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 } as const;
  const view = await render(() => <Slider.Root value={value} step={0.01} format={format} locale="de-DE"><Slider.Value data-testid="output" /></Slider.Root>);
  expect(view.getByTestId('output').textContent).toBe((typeof value === 'number' ? [value] : value).map((v) => new Intl.NumberFormat('de-DE', format).format(v)).join(' – '));
});
it('Slider Value children receives formatted and raw arrays initially', async () => {
  const children = vi.fn((_formatted: readonly string[], _values: readonly number[]) => null); const format = { style: 'currency', currency: 'USD' } as const;
  await render(() => <Slider.Root defaultValue={[40, 60]} format={format}><Slider.Value>{children}</Slider.Value></Slider.Root>);
  expect(children.mock.lastCall).toEqual([[40, 60].map((v) => new Intl.NumberFormat(undefined, format).format(v)), [40, 60]]);
});
it('Slider Field label focuses the registered input instead of an unrelated range', async () => {
  const view = await render(() => <FieldRoot><Slider.Root defaultValue={50}><Slider.Label data-testid="label">Volume</Slider.Label>
    <Slider.Control><input type="range" aria-label="Unrelated range" /><Slider.Thumb /></Slider.Control></Slider.Root></FieldRoot>);
  await view.user.click(view.getByTestId('label'));
  expect(view.getByRole('slider', { name: 'Volume' })).toHaveFocus();
  expect(view.getByRole('slider', { name: 'Unrelated range' })).not.toHaveFocus();
});
it('Slider Field label without a thumb leaves body focused', async () => {
  const view = await render(() => <FieldRoot><Slider.Root defaultValue={50}><Slider.Label data-testid="label">Volume</Slider.Label><Slider.Control /></Slider.Root></FieldRoot>);
  await view.user.click(view.getByTestId('label')); expect(document.body).toHaveFocus();
});
it.each(['aria-label', 'aria-labelledby', 'aria-describedby', 'aria-valuetext'] as const)('Slider Thumb directly forwards %s', async (attribute) => {
  const view = await render(() => <Slider.Root defaultValue={50}><Slider.Control><Slider.Thumb {...{ [attribute]: 'test' }} /></Slider.Control></Slider.Root>);
  expect(view.getByRole('slider')).toHaveAttribute(attribute, 'test');
});
it.each(['Enter', 'ArrowRight', 'PageUp'])('Slider Thumb forwards unprevented %s once', async (key) => {
  const handler = vi.fn();
  const view = await render(() => <Slider.Root defaultValue={50}><Slider.Control><Slider.Thumb onKeyDown={handler} /></Slider.Control></Slider.Root>);
  const input = view.getByRole('slider'); input.focus();
  await view.user.keyboard(`[${key}]`); expect(handler).toHaveBeenCalledTimes(1);
});
it('Slider Thumb preventDefault prevents keyboard changes', async () => {
  const handler = vi.fn((event: KeyboardEvent) => event.preventDefault());
  const view = await render(() => <Slider.Root defaultValue={50}><Slider.Control><Slider.Thumb onKeyDown={handler} /></Slider.Control></Slider.Root>);
  const input = view.getByRole('slider'); input.focus(); await view.user.keyboard('[ArrowRight]');
  expect(handler).toHaveBeenCalledTimes(1); expect(input).toHaveAttribute('aria-valuenow', '50');
});
it('Slider Thumb input changes clamp once at each bound', async () => {
  const change = vi.fn();
  const view = await render(() => <Slider.Root defaultValue={50} min={40} max={60} onValueChange={change}><Slider.Thumb /></Slider.Root>);
  const input = view.getByRole('slider'); expect(input).toHaveAttribute('aria-valuenow', '50');
  for (const [value, expected, count] of [['30', '40', 1], ['30', '40', 1], ['70', '60', 2], ['70', '60', 2]] as const) {
    fireEvent.input(input, { target: { value } }); await Promise.resolve();
    expect(input).toHaveAttribute('aria-valuenow', expected); expect(change).toHaveBeenCalledTimes(count);
  }
});
it('Slider Thumb handles native input decimal and exponent values', async () => {
  const change = vi.fn();
  const view = await render(() => <Slider.Root defaultValue={50} min={-100} max={100} step={1e-8} onValueChange={change}><Slider.Thumb /></Slider.Root>);
  const input = view.getByRole('slider'); expect(input).toHaveAttribute('step', '1e-8');
  expect(input).toHaveAttribute('aria-valuenow', '50');
  for (const value of ['51.1', '5e-8', '1e-7']) {
    fireEvent.input(input, { target: { value } }); await Promise.resolve(); expect(input).toHaveAttribute('aria-valuenow', value);
  }
});
it('Slider Thumb default tabIndex and removal preserve the native tab sequence', async () => {
  const view = await renderProps<SliderThumbProps>((props) => <Slider.Root defaultValue={50}><Slider.Thumb {...props} data-testid="thumb" /></Slider.Root>, {});
  const input = view.getByRole('slider'); expect(input.tabIndex).toBe(0); expect(view.getByTestId('thumb')).not.toHaveAttribute('tabindex');
  await view.setProps({ tabIndex: -1 }); expect(input.tabIndex).toBe(-1);
  await view.user.keyboard('[Tab]'); expect(document.body).toHaveFocus();
});
it('Slider inputRef supports imperative button focus', async () => {
  let input: HTMLInputElement | null = null;
  const view = await render(() => <><Slider.Root defaultValue={50}><Slider.Thumb inputRef={(node) => { input = node; }} /></Slider.Root>
    <button onClick={() => input?.focus()}>Button</button></>);
  expect(document.body).toHaveFocus(); await view.user.click(view.getByRole('button')); expect(view.getByRole('slider')).toHaveFocus();
});
it('Slider thumb stacking follows last used input after focus leaves', async () => {
  const view = await render(() => <Slider.Root defaultValue={[20, 20]}><Slider.Control><Slider.Thumb data-testid="first" /><Slider.Thumb data-testid="second" /></Slider.Control></Slider.Root>);
  const first = view.getByTestId('first'); const second = view.getByTestId('second');
  expect(first.style.zIndex).toBe(''); expect(second.style.zIndex).toBe('');
  await view.user.keyboard('[Tab]'); expect(view.getAllByRole('slider')[0]).toHaveFocus(); expect(first.style.zIndex).toBe('2');
  await view.user.keyboard('[Tab]'); expect(view.getAllByRole('slider')[1]).toHaveFocus(); expect(second.style.zIndex).toBe('2');
  await view.user.keyboard('[Tab]'); expect(document.body).toHaveFocus(); expect(second.style.zIndex).toBe('1'); expect(first.style.zIndex).toBe('');
});

// Compile-only source SliderRoot.spec.tsx inference cases. Never execute these
// ownerless JSX factories; normal project TypeScript compilation checks them.
function sliderSourceTypeInference() {
  const scalar = 25; const array = [25];
  const fixtures = [
    <Slider.Root value={scalar} onValueChange={(v) => expectType<number, typeof v>(v)} />,
    <Slider.Root defaultValue={25} onValueChange={(v) => expectType<number, typeof v>(v)} />,
    <Slider.Root value={array} onValueChange={(v) => expectType<number[], typeof v>(v)} />,
    <Slider.Root defaultValue={[25]} onValueChange={(v) => expectType<number[], typeof v>(v)} />,
    <Slider.Root value={scalar} onValueCommitted={(v) => expectType<number, typeof v>(v)} />,
    <Slider.Root defaultValue={25} onValueCommitted={(v) => expectType<number, typeof v>(v)} />,
    <Slider.Root value={array} onValueCommitted={(v) => expectType<number[], typeof v>(v)} />,
    <Slider.Root defaultValue={[25]} onValueCommitted={(v) => expectType<number[], typeof v>(v)} />,
    <Slider.Root<number> onValueChange={(v) => expectType<number, typeof v>(v)} />,
    <Slider.Root<number[]> onValueChange={(v) => expectType<number[], typeof v>(v)} />,
    <Slider.Root onValueChange={(v) => expectType<number | readonly number[], typeof v>(v)} onValueCommitted={(v) => expectType<number | readonly number[], typeof v>(v)} />,
  ];
  return fixtures;
}
void sliderSourceTypeInference;
function sliderSourceReasonTypes(change: SliderRootChangeEventDetails, commit: SliderRootCommitEventDetails) {
  if (change.reason === 'drag') {
    const event: PointerEvent | TouchEvent = change.event; void event;
    // @ts-expect-error pointer drag does not emit wheel events
    const wheel: WheelEvent = change.event; void wheel;
  }
  if (change.reason === 'keyboard') { const event: KeyboardEvent = change.event; void event; }
  if (change.reason === 'track-press') { const event: PointerEvent | MouseEvent | TouchEvent = change.event; void event; }
  if (commit.reason === 'drag') { const event: PointerEvent | TouchEvent = commit.event; void event; }
  if (commit.reason === 'input-change') { const event: InputEvent | Event = commit.event; void event; }
}
void sliderSourceReasonTypes;
it('Slider Thumb custom native merged refs settle and preserve the input', async () => {
  const ref = vi.fn(); const internal = vi.fn();
  const view = await renderProps<SliderThumbProps>((props) => <Slider.Root defaultValue={50}><Slider.Control><Slider.Thumb {...props} render={(native) => <div {...native} ref={[native.ref, internal]} />} /></Slider.Control></Slider.Root>, { ref });
  const input = view.getByRole('slider'); expect(input).toBeInTheDocument();
  expect(ref).toHaveBeenCalledWith(input.parentElement); expect(internal).toHaveBeenCalledWith(input.parentElement);
  await view.setProps({ class: 'changed' }); expect(view.getByRole('slider')).toBe(input); expect(input.parentElement).toHaveClass('changed');
});
