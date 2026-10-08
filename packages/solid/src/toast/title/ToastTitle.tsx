import type { BaseUIComponentProps } from '../../internals/types';
import { createToastLabelPart, type ToastLabelState } from '../utils/createToastLabelPart';
export function ToastTitle(props: ToastTitleProps) { return createToastLabelPart(props, 'title'); }
export interface ToastTitleState extends ToastLabelState {}
export interface ToastTitleProps extends BaseUIComponentProps<'h2', ToastTitleState> {}
export namespace ToastTitle { export type Props = ToastTitleProps; export type State = ToastTitleState }
