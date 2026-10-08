// Behavioral fixtures from pinned NumberField Root/Input/Increment/Decrement suites.
import { describe, expect, it, vi } from 'vitest';
import { createSignal, flush } from 'solid-js';
import { createRenderer, fireEvent, screen } from '../../test';
import { NumberFieldRoot as Root } from './root/NumberFieldRoot';
import { NumberFieldGroup as Group } from './group/NumberFieldGroup';
import { NumberFieldInput as Input } from './input/NumberFieldInput';
import type { NumberFieldRootProps, NumberFieldRootChangeEventDetails } from './root/NumberFieldRoot';
import { pasteText } from './utils/testUtils';

const NumberField = { Root, Group, Input };

function Fixture(props: NumberFieldRootProps) {
  return <NumberField.Root {...props}><NumberField.Group><NumberField.Input /></NumberField.Group></NumberField.Root>;
}
const input = () => screen.getByRole('textbox') as HTMLInputElement;
function edit(value: string) { fireEvent.input(input(), { target: { value } }); flush(); }
function key(key: string, options: KeyboardEventInit = {}) { fireEvent.keyDown(input(), { key, ...options }); flush(); }
function blur() { fireEvent.blur(input()); flush(); }

describe('NumberField editing transactions', () => {
  const { render, renderProps } = createRenderer();
  it('source controlled number updates from 1 to 2 and accepts null', async () => {
    const view = await renderProps<NumberFieldRootProps>(Fixture, { value: 1 });
    expect(input()).toHaveValue('1');
    await view.setProps({ value: 2 });
    expect(input()).toHaveValue('2');
    view.unmount();
    await render(() => <Fixture value={null} />);
    expect(input()).toHaveValue('');
  });
  it('source controlled whitespace requests null', async () => {
    const change = vi.fn();
    await render(() => <Fixture value={1} onValueChange={change} />);
    fireEvent.input(input(), { target: { value: '  ' } });
    await Promise.resolve();
    expect(change.mock.calls[0][0]).toBeNull();
  });
  it.each([
    { initial: 1, text: '2', expected: 2 },
    { initial: null, text: '5', expected: 5 },
    { initial: 5, text: '', expected: null },
  ])('source controlled transition $initial to $expected reports once', async ({ initial, text, expected }) => {
    const change = vi.fn();
    await render(() => {
      const [value, setValue] = createSignal<number | null>(initial);
      return <Fixture value={value()} onValueChange={(next) => { change(next); setValue(next); }} />;
    });
    fireEvent.input(input(), { target: { value: text } });
    await Promise.resolve();
    expect(change).toHaveBeenCalledTimes(1);
    expect(change.mock.calls[0][0]).toBe(expected);
  });
  it.each([
    { initial: undefined, text: '12', reason: 'input-change' },
    { initial: 5, text: '', reason: 'input-clear' },
    { initial: 1, text: undefined, reason: 'keyboard' },
  ])('source change reason $reason is reported exactly once', async ({ initial, text, reason }) => {
    const change = vi.fn();
    await render(() => <Fixture defaultValue={initial} onValueChange={change} />);
    if (text === undefined) { input().focus(); fireEvent.keyDown(input(), { key: 'ArrowUp' }); }
    else fireEvent.input(input(), { target: { value: text } });
    await Promise.resolve();
    expect(change).toHaveBeenCalledTimes(1);
    expect(change.mock.calls[0][1].reason).toBe(reason);
  });
  it.each([0.1, 'any'] as const)('source native form validity for step %s', async (step) => {
    await render(() => <form><Fixture name="quantity" min={0} step={step} /><button type="submit">Submit</button></form>);
    fireEvent.input(input(), { target: { value: '0.11' } });
    await Promise.resolve();
    const hidden = document.querySelector<HTMLInputElement>('input[type=number][name=quantity]');
    expect(hidden).not.toBeNull();
    expect(hidden!.validity.stepMismatch).toBe(step !== 'any');
    expect(document.querySelector('form')!.checkValidity()).toBe(step === 'any');
  });
  it('defaults to null, renders a textbox and group, and seeds the closest bound to zero', async () => {
    await render(() => <Fixture min={-10} max={-5} snapOnStep step={2} />);
    expect(input()).toHaveValue('');
    expect(screen.getByRole('group')).toBeInTheDocument();
    key('ArrowUp');
    expect(input()).toHaveValue('-5');
  });
  it.each(['ArrowUp', 'ArrowDown'])('steps %s from numeric precision and does not recommit on blur', async (direction) => {
    const change = vi.fn(); const commit = vi.fn();
    await render(() => <Fixture defaultValue={1.23456} onValueChange={change} onValueCommitted={commit} />);
    blur(); expect(change).not.toHaveBeenCalled();
    key(direction);
    const expected = direction === 'ArrowUp' ? 2.23456 : 0.23456;
    expect(change.mock.lastCall?.[0]).toBe(expected);
    expect(commit.mock.lastCall?.[0]).toBe(expected);
    blur(); expect(commit).toHaveBeenCalledTimes(1);
  });
  it('retains dirty authority through navigation with lagging controlled props', async () => {
    const change = vi.fn(); const commit = vi.fn();
    await render(() => <Fixture value={0} onValueChange={change} onValueCommitted={commit} />);
    edit('1.5'); key('ArrowLeft'); key('ArrowUp');
    expect(change.mock.lastCall?.[0]).toBe(2.5);
    expect(commit.mock.lastCall?.[0]).toBe(2.5);
    expect(input()).toHaveValue('0');
  });
  it('reads current callbacks and cancels keyboard changes without stale commits', async () => {
    const commit = vi.fn();
    const view = await renderProps<NumberFieldRootProps>(Fixture, { value: 0, onValueCommitted: commit });
    key('ArrowUp'); expect(commit.mock.lastCall?.[0]).toBe(1);
    await view.setProps({ value: 10, onValueChange: (_value: number | null, details: NumberFieldRootChangeEventDetails) => details.cancel() });
    key('ArrowUp'); expect(commit).toHaveBeenCalledTimes(1); expect(input()).toHaveValue('10');
  });
  it('preserves partial drafts, rejects invalid characters and commits only parseable text', async () => {
    const change = vi.fn(); const commit = vi.fn();
    await render(() => <Fixture onValueChange={change} onValueCommitted={commit} />);
    edit('-'); expect(input()).toHaveValue('-');
    edit('.'); expect(input()).toHaveValue('.'); blur(); expect(commit).not.toHaveBeenCalled();
    edit('ni'); expect(change).not.toHaveBeenCalled();
    edit('一'); expect(change.mock.lastCall?.[0]).toBe(1);
    blur(); expect(commit.mock.lastCall?.[0]).toBe(1);
  });
  it('commits clamped candidates rather than raw text and supports range validation opt-in', async () => {
    const commit = vi.fn();
    const view = await renderProps<NumberFieldRootProps>(Fixture, { max: 10, name: 'amount', onValueCommitted: commit });
    edit('1000'); blur(); expect(commit.mock.lastCall?.[0]).toBe(10); expect(input()).toHaveValue('10');
    await view.setProps({ allowOutOfRange: true });
    edit('1000'); blur();
    const hidden = document.querySelector<HTMLInputElement>('input[type=number]')!;
    expect(hidden.validity.rangeOverflow).toBe(true);
    key('ArrowUp'); expect(hidden.value).toBe('10');
  });
  it('suppresses no-op commits and canceled blur/clear commits', async () => {
    const commit = vi.fn();
    const view = await renderProps<NumberFieldRootProps>(Fixture, { value: 5, max: 5, onValueCommitted: commit });
    key('ArrowUp'); key('End'); blur(); expect(commit).not.toHaveBeenCalled();
    await view.setProps({ onValueChange: (_value: number | null, details: NumberFieldRootChangeEventDetails) => details.cancel() });
    edit('1.239'); blur(); expect(commit).not.toHaveBeenCalled(); expect(input()).toHaveValue('1.239');
    edit(''); blur(); expect(commit).not.toHaveBeenCalled();
  });
  it('uses modifiers, Home/End and any-step native semantics', async () => {
    const change = vi.fn();
    await render(() => <Fixture defaultValue={0} min={-20} max={20} step="any" onValueChange={change} />);
    key('ArrowUp', { altKey: true }); expect(change.mock.lastCall?.[0]).toBe(0.1);
    key('ArrowUp', { shiftKey: true }); expect(change.mock.lastCall?.[0]).toBe(10.1);
    key('Home'); expect(change.mock.lastCall?.[0]).toBe(-20);
    key('End'); expect(change.mock.lastCall?.[0]).toBe(20);
    edit('0.11'); expect(document.querySelector<HTMLInputElement>('input[type=number]')!.validity.stepMismatch).toBe(false);
  });
  it.each([
    ['de-DE', '1234,5', 1234.5, undefined], ['en-US', '1%2', 0.12, { style: 'percent' }],
    ['en-US', '0.46%', 0.0046, { style: 'percent', maximumFractionDigits: 2, roundingMode: 'floor' }],
    ['en-US', '1.26', 1.5, { minimumFractionDigits: 1, maximumFractionDigits: 1, roundingIncrement: 5 }],
    ['en-US', '12345', 12300, { maximumSignificantDigits: 3 }],
  ] as const)('locale editing %s %s', async (locale, text, expected, format) => {
    const commit = vi.fn();
    await render(() => <Fixture locale={locale} format={format} onValueCommitted={commit} />);
    edit(text); blur(); expect(commit.mock.lastCall?.[0]).toBe(expected);
    expect(input().value).toBe(new Intl.NumberFormat(locale, format).format(expected));
  });
  it('splices pasted text and restores caret; malformed paste is ignored', async () => {
    await render(() => <Fixture defaultValue={123} />);
    input().focus();
    input().setSelectionRange(1, 2);
    pasteText(input(), '9'); flush();
    expect(input()).toHaveValue('193'); expect(input().selectionStart).toBe(2); expect(input().selectionEnd).toBe(2);
    input().select(); pasteText(input(), 'abc'); flush();
    expect(input()).toHaveValue('193');
  });
  it('gates duplicate symbols against selection and passes composition/navigation keys', async () => {
    await render(() => <Fixture defaultValue={-5} />);
    input().focus();
    input().setSelectionRange(2, 2);
    expect(fireEvent.keyDown(input(), { key: '-' })).toBe(false);
    input().setSelectionRange(0, 1);
    expect(fireEvent.keyDown(input(), { key: '-' })).toBe(true);
    for (const name of ['PageUp', 'PageDown', 'Insert', 'Home', 'End', 'F5']) expect(fireEvent.keyDown(input(), { key: name })).toBe(true);
    expect(fireEvent.keyDown(input(), { key: 'a', isComposing: true })).toBe(true);
  });
  it('honors consumer prevention and preserves host identity during locale updates', async () => {
    const commit = vi.fn();
    const view = await renderProps((props: { locale: string }) => <NumberField.Root defaultValue={1000} locale={props.locale} onValueCommitted={commit}>
      <NumberField.Input onKeyDown={(event) => event.preventDefault()} onBlur={(event) => event.preventDefault()} />
    </NumberField.Root>, { locale: 'en-US' });
    const node = input(); key('ArrowUp'); blur(); expect(commit).not.toHaveBeenCalled();
    await view.setProps({ locale: 'de-DE' }); expect(input()).toBe(node);
    expect(node.value).toBe(new Intl.NumberFormat('de-DE').format(1000));
  });
});

describe('NumberField wheel and native form bridge', () => {
  const { render, renderProps } = createRenderer();
  it('publishes accepted native constraints before a same-turn form read', async () => {
    await render(() => <form><Fixture name="amount" min={0} step={0.1} /></form>);
    const hidden = document.querySelector<HTMLInputElement>('input[type=number]')!;
    fireEvent.input(input(), { target: { value: '0.11' } });
    expect(hidden.value).toBe('0.11');
    expect(hidden.validity.stepMismatch).toBe(true);
    expect(new FormData(document.querySelector('form')!).get('amount')).toBe('0.11');
    flush();
  });
  it('requires opt-in and focus, ignores horizontal noise/zoom, commits each effective turn', async () => {
    const commit = vi.fn();
    const view = await renderProps<NumberFieldRootProps>(Fixture, { defaultValue: 5, onValueCommitted: commit });
    input().focus(); fireEvent.wheel(input(), { deltaY: -1 }); flush(); expect(commit).not.toHaveBeenCalled();
    await view.setProps({ allowWheelScrub: true });
    for (const options of [{ deltaX: 100, deltaY: 0.5 }, { deltaY: 1, ctrlKey: true }, { deltaY: 0 }]) {
      expect(fireEvent.wheel(input(), options)).toBe(true);
    }
    expect(fireEvent.wheel(input(), { deltaY: 1, deltaX: -0.5 })).toBe(false); flush();
    expect(commit.mock.lastCall?.[0]).toBe(4);
    fireEvent.wheel(input(), { deltaX: -100, deltaY: 0.5, shiftKey: true }); flush();
    expect(commit.mock.lastCall?.[0]).toBe(14); blur(); expect(commit).toHaveBeenCalledTimes(2);
  });
  it('submits raw numbers to an external form and forwards hidden focus', async () => {
    await render(() => <><form id="number-form" /><Fixture name="amount" form="number-form" defaultValue={54.5} locale="de-DE" format={{ style: 'currency', currency: 'EUR' }} /></>);
    const hidden = document.querySelector<HTMLInputElement>('input[type=number]')!;
    expect(new FormData(document.querySelector('form')!).get('amount')).toBe('54.5');
    hidden.focus(); flush(); expect(input()).toHaveFocus(); expect(input().selectionStart).toBe(input().value.length);
    fireEvent.change(hidden, { target: { value: '7' } }); flush(); expect(hidden.value).toBe('7');
  });
  it.each(['disabled', 'readOnly'] as const)('ignores autofill and wheel when %s', async (state) => {
    const change = vi.fn();
    await render(() => <Fixture {...{ [state]: true }} defaultValue={1} allowWheelScrub onValueChange={change} />);
    fireEvent.change(document.querySelector('input[type=number]')!, { target: { value: '42' } });
    fireEvent.wheel(input(), { deltaY: -1 }); flush(); expect(change).not.toHaveBeenCalled();
  });
});
