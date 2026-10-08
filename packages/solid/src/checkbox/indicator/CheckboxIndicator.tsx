import { createSignal, omit, untrack } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { useCheckboxRootContext } from '../root/CheckboxRootContext';
import type { CheckboxRootState } from '../root/CheckboxRoot';
import { getCheckboxStateAttributesMapping } from '../utils/getCheckboxStateAttributesMapping';
import { createRenderElement } from '../../internals/createRenderElement';
import { createTransitionStatus, type TransitionStatus } from '../../internals/createTransitionStatus';
import { createOpenChangeComplete } from '../../internals/createOpenChangeComplete';
import { transitionStatusMapping } from '../../internals/stateAttributesMapping';
import type { BaseUIComponentProps } from '../../internals/types';

export interface CheckboxIndicatorState extends CheckboxRootState { transitionStatus: TransitionStatus }
export interface CheckboxIndicatorProps extends BaseUIComponentProps<'span', CheckboxIndicatorState> {
  keepMounted?: boolean | undefined;
}
export function CheckboxIndicator(props: CheckboxIndicatorProps): JSX.Element {
  const elementProps = omit(props, 'keepMounted', 'class', 'style', 'render', 'ref');
  const root = useCheckboxRootContext();
  const rendered = () => root.checked || root.indeterminate;
  const transition = createTransitionStatus(rendered);
  const [element, setElement] = createSignal<HTMLElement | null>(null);
  const state: CheckboxIndicatorState = {
    get checked() { return root.checked; }, get indeterminate() { return root.indeterminate; },
    get disabled() { return root.disabled; }, get readOnly() { return root.readOnly; },
    get required() { return root.required; }, get valid() { return root.valid; },
    get touched() { return root.touched; }, get dirty() { return root.dirty; },
    get filled() { return root.filled; }, get focused() { return root.focused; },
    get transitionStatus() { return transition.transitionStatus; },
  };
  createOpenChangeComplete({
    batch: true, enabled: () => !rendered(), open: rendered, ref: element,
    onComplete() { if (!untrack(rendered)) transition.setMounted(false); },
  });
  return createRenderElement('span', props, {
    get enabled() { return Boolean(props.keepMounted || transition.mounted); },
    get ref() { return [setElement, props.ref]; },
    state, props: elementProps,
    stateAttributesMapping: { ...getCheckboxStateAttributesMapping(root), ...transitionStatusMapping },
  });
}
export namespace CheckboxIndicator {
  export type Props = CheckboxIndicatorProps;
  export type State = CheckboxIndicatorState;
}
