import { createEffect, omit } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { createBaseUiId } from '../../internals/createBaseUiId';
import { createRenderElement } from '../../internals/createRenderElement';
import { useFieldRootContext } from '../../internals/field-root-context';
import { useLabelableContext } from '../../internals/labelable-provider';
import { fieldValidityMapping } from '../../internals/field-constants/constants';
import type { BaseUIComponentProps } from '../../internals/types';
import type { FieldRootState } from '../root/FieldRoot';
import { useFieldItemContext } from '../item/FieldItemContext';
import { fieldState } from '../utils/state';

export function FieldDescription(props: FieldDescriptionProps) {
  const elementProps = omit(props, 'render', 'class', 'style', 'ref', 'id');
  const root = useFieldRootContext(false);
  const item = useFieldItemContext();
  const labelable = useLabelableContext();
  const id = createBaseUiId(() => typeof props.id === 'string' ? props.id : undefined);
  const state = fieldState(() => root.state, () => Boolean(root.disabled || item?.disabled));
  createEffect(id, (value) => {
    if (!value || !labelable) return;
    labelable.setMessageIds((ids) => ids.concat(value));
    return () => labelable.setMessageIds((ids) => ids.filter((entry) => entry !== value));
  });
  return createRenderElement('p', props, { state, get ref() { return props.ref; }, props: [{ get id() { return id(); } }, elementProps], stateAttributesMapping: fieldValidityMapping });
}
export interface FieldDescriptionState extends FieldRootState {}
export interface FieldDescriptionProps extends BaseUIComponentProps<'p', FieldDescriptionState, JSX.HTMLAttributes<HTMLParagraphElement>> {}
export namespace FieldDescription { export type Props = FieldDescriptionProps; export type State = FieldDescriptionState; }
