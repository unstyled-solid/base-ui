// Adapted from Base UI (MIT), SHA 19511bb171f3b360b006c94cf6d07e53cb446505.
import { omit } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { AriaCombobox } from '../../combobox/root/AriaCombobox';
import type { BaseUIChangeEventDetails } from '../../internals/createBaseUIEventDetails';
import type { Group } from '../../internals/resolveValueLabel';
import { createAutocompleteInput } from './createAutocompleteInput';

/** Groups the autocomplete parts without rendering an element. */
export function AutocompleteRoot<Items extends readonly { items: readonly any[] }[]>(
  props: Omit<AutocompleteRootProps<Items[number]['items'][number]>, 'items'> & { items: Items },
): JSX.Element;
export function AutocompleteRoot<ItemValue>(
  props: Omit<AutocompleteRootProps<ItemValue>, 'items'> & { items?: readonly ItemValue[] },
): JSX.Element;
export function AutocompleteRoot<ItemValue>(props: AutocompleteRootProps<ItemValue>): JSX.Element {
  const other = omit(props,
    'value', 'defaultValue', 'onValueChange', 'mode', 'itemToStringValue',
    'openOnInputClick', 'filter', 'onItemHighlighted',
  );
  const input = createAutocompleteInput(props);
  return (
    <AriaCombobox
      {...other}
      selectionMode="none"
      fillInputOnItemPress
      itemToStringLabel={props.itemToStringValue}
      openOnInputClick={props.openOnInputClick ?? false}
      filter={input.filter()}
      filterQuery={input.filterQuery()}
      autoComplete={input.mode()}
      inputValue={input.inputValue()}
      defaultInputValue={props.defaultValue}
      onInputValueChange={input.onInputValueChange}
      onItemHighlighted={input.onItemHighlighted}
      inlineCompletionScope={input.completionScope()}
      onInlineCompletion={input.onInlineCompletion}
    />
  );
}

export type AutocompleteRootState = AriaCombobox.State;
export type AutocompleteRootHighlightItemTarget = AriaCombobox.HighlightItemTarget;
export type AutocompleteRootActions = AriaCombobox.Actions;
export type AutocompleteRootChangeEventReason = AriaCombobox.ChangeEventReason;
export type AutocompleteRootChangeEventDetails = BaseUIChangeEventDetails<AutocompleteRootChangeEventReason>;
export type AutocompleteRootOpenChangeEventDetails = AutocompleteRootChangeEventDetails & {
  preventUnmountOnClose: () => void;
};
export type AutocompleteRootHighlightEventReason = AriaCombobox.HighlightEventReason;
export type AutocompleteRootHighlightEventDetails = AriaCombobox.HighlightEventDetails;

export interface AutocompleteRootProps<ItemValue> extends Omit<AriaCombobox.Props<ItemValue, 'none'>,
  | 'selectionMode' | 'selectedValue' | 'defaultSelectedValue' | 'onSelectedValueChange'
  | 'fillInputOnItemPress' | 'itemToStringValue' | 'isItemEqualToValue'
  | 'inputValue' | 'defaultInputValue' | 'onInputValueChange' | 'autoComplete'
  | 'formAutoComplete' | 'itemToStringLabel' | 'items' | 'filteredItems' | 'filterQuery'
   | 'onOpenChange' | 'inlineCompletionScope' | 'onInlineCompletion'
> {
  /** Flat items or groups of items; normalized Combobox collections are not accepted. */
  items?: readonly ItemValue[] | readonly Group<ItemValue>[];
  /** Externally filtered items, retaining the structure of `items`. */
  filteredItems?: readonly ItemValue[] | readonly Group<ItemValue>[];
  /** list filters; both filters and completes; inline only completes; none does neither. */
  mode?: 'list' | 'both' | 'inline' | 'none';
  /** The initial, uncontrolled input text. */
  defaultValue?: AriaCombobox.Props<ItemValue, 'none'>['defaultInputValue'];
  /** Controlled input text, not a selected item. */
  value?: AriaCombobox.Props<ItemValue, 'none'>['inputValue'];
  onValueChange?: (value: string, details: AutocompleteRootChangeEventDetails) => void;
  onOpenChange?: (open: boolean, details: AutocompleteRootOpenChangeEventDetails) => void;
  /** Converts an item to text for both display and submission. */
  itemToStringValue?: (item: ItemValue) => string;
}

export namespace AutocompleteRoot {
  export type Props<ItemValue> = AutocompleteRootProps<ItemValue>;
  export type State = AutocompleteRootState;
  export type Actions = AutocompleteRootActions;
  export type HighlightItemTarget = AutocompleteRootHighlightItemTarget;
  export type ChangeEventReason = AutocompleteRootChangeEventReason;
  export type ChangeEventDetails = AutocompleteRootChangeEventDetails;
  export type OpenChangeEventDetails = AutocompleteRootOpenChangeEventDetails;
  export type HighlightEventReason = AutocompleteRootHighlightEventReason;
  export type HighlightEventDetails = AutocompleteRootHighlightEventDetails;
}
