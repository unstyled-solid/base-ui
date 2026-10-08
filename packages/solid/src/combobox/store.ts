import { createEffect, createMemo, createSignal, onCleanup, untrack } from 'solid-js';
import { createControlled } from '../utils/createControlled';
import { createPopup } from '../utils/popups/createPopup';
import { createFloatingRoot } from '../floating-ui-react/components/createFloatingRoot';
import { createDismiss } from '../floating-ui-react/hooks/createDismiss';
import { createClick } from '../floating-ui-react/hooks/createClick';
import { createItemRegistry } from '../internals/createItemRegistry';
import { createListNavigation } from '../floating-ui-react/hooks/createListNavigation';
import { gridNavigation } from '../floating-ui-react/hooks/gridNavigation';
import { useDirection } from '../internals/direction-context/DirectionContext';
import { createOpenMethodTriggerProps } from '../utils/createOpenInteractionType';
import type { InteractionType } from '../utils/createEnhancedClickHandler';
import { createIsHydrating } from '../utils/createIsHydrating';
import { mergeProps } from '../merge-props';
import { getOverflowAncestors, isElement, isHTMLElement } from '@floating-ui/utils/dom';
import { isScrollableY } from '../utils/scrollable';
import { createLabelableId } from '../internals/labelable-provider/createLabelableId';
import { createValueChanged } from '../internals/createValueChanged';
import { createGenericEventDetails } from '../internals/createBaseUIEventDetails';
import { useFieldRootContext } from '../internals/field-root-context';
import { useFormContext } from '../internals/form-context/FormContext';
import { compareItemEquality, defaultItemEquality, findItemIndex, findSelectionIndex, isSelectedValueDirty, removeItem, selectedValueIncludes } from '../internals/itemEquality';
import { stringifyAsValue } from '../internals/resolveValueLabel';
import { createChangeEventDetails } from '../internals/createBaseUIEventDetails';
import type { ChangeEventDetails } from '../internals/contracts/events';
import type { AnchorPositioningResult } from '../internals/createAnchorPositioning';
import { closest, contains, getTarget } from '../utils/shadowDom';
import { createDerivedItems } from './root/createDerivedItems';
import type { AriaCombobox, AriaComboboxProps, AriaComboboxInputValue, SelectionMode } from './root/AriaCombobox';

export interface RegisteredItem { readonly index: number | null; readonly value: any; readonly disabled: boolean; readonly element: HTMLElement | null }
export function createComboboxModel(props: AriaComboboxProps<any, SelectionMode, any>) {
  const field = useFieldRootContext();
  const form = useFormContext();
  const hydrating = createIsHydrating();
  const direction = useDirection();
  const id = createLabelableId({ id: () => props.id });
  const registry = createItemRegistry<symbol, RegisteredItem>();
  const initialSelectedValue = untrack(() => props.selectedValue !== undefined ? props.selectedValue : props.defaultSelectedValue ?? (props.selectionMode === 'multiple' ? [] : null));
  const defaultSelected = untrack(() => props.defaultSelectedValue ?? (props.selectionMode === 'multiple' ? [] : null));
  const selected = createControlled<any, AriaCombobox.ChangeEventDetails>({ value: () => props.selectedValue,
    get defaultValue() { return props.defaultSelectedValue ?? defaultSelected; },
    onChange: () => props.onSelectedValueChange, name: 'Combobox', state: 'selectedValue' });
  const [queryChanged, setQueryChanged] = createSignal(false);
  const [highlightQuery, setHighlightQuery] = createSignal<string | null>(null);
  const [closeQuery, setCloseQuery] = createSignal<string | null>(null);
  const [active, setActive] = createSignal<{ index: number | null; reason: AriaCombobox.HighlightEventReason; event?: Event; query: string | null }>({ index: null, reason: 'none', query: null });
  const [selectedIndexRequest, setSelectedIndexRequest] = createSignal<{ index: number | null; value: any; values: readonly any[] } | null>(null);
  const [selectionAnchor, setSelectionAnchor] = createSignal<{ toggledValue?: any } | null>(null);
  // Explicit same-turn uncontrolled selection snapshot. Controlled proposals never acknowledge
  // selection; they continue reading the parent's actual value.
  let selectionProposal: { nextValue: any } | undefined;
  const [inputElement, setInputElement] = createSignal<HTMLInputElement | null>(null);
  const [triggerElement, setTriggerElement] = createSignal<HTMLElement | null>(null);
  const [listElement, setListElement] = createSignal<HTMLElement | null>(null);
  const [inputGroupElement, setInputGroupElement] = createSignal<HTMLElement | null>(null);
  const [inside, setInside] = createSignal(true);
  const [positioningResult, setPositioningResult] = createSignal<AnchorPositioningResult | null>(null);
  const [openMethod, setOpenMethod] = createSignal<InteractionType | null>(null);
  const [labelId, setLabelId] = createSignal<string>();
  const [popupId, setPopupId] = createSignal<string>();
  const [forceMounted, setForceMounted] = createSignal(false);
  const hiddenInput = createSignal<HTMLInputElement | null>(null);
  const derived: ReturnType<typeof createDerivedItems<any, any>> = createDerivedItems({
    get items() { return props.items; }, get filteredItems() { return props.filteredItems; },
    get query(): string { return !popup.state.open && closeQuery() !== null ? closeQuery()! : inputText().trim(); },
    get selectedValue() { return selected.value(); }, get selectionMode() { return props.selectionMode; },
    get queryChanged() { return queryChanged(); }, get filterQuery() { return props.filterQuery; },
    get filter() { return props.filter; }, get limit() { return props.limit; }, get locale() { return props.locale; },
    get itemToStringLabel() { return props.itemToStringLabel; }, get isItemEqualToValue() { return props.isItemEqualToValue; },
  });
  const initialInput = untrack(() => props.defaultInputValue ?? (props.inputValue === undefined && props.selectionMode === 'single' ? derived.label(selected.value()) : ''));
  const input = createControlled<AriaComboboxInputValue, AriaCombobox.ChangeEventDetails>({ value: () => props.inputValue, defaultValue: initialInput,
    onChange: () => (next, details) => props.onInputValueChange?.(String(next), details), name: 'Combobox', state: 'inputValue' });
  function readInput(): AriaComboboxInputValue {
    return input.value();
  }
  const inputText = () => String(input.value() ?? '');
  let hadInputClear = false;
  const popup = createPopup({ open: () => props.open, defaultOpen: untrack(() => props.defaultOpen),
    onOpenChange: () => (next, details) => props.onOpenChange?.(next, details as AriaCombobox.OpenChangeEventDetails),
    // All accepted paths (items, actions, and interaction hooks) must notify the
    // context used by focus/dismiss. Its setOpen delegates to this transaction.
    onAcceptedChange: (next, details) => floating.dispatchOpenChange(next, details),
    onOpenChangeComplete: () => (next) => untrack(() => {
      if (!next) {
        setCloseQuery(null); setQueryChanged(false); setHighlightQuery(null); setSelectionAnchor(null); setActive({ index: null, reason: 'none', query: null });
        props.onOpenChangeComplete?.(false);
        if (props.selectionMode === 'multiple' && inputElement()?.value && !hadInputClear) context.setInputValue('', createChangeEventDetails('input-clear'));
        if (props.selectionMode === 'single') {
          const label = inside() ? '' : derived.label(selected.value());
          if (inputElement() && inputElement()!.value !== label) context.setInputValue(label, createChangeEventDetails(label === '' || inside() ? 'input-clear' : 'none'));
        }
        return;
      }
      props.onOpenChangeComplete?.(next);
    }),
  });
  const triggerProps = createOpenMethodTriggerProps(() => popup.state.open, setOpenMethod);
  const equal = () => props.isItemEqualToValue ?? defaultItemEquality;
  const values = createMemo(() => {
    if (derived.hasItems || props.filteredItems !== undefined) return derived.flatFilteredValues;
    const items: any[] = [];
    for (const item of registry.items.values()) if (item.index != null && item.index >= 0) items[item.index] = item.value;
    return items;
  }, { equals: (previous, next) => {
    if (previous.length !== next.length) return false;
    for (let index = 0; index < next.length; index++) if (!Object.is(previous[index], next[index])) return false;
    return true;
  } });
  // The source selected index is an open-cycle anchor, not a live projection
  // of selection changes while browsing. A chip removal must not make shared
  // navigation jump away from an independently highlighted item.
  type SelectedCoordinate = { index: number | null; request: ReturnType<typeof selectedIndexRequest>; closeQuery: string | null };
  const selectedCoordinate = createMemo<SelectedCoordinate>((previous) => {
    const request = selectedIndexRequest();
    const query = closeQuery();
    const open = popup.state.open;
    const candidates = values();
    const value = selected.value();
    const comparer = equal();
    if (props.selectionMode === 'none') return { index: null, request, closeQuery: query };
    if (request && request !== previous?.request) return { index: request.index, request, closeQuery: query };
    const releasedQuery = previous?.closeQuery != null && query === null && derived.hasItems;
    if (open && previous && !releasedQuery) return { index: previous.index, request, closeQuery: query };
    const index = open && !previous && !props.inline ? null : findSelectionIndex(candidates, value, comparer, props.selectionMode === 'multiple');
    return { index, request, closeQuery: query };
  }, { equals: (previous, next) => previous.index === next.index && previous.request === next.request && previous.closeQuery === next.closeQuery });
  const selectedIndex = () => selectedCoordinate().index;
  const activeIndex = () => {
    if (!popup.state.open && !props.inline) return null;
    const anchor = selectionAnchor();
    if (anchor && inputText().trim() === '') {
      const current = selected.value();
      const multiple = props.selectionMode === 'multiple';
      if (multiple && selectedValueIncludes(current, anchor.toggledValue, equal())) {
        const index = findItemIndex(values(), anchor.toggledValue, equal());
        return index === -1 ? null : index;
      }
      const hasSelection = multiple && Array.isArray(current) ? current.length > 0 : props.selectionMode !== 'none' && current != null;
      if (hasSelection) return findSelectionIndex(values(), current, equal(), multiple);
      return props.autoHighlight === 'always' && values().length ? 0 : null;
    }
    const request = active();
    if ((props.autoHighlight === 'always' || (props.autoHighlight && highlightQuery() === inputText() && inputText().trim() !== '')) && (request.index === null || request.query !== inputText())) return values().length ? 0 : null;
    return request.index != null && Object.hasOwn(values(), request.index) ? request.index : null;
  };
  const floating = createFloatingRoot({
    syncOnly: true,
    state: {
      get open() { return Boolean(props.inline || popup.state.open); }, get transitionStatus() { return popup.state.transitionStatus; },
      get domReferenceElement() { return inside() ? triggerElement() : inputElement(); },
      get referenceElement() { return inside() ? triggerElement() : inputElement(); }, get positionReference() { return null; },
      get floatingElement() { return popup.state.positionerElement; }, get floatingId() { return `${id()}-list`; },
    }, triggerElements: popup.context.triggerElements,
    onOpenChange: (next, details) => context.setOpen(next, details as AriaCombobox.ChangeEventDetails),
  });
  const cells = {
    listRef: { current: [] as (HTMLElement | null)[] }, labelsRef: { current: [] as (string | null)[] },
    popupRef: { current: null as HTMLDivElement | null }, clearRef: { current: null as HTMLButtonElement | null },
    startDismissRef: { current: null as HTMLSpanElement | null }, endDismissRef: { current: null as HTMLSpanElement | null },
    chipsContainerRef: { current: null as HTMLDivElement | null }, emptyRef: { current: null as HTMLDivElement | null },
    pointerDownItemRef: { current: null as Element | null }, selectionEventRef: { current: null as Event | null },
    inputRef: { get current() { return inputElement(); } }, valuesRef: { get current() { return values(); } },
  };
  createEffect(() => derived.hasItems || props.filteredItems !== undefined ? values().length : undefined, (length) => {
    if (length !== undefined) cells.listRef.current.length = length;
  });
  const dismiss = createDismiss(floating, { get enabled() { return !props.disabled && !field?.disabled && !props.inline; },
    outsidePressEvent: { mouse: 'sloppy', touch: 'intentional' },
    outsidePress(event) { const target = getTarget(event); return !isElement(target) || ![triggerElement(), inputGroupElement(), cells.clearRef.current, cells.chipsContainerRef.current].some((el) => contains(el, target)); },
  });
  const click = createClick(floating, { get enabled() { return !props.disabled && !field?.disabled && (props.openOnInputClick ?? true); },
    event: 'mousedown-only', toggle: false, reason: 'input-press', get touchOpenDelay() { return inside() ? 0 : 100; } });
  const navigation = createListNavigation(floating, {
    listRef: cells.listRef, get id() { return id(); }, get activeIndex() { return activeIndex(); }, get selectedIndex() { return selectedIndex(); },
    get enabled() { return !props.disabled && !field?.disabled; }, virtual: true,
    get loopFocus() { return props.loopFocus ?? true; }, get allowEscape() { return props.loopFocus !== false && !props.autoHighlight; },
    get focusItemOnOpen() { return queryChanged() || (props.selectionMode === 'none' && !props.autoHighlight) ? false : 'auto'; },
    get focusItemOnHover() { return props.highlightItemOnHover ?? true; }, get resetOnPointerLeave() { return !props.keepHighlight; },
    get orientation() { return props.grid ? 'horizontal' : undefined; }, get grid() { return props.grid ? gridNavigation : undefined; },
    get rtl() { return direction() === 'rtl'; }, disabledIndices: [],
    onNavigate(index: number | null, event?: Event, source?: string) {
      if ((!event && !state.open && source !== 'imperative' && !(state.inline && index === null)) || state.transitionStatus === 'ending') return;
      context.setIndices({ activeIndex: index, type: source === 'imperative' ? 'imperative-action' : event?.type.startsWith('key') ? 'keyboard' : event ? 'pointer' : 'none', event });
    },
  });
  const state = {
    get id() { return id(); }, get labelId() { return labelId(); }, get popupId() { return popupId(); },
    get items() { return derived.collection ? undefined : derived.items; },
    get selectedValue() { return selected.value(); }, get inputValue() { return readInput(); },
    get selectionMode() { return props.selectionMode; },
    get open() { return popup.state.open; }, get mounted() { return popup.state.mounted; },
    get transitionStatus() { return popup.state.transitionStatus; }, get forceMounted() { return forceMounted(); },
    get activeIndex() { return activeIndex(); }, get selectedIndex() { return selectedIndex(); },
    get inputElement() { return inputElement(); }, get triggerElement() { return triggerElement(); },
    get inputGroupElement() { return inputGroupElement(); }, get listElement() { return listElement(); },
    get positionerElement() { return popup.state.positionerElement; }, get popupSide() { return popup.state.mounted && popup.state.positionerElement ? positioningResult()?.side ?? null : null; },
    get openMethod() { return openMethod(); }, get triggerProps() { return triggerProps; },
    get inputInsidePopup() { return inside(); }, get inputOwnsFormValue() { return props.selectionMode === 'none' && (hydrating() || !inside() || Boolean(props.inline)); },
    get disabled() { return Boolean(props.disabled || field?.disabled); }, get readOnly() { return props.readOnly ?? false; },
    get required() { return props.required ?? false; }, get name() { return field?.name ?? props.name; }, get form() { return props.form; },
    get inline() { return props.inline ?? false; }, get modal() { return props.modal ?? false; }, get grid() { return props.grid ?? false; },
    get virtualized() { return props.virtualized ?? false; }, get openOnInputClick() { return props.openOnInputClick ?? true; },
    get autoHighlight() { return props.autoHighlight ?? false; }, get hasInputValue() { return props.inputValue !== undefined || props.defaultInputValue !== undefined; },
    get submitOnItemClick() { return props.submitOnItemClick ?? false; }, get hasSelectedValue() { return props.selectionMode === 'multiple' && Array.isArray(selected.value()) ? selected.value().length > 0 : selected.value() != null; },
    get hasSelectionChips() { return Array.isArray(selected.value()) && selected.value().length > 0; },
    get isItemEqualToValue() { return equal(); }, itemToStringLabel: derived.label,
    get inputProps() { return mergeProps<any>(navigation.reference, { onKeyDown(event: KeyboardEvent & { preventBaseUIHandler(): void }) { if (props.grid && activeIndex() == null && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) event.preventBaseUIHandler(); } }, dismiss.reference, click.reference); }, get popupProps() { return dismiss.floating; },
    get listProps() { return navigation.floating; }, get itemProps() { return mergeProps<any>(navigation.item, { onFocus: undefined }); },
  };
  let lastHighlight: { value: any; index: number } | undefined;
  function emitHighlight(index: number | null, reason: AriaCombobox.HighlightEventReason, event?: Event, complete = true) {
    if (index == null && !lastHighlight) return;
    const value = index == null ? undefined : values()[index];
    lastHighlight = index == null ? undefined : { value, index };
    const details = createGenericEventDetails(reason, event, { index: index ?? -1 });
    props.onItemHighlighted?.(value, details);
    if (complete) props.onInlineCompletion?.(value, details);
  }
  function handleInterruptedReopen(isInputChange: boolean) {
    const value = inputText();
    const selectedLabel = props.selectionMode === 'single' ? derived.label(selected.value()) : '';
    const clearsPending = !isInputChange && inside() && !props.inline && value !== '' && (value.trim() === closeQuery() || value === selectedLabel);
    if (!isInputChange && (clearsPending || value === '' || (!inside() && value === selectedLabel))) setQueryChanged(false);
    setCloseQuery(null);
    if (clearsPending) context.setInputValue('', createChangeEventDetails('input-clear'));
  }
  const context = {
    ...cells,
    setOpen(next: boolean, details: AriaCombobox.ChangeEventDetails) {
      if (disposed) return;
      if (next === popup.state.open) return;
      if (details.reason === 'escape-key' && derived.hasItems && values().length === 0 && !cells.emptyRef.current) details.allowPropagation();
      popup.setOpen(next, details as AriaCombobox.OpenChangeEventDetails);
      if (details.isCanceled) { if (details.reason === 'input-change') setHighlightQuery(null); return; }
      if (next) {
        if (closeQuery() !== null) handleInterruptedReopen(details.reason === 'input-change');
        if (details.reason !== 'input-change') { setHighlightQuery(null); context.setIndices({ activeIndex: selectedIndex() }); }
      } else {
        if (queryChanged() && !props.inline) setCloseQuery(inputText().trim());
        if (queryChanged() && props.selectionMode === 'multiple' && (!inside() || props.inline)) context.setInputValue('', createChangeEventDetails('input-clear', details.event, undefined, { isItemPress: details.reason === 'item-press' }));
        if (queryChanged() && props.selectionMode === 'multiple' && inside()) context.setIndices({ activeIndex: null });
        setSelectionAnchor(null);
        cells.pointerDownItemRef.current = null;
        if (inside() && (details.reason === 'focus-out' || details.reason === 'outside-press')) { field?.setTouched(true); field?.setFocused(false); if (field?.validationMode === 'onBlur') void field.validation.commit(fieldValue()); }
      }
    },
    setInputValue(next: string, details: AriaCombobox.ChangeEventDetails) {
      if (disposed) return { accepted: false as const, nextValue: next };
      const previousIndex = activeIndex();
      const result = input.request(next, details);
      if (!result.accepted) return result;
      inputProposal = next;
      queueMicrotask(() => { if (inputProposal === next) inputProposal = undefined; });
      hadInputClear = details.reason === 'input-clear';
      if (details.reason === 'input-change') {
        setSelectionAnchor(null);
        if (next.trim() !== '') setQueryChanged(true);
        setCloseQuery(null);
        const type = (details.event as InputEvent).inputType;
        const typed = details.event.type === 'compositionend' || Boolean(type && type !== 'insertReplacementText');
        if (typed) {
          setHighlightQuery(next); setActive({ index: next.trim() === '' && props.autoHighlight ? previousIndex : null, reason: 'none', event: details.event, query: next });
          const list = listElement();
          if (!props.virtualized && list) {
            const popupElement = props.inline && popup.state.positionerElement ? closest(popup.state.positionerElement, '[role="dialog"]') : cells.popupRef.current;
            for (const ancestor of getOverflowAncestors(list.firstElementChild ?? list)) {
              if (!isHTMLElement(ancestor) || (popupElement ? !contains(popupElement, ancestor) : ancestor.getAttribute('role') === 'dialog')) break;
              if (isScrollableY(ancestor)) { ancestor.scrollTop = 0; break; }
            }
          }
        }
      } else if (next === '') setHighlightQuery(null);
      return result;
    },
    setSelectedValue(next: any, details: AriaCombobox.ChangeEventDetails) {
      if (disposed) return { accepted: false as const, nextValue: next };
      const result = selected.request(next, details);
      if (!result.accepted) return result;
      if (!result.controlled) {
        const proposal = { nextValue: result.nextValue };
        selectionProposal = proposal;
        queueMicrotask(() => { if (selectionProposal === proposal) selectionProposal = undefined; });
      }
      if ((props.selectionMode === 'single' && !inside()) || (props.selectionMode === 'none' && props.fillInputOnItemPress !== false && cells.popupRef.current)) {
        context.setInputValue(derived.label(next), createChangeEventDetails(details.reason, details.event));
      }
      return result;
    },
    setIndices(options: { activeIndex?: number | null; selectedIndex?: number | null; type?: AriaCombobox.HighlightEventReason; event?: Event }) {
      if (disposed) return;
      if (options.activeIndex !== undefined) {
        setHighlightQuery(null);
        setSelectionAnchor(null);
        setActive({ index: options.activeIndex, reason: options.type ?? 'none', event: options.event, query: inputText() });
        emitHighlight(options.activeIndex, options.type ?? 'none', options.event);
      }
      if (options.selectedIndex !== undefined) setSelectedIndexRequest({ index: options.selectedIndex, value: selected.value(), values: values() });
    },
    discardPendingHighlight() { setHighlightQuery(null); },
    forceMount() {
      if (derived.hasItems) cells.labelsRef.current = values().map(derived.label);
      else setForceMounted(true);
    },
    forceMountRendered() { setForceMounted(true); },
    handleSelection(event: MouseEvent | PointerEvent | KeyboardEvent, value: any) {
      if (state.disabled || state.readOnly) return;
      const details = createChangeEventDetails('item-press', event);
      const target = getTarget(event);
      const href = isElement(target) ? closest(target, 'a')?.getAttribute('href') : null;
      if (href) { if (href.startsWith('#')) context.setOpen(false, details); return; }
      const current = selectionProposal ? selectionProposal.nextValue : selected.value();
      const next = props.selectionMode === 'multiple'
        ? selectedValueIncludes(current ?? [], value, equal()) ? removeItem(current, value, equal()) : [...(current ?? []), value]
        : value;
      const result = context.setSelectedValue(next, details);
      if (!result.accepted) return;
      if (props.selectionMode !== 'multiple') context.setOpen(false, details);
      else if (inputElement()?.value.trim()) {
        if (inside()) {
          const cleared = context.setInputValue('', createChangeEventDetails('input-clear', event, undefined, { isItemPress: true }));
          if (cleared.accepted) setSelectionAnchor({ toggledValue: selectedValueIncludes(current, value, equal()) ? undefined : value });
        }
        else context.setOpen(false, details);
      }
    },
    requestSubmit() {
      // Wait for the accepted native transaction to commit. Controlled proposals
      // may be ignored or transformed; submitting them speculatively is incorrect.
      queueMicrotask(() => untrack(() => {
        if (disposed) return;
        const ownerForm = hiddenInput[0]()?.form ?? inputElement()?.form;
        if (typeof ownerForm?.requestSubmit === 'function') ownerForm.requestSubmit();
      }));
    },
    onOpenChangeComplete: (open: boolean) => props.onOpenChangeComplete?.(open),
  };
  const actions: AriaCombobox.Actions = {
    close: () => context.setOpen(false, createChangeEventDetails('imperative-action')),
    // Shared popup owner handles close+unmount and cancelled close transactions.
    unmount: () => popup.forceUnmount(),
    highlightItem(target) {
      if ((!state.open && !state.inline) || (target === 'none' && props.autoHighlight === 'always')) return;
      navigation.highlightItem(target);
    },
  };
  type HighlightObservation = { index: number | null; values: readonly any[]; request: ReturnType<typeof active>; open: boolean; inline: boolean; scope: object | undefined; scopeChanged: boolean };
  const highlightObservation = createMemo<HighlightObservation>((previous) => {
    const scope = props.inlineCompletionScope;
    return { index: activeIndex(), values: values(), request: active(), open: state.open, inline: state.inline,
      scope, scopeChanged: previous !== undefined && previous.scope !== scope };
  });
  createEffect(highlightObservation, ({ index, values: candidates, open, inline, scopeChanged }) => untrack(() => {
    const next = index == null ? undefined : candidates[index];
    if (!lastHighlight && index == null) return;
    if (lastHighlight?.index === index && compareItemEquality(lastHighlight.value, next, equal())) return;
    // Public notifications retain their source order/arity. An external adapter
    // scope change retires completion during this transition, without silencing
    // highlights or preventing subsequent asynchronous candidates from completing.
    if (open || inline || index == null) emitHighlight(index, 'none', undefined, !scopeChanged);
  }));
  const fieldValue = () => props.selectionMode === 'none' ? input.value() : selected.value();
  const formValue = () => props.selectionMode === 'none' ? input.value() : Array.isArray(fieldValue()) ? fieldValue().map((v: any) => stringifyAsValue(v, props.itemToStringValue)) : stringifyAsValue(fieldValue(), props.itemToStringValue);
  createEffect(() => fieldValue(), (value) => {
    field?.setFilled(props.selectionMode === 'none' ? String(value ?? '') !== '' : Array.isArray(value) ? value.length > 0 : value != null);
  });
  createValueChanged(fieldValue, () => {
    const value = fieldValue();
    form?.clearErrors(state.name);
    field?.setDirty(isSelectedValueDirty(value, field.validityData.initialValue, equal()));
    field?.validation.change(value);
  });
  let labelSyncProposal: string | undefined;
  function syncInputToSelection(force = false) {
    if (props.selectionMode !== 'single' || state.hasInputValue || inside() || (!force && queryChanged())) return;
    const label = derived.label(selected.value());
    if (input.value() !== label && inputProposal !== label && labelSyncProposal !== label) {
      labelSyncProposal = label;
      queueMicrotask(() => { if (labelSyncProposal === label) labelSyncProposal = undefined; });
      context.setInputValue(label, createChangeEventDetails('none'));
    }
  }
  let inputProposal: string | undefined;
  let disposed = false;
  onCleanup(() => { disposed = true; });
  createValueChanged(selected.value, () => syncInputToSelection(true));
  createValueChanged(() => ({ label: derived.label(selected.value()), items: derived.items, inside: inside() }), () => syncInputToSelection());
  createValueChanged(() => popup.state.open, () => {
    if (popup.state.open && closeQuery() !== null) handleInterruptedReopen(false);
    if (!popup.state.open) { setHighlightQuery(null); cells.pointerDownItemRef.current = null; }
  });
  return { state, context, props, derived, values, popup, floating, navigation, registry, field, actions, hiddenInput, fieldValue, formValue,
    setInputElement, setTriggerElement, setListElement, setInputGroupElement, setInside, setLabelId, setPopupId, setPositioningResult,
    isSelected: (value: any) => props.selectionMode !== 'none' && (Array.isArray(selected.value()) ? selectedValueIncludes(selected.value(), value, equal()) : compareItemEquality(value, selected.value(), equal())),
    get disposed() { return disposed; },
    reset(event?: Event) {
      if (disposed) return;
      if (props.selectionMode !== 'none') context.setSelectedValue(initialSelectedValue, createChangeEventDetails('none', event));
      const result = input.request(initialInput, createChangeEventDetails('none', event));
      if (result.accepted) { setHighlightQuery(null); setSelectionAnchor(null); }
    },
  };
}
export type ComboboxStore = ReturnType<typeof createComboboxModel>;
export type State = ComboboxStore['state'];
export type ComboboxStoreContext = ComboboxStore['context'];
