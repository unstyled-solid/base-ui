// Owned RC13 adaptation. Geometry lifecycle informed by solid-floating-ui
// 0492e49 (MIT); Base UI 19511bb remains the behavioral oracle.
import { createEffect, createMemo, createSignal, onCleanup, untrack } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { computePosition, type ComputePositionConfig, type ComputePositionReturn } from '@floating-ui/dom';
import { isElement } from '@floating-ui/utils/dom';
import type { FloatingRootContext, FloatingTreeType, ReferenceType } from '../../internals/contracts/floating';
import { createFloatingTreeAccessor } from '../components/FloatingTree';
import { POSITIONING_REQUEST } from '../../utils/positioningRequest';
export interface UseFloatingOptions extends Partial<ComputePositionConfig> {
  /** Pinned useBaseUIFloating requires a root; external elements and callbacks belong to that root. */
  rootContext: FloatingRootContext; open?: boolean | undefined; transform?: boolean | undefined;
  whileElementsMounted?: ((reference: ReferenceType, floating: HTMLElement, update: () => void) => () => void) | undefined;
  nodeId?: string | undefined;
  externalTree?: FloatingTreeType | undefined;
}
export function createBaseUIFloating(options: UseFloatingOptions) {
  const tree = createFloatingTreeAccessor(() => options.externalTree);
  const [reference, setReference] = createSignal<ReferenceType | null>(null);
  const [floating, setFloating] = createSignal<HTMLElement | null>(null);
  const [positionReference, setPositionReference] = createSignal<ReferenceType | null>(null);
  const [result, publish] = createSignal<ComputePositionReturn | null>(null);
  const [positioned, setPositioned] = createSignal(false);
  const emptyMiddlewareData: ComputePositionReturn['middlewareData'] = {};
  let generation = 0;
  let disposed = false;
  let runCurrent: (() => void) | undefined;
  const elements = {
    get reference() { return positionReference() ?? options.rootContext.state.positionReference ?? options.rootContext.state.referenceElement ?? reference(); },
    get floating() { return options.rootContext.state.floatingElement ?? floating(); },
    get domReference() { return options.rootContext.state.domReferenceElement ?? (isElement(reference()) ? reference() as Element : null); },
  };
  const config = createMemo(() => ({ reference: elements.reference, floating: elements.floating,
    open: options.open ?? options.rootContext.state.open, placement: options.placement ?? 'bottom', strategy: options.strategy ?? 'absolute',
    middleware: options.middleware, platform: options.platform, observe: options.whileElementsMounted }), {
    transparent: true,
    equals: (a, b) => a.reference === b.reference && a.floating === b.floating && a.open === b.open && a.placement === b.placement && a.strategy === b.strategy && a.middleware === b.middleware && a.platform === b.platform && a.observe === b.observe,
  });
  let previousConfig: ReturnType<typeof config> | undefined;
  createEffect(config, (next) => {
    const previous = previousConfig;
    previousConfig = next;
    const geometryChanged = !previous || previous.reference !== next.reference || previous.floating !== next.floating ||
      previous.placement !== next.placement || previous.strategy !== next.strategy || previous.middleware !== next.middleware || previous.platform !== next.platform;
    const lifetime = ++generation;
    // Pinned react-dom retains geometry/placement while updating an open
    // reference. Readiness is a separate session flag, reset on actual close.
    if (!next.open) setPositioned(false);
    if (!next.reference || !next.floating) { setPositioned(false); runCurrent = undefined; return; }
    const update = () => {
      const request = ++generation;
      const isCurrent = () => !disposed && request === generation;
      const middleware = next.middleware?.map((entry) => entry && { ...entry, fn(state: import('@floating-ui/dom').MiddlewareState) {
        if (!isCurrent()) return {};
        const guarded = { ...state, [POSITIONING_REQUEST]: isCurrent };
        return entry.fn(guarded);
      } });
      const settings: Partial<ComputePositionConfig> = { placement: next.placement, strategy: next.strategy, middleware };
      if (next.platform) settings.platform = next.platform;
      void computePosition(next.reference!, next.floating!, settings).then((data) => {
        if (disposed || request !== generation) return;
        publish(data);
        setPositioned(next.open);
      }, (error: unknown) => {
        if (!disposed && request === generation) console.error('Base UI: computePosition failed.', error);
      });
    };
    runCurrent = update;
    // A retained hidden element still gets the source's one-shot middleware
    // projection. Closed passes never start tracking or signal visible readiness.
    const cleanup = next.open ? next.observe?.(next.reference, next.floating, update) : undefined;
    // Closing resets readiness, but does not measure the now-hidden 0x0 box
    // over the last origin. Initial retained hosts/options still get one pass.
    if (next.open ? !next.observe : geometryChanged) update();
    return () => { if (generation >= lifetime) generation++; runCurrent = undefined; cleanup?.(); };
  });
  onCleanup(() => { disposed = true; generation++; });
  const api = {
    elements,
    get rootStore() { return options.rootContext; },
    refs: {
      // Native live getters replace React RefObject.current without losing reads.
      get reference() { return elements.reference; },
      get floating() { return elements.floating; },
      get domReference() { return elements.domReference; },
      setReference(node: ReferenceType | null) { setReference(() => node); },
      setFloating(node: HTMLElement | null) { setFloating(node); },
      setPositionReference(node: ReferenceType | null) {
        setPositionReference(() => isElement(node) ? { getBoundingClientRect: () => node.getBoundingClientRect(), getClientRects: () => node.getClientRects(), contextElement: node } : node);
      },
    },
    update() { untrack(() => runCurrent?.()); },
    get x() { return result()?.x ?? 0; }, get y() { return result()?.y ?? 0; },
    get placement() { return result()?.placement ?? options.placement ?? 'bottom'; },
    get strategy() { return result()?.strategy ?? options.strategy ?? 'absolute'; },
    get middlewareData() { return result()?.middlewareData ?? emptyMiddlewareData; },
    get isPositioned() { return (options.open ?? options.rootContext.state.open) && positioned(); },
    get floatingStyles(): JSX.CSSProperties {
      const data = result(), node = elements.floating;
      const dpr = node?.ownerDocument.defaultView?.devicePixelRatio || 1;
      const x = Math.round((data?.x ?? 0) * dpr) / dpr, y = Math.round((data?.y ?? 0) * dpr) / dpr;
      return options.transform === false ? { position: data?.strategy ?? options.strategy ?? 'absolute', left: `${x}px`, top: `${y}px` }
        : { position: data?.strategy ?? options.strategy ?? 'absolute', left: '0', top: '0', transform: `translate(${x}px, ${y}px)` };
    },
  };
  const context = {
    state: {
      get open() { return options.rootContext.state.open; }, get transitionStatus() { return options.rootContext.state.transitionStatus; },
      get referenceElement() { return elements.reference; }, get positionReference() { return positionReference(); },
      get domReferenceElement() { return elements.domReference; }, get floatingElement() { return elements.floating; },
      get floatingId() { return options.rootContext.state.floatingId; },
    },
    get nested() { return options.rootContext.nested; }, get triggerElements() { return options.rootContext.triggerElements; },
    get events() { return options.rootContext.events; }, get data() { return options.rootContext.data; },
    setOpen: (next: boolean, details: Parameters<FloatingRootContext['setOpen']>[1]) => options.rootContext.setOpen(next, details),
    dispatchOpenChange: (next: boolean, details: Parameters<FloatingRootContext['dispatchOpenChange']>[1]) => options.rootContext.dispatchOpenChange(next, details),
    get open() { return options.rootContext.state.open; },
    onOpenChange: (next: boolean, details: Parameters<FloatingRootContext['setOpen']>[1]) => options.rootContext.setOpen(next, details),
    get floatingId() { return options.rootContext.state.floatingId; },
    get nodeId() { return options.nodeId; },
    get rootStore() { return options.rootContext; },
    refs: api.refs, elements, update: api.update,
    setPositionReference: api.refs.setPositionReference,
    get x() { return api.x; }, get y() { return api.y; },
    get placement() { return api.placement; }, get strategy() { return api.strategy; },
    get middlewareData() { return api.middlewareData; },
    get isPositioned() { return api.isPositioned; },
    get floatingStyles() { return api.floatingStyles; },
  };
  createEffect(() => options.rootContext.data, (data) => {
    data.floatingContext = context;
    return () => { if (data.floatingContext === context) data.floatingContext = undefined; };
  });
  createEffect(() => ({ tree: tree(), nodeId: options.nodeId }), (next) => {
    let release: (() => void) | undefined;
    const publishContext = () => {
      release?.(); release = undefined;
      const node = next.tree?.nodes.find((entry) => entry.id === next.nodeId);
      if (!node) return;
      const previous = node.context;
      node.context = context;
      release = () => { if (node.context === context) node.context = previous; };
    };
    publishContext();
    const unsubscribe = next.tree?.subscribeNodes?.(publishContext);
    return () => { unsubscribe?.(); release?.(); };
  });
  return Object.assign(api, { context });
}
export { createBaseUIFloating as createFloating, createBaseUIFloating as useBaseUIFloating };
