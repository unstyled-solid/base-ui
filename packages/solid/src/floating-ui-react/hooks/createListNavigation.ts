// Canonical Base UI list navigation, expressed with live options and native transactions.
import { createEffect, onCleanup, untrack, type Accessor } from 'solid-js';
import type { JSX } from '@solidjs/web';
import type { FloatingRootContext, FloatingTreeType } from '../../internals/contracts/floating';
import type { InteractionProps } from './createDismiss';
import { createChangeEventDetails } from '../../internals/createBaseUIEventDetails';
import { createAnimationFrame } from '../../utils/createAnimationFrame';
import { createFloatingParentNodeId, createFloatingTreeAccessor } from '../components/FloatingTree';
import { getMinListIndex, getMaxListIndex, getNextListIndex, isIndexOutOfListBounds, type DisabledIndices } from '../utils/composite';
import { activeElement, contains, getFloatingFocusElement, getTarget, isTypeableCombobox, isTypeableElement } from '../utils/element';
import { enqueueFocus } from '../utils/enqueueFocus';
import { isVirtualClick, isVirtualPointerEvent } from '../utils/event';
import { platform } from '../../utils/platform';
export type ListNavigationSource = 'imperative';
export type HighlightItemTarget = 'next' | 'previous' | 'first' | 'last' | 'none';
type Orientation = 'horizontal' | 'vertical' | 'both';
export interface UseListNavigationProps {
  listRef: { current: (HTMLElement | null)[] }; activeIndex: number | null;
  onNavigate?: ((index: number | null, event: Event | undefined, source?: ListNavigationSource) => void) | undefined;
  enabled?: boolean | undefined; selectedIndex?: number | null | undefined; focusItemOnOpen?: boolean | 'auto' | undefined;
  focusItemOnHover?: boolean | undefined; openOnArrowKeyDown?: boolean | undefined; disabledIndices?: DisabledIndices | undefined;
  allowEscape?: boolean | undefined; loopFocus?: boolean | undefined; nested?: boolean | undefined; parentOrientation?: Orientation | undefined;
  rtl?: boolean | undefined; virtual?: boolean | undefined; orientation?: Orientation | undefined; triggerOrientation?: Orientation | undefined;
  id?: string | undefined; resetOnPointerLeave?: boolean | undefined; externalTree?: FloatingTreeType | undefined;
  nestedReturnFocusRef?: { current: HTMLElement | null } | Accessor<HTMLElement | null> | undefined;
  grid?: ((event: KeyboardEvent, index: number, list: { current: (HTMLElement | null)[] }, orientation: Orientation, loop: boolean, rtl: boolean, disabled: DisabledIndices | undefined, min: number, max: number) => number | null | undefined) | null | undefined;
}
export interface UseListNavigationReturn extends InteractionProps { highlightItem(target: HighlightItemTarget): void }
const orientationMatch = (orientation: Orientation | undefined, vertical: boolean, horizontal: boolean) => orientation === 'vertical' ? vertical : orientation === 'horizontal' ? horizontal : vertical || horizontal;
export const isMainOrientationKey = (key: string, orientation?: Orientation) => orientationMatch(orientation, key === 'ArrowUp' || key === 'ArrowDown', key === 'ArrowLeft' || key === 'ArrowRight');
export const isMainOrientationToEndKey = (key: string, orientation: Orientation | undefined, rtl: boolean) => orientationMatch(orientation, key === 'ArrowDown', key === (rtl ? 'ArrowLeft' : 'ArrowRight')) || key === 'Enter' || key === ' ' || key === '';
export const isCrossOrientationOpenKey = (key: string, orientation: Orientation | undefined, rtl: boolean) => orientationMatch(orientation, key === (rtl ? 'ArrowLeft' : 'ArrowRight'), key === 'ArrowDown');
export const isCrossOrientationCloseKey = (key: string, orientation: Orientation | undefined, rtl: boolean, grid: boolean) => orientation === 'both' || (orientation === 'horizontal' && grid) ? key === 'Escape' : orientationMatch(orientation, key === (rtl ? 'ArrowRight' : 'ArrowLeft'), key === 'ArrowUp');
export function createListNavigation(input: FloatingRootContext | Accessor<FloatingRootContext>, options: UseListNavigationProps): UseListNavigationReturn {
  const root = () => typeof input === 'function' ? input() : input, parentId = createFloatingParentNodeId();
  const tree = createFloatingTreeAccessor(() => options.externalTree);
  const focusFrame = createAnimationFrame(), populateFrame = createAnimationFrame();
  let cursor = untrack(() => options.selectedIndex ?? -1), key: string | null = null, pointer = true, inferredFocus: boolean | 'auto' = 'auto';
  let previousOpen = false, previousMounted = false, generation = 0;
  let previousSelected: number | null = null, previousFloating: HTMLElement | null = null, previousEnabled = false;
  let cancelFocus = () => {};
  const floatingFocus = () => getFloatingFocusElement(root().state.floatingElement);
  const parentOrientation = () => options.parentOrientation ?? tree()?.nodes.find((node) => node.id === parentId())?.context?.data.orientation;
  const orientation = () => options.orientation ?? 'vertical', triggerOrientation = () => options.triggerOrientation ?? orientation();
  const focus = (index: number, sync: boolean, scroll: boolean) => {
    focusFrame.cancel(); cancelFocus();
    const initial = options.listRef.current[index];
    const request = generation;
    const perform = (element: HTMLElement) => {
      if (!options.virtual) cancelFocus = enqueueFocus(element, { sync, preventScroll: true, shouldFocus: () => request === generation && untrack(() => root().state.open) });
    };
    if (initial) perform(initial);
    const after = () => { if (request !== generation || !untrack(() => root().state.open)) return; const element = options.listRef.current[index] ?? initial;
      if (!element) return; if (!initial) perform(element); if (scroll || !pointer) element.scrollIntoView?.({ block: 'nearest', inline: 'nearest' }); };
    if (sync) after(); else focusFrame.request(after);
  };
  const notify = (next: number, event?: Event, source?: ListNavigationSource, sync = false, scroll = false) => {
    cursor = next;
    options.onNavigate?.(next === -1 ? null : next, event, source);
    if (next >= 0 && root().state.open) focus(next, sync, scroll);
    // Reconcile a rejected controlled proposal after this turn, while several
    // same-turn requests still advance through their explicit transaction cursor.
    const request = generation;
    queueMicrotask(() => { if (request === generation) cursor = untrack(() => options.activeIndex ?? -1); });
  };
  createEffect(() => ({ root: root(), open: root().state.open, floating: root().state.floatingElement,
    selected: options.selectedIndex ?? null, enabled: options.enabled ?? true, initial: options.focusItemOnOpen ?? 'auto', orientation: orientation(), triggerOrientation: triggerOrientation(), rtl: options.rtl ?? false, nested: options.nested ?? false }), (next) => {
    next.root.data.orientation = next.orientation;
    const mounted = !!next.floating, opening = next.open && mounted && (!previousOpen || !previousMounted);
    const closing = (!next.open || !mounted) && previousMounted;
    if (!next.open) { key = null; inferredFocus = next.initial; }
    else if (next.initial !== 'auto') inferredFocus = next.initial;
    if (next.enabled && next.open && mounted) {
      if (next.selected !== null && (opening || next.selected !== previousSelected || next.floating !== previousFloating || !previousEnabled)) { cursor = next.selected; if (inferredFocus) untrack(() => notify(cursor, undefined, undefined, false, true)); }
      else if (opening && untrack(() => options.activeIndex) === null && inferredFocus && (key !== null || inferredFocus === true)) {
        let runs = 0; const request = ++generation;
        const populate = () => untrack(() => {
          if (request !== generation || !root().state.open) return;
          if (!options.listRef.current[0]) { if (runs < 2) { if (runs) populateFrame.request(populate); else queueMicrotask(populate); } runs++; return; }
          const nextIndex = key === null || isMainOrientationToEndKey(key, next.triggerOrientation, next.rtl) || next.nested ? getMinListIndex(options.listRef) : getMaxListIndex(options.listRef);
          key = null; notify(nextIndex);
        }); populate();
      }
    } else if (next.enabled && closing) { generation++; cursor = -1; untrack(() => options.onNavigate?.(null, undefined)); }
    previousOpen = next.open; previousMounted = mounted;
    previousSelected = next.selected; previousFloating = next.floating; previousEnabled = next.enabled;
  });
  // Selection/opening proposes a highlight; committed highlights only drive DOM
  // focus. Tracking activeIndex in the proposing effect writes its own source.
  createEffect(() => ({ open: root().state.open, floating: root().state.floatingElement,
    enabled: options.enabled ?? true, active: options.activeIndex }), (next) => {
    if (!next.enabled || !next.open || !next.floating) return;
    if (next.active !== null && !isIndexOutOfListBounds(options.listRef.current, next.active)) {
      cursor = next.active;
      untrack(() => focus(cursor, false, false));
    } else if (next.active === null) cursor = -1;
  });
  onCleanup(() => { generation++; cancelFocus(); });
  const stop = (event: KeyboardEvent) => { event.preventDefault(); event.stopPropagation(); };
  const returnTarget = () => typeof options.nestedReturnFocusRef === 'function' ? options.nestedReturnFocusRef() : options.nestedReturnFocusRef?.current ?? root().state.domReferenceElement;
  const commonKey = (event: KeyboardEvent) => {
    if (options.enabled === false || event.which === 229 || event.isComposing) return;
    pointer = false;
    const context = root(), open = context.state.open, mainOrientation = orientation(), rtl = options.rtl ?? false;
    if (!open && event.currentTarget === floatingFocus()) return;
    if (options.nested && isCrossOrientationCloseKey(event.key, mainOrientation, rtl, !!options.grid)) {
      if (!isMainOrientationKey(event.key, parentOrientation())) stop(event);
      context.setOpen(false, createChangeEventDetails('list-navigation', event));
      const element = returnTarget(); if (element && 'focus' in element) (element as HTMLElement).focus(); return;
    }
    const min = getMinListIndex(options.listRef, options.disabledIndices), max = getMaxListIndex(options.listRef, options.disabledIndices);
    if (!isTypeableCombobox(context.state.domReferenceElement)) {
      if (event.key === 'Home' || event.key === 'End') { stop(event); notify(event.key === 'Home' ? min : max, event, undefined, true); return; }
    }
    if (options.grid) {
      const index = options.grid(event, cursor, options.listRef, mainOrientation, options.loopFocus ?? false, rtl, options.disabledIndices, min, max);
      if (index != null && index !== cursor) notify(index, event, undefined, true);
      if (mainOrientation === 'both') return;
    }
    if (!isMainOrientationKey(event.key, mainOrientation)) return;
    stop(event);
    const currentTarget = event.currentTarget as HTMLElement;
    const active = activeElement(currentTarget.ownerDocument);
    if (open && !options.virtual && contains(currentTarget, active) && !options.listRef.current.some((item) => item && contains(item, active))) {
      notify(isMainOrientationToEndKey(event.key, mainOrientation, rtl) ? min : max, event, undefined, true); return;
    }
    const step = getNextListIndex(options.listRef.current, cursor, { decrement: !isMainOrientationToEndKey(event.key, mainOrientation, rtl), loopFocus: options.loopFocus ?? false, allowEscape: options.allowEscape ?? false, disabledIndices: options.disabledIndices, minIndex: min, maxIndex: max });
    notify(step.index, event, undefined, !step.wrapped);
  };
  const stationary = (event: MouseEvent) => platform.engine.webkit && event.movementX === 0 && event.movementY === 0;
  const syncTarget = (event: Event) => {
    if (!root().state.open) return;
    const index = options.listRef.current.indexOf(event.currentTarget as HTMLElement);
    // Synchronous focus follows the explicit navigation cursor before the
    // consumer's staged activeIndex write commits. Do not propose it twice.
    if (index !== -1 && cursor !== index) notify(index, event, undefined, true);
  };
  const item: JSX.HTMLAttributes<HTMLElement> = {
    onFocus: syncTarget,
    onClick(event) { if (!options.virtual) event.currentTarget.focus({ preventScroll: true }); },
    onMouseMove(event) { if (!stationary(event) && options.focusItemOnHover !== false) syncTarget(event); },
    onPointerLeave(event) {
      if (!root().state.open || !pointer || event.pointerType === 'touch' || options.focusItemOnHover === false || options.resetOnPointerLeave === false || options.listRef.current.includes(event.relatedTarget as HTMLElement)) return;
      cancelFocus(); notify(-1, event);
      const element = floatingFocus(); if (!options.virtual && element && contains(element, activeElement(element.ownerDocument))) element.focus({ preventScroll: true });
    },
  };
  const trigger: JSX.HTMLAttributes<HTMLElement> = {
    onKeyDown(event) {
      if (options.enabled === false) return;
      const open = root().state.open, rtl = options.rtl ?? false; pointer = false;
      const cross = isCrossOrientationOpenKey(event.key, parentOrientation(), rtl), main = isMainOrientationKey(event.key, open ? orientation() : triggerOrientation());
      if (options.virtual && open && (!options.nested || isTypeableElement(event.currentTarget))) { commonKey(event); return; }
      if (!open && options.openOnArrowKeyDown === false && event.key.startsWith('Arrow')) return;
      if ((options.nested ? cross : main) || event.key === 'Enter' || !event.key.trim()) key = options.nested && isMainOrientationKey(event.key, parentOrientation()) ? null : event.key;
      const openRequest = () => root().setOpen(true, createChangeEventDetails('list-navigation', event, event.currentTarget));
      if (options.nested) { if (cross) { stop(event); if (open) { notify(getMinListIndex(options.listRef, options.disabledIndices), event, undefined, true); if (options.virtual) floatingFocus()?.focus(); } else openRequest(); } return; }
      if (main) { if (options.selectedIndex != null) cursor = options.selectedIndex; stop(event); if (!open && options.openOnArrowKeyDown !== false) openRequest(); else commonKey(event); }
    },
    onFocus(event) { if (event.target === event.currentTarget && root().state.open && !options.virtual) notify(-1, event); },
    onPointerDown(event) { inferredFocus = options.focusItemOnOpen ?? 'auto'; if (inferredFocus === 'auto' && isVirtualPointerEvent(event)) inferredFocus = true; },
    onPointerEnter(event) { inferredFocus = options.focusItemOnOpen ?? 'auto'; if (inferredFocus === 'auto' && isVirtualPointerEvent(event)) inferredFocus = true; },
    onMouseDown(event) { if ((options.focusItemOnOpen ?? 'auto') === 'auto' && isVirtualClick(event)) inferredFocus = !options.virtual; },
    onClick(event) { if ((options.focusItemOnOpen ?? 'auto') === 'auto' && isVirtualClick(event)) inferredFocus = !options.virtual; },
  };
  const activeDescendant = () => options.virtual && root().state.open && options.activeIndex != null ? options.id ? `${options.id}-${options.activeIndex}` : options.listRef.current[options.activeIndex]?.id : undefined;
  const reference = { ...trigger, get 'aria-activedescendant'() { return activeDescendant(); } };
  const floating: JSX.HTMLAttributes<HTMLElement> = {
    get 'aria-activedescendant'() { return isTypeableCombobox(root().state.domReferenceElement) ? undefined : activeDescendant(); },
    onKeyDown(event) {
      if (event.key === 'Tab' && event.shiftKey && root().state.open && !options.virtual) {
        if (!contains(floatingFocus(), getTarget(event) as Element | null)) return;
        stop(event); const details = createChangeEventDetails('focus-out', event); root().setOpen(false, details);
        const element = returnTarget(); if (!details.isCanceled && element && 'focus' in element) (element as HTMLElement).focus(); return;
      }
      commonKey(event);
    },
    onPointerMove(event) { if (!stationary(event)) pointer = true; },
  };
  return {
    get reference() { return options.enabled === false ? undefined : reference; }, get trigger() { return options.enabled === false ? undefined : trigger; },
    get floating() { return options.enabled === false ? undefined : floating; }, get item() { return options.enabled === false ? undefined : item; },
    highlightItem(target) {
      if (options.enabled === false || !untrack(() => root().state.open)) return;
      pointer = false;
      if (target === 'none') { cancelFocus(); generation++; notify(-1, undefined, 'imperative'); const element = untrack(floatingFocus);
        if (!options.virtual && element && options.listRef.current.some((item) => item && contains(item, activeElement(element.ownerDocument)))) element.focus({ preventScroll: true }); return; }
      const list = options.listRef.current; if (!list.length) return;
      const min = getMinListIndex(options.listRef, options.disabledIndices), max = getMaxListIndex(options.listRef, options.disabledIndices);
      const next = target === 'first' ? min : target === 'last' ? max : isIndexOutOfListBounds(list, cursor) ? target === 'previous' ? max : min
        : getNextListIndex(list, cursor, { decrement: target === 'previous', loopFocus: options.loopFocus ?? false, allowEscape: false, disabledIndices: options.disabledIndices, minIndex: min, maxIndex: max }).index;
      if (!isIndexOutOfListBounds(list, next)) notify(next, undefined, 'imperative', false, true);
    },
  };
}
export { createListNavigation as useListNavigation };
