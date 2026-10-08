import { omit } from 'solid-js';
import type { BaseUIComponentProps } from '../../internals/contracts/render';
import { createRenderElement } from '../../internals/createRenderElement';
import { createPopupViewport, popupViewportStateMapping } from '../../utils/createPopupViewport';
import { usePreviewCardRootContext } from '../root/PreviewCardContext';
import { usePreviewCardPositionerContext } from '../positioner/PreviewCardPositionerContext';

/** Owned current/previous content lifetimes are supplied by the popup foundation. */
export function PreviewCardViewport(props: PreviewCardViewport.Props) {
  const store = usePreviewCardRootContext();
  const positioner = usePreviewCardPositionerContext();
  const viewport = createPopupViewport({
    store,
    get side() { return positioner.side; },
    children: () => props.children,
  });
  const state: PreviewCardViewportState = {
    get activationDirection() { return viewport.state.activationDirection; },
    get transitioning() { return viewport.state.transitioning; },
    get instant() { return store.instantType; },
  };
  const elementProps = omit(props, 'render', 'class', 'style', 'ref', 'children');
  return createRenderElement('div', props, {
    state,
    get ref() { return props.ref; },
    props: [elementProps, { get children() { return viewport.children; } }],
    stateAttributesMapping: popupViewportStateMapping,
  });
}
export interface PreviewCardViewportState {
  activationDirection: string | undefined;
  transitioning: boolean;
  instant: 'dismiss' | 'focus' | undefined;
}
export interface PreviewCardViewportProps extends BaseUIComponentProps<'div', PreviewCardViewportState> {}
export namespace PreviewCardViewport {
  export type State = PreviewCardViewportState;
  export type Props = PreviewCardViewportProps;
}
