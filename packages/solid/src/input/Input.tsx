import {
  FieldControl,
  type FieldControlProps,
  type FieldControlState,
  type FieldControlChangeEventReason,
  type FieldControlChangeEventDetails,
} from '../field/control/FieldControl';

/**
 * A native input element that automatically works with Field.
 * Renders an `<input>` element.
 */
export function Input(props: Input.Props) {
  // Pass the original live props (including ref) to the sole control implementation.
  return FieldControl(props);
}

export interface InputProps extends FieldControlProps<HTMLInputElement> {
  /** Callback fired when the `value` changes. Use when controlled. */
  onValueChange?: ((value: string, eventDetails: Input.ChangeEventDetails) => void) | undefined;
  /** The default value of the input. Use when uncontrolled. */
  defaultValue?: FieldControlProps['defaultValue'] | undefined;
  /** The value of the input. Use when controlled. */
  value?: FieldControlProps<HTMLInputElement>['value'] | undefined;
}

export interface InputState extends FieldControlState {}

export type InputChangeEventReason = FieldControlChangeEventReason;
export type InputChangeEventDetails = FieldControlChangeEventDetails;

export namespace Input {
  export type Props = InputProps;
  export type State = InputState;
  export type ChangeEventReason = InputChangeEventReason;
  export type ChangeEventDetails = InputChangeEventDetails;
}
