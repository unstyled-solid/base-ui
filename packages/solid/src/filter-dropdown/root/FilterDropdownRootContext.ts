import { createContext, useContext, type Accessor } from 'solid-js';
import type { MutableCell } from '../../internals/contracts/core';
import type { BaseUIChangeEventDetails } from '../../internals/createBaseUIEventDetails';
import type { FilterDropdownModel } from '../store';

export interface FilterDropdownItemRegistration { getText(): string | undefined }
export type FilterDropdownFilter = (text: string, query: string) => boolean;
export type FilterDropdownRootChangeEventReason = 'input-change' | 'input-clear' | 'clear-press' | 'popup-close';
export type FilterDropdownRootChangeEventDetails = BaseUIChangeEventDetails<FilterDropdownRootChangeEventReason>;
export interface FilterDropdownRootContext {
  readonly open: boolean;
  readonly disabled: boolean;
  readonly inputFocusVisible: boolean;
  setInputFocusVisible(value: boolean): void;
  readonly keyboardModality: boolean;
  setKeyboardModality(value: boolean): void;
  readonly autoHighlight: boolean | 'always';
  readonly triggerId: string | undefined;
  readonly defaultListId: string;
  readonly listId: string | undefined;
  setRenderedListId(value: string | undefined): void;
  readonly focusOwnerRef: MutableCell<HTMLElement | null>;
  setActiveIndex(index: number | null): void;
  onItemsChange(previous: readonly (HTMLElement | null)[]): void;
  onValueChange(value: string, details: FilterDropdownRootChangeEventDetails): void;
}
export interface FilterDropdownItemContext {
  parent: FilterDropdownItemContext | null;
  store: FilterDropdownModel;
  registerItem(id: symbol, registration: FilterDropdownItemRegistration): () => void;
  readonly listRef: MutableCell<Array<HTMLElement | null>>;
}
export const FilterDropdownRootContext = createContext<FilterDropdownRootContext | null>(null);
export const FilterDropdownItemContext = createContext<FilterDropdownItemContext | null>(null);
export const FilterDropdownValueContext = createContext<Accessor<string>>(() => '');
function required<T>(value: T | null, optional: boolean): T | null {
  if (value === null && !optional) throw new Error('Base UI: Filter parts are missing their filter context and cannot access the query or items. ' +
    'Wrap the component root in its filter provider.');
  return value;
}
export function useFilterDropdownRootContext(optional?: false): FilterDropdownRootContext;
export function useFilterDropdownRootContext(optional: boolean): FilterDropdownRootContext | null;
export function useFilterDropdownRootContext(optional = false) { return required(useContext(FilterDropdownRootContext), optional); }
export function useFilterDropdownItemContext(optional?: false): FilterDropdownItemContext;
export function useFilterDropdownItemContext(optional: boolean): FilterDropdownItemContext | null;
export function useFilterDropdownItemContext(optional = false) { return required(useContext(FilterDropdownItemContext), optional); }
export function useFilterContextForList(listRef: MutableCell<Array<HTMLElement | null>> | null) {
  let context = useContext(FilterDropdownItemContext);
  if (!listRef) return null;
  while (context && context.listRef !== listRef) context = context.parent;
  return context;
}
export function useFilterDropdownValueContext() { return useContext(FilterDropdownValueContext); }
export namespace FilterDropdownRoot {
  export type ChangeEventReason = FilterDropdownRootChangeEventReason;
  export type ChangeEventDetails = FilterDropdownRootChangeEventDetails;
}
