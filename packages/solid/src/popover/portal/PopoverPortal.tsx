import { Show, omit } from 'solid-js';
import { FloatingPortal } from '../../floating-ui-react/components/FloatingPortal';
import type { BaseUIComponentProps } from '../../internals/contracts/render';
import type { PortalContainer } from '../../internals/contracts/portal';
import { usePopoverRootContext } from '../root/PopoverRootContext';
import { PopoverPortalContext } from './PopoverPortalContext';

export function PopoverPortal(props: PopoverPortalProps) {
  const store = usePopoverRootContext();
  const portalProps = omit(props, 'keepMounted');
  const context = { get keepMounted() { return props.keepMounted ?? false; } };
  return <Show when={store.state.mounted || props.keepMounted}>
    <PopoverPortalContext value={context}><FloatingPortal {...portalProps} /></PopoverPortalContext>
  </Show>;
}
export interface PopoverPortalState {}
export interface PopoverPortalProps extends BaseUIComponentProps<'div', PopoverPortalState> {
  id?: string;
  keepMounted?: boolean;
  container?: PortalContainer;
}
export namespace PopoverPortal {
  export type Props = PopoverPortalProps;
  export type State = PopoverPortalState;
}
