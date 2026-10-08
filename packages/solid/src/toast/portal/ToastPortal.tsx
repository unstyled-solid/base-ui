import { FloatingPortalLite } from '../../utils/FloatingPortalLite';
import type { BaseUIComponentProps } from '../../internals/types';
import type { PortalContainer } from '../../internals/contracts/portal';
export function ToastPortal(props: ToastPortalProps) { return <FloatingPortalLite {...props} />; }
export interface ToastPortalState {}
export interface ToastPortalProps extends BaseUIComponentProps<'div', ToastPortalState> { container?: PortalContainer | undefined }
export namespace ToastPortal { export type Props = ToastPortalProps; export type State = ToastPortalState }
