import { createEffect, omit } from 'solid-js';
import type { JSX } from '@solidjs/web';
import type { BaseUIComponentProps } from '../internals/types';
import type { PortalContainer } from '../internals/contracts/portal';
import { createFloatingPortalNode } from '../floating-ui-react/hooks/createFloatingPortalNode';
import { OwnedPortalContent } from './OwnedPortalContent';
import { createLogicalLayerAccessor } from '../floating-ui-react/components/LogicalLayerContext';
export interface FloatingPortalLiteProps<S extends object = {}> extends BaseUIComponentProps<'div', S, Omit<JSX.HTMLAttributes<HTMLElement>, 'ref'> & { ref?: (element: HTMLElement | null) => void }> { container?: PortalContainer }
export function FloatingPortalLite<S extends object = {}>(props: FloatingPortalLiteProps<S>): JSX.Element {
  const layer = createLogicalLayerAccessor();
  const result = createFloatingPortalNode({ get container() { return props.container; },
    get ref() { return props.ref; }, componentProps: props,
    elementProps: omit(props, 'container', 'children', 'render', 'class', 'style', 'ref'),
  });
  createEffect(() => ({ node: result.node, layer: layer() }), (next) => {
    if (!next.node || !next.layer) return;
    const node = next.node, logical = next.layer;
    const events = ['pointerdown', 'pointerup', 'mousedown', 'mouseup', 'click', 'keydown', 'focusin', 'focusout'];
    const mark = (event: Event) => logical.markEvent(event);
    const unregister = logical.registerBranch(node);
    for (const type of events) node.addEventListener(type, mark, true);
    return () => { for (const type of events) node.removeEventListener(type, mark, true); unregister(); };
  });
  return <>{result.subtree}<OwnedPortalContent mount={result.node} wait={props.container === null}>{props.children}</OwnedPortalContent></>;
}
export interface FloatingPortalLiteState {}
export namespace FloatingPortalLite { export type Props<S extends object> = FloatingPortalLiteProps<S>; export type State = FloatingPortalLiteState }
