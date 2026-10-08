import { createContext, useContext, type Accessor } from 'solid-js';
import type { CompositeMetadata } from '../../internals/contracts/items';
import type { TabsRoot } from './TabsRoot';
import type { TabsTab } from '../tab/TabsTab';
import type { PanelRegistration } from './createMountedPanels';

export type TabMap = Map<Node, CompositeMetadata<TabsTab.Metadata>>;
export interface TabsRootContext {
  readonly value: TabsTab.Value;
  readonly orientation: TabsRoot.Orientation;
  readonly tabActivationDirection: TabsTab.ActivationDirection;
  setTabMap(map: TabMap): void;
  onValueChange(value: TabsTab.Value, details: TabsRoot.ChangeEventDetails): void;
  getTabElementBySelectedValue(value: TabsTab.Value): HTMLElement | null;
  getTabIdByPanelValue(value: TabsTab.Value): string | undefined;
  getTabPanelIdByValue(value: TabsTab.Value): string | undefined;
  registerTabPanel(policy: Accessor<PanelRegistration>): void;
}
export const TabsRootContext = createContext<TabsRootContext>();
export function useTabsRootContext() { return useContext(TabsRootContext); }
