import { createEffect, createSignal, omit } from 'solid-js';
import { createRenderElement } from '../../internals/createRenderElement';
import type { BaseUIComponentProps } from '../../internals/types';
import { useDrawerProviderContext } from '../provider/DrawerProviderContext';

export function DrawerIndent(props: DrawerIndentProps) {
  const provider = useDrawerProviderContext();
  const [element, setElement] = createSignal<HTMLDivElement | null>(null);
  const state = { get active() { return provider?.active ?? false; } };
  createEffect(element, node => {
    if (!node || !provider) return;
    function sync() {
      const { swipeProgress, frontmostHeight } = provider!.visualStateStore.getSnapshot();
      node!.style.setProperty('--drawer-swipe-progress', `${Math.max(0, swipeProgress)}`);
      if (frontmostHeight > 0) node!.style.setProperty('--drawer-height', `${frontmostHeight}px`);
      else node!.style.removeProperty('--drawer-height');
    }
    sync();
    const dispose = provider.visualStateStore.subscribe(sync);
    return () => { dispose(); node.style.setProperty('--drawer-swipe-progress', '0'); node.style.removeProperty('--drawer-height'); };
  });
  return createRenderElement('div', props, {
    state, ref: setElement,
    stateAttributesMapping: { active: value => ({ [value ? 'data-active' : 'data-inactive']: '' }) },
    props: [{ style: { '--drawer-swipe-progress': '0' } }, omit(props, 'render', 'class', 'style')],
  });
}
export interface DrawerIndentState { active: boolean }
export interface DrawerIndentProps extends BaseUIComponentProps<'div', DrawerIndentState> {}
export namespace DrawerIndent { export type Props = DrawerIndentProps; export type State = DrawerIndentState; }
