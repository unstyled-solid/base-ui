import type { FloatingRootContext } from '../../internals/contracts/floating';
import type { JSX } from '@solidjs/web';
import { createEffect, onCleanup, untrack, type Accessor } from 'solid-js';
import { createTimeout } from '../../utils/createTimeout';
import { createChangeEventDetails } from '../../internals/createBaseUIEventDetails';
import { getTarget, contains, isEventTargetWithin, isRootElement } from '../utils/element';
import { isVirtualClick } from '../utils/event';
import { getComputedStyle, getParentNode, isElement, isHTMLElement, isLastTraversableNode } from '@floating-ui/utils/dom';
import { platform } from '../../utils/platform';
import { createFloatingTreeAccessor } from '../components/FloatingTree';
import { getNodeChildren } from '../utils/nodes';
import type { FloatingTreeType, LogicalLayer } from '../../internals/contracts/floating';
type PressType = 'intentional' | 'sloppy';
type PressPolicy = PressType | { mouse: PressType; touch: PressType };
export interface DismissOptions { enabled?: boolean | undefined; escapeKey?: boolean | undefined; outsidePress?: boolean | ((event: MouseEvent | TouchEvent) => boolean) | undefined; outsidePressEvent?: PressPolicy | (() => PressPolicy) | undefined; referencePress?: boolean | (() => boolean) | undefined; ancestorScroll?: boolean | undefined; bubbles?: boolean | { escapeKey?: boolean | undefined; outsidePress?: boolean | undefined } | undefined; capture?: boolean | { escapeKey?: boolean | undefined; outsidePress?: boolean | undefined } | undefined; externalTree?: FloatingTreeType | undefined; layer?: LogicalLayer | undefined }
export type InteractionElementProps = Omit<JSX.HTMLAttributes<HTMLElement>, 'ref'>;
export interface InteractionProps { reference?: InteractionElementProps | undefined; trigger?: InteractionElementProps | undefined; floating?: InteractionElementProps | undefined; item?: InteractionElementProps | undefined }
export function normalizeProp(value?: boolean | { escapeKey?: boolean | undefined; outsidePress?: boolean | undefined }) { return { escapeKey: typeof value === 'boolean' ? value : value?.escapeKey ?? false, outsidePress: typeof value === 'boolean' ? value : value?.outsidePress ?? true }; }
// Geometry contexts and root contexts are distinct views of one floating root.
// Their imperative metadata is shared, matching upstream's dataRef policy lane.
const bubblePolicies = new WeakMap<FloatingRootContext['data'], { escapeKey: boolean; outsidePress: boolean }>();
export function createDismiss(input: FloatingRootContext | Accessor<FloatingRootContext>, options: DismissOptions = {}): InteractionProps {
  const context = () => typeof input === 'function' ? input() : input;
  const tree = createFloatingTreeAccessor(() => options.externalTree);
  const composition = createTimeout(), suppressed = createTimeout(), touchExpiry = createTimeout();
  const seen = new WeakSet<Event>();
  // Source inside-tree capture is event provenance, not current DOM membership.
  // Keep it across a descendant's same-dispatch close/unmount and closed-root
  // retargeting without letting one press suppress the next outside event.
  const insideEvents = new WeakSet<Event>();
  let composing = false, sawPress = false, startedInside = false, preventedStart = false, suppressClick = false;
  let pointer = '';
  let touch: { x: number; y: number; dismissEnd: boolean; dismissMouse: boolean } | undefined;
  const own = (event: Event) => isEventTargetWithin(event, context().state.floatingElement) || isEventTargetWithin(event, context().state.domReferenceElement);
  const children = () => {
    const root = context(), id = root.data.floatingContext?.nodeId ?? tree()?.nodes.find((node) => node.context?.data === root.data)?.id;
    return id && tree() ? getNodeChildren(tree()!.nodes, id) : [];
  };
  const within = (event: Event) => insideEvents.has(event) || own(event) || options.layer?.containsEvent(event) || children().some((node) => isEventTargetWithin(event, node.context?.state.floatingElement));
  const blocking = (key: 'escapeKey' | 'outsidePress') => children().some((child) => child.context?.state.open && !bubblePolicies.get(child.context.data)?.[key]);
  const pressType = () => { const input = options.outsidePressEvent ?? 'sloppy'; const value = typeof input === 'function' ? input() : input; return typeof value === 'string' ? value : value[pointer === 'touch' ? 'touch' : 'mouse']; };
  const escape = (event: KeyboardEvent) => {
    if (seen.has(event) || !context().state.open || options.enabled === false || options.escapeKey === false || event.key !== 'Escape' || composing || event.isComposing) return;
    const bubbles = normalizeProp(options.bubbles);
    if (!bubbles.escapeKey && blocking('escapeKey')) return;
    seen.add(event);
    const details = createChangeEventDetails('escape-key', event);
    context().setOpen(false, details);
    if (!details.isCanceled) event.preventDefault();
    if (!bubbles.escapeKey && !details.isPropagationAllowed) event.stopPropagation();
  };
  const outside = (event: MouseEvent | PointerEvent | TouchEvent) => {
    if (options.enabled === false || options.outsidePress === false || !context().state.open) return;
    const policy = pressType();
    if ((policy === 'intentional' && event.type !== 'click') || (policy === 'sloppy' && event.type === 'click')) {
      if (event.type !== 'click' && !own(event)) { suppressed.clear(); suppressClick = false; }
      return;
    }
    if (within(event)) return;
    const target = getTarget(event);
    if (isElement(target) && context().triggerElements.hasMatchingElement((trigger) => contains(trigger, target))) return;
    const floating = context().state.floatingElement;
    const root = isElement(target) ? target.getRootNode() : floating?.ownerDocument;
    const markers = root && 'querySelectorAll' in root ? [...root.querySelectorAll('[data-base-ui-inert]')] : [];
    let ancestor = isElement(target) ? target : null;
    while (ancestor && !isLastTraversableNode(ancestor)) { const parent = getParentNode(ancestor); if (!isElement(parent) || isLastTraversableNode(parent)) break; ancestor = parent; }
    if (markers.length && isElement(target) && !isRootElement(target) && !contains(target, floating) && markers.every((marker) => !contains(ancestor, marker))) return;
    if (isHTMLElement(target) && !('touches' in event)) {
      const style = getComputedStyle(target), last = isLastTraversableNode(target);
      const canX = (last || /auto|scroll/.test(style.overflowX)) && target.clientWidth > 0 && target.scrollWidth > target.clientWidth;
      const canY = (last || /auto|scroll/.test(style.overflowY)) && target.clientHeight > 0 && target.scrollHeight > target.clientHeight;
      if ((canY && (style.direction === 'rtl' ? event.offsetX <= target.offsetWidth - target.clientWidth : event.offsetX > target.clientWidth)) || (canX && event.offsetY > target.clientHeight)) return;
    }
    if (policy === 'intentional') {
      const click = event as MouseEvent;
      if (click.detail !== 0 && !isVirtualClick(click) && !sawPress) return;
      if (suppressClick) { suppressed.clear(); suppressClick = false; return; }
    }
    if (typeof options.outsidePress === 'function' && !options.outsidePress(event)) return;
    if (blocking('outsidePress')) return;
    context().setOpen(false, createChangeEventDetails('outside-press', event));
  };
  createEffect(() => ({ root: context(), tree: tree(), open: context().state.open, floating: context().state.floatingElement, reference: context().state.domReferenceElement, enabled: options.enabled ?? true, escape: options.escapeKey ?? true, outside: options.outsidePress !== false, bubbles: normalizeProp(options.bubbles) }), (next) => {
    if (!next.open) sawPress = false;
    if (!next.open || !next.enabled) return;
    bubblePolicies.set(next.root.data, next.bubbles);
    const doc = next.floating?.ownerDocument ?? next.reference?.ownerDocument ?? document;
    const cleanups: (() => void)[] = [];
    const listen = (target: EventTarget, type: string, callback: EventListener, capture = false) => { target.addEventListener(type, callback, capture); cleanups.push(() => target.removeEventListener(type, callback, capture)); };
    const atTarget = (event: Event, callback: () => void) => {
      const target = getTarget(event);
      if (!target) return;
      const listener = () => { target.removeEventListener(event.type, listener); callback(); };
      target.addEventListener(event.type, listener, { once: true });
      cleanups.push(() => target.removeEventListener(event.type, listener));
    };
    if (next.escape) {
      listen(doc, 'keydown', escape as EventListener);
      listen(doc, 'compositionstart', () => { composition.clear(); composing = true; });
      listen(doc, 'compositionend', () => composition.start(platform.engine.webkit ? 5 : 0, () => { composing = false; }));
    }
    if (next.outside) {
      if (next.floating) {
        for (const type of ['click', 'pointerdown', 'mousedown', 'mouseup', 'touchend', 'touchmove']) {
          listen(next.floating, type, event => { insideEvents.add(event); }, true);
        }
      }
      const start = (raw: Event) => {
        const event = raw as PointerEvent;
        // Capture descendant participation before a target callback can retire
        // the child node; own closed-root capture runs later on the event path.
        if (within(event)) insideEvents.add(event);
        touchExpiry.clear();
        if (event.type === 'pointerdown') { pointer = event.pointerType; if (event.button === 0) sawPress = true; }
        if (event.type === 'mousedown' && touch && !touch.dismissMouse) return;
        if (event.type !== 'click' && event.button === 0 && isEventTargetWithin(event, next.floating)) { startedInside = true; preventedStart = false; }
        atTarget(event, () => {
          if (startedInside && event.defaultPrevented) preventedStart = true;
          if (event.type !== 'pointerdown' || (pointer !== 'touch' && !own(event))) outside(event);
        });
      };
      const end = (raw: Event) => {
        const event = raw as PointerEvent;
        if (event.type === 'pointercancel') sawPress = false;
        if (!startedInside) return;
        const prevented = preventedStart; startedInside = false; preventedStart = false;
        if (pressType() !== 'intentional') return;
        if (event.type === 'pointercancel') { if (prevented) { suppressClick = true; suppressed.start(0, () => { suppressClick = false; }); } return; }
        if (within(event)) return;
        if (prevented) { suppressClick = true; suppressed.start(0, () => { suppressClick = false; }); return; }
        if (typeof options.outsidePress === 'function' && !options.outsidePress(event)) return;
        suppressed.clear(); suppressClick = true;
      };
      for (const type of ['pointerdown', 'mousedown', 'click']) listen(doc, type, start, true);
      for (const type of ['pointerup', 'mouseup', 'pointercancel']) listen(doc, type, end, true);
      listen(doc, 'touchstart', (raw) => { pointer = 'touch'; const event = raw as TouchEvent;
        atTarget(event, () => { if (pressType() !== 'sloppy' || own(event)) return; const first = event.touches[0]; if (!first) return;
          touch = { x: first.clientX, y: first.clientY, dismissEnd: false, dismissMouse: true };
          touchExpiry.start(1000, () => { if (touch) { touch.dismissEnd = false; touch.dismissMouse = false; } });
        });
      }, true);
      listen(doc, 'touchmove', (raw) => { const event = raw as TouchEvent; atTarget(event, () => {
        if (!touch || pressType() !== 'sloppy' || own(event)) return;
        const first = event.touches[0]; if (!first) return;
        const distance = Math.hypot(first.clientX - touch.x, first.clientY - touch.y);
        if (distance > 5) touch.dismissEnd = true;
        if (distance > 10) { outside(event); touchExpiry.clear(); touch = undefined; }
      }); }, true);
      listen(doc, 'touchend', (raw) => { const event = raw as TouchEvent; atTarget(event, () => {
        if (!touch || pressType() !== 'sloppy' || own(event)) return;
        if (touch.dismissEnd) outside(event);
        touchExpiry.clear(); touch = undefined;
      }); }, true);
    }
    const resetSession = (details: import('../../internals/contracts/events').FloatingUIOpenChangeDetails) => { if (!details.open) sawPress = false; };
    next.root.events.on('openchange', resetSession);
    return () => { for (const cleanup of cleanups) cleanup(); next.root.events.off('openchange', resetSession); bubblePolicies.delete(next.root.data); composition.clear(); suppressed.clear(); touchExpiry.clear(); startedInside = false; preventedStart = false; suppressClick = false; touch = undefined; };
  });
  const reference: NonNullable<InteractionProps['reference']> = {
    onKeyDown: escape,
    onPointerDown(event) { if (options.enabled === false) return; const enabled = typeof options.referencePress === 'function' ? options.referencePress() : options.referencePress; if (enabled) context().setOpen(false, createChangeEventDetails('trigger-press', event)); },
    onClick(event) { if (options.enabled === false) return; const enabled = typeof options.referencePress === 'function' ? options.referencePress() : options.referencePress; if (enabled) context().setOpen(false, createChangeEventDetails('trigger-press', event)); },
  };
  const floating = { onKeyDown: escape };
  return { get reference() { return options.enabled === false ? undefined : reference; }, get trigger() { return options.enabled === false ? undefined : reference; }, get floating() { return options.enabled === false ? undefined : floating; } };
}
