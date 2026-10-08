import { describe, expect, vi } from 'vitest';
import type { JSX } from '@solidjs/web';
import { createRenderer, browserCase, waitFor, advanceTimers, advanceFrame } from '../../../test';
import { screen } from '@solidjs/testing-library';
import { Drawer } from '../index';
import { KeyboardFixture, dispatchTouch } from '../test/KeyboardFixture';
import { mockKeyboardViewport, mockKeyboardScroll, rect, animationFrames } from '../test/keyboardGeometry';

describe('Drawer keyboard geometry — browser pending', () => {
  const { render, renderProps } = createRenderer();
  const source = 'packages/react/src/drawer/virtual-keyboard-provider/DrawerVirtualKeyboardProvider.test.tsx';
  const keyboardCase = (name: string, run: () => Promise<void>) => browserCase({ source, case: name, environment: 'browser', issue: 'bsolid-browser', adaptation: 'Native browser focus/RAF with source mobile visual/layout viewport geometry fixture' }, run);
  function KeyboardSheet(props: { children?: JSX.Element }) {
    return <Drawer.Root open modal={false}><Drawer.VirtualKeyboardProvider><Drawer.Portal><Drawer.Viewport data-testid="viewport"><Drawer.Popup initialFocus={false}>
      {props.children}
    </Drawer.Popup></Drawer.Viewport></Drawer.Portal></Drawer.VirtualKeyboardProvider></Drawer.Root>;
  }

  for (const padding of [20, 0]) keyboardCase(padding ? 'compensates for keyboard overlap without adding extra spacing and centers the focused input' : 'tops the scroll container padding up to the visibility margin below the overlap', async () => {
    const viewport = mockKeyboardViewport();
    const view = await render(() => <KeyboardSheet><Drawer.Content data-testid="scroll"><div style={{ height: '900px' }} /><input data-testid="field" /></Drawer.Content></KeyboardSheet>);
    const scroll = screen.getByTestId('scroll'); const field = screen.getByTestId('field');
    const geometry = mockKeyboardScroll(scroll, field, padding);
    try {
      field.focus(); scroll.scrollTop = 0; viewport.resize(500);
      await waitFor(() => expect(scroll.style.paddingBottom).toBe(`${220 + Math.max(padding, 16)}px`));
      expect(scroll.style.scrollPaddingBottom).toBe('16px'); expect(scroll.style.overflowAnchor).toBe('none');
      await waitFor(() => expect(geometry.scrollTo).toHaveBeenCalled());
      expect(geometry.scrollTo).toHaveBeenCalledWith(expect.objectContaining({ top: 270 }));
      expect(scroll.scrollTop).toBe(270);
      const fieldRect = field.getBoundingClientRect();
      expect((fieldRect.top + fieldRect.bottom) / 2).toBeCloseTo((300 + 500) / 2, 0);
      expect(screen.getByTestId('viewport').style.getPropertyValue('--drawer-keyboard-inset')).toBe('300px');
      view.unmount();
      expect(scroll.style.paddingBottom).toBe(`${padding}px`); expect(scroll.style.scrollPaddingBottom).toBe(''); expect(scroll.style.overflowAnchor).toBe('auto');
    } finally { view.unmount(); geometry.restore(); viewport.restore(); }
  });

  keyboardCase('sets the keyboard inset CSS variable for a focused input without a scroll target', async () => {
    const viewport = mockKeyboardViewport();
    const view = await render(() => <KeyboardFixture><input data-testid="field" /></KeyboardFixture>);
    try { view.getByTestId('field').focus(); viewport.resize(500); await waitFor(() => expect(view.getByTestId('viewport').style.getPropertyValue('--drawer-keyboard-inset')).toBe('300px')); }
    finally { view.unmount(); viewport.restore(); }
  });
  for (const [name, height, zoom, offset, expected] of [
    ['does not treat a small visual viewport reduction as the software keyboard', 760, 1, 0, '0px'],
    ['does not add keyboard scroll slack while pinch-zoomed', 500, 2, 0, '0px'],
    ['computes the keyboard inset from a non-zero visual viewport offset', 500, 1, 40, '260px'],
  ] as const) keyboardCase(name, async () => {
    const viewport = mockKeyboardViewport();
    const view = await render(() => <KeyboardFixture><div data-testid="scroll"><input data-testid="field" /></div></KeyboardFixture>);
    const geometry = mockKeyboardScroll(view.getByTestId('scroll'), view.getByTestId('field'));
    try {
      view.getByTestId('field').focus(); viewport.resize(height); viewport.zoom(zoom); viewport.scroll(offset);
      await waitFor(() => expect(view.getByTestId('viewport').style.getPropertyValue('--drawer-keyboard-inset')).toBe(expected));
      if (expected === '0px') expect(view.getByTestId('scroll').style.paddingBottom).toBe('20px');
    } finally { view.unmount(); geometry.restore(); viewport.restore(); }
  });
  keyboardCase('does not add keyboard scroll slack by default', async () => {
    const viewport = mockKeyboardViewport();
    const view = await render(() => <Drawer.Root open modal={false}><Drawer.Portal><Drawer.Viewport><Drawer.Popup initialFocus={false}><div data-testid="scroll"><input data-testid="field" /></div></Drawer.Popup></Drawer.Viewport></Drawer.Portal></Drawer.Root>);
    const geometry = mockKeyboardScroll(screen.getByTestId('scroll'), screen.getByTestId('field'));
    try { screen.getByTestId('field').focus(); viewport.resize(500); await animationFrames(3); expect(screen.getByTestId('scroll').style.paddingBottom).toBe('20px'); expect(geometry.scrollTo).not.toHaveBeenCalled(); }
    finally { view.unmount(); geometry.restore(); viewport.restore(); }
  });
  keyboardCase('restores keyboard scroll slack when the drawer closes', async () => {
    const viewport = mockKeyboardViewport();
    const view = await renderProps((props: { open: boolean }) => <KeyboardFixture open={props.open}><div data-testid="scroll"><input data-testid="field" /></div></KeyboardFixture>, { open: true });
    const scroll = view.getByTestId('scroll'); const root = view.getByTestId('viewport');
    const geometry = mockKeyboardScroll(scroll, view.getByTestId('field'));
    try {
      view.getByTestId('field').focus(); viewport.resize(500);
      await waitFor(() => expect(scroll.style.paddingBottom).toBe('240px'));
      await view.setProps({ open: false });
      expect(scroll.style.paddingBottom).toBe('20px'); expect(root.style.getPropertyValue('--drawer-keyboard-inset')).toBe('');
      const calls = geometry.scrollTo.mock.calls.length;
      await animationFrames(3); expect(geometry.scrollTo.mock.calls.length).toBe(calls);
    } finally { view.unmount(); geometry.restore(); viewport.restore(); }
  });
  for (const action of ['blur', 'redirect'] as const) keyboardCase(action === 'blur' ? 'clears keyboard state when a tapped input blurs itself' : 'clears keyboard state when a tapped input redirects focus away', async () => {
    const viewport = mockKeyboardViewport();
    const view = await render(() => <><button data-testid="outside">Outside</button><KeyboardFixture><div data-testid="scroll"><input data-testid="field" /></div></KeyboardFixture></>);
    const scroll = view.getByTestId('scroll'); const field = view.getByTestId('field'); const geometry = mockKeyboardScroll(scroll, field);
    try {
      field.focus(); viewport.resize(500); await waitFor(() => expect(scroll.style.paddingBottom).toBe('240px'));
      if (action === 'blur') field.blur(); else view.getByTestId('outside').focus();
      await waitFor(() => expect(scroll.style.paddingBottom).toBe('20px'));
      expect(view.getByTestId('viewport').style.getPropertyValue('--drawer-keyboard-inset')).toBe('0px');
    } finally { view.unmount(); geometry.restore(); viewport.restore(); }
  });
  keyboardCase('clears inset and slack when the focused field is removed', async () => {
    const viewport = mockKeyboardViewport();
    const view = await render(() => <KeyboardFixture><div data-testid="scroll"><input data-testid="field" /></div></KeyboardFixture>);
    const scroll = view.getByTestId('scroll'); const field = view.getByTestId('field'); const geometry = mockKeyboardScroll(scroll, field);
    try {
      field.focus(); viewport.resize(500); await waitFor(() => expect(scroll.style.paddingBottom).toBe('240px'));
      field.remove(); viewport.scroll(1);
      await waitFor(() => expect(scroll.style.paddingBottom).toBe('20px'));
      expect(view.getByTestId('viewport').style.getPropertyValue('--drawer-keyboard-inset')).toBe('0px');
    } finally { view.unmount(); geometry.restore(); viewport.restore(); }
  });
  keyboardCase('does not restart a progressing or settled reduced-motion alignment scroll', async () => {
    const viewport = mockKeyboardViewport();
    const view = await render(() => <KeyboardSheet><Drawer.Content data-testid="scroll"><input data-testid="first" /><div style={{ height: '900px' }} /><input data-testid="field" /></Drawer.Content></KeyboardSheet>);
    const scroll = screen.getByTestId('scroll'), first = screen.getByTestId('first'), field = screen.getByTestId('field');
    const geometry = mockKeyboardScroll(scroll, field);
    first.getBoundingClientRect = () => rect(380 - scroll.scrollTop, 420 - scroll.scrollTop);
    const scrollTo = vi.fn(); scroll.scrollTo = scrollTo;
    const nativeMatchMedia = window.matchMedia.bind(window);
    const motion = vi.spyOn(window, 'matchMedia').mockImplementation(query => {
      const media = nativeMatchMedia(query);
      if (query === '(prefers-reduced-motion: reduce)') Object.defineProperty(media, 'matches', { configurable: true, value: true });
      return media;
    });
    vi.useFakeTimers();
    try {
      first.focus(); scroll.scrollTop = 0; viewport.resize(500);
      await advanceFrame(); await advanceFrame(); scrollTo.mockClear();
      field.focus(); await advanceFrame(); await advanceFrame();
      expect(scrollTo).toHaveBeenCalledExactlyOnceWith({ top: 270, behavior: 'auto' });
      scroll.scrollTop = 100; await advanceTimers(150);
      expect(scrollTo).toHaveBeenCalledTimes(1);
      scroll.scrollTop = 270; await advanceTimers(450);
      expect(scroll.scrollTop).toBe(270);
      expect(scrollTo).toHaveBeenCalledTimes(1);
    } finally { view.unmount(); motion.mockRestore(); geometry.restore(); viewport.restore(); vi.useRealTimers(); }
  });
  for (const neverSettles of [false, true]) keyboardCase(neverSettles ? 'eventually aligns when geometry never settles' : 'defers the alignment scroll until the destination stops moving', async () => {
    const viewport = mockKeyboardViewport();
    const view = await render(() => <KeyboardFixture><div data-testid="scroll"><input data-testid="field" /></div></KeyboardFixture>);
    const scroll = view.getByTestId('scroll'); const field = view.getByTestId('field'); const geometry = mockKeyboardScroll(scroll, field);
    let reads = 0;
    field.getBoundingClientRect = () => { reads++; const shift = neverSettles || reads < 8 ? reads % 2 * 8 : 0; return rect(650 + shift - scroll.scrollTop, 690 + shift - scroll.scrollTop); };
    try {
      field.focus(); viewport.resize(500); await animationFrames(3); expect(geometry.scrollTo).not.toHaveBeenCalled();
      await waitFor(() => expect(geometry.scrollTo).toHaveBeenCalled(), { timeout: 2500 });
      if (neverSettles) expect(reads).toBeGreaterThanOrEqual(61);
      else expect(reads).toBeGreaterThanOrEqual(8);
    } finally { view.unmount(); geometry.restore(); viewport.restore(); }
  });
  keyboardCase('stops pending realignment once the user starts scrolling while geometry is changing', async () => {
    const viewport = mockKeyboardViewport();
    const view = await render(() => <KeyboardFixture><div data-testid="scroll"><input data-testid="field" /></div></KeyboardFixture>);
    const scroll = view.getByTestId('scroll'); const field = view.getByTestId('field'); const geometry = mockKeyboardScroll(scroll, field);
    let reads = 0; field.getBoundingClientRect = () => rect(650 + ++reads % 2 * 8, 690 + reads % 2 * 8);
    try {
      field.focus(); viewport.resize(500); await animationFrames(3);
      field.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
      await animationFrames(5); expect(geometry.scrollTo).not.toHaveBeenCalled();
    } finally { view.unmount(); geometry.restore(); viewport.restore(); }
  });
  for (const layoutFirst of [true, false]) keyboardCase(layoutFirst ? 'applies no keyboard inset or slack when the small viewport follows the keyboard' : 'aligns the focused field once the layout viewport has shrunk to the visual viewport', async () => {
    const viewport = mockKeyboardViewport();
    const view = await render(() => <KeyboardFixture><div data-testid="scroll"><input data-testid="field" /></div></KeyboardFixture>);
    const scroll = view.getByTestId('scroll'); const field = view.getByTestId('field'); const geometry = mockKeyboardScroll(scroll, field);
    scroll.getBoundingClientRect = () => layoutFirst ? rect(window.innerHeight - 500, window.innerHeight - 80) : rect(100, 480);
    vi.useFakeTimers();
    try {
      field.focus(); scroll.scrollTop = 0;
      if (layoutFirst) viewport.layout(800, true);
      viewport.resize(500); await advanceFrame();
      if (layoutFirst) {
        expect(view.getByTestId('viewport').style.getPropertyValue('--drawer-keyboard-inset')).toBe('0px');
        expect(scroll.style.paddingBottom).toBe('20px');
        viewport.layout(650, true); await advanceFrame();
      } else {
        viewport.layout(500); await advanceTimers(200);
        const fieldRect = field.getBoundingClientRect();
        expect((fieldRect.top + fieldRect.bottom) / 2).toBeCloseTo((100 + 480) / 2, 0);
      }
      expect(scroll.style.paddingBottom).toBe('20px'); expect(view.getByTestId('viewport').style.getPropertyValue('--drawer-keyboard-inset')).toBe('0px');
    } finally { view.unmount(); geometry.restore(); viewport.restore(); vi.useRealTimers(); }
  });

  function LayoutSheet() {
    return <Drawer.Root open modal={false}><Drawer.VirtualKeyboardProvider><Drawer.Portal><Drawer.Viewport data-testid="viewport"><Drawer.Popup initialFocus={false}>
      <Drawer.Content data-testid="scroll" style={{ height: '420px', 'overflow-y': 'auto', 'padding-bottom': '20px' }}><input data-testid="field" /></Drawer.Content>
    </Drawer.Popup></Drawer.Viewport></Drawer.Portal></Drawer.VirtualKeyboardProvider></Drawer.Root>;
  }
  for (const mode of ['shrinking', 'shorter', 'plain-resize', 'catch-up'] as const) keyboardCase({
    shrinking: 'scrolls the focused field once the layout viewport reaches the visual viewport',
    shorter: 'waits for the layout viewport to grow to a shorter keyboard before scrolling',
    'plain-resize': 'does not treat a plain resize of both viewports as the software keyboard',
    'catch-up': 'clears the keyboard inset and slack once the layout viewport catches up with the visual viewport',
  }[mode], async () => {
    const viewport = mockKeyboardViewport();
    const view = await render(() => <LayoutSheet />);
    const root = screen.getByTestId('viewport'), scroll = screen.getByTestId('scroll'), field = screen.getByTestId('field');
    const geometry = mockKeyboardScroll(scroll, field);
    let bottom = mode === 'catch-up' ? 720 : 480;
    scroll.getBoundingClientRect = () => rect(bottom - 380, bottom);
    const scrollTo = vi.fn(); scroll.scrollTo = scrollTo;
    vi.useFakeTimers();
    try {
      field.focus();
      if (mode === 'plain-resize') {
        await advanceTimers(100);
        viewport.resize(500); viewport.layout(500);
        await advanceTimers(200);
        expect(scrollTo).not.toHaveBeenCalled();
        expect(root.style.getPropertyValue('--drawer-keyboard-inset')).toBe('0px');
        expect(scroll.style.paddingBottom).toBe('20px');
        return;
      }
      if (mode === 'catch-up') {
        viewport.resize(500); await advanceTimers(2000);
        expect(root.style.getPropertyValue('--drawer-keyboard-inset')).toBe('300px');
        expect(scroll.style.paddingBottom).toBe('240px');
        bottom = 480; viewport.layout(500); await advanceFrame();
        expect(root.style.getPropertyValue('--drawer-keyboard-inset')).toBe('0px');
        expect(scroll.style.paddingBottom).toBe('20px');
        return;
      }
      viewport.layout(800, true); viewport.resize(500); await advanceFrame();
      if (mode === 'shrinking') {
        for (const height of [700, 600]) { viewport.layout(height, true); await advanceFrame(); }
        await advanceFrame(); await advanceFrame();
        expect(scrollTo).not.toHaveBeenCalled();
      }
      viewport.layout(500, true); await advanceFrame(); await advanceFrame();
      expect(scrollTo).toHaveBeenCalledTimes(1);
      if (mode === 'shorter') {
        await advanceTimers(2000); scrollTo.mockClear();
        viewport.resize(540); viewport.layout(500, true);
        await advanceFrame(); await advanceFrame(); await advanceFrame();
        expect(scrollTo).not.toHaveBeenCalled();
        viewport.layout(540, true); await advanceFrame(); await advanceFrame();
        expect(scrollTo).toHaveBeenCalledTimes(1);
      }
    } finally { view.unmount(); geometry.restore(); viewport.restore(); vi.useRealTimers(); }
  });
  keyboardCase('preserves native taps while the keyboard is open and refocuses once it closes', async () => {
    const viewport = mockKeyboardViewport();
    const view = await render(() => <LayoutSheet />);
    const field = screen.getByTestId('field');
    const originalHitTest = document.elementFromPoint; document.elementFromPoint = () => field;
    const focus = vi.spyOn(field, 'focus');
    vi.useFakeTimers();
    try {
      field.focus(); viewport.resize(500); await advanceFrame(); viewport.layout(500); await advanceTimers(200);
      focus.mockClear();
      dispatchTouch(field, 'touchstart');
      expect(dispatchTouch(field, 'touchend').defaultPrevented).toBe(false);
      expect(focus).not.toHaveBeenCalled();
      viewport.resize(800); viewport.layout(800); await advanceTimers(200);
      dispatchTouch(field, 'touchstart');
      expect(dispatchTouch(field, 'touchend').defaultPrevented).toBe(true);
      expect(focus).toHaveBeenCalledWith({ preventScroll: true });
    } finally { view.unmount(); focus.mockRestore(); document.elementFromPoint = originalHitTest; viewport.restore(); vi.useRealTimers(); }
  });
});
import { useUnscaledBrowserFrame } from '../../../../../test/harness/unscaled-frame';
useUnscaledBrowserFrame();
