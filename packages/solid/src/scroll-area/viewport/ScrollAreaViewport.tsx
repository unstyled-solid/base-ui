import { createEffect, omit, onCleanup, untrack } from 'solid-js';
import type { ComponentProps } from '@solidjs/web';
import type { BaseUIComponentProps } from '../../internals/types';
import { createRenderElement } from '../../internals/createRenderElement';
import { useDirection } from '../../internals/direction-context/DirectionContext';
import { ownerWindow } from '../../utils/owner';
import { platform } from '../../utils/platform';
import { createTimeout } from '../../utils/createTimeout';
import { createAnimationFrame } from '../../utils/createAnimationFrame';
import { styleDisableScrollbar } from '../../utils/styles';
import { getFiniteAnimations } from '../../utils/getFiniteAnimations';
import { useScrollAreaRootContext } from '../root/ScrollAreaRootContext';
import type { ScrollAreaRootState } from '../root/ScrollAreaRoot';
import { scrollAreaStateAttributesMapping } from '../root/stateAttributes';
import { registerPart } from '../utils/registerPart';
import { ScrollAreaViewportContext } from './ScrollAreaViewportContext';
import { measure, OVERFLOW_EDGE_VARS } from './measure';

// CSS registration belongs to a document realm, not a particular component/request.
const registered = new WeakSet<object>();
export function removeCSSVariableInheritance(viewport: HTMLElement) {
  const css = ownerWindow(viewport).CSS;
  if (!css || registered.has(css) || platform.engine.webkit) return;
  if ('registerProperty' in css) {
    OVERFLOW_EDGE_VARS.forEach((name) => {
      try { css.registerProperty({ name, syntax: '<length>', inherits: false, initialValue: '0px' }); }
      catch { /* May already have been registered by another copy of Base UI. */ }
    });
    registered.add(css);
  }
}

export function ScrollAreaViewport(componentProps: ScrollAreaViewportProps) {
  const context = useScrollAreaRootContext();
  const direction = useDirection();
  const props = omit(componentProps, 'class', 'style', 'render', 'ref');
  const ref = registerPart(context, () => 'viewport');
  const scrollEnd = createTimeout();
  const animationsTimeout = createTimeout();
  const resizeFrame = createAnimationFrame();
  let disposed = false;
  let programmatic = true;
  let lastMeasured: { node: HTMLDivElement; metrics: number[] } | null = null;
  onCleanup(() => { disposed = true; lastMeasured = null; });
  function metrics(node: HTMLDivElement) {
    return [node.clientHeight, node.scrollHeight, node.clientWidth, node.scrollWidth];
  }
  function computeThumbPosition() {
    if (disposed) return;
    untrack(() => {
      const node = context.nodes.viewport;
      if (!node) return;
      lastMeasured = { node, metrics: metrics(node) };
      measure(context, direction());
    });
  }
  function scheduleThumbPosition() {
    if (disposed || resizeFrame.currentId !== null) return;
    // Solid commits state during the ResizeObserver delivery microtask. Reading
    // and writing geometry there can resize another observed box in the same
    // delivery. Coalesce viewport/content notifications into the next frame;
    // native scroll and the initial settled-ref measurement remain immediate.
    resizeFrame.request(computeThumbPosition);
  }

  createEffect(() => [context.revision(), direction(), context.overflowEdgeThreshold, context.hiddenState, context.cornerSize] as const, () => {
    // Descendant/conditional scrollbar refs must be available before measuring.
    let cancelled = false;
    queueMicrotask(() => { if (!cancelled) computeThumbPosition(); });
    return () => { cancelled = true; };
  });
  createEffect(() => { context.revision(); return context.nodes.viewport; }, (viewport) => {
    if (!viewport) return;
    removeCSSVariableInheritance(viewport);
    if (viewport.matches(':hover')) context.setHovering(true);
    const Observer = ownerWindow(viewport).ResizeObserver;
    let cancelled = false;
    let initialized = false;
    const observer = Observer ? new Observer(() => {
      if (cancelled || context.nodes.viewport !== viewport) return;
      if (!initialized) {
        initialized = true;
        // Mount already measured the viewport. Skip only the identical initial
        // delivery; a dimension change before that delivery must still recover.
        const current = metrics(viewport);
        if (lastMeasured?.node === viewport && current.every((value, index) => value === lastMeasured?.metrics[index])) return;
      }
      scheduleThumbPosition();
    }) : null;
    observer?.observe(viewport);
    if (!Observer) return () => { if (lastMeasured?.node === viewport) lastMeasured = null; };
    animationsTimeout.start(0, () => {
      const animations: Animation[] = getFiniteAnimations(viewport, { subtree: true });
      if (!animations.length) return;
      // Drop fulfilled Animation objects rather than retaining their detached targets.
      void Promise.allSettled(animations.map((animation) => animation.finished.then(() => {})))
        .then(() => { if (!cancelled) computeThumbPosition(); }).catch(() => {});
    });
    return () => {
      cancelled = true;
      observer?.disconnect();
      resizeFrame.cancel();
      animationsTimeout.clear();
      if (lastMeasured?.node === viewport) lastMeasured = null;
    };
  });
  function userInteraction() { programmatic = false; }
  function ViewportHost() { return createRenderElement('div', componentProps, {
    get ref() { return [ref, componentProps.ref]; }, state: context.viewportState,
    stateAttributesMapping: scrollAreaStateAttributesMapping,
    props: [{
      get 'data-id'() { return `${context.rootId}-viewport`; },
      get tabindex() { return context.hiddenState.x && context.hiddenState.y ? -1 : 0; },
      class: styleDisableScrollbar.className, style: { overflow: 'scroll' },
      onScroll() {
        if (disposed || !context.nodes.viewport) return;
        computeThumbPosition();
        const viewport = context.nodes.viewport;
        if (!viewport) return;
        if (context.touchModality || !programmatic) context.handleScroll({ x: viewport.scrollLeft, y: viewport.scrollTop });
        scrollEnd.start(100, () => { programmatic = true; });
      },
      onWheel: userInteraction, onPointerMove: userInteraction, onPointerEnter: userInteraction, onKeyDown: userInteraction,
    }, props],
  }); }
  return <ScrollAreaViewportContext value={{ computeThumbPosition, scheduleThumbPosition }}><ViewportHost /></ScrollAreaViewportContext>;
}
export interface ScrollAreaViewportState extends ScrollAreaRootState {}
export interface ScrollAreaViewportProps extends BaseUIComponentProps<'div', ScrollAreaViewportState, ComponentProps<'div'>> {}
export namespace ScrollAreaViewport { export type Props = ScrollAreaViewportProps; export type State = ScrollAreaViewportState; }
