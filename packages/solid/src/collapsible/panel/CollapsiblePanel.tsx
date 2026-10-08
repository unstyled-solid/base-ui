import { createEffect, omit } from 'solid-js';
import type { BaseUIComponentProps } from '../../internals/types';
import { createRenderElement } from '../../internals/createRenderElement';
import { resolveStyle } from '../../utils/resolveStyle';
import { warn } from '../../utils/warn';
import { useCollapsibleRootContext } from '../root/CollapsibleRootContext';
import type { CollapsibleRootState } from '../root/CollapsibleRoot';
import { collapsibleStateAttributesMapping } from '../root/stateAttributesMapping';
import { createCollapsiblePanel } from './createCollapsiblePanel';

export function CollapsiblePanel(props: CollapsiblePanelProps) {
  const context = useCollapsibleRootContext();
  const id = () => props.id || context.defaultPanelId;
  createEffect(id, (registeredId) => {
    if (context.registerPanelId) return context.registerPanelId(registeredId);
    context.setPanelIdState(registeredId);
    return () => { context.setPanelIdState((current) => current === registeredId ? null : current); };
  });
  if (process.env.NODE_ENV !== 'production') {
    createEffect(() => props.hiddenUntilFound && props.keepMounted === false, (conflict) => {
      if (conflict) warn('The `keepMounted={false}` prop on `Collapsible.Panel` is ignored when `hiddenUntilFound` is enabled, since the panel must remain mounted while closed.');
    });
  }
  const panel = createCollapsiblePanel({
    get externalRef() { return props.ref; },
    get hiddenUntilFound() { return props.hiddenUntilFound ?? false; },
    get keepMounted() { return props.keepMounted ?? false; },
    get id() { return id(); },
    get open() { return context.open; },
    get mounted() { return context.mounted; },
    get transitionStatus() { return context.transitionStatus; },
    onOpenChange: (next, details) => context.onOpenChange(next, details),
    setOpen: context.setOpen,
    setMounted: context.setMounted,
  });
  const state: CollapsiblePanelState = {
    get open() { return context.open; },
    get disabled() { return context.disabled; },
    get transitionStatus() { return panel.transitionStatus; },
  };
  const elementProps = omit(props, 'ref', 'class', 'style', 'render', 'id', 'hiddenUntilFound', 'keepMounted');
  return createRenderElement('div', omit(props, 'style'), {
    state,
    get enabled() { return panel.shouldRender; },
    ref: panel.ref,
    props: [
      panel.props,
      { get style() { return {
        '--collapsible-panel-height': panel.height === undefined ? 'auto' : `${panel.height}px`,
        '--collapsible-panel-width': panel.width === undefined ? 'auto' : `${panel.width}px`,
      }; } },
      elementProps,
      { get style() { return resolveStyle(props.style, state); } },
      { get style() { return panel.shouldPreventOpenAnimation ? { 'animation-name': 'none' } : undefined; } },
    ],
    stateAttributesMapping: collapsibleStateAttributesMapping,
  });
}
export interface CollapsiblePanelState extends CollapsibleRootState {}
export interface CollapsiblePanelProps extends BaseUIComponentProps<'div', CollapsiblePanelState> {
  hiddenUntilFound?: boolean;
  keepMounted?: boolean;
}
export namespace CollapsiblePanel {
  export type Props = CollapsiblePanelProps;
  export type State = CollapsiblePanelState;
}
