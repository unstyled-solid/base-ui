import { describe, expect, it, vi } from 'vitest';
import { createRenderer, describeConformance } from '../../../test';
import { Meter } from '../index';
import type { MeterValueProps } from './MeterValue';

describe('Meter.Value', () => {
  const { renderProps } = createRenderer();
  describeConformance((props) => <Meter.Root value={30}><Meter.Value {...props} children={null} /></Meter.Root>, {
    initialProps: {}, refInstanceof: HTMLSpanElement,
  });
  it('renders default/formatted values and invokes the current children callback with raw values', async () => {
    const view = await renderProps<{ value: number; children?: MeterValueProps['children']; format?: Intl.NumberFormatOptions }>((props) =>
      <Meter.Root value={props.value} format={props.format}><Meter.Value data-testid="value" children={props.children} /></Meter.Root>,
    { value: 30 });
    const value = view.getByTestId('value');
    expect(value.tagName).toBe('SPAN');
    expect(value).toHaveAttribute('aria-hidden', 'true');
    expect(value.textContent).toBe(new Intl.NumberFormat(undefined, { style: 'percent' }).format(.3));
    const format: Intl.NumberFormatOptions = { style: 'currency', currency: 'USD' };
    await view.setProps({ format });
    expect(value.textContent).toBe(new Intl.NumberFormat(undefined, format).format(30));
    expect(view.getByRole('meter')).toHaveAttribute('aria-valuetext', new Intl.NumberFormat(undefined, format).format(30));
    const first = vi.fn((text: string, raw: number) => `${text}: ${raw}`);
    await view.setProps({ children: first });
    expect(first).toHaveBeenLastCalledWith(new Intl.NumberFormat(undefined, format).format(30), 30);
    await view.setProps({ value: 150 });
    expect(first).toHaveBeenLastCalledWith(new Intl.NumberFormat(undefined, format).format(100), 150);
    await view.setProps({ value: 30, format: undefined });
    expect(first).toHaveBeenLastCalledWith(new Intl.NumberFormat(undefined, { style: 'percent' }).format(.3), 30);
    await view.setProps({ value: 60 });
    expect(first).toHaveBeenLastCalledWith(new Intl.NumberFormat(undefined, { style: 'percent' }).format(.6), 60);
    const second = vi.fn((text: string) => `next ${text}`);
    await view.setProps({ value: 60, children: second, format: undefined });
    const expected = new Intl.NumberFormat(undefined, { style: 'percent' }).format(.6);
    expect(second).toHaveBeenLastCalledWith(expected, 60);
    expect(value.textContent).toBe(`next ${expected}`);
    expect(view.getByTestId('value')).toBe(value);
  });
});
