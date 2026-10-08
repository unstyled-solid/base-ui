import { onSettled, untrack } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { createField, FieldItemContext, type FieldOptions } from '../../internals/field-core';
import { FieldRootContext, type FieldRootContextValue } from '../../internals/field-root-context';
import { FormContext, type FormContextValue } from '../../internals/form-context';
import { LabelableProvider, useLabelableContext } from '../../internals/labelable-provider';
import { createLabel } from '../../internals/labelable-provider/createLabel';
import { createBaseUiId } from '../../internals/createBaseUiId';

export function CoreItem(props: { disabled?: boolean; children?: JSX.Element }) {
  const context = { get disabled() { return props.disabled ?? false; } };
  return <FieldItemContext value={context}><LabelableProvider>{props.children}</LabelableProvider></FieldItemContext>;
}
export function CoreLabel(props: { children?: JSX.Element }) {
  const label = createLabel({ native: true });
  return <label {...label}>{props.children}</label>;
}
export function CoreDescription(props: { children?: JSX.Element }) {
  const labelable = useLabelableContext()!;
  const id = untrack(createBaseUiId());
  onSettled(() => {
    labelable.setMessageIds((ids) => [...ids, id]);
    return () => { labelable.setMessageIds((ids) => ids.filter((value) => value !== id)); };
  });
  return <p id={id}>{props.children}</p>;
}

/** Native harness shell around the real shared engine; no public Field/Form dependency. */
export function CoreField(props: FieldOptions & { children?: JSX.Element; expose?: (field: FieldRootContextValue) => void }) {
  function Engine() {
    const field = createField(props);
    untrack(() => props.expose?.(field));
    return <FieldRootContext value={field}>{props.children}</FieldRootContext>;
  }
  return <LabelableProvider><Engine /></LabelableProvider>;
}

export function CoreForm(props: {
  id?: string;
  children?: JSX.Element;
  expose?: (form: FormContextValue) => void;
  onSubmit?: (values: Record<string, unknown>) => void;
}) {
  let element: HTMLFormElement | null = null;
  let submitCount = 0;
  const context: FormContextValue = {
    errors: {}, fields: new Map(), elementRef: () => element,
    validationMode: 'onSubmit', get submitCount() { return submitCount; }, clearErrors() {},
  };
  untrack(() => props.expose?.(context));
  return <FormContext value={context}>
    <form id={props.id} ref={(node) => { element = node; }} novalidate onSubmit={(event) => {
      event.preventDefault();
      submitCount += 1;
      for (const field of context.fields.values()) field.validate();
      const invalid = [...context.fields.values()].filter((field) => field.validityData.state.valid === false);
      if (invalid.length) {
        invalid.map((field) => field.controlRef()).find((node) => node !== null)?.focus();
      } else {
        props.onSubmit?.(Object.fromEntries([...context.fields.values()].filter((field) => field.name).map((field) => [field.name!, field.getValue()])));
      }
    }}>{props.children}</form>
  </FormContext>;
}

export function getCoreField(form: FormContextValue, name: string) {
  const field = [...form.fields.values()].find((entry) => entry.name === name);
  if (!field) throw new Error(`Core fixture: missing registered field ${name}`);
  return field;
}
