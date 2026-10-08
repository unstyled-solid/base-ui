import { afterEach, describe, expect, it, vi } from 'vitest';
import { createRoot, createSignal, flush, untrack } from 'solid-js';
import {
  advanceTimers, cleanup, createRenderer, describeConformance, fireEvent, screen, waitFor,
} from '../../../test';
import { ContextMenu } from '../index';
import type { ContextMenuTriggerProps } from './ContextMenuTrigger';
import type { ConformantComponentProps } from '../../../test/describeConformance';
import type { ContextMenuTriggerState } from './ContextMenuTrigger';
import { ContextMenuFixture } from '../ContextMenu.test-fixture';
import { useContextMenuRootContext } from '../root/ContextMenuRootContext';
import { ownerWindow } from '../../utils/owner';
import { fireTouch, touchPoint } from '../ContextMenu.touch-fixture';

// Source: ContextMenuTrigger.test.tsx at 19511bb171f3b360b006c94cf6d07e53cb446505.
// Native TouchEvent lists are sufficient for timer/threshold assertions; real touch is retained below.
describe('ContextMenu.Trigger', () => {
  const { render, renderProps } = createRenderer();
  afterEach(() => { cleanup(); vi.useRealTimers(); });

  describeConformance((props: ContextMenuTriggerProps & ConformantComponentProps<ContextMenuTriggerState>) => (
    <ContextMenu.Root><ContextMenu.Trigger {...props} /></ContextMenu.Root>
  ), { initialProps: {}, refInstanceof: HTMLDivElement });

  it('throws when rendered outside ContextMenu.Root', () => {
    createRoot((dispose) => {
      try {
        expect(() => ContextMenu.Trigger({})).toThrow(/ContextMenu.*missing|ContextMenu.*within/);
      } finally { dispose(); }
    });
  });

  it('creates cursor rects and document listeners in the trigger owner realm', async () => {
    const frame = document.createElement('iframe');
    document.body.append(frame);
    const doc = frame.contentDocument!;
    const win = ownerWindow(doc.documentElement);
    const container = doc.createElement('div');
    doc.body.append(container);
    let context!: ReturnType<typeof useContextMenuRootContext>;
    function Probe() { context = useContextMenuRootContext(false); return null; }
    const changed = vi.fn();
    const view = await render(() => <ContextMenu.Root onOpenChange={changed}>
      <Probe /><ContextMenu.Trigger data-testid="realm-trigger" />
    </ContextMenu.Root>, { container, baseElement: doc.body });
    try {
      const node = doc.querySelector('[data-testid="realm-trigger"]')!;
      const event = new win.MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 30, clientY: 40 });
      node.dispatchEvent(event);
      flush();
      expect(changed).toHaveBeenCalledTimes(1);
      const rect = untrack(() => context!.anchor.getBoundingClientRect());
      expect(rect).toBeInstanceOf(win.DOMRect);
      expect(rect).toMatchObject({ x: 30, y: 40 });
      // Suppressing the component handler still leaves owner-document native-menu suppression active.
      const child = doc.createElement('span');
      node.append(child);
      const native = new win.MouseEvent('contextmenu', { bubbles: true, cancelable: true });
      child.dispatchEvent(native);
      expect(native.defaultPrevented).toBe(true);
    } finally {
      view.unmount();
      frame.remove();
    }
  });

  it('recognizes a root-owned release target through a shadow boundary', async () => {
    vi.useFakeTimers();
    const changed = vi.fn();
    let context!: ReturnType<typeof useContextMenuRootContext>;
    function Probe() { context = useContextMenuRootContext(false); return null; }
    await render(() => <ContextMenu.Root onOpenChange={changed}>
      <Probe /><ContextMenu.Trigger data-testid="trigger" />
    </ContextMenu.Root>);
    const portalHost = document.createElement('div');
    portalHost.dataset.rootownerid = context!.rootId;
    const target = document.createElement('span');
    portalHost.attachShadow({ mode: 'open' }).append(target);
    document.body.append(portalHost);
    try {
      fireEvent.contextMenu(screen.getByTestId('trigger'));
      flush();
      await advanceTimers(501);
      target.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, composed: true }));
      expect(changed).toHaveBeenCalledTimes(1);
    } finally { portalHost.remove(); }
  });

  it('opens on a context event with its native event, reason, state attributes and pointer anchor', async () => {
    const changed = vi.fn();
    let context!: ReturnType<typeof useContextMenuRootContext>;
    function Probe() { context = useContextMenuRootContext(false); return null; }
    await render(() => (
      <ContextMenu.Root onOpenChange={changed}>
        <Probe /><ContextMenu.Trigger data-testid="trigger" />
      </ContextMenu.Root>
    ));
    const node = screen.getByTestId('trigger');
    const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 23, clientY: 47 });
    node.dispatchEvent(event);
    flush();
    expect(event.defaultPrevented).toBe(true);
    expect(changed).toHaveBeenCalledWith(true, expect.objectContaining({ reason: 'trigger-press', event }));
    expect(node).toHaveAttribute('data-popup-open', '');
    expect(node).toHaveAttribute('data-pressed', '');
    expect(untrack(() => context!.anchor.getBoundingClientRect())).toMatchObject({ x: 23, y: 47, width: 0, height: 0 });
  });

  it('updates open state without replacing the host', async () => {
    const view = await renderProps((props: { open: boolean }) => (
      <ContextMenu.Root open={props.open}><ContextMenu.Trigger data-testid="trigger" /></ContextMenu.Root>
    ), { open: true });
    const node = view.getByTestId('trigger');
    expect(node).toHaveAttribute('data-popup-open');
    await view.setProps({ open: false });
    expect(view.getByTestId('trigger')).toBe(node);
    expect(node).not.toHaveAttribute('data-popup-open');
    expect(node).not.toHaveAttribute('data-pressed');
  });

  for (const elapsed of [499, 500, 501]) {
    it(`outside release at ${elapsed}ms ${elapsed < 500 ? 'keeps' : 'cancels'} opening`, async () => {
      vi.useFakeTimers();
      const changed = vi.fn();
      await render(() => <ContextMenuFixture root={{ onOpenChange: changed }} />);
      fireEvent.mouseDown(screen.getByTestId('trigger'));
      fireEvent.contextMenu(screen.getByTestId('trigger'));
      flush();
      await advanceTimers(elapsed);
      expect(changed).toHaveBeenCalledTimes(1);
      expect(changed.mock.lastCall?.[0]).toBe(true);
      fireEvent.mouseUp(document.body);
      flush();
      expect(changed).toHaveBeenCalledTimes(elapsed < 500 ? 1 : 2);
      if (elapsed >= 500) expect(changed).toHaveBeenLastCalledWith(false, expect.objectContaining({ reason: 'cancel-open' }));
      else {
        await advanceTimers(1);
        expect(changed).toHaveBeenCalledTimes(1);
      }
    });
  }

  for (const target of ['positioner', 'submenu']) {
    it(`keeps the root open when release ends inside its ${target}`, async () => {
      vi.useFakeTimers();
      const changed = vi.fn();
      await render(() => <ContextMenuFixture root={{ onOpenChange: changed }}>
        <ContextMenu.SubmenuRoot defaultOpen>
          <ContextMenu.SubmenuTrigger>More</ContextMenu.SubmenuTrigger>
          <ContextMenu.Portal><ContextMenu.Positioner>
            <ContextMenu.Popup data-testid="submenu" />
          </ContextMenu.Positioner></ContextMenu.Portal>
        </ContextMenu.SubmenuRoot>
      </ContextMenuFixture>);
      fireEvent.contextMenu(screen.getByTestId('trigger'));
      flush();
      await advanceTimers(501);
      fireEvent.mouseUp(screen.getByTestId(target));
      flush();
      expect(changed).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId('popup')).toBeInTheDocument();
      if (target === 'submenu') expect(screen.getByTestId('submenu')).toBeInTheDocument();
    });
  }

  it('aborts the previous mouseup listener on repeat gestures', async () => {
    vi.useFakeTimers();
    const changed = vi.fn();
    await render(() => <ContextMenuFixture root={{ onOpenChange: changed }} />);
    const trigger = screen.getByTestId('trigger');
    fireEvent.contextMenu(trigger);
    flush();
    await advanceTimers(501);
    fireEvent.contextMenu(trigger);
    flush();
    await advanceTimers(501);
    changed.mockClear();
    fireEvent.mouseUp(document.body);
    flush();
    expect(changed).toHaveBeenCalledTimes(1);
  });

  it('aborts pending document mouseup and timers when only the trigger unmounts', async () => {
    vi.useFakeTimers();
    const changed = vi.fn();
    let hide!: () => void;
    await render(() => {
      const [show, setShow] = createSignal(true);
      hide = () => setShow(false);
      return <ContextMenu.Root onOpenChange={changed}>
        {show() && <ContextMenu.Trigger data-testid="trigger" />}
        <ContextMenu.Portal><ContextMenu.Positioner><ContextMenu.Popup /></ContextMenu.Positioner></ContextMenu.Portal>
      </ContextMenu.Root>;
    });
    fireEvent.contextMenu(screen.getByTestId('trigger'));
    flush();
    hide();
    flush();
    await advanceTimers(501);
    fireEvent.mouseUp(document.body);
    expect(changed).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('does not open or suppress native menus while disabled; reads fresh disabled state', async () => {
    const changed = vi.fn();
    const view = await renderProps((props: { disabled: boolean }) => (
      <ContextMenuFixture root={{ disabled: props.disabled, onOpenChange: changed }} />
    ), { disabled: true });
    const node = screen.getByTestId('trigger');
    const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
    node.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
    expect(changed).not.toHaveBeenCalled();
    expect(screen.queryByTestId('popup')).toBeNull();
    await view.setProps({ disabled: false });
    fireEvent.contextMenu(node);
    flush();
    expect(changed).toHaveBeenCalledTimes(1);
  });

  for (const disabled of [false, true]) {
    it(`native menu suppression on internal/external backdrops, disabled=${disabled}`, async () => {
      await render(() => <ContextMenuFixture root={{ defaultOpen: true, disabled }} />);
      const internal = document.querySelector('[data-base-ui-portal] > [data-base-ui-inert][role="presentation"]');
      expect(internal).not.toBeNull();
      for (const node of [internal!, screen.getByTestId('backdrop'), document.body]) {
        const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
        node.dispatchEvent(event);
        expect(event.defaultPrevented).toBe(!disabled && node !== document.body);
      }
    });
  }

  it('suppresses native menus in a portal mounted inside the trigger subtree', async () => {
    await render(() => {
      const [container, setContainer] = createSignal<HTMLDivElement | null>(null);
      return <ContextMenu.Root defaultOpen>
        <ContextMenu.Trigger><div ref={setContainer} /></ContextMenu.Trigger>
        <ContextMenu.Portal container={container}>
          <ContextMenu.Positioner><ContextMenu.Popup data-testid="popup" /></ContextMenu.Positioner>
        </ContextMenu.Portal>
      </ContextMenu.Root>;
    });
    const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
    screen.getByTestId('popup').dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });

  it('independently preserves preventBaseUIHandler, preventDefault, cancel and fresh callbacks', async () => {
    const changed = vi.fn();
    const view = await renderProps((props: ContextMenuTriggerProps) => (
      <ContextMenuFixture root={{ onOpenChange: changed }} trigger={props} />
    ), { onContextMenu: (event) => event.preventBaseUIHandler() });
    const node = screen.getByTestId('trigger');
    const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
    node.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(changed).not.toHaveBeenCalled();
    await view.setProps({ onContextMenu: (next) => next.preventDefault() });
    fireEvent.contextMenu(node);
    flush();
    expect(changed).toHaveBeenCalledTimes(1);
    expect(view.getByTestId('trigger')).toBe(node);
  });

  it('honors canceled changes and allowPropagation without conflating native prevention', async () => {
    const changed = vi.fn((_open, details) => { details.allowPropagation(); details.cancel(); });
    await render(() => <ContextMenuFixture root={{ onOpenChange: changed }} />);
    const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
    screen.getByTestId('trigger').dispatchEvent(event);
    flush();
    expect(changed).toHaveBeenCalledTimes(1);
    expect(changed.mock.lastCall?.[1]).toMatchObject({ isCanceled: true, isPropagationAllowed: true });
    expect(event.defaultPrevented).toBe(true);
    expect(screen.queryByTestId('popup')).toBeNull();
  });

  describe('long press', () => {
    for (const [dx, dy, opens] of [[0, 0, true], [10, 10, true], [11, 0, false], [0, -11, false]] as const) {
      it(`500ms delay and axis threshold (${dx}, ${dy})`, async () => {
        vi.useFakeTimers();
        const changed = vi.fn();
        await render(() => <ContextMenuFixture root={{ onOpenChange: changed }} />);
        const node = screen.getByTestId('trigger');
        fireTouch(node, 'touchstart', [touchPoint(node)]);
        fireTouch(node, 'touchmove', [touchPoint(node, 100 + dx, 100 + dy)]);
        await advanceTimers(499);
        expect(changed).not.toHaveBeenCalled();
        await advanceTimers(1);
        expect(changed).toHaveBeenCalledTimes(opens ? 1 : 0);
        if (opens) expect(changed.mock.lastCall?.[1].event.type).toBe('touchstart');
      });
    }
    for (const cancel of ['touchEnd', 'touchCancel', 'multiMove', 'multiStart'] as const) {
      it(`cancels pending long press on ${cancel} without restarting on single touch move`, async () => {
        vi.useFakeTimers();
        const changed = vi.fn();
        await render(() => <ContextMenuFixture root={{ onOpenChange: changed }} />);
        const node = screen.getByTestId('trigger');
        fireTouch(node, 'touchstart', [touchPoint(node)]);
        if (cancel === 'multiMove') fireTouch(node, 'touchmove', [touchPoint(node), touchPoint(node, 120, 100, 1)]);
        else if (cancel === 'multiStart') fireTouch(node, 'touchstart', [touchPoint(node), touchPoint(node, 120, 100, 1)]);
        else fireTouch(node, cancel === 'touchEnd' ? 'touchend' : 'touchcancel');
        fireTouch(node, 'touchmove', [touchPoint(node)]);
        await advanceTimers(500);
        expect(changed).not.toHaveBeenCalled();
      });
    }
    it('does not start a disabled long press', async () => {
      vi.useFakeTimers();
      const changed = vi.fn();
      await render(() => <ContextMenuFixture root={{ disabled: true, onOpenChange: changed }} />);
      const node = screen.getByTestId('trigger');
      fireTouch(node, 'touchstart', [touchPoint(node)]);
      await advanceTimers(500);
      expect(changed).not.toHaveBeenCalled();
    });
    it('delays outside dismissal for 500ms after a long press', async () => {
      vi.useFakeTimers();
      await render(() => <ContextMenuFixture />);
      const node = screen.getByTestId('trigger');
      fireTouch(node, 'touchstart', [touchPoint(node)]);
      await advanceTimers(500);
      fireEvent.mouseDown(document.body);
      flush();
      expect(screen.getByRole('menu')).toBeInTheDocument();
      await advanceTimers(500);
      fireEvent.mouseDown(document.body);
      flush();
      await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
    });
    it('uses a 10px touch anchor in the trigger owner realm and disposes pending timers', async () => {
      vi.useFakeTimers();
      let context!: ReturnType<typeof useContextMenuRootContext>;
      function Probe() { context = useContextMenuRootContext(false); return null; }
      const view = await render(() => <ContextMenu.Root>
        <Probe /><ContextMenu.Trigger data-testid="trigger" />
      </ContextMenu.Root>);
      const node = screen.getByTestId('trigger');
      fireTouch(node, 'touchstart', [touchPoint(node)]);
      await advanceTimers(500);
      const rect = untrack(() => context!.anchor.getBoundingClientRect());
      expect(rect).toBeInstanceOf(window.DOMRect);
      expect(rect).toMatchObject({ x: 100, y: 100, width: 10, height: 10 });
      view.unmount();
      expect(vi.getTimerCount()).toBe(0);
    });
  });

  it('isolates nested context menus', async () => {
    await render(() => <ContextMenu.Root>
      <ContextMenu.Trigger data-testid="outer-trigger">outer
        <ContextMenu.Root>
          <ContextMenu.Trigger data-testid="inner-trigger">inner</ContextMenu.Trigger>
          <ContextMenu.Portal><ContextMenu.Positioner><ContextMenu.Popup data-testid="inner-menu" /></ContextMenu.Positioner></ContextMenu.Portal>
        </ContextMenu.Root>
      </ContextMenu.Trigger>
      <ContextMenu.Portal><ContextMenu.Positioner><ContextMenu.Popup data-testid="outer-menu" /></ContextMenu.Positioner></ContextMenu.Portal>
    </ContextMenu.Root>);
    fireEvent.contextMenu(screen.getByTestId('inner-trigger'));
    flush();
    expect(screen.getByTestId('inner-menu')).toBeInTheDocument();
    expect(screen.queryByTestId('outer-menu')).toBeNull();
    fireEvent.pointerDown(document.body, { pointerType: 'mouse' });
    flush();
    await waitFor(() => expect(screen.queryByTestId('inner-menu')).toBeNull());
    fireEvent.contextMenu(screen.getByTestId('outer-trigger'));
    flush();
    expect(screen.getByTestId('outer-menu')).toBeInTheDocument();
    expect(screen.queryByTestId('inner-menu')).toBeNull();
  });

  it('releases the internal backdrop ref on a retained close, replaces it on reopen and clears it on disposal', async () => {
    let context!: ReturnType<typeof useContextMenuRootContext>;
    function Probe() { context = useContextMenuRootContext(false); return null; }
    const view = await renderProps((props: { open: boolean }) => <ContextMenu.Root open={props.open}>
      <Probe /><ContextMenu.Trigger>Surface</ContextMenu.Trigger>
      <ContextMenu.Portal keepMounted><ContextMenu.Positioner><ContextMenu.Popup>
        <ContextMenu.Item>Action</ContextMenu.Item>
      </ContextMenu.Popup></ContextMenu.Positioner></ContextMenu.Portal>
    </ContextMenu.Root>, { open: true });
    const first = context!.internalBackdropRef.current;
    expect(first).not.toBeNull();
    await view.setProps({ open: false });
    await waitFor(() => expect(context!.internalBackdropRef.current).toBeNull());
    expect(first!.isConnected).toBe(false);
    await view.setProps({ open: true });
    await waitFor(() => expect(context!.internalBackdropRef.current).not.toBeNull());
    expect(context!.internalBackdropRef.current === first).toBe(false);
    view.unmount();
    expect(context!.internalBackdropRef.current).toBeNull();
  });
});
