import { createNumberFieldStepperButton, type StepperButtonProps } from '../root/createNumberFieldStepperButton';
import type { NumberFieldRootState } from '../root/NumberFieldRoot';
export function NumberFieldDecrement(props: NumberFieldDecrement.Props) { return createNumberFieldStepperButton(props, false); }
export interface NumberFieldDecrementProps extends StepperButtonProps {}
export interface NumberFieldDecrementState extends NumberFieldRootState {}
export namespace NumberFieldDecrement { export type Props = NumberFieldDecrementProps; export type State = NumberFieldDecrementState; }
