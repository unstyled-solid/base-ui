import { createEffect, createSignal, omit } from 'solid-js';
import { CompositeRoot } from '../../internals/composite';
import type { BaseUIComponentProps } from '../../internals/types';
import { ownerWindow } from '../../utils/owner';
import { useTabsRootContext } from '../root/TabsRootContext';
import type { TabsRootState } from '../root/TabsRoot';
import { tabsStateAttributesMapping } from '../root/stateAttributesMapping';
import { TabsListContext } from './TabsListContext';

/** Groups the tab buttons. Keyboard movement is owned by CompositeRoot. */
export function TabsList(componentProps: TabsList.Props) {
  const elementProps = omit(componentProps, 'activateOnFocus', 'loopFocus', 'render', 'class', 'style', 'ref');
  const root = useTabsRootContext();
  const [highlighted, setHighlighted] = createSignal(0);
  const [element, setElement] = createSignal<HTMLElement | null>(null);
  const listeners = new Set<() => void>();
  const observed = new Set<HTMLElement>();
  let observer: ResizeObserver | null = null;
  createEffect(element, (list) => {
    if (!list) return;
    const Resize = ownerWindow(list).ResizeObserver;
    if (!Resize) return;
    const current = new Resize(() => listeners.forEach((listener) => listener()));
    observer = current;
    current.observe(list);
    observed.forEach((tab) => current.observe(tab));
    return () => { current.disconnect(); if (observer === current) observer = null; };
  });
  const context: TabsListContext = {
    get activateOnFocus() { return componentProps.activateOnFocus ?? false; },
    get tabsListElement() { return element(); },
    registerIndicatorUpdateListener(listener) {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    registerTabResizeObserverElement(tab) {
      observed.add(tab);
      observer?.observe(tab);
      return () => { observed.delete(tab); observer?.unobserve(tab); };
    },
  };
  const state: TabsListState = {
    get orientation() { return root.orientation; },
    get tabActivationDirection() { return root.tabActivationDirection; },
  };
  return <TabsListContext value={context}>
    <CompositeRoot render={componentProps.render} class={componentProps.class} style={componentProps.style}
      state={state} refs={[componentProps.ref, setElement]}
      props={[{ role: 'tablist', get 'aria-orientation'() { return root.orientation === 'vertical' ? 'vertical' : undefined; } }, elementProps]}
      stateAttributesMapping={tabsStateAttributesMapping}
      highlightedIndex={highlighted()} onHighlightedIndexChange={setHighlighted}
      orientation={root.orientation} loopFocus={componentProps.loopFocus ?? true}
      enableHomeAndEndKeys onMapChange={root.setTabMap} disabledIndices={[]} />
  </TabsListContext>;
}
export interface TabsListState extends TabsRootState {}
export interface TabsListProps extends BaseUIComponentProps<'div', TabsListState> {
  activateOnFocus?: boolean;
  loopFocus?: boolean;
}
export namespace TabsList { export type State = TabsListState; export type Props = TabsListProps; }
