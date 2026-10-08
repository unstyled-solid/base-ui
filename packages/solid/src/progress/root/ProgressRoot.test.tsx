// Source: upstream/base-ui @ 19511bb171f3b360b006c94cf6d07e53cb446505, ProgressRoot.test.tsx.
import { describe, expect, it, vi } from 'vitest';
import type { JSX } from '@solidjs/web';
import { browserCase, createRenderer, describeConformance } from '../../../test';
import { Progress } from '../index';
import type { ProgressRootProps, ProgressRootState } from './ProgressRoot';

const percent = (value: number) => new Intl.NumberFormat(undefined, { style: 'percent' }).format(value);
function Fixture(props: ProgressRootProps) {
  return <Progress.Root {...props}>
    <Progress.Label data-testid="label">Upload progress</Progress.Label>
    <Progress.Value data-testid="value" />
    <Progress.Track data-testid="track"><Progress.Indicator data-testid="indicator" /></Progress.Track>
  </Progress.Root>;
}

describe('Progress.Root', () => {
  const { renderProps, render } = createRenderer();
  // Harness native-event props bridge to Base UI's augmented native-event props.
  describeConformance((props) => <Progress.Root {...props as ProgressRootProps} value={50} />, {
    initialProps: {}, refInstanceof: HTMLDivElement,
  });

  it('exposes source ARIA and the hidden NVDA presentation span', async () => {
    const view = await render(() => <Fixture value={30} />);
    const root = view.getByRole('progressbar');
    expect(root.getAttribute('aria-valuemin')).toBe('0');
    expect(root.getAttribute('aria-valuemax')).toBe('100');
    expect(root.getAttribute('aria-valuenow')).toBe('30');
    expect(root.getAttribute('aria-valuetext')).toBe(percent(.3));
    expect(root.getAttribute('aria-labelledby')).toBe(view.getByTestId('label').id);
    const hidden = root.querySelector('span[role="presentation"]:last-child') as HTMLElement;
    expect(hidden.textContent).toBe('x');
    expect(hidden.style.position).toBe('fixed');
    expect(view.getByTestId('value').getAttribute('aria-hidden')).toBe('true');
  });

  it('synchronizes all five parts through the entire status cycle without replacing hosts', async () => {
    const view = await renderProps<ProgressRootProps>(Fixture, { value: null });
    const root = view.getByRole('progressbar');
    const parts = [root, ...['label', 'value', 'track', 'indicator'].map((id) => view.getByTestId(id))];
    for (const value of [null, 50, 100, null]) {
      await view.setProps({ value });
      const status = value === null ? 'indeterminate' : value === 100 ? 'complete' : 'progressing';
      for (const part of parts) {
        for (const candidate of ['indeterminate', 'progressing', 'complete']) {
          expect(part.hasAttribute(`data-${candidate}`)).toBe(candidate === status);
        }
        expect(part.isConnected).toBe(true);
      }
      expect(view.getByRole('progressbar')).toBe(root);
      expect(root.getAttribute('aria-valuenow')).toBe(value === null ? null : String(value));
      expect(root.getAttribute('aria-valuetext')).toBe(value === null ? 'indeterminate progress' : percent(value / 100));
      expect(view.getByTestId('value').textContent).toBe(value === null ? '' : percent(value / 100));
      if (value === null) expect(view.getByTestId('value')).toBeEmptyDOMElement();
      expect(view.getByTestId('indicator').style.width).toBe(value === null ? '' : `${value}%`);
    }
  });

  it.each([
    [20, 40, 30, 30, 50, 'progressing'],
    [0, 40, 50, 40, 100, 'complete'],
    [0, 40, 45, 40, 100, 'complete'],
    [20, 40, 10, 20, 0, 'progressing'],
    [0, 100, 0, 0, 0, 'progressing'],
    [5, 5, 5, 5, 0, 'complete'],
    [5, 5, 6, 5, 100, 'complete'],
    [5, 5, 4, 5, 0, 'complete'],
  ] as const)('normalizes min=%s max=%s value=%s', async (min, max, value, clamped, percentage, status) => {
    const view = await render(() => <Fixture min={min} max={max} value={value} />);
    const root = view.getByRole('progressbar');
    expect(root.getAttribute('aria-valuenow')).toBe(String(clamped));
    expect(root.getAttribute('aria-valuemin')).toBe(String(min));
    expect(root.getAttribute('aria-valuemax')).toBe(String(max));
    expect(root.getAttribute('aria-valuetext')).toBe(percent(percentage / 100));
    expect(root.hasAttribute(`data-${status}`)).toBe(true);
    expect(view.getByTestId('value').textContent).toBe(percent(percentage / 100));
    expect(view.getByTestId('indicator').style.width).toBe(`${percentage}%`);
  });

  it.each([NaN, Infinity, -Infinity])('keeps non-finite %s indeterminate', async (value) => {
    const view = await render(() => <Fixture value={value} />);
    const root = view.getByRole('progressbar');
    expect(root.hasAttribute('data-indeterminate')).toBe(true);
    expect(root.hasAttribute('aria-valuenow')).toBe(false);
    expect(root.getAttribute('aria-valuetext')).toBe('indeterminate progress');
    expect(view.getByTestId('value').textContent).toBe('');
    expect(view.getByTestId('value')).toBeEmptyDOMElement();
    expect(view.getByTestId('indicator').style.width).toBe('');
  });

  it.each([[50, 40], [10, 20]])('formats clamped %s while passing the raw value', async (value, clamped) => {
    const format: Intl.NumberFormatOptions = { style: 'currency', currency: 'USD' };
    const expected = new Intl.NumberFormat(undefined, format).format(clamped!);
    const callback = vi.fn((text: string, raw: number | null) => `${text} (raw: ${raw})`);
    const view = await render(() => <Fixture value={value!} min={20} max={40} format={format} getAriaValueText={callback} />);
    expect(callback).toHaveBeenLastCalledWith(expected, value);
    expect(view.getByRole('progressbar')).toHaveAttribute('aria-valuenow', String(clamped));
    expect(view.getByTestId('value').textContent).toBe(expected);
    expect(view.getByRole('progressbar').getAttribute('aria-valuetext')).toBe(`${expected} (raw: ${value})`);
  });

  it('updates range, locale, format and the currently invoked ARIA callback together', async () => {
    const callback = vi.fn((text: string, raw: number | null) => `${text}:${raw}`);
    const view = await renderProps<ProgressRootProps>(Fixture, { value: 30, getAriaValueText: callback });
    expect(callback).toHaveBeenLastCalledWith(percent(.3), 30);
    const format: Intl.NumberFormatOptions = { style: 'currency', currency: 'EUR' };
    await view.setProps({ min: 20, max: 25, format, locale: 'de-DE' });
    const expected = new Intl.NumberFormat('de-DE', format).format(25);
    expect(callback).toHaveBeenLastCalledWith(expected, 30);
    expect(view.getByTestId('value').textContent).toBe(expected);
    expect(view.getByTestId('indicator').style.width).toBe('100%');
    const next = vi.fn(() => 'Waiting');
    await view.setProps({ value: null, getAriaValueText: next });
    expect(next).toHaveBeenLastCalledWith('', null);
    expect(view.getByRole('progressbar').getAttribute('aria-valuetext')).toBe('Waiting');
    await view.setProps({ value: 70.51, min: undefined, max: undefined, format: { minimumFractionDigits: 2, maximumFractionDigits: 2 }, getAriaValueText: undefined });
    expect(view.getByTestId('value').textContent).toBe(new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(70.51));
    expect(view.getByRole('progressbar').getAttribute('aria-valuemax')).toBe('100');
  });

  it('allows explicit ARIA overrides', async () => {
    const view = await render(() => <Progress.Root value={30} aria-valuetext="Uploaded" aria-label="Task" />);
    expect(view.getByRole('progressbar').getAttribute('aria-valuetext')).toBe('Uploaded');
  });

  it('updates aria-valuenow from 50 to 77 on the same host', async () => {
    const view = await renderProps<ProgressRootProps>(Fixture, { value: 50 });
    const root = view.getByRole('progressbar');
    await view.setProps({ value: 77 });
    expect(root).toHaveAttribute('aria-valuenow', '77');
    expect(view.getByRole('progressbar')).toBe(root);
  });

  it('receives formatted and raw values through determinate and indeterminate states', async () => {
    const callback = vi.fn((text: string, raw: number | null) => raw == null ? 'Waiting to start' : `${text} uploaded`);
    const view = await renderProps<ProgressRootProps>(Fixture, { value: 30, getAriaValueText: callback });
    const root = view.getByRole('progressbar');
    expect(callback).toHaveBeenLastCalledWith(percent(.3), 30);
    expect(root).toHaveAttribute('aria-valuetext', `${percent(.3)} uploaded`);
    expect(view.getByTestId('value').textContent).toBe(percent(.3));
    await view.setProps({ value: null });
    expect(callback).toHaveBeenLastCalledWith('', null);
    expect(root).toHaveAttribute('aria-valuetext', 'Waiting to start');
    expect(view.getByTestId('value')).toBeEmptyDOMElement();
  });

  it('reflects currency format changes without lagging a commit', async () => {
    const usd: Intl.NumberFormatOptions = { style: 'currency', currency: 'USD' };
    const eur: Intl.NumberFormatOptions = { style: 'currency', currency: 'EUR' };
    const view = await renderProps<ProgressRootProps>(Fixture, { value: 30, format: usd });
    const root = view.getByRole('progressbar');
    const value = view.getByTestId('value');
    const initial = new Intl.NumberFormat(undefined, usd).format(30);
    expect(value.textContent).toBe(initial);
    expect(root).toHaveAttribute('aria-valuetext', initial);
    await view.setProps({ format: eur });
    expect(value.textContent).toBe(new Intl.NumberFormat(undefined, eur).format(30));
    expect(view.getByTestId('value')).toBe(value);
  });

  it.each([null, NaN, Infinity, -Infinity])('passes the original indeterminate value %s to the current ARIA callback', async (value) => {
    const callback = vi.fn((text: string, raw: number | null) => `${text}:${raw}`);
    const view = await renderProps<ProgressRootProps>(Fixture, { value: 30 });
    const root = view.getByRole('progressbar');
    await view.setProps({ value, getAriaValueText: callback });
    expect(callback).toHaveBeenLastCalledWith('', value);
    expect(root).toHaveAttribute('aria-valuetext', `:${value}`);
    expect(root).not.toHaveAttribute('aria-valuenow');
    expect(view.getByTestId('value')).toBeEmptyDOMElement();
    expect(view.getByTestId('indicator').style.width).toBe('');
    await view.setProps({ getAriaValueText: undefined });
    expect(root).toHaveAttribute('aria-valuetext', 'indeterminate progress');
  });

  it('preserves source getter receivers and explicit undefined ARIA overrides', async () => {
    const original = {
      raw: 30,
      name: 'external-label',
      get value() { expect(this).toBe(original); return this.raw; },
      get 'aria-labelledby'() { expect(this).toBe(original); return this.name; },
      get 'aria-valuetext'() { expect(this).toBe(original); return `raw:${this.raw}`; },
    };
    const view = await renderProps<ProgressRootProps>(Fixture, original);
    const root = view.getByRole('progressbar');
    expect(root).toHaveAttribute('aria-valuenow', '30');
    expect(root).toHaveAttribute('aria-labelledby', 'external-label');
    expect(root).toHaveAttribute('aria-valuetext', 'raw:30');
    await view.setProps({ value: 100, 'aria-labelledby': undefined, 'aria-valuetext': undefined });
    expect(root).toHaveAttribute('data-complete');
    expect(root).not.toHaveAttribute('aria-labelledby');
    expect(root).not.toHaveAttribute('aria-valuetext');
    expect(view.getByTestId('value').textContent).toBe(percent(1));
    expect(view.getByRole('progressbar')).toBe(root);
  });

  async function liveCustomHosts() {
    const refs = Array.from({ length: 5 }, () => vi.fn());
    const renders = Array.from({ length: 5 }, () => vi.fn((props: Parameters<NonNullable<ProgressRootProps['render']>>[0], state: ProgressRootState) =>
      <div {...props as JSX.HTMLAttributes<HTMLDivElement>} data-render-status={state.status} />));
    const view = await renderProps<ProgressRootProps>((props) =>
      <Progress.Root {...props} render={renders[0]} ref={refs[0]} class={(state) => state.status}>
        <Progress.Label render={renders[1]} ref={refs[1]} data-testid="label" class={(state) => state.status}>Upload</Progress.Label>
        <Progress.Value render={renders[2]} ref={refs[2]} data-testid="value" class={(state) => state.status} />
        <Progress.Track render={renders[3]} ref={refs[3]} data-testid="track" class={(state) => state.status}>
          <Progress.Indicator render={renders[4]} ref={refs[4]} data-testid="indicator" class={(state) => state.status} />
        </Progress.Track>
        <input data-testid="editor" />
      </Progress.Root>, { value: 30, min: 20, max: 40 });
    const root = view.getByRole('progressbar');
    const parts = [root, ...['label', 'value', 'track', 'indicator'].map((id) => view.getByTestId(id))];
    const hidden = root.querySelector('span[role="presentation"]');
    const editor = view.getByTestId('editor') as HTMLInputElement;
    await view.user.type(editor, 'upload.txt');
    editor.setSelectionRange(2, 7);
    for (const value of [50, null, 10, 40]) {
      await view.setProps({ value });
      const status = value === null ? 'indeterminate' : value >= 40 ? 'complete' : 'progressing';
      parts.forEach((part, index) => {
        expect(refs[index]).toHaveBeenCalledTimes(1);
        expect(refs[index]).toHaveBeenCalledWith(part);
        expect(renders[index]).toHaveBeenCalledTimes(1);
        expect(part).toHaveAttribute(`data-${status}`);
        expect(part).toHaveAttribute('data-render-status', status);
        expect(part).toHaveClass(status);
        expect(part.isConnected).toBe(true);
      });
      expect(view.getByRole('progressbar')).toBe(root);
      expect(root.querySelector('span[role="presentation"]')).toBe(hidden);
      expect(view.getByTestId('editor')).toBe(editor);
      expect(editor).toHaveFocus();
      expect(editor.value).toBe('upload.txt');
      expect([editor.selectionStart, editor.selectionEnd]).toEqual([2, 7]);
      expect(parts[2]!.textContent).toBe(value === null ? '' : percent(value < 20 ? 0 : 1));
      expect(parts[4]!.style.width).toBe(value === null ? '' : value < 20 ? '0%' : '100%');
    }
  }

  it('keeps custom hosts, live state, raw refs and descendant focus/selection through range updates', liveCustomHosts);
  browserCase({ source: 'packages/react/src/progress/root/ProgressRoot.test.tsx',
    case: 'status cycle with custom render hosts and preserved descendant focus/selection',
    environment: 'browser', issue: 'bsolid-browser' }, liveCustomHosts);

  it('keeps state-derived class and style live on the default host', async () => {
    const view = await renderProps<{ value: number | null }>((props) => <Progress.Root value={props.value}
      class={(state) => state.status} style={(state) => ({ opacity: state.status === 'complete' ? 1 : .5 })} />, { value: null });
    const host = view.getByRole('progressbar');
    expect(host.className).toBe('indeterminate');
    await view.setProps({ value: 100 });
    expect(view.getByRole('progressbar')).toBe(host);
    expect(host.className).toBe('complete');
    expect(host.style.opacity).toBe('1');
  });
});
