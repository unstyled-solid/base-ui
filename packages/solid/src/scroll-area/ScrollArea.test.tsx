import { createSignal, Errored, flush, omit, untrack } from 'solid-js';
import { describe, expect, it, vi } from 'vitest';
import { createRenderer } from '../../test/createRenderer';
import { firePointer } from '../../test/pointer';
import { advanceTimers } from '../../test/wait';
import { fireEvent, waitFor } from '@testing-library/dom';
import { ScrollArea } from './index';
import { ScrollAreaFixture, dimensions, capture } from './ScrollArea.fixture';
import { normalizeOverflowEdgeThreshold } from './root/ScrollAreaRoot';
import { CSPContext } from '../internals/csp-context/CSPContext';

describe('ScrollArea source outcomes (19511bb)', () => {
  const { render, renderProps } = createRenderer();
  it('Viewport outside Root throws the descriptive source error', async () => {
    await expect(render(() => <ScrollArea.Viewport />)).rejects.toThrow(
      'Base UI: ScrollAreaRootContext is missing. ScrollArea parts must be placed within <ScrollArea.Root>.',
    );
  });
  it('Thumb outside Scrollbar throws the descriptive source error', async () => {
    const view = await render(() => <Errored fallback={error => <p role="alert">{String(error())}</p>}><ScrollArea.Root><ScrollArea.Thumb /></ScrollArea.Root></Errored>);
    expect(view.getByRole('alert')).toHaveTextContent(
      'Base UI: ScrollAreaScrollbarContext is missing. ScrollAreaScrollbar parts must be placed within <ScrollArea.Scrollbar>.',
    );
  });
  it('Content outside Viewport throws the descriptive source error', async () => {
    const view = await render(() => <Errored fallback={error => <p role="alert">{String(error())}</p>}><ScrollArea.Root><ScrollArea.Content /></ScrollArea.Root></Errored>);
    expect(view.getByRole('alert')).toHaveTextContent(
      'Base UI: ScrollAreaViewportContext missing. ScrollAreaViewport parts must be placed within <ScrollArea.Viewport>.',
    );
  });
  it('source pointerover native path sets hover and viewport leave clears it', async () => {
    const view = await render(() => <ScrollAreaFixture mock />);
    const viewport = view.getByTestId('viewport'); const track = view.getByTestId('vertical');
    fireEvent.pointerLeave(view.getByTestId('root'), { pointerType: 'mouse' });
    await Promise.resolve();
    expect(track).not.toHaveAttribute('data-hovering');
    // React maps pointerover to synthetic pointerenter. Native Solid subscribes
    // to pointerenter itself; preserve the source path/hover observations.
    const event = new (window.PointerEvent ?? window.Event)('pointerenter', { bubbles: false });
    Object.defineProperties(event, {
      composedPath: { configurable: true, value: () => [document.body, viewport] },
      pointerType: { configurable: true, value: 'mouse' },
    });
    fireEvent(view.getByTestId('root'), event);
    await Promise.resolve();
    expect(track).toHaveAttribute('data-hovering', '');
    fireEvent.pointerLeave(view.getByTestId('root'), { pointerType: 'mouse' });
    await Promise.resolve();
    expect(track).not.toHaveAttribute('data-hovering');
  });
  it('root and viewport scrolling follow both axes and suppress non-user mouse scrolls', async () => {
    const view = await render(() => <ScrollAreaFixture mock viewport={{ style: { 'pointer-events': 'none' } }} />);
    vi.useFakeTimers();
    try {
      const viewport = view.getByTestId('viewport'); const root = view.getByTestId('root');
      const assert = (scrolling: boolean) => { for (const part of [root, viewport]) {
        if (scrolling) expect(part).toHaveAttribute('data-scrolling', '');
        else expect(part).not.toHaveAttribute('data-scrolling');
      } };
      assert(false);
      viewport.scrollTop = 1; fireEvent.scroll(viewport); await Promise.resolve(); assert(false);
      await advanceTimers(100);
      for (const prop of ['scrollTop', 'scrollLeft'] as const) {
        fireEvent.pointerEnter(viewport);
        viewport[prop] += 1; fireEvent.scroll(viewport); await Promise.resolve(); assert(true);
        await advanceTimers(499); assert(true);
        await advanceTimers(1); assert(false);
      }
      firePointer.down(viewport, { pointerType: 'touch', pointerId: 1, button: 0, timeStamp: 1 });
      viewport.scrollTop += 1; fireEvent.scroll(viewport); await Promise.resolve(); assert(true);
      await advanceTimers(500); assert(false);
      firePointer.move(root, { pointerType: 'mouse', pointerId: 2, timeStamp: 2 });
      viewport.scrollTop += 1; fireEvent.scroll(viewport); await Promise.resolve(); assert(false);
      await advanceTimers(500);
    } finally { view.unmount(); vi.useRealTimers(); }
  });
  it('explicit focusable viewport has no presentational role', async () => {
    const view = await render(() => <ScrollArea.Root><ScrollArea.Viewport data-testid="viewport" tabindex={0} /></ScrollArea.Root>);
    expect(view.getByTestId('viewport')).toHaveAttribute('tabindex', '0');
    expect(view.getByTestId('viewport')).not.toHaveAttribute('role', 'presentation');
  });
  for (const [orientation, direction] of [['vertical', 'ltr'], ['horizontal', 'ltr'], ['horizontal', 'rtl']] as const) {
    it(`source wheel clamps both edges and preserves interior zero/zoom (${orientation},${direction})`, async () => {
      const view = await render(() => <ScrollAreaFixture mock direction={direction} />);
      const viewport = view.getByTestId('viewport');
      const track = view.getByTestId(orientation === 'vertical' ? 'vertical' : 'horizontal');
      const prop = orientation === 'vertical' ? 'scrollTop' : 'scrollLeft';
      const delta = orientation === 'vertical' ? 'deltaY' : 'deltaX';
      const sign = direction === 'rtl' ? -1 : 1;
      expect(fireEvent.wheel(track, { [delta]: -sign * 50 })).toBe(true);
      expect(viewport[prop]).toBe(0);
      viewport[prop] = sign * 100;
      expect(fireEvent.wheel(track, { [delta]: -sign * 50 })).toBe(false);
      expect(viewport[prop]).toBe(sign * 50);
      viewport[prop] = sign * 790;
      fireEvent.wheel(track, { [delta]: sign * 50 }); expect(viewport[prop]).toBe(sign * 800);
      expect(fireEvent.wheel(track, { [delta]: sign * 50 })).toBe(true); expect(viewport[prop]).toBe(sign * 800);
      viewport[prop] = sign * 10;
      fireEvent.wheel(track, { [delta]: -sign * 50 }); expect(viewport[prop]).toBe(0);
      view.unmount();
      const ignored = await render(() => <ScrollAreaFixture mock direction={direction} />);
      const ignoredViewport = ignored.getByTestId('viewport'); const ignoredTrack = ignored.getByTestId(orientation === 'vertical' ? 'vertical' : 'horizontal');
      ignoredViewport[prop] = sign * 400;
      expect(fireEvent.wheel(ignoredTrack, { [delta]: 0 })).toBe(true);
      expect(ignoredViewport[prop]).toBe(sign * 400);
      expect(ignoredTrack).not.toHaveAttribute('data-scrolling');
      expect(fireEvent.wheel(ignoredTrack, { [delta]: sign * 50, ctrlKey: true })).toBe(true);
      expect(ignoredViewport[prop]).toBe(sign * 400);
      expect(ignoredTrack).not.toHaveAttribute('data-scrolling');
      fireEvent.wheel(ignoredTrack, { [delta]: sign * 50 });
      await waitFor(() => expect(ignoredTrack).toHaveAttribute('data-scrolling'));
    });
  }
  for (const button of [0, 1, 2]) it(`track native mousedown is cancelled (${button})`, async () => {
    const view = await render(() => <ScrollAreaFixture mock />);
    const event = new MouseEvent('mousedown', { bubbles: true, cancelable: true, button });
    view.getByTestId('vertical').dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    if (button === 0) {
      const thumbEvent = new MouseEvent('mousedown', { bubbles: true, cancelable: true, button });
      view.getByTestId('thumb-y').dispatchEvent(thumbEvent);
      expect(thumbEvent.defaultPrevented).toBe(true);
    }
  });
  it('track rejects secondary presses, missing thumb and native thumb paths; cancel ends a track drag', async () => {
    const view = await render(() => <ScrollAreaFixture mock />);
    const viewport = view.getByTestId('viewport'); const track = view.getByTestId('vertical'); const thumb = view.getByTestId('thumb-y');
    firePointer.down(track, { button: 2, pointerId: 1, clientY: 100, timeStamp: 1 });
    expect(viewport.scrollTop).toBe(0); expect(viewport.style.scrollSnapType).toBe('both mandatory');
    Object.defineProperty(track, 'getBoundingClientRect', { configurable: true, value: () => ({ top: 0 }) });
    const event = new MouseEvent('pointerdown', { bubbles: true, button: 0, clientY: 160 });
    Object.defineProperty(event, 'composedPath', { value: () => [thumb, track] });
    track.dispatchEvent(event);
    expect(viewport.scrollTop).toBe(0);
    // Native delegated dispatch follows the forged path through the thumb,
    // unlike React's synthetic target. Isolate the next source registration.
    view.unmount();
    const drag = await render(() => <ScrollAreaFixture mock />);
    const dragViewport = drag.getByTestId('viewport'); const dragTrack = drag.getByTestId('vertical'); const dragThumb = drag.getByTestId('thumb-y');
    Object.defineProperty(dragTrack, 'getBoundingClientRect', { configurable: true, value: () => ({ top: 0 }) });
    firePointer.down(dragTrack, { button: 0, pointerId: 1, clientY: 160, timeStamp: 2 });
    expect(dragViewport.scrollTop).toBeGreaterThan(0);
    await waitFor(() => expect(dragTrack).toHaveAttribute('data-scrolling'));
    const position = dragViewport.scrollTop;
    fireEvent.pointerCancel(dragTrack, { pointerId: 1 });
    firePointer.move(dragThumb, { pointerId: 1, buttons: 1, clientY: 180, timeStamp: 3 });
    expect(dragViewport.scrollTop).toBe(position);
    const missing = await render(() => <ScrollArea.Root><ScrollArea.Viewport data-testid="missing-viewport" style={{ 'scroll-snap-type': 'y mandatory' }} />
      <ScrollArea.Scrollbar keepMounted data-testid="missing-thumb" /></ScrollArea.Root>);
    firePointer.down(missing.getByTestId('missing-thumb'), { button: 0, pointerId: 1, clientY: 100, timeStamp: 4 });
    expect(missing.getByTestId('missing-viewport').scrollTop).toBe(0);
    expect(missing.getByTestId('missing-viewport').style.scrollSnapType).toBe('y mandatory');
  });
  it('track and thumb gestures without a viewport never mark scrolling or transform the thumb', async () => {
    const view = await render(() => <ScrollArea.Root><ScrollArea.Scrollbar keepMounted data-testid="track"><ScrollArea.Thumb data-testid="thumb" ref={capture} /></ScrollArea.Scrollbar></ScrollArea.Root>);
    const track = view.getByTestId('track'); const thumb = view.getByTestId('thumb');
    firePointer.down(track, { button: 0, pointerId: 1, clientY: 100, timeStamp: 1 });
    expect(track).not.toHaveAttribute('data-scrolling');
    firePointer.down(thumb, { button: 0, pointerId: 1, clientY: 0, timeStamp: 2 });
    firePointer.move(thumb, { pointerId: 1, buttons: 1, clientY: 20, timeStamp: 3 });
    expect(thumb).not.toHaveAttribute('data-scrolling'); expect(thumb.style.transform).toBe('');
    firePointer.up(thumb, { pointerId: 1, timeStamp: 4 });
    expect(thumb).not.toHaveAttribute('data-scrolling');
  });
  for (const orientation of ['vertical', 'horizontal'] as const) it(`pointer cancel clears axis state without releasing stale capture (${orientation})`, async () => {
    const view = await render(() => <ScrollAreaFixture mock />);
    const track = view.getByTestId(orientation === 'vertical' ? 'vertical' : 'horizontal');
    const thumb = view.getByTestId(orientation === 'vertical' ? 'thumb-y' : 'thumb-x');
    Object.assign(thumb, { hasPointerCapture: () => false, releasePointerCapture: () => { throw new Error('stale capture released'); } });
    firePointer.down(thumb, { button: 0, pointerId: 1, clientX: 0, clientY: 0, timeStamp: 1 });
    firePointer.move(thumb, { buttons: 1, pointerId: 1, clientX: 20, clientY: 20, timeStamp: 2 });
    await waitFor(() => expect(track).toHaveAttribute('data-scrolling'));
    expect(() => fireEvent.pointerCancel(thumb, { pointerId: 1 })).not.toThrow();
    await waitFor(() => expect(track).not.toHaveAttribute('data-scrolling'));
  });
  it('secondary thumb does not capture and active pointer release restores snap after a foreign release', async () => {
    const view = await render(() => <ScrollAreaFixture mock />);
    const viewport = view.getByTestId('viewport'); const thumb = view.getByTestId('thumb-y');
    const captureSpy = vi.spyOn(thumb, 'setPointerCapture');
    firePointer.down(thumb, { button: 2, pointerId: 1, timeStamp: 1 });
    expect(captureSpy).not.toHaveBeenCalled(); expect(viewport.style.scrollSnapType).toBe('both mandatory');
    firePointer.down(thumb, { button: 0, pointerId: 1, timeStamp: 2 });
    firePointer.down(thumb, { button: 0, pointerId: 2, timeStamp: 3 });
    expect(viewport.style.scrollSnapType).toBe('none');
    firePointer.up(thumb, { pointerId: 2, timeStamp: 4 }); expect(viewport.style.scrollSnapType).toBe('none');
    firePointer.up(thumb, { pointerId: 1, timeStamp: 5 }); expect(viewport.style.scrollSnapType).toBe('both mandatory');
  });
  it('corner explicit undefined removes the accessibility default', async () => {
    const view = await render(() => <ScrollArea.Root>
      <ScrollArea.Viewport ref={(node) => dimensions(node, { clientWidth: 100, clientHeight: 100, scrollWidth: 1000, scrollHeight: 1000 })} style={{ width: '100px', height: '100px' }}>
        <div style={{ width: '1000px', height: '1000px' }} />
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar keepMounted style={{ width: '10px' }} ref={(node) => dimensions(node, { offsetWidth: 10 })} />
      <ScrollArea.Scrollbar keepMounted orientation="horizontal" style={{ height: '10px' }} ref={(node) => dimensions(node, { offsetHeight: 10 })} />
      <ScrollArea.Corner data-testid="corner" aria-hidden={undefined} />
    </ScrollArea.Root>);
    await waitFor(() => expect(view.queryByTestId('corner')).not.toBeNull());
    expect(view.getByTestId('corner')).not.toHaveAttribute('aria-hidden');
  });
  it('touch momentum after an eventless pause and mouse suppression preserve modality', async () => {
    const view = await render(() => <ScrollAreaFixture mock />);
    vi.useFakeTimers();
    try {
      const viewport = view.getByTestId('viewport');
      firePointer.down(viewport, { pointerType: 'touch', pointerId: 1, button: 0, timeStamp: 1 });
      await advanceTimers(200);
      viewport.scrollTop = 1; fireEvent.scroll(viewport);
      await Promise.resolve();
      expect(viewport).toHaveAttribute('data-scrolling', '');
      await advanceTimers(500);
      expect(viewport).not.toHaveAttribute('data-scrolling');
      firePointer.down(viewport, { pointerType: 'mouse', pointerId: 2, button: 0, timeStamp: 201 });
      await advanceTimers(200);
      viewport.scrollTop = 2; fireEvent.scroll(viewport);
      await Promise.resolve();
      expect(viewport).not.toHaveAttribute('data-scrolling');
      await advanceTimers(500);
      expect(viewport).not.toHaveAttribute('data-scrolling');
    } finally { view.unmount(); vi.useRealTimers(); }
  });
  it('axis scrolling flags expire independently on tracks and thumbs', async () => {
    const view = await render(() => <ScrollAreaFixture mock />);
    vi.useFakeTimers();
    try {
      const viewport = view.getByTestId('viewport');
      const vertical = ['vertical', 'thumb-y']; const horizontal = ['horizontal', 'thumb-x'];
      for (const part of [...vertical, ...horizontal]) expect(view.getByTestId(part)).not.toHaveAttribute('data-scrolling');
      fireEvent.pointerEnter(viewport);
      viewport.scrollTop = 1; fireEvent.scroll(viewport); await Promise.resolve();
      for (const part of vertical) expect(view.getByTestId(part)).toHaveAttribute('data-scrolling', '');
      for (const part of horizontal) expect(view.getByTestId(part)).not.toHaveAttribute('data-scrolling');
      for (const part of ['root', 'viewport']) expect(view.getByTestId(part)).toHaveAttribute('data-scrolling', '');
      await advanceTimers(499);
      for (const part of vertical) expect(view.getByTestId(part)).toHaveAttribute('data-scrolling', '');
      for (const part of ['root', 'viewport']) expect(view.getByTestId(part)).toHaveAttribute('data-scrolling', '');
      fireEvent.pointerEnter(viewport);
      viewport.scrollLeft = 1; fireEvent.scroll(viewport); await Promise.resolve();
      await advanceTimers(1);
      for (const part of vertical) expect(view.getByTestId(part)).not.toHaveAttribute('data-scrolling');
      for (const part of horizontal) expect(view.getByTestId(part)).toHaveAttribute('data-scrolling', '');
      await advanceTimers(498);
      for (const part of horizontal) expect(view.getByTestId(part)).toHaveAttribute('data-scrolling', '');
      await advanceTimers(1);
      for (const part of horizontal) expect(view.getByTestId(part)).not.toHaveAttribute('data-scrolling');
      for (const part of ['root', 'viewport']) expect(view.getByTestId(part)).not.toHaveAttribute('data-scrolling');
    } finally { view.unmount(); vi.useRealTimers(); }
  });
  it('detects an already-hovered viewport at mount and rejects touch pointer enter', async () => {
    const original = Element.prototype.matches;
    const matches = vi.spyOn(Element.prototype, 'matches').mockImplementation(function (this: Element, selector: string) {
      return selector === ':hover' && (this as HTMLElement).dataset.testid === 'viewport' ? true : original.call(this, selector);
    });
    try {
      const view = await render(() => <ScrollAreaFixture mock />);
      await waitFor(() => expect(view.getByTestId('vertical')).toHaveAttribute('data-hovering'));
      view.unmount();
      matches.mockRestore();
      const touch = await render(() => <ScrollAreaFixture mock viewport={{ style: { 'pointer-events': 'none' } }} />);
      expect(touch.getByTestId('vertical')).not.toHaveAttribute('data-hovering');
      fireEvent.pointerEnter(touch.getByTestId('viewport'), { pointerType: 'touch' });
      await Promise.resolve();
      expect(touch.getByTestId('vertical')).not.toHaveAttribute('data-hovering');
    } finally { matches.mockRestore(); }
  });
  it('normalizes numeric, partial, negative and absent thresholds', () => {
    expect(normalizeOverflowEdgeThreshold(20)).toEqual({ xStart: 20, xEnd: 20, yStart: 20, yEnd: 20 });
    expect(normalizeOverflowEdgeThreshold({ xStart: -5, yEnd: 7 })).toEqual({ xStart: 0, xEnd: 0, yStart: 0, yEnd: 7 });
  });
  it('renders all six parts, exact accessibility defaults and explicit undefined overrides', async () => {
    const view = await render(() => <ScrollAreaFixture mock />);
    await waitFor(() => expect(view.queryByTestId('corner')).not.toBeNull());
    expect(view.getByTestId('root')).toHaveAttribute('role', 'presentation');
    expect(view.getByTestId('content')).toHaveAttribute('role', 'presentation');
    const viewport = view.getByTestId('viewport');
    expect(viewport).not.toHaveAttribute('role');
    expect(viewport).toHaveAttribute('tabindex', '0');
    expect(view.getByTestId('vertical')).toHaveAttribute('aria-hidden', 'true');
    expect(view.getByTestId('horizontal')).toHaveAttribute('data-orientation', 'horizontal');
    expect(view.getByTestId('corner')).toHaveAttribute('aria-hidden', 'true');
    const override = await render(() => <ScrollArea.Root><ScrollArea.Viewport tabindex={0} />
      <ScrollArea.Scrollbar keepMounted aria-hidden={undefined} data-testid="override" /></ScrollArea.Root>);
    expect(override.getByTestId('override')).not.toHaveAttribute('aria-hidden');
  });
  it('propagates overflow edges/metrics and recomputes live thresholds/direction without replacing hosts', async () => {
    const view = await renderProps((props: { threshold: number; direction: 'ltr' | 'rtl' }) =>
      <ScrollAreaFixture mock direction={props.direction} root={{ overflowEdgeThreshold: props.threshold }} />, { threshold: 5, direction: 'ltr' });
    const viewport = view.getByTestId('viewport');
    viewport.scrollLeft = 10; viewport.scrollTop = 10;
    fireEvent.scroll(viewport); flush();
    for (const part of ['root', 'viewport', 'content', 'vertical', 'horizontal']) expect(view.getByTestId(part)).toHaveAttribute('data-overflow-x-start');
    expect(viewport.style.getPropertyValue('--scroll-area-overflow-x-start')).toBe('10px');
    await view.setProps({ threshold: 20 });
    await waitFor(() => expect(viewport).not.toHaveAttribute('data-overflow-x-start'));
    await view.setProps({ direction: 'rtl', threshold: 0 });
    viewport.scrollLeft = -799.5; fireEvent.scroll(viewport); flush();
    expect(view.getByTestId('viewport')).toBe(viewport);
    expect(viewport).toHaveAttribute('data-overflow-x-start');
    expect(viewport).not.toHaveAttribute('data-overflow-x-end');
    expect(viewport.style.getPropertyValue('--scroll-area-overflow-x-end')).toBe('0px');
  });
  it('clears corner and all overflow metrics when content stops overflowing', async () => {
    const view = await render(() => <ScrollAreaFixture mock />);
    await waitFor(() => expect(view.getByTestId('corner').style.width).toBe('10px'));
    const viewport = view.getByTestId('viewport');
    dimensions(viewport, { scrollWidth: 100, scrollHeight: 100 });
    fireEvent.scroll(viewport); flush();
    expect(view.queryByTestId('corner')).toBeNull();
    expect(viewport).toHaveAttribute('tabindex', '-1');
    for (const edge of ['x-start', 'x-end', 'y-start', 'y-end']) expect(viewport.style.getPropertyValue(`--scroll-area-overflow-${edge}`)).toBe('0px');
  });
  it('clears measured overflow and corner CSS variables when the viewport becomes zero-sized', async () => {
    const view = await render(() => <ScrollAreaFixture mock />);
    await waitFor(() => expect(view.getByTestId('corner').style.width).toBe('10px'));
    const viewport = view.getByTestId('viewport');
    dimensions(viewport, { clientWidth: 0, clientHeight: 0, scrollWidth: 0, scrollHeight: 0 });
    fireEvent.scroll(viewport); flush();
    for (const part of ['root', 'viewport', 'content', 'vertical', 'horizontal']) {
      expect(view.getByTestId(part)).not.toHaveAttribute('data-has-overflow-x');
      expect(view.getByTestId(part)).not.toHaveAttribute('data-has-overflow-y');
    }
    expect(view.getByTestId('root').style.getPropertyValue('--scroll-area-corner-width')).toBe('0px');
    expect(view.getByTestId('root').style.getPropertyValue('--scroll-area-corner-height')).toBe('0px');
    expect(view.queryByTestId('corner')).toBeNull();
    expect(viewport).toHaveAttribute('tabindex', '-1');
    for (const edge of ['x-start', 'x-end', 'y-start', 'y-end']) expect(viewport.style.getPropertyValue(`--scroll-area-overflow-${edge}`)).toBe('0px');
  });
  it('applies independent edge thresholds without changing exposed scroll distances', async () => {
    const view = await render(() => <ScrollAreaFixture mock root={{ overflowEdgeThreshold: { xStart: 20, xEnd: 790, yStart: 5, yEnd: 800 } }} />);
    const viewport = view.getByTestId('viewport');
    viewport.scrollLeft = 15; viewport.scrollTop = 7;
    fireEvent.scroll(viewport); flush();
    for (const part of ['root', 'viewport', 'content', 'vertical', 'horizontal']) {
      expect(view.getByTestId(part)).not.toHaveAttribute('data-overflow-x-start');
      expect(view.getByTestId(part)).not.toHaveAttribute('data-overflow-x-end');
      expect(view.getByTestId(part)).toHaveAttribute('data-overflow-y-start');
      expect(view.getByTestId(part)).not.toHaveAttribute('data-overflow-y-end');
    }
    expect(viewport.style.getPropertyValue('--scroll-area-overflow-x-start')).toBe('15px');
    expect(viewport.style.getPropertyValue('--scroll-area-overflow-y-end')).toBe('793px');
  });
  for (const direction of ['ltr', 'rtl'] as const) it(`wheel clamp, chaining, zero delta and zoom (${direction})`, async () => {
    const view = await render(() => <ScrollAreaFixture mock direction={direction} />);
    const viewport = view.getByTestId('viewport');
    const track = view.getByTestId('horizontal');
    const sign = direction === 'rtl' ? -1 : 1;
    expect(fireEvent.wheel(track, { deltaX: sign * 50 })).toBe(false);
    expect(viewport.scrollLeft).toBe(sign * 50);
    viewport.scrollLeft = sign * 790;
    expect(fireEvent.wheel(track, { deltaX: sign * 50 })).toBe(false);
    expect(viewport.scrollLeft).toBe(sign * 800);
    expect(fireEvent.wheel(track, { deltaX: sign * 50 })).toBe(true);
    expect(fireEvent.wheel(track, { deltaX: 0 })).toBe(true);
    expect(fireEvent.wheel(track, { ctrlKey: true, deltaX: -sign * 50 })).toBe(true);
    expect(viewport.scrollLeft).toBe(sign * 800);
  });
  it('keeps vertical wheel cancellation independent and reads the current bound consumer', async () => {
    const view = await renderProps((props: { block: boolean }) => <ScrollAreaFixture mock scrollbar={{
      onWheel: [(block, event) => { if (block) event.preventBaseUIHandler(); else event.preventDefault(); }, props.block],
    }} />, { block: true });
    const viewport = view.getByTestId('viewport'); const track = view.getByTestId('vertical');
    expect(fireEvent.wheel(track, { deltaY: 50 })).toBe(true);
    expect(viewport.scrollTop).toBe(0);
    await view.setProps({ block: false });
    expect(fireEvent.wheel(track, { deltaY: 50 })).toBe(false);
    expect(viewport.scrollTop).toBe(50);
    viewport.scrollTop = 790;
    fireEvent.wheel(track, { deltaY: 50 });
    expect(viewport.scrollTop).toBe(800);
  });
  it('does not mark either axis as scrolling when wheel motion chains or is ignored', async () => {
    const view = await render(() => <ScrollAreaFixture mock />);
    const viewport = view.getByTestId('viewport'); const track = view.getByTestId('vertical');
    viewport.scrollTop = 800;
    expect(fireEvent.wheel(track, { deltaY: 50 })).toBe(true);
    expect(fireEvent.wheel(track, { deltaY: 0 })).toBe(true);
    expect(fireEvent.wheel(track, { deltaX: 50 })).toBe(true);
    expect(fireEvent.wheel(track, { ctrlKey: true, deltaY: -50 })).toBe(true);
    flush();
    expect(view.getByTestId('root')).not.toHaveAttribute('data-scrolling');
    expect(track).not.toHaveAttribute('data-scrolling');
    expect(view.getByTestId('horizontal')).not.toHaveAttribute('data-scrolling');
  });
  it('owns one pointer, saves snap once, recovers silent capture drop and restores on release/cancel/disposal', async () => {
    const view = await render(() => <ScrollAreaFixture mock />);
    const viewport = view.getByTestId('viewport'); const thumb = view.getByTestId('thumb-y');
    const pointer = capture(thumb);
    firePointer.down(thumb, { pointerId: 1, button: 0, clientY: 0, timeStamp: 1 });
    expect(viewport.style.scrollSnapType).toBe('none');
    firePointer.down(thumb, { pointerId: 2, button: 0, clientY: 100, timeStamp: 2 });
    firePointer.up(thumb, { pointerId: 2, timeStamp: 3 });
    expect(viewport.style.scrollSnapType).toBe('none');
    firePointer.move(thumb, { pointerId: 1, buttons: 1, clientY: 20, timeStamp: 4 });
    expect(viewport.scrollTop).toBe(100);
    firePointer.move(thumb, { pointerId: 1, buttons: 0, clientY: 90, timeStamp: 5 }); flush();
    expect(viewport.scrollTop).toBe(100);
    expect(viewport.style.scrollSnapType).toBe('both mandatory');
    expect(thumb).not.toHaveAttribute('data-scrolling');
    firePointer.down(thumb, { pointerId: 1, button: 0, timeStamp: 6 }); pointer.drop();
    firePointer.down(thumb, { pointerId: 2, button: 0, timeStamp: 7 });
    firePointer.up(thumb, { pointerId: 2, timeStamp: 8 });
    expect(viewport.style.scrollSnapType).toBe('both mandatory');
    firePointer.down(thumb, { pointerId: 3, button: 0, timeStamp: 9 });
    fireEvent.pointerCancel(thumb, { pointerId: 3 });
    expect(viewport.style.scrollSnapType).toBe('both mandatory');
    firePointer.down(thumb, { pointerId: 4, button: 0, timeStamp: 10 });
    view.unmount(); expect(viewport.style.scrollSnapType).toBe('both mandatory');
  });
  it('guards secondary presses, missing refs, degenerate tracks and focus-changing mouse defaults', async () => {
    const view = await render(() => <ScrollAreaFixture mock />);
    const viewport = view.getByTestId('viewport'); const thumb = view.getByTestId('thumb-y'); const track = view.getByTestId('vertical');
    firePointer.down(thumb, { button: 2, pointerId: 1, timeStamp: 1 });
    expect(viewport.style.scrollSnapType).toBe('both mandatory');
    dimensions(track, { offsetHeight: 10 }); viewport.scrollTop = 400;
    firePointer.down(track, { button: 0, pointerId: 1, clientY: 5, timeStamp: 2 });
    expect(viewport.scrollTop).toBe(400);
    firePointer.down(thumb, { button: 0, pointerId: 1, timeStamp: 3 });
    firePointer.move(thumb, { buttons: 1, pointerId: 1, clientY: 20, timeStamp: 4 });
    expect(viewport.scrollTop).toBe(400);
    expect(fireEvent.mouseDown(track, { button: 2 })).toBe(false);
    const missing = await render(() => <ScrollArea.Root><ScrollArea.Scrollbar keepMounted data-testid="missing"><ScrollArea.Thumb /></ScrollArea.Scrollbar></ScrollArea.Root>);
    expect(() => firePointer.down(missing.getByTestId('missing'), { button: 0, pointerId: 1, timeStamp: 5 })).not.toThrow();
  });
  it('restores snap when user callbacks synchronously unmount a scrollbar', async () => {
    const view = await render(() => {
      const [mounted, setMounted] = createSignal(true);
      return <ScrollArea.Root><ScrollArea.Viewport data-testid="viewport" style={{ 'scroll-snap-type': 'y mandatory' }} />
        {mounted() && <ScrollArea.Scrollbar keepMounted data-testid="removed-scrollbar"><ScrollArea.Thumb data-testid="thumb" ref={capture}
          onPointerMove={() => { setMounted(false); flush(); }} /></ScrollArea.Scrollbar>}</ScrollArea.Root>;
    });
    const thumb = view.getByTestId('thumb');
    firePointer.down(thumb, { button: 0, pointerId: 1, timeStamp: 1 });
    expect(() => firePointer.move(thumb, { buttons: 1, pointerId: 1, clientY: 20, timeStamp: 2 })).not.toThrow();
    expect(view.queryByTestId('thumb')).toBeNull();
    expect(view.queryByTestId('removed-scrollbar')).toBeNull();
    expect(view.getByTestId('viewport').scrollTop).toBe(0);
    expect(view.getByTestId('viewport').style.scrollSnapType).toBe('y mandatory');
  });
  it('does not restart a gesture after a pointer-down callback removes its thumb', async () => {
    const view = await render(() => {
      const [mounted, setMounted] = createSignal(true);
      return <ScrollArea.Root><ScrollArea.Viewport data-testid="viewport" style={{ 'scroll-snap-type': 'y mandatory' }} />
        {mounted() && <ScrollArea.Scrollbar keepMounted><ScrollArea.Thumb data-testid="thumb"
          ref={capture} onPointerDown={() => { setMounted(false); flush(); }} /></ScrollArea.Scrollbar>}</ScrollArea.Root>;
    });
    firePointer.down(view.getByTestId('thumb'), { button: 0, pointerId: 1, timeStamp: 1 });
    expect(view.queryByTestId('thumb')).toBeNull();
    expect(view.getByTestId('viewport').style.scrollSnapType).toBe('y mandatory');
  });
  it('rechecks refs after user scroll and pointer-up callbacks synchronously remove viewport', async () => {
    const view = await render(() => {
      const [mounted, setMounted] = createSignal(true);
      return <ScrollArea.Root>{mounted() && <ScrollArea.Viewport data-testid="viewport" onScroll={() => { setMounted(false); flush(); }} />}</ScrollArea.Root>;
    });
    expect(() => fireEvent.scroll(view.getByTestId('viewport'))).not.toThrow();
    expect(view.queryByTestId('viewport')).toBeNull();
    const pointerView = await render(() => {
      const [mounted, setMounted] = createSignal(true);
      return <ScrollArea.Root>{mounted() && <ScrollArea.Viewport data-testid="pointer-viewport" style={{ 'scroll-snap-type': 'y mandatory' }} />}
        <ScrollArea.Scrollbar keepMounted><ScrollArea.Thumb data-testid="pointer-thumb" ref={capture}
          onPointerUp={() => { setMounted(false); flush(); }} /></ScrollArea.Scrollbar></ScrollArea.Root>;
    });
    const viewport = pointerView.getByTestId('pointer-viewport'); const thumb = pointerView.getByTestId('pointer-thumb');
    firePointer.down(thumb, { pointerId: 1, button: 0, timeStamp: 1 });
    expect(viewport.style.scrollSnapType).toBe('none');
    expect(() => firePointer.up(thumb, { pointerId: 1, timeStamp: 2 })).not.toThrow();
    expect(pointerView.queryByTestId('pointer-viewport')).toBeNull();
    expect(viewport.style.scrollSnapType).toBe('y mandatory');
  });
  it('supports content and scrollbar renderers that deliberately do not forward refs', async () => {
    const view = await render(() => <ScrollArea.Root><ScrollArea.Viewport>
      <ScrollArea.Content data-testid="ref-less-content" render={(props) => <div {...omit(props, 'ref')} />} />
    </ScrollArea.Viewport><ScrollArea.Scrollbar keepMounted data-testid="ref-less-track" render={(props) => <div {...omit(props, 'ref')} />} /></ScrollArea.Root>);
    expect(view.getByTestId('ref-less-content')).toBeInTheDocument();
    expect(view.getByTestId('ref-less-track')).toBeInTheDocument();
    expect(() => fireEvent.wheel(view.getByTestId('ref-less-track'), { deltaY: 50 })).not.toThrow();
  });
  it('updates scrollbar and thumb orientation without replacing the kept host', async () => {
    const view = await renderProps((props: { orientation: 'vertical' | 'horizontal' }) => <ScrollArea.Root><ScrollArea.Viewport />
      <ScrollArea.Scrollbar orientation={props.orientation} keepMounted data-testid="track"><ScrollArea.Thumb data-testid="thumb" /></ScrollArea.Scrollbar></ScrollArea.Root>, { orientation: 'vertical' });
    const track = view.getByTestId('track'); const thumb = view.getByTestId('thumb');
    expect(track).toHaveAttribute('data-orientation', 'vertical');
    await view.setProps({ orientation: 'horizontal' });
    expect(view.getByTestId('track')).toBe(track); expect(view.getByTestId('thumb')).toBe(thumb);
    expect(track).toHaveAttribute('data-orientation', 'horizontal'); expect(thumb).toHaveAttribute('data-orientation', 'horizontal');
    expect(thumb.style.width).toBe('var(--scroll-area-thumb-width)');
  });
  it('supports CSP nonce and disabling injected style elements', async () => {
    const view = await renderProps((props: { disabled: boolean }) => <CSPContext value={{ nonce: 'scroll-nonce', get disableStyleElements() { return props.disabled; } }}>
      <ScrollArea.Root data-testid="csp" /></CSPContext>, { disabled: false });
    const selector = 'style[data-base-ui-style="base-ui-disable-scrollbar"]';
    expect(view.container.ownerDocument.querySelector<HTMLStyleElement>(selector)?.nonce).toBe('scroll-nonce');
    await view.setProps({ disabled: true });
    expect(view.container.ownerDocument.querySelector(selector)).toBeNull();
  });
  it('preserves mouse programmatic suppression, touch exceptions, axis timeouts and switching back to mouse', async () => {
    const view = await render(() => <ScrollAreaFixture mock />);
    vi.useFakeTimers();
    try {
      const viewport = view.getByTestId('viewport'); const root = view.getByTestId('root');
      viewport.scrollTop = 1; fireEvent.scroll(viewport); flush();
      expect(root).not.toHaveAttribute('data-scrolling');
      firePointer.down(viewport, { pointerType: 'touch', pointerId: 1, button: 0, timeStamp: 1 });
      viewport.scrollTop = 2; fireEvent.scroll(viewport); flush();
      expect(view.getByTestId('vertical')).toHaveAttribute('data-scrolling');
      expect(view.getByTestId('horizontal')).not.toHaveAttribute('data-scrolling');
      await advanceTimers(499); expect(root).toHaveAttribute('data-scrolling');
      await advanceTimers(1); expect(root).not.toHaveAttribute('data-scrolling');
      firePointer.move(root, { pointerType: 'mouse', pointerId: 2, timeStamp: 2 });
      viewport.scrollTop = 3; fireEvent.scroll(viewport); flush();
      expect(root).not.toHaveAttribute('data-scrolling');
      firePointer.move(viewport, { pointerType: 'mouse', pointerId: 2, timeStamp: 3 });
      viewport.scrollLeft = 1; fireEvent.scroll(viewport); flush();
      expect(view.getByTestId('horizontal')).toHaveAttribute('data-scrolling');
      await advanceTimers(500); expect(root).not.toHaveAttribute('data-scrolling');
    } finally { view.unmount(); vi.useRealTimers(); }
  });
  it('excludes touch hover and uses composed native paths', async () => {
    const view = await render(() => <ScrollAreaFixture mock />);
    const root = view.getByTestId('root'); const track = view.getByTestId('vertical');
    fireEvent.pointerLeave(root); flush();
    firePointer.move(root, { pointerType: 'touch', pointerId: 1, timeStamp: 1 }); flush();
    expect(track).not.toHaveAttribute('data-hovering');
    const event = new Event('pointermove', { bubbles: true });
    Object.defineProperties(event, { pointerType: { value: 'mouse' }, composedPath: { value: () => [document.body, view.getByTestId('viewport'), root] } });
    root.dispatchEvent(event); flush();
    expect(track).toHaveAttribute('data-hovering');
  });
  it('keeps native cancellation independent and checks refs after wheel callbacks', async () => {
    const view = await renderProps((props: { prevent: boolean }) => <ScrollAreaFixture mock thumb={{
      onPointerDown(event) { if (props.prevent) event.preventBaseUIHandler(); else event.preventDefault(); },
    }} />, { prevent: true });
    const viewport = view.getByTestId('viewport'); const thumb = view.getByTestId('thumb-y');
    firePointer.down(thumb, { pointerId: 1, button: 0, timeStamp: 1 });
    expect(viewport.style.scrollSnapType).toBe('both mandatory');
    await view.setProps({ prevent: false });
    firePointer.down(thumb, { pointerId: 1, button: 0, timeStamp: 2 });
    expect(viewport.style.scrollSnapType).toBe('none');
    const removed = await render(() => {
      const [mounted, setMounted] = createSignal(true);
      return <ScrollArea.Root>{mounted() && <ScrollArea.Viewport data-testid="removed" />}
        <ScrollArea.Scrollbar keepMounted data-testid="track" onWheel={() => { setMounted(false); flush(); }} /></ScrollArea.Root>;
    });
    expect(() => fireEvent.wheel(removed.getByTestId('track'), { deltaY: 50 })).not.toThrow();
    expect(removed.queryByTestId('removed')).toBeNull();
  });
  it('keeps render callback state and class live', async () => {
    let state!: ScrollArea.Root.State;
    const view = await render(() => <ScrollAreaFixture mock root={{ class: (next) => next.hasOverflowY ? 'overflow' : 'empty',
      render: (props, next) => { state = next; return <div {...props} />; } }} />);
    const root = view.getByTestId('root');
    await waitFor(() => expect(root).toHaveClass('overflow'));
    expect(untrack(() => state.hasOverflowY)).toBe(true);
    dimensions(view.getByTestId('viewport'), { scrollWidth: 100, scrollHeight: 100 });
    fireEvent.scroll(view.getByTestId('viewport')); flush();
    expect(view.getByTestId('root')).toBe(root); expect(root).toHaveClass('empty');
  });
});
