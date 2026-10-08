import { createEffect, createSignal, onCleanup, untrack } from 'solid-js';
import { createBaseUiId } from '../../internals/createBaseUiId';
import { createRegisterFieldControl } from '../../internals/field-register-control/createRegisterFieldControl';
import { useFieldRootContext } from '../../internals/field-root-context';
import { useLabelableContext } from '../../internals/labelable-provider';

/** Foundation-registration fixture, not a substitute for cross-family qualification.
 * It only calls declared contracts; field-core owns baseline, validation and races.
 */
export function RegisteredControl(props: { value: unknown; name?: string; group?: boolean; disabled?: boolean; onCommit?: () => void }) {
  const field = useFieldRootContext(false);
  const label = useLabelableContext();
  const id = createBaseUiId();
  const [element, setElement] = createSignal<HTMLButtonElement | null>(null);
  const source = Symbol('registered fixture');
  createRegisterFieldControl(element, id, () => props.value, undefined, () => !field.disabled && !props.disabled, () => props.name);
  createEffect(() => ({ group: props.group, id: id() }), (next) => {
    label?.registerControlId(source, next.group ? null : next.id);
  });
  onCleanup(() => label?.registerControlId(source, undefined));
  let previous = untrack(() => props.value);
  createEffect(() => props.value, (value) => {
    field.setFilled(value != null && value !== '' && (!Array.isArray(value) || value.length > 0));
    if (value !== previous) {
      previous = value;
      field.setDirty(value !== untrack(() => field.validityData.initialValue));
      field.validation.change(value);
    }
  });
  return <button type="button" id={id()} ref={setElement} disabled={field.disabled || props.disabled}
    aria-labelledby={label?.labelId} onClick={() => { props.onCommit?.(); void field.validation.commit(props.value); }}>Registered control</button>;
}
