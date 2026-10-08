import { TabsRoot } from '../root/TabsRoot';
import { TabsList } from '../list/TabsList';
import { TabsTab } from '../tab/TabsTab';
import { TabsPanel } from '../panel/TabsPanel';
export const Tabs = { Root: TabsRoot, List: TabsList, Tab: TabsTab, Panel: TabsPanel };
export function TabsFixture(props: TabsRoot.Props & { disabled?: boolean; keepMounted?: boolean; showFirst?: boolean; activateOnFocus?: boolean }) {
  return <TabsRoot value={props.value} defaultValue={props.defaultValue} onValueChange={props.onValueChange}
    orientation={props.orientation} data-testid="root" class={props.class}>
    <TabsList activateOnFocus={props.activateOnFocus}>
      {props.showFirst !== false && <TabsTab value={0} disabled={props.disabled}>Zero</TabsTab>}
      <TabsTab value={1}>One</TabsTab>
      <TabsTab value={2}>Two</TabsTab>
    </TabsList>
    <TabsPanel value={0} keepMounted={props.keepMounted}>Panel zero</TabsPanel>
    <TabsPanel value={1} keepMounted={props.keepMounted}>Panel one</TabsPanel>
    <TabsPanel value={2} keepMounted={props.keepMounted}>Panel two</TabsPanel>
  </TabsRoot>;
}
