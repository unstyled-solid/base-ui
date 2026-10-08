import { children, For } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { useComboboxDerivedItemsContext } from '../root/ComboboxRootContext';
import { useGroupCollectionContext } from './GroupCollectionContext';
export interface ComboboxCollectionState {}
export interface ComboboxCollectionProps { children: (item: any, index: number) => JSX.Element }
export function ComboboxCollection(props: ComboboxCollectionProps) {
  const derived = useComboboxDerivedItemsContext();
  const group = useGroupCollectionContext();
  return <For each={group?.items ?? derived.filteredItems}>{(item, index) => {
    // Resolve each row under its For owner and the collection's providers.
    // Otherwise provider children recursively flattens every row's unresolved
    // render/children computations and subscribes to their hidden dependencies.
    // This boundary shares resolved JSX, not item data or a copied ref.
    const resolved = children(() => props.children(item, index()));
    return <>{resolved()}</>;
  }}</For>;
}
export namespace ComboboxCollection { export type Props = ComboboxCollectionProps; export type State = ComboboxCollectionState }
