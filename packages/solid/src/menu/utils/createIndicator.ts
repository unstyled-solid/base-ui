import { createSignal } from 'solid-js';
import { createTransitionStatus, type TransitionStatus } from '../../internals/createTransitionStatus';
import { createOpenChangeComplete } from '../../internals/createOpenChangeComplete';
import { createRenderElement } from '../../internals/createRenderElement';
import type { BaseUIComponentProps } from '../../internals/types';
import { itemMapping, popupMapping } from './stateAttributesMapping';
import { elementProps } from './props';
export interface MenuIndicatorState { checked: boolean; disabled: boolean; highlighted: boolean; transitionStatus: TransitionStatus }
export interface MenuIndicatorProps extends BaseUIComponentProps<'span', MenuIndicatorState> { keepMounted?: boolean }
export function createIndicator(props: MenuIndicatorProps, item: Omit<MenuIndicatorState, 'transitionStatus'>) {
  const [element, setElement] = createSignal<HTMLElement | null>(null);
  const transition = createTransitionStatus(() => item.checked);
  createOpenChangeComplete({ ref: element, open: () => item.checked, enabled: () => !item.checked,
    batch: true, onComplete() { if (!item.checked) transition.setMounted(false); } });
  const state: MenuIndicatorState = {
    get checked() { return item.checked; }, get disabled() { return item.disabled; },
    get highlighted() { return item.highlighted; }, get transitionStatus() { return transition.transitionStatus; },
  };
  return createRenderElement('span', props, { state,
    stateAttributesMapping: { ...itemMapping, transitionStatus: popupMapping.transitionStatus },
    get ref() { return [props.ref, setElement]; }, get enabled() { return props.keepMounted || transition.mounted; },
    props: [{ 'aria-hidden': true }, elementProps(props, ['keepMounted'])],
  });
}
