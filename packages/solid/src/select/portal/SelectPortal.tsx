import type { BaseUIComponentProps } from '../../internals/types';
import type { JSX } from '@solidjs/web';
import type { PortalContainer } from '../../internals/contracts/portal';
import { FloatingPortal } from '../../floating-ui-react/components/FloatingPortal';
import { useSelectRootContext } from '../root/SelectRootContext';
export function SelectPortal(props: SelectPortalProps) {
  const model = useSelectRootContext();
  return <>{model.mounted || model.forceMount ? <FloatingPortal {...props} /> : null}</>;
}
export interface SelectPortalState {}
export interface SelectPortalProps extends BaseUIComponentProps<'div', SelectPortalState, JSX.HTMLAttributes<HTMLElement>> { container?: PortalContainer }
export namespace SelectPortal { export type Props = SelectPortalProps; export type State = SelectPortalState }
