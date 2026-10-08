import { Field } from '../index';
import type { FieldControlChangeEventDetails, FieldValidityData } from '../index';

export function FieldConsumer() {
  let input: HTMLInputElement | undefined;
  let textarea: HTMLTextAreaElement | undefined;
  let actions: Field.Root.Actions | null = null;
  const change = (_value: string, details: FieldControlChangeEventDetails) => details.cancel();
  return <Field.Root actionsRef={(next) => { actions = next; }} validate={async () => undefined}>
    <Field.Control ref={(node) => { input = node; }} onValueChange={change} />
    <Field.Control<HTMLTextAreaElement> ref={(node) => { textarea = node; }} render={(props) => <textarea {...props} />} />
    <Field.Validity>{(state) => <output>{String(state.validity.valid)}</output>}</Field.Validity>
    <button onClick={() => { input?.focus(); textarea?.focus(); actions?.validate(); }}>Validate</button>
  </Field.Root>;
}

export function assertValidityType(value: FieldValidityData): boolean | null { return value.state.valid; }
