import type { BaseUIComponentProps } from '../../internals/types';
import { createToastLabelPart, type ToastLabelState } from '../utils/createToastLabelPart';
export function ToastDescription(props: ToastDescriptionProps) { return createToastLabelPart(props, 'description'); }
export interface ToastDescriptionState extends ToastLabelState {}
export interface ToastDescriptionProps extends BaseUIComponentProps<'p', ToastDescriptionState> {}
export namespace ToastDescription { export type Props = ToastDescriptionProps; export type State = ToastDescriptionState }
