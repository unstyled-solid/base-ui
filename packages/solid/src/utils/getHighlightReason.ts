import { REASONS } from '../internals/reasons';
export function getHighlightReason(event: Event | undefined) {
  if (event?.type.startsWith('key')) return REASONS.keyboard;
  if (event?.type.startsWith('mouse') || event?.type.startsWith('pointer')) return REASONS.pointer;
  return REASONS.none;
}
