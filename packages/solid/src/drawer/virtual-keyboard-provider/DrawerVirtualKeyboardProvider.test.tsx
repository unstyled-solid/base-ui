import { describe, expect, it, vi } from 'vitest';
import { createRenderer, browserCase } from '../../../test';
import { KeyboardFixture, dispatchTouch } from '../test/KeyboardFixture';

describe('Drawer keyboard native taps (isolated Dialog read seam)', () => {
  const { render, renderProps } = createRenderer();
  const nativeClickCase = (name: string, run: () => Promise<void>) => browserCase({ source: 'packages/react/src/drawer/virtual-keyboard-provider/DrawerVirtualKeyboardProvider.test.tsx', case: name, environment: 'browser', issue: 'bsolid-browser', adaptation: 'Read-only Dialog fixture isolates keyboard behavior; native Window/PointerEvent view retained' }, run);
  function hitTest(doc: Document, node: Element | null) { const original = doc.elementFromPoint; doc.elementFromPoint = () => node; return () => { doc.elementFromPoint = original; }; }
  nativeClickCase('focuses an unfocused keyboard input on touchend without page scroll', async () => {
    const view = await render(() => <KeyboardFixture><input data-testid="field" style={{ opacity: '0.5', transform: 'scale(1)', transition: 'opacity 1s' }} /></KeyboardFixture>);
    const input = view.getByTestId('field');
    const focus = vi.spyOn(input, 'focus');
    const click = vi.fn(); input.addEventListener('click', click);
    const restore = hitTest(document, input);
    try {
      dispatchTouch(input, 'touchstart');
      const end = dispatchTouch(input, 'touchend');
      expect(end.defaultPrevented).toBe(true);
      expect(focus).toHaveBeenCalledWith({ preventScroll: true });
      expect(click).toHaveBeenCalledTimes(1);
      const event = click.mock.calls[0][0] as MouseEvent;
      expect([event.clientX, event.clientY, event.detail]).toEqual([12, 34, 1]);
      expect(input.style.opacity).toBe('0.5'); expect(input.style.transform).toBe('scale(1)'); expect(input.style.transition).toBe('opacity 1s');
    } finally { restore(); focus.mockRestore(); }
  });
  it.each(['date', 'time', 'color', 'range', 'checkbox', 'radio', 'file'])('preserves native picker/control %s taps', async type => {
    const view = await render(() => <KeyboardFixture><input data-testid="field" type={type} /></KeyboardFixture>);
    const input = view.getByTestId('field'); const focus = vi.spyOn(input, 'focus'); const restore = hitTest(document, input);
    try { dispatchTouch(input, 'touchstart'); expect(dispatchTouch(input, 'touchend').defaultPrevented).toBe(false); expect(focus).not.toHaveBeenCalled(); }
    finally { restore(); focus.mockRestore(); }
  });
  it.each(['input', 'textarea', 'label'] as const)('preserves native disabled %s taps', async kind => {
    const view = await render(() => <KeyboardFixture>{kind === 'textarea' ? <textarea disabled data-testid="field" /> : <><label for="drawer-disabled" data-testid="label">Field</label><input id="drawer-disabled" disabled data-testid="field" /></>}</KeyboardFixture>);
    const input = view.getByTestId('field'); const target = kind === 'label' ? view.getByTestId('label') : input;
    const click = vi.fn(); target.addEventListener('click', click);
    const focus = vi.spyOn(input, 'focus'); const restore = hitTest(document, target);
    try { dispatchTouch(target, 'touchstart'); expect(dispatchTouch(target, 'touchend').defaultPrevented).toBe(false); expect(focus).not.toHaveBeenCalled(); expect(click).not.toHaveBeenCalled(); }
    finally { restore(); focus.mockRestore(); }
  });
  it.each(['no-start', 'cancel', 'move', 'no-coordinate'] as const)('rejects incomplete or moved taps: %s', async mode => {
    const view = await render(() => <KeyboardFixture><input data-testid="field" /></KeyboardFixture>);
    const input = view.getByTestId('field'); const focus = vi.spyOn(input, 'focus'); const restore = hitTest(document, input);
    try {
      if (mode !== 'no-start') dispatchTouch(input, 'touchstart');
      if (mode === 'cancel') dispatchTouch(input, 'touchcancel');
      if (mode === 'move') dispatchTouch(input, 'touchmove', { x: 23, y: 34 });
      expect(dispatchTouch(input, 'touchend', mode === 'no-coordinate' ? null : { x: 12, y: 34 }).defaultPrevented).toBe(false);
      expect(focus).not.toHaveBeenCalled();
    } finally { restore(); focus.mockRestore(); }
  });
  it.each(['closed', 'unmounted', 'nested'] as const)('does not take focus in %s ownership', async mode => {
    const view = await render(() => <KeyboardFixture open={mode !== 'closed'} mounted={mode !== 'unmounted'} nested={mode === 'nested'}><input data-testid="field" /></KeyboardFixture>);
    const input = view.getByTestId('field'); const focus = vi.spyOn(input, 'focus'); const restore = hitTest(document, input);
    try { dispatchTouch(input, 'touchstart'); expect(dispatchTouch(input, 'touchend').defaultPrevented).toBe(false); expect(focus).not.toHaveBeenCalled(); }
    finally { restore(); focus.mockRestore(); }
  });
  it('does not steal a lift over another interactive element', async () => {
    const view = await render(() => <KeyboardFixture><input data-testid="field" /><button>Action</button></KeyboardFixture>);
    const input = view.getByTestId('field'); const focus = vi.spyOn(input, 'focus'); const restore = hitTest(document, view.getByRole('button'));
    try { dispatchTouch(input, 'touchstart'); expect(dispatchTouch(input, 'touchend').defaultPrevented).toBe(false); expect(focus).not.toHaveBeenCalled(); }
    finally { restore(); focus.mockRestore(); }
  });
  it('does not focus a lift-point input outside the drawer', async () => {
    const view = await render(() => <><input data-testid="outside" /><KeyboardFixture><input data-testid="field" /></KeyboardFixture></>);
    const input = view.getByTestId('field'); const outside = view.getByTestId('outside'); const focus = vi.spyOn(outside, 'focus'); const restore = hitTest(document, outside);
    try { dispatchTouch(input, 'touchstart'); expect(dispatchTouch(input, 'touchend').defaultPrevented).toBe(false); expect(focus).not.toHaveBeenCalled(); }
    finally { restore(); focus.mockRestore(); }
  });
  nativeClickCase('falls back to the touch target when point lookup misses', async () => {
    const view = await render(() => <KeyboardFixture><input data-testid="field" /></KeyboardFixture>);
    const input = view.getByTestId('field'); const restore = hitTest(document, null);
    try { dispatchTouch(input, 'touchstart'); expect(dispatchTouch(input, 'touchend').defaultPrevented).toBe(true); expect(input).toHaveFocus(); }
    finally { restore(); }
  });
  for (const mode of ['explicit', 'implicit'] as const) nativeClickCase(`preserves preventScroll after activating an ${mode} label with no input focused`, async () => {
    const view = await render(() => <KeyboardFixture>{mode === 'explicit' ? <><label for="drawer-label" data-testid="label">Field</label><input id="drawer-label" data-testid="field" /></> : <label data-testid="label">Field<input data-testid="field" /></label>}</KeyboardFixture>);
    const input = view.getByTestId('field'); const label = view.getByTestId('label'); const focus = vi.spyOn(input, 'focus'); const restore = hitTest(document, label);
    try { dispatchTouch(label, 'touchstart'); expect(dispatchTouch(label, 'touchend').defaultPrevented).toBe(true); expect(input).toHaveFocus(); expect(focus.mock.lastCall).toEqual([{ preventScroll: true }]); }
    finally { restore(); focus.mockRestore(); }
  });
  nativeClickCase('preserves a focus change from a label click handler', async () => {
    const view = await render(() => <KeyboardFixture><label for="drawer-label" data-testid="label" onClick={event => { event.preventDefault(); document.getElementById('drawer-other')?.focus(); }}>Field</label><input id="drawer-label" data-testid="field" /><input id="drawer-other" data-testid="other" /></KeyboardFixture>);
    const label = view.getByTestId('label'); const restore = hitTest(document, label);
    try { dispatchTouch(label, 'touchstart'); dispatchTouch(label, 'touchend'); expect(view.getByTestId('other')).toHaveFocus(); }
    finally { restore(); }
  });
  it('preserves native caret taps with no visualViewport', async () => {
    const descriptor = Object.getOwnPropertyDescriptor(window, 'visualViewport');
    Object.defineProperty(window, 'visualViewport', { configurable: true, value: undefined });
    const view = await render(() => <KeyboardFixture><input data-testid="field" /></KeyboardFixture>);
    const input = view.getByTestId('field'); input.focus(); const focus = vi.spyOn(input, 'focus'); const restore = hitTest(document, input);
    try { dispatchTouch(input, 'touchstart'); expect(dispatchTouch(input, 'touchend').defaultPrevented).toBe(false); expect(focus).not.toHaveBeenCalled(); }
    finally { view.unmount(); restore(); focus.mockRestore(); if (descriptor) Object.defineProperty(window, 'visualViewport', descriptor); else Reflect.deleteProperty(window, 'visualViewport'); }
  });
  it('clears pending touch ownership when live open state changes', async () => {
    const view = await renderProps((props: { open: boolean }) => <KeyboardFixture open={props.open}><input data-testid="field" /></KeyboardFixture>, { open: true });
    const input = view.getByTestId('field'); const restore = hitTest(document, input);
    try { dispatchTouch(input, 'touchstart'); await view.setProps({ open: false }); await view.setProps({ open: true }); expect(dispatchTouch(input, 'touchend').defaultPrevented).toBe(false); }
    finally { restore(); }
  });
});
