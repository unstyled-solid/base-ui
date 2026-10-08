import type { JSX } from '@solidjs/web';
import type { Boundary, Padding, Middleware } from '@floating-ui/dom';
import type { FloatingRootContext, ReferenceType } from './contracts/floating';
import { createEffect, createMemo, createSignal, untrack } from 'solid-js';
import { autoUpdate, flip, limitShift, offset, shift, size, type Placement } from '@floating-ui/dom';
import { getSide, getAlignment, getSideAxis } from '@floating-ui/utils';
import { createBaseUIFloating } from '../floating-ui-react/hooks/createFloating';
import { arrow } from '../floating-ui-react/middleware/arrow';
import { hide } from '../utils/hideMiddleware';
import { adaptiveOrigin } from '../utils/adaptiveOriginMiddleware';
import { useDirection } from './direction-context';
import * as css from '../utils/CommonPositionerCssVars';
import { isPositioningRequestCurrent } from '../utils/positioningRequest';
export type Side = 'top' | 'bottom' | 'left' | 'right' | 'inline-start' | 'inline-end';
export type Align = 'start' | 'center' | 'end';
export type OffsetFunction = (data: { anchor: { width: number; height: number }; positioner: { width: number; height: number }; side: Side; align: Align }) => number;
export interface UseAnchorPositioningSharedParameters {
  anchor?: ReferenceType | null | (() => ReferenceType | null); positionMethod?: 'absolute' | 'fixed';
  side?: Side; sideOffset?: number | OffsetFunction; align?: Align; alignOffset?: number | OffsetFunction;
  collisionBoundary?: Boundary | 'clipping-ancestors'; collisionPadding?: Padding;
  sticky?: boolean; arrowPadding?: number; disableAnchorTracking?: boolean;
  collisionAvoidance?: { side?: 'flip' | 'shift' | 'none'; align?: 'flip' | 'shift' | 'none'; fallbackAxisSide?: 'start' | 'end' | 'none' };
}
export interface UseAnchorPositioningParameters extends UseAnchorPositioningSharedParameters {
  rootContext: FloatingRootContext; mounted: boolean; keepMounted?: boolean; open?: boolean;
  adaptiveOrigin?: boolean | Middleware; lazyFlip?: boolean | 'placement'; lockAlign?: boolean; middleware?: Middleware[];
  floatingRootContext?: FloatingRootContext | undefined; inline?: Middleware | undefined;
  nodeId?: string | undefined;
  shift?: { crossAxis?: boolean | undefined; rootBoundary?: 'layoutViewport' | undefined } | undefined;
}
export interface AnchorPositioningResult {
  readonly positionerStyles: JSX.CSSProperties; readonly arrowStyles: JSX.CSSProperties;
  arrowRef(element: HTMLElement | null): void;
  readonly arrowUncentered: boolean; readonly side: Side; readonly align: Align;
  readonly physicalSide: 'top' | 'bottom' | 'left' | 'right'; readonly anchorHidden: boolean;
  readonly context: FloatingRootContext; readonly isPositioned: boolean;
  readonly refs: { setReference(element: ReferenceType | null): void; setFloating(element: HTMLElement | null): void; setPositionReference(element: ReferenceType | null): void };
  update(): void;
}
export function createAnchorPositioning(params: UseAnchorPositioningParameters): AnchorPositioningResult {
  const direction = useDirection();
  const [arrowElement, setArrow] = createSignal<HTMLElement | null>(null);
  // A placement lock is imperative measurement state, reset on each mounted generation.
  const [locked, setLocked] = createSignal<Placement | undefined>(undefined);
  const inputs = createMemo(() => {
    const padding = params.collisionPadding ?? 5;
    return {
      locked: params.mounted ? locked() : undefined, rtl: direction() === 'rtl', side: params.side ?? 'bottom', align: params.align ?? 'center',
      top: typeof padding === 'number' ? padding : padding.top ?? 0, right: typeof padding === 'number' ? padding : padding.right ?? 0,
      bottom: typeof padding === 'number' ? padding : padding.bottom ?? 0, left: typeof padding === 'number' ? padding : padding.left ?? 0,
      boundary: params.collisionBoundary, avoidanceSide: params.collisionAvoidance?.side ?? 'flip', avoidanceAlign: params.collisionAvoidance?.align ?? 'flip',
      fallback: params.collisionAvoidance?.fallbackAxisSide ?? 'end', shiftCross: params.shift?.crossAxis ?? false, rootBoundary: params.shift?.rootBoundary,
      sticky: params.sticky, arrow: arrowElement(), arrowPadding: params.arrowPadding ?? 5, sideOffset: params.sideOffset ?? 0, alignOffset: params.alignOffset ?? 0,
      lazyFlip: params.lazyFlip, lockAlign: params.lockAlign, inline: params.inline, adaptiveOrigin: params.adaptiveOrigin, middleware: params.middleware,
    };
  }, { transparent: true, equals: (a, b) => (Object.keys(a) as (keyof typeof a)[]).every(key => Object.is(a[key], b[key])) });
  const settings = createMemo(() => {
    const input = inputs();
    const lockedPlacement = input.locked;
    const rtl = input.rtl;
    const logicalSide = input.side;
    const side = (lockedPlacement && getSide(lockedPlacement)) || (logicalSide === 'inline-start' ? rtl ? 'right' : 'left' : logicalSide === 'inline-end' ? rtl ? 'left' : 'right' : logicalSide);
    const align = lockedPlacement && (input.lazyFlip === 'placement' || input.lockAlign) ? getAlignment(lockedPlacement) ?? 'center' : input.align;
    const placement = (align === 'center' ? side : `${side}-${align}`) as Placement;
    const pad = { top: input.top, right: input.right, bottom: input.bottom, left: input.left };
    const boundary = input.boundary === 'clipping-ancestors' ? 'clippingAncestors' : input.boundary;
    const common = { padding: pad, boundary };
    const avoidanceSide = input.avoidanceSide, avoidanceAlign = input.avoidanceAlign;
    const shiftCross = input.shiftCross;
    const shiftDisabled = avoidanceAlign === 'none' && avoidanceSide !== 'shift';
    const crossEnabled = !shiftDisabled && !!(input.sticky || shiftCross || avoidanceSide === 'shift');
    const arrowNode = input.arrow;
    const arrowPadding = input.arrowPadding;
    const sideOffset = input.sideOffset, alignOffset = input.alignOffset;
    const toLogical = (rendered: 'top' | 'bottom' | 'left' | 'right'): Side => logicalSide.startsWith('inline-') && (rendered === 'left' || rendered === 'right') ? (rendered === 'right') === rtl ? 'inline-start' : 'inline-end' : rendered;
    const dataFor = (state: import('@floating-ui/dom').MiddlewareState): Parameters<OffsetFunction>[0] => ({ side: toLogical(getSide(state.placement)), align: getAlignment(state.placement) ?? 'center', anchor: { width: state.rects.reference.width, height: state.rects.reference.height }, positioner: { width: state.rects.floating.width, height: state.rects.floating.height } });
    const flipMiddleware = avoidanceSide === 'none' ? null : flip({ ...common,
      padding: { top: pad.top + 1 + (logicalSide === 'bottom' ? 1 : 0), right: pad.right + 1 + (logicalSide === 'left' ? 1 : 0), bottom: pad.bottom + 1 + (logicalSide === 'top' ? 1 : 0), left: pad.left + 1 + (logicalSide === 'right' ? 1 : 0) },
      mainAxis: !shiftCross && avoidanceSide === 'flip', crossAxis: avoidanceAlign === 'flip' ? 'alignment' : false,
      fallbackAxisSideDirection: input.fallback });
    const shiftMiddleware = shiftDisabled ? null : shift({ ...common,
      mainAxis: avoidanceAlign !== 'none', crossAxis: crossEnabled,
      rootBoundary: input.rootBoundary === 'layoutViewport' ? 'viewport' : undefined,
      limiter: input.sticky || shiftCross ? undefined : limitShift((state) => {
        if (!arrowNode) return {};
        const rect = arrowNode.getBoundingClientRect(), vertical = getSideAxis(getSide(state.placement)) === 'y';
        return { offset: (vertical ? rect.width : rect.height) / 2 + (vertical ? pad.left + pad.right : pad.top + pad.bottom) / 2 };
      }),
    });
    const middleware: (Middleware | null | undefined)[] = [input.inline, offset((state) => {
      const data = dataFor(state), sideValue = typeof sideOffset === 'function' ? sideOffset(data) : sideOffset, alignValue = typeof alignOffset === 'function' ? alignOffset(data) : alignOffset;
      return { mainAxis: sideValue, crossAxis: alignValue, alignmentAxis: alignValue };
    })];
    middleware.push(...(avoidanceSide === 'shift' || avoidanceAlign === 'shift' || align === 'center' ? [shiftMiddleware, flipMiddleware] : [flipMiddleware, shiftMiddleware]));
    middleware.push(size({ ...common, apply(state) {
      if (!isPositioningRequestCurrent(state) || !untrack(() => params.mounted)) return;
      const { elements: { floating }, availableWidth, availableHeight, rects } = state;
      floating.style.setProperty(css.availableWidth, `${availableWidth}px`); floating.style.setProperty(css.availableHeight, `${availableHeight}px`);
      const dpr = floating.ownerDocument.defaultView?.devicePixelRatio || 1;
      const { x, y, width, height } = rects.reference;
      floating.style.setProperty(css.anchorWidth, `${(Math.round((x + width) * dpr) - Math.round(x * dpr)) / dpr}px`);
      floating.style.setProperty(css.anchorHeight, `${(Math.round((y + height) * dpr) - Math.round(y * dpr)) / dpr}px`);
    } }), arrow((state) => ({ element: arrowNode ?? state.elements.floating.ownerDocument.createElement('div'), padding: arrowNode ? arrowPadding : 0 })), {
      name: 'transformOrigin',
      async fn(state) {
        const renderedSide = getSide(state.placement), renderedAlign = getAlignment(state.placement), vertical = getSideAxis(renderedSide) === 'y';
        const gap = typeof sideOffset === 'function' ? sideOffset(dataFor(state)) : sideOffset;
        let crossOrigin: string;
        if (!arrowNode && renderedAlign && Math.abs(vertical ? state.middlewareData.shift?.x ?? 0 : state.middlewareData.shift?.y ?? 0) <= 1) {
          const platformRTL = await state.platform.isRTL?.(state.elements.floating);
          crossOrigin = (renderedAlign === 'start') === (vertical && platformRTL === true) ? '100%' : '0%';
        } else crossOrigin = `${(vertical ? state.middlewareData.arrow?.x ?? 0 : state.middlewareData.arrow?.y ?? 0) + (vertical ? arrowNode?.clientWidth ?? 0 : arrowNode?.clientHeight ?? 0) / 2}px`;
        let sideOrigin = renderedSide === 'top' || renderedSide === 'left' ? `calc(100% + ${gap}px)` : `${-gap}px`;
        if (crossEnabled && vertical && Math.abs(state.middlewareData.shift?.y ?? 0) > gap) sideOrigin = `${state.rects.reference.y + state.rects.reference.height / 2 - state.y}px`;
        // Unlike size(), pinned React projects the origin even while hidden.
        if (isPositioningRequestCurrent(state)) state.elements.floating.style.setProperty(css.transformOrigin, vertical ? `${crossOrigin} ${sideOrigin}` : `${sideOrigin} ${crossOrigin}`);
        return {};
      },
    }, hide, input.adaptiveOrigin === true ? adaptiveOrigin : typeof input.adaptiveOrigin === 'object' ? input.adaptiveOrigin : undefined, ...(input.middleware ?? []), {
      name: 'mountPlacement',
      fn(state) {
        // Commit a measurement lock in the positioning transaction, not in an
        // effect relaying the published result back into geometry configuration.
        const lockAlign = input.lazyFlip === 'placement' || input.lockAlign;
        if (input.lazyFlip && isPositioningRequestCurrent(state) && untrack(() => params.mounted) &&
          (getSide(state.placement) !== side || (lockAlign && (getAlignment(state.placement) ?? 'center') !== align))) {
          setLocked(state.placement);
        }
        return {};
      },
    });
    return { placement, middleware: middleware.filter((value): value is Middleware => !!value), rtl, logicalSide };
  }, { transparent: true });
  const root = () => params.rootContext ?? params.floatingRootContext!;
  const observation = createMemo(() => ({
    ancestorScroll: !params.disableAnchorTracking,
    elementResize: !params.disableAnchorTracking && typeof ResizeObserver !== 'undefined',
    layoutShift: !params.disableAnchorTracking && typeof IntersectionObserver !== 'undefined',
  }), { transparent: true, equals: (a, b) => a.ancestorScroll === b.ancestorScroll && a.elementResize === b.elementResize && a.layoutShift === b.layoutShift });
  const observe = createMemo(() => {
    if (params.keepMounted) return undefined;
    const options = observation();
    return (reference: ReferenceType, element: HTMLElement, update: () => void) => autoUpdate(reference, element, update, options);
  }, { transparent: true });
  const anchor = createMemo(() => { const input = params.anchor; return typeof input === 'function' ? input() : input; }, { transparent: true });
  const geometryRoot: FloatingRootContext = {
    get state() { const state = root().state; return {
      get open() { return state.open; }, get transitionStatus() { return state.transitionStatus; },
      get referenceElement() { return anchor() ?? state.referenceElement; }, get positionReference() { return anchor() ?? state.positionReference; },
      get domReferenceElement() { return state.domReferenceElement; }, get floatingElement() { return state.floatingElement; }, get floatingId() { return state.floatingId; },
    }; },
    get nested() { return root().nested; }, get triggerElements() { return root().triggerElements; }, get events() { return root().events; }, get data() { return root().data; },
    setOpen: (next, details) => root().setOpen(next, details), dispatchOpenChange: (next, details) => root().dispatchOpenChange(next, details),
  };
  const floating = createBaseUIFloating({
    rootContext: geometryRoot, get open() { return params.mounted && (params.keepMounted || (params.open ?? true)); }, get nodeId() { return params.nodeId; },
    get placement() { return settings().placement; }, get middleware() { return settings().middleware; },
    get strategy() { return params.positionMethod ?? 'absolute'; },
    get whileElementsMounted() {
      return observe();
    },
  });
  createEffect(() => params.mounted, (mounted) => {
    if (!mounted) setLocked(undefined);
  });
  createEffect(() => ({ enabled: params.keepMounted && params.mounted,
    reference: floating.elements.reference, element: floating.elements.floating, options: observation() }), (next) => {
    if (next.enabled && next.reference && next.element) {
      return autoUpdate(next.reference, next.element, floating.update, next.options);
    }
  });
  const refs = floating.refs;
  // Geometry consumes live anchors directly; only explicit positioning references
  // are registered through the setup-owned callback, never a copied prop signal.
  const context: FloatingRootContext = {
    get state() { const state = floating.context.state; return {
      get open() { return state.open; }, get transitionStatus() { return state.transitionStatus; },
      get referenceElement() { return anchor() ?? state.referenceElement; }, get positionReference() { return anchor() ?? state.positionReference; },
      get domReferenceElement() { return state.domReferenceElement; }, get floatingElement() { return state.floatingElement; }, get floatingId() { return state.floatingId; },
    }; },
    get nested() { return root().nested; }, get triggerElements() { return root().triggerElements; }, get events() { return root().events; }, get data() { return root().data; },
    setOpen: (next, details) => root().setOpen(next, details), dispatchOpenChange: (next, details) => root().dispatchOpenChange(next, details),
  };
  return {
    get positionerStyles() {
      const ready = floating.isPositioned;
      const adaptive = !!params.adaptiveOrigin, axes = floating.middlewareData.adaptiveOrigin ?? { sideX: 'left', sideY: 'top' };
      const style: JSX.CSSProperties = !ready ? { position: 'fixed', top: '0', left: '0', opacity: 0 } : adaptive ? { position: params.positionMethod ?? 'absolute', [axes.sideX]: `${floating.x}px`, [axes.sideY]: `${floating.y}px` } : floating.floatingStyles;
      return { ...style, [css.availableWidth]: '100vw', [css.availableHeight]: '100vh' };
    },
    get arrowStyles(): JSX.CSSProperties { return { position: 'absolute', top: floating.middlewareData.arrow?.y == null ? undefined : `${floating.middlewareData.arrow.y}px`, left: floating.middlewareData.arrow?.x == null ? undefined : `${floating.middlewareData.arrow.x}px` }; },
    arrowRef: setArrow,
    get arrowUncentered() { return floating.middlewareData.arrow?.centerOffset !== 0; },
    get side() { const rendered = getSide(floating.placement); return settings().logicalSide.startsWith('inline-') && (rendered === 'left' || rendered === 'right') ? (rendered === 'right') === settings().rtl ? 'inline-start' : 'inline-end' : rendered; },
    get physicalSide() { return getSide(floating.placement); }, get align() { return getAlignment(floating.placement) ?? 'center'; },
    get anchorHidden() { return !!floating.middlewareData.hide?.referenceHidden; }, context,
    get isPositioned() { return floating.isPositioned; }, refs, update: floating.update,
  };
}
export { createAnchorPositioning as useAnchorPositioning };
