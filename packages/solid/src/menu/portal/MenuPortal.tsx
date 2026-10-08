import { Show } from 'solid-js';
import { FloatingPortal } from '../../floating-ui-react/components/FloatingPortal';
import type { BaseUIComponentProps } from '../../internals/types';
import type { PortalContainer } from '../../internals/contracts/portal';
import { useMenuRootContext } from '../root/MenuRootContext';
import { MenuPortalContext } from './MenuPortalContext';
export interface MenuPortalState {}
export interface MenuPortalProps extends BaseUIComponentProps<'div', MenuPortalState> { keepMounted?: boolean; container?: PortalContainer }
export function MenuPortal(props: MenuPortalProps) {
  const root = useMenuRootContext();
  return <MenuPortalContext value={() => props.keepMounted ?? false}><Show when={root.store.state.mounted || props.keepMounted}>
    <FloatingPortal {...props} portalOwnerRole={root.parent.type === 'menu' || root.parent.type === 'menubar' ? 'group' : undefined} />
  </Show></MenuPortalContext>;
}
export namespace MenuPortal { export type Props = MenuPortalProps; export type State = MenuPortalState }
