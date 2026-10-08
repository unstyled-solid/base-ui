import { createMemo, createSignal, onSettled, omit } from 'solid-js';
import { script } from '#prehydration/tabs/indicator';
import { PrehydrationScript } from '../../internals/PrehydrationScript';
import { createRenderElement } from '../../internals/createRenderElement';
import type { BaseUIComponentProps } from '../../internals/types';
import { useTabsRootContext } from '../root/TabsRootContext';
import { useTabsListContext } from '../list/TabsListContext';
import { tabsStateAttributesMapping } from '../root/stateAttributesMapping';
import type { TabsRootState } from '../root/TabsRoot';
import type { TabsTab } from '../tab/TabsTab';
import { measureActiveTab } from './measureActiveTab';

const stateAttributesMapping = { ...tabsStateAttributesMapping, activeTabPosition: null, activeTabSize: null };
/** Measures the selected tab in layout coordinates, retaining subpixel precision when safe. */
export function TabsIndicator(componentProps: TabsIndicator.Props) {
  const elementProps = omit(componentProps, 'class', 'style', 'render', 'renderBeforeHydration');
  const root = useTabsRootContext();
  const list = useTabsListContext();
  const [revision, update] = createSignal(0);
  onSettled(() => list.registerIndicatorUpdateListener(() => update((value) => value + 1)));
  const measurement = createMemo(() => {
    revision();
    const listElement = list.tabsListElement;
    const tab = root.value != null ? root.getTabElementBySelectedValue(root.value) : null;
    return tab && listElement ? measureActiveTab(tab, listElement) : null;
  }, { transparent: true });
  const state: TabsIndicatorState = {
    get orientation() { return root.orientation; }, get tabActivationDirection() { return root.tabActivationDirection; },
    get activeTabPosition() { return measurement()?.position ?? null; },
    get activeTabSize() { return measurement()?.size ?? null; },
  };
  return <>
    {createRenderElement('span', componentProps, {
      state, get enabled() { return root.value != null; },
      props: [{ role: 'presentation',
        get hidden() { const size = measurement()?.size; return !size || size.width <= 0 || size.height <= 0; },
        get style() {
          const result = measurement();
          if (!result) return undefined;
          return {
            '--active-tab-left': `${result.position.left}px`, '--active-tab-right': `${result.position.right}px`,
            '--active-tab-top': `${result.position.top}px`, '--active-tab-bottom': `${result.position.bottom}px`,
            '--active-tab-width': `${result.size.width}px`, '--active-tab-height': `${result.size.height}px`,
          };
        },
      }, elementProps], stateAttributesMapping,
    })}
    {root.value != null && componentProps.renderBeforeHydration && <PrehydrationScript script={script} />}
  </>;
}
export interface TabsIndicatorState extends TabsRootState { activeTabPosition: TabsTab.Position | null; activeTabSize: TabsTab.Size | null }
export interface TabsIndicatorProps extends BaseUIComponentProps<'span', TabsIndicatorState> { renderBeforeHydration?: boolean }
export namespace TabsIndicator { export type Props = TabsIndicatorProps; export type State = TabsIndicatorState; }
