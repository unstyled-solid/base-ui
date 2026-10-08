import { describe, expect, it, vi } from 'vitest';
import { flush } from 'solid-js';
import { advanceTimers, browserCase, createRenderer, fireEvent, firePointer, flushMicrotasks, screen, waitFor } from '../../test';
import { NumberField } from './index';
import { platform } from '../utils/platform';
import { expectCursorTransform, settleScrubRelease, mockPointerLockPolicy } from './utils/testUtils';

describe('NumberField press and scrub source fixtures', () => {
  const { render, renderProps } = createRenderer();
  it('commits once on hold release, including leave/reentry and compatibility click', async () => {
    const commit = vi.fn();
    await render(() => <NumberField.Root defaultValue={0} onValueCommitted={commit}>
      <NumberField.Input /><NumberField.Increment />
    </NumberField.Root>);
    const button = screen.getByLabelText('Increase');
    firePointer.down(button, { pointerType: 'mouse', button: 0, timeStamp: 1 }); flush();
    fireEvent.mouseLeave(button); fireEvent.mouseEnter(button, { buttons: 1 });
    firePointer.up(button, { pointerType: 'mouse', timeStamp: 20 }); flush();
    fireEvent.click(button, { detail: 1 }); flush();
    expect(commit).toHaveBeenCalledTimes(1);
  });
  it('does not resurrect a cursor after late pointer-lock resolution', async () => {
    const policy = mockPointerLockPolicy();
    let resolve!: () => void;
    const lock = vi.fn(() => new Promise<void>((done) => { resolve = done; }));
    const original = document.body.requestPointerLock;
    document.body.requestPointerLock = lock;
    try {
      await render(() => <NumberField.Root><NumberField.Input /><NumberField.ScrubArea data-testid="area">
        <NumberField.ScrubAreaCursor data-testid="cursor" />
      </NumberField.ScrubArea></NumberField.Root>);
      const area = screen.getByTestId('area');
      firePointer.down(area, { pointerType: 'mouse', timeStamp: 1 }); flush();
      firePointer.up(area, { pointerType: 'mouse', timeStamp: 2 }); flush();
      await settleScrubRelease();
      resolve(); await flushMicrotasks();
      expect(screen.queryByTestId('cursor')).toBeNull();
    } finally { document.body.requestPointerLock = original; policy.mockRestore(); }
  });
  it('exposes only the active mouse cursor and no touch cursor', async () => {
    const original = document.body.requestPointerLock;
    document.body.requestPointerLock = vi.fn().mockResolvedValue(undefined);
    try {
      await render(() => <NumberField.Root><NumberField.Input />
        <NumberField.ScrubArea data-testid="one"><NumberField.ScrubAreaCursor data-testid="cursor" /></NumberField.ScrubArea>
        <NumberField.ScrubArea data-testid="two"><NumberField.ScrubAreaCursor data-testid="cursor" /></NumberField.ScrubArea>
      </NumberField.Root>);
      firePointer.down(screen.getByTestId('one'), { pointerType: 'mouse', timeStamp: 1 }); await flushMicrotasks();
      expect(screen.queryAllByTestId('cursor')).toHaveLength(platform.engine.webkit ? 0 : 1);
      firePointer.up(screen.getByTestId('one'), { pointerType: 'mouse', timeStamp: 2 }); flush();
      await settleScrubRelease();
      firePointer.down(screen.getByTestId('two'), { pointerType: 'touch', timeStamp: 3 }); flush();
      expect(screen.queryByTestId('cursor')).toBeNull();
      firePointer.up(screen.getByTestId('two'), { pointerType: 'touch', timeStamp: 4 });
    } finally { document.body.requestPointerLock = original; }
  });
  it('handles denial and clears root scrub state on disposal without committing', async () => {
    const original = document.body.requestPointerLock;
    document.body.requestPointerLock = vi.fn().mockRejectedValue(new Error('denied'));
    const commit = vi.fn();
    try {
      const view = await renderProps((props: { mounted: boolean }) => <NumberField.Root data-testid="root" onValueCommitted={commit}>
        <NumberField.Input />{props.mounted && <NumberField.ScrubArea data-testid="area"><NumberField.ScrubAreaCursor data-testid="cursor" /></NumberField.ScrubArea>}
      </NumberField.Root>, { mounted: true });
      firePointer.down(screen.getByTestId('area'), { pointerType: 'mouse', timeStamp: 1 }); await flushMicrotasks();
      expect(screen.queryByTestId('cursor')).toBeNull();
      await view.setProps({ mounted: false });
      expect(screen.getByTestId('root')).not.toHaveAttribute('data-scrubbing'); expect(commit).not.toHaveBeenCalled();
    } finally { document.body.requestPointerLock = original; }
  });
  browserCase({ source: 'packages/react/src/number-field/scrub-area/NumberFieldScrubArea.test.tsx',
    case: 'threshold, vertical direction, viewport cursor and final commit', environment: 'browser', issue: 'bsolid-browser' }, async () => {
    const commit = vi.fn();
    await render(() => <NumberField.Root defaultValue={0} onValueCommitted={commit}>
      <NumberField.Input /><NumberField.ScrubArea data-testid="area" pixelSensitivity={5} direction="vertical" teleportDistance={100}>
        <NumberField.ScrubAreaCursor data-testid="cursor" />
      </NumberField.ScrubArea>
    </NumberField.Root>);
    const area = screen.getByTestId('area');
    firePointer.down(area, { pointerType: 'mouse', timeStamp: 1 }); await flushMicrotasks();
    firePointer.move(area, { movementY: -4, timeStamp: 2 }); flush();
    expect(screen.getByRole('textbox')).toHaveValue('0');
    firePointer.move(area, { movementY: -1, timeStamp: 3 }); flush();
    expect(screen.getByRole('textbox')).toHaveValue('1');
    firePointer.move(area, { movementY: -5, timeStamp: 4 }); flush();
    expect(screen.getByRole('textbox')).toHaveValue('6');
    firePointer.up(area, { timeStamp: 5 }); await flushMicrotasks();
    await waitFor(() => expect(commit.mock.lastCall?.[0]).toBe(6));
  });
  browserCase({ source: 'packages/react/src/number-field/increment/NumberFieldIncrement.test.tsx',
    case: 'touch settle and compatibility-click hold', environment: 'browser', issue: 'bsolid-browser' }, async () => {
    vi.useFakeTimers();
    try {
      const commit = vi.fn();
      const view = await render(() => <NumberField.Root defaultValue={0} onValueCommitted={commit}><NumberField.Input /><NumberField.Increment /></NumberField.Root>);
      const button = screen.getByLabelText('Increase');
      fireEvent.touchStart(button); firePointer.down(button, { pointerType: 'touch', timeStamp: 1 });
      expect(screen.getByRole('textbox')).toHaveValue('0');
      await advanceTimers(50); expect(screen.getByRole('textbox')).toHaveValue('1');
      firePointer.up(button, { pointerType: 'touch', timeStamp: 51 }); fireEvent.touchEnd(button);
      fireEvent.click(button, { detail: 1 }); flush(); expect(commit).toHaveBeenCalledTimes(1);
      view.unmount();
    } finally { vi.useRealTimers(); }
  });
  describe.skipIf(platform.engine.webkit)('NumberField native cursor geometry', () => {
    browserCase({ source: 'packages/react/src/number-field/scrub-area/NumberFieldScrubArea.test.tsx',
      case: 'teleport bounds, actual cursor size and visual viewport scaling', environment: 'browser', issue: 'bsolid-browser' }, async () => {
      const viewport = window.visualViewport;
      if (!viewport) throw new Error('Expected visualViewport for native cursor geometry.');
      let scale = 2;
      const scaleGetter = vi.spyOn(viewport, 'scale', 'get').mockImplementation(() => scale);
      const request = vi.spyOn(document.body, 'requestPointerLock').mockResolvedValue(undefined);
      try {
        await render(() => <NumberField.Root defaultValue={0}><NumberField.Input />
          <NumberField.ScrubArea data-testid="geometry-area" teleportDistance={100}
            style={{ position: 'fixed', left: '100px', top: '100px', width: '20px', height: '20px' }}>
            <NumberField.ScrubAreaCursor data-testid="geometry-cursor" style={{ width: '10px', height: '10px' }} />
          </NumberField.ScrubArea>
        </NumberField.Root>);
        const area = screen.getByTestId('geometry-area');
        firePointer.down(area, { pointerType: 'mouse', clientX: 110, clientY: 110, timeStamp: 1 });
        await flushMicrotasks();
        const cursor = screen.getByTestId('geometry-cursor');
        expect(cursor.offsetWidth).toBe(10);
        expectCursorTransform(cursor, 105, 105, 0.5);
        scale = 4;
        firePointer.move(area, { movementX: 5000, timeStamp: 2 }); flush();
        expectCursorTransform(cursor, 45, 105, 0.25);
        firePointer.move(area, { movementX: -5000, timeStamp: 3 }); flush();
        expectCursorTransform(cursor, 165, 105, 0.25);
        firePointer.up(area, { timeStamp: 4 }); await flushMicrotasks();
        await waitFor(() => expect(screen.queryByTestId('geometry-cursor')).toBeNull());
      } finally { scaleGetter.mockRestore(); request.mockRestore(); }
    });
  });
});
