import { transitionStatusMapping } from '../internals/stateAttributesMapping';
export * as CommonPopupDataAttributes from './CommonPopupDataAttributes';
export * as CommonTriggerDataAttributes from './CommonTriggerDataAttributes';
export const triggerOpenStateMapping = { open: (value: boolean): Record<string, string> | null => value ? { 'data-popup-open': '' } : null };
export const pressableTriggerOpenStateMapping = { open: (value: boolean): Record<string, string> | null => value ? { 'data-popup-open': '', 'data-pressed': '' } : null };
export const popupStateMapping = {
  open: (value: boolean): Record<string, string> => value ? { 'data-open': '' } : { 'data-closed': '' },
  anchorHidden: (value: boolean): Record<string, string> | null => value ? { 'data-anchor-hidden': '' } : null,
};
export const popupTransitionStateMapping = { ...popupStateMapping, ...transitionStatusMapping };
