import { createSignal, omit } from 'solid-js';
import type { BaseUIComponentProps } from '../../internals/types';
import { createRenderElement } from '../../internals/createRenderElement';
import { useComboboxRootContext } from '../root/ComboboxRootContext';
import { ComboboxGroupContext } from './ComboboxGroupContext';
import { GroupCollectionProvider } from '../collection/GroupCollectionContext';
export interface ComboboxGroupState {}
export interface ComboboxGroupProps extends BaseUIComponentProps<'div', ComboboxGroupState> { items?: readonly any[] }
export function ComboboxGroup(props: ComboboxGroupProps) {
  // Label registration is an owned DOM resource; removal during collection
  // reconciliation must be allowed to release its published association.
  const model = useComboboxRootContext(); const [labelId, setLabelId] = createSignal<string | undefined>(undefined, { ownedWrite: true });
  const context = { get labelId() { return labelId(); }, setLabelId, get items() { return props.items; } };
  return <ComboboxGroupContext value={context}><GroupCollectionProvider items={props.items}>
    {createRenderElement('div', props, { get ref() { return props.ref; }, props: [{ get role() { return model.state.grid ? 'rowgroup' : 'group'; }, get 'aria-labelledby'() { return labelId(); } }, omit(props, 'class', 'style', 'render', 'ref', 'items')] })}
  </GroupCollectionProvider></ComboboxGroupContext>;
}
export namespace ComboboxGroup { export type Props = ComboboxGroupProps; export type State = ComboboxGroupState }
