import { createSignal, untrack, type Accessor } from 'solid-js';
import { createEnhancedClickHandler, type InteractionType } from './createEnhancedClickHandler';
import { createValueChanged } from '../internals/createValueChanged';
import { platform } from './platform';
export type { InteractionType };
export function createOpenMethodTriggerProps(open: boolean | Accessor<boolean>, setOpenMethod: { set(interaction: InteractionType): void }['set']) {
  return createEnhancedClickHandler(() => (_, interaction) => { if (!(typeof open === 'function' ? open() : open)) setOpenMethod(interaction || (platform.os.ios ? 'touch' : '')); });
}
export function createOpenInteractionType(open: Accessor<boolean>) {
  const [method, setMethod] = createSignal<InteractionType | null>(null);
  const triggerProps = createOpenMethodTriggerProps(open, setMethod);
  createValueChanged(open, (previous) => { if (previous && !untrack(open)) setMethod(null); });
  return { get openMethod() { return method(); }, triggerProps, setOpenMethod: setMethod };
}
export { createOpenInteractionType as useOpenInteractionType, createOpenMethodTriggerProps as useOpenMethodTriggerProps };
