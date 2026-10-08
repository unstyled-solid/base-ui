import { createSignal, omit, onCleanup } from 'solid-js';
import type { ComponentProps } from '@solidjs/web';
import type { BaseUIComponentProps } from '../../internals/types';
import { createRenderElement } from '../../internals/createRenderElement';
import { createBaseUiId } from '../../internals/createBaseUiId';
import { useCSPContext } from '../../internals/csp-context/CSPContext';
import { createTimeout } from '../../utils/createTimeout';
import { contains, getTarget } from '../../utils/shadowDom';
import { styleDisableScrollbar } from '../../utils/styles';
import { acquirePointerCapture, releasePointerCapture } from '../../utils/pointerCapture';
import { SCROLL_TIMEOUT } from '../constants';
import { getOffset } from '../utils/getOffset';
import { registerPart } from '../utils/registerPart';
import { ScrollAreaRootContext, type Orientation, type ScrollAreaRootContextValue } from './ScrollAreaRootContext';
import { scrollAreaStateAttributesMapping } from './stateAttributes';

export interface Size { width: number; height: number }
export interface Coords { x: number; y: number }
export interface HiddenState { x: boolean; y: boolean; corner: boolean }
export interface OverflowEdges { xStart: boolean; xEnd: boolean; yStart: boolean; yEnd: boolean }
export interface ScrollAreaRootState {
  scrolling: boolean;
  hasOverflowX: boolean;
  hasOverflowY: boolean;
  overflowXStart: boolean;
  overflowXEnd: boolean;
  overflowYStart: boolean;
  overflowYEnd: boolean;
  cornerHidden: boolean;
}
export interface ScrollAreaRootProps extends BaseUIComponentProps<'div', ScrollAreaRootState, ComponentProps<'div'>> {
  overflowEdgeThreshold?: number | Partial<Record<keyof OverflowEdges, number>>;
}

export function normalizeOverflowEdgeThreshold(threshold: ScrollAreaRootProps['overflowEdgeThreshold']) {
  const value = typeof threshold === 'number'
    ? { xStart: threshold, xEnd: threshold, yStart: threshold, yEnd: threshold } : threshold;
  return {
    xStart: Math.max(0, value?.xStart || 0), xEnd: Math.max(0, value?.xEnd || 0),
    yStart: Math.max(0, value?.yStart || 0), yEnd: Math.max(0, value?.yEnd || 0),
  };
}

/** Source: Base UI 19511bb, MIT. Solid setup owns state; gesture latches are synchronous. */
export function ScrollAreaRoot(componentProps: ScrollAreaRootProps) {
  const elementProps = omit(componentProps, 'render', 'class', 'style', 'ref', 'overflowEdgeThreshold');
  const id = createBaseUiId();
  const csp = useCSPContext();
  const [hovering, setHovering] = createSignal(false);
  const [scrollingX, setScrollingX] = createSignal(false);
  const [scrollingY, setScrollingY] = createSignal(false);
  const [measured, setHasMeasuredScrollbar] = createSignal(false);
  const [cornerSize, setCornerSize] = createSignal<Size>({ width: 0, height: 0 });
  const [thumbSize, setThumbSize] = createSignal<Size>({ width: 0, height: 0 });
  const [hidden, setHiddenState] = createSignal<HiddenState>({ x: true, y: true, corner: true });
  const [edges, setOverflowEdges] = createSignal<OverflowEdges>({ xStart: false, xEnd: false, yStart: false, yEnd: false });
  const [revision, setRevision] = createSignal(0);
  const timeoutX = createTimeout();
  const timeoutY = createTimeout();
  let touchModality = false;
  let disposed = false;
  let position: Coords = { x: 0, y: 0 };
  let active: { id: number; orientation: Orientation; x: number; y: number; top: number; left: number; thumb: HTMLDivElement | null } | null = null;
  let savedSnap: { node: HTMLDivElement; value: string } | null = null;
  const nodes: ScrollAreaRootContextValue['nodes'] = { root: null, viewport: null, scrollbarX: null, scrollbarY: null, thumbX: null, thumbY: null, corner: null };

  function startScrolling(vertical: boolean) {
    const setter = vertical ? setScrollingY : setScrollingX;
    setter(true);
    (vertical ? timeoutY : timeoutX).start(SCROLL_TIMEOUT, () => setter(false));
  }
  function handleScroll(next: Coords) {
    if (next.x !== position.x) startScrolling(false);
    if (next.y !== position.y) startScrolling(true);
    position = next;
  }
  function disableViewportSnap() {
    if (nodes.viewport && savedSnap === null) {
      savedSnap = { node: nodes.viewport, value: nodes.viewport.style.scrollSnapType };
      nodes.viewport.style.scrollSnapType = 'none';
    }
  }
  function endGesture() {
    const previous = active;
    active = null;
    if (savedSnap) { savedSnap.node.style.scrollSnapType = savedSnap.value; savedSnap = null; }
    if (!previous) return;
    const vertical = previous.orientation === 'vertical';
    (vertical ? timeoutY : timeoutX).clear();
    (vertical ? setScrollingY : setScrollingX)(false);
    releasePointerCapture(previous.thumb, previous.id);
  }
  function canStart(event: PointerEvent) {
    return !disposed && event.button === 0 && !(active && active.thumb?.hasPointerCapture?.(active.id));
  }
  function handlePointerDown(event: PointerEvent, orientation: Orientation) {
    if (!canStart(event)) return;
    const viewport = nodes.viewport;
    const thumb = orientation === 'vertical' ? nodes.thumbY : nodes.thumbX;
    // Consumer handlers run first and may synchronously remove this part. Do
    // not disable snap without a living thumb that can complete the gesture.
    if (!thumb) return;
    active = { id: event.pointerId, orientation, x: event.clientX, y: event.clientY,
      top: viewport?.scrollTop ?? 0, left: viewport?.scrollLeft ?? 0, thumb };
    disableViewportSnap();
    acquirePointerCapture(thumb, event.pointerId);
  }
  function handlePointerUp(event: PointerEvent) {
    if (event.pointerId === active?.id) endGesture();
  }
  function handlePointerMove(event: PointerEvent) {
    const drag = active;
    if (!drag || event.pointerId !== drag.id) return;
    if (event.buttons % 2 === 0) { endGesture(); return; }
    const viewport = nodes.viewport;
    const vertical = drag.orientation === 'vertical';
    const thumb = vertical ? nodes.thumbY : nodes.thumbX;
    const track = vertical ? nodes.scrollbarY : nodes.scrollbarX;
    if (!viewport || !thumb || !track) return;
    const axis = vertical ? 'y' : 'x';
    const travel = (vertical ? track.offsetHeight - thumb.offsetHeight : track.offsetWidth - thumb.offsetWidth)
      - getOffset(track, 'padding', axis) - getOffset(thumb, 'margin', axis);
    const delta = vertical ? event.clientY - drag.y : event.clientX - drag.x;
    const ratio = travel <= 0 ? 0 : delta / travel;
    if (vertical) viewport.scrollTop = drag.top + ratio * (viewport.scrollHeight - viewport.clientHeight);
    else viewport.scrollLeft = drag.left + ratio * (viewport.scrollWidth - viewport.clientWidth);
    event.preventDefault();
    startScrolling(vertical);
  }
  const state: ScrollAreaRootState = {
    get scrolling() { return scrollingX() || scrollingY(); },
    get hasOverflowX() { return !hidden().x; }, get hasOverflowY() { return !hidden().y; },
    get overflowXStart() { return edges().xStart; }, get overflowXEnd() { return edges().xEnd; },
    get overflowYStart() { return edges().yStart; }, get overflowYEnd() { return edges().yEnd; },
    get cornerHidden() { return hidden().corner; },
  };
  const context: ScrollAreaRootContextValue = {
    nodes, revision,
    register(part, node) {
      if (nodes[part] === node) return;
      if (nodes[part] && (part === 'viewport' || part === 'thumbX' || part === 'thumbY' || part === 'scrollbarX' || part === 'scrollbarY')) endGesture();
      nodes[part] = node;
      setRevision((value) => value + 1);
    },
    get rootId() { return id(); }, viewportState: state,
    get cornerSize() { return cornerSize(); }, get thumbSize() { return thumbSize(); },
    get hiddenState() { return hidden(); }, get overflowEdges() { return edges(); },
    get overflowEdgeThreshold() { return normalizeOverflowEdgeThreshold(componentProps.overflowEdgeThreshold); },
    get hasMeasuredScrollbar() { return measured(); }, get hovering() { return hovering(); },
    get scrollingX() { return scrollingX(); }, get scrollingY() { return scrollingY(); },
    get touchModality() { return touchModality; },
    setCornerSize, setThumbSize, setHiddenState, setOverflowEdges, setHasMeasuredScrollbar, setHovering,
    handleScroll, canStart, disableViewportSnap, handlePointerDown, handlePointerMove, handlePointerUp, endGesture,
  };
  onCleanup(() => { disposed = true; endGesture(); });
  const ref = registerPart(context, () => 'root');
  function pointer(event: PointerEvent) {
    touchModality = event.pointerType === 'touch';
    if (!touchModality) {
      const path = event.composedPath();
      setHovering(path.some((target) => target === nodes.root ||
        ('nodeType' in target && target.nodeType === 1 && contains(nodes.root, target as Element))) ||
        contains(nodes.root, getTarget(event) as Element | null));
    }
  }
  // The renderer must be allocated beneath the provider: its lazy host memos
  // capture their setup owner, including the context needed by child parts.
  function RootHost() { return createRenderElement('div', componentProps, {
    state, get ref() { return [ref, componentProps.ref]; }, stateAttributesMapping: scrollAreaStateAttributesMapping,
    props: [{ role: 'presentation', onPointerEnter: pointer, onPointerMove: pointer,
      onPointerDown(event: PointerEvent) { touchModality = event.pointerType === 'touch'; },
      onPointerLeave() { setHovering(false); },
      get style() { return { position: 'relative', '--scroll-area-corner-height': `${cornerSize().height}px`, '--scroll-area-corner-width': `${cornerSize().width}px` }; },
    }, elementProps],
  }); }
  return <ScrollAreaRootContext value={context}>{!csp?.disableStyleElements && styleDisableScrollbar.getElement(csp?.nonce)}<RootHost /></ScrollAreaRootContext>;
}
export namespace ScrollAreaRoot { export type Props = ScrollAreaRootProps; export type State = ScrollAreaRootState; }
