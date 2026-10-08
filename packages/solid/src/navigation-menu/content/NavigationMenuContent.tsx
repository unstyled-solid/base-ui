import { createEffect, createSignal, omit, onSettled, Show } from 'solid-js';
import { Portal, type JSX } from '@solidjs/web';
import { CompositeRoot } from '../../internals/composite';
import { createTransitionStatus } from '../../internals/createTransitionStatus';
import { createOpenChangeComplete } from '../../internals/createOpenChangeComplete';
import type { BaseUIComponentProps } from '../../internals/types';
import type { TransitionStatus } from '../../internals/contracts/core';
import { contains, getTarget } from '../../floating-ui-react/utils/element';
import { useNavigationMenuRootContext } from '../root/NavigationMenuRootContext';
import { useNavigationMenuItemContext } from '../item/NavigationMenuItemContext';
import { popupTransitionStateMapping } from '../../utils/popupStateMapping';

export function NavigationMenuContent(props: NavigationMenuContent.Props) {
  const root = useNavigationMenuRootContext(); const item = useNavigationMenuItemContext();
  const [element, setElement] = createSignal<HTMLElement | null>(null, { ownedWrite: true });
  const [focusInside, setFocusInside] = createSignal(false);
  const [hasPortaled, setHasPortaled] = createSignal(false);
  const open = () => root.mounted && root.open && root.value === item.value;
  const target = () => root.viewportTargetElement ?? root.viewportElement;
  const presence = createTransitionStatus(open);
  onSettled(() => root.registerContent({ get value() { return item.value; }, get element() { return element(); } }));
  createOpenChangeComplete({ ref: element, open, onComplete: () => { if (!open()) presence.setMounted(false); } });
  createEffect(() => root.mounted, (mounted) => { if (!mounted) presence.setMounted(false); });
  createEffect(target, (container) => { if (container) setHasPortaled(true); });
  const state: NavigationMenuContent.State = { get open() { return open(); }, get transitionStatus() { return presence.transitionStatus; }, get activationDirection() { return root.activationDirection; } };
  const rest = omit(props, 'keepMounted', 'class', 'style', 'render', 'ref');
  const defaults: JSX.HTMLAttributes<HTMLDivElement> = {
    get hidden() { return !target() || !presence.mounted; },
    get inert() { return !open() && presence.mounted && !focusInside(); },
    get style(): JSX.CSSProperties | undefined { return !open() && presence.mounted ? { position: 'absolute', top: '0', left: '0' } : undefined; },
    onFocusIn(event) { if (!(getTarget(event) as Element | null)?.hasAttribute('data-base-ui-focus-guard')) setFocusInside(true); },
    onFocusOut(event) { if (!contains(event.currentTarget, event.relatedTarget as Element | null)) setFocusInside(false); },
  };
  const mapping = { ...popupTransitionStateMapping, activationDirection: (value: NavigationMenuContent.State['activationDirection']) => value ? { 'data-activation-direction': value } : null };
  const host = () => <CompositeRoot render={props.render} class={props.class} style={props.style}
    state={state} refs={[props.ref, setElement]} stateAttributesMapping={mapping} props={[defaults, rest]} />;
  return <Show when={target()} fallback={<Show when={props.keepMounted && !hasPortaled()}>{host()}</Show>}>
    {(container) => <Portal mount={container()}><Show when={presence.mounted || props.keepMounted}>{host()}</Show></Portal>}
  </Show>;
}
export interface NavigationMenuContentState { open: boolean; transitionStatus: TransitionStatus; activationDirection: 'left' | 'right' | 'up' | 'down' | null }
export interface NavigationMenuContentProps extends BaseUIComponentProps<'div', NavigationMenuContentState> { keepMounted?: boolean }
export namespace NavigationMenuContent { export type State = NavigationMenuContentState; export type Props = NavigationMenuContentProps }
