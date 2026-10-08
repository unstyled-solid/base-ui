export * from './createPopup';
export * from './popupHandle';
export * from './createNullPopupStore';
export * from './popupTriggerMap';
export * from './createTriggerDataForwarding';
export * from './createPopupInteractionProps';
export * from './createPopupViewport';
export * from './createTriggerFocusGuards';
export * from './createNullPopup';
export const FOCUSABLE_POPUP_PROPS = { tabindex: -1, 'data-base-ui-focusable': '' } as const;
export function createDefaultInitialFocus(popup: () => HTMLElement | null) { return (type: string) => type === 'touch' ? popup() : true; }
export type * from '../../internals/contracts/popup';
