import { expect, it, vi } from 'vitest';
import { flush } from 'solid-js';
import { advanceTimers, browserCase, createRenderer, firePointer, flushMicrotasks, screen } from '../../test';
import { NumberField } from './index';
import { mockPointerLockPolicy } from './utils/testUtils';
vi.mock('../utils/platform', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../utils/platform')>();
  return { ...actual, platform: { ...actual.platform, engine: { ...actual.platform.engine, gecko: true,
    get webkit() { return actual.platform.engine.webkit; },
  } } };
});
it('NumberField Gecko source release delay owns lock/state/commit until the 20ms deadline', async () => {
  const { render } = createRenderer();
  const request = document.body.requestPointerLock;
  const exit = document.exitPointerLock;
  document.body.requestPointerLock = vi.fn().mockResolvedValue(undefined);
  document.exitPointerLock = vi.fn();
  vi.useFakeTimers();
  try {
    const commit = vi.fn();
    const view = await render(() => <NumberField.Root defaultValue={0} data-testid="root" onValueCommitted={commit}>
      <NumberField.Input /><NumberField.ScrubArea data-testid="area"><NumberField.ScrubAreaCursor /></NumberField.ScrubArea>
    </NumberField.Root>);
    const area = screen.getByTestId('area');
    firePointer.down(area, { pointerType: 'touch', timeStamp: 1 }); flush();
    firePointer.move(area, { movementX: 10, timeStamp: 2 }); flush();
    firePointer.up(area, { timeStamp: 3 }); flush();
    expect(commit).not.toHaveBeenCalled(); expect(document.exitPointerLock).not.toHaveBeenCalled();
    expect(screen.getByTestId('root')).toHaveAttribute('data-scrubbing');
    firePointer.move(area, { movementX: 2, timeStamp: 4 }); flush();
    expect(screen.getByRole('textbox')).toHaveValue('12');
    await advanceTimers(19); expect(commit).not.toHaveBeenCalled();
    await advanceTimers(1);
    expect(commit).toHaveBeenCalledTimes(1); expect(commit.mock.lastCall?.[0]).toBe(12);
    expect(document.exitPointerLock).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('root')).not.toHaveAttribute('data-scrubbing');
    firePointer.move(window, { movementX: 5, timeStamp: 5 }); flush();
    expect(screen.getByRole('textbox')).toHaveValue('12');
    firePointer.up(window, { timeStamp: 6 }); await advanceTimers(20);
    expect(commit).toHaveBeenCalledTimes(1);
    await flushMicrotasks(); view.unmount();
  } finally { document.body.requestPointerLock = request; document.exitPointerLock = exit; vi.useRealTimers(); }
});
it('NumberField Gecko soft-click release orders lock exit, resource cleanup, commit and original-target click at 20ms', async () => {
  const { render } = createRenderer();
  const request = document.body.requestPointerLock; const exit = document.exitPointerLock;
  document.body.requestPointerLock = vi.fn().mockResolvedValue(undefined);
  const calls: string[] = [];
  document.exitPointerLock = vi.fn(() => {
    expect(screen.getByTestId('root')).toHaveAttribute('data-scrubbing');
    calls.push('exit');
  });
  const remove = vi.spyOn(window, 'removeEventListener');
  // This unit fixture already supplies a successful lock; use its matching
  // cursor policy rather than combining mocked Gecko with natural WebKit.
  const lockPolicy = mockPointerLockPolicy();
  vi.useFakeTimers();
  try {
    const commit = vi.fn((_value, details) => { calls.push('commit'); expect(details.reason).toBe('scrub'); });
    const click = vi.fn(() => calls.push('click'));
    const view = await render(() => <NumberField.Root defaultValue={3} data-testid="root" onValueCommitted={commit}>
      <NumberField.Input /><NumberField.ScrubArea data-testid="area">
        <span data-testid="label" onClick={click}>Amount</span><NumberField.ScrubAreaCursor data-testid="cursor" />
      </NumberField.ScrubArea>
    </NumberField.Root>);
    const label = screen.getByTestId('label');
    firePointer.down(label, { pointerType: 'mouse', pointerId: 1, timeStamp: 1 }); await flushMicrotasks();
    expect(screen.getByTestId('cursor')).toBeInTheDocument();
    firePointer.up(window, { pointerType: 'mouse', pointerId: 1, timeStamp: 2 }); flush();
    await advanceTimers(19);
    expect(calls).toEqual([]); expect(remove.mock.calls.some(([type]) => type === 'pointermove')).toBe(false);
    expect(screen.getByTestId('cursor')).toBeInTheDocument();
    // Duplicate release must not restart the delay or schedule a second commit.
    firePointer.up(window, { pointerType: 'mouse', pointerId: 1, timeStamp: 3 }); flush();
    await advanceTimers(1);
    expect(calls).toEqual(['exit', 'commit', 'click']);
    expect(remove.mock.calls.some(([type, , capture]) => type === 'pointermove' && capture === true)).toBe(true);
    expect(screen.queryByTestId('cursor')).toBeNull();
    expect(screen.getByTestId('root')).not.toHaveAttribute('data-scrubbing');
    await advanceTimers(20); expect(commit).toHaveBeenCalledTimes(1); expect(click).toHaveBeenCalledTimes(1);
    view.unmount();
  } finally { lockPolicy.mockRestore(); remove.mockRestore(); document.body.requestPointerLock = request; document.exitPointerLock = exit; vi.useRealTimers(); }
});
it.each(['pointercancel', 'disabled', 'readOnly', 'unmount'] as const)(
  'NumberField Gecko %s cancels the delayed release and its native resources without committing', async (action) => {
    const { renderProps } = createRenderer();
    const request = document.body.requestPointerLock; const exit = document.exitPointerLock;
    document.body.requestPointerLock = vi.fn().mockResolvedValue(undefined);
    document.exitPointerLock = vi.fn();
    vi.useFakeTimers();
    try {
      const commit = vi.fn();
      const view = await renderProps<{ disabled?: boolean; readOnly?: boolean; mounted: boolean }>((props) =>
        <NumberField.Root defaultValue={0} data-testid="root" disabled={props.disabled} readOnly={props.readOnly} onValueCommitted={commit}>
          <NumberField.Input />{props.mounted && <NumberField.ScrubArea data-testid="area"><NumberField.ScrubAreaCursor /></NumberField.ScrubArea>}
        </NumberField.Root>, { mounted: true });
      const area = screen.getByTestId('area');
      firePointer.down(area, { pointerType: 'touch', timeStamp: 1 }); flush();
      firePointer.move(window, { movementX: 10, timeStamp: 2 }); flush();
      firePointer.up(window, { timeStamp: 3 }); flush();
      await advanceTimers(10);
      if (action === 'pointercancel') { firePointer.cancel(window, { timeStamp: 4 }); flush(); }
      else if (action === 'unmount') await view.setProps({ mounted: false });
      else await view.setProps({ [action]: true });
      expect(screen.getByTestId('root')).not.toHaveAttribute('data-scrubbing');
      expect(document.exitPointerLock).toHaveBeenCalledTimes(1);
      if (action === 'disabled' || action === 'readOnly') await view.setProps({ [action]: false });
      firePointer.move(window, { movementX: 5, timeStamp: 5 }); firePointer.up(window, { timeStamp: 6 }); flush();
      await advanceTimers(30);
      expect(screen.getByRole('textbox')).toHaveValue('10'); expect(commit).not.toHaveBeenCalled();
      expect(vi.getTimerCount()).toBe(0);
      view.unmount();
    } finally { document.body.requestPointerLock = request; document.exitPointerLock = exit; vi.useRealTimers(); }
  },
);
it('NumberField Gecko a new gesture cancels the older delayed finish without terminating the new session', async () => {
  const { render } = createRenderer();
  vi.useFakeTimers();
  try {
    const commit = vi.fn();
    const view = await render(() => <NumberField.Root defaultValue={0} data-testid="root" onValueCommitted={commit}>
      <NumberField.Input /><NumberField.ScrubArea data-testid="area" />
    </NumberField.Root>);
    const area = screen.getByTestId('area');
    firePointer.down(area, { pointerType: 'touch', timeStamp: 1 }); flush();
    firePointer.move(window, { movementX: 10, timeStamp: 2 }); flush();
    firePointer.up(window, { timeStamp: 3 }); flush();
    await advanceTimers(10);
    firePointer.down(area, { pointerType: 'touch', pointerId: 2, timeStamp: 4 }); flush();
    await advanceTimers(10); expect(commit).not.toHaveBeenCalled();
    firePointer.move(window, { pointerId: 2, movementX: 2, timeStamp: 5 }); flush();
    expect(screen.getByRole('textbox')).toHaveValue('12');
    expect(screen.getByTestId('root')).toHaveAttribute('data-scrubbing');
    firePointer.up(window, { pointerId: 2, timeStamp: 6 }); flush();
    await advanceTimers(20);
    expect(commit).toHaveBeenCalledTimes(1); expect(commit.mock.lastCall?.[0]).toBe(12);
    expect(screen.getByTestId('root')).not.toHaveAttribute('data-scrubbing');
    view.unmount();
  } finally { vi.useRealTimers(); }
});
browserCase({ source: 'packages/react/src/number-field/scrub-area/NumberFieldScrubArea.gecko.test.tsx',
  case: 'delays pointer-lock release and final commit by 20ms', environment: 'browser', issue: 'bsolid-browser' }, async () => {
  const { render } = createRenderer();
  vi.useFakeTimers();
  try {
    const commit = vi.fn();
    const view = await render(() => <NumberField.Root defaultValue={0} data-testid="root" onValueCommitted={commit}>
      <NumberField.Input /><NumberField.ScrubArea data-testid="area"><NumberField.ScrubAreaCursor /></NumberField.ScrubArea>
    </NumberField.Root>);
    const area = screen.getByTestId('area');
    firePointer.down(area, { pointerType: 'mouse', timeStamp: 1 });
    firePointer.move(area, { movementX: 10, timeStamp: 2 }); flush();
    firePointer.up(area, { timeStamp: 3 }); flush();
    expect(commit).not.toHaveBeenCalled();
    expect(screen.getByTestId('root')).toHaveAttribute('data-scrubbing');
    await advanceTimers(20);
    expect(commit.mock.lastCall?.[0]).toBe(10);
    expect(screen.getByTestId('root')).not.toHaveAttribute('data-scrubbing');
    view.unmount();
  } finally { vi.useRealTimers(); }
});
