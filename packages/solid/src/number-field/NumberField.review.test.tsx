// Source-derived DOM regressions: pinned Root, Input, stepper and ScrubArea suites.
import { describe, expect, it, vi } from 'vitest';
import { createSignal, flush } from 'solid-js';
import { advanceTimers, createRenderer, expectDiagnostic, fireEvent, firePointer, flushMicrotasks, screen } from '../../test';
import { NumberField } from './index';
import type { NumberFieldRootProps } from './root/NumberFieldRoot';
import { expectCursorTransform, settleScrubRelease, mockPointerLockPolicy } from './utils/testUtils';
import { fireTouch, touchPoint } from '../../test/touch';

function Fixture(props: NumberFieldRootProps) {
  return <NumberField.Root {...props} data-testid="root">
    <NumberField.Input /><NumberField.Increment /><NumberField.Decrement />
    <NumberField.ScrubArea data-testid="area"><NumberField.ScrubAreaCursor data-testid="cursor" /></NumberField.ScrubArea>
  </NumberField.Root>;
}
const input = () => screen.getByRole<HTMLInputElement>('textbox');
const hidden = () => document.querySelector<HTMLInputElement>('input[type=number]')!;
function edit(text: string) { fireEvent.input(input(), { target: { value: text } }); flush(); }

describe('NumberField source-first review: numeric/text and native DOM', () => {
  const { render, renderProps } = createRenderer();
  it.each([
    ['parseable drafts', undefined, undefined, ['1', '12', '12.', '12.a'], [1, 12, 12], 12],
    ['sign and decimal partials', undefined, undefined, ['-', '.', '0.', '-1', '-1.5'], [0, -1, -1.5], -1.5],
    ['grouping', 'en-US', undefined, ['1', '1,', '1,2', '1,23', '1,234'], [1, 1, 12, 123, 1234], 1234],
    ['locale decimal', 'de-DE', undefined, ['1', '1,', '1,5'], [1, 1, 1.5], 1.5],
    ['percent', 'en-US', { style: 'percent' }, ['12', '12%'], [0.12, 0.12], 0.12],
    ['unit', 'en-US', { style: 'unit', unit: 'kilometer-per-hour' }, ['1 km/h', '12 km/h'], [1, 12], 12],
  ] as const)('preserves every callback in the source %s sequence', async (_, locale, format, drafts, expected, committed) => {
    const change = vi.fn(); const commit = vi.fn();
    await render(() => <Fixture min={-10} locale={locale} format={format} onValueChange={change} onValueCommitted={commit} />);
    for (const value of drafts) {
      fireEvent.input(input(), { target: { value } });
      await Promise.resolve();
    }
    expect(change.mock.calls.map(([value]) => value)).toEqual(expected);
    expect(commit).not.toHaveBeenCalled();
    fireEvent.blur(input()); await Promise.resolve();
    expect(commit).toHaveBeenCalledTimes(1);
    expect(commit.mock.lastCall?.[0]).toBe(committed);
  });
  it.each([
    ['Persian', '۱۲۳'], ['Arabic-Indic', '١٢٣'], ['fullwidth', '１２３'], ['Han', '一二三'],
  ] as const)('pastes source %s numerals with the input-paste reason', async (_, text) => {
    const change = vi.fn();
    await render(() => <Fixture defaultValue={0} onValueChange={change} />);
    input().focus(); input().select();
    const paste = new Event('paste', { bubbles: true, cancelable: true });
    Object.defineProperty(paste, 'clipboardData', { value: { getData: (type: string) => type === 'text/plain' ? text : '' } });
    fireEvent(input(), paste); await Promise.resolve();
    expect(input()).toHaveValue(text);
    expect(change.mock.lastCall?.[0]).toBe(123);
    expect(change.mock.lastCall?.[1].reason).toBe('input-paste');
  });
  it('reports one unchanged input-paste when clipboard data is missing', async () => {
    const change = vi.fn();
    await render(() => <Fixture defaultValue={12} onValueChange={change} />);
    input().focus(); input().setSelectionRange(2, 2);
    const paste = new Event('paste', { bubbles: true, cancelable: true });
    Object.defineProperty(paste, 'clipboardData', { value: null });
    fireEvent(input(), paste); await Promise.resolve();
    expect(input()).toHaveValue('12');
    expect(change).toHaveBeenCalledTimes(1);
    expect(change.mock.calls[0][0]).toBe(12);
    expect(change.mock.calls[0][1].reason).toBe('input-paste');
  });
  it('retains the initial uncontrolled number and delegates live default-change diagnostics to the shared model', async () => {
    const view = await renderProps<NumberFieldRootProps>(Fixture, { defaultValue: 1 });
    await expectDiagnostic({ message: /changing the default value state of an uncontrolled NumberField after being initialized/, count: 1 },
      () => view.setProps({ defaultValue: 5 }));
    expect(input()).toHaveValue('1');
    fireEvent.click(screen.getByLabelText('Increase')); flush();
    expect(hidden().valueAsNumber).toBe(2);
  });
  it.each([
    ['Persian', '۱۲٬۳۴۵٫۶۷', 12345.67], ['fullwidth', '１，２３４．５６', 1234.56],
    ['Han', '一二三', 123], ['trailing minus', '1234−', -1234],
  ] as const)('edits and submits %s numerals with separate display authority', async (_, text, value) => {
    const commit = vi.fn();
    await render(() => <form><Fixture name="amount" onValueCommitted={commit} /></form>);
    edit(text);
    expect(input().value).toBe(text);
    expect(hidden().valueAsNumber).toBe(value);
    expect(new FormData(document.querySelector('form')!).get('amount')).toBe(String(value));
    fireEvent.blur(input()); flush();
    expect(commit.mock.lastCall?.[0]).toBe(value);
    expect(input().value).toBe(new Intl.NumberFormat().format(value));
  });
  it.each([
    ['pt-BR', { style: 'currency', currency: 'BRL' }, 'R$ 1.234,567', 1234.567],
    ['en-US', { style: 'unit', unit: 'kilometer-per-hour' }, '12 km/h', 12],
    ['en-US', { notation: 'scientific' }, '5E\u200E-1', 0.5],
  ] as const)('accepts multi-character locale decorations %s %s', async (locale, format, text, value) => {
    const change = vi.fn();
    await render(() => <Fixture locale={locale} format={format} onValueChange={change} />);
    edit(text);
    expect(input().value).toBe(text);
    expect(change.mock.lastCall?.[0]).toBe(value);
    fireEvent.blur(input()); flush();
    expect(input().value).toBe(new Intl.NumberFormat(locale, format).format(value));
  });
  it('rejects nonnumeric IME drafts, permits composition keys and accepts final Han numerals', async () => {
    const change = vi.fn(); const commit = vi.fn();
    await render(() => <Fixture onValueChange={change} onValueCommitted={commit} />);
    fireEvent.compositionStart(input());
    const compositionKey = new KeyboardEvent('keydown', { key: 'n', bubbles: true, cancelable: true });
    Object.defineProperty(compositionKey, 'which', { value: 229 });
    expect(fireEvent(input(), compositionKey)).toBe(true);
    edit('n'); edit('ni'); fireEvent.compositionEnd(input());
    expect(input()).toHaveValue(''); expect(change).not.toHaveBeenCalled();
    edit('一'); fireEvent.blur(input()); flush();
    expect(commit.mock.lastCall?.[0]).toBe(1);
  });
  it('does not normalize malformed or overflowing drafts on blur', async () => {
    const change = vi.fn(); const commit = vi.fn();
    await render(() => <Fixture format={{ style: 'percent' }} onValueChange={change} onValueCommitted={commit} />);
    const overflow = new Intl.NumberFormat(undefined, { style: 'percent' }).format(Number.MAX_VALUE);
    edit(overflow); fireEvent.blur(input()); flush();
    expect(input().value).toBe(overflow);
    expect(change).not.toHaveBeenCalled(); expect(commit).not.toHaveBeenCalled();
  });
  it('preserves canceled blur text across unrelated prop updates', async () => {
    const commit = vi.fn();
    const view = await renderProps<NumberFieldRootProps>(Fixture, {
      value: 0, format: { maximumFractionDigits: 2 }, onValueCommitted: commit,
      onValueChange: (_value, details) => details.cancel(),
    });
    edit('1.239'); fireEvent.blur(input()); flush();
    await view.setProps({ required: true });
    expect(input()).toHaveValue('1.239'); expect(commit).not.toHaveBeenCalled();
    await view.setProps({ value: 5 });
    expect(input()).toHaveValue('5');
  });
  it.each(['Increase', 'Decrease'])('steps %s from dirty controlled text and cancels subsequent requests', async (label) => {
    const change = vi.fn(); const commit = vi.fn();
    const view = await renderProps<NumberFieldRootProps>(Fixture, { value: 0, onValueChange: change, onValueCommitted: commit });
    edit('1.5'); fireEvent.keyDown(input(), { key: 'ArrowLeft' });
    fireEvent.click(screen.getByLabelText(label)); flush();
    expect(change.mock.lastCall?.[0]).toBe(label === 'Increase' ? 2.5 : 0.5);
    expect(commit).toHaveBeenCalledTimes(1);
    await view.setProps({ value: 10, onValueChange: (_value, details) => details.cancel() });
    fireEvent.click(screen.getByLabelText(label)); flush();
    expect(commit).toHaveBeenCalledTimes(1); expect(input()).toHaveValue('10');
  });
  it('keeps vetoed dirty sync and step text while reporting both numeric proposals', async () => {
    const change = vi.fn((_value, details) => details.cancel()); const commit = vi.fn();
    await render(() => <Fixture defaultValue={0} onValueChange={change} onValueCommitted={commit} />);
    edit('100'); fireEvent.click(screen.getByLabelText('Increase')); flush();
    expect(change.mock.calls.map(([value]) => value)).toEqual([100, 100, 1]);
    expect(input()).toHaveValue('100'); expect(commit).not.toHaveBeenCalled();
  });
  it('commits the requested blur number while restoring authoritative controlled display when the parent does not mirror it', async () => {
    const commit = vi.fn();
    await render(() => <Fixture value={0} onValueCommitted={commit} />);
    edit('5.10'); expect(input()).toHaveValue('5.10');
    fireEvent.blur(input()); flush();
    expect(commit.mock.lastCall?.[0]).toBe(5.1);
    expect(hidden().valueAsNumber).toBe(0);
    expect(input()).toHaveValue('0');
  });
  it('emits source-ordered wheel change/commit and suppresses canceled and boundary turns', async () => {
    const calls: string[] = [];
    const view = await renderProps<NumberFieldRootProps>(Fixture, {
      defaultValue: 4, max: 5, allowWheelScrub: true,
      onValueChange: (value, details) => calls.push(`change:${value}:${details.reason}`),
      onValueCommitted: (value, details) => calls.push(`commit:${value}:${details.reason}`),
    });
    input().focus(); fireEvent.wheel(input(), { deltaY: -1 }); flush();
    expect(calls).toEqual(['change:5:wheel', 'commit:5:wheel']);
    fireEvent.wheel(input(), { deltaY: -1 }); flush();
    await view.setProps({ onValueChange: (_value, details) => details.cancel() });
    fireEvent.wheel(input(), { deltaY: 1 }); fireEvent.blur(input()); flush();
    expect(calls).toHaveLength(2); expect(input()).toHaveValue('5');
  });
  it('handles the native input/change autofill sequence exactly once', async () => {
    const change = vi.fn();
    await render(() => <form><Fixture name="amount" onValueChange={change} /></form>);
    fireEvent.input(hidden(), { target: { value: '42' } }); flush();
    expect(input()).toHaveValue('42');
    expect(change.mock.lastCall?.[1].reason).toBe('none');
    fireEvent.change(hidden()); flush();
    expect(change).toHaveBeenCalledTimes(1);
    expect(new FormData(hidden().form!).get('amount')).toBe('42');
  });
  it.each([
    ['en-US', '1.239', { maximumFractionDigits: 2, roundingMode: 'floor' }, 1.23],
    ['fr-FR', '1,239', { maximumFractionDigits: 2, roundingMode: 'floor' }, 1.23],
    ['ar-EG', '١٫٢٣٩', { maximumFractionDigits: 2, roundingMode: 'floor' }, 1.23],
    ['en-US', '1.26', { minimumFractionDigits: 1, maximumFractionDigits: 1, roundingIncrement: 5 }, 1.5],
    ['en-US', '12345', { maximumSignificantDigits: 3, roundingMode: 'floor' }, 12300],
    ['en-US', '0.0001234%', { style: 'percent', maximumSignificantDigits: 2 }, 0.0000012],
    ['en-US', '0.46%', { style: 'percent', maximumFractionDigits: 16, roundingMode: 'floor' }, 0.0046],
    ['tr-TR', '%1,23', { style: 'percent', maximumFractionDigits: 2 }, 0.0123],
    ['en-US', '1.239%', { style: 'unit', unit: 'percent', maximumFractionDigits: 2, roundingMode: 'floor' }, 1.23],
  ] as const)('rounds and commits locale %s draft %s through a real controlled parent', async (locale, text, format, expected) => {
    const change = vi.fn(); const commit = vi.fn();
    await render(() => {
      const [value, setValue] = createSignal<number | null>(null);
      return <Fixture value={value()} locale={locale} format={format}
        onValueChange={(next) => { change(next); setValue(next); }} onValueCommitted={commit} />;
    });
    edit(text); fireEvent.blur(input()); flush();
    expect(change.mock.lastCall?.[0]).toBe(expected);
    expect(commit.mock.lastCall?.[0]).toBe(expected);
    expect(hidden().valueAsNumber).toBe(expected);
    expect(input().value).toBe(new Intl.NumberFormat(locale, format).format(expected));
  });
  it.each(['Increase', 'Decrease'])('keeps tiny %s steps and full numeric precision through no-edit blur cycles', async (label) => {
    const change = vi.fn(); const commit = vi.fn();
    await render(() => <Fixture defaultValue={1.234567890123456} step={0.0001} onValueChange={change} onValueCommitted={commit} />);
    input().focus(); input().blur(); flush();
    expect(change).not.toHaveBeenCalled(); expect(commit).not.toHaveBeenCalled();
    fireEvent.click(screen.getByLabelText(label)); flush();
    const expected = label === 'Increase' ? 1.234667890123456 : 1.234467890123456;
    // Gecko's native valueAsNumber rounds this decimal to 15 significant digits.
    // Keep raw submission and model/callback precision exact independently.
    const nativeNumber = document.createElement('input'); nativeNumber.type = 'number'; nativeNumber.value = String(expected);
    expect(hidden().value).toBe(String(expected));
    expect(hidden().valueAsNumber).toBe(nativeNumber.valueAsNumber);
    expect(commit.mock.lastCall?.[0]).toBe(expected);
    fireEvent.blur(input()); flush(); expect(commit).toHaveBeenCalledTimes(1);
  });
  it('preserves consumer-selected focus ranges on hidden focus and mouse stepper focus', async () => {
    const selections: (number | null)[][] = [];
    await render(() => <NumberField.Root defaultValue={100}>
      <NumberField.Input onFocus={(event) => {
        event.currentTarget.select();
        selections.push([event.currentTarget.selectionStart, event.currentTarget.selectionEnd]);
      }} /><NumberField.Increment />
    </NumberField.Root>);
    hidden().focus(); flush();
    expect(input()).toHaveFocus(); expect(input().selectionStart).toBe(0); expect(input().selectionEnd).toBe(3);
    input().blur(); flush();
    firePointer.down(screen.getByLabelText('Increase'), { pointerType: 'mouse', timeStamp: 1 }); flush();
    expect(input()).toHaveFocus(); expect(selections).toEqual([[0, 3], [0, 3]]);
    expect(input()).toHaveValue('101');
    firePointer.up(screen.getByLabelText('Increase'), { pointerType: 'mouse', timeStamp: 2 }); flush();
  });
  it('separates native preventDefault, preventBaseUIHandler and change cancellation', async () => {
    const change = vi.fn(); const commit = vi.fn();
    await render(() => <NumberField.Root defaultValue={1} onValueChange={change} onValueCommitted={commit}>
      <NumberField.Input onKeyDown={(event) => event.preventBaseUIHandler()} />
    </NumberField.Root>);
    const event = new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true, cancelable: true });
    input().dispatchEvent(event); flush();
    expect(event.defaultPrevented).toBe(false); expect(change).not.toHaveBeenCalled(); expect(commit).not.toHaveBeenCalled();
  });
  it('supports non-native stepper button keyboard semantics through the shared button API', async () => {
    const commit = vi.fn();
    await render(() => <NumberField.Root defaultValue={0} onValueCommitted={commit}>
      <NumberField.Input /><NumberField.Increment nativeButton={false} render={(props) => <span {...props} />} />
    </NumberField.Root>);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('tabindex', '-1');
    fireEvent.keyDown(button, { key: 'Enter' }); flush();
    expect(input()).toHaveValue('1');
    fireEvent.keyDown(button, { key: ' ' }); fireEvent.keyUp(button, { key: ' ' }); flush();
    expect(input()).toHaveValue('2'); expect(commit).toHaveBeenCalledTimes(2);
  });
});

describe('NumberField source-first review: current shared gesture engines', () => {
  const { render, renderProps } = createRenderer();
  it.each(['Increase', 'Decrease'])('holds %s to the bound and commits exactly once on window release', async (label) => {
    vi.useFakeTimers();
    try {
      const commit = vi.fn();
      const view = await render(() => <Fixture defaultValue={0} min={-2} max={2} onValueCommitted={commit} />);
      firePointer.down(screen.getByLabelText(label), { pointerType: 'mouse', timeStamp: 1 }); flush();
      await advanceTimers(520);
      expect(hidden().valueAsNumber).toBe(label === 'Increase' ? 2 : -2);
      expect(commit).not.toHaveBeenCalled();
      fireEvent(window, new PointerEvent('pointerup', { pointerType: 'mouse', bubbles: true })); flush();
      expect(commit).toHaveBeenCalledTimes(1);
      expect(commit.mock.lastCall?.[0]).toBe(label === 'Increase' ? 2 : -2);
      view.unmount();
    } finally { vi.useRealTimers(); }
  });
  it('clears touch-settle timers on quick release and lets the compatibility click step once', async () => {
    vi.useFakeTimers();
    try {
      const commit = vi.fn();
      const view = await render(() => <Fixture defaultValue={0} onValueCommitted={commit} />);
      const button = screen.getByLabelText('Increase');
      fireEvent.touchStart(button); firePointer.down(button, { pointerType: 'touch', timeStamp: 1 });
      firePointer.up(button, { pointerType: 'touch', timeStamp: 2 }); fireEvent.touchEnd(button);
      fireEvent.click(button, { detail: 1 }); flush();
      await advanceTimers(500);
      expect(input()).toHaveValue('1'); expect(commit).toHaveBeenCalledTimes(1);
      view.unmount();
    } finally { vi.useRealTimers(); }
  });
  it.each(['touch', 'pen'])('settles a %s hold without focusing, and skips its compatibility click', async (pointerType) => {
    vi.useFakeTimers();
    try {
      const commit = vi.fn();
      const view = await render(() => <Fixture defaultValue={0} onValueCommitted={commit} />);
      const button = screen.getByLabelText('Increase');
      fireEvent.touchStart(button); firePointer.down(button, { pointerType, timeStamp: 1 }); flush();
      expect(input()).not.toHaveFocus(); expect(input()).toHaveValue('0');
      await advanceTimers(50); expect(input()).toHaveValue('1');
      await advanceTimers(520); expect(input()).toHaveValue('3');
      firePointer.up(button, { pointerType, timeStamp: 600 }); fireEvent.touchEnd(button);
      fireEvent.click(button, { detail: 1 }); flush();
      expect(input()).toHaveValue('3'); expect(commit).toHaveBeenCalledTimes(1);
      view.unmount();
    } finally { vi.useRealTimers(); }
  });
  it('treats three small touch moves as a tap and a large move as scrolling', async () => {
    vi.useFakeTimers();
    try {
      const view = await render(() => <Fixture defaultValue={0} />);
      const button = screen.getByLabelText('Increase');
      fireEvent.touchStart(button); firePointer.down(button, { pointerType: 'touch', clientX: 0, timeStamp: 1 });
      for (let x = 1; x <= 3; x++) firePointer.move(button, { pointerType: 'touch', clientX: x, timeStamp: x + 1 });
      await advanceTimers(450); expect(input()).toHaveValue('0');
      firePointer.up(button, { pointerType: 'touch', timeStamp: 460 }); fireEvent.touchEnd(button);
      fireEvent.click(button, { detail: 1 }); flush(); expect(input()).toHaveValue('1');
      fireEvent.touchStart(button); firePointer.down(button, { pointerType: 'touch', timeStamp: 500 });
      firePointer.move(button, { pointerType: 'touch', clientY: 20, timeStamp: 510 });
      await advanceTimers(500); expect(input()).toHaveValue('1');
      firePointer.up(button, { pointerType: 'touch', timeStamp: 1100 }); fireEvent.touchEnd(button);
      view.unmount();
    } finally { vi.useRealTimers(); }
  });
  it('cancels a touch press compatibility click when disabled before settling', async () => {
    vi.useFakeTimers();
    try {
      const view = await renderProps<NumberFieldRootProps>(Fixture, { defaultValue: 0 });
      const button = screen.getByLabelText('Increase');
      fireEvent.touchStart(button); firePointer.down(button, { pointerType: 'touch', timeStamp: 1 });
      await view.setProps({ disabled: true }); await view.setProps({ disabled: false });
      firePointer.up(button, { pointerType: 'touch', timeStamp: 2 }); fireEvent.touchEnd(button);
      fireEvent.mouseEnter(button); fireEvent.click(button, { detail: 1 }); flush();
      await advanceTimers(500); expect(input()).toHaveValue('0');
      view.unmount();
    } finally { vi.useRealTimers(); }
  });
  it('stops hold repetition on local mouseup when an ancestor stops pointerup propagation', async () => {
    vi.useFakeTimers();
    try {
      const view = await render(() => <div onPointerUp={(event) => event.stopPropagation()}><Fixture defaultValue={0} /></div>);
      const button = screen.getByLabelText('Increase');
      firePointer.down(button, { pointerType: 'mouse', timeStamp: 1 }); flush();
      firePointer.up(button, { pointerType: 'mouse', timeStamp: 2 }); fireEvent.mouseUp(button);
      await advanceTimers(520); expect(input()).toHaveValue('1');
      view.unmount();
    } finally { vi.useRealTimers(); }
  });
  it('uses the current numeric value on canceled first hold ticks after an invalid dirty draft', async () => {
    const commit = vi.fn(); let cancel = false;
    const view = await renderProps<NumberFieldRootProps>(Fixture, {
      value: 0, onValueCommitted: commit, onValueChange: (_value, details) => { if (cancel) details.cancel(); },
    });
    fireEvent.click(screen.getByLabelText('Increase')); flush();
    await view.setProps({ value: 10 }); edit('-'); cancel = true;
    firePointer.down(screen.getByLabelText('Increase'), { pointerType: 'mouse', timeStamp: 1 });
    firePointer.up(screen.getByLabelText('Increase'), { pointerType: 'mouse', timeStamp: 2 }); flush();
    expect(commit).toHaveBeenCalledTimes(2); expect(commit.mock.lastCall?.[0]).toBe(10);
  });
  it('matches scrub cumulative threshold, direction, modifiers and one final commit', async () => {
    const commit = vi.fn();
    await render(() => <NumberField.Root defaultValue={0} min={-20} max={20} onValueCommitted={commit}>
      <NumberField.Input /><NumberField.ScrubArea data-testid="area" pixelSensitivity={5} direction="vertical" />
    </NumberField.Root>);
    const area = screen.getByTestId('area');
    firePointer.down(area, { pointerType: 'touch', timeStamp: 1 }); flush();
    firePointer.move(area, { movementX: 10, timeStamp: 2 }); flush(); expect(input()).toHaveValue('0');
    firePointer.move(area, { movementY: -4, timeStamp: 3 }); flush(); expect(input()).toHaveValue('0');
    firePointer.move(area, { movementY: -1, timeStamp: 4 }); flush(); expect(input()).toHaveValue('1');
    firePointer.move(area, { movementY: -5, shiftKey: true, timeStamp: 5 }); flush(); expect(input()).toHaveValue('20');
    firePointer.move(area, { movementY: 5, altKey: true, timeStamp: 6 }); flush(); expect(input()).toHaveValue('19.5');
    expect(commit).not.toHaveBeenCalled(); firePointer.up(area, { timeStamp: 7 }); flush();
    await settleScrubRelease();
    expect(commit).toHaveBeenCalledTimes(1); expect(commit.mock.lastCall?.[0]).toBe(19.5);
    firePointer.move(area, { movementY: 10, timeStamp: 8 }); flush(); expect(input()).toHaveValue('19.5');
  });
  it('keeps touch pinch gestures native and replays a soft mouse click on its original child target', async () => {
    const click = vi.fn(); const original = document.body.requestPointerLock;
    document.body.requestPointerLock = vi.fn().mockResolvedValue(undefined);
    try {
      await render(() => <NumberField.Root><NumberField.Input /><NumberField.ScrubArea data-testid="area">
        <span data-testid="label" onClick={click}>Amount</span>
      </NumberField.ScrubArea></NumberField.Root>);
      const area = screen.getByTestId('area'); const label = screen.getByTestId('label');
      const createTouch = (identifier: number) => touchPoint(area, 0, 0, identifier);
      expect(fireTouch(area, 'touchstart', [createTouch(1), createTouch(2)])).toBe(true);
      expect(fireTouch(area, 'touchstart', [createTouch(1)])).toBe(false);
      firePointer.down(label, { pointerType: 'mouse', timeStamp: 1 }); flush();
      firePointer.up(label, { pointerType: 'mouse', timeStamp: 2 }); flush();
      await settleScrubRelease();
      expect(click).toHaveBeenCalledTimes(1);
    } finally { document.body.requestPointerLock = original; }
  });
  it('captures window scrub movement and release even when an ancestor stops propagation', async () => {
    const commit = vi.fn();
    await render(() => <div onPointerMove={(event) => event.stopPropagation()} onPointerUp={(event) => event.stopPropagation()}>
      <Fixture defaultValue={0} onValueCommitted={commit} />
    </div>);
    const area = screen.getByTestId('area');
    firePointer.down(area, { pointerType: 'touch', timeStamp: 1 }); flush();
    const movement = new PointerEvent('pointermove', { pointerType: 'touch', movementX: 10, bubbles: true });
    Object.defineProperty(movement, 'timeStamp', { value: 2 });
    fireEvent(window, movement); flush();
    expect(input()).toHaveValue('10');
    firePointer.move(area, { pointerType: 'touch', movementX: 5, timeStamp: 3 }); flush();
    expect(input()).toHaveValue('15');
    firePointer.up(area, { pointerType: 'touch', timeStamp: 4 }); flush();
    await settleScrubRelease();
    expect(commit.mock.lastCall?.[0]).toBe(15);
    expect(screen.getByTestId('root')).not.toHaveAttribute('data-scrubbing');
  });
  it('cancels scrubbing on pointercancel and disabled updates without a final commit', async () => {
    const commit = vi.fn();
    const view = await renderProps<NumberFieldRootProps>(Fixture, { defaultValue: 0, onValueCommitted: commit });
    const area = screen.getByTestId('area');
    firePointer.down(area, { pointerType: 'touch', timeStamp: 1 }); flush();
    firePointer.move(area, { pointerType: 'touch', movementX: 2, timeStamp: 2 }); flush();
    const cancellation = new PointerEvent('pointercancel', { pointerType: 'touch', bubbles: true });
    Object.defineProperty(cancellation, 'timeStamp', { value: 3 });
    fireEvent(area, cancellation); flush();
    expect(input()).toHaveValue('2'); expect(commit).not.toHaveBeenCalled();
    firePointer.down(area, { pointerType: 'touch', timeStamp: 4 }); flush();
    await view.setProps({ disabled: true });
    firePointer.up(area, { pointerType: 'touch', timeStamp: 5 }); flush();
    expect(commit).not.toHaveBeenCalled();
    expect(screen.getByTestId('root')).not.toHaveAttribute('data-scrubbing');
  });
  it('initializes and wraps the virtual cursor using its actual element size and viewport scale', async () => {
    const policy = mockPointerLockPolicy();
    const lock = document.body.requestPointerLock;
    document.body.requestPointerLock = vi.fn().mockResolvedValue(undefined);
    try {
      await render(() => <Fixture defaultValue={0} />);
      firePointer.down(screen.getByTestId('area'), { pointerType: 'mouse', clientX: 20, clientY: 30, timeStamp: 1 });
      await flushMicrotasks();
      const cursor = screen.getByTestId('cursor');
      expectCursorTransform(cursor, 20, 30);
      firePointer.up(screen.getByTestId('area'), { pointerType: 'mouse', timeStamp: 2 }); flush();
      await settleScrubRelease();
      expect(screen.queryByTestId('cursor')).toBeNull();
    } finally { document.body.requestPointerLock = lock; policy.mockRestore(); }
  });
  it('releases a stale pointer lock even after a newer touch gesture ends', async () => {
    const policy = mockPointerLockPolicy();
    let resolve!: () => void;
    const request = document.body.requestPointerLock; const exit = document.exitPointerLock;
    document.body.requestPointerLock = vi.fn(() => new Promise<void>((done) => { resolve = done; }));
    const release = vi.fn(); document.exitPointerLock = release;
    try {
      const commit = vi.fn();
      await render(() => <Fixture defaultValue={0} onValueCommitted={commit} />);
      const area = screen.getByTestId('area');
      firePointer.down(area, { pointerType: 'mouse', timeStamp: 1 }); flush();
      firePointer.up(area, { pointerType: 'mouse', timeStamp: 2 }); flush();
      await settleScrubRelease();
      firePointer.down(area, { pointerType: 'touch', timeStamp: 3 }); flush();
      firePointer.up(area, { pointerType: 'touch', timeStamp: 4 }); flush();
      await settleScrubRelease();
      const releaseCount = release.mock.calls.length;
      resolve(); await flushMicrotasks();
      expect(release).toHaveBeenCalledTimes(releaseCount + 1);
      expect(screen.queryByTestId('cursor')).toBeNull();
      expect(screen.getByTestId('root')).not.toHaveAttribute('data-scrubbing');
      expect(commit).toHaveBeenCalledTimes(2);
    } finally { document.body.requestPointerLock = request; document.exitPointerLock = exit; policy.mockRestore(); }
  });
  it('retains virtual cursor coordinates when a live consumer ref changes mid-scrub', async () => {
    const policy = mockPointerLockPolicy();
    const lock = document.body.requestPointerLock;
    document.body.requestPointerLock = vi.fn().mockResolvedValue(undefined);
    try {
      const view = await renderProps<{ cursorRef?: (node: HTMLSpanElement) => void }>((props) =>
        <NumberField.Root defaultValue={0}><NumberField.Input />
          <NumberField.ScrubArea data-testid="area" teleportDistance={100}
            style={{ position: 'fixed', left: '0px', top: '0px', width: '50px', height: '50px' }}>
            <NumberField.ScrubAreaCursor data-testid="cursor" ref={props.cursorRef} />
          </NumberField.ScrubArea>
        </NumberField.Root>, {});
      const area = screen.getByTestId('area');
      firePointer.down(area, { pointerType: 'mouse', clientX: 20, clientY: 30, timeStamp: 1 });
      await flushMicrotasks();
      const cursor = screen.getByTestId('cursor');
      firePointer.move(area, { pointerType: 'mouse', movementX: 10, timeStamp: 2 }); flush();
      expectCursorTransform(cursor, 30, 30);
      // A second press can start before RC13 removes the prior cursor host.
      firePointer.down(area, { pointerType: 'mouse', clientX: 5, clientY: 6, timeStamp: 3 }); flush();
      expectCursorTransform(cursor, 5, 6);
      await flushMicrotasks();
      firePointer.move(area, { pointerType: 'mouse', movementX: 10, timeStamp: 4 }); flush();
      expectCursorTransform(cursor, 15, 6);
      const ref = vi.fn(); await view.setProps({ cursorRef: ref });
      expect(screen.getByTestId('cursor')).toBe(cursor);
      expectCursorTransform(cursor, 15, 6);
      firePointer.up(area, { pointerType: 'mouse', timeStamp: 5 }); flush();
      await settleScrubRelease();
    } finally { document.body.requestPointerLock = lock; policy.mockRestore(); }
  });
});
