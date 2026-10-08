// Source: pinned ProgressValue.test.tsx.
import { describe, expect, it, vi } from 'vitest';
import { createRenderer, describeConformance } from '../../../test';
import { Progress } from '../index';
import type { ProgressValueProps } from './ProgressValue';
import type { ProgressRootProps } from '../root/ProgressRoot';

describe('Progress.Value', () => {
  const { renderProps } = createRenderer();
  it('renders source value 30 without children with default and currency formats', async () => {
    const view = await renderProps<ProgressRootProps>((props) => <Progress.Root {...props}><Progress.Value data-testid="value" /></Progress.Root>, { value: 30 });
    const value = view.getByTestId('value');
    expect(value.textContent).toBe((.3).toLocaleString(undefined, { style: 'percent' }));
    const format: Intl.NumberFormatOptions = { style: 'currency', currency: 'USD' };
    await view.setProps({ format });
    expect(value.textContent).toBe(new Intl.NumberFormat(undefined, format).format(30));
  });
  describeConformance((props) => <Progress.Root value={40}><Progress.Value {...props as ProgressValueProps} /></Progress.Root>, {
    initialProps: {}, refInstanceof: HTMLSpanElement,
  });
  it('uses the latest children callback with formatted and raw values, including indeterminate values', async () => {
    const children = vi.fn((text: string | null, raw: number | null) => `${text}:${raw}`);
    const format: Intl.NumberFormatOptions = { style: 'currency', currency: 'USD' };
    const view = await renderProps<ProgressRootProps & { callback: ProgressValueProps['children'] }>((props) =>
      <Progress.Root value={props.value} format={props.format} locale={props.locale}>
        <Progress.Value data-testid="value">{props.callback}</Progress.Value>
      </Progress.Root>, { value: 30, format, callback: children });
    expect(children).toHaveBeenLastCalledWith(new Intl.NumberFormat(undefined, format).format(30), 30);
    const host = view.getByTestId('value');
    for (const value of [null, NaN, Infinity, -Infinity]) {
      await view.setProps({ value });
      expect(children).toHaveBeenLastCalledWith('indeterminate', value);
    }
    const next = vi.fn((text: string | null) => text);
    await view.setProps({ value: 40, callback: next, locale: 'de-DE', format: { style: 'decimal' } });
    expect(next).toHaveBeenLastCalledWith(new Intl.NumberFormat('de-DE').format(40), 40);
    expect(view.getByTestId('value')).toBe(host);
    await view.setProps({ callback: null });
    expect(host.textContent).toBe(new Intl.NumberFormat('de-DE').format(40));
  });

  it('renders children callback JSX using clamped text and the original out-of-range value', async () => {
    const format: Intl.NumberFormatOptions = { style: 'currency', currency: 'USD' };
    const callback = vi.fn((text: string | null, raw: number | null) => <b>{text} (raw: {raw})</b>);
    const view = await renderProps<ProgressRootProps>((props) =>
      <Progress.Root {...props}>
        <Progress.Value data-testid="value">{callback}</Progress.Value>
      </Progress.Root>, { value: 50, min: 20, max: 40, format });
    const host = view.getByTestId('value');
    for (const value of [50, 10, null]) {
      await view.setProps({ value });
      const text = value === null ? 'indeterminate' : new Intl.NumberFormat(undefined, format).format(value === 50 ? 40 : 20);
      expect(callback).toHaveBeenLastCalledWith(text, value);
      expect(host.querySelector('b')?.textContent).toBe(`${text} (raw: ${value ?? ''})`);
      expect(view.getByTestId('value')).toBe(host);
      expect(host).toHaveAttribute('aria-hidden', 'true');
    }
  });
});
