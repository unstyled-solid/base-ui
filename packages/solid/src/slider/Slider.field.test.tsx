import { expect, it, vi } from 'vitest';
import { flush, createSignal } from 'solid-js';
import { createRenderer, fireEvent, browserCase } from '../../test';
import { FieldRoot } from '../field/root/FieldRoot';
import { FieldError } from '../field/error/FieldError';
import { FieldLabel } from '../field/label/FieldLabel';
import { FieldDescription } from '../field/description/FieldDescription';
import { Form } from '../form/Form';
import { Slider } from './index';
const { render, renderProps } = createRenderer();

it('Slider registers its clamped logical value and restores array dirty state', async () => {
  const view = await render(() => <FieldRoot name="field-name" data-testid="field">
    <Slider.Root data-testid="root" defaultValue={[20, 40]} name="ignored"><Slider.Control><Slider.Thumb index={0} /><Slider.Thumb index={1} /></Slider.Control></Slider.Root>
  </FieldRoot>);
  const [, input] = view.getAllByRole('slider');
  expect(input).toHaveAttribute('name', 'field-name');
  expect(view.getByTestId('root')).not.toHaveAttribute('data-dirty');
  fireEvent.change(input, { target: { value: '50' } }); flush();
  expect(view.getByTestId('field')).toHaveAttribute('data-dirty');
  expect(view.getByTestId('root')).toHaveAttribute('data-dirty', '');
  fireEvent.change(input, { target: { value: '40' } }); flush();
  expect(view.getByTestId('field')).not.toHaveAttribute('data-dirty');
  expect(view.getByTestId('root')).not.toHaveAttribute('data-dirty');
});
it('Slider inherits Field disabled/name and propagates touched/dirty/focused', async () => {
  const view = await renderProps((props: { disabled: boolean }) => <FieldRoot name="field-slider" disabled={props.disabled}>
    <Slider.Root data-testid="root"><Slider.Control><Slider.Thumb /></Slider.Control></Slider.Root>
  </FieldRoot>, { disabled: false });
  const root = view.getByTestId('root'); const input = view.getByRole('slider');
  expect(input).toHaveAttribute('name', 'field-slider'); expect(root).not.toHaveAttribute('data-focused'); expect(root).not.toHaveAttribute('data-dirty');
  input.focus(); await Promise.resolve(); expect(root).toHaveAttribute('data-focused');
  input.blur(); await Promise.resolve(); expect(root).not.toHaveAttribute('data-focused'); expect(root).toHaveAttribute('data-touched');
  fireEvent.input(input, { target: { value: 'value' } });
  await vi.waitFor(() => expect(root).toHaveAttribute('data-dirty'));
  await view.setProps({ disabled: true }); expect(root).toHaveAttribute('data-disabled', '');
});
for (const change of ['disable', 'remove'] as const) it(`Slider removes field focus ownership when the focused thumb is ${change}d`, async () => {
  const view = await renderProps((props: { disabled: boolean; mounted: boolean }) => <FieldRoot data-testid="field"><Slider.Root defaultValue={20}>
    <Slider.Control>{props.mounted && <Slider.Thumb disabled={props.disabled} />}</Slider.Control></Slider.Root></FieldRoot>, { disabled: false, mounted: true });
  view.getByRole('slider').focus(); await Promise.resolve(); expect(view.getByTestId('field')).toHaveAttribute('data-focused');
  await view.setProps(change === 'disable' ? { disabled: true } : { mounted: false }); expect(view.getByTestId('field')).not.toHaveAttribute('data-focused');
});
it('Slider sibling disable then removal leaves the other input focused', async () => {
  const view = await renderProps((props: { disabled: boolean; mounted: boolean }) => <FieldRoot data-testid="field"><Slider.Root defaultValue={[20, 40]}>
    <Slider.Control>{props.mounted && <Slider.Thumb index={0} disabled={props.disabled} />}<Slider.Thumb index={1} /></Slider.Control></Slider.Root></FieldRoot>, { disabled: false, mounted: true });
  view.getAllByRole('slider')[1].focus(); await Promise.resolve(); expect(view.getByTestId('field')).toHaveAttribute('data-focused');
  await view.setProps({ disabled: true }); expect(view.getByTestId('field')).toHaveAttribute('data-focused');
  await view.setProps({ mounted: false }); expect(view.getByTestId('field')).toHaveAttribute('data-focused');
});
it('Slider clears external Form errors on a keyboard change', async () => {
  const view = await render(() => <Form errors={{ test: 'test' }}><FieldRoot name="test">
    <Slider.Root defaultValue={50}><Slider.Thumb /></Slider.Root><FieldError data-testid="error" />
  </FieldRoot></Form>);
  const input = view.getByRole('slider'); expect(input).toHaveAttribute('aria-invalid', 'true'); expect(view.getByTestId('error')).toHaveTextContent('test');
  await view.user.keyboard('[Tab]'); expect(input).toHaveFocus(); await view.user.keyboard('{Shift>}[ArrowRight]{/Shift}');
  await vi.waitFor(() => expect(input).not.toHaveAttribute('aria-invalid'));
  await vi.waitFor(() => expect(view.queryByTestId('error')).toBeNull());
});
it('Slider onSubmit validation revalidates after the first invalid submit', async () => {
  const view = await render(() => <Form><FieldRoot validate={(value) => Number(value) > 90 ? 'error' : null}>
    <Slider.Root defaultValue={99} data-testid="root"><Slider.Control><Slider.Thumb data-testid="thumb" /></Slider.Control></Slider.Root><FieldError data-testid="error" />
  </FieldRoot><button type="submit">submit</button></Form>);
  const input = view.getByRole('slider'); const root = view.getByTestId('root'); const thumb = view.getByTestId('thumb');
  expect(input).not.toHaveAttribute('aria-invalid'); expect(view.queryByTestId('error')).toBeNull();
  fireEvent.input(input, { target: { value: '98' } }); await Promise.resolve(); expect(input).not.toHaveAttribute('aria-invalid'); expect(view.queryByTestId('error')).toBeNull();
  await view.user.click(view.getByRole('button'));
  await vi.waitFor(() => expect(input).toHaveAttribute('aria-invalid', 'true'));
  expect(view.queryByTestId('error')).not.toBeNull(); expect(root).toHaveAttribute('data-invalid'); expect(thumb).toHaveAttribute('data-invalid');
  for (const value of ['10', '94', '12']) {
    fireEvent.input(input, { target: { value } });
    if (value === '94') { await vi.waitFor(() => expect(input).toHaveAttribute('aria-invalid', 'true')); expect(view.queryByTestId('error')).not.toBeNull(); }
    else {
      await vi.waitFor(() => expect(input).not.toHaveAttribute('aria-invalid'));
      await vi.waitFor(() => expect(view.queryByTestId('error')).toBeNull());
      expect(root).not.toHaveAttribute('data-invalid'); expect(input).not.toHaveAttribute('data-invalid'); expect(root).toHaveAttribute('data-valid'); expect(thumb).toHaveAttribute('data-valid');
    }
  }
});
it('Slider invalid submit focuses the native range input', async () => {
  const view = await render(() => <Form><FieldRoot validate={() => 'error'}><Slider.Root defaultValue={50}><Slider.Thumb /></Slider.Root></FieldRoot><button type="submit">submit</button></Form>);
  const input = view.getByRole('slider'); expect(input).not.toHaveFocus(); await view.user.click(view.getByRole('button')); expect(input).toHaveFocus();
});
it('Slider onBlur validation waits for blur', async () => {
  const view = await render(() => <FieldRoot validationMode="onBlur" validate={(value) => Number(value) > 1 ? 'error' : null}><Slider.Root><Slider.Thumb /></Slider.Root><FieldError /></FieldRoot>);
  const input = view.getByRole('slider'); expect(input).not.toHaveAttribute('aria-invalid');
  fireEvent.input(input, { target: { value: '2' } }); await Promise.resolve(); expect(input).not.toHaveAttribute('aria-invalid');
  fireEvent.blur(input); await vi.waitFor(() => expect(input).toHaveAttribute('aria-invalid', 'true'));
});
it('Slider blur validation receives the initial single-element array', async () => {
  const validate = vi.fn((_value: unknown) => null);
  const view = await render(() => <FieldRoot validationMode="onBlur" validate={validate}><Slider.Root defaultValue={[25]}><Slider.Thumb /></Slider.Root></FieldRoot>);
  fireEvent.blur(view.getByRole('slider')); await vi.waitFor(() => expect(validate).toHaveBeenCalledTimes(1)); expect(validate.mock.calls[0][0]).toEqual([25]);
});
it.each([{ value: 0 }, { value: [0, 5] }] as const)('Slider user changes validate $value once', async ({ value }) => {
  const validate = vi.fn((_value: unknown) => null);
  const view = await render(() => <FieldRoot validationMode="onChange" validate={validate}><Slider.Root defaultValue={value}><Slider.Control><Slider.Thumb index={0} />{Array.isArray(value) && <Slider.Thumb index={1} />}</Slider.Control></Slider.Root></FieldRoot>);
  await view.user.keyboard('[Tab]'); expect(view.getAllByRole('slider')[0]).toHaveFocus(); await view.user.keyboard('[ArrowRight]');
  await vi.waitFor(() => expect(validate).toHaveBeenCalledTimes(1)); expect(validate.mock.lastCall?.[0]).toEqual(typeof value === 'number' ? 1 : [1, 5]);
});
it('Slider onChange invalidity reflects user and external scalar changes', async () => {
  const validate = vi.fn((value: unknown) => Number(value) === 1 || Number(value) === 5 ? 'error' : null);
  const view = await renderProps((props: { value: number }) => {
    const [value, setValue] = createSignal(() => props.value);
    return <FieldRoot name="volume" validationMode="onChange" validate={validate}><Slider.Root value={value()} onValueChange={setValue}><Slider.Thumb /></Slider.Root></FieldRoot>;
  }, { value: 0 });
  const input = view.getByRole('slider'); expect(input).not.toHaveAttribute('aria-invalid');
  fireEvent.input(input, { target: { value: '1' } }); await vi.waitFor(() => expect(input).toHaveAttribute('aria-invalid', 'true'));
  const count = validate.mock.calls.length; await view.setProps({ value: 5 });
  await vi.waitFor(() => expect(validate).toHaveBeenCalledTimes(count + 1)); expect(validate.mock.lastCall?.[0]).toBe(5); expect(input).toHaveAttribute('aria-invalid', 'true');
});
it('Slider controlled scalar external change revalidates once from a valid baseline', async () => {
  const validate = vi.fn((value: unknown) => Number(value) === 5 ? 'error' : null);
  const view = await renderProps((props: { value: number }) => <FieldRoot validationMode="onChange" validate={validate} name="volume"><Slider.Root value={props.value}><Slider.Thumb /></Slider.Root></FieldRoot>, { value: 0 });
  const input = view.getByRole('slider'); expect(input).not.toHaveAttribute('aria-invalid'); const count = validate.mock.calls.length;
  await view.setProps({ value: 5 }); await vi.waitFor(() => expect(validate).toHaveBeenCalledTimes(count + 1)); expect(validate.mock.lastCall?.[0]).toBe(5); expect(input).toHaveAttribute('aria-invalid', 'true');
});
it('Slider range validation on submit receives the array and invokes native onSubmit', async () => {
  const validate = vi.fn((_value: unknown) => null); const submit = vi.fn((event: SubmitEvent) => event.preventDefault());
  const view = await render(() => <Form onSubmit={submit}><FieldRoot validate={validate}><Slider.Root defaultValue={[5, 12]}><Slider.Thumb index={0} /><Slider.Thumb index={1} /></Slider.Root><FieldError /></FieldRoot><button type="submit">submit</button></Form>);
  await view.user.click(view.getByRole('button')); expect(validate).toHaveBeenCalledTimes(1); expect(validate.mock.calls[0][0]).toEqual([5, 12]); expect(submit).toHaveBeenCalledTimes(1);
});
it('Slider default validation mode does not validate a track press', async () => {
  const validate = vi.fn((_value: unknown) => null);
  const view = await render(() => <Form><FieldRoot validate={validate}><Slider.Root defaultValue={50}><Slider.Control data-testid="control"><Slider.Thumb /></Slider.Control></Slider.Root></FieldRoot><button type="submit">submit</button></Form>);
  expect(validate).not.toHaveBeenCalled(); const control = view.getByTestId('control');
  fireEvent.pointerDown(control, { buttons: 1, clientX: 10 }); fireEvent.pointerUp(control, { buttons: 1, clientX: 30 }); await Promise.resolve(); expect(validate).not.toHaveBeenCalled();
});
it('Slider Field label and description preserve supplied relationships', async () => {
  const view = await render(() => <FieldRoot><Slider.Root data-testid="root" aria-describedby="external-description"><Slider.Thumb /></Slider.Root>
    <FieldLabel data-testid="label">Volume</FieldLabel><FieldDescription data-testid="description" /></FieldRoot>);
  expect(view.getByRole('slider')).toHaveAttribute('aria-labelledby', view.getByTestId('label').id);
  expect(view.getByTestId('root')).toHaveAttribute('aria-describedby', `external-description ${view.getByTestId('description').id}`);
});
for (const value of [25, [25, 50]] as const) browserCase({ source: 'packages/react/src/slider/root/SliderRoot.test.tsx', case: `Form submission native values ${JSON.stringify(value)}`, environment: 'browser', issue: 'bsolid-browser' }, async () => {
  const submit = vi.fn((event: SubmitEvent & { currentTarget: HTMLFormElement }) => { event.preventDefault(); return new FormData(event.currentTarget).getAll('slider'); });
  const view = await render(() => <Form onSubmit={submit}><FieldRoot name="slider"><Slider.Root defaultValue={value} format={{ style: 'currency', currency: 'USD' }}><Slider.Control><Slider.Thumb />{Array.isArray(value) && <Slider.Thumb />}</Slider.Control></Slider.Root></FieldRoot><button type="submit">Submit</button></Form>);
  await view.user.click(view.getByRole('button')); expect(submit).toHaveBeenCalledTimes(1); expect(submit.mock.results[0].value).toEqual(typeof value === 'number' ? ['25'] : ['25', '50']);
});
for (const value of [5, [19, 41]] as const) browserCase({ source: 'packages/react/src/slider/root/SliderRoot.test.tsx', case: `Form logical clamped values ${JSON.stringify(value)}`, environment: 'browser', issue: 'bsolid-browser' }, async () => {
  const submit = vi.fn();
  const view = await render(() => <Form onFormSubmit={submit}><FieldRoot name="slider"><Slider.Root defaultValue={value} min={20} max={40}><Slider.Control><Slider.Thumb />{Array.isArray(value) && <Slider.Thumb />}</Slider.Control></Slider.Root></FieldRoot><button type="submit">Submit</button></Form>);
  await view.user.click(view.getByRole('button')); expect(submit).toHaveBeenCalledWith({ slider: typeof value === 'number' ? 20 : [20, 40] }, expect.objectContaining({ reason: 'none' }));
});
browserCase({ source: 'packages/react/src/slider/root/SliderRoot.test.tsx', case: 'submits to external form', environment: 'browser', issue: 'bsolid-browser' }, async () => {
  const submit = vi.fn((event: SubmitEvent & { currentTarget: HTMLFormElement }) => { event.preventDefault(); return new FormData(event.currentTarget).get('slider'); });
  const view = await render(() => <><form id="external-form" onSubmit={submit}><button type="submit">Submit</button></form><Slider.Root name="slider" form="external-form" defaultValue={25}><Slider.Thumb /></Slider.Root></>);
  await view.user.click(view.getByRole('button')); expect(submit).toHaveBeenCalledTimes(1); expect(submit.mock.results[0].value).toBe('25');
});
for (const change of ['disable', 'remove'] as const) {
  it(`Slider preserves sibling focus ownership when the former focused thumb is ${change}d`, async () => {
    const view = await renderProps((props: { disabled: boolean; mounted: boolean }) => <FieldRoot data-testid="field">
      <Slider.Root defaultValue={[20, 40]}><Slider.Control>
        {props.mounted && <Slider.Thumb index={0} disabled={props.disabled} />}<Slider.Thumb index={1} />
      </Slider.Control></Slider.Root>
    </FieldRoot>, { disabled: false, mounted: true });
    const [first, second] = view.getAllByRole('slider'); first.focus(); second.focus(); flush();
    await view.setProps(change === 'disable' ? { disabled: true } : { mounted: false });
    expect(second).toHaveFocus(); expect(view.getByTestId('field')).toHaveAttribute('data-focused');
  });
}
it('Slider controlled external changes validate once with a logical range value', async () => {
  const validate = vi.fn((_value: unknown) => null);
  const view = await renderProps((props: { value: readonly number[] }) => <FieldRoot validationMode="onChange" validate={validate}>
    <Slider.Root value={props.value}><Slider.Control><Slider.Thumb index={0} /><Slider.Thumb index={1} /></Slider.Control></Slider.Root>
  </FieldRoot>, { value: [20, 40] });
  validate.mockClear(); await view.setProps({ value: [30, 50] });
  await vi.waitFor(() => expect(validate).toHaveBeenCalledTimes(1));
  expect(validate.mock.calls[0][0]).toEqual([30, 50]);
});
it('Slider blur carries single-element array shape and same-turn accepted keyboard proposals', async () => {
  const validate = vi.fn((_value: unknown) => null);
  const view = await render(() => <><FieldRoot validationMode="onBlur" validate={validate}>
    <Slider.Root defaultValue={[25]}><Slider.Thumb /></Slider.Root>
  </FieldRoot><button>Outside</button></>);
  const input = view.getByRole('slider'); input.focus(); flush(); validate.mockClear();
  fireEvent.keyDown(input, { key: 'ArrowRight' }); view.getByRole('button').focus(); flush();
  await vi.waitFor(() => expect(validate).toHaveBeenCalledTimes(1));
  expect(validate.mock.calls[0][0]).toEqual([26]);
});
