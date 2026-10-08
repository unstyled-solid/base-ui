import { createRenderElement } from '../../internals/createRenderElement';
import type { BaseUIComponentProps, TransitionStatus } from '../../internals/types';
import { useDialogRootContext } from '../../dialog/root/DialogRootContext';
export function DrawerBackdrop(props: DrawerBackdropProps) {
  const store = useDialogRootContext();
  return createRenderElement<DrawerBackdropState, HTMLElement, 'div', boolean>('div', props, {
    ref: store.setBackdropElement,
    get enabled() { return props.forceRender || !store.state.nested; },
    state: { get open() { return store.state.open; }, get transitionStatus() { return store.state.transitionStatus; } },
    stateAttributesMapping: {
      open: value => ({ [value ? 'data-open' : 'data-closed']: '' }),
      transitionStatus: (value): Record<string, string> | null => value === 'starting' ? { 'data-starting-style': '' } : value === 'ending' ? { 'data-ending-style': '' } : null,
    },
    props: [{ role: 'presentation', get hidden() { return !store.state.mounted; }, get style() { return { 'pointer-events': store.state.open ? undefined : 'none', 'user-select': 'none', '-webkit-user-select': 'none', '--drawer-swipe-progress': '0', '--drawer-swipe-strength': '1' }; } }, omit(props, 'render', 'class', 'style', 'forceRender')],
  });
}
export interface DrawerBackdropState { open: boolean; transitionStatus: TransitionStatus }
export interface DrawerBackdropProps extends BaseUIComponentProps<'div', DrawerBackdropState> { forceRender?: boolean }
export namespace DrawerBackdrop { export type Props = DrawerBackdropProps; export type State = DrawerBackdropState; }
import { omit } from 'solid-js';
