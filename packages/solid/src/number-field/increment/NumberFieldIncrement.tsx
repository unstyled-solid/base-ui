import { createNumberFieldStepperButton, type StepperButtonProps } from '../root/createNumberFieldStepperButton';
import type { NumberFieldRootState } from '../root/NumberFieldRoot';
export function NumberFieldIncrement(props: NumberFieldIncrement.Props) { return createNumberFieldStepperButton(props, true); }
export interface NumberFieldIncrementProps extends StepperButtonProps {}
export interface NumberFieldIncrementState extends NumberFieldRootState {}
export namespace NumberFieldIncrement { export type Props = NumberFieldIncrementProps; export type State = NumberFieldIncrementState; }
