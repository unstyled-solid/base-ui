import { createSignal, omit } from 'solid-js';
import type { BaseUIComponentProps, TransitionStatus } from '../../internals/types';
import { createRenderElement } from '../../internals/createRenderElement';
import { createTransitionStatus } from '../../internals/createTransitionStatus';
import { createOpenChangeComplete } from '../../internals/createOpenChangeComplete';
import { useRadioRootContext } from '../root/RadioRootContext';
import type { RadioRootState } from '../root/RadioRoot';
import { stateAttributesMapping } from '../utils/stateAttributesMapping';

/** Indicates selection, retaining the host until its exit animation completes. */
export function RadioIndicator(props: RadioIndicatorProps) {
  const root = useRadioRootContext();
  const presence = createTransitionStatus(() => root.checked);
  const [element, setElement] = createSignal<HTMLSpanElement | null>(null);
  const state: RadioIndicatorState = {
    get checked() { return root.checked; },
    get disabled() { return root.disabled; },
    get readOnly() { return root.readOnly; },
    get required() { return root.required; },
    get touched() { return root.touched; },
    get dirty() { return root.dirty; },
    get valid() { return root.valid; },
    get filled() { return root.filled; },
    get focused() { return root.focused; },
    get transitionStatus() { return presence.transitionStatus; },
  };
  createOpenChangeComplete({
    ref: element,
    batch: true,
    enabled: () => !root.checked,
    open: () => root.checked,
    onComplete() { if (!root.checked) presence.setMounted(false); },
  });
  return createRenderElement('span', props, {
    get enabled() { return props.keepMounted || presence.mounted; },
    state,
    get ref() { return [props.ref, setElement]; },
    props: omit(props, 'keepMounted', 'render', 'class', 'style', 'ref'),
    stateAttributesMapping,
  });
}
export interface RadioIndicatorProps extends BaseUIComponentProps<'span', RadioIndicatorState> {
  keepMounted?: boolean;
}
export interface RadioIndicatorState extends RadioRootState { transitionStatus: TransitionStatus }
export namespace RadioIndicator {
  export type Props = RadioIndicatorProps;
  export type State = RadioIndicatorState;
}
