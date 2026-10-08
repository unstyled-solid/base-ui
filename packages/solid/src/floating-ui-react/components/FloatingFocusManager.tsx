import type { JSX } from '@solidjs/web';
import { createEffect, createMemo, createSignal, onSettled, untrack, type Accessor } from 'solid-js';
import type { FloatingRootContext } from '../../internals/contracts/floating';
import type { PortalFocusState } from '../../internals/contracts/portal';
import { usePortalContext } from './PortalContext';
import { createFloatingTreeAccessor } from './FloatingTree';
import { getNodeAncestors, getNodeChildren } from '../utils/nodes';
import { activeElement, contains, getFloatingFocusElement, getTarget, isTypeableCombobox, isTypeableElement } from '../utils/element';
import { tabbable, focusable, isTabbable, isOutsideEvent, getNextTabbable, getPreviousTabbable } from '../utils/tabbable';
import { markOthers } from '../utils/markOthers';
import { isElementVisible } from '../utils/visibility';
import { enqueueFocus } from '../utils/enqueueFocus';
import { isVirtualClick, isVirtualPointerEvent } from '../utils/event';
import { createChangeEventDetails } from '../../internals/createBaseUIEventDetails';
import { FocusGuard } from '../../utils/FocusGuard';
import { createAnimationFrame } from '../../utils/createAnimationFrame';
import { createTimeout } from '../../utils/createTimeout';
import { platform } from '../../utils/platform';
import type { FloatingTreeType } from '../../internals/contracts/floating';
import type { FloatingUIOpenChangeDetails } from '../../internals/contracts/events';
export type FocusInteraction = 'mouse' | 'touch' | 'pen' | 'keyboard' | '';
export type FocusTarget = boolean | number | HTMLElement | null | { readonly current: HTMLElement | null } | Accessor<HTMLElement | null> | { resolve(interaction: FocusInteraction): boolean | HTMLElement | null | void }['resolve'];
export interface FloatingFocusManagerProps {
  children?: JSX.Element; context: FloatingRootContext; disabled?: boolean; modal?: boolean;
   initialFocus?: FocusTarget | undefined;
   returnFocus?: FocusTarget | undefined;
   restoreFocus?: boolean | 'popup'; closeOnFocusOut?: boolean; guards?: boolean;
   order?: ('reference' | 'floating' | 'content')[];
   openInteractionType?: FocusInteraction | null | undefined; explicitReturnFocus?: boolean | undefined;
   nextFocusableElement?: HTMLElement | Accessor<HTMLElement | null> | { readonly current: HTMLElement | null } | null | undefined;
   previousFocusableElement?: HTMLElement | Accessor<HTMLElement | null> | { readonly current: HTMLElement | null } | null | undefined;
   beforeContentFocusGuardRef?: { current: HTMLElement | null } | ((element: HTMLElement | null) => void) | undefined;
   externalTree?: FloatingTreeType | undefined;
   getInsideElements?: (() => (Element | null | undefined)[]) | undefined;
}
const histories = new WeakMap<Document, WeakRef<Element>[]>();
function remember(doc: Document, element: Element | null) {
  const history = (histories.get(doc) ?? []).filter((entry) => entry.deref()?.isConnected);
  if (element && element !== doc.body) history.push(new WeakRef(element));
  histories.set(doc, history.slice(-20));
}
function previous(doc: Document): Element | null { return [...(histories.get(doc) ?? [])].reverse().find((entry) => entry.deref()?.isConnected)?.deref() ?? null; }
function resolve(value: FocusTarget | undefined, interaction: FocusInteraction): boolean | number | HTMLElement | null | void {
  const result = typeof value === 'function' ? value(interaction) : value;
  return result && typeof result === 'object' && 'current' in result ? result.current : result;
}
function target(value: FloatingFocusManagerProps['nextFocusableElement']): HTMLElement | null { return typeof value === 'function' ? value() : value && 'current' in value ? value.current : value ?? null; }
export function FloatingFocusManager(props: FloatingFocusManagerProps): JSX.Element {
  const portal = usePortalContext(), tree = createFloatingTreeAccessor(() => props.externalTree);
  const frame = createAnimationFrame(), pointerTimeout = createTimeout();
  const adoptionFrame = createAnimationFrame();
  const [layoutEpoch, setLayoutEpoch] = createSignal(0);
  // A native template ancestor can adopt an already-reported child back into
  // its inert document before Portal inserts the ancestor. Recheck the realm
  // at the layout frame, after the scheduled portal insertion has committed.
  onSettled(() => {
    setLayoutEpoch(1);
    adoptionFrame.request(() => { setLayoutEpoch(2); });
  });
  const [before, setBefore] = createSignal<HTMLElement | null>(null), [after, setAfter] = createSignal<HTMLElement | null>(null);
  let lastTabbable: HTMLElement | null = null;
  let pointerDown = false, pointerOutside = false, preventReturn = false;
  let lastPointerEvent: PointerEvent | null = null;
  let lastInteraction: FocusInteraction = '', closeType: FocusInteraction = '';
  let returnJob: { canceled: boolean } | undefined;
  const focusElement = createMemo(() => {
    layoutEpoch();
    const element = getFloatingFocusElement(props.context.state.floatingElement);
    return element?.ownerDocument.body ? element : null;
  });
  const untrapped = () => isTypeableCombobox(props.context.state.domReferenceElement) && props.initialFocus === false;
  const insideElements = () => props.getInsideElements?.().filter((element): element is Element => !!element) ?? [];
  const nodeId = () => props.context.data.floatingContext?.nodeId ?? tree()?.nodes.find((node) => node.context === props.context)?.id;
  const inside = (element: Element | null) => {
    if (!element) return false;
    const state = props.context.state;
    return contains(state.floatingElement, element) || contains(state.domReferenceElement, element) || contains(portal?.portalNode(), element) || insideElements().some((branch) => contains(branch, element))
      || props.context.triggerElements.hasMatchingElement((trigger) => contains(trigger, element))
      || (nodeId() ? [...getNodeChildren(tree()!.nodes, nodeId(), false), ...getNodeAncestors(tree()!.nodes, nodeId())].some((node) => contains(node.context?.state.floatingElement, element) || contains(node.context?.state.domReferenceElement, element)) : false);
  };
  // Native tabindex changes are an owned resource, not a second reactive state.
  createEffect(() => ({ element: focusElement(), disabled: props.disabled }), ({ element, disabled }) => {
    if (!element || disabled) return;
    const initialIndex = element.getAttribute('tabindex'), initialMarker = element.getAttribute('data-tabindex');
    const managed = !element.hasAttribute('tabindex') || element.hasAttribute('data-tabindex');
    if (!managed || !element.getAttribute('role')?.includes('dialog')) return;
    let written = '';
    const update = () => {
      if (element.getAttribute('tabindex') !== written && written && !element.hasAttribute('data-tabindex')) return;
      const content = focusable(element).filter((node) => isTabbable(node) || (node.hasAttribute('data-tabindex') && !(node.getAttribute('data-tabindex') ?? '').startsWith('-')));
      const next = content.length ? '-1' : '0';
      if (element.getAttribute('tabindex') !== next) element.setAttribute('tabindex', next);
      if (element.getAttribute('data-tabindex') !== next) element.setAttribute('data-tabindex', next);
      written = next;
    };
    update();
    const Observer = element.ownerDocument.defaultView!.MutationObserver;
    const observer = new Observer(update); observer.observe(element, { subtree: true, childList: true, attributes: true, attributeFilter: ['tabindex', 'disabled', 'hidden'] });
    return () => {
      observer.disconnect();
      if (element.getAttribute('tabindex') === written) { if (initialIndex === null) element.removeAttribute('tabindex'); else element.setAttribute('tabindex', initialIndex); }
      if (element.getAttribute('data-tabindex') === written) { if (initialMarker === null) element.removeAttribute('data-tabindex'); else element.setAttribute('data-tabindex', initialMarker); }
    };
  });
  createEffect(() => ({ root: props.context, tree: tree(), open: props.context.state.open, floating: props.context.state.floatingElement, reference: props.context.state.domReferenceElement,
    focus: focusElement(), disabled: props.disabled ?? false, modal: props.modal ?? true, untrapped: untrapped(), restore: props.restoreFocus, close: props.closeOnFocusOut ?? true,
    extra: insideElements(), before: before(), after: after(), previous: target(props.previousFocusableElement), next: target(props.nextFocusableElement),
    portalNode: portal?.portalNode(), beforeOutside: portal?.beforeOutside(), afterOutside: portal?.afterOutside() }), (next) => {
    if (!next.floating || !next.focus || next.disabled || !next.open) return;
    const doc = next.floating.ownerDocument;
    const cleanups: (() => void)[] = [];
    const listen = (element: EventTarget, type: string, handler: EventListener, capture = false) => { element.addEventListener(type, handler, capture); cleanups.push(() => element.removeEventListener(type, handler, capture)); };
    const pointer = (event: Event) => {
      const native = event as PointerEvent; const element = getTarget(native) as Element | null;
      lastPointerEvent = native;
      pointerOutside = !untrack(() => inside(element));
      lastInteraction = native.pointerType === 'touch' ? 'touch' : native.pointerType === 'pen' ? 'pen' : native.pointerType === 'mouse' ? 'mouse' : 'keyboard';
      if (element?.closest?.('[data-base-ui-click-trigger]')) { pointerDown = true; pointerTimeout.start(0, () => { pointerDown = false; }); }
    };
    listen(doc, 'pointerdown', pointer, true);
    const clearPointer = () => { pointerOutside = false; lastPointerEvent = null; };
    listen(doc, 'pointerup', clearPointer, true); listen(doc, 'pointercancel', clearPointer, true);
    listen(doc, 'keydown', () => { lastInteraction = 'keyboard'; }, true);
    listen(doc, 'keydown', (event) => {
      const key = event as KeyboardEvent;
      if (next.modal && !next.untrapped && key.key === 'Tab' && contains(next.focus, activeElement(doc)) && next.focus && !tabbable(next.focus).length) { key.preventDefault(); key.stopPropagation(); }
    });
    let focusedChild = contains(next.floating, activeElement(doc)) ? activeElement(doc) as HTMLElement | null : null;
    listen(next.floating, 'focusin', (event) => {
      const element = getTarget(event) as HTMLElement | null;
      focusedChild = element;
      if (isTabbable(element)) lastTabbable = element;
    });
    let alive = true;
    if (next.restore) {
      // Fallback for the observed WebKit child-removal focus loss. The exact
      // native-event/removal ordering still needs an upstream comparison (see
      // testing-debt.md). Never reclaim deliberately moved consumer focus.
      const Observer = doc.defaultView?.MutationObserver;
      if (Observer) {
        const observer = new Observer(() => untrack(() => {
          if (!alive || !props.context.state.open || !focusedChild || focusedChild.isConnected || activeElement(doc) !== doc.body) return;
          focusedChild = null;
          const items = tabbable(next.focus!);
          const restore = next.restore === 'popup' ? next.focus! : lastTabbable && items.includes(lastTabbable) ? lastTabbable : items.at(-1) ?? next.focus!;
          restore.focus();
          if (next.restore === 'popup') frame.request(() => { if (alive && untrack(() => props.context.state.open)) next.focus?.focus(); });
        }));
        observer.observe(next.floating, { childList: true, subtree: true });
        cleanups.push(() => observer.disconnect());
      }
    }
    const out = (raw: Event) => {
      const event = raw as FocusEvent, related = event.relatedTarget as Element | null, currentTarget = event.currentTarget;
      const focusedTarget = getTarget(event) as HTMLElement | null;
      // A modal backdrop can blur its field to body before a canceled close
      // opens a confirmation. Preserve that source return target at dispatch.
      if (next.modal && related === null && contains(next.floating, focusedTarget)) remember(doc, focusedTarget);
      // The native event belongs to the tree that participated in this focus
      // transfer, even if its child portal unregisters before the checkpoint.
      const relatedInside = untrack(() => inside(related));
      queueMicrotask(() => untrack(() => {
        if (!alive || !props.context.state.open) return;
        const element = getTarget(event) as HTMLElement | null;
        if (next.restore && currentTarget !== next.reference && activeElement(doc) === doc.body && element && !isElementVisible(element) && next.focus) {
          const items = tabbable(next.focus), restore = next.restore === 'popup' ? next.focus : lastTabbable && items.includes(lastTabbable) ? lastTabbable : items.at(-1) ?? next.focus;
          restore.focus(); if (next.restore === 'popup') frame.request(() => { if (alive) next.focus?.focus(); });
          return;
        }
        // Ref cells can attach after this listener resource was captured. As in
        // the source focus-out checkpoint, resolve the current guard targets;
        // native Tab may run this checkpoint before the guard's focus handler.
        const focusGuards = [before(), after(), portal?.beforeInside(), portal?.afterInside(), portal?.beforeOutside(), portal?.afterOutside(), target(props.previousFocusableElement), target(props.nextFocusableElement)];
        // Native portals publish logical capture provenance through their layer.
        // Read it at this checkpoint, after a closed shadow root has marked the
        // event, even if the descendant portal/registry has already retired.
        const outsidePointer = pointerOutside && !(lastPointerEvent && portal?.layer.containsEvent(lastPointerEvent));
        if (portal?.layer.containsEvent(event) && !outsidePointer) return;
        if (!next.close || (next.modal && !next.untrapped) || !related || pointerDown || relatedInside || inside(related) || inside(activeElement(doc)) || focusGuards.includes(related as HTMLElement)) return;
        preventReturn = true;
        props.context.setOpen(false, createChangeEventDetails('focus-out', event));
      }));
    };
    listen(next.floating, 'focusout', out);
    if (next.reference) { listen(next.reference, 'focusout', out); listen(next.reference, 'pointerdown', () => { pointerDown = true; pointerTimeout.start(0, () => { pointerDown = false; }); }); }
    let restoreHidden = () => {}, restoreMarkers = () => {};
    const floatingElement = next.floating;
    // A ref can publish a template-owned host before the renderer adopts it into
    // the portal document. Mark siblings at the settled DOM checkpoint, using
    // that document, and cancel acquisition if this resource was superseded.
    queueMicrotask(() => {
      if (!alive || !floatingElement.isConnected) return;
      const portalNodes = next.portalNode?.querySelectorAll('[data-base-ui-portal]') ?? [];
      const allowed = [floatingElement, ...portalNodes, next.before, next.after, next.beforeOutside, next.afterOutside, ...next.extra, next.previous, next.next, next.untrapped ? next.reference : null].filter((element): element is Element => !!element);
      restoreHidden = markOthers(allowed, { ariaHidden: next.modal || next.untrapped, mark: false });
      restoreMarkers = markOthers([floatingElement, ...portalNodes]);
    });
    return () => { alive = false; clearPointer(); for (const cleanup of cleanups) cleanup(); restoreMarkers(); restoreHidden(); pointerTimeout.clear(); frame.cancel(); };
  });
  // Initial focus belongs to an opening host, not trigger/tree rebindings.
  createEffect(() => ({ root: props.context, open: props.context.state.open, focus: focusElement(), disabled: props.disabled }), (next) => {
    if (!next.open || next.disabled || !next.focus) return;
    const doc = next.focus.ownerDocument, prior = activeElement(doc);
    let alive = true, cancelFocus: (() => void) | undefined;
    queueMicrotask(() => untrack(() => {
      if (!alive || !props.context.state.open || contains(next.focus, prior)) return;
      const value = resolve(props.initialFocus ?? true, props.openInteractionType ?? '');
      if (value === false || value === undefined || typeof value === 'number' && value < 0) return;
      const items = tabbable(next.focus!);
      const element = typeof value === 'number' ? items[value] ?? next.focus : typeof value === 'object' && value ? value : items[0] ?? next.focus;
      cancelFocus = enqueueFocus(element, { preventScroll: element === next.focus, sync: next.root.data.openEvent?.type === 'mousedown' && isVirtualClick(next.root.data.openEvent as MouseEvent), shouldFocus: () => alive && untrack(() => props.context.state.open) && !contains(next.focus, activeElement(doc)) });
    }));
    return () => { alive = false; cancelFocus?.(); };
  });
  // Return-focus targets follow reference/tree ownership independently.
  const returnOwnership = createMemo(() => ({ root: props.context, tree: tree(), open: props.context.state.open, floating: props.context.state.floatingElement, focus: focusElement(), reference: props.context.state.domReferenceElement, disabled: props.disabled }), {
    equals: (a, b) => a.root === b.root && a.tree === b.tree && a.open === b.open && a.floating === b.floating && a.focus === b.focus && a.reference === b.reference && a.disabled === b.disabled,
  });
  createEffect(returnOwnership, (next) => {
    if (!next.open || next.disabled || !next.focus) return;
    if (returnJob) returnJob.canceled = true;
    const doc = next.focus.ownerDocument, prior = activeElement(doc);
    // Capture the opening policy. Roots reset their interaction type on close;
    // that reset must not turn a pointer-open into a programmatic return target.
    const programmatic = untrack(() => props.openInteractionType === null);
    remember(doc, prior); closeType = ''; lastInteraction = '';
    const change = (details: FloatingUIOpenChangeDetails) => untrack(() => {
      if (!details.open) {
        const event = details.nativeEvent;
        closeType = event.type.startsWith('key') ? 'keyboard' : 'touches' in event ? 'touch' : 'pointerType' in event ? (event as PointerEvent).pointerType as FocusInteraction || lastInteraction || 'keyboard' : event.type.startsWith('focus') ? lastInteraction || 'keyboard' : lastInteraction || 'mouse';
      }
      if ((details.reason === 'focus-out' && details.triggerElement?.hasAttribute('data-base-ui-focus-guard')) || (details.reason === 'trigger-hover' && details.nativeEvent.type === 'mouseleave')) preventReturn = true;
      if (details.reason === 'outside-press') {
        if (details.nested || isVirtualClick(details.nativeEvent as MouseEvent) || isVirtualPointerEvent(details.nativeEvent as PointerEvent)) preventReturn = false;
        else { let supported = false; doc.createElement('div').focus({ get preventScroll() { supported = true; return false; } }); preventReturn = !supported; }
      }
    });
    next.root.events.on('openchange', change);
    return () => {
      next.root.events.off('openchange', change);
      const job = { canceled: false }; returnJob = job;
      const active = activeElement(doc);
      const wasInside = untrack(() => contains(next.floating, active) || insideElements().some((element) => contains(element, active))
        || (next.tree && getNodeChildren(next.tree.nodes, nodeId(), false).some((node) => contains(node.context?.state.floatingElement, active))));
      // Resolve while the closing host and its return policy are still owned.
      // Disposal may clear both refs and consumer targets before the queued job.
      const { value, element, explicit } = untrack(() => {
        const value = resolve(props.returnFocus ?? true, closeType);
        const reference = next.reference?.isConnected ? next.reference : null;
        const previousElement = prior?.isConnected && prior !== doc.body ? prior : null;
        const defaultTarget = (programmatic ? previousElement ?? reference : reference ?? previousElement) ?? previous(doc);
        return { value, element: typeof value === 'object' && value ? value : defaultTarget,
          explicit: props.explicitReturnFocus ?? (typeof props.returnFocus !== 'boolean' && props.returnFocus !== undefined) };
      });
      queueMicrotask(() => untrack(() => {
        if (job.canceled) return;
        if (value === false || value === undefined || preventReturn) { preventReturn = false; return; }
        if (!element || (!explicit && active !== doc.body && active !== element && !wasInside)) return;
        // A later native focus handoff can run after Solid's cleanup but before
        // this job. The source's implicit return policy respects focus moved
        // outside the closing popup; an explicit consumer target still wins.
        const currentActive = activeElement(doc);
        if (!explicit && currentActive !== active && currentActive !== doc.body && currentActive !== element
          && !contains(next.floating, currentActive) && !insideElements().some(branch => contains(branch, currentActive))) {
          preventReturn = false;
          return;
        }
        const resolved = isTabbable(element) ? element : tabbable(element)[0] ?? element;
        if ('focus' in resolved) resolved.focus({ preventScroll: true, ...(closeType === 'keyboard' ? { focusVisible: true } : {}) });
        preventReturn = false;
      }));
    };
  });
  const portalOwnership = createMemo(() => ({ root: props.context, open: props.context.state.open, reference: props.context.state.domReferenceElement, disabled: props.disabled, modal: props.modal ?? true, close: props.closeOnFocusOut ?? true }), {
    equals: (a, b) => a.root === b.root && a.open === b.open && a.reference === b.reference && a.disabled === b.disabled && a.modal === b.modal && a.close === b.close,
  });
  const portalState = createMemo<PortalFocusState | null>(() => {
    const next = portalOwnership();
    if (next.disabled) return null;
    return { modal: next.modal, open: next.open, domReference: next.reference, closeOnFocusOut: next.close,
      onOpenChange(open: boolean, data?: { reason?: string | undefined; event?: Event | undefined }) { next.root.setOpen(open, createChangeEventDetails(data?.reason ?? 'none', data?.event)); } };
  });
  // Register the accessor once for this owner, rather than relaying every open,
  // modal or reference change through an effect-written portal signal.
  createEffect(() => portalState, source => portal?.registerFocusManagerState(source));
  const guards = () => props.guards !== false && !props.disabled && ((props.modal ?? true) ? !untrapped() : true) && (!!portal || (props.modal ?? true));
  const reportBefore = (node: HTMLElement | null) => { setBefore(node); portal?.setBeforeInside?.(node); const ref = props.beforeContentFocusGuardRef; if (typeof ref === 'function') ref(node); else if (ref) ref.current = node; };
  const reportAfter = (node: HTMLElement | null) => { setAfter(node); portal?.setAfterInside?.(node); };
  // React's onFocus runs after focusin capture. Native focus fires earlier;
  // use focusin so portal capture restores tabindex before guard navigation.
  return <>
    {guards() && <FocusGuard ref={reportBefore} data-type="inside" onFocusIn={(event) => untrack(() => {
      const element = focusElement(); if (!element) return;
      if (props.modal ?? true) { (tabbable(element).at(-1) ?? element).focus(); }
      else if (portal?.portalNode()) { preventReturn = false; if (isOutsideEvent(event, portal.portalNode()!)) getNextTabbable(props.context.state.domReferenceElement)?.focus(); else (target(props.previousFocusableElement) ?? portal.beforeOutside())?.focus(); }
    })} />}
    {props.children}
    {guards() && <FocusGuard ref={reportAfter} data-type="inside" onFocusIn={(event) => untrack(() => {
      const element = focusElement(); if (!element) return;
      if (props.modal ?? true) { (tabbable(element)[0] ?? element).focus(); }
      else if (portal?.portalNode()) { if (props.closeOnFocusOut !== false) preventReturn = true; if (isOutsideEvent(event, portal.portalNode()!)) getPreviousTabbable(props.context.state.domReferenceElement)?.focus(); else (target(props.nextFocusableElement) ?? portal.afterOutside())?.focus(); }
    })} />}
  </>;
}
