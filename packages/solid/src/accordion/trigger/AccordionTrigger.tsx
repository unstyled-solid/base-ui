import { createEffect, omit } from 'solid-js';
import type { JSX } from '@solidjs/web';
import type { BaseUIComponentProps } from '../../internals/types';
import { createButton } from '../../internals/use-button';
import { createRenderElement } from '../../internals/createRenderElement';
import { useCollapsibleRootContext } from '../../collapsible/root/CollapsibleRootContext';
import type { AccordionItemState } from '../item/AccordionItem';
import { useAccordionItemContext } from '../item/AccordionItemContext';
import { accordionStateAttributesMapping } from '../item/stateAttributesMapping';

const stateAttributesMapping = {
  ...accordionStateAttributesMapping,
  open: (open: boolean) => open ? { 'data-panel-open': '' } : null,
};

/** A normally tabbable button that toggles its disclosure. */
export function AccordionTrigger(props: AccordionTriggerProps) {
  const collapsible = useCollapsibleRootContext();
  const item = useAccordionItemContext();
  const elementProps = omit(props, 'disabled', 'class', 'id', 'render', 'nativeButton', 'style', 'ref');
  const button = createButton({
    get disabled() { return Boolean(props.disabled || collapsible.disabled); },
    get native() { return props.nativeButton ?? true; },
  });
  createEffect(() => props.id || undefined, (id) => item.registerTrigger(id));
  return createRenderElement('button', props, {
    state: item.state,
    get ref() { return [props.ref, button.buttonRef]; },
    get props() {
      return [
        {
          'aria-controls': collapsible.open ? collapsible.panelId : undefined,
          'aria-expanded': collapsible.open,
          id: props.id || item.defaultTriggerId,
          onClick: collapsible.handleTrigger,
        },
        elementProps,
        button.getButtonProps,
      ];
    },
    stateAttributesMapping,
  });
}
export interface AccordionTriggerState extends AccordionItemState {}
export interface AccordionTriggerProps extends BaseUIComponentProps<'button', AccordionTriggerState, JSX.HTMLAttributes<HTMLElement>> {
  nativeButton?: boolean;
}
export namespace AccordionTrigger {
  export type State = AccordionTriggerState;
  export type Props = AccordionTriggerProps;
}
