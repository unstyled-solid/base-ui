import { createEffect, createMemo, createSignal, omit, untrack } from 'solid-js';
import type { BaseUIComponentProps } from '../../internals/types';
import { createRenderElement } from '../../internals/createRenderElement';
import { CompositeList } from '../../internals/composite';
import { createControlled } from '../../utils/createControlled';
import { createChangeEventDetails, type BaseUIChangeEventDetails } from '../../internals/createBaseUIEventDetails';
import { TabsRootContext, type TabMap } from './TabsRootContext';
import { tabsStateAttributesMapping } from './stateAttributesMapping';
import { computeActivationDirection, findTabElement } from './activationDirection';
import { createMountedPanels } from './createMountedPanels';
import type { TabsTab } from '../tab/TabsTab';

/** Groups tabs and their panels. Renders a div. */
export function TabsRoot(componentProps: TabsRoot.Props) {
  const elementProps = omit(componentProps, 'class', 'style', 'render', 'value', 'defaultValue', 'onValueChange', 'orientation');
  const initialDefault = untrack(() => componentProps.defaultValue === undefined ? 0 : componentProps.defaultValue);
  const explicitDefault = untrack(() => componentProps.defaultValue !== undefined);
  const selection = createControlled<TabsTab.Value, TabsRoot.ChangeEventDetails>({
    value: () => componentProps.value,
    get defaultValue() { return componentProps.defaultValue === undefined ? 0 : componentProps.defaultValue; },
    name: 'Tabs', state: 'value',
    // Automatic consistency writes are queued before notifying, and cannot be canceled.
    onChange: () => (next, details) => {
      if (details.reason === 'none') componentProps.onValueChange?.(next, details);
    },
  });
  const orientation = () => componentProps.orientation ?? 'horizontal';
  const [tabMap, setTabMap] = createSignal<TabMap>(new Map());
  const panels = createMountedPanels();
  const [automaticSelection, setAutomaticSelection] = createSignal<{ value: TabsTab.Value }>();
  // Keep transition history in the memo's previous output. Relaying it through
  // an effect exposes the new selection with the previous direction for a flush.
  const activation = createMemo<{
    previousValue: TabsTab.Value;
    direction: TabsTab.ActivationDirection;
    automatic: { value: TabsTab.Value } | undefined;
  }>((previous) => {
    const value = selection.value();
    const map = tabMap();
    const automatic = automaticSelection();
    if (!previous || (automatic !== previous.automatic && automatic?.value === value)) {
      return { previousValue: value, direction: 'none', automatic };
    }
    const previousValue = previous.previousValue !== value && previous.previousValue != null &&
      value != null && findTabElement(map, value) == null ? previous.previousValue : value;
    const direction = previous.previousValue === value ? previous.direction :
      computeActivationDirection(previous.previousValue, value, orientation(), map);
    if (previousValue === previous.previousValue && direction === previous.direction && automatic === previous.automatic) return previous;
    return {
      previousValue, direction, automatic,
    };
  }, { name: 'Tabs.activation' });
  let notifyInitial = !explicitDefault;
  let honorDisabledDefault = explicitDefault;
  let didRegister = false;
  let lastKnownTab: Node | undefined;
  createEffect(() => ({ map: tabMap(), value: selection.value(), controlled: selection.controlled }), ({ map, value, controlled }) => {
    if (controlled) return;
    function automatic(next: TabsTab.Value, reason: TabsRoot.ChangeEventReason) {
      const details = createChangeEventDetails(reason, undefined, undefined, { activationDirection: 'none' as const });
      selection.request(next, details);
      setAutomaticSelection({ value: next });
      untrack(() => componentProps.onValueChange?.(next, details));
      notifyInitial = false;
    }
    if (map.size === 0) {
      if (didRegister && value !== null && !lastKnownTab?.isConnected) automatic(null, 'missing');
      return;
    }
    didRegister = true;
    lastKnownTab = map.keys().next().value;
    const selected = Array.from(map.values()).find((item) => item.value === value);
    const disabled = selected?.disabled;
    if (!disabled && value === initialDefault) honorDisabledDefault = false;
    if (honorDisabledDefault && disabled && value === initialDefault) return;
    if (disabled || (selected == null && value !== null)) {
      const next = Array.from(map.values()).find((item) => !item.disabled)?.value ?? null;
      if (value === next) { notifyInitial = false; return; }
      automatic(next, notifyInitial ? 'initial' : disabled ? 'disabled' : 'missing');
    } else if (notifyInitial && selected) {
      untrack(() => componentProps.onValueChange?.(value, createChangeEventDetails('initial', undefined, undefined, { activationDirection: 'none' })));
      notifyInitial = false;
    }
  });
  const context: TabsRootContext = {
    get value() { return selection.value(); },
    get orientation() { return orientation(); },
    get tabActivationDirection() { return activation().direction; },
    setTabMap,
    onValueChange(next, details) {
      details.activationDirection = computeActivationDirection(selection.value(), next, orientation(), tabMap());
      selection.request(next, details);
    },
    getTabElementBySelectedValue: (value) => findTabElement(tabMap(), value),
    getTabIdByPanelValue: (value) => Array.from(tabMap().values()).find((item) => item.value === value)?.id,
    getTabPanelIdByValue: panels.getId,
    registerTabPanel: panels.register,
  };
  const state: TabsRootState = {
    get orientation() { return orientation(); },
    get tabActivationDirection() { return activation().direction; },
  };
  const panelElements = { current: [] as (HTMLElement | null)[] };
  return <TabsRootContext value={context}>
    <CompositeList elementsRef={panelElements}>
      {createRenderElement('div', componentProps, { state, props: elementProps, stateAttributesMapping: tabsStateAttributesMapping })}
    </CompositeList>
  </TabsRootContext>;
}

export type TabsRootOrientation = 'horizontal' | 'vertical';
export interface TabsRootState { orientation: TabsRootOrientation; tabActivationDirection: TabsTab.ActivationDirection }
export interface TabsRootProps extends BaseUIComponentProps<'div', TabsRootState> {
  value?: TabsTab.Value;
  defaultValue?: TabsTab.Value;
  orientation?: TabsRootOrientation;
  onValueChange?: (value: TabsTab.Value, details: TabsRootChangeEventDetails) => void;
}
export type TabsRootChangeEventReason = 'none' | 'disabled' | 'missing' | 'initial';
export type TabsRootChangeEventDetails = BaseUIChangeEventDetails<TabsRootChangeEventReason, { activationDirection: TabsTab.ActivationDirection }>;
export namespace TabsRoot {
  export type Props = TabsRootProps;
  export type State = TabsRootState;
  export type Orientation = TabsRootOrientation;
  export type ChangeEventReason = TabsRootChangeEventReason;
  export type ChangeEventDetails = TabsRootChangeEventDetails;
}
