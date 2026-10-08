import { omit } from 'solid-js';
import type { BaseUIComponentProps } from '../../internals/types';
import { createRenderElement } from '../../internals/createRenderElement';
import { createButton } from '../../internals/use-button';
import { createTransitionStatus, type TransitionStatus } from '../../internals/createTransitionStatus';
import { createAnimationsFinished } from '../../internals/createAnimationsFinished';
import { transitionStatusMapping } from '../../internals/stateAttributesMapping';
import { createChangeEventDetails } from '../../internals/createBaseUIEventDetails';
import { useComboboxRootContext } from '../root/ComboboxRootContext';
import { triggerStateAttributesMapping } from '../utils/stateAttributesMapping';
import { triggerOpenStateMapping } from '../../utils/popupStateMapping';
export interface ComboboxClearState { open: boolean; disabled: boolean; visible: boolean; transitionStatus: TransitionStatus }
export interface ComboboxClearProps extends BaseUIComponentProps<'button', ComboboxClearState> { disabled?: boolean; nativeButton?: boolean; keepMounted?: boolean }
export function ComboboxClear(props: ComboboxClearProps) {
  const model = useComboboxRootContext();
  const visible = () => model.state.selectionMode === 'none' ? model.state.inputValue !== '' : model.state.selectionMode === 'multiple' ? model.state.hasSelectionChips : model.state.hasSelectedValue;
  const transition = createTransitionStatus(visible);
  const disabled = () => Boolean(props.disabled || model.state.disabled);
  const button = createButton({ get native() { return props.nativeButton ?? true; }, get disabled() { return disabled(); } });
  createAnimationsFinished({ element: () => model.context.clearRef.current, enabled: () => !visible(), onFinished() { transition.setMounted(false); } });
  const state: ComboboxClearState = { get open() { return model.state.open; }, get disabled() { return disabled(); }, get visible() { return visible(); }, get transitionStatus() { return transition.transitionStatus; } };
  return createRenderElement('button', props, { state, get enabled() { return props.keepMounted || transition.mounted; },
    get ref() { return [props.ref, button.buttonRef, model.context.clearRef]; }, stateAttributesMapping: { ...transitionStatusMapping, ...triggerOpenStateMapping },
    props: [{ tabIndex: -1, children: 'x', onMouseDown(event: MouseEvent) { event.preventDefault(); },
      onClick(event: MouseEvent) {
        if (disabled() || model.state.readOnly) return;
        model.context.setInputValue('', createChangeEventDetails('clear-press', event));
        if (model.state.selectionMode !== 'none') model.context.setSelectedValue(model.state.selectionMode === 'multiple' ? [] : null, createChangeEventDetails('clear-press', event));
        model.context.setIndices({ activeIndex: null, ...(model.state.selectionMode !== 'none' ? { selectedIndex: null } : {}), event, type: 'pointer' }); model.state.inputElement?.focus();
      },
    }, omit(props, 'class', 'style', 'render', 'ref', 'disabled', 'nativeButton', 'keepMounted'), button.getButtonProps],
  });
}
export namespace ComboboxClear { export type Props = ComboboxClearProps; export type State = ComboboxClearState }
