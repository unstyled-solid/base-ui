import { createEffect, createSignal, flush } from 'solid-js';
import { describe, expect, it, vi } from 'vitest';
import { createRenderer } from '../../test/createRenderer';
import { browserCase } from '../../test/sourceCase';
import { firePointer } from '../../test/pointer';
import { fireEvent, waitFor } from '@testing-library/dom';
import { ScrollArea } from './index';
import { ScrollAreaFixture, capture, dimensions } from './ScrollArea.fixture';
import { useScrollAreaRootContext } from './root/ScrollAreaRootContext';
import { DirectionContext } from '../internals/direction-context/DirectionContext';
import { getOffset } from './utils/getOffset';
import { flushMicrotasks, waitSingleFrame } from '../../test/wait';
import { platform } from '../utils/platform';

const source = (part: string) => `packages/react/src/scroll-area/${part}/ScrollArea${part[0].toUpperCase()}${part.slice(1)}.test.tsx`;
function scenario(part: string, name: string, run: () => Promise<void>) {
  browserCase({ source: source(part), case: name, environment: 'browser', issue: 'bsolid-review-scroll-area-validation',
    adaptation: 'Solid owned factory, live props, native pointer events' }, run);
}
describe('ScrollArea deferred real-layout source scenarios', () => {
  const { render, renderProps } = createRenderer();
  scenario('root', 'source direction change recomputes logical edges without a dispatched scroll', async () => {
    const view = await renderProps((props: { direction: 'ltr' | 'rtl' }) => <ScrollAreaFixture direction={props.direction} />, { direction: 'ltr' });
    const viewport = view.getByTestId('viewport'); const root = view.getByTestId('root');
    await waitFor(() => expect(root).toHaveAttribute('data-has-overflow-x'));
    const max = viewport.scrollWidth - viewport.clientWidth;
    viewport.scrollLeft = max / 2; fireEvent.scroll(viewport);
    await waitFor(() => expect(root).toHaveAttribute('data-overflow-x-start'));
    expect(root).toHaveAttribute('data-overflow-x-end');
    await view.setProps({ direction: 'rtl' });
    viewport.scrollLeft = -max;
    await waitFor(() => expect(root).toHaveAttribute('data-overflow-x-start'));
    await waitFor(() => expect(root).not.toHaveAttribute('data-overflow-x-end'));
  });
  for (const direction of ['ltr', 'rtl'] as const) scenario('thumb', `source trusted horizontal drag capture and track state (${direction})`, async () => {
    const view = await area(direction); const viewport = view.getByTestId('viewport'); const thumb = view.getByTestId('thumb-x'); const track = view.getByTestId('horizontal');
    const setCapture = vi.spyOn(thumb, 'setPointerCapture');
    const release = vi.spyOn(thumb, 'releasePointerCapture');
    const rect = thumb.getBoundingClientRect();
    await view.user.pointer({ target: thumb, coords: { clientX: rect.left + rect.width / 2, clientY: rect.top + rect.height / 2 }, keys: '[MouseLeft>]' });
    await view.user.pointer({ target: thumb, coords: { clientX: rect.left + rect.width / 2 + (direction === 'rtl' ? -20 : 20), clientY: rect.top + rect.height / 2 } });
    expect(setCapture).toHaveBeenCalledTimes(1);
    if (direction === 'ltr') expect(viewport.scrollLeft).toBeGreaterThan(0);
    else expect(viewport.scrollLeft).toBeLessThan(0);
    expect(track).toHaveAttribute('data-scrolling');
    if (direction === 'rtl') {
      expect(() => fireEvent.pointerCancel(thumb, { pointerId: 1 })).not.toThrow();
      await waitFor(() => expect(track).not.toHaveAttribute('data-scrolling'));
    }
    await view.user.pointer({ keys: '[/MouseLeft]' });
    expect(release).toHaveBeenCalled();
  });
  for (const keepMounted of [false, true]) scenario('root', `source visibility before and after observer delivery (keepMounted=${keepMounted})`, async () => {
    const Original = window.ResizeObserver;
    const observers = new Set<Observer>();
    class Observer implements ResizeObserver {
      constructor(readonly callback: ResizeObserverCallback) {}
      observe() { observers.add(this); }
      unobserve() {}
      disconnect() { observers.delete(this); }
    }
    window.ResizeObserver = Observer;
    try {
      const view = await render(() => <ScrollArea.Root style={{ width: '200px', height: '200px' }}>
        <ScrollArea.Viewport style={{ width: '100%', height: '100%' }}><div style={{ width: '1000px', height: '1000px' }} /></ScrollArea.Viewport>
        <ScrollArea.Scrollbar keepMounted={keepMounted} data-testid="track"><ScrollArea.Thumb data-testid="thumb" /></ScrollArea.Scrollbar>
      </ScrollArea.Root>);
      await waitFor(() => expect(getComputedStyle(view.getByTestId('track')).visibility).toBe('visible'));
      expect(getComputedStyle(view.getByTestId('thumb')).visibility).toBe('visible');
      expect(observers.size).toBeGreaterThan(0);
      for (const observer of observers) observer.callback([], observer);
      await waitSingleFrame();
      expect(getComputedStyle(view.getByTestId('track')).visibility).toBe('visible');
      expect(getComputedStyle(view.getByTestId('thumb')).visibility).toBe('visible');
      view.unmount();
    } finally { window.ResizeObserver = Original; }
  });
  scenario('root', 'source asymmetric corner appears and overflow metrics clear after shrink', async () => {
    const view = await renderProps((props: { size: number }) => <ScrollArea.Root data-testid="root" style={{ width: '200px', height: '200px' }}>
      <ScrollArea.Viewport data-testid="viewport" style={{ width: '100%', height: '100%' }}><div style={{ width: `${props.size}px`, height: `${props.size}px` }} /></ScrollArea.Viewport>
      <ScrollArea.Scrollbar keepMounted style={{ width: '11px' }}><ScrollArea.Thumb /></ScrollArea.Scrollbar>
      <ScrollArea.Scrollbar keepMounted orientation="horizontal" style={{ height: '13px' }}><ScrollArea.Thumb /></ScrollArea.Scrollbar>
      <ScrollArea.Corner data-testid="corner" />
    </ScrollArea.Root>, { size: 100 });
    expect(view.queryByTestId('corner')).toBeNull();
    await view.setProps({ size: 1000 });
    await waitFor(() => expect(view.getByTestId('corner').style.width).toBe('11px'));
    await waitFor(() => expect(view.getByTestId('corner').style.height).toBe('13px'));
    const root = view.getByTestId('root'); const viewport = view.getByTestId('viewport');
    expect(root).toHaveAttribute('data-has-overflow-x'); expect(root).toHaveAttribute('data-has-overflow-y');
    expect(viewport.style.getPropertyValue('--scroll-area-overflow-x-end')).not.toBe('0px');
    expect(viewport.style.getPropertyValue('--scroll-area-overflow-y-end')).not.toBe('0px');
    await view.setProps({ size: 100 });
    await waitFor(() => expect(root).not.toHaveAttribute('data-has-overflow-x'));
    await waitFor(() => expect(root).not.toHaveAttribute('data-has-overflow-y'));
    expect(view.queryByTestId('corner')).toBeNull();
    for (const edge of ['x-start', 'x-end', 'y-start', 'y-end']) expect(viewport.style.getPropertyValue(`--scroll-area-overflow-${edge}`)).toBe('0px');
  });
  scenario('root', 'unchanged corner does not notify its reactive context consumer on scroll', async () => {
    let commits = 0;
    function Probe() {
      const context = useScrollAreaRootContext();
      createEffect(() => context.cornerSize, () => { commits += 1; });
      return null;
    }
    const view = await render(() => <ScrollArea.Root style={{ width: '200px', height: '200px' }}>
      <ScrollArea.Viewport data-testid="viewport" style={{ width: '100%', height: '100%' }}><div style={{ width: '1000px', height: '1000px' }} /></ScrollArea.Viewport>
      <ScrollArea.Scrollbar style={{ width: '10px' }}><ScrollArea.Thumb /></ScrollArea.Scrollbar>
      <ScrollArea.Scrollbar orientation="horizontal" style={{ height: '10px' }}><ScrollArea.Thumb /></ScrollArea.Scrollbar>
      <ScrollArea.Corner data-testid="corner" /><Probe />
    </ScrollArea.Root>);
    await waitFor(() => expect(view.getByTestId('corner').style.width).toBe('10px'));
    expect(commits).toBeGreaterThan(0);
    const before = commits;
    for (let i = 0; i < 3; i += 1) fireEvent.scroll(view.getByTestId('viewport'));
    await Promise.resolve();
    expect(commits).toBe(before);
  });
  for (const timing of [undefined, { iterations: Infinity }, { duration: Infinity, iterations: 1 }]) {
    scenario('viewport', `source finite animation completion without observer (${JSON.stringify(timing) ?? 'finite only'})`, async () => {
      const observe = vi.spyOn(ResizeObserver.prototype, 'observe').mockImplementation(() => {});
      let width = 100;
      let complete!: () => void;
      const finished = new Promise<void>((resolve) => { complete = resolve; });
      const getAnimations = vi.fn(() => [{ finished }, ...(timing ? [{ finished: new Promise<void>(() => {}), effect: { getTiming: () => timing } }] : [])] as unknown as Animation[]);
      try {
        const view = await render(() => <ScrollArea.Root data-testid="root"><ScrollArea.Viewport ref={(node) => {
          if (!node) return;
          dimensions(node, { clientHeight: 100, clientWidth: 100, scrollHeight: 100 });
          Object.defineProperty(node, 'scrollWidth', { configurable: true, get: () => width });
          node.getAnimations = getAnimations;
        }} /><ScrollArea.Scrollbar orientation="horizontal" keepMounted><ScrollArea.Thumb /></ScrollArea.Scrollbar></ScrollArea.Root>);
        await waitFor(() => expect(getAnimations).toHaveBeenCalled());
        expect(view.getByTestId('root')).not.toHaveAttribute('data-has-overflow-x');
        width = 1000; complete(); await finished;
        await waitFor(() => expect(view.getByTestId('root')).toHaveAttribute('data-has-overflow-x'));
        view.unmount();
      } finally { observe.mockRestore(); }
    });
  }
  scenario('scrollbar', 'conditional horizontal RTL track registers wheel after becoming visible', async () => {
    const view = await render(() => <DirectionContext value={() => 'rtl'}><ScrollArea.Root style={{ width: '200px', height: '200px', direction: 'rtl' }}>
      <ScrollArea.Viewport data-testid="viewport" style={{ width: '100%', height: '100%' }}><div style={{ width: '1000px', height: '200px' }} /></ScrollArea.Viewport>
      <ScrollArea.Scrollbar orientation="horizontal" data-testid="conditional"><ScrollArea.Thumb /></ScrollArea.Scrollbar>
    </ScrollArea.Root></DirectionContext>);
    const track = await view.findByTestId('conditional');
    await waitFor(() => expect(track).toHaveAttribute('data-has-overflow-x'));
    expect(fireEvent.wheel(track, { deltaX: -50 })).toBe(false);
    expect(view.getByTestId('viewport').scrollLeft).toBe(-50);
  });
  scenario('scrollbar', 'positive vertical track press moves the viewport and marks scrolling', async () => {
    const view = await area(); const viewport = view.getByTestId('viewport'); const track = view.getByTestId('vertical');
    const rect = track.getBoundingClientRect();
    firePointer.down(track, { button: 0, pointerId: 1, clientX: rect.left + rect.width / 2, clientY: rect.bottom - 5, timeStamp: 1 });
    expect(viewport.scrollTop).toBeGreaterThan(0);
    await waitFor(() => expect(track).toHaveAttribute('data-scrolling'));
    firePointer.up(track, { pointerId: 1, timeStamp: 2 });
  });
  scenario('root', 'source overflow attributes at start middle end and without overflow', async () => {
    const view = await renderProps((props: { size: number }) => <ScrollAreaFixture contentSize={props.size} />, { size: 1000 });
    const viewport = view.getByTestId('viewport');
    const parts = ['root', 'viewport', 'content', 'vertical', 'horizontal'];
    for (const part of parts) await waitFor(() => expect(view.getByTestId(part)).toHaveAttribute('data-has-overflow-y'));
    for (const part of parts) {
      expect(view.getByTestId(part)).toHaveAttribute('data-has-overflow-x');
      for (const axis of ['x', 'y']) {
        expect(view.getByTestId(part)).not.toHaveAttribute(`data-overflow-${axis}-start`);
        expect(view.getByTestId(part)).toHaveAttribute(`data-overflow-${axis}-end`);
      }
    }
    for (const position of ['middle', 'end'] as const) {
      viewport.scrollLeft = (viewport.scrollWidth - viewport.clientWidth) / (position === 'middle' ? 2 : 1);
      viewport.scrollTop = (viewport.scrollHeight - viewport.clientHeight) / (position === 'middle' ? 2 : 1);
      fireEvent.scroll(viewport);
      for (const part of parts) for (const axis of ['x', 'y']) {
        await waitFor(() => expect(view.getByTestId(part)).toHaveAttribute(`data-overflow-${axis}-start`));
        if (position === 'middle') expect(view.getByTestId(part)).toHaveAttribute(`data-overflow-${axis}-end`);
        else await waitFor(() => expect(view.getByTestId(part)).not.toHaveAttribute(`data-overflow-${axis}-end`));
      }
    }
    await view.setProps({ size: 100 });
    for (const part of parts) for (const axis of ['x', 'y']) {
      await waitFor(() => expect(view.getByTestId(part)).not.toHaveAttribute(`data-has-overflow-${axis}`));
      expect(view.getByTestId(part)).not.toHaveAttribute(`data-overflow-${axis}-start`);
      expect(view.getByTestId(part)).not.toHaveAttribute(`data-overflow-${axis}-end`);
    }
  });
  scenario('root', 'source numeric and partial thresholds expose exact distances and update without scroll', async () => {
    const view = await renderProps<{ threshold: number | { xStart?: number; yStart?: number } }>((props) =>
      <ScrollAreaFixture root={{ overflowEdgeThreshold: props.threshold }} />, { threshold: 20 });
    const viewport = view.getByTestId('viewport');
    await waitFor(() => expect(viewport).toHaveAttribute('data-has-overflow-x'));
    viewport.scrollLeft = 15; viewport.scrollTop = 15; fireEvent.scroll(viewport);
    await waitFor(() => expect(viewport).not.toHaveAttribute('data-overflow-x-start'));
    expect(viewport).not.toHaveAttribute('data-overflow-y-start');
    expect(viewport).toHaveAttribute('data-overflow-x-end'); expect(viewport).toHaveAttribute('data-overflow-y-end');
    viewport.scrollLeft = viewport.scrollWidth - viewport.clientWidth - 15;
    viewport.scrollTop = viewport.scrollHeight - viewport.clientHeight - 15; fireEvent.scroll(viewport);
    await waitFor(() => expect(viewport).not.toHaveAttribute('data-overflow-x-end'));
    await waitFor(() => expect(viewport).not.toHaveAttribute('data-overflow-y-end'));
    expect(viewport).toHaveAttribute('data-overflow-x-start'); expect(viewport).toHaveAttribute('data-overflow-y-start');
    await view.setProps({ threshold: { xStart: 20, yStart: 5 } });
    viewport.scrollLeft = 15; viewport.scrollTop = 7; fireEvent.scroll(viewport);
    await waitFor(() => expect(viewport).not.toHaveAttribute('data-overflow-x-start'));
    await waitFor(() => expect(viewport).toHaveAttribute('data-overflow-y-start'));
    viewport.scrollLeft = 35; fireEvent.scroll(viewport);
    await waitFor(() => expect(viewport).toHaveAttribute('data-overflow-x-start'));
    expect(viewport.style.getPropertyValue('--scroll-area-overflow-x-start')).toBe('35px');
    expect(viewport.style.getPropertyValue('--scroll-area-overflow-x-end')).not.toBe('');
    expect(viewport.style.getPropertyValue('--scroll-area-overflow-x-end')).not.toBe('0px');
    viewport.scrollTop = 10; fireEvent.scroll(viewport);
    await view.setProps({ threshold: { yStart: 20 } });
    await waitFor(() => expect(viewport).not.toHaveAttribute('data-overflow-y-start'));
  });
  async function area(direction: 'ltr' | 'rtl' = 'ltr') {
    const view = await render(() => <ScrollAreaFixture direction={direction} />);
    await waitFor(() => expect(view.getByTestId('thumb-y').offsetHeight).toBeGreaterThan(0));
    return view;
  }
  scenario('root', 'shows scrollbars after mount compute before first ResizeObserver measurement', async () => {
    const observe = vi.spyOn(ResizeObserver.prototype, 'observe').mockImplementation(() => {});
    try {
      const view = await render(() => <ScrollArea.Root style={{ width: '200px', height: '200px' }}>
        <ScrollArea.Viewport style={{ width: '100%', height: '100%' }}><div style={{ height: '1000px' }} /></ScrollArea.Viewport>
        <ScrollArea.Scrollbar data-testid="track"><ScrollArea.Thumb data-testid="thumb" /></ScrollArea.Scrollbar>
      </ScrollArea.Root>);
      await waitFor(() => expect(view.getByTestId('track')).toBeVisible());
      expect(view.getByTestId('thumb').offsetHeight).toBeGreaterThan(0);
    } finally { observe.mockRestore(); }
  });
  scenario('root', 'recomputes thumb size when becoming visible without requiring scroll', async () => {
    const view = await renderProps((props: { visible: boolean }) => <div style={{ display: props.visible ? 'block' : 'none' }}>
      <ScrollAreaFixture /></div>, { visible: false });
    await view.setProps({ visible: true });
    await waitFor(() => expect(view.getByTestId('thumb-y').offsetHeight).toBeGreaterThan(16));
  });
  scenario('root', 'measures content mounted after viewport initial measurement', async () => {
    const view = await renderProps((props: { show: boolean }) => <ScrollArea.Root style={{ width: '200px', height: '200px' }}>
      <ScrollArea.Viewport data-testid="viewport" style={{ width: '100%', height: '100%' }}>
        {props.show && <ScrollArea.Content><div style={{ width: '1000px', height: '1000px' }} /></ScrollArea.Content>}
      </ScrollArea.Viewport><ScrollArea.Scrollbar data-testid="track"><ScrollArea.Thumb /></ScrollArea.Scrollbar>
    </ScrollArea.Root>, { show: false });
    expect(view.getByTestId('viewport')).toHaveAttribute('tabindex', '-1');
    expect(view.getByTestId('viewport')).not.toHaveAttribute('data-has-overflow-y');
    await view.setProps({ show: true });
    await waitFor(() => expect(view.getByTestId('viewport')).toHaveAttribute('data-has-overflow-x'));
    await waitFor(() => expect(view.getByTestId('viewport')).toHaveAttribute('data-has-overflow-y'));
    expect(view.getByTestId('viewport')).toHaveAttribute('tabindex', '0');
    expect(view.getByTestId('track')).toBeVisible();
  });
  scenario('content', 'recomputes overflow when observed content resizes', async () => {
    const view = await renderProps((props: { size: number }) => <ScrollAreaFixture contentSize={props.size} />, { size: 100 });
    expect(view.queryByTestId('corner')).toBeNull();
    await view.setProps({ size: 1000 });
    await waitFor(() => expect(view.getByTestId('root')).toHaveAttribute('data-has-overflow-y'));
    await waitFor(() => expect(view.getByTestId('corner').style.width).toBe('10px'));
    await view.setProps({ size: 100 });
    await waitFor(() => expect(view.getByTestId('root')).not.toHaveAttribute('data-has-overflow-y'));
    expect(view.queryByTestId('corner')).toBeNull();
    for (const edge of ['x-start', 'x-end', 'y-start', 'y-end']) expect(view.getByTestId('viewport').style.getPropertyValue(`--scroll-area-overflow-${edge}`)).toBe('0px');
  });
  scenario('corner', 'applies correct corner size when both scrollbars are present', async () => {
    const view = await area();
    await waitFor(() => expect(view.getByTestId('corner').offsetWidth).toBe(10));
    expect(view.getByTestId('corner').offsetHeight).toBe(10);
    expect(getComputedStyle(view.getByTestId('root')).getPropertyValue('--scroll-area-corner-width')).toBe('10px');
    expect(getComputedStyle(view.getByTestId('corner')).getPropertyValue('--scroll-area-corner-width')).toBe('10px');
    expect(getComputedStyle(view.getByTestId('corner')).getPropertyValue('--scroll-area-corner-height')).toBe('10px');
  });
  for (const offsets of ['none', 'padding', 'thumb-margin', 'track-margin'] as const) {
    scenario('root', `thumb geometry accounts for ${offsets}`, async () => {
      const view = await render(() => <ScrollAreaFixture scrollbar={{ style: { width: '10px',
        ...(offsets === 'padding' ? { 'padding-block': '8px' } : {}),
        ...(offsets === 'track-margin' ? { 'margin-inline': '11px' } : {}),
      } }} thumb={{ style: offsets === 'thumb-margin' ? { 'margin-block': '8px' } : {} }} />);
      const thumb = view.getByTestId('thumb-y'); const track = view.getByTestId('vertical'); const viewport = view.getByTestId('viewport');
      await waitFor(() => expect(thumb.offsetHeight).toBeGreaterThan(0));
      await waitFor(() => {
        // Corner sizing changes the native track length after its first mount.
        // Read the source formula's live geometry rather than a pre-corner snapshot.
        const available = Math.min(track.offsetHeight, viewport.clientHeight - getOffset(track, 'padding', 'y') - getOffset(thumb, 'margin', 'y'));
        expect(parseFloat(getComputedStyle(thumb).getPropertyValue('--scroll-area-thumb-height'))).toBeCloseTo(Math.max(16, available * viewport.clientHeight / viewport.scrollHeight), 1);
      });
      const contentStyle = getComputedStyle(view.getByTestId('content'));
      expect(parseFloat(contentStyle.paddingLeft) || 0).toBe(0);
      expect(parseFloat(contentStyle.paddingRight) || 0).toBe(0);
      expect(parseFloat(contentStyle.paddingBottom) || 0).toBe(0);
    });
  }
  // Literal upstream sizing fixtures: no corner, and track margins on the
  // cross-axis. Neither changes the available length or adds content padding.
  for (const offsets of ['none', 'padding', 'thumb-margin', 'track-margin'] as const) {
    scenario('root', `source sizing without corner (${offsets})`, async () => {
      const viewportSize = offsets === 'track-margin' ? 390 : 200;
      const view = await render(() => <ScrollArea.Root style={{ width: `${viewportSize}px`, height: `${viewportSize}px` }}>
        <ScrollArea.Viewport data-testid="viewport" style={{ width: '100%', height: '100%' }}>
          <div style={{ width: '1000px', height: '1000px' }} />
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar data-testid="vertical" style={{
          ...(offsets === 'padding' ? { 'padding-block': '8px' } : {}),
          ...(offsets === 'track-margin' ? { 'margin-inline': '11px' } : {}),
        }}><ScrollArea.Thumb data-testid="thumb-y" style={offsets === 'thumb-margin' ? { 'margin-block': '8px' } : {}} /></ScrollArea.Scrollbar>
        <ScrollArea.Scrollbar orientation="horizontal" data-testid="horizontal" style={{
          ...(offsets === 'padding' ? { 'padding-inline': '8px' } : {}),
          ...(offsets === 'track-margin' ? { 'margin-block': '11px' } : {}),
        }}><ScrollArea.Thumb data-testid="thumb-x" style={offsets === 'thumb-margin' ? { 'margin-inline': '8px' } : {}} /></ScrollArea.Scrollbar>
      </ScrollArea.Root>);
      const expected = (viewportSize - (offsets === 'padding' || offsets === 'thumb-margin' ? 16 : 0)) * (viewportSize / 1000);
      await waitFor(() => expect(getComputedStyle(view.getByTestId('thumb-y')).getPropertyValue('--scroll-area-thumb-height')).toBe(`${expected}px`));
      await waitFor(() => expect(getComputedStyle(view.getByTestId('thumb-x')).getPropertyValue('--scroll-area-thumb-width')).toBe(`${expected}px`));
      const content = getComputedStyle(view.getByTestId('viewport').firstElementChild!);
      expect(content.paddingLeft).toBe('0px');
      expect(content.paddingRight).toBe('0px');
      expect(content.paddingBottom).toBe('0px');
    });
  }
  for (const direction of ['ltr', 'rtl'] as const) {
    scenario('root', `logical overflow attributes and near-edge rounding (${direction})`, async () => {
      const view = await area(direction); const viewport = view.getByTestId('viewport');
      expect(view.getByTestId('root')).toHaveAttribute('data-has-overflow-x');
      expect(view.getByTestId('root')).not.toHaveAttribute('data-overflow-x-start');
      expect(view.getByTestId('root')).toHaveAttribute('data-overflow-x-end');
      viewport.scrollLeft = (direction === 'rtl' ? -1 : 1) * 400; viewport.scrollTop = 400;
      fireEvent.scroll(viewport); flush();
      for (const part of ['root', 'viewport', 'content', 'vertical', 'horizontal']) {
        expect(view.getByTestId(part)).toHaveAttribute('data-overflow-x-start');
        expect(view.getByTestId(part)).toHaveAttribute('data-overflow-x-end');
      }
      viewport.scrollLeft = (direction === 'rtl' ? -1 : 1) * (viewport.scrollWidth - viewport.clientWidth - .5);
      viewport.scrollTop = viewport.scrollHeight - viewport.clientHeight - .5;
      fireEvent.scroll(viewport); flush();
      expect(viewport).not.toHaveAttribute('data-overflow-x-end');
      for (const axis of ['x', 'y']) {
        expect(view.getByTestId('root')).toHaveAttribute(`data-overflow-${axis}-start`);
        expect(view.getByTestId('root')).not.toHaveAttribute(`data-overflow-${axis}-end`);
      }
    });
    scenario('thumb', `horizontal dragging and cancellation (${direction})`, async () => {
      const view = await area(direction); const viewport = view.getByTestId('viewport'); const thumb = view.getByTestId('thumb-x');
      firePointer.down(thumb, { button: 0, pointerId: 1, clientX: 100, timeStamp: 1 });
      firePointer.move(thumb, { buttons: 1, pointerId: 1, clientX: direction === 'rtl' ? 80 : 120, timeStamp: 2 }); flush();
      expect(direction === 'rtl' ? viewport.scrollLeft < 0 : viewport.scrollLeft > 0).toBe(true);
      expect(thumb).toHaveAttribute('data-scrolling');
      fireEvent.pointerCancel(thumb, { pointerId: 1 }); flush();
      expect(thumb).not.toHaveAttribute('data-scrolling');
      expect(viewport.style.scrollSnapType).toBe('both mandatory');
    });
    scenario('scrollbar', `horizontal track click and wheel visibility registration (${direction})`, async () => {
      const view = await area(direction); const viewport = view.getByTestId('viewport'); const track = view.getByTestId('horizontal');
      const rect = track.getBoundingClientRect();
      firePointer.down(track, { button: 0, pointerId: 1, clientX: direction === 'rtl' ? rect.left + 5 : rect.right - 5, clientY: rect.top + 5, timeStamp: 1 });
      expect(direction === 'rtl' ? viewport.scrollLeft < 0 : viewport.scrollLeft > 0).toBe(true);
      firePointer.up(track, { pointerId: 1, timeStamp: 2 });
      viewport.scrollLeft = 0;
      expect(fireEvent.wheel(track, { deltaX: direction === 'rtl' ? -50 : 50 })).toBe(false);
      expect(viewport.scrollLeft).toBe(direction === 'rtl' ? -50 : 50);
    });
    for (const edge of ['start', 'end'] as const) scenario('viewport', `horizontal overscroll shrinks and pins (${direction},${edge})`, async () => {
      const view = await area(direction); const viewport = view.getByTestId('viewport'); const track = view.getByTestId('horizontal'); const thumb = view.getByTestId('thumb-x');
      const resting = thumb.getBoundingClientRect().width;
      const max = viewport.scrollWidth - viewport.clientWidth;
      const offset = edge === 'start' ? -50 : max + 50;
      Object.defineProperty(viewport, 'scrollLeft', { configurable: true, get: () => direction === 'rtl' ? -offset : offset });
      fireEvent.scroll(viewport); flush();
      expect(thumb.getBoundingClientRect().width).toBeLessThan(resting);
      expect(thumb.getBoundingClientRect().width).toBeGreaterThan(resting * .9);
      const side = (edge === 'start') === (direction === 'ltr') ? 'left' : 'right';
      expect(thumb.getBoundingClientRect()[side]).toBeCloseTo(track.getBoundingClientRect()[side], 0);
    });
  }
  for (const edge of ['start', 'end'] as const) scenario('viewport', `vertical overscroll pins and restores resting size (${edge})`, async () => {
    const view = await area(); const viewport = view.getByTestId('viewport'); const thumb = view.getByTestId('thumb-y'); const track = view.getByTestId('vertical');
    const resting = thumb.getBoundingClientRect().height;
    let offset = edge === 'start' ? -50 : viewport.scrollHeight - viewport.clientHeight + 50;
    Object.defineProperty(viewport, 'scrollTop', { configurable: true, get: () => offset });
    fireEvent.scroll(viewport); flush();
    expect(thumb.getBoundingClientRect().height).toBeLessThan(resting);
    expect(thumb.getBoundingClientRect().height).toBeGreaterThan(resting * .9);
    const side = edge === 'start' ? 'top' : 'bottom';
    expect(thumb.getBoundingClientRect()[side]).toBeCloseTo(track.getBoundingClientRect()[side], 0);
    offset = 100; fireEvent.scroll(viewport); flush();
    expect(thumb.getBoundingClientRect().height).toBeCloseTo(resting, 0);
    expect(thumb.style.getPropertyValue('--scroll-area-thumb-height')).toBe('');
  });
  for (const height of [10, 16]) scenario('scrollbar', `track and thumb no-op when travel is nonpositive (${height}px)`, async () => {
    const view = await render(() => <ScrollAreaFixture scrollbar={{ style: { height: `${height}px`, bottom: 'auto', width: '10px' } }} />);
    const viewport = view.getByTestId('viewport'); const thumb = view.getByTestId('thumb-y'); const track = view.getByTestId('vertical');
    await waitFor(() => expect(thumb.offsetHeight).toBe(16));
    viewport.scrollTop = 400;
    firePointer.down(track, { button: 0, pointerId: 1, clientY: 5, timeStamp: 1 }); expect(viewport.scrollTop).toBe(400);
    firePointer.down(thumb, { button: 0, pointerId: 1, clientY: 0, timeStamp: 2 });
    firePointer.move(thumb, { buttons: 1, pointerId: 1, clientY: 20, timeStamp: 3 }); expect(viewport.scrollTop).toBe(400);
    firePointer.up(thumb, { pointerId: 1, timeStamp: 4 });
  });
  scenario('scrollbar', 'does not snap initial jump-to-click; release restores and re-snaps', async () => {
    const view = await render(() => <ScrollArea.Root style={{ width: '400px', height: '200px' }}>
      <ScrollArea.Viewport data-testid="viewport" style={{ width: '100%', height: '100%', 'scroll-snap-type': 'x mandatory' }}>
        <div style={{ display: 'flex', width: '2000px' }}>{Array.from({ length: 10 }, () => <div style={{ 'flex-shrink': 0, width: '200px', height: '100px', 'scroll-snap-align': 'start' }} />)}</div>
      </ScrollArea.Viewport><ScrollArea.Scrollbar orientation="horizontal" data-testid="track" keepMounted style={{ height: '10px' }}><ScrollArea.Thumb data-testid="thumb" ref={capture} /></ScrollArea.Scrollbar>
    </ScrollArea.Root>);
    const viewport = view.getByTestId('viewport'); const track = view.getByTestId('track'); const thumb = view.getByTestId('thumb');
    await waitFor(() => expect(thumb.offsetWidth).toBeGreaterThan(0));
    const rect = track.getBoundingClientRect();
    const x = rect.left + 900 / (viewport.scrollWidth - viewport.clientWidth) * (track.offsetWidth - thumb.offsetWidth) + thumb.offsetWidth / 2;
    firePointer.down(track, { button: 0, pointerId: 1, clientX: x, clientY: rect.top + 5, timeStamp: 1 });
    expect(Math.abs(viewport.scrollLeft - 900)).toBeLessThanOrEqual(1);
    firePointer.up(track, { pointerId: 1, timeStamp: 2 });
    expect(viewport.style.scrollSnapType).toBe('x mandatory');
    await waitFor(() => expect(viewport.scrollLeft % 200).toBe(0));
  });
  scenario('thumb', 'missed release ends on buttonless move without scrolling on hover', async () => {
    const view = await area(); const viewport = view.getByTestId('viewport'); const thumb = view.getByTestId('thumb-y');
    firePointer.down(thumb, { button: 0, pointerId: 1, clientY: 0, timeStamp: 1 });
    firePointer.move(thumb, { buttons: 1, pointerId: 1, clientY: 20, timeStamp: 2 });
    expect(viewport.scrollTop).toBeGreaterThan(0);
    const position = viewport.scrollTop;
    firePointer.move(thumb, { buttons: 0, pointerId: 2, clientY: 80, timeStamp: 3 }); expect(viewport.style.scrollSnapType).toBe('none');
    expect(viewport.scrollTop).toBe(position);
    firePointer.move(thumb, { buttons: 1, pointerId: 1, clientY: 60, timeStamp: 4 });
    expect(viewport.scrollTop).toBeGreaterThan(position);
    const continued = viewport.scrollTop;
    await waitFor(() => expect(thumb).toHaveAttribute('data-scrolling'));
    firePointer.move(thumb, { buttons: 0, pointerId: 1, clientY: 100, timeStamp: 5 }); flush();
    expect(viewport.scrollTop).toBe(continued); expect(thumb).not.toHaveAttribute('data-scrolling');
    expect(viewport.style.scrollSnapType).toBe('both mandatory');
    firePointer.move(thumb, { buttons: 0, pointerId: 1, clientY: 140, timeStamp: 6 });
    expect(viewport.scrollTop).toBe(continued);
  });
  scenario('scrollbar', 'nested wheel preserves native chain cancellation at both edges', async () => {
    const prevented: boolean[] = [];
    const view = await render(() => <ScrollArea.Root style={{ width: '220px', height: '220px' }}>
      <ScrollArea.Viewport data-testid="outer-viewport" style={{ width: '100%', height: '100%' }}
        onWheel={(event) => prevented.push(event.defaultPrevented)}>
        <ScrollArea.Content><ScrollAreaFixture /><div style={{ height: '1000px' }} /></ScrollArea.Content>
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar data-testid="outer-track" keepMounted><ScrollArea.Thumb /></ScrollArea.Scrollbar>
    </ScrollArea.Root>);
    const track = view.getByTestId('vertical'); const viewport = view.getByTestId('viewport');
    await waitFor(() => expect(viewport).toHaveAttribute('data-has-overflow-y'));
    await waitFor(() => expect(view.getByTestId('outer-viewport')).toHaveAttribute('data-has-overflow-y'));
    viewport.scrollTop = 400; fireEvent.wheel(track, { deltaY: 50 }); expect(prevented.pop()).toBe(true);
    viewport.scrollTop = 800; fireEvent.wheel(track, { deltaY: 50 }); expect(prevented.pop()).toBe(false);
    viewport.scrollTop = 0; fireEvent.wheel(track, { deltaY: -50 }); expect(prevented.pop()).toBe(false);
  });
  scenario('scrollbar', 'mouse track/thumb press preserves focus for all buttons', async () => {
    const view = await render(() => <><input aria-label="focused" /><ScrollAreaFixture /></>);
    const input = view.getByRole('textbox'); input.focus();
    const track = view.getByTestId('vertical'); const thumb = view.getByTestId('thumb-y');
    await waitFor(() => expect(thumb.offsetHeight).toBeGreaterThan(0));
    for (const target of [track, thumb]) {
      for (const keys of ['[MouseLeft]', '[MouseMiddle]', '[MouseRight]']) {
        await view.user.pointer({ target, keys });
        expect(input.ownerDocument.activeElement).toBe(input);
      }
    }
  });
  scenario('root', 'direction and thresholds update existing viewport geometry', async () => {
    const view = await renderProps((props: { direction: 'ltr' | 'rtl'; threshold: number }) => <ScrollAreaFixture direction={props.direction} root={{ overflowEdgeThreshold: props.threshold }} />, { direction: 'ltr', threshold: 5 });
    const viewport = view.getByTestId('viewport'); viewport.scrollLeft = 10; fireEvent.scroll(viewport);
    await waitFor(() => expect(viewport).toHaveAttribute('data-overflow-x-start'));
    await view.setProps({ threshold: 20 }); await waitFor(() => expect(viewport).not.toHaveAttribute('data-overflow-x-start'));
    await view.setProps({ direction: 'rtl', threshold: 0 }); viewport.scrollLeft = -800; fireEvent.scroll(viewport);
    await waitFor(() => expect(viewport).not.toHaveAttribute('data-overflow-x-end'));
    expect(view.getByTestId('viewport')).toBe(viewport);
  });
  scenario('scrollbar', 'hover follows shadow native path and track ignores thumb native path', async () => {
    const view = await area(); const track = view.getByTestId('vertical'); const thumb = view.getByTestId('thumb-y'); const viewport = view.getByTestId('viewport');
    const host = document.createElement('span'); thumb.append(host);
    const child = document.createElement('span'); host.attachShadow({ mode: 'open' }).append(child);
    child.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, composed: true, pointerType: 'mouse' })); flush();
    expect(track).toHaveAttribute('data-hovering');
    child.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true, button: 0, pointerId: 1, clientY: 160 }));
    expect(viewport.scrollTop).toBe(0);
    child.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, composed: true, pointerId: 1 }));
  });
  scenario('viewport', 'animation completion recomputes overflow and ignores disposed viewport', async () => {
    const view = await render(() => {
      const [mounted, setMounted] = createSignal(true);
      return <><button onClick={() => setMounted(false)}>remove</button><ScrollArea.Root style={{ width: '200px', height: '200px' }}>
        {mounted() && <ScrollArea.Viewport data-testid="viewport" style={{ width: '100%', height: '100%' }}>
          <ScrollArea.Content data-testid="animated" style={{ width: '100px', height: '100px' }} />
        </ScrollArea.Viewport>}
      </ScrollArea.Root></>;
    });
    const content = view.getByTestId('animated'); const viewport = view.getByTestId('viewport');
    const animation = content.animate([{ width: '100px' }, { width: '1000px' }], { duration: 50, fill: 'forwards' });
    await animation.finished;
    await waitFor(() => expect(viewport).toHaveAttribute('data-has-overflow-x'));
    const pending = content.animate({ opacity: [0, 1] }, { duration: 50 });
    await view.user.click(view.getByRole('button', { name: 'remove' }));
    await pending.finished.catch(() => {});
    expect(view.queryByTestId('viewport')).toBeNull();
  });
  it.skipIf(!platform.engine.blink)(`[browser:bsolid-review-scroll-area-validation] [source:${source('viewport')}#completed animation target GC with a paused sibling]`, async () => {
    const { cdp } = await import('vitest/browser');
    const session = cdp();
    let targetRef!: WeakRef<HTMLDivElement>;
    let animationsRead = false;
    const view = await render(() => <ScrollArea.Root><ScrollArea.Viewport data-testid="viewport" ref={(node) => {
      if (!node || node.firstElementChild) return;
      const target = node.ownerDocument.createElement('div');
      const pausedTarget = node.ownerDocument.createElement('div');
      node.append(target, pausedTarget);
      targetRef = new WeakRef(target);
      for (const element of [target, pausedTarget]) {
        element.animate({ opacity: [0, 1] }, { duration: 1000, fill: 'forwards' }).pause();
      }
      // A spy would retain Animation results and invalidate the GC assertion.
      const getAnimations = node.getAnimations.bind(node);
      node.getAnimations = (options) => { animationsRead = true; return getAnimations(options); };
    }} /></ScrollArea.Root>);
    await waitFor(() => expect(animationsRead).toBe(true));
    const viewport = view.getByTestId('viewport');
    viewport.firstElementChild!.getAnimations()[0].finish();
    await flushMicrotasks();
    viewport.firstElementChild!.remove();
    await waitSingleFrame();
    await session.send('HeapProfiler.collectGarbage');
    expect(targetRef.deref()).toBeUndefined();
    expect(viewport.firstElementChild!.getAnimations()[0].playState).toBe('paused');
  });
});
import { useUnscaledBrowserFrame } from '../../../../test/harness/unscaled-frame';
useUnscaledBrowserFrame();
