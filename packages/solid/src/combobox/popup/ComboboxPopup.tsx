import { createEffect, createSignal, merge, omit } from 'solid-js';
import type { BaseUIComponentProps } from '../../internals/types';
import type { TransitionStatus } from '../../internals/contracts/core';
import type { Side, Align } from '../../internals/createAnchorPositioning';
import { createRenderElement } from '../../internals/createRenderElement';
import { transitionStatusMapping } from '../../internals/stateAttributesMapping';
import { FloatingFocusManager, type FloatingFocusManagerProps } from '../../floating-ui-react/components/FloatingFocusManager';
import { useComboboxRootContext } from '../root/ComboboxRootContext';
import { useComboboxPositionerContext } from '../positioner/ComboboxPositionerContext';
import { popupStateMapping } from '../utils/stateAttributesMapping';
import { getComboboxPopupId } from '../root/utils';
import { ComboboxInternalDismissButton } from '../utils/ComboboxInternalDismissButton';
import { getDisabledMountTransitionStyles } from '../../internals/getDisabledMountTransitionStyles';
import { contains, getTarget } from '../../utils/shadowDom';
export interface ComboboxPopupState { open: boolean; side: Side; align: Align; anchorHidden: boolean; transitionStatus: TransitionStatus; empty: boolean }
export interface ComboboxPopupProps extends BaseUIComponentProps<'div', ComboboxPopupState> {
  initialFocus?: boolean | FloatingFocusManagerProps['initialFocus']; finalFocus?: FloatingFocusManagerProps['returnFocus'];
}
export function ComboboxPopup(props: ComboboxPopupProps) {
  const model = useComboboxRootContext();
  const positioning = useComboboxPositionerContext();
  const [element, setElement] = createSignal<HTMLDivElement | null>(null);
  const id = () => typeof props.id === 'string' ? props.id : model.state.inputInsidePopup ? getComboboxPopupId(model.state.id) : undefined;
  createEffect(() => ({ element: element(), id: id() }), ({ element, id }) => { model.setPopupId(element?.id || id); return () => { model.setPopupId(undefined); }; });
  const state: ComboboxPopupState = { get open() { return model.state.open; }, get side() { return positioning.side; }, get align() { return positioning.align; },
    get anchorHidden() { return positioning.anchorHidden; }, get transitionStatus() { return model.state.transitionStatus; }, get empty() { return !model.derived.filteredItems.length; } };
  const initialFocus = () => {
    return props.initialFocus ?? (model.state.inputInsidePopup ? () => model.state.openMethod === 'touch' ? element() : model.state.inputElement : false);
  };
  const setPopup = (element: HTMLDivElement | null) => { model.context.popupRef.current = element; model.popup.setPopupElement(element); };
  const defaults = { get id() { return id(); }, tabIndex: -1, 'data-base-ui-focusable': '',
    get role() { return model.state.inputInsidePopup ? 'dialog' : 'presentation'; },
    // React's onFocus bubbles; native focusin supplies the descendant-focus lane.
    onFocusIn(event: FocusEvent & { currentTarget: HTMLElement }) { if (model.state.openMethod !== 'touch' && (event.target === event.currentTarget || contains(model.state.listElement, getTarget(event) as Element | null))) model.state.inputElement?.focus(); },
  };
  const transitionStyles = { get style() { return getDisabledMountTransitionStyles(model.state.transitionStatus)?.style; } };
  return <FloatingFocusManager context={model.floating} disabled={!model.state.mounted} modal={!model.state.inputInsidePopup || model.state.modal}
    openInteractionType={model.state.openMethod ?? undefined}
    getInsideElements={() => [model.context.startDismissRef.current, model.context.endDismissRef.current]}
    initialFocus={initialFocus()} returnFocus={props.finalFocus ?? (model.state.inputInsidePopup ? undefined : false)}>
    {createRenderElement<ComboboxPopupState, HTMLDivElement>('div', props, { state, stateAttributesMapping: { ...popupStateMapping, ...transitionStatusMapping },
      get ref() { return [props.ref, setElement, setPopup]; },
      props: [merge(() => model.state.popupProps), defaults, transitionStyles, omit(props, 'class', 'style', 'render', 'ref', 'initialFocus', 'finalFocus', 'id')],
    })}
    {(!model.state.inputInsidePopup || model.state.modal) && <ComboboxInternalDismissButton ref={(element) => { model.context.endDismissRef.current = element; }} />}
  </FloatingFocusManager>;
}
export namespace ComboboxPopup { export type Props = ComboboxPopupProps; export type State = ComboboxPopupState }
