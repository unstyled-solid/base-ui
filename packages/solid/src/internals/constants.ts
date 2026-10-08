import type { JSX } from '@solidjs/web';
export const TYPEAHEAD_RESET_MS = 500;
export const PATIENT_CLICK_THRESHOLD = 500;
export const DISABLED_TRANSITIONS_STYLE = { style: { transition: 'none' } };
export const CLICK_TRIGGER_IDENTIFIER = 'data-base-ui-click-trigger';
export const BASE_UI_SWIPE_IGNORE_ATTRIBUTE = 'data-base-ui-swipe-ignore';
export const LEGACY_SWIPE_IGNORE_ATTRIBUTE = 'data-swipe-ignore';
export const BASE_UI_SWIPE_IGNORE_SELECTOR = `[${BASE_UI_SWIPE_IGNORE_ATTRIBUTE}]`;
export const LEGACY_SWIPE_IGNORE_SELECTOR = `[${LEGACY_SWIPE_IGNORE_ATTRIBUTE}]`;
export const DROPDOWN_COLLISION_AVOIDANCE = { fallbackAxisSide: 'none' } as const;
export const POPUP_COLLISION_AVOIDANCE = { fallbackAxisSide: 'end' } as const;
/** Empty aria-owns owner styling for iOS/Safari/VoiceControl accessibility.
 * https://github.com/floating-ui/floating-ui/issues/3403 */
export const ownerVisuallyHidden: JSX.CSSProperties = {
  'clip-path': 'inset(50%)', position: 'fixed', top: '0', left: '0',
};
