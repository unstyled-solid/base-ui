import { createEffect, omit, untrack } from 'solid-js';
import type { ComponentProps } from '@solidjs/web';
import type { BaseUIComponentProps } from '../../internals/types';
import { createRenderElement } from '../../internals/createRenderElement';
import { mergeProps } from '../../merge-props';
import { useDirection } from '../../internals/direction-context/DirectionContext';
import { addEventListener } from '../../utils/addEventListener';
import { contains, getTarget } from '../../utils/shadowDom';
import { useScrollAreaRootContext } from '../root/ScrollAreaRootContext';
import type { ScrollAreaRootState } from '../root/ScrollAreaRoot';
import { scrollAreaStateAttributesMapping } from '../root/stateAttributes';
import { getOffset } from '../utils/getOffset';
import { registerPart } from '../utils/registerPart';
import { ScrollAreaScrollbarContext } from './ScrollAreaScrollbarContext';

export function ScrollAreaScrollbar(componentProps: ScrollAreaScrollbarProps) {
  const context = useScrollAreaRootContext();
  const direction = useDirection();
  const orientation = () => componentProps.orientation ?? 'vertical';
  const vertical = () => orientation() === 'vertical';
  const visible = () => componentProps.keepMounted || !(vertical() ? context.hiddenState.y : context.hiddenState.x);
  const props = omit(componentProps, 'class', 'style', 'render', 'ref', 'orientation', 'keepMounted', 'onWheel');
  const ref = registerPart(context, () => vertical() ? 'scrollbarY' : 'scrollbarX', () => Boolean(visible()));
  const state: ScrollAreaScrollbarState = {
    get scrolling() { return vertical() ? context.scrollingY : context.scrollingX; },
    get hovering() { return context.hovering; }, get orientation() { return orientation(); },
    get hasOverflowX() { return context.viewportState.hasOverflowX; }, get hasOverflowY() { return context.viewportState.hasOverflowY; },
    get overflowXStart() { return context.viewportState.overflowXStart; }, get overflowXEnd() { return context.viewportState.overflowXEnd; },
    get overflowYStart() { return context.viewportState.overflowYStart; }, get overflowYEnd() { return context.viewportState.overflowYEnd; },
    get cornerHidden() { return context.viewportState.cornerHidden; },
  };
  createEffect(() => {
    context.revision();
    return { node: vertical() ? context.nodes.scrollbarY : context.nodes.scrollbarX, vertical: vertical(), direction: direction(), visible: visible() };
  }, (snapshot) => {
    const { node, vertical: isVertical, direction: textDirection } = snapshot;
    if (!node || !snapshot.visible) return;
    // Native nonpassive listener. Read viewport at invocation, never retain a removed viewport.
    const wheelProps = mergeProps<'div'>({ onWheel(event) {
      const viewport = context.nodes.viewport;
      if (!viewport || event.ctrlKey || (isVertical ? context.nodes.scrollbarY : context.nodes.scrollbarX) !== node) return;
      const property = isVertical ? 'scrollTop' : 'scrollLeft';
      const delta = isVertical ? event.deltaY : event.deltaX;
      if (delta === 0) return;
      const max = Math.max(0, isVertical ? viewport.scrollHeight - viewport.clientHeight : viewport.scrollWidth - viewport.clientWidth);
      const rtl = !isVertical && textDirection === 'rtl';
      const min = rtl ? -max : 0;
      const upper = rtl ? 0 : max;
      const value = viewport[property];
      if (max === 0 || (value <= min && delta < 0) || (value >= upper && delta > 0)) return;
      const next = Math.min(upper, Math.max(min, value + delta));
      if (next === value) return;
      event.preventDefault();
      viewport[property] = next;
      context.handleScroll({ x: viewport.scrollLeft, y: viewport.scrollTop });
    } }, { get onWheel() { return componentProps.onWheel; } });
    // mergeProps normalizes the internal + optional bound consumer handler into a function.
    return addEventListener(node, 'wheel', (event) => untrack(() => {
      (wheelProps.onWheel as (event: WheelEvent) => void)(event);
    }), { passive: false });
  });
  function pointerDown(event: PointerEvent) {
    if (!context.canStart(event)) return;
    const isVertical = vertical();
    const thumb = isVertical ? context.nodes.thumbY : context.nodes.thumbX;
    if (thumb && contains(thumb, getTarget(event) as Element | null)) return;
    const viewport = context.nodes.viewport;
    const track = isVertical ? context.nodes.scrollbarY : context.nodes.scrollbarX;
    if (!viewport || !thumb || !track) return;
    const axis = isVertical ? 'y' : 'x';
    const margin = getOffset(thumb, 'margin', axis);
    const padding = getOffset(track, 'padding', axis);
    const thumbSize = isVertical ? thumb.offsetHeight : thumb.offsetWidth;
    const rect = track.getBoundingClientRect();
    const click = (isVertical ? event.clientY - rect.top : event.clientX - rect.left) - thumbSize / 2 - padding + margin / 2;
    const travel = (isVertical ? track.offsetHeight : track.offsetWidth) - thumbSize - padding - margin;
    if (travel <= 0) return;
    const ratio = click / travel;
    const max = isVertical ? viewport.scrollHeight - viewport.clientHeight : viewport.scrollWidth - viewport.clientWidth;
    context.disableViewportSnap();
    if (isVertical) viewport.scrollTop = ratio * max;
    else viewport.scrollLeft = direction() === 'rtl' ? -(1 - ratio) * max : ratio * max;
    context.handleScroll({ x: viewport.scrollLeft, y: viewport.scrollTop });
    context.handlePointerDown(event, orientation());
  }
  function ScrollbarHost() { return createRenderElement('div', componentProps, {
    get enabled() { return Boolean(visible()); }, get ref() { return [ref, componentProps.ref]; }, state,
    stateAttributesMapping: scrollAreaStateAttributesMapping,
    props: [{
      get 'data-id'() { return `${context.rootId}-scrollbar`; }, 'aria-hidden': true,
      onPointerDown: pointerDown, onPointerUp: context.handlePointerUp, onPointerCancel: context.handlePointerUp,
      onMouseDown(event: MouseEvent) { event.preventDefault(); },
      get style() { return {
        position: 'absolute', 'touch-action': 'none', '-webkit-user-select': 'none', 'user-select': 'none',
        visibility: !context.hasMeasuredScrollbar && !componentProps.keepMounted ? 'hidden' : undefined,
        ...(vertical() ? { top: 0, bottom: 'var(--scroll-area-corner-height)', 'inset-inline-end': 0,
          '--scroll-area-thumb-height': `${context.thumbSize.height}px` }
          : { 'inset-inline-start': 0, 'inset-inline-end': 'var(--scroll-area-corner-width)', bottom: 0,
            '--scroll-area-thumb-width': `${context.thumbSize.width}px` }),
      }; },
    }, props],
  }); }
  return <ScrollAreaScrollbarContext value={orientation}><ScrollbarHost /></ScrollAreaScrollbarContext>;
}
export interface ScrollAreaScrollbarState extends ScrollAreaRootState { hovering: boolean; orientation: 'vertical' | 'horizontal' }
export interface ScrollAreaScrollbarProps extends BaseUIComponentProps<'div', ScrollAreaScrollbarState, ComponentProps<'div'>> {
  orientation?: 'vertical' | 'horizontal';
  keepMounted?: boolean;
}
export namespace ScrollAreaScrollbar { export type Props = ScrollAreaScrollbarProps; export type State = ScrollAreaScrollbarState; }
