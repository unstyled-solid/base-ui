import { createSignal, omit, Show } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { FilterDropdownRoot, type FilterDropdownRootProps } from '../root/FilterDropdownRoot';
import { useFilterDropdownRootContext } from '../root/FilterDropdownRootContext';
import { FilterDropdownList } from '../list/FilterDropdownList';
import { createFilterDropdownItem } from '../item/useFilterDropdownItem';
import { refocusOwner } from '../utils/refocusOwner';
import { createBaseUiId } from '../../internals/createBaseUiId';
import { mergeProps } from '../../merge-props';
import { activeElement, contains, getTarget } from '../../utils/shadowDom';
import { isHTMLElement } from '@floating-ui/utils/dom';

/** Adapted from packages/react/test/filterDropdown.tsx; no production Menu dependency. */
export function TestRoot(props: Omit<FilterDropdownRootProps, 'listRef' | 'getActiveIndex' | 'setActiveIndex'> & Partial<Pick<FilterDropdownRootProps, 'listRef' | 'getActiveIndex' | 'setActiveIndex'>>) {
  const list = { current: [] as Array<HTMLElement | null> };
  const [active, setActive] = createSignal<number | null>(null);
  return <FilterDropdownRoot {...props} listRef={props.listRef ?? list} getActiveIndex={props.getActiveIndex ?? active} setActiveIndex={props.setActiveIndex ?? setActive} />;
}
export function ControlledRoot(props: Omit<Parameters<typeof TestRoot>[0], 'value' | 'open'> & { initialValue?: string; open?: boolean }) {
  const [value, setValue] = createSignal(props.initialValue ?? '');
  return <TestRoot {...props} open={props.open ?? true} value={value()} onValueChange={(next, details) => {
    props.onValueChange?.(next, details);
    if (!details.isCanceled) setValue(next);
  }} />;
}
export function Item(props: { label?: string; children?: JSX.Element; retainGroup?: boolean; id?: string }) {
  const filter = createFilterDropdownItem(props);
  return <Show when={filter.visible}><div role="menuitem" id={props.id} tabindex={-1} ref={filter.ref}>{props.children}</div></Show>;
}
export function List(props: FilterDropdownList.Props) {
  const context = useFilterDropdownRootContext();
  const defaults = { role: 'menu' as const, get 'aria-labelledby'() { return props['aria-labelledby'] ?? (props['aria-label'] ? undefined : context.triggerId); } };
  return <FilterDropdownList {...mergeProps<typeof FilterDropdownList>(defaults, props)} />;
}
/** Only the host responsibilities used by upstream's engine fixture, not Menu keyboard policy. */
export function Popup(props: JSX.HTMLAttributes<HTMLDivElement>) {
  const context = useFilterDropdownRootContext();
  const id = createBaseUiId(() => typeof props.id === 'string' ? props.id : undefined);
  let pointerType = 'mouse';
  const trackPointer = (event: PointerEvent) => { pointerType = event.pointerType || 'mouse'; };
  const restore = (event: MouseEvent & { currentTarget: HTMLDivElement }) => {
    const owner = context.focusOwnerRef.current;
    if (!context.open || !owner || pointerType !== 'mouse') return;
    const focused = activeElement(event.currentTarget.ownerDocument);
    if (focused === owner || contains(event.currentTarget, focused)) return;
    const nearest = event.composedPath().find(node => isHTMLElement(node) && (node.getAttribute('role') === 'dialog' || node.hasAttribute('data-rootownerid')));
    if (nearest === event.currentTarget) refocusOwner(owner);
  };
  const defaults: JSX.HTMLAttributes<HTMLDivElement> = {
    get id() { return id(); }, role: 'dialog', get 'aria-labelledby'() { return context.triggerId; },
    onPointerDown: trackPointer, onPointerOver: trackPointer, onPointerMove: trackPointer,
    onMouseMove: restore,
    onMouseDown(event) { if (getTarget(event) === event.currentTarget) event.preventDefault(); },
    onFocus(event) { if (context.open && getTarget(event) === event.currentTarget && context.focusOwnerRef.current) refocusOwner(context.focusOwnerRef.current); },
  };
  return <div {...mergeProps<'div'>(defaults, omit(props, 'id'))} />;
}
