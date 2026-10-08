import { createSignal, flush } from 'solid-js';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, waitFor } from '@testing-library/dom';
import { createRenderer } from '../../test/createRenderer';
import { firePointer } from '../../test/pointer';
import { advanceFrame } from '../../test/wait';
import { ScrollArea } from './index';
import { capture, dimensions, ScrollAreaFixture } from './ScrollArea.fixture';
import { CSPContext } from '../internals/csp-context/CSPContext';
import { platform } from '../utils/platform';
import { removeCSSVariableInheritance } from './viewport/ScrollAreaViewport';

function resizeObservers() {
  const instances: TestObserver[] = [];
  class TestObserver implements ResizeObserver {
    targets = new Set<Element>();
    disconnect = vi.fn(() => this.targets.clear());
    constructor(readonly callback: ResizeObserverCallback) { instances.push(this); }
    observe(target: Element) { this.targets.add(target); }
    unobserve(target: Element) { this.targets.delete(target); }
    notify() { this.callback([], this); }
  }
  const original = window.ResizeObserver;
  const animations = Object.getOwnPropertyDescriptor(Element.prototype, 'getAnimations');
  // These geometry fixtures opt into ResizeObserver in jsdom, which otherwise
  // lacks both observer delivery and Web Animations. Supply its empty animation
  // list locally; animation fixtures below install their own explicit promises.
  if (!animations) Object.defineProperty(Element.prototype, 'getAnimations', { configurable: true, writable: true, value: () => [] });
  window.ResizeObserver = TestObserver;
  return {
    forNode(node: Element) {
      const observer = instances.find((item) => item.targets.has(node));
      expect(observer).toBeDefined();
      return observer!;
    },
    restore() {
      window.ResizeObserver = original;
      if (!animations) Reflect.deleteProperty(Element.prototype, 'getAnimations');
    },
  };
}

describe('ScrollArea source measurement and resource lifetime', () => {
  const { render, renderProps } = createRenderer();

  // ScrollAreaRoot.test.tsx: recovery before the first observer delivery;
  // ScrollAreaViewport.tsx: skip only an identical initial metrics snapshot.
  for (const changed of [false, true]) it(`first viewport observer delivery (${changed ? 'changed' : 'unchanged'} dimensions)`, async () => {
    const observers = resizeObservers();
    try {
      const view = await render(() => <ScrollAreaFixture mock />);
      const viewport = view.getByTestId('viewport');
      await waitFor(() => expect(view.getByTestId('corner').style.width).toBe('10px'));
      const observer = observers.forNode(viewport);
      const write = vi.spyOn(viewport.style, 'setProperty');
      if (changed) dimensions(viewport, { scrollWidth: 100, scrollHeight: 100 });
      observer.notify(); flush();
      if (changed) {
        await waitFor(() => expect(viewport).not.toHaveAttribute('data-has-overflow-x'));
        expect(viewport).not.toHaveAttribute('data-has-overflow-x');
        expect(viewport).not.toHaveAttribute('data-has-overflow-y');
        expect(viewport).toHaveAttribute('tabindex', '-1');
        expect(view.queryByTestId('corner')).toBeNull();
        expect(viewport.style.getPropertyValue('--scroll-area-overflow-y-end')).toBe('0px');
      } else {
        expect(write).not.toHaveBeenCalled();
        // Only the initial delivery is deduplicated: later resizes recompute.
        dimensions(viewport, { scrollHeight: 100 });
        observer.notify(); flush();
        await waitFor(() => expect(viewport).not.toHaveAttribute('data-has-overflow-y'));
        expect(viewport).not.toHaveAttribute('data-has-overflow-y');
      }
      view.unmount();
      expect(observer.disconnect).toHaveBeenCalledOnce();
    } finally { observers.restore(); }
  });

  it('coalesces viewport/content deliveries outside the observer callback and cancels pending frames on disposal', async () => {
    const observers = resizeObservers();
    const view = await render(() => <ScrollAreaFixture mock />);
    try {
      const viewport = view.getByTestId('viewport');
      await waitFor(() => expect(view.getByTestId('corner').style.width).toBe('10px'));
      const viewportObserver = observers.forNode(viewport);
      const contentObserver = observers.forNode(view.getByTestId('content'));
      viewportObserver.notify(); contentObserver.notify();
      vi.useFakeTimers();
      const request = vi.spyOn(globalThis, 'requestAnimationFrame');
      const cancel = vi.spyOn(globalThis, 'cancelAnimationFrame');
      const write = vi.spyOn(viewport.style, 'setProperty');
      dimensions(viewport, { scrollHeight: 800 });
      viewportObserver.notify(); contentObserver.notify(); viewportObserver.notify();
      expect(write).not.toHaveBeenCalled();
      expect(request).toHaveBeenCalledOnce();
      await advanceFrame();
      expect(viewport.style.getPropertyValue('--scroll-area-overflow-y-end')).toBe('600px');
      write.mockClear();
      contentObserver.notify();
      view.unmount();
      expect(cancel).toHaveBeenCalled();
      await advanceFrame();
      expect(write).not.toHaveBeenCalled();
      expect(viewportObserver.disconnect).toHaveBeenCalledOnce();
      expect(contentObserver.disconnect).toHaveBeenCalledOnce();
    } finally { view.unmount(); vi.useRealTimers(); observers.restore(); }
  });

  it('measures late content before its first observer delivery and disconnects it on removal', async () => {
    const observers = resizeObservers();
    let viewport: HTMLDivElement | null = null;
    try {
      const view = await renderProps((props: { content: boolean }) => <ScrollArea.Root>
        <ScrollArea.Viewport data-testid="viewport" ref={(node) => { viewport = node; dimensions(node, { clientWidth: 200, clientHeight: 200, scrollWidth: 200, scrollHeight: 200 }); }}>
          {props.content && <ScrollArea.Content data-testid="content" ref={() => dimensions(viewport, { scrollWidth: 1000, scrollHeight: 1000 })} />}
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar data-testid="track"><ScrollArea.Thumb /></ScrollArea.Scrollbar>
      </ScrollArea.Root>, { content: false });
      expect(view.getByTestId('viewport')).toHaveAttribute('tabindex', '-1');
      await view.setProps({ content: true });
      await waitFor(() => expect(view.getByTestId('viewport')).toHaveAttribute('tabindex', '0'));
      expect(view.getByTestId('track')).toBeInTheDocument();
      const observer = observers.forNode(view.getByTestId('content'));
      await view.setProps({ content: false });
      expect(observer.disconnect).toHaveBeenCalledOnce();
    } finally { observers.restore(); }
  });

  // ScrollAreaViewport.test.tsx: finite completion must not wait for infinite
  // animations, and a completion after disposal must not measure a dead tree.
  for (const timing of [undefined, { iterations: Infinity }, { duration: Infinity, iterations: 1 }]) {
    it(`recomputes after finite animation completion (${JSON.stringify(timing) ?? 'finite only'})`, async () => {
      const observers = resizeObservers();
      let complete!: () => void;
      const finished = new Promise<void>((resolve) => { complete = resolve; });
      const readAnimations = vi.fn(() => [
        { finished },
        ...(timing ? [{ finished: new Promise<void>(() => {}), effect: { getTiming: () => timing } }] : []),
      ] as unknown as Animation[]);
      try {
        const view = await render(() => <ScrollArea.Root><ScrollArea.Viewport data-testid="viewport" ref={(node) => {
          if (!node) return;
          dimensions(node, { clientWidth: 200, clientHeight: 200, scrollWidth: 200, scrollHeight: 200 });
          node.getAnimations = readAnimations;
        }} /></ScrollArea.Root>);
        await waitFor(() => expect(readAnimations).toHaveBeenCalled());
        const viewport = view.getByTestId('viewport');
        expect(viewport).not.toHaveAttribute('data-has-overflow-x');
        dimensions(viewport, { scrollWidth: 1000 });
        complete();
        await waitFor(() => expect(viewport).toHaveAttribute('data-has-overflow-x'));
        view.unmount();
      } finally { observers.restore(); }
    });
  }

  it('ignores a pending animation and stale observer delivery after viewport disposal', async () => {
    const observers = resizeObservers();
    let complete!: () => void;
    const finished = new Promise<void>((resolve) => { complete = resolve; });
    const readAnimations = vi.fn(() => [{ finished }] as unknown as Animation[]);
    try {
      const view = await renderProps((props: { mounted: boolean }) => <ScrollArea.Root>
        {props.mounted && <ScrollArea.Viewport data-testid="viewport" ref={(node) => { if (node) node.getAnimations = readAnimations; }} />}
      </ScrollArea.Root>, { mounted: true });
      await waitFor(() => expect(readAnimations).toHaveBeenCalled());
      const viewport = view.getByTestId('viewport');
      const observer = observers.forNode(viewport);
      await view.setProps({ mounted: false });
      const write = vi.spyOn(viewport.style, 'setProperty');
      observer.notify(); complete();
      await finished;
      await Promise.resolve();
      expect(write).not.toHaveBeenCalled();
      expect(observer.disconnect).toHaveBeenCalledOnce();
      expect(view.queryByTestId('viewport')).toBeNull();
    } finally { observers.restore(); }
  });

  it('retains a shared CSP stylesheet until the last root is disposed', async () => {
    const selector = 'style[data-base-ui-style="base-ui-disable-scrollbar"]';
    const app = () => <CSPContext value={{ nonce: 'scroll-lease' }}><ScrollArea.Root /></CSPContext>;
    const first = await render(app);
    const second = await render(app);
    const doc = first.container.ownerDocument;
    expect(doc.querySelectorAll(selector)).toHaveLength(1);
    // Native nonce hiding removes the content attribute's value; the nonce
    // property retains the actual CSP token.
    expect(doc.querySelector<HTMLStyleElement>(selector)?.nonce).toBe('scroll-lease');
    first.unmount();
    expect(doc.querySelectorAll(selector)).toHaveLength(1);
    second.unmount();
    expect(doc.querySelector(selector)).toBeNull();
  });

  for (const webkit of [false, true]) it(`CSS overflow property registration (${webkit ? 'WebKit exception' : 'noninheriting, once per realm'})`, () => {
    const descriptor = Object.getOwnPropertyDescriptor(window, 'CSS');
    const engine = vi.spyOn(platform.engine, 'webkit', 'get').mockReturnValue(webkit);
    const registerProperty = vi.fn();
    Object.defineProperty(window, 'CSS', { configurable: true, value: { registerProperty } });
    try {
      const viewport = document.createElement('div');
      removeCSSVariableInheritance(viewport);
      removeCSSVariableInheritance(viewport);
      expect(registerProperty).toHaveBeenCalledTimes(webkit ? 0 : 4);
      if (!webkit) for (const edge of ['x-start', 'x-end', 'y-start', 'y-end']) {
        expect(registerProperty).toHaveBeenCalledWith({ name: `--scroll-area-overflow-${edge}`, syntax: '<length>', inherits: false, initialValue: '0px' });
      }
    } finally {
      engine.mockRestore();
      if (descriptor) Object.defineProperty(window, 'CSS', descriptor);
      else Reflect.deleteProperty(window, 'CSS');
    }
  });

  it('restores snap and capture when the kept track changes orientation mid-drag', async () => {
    const view = await renderProps((props: { orientation: 'vertical' | 'horizontal' }) => <ScrollArea.Root>
      <ScrollArea.Viewport data-testid="viewport" style={{ 'scroll-snap-type': 'both mandatory' }} />
      <ScrollArea.Scrollbar keepMounted orientation={props.orientation}><ScrollArea.Thumb data-testid="thumb" ref={capture} /></ScrollArea.Scrollbar>
    </ScrollArea.Root>, { orientation: 'vertical' });
    const thumb = view.getByTestId('thumb');
    const release = vi.spyOn(thumb, 'releasePointerCapture');
    firePointer.down(thumb, { pointerId: 1, button: 0, timeStamp: 1 });
    expect(view.getByTestId('viewport').style.scrollSnapType).toBe('none');
    await view.setProps({ orientation: 'horizontal' });
    expect(view.getByTestId('thumb')).toBe(thumb);
    expect(view.getByTestId('viewport').style.scrollSnapType).toBe('both mandatory');
    expect(release).toHaveBeenCalledWith(1);
    firePointer.move(thumb, { pointerId: 1, buttons: 1, clientX: 20, timeStamp: 2 });
    expect(view.getByTestId('viewport').scrollLeft).toBe(0);
  });

  it('rechecks the track after a wheel callback removes it', async () => {
    const view = await render(() => {
      const [mounted, setMounted] = createSignal(true);
      return <ScrollArea.Root><ScrollArea.Viewport data-testid="viewport" ref={(node) => dimensions(node, { clientHeight: 200, scrollHeight: 1000 })} />
        {mounted() && <ScrollArea.Scrollbar keepMounted data-testid="track" onWheel={() => { setMounted(false); flush(); }} />}
      </ScrollArea.Root>;
    });
    expect(fireEvent.wheel(view.getByTestId('track'), { deltaY: 50 })).toBe(true);
    expect(view.getByTestId('viewport').scrollTop).toBe(0);
    expect(view.queryByTestId('track')).toBeNull();
  });
});
