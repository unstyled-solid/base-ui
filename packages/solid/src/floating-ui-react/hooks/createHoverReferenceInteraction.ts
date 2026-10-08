import { createEffect, onCleanup, untrack, type Accessor } from 'solid-js';
import type { JSX } from '@solidjs/web';
import type { FloatingRootContext, FloatingTreeType } from '../../internals/contracts/floating';
import { createChangeEventDetails } from '../../internals/createBaseUIEventDetails';
import { createHoverInteractionSharedState, applySafePolygonPointerEventsMutation, clearSafePolygonPointerEventsMutation } from './createHoverInteractionSharedState';
import { getDelay, getRestMs, isClickLikeOpenEvent, isInsideEnabledTrigger, type HandleClose, type HandleCloseContextBase, type HoverDelay } from './hoverShared';
import { createFloatingTreeAccessor } from '../components/FloatingTree';
import { contains, getTarget } from '../utils/element';
import { isMouseLikePointerType } from '../utils/event';
import { isElement } from '@floating-ui/utils/dom';
import type { Timeout } from '../../utils/createTimeout';
export interface UseHoverReferenceInteractionProps {
  enabled?: boolean | undefined; handleClose?: HandleClose | null | undefined; restMs?: number | (() => number) | undefined;
  delay?: HoverDelay | (() => HoverDelay) | undefined; move?: boolean | undefined; mouseOnly?: boolean | undefined;
  externalTree?: FloatingTreeType | undefined; isActiveTrigger?: boolean | Accessor<boolean> | undefined;
  triggerElement?: Accessor<Element | null> | undefined; triggerElementRef?: { readonly current: Element | null } | Accessor<Element | null> | undefined;
  getHandleCloseContext?: (() => HandleCloseContextBase | null) | undefined;
  isClosing?: (() => boolean) | undefined; shouldOpen?: (() => boolean) | undefined; guardStaleOpen?: boolean | undefined;
}
export function createHoverReferenceInteraction(input: FloatingRootContext | Accessor<FloatingRootContext>, options: UseHoverReferenceInteractionProps = {}): Omit<JSX.HTMLAttributes<HTMLElement>, 'ref'> {
  const context = () => typeof input === 'function' ? input() : input;
  const active = () => (typeof options.isActiveTrigger === 'function' ? options.isActiveTrigger() : options.isActiveTrigger) ?? true;
  const explicitTrigger = () => options.triggerElement?.() ?? (typeof options.triggerElementRef === 'function' ? options.triggerElementRef() : options.triggerElementRef?.current);
  const state = createHoverInteractionSharedState(input), tree = createFloatingTreeAccessor(() => options.externalTree);
  let hoverClose = false, removeMove = () => {};
  let disposed = false;
  let pendingChange: { timeout: Timeout; id: Timeout['currentId'] } | undefined;
  let pendingRest: { timeout: Timeout; id: Timeout['currentId'] } | undefined;
  const schedule = (kind: 'change' | 'rest', delay: number, callback: () => void) => {
    const timeout = kind === 'change' ? state.openChangeTimeout : state.restTimeout;
    timeout.start(delay, () => { if (kind === 'change') pendingChange = undefined; else pendingRest = undefined; if (!disposed) callback(); });
    const pending = { timeout, id: timeout.currentId };
    if (kind === 'change') pendingChange = pending; else pendingRest = pending;
  };
  const clear = () => { removeMove(); removeMove = () => {}; state.handler = undefined; options.handleClose?.dispose?.(); };
  const clickLike = () => isClickLikeOpenEvent(context().data.openEvent?.type, state.interactedInside);
  const resolveTrigger = (event: MouseEvent): Element | null => {
    const root = context(), current = event.currentTarget as Element | null, target = getTarget(event);
    if (isElement(target)) for (const trigger of root.triggerElements.elements()) if (contains(trigger, target)) return trigger;
    if (current && root.state.domReferenceElement && !root.triggerElements.hasElement(current) && contains(current, root.state.domReferenceElement)) return root.state.domReferenceElement;
    return current;
  };
  const inactive = (current: Element, target: EventTarget | null) => {
    const root = context(), dom = root.state.domReferenceElement;
    return root.triggerElements.hasElement(current) ? !dom || !contains(dom, current)
      : isElement(target) && root.triggerElements.hasMatchingElement((trigger) => contains(trigger, target)) && (!dom || !contains(dom, target));
  };
  const attempt = (event: MouseEvent, trigger: Element | null, delayed = false, expectedRoot = context()) => { if (!disposed && context() === expectedRoot && options.enabled !== false && options.shouldOpen?.() !== false && trigger?.isConnected && (!delayed || !clickLike())) expectedRoot.setOpen(true, createChangeEventDetails('trigger-hover', event, trigger)); };
  const close = (event: MouseEvent) => {
    const root = context(), delay = getDelay(options.delay, 'close', state.pointerType);
    const request = () => { if (options.enabled !== false && context() === root && !clickLike()) { root.setOpen(false, createChangeEventDetails('trigger-hover', event)); tree()?.events.emit('floating.closed', event); } };
    if (delay) schedule('change', delay, request); else { state.openChangeTimeout.clear(); request(); }
  };
  const enter = (event: MouseEvent) => {
    if (options.enabled === false) return;
    state.openChangeTimeout.clear(); state.blockMouseMove = false;
    if (options.mouseOnly && !isMouseLikePointerType(state.pointerType)) return;
    const root = context(), trigger = resolveTrigger(event); if (!trigger) return;
    const overInactive = inactive(trigger, getTarget(event)), open = root.state.open;
    const closing = !open && (options.isClosing?.() ?? root.state.transitionStatus === 'ending') && hoverClose;
    const reopen = !overInactive && root.state.domReferenceElement && contains(root.state.domReferenceElement, trigger) && closing;
    if ((overInactive && (open || closing)) || reopen) { if (options.shouldOpen?.() !== false) root.setOpen(true, createChangeEventDetails('trigger-hover', event, trigger)); return; }
    const delay = getDelay(options.delay, 'open', state.pointerType), rest = getRestMs(options.restMs ?? 0);
    if (rest > 0 && !delay) return;
    if (!open || overInactive) { if (delay) schedule('change', delay, () => attempt(event, trigger, true, root)); else attempt(event, trigger); }
  };
  const leave = (event: MouseEvent) => {
    if (options.enabled === false) return;
    if (clickLike()) { clearSafePolygonPointerEventsMutation(state); return; }
    clear(); state.restTimeout.clear(); state.restTimeoutPending = false;
    const root = context();
    if (isInsideEnabledTrigger(event.relatedTarget, root.triggerElements)) return;
    const base = root.data.floatingContext ?? options.getHandleCloseContext?.();
    if (options.handleClose && base?.elements.floating) {
      if (!root.state.open) state.openChangeTimeout.clear();
      const trigger = explicitTrigger() ?? root.state.domReferenceElement;
      const handler = options.handleClose({ ...base, tree: tree(), x: event.clientX, y: event.clientY, onClose() {
        clearSafePolygonPointerEventsMutation(state); clear();
        if (options.enabled !== false && !clickLike() && trigger === context().state.domReferenceElement) close(event);
      } });
      state.handler = handler;
      const doc = root.state.domReferenceElement?.ownerDocument ?? base.elements.floating.ownerDocument;
      doc.addEventListener('mousemove', handler); removeMove = () => doc.removeEventListener('mousemove', handler); handler(event); return;
    }
    if (state.pointerType !== 'touch' || !contains(root.state.floatingElement, event.relatedTarget as Element | null)) close(event);
  };
  createEffect(() => ({ root: context(), tree: tree(), enabled: options.enabled ?? true, trigger: explicitTrigger() ?? (active() ? context().state.domReferenceElement : null), move: options.move ?? true, guard: options.guardStaleOpen ?? false, handle: options.handleClose, active: active() }), (next) => {
    if (!next.enabled) return;
    untrack(() => { if (next.active) state.handleCloseOptions = next.handle?.__options; });
    const changed = (details: import('../../internals/contracts/events').FloatingUIOpenChangeDetails) => {
      hoverClose = !details.open && details.reason === 'trigger-hover';
      if (!details.open) { clear(); state.openChangeTimeout.clear(); state.restTimeout.clear(); state.blockMouseMove = true; state.restTimeoutPending = false; }
    };
    next.root.events.on('openchange', changed);
    const trigger = next.trigger;
    const out = (event: MouseEvent) => { if (!contains(trigger, event.relatedTarget as Element | null)) { state.openChangeTimeout.clear(); state.restTimeout.clear(); state.restTimeoutPending = false; } };
    const onEnter: EventListener = (event) => enter(event as MouseEvent), onLeave: EventListener = (event) => leave(event as MouseEvent), onOut: EventListener = (event) => out(event as MouseEvent);
    trigger?.addEventListener('mouseenter', onEnter); trigger?.addEventListener('mouseleave', onLeave);
    if (next.move) trigger?.addEventListener('mousemove', onEnter, { once: true });
    if (next.guard) trigger?.addEventListener('mouseout', onOut);
    return () => { next.root.events.off('openchange', changed); trigger?.removeEventListener('mouseenter', onEnter); trigger?.removeEventListener('mouseleave', onLeave); trigger?.removeEventListener('mousemove', onEnter); trigger?.removeEventListener('mouseout', onOut); untrack(clear); next.handle?.dispose?.(); };
  });
  onCleanup(() => untrack(() => {
    disposed = true;
    for (const pending of [pendingChange, pendingRest]) if (pending && pending.timeout.currentId === pending.id) pending.timeout.clear();
    clear(); clearSafePolygonPointerEventsMutation(state);
  }));
  return {
    onPointerDown(event) { if (options.enabled !== false) state.pointerType = event.pointerType; }, onPointerEnter(event) { if (options.enabled !== false) state.pointerType = event.pointerType; },
    onMouseMove(event) {
      if (options.enabled === false || (options.mouseOnly && !isMouseLikePointerType(state.pointerType))) return;
      const root = context(), trigger = event.currentTarget, overInactive = inactive(trigger, getTarget(event));
      if (root.state.open && overInactive && state.handleCloseOptions?.blockPointerEvents && root.state.floatingElement) applySafePolygonPointerEventsMutation(state, { scopeElement: state.handleCloseOptions.getScope?.() ?? trigger.ownerDocument.body, referenceElement: trigger, floatingElement: root.state.floatingElement });
      const rest = getRestMs(options.restMs ?? 0); if ((root.state.open && !overInactive) || rest === 0) return;
      if (!overInactive && state.restTimeoutPending && event.movementX ** 2 + event.movementY ** 2 < 2) return;
      state.restTimeout.clear();
      const request = () => { state.restTimeoutPending = false; if (!state.blockMouseMove && (!context().state.open || overInactive)) attempt(event, trigger, true); };
      if (state.pointerType === 'touch' || (overInactive && root.state.open)) request();
      else { state.restTimeoutPending = true; schedule('rest', rest, request); }
    },
  };
}
