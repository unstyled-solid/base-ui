import { omit, untrack } from 'solid-js';
import type { BaseUIComponentProps } from '../../internals/types';
import { createRenderElement } from '../../internals/createRenderElement';
import { createCompositeListItem } from '../../internals/composite';
import { createChangeEventDetails } from '../../internals/createBaseUIEventDetails';
import { useDirection } from '../../internals/direction-context/DirectionContext';
import { useComboboxRootContext } from '../root/ComboboxRootContext';
import { useComboboxChipsContext } from '../chips/ComboboxChipsContext';
import { ComboboxChipContext } from './ComboboxChipContext';
import { getChipNavigationKeys, getIndexAfterChipRemoval } from '../utils/parts';
export interface ComboboxChipState { disabled: boolean }
export interface ComboboxChipProps extends BaseUIComponentProps<'div', ComboboxChipState> {}
export function ComboboxChip(props: ComboboxChipProps) {
  const model = useComboboxRootContext(); const chips = useComboboxChipsContext(); const direction = useDirection();
  if (!chips) throw new Error('Base UI: Combobox.Chip needs Combobox.Chips. Place chips inside the Chips container.');
  const item = createCompositeListItem();
  const context = { get index() { return item.index; } };
  return <ComboboxChipContext value={context}>{createRenderElement('div', props, { get ref() { return [props.ref, item.ref]; },
    state: { get disabled() { return model.state.disabled; } }, props: [{ tabIndex: -1,
      get 'aria-disabled'() { return model.state.disabled || undefined; }, get 'aria-readonly'() { return model.state.readOnly || undefined; },
      onKeyDown(event: KeyboardEvent) {
        if (model.state.disabled || model.state.readOnly || item.index == null) return;
        const index = item.index; const keys = getChipNavigationKeys(direction());
        let next: number | undefined = index;
        let removing = false;
        if (event.key === keys[0]) { event.preventDefault(); next = index > 0 ? index - 1 : undefined; }
        else if (event.key === keys[1]) { event.preventDefault(); next = index < chips.chipsRef.current.length - 1 ? index + 1 : undefined; }
        else if (event.key === 'Backspace' || event.key === 'Delete') {
          const values = model.state.selectedValue;
          if (!Array.isArray(values)) return;
          removing = true;
          event.preventDefault(); event.stopPropagation();
          const details = createChangeEventDetails('none', event);
           model.context.setIndices({ activeIndex: null, selectedIndex: null, type: 'keyboard', event });
           model.context.setSelectedValue(values.filter((_, i) => i !== index), details);
          next = getIndexAfterChipRemoval(index, values.length);
        } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          event.preventDefault(); event.stopPropagation(); next = undefined;
          model.context.setOpen(true, createChangeEventDetails('list-navigation', event));
        } else if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); event.stopPropagation(); next = undefined; }
        else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) next = undefined;
        chips.setHighlightedChipIndex(next);
        const focusNext = () => { if (next == null) model.state.inputElement?.focus(); else chips.chipsRef.current[next]?.focus(); };
        // Removal changes the DOM coordinates in the next native commit. Focus
        // the surviving chip after that commit, never the node being removed.
        if (removing) queueMicrotask(() => untrack(focusNext)); else focusNext();
      },
    }, omit(props, 'class', 'style', 'render', 'ref')] })}</ComboboxChipContext>;
}
export namespace ComboboxChip { export type Props = ComboboxChipProps; export type State = ComboboxChipState }
