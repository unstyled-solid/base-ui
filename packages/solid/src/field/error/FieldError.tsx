import { createEffect, createMemo, createSignal, omit, untrack } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { useFieldRootContext } from '../../internals/field-root-context';
import { useFormContext } from '../../internals/form-context/FormContext';
import { useLabelableContext } from '../../internals/labelable-provider';
import { createBaseUiId } from '../../internals/createBaseUiId';
import { createRenderElement } from '../../internals/createRenderElement';
import { createTransitionStatus, type TransitionStatus } from '../../internals/createTransitionStatus';
import { createOpenChangeComplete } from '../../internals/createOpenChangeComplete';
import { fieldValidityMapping } from '../../internals/field-constants/constants';
import { transitionStatusMapping } from '../../internals/stateAttributesMapping';
import type { BaseUIComponentProps } from '../../internals/types';
import type { FieldRootState } from '../root/FieldRoot';

const mapping = { ...fieldValidityMapping, ...transitionStatusMapping };

export function FieldError(props: FieldErrorProps) {
  const elementProps = omit(props, 'render', 'class', 'style', 'ref', 'id', 'match');
  const root = useFieldRootContext(false);
  const form = useFormContext();
  const labelable = useLabelableContext();
  const id = createBaseUiId(() => typeof props.id === 'string' ? props.id : undefined);
  const formError = () => root.name && form && Object.hasOwn(form.errors, root.name) ? form.errors[root.name] : null;
  const hasFormError = () => { const error = formError(); return Boolean(Array.isArray(error) ? error.length : error); };
  const rendered = () => props.match === true || (!root.state.disabled && (
    typeof props.match === 'string' ? Boolean(root.validityData.state[props.match]) : hasFormError() || root.validityData.state.valid === false
  ));
  const transition = createTransitionStatus(rendered);
  const [element, setElement] = createSignal<HTMLDivElement | null>(null);
  createEffect(() => rendered() ? id() : undefined, (value) => {
    if (!value || !labelable) return;
    labelable.setMessageIds((ids) => ids.concat(value));
    return () => labelable.setMessageIds((ids) => ids.filter((entry) => entry !== value));
  });
  // Retain the last visible message through the exit animation without relaying derived state.
  let lastMessage: string | string[] | null | undefined;
  const message = createMemo(() => {
    if (rendered()) {
      lastMessage = typeof props.match !== 'string' && hasFormError() ? formError()
        : root.validityData.errors.length > 1 ? root.validityData.errors : root.validityData.error;
    }
    return lastMessage;
  });
  createOpenChangeComplete({
    open: rendered,
    ref: element,
    onComplete() { if (!untrack(rendered)) transition.setMounted(false); },
  });
  const state: FieldErrorState = {
    get disabled() { return root.state.disabled; },
    get valid() { return root.state.valid; },
    get touched() { return root.state.touched; },
    get dirty() { return root.state.dirty; },
    get filled() { return root.state.filled; },
    get focused() { return root.state.focused; },
    get transitionStatus() { return transition.transitionStatus; },
  };
  const content = () => {
    const value = message();
    return Array.isArray(value) ? value.length > 1 ? <ul>{value.map((text) => <li>{text}</li>)}</ul> : value[0] : value;
  };
  return createRenderElement('div', props, {
    state, get ref() { return [props.ref, setElement]; }, get enabled() { return transition.mounted; },
    props: [{ get id() { return id(); }, get children() { return content(); } }, elementProps],
    stateAttributesMapping: mapping,
  });
}
export interface FieldErrorState extends FieldRootState { transitionStatus: TransitionStatus }
export interface FieldErrorProps extends BaseUIComponentProps<'div', FieldErrorState, JSX.HTMLAttributes<HTMLDivElement>> { match?: boolean | keyof ValidityState }
export namespace FieldError { export type Props = FieldErrorProps; export type State = FieldErrorState; }
