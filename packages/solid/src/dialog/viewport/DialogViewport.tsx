import { omit } from 'solid-js';
import type { BaseUIComponentProps } from '../../internals/types';
import { createRenderElement } from '../../internals/createRenderElement';
import { useDialogRootContext } from '../root/DialogRootContext';
import { useDialogPortalContext } from '../portal/DialogPortalContext';
import type { DialogPopupState } from '../popup/DialogPopup';
import { dialogStateAttributesMapping } from '../utils/stateAttributesMapping';

export function DialogViewport(props: DialogViewportProps) {
  const store = useDialogRootContext();
  const keepMounted = useDialogPortalContext();
  const state: DialogViewportState = {
    get open() { return store.state.open; },
    get nested() { return store.state.nested; },
    get transitionStatus() { return store.state.transitionStatus; },
    get nestedDialogOpen() { return store.state.nestedOpenDialogCount > 0; },
  };
  return createRenderElement<DialogViewportState, HTMLDivElement, 'div', boolean>('div', props, {
    state,
    get enabled() { return keepMounted() || store.state.mounted; },
    ref: store.setViewportElement,
    stateAttributesMapping: dialogStateAttributesMapping,
    props: [
      { role: 'presentation', get hidden() { return !store.state.mounted; }, get style() { return { 'pointer-events': store.state.open ? undefined : 'none' }; } },
      omit(props, 'class', 'style', 'render'),
    ],
  });
}
export interface DialogViewportState extends DialogPopupState {}
export interface DialogViewportProps extends BaseUIComponentProps<'div', DialogViewportState> {}
export namespace DialogViewport { export type Props = DialogViewportProps; export type State = DialogViewportState; }
