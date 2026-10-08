import { afterEach, describe, expect, it, vi } from 'vitest';
import { createSignal, flush, onCleanup, untrack, useContext } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { advanceTimers, cleanup, createRenderer, fireEvent, screen } from '../../test';
import { ContextMenuRoot } from './root/ContextMenuRoot';
import type { ContextMenuRootProps } from './root/ContextMenuRoot';
import { ContextMenuTrigger, type ContextMenuTriggerProps } from './trigger/ContextMenuTrigger';
import { useContextMenuRootContext, type ContextMenuRootContext } from './root/ContextMenuRootContext';
import { MenuRootContext } from '../menu/root/MenuRootContext';
import { ownerWindow } from '../utils/owner';
import { fireTouch, touchPoint } from './ContextMenu.touch-fixture';

// A deliberately narrow, test-only Menu seam. These tests exercise the real
// ContextMenu wrappers/render/events/timers, not Menu navigation or dismissal.
// Real-engine regressions remain in root/ and trigger/ContextMenuTrigger.test.tsx.
const seam = vi.hoisted(() => ({
  states: new WeakMap<object, { readonly open: boolean; readonly disabled: boolean }>(),
  root: vi.fn<(props: ContextMenuRootProps, parent: unknown) => void>(),
}));
vi.mock('../menu/root/MenuRootContext', async (original) => {
  const actual = await original<typeof import('../menu/root/MenuRootContext')>();
  const host = await import('./root/ContextMenuRootContext');
  return { ...actual, useMenuRootContext() {
    const state = seam.states.get(host.useContextMenuRootContext(false));
    if (!state) throw new Error('ContextMenu host test requires its Menu seam');
    return { store: { state } };
  } };
});
vi.mock('../menu/root/MenuRoot', () => ({
  MenuRoot(props: ContextMenuRootProps) {
    seam.root(props, useContext(MenuRootContext));
    return <>{props.children}</>;
  },
}));

describe('ContextMenu host source regressions (Menu seam)', () => {
  const { render, renderProps } = createRenderer();
  afterEach(() => { cleanup(); seam.root.mockClear(); vi.useRealTimers(); });

  function Host(props: {
    disabled?: boolean;
    testId?: string;
    trigger?: ContextMenuTriggerProps;
    capture?: (host: ContextMenuRootContext) => void;
    changed?: NonNullable<ContextMenuRootContext['actionsRef']['current']>['setOpen'];
    children?: JSX.Element;
  }) {
    const host = useContextMenuRootContext(false);
    const [open, setOpen] = createSignal(false);
    seam.states.set(host, { get open() { return open(); }, get disabled() { return props.disabled ?? false; } });
    host.actionsRef.current = { setOpen(next, details) {
      props.changed?.(next, details);
      if (!details.isCanceled) setOpen(next);
    } };
    props.capture?.(host);
    onCleanup(() => seam.states.delete(host));
    return <><ContextMenuTrigger data-testid={props.testId ?? 'trigger'} {...props.trigger} />{props.children}</>;
  }

  it('resets the enclosing Menu context and forwards live Root props and children', async () => {
    const view = await renderProps((props: { open: boolean; label: string }) =>
      <ContextMenuRoot open={props.open}><span>{props.label}</span></ContextMenuRoot>,
    { open: false, label: 'before' });
    expect(seam.root).toHaveBeenCalledTimes(1);
    const [forwarded, parent] = seam.root.mock.calls[0];
    expect(parent).toBeNull();
    expect(untrack(() => forwarded.open)).toBe(false);
    const node = screen.getByText('before');
    await view.setProps({ open: true, label: 'after' });
    expect(untrack(() => forwarded.open)).toBe(true);
    expect(screen.getByText('after')).toBe(node);
    expect(seam.root).toHaveBeenCalledTimes(1);
  });

  it('retains a staged pointer anchor and independent canceled request/native prevention', async () => {
    let host!: ContextMenuRootContext;
    const changed = vi.fn<NonNullable<ContextMenuRootContext['actionsRef']['current']>['setOpen']>((_next, details) => {
      details.allowPropagation(); details.cancel();
    });
    await render(() => <ContextMenuRoot><Host capture={value => { host = value; }} changed={changed} /></ContextMenuRoot>);
    const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 23, clientY: 47 });
    const node = screen.getByTestId('trigger');
    node.dispatchEvent(event);
    flush();
    expect(event.defaultPrevented).toBe(true);
    expect(changed).toHaveBeenCalledWith(true, expect.objectContaining({ event, reason: 'trigger-press', isCanceled: true, isPropagationAllowed: true }));
    expect(node).not.toHaveAttribute('data-popup-open');
    expect(untrack(() => host.anchor.getBoundingClientRect())).toMatchObject({ x: 23, y: 47, width: 0, height: 0 });
  });

  it('uses the live Menu state and fresh handlers while retaining native suppression after Base UI prevention', async () => {
    const changed = vi.fn();
    type Props = { disabled: boolean; handler: ContextMenuTriggerProps['onContextMenu'] };
    const view = await renderProps<Props>((props) =>
      <ContextMenuRoot><Host disabled={props.disabled} changed={changed} trigger={{ onContextMenu: props.handler }} /></ContextMenuRoot>,
    { disabled: true, handler: undefined });
    const node = screen.getByTestId('trigger');
    const native = () => new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
    let event = native(); node.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
    expect(changed).not.toHaveBeenCalled();
    await view.setProps({ disabled: false, handler: event => event.preventBaseUIHandler() });
    event = native(); node.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(changed).not.toHaveBeenCalled();
    await view.setProps({ handler: event => event.preventDefault() });
    event = native(); node.dispatchEvent(event); flush();
    expect(changed).toHaveBeenCalledTimes(1);
    expect(node).toHaveAttribute('data-popup-open');
    expect(node).toHaveAttribute('data-pressed');
    expect(view.getByTestId('trigger')).toBe(node);
  });

  for (const elapsed of [499, 500]) {
    it(`outside release at ${elapsed}ms preserves the source cancellation boundary`, async () => {
      vi.useFakeTimers();
      const changed = vi.fn();
      await render(() => <ContextMenuRoot><Host changed={changed} /></ContextMenuRoot>);
      fireEvent.contextMenu(screen.getByTestId('trigger')); flush();
      await advanceTimers(elapsed);
      const release = new MouseEvent('mouseup', { bubbles: true });
      document.body.dispatchEvent(release); flush();
      expect(changed).toHaveBeenCalledTimes(elapsed < 500 ? 1 : 2);
      if (elapsed === 500) expect(changed).toHaveBeenLastCalledWith(false, expect.objectContaining({ event: release, reason: 'cancel-open' }));
    });
  }

  for (const disabled of [false, true]) {
    it(`suppresses only trigger/backdrop native menus across shadow targets (disabled=${disabled})`, async () => {
      let host!: ContextMenuRootContext;
      const changed = vi.fn();
      const view = await render(() => <ContextMenuRoot><Host disabled={disabled} changed={changed} capture={value => { host = value; }} /></ContextMenuRoot>);
      const internal = document.createElement('div');
      const external = document.createElement('div');
      const child = document.createElement('span');
      internal.attachShadow({ mode: 'open' }).append(child);
      document.body.append(internal, external);
      host.internalBackdropRef.current = internal;
      host.backdropRef.current = external;
      try {
        for (const target of [child, external, document.body]) {
          const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true, composed: true });
          target.dispatchEvent(event);
          expect(event.defaultPrevented).toBe(!disabled && target !== document.body);
        }
        expect(changed).not.toHaveBeenCalled();
        view.unmount();
        const afterDisposal = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
        external.dispatchEvent(afterDisposal);
        expect(afterDisposal.defaultPrevented).toBe(false);
      } finally { internal.remove(); external.remove(); }
    });
  }

  it('passes live open state to class/style/render without replacing the trigger', async () => {
    await render(() => <ContextMenuRoot><Host trigger={{
      class: state => ['surface', { opened: state.open }],
      style: state => ({ opacity: state.open ? '1' : '0.5' }),
      render: (props, state) => <div {...props} data-render-open={state.open ? 'yes' : 'no'}
        data-callout={typeof props.style === 'object' ? props.style['-webkit-touch-callout'] : undefined} />,
    }} /></ContextMenuRoot>);
    const node = screen.getByTestId('trigger');
    expect(node).toHaveAttribute('data-render-open', 'no');
    expect(node).not.toHaveClass('opened');
    fireEvent.contextMenu(node); flush();
    expect(screen.getByTestId('trigger')).toBe(node);
    expect(node).toHaveAttribute('data-render-open', 'yes');
    expect(node).toHaveClass('surface', 'opened');
    expect(node.style.opacity).toBe('1');
    // jsdom does not implement this WebKit CSS property; inspect the live
    // merged render props here and retain the native CSS check for browsers.
    expect(node).toHaveAttribute('data-callout', 'none');
  });

  it('forwards a live native ref once and disconnects its node on disposal', async () => {
    const ref = vi.fn();
    const view = await renderProps<ContextMenuTriggerProps>(props =>
      <ContextMenuRoot><Host trigger={props} /></ContextMenuRoot>, { ref });
    const node = screen.getByTestId('trigger');
    expect(ref).toHaveBeenCalledTimes(1);
    expect(ref).toHaveBeenCalledWith(node);
    view.unmount();
    expect(node.isConnected).toBe(false);
  });

  for (const [dx, dy, opens] of [[0, 0, true], [10, -10, true], [11, 0, false], [0, -11, false]] as const) {
    it(`opens at 500ms only when axis movement stays within 10px (${dx}, ${dy})`, async () => {
      vi.useFakeTimers();
      let host!: ContextMenuRootContext;
      const changed = vi.fn();
      await render(() => <ContextMenuRoot><Host capture={value => { host = value; }} changed={changed} /></ContextMenuRoot>);
      const node = screen.getByTestId('trigger');
      fireTouch(node, 'touchstart', [touchPoint(node)]);
      fireTouch(node, 'touchmove', [touchPoint(node, 100 + dx, 100 + dy)]);
      await advanceTimers(499);
      expect(changed).not.toHaveBeenCalled();
      await advanceTimers(1);
      expect(changed).toHaveBeenCalledTimes(opens ? 1 : 0);
      if (opens) {
        expect(changed).toHaveBeenLastCalledWith(true, expect.objectContaining({ reason: 'trigger-press', event: expect.objectContaining({ type: 'touchstart' }) }));
        expect(untrack(() => host.anchor.getBoundingClientRect())).toMatchObject({ x: 100, y: 100, width: 10, height: 10 });
        expect(host.allowMouseUpTriggerRef.current).toBe(false);
      }
    });
  }

  for (const abort of ['touchEnd', 'touchCancel', 'multiStart', 'multiMove', 'disabled'] as const) {
    it(`aborts long press on ${abort} and never restarts from a single touchmove`, async () => {
      vi.useFakeTimers();
      const changed = vi.fn();
      await render(() => <ContextMenuRoot><Host disabled={abort === 'disabled'} changed={changed} /></ContextMenuRoot>);
      const node = screen.getByTestId('trigger');
      const touches = [touchPoint(node)];
      fireTouch(node, 'touchstart', touches);
      if (abort === 'multiStart' || abort === 'multiMove') fireTouch(node, abort === 'multiStart' ? 'touchstart' : 'touchmove', [...touches, touchPoint(node, 120, 100, 1)]);
      else if (abort !== 'disabled') fireTouch(node, abort === 'touchEnd' ? 'touchend' : 'touchcancel');
      fireTouch(node, 'touchmove', touches);
      await advanceTimers(500);
      expect(changed).not.toHaveBeenCalled();
    });
  }

  it('disposes a pending long press when the trigger owner unmounts', async () => {
    vi.useFakeTimers();
    const changed = vi.fn();
    const view = await render(() => <ContextMenuRoot><Host changed={changed} /></ContextMenuRoot>);
    const node = screen.getByTestId('trigger');
    fireTouch(node, 'touchstart', [touchPoint(node)]);
    view.unmount();
    expect(vi.getTimerCount()).toBe(0);
    await advanceTimers(500);
    expect(changed).not.toHaveBeenCalled();
  });

  for (const gesture of ['contextmenu', 'touchstart']) {
    it(`isolates nested ContextMenu hosts on ${gesture}`, async () => {
      vi.useFakeTimers();
      const outer = vi.fn();
      const inner = vi.fn();
      await render(() => <ContextMenuRoot><Host changed={outer} trigger={{
        children: <ContextMenuRoot><Host changed={inner} testId="inner" /></ContextMenuRoot>,
      }} /></ContextMenuRoot>);
      const node = screen.getByTestId('inner');
      if (gesture === 'contextmenu') fireEvent.contextMenu(node);
      else fireTouch(node, 'touchstart', [touchPoint(node)]);
      await advanceTimers(500);
      expect(inner).toHaveBeenCalledTimes(1);
      expect(outer).not.toHaveBeenCalled();
      expect(node).toHaveAttribute('data-popup-open');
      expect(screen.getByTestId('trigger')).not.toHaveAttribute('data-popup-open');
    });
  }

  it('keeps release inside root-owned portaled and shadow descendants and aborts stale/unmounted listeners', async () => {
    vi.useFakeTimers();
    let host!: ContextMenuRootContext;
    const changed = vi.fn();
    const view = await render(() => <ContextMenuRoot><Host capture={value => { host = value; }} changed={changed} /></ContextMenuRoot>);
    const portal = document.createElement('div');
    portal.dataset.rootownerid = host.rootId;
    const child = document.createElement('span');
    portal.attachShadow({ mode: 'open' }).append(child);
    document.body.append(portal);
    try {
      const node = screen.getByTestId('trigger');
      fireEvent.contextMenu(node); flush();
      await advanceTimers(500);
      child.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, composed: true }));
      expect(changed).toHaveBeenCalledTimes(1);
      fireEvent.contextMenu(node); flush();
      await advanceTimers(500);
      fireEvent.contextMenu(node); flush();
      await advanceTimers(500);
      changed.mockClear();
      fireEvent.mouseUp(document.body); flush();
      expect(changed).toHaveBeenCalledTimes(1);
      fireEvent.contextMenu(node); flush();
      view.unmount();
      expect(vi.getTimerCount()).toBe(0);
      changed.mockClear();
      fireEvent.mouseUp(document.body);
      expect(changed).not.toHaveBeenCalled();
    } finally { portal.remove(); }
  });

  it('captures the trigger realm before a staged ref commit and keeps release listeners on its document', async () => {
    vi.useFakeTimers();
    const frame = document.createElement('iframe'); document.body.append(frame);
    const doc = frame.contentDocument!;
    const win = ownerWindow(doc.documentElement);
    let host!: ContextMenuRootContext;
    const changed = vi.fn();
    const view = await render(() => <ContextMenuRoot><Host capture={value => { host = value; }} changed={changed} trigger={{
      render: props => <div ref={element => {
        // Native renderer refs normally precede listener attachment. This
        // custom host installs the actual merged handler before reporting its
        // ref, making the same-turn owner-realm check deterministic.
        doc.adoptNode(element);
        element.addEventListener('contextmenu', props.onContextMenu as EventListener);
        props.ref?.(element);
        element.dispatchEvent(new win.MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 30, clientY: 40 }));
      }} />,
    }} /></ContextMenuRoot>, { container: doc.body, baseElement: doc.body });
    try {
      expect(changed).toHaveBeenCalledTimes(1);
      expect(untrack(() => host.anchor.getBoundingClientRect())).toBeInstanceOf(win.DOMRect);
      await advanceTimers(500);
      fireEvent.mouseUp(document.body);
      expect(changed).toHaveBeenCalledTimes(1);
      doc.body.dispatchEvent(new win.MouseEvent('mouseup', { bubbles: true }));
      expect(changed).toHaveBeenCalledTimes(2);
    } finally { view.unmount(); frame.remove(); }
  });
});
