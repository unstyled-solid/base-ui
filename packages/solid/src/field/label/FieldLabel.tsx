import { createEffect, createMemo, createSignal, omit } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { useFieldRootContext } from '../../internals/field-root-context';
import { createLabel } from '../../internals/labelable-provider/createLabel';
import { useLabelableContext } from '../../internals/labelable-provider';
import { createBaseUiId } from '../../internals/createBaseUiId';
import { createRenderElement } from '../../internals/createRenderElement';
import { fieldValidityMapping } from '../../internals/field-constants/constants';
import type { BaseUIComponentProps } from '../../internals/types';
import type { FieldRootState } from '../root/FieldRoot';
import { useFieldItemContext } from '../item/FieldItemContext';
import { fieldState } from '../utils/state';

export function FieldLabel<E extends HTMLElement = HTMLLabelElement>(props: FieldLabelProps<E>) {
  const elementProps = omit(props, 'render', 'class', 'style', 'ref', 'id', 'nativeLabel');
  const root = useFieldRootContext(false);
  const item = useFieldItemContext();
  const labelable = useLabelableContext();
  const state = fieldState(() => root.state, () => Boolean(root.disabled || item?.disabled));
  // Registration publishes this same ID back into context. Memoize the resolved
  // ID so publishing an unchanged ID does not dispose/re-register the label.
  const candidateId = createBaseUiId(() => typeof props.id === 'string' ? props.id : undefined);
  const labelId = createMemo(() => labelable?.labelId ?? candidateId());
  const labelProps = createLabel({ get id() { return labelId(); }, get native() { return props.nativeLabel ?? true; } });
  const [element, setElement] = createSignal<HTMLElement | null>(null);
  createEffect(() => ({ element: element(), native: props.nativeLabel ?? true }), ({ element: node, native }) => {
    if (process.env.NODE_ENV === 'production' || !node) return;
    if (native && node.tagName !== 'LABEL') {
      console.error('Base UI: <Field.Label> expected a <label> element because the `nativeLabel` prop is true. Rendering a non-<label> disables native label association, so `htmlFor` will not work. Use a real <label> in the `render` prop, or set `nativeLabel` to `false`.');
    } else if (!native && node.tagName === 'LABEL') {
      console.error('Base UI: <Field.Label> expected a non-<label> element because the `nativeLabel` prop is false. Rendering a <label> assumes native label behavior while Base UI treats it as non-native, which can cause unexpected pointer behavior. Use a non-<label> in the `render` prop, or set `nativeLabel` to `true`.');
    }
  });
  return createRenderElement<FieldLabelState, E>('label', props, { state, get ref() { return [props.ref, setElement]; }, props: [labelProps, elementProps], stateAttributesMapping: fieldValidityMapping });
}
export interface FieldLabelState extends FieldRootState {}
export interface FieldLabelProps<E extends HTMLElement = HTMLLabelElement> extends Omit<BaseUIComponentProps<'label', FieldLabelState, JSX.LabelHTMLAttributes<E>>, 'ref'> {
  ref?: JSX.Ref<E>;
  nativeLabel?: boolean;
}
export namespace FieldLabel { export type Props = FieldLabelProps; export type State = FieldLabelState; }
