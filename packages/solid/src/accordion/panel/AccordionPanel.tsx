import { createEffect, omit } from 'solid-js';
import type { JSX } from '@solidjs/web';
import type { BaseUIComponentProps, TransitionStatus } from '../../internals/types';
import { createRenderElement } from '../../internals/createRenderElement';
import { resolveStyle } from '../../utils/resolveStyle';
import { warn } from '../../utils/warn';
import { useCollapsibleRootContext } from '../../collapsible/root/CollapsibleRootContext';
import { createCollapsiblePanel } from '../../collapsible/panel/createCollapsiblePanel';
import { useAccordionRootContext } from '../root/AccordionRootContext';
import { useAccordionItemContext } from '../item/AccordionItemContext';
import type { AccordionItemState } from '../item/AccordionItem';
import { accordionStateAttributesMapping } from '../item/stateAttributesMapping';
import { accordionPanelHeight, accordionPanelWidth } from './AccordionPanelCssVars';

/** The disclosure's measured, animated region. Lifecycle is owned by Collapsible. */
export function AccordionPanel(props: AccordionPanelProps) {
  const root = useAccordionRootContext();
  const item = useAccordionItemContext();
  const collapsible = useCollapsibleRootContext();
  const elementProps = omit(props, 'class', 'hiddenUntilFound', 'keepMounted', 'id', 'render', 'style', 'ref');
  const hiddenUntilFound = () => props.hiddenUntilFound ?? root.hiddenUntilFound;
  createEffect(
    () => Boolean(props.keepMounted === false && hiddenUntilFound()),
    (conflict) => {
      if (process.env.NODE_ENV !== 'production' && conflict) {
        warn('The `keepMounted={false}` prop on an `Accordion.Panel` is ignored when `hiddenUntilFound` is enabled on the panel or root, since the panel must remain mounted while closed.');
      }
    },
  );
  createEffect(() => props.id || undefined, (id) => item.registerPanel(id));
  const panel = createCollapsiblePanel({
    get externalRef() { return props.ref; },
    get hiddenUntilFound() { return hiddenUntilFound(); },
    get id() { return typeof props.id === 'string' ? props.id : collapsible.defaultPanelId; },
    get keepMounted() { return props.keepMounted ?? root.keepMounted; },
    get mounted() { return collapsible.mounted; },
    get open() { return collapsible.open; },
    get transitionStatus() { return collapsible.transitionStatus; },
    onOpenChange: collapsible.onOpenChange,
    setMounted: collapsible.setMounted,
    setOpen: collapsible.setOpen,
  });
  const state: AccordionPanelState = {
    get value() { return item.state.value; },
    get orientation() { return item.state.orientation; },
    get hidden() { return item.state.hidden; },
    get index() { return item.state.index; },
    get disabled() { return item.state.disabled; },
    get open() { return item.state.open; },
    get transitionStatus() { return panel.transitionStatus; },
  };
  return createRenderElement('div', {
    get class() { return props.class; },
    get render() { return props.render; },
  }, {
    state,
    get enabled() { return panel.shouldRender; },
    ref: panel.ref,
    props: [
      panel.props,
      {
        get 'aria-labelledby'() { return item.triggerId; },
        role: 'region',
        get style() { return {
          [accordionPanelHeight]: panel.height === undefined ? 'auto' : `${panel.height}px`,
          [accordionPanelWidth]: panel.width === undefined ? 'auto' : `${panel.width}px`,
        }; },
      },
      elementProps,
      { get style() { return resolveStyle(props.style, state); } },
      { get style() { return panel.shouldPreventOpenAnimation ? { 'animation-name': 'none' } : undefined; } },
    ],
    stateAttributesMapping: accordionStateAttributesMapping,
  });
}
export interface AccordionPanelState extends AccordionItemState { transitionStatus: TransitionStatus }
export interface AccordionPanelProps extends BaseUIComponentProps<'div', AccordionPanelState, JSX.IntrinsicElements['div']> {
  hiddenUntilFound?: boolean;
  keepMounted?: boolean;
}
export namespace AccordionPanel {
  export type State = AccordionPanelState;
  export type Props = AccordionPanelProps;
}
