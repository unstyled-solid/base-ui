import { createSignal, omit } from 'solid-js';
import type { JSX } from '@solidjs/web';
import type { BaseUIComponentProps } from '../../internals/types';
import { createBaseUiId } from '../../internals/createBaseUiId';
import { createCompositeListItem } from '../../internals/composite';
import { createRenderElement } from '../../internals/createRenderElement';
import { createCollapsibleRoot } from '../../collapsible/root/createCollapsibleRoot';
import { CollapsibleRootContext } from '../../collapsible/root/CollapsibleRootContext';
import type { AccordionRootState, AccordionRootChangeEventDetails, AccordionRootChangeEventReason } from '../root/AccordionRoot';
import { useAccordionRootContext } from '../root/AccordionRootContext';
import { AccordionItemContext } from './AccordionItemContext';
import { accordionStateAttributesMapping } from './stateAttributesMapping';

/** Groups the heading, trigger, and panel of one disclosure. */
export function AccordionItem(props: AccordionItemProps) {
  const root = useAccordionRootContext();
  const listItem = createCompositeListItem();
  const fallbackValue = createBaseUiId();
  const value = () => props.value ?? fallbackValue();
  const open = () => root.value.includes(value());
  const disabled = () => Boolean(props.disabled || root.disabled);
  function onOpenChange(nextOpen: boolean, details: AccordionItemChangeEventDetails) {
    props.onOpenChange?.(nextOpen, details);
    if (!details.isCanceled) root.handleValueChange(value(), nextOpen, details);
  }
  const collapsible = createCollapsibleRoot({
    get open() { return open(); },
    get disabled() { return disabled(); },
    onOpenChange,
  });
  const state: AccordionItemState = {
    get value() { return root.state.value; },
    get orientation() { return root.state.orientation; },
    get hidden() { return !open() && !collapsible.mounted; },
    get index() { return listItem.index ?? -1; },
    get disabled() { return disabled(); },
    get open() { return open(); },
  };
  const defaultTriggerId = createBaseUiId();
  const [registeredTriggerId, setTriggerId] = createSignal<string | null | undefined>();
  // Registration ownership is synchronous: an old cleanup cannot remove a replacement.
  let triggerOwner: object | undefined;
  let panelOwner: object | undefined;
  const context: AccordionItemContext = {
    state,
    get open() { return open(); },
    get defaultTriggerId() { return defaultTriggerId(); },
    get triggerId() {
      const id = registeredTriggerId();
      return id === null ? undefined : id ?? defaultTriggerId();
    },
    registerTrigger(id) {
      const owner = {};
      triggerOwner = owner;
      setTriggerId(id);
      return () => {
        if (triggerOwner === owner) {
          triggerOwner = undefined;
          setTriggerId(null);
        }
      };
    },
    registerPanel(id) {
      const owner = {};
      panelOwner = owner;
      collapsible.setPanelIdState(id);
      return () => {
        if (panelOwner === owner) {
          panelOwner = undefined;
          collapsible.setPanelIdState(null);
        }
      };
    },
  };
  const collapsibleContext: CollapsibleRootContext = {
    get defaultPanelId() { return collapsible.defaultPanelId; },
    get disabled() { return collapsible.disabled; },
    get mounted() { return collapsible.mounted; },
    get open() { return collapsible.open; },
    get panelId() { return collapsible.panelId; },
    get transitionStatus() { return collapsible.transitionStatus; },
    handleTrigger: collapsible.handleTrigger,
    setMounted: collapsible.setMounted,
    setOpen: collapsible.setOpen,
    setPanelIdState: collapsible.setPanelIdState,
    onOpenChange,
    state: {
      get open() { return collapsible.open; },
      get disabled() { return collapsible.disabled; },
      get transitionStatus() { return collapsible.transitionStatus; },
    },
  };
  function Host() {
    return createRenderElement('div', props, {
      state,
      get ref() { return [props.ref, listItem.ref]; },
      props: omit(props, 'class', 'style', 'ref', 'render', 'disabled', 'onOpenChange', 'value'),
      stateAttributesMapping: accordionStateAttributesMapping,
    });
  }
  return (
    <CollapsibleRootContext value={collapsibleContext}>
      <AccordionItemContext value={context}><Host /></AccordionItemContext>
    </CollapsibleRootContext>
  );
}
export interface AccordionItemState extends AccordionRootState {
  hidden: boolean;
  index: number;
  open: boolean;
}
export interface AccordionItemProps extends BaseUIComponentProps<'div', AccordionItemState, JSX.IntrinsicElements['div']> {
  disabled?: boolean;
  value?: any;
  onOpenChange?: (open: boolean, details: AccordionItemChangeEventDetails) => void;
}
export type AccordionItemChangeEventReason = AccordionRootChangeEventReason;
export type AccordionItemChangeEventDetails = AccordionRootChangeEventDetails;
export namespace AccordionItem {
  export type State = AccordionItemState;
  export type Props = AccordionItemProps;
  export type ChangeEventReason = AccordionItemChangeEventReason;
  export type ChangeEventDetails = AccordionItemChangeEventDetails;
}
