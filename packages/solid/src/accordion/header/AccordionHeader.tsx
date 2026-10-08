import { omit } from 'solid-js';
import type { JSX } from '@solidjs/web';
import type { BaseUIComponentProps } from '../../internals/types';
import { createRenderElement } from '../../internals/createRenderElement';
import type { AccordionItemState } from '../item/AccordionItem';
import { useAccordionItemContext } from '../item/AccordionItemContext';
import { accordionStateAttributesMapping } from '../item/stateAttributesMapping';

/** A heading for the corresponding disclosure. Renders an h3 by default. */
export function AccordionHeader(props: AccordionHeaderProps) {
  const item = useAccordionItemContext();
  return createRenderElement('h3', props, {
    state: item.state,
    get ref() { return props.ref; },
    props: omit(props, 'render', 'class', 'style', 'ref'),
    stateAttributesMapping: accordionStateAttributesMapping,
  });
}
export interface AccordionHeaderState extends AccordionItemState {}
export interface AccordionHeaderProps extends BaseUIComponentProps<'h3', AccordionHeaderState, JSX.IntrinsicElements['h3']> {}
export namespace AccordionHeader {
  export type State = AccordionHeaderState;
  export type Props = AccordionHeaderProps;
}
