import { omit } from 'solid-js';
import { AriaCombobox, type AriaComboboxProps } from './AriaCombobox';
type Mode<M> = M extends true ? 'multiple' : 'single';
export type ComboboxRootProps<Value, Multiple extends boolean | undefined = false, Item = Value> = Omit<AriaComboboxProps<Value, Mode<Multiple>, Item>,
  'selectionMode' | 'selectedValue' | 'defaultSelectedValue' | 'onSelectedValueChange' | 'autoComplete' | 'formAutoComplete' | 'fillInputOnItemPress' | 'submitOnItemClick' | 'filterQuery' | 'inlineCompletionScope' | 'onInlineCompletion' | 'keepHighlight' | 'autoHighlight'> & {
  multiple?: Multiple; autoComplete?: string; autoHighlight?: boolean;
  value?: (Multiple extends true ? readonly Value[] : Value) | null;
  defaultValue?: (Multiple extends true ? readonly Value[] : Value) | null;
  onValueChange?: (value: Multiple extends true ? Value[] : Value | null, details: AriaCombobox.ChangeEventDetails) => void;
};
export function ComboboxRoot<Value, Multiple extends boolean | undefined = false, Item = Value>(props: ComboboxRootProps<Value, Multiple, Item>) {
  const other = omit(props, 'multiple', 'value', 'defaultValue', 'onValueChange', 'autoComplete');
  return <AriaCombobox {...other} selectionMode={props.multiple ? 'multiple' : 'single'}
    selectedValue={props.value} defaultSelectedValue={props.defaultValue}
    onSelectedValueChange={props.onValueChange as AriaComboboxProps<Value, 'single' | 'multiple', Item>['onSelectedValueChange']}
    formAutoComplete={props.autoComplete} />;
}
export type ComboboxRootState = AriaCombobox.State;
export type ComboboxRootActions = AriaCombobox.Actions;
export type ComboboxRootHighlightItemTarget = AriaCombobox.HighlightItemTarget;
export type ComboboxRootChangeEventReason = AriaCombobox.ChangeEventReason;
export type ComboboxRootChangeEventDetails = AriaCombobox.ChangeEventDetails;
export type ComboboxRootOpenChangeEventDetails = AriaCombobox.OpenChangeEventDetails;
export type ComboboxRootHighlightEventReason = AriaCombobox.HighlightEventReason;
export type ComboboxRootHighlightEventDetails = AriaCombobox.HighlightEventDetails;
export namespace ComboboxRoot {
  export type Props<Value, Multiple extends boolean | undefined = false, Item = Value> = ComboboxRootProps<Value, Multiple, Item>;
  export type State = ComboboxRootState;
  export type Actions = ComboboxRootActions;
  export type HighlightItemTarget = ComboboxRootHighlightItemTarget;
  export type ChangeEventReason = ComboboxRootChangeEventReason;
  export type ChangeEventDetails = ComboboxRootChangeEventDetails;
  export type OpenChangeEventDetails = ComboboxRootOpenChangeEventDetails;
  export type HighlightEventReason = ComboboxRootHighlightEventReason;
  export type HighlightEventDetails = ComboboxRootHighlightEventDetails;
}
