import { omit, Show } from 'solid-js';
import { FloatingPortal } from '../../floating-ui-react/components/FloatingPortal';
import type { BaseUIComponentProps } from '../../internals/types';
import type { PortalContainer } from '../../internals/contracts/portal';
import { useNavigationMenuRootContext } from '../root/NavigationMenuRootContext';
import { NavigationMenuPortalContext } from './NavigationMenuPortalContext';
export function NavigationMenuPortal(props: NavigationMenuPortal.Props) {
  const root = useNavigationMenuRootContext();
  const rest = omit(props, 'keepMounted');
  return <Show when={root.mounted || props.keepMounted}>
    <NavigationMenuPortalContext value={() => props.keepMounted ?? false}>
      <FloatingPortal {...rest} id={typeof props.id === 'string' ? props.id : undefined} preserveTabOrder={false} />
    </NavigationMenuPortalContext>
  </Show>;
}
export interface NavigationMenuPortalState {}
export interface NavigationMenuPortalProps extends BaseUIComponentProps<'div', NavigationMenuPortalState> { keepMounted?: boolean; container?: PortalContainer }
export namespace NavigationMenuPortal { export type State = NavigationMenuPortalState; export type Props = NavigationMenuPortalProps }
