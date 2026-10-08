// Adapted from Base UI (MIT), source SHA 19511bb171f3b360b006c94cf6d07e53cb446505.
import { createEffect } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { useDialogRootContext } from '../../dialog/root/DialogRootContext';
import { ownerWindow } from '../../utils/owner';
import { activeElement, contains, getTarget } from '../../utils/shadowDom';
import { DrawerVirtualKeyboardContext } from './DrawerVirtualKeyboardContext';
import { KEYBOARD_TAP_BLOCKED, resolveKeyboardInputTarget, resolveKeyboardTouchTarget, resolveKeyboardTouchTargetFromPoint, overrideGeometryDuringFocus, focusKeyboardInputWithoutPageScroll, dispatchKeyboardClick, findKeyboardScrollTarget } from './keyboardTargets';

interface KeyboardViewport { top: number; bottom: number; resizing: boolean }
interface ScrollAdjustment {
  element: HTMLElement; overflowAnchor: string; paddingBottom: string; scrollPaddingBottom: string;
  computedPaddingBottom: number; computedScrollPaddingBottom: number;
}

/** Native keyboard focus/geometry resource; all work belongs to the viewport's realm/lifetime. */
export function DrawerVirtualKeyboardProvider(props: DrawerVirtualKeyboardProviderProps) {
  const store = useDialogRootContext();
  let touchStart: { x: number; y: number } | null = null;
  let moved = false;
  let focused: HTMLElement | null = null;
  let adjustment: ScrollAdjustment | null = null;
  let programmatic = false;
  let getKeyboardViewport: (() => KeyboardViewport | null) | null = null;
  function restoreSlack() {
    if (!adjustment) return;
    const { element, overflowAnchor, paddingBottom, scrollPaddingBottom } = adjustment;
    element.style.overflowAnchor = overflowAnchor;
    element.style.paddingBottom = paddingBottom;
    element.style.scrollPaddingBottom = scrollPaddingBottom;
    adjustment = null;
  }
  function setSlack(element: HTMLElement, slack: number) {
    const rounded = Math.max(0, Math.ceil(slack));
    if (adjustment && (!adjustment.element.isConnected || adjustment.element !== element)) restoreSlack();
    if (!rounded) { restoreSlack(); return; }
    if (!adjustment) {
      const computed = ownerWindow(element).getComputedStyle(element);
      adjustment = { element, overflowAnchor: element.style.overflowAnchor, paddingBottom: element.style.paddingBottom,
        scrollPaddingBottom: element.style.scrollPaddingBottom, computedPaddingBottom: parseFloat(computed.paddingBottom) || 0,
        computedScrollPaddingBottom: parseFloat(computed.scrollPaddingBottom) || 0 };
    }
    element.style.overflowAnchor = 'none';
    element.style.paddingBottom = `${rounded + Math.max(adjustment.computedPaddingBottom, 16)}px`;
    element.style.scrollPaddingBottom = `${adjustment.computedScrollPaddingBottom + 16}px`;
  }
  function resetTouch() { touchStart = null; moved = false; }

  createEffect(() => ({ root: store.state.viewportElement, open: store.state.open, mounted: store.state.mounted, modal: store.state.modal, nested: store.state.nestedOpenDialogCount > 0 }), ({ root, open, mounted, modal, nested }) => {
    if (!root || !open || !mounted) { focused = null; restoreSlack(); resetTouch(); return; }
    const doc = root.ownerDocument;
    const win = ownerWindow(root);
    const viewport = win.visualViewport;
    let disposed = false;
    let frame = 0;
    let timeout = 0;
    let scrollElement: HTMLElement | null = null;
    let destination = 0;
    let checks = 0;
    let observed = -1;
    let visualHeight = -1;
    let probe: HTMLElement | null = null;
    let restorePreempted: (() => void) | null = null;
    const baseX = win.scrollX;
    const baseY = win.scrollY;
    const cancelFrame = () => { if (frame) win.cancelAnimationFrame(frame); frame = 0; };
    const cancelTimeout = () => { if (timeout) win.clearTimeout(timeout); timeout = 0; };
    const schedule = () => { cancelFrame(); frame = win.requestAnimationFrame(() => { frame = 0; if (!disposed) align(); }); };
    function consumePreempted() { restorePreempted?.(); restorePreempted = null; }
    function measureViewport(): KeyboardViewport | null {
      if (!viewport || viewport.scale !== 1) return null;
      const layout = win.innerHeight;
      const height = viewport.height;
      if (layout - height > 60) visualHeight = height;
      else if (Math.abs(height - visualHeight) > 60) { visualHeight = -1; return null; }
      if (!probe) {
        probe = doc.createElement('div');
        probe.style.cssText = 'position:fixed;top:0;height:100svh;visibility:hidden';
        doc.body.appendChild(probe);
      }
      const follows = probe.offsetHeight - height <= 60;
      const top = Math.max(0, viewport.offsetTop);
      return { top, bottom: follows ? layout : Math.min(layout, top + height), resizing: follows && Math.abs(layout - height) >= 1 };
    }
    getKeyboardViewport = measureViewport;
    const inset = (value: number) => root.style.setProperty('--drawer-keyboard-inset', `${Math.max(0, Math.ceil(value))}px`);
    function clearFocused() {
      focused = null; scrollElement = null; visualHeight = -1;
      inset(0); restoreSlack(); cancelFrame(); cancelTimeout();
    }
    function restorePage() {
      if (modal !== true || nested || !focused || (win.scrollX === baseX && win.scrollY === baseY) || !measureViewport()) return false;
      win.scrollTo({ left: baseX, top: baseY, behavior: 'instant' });
      return true;
    }
    function align() {
      consumePreempted();
      const target = focused;
      if (nested || !target || !contains(root, target)) { inset(0); restoreSlack(); return; }
      restorePage();
      const visible = measureViewport();
      if (!visible) { inset(0); restoreSlack(); return; }
      inset(win.innerHeight - visible.bottom);
      const scroll = findKeyboardScrollTarget(target, root!);
      if (!scroll) { restoreSlack(); return; }
      const rect = scroll.getBoundingClientRect();
      const bottom = Math.min(rect.bottom, visible.bottom);
      setSlack(scroll, Math.max(0, rect.bottom - visible.bottom));
      const max = Math.max(0, scroll.scrollHeight - scroll.clientHeight);
      const top = Math.max(rect.top, visible.top) + 16;
      if (max <= 0 || bottom - 16 <= top) return;
      const field = target.getBoundingClientRect();
      const next = Math.round(Math.min(max, Math.max(0, scroll.scrollTop + (field.top + field.bottom - top - (bottom - 16)) / 2)));
      const settled = scrollElement === scroll && !visible.resizing && Math.abs(destination - next) <= 1;
      if (!settled) {
        checks = scrollElement === scroll ? checks + 1 : 1;
        scrollElement = scroll; destination = next; observed = -1;
        if (checks <= 60) { schedule(); return; }
      } else if (observed >= 0) {
        if (Math.abs(scroll.scrollTop - next) <= 1) return;
        if (scroll.scrollTop !== observed) { observed = scroll.scrollTop; return; }
      }
      scrollElement = scroll; destination = next; checks = 0; observed = scroll.scrollTop;
      scroll.scrollTo({ top: next, behavior: win.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ? 'auto' : 'smooth' });
    }
    function delayed() {
      cancelTimeout();
      let remaining = 4;
      const pass = () => { timeout = 0; if (disposed) return; align(); if (--remaining > 0) timeout = win.setTimeout(pass, 150); };
      timeout = win.setTimeout(pass, 150);
    }
    function capture(target: EventTarget | null) {
      if (nested) return false;
      const next = resolveKeyboardInputTarget(target);
      if (!next || !contains(root, next)) return false;
      if (focused !== next) { scrollElement = null; cancelFrame(); cancelTimeout(); }
      focused = next;
      return true;
    }
    const handleFocus = (event: FocusEvent) => { if (restorePreempted && focused && focused === getTarget(event)) focused.focus({ preventScroll: true }); };
    const handleFocusIn = (event: FocusEvent) => {
      programmatic = false; consumePreempted();
      if (!capture(getTarget(event))) { clearFocused(); return; }
      if (measureViewport()) delayed();
      schedule();
    };
    const handleFocusOut = (event: FocusEvent) => {
      if (programmatic) return;
      if (!capture(event.relatedTarget)) { clearFocused(); return; }
      const visible = measureViewport();
      if (focused && visible) {
        consumePreempted();
        const rect = focused.getBoundingClientRect();
        restorePreempted = overrideGeometryDuringFocus(focused, (visible.top + visible.bottom - rect.top - rect.bottom) / 2);
      }
      schedule();
    };
    const updateViewport = () => { if (focused || capture(activeElement(doc))) schedule(); };
    const windowScroll = () => { if (restorePage()) schedule(); };
    const pointerDown = () => { cancelFrame(); cancelTimeout(); scrollElement = null; };
    doc.addEventListener('focus', handleFocus, true);
    doc.addEventListener('focusin', handleFocusIn, true);
    doc.addEventListener('focusout', handleFocusOut, true);
    doc.addEventListener('pointerdown', pointerDown, true);
    win.addEventListener('scroll', windowScroll);
    viewport?.addEventListener('resize', updateViewport);
    viewport?.addEventListener('scroll', updateViewport);
    if (viewport) win.addEventListener('resize', updateViewport);
    if (capture(activeElement(doc))) schedule();
    return () => {
      disposed = true;
      doc.removeEventListener('focus', handleFocus, true);
      doc.removeEventListener('focusin', handleFocusIn, true);
      doc.removeEventListener('focusout', handleFocusOut, true);
      doc.removeEventListener('pointerdown', pointerDown, true);
      win.removeEventListener('scroll', windowScroll);
      viewport?.removeEventListener('resize', updateViewport);
      viewport?.removeEventListener('scroll', updateViewport);
      win.removeEventListener('resize', updateViewport);
      consumePreempted(); clearFocused(); resetTouch(); getKeyboardViewport = null;
      probe?.remove(); root.style.removeProperty('--drawer-keyboard-inset');
    };
  });

  const context: DrawerVirtualKeyboardContext = {
    onTouchStart(event) {
      const touch = event.touches[0];
      moved = event.touches.length !== 1;
      touchStart = touch ? { x: touch.clientX, y: touch.clientY } : null;
    },
    onTouchMove(event) {
      const touch = event.touches[0];
      if (event.touches.length > 1) moved = true;
      if (touch && touchStart && (Math.abs(touch.clientX - touchStart.x) > 10 || Math.abs(touch.clientY - touchStart.y) > 10)) moved = true;
    },
    onTouchCancel: resetTouch,
    onTouchEnd(event) {
      const root = store.state.viewportElement;
      if (!store.state.open || !store.state.mounted || store.state.nestedOpenDialogCount > 0 || !root || !touchStart || moved) { resetTouch(); return; }
      const touch = event.changedTouches[0] ?? event.touches[0];
      if (!touch) { resetTouch(); return; }
      const point = resolveKeyboardTouchTargetFromPoint(root.getRootNode(), touch.clientX, touch.clientY);
      if (point === KEYBOARD_TAP_BLOCKED) { resetTouch(); return; }
      const target = point ?? resolveKeyboardTouchTarget(getTarget(event));
      if (!target || !contains(root, target.focusTarget) || !contains(root, target.clickTarget)) { resetTouch(); return; }
      const win = ownerWindow(target.focusTarget);
      if (win.visualViewport && win.visualViewport.scale !== 1) { resetTouch(); return; }
      if (activeElement(target.focusTarget.ownerDocument) === target.focusTarget && (!win.visualViewport || getKeyboardViewport?.() != null)) { resetTouch(); return; }
      event.preventDefault();
      programmatic = true;
      try { focusKeyboardInputWithoutPageScroll(target.focusTarget); } finally { programmatic = false; }
      dispatchKeyboardClick(target.clickTarget, touch);
      if (target.clickTarget !== target.focusTarget && activeElement(target.focusTarget.ownerDocument) === target.focusTarget) target.focusTarget.focus({ preventScroll: true });
      resetTouch();
    },
  };
  return <DrawerVirtualKeyboardContext value={context}>{props.children}</DrawerVirtualKeyboardContext>;
}
export interface DrawerVirtualKeyboardProviderProps { children?: JSX.Element }
export interface DrawerVirtualKeyboardProviderState {}
export namespace DrawerVirtualKeyboardProvider { export type Props = DrawerVirtualKeyboardProviderProps; export type State = DrawerVirtualKeyboardProviderState; }
