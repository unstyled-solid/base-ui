import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createRenderer, expectDiagnostic, fireEvent, screen } from '../../../test';
import { DirectionContext } from '../../internals/direction-context/DirectionContext';
import { OTPField } from '../index';
import { Fixture, focus, input, key, paste, settle, slots, values } from '../OTPField.test-utils';
import { reset } from '../../utils/warn';

// Source: input/OTPFieldInput.test.tsx; per-keystroke onChange is native onInput.
describe('OTPField.Input', () => {
  const { render, renderProps } = createRenderer();
  beforeEach(() => reset());

  it('redirects later empty focus to first empty slot and advances after typing', async () => {
    await render(() => <Fixture defaultValue="12" />);
    expect(slots()).toHaveLength(6);
    await focus(slots()[4]);
    expect(slots()[2]).toHaveFocus();
    await input(slots()[2], '3');
    expect(slots()[3]).toHaveFocus();
    expect(slots().map((node) => node.tabIndex)).toEqual([-1, -1, -1, 0, -1, -1]);
  });

  it.each(['ltr', 'rtl'] as const)('navigates %s arrows and modified boundaries', async (direction) => {
    await render(() => <DirectionContext value={() => direction}><Fixture defaultValue="1234" /></DirectionContext>);
    const previous = direction === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
    const next = direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
    await focus(slots()[1]);
    await key(slots()[1], next);
    expect(slots()[2]).toHaveFocus();
    await key(slots()[2], previous);
    expect(slots()[1]).toHaveFocus();
    for (const modifier of [{ ctrlKey: true }, { metaKey: true }]) {
      await key(slots()[1], previous, modifier);
      expect(slots()[0]).toHaveFocus();
      await key(slots()[0], next, modifier);
      expect(slots()[4]).toHaveFocus();
    }
    await key(slots()[2], previous, { ctrlKey: true, altKey: true });
    expect(slots()[1]).toHaveFocus();
  });

  it.each([['Home', 0], ['End', 4], ['ArrowUp', 0], ['ArrowDown', 4]] as const)('handles %s, cancels native action and stops propagation', async (command, target) => {
    const bubble = vi.fn();
    await render(() => <div onKeyDown={bubble}><Fixture defaultValue="1234" /></div>);
    await focus(slots()[1]);
    expect(await key(slots()[1], command)).toBe(false);
    expect(slots()[target]).toHaveFocus();
    expect(bubble).not.toHaveBeenCalled();
  });

  it.each([['12', 2], ['123456', 5]] as const)('keeps ArrowDown at the end of %s', async (defaultValue, index) => {
    await render(() => <Fixture defaultValue={defaultValue} />);
    await focus(slots()[index]);
    expect(await key(slots()[index], 'ArrowDown')).toBe(false);
    expect(slots()[index]).toHaveFocus();
  });

  it('readOnly keeps navigation while blocking input/paste/delete/backspace', async () => {
    const change = vi.fn();
    await render(() => <Fixture defaultValue="1234" readOnly onValueChange={change} />);
    await focus(slots()[1]);
    expect(screen.getByRole('group')).toHaveAttribute('data-focused');
    await key(slots()[1], 'ArrowRight');
    expect(slots()[2]).toHaveFocus();
    await key(slots()[2], 'Home');
    expect(slots()[0]).toHaveFocus();
    await key(slots()[0], 'End');
    expect(slots()[4]).toHaveFocus();
    await key(slots()[4], 'ArrowUp');
    expect(slots()[0]).toHaveFocus();
    await key(slots()[0], 'ArrowDown');
    expect(slots()[4]).toHaveFocus();
    await focus(slots()[1]);
    await key(slots()[1], 'Delete');
    expect(values()).toBe('1234');
    expect(slots()[1]).toHaveFocus();
    await key(slots()[1], 'Backspace');
    expect(values()).toBe('1234');
    expect(slots()[1]).toHaveFocus();
    await paste(slots()[1], '99');
    expect(values()).toBe('1234');
    expect(slots()[1]).toHaveFocus();
    await input(slots()[1], '9');
    expect(values()).toBe('1234');
    expect(change).not.toHaveBeenCalled();
    slots().forEach((node) => expect(node).toHaveAttribute('data-readonly'));
  });

  it('disabled leaves navigation unhandled and blocks mutation', async () => {
    const bubble = vi.fn(); const change = vi.fn();
    await render(() => <div onKeyDown={bubble}><Fixture disabled onValueChange={change} /></div>);
    expect(await key(slots()[0], 'ArrowUp')).toBe(true);
    expect(await key(slots()[0], 'ArrowDown')).toBe(true);
    expect(bubble).toHaveBeenCalledTimes(2);
    await input(slots()[0], '1');
    expect(values()).toBe('');
    expect(change).not.toHaveBeenCalled();
    slots().forEach((node) => { expect(node).toBeDisabled(); expect(node).toHaveAttribute('data-disabled'); });
  });

  it.each(['typing', 'paste', 'backspace'] as const)('canceled %s preserves value and focus', async (kind) => {
    const complete = vi.fn();
    await render(() => <Fixture defaultValue="12" onValueChange={(_, details) => details.cancel()} onValueComplete={complete} />);
    await focus(slots()[1]);
    if (kind === 'typing') await input(slots()[1], '9');
    else if (kind === 'paste') await paste(slots()[1], '93456');
    else await key(slots()[1], 'Backspace');
    expect(values()).toBe('12');
    expect(slots()[1]).toHaveFocus();
    expect(complete).not.toHaveBeenCalled();
  });

  it('restores and selects a filled slot after invalid input', async () => {
    await render(() => <Fixture defaultValue="1" />);
    await focus(slots()[0]);
    await input(slots()[0], 'a');
    expect(slots()[0]).toHaveValue('1');
    expect(slots()[0].selectionStart).toBe(0);
    expect(slots()[0].selectionEnd).toBe(1);
    expect(slots()[0]).toHaveFocus();
  });

  it('buffers desktop composition and commits once without duplicating intermediate text', async () => {
    const change = vi.fn();
    await render(() => <Fixture validationType="alphanumeric" onValueChange={change} />);
    await focus(slots()[0]);
    fireEvent.compositionStart(slots()[0]);
    // Intentionally same-turn: IME ownership cannot depend on a staged signal read.
    fireEvent.input(slots()[0], { target: { value: 'd' } });
    fireEvent.input(slots()[0], { target: { value: 'dd' } });
    fireEvent.input(slots()[0], { target: { value: 'ddd' } });
    await settle();
    expect(change).not.toHaveBeenCalled();
    expect(values()).toBe('ddd');
    fireEvent.compositionEnd(slots()[0], { target: { value: 'ddd' } });
    await settle();
    expect(change).toHaveBeenCalledExactlyOnceWith('ddd', expect.objectContaining({ reason: 'input-change' }));
    expect(slots().map((node) => node.value)).toEqual(['d', 'd', 'd', '', '', '']);
    expect(slots()[3]).toHaveFocus();
  });

  it('reports rejected composition only on compositionend', async () => {
    const invalid = vi.fn();
    const change = vi.fn();
    await render(() => <Fixture onValueInvalid={invalid} onValueChange={change} />);
    await focus(slots()[0]);
    fireEvent.compositionStart(slots()[0]);
    await input(slots()[0], '1a');
    expect(invalid).not.toHaveBeenCalled();
    fireEvent.compositionEnd(slots()[0], { target: { value: '1a' } });
    await settle();
    expect(invalid).toHaveBeenCalledExactlyOnceWith('1a', expect.objectContaining({ reason: 'input-change' }));
    expect(change).toHaveBeenCalledExactlyOnceWith('1', expect.anything());
    expect(values()).toBe('1');
    expect(slots().map((node) => node.value)).toEqual(['1', '', '', '', '', '']);
    expect(slots()[1]).toHaveFocus();
  });

  it('IME owns real keyboard commands until compositionend', async () => {
    const change = vi.fn();
    await render(() => <Fixture defaultValue="12" validationType="alphanumeric" onValueChange={change} />);
    await focus(slots()[2]);
    fireEvent.compositionStart(slots()[2]);
    await input(slots()[2], 'a');
    await key(slots()[2], 'Backspace');
    expect(change).not.toHaveBeenCalled();
    expect(slots()[2]).toHaveFocus();
    expect(slots().map((node) => node.value)).toEqual(['1', '2', 'a', '', '', '']);
    fireEvent.compositionEnd(slots()[2], { target: { value: '' } });
    await settle();
    expect(change).not.toHaveBeenCalled();
    expect(values()).toBe('12');
    expect(slots().map((node) => node.value)).toEqual(['1', '2', '', '', '', '']);
  });

  it.each(['disabled', 'readOnly'] as const)('discards composition ending after %s', async (lock) => {
    const change = vi.fn();
    const view = await renderProps((props: { disabled?: boolean; readOnly?: boolean }) => <Fixture {...props} validationType="alphanumeric" onValueChange={change} />, {});
    fireEvent.compositionStart(slots()[0]);
    await input(slots()[0], 'abc');
    await view.setProps({ [lock]: true });
    fireEvent.compositionEnd(slots()[0], { target: { value: 'abc' } });
    await settle();
    expect(change).not.toHaveBeenCalled();
    expect(values()).toBe('');
  });

  it('selects on mousedown and after the final slot is first filled', async () => {
    await render(() => <Fixture defaultValue="12345" />);
    fireEvent.mouseDown(slots()[0]);
    expect(slots()[0].selectionStart).toBe(0);
    expect(slots()[0].selectionEnd).toBe(1);
    await focus(slots()[5]);
    await input(slots()[5], '6');
    expect(slots()[5]).toHaveFocus();
    expect(slots()[5].selectionStart).toBe(0);
    expect(slots()[5].selectionEnd).toBe(1);
  });

  it('native preventDefault and Base UI prevention can independently stop internal mousedown', async () => {
    const view = await renderProps((props: { base: boolean }) => <OTPField.Root length={1}>
      <OTPField.Input onMouseDown={(event) => props.base ? event.preventBaseUIHandler() : event.preventDefault()} />
    </OTPField.Root>, { base: false });
    expect(fireEvent.mouseDown(slots()[0])).toBe(false);
    expect(slots()[0]).not.toHaveFocus();
    await view.setProps({ base: true });
    expect(fireEvent.mouseDown(slots()[0])).toBe(true);
    expect(slots()[0]).not.toHaveFocus();
  });

  it('reads current external input handlers and keeps independent detail cancellation', async () => {
    const before = vi.fn(); const after = vi.fn(); const change = vi.fn();
    const view = await renderProps((props: { handler: typeof before }) => <OTPField.Root length={1} onValueChange={(v, details) => { change(v); details.cancel(); }}>
      <OTPField.Input onInput={props.handler} />
    </OTPField.Root>, { handler: before });
    await input(slots()[0], '1');
    expect(before).toHaveBeenCalledTimes(1);
    expect(change).toHaveBeenCalledWith('1');
    expect(values()).toBe('');
    await view.setProps({ handler: after });
    await input(slots()[0], '2');
    expect(after).toHaveBeenCalledTimes(1);
    expect(before).toHaveBeenCalledTimes(1);
  });

  it('composed focus/blur handlers control focused state', async () => {
    const view = await renderProps((props: { preventFocus: boolean }) => <><OTPField.Root length={1}>
      <OTPField.Input onFocus={(event) => { if (props.preventFocus) event.preventDefault(); }} onBlur={(event) => event.preventDefault()} />
    </OTPField.Root><button>Outside</button></>, { preventFocus: true });
    const select = vi.spyOn(slots()[0], 'select');
    await focus(slots()[0]);
    expect(slots()[0]).toHaveFocus();
    expect(select).not.toHaveBeenCalled();
    expect(screen.getByRole('group')).not.toHaveAttribute('data-focused');
    await focus(screen.getByRole('button'));
    await view.setProps({ preventFocus: false });
    await focus(slots()[0]);
    expect(screen.getByRole('group')).toHaveAttribute('data-focused');
    await focus(screen.getByRole('button'));
    expect(screen.getByRole('group')).toHaveAttribute('data-focused');
  });

  it('preserves standalone sibling focus when a previously focused slot unmounts', async () => {
    const onFocus = vi.fn();
    const view = await renderProps((props: { first: boolean }) => <OTPField.Root length={props.first ? 3 : 2} defaultValue="1">
      {props.first && <OTPField.Input />}<OTPField.Input onFocus={onFocus} /><OTPField.Input />
    </OTPField.Root>, { first: true });
    const sibling = slots()[1];
    await focus(slots()[0]);
    await focus(sibling);
    expect(onFocus).toHaveBeenCalledTimes(1);
    await view.setProps({ first: false });
    expect(sibling).toHaveFocus();
    expect(screen.getByRole('group')).toHaveAttribute('data-focused');
    expect(sibling.tabIndex).toBe(0);
    expect(slots()[0]).toBe(sibling);
    expect(slots().map((slot) => slot.tabIndex)).toEqual([0, -1]);
    expect(onFocus).toHaveBeenCalledTimes(1);
    await key(sibling, 'ArrowRight');
    expect(slots()[1]).toHaveFocus();
  });

  it('clears standalone focus when the focused slot unmounts', async () => {
    const view = await renderProps((props: { first: boolean }) => <OTPField.Root length={props.first ? 3 : 2}>
      {props.first && <OTPField.Input />}<OTPField.Input /><OTPField.Input />
    </OTPField.Root>, { first: true });
    await focus(slots()[0]);
    await view.setProps({ first: false });
    expect(screen.getByRole('group')).not.toHaveAttribute('data-focused');
  });

  it('same-character typing advances except on the last slot, which is not reselected', async () => {
    const { user } = await render(() => <Fixture defaultValue="123456" />);
    await focus(slots()[1]);
    await user.keyboard('2');
    expect(slots()[2]).toHaveFocus();
    await focus(slots()[5]);
    const select = vi.spyOn(slots()[5], 'select');
    await user.keyboard('6');
    expect(select).not.toHaveBeenCalled();
    expect(slots()[5]).toHaveFocus();
  });

  it.each([
    ['Backspace', '1234', 1, '134', 0],
    ['Backspace', '12', 2, '1', 1],
    ['Delete', '1234', 1, '134', 1],
  ] as const)('%s deletes contiguously and selects destination', async (command, defaultValue, start, expected, destination) => {
    const change = vi.fn();
    await render(() => <Fixture defaultValue={defaultValue} onValueChange={change} />);
    await focus(slots()[start]);
    await key(slots()[start], command);
    expect(values()).toBe(expected);
    expect(slots()[destination]).toHaveFocus();
    expect(slots()[destination].selectionStart).toBe(0);
    expect(slots()[destination].selectionEnd).toBe(slots()[destination].value.length);
    expect(change).toHaveBeenCalledWith(expected, expect.objectContaining({ reason: 'keyboard' }));
  });

  it.each([{ ctrlKey: true }, { metaKey: true }])('clears the whole value using modified Backspace %o', async (modifier) => {
    await render(() => <Fixture defaultValue="1234" />);
    await focus(slots()[2]);
    await key(slots()[2], 'Backspace', modifier);
    expect(values()).toBe('');
    expect(slots()[0]).toHaveFocus();
  });

  it('does not dispatch change for no-op deletion, and reports input-clear separately', async () => {
    const change = vi.fn();
    await render(() => <Fixture onValueChange={change} />);
    await focus(slots()[0]);
    await key(slots()[0], 'Backspace');
    await key(slots()[0], 'Delete');
    expect(change).not.toHaveBeenCalled();
    await input(slots()[0], '1');
    await input(slots()[0], '');
    expect(change).toHaveBeenLastCalledWith('', expect.objectContaining({ reason: 'input-clear' }));
  });

  it.each(['input', 'paste'] as const)('replaces in the middle and preserves suffix for %s', async (kind) => {
    await render(() => <Fixture defaultValue="123456" />);
    await focus(slots()[2]);
    if (kind === 'input') await input(slots()[2], '99');
    else await paste(slots()[2], '99');
    expect(values()).toBe('129956');
    expect(slots()[4]).toHaveFocus();
  });

  it('ignores unavailable clipboard data and warns on denied reads', async () => {
    await render(() => <Fixture defaultValue="12" />);
    const event = new Event('paste', { bubbles: true, cancelable: true });
    expect(slots()[1].dispatchEvent(event)).toBe(false);
    expect(values()).toBe('12');
    await expectDiagnostic({ message: /could not read clipboard text/ }, async () => {
      // Native ClipboardEventInit only accepts DataTransfer. Inject the denied
      // read on the dispatched event rather than passing an invalid constructor bag.
      const denied = new Event('paste', { bubbles: true, cancelable: true });
      Object.defineProperty(denied, 'clipboardData', { value: {
        getData() { throw new DOMException('Blocked', 'SecurityError'); },
      } });
      slots()[1].dispatchEvent(denied);
      await settle();
    });
    expect(values()).toBe('12');
  });

  it('allows tabbing out from the active slot and marks filled/complete/focused', async () => {
    const { user } = await render(() => <><Fixture /><button>Next</button></>);
    await focus(slots()[0]);
    await input(slots()[0], '123456');
    slots().forEach((node) => {
      expect(node).toHaveAttribute('data-filled');
      expect(node).toHaveAttribute('data-complete');
      expect(node).toHaveAttribute('data-focused');
    });
    await user.tab();
    expect(screen.getByRole('button')).toHaveFocus();
    expect(screen.getByRole('group')).not.toHaveAttribute('data-focused');
  });

  it('warns for an unlabeled first-slot aria-label', async () => {
    await expectDiagnostic({ message: /ignores `aria-label` on the first input/ }, () => render(() => <OTPField.Root length={1}><OTPField.Input aria-label="Character" /></OTPField.Root>));
    expect(slots()[0]).not.toHaveAttribute('aria-label');
  });

  it('uses a defaultless required context for orphan slots', async () => {
    await expect(render(() => <OTPField.Input />)).rejects.toThrow();
  });
});
