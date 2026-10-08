import { createMemo, merge, omit, type Accessor } from 'solid-js';
import type { BaseUIComponentProps, TransitionStatus } from '../../internals/types';
import { createRenderElement } from '../../internals/createRenderElement';
import { createRenderedId } from '../../internals/resolveRenderedId';
import { FloatingFocusManager } from '../../floating-ui-react/components/FloatingFocusManager';
import { useDialogRootContext } from '../root/DialogRootContext';
import { useDialogPortalContext } from '../portal/DialogPortalContext';
import type { InteractionType } from '../store/DialogStore';
import { dialogStateAttributesMapping } from '../utils/stateAttributesMapping';
import { FOCUSABLE_POPUP_PROPS } from '../../utils/popups';

/** true/null callback results select defaults; false/undefined callback results leave focus alone.
 * An element accessor is the native ref target. Omitted initial focus defaults to popup on touch.
 */
export type DialogFocusTarget = boolean | { readonly current: HTMLElement | null } | Accessor<HTMLElement | null> | ((interaction: InteractionType) => boolean | HTMLElement | null | void);
export function DialogPopup(props: DialogPopupProps) {
  const store = useDialogRootContext();
  useDialogPortalContext();
  const [id, registerId] = createRenderedId(props, store.defaultFloatingId, store.setFloatingId);
  // React subscribes to the mounted selector, not the whole presence snapshot.
  // Entry-style frame changes must not re-arm initial focus while mounted stays
  // true. Narrow this derived scalar before passing it to the focus manager.
  const focusDisabled = createMemo(() => !store.state.mounted);
  const state: DialogPopupState = {
    get open() { return store.state.open; },
    get nested() { return store.state.nested; },
    get transitionStatus() { return store.state.transitionStatus; },
    get nestedDialogOpen() { return store.state.nestedOpenDialogCount > 0; },
  };
  // Keep the child-bearing source stable when dismiss/focus interaction props
  // settle. Recreating this view re-executes JSX children and can replace a
  // pressed Close or a nested Root before the native release reaches it.
  const elementProps = omit(props, 'class', 'style', 'render', 'initialFocus', 'finalFocus');
  const rootPopupProps = merge(() => store.state.popupProps);
  const defaults = {
    ...FOCUSABLE_POPUP_PROPS,
    get id() { return id(); },
    get role() { return store.state.role; },
    get 'aria-labelledby'() { return store.state.titleElementId; },
    get 'aria-describedby'() { return store.state.descriptionElementId; },
    get hidden() { return !store.state.mounted; },
    get style() { return { '--nested-dialogs': store.state.nestedOpenDialogCount }; },
    onKeyDown(event: KeyboardEvent) {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) event.stopPropagation();
    },
  };
  const element = createRenderElement<DialogPopupState, HTMLDivElement>('div', props, {
    state,
    ref: [store.setPopupElement, registerId],
    stateAttributesMapping: dialogStateAttributesMapping,
    props: [rootPopupProps, defaults, elementProps],
  });
  return <FloatingFocusManager
    context={store.state.floatingRootContext}
    openInteractionType={store.state.openMethod}
    disabled={focusDisabled()}
    closeOnFocusOut={!store.state.disablePointerDismissal}
    initialFocus={props.initialFocus === undefined ? (type: InteractionType) => type === 'touch' ? store.context.popupRef() : true : props.initialFocus}
    returnFocus={props.finalFocus}
    modal={store.state.modal !== false}
    restoreFocus="popup"
  >{element}</FloatingFocusManager>;
}
export interface DialogPopupState { open: boolean; transitionStatus: TransitionStatus; nested: boolean; nestedDialogOpen: boolean }
export interface DialogPopupProps extends BaseUIComponentProps<'div', DialogPopupState> { initialFocus?: DialogFocusTarget; finalFocus?: DialogFocusTarget; id?: string }
export namespace DialogPopup { export type Props = DialogPopupProps; export type State = DialogPopupState; }
