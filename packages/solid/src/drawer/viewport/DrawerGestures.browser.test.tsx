import { describe, expect, vi } from 'vitest';
import { createSignal } from 'solid-js';
import { screen } from '@solidjs/testing-library';
import { createRenderer, browserCase, waitFor, firePointer, flushMicrotasks } from '../../../test';
import { Drawer } from '../index';
import { timedSwipe, cancelPointer } from '../test/timedSwipe';
import { dispatchTouch } from '../test/KeyboardFixture';
import { animationFrames } from '../test/keyboardGeometry';
import type { DrawerSwipeDirection } from '../root/snapPoints';

describe('Drawer full composition gesture/layout qualification', () => {
  const { render } = createRenderer();
  const rootSource = 'packages/react/src/drawer/root/DrawerRoot.test.tsx';
  const viewportSource = 'packages/react/src/drawer/viewport/DrawerViewport.test.tsx';
  for (const direction of ['up', 'down', 'left', 'right'] as const) for (const pointerType of ['mouse', 'pen'] as const) {
    for (const mode of ['accept', 'cancel', 'controlled-reject', 'pointer-cancel'] as const) browserCase({ source: rootSource, case: `size-based threshold/cancellation[${direction},${pointerType},${mode}]`, environment: 'browser', issue: 'bsolid-browser' }, async () => {
      const change = vi.fn();
      const view = await render(() => {
        const [open, setOpen] = createSignal(true);
        return <Drawer.Root open={open()} modal={false} swipeDirection={direction} onOpenChange={(next, details) => { change(next, details); if (mode === 'cancel') details.cancel(); else if (mode !== 'controlled-reject') setOpen(next); }}>
          <Drawer.Portal keepMounted><Drawer.Backdrop data-testid="backdrop" /><Drawer.Viewport style={{ height: '400px', width: '400px' }}><Drawer.Popup data-testid="popup" style={{ position: 'fixed', left: '0px', top: '0px', height: '200px', width: '200px' }}>Drawer</Drawer.Popup></Drawer.Viewport></Drawer.Portal>
        </Drawer.Root>;
      });
      const popup = screen.getByTestId('popup'); const original = document.elementFromPoint; document.elementFromPoint = () => popup;
      try {
        // Synthetic events are dispatched to the captured popup. Native capture
        // is qualified separately with trusted browser input below.
        await timedSwipe(popup, direction, mode === 'pointer-cancel' ? 8 : 150, { pointerType, step: 200, cancel: mode === 'pointer-cancel' });
        await animationFrames(2);
        if (mode === 'accept') {
          expect(change).toHaveBeenCalledWith(false, expect.objectContaining({ reason: 'swipe' }));
          await waitFor(() => expect(popup).toHaveAttribute('data-closed'));
        } else {
          expect(popup).toHaveAttribute('data-open'); expect(popup).not.toHaveAttribute('data-swipe-dismiss');
          expect(screen.getByTestId('backdrop')).not.toHaveAttribute('data-swiping');
          if (mode === 'pointer-cancel') expect(change).not.toHaveBeenCalled();
        }
      } finally { document.elementFromPoint = original; }
    });
  }
  for (const direction of ['up', 'down', 'left', 'right'] as const) browserCase({ source: rootSource, case: `uses a size-based swipe threshold[${direction},low-distance]`, environment: 'browser', issue: 'bsolid-browser' }, async () => {
    const change = vi.fn();
    const view = await render(() => <Drawer.Root defaultOpen modal={false} swipeDirection={direction} onOpenChange={change}><Drawer.Portal><Drawer.Viewport><Drawer.Popup data-testid="popup" style={{ height: '200px', width: '200px' }}>Drawer</Drawer.Popup></Drawer.Viewport></Drawer.Portal></Drawer.Root>);
    const popup = screen.getByTestId('popup'); const original = document.elementFromPoint; document.elementFromPoint = () => popup;
    try { await timedSwipe(popup, direction, 80, { step: 200 }); expect(popup).toHaveAttribute('data-open'); expect(change).not.toHaveBeenCalled(); }
    finally { document.elementFromPoint = original; }
  });
  for (const sequential of [false, true]) for (const direction of ['up', 'down'] as const) browserCase({ source: rootSource, case: `snap progression and canceled null snap[${direction},sequential=${sequential}]`, environment: 'browser', issue: 'bsolid-browser' }, async () => {
    const onOpen = vi.fn(); const snapChange = vi.fn();
    const view = await render(() => <Drawer.Root defaultOpen modal={false} swipeDirection={direction} snapPoints={['100px', 1]} defaultSnapPoint="100px" snapToSequentialPoints={sequential} onOpenChange={onOpen} onSnapPointChange={(next, details) => { snapChange(next, details); if (next === null) details.cancel(); }}><Drawer.Portal><Drawer.Backdrop /><Drawer.Viewport style={{ height: '400px' }}><Drawer.Popup data-testid="popup" style={{ height: '200px' }}>Drawer</Drawer.Popup></Drawer.Viewport></Drawer.Portal></Drawer.Root>);
    const popup = screen.getByTestId('popup'); const original = document.elementFromPoint; document.elementFromPoint = () => popup;
    try {
      await waitFor(() => expect(popup.style.getPropertyValue('--drawer-snap-point-offset')).toBe(direction === 'down' ? '100px' : '-100px'));
      await timedSwipe(popup, direction, 120, { step: 16 });
      expect(snapChange).toHaveBeenCalledWith(null, expect.objectContaining({ reason: 'swipe', isCanceled: true }));
      expect(onOpen).not.toHaveBeenCalled(); expect(popup).toHaveAttribute('data-open'); expect(popup).not.toHaveAttribute('data-swipe-dismiss');
    } finally { document.elementFromPoint = original; }
  });
  browserCase({ source: rootSource, case: 'damps active snap point overshoot after the swipe direction is established', environment: 'browser', issue: 'bsolid-browser' }, async () => {
    const view = await render(() => <Drawer.Root open modal={false} snapPoints={['100px', 1]} defaultSnapPoint={1}><Drawer.Portal><Drawer.Viewport style={{ height: '400px' }}><Drawer.Popup data-testid="popup" style={{ height: '400px' }}>Drawer</Drawer.Popup></Drawer.Viewport></Drawer.Portal></Drawer.Root>);
    const popup = screen.getByTestId('popup'); const original = document.elementFromPoint; document.elementFromPoint = () => popup;
    try {
      firePointer.down(popup, { pointerType: 'mouse', pointerId: 1, clientX: 100, clientY: 200, button: 0, buttons: 1, timeStamp: 1 }); await flushMicrotasks();
      firePointer.move(popup, { pointerType: 'mouse', pointerId: 1, clientX: 100, clientY: 199, buttons: 1, timeStamp: 17 }); await flushMicrotasks();
      firePointer.move(popup, { pointerType: 'mouse', pointerId: 1, clientX: 100, clientY: 49, buttons: 1, timeStamp: 33 }); await flushMicrotasks();
      expect(parseFloat(popup.style.getPropertyValue('--drawer-swipe-movement-y'))).toBeCloseTo(-Math.sqrt(150), 1);
      cancelPointer(popup, { pointerType: 'mouse', pointerId: 1, timeStamp: 49 });
    } finally { document.elementFromPoint = original; }
  });
  for (const ignored of ['all', 'x', 'y', 'content'] as const) browserCase({ source: viewportSource, case: `ignored descendants do not take pointer ownership[${ignored}]`, environment: 'browser', issue: 'bsolid-browser' }, async () => {
    const view = await render(() => <Drawer.Root open modal={false}><Drawer.Portal><Drawer.Backdrop data-testid="backdrop" /><Drawer.Viewport><Drawer.Popup>{ignored === 'content' ? <Drawer.Content data-testid="target">Content</Drawer.Content> : <div data-base-ui-swipe-ignore={ignored === 'all' ? '' : ignored} data-testid="target">Ignored</div>}</Drawer.Popup></Drawer.Viewport></Drawer.Portal></Drawer.Root>);
    const target = screen.getByTestId('target'); const original = document.elementFromPoint; document.elementFromPoint = () => target;
    try { await timedSwipe(target, 'down', 120); expect(screen.getByTestId('backdrop')).not.toHaveAttribute('data-swiping'); }
    finally { document.elementFromPoint = original; }
  });
  for (const direction of ['up', 'down', 'left', 'right'] as const) browserCase({ source: 'packages/react/src/drawer/swipe-area/DrawerSwipeArea.test.tsx', case: `opens by swipe and protects only the release click[${direction}]`, environment: 'browser', issue: 'bsolid-browser' }, async () => {
    const dismiss: Record<DrawerSwipeDirection, DrawerSwipeDirection> = { up: 'down', down: 'up', left: 'right', right: 'left' };
    const view = await render(() => <Drawer.Root modal={false} swipeDirection={dismiss[direction]}><Drawer.SwipeArea data-testid="area" /><Drawer.Portal keepMounted><Drawer.Viewport><Drawer.Popup data-testid="popup" style={{ height: '200px', width: '200px' }}>Drawer</Drawer.Popup></Drawer.Viewport></Drawer.Portal></Drawer.Root>);
    await timedSwipe(view.getByTestId('area'), direction, 180);
    const popup = screen.getByTestId('popup'); expect(popup).toHaveAttribute('data-open');
    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
    expect(popup).toHaveAttribute('data-open');
    await view.user.click(document.body);
    await waitFor(() => expect(popup).toHaveAttribute('data-closed'));
  });
  browserCase({ source: 'packages/react/src/drawer/popup/DrawerPopup.test.tsx', case: 'reports the frontmost nested height and keeps the parent natural height', environment: 'browser', issue: 'bsolid-browser' }, async () => {
    const view = await render(() => <Drawer.Root defaultOpen modal={false}><Drawer.Portal><Drawer.Viewport><Drawer.Popup data-testid="parent" style={{ height: '200px' }}><Drawer.Root defaultOpen modal={false}><Drawer.Portal><Drawer.Viewport><Drawer.Popup data-testid="child" style={{ height: '300px' }}>Child</Drawer.Popup></Drawer.Viewport></Drawer.Portal></Drawer.Root></Drawer.Popup></Drawer.Viewport></Drawer.Portal></Drawer.Root>);
    const parent = screen.getByTestId('parent');
    await waitFor(() => expect(parent.style.getPropertyValue('--drawer-frontmost-height')).toBe('300px'));
    expect(parent).toHaveAttribute('data-nested-drawer-open'); expect(parent.style.getPropertyValue('--drawer-height')).toBe('200px');
    const original = document.elementFromPoint; document.elementFromPoint = () => parent;
    try { dispatchTouch(parent, 'touchstart'); dispatchTouch(parent, 'touchmove', { x: 12, y: 140 }); expect(parent).not.toHaveAttribute('data-swiping'); dispatchTouch(parent, 'touchcancel'); }
    finally { document.elementFromPoint = original; }
  });
  browserCase({ source: 'packages/react/src/drawer/swipe-area/DrawerSwipeArea.test.tsx', case: 'suppresses a trusted release click that arrives without a preceding pointerdown', environment: 'browser', issue: 'bsolid-browser' }, async () => {
    const { userEvent } = await import('vitest/browser');
    const view = await render(() => <>
      <div data-testid="outside" style={{ position: 'fixed', top: '0', left: '0', width: '100%', height: '100px' }} />
      <Drawer.Root><Drawer.SwipeArea data-testid="area" style={{ position: 'fixed', bottom: '0', left: '0', width: '100%', height: '40px' }} />
        <Drawer.Portal><Drawer.Viewport><Drawer.Popup data-testid="popup" style={{ position: 'fixed', bottom: '0', left: '0', width: '100%', height: '150px' }}>Drawer</Drawer.Popup></Drawer.Viewport></Drawer.Portal>
      </Drawer.Root>
    </>);
    const stopPointerDown = (event: Event) => event.stopPropagation();
    try {
      await timedSwipe(view.getByTestId('area'), 'up', 180);
      const popup = screen.getByTestId('popup');
      window.addEventListener('pointerdown', stopPointerDown, true);
      await userEvent.click(view.getByTestId('outside'), { force: true });
      window.removeEventListener('pointerdown', stopPointerDown, true);
      expect(popup).toHaveAttribute('data-open');
      await userEvent.click(view.getByTestId('outside'), { force: true });
      await waitFor(() => expect(screen.queryByTestId('popup')).toBeNull());
    } finally { window.removeEventListener('pointerdown', stopPointerDown, true); }
  });
  for (const direction of ['up', 'down', 'left', 'right'] as const) browserCase({ source: viewportSource, case: `native overflow scroll-edge arbitration[${direction}]`, environment: 'browser', issue: 'bsolid-review-drawer.1', adaptation: 'Actual CSS overflow and native scroll positions; synthetic touch events retain the source interaction path' }, async () => {
    const vertical = direction === 'up' || direction === 'down';
    const towardStart = direction === 'down' || direction === 'right';
    const sign = towardStart ? 1 : -1;
    await render(() => <Drawer.Root open modal={false} swipeDirection={direction}>
      <Drawer.Portal><Drawer.Backdrop data-testid="backdrop" /><Drawer.Viewport><Drawer.Popup style={{ position: 'fixed', top: '0', left: '0', width: '240px', height: '320px' }}>
        <Drawer.Content data-testid="scroll" style={{ height: '120px', width: '120px', 'overflow-y': vertical ? 'auto' : 'hidden', 'overflow-x': vertical ? 'hidden' : 'auto' }}>
          <div style={{ height: vertical ? '360px' : '120px', width: vertical ? '120px' : '360px' }}>Native scroll content</div>
        </Drawer.Content>
      </Drawer.Popup></Drawer.Viewport></Drawer.Portal>
    </Drawer.Root>);
    const scroll = screen.getByTestId('scroll'), backdrop = screen.getByTestId('backdrop');
    const maximum = vertical ? scroll.scrollHeight - scroll.clientHeight : scroll.scrollWidth - scroll.clientWidth;
    expect(maximum).toBeGreaterThan(0);
    const setPosition = (value: number) => { if (vertical) scroll.scrollTop = value; else scroll.scrollLeft = value; };
    const rect = scroll.getBoundingClientRect();
    const point = (movement: number) => ({ x: rect.left + rect.width / 2 + (vertical ? 0 : sign * movement), y: rect.top + rect.height / 2 + (vertical ? sign * movement : 0) });
    setPosition(maximum / 2);
    dispatchTouch(scroll, 'touchstart', point(0));
    expect(dispatchTouch(scroll, 'touchmove', point(10)).defaultPrevented).toBe(false);
    expect(backdrop).not.toHaveAttribute('data-swiping');
    dispatchTouch(scroll, 'touchend', point(10));
    setPosition(towardStart ? 0 : maximum);
    expect(vertical ? scroll.scrollTop : scroll.scrollLeft).toBe(towardStart ? 0 : maximum);
    dispatchTouch(scroll, 'touchstart', point(0));
    expect(dispatchTouch(scroll, 'touchmove', point(10)).defaultPrevented).toBe(true);
    expect(dispatchTouch(scroll, 'touchmove', point(20)).defaultPrevented).toBe(true);
    expect(backdrop).toHaveAttribute('data-swiping');
    dispatchTouch(scroll, 'touchend', point(20));
    await flushMicrotasks();
    expect(backdrop).not.toHaveAttribute('data-swiping');
  });
  browserCase({ source: viewportSource, case: 'publishes and clears swipe progress through Drawer.Provider', environment: 'browser', issue: 'bsolid-review-drawer.1', adaptation: 'Actual popup height and hit testing with deterministic native pointer timestamps' }, async () => {
    await render(() => <Drawer.Provider><Drawer.Indent data-testid="indent" /><Drawer.Root open modal={false}>
      <Drawer.Portal><Drawer.Backdrop data-testid="backdrop" /><Drawer.Viewport data-testid="viewport"><Drawer.Popup data-testid="popup" style={{ position: 'fixed', top: '20px', left: '20px', height: '100px', width: '200px' }}>Drawer</Drawer.Popup></Drawer.Viewport></Drawer.Portal>
    </Drawer.Root></Drawer.Provider>);
    const viewport = screen.getByTestId('viewport'), popup = screen.getByTestId('popup'), indent = screen.getByTestId('indent');
    expect(popup.offsetHeight).toBe(100);
    await waitFor(() => expect(popup.style.getPropertyValue('--drawer-frontmost-height')).toBe('100px'));
    const rect = popup.getBoundingClientRect();
    const common = { pointerId: 1, pointerType: 'mouse', button: 0, buttons: 1, clientX: rect.left + 20 };
    firePointer.down(viewport, { ...common, clientY: rect.top + 20, timeStamp: 1000 }); await flushMicrotasks();
    firePointer.move(viewport, { ...common, clientY: rect.top + 21, timeStamp: 1016 }); await flushMicrotasks();
    firePointer.move(viewport, { ...common, clientY: rect.top + 60, timeStamp: 1032 }); await flushMicrotasks();
    expect(Number.parseFloat(indent.style.getPropertyValue('--drawer-swipe-progress'))).toBeCloseTo(0.39);
    expect(indent.style.getPropertyValue('--drawer-height')).toBe('100px');
    firePointer.move(viewport, { ...common, clientY: rect.top + 20, timeStamp: 1048 }); await flushMicrotasks();
    expect(indent.style.getPropertyValue('--drawer-swipe-progress')).toBe('0');
    expect(indent.style.getPropertyValue('--drawer-height')).toBe('');
    firePointer.up(viewport, { ...common, buttons: 0, clientY: rect.top + 20, timeStamp: 1200 }); await flushMicrotasks();
    expect(screen.getByTestId('backdrop')).not.toHaveAttribute('data-swiping');
  });
  browserCase({ source: 'packages/react/src/utils/useSwipeDismiss.ts', case: 'captured pointer release outside the popup reaches dismissal', environment: 'browser', issue: 'bsolid-review-drawer.1', adaptation: 'Chromium CDP trusted mouse packets prove the source setPointerCapture routing; distance decides dismissal' }, async () => {
    const { cdp, server } = await import('vitest/browser');
    if (server.browser !== 'chromium') throw new Error('Drawer trusted capture replay requires Chromium CDP Input.dispatchMouseEvent; retain an equivalent native pointer driver for other browsers.');
    const change = vi.fn();
    let pointerId = 0;
    const moves: { x: number; y: number; trusted: boolean }[] = [];
    let release: { trusted: boolean; target: EventTarget | null } | undefined;
    await render(() => <Drawer.Root defaultOpen modal={false} onOpenChange={change}><Drawer.Portal><Drawer.Viewport>
      <Drawer.Popup data-testid="popup" style={{ position: 'fixed', top: '40px', left: '40px', width: '200px', height: '200px' }}
        onPointerDown={event => { pointerId = event.pointerId; }}
        onPointerMove={event => { moves.push({ x: event.clientX, y: event.clientY, trusted: event.isTrusted }); }}
        onPointerUp={event => { release = { trusted: event.isTrusted, target: event.target }; }}>Drawer</Drawer.Popup>
    </Drawer.Viewport></Drawer.Portal></Drawer.Root>);
    const popup = screen.getByTestId('popup');
    const captureEvents: { type: string; pointerId: number; trusted: boolean }[] = [];
    const recordCapture = (event: PointerEvent) => captureEvents.push({ type: event.type, pointerId: event.pointerId, trusted: event.isTrusted });
    // A dismissed popup unmounts during pointerup; Chromium then delivers
    // lostpointercapture to its owner document instead of the detached popup.
    popup.ownerDocument.addEventListener('gotpointercapture', recordCapture);
    popup.ownerDocument.addEventListener('lostpointercapture', recordCapture);
    await waitFor(() => expect(popup.style.getPropertyValue('--drawer-frontmost-height')).toBe('200px'));
    const frameElement = window.frameElement;
    const frame = frameElement?.tagName === 'IFRAME' ? frameElement as HTMLIFrameElement : null;
    const frameRect = frame?.getBoundingClientRect();
    const scale = { x: frame && frameRect ? frameRect.width / frame.offsetWidth : 1, y: frame && frameRect ? frameRect.height / frame.offsetHeight : 1 };
    const send = (type: 'mouseMoved' | 'mousePressed' | 'mouseReleased', x: number, y: number, buttons: number) => cdp().send('Input.dispatchMouseEvent', {
      type, x: (frameRect?.left ?? 0) + ((frame?.clientLeft ?? 0) + x) * scale.x, y: (frameRect?.top ?? 0) + ((frame?.clientTop ?? 0) + y) * scale.y,
      // CDP defaults button to "none", which drops pending native capture even
      // with buttons: 1. Match Slider's trusted held-left drag packets.
      button: type === 'mouseMoved' && buttons === 0 ? 'none' : 'left', buttons,
      timestamp: Date.now() / 1000,
      ...(type !== 'mouseMoved' ? { clickCount: 1 } : {}),
    });
    const receivedMove = (x: number, y: number) => moves.some(move => move.trusted && Math.abs(move.x - x) < 1 && Math.abs(move.y - y) < 1);
    try {
      await send('mouseMoved', 100, 100, 0);
      await send('mousePressed', 100, 100, 1);
      expect(pointerId).toBeGreaterThan(0);
      expect(popup.hasPointerCapture(pointerId)).toBe(true);
      await send('mouseMoved', 100, 101, 1);
      await waitFor(() => expect(receivedMove(100, 101)).toBe(true));
      expect(screen.getByTestId('popup')).toBe(popup);
      expect(popup.isConnected).toBe(true);
      expect(popup.hasPointerCapture(pointerId)).toBe(true);
      expect(captureEvents).toEqual([{ type: 'gotpointercapture', pointerId, trusted: true }]);
      await send('mouseMoved', 100, 250, 1);
      await waitFor(() => expect(receivedMove(100, 250)).toBe(true));
      await send('mouseMoved', 450, 250, 1);
      await waitFor(() => expect(receivedMove(450, 250)).toBe(true));
      expect(popup.hasPointerCapture(pointerId)).toBe(true);
      expect(captureEvents).toEqual([{ type: 'gotpointercapture', pointerId, trusted: true }]);
      expect(popup.contains(document.elementFromPoint(450, 250))).toBe(false);
      await send('mouseReleased', 450, 250, 0);
      await waitFor(() => expect(release).toEqual({ trusted: true, target: popup }));
      expect(popup.hasPointerCapture(pointerId)).toBe(false);
      await waitFor(() => expect(captureEvents).toEqual([
        { type: 'gotpointercapture', pointerId, trusted: true },
        { type: 'lostpointercapture', pointerId, trusted: true },
      ]));
      expect(change).toHaveBeenCalledExactlyOnceWith(false, expect.objectContaining({ reason: 'swipe' }));
      await waitFor(() => expect(screen.queryByTestId('popup')).toBeNull());
    } finally {
      try { await send('mouseReleased', 450, 250, 0); }
      finally {
        popup.ownerDocument.removeEventListener('gotpointercapture', recordCapture);
        popup.ownerDocument.removeEventListener('lostpointercapture', recordCapture);
      }
    }
  });
});
