import { onCleanup } from 'solid-js';
import type { PopupModel } from './createPopup';
import type { HTMLProps } from '../../internals/types';
export interface PopupInteractionProps { activeTriggerProps?: Omit<HTMLProps, 'ref'> | undefined; inactiveTriggerProps?: Omit<HTMLProps, 'ref'> | undefined; popupProps?: Omit<HTMLProps, 'ref'> | undefined }
export function createPopupInteractionProps<P>(model: PopupModel<P>, props: PopupInteractionProps): void {
  model.setInteractionProps({ get reference() { return props.activeTriggerProps; }, get trigger() { return props.inactiveTriggerProps; }, get floating() { return props.popupProps; } });
  onCleanup(() => model.setInteractionProps({}));
}
