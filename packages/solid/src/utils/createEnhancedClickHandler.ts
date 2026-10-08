import { untrack, type Accessor } from 'solid-js';
export type InteractionType = 'mouse' | 'touch' | 'pen' | 'keyboard' | '';
export function createEnhancedClickHandler(handler: Accessor<(event: MouseEvent | PointerEvent, interaction: InteractionType) => void>) {
  let last: InteractionType = '';
  return {
    onPointerDown(event: PointerEvent) {
      if (event.defaultPrevented) return;
      last = event.pointerType as InteractionType;
      untrack(handler)(event, last);
    },
    onClick(event: MouseEvent | PointerEvent) {
      if (event.detail === 0) { untrack(handler)(event, 'keyboard'); return; }
      untrack(handler)(event, 'pointerType' in event ? event.pointerType as InteractionType : last);
      last = '';
    },
  };
}
export { createEnhancedClickHandler as useEnhancedClickHandler };
