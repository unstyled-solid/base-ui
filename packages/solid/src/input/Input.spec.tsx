import type { ComponentProps } from '@solidjs/web';
import { Input, type InputProps, type InputState, type InputChangeEventReason, type InputChangeEventDetails } from './index';
import type { FieldControlProps, FieldControlState, FieldControlChangeEventReason, FieldControlChangeEventDetails } from '../field/control/FieldControl';

type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
type Assert<T extends true> = T;
export type InputTypeAssertions = [
  Assert<Equal<Input.Props, InputProps>>,
  Assert<Equal<Input.State, InputState>>,
  Assert<Equal<InputState, FieldControlState>>,
  Assert<Equal<Input.ChangeEventReason, InputChangeEventReason>>,
  Assert<Equal<Input.ChangeEventDetails, InputChangeEventDetails>>,
  Assert<Equal<InputChangeEventReason, FieldControlChangeEventReason>>,
  Assert<Equal<InputChangeEventDetails, FieldControlChangeEventDetails>>,
  Assert<Equal<InputProps['value'], FieldControlProps['value']>>,
  Assert<Equal<InputProps['defaultValue'], FieldControlProps['defaultValue']>>,
  Assert<Equal<InputProps['ref'], ComponentProps<'input'>['ref']>>,
];

export function InputConsumer() {
  return <Input type="email" name="email" required defaultValue="hello" value={2}
    ref={(node) => { const input: HTMLInputElement = node; input.select(); }}
    onInput={(event) => { const input: HTMLInputElement = event.currentTarget; input.select(); event.preventBaseUIHandler(); }}
    onValueChange={(value, details) => {
      const text: string = value;
      const event: Event = details.event;
      const reason: InputChangeEventReason = details.reason;
      details.cancel();
      void [text, event, reason];
    }}
    class={(state) => ({ disabled: state.disabled })}
    render={(props, state) => <input {...props} aria-disabled={state.disabled ? 'true' : 'false'} />}
  />;
}

// Solid-native adaptation of FieldControl.spec.tsx: render callback owns the textarea ref.
export function CustomInputConsumer() {
  // Input's public handlers target an input; the chosen custom host owns its ref.
  return <Input render={(props) => <textarea {...props as ComponentProps<'textarea'>} ref={(node) => {
    const textarea: HTMLTextAreaElement = node;
    textarea.select();
  }} />} />;
}

export function InputArrayConsumer() {
  const value: readonly string[] = ['one', 'two'];
  return <Input value={value} defaultValue={value} ref={[(node) => node.select()]} />;
}

// @ts-expect-error React className is not the Solid-native public API.
const invalidClass: InputProps = { className: 'legacy' };
// @ts-expect-error Value callbacks receive a DOM string, not a number.
const invalidCallback: InputProps = { onValueChange: (value: number) => { void value; } };
// @ts-expect-error Ref objects are not native Solid refs.
const invalidRef: InputProps = { ref: { current: null } };
void [invalidClass, invalidCallback, invalidRef];
