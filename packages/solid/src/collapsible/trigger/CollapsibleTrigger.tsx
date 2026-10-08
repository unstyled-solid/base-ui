import { omit } from 'solid-js';
import type { BaseUIComponentProps } from '../../internals/types';
import { createRenderElement } from '../../internals/createRenderElement';
import { createButton } from '../../internals/use-button';
import { useCollapsibleRootContext } from '../root/CollapsibleRootContext';
import type { CollapsibleRootState } from '../root/CollapsibleRoot';
import { triggerStateAttributesMapping } from '../root/stateAttributesMapping';

export function CollapsibleTrigger(props: CollapsibleTriggerProps) {
  const context = useCollapsibleRootContext();
  const button = createButton({
    get disabled() { return props.disabled ?? context.disabled; },
    get native() { return props.nativeButton ?? true; },
  });
  const elementProps = omit(props, 'disabled', 'nativeButton', 'render', 'class', 'style', 'ref');
  return createRenderElement('button', props, {
    state: context.state,
    get ref() { return [props.ref, button.buttonRef]; },
    props: [{
      get 'aria-controls'() { return context.open ? context.panelId : undefined; },
      get 'aria-expanded'() { return context.open; },
      onClick: context.handleTrigger,
    }, elementProps, button.getButtonProps],
    stateAttributesMapping: triggerStateAttributesMapping,
  });
}
export interface CollapsibleTriggerState extends CollapsibleRootState {}
export interface CollapsibleTriggerProps extends BaseUIComponentProps<'button', CollapsibleTriggerState> {
  disabled?: boolean;
  nativeButton?: boolean;
}
export namespace CollapsibleTrigger {
  export type Props = CollapsibleTriggerProps;
  export type State = CollapsibleTriggerState;
}
