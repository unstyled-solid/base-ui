import { describe, expect, it, vi } from 'vitest';
import { screen } from '@solidjs/testing-library';
import { createRenderer, advanceFrame, advanceTimers } from '../../../test';
import { Drawer } from '../index';
import { mockKeyboardViewport, mockKeyboardScroll, rect } from '../test/keyboardGeometry';

// Source mobile geometry expressed as deterministic resource tests. Real layout,
// native picker/tap behavior and software keyboards remain browser/device gates.
describe('Drawer keyboard geometry resource with real parts', () => {
  const { render, renderProps } = createRenderer();
  function Fields() {
    return <><div data-testid="scroll"><input data-testid="first" /><input data-testid="second" /></div><button data-testid="other">Other</button></>;
  }
  function Sheet(props: { open?: boolean; keyboard?: boolean }) {
    return <Drawer.Root open={props.open ?? true} modal={false}>
      {props.keyboard === false
        ? <Drawer.Portal keepMounted><Drawer.Viewport data-testid="viewport"><Drawer.Popup initialFocus={false}><Fields /></Drawer.Popup></Drawer.Viewport></Drawer.Portal>
        : <Drawer.VirtualKeyboardProvider><Drawer.Portal keepMounted><Drawer.Viewport data-testid="viewport"><Drawer.Popup initialFocus={false}><Fields /></Drawer.Popup></Drawer.Viewport></Drawer.Portal></Drawer.VirtualKeyboardProvider>}
    </Drawer.Root>;
  }

  it.each([0, 20])('centers above overlap, tops up the margin and restores exact inline padding (%s)', async padding => {
    const viewport = mockKeyboardViewport();
    const view = await render(() => <Sheet />);
    const root = screen.getByTestId('viewport'), scroll = screen.getByTestId('scroll'), field = screen.getByTestId('first');
    const geometry = mockKeyboardScroll(scroll, field, padding);
    scroll.style.scrollPaddingBottom = '7px';
    vi.useFakeTimers();
    try {
      field.focus(); viewport.resize(500);
      await advanceFrame(); await advanceFrame();
      expect(root.style.getPropertyValue('--drawer-keyboard-inset')).toBe('300px');
      expect(scroll.style.paddingBottom).toBe(`${220 + Math.max(padding, 16)}px`);
      expect(scroll.style.scrollPaddingBottom).toBe('23px');
      expect(scroll.style.overflowAnchor).toBe('none');
      expect(scroll.scrollTop).toBe(270);
      field.blur();
      expect(scroll.style.paddingBottom).toBe(`${padding}px`);
      expect(scroll.style.scrollPaddingBottom).toBe('7px');
      expect(scroll.style.overflowAnchor).toBe('auto');
      expect(root.style.getPropertyValue('--drawer-keyboard-inset')).toBe('0px');
    } finally { view.unmount(); geometry.restore(); viewport.restore(); vi.useRealTimers(); }
  });

  it.each(['no-provider', 'zoom', 'chrome', 'no-viewport'] as const)('does not introduce slack or scroll for %s', async mode => {
    const viewport = mockKeyboardViewport();
    if (mode === 'no-viewport') Object.defineProperty(window, 'visualViewport', { configurable: true, value: undefined });
    const view = await render(() => <Sheet keyboard={mode !== 'no-provider'} />);
    const root = screen.getByTestId('viewport'), scroll = screen.getByTestId('scroll'), field = screen.getByTestId('first');
    const geometry = mockKeyboardScroll(scroll, field);
    vi.useFakeTimers();
    try {
      field.focus();
      if (mode === 'zoom') viewport.zoom(1.5);
      viewport.resize(mode === 'chrome' ? 750 : 500);
      await advanceFrame(); await advanceFrame();
      expect(scroll.style.paddingBottom).toBe('20px');
      expect(scroll.style.scrollPaddingBottom).toBe('');
      expect(geometry.scrollTo).not.toHaveBeenCalled();
      expect(['', '0px']).toContain(root.style.getPropertyValue('--drawer-keyboard-inset'));
    } finally { view.unmount(); geometry.restore(); viewport.restore(); vi.useRealTimers(); }
  });

  it('retains overlap detection while layout follows, then clears it when the keyboard closes', async () => {
    const viewport = mockKeyboardViewport();
    const view = await render(() => <Sheet />);
    const root = screen.getByTestId('viewport'), scroll = screen.getByTestId('scroll'), field = screen.getByTestId('first');
    const geometry = mockKeyboardScroll(scroll, field);
    scroll.getBoundingClientRect = () => rect(100, window.innerHeight - 20);
    vi.useFakeTimers();
    try {
      field.focus(); viewport.layout(800, true); viewport.resize(500);
      await advanceFrame();
      expect(geometry.scrollTo).not.toHaveBeenCalled();
      expect(root.style.getPropertyValue('--drawer-keyboard-inset')).toBe('0px');
      viewport.layout(500, true);
      await advanceFrame(); await advanceFrame();
      expect(geometry.scrollTo).toHaveBeenCalledTimes(1);
      expect(scroll.style.paddingBottom).toBe('20px');
      viewport.resize(800); viewport.layout(800);
      await advanceFrame();
      expect(root.style.getPropertyValue('--drawer-keyboard-inset')).toBe('0px');
      expect(scroll.style.paddingBottom).toBe('20px');
    } finally { view.unmount(); geometry.restore(); viewport.restore(); vi.useRealTimers(); }
  });

  it('defers moving geometry, stops for user pointerdown and invalidates work on close', async () => {
    const viewport = mockKeyboardViewport();
    const view = await renderProps((props: { open: boolean }) => <Sheet open={props.open} />, { open: true });
    const root = screen.getByTestId('viewport'), scroll = screen.getByTestId('scroll'), field = screen.getByTestId('first');
    const geometry = mockKeyboardScroll(scroll, field);
    let bottom = 380;
    scroll.getBoundingClientRect = () => rect(300, bottom);
    vi.useFakeTimers();
    try {
      viewport.resize(500); field.focus();
      await advanceFrame();
      bottom = 480;
      await advanceFrame(); await advanceFrame();
      expect(geometry.scrollTo).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ top: 280 }));
      geometry.scrollTo.mockClear();
      field.blur(); field.focus();
      await advanceFrame();
      field.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
      await advanceTimers(1000);
      expect(geometry.scrollTo).not.toHaveBeenCalled();
      viewport.resize(490); await advanceFrame();
      await view.setProps({ open: false });
      expect(scroll.style.paddingBottom).toBe('20px');
      expect(root.style.getPropertyValue('--drawer-keyboard-inset')).toBe('');
      await advanceTimers(1000);
      expect(geometry.scrollTo).not.toHaveBeenCalled();
    } finally { view.unmount(); geometry.restore(); viewport.restore(); vi.useRealTimers(); }
  });

  it('bounds never-settling geometry and restores slack from removed fields', async () => {
    const viewport = mockKeyboardViewport();
    const view = await render(() => <Sheet />);
    const root = screen.getByTestId('viewport'), scroll = screen.getByTestId('scroll'), field = screen.getByTestId('first');
    const geometry = mockKeyboardScroll(scroll, field);
    let reads = 0;
    scroll.getBoundingClientRect = () => rect(100 + ++reads % 2 * 100, 400 + reads % 2 * 100);
    const scrollTo = vi.fn(); scroll.scrollTo = scrollTo;
    vi.useFakeTimers();
    try {
      viewport.resize(500); field.focus();
      for (let frame = 0; frame < 65; frame++) await advanceFrame();
      expect(scrollTo).toHaveBeenCalledTimes(1);
      field.remove(); viewport.scroll(1);
      await advanceFrame();
      expect(root.style.getPropertyValue('--drawer-keyboard-inset')).toBe('0px');
      expect(scroll.style.paddingBottom).toBe('20px');
    } finally { view.unmount(); geometry.restore(); viewport.restore(); vi.useRealTimers(); }
  });
});
