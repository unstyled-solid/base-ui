import { omit } from 'solid-js';
import type { BaseUIComponentProps } from '../../internals/types';
import type { BaseUIChangeEventDetails } from '../../internals/createBaseUIEventDetails';
import { createRenderElement } from '../../internals/createRenderElement';
import { createCollapsibleRoot, type UseCollapsibleRootReturnValue } from './createCollapsibleRoot';
import { CollapsibleRootContext } from './CollapsibleRootContext';
import { collapsibleStateAttributesMapping } from './stateAttributesMapping';

export function CollapsibleRoot(props: CollapsibleRootProps) {
  const disclosure = createCollapsibleRoot(props);
  const state: CollapsibleRootState = {
    get open() { return disclosure.open; },
    get disabled() { return disclosure.disabled; },
    get transitionStatus() { return disclosure.transitionStatus; },
  };
  const context: CollapsibleRootContext = Object.assign(disclosure, {
    state,
    onOpenChange(open: boolean, details: CollapsibleRootChangeEventDetails) { props.onOpenChange?.(open, details); },
  });
  const elementProps = omit(props, 'open', 'defaultOpen', 'disabled', 'onOpenChange', 'render', 'class', 'style', 'ref');
  return <CollapsibleRootContext value={context}>
    {createRenderElement('div', props, {
      state, get ref() { return props.ref; }, props: elementProps,
      stateAttributesMapping: collapsibleStateAttributesMapping,
    })}
  </CollapsibleRootContext>;
}
export interface CollapsibleRootState extends Pick<UseCollapsibleRootReturnValue, 'open' | 'disabled' | 'transitionStatus'> {}
export interface CollapsibleRootProps extends BaseUIComponentProps<'div', CollapsibleRootState> {
  open?: boolean;
  defaultOpen?: boolean;
  disabled?: boolean;
  onOpenChange?: (open: boolean, details: CollapsibleRootChangeEventDetails) => void;
}
export type CollapsibleRootChangeEventReason = 'trigger-press' | 'none';
export type CollapsibleRootChangeEventDetails = BaseUIChangeEventDetails<CollapsibleRootChangeEventReason>;
export namespace CollapsibleRoot {
  export type Props = CollapsibleRootProps;
  export type State = CollapsibleRootState;
  export type ChangeEventReason = CollapsibleRootChangeEventReason;
  export type ChangeEventDetails = CollapsibleRootChangeEventDetails;
}
