import { onCleanup } from 'solid-js';
import { ownerDocument } from './owner';
import { makeEventPreventable } from '../merge-props';
export interface UseMixedToggleClickHandlerParameters { enabled?: boolean; mouseDownAction: 'open' | 'close'; open: boolean }
export interface UseMixedToggleClickHandlerState {}
export function createMixedToggleClickHandler(params: UseMixedToggleClickHandlerParameters) {
  let ignore = false;
  let remove: (() => void) | undefined;
  onCleanup(() => { remove?.(); ignore = false; });
  return {
    onMouseDown(event: MouseEvent) {
      if (params.enabled === false) return;
      if ((params.mouseDownAction === 'open' && !params.open) || (params.mouseDownAction === 'close' && params.open)) {
        ignore = true;
        remove?.();
        const document = ownerDocument(event.currentTarget as Element);
        const reset = () => { ignore = false; remove = undefined; };
        document.addEventListener('click', reset, { once: true });
        remove = () => document.removeEventListener('click', reset);
      }
    },
    onClick(event: MouseEvent) {
      if (params.enabled !== false && ignore) { ignore = false; makeEventPreventable(event).preventBaseUIHandler(); }
    },
  };
}
export { createMixedToggleClickHandler as useMixedToggleClickHandler };
