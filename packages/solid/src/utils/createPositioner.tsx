import type { JSX } from '@solidjs/web';
import { createRenderElement, type UseRenderElementComponentProps } from '../internals/createRenderElement';
import type { TransitionStatus } from '../internals/types';
import { getDisabledMountTransitionStyles } from '../internals/getDisabledMountTransitionStyles';
import { popupStateMapping } from './popupStateMapping';
import type { InputRef } from './createMergedRefs';
export interface UsePositionerOptions<E extends HTMLElement = HTMLDivElement> {
  styles: JSX.CSSProperties; transitionStatus: TransitionStatus;
  props?: Record<string, any> | undefined;
  refs?: InputRef<E> | readonly InputRef<E>[] | undefined;
  hidden?: boolean | undefined; inert?: boolean | undefined;
}
export function createPositioner<S extends object, E extends HTMLElement = HTMLDivElement>(componentProps: UseRenderElementComponentProps<S>, state: S, options: UsePositionerOptions<E>): JSX.Element {
  const presentation = { role: 'presentation', get hidden() { return options.hidden; },
    get style() { return { ...options.styles, ...(options.inert ? { 'pointer-events': 'none' } : {}) }; } };
  const transitions = { get style() { return getDisabledMountTransitionStyles(options.transitionStatus)?.style; } };
  return createRenderElement<S, E>('div', componentProps, {
    state, get ref() { return options.refs; },
    get props() { return [presentation, transitions, options.props]; },
    stateAttributesMapping: popupStateMapping as import('../internals/types').StateAttributesMapping<S>,
  });
}
export { createPositioner as usePositioner };
