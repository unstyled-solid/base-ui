import type { ComponentProps } from '@solidjs/web';
import { OTPField, OTPFieldInputDataAttributes, OTPFieldRootDataAttributes, OTPFieldSeparatorDataAttributes } from './index';

// Source root/input *.spec.tsx: native event discrimination and required props.
function change(details: OTPField.Root.ChangeEventDetails) {
  if (details.reason === 'input-paste') { const event: ClipboardEvent = details.event; void event; }
  if (details.reason === 'keyboard') { const event: KeyboardEvent = details.event; void event; }
  if (details.reason === 'input-change') { const event: InputEvent | Event = details.event; void event; }
  if (details.reason === 'input-clear') {
    const event: InputEvent | FocusEvent | Event = details.event; void event;
    // @ts-expect-error input-clear is not a keyboard reason
    const keyboard: KeyboardEvent = details.event; void keyboard;
  }
}
function invalid(details: OTPField.Root.InvalidEventDetails) {
  if (details.reason === 'input-paste') { const event: ClipboardEvent = details.event; void event; }
  if (details.reason === 'input-change') { const event: InputEvent | Event = details.event; void event; }
}
function complete(details: OTPField.Root.CompleteEventDetails) {
  if (details.reason === 'input-paste') { const event: ClipboardEvent = details.event; void event; }
  if (details.reason === 'input-change') { const event: InputEvent | Event = details.event; void event; }
}
export function Consumer() {
  return <OTPField.Root length={6} form="verification" mask validationType="alphanumeric"
    normalizeValue={(value) => value.toUpperCase()} inputMode="tel"
    onValueChange={(value, details) => { const text: string = value; void text; change(details); }}
    onValueInvalid={(value, details) => { const text: string = value; void text; invalid(details); }}
    onValueComplete={(value, details) => { const text: string = value; void text; complete(details); }}
    class={(state) => ['otp', { complete: state.complete }]}>
    <OTPField.Input render={(props, state) => {
      const disabled: ComponentProps<'input'>['disabled'] = props.disabled;
      const readOnly: ComponentProps<'input'>['readonly'] = props.readonly;
      const index: number = state.index;
      void disabled; void readOnly; void index;
      return <input {...props} />;
    }} />
    <OTPField.Separator />
  </OTPField.Root>;
}
export function NegativeCases() {
  // @ts-expect-error length is required
  const required = <OTPField.Root />;
  // @ts-expect-error inferred slot order; explicit index is not a prop
  const index = <OTPField.Input index={0} />;
  // @ts-expect-error renamed to normalizeValue
  const sanitize = <OTPField.Root length={6} sanitizeValue={(value: string) => value} />;
  // @ts-expect-error Solid uses class, not className
  const className = <OTPField.Root length={6} className="otp" />;
  void required; void index; void sanitize; void className;
  return <OTPField.Root length={6} validationType="none" inputMode="numeric" />;
}
const rootComplete: 'data-complete' = OTPFieldRootDataAttributes.complete;
const inputComplete: 'data-complete' = OTPFieldInputDataAttributes.complete;
const orientation: 'data-orientation' = OTPFieldSeparatorDataAttributes.orientation;
void rootComplete; void inputComplete; void orientation;
