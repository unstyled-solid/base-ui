import { createEffect, onCleanup, omit } from 'solid-js';
import type { BaseUIComponentProps } from '../../internals/types';
import { createBaseUiId } from '../../internals/createBaseUiId';
import { createRenderElement } from '../../internals/createRenderElement';
import { createButton } from '../../internals/use-button';
import { createCompositeItem, useCompositeRootContext } from '../../internals/composite';
import { createChangeEventDetails } from '../../internals/createBaseUIEventDetails';
import { ownerDocument } from '../../utils/owner';
import { activeElement, contains } from '../../utils/shadowDom';
import { useTabsRootContext } from '../root/TabsRootContext';
import { useTabsListContext } from '../list/TabsListContext';
import { tabsStateAttributesMapping } from '../root/stateAttributesMapping';
import type { TabsRootState } from '../root/TabsRoot';

/** An interactive tab button; disabled tabs remain keyboard focusable. */
export function TabsTab(componentProps: TabsTab.Props) {
  const elementProps = omit(componentProps, 'class', 'style', 'render', 'ref', 'disabled', 'nativeButton', 'value', 'id');
  const root = useTabsRootContext();
  const list = useTabsListContext();
  const composite = useCompositeRootContext();
  const id = createBaseUiId(() => typeof componentProps.id === 'string' ? componentProps.id : undefined);
  const disabled = () => componentProps.disabled ?? false;
  const active = () => componentProps.value === root.value;
  const metadata: TabsTabMetadata = {
    get disabled() { return disabled(); }, get id() { return id(); }, get value() { return componentProps.value; },
  };
  const item = createCompositeItem<TabsTabMetadata>({ metadata });
  const button = createButton({
    get disabled() { return disabled(); }, get native() { return componentProps.nativeButton ?? true; },
    focusableWhenDisabled: true,
  });
  let navigating = false;
  let unobserve: (() => void) | undefined;
  let observed: HTMLElement | null = null;
  function observe(element: HTMLElement | null) {
    if (observed === element) return;
    unobserve?.();
    observed = element;
    unobserve = element ? list.registerTabResizeObserverElement(element) : undefined;
  }
  let pressing = false;
  let mainButton = false;
  let release: (() => void) | undefined;
  onCleanup(() => { unobserve?.(); release?.(); });
  createEffect(() => ({ active: active(), index: item.index, highlighted: composite.highlightedIndex,
    disabled: disabled(), list: list.tabsListElement }), (next) => {
    if (navigating) { navigating = false; return; }
    if (!next.active || next.index == null || next.index < 0 || next.highlighted === next.index || next.disabled) return;
    if (next.list && contains(next.list, activeElement(ownerDocument(next.list)))) return;
    composite.onHighlightedIndexChange(next.index);
  });
  function activate(event: Event) {
    root.onValueChange(componentProps.value, createChangeEventDetails('none', event, undefined, { activationDirection: 'none' }));
  }
  const state: TabsTabState = {
    get disabled() { return disabled(); }, get active() { return active(); },
    get orientation() { return root.orientation; }, get tabActivationDirection() { return root.tabActivationDirection; },
  };
  return createRenderElement('button', componentProps, {
    state, get ref() { return [componentProps.ref, button.buttonRef, item.compositeRef, observe]; },
    props: [item.compositeProps, {
      role: 'tab', get id() { return id(); },
      get 'aria-controls'() { return root.getTabPanelIdByValue(componentProps.value); },
      get 'aria-selected'() { return active(); },
      get 'data-composite-item-active'() { return active() ? '' : undefined; },
      // React's onClick excludes secondary mouse clicks; native DOM listeners do not.
      onClick(event: MouseEvent) { if (event.button === 0 && !active() && !disabled()) activate(event); },
      onFocus(event: FocusEvent) {
        if (!active() && !disabled() && list.activateOnFocus && (!pressing || mainButton)) activate(event);
      },
      onPointerDown(event: PointerEvent) {
        if (active() || disabled()) return;
        release?.();
        pressing = true;
        mainButton = event.button === 0;
        const doc = ownerDocument(event.currentTarget as HTMLElement);
        const end = () => {
          pressing = false; mainButton = false;
          doc.removeEventListener('pointerup', end);
          doc.removeEventListener('pointercancel', end);
          release = undefined;
        };
        release = end;
        doc.addEventListener('pointerup', end);
        doc.addEventListener('pointercancel', end);
      },
      onKeyDownCapture() { navigating = true; },
    }, elementProps, button.getButtonProps],
    stateAttributesMapping: tabsStateAttributesMapping,
  });
}

// Values are identity-bearing and deliberately unrestricted, matching upstream.
export type TabsTabValue = any;
export type TabsTabActivationDirection = 'left' | 'right' | 'up' | 'down' | 'none';
export interface TabsTabPosition { left: number; right: number; top: number; bottom: number }
export interface TabsTabSize { width: number; height: number }
export interface TabsTabMetadata { disabled: boolean; id: string | undefined; value: TabsTabValue }
export interface TabsTabState extends TabsRootState { disabled: boolean; active: boolean }
export interface TabsTabProps extends BaseUIComponentProps<'button', TabsTabState> {
  value: TabsTabValue;
  disabled?: boolean;
  nativeButton?: boolean;
}
export namespace TabsTab {
  export type Props = TabsTabProps;
  export type State = TabsTabState;
  export type Value = TabsTabValue;
  export type ActivationDirection = TabsTabActivationDirection;
  export type Metadata = TabsTabMetadata;
  export type Position = TabsTabPosition;
  export type Size = TabsTabSize;
}
