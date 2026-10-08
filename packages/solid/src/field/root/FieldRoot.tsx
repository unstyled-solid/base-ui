import { children, createEffect, merge, omit } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { createField } from '../../internals/field-core';
import { FieldRootContext, type FieldRootState } from '../../internals/field-root-context';
import { LabelableProvider } from '../../internals/labelable-provider';
import { useFieldsetRootContext } from '../../fieldset/root/FieldsetRootContext';
import { useFormContext } from '../../internals/form-context/FormContext';
import { fieldValidityMapping } from '../../internals/field-constants/constants';
import { createRenderElement } from '../../internals/createRenderElement';
import type { BaseUIComponentProps } from '../../internals/types';
import type { FieldValidator, FormValidationMode } from '../../internals/contracts/field';

function FieldRootInner(props: FieldRootProps) {
  const elementProps = omit(props, 'render', 'class', 'style', 'ref', 'name', 'disabled', 'invalid', 'dirty', 'touched', 'validate', 'validationMode', 'validationDebounceTime', 'actionsRef');
  const fieldset = useFieldsetRootContext(true);
  const form = useFormContext();
  const field = createField({
    get name() { return props.name; },
    get disabled() { return Boolean(fieldset?.disabled || props.disabled); },
    get invalid() { return props.invalid; },
    get dirty() { return props.dirty; },
    get touched() { return props.touched; },
    get validate() { return props.validate; },
    get validationMode() { return props.validationMode ?? form?.validationMode ?? 'onSubmit'; },
    get validationDebounceTime() { return props.validationDebounceTime ?? 0; },
  });
  const actions: FieldRootActions = { validate: () => field.validate() };
  createEffect(() => props.actionsRef, (ref) => {
    ref?.(actions);
    return () => ref?.(null);
  });
  function RootElement() {
    // Own child resolution beneath both providers, independently of the host's
    // prop/state projections, so field parts retain their context and lifetime.
    const content = children(() => props.children);
    return createRenderElement('div', props, {
      state: field.state, get ref() { return props.ref; },
      props: merge(omit(elementProps, 'children'), { get children() { return content(); } }),
      stateAttributesMapping: fieldValidityMapping,
    });
  }
  return <FieldRootContext value={field}><RootElement /></FieldRootContext>;
}

/** Groups a field's controls, labels, descriptions and validation messages. */
export function FieldRoot(props: FieldRootProps) {
  return <LabelableProvider><FieldRootInner {...props} /></LabelableProvider>;
}
export type { FieldRootState } from '../../internals/field-root-context';
export type { FieldValidityData } from '../../internals/contracts/field';
export interface FieldRootActions { validate(): void }
export interface FieldRootProps extends BaseUIComponentProps<'div', FieldRootState, JSX.HTMLAttributes<HTMLDivElement>> {
  name?: string;
  disabled?: boolean;
  invalid?: boolean;
  dirty?: boolean;
  touched?: boolean;
  validate?: FieldValidator;
  validationMode?: FormValidationMode;
  validationDebounceTime?: number;
  actionsRef?: (actions: FieldRootActions | null) => void;
}
export namespace FieldRoot {
  export type Props = FieldRootProps;
  export type State = FieldRootState;
  export type Actions = FieldRootActions;
}
