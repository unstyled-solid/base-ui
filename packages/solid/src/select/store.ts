// Adapted from Base UI Select, MIT, 19511bb171f3b360b006c94cf6d07e53cb446505.
import { createMemo, createSignal, untrack } from 'solid-js';
import type { HTMLProps } from '../internals/types';
import { createControlled } from '../utils/createControlled';
import { createPopup } from '../utils/popups/createPopup';
import { createItemRegistry } from '../internals/createItemRegistry';
import { compareItemEquality, defaultItemEquality, findSelectionIndex } from '../internals/itemEquality';
import { stringifyAsValue } from '../internals/resolveValueLabel';
import { matchAutofillItem } from './root/autofill';
import { getMaxScrollOffset, normalizeScrollOffset } from '../utils/scrollEdges';
import type { SelectRootProps, SelectRootChangeEventDetails, SelectRootOpenChangeEventDetails } from './root/SelectRoot';
import type { Side } from '../internals/createAnchorPositioning';
import type { InteractionType } from '../utils/createOpenInteractionType';

export interface SelectItemRecord {
  readonly value: any;
  readonly index: number | null;
  readonly disabled: boolean;
  readonly label: string | undefined;
  readonly element: HTMLElement | null;
  readonly text: HTMLElement | null;
}

export function createSelectModel(props: SelectRootProps<any, boolean | undefined>, id: () => string, fieldDisabled: () => boolean, onAcceptedOpenChange?: (next: boolean, details: SelectRootOpenChangeEventDetails) => void) {
  const emptyMultipleValue = Object.freeze([]);
  const value = createControlled<any, SelectRootChangeEventDetails>({
    value: () => props.value,
    get defaultValue() { return props.multiple ? props.defaultValue ?? emptyMultipleValue : props.defaultValue ?? null; },
    onChange: () => props.onValueChange,
    name: 'Select', state: 'value',
  });
  const initialValue = untrack(value.value);
  const [forceMount, setForceMount] = createSignal(false);
  const [openMethod, setOpenMethod] = createSignal<InteractionType | null>(null);
  const [labelId, setLabelId] = createSignal<string>();
  const [triggerElement, setTriggerElement] = createSignal<HTMLElement | null>(null);
  const [positionerElement, setPositionerElement] = createSignal<HTMLElement | null>(null);
  const [popupElement, setPopupElement] = createSignal<HTMLElement | null>(null);
  const [listElement, setListElement] = createSignal<HTMLElement | null>(null);
  const [valueElement, setValueElement] = createSignal<HTMLElement | null>(null);
  const [scrollUp, setScrollUp] = createSignal(false);
  const [scrollDown, setScrollDown] = createSignal(false);
  const [arrowCount, setArrowCount] = createSignal(0);
  const registry = createItemRegistry<symbol, SelectItemRecord>();
  const ordered = createMemo(() => [...registry.items.values()].sort((a, b) => (a.index ?? Infinity) - (b.index ?? Infinity)), { transparent: true });
  const popup = createPopup({
    open: () => props.open, defaultOpen: untrack(() => props.defaultOpen ?? false),
    triggerId: id,
    onOpenChange: () => (next, details) => props.onOpenChange?.(next, details as SelectRootOpenChangeEventDetails),
    onAcceptedChange: (next, details) => onAcceptedOpenChange?.(next, details as SelectRootOpenChangeEventDetails),
    onOpenChangeComplete: () => (next) => {
      if (!next) { setActiveIndex(null); setOpenMethod(null); setScrollUp(false); setScrollDown(false); }
      props.onOpenChangeComplete?.(next);
    },
  });
  // Subscribe to the selected presence field, not every change in the shared
  // transition snapshot (open/starting/ending may change while mounted does not).
  const mounted = createMemo(() => popup.state.mounted);
  // Selection is always value-driven, but the focus/alignment anchor stays at the
  // opening selection while browsing. Item registration/reorder and comparer
  // changes may reclaim the anchor; controlled value changes alone may not.
  let anchor: number | null = null;
  let previousItems: { record: SelectItemRecord; value: any; index: number | null }[] = [];
  let previousComparer = untrack(() => props.isItemEqualToValue ?? defaultItemEquality);
  let previousMultiple = untrack(() => props.multiple ?? false);
  const selectionAnchor = createMemo(() => {
    const items = ordered().map(record => ({ record, value: record.value, index: record.index }));
    const selectedValue = value.value();
    const comparer = props.isItemEqualToValue ?? defaultItemEquality;
    const multiple = props.multiple ?? false;
    const changed = previousItems.length !== items.length || items.some((item, i) => item.record !== previousItems[i]?.record || item.index !== previousItems[i]?.index || !Object.is(item.value, previousItems[i]?.value));
    if (!popup.state.open || changed || previousComparer !== comparer || previousMultiple !== multiple) {
      const position = findSelectionIndex(items.map(item => item.value), selectedValue, comparer, multiple);
      anchor = position === null ? null : items[position]?.index ?? null;
    }
    previousItems = items; previousComparer = comparer; previousMultiple = multiple;
    return anchor;
  });
  const open = createMemo(() => popup.state.open);
  // Opening/registry selection establishes the default highlight in the same
  // reactive frame. Keyboard and pointer transactions can override it until
  // that anchor changes; closing retains the highlight through the exit.
  const [activeIndex, setActiveIndex] = createSignal<number | null>((previous) =>
    open() ? selectionAnchor() : previous ?? null);
  const model = {
    props, id, value, initialValue, popup, registry, ordered,
    listRef: { current: [] as (HTMLElement | null)[] },
    labelsRef: { current: [] as (string | null)[] },
    typing: false,
    selection: { allowSelectedMouseUp: false, allowUnselectedMouseUp: false, dragY: 0 },
    alignment: () => false,
    popupSide: (() => null) as () => Side | null,
    scrollHandler: (scroller: HTMLElement) => model.updateScroll(scroller),
    triggerProps: () => ({} as HTMLProps), popupProps: () => ({} as HTMLProps), itemProps: () => ({} as HTMLProps),
    get multiple() { return props.multiple ?? false; },
    get disabled() { return fieldDisabled() || (props.disabled ?? false); },
    get readOnly() { return props.readOnly ?? false; },
    get modal() { return props.modal ?? true; },
    get open() { return popup.state.open; },
    get mounted() { return mounted(); },
    get transitionStatus() { return popup.state.transitionStatus; },
    get forceMount() { return forceMount(); }, setForceMount,
    get activeIndex() { return activeIndex(); }, setActiveIndex,
    get selectedIndex() { return selectionAnchor(); },
    get openMethod() { return openMethod(); }, setOpenMethod,
    get labelId() { return labelId(); }, setLabelId,
    get triggerElement() { return triggerElement(); }, setTriggerElement,
    get positionerElement() { return positionerElement(); },
    setPositionerElement(element: HTMLElement | null) { setPositionerElement(element); popup.setPositionerElement(element); },
    get popupElement() { return popupElement(); },
    setPopupElement(element: HTMLElement | null) { setPopupElement(element); popup.setPopupElement(element); },
    get listElement() { return listElement(); }, setListElement,
    get valueElement() { return valueElement(); },
    setValueElement(element: HTMLElement | null) { setValueElement(element); },
    get scrollUp() { return scrollUp(); }, get scrollDown() { return scrollDown(); },
    get arrowCount() { return arrowCount(); }, setArrowCount,
    get serializedValue() { return model.multiple ? '' : stringifyAsValue(value.value(), props.itemToStringValue); },
    get fieldValue() { const v = value.value(); return model.multiple && Array.isArray(v) ? v.map(item => stringifyAsValue(item, props.itemToStringValue)) : stringifyAsValue(v, props.itemToStringValue); },
    get hasSelectedValue() { const v = value.value(); return model.multiple ? Array.isArray(v) && v.length > 0 : v != null && model.serializedValue !== ''; },
    isSelected(item: any) {
      const v = value.value();
      const equal = props.isItemEqualToValue ?? defaultItemEquality;
      return model.multiple ? Array.isArray(v) && v.some(selected => compareItemEquality(item, selected, equal)) : compareItemEquality(item, v, equal);
    },
    setValue(next: any, details: SelectRootChangeEventDetails) { return value.request(next, details); },
    setOpen(next: boolean, details: SelectRootChangeEventDetails) {
      // Shared popup attaches the opt-out before invoking the public callback.
      popup.setOpen(next, details as SelectRootOpenChangeEventDetails);
    },
    updateScroll(scroller: HTMLElement) {
      const max = getMaxScrollOffset(scroller.scrollHeight, scroller.clientHeight);
      const offset = normalizeScrollOffset(scroller.scrollTop, max);
      setScrollUp(offset > 0); setScrollDown(offset < max);
    },
    clearScroll() { setScrollUp(false); setScrollDown(false); },
    getItem(index: number) { return [...registry.liveItems.values()].find(item => item.index === index); },
    matchAutofill(text: string) {
      const live = [...registry.liveItems.values()].sort((a, b) => (a.index ?? Infinity) - (b.index ?? Infinity));
      return matchAutofillItem(live.map(item => ({ value: item.value, renderedLabel: item.label ?? item.text?.textContent ?? item.element?.textContent })), text, props.itemToStringValue, props.itemToStringLabel);
    },
  };
  return model;
}
export type SelectModel = ReturnType<typeof createSelectModel>;
