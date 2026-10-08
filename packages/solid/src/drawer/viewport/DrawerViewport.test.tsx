import { describe, expect, it, vi } from 'vitest';
import { screen } from '@solidjs/testing-library';
import { createRenderer, firePointer, flushMicrotasks, waitSingleFrame } from '../../../test';
import { Drawer } from '../index';
import { dispatchTouch } from '../test/KeyboardFixture';
import type { DrawerSwipeDirection } from '../root/snapPoints';

function dimensions(node: HTMLElement | null, height: number, width = height) {
  if (node) Object.defineProperties(node, { offsetHeight: { configurable: true, value: height }, offsetWidth: { configurable: true, value: width } });
}
function hit(node: Element) {
  const original = document.elementFromPoint;
  document.elementFromPoint = () => node;
  return () => { document.elementFromPoint = original; };
}
async function drag(node: HTMLElement, direction: DrawerSwipeDirection, distance: number, step = 200) {
  const sign = direction === 'up' || direction === 'left' ? -1 : 1;
  const horizontal = direction === 'left' || direction === 'right';
  const point = (value: number) => ({ clientX: 100 + (horizontal ? sign * value : 0), clientY: 100 + (horizontal ? 0 : sign * value) });
  const init = { pointerId: 1, pointerType: 'mouse', button: 0 };
  firePointer.down(node, { ...init, ...point(0), buttons: 1, timeStamp: 1000 }); await flushMicrotasks();
  firePointer.move(node, { ...init, ...point(1), buttons: 1, timeStamp: 1000 + step }); await flushMicrotasks();
  firePointer.move(node, { ...init, ...point(distance), buttons: 1, timeStamp: 1000 + 2 * step }); await flushMicrotasks();
  firePointer.up(node, { ...init, ...point(distance), buttons: 0, timeStamp: 1000 + 3 * step }); await flushMicrotasks();
}

describe('Drawer viewport source interactions with measured geometry', () => {
  const { render } = createRenderer();
  for (const direction of ['up', 'down', 'left', 'right'] as const) {
    it.each([80, 150])(`uses size-based distance in ${direction} drawers (%s)`, async distance => {
      const change = vi.fn();
      await render(() => <Drawer.Root open modal={false} swipeDirection={direction} onOpenChange={change}>
        <Drawer.Portal><Drawer.Viewport><Drawer.Popup data-testid="popup" ref={node => dimensions(node, 200)}>Drawer</Drawer.Popup></Drawer.Viewport></Drawer.Portal>
      </Drawer.Root>);
      const popup = screen.getByTestId('popup'); const restore = hit(popup);
      try {
        await drag(popup, direction, distance);
        if (distance === 80) expect(change).not.toHaveBeenCalled();
        else expect(change).toHaveBeenCalledExactlyOnceWith(false, expect.objectContaining({ reason: 'swipe' }));
        await waitSingleFrame();
        expect(popup).not.toHaveAttribute('data-swipe-dismiss');
      } finally { restore(); }
    });
    it(`restores styles after canceled ${direction} dismissal`, async () => {
      await render(() => <Drawer.Root defaultOpen modal={false} swipeDirection={direction} onOpenChange={(_, details) => details.cancel()}>
        <Drawer.Portal><Drawer.Backdrop data-testid="backdrop" /><Drawer.Viewport><Drawer.Popup data-testid="popup" ref={node => dimensions(node, 200)}>Drawer</Drawer.Popup></Drawer.Viewport></Drawer.Portal>
      </Drawer.Root>);
      const popup = screen.getByTestId('popup'); const restore = hit(popup);
      try {
        await drag(popup, direction, 150);
        expect(popup).toHaveAttribute('data-open');
        expect(popup).not.toHaveAttribute('data-ending-style');
        expect(popup).not.toHaveAttribute('data-swipe-dismiss');
        expect(screen.getByTestId('backdrop')).not.toHaveAttribute('data-swiping');
        expect(popup.style.getPropertyValue('--drawer-swipe-movement-x')).toBe('0px');
        expect(popup.style.getPropertyValue('--drawer-swipe-movement-y')).toBe('0px');
      } finally { restore(); }
    });
  }

  it.each(['left', 'right'] as const)('uses regular %s dismissal with vertical snap points configured', async direction => {
    const change = vi.fn();
    await render(() => <Drawer.Root open modal={false} swipeDirection={direction} snapPoints={['100px', '200px']} onOpenChange={change}>
      <Drawer.Portal><Drawer.Viewport><Drawer.Popup data-testid="popup" ref={node => dimensions(node, 200)}>Drawer</Drawer.Popup></Drawer.Viewport></Drawer.Portal>
    </Drawer.Root>);
    const popup = screen.getByTestId('popup'); const restore = hit(popup);
    try { await drag(popup, direction, 150); expect(change).toHaveBeenCalledWith(false, expect.objectContaining({ reason: 'swipe' })); await waitSingleFrame(); }
    finally { restore(); }
  });

  it.each([false, true])('rejects canceled null snap changes before starting exit styles (sequential=%s)', async sequential => {
    const openChange = vi.fn(), snapChange = vi.fn();
    await render(() => <Drawer.Root open modal={false} snapToSequentialPoints={sequential} defaultSnapPoint="100px" snapPoints={['100px', '200px']}
      onOpenChange={openChange} onSnapPointChange={(next, details) => { snapChange(next, details); if (next === null) details.cancel(); }}>
      <Drawer.Portal><Drawer.Viewport ref={node => dimensions(node, 400)}><Drawer.Popup data-testid="popup" ref={node => dimensions(node, 300)}>Drawer</Drawer.Popup></Drawer.Viewport></Drawer.Portal>
    </Drawer.Root>);
    const popup = screen.getByTestId('popup'); const restore = hit(popup);
    const exitChanges: string[] = [];
    const observer = new MutationObserver(records => records.forEach(record => exitChanges.push(record.attributeName!)));
    observer.observe(popup, { attributes: true, attributeFilter: ['data-ending-style', 'data-swipe-dismiss'] });
    try {
      await drag(popup, 'down', 100, 16);
      expect(snapChange).toHaveBeenCalledWith(null, expect.objectContaining({ isCanceled: true }));
      expect(openChange).not.toHaveBeenCalled();
      expect(exitChanges).toEqual([]);
      expect(popup.style.getPropertyValue('--drawer-snap-point-offset')).toBe('200px');
      expect(popup.style.getPropertyValue('--drawer-swipe-movement-y')).toBe('0px');
    } finally { observer.disconnect(); restore(); }
  });

  it.each(['all', 'x', 'y', 'content'] as const)('does not capture pointer drags from %s ignored descendants', async kind => {
    const change = vi.fn();
    await render(() => <Drawer.Root open modal={false} onOpenChange={change}>
      <Drawer.Portal><Drawer.Backdrop data-testid="backdrop" /><Drawer.Viewport><Drawer.Popup>
        {kind === 'content' ? <Drawer.Content data-testid="target" /> : <div data-testid="target" data-base-ui-swipe-ignore={kind === 'all' ? '' : kind} />}
      </Drawer.Popup></Drawer.Viewport></Drawer.Portal>
    </Drawer.Root>);
    const target = screen.getByTestId('target'); const restore = hit(target);
    try { await drag(target, 'down', 150); expect(change).not.toHaveBeenCalled(); expect(screen.getByTestId('backdrop')).not.toHaveAttribute('data-swiping'); }
    finally { restore(); }
  });

  it.each(['down', 'right'] as const)('attributes cross-axis marked touch gestures only once (%s)', async direction => {
    await render(() => <Drawer.Root open modal={false} swipeDirection={direction}>
      <Drawer.Portal><Drawer.Backdrop data-testid="backdrop" /><Drawer.Viewport><Drawer.Popup data-testid="popup">
        <div data-testid="target" data-base-ui-swipe-ignore={direction === 'down' ? 'x' : 'y'} />
      </Drawer.Popup></Drawer.Viewport></Drawer.Portal>
    </Drawer.Root>);
    const target = screen.getByTestId('target'); const restore = hit(target);
    const point = (axis: number, cross: number) => direction === 'down' ? { x: cross, y: axis } : { x: axis, y: cross };
    try {
      dispatchTouch(target, 'touchstart', { x: 100, y: 100 });
      expect(dispatchTouch(target, 'touchmove', point(103, 101)).defaultPrevented).toBe(false);
      expect(dispatchTouch(target, 'touchmove', point(120, 102)).defaultPrevented).toBe(true);
      expect(dispatchTouch(target, 'touchmove', point(150, 102)).defaultPrevented).toBe(true);
      expect(dispatchTouch(target, 'touchmove', point(103, 102)).defaultPrevented).toBe(true);
      dispatchTouch(target, 'touchend', point(103, 102));
      await flushMicrotasks();
      expect(screen.getByTestId('backdrop')).not.toHaveAttribute('data-swiping');
    } finally { restore(); }
  });

  it('keeps damped styles when duplicate coordinates or ignored-axis jitter arrive', async () => {
    await render(() => <Drawer.Root open modal={false} snapPoints={['100px', 1]} defaultSnapPoint={1}>
      <Drawer.Portal><Drawer.Viewport ref={node => dimensions(node, 400)}><Drawer.Popup data-testid="popup" ref={node => dimensions(node, 300)}>Drawer</Drawer.Popup></Drawer.Viewport></Drawer.Portal>
    </Drawer.Root>);
    const popup = screen.getByTestId('popup'); const restore = hit(popup);
    const init = { pointerId: 1, pointerType: 'mouse', button: 0, buttons: 1 };
    try {
      firePointer.down(popup, { ...init, clientX: 0, clientY: 100, timeStamp: 1000 });
      firePointer.move(popup, { ...init, clientX: 0, clientY: 100, timeStamp: 1016 });
      firePointer.move(popup, { ...init, clientX: 0, clientY: 0, timeStamp: 1032 });
      await flushMicrotasks();
      expect(popup.style.transform).toBe('');
      expect(popup.style.getPropertyValue('--drawer-swipe-movement-y')).toBe('-10px');
      for (const x of [0, 5]) {
        firePointer.move(popup, { ...init, clientX: x, clientY: 0, timeStamp: 1048 + x });
        await flushMicrotasks();
        expect(popup.style.transform).toBe('');
        expect(popup.style.getPropertyValue('--drawer-swipe-movement-y')).toBe('-10px');
      }
      firePointer.up(popup, { ...init, buttons: 0, clientX: 5, clientY: 0, timeStamp: 1200 });
      await flushMicrotasks();
    } finally { restore(); }
  });

  it.each(['moving', 'phantom', 'held'] as const)('uses source stationary-sample velocity when advancing sequential snaps (%s)', async mode => {
    const change = vi.fn();
    await render(() => <Drawer.Root open modal={false} snapPoints={['100px', '300px', 1]} defaultSnapPoint="100px" snapToSequentialPoints onSnapPointChange={change}>
      <Drawer.Portal><Drawer.Viewport ref={node => dimensions(node, 600)}><Drawer.Popup data-testid="popup" ref={node => dimensions(node, 600)}>Drawer</Drawer.Popup></Drawer.Viewport></Drawer.Portal>
    </Drawer.Root>);
    const popup = screen.getByTestId('popup'); const restore = hit(popup);
    const init = { pointerId: 1, pointerType: 'mouse', button: 0, clientX: 100 };
    const moves = mode === 'held'
      ? [[500, 1000], [460, 1016], [460, 1032], [460, 1048], [460, 1064]]
      : [[500, 1000], [488, 1016], [476, 1032], [464, 1048], ...(mode === 'phantom' ? [[463.5, 1064]] : [])];
    try {
      firePointer.down(popup, { ...init, buttons: 1, clientY: 500, timeStamp: 992 });
      for (const [clientY, timeStamp] of moves) {
        firePointer.move(popup, { ...init, buttons: 1, clientY, timeStamp });
        await flushMicrotasks();
      }
      firePointer.up(popup, { ...init, buttons: 0, clientY: mode === 'phantom' ? 463.5 : mode === 'held' ? 460 : 464, timeStamp: mode === 'moving' ? 1056 : 1072 });
      await flushMicrotasks();
      expect(change).toHaveBeenCalledExactlyOnceWith(mode === 'held' ? '100px' : '300px', expect.objectContaining({ reason: 'swipe' }));
      expect(popup.style.getPropertyValue('--drawer-snap-point-offset')).toBe(mode === 'held' ? '500px' : '300px');
    } finally { restore(); }
  });
});
