import { omit } from 'solid-js';
import type { ComponentProps } from '@solidjs/web';
import type { BaseUIComponentProps } from '../../internals/types';
import { createRenderElement } from '../../internals/createRenderElement';
import { useScrollAreaRootContext } from '../root/ScrollAreaRootContext';
import { registerPart } from '../utils/registerPart';

export function ScrollAreaCorner(componentProps: ScrollAreaCornerProps) {
  const context = useScrollAreaRootContext();
  const ref = registerPart(context, () => 'corner', () => !context.hiddenState.corner);
  const props = omit(componentProps, 'class', 'style', 'render', 'ref');
  return createRenderElement('div', componentProps, {
    get enabled() { return !context.hiddenState.corner; }, get ref() { return [ref, componentProps.ref]; }, state: {},
    props: [{ 'aria-hidden': true,
      get style() { return { position: 'absolute', bottom: 0, 'inset-inline-end': 0,
        width: `${context.cornerSize.width}px`, height: `${context.cornerSize.height}px` }; },
    }, props],
  });
}
export interface ScrollAreaCornerState {}
export interface ScrollAreaCornerProps extends BaseUIComponentProps<'div', ScrollAreaCornerState, ComponentProps<'div'>> {}
export namespace ScrollAreaCorner { export type Props = ScrollAreaCornerProps; export type State = ScrollAreaCornerState; }
