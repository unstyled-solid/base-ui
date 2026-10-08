import { omit } from 'solid-js';
import type { ComponentProps } from '@solidjs/web';
import type { BaseUIComponentProps } from '../../internals/types';
import { CompositeItem } from '../../internals/composite';
import type { ToolbarRootItemMetadata, ToolbarRootOrientation } from '../root/ToolbarRoot';
import { useToolbarRootContext } from '../root/ToolbarRootContext';

const TOOLBAR_LINK_METADATA = { disabled: false, focusableWhenDisabled: true };

/** Links remain enabled even inside disabled toolbars and groups. */
export function ToolbarLink(componentProps: ToolbarLinkProps) {
  const root = useToolbarRootContext();
  const elementProps = omit(componentProps, 'class', 'render', 'style', 'ref');
  const state: ToolbarLinkState = {
    get orientation() { return root.orientation; },
  };
  return <CompositeItem<ToolbarRootItemMetadata, ToolbarLinkState>
    tag="a"
    render={componentProps.render}
    class={componentProps.class}
    style={componentProps.style}
    metadata={TOOLBAR_LINK_METADATA}
    state={state}
    refs={[componentProps.ref]}
    props={[elementProps]}
  />;
}
export interface ToolbarLinkState { orientation: ToolbarRootOrientation }
export interface ToolbarLinkProps extends BaseUIComponentProps<'a', ToolbarLinkState, ComponentProps<'a'>> {}
export namespace ToolbarLink {
  export type State = ToolbarLinkState;
  export type Props = ToolbarLinkProps;
}
