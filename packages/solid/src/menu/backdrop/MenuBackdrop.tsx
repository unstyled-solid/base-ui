import { createRenderElement } from '../../internals/createRenderElement';
import type { BaseUIComponentProps } from '../../internals/types';
import type { TransitionStatus } from '../../internals/contracts/core';
import { useMenuRootContext } from '../root/MenuRootContext';
import { elementProps } from '../utils/props';
import { popupMapping } from '../utils/stateAttributesMapping';
import { createEffect, createSignal } from 'solid-js';
import { useContextMenuRootContext } from '../host/MenuHostContexts';
export interface MenuBackdropState { open: boolean; transitionStatus: TransitionStatus }
export interface MenuBackdropProps extends BaseUIComponentProps<'div', MenuBackdropState> {}
export function MenuBackdrop(props: MenuBackdropProps) {
  const { store } = useMenuRootContext();
  const host = useContextMenuRootContext(true);
  const [element, setElement] = createSignal<HTMLDivElement | null>(null);
  createEffect(element, node => {
    if (!host) return;
    host.backdropRef.current = node;
    return () => { if (host.backdropRef.current === node) host.backdropRef.current = null; };
  });
  return createRenderElement('div', props, { get ref() { return [props.ref, setElement]; }, state: {
    get open() { return store.state.open; }, get transitionStatus() { return store.state.transitionStatus; },
  }, stateAttributesMapping: popupMapping, get props() { return [{ role: 'presentation',
    get hidden() { return !store.state.mounted; },
    get style() { return { 'pointer-events': store.state.openChangeReason === 'trigger-hover' ? 'none' : undefined, 'user-select': 'none', '-webkit-user-select': 'none' } as const; },
  }, elementProps(props, [])]; } });
}
export namespace MenuBackdrop { export type Props = MenuBackdropProps; export type State = MenuBackdropState }
