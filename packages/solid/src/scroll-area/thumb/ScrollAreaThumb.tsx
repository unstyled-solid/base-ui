import { omit } from 'solid-js';
import type { ComponentProps } from '@solidjs/web';
import type { BaseUIComponentProps } from '../../internals/types';
import { createRenderElement } from '../../internals/createRenderElement';
import { useScrollAreaRootContext } from '../root/ScrollAreaRootContext';
import { useScrollAreaScrollbarContext } from '../scrollbar/ScrollAreaScrollbarContext';
import { registerPart } from '../utils/registerPart';

export function ScrollAreaThumb(componentProps: ScrollAreaThumbProps) {
  const context = useScrollAreaRootContext();
  const orientation = useScrollAreaScrollbarContext();
  const vertical = () => orientation() === 'vertical';
  const ref = registerPart(context, () => vertical() ? 'thumbY' : 'thumbX');
  const props = omit(componentProps, 'class', 'style', 'render', 'ref');
  const state: ScrollAreaThumbState = {
    get orientation() { return orientation(); },
    get scrolling() { return vertical() ? context.scrollingY : context.scrollingX; },
  };
  return createRenderElement('div', componentProps, {
    get ref() { return [ref, componentProps.ref]; }, state,
    props: [{
      onPointerDown(event: PointerEvent) { context.handlePointerDown(event, orientation()); },
      onPointerMove: context.handlePointerMove, onPointerUp: context.handlePointerUp, onPointerCancel: context.handlePointerUp,
      get style() { return { visibility: context.hasMeasuredScrollbar ? undefined : 'hidden',
        ...(vertical() ? { height: 'var(--scroll-area-thumb-height)' } : { width: 'var(--scroll-area-thumb-width)' }) }; },
    }, props],
  });
}
export interface ScrollAreaThumbState { scrolling: boolean; orientation: 'horizontal' | 'vertical' }
export interface ScrollAreaThumbProps extends BaseUIComponentProps<'div', ScrollAreaThumbState, ComponentProps<'div'>> {}
export namespace ScrollAreaThumb { export type Props = ScrollAreaThumbProps; export type State = ScrollAreaThumbState; }
