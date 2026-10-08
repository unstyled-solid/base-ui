import { createMemo, createSignal, omit } from 'solid-js';
import type { BaseUIComponentProps } from '../../internals/types';
import { createBaseUiId } from '../../internals/createBaseUiId';
import { createCompositeListItem } from '../../internals/composite';
import { createTransitionStatus, type TransitionStatus } from '../../internals/createTransitionStatus';
import { createOpenChangeComplete } from '../../internals/createOpenChangeComplete';
import { createRenderElement } from '../../internals/createRenderElement';
import { transitionStatusMapping } from '../../internals/stateAttributesMapping';
import { useTabsRootContext } from '../root/TabsRootContext';
import type { TabsRootState } from '../root/TabsRoot';
import type { TabsTab } from '../tab/TabsTab';
import { tabsStateAttributesMapping } from '../root/stateAttributesMapping';
import { samePanelRegistration } from '../root/createMountedPanels';

const stateAttributesMapping = { ...tabsStateAttributesMapping, ...transitionStatusMapping };
/** A panel retained until its exit animation completes. */
export function TabsPanel(componentProps: TabsPanel.Props) {
  const elementProps = omit(componentProps, 'class', 'style', 'render', 'ref', 'value', 'keepMounted');
  const root = useTabsRootContext();
  const id = createBaseUiId();
  const item = createCompositeListItem();
  const open = () => componentProps.value === root.value;
  const presence = createTransitionStatus(open);
  const [element, setElement] = createSignal<HTMLElement | null>(null);
  createOpenChangeComplete({
    open, ref: element,
    onComplete() { if (!open()) presence.setMounted(false); },
  });
  // Presence can recompute without changing hidden. Only source registration
  // dependencies may transfer ownership between panels sharing a value.
  const registration = createMemo(() => ({
    value: componentProps.value, id: id(), hidden: !presence.mounted,
    keepMounted: componentProps.keepMounted ?? false,
  }), { equals: samePanelRegistration, name: 'Tabs.panelRegistration' });
  root.registerTabPanel(registration);
  const state: TabsPanelState = {
    get hidden() { return !presence.mounted; }, get transitionStatus() { return presence.transitionStatus; },
    get orientation() { return root.orientation; }, get tabActivationDirection() { return root.tabActivationDirection; },
  };
  return createRenderElement('div', componentProps, {
    state, get enabled() { return (componentProps.keepMounted ?? false) || presence.mounted; },
    get ref() { return [componentProps.ref, item.ref, setElement]; },
    props: [{
      get id() { return id(); }, role: 'tabpanel',
      get 'aria-labelledby'() { return root.getTabIdByPanelValue(componentProps.value); },
      get hidden() { return !presence.mounted; }, get tabindex() { return open() ? 0 : -1; },
      get inert() { return !open(); }, get 'data-index'() { return item.index; },
    }, elementProps], stateAttributesMapping,
  });
}
export interface TabsPanelMetadata { id?: string; value: TabsTab.Value }
export interface TabsPanelState extends TabsRootState { hidden: boolean; transitionStatus: TransitionStatus }
export interface TabsPanelProps extends BaseUIComponentProps<'div', TabsPanelState> { value: TabsTab.Value; keepMounted?: boolean }
export namespace TabsPanel { export type Props = TabsPanelProps; export type State = TabsPanelState; export type Metadata = TabsPanelMetadata; }
