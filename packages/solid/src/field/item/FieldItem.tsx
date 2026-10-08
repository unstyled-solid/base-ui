import { omit } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { useFieldRootContext } from '../../internals/field-root-context';
import { LabelableProvider } from '../../internals/labelable-provider';
import { createRenderElement } from '../../internals/createRenderElement';
import { fieldValidityMapping } from '../../internals/field-constants/constants';
import type { BaseUIComponentProps } from '../../internals/types';
import type { FieldRootState } from '../root/FieldRoot';
import { fieldState } from '../utils/state';
import { FieldItemContext } from './FieldItemContext';

export function FieldItem(props: FieldItemProps) {
  const elementProps = omit(props, 'render', 'class', 'style', 'ref', 'disabled');
  const root = useFieldRootContext(false);
  const state = fieldState(() => root.state, () => Boolean(root.disabled || props.disabled));
  function ItemElement() {
    return createRenderElement('div', props, { state, get ref() { return props.ref; }, props: elementProps, stateAttributesMapping: fieldValidityMapping });
  }
  return <LabelableProvider><FieldItemContext value={state}><ItemElement /></FieldItemContext></LabelableProvider>;
}
export interface FieldItemState extends FieldRootState {}
export interface FieldItemProps extends BaseUIComponentProps<'div', FieldItemState, JSX.HTMLAttributes<HTMLDivElement>> { disabled?: boolean }
export namespace FieldItem { export type Props = FieldItemProps; export type State = FieldItemState; }
