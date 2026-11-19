import { merge, omit } from 'solid-js';
import type { JSX } from '@solidjs/web';
import type { BaseUIComponentProps } from '../../internals/types';
import { createRenderElement } from '../../internals/createRenderElement';
import { CompositeList } from '../../internals/composite';
import { useComboboxRootContext } from '../root/ComboboxRootContext';
import { ComboboxCollection } from '../collection/ComboboxCollection';
import { clickHighlightedItem } from '../utils/parts';
import { useComboboxPositionerContext } from '../positioner/ComboboxPositionerContext';
export interface ComboboxListState { empty: boolean }
export interface ComboboxListProps extends Omit<BaseUIComponentProps<'div', ComboboxListState>, 'children'> {
  /** Native JSX, or an implicit item template with at least one declared parameter.
   * Use Combobox.Collection for zero-arity/default/rest-parameter templates. */
  children?: JSX.Element | ((item: any, index: number) => JSX.Element);
}
export function ComboboxList(props: ComboboxListProps) {
  const model = useComboboxRootContext();
  const positioning = useComboboxPositionerContext(true);
  const state = { get empty() { return model.derived.filteredItems.length === 0; } };
  // Solid 2.0.3 provider children can be unbranded zero-arity accessors.
  // Preserve this API's nonzero-arity implicit-template convention; arity is
  // not a complete runtime discriminator. Explicit Collection accepts any
  // template signature without mistaking native JSX for an item callback.
  function Content() { return <>{(() => {
    // A JSX-producing getter constructs owned descendants. Classify the value
    // from one read; repeated typeof/arity reads would construct duplicate trees.
    const content = props.children;
    return typeof content === 'function' && content.length > 0 ? <ComboboxCollection>{content}</ComboboxCollection> : content;
  })()}</>; }
  function Element() {
    // Resolve children inside the CompositeList owner once, independently of highlight props.
    const children = <Content />;
    const defaults = {
    get id() { return `${model.state.id}-list`; }, tabIndex: -1,
    get role() { return model.state.grid ? 'grid' : 'listbox'; },
    get 'aria-multiselectable'() { return model.state.selectionMode === 'multiple' || undefined; },
    get 'aria-readonly'() { return !model.state.grid && model.state.readOnly || undefined; },
    children,
    onKeyDown(event: KeyboardEvent) { if (event.key === 'Enter' && !model.state.readOnly && !model.state.disabled && model.state.activeIndex != null) { event.preventDefault(); event.stopPropagation(); clickHighlightedItem(model, model.state.activeIndex, event); } },
    };
    return createRenderElement('div', props, { state, get ref() { return [props.ref, model.setListElement, positioning ? undefined : model.popup.setPositionerElement]; },
      props: [merge(() => model.state.listProps), defaults, omit(props, 'class', 'style', 'render', 'ref', 'children')] });
  }
  return <CompositeList elementsRef={model.state.virtualized ? undefined : model.context.listRef}
    labelsRef={model.derived.hasItems && !model.state.forceMounted ? undefined : model.context.labelsRef}><Element /></CompositeList>;
}
export namespace ComboboxList { export type Props = ComboboxListProps; export type State = ComboboxListState }
