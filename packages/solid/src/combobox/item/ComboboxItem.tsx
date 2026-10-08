import { createEffect, createSignal, merge, omit } from 'solid-js';
import type { BaseUIComponentProps } from '../../internals/types';
import { createRenderElement } from '../../internals/createRenderElement';
import { createCompositeListItem } from '../../internals/composite';
import { createButton } from '../../internals/use-button';
import { findItemIndex } from '../../internals/itemEquality';
import { useComboboxRootContext } from '../root/ComboboxRootContext';
import { ComboboxItemContext } from './ComboboxItemContext';
import { useComboboxRowContext } from '../row/ComboboxRowContext';
export interface ComboboxItemState { disabled: boolean; selected: boolean; highlighted: boolean }
export interface ComboboxItemProps extends Omit<BaseUIComponentProps<'div', ComboboxItemState>, 'id'> { value?: any; index?: number; disabled?: boolean; nativeButton?: boolean }
export function ComboboxItem(props: ComboboxItemProps) {
  const model = useComboboxRootContext();
  const row = useComboboxRowContext();
  const listItem = createCompositeListItem({ guess: true, get index() { return props.index; }, get disabled() { return props.disabled; } });
  const index = () => props.index ?? (model.state.virtualized ? findItemIndex(model.values(), props.value ?? null, model.state.isItemEqualToValue) : listItem.index);
  const [element, setElement] = createSignal<HTMLElement | null>(null);
  const disabled = () => Boolean(model.state.disabled || props.disabled);
  const button = createButton({ get disabled() { return disabled(); }, get native() { return props.nativeButton ?? false; }, composite: true, focusableWhenDisabled: true });
  const state: ComboboxItemState = { get disabled() { return disabled(); }, get selected() { return model.isSelected(props.value ?? null); }, get highlighted() { return index() != null && model.state.activeIndex === index(); } };
  const token = Symbol('combobox-item');
  createEffect(() => ({ index: index(), value: props.value ?? null, disabled: disabled(), element: element(), hasItems: model.derived.hasItems }), (item) => {
    // Explicit items already own the value coordinates. Only individually
    // rendered lists publish values, matching the source registration guard.
    if (!item.hasItems) return model.registry.registerItem(token, item);
  });
  createEffect(() => ({ index: index(), element: element() }), ({ index, element }) => {
    if (index == null || index < 0) return;
    model.context.listRef.current[index] = element;
    return () => { if (model.context.listRef.current[index] === element) delete model.context.listRef.current[index]; };
  });
  function select(event: MouseEvent) {
    if (disabled() || model.state.readOnly) return;
    const original = model.context.selectionEventRef.current;
    model.context.selectionEventRef.current = null;
    model.context.handleSelection((original ?? event) as MouseEvent | KeyboardEvent, props.value ?? null);
    if (model.state.submitOnItemClick) model.context.requestSubmit();
  }
  return <ComboboxItemContext value={state}>{createRenderElement('div', props, { state,
    get ref() { return [props.ref, button.buttonRef, listItem.ref, setElement]; }, props: [merge(() => model.state.itemProps), {
      get id() { const i = index(); return i == null || i < 0 ? undefined : `${model.state.id}-${i}`; }, role: row ? 'gridcell' : 'option', tabIndex: undefined,
      get 'aria-selected'() { return model.state.selectionMode === 'none' ? undefined : state.selected; },
      onPointerDown(event: PointerEvent & { currentTarget: HTMLElement }) { if (event.isPrimary) model.context.pointerDownItemRef.current = event.currentTarget; event.preventDefault(); },
      onMouseDown(event: MouseEvent) { event.preventDefault(); },
      onClick: select,
      onMouseUp(event: MouseEvent & { currentTarget: HTMLElement }) {
        const started = model.context.pointerDownItemRef.current === event.currentTarget;
        model.context.pointerDownItemRef.current = null;
        if (!started && event.button === 0 && state.highlighted) select(event);
      },
    }, omit(props, 'value', 'index', 'disabled', 'nativeButton', 'class', 'style', 'render', 'ref'), button.getButtonProps],
  })}</ComboboxItemContext>;
}
export namespace ComboboxItem { export type Props = ComboboxItemProps; export type State = ComboboxItemState }
