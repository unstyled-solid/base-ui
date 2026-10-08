import { ownerWindow } from './owner';
interface ModifierState { shiftKey: boolean; ctrlKey: boolean; altKey: boolean; metaKey: boolean }
export function dispatchClickWithModifiers(target: Element, sourceEvent: ModifierState, { detail = 0, pointerType = '' }: { detail?: number; pointerType?: string } = {}) {
  target.dispatchEvent(new (ownerWindow(target).PointerEvent)('click', {
    bubbles: true, cancelable: true, composed: true, detail, pointerType,
    shiftKey: sourceEvent.shiftKey, ctrlKey: sourceEvent.ctrlKey, altKey: sourceEvent.altKey, metaKey: sourceEvent.metaKey,
  }));
}
