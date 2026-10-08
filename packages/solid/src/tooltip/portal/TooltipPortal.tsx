import { omit } from 'solid-js';
import type { JSX } from '@solidjs/web';
import type { BaseUIComponentProps } from '../../internals/contracts/render';
import type { PortalContainer } from '../../internals/contracts/portal';
import { FloatingPortalLite } from '../../utils/FloatingPortalLite';
import { useTooltipRootContext } from '../root/TooltipRootContext';
import { TooltipPortalContext } from './TooltipPortalContext';
import type { TooltipRenderProps } from '../utils/types';

export function TooltipPortal(props: TooltipPortalProps): JSX.Element {
  const store = useTooltipRootContext();
  const portalProps = omit(props, 'keepMounted');
  const keepMounted = () => props.keepMounted ?? false;
  return (
    <TooltipPortalContext value={keepMounted}>
      {(store.state.mounted || keepMounted()) && <FloatingPortalLite {...portalProps} />}
    </TooltipPortalContext>
  );
}
export interface TooltipPortalState {}
export interface TooltipPortalProps extends BaseUIComponentProps<'div', TooltipPortalState, TooltipRenderProps> {
  keepMounted?: boolean;
  container?: PortalContainer;
}
export namespace TooltipPortal {
  export type State = TooltipPortalState;
  export type Props = TooltipPortalProps;
}
