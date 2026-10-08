import { afterEach, expect, vi } from 'vitest';
import { flush } from 'solid-js';
import { advanceTimers, browserCase, cleanup, createRenderer, fireEvent, screen, waitFor } from '../../test';
import { ContextMenuFixture } from './ContextMenu.test-fixture';
import { fireTouch, touchPoint } from './ContextMenu.touch-fixture';

const rootSource = 'packages/react/src/context-menu/root/ContextMenuRoot.test.tsx';
const triggerSource = 'packages/react/src/context-menu/trigger/ContextMenuTrigger.test.tsx';
afterEach(() => { cleanup(); vi.useRealTimers(); });

browserCase({ source: rootSource, case: 'collisionAvoidance side flip', environment: 'browser', issue: 'bsolid-browser' }, async () => {
  await createRenderer().render(() => <ContextMenuFixture root={{ open: true }} positioner={{
    collisionAvoidance: { side: 'flip' },
    anchor: { getBoundingClientRect: () => DOMRect.fromRect({ x: 100, y: window.innerHeight - 20, width: 0, height: 0 }) },
    style: { width: '150px', height: '100px' },
  }} />);
  await waitFor(() => expect(screen.getByTestId('positioner')).toHaveAttribute('data-side', 'top'));
});

for (const movement of [0, 5, 10, 20]) {
  browserCase({ source: triggerSource, case: `real Touch long press movement=${movement}`, environment: 'browser', issue: 'bsolid-browser' }, async () => {
    vi.useFakeTimers();
    await createRenderer().render(() => <ContextMenuFixture />);
    const target = screen.getByTestId('trigger');
    const touch = (x: number) => touchPoint(target, x, 100);
    fireTouch(target, 'touchstart', [touch(100)]);
    fireTouch(target, 'touchmove', [touch(100 + movement)]);
    await advanceTimers(500);
    expect(screen.queryByRole('menu') !== null).toBe(movement <= 10);
  });
}

for (const abort of ['touchEnd', 'touchCancel', 'multiStart', 'multiMove', 'disabled'] as const) {
  browserCase({ source: triggerSource, case: `real Touch long press abort=${abort}`, environment: 'browser', issue: 'bsolid-browser' }, async () => {
    vi.useFakeTimers();
    const changed = vi.fn();
    await createRenderer().render(() => <ContextMenuFixture root={{ disabled: abort === 'disabled', onOpenChange: changed }} />);
    const target = screen.getByTestId('trigger');
    const first = touchPoint(target);
    fireTouch(target, 'touchstart', [first]);
    if (abort === 'multiStart' || abort === 'multiMove') {
      const second = touchPoint(target, 120, 100, 1);
      fireTouch(target, abort === 'multiStart' ? 'touchstart' : 'touchmove', [first, second]);
    } else if (abort !== 'disabled') fireTouch(target, abort === 'touchEnd' ? 'touchend' : 'touchcancel');
    fireTouch(target, 'touchmove', [first]);
    await advanceTimers(500);
    expect(changed).not.toHaveBeenCalled();
    expect(screen.queryByRole('menu')).toBeNull();
  });
}

browserCase({ source: triggerSource, case: 'real Touch delayed outside dismissal', environment: 'browser', issue: 'bsolid-browser' }, async () => {
  vi.useFakeTimers();
  await createRenderer().render(() => <ContextMenuFixture />);
  const target = screen.getByTestId('trigger');
  fireTouch(target, 'touchstart', [touchPoint(target)]);
  await advanceTimers(500);
  fireEvent.mouseDown(document.body); flush();
  expect(screen.getByRole('menu')).toBeInTheDocument();
  await advanceTimers(500);
  fireEvent.mouseDown(document.body); flush();
  await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
});

for (const alignOffset of [0, -5]) {
  browserCase({ source: rootSource, case: `layout spawn-point release alignOffset=${alignOffset}`, environment: 'browser', issue: 'bsolid-browser' }, async () => {
    await createRenderer().render(() => <ContextMenuFixture positioner={{ alignOffset, style: { width: '180px', height: '100px' } }} />);
    fireEvent.contextMenu(screen.getByTestId('trigger'), { clientX: 100, clientY: 100, button: 2 });
    await screen.findByRole('menu');
    await waitFor(() => expect(screen.getByTestId('positioner').getBoundingClientRect().width).toBeGreaterThan(0));
    fireEvent.mouseUp(screen.getByTestId('item'), { clientX: 100, clientY: 100, button: 2 });
    flush();
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });
}
