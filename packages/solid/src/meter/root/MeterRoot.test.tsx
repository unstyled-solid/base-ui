import { describe, expect, it, vi } from 'vitest';
import { createRenderer, describeConformance } from '../../../test';
import { Meter } from '../index';
import type { MeterRootProps } from './MeterRoot';

const percent = (value: number, locale?: string) => new Intl.NumberFormat(locale, { style: 'percent' }).format(value);
function Fixture(props: MeterRootProps) {
  return <Meter.Root {...props}>
    <Meter.Label>Battery Level</Meter.Label>
    <Meter.Value data-testid="value" />
    <Meter.Track><Meter.Indicator data-testid="indicator" /></Meter.Track>
  </Meter.Root>;
}

describe('Meter.Root', () => {
  const { render, renderProps } = createRenderer();
  describeConformance((props) => <Meter.Root {...props} value={50} />, {
    initialProps: {}, refInstanceof: HTMLDivElement,
  });

  it('has meter semantics, accessible label, hidden presentation content and no progress status', async () => {
    const view = await render(() => <Fixture value={30} />);
    const root = view.getByRole('meter');
    expect(root.tagName).toBe('DIV');
    expect(root).toHaveAccessibleName('Battery Level');
    expect(root).toHaveAttribute('aria-labelledby', view.getByText('Battery Level').id);
    expect(root).toHaveAttribute('aria-valuemin', '0');
    expect(root).toHaveAttribute('aria-valuemax', '100');
    expect(root).toHaveAttribute('aria-valuenow', '30');
    expect(root).toHaveAttribute('aria-valuetext', percent(.3));
    const presentation = root.querySelector('span[role="presentation"]:last-child') as HTMLElement;
    expect(presentation.textContent).toBe('x');
    expect(presentation.style.position).toBe('fixed');
    expect(root).not.toHaveAttribute('data-status');
    expect(root).not.toHaveAttribute('data-progressing');
    expect(Object.keys(Meter).sort()).toEqual(['Indicator', 'Label', 'Root', 'Track', 'Value']);
  });

  it.each([
    { value: 150, min: 0, max: 100, now: 100, fill: 100 },
    { value: -10, min: 0, max: 100, now: 0, fill: 0 },
    { value: NaN, min: 0, max: 100, now: 0, fill: 0 },
    { value: 5, min: 5, max: 5, now: 5, fill: 0 },
    { value: 6, min: 5, max: 5, now: 5, fill: 100 },
    { value: 4, min: 5, max: 5, now: 5, fill: 0 },
    { value: NaN, min: 20, max: 40, now: 20, fill: 0 },
    { value: Infinity, min: 20, max: 40, now: 40, fill: 100 },
    { value: -Infinity, min: 20, max: 40, now: 20, fill: 0 },
    // Infinite bounds can make the raw percentage NaN even when the value is not NaN.
    { value: Infinity, min: 0, max: Infinity, now: Infinity, fill: 0 },
    { value: -Infinity, min: -Infinity, max: 100, now: -Infinity, fill: 0 },
    { value: 30, min: -Infinity, max: Infinity, now: 30, fill: 0 },
    { value: Infinity, min: Infinity, max: Infinity, now: Infinity, fill: 0 },
    { value: .5, min: 0, max: 1, now: .5, fill: 50 },
    { value: 30, min: 20, max: 40, now: 30, fill: 50 },
    { value: 33.333, min: 0, max: 100, now: 33.333, fill: 33.333 },
  ])('normalizes value=$value in [$min,$max]', async ({ value, min, max, now, fill }) => {
    const view = await render(() => <Fixture value={value} min={min} max={max} />);
    expect(view.getByRole('meter')).toHaveAttribute('aria-valuemin', String(min));
    expect(view.getByRole('meter')).toHaveAttribute('aria-valuemax', String(max));
    expect(view.getByRole('meter')).toHaveAttribute('aria-valuenow', String(now));
    expect(view.getByRole('meter')).toHaveAttribute('aria-valuetext', percent(fill / 100));
    expect(view.getByTestId('value').textContent).toBe(percent(fill / 100));
    expect(view.getByTestId('indicator').style.width).toBe(`${fill}%`);
  });

  it('updates range, locale, format and value without replacing any hosts', async () => {
    const view = await renderProps<MeterRootProps>(Fixture, { value: 20, min: 10, max: 30 });
    const root = view.getByRole('meter');
    const value = view.getByTestId('value');
    const indicator = view.getByTestId('indicator');
    expect(root).toHaveAttribute('aria-valuemin', '10');
    expect(root).toHaveAttribute('aria-valuemax', '30');
    expect(root).toHaveAttribute('aria-valuenow', '20');
    expect(root).toHaveAttribute('aria-valuetext', percent(.5));
    expect(value.textContent).toBe(percent(.5));
    expect(indicator.style.width).toBe('50%');
    await view.setProps({ min: 20, max: 60, value: 50 });
    expect(root).toHaveAttribute('aria-valuemin', '20');
    expect(root).toHaveAttribute('aria-valuemax', '60');
    expect(root).toHaveAttribute('aria-valuenow', '50');
    expect(root).toHaveAttribute('aria-valuetext', percent(.75));
    expect(value.textContent).toBe(percent(.75));
    expect(indicator.style.width).toBe('75%');
    await view.setProps({ locale: 'de-DE' });
    expect(value.textContent).toBe(percent(.75, 'de-DE'));
    const format: Intl.NumberFormatOptions = { style: 'currency', currency: 'USD' };
    await view.setProps({ format, value: 150 });
    const expected = new Intl.NumberFormat('de-DE', format).format(60);
    expect(root).toHaveAttribute('aria-valuenow', '60');
    expect(root).toHaveAttribute('aria-valuetext', expected);
    expect(value.textContent).toBe(expected);
    expect(indicator.style.width).toBe('100%');
    await view.setProps({ format: undefined, min: undefined, max: undefined, value: 77 });
    expect(value.textContent).toBe(percent(.77, 'de-DE'));
    expect(view.getByRole('meter')).toBe(root);
    expect(view.getByTestId('value')).toBe(value);
    expect(view.getByTestId('indicator')).toBe(indicator);
  });

  it.each([
    { value: NaN, min: 20, max: 40, now: 20, fill: 0 },
    { value: Infinity, min: 20, max: 40, now: 40, fill: 100 },
    { value: -Infinity, min: 20, max: 40, now: 20, fill: 0 },
    { value: 5, min: 5, max: 5, now: 5, fill: 0 },
    { value: 6, min: 5, max: 5, now: 5, fill: 100 },
    { value: 4, min: 5, max: 5, now: 5, fill: 0 },
    { value: NaN, min: 5, max: 5, now: 5, fill: 0 },
    { value: Infinity, min: 5, max: 5, now: 5, fill: 100 },
    { value: -Infinity, min: 5, max: 5, now: 5, fill: 0 },
  ])('formats the clamped number but passes raw value=$value in [$min,$max] to both callbacks', async ({ value, min, max, now, fill }) => {
    // Derived from MeterRoot's separate raw percentage / NaN value paths, not Progress.
    const format: Intl.NumberFormatOptions = { style: 'currency', currency: 'USD' };
    const formatted = new Intl.NumberFormat('de-DE', format).format(now);
    const spoken = vi.fn((text: string, raw: number) => `${text} (raw: ${raw})`);
    const visible = vi.fn((text: string) => text);
    const view = await render(() => <Meter.Root value={value} min={min} max={max}
      locale="de-DE" format={format} getAriaValueText={spoken}>
      <Meter.Value data-testid="value">{visible}</Meter.Value>
      <Meter.Track><Meter.Indicator data-testid="indicator" /></Meter.Track>
    </Meter.Root>);
    expect(view.getByRole('meter')).toHaveAttribute('aria-valuenow', String(now));
    expect(view.getByRole('meter')).toHaveAttribute('aria-valuetext', `${formatted} (raw: ${value})`);
    expect(view.getByTestId('value').textContent).toBe(formatted);
    expect(view.getByTestId('indicator').style.width).toBe(`${fill}%`);
    expect(spoken).toHaveBeenLastCalledWith(formatted, value);
    expect(visible).toHaveBeenLastCalledWith(formatted, value);
  });

  it('keeps exceptional range transitions reactive on the same hosts', async () => {
    const view = await renderProps<MeterRootProps>(Fixture, { value: 30, min: 20, max: 40 });
    const root = view.getByRole('meter');
    const value = view.getByTestId('value');
    const indicator = view.getByTestId('indicator');
    for (const next of [
      { value: NaN, min: 20, max: 40, now: 20, fill: 0 },
      { value: Infinity, min: 20, max: 40, now: 40, fill: 100 },
      { value: -Infinity, min: 20, max: 40, now: 20, fill: 0 },
      { value: 5, min: 5, max: 5, now: 5, fill: 0 },
      { value: 6, min: 5, max: 5, now: 5, fill: 100 },
      { value: 4, min: 5, max: 5, now: 5, fill: 0 },
      { value: 33.333, min: 0, max: 100, now: 33.333, fill: 33.333 },
    ]) {
      await view.setProps({ value: next.value, min: next.min, max: next.max });
      expect(view.getByRole('meter')).toBe(root);
      expect(view.getByTestId('value')).toBe(value);
      expect(view.getByTestId('indicator')).toBe(indicator);
      expect(root).toHaveAttribute('aria-valuemin', String(next.min));
      expect(root).toHaveAttribute('aria-valuemax', String(next.max));
      expect(root).toHaveAttribute('aria-valuenow', String(next.now));
      expect(root).toHaveAttribute('aria-valuetext', percent(next.fill / 100));
      expect(value.textContent).toBe(percent(next.fill / 100));
      expect(indicator.style.width).toBe(`${next.fill}%`);
    }
  });

  it('uses decimal locale formatting when format is present instead of percentage formatting', async () => {
    const format: Intl.NumberFormatOptions = { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 };
    const view = await render(() => <Fixture value={86.49} locale="de-DE" format={format} />);
    const expected = new Intl.NumberFormat('de-DE', format).format(86.49);
    expect(view.getByTestId('value').textContent).toBe(expected);
    expect(view.getByRole('meter')).toHaveAttribute('aria-valuetext', expected);
  });

  it('defaults localized aria-valuetext to the displayed percentage', async () => {
    const view = await render(() => <Fixture value={30} locale="de-DE" />);
    const root = view.getByRole('meter');
    expect(root).toHaveAttribute('aria-valuetext', percent(.3, 'de-DE'));
    expect(root.getAttribute('aria-valuetext')).toBe(view.getByTestId('value').textContent);
  });

  it('refreshes aria-valuenow, aria-valuetext, value and indicator when value changes', async () => {
    const view = await renderProps<MeterRootProps>(Fixture, { value: 50 });
    const root = view.getByRole('meter');
    const value = view.getByTestId('value');
    const indicator = view.getByTestId('indicator');
    expect(root).toHaveAttribute('aria-valuenow', '50');
    expect(root).toHaveAttribute('aria-valuetext', percent(.5));
    expect(value.textContent).toBe(percent(.5));
    expect(indicator.style.width).toBe('50%');
    await view.setProps({ value: 77 });
    expect(root).toHaveAttribute('aria-valuenow', '77');
    expect(root).toHaveAttribute('aria-valuetext', percent(.77));
    expect(value.textContent).toBe(percent(.77));
    expect(indicator.style.width).toBe('77%');
    expect(view.getByRole('meter')).toBe(root);
    expect(view.getByTestId('value')).toBe(value);
    expect(view.getByTestId('indicator')).toBe(indicator);
  });

  it('uses custom spoken text with formatted and raw values without changing visible text', async () => {
    const formatted = percent(.3);
    const spoken = vi.fn((text: string, raw: number) => `${raw} of 100 (${text})`);
    const view = await render(() => <Fixture value={30} getAriaValueText={spoken} />);
    expect(spoken).toHaveBeenCalledWith(formatted, 30);
    expect(view.getByRole('meter')).toHaveAttribute('aria-valuetext', `30 of 100 (${formatted})`);
    expect(view.getByTestId('value').textContent).toBe(formatted);
  });

  it('allows explicit ARIA overrides, including undefined masking the defaults', async () => {
    const view = await renderProps<MeterRootProps>(Fixture, {
      value: 30, 'aria-valuetext': 'spoken override', 'aria-labelledby': 'external-label',
    });
    const root = view.getByRole('meter');
    expect(root).toHaveAttribute('aria-valuetext', 'spoken override');
    expect(root).toHaveAttribute('aria-labelledby', 'external-label');
    expect(view.getByTestId('value').textContent).toBe(percent(.3));
    await view.setProps({ 'aria-valuetext': undefined, 'aria-labelledby': undefined });
    expect(root).not.toHaveAttribute('aria-valuetext');
    expect(root).not.toHaveAttribute('aria-labelledby');
    expect(view.getByTestId('value').textContent).toBe(percent(.3));
  });

  it('uses current aria callbacks with formatted clamped and raw values; explicit ARIA wins', async () => {
    const format: Intl.NumberFormatOptions = { style: 'currency', currency: 'USD' };
    const first = vi.fn((text: string, raw: number) => `${text} raw ${raw}`);
    const view = await renderProps<MeterRootProps>(Fixture, { value: 150, format, getAriaValueText: first });
    const expected = new Intl.NumberFormat(undefined, format).format(100);
    expect(first).toHaveBeenLastCalledWith(expected, 150);
    expect(view.getByRole('meter')).toHaveAttribute('aria-valuetext', `${expected} raw 150`);
    expect(view.getByTestId('value').textContent).toBe(expected);
    expect(view.getByTestId('indicator').style.width).toBe('100%');
    const second = vi.fn((text: string) => `new ${text}`);
    await view.setProps({ value: NaN, min: 20, getAriaValueText: second });
    expect(second).toHaveBeenLastCalledWith(new Intl.NumberFormat(undefined, format).format(20), NaN);
    await view.setProps({ 'aria-valuetext': 'explicit' });
    expect(view.getByRole('meter')).toHaveAttribute('aria-valuetext', 'explicit');
  });
});
