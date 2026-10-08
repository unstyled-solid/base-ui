import { omit } from 'solid-js';
import type { Align, Side } from '../../internals/createAnchorPositioning';
import type { BaseUIComponentProps } from '../../internals/contracts/render';
import { createRenderElement } from '../../internals/createRenderElement';
import { popupStateMapping } from '../../utils/popupStateMapping';
import { usePreviewCardRootContext } from '../root/PreviewCardContext';
import { usePreviewCardPositionerContext } from '../positioner/PreviewCardPositionerContext';

export function PreviewCardArrow(props: PreviewCardArrow.Props) {
  const store = usePreviewCardRootContext();
  const positioner = usePreviewCardPositionerContext();
  const state: PreviewCardArrowState = {
    get open() { return store.state.open; },
    get side() { return positioner.side; },
    get align() { return positioner.align; },
    get uncentered() { return positioner.arrowUncentered; },
  };
  const elementProps = omit(props, 'render', 'class', 'style', 'ref');
  return createRenderElement('div', props, {
    state,
    get ref() { return [positioner.arrowRef, props.ref]; },
    props: [{ get style() { return positioner.arrowStyles; }, 'aria-hidden': true }, elementProps],
    stateAttributesMapping: popupStateMapping,
  });
}
export interface PreviewCardArrowState { open: boolean; side: Side; align: Align; uncentered: boolean }
export interface PreviewCardArrowProps extends BaseUIComponentProps<'div', PreviewCardArrowState> {}
export namespace PreviewCardArrow {
  export type State = PreviewCardArrowState;
  export type Props = PreviewCardArrowProps;
}
