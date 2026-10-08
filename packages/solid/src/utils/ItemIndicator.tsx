import { createSignal, omit, untrack } from 'solid-js';
import type { JSX } from '@solidjs/web';
import type { BaseUIComponentProps, TransitionStatus } from '../internals/types';
import { createTransitionStatus } from '../internals/createTransitionStatus';
import { createOpenChangeComplete } from '../internals/createOpenChangeComplete';
import { createRenderElement } from '../internals/createRenderElement';
import { transitionStatusMapping } from '../internals/stateAttributesMapping';
export interface ItemIndicatorState { selected: boolean; transitionStatus: TransitionStatus }
export interface ItemIndicatorProps extends BaseUIComponentProps<'span', ItemIndicatorState> { selected: boolean; keepMounted?: boolean | undefined }
export function ItemIndicator(props: ItemIndicatorProps): JSX.Element {
  const [element, setElement] = createSignal<HTMLElement | null>(null);
  const status = createTransitionStatus(() => props.selected);
  const state: ItemIndicatorState = { get selected() { return props.selected; }, get transitionStatus() { return status.transitionStatus; } };
  createOpenChangeComplete({ batch: true, enabled: () => !props.selected, open: () => props.selected, ref: element,
    onComplete() { if (!untrack(() => props.selected)) status.setMounted(false); } });
  return createRenderElement<ItemIndicatorState, HTMLSpanElement>('span', props, { state, get ref() { return [props.ref, setElement]; },
    props: [{ 'aria-hidden': 'true', children: '✔️' }, omit(props, 'render', 'class', 'style', 'ref', 'selected', 'keepMounted')], stateAttributesMapping: transitionStatusMapping });
}
